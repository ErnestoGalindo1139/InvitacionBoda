import { test, expect, type Page } from '@playwright/test';

const sizes = [
  { width: 320, height: 568 },
  { width: 360, height: 640 },
  { width: 390, height: 844 },
  { width: 600, height: 800 },
  { width: 601, height: 800 },
  { width: 768, height: 1024 },
  { width: 820, height: 1180 },
  { width: 821, height: 1180 },
  { width: 1024, height: 768 },
  { width: 1280, height: 720 },
  { width: 1920, height: 1080 },
  { width: 568, height: 320 },
  { width: 844, height: 390 },
  { width: 1024, height: 600 },
];
const token = 'A'.repeat(64);
const person = {
  id_Familia: 1,
  nb_Persona: 'María Fernanda de los Ángeles Hernández Villaseñor',
  nb_Boda: 'Alejandra y Dionisio',
  fh_Boda: '2026-12-12T17:00:00-07:00',
  nb_Telefono: '526699999999',
  nu_PasesAsignados: 5,
  nu_PasesConfirmados: 3,
  sn_Confirmada: true,
  fh_Confirmacion: null,
  pase: { nb_TokenQR: 'B'.repeat(64) },
  enlace: `/invitacion/${token}`,
};

async function expectContained(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => {
    const problems: string[] = [];
    if (document.documentElement.scrollWidth > innerWidth + 1)
      problems.push('document');
    for (const element of document.querySelectorAll<HTMLElement>(
      '.system-main, .system-card, .family-pass, dialog[open], button, input, select, textarea, .status-badge'
    )) {
      if (element.closest('[hidden], [aria-hidden="true"]')) continue;
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      if (rect.left < -1 || rect.right > innerWidth + 1)
        problems.push(`${element.tagName}.${element.className}`);
      if (
        element.matches('button, select, textarea, .status-badge') &&
        element.scrollWidth > element.clientWidth + 2
      )
        problems.push(`clipped: ${element.tagName}.${element.className}`);
    }
    return problems;
  });
  expect(overflow).toEqual([]);
}

for (const viewport of sizes) {
  test.describe(`${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });

    test('public invitation, forms, pass, directory and dialog fit the viewport', async ({
      page,
    }) => {
      let loggedIn = false;
      let confirmed = false;
      await page.route('**/api/**', (route) => {
        const path = new URL(route.request().url()).pathname;
        if (path.endsWith('/auth/me'))
          return route.fulfill({
            status: loggedIn ? 200 : 401,
            json: { usuario: 'administrador' },
          });
        if (path.endsWith('/admin/familias'))
          return route.fulfill({
            json: [person, { ...person, id_Familia: 2, sn_Confirmada: false }],
          });
        return route.fulfill({
          json: path.includes('/invitaciones/')
            ? { ...person, sn_Confirmada: confirmed }
            : person,
        });
      });

      await page.goto('/');
      await expectContained(page);
      await page.locator('.clapper-button').click();
      await expect(page.locator('.invitation-intro')).toHaveCount(0);
      await expectContained(page);
      const content = await page.locator('.hero-content').boundingBox();
      const footer = await page.locator('.hero-film-footer').boundingBox();
      expect(content).not.toBeNull();
      expect(footer).not.toBeNull();
      expect(content!.y + content!.height).toBeLessThanOrEqual(footer!.y);
      const cue = await page.locator('.scroll-cue').boundingBox();
      expect(footer!.y + footer!.height).toBeLessThanOrEqual(cue!.y);
      await page.locator('.gallery-controls button').last().click();
      await expect
        .poll(() => page.locator('.gallery').evaluate((el) => el.scrollLeft))
        .toBeGreaterThan(0);
      await page.locator('#rsvp-nombre').fill('Invitada de prueba');
      await page
        .locator('.rsvp-radio-option')
        .filter({ hasText: 'Sí asistiré' })
        .click();
      await expectContained(page);

      await page.goto(`/invitacion/${token}`);
      await page.getByRole('combobox').selectOption('3');
      if (viewport.width <= 600) {
        expect(
          await page
            .getByRole('combobox')
            .evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
        ).toBeGreaterThanOrEqual(16);
      }
      await page.getByRole('button', { name: 'Revisar y confirmar' }).click();
      await expectContained(page);
      confirmed = true;
      await page.reload();
      await expect(page.locator('.pass-qr')).toHaveAttribute('src', /^data:/);
      await expectContained(page);

      await page.goto('/admin');
      await expect(page.locator('.login-card')).toBeVisible();
      await expectContained(page);
      loggedIn = true;
      await page.reload();
      await expect(page.locator('.invitation-table tbody tr')).toHaveCount(2);
      await expectContained(page);
      await page
        .getByRole('button', { name: `Ver invitación de ${person.nb_Persona}` })
        .first()
        .click();
      await expect(page.locator('dialog[open] .pass-qr')).toHaveAttribute(
        'src',
        /^data:/
      );
      await expectContained(page);
      await page.keyboard.press('Escape');
      await page
        .getByRole('button', { name: 'Lector QR', exact: true })
        .click();
      await expect(page.locator('.qr-lookup')).toBeVisible();
      await expectContained(page);
    });
  });
}

test('a maximum-length name cannot cover dialog actions on a small screen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 320 });
  const pending = {
    ...person,
    nb_Persona: 'Nombre'.repeat(25),
    sn_Confirmada: false,
    pase: null,
    nu_PasesConfirmados: null,
  };
  await page.route('**/api/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({
      json: path.endsWith('/auth/me')
        ? { usuario: 'admin' }
        : path.endsWith('/admin/familias')
          ? [pending]
          : pending,
    });
  });
  await page.goto('/admin');
  await page.locator('.invitation-table button').click();
  const save = page.getByRole('button', { name: 'Guardar invitación' });
  await save.scrollIntoViewIfNeeded();
  // Trial clicks check that the sticky title does not intercept the action.
  await save.click({ trial: true });
  await expectContained(page);
  const close = page.getByRole('button', { name: 'Cerrar detalle' });
  await close.scrollIntoViewIfNeeded();
  await close.click();
  await expect(page.locator('dialog[open]')).toHaveCount(0);
});

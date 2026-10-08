import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const token = 'A'.repeat(64),
  qrToken = 'B'.repeat(64);
const initial = {
  nb_Persona: 'Erika Canales',
  nb_Boda: 'Alejandra y Dionisio',
  fh_Boda: '2026-12-12T17:00:00-07:00',
  nu_PasesAsignados: 5,
  nu_PasesConfirmados: null,
  sn_Confirmada: false,
  fh_Confirmacion: null,
  pase: null,
};
async function noOverflow(page: Page): Promise<void> {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
}
test('deadline closes pending invitations and preserves readable saved quantities', async ({
  page,
}) => {
  let confirmed = false;
  await page.route('**/api/invitaciones/**', (route) =>
    route.fulfill({
      json: {
        ...initial,
        fh_LimiteConfirmacion: '2000-01-01T00:00:00Z',
        sn_Confirmada: confirmed,
        nu_PasesConfirmados: confirmed ? 0 : null,
      },
    })
  );
  await page.goto(`/invitacion/${token}`);
  await expect(
    page.getByRole('heading', { name: 'Plazo de confirmación terminado' })
  ).toBeVisible();
  await expect(page.getByRole('combobox')).toHaveCount(0);
  confirmed = true;
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Confirmación recibida' })
  ).toBeVisible();
  await expect(page.getByText('0 de 5 pases', { exact: true })).toBeVisible();
});
for (const response of [
  {
    option: 'Sí asistiré',
    message:
      '¡*Sí asistiré* a su boda! Me dará mucha alegría celebrar con ustedes.',
  },
  {
    option: 'No podré asistir',
    message:
      '*No podré asistir* a su boda, pero les deseo un día lleno de amor y momentos inolvidables. ¡Les mando un abrazo!',
  },
]) {
  test(`public form prepares a warm WhatsApp reply: ${response.option}`, async ({
    page,
  }) => {
    let writes = 0;
    await page
      .context()
      .route('https://wa.me/**', (route) =>
        route.fulfill({ body: 'WhatsApp draft (test)' })
      );
    await page.route('**/api/**', (route) => {
      writes++;
      return route.abort();
    });
    await page.goto('/');
    await page
      .getByRole('button', {
        name: 'Iniciar la película de Alejandra y Dionisio',
      })
      .click();
    await page.locator('#rsvp-nombre').fill('Erika Canales');
    await page
      .locator('.rsvp-radio-option')
      .filter({ hasText: response.option })
      .click();
    await expect(
      page.getByRole('radio', { name: response.option })
    ).toBeChecked();
    const popup = page.waitForEvent('popup');
    await page
      .getByRole('button', { name: 'Preparar mensaje en WhatsApp' })
      .click();
    const whatsapp = await popup;
    await expect.poll(() => whatsapp.url()).toContain('wa.me/526699296312');
    const message = new URL(whatsapp.url()).searchParams.get('text');
    expect(message).toBe(
      `¡Hola, Alejandra y Dionisio! Soy *Erika Canales*.\n\nGracias por invitarme a compartir este día tan especial. ${response.message}`
    );
    await expect(page.getByRole('status')).toContainText(
      'no se ha registrado una confirmación'
    );
    expect(writes).toBe(0);
    await noOverflow(page);
  });
}
test('person reviews partial usage, confirms once and recovers a local PNG and printable pass', async ({
  page,
}, testInfo) => {
  let stored: Record<string, unknown> = initial;
  let writes = 0;
  const external: string[] = [];
  page.on('request', (req) => {
    if (
      !req.url().startsWith('http://localhost:') &&
      !req.url().startsWith('data:')
    )
      external.push(req.url());
  });
  await page.route('**/api/invitaciones/**', async (route) => {
    if (route.request().method() === 'POST') {
      writes++;
      const body = route.request().postDataJSON();
      expect(body).toEqual({
        confirmacionExplicita: true,
        nu_PasesConfirmados: 3,
      });
      stored = {
        ...initial,
        sn_Confirmada: true,
        nu_PasesConfirmados: body.nu_PasesConfirmados,
        pase: { nb_TokenQR: qrToken },
      };
    }
    await route.fulfill({ json: stored });
  });
  await page.goto(`/invitacion/${token}`);
  await expect(
    page.getByRole('heading', { name: 'Hola, Erika Canales' })
  ).toBeVisible();
  const quantity = page.getByRole('combobox', { name: 'Pases que usarás' });
  await expect(quantity.locator('option')).toHaveCount(7);
  await expect(quantity.locator('option[value="6"]')).toHaveCount(0);
  await quantity.selectOption('3');
  await page.getByRole('button', { name: 'Revisar y confirmar' }).click();
  await expect(page.getByText('3 de 5 pases', { exact: true })).toBeVisible();
  const confirm = page.getByRole('button', {
    name: 'Enviar confirmación definitiva',
  });
  await expect(confirm).toBeDisabled();
  expect(writes).toBe(0);
  await page.getByRole('button', { name: 'Volver a corregir' }).click();
  await expect(quantity).toHaveValue('3');
  await page.getByRole('button', { name: 'Revisar y confirmar' }).click();
  await page.getByRole('checkbox').check();
  await confirm.click();
  await expect(
    page.getByRole('heading', { name: 'Confirmación recibida' })
  ).toBeVisible();
  await expect(page.locator('.family-pass')).toContainText('3 pases');
  await expect(page.locator('.family-pass')).toContainText('Erika Canales');
  await expect(page.locator('.family-pass img')).toHaveAttribute(
    'src',
    /^data:image\/png/
  );
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar pase PNG' }).click();
  const downloadedPass = await download;
  expect(downloadedPass.suggestedFilename()).toBe('pase-de-acceso.png');
  const downloadPath = testInfo.outputPath('pass-download.png');
  await downloadedPass.saveAs(downloadPath);
  const png = await readFile(downloadPath);
  expect(png.readUInt32BE(16)).toBe(1080);
  expect(png.readUInt32BE(20)).toBeGreaterThan(1000);
  await expect(page.locator('.family-pass')).toContainText(
    '12 de diciembre de 2026'
  );
  await expect(page.locator('.family-pass')).toContainText(
    'Hacienda San Ramon'
  );
  await expect(page.locator('.family-pass')).toContainText(
    'Recepción · 8:00 PM'
  );
  await page
    .locator('.family-pass')
    .screenshot({ path: testInfo.outputPath('pass-ticket.png') });
  await page.evaluate(() => {
    window.print = (): void => {};
  });
  await page.getByRole('button', { name: 'Imprimir / guardar PDF' }).click();
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('#root')).not.toBeVisible();
  await expect(page.locator('#boda-print-root')).toContainText('3 pases');
  await page.screenshot({
    path: testInfo.outputPath('pass-print.png'),
    fullPage: true,
  });
  await page.emulateMedia({ media: 'screen' });
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Confirmación recibida' })
  ).toBeVisible();
  await expect(page.getByRole('combobox')).toHaveCount(0);
  expect(writes).toBe(1);
  expect(external).toEqual([]);
  await expect(page.locator('.family-pass img')).toHaveAttribute(
    'src',
    /^data:image\/png/
  );
  await noOverflow(page);
  await page.screenshot({
    path: testInfo.outputPath('person-confirmed.png'),
    fullPage: true,
  });
});
test('zero usage is explicitly confirmed without creating a pass; invalid links show an error', async ({
  page,
}) => {
  let stored: Record<string, unknown> = initial;
  await page.route('**/api/invitaciones/**', (route) => {
    if (route.request().method() === 'POST') {
      expect(route.request().postDataJSON()).toEqual({
        confirmacionExplicita: true,
        nu_PasesConfirmados: 0,
      });
      stored = { ...initial, sn_Confirmada: true, nu_PasesConfirmados: 0 };
    }
    return route.fulfill({ json: stored });
  });
  await page.goto(`/invitacion/${token}`);
  await page
    .getByRole('combobox', { name: 'Pases que usarás' })
    .selectOption('0');
  await page.getByRole('button', { name: 'Revisar y confirmar' }).click();
  await expect(page.getByText('Esto confirma que no asistirás.')).toBeVisible();
  await page.getByRole('checkbox').check();
  await page
    .getByRole('button', { name: 'Enviar confirmación definitiva' })
    .click();
  await expect(
    page.getByText('No se generó un pase.', { exact: false })
  ).toBeVisible();
  await expect(page.locator('.family-pass')).toHaveCount(0);
  await page.goto('/invitacion/invalid');
  await expect(page.getByRole('alert')).toContainText('enlace es inválido');
});
test('admin creates a person with assigned passes, shares, filters and reads the confirmed quantity from QR', async ({
  page,
}, testInfo) => {
  let loggedIn = false,
    saved = false;
  const confirmed = {
    ...initial,
    id_Familia: 1,
    nb_Telefono: '526699999999',
    enlace: `http://localhost:5180/invitacion/${token}`,
    sn_Confirmada: true,
    nu_PasesConfirmados: 3,
    pase: { nb_TokenQR: qrToken },
  };
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/me'))
      return route.fulfill({
        status: loggedIn ? 200 : 401,
        json: { usuario: 'admin' },
      });
    if (path.endsWith('/auth/login')) {
      loggedIn = true;
      return route.fulfill({ json: { usuario: 'admin' } });
    }
    if (
      path.endsWith('/admin/familias') &&
      route.request().method() === 'POST'
    ) {
      saved = true;
      expect(route.request().postDataJSON()).toEqual({
        nb_Persona: 'Erika Canales',
        nb_Telefono: '526699999999',
        nu_PasesAsignados: 5,
      });
      return route.fulfill({
        status: 201,
        json: {
          ...confirmed,
          sn_Confirmada: false,
          nu_PasesConfirmados: null,
          pase: null,
        },
      });
    }
    if (path.endsWith('/admin/familias'))
      return route.fulfill({ json: saved ? [confirmed] : [] });
    if (path.endsWith('/admin/familias/1'))
      return route.fulfill({ json: confirmed });
    if (path.includes('/admin/pases/'))
      return route.fulfill({ json: { ...confirmed, nb_TokenQR: qrToken } });
    return route.fulfill({ status: 404, json: { message: 'No encontrado' } });
  });
  await page.goto(`/admin?qr=${qrToken}`);
  await page
    .getByRole('textbox', { name: 'Usuario', exact: true })
    .fill('admin');
  await page.getByLabel('Contraseña', { exact: true }).fill('dummy-test-only');
  await page.getByRole('button', { name: 'Entrar al panel' }).click();
  await page.getByRole('button', { name: 'Invitados', exact: true }).click();
  await page.getByRole('button', { name: '+ Nueva persona' }).click();
  await page
    .getByRole('textbox', { name: 'Nombre de la persona' })
    .fill('Erika Canales');
  await page.getByRole('spinbutton', { name: 'Pases asignados' }).fill('5');
  await page
    .getByRole('textbox', { name: 'WhatsApp de la persona (opcional)' })
    .fill('526699999999');
  await expect(
    page.getByRole('button', { name: 'Agregar integrante' })
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Guardar invitación' }).click();
  await expect(
    page.getByRole('link', { name: 'Preparar WhatsApp' })
  ).toHaveAttribute('href', /wa.me\/526699999999/);
  const whatsapp = new URL(
    (await page
      .getByRole('link', { name: 'Preparar WhatsApp' })
      .getAttribute('href')) || ''
  );
  expect(whatsapp.searchParams.get('text')).toContain('5 pases asignados');
  await expect(
    page.getByRole('textbox', { name: 'Enlace personalizado' })
  ).toHaveValue(`http://localhost:5180/invitacion/${token}`);
  await page.getByRole('button', { name: 'Cerrar detalle' }).click();
  await page
    .getByRole('searchbox', { name: 'Buscar por nombre' })
    .fill('Erika');
  await page
    .getByRole('combobox', { name: 'Estado' })
    .selectOption('confirmadas');
  await page
    .getByRole('button', { name: 'Ver invitación de Erika Canales' })
    .click();
  await expect(
    page.getByText('Los datos están bloqueados', { exact: false })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Corregir datos' })
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Cerrar detalle' }).click();
  await page.getByRole('button', { name: 'Lector QR', exact: true }).click();
  await page
    .getByRole('button', { name: 'Consultar pase', exact: true })
    .click();
  await expect(page.locator('.qr-lookup .family-pass')).toContainText(
    '3 pases'
  );
  await noOverflow(page);
  await page.screenshot({
    path: testInfo.outputPath('admin.png'),
    fullPage: true,
  });
});
test('pending invitation corrections update the quota while preserving its link', async ({
  page,
}) => {
  const pending = {
    ...initial,
    id_Familia: 1,
    nb_Telefono: null,
    enlace: `http://localhost:5180/invitacion/${token}`,
  };
  await page.route('**/api/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/me'))
      return route.fulfill({ json: { usuario: 'admin' } });
    if (path.endsWith('/admin/familias'))
      return route.fulfill({ json: [pending] });
    if (route.request().method() === 'PUT') {
      expect(route.request().postDataJSON()).toEqual({
        nb_Persona: 'Erika Canales',
        nb_Telefono: '',
        nu_PasesAsignados: 2,
      });
      return route.fulfill({ json: { ...pending, nu_PasesAsignados: 2 } });
    }
    return route.fulfill({ json: pending });
  });
  await page.goto('/admin');
  await page
    .getByRole('button', { name: 'Ver invitación de Erika Canales' })
    .click();
  await page.getByRole('spinbutton', { name: 'Pases asignados' }).fill('2');
  await page.getByRole('button', { name: 'Guardar invitación' }).click();
  await expect(
    page.getByRole('textbox', { name: 'Enlace personalizado' })
  ).toHaveValue(pending.enlace);
  await expect(
    page.getByText('2 pases asignados', { exact: true })
  ).toBeVisible();
});

test('admin browses 128 people with compact pages, live filters, totals and focused details', async ({
  page,
}, testInfo) => {
  let people = Array.from({ length: 128 }, (_, index) => ({
    ...initial,
    id_Familia: index + 1,
    nb_Persona:
      index === 0
        ? 'Ábril Galindo'
        : index === 1
          ? 'Adriana Ramos'
          : index === 127
            ? 'Zulema Vázquez'
            : `Persona ${String(index + 1).padStart(3, '0')}`,
    nb_Telefono: null,
    nu_PasesAsignados: index === 127 ? 50 : 2,
    sn_Confirmada: index < 64,
    nu_PasesConfirmados: index < 32 && index !== 1 ? 1 : index < 64 ? 0 : null,
    pase: index < 32 && index !== 1 ? { nb_TokenQR: qrToken } : null,
    enlace: `http://localhost:5180/invitacion/${token}`,
  }));
  await page.route('**/api/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/me'))
      return route.fulfill({ json: { usuario: 'administrador' } });
    if (path.endsWith('/admin/familias'))
      return route.fulfill({ json: people });
    const person = people.find((item) =>
      path.endsWith(`/admin/familias/${item.id_Familia}`)
    );
    return route.fulfill({ json: person });
  });
  await page.goto('/admin');
  const rows = page.locator('.invitation-table tbody tr');
  const summary = page.locator('.admin-summary');
  await expect(rows).toHaveCount(10);
  await expect(summary.locator('dd')).toHaveText(['128', '304', '31', '64']);
  await expect(page.getByText('Página 1 de 13', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Anterior', exact: true })
  ).toBeDisabled();
  await expect(rows.first()).toContainText('Ábril Galindo');
  await expect(rows.nth(1)).toContainText('Sin asistencia');
  await noOverflow(page);
  await page.screenshot({
    path: testInfo.outputPath('directory-128.png'),
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await expect(page.getByText('Página 2 de 13', { exact: true })).toBeVisible();
  await expect(rows.first()).toContainText('Persona 011');
  await page
    .getByRole('searchbox', { name: 'Buscar por nombre' })
    .fill('abril');
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText('Ábril Galindo');
  await expect(page.getByText('Página 1 de 1', { exact: true })).toBeVisible();
  await expect(summary.locator('dd')).toHaveText(['128', '304', '31', '64']);
  const open = page.getByRole('button', {
    name: 'Ver invitación de Ábril Galindo',
  });
  await open.click();
  await expect(
    page.getByRole('dialog', { name: 'Ábril Galindo' })
  ).toBeVisible();
  await expect(
    page.getByText('Los datos están bloqueados', { exact: false })
  ).toBeVisible();
  await noOverflow(page);
  await page.screenshot({
    path: testInfo.outputPath('invitation-detail.png'),
    fullPage: true,
  });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(open).toBeFocused();
  await page
    .getByRole('searchbox', { name: 'Buscar por nombre' })
    .fill('inexistente');
  await expect(
    page.getByRole('heading', { name: 'No hay coincidencias' })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await page
    .getByRole('combobox', { name: 'Estado', exact: true })
    .selectOption('pendientes');
  await expect(
    page.getByText('64 de 128 personas', { exact: true })
  ).toBeVisible();
  await expect(rows.first()).toContainText('Persona 065');
  await expect(rows.first().getByLabel('Sin respuesta')).toBeVisible();
  await page
    .getByRole('combobox', { name: 'Estado', exact: true })
    .selectOption('sin-asistencia');
  await expect(
    page.getByText('33 de 128 personas', { exact: true })
  ).toBeVisible();
  await expect(rows.first()).toContainText('Adriana Ramos');
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await page
    .getByRole('combobox', { name: 'Ordenar por' })
    .selectOption('pases');
  await expect(rows.first()).toContainText('Zulema Vázquez');
  await page
    .getByRole('combobox', { name: 'Mostrar', exact: true })
    .selectOption('50');
  await expect(rows).toHaveCount(50);
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await expect(rows).toHaveCount(28);
  await expect(page.getByText('Página 3 de 3', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Siguiente', exact: true })
  ).toBeDisabled();
  people = people.slice(0, 1);
  await page.getByRole('button', { name: 'Actualizar', exact: true }).click();
  await expect(rows).toHaveCount(1);
  await expect(page.getByText('Página 1 de 1', { exact: true })).toBeVisible();
  await expect(summary.locator('dd')).toHaveText(['1', '2', '1', '0']);
});

test('pass supports one admission, long names and the maximum confirmed quantity', async ({
  page,
}, testInfo) => {
  let person = 'Persona de prueba';
  let quantity = 1;
  let event = initial.nb_Boda;
  await page.route('**/api/invitaciones/**', (route) =>
    route.fulfill({
      json: {
        ...initial,
        nb_Persona: person,
        nb_Boda: event,
        fh_Boda: '2026-12-13T00:00:00Z',
        nu_PasesAsignados: 50,
        sn_Confirmada: true,
        nu_PasesConfirmados: quantity,
        pase: { nb_TokenQR: qrToken },
      },
    })
  );
  await page.goto(`/invitacion/${token}`);
  await expect(page.locator('.pass-count')).toHaveText('1 pase');
  await expect(page.locator('.pass-date')).toHaveText(
    '12 de diciembre de 2026'
  );
  person = 'Nombre muy largo para comprobar el diseño del pase '
    .repeat(3)
    .slice(0, 150)
    .trim();
  event =
    'La celebración de Alejandra y Dionisio con toda nuestra familia y amigos';
  quantity = 50;
  await page.reload();
  await expect(page.locator('.pass-guest h3')).toHaveText(person);
  await expect(page.locator('.pass-count')).toHaveText('50 pases');
  await expect(page.locator('.pass-qr')).toHaveAttribute(
    'src',
    /^data:image\/png/
  );
  await noOverflow(page);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar pase PNG' }).click();
  const path = testInfo.outputPath('pass-long-name-download.png');
  await (await download).saveAs(path);
  const png = await readFile(path);
  expect(png.readUInt32BE(16)).toBe(1080);
  expect(png.readUInt32BE(20)).toBeGreaterThan(1500);
  await page
    .locator('.family-pass')
    .screenshot({ path: testInfo.outputPath('pass-long-name.png') });
});

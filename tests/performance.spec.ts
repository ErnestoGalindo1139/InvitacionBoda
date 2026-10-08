import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'no-preference' });

test('the public page loads optimized photos and defers private route code', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => {
    requests.push(new URL(request.url()).pathname);
  });
  await page.goto('/');
  const hero = page.locator('.hero-photo');
  await hero.evaluate((image: HTMLImageElement) => image.decode());
  expect(
    await hero.evaluate((image: HTMLImageElement) => image.currentSrc)
  ).toMatch(/\/img\/optimized\/carrusel4-\d+\.webp$/);
  await expect(hero).toHaveAttribute('srcset', /480w.*960w.*1600w.*2400w/);
  await page.locator('.clapper-button').click();
  await expect(page.locator('.invitation-intro')).toHaveCount(0);
  for (const photo of await page.locator('main img').all()) {
    await photo.scrollIntoViewIfNeeded();
    await photo.evaluate((image: HTMLImageElement) => image.decode());
    const source = await photo.evaluate(
      (image: HTMLImageElement) => image.currentSrc
    );
    // This 100 KB JPEG is already small; leave its original quality intact.
    expect(
      source.includes('/img/optimized/') ||
        source.endsWith('/img/boda/carrusel6.jpeg')
    ).toBe(true);
  }
  expect(
    requests.filter(
      (path) => /\.(png|jpe?g)$/.test(path) && !path.endsWith('/carrusel6.jpeg')
    )
  ).toEqual([]);
  expect(
    requests.filter((path) =>
      /\/(AdminPage|FamilyInvitationPage|QrScanner|FamilyPass|passDesign)\./.test(
        path
      )
    )
  ).toEqual([]);
});

test('the original opening animations run and release the page afterwards', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .locator('.hero-photo')
    .evaluate((image: HTMLImageElement) => image.decode());
  await page.locator('.clapper-button').click();
  await expect(page.locator('.invitation-experience')).toHaveAttribute(
    'data-invitation',
    'opening'
  );
  const animations = await page.evaluate(() =>
    ['.invitation-intro', '.clapper-arm', '.clapper', '.hero-photo'].map(
      (selector) => {
        const style = getComputedStyle(document.querySelector(selector)!);
        return { name: style.animationName, duration: style.animationDuration };
      }
    )
  );
  expect(animations).toEqual([
    { name: 'invitation-unveil', duration: '2.2s' },
    { name: 'clapper-snap', duration: '0.75s' },
    { name: 'clapper-exit', duration: '2.2s' },
    { name: 'hero-photo-arrive', duration: '2.2s' },
  ]);
  await expect(page.locator('.invitation-intro')).toHaveCount(0);
  await expect(page.locator('.invitation-content')).not.toHaveAttribute(
    'inert'
  );
  expect(
    await page.evaluate(() => [
      document.body.style.overflow,
      document.documentElement.style.overflow,
    ])
  ).toEqual(['', '']);
});

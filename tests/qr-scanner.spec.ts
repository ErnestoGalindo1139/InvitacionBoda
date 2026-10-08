import { test, expect, type Page } from '@playwright/test';
import QRCode from 'qrcode';

const token = 'B'.repeat(64);
type CameraTest = {
  requests: number;
  canvases: HTMLCanvasElement[];
  streams: MediaStream[];
  release?: () => void;
};
async function mockAdmin(page: Page): Promise<{ lookups: string[] }> {
  const result = { lookups: [] as string[] };
  await page.route('**/api/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/auth/me'))
      return route.fulfill({ json: { usuario: 'encargada' } });
    if (path.endsWith('/admin/familias')) return route.fulfill({ json: [] });
    if (path.includes('/admin/pases/')) {
      result.lookups.push(path);
      return route.fulfill(
        path.endsWith(token)
          ? {
              json: {
                nb_Persona: 'Erika Canales',
                nb_Boda: 'Alejandra y Dionisio',
                fh_Boda: '2026-12-12T17:00:00-07:00',
                nu_PasesAsignados: 5,
                nu_PasesConfirmados: 3,
                nb_TokenQR: token,
              },
            }
          : { status: 404, json: { message: 'Pase no encontrado.' } }
      );
    }
    return route.fulfill({ status: 404, json: { message: 'No encontrado.' } });
  });
  return result;
}
async function fakeCamera(page: Page, delayed = false): Promise<void> {
  await page.addInitScript((wait) => {
    const state: CameraTest = { requests: 0, canvases: [], streams: [] };
    (window as unknown as { cameraTest: CameraTest }).cameraTest = state;
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      configurable: true,
      value: async (): Promise<MediaStream> => {
        state.requests++;
        if (wait)
          await new Promise<void>((resolve) => {
            state.release = resolve;
          });
        const canvas = document.createElement('canvas');
        canvas.width = 720;
        canvas.height = 540;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#e7e7de';
        ctx.fillRect(0, 0, 720, 540);
        const stream = canvas.captureStream(10);
        state.canvases.push(canvas);
        state.streams.push(stream);
        return stream;
      },
    });
  }, delayed);
}
async function showQr(page: Page, value: string): Promise<void> {
  const data = await QRCode.toDataURL(value, { width: 720, margin: 4 });
  await page.evaluate(async (src) => {
    const state = (window as unknown as { cameraTest: CameraTest }).cameraTest;
    const canvas = state.canvases[state.canvases.length - 1];
    const image = new Image();
    image.src = src;
    await image.decode();
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#e7e7de';
    ctx.fillRect(0, 0, 720, 540);
    ctx.drawImage(image, 160, 70, 400, 400);
  }, data);
}
async function camerasStopped(page: Page): Promise<boolean> {
  return page.evaluate(() =>
    (window as unknown as { cameraTest: CameraTest }).cameraTest.streams.every(
      (stream) =>
        stream.getTracks().every((track) => track.readyState === 'ended')
    )
  );
}

test('camera decodes real QR frames, consults once and rejects unrelated or unknown passes', async ({
  page,
}, testInfo) => {
  const result = await mockAdmin(page);
  await fakeCamera(page);
  await page.goto('/admin?seccion=qr');
  await expect(
    page.getByRole('button', { name: '+ Nueva persona' })
  ).toBeHidden();
  await page.screenshot({
    path: testInfo.outputPath('qr-section.png'),
    fullPage: true,
  });
  await expect(page.getByRole('button', { name: 'Escanear QR' })).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { cameraTest: CameraTest }).cameraTest.requests
    )
  ).toBe(0);
  await page.getByRole('button', { name: 'Escanear QR' }).click();
  await expect(
    page.getByText('Apunta la cámara al QR', { exact: false })
  ).toBeVisible();
  await expect(page.locator('video')).toBeVisible();
  await page
    .locator('.qr-lookup')
    .screenshot({ path: testInfo.outputPath('qr-camera.png') });
  await showQr(page, `http://localhost:5180/admin?qr=${token}`);
  await expect(page.locator('.qr-result')).toContainText('Erika Canales');
  await expect(page.locator('.qr-result')).toContainText('3 pases confirmados');
  await expect(
    page.getByLabel('Token QR o enlace leído del código')
  ).toHaveValue(token);
  await expect(page.locator('video')).toHaveCount(0);
  await expect.poll(() => camerasStopped(page)).toBe(true);
  expect(result.lookups).toEqual([`/api/admin/pases/${token}`]);
  await page.getByRole('button', { name: 'Escanear QR' }).click();
  await expect(page.locator('.qr-result')).toHaveCount(0);
  await expect(
    page.getByText('Apunta la cámara al QR', { exact: false })
  ).toBeVisible();
  await showQr(page, 'https://example.com/otro-codigo');
  await expect(
    page.getByText('Este QR no corresponde', { exact: false })
  ).toBeVisible();
  expect(result.lookups).toHaveLength(1);
  await showQr(page, `http://localhost:5180/admin?qr=${'C'.repeat(64)}`);
  await expect(page.locator('.qr-lookup').getByRole('alert')).toContainText(
    'Pase no encontrado.'
  );
  await expect(page.locator('.qr-result')).toHaveCount(0);
  await expect.poll(() => camerasStopped(page)).toBe(true);
  expect(result.lookups).toHaveLength(2);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
});

test('denied camera permissions and insecure origins keep manual consultation usable', async ({
  page,
}) => {
  const result = await mockAdmin(page);
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      configurable: true,
      value: async (): Promise<never> => {
        throw new DOMException('Denied', 'NotAllowedError');
      },
    });
  });
  await page.goto('/admin?seccion=qr');
  await page.getByRole('button', { name: 'Escanear QR' }).click();
  await expect(page.locator('.qr-lookup').getByRole('alert')).toContainText(
    'Permite el acceso a la cámara'
  );
  await expect(page.locator('video')).toHaveCount(0);
  await page.evaluate(() =>
    Object.defineProperty(window, 'isSecureContext', {
      value: false,
      configurable: true,
    })
  );
  await page.getByRole('button', { name: 'Escanear QR' }).click();
  await expect(page.locator('.qr-lookup').getByRole('alert')).toContainText(
    'HTTPS'
  );
  await page.getByLabel('Token QR o enlace leído del código').fill('otro-qr');
  await page
    .getByRole('button', { name: 'Consultar pase', exact: true })
    .click();
  await expect(page.locator('.qr-lookup')).toContainText(
    'Introduce el token QR'
  );
  expect(result.lookups).toHaveLength(0);
  await page
    .getByLabel('Token QR o enlace leído del código')
    .fill(`http://localhost:5180/admin?qr=${token.toLowerCase()}`);
  await page
    .getByRole('button', { name: 'Consultar pase', exact: true })
    .click();
  await expect(page.locator('.qr-result')).toContainText('3 pases confirmados');
  expect(result.lookups).toEqual([`/api/admin/pases/${token}`]);
});

test('cancelling pending permissions and leaving the page release all camera tracks', async ({
  page,
}) => {
  await mockAdmin(page);
  await fakeCamera(page, true);
  await page.goto('/admin?seccion=qr');
  await page.getByRole('button', { name: 'Escanear QR' }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { cameraTest: CameraTest }).cameraTest.requests
      )
    )
    .toBe(1);
  await page.getByRole('button', { name: 'Detener cámara' }).click();
  await page.evaluate(() =>
    (window as unknown as { cameraTest: CameraTest }).cameraTest.release?.()
  );
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { cameraTest: CameraTest }).cameraTest.streams
            .length
      )
    )
    .toBe(1);
  await expect.poll(() => camerasStopped(page)).toBe(true);
  await page.getByRole('button', { name: 'Escanear QR' }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { cameraTest: CameraTest }).cameraTest.requests
      )
    )
    .toBe(2);
  await page.evaluate(() =>
    (window as unknown as { cameraTest: CameraTest }).cameraTest.release?.()
  );
  await expect(
    page.getByText('Apunta la cámara al QR', { exact: false })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Invitados', exact: true }).click();
  await expect(page.locator('.qr-lookup')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: '+ Nueva persona' })
  ).toBeVisible();
  await expect.poll(() => camerasStopped(page)).toBe(true);
  await page.getByRole('link', { name: 'Alejandra & Dionisio' }).click();
  await expect(page).toHaveURL('/');
  await expect.poll(() => camerasStopped(page)).toBe(true);
});

for (const failure of [
  'NotReadableError',
  'OverconstrainedError',
  'AbortError',
]) {
  test(`camera recovers from ${failure} using default settings`, async ({
    page,
  }) => {
    await mockAdmin(page);
    await fakeCamera(page);
    await page.addInitScript((name) => {
      const original = navigator.mediaDevices.getUserMedia.bind(
        navigator.mediaDevices
      );
      let attempts = 0;
      Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
        configurable: true,
        value: async (
          constraints: MediaStreamConstraints
        ): Promise<MediaStream> => {
          attempts++;
          if (attempts === 1)
            throw new DOMException('Camera startup failed', name);
          if (constraints.video !== true)
            throw new Error('Expected default camera settings');
          return original(constraints);
        },
      });
    }, failure);
    await page.goto('/admin?seccion=qr');
    await page.getByRole('button', { name: 'Escanear QR' }).click();
    await expect(
      page.getByText('Apunta la cámara al QR', { exact: false })
    ).toBeVisible();
    await showQr(
      page,
      `https://xld2tgc9-5173.usw3.devtunnels.ms/admin?qr=${token}`
    );
    await expect(page.locator('.qr-result')).toContainText(
      '3 pases confirmados'
    );
    await expect.poll(() => camerasStopped(page)).toBe(true);
  });
}

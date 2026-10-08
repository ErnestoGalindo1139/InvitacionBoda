import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

// Profile a production preview, with real animation and a slower mobile CPU.
const baseURL = process.env.PERFORMANCE_URL || 'http://127.0.0.1:5181';
const label = process.env.PERFORMANCE_LABEL || 'current';
const browser = await chromium.launch();
const results = [];
for (const profile of [
  { name: 'desktop', viewport: { width: 1280, height: 720 }, cpu: 1 },
  { name: 'mobile', viewport: { width: 390, height: 844 }, cpu: 4 },
]) {
  const context = await browser.newContext({ viewport: profile.viewport });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.cpu });
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 80,
    downloadThroughput: 1250000,
    uploadThroughput: 625000,
  });
  const scripts = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'script') scripts.push(request.url());
  });
  await page.addInitScript(() => {
    window.__audit = {
      tasks: [],
      frames: [],
      cls: 0,
      lastFrame: 0,
      phase: 'load',
    };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        window.__audit.tasks.push({
          duration: entry.duration,
          phase: window.__audit.phase,
        });
    }).observe({ type: 'longtask', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        if (!entry.hadRecentInput) window.__audit.cls += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
    const frame = (time) => {
      const data = window.__audit;
      if (data.lastFrame && data.phase !== 'load')
        data.frames.push({
          duration: time - data.lastFrame,
          phase: data.phase,
        });
      data.lastFrame = time;
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
  await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
  await page
    .locator('.hero-photo')
    .evaluate((image) => image.decode(), { timeout: 90000 });
  const load = await page.evaluate(() => ({
    heroReadyMs: performance.now(),
    resources: performance.getEntriesByType('resource').map((entry) => ({
      name: entry.name,
      bytes: entry.encodedBodySize,
      duration: entry.duration,
    })),
  }));
  await page.evaluate(() => {
    window.__audit.phase = 'opening';
  });
  await page.locator('.clapper-button').click();
  await page.locator('.invitation-intro').waitFor({ state: 'detached' });
  await page.evaluate(() => {
    window.__audit.phase = 'scroll';
  });
  await page.evaluate(async () => {
    const bottom = document.documentElement.scrollHeight - innerHeight;
    await new Promise((resolve) => {
      const start = performance.now();
      const step = (time) => {
        const progress = Math.min(1, (time - start) / 6500);
        scrollTo(0, bottom * progress);
        if (progress < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  });
  await page.evaluate(() => {
    window.__audit.phase = 'idle';
  });
  const audit = await page.evaluate(() => {
    const data = window.__audit;
    return {
      cls: data.cls,
      longTasks: data.tasks,
      frames: ['opening', 'scroll'].map((phase) => {
        const durations = data.frames
          .filter((f) => f.phase === phase)
          .map((f) => f.duration)
          .sort((a, b) => a - b);
        return {
          phase,
          samples: durations.length,
          over50ms: durations.filter((d) => d > 50).length,
          p95ms: durations[Math.floor(durations.length * 0.95)] || 0,
          maxMs: durations.at(-1) || 0,
        };
      }),
      images: [...document.images].map((img) => ({
        src: img.currentSrc,
        width: img.naturalWidth,
        height: img.naturalHeight,
      })),
    };
  });
  const result = {
    profile: profile.name,
    cpu: profile.cpu,
    networkMbps: 10,
    ...load,
    scripts,
    ...audit,
  };
  results.push(result);
  console.log(
    JSON.stringify({
      profile: result.profile,
      heroReadyMs: result.heroReadyMs,
      scriptCount: scripts.length,
      loadBytes: load.resources.reduce((n, r) => n + r.bytes, 0),
      cls: audit.cls,
      tasks: audit.longTasks,
      frames: audit.frames,
    })
  );
  await context.close();
}
await browser.close();
await mkdir('performance-results', { recursive: true });
await writeFile(
  `performance-results/${label}.json`,
  JSON.stringify(results, null, 2)
);

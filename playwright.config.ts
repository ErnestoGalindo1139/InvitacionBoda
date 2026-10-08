import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:5180',
    trace: 'retain-on-failure',
    reducedMotion: 'reduce',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' },
    },
    {
      name: 'responsive-firefox',
      testMatch: 'responsive.spec.ts',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'responsive-webkit',
      testMatch: 'responsive.spec.ts',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'yarn dev --port 5180 --strictPort',
    url: 'http://localhost:5180',
    reuseExistingServer: false,
  },
});

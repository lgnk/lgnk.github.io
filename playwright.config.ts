import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  reporter: 'list',
  globalSetup: './tests/e2e/global-setup.ts',
  use: { baseURL: 'http://localhost:4322' },
  projects: [
    { name: 'mobile', use: { viewport: { width: 375, height: 812 } } },
    { name: 'desktop', use: { viewport: { width: 1360, height: 900 } } },
  ],
});

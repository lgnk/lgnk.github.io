import { test as base, expect } from '@playwright/test';

/** Página com o Clarity simulado (window.__calls guarda as chamadas) e o wa.me bloqueado. */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      (window as any).__calls = [];
      (window as any).clarity = (...a: unknown[]) => (window as any).__calls.push(a);
    });
    await page.context().route('https://wa.me/**', (r) => r.abort());
    await use(page);
  },
});

export { expect };

export const calls = (page: import('@playwright/test').Page) => page.evaluate(() => (window as any).__calls as unknown[][]);

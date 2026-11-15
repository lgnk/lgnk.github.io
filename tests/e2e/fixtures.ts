import { test as base, expect, type Page } from '@playwright/test';

export const TEST_CLARITY_ID = 'lgnktest01';
export const CLARITY_TAG = `https://www.clarity.ms/tag/${TEST_CLARITY_ID}`;

/**
 * Página como se o site tivesse um ID do Clarity: o HTML servido ganha `data-clarity-id`,
 * as requisições ao clarity.ms são interceptadas (e anotadas em `clarityRequests`) e o wa.me é bloqueado.
 */
export const test = base.extend<{ clarityRequests: string[] }>({
  clarityRequests: async ({}, use) => {
    await use([]);
  },
  page: async ({ page, clarityRequests }, use) => {
    await page.context().route('https://wa.me/**', (r) => r.abort());
    await page.context().route('https://www.clarity.ms/**', (r) => {
      clarityRequests.push(r.request().url());
      return r.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
    });
    await page.route('http://localhost:4322/**', async (route) => {
      if (route.request().resourceType() !== 'document') return route.continue();
      const response = await route.fetch();
      const body = (await response.text()).replace('<html lang="pt-BR"', `<html lang="pt-BR" data-clarity-id="${TEST_CLARITY_ID}"`);
      return route.fulfill({ response, body });
    });
    await use(page);
  },
});

export { expect };

/** Chamadas que ficaram na fila do Clarity (o script real não roda nos testes). */
export const calls = (page: Page) => page.evaluate(() => ((window as any).clarity?.q ?? []) as unknown[][]);

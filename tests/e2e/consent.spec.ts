import { test, expect, calls } from './fixtures';

test('banner aparece na primeira visita e some ao aceitar', async ({ page }) => {
  await page.goto('/');
  const banner = page.locator('#consent');
  await expect(banner).toBeVisible();
  await banner.getByRole('button', { name: 'Aceitar' }).click();
  await expect(banner).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem('lgnk-consent'))).toBe('granted');
  expect(await calls(page)).toContainEqual(['consent']);

  await page.reload();
  await expect(banner).toBeHidden();
  expect(await calls(page)).toContainEqual(['consent']);
});

test('recusar guarda a escolha', async ({ page }) => {
  await page.goto('/');
  await page.locator('#consent').getByRole('button', { name: 'Recusar' }).click();
  await expect(page.locator('#consent')).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem('lgnk-consent'))).toBe('denied');
  expect(await calls(page)).toContainEqual(['consent', false]);
});

test('preferências reabre o banner', async ({ page }) => {
  await page.goto('/');
  await page.locator('#consent').getByRole('button', { name: 'Aceitar' }).click();
  await page.getByRole('button', { name: 'Preferências de cookies' }).click();
  await expect(page.locator('#consent')).toBeVisible();
});

test('clique no WhatsApp vira evento', async ({ page }) => {
  await page.goto('/');
  await page.locator('#topo a[data-whatsapp]').click();
  await expect.poll(() => calls(page)).toContainEqual(['event', 'whatsapp_click']);
});

test('storage bloqueado não quebra', async ({ page }) => {
  const errors: Error[] = [];
  page.on('pageerror', (e) => errors.push(e));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('blocked', 'SecurityError');
      },
    });
  });
  await page.goto('/');
  const banner = page.locator('#consent');
  await expect(banner).toBeVisible();
  await banner.getByRole('button', { name: 'Aceitar' }).click();
  await expect(banner).toBeHidden();
  expect(errors).toEqual([]);
});

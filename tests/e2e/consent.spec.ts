import { test, expect, calls, CLARITY_TAG } from './fixtures';

const ANALYTICS_ONLY = ['consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' }];

test('nada do Clarity carrega antes da escolha', async ({ page, clarityRequests }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('#consent')).toBeVisible();
  expect(clarityRequests).toEqual([]);
  expect(await page.evaluate(() => typeof (window as any).clarity)).toBe('undefined');
});

test('aceitar carrega o Clarity só para análise', async ({ page, clarityRequests }) => {
  await page.goto('/');
  const banner = page.locator('#consent');
  await banner.getByRole('button', { name: 'Aceitar' }).click();
  await expect(banner).toBeHidden();
  await expect.poll(() => clarityRequests).toContain(CLARITY_TAG);
  expect(await calls(page)).toContainEqual(ANALYTICS_ONLY);
  expect(await page.evaluate(() => localStorage.getItem('lgnk-consent'))).toBe('granted');

  clarityRequests.length = 0;
  await page.reload();
  await expect(banner).toBeHidden();
  await expect.poll(() => clarityRequests).toContain(CLARITY_TAG);
  expect(await calls(page)).toContainEqual(ANALYTICS_ONLY);
});

test('recusar não carrega nada, nem depois', async ({ page, clarityRequests }) => {
  await page.goto('/');
  await page.locator('#consent').getByRole('button', { name: 'Recusar' }).click();
  await expect(page.locator('#consent')).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem('lgnk-consent'))).toBe('denied');
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('#consent')).toBeHidden();
  expect(clarityRequests).toEqual([]);
});

test('preferências reabre o banner e permite revogar', async ({ page }) => {
  await page.goto('/');
  await page.locator('#consent').getByRole('button', { name: 'Aceitar' }).click();
  await page.getByRole('button', { name: 'Preferências de cookies' }).click();
  const banner = page.locator('#consent');
  await expect(banner).toBeVisible();
  await banner.getByRole('button', { name: 'Recusar' }).click();
  expect(await page.evaluate(() => localStorage.getItem('lgnk-consent'))).toBe('denied');
  expect(await calls(page)).toContainEqual(['consent', false]);
});

test('clique no WhatsApp vira evento depois do aceite', async ({ page }) => {
  await page.goto('/');
  await page.locator('#consent').getByRole('button', { name: 'Aceitar' }).click();
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

test('o aviso sobe deslizando e desce antes de sumir', async ({ page }) => {
  await page.goto('/');
  const banner = page.locator('#consent');
  await expect(banner).toBeVisible();
  expect(await banner.evaluate((el) => getComputedStyle(el).animationName)).toBe('consent-in');
  const leaving = await banner.evaluate((el: HTMLElement) => {
    el.querySelector<HTMLButtonElement>('button[data-consent="denied"]')!.click();
    return { hidden: el.hidden, animation: getComputedStyle(el).animationName };
  });
  expect(leaving).toEqual({ hidden: false, animation: 'consent-out' });
  await expect(banner).toBeHidden();
});

test('reabrir no meio da saída cancela a saída', async ({ page }) => {
  await page.goto('/');
  const banner = page.locator('#consent');
  await banner.getByRole('button', { name: 'Aceitar' }).click();
  await page.getByRole('button', { name: 'Preferências de cookies' }).evaluate((b: HTMLButtonElement) => b.click());
  await page.waitForTimeout(600);
  await expect(banner).toBeVisible();
  expect(await banner.evaluate((el) => getComputedStyle(el).animationName)).toBe('consent-in');
});

test('com movimento reduzido o aviso só esmaece', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const banner = page.locator('#consent');
  await expect(banner).toBeVisible();
  expect(await banner.evaluate((el) => getComputedStyle(el).animationName)).toBe('consent-fade-in');
  await banner.getByRole('button', { name: 'Recusar' }).click();
  await expect(banner).toBeHidden();
});

import { test, expect } from './fixtures';

test('internet boa: a nuvem de carregamento nem aparece', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#loader')).toHaveCount(0);
});

test('internet lenta: a nuvem aparece e some quando o site fica pronto', async ({ page }) => {
  await page.route('**/_astro/fonts/*.woff2', async (route) => {
    await new Promise((r) => setTimeout(r, 1800));
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'commit' });
  const loader = page.locator('#loader');
  await expect
    .poll(() => loader.evaluate((el) => getComputedStyle(el).opacity).catch(() => 'sumiu'), { timeout: 1500 })
    .toBe('1');
  await expect(loader).toHaveCount(0, { timeout: 6000 });
});

test('nunca fica presa: some em até 2,5 s mesmo se as fontes não chegarem', async ({ page }) => {
  await page.route('**/_astro/fonts/*.woff2', () => {});
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page.locator('#loader')).toHaveCount(0, { timeout: 4000 });
});

test('enquanto a nuvem está na frente, o teclado não foca nada escondido atrás dela', async ({ page }) => {
  await page.route('**/_astro/fonts/*.woff2', async (route) => {
    await new Promise((r) => setTimeout(r, 1800));
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'commit' });
  await expect
    .poll(() => page.locator('#loader').evaluate((el) => getComputedStyle(el).opacity).catch(() => 'sumiu'), { timeout: 1500 })
    .toBe('1');
  expect(await page.evaluate(() => document.querySelector('main')!.inert)).toBe(true);
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  await expect(page.locator('#loader')).toHaveCount(0, { timeout: 6000 });
  expect(await page.evaluate(() => document.querySelector('main')!.inert)).toBe(false);
});

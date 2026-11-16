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

const slowFonts = (page: import('@playwright/test').Page, ms = 1800) =>
  page.route('**/_astro/fonts/*.woff2', async (route) => {
    await new Promise((r) => setTimeout(r, ms));
    await route.continue();
  });

const visible = (page: import('@playwright/test').Page) =>
  expect
    .poll(() => page.locator('#loader').evaluate((el) => getComputedStyle(el).opacity).catch(() => 'sumiu'), { timeout: 1500 })
    .toBe('1');

test('internet lenta: a nuvem cai em degraus, fica flutuando e o cursor pisca', async ({ page }) => {
  await slowFonts(page);
  await page.goto('/', { waitUntil: 'commit' });
  await visible(page);
  const cloud = await page.locator('#loader .loader-cloud').evaluate((el) => getComputedStyle(el).animationName);
  expect(cloud).toContain('loader-drop');
  expect(cloud).toContain('loader-bob');
  expect(await page.locator('#loader .loader-cursor').evaluate((el) => getComputedStyle(el).animationName)).toBe('loader-blink');
});

test('internet lenta: a tela sai fechando em persianas antes de sumir', async ({ page }) => {
  await slowFonts(page);
  await page.goto('/', { waitUntil: 'commit' });
  await visible(page);
  await expect
    .poll(() => page.locator('#loader.loader--out').evaluate((el) => getComputedStyle(el).animationName).catch(() => ''), {
      timeout: 4000,
      intervals: [20],
    })
    .toBe('loader-wipe');
  await expect(page.locator('#loader')).toHaveCount(0, { timeout: 2000 });
});

test('antes da nuvem aparecer (0,4 s), nada fica inerte', async ({ page }) => {
  await slowFonts(page);
  await page.goto('/', { waitUntil: 'commit' });
  await page.waitForSelector('main', { state: 'attached' });
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => document.querySelector('main')!.inert)).toBe(false);
});

test('com movimento reduzido a nuvem não pula nem flutua', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await slowFonts(page);
  await page.goto('/', { waitUntil: 'commit' });
  await visible(page);
  expect(await page.locator('#loader .loader-cloud').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
});

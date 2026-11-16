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

test('internet lenta: a nuvem cai e flutua, e o rostinho alterna com um ícone girando; os pontinhos ficam parados', async ({ page }) => {
  await slowFonts(page);
  await page.goto('/', { waitUntil: 'commit' });
  await visible(page);
  const names = (sel: string) => page.locator(sel).evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
  const [face] = await names('#loader .loader-face');
  expect(face).toContain('loader-drop');
  expect(face).toContain('loader-bob');
  expect(await names('#loader .loader-cloud .f-idle')).toEqual(['loader-show-face']);
  expect(await names('#loader .loader-spinner')).toEqual(['loader-show-spin']);
  const squares = await page.locator('#loader .loader-spinner rect').evaluateAll((els) =>
    els.map((el) => ({ name: getComputedStyle(el).animationName, delay: getComputedStyle(el).animationDelay })),
  );
  expect(squares).toHaveLength(8);
  for (const q of squares) expect(q.name).toBe('loader-spin');
  expect(new Set(squares.map((q) => q.delay)).size).toBe(8);
  expect(await names('#loader .loader-dots i')).toEqual(['none', 'none', 'none']);
});

test('internet lenta: a tela sai fechando em persianas antes de sumir', async ({ page }) => {
  // Anota a animação no instante em que a saída começa (amostrar de fora perde a janela de 0,4 s com a máquina cheia).
  await page.addInitScript(() => {
    new MutationObserver((records) => {
      for (const r of records) {
        const el = r.target as HTMLElement;
        if (el.id === 'loader' && el.classList.contains('loader--out'))
          (window as any).__saida = getComputedStyle(el).animationName;
      }
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ['class'] });
  });
  await slowFonts(page);
  await page.goto('/', { waitUntil: 'commit' });
  await visible(page);
  await expect.poll(() => page.evaluate(() => (window as any).__saida ?? ''), { timeout: 4000 }).toBe('loader-wipe');
  await expect(page.locator('#loader')).toHaveCount(0, { timeout: 2000 });
});

test('antes da nuvem aparecer (0,4 s), nada fica inerte', async ({ page }) => {
  await slowFonts(page);
  await page.goto('/', { waitUntil: 'commit' });
  await page.waitForSelector('main', { state: 'attached' });
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => document.querySelector('main')!.inert)).toBe(false);
});

test('com movimento reduzido a nuvem fica parada, só com o rostinho', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await slowFonts(page);
  await page.goto('/', { waitUntil: 'commit' });
  await visible(page);
  expect(await page.locator('#loader .loader-face').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  expect(await page.locator('#loader .loader-cloud .f-idle').evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  expect(await page.locator('#loader .loader-spinner').evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
});

test('os três pontinhos ficam no meio da altura do texto "carregando", e o conjunto no centro da nuvem', async ({ page }) => {
  await slowFonts(page, 2500);
  await page.goto('/', { waitUntil: 'commit' });
  await visible(page);
  const m = await page.evaluate(() => {
    const label = document.querySelector('#loader .loader-label')!;
    const range = document.createRange();
    range.selectNodeContents(label.firstChild!);
    const text = range.getBoundingClientRect();
    const dots = [...label.querySelectorAll('.loader-dots i')].map((d) => d.getBoundingClientRect());
    const box = label.getBoundingClientRect();
    const cloud = document.querySelector('#loader .loader-cloud')!.getBoundingClientRect();
    return {
      words: label.textContent!.trim(),
      textMiddle: (text.top + text.bottom) / 2,
      dotMiddles: dots.map((d) => (d.top + d.bottom) / 2),
      labelCenter: (box.left + box.right) / 2,
      cloudCenter: (cloud.left + cloud.right) / 2,
    };
  });
  expect(m.words).toBe('carregando');
  expect(m.dotMiddles).toHaveLength(3);
  for (const y of m.dotMiddles) expect(Math.abs(y - m.textMiddle)).toBeLessThanOrEqual(1);
  expect(Math.abs(m.labelCenter - m.cloudCenter)).toBeLessThanOrEqual(1);
});

test('os pontinhos da etiqueta são amarelos, do tamanho dos quadradinhos do ícone girando', async ({ page }) => {
  await slowFonts(page, 2500);
  await page.goto('/', { waitUntil: 'commit' });
  await visible(page);
  const m = await page.evaluate(() => {
    const square = document.querySelector('#loader .loader-spinner rect')!.getBoundingClientRect();
    const dot = document.querySelector('#loader .loader-dots i')!;
    const box = dot.getBoundingClientRect();
    return { square: square.width, dot: box.width, dotHeight: box.height, color: getComputedStyle(dot).backgroundColor };
  });
  expect(m.color).toBe('rgb(255, 210, 63)');
  expect(Math.abs(m.dot - m.square)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(m.dotHeight - m.square)).toBeLessThanOrEqual(0.5);
});
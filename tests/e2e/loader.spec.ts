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

test('internet lenta: a nuvem cai em degraus, fica flutuando e os três pontinhos piscam em sequência', async ({ page }) => {
  await slowFonts(page);
  await page.goto('/', { waitUntil: 'commit' });
  await visible(page);
  const cloud = await page.locator('#loader .loader-cloud').evaluate((el) => getComputedStyle(el).animationName);
  expect(cloud).toContain('loader-drop');
  expect(cloud).toContain('loader-bob');
  const dots = await page.locator('#loader .loader-dots i').evaluateAll((els) =>
    els.map((el) => ({ name: getComputedStyle(el).animationName, delay: getComputedStyle(el).animationDelay })),
  );
  expect(dots.map((d) => d.name)).toEqual(['loader-dot-1', 'loader-dot-2', 'loader-dot-3']);
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

test('com movimento reduzido a nuvem não pula nem flutua, e os pontinhos ficam parados', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await slowFonts(page);
  await page.goto('/', { waitUntil: 'commit' });
  await visible(page);
  expect(await page.locator('#loader .loader-cloud').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  expect(await page.locator('#loader .loader-dots i').first().evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
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

test('os pontinhos da etiqueta são iguais aos da boca da nuvem: cor, tamanho e espaço', async ({ page }) => {
  await slowFonts(page, 2500);
  await page.goto('/', { waitUntil: 'commit' });
  await visible(page);
  const m = await page.evaluate(() => {
    const mouth = [...document.querySelectorAll('#loader .f-proc rect[height="5"][width="5"]')].map((r) => r.getBoundingClientRect());
    const dots = [...document.querySelectorAll('#loader .loader-dots i')];
    const boxes = dots.map((d) => d.getBoundingClientRect());
    return {
      mouthSize: mouth[0].width,
      mouthGap: mouth[1].left - mouth[0].right,
      dotSize: boxes[0].width,
      dotHeight: boxes[0].height,
      dotGap: boxes[1].left - boxes[0].right,
      color: getComputedStyle(dots[0]).backgroundColor,
    };
  });
  expect(m.color).toBe('rgb(255, 210, 63)');
  expect(Math.abs(m.dotSize - m.mouthSize)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(m.dotHeight - m.mouthSize)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(m.dotGap - m.mouthGap)).toBeLessThanOrEqual(0.5);
});

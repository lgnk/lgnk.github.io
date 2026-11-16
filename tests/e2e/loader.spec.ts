import { test, expect } from './fixtures';

const slowFonts = (page: import('@playwright/test').Page, ms = 1800) =>
  page.route('**/_astro/fonts/*.woff2', async (route) => {
    await new Promise((r) => setTimeout(r, ms));
    await route.continue();
  });

const visible = (page: import('@playwright/test').Page) =>
  expect
    .poll(() => page.locator('#loader').evaluate((el) => getComputedStyle(el).opacity).catch(() => 'sumiu'), { timeout: 1500 })
    .toBe('1');

test('internet boa: a nuvem sai assim que o site fica pronto', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#loader')).toHaveCount(0);
});

test('a nuvem já abre na frente: nenhum quadro mostra o site antes dela', async ({ page }) => {
  // A cada quadro, anota se o site já estava na página com a nuvem ainda transparente (antes de ela começar a sair).
  await page.addInitScript(() => {
    const vazou: string[] = [];
    (window as any).__vazou = vazou;
    (function tick() {
      const loader = document.getElementById('loader');
      if (loader && loader.classList.contains('loader--out')) return;
      if (document.querySelector('header, main') && (!loader || getComputedStyle(loader).opacity !== '1'))
        vazou.push(loader ? getComputedStyle(loader).opacity : 'sem nuvem');
      if (!loader && document.querySelector('main')) return;
      requestAnimationFrame(tick);
    })();
  });
  await slowFonts(page);
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page.locator('#loader')).toHaveCount(0, { timeout: 6000 });
  expect(await page.evaluate(() => (window as any).__vazou)).toEqual([]);
});

test('internet lenta: a nuvem só sai depois que as fontes chegam, mesmo passando de 2,5 s', async ({ page }) => {
  // No instante em que a saída começa, anota se a página já estava lida e se ainda havia fonte carregando.
  await page.addInitScript(() => {
    new MutationObserver((records, obs) => {
      for (const r of records) {
        const el = r.target as HTMLElement;
        if (el.id === 'loader' && el.classList.contains('loader--out')) {
          (window as any).__saida = {
            pagina: document.readyState,
            carregando: [...document.fonts].filter((f) => f.status === 'loading').length,
          };
          obs.disconnect();
        }
      }
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ['class'] });
  });
  await slowFonts(page, 3500);
  await page.goto('/', { waitUntil: 'commit' });
  await visible(page);
  await expect.poll(() => page.evaluate(() => (window as any).__saida ?? null), { timeout: 8000 }).toEqual({
    pagina: expect.not.stringMatching(/^loading$/),
    carregando: 0,
  });
  await expect(page.locator('#loader')).toHaveCount(0, { timeout: 2000 });
});

test('nunca fica presa: some em até 8 s mesmo se as fontes não chegarem', async ({ page }) => {
  await page.route('**/_astro/fonts/*.woff2', () => {});
  await page.goto('/', { waitUntil: 'commit' });
  await visible(page);
  await expect(page.locator('#loader')).toHaveCount(0, { timeout: 11000 });
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

test('internet lenta: a nuvem cai, flutua e olha para os lados, sem trocar de rosto', async ({ page }) => {
  await slowFonts(page);
  await page.goto('/', { waitUntil: 'commit' });
  await visible(page);
  const [face] = await page.locator('#loader .loader-face').evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
  expect(face).toContain('loader-drop');
  expect(face).toContain('loader-bob');
  const eyes = await page.locator('#loader .loader-cloud .f-idle rect').evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
  expect(eyes).toEqual(['loader-look', 'loader-look', 'none']);
  expect(await page.locator('#loader .loader-cloud .f-idle').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  expect(await page.locator('#loader .loader-spinner').count()).toBe(0);
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

test('com movimento reduzido a nuvem fica parada, olhando para a frente', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await slowFonts(page);
  await page.goto('/', { waitUntil: 'commit' });
  await visible(page);
  expect(await page.locator('#loader .loader-face').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  expect(await page.locator('#loader .loader-cloud .f-idle rect').first().evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
});

test('"carregando…" é texto normal, como o "processando…" do topo: reticências no texto, mesma cor, sem animação', async ({ page }) => {
  await slowFonts(page, 2500);
  await page.goto('/', { waitUntil: 'commit' });
  await visible(page);
  const m = await page.evaluate(() => {
    const label = document.querySelector('#loader .loader-label')!;
    const box = label.getBoundingClientRect();
    const cloud = document.querySelector('#loader .loader-face')!.getBoundingClientRect();
    return {
      text: label.textContent,
      children: label.children.length,
      animation: getComputedStyle(label).animationName,
      labelCenter: (box.left + box.right) / 2,
      cloudCenter: (cloud.left + cloud.right) / 2,
    };
  });
  expect(m.text).toBe('carregando…');
  expect(m.children).toBe(0);
  expect(m.animation).toBe('none');
  expect(Math.abs(m.labelCenter - m.cloudCenter)).toBeLessThanOrEqual(1);
});

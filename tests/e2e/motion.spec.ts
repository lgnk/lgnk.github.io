import { test, expect } from './fixtures';

const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';

const transition = (el: Element) => {
  const s = getComputedStyle(el);
  return { props: s.transitionProperty, durations: s.transitionDuration, easing: s.transitionTimingFunction };
};

const shortest = (durations: string) => Math.min(...durations.split(',').map((d) => parseFloat(d)));

test('botões sobem no hover com transição suave', async ({ page }) => {
  await page.goto('/');
  const btn = page.locator('#topo .btn--primary');
  const t = await btn.evaluate(transition);
  for (const prop of ['transform', 'box-shadow', 'background-color']) expect(t.props).toContain(prop);
  expect(shortest(t.durations)).toBeGreaterThanOrEqual(0.15);
  expect(t.easing).toContain(EASE_OUT);
  await btn.hover();
  await expect.poll(() => btn.evaluate((el) => getComputedStyle(el).transform)).not.toBe('none');
});

test('links e opções do orçamento mudam de cor com transição', async ({ page }) => {
  await page.goto('/');
  for (const selector of ['.case-link', '.contact-link', '.chip']) {
    const t = await page.locator(selector).first().evaluate(transition);
    expect(t.props, selector).toMatch(/color|all/);
    expect(shortest(t.durations), selector).toBeGreaterThanOrEqual(0.15);
  }
});

test('com movimento reduzido o botão não se mexe, só muda de cor', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const btn = page.locator('#topo .btn--primary');
  await btn.hover();
  await page.waitForTimeout(300);
  expect(await btn.evaluate((el) => getComputedStyle(el).transform)).toBe('none');
  expect(await btn.evaluate(transition).then((t) => t.props)).toContain('background-color');
});

const SECTIONS = ['topo', 'servicos', 'trabalhos', 'como-trabalhamos', 'orcamento', 'quem-esta-por-tras', 'perguntas', 'contato'];

type Page = import('@playwright/test').Page;
const state = (page: Page, selector: string) => page.locator(selector).first().getAttribute('data-reveal-state');
const opacity = (page: Page, selector: string) =>
  page.locator(selector).first().evaluate((el) => Number(getComputedStyle(el).opacity));
/** Rola até o topo do item ficar em `fraction` da altura da tela (0 = topo, 1 = pé). */
const placeAt = (page: Page, selector: string, fraction: number) =>
  page.locator(selector).first().evaluate((el, f) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top - window.innerHeight * f, behavior: 'instant' });
  }, fraction);

test('cada seção e o topo têm itens com entrada, de pelo menos 6 tipos', async ({ page }) => {
  await page.goto('/');
  for (const id of SECTIONS) expect(await page.locator(`#${id} [data-reveal]`).count(), id).toBeGreaterThan(0);
  const kinds = await page.locator('[data-reveal]').evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute('data-reveal')))]);
  expect(kinds.length).toBeGreaterThanOrEqual(6);
  expect(await page.evaluate(() => document.documentElement.classList.contains('reveal-on'))).toBe(true);
});

test('o item só entra quando a tela chega mais perto, e sai pelo alto', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.getElementById('consent')?.setAttribute('hidden', ''));
  const item = '#servicos [data-reveal="up"]';
  await placeAt(page, item, 0.92);
  await page.waitForTimeout(400);
  expect(await state(page, item)).not.toBe('in');
  expect(await opacity(page, item)).toBeLessThan(0.05);
  await placeAt(page, item, 0.5);
  await expect.poll(() => state(page, item)).toBe('in');
  await expect.poll(() => opacity(page, item)).toBeGreaterThan(0.95);
  await placeAt(page, item, -0.6);
  await expect.poll(() => state(page, item)).toBe('above');
  await expect.poll(() => opacity(page, item)).toBeLessThan(0.05);
});

test('o topo entra ao abrir a página e sai ao rolar', async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => state(page, '#topo .hero-title')).toBe('in');
  await expect.poll(() => opacity(page, '#topo .hero-title')).toBeGreaterThan(0.95);
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
  await expect.poll(() => state(page, '#topo .hero-title')).toBe('above');
});

test('no fim da página o que ficou embaixo aparece', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await expect
    .poll(() => page.locator('#contato [data-reveal]').evaluateAll((els) => els.map((e) => e.getAttribute('data-reveal-state'))))
    .toEqual(['in', 'in', 'in']);
});

test('com movimento reduzido nada fica escondido', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.classList.contains('reveal-on'))).toBe(false);
  expect(await opacity(page, '#perguntas [data-reveal]')).toBe(1);
});

test('se o script das entradas falhar, tudo aparece mesmo assim', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, '__lgnkReveal', {
      get: () => false,
      set: () => {
        throw new Error('script das entradas bloqueado no teste');
      },
    });
  });
  page.on('pageerror', () => {});
  await page.goto('/');
  await expect.poll(() => opacity(page, '#perguntas [data-reveal]'), { timeout: 6000 }).toBe(1);
  await expect.poll(() => opacity(page, '#topo .hero-title'), { timeout: 6000 }).toBe(1);
});

test('as entradas pelos lados não criam rolagem horizontal', async ({ page }) => {
  await page.goto('/');
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await page.waitForTimeout(60);
    const { scroll, inner } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }));
    expect(scroll, `em ${y}px`).toBeLessThanOrEqual(inner);
  }
});

test('ir para uma seção pelo menu não esconde o rótulo que fica colado no topo', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.getElementById('servicos')!.scrollIntoView({ behavior: 'instant' }));
  await expect.poll(() => state(page, '#servicos .label')).toBe('in');
  await expect.poll(() => opacity(page, '#servicos .label')).toBeGreaterThan(0.95);
});

test('todo item com entrada aparece quando chega no meio da tela', async ({ page }) => {
  await page.goto('/');
  const total = await page.locator('[data-reveal]').count();
  const stuck: string[] = [];
  for (let i = 0; i < total; i++) {
    const el = page.locator('[data-reveal]').nth(i);
    if (!(await el.isVisible())) continue;
    await el.evaluate((node) => {
      const top = node.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top - window.innerHeight * 0.4, behavior: 'instant' });
    });
    try {
      await expect.poll(() => el.getAttribute('data-reveal-state'), { timeout: 1500 }).toBe('in');
    } catch {
      stuck.push(await el.evaluate((n) => `${n.closest('[id]')?.id} ${n.tagName.toLowerCase()}.${n.className} [${n.getAttribute('data-reveal')}]`));
    }
  }
  expect(stuck).toEqual([]);
});

test('o topo cabe na primeira tela com os dois botões, inclusive em tela baixa', async ({ page }) => {
  for (const [width, height] of [[1000, 521], [1280, 600], [1366, 660], [1440, 780], [1920, 950], [375, 667], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    const size = `${width}×${height}`;
    for (const sel of ['#topo .hero-title', '#topo .hero-sub', '#topo .hero-actions']) {
      await expect.poll(() => state(page, sel), { message: `${size} ${sel}` }).toBe('in');
    }
    await expect.poll(() => opacity(page, '#topo .hero-actions'), { message: size }).toBeGreaterThan(0.95);
    const bottoms = await page.evaluate(() =>
      ['#topo a[data-whatsapp]', '#topo .hero-more'].map((s) => document.querySelector(s)!.getBoundingClientRect().bottom),
    );
    for (const b of bottoms) expect(b, size).toBeLessThanOrEqual(height);
  }
});

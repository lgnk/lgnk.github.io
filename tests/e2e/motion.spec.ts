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

const SECTIONS = ['servicos', 'trabalhos', 'como-trabalhamos', 'orcamento', 'quem-esta-por-tras', 'perguntas', 'contato'];

test('cada seção tem itens que entram com a rolagem; o topo não', async ({ page }) => {
  await page.goto('/');
  for (const id of SECTIONS) expect(await page.locator(`#${id} [data-reveal]`).count(), id).toBeGreaterThan(0);
  expect(await page.locator('#topo [data-reveal]').count()).toBe(0);
  const anim = await page.locator('#perguntas [data-reveal]').first().evaluate((el) => {
    const s = getComputedStyle(el);
    return { name: s.animationName, timeline: s.animationTimeline };
  });
  expect(anim.name).toContain('reveal-in');
  expect(anim.name).toContain('reveal-out');
  expect(anim.timeline).toContain('view');
});

test('um item aparece quando chega na tela e some quando sai pelo alto', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.getElementById('consent')?.setAttribute('hidden', ''));
  const item = page.locator('#perguntas [data-reveal]').first();
  const opacity = () => item.evaluate((el) => Number(getComputedStyle(el).opacity));
  expect(await opacity()).toBeLessThan(0.05);
  await item.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect.poll(opacity).toBeGreaterThan(0.95);
  await item.evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().bottom + window.scrollY + 40, behavior: 'instant' }));
  await expect.poll(opacity).toBeLessThan(0.05);
});

test('com movimento reduzido os itens ficam parados e visíveis', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const item = page.locator('#perguntas [data-reveal]').first();
  const s = await item.evaluate((el) => ({ name: getComputedStyle(el).animationName, opacity: getComputedStyle(el).opacity }));
  expect(s).toEqual({ name: 'none', opacity: '1' });
});

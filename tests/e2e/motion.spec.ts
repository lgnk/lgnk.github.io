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

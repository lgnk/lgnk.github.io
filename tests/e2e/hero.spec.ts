import { test, expect } from './fixtures';

test('anima e processa pedidos', async ({ page }) => {
  await page.goto('/');
  const stage = page.locator('#heroStage');
  await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute('data-motion', 'full');
  await expect(stage).toHaveAttribute('data-running', 'true');
  await expect
    .poll(() => page.locator('#heroMascot').getAttribute('data-state'), { timeout: 8000 })
    .toBe('proc');
});

test('clique no palco deixa o mascote "pronto"', async ({ page }) => {
  await page.goto('/');
  await page.locator('#heroStage').click({ position: { x: 20, y: 20 } });
  await expect(page.locator('#heroMascot')).toHaveAttribute('data-state', 'done');
});

test('movimento reduzido: quadro parado', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const stage = page.locator('#heroStage');
  await expect(stage).toHaveAttribute('data-motion', 'static');
  await expect(stage).toHaveAttribute('data-running', 'false');
  await page.waitForTimeout(2500);
  await expect(page.locator('#heroMascot')).toHaveAttribute('data-state', 'idle');
  expect(await page.locator('#heroMascot animate, #heroMascot animateTransform').count()).toBe(0);
});

test('para quando o palco sai da tela', async ({ page }) => {
  await page.goto('/');
  const stage = page.locator('#heroStage');
  await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute('data-running', 'true');
  await page.locator('#perguntas').scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute('data-running', 'false');
  await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute('data-running', 'true');
});

test('canvas acompanha o tamanho do palco', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 900, height: 900 });
  await expect
    .poll(() =>
      page.evaluate(() => {
        const s = document.getElementById('heroStage')!;
        const c = s.querySelector('canvas')!;
        return Math.abs(c.width - Math.round(s.clientWidth * Math.min(devicePixelRatio, 2)));
      }),
    )
    .toBeLessThanOrEqual(1);
});

test('mascote inteiro dentro do palco em 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  const [s, m] = await Promise.all([page.locator('#heroStage').boundingBox(), page.locator('#heroMascot').boundingBox()]);
  expect(m!.x).toBeGreaterThanOrEqual(s!.x);
  expect(m!.x + m!.width).toBeLessThanOrEqual(s!.x + s!.width);
  expect(m!.y).toBeGreaterThanOrEqual(s!.y);
  expect(m!.y + m!.height).toBeLessThanOrEqual(s!.y + s!.height);
});

import { test, expect } from './fixtures';

const video = '#trabalhos article[data-case="avance"] video';

test('o vídeo do case toca sozinho, sem som, quando aparece, e para quando sai', async ({ page }) => {
  await page.goto('/');
  const v = page.locator(video);
  await v.scrollIntoViewIfNeeded();
  await expect.poll(() => v.evaluate((el: HTMLVideoElement) => !el.paused && el.muted), { timeout: 6000 }).toBe(true);
  expect(await v.evaluate((el) => el.hasAttribute('controls'))).toBe(false);
  await page.locator('#topo').scrollIntoViewIfNeeded();
  await expect.poll(() => v.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
});

test('com movimento reduzido, o vídeo não toca sozinho e mostra os controles', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const v = page.locator(video);
  await v.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  expect(await v.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
  expect(await v.evaluate((el) => el.hasAttribute('controls'))).toBe(true);
});

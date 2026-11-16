import { test, expect } from './fixtures';

test('sem rolagem horizontal', async ({ page }) => {
  for (const width of [320, 375, 768, 1360]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const { scroll, inner } = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      inner: window.innerWidth,
    }));
    expect(scroll, `largura ${width}px`).toBeLessThanOrEqual(inner);
  }
});

test('funciona sem JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://localhost:4322/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('#heroMascot')).toBeVisible();
  await expect(page.locator('#loader')).toBeHidden();
  const hrefs = await page.locator('a[data-whatsapp]').evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''));
  expect(hrefs.length).toBeGreaterThanOrEqual(2);
  for (const h of hrefs) expect(h).toMatch(/^https:\/\/wa\.me\//);
  await expect(page.locator('#consent')).toBeHidden();
  await expect(page.locator('[data-open-consent]')).toBeHidden();
  await context.close();
});

test('foco visível', async ({ page }) => {
  await page.goto('/');
  let reachedHeroWhatsApp = false;
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        outline: cs.outlineStyle,
        shadow: cs.boxShadow,
        heroWhatsApp: el.matches('#topo a[data-whatsapp]'),
        label: (el.textContent ?? '').trim().slice(0, 40),
      };
    });
    if (!info) continue;
    expect(['a', 'button', 'summary'], info.label).toContain(info.tag);
    // Botões têm sombra dura fixa, então só o contorno prova que o foco aparece.
    expect(info.outline, `sem foco visível: ${info.label}`).not.toBe('none');
    if (info.heroWhatsApp) reachedHeroWhatsApp = true;
  }
  expect(reachedHeroWhatsApp).toBe(true);
});

test('WhatsApp à vista no celular', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'só no celular');
  await page.goto('/');
  await expect(page.locator('header a[data-whatsapp]')).toBeInViewport();
});

test('links do rodapé confortáveis ao toque', async ({ page }) => {
  await page.goto('/');
  for (const name of ['Política de privacidade']) {
    const box = await page.getByRole('link', { name }).boundingBox();
    expect(box!.height, name).toBeGreaterThanOrEqual(44);
  }
});

import { test as plain } from '@playwright/test';
import { test, expect, serveWithClarityId } from './fixtures';

plain('sem ID do Clarity, não pede consentimento', async ({ page }) => {
  await serveWithClarityId(page, null);
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('#consent')).toBeHidden();
  await expect(page.locator('[data-open-consent]')).toBeHidden();
});

test('foco volta para Preferências depois de escolher', async ({ page }) => {
  await page.goto('/');
  await page.locator('#consent').getByRole('button', { name: 'Aceitar' }).click();
  const prefs = page.getByRole('button', { name: 'Preferências de cookies' });
  await prefs.click();
  await expect(page.locator('#consent button[data-consent="granted"]')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#consent')).toBeHidden();
  await expect(prefs).toBeFocused();
});

test('banner não esconde o elemento focado em tela pequena', async ({ page }) => {
  // Sem rolagem suave, para medir a posição final de cada foco na hora.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  await expect(page.locator('#consent')).toBeVisible();
  // Enquanto a nuvem de carregamento está na frente, nada recebe foco (às vezes ela sai um instante depois do load).
  await expect(page.locator('#loader')).toHaveCount(0);
  const covered: string[] = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const result = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      const banner = document.getElementById('consent')!;
      if (!el || el === document.body || banner.contains(el)) return null;
      const r = el.getBoundingClientRect();
      const limit = banner.getBoundingClientRect().top;
      // Cabe no espaço livre? Tem que aparecer inteiro. Não cabe? Não pode ficar todo escondido (WCAG 2.4.11).
      const ok = r.height <= limit ? r.top >= -1 && r.bottom <= limit + 1 : r.top < limit && r.bottom > 0;
      return ok ? null : `${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 40)} (${Math.round(r.bottom - limit)}px)`;
    });
    if (result && !covered.includes(result)) covered.push(result);
  }
  expect(covered).toEqual([]);
});

test('espaço do banner acompanha o tamanho da tela', async ({ page }) => {
  await page.setViewportSize({ width: 1360, height: 900 });
  await page.goto('/');
  await expect(page.locator('#consent')).toBeVisible();
  await page.setViewportSize({ width: 320, height: 700 });
  await expect
    .poll(() =>
      page.evaluate(() => {
        const banner = document.getElementById('consent')!;
        return Math.abs(parseFloat(getComputedStyle(document.body).paddingBottom) - banner.offsetHeight);
      }),
    )
    .toBeLessThanOrEqual(1);
});

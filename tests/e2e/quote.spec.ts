import { test, expect } from './fixtures';

test('o montador vira a mensagem do WhatsApp', async ({ page }) => {
  await page.goto('/');
  await page.locator('#consent').getByRole('button', { name: 'Recusar' }).click();
  const section = page.locator('#orcamento');
  await section.scrollIntoViewIfNeeded();
  await section.getByLabel('Site ou loja virtual').check();
  await section.getByLabel('Perco venda ou pedido').check();
  await section.getByLabel('Tudo no papel ou planilha').check();
  await section.getByLabel('Seu negócio').fill('Loja de roupas em BH');
  await section.getByLabel('Este mês').check();
  const expected = [
    'Olá! Vim pelo site da LGNK e quero um orçamento.',
    '• Preciso de: Site ou loja virtual',
    '• Meu negócio: Loja de roupas em BH',
    '• O que mais atrapalha: Perco venda ou pedido, Tudo no papel ou planilha',
    '• Prazo: Este mês',
  ].join('\n');
  await expect(section.locator('[data-quote-preview]')).toHaveText(expected);
  const href = await section.locator('a[data-whatsapp-quote]').getAttribute('href');
  expect(decodeURIComponent(href!.split('?text=')[1])).toBe(expected);
  await expect(section.locator('#quoteMascot')).toHaveAttribute('data-state', 'done', { timeout: 3000 });
});

test('barra de orçamento no celular aparece depois do topo e some no orçamento', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'só no celular');
  await page.goto('/');
  await page.locator('#consent').getByRole('button', { name: 'Recusar' }).click();
  const bar = page.locator('[data-quote-bar]');
  await expect(bar).toBeHidden();
  await page.locator('#servicos').scrollIntoViewIfNeeded();
  await expect(bar).toBeVisible();
  await page.locator('#orcamento').scrollIntoViewIfNeeded();
  await expect(bar).toBeHidden();
});

test('no computador a barra não aparece', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'só no computador');
  await page.goto('/');
  await page.locator('#consent').getByRole('button', { name: 'Recusar' }).click();
  await page.locator('#servicos').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-quote-bar]')).toBeHidden();
});

test('sem JavaScript o botão do orçamento ainda abre o WhatsApp', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://localhost:4322/');
  await expect(page.locator('#orcamento a[data-whatsapp-quote]')).toBeVisible();
  await expect(page.locator('[data-quote-builder]')).toBeHidden();
  await context.close();
});

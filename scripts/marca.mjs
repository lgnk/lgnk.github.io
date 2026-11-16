// Gera os PNGs da marca a partir do build (rode `yarn build` antes):
//   marca/avatar-1024.png  → foto do WhatsApp Business e avatar do GitHub
//   marca/logo.png         → logo horizontal com fundo transparente
//   public/og.png          → imagem de compartilhamento (1200×630)
// Rode: yarn build && node scripts/marca.mjs
import { chromium } from '@playwright/test';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const file = (p) => fileURLToPath(new URL(p, root));

if (!existsSync(file('dist/marca/avatar.svg'))) {
  console.error('Falta o build: rode `yarn build` antes.');
  process.exit(1);
}
mkdirSync(file('marca'), { recursive: true });

const browser = await chromium.launch();

// Avatar: o SVG ocupa a janela inteira de 1024×1024.
const avatar = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
await avatar.goto(new URL('dist/marca/avatar.svg', root).href);
await avatar.screenshot({ path: file('marca/avatar-1024.png') });

// Logo: só o bloco do logo, fundo transparente.
const logo = await browser.newPage({ viewport: { width: 2000, height: 600 } });
await logo.goto(new URL('scripts/logo.html', root).href, { waitUntil: 'networkidle' });
await logo.evaluate(() => document.fonts.ready);
await logo.locator('#logo').screenshot({ path: file('marca/logo.png'), omitBackground: true });

// Imagem de compartilhamento.
const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await og.goto(new URL('scripts/og.html', root).href, { waitUntil: 'networkidle' });
await og.evaluate(() => document.fonts.ready);
await og.screenshot({ path: file('public/og.png') });

await browser.close();
console.log('marca/avatar-1024.png, marca/logo.png e public/og.png gerados.');

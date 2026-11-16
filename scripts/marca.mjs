// Gera os PNGs da marca a partir do build (rode `yarn build` antes):
//   marca/avatar-1024.png  → foto do WhatsApp Business e avatar do GitHub
//   marca/logo.png         → logo horizontal com fundo transparente
//   public/og.png          → imagem de compartilhamento (1200×630)
//   public/apple-touch-icon.png (180) e public/icon-512.png → ícone ao salvar na tela inicial
//   marca/whatsapp-perfil.png → foto de perfil do WhatsApp Business (1024, folga para o círculo)
//   marca/whatsapp-capa.png   → capa do perfil do WhatsApp Business (2422×1362, 16:9)
//   marca/whatsapp-capa-empresa.png → capa "sobre a empresa": serviços e integrações (2422×1362, 16:9)
// Rode: yarn build && node scripts/marca.mjs
import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
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

// Ícones de tela inicial: a nuvem em escala inteira (1 ou 4 px por unidade) sobre amarelo, sem borrar os pixels.
const avatarSvg = readFileSync(file('dist/marca/avatar.svg'), 'utf8');
for (const [out, size, cloud] of [
  ['public/apple-touch-icon.png', 180, 120],
  ['public/icon-512.png', 512, 480],
  // Foto de perfil do WhatsApp: 7 px por pixel da nuvem, com folga para o recorte redondo.
  ['marca/whatsapp-perfil.png', 1024, 840],
]) {
  const icon = await browser.newPage({ viewport: { width: size, height: size } });
  await icon.setContent(
    `<body style="margin:0;background:#FFD23F;display:grid;place-items:center;height:${size}px">` +
      avatarSvg.replace('<svg ', `<svg width="${cloud}" height="${cloud}" `) +
      '</body>',
  );
  await icon.screenshot({ path: file(out) });
}

// Capa do perfil do WhatsApp Business: 1211×681 (16:9) em 2× para ficar nítida.
const capa = await browser.newPage({ viewport: { width: 1211, height: 681 }, deviceScaleFactor: 2 });
await capa.goto(new URL('scripts/whatsapp-capa.html', root).href, { waitUntil: 'networkidle' });
await capa.evaluate(() => document.fonts.ready);
await capa.screenshot({ path: file('marca/whatsapp-capa.png') });

// Capa "sobre a empresa": mesma moldura, com os serviços (ícones de pixel) e as integrações.
const empresa = await browser.newPage({ viewport: { width: 1211, height: 681 }, deviceScaleFactor: 2 });
await empresa.goto(new URL('scripts/whatsapp-capa-empresa.html', root).href, { waitUntil: 'networkidle' });
await empresa.evaluate(() => document.fonts.ready);
await empresa.screenshot({ path: file('marca/whatsapp-capa-empresa.png') });

// Imagem de compartilhamento.
const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await og.goto(new URL('scripts/og.html', root).href, { waitUntil: 'networkidle' });
await og.evaluate(() => document.fonts.ready);
await og.screenshot({ path: file('public/og.png') });

await browser.close();
console.log('marca/avatar-1024.png, marca/logo.png, capas do WhatsApp, public/og.png e ícones de tela inicial gerados.');

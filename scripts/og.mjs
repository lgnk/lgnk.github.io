// Gera public/og.png (1200×630) a partir de scripts/og.html. Rode: node scripts/og.mjs
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const html = new URL('./og.html', import.meta.url).href;
const out = fileURLToPath(new URL('../public/og.png', import.meta.url));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out });
await browser.close();
console.log(`og.png → ${out}`);

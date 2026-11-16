import type { APIRoute } from 'astro';
import { mascotSvg } from '../../lib/mascot';

/**
 * Logo horizontal: nuvem + "lgnk" + "sistemas". O texto depende das fontes Inter Tight e JetBrains Mono
 * instaladas; para uso geral, prefira marca/logo.png (gerado por scripts/marca.mjs).
 */
const cloud = mascotSvg().replace('<svg ', '<svg x="0" y="4" width="132" height="132" ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 140" role="img"><title>LGNK Sistemas</title>${cloud}<text x="138" y="84" font-family="'Inter Tight', Inter, 'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="76" letter-spacing="-3.4" fill="#1B1A24">lgnk</text><text x="142" y="114" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-weight="700" font-size="21" fill="#5A30D9">sistemas</text></svg>`;

export const GET: APIRoute = () => new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });

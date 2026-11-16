import type { APIRoute } from 'astro';
import { mascotSvg } from '../../lib/mascot';

/** Avatar (WhatsApp Business, GitHub): a nuvem sobre amarelo. Vira PNG com scripts/marca.mjs. */
export const GET: APIRoute = () =>
  new Response(mascotSvg({ title: 'LGNK Sistemas', background: { color: '#FFD23F', shape: 'square' } }), {
    headers: { 'Content-Type': 'image/svg+xml' },
  });

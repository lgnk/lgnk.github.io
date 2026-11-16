import type { APIRoute } from 'astro';
import { mascotSvg } from '../../lib/mascot';

/** Símbolo da marca: a nuvem parada, fundo transparente. */
export const GET: APIRoute = () =>
  new Response(mascotSvg({ title: 'LGNK Sistemas' }), { headers: { 'Content-Type': 'image/svg+xml' } });

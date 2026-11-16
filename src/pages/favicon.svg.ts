import type { APIRoute } from 'astro';
import { mascotSvg } from '../lib/mascot';

/** Ícone da aba: a nuvem parada sobre quadrado amarelo. */
export const GET: APIRoute = () =>
  new Response(mascotSvg({ background: { color: '#FFD23F', shape: 'square' } }), {
    headers: { 'Content-Type': 'image/svg+xml' },
  });

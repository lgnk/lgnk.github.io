import type { APIRoute } from 'astro';
import { mascotSvg } from '../lib/mascot';

/** Ícone da aba: a nuvem parada sobre quadrado amarelo, recortada na grade para os olhos aparecerem em 16 px. */
export const GET: APIRoute = () =>
  new Response(mascotSvg({ background: { color: '#FFD23F', shape: 'square' }, viewBox: '12 15 96 96' }), {
    headers: { 'Content-Type': 'image/svg+xml' },
  });

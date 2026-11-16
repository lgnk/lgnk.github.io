import type { APIRoute } from 'astro';
import { mascotSvg } from '../../lib/mascot';

/** A nuvem com a cara de "processando" (olhos focados, reticências, barra de carregamento), parada. */
export const GET: APIRoute = () =>
  new Response(mascotSvg({ title: 'LGNK Sistemas processando', states: ['proc'], state: 'proc' }), {
    headers: { 'Content-Type': 'image/svg+xml' },
  });

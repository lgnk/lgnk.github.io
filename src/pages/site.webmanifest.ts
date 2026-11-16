import type { APIRoute } from 'astro';
import { site } from '../config';

/** Para quando alguém salva o site na tela inicial do celular. */
export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: site.name,
      short_name: 'LGNK',
      start_url: '/',
      display: 'browser',
      background_color: '#FFF8EC',
      theme_color: '#FFF8EC',
      icons: [
        { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    }),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );

import type { APIRoute, GetStaticPaths } from 'astro';
import { PIXEL_ICONS, pixelIconSvg, type PixelIcon } from '../../lib/icons';

/** Cada ícone de pixel do site como arquivo da marca: marca/icone-sistema.svg, marca/icone-loja.svg… */
export const getStaticPaths: GetStaticPaths = () => Object.keys(PIXEL_ICONS).map((nome) => ({ params: { nome } }));

export const GET: APIRoute = ({ params }) =>
  new Response(pixelIconSvg(params.nome as PixelIcon, '', { standalone: true }), {
    headers: { 'Content-Type': 'image/svg+xml' },
  });

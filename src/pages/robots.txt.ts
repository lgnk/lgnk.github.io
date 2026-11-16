import type { APIRoute } from 'astro';
import { site } from '../config';

/** Libera a busca no site inteiro e aponta o sitemap. */
export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site.url).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });

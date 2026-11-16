import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseHTML } from 'linkedom';
import { DIST, page } from './helpers';

const read = (p: string) => readFileSync(join(DIST, p), 'utf8');
const pngSize = (p: string) => {
  const b = readFileSync(join(DIST, p));
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
};

describe('busca e instalação', () => {
  it('robots.txt libera tudo e aponta o sitemap', () => {
    const robots = read('robots.txt');
    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain('Sitemap: https://lgnk.com.br/sitemap.xml');
  });

  it('sitemap.xml lista só as páginas do site', () => {
    const xml = read('sitemap.xml');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual(['https://lgnk.com.br/', 'https://lgnk.com.br/privacidade/']);
  });

  it('página 404 própria, fora da busca, com caminho de volta', () => {
    const doc = parseHTML(read('404.html')).document as unknown as Document;
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
    expect(doc.querySelector('link[rel="canonical"]')).toBeNull();
    expect(doc.querySelector('h1')?.textContent).toContain('não existe');
    expect(doc.querySelector('main a[href="/"]')).not.toBeNull();
    expect(doc.querySelector('main svg.mascot')).not.toBeNull();
  });

  it('as páginas normais continuam indexáveis', () => {
    expect(page('/').querySelector('meta[name="robots"]')).toBeNull();
    expect(page('/privacidade/').querySelector('meta[name="robots"]')).toBeNull();
  });

  it('ícones e manifesto para salvar na tela inicial', () => {
    const home = page('/');
    expect(home.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href')).toBe('/apple-touch-icon.png');
    expect(home.querySelector('link[rel="manifest"]')?.getAttribute('href')).toBe('/site.webmanifest');
    expect(pngSize('apple-touch-icon.png')).toEqual([180, 180]);
    expect(pngSize('icon-512.png')).toEqual([512, 512]);
    const manifest = JSON.parse(read('site.webmanifest'));
    expect(manifest).toMatchObject({ name: 'LGNK Sistemas', short_name: 'LGNK', start_url: '/', theme_color: '#FFF8EC' });
    expect(manifest.icons.map((i: { src: string }) => i.src)).toEqual(['/apple-touch-icon.png', '/icon-512.png']);
    expect(existsSync(join(DIST, 'icon-512.png'))).toBe(true);
  });
});

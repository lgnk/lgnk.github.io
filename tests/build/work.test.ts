import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, page, text } from './helpers';

const NAMES = ['Beerpass Club', 'Avance Trainer', 'Pedro Porto Studios', 'InkaBoxe', 'Silver Schuffner', 'JM Atacado'];
const VIDEOS = ['avance', 'inkaboxe', 'pedro-porto'];
const IMAGES = ['jm-atacado', 'silver-schuffner'];
const LINKS: Record<string, string> = {
  'Beerpass Club': 'https://www.beerpassclub.com/',
  'Avance Trainer': 'https://avancetrainer.com',
  'JM Atacado': '/jm-atacado/',
  'Pedro Porto Studios': 'https://pedroportodesign.online',
};

describe('seção Trabalhos', () => {
  const section = page('/').querySelector('#trabalhos')!;
  const items = [...section.querySelectorAll('article.case')];
  const bySlug = (slug: string) => section.querySelector(`article.case[data-case="${slug}"]`)!;

  it('tem título e rótulo', () => {
    expect(text(section.querySelector('.label'))).toBe('// trabalhos');
    expect(text(section.querySelector('h2'))).toBe('O que a gente já construiu.');
  });

  it('mostra os seis cases na ordem, sem numeração', () => {
    expect(items.map((a) => text(a.querySelector('h3')))).toEqual(NAMES);
    expect(section.querySelector('.num')).toBeNull();
  });

  it('cada case conta o problema, o que construímos e o resultado', () => {
    for (const a of items) {
      const name = text(a.querySelector('h3'));
      expect([...a.querySelectorAll('dt')].map(text), name).toEqual(['O problema', 'O que construímos', 'Resultado']);
      for (const dd of a.querySelectorAll('dd')) expect(text(dd).length, name).toBeGreaterThan(10);
      expect(a.querySelectorAll('.outcomes li').length, name).toBeGreaterThan(0);
    }
  });

  it('vídeos sem som, que só carregam quando tocam, com capa', () => {
    for (const slug of VIDEOS) {
      const video = bySlug(slug).querySelector('video')!;
      expect(video.getAttribute('preload'), slug).toBe('none');
      for (const attr of ['muted', 'loop', 'playsinline', 'controls']) expect(video.hasAttribute(attr), `${slug} ${attr}`).toBe(true);
      expect(video.getAttribute('poster'), slug).toBeTruthy();
      expect(video.getAttribute('aria-label'), slug).toContain('Vídeo de apresentação');
      expect([...video.querySelectorAll('source')].map((s) => s.getAttribute('src'))).toEqual([`/cases/${slug}/video.webm`, `/cases/${slug}/video.mp4`]);
      expect(existsSync(join(DIST, 'cases', slug, 'video.webm')), slug).toBe(true);
      expect(existsSync(join(DIST, 'cases', slug, 'video.mp4')), slug).toBe(true);
    }
  });

  it('Beerpass: espaço reservado até o vídeo novo', () => {
    const a = bySlug('beerpass');
    expect(a.querySelector('video')).toBeNull();
    expect(text(a.querySelector('.case-soon'))).toContain('vídeo novo em gravação');
  });

  it('JM e Silver: foto com descrição, em vários tamanhos', () => {
    for (const slug of IMAGES) {
      const img = bySlug(slug).querySelector('img')!;
      expect((img.getAttribute('alt') ?? '').trim(), slug).not.toBe('');
      const widths = (img.getAttribute('srcset') ?? '').split(',').map((c) => c.trim().split(' ')[1]);
      expect(widths, slug).toEqual(['480w', '800w', '1200w']);
      expect(img.getAttribute('sizes'), slug).toBe('(min-width: 1240px) 600px, (min-width: 900px) 50vw, calc(100vw - 32px)');
    }
  });

  it('"Ver site" só nos publicados, num link discreto em nova aba', () => {
    for (const a of items) {
      const name = text(a.querySelector('h3'));
      const links = [...a.querySelectorAll('a')];
      if (!LINKS[name]) {
        expect(links.length, name).toBe(0);
        continue;
      }
      expect(links.length, name).toBe(1);
      expect(links[0].getAttribute('href')).toBe(LINKS[name]);
      expect(text(links[0])).toBe(`Ver site ↗ de ${name} (abre em nova aba)`);
      expect(links[0].getAttribute('target')).toBe('_blank');
      expect(links[0].getAttribute('rel')).toContain('noopener');
    }
  });
});

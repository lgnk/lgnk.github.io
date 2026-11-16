import { describe, it, expect } from 'vitest';
import { page, text } from './helpers';
import { cases } from '../../src/data/cases';

const NAMES = ['Beerpass Club', 'Avance Trainer', 'InkaBoxe', 'Pedro Porto Studios', 'Silver Schuffner'];
const UNLINKED = ['InkaBoxe', 'Silver Schuffner'];

describe('seção Trabalhos', () => {
  const section = page('/').querySelector('#trabalhos')!;
  const items = [...section.querySelectorAll('li')];

  it('tem título e chamada', () => {
    expect(text(section.querySelector('.label'))).toBe('// trabalhos');
    expect(text(section.querySelector('h2'))).toBe('O que a gente já construiu.');
  });

  it('mostra os cinco cases na ordem', () => {
    expect(items.map((li) => text(li.querySelector('h3')))).toEqual(NAMES);
  });

  it('só linka os cases publicados, em nova aba', () => {
    for (const li of items) {
      const name = text(li.querySelector('h3'));
      const links = li.querySelectorAll('a');
      if (UNLINKED.includes(name)) {
        expect(links.length).toBe(0);
      } else {
        expect(links.length).toBe(1);
        expect(links[0].getAttribute('target')).toBe('_blank');
        expect(links[0].getAttribute('rel')).toContain('noopener');
        const c = cases.find((x) => x.name === name)!;
        expect(links[0].getAttribute('aria-label')).toBe(`${c.name}: ${c.summary} (abre em nova aba)`);
      }
    }
  });

  it('cada case tem uma imagem com alt', () => {
    for (const li of items) {
      const imgs = li.querySelectorAll('img');
      expect(imgs.length).toBe(1);
      expect((imgs[0].getAttribute('alt') ?? '').trim()).not.toBe('');
    }
  });

  it('as fotos vêm em vários tamanhos, para ficarem nítidas no celular sem pesar', () => {
    for (const li of items) {
      const img = li.querySelector('img')!;
      const widths = (img.getAttribute('srcset') ?? '').split(',').map((c) => c.trim().split(' ')[1]);
      expect(widths).toEqual(['480w', '800w', '1200w']);
      expect(img.getAttribute('sizes')).toBe('(min-width: 1240px) 400px, (min-width: 768px) 34vw, calc(100vw - 32px)');
    }
  });
});

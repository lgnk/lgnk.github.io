import { describe, it, expect } from 'vitest';
import { page, text } from './helpers';

const NAMES = ['Beerpass Club', 'Avance Trainer', 'InkaBoxe', 'Pedro Porto Studios', 'Silver Schuffner'];
const UNLINKED = ['InkaBoxe', 'Silver Schuffner'];

describe('seção Trabalhos', () => {
  const section = page('/').querySelector('#trabalhos')!;
  const items = [...section.querySelectorAll('li')];

  it('tem título e chamada', () => {
    expect(text(section.querySelector('.eyebrow'))).toBe('Trabalhos');
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
});

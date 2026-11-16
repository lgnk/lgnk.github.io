import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, page, text } from './helpers';

describe('tela de carregamento (só com internet lenta)', () => {
  it.each(['/', '/privacidade/'])('%s abre com a nuvem e o ícone girando, escondida dos leitores de tela', (path) => {
    const doc = page(path);
    const loader = doc.body.firstElementChild!;
    expect(loader.id).toBe('loader');
    expect(loader.getAttribute('aria-hidden')).toBe('true');
    expect(loader.querySelector('svg.mascot[data-state="idle"]')).not.toBeNull();
    expect(loader.querySelectorAll('svg.loader-spinner rect')).toHaveLength(8);
    expect(text(loader)).toContain('carregando');
  });

  it('sem JavaScript a tela some', () => {
    const html = readFileSync(join(DIST, 'index.html'), 'utf8');
    expect(html).toMatch(/<noscript><style>#loader\s*{\s*display:\s*none;?\s*}<\/style><\/noscript>/);
  });

  it('o CSS vem dentro do HTML, para a nuvem poder aparecer antes do resto chegar', () => {
    for (const path of ['index.html', join('privacidade', 'index.html')]) {
      expect(readFileSync(join(DIST, path), 'utf8')).not.toContain('rel="stylesheet"');
    }
  });
});

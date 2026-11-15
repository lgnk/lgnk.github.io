import { describe, it, expect } from 'vitest';
import { clarityTagSnippet } from '../../src/lib/clarity';

describe('clarityTagSnippet', () => {
  it('gera o carregador oficial com o ID do projeto', () => {
    const s = clarityTagSnippet('abc123xyz0');
    expect(s).toContain('https://www.clarity.ms/tag/');
    expect(s).toContain('"abc123xyz0"');
  });

  it.each(['', 'a b', 'abc"; alert(1);//'])('recusa ID inválido: %s', (id) => {
    expect(() => clarityTagSnippet(id)).toThrow();
  });
});

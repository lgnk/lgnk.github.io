import { describe, it, expect } from 'vitest';
import { cases } from '../../src/data/cases';

describe('cases', () => {
  it('estão na ordem aprovada', () => {
    expect(cases.map((c) => c.slug)).toEqual(['beerpass', 'avance', 'inkaboxe', 'pedro-porto', 'silver-schuffner']);
  });

  it('InkaBoxe e Silver Schuffner não têm link', () => {
    expect(cases.find((c) => c.slug === 'inkaboxe')?.href).toBeNull();
    expect(cases.find((c) => c.slug === 'silver-schuffner')?.href).toBeNull();
  });

  it('Pedro Porto aponta para o portfólio que aparece na imagem', () => {
    const c = cases.find((x) => x.slug === 'pedro-porto')!;
    expect(c.href).toBe('https://pedroportodesign.online');
    expect(c.summary).toBe('Portfólio do designer refeito em código e loja de roupas sob demanda com Pix, cartão e frete');
  });

  it('nenhum link aponta para a conta pessoal', () => {
    for (const c of cases) expect(c.href ?? '').not.toContain('ianlgnk');
  });

  it('toda imagem tem texto alternativo', () => {
    for (const c of cases) expect(c.imageAlt.trim()).not.toBe('');
  });
});

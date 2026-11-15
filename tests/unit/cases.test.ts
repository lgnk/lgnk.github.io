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

  it('nenhum link aponta para a conta pessoal', () => {
    for (const c of cases) expect(c.href ?? '').not.toContain('ianlgnk');
  });

  it('toda imagem tem texto alternativo', () => {
    for (const c of cases) expect(c.imageAlt.trim()).not.toBe('');
  });
});

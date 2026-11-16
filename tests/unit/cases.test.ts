import { describe, it, expect } from 'vitest';
import { cases } from '../../src/data/cases';

describe('cases', () => {
  it('estão na ordem aprovada', () => {
    expect(cases.map((c) => c.slug)).toEqual(['beerpass', 'avance', 'pedro-porto', 'silver-schuffner', 'jm-atacado', 'inkaboxe']);
  });

  it('InkaBoxe e Silver Schuffner não têm link', () => {
    expect(cases.find((c) => c.slug === 'inkaboxe')?.href).toBeNull();
    expect(cases.find((c) => c.slug === 'silver-schuffner')?.href).toBeNull();
  });

  it('nenhum link aponta para a conta pessoal', () => {
    for (const c of cases) expect(c.href ?? '').not.toContain('ianlgnk');
  });

  it('fatos confirmados pelo Ian', () => {
    const by = (slug: string) => cases.find((c) => c.slug === slug)!;
    expect(by('avance').result).toContain('Mais de 6 treinadores e 80 alunos');
    expect(by('beerpass').built).toContain('Stone e PagBank');
    expect(by('inkaboxe').result).toBe('Reconhece o aluno pelo rosto mesmo sem internet.');
    expect(by('pedro-porto').result).toContain('Mercado Pago e Melhor Envio');
    expect(by('silver-schuffner').result).toBe('Em desenvolvimento.');
  });

  it('nenhum case fala em preço', () => {
    for (const c of cases) expect(JSON.stringify(c)).not.toMatch(/R\$/);
  });

  it('toda foto tem texto alternativo', () => {
    for (const c of cases) if (c.media.type === 'image') expect(c.media.alt.trim()).not.toBe('');
  });
});

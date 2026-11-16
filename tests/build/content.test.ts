import { describe, it, expect } from 'vitest';
import { page, text } from './helpers';

const PROMISES = [
  'Sim, o código e os dados são da sua empresa.',
  'Entregas toda semana: você acompanha e testa.',
  'Treinamento na entrega.',
  'Plano de manutenção mensal: correções, melhorias, servidor e backup, com resposta em até 1 dia útil.',
  'Site em semanas, sistema em meses.',
  'Pelo WhatsApp, sem compromisso.',
  'Escopo, prazo e valor fechados por escrito.',
];

describe('conteúdo da home', () => {
  const doc = page('/');
  const body = text(doc.body);

  it('tem um único h1 com a frase do topo', () => {
    const h1s = doc.querySelectorAll('h1');
    expect(h1s.length).toBe(1);
    expect(text(h1s[0])).toBe('Sistemas que aguentam o dia a dia.');
  });

  it('tem as seções na ordem aprovada', () => {
    const ids = [...doc.querySelectorAll('section[id], footer[id]')].map((el) => el.id);
    expect(ids).toEqual(['topo', 'provas', 'servicos', 'trabalhos', 'como-trabalhamos', 'orcamento', 'quem-esta-por-tras', 'perguntas', 'contato']);
  });

  it('o único valor em reais é o do site vitrine', () => {
    const prices = body.match(/R\$\s?\d{1,3}(?:\.\d{3})*(?:,\d{2})?/g) ?? [];
    expect(prices.length).toBeGreaterThanOrEqual(2);
    for (const p of prices) expect(p).toBe('R$ 2.000');
  });

  it('só o card de sites mostra preço', () => {
    const cards = [...doc.querySelectorAll('#servicos li')];
    expect(cards.length).toBe(4);
    for (const card of cards) {
      const title = text(card.querySelector('h3'));
      if (title === 'Sites e lojas virtuais') expect(text(card)).toContain('A partir de R$ 2.000');
      else expect(text(card)).not.toContain('R$');
    }
  });

  it.each(PROMISES)('traz o compromisso: %s', (promise) => {
    expect(body).toContain(promise);
  });

  it('apresenta quem está por trás', () => {
    expect(text(doc.querySelector('#quem-esta-por-tras'))).toContain('Ian Langkammer');
  });
});

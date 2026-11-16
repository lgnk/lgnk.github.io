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

  it('nenhum preço no site (decisão do Ian)', () => {
    for (const path of ['/', '/privacidade/']) {
      const t = text(page(path).body);
      expect(t, path).not.toMatch(/R\$/);
      expect(t, path).not.toMatch(/a partir de/i);
    }
  });

  it('os quatro serviços continuam, sem preço', () => {
    const cards = [...doc.querySelectorAll('#servicos li')];
    expect(cards.length).toBe(4);
    expect(doc.querySelector('#servicos .price')).toBeNull();
  });

  it('quanto custa: proposta por escrito depois de uma conversa, sem número', () => {
    expect(body).toContain('Depende do que você precisa.');
  });

  it.each(PROMISES)('traz o compromisso: %s', (promise) => {
    expect(body).toContain(promise);
  });

  it('apresenta quem está por trás', () => {
    expect(text(doc.querySelector('#quem-esta-por-tras'))).toContain('Ian Langkammer');
  });
});

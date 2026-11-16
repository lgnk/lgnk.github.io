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
    expect(text(h1s[0])).toBe('Menos fila, menos planilha, mais venda.');
  });

  it('tem as seções na ordem aprovada', () => {
    const ids = [...doc.querySelectorAll('section[id], footer[id]')].map((el) => el.id);
    expect(ids).toEqual(['topo', 'servicos', 'trabalhos', 'como-trabalhamos', 'orcamento', 'quem-esta-por-tras', 'perguntas', 'contato']);
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

  it('cada serviço abre com o seu ícone de pixel, decorativo', () => {
    const cards = [...doc.querySelectorAll('#servicos li')];
    const icons = cards.map((li) => li.firstElementChild);
    for (const icon of icons) {
      expect(icon?.tagName.toLowerCase()).toBe('svg');
      expect(icon?.getAttribute('class')).toContain('service-icon');
      expect(icon?.getAttribute('aria-hidden')).toBe('true');
    }
    expect(new Set(icons.map((i) => i?.innerHTML)).size).toBe(4);
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

  it('quem está por trás tem a foto do Ian, otimizada, e diz que você fala direto com ele', () => {
    const about = doc.querySelector('#quem-esta-por-tras')!;
    expect(about.querySelector('.monogram')).toBeNull();
    const img = about.querySelector('img.photo')!;
    expect(img.getAttribute('alt')).toContain('Ian Langkammer');
    expect(img.getAttribute('src')).toMatch(/\.webp$/);
    expect(img.getAttribute('srcset')).toMatch(/\d+w/);
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(text(about)).toContain('você fala direto comigo');
  });

  it('serviços falam do problema resolvido, com saída para quem não sabe o que precisa', () => {
    const servicos = doc.querySelector('#servicos')!;
    expect(text(servicos.querySelector('h2'))).toBe('O que a gente resolve.');
    expect([...servicos.querySelectorAll('li h3')].map(text)).toEqual(['Sistema sob medida', 'App e maquininha', 'Site e loja virtual', 'Manutenção']);
    expect(text(servicos)).toContain('Não sabe se precisa de site, app ou sistema?');
    expect(text(servicos.querySelector('a[href="#orcamento"]'))).toBe('Montar meu orçamento →');
  });

  it('FAQ acolhe quem não sabe o que precisa', () => {
    expect(body).toContain('Não sei se preciso de site, app ou sistema.');
  });

  it('rodapé chama para contar o problema, sem supor que a pessoa precisa de um sistema', () => {
    const footer = doc.querySelector('footer#contato')!;
    expect(text(footer.querySelector('h2'))).toBe('Conta o que está travando.');
    expect(text(footer)).toContain('A gente responde em até 1 dia útil.');
  });

  it('sem a faixa de números', () => {
    expect(doc.querySelector('#provas')).toBeNull();
  });
});

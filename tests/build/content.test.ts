import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, page, text } from './helpers';

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
    expect(ids).toEqual(['topo', 'servicos', 'trabalhos', 'clientes', 'como-trabalhamos', 'orcamento', 'quem-esta-por-tras', 'perguntas', 'contato']);
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

  it('cada passo do processo abre com o seu ícone de pixel', () => {
    const icons = [...doc.querySelectorAll('#como-trabalhamos li')].map((li) => li.firstElementChild);
    expect(icons).toHaveLength(4);
    for (const icon of icons) {
      expect(icon?.tagName.toLowerCase()).toBe('svg');
      expect(icon?.getAttribute('class')).toContain('pixel-icon');
      expect(icon?.getAttribute('aria-hidden')).toBe('true');
    }
    expect(new Set(icons.map((i) => i?.innerHTML)).size).toBe(4);
  });

  it('cada pergunta frequente tem o seu ícone, sem mudar o texto da pergunta', () => {
    const dts = [...doc.querySelectorAll('#perguntas dt')];
    expect(dts).toHaveLength(5);
    const icons = dts.map((dt) => dt.querySelector('svg.pixel-icon'));
    for (const icon of icons) expect(icon?.getAttribute('aria-hidden')).toBe('true');
    expect(new Set(icons.map((i) => i?.innerHTML)).size).toBe(5);
    expect(dts.map(text)).toEqual([
      'Quanto custa?',
      'Quanto tempo leva?',
      'O sistema fica meu?',
      'Não sei se preciso de site, app ou sistema.',
      'E se der problema depois?',
    ]);
  });

  it('clientes e integrações: quem já contou com a gente e com quem a gente já integrou', () => {
    const sec = doc.querySelector('#clientes')!;
    expect(text(sec.querySelector('h2'))).toBe('Quem já contou com a gente.');
    const clients = [...sec.querySelectorAll('.clients li strong')].map(text);
    for (const c of ['Beerpass Club', 'Inka Boxe', 'Pedro Porto Studios', 'Silver Schuffner', 'JM Calçados', 'Shelflix', 'Heineken']) expect(clients).toContain(c);
    expect(clients).not.toContain('Avance Trainer');
    const integrations = [...sec.querySelectorAll('.integrations li')].map(text);
    for (const i of ['Stone', 'PagBank', 'Mercado Pago', 'Stripe', 'Pagar.me', 'Safe2Pay', 'Asaas', 'Focus NFe', 'Melhor Envio', 'WhatsApp', 'OneSignal', 'Resend', 'OpenAI', 'Google Gemini', 'Claude'])
      expect(integrations).toContain(i);
    expect(integrations).not.toContain('Paystore');
    expect([...sec.querySelectorAll('.group-name')].map(text)).toEqual([
      'Pagamentos e maquininhas',
      'Nota fiscal e frete',
      'Mensagens e avisos',
      'Inteligência artificial',
    ]);
    expect(sec.querySelectorAll('[data-reveal]').length).toBeGreaterThan(0);
  });

  it('cada cliente e cada integração tem a logo em SVG, limpa e publicada', () => {
    const sec = doc.querySelector('#clientes')!;
    const items = [...sec.querySelectorAll('.clients li, .integrations li')];
    expect(items.length).toBe(7 + 15);
    for (const li of items) {
      const src = li.querySelector('img')?.getAttribute('src') ?? '';
      expect(src, text(li)).toMatch(/^\/logos\/[a-z0-9-]+\.svg$/);
      const svg = readFileSync(join(DIST, src), 'utf8');
      expect(svg, src).toContain('viewBox=');
      expect(svg, src).not.toMatch(/<script|\son\w+=|javascript:|foreignObject/i);
    }
  });

  it('logo do PagBank em tom único: só o contorno do símbolo e o nome, sem as áreas coloridas que viravam mancha preta', () => {
    const svg = readFileSync(join(DIST, 'logos', 'pagbank.svg'), 'utf8');
    expect(svg).not.toMatch(/#(ffe72d|dde05b|9ed5d6)/i);
    expect((svg.match(/<path\b/g) ?? []).length).toBe(2);
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

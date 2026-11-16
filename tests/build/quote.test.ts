import { describe, it, expect } from 'vitest';
import { page, text } from './helpers';
import { QUOTE_TEMPLATE } from '../../src/lib/quote';

const home = page('/');
const section = home.querySelector('#orcamento')!;

describe('seção de orçamento', () => {
  it('vem logo depois de "como trabalhamos", com título claro', () => {
    const ids = [...home.querySelectorAll('section[id]')].map((s) => s.id);
    expect(ids.indexOf('orcamento')).toBe(ids.indexOf('como-trabalhamos') + 1);
    expect(text(section.querySelector('h2'))).toBe('Peça seu orçamento pelo WhatsApp');
  });

  it('o botão abre o WhatsApp com o roteiro em branco mesmo sem JavaScript', () => {
    const send = section.querySelector('a[data-whatsapp-quote]')!;
    expect(text(send)).toContain('Enviar pelo WhatsApp');
    expect(send.getAttribute('target')).toBe('_blank');
    expect(send.getAttribute('rel')).toContain('noopener');
    const href = send.getAttribute('href')!;
    expect(href.startsWith('https://wa.me/5531982561619?text=')).toBe(true);
    expect(decodeURIComponent(href.split('?text=')[1])).toBe(QUOTE_TEMPLATE);
  });

  it('o montador tem perguntas com rótulo e só aparece com JavaScript', () => {
    const builder = section.querySelector('[data-quote-builder]')!;
    expect(builder.hasAttribute('hidden')).toBe(true);
    expect([...builder.querySelectorAll('legend')].map(text)).toEqual([
      'O que você precisa?',
      'O que mais atrapalha hoje?',
      'Pra quando?',
    ]);
    expect(builder.querySelectorAll('input[name="need"][type="radio"]').length).toBe(5);
    expect(builder.querySelectorAll('input[name="pains"][type="checkbox"]').length).toBe(5);
    expect(builder.querySelectorAll('input[name="when"][type="radio"]').length).toBe(4);
    const business = builder.querySelector('input[name="business"]')!;
    expect(builder.querySelector(`label[for="${business.id}"]`)).not.toBeNull();
  });

  it('traz as garantias e os preços num lugar só', () => {
    const body = text(section);
    for (const s of ['Resposta em até 1 dia útil', 'Sem compromisso', 'a partir de R$ 2.000', 'por escrito', 'Você fala direto com quem constrói']) {
      expect(body).toContain(s);
    }
  });
});

describe('chamadas para o orçamento', () => {
  it('depois dos cases: "Quer algo assim"', () => {
    const cta = home.querySelector('#trabalhos a[href="#orcamento"]');
    expect(text(cta)).toBe('Pedir orçamento →');
  });

  it('no topo, o segundo botão leva ao orçamento', () => {
    expect(text(home.querySelector('#topo a[href="#orcamento"]'))).toBe('Montar meu orçamento ↓');
  });

  it('barra fixa do celular vem escondida e leva ao orçamento', () => {
    const bar = home.querySelector('[data-quote-bar]')!;
    expect(bar.hasAttribute('hidden')).toBe(true);
    expect(text(bar.querySelector('a[href="#orcamento"]'))).toBe('Pedir orçamento →');
  });

  it('todos os botões de WhatsApp falam igual', () => {
    const labels = [...home.querySelectorAll('a[data-whatsapp]')].map((a) => text(a).replace(' (abre o WhatsApp em nova aba)', ''));
    expect(labels).toEqual(['WhatsApp →', 'Conversar no WhatsApp →', 'Conversar no WhatsApp →']);
  });
});

describe('privacidade com o montador', () => {
  it('explica que nada do montador é enviado para a LGNK', () => {
    const body = text(page('/privacidade/').querySelector('main'));
    expect(body).not.toContain('O site não tem formulários');
    expect(body).toContain('nada do que você marca ou escreve é enviado para nós');
  });
});

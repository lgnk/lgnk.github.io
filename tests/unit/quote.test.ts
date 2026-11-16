import { describe, it, expect } from 'vitest';
import { QUOTE_OPTIONS, QUOTE_TEMPLATE, quoteMessage, quoteUrl } from '../../src/lib/quote';

describe('montador de orçamento', () => {
  it('opções na ordem combinada', () => {
    expect(QUOTE_OPTIONS.need).toEqual(['Sistema sob medida', 'App ou integração', 'Site ou loja virtual', 'Manutenção', 'Ainda não sei']);
    expect(QUOTE_OPTIONS.pains).toEqual(['Perco venda ou pedido', 'Atendimento demora', 'Tudo no papel ou planilha', 'Cobrança e pagamento', 'Outra coisa']);
    expect(QUOTE_OPTIONS.when).toEqual(['Quanto antes', 'Este mês', 'Nos próximos meses', 'Só pesquisando']);
  });

  it('sem escolhas: só o pedido de orçamento', () => {
    expect(quoteMessage({ pains: [] })).toBe('Olá! Vim pelo site da LGNK e quero um orçamento.');
  });

  it('com escolhas: uma linha por resposta, na ordem', () => {
    expect(
      quoteMessage({ need: 'Site ou loja virtual', pains: ['Perco venda ou pedido', 'Cobrança e pagamento'], business: '  distribuidora de bebidas  ', when: 'Este mês' }),
    ).toBe(
      [
        'Olá! Vim pelo site da LGNK e quero um orçamento.',
        '• Preciso de: Site ou loja virtual',
        '• Meu negócio: distribuidora de bebidas',
        '• O que mais atrapalha: Perco venda ou pedido, Cobrança e pagamento',
        '• Prazo: Este mês',
      ].join('\n'),
    );
  });

  it('pula o que ficou em branco e limita o texto livre', () => {
    const msg = quoteMessage({ pains: [], business: 'x'.repeat(200) });
    expect(msg.split('\n')).toHaveLength(2);
    expect(msg.split('\n')[1]).toBe(`• Meu negócio: ${'x'.repeat(80)}`);
  });

  it('roteiro em branco para quem está sem JavaScript', () => {
    expect(QUOTE_TEMPLATE).toBe(
      'Olá! Vim pelo site da LGNK e quero um orçamento.\n• Preciso de: \n• Meu negócio: \n• O que mais atrapalha: \n• Prazo: ',
    );
  });

  it('vira link do WhatsApp com a mensagem codificada', () => {
    const url = quoteUrl('5531982561619', { need: 'Manutenção', pains: [] });
    expect(url.startsWith('https://wa.me/5531982561619?text=')).toBe(true);
    expect(decodeURIComponent(url.split('?text=')[1])).toBe('Olá! Vim pelo site da LGNK e quero um orçamento.\n• Preciso de: Manutenção');
  });
});

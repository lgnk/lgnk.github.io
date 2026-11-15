import { describe, it, expect } from 'vitest';
import { whatsappUrl } from '../../src/lib/whatsapp';

describe('whatsappUrl', () => {
  it('monta o link wa.me com a mensagem codificada', () => {
    expect(whatsappUrl('5531999998888', 'Olá! Vim pelo site da LGNK.'))
      .toBe('https://wa.me/5531999998888?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20LGNK.');
  });

  it.each(['(31) 99999-8888', '31999998888', '+5531999998888', ''])('recusa número fora do padrão: %s', (n) => {
    expect(() => whatsappUrl(n, 'x')).toThrow('Número de WhatsApp inválido');
  });
});

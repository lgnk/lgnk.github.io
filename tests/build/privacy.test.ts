import { describe, it, expect } from 'vitest';
import { page, allHtml, text } from './helpers';

describe('política de privacidade', () => {
  const doc = page('/privacidade/');

  it('existe e explica o essencial', () => {
    expect(text(doc.querySelector('h1'))).toBe('Política de privacidade');
    const body = text(doc.querySelector('main'));
    for (const s of ['Microsoft Clarity', 'contato@lgnk.com.br', 'Langkammer Sistemas LTDA', 'Preferências de cookies', 'Atualizada em 15 de novembro de 2026.']) {
      expect(body).toContain(s);
    }
    expect(doc.querySelector('main a[href="/"]')).not.toBeNull();
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://lgnk.com.br/privacidade/');
  });
});

describe('banner de cookies', () => {
  const doc = page('/');

  it('vem escondido no HTML, com aceitar e recusar', () => {
    const banner = doc.querySelector('#consent');
    expect(banner).not.toBeNull();
    expect(banner!.hasAttribute('hidden')).toBe(true);
    expect(text(banner)).toContain('Usamos cookies do Microsoft Clarity para entender como o site é usado e melhorá-lo. Você pode recusar.');
    expect(text(banner!.querySelector('button[data-consent="granted"]'))).toBe('Aceitar');
    expect(text(banner!.querySelector('button[data-consent="denied"]'))).toBe('Recusar');
    expect(banner!.querySelector('a[href="/privacidade/"]')).not.toBeNull();
  });

  it('não carrega o Clarity enquanto não houver ID', () => {
    for (const html of allHtml()) expect(html).not.toContain('clarity.ms');
  });
});

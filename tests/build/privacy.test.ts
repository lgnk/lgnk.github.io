import { describe, it, expect } from 'vitest';
import { page, allHtml, text } from './helpers';
import { site } from '../../src/config';

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

  it('diz que o Clarity só carrega depois do aceite e aponta a política da Microsoft', () => {
    const body = text(doc.querySelector('main'));
    expect(body).toContain('O Clarity só é carregado depois que você toca em “Aceitar”.');
    expect(doc.querySelector('main a[href="https://www.microsoft.com/pt-br/privacy/privacystatement"]')).not.toBeNull();
  });

  it('não faz promessas que não foram confirmadas', () => {
    const body = text(doc.querySelector('main'));
    expect(body).not.toContain('Não vendemos');
    expect(body).not.toContain('só para responder');
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

  it('marca o ID do Clarity no HTML só quando ele existe', () => {
    const attr = doc.documentElement.getAttribute('data-clarity-id');
    if (site.clarityId) expect(attr).toBe(site.clarityId);
    else expect(attr).toBeNull();
  });

  it('nunca traz a tag do Clarity pronta no HTML (ela só entra depois do aceite)', () => {
    for (const html of allHtml()) expect(html).not.toMatch(/<script[^>]*src="https:\/\/www\.clarity\.ms/);
  });
});

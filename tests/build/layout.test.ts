import { describe, it, expect } from 'vitest';
import { page, allHtml, text } from './helpers';

describe('layout da home', () => {
  const doc = page('/');

  it('está em português do Brasil', () => {
    expect(doc.documentElement.getAttribute('lang')).toBe('pt-BR');
  });

  it('tem título e descrição', () => {
    expect(text(doc.querySelector('title'))).toBe('LGNK Sistemas · Software sob medida para pequenas e médias empresas');
    expect(doc.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Sistemas, apps e sites sob medida para pequenas e médias empresas pararem de perder venda: pedidos, estoque, maquininha e Pix num lugar só. Belo Horizonte, MG.',
    );
  });

  it('tem canonical e imagem de compartilhamento absolutas', () => {
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://lgnk.com.br/');
    expect(doc.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe('https://lgnk.com.br/og.png');
    expect(doc.querySelector('meta[property="og:image:alt"]')?.getAttribute('content')).toBe(
      'LGNK Sistemas — Menos fila, menos planilha, mais venda.',
    );
  });

  it('tem dados estruturados com o CNPJ', () => {
    const json = doc.querySelector('script[type="application/ld+json"]')?.textContent ?? '';
    expect(JSON.parse(json).taxID).toBe('50.326.062/0001-66');
  });

  it('rodapé identifica a empresa', () => {
    const footer = doc.querySelector('footer#contato');
    const t = text(footer);
    for (const s of ['LGNK Sistemas', 'Langkammer Sistemas LTDA', 'CNPJ 50.326.062/0001-66', 'Belo Horizonte, MG']) {
      expect(t).toContain(s);
    }
    expect(footer?.querySelector('a[href="mailto:contato@lgnk.com.br"]')).not.toBeNull();
    expect(footer?.querySelector('a[href="/privacidade/"]')).not.toBeNull();
    const prefs = footer?.querySelector('button[data-open-consent]');
    expect(text(prefs)).toBe('Preferências de cookies');
    expect(prefs?.hasAttribute('hidden')).toBe(true); // só aparece com JavaScript e Clarity configurado
  });

  it('rodapé não mostra Instagram enquanto ele não existe', () => {
    const footer = doc.querySelector('footer#contato');
    expect(footer?.querySelector('a[href*="instagram.com"]')).toBeNull();
    expect(text(footer)).not.toMatch(/(^|\s)@lgnk\b/);
  });

  it('todos os botões de WhatsApp apontam para o mesmo link wa.me em nova aba', () => {
    const links = [...doc.querySelectorAll('a[data-whatsapp]')];
    expect(links.length).toBeGreaterThanOrEqual(2);
    const hrefs = new Set(links.map((a) => a.getAttribute('href')));
    expect(hrefs.size).toBe(1);
    expect([...hrefs][0]).toMatch(/^https:\/\/wa\.me\//);
    for (const a of links) {
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toContain('noopener');
    }
  });
});

describe('todas as páginas', () => {
  it('não apontam para a conta pessoal nem usam a marca antiga ou Google Fonts', () => {
    for (const html of allHtml()) {
      expect(html).not.toMatch(/(href|src)="[^"]*ianlgnk/);
      expect(html).not.toContain('Ian LGNK Consultoria');
      expect(html).not.toContain('fonts.googleapis.com');
    }
  });
});

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, allHtml, page, text } from './helpers';

const home = page('/');

describe('marca nova no site', () => {
  it('só Inter Tight e JetBrains Mono', () => {
    const css = readdirSync(join(DIST, '_astro'))
      .filter((f) => f.endsWith('.css'))
      .map((f) => readFileSync(join(DIST, '_astro', f), 'utf8'))
      .join('\n');
    const html = allHtml().join('\n');
    expect(css + html).toContain('--font-mono');
    expect(html).not.toContain('Instrument');
    expect(css).not.toContain('Instrument');
  });

  it('cor do navegador é o creme', () => {
    expect(home.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#FFF8EC');
  });

  it('cabeçalho tem a nuvem e "lgnk sistemas"', () => {
    const logo = home.querySelector('header a.logo')!;
    expect(logo.getAttribute('aria-label')).toBe('LGNK Sistemas — início');
    expect(logo.querySelector('svg')).not.toBeNull();
    expect(text(logo)).toBe('lgnk sistemas');
  });

  it('destaque do título é marca-texto', () => {
    expect(text(home.querySelector('h1 mark'))).toBe('aguentam');
  });

  it('topo tem subtítulo novo, os dois botões e o mascote', () => {
    const topo = home.querySelector('#topo')!;
    expect(text(topo)).toContain('a gente automatiza a operação para você parar de perder venda.');
    expect(topo.querySelector('a[data-whatsapp]')).not.toBeNull();
    expect(text(topo.querySelector('a[href="#trabalhos"]'))).toBe('Ver trabalhos');
    expect(topo.querySelector('svg[role="img"]')).not.toBeNull();
  });

  it.each([
    ['servicos', '// o que fazemos'],
    ['trabalhos', '// trabalhos'],
    ['como-trabalhamos', '// processo'],
    ['quem-esta-por-tras', '// quem está por trás'],
    ['perguntas', '// perguntas frequentes'],
  ])('rótulo de %s é comentário de código', (id, label) => {
    const el = home.querySelector(`#${id} .label`)!;
    expect(text(el)).toBe(label);
    expect(el.querySelector('span[aria-hidden="true"]')?.textContent).toBe('// ');
  });
});

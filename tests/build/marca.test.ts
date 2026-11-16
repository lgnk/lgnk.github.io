import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DIST, page } from './helpers';

const repo = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const pngSize = (file: string) => {
  const b = readFileSync(file);
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
};

describe('arquivos da marca', () => {
  it('favicon é a nuvem parada sobre amarelo', () => {
    const svg = readFileSync(join(DIST, 'favicon.svg'), 'utf8');
    expect(svg).toContain('crispEdges');
    expect(svg).toContain('#FFD23F');
    expect(svg).not.toContain('<animate');
  });

  it('favicon recortado na grade: 1 pixel da nuvem = 1 px em 16 px (os olhos não somem)', () => {
    expect(readFileSync(join(DIST, 'favicon.svg'), 'utf8')).toContain('viewBox="12 15 96 96"');
  });

  it('símbolo, avatar e logo publicados', () => {
    expect(readFileSync(join(DIST, 'marca', 'simbolo.svg'), 'utf8')).toContain('viewBox="0 0 120 120"');
    expect(readFileSync(join(DIST, 'marca', 'avatar.svg'), 'utf8')).toContain('#FFD23F');
    const proc = readFileSync(join(DIST, 'marca', 'simbolo-processando.svg'), 'utf8');
    expect(proc).toContain('data-state="proc"');
    expect(proc).not.toContain('<animate');
    const logo = readFileSync(join(DIST, 'marca', 'logo.svg'), 'utf8');
    expect(logo).toContain('>lgnk<');
    expect(logo).toContain('>sistemas<');
  });

  it('cada ícone de pixel do site também sai como arquivo da marca', () => {
    for (const name of ['sistema', 'maquininha', 'loja', 'manutencao', 'conversa', 'proposta', 'construcao', 'entrega', 'custo', 'tempo', 'dono', 'caminho', 'escudo']) {
      const svg = readFileSync(join(DIST, 'marca', `icone-${name}.svg`), 'utf8');
      expect(svg, name).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(svg, name).toContain('shape-rendering="crispEdges"');
    }
  });

  it('PNGs da marca nos tamanhos certos', () => {
    expect(pngSize(repo('marca/avatar-1024.png'))).toEqual([1024, 1024]);
    expect(existsSync(repo('marca/logo.png'))).toBe(true);
    expect(pngSize(repo('marca/whatsapp-capa-empresa.png'))).toEqual([2422, 1362]);
  });

  it('o cabeçalho aponta o favicon', () => {
    expect(page('/').querySelector('link[rel="icon"]')?.getAttribute('href')).toBe('/favicon.svg');
  });
});

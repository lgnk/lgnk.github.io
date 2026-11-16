import { describe, it, expect } from 'vitest';
import { SERVICE_ICONS, PROCESS_ICONS, FAQ_ICONS, PIXEL_ICONS, pixelIconSvg, type PixelIcon } from '../../src/lib/icons';
import { PALETTE } from '../../src/lib/palette';

const NAMES = Object.keys(PIXEL_ICONS) as PixelIcon[];

describe('ícones de pixel', () => {
  it('um para cada serviço, cada passo do processo e cada pergunta', () => {
    expect(Object.keys(SERVICE_ICONS)).toEqual(['sistema', 'maquininha', 'loja', 'manutencao']);
    expect(Object.keys(PROCESS_ICONS)).toEqual(['conversa', 'proposta', 'construcao', 'entrega']);
    expect(Object.keys(FAQ_ICONS)).toEqual(['custo', 'tempo', 'dono', 'caminho', 'escudo']);
    expect(NAMES).toHaveLength(13);
  });

  it('nenhum desenho repetido', () => {
    const drawings = NAMES.map((n) => PIXEL_ICONS[n].join(''));
    expect(new Set(drawings).size).toBe(NAMES.length);
  });

  it('cada desenho é uma grade de 16×16 só com as cores da paleta', () => {
    for (const name of NAMES) {
      const rows = PIXEL_ICONS[name];
      expect(rows, name).toHaveLength(16);
      for (const row of rows) expect(row, name).toMatch(/^[.pPlyckw]{16}$/);
    }
  });

  it('o SVG é decorativo, nítido e no quadro de 16', () => {
    const svg = pixelIconSvg('loja', 'service-icon');
    expect(svg).toMatch(/^<svg /);
    expect(svg).toContain('viewBox="0 0 16 16"');
    expect(svg).toContain('shape-rendering="crispEdges"');
    expect(svg).toContain('aria-hidden="true"');
    expect(svg).toContain('focusable="false"');
    expect(svg).toContain('class="pixel-icon service-icon"');
  });

  it('pinta exatamente os pixels do desenho, com as cores da marca', () => {
    const palette = new Set<string>(Object.values(PALETTE));
    for (const name of NAMES) {
      const svg = pixelIconSvg(name);
      const fills = [...svg.matchAll(/fill="([^"]+)"/g)].map((m) => m[1]);
      for (const f of fills) expect(palette.has(f), `${name}: ${f}`).toBe(true);
      const painted = [...svg.matchAll(/h(\d+)v1/g)].reduce((n, m) => n + Number(m[1]), 0);
      const drawn = PIXEL_ICONS[name].join('').replace(/\./g, '').length;
      expect(painted, name).toBe(drawn);
    }
  });

  it('como arquivo avulso (marca/icone-*.svg) o SVG declara o namespace', () => {
    expect(pixelIconSvg('loja', '', { standalone: true })).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" /);
    expect(pixelIconSvg('loja')).not.toContain('xmlns');
  });

  it('cada cor vira um caminho só', () => {
    const svg = pixelIconSvg('sistema');
    const fills = [...svg.matchAll(/fill="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(fills).size).toBe(fills.length);
  });
});

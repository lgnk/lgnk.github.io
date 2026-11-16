import { describe, it, expect } from 'vitest';
import { SERVICE_ICONS, pixelIconSvg, type ServiceIcon } from '../../src/lib/icons';
import { PALETTE } from '../../src/lib/palette';

const NAMES = Object.keys(SERVICE_ICONS) as ServiceIcon[];

describe('ícones de pixel dos serviços', () => {
  it('um para cada serviço', () => {
    expect(NAMES).toEqual(['sistema', 'maquininha', 'loja', 'manutencao']);
  });

  it('cada desenho é uma grade de 16×16 só com as cores da paleta', () => {
    for (const name of NAMES) {
      const rows = SERVICE_ICONS[name];
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
      const drawn = SERVICE_ICONS[name].join('').replace(/\./g, '').length;
      expect(painted, name).toBe(drawn);
    }
  });

  it('cada cor vira um caminho só', () => {
    const svg = pixelIconSvg('sistema');
    const fills = [...svg.matchAll(/fill="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(fills).size).toBe(fills.length);
  });
});

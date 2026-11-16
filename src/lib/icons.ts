/**
 * Ícones dos serviços, desenhados em pixel no mesmo jeito da Nuvem Pixel: roxo com sombra roxo-escura
 * embaixo e à direita, luz roxo-clara em cima e à esquerda, e um toque de amarelo ou coral.
 * Cada desenho é uma grade de 16×16; cada letra é uma cor e o ponto é vazio.
 */

import { PALETTE } from './palette';

const COLORS: Record<string, string> = {
  p: PALETTE.purple,
  P: PALETTE.purpleInk,
  l: PALETTE.purpleLight,
  y: PALETTE.yellow,
  c: PALETTE.coral,
  k: PALETTE.ink,
  w: PALETTE.white,
};

export const SERVICE_ICONS = {
  // Painel com menu lateral e gráfico subindo.
  sistema: [
    '................',
    '.pppppppppppppP.',
    '.pcpypppppppppP.',
    '.pppppppppppppP.',
    '.pllwwwwwwwwwwP.',
    '.pllwwwwwwwwwwP.',
    '.pllwwwwwwwppwP.',
    '.pllwwwwwwwppwP.',
    '.pllwwwwccwppwP.',
    '.pllwwwwccwppwP.',
    '.pllwyywccwppwP.',
    '.pllwyywccwppwP.',
    '.pllwyywccwppwP.',
    '.pllwwwwwwwwwwP.',
    '.PPPPPPPPPPPPPP.',
    '................',
  ],
  // Maquininha soltando o comprovante.
  maquininha: [
    '.....llllll.....',
    '.....lwwwwl.....',
    '.....lkkkwl.....',
    '.....lwwwwl.....',
    '...pppppppppP...',
    '...pkkkkkkkpP...',
    '...pkyyyyykpP...',
    '...pkkkkkkkpP...',
    '...pkyykkkkpP...',
    '...pkkkkkkkpP...',
    '...pppppppppP...',
    '...plplplplpP...',
    '...pppppppppP...',
    '...plplplpcpP...',
    '...PPPPPPPPPP...',
    '................',
  ],
  // Lojinha com toldo listrado e vitrine acesa.
  loja: [
    '................',
    '.PPPPPPPPPPPPPP.',
    '.ppyyppyyppyypp.',
    '.ppyyppyyppyypp.',
    '.ppyyppyyppyypp.',
    '.PP..PP..PP..PP.',
    '..pppppppppppP..',
    '..pyyyypkkkkpP..',
    '..pyyyypkkkkpP..',
    '..pyyyypkkkkpP..',
    '..ppppppkkykpP..',
    '..ppppppkkkkpP..',
    '..ppppppkkkkpP..',
    '..PPPPPPPPPPPP..',
    '................',
    '................',
  ],
  // Chave inglesa com um brilho de coisa consertada.
  manutencao: [
    '................',
    '..........lP....',
    '...y....llpP....',
    '..yyy..lppP.....',
    '...y...lpP...lP.',
    '.......lppP.lpP.',
    '.......lppplpP..',
    '......lppppppP..',
    '.....lpppPPPP...',
    '....lpppP.......',
    '...lpppP........',
    '..lpppP.........',
    '..PppP..........',
    '...PP...........',
    '................',
    '................',
  ],
} as const satisfies Record<string, readonly string[]>;

export type ServiceIcon = keyof typeof SERVICE_ICONS;

/** SVG decorativo do ícone: um caminho por cor, juntando os pixels vizinhos da mesma linha. */
export function pixelIconSvg(name: ServiceIcon, className = ''): string {
  const paths = new Map<string, string>();
  SERVICE_ICONS[name].forEach((row, y) => {
    for (let x = 0; x < row.length; ) {
      const ch = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      if (ch !== '.') {
        const len = end - x;
        paths.set(ch, `${paths.get(ch) ?? ''}M${x} ${y}h${len}v1h-${len}z`);
      }
      x = end;
    }
  });
  const body = [...paths].map(([ch, d]) => `<path fill="${COLORS[ch]}" d="${d}"/>`).join('');
  const cls = ['pixel-icon', className].filter(Boolean).join(' ');
  return `<svg class="${cls}" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${body}</svg>`;
}

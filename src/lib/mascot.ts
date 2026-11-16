/**
 * A Nuvem Pixel, mascote da LGNK. Uma fonte só para o cabeçalho, o topo, o favicon e os arquivos da marca:
 * tudo sai desta função, que devolve o SVG em texto. Grade de 6 unidades num quadro de 120×120.
 */

export type MascotState = 'idle' | 'proc' | 'done';

export interface MascotOptions {
  /** Liga as animações SMIL (piscar, cursor, olhos varrendo, barra de carregamento, pulinho). Padrão: parado. */
  animated?: boolean;
  /** Com animações, elas só começam quando um script chamar beginElement() — sem JS, a nuvem fica parada. */
  manualStart?: boolean;
  /** Estados desenhados; cada um vira `<g class="f-<estado>">`. Padrão: só "esperando". */
  states?: MascotState[];
  /** Com título, o SVG é uma imagem com nome; sem, é decorativo (aria-hidden). */
  title?: string;
  background?: { color: string; shape: 'square' | 'circle' };
  /** Recorte do quadro. Para ícones pequenos use '12 15 96 96': cada pixel da nuvem vira 1 px em 16 px. */
  viewBox?: string;
  id?: string;
  className?: string;
}

const C = {
  purple: '#7B4DFF',
  purpleInk: '#5A30D9',
  purpleLight: '#A98BFF',
  coral: '#FF7A8A',
  yellow: '#FFD23F',
  ink: '#1B1A24',
} as const;

type Rect = [x: number, y: number, w: number, h: number, fill: string, extra?: string];

const BODY: Rect[] = [
  [36, 81, 12, 9, C.purpleInk],
  [72, 81, 12, 9, C.purpleInk],
  [42, 33, 24, 6, C.purple],
  [36, 39, 36, 6, C.purple],
  [78, 39, 18, 6, C.purple],
  [24, 45, 78, 6, C.purple],
  [18, 51, 90, 12, C.purple],
  [12, 63, 96, 12, C.purple],
  [18, 75, 84, 6, C.purpleInk],
  [102, 63, 6, 12, C.purpleInk],
  [90, 45, 12, 6, C.purpleInk, 'opacity=".55"'],
  [42, 39, 12, 6, C.purpleLight],
  [30, 45, 12, 6, C.purpleLight],
  [24, 51, 6, 6, C.purpleLight],
  [30, 69, 12, 6, C.coral],
  [78, 69, 12, 6, C.coral],
];

const rect = ([x, y, w, h, fill, extra]: Rect, inner = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra ? ` ${extra}` : ''}${
    inner ? `>${inner}</rect>` : '/>'
  }`;

const anim = (attr: string, values: string, dur: string, more = '') =>
  `<animate attributeName="${attr}" values="${values}" dur="${dur}"${more} repeatCount="indefinite"/>`;

function idle(animated: boolean): string {
  const blink = animated
    ? anim('height', '12;12;3;12', '3.4s', ' keyTimes="0;.9;.95;1"') + anim('y', '57;57;63;57', '3.4s', ' keyTimes="0;.9;.95;1"')
    : '';
  const cursor = animated ? anim('opacity', '1;1;0;0', '1.1s', ' keyTimes="0;.5;.5;1"') : '';
  return (
    rect([42, 57, 6, 12, C.ink], blink) + rect([72, 57, 6, 12, C.ink], blink) + rect([54, 69, 12, 6, C.yellow], cursor)
  );
}

function proc(animated: boolean): string {
  const scan = (from: number) => (animated ? anim('x', `${from};${from + 6};${from}`, '.6s', ' calcMode="discrete"') : '');
  const dot = (values: string) => (animated ? anim('opacity', values, '.9s') : '');
  const bar = animated ? anim('width', '0;6;12;18;24;30;36', '1.2s', ' calcMode="discrete"') : '';
  return (
    rect([40, 60, 6, 6, C.ink], scan(40)) +
    rect([70, 60, 6, 6, C.ink], scan(70)) +
    rect([48, 70, 5, 5, C.yellow], dot('1;.2;.2')) +
    rect([57, 70, 5, 5, C.yellow], dot('.2;1;.2')) +
    rect([66, 70, 5, 5, C.yellow], dot('.2;.2;1')) +
    rect([40, 18, 40, 9, C.ink]) +
    rect([42, 20, animated ? 0 : 24, 5, C.yellow], bar)
  );
}

function done(): string {
  const eyes: Rect[] = [
    [36, 63, 6, 6, C.ink],
    [42, 57, 6, 6, C.ink],
    [48, 63, 6, 6, C.ink],
    [66, 63, 6, 6, C.ink],
    [72, 57, 6, 6, C.ink],
    [78, 63, 6, 6, C.ink],
  ];
  const smile: Rect[] = [
    [50, 70, 5, 4, C.ink],
    [55, 74, 10, 4, C.ink],
    [65, 70, 5, 4, C.ink],
  ];
  const sparkle: Rect[] = [
    [100, 22, 4, 12, C.yellow],
    [96, 26, 12, 4, C.yellow],
    [14, 34, 3, 9, C.yellow],
    [11, 37, 9, 3, C.yellow],
  ];
  return [...eyes, ...smile, ...sparkle].map((r) => rect(r)).join('');
}

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function mascotSvg(options: MascotOptions = {}): string {
  const { animated = false, manualStart = false, states = ['idle'], title, background, id, className, viewBox = '0 0 120 120' } = options;
  const faces: Record<MascotState, () => string> = { idle: () => idle(animated), proc: () => proc(animated), done };

  const attrs = [
    'xmlns="http://www.w3.org/2000/svg"',
    `viewBox="${escape(viewBox)}"`,
    'shape-rendering="crispEdges"',
    `class="${['mascot', className].filter(Boolean).join(' ')}"`,
    'data-state="idle"',
    id ? `id="${escape(id)}"` : '',
    title ? 'role="img"' : 'aria-hidden="true" focusable="false"',
  ].filter(Boolean);

  const bg = !background
    ? ''
    : background.shape === 'square'
      ? `<rect x="0" y="0" width="120" height="120" fill="${background.color}"/>`
      : `<circle cx="60" cy="60" r="60" fill="${background.color}"/>`;

  const bounce = animated
    ? '<animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0;0 0" keyTimes="0;.2;.4;1" dur="1.6s" calcMode="discrete" repeatCount="indefinite"/>'
    : '';

  const body = BODY.map((r) => rect(r)).join('');
  const groups = states.map((s) => `<g class="f-${s}">${faces[s]()}</g>`).join('');

  const svg = `<svg ${attrs.join(' ')}>${title ? `<title>${escape(title)}</title>` : ''}${bg}<g>${bounce}${body}${groups}</g></svg>`;
  return manualStart ? svg.replace(/<animate(Transform)? /g, (tag) => `${tag}begin="indefinite" `) : svg;
}

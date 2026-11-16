import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../src/styles/global.css', import.meta.url), 'utf8');
const root = css.match(/:root\s*{([^}]*)}/)?.[1] ?? '';
const tokens: Record<string, string> = Object.fromEntries(
  [...root.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [m[1], m[2]]),
);

const TOKENS = {
  '--cream': '#FFF8EC',
  '--ink': '#1B1A24',
  '--muted': '#5E5A6B',
  '--purple': '#7B4DFF',
  '--purple-ink': '#5A30D9',
  '--purple-light': '#A98BFF',
  '--yellow': '#FFD23F',
  '--coral': '#FF7A8A',
  '--footer-small': '#B9B3C4',
};

/** Hex de um token (ou o próprio hex). */
const resolve = (v: string) => (v.startsWith('#') ? v : tokens[v] ?? '');

/** Contraste WCAG 2 entre duas cores hex. */
function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

describe('paleta Fliperama', () => {
  it('tem os tokens da paleta', () => {
    for (const [k, v] of Object.entries(TOKENS)) expect(tokens[k]?.toUpperCase(), k).toBe(v);
  });

  it.each([
    ['--ink', '--cream'],
    ['--muted', '--cream'],
    ['--purple-ink', '--cream'],
    ['#FFFFFF', '--purple'],
    ['--ink', '--yellow'],
    ['--cream', '--ink'],
    ['--yellow', '--ink'],
    ['--footer-small', '--ink'],
  ])('texto %s sobre %s passa AA', (fg, bg) => {
    expect(contrast(resolve(fg), resolve(bg))).toBeGreaterThanOrEqual(4.5);
  });
});

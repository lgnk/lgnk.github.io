import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, page, text } from './helpers';

const home = page('/');

describe('topo animado', () => {
  it('canvas decorativo, mascote nomeado, legenda decorativa', () => {
    expect(home.querySelector('#heroStage canvas[aria-hidden="true"]')).not.toBeNull();
    expect(text(home.querySelector('#heroMascot title'))).toBe('Mascote da LGNK, uma nuvem de pixels');
    expect(home.querySelector('#heroStage .hero-label[aria-hidden="true"]')).not.toBeNull();
  });

  it('o script do topo é pequeno e só entra na página inicial', () => {
    const astro = join(DIST, '_astro');
    const files = readdirSync(astro).filter(
      (f) => f.endsWith('.js') && readFileSync(join(astro, f), 'utf8').includes('heroStage'),
    );
    const inline = [...home.querySelectorAll('script')]
      .map((s) => s.textContent ?? '')
      .filter((t) => t.includes('heroStage'));
    expect(files.length + inline.length).toBeGreaterThan(0);
    for (const f of files) expect(statSync(join(astro, f)).size).toBeLessThan(15000);
    for (const t of inline) expect(t.length).toBeLessThan(15000);
    const priv = readFileSync(join(DIST, 'privacidade', 'index.html'), 'utf8');
    expect(priv).not.toContain('heroStage');
    for (const f of files) expect(priv).not.toContain(f);
  });
});

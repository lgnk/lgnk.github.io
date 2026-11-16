import { describe, it, expect } from 'vitest';
import { mascotSvg } from '../../src/lib/mascot';

describe('mascotSvg', () => {
  it('padrão: estático, decorativo, só "esperando"', () => {
    const s = mascotSvg();
    expect(s.startsWith('<svg')).toBe(true);
    expect(s).toContain('viewBox="0 0 120 120"');
    expect(s).toContain('shape-rendering="crispEdges"');
    expect(s).toContain('aria-hidden="true"');
    expect(s).not.toContain('<animate');
    expect(s).toContain('class="f-idle"');
    expect(s).not.toContain('f-proc');
    expect(s).toContain('#7B4DFF');
    expect(s).toContain('data-state="idle"');
  });

  it('animado com os três estados e nome', () => {
    const s = mascotSvg({
      animated: true,
      states: ['idle', 'proc', 'done'],
      title: 'Mascote da LGNK, uma nuvem de pixels',
      id: 'heroMascot',
    });
    expect(s).toContain('role="img"');
    expect(s).toContain('<title>Mascote da LGNK, uma nuvem de pixels</title>');
    expect(s).toContain('<animate');
    expect(s).toContain('class="f-proc"');
    expect(s).toContain('class="f-done"');
    expect(s).toContain('id="heroMascot"');
    expect(s).not.toContain('aria-hidden');
  });

  it('com partida manual, nenhuma animação começa sozinha (sem JS o mascote fica parado)', () => {
    const s = mascotSvg({ animated: true, manualStart: true, states: ['idle', 'proc', 'done'] });
    const anims = s.match(/<animate(Transform)?\b[^>]*>/g) ?? [];
    expect(anims.length).toBeGreaterThan(0);
    for (const a of anims) expect(a).toContain('begin="indefinite"');
  });

  it('escapa classe e cor de fundo', () => {
    const s = mascotSvg({ className: 'a"b', background: { color: '#fff" onload="x', shape: 'square' } });
    expect(s).toContain('class="mascot a&quot;b"');
    expect(s).toContain('fill="#fff&quot; onload=&quot;x"');
    expect(s).not.toContain('onload="x"');
  });

  it('escapa o título', () => {
    expect(mascotSvg({ title: 'a < b & "c"' })).toContain('<title>a &lt; b &amp; &quot;c&quot;</title>');
  });

  it('fundo amarelo quadrado ocupa o quadro todo', () => {
    expect(mascotSvg({ background: { color: '#FFD23F', shape: 'square' } })).toMatch(
      /<rect[^>]*width="120"[^>]*height="120"[^>]*fill="#FFD23F"/,
    );
  });

  it('fundo em círculo', () => {
    expect(mascotSvg({ background: { color: '#FFD23F', shape: 'circle' } })).toMatch(/<circle[^>]*r="60"[^>]*fill="#FFD23F"/);
  });
});

/**
 * Topo animado: a bagunça do dia a dia entra em fios na cabeça da Nuvem Pixel, ela processa,
 * e sai tudo organizado pela direita. Canvas 2D sem dependências; o mascote é o SVG do HTML.
 */
import { bezier, nextState, particleBudget, streamYs } from '../lib/flow';
import type { MascotState } from '../lib/mascot';

const C = {
  ink: '#1B1A24',
  purple: '#7B4DFF',
  purpleLight: '#A98BFF',
  yellow: '#FFD23F',
  coral: '#FF7A8A',
  white: '#FFFFFF',
};
const IN_COLORS = [C.purple, C.purpleLight, C.yellow, C.coral, C.ink];
const SIZES = [2, 2, 3, 3, 4, 5];
const INS = ['pedido #312', 'Pix recebido', 'nova mensagem', 'estoque?', 'planilha.xlsx', 'agenda', 'maquininha', 'cliente esperando'];
const OUTS = ['venda ✓', 'cliente avisado ✓', 'estoque em dia ✓', 'relatório pronto ✓', 'nota emitida ✓'];
const LANES = [-0.34, -0.17, 0, 0.17, 0.34];
const STREAMS = 18;
const CHIP_EVERY = 1500;
const LABELS: Record<MascotState, string> = { idle: 'esperando pedidos_', proc: 'processando…', done: 'pronto! ✓' };

interface Curve { x0: number; y0: number; c1x: number; c1y: number; c2x: number; c2y: number; x3: number; y3: number }
interface Particle extends Curve { kind: 'in' | 'out'; t: number; sp: number; s: number; col: string }
interface Chip extends Curve { kind: 'in' | 'out'; text: string; t: number; sp: number }
interface Ring { x: number; y: number; r: number; max: number; col: string }

const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const at = (c: Curve, t: number): [number, number] => [bezier(c.x0, c.c1x, c.c2x, c.x3, t), bezier(c.y0, c.c1y, c.c2y, c.y3, t)];

export function startHero(stage: HTMLElement): () => void {
  const canvas = stage.querySelector('canvas');
  const mascot = stage.querySelector<SVGSVGElement>('#heroMascot');
  const label = stage.querySelector<HTMLElement>('.hero-label');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !mascot || !ctx) return () => {};

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  stage.dataset.motion = reduce ? 'static' : 'full';
  stage.dataset.running = 'false';

  let W = 0, H = 0, mx = 0, my = 0, mw = 0, budget = 120;
  let font = 'system-ui, sans-serif';
  const guides = document.createElement('canvas');
  const parts: Particle[] = [];
  const chips: Chip[] = [];
  const rings: Ring[] = [];
  let state: MascotState = 'idle';
  let stateAt = 0, queued = 0, lastChip = -Infinity, raf = 0;
  let onScreen = false, pageVisible = !document.hidden;

  const setState = (s: MascotState) => {
    state = s;
    stateAt = performance.now();
    mascot.dataset.state = s;
    if (label) label.textContent = LABELS[s];
  };

  // Curvas: entram pela esquerda até a cabeça; saem retas pela direita.
  const curveIn = (y0: number, x0: number): Curve => ({
    x0, y0, c1x: W * 0.16, c1y: y0, c2x: mx - mw * 0.75, c2y: my + (y0 - my) * 0.12, x3: mx - mw * 0.18, y3: my + (y0 - my) * 0.04,
  });
  const curveOut = (k: number, start: number, extra: number): Curve => {
    const y = my + k * H;
    return { x0: mx + start, y0: my, c1x: mx + start + mw * 0.5, c1y: my, c2x: mx + (W - mx) * 0.6, c2y: y, x3: W + extra, y3: y };
  };

  function measure() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = stage.clientWidth;
    H = stage.clientHeight;
    canvas!.width = Math.round(W * dpr);
    canvas!.height = Math.round(H * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    const s = stage.getBoundingClientRect();
    const m = mascot!.getBoundingClientRect();
    mw = m.width;
    mx = m.left - s.left - stage.clientLeft + m.width / 2;
    my = m.top - s.top - stage.clientTop + m.height * 0.52;
    budget = particleBudget(W, H);
    font = `700 12px ${getComputedStyle(stage).fontFamily}`;
    // Guias pontilhadas, desenhadas uma vez por tamanho.
    guides.width = canvas!.width;
    guides.height = canvas!.height;
    const g = guides.getContext('2d')!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = C.ink;
    g.globalAlpha = 0.1;
    for (const y of streamYs(STREAMS, H)) {
      const c = curveIn(y, -8);
      for (let t = 0; t < 0.96; t += 0.018) { const [x, yy] = at(c, t); g.fillRect(Math.round(x), Math.round(yy), 2, 2); }
    }
    for (const k of LANES) {
      const c = curveOut(k, mw * 0.3, 8);
      for (let t = 0.04; t < 1; t += 0.02) { const [x, yy] = at(c, t); g.fillRect(Math.round(x), Math.round(yy), 2, 2); }
    }
  }

  const spawnIn = (t = 0) => {
    const y0 = pick(streamYs(STREAMS, H)) + (Math.random() - 0.5) * 4;
    parts.push({ kind: 'in', ...curveIn(y0, -8), t, sp: 0.0022 + Math.random() * 0.0035, s: pick(SIZES), col: pick(IN_COLORS) });
  };
  const spawnOut = (t = 0) => {
    const k = pick(LANES);
    parts.push({ kind: 'out', ...curveOut(k, mw * 0.3, 8), t, sp: 0.0055, s: 3, col: k === 0 ? C.yellow : C.purple });
  };
  const spawnChipIn = () =>
    chips.push({ kind: 'in', text: pick(INS), ...curveIn(H * (0.14 + Math.random() * 0.72), -130), t: 0, sp: 0.0035 + Math.random() * 0.0015 });
  const spawnChipOut = () =>
    chips.push({ kind: 'out', text: pick(OUTS), ...curveOut(pick(LANES) * 0.85, mw * 0.8, 160), t: 0, sp: 0.004 });

  function drawChip(c: Chip, x: number, y: number) {
    const scale = c.kind === 'in' ? 1 - c.t * 0.65 : 0.55 + Math.min(c.t * 2, 0.45);
    const alpha = c.kind === 'in' && c.t > 0.85 ? (1 - c.t) / 0.15 : 1;
    ctx!.save();
    ctx!.globalAlpha = alpha;
    ctx!.translate(x, y);
    ctx!.scale(scale, scale);
    ctx!.font = font;
    const w = ctx!.measureText(c.text).width + 18, h = 26;
    ctx!.fillStyle = C.ink;
    ctx!.fillRect(-w / 2 + 3, -h / 2 + 3, w, h);
    ctx!.fillStyle = c.kind === 'in' ? C.white : C.yellow;
    ctx!.fillRect(-w / 2, -h / 2, w, h);
    ctx!.lineWidth = 2;
    ctx!.strokeStyle = C.ink;
    ctx!.strokeRect(-w / 2, -h / 2, w, h);
    ctx!.fillStyle = C.ink;
    ctx!.textBaseline = 'middle';
    ctx!.textAlign = 'center';
    ctx!.fillText(c.text, 0, 1);
    ctx!.restore();
  }

  function drawParticles() {
    for (const p of parts) {
      const [x, y] = at(p, p.t);
      ctx!.globalAlpha = p.kind === 'in' ? Math.min(1, p.t * 6) * (p.t > 0.9 ? (1 - p.t) * 10 : 1) : Math.min(1, p.t * 8);
      ctx!.fillStyle = p.col;
      ctx!.fillRect(Math.round(x), Math.round(y), p.s, p.s);
    }
    ctx!.globalAlpha = 1;
  }

  function frame(now: number) {
    raf = 0;
    ctx!.clearRect(0, 0, W, H);
    ctx!.drawImage(guides, 0, 0, W, H);

    if (parts.length < budget) { spawnIn(); if (Math.random() < 0.7) spawnIn(); }
    if (Math.random() < 0.3) spawnOut();
    if (now - lastChip > CHIP_EVERY) { spawnChipIn(); lastChip = now; }

    const next = nextState(state, now - stateAt, queued);
    if (next) {
      if (state === 'proc') { spawnChipOut(); for (let i = 0; i < 10; i++) spawnOut(Math.random() * 0.1); queued = 0; }
      setState(next);
    }

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.t += p.kind === 'in' ? p.sp * (0.6 + p.t * 1.8) : p.sp;
      if (p.t >= 1) parts.splice(i, 1);
    }
    drawParticles();

    for (let i = chips.length - 1; i >= 0; i--) {
      const c = chips[i];
      c.t += c.sp * (c.kind === 'in' ? 0.7 + c.t : 1);
      if (c.t >= 1) {
        chips.splice(i, 1);
        if (c.kind === 'in') { queued++; if (state === 'idle') setState('proc'); }
        continue;
      }
      const [x, y] = at(c, c.t);
      drawChip(c, x, y);
    }

    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.r += 5;
      const a = 1 - r.r / r.max;
      if (a <= 0) { rings.splice(i, 1); continue; }
      if (r.r <= 0) continue;
      ctx!.globalAlpha = a;
      ctx!.strokeStyle = r.col;
      ctx!.lineWidth = 4;
      ctx!.strokeRect(Math.round(r.x - r.r), Math.round(r.y - r.r), Math.round(r.r * 2), Math.round(r.r * 2));
    }
    ctx!.globalAlpha = 1;

    raf = requestAnimationFrame(frame);
  }

  function update() {
    const run = !reduce && onScreen && pageVisible;
    if (run && !raf) raf = requestAnimationFrame(frame);
    if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
    // As animações SMIL do mascote também param fora da tela (senão o navegador recalcula estilo a cada quadro).
    if (run) mascot!.unpauseAnimations();
    else mascot!.pauseAnimations();
    stage.dataset.running = String(run);
  }

  function drawStatic() {
    parts.length = 0;
    for (let i = 0; i < Math.round(budget * 0.4); i++) spawnIn(Math.random() * 0.92);
    for (let i = 0; i < 30; i++) spawnOut(Math.random() * 0.95);
    ctx!.clearRect(0, 0, W, H);
    ctx!.drawImage(guides, 0, 0, W, H);
    drawParticles();
  }

  const onClick = (e: MouseEvent) => {
    if (reduce) return;
    const r = stage.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top, max = Math.max(W, H) * 0.6;
    rings.push({ x, y, r: 0, max, col: C.purple }, { x, y, r: -30, max, col: C.yellow });
    mascot.classList.remove('jump');
    void mascot.getBoundingClientRect();
    mascot.classList.add('jump');
    setState('done');
    queued = 0;
    spawnChipOut();
    for (let i = 0; i < 16; i++) spawnOut(Math.random() * 0.15);
  };
  const onVisibility = () => { pageVisible = !document.hidden; update(); };

  const resizeObserver = new ResizeObserver(() => { measure(); if (reduce) drawStatic(); });
  const io = new IntersectionObserver((entries) => { onScreen = entries.some((e) => e.isIntersecting); update(); });

  measure();
  setState('idle');
  if (reduce) {
    mascot.querySelectorAll('animate, animateTransform').forEach((a) => a.remove());
    drawStatic();
  } else {
    mascot.querySelectorAll<SVGAnimationElement>('animate, animateTransform').forEach((a) => a.beginElement());
    for (let i = 0; i < Math.round(budget * 0.6); i++) spawnIn(Math.random() * 0.9);
    for (let i = 0; i < 24; i++) spawnOut(Math.random() * 0.9);
  }
  stage.addEventListener('click', onClick);
  document.addEventListener('visibilitychange', onVisibility);
  resizeObserver.observe(stage);
  io.observe(stage);

  return () => {
    stage.removeEventListener('click', onClick);
    document.removeEventListener('visibilitychange', onVisibility);
    resizeObserver.disconnect();
    io.disconnect();
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    stage.dataset.running = 'false';
  };
}

const stage = document.getElementById('heroStage');
if (stage) startHero(stage);

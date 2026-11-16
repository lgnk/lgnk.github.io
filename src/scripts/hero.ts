/**
 * Topo animado: a bagunça do dia a dia entra em fios na cabeça da Nuvem Pixel, ela processa,
 * e sai tudo organizado pela direita. Canvas 2D sem dependências; o mascote é o SVG do HTML.
 *
 * As partículas guardam só onde estão na curva (t) e de qual fio/faixa vêm; a curva é calculada a cada quadro
 * com o tamanho atual do palco, então girar o celular ou redimensionar a janela não deixa nada mirando o lugar antigo.
 */
import { bezier, frameScale, headPosition, nextState, particleBudget, room, stagePoint, streamYs } from '../lib/flow';
import type { MascotState } from '../lib/mascot';
import { PALETTE } from '../lib/palette';

const C = PALETTE;
const IN_COLORS = [C.purple, C.purpleLight, C.yellow, C.coral, C.ink];
const SIZES = [2, 2, 3, 3, 4, 5];
const INS = ['pedido #312', 'Pix recebido', 'nova mensagem', 'estoque?', 'planilha.xlsx', 'agenda', 'maquininha', 'cliente esperando'];
const OUTS = ['venda ✓', 'cliente avisado ✓', 'estoque em dia ✓', 'relatório pronto ✓', 'nota emitida ✓'];
const LANES = [-0.34, -0.17, 0, 0.17, 0.34];
const STREAM_FRACS = streamYs(18, 1);
const CHIP_EVERY = 1500;
const MAX_CHIPS = 10;
const MAX_RINGS = 6;
const LABELS: Record<MascotState, string> = { idle: 'esperando pedidos_', proc: 'processando…', done: 'pronto! ✓' };

/** Partícula de entrada: fração da altura em que nasce (+ desvio em px). De saída: faixa. */
interface Particle { kind: 'in' | 'out'; frac: number; jit: number; lane: number; t: number; sp: number; s: number; col: string }
interface Chip { kind: 'in' | 'out'; frac: number; lane: number; text: string; t: number; sp: number }
interface Ring { x: number; y: number; r: number; max: number; col: string }

const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function startHero(stage: HTMLElement): () => void {
  const canvas = stage.querySelector('canvas');
  const mascot = stage.querySelector<SVGSVGElement>('#heroMascot');
  const label = stage.querySelector<HTMLElement>('.hero-label');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !mascot || !ctx) return () => {};

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduce = motionQuery.matches;

  let W = 0, H = 0, mx = 0, my = 0, mw = 0, budget = 120;
  let font = 'system-ui, sans-serif';
  const guides = document.createElement('canvas');
  const parts: Particle[] = [];
  const chips: Chip[] = [];
  const rings: Ring[] = [];
  let state: MascotState = 'idle';
  let stateAt = 0, queued = 0, lastChip = -Infinity, raf = 0, lastFrame = 0, inAcc = 0, outAcc = 0;
  let onScreen = false, pageVisible = !document.hidden;
  let dprQuery: MediaQueryList | null = null;

  // Ponto atual da curva (sem criar objetos a cada partícula).
  let px = 0, py = 0;
  const pointIn = (y0: number, x0: number, t: number) => {
    px = bezier(x0, W * 0.16, mx - mw * 0.75, mx - mw * 0.18, t);
    py = bezier(y0, y0, my + (y0 - my) * 0.12, my + (y0 - my) * 0.04, t);
  };
  const pointOut = (lane: number, start: number, extra: number, t: number) => {
    const x0 = mx + start, y = my + lane * H;
    px = bezier(x0, x0 + mw * 0.5, mx + (W - mx) * 0.6, W + extra, t);
    py = bezier(my, my, y, y, t);
  };

  const setState = (s: MascotState) => {
    state = s;
    stateAt = performance.now();
    mascot.dataset.state = s;
    if (label) label.textContent = LABELS[s];
  };

  function measure() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = stage.clientWidth;
    H = stage.clientHeight;
    canvas!.width = Math.round(W * dpr);
    canvas!.height = Math.round(H * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    const head = headPosition(W, H, parseFloat(getComputedStyle(mascot!).width) || 150);
    mx = head.x;
    my = head.y;
    mw = head.w;
    budget = particleBudget(W, H);
    font = `700 12px ${getComputedStyle(stage).fontFamily}`;
    // Guias pontilhadas, desenhadas uma vez por tamanho.
    guides.width = canvas!.width;
    guides.height = canvas!.height;
    const g = guides.getContext('2d')!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = C.ink;
    g.globalAlpha = 0.1;
    for (const f of STREAM_FRACS) {
      for (let t = 0; t < 0.96; t += 0.018) { pointIn(f * H, -8, t); g.fillRect(Math.round(px), Math.round(py), 2, 2); }
    }
    for (const lane of LANES) {
      for (let t = 0.04; t < 1; t += 0.02) { pointOut(lane, mw * 0.3, 8, t); g.fillRect(Math.round(px), Math.round(py), 2, 2); }
    }
  }

  const spawnIn = (t = 0) =>
    parts.push({ kind: 'in', frac: pick(STREAM_FRACS), jit: (Math.random() - 0.5) * 4, lane: 0, t, sp: 0.0022 + Math.random() * 0.0035, s: pick(SIZES), col: pick(IN_COLORS) });
  const spawnOut = (t = 0) => {
    const lane = pick(LANES);
    parts.push({ kind: 'out', frac: 0, jit: 0, lane, t, sp: 0.0055, s: 3, col: lane === 0 ? C.yellow : C.purple });
  };
  const burstOut = (want: number, spread: number) => {
    for (let i = room(parts.length, budget, want); i > 0; i--) spawnOut(Math.random() * spread);
  };
  const spawnChipIn = () => {
    if (chips.length < MAX_CHIPS) chips.push({ kind: 'in', frac: 0.14 + Math.random() * 0.72, lane: 0, text: pick(INS), t: 0, sp: 0.0035 + Math.random() * 0.0015 });
  };
  const spawnChipOut = () => {
    if (chips.length < MAX_CHIPS) chips.push({ kind: 'out', frac: 0, lane: pick(LANES) * 0.85, text: pick(OUTS), t: 0, sp: 0.004 });
  };

  function drawChip(c: Chip) {
    if (c.kind === 'in') pointIn(c.frac * H, -130, c.t);
    else pointOut(c.lane, mw * 0.8, 160, c.t);
    const scale = c.kind === 'in' ? 1 - c.t * 0.65 : 0.55 + Math.min(c.t * 2, 0.45);
    ctx!.save();
    ctx!.globalAlpha = c.kind === 'in' && c.t > 0.85 ? (1 - c.t) / 0.15 : 1;
    ctx!.translate(px, py);
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
      if (p.kind === 'in') pointIn(p.frac * H + p.jit, -8, p.t);
      else pointOut(p.lane, mw * 0.3, 8, p.t);
      ctx!.globalAlpha = p.kind === 'in' ? Math.min(1, p.t * 6) * (p.t > 0.9 ? (1 - p.t) * 10 : 1) : Math.min(1, p.t * 8);
      ctx!.fillStyle = p.col;
      ctx!.fillRect(Math.round(px), Math.round(py), p.s, p.s);
    }
    ctx!.globalAlpha = 1;
  }

  function frame(now: number) {
    raf = 0;
    const k = lastFrame ? frameScale(now - lastFrame) : 1;
    lastFrame = now;
    ctx!.clearRect(0, 0, W, H);
    ctx!.drawImage(guides, 0, 0, W, H);

    // Nascimentos por tempo (≈1,7 de entrada e 0,3 de saída a cada quadro de 60 Hz), sempre dentro do limite.
    inAcc += 1.7 * k;
    for (; inAcc >= 1; inAcc--) if (parts.length < budget) spawnIn();
    outAcc += 0.3 * k;
    for (; outAcc >= 1; outAcc--) if (parts.length < budget) spawnOut();
    if (now - lastChip > CHIP_EVERY) { spawnChipIn(); lastChip = now; }

    const next = nextState(state, now - stateAt, queued);
    if (next) {
      if (state === 'proc') { spawnChipOut(); burstOut(10, 0.1); queued = 0; }
      setState(next);
    }

    // Remove as que terminaram sem splice (troca pela última).
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.t += (p.kind === 'in' ? p.sp * (0.6 + p.t * 1.8) : p.sp) * k;
      if (p.t >= 1) { parts[i] = parts[parts.length - 1]; parts.pop(); }
    }
    drawParticles();

    for (let i = chips.length - 1; i >= 0; i--) {
      const c = chips[i];
      c.t += c.sp * (c.kind === 'in' ? 0.7 + c.t : 1) * k;
      if (c.t >= 1) {
        chips.splice(i, 1);
        if (c.kind === 'in') { queued++; if (state === 'idle') setState('proc'); }
        continue;
      }
      drawChip(c);
    }

    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.r += 5 * k;
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
    if (run && !raf) { lastFrame = 0; raf = requestAnimationFrame(frame); }
    if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
    // As animações SMIL do mascote também param fora da tela (senão o navegador recalcula estilo a cada quadro).
    if (run) mascot!.unpauseAnimations();
    else mascot!.pauseAnimations();
    stage.dataset.running = String(run);
  }

  function drawStatic() {
    parts.length = 0;
    chips.length = 0;
    rings.length = 0;
    for (let i = Math.round(budget * 0.4); i > 0; i--) spawnIn(Math.random() * 0.92);
    for (let i = 0; i < 30; i++) spawnOut(Math.random() * 0.95);
    ctx!.clearRect(0, 0, W, H);
    ctx!.drawImage(guides, 0, 0, W, H);
    drawParticles();
  }

  function applyMotion() {
    stage.dataset.motion = reduce ? 'static' : 'full';
    if (reduce) { setState('idle'); drawStatic(); }
    update();
  }

  const onClick = (e: MouseEvent) => {
    if (reduce) return;
    const [x, y] = stagePoint(e.clientX, e.clientY, stage.getBoundingClientRect(), stage.clientLeft, stage.clientTop);
    const max = Math.max(W, H) * 0.6;
    if (rings.length < MAX_RINGS) rings.push({ x, y, r: 0, max, col: C.purple }, { x, y, r: -30, max, col: C.yellow });
    mascot.classList.remove('jump');
    void mascot.getBoundingClientRect();
    mascot.classList.add('jump');
    setState('done');
    queued = 0;
    spawnChipOut();
    burstOut(16, 0.15);
  };
  const onVisibility = () => { pageVisible = !document.hidden; update(); };
  const onMotion = () => { reduce = motionQuery.matches; applyMotion(); };
  const onResize = () => { measure(); if (reduce) drawStatic(); };
  // Mudou a densidade da tela (janela levada para outro monitor) sem mudar o tamanho: mede de novo.
  const watchDpr = () => {
    dprQuery?.removeEventListener('change', onDpr);
    dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    dprQuery.addEventListener('change', onDpr);
  };
  const onDpr = () => { onResize(); watchDpr(); };

  const resizeObserver = new ResizeObserver(onResize);
  const io = new IntersectionObserver((entries) => { onScreen = entries.some((e) => e.isIntersecting); update(); });

  measure();
  setState('idle');
  if (reduce) {
    mascot.querySelectorAll('animate, animateTransform').forEach((a) => a.remove());
  } else {
    mascot.querySelectorAll<SVGAnimationElement>('animate, animateTransform').forEach((a) => a.beginElement());
    for (let i = Math.round(budget * 0.6); i > 0; i--) spawnIn(Math.random() * 0.9);
    for (let i = 0; i < 24; i++) spawnOut(Math.random() * 0.9);
  }
  applyMotion();
  stage.addEventListener('click', onClick);
  document.addEventListener('visibilitychange', onVisibility);
  motionQuery.addEventListener('change', onMotion);
  watchDpr();
  resizeObserver.observe(stage);
  io.observe(stage);

  return () => {
    stage.removeEventListener('click', onClick);
    document.removeEventListener('visibilitychange', onVisibility);
    motionQuery.removeEventListener('change', onMotion);
    dprQuery?.removeEventListener('change', onDpr);
    resizeObserver.disconnect();
    io.disconnect();
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    stage.dataset.running = 'false';
  };
}

const stage = document.getElementById('heroStage');
if (stage) startHero(stage);

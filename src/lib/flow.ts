/** Partes puras da animação do topo: curvas, densidade e a máquina de estados do mascote. */
import type { MascotState } from './mascot';

/** Bézier cúbica em uma dimensão. */
export const bezier = (a: number, b: number, c: number, d: number, t: number): number => {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
};

/** Alturas iniciais dos fios de entrada, igualmente espaçadas de 4% a 96% da altura do palco. */
export function streamYs(count: number, height: number): number[] {
  if (count <= 1) return [height / 2];
  return Array.from({ length: count }, (_, i) => height * (0.04 + 0.92 * (i / (count - 1))));
}

/** Quantas partículas cabem no palco: proporcional à área, entre 120 e 650. */
export function particleBudget(width: number, height: number): number {
  return Math.min(650, Math.max(120, Math.round((width * height) / 420)));
}

/** Quanto tempo o mascote fica processando e comemorando (ms). */
export const TIMING = { proc: 1700, done: 900 } as const;

/** Próximo estado depois de `elapsedMs` no estado atual, ou null se ainda não muda. */
export function nextState(state: MascotState, elapsedMs: number, queued: number): MascotState | null {
  if (state === 'proc') return elapsedMs >= TIMING.proc ? 'done' : null;
  if (state === 'done') return elapsedMs >= TIMING.done ? (queued > 0 ? 'proc' : 'idle') : null;
  return null;
}

import { describe, it, expect } from 'vitest';
import { bezier, streamYs, particleBudget, nextState, TIMING, headPosition, stagePoint, frameScale, room } from '../../src/lib/flow';

describe('fluxo do topo', () => {
  it('bezier', () => {
    expect(bezier(0, 0, 10, 10, 0)).toBe(0);
    expect(bezier(0, 0, 10, 10, 1)).toBe(10);
    expect(bezier(0, 10, 20, 30, 0.5)).toBe(15);
  });

  it('streamYs espalha os fios de 4% a 96%', () => {
    const ys = streamYs(18, 460);
    expect(ys).toHaveLength(18);
    expect(ys[0]).toBeCloseTo(18.4);
    expect(ys[17]).toBeCloseTo(441.6);
    for (let i = 1; i < ys.length; i++) expect(ys[i]).toBeGreaterThan(ys[i - 1]);
  });

  it('particleBudget proporcional à área, com piso e teto', () => {
    expect(particleBudget(600, 460)).toBe(650);
    expect(particleBudget(375, 320)).toBe(286);
    expect(particleBudget(0, 0)).toBe(120);
  });

  it('nextState segue os tempos', () => {
    expect(TIMING).toEqual({ proc: 1700, done: 900 });
    expect(nextState('proc', 1699, 0)).toBeNull();
    expect(nextState('proc', 1700, 0)).toBe('done');
    expect(nextState('done', 900, 0)).toBe('idle');
    expect(nextState('done', 900, 2)).toBe('proc');
    expect(nextState('idle', 99999, 0)).toBeNull();
  });

  it('headPosition vem do tamanho do palco, não do retângulo transformado', () => {
    const h = headPosition(600, 480, 176);
    expect(h.x).toBeCloseTo(300);
    expect(h.y).toBeCloseTo(480 * 0.46 + 176 * 0.02);
    expect(h.w).toBe(176);
  });

  it('stagePoint desconta a borda do palco', () => {
    expect(stagePoint(110, 220, { left: 100, top: 200 }, 2, 2)).toEqual([8, 18]);
  });

  it('frameScale: 1 a 60 Hz, 0,5 a 120 Hz, no máximo 3 (pausas longas)', () => {
    expect(frameScale(1000 / 60)).toBeCloseTo(1);
    expect(frameScale(1000 / 120)).toBeCloseTo(0.5);
    expect(frameScale(1000)).toBeCloseTo(3);
    expect(frameScale(-5)).toBe(0);
  });

  it('room respeita o limite de partículas', () => {
    expect(room(640, 650, 16)).toBe(10);
    expect(room(650, 650, 5)).toBe(0);
    expect(room(10, 650, 5)).toBe(5);
  });
});

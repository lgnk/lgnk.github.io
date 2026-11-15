import { describe, it, expect } from 'vitest';
import { parseHTML } from 'linkedom';
import { clarityScriptUrl, loadClarity, ANALYTICS_ONLY } from '../../src/lib/clarity';

const fresh = () => {
  const { document } = parseHTML('<!doctype html><html><head></head><body></body></html>');
  const win: { clarity?: ((...a: unknown[]) => void) & { q?: unknown[][] } } = {};
  return { document: document as unknown as Document, win };
};

describe('clarityScriptUrl', () => {
  it('aponta para a tag oficial do projeto', () => {
    expect(clarityScriptUrl('abc123xyz0')).toBe('https://www.clarity.ms/tag/abc123xyz0');
  });

  it.each(['', 'a b', 'abc"><script>'])('recusa ID inválido: %s', (id) => {
    expect(() => clarityScriptUrl(id)).toThrow();
  });
});

describe('loadClarity', () => {
  it('cria a fila do Clarity e insere o script uma única vez', () => {
    const { document, win } = fresh();
    loadClarity(win, document, 'abc123xyz0');
    loadClarity(win, document, 'abc123xyz0');
    const scripts = document.querySelectorAll('script[src="https://www.clarity.ms/tag/abc123xyz0"]');
    expect(scripts.length).toBe(1);
    expect((scripts[0] as HTMLScriptElement).async).toBe(true);
    win.clarity!('event', 'x');
    expect(win.clarity!.q).toEqual([['event', 'x']]);
  });

  it('mantém uma fila que já existia', () => {
    const { document, win } = fresh();
    const calls: unknown[][] = [];
    win.clarity = (...a: unknown[]) => calls.push(a);
    loadClarity(win, document, 'abc123xyz0');
    win.clarity('event', 'y');
    expect(calls).toEqual([['event', 'y']]);
  });
});

describe('ANALYTICS_ONLY', () => {
  it('libera análise e nega anúncios', () => {
    expect(ANALYTICS_ONLY).toEqual({ ad_Storage: 'denied', analytics_Storage: 'granted' });
  });
});

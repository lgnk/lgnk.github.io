import { describe, it, expect } from 'vitest';
import { readConsent, writeConsent, CONSENT_KEY } from '../../src/lib/consent';

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    getItem: (k: string) => (k in data ? data[k] : null),
    setItem: (k: string, v: string) => {
      data[k] = v;
    },
  };
}

const broken = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
};

describe('readConsent', () => {
  it.each(['granted', 'denied'] as const)('lê a escolha guardada: %s', (v) => {
    expect(readConsent(memoryStorage({ [CONSENT_KEY]: v }))).toBe(v);
  });

  it('usa a chave lgnk-consent', () => {
    expect(CONSENT_KEY).toBe('lgnk-consent');
  });

  it('devolve null sem escolha, com valor estranho, sem storage ou com storage quebrado', () => {
    expect(readConsent(memoryStorage())).toBeNull();
    expect(readConsent(memoryStorage({ [CONSENT_KEY]: 'yes' }))).toBeNull();
    expect(readConsent(null)).toBeNull();
    expect(readConsent(broken)).toBeNull();
  });
});

describe('writeConsent', () => {
  it('guarda e relê a escolha', () => {
    const s = memoryStorage();
    writeConsent(s, 'denied');
    expect(readConsent(s)).toBe('denied');
    writeConsent(s, 'granted');
    expect(readConsent(s)).toBe('granted');
  });

  it('não quebra com storage indisponível', () => {
    expect(() => writeConsent(broken, 'granted')).not.toThrow();
    expect(() => writeConsent(null, 'granted')).not.toThrow();
  });
});

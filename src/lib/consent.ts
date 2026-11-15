export type Consent = 'granted' | 'denied';

export const CONSENT_KEY = 'lgnk-consent';

/** Lê a escolha guardada. Nunca lança: storage ausente ou bloqueado vira `null`. */
export function readConsent(storage: Pick<Storage, 'getItem'> | null): Consent | null {
  try {
    const value = storage?.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

/** Guarda a escolha. Nunca lança: sem storage, a escolha vale só para esta visita. */
export function writeConsent(storage: Pick<Storage, 'setItem'> | null, value: Consent): void {
  try {
    storage?.setItem(CONSENT_KEY, value);
  } catch {
    // modo privado / storage cheio: segue sem guardar
  }
}

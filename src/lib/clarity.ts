const VALID_ID = /^[a-z0-9]{6,20}$/i;

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[][] };

/** Consentimento só para análise: o Clarity não recebe permissão de anúncios. */
export const ANALYTICS_ONLY = { ad_Storage: 'denied', analytics_Storage: 'granted' } as const;

/** Endereço da tag oficial do Microsoft Clarity para o projeto `id`. */
export function clarityScriptUrl(id: string): string {
  if (!VALID_ID.test(id)) throw new Error(`ID do Clarity inválido: ${id}`);
  return `https://www.clarity.ms/tag/${id}`;
}

/**
 * Carrega o Clarity (equivalente ao snippet oficial): cria a fila `window.clarity`
 * se ainda não existir e insere a tag uma única vez. Só deve ser chamado depois do aceite.
 */
export function loadClarity(win: { clarity?: ClarityFn }, doc: Document, id: string): void {
  const src = clarityScriptUrl(id);
  if (!win.clarity) {
    const queue: ClarityFn = (...args: unknown[]) => {
      (queue.q ??= []).push(args);
    };
    win.clarity = queue;
  }
  if (doc.querySelector(`script[src="${src}"]`)) return;
  const script = doc.createElement('script');
  script.async = true;
  script.src = src;
  doc.head.appendChild(script);
}

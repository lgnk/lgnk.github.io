import { readConsent, writeConsent, type Consent } from '../lib/consent';
import { loadClarity, ANALYTICS_ONLY } from '../lib/clarity';

declare global {
  interface Window {
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] };
  }
}

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const clarityId = document.documentElement.dataset.clarityId ?? '';
const banner = document.getElementById('consent');

/** O Clarity só entra na página depois do "Aceitar" (e só para análise). */
function startClarity() {
  if (!clarityId) return;
  loadClarity(window, document, clarityId);
  window.clarity?.('consentv2', ANALYTICS_ONLY);
}

function show(focus = false) {
  if (!banner) return;
  banner.hidden = false;
  document.body.style.paddingBottom = `${banner.offsetHeight}px`;
  if (focus) banner.querySelector<HTMLButtonElement>('button[data-consent]')?.focus();
}

function hide() {
  if (!banner) return;
  banner.hidden = true;
  document.body.style.paddingBottom = '';
}

function choose(value: Consent) {
  writeConsent(storage(), value);
  if (value === 'granted') startClarity();
  // Se o Clarity já tinha sido carregado nesta visita, apaga os cookies dele.
  else window.clarity?.('consent', false);
  hide();
}

const current = readConsent(storage());
if (current === null) show();
else if (current === 'granted') startClarity();

banner?.querySelectorAll<HTMLButtonElement>('button[data-consent]').forEach((button) => {
  button.addEventListener('click', () => choose(button.dataset.consent as Consent));
});

document.querySelectorAll('[data-open-consent]').forEach((button) => {
  button.addEventListener('click', () => show(true));
});

document.addEventListener('click', (event) => {
  const target = event.target as Element | null;
  if (target?.closest?.('a[data-whatsapp]')) window.clarity?.('event', 'whatsapp_click');
});

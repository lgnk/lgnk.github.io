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

let opener: HTMLElement | null = null;

/** Reserva embaixo da página o espaço que o banner ocupa, para ele não cobrir conteúdo nem o foco. */
function syncSpace() {
  const height = banner && !banner.hidden ? banner.offsetHeight : 0;
  document.body.style.paddingBottom = height ? `${height}px` : '';
  document.documentElement.style.scrollPaddingBottom = height ? `${height}px` : '';
}

function show(from: HTMLElement | null = null) {
  if (!banner) return;
  banner.hidden = false;
  syncSpace();
  opener = from;
  if (from) banner.querySelector<HTMLButtonElement>('button[data-consent]')?.focus();
}

function hide() {
  if (!banner) return;
  banner.hidden = true;
  syncSpace();
  opener?.focus();
  opener = null;
}

function choose(value: Consent) {
  writeConsent(storage(), value);
  if (value === 'granted') startClarity();
  // Se o Clarity já tinha sido carregado nesta visita, apaga os cookies dele.
  else window.clarity?.('consent', false);
  hide();
}

// Sem Clarity configurado não há o que consentir: banner e "Preferências de cookies" ficam escondidos.
if (clarityId) {
  document.querySelectorAll<HTMLElement>('[data-open-consent]').forEach((button) => (button.hidden = false));
  if (banner && 'ResizeObserver' in window) new ResizeObserver(syncSpace).observe(banner);
  const current = readConsent(storage());
  if (current === null) show();
  else if (current === 'granted') startClarity();
}

banner?.querySelectorAll<HTMLButtonElement>('button[data-consent]').forEach((button) => {
  button.addEventListener('click', () => choose(button.dataset.consent as Consent));
});

document.querySelectorAll<HTMLElement>('[data-open-consent]').forEach((button) => {
  button.addEventListener('click', () => show(button));
});

document.addEventListener('click', (event) => {
  const target = event.target as Element | null;
  if (target?.closest?.('a[data-whatsapp]')) window.clarity?.('event', 'whatsapp_click');
});

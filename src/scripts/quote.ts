/**
 * Montador de orçamento: as escolhas viram a mensagem do WhatsApp, com a nuvem "processando".
 * E a barra fixa do celular, que aparece depois do topo e some perto do orçamento e do rodapé.
 */
import { quoteMessage, quoteUrl, QUOTE_TEMPLATE, type QuoteChoices } from '../lib/quote';
import { whatsappUrl } from '../lib/whatsapp';
import type { MascotState } from '../lib/mascot';

const STATUS: Record<MascotState, string> = {
  idle: 'esperando seu pedido_',
  proc: 'montando sua mensagem…',
  done: 'mensagem pronta ✓',
};

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const section = document.getElementById('orcamento');
const form = section?.querySelector<HTMLFormElement>('[data-quote-builder]');
const preview = section?.querySelector<HTMLElement>('[data-quote-preview]');
const send = section?.querySelector<HTMLAnchorElement>('a[data-whatsapp-quote]');
const mascot = section?.querySelector<SVGSVGElement>('#quoteMascot');
const status = section?.querySelector<HTMLElement>('[data-quote-status]');

if (section && form && preview && send && mascot) {
  const number = send.dataset.number ?? '';
  let timer = 0;

  const setState = (s: MascotState) => {
    mascot.dataset.state = s;
    if (status) status.textContent = STATUS[s];
  };

  const choices = (): QuoteChoices => {
    const data = new FormData(form);
    return {
      need: (data.get('need') as string | null) ?? undefined,
      pains: data.getAll('pains') as string[],
      business: (data.get('business') as string | null) ?? '',
      when: (data.get('when') as string | null) ?? undefined,
    };
  };

  const update = () => {
    const c = choices();
    const empty = !c.need && !c.pains.length && !c.business?.trim() && !c.when;
    preview.textContent = empty ? QUOTE_TEMPLATE : quoteMessage(c);
    send.href = empty ? whatsappUrl(number, QUOTE_TEMPLATE) : quoteUrl(number, c);
    window.clearTimeout(timer);
    if (empty) return setState('idle');
    setState('proc');
    timer = window.setTimeout(() => setState('done'), reduce ? 0 : 700);
  };

  form.hidden = false;
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  if (reduce) mascot.querySelectorAll('animate, animateTransform').forEach((a) => a.remove());
  else mascot.querySelectorAll<SVGAnimationElement>('animate, animateTransform').forEach((a) => a.beginElement());
  update();
}

// Barra fixa do celular.
const bar = document.querySelector<HTMLElement>('[data-quote-bar]');
const consent = document.getElementById('consent');
const hero = document.getElementById('topo');
const footer = document.getElementById('contato');
if (bar && hero && section) {
  const inView = new Map<Element, boolean>();
  const mobile = window.matchMedia('(max-width: 767px)');
  let applied = false;
  const refresh = () => {
    const covered = [hero, section, footer].some((el) => el && inView.get(el));
    const bannerOpen = !!consent && !consent.hidden;
    const show = mobile.matches && !covered && !bannerOpen;
    bar.hidden = !show;
    // O foco do teclado nunca fica escondido atrás da barra. O espaço do banner de cookies é dele: não mexe.
    if (show) {
      document.documentElement.style.scrollPaddingBottom = `${bar.offsetHeight + 8}px`;
      applied = true;
    } else if (applied) {
      if (!bannerOpen) document.documentElement.style.scrollPaddingBottom = '';
      applied = false;
    }
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) inView.set(e.target, e.isIntersecting);
    refresh();
  });
  [hero, section, footer].forEach((el) => el && io.observe(el));
  if (consent) new MutationObserver(refresh).observe(consent, { attributes: true, attributeFilter: ['hidden'] });
  mobile.addEventListener('change', refresh);
}

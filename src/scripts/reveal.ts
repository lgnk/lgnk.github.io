/**
 * Entradas e saídas dos itens das seções. O script do <head> (Base.astro) liga `reveal-on` no <html>
 * antes da primeira pintura; aqui cada [data-reveal] ganha data-reveal-state:
 *   in    — chegou na faixa do meio da tela: entra (com a animação do seu tipo);
 *   above — saiu pelo alto: sobe e some;
 *   below — ainda não chegou (ou voltou para baixo): fica no ponto de partida.
 * O CSS (global.css) faz o resto com transições, então a entrada pode ser interrompida e revertida.
 */

const root = document.documentElement;
const items = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];

/**
 * Faixa onde o item conta como "na tela": entra quando passa de 75% da altura, sai acima de 6%
 * (mais que isso esconderia o rótulo de uma seção logo depois de clicar no menu, no celular).
 */
const BAND = '-6% 0px -25% 0px';

if (root.classList.contains('reveal-on') && items.length) {
  // Avisa o script do <head> que está tudo certo (senão, em 3 s ele mostra tudo sem animação).
  (window as Window & { __lgnkReveal?: boolean }).__lgnkReveal = true;

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement;
        if (e.isIntersecting) el.dataset.revealState = 'in';
        else el.dataset.revealState = e.boundingClientRect.bottom <= (e.rootBounds?.top ?? 0) ? 'above' : 'below';
      }
    },
    { rootMargin: BAND },
  );
  items.forEach((el) => io.observe(el));

  // No pé da página a faixa nunca alcança o que ficou nos últimos 25% da tela: mostra esses (só esses).
  let queued = false;
  const atBottom = () => {
    queued = false;
    if (window.innerHeight + window.scrollY < root.scrollHeight - 4) return;
    for (const el of items) {
      const r = el.getBoundingClientRect();
      const inBottomStrip = r.top < window.innerHeight && r.bottom > window.innerHeight * 0.75;
      if (el.dataset.revealState !== 'in' && inBottomStrip) el.dataset.revealState = 'in';
    }
  };
  const check = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(atBottom);
    }
  };
  window.addEventListener('scroll', check, { passive: true });
  check();

  // Ligou o movimento reduzido com a página aberta: mostra tudo, parado.
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  reduce.addEventListener('change', () => {
    if (!reduce.matches) return;
    io.disconnect();
    window.removeEventListener('scroll', check);
    root.classList.remove('reveal-on');
  });
}

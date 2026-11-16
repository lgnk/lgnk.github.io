/**
 * Entradas e saídas dos itens das seções. O script do <head> (Base.astro) liga `reveal-on` no <html>
 * antes da primeira pintura; aqui cada [data-reveal] ganha data-reveal-state:
 *   in    — chegou perto do meio da tela: entra (com a animação do seu tipo);
 *   above — saiu pelo alto: sobe e some;
 *   below — ainda não chegou (ou voltou inteiro para baixo da tela): fica no ponto de partida.
 * O CSS (global.css) faz o resto com transições, então a entrada pode ser interrompida e revertida.
 *
 * A posição é medida com getBoundingClientRect (a caixa inteira). O IntersectionObserver não serve:
 * ele considera o clip-path de partida dos títulos e rótulos, e eles demoravam ou nunca entravam.
 */

type State = 'in' | 'above' | 'below';

const root = document.documentElement;
const items = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];

/** Entra quando o topo do item passa de 75% da altura da tela. */
const ENTER = 0.75;
/** Sai quando o pé do item fica acima de 6% (mais que isso esconderia o rótulo de uma seção aberta pelo menu). */
const LEAVE = 0.06;

type Box = { top: number; bottom: number; empty: boolean };

/** Deslocamento vertical do ponto de partida (ex.: "up" nasce 56 px abaixo), para medir onde o item realmente está. */
function startOffset(el: HTMLElement): number {
  const [, y = '0'] = getComputedStyle(el).translate.split(' ');
  return parseFloat(y) || 0;
}

function stateFor(r: Box, height: number, opening: boolean, atBottom: boolean): State | null {
  if (r.empty) return null; // escondido (ex.: formulário antes do JS): decide depois
  if (r.bottom <= height * LEAVE) return 'above';
  if (r.top >= height) return 'below';
  if (r.top <= height * ENTER) return 'in';
  // No pé da tela: entra na abertura da página (é a primeira tela) e no fim da página (não dá para rolar mais).
  // Fora isso, fica como está: o que já está visível não some de volta.
  return opening || atBottom ? 'in' : null;
}

if (root.classList.contains('reveal-on') && items.length) {
  // Avisa o script do <head> que está tudo certo (senão, em 3 s ele mostra tudo sem animação).
  (window as Window & { __lgnkReveal?: boolean }).__lgnkReveal = true;

  let opening = true;
  let queued = false;

  const update = () => {
    queued = false;
    const height = window.innerHeight;
    const atBottom = height + window.scrollY >= root.scrollHeight - 4;
    // Lê todas as posições antes de escrever qualquer estado (evita recalcular o layout a cada item).
    // Na abertura desconta o deslocamento de partida: numa tela baixa, os botões do topo nasceriam fora dela.
    const rects: Box[] = items.map((el) => {
      const r = el.getBoundingClientRect();
      const dy = opening ? startOffset(el) : 0;
      return { top: r.top - dy, bottom: r.bottom - dy, empty: r.width === 0 && r.height === 0 };
    });
    items.forEach((el, i) => {
      const next = stateFor(rects[i], height, opening, atBottom);
      if (next && el.dataset.revealState !== next) el.dataset.revealState = next;
    });
    opening = false;
  };
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  // O formulário do orçamento só aparece depois do JS dele; mede de novo quando a página termina de carregar.
  window.addEventListener('load', schedule);

  // Ligou o movimento reduzido com a página aberta: mostra tudo, parado.
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  reduce.addEventListener('change', () => {
    if (!reduce.matches) return;
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    root.classList.remove('reveal-on');
  });
}

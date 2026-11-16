/**
 * Vídeos dos cases: tocam sozinhos, sem som, quando aparecem na tela, e param quando saem.
 * Só baixam ao tocar (preload="none"). Com movimento reduzido (ou sem JS) ficam parados, com os controles.
 */
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const videos = [...document.querySelectorAll<HTMLVideoElement>('video[data-case-video]')];

if (!reduce && videos.length) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting && !document.hidden) v.play().catch(() => {});
        else v.pause();
      }
    },
    { threshold: 0.5 },
  );
  for (const v of videos) {
    v.removeAttribute('controls');
    v.muted = true;
    io.observe(v);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) videos.forEach((v) => v.pause());
  });
}

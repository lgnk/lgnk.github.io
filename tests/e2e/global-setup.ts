import { execSync } from 'node:child_process';

const URL = 'http://localhost:4322';
const astro = (args: string, quiet = false) =>
  execSync(`yarn -s astro preview ${args}`, { stdio: quiet ? 'ignore' : 'inherit' });

/** Sobe o `astro preview` em segundo plano (o Astro 7 se desacopla do terminal) e derruba no fim. */
export default async function globalSetup() {
  // Uma execução interrompida pode ter deixado uma prévia rodando: derruba antes de subir outra.
  try {
    astro('stop', true);
  } catch {}
  astro('--background --port 4322');

  let ready = false;
  for (let i = 0; i < 60 && !ready; i++) {
    try {
      ready = (await fetch(URL)).ok;
    } catch {}
    if (!ready) await new Promise((r) => setTimeout(r, 250));
  }
  if (!ready) {
    astro('stop', true);
    throw new Error(`A prévia não respondeu em ${URL}. Rode "yarn build" e veja "yarn astro preview logs".`);
  }

  return () => astro('stop');
}

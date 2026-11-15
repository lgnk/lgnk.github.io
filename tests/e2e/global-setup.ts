import { execSync } from 'node:child_process';

const URL = 'http://localhost:4322';

/** Sobe o `astro preview` em segundo plano (o Astro 7 se desacopla do terminal) e derruba no fim. */
export default async function globalSetup() {
  execSync('yarn -s astro preview --background --port 4322', { stdio: 'inherit' });
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(URL)).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  return () => {
    execSync('yarn -s astro preview stop', { stdio: 'inherit' });
  };
}

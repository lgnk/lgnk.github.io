import { defineConfig, fontProviders } from 'astro/config';
import { launchGuard } from './integrations/launch-guard';
import { site } from './src/config';

export default defineConfig({
  site: site.url,
  integrations: [launchGuard()],
  // CSS dentro do HTML: sem esperar um arquivo a mais, e a nuvem de carregamento consegue aparecer cedo.
  build: { inlineStylesheets: 'always' },
  fonts: [
    {
      name: 'Inter Tight',
      cssVariable: '--font-sans',
      provider: fontProviders.fontsource(),
      weights: [400, 500, 600, 700, 800],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      provider: fontProviders.fontsource(),
      weights: [500, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
});

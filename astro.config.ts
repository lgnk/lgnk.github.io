import { defineConfig, fontProviders } from 'astro/config';
import { launchGuard } from './integrations/launch-guard';

export default defineConfig({
  site: 'https://lgnk.com.br',
  integrations: [launchGuard()],
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
      name: 'Instrument Serif',
      cssVariable: '--font-serif',
      provider: fontProviders.fontsource(),
      weights: [400],
      styles: ['italic'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif'],
    },
  ],
});

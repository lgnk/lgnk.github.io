import type { AstroIntegration } from 'astro';
import { site } from '../src/config';
import { checkLaunchConfig } from '../src/lib/launch-check';

/**
 * Impede que o site vá ao ar com dados provisórios (ex.: WhatsApp fictício).
 * Estrito no deploy (LGNK_STRICT=1, ligado no GitHub Actions); localmente, só avisa.
 */
export function launchGuard(opts: { strict?: boolean } = {}): AstroIntegration {
  const strict = opts.strict ?? process.env.LGNK_STRICT === '1';
  return {
    name: 'lgnk-launch-guard',
    hooks: {
      'astro:build:start': ({ logger }) => {
        const { errors, warnings } = checkLaunchConfig(site);
        for (const w of warnings) logger.warn(w);
        if (errors.length === 0) return;
        if (strict) throw new Error(errors.join('\n'));
        for (const e of errors) logger.warn(e);
      },
    },
  };
}

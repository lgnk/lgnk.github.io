import type { AstroIntegration } from 'astro';
import { site, type SiteConfig } from '../src/config';
import { checkLaunchConfig } from '../src/lib/launch-check';

/**
 * Impede que o site vá ao ar com dados provisórios (ex.: WhatsApp fictício).
 * Estrito no deploy (LGNK_STRICT=1, ligado no GitHub Actions); localmente, só avisa.
 * `config` existe para os testes; o site usa sempre `src/config.ts`.
 */
export function launchGuard(opts: { strict?: boolean; config?: SiteConfig } = {}): AstroIntegration {
  const strict = opts.strict ?? process.env.LGNK_STRICT === '1';
  const config = opts.config ?? site;
  return {
    name: 'lgnk-launch-guard',
    hooks: {
      'astro:build:start': ({ logger }) => {
        const { errors, warnings } = checkLaunchConfig(config);
        for (const w of warnings) logger.warn(w);
        if (errors.length === 0) return;
        if (strict) throw new Error(errors.join('\n'));
        for (const e of errors) logger.warn(e);
      },
    },
  };
}

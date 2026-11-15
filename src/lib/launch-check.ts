import { PLACEHOLDER_WHATSAPP, type SiteConfig } from '../config';

export function checkLaunchConfig(cfg: SiteConfig): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (cfg.whatsapp.number === PLACEHOLDER_WHATSAPP) {
    errors.push('WhatsApp ainda é o número fictício (src/config.ts → whatsapp.number).');
  }
  if (cfg.clarityId === '') {
    warnings.push('Clarity sem ID: analytics desligado (src/config.ts → clarityId).');
  }
  if (!cfg.email.ready) {
    warnings.push(`Confirme que ${cfg.email.address} recebe e-mail e marque email.ready = true.`);
  }

  return { errors, warnings };
}

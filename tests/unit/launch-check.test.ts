import { describe, it, expect } from 'vitest';
import { checkLaunchConfig } from '../../src/lib/launch-check';
import { site, PLACEHOLDER_WHATSAPP } from '../../src/config';

const ready = {
  ...site,
  whatsapp: { ...site.whatsapp, number: '5531999998888' },
  clarityId: 'abc123xyz0',
  email: { ...site.email, ready: true },
};

describe('checkLaunchConfig', () => {
  it('bloqueia o número fictício', () => {
    const r = checkLaunchConfig({ ...ready, whatsapp: { ...ready.whatsapp, number: PLACEHOLDER_WHATSAPP } });
    expect(r.errors).toEqual(['WhatsApp ainda é o número fictício (src/config.ts → whatsapp.number).']);
  });

  it('avisa sem Clarity e sem e-mail confirmado, mas não bloqueia', () => {
    const r = checkLaunchConfig({ ...ready, clarityId: '', email: { ...ready.email, ready: false } });
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual([
      'Clarity sem ID: analytics desligado (src/config.ts → clarityId).',
      'Confirme que contato@lgnk.com.br recebe e-mail e marque email.ready = true.',
    ]);
  });

  it('config completa passa limpa', () => {
    expect(checkLaunchConfig(ready)).toEqual({ errors: [], warnings: [] });
  });
});

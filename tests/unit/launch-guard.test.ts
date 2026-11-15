import { describe, it, expect, vi } from 'vitest';
import { launchGuard } from '../../integrations/launch-guard';
import { site, PLACEHOLDER_WHATSAPP } from '../../src/config';

type Hook = (o: { logger: { warn: (m: string) => void } }) => unknown;
const hook = (opts: Parameters<typeof launchGuard>[0]) => launchGuard(opts).hooks['astro:build:start'] as unknown as Hook;

const placeholder = { ...site, whatsapp: { ...site.whatsapp, number: PLACEHOLDER_WHATSAPP } };
const ready = {
  ...site,
  whatsapp: { ...site.whatsapp, number: '5531999998888' },
  clarityId: 'abc123xyz0',
  email: { ...site.email, ready: true },
};

describe('launchGuard', () => {
  it('no modo estrito, recusa o build com o número fictício', async () => {
    const logger = { warn: vi.fn() };
    await expect(async () => hook({ strict: true, config: placeholder })({ logger })).rejects.toThrow(
      'WhatsApp ainda é o número fictício',
    );
  });

  it('fora do modo estrito, só avisa', async () => {
    const logger = { warn: vi.fn() };
    await hook({ strict: false, config: placeholder })({ logger });
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('WhatsApp ainda é o número fictício'));
  });

  it('no modo estrito, deixa passar quando os dados de lançamento estão prontos', async () => {
    const logger = { warn: vi.fn() };
    await expect(Promise.resolve(hook({ strict: true, config: ready })({ logger }))).resolves.toBeUndefined();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('se chama lgnk-launch-guard', () => {
    expect(launchGuard().name).toBe('lgnk-launch-guard');
  });
});

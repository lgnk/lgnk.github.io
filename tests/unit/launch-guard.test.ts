import { describe, it, expect, vi } from 'vitest';
import { launchGuard } from '../../integrations/launch-guard';

type Hook = (o: { logger: { warn: (m: string) => void } }) => unknown;
const hook = (strict: boolean) => launchGuard({ strict }).hooks['astro:build:start'] as unknown as Hook;

describe('launchGuard', () => {
  it('no modo estrito, recusa o build com o número fictício', async () => {
    const logger = { warn: vi.fn() };
    await expect(async () => hook(true)({ logger })).rejects.toThrow('WhatsApp ainda é o número fictício');
  });

  it('fora do modo estrito, só avisa', async () => {
    const logger = { warn: vi.fn() };
    await hook(false)({ logger });
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('WhatsApp ainda é o número fictício'));
  });

  it('se chama lgnk-launch-guard', () => {
    expect(launchGuard().name).toBe('lgnk-launch-guard');
  });
});

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { DIST } from './helpers';

describe('imagem de compartilhamento', () => {
  it('og.png existe com 1200x630', () => {
    const file = join(DIST, 'og.png');
    expect(existsSync(file)).toBe(true);
    const png = readFileSync(file);
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });
});

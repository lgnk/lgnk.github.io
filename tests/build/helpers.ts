import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

export const DIST = fileURLToPath(new URL('../../dist/', import.meta.url));

/** Parses dist/<path>/index.html (path like '/' or '/privacidade/'). */
export function page(path: string): Document {
  const html = readFileSync(join(DIST, path, 'index.html'), 'utf8');
  return parseHTML(html).document as unknown as Document;
}

/** Raw contents of every .html file under dist/. */
export function allHtml(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.html')) out.push(readFileSync(full, 'utf8'));
    }
  };
  walk(DIST);
  return out;
}

export const text = (el: Element | null | undefined) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim();

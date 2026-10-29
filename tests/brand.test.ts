/**
 * Unit tests for the brand.
 *
 * The name of the site appears in the header, in the footer, in the page
 * titles, in the share text, in the manifest and in the social preview, and
 * all of those have to agree.
 *
 * Run with: npm test
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { BRAND_NAME } from '../src/lib/site-content.ts';

const ROOT = join(import.meta.dirname ?? '.', '..');

function read(relative: string): string {
  return readFileSync(join(ROOT, relative), 'utf8');
}

function sourceFiles(folder: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(join(ROOT, folder))) {
    const path = join(folder, entry);
    if (statSync(join(ROOT, path)).isDirectory()) {
      found.push(...sourceFiles(path));
    } else if (/\.(tsx|ts)$/.test(entry)) {
      found.push(path);
    }
  }
  return found;
}

describe('the brand', () => {
  test('the name is in one place', () => {
    assert.equal(BRAND_NAME, 'USA GeoArena');
  });

  test('the page title carries the name', () => {
    const html = read('index.html');
    assert.ok(html.includes(`<title>${BRAND_NAME}`), 'the title must start with the brand');
    assert.ok(
      html.includes(`<meta property="og:site_name" content="${BRAND_NAME}"`),
      'the social card has to carry the same name',
    );
  });

  test('the installed app carries the name', () => {
    const manifest = JSON.parse(read('public/manifest.webmanifest'));
    assert.ok(manifest.name.startsWith(BRAND_NAME));
    assert.equal(manifest.short_name, BRAND_NAME);
  });

  test('the header and the footer carry the name', () => {
    assert.ok(read('src/components/SiteHeader.tsx').includes('BRAND_NAME'));
    assert.ok(read('src/components/SiteLayout.tsx').includes('BRAND_NAME'));
  });

  test('the shared text carries the name', () => {
    assert.ok(read('src/lib/game-data.ts').includes('USA GeoArena'), 'the share text');
  });

  test('no file still uses the old bare name', () => {
    // The domain and the local storage keys keep their old names on purpose:
    // the domain is the address people share, and moving a storage key would
    // wipe the progress of everyone who has played.
    const files = [
      ...sourceFiles('src'),
      'index.html',
      'public/manifest.webmanifest',
      'newsletter/daily-challenge.html',
    ];
    for (const file of files) {
      const text = read(file);
      // The new name is taken out first, otherwise the test would trip over
      // the "GeoArena" inside it.
      const bare = text
        .replace(/USA GeoArena/g, '')
        .replace(/GeoArena\.com/g, '')
        .replace(/geoarena[-.:]/g, '');
      assert.ok(
        !/\bGeoArena\b/.test(bare),
        `${file} still uses the old brand name, the site is called ${BRAND_NAME}`,
      );
    }
  });
});
/**
 * The whole site is in English.
 *
 * This test walks every source file and fails if a Serbian diacritic shows up
 * in a string a visitor could read. It is the guard that keeps the site
 * English - the daily email is a separate channel and may be translated.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SRC = join(import.meta.dirname ?? '.', '..', 'src');

/** Serbian letters, written as escapes so this file stays clean too. */
const SERBIAN = /[\u0107\u010B\u0161\u017E\u0111\u0106\u010C\u0158\u0110]/;

function collect(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collect(full, out);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

describe('site language', () => {
  test('no source file contains Serbian diacritics', () => {
    const files = collect(SRC);
    assert.ok(files.length > 0, 'no source files found - is the path right?');

    const offenders: string[] = [];
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      if (SERBIAN.test(content)) {
        offenders.push(file);
      }
    }

    assert.deepEqual(
      offenders,
      [],
      'the site must be English only, but Serbian text was found in: ' + offenders.join(', '),
    );
  });
});

describe('public assets', () => {
  const PUBLIC = join(import.meta.dirname ?? '.', '..', 'public');

  test('the web app manifest is valid and complete', () => {
    const manifest = JSON.parse(readFileSync(join(PUBLIC, 'manifest.webmanifest'), 'utf8'));

    assert.equal(manifest.name, 'USA GeoArena - Guess the Place');
    assert.equal(manifest.short_name, 'USA GeoArena');
    assert.equal(manifest.start_url, '/');
    assert.equal(manifest.display, 'standalone');
    assert.equal(manifest.theme_color, '#FF4655');

    // A maskable icon is what Android uses to crop the icon into a circle
    // or a squircle, so an app without one looks broken on a home screen.
    const purposes = manifest.icons.map((icon: { purpose: string }) => icon.purpose);
    assert.ok(purposes.includes('any'), 'the manifest needs a regular "any" icon');
    assert.ok(purposes.includes('maskable'), 'the manifest needs a "maskable" icon');

    // Every icon the manifest points at has to exist, or the install fails.
    for (const icon of manifest.icons) {
      const file = join(PUBLIC, icon.src.replace(/^\//, ''));
      assert.ok(existsSync(file), `the manifest points at a missing icon: ${icon.src}`);
    }
  });

  test('the sitemap lists every public route', () => {
    const sitemap = readFileSync(join(PUBLIC, 'sitemap.xml'), 'utf8');

    for (const route of [
      '/',
      '/daily',
      '/battle',
      '/archive',
      '/leaderboard',
      '/stats',
      '/achievements',
      '/scoring',
      '/about',
      '/editorial',
      '/privacy',
      '/terms',
    ]) {
      const loc = route === '/' ? 'https://geo-arena-six.vercel.app/' : `https://geo-arena-six.vercel.app${route}`;
      assert.ok(sitemap.includes(loc), `the sitemap is missing ${loc}`);
    }
  });

  test('robots.txt points at the sitemap', () => {
    const robots = readFileSync(join(PUBLIC, 'robots.txt'), 'utf8');
    assert.ok(robots.includes('Sitemap:'), 'robots.txt must reference the sitemap');
  });

  test('the service worker caches the app shell and skips the ad script', () => {
    const sw = readFileSync(join(PUBLIC, 'sw.js'), 'utf8');

    assert.ok(sw.includes('/index.html'), 'the service worker must precache the shell');
    assert.ok(
      sw.includes('googlesyndication'),
      'the service worker must never cache the ad script',
    );
  });
});

/**
 * Checks the pins of bank files against Wikipedia.
 *
 * Every question names the article its pin was taken from. The article's
 * coordinates are fetched fifty at a time and any pin more than 1.5 km away,
 * or any article without coordinates, is listed.
 *
 *   node --experimental-strip-types scripts/daily/check-coords.ts content/daily/usa/wave-1-a.json
 */

import fs from 'node:fs';
import { calculateDistance } from '../../src/lib/game-data.ts';
import type { BankQuestion } from './bank.ts';

const LIMIT_KM = 1.5;

async function coordinates(titles: string[]): Promise<Map<string, { lat: number; lng: number } | null>> {
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.search = new URLSearchParams({
    action: 'query',
    prop: 'coordinates',
    // Without these the API hands out coordinates for only a few pages of a
    // batch, and the rest look as if they had none.
    colimit: 'max',
    coprimary: 'primary',
    titles: titles.join('|'),
    redirects: '1',
    format: 'json',
    formatversion: '2',
  }).toString();
  // Wikipedia answers a burst of requests with an error page; wait and retry.
  let text = '';
  for (let attempt = 0; attempt < 8; attempt++) {
    const response = await fetch(url, { headers: { 'User-Agent': 'geo-arena-bank-check/1.0' } });
    text = await response.text();
    if (response.ok && text.startsWith('{') && !text.includes('"ratelimited"')) break;
    await new Promise((resolve) => setTimeout(resolve, 2000 * 2 ** attempt));
  }
  const data = JSON.parse(text) as {
    query?: {
      normalized?: { from: string; to: string }[];
      redirects?: { from: string; to: string }[];
      pages?: { title: string; missing?: boolean; coordinates?: { lat: number; lon: number }[] }[];
    };
  };
  const rename = new Map<string, string>();
  for (const step of [...(data.query?.normalized ?? []), ...(data.query?.redirects ?? [])]) {
    rename.set(step.from, step.to);
  }
  const byTitle = new Map<string, { lat: number; lng: number } | null>();
  for (const page of data.query?.pages ?? []) {
    const point = page.coordinates?.[0];
    byTitle.set(page.title, point ? { lat: point.lat, lng: point.lon } : null);
  }
  const out = new Map<string, { lat: number; lng: number } | null>();
  for (const title of titles) {
    let resolved = title;
    for (let i = 0; i < 3 && rename.has(resolved); i++) resolved = rename.get(resolved)!;
    out.set(title, byTitle.get(resolved) ?? null);
  }
  return out;
}

let bad = 0;
let checked = 0;
for (const file of process.argv.slice(2)) {
  const questions = JSON.parse(fs.readFileSync(file, 'utf8')) as BankQuestion[];
  for (let i = 0; i < questions.length; i += 50) {
    const batch = questions.slice(i, i + 50);
    // A short pause between batches keeps Wikipedia from refusing them.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const found = await coordinates([...new Set(batch.map((q) => q.wikipedia))]);
    for (const q of batch) {
      checked++;
      const point = found.get(q.wikipedia);
      if (!point) {
        bad++;
        console.log(`${q.id}  no coordinates on Wikipedia for "${q.wikipedia}"`);
        continue;
      }
      const km = calculateDistance(q.lat, q.lng, point.lat, point.lng);
      if (km > LIMIT_KM) {
        bad++;
        console.log(`${q.id}  ${km.toFixed(1)} km off  (wiki ${point.lat}, ${point.lng})  "${q.wikipedia}"`);
      }
    }
  }
}
console.log(`${checked} checked, ${bad} to look at`);

/**
 * Deals the bank out to days and writes them to `daily_rounds`.
 *
 *   node --experimental-strip-types scripts/daily/schedule.ts --dry
 *   node --experimental-strip-types scripts/daily/schedule.ts
 *
 * Only questions that are not on any day yet are dealt, and only to days
 * after the last one already written, so a day that is written never
 * changes. A day gets ten questions with the kinds of question mixed and no
 * place twice. Questions that do not fill a whole day wait for the next wave.
 *
 * Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, read from .env.local and
 * .env when they are not set already.
 */

import fs from 'node:fs';
import path from 'node:path';
import { BANK_DIR, BANK_REGIONS, loadBank, problems, toQuestion, type BankRegion } from './bank.ts';
import { addDays } from '../../src/lib/date-utils.ts';
import { DAILY_QUESTION_COUNT, venueKey, type Question } from '../../src/lib/game-data.ts';
import { latestOpenDay } from '../../server/_lib/daily-rounds.ts';

const ROOT = path.join(BANK_DIR, '..', '..');
for (const file of ['.env.local', '.env']) {
  const full = path.join(ROOT, file);
  if (fs.existsSync(full)) process.loadEnvFile(full);
}

const dry = process.argv.includes('--dry');

/** Fewer days than this left in the bank is worth a warning. */
const LOW_STOCK_DAYS = 30;

function supabase(pathname: string, init: RequestInit = {}) {
  const base = String(process.env.SUPABASE_URL ?? '').replace(/\/$/, '');
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');
  if (!base || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are needed.');
  return fetch(`${base}${pathname}`, {
    ...init,
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

/** The days already written for a region, oldest first. */
async function scheduledDays(region: BankRegion): Promise<{ day_key: string; questions: Question[] }[]> {
  const rows: { day_key: string; questions: Question[] }[] = [];
  for (let offset = 0; ; offset += 1000) {
    const response = await supabase(
      `/rest/v1/daily_rounds?select=day_key,questions&region=eq.${region}` +
        `&order=day_key.asc&limit=1000&offset=${offset}`,
    );
    // A dry run can show the dealing before the table has been made.
    if (dry && response.status === 404) {
      console.log(`  ${region}: daily_rounds does not exist yet; dealing as if nothing were written.`);
      return [];
    }
    if (!response.ok) throw new Error(`daily_rounds could not be read: ${response.status} ${await response.text()}`);
    const page = (await response.json()) as { day_key: string; questions: Question[] }[];
    rows.push(...page);
    if (page.length < 1000) return rows;
  }
}

/** A fixed shuffle, so a dry run and a real run deal the same days. */
function shuffled<T>(items: T[], seed: string): T[] {
  let state = [...seed].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Deals questions into whole days. Each slot goes to the kind of question
 * the day has least of, so a day is never all stadiums.
 */
function deal(questions: Question[], seed: string): Question[][] {
  const queues = new Map<string, Question[]>();
  for (const question of shuffled(questions, seed)) {
    const queue = queues.get(question.category) ?? [];
    queue.push(question);
    queues.set(question.category, queue);
  }

  const days: Question[][] = [];
  for (;;) {
    const day: Question[] = [];
    const venues = new Set<string>();
    const counts = new Map<string, number>();
    while (day.length < DAILY_QUESTION_COUNT) {
      const kinds = [...queues.keys()]
        .filter((kind) => queues.get(kind)!.some((q) => !venues.has(venueKey(q))))
        .sort(
          (a, b) =>
            (counts.get(a) ?? 0) - (counts.get(b) ?? 0) ||
            queues.get(b)!.length - queues.get(a)!.length,
        );
      if (kinds.length === 0) break;
      const queue = queues.get(kinds[0])!;
      const index = queue.findIndex((q) => !venues.has(venueKey(q)));
      const [question] = queue.splice(index, 1);
      day.push(question);
      venues.add(venueKey(question));
      counts.set(question.category, (counts.get(question.category) ?? 0) + 1);
    }
    if (day.length < DAILY_QUESTION_COUNT) return days;
    days.push(day);
  }
}

for (const region of BANK_REGIONS) {
  const bank = loadBank(region);
  const broken = bank.filter((question) => problems(question, region).length > 0);
  if (broken.length > 0) {
    throw new Error(`${region}: ${broken.length} question(s) break the rules; run tests/daily-bank.test.ts.`);
  }

  const written = await scheduledDays(region);
  const used = new Set(written.flatMap((row) => row.questions.map((q) => q.id)));
  const waiting = bank.filter((question) => !used.has(question.id)).map(toQuestion);

  // Never today or a day that has started anywhere: someone may be playing it.
  const lastWritten = written.at(-1)?.day_key;
  const firstOpen = addDays(latestOpenDay(), 1);
  const start = lastWritten && addDays(lastWritten, 1) > firstOpen ? addDays(lastWritten, 1) : firstOpen;

  const days = deal(waiting, `${region}:${start}`);
  const rows = days.map((questions, index) => ({ day_key: addDays(start, index), region, questions }));
  const leftover = waiting.length - days.length * DAILY_QUESTION_COUNT;

  const ahead = written.filter((row) => row.day_key >= firstOpen).length + rows.length;
  console.log(
    `${region}: ${written.length} day(s) written, ${rows.length} new` +
      (rows.length ? ` (${rows[0].day_key} to ${rows.at(-1)!.day_key})` : '') +
      `, ${leftover} question(s) waiting, ${ahead} day(s) ahead.`,
  );
  if (ahead < LOW_STOCK_DAYS) console.log(`  ${region}: fewer than ${LOW_STOCK_DAYS} days ahead - time for a new wave.`);

  if (dry || rows.length === 0) continue;
  const response = await supabase('/rest/v1/daily_rounds?on_conflict=day_key,region', {
    method: 'POST',
    headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
  if (!response.ok) throw new Error(`${region}: the days could not be written: ${response.status} ${await response.text()}`);
}

if (dry) console.log('Dry run: nothing was written.');

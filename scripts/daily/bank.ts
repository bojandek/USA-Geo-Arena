/**
 * The daily question bank: reading it, checking it and turning it into the
 * questions the game plays.
 *
 * The bank lives in content/daily and is never bundled for the browser. The
 * schedule script and the tests both read it through this file, so the rules
 * a question has to follow are written down once.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Question } from '../../src/lib/question-types.ts';

export type BankRegion = 'usa' | 'world';
export const BANK_REGIONS: BankRegion[] = ['usa', 'world'];

/** A question as it is written in the bank. */
export interface BankQuestion {
  id: string;
  text: string;
  lat: number;
  lng: number;
  category: Question['category'];
  venue: string;
  city: string;
  state?: string;
  country: string;
  hint: string;
  facts: string[];
  wikipedia: string;
}

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const BANK_DIR = path.join(ROOT, 'content', 'daily');

/** Every question of a region, file by file in name order. */
export function loadBank(region: BankRegion): BankQuestion[] {
  const dir = path.join(BANK_DIR, region);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .flatMap((file) => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')) as BankQuestion[]);
}

export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming', 'Puerto Rico', 'District of Columbia',
];

/**
 * Names that are also an everyday word or a famous person, and would refuse
 * good questions if they were banned: Michael Jordan is not a country.
 */
const NOT_A_GIVEAWAY = new Set(['Jordan', 'Chad', 'Jersey', 'Turkey', 'Guinea', 'Man']);

/** Every country's English name, plus the home nations and older names. */
function countryNames(): string[] {
  const names = new Set([
    'England', 'Scotland', 'Wales', 'Northern Ireland', 'Great Britain', 'Britain',
    'Holland', 'Korea', 'Ivory Coast', 'Czech Republic', 'Turkey', 'USA',
  ]);
  const display = new Intl.DisplayNames(['en'], { type: 'region' });
  for (let a = 65; a <= 90; a++) {
    for (let b = 65; b <= 90; b++) {
      const code = String.fromCharCode(a, b);
      try {
        const name = display.of(code);
        if (name && name !== code && !/unknown/i.test(name)) names.add(name);
      } catch {
        // Not a region code.
      }
    }
  }
  return [...names].filter((name) => !NOT_A_GIVEAWAY.has(name));
}

const COUNTRIES = countryNames();

function namesIn(sentence: string, names: Iterable<string>): string[] {
  const found: string[] = [];
  for (const name of names) {
    if (!name) continue;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`(^|[^\\p{L}])${escaped}($|[^\\p{L}])`, 'u').test(sentence)) found.push(name);
  }
  return found;
}

/**
 * The place names a question gives away before it is answered.
 *
 * The question and the hint are read before the answer, so neither may name
 * the town, the state or the country - nor any other state or country, which
 * would narrow the map down just as much.
 */
export function giveaways(question: BankQuestion): string[] {
  const banned = new Set<string>([...US_STATES, ...COUNTRIES]);
  for (const name of [question.city, question.state, question.country]) {
    if (name && !NOT_A_GIVEAWAY.has(name)) banned.add(name);
  }
  const found = new Set([
    ...namesIn(question.text, banned),
    ...namesIn(question.hint ?? '', banned),
  ]);
  return [...found];
}

const CATEGORIES = new Set(['stadium', 'event', 'club', 'athlete']);

/** Everything wrong with one question, or nothing. */
export function problems(question: BankQuestion, region: BankRegion): string[] {
  const out: string[] = [];
  const has = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
  if (!/^(usa|world)-[a-z0-9-]+$/.test(question.id ?? '')) out.push('id');
  if (!question.id?.startsWith(`${region}-`)) out.push(`id does not start with ${region}-`);
  for (const key of ['text', 'venue', 'city', 'country', 'hint', 'wikipedia'] as const) {
    if (!has(question[key])) out.push(`no ${key}`);
  }
  if (!Number.isFinite(question.lat) || Math.abs(question.lat) > 90) out.push('lat');
  if (!Number.isFinite(question.lng) || Math.abs(question.lng) > 180) out.push('lng');
  if (!CATEGORIES.has(question.category)) out.push('category');
  if (!Array.isArray(question.facts) || question.facts.length < 3 || question.facts.length > 4) {
    out.push('facts must be 3 or 4');
  }
  if (region === 'usa') {
    if (question.country !== 'United States') out.push('country must be United States');
    if (!US_STATES.includes(question.state ?? '')) out.push('state');
  } else if (question.country === 'United States') {
    out.push('the world round has no American places');
  }
  const named = giveaways(question);
  if (named.length) out.push(`gives away: ${named.join(', ')}`);
  return out;
}

/** A bank question as the game plays it. */
export function toQuestion(question: BankQuestion): Question {
  const aliases = [question.city];
  return {
    id: question.id,
    text: question.text,
    lat: question.lat,
    lng: question.lng,
    category: question.category,
    hint: question.hint,
    country: question.country,
    venue: question.venue,
    aliases,
    facts: question.facts,
  };
}

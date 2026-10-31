/**
 * A round somebody put together themselves.
 *
 * The daily round is the same for everybody, which is what makes it worth
 * comparing. A custom round is the other way round: a player picks the
 * places, plays them, and sends the round to their friends. The whole round
 * travels inside the link - the ids of the questions, who made it and the
 * score to beat - so there is no server and no account involved.
 */

import type { Question } from './question-types.ts';
import { questionPool } from './question-pool.ts';
import { SITE_URL } from './site-content.ts';
import { CHALLENGE_PARAM, readChallengeScore } from './challenge.ts';

/** The fewest questions a custom round can have. */
export const CUSTOM_ROUND_MIN = 3;
/** The most questions a custom round can have - the size of a daily round. */
export const CUSTOM_ROUND_MAX = 10;
/** The size a custom round starts at. */
export const CUSTOM_ROUND_DEFAULT = 5;

/** The parameter the question ids travel in. */
export const ROUND_PARAM = 'r';
/** The parameter the name of the player who made the round travels in. */
export const BY_PARAM = 'by';
/** The parameter the name of the round travels in. */
export const NAME_PARAM = 'n';

/** The longest a name in a link may be. */
const MAX_NAME_LENGTH = 24;
/** The longest a round name may be. */
const MAX_ROUND_NAME_LENGTH = 40;

const byId = new Map(questionPool.map((question) => [question.id, question]));

/** A name, with anything that is not a letter, a digit or a space taken out. */
export function cleanName(value: unknown, maxLength = MAX_NAME_LENGTH): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[^\p{L}\p{N} .'!?&-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/**
 * The questions for a list of ids.
 *
 * An id that is not in the pool is dropped rather than failing the whole
 * round, the same question is never asked twice, and a round never grows past
 * the size of a daily round.
 */
export function questionsForIds(ids: readonly string[]): Question[] {
  const seen = new Set<string>();
  const questions: Question[] = [];
  for (const id of ids) {
    if (questions.length >= CUSTOM_ROUND_MAX) break;
    if (seen.has(id)) continue;
    const question = byId.get(id);
    if (!question) continue;
    seen.add(id);
    questions.push(question);
  }
  return questions;
}

/** The ids of a round, as they are written into a link. */
export function encodeRound(ids: readonly string[]): string {
  return ids.join('.');
}

/** The ids of a round, read back from a link. */
export function decodeRound(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split('.')
    .map((id) => id.trim())
    .filter((id) => /^[a-z0-9-]{1,40}$/i.test(id));
}

/** Everything a link to a custom round carries. */
export interface CustomRoundLink {
  ids: string[];
  /** Who made the round. */
  by?: string;
  /** What the round is called. */
  name?: string;
  /** The score to beat. */
  beat?: number | null;
}

/** The address of a custom round. */
export function buildPlayUrl(link: CustomRoundLink, base: string = SITE_URL): string {
  const url = new URL('/play', base.endsWith('/') ? base : `${base}/`);
  url.searchParams.set(ROUND_PARAM, encodeRound(link.ids));
  const by = cleanName(link.by);
  if (by) url.searchParams.set(BY_PARAM, by);
  const name = cleanName(link.name, MAX_ROUND_NAME_LENGTH);
  if (name) url.searchParams.set(NAME_PARAM, name);
  if (typeof link.beat === 'number' && Number.isFinite(link.beat)) {
    url.searchParams.set(CHALLENGE_PARAM, String(Math.max(0, Math.round(link.beat))));
  }
  return url.toString();
}

/** A custom round, read from the address it was opened at. */
export interface ParsedCustomRound {
  questions: Question[];
  /** How many ids in the link did not match a question. */
  missing: number;
  by: string;
  name: string;
  beat: number | null;
}

/** Reads a custom round from an address. */
export function readPlayParams(search: string | URLSearchParams): ParsedCustomRound {
  const params =
    typeof search === 'string'
      ? new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
      : search;
  const ids = decodeRound(params.get(ROUND_PARAM));
  const questions = questionsForIds(ids);
  return {
    questions,
    missing: Math.max(0, Math.min(ids.length, CUSTOM_ROUND_MAX) - questions.length),
    by: cleanName(params.get(BY_PARAM)),
    name: cleanName(params.get(NAME_PARAM), MAX_ROUND_NAME_LENGTH),
    beat: readChallengeScore(params),
  };
}

/** Lower case, with the accents taken off, so "Montreal" finds "Montréal". */
function fold(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * The questions that match a search.
 *
 * The search looks at the venue, the question, the country and the other
 * names of the place, and every word typed has to match somewhere. A venue
 * that starts with the search comes first.
 */
export function searchPool(query: string, limit = 30, pool: readonly Question[] = questionPool): Question[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return pool.slice(0, limit);

  const scored: { question: Question; rank: number }[] = [];
  for (const question of pool) {
    const venue = fold(question.venue ?? '');
    const haystack = fold(
      [question.venue, question.text, question.country, ...(question.aliases ?? [])].join(' '),
    );
    if (!words.every((word) => haystack.includes(word))) continue;
    const rank = venue.startsWith(words[0]) ? 0 : venue.includes(words[0]) ? 1 : 2;
    scored.push({ question, rank });
  }
  scored.sort((a, b) => a.rank - b.rank);
  return scored.slice(0, limit).map((entry) => entry.question);
}

/**
 * A random round.
 *
 * The random source can be passed in, so a test can ask for the same round
 * twice. The ids that are already picked are left out.
 */
export function randomIds(
  count: number,
  exclude: readonly string[] = [],
  random: () => number = Math.random,
  pool: readonly Question[] = questionPool,
): string[] {
  const skip = new Set(exclude);
  const ids = pool.map((question) => question.id).filter((id) => !skip.has(id));
  for (let i = ids.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, Math.max(0, count));
}

/** The name of a question as it is shown in the round builder. */
export function questionLabel(question: Question): string {
  return question.venue || question.text;
}

/**
 * The map a custom round is played on.
 *
 * A round that stays inside the United States opens on the American map,
 * where the places are big enough to aim at. Anything else needs the world.
 */
export function roundRegion(questions: readonly Question[]): 'usa' | 'world' {
  return questions.length > 0 && questions.every((question) => question.country === 'United States')
    ? 'usa'
    : 'world';
}

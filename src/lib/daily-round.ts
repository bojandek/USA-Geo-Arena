/**
 * The round of a day, as the browser gets it.
 *
 * The year-long bank is not part of the site: a day's questions are fetched
 * from /api/daily once that day has started, so tomorrow's answers cannot be
 * read out of the bundle. A fetched round is kept on the device, so the
 * round plays again offline and a missed question can be reviewed later.
 *
 * When the server has no round for the day, or cannot be reached, the
 * bundled rotation is played, exactly as before the bank existed.
 */

import { getDailyQuestionsForDay } from './game-data.ts';
import type { Question } from './question-types.ts';
import type { RegionId } from './regions.ts';

const ENDPOINT = '/api/daily';
const STORAGE_PREFIX = 'geoarena-round:';

/** How long the server gets before the bundled round is played instead. */
const TIMEOUT_MS = 4000;

function storageKey(day: string, region: RegionId): string {
  return `${STORAGE_PREFIX}${day}:${region}`;
}

function isQuestionList(value: unknown): value is Question[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof (item as Question).id === 'string' &&
        typeof (item as Question).lat === 'number' &&
        typeof (item as Question).lng === 'number',
    )
  );
}

/** The round kept on this device for a day, if there is one. */
export function cachedRound(day: string, region: RegionId): Question[] | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const value = JSON.parse(localStorage.getItem(storageKey(day, region)) ?? 'null');
    return isQuestionList(value) ? value : null;
  } catch {
    return null;
  }
}

function keepRound(day: string, region: RegionId, questions: Question[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(storageKey(day, region), JSON.stringify(questions));
  } catch {
    // Storage may be full or unavailable; the round still plays.
  }
}

/** Every question from the rounds kept on this device. */
export function cachedQuestions(): Question[] {
  if (typeof localStorage === 'undefined') return [];
  const found: Question[] = [];
  try {
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (!key?.startsWith(STORAGE_PREFIX)) continue;
      const value = JSON.parse(localStorage.getItem(key) ?? 'null');
      if (isQuestionList(value)) found.push(...value);
    }
  } catch {
    // A broken entry is skipped.
  }
  return found;
}

/**
 * The questions of a day: the one kept on the device, the one the server
 * hands out, or the bundled rotation, in that order.
 */
export async function loadDailyRound(day: string, region: RegionId): Promise<Question[]> {
  const kept = cachedRound(day, region);
  if (kept) return kept;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(
      `${ENDPOINT}?day=${encodeURIComponent(day)}&region=${region === 'world' ? 'world' : 'usa'}`,
      { signal: controller.signal },
    );
    if (response.ok) {
      const data = (await response.json()) as { stored?: boolean; questions?: unknown };
      if (data.stored && isQuestionList(data.questions)) {
        keepRound(day, region, data.questions);
        return data.questions;
      }
    }
  } catch {
    // Offline, or the server is slow: the bundled round is played.
  } finally {
    clearTimeout(timer);
  }
  return getDailyQuestionsForDay(day, region);
}

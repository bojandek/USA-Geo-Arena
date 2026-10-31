/**
 * The round of a day, as the server knows it.
 *
 * The rounds of the year-long bank live in the `daily_rounds` table and are
 * never shipped with the site, so nobody can read tomorrow's answers out of
 * the bundle. A day that has no row - before the bank starts, or when the
 * database cannot be reached - falls back to the bundled rotation, so the
 * game never stops because of the database.
 */

import { isBackendConfigured, supabase } from './backend.ts';
import { localDayKey, type BoardRegion } from './round.ts';
import { getDailyQuestionsForDay, type Question } from '../../src/lib/game-data.ts';

/**
 * The latest day anybody can be on: the first time zone to reach a new day is
 * fourteen hours ahead of UTC. A day after this one has not started anywhere.
 */
export function latestOpenDay(now = Date.now()): string {
  return localDayKey(now, 14 * 60);
}

/** True when the day has started somewhere in the world. */
export function hasStarted(day: string, now = Date.now()): boolean {
  return day <= latestOpenDay(now);
}

/** True when the value looks like a question the game can play. */
function isQuestion(value: unknown): value is Question {
  if (!value || typeof value !== 'object') return false;
  const question = value as Record<string, unknown>;
  return (
    typeof question.id === 'string' &&
    typeof question.text === 'string' &&
    typeof question.lat === 'number' &&
    typeof question.lng === 'number'
  );
}

/**
 * Rounds that were read from the database. A scheduled day never changes,
 * so once it is read it is kept for the life of the instance.
 */
const stored = new Map<string, Question[]>();

/** The round stored for a day, or null when there is none. */
export async function storedRound(day: string, region: BoardRegion): Promise<Question[] | null> {
  const key = `${day}:${region}`;
  const cached = stored.get(key);
  if (cached) return cached;
  if (!isBackendConfigured()) return null;

  try {
    const response = await supabase(
      `/rest/v1/daily_rounds?select=questions` +
        `&day_key=eq.${encodeURIComponent(day)}&region=eq.${region}&limit=1`,
    );
    if (!response.ok) return null;
    const rows = (await response.json()) as unknown;
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const questions = (rows[0] as { questions?: unknown }).questions;
    if (!Array.isArray(questions) || questions.length === 0 || !questions.every(isQuestion)) {
      return null;
    }
    stored.set(key, questions);
    return questions;
  } catch {
    return null;
  }
}

/** The round of a day: the stored one, or the bundled rotation without it. */
export async function dailyRound(day: string, region: BoardRegion): Promise<Question[]> {
  return (await storedRound(day, region)) ?? getDailyQuestionsForDay(day, region);
}

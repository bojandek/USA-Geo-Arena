/**
 * The daily record: which days were played, and how well.
 *
 * A streak that is only a number gives the player nothing to look at. A grid
 * of the last few weeks does: it shows the run of days, and the gaps in it,
 * at a glance. That is the difference between a number and a reason to come
 * back.
 *
 * The maths lives here, away from React, so it can be tested.
 */

import { addDays, diffDays, parseDateKey, todayKey } from './date-utils.ts';
import type { DailyResult } from './game-state.ts';

export interface DayActivity {
  /** Local day key (`YYYY-MM-DD`). */
  date: string;
  /** The best score earned that day, across every region. */
  score: number;
  /** True when the day was played at all. */
  played: boolean;
  /** True when the day has not happened yet. */
  future: boolean;
}

/**
 * The best score for each day.
 *
 * A day can have more than one entry - the world round and the American round
 * are tracked separately - so the best of them is what the day is worth.
 */
export function bestScoreByDay(history: DailyResult[]): Map<string, number> {
  const best = new Map<string, number>();
  if (!Array.isArray(history)) return best;
  for (const entry of history) {
    if (!entry || typeof entry.date !== 'string') continue;
    const previous = best.get(entry.date);
    if (previous === undefined || entry.score > previous) best.set(entry.date, entry.score);
  }
  return best;
}

/**
 * The most recent round that was played before the given day.
 *
 * This is what the home page uses to ask the player to beat their own last
 * score. "Your best is 940" is a record; "you scored 812 yesterday" is a
 * challenge, and a challenge is what brings someone back.
 */
export function lastPlayedBefore(
  history: DailyResult[],
  before: string = todayKey(),
): DailyResult | null {
  if (!Array.isArray(history)) return null;
  let best: DailyResult | null = null;
  for (const entry of history) {
    if (!entry || typeof entry.date !== 'string') continue;
    // A day that is not before the given day does not count.
    if (diffDays(entry.date, before) <= 0) continue;
    if (
      !best ||
      entry.date > best.date ||
      (entry.date === best.date && entry.score > best.score)
    ) {
      best = entry;
    }
  }
  return best;
}

/**
 * The last few weeks as a grid of days, ready to be drawn.
 *
 * The grid starts on a Monday and ends with the week that is being lived, so
 * the columns are whole weeks and the rows are the days of the week. Days
 * that have not happened yet are marked, so the player can see where the
 * record stops.
 */
export function buildActivityGrid(
  history: DailyResult[],
  today: string = todayKey(),
  weeks: number = 13,
): DayActivity[] {
  const best = bestScoreByDay(history);
  // Monday is the first day of the week, so the day of the week is shifted.
  const dayOfWeek = (parseDateKey(today).getDay() + 6) % 7;
  const lastWeekStart = addDays(today, -dayOfWeek);
  const firstWeekStart = addDays(lastWeekStart, -(Math.max(1, weeks) - 1) * 7);

  const cells: DayActivity[] = [];
  for (let i = 0; i < Math.max(1, weeks) * 7; i++) {
    const date = addDays(firstWeekStart, i);
    const score = best.get(date);
    cells.push({
      date,
      score: score ?? 0,
      played: score !== undefined,
      future: diffDays(today, date) > 0,
    });
  }
  return cells;
}

/**
 * How strong the colour of a day should be, from nothing to the full round.
 *
 * Five steps is enough to show the shape of a month without turning the grid
 * into a rainbow.
 */
export function activityLevel(score: number, maxScore: number = 1000): number {
  if (!Number.isFinite(score) || score <= 0) return 0;
  const ratio = Math.min(1, score / Math.max(1, maxScore));
  if (ratio < 0.4) return 1;
  if (ratio < 0.6) return 2;
  if (ratio < 0.8) return 3;
  if (ratio < 0.95) return 4;
  return 5;
}

/**
 * How many days in a row the player has played, counting back from today.
 *
 * This is the number of days in the grid that are filled in without a gap,
 * which is the same thing the streak says but seen rather than counted.
 */
export function activeDaysInRow(cells: DayActivity[], today: string = todayKey()): number {
  let count = 0;
  // Walk back from today, one day at a time.
  for (let offset = 0; offset < cells.length; offset++) {
    const date = addDays(today, -offset);
    const cell = cells.find((item) => item.date === date);
    if (!cell || !cell.played) break;
    count++;
  }
  return count;
}
/** Milliseconds until the next local midnight, when the next round opens. */
export function msUntilNextDay(now: Date = new Date()): number {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return Math.max(0, midnight.getTime() - now.getTime());
}

/** A duration as `5h 12m`, or `12m 30s` when under an hour. */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

/**
 * Where the streak stands today.
 *
 * - `none`: no streak to protect
 * - `safe`: today's round is done
 * - `at-risk`: played yesterday, not yet today - the streak ends at midnight
 * - `frozen`: missed yesterday, but a freeze will cover it if they play today
 * - `lost`: the gap is too long; the next round starts a new streak
 */
export type StreakStatusKind = 'none' | 'safe' | 'at-risk' | 'frozen' | 'lost';

export interface StreakStatus {
  kind: StreakStatusKind;
  /** The streak as it really stands - zero once it is lost. */
  streak: number;
}

export function streakStatus(
  state: { streak: number; lastPlayedDate: string | null; streakFreezes: number },
  today: string = todayKey(),
): StreakStatus {
  const streak = Math.max(0, Number(state.streak) || 0);
  if (!state.lastPlayedDate || streak === 0) return { kind: 'none', streak: 0 };
  const gap = diffDays(state.lastPlayedDate, today);
  if (gap <= 0) return { kind: 'safe', streak };
  if (gap === 1) return { kind: 'at-risk', streak };
  if (gap === 2 && state.streakFreezes > 0) return { kind: 'frozen', streak };
  return { kind: 'lost', streak: 0 };
}

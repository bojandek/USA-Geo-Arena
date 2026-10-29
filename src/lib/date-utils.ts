/**
 * Single source of truth for calendar days inside USA GeoArena.
 *
 * Everything that represents "a day" (daily challenge, streak, archive,
 * leaderboard history) uses the user's LOCAL calendar day, never UTC.
 * Mixing the two previously caused the daily challenge to roll over at
 * 01:00-02:00 local time in UTC+2 and the streak to double-count.
 *
 * A "day key" is a `YYYY-MM-DD` string in local time.
 */

/** Formats a Date into its local calendar day key (`YYYY-MM-DD`). */
export function dateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** The current local calendar day key. */
export function todayKey(): string {
  return dateKey(new Date());
}

/** Parses a day key into a Date at local midnight. */
export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

/** Shifts a day key by `days` (may be negative). */
export function addDays(key: string, days: number): string {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

/**
 * Whole-day difference `to - from`.
 * Uses local midnights and rounds so DST transitions do not skew the result.
 */
export function diffDays(from: string, to: string): number {
  const start = parseDateKey(from).getTime();
  const end = parseDateKey(to).getTime();
  return Math.round((end - start) / 86_400_000);
}

/** True when `key` is the calendar day right before `today`. */
export function isPreviousDay(key: string, today: string = todayKey()): boolean {
  return diffDays(key, today) === 1;
}

/** Human readable label for a day key: Today / Yesterday / Mon, 5 Jan 2025. */
export function formatDayLabel(key: string, today: string = todayKey()): string {
  if (key === today) return 'Today';
  if (isPreviousDay(key, today)) return 'Yesterday';

  const date = parseDateKey(key);
  const sameYear = date.getFullYear() === parseDateKey(today).getFullYear();
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  });
}

/** Long label used in headings, e.g. "Monday, 5 January 2025". */
export function formatFullDayLabel(key: string): string {
  return parseDateKey(key).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

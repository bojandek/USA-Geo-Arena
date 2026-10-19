/**
 * Pure game-state logic.
 *
 * Everything in this module is a plain function over plain data: no React,
 * no localStorage, no side effects. That keeps the rules (streak, scoring,
 * achievements, archive) unit-testable and guarantees that the React layer
 * cannot accidentally mutate state.
 *
 * Day semantics: a "day" is the user's LOCAL calendar day, identified by a
 * `YYYY-MM-DD` day key (see `date-utils`).
 */

import { diffDays, isPreviousDay, todayKey } from './date-utils.ts';

/** Maximum points a single question can yield. */
export const MAX_QUESTION_SCORE = 1000;

/** Number of questions in a daily challenge. */
export const DAILY_QUESTION_COUNT = 10;

/** Maximum points for a full daily challenge. */
export const MAX_DAILY_SCORE = MAX_QUESTION_SCORE * DAILY_QUESTION_COUNT;

/** Points required for each level. */
export const POINTS_PER_LEVEL = 5000;

/** How many days of history are kept. */
export const HISTORY_LIMIT = 30;

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface DailyResult {
  /** Local calendar day key (`YYYY-MM-DD`). */
  date: string;
  score: number;
  /** Score as a percentage of the maximum achievable score. */
  accuracy: number;
  totalDistance: number;
  perfectCount: number;
  /** True when this entry was produced by replaying an archived day. */
  isReplay?: boolean;
}

export interface GameState {
  /** Schema version, used for migrations. */
  version: number;

  // Progress
  level: number;
  totalScore: number;
  streak: number;
  /** Local day key of the last COMPLETED daily challenge. */
  lastPlayedDate: string | null;
  achievements: Achievement[];

  // Daily challenge
  /** Day key of the last completed daily challenge (null = never played). */
  dailyCompletedDate: string | null;
  dailyScore: number;

  // Stats
  gamesPlayed: number;
  bestScore: number;
  averageScore: number;
  totalDistance: number;
  averageDistance: number;
  perfectGuesses: number;

  // History (newest last)
  dailyHistory: DailyResult[];

  // Practice (kept separate so it never inflates progression)
  practiceGames: number;
  practiceBestScore: number;
  practiceTotalScore: number;
}

/** All unlockable achievements. */
export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_win', title: 'First Steps', description: 'Complete your first daily challenge', icon: '🎯' },
  { id: 'perfect_10', title: 'Perfection', description: 'Score a perfect 10,000 points in a single game', icon: '💯' },
  { id: 'streak_3', title: 'On Fire', description: 'Maintain a 3-day streak', icon: '🔥' },
  { id: 'streak_7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '⚡' },
  { id: 'streak_30', title: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '👑' },
  { id: 'perfect_guess', title: 'Sharpshooter', description: 'Guess within 25km', icon: '🎯' },
  { id: 'perfect_5', title: 'Eagle Eye', description: 'Get 5 perfect guesses (< 25km)', icon: '🦅' },
  { id: 'games_10', title: 'Dedicated Player', description: 'Play 10 daily challenges', icon: '🎮' },
  { id: 'games_50', title: 'Geography Expert', description: 'Play 50 daily challenges', icon: '🌍' },
  { id: 'games_100', title: 'World Traveler', description: 'Play 100 daily challenges', icon: '✈️' },
  { id: 'score_50k', title: 'Rising Star', description: 'Reach 50,000 total points', icon: '⭐' },
  { id: 'score_100k', title: 'Champion', description: 'Reach 100,000 total points', icon: '🏆' },
];

/** A fresh, zeroed state. */
export function createInitialState(): GameState {
  return {
    version: 2,
    level: 1,
    totalScore: 0,
    streak: 0,
    lastPlayedDate: null,
    achievements: [],
    dailyCompletedDate: null,
    dailyScore: 0,
    gamesPlayed: 0,
    bestScore: 0,
    averageScore: 0,
    totalDistance: 0,
    averageDistance: 0,
    perfectGuesses: 0,
    dailyHistory: [],
    practiceGames: 0,
    practiceBestScore: 0,
    practiceTotalScore: 0,
  };
}

/** Level derived from the total score. */
export function levelForScore(totalScore: number): number {
  return Math.floor(totalScore / POINTS_PER_LEVEL) + 1;
}

/** Score expressed as a percentage of the maximum achievable score. */
export function accuracyFor(score: number, maxScore: number = MAX_DAILY_SCORE): number {
  if (maxScore <= 0) return 0;
  return Math.round((score / maxScore) * 100);
}


/**
 * Migrates a persisted (possibly older or corrupted) payload into a valid
 * state. Unknown / broken data degrades to a fresh state instead of throwing.
 */
export function migrateState(raw: unknown): GameState {
  const base = createInitialState();
  if (!raw || typeof raw !== 'object') return base;

  const saved = raw as Partial<GameState>;

  const history: DailyResult[] = Array.isArray(saved.dailyHistory)
    ? saved.dailyHistory
        .filter((entry): entry is DailyResult => !!entry && typeof entry.date === 'string')
        .map((entry) => ({
          date: entry.date,
          score: Number(entry.score) || 0,
          accuracy: Number(entry.accuracy) || 0,
          totalDistance: Number(entry.totalDistance) || 0,
          perfectCount: Number(entry.perfectCount) || 0,
          isReplay: Boolean(entry.isReplay),
        }))
        .slice(-HISTORY_LIMIT)
    : [];

  const achievements = Array.isArray(saved.achievements)
    ? saved.achievements.filter(
        (a): a is Achievement => !!a && typeof a.id === 'string' && typeof a.title === 'string',
      )
    : [];

  // Legacy payloads stored an ISO timestamp; normalise it to a local day key.
  const lastPlayedDate = normalizeDayKey(saved.lastPlayedDate);
  const totalScore = Number(saved.totalScore) || 0;
  const gamesPlayed = Number(saved.gamesPlayed) || 0;

  return {
    ...base,
    totalScore,
    level: levelForScore(totalScore),
    streak: Number(saved.streak) || 0,
    lastPlayedDate,
    achievements,
    dailyCompletedDate: normalizeDayKey(saved.dailyCompletedDate) ?? lastPlayedDate,
    dailyScore: Number(saved.dailyScore) || 0,
    gamesPlayed,
    bestScore: Number(saved.bestScore) || 0,
    averageScore: Number(saved.averageScore) || 0,
    totalDistance: Number(saved.totalDistance) || 0,
    averageDistance: Number(saved.averageDistance) || 0,
    perfectGuesses: Number(saved.perfectGuesses) || 0,
    dailyHistory: history,
    practiceGames: Number(saved.practiceGames) || 0,
    practiceBestScore: Number(saved.practiceBestScore) || 0,
    practiceTotalScore: Number(saved.practiceTotalScore) || 0,
  };
}

/** Accepts either a day key or an ISO timestamp and returns a day key. */
function normalizeDayKey(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Computes the streak after completing a daily challenge.
 *
 * - never played -> 1
 * - played yesterday -> streak + 1
 * - already played today -> unchanged (replays never inflate the streak)
 * - missed at least one day -> reset to 1
 */
export function computeStreak(
  currentStreak: number,
  lastPlayedDate: string | null,
  today: string = todayKey(),
): number {
  if (!lastPlayedDate) return 1;
  if (lastPlayedDate === today) return Math.max(currentStreak, 1);
  if (isPreviousDay(lastPlayedDate, today)) return currentStreak + 1;
  // A gap of one or more days resets the streak.
  return 1;
}


export interface DailyCompletion {
  /** Day key the challenge belongs to. */
  date: string;
  score: number;
  totalDistance: number;
  perfectCount: number;
  /** Maximum achievable score, used for the accuracy percentage. */
  maxScore?: number;
  /** Wall-clock ISO timestamp used to stamp unlocked achievements. */
  now?: string;
  /**
   * The current day key. Defaults to the real local day; injectable so the
   * rules can be tested deterministically.
   */
  today?: string;
}

/**
 * Applies a finished daily challenge.
 *
 * Rules:
 * - A challenge for TODAY is the only thing that advances progression
 *   (total score, level, streak, distance, perfect guesses).
 * - Replaying TODAY replaces that day and adjusts the lifetime totals by the
 *   difference, so the totals always equal the sum of the best score per day.
 *   It never increases the number of games played.
 * - Replaying an ARCHIVED day only updates that day's entry (and can set a
 *   new personal best). It never changes progression or the streak.
 */
export function applyDailyCompletion(state: GameState, completion: DailyCompletion): GameState {
  const { date } = completion;
  // Normalise the numeric inputs. A missing value must never poison the
  // persisted state with NaN - a NaN counter silently disables every
  // achievement that is derived from it.
  const score = Number(completion.score) || 0;
  const totalDistance = Number(completion.totalDistance) || 0;
  const perfectCount = Number(completion.perfectCount) || 0;
  const maxScore = completion.maxScore ?? MAX_DAILY_SCORE;
  const now = completion.now ?? new Date().toISOString();
  const today = completion.today ?? todayKey();

  const existing = state.dailyHistory.find((entry) => entry.date === date);
  const isReplay = Boolean(existing);

  const result: DailyResult = {
    date,
    score,
    accuracy: accuracyFor(score, maxScore),
    totalDistance,
    perfectCount,
    isReplay,
  };

  const history = isReplay
    ? state.dailyHistory.map((entry) => (entry.date === date ? result : entry))
    : [...state.dailyHistory, result].slice(-HISTORY_LIMIT);

  const advancesProgression = date === today;

  // Lifetime counters only move for today's challenge.
  const scoreDelta = advancesProgression ? score - (existing?.score ?? 0) : 0;
  const distanceDelta = advancesProgression ? totalDistance - (existing?.totalDistance ?? 0) : 0;
  const perfectDelta = advancesProgression ? perfectCount - (existing?.perfectCount ?? 0) : 0;

  const totalScore = state.totalScore + scoreDelta;
  const newTotalDistance = state.totalDistance + distanceDelta;
  const perfectGuesses = state.perfectGuesses + perfectDelta;
  const gamesPlayed = advancesProgression && !isReplay ? state.gamesPlayed + 1 : state.gamesPlayed;

  // Only a challenge completed for TODAY advances the streak.
  const streak = advancesProgression
    ? computeStreak(state.streak, state.lastPlayedDate, today)
    : state.streak;
  const lastPlayedDate = advancesProgression ? today : state.lastPlayedDate;

  const next: GameState = {
    ...state,
    totalScore,
    level: levelForScore(totalScore),
    streak,
    lastPlayedDate,
    dailyCompletedDate: advancesProgression ? today : state.dailyCompletedDate ?? date,
    dailyScore: advancesProgression ? score : state.dailyScore,
    gamesPlayed,
    bestScore: Math.max(state.bestScore, score),
    averageScore: gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : 0,
    totalDistance,
    averageDistance: gamesPlayed > 0 ? Math.round(newTotalDistance / gamesPlayed) : 0,
    perfectGuesses,
    dailyHistory: history,
  };

  return withEarnedAchievements(next, now);
}

/** Applies a finished practice round. Practice never affects progression. */
export function applyPracticeCompletion(state: GameState, score: number): GameState {
  return {
    ...state,
    practiceGames: state.practiceGames + 1,
    practiceBestScore: Math.max(state.practiceBestScore, score),
    practiceTotalScore: state.practiceTotalScore + score,
  };
}


/**
 * Evaluates every achievement rule against the state and unlocks the ones
 * that are now satisfied but not yet unlocked.
 */
export function withEarnedAchievements(state: GameState, now: string = new Date().toISOString()): GameState {
  const earned = evaluateAchievements(state);
  if (earned.length === 0) return state;

  const existing = new Set(state.achievements.map((a) => a.id));
  const additions = earned
    .filter((id) => !existing.has(id))
    .map((id) => {
      const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === id)!;
      return { ...achievement, unlockedAt: now };
    });

  if (additions.length === 0) return state;
  return { ...state, achievements: [...state.achievements, ...additions] };
}

/** Ids of all achievements satisfied by the given state. */
export function evaluateAchievements(state: GameState): string[] {
  const earned: string[] = [];

  if (state.gamesPlayed >= 1) earned.push('first_win');
  if (state.bestScore >= MAX_DAILY_SCORE) earned.push('perfect_10');
  if (state.streak >= 3) earned.push('streak_3');
  if (state.streak >= 7) earned.push('streak_7');
  if (state.streak >= 30) earned.push('streak_30');
  if (state.perfectGuesses >= 1) earned.push('perfect_guess');
  if (state.perfectGuesses >= 5) earned.push('perfect_5');
  if (state.gamesPlayed >= 10) earned.push('games_10');
  if (state.gamesPlayed >= 50) earned.push('games_50');
  if (state.gamesPlayed >= 100) earned.push('games_100');
  if (state.totalScore >= 50_000) earned.push('score_50k');
  if (state.totalScore >= 100_000) earned.push('score_100k');

  return earned;
}

/** Top scores for the leaderboard, sorted by score (never mutates history). */
export function buildLeaderboard(history: DailyResult[], limit = 10): DailyResult[] {
  return [...history].sort((a, b) => b.score - a.score).slice(0, limit);
}

export interface ArchiveEntry {
  date: string;
  score: number | null;
  completed: boolean;
  locked: boolean;
}

/**
 * Builds the last `days` archive entries from real history.
 * Days without a result are simply "not played yet".
 */
export function buildArchiveEntries(
  history: DailyResult[],
  days = HISTORY_LIMIT,
  today: string = todayKey(),
): ArchiveEntry[] {
  const byDate = new Map(history.map((entry) => [entry.date, entry]));
  const entries: ArchiveEntry[] = [];

  for (let offset = 0; offset < days; offset++) {
    const date = shiftDay(today, -offset);
    const result = byDate.get(date);
    entries.push({
      date,
      score: result ? result.score : null,
      completed: Boolean(result),
      locked: false,
    });
  }

  return entries;
}

/** Shifts a day key by `days` (local calendar arithmetic). */
function shiftDay(key: string, days: number): string {
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** True when the daily challenge for `date` has already been completed. */
export function isDayCompleted(state: GameState, date: string): boolean {
  return state.dailyHistory.some((entry) => entry.date === date);
}

/** Number of days between the last completion and today (0 = today). */
export function daysSinceLastCompletion(state: GameState, today: string = todayKey()): number | null {
  if (!state.lastPlayedDate) return null;
  return diffDays(state.lastPlayedDate, today);
}


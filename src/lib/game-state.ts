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
import { roundScore } from './numbers.ts';
import { DEFAULT_REGION } from './regions.ts';
import { LOCATION_SHARE, MAX_QUESTION_SCORE, MAX_TIME_POINTS_PER_QUESTION, maxRoundScore } from './time-bonus.ts';

/** Number of questions in a daily challenge. */
export const DAILY_QUESTION_COUNT = 10;

/**
 * Maximum points for a full daily challenge.
 *
 * The first seven questions are worth 100 each and the last three are worth
 * more, so a full round is worth 1,300.
 */
export const MAX_DAILY_SCORE = maxRoundScore(DAILY_QUESTION_COUNT);

/** Maximum points a full round can earn from the location alone (90%). */
export const MAX_LOCATION_SCORE = Math.round(MAX_DAILY_SCORE * LOCATION_SHARE * 10) / 10;

/** Maximum points a full round can earn from the speed alone (10%). */
export const MAX_TIME_SCORE = MAX_TIME_POINTS_PER_QUESTION * DAILY_QUESTION_COUNT;

/**
 * Points required to reach a level from the previous one.
 *
 * The requirement grows with every level, because a flat one makes the level
 * number meaningless: at a thousand points a day, a player who plays every day
 * would be past level seven hundred within a year. With this curve the same
 * player reaches level 25 after a year and level 50 after four, which keeps
 * the level a real long term target.
 */
export const POINTS_PER_LEVEL = 1250;

/** How many days of history are kept. */
export const HISTORY_LIMIT = 60;

/** How many days the archive shows. */
export const ARCHIVE_DAYS = 30;

/**
 * How many streak freezes can be banked at the same time.
 *
 * Two is enough to cover a weekend without making the streak permanent.
 */
export const MAX_STREAK_FREEZES = 2;

/**
 * A freeze is earned every this many days of a streak.
 *
 * Seven days is long enough that the freeze feels like a reward for real
 * consistency, and short enough that a player who is on a roll actually gets
 * to use it.
 */
export const FREEZE_EVERY_N_DAYS = 7;

/**
 * The multiplier that a streak is worth.
 *
 * A streak that only sits on a screen as a number is a number the player has
 * no reason to protect. Making the streak worth extra points gives it one:
 * play every day and the same answers are worth more.
 *
 * The thresholds are the streak the player was on when the round started, so
 * the bonus is never a surprise - the game shows the multiplier while the
 * player is answering.
 */
export function streakMultiplier(streak: number): number {
  const days = Math.max(0, Math.floor(Number(streak) || 0));
  if (days >= 30) return 1.5;
  if (days >= 7) return 1.25;
  if (days >= 3) return 1.1;
  return 1;
}

/** The largest multiplier a streak can reach. */
export const MAX_STREAK_MULTIPLIER = 1.5;

/** The streak at which each step of the multiplier is reached. */
export const STREAK_MULTIPLIER_TIERS: { streak: number; multiplier: number }[] = [
  { streak: 3, multiplier: 1.1 },
  { streak: 7, multiplier: 1.25 },
  { streak: 30, multiplier: 1.5 },
];

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

/** What the player answered for a single question. */
export interface DailyAnswer {
  /** The id of the question that was answered. */
  questionId: string;
  /** How far the guess was from the truth, in kilometres. */
  distance: number;
  /** The points the answer earned. */
  score: number;
}

export interface DailyResult {
  /** Local calendar day key (`YYYY-MM-DD`). */
  date: string;
  /** The region the round was played in. `world` when it is not set. */
  region?: string;
  score: number;
  /** Score as a percentage of the maximum achievable score. */
  accuracy: number;
  totalDistance: number;
  perfectCount: number;
  /** Points earned for answering quickly across the round. */
  timeBonus?: number;
  /** Points earned on distance alone, without any time bonus. */
  distanceScore?: number;
  /**
   * Extra points earned because of the streak multiplier.
   *
   * The bonus is added on top of the round, as its own line, so the player
   * can see where it came from rather than wondering why the total does not
   * add up.
   */
  streakBonus?: number;
  /** The multiplier the streak was worth when the round was played. */
  streakMultiplier?: number;
  /** True when this entry was produced by replaying an archived day. */
  isReplay?: boolean;
  /**
   * What the player answered, one entry per question.
   *
   * This is what the review mode is built from: the questions the player
   * missed are the ones worth trying again.
   */
  answers?: DailyAnswer[];
}

export interface GameState {
  /** Schema version, used for migrations. */
  version: number;

  // Progress
  level: number;
  totalScore: number;
  streak: number;
  /**
   * Streak freezes in hand.
   *
   * A freeze covers one missed day: when the player comes back after exactly
   * one day away, the streak carries on instead of resetting. Freezes are
   * earned every seven days of a streak and can be banked up to two, so the
   * mechanic rewards consistency without making the streak unbreakable.
   */
  streakFreezes: number;
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

  /** The largest speed bonus earned in a single round. */
  bestTimeBonus: number;

  /**
   * The best round score on distance alone, ignoring the time bonus.
   *
   * The "Perfection" badge is about getting every answer right, so it has to
   * be measured without the speed bonus - otherwise a fast but slightly
   * wrong round could reach the same total.
   */
  bestDistanceScore: number;

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
  { id: 'perfect_10', title: 'Perfection', description: 'Get all 10 answers within 25km of the truth', icon: '💯' },
  { id: 'streak_3', title: 'On Fire', description: 'Maintain a 3-day streak', icon: '🔥' },
  { id: 'streak_7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '⚡' },
  { id: 'streak_30', title: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '👑' },
  { id: 'perfect_guess', title: 'Sharpshooter', description: 'Guess within 25km', icon: '🎯' },
  { id: 'perfect_5', title: 'Eagle Eye', description: 'Get 5 perfect guesses (< 25km)', icon: '🦅' },
  { id: 'speed_demon', title: 'Speed Demon', description: 'Earn the full speed bonus on all 10 questions', icon: '⚡' },
  { id: 'speed_50', title: 'Quick Thinker', description: 'Earn 50 speed bonus points in a single round', icon: '🚀' },
  { id: 'games_10', title: 'Dedicated Player', description: 'Play 10 daily challenges', icon: '🎮' },
  { id: 'games_50', title: 'Geography Expert', description: 'Play 50 daily challenges', icon: '🌍' },
  { id: 'games_100', title: 'World Traveler', description: 'Play 100 daily challenges', icon: '✈️' },
  { id: 'score_1k', title: 'Rising Star', description: 'Reach 1,000 total points', icon: '⭐' },
  { id: 'score_5k', title: 'Champion', description: 'Reach 5,000 total points', icon: '🏆' },
  { id: 'score_20k', title: 'Legend', description: 'Reach 20,000 total points', icon: '👑' },
];

/** A fresh, zeroed state. */
export function createInitialState(): GameState {
  return {
    version: 3,
    level: 1,
    totalScore: 0,
    streak: 0,
    streakFreezes: 0,
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
    bestTimeBonus: 0,
    bestDistanceScore: 0,
    dailyHistory: [],
    practiceGames: 0,
    practiceBestScore: 0,
    practiceTotalScore: 0,
  };
}

/**
 * Total points needed to reach a level.
 *
 * Level 1 is free, level 2 costs 5,000 points, level 3 costs 15,000 in
 * total, level 4 costs 30,000, and so on - the cost of each level grows with
 * the level number.
 */
export function pointsForLevel(level: number): number {
  const n = Math.max(1, Math.floor(level) || 1);
  return (POINTS_PER_LEVEL * n * (n - 1)) / 2;
}

/** Level derived from the total score. */
export function levelForScore(totalScore: number): number {
  const total = Math.max(0, Number(totalScore) || 0);
  let level = 1;
  // Each step costs more than the last, so the loop is short even for a
  // player with millions of points.
  while (pointsForLevel(level + 1) <= total) level++;
  return level;
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
          // Older payloads had no region; they all belong to the world round.
          region: entry.region ?? DEFAULT_REGION,
          // Rounded on the way in, so a score saved by an older build cannot
          // come back with a tail of floating point noise.
          score: roundScore(Number(entry.score) || 0),
          accuracy: Number(entry.accuracy) || 0,
          totalDistance: roundScore(Number(entry.totalDistance) || 0),
          perfectCount: Number(entry.perfectCount) || 0,
          timeBonus: roundScore(Number(entry.timeBonus) || 0),
          streakBonus: roundScore(Number(entry.streakBonus) || 0) || undefined,
          streakMultiplier: Number(entry.streakMultiplier) || undefined,
          isReplay: Boolean(entry.isReplay),
          answers: Array.isArray(entry.answers)
            ? entry.answers
                .filter((answer) => answer && typeof answer.questionId === 'string')
                .map((answer) => ({
                  questionId: answer.questionId,
                  distance: roundScore(Number(answer.distance) || 0),
                  score: roundScore(Number(answer.score) || 0),
                }))
            : undefined,
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
  const totalScore = roundScore(Number(saved.totalScore) || 0);
  const gamesPlayed = Number(saved.gamesPlayed) || 0;

  return {
    ...base,
    totalScore,
    level: levelForScore(totalScore),
    streak: Number(saved.streak) || 0,
    streakFreezes: Math.max(
      0,
      Math.min(Number(saved.streakFreezes) || 0, MAX_STREAK_FREEZES),
    ),
    lastPlayedDate,
    achievements,
    dailyCompletedDate: normalizeDayKey(saved.dailyCompletedDate) ?? lastPlayedDate,
    dailyScore: Number(saved.dailyScore) || 0,
    gamesPlayed,
    bestScore: roundScore(Number(saved.bestScore) || 0),
    averageScore: roundScore(Number(saved.averageScore) || 0),
    totalDistance: Number(saved.totalDistance) || 0,
    averageDistance: Number(saved.averageDistance) || 0,
    perfectGuesses: Number(saved.perfectGuesses) || 0,
    bestTimeBonus: Number(saved.bestTimeBonus) || 0,
    bestDistanceScore: Number(saved.bestDistanceScore) || 0,
    dailyHistory: history,
    practiceGames: Number(saved.practiceGames) || 0,
    practiceBestScore: roundScore(Number(saved.practiceBestScore) || 0),
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

export interface StreakOutcome {
  /** The streak after the round. */
  streak: number;
  /** True when a freeze was spent to cover a missed day. */
  freezeUsed: boolean;
  /** True when a new freeze was earned by the streak. */
  freezeEarned: boolean;
  /** How many freezes are left after the round. */
  freezes: number;
}

/**
 * Computes the streak after completing a daily challenge, including the
 * streak-freeze rule.
 *
 * - never played -> 1
 * - played yesterday -> streak + 1
 * - already played today -> unchanged (a replay never inflates the streak)
 * - missed exactly one day and a freeze is in hand -> the freeze covers the
 *   missed day and the streak carries on
 * - missed two or more days -> reset to 1
 *
 * Every seventh day of a streak earns a freeze, up to the cap. Because the
 * streak only ever grows by one per day, each multiple is reached exactly
 * once, so a replay can never earn the same freeze twice.
 */
export function computeStreakWithFreeze(
  currentStreak: number,
  lastPlayedDate: string | null,
  today: string,
  freezes: number,
): StreakOutcome {
  const held = Math.max(0, Math.min(Math.floor(freezes) || 0, MAX_STREAK_FREEZES));

  if (!lastPlayedDate) {
    return { streak: 1, freezeUsed: false, freezeEarned: false, freezes: held };
  }
  if (lastPlayedDate === today) {
    // A replay never moves the streak, and never earns a freeze.
    return {
      streak: Math.max(currentStreak, 1),
      freezeUsed: false,
      freezeEarned: false,
      freezes: held,
    };
  }

  const gap = diffDays(lastPlayedDate, today);
  let streak: number;
  let freezeUsed = false;
  let left = held;

  if (gap === 1) {
    streak = currentStreak + 1;
  } else if (gap === 2 && held > 0) {
    // Exactly one day was missed - the freeze covers it and the streak
    // survives. A longer gap cannot be covered by a single freeze.
    streak = currentStreak + 1;
    freezeUsed = true;
    left = held - 1;
  } else {
    streak = 1;
  }

  const freezeEarned =
    streak > 0 && streak % FREEZE_EVERY_N_DAYS === 0 && left < MAX_STREAK_FREEZES;
  if (freezeEarned) left += 1;

  return { streak, freezeUsed, freezeEarned, freezes: left };
}


export interface DailyCompletion {
  /** Day key the challenge belongs to. */
  date: string;
  /** The region the round was played in. `world` when it is not set. */
  region?: string;
  score: number;
  totalDistance: number;
  perfectCount: number;
  /** Points earned for answering quickly across the round. */
  timeBonus?: number;
  /** Maximum achievable score, used for the accuracy percentage. */
  maxScore?: number;
  /**
   * The score before the streak bonus.
   *
   * The bonus is added on top of the round, so without the base the distance
   * score would be inflated by it and the accuracy would come out wrong.
   */
  baseScore?: number;
  /** The multiplier the streak was worth when the round was played. */
  streakMultiplier?: number;
  /** What the player answered, one entry per question. */
  answers?: DailyAnswer[];
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
  // The region is part of the identity of a round: the world challenge and the
  // American challenge are two different rounds and are tracked separately.
  const region = completion.region ?? DEFAULT_REGION;
  // Normalise the numeric inputs. A missing value must never poison the
  // persisted state with NaN - a NaN counter silently disables every
  // achievement that is derived from it.
  const score = roundScore(Number(completion.score) || 0);
  // The score before the streak bonus. The bonus is added on top of the
  // round, so the base is what the answers were actually worth.
  const baseScore = roundScore(
    completion.baseScore === undefined ? score : Number(completion.baseScore) || 0,
  );
  const multiplier = Number(completion.streakMultiplier) || 1;
  const streakBonus = roundScore(Math.max(0, score - baseScore));
  const totalDistance = roundScore(Number(completion.totalDistance) || 0);
  const perfectCount = Number(completion.perfectCount) || 0;
  const timeBonus = roundScore(Number(completion.timeBonus) || 0);
  // The location score is the base total minus the speed share. It is what the
  // "Perfection" badge is measured against, so it is worked out from the base
  // and never from the total, which carries the streak bonus.
  const distanceScore = roundScore(Math.max(0, baseScore - timeBonus));
  const maxScore = completion.maxScore ?? MAX_DAILY_SCORE;
  // The per-question answers are kept so the review mode can offer the
  // questions the player missed. A replay that carries no answers keeps the
  // ones already stored rather than wiping them.
  const answers = Array.isArray(completion.answers)
    ? completion.answers
        .filter((answer) => answer && typeof answer.questionId === 'string')
        .map((answer) => ({
          questionId: answer.questionId,
          distance: roundScore(Number(answer.distance) || 0),
          score: roundScore(Number(answer.score) || 0),
        }))
    : undefined;
  const now = completion.now ?? new Date().toISOString();
  const today = completion.today ?? todayKey();

  const existing = state.dailyHistory.find(
    (entry) => entry.date === date && (entry.region ?? DEFAULT_REGION) === region,
  );
  const isReplay = Boolean(existing);

  const result: DailyResult = {
    date,
    region,
    score,
    streakBonus: streakBonus > 0 ? streakBonus : undefined,
    streakMultiplier: multiplier > 1 ? multiplier : undefined,
    // Accuracy is how close the guesses were, so it is measured on the
    // location points alone - the speed share says nothing about accuracy.
    accuracy: accuracyFor(distanceScore, maxScore * LOCATION_SHARE),
    totalDistance,
    perfectCount,
    timeBonus,
    distanceScore,
    isReplay,
    answers: answers ?? existing?.answers,
  };

  const history = isReplay
    ? state.dailyHistory.map((entry) =>
        entry.date === date && (entry.region ?? DEFAULT_REGION) === region ? result : entry,
      )
    : [...state.dailyHistory, result].slice(-HISTORY_LIMIT);

  const advancesProgression = date === today;

  // Lifetime counters only move for today's challenge.
  const scoreDelta = advancesProgression ? score - (existing?.score ?? 0) : 0;
  const distanceDelta = advancesProgression ? totalDistance - (existing?.totalDistance ?? 0) : 0;
  const perfectDelta = advancesProgression ? perfectCount - (existing?.perfectCount ?? 0) : 0;

  const totalScore = roundScore(state.totalScore + scoreDelta);
  const newTotalDistance = state.totalDistance + distanceDelta;
  const perfectGuesses = state.perfectGuesses + perfectDelta;
  const gamesPlayed = advancesProgression && !isReplay ? state.gamesPlayed + 1 : state.gamesPlayed;

  // The best speed bonus is a record, so it is kept even for a replay or an
  // archived day - losing it would take the achievement away again.
  const bestTimeBonus = roundScore(Math.max(state.bestTimeBonus, timeBonus));
  const bestDistanceScore = roundScore(Math.max(state.bestDistanceScore, distanceScore));

  // Only a challenge completed for TODAY advances the streak.
  // The streak-freeze rule is applied here, so a player who missed exactly
  // one day and has a freeze in hand keeps the streak alive.
  const streakOutcome = advancesProgression
    ? computeStreakWithFreeze(state.streak, state.lastPlayedDate, today, state.streakFreezes)
    : null;
  const streak = streakOutcome ? streakOutcome.streak : state.streak;
  const streakFreezes = streakOutcome ? streakOutcome.freezes : state.streakFreezes;
  const lastPlayedDate = advancesProgression ? today : state.lastPlayedDate;

  const next: GameState = {
    ...state,
    totalScore,
    level: levelForScore(totalScore),
    streak,
    streakFreezes,
    lastPlayedDate,
    dailyCompletedDate: advancesProgression ? today : state.dailyCompletedDate ?? date,
    dailyScore: advancesProgression ? score : state.dailyScore,
    gamesPlayed,
    bestScore: roundScore(Math.max(state.bestScore, score)),
    averageScore: gamesPlayed > 0 ? roundScore(totalScore / gamesPlayed) : 0,
    totalDistance,
    averageDistance: gamesPlayed > 0 ? Math.round(newTotalDistance / gamesPlayed) : 0,
    perfectGuesses,
    bestTimeBonus,
    bestDistanceScore,
    dailyHistory: history,
  };

  return withEarnedAchievements(next, now);
}

/** Applies a finished practice round. Practice never affects progression. */
export function applyPracticeCompletion(state: GameState, score: number): GameState {
  return {
    ...state,
    practiceGames: state.practiceGames + 1,
    practiceBestScore: roundScore(Math.max(state.practiceBestScore, score)),
    practiceTotalScore: roundScore(state.practiceTotalScore + score),
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
  // "Perfection" means every answer was as close as it can be, so it is
  // measured on the location points alone - the speed share is a different
  // kind of achievement.
  if (state.bestDistanceScore >= MAX_LOCATION_SCORE) earned.push('perfect_10');
  if (state.streak >= 3) earned.push('streak_3');
  if (state.streak >= 7) earned.push('streak_7');
  if (state.streak >= 30) earned.push('streak_30');
  if (state.perfectGuesses >= 1) earned.push('perfect_guess');
  if (state.perfectGuesses >= 5) earned.push('perfect_5');
  if (state.bestTimeBonus >= MAX_TIME_SCORE) earned.push('speed_demon');
  if (state.bestTimeBonus >= 50) earned.push('speed_50');
  if (state.gamesPlayed >= 10) earned.push('games_10');
  if (state.gamesPlayed >= 50) earned.push('games_50');
  if (state.gamesPlayed >= 100) earned.push('games_100');
  if (state.totalScore >= 1_000) earned.push('score_1k');
  if (state.totalScore >= 5_000) earned.push('score_5k');
  if (state.totalScore >= 20_000) earned.push('score_20k');

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
  /** The region the entry belongs to. */
  region: string;
}

/**
 * Builds the last `days` archive entries from real history.
 * Days without a result are simply "not played yet".
 *
 * A day can hold more than one result, one per region, so the entry for the
 * requested region is preferred. When there is none, any result for that day
 * is used, so a player who only plays the American round still sees a score.
 */
export function buildArchiveEntries(
  history: DailyResult[],
  days = ARCHIVE_DAYS,
  today: string = todayKey(),
  region: string = DEFAULT_REGION,
): ArchiveEntry[] {
  const byDate = new Map<string, DailyResult>();
  for (const entry of history) {
    const current = byDate.get(entry.date);
    if (!current) {
      byDate.set(entry.date, entry);
      continue;
    }
    const currentRegion = current.region ?? DEFAULT_REGION;
    const entryRegion = entry.region ?? DEFAULT_REGION;
    // The entry for the requested region wins; otherwise keep the first one.
    if (entryRegion === region && currentRegion !== region) {
      byDate.set(entry.date, entry);
    }
  }
  const entries: ArchiveEntry[] = [];

  for (let offset = 0; offset < days; offset++) {
    const date = shiftDay(today, -offset);
    const result = byDate.get(date);
    entries.push({
      date,
      score: result ? result.score : null,
      completed: Boolean(result),
      locked: false,
      region: result ? result.region ?? DEFAULT_REGION : region,
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


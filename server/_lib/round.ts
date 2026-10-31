/**
 * The round, worked out on the server.
 *
 * The browser used to say what it had scored and the server wrote it down.
 * That made the global board worth nothing: anybody could claim thirteen
 * hundred points without playing a single question.
 *
 * The round is now worked out here, from the guesses themselves, against the
 * same answer key the browser used. The rules are imported from `src/lib`
 * rather than copied, so the board and the game can never drift apart.
 *
 * What this does and does not stop:
 *
 *   - It stops a claimed score. The number on the board is always the number
 *     the rules produce from the guesses that were sent.
 *   - It stops a score for a round that was never played: only the questions
 *     of that day and that region count, and each of them counts once.
 *   - It does not stop a player who knows the answers from placing perfect
 *     pins. The answer coordinates travel to the browser - they have to, the
 *     marker is drawn there - so a determined player can always build a
 *     perfect round. That is a property of a map quiz, not a hole in here.
 */

import {
  calculateDistance,
  calculateScore,
  getDailyQuestionsForDay,
  type Question,
} from '../../src/lib/game-data.ts';
import {
  computeAccuracy,
  maxRoundScore,
  scoreAnswer,
  stakeForQuestion,
} from '../../src/lib/time-bonus.ts';
import { roundScore } from '../../src/lib/numbers.ts';
import { streakMultiplier } from '../../src/lib/game-state.ts';

/** The two rounds there are. */
export type BoardRegion = 'usa' | 'world';

/** A day key: a local calendar day, `YYYY-MM-DD`. */
export const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** One answered question, as the browser sends it. */
export interface SubmittedAnswer {
  /** The id of the question that was answered. */
  id: string;
  /** Where the player dropped the pin. */
  lat: number | null;
  lng: number | null;
  /** How long the player took, in seconds. */
  elapsedSeconds: number;
  /** True when the player gave the question up. */
  gaveUp?: boolean;
  /** True when the player named the place instead of dropping a pin. */
  named?: boolean;
}

/** What a round was worth. */
export interface RoundScore {
  /** The score of the round; the streak never adds to it. */
  score: number;
  /** The same score, kept for the callers that read it by this name. */
  baseScore: number;
  /** The XP the streak adds, which goes to the level and not the board. */
  bonus: number;
  /** The most the round could have been worth. */
  maxScore: number;
  /** How well the guesses were placed, as a percentage. */
  accuracy: number;
  /** How many questions of the round were counted. */
  counted: number;
  /** How far the guesses were from the truth, in kilometres. */
  totalDistance: number;
}

/** The longest a single answer may claim to have taken. */
const MAX_ELAPSED_SECONDS = 3600;

/** True when the value is a usable day key. */
export function isDayKey(value: unknown): value is string {
  return typeof value === 'string' && DAY_PATTERN.test(value);
}

/**
 * The calendar day it is where the player is.
 *
 * The board is written in the player's own day, so the server has to know
 * what day that is. A player in UTC+12 is already on tomorrow while the
 * server is still on today, and without this the server would refuse their
 * score as a day that has not happened yet.
 *
 * The offset is in minutes east of UTC, the same way `Date.getTimezoneOffset`
 * counts them, only the other way round.
 */
export function localDayKey(now: number, offsetMinutes: number): string {
  const offset = Number(offsetMinutes);
  const safe = Number.isFinite(offset) ? Math.max(-840, Math.min(840, offset)) : 0;
  return new Date(now + safe * 60_000).toISOString().slice(0, 10);
}

/** The day before a day key, in local calendar arithmetic. */
export function previousDayKey(dayKey: string): string {
  return shiftDayKey(dayKey, -1);
}

/** The day after a day key, in local calendar arithmetic. */
export function nextDayKey(dayKey: string): string {
  return shiftDayKey(dayKey, 1);
}

/** Moves a day key by a number of days, in local calendar arithmetic. */
function shiftDayKey(dayKey: string, days: number): string {
  const [year, month, day] = dayKey.split('-').map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Reads the answers the browser sent.
 *
 * Only what can be used is kept: the id of the question, where the pin was
 * dropped and how long it took. Anything else is dropped on the way in.
 */
export function readAnswers(value: unknown): SubmittedAnswer[] {
  if (!Array.isArray(value)) return [];

  const answers: SubmittedAnswer[] = [];
  for (const item of value.slice(0, 50)) {
    if (!item || typeof item !== 'object') continue;
    const raw = item as Record<string, unknown>;
    if (typeof raw.id !== 'string' || !raw.id) continue;

    answers.push({
      id: raw.id.slice(0, 64),
      lat: typeof raw.lat === 'number' ? raw.lat : null,
      lng: typeof raw.lng === 'number' ? raw.lng : null,
      elapsedSeconds: Number(raw.elapsedSeconds) || 0,
      gaveUp: raw.gaveUp === true,
      named: raw.named === true,
    });
  }
  return answers;
}

/** True when the value is a place on the globe. */
function isLatitude(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -90 && value <= 90;
}

/** True when the value is a place on the globe. */
function isLongitude(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -180 && value <= 180;
}

/**
 * Works out what a round was worth.
 *
 * The answers are the guesses the player made, one for each question of the
 * round. A guess is only counted when the question it belongs to was in this
 * round for this region, and the same question is never counted twice.
 */
export function scoreRound(params: {
  day: string;
  region: BoardRegion;
  answers: SubmittedAnswer[];
  /** The streak the player was on when the round was played. */
  streak?: number;
  /** The points spent on hints during the round. */
  hintCost?: number;
  /**
   * The questions of that day, when they come from the stored bank rather
   * than the bundled rotation.
   */
  questions?: readonly Question[];
}): RoundScore {
  const round = params.questions ?? getDailyQuestionsForDay(params.day, params.region);
  return scoreQuestions(round, params.answers, params);
}

/**
 * Works out what a set of guesses was worth against a given set of questions.
 *
 * The daily round and a private tournament are scored by the same rules; the
 * only difference is where the questions come from. A guess only counts for
 * a question that is in the set, and each question counts once.
 */
export function scoreQuestions(
  round: readonly Question[],
  answers: SubmittedAnswer[],
  options: { streak?: number; hintCost?: number } = {},
): RoundScore {
  const byId = new Map<string, { question: Question; index: number }>();
  round.forEach((question, index) => byId.set(question.id, { question, index }));

  let running = 0;
  let totalDistance = 0;
  let counted = 0;
  const locationPoints: { locationPoints: number }[] = [];
  const seen = new Set<string>();

  for (const answer of answers) {
    if (!answer || typeof answer.id !== 'string') continue;

    const found = byId.get(answer.id);
    // A question that was not in this round is not part of this round.
    if (!found) continue;
    // The same question is never counted twice.
    if (seen.has(answer.id)) continue;
    seen.add(answer.id);

    const gaveUp = answer.gaveUp === true;
    const named = answer.named === true;
    const lat = answer.lat;
    const lng = answer.lng;
    const hasGuess = isLatitude(lat) && isLongitude(lng);

    let score = 0;
    let points = 0;
    let distance = 0;

    if (!gaveUp && hasGuess) {
      distance = calculateDistance(lat, lng, found.question.lat, found.question.lng);
      // Naming the place is knowing the place, so it is worth the full points
      // even when the label on the map sits a few kilometres off.
      const distancePoints = named ? calculateScore(0) : calculateScore(distance);
      const elapsed = Math.max(
        0,
        Math.min(MAX_ELAPSED_SECONDS, Number(answer.elapsedSeconds) || 0),
      );
      const scored = scoreAnswer(distancePoints, elapsed, stakeForQuestion(found.index));
      score = scored.score;
      points = scored.locationPoints;
    }

    running = roundScore(running + score);
    totalDistance = roundScore(totalDistance + distance);
    locationPoints.push({ locationPoints: points });
    counted += 1;
  }

  // The points spent on hints come off the round, in the same order as in the
  // game: the streak XP is a share of what is left.
  const hintCost = Math.max(0, Number(options.hintCost) || 0);
  const baseScore = roundScore(Math.max(0, running - hintCost));

  // The streak decides the multiplier, and the rule for that lives here
  // rather than in the browser, so the number on the board always comes from
  // the same rule the game used.
  const streak = Math.max(0, Math.min(9999, Math.floor(Number(options.streak) || 0)));
  const multiplier = streakMultiplier(streak);
  const bonus = roundScore(Math.max(0, baseScore * (multiplier - 1)));
  const score = baseScore;

  return {
    score,
    baseScore,
    bonus,
    maxScore: maxRoundScore(round.length),
    accuracy: computeAccuracy(locationPoints),
    counted,
    totalDistance,
  };
}

// Sports events and locations for quiz
import type { Question } from './question-types.ts';
import { questionPool } from './question-pool.ts';
import { roundScore } from './numbers.ts';
import { diffDays } from './date-utils.ts';
import { MAX_TIME_POINTS_PER_QUESTION, maxRoundScore } from './time-bonus.ts';
import {
  DEFAULT_REGION,
  getRegion,
  questionsForRegion,
  regionSeed,
  type RegionId,
} from './regions.ts';

export type { Question };
export { questionPool };
export { REGIONS, DEFAULT_REGION, getRegion, isRegionId, questionsForRegion, regionPath } from './regions.ts';
export type { Region, RegionId } from './regions.ts';

/** Maximum points a single question can yield. */
export const MAX_QUESTION_SCORE = 100;

/**
 * Formats a score for display.
 *
 * A score has at most two decimal places. Whole numbers stay whole, and a
 * fraction keeps its decimals without trailing zeros - so 90 is "90", 96.7
 * is "96.7", and 96.75 is "96.75".
 */
export function formatPoints(value: number): string {
  const rounded = roundScore(value);
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

// The question pool itself lives in ./questions/ so it can grow.


// Deterministic, well-distributed PRNG (mulberry32) seeded from the day key.
// A plain Math.sin hash produced correlated shuffles on adjacent days.
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Day key (YYYY-MM-DD) of a Date in the user's LOCAL calendar.
export function getDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Convert a day key into a numeric seed.
function dateToSeed(dateString: string): number {
  const parts = dateString.split('-');
  const year = parseInt(parts[0], 10) || 0;
  const month = parseInt(parts[1], 10) || 0;
  const day = parseInt(parts[2], 10) || 0;
  return (year * 10000 + month * 100 + day) >>> 0;
}

// Number of questions in a daily challenge.
export const DAILY_QUESTION_COUNT = 10;

/**
 * The key that identifies the place a question is about.
 *
 * Several questions can point at the same venue - one asks about the stadium,
 * another about a final played there. They must never end up in the same
 * round, so the places are grouped and the daily set skips the second one.
 *
 * The venue name is used when a question has one, because coordinates cannot
 * separate a baseball park from the football field next door to it. Questions
 * without a name fall back to the coordinate, rounded to about a kilometre.
 */
export function venueKey(question: Question): string {
  if (question.venue) return question.venue.toLowerCase();
  return `${question.lat.toFixed(2)},${question.lng.toFixed(2)}`;
}

/**
 * Get daily questions based on a date (deterministic).
 * The same day always yields the same 10 questions, for every player.
 *
 * Every region has its own set: the seed is mixed with the region id, so the
 * American round on a given day is always the same ten questions for every
 * player in it, and different from the world round.
 */
export function getDailyQuestions(
  date: Date = new Date(),
  regionId: RegionId = DEFAULT_REGION,
): Question[] {
  return getDailyQuestionsForDay(getDateString(date), regionId);
}

/**
 * The ten questions of a round, taken from the day key and nothing else.
 *
 * A day key is a local calendar day, and the same key has to give the same
 * ten questions to every player in every country. Reading the key back out
 * of a `Date` meant the key was turned into UTC midnight first, and in every
 * timezone behind UTC that moved the round a day into the past - so a player
 * in Los Angeles was playing yesterday's questions while the board and the
 * streak both said today.
 *
 * The server works the round out from the day key as well, so the board and
 * the round always agree.
 */
export function getDailyQuestionsForDay(
  dayKey: string,
  regionId: RegionId = DEFAULT_REGION,
): Question[] {
  const pool = questionsForRegion(questionPool, regionId);
  const offset = diffDays(ROTATION_START_DAY, dayKey);

  // Days before the rotation started keep the round they always had, so an
  // archived day and its scores on the board still match.
  if (!Number.isFinite(offset) || offset < 0) {
    const seed = (dateToSeed(dayKey) ^ regionSeed(regionId)) >>> 0;
    return pickRound(shuffle(pool, seededRandom(seed)));
  }

  return pickRound(rotationOrder(pool, regionId, offset));
}

/**
 * The first day of the question rotation.
 *
 * Before it, every day was shuffled on its own, so the same question could
 * come back two days in a row. From this day on the pool is dealt out like a
 * deck of cards: every question is asked once before any question is asked
 * again.
 */
export const ROTATION_START_DAY = '2026-11-01';

/** How many days one pass through a region's pool lasts. */
export function rotationLength(regionId: RegionId = DEFAULT_REGION): number {
  const size = questionsForRegion(questionPool, regionId).length;
  return Math.max(1, Math.floor(size / DAILY_QUESTION_COUNT));
}

/**
 * The questions in the order they are dealt for the day `offset` days into
 * the rotation: that day's slice of the deck first, the rest of the deck
 * after it as a fallback for the venue check.
 */
function rotationOrder(pool: Question[], regionId: RegionId, offset: number): Question[] {
  const length = Math.max(1, Math.floor(pool.length / DAILY_QUESTION_COUNT));
  const cycle = Math.floor(offset / length);
  const position = offset % length;
  const rounds = roundsFor(pool, regionId, cycle, length);
  const round = rounds[position] ?? [];
  return [...round, ...rounds.flat().filter((question) => !round.includes(question))];
}

const roundsCache = new Map<string, Question[][]>();

/**
 * The rounds of one pass through the pool, one per day.
 *
 * Every pass is shuffled with its own seed, so it is never the same twice.
 * The deck is dealt out day by day, and a question that would put a second
 * pin on a place already in that day's round waits for a later day - so no
 * question is asked twice in a pass and no round asks about a place twice.
 * The questions asked on the last day of the previous pass go to the back,
 * so a new pass never opens with yesterday's questions.
 */
function roundsFor(pool: Question[], regionId: RegionId, cycle: number, length: number): Question[][] {
  const key = `${regionId}:${pool.length}:${cycle}`;
  const cached = roundsCache.get(key);
  if (cached) return cached;

  const seed = (Math.imul(cycle + 1, 0x9e3779b1) ^ regionSeed(regionId)) >>> 0;
  let deck = shuffle(pool, seededRandom(seed));
  if (cycle > 0) {
    const previous = roundsFor(pool, regionId, cycle - 1, length);
    const lastDay = new Set(previous[length - 1] ?? []);
    deck = [
      ...deck.filter((question) => !lastDay.has(question)),
      ...deck.filter((question) => lastDay.has(question)),
    ];
  }

  const rounds: Question[][] = [];
  let remaining = deck;
  for (let day = 0; day < length; day++) {
    const round = pickDistinct(remaining);
    rounds.push(round);
    remaining = remaining.filter((question) => !round.includes(question));
  }
  roundsCache.set(key, rounds);
  return rounds;
}

/** A Fisher-Yates shuffled copy, driven by the seeded PRNG. */
function shuffle(questions: Question[], random: () => number): Question[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Up to ten questions from `candidates`, in order, that do not share a place. */
function pickDistinct(candidates: Question[]): Question[] {
  const picked: Question[] = [];
  const usedVenues = new Set<string>();
  const usedPoints = new Set<string>();
  for (const question of candidates) {
    if (picked.length >= DAILY_QUESTION_COUNT) break;
    const key = venueKey(question);
    const point = `${question.lat.toFixed(3)},${question.lng.toFixed(3)}`;
    if (usedVenues.has(key) || usedPoints.has(point)) continue;
    usedVenues.add(key);
    usedPoints.add(point);
    picked.push(question);
  }
  return picked;
}

/** The first ten questions of `shuffled` that do not share a place. */
function pickRound(shuffled: Question[]): Question[] {
  // Take the questions, but never two about the same place. If the pool runs
  // short of distinct venues - it never does with the current pool - the
  // remaining questions are added back in regardless.
  //
  // Two different questions can name the same ground in different words and
  // still sit on the same pixel, so the coordinates are checked as well. Two
  // pins on the same spot would look like a bug to the player.
  const picked = pickDistinct(shuffled);

  if (picked.length < DAILY_QUESTION_COUNT) {
    for (const question of shuffled) {
      if (picked.length >= DAILY_QUESTION_COUNT) break;
      if (!picked.includes(question)) picked.push(question);
    }
  }

  return picked;
}

// Haversine formula for calculating distance
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Scoring system based on distance
/**
 * The points for a guess, on a scale of 0 to 100.
 *
 * A guess 5,000 km away or more is worth nothing - that is the point of no
 * return, the other side of the world. Everything closer is worth a share of
 * the full 100 points.
 */
export function calculateScore(distanceKm: number): number {
  if (distanceKm < 25) return 100;
  if (distanceKm < 50) return 95;
  if (distanceKm < 100) return 90;
  if (distanceKm < 200) return 80;
  if (distanceKm < 500) return 60;
  if (distanceKm < 1000) return 40;
  if (distanceKm < 2000) return 20;
  if (distanceKm < 5000) return 10;
  return 0;
}

// Emoji for share cards. The thresholds follow the maximum score of 1,000.
export function getResultEmoji(score: number): string {
  if (score >= 900) return '🔥';
  if (score >= 800) return '🏆';
  if (score >= 700) return '⭐';
  if (score >= 600) return '💪';
  if (score >= 500) return '👍';
  if (score >= 400) return '😊';
  if (score >= 300) return '🎯';
  return '📍';
}

/**
 * The address a shared result points at.
 *
 * The picture that goes with the link is drawn on the server for that exact
 * score, so the preview on Twitter or Facebook shows the result rather than
 * the same card everybody gets.
 */
export function buildShareUrl(params: {
  score: number;
  maxScore: number;
  streak?: number;
  region?: RegionId;
  date?: string;
}): string {
  const query = new URLSearchParams({
    score: String(Math.max(0, Math.round(params.score * 100) / 100)),
    max: String(Math.max(1, Math.round(params.maxScore))),
    region: params.region === 'world' ? 'world' : 'usa',
  });

  if (params.streak && params.streak > 1) query.set('streak', String(params.streak));
  if (params.date) query.set('day', params.date);

  const base =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://geoarena.com';

  return `${base}/api/share?${query.toString()}`;
}

/**
 * One coloured square per question, the way Worldle shares a round: it shows
 * how the round went without giving away a single answer.
 *
 * Green is under 100 km (90 points or more), yellow under 500, orange under
 * 2,000 and red anything further. A question the player gave up on is black.
 * The squares come in rows of five so a ten-question round reads as two lines
 * of play rather than one long strip.
 */
export function shareGrid(answers: ReadonlyArray<{ distance: number; gaveUp?: boolean }>): string {
  const squares = answers.map(({ distance, gaveUp }) => {
    if (gaveUp || !Number.isFinite(distance)) return '⬛';
    if (distance < 100) return '🟩';
    if (distance < 500) return '🟨';
    if (distance < 2000) return '🟧';
    return '🟥';
  });
  const rows: string[] = [];
  for (let i = 0; i < squares.length; i += 5) rows.push(squares.slice(i, i + 5).join(''));
  return rows.join('\n');
}

export function generateShareText(
  score: number,
  totalScore: number = maxRoundScore(DAILY_QUESTION_COUNT),
  timeBonus: number = 0,
  region: RegionId = DEFAULT_REGION,
  streakMultiplier: number = 1,
  answers: ReadonlyArray<{ distance: number; gaveUp?: boolean }> = [],
): string {
  const multiplier = streakMultiplier > 1 ? streakMultiplier : 1;
  // The streak adds XP, never points, so the score is read as it is.
  const percentage = totalScore > 0 ? Math.round((score / totalScore) * 100) : 0;
  const emoji = getResultEmoji(score);
  const bonus = Number(timeBonus) || 0;
  const bonusLine = bonus > 0 ? `\nSpeed bonus: +${formatPoints(bonus)} ⚡` : '';
  const streakLine = multiplier > 1 ? `\n🔥 ${multiplier}× streak XP` : '';
  const regionLine =
    region === DEFAULT_REGION ? '' : `\n${getRegion(region).emoji} ${getRegion(region).label} round`;
  const grid = answers.length > 0 ? `\n${shareGrid(answers)}\n` : '';
  return `USA GeoArena ${emoji}\nMy score: ${formatPoints(score)}/${formatPoints(totalScore)} (${percentage}%)\n${grid}${bonusLine ? bonusLine + '\n' : ''}${streakLine ? streakLine + '\n' : ''}${regionLine ? regionLine + '\n' : ''}Can you do better? 🌍🏟️`;
}

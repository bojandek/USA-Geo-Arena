// Sports events and locations for quiz
import type { Question } from './question-types.ts';
import { questionPool } from './question-pool.ts';
import { roundScore } from './numbers.ts';
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
  const seed = (dateToSeed(dayKey) ^ regionSeed(regionId)) >>> 0;
  const random = seededRandom(seed);

  // Create a shuffled copy of the question pool
  const shuffled = [...questionsForRegion(questionPool, regionId)];

  // Fisher-Yates shuffle with the seeded PRNG
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Take the questions, but never two about the same place. If the pool runs
  // short of distinct venues - it never does with the current pool - the
  // remaining questions are added back in regardless.
  //
  // Two different questions can name the same ground in different words and
  // still sit on the same pixel, so the coordinates are checked as well. Two
  // pins on the same spot would look like a bug to the player.
  const picked: Question[] = [];
  const usedVenues = new Set<string>();
  const usedPoints = new Set<string>();

  for (const question of shuffled) {
    if (picked.length >= DAILY_QUESTION_COUNT) break;
    const key = venueKey(question);
    if (usedVenues.has(key)) continue;
    const point = `${question.lat.toFixed(3)},${question.lng.toFixed(3)}`;
    if (usedPoints.has(point)) continue;
    usedVenues.add(key);
    usedPoints.add(point);
    picked.push(question);
  }

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

// Emoji for share cards. The thresholds follow the maximum score of 1,300.
export function getResultEmoji(score: number): string {
  if (score >= 1170) return '🔥';
  if (score >= 1040) return '🏆';
  if (score >= 910) return '⭐';
  if (score >= 780) return '💪';
  if (score >= 650) return '👍';
  if (score >= 520) return '😊';
  if (score >= 390) return '🎯';
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

export function generateShareText(
  score: number,
  totalScore: number = maxRoundScore(DAILY_QUESTION_COUNT),
  timeBonus: number = 0,
  region: RegionId = DEFAULT_REGION,
  streakMultiplier: number = 1,
): string {
  const multiplier = streakMultiplier > 1 ? streakMultiplier : 1;
  // The percentage is of the round as it would have been without the streak
  // bonus, so it never reads as more than a hundred, and the face that goes with
  // it reflects how well the player actually guessed.
  const base = multiplier > 1 ? score / multiplier : score;
  const percentage = totalScore > 0 ? Math.round((base / totalScore) * 100) : 0;
  const emoji = getResultEmoji(base);
  const bonus = Number(timeBonus) || 0;
  const bonusLine = bonus > 0 ? `\nSpeed bonus: +${formatPoints(bonus)} ⚡` : '';
  const streakLine = multiplier > 1 ? `\n🔥 ${multiplier}× streak bonus` : '';
  const regionLine =
    region === DEFAULT_REGION ? '' : `\n${getRegion(region).emoji} ${getRegion(region).label} round`;
  return `USA GeoArena ${emoji}\nMy score: ${formatPoints(score)}/${formatPoints(totalScore * multiplier)} (${percentage}%)\n${bonusLine ? bonusLine + '\n' : ''}${streakLine ? streakLine + '\n' : ''}${regionLine ? regionLine + '\n' : ''}Can you do better? 🌍⚽`;
}

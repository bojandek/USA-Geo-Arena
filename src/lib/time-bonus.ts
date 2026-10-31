import { roundScore } from './numbers.ts';

/**
 * How a single question is scored.
 *
 * A question is worth up to 100 points. Those 100 points come from two places:
 *
 *   - 90% from how close the guess was to the real location
 *   - 10% from how quickly the answer was given
 *
 * Answering straight away earns the full band value - 100 points for a guess
 * inside 25 km. The speed share then decays linearly over 30 seconds, so an
 * answer given at 15 seconds is worth 95% and one given at 30 seconds or
 * later is worth 90%.
 *
 * Two things follow from this, and both are deliberate:
 *
 *   - The clock never takes points away. It only decides how much of the 10%
 *     you keep, so a player who thinks for five minutes still gets 90% of
 *     every answer.
 *   - Because both halves are a share of the same distance points, a fast
 *     wrong answer can never beat a slow correct one.
 */

/** Seconds in which the full speed share can still be earned. */
export const TIME_BONUS_WINDOW_SECONDS = 30;

/** The share of a question's points that comes from the location. */
export const LOCATION_SHARE = 0.9;

/** The share of a question's points that comes from the speed. */
export const TIME_SHARE = 0.1;

/** The points one question is worth. */
export const MAX_QUESTION_SCORE = 100;

/**
 * What each question of a round is worth.
 *
 * The first seven questions are worth 80 points each. The last three are
 * worth more, so a round does not end the way it began: the eighth question
 * is worth 120, the ninth 140 and the tenth 180. The stake is shown on the
 * question while the player is answering, so it is never a surprise.
 *
 * A round of ten is worth 1,000 points, and the most of it rides on the
 * questions that were always going to be the hard ones.
 */
export const STAKE_SCHEDULE: number[] = [
  80, 80, 80, 80, 80, 80, 80, 120, 140, 180,
];

/**
 * What the question at the given place in the round is worth.
 *
 * A round longer than the schedule keeps the last stake, and a round shorter
 * simply stops.
 */
export function stakeForQuestion(index: number): number {
  const position = Math.max(0, Math.floor(Number(index) || 0));
  if (position < STAKE_SCHEDULE.length) return STAKE_SCHEDULE[position];
  return STAKE_SCHEDULE[STAKE_SCHEDULE.length - 1];
}

/**
 * How well a set of guesses was placed, as a percentage.
 *
 * The speed part of the score is left out on purpose: accuracy is about
 * knowing where the place is, not about how fast the answer came.
 */
export function computeAccuracy(
  answers: { locationPoints: number }[],
  stakeFor: (index: number) => number = stakeForQuestion,
): number {
  if (answers.length === 0) return 0;
  const earned = answers.reduce((sum, answer) => sum + answer.locationPoints, 0);
  const possible = answers.reduce(
    (sum, _answer, index) => sum + stakeFor(index),
    0,
  );
  if (possible <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((earned / possible) * 100)));
}

/**
 * The most a round of the given length can be worth.
 */
export function maxRoundScore(questionCount: number): number {
  const count = Math.max(0, Math.floor(Number(questionCount) || 0));
  let total = 0;
  for (let i = 0; i < count; i++) total += stakeForQuestion(i);
  return roundScore(total);
}

/** Maximum speed points for a single question (10% of 100). */
export const MAX_TIME_POINTS_PER_QUESTION = MAX_QUESTION_SCORE * TIME_SHARE;

export interface QuestionScore {
  /** The total points for the answer. */
  score: number;
  /** The part that came from how close the guess was. */
  locationPoints: number;
  /** The part that came from answering quickly. */
  timePoints: number;
}

/** Rounds to two decimal places, so the scores stay readable. */
function round1(value: number): number {
  return roundScore(value);
}

/**
 * How much of the speed share is still available.
 *
 * 1 at the start, 0.9 once the window closes, and it never drops below that.
 */
export function calculateTimeFactor(elapsedSeconds: number): number {
  const elapsed = Number(elapsedSeconds);
  if (!Number.isFinite(elapsed) || elapsed <= 0) return 1;
  if (elapsed >= TIME_BONUS_WINDOW_SECONDS) return LOCATION_SHARE;

  const remaining = TIME_BONUS_WINDOW_SECONDS - elapsed;
  return LOCATION_SHARE + TIME_SHARE * (remaining / TIME_BONUS_WINDOW_SECONDS);
}

/**
 * Scores one answer.
 *
 * @param distancePoints the points the guess earned on distance alone
 * @param elapsedSeconds how long the player took, in seconds
 * @param stake what the question is worth; 100 for an ordinary one
 */
export function scoreAnswer(
  distancePoints: number,
  elapsedSeconds: number,
  stake: number = MAX_QUESTION_SCORE,
): QuestionScore {
  const distance = Number(distancePoints);

  // A broken timer or a broken guess must never produce NaN.
  if (!Number.isFinite(distance) || distance <= 0) {
    return { score: 0, locationPoints: 0, timePoints: 0 };
  }

  // The stake scales what the answer is worth. The shares stay the same, so a
  // question worth 180 is still 90% location and 10% speed.
  const worth = Number(stake);
  const scale = Number.isFinite(worth) && worth > 0 ? worth / MAX_QUESTION_SCORE : 1;
  const scaled = distance * scale;

  const factor = calculateTimeFactor(elapsedSeconds);
  const score = Math.max(0, round1(scaled * factor));
  const locationPoints = Math.max(0, round1(scaled * LOCATION_SHARE));
  const timePoints = Math.max(0, round1(score - locationPoints));

  return { score, locationPoints, timePoints };
}

/**
 * The largest speed bonus a full set of questions can yield.
 *
 * The last questions are worth more, so they carry more speed points too.
 */
export function maxTimeBonusFor(questionCount: number): number {
  const count = Math.max(0, Math.floor(Number(questionCount) || 0));
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += stakeForQuestion(i) * TIME_SHARE;
  }
  return round1(total);
}

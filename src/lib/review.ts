/**
 * The review mode.
 *
 * A player who missed a question has learned nothing from it, and the best
 * reason to come back to the site is to try it again. This module turns the
 * answers of the last round into a set of questions worth a second attempt.
 *
 * A review round is practice: it never touches the progression, the streak or
 * the leaderboard.
 */

import { questionPool } from './question-pool.ts';
import type { Question } from './question-types.ts';
import type { DailyAnswer, DailyResult } from './game-state.ts';

/** A guess counts as missed beyond this distance, in kilometres. */
export const MISSED_DISTANCE_KM = 25;

/** How many questions a review round holds at most. */
export const REVIEW_QUESTION_LIMIT = 10;

/**
 * The questions the player got wrong, ready to be played again.
 *
 * The order follows the original round, so the player meets the questions in
 * the same order they failed them the first time.
 */
export function buildReviewQuestions(
  answers: DailyAnswer[] | undefined,
  limit: number = REVIEW_QUESTION_LIMIT,
): Question[] {
  if (!answers || answers.length === 0) return [];

  const missedIds = new Set(
    answers
      .filter((answer) => answer && Number(answer.distance) > MISSED_DISTANCE_KM)
      .map((answer) => answer.questionId),
  );
  if (missedIds.size === 0) return [];

  const wanted = answers
    .map((answer) => answer.questionId)
    .filter((id) => missedIds.has(id));

  const byId = new Map(questionPool.map((question) => [question.id, question]));
  const questions: Question[] = [];
  for (const id of wanted) {
    const question = byId.get(id);
    if (question) questions.push(question);
    if (questions.length >= limit) break;
  }
  return questions;
}

/**
 * The most recent round that can be reviewed.
 *
 * The newest entry wins, and a round without stored answers is skipped - an
 * old save from before the review mode existed simply has nothing to review.
 */
export function latestReviewableResult(history: DailyResult[]): DailyResult | null {
  for (let index = history.length - 1; index >= 0; index--) {
    const entry = history[index];
    if (entry && Array.isArray(entry.answers) && entry.answers.length > 0) {
      return entry;
    }
  }
  return null;
}
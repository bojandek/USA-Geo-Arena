/**
 * Unit tests for the review mode.
 *
 * Run with: npm test
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildReviewQuestions,
  latestReviewableResult,
  MISSED_DISTANCE_KM,
} from '../src/lib/review.ts';
import { questionPool } from '../src/lib/question-pool.ts';
import { applyDailyCompletion, createInitialState, type DailyResult } from '../src/lib/game-state.ts';

const TODAY = '2025-06-15';

/** Two real questions from the pool, so the ids are real. */
const FIRST = questionPool[0];
const SECOND = questionPool[1];

describe('building a review set', () => {
  test('a question that was missed comes back', () => {
    const questions = buildReviewQuestions([
      { questionId: FIRST.id, distance: 400, score: 60 },
    ]);
    assert.equal(questions.length, 1);
    assert.equal(questions[0].id, FIRST.id);
  });

  test('a question that was close enough is left out', () => {
    const questions = buildReviewQuestions([
      { questionId: FIRST.id, distance: 10, score: 98 },
    ]);
    assert.equal(questions.length, 0);
  });

  test('the line between a miss and a hit is the perfect distance', () => {
    const onTheLine = buildReviewQuestions([
      { questionId: FIRST.id, distance: MISSED_DISTANCE_KM, score: 100 },
    ]);
    assert.equal(onTheLine.length, 0, 'exactly 25km is still a hit');

    const justOver = buildReviewQuestions([
      { questionId: FIRST.id, distance: MISSED_DISTANCE_KM + 1, score: 100 },
    ]);
    assert.equal(justOver.length, 1, 'a little further is a miss');
  });

  test('the order follows the original round', () => {
    const questions = buildReviewQuestions([
      { questionId: SECOND.id, distance: 400, score: 60 },
      { questionId: FIRST.id, distance: 400, score: 60 },
    ]);
    assert.equal(questions[0].id, SECOND.id);
    assert.equal(questions[1].id, FIRST.id);
  });

  test('the set never grows past the limit', () => {
    const answers = questionPool.slice(0, 30).map((question) => ({
      questionId: question.id,
      distance: 500,
      score: 60,
    }));
    const questions = buildReviewQuestions(answers);
    assert.ok(questions.length <= 10, `the set holds ${questions.length} questions`);
  });

  test('nothing to review gives nothing', () => {
    assert.equal(buildReviewQuestions([]).length, 0);
    assert.equal(buildReviewQuestions(undefined).length, 0);
  });

  test('an id that is not in the pool is skipped', () => {
    const questions = buildReviewQuestions([
      { questionId: 'does-not-exist', distance: 500, score: 60 },
    ]);
    assert.equal(questions.length, 0);
  });

  test('a broken distance is not treated as a miss', () => {
    const questions = buildReviewQuestions([
      { questionId: FIRST.id, distance: Number.NaN, score: 0 },
    ]);
    assert.equal(questions.length, 0);
  });

  test('every question in the set is a real one', () => {
    const ids = new Set(questionPool.map((question) => question.id));
    const questions = buildReviewQuestions(
      questionPool.slice(0, 12).map((question) => ({
        questionId: question.id,
        distance: 900,
        score: 40,
      })),
    );
    for (const question of questions) {
      assert.ok(ids.has(question.id), `"${question.id}" is not in the pool`);
    }
  });
});

describe('finding the round to review', () => {
  test('the newest round wins', () => {
    const history: DailyResult[] = [
      {
        date: '2025-06-13',
        score: 500,
        accuracy: 50,
        totalDistance: 100,
        perfectCount: 0,
        answers: [{ questionId: FIRST.id, distance: 400, score: 60 }],
      },
      {
        date: '2025-06-14',
        score: 600,
        accuracy: 60,
        totalDistance: 200,
        perfectCount: 1,
        answers: [{ questionId: SECOND.id, distance: 400, score: 60 }],
      },
    ];
    const latest = latestReviewableResult(history);
    assert.equal(latest?.date, '2025-06-14');
  });

  test('a round without stored answers is skipped', () => {
    const history: DailyResult[] = [
      {
        date: '2025-06-13',
        score: 500,
        accuracy: 50,
        totalDistance: 100,
        perfectCount: 0,
        answers: [{ questionId: FIRST.id, distance: 400, score: 60 }],
      },
      {
        date: '2025-06-14',
        score: 600,
        accuracy: 60,
        totalDistance: 200,
        perfectCount: 1,
      },
    ];
    const latest = latestReviewableResult(history);
    assert.equal(latest?.date, '2025-06-13');
  });

  test('an empty history has nothing to review', () => {
    assert.equal(latestReviewableResult([]), null);
  });
});

describe('the answers are kept with the round', () => {
  test('a finished round stores what the player answered', () => {
    const state = applyDailyCompletion(createInitialState(), {
      date: TODAY,
      score: 700,
      totalDistance: 800,
      perfectCount: 1,
      today: TODAY,
      answers: [
        { questionId: FIRST.id, distance: 10, score: 100 },
        { questionId: SECOND.id, distance: 400, score: 60 },
      ],
    });

    assert.equal(state.dailyHistory[0].answers?.length, 2);
    assert.equal(state.dailyHistory[0].answers?.[0].questionId, FIRST.id);
  });

  test('a replay without answers keeps the ones already stored', () => {
    const first = applyDailyCompletion(createInitialState(), {
      date: TODAY,
      score: 700,
      totalDistance: 800,
      perfectCount: 1,
      today: TODAY,
      answers: [{ questionId: FIRST.id, distance: 400, score: 60 }],
    });
    const replay = applyDailyCompletion(first, {
      date: TODAY,
      score: 800,
      totalDistance: 700,
      perfectCount: 2,
      today: TODAY,
    });

    assert.equal(replay.dailyHistory[0].answers?.length, 1, 'the answers survive a replay');
  });

  test('a round with no answers is still valid', () => {
    const state = applyDailyCompletion(createInitialState(), {
      date: TODAY,
      score: 700,
      totalDistance: 800,
      perfectCount: 1,
      today: TODAY,
    });
    assert.equal(state.dailyHistory[0].answers, undefined);
  });
});
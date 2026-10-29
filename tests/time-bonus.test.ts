/**
 * Unit tests for the scoring formula.
 *
 * A question is worth up to 100 points: 90% from how close the guess was
 * and up to 10% from how fast the answer was given. The last three questions
 * of a round are worth more, so a round of ten is worth 1,300. The important
 * properties are: an instant answer earns the full band value, the clock
 * never takes more than 10% away, and a fast wrong answer can never beat a
 * slow correct one.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateTimeFactor,
  maxRoundScore,
  maxTimeBonusFor,
  scoreAnswer,
  stakeForQuestion,
  LOCATION_SHARE,
  MAX_TIME_POINTS_PER_QUESTION,
  TIME_BONUS_WINDOW_SECONDS,
  TIME_SHARE,
} from '../src/lib/time-bonus.ts';
import { roundScore } from '../src/lib/numbers.ts';
import { formatPoints } from '../src/lib/game-data.ts';

describe('scoreAnswer', () => {
  test('an instant answer earns the full band value', () => {
    const result = scoreAnswer(100, 0);
    assert.equal(result.score, 100);
    assert.equal(result.locationPoints, 90);
    assert.equal(result.timePoints, 10);
  });

  test('a slower answer keeps 90% and never less', () => {
    const atWindow = scoreAnswer(100, TIME_BONUS_WINDOW_SECONDS);
    const wayOver = scoreAnswer(100, 600);

    assert.equal(atWindow.score, 90);
    assert.equal(wayOver.score, 90, 'the clock never takes more than the speed share');
  });

  test('the score decays linearly over the window', () => {
    const half = scoreAnswer(100, TIME_BONUS_WINDOW_SECONDS / 2);
    assert.equal(half.score, 95);
  });

  test('the time share is never more than ten percent', () => {
    for (let elapsed = 0; elapsed <= 60; elapsed += 3) {
      const result = scoreAnswer(100, elapsed);
      assert.ok(
        result.timePoints <= MAX_TIME_POINTS_PER_QUESTION,
        `the speed share must never exceed ${MAX_TIME_POINTS_PER_QUESTION} points`,
      );
      assert.ok(
        result.locationPoints >= Math.round(100 * LOCATION_SHARE),
        'the location share is never reduced',
      );
    }
  });

  test('a fast wrong answer never beats a slow correct one', () => {
    const fastWrong = scoreAnswer(40, 0).score;
    const slowCorrect = scoreAnswer(100, TIME_BONUS_WINDOW_SECONDS).score;

    assert.ok(
      slowCorrect > fastWrong,
      'accuracy must always outrank speed, no matter how fast the wrong answer was',
    );
  });

  test('the split always adds up to the total', () => {
    for (const distance of [5, 10, 20, 40, 60, 80, 90, 95, 100]) {
      for (const elapsed of [0, 5, 15, 25, 30, 90]) {
        const result = scoreAnswer(distance, elapsed);
        assert.equal(
          result.locationPoints + result.timePoints,
          result.score,
          `the split must add up for ${distance} km at ${elapsed}s`,
        );
      }
    }
  });

  test('broken input produces zero instead of NaN', () => {
    const result = scoreAnswer(NaN, 0);
    assert.equal(result.score, 0);
    assert.equal(result.locationPoints, 0);
    assert.equal(result.timePoints, 0);

    assert.equal(scoreAnswer(100, NaN).score, 100, 'a broken timer is treated as instant');
    assert.equal(scoreAnswer(-100, 0).score, 0);
    assert.equal(scoreAnswer(0, 0).score, 0);
  });
});

describe('calculateTimeFactor', () => {
  test('starts at one and never drops below the location share', () => {
    assert.equal(calculateTimeFactor(0), 1);
    assert.equal(calculateTimeFactor(-5), 1);
    assert.equal(calculateTimeFactor(TIME_BONUS_WINDOW_SECONDS), LOCATION_SHARE);
    assert.equal(calculateTimeFactor(999), LOCATION_SHARE);
  });

  test('the location and time shares add up to one', () => {
    assert.equal(LOCATION_SHARE + TIME_SHARE, 1);
  });
});

describe('maxTimeBonusFor', () => {
  test('a full round of ten questions can earn 130 speed points', () => {
    // The last three questions are worth more, so they carry more speed
    // points too: 7 x 10 + 15 + 20 + 25.
    assert.equal(maxTimeBonusFor(10), 130);
  });

  test('a broken question count produces zero', () => {
    assert.equal(maxTimeBonusFor(0), 0);
    assert.equal(maxTimeBonusFor(-3), 0);
    assert.equal(maxTimeBonusFor(NaN), 0);
  });
});

describe('the stake rises towards the end of a round', () => {
  test('the first seven questions are worth a hundred each', () => {
    for (let i = 0; i < 7; i++) {
      assert.equal(stakeForQuestion(i), 100, `question ${i + 1}`);
    }
  });

  test('the last three are worth more', () => {
    assert.equal(stakeForQuestion(7), 150);
    assert.equal(stakeForQuestion(8), 200);
    assert.equal(stakeForQuestion(9), 250);
  });

  test('the stake never falls as the round goes on', () => {
    let previous = 0;
    for (let i = 0; i < 10; i++) {
      const stake = stakeForQuestion(i);
      assert.ok(stake >= previous, `question ${i + 1} must not be worth less`);
      previous = stake;
    }
  });

  test('a full round is worth thirteen hundred points', () => {
    assert.equal(maxRoundScore(10), 1300);
  });

  test('a round of fewer questions is worth less', () => {
    assert.equal(maxRoundScore(1), 100);
    assert.equal(maxRoundScore(7), 700);
  });

  test('a broken count does not throw', () => {
    assert.equal(maxRoundScore(0), 0);
    assert.equal(maxRoundScore(NaN), 0);
  });

  test('the stake scales the answer but keeps the shares', () => {
    const ordinary = scoreAnswer(100, 0, 100);
    const raised = scoreAnswer(100, 0, 250);
    assert.equal(ordinary.score, 100);
    assert.equal(raised.score, 250);
    // The split between the location and the speed stays the same.
    assert.equal(raised.locationPoints, 225);
    assert.equal(raised.timePoints, 25);
  });

  test('a question worth more is worth more even when it is slow', () => {
    const slowOrdinary = scoreAnswer(100, 60, 100);
    const slowRaised = scoreAnswer(100, 60, 250);
    assert.ok(slowRaised.score > slowOrdinary.score);
  });
});

describe('scores never grow a tail of floating point noise', () => {
  test('a score has at most two decimal places', () => {
    for (let elapsed = 0; elapsed <= 40; elapsed += 0.37) {
      for (const distance of [50, 100, 200, 400, 600, 800, 900, 950, 1000]) {
        const result = scoreAnswer(distance, elapsed);
        for (const value of [result.score, result.locationPoints, result.timePoints]) {
          const decimals = (String(value).split('.')[1] || '').length;
          assert.ok(decimals <= 2, `${value} has ${decimals} decimal places`);
        }
      }
    }
  });

  test('adding up a round of scores stays clean', () => {
    // The bug this guards against: a running total that ends up as
    // 321.000000003 and is shown to the player like that.
    let total = 0;
    for (let i = 0; i < 10; i++) {
      total = roundScore(total + scoreAnswer(1000 - i * 3.7, i * 2.13).score);
    }
    const decimals = (String(total).split('.')[1] || '').length;
    assert.ok(decimals <= 2, `the total ended up as ${total}`);
  });

  test('rounding a broken number gives zero, not NaN', () => {
    assert.equal(roundScore(NaN), 0);
    assert.equal(roundScore(Infinity), 0);
    assert.equal(roundScore(-Infinity), 0);
    assert.equal(roundScore(321.000000003), 321);
    assert.equal(roundScore(96.765), 96.77);
  });
});

describe('formatPoints', () => {
  test('shows at most two decimal places', () => {
    assert.equal(formatPoints(321.000000003), '321');
    assert.equal(formatPoints(96.7), '96.7');
    assert.equal(formatPoints(96.75), '96.75');
    assert.equal(formatPoints(90), '90');
    assert.equal(formatPoints(0), '0');
  });

  test('never shows a trailing zero', () => {
    assert.equal(formatPoints(90.5), '90.5');
    assert.equal(formatPoints(90.25), '90.25');
    assert.equal(formatPoints(90.0), '90');
  });
});

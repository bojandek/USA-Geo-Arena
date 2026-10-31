/**
 * Unit tests for the streak multiplier.
 *
 * The streak used to be a number on a screen that the player had no reason to
 * protect. Making it worth extra points gives it a reason to exist - but only
 * if the bonus cannot quietly corrupt the rest of the scoring, and that is
 * what these tests check.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  applyDailyCompletion,
  createInitialState,
  streakMultiplier,
  totalXp,
  MAX_STREAK_MULTIPLIER,
} from '../src/lib/game-state.ts';

const TODAY = '2025-06-15';

describe('streakMultiplier', () => {
  test('a streak that has not started is worth nothing extra', () => {
    assert.equal(streakMultiplier(0), 1);
    assert.equal(streakMultiplier(1), 1);
    assert.equal(streakMultiplier(2), 1);
  });

  test('the multiplier grows with the streak', () => {
    assert.equal(streakMultiplier(3), 1.1);
    assert.equal(streakMultiplier(6), 1.1);
    assert.equal(streakMultiplier(7), 1.25);
    assert.equal(streakMultiplier(29), 1.25);
    assert.equal(streakMultiplier(30), 1.5);
    assert.equal(streakMultiplier(365), 1.5);
  });

  test('the multiplier never grows past the largest one', () => {
    assert.equal(streakMultiplier(10_000), MAX_STREAK_MULTIPLIER);
  });

  test('a broken streak is treated as no streak at all', () => {
    assert.equal(streakMultiplier(Number.NaN), 1);
    assert.equal(streakMultiplier(-5), 1);
  });
});

describe('a round with a streak bonus', () => {
  /** A round worth 900 points, with 60 of them for speed, on a 1.25× streak. */
  const completion = {
    date: TODAY,
    region: 'usa',
    score: 900,
    baseScore: 900,
    streakMultiplier: 1.25,
    totalDistance: 400,
    perfectCount: 3,
    timeBonus: 60,
    maxScore: 1000,
    // The level only moves for today's round, so the round is played today.
    today: TODAY,
  };

  test('the score stays what the answers were worth', () => {
    const state = applyDailyCompletion(createInitialState(), completion);
    const entry = state.dailyHistory[0];
    assert.equal(entry.score, 900);
    assert.equal(entry.streakBonus, 225);
    assert.equal(entry.streakMultiplier, 1.25);
    assert.equal(state.totalScore, 900);
  });

  test('the streak bonus is XP for the level, not points', () => {
    // Missions can pay XP for the same round, so the streak's share is read
    // against the same round played without a streak.
    const state = applyDailyCompletion(createInitialState(), completion);
    const plain = applyDailyCompletion(createInitialState(), { ...completion, streakMultiplier: 1 });
    assert.equal(state.totalScore, plain.totalScore);
    assert.equal(totalXp(state) - totalXp(plain), 225);
  });

  test('an older client that sent the bonus in the score is not counted twice', () => {
    const state = applyDailyCompletion(createInitialState(), { ...completion, score: 1125 });
    const fresh = applyDailyCompletion(createInitialState(), completion);
    assert.equal(state.dailyHistory[0].score, 900);
    assert.equal(state.bonusXp, fresh.bonusXp);
  });

  test('a replay of the same day only adds the difference in XP', () => {
    const first = applyDailyCompletion(createInitialState(), completion);
    const again = applyDailyCompletion(first, { ...completion, score: 1000, baseScore: 1000 });
    assert.equal(again.totalScore, 1000);
    assert.equal(again.dailyHistory[0].streakBonus, 250);
    // Only the 25 XP the better round adds on top of the first is new.
    assert.ok(again.bonusXp - first.bonusXp >= 25);
    assert.ok(again.bonusXp - first.bonusXp < 250);
  });

  test('the bonus does not inflate the distance score', () => {
    const state = applyDailyCompletion(createInitialState(), completion);
    // 900 of real points, minus the 60 of speed, is 840.
    assert.equal(state.dailyHistory[0].distanceScore, 840);
  });

  test('the accuracy is measured on the location points alone', () => {
    const state = applyDailyCompletion(createInitialState(), completion);
    // 840 out of the 900 the location share can earn is 93%.
    assert.equal(state.dailyHistory[0].accuracy, 93);
  });

  test('a round without a bonus behaves exactly as before', () => {
    const state = applyDailyCompletion(createInitialState(), {
      date: TODAY,
      region: 'usa',
      score: 900,
      totalDistance: 400,
      perfectCount: 3,
      timeBonus: 60,
      maxScore: 1000,
    });
    const entry = state.dailyHistory[0];
    assert.equal(entry.score, 900);
    assert.equal(entry.distanceScore, 840);
    assert.equal(entry.accuracy, 93);
    assert.equal(entry.streakBonus, undefined);
    assert.equal(entry.streakMultiplier, undefined);
    assert.equal(state.bonusXp, 0);
  });
});

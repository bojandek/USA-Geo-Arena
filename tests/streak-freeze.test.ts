/**
 * Unit tests for the streak-freeze rule.
 *
 * A freeze covers exactly one missed day. It is earned every seven days of a
 * streak and can be banked up to two at a time.
 *
 * Run with: npm test
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  applyDailyCompletion,
  computeStreakWithFreeze,
  createInitialState,
  FREEZE_EVERY_N_DAYS,
  MAX_STREAK_FREEZES,
  migrateState,
  type GameState,
} from '../src/lib/game-state.ts';

const TODAY = '2025-06-15';
const YESTERDAY = '2025-06-14';
const TWO_DAYS_AGO = '2025-06-13';
const THREE_DAYS_AGO = '2025-06-12';

function stateWith(streak: number, lastPlayedDate: string | null, freezes = 0): GameState {
  return { ...createInitialState(), streak, lastPlayedDate, streakFreezes: freezes };
}

describe('computeStreakWithFreeze', () => {
  test('a first ever game starts at one and earns nothing', () => {
    const outcome = computeStreakWithFreeze(0, null, TODAY, 0);
    assert.equal(outcome.streak, 1);
    assert.equal(outcome.freezeUsed, false);
    assert.equal(outcome.freezeEarned, false);
  });

  test('playing the day after yesterday grows the streak', () => {
    const outcome = computeStreakWithFreeze(4, YESTERDAY, TODAY, 0);
    assert.equal(outcome.streak, 5);
    assert.equal(outcome.freezeUsed, false);
  });

  test('a replay never grows the streak and never earns a freeze', () => {
    const outcome = computeStreakWithFreeze(7, TODAY, TODAY, 0);
    assert.equal(outcome.streak, 7);
    assert.equal(outcome.freezeEarned, false);
    assert.equal(outcome.freezes, 0, 'a replay must not hand out a second freeze');
  });

  test('a missed day is covered by a freeze and the streak survives', () => {
    const outcome = computeStreakWithFreeze(12, TWO_DAYS_AGO, TODAY, 1);
    assert.equal(outcome.streak, 13, 'the streak continues through the missed day');
    assert.equal(outcome.freezeUsed, true);
    assert.equal(outcome.freezes, 0, 'the freeze was spent');
  });

  test('a missed day without a freeze resets the streak', () => {
    const outcome = computeStreakWithFreeze(12, TWO_DAYS_AGO, TODAY, 0);
    assert.equal(outcome.streak, 1);
    assert.equal(outcome.freezeUsed, false);
  });

  test('a single freeze cannot cover two missed days', () => {
    const outcome = computeStreakWithFreeze(12, THREE_DAYS_AGO, TODAY, 1);
    assert.equal(outcome.streak, 1, 'a longer gap is still a broken streak');
    assert.equal(outcome.freezeUsed, false);
    assert.equal(outcome.freezes, 1, 'the freeze is kept for another chance');
  });

  test('every seventh day of a streak earns a freeze', () => {
    const outcome = computeStreakWithFreeze(6, YESTERDAY, TODAY, 0);
    assert.equal(outcome.streak, 7);
    assert.equal(outcome.freezeEarned, true);
    assert.equal(outcome.freezes, 1);
  });

  test('a day that is not a multiple of seven earns nothing', () => {
    const outcome = computeStreakWithFreeze(9, YESTERDAY, TODAY, 0);
    assert.equal(outcome.streak, 10);
    assert.equal(outcome.freezeEarned, false);
    assert.equal(outcome.freezes, 0);
  });

  test('freezes never exceed the cap', () => {
    const outcome = computeStreakWithFreeze(6, YESTERDAY, TODAY, MAX_STREAK_FREEZES);
    assert.equal(outcome.streak, 7);
    assert.equal(outcome.freezeEarned, false, 'there is no room for another freeze');
    assert.equal(outcome.freezes, MAX_STREAK_FREEZES);
  });

  test('a broken number of freezes is treated as none', () => {
    const outcome = computeStreakWithFreeze(12, TWO_DAYS_AGO, TODAY, Number.NaN);
    assert.equal(outcome.streak, 1);
    assert.equal(outcome.freezes, 0);
  });
});

describe('the freeze through a real round', () => {
  test('a round after one missed day keeps the streak and spends the freeze', () => {
    const state = applyDailyCompletion(stateWith(12, TWO_DAYS_AGO, 1), {
      date: TODAY,
      score: 700,
      totalDistance: 800,
      perfectCount: 2,
      today: TODAY,
    });

    assert.equal(state.streak, 13);
    assert.equal(state.streakFreezes, 0);
    assert.equal(state.lastPlayedDate, TODAY);
  });

  test('a freeze is earned by reaching the seventh day', () => {
    const state = applyDailyCompletion(stateWith(6, YESTERDAY, 0), {
      date: TODAY,
      score: 700,
      totalDistance: 800,
      perfectCount: 2,
      today: TODAY,
    });

    assert.equal(state.streak, 7);
    assert.equal(state.streakFreezes, 1);
  });

  test('a replay neither spends nor earns a freeze', () => {
    const first = applyDailyCompletion(stateWith(6, YESTERDAY, 1), {
      date: TODAY,
      score: 700,
      totalDistance: 800,
      perfectCount: 2,
      today: TODAY,
    });
    assert.equal(first.streakFreezes, 2, 'the seventh day earned one on top of the one held');

    const replay = applyDailyCompletion(first, {
      date: TODAY,
      score: 800,
      totalDistance: 700,
      perfectCount: 3,
      today: TODAY,
    });
    assert.equal(replay.streak, 7);
    assert.equal(replay.streakFreezes, 2, 'a replay leaves the freezes alone');
  });

  test('an archived day never touches the freezes', () => {
    const state = applyDailyCompletion(stateWith(6, YESTERDAY, 1), {
      date: '2025-06-01',
      score: 700,
      totalDistance: 800,
      perfectCount: 2,
      today: TODAY,
    });

    assert.equal(state.streak, 6);
    assert.equal(state.streakFreezes, 1);
  });
});

describe('freeze storage', () => {
  test('an old payload without freezes still loads', () => {
    const migrated = migrateState({ version: 2, streak: 9, lastPlayedDate: YESTERDAY });
    assert.equal(migrated.streak, 9);
    assert.equal(migrated.streakFreezes, 0);
  });

  test('a stored freeze count above the cap is trimmed', () => {
    const migrated = migrateState({ streak: 9, streakFreezes: 99 });
    assert.equal(migrated.streakFreezes, MAX_STREAK_FREEZES);
  });

  test('a negative stored freeze count is trimmed to zero', () => {
    const migrated = migrateState({ streak: 9, streakFreezes: -5 });
    assert.equal(migrated.streakFreezes, 0);
  });
});

describe('the freeze interval', () => {
  test('a freeze is worth a week of consistency', () => {
    assert.equal(FREEZE_EVERY_N_DAYS, 7);
  });

  test('a player can bank a weekend of protection', () => {
    assert.equal(MAX_STREAK_FREEZES, 2);
  });
});
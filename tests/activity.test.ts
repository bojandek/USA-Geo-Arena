/**
 * Unit tests for the daily record: which days were played and how well.
 *
 * A streak is only a number until you can see it, and these are the rules
 * behind the grid of days on the statistics page.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  activityLevel,
  bestScoreByDay,
  buildActivityGrid,
  lastPlayedBefore,
} from '../src/lib/activity.ts';
import type { DailyResult } from '../src/lib/game-state.ts';

const TODAY = '2025-06-15';

function entry(date: string, score: number, region = 'usa'): DailyResult {
  return {
    date,
    region,
    score,
    accuracy: 80,
    totalDistance: 100,
    perfectCount: 2,
  };
}

describe('bestScoreByDay', () => {
  test('a day with one round keeps its score', () => {
    const best = bestScoreByDay([entry('2025-06-10', 700)]);
    assert.equal(best.get('2025-06-10'), 700);
  });

  test('a day with two rounds keeps the better one', () => {
    const best = bestScoreByDay([
      entry('2025-06-10', 700, 'usa'),
      entry('2025-06-10', 820, 'world'),
    ]);
    assert.equal(best.get('2025-06-10'), 820);
  });

  test('a day that was not played is not in the map at all', () => {
    const best = bestScoreByDay([entry('2025-06-10', 700)]);
    assert.equal(best.has('2025-06-11'), false);
  });

  test('a broken history gives an empty map rather than throwing', () => {
    assert.equal(bestScoreByDay(undefined as never).size, 0);
  });
});

describe('lastPlayedBefore', () => {
  test('finds the most recent round before the day asked about', () => {
    const history = [
      entry('2025-06-10', 700),
      entry('2025-06-12', 640),
      entry('2025-06-13', 810),
    ];
    const last = lastPlayedBefore(history, TODAY);
    assert.equal(last?.date, '2025-06-13');
    assert.equal(last?.score, 810);
  });

  test('today itself does not count', () => {
    const history = [entry(TODAY, 900), entry('2025-06-12', 640)];
    const last = lastPlayedBefore(history, TODAY);
    assert.equal(last?.date, '2025-06-12');
  });

  test('two rounds on the same day keep the better one', () => {
    const history = [
      entry('2025-06-12', 640, 'usa'),
      entry('2025-06-12', 780, 'world'),
    ];
    assert.equal(lastPlayedBefore(history, TODAY)?.score, 780);
  });

  test('nothing before the day asked about gives nothing', () => {
    assert.equal(lastPlayedBefore([entry(TODAY, 900)], TODAY), null);
  });

  test('a broken history gives nothing rather than throwing', () => {
    assert.equal(lastPlayedBefore(undefined as never, TODAY), null);
  });
});

describe('buildActivityGrid', () => {
  test('covers thirteen weeks of days', () => {
    const grid = buildActivityGrid([], TODAY);
    assert.equal(grid.length, 91);
  });

  test('starts on a Monday', () => {
    const grid = buildActivityGrid([], TODAY);
    // 2025-06-15 is a Sunday, so the grid starts on Monday 2025-03-17.
    assert.equal(grid[0].date, '2025-03-17');
  });

  test('ends with the week that is being lived', () => {
    const grid = buildActivityGrid([], TODAY);
    const last = grid[grid.length - 1];
    // The Sunday of the current week.
    assert.equal(last.date, '2025-06-15');
  });

  test('the days that have not happened yet are marked', () => {
    const grid = buildActivityGrid([], TODAY);
    const future = grid.filter((cell) => cell.future);
    assert.equal(future.length, 0, 'today is not in the future');
  });

  test('a day that was played is marked, with its score', () => {
    const grid = buildActivityGrid([entry('2025-06-12', 750)], TODAY);
    const cell = grid.find((item) => item.date === '2025-06-12');
    assert.equal(cell?.played, true);
    assert.equal(cell?.score, 750);
  });

  test('a day that was not played is not marked', () => {
    const grid = buildActivityGrid([entry('2025-06-12', 750)], TODAY);
    const cell = grid.find((item) => item.date === '2025-06-11');
    assert.equal(cell?.played, false);
    assert.equal(cell?.score, 0);
  });
});

describe('activityLevel', () => {
  test('a day that was not played is the palest', () => {
    assert.equal(activityLevel(0), 0);
  });

  test('the colour gets stronger as the score does', () => {
    assert.equal(activityLevel(200), 1);
    assert.equal(activityLevel(500), 2);
    assert.equal(activityLevel(700), 3);
    assert.equal(activityLevel(900), 4);
    assert.equal(activityLevel(1000), 5);
  });

  test('a broken score is treated as no score', () => {
    assert.equal(activityLevel(Number.NaN), 0);
  });

  test('a score above the maximum does not go past the top', () => {
    assert.equal(activityLevel(5000), 5);
  });
});
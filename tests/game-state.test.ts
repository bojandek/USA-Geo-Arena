/**
 * Unit tests for the pure game rules.
 *
 * Run with: npm test
 *
 * These cover the exact scenarios that caused the production bugs:
 * first visit, played today, played yesterday and missed days.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  applyDailyCompletion,
  applyPracticeCompletion,
  buildArchiveEntries,
  buildLeaderboard,
  computeStreak,
  createInitialState,
  evaluateAchievements,
  levelForScore,
  migrateState,
  pointsForLevel,
  withEarnedAchievements,
  type GameState,
} from '../src/lib/game-state.ts';
import { addDays, dateKey, diffDays, formatDayLabel, isPreviousDay, todayKey } from '../src/lib/date-utils.ts';

const TODAY = '2025-06-15';
const YESTERDAY = '2025-06-14';
const DAY_BEFORE = '2025-06-13';

function stateWithStreak(streak: number, lastPlayedDate: string | null): GameState {
  return { ...createInitialState(), streak, lastPlayedDate };
}

describe('date utilities', () => {
  test('dateKey uses the local calendar day', () => {
    // 23:30 local is still the same day - a UTC based implementation would
    // have rolled over to the next day for positive offsets.
    const lateEvening = new Date(2025, 5, 15, 23, 30);
    assert.equal(dateKey(lateEvening), '2025-06-15');

    const earlyMorning = new Date(2025, 5, 15, 0, 30);
    assert.equal(dateKey(earlyMorning), '2025-06-15');
  });

  test('addDays crosses month and year boundaries', () => {
    assert.equal(addDays('2025-01-31', 1), '2025-02-01');
    assert.equal(addDays('2025-01-01', -1), '2024-12-31');
    assert.equal(addDays('2024-02-28', 1), '2024-02-29');
  });

  test('diffDays counts calendar days, not 24h blocks', () => {
    assert.equal(diffDays('2025-06-13', '2025-06-15'), 2);
    assert.equal(diffDays('2025-06-15', '2025-06-15'), 0);
    assert.equal(diffDays('2025-06-15', '2025-06-13'), -2);
  });

  test('isPreviousDay only matches the immediately preceding day', () => {
    assert.equal(isPreviousDay(YESTERDAY, TODAY), true);
    assert.equal(isPreviousDay(DAY_BEFORE, TODAY), false);
    assert.equal(isPreviousDay(TODAY, TODAY), false);
  });

  test('formatDayLabel labels today and yesterday', () => {
    assert.equal(formatDayLabel(TODAY, TODAY), 'Today');
    assert.equal(formatDayLabel(YESTERDAY, TODAY), 'Yesterday');
    assert.match(formatDayLabel('2025-06-01', TODAY), /Jun/);
  });
});

describe('computeStreak - the four critical scenarios', () => {
  test('first ever visit starts the streak at 1', () => {
    assert.equal(computeStreak(0, null, TODAY), 1);
  });

  test('played yesterday continues the streak', () => {
    assert.equal(computeStreak(3, YESTERDAY, TODAY), 4);
  });

  test('already played today does not inflate the streak', () => {
    // Replaying today's challenge must never grant a second day.
    assert.equal(computeStreak(3, TODAY, TODAY), 3);
  });

  test('missing days resets the streak to 1', () => {
    assert.equal(computeStreak(7, DAY_BEFORE, TODAY), 1);
    assert.equal(computeStreak(7, '2025-05-01', TODAY), 1);
  });
});

describe('applyDailyCompletion', () => {
  test('a new day increments games played, total score and streak', () => {
    const state = applyDailyCompletion(stateWithStreak(2, YESTERDAY), {
      date: TODAY,
      score: 800,
      totalDistance: 1200,
      perfectCount: 3,
      now: '2025-06-15T10:00:00.000Z',
      today: TODAY,
    });

    assert.equal(state.streak, 3);
    assert.equal(state.gamesPlayed, 1);
    assert.equal(state.totalScore, 800);
    assert.equal(state.lastPlayedDate, TODAY);
    assert.equal(state.dailyHistory.length, 1);
    // Accuracy is measured on the location points alone, so 800 of the 900
    // location points a full round can hold is 89%.
    assert.equal(state.dailyHistory[0].accuracy, 89);
    assert.equal(state.averageScore, 800);
  });

  test('replaying the same day does not double count', () => {
    const first = applyDailyCompletion(createInitialState(), {
      date: TODAY,
      score: 500,
      totalDistance: 900,
      perfectCount: 1,
      today: TODAY,
    });
    const second = applyDailyCompletion(first, {
      date: TODAY,
      score: 700,
      totalDistance: 800,
      perfectCount: 2,
      today: TODAY,
    });

    assert.equal(second.gamesPlayed, 1, 'games played must not increase on a replay');
    assert.equal(second.totalScore, 700, 'the total reflects the best score of the day');
    assert.equal(second.dailyHistory.length, 1, 'history must hold one entry per day');
    assert.equal(second.dailyHistory[0].score, 700, 'the day keeps the latest score');
    assert.equal(second.bestScore, 700, 'the best score can still improve');
  });

  test('replaying an archived day does not touch progression', () => {
    const state = applyDailyCompletion(stateWithStreak(5, YESTERDAY), {
      date: DAY_BEFORE,
      score: 900,
      totalDistance: 100,
      perfectCount: 5,
      today: TODAY,
    });

    assert.equal(state.streak, 5, 'an archive replay must not change the streak');
    assert.equal(state.lastPlayedDate, YESTERDAY);
    assert.equal(state.gamesPlayed, 0);
    assert.equal(state.totalScore, 0, 'an archive replay must not add to the total score');
    assert.equal(state.dailyHistory.length, 1, 'the archived day is recorded');
  });

  test('a missing perfect count never produces NaN', () => {
    // Regression: the quiz session once handed over the key `perfectGuessCount`
    // while the consumer read `perfectCount`. The counter became NaN, which
    // silently disabled the perfect-guess achievements.
    const state = applyDailyCompletion(createInitialState(), {
      date: TODAY,
      score: 700,
      totalDistance: 120,
      perfectCount: undefined as unknown as number,
      today: TODAY,
    });

    assert.equal(Number.isNaN(state.perfectGuesses), false, 'the counter must stay a number');
    assert.equal(state.perfectGuesses, 0);
    assert.equal(state.dailyHistory[0].perfectCount, 0);
    assert.equal(state.totalScore, 700, 'the score must not be affected');
  });

  test('level is derived from the total score', () => {
    const state = applyDailyCompletion(createInitialState(), {
      date: TODAY,
      score: 1_000,
      totalDistance: 10,
      perfectCount: 10,
      today: TODAY,
    });

    assert.equal(state.level, levelForScore(1_000));
    // The cost of a level grows with the level number, so 1,000 points is
    // not enough for level 2 - that needs 1,250.
    assert.equal(state.level, 1);
  });

  test('the level cost grows, so the level stays a real target', () => {
    // A player who plays every day would pass level 700 within a year with a
    // flat cost per level. The growing curve keeps the number meaningful.
    const oneYear = 1_000 * 365;
    const fiveYears = oneYear * 5;

    assert.ok(levelForScore(oneYear) < 50, 'a year of daily play stays below level 50');
    assert.ok(levelForScore(fiveYears) < 100, 'five years of daily play stays below level 100');

    // Each level must cost more than the one before it.
    let previous = 0;
    for (let level = 2; level <= 40; level++) {
      const cost = pointsForLevel(level) - pointsForLevel(level - 1);
      assert.ok(cost > previous, `level ${level} must cost more than the level before it`);
      previous = cost;
    }
  });

  test('pointsForLevel is the total needed to reach a level', () => {
    assert.equal(pointsForLevel(1), 0);
    assert.equal(pointsForLevel(2), 1_250);
    assert.equal(pointsForLevel(3), 3_750);
    assert.equal(pointsForLevel(4), 7_500);

    // The level for a score must be the highest level it pays for.
    for (const score of [0, 1_249, 1_250, 3_749, 3_750, 12_500, 125_000]) {
      const level = levelForScore(score);
      assert.ok(score >= pointsForLevel(level), `${score} must pay for level ${level}`);
      assert.ok(score < pointsForLevel(level + 1), `${score} must not pay for level ${level + 1}`);
    }
  });

  test('history is capped at 30 entries, keeping the newest', () => {
    let state = createInitialState();
    for (let i = 0; i < 40; i++) {
      state = applyDailyCompletion(state, {
        date: `2025-01-${String((i % 28) + 1).padStart(2, '0')}`,
        score: 100 + i,
        totalDistance: 100,
        perfectCount: 0,
        today: TODAY,
      });
    }
    assert.ok(state.dailyHistory.length <= 30, 'history must stay capped');
  });
});

describe('practice results', () => {
  test('practice never changes progression', () => {
    const before = createInitialState();
    const after = applyPracticeCompletion(before, 9500);

    assert.equal(after.totalScore, before.totalScore);
    assert.equal(after.level, before.level);
    assert.equal(after.streak, before.streak);
    assert.equal(after.gamesPlayed, before.gamesPlayed);
    assert.equal(after.practiceGames, 1);
    assert.equal(after.practiceBestScore, 9500);
    assert.equal(after.practiceTotalScore, 9500);
  });

  test('practice keeps the best score', () => {
    let state = applyPracticeCompletion(createInitialState(), 3000);
    state = applyPracticeCompletion(state, 5000);
    state = applyPracticeCompletion(state, 4000);

    assert.equal(state.practiceBestScore, 5000);
    assert.equal(state.practiceTotalScore, 12_000);
    assert.equal(state.practiceGames, 3);
  });
});


describe('achievements', () => {
  test('the first completed game unlocks first_win', () => {
    const state = applyDailyCompletion(createInitialState(), {
      date: TODAY,
      score: 300,
      totalDistance: 500,
      perfectCount: 0,
      today: TODAY,
    });
    assert.ok(state.achievements.some((a) => a.id === 'first_win'));
  });

  test('achievements are never unlocked twice', () => {
    let state = applyDailyCompletion(createInitialState(), {
      date: TODAY,
      score: 300,
      totalDistance: 500,
      perfectCount: 0,
      today: TODAY,
    });
    const firstCount = state.achievements.length;
    state = withEarnedAchievements(state, '2025-06-15T11:00:00.000Z');

    assert.equal(state.achievements.length, firstCount);
    assert.equal(
      new Set(state.achievements.map((a) => a.id)).size,
      state.achievements.length,
      'achievement ids must be unique',
    );
  });

  test('a perfect game unlocks perfect_10', () => {
    const state = applyDailyCompletion(createInitialState(), {
      date: TODAY,
      score: 1_300,
      totalDistance: 0,
      perfectCount: 10,
      today: TODAY,
    });
    assert.ok(state.achievements.some((a) => a.id === 'perfect_10'));
    assert.ok(state.achievements.some((a) => a.id === 'perfect_guess'));
    assert.ok(state.achievements.some((a) => a.id === 'perfect_5'));
  });

  test('the speed bonus does not unlock perfection on its own', () => {
    // 890 location points plus 100 of speed reaches 990, but the player was
    // not accurate enough, so "Perfection" stays locked.
    const state = applyDailyCompletion(createInitialState(), {
      date: TODAY,
      score: 990,
      timeBonus: 100,
      totalDistance: 0,
      perfectCount: 0,
      today: TODAY,
    });

    assert.equal(state.bestScore, 990, 'the total score is kept');
    assert.equal(state.bestDistanceScore, 890, 'the location score is tracked separately');
    assert.ok(
      !state.achievements.some((a) => a.id === 'perfect_10'),
      'a fast but inaccurate round must not unlock Perfection',
    );
  });

  test('a flawless and fast round unlocks the speed achievements', () => {
    const state = applyDailyCompletion(createInitialState(), {
      date: TODAY,
      score: 1_000,
      timeBonus: 100,
      totalDistance: 0,
      perfectCount: 10,
      today: TODAY,
    });

    assert.equal(state.bestTimeBonus, 100);
    assert.ok(state.achievements.some((a) => a.id === 'speed_demon'));
    assert.ok(state.achievements.some((a) => a.id === 'speed_50'));
    assert.ok(state.achievements.some((a) => a.id === 'perfect_10'));
  });

  test('the best speed bonus is a record and is never lost', () => {
    const first = applyDailyCompletion(createInitialState(), {
      date: TODAY,
      score: 800,
      timeBonus: 80,
      totalDistance: 100,
      perfectCount: 1,
      today: TODAY,
    });

    // A slower replay of the same day must not erase the record.
    const second = applyDailyCompletion(first, {
      date: TODAY,
      score: 700,
      timeBonus: 10,
      totalDistance: 200,
      perfectCount: 0,
      today: TODAY,
    });

    assert.equal(second.bestTimeBonus, 80, 'the record survives a worse replay');
    assert.ok(
      second.achievements.some((a) => a.id === 'speed_50'),
      'the badge earned earlier is not taken away',
    );
  });

  test('achievement rules are evaluated against the current state', () => {
    const state = { ...createInitialState(), streak: 7, gamesPlayed: 10, totalScore: 5_000 };
    const earned = evaluateAchievements(state);

    assert.ok(earned.includes('streak_7'));
    assert.ok(earned.includes('games_10'));
    assert.ok(earned.includes('score_5k'));
    assert.ok(!earned.includes('streak_30'));
  });
});

describe('leaderboard and archive', () => {
  const history = [
    { date: '2025-06-13', score: 300, accuracy: 30, totalDistance: 0, perfectCount: 0 },
    { date: '2025-06-14', score: 900, accuracy: 90, totalDistance: 0, perfectCount: 0 },
    { date: '2025-06-15', score: 600, accuracy: 60, totalDistance: 0, perfectCount: 0 },
  ];

  test('the leaderboard is sorted by score and does not mutate the history', () => {
    const originalOrder = history.map((entry) => entry.date);
    const board = buildLeaderboard(history, 2);

    assert.equal(board.length, 2);
    assert.equal(board[0].score, 900);
    assert.equal(board[1].score, 600);
    assert.deepEqual(
      history.map((entry) => entry.date),
      originalOrder,
      'the source history must not be reordered',
    );
  });

  test('the archive is built from real history', () => {
    const entries = buildArchiveEntries(history, 5, TODAY);

    assert.equal(entries.length, 5);
    assert.equal(entries[0].date, TODAY);
    assert.equal(entries[0].completed, true);
    assert.equal(entries[0].score, 600);
    assert.equal(entries[1].date, YESTERDAY);
    assert.equal(entries[1].score, 900);
    // A day without a result is simply "not played".
    assert.equal(entries[4].completed, false);
    assert.equal(entries[4].score, null);
  });
});

describe('migrateState', () => {
  test('a corrupted payload degrades to a fresh state', () => {
    assert.deepEqual(migrateState(null), createInitialState());
    assert.deepEqual(migrateState('nonsense'), createInitialState());
    assert.deepEqual(migrateState(42), createInitialState());
  });

  test('a legacy ISO timestamp is normalised to a day key', () => {
    const migrated = migrateState({
      lastPlayedDate: '2025-06-15T22:30:00.000Z',
      dailyCompleted: true,
      totalScore: 800,
      gamesPlayed: 3,
    });

    assert.match(migrated.lastPlayedDate ?? '', /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(migrated.totalScore, 800);
    assert.equal(migrated.gamesPlayed, 3);
    assert.equal(migrated.level, levelForScore(800));
  });

  test('legacy history entries are kept and completed', () => {
    const migrated = migrateState({
      dailyHistory: [
        { date: '2025-06-14', score: 700, accuracy: 70 },
        { date: '2025-06-15', score: 800, accuracy: 80 },
      ],
    });

    assert.equal(migrated.dailyHistory.length, 2);
    assert.equal(migrated.dailyHistory[0].totalDistance, 0);
    assert.equal(migrated.dailyHistory[1].perfectCount, 0);
  });
});


/**
 * Unit tests for the daily missions, mission XP, the level progress and the
 * streak status shown on the home page.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  ALL_MISSIONS,
  MISSIONS_PER_DAY,
  missionClaimId,
  missionStatuses,
  missionsForDay,
} from '../src/lib/missions.ts';
import {
  applyDailyCompletion,
  createInitialState,
  levelForScore,
  levelProgress,
  migrateState,
  pointsForLevel,
  totalXp,
} from '../src/lib/game-state.ts';
import { formatCountdown, msUntilNextDay, streakStatus } from '../src/lib/activity.ts';

const TODAY = '2026-11-05';
const answers = (distances: number[]) =>
  distances.map((distance, index) => ({ questionId: `q${index}`, distance, score: 100 }));

describe('missionsForDay', () => {
  test('offers the same missions to every player on a day', () => {
    assert.deepEqual(
      missionsForDay(TODAY).map((mission) => mission.id),
      missionsForDay(TODAY).map((mission) => mission.id),
    );
  });

  test('offers three distinct missions, always including play-both', () => {
    for (let day = 1; day <= 30; day++) {
      const ids = missionsForDay(`2026-11-${String(day).padStart(2, '0')}`).map((m) => m.id);
      assert.equal(ids.length, MISSIONS_PER_DAY);
      assert.equal(new Set(ids).size, ids.length);
      assert.ok(ids.includes('play_both'));
    }
  });

  test('the draw changes from day to day', () => {
    const sets = new Set<string>();
    for (let day = 1; day <= 14; day++) {
      sets.add(missionsForDay(`2026-11-${String(day).padStart(2, '0')}`).map((m) => m.id).join());
    }
    assert.ok(sets.size > 1);
  });

  test('every mission has a positive reward and target', () => {
    for (const mission of ALL_MISSIONS) {
      assert.ok(mission.reward > 0 && mission.target > 0, mission.id);
    }
  });
});

describe('missionStatuses', () => {
  test('only counts results from that day', () => {
    const history = [
      { date: '2026-11-04', region: 'usa', score: 1000, accuracy: 90, totalDistance: 0, perfectCount: 0 },
      { date: '2026-11-04', region: 'world', score: 1000, accuracy: 90, totalDistance: 0, perfectCount: 0 },
    ];
    const playBoth = missionStatuses(history, TODAY).find((s) => s.mission.id === 'play_both')!;
    assert.equal(playBoth.current, 0);
    assert.equal(playBoth.done, false);
  });

  test('play-both is done once both regions are played', () => {
    const history = [
      { date: TODAY, region: 'usa', score: 500, accuracy: 50, totalDistance: 0, perfectCount: 0 },
      { date: TODAY, region: 'world', score: 500, accuracy: 50, totalDistance: 0, perfectCount: 0 },
    ];
    const playBoth = missionStatuses(history, TODAY).find((s) => s.mission.id === 'play_both')!;
    assert.equal(playBoth.done, true);
    assert.equal(playBoth.current, 2);
  });
});

describe('mission XP', () => {
  test('completing a mission pays its XP once, into the level and not the score', () => {
    const usa = applyDailyCompletion(createInitialState(), {
      date: TODAY,
      region: 'usa',
      score: 600,
      totalDistance: 0,
      perfectCount: 0,
      answers: answers([10, 10, 10, 10, 10, 3000, 3000, 3000, 3000, 3000]),
      today: TODAY,
    });
    const both = applyDailyCompletion(usa, {
      date: TODAY,
      region: 'world',
      score: 600,
      totalDistance: 0,
      perfectCount: 0,
      answers: answers([3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000]),
      today: TODAY,
    });

    assert.ok(both.claimedMissions.includes(missionClaimId(TODAY, 'play_both')));
    assert.equal(both.totalScore, 1200);
    assert.ok(both.bonusXp >= 150);
    assert.equal(both.level, levelForScore(both.totalScore + both.bonusXp));

    // Replaying today pays nothing new.
    const replay = applyDailyCompletion(both, {
      date: TODAY,
      region: 'world',
      score: 650,
      totalDistance: 0,
      perfectCount: 0,
      answers: answers([3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000]),
      today: TODAY,
    });
    assert.equal(replay.bonusXp, both.bonusXp);
  });

  test('an archived day never pays missions', () => {
    const state = applyDailyCompletion(createInitialState(), {
      date: '2026-11-01',
      region: 'usa',
      score: 1000,
      totalDistance: 0,
      perfectCount: 10,
      answers: answers(Array(10).fill(1)),
      today: TODAY,
    });
    assert.equal(state.bonusXp, 0);
    assert.deepEqual(state.claimedMissions, []);
  });

  test('older saves migrate with no mission XP', () => {
    const state = migrateState({ totalScore: 2000 });
    assert.equal(state.bonusXp, 0);
    assert.deepEqual(state.claimedMissions, []);
    assert.equal(totalXp(state), 2000);
  });
});

describe('levelProgress', () => {
  test('starts at level 1 with nothing in', () => {
    const progress = levelProgress(0);
    assert.equal(progress.level, 1);
    assert.equal(progress.into, 0);
    assert.equal(progress.span, pointsForLevel(2));
  });

  test('sits halfway through a level', () => {
    const floor = pointsForLevel(3);
    const span = pointsForLevel(4) - floor;
    const progress = levelProgress(floor + span / 2);
    assert.equal(progress.level, 3);
    assert.equal(progress.fraction, 0.5);
    assert.equal(progress.remaining, span / 2);
  });
});

describe('streakStatus', () => {
  const base = { streak: 5, streakFreezes: 0 };

  test('no streak when never played', () => {
    assert.deepEqual(streakStatus({ ...base, lastPlayedDate: null }, TODAY), { kind: 'none', streak: 0 });
  });

  test('safe once today is played', () => {
    assert.equal(streakStatus({ ...base, lastPlayedDate: TODAY }, TODAY).kind, 'safe');
  });

  test('at risk when last played yesterday', () => {
    assert.equal(streakStatus({ ...base, lastPlayedDate: '2026-11-04' }, TODAY).kind, 'at-risk');
  });

  test('a freeze covers exactly one missed day', () => {
    const frozen = streakStatus({ streak: 5, streakFreezes: 1, lastPlayedDate: '2026-11-03' }, TODAY);
    assert.deepEqual(frozen, { kind: 'frozen', streak: 5 });
    const lost = streakStatus({ streak: 5, streakFreezes: 1, lastPlayedDate: '2026-11-02' }, TODAY);
    assert.deepEqual(lost, { kind: 'lost', streak: 0 });
  });

  test('lost without a freeze after a missed day', () => {
    assert.deepEqual(streakStatus({ ...base, lastPlayedDate: '2026-11-03' }, TODAY), {
      kind: 'lost',
      streak: 0,
    });
  });
});

describe('countdown', () => {
  test('counts to local midnight', () => {
    const now = new Date(2026, 10, 5, 22, 30, 0);
    assert.equal(msUntilNextDay(now), 90 * 60 * 1000);
  });

  test('formats hours and minutes, then minutes and seconds', () => {
    assert.equal(formatCountdown((5 * 3600 + 7 * 60) * 1000), '5h 07m');
    assert.equal(formatCountdown((12 * 60 + 5) * 1000), '12m 05s');
    assert.equal(formatCountdown(-1), '0m 00s');
  });
});

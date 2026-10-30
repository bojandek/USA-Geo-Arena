/**
 * Tests for the global leaderboard and the round behind it.
 *
 * The board is the one place where the site takes a number from a browser
 * and writes it down, so the rules it applies are checked here rather than by
 * clicking through a live deployment.
 */

import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { getDailyQuestions, getDailyQuestionsForDay } from '../src/lib/game-data.ts';
import {
  isDayKey,
  localDayKey,
  previousDayKey,
  scoreRound,
} from '../server/_lib/round.ts';
import handler from '../server/leaderboard.ts';

const DAY = '2025-06-15';

/** The questions of a round, as a plain list. */
function roundFor(day: string, region: 'usa' | 'world' = 'usa') {
  return getDailyQuestionsForDay(day, region);
}

/** Answers that put the pin exactly on the answer. */
function perfectAnswers(day: string, region: 'usa' | 'world' = 'usa') {
  return roundFor(day, region).map((question) => ({
    id: question.id,
    lat: question.lat,
    lng: question.lng,
    elapsedSeconds: 0,
  }));
}

describe('the round is worked out from the day key', () => {
  test('a day key gives the same ten questions as the same day as a date', () => {
    assert.deepEqual(
      getDailyQuestionsForDay(DAY, 'usa').map((q) => q.id),
      getDailyQuestions(new Date(2025, 5, 15), 'usa').map((q) => q.id),
    );
  });

  test('the same day always gives the same questions', () => {
    assert.deepEqual(
      getDailyQuestionsForDay(DAY, 'usa').map((q) => q.id),
      getDailyQuestionsForDay(DAY, 'usa').map((q) => q.id),
    );
  });

  test('the two rounds are different rounds', () => {
    const usa = new Set(roundFor(DAY, 'usa').map((q) => q.id));
    const world = roundFor(DAY, 'world').map((q) => q.id);
    assert.equal(world.length, 10);
    assert.equal(world.some((id) => usa.has(id)), false);
  });
});

describe('the day the player is in', () => {
  test('a player twelve hours ahead is already on tomorrow', () => {
    const now = Date.parse('2025-06-15T23:00:00Z');
    assert.equal(localDayKey(now, 0), '2025-06-15');
    assert.equal(localDayKey(now, 12 * 60), '2025-06-16');
    assert.equal(localDayKey(now, -12 * 60), '2025-06-15');
  });

  test('a player eight hours behind is still on yesterday', () => {
    const now = Date.parse('2025-06-16T02:00:00Z');
    assert.equal(localDayKey(now, 0), '2025-06-16');
    assert.equal(localDayKey(now, -8 * 60), '2025-06-15');
  });

  test('the day before is worked out in local calendar arithmetic', () => {
    assert.equal(previousDayKey('2025-06-15'), '2025-06-14');
    assert.equal(previousDayKey('2025-03-01'), '2025-02-28');
    assert.equal(previousDayKey('2025-01-01'), '2024-12-31');
  });

  test('a day key is a day key and nothing else', () => {
    assert.equal(isDayKey('2025-06-15'), true);
    assert.equal(isDayKey('15-06-2025'), false);
    assert.equal(isDayKey('2025-6-15'), false);
    assert.equal(isDayKey(20250615), false);
  });
});

describe('the round is scored on the server', () => {
  test('a perfect round is worth the whole round', () => {
    const result = scoreRound({
      day: DAY,
      region: 'usa',
      answers: perfectAnswers(DAY),
    });

    assert.equal(result.counted, 10);
    assert.equal(result.score, 1300);
    assert.equal(result.maxScore, 1300);
    assert.equal(result.baseScore, 1300);
  });

  test('the score is worked out from the guesses, not from a claim', () => {
    // The same round, answered from the other side of the world, is worth
    // nothing at all - and no claim in the request can change that.
    const nowhere = roundFor(DAY).map((question) => ({
      id: question.id,
      lat: question.lat,
      lng: (question.lng + 180) % 360,
      elapsedSeconds: 0,
    }));

    const result = scoreRound({ day: DAY, region: 'usa', answers: nowhere });
    assert.equal(result.score, 0);
  });

  test('a guess in the right place is worth more than one far away', () => {
    const answers = roundFor(DAY).map((question, index) => ({
      id: question.id,
      lat: question.lat,
      lng: question.lng,
      elapsedSeconds: index < 5 ? 0 : 600,
    }));

    const result = scoreRound({ day: DAY, region: 'usa', answers });
    assert.ok(result.score > 0);
    assert.ok(result.score < 1300);
  });

  test('a question that was not in the round is not counted', () => {
    const answers = [
      ...perfectAnswers(DAY),
      { id: 'not-a-question-of-today', lat: 0, lng: 0, elapsedSeconds: 0 },
    ];

    const result = scoreRound({ day: DAY, region: 'usa', answers });
    assert.equal(result.counted, 10);
    assert.equal(result.score, 1300);
  });

  test('a question of the other round is not counted', () => {
    const answers = perfectAnswers(DAY, 'world');

    const result = scoreRound({ day: DAY, region: 'usa', answers });
    assert.equal(result.counted, 0);
    assert.equal(result.score, 0);
  });

  test('the same question is never counted twice', () => {
    const answers = [
      ...perfectAnswers(DAY),
      ...perfectAnswers(DAY).slice(0, 3),
    ];

    const result = scoreRound({ day: DAY, region: 'usa', answers });
    assert.equal(result.counted, 10);
    assert.equal(result.score, 1300);
  });

  test('the points spent on hints come off the score', () => {
    const result = scoreRound({
      day: DAY,
      region: 'usa',
      answers: perfectAnswers(DAY),
      hintCost: 50,
    });

    assert.equal(result.baseScore, 1250);
    assert.equal(result.score, 1250);
  });

  test('the streak decides the multiplier, and the rule is the game rule', () => {
    const withoutStreak = scoreRound({
      day: DAY,
      region: 'usa',
      answers: perfectAnswers(DAY),
      streak: 0,
    });
    const withStreak = scoreRound({
      day: DAY,
      region: 'usa',
      answers: perfectAnswers(DAY),
      streak: 30,
    });

    assert.equal(withoutStreak.score, 1300);
    assert.equal(withStreak.score, 1950);
    assert.equal(withStreak.maxScore, 1950);
  });

  test('a broken guess is worth nothing rather than a wrong number', () => {
    const answers = roundFor(DAY).map((question) => ({
      id: question.id,
      lat: Number.NaN,
      lng: null,
      elapsedSeconds: 0,
    }));

    const result = scoreRound({ day: DAY, region: 'usa', answers });
    assert.equal(result.counted, 10);
    assert.equal(result.score, 0);
  });
});

describe('the board route', () => {
  const originalFetch = globalThis.fetch;

  process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  /** Stands in for the database and records what the route asked it to do. */
  function boardMock(existing?: { score: number } | null) {
    const calls: { url: string; init?: RequestInit }[] = [];

    globalThis.fetch = (async (input: unknown, init?: RequestInit) => {
      const url = String(input);
      calls.push({ url, init });

      if (init?.method === 'POST') {
        return new Response(null, { status: 201 });
      }
      return new Response(JSON.stringify(existing ? [existing] : []), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }) as unknown as typeof fetch;

    return calls;
  }

  function send(body: unknown) {
    return handler(
      new Request('https://geoarena.test/api/leaderboard', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }),
    );
  }

  test('a claimed score on its own is not worth a row', async () => {
    const calls = boardMock();
    const response = await send({
      day: localDayKey(Date.now(), 0),
      region: 'usa',
      score: 1300,
      playerHash: 'p_test',
    });

    assert.equal(response.status, 400);
    assert.equal(calls.length, 0);
  });

  test('the round is written as an upsert, so a replay is not a conflict', async () => {
    const calls = boardMock();
    const day = localDayKey(Date.now(), 0);

    const response = await send({
      day,
      region: 'usa',
      tzOffset: 0,
      answers: perfectAnswers(day),
      streak: 0,
      playerHash: 'p_test',
    });

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.saved, true);
    assert.equal(payload.score, 1300);

    const write = calls.find((call) => call.init?.method === 'POST');
    assert.ok(write, 'the row was never written');
    assert.ok(write.url.includes('on_conflict=day_key,region,player_hash'));

    const headers = (write.init?.headers ?? {}) as Record<string, string>;
    assert.ok(String(headers.Prefer).includes('resolution=merge-duplicates'));

    const body = JSON.parse(String(write.init?.body));
    assert.equal(body.day_key, day);
    assert.equal(body.region, 'usa');
    assert.equal(body.score, 1300);
    assert.equal(body.player_hash, 'p_test');
  });

  test('a replay that scored less keeps the better round', async () => {
    const calls = boardMock({ score: 1300 });
    const day = localDayKey(Date.now(), 0);
    const worse = roundFor(day).map((question) => ({
      id: question.id,
      lat: question.lat + 5,
      lng: question.lng,
      elapsedSeconds: 0,
    }));

    const response = await send({
      day,
      region: 'usa',
      tzOffset: 0,
      answers: worse,
      streak: 0,
      playerHash: 'p_test',
    });

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.kept, true);
    assert.equal(payload.score, 1300);
    assert.equal(calls.filter((call) => call.init?.method === 'POST').length, 0);
  });

  test('a round that is not from today is refused', async () => {
    const calls = boardMock();
    const response = await send({
      day: '2020-01-01',
      region: 'usa',
      tzOffset: 0,
      answers: perfectAnswers('2020-01-01'),
      playerHash: 'p_test',
    });

    assert.equal(response.status, 400);
    assert.equal(calls.length, 0);
  });

  test('a player twelve hours ahead is not shut out of their own day', async () => {
    const calls = boardMock();
    const day = localDayKey(Date.now(), 12 * 60);

    const response = await send({
      day,
      region: 'usa',
      tzOffset: 12 * 60,
      answers: perfectAnswers(day),
      playerHash: 'p_test',
    });

    assert.equal(response.status, 200);
    assert.equal(calls.filter((call) => call.init?.method === 'POST').length, 1);
  });

  test('the world round is written to the world round of the board', async () => {
    const calls = boardMock();
    const day = localDayKey(Date.now(), 0);

    const response = await send({
      day,
      region: 'world',
      tzOffset: 0,
      answers: perfectAnswers(day, 'world'),
      playerHash: 'p_test',
    });

    assert.equal(response.status, 200);
    const write = calls.find((call) => call.init?.method === 'POST');
    const body = JSON.parse(String(write?.init?.body));
    assert.equal(body.region, 'world');
    assert.equal(body.score, 1300);
  });
});

describe('where a score stands', () => {
  test('reads the total from a content-range header', async () => {
    const { countFromRange } = await import('../server/leaderboard.ts');
    assert.equal(countFromRange('0-0/123'), 123);
    assert.equal(countFromRange('*/0'), 0);
    assert.equal(countFromRange(null), null);
  });

  test('the share of the others a score beat', async () => {
    const { betterThanPercent } = await import('../src/lib/global-board.ts');
    assert.equal(betterThanPercent(null), null);
    assert.equal(betterThanPercent({ players: 1, below: 0 }), null);
    assert.equal(betterThanPercent({ players: 11, below: 10 }), 100);
    assert.equal(betterThanPercent({ players: 5, below: 2 }), 50);
    assert.equal(betterThanPercent({ players: 4, below: 0 }), 0);
  });
});

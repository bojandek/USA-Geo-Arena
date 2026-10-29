/**
 * Unit tests for the question/scoring layer.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateDistance,
  calculateScore,
  DAILY_QUESTION_COUNT,
  generateShareText,
  getDailyQuestions,
  getDateString,
  getResultEmoji,
  questionPool,
  venueKey,
} from '../src/lib/game-data.ts';
import { SCORE_BANDS, SCORING_PAGE, getSitePage, HEADER_INFO_LINKS } from '../src/lib/site-content.ts';

describe('calculateScore', () => {
  test('uses the documented distance bands', () => {
    assert.equal(calculateScore(0), 100);
    assert.equal(calculateScore(24.9), 100);
    assert.equal(calculateScore(25), 95);
    assert.equal(calculateScore(49.9), 95);
    assert.equal(calculateScore(50), 90);
    assert.equal(calculateScore(99.9), 90);
    assert.equal(calculateScore(100), 80);
    assert.equal(calculateScore(199.9), 80);
    assert.equal(calculateScore(200), 60);
    assert.equal(calculateScore(499.9), 60);
    assert.equal(calculateScore(500), 40);
    assert.equal(calculateScore(999.9), 40);
    assert.equal(calculateScore(1000), 20);
    assert.equal(calculateScore(1999.9), 20);
    assert.equal(calculateScore(2000), 10);
    assert.equal(calculateScore(4999.9), 10);
  });

  test('a guess of 5,000 km or more is worth nothing', () => {
    // The point of no return - the far side of the world.
    assert.equal(calculateScore(5000), 0);
    assert.equal(calculateScore(8000), 0);
    assert.equal(calculateScore(50_000), 0);
  });

  test('the score table on the scoring page matches the real bands', () => {
    for (const band of SCORE_BANDS) {
      // The band value applies to a guess just inside the band.
      const distance = band.maxKm === Infinity ? 5000 : band.maxKm - 0.1;
      assert.equal(
        calculateScore(distance),
        band.points,
        `the band for ${band.label} does not match the scoring`,
      );
    }
  });

  test('is monotonic - a closer guess never scores less', () => {
    let previous = Number.POSITIVE_INFINITY;
    for (let distance = 0; distance < 20_000; distance += 137) {
      const score = calculateScore(distance);
      assert.ok(score <= previous, `score must not increase at ${distance} km`);
      previous = score;
    }
  });
});

describe('calculateDistance', () => {
  test('the same point is zero distance', () => {
    assert.equal(calculateDistance(44.7833, 20.4667, 44.7833, 20.4667), 0);
  });

  test('matches a known great-circle distance', () => {
    // Belgrade -> London is roughly 1,696 km.
    const distance = calculateDistance(44.7833, 20.4667, 51.4344, -0.2141);
    assert.ok(distance > 1650 && distance < 1750, `unexpected distance: ${distance}`);
  });

  test('is symmetric', () => {
    const a = calculateDistance(40.4531, -3.6884, 48.2188, 11.6247);
    const b = calculateDistance(48.2188, 11.6247, 40.4531, -3.6884);
    assert.ok(Math.abs(a - b) < 1e-9);
  });

  test('handles the antimeridian without exploding', () => {
    const distance = calculateDistance(0, 179.9, 0, -179.9);
    assert.ok(distance < 50, `expected a short distance, got ${distance}`);
  });
});

describe('the question pool', () => {
  test('every question is complete and valid', () => {
    for (const question of questionPool) {
      assert.ok(question.id, 'a question is missing its id');
      assert.ok(question.text.length > 20, `${question.id} has a suspiciously short text`);
      assert.ok(question.hint && question.hint.length > 3, `${question.id} is missing a hint`);
      assert.ok(question.country && question.country.length > 2, `${question.id} is missing a country`);
      assert.equal(question.facts.length, 4, `${question.id} should have four facts`);
      assert.ok(
        Math.abs(question.lat) <= 90 && Math.abs(question.lng) <= 180,
        `${question.id} has coordinates outside the world`,
      );
      assert.ok(
        ['stadium', 'event', 'club', 'athlete'].includes(question.category),
        `${question.id} has an unknown category: ${question.category}`,
      );
    }
  });

  test('the ids are unique', () => {
    const ids = questionPool.map((q) => q.id);
    assert.equal(new Set(ids).size, ids.length, 'two questions share the same id');
  });

  test('the pool is big enough that the daily set stays fresh', () => {
    // With only a few dozen questions the same ten came back every second
    // day, which is what killed the daily habit. The pool has to stay well
    // above the ten questions a round uses.
    assert.ok(
      questionPool.length >= 150,
      `the pool has only ${questionPool.length} questions, which is too few`,
    );
  });

  test('a full round does not repeat for weeks', () => {
    // Walk a year of daily sets and make sure no two consecutive days are
    // made of the very same questions.
    const seenSets = new Set<string>();
    let identicalNeighbour = 0;
    let previous: string | null = null;

    for (let day = 0; day < 365; day++) {
      const date = new Date(Date.UTC(2025, 0, 1 + day));
      const key = getDailyQuestions(date)
        .map((q) => q.id)
        .sort()
        .join(',');
      if (key === previous) identicalNeighbour++;
      if (seenSets.has(key)) {
        // The same set can come back, but not on consecutive days.
        assert.notEqual(key, previous, 'two consecutive days share the same questions');
      }
      seenSets.add(key);
      previous = key;
    }

    assert.equal(identicalNeighbour, 0);
  });

  test('the pool covers more than one sport', () => {
    const categories = new Set(questionPool.map((q) => q.category));
    assert.ok(categories.size >= 3, 'the pool is too narrow');
  });

  test('a round never asks about the same place twice', () => {
    // Several questions point at the same venue - one about the stadium, one
    // about a final played there. A player should never see both in the same
    // round.
    for (let day = 1; day <= 365; day++) {
      const date = new Date(Date.UTC(2025, 0, 1 + day));
      const keys = getDailyQuestions(date).map(venueKey);
      assert.equal(
        new Set(keys).size,
        keys.length,
        `two questions about the same place on day ${day}`,
      );
    }
  });
});

describe('getDailyQuestions', () => {
  test('returns the daily number of questions', () => {
    const questions = getDailyQuestions(new Date(2025, 5, 15));
    assert.equal(questions.length, DAILY_QUESTION_COUNT);
  });

  test('is deterministic for the same day', () => {
    const first = getDailyQuestions(new Date(2025, 5, 15));
    const second = getDailyQuestions(new Date(2025, 5, 15));
    assert.deepEqual(
      first.map((q) => q.id),
      second.map((q) => q.id),
    );
  });

  test('different days produce different question sets', () => {
    const first = getDailyQuestions(new Date(2025, 5, 15));
    const second = getDailyQuestions(new Date(2025, 5, 16));
    assert.notDeepEqual(
      first.map((q) => q.id),
      second.map((q) => q.id),
    );
  });

  test('never returns the same location twice', () => {
    for (let day = 1; day <= 28; day++) {
      const questions = getDailyQuestions(new Date(2025, 5, day));
      const coordinates = questions.map((q) => `${q.lat},${q.lng}`);
      assert.equal(
        new Set(coordinates).size,
        coordinates.length,
        `duplicate coordinates on 2025-06-${day}`,
      );
    }
  });

  test('a round never asks about the same place twice', () => {
    // The pool deliberately holds several questions about the same ground - a
    // stadium and a final played there - so the daily generator has to skip
    // the second one. This is the rule that makes that work.
    for (let day = 1; day <= 60; day++) {
      const questions = getDailyQuestions(new Date(2025, 5, day));
      const keys = questions.map(venueKey);
      assert.equal(
        new Set(keys).size,
        keys.length,
        `duplicate venue on 2025-06-${day}`,
      );
    }
  });

  test('uses the local calendar day', () => {
    // 23:30 and 00:30 of the same local day must yield the same questions.
    const lateEvening = getDailyQuestions(new Date(2025, 5, 15, 23, 30));
    const earlyMorning = getDailyQuestions(new Date(2025, 5, 15, 0, 30));
    assert.deepEqual(
      lateEvening.map((q) => q.id),
      earlyMorning.map((q) => q.id),
    );
  });
});



describe('share text', () => {
  test('contains the score, the maximum and the percentage', () => {
    const text = generateShareText(800, 1_000);
    assert.match(text, /800\/1000/);
    assert.match(text, /80%/);
  });

  test('does not divide by zero', () => {
    const text = generateShareText(0, 0);
    assert.match(text, /0%/);
  });

  test('uses the daily maximum by default', () => {
    // A full round is worth 1,300 points, because the last three questions
    // are worth more than the first seven.
    const text = generateShareText(1_300);
    assert.match(text, /1300/);
    assert.match(text, /100%/);
  });

  test('includes the speed bonus when there is one', () => {
    const text = generateShareText(800, 1_000, 64);
    assert.match(text, /Speed bonus: \+64/);
  });

  test('omits the speed bonus line when there is none', () => {
    const text = generateShareText(800, 1_000, 0);
    assert.doesNotMatch(text, /Speed bonus/);
  });
});

describe('getResultEmoji', () => {
  test('returns an emoji for every score band', () => {
    for (const score of [0, 3500, 4500, 5500, 6500, 7500, 8500, 9500]) {
      const emoji = getResultEmoji(score);
      assert.ok(emoji.length > 0, `missing emoji for ${score}`);
    }
  });
});

describe('getDateString', () => {
  test('formats a local day key', () => {
    assert.equal(getDateString(new Date(2025, 0, 5)), '2025-01-05');
    assert.equal(getDateString(new Date(2025, 11, 31)), '2025-12-31');
  });
});


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
  PRACTICE_QUESTIONS,
  questionPool,
} from '../src/lib/game-data.ts';

describe('calculateScore', () => {
  test('uses the documented distance bands', () => {
    assert.equal(calculateScore(0), 1000);
    assert.equal(calculateScore(24.9), 1000);
    assert.equal(calculateScore(25), 950);
    assert.equal(calculateScore(49.9), 950);
    assert.equal(calculateScore(50), 900);
    assert.equal(calculateScore(99.9), 900);
    assert.equal(calculateScore(100), 800);
    assert.equal(calculateScore(199.9), 800);
    assert.equal(calculateScore(200), 600);
    assert.equal(calculateScore(499.9), 600);
    assert.equal(calculateScore(500), 400);
    assert.equal(calculateScore(999.9), 400);
    assert.equal(calculateScore(1000), 200);
    assert.equal(calculateScore(1999.9), 200);
    assert.equal(calculateScore(2000), 100);
    assert.equal(calculateScore(4999.9), 100);
    assert.equal(calculateScore(5000), 50);
    assert.equal(calculateScore(50_000), 50);
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

  test('the pool itself has no duplicate coordinates', () => {
    const coordinates = questionPool.map((q) => `${q.lat},${q.lng}`);
    const duplicates = coordinates.filter((c, i) => coordinates.indexOf(c) !== i);
    assert.deepEqual(duplicates, [], 'the question pool must not repeat a location');
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

describe('practice questions', () => {
  test('are a stable set that does not rotate daily', () => {
    assert.equal(PRACTICE_QUESTIONS.length, 10);
    assert.equal(PRACTICE_QUESTIONS[0].id, questionPool[0].id);
  });
});

describe('share text', () => {
  test('contains the score, the maximum and the percentage', () => {
    const text = generateShareText(8000, 10_000);
    assert.match(text, /8000\/10000/);
    assert.match(text, /80%/);
  });

  test('does not divide by zero', () => {
    const text = generateShareText(0, 0);
    assert.match(text, /0%/);
  });

  test('uses the daily maximum by default', () => {
    const text = generateShareText(10_000);
    assert.match(text, /10000/);
    assert.match(text, /100%/);
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


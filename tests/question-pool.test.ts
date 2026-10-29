/**
 * The question pool.
 *
 * The pool is the whole content of the game, so the rules about it are
 * checked here rather than by playing a year of rounds.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { questionPool } from '../src/lib/question-pool.ts';

describe('the question pool', () => {
  test('it is big enough that a round does not repeat itself', () => {
    // With ten questions a round, this many questions means the same round
    // does not come round for three weeks.
    assert.ok(
      questionPool.length >= 400,
      `the pool has ${questionPool.length} questions, it should have at least 400`,
    );
  });

  test('there is enough American content, because the American round is the main one', () => {
    const american = questionPool.filter((q) => q.country === 'United States');
    assert.ok(
      american.length >= 200,
      `there are ${american.length} American questions, there should be at least 200`,
    );
  });

  test('every question has an id of its own', () => {
    const seen = new Set<string>();
    for (const question of questionPool) {
      assert.ok(!seen.has(question.id), `the id ${question.id} is used twice`);
      seen.add(question.id);
    }
  });

  test('no place is asked about twice', () => {
    const seen = new Map<string, string>();
    for (const question of questionPool) {
      const venue = (question.venue ?? '').trim().toLowerCase();
      if (!venue) continue;
      assert.ok(
        !seen.has(venue),
        `${question.venue} is asked about twice, by ${question.id} and ${seen.get(venue)}`,
      );
      seen.set(venue, question.id);
    }
  });

  test('no two places sit on the very same point', () => {
    const seen = new Map<string, string>();
    for (const question of questionPool) {
      const point = `${question.lat},${question.lng}`;
      assert.ok(
        !seen.has(point),
        `${question.venue} and ${seen.get(point)} are on the same point`,
      );
      seen.set(point, question.venue);
    }
  });

  test('every question is complete', () => {
    for (const question of questionPool) {
      assert.ok(question.text.length > 15, `${question.id} has no proper question`);
      assert.ok(question.hint, `${question.id} has no hint`);
      assert.ok(question.venue, `${question.id} has no venue`);
      assert.equal(question.facts.length, 4, `${question.id} needs four facts`);
      assert.ok(
        Number.isFinite(question.lat) && Number.isFinite(question.lng),
        `${question.id} has no coordinates`,
      );
    }
  });

  test('the coordinates are on the land', () => {
    for (const question of questionPool) {
      assert.ok(
        question.lat > -60 && question.lat < 75,
        `${question.id} is not at a sensible latitude`,
      );
      assert.ok(
        question.lng > -180 && question.lng < 180,
        `${question.id} is not at a sensible longitude`,
      );
    }
  });
});

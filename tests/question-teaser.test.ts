/**
 * The teaser under a question.
 *
 * The player is about to guess a place. A teaser may be interesting, but it
 * must never contain the place or the town that the hint names.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { questionPool } from '../src/lib/question-pool.ts';
import { questionSpoilerWords, questionTeaser } from '../src/lib/question-teaser.ts';

const normalise = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

describe('the question teaser', () => {
  test('every question has a non-empty teaser', () => {
    for (const question of questionPool) {
      assert.ok(
        questionTeaser(question).length > 5,
        `${question.id} has no teaser`,
      );
    }
  });

  test('a teaser never contains a spoiler word', () => {
    for (const question of questionPool) {
      const teaserWords = new Set(normalise(questionTeaser(question)).split(' '));
      for (const word of questionSpoilerWords(question)) {
        assert.ok(
          !teaserWords.has(word),
          `${question.id} teaser gives away “${word}”`,
        );
      }
    }
  });

  test('the Honda Center does not mention Anaheim before the answer', () => {
    const honda = questionPool.find((question) => question.id === 'us-venue-091');
    assert.ok(honda);
    assert.doesNotMatch(questionTeaser(honda), /anaheim/i);
  });
});

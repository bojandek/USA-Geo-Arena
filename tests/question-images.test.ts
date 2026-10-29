/**
 * The pictures in the question pool.
 *
 * A photograph is shown only after the answer is known, but it still has to
 * be traceable: the credit is part of the licence, not a decoration. These
 * checks catch a generated file that has lost its source or its author.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { questionPool } from '../src/lib/question-pool.ts';
import { questionImages } from '../src/lib/question-images.ts';

describe('the question pictures', () => {
  test('there are enough pictures to make the reveal worthwhile', () => {
    assert.ok(
      Object.keys(questionImages).length >= 250,
      `only ${Object.keys(questionImages).length} questions have a picture`,
    );
  });

  test('every picture belongs to a question in the pool', () => {
    const ids = new Set(questionPool.map((question) => question.id));
    for (const id of Object.keys(questionImages)) {
      assert.ok(ids.has(id), `${id} has a picture but is not in the pool`);
    }
  });

  test('every Commons picture can be traced back to its source', () => {
    for (const [id, image] of Object.entries(questionImages)) {
      if (image.illustrative) continue;
      assert.match(
        image.url,
        /^https:\/\/(thumb|upload)\.wikimedia\.org\//,
        `${id} is not served by Wikimedia`,
      );
      assert.match(
        image.creditUrl ?? '',
        /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/,
        `${id} has no Commons file page`,
      );
      assert.ok(image.alt.trim().length > 0, `${id} has no alt text`);
      assert.match(
        image.credit,
        /Wikimedia Commons/,
        `${id} does not credit Wikimedia Commons`,
      );
    }
  });

  test('illustrative stock photos are labelled and credited to Pexels', () => {
    for (const [id, image] of Object.entries(questionImages)) {
      if (!image.illustrative) continue;
      assert.match(
        image.url,
        /^https:\/\/images\.pexels\.com\//,
        `${id} is marked illustrative but is not a Pexels image`,
      );
      assert.match(
        image.creditUrl ?? '',
        /^https:\/\/www\.pexels\.com\//,
        `${id} has no Pexels photo page`,
      );
      assert.match(image.credit, /Pexels/, `${id} does not credit Pexels`);
    }
  });

  test('the pool only shows complete pictures', () => {
    for (const question of questionPool) {
      if (!question.image) continue;
      assert.ok(question.image.url.startsWith('https://'), `${question.id} has no URL`);
      assert.ok(question.image.alt, `${question.id} has no alt text`);
      assert.ok(question.image.credit, `${question.id} has no credit`);
      assert.ok(question.image.creditUrl, `${question.id} has no credit link`);
    }
  });
});

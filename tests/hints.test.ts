/**
 * Unit tests for the hints and what they cost.
 *
 * A hint that is free and instant is not a hint, it is part of the question.
 * These tests check that the ladder is ordered by usefulness, that the price
 * rises with it, and that the free one has to be waited for.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildHintTiers,
  nextHint,
  secondsUntilFreeHint,
  FREE_HINT_DELAY_SECONDS,
} from '../src/lib/hints.ts';
import type { Question } from '../src/lib/question-types.ts';

const FULL_QUESTION: Question = {
  id: 'q1',
  text: 'Where is Gainbridge Fieldhouse?',
  lat: 39.7654,
  lng: -86.1664,
  category: 'stadium',
  hint: 'Indianapolis, Indiana',
  country: 'United States',
  venue: 'Gainbridge Fieldhouse',
  facts: ['A fact'],
};

describe('buildHintTiers', () => {
  test('the first hint is free', () => {
    const tiers = buildHintTiers(FULL_QUESTION);
    assert.equal(tiers[0].cost, 0);
    assert.equal(tiers[0].text, 'Indianapolis, Indiana');
  });

  test('the hints get more expensive as they narrow it down', () => {
    const tiers = buildHintTiers(FULL_QUESTION);
    assert.equal(tiers.length, 3);
    for (let i = 1; i < tiers.length; i++) {
      assert.ok(
        tiers[i].cost > tiers[i - 1].cost,
        `tier ${i} must cost more than tier ${i - 1}`,
      );
    }
  });

  test('a question with no venue simply has one tier fewer', () => {
    const tiers = buildHintTiers({ ...FULL_QUESTION, venue: undefined });
    assert.equal(tiers.length, 2);
    assert.equal(tiers.some((tier) => tier.label === 'The venue is called'), false);
  });

  test('a question with no hint at all still has something to offer', () => {
    const tiers = buildHintTiers({ ...FULL_QUESTION, hint: undefined });
    assert.equal(tiers.length, 2);
    assert.equal(tiers[0].label, 'Country');
  });

  test('a question with nothing to give has no tiers', () => {
    const tiers = buildHintTiers({
      ...FULL_QUESTION,
      hint: undefined,
      country: '',
      venue: undefined,
    });
    assert.equal(tiers.length, 0);
  });
});

describe('nextHint', () => {
  test('hands out the hints in order', () => {
    const tiers = buildHintTiers(FULL_QUESTION);
    assert.equal(nextHint(tiers, 0)?.label, 'Clue');
    assert.equal(nextHint(tiers, 1)?.label, 'Country');
    assert.equal(nextHint(tiers, 2)?.label, 'The venue is called');
  });

  test('there is nothing left when they have all been taken', () => {
    const tiers = buildHintTiers(FULL_QUESTION);
    assert.equal(nextHint(tiers, 3), null);
    assert.equal(nextHint(tiers, 99), null);
  });

  test('a broken list gives nothing rather than throwing', () => {
    assert.equal(nextHint(undefined as never, 0), null);
  });
});

describe('secondsUntilFreeHint', () => {
  test('the free hint waits ten seconds', () => {
    assert.equal(FREE_HINT_DELAY_SECONDS, 10);
    assert.equal(secondsUntilFreeHint(0, 9), 1);
    assert.equal(secondsUntilFreeHint(0, 10), 0);
  });

  test('counts down to the free hint', () => {
    assert.equal(secondsUntilFreeHint(0, 0), FREE_HINT_DELAY_SECONDS);
    assert.equal(secondsUntilFreeHint(0, 5), FREE_HINT_DELAY_SECONDS - 5);
    assert.equal(secondsUntilFreeHint(0, 30), 0);
  });

  test('never goes below zero', () => {
    assert.equal(secondsUntilFreeHint(0, 999), 0);
  });

  test('there is no wait once the free hint has been taken', () => {
    assert.equal(secondsUntilFreeHint(1, 0), 0);
  });

  test('pro users get the free hint instantly', () => {
    assert.equal(secondsUntilFreeHint(0, 0, true), 0);
    assert.equal(secondsUntilFreeHint(0, 5, true), 0);
    assert.equal(secondsUntilFreeHint(0, 29, true), 0);
  });
});
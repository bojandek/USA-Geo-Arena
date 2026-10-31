/**
 * The daily question bank.
 *
 * The bank is a year of rounds that nobody plays before its day, so a
 * mistake in it would only be found by the players. Everything that can be
 * checked without the network is checked here; the pins are checked against
 * Wikipedia by scripts/daily/check-coords.ts.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { BANK_REGIONS, giveaways, loadBank, problems, toQuestion, type BankQuestion } from '../scripts/daily/bank.ts';
import { questionPool } from '../src/lib/question-pool.ts';

const bank = BANK_REGIONS.flatMap((region) => loadBank(region).map((question) => ({ region, question })));

describe('the daily bank', () => {
  test('every question follows the rules', () => {
    const wrong = bank
      .map(({ region, question }) => ({ id: question.id, issues: problems(question, region) }))
      .filter((entry) => entry.issues.length > 0)
      .map((entry) => `${entry.id}: ${entry.issues.join('; ')}`);
    assert.deepEqual(wrong, []);
  });

  test('no id is used twice, in the bank or in the pool', () => {
    const seen = new Set(questionPool.map((question) => question.id));
    const repeated = bank.map(({ question }) => question.id).filter((id) => {
      if (seen.has(id)) return true;
      seen.add(id);
      return false;
    });
    assert.deepEqual(repeated, []);
  });

  test('no place is asked about twice within a round', () => {
    for (const region of BANK_REGIONS) {
      const venues = new Map<string, string>();
      const repeated: string[] = [];
      for (const question of loadBank(region)) {
        const key = question.venue.toLowerCase();
        if (venues.has(key)) repeated.push(`${venues.get(key)} and ${question.id}: ${question.venue}`);
        else venues.set(key, question.id);
      }
      assert.deepEqual(repeated, [], `${region} repeats a venue`);
    }
  });
});

describe('the name check', () => {
  const base: BankQuestion = {
    id: 'usa-test-001',
    text: 'Where do the Packers play their home games?',
    lat: 44.5013,
    lng: -88.0622,
    category: 'stadium',
    venue: 'Lambeau Field',
    city: 'Green Bay',
    state: 'Wisconsin',
    country: 'United States',
    hint: 'The oldest stadium in the league.',
    facts: ['a', 'b', 'c'],
    wikipedia: 'Lambeau Field',
  };

  test('a question that names nothing passes', () => {
    assert.deepEqual(problems(base, 'usa'), []);
  });

  test('the town, the state and other states are all caught', () => {
    assert.deepEqual(giveaways({ ...base, text: 'Where is Lambeau Field in Green Bay?' }), ['Green Bay']);
    assert.deepEqual(giveaways({ ...base, hint: 'Up in Wisconsin.' }), ['Wisconsin']);
    assert.deepEqual(giveaways({ ...base, hint: 'North of Illinois.' }), ['Illinois']);
  });

  test('a country is caught, a person who shares its name is not', () => {
    assert.deepEqual(giveaways({ ...base, text: 'Where did Peru play the 1970 match?' }), ['Peru']);
    assert.deepEqual(giveaways({ ...base, text: 'Where did Michael Jordan play college ball?' }), []);
  });

  test('a name inside a longer word is not a name', () => {
    assert.deepEqual(giveaways({ ...base, text: 'Where do the Cheeseheads cheer the Packers?' }), []);
  });

  test('clicking the town on the map counts as the answer', () => {
    assert.deepEqual(toQuestion(base).aliases, ['Green Bay']);
  });
});

/**
 * Unit tests for the links that go with a question.
 *
 * A player who has just been told the answer usually wants to know more
 * about the place, and a player who has found a mistake needs to be able to
 * say so. Both links have to be safe: one must never land on the wrong
 * article, and the other must always name the question.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { reportUrl, wikipediaUrl } from '../src/lib/question-links.ts';
import type { Question } from '../src/lib/question-types.ts';

const QUESTION: Question = {
  id: 'stadium-gainbridge',
  text: 'Where is Gainbridge Fieldhouse, home of the Indiana Pacers?',
  lat: 39.7654,
  lng: -86.1664,
  category: 'stadium',
  hint: 'Indianapolis, Indiana',
  country: 'United States',
  venue: 'Gainbridge Fieldhouse',
  facts: ['A fact'],
};

describe('wikipediaUrl', () => {
  test('searches for the venue when there is one', () => {
    const url = wikipediaUrl(QUESTION);
    assert.ok(url);
    assert.match(url, /wikipedia\.org/);
    assert.match(url, /Gainbridge/);
  });

  test('falls back to the hint when there is no venue', () => {
    const url = wikipediaUrl({ ...QUESTION, venue: undefined });
    assert.ok(url);
    assert.match(url, /Indianapolis/);
  });

  test('a question with nothing to look up has no link', () => {
    const url = wikipediaUrl({ ...QUESTION, venue: undefined, hint: undefined });
    assert.equal(url, null);
  });

  test('the search is escaped, so a name cannot break the address', () => {
    const url = wikipediaUrl({ ...QUESTION, venue: 'A & B? C' });
    assert.ok(url);
    assert.ok(!url.includes(' '), 'the address must not contain spaces');
  });
});

describe('reportUrl', () => {
  test('names the question in the message', () => {
    const url = reportUrl(QUESTION);
    assert.match(url, /^mailto:/);
    assert.match(url, /stadium-gainbridge/);
  });

  test('the coordinates are in there, so a mistake can be checked', () => {
    const url = reportUrl(QUESTION);
    assert.match(url, /39\.7654/);
  });

  test('the body is escaped, so a question cannot break the address', () => {
    const url = reportUrl({ ...QUESTION, text: 'Where is A & B?' });
    assert.ok(!url.includes(' & '), 'the ampersand must be encoded');
  });
});
/**
 * Unit tests for matching a place name on the map to the answer.
 *
 * This is what lets a player answer a question about Alaska or Hawaii by
 * clicking on the name of the town instead of dropping a pin on the exact
 * spot, and it is what stops the name of a whole state from counting as the
 * answer to a question about a town inside it.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  answerNamesFor,
  matchesAnswerName,
  NAMED_ANSWER_RADIUS_KM,
  normalizePlaceName,
  placeNameFromFeature,
  placesNamedIn,
} from '../src/lib/place-names.ts';
import { usaOutlyingQuestions } from '../src/lib/questions/usa-outlying.ts';
import type { Question } from '../src/lib/question-types.ts';

const question = (over: Partial<Question>): Question => ({
  id: 'q',
  text: 'Where is the thing?',
  lat: 0,
  lng: 0,
  category: 'stadium',
  country: 'United States',
  facts: [],
  ...over,
});

/** The question about a sports centre in Anchorage. */
const anchorage = usaOutlyingQuestions.find(
  (q) => q.venue === 'Ector Sports Center',
);
const fairbanks = usaOutlyingQuestions.find((q) => q.venue === 'Fairbanks');
const nome = usaOutlyingQuestions.find((q) => q.id === 'us-out-016');

describe('normalising a place name', () => {
  test('the accents go, so that Nome and Nomé are the same place', () => {
    assert.equal(normalizePlaceName('Nomé'), 'nome');
    assert.equal(normalizePlaceName('Saint-Étienne'), 'saint etienne');
    assert.equal(normalizePlaceName('München'), 'munchen');
  });

  test('the punctuation goes, so that Kailua-Kona and Kailua Kona agree', () => {
    assert.equal(normalizePlaceName('Kailua-Kona'), 'kailua kona');
    assert.equal(normalizePlaceName('St. Jakob-Park'), 'st jakob park');
    assert.equal(normalizePlaceName("O'Brien"), 'obrien');
  });

  test('the case goes, so that the map and the question can differ', () => {
    assert.equal(normalizePlaceName('Anchorage'), 'anchorage');
    assert.equal(normalizePlaceName('ANCHORAGE'), 'anchorage');
  });

  test('nothing at all is still nothing', () => {
    assert.equal(normalizePlaceName(''), '');
    assert.equal(normalizePlaceName('   '), '');
  });
});

describe('the place named in the wording of a question', () => {
  test('the town after "in" is the place', () => {
    assert.deepEqual(placesNamedIn('Where is the Ector Sports Center in Anchorage?'), [
      'Anchorage',
    ]);
  });

  test('the island after "on" is the place', () => {
    assert.deepEqual(placesNamedIn('Where is Lahaina on Maui?'), ['Maui']);
  });

  test('a name with an accent in it is still a name', () => {
    assert.deepEqual(
      placesNamedIn('Where is the Stade Geoffroy-Guichard in Saint-Étienne?'),
      ['Saint-Étienne'],
    );
  });

  test('a question with no place in it names none', () => {
    assert.deepEqual(placesNamedIn('Where is Camp Nou?'), []);
  });

  test('a lower case word is not a place', () => {
    assert.deepEqual(placesNamedIn('Where is the stadium in the middle of town?'), []);
  });
});

describe('the names that count as the answer', () => {
  test('the venue, the hint and the wording are all used', () => {
    const names = answerNamesFor(
      question({
        text: 'Where is the Ector Sports Center in Anchorage?',
        venue: 'Ector Sports Center',
        hint: 'Anchorage, Alaska',
      }),
    );
    assert.ok(names.includes('ector sports center'));
    assert.ok(names.includes('anchorage'));
  });

  test('only the first part of the hint is the place', () => {
    const names = answerNamesFor(
      question({ venue: 'Aloha Stadium', hint: 'Honolulu, Hawaii' }),
    );
    assert.ok(names.includes('honolulu'));
    assert.ok(!names.includes('hawaii'), 'the state is not the answer');
  });

  test('the country is never the answer', () => {
    const names = answerNamesFor(
      question({ venue: 'Stadio Olimpico', country: 'Italy', hint: 'Rome' }),
    );
    assert.ok(!names.includes('italy'));
  });

  test('an alias counts as well', () => {
    const names = answerNamesFor(
      question({ venue: 'Aloha Stadium', aliases: ['University of Hawaii'] }),
    );
    assert.ok(names.includes('university of hawaii'));
  });
});

describe('a place name on the map is the answer', () => {
  test('the name of the town in Alaska is the answer', () => {
    assert.ok(anchorage, 'the Alaska question is in the pool');
    // The label of Anchorage, which is a few kilometres from the sports
    // centre in the city.
    const matched = matchesAnswerName('Anchorage', anchorage, {
      lat: 61.2181,
      lng: -149.9003,
    });
    assert.equal(matched, true);
  });

  test('the name of the town in Alaska is the answer without the accents', () => {
    assert.ok(nome, 'the Nome question is in the pool');
    assert.equal(
      matchesAnswerName('Nome', nome, { lat: 64.5011, lng: -165.4064 }),
      true,
    );
  });

  test('the name of the state is not the answer', () => {
    assert.ok(anchorage, 'the Alaska question is in the pool');
    // The label of Alaska is written in the middle of the state, hundreds of
    // kilometres away from the sports centre.
    const matched = matchesAnswerName('Alaska', anchorage, {
      lat: 64.2,
      lng: -149.5,
    });
    assert.equal(matched, false);
  });

  test('the name of the state is not the answer even for a town in the middle of it', () => {
    assert.ok(fairbanks, 'the Fairbanks question is in the pool');
    // The label of Alaska sits about a hundred and thirty kilometres from
    // Fairbanks, which is further than a town label is allowed to be.
    const matched = matchesAnswerName('Alaska', fairbanks, {
      lat: 64.2,
      lng: -149.5,
    });
    assert.equal(matched, false);
  });

  test('the name of another town is not the answer', () => {
    assert.ok(anchorage, 'the Alaska question is in the pool');
    assert.equal(
      matchesAnswerName('Fairbanks', anchorage, { lat: 64.8378, lng: -147.7164 }),
      false,
    );
  });

  test('a name with the wrong case still counts', () => {
    assert.ok(anchorage, 'the Alaska question is in the pool');
    assert.equal(
      matchesAnswerName('anchorage', anchorage, { lat: 61.2181, lng: -149.9003 }),
      true,
    );
  });

  test('a name that is too far away is not the answer', () => {
    const far = question({
      text: 'Where is the Ector Sports Center in Anchorage?',
      venue: 'Ector Sports Center',
      hint: 'Anchorage, Alaska',
      lat: 61.124,
      lng: -149.805,
    });
    // A label further away than a town label ever is.
    assert.equal(
      matchesAnswerName('Anchorage', far, { lat: 61.124 + 2, lng: -149.805 }),
      false,
    );
    assert.ok(NAMED_ANSWER_RADIUS_KM < 250);
  });

  test('without a place to measure from, the name alone is enough', () => {
    assert.ok(anchorage, 'the Alaska question is in the pool');
    assert.equal(matchesAnswerName('Anchorage', anchorage), true);
  });
});

describe('reading a name out of a feature', () => {
  test('the name is taken from the feature', () => {
    assert.equal(
      placeNameFromFeature({ properties: { name: 'Anchorage' } }),
      'Anchorage',
    );
  });

  test('the English name is used when there is no plain one', () => {
    assert.equal(
      placeNameFromFeature({ properties: { name_en: 'Anchorage' } }),
      'Anchorage',
    );
  });

  test('a feature with no name at all gives nothing', () => {
    assert.equal(placeNameFromFeature({ properties: {} }), null);
    assert.equal(placeNameFromFeature({ properties: { name: '   ' } }), null);
    assert.equal(placeNameFromFeature({}), null);
  });
});

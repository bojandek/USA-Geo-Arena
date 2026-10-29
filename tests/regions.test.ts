/**
 * Unit tests for the region system - the world round and the American round.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_REGION,
  boundsForQuestion,
  frameForOutlyingAnswer,
  getRegion,
  isOutsideContinentalUsa,
  isRegionId,
  outlyingStateFor,
  outlyingStateForQuestion,
  questionsForRegion,
  regionPath,
  regionSeed,
  REGIONS,
} from '../src/lib/regions.ts';
import {
  getDailyQuestions,
  questionPool,
  venueKey,
} from '../src/lib/game-data.ts';

const USA = 'usa';

describe('regions', () => {
  test('every region has an id, a label and a view', () => {
    for (const region of REGIONS) {
      assert.ok(region.id, 'a region needs an id');
      assert.ok(region.label, 'a region needs a label');
      assert.ok(region.emoji, 'a region needs an emoji');
      assert.equal(typeof region.view.zoom, 'number');
      assert.equal(region.view.center.length, 2);
    }
  });

  test('isRegionId only accepts the known ids', () => {
    assert.equal(isRegionId('world'), true);
    assert.equal(isRegionId('usa'), true);
    assert.equal(isRegionId('atlantis'), false);
    assert.equal(isRegionId(''), false);
    assert.equal(isRegionId(null), false);
    assert.equal(isRegionId(undefined), false);
  });

  test('an unknown region falls back to the default round', () => {
    assert.equal(getRegion('usa').id, USA);
    assert.equal(getRegion('nonsense').id, DEFAULT_REGION);
    assert.equal(getRegion(null).id, DEFAULT_REGION);
  });

  test('the American round is the one the site opens with', () => {
    // The whole point of the change: the map opens on the United States and
    // the questions are about American sport.
    assert.equal(DEFAULT_REGION, USA);
    assert.equal(getRegion(DEFAULT_REGION).id, USA);
  });

  test('the world region has no country list and no bounds', () => {
    const world = getRegion('world');
    assert.equal(world.countries, null);
    assert.equal(world.view.bounds, null);
  });

  test('the world round has a frame that covers every question', () => {
    // On screen the world is a globe, which is sized by `globeFrame` rather
    // than by this box. The box still has to describe the world the round
    // covers: it is the frame a flat map would use, and every question in the
    // pool has to be inside it.
    const world = getRegion('world');
    const fit = world.view.fit;
    assert.ok(fit, 'the world round needs a frame');

    const [west, south] = fit[0];
    const [east, north] = fit[1];
    assert.ok(west <= -170 && east >= 170, 'the frame has to reach both oceans');
    assert.ok(south <= -40, 'the frame reaches the southern hemisphere');
    assert.ok(north >= 70, 'the frame reaches the northern hemisphere');

    // Every question in the pool fits inside the frame. A place outside it
    // would sit off the screen on a round that is meant to show the world.
    for (const question of questionPool) {
      assert.ok(
        question.lng >= west && question.lng <= east,
        `${question.id} is outside the world frame`,
      );
      assert.ok(
        question.lat >= south && question.lat <= north,
        `${question.id} is outside the world frame`,
      );
    }
  });

  test('the world round is a globe and the American round is a map', () => {
    // A sphere showing one country is mostly empty space, and a flat map of
    // the whole planet is a strip that wraps round on itself.
    assert.equal(getRegion('world').view.projection, 'globe');
    assert.equal(getRegion(USA).view.projection, 'mercator');
  });

  test('every round has an address of its own', () => {
    // The round is part of the path, never a query string: /daily?region=world
    // left the menu highlighting the American round over a world question.
    assert.equal(regionPath('usa'), '/daily');
    assert.equal(regionPath('world'), '/world');

    for (const region of REGIONS) {
      const path = regionPath(region.id);
      assert.ok(!path.includes('?'), 'a round is never hidden in a query string');
      assert.ok(path.startsWith('/'), 'a path starts at the root');
    }
  });

  test('the round at an address is the round that address names', () => {
    for (const region of REGIONS) {
      if (region.id === DEFAULT_REGION) continue;
      const named = regionPath(region.id).slice(1);
      assert.equal(named, region.id, 'the address is named after the round');
      assert.equal(isRegionId(named), true);
    }
  });

  test('the American round is locked to the country', () => {
    const usa = getRegion(USA);
    assert.deepEqual(usa.countries, ['United States']);
    assert.ok(usa.view.bounds, 'the map cannot be panned out of the country');
  });

  test('the world region keeps every question that is not American', () => {
    // The American questions have their own round. A world round that is
    // half American is neither a world round nor an American one.
    const world = questionsForRegion(questionPool, 'world');
    assert.ok(world.length > 0);
    assert.ok(world.length < questionPool.length, 'the American questions are left out');
    for (const question of world) {
      assert.notEqual(question.country, 'United States');
    }
  });

  test('the two regions do not share a single question', () => {
    const world = questionsForRegion(questionPool, 'world');
    const usa = questionsForRegion(questionPool, USA);
    const worldIds = new Set(world.map((question) => question.id));
    for (const question of usa) {
      assert.ok(!worldIds.has(question.id), `"${question.id}" is in both regions`);
    }
  });

  test('the American region keeps only American questions', () => {
    const usa = questionsForRegion(questionPool, USA);
    assert.ok(usa.length > 0);
    for (const question of usa) {
      assert.equal(question.country, 'United States');
    }
  });

  test('every region has its own seed', () => {
    assert.notEqual(regionSeed('world'), regionSeed('usa'));
  });
});

describe('the American question pool', () => {
  const usa = questionsForRegion(questionPool, USA);

  test('is big enough to keep a round interesting', () => {
    // Ten questions a day. A hundred and sixty means the same set does not
    // come round for weeks.
    assert.ok(usa.length >= 150, `expected at least 150 American questions, got ${usa.length}`);
  });

  test('covers every kind of American sport', () => {
    const categories = new Set(usa.map((question) => question.category));
    assert.ok(categories.has('stadium'));
    assert.ok(categories.has('event'));
    assert.ok(categories.has('athlete'));
  });

  test('every question names its venue', () => {
    for (const question of usa) {
      assert.ok(question.venue, `question ${question.id} has no venue`);
    }
  });

  test('every question is complete', () => {
    for (const question of usa) {
      assert.ok(question.text.length > 10, `question ${question.id} has no text`);
      assert.ok(question.hint && question.hint.length > 2, `question ${question.id} has no hint`);
      assert.ok(question.facts.length >= 3, `question ${question.id} has too few facts`);
      assert.ok(Number.isFinite(question.lat) && Number.isFinite(question.lng));
    }
  });

  test('every question is inside the area the map is locked to', () => {
    // The American round locks the map to the country, so a question outside
    // that box would be impossible to answer.
    const bounds = getRegion(USA).view.bounds;
    assert.ok(bounds, 'the American region needs bounds');
    const [[west, south], [east, north]] = bounds;
    for (const question of usa) {
      assert.ok(
        question.lng >= west && question.lng <= east,
        `question ${question.id} (${question.lng}) is west of the map bounds`,
      );
      assert.ok(
        question.lat >= south && question.lat <= north,
        `question ${question.id} (${question.lat}) is outside the map bounds`,
      );
    }
  });

  test('the ids are unique across the whole pool', () => {
    const ids = questionPool.map((question) => question.id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepEqual(duplicates, [], 'question ids must be unique');
  });
});

describe('the daily set per region', () => {
  test('the American round asks ten American questions', () => {
    const questions = getDailyQuestions(new Date(2025, 5, 15), USA);
    assert.equal(questions.length, 10);
    for (const question of questions) {
      assert.equal(question.country, 'United States');
    }
  });

  test('the American round is the same for everyone on the same day', () => {
    const first = getDailyQuestions(new Date(2025, 5, 15), USA);
    const second = getDailyQuestions(new Date(2025, 5, 15), USA);
    assert.deepEqual(first.map((q) => q.id), second.map((q) => q.id));
  });

  test('the two regions get different questions on the same day', () => {
    const world = getDailyQuestions(new Date(2025, 5, 15), 'world');
    const usa = getDailyQuestions(new Date(2025, 5, 15), USA);
    const worldIds = new Set(world.map((q) => q.id));
    const shared = usa.filter((q) => worldIds.has(q.id));
    // The American questions have their own round, so the two rounds on the
    // same day never meet.
    for (const question of usa) {
      assert.equal(question.country, 'United States');
    }
    for (const question of world) {
      assert.notEqual(question.country, 'United States');
    }
    assert.ok(world.length === 10 && usa.length === 10);
    assert.equal(shared.length, 0);
  });

  test('a round never asks about the same place twice', () => {
    for (let day = 1; day <= 120; day++) {
      const questions = getDailyQuestions(new Date(2025, 5, day), USA);
      const keys = questions.map(venueKey);
      assert.equal(
        new Set(keys).size,
        keys.length,
        `duplicate venue in the American round on 2025-06-${day}`,
      );
    }
  });

  test('consecutive days never repeat the whole set', () => {
    for (let day = 1; day <= 60; day++) {
      const first = getDailyQuestions(new Date(2025, 5, day), USA).map((q) => q.id);
      const second = getDailyQuestions(new Date(2025, 5, day + 1), USA).map((q) => q.id);
      assert.notDeepEqual(first, second, `the same set came up on day ${day}`);
    }
  });
});

describe('the outlying states', () => {
  test('a point on the mainland is not an outlying state', () => {
    assert.equal(isOutsideContinentalUsa(41.9484, -87.6553), false);
    assert.equal(outlyingStateFor(41.9484, -87.6553), null);
    assert.equal(frameForOutlyingAnswer(41.9484, -87.6553), null);
  });

  test('Anchorage is in Alaska, and Honolulu is in Hawaii', () => {
    assert.equal(outlyingStateFor(61.2181, -149.9003), 'Alaska');
    assert.equal(outlyingStateFor(21.3069, -157.8583), 'Hawaii');
  });

  test('the map is framed on the answer when it is not on the mainland', () => {
    const alaska = frameForOutlyingAnswer(61.2181, -149.9003);
    assert.ok(alaska);
    const [west, south] = alaska[0];
    const [east, north] = alaska[1];
    assert.ok(west < -149.9003 && east > -149.9003);
    assert.ok(south < 61.2181 && north > 61.2181);
  });

  test('the Alaska frame is wide and the Hawaii frame is tight', () => {
    const alaska = frameForOutlyingAnswer(61.2181, -149.9003);
    const hawaii = frameForOutlyingAnswer(21.3069, -157.8583);
    assert.ok(alaska && hawaii);
    const width = (frame: [[number, number], [number, number]]) =>
      frame[1][0] - frame[0][0];
    assert.ok(width(alaska) > width(hawaii));
  });

  test('the mainland questions are locked to the country', () => {
    const bounds = boundsForQuestion(
      {
        id: 'x',
        text: 'Where is Fenway Park?',
        lat: 42.3467,
        lng: -71.0972,
        category: 'stadium',
        hint: 'Boston',
        country: 'United States',
        facts: [],
      },
      'usa',
    );
    assert.ok(bounds);
    const [west, south] = bounds[0];
    const [east, north] = bounds[1];
    assert.ok(-71.09 > west && -71.09 < east);
    assert.ok(42.34 > south && 42.34 < north);
    // A ground over the border with Canada, and one in Florida, are reachable.
    assert.ok(-60 < east);
    assert.ok(25 > south);
  });

  test('a question in Alaska or Hawaii is not locked to the mainland', () => {
    // A limit that holds the answer would also stop the player moving around
    // the place they are looking for, so those questions have none.
    const alaska = questionPool.find(
      (question) => outlyingStateForQuestion(question) === 'Alaska',
    );
    const hawaii = questionPool.find(
      (question) => outlyingStateForQuestion(question) === 'Hawaii',
    );
    assert.ok(alaska && hawaii);
    assert.equal(boundsForQuestion(alaska, 'usa'), null);
    assert.equal(boundsForQuestion(hawaii, 'usa'), null);
  });

  test('the world round is never locked to anything', () => {
    assert.equal(boundsForQuestion(null, 'world'), null);
  });

  test('every outlying question can be reached on the map', () => {
    const outlying = questionPool.filter(
      (question) => outlyingStateForQuestion(question) !== null,
    );
    assert.ok(outlying.length >= 10, 'there should be questions about Alaska and Hawaii');

    for (const question of outlying) {
      // With no limit, the answer only has to be inside the area the map is
      // framed on.
      const frame = frameForOutlyingAnswer(question.lat, question.lng);
      assert.ok(frame, `${question.id} is not framed`);
      const [west, south] = frame[0];
      const [east, north] = frame[1];
      assert.ok(
        question.lng > west && question.lng < east,
        `${question.id} is not on the map`,
      );
      assert.ok(
        question.lat > south && question.lat < north,
        `${question.id} is not on the map`,
      );
    }
  });

  test('a question about somewhere else is never an outlying state', () => {
    // Madrid is outside the continental United States, but it is not in it.
    assert.equal(outlyingStateFor(40.4168, -3.7038), null);
    assert.equal(
      outlyingStateForQuestion({
        id: 'x',
        text: 'Where is the Bernabeu?',
        lat: 40.4168,
        lng: -3.7038,
        category: 'stadium',
        hint: 'Madrid',
        country: 'Spain',
        facts: [],
      }),
      null,
    );
  });
});
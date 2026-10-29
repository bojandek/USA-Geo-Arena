/**
 * Unit tests for telling the player which way they missed it.
 *
 * A distance says the player was wrong. A direction says what to do
 * differently next time, which is the part worth learning from.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  bearingBetween,
  compassDirection,
  describeMiss,
  describeMissWithArrow,
  normalizeDegrees,
  DIRECTION_FEEDBACK_MAX_KM,
  DIRECTION_FEEDBACK_MIN_KM,
} from '../src/lib/geo.ts';

describe('bearingBetween', () => {
  test('a place to the north is due north', () => {
    const bearing = bearingBetween({ lat: 0, lng: 0 }, { lat: 1, lng: 0 });
    assert.ok(Math.abs(bearing - 0) < 0.001, `got ${bearing}`);
  });

  test('a place to the south is due south', () => {
    const bearing = bearingBetween({ lat: 0, lng: 0 }, { lat: -1, lng: 0 });
    assert.ok(Math.abs(bearing - 180) < 0.001, `got ${bearing}`);
  });

  test('a place to the east is due east', () => {
    const bearing = bearingBetween({ lat: 0, lng: 0 }, { lat: 0, lng: 1 });
    assert.ok(Math.abs(bearing - 90) < 0.001, `got ${bearing}`);
  });

  test('a place to the west is due west', () => {
    const bearing = bearingBetween({ lat: 0, lng: 0 }, { lat: 0, lng: -1 });
    assert.ok(Math.abs(bearing - 270) < 0.001, `got ${bearing}`);
  });

  test('the direction is the one the player has to travel', () => {
    // The answer is north-east of the guess, so the player heads north-east.
    const bearing = bearingBetween({ lat: 40, lng: -74 }, { lat: 41, lng: -73 });
    assert.ok(bearing > 20 && bearing < 70, `got ${bearing}`);
  });
});

describe('normalizeDegrees', () => {
  test('wraps a negative angle into the usual range', () => {
    assert.equal(normalizeDegrees(-90), 270);
  });

  test('leaves an angle that is already in range alone', () => {
    assert.equal(normalizeDegrees(90), 90);
  });

  test('a broken number is treated as zero rather than passed on', () => {
    assert.equal(normalizeDegrees(Number.NaN), 0);
  });
});

describe('compassDirection', () => {
  test('picks the nearest of the eight points', () => {
    assert.equal(compassDirection(0).label, 'north');
    assert.equal(compassDirection(45).label, 'north-east');
    assert.equal(compassDirection(90).label, 'east');
    assert.equal(compassDirection(135).label, 'south-east');
    assert.equal(compassDirection(180).label, 'south');
    assert.equal(compassDirection(225).label, 'south-west');
    assert.equal(compassDirection(270).label, 'west');
    assert.equal(compassDirection(315).label, 'north-west');
  });

  test('an angle between two points snaps to the closer one', () => {
    // The eight points are 45 degrees apart, so the halfway mark between
    // north and north-east is 22.5 degrees. 60 is nearer north-east, 80 is
    // nearer east.
    assert.equal(compassDirection(20).label, 'north');
    assert.equal(compassDirection(60).label, 'north-east');
    assert.equal(compassDirection(80).label, 'east');
  });

  test('every point comes with an arrow that points that way', () => {
    for (let bearing = 0; bearing < 360; bearing += 5) {
      const direction = compassDirection(bearing);
      assert.ok(direction.arrow.length > 0, `no arrow for ${bearing}`);
      assert.ok(direction.label.length > 0, `no label for ${bearing}`);
    }
  });
});

describe('describeMiss', () => {
  test('says nothing when the guess was good enough', () => {
    const result = describeMiss({ lat: 40, lng: -74 }, { lat: 40.1, lng: -74.1 }, 10);
    assert.equal(result, null);
  });

  test('says nothing when the guess was in the wrong part of the world', () => {
    const result = describeMiss(
      { lat: 25, lng: -80 },
      { lat: 40, lng: -74 },
      DIRECTION_FEEDBACK_MAX_KM + 1,
    );
    assert.equal(result, null);
  });

  test('says which way the answer lay for a close miss', () => {
    const result = describeMiss({ lat: 40, lng: -74 }, { lat: 41, lng: -74 }, 100);
    assert.ok(result, 'expected a direction');
    assert.match(result, /north/);
  });

  test('the boundary between useful and not useful is exact', () => {
    const atLimit = describeMiss(
      { lat: 40, lng: -74 },
      { lat: 41, lng: -74 },
      DIRECTION_FEEDBACK_MAX_KM,
    );
    const overLimit = describeMiss(
      { lat: 40, lng: -74 },
      { lat: 41, lng: -74 },
      DIRECTION_FEEDBACK_MAX_KM + 0.1,
    );
    assert.ok(atLimit, 'the limit itself should still give a direction');
    assert.equal(overLimit, null);
  });

  test('a broken distance gives nothing rather than a wrong direction', () => {
    const result = describeMiss({ lat: 40, lng: -74 }, { lat: 41, lng: -74 }, Number.NaN);
    assert.equal(result, null);
  });

  test('a miss just over the hit threshold is still worth explaining', () => {
    const result = describeMiss(
      { lat: 40, lng: -74 },
      { lat: 41, lng: -74 },
      DIRECTION_FEEDBACK_MIN_KM + 1,
    );
    assert.ok(result, 'expected a direction');
  });
});

describe('describeMissWithArrow', () => {
  test('carries the arrow that matches the direction', () => {
    const result = describeMissWithArrow({ lat: 40, lng: -74 }, { lat: 41, lng: -74 }, 100);
    assert.ok(result, 'expected a direction');
    assert.equal(result.arrow, '↑');
    assert.match(result.text, /north/);
  });

  test('agrees with the plain description', () => {
    const guess = { lat: 34, lng: -118 };
    const truth = { lat: 30, lng: -100 };
    const plain = describeMiss(guess, truth, 200);
    const withArrow = describeMissWithArrow(guess, truth, 200);
    assert.ok(plain && withArrow);
    assert.ok(plain.includes(withArrow.text.replace(/You needed to head /, '')));
  });
});
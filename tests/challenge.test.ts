/**
 * Unit tests for the "beat my friend" challenge.
 *
 * The whole mechanic lives in the link: the score to beat travels inside the
 * address, so there is no server and no account. These tests check that the
 * link is built correctly, that a mangled one is ignored, and that the
 * comparison is right.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildChallengeUrl,
  challengeHeadline,
  challengeOutcome,
  readChallengeScore,
  MAX_CHALLENGE_SCORE,
} from '../src/lib/challenge.ts';

describe('buildChallengeUrl', () => {
  test('carries the score to beat in the link', () => {
    const url = buildChallengeUrl(812, 'usa', 'https://example.test');
    assert.equal(url, 'https://example.test/daily?beat=812&utm_source=challenge&utm_medium=social');
  });

  test('the world round keeps its own address', () => {
    const url = buildChallengeUrl(500, 'world', 'https://example.test');
    assert.equal(url, 'https://example.test/world?beat=500&utm_source=challenge&utm_medium=social');
  });

  test('a score beyond what a round can be worth is capped', () => {
    const url = buildChallengeUrl(99999, 'usa', 'https://example.test');
    assert.equal(readChallengeScore(new URL(url).search), MAX_CHALLENGE_SCORE);
  });

  test('a broken score becomes zero rather than nonsense', () => {
    const url = buildChallengeUrl(Number.NaN, 'usa', 'https://example.test');
    assert.equal(readChallengeScore(new URL(url).search), 0);
  });
});

describe('readChallengeScore', () => {
  test('reads the score out of a query', () => {
    assert.equal(readChallengeScore('?beat=812'), 812);
  });

  test('reads it out of a query without the question mark', () => {
    assert.equal(readChallengeScore('beat=812'), 812);
  });

  test('reads it out of a URLSearchParams', () => {
    assert.equal(readChallengeScore(new URLSearchParams({ beat: '640' })), 640);
  });

  test('no challenge means no score', () => {
    assert.equal(readChallengeScore('?region=usa'), null);
    assert.equal(readChallengeScore(''), null);
    assert.equal(readChallengeScore(null), null);
  });

  test('a score that is not a number is ignored', () => {
    assert.equal(readChallengeScore('?beat=abc'), null);
  });

  test('a score outside the possible range is ignored', () => {
    assert.equal(readChallengeScore('?beat=-5'), null);
    assert.equal(readChallengeScore('?beat=99999'), null);
  });

  test('the round it is for comes through as well', () => {
    const params = new URLSearchParams('?beat=812&region=world');
    assert.equal(readChallengeScore(params), 812);
    assert.equal(params.get('region'), 'world');
  });
});

describe('challengeOutcome', () => {
  test('a higher score wins', () => {
    assert.equal(challengeOutcome(800, 850), 'won');
  });

  test('a lower score loses', () => {
    assert.equal(challengeOutcome(800, 700), 'lost');
  });

  test('the same score is a draw', () => {
    assert.equal(challengeOutcome(800, 800), 'tie');
  });

  test('there is no result without a challenge', () => {
    assert.equal(challengeOutcome(Number.NaN, 800), null);
  });
});

describe('challengeHeadline', () => {
  test('says what happened', () => {
    assert.match(challengeHeadline('won'), /beat/i);
    assert.match(challengeHeadline('lost'), /close/i);
    assert.match(challengeHeadline('tie'), /same/i);
  });

  test('says nothing without a result', () => {
    assert.equal(challengeHeadline(null), '');
  });
});
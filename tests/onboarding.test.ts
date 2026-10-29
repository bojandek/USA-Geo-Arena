/**
 * Unit tests for the first-visit introduction.
 *
 * Run with: npm test
 */

import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  hasSeenOnboarding,
  markOnboardingSeen,
  ONBOARDING_STEPS,
  resetOnboarding,
} from '../src/lib/onboarding.ts';

/** A minimal localStorage stand-in, so the storage rules can be exercised. */
function installStorage() {
  const store = new Map<string, string>();
  const fake = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
  (globalThis as unknown as { localStorage?: unknown }).localStorage = fake;
  return fake;
}

function removeStorage() {
  delete (globalThis as unknown as { localStorage?: unknown }).localStorage;
}

describe('the introduction copy', () => {
  test('there is a step for every thing a new player cannot work out', () => {
    assert.equal(ONBOARDING_STEPS.length, 4);
  });

  test('every step is complete', () => {
    for (const step of ONBOARDING_STEPS) {
      assert.ok(step.emoji.length > 0, 'every step needs an emoji');
      assert.ok(step.title.length > 3, `the title of "${step.title}" is too short`);
      assert.ok(step.body.length > 20, `the body of "${step.title}" is too short`);
    }
  });

  test('the titles are all different', () => {
    const titles = new Set(ONBOARDING_STEPS.map((step) => step.title));
    assert.equal(titles.size, ONBOARDING_STEPS.length);
  });

  test('the copy is English only', () => {
    const serbian = /[ćčšžđ]/i;
    for (const step of ONBOARDING_STEPS) {
      assert.ok(!serbian.test(step.title), `the title "${step.title}" is not English`);
      assert.ok(!serbian.test(step.body), `the body of "${step.title}" is not English`);
    }
  });

  test('the introduction explains that the guess is made on the map', () => {
    const all = ONBOARDING_STEPS.map((step) => `${step.title} ${step.body}`).join(' ').toLowerCase();
    assert.ok(all.includes('click'), 'the copy must say that the player clicks');
    assert.ok(all.includes('map'), 'the copy must say that the map is used');
  });
});

describe('the introduction is shown once', () => {
  afterEach(() => {
    removeStorage();
  });

  test('a new visitor has not seen it', () => {
    installStorage();
    assert.equal(hasSeenOnboarding(), false);
  });

  test('finishing it marks it as seen', () => {
    installStorage();
    markOnboardingSeen();
    assert.equal(hasSeenOnboarding(), true);
  });

  test('it can be put back so it can be watched again', () => {
    installStorage();
    markOnboardingSeen();
    resetOnboarding();
    assert.equal(hasSeenOnboarding(), false);
  });

  test('a missing storage never throws', () => {
    removeStorage();
    assert.equal(hasSeenOnboarding(), false);
    assert.doesNotThrow(() => markOnboardingSeen());
    assert.doesNotThrow(() => resetOnboarding());
  });

  test('a storage that throws never breaks the app', () => {
    (globalThis as unknown as { localStorage?: unknown }).localStorage = {
      getItem() {
        throw new Error('blocked');
      },
      setItem() {
        throw new Error('blocked');
      },
      removeItem() {
        throw new Error('blocked');
      },
    };
    assert.equal(hasSeenOnboarding(), false);
    assert.doesNotThrow(() => markOnboardingSeen());
    removeStorage();
  });
});
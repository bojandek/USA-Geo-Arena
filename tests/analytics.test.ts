/**
 * Unit tests for the analytics module.
 *
 * The important rule is that nothing is ever reported without a configured
 * property and a visitor who accepted analytics cookies.
 *
 * Run with: npm test
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { ANALYTICS_EVENTS, isAnalyticsConfigured, trackEvent } from '../src/lib/analytics.ts';

describe('analytics configuration', () => {
  test('without a property id nothing is reported', () => {
    // There is no VITE_GA_MEASUREMENT_ID in the test environment, so the
    // module has to be inert.
    assert.equal(isAnalyticsConfigured(), false);
  });

  test('reporting an event without a property is harmless', () => {
    assert.doesNotThrow(() => {
      trackEvent(ANALYTICS_EVENTS.roundStart, { region: 'world' });
      trackEvent(ANALYTICS_EVENTS.roundComplete, { score: 1000 });
    });
  });

  test('reporting an event without a browser is harmless', () => {
    assert.doesNotThrow(() => trackEvent('anything'));
  });
});

describe('the events the site reports', () => {
  test('a round is measured from the start to the end', () => {
    assert.equal(ANALYTICS_EVENTS.roundStart, 'round_start');
    assert.equal(ANALYTICS_EVENTS.roundComplete, 'round_complete');
    assert.equal(ANALYTICS_EVENTS.guessSubmitted, 'guess_submitted');
  });

  test('the things worth knowing about are measured', () => {
    assert.equal(ANALYTICS_EVENTS.share, 'share_results');
    assert.equal(ANALYTICS_EVENTS.regionSelect, 'region_select');
    assert.equal(ANALYTICS_EVENTS.newsletterSignup, 'newsletter_signup');
  });

  test('the event names are unique', () => {
    const names = Object.values(ANALYTICS_EVENTS);
    assert.equal(new Set(names).size, names.length);
  });

  test('the names are in the snake case that GA4 expects', () => {
    for (const name of Object.values(ANALYTICS_EVENTS)) {
      assert.match(name, /^[a-z][a-z0-9_]*$/, `"${name}" is not a valid event name`);
    }
  });
});
/**
 * Unit tests for the advertising and consent layer.
 *
 * Without a publisher id configured (the default in development) no ad slot
 * may be active, and the consent store must behave correctly.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  AD_SLOTS,
  ADSENSE_CLIENT_ID,
  getConsentSnapshot,
  hasDecidedConsent,
  isAdSlotActive,
  setConsent,
  subscribeConsent,
} from '../src/lib/ads.ts';

describe('ad configuration', () => {
  test('every placement has an entry in the slot map', () => {
    for (const name of ['home', 'afterGame', 'inArticle', 'footer'] as const) {
      assert.ok(name in AD_SLOTS, `${name} is missing from AD_SLOTS`);
    }
  });

  test('no slot is active while advertising is not configured', () => {
    if (ADSENSE_CLIENT_ID) return; // configured in this environment
    for (const name of Object.keys(AD_SLOTS) as (keyof typeof AD_SLOTS)[]) {
      assert.equal(isAdSlotActive(name), false, `${name} must be inactive`);
    }
  });
});

describe('consent store', () => {
  test('starts undecided', () => {
    assert.equal(getConsentSnapshot(), null);
    assert.equal(hasDecidedConsent(), false);
  });

  test('recording a choice updates the snapshot and notifies subscribers', () => {
    let notified = 0;
    const unsubscribe = subscribeConsent(() => {
      notified += 1;
    });

    setConsent('granted');
    assert.equal(getConsentSnapshot(), 'granted');
    assert.equal(hasDecidedConsent(), true);
    assert.equal(notified, 1);

    unsubscribe();
    setConsent('denied');
    assert.equal(getConsentSnapshot(), 'denied');
    assert.equal(notified, 1, 'an unsubscribed listener must not be called');
  });
});

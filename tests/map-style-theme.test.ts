/**
 * The map follows the theme until the player chooses a style for themselves.
 *
 * A dark interface with a bright map looks like a mistake, so the two are
 * tied together. These tests live in their own file because the store keeps
 * its state in the module, and the runner gives every file a fresh one.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  getMapStyleSnapshot,
  setMapStyleId,
  setMapThemeIsDark,
  subscribeMapStyle,
} from '../src/lib/map-styles.ts';

describe('the map follows the theme', () => {
  test('a dark interface gets a dark map', () => {
    setMapThemeIsDark(true);
    assert.equal(getMapStyleSnapshot(), 'dark-matter');
  });

  test('a light interface gets a light map', () => {
    setMapThemeIsDark(false);
    assert.equal(getMapStyleSnapshot(), 'voyager');
  });

  test('a theme change is worth waking the map for when the map follows it', () => {
    let notified = 0;
    const unsubscribe = subscribeMapStyle(() => {
      notified += 1;
    });
    setMapThemeIsDark(true);
    assert.equal(notified, 1, 'the map changed from light to dark');
    setMapThemeIsDark(true);
    assert.equal(notified, 1, 'the same theme again is not worth a notice');
    setMapThemeIsDark(false);
    assert.equal(notified, 2, 'and back again is');
    unsubscribe();
  });

  test('a style the player chose is not overridden by the theme', () => {
    setMapStyleId('positron');
    setMapThemeIsDark(true);
    assert.equal(getMapStyleSnapshot(), 'positron', 'the player chose this one');
    setMapThemeIsDark(false);
    assert.equal(getMapStyleSnapshot(), 'positron', 'and it stays chosen');
  });

  test('once a style is chosen the theme leaves the map alone', () => {
    setMapStyleId('dark-matter');
    let notified = 0;
    const unsubscribe = subscribeMapStyle(() => {
      notified += 1;
    });
    setMapThemeIsDark(true);
    setMapThemeIsDark(false);
    assert.equal(notified, 0, 'the map was not going to change');
    assert.equal(getMapStyleSnapshot(), 'dark-matter');
    unsubscribe();
  });
});
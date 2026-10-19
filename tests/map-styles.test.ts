/**
 * Unit tests for the map-style store.
 *
 * The picker and the map used to keep separate copies of the style id, so
 * picking a style never reached the map. The store is what both now share.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_MAP_STYLE_ID,
  MAP_STYLES,
  getMapStyleById,
  getMapStyleSnapshot,
  getMapStyleSource,
  setMapStyleId,
  subscribeMapStyle,
} from '../src/lib/map-styles.ts';

describe('map style store', () => {
  test('every style has a name, a description and a swatch', () => {
    for (const style of MAP_STYLES) {
      assert.ok(style.id, 'a style needs an id');
      assert.ok(style.name, 'a style needs a name');
      assert.ok(style.description, 'a style needs a description');
      assert.ok(style.swatch, 'a style needs a swatch class');
    }
  });

  test('every style resolves to a usable map source', () => {
    for (const style of MAP_STYLES) {
      const source = getMapStyleSource(style.id);
      assert.equal(typeof source, 'string', `${style.id} has no usable source`);
      assert.ok(source.startsWith('https://'), `${style.id} must point to a secure URL`);
      assert.ok(
        source.endsWith('/style.json'),
        `${style.id} must point to a style.json document`,
      );
    }
  });

  test('every style is served by CARTO, which is free for commercial use', () => {
    // Esri imagery and CARTO raster layers are not used: the first is free for
    // non-commercial use only, the second now requires a paid API key.
    for (const style of MAP_STYLES) {
      assert.ok(
        style.url.includes('basemaps.cartocdn.com'),
        `${style.id} must be served by CARTO`,
      );
    }
  });

  test('there is a no-labels variant for every theme', () => {
    const themes = ['voyager', 'dark-matter', 'positron'];
    for (const theme of themes) {
      const variant = MAP_STYLES.find((style) => style.id === `${theme}-nolabels`);
      assert.ok(variant, `${theme} needs a no-labels variant`);
    }
  });

  test('an unknown id falls back to the default instead of throwing', () => {
    assert.equal(getMapStyleById('ne-postoji').id, DEFAULT_MAP_STYLE_ID);
  });

  test('setting a style updates the snapshot and notifies subscribers', () => {
    let notified = 0;
    const unsubscribe = subscribeMapStyle(() => {
      notified += 1;
    });

    setMapStyleId('dark-matter');
    assert.equal(getMapStyleSnapshot(), 'dark-matter');
    assert.equal(notified, 1, 'subscriber must be notified exactly once');

    unsubscribe();
    setMapStyleId('positron');
    assert.equal(getMapStyleSnapshot(), 'positron');
    assert.equal(notified, 1, 'an unsubscribed listener must not be called');
  });

  test('an unknown style id is ignored', () => {
    const before = getMapStyleSnapshot();
    setMapStyleId('ne-postoji');
    assert.equal(getMapStyleSnapshot(), before, 'an invalid id must not change the style');
  });

  test('setting the same style twice notifies only once', () => {
    setMapStyleId('voyager');
    let notified = 0;
    const unsubscribe = subscribeMapStyle(() => {
      notified += 1;
    });

    setMapStyleId('voyager');
    assert.equal(notified, 0, 'an unchanged style must not notify');

    unsubscribe();
  });
});

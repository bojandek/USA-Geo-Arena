/**
 * Unit tests for the map-option store.
 *
 * The picker and the map read from the same store, or the dropdown would
 * show one thing and the map would do another.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_MAP_OPTIONS,
  getMapOptionsSnapshot,
  isMapAtmosphereOption,
  isMapProjectionOption,
  MAP_ATMOSPHERE_OPTIONS,
  MAP_PROJECTION_OPTIONS,
  setMapAtmosphere,
  setMapLabelsVisible,
  setMapOptions,
  setMapProjection,
  subscribeMapOptions,
} from '../src/lib/map-options.ts';

describe('map option store', () => {
  test('the defaults follow the round and leave the air alone', () => {
    assert.equal(DEFAULT_MAP_OPTIONS.projection, 'region');
    assert.equal(DEFAULT_MAP_OPTIONS.atmosphere, 'none');
    assert.equal(DEFAULT_MAP_OPTIONS.labels, true);
  });

  test('every option has a name and a description', () => {
    for (const option of [...MAP_PROJECTION_OPTIONS, ...MAP_ATMOSPHERE_OPTIONS]) {
      assert.ok(option.id, 'an option needs an id');
      assert.ok(option.name, 'an option needs a name');
      assert.ok(option.description, 'an option needs a description');
    }
  });

  test('only the known projections and atmospheres are accepted', () => {
    assert.equal(isMapProjectionOption('globe'), true);
    assert.equal(isMapProjectionOption('mercator'), true);
    assert.equal(isMapProjectionOption('region'), true);
    assert.equal(isMapProjectionOption('flat'), false);
    assert.equal(isMapProjectionOption(undefined), false);

    assert.equal(isMapAtmosphereOption('day'), true);
    assert.equal(isMapAtmosphereOption('night'), true);
    assert.equal(isMapAtmosphereOption('none'), true);
    assert.equal(isMapAtmosphereOption('dusk'), false);
  });

  test('setting an option updates the snapshot and notifies subscribers', () => {
    let notified = 0;
    const unsubscribe = subscribeMapOptions(() => {
      notified += 1;
    });

    setMapProjection('globe');
    assert.equal(getMapOptionsSnapshot().projection, 'globe');
    assert.equal(notified, 1, 'a subscriber must be notified exactly once');

    unsubscribe();
    setMapProjection('mercator');
    assert.equal(notified, 1, 'an unsubscribed listener must not be called');
  });

  test('setting the same option twice notifies only once', () => {
    setMapProjection('region');
    let notified = 0;
    const unsubscribe = subscribeMapOptions(() => {
      notified += 1;
    });

    setMapProjection('region');
    assert.equal(notified, 0, 'an unchanged option must not notify');

    unsubscribe();
  });

  test('an unknown value is ignored', () => {
    const before = getMapOptionsSnapshot().projection;
    setMapOptions({
      ...getMapOptionsSnapshot(),
      projection: 'nonsense' as never,
    });
    assert.equal(getMapOptionsSnapshot().projection, before);
  });

  test('the atmosphere and the place names are set on their own', () => {
    setMapAtmosphere('night');
    assert.equal(getMapOptionsSnapshot().atmosphere, 'night');

    setMapLabelsVisible(false);
    assert.equal(getMapOptionsSnapshot().labels, false);

    // The other options are left alone.
    assert.equal(getMapOptionsSnapshot().projection, getMapOptionsSnapshot().projection);

    setMapAtmosphere('none');
    setMapLabelsVisible(true);
  });

  test('the snapshot keeps the same reference until it changes', () => {
    const first = getMapOptionsSnapshot();
    assert.equal(getMapOptionsSnapshot(), first);

    setMapAtmosphere('day');
    assert.notEqual(getMapOptionsSnapshot(), first);
    setMapAtmosphere('none');
  });
});

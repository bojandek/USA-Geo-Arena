/**
 * Unit tests for the air around the map and the names written on it.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import type { Map as MapLibreMap } from 'maplibre-gl';

import {
  ATMOSPHERE_PRESETS,
  applyAtmosphere,
  NO_ATMOSPHERE_SKY,
} from '../src/lib/map-atmosphere.ts';

/** A map that only records what it is asked to do. */
function fakeMap(layerIds: string[] = []) {
  const calls = {
    sky: [] as unknown[],
    light: [] as unknown[],
    layout: [] as { id: string; property: string; value: unknown }[],
  };
  const map = {
    setSky: (sky: unknown) => calls.sky.push(sky),
    setLight: (light: unknown) => calls.light.push(light),
    getStyle: () => ({ layers: layerIds.map((id) => ({ id })) }),
    setLayoutProperty: (id: string, property: string, value: unknown) =>
      calls.layout.push({ id, property, value }),
  };
  return { map: map as unknown as MapLibreMap, calls };
}

describe('the air around the map', () => {
  test('there is a day and a night, and both have a sky and a light', () => {
    for (const preset of Object.values(ATMOSPHERE_PRESETS)) {
      assert.ok(preset.sky, 'a preset needs a sky');
      assert.ok(preset.light, 'a preset needs a light');
    }
  });

  test('the fog is part of the sky, because there is no separate setting', () => {
    for (const preset of Object.values(ATMOSPHERE_PRESETS)) {
      assert.ok(preset.sky['fog-color'], 'the sky carries the fog colour');
      assert.equal(typeof preset.sky['fog-ground-blend'], 'number');
      assert.equal(typeof preset.sky['horizon-fog-blend'], 'number');
    }
  });

  test('the night sky is darker than the day one', () => {
    const day = ATMOSPHERE_PRESETS.day.sky['sky-color'] as string;
    const night = ATMOSPHERE_PRESETS.night.sky['sky-color'] as string;
    const brightness = (color: string): number => {
      const value = parseInt(color.replace('#', ''), 16);
      return (value >> 16) + ((value >> 8) & 0xff) + (value & 0xff);
    };
    assert.ok(brightness(night) < brightness(day));
  });

  test('the chosen air is put on the map', () => {
    const { map, calls } = fakeMap();
    applyAtmosphere(map, 'night');
    assert.equal(calls.sky.length, 1);
    assert.equal(calls.light.length, 1);
    assert.deepEqual(calls.sky[0], ATMOSPHERE_PRESETS.night.sky);
    assert.deepEqual(calls.light[0], ATMOSPHERE_PRESETS.night.light);
  });

  test('no air at all means the atmosphere is switched off', () => {
    const { map, calls } = fakeMap();
    applyAtmosphere(map, 'none');
    assert.equal(calls.sky.length, 1);
    assert.deepEqual(calls.sky[0], NO_ATMOSPHERE_SKY);
    assert.equal((NO_ATMOSPHERE_SKY['atmosphere-blend'] as number), 0);
  });
});

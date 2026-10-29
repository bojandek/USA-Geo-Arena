/**
 * Unit tests for the places on the map and for finding the one the player
 * clicked on.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import type { Map as MapLibreMap } from 'maplibre-gl';

import {
  isPlaceLabelLayer,
  PLACE_CLICK_TOLERANCE_PX,
  PLACE_DOT_LAYER_IDS,
  PLACE_LABEL_LAYER_IDS,
  PLACE_LAYER_IDS,
  placeNameAtPoint,
  setPlaceLabelsVisible,
} from '../src/lib/map-places.ts';
import { usaOutlyingQuestions } from '../src/lib/questions/usa-outlying.ts';

const anchorage = usaOutlyingQuestions.find(
  (q) => q.venue === 'Ector Sports Center',
);

/** A map that only records what it is asked to do. */
function fakeMap(
  layerIds: string[] = [],
  features: unknown[] = [],
) {
  const calls = {
    layout: [] as { id: string; property: string; value: unknown }[],
    queries: [] as unknown[],
  };
  const map = {
    getLayer: (id: string) => (layerIds.includes(id) ? { id } : undefined),
    getStyle: () => ({ layers: layerIds.map((id) => ({ id })) }),
    setLayoutProperty: (id: string, property: string, value: unknown) =>
      calls.layout.push({ id, property, value }),
    queryRenderedFeatures: (box: unknown) => {
      calls.queries.push(box);
      return features;
    },
  };
  return { map: map as unknown as MapLibreMap, calls };
}

describe('the place layers on the map', () => {
  test('the layers that draw the towns and the cities are known', () => {
    for (const id of [
      'place_city_r5',
      'place_city_r6',
      'place_town',
      'place_state',
      'place_country_1',
    ]) {
      assert.ok(PLACE_LABEL_LAYER_IDS.includes(id), `${id} draws a place name`);
      assert.equal(isPlaceLabelLayer(id), true);
    }
  });

  test('the layers that draw something else are left alone', () => {
    for (const id of ['roadname_major', 'watername_ocean', 'poi_stadium']) {
      assert.equal(isPlaceLabelLayer(id), false, `${id} is not a place name`);
    }
  });

  test('a city drawn as a dot is still a place', () => {
    for (const id of PLACE_DOT_LAYER_IDS) {
      assert.ok(PLACE_LAYER_IDS.includes(id), `${id} stands for a place`);
      assert.equal(
        isPlaceLabelLayer(id),
        false,
        `${id} draws no name, so it is not a label`,
      );
    }
  });

  test('the names are turned off and on again', () => {
    const { map, calls } = fakeMap(['place_city_r5', 'roadname_major']);
    setPlaceLabelsVisible(map, false);
    assert.equal(calls.layout.length, 1);
    assert.equal(calls.layout[0].id, 'place_city_r5');
    assert.equal(calls.layout[0].value, 'none');
  });

  test('a layer that is not on the map is never asked about', () => {
    const { map, calls } = fakeMap(['roadname_major']);
    setPlaceLabelsVisible(map, false);
    assert.equal(calls.layout.length, 0);
  });

  test('a map with no style at all is left alone', () => {
    const calls: unknown[] = [];
    const map = {
      getStyle: () => undefined,
      setLayoutProperty: (id: string) => calls.push(id),
    } as unknown as MapLibreMap;
    setPlaceLabelsVisible(map, false);
    assert.equal(calls.length, 0);
  });
});

describe('finding the place the player clicked on', () => {
  const feature = (name: string, lng: number, lat: number) => ({
    properties: { name },
    geometry: { type: 'Point', coordinates: [lng, lat] },
  });

  test('the name of the town is found and is the answer', () => {
    const { map } = fakeMap(['place_city_r6'], [
      feature('Anchorage', -149.9003, 61.2181),
    ]);
    const name = placeNameAtPoint(
      map,
      { x: 500, y: 300 },
      anchorage ?? null,
    );
    assert.equal(name, 'Anchorage');
  });

  test('the map is asked about a small box around the click, not a single point', () => {
    const { map, calls } = fakeMap(['place_city_r6'], []);
    placeNameAtPoint(map, { x: 500, y: 300 }, anchorage ?? null);
    assert.equal(calls.queries.length, 1);
    const box = calls.queries[0] as number[][];
    assert.equal(box.length, 2);
    assert.equal(box[0][0], 500 - PLACE_CLICK_TOLERANCE_PX);
    assert.equal(box[1][1], 300 + PLACE_CLICK_TOLERANCE_PX);
  });

  test('the name of the state is not the answer', () => {
    const { map } = fakeMap(['place_state'], [
      feature('Alaska', -149.5, 64.2),
    ]);
    const name = placeNameAtPoint(map, { x: 500, y: 300 }, anchorage ?? null);
    assert.equal(name, null);
  });

  test('a map with no place layers on it finds nothing', () => {
    const { map } = fakeMap(['roadname_major'], [
      feature('Anchorage', -149.9003, 61.2181),
    ]);
    const name = placeNameAtPoint(map, { x: 500, y: 300 }, anchorage ?? null);
    assert.equal(name, null);
  });

  test('without a question there is nothing to match against', () => {
    const { map } = fakeMap(['place_city_r6'], [
      feature('Anchorage', -149.9003, 61.2181),
    ]);
    assert.equal(placeNameAtPoint(map, { x: 500, y: 300 }, null), null);
  });
});

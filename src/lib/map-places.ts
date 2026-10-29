/**
 * The places on the map, and finding the one the player clicked on.
 *
 * The map draws the names of the towns and the cities, and a player who
 * knows where they are can answer a question by clicking on the name rather
 * than by dropping a pin on the right pixel. That matters most in Alaska
 * and in Hawaii, where the pin has to land in the right few hundred metres
 * and the name of the town is right there on the screen.
 *
 * This is the map side of that: which layers stand for a place, how to turn
 * the names off, and how to read the name out of what the player clicked on.
 * Whether the name is the answer is decided by `place-names.ts`.
 */

import type { Map as MapLibreMap } from 'maplibre-gl';

import { matchesAnswerName, placeNameFromFeature } from './place-names.ts';
import type { Question } from './question-types.ts';

/**
 * The layers that draw the names of places.
 *
 * These are the layers of the CARTO styles the game uses. They are the ones
 * a player reads to work out where they are: the country, the state, the
 * city and the smaller places inside it. The water names and the road names
 * are left alone - they are not places, and a player looking for a stadium
 * does not need to know which river runs past it.
 */
export const PLACE_LABEL_LAYER_IDS = [
  'place_continent',
  'place_country_1',
  'place_country_2',
  'place_state',
  'place_city_r5',
  'place_city_r6',
  'place_town',
  'place_villages',
  'place_hamlet',
  'place_suburbs',
];

/**
 * The layers that draw a city as a dot.
 *
 * Below zoom 8 the names of the cities are not written out - the city is a
 * dot on the map instead, and the name only appears when the map is close
 * enough. The dot stands for the same place, so it counts as naming it.
 */
export const PLACE_DOT_LAYER_IDS = [
  'place_city_dot_r7',
  'place_city_dot_r4',
  'place_city_dot_r2',
  'place_city_dot_z7',
  'place_capital_dot_z7',
];

/**
 * Every layer that stands for a place, whether the name is written on it or
 * not.
 */
export const PLACE_LAYER_IDS = [...PLACE_LABEL_LAYER_IDS, ...PLACE_DOT_LAYER_IDS];

/** True when the layer draws the name of a place. */
export function isPlaceLabelLayer(layerId: string): boolean {
  return PLACE_LABEL_LAYER_IDS.includes(layerId);
}

/**
 * Turns the place names on or off.
 *
 * The layers are looked up in the style that is actually loaded, because a
 * style that is missing a layer throws when it is asked to change one.
 */
export function setPlaceLabelsVisible(
  map: MapLibreMap,
  visible: boolean,
): void {
  const style = map.getStyle();
  if (!style || !Array.isArray(style.layers)) return;

  for (const layer of style.layers) {
    if (!isPlaceLabelLayer(layer.id)) continue;
    map.setLayoutProperty(
      layer.id,
      'visibility',
      visible ? 'visible' : 'none',
    );
  }
}

/**
 * How far around the click the map is asked about a place.
 *
 * The name of a town is written next to the town, not on the exact point of
 * it, so the point the player clicked is often a little to the side of the
 * letters. A small box around the click finds the name they were aiming at
 * without reaching for the name next door.
 */
export const PLACE_CLICK_TOLERANCE_PX = 14;

/**
 * The name of the place under the cursor, when it is the answer.
 *
 * Only a name that is the answer counts. A name that is a long way from the
 * answer - the label of a whole state, say - is not.
 */
export function placeNameAtPoint(
  map: MapLibreMap,
  point: { x: number; y: number },
  question: Question | null | undefined,
): string | null {
  if (!question) return null;

  // Only the layers that are actually on the map can be asked about.
  const layers = PLACE_LAYER_IDS.filter((id) => map.getLayer(id));
  if (layers.length === 0) return null;

  const features = map.queryRenderedFeatures(
    [
      [point.x - PLACE_CLICK_TOLERANCE_PX, point.y - PLACE_CLICK_TOLERANCE_PX],
      [point.x + PLACE_CLICK_TOLERANCE_PX, point.y + PLACE_CLICK_TOLERANCE_PX],
    ],
    { layers },
  );

  for (const feature of features) {
    const name = placeNameFromFeature(feature);
    if (!name) continue;
    // The name is drawn on the place itself, so the point the label sits
    // on is the point of the place.
    const geometry = feature.geometry;
    if (!geometry || geometry.type !== 'Point') continue;
    const [lng, lat] = geometry.coordinates as [number, number];
    if (matchesAnswerName(name, question, { lat, lng })) return name;
  }

  return null;
}

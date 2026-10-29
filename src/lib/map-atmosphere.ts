/**
 * The air around the map: the sky, the fog and the light.
 *
 * MapLibre draws a sphere with an atmosphere around it, and the sky
 * specification is where the fog lives too - there is no separate fog
 * setting in this version of the library, so `fog-color`, `fog-ground-blend`
 * and `horizon-fog-blend` are part of the sky.
 *
 * The presets are here rather than in the component so that they can be
 * checked without a browser, and so that the same air is used wherever the
 * map is drawn.
 */

import type { LightSpecification, Map as MapLibreMap, SkySpecification } from 'maplibre-gl';

import type { MapAtmosphereOption } from './map-options.ts';

export interface AtmospherePreset {
  /** The sky, and with it the fog at the horizon. */
  sky: SkySpecification;
  /** The light that falls on raised ground. */
  light: LightSpecification;
}

/**
 * The two looks the map can have.
 *
 * The blend of the atmosphere is driven by the zoom: it is strongest when the
 * whole planet is on the screen and gone by the time the map is close
 * enough to read, so that a zoomed-in map is not washed out.
 */
export const ATMOSPHERE_PRESETS: Record<'day' | 'night', AtmospherePreset> = {
  day: {
    sky: {
      'sky-color': '#3C7FD4',
      'sky-horizon-blend': 0.65,
      'horizon-color': '#BFD8F0',
      'horizon-fog-blend': 0.55,
      'fog-color': '#C9DDF2',
      'fog-ground-blend': 0.45,
      'atmosphere-blend': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0,
        1,
        12,
        1,
        15,
        0,
      ],
    },
    light: {
      anchor: 'viewport',
      color: '#FFFFFF',
      intensity: 0.35,
      position: [1.15, 210, 30],
    },
  },
  night: {
    sky: {
      'sky-color': '#070B1B',
      'sky-horizon-blend': 0.8,
      'horizon-color': '#1C2547',
      'horizon-fog-blend': 0.65,
      'fog-color': '#141B36',
      'fog-ground-blend': 0.4,
      'atmosphere-blend': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0,
        1,
        12,
        1,
        15,
        0,
      ],
    },
    light: {
      anchor: 'viewport',
      color: '#93A9DA',
      intensity: 0.2,
      position: [1.5, 90, 80],
    },
  },
};

/**
 * The map with no air at all.
 *
 * The atmosphere is not removed by leaving it alone: the library draws a
 * default sky over a globe whether or not the style asks for one. The blend
 * is what decides whether it is seen, so it is what is set to zero.
 */
export const NO_ATMOSPHERE_SKY: SkySpecification = {
  'atmosphere-blend': 0,
};

/**
 * The light the library uses when nothing else is asked for.
 *
 * Only raised ground is lit, so on a flat map this changes nothing - it is
 * here so that turning the atmosphere off really does put the map back the
 * way it was.
 */
export const DEFAULT_LIGHT: LightSpecification = {
  anchor: 'viewport',
  color: '#FFFFFF',
  intensity: 0.5,
  position: [1.15, 210, 30],
};

/** Puts the chosen air around the map. */
export function applyAtmosphere(
  map: MapLibreMap,
  atmosphere: MapAtmosphereOption,
): void {
  if (atmosphere === 'none') {
    map.setSky(NO_ATMOSPHERE_SKY);
    map.setLight(DEFAULT_LIGHT);
    return;
  }
  const preset = ATMOSPHERE_PRESETS[atmosphere];
  map.setSky(preset.sky);
  map.setLight(preset.light);
}

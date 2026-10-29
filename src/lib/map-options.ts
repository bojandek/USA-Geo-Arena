/**
 * Map display options.
 *
 * The map style is only one of the three choices a player makes about the
 * map. They also choose how the planet is drawn - a sphere or the flat map -
 * and what the air around it looks like: a sky, some fog and a light.
 *
 * These live in the same kind of tiny external store as the map style, for
 * the same reason: the picker and the map have to read the same value, or
 * the dropdown would show one thing and the map would do another.
 *
 * The options are kept apart from the style on purpose. A player who wants a
 * globe with a night sky still wants the dark basemap underneath it, and
 * swapping the style to get the atmosphere would throw the basemap away.
 */

/** How the planet is drawn. `region` follows the round being played. */
export type MapProjectionOption = 'region' | 'globe' | 'mercator';

/** The air around the map: the sky, the fog and the light. */
export type MapAtmosphereOption = 'none' | 'day' | 'night';

export interface MapOptions {
  projection: MapProjectionOption;
  atmosphere: MapAtmosphereOption;
  /**
   * Whether the names of towns and cities are drawn on the map.
   *
   * They are on by default: the place names are how a player says where the
   * answer is. Turning them off is for a player who wants to work the answer
   * out from the shape of the country alone.
   */
  labels: boolean;
}

export const DEFAULT_MAP_OPTIONS: MapOptions = {
  projection: 'region',
  atmosphere: 'none',
  labels: true,
};

export interface MapOptionChoice<T extends string> {
  id: T;
  name: string;
  description: string;
}

export const MAP_PROJECTION_OPTIONS: MapOptionChoice<MapProjectionOption>[] = [
  {
    id: 'region',
    name: 'Follow the round',
    description: 'The world round is a globe, the American one is flat',
  },
  {
    id: 'globe',
    name: 'Globe',
    description: 'The planet as a sphere you can spin',
  },
  {
    id: 'mercator',
    name: 'Flat map',
    description: 'The usual flat map of the world',
  },
];

export const MAP_ATMOSPHERE_OPTIONS: MapOptionChoice<MapAtmosphereOption>[] = [
  {
    id: 'none',
    name: 'None',
    description: 'No sky, no fog - just the map',
  },
  {
    id: 'day',
    name: 'Day',
    description: 'A blue sky and a soft light',
  },
  {
    id: 'night',
    name: 'Night',
    description: 'A dark sky and a cold light',
  },
];

const STORAGE_KEY = 'mapOptions';

/** True when the value is one of the known projections. */
export function isMapProjectionOption(value: unknown): value is MapProjectionOption {
  return value === 'region' || value === 'globe' || value === 'mercator';
}

/** True when the value is one of the known atmospheres. */
export function isMapAtmosphereOption(value: unknown): value is MapAtmosphereOption {
  return value === 'none' || value === 'day' || value === 'night';
}
/**
 * Reads the stored options.
 *
 * Anything unreadable, half written or from an older version of the app
 * falls back to the defaults rather than throwing: the map has to work even
 * when the stored value does not.
 */
export function readStoredMapOptions(): MapOptions {
  const fallback = { ...DEFAULT_MAP_OPTIONS };
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return fallback;
    const source = parsed as Partial<Record<keyof MapOptions, unknown>>;
    return {
      projection: isMapProjectionOption(source.projection)
        ? source.projection
        : fallback.projection,
      atmosphere: isMapAtmosphereOption(source.atmosphere)
        ? source.atmosphere
        : fallback.atmosphere,
      labels: typeof source.labels === 'boolean' ? source.labels : fallback.labels,
    };
  } catch {
    return fallback;
  }
}

/* ------------------------------------------------------------------ *
 * External store
 * ------------------------------------------------------------------ */

let currentOptions: MapOptions = readStoredMapOptions();
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

/** Registers a listener; returns the unsubscribe function. */
export function subscribeMapOptions(listener: () => void): (() => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The current options. Stable reference, as `useSyncExternalStore` requires. */
export function getMapOptionsSnapshot(): MapOptions {
  return currentOptions;
}

function persist(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentOptions));
  } catch {
    // Storage may be unavailable (private mode / quota) - the app still works.
  }
}

/**
 * Replaces the options and tells every subscriber.
 *
 * The new options are only stored when they are actually different, so that
 * a subscriber is never woken for a change that did not happen.
 */
export function setMapOptions(next: MapOptions): void {
  const merged: MapOptions = {
    projection: isMapProjectionOption(next.projection)
      ? next.projection
      : currentOptions.projection,
    atmosphere: isMapAtmosphereOption(next.atmosphere)
      ? next.atmosphere
      : currentOptions.atmosphere,
    labels: typeof next.labels === 'boolean' ? next.labels : currentOptions.labels,
  };
  if (
    merged.projection === currentOptions.projection &&
    merged.atmosphere === currentOptions.atmosphere &&
    merged.labels === currentOptions.labels
  ) {
    return;
  }
  currentOptions = merged;
  persist();
  notify();
}

/** Changes only the projection. */
export function setMapProjection(projection: MapProjectionOption): void {
  setMapOptions({ ...currentOptions, projection });
}

/** Changes only the atmosphere. */
export function setMapAtmosphere(atmosphere: MapAtmosphereOption): void {
  setMapOptions({ ...currentOptions, atmosphere });
}

/** Turns the place names on or off. */
export function setMapLabelsVisible(labels: boolean): void {
  setMapOptions({ ...currentOptions, labels });
}

/** Re-reads the stored preference, e.g. after another tab changed it. */
export function refreshMapOptions(): void {
  const stored = readStoredMapOptions();
  if (
    stored.projection === currentOptions.projection &&
    stored.atmosphere === currentOptions.atmosphere &&
    stored.labels === currentOptions.labels
  ) {
    return;
  }
  currentOptions = stored;
  notify();
}


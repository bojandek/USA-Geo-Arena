/**
 * Map styles and the store behind the map-style preference.
 *
 * The preference lives in a tiny external store (subscribe / getSnapshot)
 * instead of component state, because the picker and the map used to keep
 * their own separate copies: picking a style updated the label in the
 * dropdown but never the map itself.
 *
 * Every style is a CARTO vector basemap. They need no API key, they are free
 * for commercial use with the attribution that is already baked into the
 * style, and they render as vectors, which is much lighter than raster
 * imagery. CARTO's raster tile endpoints and their satellite/terrain layers
 * now require a paid API key, and Esri imagery is free for non-commercial
 * use only - so both were removed rather than left as a licensing risk.
 */

export interface MapStyleOption {
  id: string;
  name: string;
  description: string;
  /** CARTO style JSON. */
  url: string;
  /** Tailwind classes for the colour swatch in the picker. */
  swatch: string;
}

export const MAP_STYLES: MapStyleOption[] = [
  {
    id: 'voyager',
    name: 'Voyager',
    url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    description: 'Clean, colorful base map with labels',
    swatch: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'dark-matter',
    name: 'Dark Matter',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    description: 'Dark theme for better contrast',
    swatch: 'bg-gray-800 text-white',
  },
  {
    id: 'positron',
    name: 'Positron',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    description: 'Light, minimalist base map',
    swatch: 'bg-gray-100 text-gray-600',
  },
  {
    id: 'voyager-nolabels',
    name: 'Voyager · no labels',
    url: 'https://basemaps.cartocdn.com/gl/voyager-nolabels-gl-style/style.json',
    description: 'Colorful map without place names - no spoilers',
    swatch: 'bg-teal-100 text-teal-600',
  },
  {
    id: 'dark-matter-nolabels',
    name: 'Dark Matter · no labels',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
    description: 'Dark map without place names - no spoilers',
    swatch: 'bg-slate-700 text-slate-200',
  },
  {
    id: 'positron-nolabels',
    name: 'Positron · no labels',
    url: 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json',
    description: 'Minimal map without place names - no spoilers',
    swatch: 'bg-stone-200 text-stone-700',
  },
];

export const DEFAULT_MAP_STYLE_ID = MAP_STYLES[0].id;

const STORAGE_KEY = 'mapStyle';

export const getMapStyleById = (id: string): MapStyleOption =>
  MAP_STYLES.find((style) => style.id === id) ?? MAP_STYLES[0];

/** The value react-map-gl expects for the `mapStyle` prop. */
export const getMapStyleSource = (id: string): string => getMapStyleById(id).url;

function readStoredStyleId(): string {
  if (typeof localStorage === 'undefined') return DEFAULT_MAP_STYLE_ID;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && MAP_STYLES.some((style) => style.id === stored)
      ? stored
      : DEFAULT_MAP_STYLE_ID;
  } catch {
    return DEFAULT_MAP_STYLE_ID;
  }
}

/* ------------------------------------------------------------------ *
 * External store
 * ------------------------------------------------------------------ */

let currentStyleId: string = readStoredStyleId();
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

/** Current style id. Stable reference, as `useSyncExternalStore` requires. */
export const getMapStyleSnapshot = (): string => currentStyleId;

/** Registers a listener; returns the unsubscribe function. */
export const subscribeMapStyle = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Applies a new style, persists it and notifies every subscriber. */
export const setMapStyleId = (id: string): void => {
  if (!MAP_STYLES.some((style) => style.id === id)) return;
  if (id === currentStyleId) return;

  currentStyleId = id;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Storage may be unavailable (private mode / quota) - the app still works.
    }
  }
  notify();
};

/** Re-reads the stored preference, e.g. after another tab changed it. */
export const refreshMapStyle = (): void => {
  const stored = readStoredStyleId();
  if (stored === currentStyleId) return;
  currentStyleId = stored;
  notify();
};

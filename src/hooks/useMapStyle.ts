/**
 * Shared map-style state.
 *
 * The picker and the map must read from the same source of truth. Before
 * this, the picker kept its own `useState` copy and so did every game mode,
 * so choosing a style only changed the label in the dropdown - the map kept
 * rendering the old style until the page was reloaded.
 *
 * `useSyncExternalStore` gives every component the same value and updates
 * all of them the moment the style changes.
 */

import { useEffect, useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';

import {
  getMapStyleSnapshot,
  refreshMapStyle,
  setMapStyleId as setMapStyleIdInStore,
  setMapThemeIsDark,
  subscribeMapStyle,
} from '@/lib/map-styles';

export interface UseMapStyleResult {
  /** Id of the currently active style, e.g. "voyager". */
  mapStyleId: string;
  /** Changes the style for every component at once. */
  setMapStyleId: (id: string) => void;
}

export function useMapStyle(): UseMapStyleResult {
  const { resolvedTheme } = useTheme();
  const mapStyleId = useSyncExternalStore(
    subscribeMapStyle,
    getMapStyleSnapshot,
    getMapStyleSnapshot,
  );

  // The map follows the theme until the player picks a style for themselves.
  useEffect(() => {
    setMapThemeIsDark(resolvedTheme === 'dark');
  }, [resolvedTheme]);

  // Keep other browser tabs in sync with the stored preference.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'mapStyle' || event.key === null) refreshMapStyle();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return { mapStyleId, setMapStyleId: setMapStyleIdInStore };
}

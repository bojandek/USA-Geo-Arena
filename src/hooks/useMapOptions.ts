/**
 * Shared map-option state.
 *
 * The picker and the map must read from the same source of truth, or the
 * dropdown would show one thing while the map did another. This is the same
 * arrangement as the map style: a small external store read through
 * `useSyncExternalStore`.
 */

import { useEffect, useSyncExternalStore } from 'react';

import {
  getMapOptionsSnapshot,
  refreshMapOptions,
  setMapAtmosphere as setMapAtmosphereInStore,
  setMapLabelsVisible as setMapLabelsVisibleInStore,
  setMapProjection as setMapProjectionInStore,
  subscribeMapOptions,
  type MapAtmosphereOption,
  type MapOptions,
  type MapProjectionOption,
} from '@/lib/map-options';

export interface UseMapOptionsResult {
  options: MapOptions;
  setMapProjection: (projection: MapProjectionOption) => void;
  setMapAtmosphere: (atmosphere: MapAtmosphereOption) => void;
  setMapLabelsVisible: (labels: boolean) => void;
}

export function useMapOptions(): UseMapOptionsResult {
  const options = useSyncExternalStore(
    subscribeMapOptions,
    getMapOptionsSnapshot,
    getMapOptionsSnapshot,
  );

  // Keep other browser tabs in sync with the stored preference.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'mapOptions' || event.key === null) refreshMapOptions();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return {
    options,
    setMapProjection: setMapProjectionInStore,
    setMapAtmosphere: setMapAtmosphereInStore,
    setMapLabelsVisible: setMapLabelsVisibleInStore,
  };
}

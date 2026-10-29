/**
 * The map picker.
 *
 * The basemap, the air around the planet and the names written on it are one
 * decision - how the map should look while the player is hunting for an
 * answer - and the top of the game screen has room for one control, not two.
 *
 * On the world round the menu also offers Globe and Flat map, because both
 * are honest pictures of the whole planet. The American round is always
 * flat: a globe of one country is mostly empty space, so there is nothing to
 * choose there. A flat world is drawn with a single copy of the map, so the
 * continents are never repeated.
 *
 * The name on the button is the basemap, because that is what a player thinks
 * of as "the map".
 */

import { MapPin, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { getMapStyleById, MAP_STYLES } from '@/lib/map-styles';
import {
  MAP_ATMOSPHERE_OPTIONS,
  MAP_PROJECTION_OPTIONS,
  type MapAtmosphereOption,
  type MapProjectionOption,
} from '@/lib/map-options';
import { useMapStyle } from '@/hooks/useMapStyle';
import { useMapOptions } from '@/hooks/useMapOptions';

interface MapSelectProps {
  className?: string;
  /**
   * How the map is being drawn at the moment.
   *
   * The sky and the fog are drawn by the library only on a globe, so the
   * choices that are about the air are put away on the flat map rather than
   * left there to do nothing.
   */
  projection: 'globe' | 'mercator';
  /**
   * Whether the player may switch between the globe and the flat map.
   *
   * Only the world round offers it: both are honest pictures of the whole
   * planet. The American round has one right answer, and it is the flat map.
   */
  canChangeProjection?: boolean;
}

export default function MapSelect({
  className,
  projection,
  canChangeProjection = false,
}: MapSelectProps) {
  const { mapStyleId, setMapStyleId } = useMapStyle();
  const { options, setMapProjection, setMapAtmosphere, setMapLabelsVisible } =
    useMapOptions();
  const onGlobe = projection === 'globe';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors',
          className,
        )}
      >
        <MapPin className="w-4 h-4 text-gray-500" />
        <span className="hidden sm:inline text-sm font-medium text-gray-700">
          {getMapStyleById(mapStyleId).name}
        </span>
        <ChevronDown className="hidden sm:block w-4 h-4 text-gray-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 bg-white border rounded-md shadow-lg p-1"
      >
        {/* The basemap underneath. */}
        <DropdownMenuLabel className="text-xs font-semibold text-gray-500">
          The map
        </DropdownMenuLabel>
        {MAP_STYLES.map((style) => (
          <DropdownMenuItem
            key={style.id}
            onSelect={() => setMapStyleId(style.id)}
            className={`flex items-center gap-2 px-3 py-2 text-sm ${
              mapStyleId === style.id ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className={`w-5 h-5 flex-shrink-0 rounded flex items-center justify-center ${style.swatch}`}>
              <MapPin className="w-3 h-3" />
            </div>
            <span className="flex-1">{style.name}</span>
            {mapStyleId === style.id && <span className="text-primary text-xs">✓</span>}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {canChangeProjection && (
          <>
            <DropdownMenuLabel className="text-xs font-semibold text-gray-500">
              How the world is drawn
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={projection}
              onValueChange={(value) =>
                setMapProjection(value as MapProjectionOption)
              }
            >
              {MAP_PROJECTION_OPTIONS.filter((option) => option.id !== 'region').map(
                (option) => (
                  <DropdownMenuRadioItem
                    key={option.id}
                    value={option.id}
                    className="text-sm text-gray-700"
                  >
                    <span className="flex flex-col">
                      <span>{option.name}</span>
                      <span className="text-xs text-gray-500">
                        {option.description}
                      </span>
                    </span>
                  </DropdownMenuRadioItem>
                ),
              )}
            </DropdownMenuRadioGroup>

            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuLabel className="text-xs font-semibold text-gray-500">
          The air around it
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={options.atmosphere}
          onValueChange={(value) => setMapAtmosphere(value as MapAtmosphereOption)}
        >
          {MAP_ATMOSPHERE_OPTIONS.map((option) => (
            <DropdownMenuRadioItem
              key={option.id}
              value={option.id}
              disabled={!onGlobe}
              className="text-sm text-gray-700"
            >
              <span className="flex flex-col">
                <span>{option.name}</span>
                <span className="text-xs text-gray-500">
                  {option.description}
                </span>
              </span>
            </DropdownMenuRadioItem>
          ))}
          {!onGlobe && (
            <p className="px-3 py-1.5 text-xs text-gray-400">
              The sky and the fog are only drawn on a globe.
            </p>
          )}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuCheckboxItem
          checked={options.labels}
          onCheckedChange={(checked) => setMapLabelsVisible(checked === true)}
          className="text-sm text-gray-700"
        >
          <MapPin className="w-4 h-4 mr-2 text-gray-500" />
          <span className="flex flex-col">
            <span>Place names</span>
            <span className="text-xs text-gray-500">
              {options.labels
                ? 'The names of towns and cities are on the map'
                : 'No names - work it out from the map alone'}
            </span>
          </span>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

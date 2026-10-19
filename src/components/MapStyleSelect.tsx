/**
 * Shared map-style picker.
 *
 * The same dropdown was copy-pasted into all three game modes; this keeps a
 * single implementation. It reads and writes the shared store, so picking a
 * style updates the map in every mode immediately.
 */

import { MapPin, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { getMapStyleById, MAP_STYLES } from '@/lib/map-styles';
import { useMapStyle } from '@/hooks/useMapStyle';

interface MapStyleSelectProps {
  className?: string;
}

export default function MapStyleSelect({ className }: MapStyleSelectProps) {
  const { mapStyleId, setMapStyleId } = useMapStyle();

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
      <DropdownMenuContent className="w-52 bg-white border rounded-md shadow-lg p-1">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

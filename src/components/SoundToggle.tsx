/**
 * The sound switch.
 *
 * A game that makes a noise needs a way to turn it off, and the switch has to
 * be where the visitor can find it without going looking for it.
 */

import { useSyncExternalStore } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getSoundSnapshot, playSound, setSoundEnabled, subscribeSound } from '@/lib/sound';

export default function SoundToggle({ className = '' }: { className?: string }) {
  const enabled = useSyncExternalStore(
    subscribeSound,
    getSoundSnapshot,
    getSoundSnapshot,
  );

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={() => {
        const next = !enabled;
        setSoundEnabled(next);
        // A tiny confirmation when sound is switched on. Switching it off is
        // deliberately silent.
        if (next) playSound('click');
      }}
      aria-label={enabled ? 'Turn the sound off' : 'Turn the sound on'}
      title={enabled ? 'Sound on' : 'Sound off'}
      className={`rounded-full shadow-md bg-white/90 text-gray-700 hover:bg-white h-9 w-9 shrink-0 ${className}`}
    >
      {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </Button>
  );
}
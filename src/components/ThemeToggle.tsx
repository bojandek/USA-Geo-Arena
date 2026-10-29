/**
 * The light and dark switch.
 *
 * The theme is stored by next-themes and applied to the html element, so it
 * is in place before the first paint. This component only decides which icon
 * to show, and it waits until the page has mounted before it decides anything
 * at all - the server does not know which theme the visitor chose.
 */

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to the light theme' : 'Switch to the dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
      className={`rounded-full shadow-md bg-white/90 text-gray-700 hover:bg-white h-9 w-9 shrink-0 ${className}`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
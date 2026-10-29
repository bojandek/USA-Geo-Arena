/**
 * Layout for the game modes.
 *
 * The site header stays visible during a game - the player can always get
 * anywhere, the streak and level are always in sight, and every game page
 * keeps real navigation links in the DOM (a button with an onClick handler
 * is invisible to crawlers).
 *
 * The footer is left out on purpose: the game should own the full height
 * below the header.
 */

import { Outlet } from 'react-router-dom';
import SiteHeader from '@/components/SiteHeader';

export default function GameLayout() {
  return (
    <div className="h-[100dvh] flex flex-col bg-gray-50">
      <SiteHeader />
      <main className="flex-1 min-h-0 relative">
        <Outlet />
      </main>
    </div>
  );
}

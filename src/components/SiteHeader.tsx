/**
 * Top navigation with the site's categories.
 *
 * The app used to be a single page with an internal `currentPage` state, which
 * made it impossible to link to a specific mode and killed browser history.
 * Categories are now real routes.
 */

import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Trophy,
  Target,
  Zap,
  Calendar,
  BarChart3,
  Award,
  Flame,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGameStore } from '@/lib/game-store';
import { HEADER_INFO_LINKS } from '@/lib/site-content';

export interface NavCategory {
  to: string;
  label: string;
  icon: typeof Home;
  /** Shown as a small badge next to the label. */
  badge?: string;
}

export const NAV_CATEGORIES: NavCategory[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/daily', label: 'Daily', icon: Trophy, badge: 'Today' },
  { to: '/practice', label: 'Practice', icon: Target },
  { to: '/battle', label: 'Battle', icon: Zap },
  { to: '/archive', label: 'Archive', icon: Calendar },
  { to: '/leaderboard', label: 'Scores', icon: BarChart3 },
  { to: '/achievements', label: 'Badges', icon: Award },
];

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { streak, level, isTodayCompleted } = useGameStore();
  const location = useLocation();

  // The "More" menu holds the informational pages; highlight it while one of
  // them is open.
  const isInfoActive = HEADER_INFO_LINKS.some((link) => link.to === location.pathname);

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
        : 'text-gray-700 hover:bg-white/70'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-50/95 via-red-50/95 to-pink-50/95 backdrop-blur-md border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-xl">🌍</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-script font-bold text-gray-800 leading-none">GeoArena</h1>
              <p className="text-[10px] text-gray-500 leading-none mt-0.5">Guess the place</p>
            </div>
          </Link>

          {/* Desktop categories */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_CATEGORIES.map((category) => (
              <NavLink
                key={category.to}
                to={category.to}
                end={category.to === '/'}
                className={linkClasses}
              >
                <category.icon className="w-4 h-4" />
                {category.label}
                {category.badge && category.to === '/daily' && isTodayCompleted && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-500 text-white">
                    ✓
                  </span>
                )}
              </NavLink>
            ))}

            {/* Informational pages (About, Team, Editorial, Contact) */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-semibold transition-colors ${
                  isInfoActive
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                    : 'text-gray-700 hover:bg-white/70'
                }`}
              >
                More
                <ChevronDown className="w-3.5 h-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52 bg-white border-orange-100 shadow-lg"
              >
                {HEADER_INFO_LINKS.map((link) => (
                  <DropdownMenuItem key={link.to} asChild>
                    <Link to={link.to} className="w-full">
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right side: stats + mobile toggle */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-orange-100">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-bold text-gray-700">{streak}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-orange-100">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-bold text-gray-700">Lv {level}</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile categories */}
      {mobileOpen && (
        <motion.nav
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="lg:hidden border-t border-orange-100 bg-white/95 backdrop-blur-md overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 gap-2">
            {NAV_CATEGORIES.map((category) => (
              <NavLink
                key={category.to}
                to={category.to}
                end={category.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-secondary text-white'
                      : 'bg-gray-50 text-gray-700'
                  }`
                }
                onClick={() => setMobileOpen(false)}
              >
                <category.icon className="w-4 h-4" />
                {category.label}
              </NavLink>
            ))}
          </div>

          {/* Informational pages */}
          <div className="max-w-7xl mx-auto px-4 pb-4 pt-3 border-t border-orange-100 grid grid-cols-1 gap-1">
            {HEADER_INFO_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-xl text-sm font-medium ${
                  location.pathname === link.to
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.nav>
      )}
    </header>
  );
}

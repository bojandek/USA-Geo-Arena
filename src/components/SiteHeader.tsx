/**
 * Top navigation with the site's categories.
 *
 * The app used to be a single page with an internal `currentPage` state, which
 * made it impossible to link to a specific mode and killed browser history.
 * Categories are now real routes.
 */

import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import SoundToggle from '@/components/SoundToggle';
import {
  Trophy,
  Flame,
  Menu,
  X,
  ChevronDown,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProStatus } from '@/lib/pro';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGameStore } from '@/lib/game-store';
import { HEADER_INFO_LINKS, BRAND_NAME } from '@/lib/site-content';
import BrandIcon from '@/components/BrandIcon';
import UsFlag from '@/components/UsFlag';
import AuthMenu from '@/components/AuthMenu';

export interface NavCategory {
  to: string;
  label: string;
  /** A colour emoji; the USA entry draws a flag SVG instead. */
  emoji?: string;
}

export const NAV_CATEGORIES: NavCategory[] = [
  { to: '/', label: 'Home', emoji: '🏠' },
  { to: '/daily', label: 'USA' },
  { to: '/world', label: 'World', emoji: '🌍' },
  { to: '/battle', label: 'Battle', emoji: '⚡' },
  { to: '/archive', label: 'Archive', emoji: '📅' },
  { to: '/leaderboard', label: 'Scores', emoji: '📊' },
  { to: '/achievements', label: 'Badges', emoji: '🏅' },
];

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { streak, level } = useGameStore();
  const location = useLocation();
  const [isPro, setIsPro] = useState(getProStatus().isPro);

  // The licence can be bought on another tab, so the mark is checked when the
  // header comes back into view.
  useEffect(() => {
    function refresh() {
      setIsPro(getProStatus().isPro);
    }
    window.addEventListener('focus', refresh);
    window.addEventListener('geoarena:pro-changed', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('geoarena:pro-changed', refresh);
    };
  }, []);

  // The "More" menu holds the informational pages; highlight it while one of
  // them is open.
  const isInfoActive = HEADER_INFO_LINKS.some((link) => link.to === location.pathname);

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 xl:gap-2 px-2.5 py-1.5 xl:px-3 2xl:px-4 xl:py-2 rounded-full text-[13px] xl:text-sm 2xl:text-[15px] font-semibold whitespace-nowrap transition-colors ${
      isActive
        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-sm'
        : 'text-gray-600 hover:bg-white hover:text-gray-900'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-50/95 via-red-50/95 to-pink-50/95 backdrop-blur-md border-b border-orange-100">
      <div className="w-full mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex items-center gap-3 h-16 xl:h-[72px]">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <BrandIcon className="w-10 h-10 drop-shadow-md" title={BRAND_NAME} />
            <div className="hidden sm:block">
              <h1 className="text-lg font-script font-bold text-gray-800 leading-none">
                {BRAND_NAME}
              </h1>
              <p className="text-[10px] text-gray-500 leading-none mt-0.5">Guess the place</p>
            </div>
          </Link>

          {/* Desktop categories */}
          {/* The categories sit together in one pill, next to the controls on
              the right, instead of being spread across the whole bar. */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 ml-auto rounded-full bg-white/60 border border-orange-100 p-1 xl:p-1.5 shadow-sm">
            {NAV_CATEGORIES.map((category) => (
              <NavLink
                key={category.to}
                to={category.to}
                end={category.to === '/'}
                className={linkClasses}
              >
                {category.to === '/daily' ? (
                  <UsFlag className="hidden xl:block h-4 w-5 rounded-[2px] shadow-sm" />
                ) : (
                  <span className="hidden xl:inline text-base 2xl:text-lg leading-none" aria-hidden="true">
                    {category.emoji}
                  </span>
                )}
                {category.label}
              </NavLink>
            ))}

            {/* Informational pages (About, Team, Editorial, Contact) */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`flex items-center gap-1 px-2.5 py-1.5 xl:px-3 2xl:px-4 xl:py-2 rounded-full text-[13px] xl:text-sm 2xl:text-[15px] font-semibold transition-colors ${
                  isInfoActive
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-sm'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900'
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

          {/* Right side: progress, Pro, the switches and the account */}
          <div className="flex items-center gap-1.5 ml-auto lg:ml-0">
            <div
              className="hidden 2xl:flex items-center gap-2 bg-white/80 pl-2.5 pr-3 py-1.5 rounded-full border border-orange-100 text-sm font-bold text-gray-700"
              title={`${streak}-day streak · level ${level}`}
            >
              <span className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                {streak}
              </span>
              <span className="h-3.5 w-px bg-orange-200" aria-hidden="true" />
              <span className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Lv {level}
              </span>
            </div>

            {/* The Pro button. It sits in the header rather than only in the
                "More" menu, so that it is one click away and a crawler can
                see it. The crown turns gold when this device is Pro. */}
            <Link
              to="/pro"
              className="flex items-center gap-1.5 bg-white/80 h-9 px-2.5 sm:px-3 rounded-full border border-orange-100 hover:border-yellow-300 transition-colors"
              aria-label="USA GeoArena Pro"
            >
              <Crown
                className={`w-4 h-4 ${isPro ? 'text-yellow-500' : 'text-gray-400'}`}
              />
              <span className="text-sm font-bold text-gray-700 hidden sm:inline">
                Pro
              </span>
            </Link>

            <ThemeToggle />
            <SoundToggle />

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* The account sits in the top right corner, where people look
                for it. */}
            <div className="ml-1">
              <AuthMenu compact />
            </div>
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
                {category.to === '/daily' ? (
                  <UsFlag className="h-3.5 w-5 rounded-[2px] shadow-sm" />
                ) : (
                  <span className="text-base leading-none" aria-hidden="true">
                    {category.emoji}
                  </span>
                )}
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

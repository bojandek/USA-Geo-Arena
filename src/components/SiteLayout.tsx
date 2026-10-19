/**
 * Application shell: sticky category navigation + page content + footer.
 *
 * The header owns the game modes; the footer owns the company and legal
 * pages. The two never repeat each other, so there is only ever one obvious
 * place to look for either.
 */

import { Link, Outlet } from 'react-router-dom';
import SiteHeader from '@/components/SiteHeader';
import AdSlot from '@/components/AdSlot';
import { FOOTER_LINKS } from '@/lib/site-content';

export default function SiteLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSlot slot="footer" className="py-6" />
      </div>
      <footer className="border-t border-orange-100 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌍</span>
              <div>
                <p className="font-script font-bold text-gray-800 text-lg">GeoArena</p>
                <p className="text-xs text-gray-500">
                  Guess the place. Build your streak. Beat the world.
                </p>
              </div>
            </div>
            <nav
              aria-label="Company and legal"
              className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-600"
            >
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-gray-500">
            <p>© 2026 GeoArena.com. All Rights Reserved.</p>
            <button
              onClick={() => window.dispatchEvent(new Event('geoarena:open-consent'))}
              className="underline hover:text-primary transition-colors"
            >
              Privacy settings
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

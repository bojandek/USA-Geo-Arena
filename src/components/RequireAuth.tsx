/**
 * Route guard for everything except today's daily round.
 *
 * The gate is intentionally a page rather than a redirect: a visitor who
 * follows a link to an archive or another mode can see why they were stopped
 * and sign in without losing their place.
 */

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, LockKeyhole } from 'lucide-react';

import AuthMenu from '@/components/AuthMenu';
import { useAuthSession } from '@/lib/auth-session';
import { isAuthConfigured } from '@/lib/supabase';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuthSession();

  if (!isAuthConfigured) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-3xl border border-orange-100 bg-white/80 p-8 text-center shadow-sm">
          <LockKeyhole className="mx-auto h-9 w-9 text-primary" />
          <h1 className="mt-4 font-script text-2xl font-bold text-gray-800">
            Sign-in is not configured
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
            This part of USA GeoArena needs an account. Add the Supabase auth
            keys and enable a provider to open it.
          </p>
          <div className="mt-5 flex justify-center">
            <AuthMenu />
          </div>
          <Link to="/" className="mt-5 inline-block text-xs text-gray-500 underline">
            Back to today's challenge
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-3xl border border-orange-100 bg-white/80 p-8 text-center shadow-sm">
          <LockKeyhole className="mx-auto h-9 w-9 text-primary" />
          <h1 className="mt-4 font-script text-2xl font-bold text-gray-800">
            Sign in to keep playing
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
            Today's daily challenge is free. Sign in to play archived days,
            the world round, battle mode and the rest of the game.
          </p>
          <div className="mt-5 flex justify-center">
            <AuthMenu />
          </div>
          <Link to="/daily" className="mt-5 inline-block text-xs text-gray-500 underline">
            Play today's free round
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * The browser-side Supabase client.
 *
 * Only the public anon key belongs here. The service role key stays on the
 * server in `api/_lib/backend.ts`; it must never be exposed to a visitor.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = String(import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

/** True when the public auth configuration is present. */
export const isAuthConfigured = Boolean(url && anonKey);

/** The client, or null while auth has not been configured yet. */
export const supabase: SupabaseClient | null = isAuthConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : null;

/** Where Google, Apple and email links come back to. */
export function authRedirectUrl(): string {
  return `${window.location.origin}/auth/callback`;
}

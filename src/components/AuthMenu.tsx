/**
 * Sign in / sign out in the site footer.
 *
 * Authentication is deliberately separate from the newsletter: signing in
 * creates a Supabase auth user, while the newsletter keeps its own consent and
 * provider flow. Google and Apple are OAuth redirects; email is a magic link.
 */

import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Check, Loader2, LogIn, LogOut, Mail, UserRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { authRedirectUrl, isAuthConfigured, supabase } from '@/lib/supabase';
import { useAuthSession } from '@/lib/auth-session';
import {
  NEWSLETTER_ENABLED,
  NEWSLETTER_IS_PLACEHOLDER,
  isValidEmail,
  rememberNewsletterConsent,
  subscribeToNewsletter,
  takeNewsletterConsent,
} from '@/lib/newsletter';

type Provider = 'google' | 'apple';
type Busy = Provider | 'email' | 'signout' | null;

export default function AuthMenu() {
  const { session } = useAuthSession();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState<Busy>(null);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);

  useEffect(() => {
    if (!session?.user.email) return;
    if (!takeNewsletterConsent()) return;
    void subscribeToNewsletter(session.user.email);
  }, [session]);

  // Keep the control visible even before auth is configured. The dialog
  // explains what is missing rather than leaving an invisible feature.

  const startOAuth = async (provider: Provider) => {
    if (!supabase) return;
    setBusy(provider);
    setMessage('');
    rememberNewsletterConsent(newsletterOptIn);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: authRedirectUrl() },
    });
    if (error) {
      rememberNewsletterConsent(false);
      setMessage(error.message);
      setBusy(null);
    }
    // On success the browser is redirected to the provider.
  };

  const sendMagicLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;

    const value = email.trim();
    if (!isValidEmail(value)) {
      setMessage('Enter a valid email address.');
      return;
    }

    setBusy('email');
    setMessage('');
    rememberNewsletterConsent(newsletterOptIn);
    const { error } = await supabase.auth.signInWithOtp({
      email: value,
      options: {
        emailRedirectTo: authRedirectUrl(),
        shouldCreateUser: true,
      },
    });
    setBusy(null);

    if (error) {
      rememberNewsletterConsent(false);
      setMessage(error.message);
      return;
    }
    setSent(true);
  };

  const signOut = async () => {
    if (!supabase) return;
    setBusy('signout');
    setMessage('');
    const { error } = await supabase.auth.signOut();
    setBusy(null);
    if (error) setMessage(error.message);
  };

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-xs text-gray-500 sm:inline">Signed in as</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserRound className="h-3.5 w-3.5" />
        </span>
        <span className="max-w-[150px] truncate text-xs font-medium text-gray-700">
          {session.user.email}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void signOut()}
          disabled={busy === 'signout'}
          className="h-8 rounded-full px-2 text-xs text-gray-500 hover:bg-orange-50 hover:text-primary"
        >
          {busy === 'signout' ? (
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          ) : (
            <LogOut className="mr-1 h-3.5 w-3.5" />
          )}
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setSent(false);
          setMessage('');
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="default"
          size="sm"
          className="h-9 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <LogIn className="mr-1.5 h-3.5 w-3.5" />
          Sign in
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="font-script text-2xl text-gray-800">
            Sign in to USA GeoArena
          </DialogTitle>
          <DialogDescription>
            Keep your progress in one place across devices.
          </DialogDescription>
        </DialogHeader>

        {!isAuthConfigured ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Auth is not configured yet. Add <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> to the environment, then enable
            Google, Apple and email in Supabase.
          </div>
        ) : sent ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
            <p className="flex items-center gap-2 font-semibold">
              <Check className="h-4 w-4" />
              Check your inbox
            </p>
            <p className="mt-1">
              We sent a sign-in link to <strong>{email}</strong>.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 rounded-full bg-white"
              onClick={() => {
                setSent(false);
                setEmail('');
              }}
            >
              Use another email
            </Button>
          </div>
        ) : (
          <>
            {NEWSLETTER_ENABLED && !NEWSLETTER_IS_PLACEHOLDER && (
              <label className="flex items-start gap-2 rounded-xl border border-orange-100 bg-orange-50/60 p-3 text-xs leading-5 text-gray-600">
                <input
                  type="checkbox"
                  checked={newsletterOptIn}
                  onChange={(event) => setNewsletterOptIn(event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-primary"
                />
                Send me the daily USA GeoArena challenge by email.
              </label>
            )}

            <div className="grid gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 justify-start rounded-xl bg-white"
                disabled={busy !== null}
                onClick={() => void startOAuth('google')}
              >
                <span className="mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-bold text-[#4285F4] ring-1 ring-gray-200">
                  G
                </span>
                Continue with Google
                {busy === 'google' && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-11 justify-start rounded-xl bg-white"
                disabled={busy !== null}
                onClick={() => void startOAuth('apple')}
              >
                <span className="mr-1 flex h-5 w-5 items-center justify-center text-lg leading-none text-gray-900">
                  &#63743;
                </span>
                Continue with Apple
                {busy === 'apple' && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
              </Button>
            </div>

            <div className="flex items-center gap-3 py-1 text-[11px] uppercase tracking-wider text-gray-400">
              <span className="h-px flex-1 bg-gray-200" />
              or
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            <form onSubmit={(event) => void sendMagicLink(event)} className="grid gap-2">
              <label htmlFor="auth-email" className="sr-only">
                Email address
              </label>
              <Input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="your@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 rounded-xl"
              />
              <Button type="submit" className="h-11 rounded-xl" disabled={busy !== null}>
                {busy === 'email' ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-1.5 h-4 w-4" />
                )}
                Email me a sign-in link
              </Button>
            </form>

            <p className="text-center text-[11px] leading-5 text-gray-400">
              By continuing you agree to our{' '}
              <Link to="/terms" className="underline hover:text-gray-600">
                Terms
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="underline hover:text-gray-600">
                Privacy Policy
              </Link>
              . This signs you in; the daily newsletter stays separate.
            </p>
          </>
        )}

        {message && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700"
          >
            {message}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

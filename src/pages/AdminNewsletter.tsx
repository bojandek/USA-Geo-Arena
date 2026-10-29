/**
 * The admin newsletter desk.
 *
 * It is deliberately one screen: unlock with the server-side admin token,
 * pick a day, look at the real email and take the HTML away. It never sends a
 * campaign - the cron and the ESP own that - so a wrong click cannot mail the
 * list.
 */

import { useEffect, useState } from 'react';
import {
  CalendarDays,
  Clipboard,
  Download,
  KeyRound,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import Seo from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatFullDayLabel, todayKey } from '@/lib/date-utils';

const TOKEN_KEY = 'geoarena-admin-token';

interface AdminEmail {
  day: string;
  region: 'usa' | 'world';
  subject: string;
  preheader: string;
  html: string;
  text: string;
}

function readToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
}

export default function AdminNewsletter() {
  const [token, setToken] = useState(readToken);
  const [day, setDay] = useState(todayKey);
  const [region, setRegion] = useState<'usa' | 'world'>('usa');
  const [email, setEmail] = useState<AdminEmail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    if (!token.trim()) {
      setError('Enter the admin token first.');
      return;
    }
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      sessionStorage.setItem(TOKEN_KEY, token.trim());
    } catch {
      // Private mode can refuse storage; the session still works this time.
    }
    try {
      const response = await fetch(
        `/api/admin/newsletter?day=${encodeURIComponent(day)}&region=${region}`,
        { headers: { 'x-admin-token': token.trim() }, cache: 'no-store' },
      );
      const payload = (await response.json()) as AdminEmail & { error?: string };
      if (!response.ok) {
        setEmail(null);
        setError(payload.error ?? `The server answered with ${response.status}.`);
        return;
      }
      setEmail(payload);
    } catch {
      setError('The admin route could not be reached.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (readToken()) void load();
    // The saved token only needs to unlock the screen once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const download = async () => {
    if (!email) return;
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/newsletter?day=${encodeURIComponent(day)}&region=${region}&download=1`,
        { headers: { 'x-admin-token': token.trim() }, cache: 'no-store' },
      );
      if (!response.ok) {
        setError('The HTML could not be downloaded.');
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `geoarena-${day}-${region}.html`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('The HTML could not be downloaded.');
    }
  };

  const copy = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email.html);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('The browser would not let the HTML be copied.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 px-4 py-8 sm:py-12">
      <Seo
        title="Admin · Daily newsletter"
        description="Private newsletter desk."
        path="/admin/newsletter"
        noIndex
      />
      <div className="mx-auto max-w-5xl space-y-5">
        <header>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
            <ShieldCheck className="h-4 w-4" />
            Private admin
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            Daily newsletter
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            Preview the real email, then download the HTML for an ESP. Sending
            stays with the cron and the provider — this screen never mails the
            list.
          </p>
        </header>

        <section className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                <KeyRound className="h-3.5 w-3.5" />
                Admin token
              </span>
              <Input
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void load();
                }}
                placeholder="ADMIN_SECRET"
                autoComplete="current-password"
              />
            </label>
            <div className="flex items-end">
              <Button onClick={() => void load()} disabled={loading} className="w-full sm:w-auto">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Unlock
              </Button>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-gray-500">
            The token is checked on the server and kept only for this browser
            tab.
          </p>
        </section>

        <section className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                <CalendarDays className="h-3.5 w-3.5" />
                Day
              </span>
              <Input
                type="date"
                value={day}
                onChange={(event) => setDay(event.target.value)}
                className="w-[170px]"
              />
            </label>
            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                <Mail className="h-3.5 w-3.5" />
                Round
              </span>
              <select
                value={region}
                onChange={(event) => setRegion(event.target.value as 'usa' | 'world')}
                className="h-10 w-[150px] rounded-md border border-input bg-white px-3 text-sm"
              >
                <option value="usa">USA</option>
                <option value="world">World</option>
              </select>
            </label>
            <Button variant="secondary" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Load preview
            </Button>
            <Button onClick={() => void download()} disabled={!email}>
              <Download className="mr-2 h-4 w-4" />
              Download HTML
            </Button>
            <Button variant="outline" onClick={() => void copy()} disabled={!email}>
              <Clipboard className="mr-2 h-4 w-4" />
              {copied ? 'Copied' : 'Copy HTML'}
            </Button>
          </div>
          {error && (
            <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </section>

        {email && (
          <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
            <div className="border-b border-orange-100 bg-white/90 px-4 py-3 sm:px-5">
              <p className="text-sm font-bold text-gray-900">{email.subject}</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {formatFullDayLabel(email.day)} · {email.region === 'usa' ? 'USA' : 'World'} ·{' '}
                {email.preheader}
              </p>
            </div>
            <iframe
              title="Newsletter preview"
              srcDoc={email.html}
              sandbox=""
              className="h-[68vh] w-full bg-white"
            />
          </section>
        )}
      </div>
    </div>
  );
}


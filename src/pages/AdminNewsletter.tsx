/**
 * The admin newsletter desk.
 *
 * Unlock with the server-side admin token, pick a day, and the screen shows
 * the real email, the day's first question with its answer, and what could go
 * wrong before it is sent. The subject, preheader and intro can be edited and
 * saved for the day, which the cron then uses too. The one send it can do is
 * a test to NEWSLETTER_TEST_EMAIL - the list is the cron's job, so a wrong
 * click cannot mail everyone.
 */

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Download,
  ExternalLink,
  Eye,
  KeyRound,
  Loader2,
  Mail,
  RotateCcw,
  Save,
  Send,
  ShieldCheck,
} from 'lucide-react';
import Seo from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { addDays, formatFullDayLabel, todayKey } from '@/lib/date-utils';

const TOKEN_KEY = 'geoarena-admin-token';

/** The same limits the server cuts edits to. */
const LIMITS = { subject: 150, preheader: 150, intro: 240 } as const;

/** Inboxes start cutting a subject off around here. */
const SUBJECT_COMFORT = 70;

type Region = 'usa' | 'world';
type View = 'desktop' | 'mobile' | 'text';

interface Edits {
  subject: string;
  preheader: string;
  intro: string;
}

interface FirstQuestion {
  source: 'bank' | 'bundled';
  question: {
    text: string;
    venue?: string;
    category: string;
    lat: number;
    lng: number;
    facts: string[];
    image?: { url: string; alt: string; credit: string };
  };
}

interface Stock {
  days: number;
  last: string | null;
}

interface Desk {
  day: string;
  region: Region;
  subject: string;
  preheader: string;
  html: string;
  text: string;
  saved: Partial<Edits>;
  first: FirstQuestion | null;
  stock: { usa: Stock | null; world: Stock | null };
  checks: {
    bytes: number;
    clipped: boolean;
    clipLimit: number;
    images: { url: string; ok: boolean; status: number | null }[];
    subjectLength: number;
  };
  testTo: string | null;
}

const EMPTY: Edits = { subject: '', preheader: '', intro: '' };

function readToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
}

function editsFrom(saved: Partial<Edits>): Edits {
  return {
    subject: saved.subject ?? '',
    preheader: saved.preheader ?? '',
    intro: saved.intro ?? '',
  };
}

function kilobytes(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function Check({ ok, warn, children }: { ok: boolean; warn?: boolean; children: React.ReactNode }) {
  const Icon = ok ? CheckCircle2 : AlertTriangle;
  const color = ok ? 'text-emerald-600' : warn ? 'text-amber-600' : 'text-red-600';
  return (
    <li className="flex items-start gap-2 text-sm text-gray-700">
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />
      <span>{children}</span>
    </li>
  );
}

function Field({
  label,
  value,
  limit,
  placeholder,
  multiline,
  onChange,
}: {
  label: string;
  value: string;
  limit: number;
  placeholder: string;
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-600">
        {label}
        <span className="font-normal text-gray-400">
          {value.length}/{limit}
        </span>
      </span>
      {multiline ? (
        <Textarea
          value={value}
          maxLength={limit}
          placeholder={placeholder}
          rows={2}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <Input
          value={value}
          maxLength={limit}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

export default function AdminNewsletter() {
  const [token, setToken] = useState(readToken);
  const [day, setDay] = useState(todayKey);
  const [region, setRegion] = useState<Region>('usa');
  const [desk, setDesk] = useState<Desk | null>(null);
  const [edits, setEdits] = useState<Edits>(EMPTY);
  const [view, setView] = useState<View>('desktop');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const headers = () => ({ 'x-admin-token': token.trim(), 'content-type': 'application/json' });

  const accept = async (response: Response, keepEdits: boolean) => {
    const payload = (await response.json()) as Desk & { error?: string };
    if (!response.ok) {
      setError(payload.error ?? `The server answered with ${response.status}.`);
      return;
    }
    setDesk(payload);
    if (!keepEdits) setEdits(editsFrom(payload.saved));
  };

  const run = async (label: string, work: () => Promise<void>) => {
    if (!token.trim()) {
      setError('Enter the admin token first.');
      return;
    }
    setBusy(label);
    setError(null);
    setNotice(null);
    try {
      await work();
    } catch {
      setError('The admin route could not be reached.');
    } finally {
      setBusy(null);
    }
  };

  const load = (forDay = day, forRegion = region) =>
    run('load', async () => {
      try {
        sessionStorage.setItem(TOKEN_KEY, token.trim());
      } catch {
        // Private mode can refuse storage; the session still works this time.
      }
      const response = await fetch(
        `/api/admin/newsletter?day=${encodeURIComponent(forDay)}&region=${forRegion}`,
        { headers: headers(), cache: 'no-store' },
      );
      await accept(response, false);
    });

  const post = (action: 'preview' | 'save' | 'test', next: Edits = edits) =>
    fetch('/api/admin/newsletter', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ action, day, region, ...next }),
    });

  const preview = () => run('preview', async () => accept(await post('preview'), true));

  const save = (next: Edits = edits) =>
    run('save', async () => {
      const response = await post('save', next);
      await accept(response, false);
      if (response.ok) {
        setNotice(
          next.subject || next.preheader || next.intro
            ? 'Saved. The cron will send this version.'
            : 'Edits removed. The cron will send the defaults.',
        );
      }
    });

  const sendTest = () =>
    run('test', async () => {
      const response = await post('test');
      const payload = (await response.json()) as { error?: string; to?: string };
      if (!response.ok) {
        setError(payload.error ?? `The server answered with ${response.status}.`);
        return;
      }
      setNotice(`Test sent to ${payload.to}.`);
    });

  useEffect(() => {
    if (readToken()) void load();
    // The saved token only needs to unlock the screen once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveDay = (step: number) => {
    const next = addDays(day, step);
    setDay(next);
    if (desk) void load(next, region);
  };

  const copy = async (what: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(`${what} copied.`);
    } catch {
      setError(`The browser would not let the ${what.toLowerCase()} be copied.`);
    }
  };

  const download = () => {
    if (!desk) return;
    const url = URL.createObjectURL(new Blob([desk.html], { type: 'text/html' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `geoarena-${desk.day}-${desk.region}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const savedSomething = desk ? Object.keys(desk.saved).length > 0 : false;
  const unsaved = desk ? JSON.stringify(edits) !== JSON.stringify(editsFrom(desk.saved)) : false;
  const brokenImages = desk?.checks.images.filter((image) => !image.ok) ?? [];
  const first = desk?.first?.question;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 px-4 py-8 sm:py-12">
      <Seo
        title="Admin · Daily newsletter"
        description="Private newsletter desk."
        path="/admin/newsletter"
        noIndex
      />
      <div className="mx-auto max-w-6xl space-y-5">
        <header>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
            <ShieldCheck className="h-4 w-4" />
            Private admin
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">Daily newsletter</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            The day's first question is the subject and the picture of the email. Edit
            the words, check the email, send yourself a test. The list itself is mailed
            by the cron only.
          </p>
        </header>

        <section className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-end gap-3">
            <label className="block min-w-[200px] flex-1">
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
            <div>
              <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                <CalendarDays className="h-3.5 w-3.5" />
                Day
              </span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={() => moveDay(-1)} aria-label="Previous day">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Input
                  type="date"
                  value={day}
                  onChange={(event) => setDay(event.target.value)}
                  className="w-[160px]"
                  aria-label="Day"
                />
                <Button variant="outline" size="icon" onClick={() => moveDay(1)} aria-label="Next day">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <label className="block">
              <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                <Mail className="h-3.5 w-3.5" />
                Round
              </span>
              <select
                value={region}
                onChange={(event) => {
                  const next = event.target.value as Region;
                  setRegion(next);
                  if (desk) void load(day, next);
                }}
                className="h-10 w-[120px] rounded-md border border-input bg-white px-3 text-sm"
              >
                <option value="usa">USA</option>
                <option value="world">World</option>
              </select>
            </label>
            <Button onClick={() => void load()} disabled={busy !== null}>
              {busy === 'load' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {desk ? 'Reload' : 'Unlock'}
            </Button>
          </div>
          {error && (
            <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          {notice && (
            <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {notice}
            </p>
          )}
        </section>

        {desk && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
            <div className="space-y-5">
              <section className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-900">Words</h2>
                  {savedSomething && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                      Saved edits in use
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  <Field
                    label="Subject"
                    value={edits.subject}
                    limit={LIMITS.subject}
                    placeholder={first?.text ?? 'The first question of the day'}
                    onChange={(subject) => setEdits({ ...edits, subject })}
                  />
                  <Field
                    label="Preheader"
                    value={edits.preheader}
                    limit={LIMITS.preheader}
                    placeholder="The default preview line"
                    onChange={(preheader) => setEdits({ ...edits, preheader })}
                  />
                  <Field
                    label="Intro under the button"
                    value={edits.intro}
                    limit={LIMITS.intro}
                    placeholder="The default line for this round"
                    multiline
                    onChange={(intro) => setEdits({ ...edits, intro })}
                  />
                  <p className="text-[11px] text-gray-500">
                    Empty fields use the defaults: the subject is the day's first question.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" onClick={() => void preview()} disabled={busy !== null}>
                      <Eye className="mr-1.5 h-4 w-4" />
                      Preview
                    </Button>
                    <Button size="sm" onClick={() => void save()} disabled={busy !== null || !unsaved}>
                      <Save className="mr-1.5 h-4 w-4" />
                      Save for this day
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEdits(EMPTY);
                        if (savedSomething) void save(EMPTY);
                      }}
                      disabled={busy !== null}
                    >
                      <RotateCcw className="mr-1.5 h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                  {unsaved && <p className="text-[11px] font-semibold text-amber-700">Not saved yet.</p>}
                </div>
              </section>

              <section className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm">
                <h2 className="mb-3 text-sm font-bold text-gray-900">Checks</h2>
                <ul className="space-y-2">
                  <Check ok={!desk.checks.clipped}>
                    HTML is {kilobytes(desk.checks.bytes)}
                    {desk.checks.clipped
                      ? ` - Gmail clips after ${kilobytes(desk.checks.clipLimit)}.`
                      : ', under the Gmail clip.'}
                  </Check>
                  <Check ok={brokenImages.length === 0}>
                    {desk.checks.images.length === 0
                      ? 'No pictures in the email.'
                      : brokenImages.length === 0
                        ? `All ${desk.checks.images.length} pictures load.`
                        : `${brokenImages.length} of ${desk.checks.images.length} pictures do not load.`}
                  </Check>
                  {brokenImages.map((image) => (
                    <li key={image.url} className="ml-6 break-all text-xs text-red-700">
                      {image.status ?? 'no answer'} · {image.url}
                    </li>
                  ))}
                  <Check ok={desk.checks.subjectLength <= SUBJECT_COMFORT} warn>
                    Subject is {desk.checks.subjectLength} characters
                    {desk.checks.subjectLength > SUBJECT_COMFORT ? ', phones will cut it short.' : '.'}
                  </Check>
                  <Check ok={desk.first?.source === 'bank'} warn>
                    {desk.first?.source === 'bank'
                      ? 'The round comes from the question bank.'
                      : 'No bank round for this day - the bundled rotation is used.'}
                  </Check>
                  {(['usa', 'world'] as const).map((key) => {
                    const stock = desk.stock[key];
                    return (
                      <Check key={key} ok={Boolean(stock && stock.days >= 30)} warn>
                        {key === 'usa' ? 'USA' : 'World'} bank:{' '}
                        {stock ? `${stock.days} days left, last ${stock.last ?? '-'}` : 'cannot be read'}
                      </Check>
                    );
                  })}
                </ul>
              </section>

              {first && (
                <section className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm">
                  <h2 className="mb-2 text-sm font-bold text-gray-900">First question</h2>
                  {first.image && (
                    <img
                      src={first.image.url}
                      alt={first.image.alt}
                      className="mb-3 aspect-video w-full rounded-xl object-cover"
                    />
                  )}
                  <p className="text-sm font-semibold text-gray-900">{first.text}</p>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-gray-700">
                    <dt className="font-semibold text-gray-500">Answer</dt>
                    <dd>{first.venue ?? '-'}</dd>
                    <dt className="font-semibold text-gray-500">Kind</dt>
                    <dd>{first.category}</dd>
                    <dt className="font-semibold text-gray-500">Pin</dt>
                    <dd>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${first.lat}&mlon=${first.lng}#map=15/${first.lat}/${first.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary underline"
                      >
                        {first.lat.toFixed(4)}, {first.lng.toFixed(4)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </dd>
                  </dl>
                  {first.facts.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-gray-700">
                      {first.facts.map((fact) => (
                        <li key={fact}>{fact}</li>
                      ))}
                    </ul>
                  )}
                  {first.venue && (
                    <a
                      href={`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(first.venue)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary underline"
                    >
                      Check on Wikipedia
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {first.image && (
                    <p className="mt-2 text-[11px] text-gray-500">Picture: {first.image.credit}</p>
                  )}
                </section>
              )}
            </div>

            <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
              <div className="space-y-3 border-b border-orange-100 bg-white/90 px-4 py-3 sm:px-5">
                <div>
                  <p className="text-sm font-bold text-gray-900">{desk.subject}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {formatFullDayLabel(desk.day)} · {desk.region === 'usa' ? 'USA' : 'World'} ·{' '}
                    {desk.preheader}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-lg border border-input p-0.5">
                    {(['desktop', 'mobile', 'text'] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setView(option)}
                        className={`rounded-md px-3 py-1 text-xs font-semibold capitalize ${
                          view === option ? 'bg-primary text-primary-foreground' : 'text-gray-600'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => void copy('Subject', desk.subject)}>
                    <Clipboard className="mr-1.5 h-4 w-4" />
                    Subject
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => void copy('HTML', desk.html)}>
                    <Clipboard className="mr-1.5 h-4 w-4" />
                    HTML
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => void copy('Text', desk.text)}>
                    <Clipboard className="mr-1.5 h-4 w-4" />
                    Text
                  </Button>
                  <Button variant="outline" size="sm" onClick={download}>
                    <Download className="mr-1.5 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => void sendTest()}
                    disabled={busy !== null || !desk.testTo}
                    title={desk.testTo ? `Sends to ${desk.testTo}` : 'Set NEWSLETTER_TEST_EMAIL first'}
                  >
                    {busy === 'test' ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-1.5 h-4 w-4" />
                    )}
                    Test to {desk.testTo ?? 'nobody'}
                  </Button>
                </div>
              </div>
              <div className="flex justify-center bg-gray-100 p-3">
                {view === 'text' ? (
                  <pre className="h-[72vh] w-full overflow-auto whitespace-pre-wrap rounded-lg bg-white p-4 text-xs text-gray-800">
                    {desk.text}
                  </pre>
                ) : (
                  <iframe
                    title="Newsletter preview"
                    srcDoc={desk.html}
                    sandbox=""
                    style={{ width: view === 'mobile' ? 375 : '100%', maxWidth: '100%' }}
                    className="h-[72vh] rounded-lg bg-white shadow-sm"
                  />
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

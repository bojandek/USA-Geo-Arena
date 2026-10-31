/**
 * The daily email, assembled from the same data for the cron and the admin.
 *
 * Keeping this in one place means a preview and a real send cannot drift
 * apart: both call `buildDailyEmail`.
 */

import { isBackendConfigured, supabase } from './backend.ts';
import { nextDayKey } from './round.ts';
import { dailyRound, storedRound } from './daily-rounds.ts';
import type { Question } from '../../src/lib/game-data.ts';
import { addDays } from '../../src/lib/date-utils.ts';
import {
  buildDailyNewsletter,
  roundUrl,
  type BoardEntry,
  type FeaturedQuestion,
  type NewsletterEdits,
  type NewsletterRegion,
} from '../../newsletter/daily.ts';

/** The longest an edited field may be; Mailchimp stops a subject at 150. */
const EDIT_LIMITS = { subject: 150, preheader: 150, intro: 240 } as const;

/** The edits with every field trimmed and cut to length, empty ones dropped. */
export function cleanEdits(value: unknown): NewsletterEdits {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const edits: NewsletterEdits = {};
  for (const field of Object.keys(EDIT_LIMITS) as (keyof NewsletterEdits)[]) {
    const text = typeof record[field] === 'string' ? (record[field] as string).trim() : '';
    if (text) edits[field] = text.slice(0, EDIT_LIMITS[field]);
  }
  return edits;
}

/** The edits saved in the admin for a day, or none. */
export async function savedEdits(day: string, region: NewsletterRegion): Promise<NewsletterEdits> {
  if (!isBackendConfigured()) return {};
  try {
    const response = await supabase(
      `/rest/v1/newsletter_edits?select=subject,preheader,intro` +
        `&day_key=eq.${encodeURIComponent(day)}&region=eq.${region}&limit=1`,
    );
    if (!response.ok) return {};
    const rows = (await response.json()) as unknown;
    return Array.isArray(rows) && rows.length > 0 ? cleanEdits(rows[0]) : {};
  } catch {
    return {};
  }
}

/** Saves the edits for a day; no edits at all removes the row. */
export async function saveEdits(
  day: string,
  region: NewsletterRegion,
  edits: NewsletterEdits,
): Promise<boolean> {
  if (!isBackendConfigured()) return false;
  const where = `day_key=eq.${encodeURIComponent(day)}&region=eq.${region}`;
  const response =
    Object.keys(edits).length === 0
      ? await supabase(`/rest/v1/newsletter_edits?${where}`, { method: 'DELETE' })
      : await supabase('/rest/v1/newsletter_edits?on_conflict=day_key,region', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify({
            day_key: day,
            region,
            subject: edits.subject ?? null,
            preheader: edits.preheader ?? null,
            intro: edits.intro ?? null,
            updated_at: new Date().toISOString(),
          }),
        });
  return response.ok;
}

/** The first question of a day, with its answer, for checking before it goes out. */
export async function firstQuestion(day: string, region: NewsletterRegion) {
  const stored = await storedRound(day, region);
  const question = (stored ?? (await questionsFor(day, region)))[0];
  return question ? { source: stored ? 'bank' : 'bundled', question } : null;
}

/** How many days the bank still has from today on, and the last of them. */
export async function bankStock(region: NewsletterRegion): Promise<{ days: number; last: string | null } | null> {
  if (!isBackendConfigured()) return null;
  try {
    const response = await supabase(
      `/rest/v1/daily_rounds?select=day_key&region=eq.${region}` +
        `&day_key=gte.${encodeURIComponent(todayKey())}&order=day_key.desc`,
    );
    if (!response.ok) return null;
    const rows = (await response.json()) as { day_key: string }[];
    return { days: rows.length, last: rows[0]?.day_key ?? null };
  } catch {
    return null;
  }
}

/** Where the site is, so the links in the email work. */
export function siteUrl(): string {
  return String(process.env.SITE_URL || 'https://geo-arena-six.vercel.app').replace(/\/$/, '');
}

/** The day it is, in UTC. */
export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** The questions in a round, or an empty list if the data cannot be read. */
async function questionsFor(day: string, region: NewsletterRegion): Promise<Question[]> {
  try {
    return await dailyRound(day, region);
  } catch {
    return [];
  }
}

/** The kinds of question in the round, for the line that says what is coming. */
async function categoriesFor(day: string, region: NewsletterRegion): Promise<string[]> {
  return (await questionsFor(day, region)).map((question) => question.category);
}

/** Turn the first question of a day into an email card. */
async function questionCard(
  day: string,
  region: NewsletterRegion,
  label: string,
): Promise<FeaturedQuestion | null> {
  const question = (await questionsFor(day, region))[0];
  if (!question) return null;
  return {
    question: question.text,
    link: roundUrl(siteUrl(), region, day),
    label,
    image: question.image,
  };
}

/**
 * The best scores so far.
 *
 * The board is written in each player's own day, so at noon UTC there are two
 * days in play - the one the email is about and the one the far east has
 * already started. Both are read, and the best of them is what the email
 * shows.
 */
async function boardEntries(
  day: string,
  region: NewsletterRegion,
): Promise<BoardEntry[]> {
  if (!isBackendConfigured()) return [];

  try {
    const days = encodeURIComponent(`(${day},${nextDayKey(day)})`);
    const response = await supabase(
      `/rest/v1/global_scores?select=score,accuracy,nickname` +
        `&day_key=in.${days}` +
        `&region=eq.${region}` +
        `&order=score.desc&limit=3`,
    );
    if (!response.ok) return [];

    const rows = (await response.json()) as unknown;
    if (!Array.isArray(rows)) return [];

    return rows.slice(0, 3).map((row) => {
      const record = row as Record<string, unknown>;
      return {
        nickname: String(record.nickname ?? 'Anonymous'),
        score: Number(record.score) || 0,
        accuracy: Number(record.accuracy) || 0,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Build the complete email for one day and one region, with the edits saved
 * in the admin unless other edits are given.
 */
export async function buildDailyEmail(
  day: string,
  region: NewsletterRegion,
  edits?: NewsletterEdits,
): Promise<ReturnType<typeof buildDailyNewsletter>> {
  const site = siteUrl();
  const featured = await questionCard(day, region, "Today's first question");
  const previous = (
    await Promise.all([
      questionCard(addDays(day, -1), region, 'Yesterday'),
      questionCard(addDays(day, -2), region, 'Two days ago'),
    ])
  ).filter((item): item is FeaturedQuestion => Boolean(item));

  return buildDailyNewsletter({
    day,
    site,
    region,
    entries: await boardEntries(day, region),
    categories: await categoriesFor(day, region),
    featured: featured ?? undefined,
    previous,
    edits: edits ?? (await savedEdits(day, region)),
  });
}

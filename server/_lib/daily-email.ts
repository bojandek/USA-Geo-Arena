/**
 * The daily email, assembled from the same data for the cron and the admin.
 *
 * Keeping this in one place means a preview and a real send cannot drift
 * apart: both call `buildDailyEmail`.
 */

import { isBackendConfigured, supabase } from './backend.ts';
import { nextDayKey } from './round.ts';
import { getDailyQuestionsForDay } from '../../src/lib/game-data.ts';
import { addDays } from '../../src/lib/date-utils.ts';
import {
  buildDailyNewsletter,
  roundUrl,
  type BoardEntry,
  type FeaturedQuestion,
  type NewsletterRegion,
} from '../../newsletter/daily.ts';

/** Where the site is, so the links in the email work. */
export function siteUrl(): string {
  return String(process.env.SITE_URL || 'https://geo-arena-six.vercel.app').replace(/\/$/, '');
}

/** The day it is, in UTC. */
export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** The questions in a round, or an empty list if the data cannot be read. */
function questionsFor(day: string, region: NewsletterRegion) {
  try {
    return getDailyQuestionsForDay(day, region);
  } catch {
    return [];
  }
}

/** The kinds of question in the round, for the line that says what is coming. */
function categoriesFor(day: string, region: NewsletterRegion): string[] {
  return questionsFor(day, region).map((question) => question.category);
}

/** Turn the first question of a day into an email card. */
function questionCard(
  day: string,
  region: NewsletterRegion,
  label: string,
): FeaturedQuestion | null {
  const question = questionsFor(day, region)[0];
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

/** Build the complete email for one day and one region. */
export async function buildDailyEmail(
  day: string,
  region: NewsletterRegion,
): Promise<ReturnType<typeof buildDailyNewsletter>> {
  const site = siteUrl();
  const featured = questionCard(day, region, "Today's first question");
  const previous = [
    questionCard(addDays(day, -1), region, 'Yesterday'),
    questionCard(addDays(day, -2), region, 'Two days ago'),
  ].filter((item): item is FeaturedQuestion => Boolean(item));

  return buildDailyNewsletter({
    day,
    site,
    region,
    entries: await boardEntries(day, region),
    categories: categoriesFor(day, region),
    featured: featured ?? undefined,
    previous,
  });
}

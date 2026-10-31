/**
 * The admin desk for the daily email.
 *
 * The admin token is checked on the server and never shipped in the bundle.
 * The desk can preview an email with edits, save those edits for a day, and
 * send a test to the one address in NEWSLETTER_TEST_EMAIL. It cannot send to
 * the list: that stays in the cron route, so an accidental click cannot mail
 * everyone.
 */

import { json } from '../_lib/backend.ts';
import {
  bankStock,
  buildDailyEmail,
  cleanEdits,
  firstQuestion,
  savedEdits,
  saveEdits,
  todayKey,
} from '../_lib/daily-email.ts';
import { mailerConfig, sendTestEmail, testAddress } from '../_lib/mailer.ts';
import { isDayKey } from '../_lib/round.ts';
import type { NewsletterEdits, NewsletterRegion } from '../../newsletter/daily.ts';

/** Gmail cuts an email off after about 102 KB of HTML. */
const CLIP_BYTES = 102 * 1024;

/** How long one picture gets to answer before it counts as broken. */
const IMAGE_TIMEOUT_MS = 5000;

/** A comparison that does not stop at the first wrong character. */
function sameToken(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= provided.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return difference === 0;
}

function isAdmin(request: Request): boolean {
  const expected = process.env.ADMIN_SECRET?.trim();
  if (!expected) return false;
  return sameToken(request.headers.get('x-admin-token') ?? '', expected);
}

/** The address with most of its name hidden, so it can be shown on screen. */
function masked(address: string): string {
  const [name, domain] = address.split('@');
  return `${name.slice(0, 1)}${'*'.repeat(Math.max(name.length - 1, 1))}@${domain}`;
}

/** Whether each picture in the email can be loaded. */
async function checkImages(html: string): Promise<{ url: string; ok: boolean; status: number | null }[]> {
  const urls = [...new Set([...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((match) => match[1]))]
    .map((url) => url.replace(/&amp;/g, '&'))
    .filter((url) => /^https?:\/\//.test(url));
  return Promise.all(
    urls.map(async (url) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);
      try {
        // Some hosts refuse HEAD, so a small GET is the fair test.
        const response = await fetch(url, {
          method: 'GET',
          headers: { range: 'bytes=0-0' },
          signal: controller.signal,
        });
        await response.body?.cancel().catch(() => undefined);
        return { url, ok: response.ok, status: response.status };
      } catch {
        return { url, ok: false, status: null };
      } finally {
        clearTimeout(timer);
      }
    }),
  );
}

/** Everything the desk shows for one day: the email, its first question and the checks. */
async function deskFor(day: string, region: NewsletterRegion, edits?: NewsletterEdits) {
  const saved = await savedEdits(day, region);
  const email = await buildDailyEmail(day, region, edits ?? saved);
  const [first, usa, world, images] = await Promise.all([
    firstQuestion(day, region),
    bankStock('usa'),
    bankStock('world'),
    checkImages(email.html),
  ]);
  const bytes = Buffer.byteLength(email.html, 'utf8');
  const address = testAddress();

  return {
    day,
    region,
    subject: email.subject,
    preheader: email.preheader,
    html: email.html,
    text: email.text,
    saved,
    first,
    stock: { usa, world },
    checks: {
      bytes,
      clipped: bytes > CLIP_BYTES,
      clipLimit: CLIP_BYTES,
      images,
      subjectLength: email.subject.length,
    },
    testTo: address ? masked(address) : null,
  };
}

function noStore(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex',
    },
  });
}

import { universal } from '../_lib/node-adapter.ts';

async function handler(request: Request) {
  const expected = process.env.ADMIN_SECRET?.trim();
  if (!expected) {
    return json({ error: 'ADMIN_SECRET is not set on this deployment.' }, 503);
  }
  if (!isAdmin(request)) {
    return json({ error: 'That admin token is not valid.' }, 401);
  }

  if (request.method === 'GET') {
    const { searchParams } = new URL(request.url);
    const region: NewsletterRegion =
      searchParams.get('region') === 'world' ? 'world' : 'usa';
    const asked = searchParams.get('day');
    const day = isDayKey(asked) ? asked : todayKey();

    if (searchParams.get('download') === '1' || searchParams.get('format') === 'html') {
      const email = await buildDailyEmail(day, region);
      return new Response(email.html, {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-store',
          'x-robots-tag': 'noindex',
          'content-disposition': `attachment; filename="geoarena-${day}-${region}.html"`,
        },
      });
    }
    return noStore(await deskFor(day, region));
  }

  if (request.method !== 'POST') {
    return json({ error: 'That is not something this route does.' }, 405);
  }

  let body: Record<string, unknown>;
  try {
    body = ((await request.json()) ?? {}) as Record<string, unknown>;
  } catch {
    return json({ error: 'The request is not valid JSON.' }, 400);
  }
  const region: NewsletterRegion = body.region === 'world' ? 'world' : 'usa';
  const day = isDayKey(body.day as string) ? (body.day as string) : todayKey();
  const edits = cleanEdits(body);

  if (body.action === 'preview') {
    return noStore(await deskFor(day, region, edits));
  }

  if (body.action === 'save') {
    if (!(await saveEdits(day, region, edits))) {
      return json({ error: 'The edits could not be saved. Is the newsletter_edits table there?' }, 502);
    }
    return noStore(await deskFor(day, region));
  }

  if (body.action === 'test') {
    const to = testAddress();
    if (!to) {
      return json({ error: 'NEWSLETTER_TEST_EMAIL is not set on this deployment.' }, 503);
    }
    const config = mailerConfig();
    if (!config) {
      return json({ error: 'The newsletter is not set up on this deployment.' }, 503);
    }
    const email = await buildDailyEmail(day, region, edits);
    const result = await sendTestEmail(config, email, to);
    if (!result.ok) return json({ error: result.error }, 502);
    return noStore({ sent: true, to: masked(to), subject: email.subject });
  }

  return json({ error: 'That is not something this route does.' }, 400);
}

export default universal(handler);

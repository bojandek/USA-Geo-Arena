/**
 * The daily email.
 *
 * The cron calls this once a day with the cron secret, and the email goes
 * out to the whole list. Without the secret the route only shows a preview,
 * so nobody can send the email to the list by hitting the address - which
 * matters, because a route that sends on every visit is a way to burn a
 * sending allowance in an afternoon.
 */

import { json } from './_lib/backend.ts';
import { buildDailyEmail, todayKey } from './_lib/daily-email.ts';
import { mailerConfig, sendDailyEmail } from './_lib/mailer.ts';
import { isDayKey } from './_lib/round.ts';
import { hasStarted } from './_lib/daily-rounds.ts';
import type { NewsletterRegion } from '../newsletter/daily.ts';


/**
 * True when the request carries the cron secret.
 *
 * Vercel Cron sends it as `Authorization: Bearer <CRON_SECRET>` when the
 * secret is set in the project settings.
 */
function isCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

import { universal } from './_lib/node-adapter.ts';

async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const region: NewsletterRegion =
    searchParams.get('region') === 'world' ? 'world' : 'usa';
  const download =
    searchParams.get('download') === '1' || searchParams.get('format') === 'html';

  const asked = searchParams.get('day');
  const day = isDayKey(asked) ? asked : todayKey();

  // The email is built whether it is going to be sent or only looked at, so
  // the preview is always the real thing.
  const email = await buildDailyEmail(day, region);

  const secret = process.env.CRON_SECRET?.trim();

  if (!isCron(request)) {
    // A cron call with the secret turned off means the deployment is not set
    // up properly, and saying so is more use than a preview that never sends.
    if (!secret && request.headers.get('authorization')) {
      return json({ error: 'CRON_SECRET is not set on this deployment.' }, 503);
    }
    if (request.method !== 'GET') {
      return json({ error: 'That is not something this route does.' }, 405);
    }
    // A day that has not started anywhere yet would give its first question
    // and picture away, so the public preview waits like /api/daily does.
    if (!hasStarted(day)) {
      return json({ error: 'That day has not started yet.' }, 403);
    }

    return new Response(email.html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        ...(download
          ? {
              'content-disposition': `attachment; filename="geoarena-${day}-${region}.html"`,
            }
          : {}),
      },
    });
  }

  const config = mailerConfig();
  if (!config) {
    return json({ error: 'The newsletter is not set up on this deployment.' }, 503);
  }

  const result = await sendDailyEmail(config, email);
  if (!result.ok) {
    return json({ error: result.error, campaignId: result.campaignId }, 502);
  }

  return json({
    configured: true,
    sent: true,
    day,
    region,
    subject: email.subject,
    campaignId: result.campaignId,
  });
}

export default universal(handler);


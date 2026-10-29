/**
 * Admin preview and HTML export for the daily email.
 *
 * The admin token is checked on the server and never shipped in the bundle.
 * This route only prepares an email; it does not send one. Sending stays in
 * the cron route and the ESP, so an accidental click cannot mail the list.
 */

import { json } from '../_lib/backend.ts';
import { buildDailyEmail, todayKey } from '../_lib/daily-email.ts';
import { isDayKey } from '../_lib/round.ts';
import type { NewsletterRegion } from '../../newsletter/daily.ts';


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

import { universal } from '../_lib/node-adapter.ts';

async function handler(request: Request) {
  const expected = process.env.ADMIN_SECRET?.trim();
  if (!expected) {
    return json({ error: 'ADMIN_SECRET is not set on this deployment.' }, 503);
  }
  if (!isAdmin(request)) {
    return json({ error: 'That admin token is not valid.' }, 401);
  }
  if (request.method !== 'GET') {
    return json({ error: 'That is not something this route does.' }, 405);
  }

  const { searchParams } = new URL(request.url);
  const region: NewsletterRegion =
    searchParams.get('region') === 'world' ? 'world' : 'usa';
  const asked = searchParams.get('day');
  const day = isDayKey(asked) ? asked : todayKey();
  const download =
    searchParams.get('download') === '1' || searchParams.get('format') === 'html';

  const email = await buildDailyEmail(day, region);

  if (download) {
    return new Response(email.html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'x-robots-tag': 'noindex',
        'content-disposition': `attachment; filename="geoarena-${day}-${region}.html"`,
      },
    });
  }

  return new Response(
    JSON.stringify({
      day,
      region,
      subject: email.subject,
      preheader: email.preheader,
      html: email.html,
      text: email.text,
    }),
    {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-robots-tag': 'noindex',
      },
    },
  );
}

export default universal(handler);


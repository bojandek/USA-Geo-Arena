/**
 * The round of a day.
 *
 * GET ?region=usa&day=2026-11-01
 *
 * A day is only handed out once it has started somewhere in the world, so
 * tomorrow's answers cannot be read ahead of time. Without a stored round
 * the answer says so, and the browser plays the bundled rotation instead.
 */

import { json } from './_lib/backend.ts';
import { isDayKey } from './_lib/round.ts';
import { hasStarted, storedRound } from './_lib/daily-rounds.ts';
import { universal } from './_lib/node-adapter.ts';

async function handler(request: Request) {
  if (request.method === 'OPTIONS') return json({}, 204);
  if (request.method !== 'GET') {
    return json({ error: 'That is not something this route does.' }, 405);
  }

  const { searchParams } = new URL(request.url);
  const day = searchParams.get('day');
  if (!isDayKey(day)) return json({ error: 'A day is needed.' }, 400);
  const region = searchParams.get('region') === 'world' ? 'world' : 'usa';

  if (!hasStarted(day)) {
    return json({ error: 'That day has not started yet.' }, 403);
  }

  const questions = await storedRound(day, region);
  if (!questions) return json({ day, region, stored: false });

  // A started day never changes, so it may be kept for a while; the browser
  // and the CDN both hold on to it.
  const response = json({ day, region, stored: true, questions });
  response.headers.set('cache-control', 'public, max-age=300, s-maxage=86400');
  return response;
}

export default universal(handler);

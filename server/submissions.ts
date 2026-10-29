/**
 * Questions sent in by players.
 *
 * A player who knows a venue the site does not know about should be able to
 * say so, and a player who has found a wrong coordinate should be able to
 * report it. Both come here.
 */

import {
  clientKey,
  cleanText,
  isBackendConfigured,
  json,
  notConfigured,
  rateLimit,
  supabase,
} from './_lib/backend.ts';


/**
 * A coordinate the player gave, when there is one.
 *
 * `Number(null)` and `Number('')` are both zero, and zero is a number, so a
 * form that was left empty used to be written to the database as the point
 * in the Gulf of Guinea - a real place, and never what was meant. A
 * coordinate has to be a number, and it has to be a place on the globe.
 */
function optionalCoordinate(value: unknown, limit: number): number | null {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  if (number < -limit || number > limit) return null;
  return number;
}

import { universal } from './_lib/node-adapter.ts';

async function handler(request: Request) {
  if (request.method === 'OPTIONS') {
    return json({}, 204);
  }

  if (request.method !== 'POST') {
    return json({ error: 'That is not something this route does.' }, 405);
  }

  // Three a minute from one address. A person sends one.
  if (!rateLimit(clientKey(request), 3, 60_000)) {
    return json({ error: 'Too many submissions. Wait a moment.' }, 429);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'The question could not be read.' }, 400);
  }

  const questionText = cleanText(body.questionText, 400);
  if (questionText.length < 10) {
    return json({ error: 'The question needs a little more to it.' }, 400);
  }

  const submission = {
    question_text: questionText,
    venue: cleanText(body.venue, 120) || null,
    hint: cleanText(body.hint, 120) || null,
    country: cleanText(body.country, 80) || null,
    latitude: optionalCoordinate(body.latitude, 90),
    longitude: optionalCoordinate(body.longitude, 180),
    facts: cleanText(body.facts, 1000) || null,
    submitter_email: cleanText(body.email, 160) || null,
    kind: body.kind === 'correction' ? 'correction' : 'new',
    status: 'new',
  };

  if (!isBackendConfigured()) {
    // Without the database there is nowhere to put it, so the route says so
    // and the form falls back to the visitor's own mail app.
    return json(
      {
        configured: false,
        error: 'Submissions are not set up on this deployment.',
      },
      503,
    );
  }

  const response = await supabase('/rest/v1/question_submissions', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    return json({ error: 'The question could not be saved.' }, 502);
  }

  return json({ configured: true, saved: true });
}

export default universal(handler);


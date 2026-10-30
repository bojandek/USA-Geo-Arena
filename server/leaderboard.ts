/**
 * The global leaderboard.
 *
 * The leaderboard on the site has always been the player's own best rounds.
 * This is the other kind: the best rounds of everybody, for the same day and
 * the same round, so two people can compare.
 *
 * Nobody has to give their name. A score is recorded against a short random
 * name the player chose or was given, and a hash of their device, so the same
 * device cannot fill the board with a hundred entries.
 */

import {
  clientKey,
  cleanHash,
  cleanText,
  isBackendConfigured,
  json,
  notConfigured,
  rateLimit,
  supabase,
} from './_lib/backend.ts';
import {
  isDayKey,
  localDayKey,
  previousDayKey,
  scoreRound,
  type SubmittedAnswer,
} from './_lib/round.ts';


/** The most a round can be worth: 1,300 points and a 1.5Ă— streak. */
const MAX_SCORE = 1950;

/** A name for a player who did not choose one. */
const FALLBACK_NAMES = [
  'Anonymous',
  'A Quiet Fan',
  'Map Reader',
  'The Analyst',
  'Local Knowledge',
  'Corner Seats',
  'Ninety Feet',
  'Baseline Watcher',
];

/**
 * Reads the answers the browser sent.
 *
 * Only what can be used is kept: the id of the question, where the pin was
 * dropped and how long it took. Anything else is dropped on the way in.
 */
function readAnswers(value: unknown): SubmittedAnswer[] {
  if (!Array.isArray(value)) return [];

  const answers: SubmittedAnswer[] = [];
  for (const item of value.slice(0, 50)) {
    if (!item || typeof item !== 'object') continue;
    const raw = item as Record<string, unknown>;
    if (typeof raw.id !== 'string' || !raw.id) continue;

    answers.push({
      id: raw.id.slice(0, 64),
      lat: typeof raw.lat === 'number' ? raw.lat : null,
      lng: typeof raw.lng === 'number' ? raw.lng : null,
      elapsedSeconds: Number(raw.elapsedSeconds) || 0,
      gaveUp: raw.gaveUp === true,
      named: raw.named === true,
    });
  }
  return answers;
}

import { universal } from './_lib/node-adapter.ts';

/** The total from a PostgREST `content-range` header, such as `0-0/123`. */
export function countFromRange(header: string | null): number | null {
  const match = /\/(\d+)$/.exec(header ?? '');
  return match ? Number(match[1]) : null;
}

async function handler(request: Request) {
  if (!isBackendConfigured()) return notConfigured('The global leaderboard');

  if (request.method === 'OPTIONS') {
    return json({}, 204);
  }

  const { searchParams } = new URL(request.url);

  if (request.method === 'GET') {
    const day = cleanText(searchParams.get('day'), 10);
    const region = searchParams.get('region') === 'world' ? 'world' : 'usa';
    const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit')) || 50));

    if (!isDayKey(day)) {
      return json({ configured: true, entries: [], error: 'A day is needed.' }, 400);
    }

    // With a score, the answer is where that score stands among everybody who
    // played the day: how many played, and how many scored less.
    const scoreParam = searchParams.get('score');
    if (scoreParam !== null) {
      const score = Number(scoreParam);
      if (!Number.isFinite(score)) return json({ configured: true, error: 'A score is needed.' }, 400);
      const filter =
        `/rest/v1/global_scores?select=score&limit=1` +
        `&day_key=eq.${encodeURIComponent(day)}` +
        `&region=eq.${encodeURIComponent(region)}`;
      const count = async (extra: string) => {
        const res = await supabase(filter + extra, { headers: { prefer: 'count=exact' } });
        return res.ok ? countFromRange(res.headers.get('content-range')) : null;
      };
      const [players, below] = await Promise.all([count(''), count(`&score=lt.${score}`)]);
      if (players === null || below === null) {
        return json({ configured: true, error: 'The board could not be read.' }, 502);
      }
      return json({ configured: true, day, region, players, below });
    }

    const response = await supabase(
      `/rest/v1/global_scores` +
        `?select=score,accuracy,streak,nickname,created_at` +
        `&day_key=eq.${encodeURIComponent(day)}` +
        `&region=eq.${encodeURIComponent(region)}` +
        `&order=score.desc&limit=${limit}`,
    );

    if (!response.ok) {
      return json({ configured: true, entries: [], error: 'The board could not be read.' }, 502);
    }

    const rows = await response.json();
    return json({
      configured: true,
      day,
      region,
      entries: Array.isArray(rows) ? rows : [],
    });
  }

  if (request.method === 'POST') {
    // Twenty scores a minute from one address is plenty for a person.
    if (!rateLimit(clientKey(request), 20, 60_000)) {
      return json({ error: 'Too many submissions. Wait a moment.' }, 429);
    }

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return json({ error: 'The score could not be read.' }, 400);
    }

    const day = cleanText(body.day, 10);
    if (!isDayKey(day)) {
      return json({ error: 'A day is needed.' }, 400);
    }

    // The board is written in the player's own calendar day, so the server has
    // to be told where the player is. A player in UTC+12 is already on
    // tomorrow while the server is still on today, and reading the day in UTC
    // used to shut them out for the first twelve hours of their day.
    const tzOffset = Number(body.tzOffset);
    const today = localDayKey(Date.now(), Number.isFinite(tzOffset) ? tzOffset : 0);
    // Yesterday is allowed too: the clock can turn over between the round
    // being finished and the score being sent.
    if (day !== today && day !== previousDayKey(today)) {
      return json({ error: 'That round is not from today.' }, 400);
    }

    const region = body.region === 'world' ? 'world' : 'usa';
    const streak = Math.max(0, Math.min(9999, Math.floor(Number(body.streak) || 0)));

    // The score is not taken from the browser. The guesses are, and the round
    // is worked out again here, from the same answer key the game used.
    const answers = readAnswers(body.answers);
    if (answers.length === 0) {
      return json({ error: 'The round could not be read.' }, 400);
    }

    const result = scoreRound({
      day,
      region,
      answers,
      streak,
      hintCost: Number(body.hintCost) || 0,
    });

    if (result.counted === 0) {
      return json({ error: "That round does not match today's questions." }, 400);
    }

    const score = Math.min(result.score, MAX_SCORE);
    if (score <= 0) {
      return json({ error: 'A score is needed.' }, 400);
    }

    // A name is optional. When there is none, one is picked at random so the
    // board does not read as a list of blanks.
    const chosen = cleanText(body.nickname, 24);
    const nickname =
      chosen || FALLBACK_NAMES[Math.floor(Math.random() * FALLBACK_NAMES.length)];

    // The device hash is what stops one device filling the board. It is
    // produced in the browser and is never linked to anything else.
    const playerHash = cleanHash(body.playerHash, 64);
    if (!playerHash) {
      return json({ error: 'The score could not be identified.' }, 400);
    }

    // The best round of the day is what stays on the board. A replay that
    // scored less is not written at all, and a replay that scored more
    // replaces the earlier one.
    const previous = await supabase(
      `/rest/v1/global_scores?select=score` +
        `&day_key=eq.${encodeURIComponent(day)}` +
        `&region=eq.${encodeURIComponent(region)}` +
        `&player_hash=eq.${encodeURIComponent(playerHash)}` +
        `&limit=1`,
    );

    if (previous.ok) {
      const rows = await previous.json();
      const kept = Array.isArray(rows) && rows.length > 0 ? Number(rows[0].score) : 0;
      if (Number.isFinite(kept) && kept >= score) {
        return json({ configured: true, saved: true, kept: true, score: kept });
      }
    }

    // The write is an upsert: one row per day, per round, per device. A
    // plain insert answered 409 the second time a player played the same
    // day, so the board never saw the better round and the player was told
    // the score could not be saved.
    const response = await supabase(
      '/rest/v1/global_scores?on_conflict=day_key,region,player_hash',
      {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
          day_key: day,
          region,
          score,
          max_score: result.maxScore,
          accuracy: result.accuracy,
          streak,
          nickname,
          player_hash: playerHash,
        }),
      },
    );

    if (!response.ok) {
      return json({ error: 'The score could not be saved.' }, 502);
    }

    return json({ configured: true, saved: true, kept: false, score });
  }

  return json({ error: 'That is not something this route does.' }, 405);
}

export default universal(handler);


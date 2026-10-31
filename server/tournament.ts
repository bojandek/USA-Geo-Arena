/**
 * Private tournaments.
 *
 * GET  ?code=ABC123            the tournament and its standings
 * POST { action: 'create' }    starts a tournament and hands back its code
 * POST { action: 'submit' }    records one player's round
 *
 * The score of a round is never taken from the browser. The guesses are, and
 * the round is worked out here against the questions the tournament was
 * created with - the same way the global board works.
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
import { readAnswers, scoreQuestions } from './_lib/round.ts';
import {
  cleanCode,
  cleanDays,
  generateCode,
  hasEnded,
  tournamentQuestionIds,
  tournamentQuestions,
} from './_lib/tournament.ts';
import { universal } from './_lib/node-adapter.ts';

interface TournamentRow {
  code: string;
  name: string;
  question_ids: string[];
  created_by: string;
  ends_at: string;
  created_at: string;
}

async function readTournament(code: string): Promise<TournamentRow | null | 'error'> {
  const response = await supabase(
    `/rest/v1/tournaments?select=code,name,question_ids,created_by,ends_at,created_at` +
      `&code=eq.${encodeURIComponent(code)}&limit=1`,
  );
  if (!response.ok) return 'error';
  const rows = await response.json();
  return Array.isArray(rows) && rows.length > 0 ? (rows[0] as TournamentRow) : null;
}

async function readEntries(code: string) {
  const response = await supabase(
    `/rest/v1/tournament_entries?select=nickname,score,accuracy,player_hash,created_at` +
      `&code=eq.${encodeURIComponent(code)}&order=score.desc,created_at.asc&limit=200`,
  );
  if (!response.ok) return null;
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

/**
 * The standings as the browser sees them.
 *
 * The device hashes are not sent back. Each row only says whether it is the
 * device that asked, so the page can point out the player's own row.
 */
function publicEntries(rows: Record<string, unknown>[], playerHash: string) {
  return rows.map((row) => ({
    nickname: String(row.nickname ?? 'Anonymous'),
    score: Number(row.score) || 0,
    accuracy: Number(row.accuracy) || 0,
    createdAt: String(row.created_at ?? ''),
    you: Boolean(playerHash) && row.player_hash === playerHash,
  }));
}

async function handler(request: Request) {
  if (!isBackendConfigured()) return notConfigured('Tournaments');

  if (request.method === 'OPTIONS') return json({}, 204);

  if (request.method === 'GET') {
    const { searchParams } = new URL(request.url);
    const code = cleanCode(searchParams.get('code'));
    if (!code) return json({ error: 'That is not a tournament code.' }, 400);

    const tournament = await readTournament(code);
    if (tournament === 'error') return json({ error: 'The tournament could not be read.' }, 502);
    if (!tournament) return json({ error: 'There is no tournament with that code.' }, 404);

    const entries = await readEntries(code);
    if (!entries) return json({ error: 'The standings could not be read.' }, 502);

    return json({
      configured: true,
      tournament: {
        code: tournament.code,
        name: tournament.name,
        questionIds: tournament.question_ids,
        createdBy: tournament.created_by,
        endsAt: tournament.ends_at,
        ended: hasEnded(tournament.ends_at),
      },
      entries: publicEntries(entries, cleanHash(searchParams.get('player'), 64)),
    });
  }

  if (request.method === 'POST') {
    if (!rateLimit(clientKey(request), 20, 60_000)) {
      return json({ error: 'Too many requests. Wait a moment.' }, 429);
    }

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return json({ error: 'The request could not be read.' }, 400);
    }

    if (body.action === 'create') {
      const name = cleanText(body.name, 40) || 'Private tournament';
      const createdBy = cleanText(body.nickname, 24) || 'A friend';
      const questionIds = tournamentQuestionIds(body.questionIds);
      const endsAt = new Date(Date.now() + cleanDays(body.days) * 86_400_000).toISOString();

      // A code that is already taken is answered with a conflict, and a new
      // one is tried. With 31^6 codes a second try is already very unlikely.
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const code = generateCode();
        const response = await supabase('/rest/v1/tournaments', {
          method: 'POST',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({
            code,
            name,
            question_ids: questionIds,
            created_by: createdBy,
            ends_at: endsAt,
          }),
        });
        if (response.ok) return json({ configured: true, code, endsAt }, 201);
        if (response.status !== 409) break;
      }
      return json({ error: 'The tournament could not be created.' }, 502);
    }

    if (body.action === 'submit') {
      const code = cleanCode(body.code);
      if (!code) return json({ error: 'That is not a tournament code.' }, 400);

      const playerHash = cleanHash(body.playerHash, 64);
      if (!playerHash) return json({ error: 'The round could not be identified.' }, 400);

      const tournament = await readTournament(code);
      if (tournament === 'error') return json({ error: 'The tournament could not be read.' }, 502);
      if (!tournament) return json({ error: 'There is no tournament with that code.' }, 404);
      if (hasEnded(tournament.ends_at)) return json({ error: 'This tournament has closed.' }, 409);

      const answers = readAnswers(body.answers);
      const result = scoreQuestions(tournamentQuestions(tournament.question_ids), answers, {
        hintCost: Number(body.hintCost) || 0,
      });
      if (result.counted === 0) {
        return json({ error: "That round does not match the tournament's questions." }, 400);
      }

      // One round per device. A second round from the same device is ignored
      // rather than replacing the first, so a tournament cannot be practised.
      const response = await supabase('/rest/v1/tournament_entries?on_conflict=code,player_hash', {
        method: 'POST',
        headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
        body: JSON.stringify({
          code,
          player_hash: playerHash,
          nickname: cleanText(body.nickname, 24) || 'Anonymous',
          score: result.score,
          accuracy: result.accuracy,
        }),
      });
      if (!response.ok) return json({ error: 'The round could not be saved.' }, 502);

      const entries = await readEntries(code);
      return json({
        configured: true,
        saved: true,
        score: result.score,
        entries: entries ? publicEntries(entries, playerHash) : [],
      });
    }

    return json({ error: 'That is not something this route does.' }, 400);
  }

  return json({ error: 'That is not something this route does.' }, 405);
}

export default universal(handler);

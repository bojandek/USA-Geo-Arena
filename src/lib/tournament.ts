/**
 * Private tournaments, seen from the browser.
 *
 * The server keeps the tournament and works out every score. The browser
 * only asks for the standings, starts a tournament and sends the guesses of
 * a finished round.
 */

import { getBoardName, playerHash, type BoardAnswer } from './global-board.ts';
import { SITE_URL } from './site-content.ts';

const ENDPOINT = '/api/tournament';

export interface TournamentInfo {
  code: string;
  name: string;
  questionIds: string[];
  createdBy: string;
  endsAt: string;
  ended: boolean;
}

export interface TournamentEntry {
  nickname: string;
  score: number;
  accuracy: number;
  createdAt: string;
  /** True for the row this device played. */
  you: boolean;
}

export type TournamentResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function call<T>(input: string, init?: RequestInit): Promise<TournamentResult<T>> {
  try {
    const response = await fetch(input, init);
    const payload = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
    if (!response.ok) return { ok: false, error: payload?.error ?? 'Something went wrong.' };
    // A page that is not the API (a proxy, an offline shell) answers without JSON.
    if (!payload || typeof payload !== 'object') {
      return { ok: false, error: 'The server could not be reached.' };
    }
    return { ok: true, data: payload };
  } catch {
    return { ok: false, error: 'The server could not be reached.' };
  }
}

/** The tournament with its standings. */
export function fetchTournament(code: string) {
  const query = new URLSearchParams({ code, player: playerHash() });
  return call<{ tournament: TournamentInfo; entries: TournamentEntry[] }>(`${ENDPOINT}?${query}`);
}

/** Starts a tournament and hands back its code. */
export function createTournament(params: { name: string; days: number; questionIds: string[] }) {
  return call<{ code: string; endsAt: string }>(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'create', nickname: getBoardName(), ...params }),
  });
}

/** Sends the guesses of a finished tournament round. */
export function submitTournamentRound(params: {
  code: string;
  answers: BoardAnswer[];
  hintCost: number;
}) {
  return call<{ score: number; entries: TournamentEntry[] }>(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      action: 'submit',
      nickname: getBoardName(),
      playerHash: playerHash(),
      ...params,
      hintCost: Math.max(0, Math.round(params.hintCost)),
    }),
  });
}

/** The guesses of a round, in the shape the server reads. */
export function toBoardAnswers(
  answers: ReadonlyArray<{
    questionId: string;
    guessLat?: number | null;
    guessLng?: number | null;
    elapsedSeconds: number;
    gaveUp?: boolean;
    namedPlace?: unknown;
  }>,
): BoardAnswer[] {
  return answers.map((answer) => ({
    id: answer.questionId,
    lat: typeof answer.guessLat === 'number' ? answer.guessLat : null,
    lng: typeof answer.guessLng === 'number' ? answer.guessLng : null,
    elapsedSeconds: answer.elapsedSeconds,
    gaveUp: answer.gaveUp === true,
    named: Boolean(answer.namedPlace),
  }));
}

/** The address a tournament is joined at. */
export function tournamentUrl(code: string, base: string = SITE_URL): string {
  return `${base.replace(/\/$/, '')}/t/${code}`;
}

/** The key that remembers a device already played a tournament. */
function playedKey(code: string): string {
  return `geoarena-tournament-${code}`;
}

export function markPlayed(code: string): void {
  try {
    localStorage.setItem(playedKey(code), '1');
  } catch {
    // Storage may be unavailable; the server still allows one round.
  }
}

export function hasPlayed(code: string): boolean {
  try {
    return localStorage.getItem(playedKey(code)) === '1';
  } catch {
    return false;
  }
}

/** "2 days left", "5 hours left", "Closed". */
export function timeLeftLabel(endsAt: string, now = Date.now()): string {
  const left = Date.parse(endsAt) - now;
  if (!Number.isFinite(left) || left <= 0) return 'Closed';
  const hours = Math.floor(left / 3_600_000);
  if (hours >= 48) return `${Math.floor(hours / 24)} days left`;
  if (hours >= 1) return `${hours} hour${hours === 1 ? '' : 's'} left`;
  return `${Math.max(1, Math.floor(left / 60_000))} min left`;
}

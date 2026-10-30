/**
 * The global leaderboard, seen from the browser.
 *
 * A score is sent to the server when a round is finished, and the board is
 * read back from it. If the server is not there, the site carries on without
 * one - the personal leaderboard still works.
 */

import { todayKey } from './date-utils.ts';

export interface GlobalEntry {
  score: number;
  accuracy: number;
  streak: number;
  nickname: string;
  created_at: string;
}

export interface GlobalBoard {
  /** True when the server can answer. */
  configured: boolean;
  /** True when the board was read successfully. */
  loaded: boolean;
  entries: GlobalEntry[];
  error: string | null;
}

const ENDPOINT = '/api/leaderboard';
const PLAYER_KEY = 'geoarena-player';

/**
 * A short hash of the device, so one device cannot fill the board.
 *
 * The name is never sent anywhere. The hash is not a fingerprint either - it
 * exists so that the same device cannot post the same round a hundred times,
 * and it is not connected to anything else that is stored.
 */
function playerHash(): string {
  if (typeof localStorage === 'undefined') return '';
  try {
    const existing = localStorage.getItem(PLAYER_KEY);
    if (existing) return existing;

    const seed = `${navigator.userAgent}|${screen.width}x${screen.height}|${Date.now()}|${Math.random()}`;
    let hash = 0x811c9dc5;
    for (let index = 0; index < seed.length; index += 1) {
      hash ^= seed.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    const value = `p_${hash.toString(16).padStart(8, '0')}_${Math.floor(Math.random() * 1e9).toString(36)}`;
    localStorage.setItem(PLAYER_KEY, value);
    return value;
  } catch {
    return '';
  }
}

/** The name the player uses on the board. */
export function getBoardName(): string {
  if (typeof localStorage === 'undefined') return '';
  try {
    return localStorage.getItem('geoarena-nickname') ?? '';
  } catch {
    return '';
  }
}

export function setBoardName(name: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const clean = name.trim().slice(0, 24);
    if (clean) localStorage.setItem('geoarena-nickname', clean);
    else localStorage.removeItem('geoarena-nickname');
  } catch {
    // Storage may be unavailable.
  }
}

/** Reads the board for a day and a region. */
export async function fetchGlobalBoard(
  day: string = todayKey(),
  region: 'usa' | 'world' = 'usa',
  limit = 50,
): Promise<GlobalBoard> {
  try {
    const response = await fetch(
      `${ENDPOINT}?day=${encodeURIComponent(day)}&region=${region}&limit=${limit}`,
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as {
        configured?: boolean;
        error?: string;
      };
      return {
        configured: payload.configured !== false,
        loaded: false,
        entries: [],
        error: payload.error ?? 'The board could not be read.',
      };
    }

    const payload = (await response.json()) as {
      configured?: boolean;
      entries?: GlobalEntry[];
    };

    return {
      configured: payload.configured !== false,
      loaded: true,
      entries: Array.isArray(payload.entries) ? payload.entries : [],
      error: null,
    };
  } catch {
    return {
      configured: false,
      loaded: false,
      entries: [],
      error: 'The board could not be reached.',
    };
  }
}

/** Where a score stands among everybody who played the same round. */
export interface BoardStanding {
  /** How many players are on the board, the player included. */
  players: number;
  /** How many of them scored less. */
  below: number;
}

/**
 * The share of the other players a score beat, as a whole percentage, or null
 * when there is nobody else to compare with yet.
 */
export function betterThanPercent(standing: BoardStanding | null): number | null {
  if (!standing || standing.players < 2) return null;
  const others = standing.players - 1;
  const below = Math.max(0, Math.min(others, standing.below));
  return Math.floor((below / others) * 100);
}

/** Asks the board where a score stands on a day. Null when it cannot answer. */
export async function fetchStanding(
  day: string,
  region: 'usa' | 'world',
  score: number,
): Promise<BoardStanding | null> {
  try {
    const response = await fetch(
      `${ENDPOINT}?day=${encodeURIComponent(day)}&region=${region}&score=${encodeURIComponent(String(score))}`,
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as { players?: unknown; below?: unknown };
    const players = Number(payload.players);
    const below = Number(payload.below);
    if (!Number.isFinite(players) || !Number.isFinite(below)) return null;
    return { players, below };
  } catch {
    return null;
  }
}

/**
 * One answered question, as it is sent to the board.
 *
 * The guesses go up, not the score. The server works the round out again
 * from the guesses and the answer key, so a number claimed by the browser
 * never reaches the board.
 */
export interface BoardAnswer {
  /** The id of the question that was answered. */
  id: string;
  /** Where the player dropped the pin. Null when they gave up. */
  lat: number | null;
  lng: number | null;
  /** How long the player took, in seconds. */
  elapsedSeconds: number;
  /** True when the player gave the question up. */
  gaveUp?: boolean;
  /** True when the player named the place instead of dropping a pin. */
  named?: boolean;
}

/** The result of putting a round on the board. */
export interface BoardResult {
  ok: boolean;
  error: string | null;
  /** False when the board is not set up on this deployment. */
  configured: boolean;
}

/**
 * How far the device is from UTC, in minutes.
 *
 * The board is written in the player's own calendar day, so the server has to
 * know what day it is where the player is. A player in UTC+12 is already on
 * tomorrow while the server is still on today, and without this the server
 * would refuse the score as a day that has not happened yet.
 */
function localOffsetMinutes(): number {
  try {
    return -new Date().getTimezoneOffset();
  } catch {
    return 0;
  }
}

/**
 * Puts a finished round on the board.
 *
 * The round is sent as the guesses that were made, and the server decides
 * what it was worth. A round that is already on the board is replaced only
 * when the new one is better, so the player sees one row and the board keeps
 * the best of the day.
 */
export async function submitGlobalScore(params: {
  day?: string;
  region?: 'usa' | 'world';
  answers: BoardAnswer[];
  /** The streak the player was on when the round was played. */
  streak?: number;
  /** The points spent on hints during the round. */
  hintCost?: number;
}): Promise<BoardResult> {
  const hash = playerHash();
  if (!hash) {
    return { ok: false, error: 'This device could not be identified.', configured: true };
  }

  const streak = Math.max(0, Math.min(9999, Math.floor(Number(params.streak) || 0)));

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        day: params.day ?? todayKey(),
        region: params.region ?? 'usa',
        tzOffset: localOffsetMinutes(),
        answers: params.answers,
        streak,
        hintCost: Math.max(0, Math.round(params.hintCost ?? 0)),
        nickname: getBoardName(),
        playerHash: hash,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      configured?: boolean;
      error?: string;
    };

    if (!response.ok) {
      return {
        ok: false,
        error: payload.error ?? 'The score could not be saved.',
        configured: payload.configured !== false,
      };
    }

    return { ok: true, error: null, configured: payload.configured !== false };
  } catch {
    return { ok: false, error: 'The score could not be saved.', configured: false };
  }
}

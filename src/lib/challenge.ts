/**
 * The "beat my friend" challenge.
 *
 * The score to beat travels inside the link itself, so there is no server
 * involved: the address is the whole message. Everybody who opens it plays
 * the same ten questions, because the questions are the same for everybody on
 * a given day, and the round is over before they can change them.
 *
 * This is the mechanic that spreads a daily game: the person who was beaten
 * sends a link back.
 */

import { SITE_URL } from './site-content.ts';
import { DEFAULT_REGION, type RegionId } from './regions.ts';

/** The parameter the score to beat travels in. */
export const CHALLENGE_PARAM = 'beat';

/** The biggest score a challenge can carry. A round is worth 1,000 points. */
export const MAX_CHALLENGE_SCORE = 1000;

export type ChallengeOutcome = 'won' | 'lost' | 'tie';

/**
 * The address that carries the challenge.
 *
 * The region is kept, so a challenge to the world round does not send
 * somebody to the American one.
 */
export function buildChallengeUrl(
  score: number,
  region: RegionId = DEFAULT_REGION,
  base: string = SITE_URL,
): string {
  const value = Math.max(0, Math.min(MAX_CHALLENGE_SCORE, Math.round(Number(score) || 0)));
  const path = region === DEFAULT_REGION ? '/daily' : '/world';
  const url = new URL(path, base.endsWith('/') ? base : `${base}/`);
  url.searchParams.set(CHALLENGE_PARAM, String(value));
  return url.toString();
}

/**
 * The score to beat, read from the address.
 *
 * Anything that is not a number within the possible range is ignored, so a
 * mangled link still opens the game.
 */
export function readChallengeScore(
  search: string | URLSearchParams | null | undefined,
): number | null {
  if (!search) return null;
  const params =
    typeof search === 'string'
      ? new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
      : search;
  const raw = params.get(CHALLENGE_PARAM);
  if (raw === null) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0 || value > MAX_CHALLENGE_SCORE) return null;
  return Math.round(value);
}

/**
 * How the round went against the score to beat.
 */
export function challengeOutcome(
  challengeScore: number,
  yourScore: number,
): ChallengeOutcome | null {
  if (!Number.isFinite(challengeScore) || !Number.isFinite(yourScore)) return null;
  if (yourScore > challengeScore) return 'won';
  if (yourScore < challengeScore) return 'lost';
  return 'tie';
}

/**
 * The sentence shown to the player who opened a challenge.
 */
export function challengeHeadline(outcome: ChallengeOutcome | null): string {
  switch (outcome) {
    case 'won':
      return 'You beat it! 🎉';
    case 'lost':
      return 'So close!';
    case 'tie':
      return 'Exactly the same!';
    default:
      return '';
  }
}

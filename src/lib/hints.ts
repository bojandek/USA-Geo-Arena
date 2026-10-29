/**
 * The hints, and what they cost.
 *
 * A hint that is free and instant is not a hint, it is part of the question.
 * Here the first one has to be waited for, and the ones after it are bought
 * with points, so a player who is stuck has a real choice to make: spend
 * some of the round, or guess and take the risk.
 *
 * The tiers are ordered by how much they narrow the answer down, and the cost
 * rises with them.
 */

import type { Question } from './question-types.ts';

export interface HintTier {
  /** What the tier is called, e.g. "Country". */
  label: string;
  /** What the player is told. */
  text: string;
  /** What the tier costs in points. Zero means it is free. */
  cost: number;
}

/**
 * How long the player has to wait for the free hint.
 *
 * A round is 30 seconds. Waiting ten seconds leaves twenty seconds to use the
 * clue, so the hint helps with the guess instead of eating the whole question.
 */
export const FREE_HINT_DELAY_SECONDS = 10;

/**
 * The hints for a question, cheapest first.
 *
 * A question without a venue simply has one tier fewer: there is nothing to
 * give away about a name that is not recorded.
 */
export function buildHintTiers(question: Question): HintTier[] {
  const tiers: HintTier[] = [];

  if (question.hint) {
    tiers.push({ label: 'Clue', text: question.hint, cost: 0 });
  }
  if (question.country) {
    tiers.push({ label: 'Country', text: question.country, cost: 10 });
  }
  if (question.venue) {
    tiers.push({ label: 'The venue is called', text: question.venue, cost: 20 });
  }

  return tiers;
}

/**
 * The next hint the player could take, or null when there are none left.
 */
export function nextHint(tiers: HintTier[], revealed: number): HintTier | null {
  if (!Array.isArray(tiers)) return null;
  if (revealed < 0 || revealed >= tiers.length) return null;
  return tiers[revealed];
}

/**
 * How many seconds the player still has to wait for the free hint.
 * Pro users get it instantly.
 */
export function secondsUntilFreeHint(
  revealed: number,
  elapsedSeconds: number,
  isProUser = false,
): number {
  if (revealed > 0) return 0;
  if (isProUser) return 0;
  return Math.max(0, Math.ceil(FREE_HINT_DELAY_SECONDS - elapsedSeconds));
}

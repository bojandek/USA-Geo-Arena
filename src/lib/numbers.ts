/**
 * Number helpers shared by the scoring code.
 */

/**
 * Rounds a score to two decimal places.
 *
 * Scores are sums of floating point numbers, so adding them up can leave a
 * value like 321.000000003 behind. Rounding at every step keeps the number
 * the player sees the same as the number that is stored.
 */
export function roundScore(value: number): number {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.round(number * 100) / 100;
}

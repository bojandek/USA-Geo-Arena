/**
 * The short buzz a phone makes.
 *
 * Only phones have them, and every browser that has them ignores the request
 * unless the visitor has allowed it, so this is always safe to call.
 *
 * The buzz follows the sound preference: a visitor who has turned the sound
 * off has asked for less noise, and a vibration is noise you cannot silence.
 */

export type HapticName = 'tap' | 'correct' | 'wrong' | 'celebrate';

const HAPTICS: Record<HapticName, number | number[]> = {
  tap: 8,
  correct: [12, 40, 18],
  wrong: [28, 60, 28],
  celebrate: [16, 50, 16, 50, 40],
};

export function vibrate(name: HapticName, enabled: boolean = true): void {
  if (!enabled) return;
  if (typeof navigator === 'undefined') return;
  if (typeof navigator.vibrate !== 'function') return;
  try {
    navigator.vibrate(HAPTICS[name]);
  } catch {
    // Some browsers refuse the request. It is not worth reporting.
  }
}
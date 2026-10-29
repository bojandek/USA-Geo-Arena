/**
 * First-visit onboarding.
 *
 * A new player lands on a map with nothing telling them what to do, and that
 * is the moment most of them leave. The overlay that explains the game is
 * shown once, and the fact that it was seen is kept in local storage next to
 * the rest of the player's progress.
 *
 * The copy lives here rather than in the component so it can be checked by
 * the tests and reused anywhere else.
 */

const ONBOARDING_STORAGE_KEY = 'geoarena-onboarded';

export interface OnboardingStep {
  emoji: string;
  title: string;
  body: string;
}

/** The steps the overlay walks a new player through. */
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    emoji: '🖱️',
    title: 'Click the map to guess',
    body: 'Every question points at a place in sport. Click where you think it is, then confirm your guess.',
  },
  {
    emoji: '🎯',
    title: 'Closer is worth more',
    body: 'A question is worth up to 100 points, and the closer your guess is, the more of those points you keep.',
  },
  {
    emoji: '📅',
    title: 'Ten questions a day',
    body: 'Everyone gets the same ten questions each day. Finish them to keep your streak alive.',
  },
  {
    emoji: '🔥',
    title: 'Build your streak',
    body: 'Play every day to grow your streak. Every seven days earns a freeze that covers one day you miss.',
  },
];

/** True when the player has already been through the introduction. */
export function hasSeenOnboarding(): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === '1';
  } catch {
    // Storage may be unavailable (private mode / quota).
    return false;
  }
}

/** Remembers that the introduction has been seen. */
export function markOnboardingSeen(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, '1');
  } catch {
    // Storage may be unavailable - the overlay simply shows again next time.
  }
}

/** Puts the introduction back, so it can be watched again. */
export function resetOnboarding(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch {
    // Nothing to do.
  }
}
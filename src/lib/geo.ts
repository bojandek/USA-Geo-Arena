/**
 * Which way the player missed it.
 *
 * "42 km away" tells a player they were wrong but not what to change. Knowing
 * that the answer was to the north-east says something a number cannot: next
 * time, go that way.
 *
 * The maths lives here, away from React, so it can be tested.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Below this the direction is noise. Inside 25 km the guess already counts as
 * a hit, so telling someone they should have gone a bit further north-east
 * would be pedantic.
 */
export const DIRECTION_FEEDBACK_MIN_KM = 25;

/**
 * Above this the direction stops being useful. A guess 900 km to the north
 * needs a rethink, not a nudge.
 */
export const DIRECTION_FEEDBACK_MAX_KM = 500;

const COMPASS = [
  { label: 'north', arrow: '↑' },
  { label: 'north-east', arrow: '↗' },
  { label: 'east', arrow: '→' },
  { label: 'south-east', arrow: '↘' },
  { label: 'south', arrow: '↓' },
  { label: 'south-west', arrow: '↙' },
  { label: 'west', arrow: '←' },
  { label: 'north-west', arrow: '↖' },
] as const;

export interface CompassDirection {
  /** The name of the direction, such as "north-east". */
  label: string;
  /** An arrow that points that way. */
  arrow: string;
}

/** Brings an angle back into the range 0 to 360. */
export function normalizeDegrees(degrees: number): number {
  if (!Number.isFinite(degrees)) return 0;
  return ((degrees % 360) + 360) % 360;
}

/**
 * The compass direction that points from one place to another.
 *
 * The direction is the one the player has to travel, so it runs from the
 * guess to the answer, not the other way round.
 */
export function bearingBetween(from: LatLng, to: LatLng): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  return normalizeDegrees((Math.atan2(y, x) * 180) / Math.PI);
}

/**
 * The nearest of the eight compass points.
 *
 * The eight points are used rather than the sixteen because a player who was
 * told "east-south-east" would have to stop and work out what that means.
 */
export function compassDirection(bearing: number): CompassDirection {
  const index = Math.round(normalizeDegrees(bearing) / 45) % COMPASS.length;
  return COMPASS[index];
}

/**
 * A sentence telling the player which way the answer lay.
 *
 * It returns null when the direction would not help: a perfect guess has no
 * direction to give, and a miss so far away that the player was simply in the
 * wrong part of the world is not fixed by being told which way to walk.
 */
export function describeMiss(
  guess: LatLng,
  truth: LatLng,
  distanceKm: number,
): string | null {
  if (!Number.isFinite(distanceKm)) return null;
  if (distanceKm <= DIRECTION_FEEDBACK_MIN_KM) return null;
  if (distanceKm > DIRECTION_FEEDBACK_MAX_KM) return null;

  const direction = compassDirection(bearingBetween(guess, truth));
  return `You needed to head ${direction.label}.`;
}

/**
 * The same sentence, with the arrow that shows the way.
 */
export function describeMissWithArrow(
  guess: LatLng,
  truth: LatLng,
  distanceKm: number,
): { text: string; arrow: string } | null {
  if (!Number.isFinite(distanceKm)) return null;
  if (distanceKm <= DIRECTION_FEEDBACK_MIN_KM) return null;
  if (distanceKm > DIRECTION_FEEDBACK_MAX_KM) return null;

  const direction = compassDirection(bearingBetween(guess, truth));
  return {
    text: `You needed to head ${direction.label}`,
    arrow: direction.arrow,
  };
}
/**
 * Regions.
 *
 * A region decides two things at once: which questions a round is drawn from,
 * and how the map is framed while the player is hunting for the answer.
 *
 * The American round is the one the site opens with: it draws only from
 * American questions and locks the map to the continental United States,
 * which is what a player who only knows American sport actually wants to see.
 * The world round is a click away - the questions are from everywhere except
 * the United States, and the map is framed on the whole planet.
 */

import type { Question } from './question-types.ts';

export type RegionId = 'world' | 'usa';

/**
 * How the map draws the planet.
 *
 * `globe` is the sphere: the world round opens on a globe, which reads as
 * "the whole planet" at a glance and lets the player spin it. `mercator` is
 * the flat map, which is the right thing for a single country - a sphere
 * showing one country is mostly empty space.
 */
export type RegionProjection = 'globe' | 'mercator';

export interface RegionView {
  /** Map centre, as [longitude, latitude]. */
  center: [number, number];
  zoom: number;
  /**
   * The area the map is framed on when the round starts.
   *
   * The map fits this box rather than sitting at a fixed zoom, so the whole
   * country - or the whole planet - is on the screen on a phone and on a
   * desktop alike.
   */
  fit?: [[number, number], [number, number]];
  /**
   * The projection the round is played on. Defaults to the flat map.
   */
  projection?: RegionProjection;
  /**
   * Extra zoom applied to the globe after it is fitted to the screen.
   *
   * The fitted globe shows the whole planet, which is useful but small. The
   * world round starts closer, with Europe and Africa filling the view.
   */
  globeZoomBoost?: number;
  /**
   * The box the player cannot pan out of, as [[west, south], [east, north]].
   * Null means the whole world is reachable.
   *
   * It is deliberately larger than the framed area: a stadium on the border
   * with Canada, in Florida or in Mexico has to be reachable, and the player
   * needs room to pan towards it.
   */
  bounds: [[number, number], [number, number]] | null;
}

export interface Region {
  id: RegionId;
  label: string;
  /** Used where there is no room for the full name. */
  shortLabel: string;
  emoji: string;
  /** The countries in the region. `null` means every country in the pool. */
  countries: string[] | null;
  /**
   * Countries that are left out of the region.
   *
   * The world round uses this to keep the American questions out: they have
   * their own round, and a world round that is half American is neither.
   */
  excludeCountries?: string[];
  view: RegionView;
}

export const REGIONS: Region[] = [
  {
    id: 'usa',
    label: 'United States',
    shortLabel: 'USA',
    emoji: '🇺🇸',
    countries: ['United States'],
    view: {
      center: [-96, 38],
      zoom: 3.4,
      // One country on a sphere is mostly empty space, so the American round
      // stays on the flat map.
      projection: 'mercator',
      // The country itself, from the Pacific coast to the Atlantic and from
      // the Canadian border down to the Gulf. The map is framed on this, so
      // the whole of it is on the screen with room to spare.
      fit: [
        [-125.5, 24.5],
        [-66.5, 50],
      ],
      // How far the player may pan. It is much larger than the framed area
      // on purpose: a ground just over the border with Canada, in Florida or
      // in Mexico has to be reachable, and there has to be room to get there.
      //
      // Alaska and Hawaii are in here as well. They are far from the rest of
      // the country, but they are part of it, and a player has to be able to
      // reach a question about Anchorage or Honolulu.
      bounds: [
        [-172, 18],
        [-58, 71.5],
      ],
    },
  },
  {
    id: 'world',
    label: 'World',
    shortLabel: 'World',
    emoji: '🌍',
    countries: null,
    // The American questions have their own round. Mixing them into the
    // world round meant that half of it was about American football, which
    // put off everybody who was not American and added nothing for those
    // who were.
    excludeCountries: ['United States'],
    view: {
      // The middle of the framed world, so the map is already showing the
      // whole planet in the first frame - before the map has loaded and the
      // box below can be fitted to the screen. The globe leans towards
      // Europe and Africa, the part of the world most players read first.
      center: [20, 15],
      zoom: 0.6,
      // The world round is a globe. A flat map of the whole planet is a strip
      // that wraps around itself; the sphere is what "the world" looks like,
      // it never repeats the planet, and at this zoom it fits a phone screen
      // as well as a desktop one.
      projection: 'globe',
      // Start closer than the fitted whole planet, with Europe and Africa
      // filling the view instead of a small ball in the middle.
      globeZoomBoost: 1.05,
      // The frame a flat map would use, if the round were ever played on one.
      // The globe is framed by its own size instead - see `globeFrame` in
      // map-framing - because a sphere fitted with bounds comes out a
      // different size on every screen. This box still describes the world
      // the round covers, and the tests check that every question is inside
      // it.
      fit: [
        [-180, -58],
        [180, 78],
      ],
      // Nothing to pan out of: the world round is the whole world.
      bounds: null,
    },
  },
];

/**
 * The continental United States, as a box.
 *
 * This is the country as most people picture it: the mainland, from the
 * Pacific coast to the Atlantic, and from the Canadian border down to the
 * Gulf of Mexico. Alaska and Hawaii lie outside it.
 */
export const CONTINENTAL_USA: [[number, number], [number, number]] = [
  [-125.5, 24.5],
  [-66.5, 50],
];

/** The two American states that are not on the mainland. */
export type OutlyingState = 'Alaska' | 'Hawaii';

/** True when the point lies outside the continental United States. */
export function isOutsideContinentalUsa(lat: number, lng: number): boolean {
  const [west, south] = CONTINENTAL_USA[0];
  const [east, north] = CONTINENTAL_USA[1];
  return lng < west || lng > east || lat < south || lat > north;
}

/**
 * Which outlying state a point is in, if it is in one.
 *
 * Alaska lies to the north and west of the mainland, and Hawaii lies far out
 * in the Pacific to the south west, so the two are easy to tell apart. The
 * bounds are drawn so that a question about Madrid or about northern Canada
 * is never mistaken for one of them.
 */
export function outlyingStateFor(lat: number, lng: number): OutlyingState | null {
  if (lat > 52 && lng < -129) return 'Alaska';
  if (lat < 30 && lng < -140) return 'Hawaii';
  return null;
}

/**
 * Which outlying state a question belongs to.
 *
 * The country is checked as well, because a question about somewhere else
 * that happens to lie outside the continental United States is not an
 * American question at all.
 */
export function outlyingStateForQuestion(question: Question): OutlyingState | null {
  if (question.country !== 'United States') return null;
  return outlyingStateFor(question.lat, question.lng);
}

/**
 * The area the player may pan to, for the question on screen.
 *
 * The map never travels to the answer on its own - flying to Honolulu for
 * a question about Honolulu gives the answer away. A question in Alaska or
 * Hawaii therefore gets a limit wide enough for the player to pan there
 * from the mainland.
 */
export function boundsForQuestion(
  question: Question | null,
  region: RegionId,
): [[number, number], [number, number]] | null {
  if (region === 'world') return null;

  // A question in Alaska or Hawaii can be panned to, all the way from the
  // mainland.
  if (question && outlyingStateForQuestion(question)) {
    return [
      [-172, 18],
      [-58, 71.5],
    ];
  }

  // The mainland, with room to pan over the border with Canada, and into
  // Florida and Mexico.
  return [
    [-133, 19],
    [-58, 53.5],
  ];
}

/**
 * The round the site opens with.
 *
 * The American round is the one that comes first: the map opens on the
 * United States and the questions are about American sport. The world round
 * is one click away in the menu at the top of the game.
 */
export const DEFAULT_REGION: RegionId = 'usa';

/**
 * A pan limit in the flat `[west, south, east, north]` form the map takes.
 *
 * The region describes its limit as a pair of corners, because that is how it
 * is read; the map wants the four numbers in a row. Null means no limit, and
 * becomes undefined so the map is left unconstrained.
 */
export function toBoundsArray(
  bounds: [[number, number], [number, number]] | null,
): [number, number, number, number] | undefined {
  if (!bounds) return undefined;
  return [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]];
}

/**
 * The address of a region's round.
 *
 * The American round is the one at `/daily`; every other round has an address
 * of its own, named after it (`/world`). A round is never carried in a query
 * string: `/daily?region=world` leaves the menu highlighting the American
 * round and gives the world round an address that is not its own, which is
 * how a player ended up looking at an American map on a world question.
 */
export function regionPath(region: RegionId): string {
  return region === DEFAULT_REGION ? '/daily' : `/${region}`;
}

/** True when the value is one of the known region ids. */
export function isRegionId(value: unknown): value is RegionId {
  return typeof value === 'string' && REGIONS.some((region) => region.id === value);
}

/** Looks a region up, falling back to the default one. */
export function getRegion(id: string | null | undefined): Region {
  return REGIONS.find((region) => region.id === id) ?? REGIONS[0];
}

/** The questions that belong to a region. */
export function questionsForRegion(
  pool: Question[],
  region: Region | RegionId,
): Question[] {
  const resolved = typeof region === 'string' ? getRegion(region) : region;
  const allowed = resolved.countries ? new Set(resolved.countries) : null;
  const excluded = resolved.excludeCountries ? new Set(resolved.excludeCountries) : null;
  if (!allowed && !excluded) return pool;

  return pool.filter((question) => {
    if (allowed) return allowed.has(question.country);
    if (excluded) return !excluded.has(question.country);
    return true;
  });
}

/**
 * A small stable hash of the region id.
 *
 * It is mixed into the daily seed so that every region has its own set of ten
 * questions on any given day, while staying completely deterministic.
 */
export function regionSeed(id: RegionId): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

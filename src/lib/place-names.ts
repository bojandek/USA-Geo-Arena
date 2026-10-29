/**
 * Matching the name of a place on the map to the answer of a question.
 *
 * The map draws the names of towns and cities. A player who recognises the
 * name can answer by clicking on it rather than by dropping a pin on the
 * right pixel - which matters most in Alaska and in Hawaii, where the place
 * names are the only thing on the screen and the pin has to land in the
 * right few hundred metres.
 *
 * The names that count as the answer come from the question itself: the
 * venue, the hint, and the place named in the wording ("Where is the Ector
 * Sports Center in Anchorage?"). The place name on the map is then matched
 * against those.
 *
 * A name alone is not enough. The label of a state or a country is also a
 * name, and it is nowhere near the ground the question is about, so a name
 * that is too far away from the answer is refused.
 */

import type { Question } from './question-types.ts';

/**
 * The words that describe the kind of place rather than the place itself.
 *
 * They are dropped when a venue name is broken up, so that "Wembley Stadium"
 * also answers to "Wembley" but "Ector Sports Center" does not answer to
 * "Center".
 */
const GENERIC_WORDS = new Set([
  'airport',
  'arena',
  'arene',
  'ballpark',
  'bowl',
  'campo',
  'centre',
  'center',
  'championship',
  'champions',
  'classic',
  'coliseum',
  'colosseum',
  'complex',
  'conference',
  'court',
  'courts',
  'cup',
  'derby',
  'estadio',
  'field',
  'fields',
  'final',
  'finals',
  'garden',
  'gardens',
  'ground',
  'grounds',
  'hall',
  'international',
  'league',
  'match',
  'memorial',
  'municipal',
  'national',
  'olympic',
  'olympics',
  'open',
  'pala',
  'palace',
  'park',
  'pavilion',
  'prix',
  'race',
  'racing',
  'rink',
  'series',
  'sport',
  'sports',
  'stade',
  'stadia',
  'stadion',
  'stadium',
  'super',
  'theatre',
  'theater',
  'tour',
  'track',
  'university',
  'velodrome',
  'world',
]);

/**
 * The months, which turn up in the wording of a question ("Where is the Super
 * Bowl in February?") and are not places at all.
 */
const MONTHS = new Set([
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]);

/**
 * How far the name of a place may be from the answer and still count.
 *
 * A city label sits in the middle of the city, so it is a few kilometres
 * from the ground in the middle of it - and at worst a few tens of
 * kilometres away, when the ground is out at the edge of the city.
 *
 * The label of a whole state or a whole country is hundreds of kilometres
 * away, because it is written in the middle of the state. That is what
 * separates "Anchorage", which is the answer, from "Alaska", which is only
 * the state the answer is in.
 */
export const NAMED_ANSWER_RADIUS_KM = 100;

/**
 * Puts a place name into a shape that can be compared with another one.
 *
 * The accents go, so that "Nomé" and "Nome" are the same place; the
 * punctuation goes, so that "Kailua-Kona" and "Kailua Kona" are the same
 * place; and the case goes, so that the map and the question can be written
 * differently.
 */
export function normalizePlaceName(raw: string): string {
  if (!raw) return '';
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’'`´]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * The place named in the wording of a question.
 *
 * "Where is the Ector Sports Center in Anchorage?" names Anchorage, and so
 * does "Where is Lahaina on Maui?". Only a name that starts with a capital
 * is taken, so that "in the middle of the field" does not turn into a place
 * called "Middle".
 */
const PLACE_IN_TEXT =
  /\b(?:in|on|at|near)\s+([\p{Lu}][\p{L}\p{N}'’.-]*(?:\s+[\p{Lu}][\p{L}\p{N}'’.-]*)*)/u;
/**
 * The names that count as the answer to a question.
 *
 * They are already normalised, so they can be compared with another
 * normalised name directly.
 */
export function answerNamesFor(question: Question): string[] {
  const names = new Set<string>();

  const add = (value: string | undefined | null): void => {
    const name = normalizePlaceName(value ?? '');
    if (name.length >= 3) names.add(name);
  };

  const venue = question.venue;
  if (venue) {
    add(venue);

    const words = normalizePlaceName(venue).split(' ').filter(Boolean);
    // "Wembley Stadium" also answers to "Wembley".
    if (words.length > 1 && GENERIC_WORDS.has(words[words.length - 1])) {
      add(words.slice(0, -1).join(' '));
    }
    // "Kona Ironman World Championship" also answers to "Kona".
    const meaningful = words.find(
      (word) => word.length >= 4 && !GENERIC_WORDS.has(word),
    );
    if (meaningful) add(meaningful);
  }

  // The hint names the place: "Anchorage, Alaska" is Anchorage. Only the
  // first part is taken - the second is the state, and the state is not the
  // answer.
  if (question.hint) add(question.hint.split(',')[0]);

  // The wording of the question names the place too.
  for (const place of placesNamedIn(question.text)) add(place);

  // Anything the question says outright.
  for (const alias of question.aliases ?? []) add(alias);

  // The country is never the answer - the answer is somewhere inside it.
  names.delete(normalizePlaceName(question.country));

  return [...names].filter((name) => !MONTHS.has(name));
}

/** The distance between two points on the earth, in kilometres. */
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (degrees: number): number => (degrees * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * True when the name on the map is the answer to the question.
 *
 * The place the player clicked is passed in as well as the name: the label of
 * a state is a name too, but it is a long way from the answer, and a name
 * that far away is not the answer.
 */
export function matchesAnswerName(
  clicked: string,
  question: Question,
  click?: { lat: number; lng: number },
): boolean {
  const name = normalizePlaceName(clicked);
  if (!name) return false;
  if (!answerNamesFor(question).includes(name)) return false;

  if (click) {
    const distance = distanceKm(
      click.lat,
      click.lng,
      question.lat,
      question.lng,
    );
    if (distance > NAMED_ANSWER_RADIUS_KM) return false;
  }

  return true;
}

/**
 * The name of a place, read out of a feature the map has drawn.
 *
 * The tiles of the basemap carry the name of the place in a few different
 * fields, depending on which language it is written in, so they are all
 * looked at.
 */
export function placeNameFromFeature(feature: {
  properties?: Record<string, unknown> | null;
}): string | null {
  const properties = feature?.properties ?? {};
  const candidates = [
    properties.name,
    properties.name_en,
    properties['name:latin'],
    properties['name:nonlatin'],
  ];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return null;
}


/** The places named in the wording of a question. */
export function placesNamedIn(text: string): string[] {
  if (!text) return [];
  const cleaned = text.replace(/\s+/g, ' ').trim();
  const match = PLACE_IN_TEXT.exec(cleaned);
  if (!match) return [];

  // "Real Madrid's stadium" is a stadium, not a place called "Real".
  const place = match[1].replace(/['’]s\b.*$/i, '').trim();
  return place ? [place] : [];
}

/**
 * A small fact to show under a question.
 *
 * The question asks where a place is, so the teaser must not contain the
 * venue, the town in the hint, or an alias. A fact that gives the answer away
 * is not a teaser, it is a spoiler. When none of the facts is safe, the card
 * falls back to a category-level line rather than risking the answer.
 */

import type { Question } from './question-types.ts';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'of', 'and', 'at', 'in', 'on', 'de', 'del', 'della',
  'der', 'die', 'das', 'du', 'des', 'la', 'le', 'les', 'el', 'los', 'las',
  'da', 'do', 'dos', 'di', 'van', 'von', 'st', 'saint',
]);

const VENUE_WORDS = new Set([
  'stadium', 'stade', 'arena', 'ground', 'grounds', 'park', 'olympic',
  'olympics', 'national', 'club', 'centre', 'center', 'city', 'circuit',
  'autodromo', 'estadio', 'estadi', 'parc', 'speedway', 'sports', 'sport',
  'complex', 'international', 'grand', 'prix', 'nacional', 'nazionale',
  'olimpico', 'olimpica', 'metropolitano', 'municipal', 'communal',
  'provincial', 'regional', 'central', 'banco', 'street', 'road', 'field',
  'court',
]);

const FALLBACK: Record<Question['category'], string> = {
  stadium: 'A venue with a story of its own.',
  event: 'A moment that belongs in the record books.',
  club: 'A club with a history worth knowing.',
  athlete: 'A performance that made history.',
};

function normalise(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function significantWords(value: string | undefined): string[] {
  return normalise(value ?? '')
    .split(' ')
    .filter(
      (word) =>
        word.length > 3 && !STOP_WORDS.has(word) && !VENUE_WORDS.has(word),
    );
}

/**
 * Words that would turn a teaser into a spoiler for this question.
 */
export function questionSpoilerWords(question: Question): Set<string> {
  return new Set([
    ...significantWords(question.venue),
    ...significantWords(question.hint),
    ...(question.aliases ?? []).flatMap((alias) => significantWords(alias)),
  ]);
}

/**
 * Pick a fact that cannot give the answer away, or a safe category line.
 */
export function questionTeaser(question: Question): string {
  const forbidden = questionSpoilerWords(question);

  const safeFact = question.facts.find((fact) => {
    const factWords = new Set(normalise(fact).split(' '));
    return ![...forbidden].some((word) => factWords.has(word));
  });

  return safeFact?.trim() || FALLBACK[question.category];
}

/**
 * The links that go with a question.
 *
 * A player who has just been told the answer usually wants to know more
 * about the place, and a player who has found a mistake wants to be able to
 * say so. Both need somewhere to go that is not the game itself.
 */

import { CONTACT_EMAIL } from './site-content.ts';
import type { Question } from './question-types.ts';

/**
 * Where to read more about the place, on Wikipedia.
 *
 * The search page is used rather than the article, because the article name
 * is not always the name of the venue: a link that lands on a search result
 * is useful, and a link that lands on the wrong article is not.
 */
export function wikipediaUrl(question: Question): string | null {
  const term = (question.venue || question.hint || '').trim();
  if (!term) return null;
  return `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(term)}`;
}

/**
 * Where to report a question that is wrong.
 *
 * The form on the site is the way in: it reaches the server, so the report
 * is written down and not lost in an inbox. The question is carried in the
 * address, so the form is already filled in when the player arrives.
 */
export function reportPageUrl(question: Question): string {
  const params = new URLSearchParams({
    kind: 'correction',
    question: question.text,
    venue: question.venue ?? '',
    hint: question.hint ?? '',
  });
  return `/submit?${params.toString()}`;
}

/**
 * A message to report a question that is wrong, for the visitor's own mail
 * app. This is the second way in, for the times the server is not set up.
 */
export function reportUrl(question: Question): string {
  const subject = `Question problem: ${question.id}`;
  const body = [
    'Something is wrong with this question in USA GeoArena.',
    '',
    `Question id: ${question.id}`,
    `Question: ${question.text}`,
    `Hint: ${question.hint ?? 'none'}`,
    `Coordinates: ${question.lat}, ${question.lng}`,
    '',
    'What is wrong with it:',
    '',
  ].join('\n');
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
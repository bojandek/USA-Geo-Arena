/**
 * The question pool.
 *
 * The questions are split by category so the pool can keep growing without
 * any single file becoming unreadable. The order here is the order they are
 * offered to the daily generator, which shuffles them with a seed derived
 * from the date - so the split does not affect which questions a player sees.
 */

import type { Question } from './question-types.ts';
import { baseQuestions } from './questions/base.ts';
import { stadiumQuestions } from './questions/stadiums.ts';
import { eventQuestions } from './questions/events.ts';
import { athleteQuestions } from './questions/athletes.ts';
import { usaVenueQuestions } from './questions/usa-venues.ts';
import { usaVenueQuestionsTwo } from './questions/usa-venues-2.ts';
import { usaVenueQuestionsThree } from './questions/usa-venues-3.ts';
import { usaOutlyingQuestions } from './questions/usa-outlying.ts';
import { usaStoryQuestions } from './questions/usa-stories.ts';
import { questionImages } from './question-images.ts';

const allQuestions: Question[] = [
  ...baseQuestions,
  ...stadiumQuestions,
  ...eventQuestions,
  ...athleteQuestions,
  ...usaVenueQuestions,
  ...usaVenueQuestionsTwo,
  ...usaVenueQuestionsThree,
  ...usaOutlyingQuestions,
  ...usaStoryQuestions,
];

/**
 * The pool, with the repeats taken out.
 *
 * Two questions about the same venue are not two questions - the second one
 * would be a free point for anybody who has played before, and a round must
 * never show the same place twice. So the first question about a place is
 * kept and the rest are dropped.
 *
 * Two different places that sit on the very same point are the same problem,
 * so the second one is moved a short way off. Seven hundred metres is well
 * inside the smallest scoring band, so the answer stays right, but the two
 * marks no longer land on the same pixel.
 */
function withoutRepeats(questions: Question[]): Question[] {
  const seenVenues = new Set<string>();
  const seenPoints = new Set<string>();
  const kept: Question[] = [];

  for (const question of questions) {
    const venue = (question.venue ?? '').trim().toLowerCase();
    if (venue && seenVenues.has(venue)) continue;
    if (venue) seenVenues.add(venue);

    let lat = question.lat;
    let lng = question.lng;
    let point = `${lat},${lng}`;
    let tries = 0;
    while (seenPoints.has(point) && tries < 40) {
      lat = Number((lat + 0.0007).toFixed(4));
      lng = Number((lng - 0.0007).toFixed(4));
      point = `${lat},${lng}`;
      tries += 1;
    }
    seenPoints.add(point);

    kept.push(
      tries === 0
        ? question
        : { ...question, lat, lng },
    );
  }

  return kept;
}

/**
 * The pool, with the pictures found on Wikimedia Commons.
 *
 * The images are generated separately (`npm run images:fetch`) so that a
 * question file stays a question, not a gallery with an API key in it. A
 * question without a reliable Commons match simply keeps no picture.
 */
const uniqueQuestions = withoutRepeats(allQuestions);

export const questionPool: Question[] = uniqueQuestions.map((question) => {
  const image = questionImages[question.id];
  return image && !question.image ? { ...question, image } : question;
});

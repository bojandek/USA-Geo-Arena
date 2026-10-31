/**
 * Unit tests for custom rounds, private tournaments and the share links.
 *
 * A custom round lives entirely in its link, so the link has to survive the
 * trip: ids that are made up, repeated or too many are dropped, and the names
 * are cleaned. A tournament is scored on the server, so the helpers that pick
 * its questions and read its code are checked here too.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  CUSTOM_ROUND_MAX,
  buildPlayUrl,
  cleanName,
  decodeRound,
  encodeRound,
  questionsForIds,
  randomIds,
  readPlayParams,
  roundRegion,
  searchPool,
} from '../src/lib/custom-round.ts';
import { questionPool } from '../src/lib/question-pool.ts';
import { shareClipboardText, shareTargetUrl } from '../src/lib/share-links.ts';
import { gridColours } from '../src/lib/result-card.ts';
import { timeLeftLabel, tournamentUrl } from '../src/lib/tournament.ts';
import { scoreQuestions } from '../server/_lib/round.ts';
import {
  CODE_LENGTH,
  cleanCode,
  cleanDays,
  generateCode,
  hasEnded,
  tournamentQuestionIds,
  tournamentQuestions,
} from '../server/_lib/tournament.ts';

/** A random source that always gives the same sequence. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

const ids = questionPool.slice(0, 5).map((question) => question.id);

describe('a custom round travels in its link', () => {
  test('the ids come back the way they went in', () => {
    assert.deepEqual(decodeRound(encodeRound(ids)), ids);
  });

  test('a mangled id is dropped', () => {
    assert.deepEqual(decodeRound('abc.<script>.def'), ['abc', 'def']);
    assert.deepEqual(decodeRound(''), []);
    assert.deepEqual(decodeRound(null), []);
  });

  test('unknown and repeated ids are dropped, and a round never grows past ten', () => {
    const questions = questionsForIds([ids[0], 'not-a-question', ids[0], ids[1]]);
    assert.deepEqual(
      questions.map((question) => question.id),
      [ids[0], ids[1]],
    );
    const many = questionPool.slice(0, 20).map((question) => question.id);
    assert.equal(questionsForIds(many).length, CUSTOM_ROUND_MAX);
  });

  test('the link carries the round, the maker, the name and the score to beat', () => {
    const url = buildPlayUrl({ ids, by: 'Ana', name: 'Ballparks', beat: 812.4 }, 'https://example.com');
    assert.ok(url.startsWith('https://example.com/play?'));
    const round = readPlayParams(new URL(url).search);
    assert.deepEqual(
      round.questions.map((question) => question.id),
      ids,
    );
    assert.equal(round.by, 'Ana');
    assert.equal(round.name, 'Ballparks');
    assert.equal(round.beat, 812);
    assert.equal(round.missing, 0);
  });

  test('a link without a score has nothing to beat', () => {
    const url = buildPlayUrl({ ids }, 'https://example.com');
    assert.equal(readPlayParams(new URL(url).search).beat, null);
  });

  test('the ids that are not in the pool are counted as missing', () => {
    const round = readPlayParams(`?r=${ids[0]}.nope.${ids[1]}`);
    assert.equal(round.questions.length, 2);
    assert.equal(round.missing, 1);
  });

  test('a name loses anything that could break the page', () => {
    assert.equal(cleanName('  <b>Ana</b>  '), 'b Ana b');
    assert.equal(cleanName(42), '');
    assert.equal(cleanName('x'.repeat(60)).length, 24);
  });
});

describe('the round builder', () => {
  test('a search finds a venue by its name', () => {
    const venue = questionPool.find((question) => question.venue)!.venue!;
    const results = searchPool(venue.split(' ')[0]);
    assert.ok(results.some((question) => question.venue === venue));
  });

  test('a search that matches nothing finds nothing', () => {
    assert.deepEqual(searchPool('zzzzqqqq'), []);
  });

  test('an empty search shows the start of the pool', () => {
    assert.equal(searchPool('', 7).length, 7);
  });

  test('a random round is the same for the same random source and skips the picked ids', () => {
    const first = randomIds(5, [ids[0]], seeded(7));
    const second = randomIds(5, [ids[0]], seeded(7));
    assert.deepEqual(first, second);
    assert.equal(new Set(first).size, 5);
    assert.ok(!first.includes(ids[0]));
  });

  test('a round inside the United States is played on the American map', () => {
    const american = questionPool.filter((question) => question.country === 'United States').slice(0, 3);
    const abroad = questionPool.find((question) => question.country !== 'United States')!;
    assert.equal(roundRegion(american), 'usa');
    assert.equal(roundRegion([...american, abroad]), 'world');
    assert.equal(roundRegion([]), 'world');
  });
});

describe('share links', () => {
  const payload = { text: 'I scored 900 ', url: 'https://example.com/play?r=a.b' };

  test('every network gets the link', () => {
    for (const channel of ['whatsapp', 'x', 'facebook', 'telegram'] as const) {
      assert.ok(shareTargetUrl(channel, payload).includes(encodeURIComponent(payload.url)), channel);
    }
  });

  test('the copied text ends with the link', () => {
    assert.equal(shareClipboardText(payload), 'I scored 900\nhttps://example.com/play?r=a.b');
  });

  test('the squares of the picture follow the bands of the emoji grid', () => {
    assert.deepEqual(
      gridColours([
        { distance: 10 },
        { distance: 300 },
        { distance: 1000 },
        { distance: 5000 },
        { distance: 10, gaveUp: true },
      ]),
      ['green', 'yellow', 'orange', 'red', 'black'],
    );
  });
});

describe('private tournaments', () => {
  test('a new code can be read back', () => {
    const code = generateCode(seeded(3));
    assert.equal(code.length, CODE_LENGTH);
    assert.equal(cleanCode(code.toLowerCase()), code);
  });

  test('a code with letters that are easy to misread is refused', () => {
    assert.equal(cleanCode('ABCDE0'), '');
    assert.equal(cleanCode('ABC'), '');
    assert.equal(cleanCode(123456), '');
  });

  test('a tournament runs one, three or seven days', () => {
    assert.equal(cleanDays(7), 7);
    assert.equal(cleanDays('1'), 1);
    assert.equal(cleanDays(30), 3);
    assert.equal(cleanDays(undefined), 3);
  });

  test('the picked questions are kept, and too few become a random ten', () => {
    assert.deepEqual(tournamentQuestionIds(ids), ids);
    const random = tournamentQuestionIds([ids[0], 'nope'], seeded(5));
    assert.equal(random.length, CUSTOM_ROUND_MAX);
    assert.equal(tournamentQuestions(random).length, CUSTOM_ROUND_MAX);
    assert.deepEqual(tournamentQuestions('not a list'), []);
  });

  test('a tournament closes on time, and a broken date counts as closed', () => {
    const now = Date.parse('2026-10-31T12:00:00Z');
    assert.equal(hasEnded('2026-11-01T12:00:00Z', now), false);
    assert.equal(hasEnded('2026-10-30T12:00:00Z', now), true);
    assert.equal(hasEnded('nonsense', now), true);
    assert.equal(hasEnded(null, now), true);
  });

  test('the time left reads naturally', () => {
    const now = Date.parse('2026-10-31T12:00:00Z');
    assert.equal(timeLeftLabel('2026-11-03T12:00:00Z', now), '3 days left');
    assert.equal(timeLeftLabel('2026-10-31T17:30:00Z', now), '5 hours left');
    assert.equal(timeLeftLabel('2026-10-31T13:00:00Z', now), '1 hour left');
    assert.equal(timeLeftLabel('2026-10-31T12:20:00Z', now), '20 min left');
    assert.equal(timeLeftLabel('2026-10-31T11:00:00Z', now), 'Closed');
  });

  test('the join link points at the code', () => {
    assert.equal(tournamentUrl('ABC234', 'https://example.com/'), 'https://example.com/t/ABC234');
  });

  test('a tournament round is scored from the guesses against its own questions', () => {
    const questions = tournamentQuestions(ids);
    const perfect = questions.map((question) => ({
      id: question.id,
      lat: question.lat,
      lng: question.lng,
      elapsedSeconds: 0,
    }));
    const best = scoreQuestions(questions, perfect, {});
    assert.equal(best.counted, ids.length);
    assert.equal(best.score, best.maxScore);

    const far = perfect.map((answer) => ({ ...answer, lng: ((answer.lng + 360) % 360) - 180 }));
    assert.ok(scoreQuestions(questions, far, {}).score < best.score);

    const stranger = scoreQuestions(questions, [{ id: 'not-in-round', lat: 0, lng: 0, elapsedSeconds: 0 }], {});
    assert.equal(stranger.counted, 0);
  });
});

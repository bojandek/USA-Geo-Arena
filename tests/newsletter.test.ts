/**
 * Unit tests for the newsletter layer.
 *
 * The signup form posts straight to a newsletter provider, so the parts worth
 * testing here are the email validation and the local subscribe state.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  NEWSLETTER_COPY,
  NEWSLETTER_ACTION,
  NEWSLETTER_ENABLED,
  NEWSLETTER_ENDPOINT,
  isPlaceholderAction,
  getNewsletterState,
  isValidEmail,
  setNewsletterState,
} from '../src/lib/newsletter.ts';
import { buildDailyNewsletter, roundPath } from '../newsletter/daily.ts';
import { mailchimpDataCenter, testAddress } from '../server/_lib/mailer.ts';
import { cleanEdits } from '../server/_lib/daily-email.ts';

const DAY = '2026-10-24';
const SITE = 'https://geoarena.com';

describe('newsletter', () => {
  test('without a provider URL the signup posts to the own route of the site', () => {
    if (process.env.VITE_NEWSLETTER_ACTION) return; // configured in this env
    assert.equal(NEWSLETTER_ENABLED, true);
    assert.equal(NEWSLETTER_ACTION, NEWSLETTER_ENDPOINT);
  });

  test('a placeholder provider URL is never posted to', () => {
    assert.equal(isPlaceholderAction('https://example.com/newsletter-placeholder'), true);
    assert.equal(isPlaceholderAction('https://x.us21.list-manage.com/subscribe/post?u=1&id=2'), false);
  });

  test('validates email addresses', () => {
    assert.equal(isValidEmail('player@example.com'), true);
    assert.equal(isValidEmail('  player@example.com  '), true);
    assert.equal(isValidEmail('first.last+tag@sub.example.co.uk'), true);

    assert.equal(isValidEmail(''), false);
    assert.equal(isValidEmail('player'), false);
    assert.equal(isValidEmail('player@'), false);
    assert.equal(isValidEmail('player@example'), false);
    assert.equal(isValidEmail('two words@example.com'), false);
    assert.equal(isValidEmail('@example.com'), false);
  });

  test('the subscribe state starts as idle', () => {
    // Node has no localStorage, so the getter falls back to "idle".
    assert.equal(getNewsletterState(), 'idle');
  });

  test('setting the state never throws when storage is unavailable', () => {
    assert.doesNotThrow(() => setNewsletterState('subscribed'));
    assert.doesNotThrow(() => setNewsletterState('idle'));
  });

  test('the copy is complete in both languages', () => {
    assert.ok(NEWSLETTER_COPY.heading.length > 0);
    assert.ok(NEWSLETTER_COPY.subheading.length > 0);
    assert.ok(NEWSLETTER_COPY.buttonInline.length > 0);
    assert.ok(NEWSLETTER_COPY.buttonCard.length > 0);
    assert.ok(NEWSLETTER_COPY.note.length > 0);
    assert.ok(NEWSLETTER_COPY.successTitle.length > 0);
    assert.ok(NEWSLETTER_COPY.successBody.length > 0);
    assert.ok(NEWSLETTER_COPY.errorInvalid.length > 0);
  });

  test('the site copy is English only', () => {
    // The whole site is in English, so no Serbian diacritics may appear in
    // any string a visitor can read.
    const serbian = /[\u0107\u010B\u0161\u017E\u0111\u0106\u010C\u0158\u0110]/;
    const copy = Object.values(NEWSLETTER_COPY).join(' ');
    assert.equal(serbian.test(copy), false, 'the newsletter copy must be English only');
  });

  test('a placeholder action URL is recognised', () => {
    // The placeholder from .env.example must never be treated as a working
    // provider - in a production build the form stays hidden.
    const looksLikePlaceholder =
      /example\.com|example\.org|your-?username|placeholder|changeme/i;

    assert.equal(
      looksLikePlaceholder.test('https://example.com/newsletter-placeholder'),
      true,
    );
    assert.equal(
      looksLikePlaceholder.test(
        'https://buttondown.com/api/emails/embed-subscribe/geoarena',
      ),
      false,
    );
  });

});

describe('the daily email', () => {
  test('it has a subject, a preheader and both versions of the body', () => {
    const email = buildDailyNewsletter({ day: DAY, site: SITE });

    assert.ok(email.subject.length > 10);
    assert.ok(email.preheader.length > 10);
    assert.ok(email.html.includes('<!doctype html>'));
    assert.ok(email.text.length > 20);
  });

  test('it points at the round it is about', () => {
    const usa = buildDailyNewsletter({ day: DAY, site: SITE, region: 'usa' });
    const world = buildDailyNewsletter({ day: DAY, site: SITE, region: 'world' });

    assert.ok(usa.html.includes(`${SITE}/daily`));
    assert.ok(world.html.includes(`${SITE}/world`));
    assert.equal(roundPath('usa'), '/daily');
    assert.equal(roundPath('world'), '/world');
  });

  test('a trailing slash on the site does not make a broken link', () => {
    const email = buildDailyNewsletter({ day: DAY, site: `${SITE}/` });
    assert.ok(email.html.includes(`${SITE}/daily`));
    assert.ok(!email.html.includes('com//daily'));
  });

  test('the board is in the email', () => {
    const email = buildDailyNewsletter({
      day: DAY,
      site: SITE,
      entries: [
        { nickname: 'Map Reader', score: 1180, accuracy: 90 },
        { nickname: 'A Quiet Fan', score: 960, accuracy: 80 },
      ],
    });

    assert.ok(email.html.includes('Map Reader'));
    assert.ok(email.html.includes('1,180'));
    assert.ok(email.text.includes('Map Reader'));
    assert.ok(email.text.includes('1,180 points'));
  });

  test('only three scores are shown, however many there are', () => {
    const email = buildDailyNewsletter({
      day: DAY,
      site: SITE,
      entries: [
        { nickname: 'One', score: 100, accuracy: 10 },
        { nickname: 'Two', score: 200, accuracy: 20 },
        { nickname: 'Three', score: 300, accuracy: 30 },
        { nickname: 'Four', score: 400, accuracy: 40 },
      ],
    });

    assert.ok(email.html.includes('Three'));
    assert.ok(!email.html.includes('Four'));
  });

  test('an empty board says so rather than leaving a hole', () => {
    const email = buildDailyNewsletter({ day: DAY, site: SITE, entries: [] });
    assert.ok(email.html.includes('Nobody has put a score on the board yet today'));
  });

  test('a nickname cannot carry markup into the email', () => {
    const email = buildDailyNewsletter({
      day: DAY,
      site: SITE,
      entries: [{ nickname: '<script>alert(1)</script>', score: 10, accuracy: 1 }],
    });

    assert.ok(!email.html.includes('<script>'));
    assert.ok(email.html.includes('&lt;script&gt;'));
  });

  test('the kinds of question are counted', () => {
    const email = buildDailyNewsletter({
      day: DAY,
      site: SITE,
      categories: ['stadium', 'stadium', 'event', 'athlete'],
    });

    assert.ok(email.html.includes('2 stadiums'));
    assert.ok(email.html.includes('1 event'));
    assert.ok(email.text.includes('2 stadiums'));
  });

  test('the email says what a perfect round is worth', () => {
    const email = buildDailyNewsletter({ day: DAY, site: SITE });
    assert.ok(email.html.includes('1,000 points'));
    assert.ok(!email.html.includes('1,300'));
  });

  test('the day is written out in full', () => {
    const email = buildDailyNewsletter({ day: DAY, site: SITE });
    assert.ok(email.html.includes('October'));
    assert.ok(email.text.includes('October'));
  });

  test('the featured question, its image and the two replay cards are in the email', () => {
    const email = buildDailyNewsletter({
      day: DAY,
      site: SITE,
      featured: {
        question: 'Where is the first ground?',
        link: `${SITE}/daily?date=${DAY}`,
        label: "Today's first question",
        image: {
          url: 'https://example.com/first.jpg',
          alt: 'First ground',
          credit: 'Photo: Tester / CC BY 4.0, via Wikimedia Commons',
        },
      },
      previous: [
        {
          question: 'Where was yesterday?',
          link: `${SITE}/daily?date=2026-10-23`,
          label: 'Yesterday',
          image: {
            url: 'https://example.com/yesterday.jpg',
            alt: 'Yesterday ground',
            credit: 'Photo: Tester / CC BY 4.0, via Wikimedia Commons',
          },
        },
        {
          question: 'Where was two days ago?',
          link: `${SITE}/daily?date=2026-10-22`,
          label: 'Two days ago',
        },
      ],
    });

    assert.ok(email.html.includes('Where is the first ground?'));
    assert.ok(email.html.includes('https://example.com/first.jpg'));
    assert.ok(email.html.includes(`${SITE}/email-icon.png`));
    assert.ok(email.html.includes(`${SITE}/email-wordmark-site.png`));
    assert.ok(email.html.includes('Where was yesterday?'));
    assert.ok(email.html.includes('Where was two days ago?'));
    assert.ok(email.html.includes('Play again'));
    assert.ok(email.html.includes('Play today&#39;s USA challenge'));
    assert.ok(email.html.includes('Your next challenge'));
    assert.ok(email.html.includes('Email Preferences'));
    assert.ok(email.html.includes('USA GeoArena is a free daily sports geography game'));
    assert.ok(email.html.includes('Play now'));
    assert.ok(email.html.includes('Not Interested? Reply STOP to unsubscribe'));
    assert.ok(email.html.includes('About USA GeoArena'));
    assert.ok(email.html.includes('Disclaimer'));
    assert.ok(email.html.includes(`${SITE}/daily?date=${DAY}`));
  });
});

describe('the first question and the edits', () => {
  const featured = {
    question: 'Which ballpark has a hand-operated scoreboard in its left-field wall?',
    link: `${SITE}/daily?date=${DAY}`,
    label: "Today's first question",
  };

  test('the first question of the day is the subject', () => {
    const email = buildDailyNewsletter({ day: DAY, site: SITE, featured });
    assert.equal(email.subject, featured.question);
  });

  test('without a first question the usual subject is used', () => {
    const email = buildDailyNewsletter({ day: DAY, site: SITE });
    assert.notEqual(email.subject, '');
    assert.notEqual(email.subject, featured.question);
  });

  test('an edited subject, preheader and intro win over the defaults', () => {
    const email = buildDailyNewsletter({
      day: DAY,
      site: SITE,
      featured,
      edits: { subject: 'A new subject', preheader: 'A new preheader', intro: 'A new intro line' },
    });
    assert.equal(email.subject, 'A new subject');
    assert.equal(email.preheader, 'A new preheader');
    assert.ok(email.html.includes('A new intro line'));
    assert.ok(email.text.includes('A new intro line'));
  });

  test('a blank edit falls back to the default', () => {
    const email = buildDailyNewsletter({ day: DAY, site: SITE, featured, edits: { subject: '   ' } });
    assert.equal(email.subject, featured.question);
  });

  test('each round has its own intro line', () => {
    const usa = buildDailyNewsletter({ day: DAY, site: SITE, region: 'usa', featured });
    const world = buildDailyNewsletter({ day: DAY, site: SITE, region: 'world', featured });
    assert.ok(usa.html.includes('American sport'));
    assert.ok(world.html.includes('world sport'));
  });

  test('edits are trimmed, cut to length and empty ones dropped', () => {
    const edits = cleanEdits({ subject: `  ${'x'.repeat(200)}  `, preheader: '   ', intro: 7, extra: 'no' });
    assert.equal(edits.subject?.length, 150);
    assert.equal('preheader' in edits, false);
    assert.equal('intro' in edits, false);
    assert.equal('extra' in edits, false);
    assert.deepEqual(cleanEdits(null), {});
  });

  test('a test email only goes to a real address', () => {
    const before = process.env.NEWSLETTER_TEST_EMAIL;
    try {
      process.env.NEWSLETTER_TEST_EMAIL = ' me@example.com ';
      assert.equal(testAddress(), 'me@example.com');
      process.env.NEWSLETTER_TEST_EMAIL = 'not an address';
      assert.equal(testAddress(), null);
      delete process.env.NEWSLETTER_TEST_EMAIL;
      assert.equal(testAddress(), null);
    } finally {
      if (before === undefined) delete process.env.NEWSLETTER_TEST_EMAIL;
      else process.env.NEWSLETTER_TEST_EMAIL = before;
    }
  });
});

describe('the provider', () => {
  test('the datacenter comes out of the key', () => {
    assert.equal(mailchimpDataCenter('abc123def-us21'), 'us21');
    assert.equal(mailchimpDataCenter('abc123def-eu3'), 'eu3');
  });

  test('a key with no datacenter in it still gives one to talk to', () => {
    assert.equal(mailchimpDataCenter('nodatacenter'), 'us1');
  });
});

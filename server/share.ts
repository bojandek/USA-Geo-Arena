/**
 * The page a shared link points at.
 *
 * The social networks read a link by fetching it and looking at the tags in
 * the answer. They never run any code, so a single page application cannot
 * tell them anything about the score that was reached - unless the answer
 * itself carries the tags.
 *
 * So a shared result points here. This route writes the tags, points the
 * picture at the card for that score, and sends the visitor on to the game.
 */

import { universal } from './_lib/node-adapter.ts';

/** A round is worth 1,000 points; the streak adds XP, not points. */
const MAX_SCORE = 1000;

function readNumber(value: string | null, fallback: number, max: number): number {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(max, Math.round(number)));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function handler(request: Request) {
  const { searchParams } = new URL(request.url);

  const score = readNumber(searchParams.get('score'), 0, MAX_SCORE);
  const max = readNumber(searchParams.get('max'), MAX_SCORE, MAX_SCORE);
  const streak = readNumber(searchParams.get('streak'), 0, 9999);
  const region = searchParams.get('region') === 'world' ? 'World' : 'USA';
  const site = String(process.env.SITE_URL || 'https://geo-arena-six.vercel.app').replace(/\/$/, '');

  const percentage = max > 0 ? Math.round((score / max) * 100) : 0;
  // A result shared today is also a challenge: the link carries the score,
  // so whoever opens it plays the same round with that score to beat. An
  // older result has a different round behind it, so it only opens the game.
  const day = searchParams.get('day') ?? '';
  const dayTime = /^\d{4}-\d{2}-\d{2}$/.test(day) ? Date.parse(`${day}T12:00:00Z`) : NaN;
  const isCurrent = Number.isFinite(dayTime) && Math.abs(Date.now() - dayTime) <= 36 * 60 * 60 * 1000;
  const beat = readNumber(searchParams.get('score'), 0, 100_000);
  const target = `${site}/${region === 'World' ? 'world' : 'daily'}${isCurrent && beat > 0 ? `?beat=${beat}` : ''}`;
  // The score is carried by the title and description. The picture is the
  // branded static card: social crawlers fetch it without running JavaScript,
  // and a static asset is the one form every one of them accepts.
  const image = `${site}/og-image.png`;

  const title = `I scored ${score.toLocaleString('en-US')} points on today's ${region} Challenge`;
  const description = `${percentage}% of the best round${streak > 1 ? `, on a ${streak} day streak` : ''}. Ten questions a day about NFL, MLB, NBA and NHL stadiums. Can you beat it?`;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="USA GeoArena" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(target)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="A score of ${score} points on the USA GeoArena ${region} Challenge" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />

    <meta http-equiv="refresh" content="0; url=${escapeHtml(target)}" />
    <script>window.location.replace(${JSON.stringify(target)});</script>
  </head>
  <body style="font-family:system-ui,sans-serif;background:#12141A;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
    <p>Taking you to the game&hellip; <a style="color:#FF4655" href="${escapeHtml(target)}">Continue</a></p>
  </body>
</html>`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export default universal(handler);

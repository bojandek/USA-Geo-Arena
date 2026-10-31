/**
 * The daily email.
 *
 * The email is written the way email clients understand: tables for the
 * layout, the styles inline, and a plain text version for the clients that
 * ask for one. Nothing here knows anything about the provider - the sending
 * side takes the finished email and hands it over.
 *
 * The first question of the round is in the email, with its photograph, so the
 * reader sees what today's challenge is about. The other nine are not: the
 * round is worked out from the date, so every player gets the same ten anyway.
 * What the email adds is the reason to come back: what the round is worth,
 * what kind of round it is, who is on the board, and the two days that can
 * still be replayed.
 */

import { escapeHtml } from '../src/lib/html.ts';
import { formatFullDayLabel } from '../src/lib/date-utils.ts';

/** Small white map pin, embedded so it survives a copy into an ESP. */
const WHITE_PIN =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAoCAYAAACfKfiZAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGESURBVFhH1devTgQxEMfxkydPnrxHQCJ5BCQSiUQicUgkhgSJ5BGQSIJCniQoJO47pEk3uf2x2z/baQKf5Nx25rbbTqer1X8FHJvZyeFPn3EXkgIPwJdNAL6BRzM71bFNzGwLPGnCFODZzI40VrX41h+aoESckTONWSx+22aL/oSZ7Za+uQozUf05ar95DvCqOWZ5Tf2Ec801KW4ld8CL5vrFzNbxm/Wy05wjscJ1k90RoYrpIE/ApeYcAS50kLNrzTkSpkhHOLvSnCMdt+AgvRXNbKMjnOUrYjzJ3AF7zTWp10IEbjTXrFC7NUCLeLCtNc+sDosxvfimhKKhUZYAbjV2sbBvNWAN4E5jVls6E8C9xloMeNMEKcBn1aLLqT2ksodOrdgnFPWIsZ/YaIxmpWuhadWnVHRLWx3rJrydZjsUumkd4ype01KzkD/tWs3dGYq6Xg/hLTV55HsrTtGeAXjXZ7rSwuReeEoMPUP1We9lKExVnY6nWJj2XQtPTvau99f9AP3u56Sa7JF7AAAAAElFTkSuQmCC';

/** The public site, which always serves the logo files. */
const PUBLIC_SITE = 'https://geo-arena-six.vercel.app';

/**
 * Where the logo files are read from.
 *
 * An inbox cannot reach a computer's own localhost, and a preview may run on a
 * different port than SITE_URL says, so a local site takes the logo from the
 * public one.
 */
export function assetBase(site: string): string {
  try {
    const host = new URL(site).hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host.endsWith('.localhost')) {
      return PUBLIC_SITE;
    }
  } catch {
    return PUBLIC_SITE;
  }
  return site.replace(/\/$/, '');
}

/** The round the email is about. */
export type NewsletterRegion = 'usa' | 'world';

/** One row of the board. */
export interface BoardEntry {
  nickname: string;
  score: number;
  accuracy: number;
}

/** A photograph used in the email. */
export interface NewsletterImage {
  url: string;
  alt: string;
  credit: string;
  creditUrl?: string;
  illustrative?: boolean;
}

/** A question card in the email, without its answer. */
export interface FeaturedQuestion {
  question: string;
  link: string;
  label: string;
  image?: NewsletterImage;
}

/** Everything the email needs to know. */
export interface DailyNewsletterInput {
  /** The day the round is for, `YYYY-MM-DD`. */
  day: string;
  /** Where the site is, so the links in the email work. */
  site: string;
  /** Which round the email is about. */
  region?: NewsletterRegion;
  /** The best scores so far. */
  entries?: BoardEntry[];
  /** The kinds of question in the round, e.g. "stadium", "event". */
  categories?: string[];
  /** What a perfect round is worth. */
  maxScore?: number;
  /** How many questions are in the round. */
  questionCount?: number;
  /** The first question of the round, shown with its place photograph. */
  featured?: FeaturedQuestion;
  /** The previous two days, shown as replay cards. */
  previous?: FeaturedQuestion[];
  /** Changes made in the admin. An empty one keeps what the email says by itself. */
  edits?: NewsletterEdits;
}

/**
 * What the admin can change in a day's email. The subject is the first
 * question of the day unless it is changed here.
 */
export interface NewsletterEdits {
  subject?: string;
  preheader?: string;
  /** The line under the button in the question card. */
  intro?: string;
}

/** The finished email. */
export interface NewsletterEmail {
  subject: string;
  preheader: string;
  html: string;
  text: string;
}

/**
 * The words in the email.
 *
 * The site is English only, so the email is English only. When the site is
 * translated, this is where the second language goes: the copy is kept
 * together here, apart from the numbers, so that nothing has to be hunted
 * for in the middle of the markup.
 */
export const DAILY_COPY = {
  usa: {
    subject: "Today's USA Challenge — ten questions, 1,000 points",
    preheader: 'Ten American questions about the places where sport happens. One map, one round, everyone gets the same ten.',
    headline: 'The USA Challenge',
    intro: 'Ten American questions about stadiums, ballparks, arenas and the races that decide them.',
    teaser: 'Think you know American sport? Click the map, guess the stadium, and climb the leaderboard.',
    round: 'Ten questions. 1,000 points. One map.',
    button: "Play today's round",
    boardHeading: 'On the board',
    boardEmpty: 'Nobody has put a score on the board yet today. The first one is yours.',
    mixHeading: "Today's mix",
    footer: 'One email a day, every morning. Free, and you can leave whenever you like.',
  },
  world: {
    subject: "Today's World Challenge — ten questions, the whole planet",
    preheader: 'Ten questions about Formula 1, the Champions League and the rest of the world, on a globe.',
    headline: 'The World Challenge',
    intro: 'Ten questions about Formula 1, the Champions League and the rest of the world, on a globe.',
    teaser: 'Think you know world sport? Spin the globe, find the venue, and climb the leaderboard.',
    round: 'Ten questions. 1,000 points. The whole planet.',
    button: "Play today's round",
    boardHeading: 'On the board',
    boardEmpty: 'Nobody has put a score on the board yet today. The first one is yours.',
    mixHeading: "Today's mix",
    footer: 'One email a day, every morning. Free, and you can leave whenever you like.',
  },
} as const;

/** The address of the round, on the site. */
export function roundPath(region: NewsletterRegion): string {
  return region === 'world' ? '/world' : '/daily';
}

/** The address of one specific day's round, with the email tracking tags. */
export function roundUrl(
  site: string,
  region: NewsletterRegion,
  day: string,
): string {
  const base = site.replace(/\/$/, '');
  return (
    `${base}${roundPath(region)}` +
    `?date=${encodeURIComponent(day)}` +
    `&utm_source=newsletter&utm_medium=email&utm_campaign=${region}-daily` +
    `&utm_content=${encodeURIComponent(day)}`
  );
}

/** The address of the leaderboard, with the email tracking tags. */
export function leaderboardUrl(site: string, region: NewsletterRegion): string {
  const base = site.replace(/\/$/, '');
  return `${base}/leaderboard?utm_source=newsletter&utm_medium=email&utm_campaign=${region}-daily&utm_content=leaderboard`;
}

/** The category names, written the way a person would read them. */
const CATEGORY_NAMES: Record<string, string> = {
  stadium: 'stadium',
  event: 'event',
  club: 'club',
  athlete: 'athlete',
};

/** The name of a category, for the email. */
function categoryName(category: string): string {
  const key = category.trim().toLowerCase();
  return CATEGORY_NAMES[key] ?? key;
}

/** A number with a thousands separator, the way it is written everywhere. */
function points(value: number): string {
  return Math.round(Number(value) || 0).toLocaleString('en-US');
}

/** The kinds of question in the round, with how many of each. */
function mixLine(categories: string[]): string {
  const counts = new Map<string, number>();
  for (const category of categories) {
    const key = category.trim().toLowerCase();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(
      ([category, count]) =>
        `${count} ${categoryName(category)}${count === 1 ? '' : 's'}`,
    )
    .join(' · ');
}

/** The dark leaderboard panel, with the current top scores. */
function leaderboardPanel(
  entries: BoardEntry[],
  empty: string,
  link: string,
): string {
  const top = entries
    .slice(0, 3)
    .map((entry) => `${entry.nickname} ${points(entry.score)}`)
    .join(' · ');
  const message = top
    ? `Top scores: ${top}. Can you top it?`
    : empty;

  return `<tr><td style="padding:26px 24px 0 24px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#1F3447;border-radius:14px;">
<tr>
<td width="66" valign="top" style="width:66px;padding:20px 0 20px 18px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td align="center" valign="middle" width="48" height="48" bgcolor="#F5B82E" style="width:48px;height:48px;background:#F5B82E;border-radius:999px;font-size:23px;line-height:48px;">&#127942;</td>
</tr></table>
</td>
<td valign="middle" style="padding:18px 10px 18px 0;">
<p style="margin:0 0 5px 0;font-size:10px;line-height:15px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:#F5B82E;">The leaderboard</p>
<p style="margin:0;font-size:14px;line-height:21px;color:#F7FAFC;">${escapeHtml(message)}</p>
</td>
<td width="52" align="right" valign="middle" style="width:52px;padding:18px 16px 18px 0;">
<a href="${escapeHtml(link)}" target="_blank" style="display:inline-block;width:34px;height:34px;border:1px solid #8FA5B5;border-radius:999px;color:#FFFFFF;font-size:17px;line-height:34px;text-align:center;text-decoration:none;">&#8594;</a>
</td>
</tr>
</table>
</td></tr>`;
}

/** The big red CTA, shaped like a pill. */
function ctaButton(link: string, label: string, align: 'left' | 'center' = 'center'): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="${align}" style="padding:18px 0 0 0;text-align:${align};">
<a href="${escapeHtml(link)}" target="_blank" style="display:inline-block;background:#F4494F;border:1px solid #F4494F;border-radius:999px;color:#FFFFFF;font-size:14px;line-height:20px;font-weight:800;letter-spacing:0.03em;padding:15px 26px;text-decoration:none;text-transform:uppercase;">&#9655;&nbsp; ${escapeHtml(label)} &nbsp;&#8594;</a>
</td></tr></table>`;
}

/** The hero card: question first, then the clickable picture and the CTA. */
function featuredBlock(
  featured: FeaturedQuestion | undefined,
  options: {
    maxScore: number;
    questionCount: number;
    buttonLabel: string;
    teaser: string;
  },
): string {
  if (!featured) return '';
  const badge = `<a href="${escapeHtml(featured.link)}" target="_blank" style="position:absolute;top:14px;left:14px;z-index:2;display:inline-block;background:#F4494F;border-radius:999px;padding:9px 14px;text-decoration:none;">
<p style="margin:0;font-size:10px;line-height:15px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#FFFFFF;"><img src="${WHITE_PIN}" width="10" height="13" alt="" style="display:inline-block;width:10px;height:13px;border:0;vertical-align:-1px;margin:0 5px 0 0;" />Today's challenge</p>
</a>`;
  const image = featured.image
    ? `<tr><td style="padding:0 18px 0;">
<div style="position:relative;">
${badge}
<a href="${escapeHtml(featured.link)}" target="_blank" style="display:block;text-decoration:none;">
<img src="${escapeHtml(featured.image.url)}" alt="${escapeHtml(featured.image.alt)}" width="516" style="display:block;width:100%;max-width:516px;height:auto;border:0;border-radius:12px;" />
</a>
</div>
</td></tr>`
    : `<tr><td style="padding:16px 18px 0;">${badge.replace('position:absolute;', '')}</td></tr>`;

  return `<tr><td style="padding:24px 24px 0 24px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#FFFFFF;border:1px solid #F1E4DE;border-radius:17px;overflow:hidden;">
<tr><td style="padding:22px 22px 0;text-align:center;">
<a href="${escapeHtml(featured.link)}" target="_blank" style="display:block;color:#1F3447;text-decoration:none;">
<p style="margin:0 0 8px 0;font-size:11px;line-height:16px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#F4494F;">Question 1 of ${options.questionCount} &nbsp;&middot;&nbsp; ${points(options.maxScore)} points</p>
<h1 style="margin:0;font-family:'Trebuchet MS',Arial,Helvetica,sans-serif;font-size:27px;line-height:35px;font-weight:800;letter-spacing:-0.5px;color:#1F3447;">${escapeHtml(featured.question)}</h1>
</a>
</td></tr>
${image}
<tr><td style="padding:12px 22px 18px;text-align:center;">
${ctaButton(featured.link, options.buttonLabel)}
<p style="margin:9px 0 0 0;font-size:12px;line-height:18px;color:#7B8A99;text-align:center;">${escapeHtml(options.teaser)}</p>
</td></tr>
</table>
</td></tr>`;
}

/** The two replay cards from the previous days. */
function previousBlock(previous: FeaturedQuestion[] | undefined): string {
  const cards = (previous ?? []).slice(0, 2);
  if (cards.length === 0) return '';

  const cells = cards
    .map((item, index) => {
      const title = index === 0 ? "Yesterday's Challenge" : 'Earlier Challenge';
      const description =
        index === 0 ? 'Revisit the previous round.' : 'Test your stadium knowledge.';
      const image = item.image
        ? `<tr><td style="padding:0;">
<img src="${escapeHtml(item.image.url)}" alt="${escapeHtml(item.image.alt)}" width="240" height="120" style="display:block;width:100%;height:120px;object-fit:cover;border:0;" />
</td></tr>`
        : '';

      return `<td class="challenge-card" width="50%" valign="top" style="width:50%;padding:${cards.length === 2 ? (index === 0 ? '0 6px 0 0' : '0 0 0 6px') : '0'};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" title="${escapeHtml(item.question)}" style="width:100%;background:#FFFFFF;border:1px solid #F0E4DE;border-radius:12px;overflow:hidden;">
<tr><td style="height:4px;background:#F4494F;font-size:0;line-height:0;">&nbsp;</td></tr>
${image}
<tr><td style="padding:15px 15px 17px;">
<p style="margin:0 0 4px 0;font-family:'Trebuchet MS',Arial,Helvetica,sans-serif;font-size:17px;line-height:23px;font-weight:800;color:#1F3447;">${escapeHtml(title)}</p>
<p style="margin:0 0 12px 0;font-size:12px;line-height:18px;color:#7B8A99;">${escapeHtml(description)}</p>
<a href="${escapeHtml(item.link)}" target="_blank" title="Play now" aria-label="Play now" style="display:inline-block;background:#FFFFFF;border:1px solid #F4494F;border-radius:999px;color:#F04450;font-size:11px;line-height:16px;font-weight:800;letter-spacing:0.06em;padding:10px 16px;text-decoration:none;text-transform:uppercase;text-align:left;">Play again &nbsp;&#8594;</a>
</td></tr>
</table>
</td>`;
    })
    .join('');

  return `<tr><td style="padding:30px 43px 0 43px;">
<p style="margin:0 0 4px 0;font-family:'Trebuchet MS',Arial,Helvetica,sans-serif;font-size:20px;line-height:27px;font-weight:800;letter-spacing:-0.2px;color:#1F3447;">Your next challenge</p>
<p style="margin:0 0 14px 0;font-size:13px;line-height:20px;color:#7B8A99;">Missed a day? The action continues.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table>
</td></tr>`;
}

/**
 * Builds the email for a day.
 *
 * The result is a finished email: the subject, the preheader that shows in
 * the inbox list, the HTML and the plain text version. The provider is not
 * involved - it is handed these and told to send them.
 */
export function buildDailyNewsletter(input: DailyNewsletterInput): NewsletterEmail {
  const region = input.region ?? 'usa';
  const copy = DAILY_COPY[region];
  const site = input.site.replace(/\/$/, '');
  const assets = assetBase(site);
  const link = roundUrl(site, region, input.day);
  const primaryLink = input.featured?.link ?? link;
  const maxScore = input.maxScore ?? 1000;
  const questionCount = input.questionCount ?? 10;
  const entries = (input.entries ?? []).slice(0, 3);
  const dayLabel = formatFullDayLabel(input.day);
  const mix = mixLine(input.categories ?? []);
  const featuredButton =
    region === 'usa' ? "Play today's USA challenge" : "Play today's world challenge";
  const edits = input.edits ?? {};
  const teaser = edits.intro?.trim() || copy.teaser;
  const featuredMarkup = featuredBlock(input.featured, {
    maxScore,
    questionCount,
    buttonLabel: featuredButton,
    teaser,
  });
  const previousMarkup = previousBlock(input.previous);
  const leaderboardMarkup = leaderboardPanel(
    entries,
    copy.boardEmpty,
    leaderboardUrl(site, region),
  );
  const standaloneCta = input.featured
    ? ''
    : `<tr><td align="center" style="padding:24px 24px 0 24px;">${ctaButton(primaryLink, copy.button)}</td></tr>`;
  const extraMarkup = input.featured
    ? ''
    : `<tr><td align="center" style="padding:14px 24px 0 24px;">
${mix ? `<p style="margin:0 0 7px 0;font-size:11px;line-height:17px;color:#9AA1B2;">${escapeHtml(mix)}</p>` : ''}
<p style="margin:0;font-size:11px;line-height:17px;color:#9AA1B2;">A perfect round is worth <strong>${points(maxScore)} points</strong>. Same ten questions for everyone.</p>
</td></tr>`;

  // The day's first question is the subject: it is the picture in the email,
  // and a question nobody has seen yet is the reason to open it.
  const subject = edits.subject?.trim() || input.featured?.question.trim() || copy.subject;
  const preheader = edits.preheader?.trim() || copy.preheader;

  const html = `<!doctype html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<style type="text/css">
@media only screen and (max-width: 520px) {
  .challenge-card { display: block !important; width: 100% !important; padding: 0 0 12px 0 !important; }
}
</style>
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#F5F5F7;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#F5F5F7;border-collapse:collapse;">
<tr><td align="center" style="padding:24px 10px 30px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#FFFDFB;border:1px solid #F1E4DE;border-radius:20px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">

<tr><td align="center" style="background:#FAF7F2;padding:26px 24px 14px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;"><tr>
<td width="66" valign="middle" style="width:66px;padding:0 10px 0 0;">
<img src="${escapeHtml(assets)}/email-icon.png" width="64" height="64" alt="USA GeoArena" style="display:block;width:64px;height:64px;border:0;" />
</td>
<td valign="middle" style="text-align:left;">
<img src="${escapeHtml(assets)}/email-wordmark-site.png" width="190" height="33" alt="USA GeoArena" style="display:block;width:190px;max-width:100%;height:auto;border:0;" />
</td>
</tr></table>
<p style="margin:10px 0 0 0;font-size:10px;line-height:16px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#F4494F;">${escapeHtml(dayLabel)}</p>
</td></tr>

<tr><td style="padding:0 24px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" bgcolor="#F4494F" style="height:1px;background:#F4494F;font-size:0;line-height:0;">&nbsp;</td></tr></table>
</td></tr>

<tr><td align="center" style="padding:9px 24px 0;">
<p style="margin:0;font-size:10px;line-height:16px;color:#9AA1B2;">Not Interested? Reply STOP to unsubscribe</p>
</td></tr>

${featuredMarkup}

${standaloneCta}

${extraMarkup}

${previousMarkup}

${leaderboardMarkup}

<tr><td align="center" style="padding:28px 24px 24px;background:#FAF7F2;border-top:1px solid #F1E4DE;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 14px;"><tr>
<td width="40" valign="middle" style="width:40px;padding:0 8px 0 0;"><img src="${escapeHtml(assets)}/email-icon.png" width="36" height="36" alt="USA GeoArena" style="display:block;width:36px;height:36px;border:0;" /></td>
<td valign="middle" style="text-align:left;"><img src="${escapeHtml(assets)}/email-wordmark-site.png" width="110" height="19" alt="USA GeoArena" style="display:block;width:110px;max-width:100%;height:auto;border:0;" /></td>
</tr></table>
<p style="margin:0 0 12px 0;font-size:11px;line-height:18px;color:#68798A;">
<a href="${escapeHtml(site)}/about" target="_blank" title="About USA GeoArena" style="color:#52677A;text-decoration:none;">About</a> &nbsp;|&nbsp;
<a href="${escapeHtml(site)}/terms" target="_blank" style="color:#52677A;text-decoration:none;">Terms</a> &nbsp;|&nbsp;
<a href="${escapeHtml(site)}/privacy" target="_blank" style="color:#52677A;text-decoration:none;">Privacy</a> &nbsp;|&nbsp;
<a href="*|UPDATE_PROFILE|*" target="_blank" style="color:#52677A;text-decoration:none;">Email Preferences</a> &nbsp;|&nbsp;
<a href="*|UNSUB|*" target="_blank" style="color:#52677A;text-decoration:none;">Unsubscribe</a>
</p>
<p style="margin:0 0 8px 0;font-size:12px;line-height:19px;color:#7B8A99;">One map. Ten questions. Your next personal best.</p>
<p title="Disclaimer" style="margin:0 0 12px 0;font-size:10px;line-height:16px;color:#9AA1B2;">USA GeoArena is a free daily sports geography game. Content is for entertainment and general knowledge only. Team and league marks belong to their owners.</p>
<p style="margin:0;font-size:10px;line-height:16px;color:#9AA1B2;">&copy; ${escapeHtml(input.day.slice(0, 4))} USA GeoArena. All rights reserved.</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  const textLines = [
    `USA GeoArena - ${copy.headline}`,
    dayLabel,
    '',
    ...(input.featured
      ? [
          input.featured.label.toUpperCase(),
          input.featured.question,
          primaryLink,
          teaser,
          '',
        ]
      : []),
    copy.round,
    copy.intro,
    '',
    featuredButton.toUpperCase(),
    primaryLink,
    '',
    ...(input.previous?.length
      ? [
          'YOUR NEXT CHALLENGE',
          ...input.previous.flatMap((item) => [
            `${item.label}: ${item.question}`,
            item.link,
          ]),
          '',
        ]
      : []),
    copy.boardHeading.toUpperCase(),
    ...(entries.length
      ? entries.map((entry, index) => `${index + 1}. ${entry.nickname} - ${points(entry.score)} points`)
      : [copy.boardEmpty]),
    ...(mix ? ['', copy.mixHeading.toUpperCase(), mix] : []),
    '',
    `A perfect round is worth ${points(maxScore)} points. Everybody gets the same ten questions, so nobody can play early and win.`,
    '',
    '---',
    copy.footer,
    '',
    'ABOUT USA GEOARENA',
    'At USA GeoArena, every question is a new adventure. Dive into a world of excitement where quick thinking and sports knowledge collide. Whether you are testing your memory, exploring new places, or chasing your personal best - USA GeoArena makes learning feel like play.',
    '',
    'DISCLAIMER',
    'Access to USA GeoArena emails, website, and materials is subject to our Terms of Use and Privacy Policy. Content is for general knowledge and entertainment only - not a substitute for professional advice.',
    '',
    'Update your email preferences or unsubscribe here: *|UNSUB|*',
    `(c) ${input.day.slice(0, 4)} USA GeoArena. All rights reserved. - ${site}`,
  ];

  return { subject, preheader, html, text: textLines.join('\n') };
}

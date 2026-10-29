# The daily email

One email a day, to the list, with the round in it.

The signup form on the site collects the addresses. This folder is what turns
them into an email every morning.

There are **two ways** to do it, and both are here.

## 1. The static example - `daily-challenge.html`

A hand-written example for a provider's campaign editor (Mailchimp, Buttondown
and Brevo all accept raw HTML). It is useful as a starting point, but it is not
the source of truth: the admin preview and the daily cron build the email from
`daily.ts`, with that morning's question, images, scores and links.

It is table based and inline styled, because email clients do not understand
flexbox or grid. The link goes to `/daily` - the daily question set is
derived from the date, so every player gets the same ten questions and there
is no need to put them in the email.

`*|UNSUB|*` in the footer is Mailchimp's unsubscribe tag. On another
provider, replace it with that provider's own unsubscribe link.

## 2. The automatic one - `daily.ts` and the route

The same email, but built by the server every morning: the board in it, the
day's date, the kinds of question in the round, and the send itself.

```
newsletter/daily.ts     the email itself - subject, preheader, HTML, plain text
server/_lib/mailer.ts   sending it to the provider (Mailchimp)
server/newsletter.ts    the route: preview, or send when the cron calls
vercel.json             the cron that calls it once a day
```

`newsletter/daily.ts` knows nothing about the provider. It is given the day,
the site address, the board and the kinds of question in the round, and it
hands back a finished email. That is why it can be tested without a network
and without an account.

## What is in the email

The first question is in the email so the reader can see what today's
challenge is about. The other nine are **not**: the round is worked out from
the date, so every player gets the same ten anyway, and the email's job is to
give the reader a reason to come back:

- the USA GeoArena globe icon and script wordmark, with the date directly below
- the first question as a hero card, with its place photograph, a prominent
  **Play today's USA challenge** button, and the round's question/points count
- the two previous days as replay cards under **Your next challenge**
- a dark leaderboard panel with the current top scores
- the about, disclaimer, preferences and unsubscribe footer

The HTML is written the way email clients understand it: tables for the
layout, the styles inline, a plain text version for the clients that ask for
one, and PNG assets for the logo and wordmark rather than SVG (email clients
do not show SVG). The email icon is `public/email-icon.png`; the wordmark is
`public/email-wordmark-site.png`, rendered in the site's Caveat font.

The replay links carry `?date=YYYY-MM-DD`, so the site opens that archived
round instead of today's. `*|UNSUB|*` and `*|UPDATE_PROFILE|*` are Mailchimp's
merge tags; the automatic route also gets Mailchimp's own footer added by the
provider.

The copy is in `DAILY_COPY` at the top of `newsletter/daily.ts`. The site is
English only, so the email is English only; when the site is translated, that
is where the second language goes.

## Setting up the automatic one

**1. The provider.** Mailchimp is what the signup form already posts to, so
the audience is already there. What is missing is the key that lets the
server send.

```
Mailchimp -> Account -> Extras -> API keys -> Create a key
Mailchimp -> Audience -> Settings -> Audience ID
```

Put them in the environment, on Vercel and in `.env.local`:

```
MAILCHIMP_API_KEY=xxxxxxxx-us21
MAILCHIMP_LIST_ID=abc123def4
MAILCHIMP_FROM_NAME=USA GeoArena
MAILCHIMP_REPLY_TO=contact@geoarena.com
CRON_SECRET=<a long random string>
```

The key says which datacenter the account lives in - `us21` above - and the
route reads it out of the key, so there is nothing else to configure.

**2. The sender.** Mailchimp refuses to send from an address it has not
verified. Check that `MAILCHIMP_FROM_NAME` and `MAILCHIMP_REPLY_TO` are a
sender the account has already verified, or the daily send fails with a
complaint from the provider.

**3. The cron.** `vercel.json` already has it:

```json
"crons": [{ "path": "/api/newsletter", "schedule": "0 11 * * *" }]
```

Vercel runs crons in UTC. 11:00 UTC is noon in Sarajevo, seven in the
morning on the American east coast and eight in the evening in Tokyo. Change
the hour if the audience is somewhere else - and remember that a player in
the far east is already on the next day when the email goes out.

## Seeing it before it goes out

Open **`/api/newsletter`** in a browser. That is a preview of the real email,
built from the real board, with the real questions behind it. Nothing is sent.

```
/api/newsletter                 today's email, as a preview
/api/newsletter?region=world    the world round
/api/newsletter?day=2026-10-01  any other day
```

### Export the HTML for an ESP

Mailchimp can send it automatically, but the same finished email can be
downloaded and pasted or uploaded into another provider:

```bash
curl "$SITE_URL/api/newsletter?region=usa&download=1" \
  -o geoarena-usa-daily.html
```

The response is the complete table-based HTML, with the button and link
pointing at `/daily` (the USA round). `format=html` is an alias for
`download=1`. Add `day=YYYY-MM-DD` to build that day's email, or
`region=world` for the globe round.

The links carry `utm_source=newsletter`, `utm_medium=email` and a daily
`utm_content` date, so an ESP's analytics can tell the daily send apart.

## The admin desk

There is also a private screen for preparing the email by hand:

```text
https://geo-arena-six.vercel.app/admin/newsletter
```

Set `ADMIN_SECRET` to a long random value in the deployment. The screen asks
for it, checks it on the server, and keeps it only in that browser tab. From
there you can:

- preview any day and either round
- download the finished HTML
- copy the HTML to the clipboard

It deliberately does **not** send. Sending stays with the cron and the ESP, so
a click in the admin cannot mail the list twice. `ADMIN_SECRET` is a server
secret; it is never included in the JavaScript bundle.

### Testing the admin locally

`npm run dev` is enough now. The Vite config includes a **dev-only** middleware
that serves the same admin handler at `/api/admin/newsletter`, so the normal
Vite server can run the admin desk without Vercel:

```bash
npm run dev
```

Open the address Vite prints (usually `http://localhost:8080`, or `5173` if
that is the port the dev server was started with), add `/admin/newsletter`,
and paste the `ADMIN_SECRET` from `.env`.

`ADMIN_SECRET` is read from `.env` by the dev middleware, and does not reach
the browser bundle. Mailchimp and Supabase are not needed for a preview;
without Supabase the board is simply empty.

To send it by hand, call the route with the secret:

```
curl -X POST https://geo-arena-six.vercel.app/api/newsletter \
  -H "Authorization: Bearer $CRON_SECRET"
```

Without the secret the route only ever shows a preview. That is deliberate: a
route that sends on every visit is a way to burn a sending allowance in an
afternoon, and Mailchimp counts a campaign each time.

## Other providers

`api/_lib/mailer.ts` is the only file that knows about the provider. Brevo
and Buttondown both have a list endpoint as well, and they need the same
three things - make the campaign, give it its content, send it - so a second
provider is a second function in that file and a setting in `mailerConfig()`.

## What is not in the email

- **The questions.** They would give the round away.
- **The answers to yesterday.** The board shows the scores, not the places.
- **The subscriber's own streak.** There are no accounts, so the server does
  not know who anybody is. The email is the same for everybody.

# Site sign-in and access

Sign-in is handled by **Supabase Auth**. Today's `/daily` round is public; the
archive, world round, battle, review, leaderboard, stats, achievements and
submit pages require a session.

The footer has one control: **Sign in** when signed out, and the signed-in
email plus **Sign out** when a session exists. The same control appears on a
protected route's sign-in gate.

## What is stored

Supabase keeps the account in its own `auth.users` table: email, provider and
session metadata. The existing newsletter provider remains the newsletter
source of truth.

The auth modal can show an explicit **Send me the daily USA GeoArena challenge**
checkbox when the newsletter is configured. If checked, the signed-in address
is submitted once to the existing newsletter provider after the OAuth or magic
link returns. It is not a hidden subscription: the checkbox is off by default
and the provider still owns double opt-in and unsubscribe.

## 1. Browser environment

Add these to `.env.local` (and to Vercel):

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

The anon key is public by design. The service role key is server-only and must
not be put in a `VITE_` variable.

## 2. Redirect URLs

In Supabase: **Authentication -> URL Configuration**.

Add:

```text
http://localhost:5173/auth/callback
https://geo-arena-six.vercel.app/auth/callback
https://YOUR-DOMAIN/auth/callback
```

`https://geo-arena-six.vercel.app` is the current production alias. Replace it
once a custom domain is attached.

The app redirects OAuth and magic links to `/auth/callback`; that page waits
for the session and returns the visitor to `/`.

## 3. Google

1. Google Cloud Console -> APIs & Services -> Credentials -> OAuth client.
2. Application type: **Web application**.
3. Authorized JavaScript origin: your site origin.
4. Authorized redirect URI:
   `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
5. Put the Client ID and Client Secret in Supabase:
   **Authentication -> Providers -> Google**.

## 4. Apple

Apple Sign In needs an Apple Developer account.

1. Create a **Services ID** for the web.
2. Configure the return URL:
   `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
3. Create a Sign in with Apple key (`.p8`) and note the Key ID and Team ID.
4. Put the Services ID, Team ID, Key ID and private key in Supabase:
   **Authentication -> Providers -> Apple**.

Apple may return a private relay address
(`@privaterelay.appleid.com`); that is normal.

## 5. Email

Enable **Email** in Supabase Auth. For magic links in production, configure
custom SMTP (Resend, SendGrid, Postmark, etc.) in
**Authentication -> Emails / SMTP**. The Supabase default mailer is only for
development and has strict limits.

## 6. Domain

OAuth and Apple require a real HTTPS domain. `geoarena.com` currently returns a
parking page, so use the actual deployed domain
(`https://geo-arena-six.vercel.app`) or a custom domain, and add that exact
origin to Supabase and the provider consoles.

## Behaviour when unset

If the two `VITE_SUPABASE_*` values are missing, the sign-in control stays
visible and its dialog explains which environment values are missing. Protected
pages show a "Sign-in is not configured" gate instead of redirecting. There is
no dead OAuth redirect in either mode.

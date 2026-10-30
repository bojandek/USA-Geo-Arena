# Auth emails

Supabase Auth sends the sign-in email. The **sender** and the **content** can
still be USA GeoArena's.

There are two separate things:

1. **Delivery** - where the email comes from.
2. **Template** - what the email looks like.

Without custom SMTP, Supabase uses its shared test mailer. That mailer only
delivers to addresses that belong to the project's team and is limited to about
two messages per hour. That is why a real visitor can enter their address and
never receive the magic link.

## The result after this setup

```text
From:     USA GeoArena <no-reply@geoarena.com>
Reply-To: contact@geoarena.com
Subject:  Your USA GeoArena sign-in link
```

The sign-in link still points at the Supabase auth endpoint. That is normal:
Supabase verifies the token, then redirects to
`https://geo-arena-six.vercel.app/auth/callback`.

## 1. Brevo

1. Create a Brevo account.
2. Authenticate the sending domain under **Senders, Domains & Dedicated IPs**.
   Add the SPF and DKIM records Brevo gives you to the domain's DNS.
3. Create a sender such as `no-reply@geoarena.com` on that domain.
4. Open **Settings -> SMTP & API -> SMTP** and generate an **SMTP key**.
   This is not the same thing as a Brevo API key.

DNS changes can take up to 24-48 hours to propagate.

## 2. Supabase custom SMTP

Open:

`https://supabase.com/dashboard/project/vgfuhhkblgkubtuuekhg/auth/smtp`

Turn on **Enable custom SMTP** and enter:

| Field | Value |
| --- | --- |
| Sender email address | `no-reply@geoarena.com` |
| Sender name | `USA GeoArena` |
| Host | `smtp-relay.brevo.com` |
| Port | `587` (STARTTLS) or `465` (SSL/TLS) |
| Username | the Brevo account login email |
| Password | the Brevo **SMTP key** |
| Minimum interval per user | `60` seconds |

Save. Then send a test email from the Supabase SMTP page.

Do not turn on Brevo click tracking for these messages. It rewrites links, and
the Supabase confirmation link stops working.

## 3. Subjects and templates

Open:

`https://supabase.com/dashboard/project/vgfuhhkblgkubtuuekhg/auth/templates`

With custom SMTP enabled, the template editor becomes available.

### Magic link (current flow)

Subject:

```text
Your USA GeoArena sign-in link
```

Body: paste `emails/supabase-magic-link.html`.

This template uses `{{ .ConfirmationURL }}`, so it sends a link.

### Six-digit code (optional)

Subject:

```text
Your USA GeoArena sign-in code
```

Body: paste `emails/supabase-otp.html`.

This template uses `{{ .Token }}`, so it sends a code instead of a link.

The code only works if the app has a code input and calls
`supabase.auth.verifyOtp({ email, token, type: 'email' })`. The current app uses
the magic-link flow, so do not switch to the OTP template on its own.

### Confirm signup

If email confirmation is enabled, paste the same magic-link template into
**Confirm sign up** and use:

```text
Confirm your USA GeoArena email
```

### Other templates

Use the same header, colors, and footer for reset password, email change, and
invite. The variable differs by template; keep the Supabase variable name that
the template needs.

## 4. Welcome email

The auth email is a sign-in email. It is not a separate welcome email.

`emails/welcome.html` is a separate transactional message for after the first
successful sign-in. Sending it needs the Brevo **API key** and a small
server-side route that:

1. verifies the Supabase access token;
2. checks that this user has not received the welcome email yet;
3. sends the HTML through `POST https://api.brevo.com/v3/smtp/email`;
4. records the send so a refresh cannot send it twice.

Google and Apple sign-ups also need this separate email because they do not
trigger a Supabase magic link.

## 5. Testing checklist

- [ ] Brevo domain shows authenticated (SPF and DKIM green).
- [ ] Supabase SMTP test email arrives.
- [ ] Sender is `USA GeoArena`, not Supabase.
- [ ] Magic link opens `/auth/callback` and signs in.
- [ ] A different email address (not a Supabase team member) receives the mail.
- [ ] Link still works with Brevo click tracking off.
- [ ] Email looks correct in Gmail, Apple Mail, and Outlook.

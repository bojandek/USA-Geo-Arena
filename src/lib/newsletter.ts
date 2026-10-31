/**
 * Newsletter subscription.
 *
 * USA GeoArena has no backend, so the signup form posts straight to a newsletter
 * provider (Mailchimp, Buttondown, Brevo - all of them accept a plain form
 * POST). The provider stores the address, sends the double opt-in
 * confirmation and handles the unsubscribe link.
 *
 * Nothing is rendered until an action URL is configured, so the site behaves
 * exactly as before in development.
 *
 * The daily email does not need to carry the questions: the daily question set
 * is derived deterministically from the date, so every player gets the same
 * ten questions anyway. The email simply points at /daily, which means the
 * sending side can be a plain scheduled campaign and needs no code at all.
 */

/**
 * The site's own signup route. It puts the address on the Mailchimp list
 * with the server's key, and it answers, so a refused address is reported.
 */
export const NEWSLETTER_ENDPOINT = '/api/subscribe';

/** A provider form URL, e.g. a Mailchimp `.../post?u=..&id=..` URL. Optional. */
const CONFIGURED: string = import.meta.env?.VITE_NEWSLETTER_ACTION ?? '';

/** Name of the email field the provider expects. */
const FIELD: string = import.meta.env?.VITE_NEWSLETTER_FIELD ?? 'EMAIL';

/** Optional page where a subscriber can unsubscribe without an email. */
const UNSUBSCRIBE_URL: string = import.meta.env?.VITE_NEWSLETTER_UNSUBSCRIBE ?? '';

const STORAGE_KEY = 'geoarena-newsletter';
const AUTH_CONSENT_KEY = 'geoarena-auth-newsletter-consent';

/**
 * True when a URL is still the placeholder from `.env.example`.
 *
 * A placeholder would accept the form and silently throw the address away,
 * so it is never posted to.
 */
export function isPlaceholderAction(url: string): boolean {
  return /example\.com|example\.org|your-?username|placeholder|changeme/i.test(url);
}

/**
 * Where the form posts: a real provider URL when one is configured, and the
 * site's own route otherwise. The form used to be hidden when there was no
 * provider URL, which in production meant no signup at all.
 */
const ACTION: string =
  CONFIGURED && !isPlaceholderAction(CONFIGURED) ? CONFIGURED : NEWSLETTER_ENDPOINT;

export const NEWSLETTER_ENABLED = true;
export const NEWSLETTER_ACTION = ACTION;
export const NEWSLETTER_FIELD = FIELD;
export const NEWSLETTER_UNSUBSCRIBE_URL = UNSUBSCRIBE_URL;
export const NEWSLETTER_USES_ENDPOINT = ACTION === NEWSLETTER_ENDPOINT;

/* ------------------------------------------------------------------ *
 * Copy
 * ------------------------------------------------------------------ *
 *
 * The site is English only, so the signup form is English only as well.
 * The daily email is a separate channel and may be translated - see
 * `newsletter/README.md`.
 */

export interface NewsletterCopy {
  /** Title of the standalone card. */
  heading: string;
  /** One line under the title. */
  subheading: string;
  /** Button label on the inline (home page) variant. */
  buttonInline: string;
  /** Button label on the card variant. */
  buttonCard: string;
  /** Small print under the form. */
  note: string;
  /** Shown once the visitor subscribed. */
  successTitle: string;
  successBody: string;
  /** Validation error. */
  errorInvalid: string;
}

export const NEWSLETTER_COPY: NewsletterCopy = {
  heading: 'US Sports Quiz in your inbox',
  subheading:
    'Ten American questions, one email, every morning. Free, and you can leave whenever you like.',
  buttonInline: 'Notify me',
  buttonCard: 'Subscribe',
  note: 'One email a day. No spam, no sharing. Unsubscribe in one click.',
  successTitle: "You're on the list",
  successBody: 'Tomorrow’s USA challenge lands in your inbox.',
  errorInvalid: 'Please enter a valid email address.',
};

export type NewsletterState = 'idle' | 'subscribed';

/** True once the visitor subscribed on this device. */
export function getNewsletterState(): NewsletterState {
  if (typeof localStorage === 'undefined') return 'idle';
  try {
    return localStorage.getItem(STORAGE_KEY) === 'subscribed' ? 'subscribed' : 'idle';
  } catch {
    return 'idle';
  }
}

export function setNewsletterState(state: NewsletterState): void {
  if (typeof localStorage === 'undefined') return;
  try {
    if (state === 'subscribed') {
      localStorage.setItem(STORAGE_KEY, 'subscribed');
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage may be unavailable (private mode / quota).
  }
}

/**
 * Remember an explicit newsletter opt-in across an OAuth/magic-link redirect.
 * The flag lives only until the next signed-in session reads it.
 */
export function rememberNewsletterConsent(enabled: boolean): void {
  if (typeof localStorage === 'undefined') return;
  try {
    if (enabled) {
      localStorage.setItem(AUTH_CONSENT_KEY, '1');
    } else {
      localStorage.removeItem(AUTH_CONSENT_KEY);
    }
  } catch {
    // Storage may be unavailable.
  }
}

/** Read and clear the pending consent flag. */
export function takeNewsletterConsent(): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    const pending = localStorage.getItem(AUTH_CONSENT_KEY) === '1';
    localStorage.removeItem(AUTH_CONSENT_KEY);
    return pending;
  } catch {
    return false;
  }
}

/** What happened to a signup. */
export interface SubscribeOutcome {
  ok: boolean;
  /** A sentence for the visitor when it did not work. */
  error?: string;
}

/**
 * Puts an address on the list.
 *
 * The site's own route answers, so a refusal is reported. A provider form
 * URL is posted to in `no-cors` mode, which cannot be read back, so there the
 * confirmation email is what proves it worked. The signup form and the
 * sign-in opt-in both come through here.
 */
export async function subscribeToNewsletter(
  email: string,
  source = 'site',
): Promise<SubscribeOutcome> {
  if (!isValidEmail(email)) return { ok: false, error: NEWSLETTER_COPY.errorInvalid };

  try {
    if (NEWSLETTER_USES_ENDPOINT) {
      const response = await fetch(ACTION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        return { ok: false, error: payload.error || 'Something went wrong. Try again.' };
      }
    } else {
      const body = new URLSearchParams();
      body.set(FIELD, email.trim());
      await fetch(ACTION, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
    }
    setNewsletterState('subscribed');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Something went wrong. Try again.' };
  }
}

/** A deliberately simple check - the provider does the real validation. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

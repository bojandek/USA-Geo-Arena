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

/** Provider endpoint the form posts to, e.g. a Mailchimp `.../post?u=..&id=..` URL. */
const ACTION: string = import.meta.env?.VITE_NEWSLETTER_ACTION ?? '';

/** Name of the email field the provider expects. */
const FIELD: string = import.meta.env?.VITE_NEWSLETTER_FIELD ?? 'EMAIL';

/** Optional page where a subscriber can unsubscribe without an email. */
const UNSUBSCRIBE_URL: string = import.meta.env?.VITE_NEWSLETTER_UNSUBSCRIBE ?? '';

const STORAGE_KEY = 'geoarena-newsletter';
const AUTH_CONSENT_KEY = 'geoarena-auth-newsletter-consent';

export const NEWSLETTER_ENABLED = Boolean(ACTION);
export const NEWSLETTER_ACTION = ACTION;
export const NEWSLETTER_FIELD = FIELD;
export const NEWSLETTER_UNSUBSCRIBE_URL = UNSUBSCRIBE_URL;

/**
 * True when the action URL is still the placeholder from `.env.example`.
 *
 * A placeholder would accept the form and silently throw the address away,
 * so in production the form is hidden instead of pretending to work. In
 * development it stays visible with a notice, so the layout can be reviewed.
 */
export const NEWSLETTER_IS_PLACEHOLDER =
  !ACTION || /example\.com|example\.org|your-?username|placeholder|changeme/i.test(ACTION);

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

/**
 * Send a signed-in address to the existing newsletter provider.
 *
 * This is the same provider form the rest of the site uses; the provider owns
 * double opt-in and unsubscribe. It returns false when the newsletter is not
 * configured, so the auth flow never pretends a contact was captured.
 */
export async function subscribeToNewsletter(email: string): Promise<boolean> {
  if (!NEWSLETTER_ENABLED || NEWSLETTER_IS_PLACEHOLDER || !isValidEmail(email)) {
    return false;
  }

  const body = new URLSearchParams();
  body.set(FIELD, email.trim());

  try {
    await fetch(ACTION, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    setNewsletterState('subscribed');
    return true;
  } catch {
    return false;
  }
}

/** A deliberately simple check - the provider does the real validation. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

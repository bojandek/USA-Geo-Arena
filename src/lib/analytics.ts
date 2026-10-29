/**
 * Google Analytics 4.
 *
 * Without measurements there is no way to know whether the site is working,
 * so this is the module that answers the questions that matter for a site
 * that lives on advertising: where the visitors come from, how many finish a
 * round, and at which question they give up.
 *
 * The script is loaded only after the visitor has accepted analytics cookies.
 * Nothing is sent before that, and `ads.ts` has already written the "denied"
 * default into the data layer, so Google never learns about a visitor who has
 * not agreed to anything.
 */

import { getConsentSnapshot, subscribeConsent } from './ads.ts';

/** The GA4 property, e.g. "G-XXXXXXXXXX". */
export const GA_MEASUREMENT_ID: string = import.meta.env?.VITE_GA_MEASUREMENT_ID ?? '';

/** Set to true to see the events in the GA4 realtime view while developing. */
const GA_DEBUG: boolean = import.meta.env?.VITE_GA_DEBUG === 'true';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** True when a GA4 property has been configured. */
export function isAnalyticsConfigured(): boolean {
  return Boolean(GA_MEASUREMENT_ID);
}

/**
 * The events the site reports.
 *
 * Kept in one place so the names cannot drift apart between the code that
 * sends them and the dashboards that read them.
 */
export const ANALYTICS_EVENTS = {
  roundStart: 'round_start',
  guessSubmitted: 'guess_submitted',
  roundComplete: 'round_complete',
  share: 'share_results',
  regionSelect: 'region_select',
  newsletterSignup: 'newsletter_signup',
  modeSelect: 'mode_select',
  exception: 'exception',
  hintTaken: 'hint_taken',
  challengeFriend: 'challenge_friend',
  challengeAccepted: 'challenge_accepted',
} as const;

/** Loads the GA4 script, once. */
export function loadAnalytics(): void {
  if (!isAnalyticsConfigured()) return;
  if (typeof document === 'undefined') return;
  if (document.querySelector(`script[src*="${GA_MEASUREMENT_ID}"]`)) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: true,
    ...(GA_DEBUG ? { debug_mode: true } : {}),
  });
}

/**
 * Sends an event.
 *
 * A no-op when there is no property, when the script has not been loaded
 * (which is the case for a visitor who did not accept analytics), or when
 * there is no browser at all - the rules are unit tested outside one.
 */
export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (!isAnalyticsConfigured()) return;
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

/**
 * Wires the analytics to the consent choice.
 *
 * The script is loaded the moment the visitor accepts, and never before.
 */
export function initAnalytics(): () => void {
  if (typeof window === 'undefined') return () => {};

  if (getConsentSnapshot() === 'granted') loadAnalytics();

  return subscribeConsent((value) => {
    if (value === 'granted') loadAnalytics();
  });
}
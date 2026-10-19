/**
 * Advertising infrastructure (Google AdSense).
 *
 * Everything in this module is inert until an AdSense publisher id and at
 * least one slot id are configured, so the app builds, runs and looks
 * complete in development without showing empty ad boxes.
 *
 * Configuration lives in environment variables (see `.env.example`):
 *   VITE_ADSENSE_CLIENT_ID  - "ca-pub-XXXXXXXXXXXXXXXX"
 *   VITE_AD_SLOT_HOME       - slot for the home page
 *   VITE_AD_SLOT_AFTER_GAME - slot shown after a finished round
 *   VITE_AD_SLOT_IN_ARTICLE - slot shown on the informational pages
 *   VITE_AD_SLOT_FOOTER     - slot shown above the footer
 */

/** Publisher id, e.g. "ca-pub-1234567890123456". */
export const ADSENSE_CLIENT_ID: string = import.meta.env?.VITE_ADSENSE_CLIENT_ID ?? '';

/** The ad slots the app can render. */
export const AD_SLOTS = {
  home: import.meta.env?.VITE_AD_SLOT_HOME ?? '',
  afterGame: import.meta.env?.VITE_AD_SLOT_AFTER_GAME ?? '',
  inArticle: import.meta.env?.VITE_AD_SLOT_IN_ARTICLE ?? '',
  footer: import.meta.env?.VITE_AD_SLOT_FOOTER ?? '',
} as const;

export type AdSlotName = keyof typeof AD_SLOTS;

/** True when both a publisher id and a slot id are configured. */
export function isAdSlotActive(slot: AdSlotName): boolean {
  return Boolean(ADSENSE_CLIENT_ID) && Boolean(AD_SLOTS[slot]);
}

/* ------------------------------------------------------------------ *
 * AdSense script
 * ------------------------------------------------------------------ */

const AD_SENSE_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

let scriptPromise: Promise<void> | null = null;

/** Loads the AdSense script once, no matter how many slots there are. */
export function loadAdSense(): Promise<void> {
  if (!ADSENSE_CLIENT_ID) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src^="${AD_SENSE_SRC}"]`,
    );
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `${AD_SENSE_SRC}?client=${encodeURIComponent(ADSENSE_CLIENT_ID)}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('AdSense script failed to load'));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

/** Pushes an ad request onto the AdSense queue. */
export function requestAd(): void {
  const w = window as unknown as { adsbygoogle?: unknown[] };
  w.adsbygoogle = w.adsbygoogle || [];
  w.adsbygoogle.push({});
}

/* ------------------------------------------------------------------ *
 * Consent (Google Consent Mode v2)
 * ------------------------------------------------------------------ */

export type ConsentValue = 'granted' | 'denied';

const CONSENT_STORAGE_KEY = 'geoarena-consent';

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/** Google Consent Mode v2 expects these four signals. */
const CONSENT_SIGNALS = [
  'ad_storage',
  'analytics_storage',
  'ad_user_data',
  'ad_personalization',
] as const;

function pushToDataLayer(args: unknown[]): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

function readStoredConsent(): ConsentValue | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    return stored === 'granted' || stored === 'denied' ? stored : null;
  } catch {
    return null;
  }
}

let currentConsent: ConsentValue | null = readStoredConsent();
const consentListeners = new Set<() => void>();

/** The current consent value, or null when the visitor has not decided yet. */
export const getConsentSnapshot = (): ConsentValue | null => currentConsent;

export const subscribeConsent = (listener: () => void): (() => void) => {
  consentListeners.add(listener);
  return () => {
    consentListeners.delete(listener);
  };
};

/**
 * Records the visitor's choice.
 *
 * `granted` allows ad storage, analytics storage and personalised ads.
 * `denied` keeps every signal denied - ads still render, but without
 * personalised or remarketing cookies, and the visitor is not added to an
 * interest-based audience.
 */
export const setConsent = (value: ConsentValue): void => {
  currentConsent = value;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, value);
    } catch {
      // Storage may be unavailable (private mode / quota).
    }
  }
  applyConsentToGoogle(value);
  consentListeners.forEach((listener) => listener());
};

/** True when the visitor has already made a choice. */
export const hasDecidedConsent = (): boolean => currentConsent !== null;

/**
 * Sends the consent state to Google.
 *
 * The default has to be in place before the AdSense script runs, so this is
 * called once when the module loads and again whenever the choice changes.
 */
export function applyConsentToGoogle(value: ConsentValue | null): void {
  const granted = value === 'granted';
  const signals: Record<string, ConsentValue> = {};
  CONSENT_SIGNALS.forEach((signal) => {
    signals[signal] = granted ? 'granted' : 'denied';
  });
  pushToDataLayer(['consent', 'update', signals]);
}

// The default (everything denied) must be set before the ad script loads.
pushToDataLayer([
  'consent',
  'default',
  CONSENT_SIGNALS.reduce<Record<string, ConsentValue>>((acc, signal) => {
    acc[signal] = 'denied';
    return acc;
  }, {}),
]);
if (currentConsent) applyConsentToGoogle(currentConsent);

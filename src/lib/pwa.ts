/**
 * PWA install helpers.
 *
 * The browser fires `beforeinstallprompt` when the app meets the install
 * criteria. We keep the event around so the user can trigger the install
 * prompt from a button instead of relying on the browser's own UI, which
 * most people never notice.
 */

let deferredPrompt: Event | null = null;
const listeners = new Set<() => void>();

/** Notified when the availability of the install prompt changes. */
export function subscribeToInstallPrompt(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notify() {
  listeners.forEach((listener) => listener());
}

/** True when the browser has offered an install prompt we can still show. */
export function canInstall(): boolean {
  return deferredPrompt !== null;
}

/** True when the app is already running as an installed app. */
export function isInstalled(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

/**
 * True on iOS Safari, which has no install prompt but supports adding the
 * app to the home screen through the share sheet.
 */
export function isIosSafari(): boolean {
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document);
  return isIos && !/CriOS|FxiOS|EdgiOS/.test(ua);
}

let started = false;

/** Starts listening for the install prompt. Safe to call more than once. */
export function initInstallPrompt(): void {
  if (started) return;
  started = true;

  window.addEventListener('beforeinstallprompt', (event) => {
    // Stop the browser from showing its own mini-infobar, we want our button.
    event.preventDefault();
    deferredPrompt = event;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
}

/** Shows the browser's install prompt. Returns false if there was none. */
export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  const promptEvent = deferredPrompt as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  };
  await promptEvent.prompt();
  const choice = await promptEvent.userChoice;
  deferredPrompt = null;
  notify();
  return choice.outcome === 'accepted';
}

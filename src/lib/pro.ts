/**
 * Pro.
 *
 * Pro is bought through Lemon Squeezy. The buyer gets a licence key, which
 * is checked against the site after every purchase and then remembered on
 * this device, so the site knows what to do without asking every time.
 *
 * Nothing here is secret. A licence key is not a password - it can be
 * pasted into a box and used, which is exactly what it is for.
 */

const STORAGE_KEY = 'geoarena-pro';
const CHECK_URL = '/api/checkout';

export interface ProStatus {
  /** True when this device has a Pro licence. */
  isPro: boolean;
  /** The licence key, when there is one. */
  licenseKey: string | null;
  /** When the check against the server last ran. */
  checkedAt: number | null;
}

function read(): ProStatus {
  if (typeof localStorage === 'undefined') {
    return { isPro: false, licenseKey: null, checkedAt: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { isPro: false, licenseKey: null, checkedAt: null };
    const parsed = JSON.parse(raw) as Partial<ProStatus>;
    return {
      isPro: parsed.isPro === true,
      licenseKey: typeof parsed.licenseKey === 'string' ? parsed.licenseKey : null,
      checkedAt: typeof parsed.checkedAt === 'number' ? parsed.checkedAt : null,
    };
  } catch {
    return { isPro: false, licenseKey: null, checkedAt: null };
  }
}

function write(status: ProStatus): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
  } catch {
    // Storage may be unavailable - Pro still works for this session.
  }
}

/** What this device knows about Pro right now. */
export function getProStatus(): ProStatus {
  return read();
}

/** True when this device has an active Pro licence. */
export function isPro(): boolean {
  return read().isPro;
}

/** Remembers a licence key on this device, without checking it yet. */
export function setLicenseKey(licenseKey: string): void {
  const key = licenseKey.trim();
  write({
    isPro: read().isPro,
    licenseKey: key || null,
    checkedAt: read().checkedAt,
  });
  announce();
}

/** Forgets the licence on this device. */
export function clearPro(): void {
  write({ isPro: false, licenseKey: null, checkedAt: null });
  announce();
}

/** Tells the rest of the page that the licence has changed. */
function announce(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('geoarena:pro-changed'));
}

/**
 * Asks the server whether the licence is real.
 *
 * The answer decides whether the device is Pro. A network failure leaves the
 * previous answer alone rather than taking Pro away from somebody who paid.
 */
export async function verifyLicense(licenseKey: string): Promise<boolean> {
  const key = licenseKey.trim();
  if (!key) return false;

  try {
    const response = await fetch('/api/license', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ licenseKey: key }),
    });

    if (!response.ok) {
      // The server is not set up, or is having a bad day. Keep whatever we
      // knew and let the site work.
      return read().isPro;
    }

    const payload = (await response.json()) as { active?: boolean };
    const active = payload.active === true;

    const current = read();
    write({ isPro: active, licenseKey: key, checkedAt: Date.now() });
    announce();
    return active;
  } catch {
    return read().isPro;
  }
}

/**
 * Starts the checkout.
 *
 * Returns the address to send the visitor to, or a message saying why it
 * could not be started.
 */
export async function startCheckout(email?: string): Promise<
  | { ok: true; url: string; error?: never }
  | { ok: false; url?: never; error: string }
> {
  try {
    const response = await fetch(CHECK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const payload = (await response.json()) as { url?: string; error?: string };

    if (!response.ok || !payload.url) {
      return {
        ok: false,
        error: payload.error ?? 'The checkout could not be started.',
      };
    }

    return { ok: true, url: payload.url };
  } catch {
    return { ok: false, error: 'The checkout could not be started.' };
  }
}

/**
 * The sports Pro is for.
 *
 * The daily round is never filtered - everybody plays the same ten questions.
 * This only chooses which of the sports the extra rounds are drawn from.
 */
export const PRO_SPORTS = [
  { id: 'nfl', label: 'NFL', emoji: '\u{1F3C8}' },
  { id: 'mlb', label: 'MLB', emoji: '\u{26BE}' },
  { id: 'nba', label: 'NBA', emoji: '\u{1F3C0}' },
  { id: 'nhl', label: 'NHL', emoji: '\u{1F3D2}' },
  { id: 'soccer', label: 'Soccer', emoji: '\u{26BD}' },
  { id: 'racing', label: 'Racing', emoji: '\u{1F3CE}\u{FE0F}' },
] as const;

export type ProSportId = (typeof PRO_SPORTS)[number]['id'];

const PRO_SPORT_KEY = 'geoarena-pro-sport';

export function getProSport(): ProSportId {
  if (typeof localStorage === 'undefined') return 'nfl';
  try {
    const raw = localStorage.getItem(PRO_SPORT_KEY);
    if (raw && PRO_SPORTS.some((sport) => sport.id === raw)) return raw as ProSportId;
  } catch {
    // Fall through to the default.
  }
  return 'nfl';
}

export function setProSport(sport: ProSportId): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(PRO_SPORT_KEY, sport);
  } catch {
    // Storage may be unavailable.
  }
}

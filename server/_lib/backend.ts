/**
 * The little server the site talks to.
 *
 * Everything here runs on Vercel's edge or serverless functions, never in the
 * browser, so the keys stay secret. Nothing is required: each route checks
 * whether the database is set up and says so plainly when it is not, and the
 * site carries on working without it.
 */

/** True when the database is set up and the routes can do their job. */
export function isBackendConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/** A JSON response, with the headers every route needs. */
export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  });
}

/** The answer for a route that cannot work because nothing is set up. */
export function notConfigured(what: string): Response {
  return json(
    {
      configured: false,
      error: `${what} is not set up on this deployment.`,
    },
    503,
  );
}

/** Calls the Supabase REST API with the service role key. */
export async function supabase(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const base = String(process.env.SUPABASE_URL).replace(/\/$/, '');
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY);
  return fetch(`${base}${path}`, {
    ...init,
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

/**
 * A very small rate limiter.
 *
 * It counts the calls from one address inside one window. It is kept in
 * memory, so it is per instance rather than across the whole site, which is
 * enough to stop a bored person and not enough to stop a botnet - that is
 * what the database's own limits are for.
 */
const hits = new Map<string, number[]>();

/** How many addresses are remembered before the oldest ones are let go. */
const MAX_BUCKETS = 5000;

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  // The map must not grow without end. The oldest buckets go first, rather
  // than the whole map being emptied: emptying it let a flood start again
  // from nothing.
  if (hits.size > MAX_BUCKETS) {
    const excess = hits.size - MAX_BUCKETS;
    let removed = 0;
    for (const oldest of hits.keys()) {
      if (removed >= excess) break;
      hits.delete(oldest);
      removed += 1;
    }
  }
  return true;
}

/**
 * The address the call came from, for the rate limiter.
 *
 * The address has to be one the caller cannot choose. `x-forwarded-for` is
 * written by the caller first and by the proxy last, so the first entry in
 * it is whatever the caller felt like sending - and a bucket that can be
 * renamed at will is no bucket at all. The platform's own header is used
 * first, then the real address, and only then the last entry of the chain.
 *
 * When there is no address at all, the call gets a bucket of its own rather
 * than sharing one with everybody else who is also unknown: a shared bucket
 * meant that three anonymous players a minute shut the site for everybody.
 */
export function clientKey(request: Request): string {
  const headers = request.headers;

  // Vercel writes this one itself, so it cannot be forged.
  const platform = headers.get('x-vercel-forwarded-for') || headers.get('x-real-ip');
  if (platform) return platform.split(',')[0].trim();

  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    // The last entry was added by the closest proxy, so it is the one the
    // caller had no say in.
    if (parts.length > 0) return parts[parts.length - 1];
  }

  return `anon-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

/** The name of the site, used in the answers the routes send. */
export const SITE_NAME = 'USA GeoArena';

/**
 * Turns a score into something worth showing.
 *
 * Only whole numbers and the two decimals that matter are kept, so a score
 * can never carry a tail of floating point noise into the database.
 */
export function cleanNumber(value: unknown, max = 1000): number {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.round(Math.max(0, Math.min(max, number)) * 100) / 100;
}

/** A short string, with anything odd taken out. */
export function cleanText(value: unknown, maxLength = 200): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[^\p{L}\p{N} .,;:'"!?@#$%&()\-+/]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

/**
 * The hash of the device a score comes from.
 *
 * It is not a name, so it is not cleaned like one: the general text cleaner
 * took the underscores out of it, which meant the hash that was stored was
 * not the hash that was sent. Only letters, digits, dashes and underscores
 * are kept, and nothing else can get through.
 */
export function cleanHash(value: unknown, maxLength = 64): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[^\p{L}\p{N}_-]/gu, '').slice(0, maxLength);
}

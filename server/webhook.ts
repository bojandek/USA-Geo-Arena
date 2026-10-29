/**
 * The message Lemon Squeezy sends when somebody buys Pro.
 *
 * The message is checked against a signature before anything is believed, so
 * nobody can write into the database by posting to this address.
 */

import { cleanText, json, supabase } from './_lib/backend.ts';


/**
 * The keys the signature is made with.
 *
 * Importing a key is not free, and the secret does not change while the
 * function is running, so each secret is imported once and kept.
 */
const keyCache = new Map<string, Promise<CryptoKey>>();

function keyFor(secret: string): Promise<CryptoKey> {
  const cached = keyCache.get(secret);
  if (cached) return cached;

  const key = crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
  keyCache.set(secret, key);
  return key;
}

/** Turns a signature written in hex into the bytes it stands for. */
function hexBytes(hex: string): Uint8Array | null {
  if (!hex || hex.length % 2 !== 0) return null;

  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    const pair = hex.slice(index * 2, index * 2 + 2);
    if (!/^[0-9a-fA-F]{2}$/.test(pair)) return null;
    bytes[index] = Number.parseInt(pair, 16);
  }
  return bytes;
}

/**
 * Checks the signature against the body.
 *
 * The check is made by the cryptography itself rather than by comparing two
 * strings, so the time it takes does not depend on how many characters of
 * the signature were right. A comparison that returns early on the first
 * wrong character tells an attacker which characters to change.
 */
async function signatureMatches(body: string, secret: string, provided: string): Promise<boolean> {
  const bytes = hexBytes(provided.trim());
  if (!bytes) return false;

  try {
    return await crypto.subtle.verify(
      'HMAC',
      await keyFor(secret),
      bytes,
      new TextEncoder().encode(body),
    );
  } catch {
    return false;
  }
}

import { universal } from './_lib/node-adapter.ts';

async function handler(request: Request) {
  if (request.method !== 'POST') {
    return json({ error: 'That is not something this route does.' }, 405);
  }

  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  const body = await request.text();

  if (!secret) {
    return json({ error: 'The webhook is not set up on this deployment.' }, 503);
  }

  const provided = request.headers.get('x-signature') ?? '';

  if (!(await signatureMatches(body, secret, provided))) {
    return json({ error: 'The signature does not match.' }, 401);
  }

  let payload: {
    meta?: { event_name?: string };
    data?: { attributes?: Record<string, unknown> };
  };
  try {
    payload = JSON.parse(body);
  } catch {
    return json({ error: 'The message could not be read.' }, 400);
  }

  const event = payload.meta?.event_name ?? '';
  const attributes = payload.data?.attributes ?? {};

  // A licence key arrives with the order, the subscription or the licence
  // itself, depending on which one it is.
  const licenseKey = cleanText(
    attributes.license_key ??
      (attributes.meta as { custom_data?: { license_key?: string } } | undefined)?.custom_data
        ?.license_key,
    120,
  );

  if (!licenseKey) {
    // Nothing to record - this event is not about a licence.
    return json({ ok: true, recorded: false });
  }

  const email = cleanText(attributes.customer_email ?? attributes.email, 160);
  const variantId = Number(attributes.variant_id) || null;
  const status = event.includes('cancelled') || event.includes('expired')
    ? 'inactive'
    : 'active';

  const response = await supabase('/rest/v1/licenses', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      license_key: licenseKey,
      email: email || null,
      variant_id: variantId,
      status,
      order_id: cleanText(attributes.order_id ?? attributes.subscription_id, 60) || null,
    }),
  });

  if (!response.ok) {
    return json({ error: 'The licence could not be recorded.' }, 502);
  }

  return json({ ok: true, recorded: true });
}

export default universal(handler);


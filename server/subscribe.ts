/**
 * The newsletter signup.
 *
 * The form on the site posts here, and the address goes to the Mailchimp
 * list with the same key the daily email is sent with. Posting straight to a
 * provider's form from the browser could not be read back, so an address that
 * was refused simply vanished; going through the server means the visitor is
 * told when it did not work.
 */

import { clientKey, cleanText, json, rateLimit } from './_lib/backend.ts';
import { mailerConfig, subscribeMember } from './_lib/mailer.ts';
import { universal } from './_lib/node-adapter.ts';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function handler(request: Request) {
  if (request.method === 'OPTIONS') return json({}, 204);

  const config = mailerConfig();

  // A GET only says whether the signup can work, so a deploy can be checked
  // without putting an address on the list.
  if (request.method === 'GET') return json({ configured: Boolean(config) });

  if (request.method !== 'POST') {
    return json({ error: 'That is not something this route does.' }, 405);
  }
  if (!config) return json({ error: 'The newsletter is not set up yet.' }, 503);

  // Five signups a minute from one address is more than a person needs.
  if (!rateLimit(clientKey(request), 5, 60_000)) {
    return json({ error: 'Too many attempts. Wait a moment.' }, 429);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'The address could not be read.' }, 400);
  }

  // Not the general text cleaner: it takes out characters, such as the
  // underscore, that an address may carry.
  const email = typeof body.email === 'string' ? body.email.trim().slice(0, 254) : '';
  if (!EMAIL.test(email)) return json({ error: 'That address does not look right.' }, 400);
  const source = cleanText(body.source, 40).replace(/[^a-z0-9-]/gi, '');

  const result = await subscribeMember(config, email, source);
  if (!result.ok) {
    console.error('newsletter signup failed:', result.error);
    return json({ error: 'The address could not be added. Try again later.' }, 502);
  }
  return json({ ok: true, already: result.already });
}

export default universal(handler);

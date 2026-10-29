/**
 * The check for a Pro licence.
 *
 * The browser holds a licence key. This route answers whether that key is a
 * real, active licence. The key is looked up in the database that the
 * Lemon Squeezy webhook fills in.
 */

import {
  clientKey,
  cleanText,
  isBackendConfigured,
  json,
  notConfigured,
  rateLimit,
  supabase,
} from './_lib/backend.ts';


import { universal } from './_lib/node-adapter.ts';

async function handler(request: Request) {
  if (request.method !== 'POST') {
    return json({ error: 'That is not something this route does.' }, 405);
  }

  if (!isBackendConfigured()) {
    return notConfigured('Pro');
  }

  // Twenty checks a minute from one address. The browser checks the key
  // when the page is opened, so a person does it a few times a day.
  if (!rateLimit(clientKey(request), 20, 60_000)) {
    return json({ active: false, error: 'Too many attempts. Wait a moment.' }, 429);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ active: false, error: 'The key could not be read.' }, 400);
  }

  const licenseKey = cleanText(body.licenseKey, 120);
  if (!licenseKey) {
    return json({ active: false, error: 'A key is needed.' }, 400);
  }

  const response = await supabase(
    `/rest/v1/licenses` +
      `?select=status` +
      `&license_key=eq.${encodeURIComponent(licenseKey)}` +
      `&limit=1`,
  );

  if (!response.ok) {
    return json({ active: false, error: 'The key could not be checked.' }, 502);
  }

  const rows = await response.json();
  const active = Array.isArray(rows) && rows[0]?.status === 'active';

  return json({ active });
}

export default universal(handler);


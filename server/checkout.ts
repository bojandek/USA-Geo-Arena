/**
 * Buying Pro.
 *
 * The checkout is made by Lemon Squeezy, which is a merchant of record: it
 * takes the money, handles the tax and the refunds, and pays the money on.
 * That is a lot of trouble not to have, for a site that sells one thing.
 *
 * The key never reaches the browser. This route makes the checkout and hands
 * back the address to go to.
 */

import { clientKey, cleanText, json, rateLimit } from './_lib/backend.ts';


const API = 'https://api.lemonsqueezy.com/v1';

import { universal } from './_lib/node-adapter.ts';

async function handler(request: Request) {
  if (request.method !== 'POST') {
    return json({ error: 'That is not something this route does.' }, 405);
  }

  // Five checkouts a minute from one address. A person buys once.
  if (!rateLimit(clientKey(request), 5, 60_000)) {
    return json({ error: 'Too many attempts. Wait a moment.' }, 429);
  }

  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  const variantId = Number(process.env.LEMON_SQUEEZY_VARIANT_ID);

  if (!apiKey || !variantId) {
    return json(
      {
        configured: false,
        error: 'Pro is not set up on this deployment.',
      },
      503,
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const site = String(process.env.SITE_URL || 'https://geoarena.com').replace(/\/$/, '');
  const email = cleanText(body.email, 160);

  const response = await fetch(`${API}/checkouts`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: email || undefined,
            custom: { source: 'geoarena-pro-page' },
          },
          product_options: {
            redirect_url: `${site}/pro?welcome=1`,
          },
          variant_id: variantId,
        },
      },
    }),
  });

  if (!response.ok) {
    return json({ error: 'The checkout could not be started.' }, 502);
  }

  const payload = await response.json();
  const url = payload?.data?.attributes?.url;

  if (!url) {
    return json({ error: 'The checkout could not be started.' }, 502);
  }

  return json({ configured: true, url });
}

export default universal(handler);


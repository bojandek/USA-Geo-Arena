var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/webhook.ts
var webhook_exports = {};
__export(webhook_exports, {
  default: () => webhook_default
});
module.exports = __toCommonJS(webhook_exports);

// server/_lib/backend.ts
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "content-type"
    }
  });
}
async function supabase(path, init = {}) {
  const base = String(process.env.SUPABASE_URL).replace(/\/$/, "");
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY);
  return fetch(`${base}${path}`, {
    ...init,
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      ...init.headers ?? {}
    }
  });
}
function cleanText(value, maxLength = 200) {
  if (typeof value !== "string") return "";
  return value.replace(/[^\p{L}\p{N} .,;:'"!?@#$%&()\-+/]/gu, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

// server/_lib/node-adapter.ts
function requestHeaders(request) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (value === void 0) continue;
    if (Array.isArray(value)) {
      for (const part of value) headers.append(name, part);
    } else {
      headers.set(name, value);
    }
  }
  return headers;
}
async function requestBody(request) {
  if (request.method === "GET" || request.method === "HEAD") return void 0;
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return chunks.length > 0 ? Buffer.concat(chunks) : void 0;
}
function universal(webHandler) {
  return async function handler2(requestOrRequest, response) {
    if (requestOrRequest instanceof Request) {
      return webHandler(requestOrRequest);
    }
    if (!response) {
      throw new Error("The Node response object is missing.");
    }
    const request = requestOrRequest;
    const protocol = String(request.headers["x-forwarded-proto"] || "https");
    const host = String(request.headers.host || "localhost");
    const webRequest = new Request(`${protocol}://${host}${request.url || "/"}`, {
      method: request.method,
      headers: requestHeaders(request),
      body: await requestBody(request)
    });
    const webResponse = await handler2(webRequest);
    if (!(webResponse instanceof Response)) {
      throw new Error("The handler did not return a Response.");
    }
    response.statusCode = webResponse.status;
    webResponse.headers.forEach((value, name) => response.setHeader(name, value));
    response.end(Buffer.from(await webResponse.arrayBuffer()));
  };
}

// server/webhook.ts
var keyCache = /* @__PURE__ */ new Map();
function keyFor(secret) {
  const cached = keyCache.get(secret);
  if (cached) return cached;
  const key = crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  keyCache.set(secret, key);
  return key;
}
function hexBytes(hex) {
  if (!hex || hex.length % 2 !== 0) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    const pair = hex.slice(index * 2, index * 2 + 2);
    if (!/^[0-9a-fA-F]{2}$/.test(pair)) return null;
    bytes[index] = Number.parseInt(pair, 16);
  }
  return bytes;
}
async function signatureMatches(body, secret, provided) {
  const bytes = hexBytes(provided.trim());
  if (!bytes) return false;
  try {
    return await crypto.subtle.verify(
      "HMAC",
      await keyFor(secret),
      bytes,
      new TextEncoder().encode(body)
    );
  } catch {
    return false;
  }
}
async function handler(request) {
  if (request.method !== "POST") {
    return json({ error: "That is not something this route does." }, 405);
  }
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  const body = await request.text();
  if (!secret) {
    return json({ error: "The webhook is not set up on this deployment." }, 503);
  }
  const provided = request.headers.get("x-signature") ?? "";
  if (!await signatureMatches(body, secret, provided)) {
    return json({ error: "The signature does not match." }, 401);
  }
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    return json({ error: "The message could not be read." }, 400);
  }
  const event = payload.meta?.event_name ?? "";
  const attributes = payload.data?.attributes ?? {};
  const licenseKey = cleanText(
    attributes.license_key ?? attributes.meta?.custom_data?.license_key,
    120
  );
  if (!licenseKey) {
    return json({ ok: true, recorded: false });
  }
  const email = cleanText(attributes.customer_email ?? attributes.email, 160);
  const variantId = Number(attributes.variant_id) || null;
  const status = event.includes("cancelled") || event.includes("expired") ? "inactive" : "active";
  const response = await supabase("/rest/v1/licenses", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      license_key: licenseKey,
      email: email || null,
      variant_id: variantId,
      status,
      order_id: cleanText(attributes.order_id ?? attributes.subscription_id, 60) || null
    })
  });
  if (!response.ok) {
    return json({ error: "The licence could not be recorded." }, 502);
  }
  return json({ ok: true, recorded: true });
}
var webhook_default = universal(handler);
module.exports = module.exports.default ?? module.exports;

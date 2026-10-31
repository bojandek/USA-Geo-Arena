var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/subscribe.ts
var subscribe_exports = {};
__export(subscribe_exports, {
  default: () => subscribe_default
});
module.exports = __toCommonJS(subscribe_exports);

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
var hits = /* @__PURE__ */ new Map();
var MAX_BUCKETS = 5e3;
function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
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
function clientKey(request) {
  const headers = request.headers;
  const platform = headers.get("x-vercel-forwarded-for") || headers.get("x-real-ip");
  if (platform) return platform.split(",")[0].trim();
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((part) => part.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return `anon-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}
function cleanText(value, maxLength = 200) {
  if (typeof value !== "string") return "";
  return value.replace(/[^\p{L}\p{N} .,;:'"!?@#$%&()\-+/]/gu, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

// server/_lib/mailer.ts
function mailerConfig() {
  const apiKey = process.env.MAILCHIMP_API_KEY?.trim();
  const listId = process.env.MAILCHIMP_LIST_ID?.trim();
  if (!apiKey || !listId) return null;
  return {
    apiKey,
    listId,
    fromName: process.env.MAILCHIMP_FROM_NAME?.trim() || "USA GeoArena",
    replyTo: process.env.MAILCHIMP_REPLY_TO?.trim() || "contact@geoarena.com"
  };
}
function mailchimpDataCenter(apiKey) {
  const dash = apiKey.lastIndexOf("-");
  return dash > 0 ? apiKey.slice(dash + 1) : "us1";
}
function authorization(apiKey) {
  return `Basic ${btoa(`geoarena:${apiKey}`)}`;
}
async function describe(response) {
  try {
    const payload = await response.json();
    const detail = payload?.detail ?? payload?.title ?? payload?.message;
    if (typeof detail === "string" && detail) return detail;
  } catch {
  }
  return `The provider answered with ${response.status}.`;
}
async function subscribeMember(config, email, source) {
  const base = `https://${mailchimpDataCenter(config.apiKey)}.api.mailchimp.com/3.0`;
  const headers = {
    authorization: authorization(config.apiKey),
    "content-type": "application/json"
  };
  const address = email.trim().toLowerCase();
  const { createHash } = await import("node:crypto");
  const hash = createHash("md5").update(address).digest("hex");
  const response = await fetch(`${base}/lists/${config.listId}/members/${hash}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ email_address: address, status_if_new: "pending" })
  });
  if (!response.ok) {
    return { ok: false, already: false, error: await describe(response) };
  }
  const member = await response.json().catch(() => ({}));
  if (source) {
    await fetch(`${base}/lists/${config.listId}/members/${hash}/tags`, {
      method: "POST",
      headers,
      body: JSON.stringify({ tags: [{ name: `signup-${source}`, status: "active" }] })
    }).catch(() => void 0);
  }
  return { ok: true, already: member.status === "subscribed", error: null };
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

// server/subscribe.ts
var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
async function handler(request) {
  if (request.method === "OPTIONS") return json({}, 204);
  const config = mailerConfig();
  if (request.method === "GET") return json({ configured: Boolean(config) });
  if (request.method !== "POST") {
    return json({ error: "That is not something this route does." }, 405);
  }
  if (!config) return json({ error: "The newsletter is not set up yet." }, 503);
  if (!rateLimit(clientKey(request), 5, 6e4)) {
    return json({ error: "Too many attempts. Wait a moment." }, 429);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "The address could not be read." }, 400);
  }
  const email = typeof body.email === "string" ? body.email.trim().slice(0, 254) : "";
  if (!EMAIL.test(email)) return json({ error: "That address does not look right." }, 400);
  const source = cleanText(body.source, 40).replace(/[^a-z0-9-]/gi, "");
  const result = await subscribeMember(config, email, source);
  if (!result.ok) {
    console.error("newsletter signup failed:", result.error);
    return json({ error: "The address could not be added. Try again later." }, 502);
  }
  return json({ ok: true, already: result.already });
}
var subscribe_default = universal(handler);
module.exports = module.exports.default ?? module.exports;

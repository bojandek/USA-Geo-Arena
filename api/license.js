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

// server/license.ts
var license_exports = {};
__export(license_exports, {
  default: () => license_default
});
module.exports = __toCommonJS(license_exports);

// server/_lib/backend.ts
function isBackendConfigured() {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
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
function notConfigured(what) {
  return json(
    {
      configured: false,
      error: `${what} is not set up on this deployment.`
    },
    503
  );
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

// server/license.ts
async function handler(request) {
  if (request.method !== "POST") {
    return json({ error: "That is not something this route does." }, 405);
  }
  if (!isBackendConfigured()) {
    return notConfigured("Pro");
  }
  if (!rateLimit(clientKey(request), 20, 6e4)) {
    return json({ active: false, error: "Too many attempts. Wait a moment." }, 429);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ active: false, error: "The key could not be read." }, 400);
  }
  const licenseKey = cleanText(body.licenseKey, 120);
  if (!licenseKey) {
    return json({ active: false, error: "A key is needed." }, 400);
  }
  const response = await supabase(
    `/rest/v1/licenses?select=status&license_key=eq.${encodeURIComponent(licenseKey)}&limit=1`
  );
  if (!response.ok) {
    return json({ active: false, error: "The key could not be checked." }, 502);
  }
  const rows = await response.json();
  const active = Array.isArray(rows) && rows[0]?.status === "active";
  return json({ active });
}
var license_default = universal(handler);
module.exports = module.exports.default ?? module.exports;

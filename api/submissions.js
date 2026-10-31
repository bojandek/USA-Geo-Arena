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

// server/submissions.ts
var submissions_exports = {};
__export(submissions_exports, {
  default: () => submissions_default
});
module.exports = __toCommonJS(submissions_exports);

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

// server/submissions.ts
function optionalCoordinate(value, limit) {
  if (value === null || value === void 0 || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  if (number < -limit || number > limit) return null;
  return number;
}
async function handler(request) {
  if (request.method === "OPTIONS") {
    return json({}, 204);
  }
  if (request.method !== "POST") {
    return json({ error: "That is not something this route does." }, 405);
  }
  if (!rateLimit(clientKey(request), 3, 6e4)) {
    return json({ error: "Too many submissions. Wait a moment." }, 429);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "The question could not be read." }, 400);
  }
  const questionText = cleanText(body.questionText, 400);
  if (questionText.length < 10) {
    return json({ error: "The question needs a little more to it." }, 400);
  }
  const submission = {
    question_text: questionText,
    venue: cleanText(body.venue, 120) || null,
    hint: cleanText(body.hint, 120) || null,
    country: cleanText(body.country, 80) || null,
    latitude: optionalCoordinate(body.latitude, 90),
    longitude: optionalCoordinate(body.longitude, 180),
    facts: cleanText(body.facts, 1e3) || null,
    submitter_email: cleanText(body.email, 160) || null,
    kind: body.kind === "correction" ? "correction" : "new",
    status: "new"
  };
  if (!isBackendConfigured()) {
    return json(
      {
        configured: false,
        error: "Submissions are not set up on this deployment."
      },
      503
    );
  }
  const response = await supabase("/rest/v1/question_submissions", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(submission)
  });
  if (!response.ok) {
    return json({ error: "The question could not be saved." }, 502);
  }
  return json({ configured: true, saved: true });
}
var submissions_default = universal(handler);
module.exports = module.exports.default ?? module.exports;

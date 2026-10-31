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

// server/share.ts
var share_exports = {};
__export(share_exports, {
  default: () => share_default
});
module.exports = __toCommonJS(share_exports);

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

// server/share.ts
var MAX_SCORE = 1e3;
function readNumber(value, fallback, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(max, Math.round(number)));
}
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
async function handler(request) {
  const { searchParams } = new URL(request.url);
  const score = readNumber(searchParams.get("score"), 0, MAX_SCORE);
  const max = readNumber(searchParams.get("max"), MAX_SCORE, MAX_SCORE);
  const streak = readNumber(searchParams.get("streak"), 0, 9999);
  const region = searchParams.get("region") === "world" ? "World" : "USA";
  const site = String(process.env.SITE_URL || "https://geo-arena-six.vercel.app").replace(/\/$/, "");
  const percentage = max > 0 ? Math.round(score / max * 100) : 0;
  const day = searchParams.get("day") ?? "";
  const dayTime = /^\d{4}-\d{2}-\d{2}$/.test(day) ? Date.parse(`${day}T12:00:00Z`) : NaN;
  const isCurrent = Number.isFinite(dayTime) && Math.abs(Date.now() - dayTime) <= 36 * 60 * 60 * 1e3;
  const beat = readNumber(searchParams.get("score"), 0, 1e5);
  const target = `${site}/${region === "World" ? "world" : "daily"}${isCurrent && beat > 0 ? `?beat=${beat}` : ""}`;
  const landing = `${target}${target.includes("?") ? "&" : "?"}utm_source=share&utm_medium=social&utm_campaign=daily-result`;
  const image = `${site}/og-image.png`;
  const title = `I scored ${score.toLocaleString("en-US")} points on today's ${region} Challenge`;
  const description = `${percentage}% of the best round${streak > 1 ? `, on a ${streak} day streak` : ""}. Ten questions a day about NFL, MLB, NBA and NHL stadiums. Can you beat it?`;
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="USA GeoArena" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(target)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="A score of ${score} points on the USA GeoArena ${region} Challenge" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />

    <meta http-equiv="refresh" content="0; url=${escapeHtml(landing)}" />
    <script>window.location.replace(${JSON.stringify(landing)});</script>
  </head>
  <body style="font-family:system-ui,sans-serif;background:#12141A;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
    <p>Taking you to the game&hellip; <a style="color:#FF4655" href="${escapeHtml(landing)}">Continue</a></p>
  </body>
</html>`;
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
var share_default = universal(handler);
module.exports = module.exports.default ?? module.exports;

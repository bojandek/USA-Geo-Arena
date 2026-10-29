/**
 * Lets one handler serve both Vercel's Node runtime and the tests.
 *
 * Vercel calls Node functions with `(request, response)`, while the routes are
 * written against the web `Request`/`Response` pair. This adapter bridges the
 * two without duplicating a route. When tests call the same export with a
 * `Request`, the handler is used directly.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';

export type WebHandler = (request: Request) => Promise<Response> | Response;

function requestHeaders(request: IncomingMessage): Headers {
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const part of value) headers.append(name, part);
    } else {
      headers.set(name, value);
    }
  }
  return headers;
}

async function requestBody(request: IncomingMessage): Promise<Buffer | undefined> {
  if (request.method === 'GET' || request.method === 'HEAD') return undefined;

  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return chunks.length > 0 ? Buffer.concat(chunks) : undefined;
}

/**
 * A function that can be called either as a web handler or as a Node handler.
 *
 * The tests call it with a `Request`; Vercel's Node runtime calls it with
 * `IncomingMessage` and `ServerResponse`.
 */
export function universal(webHandler: WebHandler) {
  return async function handler(
    requestOrRequest: Request | IncomingMessage,
    response?: ServerResponse,
  ): Promise<Response | void> {
    if (requestOrRequest instanceof Request) {
      return webHandler(requestOrRequest);
    }

    if (!response) {
      throw new Error('The Node response object is missing.');
    }

    const request = requestOrRequest;
    const protocol = String(request.headers['x-forwarded-proto'] || 'https');
    const host = String(request.headers.host || 'localhost');
    const webRequest = new Request(`${protocol}://${host}${request.url || '/'}`, {
      method: request.method,
      headers: requestHeaders(request),
      body: await requestBody(request),
    });

    const webResponse = await handler(webRequest);
    if (!(webResponse instanceof Response)) {
      throw new Error('The handler did not return a Response.');
    }
    response.statusCode = webResponse.status;
    webResponse.headers.forEach((value, name) => response.setHeader(name, value));
    response.end(Buffer.from(await webResponse.arrayBuffer()));
  };
}

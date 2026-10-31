import { defineConfig, loadEnv, type Plugin } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import fs from "fs";
import path from "path";

/**
 * Serves the API routes during `vite dev`.
 *
 * On Vercel every file in /api is a function. Vite knows nothing about them,
 * so without this a local POST to /api/tournament came back 404 and starting
 * a tournament failed. This dev-only middleware runs the same handlers from
 * /server on the Vite server, with the server-side variables from the env
 * files. It is never part of a production build.
 */
function localApi(mode: string): Plugin {
  return {
    name: "local-api",
    apply: "serve",
    configureServer(server) {
      // Server code reads process.env, which Vite only fills with VITE_
      // variables. The rest are copied over, without overriding the shell.
      const env = loadEnv(mode, process.cwd(), "");
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) process.env[key] = value;
      }
      if (!process.env.SITE_URL) process.env.SITE_URL = "http://localhost:5173";

      server.middlewares.use("/api", async (req, res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        const route = url.pathname.replace(/^\/+|\/+$/g, "");
        const file = path.resolve(__dirname, "server", `${route}.ts`);
        if (!/^[a-z0-9/-]+$/i.test(route) || !fs.existsSync(file)) {
          next();
          return;
        }
        try {
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (value) headers.set(key, Array.isArray(value) ? value.join(",") : value);
          }
          const chunks: Buffer[] = [];
          if (req.method !== "GET" && req.method !== "HEAD") {
            for await (const chunk of req) chunks.push(Buffer.from(chunk));
          }
          const request = new Request(`http://localhost:5173/api${req.url ?? ""}`, {
            method: req.method,
            headers,
            body: chunks.length > 0 ? Buffer.concat(chunks) : undefined,
          });
          const module = await server.ssrLoadModule(`/server/${route}.ts`);
          const response: Response = await module.default(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("content-type", "text/plain; charset=utf-8");
          res.end(error instanceof Error ? error.message : "API failed");
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [dyadComponentTagger(), react(), localApi(mode)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

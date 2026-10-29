import { defineConfig, loadEnv, type Plugin } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/**
 * Serves the admin newsletter route during `vite dev`.
 *
 * Vercel's SPA rewrite treats /admin/newsletter as an HTML module and Vite
 * answers 500. The admin still has to be testable locally, so this dev-only
 * middleware runs the same edge handler on the Vite server. It is never part
 * of a production build.
 */
function adminNewsletterApi(mode: string): Plugin {
  return {
    name: "admin-newsletter-api",
    apply: "serve",
    configureServer(server) {
      const env = loadEnv(mode, process.cwd(), "");
      if (!process.env.ADMIN_SECRET && env.ADMIN_SECRET) {
        process.env.ADMIN_SECRET = env.ADMIN_SECRET;
      }
      if (!process.env.SITE_URL) {
        process.env.SITE_URL = env.SITE_URL || "http://localhost:5173";
      }

      server.middlewares.use("/api/admin/newsletter", async (req, res, next) => {
        if (req.method !== "GET") {
          next();
          return;
        }
        try {
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (value) headers.set(key, Array.isArray(value) ? value.join(",") : value);
          }
          const request = new Request(
            `http://localhost/api/admin/newsletter${req.url ?? ""}`,
            { method: req.method, headers },
          );
          const module = await server.ssrLoadModule(
            "/server/admin/newsletter.ts",
          );
          const response = await module.default(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("content-type", "text/plain; charset=utf-8");
          res.end(error instanceof Error ? error.message : "Admin API failed");
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
  plugins: [dyadComponentTagger(), react(), adminNewsletterApi(mode)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

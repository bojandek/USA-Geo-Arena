/**
 * Bundles the server routes into self-contained Vercel functions.
 *
 * Vercel's Node builder does not bundle relative imports for functions that
 * live under `api/`; it transpiles each file one-to-one and lets Node resolve
 * the rest at runtime. That breaks as soon as a route imports shared code from
 * `src/` or a helper from `server/_lib`.
 *
 * The source therefore lives in `server/` and this script writes one bundled
 * CommonJS file per route into `api/`. Local imports, JSX and shared modules
 * are inlined; npm packages stay external and are installed by Vercel.
 */

import { mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve('.');
const SERVER = path.join(ROOT, 'server');
const API = path.join(ROOT, 'api');

async function loadEsbuild() {
  try {
    return await import('esbuild');
  } catch {
    // pnpm keeps direct dependencies out of the root node_modules unless they
    // are declared; Vite already brings esbuild, so use its copy as a fallback.
    const store = path.join(ROOT, 'node_modules', '.pnpm');
    const directory = (await readdir(store)).find((name) =>
      name.startsWith('esbuild@'),
    );
    if (!directory) throw new Error('esbuild is not installed.');
    const entry = path.join(store, directory, 'node_modules', 'esbuild', 'lib', 'main.js');
    return import(pathToFileURL(entry).href);
  }
}

async function routeFiles(directory) {
  const files = await readdir(directory, { withFileTypes: true });
  return files.filter(
    (entry) =>
      entry.isFile() &&
      /\.(ts|tsx)$/.test(entry.name) &&
      !entry.name.endsWith('.d.ts'),
  );
}

async function entries() {
  const found = [];
  for (const file of await routeFiles(SERVER)) {
    found.push({
      in: path.join(SERVER, file.name),
      out: file.name.replace(/\.tsx?$/, ''),
    });
  }
  for (const file of await routeFiles(path.join(SERVER, 'admin'))) {
    found.push({
      in: path.join(SERVER, 'admin', file.name),
      out: path.join('admin', file.name.replace(/\.tsx?$/, '')),
    });
  }
  return found;
}

const { build } = await loadEsbuild();
const files = await entries();

// Remove bundles from an older build so a deleted route cannot linger in the
// deployment. Keep package.json, which tells Vercel these functions are CJS.
await mkdir(path.join(API, 'admin'), { recursive: true });
for (const name of await readdir(API)) {
  if (/\.(js|mjs)$/.test(name)) {
    await rm(path.join(API, name), { force: true });
  }
}
for (const name of await readdir(path.join(API, 'admin'))) {
  if (/\.js$/.test(name)) {
    await rm(path.join(API, 'admin', name), { force: true });
  }
}

await build({
  entryPoints: files,
  outdir: API,
  bundle: true,
  format: 'cjs',
  platform: 'node',
  target: 'node20',
  packages: 'external',
  sourcemap: false,
  logLevel: 'info',
  // esbuild writes `exports.default` for an `export default`; Vercel's Node
  // launcher expects the function itself from a CommonJS module.
  footer: { js: 'module.exports = module.exports.default ?? module.exports;' },
});

console.log(`Bundled ${files.length} API route(s) into api/.`);

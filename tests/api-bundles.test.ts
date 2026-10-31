/**
 * The bundled functions in api/ are committed, because Vercel finds its
 * functions by the files in the repository before the build runs. Without
 * them every /api route answers 404 in production. This fails when a change
 * to server/ was not bundled again with `npm run build:api`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('api/ matches the routes in server/', () => {
  const run = spawnSync(process.execPath, ['scripts/build-api.mjs', '--check'], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr || run.stdout);
});

/**
 * Verifies that every source file is valid UTF-8 and free of mojibake.
 * Run with: node scripts/check-encoding.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['src', 'tests'];
const EXTENSIONS = ['.ts', '.tsx', '.css', '.json', '.html'];
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.dyad']);

const problems = [];
let scanned = 0;

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
      continue;
    }
    if (!EXTENSIONS.some((ext) => entry.endsWith(ext))) continue;

    scanned++;
    const content = readFileSync(full, 'utf8');

    if (content.includes('\uFFFD')) {
      problems.push(`${full}: contains a Unicode replacement character`);
    }

    // Runs of Latin-1 letters are the classic sign of a mis-decoded UTF-8 file.
    const mojibake = content.match(/[\u00C0-\u00FF]{3,}/g);
    if (mojibake) {
      problems.push(`${full}: suspect mojibake -> ${mojibake.slice(0, 3).join(', ')}`);
    }
  }
}

for (const root of ROOTS) {
  try {
    walk(root);
  } catch {
    // Directory does not exist - nothing to scan.
  }
}

console.log(`Scanned ${scanned} files.`);
if (problems.length > 0) {
  console.error('Encoding problems found:');
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log('No encoding corruption found.');

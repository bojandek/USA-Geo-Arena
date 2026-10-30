// Renders the PNG app icons from public/brand-icon.svg.
//
// Run generate-icon.cjs first when the globe changes, then this script. It
// needs Chrome or Edge on the machine; set BROWSER to point at another one.
//
//   node scripts/brand/generate-png-icons.cjs

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..');
const OUT = path.join(ROOT, 'public', 'icons');

const CANDIDATES = [
  process.env.BROWSER,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const browser = CANDIDATES.find((p) => fs.existsSync(p));
if (!browser) throw new Error('No Chrome or Edge found - set BROWSER to one.');

const ICONS = [
  { file: 'icon-192.png', size: 192, mode: 'any' },
  { file: 'icon-512.png', size: 512, mode: 'any' },
  { file: 'icon-maskable-512.png', size: 512, mode: 'maskable' },
  { file: 'apple-touch-icon.png', size: 180, mode: 'apple' },
];

const template = pathToFileURL(path.join(HERE, 'icon.html')).href;
for (const icon of ICONS) {
  const target = path.join(OUT, icon.file);
  execFileSync(browser, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--allow-file-access-from-files',
    '--force-device-scale-factor=1',
    '--default-background-color=00000000',
    `--window-size=${icon.size},${icon.size}`,
    `--screenshot=${target}`,
    `${template}?size=${icon.size}&mode=${icon.mode}`,
  ], { stdio: 'ignore' });
  console.log(icon.file, fs.statSync(target).size, 'bytes');
}

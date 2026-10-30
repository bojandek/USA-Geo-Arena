// Renders public/og-image.png, the share card, from og.html.
//
// It needs Chrome or Edge on the machine (set BROWSER to point at another
// one) and a network connection for the Google fonts.
//
//   node scripts/brand/generate-og-image.cjs

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..');
const TARGET = path.join(ROOT, 'public', 'og-image.png');

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

execFileSync(browser, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--allow-file-access-from-files',
  '--force-device-scale-factor=1',
  // Gives the fonts and the globe time to load before the screenshot.
  '--virtual-time-budget=8000',
  '--window-size=1200,630',
  `--screenshot=${TARGET}`,
  pathToFileURL(path.join(HERE, 'og.html')).href,
], { stdio: 'ignore' });
console.log('og-image.png', fs.statSync(TARGET).size, 'bytes');

// Renders the PNG app icons, the email icon and favicon.ico from the SVGs
// generate-icon.cjs writes.
//
// Run generate-icon.cjs first when the mark changes, then this script. It
// needs Chrome or Edge on the machine; set BROWSER to point at another one.
//
//   node scripts/brand/generate-png-icons.cjs

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..');
const PUBLIC = path.join(ROOT, 'public');

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

const template = pathToFileURL(path.join(HERE, 'icon.html')).href;
function render(target, size, mode) {
  execFileSync(browser, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--allow-file-access-from-files',
    '--force-device-scale-factor=1',
    '--default-background-color=00000000',
    `--window-size=${size},${size}`,
    `--screenshot=${target}`,
    `${template}?size=${size}&mode=${mode}`,
  ], { stdio: 'ignore' });
}

const ICONS = [
  { file: 'icons/icon-192.png', size: 192, mode: 'any' },
  { file: 'icons/icon-512.png', size: 512, mode: 'any' },
  { file: 'icons/icon-maskable-512.png', size: 512, mode: 'maskable' },
  { file: 'icons/apple-touch-icon.png', size: 180, mode: 'apple' },
  // The emails show it at 36-64 px; 192 keeps it sharp on retina screens.
  { file: 'email-icon.png', size: 192, mode: 'any' },
];
for (const icon of ICONS) {
  const target = path.join(PUBLIC, icon.file);
  render(target, icon.size, icon.mode);
  console.log(icon.file, fs.statSync(target).size, 'bytes');
}

// favicon.ico for the browsers and crawlers that ask for it by name rather
// than reading the SVG link. Every modern reader accepts PNG data inside an
// ICO, so the entries are PNGs as rendered.
const sizes = [16, 32, 48];
const pngs = sizes.map((size) => {
  const tmp = path.join(os.tmpdir(), `geoarena-favicon-${size}.png`);
  render(tmp, size, 'any');
  const data = fs.readFileSync(tmp);
  fs.unlinkSync(tmp);
  return data;
});
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(size, e);
  header.writeUInt8(size, e + 1);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(pngs[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
const ico = path.join(PUBLIC, 'favicon.ico');
fs.writeFileSync(ico, Buffer.concat([header, ...pngs]));
console.log('favicon.ico', fs.statSync(ico).size, 'bytes');

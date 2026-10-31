// Generates the brand mark: a brand-red app tile with a globe centred on the
// USA, the country in brand red, circled by a glowing white orbit ring.
//
// The country shapes come from real data (US Census state outlines, Natural
// Earth for the rest of the world) projected orthographically, the way a
// globe is actually seen from space.
//
//   node scripts/brand/generate-icon.cjs
//
// Writes two files:
//   public/brand-icon.svg            rounded tile - the site, favicon, any-purpose icons
//   scripts/brand/brand-icon-square.svg  square full-bleed tile with the mark
//                                    inside the 80% safe zone - maskable and
//                                    Apple icons, which the OS rounds itself

const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..');
const land = JSON.parse(fs.readFileSync(path.join(HERE, 'land-110m.json'), 'utf8'));
const states = JSON.parse(fs.readFileSync(path.join(HERE, 'us-states.json'), 'utf8'));

const rad = (d) => (d * Math.PI) / 180, sin = Math.sin, cos = Math.cos;
const f = (n) => Math.round(n * 100) / 100;
// The coastlines are written to a tenth of a unit. The mark is never shown
// bigger than 512 px, where a tenth is half a pixel.
const f1 = (n) => Math.round(n * 10) / 10;

// How far, in canvas units, a simplified coastline may stray from the data.
// At 0.12 the outline is the same shape at every size the mark is used, with
// a fraction of the points; the full data made the file 127 KB.
const TOLERANCE = 0.12;

// Douglas-Peucker: keep the points that bend the line, drop the ones that
// sit on it.
function simplify(points, tolerance) {
  if (points.length < 3) return points;
  const keep = new Array(points.length).fill(false);
  keep[0] = keep[points.length - 1] = true;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    const a = points[first], b = points[last];
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
    let worst = 0, index = -1;
    for (let i = first + 1; i < last; i++) {
      const p = points[i];
      // A closed ring starts and ends on the same point, so there is no line
      // to measure from: the distance is to that point instead.
      const dist = len === 0
        ? Math.hypot(p.x - a.x, p.y - a.y)
        : Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / len;
      if (dist > worst) { worst = dist; index = i; }
    }
    if (worst > tolerance) {
      keep[index] = true;
      stack.push([first, index], [index, last]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

function makeProjection(lon0, lat0) {
  return (lon, lat) => {
    const lam = rad(lon - lon0), phi = rad(lat), phi0 = rad(lat0);
    const cosC = sin(phi0) * sin(phi) + cos(phi0) * cos(phi) * cos(lam);
    return { x: cos(phi) * sin(lam), y: -(cos(phi0) * sin(phi) - sin(phi0) * cos(phi) * cos(lam)), visible: cosC > 0 };
  };
}

// A ring that runs over the horizon stays one ring: the points behind the
// globe are pushed out to its rim, so the outline follows the edge of the
// sphere. Cutting the ring into its visible pieces and closing each one with
// a straight line drew chords across the globe.
function ringPath(ring, project, cx, cy, r, minArea) {
  const pts = ring.map(([lon, lat]) => project(lon, lat));
  if (!pts.some((p) => p.visible)) return '';
  const run = pts.map((p) => {
    if (p.visible) return { x: cx + p.x * r, y: cy + p.y * r };
    const len = Math.hypot(p.x, p.y) || 1;
    return { x: cx + (p.x / len) * r * 1.02, y: cy + (p.y / len) * r * 1.02 };
  });
  let area = 0;
  for (let i = 0; i < run.length; i++) { const a = run[i], b = run[(i + 1) % run.length]; area += a.x * b.y - b.x * a.y; }
  if (Math.abs(area / 2) < minArea) return '';
  const kept = simplify(run, TOLERANCE)
    .map((p) => `${f1(p.x)},${f1(p.y)}`)
    .filter((p, i, all) => i === 0 || p !== all[i - 1]);
  return kept.length < 3 ? '' : 'M' + kept.join('L') + 'Z';
}

function collect(features, project, cx, cy, r, minArea) {
  let d = '';
  for (const feat of features) {
    const g = feat.geometry; if (!g) continue;
    const rings = g.type === 'Polygon' ? g.coordinates : g.type === 'MultiPolygon' ? g.coordinates.flat() : [];
    for (const ring of rings) d += ringPath(ring, project, cx, cy, r, minArea);
  }
  return d;
}

function gridPath(project, cx, cy, r) {
  let d = '';
  const line = (pts) => {
    let run = [];
    const flush = () => {
      if (run.length > 1) d += 'M' + simplify(run, TOLERANCE / 2).map((p) => `${f1(p.x)},${f1(p.y)}`).join('L');
      run = [];
    };
    for (const p of pts) {
      if (!p.visible) { flush(); continue; }
      run.push({ x: cx + p.x * r, y: cy + p.y * r });
    }
    flush();
  };
  for (let lon = -180; lon < 180; lon += 20) {
    const pts = []; for (let lat = -90; lat <= 90; lat += 3) pts.push(project(lon, lat)); line(pts);
  }
  for (let lat = -60; lat <= 60; lat += 20) {
    const pts = []; for (let lon = -180; lon <= 180; lon += 3) pts.push(project(lon, lat)); line(pts);
  }
  return d;
}

// The globe and its orbit, drawn on a 100x100 canvas around (50, 50).
const project = makeProjection(-98, 36);
const CX = 50, CY = 50, R = 29, SW = R / 50;
const otherLand = collect(land.features, project, CX, CY, R, 3.5 * SW * SW);
const us = collect(states.features, project, CX, CY, R, 0.02 * SW * SW);
const grid = gridPath(project, CX, CY, R);

const defs = `<defs>
  <linearGradient id="tile" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#FF5C68"/><stop offset="100%" stop-color="#D42639"/>
  </linearGradient>
  <radialGradient id="glow" cx="0.5" cy="0.45" r="0.55">
    <stop offset="0%" stop-color="#FFD1C4" stop-opacity="0.45"/><stop offset="100%" stop-color="#FFD1C4" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="ring" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#FFE3D6"/><stop offset="50%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#FFE3D6"/>
  </linearGradient>
  <filter id="ringglow" x="-20%" y="-50%" width="140%" height="200%">
    <feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <radialGradient id="ocean" cx="0.35" cy="0.3" r="0.85">
    <stop offset="0%" stop-color="#5fb0f0"/><stop offset="45%" stop-color="#2560b0"/><stop offset="100%" stop-color="#081a3a"/>
  </radialGradient>
  <radialGradient id="shade" cx="0.32" cy="0.26" r="0.95">
    <stop offset="0%" stop-color="#fff" stop-opacity="0.28"/><stop offset="35%" stop-color="#fff" stop-opacity="0"/>
    <stop offset="75%" stop-color="#000" stop-opacity="0.15"/><stop offset="100%" stop-color="#000" stop-opacity="0.5"/>
  </radialGradient>
  <linearGradient id="us" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#FF6A5C"/><stop offset="100%" stop-color="#E8203F"/>
  </linearGradient>
  <clipPath id="sphere"><circle cx="${CX}" cy="${CY}" r="${R}"/></clipPath>
  <path id="usa" d="${us}"/>
</defs>`;

// The back half of the orbit goes behind the globe, the front half over it.
const mark = `
  <g transform="rotate(-18 50 50)">
    <path d="M7,50 A43,12 0 0 1 93,50" fill="none" stroke="url(#ring)" stroke-opacity="0.55" stroke-width="2.6"/>
  </g>
  <circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#ocean)"/>
  <g clip-path="url(#sphere)">
    <path d="${grid}" fill="none" stroke="#bfe2ff" stroke-opacity="0.18" stroke-width="${f(0.5 * SW)}"/>
    <path d="${otherLand}" fill="#2f5873" stroke="#2f5873" stroke-width="${f(0.35 * SW)}"/>
    <use href="#usa" fill="#fff" stroke="#fff" stroke-width="${f(1.8 * SW)}" stroke-linejoin="round"/>
    <use href="#usa" fill="url(#us)"/>
    <circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#shade)"/>
  </g>
  <circle cx="${CX}" cy="${CY}" r="${f(R - 0.4 * SW)}" fill="none" stroke="#cfeaff" stroke-opacity="0.45" stroke-width="${f(0.8 * SW)}"/>
  <g transform="rotate(-18 50 50)" filter="url(#ringglow)">
    <path d="M93,50 A43,12 0 0 1 7,50" fill="none" stroke="url(#ring)" stroke-width="3.4" stroke-linecap="round"/>
    <circle cx="66" cy="61.3" r="3.1" fill="#FFB905"/>
  </g>`;

const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" role="img" aria-labelledby="t"><title id="t">USA GeoArena</title>${defs}${body}</svg>`;

const rounded = svg(`
  <rect width="100" height="100" rx="22" fill="url(#tile)"/>
  <rect width="100" height="100" rx="22" fill="url(#glow)"/>
  ${mark}
  <rect x="0.5" y="0.5" width="99" height="99" rx="21.5" fill="none" stroke="#fff" stroke-opacity="0.08"/>`);

// The orbit reaches x = 7..93; scaled to 0.84 it stays inside the 10..90
// safe zone Android may crop a maskable icon to.
const square = svg(`
  <rect width="100" height="100" fill="url(#tile)"/>
  <rect width="100" height="100" fill="url(#glow)"/>
  <g transform="translate(50 50) scale(0.84) translate(-50 -50)">${mark}</g>`);

const write = (file, content) => {
  fs.writeFileSync(file, content);
  console.log(path.relative(ROOT, file), fs.statSync(file).size, 'bytes');
};
write(path.join(ROOT, 'public', 'brand-icon.svg'), rounded);
write(path.join(HERE, 'brand-icon-square.svg'), square);

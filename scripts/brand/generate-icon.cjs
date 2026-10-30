const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..');
const rad = (d) => (d * Math.PI) / 180, sin = Math.sin, cos = Math.cos;
const R = 50, LON0 = -98, LAT0 = 38;
const project = (lon, lat) => {
  const lam = rad(lon - LON0), phi = rad(lat), phi0 = rad(LAT0);
  const cosC = sin(phi0)*sin(phi) + cos(phi0)*cos(phi)*cos(lam);
  return { x: 50 + R*cos(phi)*sin(lam), y: 50 - R*(cos(phi0)*sin(phi) - sin(phi0)*cos(phi)*cos(lam)), visible: cosC > 0 };
};
const f = (n) => Math.round(n * 10) / 10;
// A ring that runs over the horizon stays one ring: the points behind the
// globe are pushed out to its rim, so the outline follows the edge of the
// sphere. Cutting the ring into its visible pieces and closing each one with
// a straight line drew chords across the globe - the stripe through the
// Americas came from exactly that.
function ringPath(ring, minArea) {
  const pts = ring.map(([lon, lat]) => project(lon, lat));
  if (!pts.some((p) => p.visible)) return '';
  const run = pts.map((p) => {
    if (p.visible) return p;
    const dx = p.x - 50, dy = p.y - 50, len = Math.hypot(dx, dy) || 1;
    return { x: 50 + (dx / len) * (R + 1), y: 50 + (dy / len) * (R + 1) };
  });
  if (run.length < 3) return '';
  let area = 0;
  for (let i = 0; i < run.length; i++) { const a = run[i], b = run[(i+1)%run.length]; area += a.x*b.y - b.x*a.y; }
  if (Math.abs(area / 2) < (minArea || 0)) return '';
  return 'M' + run.map((p) => `${f(p.x)},${f(p.y)}`).join('L') + 'Z';
}
const NA = new Set(['United States of America','Canada','Mexico','Greenland','Cuba','Haiti','Jamaica','Panama','Costa Rica','Nicaragua','Honduras','Guatemala','Belize','El Salvador','Bahamas','Dominican Republic','Saint Lucia','Saint Vincent and the Grenadines','Grenada','Trinidad and Tobago','Barbados','Antigua and Barbuda','Dominica','Martinique','Guadeloupe','Puerto Rico','Montserrat','Saint Kitts and Nevis','Anguilla','British Virgin Islands','U.S. Virgin Islands','Aruba','Curacao','Bonaire','Sint Maarten','Saint Martin','Sint Eustatius','Saba','Bermuda']);
const land = JSON.parse(fs.readFileSync(path.join(HERE, 'land-110m.json'), 'utf8'));
const states = JSON.parse(fs.readFileSync(path.join(HERE, 'us-states.json'), 'utf8'));
function collect(features, skipNA, minArea) {
  let d = '';
  for (const feat of features) {
    const name = feat.properties && (feat.properties.name || feat.properties.admin);
    if (skipNA && name && NA.has(name)) continue;
    const g = feat.geometry; if (!g) continue;
    const rings = g.type === 'Polygon' ? g.coordinates : g.type === 'MultiPolygon' ? g.coordinates.flat() : [];
    for (const ring of rings) d += ringPath(ring, minArea);
  }
  return d;
}
const otherLand = collect(land.features, true, 3.5);
const st = collect(states.features, false, 0.02);
// No grid this time - the land and the shading carry the globe on their own.
const defs = `<defs>
  <radialGradient id="ocean" cx="0.33" cy="0.28" r="0.9">
    <stop offset="0%" stop-color="#63aeea"/><stop offset="38%" stop-color="#2f74c2"/>
    <stop offset="72%" stop-color="#17427c"/><stop offset="100%" stop-color="#0a2140"/>
  </radialGradient>
  <radialGradient id="atmo" cx="0.5" cy="0.5" r="0.5">
    <stop offset="90%" stop-color="#8fd0ff" stop-opacity="0"/>
    <stop offset="96%" stop-color="#8fd0ff" stop-opacity="0.5"/>
    <stop offset="100%" stop-color="#8fd0ff" stop-opacity="0"/>
  </radialGradient>
  <clipPath id="sphere"><circle cx="50" cy="50" r="50"/></clipPath>
  <filter id="sh" x="-25%" y="-25%" width="150%" height="150%">
    <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-color="#0a2140" flood-opacity="0.4"/>
  </filter>
</defs>`;
const body = `
  <g filter="url(#sh)"><circle cx="50" cy="50" r="50" fill="url(#ocean)"/></g>
  <g clip-path="url(#sphere)">
    <path d="${otherLand}" fill="#3d6070" stroke="#3d6070" stroke-width="0.35"/>
    <path d="${st}" fill="#ffffff" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="${st}" fill="#FF4655"/>
  </g>
  <circle cx="50" cy="50" r="50" fill="url(#atmo)"/>`;
fs.writeFileSync(path.join(ROOT, 'public', 'brand-icon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">${defs}${body}</svg>`);
console.log('brand-icon.svg (no grid) =', fs.statSync(path.join(ROOT, 'public', 'brand-icon.svg')).size, 'bytes');

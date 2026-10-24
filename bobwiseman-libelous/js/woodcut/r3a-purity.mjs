// Checks for looks/woodcut-r3a.html (round 3, wood-A). Run from the project folder: node js/woodcut/r3a-purity.mjs
// 1. purity: renders times, others out of order, the first set again in reverse: the JPEGs must match byte for byte.
// 2. the seam: frames on page 28 (2302 to the whip pan) must match looks/woodcut.html byte for byte (q 1.0 JPEG).
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
const open = async (page) => { const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); await p.goto('file://' + process.cwd() + '/' + page + '?offline=1'); await p.evaluate(() => window.__ready); return p; };
const p = await open('looks/woodcut-r3a.html');
console.log('purity', await p.evaluate(() => {
  const ts = [2302, 2318, 2330, 2400, 2470, 2560, 2650, 2740, 2820, 2900, 2980, 3080, 3200, 3300, 3420, 3560, 3700, 3820, 3961].map(f => f / 24);
  const first = ts.map(t => window.__frameJPEG(t, .93));
  [3500, 2330, 3900, 2700, 3100, 2302, 3333, 2600].forEach(f => window.__frameJPEG(f / 24, .93));
  const again = ts.slice().reverse().map(t => window.__frameJPEG(t, .93)).reverse();
  const bad = ts.filter((t, k) => first[k] !== again[k]).map(t => Math.round(t * 24));
  return bad.length ? 'DIFFER at frames ' + bad.join(' ') : `all ${ts.length} byte-identical`;
}));
// the seam: a quality-1.0 JPEG of each page's canvas; identical bytes mean identical pixels
const q = await open('looks/woodcut.html');
for (const f of [2302, 2304, 2310, 2316]) {
  const a = await p.evaluate((t) => window.__frameJPEG(t, 1), f / 24), c = await q.evaluate((t) => window.__frameJPEG(t, 1), f / 24);
  console.log(`seam frame ${f}: ${a === c ? 'identical to woodcut.html' : 'DIFFERS from woodcut.html'}`);
}
await b.close();

// Purity check for looks/woodcut-r3b.html: node js/woodcut/r3b-purity.mjs
// Renders times, renders others out of order, renders the first set again in reverse: the JPEGs must match byte for byte.
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + process.cwd() + '/looks/woodcut-r3b.html?offline=1', { waitUntil: 'domcontentloaded', timeout: 300000 }); await p.evaluate(() => window.__ready);
console.log(await p.evaluate(() => {
  const ts = [165.0833, 167.4, 170.9, 175.0, 178.7, 183.5, 188.9, 192.8, 196.5, 200.5, 204.6, 210.9, 214.9, 219.9, 223.6, 225.6, 230.2, 238.9, 242.2, 247.9, 250.9, 255.5, 261.4583];
  const first = ts.map(t => window.__frameJPEG(t, .93));
  [240.3, 166.2, 258.0, 199.0, 232.9, 186.0, 251.7, 212.0].forEach(t => window.__frameJPEG(t, .93));
  const again = ts.slice().reverse().map(t => window.__frameJPEG(t, .93)).reverse();
  return JSON.stringify(ts.map((t, k) => [t, first[k] === again[k]]));
}));
await b.close();

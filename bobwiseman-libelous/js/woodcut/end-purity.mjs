// Purity check for looks/woodcut-end.html: node js/woodcut/end-purity.mjs
// Renders times, renders others out of order, renders the first set again in reverse: the JPEGs must match byte for byte.
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + process.cwd() + '/looks/woodcut-end.html?offline=1'); await p.evaluate(() => window.__ready);
console.log(await p.evaluate(() => {
  const ts = [261.5, 264.1, 268.3, 273.0, 279.4, 284.9, 290.5, 297.5, 299.6, 312.6, 326.9, 331.5, 332.3, 335.0, 340.4167];
  const first = ts.map(t => window.__frameJPEG(t, .93));
  [330.2, 262.2, 300.5, 276.0, 318.0, 296.9, 268.0, 338.0].forEach(t => window.__frameJPEG(t, .93));
  const again = ts.slice().reverse().map(t => window.__frameJPEG(t, .93)).reverse();
  return JSON.stringify(ts.map((t, k) => [t, first[k] === again[k]]));
}));
await b.close();

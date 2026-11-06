// Purity check for looks/court.html: node js/court/purity.mjs (renders times out of order, compares the JPEGs)
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + process.cwd() + '/looks/court.html?offline=1'); await p.evaluate(() => window.__ready);
console.log(await p.evaluate(() => {
  const ts = [263.0, 266.6, 270.8, 274.4, 277.4, 280.9, 283.7, 285.95, 288.9, 293.9, 297.47, 300.6, 301.9];
  const first = ts.map(t => window.__frameJPEG(t, .93));
  [299.1, 262.2, 285.5, 276.0, 292.0, 296.9, 268.0].forEach(t => window.__frameJPEG(t, .93));
  const again = ts.slice().reverse().map(t => window.__frameJPEG(t, .93)).reverse();
  return JSON.stringify(ts.map((t, k) => [t, first[k] === again[k]]));
}));
await b.close();

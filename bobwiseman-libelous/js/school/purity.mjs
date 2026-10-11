// Purity check for looks/school.html: node js/school/purity.mjs (renders times out of order, compares the JPEGs)
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + process.cwd() + '/looks/school.html?offline=1'); await p.evaluate(() => window.__ready);
console.log(await p.evaluate(() => {
  const ts = [123.3, 124.85, 126.6, 129.7, 132.4, 135.0, 137.4, 140.9, 142.6, 145.8, 148.6, 151.1, 153.0, 157.3, 159.9, 160.95, 163.4, 165.0];
  const first = ts.map(t => window.__frameJPEG(t, .93));
  [150.0, 125.0, 161.5, 139.0, 144.2, 131.0, 156.5].forEach(t => window.__frameJPEG(t, .93));
  const again = ts.slice().reverse().map(t => window.__frameJPEG(t, .93)).reverse();
  return JSON.stringify(ts.map((t, k) => [t, first[k] === again[k]]));
}));
await b.close();

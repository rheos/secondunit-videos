// node render-slice.mjs <page> <t0> <fps> <first> <last> <workers>
// Draws frames [first, last) of a look page at song time t0 + i/fps into frames/f_NNNNNN.jpg (1920x1080).
// The page must define window.__frameJPEG(t, q) and window.__ready, like every look under mv-projects.
import { chromium } from 'playwright';
import fs from 'fs';
const [page, t0, fps, a, b, wk] = [process.argv[2], ...process.argv.slice(3).map(Number)];
fs.mkdirSync('frames', { recursive: true });
const br = await chromium.launch({ headless: true });
const errs = [];
await Promise.all([...Array(wk)].map(async (_, w) => {
  const p = await br.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + process.cwd() + '/' + page + '?offline=1'); await p.evaluate(() => window.__ready);
  for (let i = a + w; i < b; i += wk) {
    const url = await p.evaluate((t) => window.__frameJPEG(t, .93), t0 + i / fps);
    fs.writeFileSync(`frames/f_${String(i).padStart(6, '0')}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
  }
}));
await br.close();
if (errs.length) { console.log('PAGE ERRORS\n' + [...new Set(errs)].slice(0, 10).join('\n')); process.exit(1); }
console.log(`rendered ${b - a} frames (${a}-${b})`);

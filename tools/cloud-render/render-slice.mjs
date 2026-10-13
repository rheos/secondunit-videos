// node render-slice.mjs <page> <t0> <fps> <first> <last> <workers>
// Draws frames [first, last) of a look page into frames/f_NNNNNN.jpg (1920x1080). Frame i is song frame
// round(t0 * fps) + i, drawn at that integer over fps: t0 + i / fps can land a hair under an exact frame time
// when t0 is off the grid (77.333333), and looks that step on twos then draw the previous pose.
// The page must define window.__frameJPEG(t, q) and window.__ready, like every look under mv-projects.
import { chromium } from 'playwright';
import fs from 'fs';
const [page, t0, fps, a, b, wk] = [process.argv[2], ...process.argv.slice(3).map(Number)];
const F0 = Math.round(t0 * fps);
fs.mkdirSync('frames', { recursive: true });
// CR_CHANNEL=chrome uses the installed Chrome (for local tests); runners use Playwright's Chromium
const br = await chromium.launch({ headless: true, ...(process.env.CR_CHANNEL ? { channel: process.env.CR_CHANNEL } : {}) });
const errs = [];
await Promise.all([...Array(wk)].map(async (_, w) => {
  const p = await br.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => errs.push(String(e)));
  // some looks precompute for seconds at load (neon: ~7 s on a Mac, far longer on a 2-core runner without a GPU)
  p.setDefaultTimeout(600000);
  // domcontentloaded, not load: the page's <audio> points at the song, which is never packaged, and the load
  // event can stall on it. The page signals readiness itself through window.__ready.
  await p.goto('file://' + process.cwd() + '/' + page + '?offline=1', { waitUntil: 'domcontentloaded', timeout: 600000 }); await p.evaluate(() => window.__ready);
  for (let i = a + w; i < b; i += wk) {
    const url = await p.evaluate((t) => window.__frameJPEG(t, .93), (F0 + i) / fps);
    fs.writeFileSync(`frames/f_${String(i).padStart(6, '0')}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
  }
}));
await br.close();
if (errs.length) { console.log('PAGE ERRORS\n' + [...new Set(errs)].slice(0, 10).join('\n')); process.exit(1); }
console.log(`rendered ${b - a} frames (${a}-${b})`);

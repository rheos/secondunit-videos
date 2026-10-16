// node render-slice.mjs <page> <t0> <fps> <first> <last> <workers> [size=1280x720]
// Draws frames [first, last) of a look page at song time t0 + i/fps into frames/f_NNNNNN.jpg. size is the encoded
// size; the viewport has its shape with the short side 1080 (1920x1080 for 16:9, 1080x1920 for a 9:16 page), and a
// page whose frames have another shape stops the run instead of being stretched by the encode.
// The page must define window.__frameJPEG(t, q) and window.__ready, like every look under mv-projects.
import { chromium } from 'playwright';
import fs from 'fs';
const [page, t0, fps, a, b, wk] = [process.argv[2], ...process.argv.slice(3, 8).map(Number)];
const [ow, oh] = (process.argv[8] || '1280x720').split('x').map(Number);
const k = 1080 / Math.min(ow, oh), viewport = { width: Math.round(ow * k), height: Math.round(oh * k) };
fs.mkdirSync('frames', { recursive: true });
// CR_CHANNEL=chrome uses the installed Chrome (for local tests); runners use Playwright's Chromium
const br = await chromium.launch({ headless: true, ...(process.env.CR_CHANNEL ? { channel: process.env.CR_CHANNEL } : {}) });
const errs = [];
await Promise.all([...Array(wk)].map(async (_, w) => {
  const p = await br.newPage({ viewport });
  p.on('pageerror', e => errs.push(String(e)));
  // some looks precompute for seconds at load (neon: ~7 s on a Mac, far longer on a 2-core runner without a GPU)
  p.setDefaultTimeout(600000);
  // domcontentloaded, not load: the page's <audio> points at the song, which is never packaged, and the load
  // event can stall on it. The page signals readiness itself through window.__ready.
  await p.goto('file://' + process.cwd() + '/' + page + '?offline=1', { waitUntil: 'domcontentloaded', timeout: 600000 }); await p.evaluate(() => window.__ready);
  for (let i = a + w; i < b; i += wk) {
    const url = await p.evaluate((t) => window.__frameJPEG(t, .93), t0 + i / fps);
    if (i === a + w) {
      const [fw, fh] = await p.evaluate((u) => new Promise((r) => { const im = new Image(); im.onload = () => r([im.naturalWidth, im.naturalHeight]); im.src = u; }), url);
      if (Math.abs(fw * oh / (fh * ow) - 1) > .02) { errs.push(`the page draws ${fw}x${fh} frames but the run encodes ${ow}x${oh}` + (fh > fw ? ': a tall page needs --tall' : '')); return; }
    }
    fs.writeFileSync(`frames/f_${String(i).padStart(6, '0')}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
  }
}));
await br.close();
if (errs.length) { console.log('PAGE ERRORS\n' + [...new Set(errs)].slice(0, 10).join('\n')); process.exit(1); }
console.log(`rendered ${b - a} frames (${a}-${b}), viewport ${viewport.width}x${viewport.height}`);

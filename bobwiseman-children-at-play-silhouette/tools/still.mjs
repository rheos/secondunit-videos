// still.mjs: full-size stills from a page in this project (headless Chrome via Playwright).
//   node tools/still.mjs <page.html> <out-prefix> <t...>
// Writes <out-prefix>_<t>.jpg (1920x1080) for each song time t, prints ms/frame and any page errors.
// Adapted from bobwiseman-in-her-dream/check.mjs (--full mode). Stills only: no video, no audio.
import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path';

const [page, prefix, ...ts] = process.argv.slice(2);
if (!page || !prefix || !ts.length) { console.log('usage: node tools/still.mjs <page.html> <out-prefix> <t...>'); process.exit(2); }
fs.mkdirSync(path.dirname(prefix), { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = []; p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', (e) => errs.push(String(e)));
await p.goto('file://' + path.resolve(page) + '?offline=1'); await p.evaluate(() => window.__ready);
let ms = 0;
for (const t of ts.map(Number)) {
  const t0 = Date.now(); const url = await p.evaluate((t) => window.__frameJPEG(t, .93), t); ms += Date.now() - t0;
  const f = `${prefix}_${t.toFixed(2)}.jpg`; fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64')); console.log(f);
}
await b.close();
console.log(`${ts.length} frames, ${(ms / ts.length).toFixed(0)} ms/frame`);
if (errs.length) { console.log('PAGE ERRORS:\n' + [...new Set(errs)].slice(0, 20).join('\n')); process.exit(1); }

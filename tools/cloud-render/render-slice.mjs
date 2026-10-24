// node render-slice.mjs <page> <t0> <fps> <first> <last> <workers> [size=1280x720]
// Draws frames [first, last) of a look page at song time t0 + i/fps into frames/f_NNNNNN.jpg. size is the encoded
// size; the viewport has its shape with the short side 1080 (1920x1080 for 16:9, 1080x1920 for a 9:16 page), and a
// page whose frames have another shape stops the run instead of being stretched by the encode.
// A look page defines window.__frameJPEG(t, q) and window.__ready, like every look under mv-projects.
// A HyperFrames composition (data-composition-id) that defines neither is drawn the way `hyperframes render` draws
// it, in a copy of the page (.cr-hf-<page>): the producer's render-mode flags at the start of <head>, HyperFrames' own
// runtime (the version the project's package.json pins, from jsDelivr) at the end of it, and for each frame
// window.__player.renderSeek(t), which is what the producer's window.__hf.seek calls, then a screenshot of the
// viewport. Its fonts load like any page's (Google Fonts over the network, @font-face files from the package).
// Not covered: <video> clips (video is never packaged) and the producer's GSAP tween batching (a load-time speedup).
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
const [page, t0, fps, a, b, wk] = [process.argv[2], ...process.argv.slice(3, 8).map(Number)];
const [ow, oh] = (process.argv[8] || '1280x720').split('x').map(Number);
const k = 1080 / Math.min(ow, oh), viewport = { width: Math.round(ow * k), height: Math.round(oh * k) };
fs.mkdirSync('frames', { recursive: true });
const src = fs.readFileSync(page, 'utf8');
const hf = /data-composition-id/.test(src) && !/__frameJPEG/.test(src);
let open = page;
if (hf) {
  const pkg = fs.existsSync('package.json') ? fs.readFileSync('package.json', 'utf8') : '';
  const ver = process.env.CR_HF_VERSION || (pkg.match(/hyperframes@(\d+\.\d+\.\d+)/) || [])[1] || '0.8.162';
  const res = await fetch(`https://cdn.jsdelivr.net/npm/hyperframes@${ver}/dist/hyperframe.runtime.iife.js`);
  if (!res.ok) { console.log(`could not fetch the HyperFrames ${ver} runtime: HTTP ${res.status}`); process.exit(1); }
  const rt = await res.text(), at = src.search(/<\/head>/i);
  if (at < 0 || /<\/script/i.test(rt)) { console.log('cannot place the HyperFrames runtime in this page'); process.exit(1); }
  const head = src.search(/<head\b[^>]*>/i), h = head < 0 ? -1 : src.indexOf('>', head) + 1;
  if (h < 0 || h > at) { console.log('this page has no <head>'); process.exit(1); }
  // the producer's render-mode settings (hyperframes render, default environment)
  const mode = `globalThis.__HF_RENDER_CAPTURE_MODE = true; window.__HF_EXPORT_RENDER_SEEK_CONFIG = { mode: "preview-phase",
    diagnostics: false, step: 1 / 120, offsetFraction: 0.5, fps: ${fps}, fpsSource: "cli", owner: "runtime" };`;
  open = path.join(path.dirname(page), '.cr-hf-' + path.basename(page));
  fs.writeFileSync(open, src.slice(0, h) + `\n<script>${mode}</script>` + src.slice(h, at)
    + `<script data-hyperframes-runtime="1">${rt}</script>\n` + src.slice(at));
  process.on('exit', () => fs.rmSync(open, { force: true }));
  console.log(`HyperFrames composition: runtime ${ver}, frames by renderSeek and screenshot`);
}
// CR_CHANNEL=chrome uses the installed Chrome (for local tests); runners use Playwright's Chromium
const br = await chromium.launch({ headless: true, ...(process.env.CR_CHANNEL ? { channel: process.env.CR_CHANNEL } : {}) });
const errs = [];
await Promise.all([...Array(wk)].map(async (_, w) => {
  const p = await br.newPage({ viewport });
  p.on('pageerror', e => errs.push(String(e)));
  // some looks precompute for seconds at load (neon: ~7 s on a Mac, far longer on a 2-core runner without a GPU)
  p.setDefaultTimeout(600000);
  // domcontentloaded, not load: the page's <audio> points at the song, which is never packaged, and the load
  // event can stall on it. The page signals readiness itself through window.__ready (HyperFrames: window.__renderReady).
  await p.goto('file://' + path.resolve(open) + '?offline=1', { waitUntil: 'domcontentloaded', timeout: 600000 });
  if (hf) {
    // the producer's readiness test (its window.__hf.duration getter): timelines built, render-ready, a duration
    await p.waitForFunction(() => typeof window.__hfStartupError === 'string' || (window.__renderReady && !window.__hfTimelinesBuilding
      && typeof window.__player?.renderSeek === 'function' && window.__player.getDuration() > 0), null, { polling: 100 });
    const bad = await p.evaluate(() => window.__hfStartupError);
    if (typeof bad === 'string') { errs.push('HyperFrames runtime: ' + bad); return; }
    const [fw, fh] = await p.evaluate(() => { const r = document.querySelector('[data-composition-id]'); return [+r.dataset.width, +r.dataset.height]; });
    if (fw && fh && Math.abs(fw * oh / (fh * ow) - 1) > .02) { errs.push(`the composition is ${fw}x${fh} but the run encodes ${ow}x${oh}` + (fh > fw ? ': a tall page needs --tall' : '')); return; }
    await p.evaluate(() => document.fonts.ready);
    for (let i = a + w; i < b; i += wk) {
      await p.evaluate(async (t) => { window.__player.renderSeek(t); await window.__hfWaitForSeekCompletion?.(); await document.fonts.ready; }, t0 + i / fps);
      fs.writeFileSync(`frames/f_${String(i).padStart(6, '0')}.jpg`, await p.screenshot({ type: 'jpeg', quality: 93 }));
    }
    return;
  }
  await p.evaluate(() => window.__ready);
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

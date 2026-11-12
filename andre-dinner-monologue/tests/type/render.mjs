// node render.mjs <f0> <f1> <out.mp4> [--workers 4]   renders frames [f0, f1) at 24 fps, 720x1280, and muxes the
// master's audio for the same span (-ss f0/24 -t (f1-f0)/24, aac 192k). Draft quality: libx264 crf 23 yuv420p.
import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process';
const args = process.argv.slice(2); const wi = args.indexOf('--workers'); const WK = wi >= 0 ? Number(args.splice(wi, 2)[1]) : 4;
const [a0, a1, out] = args; const f0 = Number(a0), f1 = Number(a1), FPS = 24, n = f1 - f0;
if (!out) { console.log('usage: render.mjs <f0> <f1> <out.mp4> [--workers 4]'); process.exit(2); }
const AUDIO = path.resolve('../../_in/andre.wav');
const dir = `${out}.frames`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
let done = 0; const start = Date.now(); const errs = [];
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
await Promise.all([...Array(WK)].map(async (_, w) => {
  const p = await b.newPage({ viewport: { width: 720, height: 1280 } });
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + process.cwd() + '/index.html?offline=1', { waitUntil: 'domcontentloaded' }); await p.evaluate(() => window.__ready);
  for (let i = w; i < n; i += WK) {
    const url = await p.evaluate((t) => window.__frameJPEG(t, .92), (f0 + i) / FPS);
    fs.writeFileSync(`${dir}/f_${String(i).padStart(6, '0')}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
    if (++done % 120 === 0) console.log(`${done}/${n} ${((Date.now() - start) / 1000).toFixed(0)} s`);
  }
}));
await b.close();
if (errs.length) { console.log('PAGE ERRORS\n' + [...new Set(errs)].slice(0, 10).join('\n')); process.exit(1); }
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${dir}/f_%06d.jpg`, '-ss', String(f0 / FPS), '-t', String(n / FPS), '-i', AUDIO,
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out]);
fs.rmSync(dir, { recursive: true, force: true });
console.log(`wrote ${out}: ${n} frames from f${f0}, ${((Date.now() - start) / 1000).toFixed(0)} s`);

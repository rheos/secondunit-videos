// node render.mjs <f0> <f1> <out.mp4> [workers]
// Renders frames [f0, f1) at 24 fps (frame f = time f/24) through window.__frameJPEG, then encodes the
// review file per the contract: H.264 crf 23 yuv420p, voice muxed from the master with -ss f0/24 -to f1/24, aac 192k.
import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process';
const f0 = parseInt(process.argv[2], 10), f1 = parseInt(process.argv[3], 10), out = process.argv[4]; const WK = parseInt(process.argv[5] || '3', 10);
const AUDIO = path.resolve('../../_in/andre.wav');
const dir = out + '.frames'; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const n = f1 - f0; let done = 0; const start = Date.now();
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
const errs = [];
await Promise.all([...Array(WK)].map(async (_, w) => {
  const p = await b.newPage({ viewport: { width: 720, height: 1280 } });
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto('file://' + process.cwd() + '/' + (process.env.PAGE || 'index.html') + '?offline=1'); await p.evaluate(() => window.__ready);
  for (let i = w; i < n; i += WK) {
    const url = await p.evaluate((t) => window.__frameJPEG(t, .93), (f0 + i) / 24);
    fs.writeFileSync(`${dir}/f_${String(i).padStart(6, '0')}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
    if (++done % 120 === 0) console.log(`${done}/${n} ${((Date.now() - start) / 1000).toFixed(0)}s`);
  }
}));
await b.close();
if (errs.length) { console.log('PAGE ERRORS:\n' + [...new Set(errs)].slice(0, 20).join('\n')); process.exit(1); }
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '24', '-i', `${dir}/f_%06d.jpg`, '-ss', String(f0 / 24), '-to', String(f1 / 24), '-i', AUDIO,
  '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out]);
fs.rmSync(dir, { recursive: true, force: true });
console.log(`wrote ${out}: ${n} frames from f${f0}, ${((Date.now() - start) / 1000).toFixed(0)} s`);

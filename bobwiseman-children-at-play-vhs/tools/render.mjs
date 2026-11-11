// render.mjs · render or still any stage of this look. Same contract and frame grid as
// tools/motion-lab/render.mjs, with two differences:
//  - Chrome runs with --allow-file-access-from-files: the TV page reads the tape frames from work/ into WebGL and
//    canvas pixel reads, which a file:// page may only do with that flag.
//  - every frame is checked for a blank canvas and drawn again. Under heavy load (2026-11-11, load average 40)
//    Chrome's GPU canvas handed back 44 all-black frames out of 948 in runs across every worker. No frame of this
//    look is ever near black, so a near-black frame is a failure, not a picture.
//   node tools/render.mjs <page> <t0> <t1> <out.mp4> [--workers 3] [--width 1920 --height 1080]
//   node tools/render.mjs --still <page> <out-prefix> <t...> [--width 1920 --height 1080]
import fs from 'fs';
import { execFileSync } from 'child_process';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import { openLook, jpegBuffer } from '../../tools/motion-lab/frames.mjs';

const req = createRequire(import.meta.url);
const { chromium } = (await import(pathToFileURL(req.resolve('playwright', { paths: [process.cwd()] })).href)).default;
const browser = await chromium.launch({ headless: true, channel: 'chrome',
  args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu', '--allow-file-access-from-files'] });
const raw = process.argv.slice(2), opt = { workers: 3, width: 1920, height: 1080 }, pos = [];
for (let i = 0; i < raw.length; i++) { if (raw[i].startsWith('--') && raw[i] !== '--still') opt[raw[i].slice(2)] = Number(raw[++i]); else pos.push(raw[i]); }

// Draw time t and return the JPEG, retrying while the canvas comes back blank (mean luma under 14 of 255).
async function goodFrame(p, t, q, stats) {
  for (let k = 0; k < 6; k++) {
    const res = await p.evaluate(async ([t, q]) => {
      const url = await window.__frameJPEG(t, q);
      const cv = document.getElementById('c');
      const s = document.createElement('canvas'); s.width = 32; s.height = 18;
      const g = s.getContext('2d', { willReadFrequently: true }); g.drawImage(cv, 0, 0, 32, 18);
      let sum = 0; const d = g.getImageData(0, 0, 32, 18).data;
      for (let i = 0; i < d.length; i += 4) sum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      return { url, luma: sum / (32 * 18) };
    }, [t, q]);
    if (res.luma >= 14) return jpegBuffer(res.url);
    stats.retries++;
    await new Promise((r) => setTimeout(r, 250 * (k + 1)));
  }
  throw new Error(`frame at ${t} s is still blank after 6 tries`);
}

const stats = { retries: 0 };
try {
  if (pos[0] === '--still') {
    const [, page, prefix, ...ts] = pos;
    const { p, errors } = await openLook(browser, page, opt);
    for (const t of ts) { const f = `${prefix}_${Number(t).toFixed(2)}.jpg`; fs.writeFileSync(f, await goodFrame(p, Number(t), 0.93, stats)); console.log(f); }
    if (errors.length) { console.log('PAGE ERRORS\n' + [...new Set(errors)].join('\n')); process.exitCode = 1; }
  } else {
    const [page, a, b, out] = pos;
    const f0 = Math.round(Number(a) * 24), n = Math.round(Number(b) * 24) - f0;
    const dir = `${out}.frames`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const start = Date.now(); let done = 0; const errs = [];
    await Promise.all([...Array(opt.workers)].map(async (_, w) => {
      const { p, errors } = await openLook(browser, page, opt);
      for (let i = w; i < n; i += opt.workers) {
        fs.writeFileSync(`${dir}/f_${String(i).padStart(6, '0')}.jpg`, await goodFrame(p, (f0 + i) / 24, 0.94, stats));
        if (++done % 120 === 0) console.log(`${done}/${n} ${((Date.now() - start) / 1000).toFixed(0)} s`);
      }
      errs.push(...errors);
    }));
    if (errs.length) { console.log('PAGE ERRORS\n' + [...new Set(errs)].slice(0, 10).join('\n')); process.exitCode = 1; }
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '24', '-i', `${dir}/f_%06d.jpg`, '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', out]);
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`wrote ${out}: ${n} frames, ${stats.retries} blank-frame retries, ${((Date.now() - start) / 1000).toFixed(0)} s`);
  }
} finally { await browser.close(); }

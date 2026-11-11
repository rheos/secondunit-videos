// Contact sheet (or full-size stills) of a cleanline film at chosen times or at its event frames.
//   node ../cleanline/bin/check.mjs <sheet.jpg> t1 t2 ...          3-column sheet of 640x360 tiles, prints ms/frame + errors
//   node ../cleanline/bin/check.mjs --full <dir> t1 t2 ...         full-size stills instead
//   node ../cleanline/bin/check.mjs <sheet.jpg> --events cuts,lines   every cut's first frame and every line start
//   options: --frames (the numbers are song frames, not seconds), --qs look=armink, --film DIR
import fs from 'fs'; import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process';
import { parseArgs, loadFilm, openBrowser, openPage, writeDataURL, eventFrames } from './film.mjs';

const { opt, pos } = parseArgs(process.argv.slice(2), ['frames']);
const full = opt.full !== undefined; const out = path.resolve(full ? opt.full : pos.shift());
const F = loadFilm(opt.film); const fps = F.fps; const errs = [];
const b = await openBrowser(); const p = await openPage(b, F.page, F.size, opt.qs, errs);
let times = pos.map(Number).map((v) => (opt.frames ? v / fps : v));
if (opt.events) times = times.concat((await eventFrames(p, fps, opt.events.split(','))).map((e) => e.f / fps));
const tmp = full ? out : fs.mkdtempSync(path.join(os.tmpdir(), 'cl_chk_')); fs.mkdirSync(tmp, { recursive: true });
const files = []; let ms = 0;
for (const t of times) {
  const s = Date.now(); const url = await p.evaluate((t) => window.__frameJPEG(t, .9), t); ms += Date.now() - s;
  const f = path.join(tmp, `t_${t.toFixed(3).padStart(8, '0')}_f${Math.floor(t * fps + 1e-6)}.jpg`); writeDataURL(f, url); files.push(f);
}
await b.close();
console.log(`${times.length} frames, ${(ms / Math.max(1, times.length)).toFixed(0)} ms/frame`);
if (!full && files.length) {
  const n = files.length, cols = Math.min(3, n), rows = Math.ceil(n / cols), pad = rows * cols - n;
  const inputs = files.flatMap((f) => ['-i', f]); let filt = files.map((_, i) => `[${i}:v]scale=640:360[v${i}];`).join('');
  for (let k = 0; k < pad; k++) { inputs.push('-f', 'lavfi', '-i', 'color=black:s=640x360:d=1'); filt += `[${n + k}:v]null[v${n + k}];`; }
  const ins = [...Array(n + pad).keys()].map((i) => `[v${i}]`).join('');
  const layout = [...Array(n + pad).keys()].map((i) => `${(i % cols) * 640}_${Math.floor(i / cols) * 360}`).join('|');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', `${filt}${ins}xstack=inputs=${n + pad}:layout=${layout}[o]`, '-map', '[o]', '-frames:v', '1', '-q:v', '3', out], { stdio: 'inherit' });
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('sheet', out);
} else if (full) console.log('stills in', out);
if (errs.length) console.log('ERRORS:\n' + [...new Set(errs)].slice(0, 20).join('\n'));

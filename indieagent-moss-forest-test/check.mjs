// node check.mjs <out.jpg> t1 t2 ...          contact sheet (3 columns of 640x360 tiles), ms/frame, page errors
// node check.mjs --full <dir> t1 t2 ...        full-size 1280x720 PNG stills (lossless: pixel art rings under JPEG)
// node check.mjs --crop x,y <dir> t1 t2 ...    600x450 crops of full-size frames at (x, y) in 1280x720 pixels
import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process';
import { launch, openLook, frame, jpegBuffer } from '../tools/motion-lab/frames.mjs';
const a = process.argv.slice(2); let mode = 'sheet', crop = null;
if (a[0] === '--full') { mode = 'full'; a.shift(); } else if (a[0] === '--crop') { mode = 'crop'; a.shift(); crop = a.shift().split(',').map(Number); }
const out = a.shift(), times = a.map(Number);
const b = await launch(); const { p, errors } = await openLook(b, process.env.PAGE || 'index.html', { width: 1280, height: 720 });
const tmp = mode === 'sheet' ? fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'moss_')) : out; fs.mkdirSync(tmp, { recursive: true });
const files = []; let ms = 0;
for (const t of times) {
  const t0 = Date.now(); const url = await frame(p, t, 1); ms += Date.now() - t0;
  const f = path.join(tmp, `t_${t.toFixed(2).padStart(6, '0')}.png`); fs.writeFileSync(f, jpegBuffer(url)); files.push(f);
  if (mode === 'crop') { execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', f, '-vf', `crop=600:450:${crop[0]}:${crop[1]}`, f.replace('.png', `_crop${crop[0]}x${crop[1]}.png`)]); fs.rmSync(f); }
}
await b.close();
console.log(`${times.length} frames, ${(ms / times.length).toFixed(0)} ms/frame`);
if (mode === 'sheet') {
  const n = files.length, cols = Math.min(3, n), rows = Math.ceil(n / cols), ins = [], filt = [];
  files.forEach((f, i) => { ins.push('-i', f); filt.push(`[${i}:v]scale=640:360:flags=neighbor[v${i}]`); });
  for (let k = n; k < rows * cols; k++) { ins.push('-f', 'lavfi', '-i', 'color=black:s=640x360:d=1'); filt.push(`[${k}:v]null[v${k}]`); }
  const lay = [...Array(rows * cols).keys()].map((i) => `${(i % cols) * 640}_${Math.floor(i / cols) * 360}`).join('|');
  const fc = n === 1 ? '[0:v]scale=640:360:flags=neighbor[o]' : `${filt.join(';')};${[...Array(rows * cols).keys()].map((i) => `[v${i}]`).join('')}xstack=inputs=${rows * cols}:layout=${lay}[o]`;
  fs.mkdirSync(path.dirname(out) || '.', { recursive: true });
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...ins, '-filter_complex', fc, '-map', '[o]', '-frames:v', '1', '-q:v', '2', out]);
  console.log('sheet', out);
} else console.log('stills in', out);
if (errors.length) console.log('ERRORS:\n' + [...new Set(errors)].slice(0, 20).join('\n'));

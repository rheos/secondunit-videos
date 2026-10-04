// node check.mjs <page> <out.jpg> t1 t2 ...    contact sheet (3 columns, 360x640 tiles), ms/frame, console errors
// node check.mjs <page> --full <dir> t1 t2 ...  full-res stills
import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path'; import { execSync } from 'child_process';
const args = process.argv.slice(2); const page = args.shift();
const full = args[0] === '--full'; if (full) args.shift();
const out = args.shift(); const times = args.map(Number);
const tmp = full ? out : fs.mkdtempSync('/tmp/chk_'); fs.mkdirSync(tmp, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu', '--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + process.cwd() + `/${page}.html?offline=1&scale=${process.env.SCALE || 1}`); await p.evaluate(() => window.__ready);
const files = []; let ms = 0;
for (const t of times) {
  const t0 = Date.now(); const url = await p.evaluate((t) => window.__frameJPEG(t, .9), t); ms += Date.now() - t0;
  const f = path.join(tmp, `t_${t.toFixed(2).padStart(6, '0')}.jpg`); fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64')); files.push(f);
}
await b.close();
console.log(`${times.length} frames, ${(ms / times.length).toFixed(0)} ms/frame`);
if (!full) {
  const n = files.length, cols = Math.min(3, n), rows = Math.ceil(n / cols), pad = rows * cols - n;
  let inputs = files.map((f) => `-i "${f}"`).join(' '); let filt = files.map((_, i) => `[${i}:v]scale=360:640[v${i}];`).join('');
  for (let k = 0; k < pad; k++) { inputs += ` -f lavfi -i color=black:s=360x640:d=1`; filt += `[${n + k}:v]null[v${n + k}];`; }
  const ins = [...Array(n + pad).keys()].map(i => `[v${i}]`).join('');
  fs.mkdirSync(path.dirname(out) || '.', { recursive: true });
  const fc = n === 1 ? `[0:v]scale=360:640[o]` : `${filt}${ins}xstack=inputs=${n + pad}:grid=${cols}x${rows}[o]`;
  execSync(`ffmpeg -y -loglevel error ${inputs} -filter_complex "${fc}" -map "[o]" -frames:v 1 -q:v 3 "${out}"`);
  console.log('sheet', out);
} else console.log('stills in', out);
if (errs.length) console.log('ERRORS:\n' + [...new Set(errs)].slice(0, 20).join('\n'));

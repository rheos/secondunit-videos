// Stills through the look's own contract (window.__frameJPEG).
//   node check.mjs <dir> f1 f2 ...            full-size stills <dir>/f<frame>.jpg (frames at 24 fps)
//   node check.mjs --sheet <out.jpg> <dir>    tiles every f*.jpg in <dir> into a 3-column contact sheet (240x427 tiles)
// PAGE=lineup.html picks another page; frames may also be given as seconds with an 's' suffix (e.g. 107.5s).
import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path'; import { execSync } from 'child_process';
const args = process.argv.slice(2);
if (args[0] === '--sheet') {
  const out = args[1], dir = args[2];
  const files = fs.readdirSync(dir).filter((f) => /^f\d+\.jpg$/.test(f)).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1))).map((f) => path.join(dir, f));
  const n = files.length, cols = 3, rows = Math.ceil(n / cols), pad = rows * cols - n;
  let inputs = files.map((f) => `-i "${f}"`).join(' '); let filt = files.map((f, i) => `[${i}:v]scale=240:427,drawbox=x=0:y=0:w=240:h=427:color=black@0:t=1[v${i}];`).join('');
  for (let k = 0; k < pad; k++) { inputs += ` -f lavfi -i color=black:s=240x427:d=1`; filt += `[${n + k}:v]null[v${n + k}];`; }
  const ins = [...Array(n + pad).keys()].map((i) => `[v${i}]`).join('');
  execSync(`ffmpeg -y -loglevel error ${inputs} -filter_complex "${filt}${ins}xstack=inputs=${n + pad}:grid=${cols}x${rows}:fill=black[o]" -map "[o]" -frames:v 1 -q:v 3 "${out}"`);
  console.log('sheet', out, n, 'stills'); process.exit(0);
}
const dir = args.shift(); fs.mkdirSync(dir, { recursive: true });
const frames = args.map((a) => a.endsWith('s') ? Math.round(parseFloat(a) * 24) : parseInt(a, 10));
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
const p = await b.newPage({ viewport: { width: 720, height: 1280 } });
const errs = []; p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', (e) => errs.push(String(e)));
await p.goto('file://' + process.cwd() + '/' + (process.env.PAGE || 'index.html') + '?offline=1' + (process.env.QS ? '&' + process.env.QS : '')); await p.evaluate(() => window.__ready);
let ms = 0;
for (const f of frames) {
  const t0 = Date.now(); const url = await p.evaluate((t) => window.__frameJPEG(t, .92), f / 24); ms += Date.now() - t0;
  fs.writeFileSync(path.join(dir, `f${f}.jpg`), Buffer.from(url.split(',')[1], 'base64'));
}
await b.close();
console.log(`${frames.length} stills in ${dir}, ${(ms / frames.length).toFixed(0)} ms/frame`);
if (errs.length) { console.log('ERRORS:\n' + [...new Set(errs)].slice(0, 20).join('\n')); process.exit(1); }

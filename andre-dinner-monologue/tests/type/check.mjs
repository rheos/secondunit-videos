// node check.mjs <outdir> f1 f2 ...        full-size stills named f<frame>.jpg, plus <outdir>/sheet.jpg (ffmpeg tile)
// frames are 24 fps frame numbers; the page is index.html in this folder; SCALE env sets ?w= (default 720)
import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process';
const [out, ...fr] = process.argv.slice(2); const frames = fr.map(Number);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
const p = await b.newPage({ viewport: { width: 720, height: 1280 } });
const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + process.cwd() + '/index.html?offline=1', { waitUntil: 'domcontentloaded' }); await p.evaluate(() => window.__ready);
const files = []; let ms = 0;
for (const f of frames) {
  const t0 = Date.now(); const url = await p.evaluate((t) => window.__frameJPEG(t, .92), f / 24); ms += Date.now() - t0;
  const fn = path.join(out, `f${f}.jpg`); fs.writeFileSync(fn, Buffer.from(url.split(',')[1], 'base64')); files.push(fn);
}
await b.close();
console.log(`${frames.length} stills, ${(ms / frames.length).toFixed(0)} ms/frame, in ${out}`);
// contact sheet: 4 columns of 240 px tiles
const tmp = fs.mkdtempSync(path.join(out, '.sheet_'));
files.forEach((f, i) => fs.copyFileSync(f, path.join(tmp, `s_${String(i).padStart(3, '0')}.jpg`)));
const cols = 4, rows = Math.ceil(files.length / cols);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '1', '-i', path.join(tmp, 's_%03d.jpg'), '-vf', `scale=240:-1,tile=${cols}x${rows}:padding=4:color=0x333333`, '-frames:v', '1', '-q:v', '3', path.join(out, 'sheet.jpg')]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log('sheet', path.join(out, 'sheet.jpg'));
if (errs.length) { console.log('ERRORS:\n' + [...new Set(errs)].slice(0, 20).join('\n')); process.exit(1); }

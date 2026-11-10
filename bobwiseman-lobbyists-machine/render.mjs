// node render.mjs <out.mp4> [--page song.html] [--from s --to s] | --stills t1,t2,...
// Draws the page on the 24 fps song grid and muxes the song from work/ (song.html: work/lobbyists-at-parliament.mp3
// cut to the range; machine.html, test 01: work/section.wav). Times are the page's own (song time for song.html).
import { createRequire } from 'module';
import fs from 'fs'; import path from 'path'; import { execSync } from 'child_process'; import { fileURLToPath } from 'url';
const require = createRequire(process.env.PW_FROM || import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const si = process.argv.indexOf('--stills'), out = process.argv[2], page = arg('--page', 'song.html');
const b = await chromium.launch({ channel: 'chrome', headless: true }); const errs = [];
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto('file://' + path.join(here, page)); const legs = await p.evaluate(() => window.__ready); if (process.env.LEGS) console.log(legs.join('\n'));
const dur = await p.evaluate(() => window.CUES.dur);
const t0 = Number(arg('--from', page === 'song.html' ? 0 : 0)), t1 = Number(arg('--to', dur));
const f0 = Math.round(t0 * 24), f1 = Math.round(t1 * 24);
const times = si > 0 ? process.argv[si + 1].split(',').map(Number) : [...Array(f1 - f0).keys()].map((i) => (f0 + i) / 24);
const dir = path.join(here, 'out', si > 0 ? 'stills' : 'frames'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
for (const [i, t] of times.entries()) {
  const url = await p.evaluate((t) => window.__frameJPEG(t), t);
  fs.writeFileSync(path.join(dir, si > 0 ? `t${t}.jpg` : `f_${String(i).padStart(5, '0')}.jpg`), Buffer.from(url.split(',')[1], 'base64'));
}
await b.close();
if (errs.length) { console.log('ERRORS:\n' + [...new Set(errs)].slice(0, 10).join('\n')); process.exit(1); }
if (si < 0) {
  const audio = page === 'song.html' ? `-ss ${f0 / 24} -t ${(f1 - f0) / 24} -i ${path.join(here, 'work', 'lobbyists-at-parliament.mp3')}` : `-i ${path.join(here, 'work', 'section.wav')}`;
  execSync(`ffmpeg -v error -y -framerate 24 -i ${dir}/f_%05d.jpg ${audio} -c:v libx264 -crf 21 -maxrate 4.5M -bufsize 9M -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart ${out}`);
}
console.log(si > 0 ? `stills in ${dir}` : `wrote ${out}`);

// node render.mjs <out.mp4> | --stills s1,s2,... (clip seconds): shoots figure.html on the 24 fps grid, muxes work/section.wav
import { createRequire } from 'module';
import fs from 'fs'; import path from 'path'; import { execSync } from 'child_process'; import { fileURLToPath } from 'url';
const require = createRequire(process.env.PW_FROM || import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const si = process.argv.indexOf('--stills'), out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome', headless: true }); const errs = [];
const p = await b.newPage({ viewport: { width: 720, height: 1280 } });
p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto('file://' + path.join(here, 'figure.html')); if (errs.length) { console.log('LOAD ERRORS', errs); await b.close(); process.exit(1); } await p.evaluate(() => window.setup());
const c = await p.evaluate(() => ({ s0: window.CUES.s0, s1: window.CUES.s1 }));
const times = si > 0 ? process.argv[si + 1].split(',').map(Number) : [...Array(Math.round((c.s1 - c.s0) * 24)).keys()].map((i) => c.s0 + i / 24);
const dir = path.join(here, 'out', si > 0 ? 'stills' : 'frames'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
for (const [i, s] of times.entries()) {
  await p.evaluate((s) => window.seek(s), s);
  await p.screenshot({ path: path.join(dir, si > 0 ? `s${s}.jpg` : `f_${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 93 });
}
await b.close();
if (errs.length) { console.log('ERRORS:\n' + [...new Set(errs)].slice(0, 10).join('\n')); process.exit(1); }
const dur = c.s1 - c.s0;
if (si < 0) execSync(`ffmpeg -v error -y -framerate 24 -i ${dir}/f_%05d.jpg -i ${path.join(here, 'work', 'section.wav')} -af "afade=t=in:d=0.1,afade=t=out:st=${(dur - .5).toFixed(2)}:d=0.5" -c:v libx264 -crf 23 -maxrate 4.5M -bufsize 9M -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart ${out}`);
console.log(si > 0 ? `stills in ${dir}` : `wrote ${out}`);

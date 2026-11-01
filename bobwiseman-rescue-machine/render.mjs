// node render.mjs <out.mp4> | --stills t1,t2,... : draws machine.html on the 24 fps grid and muxes work/section.wav.
import { createRequire } from 'module';
import fs from 'fs'; import path from 'path'; import { execSync } from 'child_process'; import { fileURLToPath } from 'url';
const require = createRequire(process.env.PW_FROM || import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const si = process.argv.indexOf('--stills'), out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome', headless: true }); const errs = [];
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto('file://' + path.join(here, 'machine.html')); await p.evaluate(() => window.setup());
const dur = await p.evaluate(() => window.CUES.dur);
const times = si > 0 ? process.argv[si + 1].split(',').map(Number) : [...Array(Math.round(dur * 24)).keys()].map((i) => i / 24);
const dir = path.join(here, 'out', si > 0 ? 'stills' : 'frames'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
for (const [i, t] of times.entries()) {
  const url = await p.evaluate((t) => window.__frameJPEG(t), t);
  fs.writeFileSync(path.join(dir, si > 0 ? `t${t}.jpg` : `f_${String(i).padStart(5, '0')}.jpg`), Buffer.from(url.split(',')[1], 'base64'));
}
await b.close();
if (errs.length) { console.log('ERRORS:\n' + [...new Set(errs)].slice(0, 10).join('\n')); process.exit(1); }
if (si < 0) execSync(`ffmpeg -v error -y -framerate 24 -i ${dir}/f_%05d.jpg -i ${path.join(here, 'work', 'section.wav')} -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart ${out}`);
console.log(si > 0 ? `stills in ${dir}` : `wrote ${out}`);

// Draw the doodle layer for a clip and composite it over the footage.
// node render.mjs <clip> <out.mp4> [--stills t1,t2,...]
// Frames are drawn on the 24 fps grid of work/<clip>.mp4 as transparent PNGs, then overlaid with ffmpeg.
import { createRequire } from 'module';
import fs from 'fs'; import path from 'path'; import { execSync } from 'child_process'; import { fileURLToPath } from 'url';
const require = createRequire(process.env.PW_FROM || import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const [clip, out] = process.argv.slice(2); const si = process.argv.indexOf('--stills');
const data = JSON.parse(fs.readFileSync(path.join(here, 'data', `track_${clip}.json`), 'utf8'));
const times = si > 0 ? process.argv[si + 1].split(',').map(Number) : [...Array(data.n).keys()].map((i) => i / 24);
const dir = path.join(here, 'out', `layer_${clip}`); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const F = (L, i) => `${dir}/${L}_${String(i).padStart(5, '0')}.png`;
const b = await chromium.launch({ channel: 'chrome', headless: true }); const errs = [];
const p = await b.newPage({ viewport: { width: data.w, height: data.h } });
p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto('file://' + path.join(here, 'doodle.html')); await p.evaluate(([c, d]) => window.setup(c, d), [clip, data]);
for (const [i, t] of times.entries()) {
  for (const L of ['back', 'front']) {
    const url = await p.evaluate(([t, L]) => window.__framePNG(t, L), [t, L]);
    fs.writeFileSync(F(L, i), Buffer.from(url.split(',')[1], 'base64'));
  }
}
await b.close();
if (errs.length) { console.log('ERRORS:\n' + [...new Set(errs)].slice(0, 10).join('\n')); process.exit(1); }
const src = path.join(here, 'work', `${clip}.mp4`), masks = path.join(here, 'work', `mask_${clip}`);
const hasMask = fs.existsSync(masks);
// footage + back layer, then the person (footage through their mask, feathered) back on top, then the front layer
const graph = hasMask
  ? `[0]split[f0][f1];[f0][1]overlay[b];[3]format=gray,gblur=sigma=1.5[m];[f1][m]alphamerge[p];[b][p]overlay[bp];[bp][2]overlay`
  : `[0][1]overlay[b];[b][2]overlay`;
function comp(inputs, extra, outFile) { execSync(`ffmpeg -v error -y ${inputs} -filter_complex "${graph}${extra}" ${outFile}`); }
if (si > 0) {
  times.forEach((t, i) => {
    const n = Math.round(t * 24), m = hasMask ? `-i ${masks}/m_${String(n).padStart(5, '0')}.png` : '';
    comp(`-ss ${t} -i ${src} -i ${F('back', i)} -i ${F('front', i)} ${m}`, '', `-frames:v 1 -update 1 ${path.join(here, 'out', `still_${clip}_${t}.jpg`)}`);
  });
  console.log('stills in out/');
} else {
  const m = hasMask ? `-framerate 24 -i ${masks}/m_%05d.png` : '';
  comp(`-i ${src} -framerate 24 -i ${dir}/back_%05d.png -framerate 24 -i ${dir}/front_%05d.png ${m}`, ',format=yuv420p', `-c:v libx264 -crf 18 -an -shortest -movflags +faststart ${out}`);
  console.log('wrote', out);
}

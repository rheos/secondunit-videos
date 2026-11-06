// Side-by-side motion check: the film's own line (left) vs the Looseleaf pen (right), no audio.
// node clip.mjs <t0> <t1> <out.mp4> [query, e.g. pen=pencil]
// Draws song time t0..t1 on the 24 fps grid at 1920x1080, stacks the pair and encodes a 1920x540 review file.
import { createRequire } from 'module';
import fs from 'fs'; import path from 'path'; import { execSync } from 'child_process'; import { fileURLToPath } from 'url';
const require = createRequire(process.env.PW_FROM || import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const [t0, t1] = [Number(process.argv[2]), Number(process.argv[3])]; const out = process.argv[4]; const qs = process.argv[5] || '';
const FPS = 24, n = Math.round((t1 - t0) * FPS), dir = path.join(here, 'out', `clip_${t0}_${t1}`);
fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const pages = { kit: path.resolve(here, '../../bobwiseman-travel-agent/looks/film.html'), pen: path.resolve(here, 'ta-pen.html') };
const b = await chromium.launch({ channel: 'chrome', headless: true });
const errs = [];
await Promise.all(Object.entries(pages).map(async ([k, file]) => {
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', (e) => errs.push(`${k}: ${e}`));
  await p.goto(`file://${file}?offline=1${qs ? '&' + qs : ''}`); await p.evaluate(() => window.__ready);
  for (let i = 0; i < n; i++) {
    const url = await p.evaluate((t) => window.__frameJPEG(t, .93), t0 + i / FPS);
    fs.writeFileSync(`${dir}/${k}_${String(i).padStart(5, '0')}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
  }
}));
await b.close();
if (errs.length) console.log('ERRORS:\n' + [...new Set(errs)].slice(0, 10).join('\n'));
execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i ${dir}/kit_%05d.jpg -framerate ${FPS} -i ${dir}/pen_%05d.jpg -filter_complex "[0]scale=960:540:flags=lanczos[a];[1]scale=960:540:flags=lanczos[b];[a][b]hstack" -c:v libx264 -crf 18 -pix_fmt yuv420p -movflags +faststart ${out}`);
console.log('wrote', out);

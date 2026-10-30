// node tools/cap_stills.mjs <page> <out.jpg> <t0> <t1> [--faces] [--every s] [--cols n] [--w px]
// One still per shot in [t0, t1) (its middle), or one every s seconds; tiled. --faces outlines every head box
// the kit reported (js/wkit.js FACES) in red, to find faces it does not know about.
import { chromium } from 'playwright';
import fs from 'fs'; import { execSync } from 'child_process';
const a = process.argv.slice(2); const flag = (k, d) => { const i = a.indexOf(k); return i < 0 ? d : (a.splice(i, 2)[1]); };
const faces = a.includes('--faces'); if (faces) a.splice(a.indexOf('--faces'), 1);
const every = Number(flag('--every', 0)), cols = Number(flag('--cols', 6)), tw = Number(flag('--w', 480));
const [page, out, t0, t1] = [a[0], a[1], Number(a[2]), Number(a[3])];
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu', '--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + process.cwd() + `/${page}.html?offline=1`); await p.evaluate(() => window.__ready);
let times;
if (every) { times = []; for (let t = t0; t < t1; t += every) times.push(Math.round(t * 24) / 24); }
else times = await p.evaluate(([a, b]) => SHOTS.filter((x) => x.b > a && x.a < b).map((x) => Math.round(((Math.max(x.a, a) + Math.min(x.b, b)) / 2) * 24) / 24), [t0, t1]);
const dir = fs.mkdtempSync('/tmp/capst_');
for (const [i, t] of times.entries()) {
  const url = await p.evaluate(([t, f]) => { window.__showFaces = f; return window.__frameJPEG(t, .9); }, [t, faces]);
  fs.writeFileSync(`${dir}/s_${String(i).padStart(3, '0')}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
}
await b.close();
const rows = Math.ceil(times.length / cols);
execSync(`ffmpeg -v error -y -i ${dir}/s_%03d.jpg -filter_complex "scale=${tw}:-2,tile=${cols}x${rows}" ${out}`);
console.log(times.map((t) => t.toFixed(2)).join(' '));

// node tools/cap_review.mjs <wide|tall> <out.jpg> [--cols n] [--w px] [--faces]
// A still at the last frame of every placement stretch in js/cap-place.js (the most words on the label), tiled,
// to review where the labels went. --faces outlines the head boxes.
import { chromium } from 'playwright';
import fs from 'fs'; import { execSync } from 'child_process';
const a = process.argv.slice(2); const flag = (k, d) => { const i = a.indexOf(k); return i < 0 ? d : (a.splice(i, 2)[1]); };
const faces = a.includes('--faces'); if (faces) a.splice(a.indexOf('--faces'), 1);
const cols = Number(flag('--cols', 4)), tw = Number(flag('--w', 640)); const [key, out] = a;
const P = eval(fs.readFileSync('js/cap-place.js', 'utf8').replace(/^[\s\S]*?const CAP_PLACE = /, '(').replace(/;\s*$/, ')'));
const frames = []; for (const segs of Object.values(P[key])) for (const [f0, f1] of segs) frames.push(f1 - 1);
const page = key === 'tall' ? 'wood-9x16-cap' : 'wood-cap';
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu', '--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + process.cwd() + `/${page}.html?offline=1`); await p.evaluate(() => window.__ready);
const dir = fs.mkdtempSync('/tmp/caprev_');
for (const [i, f] of frames.entries()) {
  const url = await p.evaluate(([t, fc]) => { window.__showFaces = fc; return window.__frameJPEG(t, .9); }, [f / 24, faces]);
  fs.writeFileSync(`${dir}/s_${String(i).padStart(3, '0')}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
}
await b.close();
execSync(`ffmpeg -v error -y -i ${dir}/s_%03d.jpg -filter_complex "scale=${tw}:-2,tile=${cols}x${Math.ceil(frames.length / cols)}" ${out}`);
console.log('frames', frames.join(' '));

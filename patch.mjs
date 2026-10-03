// node patch.mjs <out.mp4> <t0-t1> [<t0-t1> ...]   re-render only these spans of the full draft and re-encode
// Reuses the frames of the last full render (out/frames_index_0_366.8333, from render.mjs at scale 0.6667),
// overwrites the frames inside each span, then encodes all frames with the master audio. A fix to a few
// shots costs seconds of drawing plus one encode, instead of a full render.
import { chromium } from 'playwright';
import fs from 'fs'; import { execSync } from 'child_process';
const FPS = 24, SCALE = 0.6667, T0 = 0, T1 = 366.8333, WK = 4, PAGE = process.env.PAGE || 'index'; // PAGE=pnc for the pinball style
const dir = `out/frames_${PAGE}_${T0}_${T1}`;
const [out, ...spans] = process.argv.slice(2);
if (!out || !spans.length) { console.error('usage: node patch.mjs <out.mp4> <t0-t1> [...]'); process.exit(1); }
const n = Math.round((T1 - T0) * FPS);
if (!fs.existsSync(dir) || fs.readdirSync(dir).length !== n) { console.error(`${dir} must hold all ${n} frames from a full render first`); process.exit(1); }
const idx = new Set();
for (const sp of spans) { const [a, b] = sp.split('-').map(Number); for (let i = Math.max(0, Math.floor((a - T0) * FPS)); i < Math.min(n, Math.ceil((b - T0) * FPS)); i++) idx.add(i); }
const list = [...idx].sort((a, b) => a - b); let done = 0; const start = Date.now();
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
await Promise.all([...Array(WK)].map(async (_, w) => {
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + process.cwd() + `/${PAGE}.html?offline=1&scale=${SCALE}`); await p.evaluate(() => window.__ready);
  for (let j = w; j < list.length; j += WK) {
    const i = list[j]; const url = await p.evaluate((t) => window.__frameJPEG(t, .92), T0 + i / FPS);
    fs.writeFileSync(`${dir}/f_${String(i).padStart(6, '0')}.jpg`, Buffer.from(url.split(',')[1], 'base64')); done++;
  }
}));
await b.close();
console.log(`redrew ${done} frames in ${((Date.now() - start) / 1000).toFixed(0)}s; encoding`);
execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i ${dir}/f_%06d.jpg -ss ${T0} -t ${T1 - T0} -i assets/song.wav -c:v libx264 -preset medium -crf 26 -pix_fmt yuv420p -c:a aac -b:a 256k -shortest -movflags +faststart ${out}`);
console.log('wrote', out);

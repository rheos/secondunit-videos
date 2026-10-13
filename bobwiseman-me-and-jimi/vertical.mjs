// node vertical.mjs <page> <plan.json> <out.mp4> [workers]   a 9:16 pan-and-scan cut, drawn sharp
// The frames are code-drawn, so instead of cropping and upscaling the 1080p master we draw each frame at
// 1.7778x (3413x1920) and cut a 1080x1920 window out of it. plan.json: { t0, t1, fadeOut, keys: [[t, cx], ...] }
// where cx is the window centre in design pixels (0-1920). Between two keys the window eases across; two keys at
// the same t (or 1/24 s apart) make a hard cut. Shot cuts in the plan should sit on the 16:9 cuts.
import { chromium } from 'playwright';
import fs from 'fs'; import { execSync } from 'child_process';
const [page, planFile, out] = process.argv.slice(2); const WK = Number(process.argv[5] || 4);
const P = JSON.parse(fs.readFileSync(planFile, 'utf8')); const { t0, t1, fadeOut = 0 } = P;
const FPS = 24, SCALE = 1920 / 1080, BW = Math.round(1920 * SCALE), CW = 1080;
const dir = `out/frames_vertical${page === 'wood' ? '' : '_' + page}_${t0}_${t1}`; fs.mkdirSync(dir, { recursive: true });
const n = Math.round((t1 - t0) * FPS); let done = 0; const start = Date.now();
const keys = P.keys.slice().sort((a, b) => a[0] - b[0]);
const ss = (u) => u * u * (3 - 2 * u);
function cxAt(t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i + 1 < keys.length; i++) { const [a, ca] = keys[i], [b, cb] = keys[i + 1];
    if (t >= a && t < b) return b - a < .05 ? ca : ca + (cb - ca) * ss((t - a) / (b - a)); }
  return keys[keys.length - 1][1];
}
// draw (skip frames already on disk, so a stopped run resumes)
const todo = [...Array(n).keys()].filter((i) => !fs.existsSync(`${dir}/f_${String(i).padStart(6, '0')}.jpg`));
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu', '--allow-file-access-from-files'] });
await Promise.all([...Array(WK)].map(async (_, w) => {
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + process.cwd() + `/${page}.html?offline=1&scale=${SCALE}`); await p.evaluate(() => window.__ready);
  for (let j = w; j < todo.length; j += WK) { const i = todo[j];
    // __capCx: the window centre, so a lyric layer (js/lyrics.js) sets its label inside the tall crop
    const url = await p.evaluate(([t, cx]) => { window.__capCx = cx; return window.__frameJPEG(t, .92); }, [t0 + i / FPS, cxAt(t0 + i / FPS)]);
    fs.writeFileSync(`${dir}/f_${String(i).padStart(6, '0')}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
    if (++done % 120 === 0) console.log(`${done}/${todo.length} ${((Date.now() - start) / 1000).toFixed(0)}s`);
  }
}));
await b.close();
// one crop x per frame, fed to ffmpeg through sendcmd
const cmds = [...Array(n).keys()].map((i) => { const t = t0 + i / FPS;
  const x = Math.max(0, Math.min(BW - CW, Math.round(cxAt(t) * SCALE - CW / 2)));
  return `${(i / FPS).toFixed(4)} crop x ${x};`; }).join('\n');
fs.writeFileSync(`${dir}/crop.cmd`, cmds + '\n');
const x0 = Math.max(0, Math.min(BW - CW, Math.round(cxAt(t0) * SCALE - CW / 2)));
const af = fadeOut > 0 ? `-af afade=t=out:st=${(t1 - t0 - fadeOut).toFixed(3)}:d=${fadeOut}` : '';
execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i ${dir}/f_%06d.jpg -ss ${t0} -t ${t1 - t0} -i assets/song.wav ` +
  `-vf "sendcmd=f=${dir}/crop.cmd,crop=${CW}:1920:${x0}:0" ${af} -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p ` +
  `-c:a aac -b:a 256k -shortest -movflags +faststart ${out}`);
console.log('wrote', out);

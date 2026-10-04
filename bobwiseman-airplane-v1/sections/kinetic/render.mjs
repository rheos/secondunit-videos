// node render.mjs <page> <t0|fN> <t1|fN> <out.mp4> [workers] [fps] [fadeIn s] [scale]   renders on the song grid, muxes the song audio
// Times are seconds, or frame numbers on the fps grid when written fN (f8191 f8804 = frames [8191, 8804)).
// Frame i is drawn at (f0 + i) / fps, so the output has exactly f1 - f0 frames. The audio is padded with
// silence if the song ends before the last frame (the master is 366.8308 s, frame 8803 ends at 366.8333).
// scale < 1 draws natively smaller (0.6667 = 1280x720). CRF env overrides the quality (default 17, 26 for drafts).
import { chromium } from 'playwright';
import fs from 'fs'; import { execSync } from 'child_process';
const [page, a0, a1, out] = process.argv.slice(2);
const WK = Number(process.argv[6] || 4), FPS = Number(process.argv[7] || 24), FADE = Number(process.argv[8] || 0), SCALE = Number(process.argv[9] || 1);
const CRF = Number(process.env.CRF || (SCALE < 1 ? 26 : 17));
const toF = (a) => a.startsWith('f') ? Number(a.slice(1)) : Math.round(Number(a) * FPS);
const f0 = toF(a0), f1 = toF(a1), n = f1 - f0, t0 = f0 / FPS;
const dir = `out/frames_${page}_f${f0}_f${f1}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
let done = 0; const start = Date.now();
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
await Promise.all([...Array(WK)].map(async (_, w) => {
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', (e) => console.error('pageerror', String(e))); p.on('console', (m) => { if (m.type() === 'error') console.error('console', m.text()); });
  await p.goto('file://' + process.cwd() + `/${page}.html?offline=1&scale=${SCALE}`); await p.evaluate(() => window.__ready);
  for (let i = w; i < n; i += WK) {
    const url = await p.evaluate((t) => window.__frameJPEG(t, .92), (f0 + i) / FPS);
    fs.writeFileSync(`${dir}/f_${String(i).padStart(6, '0')}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
    if (++done % 120 === 0) console.log(`${done}/${n} ${((Date.now() - start) / 1000).toFixed(0)}s`);
  }
}));
await b.close();
if (process.env.FRAMES_ONLY) { console.log('frames in', dir, n); process.exit(0); }
execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i ${dir}/f_%06d.jpg -ss ${t0} -i assets/song.wav ${FADE > 0 ? `-vf fade=t=in:st=0:d=${FADE}` : ''} -af apad -frames:v ${n} -t ${n / FPS} -c:v libx264 -preset medium -crf ${CRF} -pix_fmt yuv420p -c:a aac -b:a 256k -movflags +faststart ${out}`);
console.log('wrote', out, n, 'frames');

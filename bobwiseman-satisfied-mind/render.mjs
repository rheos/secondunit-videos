// PAGE=looks/<look>.html picks the page (default index.html).
// node render.mjs <t0> <t1> <out.mp4> [workers] [fps] [scale]
// Renders song time t0..t1 on the 24 fps song grid (frame i = t0 + i/fps), muxes the song audio for the same span.
// scale < 1 encodes a review file at that size (0.6667 = 1280x720, crf 24); frames are always drawn at 1920x1080.
import { chromium } from 'playwright';
import fs from 'fs'; import { execSync } from 'child_process';
const [t0, t1] = [Number(process.argv[2]), Number(process.argv[3])]; const out = process.argv[4];
const WK = Number(process.argv[5] || 4), FPS = Number(process.argv[6] || 24), SCALE = Number(process.argv[7] || 1);
const dir = `out/frames_${(process.env.PAGE||'index').replace(/\W/g,'_')}_${t0}_${t1}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const n = Math.round((t1 - t0) * FPS); let done = 0; const start = Date.now();
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
const errs = [];
await Promise.all([...Array(WK)].map(async (_, w) => {
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + process.cwd() + '/' + (process.env.PAGE || 'index.html') + '?offline=1' + (process.env.QS ? '&' + process.env.QS : '')); await p.evaluate(() => window.__ready);
  for (let i = w; i < n; i += WK) {
    const url = await p.evaluate((t) => window.__frameJPEG(t, .93), t0 + i / FPS);
    fs.writeFileSync(`${dir}/f_${String(i).padStart(6, '0')}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
    if (++done % 96 === 0) console.log(`${done}/${n} ${((Date.now() - start) / 1000).toFixed(0)}s`);
  }
}));
await b.close();
if (errs.length) console.log('ERRORS:\n' + [...new Set(errs)].slice(0, 20).join('\n'));
const vf = SCALE < 1 ? `-vf scale=${Math.round(1920 * SCALE / 2) * 2}:${Math.round(1080 * SCALE / 2) * 2}:flags=lanczos` : '';
const crf = SCALE < 1 ? 24 : 17;
execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i ${dir}/f_%06d.jpg -ss ${t0} -t ${t1 - t0} -i assets/song.wav ${vf} -c:v libx264 -preset medium -crf ${crf} -pix_fmt yuv420p -c:a aac -b:a 256k -t ${t1 - t0} -movflags +faststart ${out}`);
console.log('wrote', out, `${((Date.now() - start) / 1000).toFixed(0)}s`);

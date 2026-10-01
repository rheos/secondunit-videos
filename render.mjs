// node render.mjs <page> <t0> <t1> <out.mp4> [workers] [fps] [fadeIn s] [scale]   renders on the song grid, muxes the master audio
// scale < 1 draws a smaller draft (0.6667 = 720x1280) and encodes it as a review file (crf 26) in one step
// fadeIn fades the PICTURE in from black at t0 (the audio is never touched)
import { chromium } from 'playwright';
import fs from 'fs'; import { execSync } from 'child_process';
const [page, a0, a1, out] = process.argv.slice(2); const t0 = Number(a0), t1 = Number(a1);
const WK = Number(process.argv[6] || 4), FPS = Number(process.argv[7] || 24), FADE = Number(process.argv[8] || 0), SCALE = Number(process.argv[9] || 1), CRF = SCALE < 1 ? 26 : 17; // the boiling brushstrokes make every frame new: crf 22 at 720p was 268 MB for 3 min
const dir = `out/frames_${page}_${t0}_${t1}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const n = Math.round((t1 - t0) * FPS); let done = 0; const start = Date.now();
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
await Promise.all([...Array(WK)].map(async (_, w) => {
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + process.cwd() + `/${page}.html?offline=1&scale=${SCALE}`); await p.evaluate(() => window.__ready);
  for (let i = w; i < n; i += WK) {
    const url = await p.evaluate((t) => window.__frameJPEG(t, .92), t0 + i / FPS);
    fs.writeFileSync(`${dir}/f_${String(i).padStart(6, '0')}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
    if (++done % 120 === 0) console.log(`${done}/${n} ${((Date.now() - start) / 1000).toFixed(0)}s`);
  }
}));
await b.close();
execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i ${dir}/f_%06d.jpg -ss ${t0} -t ${t1 - t0} -i assets/song.wav ${FADE > 0 ? `-vf fade=t=in:st=0:d=${FADE}` : ''} -c:v libx264 -preset medium -crf ${CRF} -pix_fmt yuv420p -c:a aac -b:a 256k -shortest -movflags +faststart ${out}`);
console.log('wrote', out);

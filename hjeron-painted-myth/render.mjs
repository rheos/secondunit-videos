// node render.mjs <frame0> <frame1> <out.mp4> [workers]
// Renders frames [frame0, frame1) at 24 fps (frame n = song time n/24) and muxes the untouched song audio for that span.
import { chromium } from 'playwright';
import fs from 'fs'; import { execSync } from 'child_process';
const [f0, f1] = [Number(process.argv[2]), Number(process.argv[3])]; const out = process.argv[4]; const WK = Number(process.argv[5] || 3);
const FPS = 24, dir = `out/frames_${f0}_${f1}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const n = f1 - f0; let done = 0; const start = Date.now();
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
const errs = [];
await Promise.all([...Array(WK)].map(async (_, w) => {
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + process.cwd() + '/index.html?offline=1'); await p.evaluate(() => window.__ready);
  for (let i = w; i < n; i += WK) {
    const url = await p.evaluate((fr) => window.__frameJPEG(fr, .95), f0 + i);
    fs.writeFileSync(`${dir}/f_${String(i).padStart(6, '0')}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
    if (++done % 100 === 0) console.log(`${done}/${n} ${((Date.now() - start) / 1000).toFixed(0)}s`);
  }
}));
await b.close();
const rt = (Date.now() - start) / 1000;
fs.mkdirSync('output', { recursive: true });
const a0 = (f0 / FPS).toFixed(6), dur = (n / FPS).toFixed(6);
execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i ${dir}/f_%06d.jpg -ss ${a0} -t ${dur} -i assets/song.wav -map 0:v -map 1:a -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -c:a aac -b:a 320k -t ${dur} -movflags +faststart ${out}`);
fs.writeFileSync(out + '.json', JSON.stringify({ frames: [f0, f1], fps: FPS, seconds: n / FPS, render_s: +rt.toFixed(1), workers: WK, errors: [...new Set(errs)] }, null, 2));
console.log('wrote', out, `render ${rt.toFixed(0)}s`, errs.length ? 'ERRORS ' + errs.slice(0, 5).join(' | ') : '');

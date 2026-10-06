// node render.mjs <page.html> <f0> <f1> <out.mp4> [workers] [w] [h]
// Renders SONG frames [f0, f1) on the 24 fps grid (frame i -> t = i/24), muxes the untouched song audio
// for the same span. Drafts: w h = 1280 720 (default), drawn at that size, light encode for review.
import { chromium } from 'playwright';
import fs from 'fs'; import { execSync } from 'child_process';
const [page, f0, f1, out] = [process.argv[2], Number(process.argv[3]), Number(process.argv[4]), process.argv[5]];
const WK = Number(process.argv[6] || 4), CW = Number(process.argv[7] || 1280), CH = Number(process.argv[8] || 720), FPS = 24;
const dir = `out/frames_${page.replace(/\W/g, '_')}_${f0}_${f1}_${CW}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const n = f1 - f0; let done = 0; const start = Date.now(); const errs = [];
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
await Promise.all([...Array(WK)].map(async (_, w) => {
  const p = await b.newPage({ viewport: { width: CW, height: CH } });
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
  await p.goto(`file://${process.cwd()}/${page}?offline=1&w=${CW}&h=${CH}`); await p.evaluate(() => window.__ready);
  for (let i = w; i < n; i += WK) {
    const url = await p.evaluate((t) => window.__frameJPEG(t, .93), (f0 + i) / FPS);
    fs.writeFileSync(`${dir}/f_${String(i).padStart(6, '0')}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
    if (++done % 96 === 0) console.log(`${done}/${n} ${((Date.now() - start) / 1000).toFixed(0)}s`);
  }
}));
await b.close();
if (errs.length) console.log('ERRORS:\n' + [...new Set(errs)].slice(0, 20).join('\n'));
const enc = CW < 1920 ? '-crf 23 -maxrate 4.5M -bufsize 9M' : '-crf 17';
execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i "${dir}/f_%06d.jpg" -ss ${f0 / FPS} -t ${n / FPS} -i assets/song.wav -c:v libx264 -preset medium ${enc} -pix_fmt yuv420p -c:a aac -b:a 256k -t ${n / FPS} -movflags +faststart "${out}"`);
console.log('wrote', out, `${((Date.now() - start) / 1000).toFixed(0)}s`);

// node render_proof.mjs stills t1,t2,...   |   node render_proof.mjs video t0 t1 out.mp4
import { chromium } from '/Users/robin/Code/novadiem/indieagent/secondunit/mv-projects/bobwiseman-we-got-time/node_modules/playwright/index.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
const P = '/Users/robin/Code/novadiem/indieagent/secondunit/mv-projects/bobwiseman-wgt-generative/hybrid-proof'; const [mode, ...a] = process.argv.slice(2); const SCALE = 0.6667, FPS = 24;
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
await p.goto('file://' + P + '/proof.html?offline=1&scale=' + SCALE); await p.evaluate(() => window.__ready);
const grab = async (t, f) => { const u = await p.evaluate((t) => window.__frameJPEG(t, .92), t); fs.writeFileSync(f, Buffer.from(u.split(',')[1], 'base64')); };
if (mode === 'stills') { for (const t of a[0].split(',')) await grab(Number(t), 'out/still_' + t + '.jpg'); }
else {
  const [t0, t1, out] = [Number(a[0]), Number(a[1]), a[2]]; const dir = 'out/frames'; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
  const n = Math.round((t1 - t0) * FPS); for (let i = 0; i < n; i++) await grab(t0 + i / FPS, dir + '/f_' + String(i).padStart(6, '0') + '.jpg');
  execSync('ffmpeg -y -loglevel error -framerate 24 -i ' + dir + '/f_%06d.jpg -ss ' + t0 + ' -t ' + (t1 - t0) + ' -i /Users/robin/Code/novadiem/indieagent/secondunit/mv-projects/bobwiseman-we-got-time/source/we-got-time-2026.wav -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac -b:a 256k -shortest -movflags +faststart ' + out);
  console.log('wrote', out, n, 'frames');
}
await b.close();

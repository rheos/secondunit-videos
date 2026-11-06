// Render a seamless Spotify Canvas loop from any code-drawn page, and prove the seam.
//
//   cd <project folder>      (the one with node_modules/playwright, i.e. any mv-projects film)
//   node <this file> <page.html> <out dir> [--w 720] [--h 1280] [--seconds 8] [--fps 24] [--song assets/song.wav --at 90]
//
// The page must expose window.__ready (a promise) and window.__frameJPEG(t, q) or, better, window.__framePNG(t),
// drawing time t in seconds as a pure function, with the loop period equal to --seconds (t = seconds is t = 0).
// It is opened as page?offline=1&w=W&h=H&loop=1.
//
// Writes into <out dir>: frames/0001.png.., canvas_<W>x<H>.mp4 (silent H.264, the Canvas), loop_<W/2>x<H/2>.gif,
// contact.jpg (one frame a second), seam.json, and with --song a review cut that plays the loop four times over the song.
// Seam test: PSNR of every frame step i -> i+1 and of last -> first; the seam passes when it is no worse than the
// median step minus 1.5 dB.
import { createRequire } from 'module';
import fs from 'fs'; import path from 'path'; import { execSync, execFileSync } from 'child_process';
// playwright from the project folder, else from any sibling project that has it (some film folders' links are stale)
function loadPlaywright() {
  const dirs = [process.cwd(), ...fs.readdirSync('..').map((d) => path.resolve('..', d))];
  for (const d of dirs) {
    try { if (fs.existsSync(path.join(d, 'node_modules', 'playwright'))) return createRequire(path.join(d, 'noop.js'))('playwright'); } catch { }
  }
  throw new Error('no playwright in this folder or any sibling project');
}
const { chromium } = loadPlaywright();

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const page = args[0], outDir = args[1];
if (!page || !outDir) { console.error('usage: loop-render.mjs <page.html> <out dir> [--w 720 --h 1280 --seconds 8 --fps 24 --song file --at s]'); process.exit(2); }
const W = Number(opt('w', 720)), H = Number(opt('h', 1280)), SEC = Number(opt('seconds', 8)), FPS = Number(opt('fps', 24));
const N = Math.round(SEC * FPS), frames = path.join(outDir, 'frames');
fs.rmSync(frames, { recursive: true, force: true }); fs.mkdirSync(frames, { recursive: true });

const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
const p = await b.newPage({ viewport: { width: W, height: H } });
const errs = []; p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', (e) => errs.push(String(e)));
await p.goto(`file://${path.resolve(page)}?offline=1&w=${W}&h=${H}&loop=1`); await p.evaluate(() => window.__ready);
const t0 = Date.now();
for (let i = 0; i < N; i++) {
  const url = await p.evaluate((t) => (window.__framePNG ? window.__framePNG(t) : window.__frameJPEG(t, .95)), i / FPS);
  fs.writeFileSync(path.join(frames, String(i + 1).padStart(4, '0') + '.png'), Buffer.from(url.split(',')[1], 'base64'));
}
await b.close();
console.log(`${N} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
if (errs.length) console.log('PAGE ERRORS:\n' + [...new Set(errs)].slice(0, 20).join('\n'));

const ff = (a) => execFileSync('ffmpeg', ['-nostdin', '-loglevel', 'error', '-y', ...a]);
const canvas = path.join(outDir, `canvas_${W}x${H}.mp4`);
ff(['-framerate', String(FPS), '-i', path.join(frames, '%04d.png'), '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-an', '-movflags', '+faststart', canvas]);
const gw = Math.round(W / 2 / 2) * 2, gh = Math.round(H / 2 / 2) * 2;
ff(['-framerate', String(FPS), '-i', path.join(frames, '%04d.png'), '-vf', `scale=${gw}:${gh}:flags=lanczos,split[a][b];[a]palettegen=max_colors=192:stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a`, '-loop', '0', path.join(outDir, `loop_${gw}x${gh}.gif`)]);
const picks = [...Array(SEC).keys()].map((s) => path.join(frames, String(s * FPS + 1).padStart(4, '0') + '.png'));
const cols = Math.min(4, picks.length), rows = Math.ceil(picks.length / cols), tw = 270, th = Math.round(H * tw / W);
ff([...picks.flatMap((f) => ['-i', f]), '-filter_complex', picks.map((_, i) => `[${i}]scale=${tw}:${th}[v${i}]`).join(';') + ';' + picks.map((_, i) => `[v${i}]`).join('') + `xstack=inputs=${picks.length}:layout=` + picks.map((_, i) => `${(i % cols) * tw}_${Math.floor(i / cols) * th}`).join('|'), '-q:v', '4', path.join(outDir, 'contact.jpg')]);

const psnr = (a, c) => { const o = execSync(`ffmpeg -nostdin -i "${a}" -i "${c}" -lavfi psnr -f null - 2>&1`).toString(); const m = o.match(/average:([0-9.]+|inf)/); return m ? (m[1] === 'inf' ? 99 : Number(m[1])) : NaN; };
const fr = (i) => path.join(frames, String(i).padStart(4, '0') + '.png');
const steps = []; for (let i = 1; i < N; i++) steps.push(psnr(fr(i), fr(i + 1)));
const seam = psnr(fr(N), fr(1)), sorted = [...steps].sort((a, c) => a - c), med = sorted[Math.floor(sorted.length / 2)];
const ok = seam >= med - 1.5;
fs.writeFileSync(path.join(outDir, 'seam.json'), JSON.stringify({ frames: N, median_step_db: med, min_step_db: sorted[0], max_step_db: sorted.at(-1), seam_db: seam, ok }, null, 1));
console.log(`steps median ${med.toFixed(2)} dB (min ${sorted[0].toFixed(2)}, max ${sorted.at(-1).toFixed(2)}); seam ${seam.toFixed(2)} dB -> ${ok ? 'SEAM OK' : 'SEAM VISIBLE'}`);
console.log('canvas', canvas, (fs.statSync(canvas).size / 1e6).toFixed(1), 'MB');

const song = opt('song'); if (song) {
  const at = Number(opt('at', 0)), review = path.join(outDir, `review_x4_song.mp4`);
  ff(['-stream_loop', '3', '-i', canvas, '-ss', String(at), '-t', String(SEC * 4), '-i', song, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', review]);
  console.log('review', review);
}

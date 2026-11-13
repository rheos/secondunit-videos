// Render the segment: 15 s on a 24 fps grid to out/<slug>-segment_f00000-f00360_24fps_review-720p.mp4.
//   npm install && npm run render            (or: node render.mjs [--workers 4] [--out file.mp4] [--t0 0 --t1 15])
//   npm run preview                          (serves the folder; open the printed address to watch it loop)
// Every frame is a pure function of t, so workers draw frames in any order. Needs ffmpeg on the PATH.
// Uses the installed Google Chrome if there is one, else Playwright's own Chromium (npx playwright install chromium).
import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path'; import http from 'http'; import { execFileSync } from 'child_process'; import { fileURLToPath } from 'url';

const SLUG = 'fieldguide', PAGE = 'segment.html', FORMAT = 'jpg'; // frames are drawn at 1920x1080 and scaled to 720p
const HERE = path.dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };

// serve this folder on localhost, so the page can read its own images back (a file:// page can't)
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const f = path.join(HERE, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(HERE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const BASE = `http://127.0.0.1:${server.address().port}/`;

async function launch() {
  try { return await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] }); }
  catch (e) { console.log('no Google Chrome here; using Playwright Chromium (software WebGL)'); return chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); }
}
const b = await launch();
const errs = [];
const open = async () => {
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto(BASE + PAGE + '?offline=1'); await p.evaluate(() => window.__ready);
  return p;
};
const first = await open();
const seg = await first.evaluate(() => window.__seg);
const fps = seg.fps, t0 = Number(arg('t0', 0)), t1 = Number(arg('t1', seg.dur));
const f0 = Math.round(t0 * fps), f1 = Math.round(t1 * fps), n = f1 - f0, WK = Number(arg('workers', 4));
const out = path.resolve(arg('out', path.join(HERE, 'out', `${SLUG}-segment_f${String(f0).padStart(5, '0')}-f${String(f1).padStart(5, '0')}_${fps}fps_review-720p.mp4`)));
const dir = path.join(HERE, 'out', `frames_${f0}_${f1}`); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const start = Date.now(); let done = 0;
await Promise.all([...Array(WK)].map(async (_, w) => {
  const p = w === 0 ? first : await open();
  for (let i = w; i < n; i += WK) {
    const url = await p.evaluate(({ t, q }) => window.__frame(t, q), { t: (f0 + i) / fps, q: FORMAT === 'png' ? 1 : .93 });
    fs.writeFileSync(path.join(dir, `f_${String(i).padStart(6, '0')}.${FORMAT}`), Buffer.from(url.split(',')[1], 'base64'));
    if (++done % 96 === 0) console.log(`${done}/${n} ${((Date.now() - start) / 1000).toFixed(0)}s`);
  }
}));
await b.close(); server.close();
if (errs.length) { console.log('PAGE ERRORS:\n' + [...new Set(errs)].slice(0, 20).join('\n')); process.exitCode = 1; }
fs.mkdirSync(path.dirname(out), { recursive: true });
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(dir, `f_%06d.${FORMAT}`),
  '-vf', 'scale=1280:720:flags=lanczos', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: 'inherit' });
fs.rmSync(dir, { recursive: true, force: true });
console.log('wrote', out, `${n} frames, ${((Date.now() - start) / 1000).toFixed(0)}s`);

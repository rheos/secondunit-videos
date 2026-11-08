// Render a span of a cleanline film to mp4, on the song's frame grid, with the pinned song muxed in.
//   node ../cleanline/bin/render.mjs <t0> <t1> <out.mp4> [--workers 4] [--scale 0.6667] [--qs look=armink] [--film DIR] [--keep]
// Run from the film folder (or pass --film). Frame i is song time t0 + i/fps; t0 and t1 should sit on the grid.
// --scale < 1 encodes a review file at that size (0.6667 = 1280x720, crf 24); frames are always drawn full size.
// --no-audio skips the mux (for a film whose song is not on this machine). Frames go to <film>/out/frames_<t0>_<t1>/.
import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process';
import { parseArgs, loadFilm, audioPath, openBrowser, openPage, writeDataURL } from './film.mjs';

const { opt, pos } = parseArgs(process.argv.slice(2), ['keep', 'no-audio']);
const F = loadFilm(opt.film); const fps = F.fps;
const [t0, t1] = [Number(pos[0]), Number(pos[1])]; const out = path.resolve(pos[2] || path.join(F.dir, `out/render_${t0}_${t1}.mp4`));
if (!(t1 > t0)) throw new Error('usage: render.mjs <t0> <t1> <out.mp4> [--workers n] [--scale s] [--qs ...]');
for (const t of [t0, t1]) if (Math.abs(t * fps - Math.round(t * fps)) > 1e-6 && t !== F.clock.duration) console.log(`note: ${t} s is not on the ${fps} fps grid`);
const WK = Number(opt.workers || 4), SCALE = Number(opt.scale || 1);
const song = opt['no-audio'] ? null : audioPath(F, { required: true });
const dir = path.join(F.dir, 'out', `frames_${t0}_${t1}${opt.qs ? '_' + opt.qs.replace(/\W/g, '_') : ''}`);
fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true }); fs.mkdirSync(path.dirname(out), { recursive: true });
const n = Math.round((t1 - t0) * fps); let done = 0; const start = Date.now(); const errs = [];
const b = await openBrowser();
await Promise.all([...Array(WK)].map(async (_, w) => {
  const p = await openPage(b, F.page, F.size, opt.qs, errs);
  for (let i = w; i < n; i += WK) {
    writeDataURL(`${dir}/f_${String(i).padStart(6, '0')}.jpg`, await p.evaluate((t) => window.__frameJPEG(t, .93), t0 + i / fps));
    if (++done % 96 === 0) console.log(`${done}/${n} ${((Date.now() - start) / 1000).toFixed(0)}s`);
  }
}));
await b.close();
if (errs.length) console.log('ERRORS:\n' + [...new Set(errs)].slice(0, 20).join('\n'));
const vf = SCALE < 1 ? ['-vf', `scale=${Math.round(F.size[0] * SCALE / 2) * 2}:${Math.round(F.size[1] * SCALE / 2) * 2}:flags=lanczos`] : [];
const crf = SCALE < 1 ? '24' : '17';
const aud = song ? ['-ss', String(t0), '-t', String(t1 - t0), '-i', song] : [];
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', `${dir}/f_%06d.jpg`, ...aud, ...vf,
  '-c:v', 'libx264', '-preset', 'medium', '-crf', crf, '-pix_fmt', 'yuv420p', ...(song ? ['-c:a', 'aac', '-b:a', '256k'] : []),
  '-t', String(t1 - t0), '-movflags', '+faststart', out], { stdio: 'inherit' });
if (!opt.keep) fs.rmSync(dir, { recursive: true, force: true });
console.log('wrote', out, `${n} frames, ${((Date.now() - start) / 1000).toFixed(0)}s`);

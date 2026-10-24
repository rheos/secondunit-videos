// render.mjs · render any look to MP4, optionally with film-shutter motion blur.
//
//   node tools/motion-lab/render.mjs <page> <t0> <t1> <out.mp4> [--fps 24] [--shutter 1] [--workers 4]
//                                    [--audio song.mp3] [--width 1920] [--height 1080]
//
// --shutter n averages n subframes spread over half a frame (a 180-degree shutter), in linear light,
// centred on each frame's time. Subframes more than ~3 px apart show as stepped copies, so pick
// n = fastest speed in px/frame / 6 (views.mjs speed reports it): a 60 px/frame move wants 10.
// It costs n times the render, so use it on finals. Leave it off for brushstroke looks whose paint re-rolls between subframes
// (boil): the strokes would cross-fade into mush.
// Frames land on the song grid: frame i is song time round(t0 * fps) / fps + i / fps.
import fs from 'fs';
import { execFileSync } from 'child_process';
import { launch, openLook, blurFrame, jpegBuffer, args } from './frames.mjs';

const [[page, a, b, out], o] = args(process.argv.slice(2), { fps: 24, shutter: 1, workers: 4, audio: '', width: 1920, height: 1080 });
if (!out) { console.log('usage: render.mjs <page> <t0> <t1> <out.mp4> [--fps 24] [--shutter 1]'); process.exit(2); }
const f0 = Math.round(Number(a) * o.fps), n = Math.round(Number(b) * o.fps) - f0;
const dir = `${out}.frames`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const browser = await launch(); const errors = []; let done = 0; const start = Date.now();
await Promise.all([...Array(Math.min(o.workers, n))].map(async (_, w) => {
  const { p, errors: e } = await openLook(browser, page, o);
  for (let i = w; i < n; i += o.workers) {
    fs.writeFileSync(`${dir}/f_${String(i).padStart(6, '0')}.jpg`, jpegBuffer(await blurFrame(p, (f0 + i) / o.fps, o.fps, o.shutter)));
    if (++done % 120 === 0) console.log(`${done}/${n} ${((Date.now() - start) / 1000).toFixed(0)} s`);
  }
  errors.push(...e);
}));
await browser.close();
if (errors.length) { console.log('PAGE ERRORS\n' + [...new Set(errors)].slice(0, 10).join('\n')); process.exit(1); }
const audio = o.audio ? ['-ss', String(f0 / o.fps), '-t', String(n / o.fps), '-i', o.audio] : [];
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(o.fps), '-i', `${dir}/f_%06d.jpg`, ...audio,
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', ...(o.audio ? ['-c:a', 'aac', '-b:a', '256k', '-shortest'] : []),
  '-movflags', '+faststart', out]);
fs.rmSync(dir, { recursive: true, force: true });
console.log(`wrote ${out}: ${n} frames from song frame ${f0}, shutter ${o.shutter}, ${((Date.now() - start) / 1000).toFixed(0)} s`);

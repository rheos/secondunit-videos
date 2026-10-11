// views.mjs · two review views that show timing, which contact sheets can't.
//
//   node tools/motion-lab/views.mjs onion <page> <out.jpg> <t0> <t1> [--fps 24] [--step 2] [--crop x,y,w,h]
//     A strobe photo of the move: every pose at full strength, older ones fainter, what holds still
//     untouched. Poses that bunch up near the keys mean the easing works; evenly spaced
//     ghosts mean linear, robotic motion.
//
//   node tools/motion-lab/views.mjs speed <page> <box-name> <out.png> <t0> <t1> [--fps 24]
//     Plots a probed box's centre x, y and height per frame (the look must call ML.probe.box with that
//     name), with its speed underneath, and lists dead stops, dead starts and linear runs. These are
//     hints, not failures: a landing should stop dead, a hover should not.
import fs from 'fs';
import { execFileSync } from 'child_process';
import { launch, openLook, strobe, probe, jpegBuffer, args } from './frames.mjs';

const [[mode, ...pos], o] = args(process.argv.slice(2), { fps: 24, step: 2, crop: '', width: 1920, height: 1080 });
const browser = await launch();
const { p, errors } = await openLook(browser, pos[0], o);

if (mode === 'onion') {
  const [, out, a, b] = pos;
  const f0 = Math.round(Number(a) * o.fps), f1 = Math.round(Number(b) * o.fps);
  const times = []; for (let f = f0; f <= f1; f += o.step) times.push(f / o.fps);
  if (times.length > 40) console.log(`${times.length} frames is a lot of memory; raise --step`);
  fs.writeFileSync(out, jpegBuffer(await strobe(p, times)));
  if (o.crop) {
    const [x, y, w, h] = o.crop.split(',').map(Number);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', out, '-vf', `crop=${w}:${h}:${x}:${y}`, '-q:v', '2', out + '.crop.jpg']);
    fs.renameSync(out + '.crop.jpg', out);
  }
  console.log(`onion ${times.length} frames ${f0}-${f1} step ${o.step} -> ${out}`);
} else if (mode === 'speed') {
  const [, name, out, a, b] = pos;
  const f0 = Math.round(Number(a) * o.fps), f1 = Math.round(Number(b) * o.fps);
  const rows = [];
  for (let f = f0; f <= f1; f++) {
    const r = (await probe(p, f / o.fps)).find((r) => r.kind === 'box' && r.name === name);
    rows.push(r ? { f, x: (r.box[0] + r.box[2]) / 2, y: (r.box[1] + r.box[3]) / 2, h: r.box[3] - r.box[1] } : { f });
  }
  const have = rows.filter((r) => r.x !== undefined);
  if (!have.length) { console.log(`no ML.probe.box named "${name}" between ${f0} and ${f1}`); process.exit(1); }
  // speed in px per frame from x and y; a move is anything over 1.5 px/frame
  const v = rows.map((r, i) => (i && r.x !== undefined && rows[i - 1].x !== undefined ? Math.hypot(r.x - rows[i - 1].x, r.y - rows[i - 1].y) : null));
  const MOVE = 1.5, findings = [];
  for (let i = 2; i < v.length; i++) {
    if (v[i - 1] == null || v[i] == null) continue;
    if (v[i - 1] > 6 * MOVE && v[i] < MOVE) findings.push(`dead stop at frame ${rows[i - 1].f}: ${v[i - 1].toFixed(1)} -> ${v[i].toFixed(1)} px/frame, no ease-out`);
    if (v[i - 1] < MOVE && v[i] > 6 * MOVE) findings.push(`dead start at frame ${rows[i - 1].f}: ${v[i - 1].toFixed(1)} -> ${v[i].toFixed(1)} px/frame, no ease-in`);
  }
  for (let i = 1; i < v.length;) {   // runs of 6+ frames moving at a near-constant speed
    let j = i;
    while (j + 1 < v.length && v[j] != null && v[j + 1] != null && v[j] > MOVE && Math.abs(v[j + 1] - v[j]) < 0.03 * v[j]) j++;
    if (j - i + 1 >= 6) findings.push(`linear run frames ${rows[i].f}-${rows[j].f} at ${v[i].toFixed(1)} px/frame`);
    i = j + 1;
  }
  const png = await p.evaluate(([rows, v, name]) => {
    const W = 1600, H = 900, c = new OffscreenCanvas(W, H), g = c.getContext('2d');
    g.fillStyle = '#fafaf7'; g.fillRect(0, 0, W, H);
    const L = 70, R = W - 20, n = rows.length, X = (i) => L + (R - L) * i / Math.max(1, n - 1);
    const plot = (vals, top, bot, col, label) => {
      const ok = vals.filter((x) => x != null); if (!ok.length) return;
      let lo = Math.min(...ok), hi = Math.max(...ok); if (hi - lo < 1e-6) { hi += 1; lo -= 1; }
      g.strokeStyle = col; g.lineWidth = 2.5; g.beginPath(); let pen = false;
      vals.forEach((y, i) => { if (y == null) { pen = false; return; } const py = bot - (bot - top) * (y - lo) / (hi - lo); pen ? g.lineTo(X(i), py) : g.moveTo(X(i), py); pen = true; });
      g.stroke(); vals.forEach((y, i) => { if (y != null) { g.fillStyle = col; g.fillRect(X(i) - 2, bot - (bot - top) * (y - lo) / (hi - lo) - 2, 4, 4); } });
      g.fillStyle = col; g.font = '20px monospace'; g.fillText(`${label}  ${lo.toFixed(0)} .. ${hi.toFixed(0)}`, L + 8, top + 18);
    };
    g.strokeStyle = '#ddd'; g.lineWidth = 1;
    rows.forEach((r, i) => { if (r.f % 6 === 0) { g.beginPath(); g.moveTo(X(i), 30); g.lineTo(X(i), H - 40); g.stroke(); g.fillStyle = '#888'; g.font = '16px monospace'; g.fillText(String(r.f), X(i) - 12, H - 16); } });
    plot(rows.map((r) => r.x ?? null), 30, 290, '#c2410c', 'x');
    plot(rows.map((r) => r.y ?? null), 310, 570, '#1d4ed8', 'y (down)');
    plot(rows.map((r) => r.h ?? null), 590, 700, '#15803d', 'height');
    plot(v, 720, 850, '#111', 'speed px/frame');
    g.fillStyle = '#111'; g.font = 'bold 22px monospace'; g.fillText(name, W - 260, 24);
    return c.convertToBlob({ type: 'image/png' }).then((bl) => new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(bl); }));
  }, [rows, v, name]);
  fs.writeFileSync(out, jpegBuffer(png));
  console.log(`speed graph of "${name}" frames ${f0}-${f1} -> ${out}`);
  console.log(findings.length ? findings.join('\n') : 'no dead stops, dead starts or linear runs');
} else {
  console.log('usage: views.mjs onion|speed ...  (see the header of this file)'); process.exit(2);
}
await browser.close();
if (errors.length) { console.log('PAGE ERRORS\n' + [...new Set(errors)].slice(0, 10).join('\n')); process.exit(1); }

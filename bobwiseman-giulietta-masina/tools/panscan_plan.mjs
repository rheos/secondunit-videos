// node tools/panscan_plan.mjs <look> <t0> <t1> [workers]      look: kite | poster | dream | leader
// Proposes the 9:16 pan-and-scan for one look over song time t0..t1 and merges it into aspects/9x16/panscan-plan-v1.json.
// Giulietta has no recomposed 9:16 (issue rheos/secondunit-videos#117): the tall frame is a 607.5 x 1080 window of the
// 16:9 frame (js/lyrics/cap.js, CAP_TALL). The window holds still through a shot and moves only on the cut; where the
// subject travels further than the window can hold, it pans with it across the shot (eased, start to end).
// Subject per frame: the heads the look reports (js/lyrics/faces-<look>.js); a shot with no head follows the "ink",
// the column weight of what stands out from the frame's own background (the dark figure on the bright sky).
// Writes keys [t, cx] (cx = window centre, 16:9 px). Hand edits go in aspects/9x16/panscan-edits-v1.json, applied
// after this (tools/plan_js.mjs). Re-running a look replaces only that look's span. Then: node tools/plan_js.mjs
import { chromium } from 'playwright';
import fs from 'fs';
const [look, a0, a1] = process.argv.slice(2); const T0 = Number(a0), T1 = Number(a1), WK = Number(process.argv[5] || 2);
const STEP = 2, HALF = 1080 * 9 / 16 / 2, LO = HALF, HI = 1920 - HALF;
const fr = []; for (let f = Math.round(T0 * 24); f < Math.round(T1 * 24); f += STEP) fr.push(f);
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
const S = new Map(); const errs = [];
await Promise.all([...Array(WK)].map(async (_, w) => {
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto('file://' + process.cwd() + `/looks/${look}-cap.html?offline=1`, { timeout: 900000 }); await p.evaluate(() => window.__ready);
  for (let i = w; i < fr.length; i += WK) S.set(fr[i], await p.evaluate((t) => {
    const s = window.__capScan(t), c = document.createElement('canvas'); c.width = 192; c.height = 108;
    const cg = c.getContext('2d', { willReadFrequently: true }); cg.drawImage(out, 0, 0, 192, 108);
    const d = cg.getImageData(0, 0, 192, 108).data, L = [];
    for (let i = 0; i < d.length; i += 4) L.push(.3 * d[i] + .59 * d[i + 1] + .11 * d[i + 2]);
    const med = [...L].sort((x, y) => x - y)[L.length >> 1], col = new Array(192).fill(0);
    for (let y = 6; y < 102; y++) for (let x = 0; x < 192; x++) { const v = Math.abs(L[y * 192 + x] - med); if (v > 28) col[x] += v; }
    return { faces: s.faces, shot: s.shot, shot1: String(window.capShot ? window.capShot(t + 1 / 24) : ''), col };
  }, fr[i] / 24));
}));
await b.close();
if (errs.length) console.log('PAGE ERRORS', [...new Set(errs)].slice(0, 5));
// shots: runs of frames with the same shot id
// (sampled every STEP = 2 frames; the odd frame's shot is read too, so a cut on an odd frame is found exactly)
const shots = [];
for (const f of fr) for (const [g, s] of [[f, S.get(f).shot], [f + 1, S.get(f).shot1]]) {
  if (g >= Math.round(T1 * 24)) continue;
  const r = shots[shots.length - 1]; if (!r || r.id !== s) shots.push({ id: s, f0: g, f1: g + 1, fs: [] }); else r.f1 = g + 1;
  if (S.has(g)) shots[shots.length - 1].fs.push(g);
}
const onScreen = (F) => F[2] > 0 && F[0] < 1920 && F[3] > 0 && F[1] < 1080;
function subject(f) {   // [x0, x1, cx] of what the window should hold on frame f, or null
  const { faces, col } = S.get(f), V = faces.filter(onScreen);
  if (V.length) { // heads: the biggest ones (within 1/3 of the biggest's area)
    const ar = V.map((F) => (F[2] - F[0]) * (F[3] - F[1])), m = Math.max(...ar), K = V.filter((F, i) => ar[i] > m / 3);
    const x0 = Math.max(0, Math.min(...K.map((F) => F[0]))), x1 = Math.min(1920, Math.max(...K.map((F) => F[2])));
    return [x0, x1, (x0 + x1) / 2];
  }
  const tot = col.reduce((x, y) => x + y, 0); if (tot < 2000) return null;
  let acc = 0, q1 = -1, q9 = -1, cx = 0; col.forEach((v, x) => { cx += v * x; });
  for (let x = 0; x < 192; x++) { acc += col[x]; if (q1 < 0 && acc > tot * .15) q1 = x; if (q9 < 0 && acc > tot * .85) { q9 = x; break; } }
  return [q1 * 10, q9 * 10 + 10, cx / tot * 10 + 5];
}
const clampC = (c) => Math.max(LO, Math.min(HI, c));
const keys = []; let prev = 960; const rep = [];
for (const sh of shots) {
  const t0 = sh.f0 / 24, t1 = sh.f1 / 24;
  const sub = sh.fs.map(subject).filter(Boolean);
  if (!sub.length) { keys.push([t0, Math.round(prev)], [t1 - .01, Math.round(prev)]); rep.push(`shot ${sh.id} f${sh.f0} ${t0.toFixed(2)}-${t1.toFixed(2)} hold ${prev.toFixed(0)} (no subject)`); continue; }
  const k = Math.max(1, Math.round(sub.length * .2)), head = sub.slice(0, k), tail = sub.slice(-k);
  const med = (A) => A.map((s) => s[2]).sort((x, y) => x - y)[A.length >> 1];
  const lo = Math.min(...sub.map((s) => s[0])), hi = Math.max(...sub.map((s) => s[1]));
  let c0, c1;
  if (hi - lo <= HALF * 2 - 40) { c0 = c1 = clampC((lo + hi) / 2); }           // the whole shot's subject fits: hold
  else { c0 = clampC(med(head)); c1 = clampC(med(tail)); if (Math.abs(c1 - c0) < 60) c0 = c1 = clampC(med(sub)); }
  keys.push([t0, Math.round(c0)], [t1 - .01, Math.round(c1)]); prev = c1;
  rep.push(`shot ${sh.id} f${sh.f0} ${t0.toFixed(2)}-${t1.toFixed(2)} ${c0 === c1 ? 'hold ' + c0.toFixed(0) : 'pan ' + c0.toFixed(0) + ' -> ' + c1.toFixed(0)}  subject x ${lo.toFixed(0)}-${hi.toFixed(0)}`);
}
console.log(rep.join('\n'));
const file = 'aspects/9x16/panscan-plan-v1.json';
const P = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { keys: [] };
P.note = 'pan-and-scan for the 9:16 verse clips: [song s, window centre x in 16:9 px], from tools/panscan_plan.mjs per look';
P.t0 = 0; P.t1 = 139.05;
P.keys = (P.keys || []).filter((k) => (k[0] < T0 - 1e-6 || k[0] >= T1 - 1e-6) && !(k[0] === 0 && k[1] === 960)).concat(keys).sort((x, y) => x[0] - y[0]);
fs.writeFileSync(file, JSON.stringify(P) + '\n');
console.log('wrote', file, keys.length, 'keys for', look, T0, T1);

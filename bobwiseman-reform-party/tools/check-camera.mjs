// Camera check for the Dali look (Robin, draft 10 audit: smoother, and looking at the important things on cue).
// PAGE=looks/dali.html node tools/check-camera.mjs [out.txt]
// Samples camAt(t) every frame (24 fps) over the whole film and checks the limits from AUDIT-d10.md:
//   view turn 30 deg/s sustained (45 allowed for at most 0.4 s), turn acceleration 60 deg/s2 (measured over 0.25 s),
//   speed relative to the car by height (under 2 m: 3 m/s; 2-5: 5; 5-15: 10; 15-40: 18; above 40 m: |d ln h/dt| <= .7),
//   linear acceleration 3 m/s2 under 5 m, 6 above (over 0.25 s), zoom 25 %/s, no dead stop (all motion ~0) over 0.3 s.
// Cue check: if camera.js defines CUE_TARGETS = [{ t, w: 'word', at: (t) => [X, Y, Z] }], each target must be on
// screen and at least 8% of frame height from the edges from t - .5 to t + .5, and the view must turn under 12 deg/s
// from t - .4 to t + .5. CAM_EXEMPT = [[t0, t1, 'SPEED,ACCEL', 'reason']] in camera.js skips those checks there
// (only for stretches Robin or the audit protected, e.g. the intro glide). Exit code 1 if anything fails.
import { chromium } from 'playwright'; import fs from 'fs';
const outFile = process.argv[2];
const b = await chromium.launch({ channel: 'chrome', headless: true }); const p = await b.newPage();
await p.goto('file://' + process.cwd() + '/' + (process.env.PAGE || 'looks/dali.html') + '?offline=1'); await p.evaluate(() => window.__ready);
const res = await p.evaluate(() => {
  const N = Math.round(268.99 * 24), rows = [];
  for (let f = 0; f <= N; f++) { const t = f / 24, c = camAt(t), yaw = c.yaw || 0; const cx = typeof carX === 'function' ? carX(Math.min(t, 238)) : 0;
    rows.push({ t, x: c.x, y: c.y, z: c.z, rx: c.x - cx, d: [Math.sin(yaw) * Math.cos(c.p), -Math.sin(c.p), Math.cos(yaw) * Math.cos(c.p)], f: c.f }); }
  const cues = []; if (typeof CUE_TARGETS !== 'undefined') for (const q of CUE_TARGETS) { const bad = [];
    for (let tt = q.t - .5; tt <= q.t + .5 + 1e-9; tt += 1 / 24) { C = camAt(tt); CP = Math.cos(C.p); SP = Math.sin(C.p); CX = carX(tt); CZ = carZ(tt); YAW = yaw(tt);
      const w = q.at(tt), s = P(w[0], w[1], w[2]), m = .08 * H; if (!(s[2] > .3 && s[0] > m && s[0] < W - m && s[1] > m && s[1] < H - m)) bad.push(tt.toFixed(2)); }
    cues.push({ t: q.t, w: q.w, bad }); }
  return { rows, cues, hasCues: typeof CUE_TARGETS !== 'undefined', exempt: typeof CAM_EXEMPT !== 'undefined' ? CAM_EXEMPT : [] };
});
await b.close();
const R = res.rows, dt = 1 / 24, F = [];
const turn = R.map((r, i) => i ? Math.acos(Math.min(1, r.d[0] * R[i - 1].d[0] + r.d[1] * R[i - 1].d[1] + r.d[2] * R[i - 1].d[2])) * 180 / Math.PI / dt : 0);
const spd = R.map((r, i) => i ? Math.hypot(r.rx - R[i - 1].rx, r.y - R[i - 1].y, r.z - R[i - 1].z) / dt : 0);
const zoom = R.map((r, i) => i ? Math.abs(Math.log(r.f / R[i - 1].f)) * 100 / dt : 0);
const lim = (h) => h < 2 ? 3 : h < 5 ? 5 : h < 15 ? 10 : h < 40 ? 18 : Infinity;
let over45 = 0, still = 0;
for (let i = 1; i < R.length; i++) { const r = R[i], h = r.y;
  if (turn[i] > 45) { over45++; if (over45 * dt > .4) F.push([r.t, 'TURN', `${turn[i].toFixed(0)} deg/s over 45 for more than 0.4 s`]); } else over45 = 0;
  if (turn[i] > 30 && turn[i] <= 45) { let run = 0; for (let j = i; j > 0 && turn[j] > 30; j--) run++; if (run * dt > 1.0) F.push([r.t, 'TURN', `${turn[i].toFixed(0)} deg/s over 30 for more than 1 s`]); }
  if (i > 6) { const ta = Math.abs(turn[i] - turn[i - 6]) / (6 * dt), la = Math.abs(spd[i] - spd[i - 6]) / (6 * dt);
    if (ta > 60) F.push([r.t, 'TURNACC', `${ta.toFixed(0)} deg/s2`]); if (la > (h < 5 ? 3 : 6) && h < 40) F.push([r.t, 'ACCEL', `${la.toFixed(1)} m/s2 at ${h.toFixed(1)} m`]); }
  if (h < 40 && spd[i] > lim(h) * 1.05) F.push([r.t, 'SPEED', `${spd[i].toFixed(1)} m/s at ${h.toFixed(1)} m (limit ${lim(h)})`]);
  if (h >= 40) { const lr = Math.abs(Math.log(Math.max(r.y, .1) / Math.max(R[i - 1].y, .1))) / dt; if (lr > .7) F.push([r.t, 'CLIMB', `|d ln h/dt| ${lr.toFixed(2)} at ${h.toFixed(0)} m`]); }
  if (zoom[i] > 25) F.push([r.t, 'ZOOM', `${zoom[i].toFixed(0)} %/s`]);
  if (spd[i] < .02 && turn[i] < .2 && zoom[i] < .1 && r.t < 268) { still++; if (still * dt > .3) F.push([r.t, 'STILL', 'dead stop']); } else still = 0; }
for (const q of res.cues) { if (q.bad.length) F.push([q.t, 'CUE', `"${q.w}" subject off frame or at the edge at ${q.bad.slice(0, 3).join(', ')}${q.bad.length > 3 ? ' +' + (q.bad.length - 3) : ''}`]);
  for (let i = 1; i < R.length; i++) if (R[i].t > q.t - .4 && R[i].t < q.t + .5 && turn[i] > 12) { F.push([q.t, 'CUETURN', `"${q.w}" view turning ${turn[i].toFixed(0)} deg/s near the word`]); break; } }
const exempt = (t, k) => res.exempt.some(([a, b2, ks]) => t >= a && t <= b2 && String(ks).split(',').includes(k));
const by = new Map(); for (const [t, k, info] of F) { if (exempt(t, k)) continue; if (!by.has(k)) by.set(k, []); by.get(k).push([t, info]); }
const lines = []; for (const [k, list] of by) { list.sort((a, b2) => a[0] - b2[0]); let s = list[0][0], e = s, info = list[0][1];
  const flush = () => lines.push([s, `${k.padEnd(8)} ${s.toFixed(2)}-${e.toFixed(2)}  ${info}`]);
  for (let i = 1; i < list.length; i++) { if (list[i][0] - e > .2) { flush(); s = list[i][0]; info = list[i][1]; } e = list[i][0]; if (k !== 'CUE' && k !== 'CUETURN') info = list[i][1].length > info.length ? info : info; } flush(); }
lines.sort((a, b2) => a[0] - b2[0]);
const pct = (a, q) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(q * (s.length - 1))].toFixed(1); };
const text = `camera check: turn p50 ${pct(turn, .5)} p95 ${pct(turn, .95)} max ${pct(turn, 1)} deg/s; ${res.hasCues ? res.cues.length + ' cue targets' : 'no CUE_TARGETS defined'}; ${lines.length} failing ranges\n` + lines.map((l) => l[1]).join('\n') + '\n';
if (outFile) fs.writeFileSync(outFile, text); console.log(text.length > 6000 ? text.slice(0, 6000) + '\n...' : text);
process.exit(lines.length ? 1 : 0);

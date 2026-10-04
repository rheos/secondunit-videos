// Time, audio, rng, drawing helpers, camera, shot registry.
// Trimmed from the functional-emotions-video helpers (MIT) as adapted for the Pnubb painted spike.
const DUR = 366.83;
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const ease = {
  out: (x) => 1 - Math.pow(1 - clamp(x), 3),
  in: (x) => Math.pow(clamp(x), 3),
  inOut: (x) => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; },
  back: (x) => { x = clamp(x); if (x <= 0) return 0; const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); },
  sine: (x) => .5 - .5 * Math.cos(Math.PI * clamp(x)),
  lin: (x) => clamp(x),
};
function hash(n) { n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n = n ^ (n >>> 4); n = Math.imul(n, 0x27d4eb2d); n = n ^ (n >>> 15); return (n >>> 0) / 4294967296; }
const hash2 = (i, j, s = 0) => hash((Math.imul(i, 73856093) ^ Math.imul(j, 19349663) ^ Math.imul(s, 83492791)) >>> 0);
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function noise1(x, seed = 0) { const i = Math.floor(x), f = x - i; const a = hash(i * 7919 + seed * 104729), b = hash((i + 1) * 7919 + seed * 104729); const u = f * f * (3 - 2 * f); return a + (b - a) * u; }
const snoise = (x, seed = 0) => noise1(x, seed) * 2 - 1;

// ---- audio (window.FEAT from js/data.js: 30 fps features, beat grid, vocal onsets) ----
function F(name, t, sm = 0) {
  const a = FEAT[name]; const f = t * FEAT.fps;
  if (!sm) { const i = Math.floor(f), u = f - i; return lerp(a[clamp(i, 0, a.length - 1)] || 0, a[clamp(i + 1, 0, a.length - 1)] || 0, u); }
  let s = 0, n = 0; const c = Math.round(f); for (let k = -sm; k <= sm; k++) { const v = a[c + k]; if (v !== undefined) { s += v; n++; } } return n ? s / n : 0;
}
function lastBeat(t) { const b = FEAT.beats; if (t < b[0]) return -1; let lo = 0, hi = b.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (b[m] <= t) lo = m; else hi = m - 1; } return lo; }
function beatPulse(t, decay = 6) { const i = lastBeat(t); return i < 0 ? 0 : Math.exp(-decay * (t - FEAT.beats[i])); }
function beatPhase(t) { const i = lastBeat(t), b = FEAT.beats; if (i < 0 || i >= b.length - 1) return 0; return (t - b[i]) / (b[i + 1] - b[i]); }
function bob(t) { return Math.pow(Math.sin(beatPhase(t) * Math.PI), 2); }

// ---- colour ----
const _rgbC = {};
function rgbOf(c) { if (_rgbC[c]) return _rgbC[c]; const v = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); _rgbC[c] = v; return v; }
function mixc(a, b, k) { const A = rgbOf(a), B = rgbOf(b); k = clamp(k); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; }
function mixh(a, b, k) { const A = rgbOf(a), B = rgbOf(b); k = clamp(k); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); }
function rgba(c, a) { const A = rgbOf(c); return `rgba(${A[0]},${A[1]},${A[2]},${a})`; }

// ---- drawing helpers. s = underpainting, f = light, ik = ink (unbrushed). All in 1920x1080 coords ----
let s, f, ik, mk;
function bindCtx() { s = Paint.sctx; f = Paint.fctx; ik = Paint.ictx; mk = Paint.mctx; }
const ALL = () => [s, f, ik, mk];
function fill(g, c) { g.fillStyle = c; g.fillRect(-5000, -5000, 12000, 12000); }
function vgrad(g, y0, y1, stops) { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; }
function rgrad(g, x, y, r0, r1, stops) { const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; }
function glow(x, y, r, color, a = 1) {
  if (!(r > .5)) return;
  f.save(); f.globalCompositeOperation = 'lighter'; f.globalAlpha = a;
  f.fillStyle = rgrad(f, x, y, 0, r, [[0, color], [1, 'rgba(0,0,0,0)']]); f.fillRect(x - r, y - r, r * 2, r * 2); f.restore();
}
function dot(g, x, y, r, c) { g.fillStyle = c; g.beginPath(); g.arc(x, y, Math.max(.1, r), 0, TAU); g.fill(); }
function ell(g, x, y, rx, ry, rot, c) { g.fillStyle = c; g.beginPath(); g.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, TAU); g.fill(); }
function poly(g, pts, c) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fillStyle = c; g.fill(); }
function stroke(g, pts, c, w, cap = 'round') { g.lineCap = cap; g.lineJoin = 'round'; g.lineWidth = w; g.strokeStyle = c; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); }
// closed smooth outline through control points (quadratic midpoints)
function smoothPath(g, pts) { const n = pts.length, m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; g.beginPath(); g.moveTo(...m(pts[n - 1], pts[0]));
  for (let i = 0; i < n; i++) { const q = m(pts[i], pts[(i + 1) % n]); g.quadraticCurveTo(pts[i][0], pts[i][1], q[0], q[1]); } g.closePath(); }
function blob(g, pts, c) { smoothPath(g, pts); g.fillStyle = c; g.fill(); }

// ---- keyframes, camera ----
function kf(t, keys, e = ease.inOut) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) { const [a, va] = keys[i - 1], [b, vb] = keys[i], k = e((t - a) / (b - a)); return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k); }
  return keys[keys.length - 1][1];
}
// put world point (cx, cy) at screen centre, zoomed and rotated; applies to all three layers
function cam(cx = W / 2, cy = H / 2, zoom = 1, rot = 0) { for (const g of ALL()) { g.translate(W / 2, H / 2); g.rotate(rot); g.scale(zoom, zoom); g.translate(-cx, -cy); } }
const hit = (t, t0, decay = 6) => t < t0 ? 0 : Math.exp(-decay * (t - t0));

let PAINT_FRAME = {};
function paintSet(o) { Object.assign(PAINT_FRAME, o); }
function whip(dx, dy) { paintSet({ smear: [dx, dy] }); }

function screen(fn) { const sc = [.5, .5, 1, .5]; ALL().forEach((g, i) => { g.save(); g.setTransform(sc[i], 0, 0, sc[i], 0, 0); }); fn(); for (const g of ALL()) g.restore(); }
function flash(k, col = '#fff2dc') { if (k > .01) screen(() => { f.save(); f.globalCompositeOperation = 'lighter'; f.globalAlpha = clamp(k); f.fillStyle = col; f.fillRect(-10, -10, W + 20, H + 20); f.restore(); }); }
// block light: draw silhouettes on f in black after the light they should hide
function occlude(fn) { f.save(); f.globalCompositeOperation = 'source-over'; f.globalAlpha = 1; fn(); f.restore(); }

// ---- chapters and shots ----
const SHOTS = [];
function shot(name, a, b, fn, o = {}) { SHOTS.push({ name, a, b, fn, o }); }
function chapter(name, a, b, list, o = {}) {
  list.forEach(([t0, fn, so = {}], i) => { const t1 = i + 1 < list.length ? list[i + 1][0] : b; shot(`${name}:${fn.name || i}`, t0, t1, (t, p, lt) => fn(t, lt, t1 - t0), { paint: { ...(o.paint || {}), ...(so.paint || {}) }, xin: so.xin }); });
}

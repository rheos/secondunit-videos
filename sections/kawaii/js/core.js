// Core: time, audio features, rng, keyframes, shot registry, frame assembly.
// Every frame is a pure function of song time t (frames render in parallel and out of order):
// no state between frames, no Math.random(). A shot draws onto the 2D canvas `s` (1920 x 1080, 16:9),
// then the look's WebGL shader turns that into the finished frame.
const W = 1920, H = 1080;
const RS = parseFloat(new URLSearchParams(location.search).get('scale')) || 1;
const DUR = 366.83; // Airplane on the Highway, 2026 recording
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const ease = {
  out: (x) => 1 - Math.pow(1 - clamp(x), 3),
  in: (x) => Math.pow(clamp(x), 3),
  inOut: (x) => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; },
  back: (x) => { x = clamp(x); if (x <= 0) return 0; const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); },
  sine: (x) => .5 - .5 * Math.cos(Math.PI * clamp(x)),
};
function hash(n) { n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n = n ^ (n >>> 4); n = Math.imul(n, 0x27d4eb2d); n = n ^ (n >>> 15); return (n >>> 0) / 4294967296; }
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function noise1(x, seed = 0) { const i = Math.floor(x), u = x - i; const a = hash(i * 7919 + seed * 104729), b = hash((i + 1) * 7919 + seed * 104729); return a + (b - a) * u * u * (3 - 2 * u); }
const snoise = (x, seed = 0) => noise1(x, seed) * 2 - 1;
function kf(t, keys, e = ease.inOut) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) { const [a, va] = keys[i - 1], [b, vb] = keys[i], k = e((t - a) / (b - a)); return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k); }
  return keys[keys.length - 1][1];
}
const hit = (t, t0, decay = 6) => t < t0 ? 0 : Math.exp(-decay * (t - t0));
const onTwos = (t, n = 12) => Math.floor(t * n) / n;

// ---- audio ----
function F(name, t, sm = 0) {
  const a = FEAT[name], fr = t * FEAT.fps;
  if (!sm) { const i = Math.floor(fr), u = fr - i; return lerp(a[clamp(i, 0, a.length - 1)] || 0, a[clamp(i + 1, 0, a.length - 1)] || 0, u); }
  let sum = 0, n = 0; const c = Math.round(fr); for (let k = -sm; k <= sm; k++) { const v = a[c + k]; if (v !== undefined) { sum += v; n++; } } return n ? sum / n : 0;
}
function lastBeat(t) { const b = FEAT.beats; if (t < b[0]) return -1; let lo = 0, hi = b.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (b[m] <= t) lo = m; else hi = m - 1; } return lo; }
function beatPulse(t, decay = 7) { const i = lastBeat(t); return i < 0 ? 0 : Math.exp(-decay * (t - FEAT.beats[i])); }

// ---- shots ----
const SHOTS = [];
function chapter(name, a, b, list, o = {}) {
  list.forEach(([t0, fn, so = {}], i) => { const t1 = i + 1 < list.length ? list[i + 1][0] : b; SHOTS.push({ name: `${name}:${fn.name || i}`, a: t0, b: t1, fn, fx: { ...(o.fx || {}), ...(so.fx || {}) } }); });
}
let FX = {};
function fx(o) { Object.assign(FX, o); }

// ---- drawing on s ----
let s, k, f = null; // s = the paint (watercolour) layer, k = the marker-ink layer on top
let SEEDC = 0;
function fill(c) { s.fillStyle = c; s.fillRect(-W, -H, W * 3, H * 3); }
function vgrad(y0, y1, stops) { const g = s.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
function rgrad(x, y, r0, r1, stops) { const g = s.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
function dot(x, y, r, c) { s.fillStyle = c; s.beginPath(); s.arc(x, y, Math.max(.1, r), 0, TAU); s.fill(); }
function poly(pts, c) { s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.fillStyle = c; s.fill(); }
function line(pts, c, w, cap = 'round') { s.lineCap = cap; s.lineJoin = 'round'; s.lineWidth = w; s.strokeStyle = c; s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.stroke(); }
function withT(fn) { s.save(); fn(); s.restore(); }

function renderFrame(t) {
  if (typeof RAWT !== 'undefined') RAWT = t;
  s.setTransform(RS, 0, 0, RS, 0, 0); s.globalAlpha = 1; s.globalCompositeOperation = 'source-over'; s.filter = 'none';
  k.setTransform(1, 0, 0, 1, 0, 0); k.clearRect(0, 0, k.canvas.width, k.canvas.height); k.setTransform(RS, 0, 0, RS, 0, 0); k.globalAlpha = 1;
  SEEDC = 0;
  FX = {};
  const sh = SHOTS.find((x) => t >= x.a && t < x.b) || SHOTS[SHOTS.length - 1];
  if (sh) { Object.assign(FX, sh.fx); s.save(); k.save(); try { sh.fn(t, t - sh.a, sh.b - sh.a); } catch (e) { console.error(sh.name, e); } s.restore(); k.restore(); }
  Look.present(t, FX);
}

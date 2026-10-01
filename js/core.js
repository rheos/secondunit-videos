// Core: time, audio features, rng, keyframes, shot registry, and the frame pipeline.
// Every frame is a pure function of song time t (frames render in parallel and out of order):
// no state between frames, no Math.random(). A look draws flat shapes onto the 2D canvas `s`
// (1080 x 1920, 9:16), then its own WebGL shader turns that into the finished frame.
const W = 1080, H = 1920;
const DUR = 186; // the master: 6:51 to 9:57 of the Radio Free Winlove set
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
  step: () => 0,
};
function hash(n) { n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n = n ^ (n >>> 4); n = Math.imul(n, 0x27d4eb2d); n = n ^ (n >>> 15); return (n >>> 0) / 4294967296; }
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function noise1(x, seed = 0) { const i = Math.floor(x), u = x - i; const a = hash(i * 7919 + seed * 104729), b = hash((i + 1) * 7919 + seed * 104729); return a + (b - a) * u * u * (3 - 2 * u); }
const snoise = (x, seed = 0) => noise1(x, seed) * 2 - 1;
// keyframes: kf(t, [[t0, v0], [t1, v1], ...], easeFn); values may be numbers or arrays
function kf(t, keys, e = ease.inOut) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) { const [a, va] = keys[i - 1], [b, vb] = keys[i], k = e((t - a) / (b - a)); return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k); }
  return keys[keys.length - 1][1];
}
const hit = (t, t0, decay = 6) => t < t0 ? 0 : Math.exp(-decay * (t - t0));
// stop-motion time: t snapped to n drawings per second ("on twos" at 12)
const onTwos = (t, n = 12) => Math.floor(t * n) / n;

// ---- audio ----
function F(name, t, sm = 0) {
  const a = FEAT[name], fr = t * FEAT.fps;
  if (!sm) { const i = Math.floor(fr), u = fr - i; return lerp(a[clamp(i, 0, a.length - 1)] || 0, a[clamp(i + 1, 0, a.length - 1)] || 0, u); }
  let sum = 0, n = 0; const c = Math.round(fr); for (let k = -sm; k <= sm; k++) { const v = a[c + k]; if (v !== undefined) { sum += v; n++; } } return n ? sum / n : 0;
}
function lastBeat(t) { const b = FEAT.beats; if (t < b[0]) return -1; let lo = 0, hi = b.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (b[m] <= t) lo = m; else hi = m - 1; } return lo; }
function beatPulse(t, decay = 7) { const i = lastBeat(t); return i < 0 ? 0 : Math.exp(-decay * (t - FEAT.beats[i])); }
function beatIndex(t) { return lastBeat(t); }
// The sung "clap" of every "clap hands", from the vocal stem (Whisper's word times run long here).
// Chorus 1 (41.6), chorus 2 (74.4), chorus 3 (128.0), and the last one the cut ends inside (180.6).
const CLAPS = [41.6, 46.0, 50.033, 54.133, 74.433, 78.867, 83.033, 86.8, 127.967, 131.867, 135.9, 139.967, 180.633, 184.967];
const HANDS = CLAPS.map((k) => k + .53); // the sung "hands", about half a second after each clap
// Sections (seconds): the boundaries every chapter is cut to.
// The video starts at 11.0: before that is the previous song (Robin, 2026-10-01).
const SEC = { start: 11.0, intro: 11.0, v1: 26.04, c1: 41.6, v2: 56.88, c2: 74.433, v3: 89.7, b1: 111.8, c3: 127.967, v3b: 142.48, b2: 165.0, out: 180.633, end: DUR };
// words are TIMING ONLY: Whisper mishears this live take, so nothing here is ever drawn
const norm = (x) => x.toLowerCase().replace(/[^a-z0-9]/g, '');
function when(word, after = 0) { const w = norm(word); for (const l of LYRICS) for (const x of l.words) if (x.s >= after - .01 && norm(x.t) === w) return x.s; throw new Error('no word ' + word + ' after ' + after); }

// ---- shots ----
// chapter(name, start, end, [[t0, fn, opts], ...]); fn(t, lt, dur) paints the ENTIRE frame. Cuts land on each t0.
const SHOTS = [];
function chapter(name, a, b, list, o = {}) {
  list.forEach(([t0, fn, so = {}], i) => { const t1 = i + 1 < list.length ? list[i + 1][0] : b; SHOTS.push({ name: `${name}:${fn.name || i}`, a: t0, b: t1, fn, fx: { ...(o.fx || {}), ...(so.fx || {}) } }); });
}
// per-frame look uniforms a shot can set (e.g. wetness, smear)
let FX = {};
function fx(o) { Object.assign(FX, o); }

// ---- drawing on s (the 2D source canvas) ----
let s;
function cam(cx = W / 2, cy = H / 2, zoom = 1, rot = 0) { for (const g of f ? [s, f] : [s]) { g.translate(W / 2, H / 2); g.rotate(rot); g.scale(zoom, zoom); g.translate(-cx, -cy); } }
function fill(c) { s.fillStyle = c; s.fillRect(-W, -H, W * 3, H * 3); }
function vgrad(y0, y1, stops) { const g = s.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
function rgrad(x, y, r0, r1, stops) { const g = s.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
function dot(x, y, r, c) { s.fillStyle = c; s.beginPath(); s.arc(x, y, Math.max(.1, r), 0, TAU); s.fill(); }
function poly(pts, c) { s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.fillStyle = c; s.fill(); }
function line(pts, c, w, cap = 'round') { s.lineCap = cap; s.lineJoin = 'round'; s.lineWidth = w; s.strokeStyle = c; s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.stroke(); }
// a closed blob: n points round (x, y) with radius r(angle) wobbled by noise
function blobPts(x, y, rx, ry, seed, wob = .12, n = 48, rot = 0) {
  const o = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, k = 1 + (noise1(i / n * 7 + seed * 13.1, seed) - .5) * 2 * wob; const px = Math.cos(a) * rx * k, py = Math.sin(a) * ry * k; o.push([x + px * Math.cos(rot) - py * Math.sin(rot), y + px * Math.sin(rot) + py * Math.cos(rot)]); } return o;
}
function withT(fn) { s.save(); fn(); s.restore(); }

// ---- a hand, palm-on, fingers up; mirror with dir = -1. (x, y) = wrist; sc = palm width px. ----
// spread 0..1 opens the fingers; curl 0..1 bends them in. Returns its outline as polygons so a look can
// fill, tear or wash it however it wants: { palm, fingers: [poly...], thumb, cuff }.
function handShape(x, y, sc, { dir = 1, rot = 0, spread = .3, curl = 0 } = {}) {
  const R = (px, py) => { const cx = px * dir, cy = py; return [x + cx * Math.cos(rot) - cy * Math.sin(rot), y + cx * Math.sin(rot) + cy * Math.cos(rot)]; };
  const palm = [[-.5, 0], [-.55, -.45], [-.5, -.95], [-.26, -1.05], [0, -1.08], [.26, -1.05], [.5, -.98], [.56, -.5], [.48, 0]].map(([a, b]) => R(a * sc, b * sc));
  const fingers = [[-.37, .82, -.14], [-.12, 1.0, -.04], [.13, .95, .05], [.37, .72, .15]].map(([bx, len, ang], i) => {
    const a = ang * (1 + spread * 1.6) + (i - 1.5) * .02, L = len * sc * (1 - curl * .45), w = .13 * sc;
    const b0 = [bx * sc, -1.0 * sc], dx = Math.sin(a), dy = -Math.cos(a), nx = Math.cos(a) * w, ny = Math.sin(a) * w, tip = [b0[0] + dx * (L - w), b0[1] + dy * (L - w)];
    const pts = []; for (let k = 0; k <= 10; k++) { const th = Math.PI * k / 10; pts.push([tip[0] - nx * Math.cos(th) + dx * w * Math.sin(th), tip[1] - ny * Math.cos(th) + dy * w * Math.sin(th)]); }
    return [[b0[0] - nx, b0[1] - ny], ...pts, [b0[0] + nx, b0[1] + ny]].map(([a1, b1]) => R(a1, b1));
  });
  // thumb: a fat capsule from the palm's side, angled out
  const ta = 1.0 + spread * .5, tb = [.4 * sc, -.3 * sc], tw = .15 * sc, tL = .62 * sc, tdx = Math.sin(ta), tdy = -Math.cos(ta), tnx = Math.cos(ta) * tw, tny = Math.sin(ta) * tw, ttip = [tb[0] + tdx * (tL - tw), tb[1] + tdy * (tL - tw)];
  const tarc = []; for (let k = 0; k <= 10; k++) { const th = Math.PI * k / 10; tarc.push([ttip[0] - tnx * Math.cos(th) + tdx * tw * Math.sin(th), ttip[1] - tny * Math.cos(th) + tdy * tw * Math.sin(th)]); }
  const thumb = [[tb[0] - tnx * 1.3, tb[1] - tny * 1.3], ...tarc, [tb[0] + tnx * 1.3, tb[1] + tny * 1.3 + tw]].map(([a1, b1]) => R(a1, b1));
  const cuff = [[-.56, .05], [.5, .05], [.58, .55], [-.6, .55]].map(([a1, b1]) => R(a1 * sc, b1 * sc));
  return { palm, fingers, thumb, cuff };
}

// ---- a clapping hand, seen from the front: upright, palm facing the other hand, so it reads in profile ----
// (x, y) = wrist; sc = px per unit (the hand is ~1.9 units tall). dir -1 = the LEFT hand (palm faces +x),
// dir 1 = the right hand. open = hinge angle at the heel of the palm (0 = flat against the other palm).
// Returns { body, thumb, cuff, lines, inner } in screen coords; inner is the palm-edge x at the wrist line.
function clapHand(x, y, sc, { dir = -1, open = 0, cup = 0 } = {}) {
  const m = -dir, rot = dir * open; // build the left hand, mirror for the right; open swings the fingertips outward
  // hinge about the heel of the palm on its inner edge, so the wrists stay put while the fingers swing
  const hx = .15 * m * sc, hy = -.3 * sc;
  const R = ([px, py]) => { const a = px * m * sc - hx, b = py * sc - hy; return [x + hx + a * Math.cos(rot) - b * Math.sin(rot), y + hy + a * Math.sin(rot) + b * Math.cos(rot)]; };
  const body = [[-.3, 0], [-.34, -.4], [-.35, -.78], [-.31, -1.0], [-.28, -1.3], [-.21, -1.62], [-.1, -1.84], [.02, -1.88], [.11, -1.8], [.15 - cup * .05, -1.5], [.17 - cup * .08, -1.05], [.17 - cup * .05, -.55], [.14, 0]].map(R);
  const thumb = [[.02, -.2], [.1, -.5], [.15, -.8], [.21, -1.0], [.27, -.98], [.27, -.86], [.22, -.55], [.17, -.22], [.12, -.08]].map(R);
  const cuff = [[-.36, .04], [.16, .04], [.2, .55], [-.4, .55]].map(R);
  // the fingers, stacked behind each other along the back of the hand, and the knuckle crease
  const lines = [
    [[-.2, -1.02], [-.14, -1.42], [-.05, -1.7]], [[-.08, -1.04], [-.03, -1.4], [.04, -1.62]], [[.04, -1.06], [.08, -1.36], [.11, -1.5]],
    [[-.3, -.98], [-.18, -1.05], [-.04, -1.05]],
  ].map((l) => l.map(R));
  return { body, thumb, cuff, lines };
}
// the hinge angle through a clap at k: swings shut fast, bounces open, settles half open
function clapOpen(t, k, wide = .5) {
  const lt = t - k;
  if (lt < 0) return wide * ease.out(clamp(-lt / .38));
  return wide * (.55 * ease.out(clamp(lt / .3)) - .1 * ease.inOut(clamp((lt - .3) / 1.2)));
}

// ---- frame assembly ----
// With the brushstroke renderer (js/paint.js) loaded, s and f are its half-res underpainting and light
// layers, drawn in full-res coords; otherwise s is the look's own 2D source canvas.
let f = null;
function renderFrame(t) {
  const painted = typeof Paint !== 'undefined';
  if (painted) { s = Paint.sctx; f = Paint.fctx; }
  for (const g of painted ? [s, f] : [s]) { g.setTransform(painted ? .5 : 1, 0, 0, painted ? .5 : 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; }
  if (painted) { f.fillStyle = '#000'; f.fillRect(-50, -50, W + 100, H + 100); }
  FX = {};
  const sh = SHOTS.find((x) => t >= x.a && t < x.b) || SHOTS[SHOTS.length - 1];
  if (sh) { Object.assign(FX, sh.fx); s.save(); if (f) f.save(); try { sh.fn(t, t - sh.a, sh.b - sh.a); } catch (e) { console.error(sh.name, e); } s.restore(); if (f) f.restore(); }
  Look.present(t, FX);
}

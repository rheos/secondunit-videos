// Core: time, rng, keyframes, frame assembly. Every frame is a pure function of time t (frames render in
// parallel and out of order): no state between frames, no Math.random(). The shots draw onto the 2D
// canvas `s` (720 x 1280, 9:16), then the look's WebGL shader turns that into the finished frame.
const W = 720, H = 1280, FPS = 24;
const RS = (parseFloat(new URLSearchParams(location.search).get('w')) || 720) / 720;
const DUR = 198.3695; // _in/andre.wav
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const ease = {
  out: (x) => 1 - Math.pow(1 - clamp(x), 3),
  in: (x) => Math.pow(clamp(x), 3),
  inOut: (x) => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; },
  outQuint: (x) => 1 - Math.pow(1 - clamp(x), 5),
  inExpo: (x) => { x = clamp(x); return x <= 0 ? 0 : Math.pow(2, 10 * x - 10); },
  inOutSine: (x) => .5 - .5 * Math.cos(Math.PI * clamp(x)),
};
function hash(n) { n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n = n ^ (n >>> 4); n = Math.imul(n, 0x27d4eb2d); n = n ^ (n >>> 15); return (n >>> 0) / 4294967296; }
function noise1(x, seed = 0) { const i = Math.floor(x), u = x - i; const a = hash(i * 7919 + seed * 104729), b = hash((i + 1) * 7919 + seed * 104729); return a + (b - a) * u * u * (3 - 2 * u); }
const snoise = (x, seed = 0) => noise1(x, seed) * 2 - 1;
function kf(t, keys, e = ease.inOut) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) { const [a, va] = keys[i - 1], [b, vb] = keys[i], k = e((t - a) / (b - a)); return lerp(va, vb, k); }
  return keys[keys.length - 1][1];
}
// integral of a piecewise-linear rate given as [[t, rate], ...] (for a loop whose speed ramps)
function integ(t, keys) {
  let acc = 0;
  for (let i = 1; i < keys.length; i++) {
    const [a, ra] = keys[i - 1], [b, rb] = keys[i];
    if (t <= a) break;
    const te = Math.min(t, b), u = (te - a) / (b - a);
    acc += (te - a) * (ra + lerp(ra, rb, u)) / 2;
  }
  if (t > keys[keys.length - 1][0]) acc += (t - keys[keys.length - 1][0]) * keys[keys.length - 1][1];
  return acc;
}
const hit = (t, t0, decay = 6) => t < t0 ? 0 : Math.exp(-decay * (t - t0));
const onTwos = (t, n = 12) => Math.floor(t * n) / n;
// springs as a damping ratio (tools/motion-lab/motion.js); the same closed form here so the page runs without it
function spring(t, zeta = .78, hz = 2.2) {
  if (t <= 0) return 0; const w = TAU * hz;
  if (zeta >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + (zeta * w / wd) * Math.sin(wd * t));
}
const PROBE = (typeof ML !== 'undefined' && ML.probe) || { on: false, text() {}, box() {}, event() {}, edge() {}, value() {} };

// ---- frames and words ----
const FR = (t) => Math.round(t * FPS);           // the frame of time t on the 24 fps grid
const fs = (f) => f / FPS;                        // seconds of a frame
const wf = (i) => WORDS[i][1];                    // snapped frame of word i (js/words.js)
const wtx = (i) => WORDS[i][0];                   // the word as transcribed
const wclean = (i) => WORDS[i][0].replace(/^-/, '');
const voc = (f) => VOC[clamp(f - VOC0, 0, VOC.length - 1)] || 0;

let FX = {};
function fx(o) { Object.assign(FX, o); }

// ---- drawing on s ----
let s = null;
function fill(c) { s.fillStyle = c; s.fillRect(-W, -H, W * 3, H * 3); }
function dot(x, y, r, c) { s.fillStyle = c; s.beginPath(); s.arc(x, y, Math.max(.1, r), 0, TAU); s.fill(); }
function poly(pts, c) { s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.fillStyle = c; s.fill(); }
function line(pts, c, w, cap = 'round') { s.lineCap = cap; s.lineJoin = 'round'; s.lineWidth = w; s.strokeStyle = c; s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.stroke(); }
function withT(fn) { s.save(); fn(); s.restore(); }

function renderFrame(t) {
  s.setTransform(RS, 0, 0, RS, 0, 0); s.globalAlpha = 1; s.globalCompositeOperation = 'source-over'; s.filter = 'none';
  FX = {};
  s.save(); try { drawFrame(t); } catch (e) { console.error('drawFrame', e); } s.restore();
  Look.present(t, FX);
}

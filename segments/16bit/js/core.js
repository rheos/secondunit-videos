// Core: time, the beat clock, rng, keyframes, shot registry, frame assembly.
// Every frame is a pure function of segment time t (frames render in parallel and out of order):
// no state between frames, no Math.random(). A shot draws onto the 2D canvas `s`, then the look's
// WebGL shader turns that into the finished frame. W x H is the design size; ?scale= sets the output
// (the default 2/3 gives 1280 x 720, an exact x4 of the 320 x 180 game screen).
const W = 1920, H = 1080;
const RS = parseFloat(new URLSearchParams(location.search).get('scale')) || 2 / 3;
const DUR = 15, FPS = 24;
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
};
function hash(n) { n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n = n ^ (n >>> 4); n = Math.imul(n, 0x27d4eb2d); n = n ^ (n >>> 15); return (n >>> 0) / 4294967296; }
function noise1(x, seed = 0) { const i = Math.floor(x), u = x - i; const a = hash(i * 7919 + seed * 104729), b = hash((i + 1) * 7919 + seed * 104729); return a + (b - a) * u * u * (3 - 2 * u); }
const snoise = (x, seed = 0) => noise1(x, seed) * 2 - 1;
function kf(t, keys, e = ease.inOut) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) { const [a, va] = keys[i - 1], [b, vb] = keys[i], k = e((t - a) / (b - a)); return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k); }
  return keys[keys.length - 1][1];
}
const hit = (t, t0, decay = 6) => t < t0 ? 0 : Math.exp(-decay * (t - t0));
const onTwos = (t, n = 12) => Math.floor(t * n) / n;
const step = (t, n) => Math.floor(t * n);      // animation frame counter at n fps
const blink = (t, hz = 2) => step(t, hz * 2) % 2 === 0;
// text typed out letter by letter: words[i] starts at times[i]
function typed(words, times, t, cps = 34) {
  let out = '';
  for (let i = 0; i < words.length; i++) {
    if (t < times[i]) break;
    const n = Math.min(words[i].length, Math.floor((t - times[i]) * cps) + 1);
    out += (i ? ' ' : '') + words[i].slice(0, n);
    if (n < words[i].length) break;
  }
  return out;
}
function integ(fn, a, b, h = 1 / 96) { if (b <= a) return 0; let sum = 0; for (let x = a; x < b; x += h) sum += fn(Math.min(b, x + h / 2)) * Math.min(h, b - x); return sum; }

// ---- the clock: no song, so a fixed 120 bpm grid stands in for the audio. Hits land on beats. ----
const BPM = 120, BEAT = 60 / BPM;
const beatAt = (n) => n * BEAT;                // the n-th beat, seconds
const beatPulse = (t, decay = 7) => Math.exp(-decay * (t - Math.floor(t / BEAT) * BEAT));

// ---- shots ----
const SHOTS = [];
function shot(name, a, b, fn) { SHOTS.push({ name, a, b, fn }); }
let FX = {};
function fx(o) { Object.assign(FX, o); }

let s = null; // the 2D source canvas, set up by GL.init
function renderFrame(t) {
  s.setTransform(RS, 0, 0, RS, 0, 0); s.globalAlpha = 1; s.globalCompositeOperation = 'source-over'; s.filter = 'none';
  FX = {};
  const sh = SHOTS.find((x) => t >= x.a && t < x.b) || SHOTS[SHOTS.length - 1];
  if (sh) { s.save(); try { sh.fn(t, t - sh.a, sh.b - sh.a); } catch (e) { console.error(sh.name, e); } s.restore(); }
  Look.present(t, FX);
}

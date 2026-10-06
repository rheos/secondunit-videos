// Style-free helpers shared by every look: time, audio features, easing, rng, keyframes.
// Every look draws in 1920x1080 coordinates; the page scales to the canvas size (?w=1280&h=720 for drafts).
// Each look defines drawFrame(g, t) where t is song time in seconds (24 fps song grid when rendering).
const W = 1920, H = 1080, TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const ease = {
  out: (x) => 1 - Math.pow(1 - clamp(x), 3),
  in: (x) => Math.pow(clamp(x), 3),
  inOut: (x) => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; },
  back: (x) => { x = clamp(x); if (x <= 0) return 0; const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); },
  elastic: (x) => { x = clamp(x); return x === 0 || x === 1 ? x : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * TAU / 3) + 1; },
  sine: (x) => .5 - .5 * Math.cos(Math.PI * clamp(x)),
};
function hash(n) { n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n = n ^ (n >>> 4); n = Math.imul(n, 0x27d4eb2d); n = n ^ (n >>> 15); return (n >>> 0) / 4294967296; }
const hash2 = (i, j, s = 0) => hash((Math.imul(i, 73856093) ^ Math.imul(j, 19349663) ^ Math.imul(s, 83492791)) >>> 0);
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function noise1(x, seed = 0) { const i = Math.floor(x), f = x - i; const a = hash(i * 7919 + seed * 104729), b = hash((i + 1) * 7919 + seed * 104729); const u = f * f * (3 - 2 * f); return a + (b - a) * u; }
const snoise = (x, seed = 0) => noise1(x, seed) * 2 - 1;
function kf(t, keys, e = ease.inOut) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) { const [a, va] = keys[i - 1], [b, vb] = keys[i], k = e((t - a) / (b - a)); return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k); }
  return keys[keys.length - 1][1];
}
const hit = (t, t0, decay = 6) => t < t0 ? 0 : Math.exp(-decay * (t - t0));

// ---- audio: window.FEAT (30 fps loudness 0..1 per stem: vocals drums bass other piano; beats; tempo) ----
function F(name, t) { const a = FEAT[name], f = t * FEAT.fps, i = Math.floor(f), u = f - i; return lerp(a[clamp(i, 0, a.length - 1)] || 0, a[clamp(i + 1, 0, a.length - 1)] || 0, u); }
function lastBeat(t) { const b = FEAT.beats; if (t < b[0]) return -1; let lo = 0, hi = b.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (b[m] <= t) lo = m; else hi = m - 1; } return lo; }
function beatPulse(t, decay = 6) { const i = lastBeat(t); return i < 0 ? 0 : Math.exp(-decay * (t - FEAT.beats[i])); }
function beatPhase(t) { const i = lastBeat(t), b = FEAT.beats; if (i < 0 || i >= b.length - 1) return 0; return (t - b[i]) / (b[i + 1] - b[i]); }
const beatIndex = (t) => lastBeat(t);

// ---- lyrics: window.LINES from js/data.js. Words come from Bob's sheet, times from the audio. ----
// LINES[i] = { sec, text, t0, t1, words: [{ w, t }] }. Use wordTime('verse1', 0, 'indigo') to cue a hit.
function line(sec, n) { return LINES.filter((L) => L.sec === sec)[n]; }
function wordTime(sec, n, word) { const L = line(sec, n); const w = L.words.find((x) => x.w.replace(/[^a-z']/gi, '').toLowerCase() === word.toLowerCase()); if (!w) throw new Error(`no word ${word} in ${sec}[${n}]`); return w.t; }

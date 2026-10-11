// Shared helpers for every look. Every frame is a pure function of song time t:
// no Math.random, no Date, no state carried between frames (render workers draw frames out of order).
const W = 1920, H = 1080, TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const ease = (t, a, b) => smooth((t - a) / (b - a));
const lin = (t, a, b) => clamp((t - a) / (b - a));
const easeOutBack = (x, s = 1.7) => { x = clamp(x) - 1; return 1 + x * x * ((s + 1) * x + s); };
function rnd(a, b = 0, c = 0) { const x = Math.sin(a * 127.1 + b * 311.7 + c * 74.7 + 0.37) * 43758.5453; return x - Math.floor(x); }
function n1(seed, x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(rnd(seed, i), rnd(seed, i + 1), u) * 2 - 1; }
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function mkCanvas(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
function rgb(c, a = 1) { return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`; }
function mix(c, d, u) { return [lerp(c[0], d[0], u), lerp(c[1], d[1], u), lerp(c[2], d[2], u)]; }
// Which shot is active: shots = [{t: start, ...}] sorted by t. Returns [shot, localTime, index].
function shotAt(shots, t) { let i = 0; while (i + 1 < shots.length && shots[i + 1].t <= t) i++; return [shots[i], t - shots[i].t, i]; }

// Pre-baked film grain: 8 seeded tiles, picked by frame number so it flickers at 24 fps and stays deterministic.
const GRAIN = [];
function buildGrain(n = 8, s = 512, amt = 34) {
  for (let k = 0; k < n; k++) {
    const c = mkCanvas(s, s), g = c.getContext('2d'), d = g.createImageData(s, s), R = mulberry(900 + k);
    for (let i = 0; i < s * s; i++) { const v = 128 + (R() + R() + R() - 1.5) * amt; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
    g.putImageData(d, 0, 0); GRAIN.push(c);
  }
}
function drawGrain(g, t, alpha = .18, mode = 'overlay') {
  if (!GRAIN.length) buildGrain();
  const f = Math.round(t * 24), tile = GRAIN[f % GRAIN.length];
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = alpha; g.globalCompositeOperation = mode;
  const ox = Math.floor(rnd(f, 3) * 512), oy = Math.floor(rnd(f, 7) * 512);
  g.translate(-ox, -oy); g.fillStyle = g.createPattern(tile, 'repeat'); g.fillRect(0, 0, W + 512, H + 512); g.restore();
}
// Text that must fit a box: shrinks the font until the measured width fits (see text-fits-container).
function fitText(g, txt, maxW, size, font) { let s = size; g.font = font.replace('{s}', s); while (s > 6 && g.measureText(txt).width > maxW) { s -= 1; g.font = font.replace('{s}', s); } return s; }

// motion-lab probes (rheos/secondunit-videos tools/motion-lab): the audit injects ML; everywhere else, cloud
// renders included, these do nothing. probeWord fires 'word#<line>.<word>' on the first frame a sung word is
// drawn; gate(t) is the same test the drawing code uses, so the previous frame is checked the same way.
const PROBE = (typeof ML !== 'undefined' && ML.probe) || { on: false, text() {}, box() {}, event() {}, edge() {}, value() {} };
function probeWord(t, li, wi, gate) { if (PROBE.on) PROBE.edge(`word#${li}.${wi}`, true, gate(ML.prevT(t))); }

// Page harness: offline hooks for check.mjs / render.mjs, and a live player (click or space) for T0..T1.
function startPage(out, renderFrame, T0, T1, ready = Promise.resolve(true)) {
  const params = new URLSearchParams(location.search);
  window.__frameJPEG = (t, q = .93) => { renderFrame(t); return out.toDataURL('image/jpeg', q); };
  window.__ready = ready;
  if (params.has('offline')) return;
  const audio = document.getElementById('a');
  const a = parseFloat(params.get('a') || T0), b = parseFloat(params.get('b') || T1);
  ready.then(() => {
    audio.currentTime = params.has('t') ? parseFloat(params.get('t')) : a;
    (function loop() { let t = audio.currentTime || a; if (t >= b) { audio.currentTime = a; t = a; } renderFrame(t); requestAnimationFrame(loop); })();
    const toggle = () => audio.paused ? audio.play() : audio.pause();
    out.onclick = toggle;
    window.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); toggle(); } });
  });
}

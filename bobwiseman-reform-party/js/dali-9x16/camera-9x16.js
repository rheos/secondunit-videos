// Reform Party 9:16 (looks/dali-9x16.html): the same drone flight reframed for a 1080x1920 frame.
// camera.js camAt hands every pose through camPortrait(t, cam, bare). The 16:9 master never loads this file.
//
// The tall frame keeps the master's lens (LENS_9X16 scales it) and so sees the middle 56% of the master's width and
// 1.78x its height. Where the master put its subject off centre, the drone turns (a real yaw, not a crop) just enough
// to bring it into the tall frame: the subject is the cue target of the word being sung (camera.js CUE_TARGETS), else
// the boardroom table while the drone is near it. Bare poses (scene placement) stay the master's. The turn is only what the tall frame needs (a dead band round the
// middle), smoothed over about half a second, so the flight stays the master's flight.
const LENS_9X16 = 1;
const PORT = { band: 300, sigma: .5, fps: 24, end: 268.99, off: null, busy: false, ready: false };
// the subjects at time t: [world point, weight]; a cue word's target from about 1.2 s before to 1.2 s after it
function portraitSubjects(t) {
  const out = [];
  if (typeof CUE_TARGETS !== 'undefined') for (const q of CUE_TARGETS) {
    const w = smooth(clamp((t - (q.t - 1.7)) / .5)) * (1 - smooth(clamp((t - (q.t + .9)) / .5)));
    if (w > 0) out.push([q.at(t), w]);
  }
  return out;
}
// how far (radians) the drone must turn so a screen point sits inside the band round the middle
function needYaw(s, f) { const x = s[0] - W / 2, lim = PORT.band; if (Math.abs(x) <= lim) return 0; return Math.atan((x - Math.sign(x) * lim) / f); }
function buildPortrait() {
  PORT.busy = true; const n = Math.round(PORT.end * PORT.fps) + 1, raw = new Float64Array(n), sv = [C, CP, SP, CX, CZ, YAW];
  for (let i = 0; i < n; i++) {
    const t = i / PORT.fps; C = camAt(t); CP = Math.cos(C.p); SP = Math.sin(C.p); CX = carX(t); CZ = carZ(t); YAW = yaw(t);
    let subs = portraitSubjects(t), sum = 0, acc = 0;
    if (!subs.length && t < 238 && Math.hypot(C.x - CX, C.z - CZ) < 60) subs = [[Lw(0, 1.4, 0), .6]]; // the table
    for (const [w, k] of subs) { const s = P(w[0], w[1], w[2]); if (s[2] < .3 || !isFinite(s[0]) || Math.abs(s[0] - W / 2) > MW / 2) continue; /* only what the master shows */ acc += k * needYaw(s, C.f); sum += k; }
    raw[i] = sum > 0 ? acc / Math.max(sum, 1) : 0;
  }
  [C, CP, SP, CX, CZ, YAW] = sv;
  const r = Math.ceil(PORT.sigma * 3 * PORT.fps), ker = []; for (let k = -r; k <= r; k++) ker.push(Math.exp(-.5 * (k / (PORT.sigma * PORT.fps)) ** 2));
  const ks = ker.reduce((a, b) => a + b, 0), off = new Float64Array(n);
  for (let i = 0; i < n; i++) { let a = 0; for (let k = -r; k <= r; k++) a += ker[k + r] * raw[clamp(i + k, 0, n - 1)]; off[i] = a / ks; }
  PORT.off = off; PORT.busy = false;
}
function portraitYaw(t) { if (!PORT.off) buildPortrait(); const u = clamp(t, 0, PORT.end) * PORT.fps, i = Math.floor(u), fr = u - i, o = PORT.off; return lerp(o[Math.min(i, o.length - 1)], o[Math.min(i + 1, o.length - 1)], fr); }
// Flash fixes for the tall frame only (tools/motion-lab/flashcheck.py failed the first 9:16 render here, the 16:9 passes):
// [t0, t1, ramp, lens x, pitch +rad]. 78.0-80.6: the push into the cell bars (bars sliding through a narrow frame);
// 146.6-148.6: the protected whip onto the mystery book (the near seat backs sweep the bottom of the tall frame).
const PORT_FIX = [[78.0, 80.6, 1.2, .72, 0], [146.6, 148.6, .8, 1, .14]];
function portFix(t) { let lens = 1, dp = 0; for (const [a, b, r, l, p] of PORT_FIX) { const w = smooth(clamp((t - (a - r)) / r)) * (1 - smooth(clamp((t - b) / r))); lens *= lerp(1, l, w); dp += p * w; } return [lens, dp]; }
function camPortrait(t, c, bare) {
  if (bare) return c; // scene placement (bare) reads the master's pose, so every prop stands where it stands in the 16:9
  // until every builder file has loaded (frame-9x16.js sets PORT.ready), cue targets read stubs: the master's pose, nothing cached
  if (PORT.busy || !PORT.ready) return Object.assign({}, c, { f: c.f * LENS_9X16 });
  const dy = c.p > 1.3 ? 0 : portraitYaw(t); // looking straight down (the aerial, the chess top-down) a yaw only spins the map
  const yw = c.yaw + dy, [fl, fp] = portFix(t);
  return Object.assign({}, c, { f: c.f * LENS_9X16 * fl, p: Math.min(c.p + fp, 1.565), yaw: yw, cy: Math.cos(yw), sy: Math.sin(yw) });
}

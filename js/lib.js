// Time, audio, noise, drawing helpers, camera. Easing/noise/kf helpers follow functional-emotions-video (MIT).
const TAU = Math.PI * 2;
const FPS = 24, END = 25.84, NFRAMES = 620;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const ease = {
  lin: (x) => clamp(x),
  out: (x) => 1 - Math.pow(1 - clamp(x), 3),
  out2: (x) => 1 - Math.pow(1 - clamp(x), 2),
  in: (x) => Math.pow(clamp(x), 3),
  in2: (x) => Math.pow(clamp(x), 2),
  inOut: (x) => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; },
  sine: (x) => .5 - .5 * Math.cos(Math.PI * clamp(x)),
  back: (x) => { x = clamp(x); if (x <= 0) return 0; const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); },
};
function hash(n) { n = n | 0; n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n = n ^ (n >>> 4); n = Math.imul(n, 0x27d4eb2d); n = n ^ (n >>> 15); return (n >>> 0) / 4294967296; }
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function noise1(x, seed = 0) { const i = Math.floor(x), f = x - i; const a = hash(i * 7919 + seed * 104729), b = hash((i + 1) * 7919 + seed * 104729); const u = f * f * (3 - 2 * f); return a + (b - a) * u; }
const snoise = (x, seed = 0) => noise1(x, seed) * 2 - 1;
function noise2(x, y, seed = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const H = (a, b) => hash(a * 73856093 ^ b * 19349663 ^ seed * 83492791);
  return lerp(lerp(H(xi, yi), H(xi + 1, yi), u), lerp(H(xi, yi + 1), H(xi + 1, yi + 1), u), v);
}
function fbm2(x, y, seed = 0, oct = 4) { let s = 0, a = .5, n = 0; for (let i = 0; i < oct; i++) { s += a * noise2(x, y, seed + i * 17); n += a; x *= 2.03; y *= 2.03; a *= .5; } return s / n; }

// ---- audio (window.FEAT from tools/analyze.py, 24 fps) ----
function F(name, t) { const a = FEAT[name]; const f = t * FEAT.fps; const i = Math.floor(f), u = f - i; return lerp(a[clamp(i, 0, a.length - 1)] || 0, a[clamp(i + 1, 0, a.length - 1)] || 0, u); }
const BEATS = FEAT.beats;
const BAR = (n) => BEATS[n * 4];                  // downbeats: beat indices 0, 4, 8 ... (checked in tools/analyze.py)
const hit = (t, t0, decay = 6) => t < t0 ? 0 : Math.exp(-decay * (t - t0));
function hits(t, list, decay = 6) { let s = 0; for (const x of list) s += hit(t, x, decay); return s; }
function lastBeat(t) { let k = -1; for (let i = 0; i < BEATS.length; i++) if (BEATS[i] <= t) k = i; return k; }
function beatPulse(t, decay = 7) { const i = lastBeat(t); return i < 0 ? 0 : Math.exp(-decay * (t - BEATS[i])); }

// ---- keyframes ----
function kf(t, keys, e = ease.inOut) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) { const [a, va] = keys[i - 1], [b, vb] = keys[i], k = (keys[i][2] || e)((t - a) / (b - a)); return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k); }
  return keys[keys.length - 1][1];
}

// ---- contexts: s = underpainting (half res), f = light (half res), k = ink (full res); all drawn in 1920x1080 world coords ----
let s, f, k;
function bindCtx() { s = Paint.sctx; f = Paint.fctx; k = Paint.ictx; }
const BASE = () => [[s, .5], [f, .5], [k, 1]];
function resetCtx() { for (const [g, sc] of BASE()) { g.setTransform(sc, 0, 0, sc, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; } }
// camera: CAM = {cx, cy, zoom, rot}; layer(depth, fn) draws fn with parallax. depth 1 = the action plane, <1 = farther away.
let CAM = { cx: 960, cy: 540, zoom: 1, rot: 0 };
function layer(depth, fn) {
  const z = Math.pow(CAM.zoom, depth), cx = W / 2 + (CAM.cx - W / 2) * depth, cy = H / 2 + (CAM.cy - H / 2) * depth;
  for (const [g, sc] of BASE()) { g.save(); g.setTransform(sc, 0, 0, sc, 0, 0); g.translate(W / 2, H / 2); g.rotate(CAM.rot * depth); g.scale(z, z); g.translate(-cx, -cy); }
  try { fn(); } finally { for (const [g] of BASE()) g.restore(); }
}
function screen(fn) { for (const [g, sc] of BASE()) { g.save(); g.setTransform(sc, 0, 0, sc, 0, 0); } try { fn(); } finally { for (const [g] of BASE()) g.restore(); } }

function fill(g, c) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = c; g.fillRect(0, 0, g.canvas.width, g.canvas.height); g.restore(); }
function vgrad(g, y0, y1, stops) { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; }
function rgrad(g, x, y, r0, r1, stops) { const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; }
function glow(x, y, r, color, a = 1, g = f) {
  if (!(r > .5) || !(a > .002)) return;
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = clamp(a);
  g.fillStyle = rgrad(g, x, y, 0, r, [[0, color], [1, 'rgba(0,0,0,0)']]); g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
}
function dot(g, x, y, r, c) { g.fillStyle = c; g.beginPath(); g.arc(x, y, Math.max(.1, r), 0, TAU); g.fill(); }
function poly(g, pts, c) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fillStyle = c; g.fill(); }
function line(g, pts, c, w, cap = 'round') { g.lineCap = cap; g.lineJoin = 'round'; g.lineWidth = w; g.strokeStyle = c; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); }
// hand-inked line: width follows a pressure curve and wobbles, drawn as short overlapping segments
function inkLine(g, pts, c, w, seed = 0, o = {}) {
  const { taper = .25, wob = .8, dry = 0 } = o; const n = pts.length; if (n < 2) return;
  g.lineCap = 'round'; g.strokeStyle = c;
  for (let i = 0; i < n - 1; i++) {
    const u = i / (n - 1);
    const pr = Math.min(1, u / taper, (1 - u) / taper + .15) * (.75 + .5 * noise1(i * .15, seed));
    if (dry && noise1(i * .6, seed + 5) < dry) continue;
    g.lineWidth = Math.max(.4, w * pr);
    const j = (a) => a + snoise(i * .3, seed + 11) * wob;
    g.beginPath(); g.moveTo(j(pts[i][0]), pts[i][1]); g.lineTo(j(pts[i + 1][0]), pts[i + 1][1] + snoise(i * .3, seed + 13) * wob * .5); g.stroke();
  }
}
function bez(p0, p1, p2, p3, n = 30) { const o = []; for (let i = 0; i <= n; i++) { const u = i / n, v = 1 - u; o.push([v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]); } return o; }
function partial(pts, u) { u = clamp(u); if (u <= 0) return []; const m = u * (pts.length - 1), i = Math.floor(m), r = m - i; const o = pts.slice(0, i + 1); if (i + 1 < pts.length && r > 0) o.push([lerp(pts[i][0], pts[i + 1][0], r), lerp(pts[i][1], pts[i + 1][1], r)]); return o; }
function rgba(c, a) { return `rgba(${c[0]},${c[1]},${c[2]},${clamp(a).toFixed(3)})`; }
function mixc(a, b, t) { return [lerp(a[0], b[0], t) | 0, lerp(a[1], b[1], t) | 0, lerp(a[2], b[2], t) | 0]; }

// painted reveal: clip to a union of brush dabs that land in sweep order, then draw fn.
// region [x0,y0,x1,y1]; dir = sweep direction [dx,dy]; p 0..1.
const _dabs = {};
function reveal(g, key, region, p, dir, fn, n = 160, size = 110) {
  if (p <= 0) return; if (p >= 1) { fn(); return; }
  let D = _dabs[key];
  if (!D) {
    const r = rng(key.length * 977 + n); const [x0, y0, x1, y1] = region; D = [];
    const L = Math.hypot(dir[0], dir[1]) || 1, dx = dir[0] / L, dy = dir[1] / L;
    let mn = 1e9, mx = -1e9;
    for (let i = 0; i < n; i++) { const x = lerp(x0, x1, r()), y = lerp(y0, y1, r()); const pr = x * dx + y * dy; mn = Math.min(mn, pr); mx = Math.max(mx, pr); D.push({ x, y, pr, a: (r() - .5) * .8 + Math.atan2(dy, dx) + Math.PI / 2 * (r() < .5 ? 0 : 1) * .3, w: size * (.7 + .8 * r()), h: size * (.35 + .35 * r()), j: r() }); }
    for (const d of D) d.at = ((d.pr - mn) / (mx - mn + 1e-6)) * .78 + d.j * .22;
    _dabs[key] = D;
  }
  g.save(); g.beginPath();
  for (const d of D) { const q = clamp((p - d.at * .85) / .15); if (q <= 0) continue; const e = ease.out(q); g.moveTo(d.x + d.w * e, d.y); g.ellipse(d.x, d.y, d.w * e, d.h * e, d.a, 0, TAU); }
  g.clip(); fn(); g.restore();
}

// ---- flame: licking tongues on src (brushed), soft hot light on fx ----
function flame(x, y, h, w, t, seed, heat = 1, o = {}) {
  if (h < 1 || heat <= 0.01) return;
  const { lightK = 1, srcK = 1, lean = 0, n = 5 } = o;
  const tongue = (g, cx, hh, ww, sway, curl) => {
    const tip = [cx + sway * hh, y - hh];
    g.beginPath(); g.moveTo(cx - ww, y);
    g.bezierCurveTo(cx - ww * 1.1, y - hh * .35, tip[0] - ww * .6 - curl * ww, tip[1] + hh * .45, tip[0], tip[1]);
    g.bezierCurveTo(tip[0] + ww * .3 + curl * ww, tip[1] + hh * .5, cx + ww * 1.1, y - hh * .3, cx + ww, y); g.closePath();
  };
  // outer licks: several tongues of different height, each with its own flicker
  const L = [];
  for (let i = 0; i < n; i++) {
    const ph = seed * 1.7 + i * 2.3, u = n > 1 ? i / (n - 1) - .5 : 0;
    const hh = h * (.55 + .45 * Math.cos(u * 2.4)) * (.8 + .35 * noise1(t * 6.5 + ph, seed + i));
    L.push([x + u * w * 1.1, hh, w * (.55 - Math.abs(u) * .3), snoise(t * 3.1 + ph, seed + 40 + i) * .22 + lean + u * .25, snoise(t * 2.2 + ph, seed + 70 + i) * .6]);
  }
  if (srcK > 0) {
    s.save(); s.globalAlpha = srcK * heat;
    for (const [cx, hh, ww, sw, cu] of L) { tongue(s, cx, hh, ww, sw, cu); s.fillStyle = '#a3300e'; s.fill(); }
    for (const [cx, hh, ww, sw, cu] of L) { tongue(s, cx, hh * .7, ww * .7, sw * .8, cu); s.fillStyle = '#e8721c'; s.fill(); }
    tongue(s, x, h * .42, w * .5, lean, 0); s.fillStyle = '#ffc860'; s.fill();
    s.restore();
  }
  if (lightK > 0) {
    f.save(); f.globalCompositeOperation = 'lighter'; f.filter = `blur(${Math.max(1, Math.min(6, h * .03))}px)`;
    f.globalAlpha = clamp(lightK * heat * .35); for (const [cx, hh, ww, sw, cu] of L) { tongue(f, cx, hh, ww, sw, cu); f.fillStyle = '#ff5a14'; f.fill(); }
    f.globalAlpha = clamp(lightK * heat * .55); for (const [cx, hh, ww, sw, cu] of L) { tongue(f, cx, hh * .62, ww * .6, sw * .8, cu); f.fillStyle = '#ffa040'; f.fill(); }
    f.globalAlpha = clamp(lightK * heat * .8); tongue(f, x, h * .38, w * .42, lean, 0); f.fillStyle = '#fff0c0'; f.fill();
    f.restore();
  }
  glow(x, y - h * .35, h * 1.4, 'rgba(255,110,36,.5)', .38 * heat * lightK);
}

// Faux-rotoscope kit. Waking Life was painted over video, one layer at a time, by many artists:
// the colour fill, the shadow shapes and the ink line of any one thing were separate layers, and
// each floats a little on its own. Here every shape is drawn three times from the same contour,
// each copy with its own slow wobble and its own drift, so fills slide under their outlines and
// nothing ever holds still. All motion is smooth noise in song time T (never Math.random).
let T = 0;                 // song time of the frame being drawn
let HUE = 0;               // slow hue drift applied to every colour
let HAND = null;           // the current animator's hand
let REGK = 1;              // global multiplier on off-register drift (the acid peel pushes it)
let INKK = 1, WOBK = 1;    // close-ups shrink ink width and wobble so a big face is drawn with a fine pen, not a fat one
const SKINK = .2;          // skin takes only a fifth of the hue drift (no green faces)
const HANDS = {
  // clean line: thin, even ink, fills a hair off register
  clean: { wob: 2.4, reg: 5, ink: 1, inkW: 3.4, inkVar: .45, passes: 1, paint: 0, hatch: 0, inkCol: '#201b22' },
  // painterly flat shapes: no outline at all, soft doubled edges, bigger shadow shapes
  paint: { wob: 4.5, reg: 8, ink: 0, inkW: 2.4, inkVar: .5, passes: 1, paint: 1, hatch: 0, inkCol: '#2b2330' },
  // scratchy: thin line drawn three times, hatching in the shadows
  scratch: { wob: 3.2, reg: 6, ink: 1, inkW: 2.0, inkVar: .7, passes: 3, paint: 0, hatch: 1, inkCol: '#1a1519' },
  // ballpoint: thin blue biro, drawn twice, pale fills sliding well off register
  wire: { wob: 2.0, reg: 8, ink: 1, inkW: 1.5, inkVar: .3, passes: 2, paint: 0, hatch: 0, inkCol: '#26346a' },
  // bold brush: fat black brush line that swells and thins, strong two-tone shadows
  bold: { wob: 2.6, reg: 4, ink: 1, inkW: 5.4, inkVar: .7, passes: 1, paint: 0, hatch: 0, inkCol: '#140f12' },
  // pastel: no line, soft doubled edges, warm light
  pastel: { wob: 5.5, reg: 10, ink: 0, inkW: 2.6, inkVar: .5, passes: 1, paint: 1, hatch: 0, inkCol: '#3a2a30' },
  // brown brush with hatching (an etching feel)
  brush: { wob: 2.4, reg: 5, ink: 1, inkW: 3.6, inkVar: .85, passes: 1, paint: 0, hatch: 1, inkCol: '#2c1a12' },
  // fine pen for close-ups: thin, steady, fills close to the line
  fine: { wob: 1.6, reg: 3.5, ink: 1, inkW: 2.4, inkVar: .45, passes: 1, paint: 0, hatch: 0, inkCol: '#1d1820' },
};
const hsl = (h, sat, l, a = 1, hk = 1) => `hsla(${(h + HUE * hk).toFixed(1)},${sat}%,${clamp(l, 0, 100).toFixed(1)}%,${a})`;
// shift the lightness of an hsla() colour string (for the automatic second shadow tone and the highlight)
function relight(c, dl, da) {
  const m = /hsla\(([-\d.]+),([\d.]+)%,([\d.]+)%,([\d.]+)\)/.exec(c); if (!m) return c;
  return `hsla(${m[1]},${m[2]}%,${clamp(+m[3] + dl, 0, 100).toFixed(1)}%,${da === undefined ? m[4] : (+m[4] * da).toFixed(3)})`;
}
function drift(seed, amp, fr = .19) { amp *= REGK; return [snoise(T * fr, seed) * amp, snoise(T * fr * 1.13, seed + 911) * amp]; }
const add = (P, d) => P.map(([x, y]) => [x + d[0], y + d[1]]);
function path(P) { s.beginPath(); P.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); }

// Catmull-Rom through control points.
function spline(P, closed = true, seg = 6) {
  const n = P.length, out = [];
  if (n < 3) return P.slice();
  const g = (i) => closed ? P[(i + n) % n] : P[clamp(i, 0, n - 1)];
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    for (let k = 0; k < seg; k++) {
      const u = k / seg, u2 = u * u, u3 = u2 * u;
      out.push([0, 1].map((j) => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3)));
    }
  }
  if (!closed) out.push(P[n - 1]);
  return out;
}
// Straight-edged polygon, subdivided so the wobble can still ripple along its edges (walls, windows, tables).
function sharpen(P, step = 40) {
  const out = [];
  for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)); for (let k = 0; k < n; k++) out.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]); }
  return out;
}
// Slow wobble along the contour: periodic in arclength (so closed shapes close), drifting in time.
function wob(P, seed, amp) {
  if (!amp) return P;
  const n = P.length, r = rng(seed * 31 + 7);
  const k1 = 2 + (r() * 3 | 0), k2 = 5 + (r() * 4 | 0);
  const p1 = T * (.3 + r() * .3) + snoise(T * .17, seed) * 2, p2 = -T * (.22 + r() * .22) + r() * 6;
  return P.map(([x, y], i) => {
    const u = i / n;
    const a = Math.sin(u * TAU * k1 + p1) * .6 + Math.sin(u * TAU * k2 + p2) * .4;
    const b = Math.cos(u * TAU * k1 + p1 * 1.3 + 1) * .6 + Math.sin(u * TAU * k2 - p2 + 2) * .4;
    return [x + a * amp, y + b * amp];
  });
}
// Variable-width ink, built as ONE filled ribbon (quads plus round joints in a single path), so a
// line drawn at partial opacity stays an even line instead of a string of beads.
function addPoly(Q) { let a = 0; for (let i = 0; i < Q.length; i++) { const p = Q[i], q = Q[(i + 1) % Q.length]; a += p[0] * q[1] - q[0] * p[1]; }
  const R = a < 0 ? Q.slice().reverse() : Q; s.moveTo(R[0][0], R[0][1]); for (let i = 1; i < R.length; i++) s.lineTo(R[i][0], R[i][1]); s.closePath(); }
function ink(P, closed, w, seed, col) {
  const n = P.length; w *= INKK; if (n < 2 || w <= 0) return;
  const ph = seed * 1.7 + T * .35, den = closed ? n : n - 1, Wd = [], L = [], R = [];
  for (let i = 0; i < n; i++) {
    const u = i / den;
    let ww = w * (1 - HAND.inkVar * (.5 + .5 * Math.sin(u * TAU * 3 + ph)));
    if (!closed) ww *= Math.min(1, u * 5 + .2, (1 - u) * 5 + .2);
    ww = Math.max(.35, ww) / 2; Wd.push(ww);
    const a = P[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = P[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    L.push([P[i][0] - dy * ww, P[i][1] + dx * ww]); R.push([P[i][0] + dy * ww, P[i][1] - dx * ww]);
  }
  s.fillStyle = col || HAND.inkCol; s.beginPath();
  const m = closed ? n : n - 1;
  for (let i = 0; i < m; i++) { const j = (i + 1) % n; addPoly([L[i], L[j], R[j], R[i]]); }
  for (let i = 0; i < n; i++) { const r = Wd[i], c = P[i], Q = []; for (let k = 0; k < 8; k++) Q.push([c[0] + Math.cos(k * TAU / 8) * r, c[1] + Math.sin(k * TAU / 8) * r]); addPoly(Q); }
  s.fill('nonzero');
}
// Hatching for the scratchy hand, laid across the shadow side of a shape (call inside its clip).
function hatch(F, dir, seed, col) {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [x, y] of F) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, L = Math.hypot(dir[0], dir[1]) || 1, dx = -dir[0] / L, dy = -dir[1] / L;
  const span = Math.max(x1 - x0, y1 - y0), gap = Math.max(5, span / 26), r = rng(seed);
  s.strokeStyle = col || HAND.inkCol; s.lineWidth = 1.3 * INKK; s.lineCap = 'round';
  for (let k = -span; k < span; k += gap) {
    const ox = cx + dx * span * .38, oy = cy + dy * span * .38; // centred on the shadow side
    const j = snoise(T * .4 + k * .1, seed) * 3;
    s.beginPath(); s.moveTo(ox + k - span * .3 + j, oy - span * .3); s.lineTo(ox + k + span * .3 + r() * 4, oy + span * .3); s.stroke();
  }
}

// One rotoscoped shape: fill layer, shadow layer, ink layer, each drifting on its own.
// o: { fill, shade, shadeShift:[dx,dy] (toward the light), seed, ink:false, inkW, reg, wob, extra(F), alpha }
function part(ctrl, o = {}) {
  const H = HAND, seed = o.seed || 1, reg = H.reg * (o.reg ?? 1) * WOBK, wa = H.wob * (o.wob ?? 1) * WOBK;
  const D = o.dense ? ctrl : o.sharp ? sharpen(ctrl, o.sharp) : spline(ctrl, true, o.seg || 6);
  const F = add(wob(D, seed, wa), drift(seed + 1, reg));
  if (o.alpha !== undefined) { s.save(); s.globalAlpha *= o.alpha; }
  if (o.fill) {
    if (H.paint) { s.save(); s.globalAlpha *= .45; path(add(wob(D, seed + 9, wa * 2.2), drift(seed + 4, reg * 1.7))); s.fillStyle = o.fill; s.fill(); s.restore(); }
    path(F); s.fillStyle = o.fill; s.fill();
    if (o.shade || o.extra) {
      s.save(); path(F); s.clip();
      if (o.shade) {
        const so = drift(seed + 3, reg * .9), sh = o.shadeShift || [12, -8];
        // a second, deeper tone along the far edge gives the shape some volume (objects only, not walls)
        const small = Math.hypot(sh[0], sh[1]) < 45, sh2 = o.shade2 ?? (small && o.tone2 !== false ? relight(o.shade, -8) : null);
        s.fillStyle = sh2 || o.shade; s.fillRect(-4000, -4000, 8000, 8000);
        if (sh2) { path(add(F, [sh[0] * .38 + so[0] * .5, sh[1] * .38 + so[1] * .5])); s.fillStyle = o.shade; s.fill(); }
        path(add(F, [sh[0] + so[0], sh[1] + so[1]])); s.fillStyle = o.fill; s.fill();
        const hi = o.hi ?? (small && o.tone2 !== false ? relight(o.fill, 7, .7) : null);
        if (hi) { s.beginPath(); s.rect(-4000, -4000, 8000, 8000); const Hh = add(F, [-sh[0] * .55, -sh[1] * .55]); Hh.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.fillStyle = hi; s.fill('evenodd'); }
        if (H.hatch && o.hatch !== false) hatch(F, sh, seed + 13, o.hatchCol);
      }
      if (o.extra) o.extra(F);
      s.restore();
    }
  }
  if (o.ink !== false && H.ink > 0) {
    const I = add(wob(D, seed + 5, wa), drift(seed + 2, reg * .5));
    for (let p = 0; p < H.passes; p++) ink(p ? add(wob(I, seed + 20 + p, wa * 1.4), drift(seed + 30 + p, 2.5)) : I, true, (o.inkW ?? 1) * H.inkW * (p ? .55 : 1), seed + p, o.inkCol);
  }
  if (o.alpha !== undefined) s.restore();
  return F;
}
// An open contour line (interior detail: folds, cheek lines, features). force draws it even in the
// painterly hand (which has no outlines), as a soft painted stroke.
function stroke(P, seed, w = 1, o = {}) {
  const H = HAND; if (!H.ink && !o.force) return;
  const D = o.dense ? P : spline(P, false, o.seg || 5);
  const I = add(wob(D, seed + 5, H.wob * (o.wob ?? .7) * WOBK), drift(seed + 2, H.reg * .5 * (o.reg ?? 1) * WOBK));
  const passes = H.ink ? H.passes : 1, ww = w * (H.ink ? H.inkW : H.inkW * 1.5);
  if (o.alpha !== undefined) { s.save(); s.globalAlpha *= o.alpha; }
  for (let p = 0; p < passes; p++) ink(p ? add(wob(I, seed + 20 + p, H.wob), drift(seed + 30 + p, 2)) : I, false, ww * (p ? .6 : 1), seed + p, o.col);
  if (o.alpha !== undefined) s.restore();
}
// A lumpy closed blob (clouds, bushes, the plane-shaped cloud).
function lump(cx, cy, rx, ry, seed, n = 14) {
  const r = rng(seed), out = [];
  for (let i = 0; i < n; i++) { const a = i / n * TAU, k = 1 + (r() - .5) * .35 + Math.sin(a * 5 + seed) * .08 + snoise(T * .25 + i * .7, seed) * .06; out.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
  return out;
}
// A tiny airliner silhouette, nose to +x, about 100 units long.
const PLANE = [[50, 0], [44, -5], [10, -6], [-6, -40], [-16, -40], [-6, -6], [-34, -6], [-44, -22], [-50, -22], [-46, -4], [-50, 2], [-36, 6], [-6, 6], [-16, 40], [-6, 40], [10, 6], [44, 5]];
function plane(x, y, sc, ang, o = {}) {
  withT(() => { s.translate(x, y); s.rotate(ang); s.scale(sc, sc * (o.flip ? -1 : 1)); part(PLANE, { fill: o.fill || hsl(220, 10, 92), shade: o.shade || hsl(225, 12, 70), shadeShift: [0, -6], seed: o.seed || 77, inkW: o.inkW ?? 1 / sc * 1.2, seg: 2, wob: o.wob ?? .3 / sc, reg: o.reg ?? .3 / sc, alpha: o.alpha }); });
}
// Camera: centre (cx,cy) of the 1920x1080 world shown at zoom z, rolled by rot.
function cam(cx, cy, z = 1, rot = 0) { s.translate(W / 2, H / 2); s.rotate(rot); s.scale(z, z); s.translate(-cx, -cy); }

// Draw fn into an offscreen layer, then put the whole layer down at one opacity (optionally tinted).
// Overlapping parts inside a translucent figure then stay clean instead of muddying each other.
const LAYERS = [];
function layer(alpha, fn, tint, depth = 0) {
  if (!LAYERS[depth]) { const c = document.createElement('canvas'); LAYERS[depth] = c; }
  const c = LAYERS[depth]; if (c.width !== s.canvas.width || c.height !== s.canvas.height) { c.width = s.canvas.width; c.height = s.canvas.height; }
  const L = c.getContext('2d'), keep = s, M = s.getTransform();
  L.setTransform(1, 0, 0, 1, 0, 0); L.globalAlpha = 1; L.globalCompositeOperation = 'source-over'; L.clearRect(0, 0, c.width, c.height);
  L.setTransform(M); s = L;
  try { fn(); } finally { s = keep; }
  if (tint) { L.save(); L.setTransform(1, 0, 0, 1, 0, 0); L.globalAlpha = 1; L.globalCompositeOperation = 'source-atop'; L.fillStyle = tint; L.fillRect(0, 0, c.width, c.height); L.restore(); }
  s.save(); s.setTransform(1, 0, 0, 1, 0, 0); s.globalAlpha *= alpha; s.drawImage(c, 0, 0); s.restore();
}
// Smooth ellipse control points (glasses, cups, windows).
const ellipse = (cx, cy, rx, ry, n = 12, rot = 0) => [...Array(n)].map((_, i) => { const a = i / n * TAU; const x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]; });

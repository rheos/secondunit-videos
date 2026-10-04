// Style kit, pass 2: pushed toward Edelmann's 1968 print look. 60s print inks (deep magenta, burnt
// orange, olive, prussian blue, violet, mustard, black, cream), Art Nouveau swelling line (a thin line all
// round plus a heavy offset line on the shadow side), whiplash curls drawn as tapered filled shapes,
// concentric contour-band fills and colour split down the middle, balloon letters built from swelling
// strokes (no font), halftone newspaper clippings for the ministry, flat shape morphs.
// A strange cast: profiles with long noses, heavy lids, ring eyes, flat whiplash moustaches; every
// delegate a different silhouette on thin legs and tiny pointed feet. Pure functions of their arguments.

const K = {
  MAG: '#b8165a', HPK: '#e2508a', BOR: '#c94a17', ORA: '#e67a26', MUS: '#dca42c', OLV: '#7a8a1c',
  LIME: '#a6c23a', PRU: '#173d6b', NAVY: '#0d1633', NAVY2: '#16245a', VIO: '#5a2a8a', LAV: '#9466c0',
  TEAL: '#11786f', TUR: '#2aa89a', RED: '#c4271d', BLK: '#120f12', CRM: '#f1e1b8', WHT: '#f8efd6',
  G1: '#a5a196', G2: '#77746c', G3: '#4c4a45', G4: '#2a2926',
};
let OL = 6;
const PI = Math.PI;

// ---- paths ----
function circlesPath(pts) { s.beginPath(); for (const [x, y, r] of pts) { s.moveTo(x + r, y); s.arc(x, y, r, 0, TAU); } }
function rectP(x, y, w, h, r = 0) { s.beginPath(); if (s.roundRect && r) s.roundRect(x, y, w, h, r); else s.rect(x, y, w, h); }
function ellP(x, y, rx, ry, a = 0) { s.beginPath(); s.ellipse(x, y, Math.abs(rx), Math.abs(ry), a, 0, TAU); }
function polyP(pts) { s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); }
// the swelling line: heavy offset shadow-line low right, a thin line all round, then the flat colour
function nv(P, col, w = OL, off = [.75, .7]) {
  withT(() => { s.translate(w * off[0], w * off[1]); P(); s.fillStyle = K.BLK; s.fill(); });
  P(); s.lineJoin = 'round'; s.lineWidth = w * .95; s.strokeStyle = K.BLK; s.stroke(); s.fillStyle = col; s.fill();
}
function flatP(P, col) { P(); s.fillStyle = col; s.fill(); }
const bounce2 = (t, seed, amp) => -Math.abs(Math.sin((onTwos(t) * 1.37 + hash(seed) * 5) * PI)) * amp;

// ---- whiplash: a tapered curl drawn as a filled shape (thick to thin) ----
function whipPts(x, y, len, a0, curl, dir, N = 44, p = 2.2) {
  const pts = []; let px = x, py = y;
  for (let i = 0; i <= N; i++) { const u = i / N, h = a0 + dir * curl * TAU * Math.pow(u, p); pts.push([px, py, h, u]); px += Math.cos(h) * len / N; py += Math.sin(h) * len / N; }
  return pts;
}
function whip(x, y, len, a0, curl, dir, w, col = K.BLK, edge = 0, taper = (u) => Math.pow(1 - u, .75) * .9 + .1) {
  const P = whipPts(x, y, len, a0, curl, dir);
  const shape = (e) => { const L = [], R = []; for (const [px, py, h, u] of P) { const ww = w * taper(u) / 2 + e; L.push([px - Math.sin(h) * ww, py + Math.cos(h) * ww]); R.push([px + Math.sin(h) * ww, py - Math.cos(h) * ww]); }
    s.beginPath(); L.forEach(([a, b], i) => i ? s.lineTo(a, b) : s.moveTo(a, b)); R.reverse().forEach(([a, b]) => s.lineTo(a, b)); s.closePath(); };
  if (edge) { shape(edge); s.fillStyle = K.BLK; s.fill(); s.beginPath(); s.arc(P[P.length - 1][0], P[P.length - 1][1], w * .06 + edge, 0, TAU); s.fill(); }
  shape(0); s.fillStyle = col; s.fill();
  return P[P.length - 1];
}

// ---- grounds ----
function flat(col) { s.fillStyle = col; s.fillRect(-300, -300, W + 600, H + 600); }
function rays(cx, cy, n, rot, cols, R = 3000) {
  for (let i = 0; i < n; i++) { const a0 = rot + i / n * TAU, a1 = rot + (i + 1) / n * TAU;
    s.beginPath(); s.moveTo(cx, cy); s.arc(cx, cy, R, a0, a1); s.closePath(); s.fillStyle = cols[i % cols.length]; s.fill(); }
}
function rings(cx, cy, step, phase, cols, R = 2600) {
  const n = Math.ceil(R / step) + 2, f = phase - Math.floor(phase);
  for (let i = n; i >= 0; i--) { const r = (i + f) * step; if (r <= 0) continue; const ci = ((i - Math.floor(phase)) % cols.length + cols.length * 1000) % cols.length;
    s.beginPath(); s.arc(cx, cy, r, 0, TAU); s.fillStyle = cols[ci]; s.fill(); }
}
function checkerTunnel(cx, cy, n, phase, rot, c1, c2, R = 2400) {
  for (let i = 0; i < 26; i++) { const r = R * Math.pow(.84, i - (phase % 1)), rr = R * Math.pow(.84, i + 1 - (phase % 1));
    for (let j = 0; j < n; j++) { const a0 = rot + j / n * TAU, a1 = rot + (j + 1) / n * TAU;
      s.beginPath(); s.arc(cx, cy, r, a0, a1); s.arc(cx, cy, rr, a1, a0, true); s.closePath(); s.fillStyle = ((i + j + Math.floor(phase)) % 2) ? c1 : c2; s.fill(); } }
}
function starburst(x, y, r0, r1, n, rot, cols) {
  cols.forEach((c, k) => { const sc = 1 - k * .24; s.beginPath();
    for (let i = 0; i < n * 2; i++) { const a = rot + i / (n * 2) * TAU + k * .1, rr = i % 2 ? r0 * sc : r1 * sc * (i % 4 === 0 ? 1 : .72); s.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    s.closePath(); s.fillStyle = c; s.fill(); });
}
// the night sky: deep blue, a few cream sparkles that blink on twos
function night(t, top = K.NAVY, seed = 3) {
  flat(top);
  for (let i = 0; i < 40; i++) { const x = hash(i * 13 + seed) * W, y = hash(i * 29 + seed) * H * .7, r = 4 + hash(i * 7) * 9;
    if (hash(i * 31 + Math.floor(t * 6)) < .15) continue;
    s.fillStyle = i % 5 ? K.CRM : K.MUS; s.beginPath(); s.moveTo(x, y - r * 2); s.quadraticCurveTo(x, y, x + r * 2, y); s.quadraticCurveTo(x, y, x, y + r * 2); s.quadraticCurveTo(x, y, x - r * 2, y); s.quadraticCurveTo(x, y, x, y - r * 2); s.fill(); }
}
// rolling banded cloud hills: layers of humps, each hump filled with concentric contour bands, no line
function hills(t, layers) {
  layers.forEach((L, li) => {
    const gap = L.gap, off = (t * (L.speed || 0)) % gap;
    for (let x = -gap * 2 - off, i = 0; x < W + gap * 2; x += gap, i++) {
      const id = Math.floor((x + t * (L.speed || 0)) / gap + .5) + li * 100, R = L.r * (.8 + .45 * hash(id * 17 + 5));
      for (let k = 0, rr = R; rr > 4; k++, rr -= L.band) { s.beginPath(); s.arc(x + hash(id) * gap * .3, L.y, rr, 0, TAU); s.fillStyle = L.cols[k % L.cols.length]; s.fill(); }
    }
    s.fillStyle = L.base || L.cols[0]; s.fillRect(-300, L.y, W + 600, H + 600 - L.y);
    if (L.band2) for (let y = L.y + L.band2, k = 1; y < H + 300; y += L.band2, k++) { s.fillStyle = L.cols[k % L.cols.length]; s.fillRect(-300, y, W + 600, L.band2 * .45); }
  });
}
// a halftone newspaper clipping pasted on: torn edge, cream paper, black dots following f(u,v)
function halftone(x, y, w, h, cell, f, col, ang = .26) {
  s.fillStyle = col; s.beginPath(); const ca = Math.cos(ang), sa = Math.sin(ang);
  const cx = x + w / 2, cy = y + h / 2, R = Math.hypot(w, h) / 2 + cell;
  for (let i = -R; i <= R; i += cell) for (let j = -R; j <= R; j += cell) {
    const px = cx + i * ca - j * sa, py = cy + i * sa + j * ca; if (px < x - cell || px > x + w + cell || py < y - cell || py > y + h + cell) continue;
    const v = clamp(f((px - x) / w, (py - y) / h)); if (v < .05) continue; const r = cell * .64 * Math.sqrt(v);
    s.moveTo(px + r, py); s.arc(px, py, r, 0, TAU); }
  s.fill();
}
function tornRect(x, y, w, h, seed, j = 9) {
  const r = rng(seed), pts = [], st = 26;
  for (let u = 0; u < w; u += st) pts.push([x + u, y + (r() - .5) * j]);
  for (let v = 0; v < h; v += st) pts.push([x + w + (r() - .5) * j, y + v]);
  for (let u = w; u > 0; u -= st) pts.push([x + u, y + h + (r() - .5) * j]);
  for (let v = h; v > 0; v -= st) pts.push([x + (r() - .5) * j, y + v]);
  return pts;
}
function clipping(x, y, w, h, f, seed, o = {}) {
  const pts = tornRect(x, y, w, h, seed);
  withT(() => { s.translate(12, 14); polyP(pts); s.fillStyle = 'rgba(10,8,20,.45)'; s.fill(); });
  polyP(pts); s.fillStyle = o.paper || K.CRM; s.fill();
  withT(() => { polyP(pts); s.clip(); halftone(x, y, w, h, o.cell || 11, f, o.ink || K.BLK, o.ang ?? .26); });
}
// procedural "photos" for the clippings
// the ministry clipping cut along its own stepped roofline
function clippingMinistry(x, y, w, h, seed, o = {}) {
  const r = rng(seed), top = [];
  for (let k = 0; k < 7; k++) { const ry = y + (.18 + .2 * hash(k * 7 + 3)) * h - 6; top.push([x + k * w / 7 + (r() - .5) * 6, ry + (r() - .5) * 8], [x + (k + 1) * w / 7 + (r() - .5) * 6, ry + (r() - .5) * 8]); }
  const pts = [...top, [x + w + (r() - .5) * 8, y + h], [x + (r() - .5) * 8, y + h]];
  withT(() => { s.translate(12, 14); polyP(pts); s.fillStyle = 'rgba(10,8,20,.45)'; s.fill(); });
  polyP(pts); s.fillStyle = o.paper || K.CRM; s.fill();
  withT(() => { polyP(pts); s.clip(); halftone(x, y, w, h, o.cell || 12, photoMinistry, K.BLK); });
}
const photoMinistry = (u, v) => {
  const col = Math.floor(u * 7), roof = .18 + .2 * hash(col * 7 + 3);
  if (v < roof) return .06 + .05 * v;
  const wu = (u * 7 * 4) % 1, wv = ((v - roof) * 14) % 1;
  let d = .42 + .25 * (u * 7 % 1) * .6 + .15 * v;
  if (wu > .25 && wu < .7 && wv > .25 && wv < .8) d = .92;
  if (v - roof < .03) d = .85;
  return d;
};
const photoCabinets = (u, v) => {
  const cu = (u * 5) % 1, cv = (v * 4) % 1;
  if (cu < .06 || cv < .07) return .92;
  let d = .3 + .25 * cv + .1 * cu;
  if (cu > .35 && cu < .65 && cv > .2 && cv < .4) d = .08;
  if (cu > .4 && cu < .6 && cv > .62 && cv < .72) d = .95;
  return d;
};

// ---- radial shapes for flat morphs (r as a function of angle, unit size ~1) ----
const RS_ = {
  cloud: (a) => .84 + .2 * Math.pow(Math.abs(Math.sin(a * 3.5)), .5),
  circle: () => 1,
  hand: (a) => {
    let r = .78 * (1 + .1 * Math.cos(2 * a));
    const fing = [[-PI / 2 - .5, 1.55], [-PI / 2 - .17, 1.95], [-PI / 2 + .17, 1.9], [-PI / 2 + .5, 1.6], [-PI / 2 - 1.25, 1.3]];
    for (const [c, L] of fing) { const d = Math.atan2(Math.sin(a - c), Math.cos(a - c)), hw = .13 * (1.3 / L) + .04; if (Math.abs(d) < hw) r = Math.max(r, L * Math.sqrt(1 - (d / hw) ** 2) ** .35); }
    const dw = Math.atan2(Math.sin(a - PI / 2), Math.cos(a - PI / 2)); if (Math.abs(dw) < .38) r = Math.max(r, 1.15);
    return r;
  },
  bird: (a, f = 1) => {
    let r = 1 / Math.sqrt((Math.cos(a) / 1.15) ** 2 + (Math.sin(a) / .5) ** 2);
    const bump = (c, hw, L) => { const d = Math.atan2(Math.sin(a - c), Math.cos(a - c)); if (Math.abs(d) < hw) r = Math.max(r, L * (1 - Math.abs(d) / hw) + r * Math.abs(d) / hw); };
    bump(-.08, .12, 1.8); bump(-PI / 2 - .55, .4, .6 + 1.5 * f); bump(-PI / 2 + .55, .4, .6 + 1.5 * f); bump(PI - .1, .22, 1.7);
    return r;
  },
  rect: (hw, hh) => (a) => Math.min(hw / Math.max(1e-4, Math.abs(Math.cos(a))), hh / Math.max(1e-4, Math.abs(Math.sin(a)))),
};
function morphPath(x, y, size, ra, rb, k, rot = 0, N = 260) {
  s.beginPath();
  for (let i = 0; i < N; i++) { const a = i / N * TAU, r = lerp(ra(a), rb(a), k) * size; const px = x + Math.cos(a + rot) * r, py = y + Math.sin(a + rot) * r; i ? s.lineTo(px, py) : s.moveTo(px, py); }
  s.closePath();
}
function morph(x, y, size, ra, rb, k, col, rot = 0, w = OL) { nv(() => morphPath(x, y, size, ra, rb, k, rot), col, w); }
// a glove that grows out of a cloud puff: k=0 a puff, k=1 an open hand
function puffHand(x, y, size, k, col = K.WHT, rot = 0) {
  morph(x, y, size, RS_.cloud, RS_.hand, k, col, rot);
  if (k > .6) { s.lineWidth = OL * .5; s.strokeStyle = K.BLK; s.beginPath(); s.arc(x, y + size * .15, size * .4, .2 * PI + rot, .8 * PI + rot); s.stroke(); }
}

// ---- balloon letters: swelling strokes, black outline, coloured body, cream inline; letters overlap ----
const AR = (cx, cy, rx, ry, a0, a1, n = 18) => { const p = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; p.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); } return p; };
const GLYPH = {
  A: { w: .8, s: [[[0, 1], [.4, 0], [.8, 1]], [[.18, .64], [.62, .64]]] },
  B: { w: .66, s: [[[0, 1], [0, 0], [.36, 0], ...AR(.36, .24, .26, .24, -PI / 2, PI / 2).slice(1), [0, .48]], [[0, .48], [.38, .48], ...AR(.38, .74, .28, .26, -PI / 2, PI / 2).slice(1), [0, 1]]] },
  C: { w: .78, s: [AR(.45, .5, .45, .5, .27 * PI, 1.73 * PI, 24)] },
  D: { w: .74, s: [[[0, 0], [0, 1], [.28, 1], ...AR(.28, .5, .46, .5, PI / 2, -PI / 2).slice(1), [0, 0]]] },
  E: { w: .6, s: [[[.6, 0], [0, 0], [0, 1], [.6, 1]], [[0, .5], [.48, .5]]] },
  F: { w: .58, s: [[[.58, 0], [0, 0], [0, 1]], [[0, .5], [.46, .5]]] },
  G: { w: .84, s: [[...AR(.44, .5, .44, .5, -.28 * PI, -1.85 * PI, 24), [.84, .52], [.5, .52]]] },
  H: { w: .7, s: [[[0, 0], [0, 1]], [[.7, 0], [.7, 1]], [[0, .5], [.7, .5]]] },
  I: { w: 0, s: [[[0, 0], [0, 1]]] },
  K: { w: .66, s: [[[0, 0], [0, 1]], [[.64, 0], [0, .62]], [[.2, .45], [.66, 1]]] },
  L: { w: .56, s: [[[0, 0], [0, 1], [.56, 1]]] },
  M: { w: .92, s: [[[0, 1], [.04, 0], [.46, .62], [.88, 0], [.92, 1]]] },
  N: { w: .72, s: [[[0, 1], [0, 0], [.72, 1], [.72, 0]]] },
  O: { w: .86, s: [AR(.43, .5, .43, .5, -PI / 2, 1.5 * PI, 30)] },
  P: { w: .62, s: [[[0, 1], [0, 0], [.34, 0], ...AR(.34, .27, .28, .27, -PI / 2, PI / 2).slice(1), [0, .54]]] },
  R: { w: .66, s: [[[0, 1], [0, 0], [.34, 0], ...AR(.34, .27, .28, .27, -PI / 2, PI / 2).slice(1), [0, .54]], [[.28, .54], [.66, 1]]] },
  S: { w: .68, s: [[...AR(.34, .26, .32, .26, -.15 * PI, -1.5 * PI, 16), ...AR(.34, .76, .34, .24, -.5 * PI, .85 * PI, 16).slice(1)]] },
  T: { w: .7, s: [[[0, 0], [.7, 0]], [[.35, 0], [.35, 1]]] },
  U: { w: .7, s: [[[0, 0], [0, .62], ...AR(.35, .62, .35, .38, PI, 0).slice(1), [.7, 0]]] },
  V: { w: .74, s: [[[0, 0], [.37, 1], [.74, 0]]] },
  W: { w: 1.0, s: [[[0, 0], [.22, 1], [.5, .38], [.78, 1], [1, 0]]] },
  Y: { w: .7, s: [[[0, 0], [.35, .52], [.7, 0]], [[.35, .52], [.35, 1]]] },
  ' ': { w: .2, s: [] },
};
const TK = .2, SW = .55, OLU = .06, GAP = .5;
// fit `str` in a maxW x maxH box centred on (cx, cy); everything (outline included) stays inside
function balloon(str, cx, cy, maxW, maxH, o = {}) {
  const cols = o.cols || [K.MUS, K.HPK, K.ORA, K.TUR], inl = o.inline || K.CRM, sw = o.swell ?? .2;
  const ch = [...str].map((c) => GLYPH[c] || GLYPH[' ']), n = ch.length;
  const ys = ch.map((_, i) => 1 + sw * Math.sin(PI * (i + .5) / n)), xs = ys.map((y) => 1 + (y - 1) * .5);
  const e = TK * (1 + SW) + OLU, Wu = ch.reduce((a, g, i) => a + g.w * xs[i], 0) + GAP * (n - 1), Hy = Math.max(...ys);
  const S = Math.min(maxW / (Wu + 2 * e), maxH / (Hy + 2 * e));
  let x = cx - Wu * S / 2;
  ch.forEach((g, i) => {
    const lx = x, sx = xs[i] * S, sy = ys[i] * S, c = cols[(i + (o.cshift || 0)) % cols.length];
    const wob = o.wob ? snoise(onTwos(o.t || 0) * 2 + i * 1.3, 4) * o.wob * S : 0;
    const map = ([px, py]) => [lx + px * sx, cy + (py - .5) * sy + wob];
    const samples = [];
    for (const st of g.s) { const P = st.map(map); let L = 0; const acc = [0]; for (let k = 1; k < P.length; k++) { L += Math.hypot(P[k][0] - P[k - 1][0], P[k][1] - P[k - 1][1]); acc.push(L); }
      const step = Math.max(1.2, TK * S * .35), m = Math.max(2, Math.ceil(L / step));
      let seg = 1; for (let j = 0; j <= m; j++) { const d = j / m * L; while (seg < P.length - 1 && acc[seg] < d) seg++; const a = acc[seg - 1], b = acc[seg], u = b > a ? (d - a) / (b - a) : 0;
        samples.push([lerp(P[seg - 1][0], P[seg][0], u), lerp(P[seg - 1][1], P[seg][1], u), TK * S * (1 + SW * Math.sin(PI * j / m))]); }
      samples.push(null); }
    const disks = (add, col) => { s.beginPath(); for (const p of samples) if (p) { s.moveTo(p[0] + p[2] + add, p[1]); s.arc(p[0], p[1], p[2] + add, 0, TAU); } s.fillStyle = col; s.fill(); };
    disks(OLU * S, K.BLK); disks(0, c);
    s.lineWidth = Math.max(1, TK * S * .22); s.strokeStyle = inl; s.lineCap = 'round'; s.lineJoin = 'round';
    for (const st of g.s) { s.beginPath(); st.map(map).forEach(([a, b], k) => k ? s.lineTo(a, b) : s.moveTo(a, b)); s.stroke(); }
    x += g.w * sx + GAP * S;
  });
  const bw = (Wu + 2 * e) * S, bh = (Hy + 2 * e) * S;
  if (bw > maxW + .5 || bh > maxH + .5) console.error('balloon overflow', str);
  return { w: bw, h: bh, size: S };
}
// a sign with balloon letters fitted inside with margin
function sign(x, y, w, h, str, o = {}) {
  withT(() => { s.translate(x, y); s.rotate(o.rot || 0); if (o.sc) s.scale(o.sc, o.sc);
    nv(() => rectP(-w / 2, -h / 2, w, h, o.r ?? 16), o.bg || K.CRM, o.w || OL);
    if (o.border) { s.lineWidth = Math.max(2, OL * .5); s.strokeStyle = o.border; s.beginPath(); if (s.roundRect) s.roundRect(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 10); s.stroke(); }
    const m = o.m ?? .1, lines = Array.isArray(str) ? str : [str], lh = (h * (1 - 2 * m)) / lines.length;
    lines.forEach((ln, i) => balloon(ln, 0, -h / 2 + h * m + lh * (i + .5), w * (1 - 2 * m), lh * .94, { ...o, cshift: (o.cshift || 0) + i * 2 })); });
}

// ---- faces: profiles with long noses and heavy lids, or front faces with ring eyes ----
function almond(x, y, rx, ry, dir, lid, lidCol, look = 0) {
  const P = () => { s.beginPath(); s.moveTo(x - rx, y); s.quadraticCurveTo(x, y - ry * 2, x + rx, y); s.quadraticCurveTo(x, y + ry * 1.6, x - rx, y); s.closePath(); };
  P(); s.fillStyle = K.WHT; s.fill();
  withT(() => { P(); s.clip(); dot(x + dir * rx * .35 + look * rx * .2, y + ry * .1, ry * .75, K.BLK); s.fillStyle = lidCol; s.fillRect(x - rx * 2, y - ry * 3, rx * 4, ry * 3 * lid + ry * (lid > 0 ? .5 : 0)); });
  s.lineWidth = OL * .55; s.strokeStyle = K.BLK; P(); s.stroke();
  s.lineWidth = OL * 1.1; s.lineCap = 'round'; s.beginPath(); const ly = y - ry * 1.5 + ry * 2.2 * lid; s.moveTo(x - rx * 1.05, y); s.quadraticCurveTo(x, ly - ry * .4, x + rx * 1.05, y - ry * .1); s.stroke();
}
function profileFace(x, y, z, dir, col, o = {}) {
  const n = o.nose ?? 1;
  nv(() => { s.beginPath(); s.moveTo(x + dir * z * .02, y - z * .26); s.bezierCurveTo(x + dir * z * (.35 + .4 * n), y - z * .3, x + dir * z * (.55 + .55 * n), y - z * .02, x + dir * z * (.5 + .52 * n), y + z * .14);
    s.quadraticCurveTo(x + dir * z * (.3 + .3 * n), y + z * .2, x + dir * z * .02, y + z * .06); s.closePath(); }, col, OL * .85);
  almond(x - dir * z * .14, y - z * .2, z * .2, z * .1, dir, o.lid ?? .5, o.lidCol || K.BLK, o.look || 0);
  whip(x - dir * z * .42, y - z * .48, z * .55, dir > 0 ? -.1 : PI + .1, .1, dir, z * .07);
  if (o.mouth === 'open') nv(() => ellP(x + dir * z * .2, y + z * .32, z * .07, z * .1), K.RED, OL * .6);
  else if (o.mouth === 'grin') { s.lineWidth = OL * .8; s.strokeStyle = K.BLK; s.lineCap = 'round'; s.beginPath(); s.arc(x + dir * z * .12, y + z * .18, z * .16, .2 * PI, .75 * PI); s.stroke(); }
  else { nv(() => ellP(x + dir * z * .18, y + z * .3, z * .05, z * .045), o.mouth === 'huff' ? K.RED : K.MAG, OL * .5); }
  if (o.tache) { whip(x + dir * z * .3, y + z * .2, z * .8, dir > 0 ? .15 : PI - .15, .45, dir, z * .16, K.BLK); whip(x + dir * z * .1, y + z * .2, z * .6, dir > 0 ? PI - .5 : .5, .5, -dir, z * .13, K.BLK); }
  if (o.burns) whip(x - dir * z * .45, y - z * .1, z * .7, PI / 2 + dir * .2, .55, -dir, z * .14, K.BLK);
}
function ringEye(x, y, r, c, look = [0, 0]) {
  dot(x, y, r + OL * .5, K.BLK); dot(x, y, r, K.WHT); dot(x, y, r * .72, c); dot(x, y, r * .5, K.WHT); dot(x + look[0] * r * .2, y + look[1] * r * .2, r * .26, K.BLK);
}
function frontFace(x, y, z, col, o = {}) {
  ringEye(x - z * .24, y - z * .2, z * .17, o.ring || K.TUR, o.look); ringEye(x + z * .24, y - z * .2, z * .17, o.ring || K.TUR, o.look);
  if (o.lid) for (const sx of [-1, 1]) withT(() => { s.beginPath(); s.arc(x + sx * z * .24, y - z * .2, z * .17 + OL * .5, PI, TAU); s.closePath(); s.fillStyle = col; s.fill(); s.lineWidth = OL * .9; s.strokeStyle = K.BLK; s.beginPath(); s.moveTo(x + sx * z * .24 - z * .2, y - z * .2); s.lineTo(x + sx * z * .24 + z * .2, y - z * .2); s.stroke(); });
  nv(() => { s.beginPath(); s.moveTo(x - z * .05, y - z * .25); s.quadraticCurveTo(x + z * .12, y, x + z * .1, y + z * .18); s.quadraticCurveTo(x - z * .02, y + z * .22, x - z * .1, y + z * .12); s.closePath(); }, col, OL * .7);
  if (o.mouth === 'open' || o.mouth === 'grin') nv(() => ellP(x, y + z * .36, z * .09, z * .1), K.RED, OL * .6); else nv(() => ellP(x, y + z * .34, z * .055, z * .045), K.MAG, OL * .5);
  if (o.tache) { whip(x + z * .02, y + z * .24, z * .6, .1, .45, 1, z * .12); whip(x - z * .02, y + z * .24, z * .6, PI - .1, .45, -1, z * .12); }
  if (o.burns) { whip(x - z * .48, y - z * .3, z * .55, PI / 2 + .1, .5, 1, z * .12); whip(x + z * .48, y - z * .3, z * .55, PI / 2 - .1, .5, -1, z * .12); }
}

// ---- bodies ----
function bboxC(pts) { let a = 1e9, b = -1e9, c = 1e9, d = -1e9; for (const [x, y, r] of pts) { a = Math.min(a, x - r); b = Math.max(b, x + r); c = Math.min(c, y - r); d = Math.max(d, y + r); } return [(a + b) / 2, (c + d) / 2, b - a, d - c]; }
// fill: { kind: 'contour'|'split'|'splitc'|'hbands', c2, c3, n }
function lobes(pts, col, fill = {}) {
  const P = () => circlesPath(pts); nv(P, col);
  const [cx, cy, bw, bh] = bboxC(pts);
  withT(() => { P(); s.clip();
    if (fill.kind === 'split' || fill.kind === 'splitc') { s.fillStyle = fill.c2; s.fillRect(cx + (fill.sx || 0), cy - bh, bw * 2, bh * 2); }
    if (fill.kind === 'contour' || fill.kind === 'splitc') { const n = fill.n || 5;
      for (let k = 1; k < n; k++) { const sc = 1 - k / n * .92; withT(() => { s.translate(cx, cy + bh * .06); s.scale(sc, sc); s.translate(-cx, -cy - bh * .06); P(); s.fillStyle = k % 2 ? (fill.c3 || K.CRM) : (fill.kind === 'splitc' ? 'rgba(0,0,0,0)' : col); s.fill(); }); } }
    if (fill.kind === 'hbands') for (let y = cy - bh / 2 + (fill.off || 0); y < cy + bh / 2; y += fill.step || 40) { s.fillStyle = fill.c2; s.fillRect(cx - bw, y, bw * 2, (fill.step || 40) * .45); }
  });
}
function legs(xs, top, len, dir = 1, shoe = K.BLK, w = 5) {
  s.lineWidth = w; s.strokeStyle = K.BLK; s.lineCap = 'round';
  for (const x of xs) { s.beginPath(); s.moveTo(x, top); s.quadraticCurveTo(x - dir * len * .08, top + len * .5, x, top + len); s.stroke();
    nv(() => { s.beginPath(); s.moveTo(x - dir * len * .06, top + len - 2); s.quadraticCurveTo(x + dir * len * .1, top + len - len * .1, x + dir * len * .28, top + len + 2); s.lineTo(x - dir * len * .06, top + len + 6); s.closePath(); }, shoe, w * .7); }
}
function tophat(x, y, w, h, col, band, o = {}) {
  withT(() => { s.translate(x, y); s.rotate(o.rot || 0);
    nv(() => { s.beginPath(); s.moveTo(-w * .42, 0); s.lineTo(-w * .5, -h); s.quadraticCurveTo(0, -h - w * .12, w * .5, -h); s.lineTo(w * .42, 0); s.closePath(); }, col);
    withT(() => { s.beginPath(); s.moveTo(-w * .42, 0); s.lineTo(-w * .5, -h); s.lineTo(w * .5, -h); s.lineTo(w * .42, 0); s.closePath(); s.clip(); s.fillStyle = band;
      if (o.bands) for (let k = 0; k < o.bands; k++) s.fillRect(-w, -h * (k + .5) / o.bands - h * .05, w * 2, h * .08); else s.fillRect(-w, -h * .3, w * 2, h * .14);
      if (o.split) { s.fillStyle = o.split; s.fillRect(0, -h * 1.2, w, h * 1.2); } });
    nv(() => ellP(0, 0, w * .78, w * .13), col); });
}
function bowler(x, y, w, col, band, rot = 0) { withT(() => { s.translate(x, y); s.rotate(rot); nv(() => { s.beginPath(); s.ellipse(0, 0, w * .4, w * .42, 0, PI, TAU); s.closePath(); }, col); flatP(() => rectP(-w * .4, -w * .14, w * .8, w * .09), band); nv(() => { s.beginPath(); s.ellipse(0, 0, w * .62, w * .1, 0, 0, TAU); }, col); }); }
function fez(x, y, w, col, rot = 0) { withT(() => { s.translate(x, y); s.rotate(rot); nv(() => polyP([[-w * .3, 0], [-w * .22, -w * .5], [w * .22, -w * .5], [w * .3, 0]]), col); whip(0, -w * .5, w * .6, -.2, .3, 1, w * .07, K.BLK); }); }

// ---- the cast: each delegate a different silhouette. Local coords: feet at y=0, up is negative. ----
// o: t, look, lid, mouth, arm (0..1 the raised puff becomes a hand), seed, bounce, dir
const FIG = {
  // CUMULUS: a stack of scalloped lobes, a wedding cake with ring eyes and a whiplash moustache
  CUMULUS: { sh: [95, -200], draw(o) {
    legs([-40, 40], -60, 62, 1, K.MAG);
    lobes([[-100, -110, 58], [-40, -100, 62], [40, -100, 62], [100, -110, 58], [0, -125, 70]], K.BOR, { kind: 'contour', c3: K.MUS, n: 5 });
    lobes([[-62, -200, 52], [0, -215, 60], [62, -200, 52]], K.MAG, { kind: 'split', c2: K.HPK });
    lobes([[-28, -282, 42], [28, -282, 42], [0, -312, 40]], K.OLV, { kind: 'contour', c3: K.LIME, n: 4 });
    frontFace(0, -205, 120, K.MAG, { look: o.look2 || [0, 0], mouth: o.mouth, tache: true, ring: K.TUR, lid: o.lid > .4 });
  } },
  // CIRRUS: a tall stalk of small puffs on long legs, profile up top, a pillbox hat
  CIRRUS: { sh: [40, -330], draw(o) {
    legs([-16, 16], -150, 150, 1, K.TUR, 4.5);
    const pts = []; for (let k = 0; k < 8; k++) pts.push([Math.sin(k * 1.7) * 12, -170 - k * 38, 36 - k * .8]);
    pts.push([-30, -220, 26], [30, -300, 24]);
    lobes(pts, K.OLV, { kind: 'hbands', c2: K.LIME, step: 46, off: 10 });
    profileFace(8, -420, 92, o.dir || 1, K.OLV, { lid: o.lid ?? .55, mouth: o.mouth, look: o.look || 0, nose: 1.2 });
    withT(() => { s.translate(-6, -470); s.rotate(-.2); nv(() => rectP(-34, -38, 68, 38, 6), K.MAG); flatP(() => rectP(-34, -20, 68, 8), K.MUS); });
  } },
  // STRATUS: a long horizontal cigar of a cloud on four tiny legs, profile at the front end, bowler, monocle
  STRATUS: { sh: [120, -150], draw(o) {
    legs([-120, -50, 30, 100], -70, 70, 1, K.RED, 4.5);
    const pts = []; for (let k = 0; k < 7; k++) pts.push([-180 + k * 60, -125 - (k % 2) * 14, 52 + (k % 3) * 4]);
    lobes(pts, K.TUR, { kind: 'contour', c3: K.PRU, n: 6 });
    profileFace(195, -140, 96, 1, K.TUR, { lid: o.lid ?? .6, mouth: o.mouth, look: o.look || 0, nose: 1.1 });
    s.lineWidth = OL * .6; s.strokeStyle = K.BLK; s.beginPath(); s.arc(190 - 13, -160, 30, 0, TAU); s.stroke(); s.beginPath(); s.moveTo(160, -150); s.quadraticCurveTo(140, -110, 150, -80); s.stroke();
    bowler(150, -200, 120, K.MUS, K.MAG, -.15);
  } },
  // ALTUS: a squat little puff under a top hat twice its height; eyes peep from under the brim
  ALTUS: { sh: [60, -70], draw(o) {
    legs([-26, 26], -42, 42, 1, K.MUS, 4.5);
    lobes([[-50, -70, 44], [50, -70, 44], [0, -86, 52]], K.MUS, { kind: 'split', c2: K.ORA });
    for (const sx of [-1, 1]) almond(sx * 24, -100, 20, 10, 1, o.lid ?? .45, K.VIO, o.look || 0);
    nv(() => ellP(0, -62, 7, 6), K.MAG, OL * .5);
    tophat(0, -116, 112, 290, K.VIO, K.MUS, { bands: 4, split: K.LAV });
  } },
  // NIMBUS: a pear-shaped rain cloud with sideburns and a rain fringe, ring eyes
  NIMBUS: { sh: [90, -170], draw(o) {
    s.lineWidth = 4; s.strokeStyle = K.TUR; s.lineCap = 'round'; for (let k = -4; k <= 4; k++) { s.beginPath(); s.moveTo(k * 22, -66); s.lineTo(k * 22 + 4, -30 - (k & 1) * 10); s.stroke(); }
    legs([-30, 30], -60, 60, -1, K.TUR);
    lobes([[-90, -110, 56], [-30, -100, 60], [30, -100, 60], [90, -110, 56], [-45, -180, 54], [45, -180, 54], [0, -250, 50]], K.VIO, { kind: 'contour', c3: K.BOR, n: 6 });
    frontFace(0, -175, 110, K.VIO, { look: o.look2 || [0, 0], mouth: o.mouth, burns: true, ring: K.MUS, lid: o.lid > .4 });
    fez(0, -292, 70, K.RED, .15);
  } },
  // PUFF: a cloud head on a whiplash stem that curls into a foot; profile to the left, fez
  PUFF: { sh: [-80, -250], draw(o) {
    whip(10, -190, 230, PI / 2 + .3, .55, 1, 46, K.HPK, OL * .9);
    lobes([[-50, -250, 50], [40, -255, 54], [0, -300, 56], [-10, -215, 44]], K.HPK, { kind: 'splitc', c2: K.MUS, c3: K.MAG, n: 4 });
    profileFace(-20, -262, 86, -1, K.HPK, { lid: o.lid ?? .5, mouth: o.mouth, look: o.look || 0, nose: 1.3, burns: true });
    fez(12, -345, 64, K.TEAL, -.2);
  } },
  // the CHAIR: tall, a long robe on tiny feet, a towering hat, the biggest moustache in the sky
  CHAIR: { sh: [70, -330], draw(o) {
    legs([-24, 24], -40, 40, 1, K.BLK);
    nv(() => { s.beginPath(); s.moveTo(-70, -40); s.quadraticCurveTo(-60, -200, -50, -290); s.lineTo(50, -290); s.quadraticCurveTo(70, -200, 80, -40); s.quadraticCurveTo(5, -20, -70, -40); s.closePath(); }, K.MAG);
    withT(() => { s.beginPath(); s.moveTo(-70, -40); s.quadraticCurveTo(-60, -200, -50, -290); s.lineTo(50, -290); s.quadraticCurveTo(70, -200, 80, -40); s.closePath(); s.clip();
      s.fillStyle = K.VIO; s.fillRect(5, -300, 100, 300); for (let k = 0; k < 6; k++) { s.fillStyle = k % 2 ? K.MUS : K.HPK; s.fillRect(-80, -70 - k * 40, 200, 12); } });
    lobes([[-62, -320, 46], [62, -320, 46], [-30, -370, 54], [30, -372, 54], [0, -420, 56], [-55, -400, 36], [58, -405, 38]], K.LAV, { kind: 'split', c2: K.VIO });
    profileFace(18, -385, 120, o.dir || 1, K.LAV, { lid: o.lid ?? .6, mouth: o.mouth, look: o.look || 0, nose: 1.15, tache: true });
    tophat(-10, -455, 110, 200, K.MAG, K.MUS, { rot: -.08, bands: 3, split: K.VIO });
  } },
};
const DELS = ['CUMULUS', 'NIMBUS', 'CIRRUS', 'STRATUS', 'ALTUS', 'PUFF'];
// draw a cast member at (x, y) (feet), scale sc. arm: raise a puff that becomes a hand.
function fig(name, x, y, sc, o = {}) {
  const F = FIG[name], OL0 = OL; OL = (3.5 + 4.5 * sc) / sc;
  try { withT(() => {
    const by = o.t !== undefined && o.bounce !== 0 ? bounce2(o.t, (o.seed || name.length * 7), 18 * (o.bounce ?? 1)) : 0;
    s.translate(x, y + by * sc); s.scale(sc * (o.flip ? -1 : 1), sc); if (o.squash) s.scale(1 + o.squash, 1 - o.squash);
    F.draw(o);
    if (o.arm !== undefined) { const k = o.arm, [ax, ay] = F.sh, hx = ax + 70, hy = lerp(ay + 20, ay - 230, ease.back(k));
      s.lineWidth = OL * .9; s.strokeStyle = K.BLK; s.lineCap = 'round'; s.beginPath(); s.moveTo(ax, ay); s.quadraticCurveTo(ax + 90, lerp(ay, hy, .3), hx, hy + 30); s.stroke();
      puffHand(hx, hy, 34 + 10 * k, k, K.WHT, 0); }
  }); } finally { OL = OL0; }
}
// the ministry's stack: flat black with a mustard band, no outline
function stack(x, base, w, h) { s.fillStyle = K.BLK; s.fillRect(x - w / 2, base - h, w, h + 600); s.fillRect(x - w * .65, base - h - 18, w * 1.3, 26); s.fillStyle = K.G3; for (let y = base - h + 60; y < base; y += 80) s.fillRect(x - w / 2, y, w, 8); }
// smoke as coloured whiplash curls rising, scrolling with t
function smoke(x, y, t, cols, sc = 1, lean = 0) {
  for (let i = 4; i >= 0; i--) { const u = i + (t * .7 % 1), py = y - u * 110 * sc, px = x + Math.sin(u * 1.2 + t * .8) * 34 * sc + lean * u * 50 * sc;
    whip(px, py, (90 + u * 30) * sc, -PI / 2 + Math.sin(u + t) * .6, .7, i % 2 ? 1 : -1, (30 + u * 6) * sc, cols[(i + Math.floor(t * .7)) % cols.length], 4 * sc); }
}
function plane(x, y, sc, t, col = K.G1) {
  withT(() => { s.translate(x, y); s.scale(sc, sc); const O = OL; OL = 6 / sc * .9;
    nv(() => { s.beginPath(); s.moveTo(-160, -10); s.lineTo(-205, -75); s.lineTo(-165, -75); s.lineTo(-118, -22); s.lineTo(120, -26); s.quadraticCurveTo(178, -22, 182, 0); s.quadraticCurveTo(178, 24, 120, 26); s.lineTo(-150, 18); s.closePath(); }, col);
    nv(() => polyP([[-20, 0], [40, 0], [-30, 95], [-70, 95]]), K.G2);
    s.fillStyle = K.RED; s.fillRect(-130, -6, 240, 9);
    for (let i = 0; i < 5; i++) { s.fillStyle = K.BLK; s.beginPath(); s.arc(-60 + i * 34, -12, 8, 0, TAU); s.fill(); }
    const a = onTwos(t) * 40; s.lineWidth = 9; s.strokeStyle = K.BLK; s.beginPath(); s.moveTo(184, Math.sin(a) * 60); s.lineTo(184, -Math.sin(a) * 60); s.stroke(); OL = O; });
}
// the sun: a flat disc with a swelling whiplash ray crown and a heavy-lidded profile-less face
function sun(x, y, r, t, o = {}) {
  withT(() => { s.translate(x, y); const n = 14, rot = o.rot ?? t * .25;
    for (let i = 0; i < n; i++) { const a = rot + i / n * TAU; whip(Math.cos(a) * r * .95, Math.sin(a) * r * .95, r * (.85 + .25 * (i % 2)), a, .22, i % 2 ? 1 : -1, r * .3, i % 2 ? K.ORA : K.MUS, OL * .7); }
    nv(() => ellP(0, 0, r, r), o.col || K.MUS);
    withT(() => { ellP(0, 0, r, r); s.clip(); for (let k = 1; k < 4; k++) { s.beginPath(); s.arc(0, 0, r * (1 - k * .22), 0, TAU); s.fillStyle = k % 2 ? K.ORA : K.MUS; s.fill(); } });
    if (o.face !== false) { const lid = o.lid ?? .7;
      for (const sx of [-1, 1]) almond(sx * r * .3, -r * .12, r * .2, r * .1, sx, lid, K.BOR, 0);
      nv(() => { s.beginPath(); s.moveTo(-r * .05, -r * .12); s.quadraticCurveTo(r * .1, r * .1, r * .06, r * .2); s.quadraticCurveTo(-r * .04, r * .22, -r * .1, r * .14); s.closePath(); }, K.ORA, OL * .7);
      nv(() => ellP(0, r * .4, r * .08, r * .06), K.RED, OL * .5); } });
}
function gavel(len, hw, hh) {
  nv(() => rectP(-hw * .1, 0, hw * .2, len, hw * .08), K.BOR);
  nv(() => rectP(-hw / 2, -hh / 2, hw, hh, hh * .28), K.MAG);
  flatP(() => rectP(-hw * .4, -hh * .5, hw * .12, hh), K.MUS); flatP(() => rectP(hw * .28, -hh * .5, hw * .12, hh), K.MUS);
}

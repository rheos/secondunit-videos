// Doodles on footage: crayon-and-felt-pen characters drawn on top of an artist's real clip.
// Every mark is a Looseleaf pen stroke (window.LLPen). drawFrame(t) is pure: same t, same picture.
// Drawings are held on twos (12 a second) and reseeded per held drawing, so lines boil like hand-drawn cels.
'use strict';
const FPS = 24, TAU = Math.PI * 2;
const INK = '#2a2320', CREAM = '#f6efdc', SUN = '#ffc93c', CORAL = '#ef6a4c', SKY = '#79b8e0', LEAF = '#7fb069';
let X = null, T = null, W = 720, H = 1280, SEED = 1;

// ---------- data ----------
function lerp(a, b, k) { return a + (b - a) * k; }
function clamp(v, a = 0, b = 1) { return Math.max(a, Math.min(b, v)); }
function ease(k) { k = clamp(k); return k * k * (3 - 2 * k); }
function seg(t, a, b) { return clamp((t - a) / (b - a)); }

// Fill gaps in a per-frame [x,y] series by interpolation, then smooth it (+-r frames) so tracked doodles glide.
function series(raw, r = 3) {
  const n = raw.length, out = new Array(n).fill(null);
  const known = raw.map((p, i) => (p ? i : -1)).filter((i) => i >= 0);
  if (!known.length) return out;
  for (let i = 0; i < n; i++) {
    if (raw[i]) { out[i] = raw[i].slice(0, 2); continue; }
    const a = [...known].reverse().find((k) => k < i), b = known.find((k) => k > i);
    if (a == null) out[i] = raw[b].slice(0, 2); else if (b == null) out[i] = raw[a].slice(0, 2);
    else { const k = (i - a) / (b - a); out[i] = [lerp(raw[a][0], raw[b][0], k), lerp(raw[a][1], raw[b][1], k)]; }
  }
  return out.map((_, i) => {
    let sx = 0, sy = 0, c = 0;
    for (let j = Math.max(0, i - r); j <= Math.min(n - 1, i + r); j++) { sx += out[j][0]; sy += out[j][1]; c++; }
    return [sx / c, sy / c];
  });
}
function at(s, t) { const i = clamp(Math.round(t * FPS), 0, s.length - 1); return s[i]; }
// A frame-0 point carried by the camera to where it is at time t.
function world(x, y, t) { const i = clamp(Math.round(t * FPS), 0, T.cam.length - 1), m = T.cam[i]; return [m[0] * x + m[1] * y + m[2], m[3] * x + m[4] * y + m[5]]; }

// ---------- pen ----------
function rng(tag) { let h = 2166136261 ^ SEED; for (const c of String(tag)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return LLPen.makeRng(h >>> 0); }
function rnd(r) { return r.next ? r.next() : r(); }
function ink(pts, tag, { col = INK, w = 1.5, pen = 'ink', poly = false, a = 1 } = {}) {
  if (pts.length < 2) return;
  const r = LLPen.stroke(pts, pen, rng(tag), { width: w, wobble: 1.2, tier: 'hi', poly, round: 2 });
  X.save(); X.fillStyle = col;
  for (const L of r.layers) { X.globalAlpha = Math.min(1, L.op * a); X.fill(new Path2D(L.d), L.rule || 'nonzero'); }
  X.restore();
}
// Crayon fill: a flat base a touch off the line, plus waxy strokes across it in one direction.
function crayon(path, col, tag, { dx = 1.5, dy = 1, ang = -0.7, sp = 5, a = 0.9 } = {}) {
  X.save(); X.translate(dx, dy); X.globalAlpha = a * 0.85; X.fillStyle = col; X.fill(path);
  X.clip(path); const b = 400, ca = Math.cos(ang), sa = Math.sin(ang), r = rng(tag + 'c');
  X.globalAlpha = 0.35; X.strokeStyle = col; X.lineWidth = 2.2; X.lineCap = 'round'; X.beginPath();
  for (let k = -b; k < b; k += sp) { const o = k + (rnd(r) - 0.5) * 2; X.moveTo(-sa * o - ca * b, ca * o - sa * b); X.lineTo(-sa * o + ca * b, ca * o + sa * b); }
  X.restore();
}
function circlePts(cx, cy, rx, ry = rx, a0 = 0, a1 = TAU, n = 28) { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; }
function pathOf(pts) { const p = new Path2D(); pts.forEach((q, i) => (i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1]))); p.closePath(); return p; }
function dot(x, y, r, col = INK) { X.fillStyle = col; X.beginPath(); X.arc(x, y, r, 0, TAU); X.fill(); }

// ---------- characters ----------
// Sun sinking into the horizon: half disc, boiling rays, a sleepy face that wakes up.
function sun(cx, cy, r, t, wake) {
  X.save(); X.beginPath(); X.rect(0, 0, W, cy + 2); X.clip();
  const body = circlePts(cx, cy, r, r, Math.PI, TAU, 24).concat([[cx + r, cy]]);
  crayon(pathOf(body), SUN, 'sunf'); ink(body, 'sun', { w: 1.6 });
  const rr = rng('rays');
  for (let i = 0; i < 9; i++) {
    const a = Math.PI + (i + 0.5) * Math.PI / 9, wob = Math.sin(t * 5 + i) * 4, l0 = r + 9, l1 = r + 24 + wob + rnd(rr) * 5;
    ink([[cx + Math.cos(a) * l0, cy + Math.sin(a) * l0], [cx + Math.cos(a) * l1, cy + Math.sin(a) * l1]], 'ray' + i, { w: 1.4, col: '#d9931c' });
  }
  const ey = cy - r * 0.42, ex = r * 0.34, o = ease(wake);
  for (const s of [-1, 1]) {
    if (o < 0.5) ink([[cx + s * ex - 8, ey], [cx + s * ex, ey + 3], [cx + s * ex + 8, ey]], 'lid' + s, { w: 1.3 });
    else { dot(cx + s * ex, ey, 4.2); dot(cx + s * ex + 1.4, ey - 1.6, 1.2, CREAM); }
  }
  const sm = lerp(3, 9, o); ink([[cx - 13, cy - r * 0.16], [cx, cy - r * 0.16 + sm], [cx + 13, cy - r * 0.16]], 'smile', { w: 1.3 });
  for (const s of [-1, 1]) { X.globalAlpha = 0.5; dot(cx + s * r * 0.58, cy - r * 0.2, 6, CORAL); X.globalAlpha = 1; }
  X.restore();
}
// A crow: perched (wings folded) or flying (wings flap on the drawing count).
function crow(x, y, s, flap, tag, flying) {
  const body = circlePts(x, y, 11 * s, 7.5 * s, 0, TAU, 18);
  crayon(pathOf(body), '#3b3550', tag + 'b', { a: 1 }); ink(body, tag + 'o', { w: 1.2 * s });
  dot(x + 9 * s, y - 5 * s, 4.2 * s, '#3b3550'); dot(x + 10 * s, y - 6 * s, 1.2 * s, CREAM);
  ink([[x + 12 * s, y - 5 * s], [x + 18 * s, y - 3.5 * s], [x + 12.5 * s, y - 2.5 * s]], tag + 'k', { w: 1.1 * s, col: '#e39b2d', poly: true });
  if (flying) {
    const up = flap ? -1 : 0.4;
    for (const d of [-1, 1]) ink([[x - 2 * s, y - 2 * s], [x - 2 * s + d * 6 * s, y + up * 14 * s], [x + d * 13 * s, y + up * 9 * s]], tag + 'w' + d, { w: 1.2 * s });
  } else {
    ink([[x - 6 * s, y + 1 * s], [x + 3 * s, y + 3 * s]], tag + 'wf', { w: 1.1 * s });
    for (const d of [-3, 3]) ink([[x + d * s, y + 7 * s], [x + d * s, y + 12 * s]], tag + 'l' + d, { w: 1.0 * s });
  }
}
function note(x, y, s, a, tag, two) {
  X.save(); X.globalAlpha = a;
  const h = 26 * s;
  if (two) { dot(x - 10 * s, y + 2 * s, 5 * s); dot(x + 10 * s, y, 5 * s); ink([[x - 6 * s, y + 1 * s], [x - 6 * s, y - h]], tag + 's1', { w: 1.3 * s }); ink([[x + 14 * s, y - 1 * s], [x + 14 * s, y - h - 2 * s]], tag + 's2', { w: 1.3 * s }); ink([[x - 6 * s, y - h], [x + 14 * s, y - h - 2 * s]], tag + 'bm', { w: 2.4 * s }); }
  else { dot(x, y, 5.5 * s); ink([[x + 4.5 * s, y - 1 * s], [x + 4.5 * s, y - h]], tag + 's', { w: 1.3 * s }); ink([[x + 4.5 * s, y - h], [x + 13 * s, y - h + 8 * s], [x + 10 * s, y - h + 15 * s]], tag + 'f', { w: 1.3 * s }); }
  X.restore();
}
// Wolf pup trotting: cream body, pointed ears, a tail up; four legs alternate on twos.
function pup(x, y, s, ph, tag) {
  const bob = ph ? -2 * s : 0, by = y - 20 * s + bob;
  X.save(); X.globalAlpha = 0.28; X.fillStyle = '#1d1a24'; X.beginPath(); X.ellipse(x + 2 * s, y + 2 * s, 30 * s, 5 * s, 0, 0, TAU); X.fill(); X.restore();
  // bushy tail: a filled crayon plume curving up behind
  const tail = [[x - 18 * s, by - 4 * s], [x - 30 * s, by - 12 * s + bob], [x - 36 * s, by - 26 * s], [x - 30 * s, by - 30 * s], [x - 26 * s, by - 18 * s], [x - 16 * s, by + 2 * s]];
  crayon(pathOf(tail), '#cbb89c', tag + 'tf', { a: 1 }); ink(tail.concat([tail[0]]), tag + 'tail', { w: 1.4 * s });
  for (const [lx, d] of [[-14, 0], [-7, 1], [10, 1], [17, 0]]) {
    const sw = (ph ^ d) ? 5 : -5, fx = x + (lx + sw) * s;
    ink([[x + lx * s, by + 4 * s], [fx, y - 1 * s]], tag + 'leg' + lx, { w: 3.2 * s, col: CREAM });
    ink([[x + lx * s - 2.2 * s, by + 5 * s], [fx - 2.2 * s, y - 1 * s]], tag + 'lgl' + lx, { w: 1.1 * s });
    ink([[x + lx * s + 2.2 * s, by + 5 * s], [fx + 2.2 * s, y - 1 * s]], tag + 'lgr' + lx, { w: 1.1 * s });
    dot(fx, y - 0.5 * s, 2.6 * s, '#3a3330');
  }
  const body = circlePts(x, by, 23 * s, 12 * s, 0, TAU, 22);
  crayon(pathOf(body), CREAM, tag + 'b', { a: 1 }); crayon(pathOf(circlePts(x - 5 * s, by - 5 * s, 15 * s, 5.5 * s)), '#b9a58c', tag + 'saddle', { a: 0.7 });
  ink(body, tag + 'bo', { w: 1.4 * s });
  const hx = x + 25 * s, hy = by - 11 * s, head = circlePts(hx, hy, 10.5 * s, 9.5 * s, 0, TAU, 18);
  crayon(pathOf(head), CREAM, tag + 'hf', { a: 1 }); ink(head, tag + 'h', { w: 1.4 * s });
  const sn = [[hx + 7 * s, hy - 2 * s], [hx + 18 * s, hy + 2 * s], [hx + 8 * s, hy + 6 * s]];
  crayon(pathOf(sn), CREAM, tag + 'snf', { a: 1 }); ink(sn, tag + 'sn', { w: 1.3 * s, poly: true }); dot(hx + 18 * s, hy + 2 * s, 2.4 * s);
  for (const ex of [-6, 3]) { const e = [[hx + ex * s - 3.5 * s, hy - 7 * s], [hx + ex * s, hy - 21 * s], [hx + ex * s + 4.5 * s, hy - 7 * s]];
    crayon(pathOf(e), '#b9a58c', tag + 'ef' + ex, { a: 1 }); ink(e, tag + 'ear' + ex, { w: 1.3 * s, poly: true }); }
  dot(hx + 3 * s, hy - 2 * s, 2.1 * s); dot(hx + 3.6 * s, hy - 2.7 * s, 0.7 * s, CREAM);
}
function bird(x, y, s, flap, flying, tag, look = 1) {
  const body = circlePts(x, y, 12 * s, 9 * s, 0, TAU, 18);
  crayon(pathOf(body), SKY, tag + 'b', { a: 1 }); crayon(pathOf(circlePts(x + 3 * look * s, y + 3 * s, 6 * s, 4.5 * s)), CREAM, tag + 'chest', { a: 1 });
  ink(body, tag + 'o', { w: 1.3 * s });
  dot(x + 6 * look * s, y - 3 * s, 2.2 * s);
  ink([[x + 11 * look * s, y - 2 * s], [x + 18 * look * s, y], [x + 11 * look * s, y + 2 * s]], tag + 'k', { w: 1.2 * s, col: CORAL, poly: true });
  ink([[x - 11 * look * s, y - 1 * s], [x - 19 * look * s, y - 5 * s]], tag + 't', { w: 2.2 * s, col: INK });
  if (flying) { const up = flap ? -1 : 0.5; ink([[x - 3 * s, y - 3 * s], [x - 9 * look * s, y + up * 16 * s], [x - 15 * look * s, y + up * 10 * s]], tag + 'w', { w: 1.3 * s }); }
  else { ink([[x - 7 * look * s, y + 3 * s], [x + 1 * look * s, y + 5 * s]], tag + 'wf', { w: 1.1 * s }); for (const d of [-2, 2]) ink([[x + d * s, y + 8 * s], [x + d * s, y + 13 * s]], tag + 'l' + d, { w: 1.0 * s, col: CORAL }); }
}
function flower(x, y, s, open, tag, col) {
  if (open <= 0) return;
  const k = ease(open), r = 9 * s * k;
  for (let i = 0; i < 5; i++) {
    const a = i * TAU / 5 - Math.PI / 2, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r, pet = circlePts(px, py, 6 * s * k, 6 * s * k, 0, TAU, 12);
    crayon(pathOf(pet), col, tag + 'p' + i, { a: 1 }); ink(pet, tag + 'po' + i, { w: 1.1 * s });
  }
  dot(x, y, 4 * s * k, SUN); ink(circlePts(x, y, 4 * s * k), tag + 'c', { w: 1.0 * s });
}

// ---------- shots ----------
const SHOT = {
  walk(t) {
    const nose = series(T.pose.map((p) => p && p[0])), ank = series(T.pose.map((p) => p && [(p[27][0] + p[28][0]) / 2, Math.max(p[27][1], p[28][1])]));
    const hand = series(T.pose.map((p) => p && (p[15][0] < p[16][0] ? p[15] : p[16])));
    // sun in the glow, sitting on the horizon, wakes at 1.2 s
    if (L === 'back') { const [sx, sy] = world(205, 641, t); sun(sx, sy, 85, t, seg(t, 1.0, 1.6)); }
    // three crows on the long cloud, taking off as he nears
    if (L === 'back') [[480, 566, 3.0], [560, 561, 3.4], [640, 556, 3.8]].forEach(([cx, cy, go], i) => {
      const [px, py] = world(cx, cy, t), f = t - go;
      if (f < 0) crow(px, py - 17, 1.7, 0, 'crow' + i, false);
      else crow(px + f * 120 + f * f * 40, py - 17 - f * 210 - Math.sin(f * 7) * 8, 1.7, Math.floor(t * 12) % 2, 'crow' + i, true);
    });
    const [nx, ny] = at(nose, t), [ax, ay] = at(ank, t), bh = Math.max(40, ay - ny + 30);
    // notes rise from the guitar hand, one every 0.45 s, each lives 1.4 s
    if (L === 'front') for (let k = 0; k < 14; k++) {
      const born = 0.3 + k * 0.45, age = t - born; if (age < 0 || age > 1.4) continue;
      const [hx, hy] = at(hand, born), s = clamp(bh / 150, 0.9, 2.0);
      note(hx - 14 * s - age * 30 * s + Math.sin(age * 6 + k) * 8 * s, hy - age * 120 * s, s, Math.min(1, (1.4 - age) * 2.5, age * 6), 'n' + k, k % 3 === 1);
    }
    // pup trots at his left heel (image right), sized to him
    const ps = clamp(bh / 170, 0.9, 2.0); if (L === 'front') pup(ax + bh * 0.4 + 45 * ps, ay + 4, ps, Math.floor(t * 8) % 2, 'pup');
  },
  dog(t) {
    const head = series(T.pts.head.map((p) => p), 2), [hx, hy] = at(head, t), gone = T.pts.head[Math.round(t * FPS)] == null;
    // cactus blooms on the prickly pear (top right), pinned to the world
    if (L === 'back') [[630, 468, 0.4, CORAL], [692, 498, 0.7, SUN], [592, 506, 1.0, '#e46fa1']].forEach(([x, y, b, c], i) => { const [px, py] = world(x, y, t); flower(px, py, 2.6, seg(t, b, b + 0.35), 'fl' + i, c); });
    if (L !== 'front') return;
    // bird flies in, lands between the ears, bobs, flies off when the dog turns away
    const land = [hx - 4, hy - 100], tin = seg(t, 0.15, 0.85), tout = seg(t, 1.9, 2.6);
    let bx, by, fly = true, look = -1;
    if (t < 0.85) { const sx = 760, sy = 180; bx = lerp(sx, land[0], ease(tin)); by = lerp(sy, land[1], ease(tin)) - Math.sin(tin * Math.PI) * 80; }
    else if (t < 1.9 && !gone) { bx = land[0]; by = land[1] - (Math.floor(t * 6) % 3 === 0 ? 3 : 0); fly = false; look = Math.floor(t * 2) % 2 ? 1 : -1; }
    else { const o = ease(tout); bx = lerp(land[0], -80, o); by = lerp(land[1], 120, o) - Math.sin(o * Math.PI) * 60; look = -1; }
    if (tout < 1) bird(bx, by, 3.2, Math.floor(t * 12) % 2, fly, 'bird', look);
    // a little heart when it lands
    const hk = seg(t, 0.95, 1.6); if (hk > 0 && hk < 1) { const s = 2 + hk * 0.8, x0 = land[0] + 60, y0 = land[1] - 60 - hk * 50, h = [];
      for (let i = 0; i <= 24; i++) { const a = i / 24 * TAU, hx2 = 16 * Math.pow(Math.sin(a), 3), hy2 = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); h.push([x0 + hx2 * s * 0.7, y0 + hy2 * s * 0.7]); }
      X.globalAlpha = 1 - hk; crayon(pathOf(h), CORAL, 'heart', { a: 1 }); ink(h, 'hearto', { w: 1.8 }); X.globalAlpha = 1; }
  },
};

// file:// pages can't fetch, so the renderer hands the track data in.
window.setup = (clip, data) => {
  T = data; W = T.w; H = T.h;
  const c = document.getElementById('c'); c.width = W; c.height = H; X = c.getContext('2d');
  window.__clip = clip; return true;
};
// Two layers: 'back' sits behind people (the renderer lays the person's mask over it), 'front' is on top.
let L = 'front';
window.drawFrame = (t, layer = 'front') => {
  X.clearRect(0, 0, W, H); SEED = Math.floor(t * 12) + 1; L = layer;
  SHOT[window.__clip](t);
};
window.__framePNG = (t, layer) => { window.drawFrame(t, layer); return document.getElementById('c').toDataURL('image/png'); };

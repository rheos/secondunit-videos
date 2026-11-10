// The machine's engine, shared by every section of the song (song time: t 0 = song start). One gold coin on one
// continuous path: each section adds legs (time spans with a position function), camera holds, parts and lettering.
// drawFrame(t) is pure. Sections are files in js/sec-*.js that call section({...}); they own their own drawing and
// times and talk to each other only through window.SEC.<id> (hand-off points). Words come from window.CUES.
'use strict';
let C = null, LEGS = [], LANDS = [], ROLL = null;
const SECTIONS = [], SEC = (window.SEC = {});
const section = (s) => SECTIONS.push(s);
const wt = (l, i) => C.lines[l].words[i].t;
const lineEnd = (l) => { const w = C.lines[l].words; return w[w.length - 1].t; };
const PROBE = (typeof ML !== 'undefined' && ML.probe) || { on: false, text() {}, box() {}, event() {}, edge() {}, value() {} };

// a sign's text: fitted inside its box with a margin, and reported to the audit with the box as its container
function boxLabel(txt, [bx, by, bw, bh], size, col = INK) {
  const s = Math.min(size, bh * 0.62), cx = bx + bw / 2, cy = by + bh / 2, used = fitLabel(txt, cx, cy + 1, bw - 12, s, col);
  if (X.getTransform().a < 0.5) return; // a pull-back: a sign a few pixels tall has no margin to measure
  X.save(); X.font = `${used}px KevinSans`; X.textAlign = 'center'; X.textBaseline = 'middle'; PROBE.text(X, 'sign', txt, cx, cy + 1, [bx, by, bw, bh], { margin: 2 }); X.restore();
}
const COIL = (a, b, turns, r) => { const o = []; const n = Math.round(turns * 22); for (let i = 0; i <= n; i++) { const k = i / n, th = k * turns * TAU; o.push([lerp(a[0], b[0], k) + Math.sin(th) * r, lerp(a[1], b[1], k) - Math.cos(th) * r + r]); } return o; };
function plank(pts, tag, w = 11) { // a wooden run under a coin path (pts are coin centres; the plank sits 18 units below)
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], l = dist(a, b) || 1, nx = (b[1] - a[1]) / l, ny = -(b[0] - a[0]) / l, sg = ny < 0 ? -1 : 1, bx = nx * sg, by = ny * sg;
    const o = 18; shape([[a[0] + bx * o, a[1] + by * o], [b[0] + bx * o, b[1] + by * o], [b[0] + bx * (o + w), b[1] + by * (o + w)], [a[0] + bx * (o + w), a[1] + by * (o + w)], [a[0] + bx * o, a[1] + by * o]], TAN, `${tag}p${i}`, 1.5);
  }
}

// ---------- the coin's path ----------
function buildLegs() {
  LEGS = []; LANDS = [];
  const add = (t0, t1, f) => LEGS.push({ t0, t1, f }), land = (name, t) => LANDS.push([name, t]);
  SECTIONS.forEach((s) => s.legs && s.legs(add, land));
  LEGS.sort((a, b) => a.t0 - b.t0);
  ROLL = [0]; for (let i = 1; i <= Math.ceil(C.dur * 48) + 48; i++) ROLL.push(ROLL[i - 1] + dist(ballAt((i - 1) / 48), ballAt(i / 48)));
  window.__legs = LEGS.map((l) => { const d = Math.min(l.t1, C.dur) - l.t0; let len = 0, p = ballAt(l.t0); for (let s = 1; s <= 20; s++) { const q = ballAt(l.t0 + d * s / 20); len += dist(p, q); p = q; } return `${l.t0.toFixed(2)}-${l.t1.toFixed(2)} ${Math.round(len / Math.max(d, 1e-3))} u/s`; });
}
function ballAt(t) {
  let l = LEGS[0]; for (const c of LEGS) { if (t >= c.t0) l = c; else break; }
  return l.f(clamp((t - l.t0) / (l.t1 - l.t0)), t);
}

// ---------- camera: follows the coin, smoothed over its own path; sections add held framings ----------
function camAt(t) {
  let x = 0, y = 0, sum = 0;
  for (let j = -10; j <= 14; j++) { const w = 1 - Math.abs(j - 2) / 14, b = ballAt(t + j * 0.04); x += b[0] * w; y += b[1] * w; sum += w; }
  const st = { x: x / sum, y: y / sum - 30, z: 1.1 };
  const hold = (cx, cy, cz, a0, a1, b0, b1) => { const k = ease(seg(t, a0, a1)) * (1 - ease(seg(t, b0, b1))); st.x = lerp(st.x, cx, k); st.y = lerp(st.y, cy, k); st.z = Math.exp(lerp(Math.log(st.z), Math.log(cz), k)); };
  SECTIONS.forEach((s) => s.cam && s.cam(hold, t, st));
  return st;
}

// ---------- the coin ----------
function coin(x, y, tag, spin = 0, r = 21) {
  blob(circ(x, y, r), GILT, tag, 2); ink(circ(x, y, r * 0.68), tag + 'i', { w: 1.1, col: OX });
  X.save(); X.translate(x, y); X.rotate(spin); X.font = `${r * 1.1}px KevinSans`; X.fillStyle = OX; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('¢', 0, 1); X.restore();
}
function ballDraw(t, probe = true) {
  const [x, y] = ballAt(t), [px, py] = ballAt(t - 0.05), v = Math.hypot(x - px, y - py) / 0.05;
  const i = clamp(t * 48, 0, ROLL.length - 2), roll = lerp(ROLL[Math.floor(i)], ROLL[Math.floor(i) + 1], i % 1);
  if (v > 700) { const n = Math.hypot(x - px, y - py) || 1, ux = (x - px) / n, uy = (y - py) / n; for (const o of [-10, 0, 10]) ink([[x - ux * 28 - uy * o, y - uy * 28 + ux * o], [x - ux * (28 + Math.min(90, v / 22)) - uy * o, y - uy * (28 + Math.min(90, v / 22)) + ux * o]], 'sp' + o, { w: 1.3 }); }
  coin(x, y, 'hero', roll / 21);
  if (!probe) return;
  if (!SECTIONS.some((s) => s.coinFree && s.coinFree(t))) PROBE.box(X, 'coin', x - 21, y - 21, 42, 42, { keep: true });
  if (PROBE.on) for (const [name, tk] of LANDS) { const a = ballAt(tk), b = ballAt(ML.prevT(t)); PROBE.edge(name, dist([x, y], a) < 2, dist(b, a) < 2); }
}

// ---------- words: written on where the camera is, word by word on the sung times ----------
let PROBE_WORDS = true;
function letterWords(words, x, y, size, col, maxW, rot = 0, wipe = 0.24) {
  if (T < words[0].t - 0.05) return;
  X.save(); X.translate(x, y); X.rotate(rot); X.font = `${size}px KevinSans`; X.fillStyle = col; X.textBaseline = 'alphabetic';
  const sp = size * 0.27; let cx = 0, cy = 0;
  for (const w of words) {
    const ww = X.measureText(w.w).width; if (cx > 0 && cx + ww > maxW) { cx = 0; cy += size * 1.16; }
    const k = seg(T, w.t - 0.04, w.t + wipe);
    if (k > 0) { X.save(); X.beginPath(); X.rect(cx - 2, cy - size * 1.2, (ww + 4) * k, size * 1.7); X.clip(); X.fillText(w.w, cx, cy); X.restore(); if (PROBE_WORDS && T < words[words.length - 1].t + 1.5) PROBE.box(X, 'word', cx, cy - size * 0.8, ww, size, { keep: true }); }
    cx += ww + sp;
  }
  X.restore();
}
const phrase = (txt, t) => txt.split(' ').map((w, i) => ({ w, t: t + i * 0.12 }));
const lineWords = (l) => C.lines[l].words;

// ---------- the frame ----------
// drawWorld draws every section's parts, the coin and the words at the current transform; the outro calls it again
// inside the jukebox window for the machine-inside-the-machine.
function drawWorld(t, depth = 0) {
  SECTIONS.forEach((s) => s.parts && s.parts(t, depth));
  ballDraw(t, depth === 0);
  const pw = PROBE_WORDS; PROBE_WORDS = depth === 0; SECTIONS.forEach((s) => s.words && s.words(t, depth)); PROBE_WORDS = pw;
}
function draw(t) {
  const c = camAt(t), sway = Math.sin(t * 0.6) * 4;
  X.save(); X.translate(W / 2 + sway, H / 2); X.scale(c.z, c.z); X.translate(-c.x, -c.y);
  VIEW = [c.x - W / 2 / c.z, c.y - H / 2 / c.z, c.x + W / 2 / c.z, c.y + H / 2 / c.z];
  drawWorld(t, 0);
  X.restore();
  SECTIONS.forEach((s) => s.over && s.over(t, c)); // screen-space overlays (a section may darken the paper, say)
}

window.drawFrame = (t) => { T = t; SEED = Math.floor(t * 12) + 1; paper(); draw(t); };
window.setup = async () => {
  C = window.CUES; const c = document.getElementById('c'); c.width = W; c.height = H; X = c.getContext('2d');
  SECTIONS.forEach((s) => s.init && s.init());
  buildLegs(); await document.fonts.load('30px KevinSans'); return window.__legs;
};
window.__ready = (async () => { await new Promise((r) => (document.readyState === 'loading' ? addEventListener('DOMContentLoaded', r) : r())); return window.setup(); })();
window.__frameJPEG = (t, q = 0.92) => {
  const cv = document.getElementById('c'), a = camAt(t), b = camAt(t + 1 / 24), speed = Math.hypot(a.x - b.x, a.y - b.y) * a.z;
  if (speed < 34) { window.drawFrame(t); return cv.toDataURL('image/jpeg', q); }
  const off = document.createElement('canvas'); off.width = W; off.height = H; const o = off.getContext('2d'), n = 8, seed = Math.floor(t * 12) + 1;
  for (let i = 0; i < n; i++) { const ts = t + (i / n) * 0.5 / 24; T = ts; SEED = seed; paper(); draw(ts); o.globalAlpha = 1 / (i + 1); o.drawImage(cv, 0, 0); }
  return off.toDataURL('image/jpeg', q);
};

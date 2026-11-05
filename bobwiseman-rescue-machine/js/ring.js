// The rescue machine, test 02. One ball on one continuous path, the camera following it (Stephen Wu's contraptions
// method); every part a joke about its line (Kevin Ngo's film); on the last word the camera pulls back and the whole
// machine is a ring around one lit window. drawFrame(t) is pure. Lines come from window.CUES (work/cues.js, gitignored).
// Every mark is a Looseleaf pen stroke, held on twos and reseeded per drawing.
'use strict';
const W = 1280, H = 720, TAU = Math.PI * 2;
const INK = '#2a2320', PAPER = '#f4ecdc', RED = '#cf3a2c', GILT = '#d9b463', TAN = '#c79d6a', OX = '#6b2328', LAMP = '#ffd36b', BALL = '#2f4f8f', GLASS = '#cfe0da', PENCIL = '#8d8478', GREY = '#a9a39a';
let X = null, C = null, SEED = 1, T = 0, L = null, VIEW = null;

// ---------- utils ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = (k) => { k = clamp(k); return k * k * (3 - 2 * k); };
const seg = (t, a, b) => clamp((t - a) / (b - a));
const pulse = (t, a, d = 0.35) => (t < a || t > a + d ? 0 : Math.sin(Math.PI * (t - a) / d));
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const plen = (pts) => pts.slice(1).reduce((s, p, i) => s + dist(p, pts[i]), 0);
function along(pts, k) { // point k (0..1) of the way along a polyline
  let d = plen(pts) * clamp(k);
  for (let i = 1; i < pts.length; i++) { const l = dist(pts[i], pts[i - 1]); if (d <= l || i === pts.length - 1) { const f = l ? d / l : 0; return [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]; } d -= l; }
  return pts[0];
}

// ---------- pen ----------
function rng(tag) { let h = 2166136261 ^ SEED; for (const c of String(tag)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return LLPen.makeRng(h >>> 0); }
function ink(pts, tag, { col = INK, w = 1.5, pen = 'ink', poly = false, a = 1 } = {}) {
  if (pts.length < 2) return;
  const r = LLPen.stroke(pts, pen, rng(tag), { width: w, wobble: 1.1, tier: 'lo', poly, round: 2 });
  X.save(); X.fillStyle = col;
  for (const l of r.layers) { X.globalAlpha = Math.min(1, l.op * a); X.fill(new Path2D(l.d), l.rule || 'nonzero'); }
  X.restore();
}
function crayon(path, col, tag, a = 1) { // flat wax a touch off the line, plus strokes across it
  X.save(); X.translate(2, 1.5); X.globalAlpha = a * 0.9; X.fillStyle = col; X.fill(path); X.clip(path);
  const r = rng(tag + 'c'); X.globalAlpha = 0.28; X.strokeStyle = '#000'; X.globalCompositeOperation = 'soft-light'; X.lineWidth = 3.5; X.beginPath();
  for (let k = -3400; k < 3400; k += 9) { const o = k + (r() - 0.5) * 4; X.moveTo(o - 700, -2400); X.lineTo(o + 700, 2400); }
  X.stroke(); X.restore();
}
const circ = (cx, cy, rx, ry = rx, a0 = 0, a1 = TAU, n = 30) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
const box = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
const pathOf = (pts) => { const p = new Path2D(); pts.forEach((q, i) => (i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1]))); p.closePath(); return p; };
function shape(pts, fill, tag, w = 2) { if (fill) crayon(pathOf(pts), fill, tag); ink(pts, tag + 'o', { w, poly: true }); }
function blob(pts, fill, tag, w = 2) { if (fill) crayon(pathOf(pts), fill, tag); ink(pts, tag + 'o', { w }); }
function dot(x, y, r, col = INK) { X.fillStyle = col; X.beginPath(); X.arc(x, y, r, 0, TAU); X.fill(); }
function hatch(x, y, w, h, tag, sp = 11, a = 0.55) { X.save(); X.beginPath(); X.rect(x, y, w, h); X.clip(); const r = rng(tag); for (let k = -h; k < w; k += sp) ink([[x + k, y + h + 2], [x + k + h + r() * 3, y - 2]], tag + k, { w: 0.7, a, pen: 'ink.fine' }); X.restore(); }
function label(txt, x, y, size, col = INK, rot = 0, align = 'center') { X.save(); X.translate(x, y); X.rotate(rot); X.font = `${size}px KevinSans`; X.fillStyle = col; X.textAlign = align; X.textBaseline = 'middle'; X.fillText(txt, 0, 0); X.restore(); }
const near = (x, y, r = 500) => !VIEW || (x > VIEW[0] - r && x < VIEW[2] + r && y > VIEW[1] - r && y < VIEW[3] + r);

// ---------- the ball's path: legs between word times ----------
// roll: constant speed along a polyline. fall: accelerating. rise: decelerating. hop: a parabola. ride: fixed to a vehicle.
const COIL = (a, b, turns, r) => { const o = []; const n = turns * 18; for (let i = 0; i <= n; i++) { const k = i / n, th = k * turns * TAU; o.push([lerp(a[0], b[0], k) + Math.sin(th) * r * 0.9, lerp(a[1], b[1], k) - Math.cos(th) * r + r]); } return o; };
const P = {
  start: [-830, -1132], shelfEnd: [-400, -1000], hit: [[-342, -1006], [-280, -1006], [-218, -1006]], phoneOff: [-150, -960], desk: [-90, -846], bell: [38, -846],
  coilA: [60, -846], coilB: [800, -446], pad: [852, -446], top: { 0: -760, 1: -1062 },
  sw: [[880, -428], [1130, -316], [880, -196], [1006, -84]], nose: [1030, -84], perch: [1120, 92], jar: [922, 232],
  ledge: [800, 258], z: [[760, 296], [560, 420], [790, 560], [560, 690], [452, 776]],
  truckRoof: -112, ambRoof: -118, road: 908, tubeIn: [-800, 830], tubeOut: [-880, -1190],
};
const TUBE = (() => { const o = []; for (let i = 0; i <= 60; i++) { const a = lerp(Math.PI * 0.72, Math.PI * 1.34, i / 60); o.push([Math.cos(a) * 1180 + 160, Math.sin(a) * 1180 - 150]); } o.unshift(P.tubeIn); o.push(P.tubeOut); return o; })();
const TRUCK0 = 430, TRUCK1 = -40, AMB0 = -240, AMB1 = -700;

let LEGS = [], TIMES = null;
function buildLegs() {
  const w = (l, i) => C.lines[l].words[i].t, tap = (l, i) => C.lines[l].taps[i];
  TIMES = [0, 1].map((p) => { const o = p * 4; return { taps: [tap(o, 0), tap(o, 1), tap(o, 2)], emer: tap(o, 3) + (p ? 0.24 : 0), whats: w(o + 1, 0), urg: w(o + 1, 2), animal: w(o + 2, 0), pest: w(o + 2, 2), ft: w(o + 3, 0), am: w(o + 3, 2) }; });
  const legs = [];
  const add = (t0, t1, kind, a) => legs.push({ t0, t1, kind, ...a });
  TIMES.forEach((c, p) => {
    const s = c.taps[0] - 0.96;
    add(s, c.taps[0], 'roll', { pts: [P.start, P.shelfEnd, P.hit[0]] });
    add(c.taps[0], c.taps[1], 'hop', { a: P.hit[0], b: P.hit[1], h: 54 });
    add(c.taps[1], c.taps[2], 'hop', { a: P.hit[1], b: P.hit[2], h: 54 });
    add(c.taps[2], c.emer, 'roll', { pts: [P.hit[2], P.phoneOff, P.desk, P.bell] });
    add(c.emer, c.whats, 'roll', { pts: [P.bell, P.coilA, ...COIL(P.coilA, P.coilB, 22, 3), P.pad] });
    const peak = [P.pad[0], P.top[p]];
    add(c.whats, c.urg, 'rise', { a: P.pad, b: peak });
    const back = c.urg + (p ? 0.72 : 0.5);
    add(c.urg, back, 'fall', { a: peak, b: P.pad });
    add(back, c.animal, 'roll', { pts: [P.pad, ...P.sw, P.nose] });
    const m = lerp(c.animal, c.pest, 0.42);
    add(c.animal, m, 'hop', { a: P.nose, b: P.perch, h: 120 });
    add(m, c.pest, 'roll', { pts: [P.perch, [1040, 250], [P.jar[0] + 30, 250], [P.jar[0] + 30, 246]] });
    add(c.pest, c.ft, 'roll', { pts: [[P.jar[0] + 30, 246], P.ledge, ...P.z] });
    const rideEnd = c.am + (p ? 1.1 : 0.62), up = rideEnd + (p ? 1.2 : 1.04);
    add(c.ft, c.am - 0.26, 'ride', { v: 'truck', p });
    add(c.am - 0.26, c.am, 'hopride', { p });
    add(c.am, rideEnd, 'ride', { v: 'amb', p });
    add(rideEnd, up, 'tube', {});
    if (p === 0) add(up, TIMES[1].taps[0] - 0.96, 'roll', { pts: [P.tubeOut, P.start] });
    else add(up, 99, 'roll', { pts: [P.tubeOut, P.start, P.shelfEnd], v: 440 });
  });
  LEGS = legs;
  window.__legs = legs.map((l) => { const d = l.t1 - l.t0; const len = l.pts ? plen(l.pts) : l.a ? dist(l.a, l.b) : l.kind === 'tube' ? plen(TUBE) : 0; return `${l.t0.toFixed(2)}-${l.t1.toFixed(2)} ${l.kind} ${len ? Math.round(len / d) + ' u/s' : ''}`; });
}
function truckX(t) {
  const [a, b] = TIMES;
  if (t < a.ft) return TRUCK0; if (t < a.am) return lerp(TRUCK0, TRUCK1, ease(seg(t, a.ft, a.am)));
  if (t < b.ft) return lerp(TRUCK1, TRUCK0, ease(seg(t, a.am + 3, b.taps[0] + 6)));
  return lerp(TRUCK0, TRUCK1, ease(seg(t, b.ft, b.am)));
}
function ambX(t) {
  const [a, b] = TIMES, e0 = a.am + 0.62, e1 = b.am + 1.1;
  if (t < a.am) return AMB0; if (t < e0) return lerp(AMB0, AMB1, seg(t, a.am, e0) ** 1.4);
  if (t < b.am) return lerp(AMB1, AMB0, ease(seg(t, e0 + 2, b.taps[0] + 7)));
  return lerp(AMB0, AMB1, seg(t, b.am, e1) ** 1.4);
}
const bump = (t) => Math.sin(t * 19) * 1.6;
function ballAt(t) {
  let l = LEGS[0];
  for (const c of LEGS) { if (t >= c.t0) l = c; }
  const k = clamp((t - l.t0) / (l.t1 - l.t0));
  switch (l.kind) {
    case 'roll': if (l.v) return along(l.pts, ((t - l.t0) * l.v) / plen(l.pts)); return along(l.pts, k);
    case 'hop': return [lerp(l.a[0], l.b[0], k), lerp(l.a[1], l.b[1], k) - Math.sin(k * Math.PI) * l.h];
    case 'rise': return [l.a[0], lerp(l.a[1], l.b[1], 1 - (1 - k) ** 2.2)];
    case 'fall': return [l.a[0], lerp(l.a[1], l.b[1], k ** 2.2)];
    case 'ride': return l.v === 'truck' ? [truckX(t) - 6, P.road + P.truckRoof + bump(t)] : [ambX(t), P.road + P.ambRoof + bump(t)];
    case 'hopride': { const a = [truckX(l.t0) - 6, P.road + P.truckRoof], b = [ambX(l.t1), P.road + P.ambRoof]; return [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - Math.sin(k * Math.PI) * 130]; }
    case 'tube': return along(TUBE, k ** 1.3);
  }
  return P.start;
}

// ---------- camera: follows the ball, smoothed over a window of the ball's own path ----------
function camAt(t) {
  let x = 0, y = 0, sum = 0;
  for (let j = -10; j <= 14; j++) { const wt = 1 - Math.abs(j - 2) / 14, b = ballAt(Math.max(0, t + j * 0.04)); x += b[0] * wt; y += b[1] * wt; sum += wt; }
  x /= sum; y = y / sum - 40;
  const end = TIMES[1].am + 0.55, k = ease(seg(t, end, end + 2.1));
  return { x: lerp(x, 60, k), y: lerp(y, -135, k), z: Math.exp(lerp(Math.log(1.28), Math.log(0.305), k)) };
}

// ---------- props ----------
function plank(pts, tag, w = 11) { // a wooden run with brackets
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], nx = (b[1] - a[1]) / (dist(a, b) || 1), ny = -(b[0] - a[0]) / (dist(a, b) || 1), sgn = ny < 0 ? -1 : 1, bx = nx * sgn, by = ny * sgn;
    const q = [[a[0] + bx * 10, a[1] + by * 10], [b[0] + bx * 10, b[1] + by * 10], [b[0] + bx * (10 + w), b[1] + by * (10 + w)], [a[0] + bx * (10 + w), a[1] + by * (10 + w)], [a[0] + bx * 10, a[1] + by * 10]];
    shape(q, TAN, `${tag}p${i}`, 1.5);
    const mx = lerp(a[0], b[0], 0.5), my = lerp(a[1], b[1], 0.5);
    ink([[mx, my + 21], [mx, my + 52], [mx + 22, my + 21 + (b[1] - a[1]) / (dist(a, b) || 1) * 22]], `${tag}b${i}`, { w: 1.3, poly: true });
  }
}
function deskScene(t) {
  if (!near(-200, -900)) return;
  // wall bits behind the desk: clock stopped at a bad hour, framed certificate
  { const cx = -520, cy = -972; blob(circ(cx, cy, 40), PAPER, 'wclock', 1.8); ink([[cx, cy], [cx, cy - 29]], 'wc1', { w: 1.8 }); ink([[cx, cy], [cx + 20, cy + 11]], 'wc2', { w: 1.8 }); for (let i = 0; i < 12; i++) { const a = i * TAU / 12; ink([[cx + Math.cos(a) * 32, cy + Math.sin(a) * 32], [cx + Math.cos(a) * 36, cy + Math.sin(a) * 36]], 'wct' + i, { w: 1 }); } }
  shape(box(170, -1010, 120, 84), GILT, 'cert', 1.8); shape(box(182, -1000, 96, 64), PAPER, 'cert2', 1); label('WE CARE', 230, -968, 19);
  // desk
  shape(box(-560, -828, 650, 22), TAN, 'desk', 2); for (const lx of [-530, 60]) shape(box(lx, -806, 16, 210), TAN, 'dleg' + lx, 1.6);
  // paper stacks and mug
  for (let i = 0; i < 6; i++) shape(box(-520 + (i % 2) * 4, -840 - i * 9, 96, 9), i % 3 ? PAPER : GLASS, 'pp' + i, 1);
  label('ON HOLD', -470, -904, 15, RED, -0.06);
  shape([[-404, -828], [-408, -880], [-356, -880], [-360, -828], [-404, -828]], PAPER, 'mug', 1.6); ink(circ(-352, -854, 13, 15, -1.3, 1.3, 10), 'mugh', { w: 1.5 }); label('#1', -382, -854, 15);
  ink([[-392, -892], [-386, -908], [-394, -922]], 'steam1', { w: 1, col: GREY }); ink([[-374, -892], [-368, -908], [-376, -922]], 'steam2', { w: 1, col: GREY });
}
function phone(t) {
  if (!near(-280, -900)) return;
  const x = -280, y = -828, hits = TIMES.flatMap((c) => c.taps);
  // body, handset cradle
  blob([[x - 128, y], [x - 92, y - 112], [x + 92, y - 112], [x + 128, y], [x - 128, y]], RED, 'phb', 2.4); hatch(x - 100, y - 104, 40, 96, 'phh', 9);
  const jump = hits.reduce((m, h) => Math.max(m, pulse(t, h - 0.02, 0.2)), 0) * 7;
  blob([[x - 118, y - 138 - jump], [x - 100, y - 164 - jump], [x + 100, y - 164 - jump], [x + 118, y - 138 - jump], [x + 88, y - 122 - jump], [x + 58, y - 138 - jump], [x - 58, y - 138 - jump], [x - 88, y - 122 - jump], [x - 118, y - 138 - jump]], RED, 'phs', 2.2);
  // dial spins on each hit, the 9 far, the 1s a little, and springs back
  let ang = 0; hits.forEach((h, i) => { const far = i % 3 === 0 ? 4.6 : 1.0, k = t - h; if (k > 0 && k < 0.8) ang += k < 0.1 ? far * ease(k / 0.1) : far * (1 - ease((k - 0.1) / 0.7)); });
  blob(circ(x, y - 56, 46), PAPER, 'dial', 2);
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 3 + ang + i * (TAU * 0.8 / 10); ink(circ(x + Math.cos(a) * 33, y - 56 + Math.sin(a) * 33, 7.5, 7.5, 0, TAU, 12), 'hole' + i, { w: 1.1 }); }
  dot(x, y - 56, 6);
  // beacon on the handset: rays while the alarm is on
  const on = TIMES.some((c) => t > c.emer && t < c.emer + 1.5), fl = on && Math.floor(t * 8) % 2 === 0;
  blob(circ(x, y - 166 - jump, 18, 16, Math.PI, TAU, 14).concat([[x + 18, y - 166 - jump], [x - 18, y - 166 - jump]]), fl ? '#ff5a3c' : '#a22d24', 'beacon', 1.6);
  if (fl) for (let i = 0; i < 7; i++) { const a = Math.PI + 0.2 + i * 0.45; ink([[x + Math.cos(a) * 26, y - 170 + Math.sin(a) * 24], [x + Math.cos(a) * 56, y - 170 + Math.sin(a) * 52]], 'br' + i, { col: RED, w: 2 }); }
}
function alarmBell(t) {
  if (!near(50, -860)) return;
  const x = 66, y = -846, ring = TIMES.reduce((m, c) => Math.max(m, seg(t, c.emer, c.emer + 0.9) < 1 && t >= c.emer ? 1 - seg(t, c.emer, c.emer + 0.9) : 0), 0), sh = Math.sin(t * 70) * 7 * ring;
  ink([[x + 6, y + 8], [x + 6, y - 66]], 'bpost', { w: 2.6 });
  blob(circ(x + 6 + sh, y - 70, 32, 30, Math.PI, TAU, 14).concat([[x + 42 + sh, y - 50], [x - 30 + sh, y - 50], [x - 26 + sh, y - 70]]), GILT, 'bell', 2);
  if (ring > 0) { for (const s of [-1, 1]) for (let i = 0; i < 3; i++) ink(circ(x + 6, y - 70, 52 + i * 15, 52 + i * 15, s > 0 ? -0.6 : Math.PI - 0.6, s > 0 ? 0.6 : Math.PI + 0.6, 8), `bw${s}${i}`, { w: 1.3, a: ring }); }
}
function coil(t) {
  if (!near(430, -650, 600)) return;
  const n = 30, a = P.coilA, b = P.coilB, pts = [];
  for (let i = 0; i <= n * 10; i++) { const k = i / (n * 10), th = k * n * TAU; pts.push([lerp(a[0], b[0], k) + Math.sin(th) * 15, lerp(a[1], b[1], k) + 24 - Math.cos(th) * 20]); }
  ink(pts, 'coil', { w: 2.1, col: OX, poly: true });
  // the pole that holds the line up, a bird on it, and a sign nobody reads
  const px = 470, py = -530; ink([[px, py + 16], [px - 8, py + 300]], 'pole', { w: 4, col: TAN }); ink([[px - 44, py + 44], [px + 44, py + 28]], 'poleX', { w: 3, col: TAN });
  blob(circ(px - 30, py + 26, 16, 11), '#3b3550', 'cr', 1.4); dot(px - 42, py + 18, 6, '#3b3550'); ink([[px - 47, py + 18], [px - 58, py + 22]], 'crb', { w: 1.5, col: '#e39b2d' });
  shape(box(150, -610, 168, 62), PAPER, 'hold', 1.8); ink([[234, -548], [234, -400]], 'holdp', { w: 2.4 }); label('PLEASE', 234, -595, 23, RED); label('HOLD', 234, -565, 23, RED);
}
function striker(t) {
  if (!near(850, -760, 600)) return;
  const x = 852, y0 = -430, y1 = -1080;
  // tower, stripes, the scale
  shape(box(x - 44, y1, 88, y0 - y1), PAPER, 'tw', 2.2);
  for (let i = 0; i < 7; i++) { const yy = y1 + 30 + i * 90; shape(box(x - 44, yy, 88, 44), i % 2 ? RED : GILT, 'st' + i, 1); }
  // bell on top, rings on pass 2
  const ring = pulse(t, TIMES[1].urg, 1.3);
  blob(circ(x + Math.sin(t * 70) * 6 * ring, y1 - 30, 34, 30, Math.PI, TAU, 14).concat([[x + 34, y1 - 20], [x - 34, y1 - 20], [x - 34, y1 - 30]]), GILT, 'tbell', 2.2);
  if (ring > 0.02) for (let i = 0; i < 10; i++) { const a = i * TAU / 10 + 0.3; ink([[x + Math.cos(a) * 54, y1 - 44 + Math.sin(a) * 54], [x + Math.cos(a) * (88 + ring * 34), y1 - 44 + Math.sin(a) * (88 + ring * 34)]], 'tr' + i, { col: RED, w: 2.4 }); }
  // the sign, and the marks the ball reaches
  shape(box(x + 62, y1 - 72, 226, 60), GILT, 'sign', 2); label('HOW URGENT?', x + 175, y1 - 41, 27);
  [[-1000, 'VERY'], [-880, 'QUITE'], [-760, 'A BIT'], [-600, 'NOT REALLY']].forEach(([yy, s], i) => { ink([[x + 44, yy], [x + 66, yy]], 'mk' + i, { w: 1.6 }); label(s, x + 72, yy, 23, INK, 0, 'left'); });
  // pad: kicks on launch
  const kick = TIMES.reduce((m, c) => Math.max(m, pulse(t, c.whats - 0.03, 0.22)), 0);
  shape(box(x - 70, y0 - 10 + kick * 10, 140, 16), OX, 'pad', 1.8); shape(box(x - 90, y0 + 16, 180, 22), TAN, 'pbase', 1.8);
  for (const lx of [-72, 58]) shape(box(x + lx, y0 + 38, 14, 90), TAN, 'pl' + lx, 1.4);
  // a tired carnival pennant string
  ink([[x - 44, y1 + 6], [x - 240, y1 + 90]], 'pen0', { w: 1.2 }); for (let i = 0; i < 6; i++) { const kk = (i + 0.5) / 6, px = lerp(x - 44, x - 240, kk), py = lerp(y1 + 6, y1 + 90, kk) + 2; shape([[px - 12, py], [px + 12, py], [px, py + 26], [px - 12, py]], i % 2 ? RED : GILT, 'pn' + i, 1); }
}
function doghouse(t) {
  if (!near(1100, -30, 500)) return;
  const x = 1150, y = 40;
  shape([[x - 95, y], [x - 95, y - 110], [x + 95, y - 110], [x + 95, y], [x - 95, y]], OX, 'dh', 2.2); shape([[x - 118, y - 104], [x, y - 186], [x + 118, y - 104], [x - 118, y - 104]], TAN, 'dhr', 2.2);
  hatch(x - 92, y - 104, 180, 100, 'dhh', 16, 0.4);
  blob(circ(x - 40, y - 2, 44, 68, Math.PI, TAU, 16).concat([[x + 4, y - 2], [x - 84, y - 2]]), '#2c2522', 'dhd', 1.6);
  label('BEWARE', x + 48, y - 76, 18, PAPER, 0);
  shape(box(x - 118, y, 250, 14), TAN, 'dhf', 1.6);
  // bone and bowl
  ink([[x + 104, y - 8], [x + 132, y - 12]], 'bone', { w: 3, col: PAPER }); dot(x + 104, y - 11, 4, PAPER); dot(x + 132, y - 8, 4, PAPER);
  // the dog: asleep inside until the ball hits its nose, then springs out barking, on each pass
  let out = 0; TIMES.forEach((c) => { out = Math.max(out, ease(seg(t, c.animal - 0.1, c.animal + 0.02)) * (1 - ease(seg(t, c.animal + 1.1, c.animal + 1.6)))); });
  const dx = x - 44 - out * 64, dy = y - 38 - out * 8, wob = Math.sin(t * 22) * 3 * out;
  blob(circ(dx + 8, dy + 12, 48, 26), PAPER, 'dgb', 1.8);
  blob(circ(dx - 28, dy - 8 + wob, 28, 25), PAPER, 'dgh', 1.8);
  blob([[dx - 50, dy - 4 + wob], [dx - 86, dy + 4 + wob], [dx - 84, dy + 16 + wob], [dx - 42, dy + 12 + wob]], PAPER, 'dgs', 1.6); dot(dx - 86, dy + 6 + wob, 6.5);
  blob(circ(dx - 8, dy - 2 + wob, 11, 24), TAN, 'dge', 1.5);
  if (out > 0.5) { dot(dx - 38, dy - 16 + wob, 5); dot(dx - 37, dy - 18 + wob, 1.6, PAPER); ink([[dx - 86, dy + 16 + wob], [dx - 56, dy + 26 + wob]], 'dgm', { w: 1.6 }); }
  else ink([[dx - 46, dy - 14], [dx - 34, dy - 12]], 'dgz', { w: 1.6 });
  if (out > 0.8) { label('WOOF', dx - 146, dy - 50, 32, INK, -0.14); for (let i = 0; i < 3; i++) ink([[dx - 92, dy - 4 + i * 8], [dx - 112, dy - 16 + i * 14]], 'bk' + i, { w: 1.6 }); }
}
function jars(t) {
  if (!near(880, 240, 500)) return;
  // the shelf of plagues; the middle jar goes over on the word, on each pass
  shape(box(740, 258, 340, 16), TAN, 'jsh', 2); for (const lx of [770, 1040]) ink([[lx, 274], [lx, 322], [lx + 32, 274]], 'jb' + lx, { w: 1.8, poly: true });
  const J = (x, name, tip, tag) => {
    X.save(); X.translate(x, 258); X.rotate(tip);
    blob([[-34, 0], [-38, -80], [-26, -92], [26, -92], [38, -80], [34, 0], [-34, 0]], GLASS, tag, 1.8); shape(box(-29, -108, 58, 16), GILT, tag + 'l', 1.4); shape(box(-29, -62, 58, 34), PAPER, tag + 'p', 1); label(name, 0, -45, name.length > 5 ? 13 : 15);
    X.restore();
  };
  J(792, 'FROGS', 0, 'jA');
  let tip = 0; TIMES.forEach((c) => { tip = Math.max(tip, ease(seg(t, c.pest - 0.05, c.pest + 0.18)) * (1 - ease(seg(t, c.pest + 2.2, c.pest + 3)))); });
  J(922, 'LOCUSTS', tip * -1.45, 'jB');
  J(1036, 'BOILS', 0, 'jC');
}
function swarm(t, ball) { // locusts stream out after the ball on the word and thin as it runs
  TIMES.forEach((c, p) => {
    const a = t - c.pest; if (a < 0 || a > (p ? 3.1 : 2.6)) return;
    const n = p ? 34 : 22;
    for (let i = 0; i < n; i++) {
      const r0 = rng('nomad' + i + p), b = i * 2.4, o = 32 + (i % 9) * 11 + Math.sin(a * 5 + i) * 18, late = (i % 7) * 0.05;
      const [hx, hy] = ballAt(t - late - 0.05);
      const f = clamp(1 - (a - 1.6) / 1), x = hx + Math.cos(b + a * 6) * o, y = hy + Math.sin(b * 1.3 + a * 7) * o * 0.7;
      if (f <= 0 || a < late) continue;
      X.globalAlpha = Math.min(1, f + 0.15); dot(x, y, 2.8); ink([[x - 7, y - 4], [x, y], [x + 7, y - 4]], `lw${i}`, { w: 0.7 }); X.globalAlpha = 1;
    }
  });
}
function firetruck(x, tag = 'ft') {
  if (!near(x, P.road)) return; const y = P.road;
  shape(box(x - 110, y - 74, 170, 58), RED, tag + 'b', 2.2); shape([[x + 60, y - 16], [x + 60, y - 104], [x + 112, y - 104], [x + 134, y - 56], [x + 134, y - 16], [x + 60, y - 16]], RED, tag + 'c', 2.2); shape(box(x + 76, y - 94, 34, 32), GLASS, tag + 'w', 1.4);
  ink([[x - 112, y - 88], [x + 52, y - 106]], tag + 'l1', { w: 1.7 }); ink([[x - 112, y - 76], [x + 52, y - 94]], tag + 'l2', { w: 1.7 }); for (let i = 0; i < 9; i++) ink([[x - 104 + i * 18, y - 88 - i * 2], [x - 104 + i * 18, y - 76 - i * 2]], tag + 'r' + i, { w: 1 });
  blob(circ(x + 90, y - 112, 10, 8, Math.PI, TAU, 8).concat([[x + 80, y - 112]]), Math.floor(T * 8) % 2 ? '#ff5a3c' : GILT, tag + 'lt', 1.2);
  for (const lx of [-76, 92]) { blob(circ(x + lx, y - 14, 20), '#2c2522', tag + 'wh' + lx, 1.6); dot(x + lx, y - 14, 8, PAPER); }
  label('NO.9', x - 28, y - 44, 22, PAPER);
}
function ambulance(x, tag = 'am') {
  if (!near(x, P.road)) return; const y = P.road;
  shape(box(x - 108, y - 110, 160, 94), PAPER, tag + 'b', 2.2); shape([[x + 52, y - 16], [x + 52, y - 90], [x + 96, y - 90], [x + 118, y - 52], [x + 118, y - 16], [x + 52, y - 16]], PAPER, tag + 'c', 2.2); shape(box(x + 62, y - 82, 28, 28), GLASS, tag + 'w', 1.3);
  shape(box(x - 44, y - 92, 22, 58), RED, tag + 'cv', 1); shape(box(x - 62, y - 74, 58, 22), RED, tag + 'ch', 1);
  blob(circ(x - 76, y - 110, 10, 8, Math.PI, TAU, 8).concat([[x - 86, y - 110]]), Math.floor(T * 8) % 2 ? '#ff5a3c' : '#cfe0da', tag + 'lt', 1.2);
  for (const lx of [-70, 80]) { blob(circ(x + lx, y - 14, 20), '#2c2522', tag + 'wh' + lx, 1.6); dot(x + lx, y - 14, 8, PAPER); }
}
function street(t) {
  if (!near(0, P.road, 900)) return; const y = P.road;
  ink([[-1000, y + 8], [640, y + 8]], 'road', { w: 3 }); for (let i = 0; i < 16; i++) ink([[-960 + i * 100, y + 34], [-910 + i * 100, y + 34]], 'dash' + i, { w: 2, col: GREY });
  // a town that never looks up
  [[-620, 200, 120], [-480, 130, 90], [-370, 240, 100], [-230, 150, 110]].forEach(([bx, bh, bw], i) => { shape(box(bx, y - bh - 60, bw, bh), i % 2 ? GILT : GLASS, 'tn' + i, 1.5); for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) { const hh = y - bh - 42 + r * 28; if (hh < y - 74) shape(box(bx + 12 + c * (bw / 3 - 2), hh, 14, 16), (r + c * 3 + i) % 4 ? PAPER : LAMP, `w${i}${r}${c}`, 0.7); } });
  // hydrant and a lamp
  shape(box(240, y - 34, 26, 40), RED, 'hyd', 1.6); blob(circ(253, y - 36, 15, 10, Math.PI, TAU, 8).concat([[238, y - 36]]), RED, 'hyt', 1.2);
  ink([[150, y + 6], [150, y - 170], [190, y - 180]], 'lamp', { w: 2.4 }); blob(circ(198, y - 170, 15), LAMP, 'lampg', 1.4);
  shape(box(538, y - 170, 86, 56), PAPER, 'sign2', 1.8); ink([[580, y - 114], [580, y + 6]], 'sgp', { w: 2.4 }); label('STATION', 581, y - 150, 17); label('OPEN', 581, y - 130, 17, RED);
}
function tube(t) {
  if (!near(-900, -100, 1600)) return;
  const pts = TUBE.filter((_, i) => i % 3 === 0);
  ink(pts.map(([x, y]) => [x - 19, y]), 'tb1', { w: 2 }); ink(pts.map(([x, y]) => [x + 19, y]), 'tb2', { w: 2 });
  for (let i = 3; i < TUBE.length - 3; i += 6) { const [x, y] = TUBE[i]; ink([[x - 22, y], [x + 22, y]], 'tbc' + i, { w: 2.6, col: GILT }); }
  blob(circ(P.tubeIn[0], P.tubeIn[1], 42, 26, Math.PI, TAU, 10).concat([[P.tubeIn[0] + 42, P.tubeIn[1]], [P.tubeIn[0] + 42, P.tubeIn[1] + 16], [P.tubeIn[0] - 42, P.tubeIn[1] + 16], [P.tubeIn[0] - 42, P.tubeIn[1]]]), GILT, 'tbm', 1.8);
  label('IN CASE OF', P.tubeIn[0] - 138, P.tubeIn[1] - 16, 20, INK, 0); label('EMERGENCY', P.tubeIn[0] - 138, P.tubeIn[1] + 10, 20, RED, 0);
  ink([[P.tubeOut[0] - 34, P.tubeOut[1]], [P.tubeOut[0] + 34, P.tubeOut[1]]], 'tbo', { w: 3.2, col: GILT });
}
function house(t) { // she's in there. Nothing ever reaches it.
  const x = 40, y = 120, s = 2.5;
  X.save(); X.globalAlpha = 0.17 + Math.sin(t * 1.3) * 0.02; const g = X.createRadialGradient(x, y - 90 * s, 10, x, y - 90 * s, 420); g.addColorStop(0, LAMP); g.addColorStop(1, 'rgba(255,211,107,0)'); X.fillStyle = g; X.beginPath(); X.arc(x, y - 90 * s, 420, 0, TAU); X.fill(); X.restore();
  shape(box(x - 74 * s, y - 104 * s, 148 * s, 104 * s), PAPER, 'hsb', 2.6); shape([[x - 92 * s, y - 100 * s], [x, y - 168 * s], [x + 92 * s, y - 100 * s], [x - 92 * s, y - 100 * s]], OX, 'hsr', 2.6);
  shape(box(x - 34 * s, y - 86 * s, 46 * s, 40 * s), LAMP, 'hsw', 2.4); ink([[x - 11 * s, y - 86 * s], [x - 11 * s, y - 46 * s]], 'hsw1', { w: 2 }); ink([[x - 34 * s, y - 66 * s], [x + 12 * s, y - 66 * s]], 'hsw2', { w: 2 });
  shape(box(x + 26 * s, y - 56 * s, 28 * s, 56 * s), OX, 'hsd', 2); dot(x + 32 * s, y - 28 * s, 4.5, GILT);
  ink([[x - 260, y + 3], [x + 300, y + 3]], 'hsg', { w: 2.4 });
  hatch(x - 74 * s + 3, y - 42 * s, 60, 40 * s, 'hsh', 12, 0.35);
}
function ballDraw(t) {
  const [x, y] = ballAt(t), [px, py] = ballAt(t - 0.05), v = Math.hypot(x - px, y - py) / 0.05, r = 21;
  if (v > 620) { const n = Math.hypot(x - px, y - py) || 1, ux = (x - px) / n, uy = (y - py) / n; for (const o of [-10, 0, 10]) ink([[x - ux * 28 - uy * o, y - uy * 28 + ux * o], [x - ux * (28 + Math.min(90, v / 20)) - uy * o, y - uy * (28 + Math.min(90, v / 20)) + ux * o]], 'sp' + o, { w: 1.3 }); }
  blob(circ(x, y - 3, r), BALL, 'ball', 2); dot(x - 7, y - 10, 4, '#dfeaf0');
}

// ---------- words: written on where the camera is; second pass in red under the first ----------
function letter(li, x, y, rot, col, size) {
  const l = C.lines[li]; if (T < l.words[0].t - 0.05) return;
  X.save(); X.translate(x, y); X.rotate(rot); X.font = `${size}px KevinSans`; X.fillStyle = col; X.textBaseline = 'alphabetic';
  let cx = 0; const sp = X.measureText(' ').width || size * 0.28;
  for (const w of l.words) {
    const ww = X.measureText(w.w).width, k = seg(T, w.t - 0.04, w.t + 0.24);
    if (k > 0) { X.save(); X.beginPath(); X.rect(cx - 2, -size * 1.2, (ww + 4) * k, size * 1.7); X.clip(); X.fillText(w.w, cx, 0); X.restore(); }
    cx += ww + sp;
  }
  X.restore();
}
const SPOTS = [[-310, -700, -0.03], [385, -815, 0.02], [545, 60, -0.03], [-90, 640, 0.02]];

// ---------- the frame ----------
function paper() {
  X.fillStyle = PAPER; X.fillRect(0, 0, W, H);
  const r = LLPen.makeRng(11); X.globalAlpha = 0.05; X.fillStyle = '#5a4a38';
  for (let i = 0; i < 2600; i++) X.fillRect(r() * W, r() * H, 1.4, 1.4);
  X.globalAlpha = 1;
}
function draw(t) {
  const c = camAt(t), sway = Math.sin(t * 0.6) * 5;
  X.save(); X.translate(W / 2 + sway, H / 2); X.scale(c.z, c.z); X.translate(-c.x, -c.y);
  VIEW = [c.x - W / 2 / c.z, c.y - H / 2 / c.z, c.x + W / 2 / c.z, c.y + H / 2 / c.z];
  house(t); tube(t); street(t);
  plank([P.start, P.shelfEnd], 'shelf'); deskScene(t); phone(t); alarmBell(t); coil(t); striker(t);
  plank(P.sw, 'sw'); doghouse(t); plank([P.perch, [1040, 250]], 'pc'); jars(t); plank(P.z, 'z');
  firetruck(truckX(t)); ambulance(ambX(t));
  ballDraw(t); swarm(t);
  for (let li = 0; li < C.lines.length; li++) { const [x, y, r] = SPOTS[li % 4], p2 = li >= 4; letter(li, x, p2 ? y + 48 : y, r, p2 ? RED : INK, 36); }
  X.restore();
}

window.drawFrame = (t) => { T = t; SEED = Math.floor(t * 12) + 1; paper(); draw(t); };
window.setup = async () => {
  C = window.CUES; const c = document.getElementById('c'); c.width = W; c.height = H; X = c.getContext('2d');
  buildLegs(); await document.fonts.load('30px KevinSans'); return window.__legs;
};
// Shutter only on fast camera moves: a few samples of the same held drawing, averaged. Never on still shots.
window.__frameJPEG = (t, q = 0.92) => {
  const cv = document.getElementById('c'), a = camAt(t), b = camAt(t + 1 / 24), speed = Math.hypot(a.x - b.x, a.y - b.y) * a.z;
  if (speed < 34) { window.drawFrame(t); return cv.toDataURL('image/jpeg', q); }
  const off = document.createElement('canvas'); off.width = W; off.height = H; const o = off.getContext('2d'), n = 8, seed = Math.floor(t * 12) + 1;
  for (let i = 0; i < n; i++) { const ts = t + (i / n) * 0.5 / 24; T = ts; SEED = seed; paper(); draw(ts); o.globalAlpha = 1 / (i + 1); o.drawImage(cv, 0, 0); }
  return off.toDataURL('image/jpeg', q);
};

// Rube Goldberg lyric machine: a marble runs one machine; each sung line is hand-lettered beside the part it
// describes, on its word times. After Kevin Ngo's day machine (references/kevin-ngo K30), on Bob's 911 verse.
// drawFrame(t) is pure. Lines come from window.CUES (work/cues.js, gitignored: it quotes the lyrics).
// Every mark is a Looseleaf pen stroke; drawings held on twos and reseeded per drawing so the lines boil.
'use strict';
const W = 1280, H = 720, TAU = Math.PI * 2;
const INK = '#2a2320', CREAM = '#f1e8d6', RED = '#cf3a2c', GILT = '#c79d45', OX = '#6b2328', LAMP = '#ffd36b', PENCIL = '#8d8478';
const TABLE = 520, FLOOR = 600;
let X = null, C = null, SEED = 1, T = 0;

// ---------- utils ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = (k) => { k = clamp(k); return k * k * (3 - 2 * k); };
const seg = (t, a, b) => clamp((t - a) / (b - a));
const pulse = (t, a, d = 0.35) => (t < a || t > a + d ? 0 : Math.sin(Math.PI * (t - a) / d));
// piecewise path through keyed [t, x, y] points, eased per leg
function track(keys, t) {
  if (t <= keys[0][0]) return keys[0].slice(1);
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
    const [t0, x0, y0] = keys[i - 1], [t1, x1, y1] = keys[i], k = (t - t0) / (t1 - t0);
    return [lerp(x0, x1, k), lerp(y0, y1, k)];
  }
  return keys[keys.length - 1].slice(1);
}
function smoothTrack(keys, t) { // eased between keys, for the camera
  if (t <= keys[0][0]) return keys[0].slice(1);
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
    const a = keys[i - 1], b = keys[i], k = ease((t - a[0]) / (b[0] - a[0]));
    return a.slice(1).map((v, j) => lerp(v, b[j + 1], k));
  }
  return keys[keys.length - 1].slice(1);
}
function word(li, wi) { return C.lines[li].words[wi].t; }

// ---------- pen ----------
function rng(tag) { let h = 2166136261 ^ SEED; for (const c of String(tag)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return LLPen.makeRng(h >>> 0); }
function ink(pts, tag, { col = INK, w = 1.6, pen = 'ink', poly = false, a = 1 } = {}) {
  if (pts.length < 2) return;
  const r = LLPen.stroke(pts, pen, rng(tag), { width: w, wobble: 1.1, tier: 'hi', poly, round: 2 });
  X.save(); X.fillStyle = col;
  for (const L of r.layers) { X.globalAlpha = Math.min(1, L.op * a); X.fill(new Path2D(L.d), L.rule || 'nonzero'); }
  X.restore();
}
function pencil(pts, tag, a = 0.7) { ink(pts, tag, { pen: 'pencil', col: PENCIL, w: 1.2, a }); }
function crayon(path, col, tag, a = 0.95) {
  X.save(); X.translate(1.5, 1); X.globalAlpha = a * 0.85; X.fillStyle = col; X.fill(path);
  X.clip(path); const r = rng(tag + 'c'); X.globalAlpha = 0.3; X.strokeStyle = col; X.lineWidth = 2.2; X.beginPath();
  for (let k = -900; k < 900; k += 5) { const o = k + (r() - 0.5) * 2; X.moveTo(o - 400, -400); X.lineTo(o + 400, 1200); }
  X.stroke(); X.restore();
}
const circ = (cx, cy, rx, ry = rx, a0 = 0, a1 = TAU, n = 28) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
const box = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
const pathOf = (pts) => { const p = new Path2D(); pts.forEach((q, i) => (i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1]))); p.closePath(); return p; };
function shape(pts, fill, tag, w = 1.6) { if (fill) crayon(pathOf(pts), fill, tag); ink(pts, tag + 'o', { w, poly: true }); }
function dot(x, y, r, col = INK) { X.fillStyle = col; X.beginPath(); X.arc(x, y, r, 0, TAU); X.fill(); }

// ---------- lettering: a line written on word by word ----------
function letter(li, x, y, rot, col, size = 30) {
  const L = C.lines[li]; if (T < L.words[0].t - 0.05) return;
  X.save(); X.translate(x, y); X.rotate(rot); X.font = `${size}px KevinSans`; X.fillStyle = col; X.textBaseline = 'alphabetic';
  let cx = 0; const sp = X.measureText(' ').width || size * 0.28;
  for (const w of L.words) {
    const txt = w.w, ww = X.measureText(txt).width, k = seg(T, w.t - 0.04, w.t + 0.22);
    if (k > 0) { X.save(); X.beginPath(); X.rect(cx - 2, -size * 1.2, (ww + 4) * k, size * 1.6); X.clip(); X.fillText(txt, cx, 0); X.restore(); }
    cx += ww + sp;
  }
  X.restore();
}

// ---------- the machine ----------
function table() {
  pencil([[-200, TABLE], [2350, TABLE]], 'tabletop', 0.9);
  ink([[-200, TABLE], [2330, TABLE]], 'tableink', { w: 1.8 });
  for (const lx of [40, 1000, 2050]) ink([[lx, TABLE], [lx + 4, FLOOR]], 'leg' + lx, { w: 2.4 });
  pencil([[-400, FLOOR], [3400, FLOOR]], 'floor', 0.8);
}
// rotary phone with a dial that spins on three key hits and a beacon on top
function phone(t, hits, beaconAt) {
  const x = 330, y = TABLE;
  shape([[x - 80, y], [x - 60, y - 70], [x + 60, y - 70], [x + 80, y]], RED, 'phbody');
  shape([[x - 70, y - 78], [x - 50, y - 96], [x + 50, y - 96], [x + 70, y - 78], [x + 52, y - 84], [x - 52, y - 84]], RED, 'handset', 1.5);
  // dial: rotation from the three hits (9 spins far, each 1 spins a little), springing back
  let ang = 0;
  hits.forEach((h, i) => { const far = i === 0 ? 4.4 : 0.9, k = t - h; if (k > 0 && k < 0.9) ang += k < 0.3 ? far * ease(k / 0.3) : far * (1 - ease((k - 0.3) / 0.6)); });
  const dx = x, dy = y - 34;
  shape(circ(dx, dy, 30), CREAM, 'dial', 1.4);
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 3 + ang + i * (TAU * 0.8 / 10); ink(circ(dx + Math.cos(a) * 21, dy + Math.sin(a) * 21, 5, 5, 0, TAU, 10), 'hole' + i, { w: 1.0 }); }
  dot(dx, dy, 4);
  // beacon
  const on = beaconAt.some((b) => t > b && t < b + 1.4), fl = on && Math.floor(t * 8) % 2 === 0;
  shape(circ(x, y - 104, 12, 10, Math.PI, TAU, 14).concat([[x + 12, y - 104]]), fl ? '#ff5a3c' : '#9d2a22', 'beacon', 1.3);
  if (fl) for (let i = 0; i < 6; i++) { const a = Math.PI + 0.25 + i * 0.5; ink([[x + Math.cos(a) * 18, y - 104 + Math.sin(a) * 16], [x + Math.cos(a) * 34, y - 104 + Math.sin(a) * 30]], 'bray' + i, { col: RED, w: 1.4 }); }
}
function keys(t, hits) { // three keys above the dial, pressed by the marble
  [[220, 395], [262, 410], [304, 425]].forEach(([kx, ky], i) => {
    const d = pulse(t, hits[i] - 0.02, 0.3) * 6;
    shape(box(kx - 16, ky + d, 32, 9), CREAM, 'key' + i, 1.3);
    ink([[kx, ky + 9 + d], [kx + 2, TABLE - 60]], 'keyrod' + i, { w: 1.0 });
    X.save(); X.font = '15px KevinSans'; X.fillStyle = INK; X.fillText(i ? '1' : '9', kx - 4, ky - 4 + d); X.restore();
  });
  pencil([[110, 330], [210, 382], [252, 398], [296, 413], [350, 433]], 'ramp1');
  ink([[110, 338], [350, 441]], 'ramp1ink', { w: 1.4 });
}
function cord(t, a, b) { // coiled cord from the phone to the switchboard; a red pulse runs along it
  const pts = []; const x0 = 410, x1 = 845;
  for (let i = 0; i <= 80; i++) { const k = i / 80, x = lerp(x0, x1, k), y = TABLE - 12 - Math.sin(k * Math.PI) * 30 + Math.sin(i * 1.7) * 4; pts.push([x, y]); }
  ink(pts, 'cord', { w: 1.3 });
  for (const [s, e] of [a, b]) { const k = seg(t, s, e); if (k > 0 && k < 1) { const p = pts[Math.round(k * 80)]; dot(p[0], p[1], 7, RED); dot(p[0], p[1], 3, LAMP); } }
}
function switchboard(t, plugAt, lampAt) {
  const x = 860, y = TABLE;
  shape(box(x, y - 190, 150, 190), GILT, 'sb', 1.7);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) ink(circ(x + 32 + c * 43, y - 150 + r * 34, 6, 6, 0, TAU, 10), `jack${r}${c}`, { w: 1.0 });
  // plug: rests below, jumps into the middle jack, each pass
  let up = 0; plugAt.forEach((p) => { up = Math.max(up, ease(seg(t, p - 0.15, p + 0.1)) * (t < p + 4 ? 1 : 1 - ease(seg(t, p + 4, p + 4.6)))); });
  const px = x + 75, py = lerp(y - 18, y - 116, up);
  ink([[x + 75, y - 4], [x + 60 - 20 * up, y - 40], [px, py + 14]], 'plugcord', { w: 1.2, col: RED });
  shape(box(px - 5, py, 10, 16), INK, 'plug', 1.0);
  // question lamp above, lit on "urgency?"
  const lit = lampAt.some((l) => t > l && t < l + 1.8);
  shape(circ(x + 75, y - 214, 18), lit ? LAMP : CREAM, 'qlamp', 1.4);
  X.save(); X.font = '26px KevinSans'; X.fillStyle = lit ? RED : PENCIL; X.fillText('?', x + 68, y - 205); X.restore();
  if (lit) for (let i = 0; i < 8; i++) { const a = i * TAU / 8; ink([[x + 75 + Math.cos(a) * 24, y - 214 + Math.sin(a) * 24], [x + 75 + Math.cos(a) * 34, y - 214 + Math.sin(a) * 34]], 'qr' + i, { col: GILT, w: 1.2 }); }
}
function dog(x, y, jump) { // wind-up dog
  const j = -jump * 30;
  shape(circ(x, y - 16 + j, 22, 12), CREAM, 'dogb', 1.4);
  shape(circ(x + 20, y - 28 + j, 10, 9), CREAM, 'dogh', 1.3);
  ink([[x + 16, y - 36 + j], [x + 14, y - 48 + j], [x + 22, y - 37 + j]], 'dogear', { w: 1.2, poly: true });
  dot(x + 23, y - 30 + j, 2); dot(x + 30, y - 27 + j, 2.4);
  for (const lx of [-12, 12]) ink([[x + lx, y - 6 + j], [x + lx + (jump ? 5 : 0), y + j * 0.2]], 'dogl' + lx, { w: 1.4 });
  ink([[x - 4, y - 28 + j], [x - 4, y - 38 + j], [x - 12, y - 42 + j], [x + 4, y - 42 + j]], 'key', { w: 1.2, col: GILT });
}
function jar(x, y, buzz, t) {
  shape([[x - 22, y], [x - 24, y - 52], [x - 16, y - 60], [x + 16, y - 60], [x + 24, y - 52], [x + 22, y]], 'rgba(205,225,220,0.5)', 'jar', 1.3);
  shape(box(x - 18, y - 70, 36, 10), GILT, 'lid', 1.1);
  const n = 5;
  for (let i = 0; i < n; i++) {
    const out = buzz * (i % 2 ? 1 : 0.6), a = t * 9 + i * 1.7, fx = x + Math.sin(a) * (10 + out * 30), fy = y - 30 + Math.cos(a * 1.3) * 12 - out * 60;
    dot(fx, fy, 2.2); ink([[fx - 4, fy - 3], [fx, fy], [fx + 4, fy - 3]], 'fly' + i, { w: 0.8 });
  }
}
function sorter(t, animalAt, pestAt) {
  const x = 1400, y = TABLE;
  ink([[1330, y - 150], [1400, y - 110]], 'chuteL', { w: 1.4 }); ink([[1470, y - 150], [1400, y - 110]], 'chuteR', { w: 1.4 });
  ink([[1385, y - 104], [1385, y - 30]], 'mid1', { w: 1.3 }); ink([[1415, y - 104], [1415, y - 30]], 'mid2', { w: 1.3 });
  // flipper: swings to the dog on "animal", to the jar on "pestilence", back to the middle
  let a = 0; animalAt.forEach((s, i) => { a += -0.6 * ease(seg(t, s - 0.1, s + 0.15)) * (1 - ease(seg(t, pestAt[i] - 0.1, pestAt[i] + 0.1))); a += 0.6 * ease(seg(t, pestAt[i] - 0.1, pestAt[i] + 0.15)) * (1 - ease(seg(t, pestAt[i] + 1.2, pestAt[i] + 1.6))); });
  const fx = x, fy = y - 112;
  ink([[fx - Math.cos(a) * 34, fy - Math.sin(a) * 34], [fx + Math.cos(a) * 34, fy + Math.sin(a) * 34]], 'flip', { w: 2.6, col: RED });
  dot(fx, fy, 4, INK);
  let jump = 0, buzz = 0; animalAt.forEach((s) => { jump = Math.max(jump, pulse(t, s, 0.55)); }); pestAt.forEach((s) => { buzz = Math.max(buzz, pulse(t, s, 1.2)); });
  dog(1290, y, jump); jar(1515, y, buzz, t);
}
function seesaw(t, ftAt, amAt) {
  const x = 1800, y = TABLE;
  let tilt = 0; [...ftAt, ...amAt].forEach((s) => { tilt = Math.max(tilt, pulse(t, s - 0.1, 0.4)); });
  const a = -0.22 + tilt * 0.4;
  shape([[x - 10, y], [x, y - 22], [x + 10, y]], CREAM, 'fulcrum', 1.3);
  ink([[x - Math.cos(a) * 90, y - 22 - Math.sin(a) * 90], [x + Math.cos(a) * 90, y - 22 + Math.sin(a) * 90]], 'plank', { w: 3, col: OX });
  pencil([[1890, TABLE - 8], [2050, TABLE - 2]], 'launchrun');
}
function firetruck(x, y, s = 1) {
  shape(box(x - 34 * s, y - 26 * s, 68 * s, 20 * s), RED, 'ftb', 1.4);
  shape(box(x + 12 * s, y - 40 * s, 20 * s, 15 * s), RED, 'ftcab', 1.2);
  ink([[x - 30 * s, y - 32 * s], [x + 8 * s, y - 42 * s]], 'ladder', { w: 1.4 });
  for (let i = 0; i < 5; i++) ink([[x - 26 * s + i * 8 * s, y - 32 * s - i * 2 * s], [x - 24 * s + i * 8 * s, y - 37 * s - i * 2 * s]], 'rung' + i, { w: 0.9 });
  for (const wx of [-20, 22]) { dot(x + wx * s, y - 4 * s, 7 * s); dot(x + wx * s, y - 4 * s, 2.5 * s, CREAM); }
}
function ambulance(x, y, s = 1) {
  shape(box(x - 32 * s, y - 34 * s, 64 * s, 28 * s), CREAM, 'amb', 1.4);
  shape(box(x - 4 * s, y - 28 * s, 8 * s, 18 * s), RED, 'crossv', 0.8); shape(box(x - 10 * s, y - 22 * s, 20 * s, 6 * s), RED, 'crossh', 0.8);
  dot(x - 20 * s, y - 37 * s, 3.5 * s, RED);
  for (const wx of [-18, 20]) { dot(x + wx * s, y - 4 * s, 7 * s); dot(x + wx * s, y - 4 * s, 2.5 * s, CREAM); }
}
function house(x, y, lit) {
  shape(box(x - 60, y - 90, 120, 90), CREAM, 'hb', 1.6);
  shape([[x - 72, y - 88], [x, y - 150], [x + 72, y - 88]], OX, 'roof', 1.6);
  shape(box(x - 18, y - 70, 36, 32), lit ? LAMP : '#4a4440', 'win', 1.3);
  ink([[x, y - 70], [x, y - 38]], 'winbar', { w: 1.0 }); ink([[x - 18, y - 54], [x + 18, y - 54]], 'winbar2', { w: 1.0 });
  shape(box(x + 22, y - 44, 18, 44), OX, 'door', 1.2);
  if (lit) { X.save(); X.globalAlpha = 0.18; X.fillStyle = LAMP; X.beginPath(); X.arc(x, y - 54, 60, 0, TAU); X.fill(); X.restore(); }
}

// ---------- the run ----------
function draw(t) {
  // word times (film seconds)
  const tap = (li) => C.lines[li].taps.slice(0, 3), nine = [word(0, 0), word(4, 0)], d1 = [tap(0), tap(4)];
  const emer = [C.lines[0].taps[3], C.lines[4].taps[3]], whats = [word(1, 0), word(5, 0)], urg = [word(1, 2), word(5, 2)];
  const animal = [word(2, 0), word(6, 0)], pest = [word(2, 2), word(6, 2)], ft = [word(3, 0), word(7, 0)], am = [word(3, 2), word(7, 2)];
  const P2 = word(4, 0) - 0.9; // pass 2 begins when the loop brings the truck back
  // camera
  const [cx, cz] = smoothTrack([[0, 300, 1.12], [2.8, 400, 1.08], [4.6, 820, 1.0], [8.0, 1180, 1.0], [11.5, 1420, 1.0], [14.0, 1820, 1.0], [15.8, 2000, 0.96],
    [P2 - 0.2, 560, 1.0], [P2 + 0.9, 330, 1.1], [P2 + 3.6, 420, 1.06], [P2 + 5.4, 830, 1.0], [P2 + 8.6, 1180, 1.0], [P2 + 11.8, 1420, 1.0], [P2 + 14.0, 1820, 0.98],
    [P2 + 15.4, 2150, 0.94], [P2 + 17.2, 2620, 0.92], [99, 2680, 0.92]], t);
  const dx = Math.sin(t * 0.7) * 6, dy = Math.sin(t * 0.53 + 1) * 4;
  X.save(); X.translate(W / 2 + dx, H * 0.5 + dy); X.scale(cz * 2.0, cz * 2.0); X.translate(-cx, -442);
  table();
  phone(t, [...d1[0], ...d1[1]], emer);
  keys(t, t < P2 ? d1[0] : d1[1]);
  cord(t, [emer[0] + 0.5, whats[0] - 0.1], [emer[1] + 0.5, whats[1] - 0.1]);
  switchboard(t, whats, urg);
  pencil([[1000, TABLE - 120], [1330, TABLE - 152]], 'chute2');
  sorter(t, animal, pest);
  pencil([[1415, TABLE - 30], [1720, TABLE - 40]], 'chute3');
  seesaw(t, ft, am);
  // floor: the loop back under the table (pass 1), the road out to the house (pass 2)
  pencil([[2060, TABLE], [2160, FLOOR - 2]], 'downramp');
  house(2700, FLOOR, true);
  // marble
  const mk = (o) => [[o + 0, 110, 322], [o + d1Rel[0], 220, 382], [o + d1Rel[1], 262, 397], [o + d1Rel[2], 304, 412], [o + d1Rel[2] + 0.45, 380, 450], [o + d1Rel[2] + 0.5, 380, 470]];
  const d1Rel = d1[0].map((v) => v - nine[0] + 0.6);
  for (const [o, pass] of [[nine[0] - 0.6, 0], [nine[1] - 0.6, 1]]) {
    const run = [...mk(o)];
    const out = [[whats[pass] + 1.4, 1010, TABLE - 122], [animal[pass] - 0.25, 1330, TABLE - 150], [animal[pass] + 0.1, 1385, TABLE - 112],
      [pest[pass] + 1.3, 1400, TABLE - 112], [pest[pass] + 1.6, 1400, TABLE - 34], [ft[pass] - 0.35, 1690, TABLE - 40], [ft[pass] - 0.1, 1712, TABLE - 46]];
    const tt = t;
    if (tt > o && tt < o + d1Rel[2] + 0.5) { const [x, y] = track(run, tt); shapeMarble(x, y); }
    if (tt > whats[pass] + 1.4 && tt < ft[pass] + 0.1) { const [x, y] = track(out, tt); shapeMarble(x, y); }
    if (tt >= ft[pass] - 0.1 && tt < (pass ? 99 : P2)) shapeMarble(1712, TABLE - 46 + (pass ? 0 : 0));
  }
  // vehicles: launch on "firetruck" and "ambulance", down the ramp; pass 1 loops left under the table, pass 2 drives past the house
  for (const pass of [0, 1]) {
    const f0 = ft[pass], a0 = am[pass];
    const go = (s, endT, right) => right
      ? [[s, 1890, TABLE], [s + 0.6, 2060, TABLE], [s + 1.0, 2160, FLOOR], [endT, 3300, FLOOR]]
      : [[s, 1890, TABLE], [s + 0.6, 2060, TABLE], [s + 1.0, 2160, FLOOR], [s + 1.5, 2080, FLOOR], [endT, 250, FLOOR]];
    const right = pass === 1, endF = right ? f0 + 5.5 : P2 + 0.1, endA = right ? a0 + 5.0 : P2 + 0.35;
    if (t > f0 && t < endF + (right ? 0 : 0.3)) { const [x, y] = track(go(f0, endF, right), t); firetruck(x, y, 1); }
    else if (t <= f0 && (pass === 0 || t > P2)) firetruck(1890, TABLE, 1);
    if (t > a0 && t < endA + (right ? 0 : 0.3)) { const [x, y] = track(go(a0, endA, right), t); ambulance(x, y, 1); }
    else if (t <= a0 && (pass === 0 || t > P2)) ambulance(1960, TABLE, 1);
  }
  // lettering: pass 1 in ink, pass 2 in red underneath
  const spots = [[410, 352, -0.04], [975, 334, 0.03], [1262, 296, -0.04], [1650, 392, 0.02]];
  for (let li = 0; li < C.lines.length; li++) { const [x, y, r] = spots[li % 4], p2 = li >= 4; letter(li, x, p2 ? y + 34 : y, r, p2 ? RED : INK, 24); }
  X.restore();
}
function shapeMarble(x, y) { shape(circ(x, y - 8, 8), '#3d6f8f', 'marble', 1.3); dot(x - 2.5, y - 11, 2, '#dfeaf0'); }

function paper() {
  X.fillStyle = CREAM; X.fillRect(0, 0, W, H);
  const r = LLPen.makeRng(11); X.globalAlpha = 0.05; X.fillStyle = '#5a4a38';
  for (let i = 0; i < 2600; i++) X.fillRect(r() * W, r() * H, 1.3, 1.3);
  X.globalAlpha = 1;
}

window.drawFrame = (t) => { T = t; SEED = Math.floor(t * 12) + 1; paper(); draw(t); };
window.setup = async () => {
  C = window.CUES; const c = document.getElementById('c'); c.width = W; c.height = H; X = c.getContext('2d');
  await document.fonts.load('30px KevinSans'); return true;
};
window.__frameJPEG = (t, q = 0.92) => { window.drawFrame(t); return document.getElementById('c').toDataURL('image/jpeg', q); };

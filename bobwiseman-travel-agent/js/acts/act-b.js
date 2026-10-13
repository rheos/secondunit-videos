// Act B (116.6-188.7 s): physics bends. The vicious circle, the talented mule, the string, the carrot,
// the man with no fork and the cork. Every cut is a new picture; each SCH insert diagrams the shot before it.
'use strict';

// ---------- helpers ----------
// world position of a traveller's hand: arm angles in his local units, then scaled (honours o.flip)
function b_hand(x, y, s, a1, a2, flip) { const p = arm(26, -262, a1, a2)[2]; return [x + (flip ? -p[0] : p[0]) * s, y + p[1] * s]; }
// one suitcase, centred at (0,0) in a rotated frame
function b_case(cx, cy, w, h, rot, col, sch) {
  X.save(); X.translate(cx, cy); X.rotate(rot);
  const b = PR(-w / 2, -h / 2, w, h);
  if (sch) { fillP(b, C.navy, .9); stip(b, 0, 0, w * .6, w * h * .03, C.lav, .55, 1.3, [1, 0], .4); X.strokeStyle = C.lav; X.lineWidth = 1.2; X.strokeRect(-w / 2, -h / 2, w, h); }
  else {
    fillP(b, col); shade(b, 0, 0, w * .7, [-w * .1, -h * .18], .8, 4.5); iBox(-w / 2, -h / 2, w, h, C.ink, 2.2);
    X.beginPath(); for (const sx of [-w * .3, w * .3]) { X.moveTo(sx, -h / 2); X.lineTo(sx, h / 2); } stroke(C.ink, 1.8, .8);
    X.beginPath(); X.moveTo(-14, -h / 2); X.quadraticCurveTo(-14, -h / 2 - 16, 0, -h / 2 - 16); X.quadraticCurveTo(14, -h / 2 - 16, 14, -h / 2); stroke(C.ink, 2.6, 1);
    fillP(PE(w * .16, h * .1, 10, 7, .3), C.cream); iE(w * .16, h * .1, 10, 7, .3, C.ink, 1, .8, false);
  }
  X.restore();
}
// the mule (pack animal), side view facing left, hooves at (x,y)
function b_mule(x, y, s, T) {
  X.save(); X.translate(x, y); X.scale(s, s); const k = 1 / s, st = Math.sin(T * 3) * .05;
  for (const [lx, ph] of [[-80, 0], [90, 1]]) limb([[lx + 14, -170], [lx + 10 + Math.sin(ph + T) * 4, -90], [lx + 6, -6]], 18, {}, k, '#7b6a58');
  limb([[160, -170], [170, -120], [176, -40]], 7, {}, k, '#5b4a3a'); fillP(PE(178, -30, 9, 20), C.ink);
  const body = PE(10, -190, 150, 62); fillP(body, '#8d7b66'); shade(body, 10, -190, 160, [10, -20], .8, 5); iE(10, -190, 150, 62, 0, C.ink, 2.4);
  for (const [lx, ph] of [[-110, 2], [60, 3]]) limb([[lx + 14, -160], [lx + 10 + Math.sin(ph + T) * 4, -90], [lx + 6, -6]], 18, {}, k, '#8d7b66');
  for (const lx of [-114, -100, 56, 70, -66, 104]) { fillP(PE(lx + 22, -6, 14, 8), '#2b2420'); }
  const nk = PP([[-110, -220], [-70, -170], [-140, -280], [-190, -300]]); fillP(nk, '#8d7b66'); shade(nk, -140, -240, 80, [10, -6], .9, 4.5); iP([[-110, -220], [-190, -300]], false, C.ink, 2.2); iP([[-70, -170], [-140, -280]], false, C.ink, 2.2);
  X.save(); X.translate(-210, -300); X.rotate(-.5 + st);
  const hd = PE(-30, 10, 70, 34); fillP(hd, '#8d7b66'); shade(hd, -30, 10, 72, [8, -10], .6, 4); iE(-30, 10, 70, 34, 0, C.ink, 2.4);
  fillP(PE(-88, 18, 22, 22), '#d9c8b0'); iE(-88, 18, 22, 22, 0, C.ink, 1.8); fillP(PE(-94, 12, 3, 4), C.ink);
  fillP(PE(-4, -6, 5, 4), C.ink); iline(-12, -10, 6, -12, C.ink, 1.6, 1, false);
  for (const [ex, er] of [[6, -.25], [24, .1]]) { const ear = PE(ex, -60, 13, 52, er); fillP(ear, '#8d7b66'); hatch(ear, ex, -60, 50, er + 1.4, 3.6, C.ink, .8, .55, [5, -4]); iE(ex, -60, 13, 52, er, C.ink, 2.2); }
  X.restore();
  X.beginPath(); for (let i = 0; i < 9; i++) { const mx = -150 + i * 10; X.moveTo(mx - 30, -250 + i * 6); X.lineTo(mx - 44, -268 + i * 6); } stroke(C.ink, 1.6, .9);
  X.restore();
}
// a long-necked waiter's tray, wine bottle (corked) and glass on it, in the tray's own frame
function b_bottle(x, y, s, rot, o = {}) {
  X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s);
  const pts = [[-34, 0], [-34, -170], [-14, -210], [-14, -270], [14, -270], [14, -210], [34, -170], [34, 0]], bt = PP(pts);
  fillP(bt, '#3e5a3a'); shade(bt, 0, -130, 160, [10, 0], .9, 4); hatch(bt, -18, -130, 160, .1, 14, C.cream, 2, .3, [-40, 0]); iP(dens(pts, 20, true), true, C.ink, 2.2);
  const lb = PR(-34, -120, 68, 70); fillP(lb, C.cream); iBox(-34, -120, 68, 70, C.ink, 1.6); lab(0, -82, 'VIN', C.brick, .9, 14, 'center', 'middle', 'bold');
  if (!o.open) { const kc = PR(-11, -296, 22, 30); fillP(kc, C.tan); hatch(kc, 0, -281, 20, .7, 3, C.ink, .8, .6); iBox(-11, -296, 22, 30, C.ink, 1.6); }
  X.restore();
}
function b_glass(x, y, s, wine = 0) {
  X.save(); X.translate(x, y); X.scale(s, s);
  iline(0, 0, 0, -60, C.ink, 2.4); iE(0, 0, 30, 8, 0, C.ink, 2);
  const bowl = PP([[-34, -140], [34, -140], [22, -70], [-22, -70]]); fillP(bowl, '#ead9d0'); hatch(bowl, 0, -105, 40, -.9, 9, C.cream, 3, .6);
  if (wine) fillP(PP([[-34 + 6 * (1 - wine), -70 - 60 * wine], [34 - 6 * (1 - wine), -70 - 60 * wine], [22, -70], [-22, -70]]), '#7a2a3a');
  iP([[-34, -140], [-22, -70], [22, -70], [34, -140]], false, C.ink, 2);
  X.restore();
}
// diner wall: checked tiles, a menu board, a pendant lamp
function b_dinerWall(y0, y1, T) {
  const wl2 = PR(-200, y0, W + 400, y1 - y0); fillP(wl2, '#ecdcc8');
  hatch(wl2, 960, (y0 + y1) / 2, 1300, 0, 46, C.ink, 1, .14); hatch(wl2, 960, (y0 + y1) / 2, 1300, Math.PI / 2, 46, C.ink, 1, .14);
  const tr = PR(-200, y1 - 40, W + 400, 40); fillP(tr, C.brick); hatch(tr, 960, y1 - 20, 1300, .8, 6, C.ink, .9, .35); iline(-200, y1 - 40, W + 200, y1 - 40, C.ink, 2.2); iline(-200, y1, W + 200, y1, C.ink, 2.2);
}

// ---------- 116.6 / 121.96: stuck in the groove ----------
// He has shrunk onto a spinning record of the blues; the record turns him back as fast as he walks,
// and the groove spirals him inward while the stylus comes round behind him.
SU.b_groove = { mode: 'ill', f(q, p, a, T) {
  stripes('#e6dcc6', '#d9cbae', 130, -.62, 0, C.plum); cam(960, 600, lerp(1, 1.1, eo(p)));
  const cx = 960, cy = 760, RX = 900, k = .34, spin = -T * 3.5;
  // turntable plinth
  const pl = PP([[-60, 600], [1980, 600], [2060, 1200], [-140, 1200]]); fillP(pl, '#8a5530'); shade(pl, 960, 900, 1200, [0, -60], .1, 6); iP(dens([[-60, 600], [1980, 600], [2060, 1200], [-140, 1200]], 40, true), true, C.ink, 2.6);
  fillP(PE(cx, cy + 22, RX + 30, (RX + 30) * k), '#2b2017');
  const rec = PE(cx, cy, RX, RX * k); fillP(rec, '#2a2320');
  // grooves: fine rings, a sheen wedge turning with the record
  for (let r0 = 180; r0 < RX - 10; r0 += 19) iE(cx, cy, r0, r0 * k, 0, '#8a7a66', 1, .55, false, .6);
  X.save(); X.clip(rec); for (const w0 of [0, Math.PI]) { const a0 = spin + w0; const wedge = PP([[cx, cy], [cx + Math.cos(a0) * 1000, cy + Math.sin(a0) * 1000 * k], [cx + Math.cos(a0 + .45) * 1000, cy + Math.sin(a0 + .45) * 1000 * k]]); hatch(wedge, cx, cy, 1000, a0 + .2, 7, C.cream, 1.2, .45); } X.restore();
  iE(cx, cy, RX, RX * k, 0, C.ink, 3);
  // label + spindle
  const lb = PE(cx, cy, 170, 170 * k); fillP(lb, C.orange); hatch(lb, cx, cy, 180, .8, 5, C.ink, .9, .45, [30, -8]); iE(cx, cy, 170, 170 * k, 0, C.ink, 2.4);
  X.save(); X.translate(cx, cy); X.scale(1, k); X.rotate(spin); lab(0, -80, 'THE BLUES', C.ink, .95, 30, 'center', 'middle', 'bold'); lab(0, 80, 'SIDE A · 33⅓', C.ink, .8, 18, 'center', 'middle'); X.restore();
  iline(cx, cy, cx, cy - 46, C.ink, 6); fillP(PE(cx, cy - 46, 7, 3), C.cream);
  // his path: a spiral that only goes in
  const ga = Math.PI / 2 - .35, rr = lerp(770, 300, eio(p)), spPts = [];
  for (let i = 0; i <= 120; i++) { const t = i / 120, r1 = lerp(rr, 190, t), an = ga - t * TAU * 1.6; spPts.push([cx + Math.cos(an) * r1, cy + Math.sin(an) * r1 * k]); }
  path(spPts, C.orange, 2.4, .9, [10, 8]);
  const tx = cx + Math.cos(ga) * rr, ty = cy + Math.sin(ga) * rr * k, s = lerp(.6, .42, eio(p));
  // stylus: the tonearm swings in behind him along the same groove
  const pvx = 1790, pvy = 470, sa = ga + lerp(1.7, .32, eo(p)), sx = cx + Math.cos(sa) * rr, sy = cy + Math.sin(sa) * rr * k;
  fillP(PE(pvx, pvy, 80, 34), '#9aa0a8'); shade(PE(pvx, pvy, 80, 34), pvx, pvy, 90, [10, -8], .4, 4); iE(pvx, pvy, 80, 34, 0, C.ink, 2.4);
  X.beginPath(); X.moveTo(pvx, pvy - 10); X.quadraticCurveTo((pvx + sx) / 2 + 60, Math.min(pvy, sy) - 120, sx + 10, sy - 70); stroke(C.ink, 11, 1); X.beginPath(); X.moveTo(pvx, pvy - 10); X.quadraticCurveTo((pvx + sx) / 2 + 60, Math.min(pvy, sy) - 120, sx + 10, sy - 70); stroke('#c7c9cc', 6, 1);
  const hd = PP([[sx - 30, sy - 90], [sx + 40, sy - 84], [sx + 30, sy - 50], [sx - 26, sy - 54]]); fillP(hd, '#5b5f66'); shade(hd, sx, sy - 70, 50, [6, -6], .5, 3.5); iP([[sx - 30, sy - 90], [sx + 40, sy - 84], [sx + 30, sy - 50], [sx - 26, sy - 54]], true, C.ink, 2.2);
  iline(sx, sy - 52, sx, sy - 4, C.ink, 2.6); for (let i = 0; i < 3; i++) gc(sx, sy, 22 + i * 18 + ((FD * 4) % 18), C.teal, .8, 1.8, null, Math.PI, TAU);
  traveller(tx, ty, s, { legs: walkPh() * 1.6, look: -1, case: true, mouth: sing(T) });
  cloud(tx, ty - 470 * s, .38, { rain: true });
  // blue notes sucked into the spindle
  for (let i = 0; i < 6; i++) { const t = ((T * .4 + i / 6) % 1), an = spin * .3 + i * 1.1 - t * 4, r1 = lerp(820, 160, t); X.save(); X.translate(cx + Math.cos(an) * r1, cy + Math.sin(an) * r1 * k - 30); fillP(PE(0, 0, 9, 7, -.4), '#3f5f8f'); iline(8, -1, 8, -30, '#3f5f8f', 2, 1, false); X.restore(); }
  for (let i = 0; i < 3; i++) gc(cx, cy, 200 + i * 20, C.teal, .5, 1.4, [4, 8], Math.PI * .1, Math.PI * .9);
  consL([[0, cy, W, cy], [cx, 0, cx, H], [pvx, 0, pvx, H]]); consC([[cx, cy, RX + 80]]);
} };
SU.b_sGroove = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 560, lerp(1.06, 1, eo(p)));
  const cx = 960, cy = 560, k = .55;
  graticule(960, 560, 1900, 1100, 60, C.lav, .05);
  for (let r0 = 120; r0 < 470; r0 += 14) { X.beginPath(); X.ellipse(cx, cy, r0, r0 * k, 0, 0, TAU); stroke(C.lav, 1, .18); }
  stip(PE(cx, cy, 470, 470 * k), cx, cy, 470, 3000, C.lav, .3, 1.2);
  gc(cx, cy, 100, C.white, .8, 1.4); stip(PE(cx, cy, 100, 100), cx, cy, 100, 600, C.cyan, .6, 1.4);
  // archimedean spiral, drawn on as p runs; magenta = where he is
  const u = eo(p), N = 300, pts = [];
  for (let i = 0; i <= N; i++) { const t = i / N, an = Math.PI / 2 - .35 - t * TAU * 3.2, r1 = lerp(450, 110, t); pts.push([cx + Math.cos(an) * r1, cy + Math.sin(an) * r1 * k]); }
  path(pts, C.white, 1.4, .7, [3, 5]); const m = Math.max(2, Math.floor(u * N)); path(pts.slice(0, m), C.mag, 2.6, .95);
  const [hx, hy] = pts[m - 1]; star(hx, hy, 6, C.mag, 1); gc(hx, hy, 34, C.mag, .8, 1.4);
  // the stylus, a measured arc behind him
  const [sx, sy] = pts[Math.max(0, m - 40)]; gl(1700, 260, sx, sy, C.cyan, .85, 1.6); gc(1700, 260, 30, C.cyan, .8, 1.2); star(sx, sy, 4, C.cyan, .9); lab(1700, 220, 'STYLUS', C.cyan, .9, 13, 'center');
  bracket(cx, cy + 300, cx + lerp(450, 110, u), cy + 300, C.cyan, .85, 'r = ' + Math.round(lerp(450, 110, u)) + ' MM');
  ticks(cx, cy, 480, 72, 6, C.lav, .5, 1, 6);
  lab(hx + 40, hy - 20, 'TRAVELLER', C.mag, .95, 13); lab(cx, cy + 6, 'BLUES', C.white, .9, 16, 'center', 'middle', 'bold');
  lab(220, 900, '33⅓ RPM', C.white, .8, 16); lab(220, 925, 'WALK SPEED = SPIN SPEED', C.lav, .7, 12); lab(220, 948, 'NET DISTANCE: 0', C.mag, .9, 12);
  screen(); schFrame('B1', 'THE GROOVE', 'RADIUS ONLY DECREASES');
} };

// ---------- 131.16: such a talented mule ----------
// The real mule carries nothing. He balances the whole luggage tower on his hat, bent in a curve
// that cannot stand, and it keeps growing.
const B_TOWER = (n, bend) => { const o = []; let x = 0, y = 0, an = 0; for (let i = 0; i < n; i++) { const h = 58 + (i % 3) * 10, w = 170 - (i % 4) * 18; an = bend * (i / 8) * (i / 8) * 1.4; x += Math.sin(an) * h * .5; y -= Math.cos(an) * h * .5; o.push([x, y, w, h, an]); x += Math.sin(an) * h * .5; y -= Math.cos(an) * h * .5; } return o; };
SU.b_luggage = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e8d9b4', 140, -.62, 0, C.ochre); cam(960, 520, lerp(1, 1.06, eo(p)));
  const gy = 1000, gr = PR(-200, gy, W + 400, 300); fillP(gr, '#c4ae84'); hatch(gr, 960, gy + 80, 1400, .2, 8, C.ink, .8, .3); iline(-200, gy, W + 200, gy, C.ink, 2.6);
  // a dirt road, ruts in perspective
  consL([[0, gy + 20, W, gy + 70], [300, gy, 0, H], [1500, gy, W, H]], .3);
  const tx = 760, s = 1.2, n = 3 + Math.floor(eo(p) * 9), bend = lerp(.15, 1.0, eo(p)) + Math.sin(T * 2.2) * .04;
  b_mule(1460, gy, 1.05, T); lab(1420, gy - 470, '?', C.brick, .9, 54, 'center', 'alphabetic', 'bold');
  traveller(tx, gy, s, { look: .4, mouth: sing(T), case: false, armR: [2.75, .25], armL: [2.85, -.15] });
  const top = gy - 364 * s, cols = [C.teal, C.brick, C.ochre, C.sage, C.rose, '#9a5a34', C.plum, C.tan, C.orange, C.sky, C.teal, C.brick];
  const tw = B_TOWER(n, bend); tw.forEach(([x, y, w, h, an], i) => b_case(tx + x, top + y, w, h, an, cols[i % cols.length]));
  // where the weight is, and where it should fall
  const cm = tw.reduce((acc, [x, y]) => [acc[0] + x / tw.length, acc[1] + y / tw.length], [0, 0]);
  X.setLineDash([8, 8]); X.beginPath(); X.moveTo(tx + cm[0], top + cm[1]); X.lineTo(tx + cm[0], gy); stroke(C.orange, 2.4, .9); X.setLineDash([]);
  gc(tx + cm[0], top + cm[1], 26, C.orange, .95, 2.4); fillP(PE(tx + cm[0], top + cm[1], 6, 6), C.orange);
  iline(tx - 60, gy + 14, tx + 60, gy + 14, C.teal, 3, .9, false); lab(tx, gy + 48, 'BASE', C.teal, .9, 14, 'center', 'alphabetic', 'bold');
  if (cm[0] > 60) lab(tx + cm[0] + 16, gy - 20, 'STILL STANDING', C.brick, .9, 15, 'left', 'alphabetic', 'bold');
  for (let i = 0; i < 4; i++) gc(tx, top - 40, 120 + i * 40 + ((FD * 6) % 40), C.teal, .5 - i * .1, 1.6, null, Math.PI * 1.1, Math.PI * 1.9);
  cloud(tx - 330, 230, .62, { rain: true });
  consL([[tx, 0, tx, H], [0, top, W, top]]);
} };
SU.b_sLoad = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 520, lerp(1.08, 1, eo(p)));
  graticule(960, 540, 1900, 1100, 40, C.lav, .06);
  const gy = 1000, tx = 760, s = 1.2, top = gy - 364 * s; gl(0, gy, W, gy, C.white, .7, 1.4);
  traveller(tx, gy, s, { sch: 1, col: C.lav, armR: [2.75, .25], armL: [2.85, -.15] });
  const tw = B_TOWER(12, 1 + Math.sin(T * 2.2) * .04);
  tw.forEach(([x, y, w, h, an], i) => { b_case(tx + x, top + y, w, h, an, null, true); lab(tx + x - w / 2 - 40, top + y + 4, String(i + 1).padStart(2, '0'), C.lav, .6, 10, 'right'); });
  const cm = tw.reduce((acc, [x, y]) => [acc[0] + x / tw.length, acc[1] + y / tw.length], [0, 0]), mx = tx + cm[0], my = top + cm[1];
  star(mx, my, 7, C.mag, 1); gc(mx, my, 40, C.mag, .8, 1.4); gl(mx, my, mx, gy, C.mag, .9, 2, [6, 6]);
  X.beginPath(); X.moveTo(mx - 10, gy - 22); X.lineTo(mx, gy - 4); X.lineTo(mx + 10, gy - 22); stroke(C.mag, 2, .95);
  bracket(tx - 60, gy + 40, tx + 60, gy + 40, C.cyan, .9, 'BASE 120'); bracket(tx + 60, gy + 90, mx, gy + 90, C.mag, .9, 'OFFSET ' + Math.round(mx - tx - 60));
  lab(mx + 60, my - 10, 'C.O.M. OUTSIDE BASE', C.mag, .95, 15); lab(mx + 60, my + 14, 'STATUS: STANDING', C.white, .85, 13);
  gl(1450, 300, 1450, 420, C.cyan, .9, 2); X.beginPath(); X.moveTo(1440, 404); X.lineTo(1450, 420); X.lineTo(1460, 404); stroke(C.cyan, 2, .9); lab(1470, 360, 'g', C.cyan, .9, 18);
  lab(1500, 860, 'MULE LOAD: 0 KG', C.lav, .8, 13); lab(1500, 884, 'HIS LOAD: 12 CASES', C.white, .9, 13);
  screen(); schFrame('B2', 'LOAD TEST', 'TALENT: CARRIES ANYTHING');
} };

// ---------- 141.36: the marionette diagram (after puppetHand) ----------
SU.b_sMarionette = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1, 1.1, eo(p)));
  lattice(960, 540, 66, 11, C.lav, .05);
  const sw = Math.sin(T * 1.8) * 24, bx = 900 + sw, by = 230, fx = 820, fy = 960, s = 1.25;
  // the control bar he sees, and the bar above it that nobody sees
  X.save(); X.translate(bx, by); X.rotate(Math.sin(T * 1.8) * .06); X.strokeStyle = C.white; X.lineWidth = 1.6; X.strokeRect(-180, -10, 360, 20); X.strokeRect(-12, -70, 24, 140); X.restore();
  const bx2 = 960 + sw * .5, by2 = -40 - (1 - eo(p)) * 40; X.setLineDash([5, 7]); X.strokeStyle = C.lav; X.lineWidth = 1.2; X.strokeRect(bx2 - 180, by2 - 10, 360, 20); X.setLineDash([]);
  gl(bx - 150, by, bx2 - 150, by2, C.lav, .5, 1, [4, 6]); gl(bx + 150, by, bx2 + 150, by2, C.lav, .5, 1, [4, 6]); lab(bx2 + 210, by2 + 40 + 40 * eo(p), 'BAR 2 · HELD BY ?', C.lav, .8, 13);
  traveller(fx, fy, s, { sch: 1, col: C.lav, armR: [-.5 + sw * .01, .9], armL: [.4, -.3], legs: Math.sin(T * 1.8) });
  const joints = [[fx, fy - 364 * s, 'HAT'], [fx + 70 * s, fy - 150 * s, 'HAND R'], [fx - 50 * s, fy - 160 * s, 'HAND L'], [fx - 20 * s, fy - 80 * s, 'KNEE L'], [fx + 26 * s, fy - 80 * s, 'KNEE R']];
  joints.forEach(([jx, jy, nm], i) => { const ax = bx - 160 + i * 80; gl(ax, by + 10, jx, jy, i ? C.white : C.mag, .75, 1.2); gc(jx, jy, 9, C.white, .8, 1.2); lab(jx + (i % 2 ? 24 : -24), jy - 12, nm + ' T=' + (3 + Math.abs(Math.sin(T * 2 + i)) * 4).toFixed(1), C.lav, .8, 11, i % 2 ? 'left' : 'right'); });
  // string six: from the bar out along his stick to the carrot
  const cx2 = 1420 + sw * 1.4, cy2 = 640; gl(bx + 180, by, cx2, cy2 - 120, C.white, .8, 1.2); gl(fx + 10, fy - 364 * s, cx2, cy2 - 120, C.cyan, .8, 1.6);
  const cp = PP([[cx2 - 14, cy2 - 120], [cx2 + 14, cy2 - 120], [cx2, cy2 - 20]]); stip(cp, cx2, cy2 - 70, 60, 300, C.mag, .9, 1.4); iP([[cx2 - 14, cy2 - 120], [cx2 + 14, cy2 - 120], [cx2, cy2 - 20]], true, C.mag, 1.4, .95, false, .3);
  lab(cx2 + 30, cy2 - 70, 'STRING 6 · CARROT', C.mag, .95, 14);
  bracket(1700, by, 1700, fy, C.cyan, .7, 'DRAW 730');
  star(bx, by, 5, C.white, .9); lab(bx + 200, by + 6, 'BAR 1 · SEEN', C.white, .9, 14);
  screen(); schFrame('B3', 'RIGGING', 'I SEE THE STRING');
} };

// ---------- 151.14: dangling, upward ----------
// Gravity turns over: the carrots dangle up into the sky like balloons, and the one tied to him lifts him off the road.
SU.b_balloons = { mode: 'ill', f(q, p, a, T) {
  stripes('#dfe3d4', '#cfd8c6', 150, -.62, 0, C.teal); cam(960, 540, lerp(1.04, 1, eo(p)));
  const gy = 960;
  // rooftops
  const rf = M32(515); for (let i = 0; i < 9; i++) { const x0 = -80 + i * 240 + rf() * 40, w = 200 + rf() * 40, h = 110 + rf() * 150, pk = 50 + rf() * 60; const hs = PP([[x0, gy], [x0, gy - h], [x0 + w / 2, gy - h - pk], [x0 + w, gy - h], [x0 + w, gy]]); fillP(hs, [C.tan, C.rose, C.sage, C.ochre][i % 4]); shade(hs, x0 + w / 2, gy - h / 2, w, [w * .2, 0], .9, 5); iP([[x0, gy], [x0, gy - h], [x0 + w / 2, gy - h - pk], [x0 + w, gy - h], [x0 + w, gy]], true, C.ink, 2.2); const wn = PR(x0 + w * .35, gy - h * .7, w * .3, h * .3); fillP(wn, '#e9dfb8'); iBox(x0 + w * .35, gy - h * .7, w * .3, h * .3, C.ink, 1.6); }
  const gr = PR(-200, gy, W + 400, 300); fillP(gr, '#a8a878'); hatch(gr, 960, gy + 80, 1400, -.2, 8, C.ink, .8, .35); iline(-200, gy, W + 200, gy, C.ink, 2.6);
  // carrots on strings, rising
  const rr = M32(616); for (let i = 0; i < 11; i++) { const x0 = 120 + rr() * 1700, sp = .5 + rr() * .6, y0 = 900 - ((T * 60 * sp + rr() * 900) % 900), sw = Math.sin(T * 1.6 + i) * 16, cs = .5 + rr() * .5;
    if (Math.abs(x0 - 900) < 160) continue;
    X.beginPath(); X.moveTo(x0 + sw, y0 + 10); X.bezierCurveTo(x0 + sw - 30, y0 + 80, x0 + 30, y0 + 140, x0 + sw * .3, y0 + 220); stroke(C.ink, 1.4, .9);
    carrot(x0 + sw, y0 + 10, cs, Math.PI + sw * .01); }
  // his carrot: it pulls the string taut upward, and him with it
  const lift = eo(seg(p, .1, .9)) * 220, tx = 900, ty = gy + 4 - lift, s = 1.05, sw = Math.sin(T * 1.6) * .06;
  const hnd = b_hand(tx, ty, s, 2.95, .1), cxr = hnd[0] + 40 + Math.sin(T * 1.6) * 20, cyr = hnd[1] - 140;
  X.beginPath(); X.moveTo(hnd[0], hnd[1]); X.quadraticCurveTo(hnd[0] + 10, (hnd[1] + cyr) / 2, cxr, cyr + 6); stroke(C.ink, 1.8, 1);
  carrot(cxr, cyr + 6, 1.3, Math.PI + sw);
  traveller(tx, ty, s, { look: .3, mouth: sing(T), case: false, armR: [2.95, .1], armL: [.5 + lift * .001, -.4], legs: lift > 20 ? Math.sin(T * 3) * .3 : null });
  if (lift > 10) { X.setLineDash([6, 8]); X.beginPath(); X.moveTo(tx, gy); X.lineTo(tx, ty + 6); stroke(C.orange, 2.2, .9); X.setLineDash([]); fillP(PE(tx, gy + 6, 90 - lift * .12, 12), C.ink, .25); lab(tx + 30, (gy + ty) / 2, Math.round(lift / 30) + ' FT', C.brick, .9, 16, 'left', 'alphabetic', 'bold'); }
  cloud(tx - 300, ty - 520, .6, { rain: true });
  for (let i = 0; i < 4; i++) { const yy = cyr + 120 + i * 50; gl(cxr - 70, yy, cxr - 40, yy - 30, C.teal, .8, 2); gl(cxr + 70, yy, cxr + 40, yy - 30, C.teal, .8, 2); }
  for (let i = 0; i < 3; i++) gc(cxr, cyr - 40, 80 + i * 36, C.orange, .6, 1.8, null, Math.PI * 1.15, Math.PI * 1.85);
  consL([[0, gy, W, gy], [tx, 0, tx, H]]);
} };

// ---------- 157.4: he takes the carrot (158.0) ----------
SU.b_grab = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e6d3a8', 120, -.62, 0, C.ochre); cam(1000, 470, lerp(1, 1.04, eo(p)));
  const gy = 1080, tx = 700, s = 1.75, g = cl((T - 158.0) / .25);
  const hatX = tx + 10 * s, hatY = gy - 360 * s;
  // the stick: before the grab it reaches out; after, it whips back up, bent like a rod
  const bendA = g > 0 ? Math.sin((T - 158.0) * 22) * Math.exp(-(T - 158.0) * 3) * .5 : 0, L = 560;
  const px = hatX + Math.cos(-.18 - bendA) * L, py = hatY + Math.sin(-.18 - bendA) * L;
  X.beginPath(); X.moveTo(hatX, hatY); X.quadraticCurveTo(hatX + L * .5, hatY - 40 - bendA * 200, px, py); stroke(C.ink, 7, 1); X.beginPath(); X.moveTo(hatX, hatY); X.quadraticCurveTo(hatX + L * .5, hatY - 40 - bendA * 200, px, py); stroke(C.ochre, 3.4, 1);
  const reach = eo(cl(p / .22)), a1 = lerp(.6, 2.35, reach), a2 = lerp(.6, -.2, reach), hnd = b_hand(tx, gy, s, a1, a2);
  if (g <= 0) { const cxr = px + 30, cyr = py + 260; iline(px, py, cxr, cyr, C.ink, 1.6, 1, false); carrot(cxr, cyr, 1.2, -.1); gl(hnd[0], hnd[1], cxr, cyr + 40, C.orange, .9, 2, [8, 8]); }
  else {
    // the string snaps and curls up into the air
    X.beginPath(); for (let i = 0; i <= 30; i++) { const t = i / 30, r1 = 60 * (1 - t) + 10, an = t * 9 + T * 3; const x = px + Math.cos(an) * r1 * t, y = py + 40 - t * 60 * g + Math.sin(an) * r1 * t; i ? X.lineTo(x, y) : X.moveTo(x, y); } stroke(C.ink, 1.6, 1);
    for (let i = 0; i < 4; i++) gc(px, py, 40 + i * 30 + g * 40, C.orange, (1 - g * .4) * .8, 2, null, -1.2, .6);
  }
  traveller(tx, gy, s, { look: 1, mouth: g > 0 ? .9 : sing(T), case: false, armR: [a1, a2], armL: [.3, -.3] });
  if (g > 0) { carrot(hnd[0] + 10, hnd[1] - 40, 1.15, .2); for (let i = 0; i < 3; i++) gc(hnd[0], hnd[1] + 10, 70 + i * 26, C.teal, .9 - i * .25, 2.2); lab(hnd[0] + 100, hnd[1] - 110, 'GOT IT', C.brick, .95, 26, 'left', 'alphabetic', 'bold'); }
  cloud(tx - 280, 220, .75, { rain: true });
  consL([[0, hatY, W, hatY], [tx, 0, tx, H]]); consC([[hatX, hatY, L]]);
} };

// ---------- 160.14: did you hear about the man ----------
// The rumour travels down the diner counter as a visible line of sound, looping through each ear,
// out to the man in the plum coat alone in the end booth.
SU.b_whisper = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e0cfd6', 120, -.62, 0, C.plum); cam(960, 540, lerp(1.05, 1, eo(p)));
  b_dinerWall(80, 560, T);
  // pies on a shelf, a menu, pendant lamps
  iline(120, 300, 900, 300, C.ink, 3); for (let i = 0; i < 5; i++) { const px = 180 + i * 150, pie = PE(px, 280, 54, 20); fillP(pie, C.ochre); hatch(pie, px, 280, 60, .3, 4, C.ink, .8, .5, [6, -6]); iE(px, 280, 54, 20, 0, C.ink, 2); }
  const mn = PR(1000, 130, 380, 200); fillP(mn, '#2b2420'); iBox(1000, 130, 380, 200, C.ink, 2.6); ['PIE', 'SOUP', 'PEAS', 'WINE'].forEach((t, i) => { lab(1030, 175 + i * 42, t, C.cream, .9, 22, 'left', 'alphabetic', 'bold'); X.beginPath(); X.moveTo(1170, 168 + i * 42); X.lineTo(1340, 168 + i * 42); X.setLineDash([3, 6]); stroke(C.cream, 1.4, .6); X.setLineDash([]); });
  for (const lx of [400, 1200]) { iline(lx, -40, lx, 70, C.ink, 2); const sh2 = PP([[lx - 60, 120], [lx + 60, 120], [lx + 26, 70], [lx - 26, 70]]); fillP(sh2, C.teal); shade(sh2, lx, 95, 60, [10, -4], .6, 4); iP([[lx - 60, 120], [lx + 60, 120], [lx + 26, 70], [lx - 26, 70]], true, C.ink, 2); }
  // counter behind them
  const ct = PR(-200, 560, 1800, 70); fillP(ct, '#c08a50'); iBox(-200, 560, 1800, 70, C.ink, 2.4); const cf = PR(-200, 630, 1800, 300); fillP(cf, '#8a5530'); shade(cf, 700, 780, 900, [0, -40], .2, 6); iline(-200, 630, 1600, 630, C.ink, 2.4);
  const fl = PR(-200, 930, W + 400, 300); fillP(fl, '#d6c7a6'); hatch(fl, 960, 1000, 1300, 0, 30, C.ink, 1, .2); hatch(fl, 960, 1000, 1300, Math.PI / 2, 60, C.ink, 1, .2); iline(-200, 930, W + 200, 930, C.ink, 2.4);
  // stools + patrons
  const P = [[260, '#6b7a8f', 1], [620, C.sage, -1], [980, C.teal, 1]], s = 1.05, fy = 1010;
  P.forEach(([x], i) => { iline(x + 40, fy - 150 * s + 10, x + 40, fy, C.ink, 5); fillP(PE(x + 40, fy - 4, 60, 10), '#5b5f66'); const st = PE(x + 40, fy - 150 * s + 4, 62, 14); fillP(st, C.brick); iE(x + 40, fy - 150 * s + 4, 62, 14, 0, C.ink, 2); });
  const ph = eo(p);
  P.forEach(([x, col, lk], i) => traveller(x, fy, s, { sit: 1, coat: col, sleeve: col, look: lk, hat: i === 2 ? true : i === 0, mouth: (i === 0 && ph < .4) || (i === 1 && ph > .3 && ph < .7) ? .7 : i === 2 ? sing(T) : 0 }));
  cloud(980, fy - 520 * s, .5, { rain: true });
  // the end booth, small and far
  const bx = 1640, by = 760; const bb = PR(bx - 150, by - 260, 300, 260); fillP(bb, C.rose); shade(bb, bx, by - 130, 200, [20, -10], .9, 5); iBox(bx - 150, by - 260, 300, 260, C.ink, 2.4);
  traveller(bx - 20, by + 200, .85, { sit: 1, hat: false, coat: C.plum, sleeve: '#6a4a5a', look: .3 });
  const tb = PR(bx - 40, by + 40, 200, 20); fillP(tb, C.cream); iBox(bx - 40, by + 40, 200, 20, C.ink, 2); iline(bx + 60, by + 60, bx + 60, by + 230, C.ink, 4);
  // the rumour: mouth -> ear -> mouth -> ear -> the booth, looping like a dropped ribbon
  const mouthOf = (x, lk) => [x + lk * 6 * s, fy - 283 * s - 150 * s * 0], earOf = (x, lk) => [x - lk * 24 * s, fy - 306 * s];
  const nodes = [mouthOf(260, 1), earOf(620, -1), mouthOf(620, -1), earOf(980, 1), mouthOf(980, 1), [bx - 20, by - 40]];
  const rib = []; for (let k = 0; k < nodes.length - 1; k += 1) { const [x1, y1] = nodes[k], [x2, y2] = nodes[k + 1]; if (k === 1 || k === 3) { rib.push([x2, y2]); continue; } for (let i = 0; i <= 40; i++) { const t = i / 40, lp = Math.sin(t * Math.PI) * (170 + k * 30), an = t * TAU * (k === 4 ? 2 : 1); rib.push([lerp(x1, x2, t) + Math.sin(an) * lp * .7, lerp(y1, y2, t) - lp - Math.cos(an) * lp * .4 + lp * .4]); } }
  const m = Math.max(2, Math.floor(rib.length * cl(p * 1.25)));
  path(rib.slice(0, m), C.ink, 10, .95); path(rib.slice(0, m), C.orange, 6, 1);
  const [ex2, ey2] = rib[m - 1]; for (let i = 0; i < 3; i++) gc(ex2, ey2, 14 + i * 14, C.orange, .8 - i * .2, 1.8);
  if (p > .75) { gc(bx - 20, by - 40, 120, C.teal, .9, 2.4); }
  consL([[0, 560, W, 560], [0, 930, W, 930]]);
} };

// ---------- 162.92: the man (diner set-up in plum: a different man from the traveller) ----------
SU.b_diner = { mode: 'ill', f(q, p, a, T) {
  const tr0 = traveller; traveller = (x, y, s, o = {}) => tr0(x, y, s, { ...o, coat: C.plum, sleeve: '#6a4a5a' });
  try { SU.diner.f(q, p, a, T); } finally { traveller = tr0; }
  // the peas he can't pick up, and the knife he's left with
  for (let i = 0; i < 9; i++) { const pp = PE(920 + (i % 5) * 18, 752 + Math.floor(i / 5) * 12 - (i % 2) * 4, 7, 6); fillP(pp, C.sage); iE(920 + (i % 5) * 18, 752 + Math.floor(i / 5) * 12 - (i % 2) * 4, 7, 6, 0, C.ink, 1.2); }
  for (let i = 0; i < 3; i++) gc(760, 745, 70 + i * 22 + ((FD * 3) % 22), C.orange, .7 - i * .15, 1.8);
} };

// ---------- 170.5: no fork, so the peas come to him ----------
SU.b_peas = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e0cfd6', 120, -.62, 0, C.plum); cam(960, 540, lerp(1, 1.07, eo(p)));
  b_dinerWall(-100, 640, T);
  const win = PR(1180, 90, 560, 380); fillP(win, '#cfe0da'); hatch(win, 1460, 280, 360, -.95, 22, C.cream, 4, .4); iBox(1180, 90, 560, 380, C.ink, 3); iline(1460, 90, 1460, 470, C.ink, 2.4); iline(1180, 280, 1740, 280, C.ink, 2.4);
  cloud(1460, 240, .5, { rain: true });
  // table, seen from his side
  const tb = PP([[200, 700], [1800, 700], [1980, 1100], [20, 1100]]); fillP(tb, C.cream); hatch(tb, 960, 900, 1000, 0, 40, C.brick, 6, .35); hatch(tb, 960, 900, 1000, Math.PI / 2, 40, C.brick, 6, .35); iP(dens([[200, 700], [1800, 700], [1980, 1100], [20, 1100]], 40, true), true, C.ink, 2.6);
  const tx = 430, ty = 1360, s = 2.2, mx = tx + 6 * s, my = ty - 283 * s;
  traveller(tx, ty, s, { hat: false, coat: C.plum, sleeve: '#6a4a5a', look: 1, mouth: .4 + .5 * Math.abs(Math.sin(T * 5)), armR: [1.3, .4], armL: [.3, .3] });
  // the knife in his hand
  const hn = b_hand(tx, ty, s, 1.3, .4); X.save(); X.translate(hn[0], hn[1]); X.rotate(-.3); const kn = PR(0, -6, 180, 12); fillP(kn, '#b9bec6'); hatch(kn, 90, 0, 100, .9, 5, C.ink, .8, .5); iBox(0, -6, 180, 12, C.ink, 1.8); X.restore();
  // plate, peas rising off it on curling paths into his mouth
  const plx = 1100, ply = 880, pl = PE(plx, ply, 220, 60); fillP(pl, '#ffffff'); hatch(pl, plx, ply, 220, .2, 9, C.ink, .8, .2, [0, -18]); iE(plx, ply, 220, 60, 0, C.ink, 2.4); iE(plx, ply, 150, 40, 0, C.ink, 1.4, .8, false);
  for (let i = 0; i < 16; i++) {
    const t = cl(p * 1.5 - i * .05 + ((T * .2) % .3)), sx = plx - 100 + (i * 37 % 200), sy = ply - 10 + (i * 13 % 30);
    const c1 = [sx + 120, sy - 500], c2 = [mx + 400, my - 300 + (i % 3) * 60];
    if (i < 5) path(bzPts([sx, sy], c1, c2, [mx + 30, my], 0, 1, 30), C.orange, 1.6, .55, [6, 8]);
    if (t >= 1) continue; const [px2, py2] = t > 0 ? bz([sx, sy], c1, c2, [mx + 30, my], eio(t)) : [sx, sy];
    const pe = PE(px2, py2, 11, 10); fillP(pe, C.sage); hatch(pe, px2, py2, 12, .6, 3, C.ink, .8, .6, [4, -3]); iE(px2, py2, 11, 10, 0, C.ink, 1.6);
  }
  // the water leaves its glass too, as a wobbling ball; the salt rises in a column
  const gx = 1500, gyy = 860; X.save(); X.translate(gx, gyy); const gl2 = PP([[-50, -170], [50, -170], [40, 0], [-40, 0]]); fillP(gl2, '#e3ece6'); hatch(gl2, 0, -80, 100, -.9, 12, C.cream, 3, .5); iP([[-50, -170], [-40, 0], [40, 0], [50, -170]], false, C.ink, 2.2); X.restore();
  const wy = gyy - 240 - eo(p) * 160, wb = PE(gx + Math.sin(T * 2) * 10, wy, 56 + Math.sin(T * 6) * 6, 44 - Math.sin(T * 6) * 6); fillP(wb, C.sky); hatch(wb, gx, wy, 60, .7, 4, C.ink, .9, .5, [10, -8]); iE(gx + Math.sin(T * 2) * 10, wy, 56 + Math.sin(T * 6) * 6, 44 - Math.sin(T * 6) * 6, 0, C.ink, 2.2);
  const sxx = 1700, sh = PP([[sxx - 26, 860], [sxx + 26, 860], [sxx + 20, 760], [sxx - 20, 760]]); fillP(sh, '#f4f1e8'); shade(sh, sxx, 810, 40, [8, 0], .8, 3.5); iP([[sxx - 26, 860], [sxx + 26, 860], [sxx + 20, 760], [sxx - 20, 760]], true, C.ink, 2); stipRect(sxx - 16, 760 - 300 * eo(p), 32, 300 * eo(p), 260, C.ink, .7, 2);
  X.setLineDash([5, 8]); iBox(820, 760, 40, 170, C.brick, 2, .9, false); X.setLineDash([]); lab(840, 960, 'FORK?', C.brick, .9, 16, 'center', 'alphabetic', 'bold');
  consL([[0, 700, W, 700], [plx, 0, plx, H]]); consC([[plx, ply - 300, 360]]);
} };

// ---------- 174.58: he orders the wine ----------
// The waiter's tray tips over to sixty degrees and the bottle and glass stay stuck to it.
SU.b_order = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e0cfd6', 120, -.62, 0, C.plum); cam(960, 540, lerp(1.04, 1, eo(p)));
  b_dinerWall(60, 620, T);
  const fl = PR(-200, 960, W + 400, 300); fillP(fl, '#d6c7a6'); hatch(fl, 960, 1000, 1300, 0, 30, C.ink, 1, .2); hatch(fl, 960, 1000, 1300, Math.PI / 2, 60, C.ink, 1, .2); iline(-200, 960, W + 200, 960, C.ink, 2.4);
  // his table and chair
  chair(420, 1000, 1); const tb = PP([[200, 700], [900, 700], [950, 760], [150, 760]]); fillP(tb, C.cream); hatch(tb, 550, 730, 400, 0, 30, C.brick, 5, .35); hatch(tb, 550, 730, 400, Math.PI / 2, 30, C.brick, 5, .35); iP([[200, 700], [900, 700], [950, 760], [150, 760]], true, C.ink, 2.4); iline(550, 760, 550, 990, C.ink, 7); iline(470, 990, 630, 990, C.ink, 4);
  traveller(440, 1000, 1.3, { sit: 1, hat: false, coat: C.plum, sleeve: '#6a4a5a', look: 1, mouth: singing(T) ? .5 : 0, armR: [2.7, -.15], armL: [.4, .6] });
  const fing = b_hand(440, 1000, 1.3, 2.7, -.15); for (let i = 0; i < 3; i++) gc(fing[0], fing[1], 30 + i * 22 + ((FD * 3) % 22), C.orange, .8 - i * .2, 2);
  const pl = PE(640, 700, 90, 22); fillP(pl, '#ffffff'); iE(640, 700, 90, 22, 0, C.ink, 2);
  // the waiter walks in, tray up, tray tilting
  const wx = lerp(1900, 1300, eo(seg(p, 0, .55))), ws = 1.35, tilt = -lerp(0, 1.05, eo(seg(p, .3, .9)));
  traveller(wx, 1000, ws, { hat: false, coat: '#f4f1e8', sleeve: '#f4f1e8', look: -1, flip: true, armR: [2.5, .5], legs: p < .55 ? walkPh() : null });
  const th = b_hand(wx, 1000, ws, 2.5, .5, true);
  X.save(); X.translate(th[0], th[1] - 6); X.rotate(tilt);
  const tr = PE(0, 0, 150, 14); fillP(tr, '#b9bec6'); hatch(tr, 0, 0, 150, .1, 5, C.ink, .8, .4, [0, -6]); iE(0, 0, 150, 14, 0, C.ink, 2.4);
  b_bottle(-50, -8, .75, 0); b_glass(70, -8, .75, 0);
  // the gravity that should apply: ghost arrows straight down, in the tray's frame they point off sideways
  X.restore();
  for (const [ox, oy] of [[-50, -110], [70, -70]]) { const c = Math.cos(tilt), s2 = Math.sin(tilt), gx = th[0] + ox * c - oy * s2, gy = th[1] - 6 + ox * s2 + oy * c; X.setLineDash([6, 6]); X.beginPath(); X.moveTo(gx, gy); X.lineTo(gx, gy + 200); stroke(C.orange, 2.2, .85); X.setLineDash([]); X.beginPath(); X.moveTo(gx - 9, gy + 186); X.lineTo(gx, gy + 202); X.lineTo(gx + 9, gy + 186); stroke(C.orange, 2.2, .85); }
  if (tilt < -.3) { gc(th[0], th[1], 220, C.teal, .7, 1.6, [4, 6], -Math.PI / 2 + tilt, -Math.PI / 2); lab(th[0] + 30, th[1] - 240, Math.round(-tilt * 57.3) + '°', C.brick, .95, 22, 'left', 'alphabetic', 'bold'); }
  // the traveller at the far table, watching (cloud included)
  traveller(1720, 760, .55, { sit: 1, look: -1 }); cloud(1720, 470, .28, { rain: true }); const t2 = PR(1600, 610, 120, 12); fillP(t2, C.cream); iBox(1600, 610, 120, 12, C.ink, 1.6);
  consL([[0, 700, W, 700], [th[0], 0, th[0], H]]);
} };

// ---------- 178.92: with his teeth ----------
// Close on him biting the cork. He pulls; the bottle's neck stretches like toffee instead of letting go.
SU.b_teeth = { mode: 'ill', f(q, p, a, T) {
  stripes('#e6d6d8', '#d8c3c8', 110, -.62, 0, C.plum); cam(960, 540, lerp(1, 1.05, eo(p)));
  const tx = 560, ty = 1640, s = 3.2, mx = tx + 6 * s, my = ty - 283 * s, pull = eo(p);
  const hx = mx - pull * 80;
  traveller(tx - pull * 80, ty, s, { hat: false, coat: C.plum, sleeve: '#6a4a5a', look: 1, mouth: 0 });
  // cork in his teeth
  const kx = hx + 30, ky = my; const kc = PR(kx - 6, ky - 22, 64, 44); fillP(kc, C.tan); hatch(kc, kx + 26, ky, 40, .7, 3, C.ink, .9, .6); iBox(kx - 6, ky - 22, 64, 44, C.ink, 2.4);
  X.beginPath(); for (let i = 0; i < 4; i++) { X.rect(kx - 22 + i * 0, ky - 22 + i * 0, 0, 0); } stroke(C.ink, 1);
  for (const yy of [ky - 26, ky + 14]) { const tt = PR(kx - 24, yy, 26, 12); fillP(tt, '#ffffff'); iBox(kx - 24, yy, 26, 12, C.ink, 1.6); iline(kx - 11, yy, kx - 11, yy + 12, C.ink, 1, .8, false); }
  // the neck, stretched, then the bottle body held down on the table
  const bx = 1500, by = 760, nL = bx - 120 - (kx + 58);
  const neck = PP([[kx + 56, ky - 18], [bx - 120, ky - 18 + (by - ky) * .2], [bx - 120, ky + 18 + (by - ky) * .2], [kx + 56, ky + 18]]);
  fillP(neck, '#3e5a3a'); hatch(neck, (kx + bx) / 2, ky, nL, .1, 10, C.cream, 2.4, .35, [0, 8]); hatch(neck, (kx + bx) / 2, ky, nL, 1.4, 7 + (1 - pull) * 8, C.ink, 1, .5, [0, -10]);
  iP([[kx + 56, ky - 18], [bx - 120, ky - 18 + (by - ky) * .2]], false, C.ink, 2.6); iP([[kx + 56, ky + 18], [bx - 120, ky + 18 + (by - ky) * .2]], false, C.ink, 2.6);
  X.save(); X.translate(bx, by); X.rotate(-Math.PI / 2 - .12); const bt = PP([[-90, -120], [90, -120], [90, 260], [-90, 260]]); X.restore();
  const body = PP([[bx - 120, by - 120], [bx + 260, by - 140], [bx + 280, by + 120], [bx - 120, by + 120]]); fillP(body, '#3e5a3a'); shade(body, bx + 80, by, 260, [0, -30], .2, 5); hatch(body, bx + 80, by - 60, 260, .1, 16, C.cream, 3, .3, [0, 40]); iP(dens([[bx - 120, by - 120], [bx + 260, by - 140], [bx + 280, by + 120], [bx - 120, by + 120]], 30, true), true, C.ink, 3);
  const lb = PR(bx + 20, by - 80, 160, 150); fillP(lb, C.cream); iBox(bx + 20, by - 80, 160, 150, C.ink, 2); lab(bx + 100, by + 4, 'VIN', C.brick, .95, 36, 'center', 'middle', 'bold');
  void bt;
  const tbl = PR(-200, by + 120, W + 400, 400); fillP(tbl, C.cream); hatch(tbl, 960, by + 300, 1300, 0, 40, C.brick, 6, .35); hatch(tbl, 960, by + 300, 1300, Math.PI / 2, 40, C.brick, 6, .35); iline(-200, by + 120, W + 200, by + 120, C.ink, 2.6);
  // a hand from off right holding the bottle down
  limb([[2100, by + 60], [1900, by + 40], [1790, by - 10]], 30, {}, 1, '#f4f1e8'); fillP(PE(1780, by - 20, 34, 28), '#efd9b9'); iE(1780, by - 20, 34, 28, 0, C.ink, 2.4);
  // stretch marks and the tension
  for (let i = 0; i < 5; i++) { const xx = lerp(kx + 120, bx - 180, i / 4), yy = lerp(ky, ky + (by - ky) * .2, i / 4); gl(xx - 30, yy - 50, xx + 30, yy - 50, C.orange, .9, 2.4); gl(xx - 30, yy + 50, xx + 30, yy + 50, C.orange, .9, 2.4); }
  bracket(kx + 56, ky - 110, bx - 120, ky - 110 + (by - ky) * .2, C.ink, .8, 'NECK ' + Math.round(8 + pull * 70) + ' CM');
  consL([[0, ky, W, ky], [kx, 0, kx, H]]);
} };

// ---------- 185.6: the moon comes back down a cork, and he keeps it (186.0) ----------
SU.b_corkCatch = { mode: 'ill', f(q, p, a, T) {
  stripes('#d9cbb2', '#c9b79a', 150, -.62, 0, C.plum); cam(960, 540, lerp(1, 1.04, eo(p)));
  for (let i = 0; i < 70; i++) { const r2 = M32(i + 41), x = r2() * W, y = r2() * 560; fillP(PE(x, y, 2.4, 2.4), C.ink, .7); if (i % 7 === 0) { iline(x - 8, y, x + 8, y, C.ink, 1, .6, false); iline(x, y - 8, x, y + 8, C.ink, 1, .6, false); } }
  // the empty place in the sky where the moon was
  X.setLineDash([10, 10]); iE(1300, 230, 150, 150, 0, C.ink, 2, .8, false); X.setLineDash([]); lab(1300, 236, 'VACANT', C.ink, .7, 22, 'center', 'middle', 'bold');
  // street: kerb, lamp, his suitcase down beside him
  const gy = 920, st = PR(-200, gy, W + 400, 300); fillP(st, '#8a8172'); hatch(st, 960, gy + 100, 1300, .1, 7, C.ink, .9, .45); iline(-200, gy, W + 200, gy, C.ink, 2.6);
  const kb = PR(-200, gy - 30, W + 400, 30); fillP(kb, '#b9b09a'); hatch(kb, 960, gy - 15, 1300, 1.2, 9, C.ink, .8, .4); iBox(-200, gy - 30, W + 400, 30, C.ink, 2);
  iline(300, gy - 30, 300, 280, C.ink, 7); const lmp = PP([[250, 280], [350, 280], [320, 230], [280, 230]]); fillP(lmp, C.wax); iP([[250, 280], [350, 280], [320, 230], [280, 230]], true, C.ink, 2.4); for (let i = 0; i < 3; i++) gc(300, 300, 50 + i * 30, C.ochre, .6 - i * .15, 1.8, null, .2, Math.PI - .2);
  const tx = 860, s = 1.3; suitcase(tx + 200, gy - 30 - 110, 1.3, {});
  const sx0 = tx + 200 - 58, sy0 = gy - 30 - 110 + 18; // lid top of the suitcase (handle point + by*s)
  souvenirsOn(sx0, sy0, T, 1);
  // the cork falls along an arc, shrinking from moon to cork, landing at 186.0
  const land = [sx0 + 80, sy0], f = cl((T - 185.6) / .4);
  if (f < 1) { const P0 = [1300, 230], P1 = [1500, 300], P2 = [land[0] + 200, land[1] - 300], [cx, cy] = bz(P0, P1, P2, land, eio(f)), sz = lerp(150, 0, eo(f));
    path(bzPts(P0, P1, P2, land, 0, f, 30), C.orange, 2.4, .9, [8, 8]);
    if (sz > 20) { const m = PE(cx, cy, sz, sz); fillP(m, '#e9d9a8'); hatch(m, cx, cy, sz, .8, 5, C.ink, .9, .55, [sz * .3, -sz * .3]); iE(cx, cy, sz, sz, 0, C.ink, 2.6); }
    else souvenir('cork', cx, cy + 34, 1.2);
  } else { for (let i = 0; i < 3; i++) gc(land[0], land[1] - 18, 40 + i * 24 + (T - 186) * 60, C.orange, cl(.9 - (T - 186) * .8) , 2); lab(land[0] + 60, land[1] - 90, 'KEPT', C.brick, .95, 22, 'left', 'alphabetic', 'bold'); }
  traveller(tx, gy, s, { look: lerp(.6, 1, f), mouth: sing(T), case: false, armR: [lerp(2.2, .6, f), -.3] });
  cloud(tx, gy - 470 * s - 60, .6, { rain: true });
  consL([[0, gy, W, gy], [tx, 0, tx, H]]); consC([[1300, 230, 300]]);
} };

// ---------- the cut list ----------
var CUTS_B = [
  [116.6, 'tinyPlanet', {}],                      // There's a vicious circle: he walks round a planet the size of a roundabout
  [119.26, 'sOuroboros', {}],                     // circle: the snake that eats its tail, his route on its back
  [121.96, 'b_groove', {}],                       // stuck in it: tiny on a spinning record of the blues, spiralling inward, stylus behind
  [127.0, 'b_sGroove', {}],                       // the groove as a spiral diagram, radius only shrinking
  [131.16, 'b_luggage', {}],                      // talented mule: an impossible bent tower of cases on his hat; the real mule carries nothing
  [136.18, 'b_sLoad', {}],                        // mule: load test, centre of mass outside the base, still standing
  [138.96, 'puppetHand', {}],                     // I see the string: up to a hand in the sky
  [141.36, 'b_sMarionette', {}],                  // string: the rigging, and a second bar above held by nobody
  [146.22, 'mule', { pull: 1 }],                  // tied to: he pushes the stick further, gap unchanged
  [149.12, 'sCarrot', {}],                        // carrot: the motivation diagram
  [151.14, 'b_balloons', {}],                     // dangling: carrots dangle UP like balloons and lift him off the road
  [155.14, 'muleCircle', {}],                     // the queue closes into a ring of mules
  [157.4, 'b_grab', {}],                          // 158.0 he grabs the carrot; the string snaps, the stick whips
  [160.14, 'b_whisper', {}],                      // Did you hear: the rumour loops ear to ear down the counter to the end booth
  [162.92, 'b_diner', {}],                        // the man (plum coat, hat off), peas and a knife, no fork
  [165.28, 'sSetting', {}],                       // didn't use a: the place setting, fork not found
  [166.94, 'forkRoad', {}],                       // fork: a fork in the road; he goes straight between
  [170.5, 'b_peas', {}],                          // the peas float off the plate into his mouth; water and salt rise
  [174.58, 'b_order', {}],                        // ordered wine: the waiter's tray tips to 60 degrees, nothing falls
  [178.92, 'b_teeth', {}],                        // with his teeth: the bottle neck stretches like toffee
  [180.84, 'sBottle', { pop: 1 }],                // pulled the: the cork's vectors, pop
  [181.88, 'corkMoon', {}],                       // cork: it flies up and becomes the moon
  [185.6, 'b_corkCatch', {}],                     // the moon falls back a cork; 186.0 it lands with the carrot on his case
];

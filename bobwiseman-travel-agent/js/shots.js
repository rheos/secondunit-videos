// Set-ups and the cut list. A set-up draws one composition: f(q, p, a, T)
//   q = progress through its song section (so a set-up keeps moving across repeat visits),
//   p = progress through this shot, a = per-use args, T = song time of the held drawing.
// SECS pairs each sung line with the set-ups it alternates between; buildShots() cuts them every
// 1.2-2.5 s, snapped to the nearest beat, always hard cuts.
'use strict';

function sing(T) { for (const [s, e] of SUNG) { if (T >= s && T < e) return .35 + .65 * Math.abs(Math.sin((T - s) * 8.5)); if (s > T) break; } return 0; }
const singing = (T) => sing(T) > 0;

// ---------- illustrated extras ----------
function poster(x, y, w, h, kind) {
  const b = PR(x, y, w, h); fillP(b, C.cream); hatch(b, x + w / 2, y + h / 2, h, .7, 9, C.ink, .8, .14);
  const top = PR(x, y, w, h * .62); fillP(top, kind === 'palm' ? '#e9c58a' : '#bcd0c6');
  X.save(); X.clip(top);
  if (kind === 'palm') { const s = PE(x + w * .68, y + h * .2, w * .16, w * .16); fillP(s, C.orange); iE(x + w * .68, y + h * .2, w * .16, w * .16, 0, C.ink, 1.6); fillP(PR(x, y + h * .5, w, h * .12), C.teal); palm(x + w * .3, y + h * .62, .5); }
  else { plane(x + w * .5, y + h * .3, .36, -.18); for (let i = 0; i < 3; i++) iE(x + w * (.2 + i * .3), y + h * .52, 30, 10, 0, C.ink, 1.2, .6, false); }
  X.restore();
  iBox(x, y, w, h, C.ink, 2.2); iline(x, y + h * .62, x + w, y + h * .62, C.ink, 1.6, 1, false);
  lab(x + w / 2, y + h * .78, kind === 'palm' ? 'VISIT THE SUN' : 'FLY AWAY', C.ink, .9, 15, 'center', 'middle', 'bold');
  lab(x + w / 2, y + h * .9, 'BOOK NOW', C.brick, .9, 11, 'center', 'middle');
}
function chair(x, y, s = 1) { // seat at (x, y-150*s), legs to y
  X.save(); X.translate(x, y); X.scale(s, s);
  const back = PP([[-70, -150], [-56, -330], [-34, -330], [-46, -150]]); fillP(back, '#7a4a2a'); shade(back, -50, -240, 100, [8, 0], .9, 5); iP(dens([[-70, -150], [-56, -330], [-34, -330], [-46, -150]], 30, true), true);
  const seat = PP([[-70, -160], [90, -160], [96, -140], [-74, -140]]); fillP(seat, '#8a5530'); iP([[-70, -160], [90, -160], [96, -140], [-74, -140]], true);
  for (const lx of [-64, 84]) iline(lx, -140, lx + (lx < 0 ? -8 : 8), 0, C.ink, 3.2);
  X.restore();
}
function globeOnDesk(x, y, r, rot) {
  iline(x, y + r + 6, x, y + r + 60, C.ink, 4); const base = PE(x, y + r + 66, r * .6, r * .14); fillP(base, '#6b4a2e'); iE(x, y + r + 66, r * .6, r * .14, 0, C.ink, 2.2);
  iE(x, y, r + 14, r + 14, 0, C.ink, 3, 1, true, 1, -Math.PI * .8, Math.PI * .8 - Math.PI * 2 + Math.PI * 2);
  globe(x, y, r, rot);
}
function carrot(x, y, s, rot = 0) {
  X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s);
  const cp = PP([[-16, 0], [16, 0], [2, 110], [-2, 110]]); fillP(cp, C.orange); shade(cp, 0, 50, 60, [8, -4], .4, 4); iP(dens([[-16, 0], [16, 0], [2, 110], [-2, 110]], 18, true), true, C.ink, 2.2);
  X.beginPath(); for (let i = 1; i < 6; i++) { const yy = i * 18; X.moveTo(-14 + yy * .12, yy); X.lineTo(-4 + yy * .05, yy + 4); } stroke(C.ink, 1.2, .7);
  for (const [a, l] of [[-.5, 46], [0, 56], [.5, 44]]) { const lf = PE(Math.sin(a) * l * .5, -l * .5, 8, l * .5, a); fillP(lf, C.sage); iE(Math.sin(a) * l * .5, -l * .5, 8, l * .5, a, C.ink, 1.6, 1, false); }
  X.restore();
}
function car(x, y, s, o = {}) {
  const k = 1 / s, S = sty(o, k); X.save(); X.translate(x, y); X.scale(s, s);
  const body = [[-110, -10], [-104, -46], [-50, -50], [-26, -88], [52, -88], [76, -50], [112, -44], [114, -10]], bp = PP(body);
  S.F(bp, C.ochre); S.SH(bp, 0, -40, 120, [0, -14], .2, 4.5); S.OP(dens(body, 20, true));
  const win = PP([[-40, -52], [-20, -82], [46, -82], [64, -52]]); S.F(win, S.sch ? C.navy : '#cfe0da'); S.OP([[-40, -52], [-20, -82], [46, -82], [64, -52]], true, 1.6);
  for (const wx of [-62, 70]) { const w = PE(wx, -8, 24, 24); S.F(w, '#2b1d14'); S.OL(wx, -8, 24, 24, 0, 2); fillP(PE(wx, -8, 8, 8), S.sch ? S.col : C.tan); }
  X.restore();
}
function bird(x, y, s, wing = 0, o = {}) {
  const k = 1 / s, S = sty(o, k); X.save(); X.translate(x, y); X.scale(s, s);
  const tail = PP([[-40, 6], [-92, -6], [-90, 22]]); S.F(tail, C.teal); S.OP([[-40, 6], [-92, -6], [-90, 22]]);
  const b = PE(0, 0, 50, 34, -.1); S.F(b, C.ochre); S.SH(b, 0, 0, 56, [6, -10], .6, 4); S.OL(0, 0, 50, 34, -.1);
  const h = PE(46, -30, 22, 20); S.F(h, C.ochre); S.SH(h, 46, -30, 24, [4, -6], .6, 4); S.OL(46, -30, 22, 20);
  S.OP([[64, -36], [90, -28], [64, -22]], true, 2); fillP(PE(52, -34, 3.5, 3.5), S.INK);
  const wa = -.2 - wing * 1.6, wp = PE(-6 + Math.cos(wa - Math.PI / 2) * 10, -6 + Math.sin(wa) * 30, 46, 16 + wing * 6, wa);
  S.F(wp, C.teal); S.SH(wp, -6, -10, 50, [4, -6], .9, 4); S.OL(-6 + Math.cos(wa - Math.PI / 2) * 10, -6 + Math.sin(wa) * 30, 46, 16 + wing * 6, wa);
  for (const lx of [-8, 10]) S.OP([[lx, 30], [lx - 4, 54], [lx + 8, 56]], false, 2);
  X.restore();
}
function snowFlakes(n, T, col = '#ffffff', a = .9, sz = 3) { X.fillStyle = col; X.globalAlpha = a; const r = M32(77); for (let i = 0; i < n; i++) { const x0 = r() * W, sp = 40 + r() * 80, y = ((r() * H + T * sp) % (H + 40)) - 20, x = x0 + Math.sin(T * 1.3 + i) * 20, s = sz * (.5 + r()); X.fillRect(x, y, s, s); } X.globalAlpha = 1; }
function rain(x, y, w, h, n, col = C.teal, a = .7) { X.beginPath(); for (let i = 0; i < n; i++) { const rx = x + R() * w, ry = y + R() * h, L = 30 + R() * 50; X.moveTo(rx, ry); X.lineTo(rx - L * .2, ry + L); } stroke(col, 1.5, a); }
function walkPh() { return FD * .55; }

// ---------- ILL set-ups ----------
const SU = {};
SU.shop = { mode: 'ill', f(q, p, a, T) {
  stripes(a.snow ? '#e3d6bd' : C.paper, a.snow ? '#d3c2a2' : '#e3d3ad', 150, -.62, 0, C.tan);
  cam(a.cx || 960, a.cy || 560, lerp(a.z || 1, (a.z || 1) * (a.push || 1.07), eo(p)));
  const fx = 380, fy = 150, fw = 1160, fh = 760, fac = PR(fx, fy, fw, fh);
  fillP(fac, C.brick); X.beginPath();
  for (let y = fy; y < fy + fh; y += 24) { X.moveTo(fx, y); X.lineTo(fx + fw, y); const off = ((y - fy) / 24) % 2 ? 0 : 30; for (let x = fx + off; x < fx + fw; x += 60) { X.moveTo(x + jit(1), y); X.lineTo(x + jit(1), y + 24); } }
  stroke(C.ink, 1, .32); shade(fac, fx + fw / 2, fy + fh / 2, 900, [-140, 0], .8, 7, C.ink, .4); iBox(fx, fy, fw, fh, C.ink, 2.8);
  const sg = PR(fx + 130, fy + 36, fw - 260, 118); fillP(sg, C.cream); hatch(sg, 960, fy + 95, 500, .75, 7, C.ink, .8, .2, [0, -30]); iBox(fx + 130, fy + 36, fw - 260, 118, C.ink, 2.6);
  X.font = 'bold 86px Georgia, serif'; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = C.ink; X.fillText('TRAVEL  AGENT', 960 + jit(1), fy + 98 + jit(1)); X.lineWidth = 1; X.strokeStyle = C.ink; X.globalAlpha = .5; X.strokeText('TRAVEL  AGENT', 962 + jit(1.5), fy + 99); X.globalAlpha = 1;
  // awning
  const aw = [[fx + 60, fy + 190], [fx + fw - 60, fy + 190], [fx + fw - 20, fy + 290], [fx + 20, fy + 290]], awp = PP(aw);
  fillP(awp, C.cream); X.save(); X.clip(awp); for (let i = 0; i < 24; i++) { const sx = fx + i * 60; fillP(PP([[sx, fy + 190], [sx + 30, fy + 190], [sx + 30 - (sx - 960) * -.04, fy + 300], [sx - (sx - 960) * -.04, fy + 300]]), C.orange); } X.restore();
  hatch(awp, 960, fy + 240, 640, -.9, 6, C.ink, .9, .5, [0, -50]); iP(dens(aw, 40, true), true, C.ink, 2.4);
  X.beginPath(); for (let i = 0; i < 21; i++) { const sx = fx + 20 + i * (fw - 40) / 21; X.moveTo(sx, fy + 290); X.quadraticCurveTo(sx + (fw - 40) / 42, fy + 318, sx + (fw - 40) / 21, fy + 290); } fillP(new Path2D(), C.cream); stroke(C.ink, 2, 1);
  // window with posters
  const wx = fx + 90, wy = fy + 340, ww = 620, wh = 360, wp = PR(wx, wy, ww, wh); fillP(wp, '#d7dfd2');
  X.save(); X.clip(wp); poster(wx + 40, wy + 40, 220, 280, 'palm'); poster(wx + 340, wy + 30, 220, 280, 'plane'); X.restore();
  hatch(wp, wx + ww / 2, wy + wh / 2, 420, -.95, 16, C.cream, 3, .35); hatch(wp, wx + ww / 2, wy + wh / 2, 420, .8, 6, C.ink, .8, .3, [-60, 40]);
  iBox(wx, wy, ww, wh, C.ink, 3); iline(wx + ww / 2, wy, wx + ww / 2, wy + wh, C.ink, 3);
  // door
  const dx = fx + 800, dy = fy + 330, dw = 250, dh = fh - 330, dp = PR(dx, dy, dw, dh); fillP(dp, a.open ? '#2b1d14' : C.teal); shade(dp, dx + dw / 2, dy + dh / 2, 300, [-40, 0], .9, 5);
  if (!a.open) { iBox(dx + 30, dy + 30, dw - 60, 200, C.ink, 2); hatch(PR(dx + 30, dy + 30, dw - 60, 200), dx + dw / 2, dy + 130, 160, -.9, 14, C.cream, 2, .35); fillP(PE(dx + dw - 36, dy + dh / 2, 9, 9), C.ochre); iE(dx + dw - 36, dy + dh / 2, 9, 9, 0, C.ink, 1.6); lab(dx + dw / 2, dy + 270, a.closed ? 'CLOSED' : 'OPEN', C.ink, .9, 18, 'center', 'middle', 'bold'); }
  iBox(dx, dy, dw, dh, C.ink, 3);
  // pavement + lamp
  const pv = PR(-400, fy + fh, W + 800, 400); fillP(pv, '#cdbb98'); hatch(pv, 960, fy + fh + 150, 1400, .2, 9, C.ink, .8, .3); X.beginPath(); for (let x = -400; x < W + 400; x += 160) { X.moveTo(x, fy + fh); X.lineTo(x - 80, H + 40); } stroke(C.ink, 1.2, .5);
  iline(-400, fy + fh, W + 400, fy + fh, C.ink, 2.6);
  iline(220, fy + fh, 220, 120, C.ink, 7); iline(220, 120, 300, 120, C.ink, 5); const lmp = PE(300, 140, 26, 20); fillP(lmp, C.cream); iE(300, 140, 26, 20, 0, C.ink, 2.2);
  consL([[0, fy + fh, W, fy + fh], [fx, -100, fx, H + 100], [fx + fw, -100, fx + fw, H + 100], [0, fy + 190, W, fy + 190]]);
  // traveller
  if (a.walk) {
    const tx = lerp(a.walk[0], a.walk[1], a.byP ? p : q), ty = fy + fh + 40;
    traveller(tx, ty, a.ts || .62, { legs: walkPh(), case: true, look: a.walk[1] > a.walk[0] ? 1 : -1, armR: [-.1, .2] });
    if (a.cloud !== false) { cloud(tx - 10, ty - 300, .55, { rain: true }); }
  }
  if (a.snow) snowFlakes(500, T, '#fffaf0', .9, 4);
  if (a.ring) gc(fx + 925, fy + 545, lerp(10, 240, eo(p)), C.orange, .9 * (1 - p * .5), 2.2);
} };

SU.desk = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#ead6a6', 120, -.62, 0, C.ochre);
  const z = a.z || 1; cam(a.cx || 960, a.cy || 560, lerp(z, z * (a.push || 1.06), eo(p)));
  poster(170, 120, 250, 320, 'palm'); poster(1540, 110, 250, 320, 'plane');
  iline(-200, 960, W + 200, 960, C.ink, 2.4); const fl = PR(-200, 960, W + 400, 300); fillP(fl, '#b9925f'); hatch(fl, 960, 1060, 1200, .15, 8, C.ink, .8, .35); X.beginPath(); for (let x = -200; x < W + 200; x += 140) { X.moveTo(x, 960); X.lineTo(x + (x - 960) * .3, 1200); } stroke(C.ink, 1.1, .45);
  consL([[0, 700, W, 700], [1180, 0, 1180, H], [560, 0, 560, H]]); consC([[930, 560, 210]]);
  // brochure rack
  for (let i = 0; i < 3; i++) { const bx = 1560 + i * 70, by = 520 - i * 4, bp = PR(bx, by, 60, 86); fillP(bp, [C.teal, C.rose, C.sage][i]); hatch(bp, bx + 30, by + 43, 60, .8, 5, C.ink, .8, .45, [6, -6]); iBox(bx, by, 60, 86, C.ink, 1.8); }
  iline(1540, 610, 1790, 610, C.ink, 3); iline(1560, 610, 1560, 960, C.ink, 3); iline(1770, 610, 1770, 960, C.ink, 3);
  desk(1180, 700, 640);
  const tk = a.agentTalk ? (singing(T) ? 0 : Math.abs(Math.sin(T * 9)) * .9) : 0;
  agent(1180, 700, 1.55, { talk: tk, point: a.point ? eo(seg(q, .1, .4)) : 0, stamp: a.stamp ? (((FD >> 1) % 3) === 0 ? 1 : 0) : 0, look: -.7 });
  globeOnDesk(905, 545, 92, a.spin ? T * 2.2 : .8);
  // phone
  const ph = PR(1380, 664, 90, 34); fillP(ph, '#2b1d14'); iBox(1380, 664, 90, 34, C.ink, 1.8); iE(1425, 660, 56, 12, 0, C.ink, 3, 1, false, 1, Math.PI, TAU);
  chair(540, 960, 1.05);
  traveller(560, 960, 1.42, { sit: 1, mouth: sing(T), look: .9, armR: [.55, .95], armL: [.35, .6], case: false });
  suitcase(380, 860, .9);
  if (a.cloud !== false) cloud(520, 300, .62, { rain: !!a.rain });
  if (singing(T)) for (let i = 0; i < 3; i++) { const rr = 30 + ((FD * 5 + i * 30) % 90); gc(600, 540, rr, C.orange, .75 * (1 - rr / 120), 1.8, null, -.8, .8); }
  X.setLineDash([10, 9]); X.beginPath(); X.moveTo(600, 520); X.quadraticCurveTo(900, 330, 1165, 470); stroke(C.teal, 1.8, .8); X.setLineDash([]);
} };

SU.globeSpin = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#dfe3cc', 160, -.62, 0, C.sage);
  cam(960, 560, lerp(a.z || 1, (a.z || 1) * 1.12, eo(p)));
  consL([[0, 560, W, 560], [960, 0, 960, H], [500, 1080, 1420, 0]]); consC([[960, 560, 470], [960, 560, 540]]);
  iE(960, 560, 440, 440, -.35, C.ink, 4, 1, true, 1.2, -Math.PI * .85, Math.PI * .15);
  iline(960, 980, 960, 1040, C.ink, 6); const b = PE(960, 1050, 200, 34); fillP(b, '#6b4a2e'); shade(b, 960, 1050, 210, [0, -10], .4, 5); iE(960, 1050, 200, 34, 0, C.ink, 2.4);
  globe(960, 560, 400, (a.fast ? 4 : 1.4) * T);
  for (let i = 0; i < 3; i++) { const a0 = -2.4 + i * .9 + T * 2; gc(960, 560, 470 + i * 26, C.orange, .85, 2.2, null, a0, a0 + .7); }
  if (a.cloud) { cloud(330, 230, .7, { rain: true }); gl(330, 260, 960, 560, C.teal, .7, 1.6, [8, 8]); }
  if (a.far) { const [hx, hy] = [960 - 160, 560 - 120]; fillP(PE(hx, hy, 12, 12), C.brick); iE(hx, hy, 12, 12, 0, C.ink, 2); gc(hx, hy, 30 + 60 * eo(p), C.orange, .9, 2); lab(hx + 24, hy - 20, 'YOU ARE HERE', C.ink, .9, 15, 'left', 'alphabetic', 'bold'); }
} };

SU.cloudWalk = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#d9dccb', 130, -.62, -T * 60, C.sage);
  cam(960, 560, a.z || 1);
  const gy = 900, off = (T * 180) % 520;
  const gr = PR(-200, gy, W + 400, 400); fillP(gr, '#cdbb98'); hatch(gr, 960, gy + 120, 1400, .2, 8, C.ink, .8, .32); iline(-200, gy, W + 200, gy, C.ink, 2.6);
  for (let x = -off; x < W + 520; x += 520) { iline(x, gy, x, 260, C.ink, 6); iline(x, 260, x + 70, 260, C.ink, 4); const l = PE(x + 70, 280, 22, 18); fillP(l, C.cream); iE(x + 70, 280, 22, 18, 0, C.ink, 2); X.beginPath(); for (let k = 0; k < 6; k++) { X.moveTo(x - 30, gy + 30 + k * 10); X.lineTo(x + 30, gy + 30 + k * 10); } stroke(C.ink, .8, .4); }
  consL([[0, gy, W, gy], [960, 0, 960, H]]);
  const tx = 900, s = a.s || 1.2; traveller(tx, gy + 20, s, { legs: walkPh() * 1.4, case: true, look: 1, mouth: sing(T) });
  const cy = gy + 20 - 470 * s; cloud(tx, cy, .9 * s / 1.2 + .2, { rain: true });
  gl(tx + 150, cy, tx + 150, gy - 380 * s, C.teal, .9, 1.4, [6, 6]); bracket(tx + 190, cy + 40, tx + 190, gy + 20 - 360 * s, C.ink, .8);
  lab(tx + 220, (cy + gy - 360 * s) / 2 + 30, 'ALWAYS 1 M', C.ink, .85, 14, 'left');
  for (let i = 0; i < 3; i++) { const a0 = Math.PI * .9 + i * .25; gc(tx, cy, 200 + i * 22, C.orange, .7, 1.6, null, a0, a0 + .5); }
} };

SU.beach = { mode: 'ill', f(q, p, a, T) {
  stripes('#f1e1bd', '#ead197', 150, -.62, 0, C.ochre);
  cam(960, 560, lerp(a.z || 1, (a.z || 1) * 1.08, eo(p)));
  sunIll(1420, 290, 150, C.orange, 1);
  const sea = PR(-200, 640, W + 400, 140); fillP(sea, C.teal); hatch(sea, 960, 710, 1400, .05, 7, C.ink, .9, .5); X.beginPath(); for (let i = 0; i < 40; i++) { const wx = (i * 97 + T * 30) % (W + 200) - 100, wy = 660 + (i * 37) % 110; X.moveTo(wx, wy); X.quadraticCurveTo(wx + 20, wy - 8, wx + 40, wy); } stroke(C.cream, 2, .8); iline(-200, 640, W + 200, 640, C.ink, 2.4);
  const sand = PR(-200, 780, W + 400, 400); fillP(sand, C.tan); stipRect(-200, 780, W + 400, 400, 3000, C.ink, .5, 2); iline(-200, 780, W + 200, 780, C.ink, 2.2);
  palm(330, 860, 1.4, { sway: Math.sin(T) });
  traveller(1000, 980, 1.3, { look: 1, mouth: sing(T), armR: [2.2, -3.77], armL: [.2, -.2], case: false, hat: !a.hatOff });
  consL([[0, 640, W, 640], [1420, 0, 1420, H], [1000, 0, 1000, H]]); consC([[1420, 290, 260]]);
  for (let i = 0; i < 3; i++) { const rr = 40 + ((FD * 4 + i * 26) % 80); gc(1050, 580, rr, C.teal, .8 * (1 - rr / 120), 2, null, -1.4, .2); }
} };

SU.road = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e6d9b8', 140, -.62, 0, C.tan);
  cam(960, 540, lerp(1.1, 1, eo(p)));
  const hz = 520; const h1 = PE(500, hz + 260, 900, 280); fillP(h1, '#b9b98a'); hatch(h1, 500, hz + 100, 900, .5, 8, C.ink, .9, .35, [40, 30]); iE(500, hz + 260, 900, 280, 0, C.ink, 2.2, 1, true, 1, Math.PI, TAU);
  const h2 = PE(1500, hz + 300, 800, 300); fillP(h2, C.sage); hatch(h2, 1500, hz + 100, 800, -.5, 7, C.ink, .9, .35, [-40, 30]); iE(1500, hz + 300, 800, 300, 0, C.ink, 2.2, 1, true, 1, Math.PI, TAU);
  const gnd = PR(-200, hz + 120, W + 400, 600); fillP(gnd, '#a8a878'); hatch(gnd, 960, hz + 400, 1400, -.2, 9, C.ink, .8, .3);
  const rd = PP([[930, hz + 120], [990, hz + 120], [1500, H + 40], [420, H + 40]]); fillP(rd, '#8a8172'); hatch(rd, 960, 900, 600, .1, 6, C.ink, .9, .5); iP([[930, hz + 120], [420, H + 40]], false); iP([[990, hz + 120], [1500, H + 40]], false);
  for (let i = 0; i < 8; i++) { const t = ((i / 8 + T * .25) % 1), tt = t * t, y = lerp(hz + 125, H + 40, tt), w2 = lerp(2, 20, tt), L = lerp(4, 60, tt); fillP(PR(960 - w2 / 2, y, w2, L), C.cream); }
  for (let i = 0; i < 6; i++) { const t = ((i / 6 + T * .12) % 1), tt = t * t, x = lerp(1010, 1800, tt), y = lerp(hz + 110, H + 200, tt), hh = lerp(30, 600, tt); iline(x, y, x, y - hh, C.ink, lerp(1.5, 7, tt)); iline(x - hh * .12, y - hh * .9, x + hh * .12, y - hh * .9, C.ink, lerp(1, 4, tt)); }
  const ct = (q * 1.4) % 1, cs = lerp(.15, 1.3, ct * ct); car(lerp(955, 760, ct * ct), lerp(hz + 125, 960, ct * ct), cs);
  consL([[0, hz + 120, W, hz + 120], [960, hz + 120, 0, H], [960, hz + 120, W, H]]);
  gc(960, hz + 120, 30 + 30 * Math.abs(Math.sin(T * 3)), C.orange, .9, 2);
} };

SU.ring = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e8d0c4', 130, -.62, 0, C.rose);
  cam(960, 560, lerp(1, 1.06, eo(p)));
  const cx = 960, cy = 760, rx = 620, ry = 190, ang = -Math.PI / 2 + q * TAU * 2.2;
  const gp = PE(cx, cy, rx + 60, ry + 30); fillP(gp, '#cdbb98'); hatch(gp, cx, cy, rx, .2, 7, C.ink, .8, .3); iE(cx, cy, rx + 60, ry + 30, 0, C.ink, 2.4);
  iE(cx, cy, rx, ry, 0, C.ink, 1.6, .7, false); X.setLineDash([12, 10]); iE(cx, cy, rx - 30, ry - 12, 0, C.orange, 2.4, .9, false); X.setLineDash([]);
  const tx = cx + Math.cos(ang) * rx, ty = cy + Math.sin(ang) * ry, front = Math.sin(ang) > 0, s = lerp(.55, .85, (Math.sin(ang) + 1) / 2);
  const drawT = () => traveller(tx, ty, s, { legs: walkPh() * 1.3, case: true, look: Math.cos(ang + Math.PI / 2) > 0 ? 1 : -1, mouth: sing(T) });
  if (!front) drawT();
  iline(cx, cy, cx, cy - 300, C.ink, 7); const pd = PE(cx, cy, 110, 30); fillP(pd, '#6b4a2e'); iE(cx, cy, 110, 30, 0, C.ink, 2.2); globe(cx, cy - 420, 140, T * 1.5);
  if (front) drawT();
  for (let i = 0; i < 6; i++) { const aa = ang - .25 - i * .22; const px = cx + Math.cos(aa) * (rx - 30), py = cy + Math.sin(aa) * (ry - 12); X.beginPath(); X.moveTo(px - 8, py - 6); X.lineTo(px, py); X.lineTo(px - 8, py + 6); stroke(C.brick, 2.4, .9 - i * .12); }
  consL([[0, cy, W, cy], [cx, 0, cx, H]]); consC([[cx, cy - 420, 220]]);
} };

SU.mule = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e6d3a8', 140, -.62, -T * 80, C.ochre);
  cam(960, 560, a.z || 1);
  const gy = 930, gr = PR(-200, gy, W + 400, 300); fillP(gr, '#c4ae84'); hatch(gr, 960, gy + 80, 1400, .2, 8, C.ink, .8, .3); iline(-200, gy, W + 200, gy, C.ink, 2.6);
  X.beginPath(); const off = (T * 220) % 90; for (let x = -off; x < W + 90; x += 90) { X.moveTo(x, gy + 10); X.lineTo(x - 30, gy + 60); } stroke(C.ink, 1.2, .5);
  const s = 1.25, tx = 760;
  // the queue of other mules behind him (a.line): each chasing his own carrot
  if (a.line) for (let i = 3; i >= 1; i--) { const qx = tx - i * 300, qs = s * (1 - i * .12), qy = gy + 10 - i * 4; traveller(qx, qy, qs, { legs: walkPh() * 1.4 + i, look: 1, armR: [-.6, .9], coat: [C.plum, C.sage, C.ochre][i - 1] }); const hx2 = qx + 10, hy2 = qy - 360 * qs; iline(hx2, hy2, hx2 + 300 * qs, hy2 - 60 * qs, C.ink, 3); iline(hx2 + 300 * qs, hy2 - 60 * qs, hx2 + 300 * qs, hy2 + 140 * qs, C.ink, 1.2, 1, false); carrot(hx2 + 300 * qs, hy2 + 140 * qs, .7 * qs); }
  traveller(tx, gy + 10, s, { legs: walkPh() * 1.4, case: false, look: 1, mouth: sing(T), armR: a.pocket ? [.3, .2] : a.pull ? [2.4, -.3] : [-.6, .9], armL: a.talent ? [2.9, .3] : [.4, -.3], hat: true });
  if (a.talent) { X.save(); X.translate(tx, gy + 10 - 395 * s); X.rotate(Math.sin(T * 5) * .12); suitcase(0, -60, s * .8); X.restore(); gc(tx, gy + 10 - 470 * s, 70, C.orange, .7, 1.8, null, Math.PI, TAU); }
  const hatX = tx + 10, hatY = gy + 10 - 360 * s, reach = a.pull ? 760 : 560, px = tx + reach, py = hatY - 90;
  if (!a.pocket) {
    iline(hatX, hatY, px, py, C.ink, 5); iline(hatX, hatY, px, py, C.ochre, 2.4, 1, false);
    const sw = Math.sin(T * 2.4) * .18, L = 330, cxr = px + Math.sin(sw) * L, cyr = py + Math.cos(sw) * L;
    iline(px, py, cxr, cyr, C.ink, 1.6, 1, false);
    if (a.cardboard) { X.save(); X.translate(cxr, cyr); X.scale(.12 + Math.abs(Math.sin(T * 3)) * .9, 1); carrot(0, 0, 1.1, -sw); X.restore(); iline(cxr - 3, cyr + 10, cxr - 3, cyr + 120, C.ink, 1, .6, false); lab(cxr + 70, cyr + 60, 'CARDBOARD', C.brick, .9, 15, 'left', 'alphabetic', 'bold'); const bite = PE(cxr + 12, cyr + 40, 14, 12); fillP(bite, '#e6d3a8'); }
    else carrot(cxr, cyr, 1.1, -sw);
    gl(px, py, cxr, cyr, C.orange, .9, 2.2); gc(cxr, cyr + 60, 90, C.teal, .8, 1.8); gc(px, py, L, C.orange, .5, 1.4, [4, 8], Math.PI / 2 - .3, Math.PI / 2 + .3);
    gl(tx + 30, gy + 10 - 310 * s, cxr - 10, cyr + 40, C.teal, .8, 1.6, [8, 8]);
    if (a.pull) { bracket(tx + 40, gy + 40, cxr, gy + 40, C.ink, .8); lab((tx + cxr) / 2, gy + 90, 'GAP · UNCHANGED', C.ink, .85, 14, 'center'); }
  } else { carrot(tx + 70, gy - 260, .8, 1.2); gc(tx + 70, gy - 240, 70, C.orange, .8, 2); }
  consL([[0, gy, W, gy], [tx, 0, tx, H], [px, 0, px, H]]);
} };

SU.diner = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e0cfd6', 120, -.62, 0, C.plum);
  cam(a.cx || 960, a.cy || 560, lerp(a.z || 1, (a.z || 1) * 1.08, eo(p)));
  X.save(); const man = { sit: 1, hat: false, look: .2, mouth: 0, armR: a.cork ? [2.6, -.9] : [.6, .9], armL: [.4, .6], case: false };
  // wall checks + table
  const wl2 = PR(-200, 120, W + 400, 520); X.globalAlpha = 1; hatch(wl2, 960, 380, 1300, 0, 46, C.ink, 1, .12); hatch(wl2, 960, 380, 1300, Math.PI / 2, 46, C.ink, 1, .12);
  chair(820, 960, 1); traveller(860, 960, 1.35, man);
  X.restore();
  const tb = PP([[380, 700], [1540, 700], [1640, 820], [280, 820]]); fillP(tb, C.cream); hatch(tb, 960, 760, 700, 0, 40, C.brick, 6, .35); hatch(tb, 960, 760, 700, Math.PI / 2, 40, C.brick, 6, .35); iP(dens([[380, 700], [1540, 700], [1640, 820], [280, 820]], 40, true), true);
  const cl2 = PR(280, 820, 1360, 160); fillP(cl2, C.cream); hatch(cl2, 960, 900, 700, 0, 40, C.brick, 6, .3); shade(cl2, 960, 900, 700, [0, -40], .3, 6); iBox(280, 820, 1360, 160, C.ink, 2.4);
  // place setting
  const pl = PE(960, 760, 130, 34); fillP(pl, '#ffffff'); iE(960, 760, 130, 34, 0, C.ink, 2.2); iE(960, 760, 90, 22, 0, C.ink, 1.4, .8, false);
  fillP(PR(1110, 740, 110, 8), '#9aa0a8'); iBox(1110, 740, 110, 8, C.ink, 1.6); X.setLineDash([6, 6]); iBox(700, 740, 120, 10, C.orange, 2, .9, false); X.setLineDash([]);
  lab(760, 728, 'NO FORK', C.brick, .9, 13, 'center', 'alphabetic', 'bold');
  // wine bottle + glass
  const bx = a.cork ? 1010 : 1330, by = a.cork ? 360 : 700;
  X.save(); X.translate(bx, by); if (a.cork) X.rotate(-2.6);
  const bt = PP([[-34, 0], [-34, -170], [-14, -210], [-14, -270], [14, -270], [14, -210], [34, -170], [34, 0]]); fillP(bt, '#3e5a3a'); shade(bt, 0, -130, 160, [10, 0], .9, 4); hatch(bt, 0, -130, 160, .9, 12, C.cream, 2, .25); iP(dens([[-34, 0], [-34, -170], [-14, -210], [-14, -270], [14, -270], [14, -210], [34, -170], [34, 0]], 20, true), true, C.ink, 2.2);
  const lb = PR(-34, -120, 68, 70); fillP(lb, C.cream); iBox(-34, -120, 68, 70, C.ink, 1.6); lab(0, -82, 'VIN', C.brick, .9, 14, 'center', 'middle', 'bold');
  X.restore();
  if (a.cork) { const pop = eo(seg(p, .3, .7)); const kx = lerp(975, 1180, pop), ky = lerp(330, 180, pop) + pop * pop * 120; const kc = PR(kx - 12, ky - 18, 24, 36); fillP(kc, C.tan); iBox(kx - 12, ky - 18, 24, 36, C.ink, 1.8); for (let i = 0; i < 3; i++) gc(975, 330, 30 + pop * 90 + i * 24, C.orange, (1 - pop) * .9, 2); }
  const gx = 1420, gy = 700; iline(gx, gy, gx, gy - 60, C.ink, 2.4); iE(gx, gy, 30, 8, 0, C.ink, 2); const bowl = PP([[gx - 34, gy - 140], [gx + 34, gy - 140], [gx + 22, gy - 70], [gx - 22, gy - 70]]); fillP(bowl, '#ead9d0'); if (a.cork) fillP(PP([[gx - 28, gy - 110], [gx + 28, gy - 110], [gx + 22, gy - 70], [gx - 22, gy - 70]]), '#7a2a3a'); iP([[gx - 34, gy - 140], [gx - 22, gy - 70], [gx + 22, gy - 70], [gx + 34, gy - 140]], false, C.ink, 2);
  consL([[0, 700, W, 700], [960, 0, 960, H]]);
} };

SU.corridor = { mode: 'ill', f(q, p, a, T) {
  paper('#e8e2d0'); cam(960, 540, lerp(1, 1.06, eo(p)));
  const vx = 960, vy = 470, L = [[0, 0], [W, 0], [W, H], [0, H]];
  const back = PR(780, 360, 360, 240); fillP(back, '#d9d4c0'); iBox(780, 360, 360, 240, C.ink, 2);
  const flp = PP([[0, H], [W, H], [1140, 600], [780, 600]]); fillP(flp, '#c9c2a8'); X.save(); X.clip(flp); X.beginPath(); for (let i = -12; i <= 12; i++) { X.moveTo(vx + i * 30, 600); X.lineTo(vx + i * 160, H); } for (let k = 0; k < 10; k++) { const t = Math.pow(k / 10, 2), y = lerp(600, H, t); X.moveTo(0, y); X.lineTo(W, y); } stroke(C.ink, 1, .45); X.restore(); shade(flp, 960, 900, 900, [0, -60], .1, 7, C.ink, .3);
  const lw = PP([[0, 0], [780, 360], [780, 600], [0, H]]), rw = PP([[W, 0], [1140, 360], [1140, 600], [W, H]]); fillP(lw, '#ddd6c2'); fillP(rw, '#d4ccb6'); hatch(lw, 400, 500, 700, .9, 8, C.ink, .8, .3); hatch(rw, 1500, 500, 700, -.9, 7, C.ink, .8, .4);
  const cp2 = PP([[0, 0], [W, 0], [1140, 360], [780, 360]]); fillP(cp2, '#efe9d8'); for (let k = 0; k < 4; k++) { const t = (k + 1) / 5, y = lerp(0, 360, t), w2 = lerp(W, 360, t); fillP(PR(vx - w2 * .08, y - 6, w2 * .16, 10), C.cream); iBox(vx - w2 * .08, y - 6, w2 * .16, 10, C.ink, 1.2); }
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const t = .25 + k * .22, x1 = s < 0 ? lerp(0, 780, t) : lerp(W, 1140, t), x2 = s < 0 ? lerp(0, 780, t + .1) : lerp(W, 1140, t + .1), y1t = lerp(0, 360, t) + lerp(220, 80, t), y2t = lerp(0, 360, t + .1) + lerp(220, 80, t + .1), y1b = lerp(H, 600, t), y2b = lerp(H, 600, t + .1); const dp = PP([[x1, y1t], [x2, y2t], [x2, y2b], [x1, y1b]]); fillP(dp, C.sage); shade(dp, (x1 + x2) / 2, (y1t + y1b) / 2, 200, [s * 20, 0], .9, 5); iP([[x1, y1t], [x2, y2t], [x2, y2b], [x1, y1b]], true, C.ink, 2); }
  consL([[0, 0, vx, vy], [W, 0, vx, vy], [0, H, vx, vy], [W, H, vx, vy]], .12);
  if (a.empty) return;
  const walk = a.walkAt ?? q, d = lerp(1.0, .5, walk), y = lerp(1000, 760, walk), x = 960;
  traveller(x - 150 * d, y, 1.1 * d, { hat: false, look: 0, legs: walkPh(), armL: [.1, 0], armR: [-.6, .5] });
  traveller(x, y + 10, 1.12 * d, { hat: false, look: 0, legs: walkPh() + 1, armL: [.15, 0], armR: [-.1, .1] });
  traveller(x + 150 * d, y, 1.1 * d, { hat: false, look: 0, legs: walkPh() + 2, armL: [.6, -.5], armR: [-.1, 0] });
  X.save(); X.globalCompositeOperation = 'multiply'; for (const dx of [-150, 150]) { const cx = x + dx * d; fillP(PP([[cx - 50 * d, y - 270 * d * 1.1], [cx + 50 * d, y - 270 * d * 1.1], [cx + 58 * d, y - 120 * d], [cx - 58 * d, y - 120 * d]]), '#ffffff', 1); } X.restore();
  gl(vx, vy, vx, H, C.orange, .6, 1.6, [10, 10]);
} };

SU.pills = { mode: 'ill', f(q, p, a, T) {
  stripes('#e9e2cf', '#dcd3bd', 110, -.62, 0, C.tan);
  cam(960, 560, lerp(1, 1.08, eo(p)));
  const tb = PR(-200, 720, W + 400, 500); fillP(tb, '#b08a5c'); hatch(tb, 960, 860, 1300, .1, 7, C.ink, .8, .4); iline(-200, 720, W + 200, 720, C.ink, 2.6);
  const bx = 640, bt = PR(bx - 110, 360, 220, 360); fillP(bt, '#c86b2c'); shade(bt, bx, 540, 250, [30, 0], .9, 5); hatch(bt, bx, 540, 250, -.8, 18, C.cream, 3, .25); iBox(bx - 110, 360, 220, 360, C.ink, 2.6);
  const cap = PR(bx - 124, 300, 248, 70); fillP(cap, C.cream); X.beginPath(); for (let i = 0; i < 26; i++) { X.moveTo(bx - 120 + i * 9.5, 304); X.lineTo(bx - 120 + i * 9.5, 366); } stroke(C.ink, 1, .6); iBox(bx - 124, 300, 248, 70, C.ink, 2.4);
  const lb = PR(bx - 90, 440, 180, 180); fillP(lb, C.cream); iBox(bx - 90, 440, 180, 180, C.ink, 1.8); lab(bx, 486, 'TAKE', C.ink, .9, 18, 'center', 'middle', 'bold'); lab(bx, 520, '3 × DAILY', C.ink, .8, 14, 'center', 'middle'); for (let i = 0; i < 4; i++) iline(bx - 70, 548 + i * 16, bx + 70 - (i % 2) * 40, 548 + i * 16, C.ink, 1, .5, false);
  const rr = M32(5); for (let i = 0; i < 9; i++) { const px = 900 + rr() * 700, py = 760 + rr() * 200, an = rr() * Math.PI, pp = PE(px, py, 34, 15, an); fillP(pp, i % 2 ? C.cream : C.rose); X.save(); X.clip(pp); fillP(PR(px - 40, py - 40, 40, 80), i % 2 ? C.rose : C.cream); X.restore(); shade(pp, px, py, 36, [4, -6], .5, 3.5); iE(px, py, 34, 15, an, C.ink, 1.8); }
  consL([[0, 720, W, 720], [bx, 0, bx, H]]); consC([[bx, 540, 300]]);
  gc(bx, 540, 300, C.teal, .6, 1.4, [6, 8]);
} };

SU.cinema = { mode: 'ill', f(q, p, a, T) {
  stripes('#e2d2c4', '#d4bfae', 140, -.62, 0, C.plum);
  cam(a.cx || 960, a.cy || 560, lerp(a.z || 1, (a.z || 1) * 1.07, eo(p)));
  const sx = 1060, sy = 140, sw = 760, sh = 460, scr = PR(sx, sy, sw, sh); fillP(scr, '#fbf4e2'); iBox(sx, sy, sw, sh, C.ink, 3);
  fillP(PR(sx - 40, sy - 40, 40, sh + 80), '#7a2a3a'); fillP(PR(sx + sw, sy - 40, 40, sh + 80), '#7a2a3a'); hatch(PR(sx - 40, sy - 40, 40, sh + 80), sx - 20, sy + sh / 2, 300, 1.57, 8, C.ink, 1, .5); hatch(PR(sx + sw, sy - 40, 40, sh + 80), sx + sw + 20, sy + sh / 2, 300, 1.57, 8, C.ink, 1, .5);
  X.save(); X.clip(scr);
  if (a.crooks) { for (let i = 0; i < 3; i++) { const cx = sx + 160 + i * 220, cy = sy + sh + 20; traveller(cx, cy, .95, { hat: true, look: i - 1, legs: walkPh() + i, armR: [-.4, .6] }); fillP(PR(cx - 30, cy - 322, 60, 14), C.ink); } lab(sx + sw / 2, sy + 60, 'REAL', C.brick, .9, 34, 'center', 'middle', 'bold'); }
  else { const hx = sx + sw / 2 + Math.sin(T * 2) * 60, hy = sy + sh + 30; const cape = PP([[hx - 40, hy - 280], [hx + 40, hy - 280], [hx + 130 + Math.sin(T * 6) * 20, hy - 60], [hx - 130, hy - 60]]); fillP(cape, C.orange); shade(cape, hx, hy - 170, 160, [10, -10], .8, 5); iP(cape.__pts || [[hx - 40, hy - 280], [hx + 40, hy - 280], [hx + 130, hy - 60], [hx - 130, hy - 60]], true); traveller(hx, hy, 1, { hat: false, look: 0, armR: [2.8, 0], armL: [-2.8, 0] }); lab(sx + sw / 2, sy + 60, 'MAKE-BELIEVE', C.teal, .9, 30, 'center', 'middle', 'bold'); }
  X.restore();
  hatch(scr, sx + sw / 2, sy + sh / 2, 500, .7, 14, C.ink, .8, .12);
  const prx = 120, pry = 260; X.save(); X.globalAlpha = .6; for (let i = 0; i < 26; i++) { const t = i / 25; X.beginPath(); X.moveTo(prx, pry); X.lineTo(sx, sy + t * sh); stroke(C.cream, 2, .5); } X.restore();
  for (let r2 = 0; r2 < 3; r2++) { const ry2 = 760 + r2 * 120; for (let i = 0; i < 9; i++) { const sx2 = -40 + i * 230 + r2 * 60, seat = PP([[sx2, ry2], [sx2 + 190, ry2], [sx2 + 200, ry2 + 140], [sx2 - 10, ry2 + 140]]); fillP(seat, '#8a3a3a'); shade(seat, sx2 + 95, ry2 + 70, 120, [10, -10], .8, 5); iP([[sx2, ry2], [sx2 + 190, ry2], [sx2 + 200, ry2 + 140], [sx2 - 10, ry2 + 140]], true, C.ink, 2); } }
  traveller(520, 1010, 1.2, { sit: 0, hat: true, look: 1, mouth: sing(T), armR: [.2, .2], case: false });
  const fr = PR(380, 640, 300, 120); fillP(PP([[360, 760], [700, 760], [700, 900], [360, 900]]), '#8a3a3a'); iP([[360, 760], [700, 760], [700, 900], [360, 900]], true);
  for (let i = 0; i < 3; i++) gc(sx + sw / 2, sy + sh / 2, 260 + i * 40 + ((FD * 6) % 40), C.orange, .35, 1.6);
  consL([[0, sy + sh, W, sy + sh], [prx, pry, sx, sy], [prx, pry, sx, sy + sh]]);
} };

SU.thinker = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e3dbc0', 120, -.62, 0, C.sage);
  cam(960, 520, lerp(1, 1.05, eo(p)));
  traveller(820, 1500, 3.1, { look: .3, mouth: sing(T), armR: [2.75, -2.1], armL: [.1, 0], case: false });
  const ccx = 1450, ccy = 330, rr2 = 170, cf = PE(ccx, ccy, rr2, rr2); fillP(cf, C.cream); shade(cf, ccx, ccy, rr2, [-30, -30], .8, 5); iE(ccx, ccy, rr2, rr2, 0, C.ink, 3); ticks(ccx, ccy, rr2 - 24, 60, 8, C.ink, .8, 1.2, 5);
  const ma = (a.fast ? T * 8 : T * .6), ha = ma / 12; iline(ccx, ccy, ccx + Math.sin(ha) * 90, ccy - Math.cos(ha) * 90, C.ink, 6, 1, false); iline(ccx, ccy, ccx + Math.sin(ma) * 130, ccy - Math.cos(ma) * 130, C.ink, 3.6, 1, false); fillP(PE(ccx, ccy, 10, 10), C.ink);
  for (const bx of [ccx - 120, ccx + 120]) { const bl = PE(bx, ccy - rr2 - 10, 44, 34); fillP(bl, C.ochre); iE(bx, ccy - rr2 - 10, 44, 34, 0, C.ink, 2.4); }
  X.setLineDash([3, 10]); X.beginPath(); X.moveTo(1030, 300); X.quadraticCurveTo(1180, 160, ccx - rr2, ccy); stroke(C.teal, 3, .9); X.setLineDash([]);
  if (a.fast) for (let i = 0; i < 3; i++) gc(ccx, ccy, rr2 + 30 + i * 30 + ((FD * 8) % 30), C.orange, .7, 2);
  consL([[0, 330, W, 330], [ccx, 0, ccx, H]]);
} };

SU.stampT = { mode: 'ill', f(q, p, a, T) {
  paper(C.paper2); stripes('#d9c49b', '#cfb58a', 160, -.62, 0, C.ochre);
  cam(960, 560, lerp(1, 1.1, eo(p)));
  const tb = PR(-200, -200, W + 400, H + 400); hatch(tb, 960, 540, 1300, .05, 30, C.ink, 1.4, .25);
  ticket(900, 600, 1.35, -.08, { from: 'HERE', to: a.to || 'AWAY', seat: '13A', gate: '0' });
  const beat = ((FD >> 1) % 3), down = beat === 0, sy2 = down ? 520 : 260;
  if (q > .15) stampMark(1080, 640, 110, a.mark || 'APPROVED', C.brick, -.25, .9);
  const hx = 1080, sp = PR(hx - 90, sy2 + 80, 180, 50); fillP(sp, '#3b2a22'); iBox(hx - 90, sy2 + 80, 180, 50, C.ink, 2.4);
  const nk = PR(hx - 26, sy2 - 60, 52, 140); fillP(nk, '#8a5530'); shade(nk, hx, sy2 + 10, 90, [10, 0], .9, 4); iBox(hx - 26, sy2 - 60, 52, 140, C.ink, 2.2);
  const kb = PE(hx, sy2 - 80, 70, 46); fillP(kb, '#a5703f'); shade(kb, hx, sy2 - 80, 74, [14, -10], .7, 4); iE(hx, sy2 - 80, 70, 46, 0, C.ink, 2.6);
  if (down) for (let i = 0; i < 3; i++) gc(hx, sy2 + 130, 120 + i * 40, C.orange, .8 - i * .2, 2.4, null, Math.PI, TAU);
  consL([[0, 600, W, 600], [hx, 0, hx, H]]);
} };

SU.planeSky = { mode: 'ill', f(q, p, a, T) {
  stripes('#e9e4d0', '#cfe0da', 150, -.62, T * 120, C.teal);
  cam(960, 540, lerp(1.15, 1, eo(p)));
  for (let i = 0; i < 4; i++) cloud(((i * 620 - T * 260) % (W + 600) + W + 600) % (W + 600) - 300, 200 + (i % 2) * 520, .9);
  const A = [-200, 900], B = [500, 700], Cc = [1200, 200], D = [2200, 120], u = lerp(.25, .7, a.byP ? p : q);
  path(bzPts(A, B, Cc, D, 0, u), C.orange, 2.4, .95, [14, 10]); path(bzPts(A, B, Cc, D, u, 1), C.orange, 1.2, .4, [2, 10]);
  const [px, py] = bz(A, B, Cc, D, u), [nx, ny] = bz(A, B, Cc, D, u + .01); if (a.cloud) { const [cx2, cy2] = bz(A, B, Cc, D, Math.max(0, u - .12)); cloud(cx2, cy2 - 150, .8, { rain: true }); gl(cx2, cy2 - 150, px, py, C.teal, .7, 1.6, [8, 8]); } plane(px, py, a.s || 1.1, Math.atan2(ny - py, nx - px));
  for (let i = 0; i < 3; i++) gc(px - 300, py + 80, 40 + i * 30 + ((FD * 5) % 30), C.teal, .5, 1.6);
  consL([[0, 540, W, 540], [px, 0, px, H]]);
} };

SU.window = { mode: 'ill', f(q, p, a, T) { // plane passing the agency window
  stripes(C.paper, '#ead6a6', 120, -.62, 0, C.ochre); cam(960, 540, lerp(1, 1.05, eo(p)));
  const wx = 360, wy = 120, ww = 1200, wh = 640, wp = PR(wx, wy, ww, wh); fillP(wp, '#cfe0da');
  X.save(); X.clip(wp); for (let i = 0; i < 3; i++) cloud(wx + 200 + i * 420, wy + 160 + (i % 2) * 260, .8); plane(lerp(wx - 400, wx + ww + 400, p), wy + 300 - p * 120, 1.2, -.12); X.restore();
  hatch(wp, 960, 440, 800, -.95, 22, C.cream, 4, .3); iBox(wx, wy, ww, wh, C.ink, 4); iline(960, wy, 960, wy + wh, C.ink, 5); iline(wx, wy + wh / 2, wx + ww, wy + wh / 2, C.ink, 5);
  desk(960, 880, 1000); traveller(560, 1180, 1.25, { look: .6, mouth: sing(T), case: false });
  consL([[0, wy + wh, W, wy + wh]]);
} };

SU.cage = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#d9e0cf', 130, -.62, 0, C.sage);
  cam(960, 560, lerp(a.z || 1, (a.z || 1) * 1.08, eo(p)));
  const cx = 960, by = 900, ry = 600, rx = 330, open = a.open ? eo(seg(q, .1, .6)) : 0;
  const base = PE(cx, by, rx + 30, 50); fillP(base, '#7a4a2a'); shade(base, cx, by, rx + 40, [0, -14], .3, 5); iE(cx, by, rx + 30, 50, 0, C.ink, 2.6);
  iline(cx, by - ry - 70, cx, by - ry, C.ink, 3); iE(cx, by - ry - 90, 24, 24, 0, C.ink, 3, 1, true);
  const flyX = a.fly ? lerp(cx, cx + 700, eo(seg(q, .5, 1))) : cx, flyY = a.fly ? lerp(by - 180, by - 520, eo(seg(q, .5, 1))) : by - 180;
  bird(flyX, flyY, 1.3, a.fly && q > .4 ? flap() : 0);
  X.beginPath(); const n = 15; for (let i = 0; i <= n; i++) { const t = i / n, xx = cx - rx + t * 2 * rx; if (a.open && t > .62 && t < .88 && open > .1) continue; const top = by - ry + (1 - Math.sin(Math.PI * t)) * 240; X.moveTo(xx + jit(1), by); X.lineTo(xx + jit(1), top + 120); X.quadraticCurveTo(xx, top, cx + (xx - cx) * .1, by - ry); } stroke(C.ink, 2.6, 1);
  for (const yy of [by - 200, by - 420]) iE(cx, yy, rx, 30, 0, C.ink, 2.2, 1, false, 1, 0, Math.PI);
  if (a.open) { const dx = cx + rx * .5, dy = by - 300; X.save(); X.translate(dx, dy); X.scale(Math.cos(open * 1.4), 1); iBox(0, -120, 120, 220, C.ink, 2.4); X.restore(); gl(flyX + 60, flyY - 20, dx + 60, dy - 20, C.teal, .8, 1.6, [8, 8]); lab(dx + 140, dy - 150, 'DOOR · OPEN', C.ink, .9, 15); lab(flyX - 60, flyY + 110, 'WINGS · CLIPPED', C.brick, .9, 15, 'left', 'alphabetic', 'bold'); }
  consL([[0, by, W, by], [cx, 0, cx, H]]); consC([[cx, by - 300, 420]]);
} };

SU.snowGlobe = { mode: 'ill', f(q, p, a, T) {
  stripes('#e6e0d0', '#d8d0bd', 140, -.62, 0, C.sky);
  cam(960, 520, lerp(1.12, 1, eo(p)));
  const cx = 960, cy = 470, r = 380, ball = PE(cx, cy, r, r);
  const bs = PP([[cx - 300, cy + 300], [cx + 300, cy + 300], [cx + 360, cy + 520], [cx - 360, cy + 520]]); fillP(bs, '#6b4a2e'); shade(bs, cx, cy + 410, 400, [30, -10], .8, 5); iP([[cx - 300, cy + 300], [cx + 300, cy + 300], [cx + 360, cy + 520], [cx - 360, cy + 520]], true, C.ink, 2.6);
  fillP(ball, '#dfe8e6'); X.save(); X.clip(ball);
  fillP(PE(cx, cy + 300, 360, 90), '#fbfbf6'); iE(cx, cy + 300, 360, 90, 0, C.ink, 1.6, .8, false);
  const blow = a.blow ? eo(seg(q, .2, .8)) : 0;
  traveller(cx, cy + 300, .95, { hat: blow < .2, look: 0, mouth: sing(T), armL: [.3, .1], armR: [-.3, -.1], case: false });
  if (blow >= .2) { X.save(); X.translate(cx + blow * 260, cy - 60 - blow * 180); X.rotate(blow * 6); const hb = PE(0, 0, 44, 8); fillP(hb, '#3d2a1f'); iE(0, 0, 44, 8, 0, C.ink, 2); X.restore(); }
  const rr = M32(9); X.fillStyle = '#ffffff'; for (let i = 0; i < 260; i++) { const ang = rr() * TAU + T * (.3 + rr() * .5), rad = rr() * r * .9, x = cx + Math.cos(ang) * rad, y = cy + Math.sin(ang) * rad * .8 + ((T * 30 + i) % 40); const s = 3 + rr() * 4; X.fillRect(x, y, s, s); X.strokeStyle = C.ink; X.globalAlpha = .5; X.lineWidth = .8; X.strokeRect(x, y, s, s); X.globalAlpha = 1; }
  X.restore();
  hatch(ball, cx, cy, r, .8, 7, C.ink, .9, .35, [r * .2, -r * .2]); iE(cx, cy, r, r, 0, C.ink, 3); X.beginPath(); wE(cx - 120, cy - 150, 160, 120, -.6, 1, 30, Math.PI * 1.1, Math.PI * 1.5); stroke(C.cream, 8, .7);
  consL([[0, cy, W, cy], [cx, 0, cx, H]]); consC([[cx, cy, r + 80]]);
  gc(cx, cy, r + 40, C.teal, .7, 1.6, null, -1, -1 + eo(p) * 2.4);
} };

// ---------- SCH set-ups ----------
SU.sGlobe = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(a.z || 1, (a.z || 1) * 1.15, ex(p * 1.2)));
  lattice(960, 540, 90, 10, C.lav, .08); gc(960, 540, 470, C.lav, .25, 1, [3, 7]); gc(960, 540, 560, C.lav, .15); gl(0, 0, W, H, C.lav, .1); gl(W, 0, 0, H, C.lav, .1);
  ticks(960, 540, 430, 120, 6, C.lav, .45, 1, 10);
  const rot = T * .5; globe(960, 540, 380, rot, { sch: 1 });
  const home = proj(1.2, .7, rot), away = proj(1.2 + Math.PI, -.7, rot);
  const hp = [960 + home[0] * 380, 540 + home[1] * 380];
  if (home[2]) star(hp[0], hp[1], 6, C.white, .95);
  if (a.anti) {
    gc(960, 540, 400, C.mag, .9, 2.2, null, Math.atan2(hp[1] - 540, hp[0] - 960), Math.atan2(hp[1] - 540, hp[0] - 960) + Math.PI * eo(p));
    const ap = [960 - (hp[0] - 960), 540 - (hp[1] - 540)]; star(ap[0], ap[1], 7, C.mag, eo(p));
    gl(hp[0], hp[1], ap[0], ap[1], C.mag, .6, 1.2, [4, 6]); bracket(1420, 120, 1420, 960, C.cyan, .8, '20,015 KM', 6);
    lab(ap[0] + 24, ap[1] + 6, 'ANTIPODE', C.mag, .95, 14);
  } else {
    for (let i = 0; i < 5; i++) { const lo = 1.2 + i * 1.1 + .3, la = -.4 + (i % 3) * .4, b = proj(lo, la, rot); if (!b[2]) continue; const bp = [960 + b[0] * 380, 540 + b[1] * 380], m = [(hp[0] + bp[0]) / 2, (hp[1] + bp[1]) / 2], dx = m[0] - 960, dy = m[1] - 540, L = Math.hypot(dx, dy) || 1; const c2 = [m[0] + dx / L * 180, m[1] + dy / L * 180]; const pts = []; const tt = cl(p * 1.6 - i * .15); for (let k = 0; k <= 30; k++) { const t = k / 30 * tt, u = 1 - t; pts.push([u * u * hp[0] + 2 * u * t * c2[0] + t * t * bp[0], u * u * hp[1] + 2 * u * t * c2[1] + t * t * bp[1]]); } path(pts, i === 2 ? C.mag : C.cyan, i === 2 ? 2.2 : 1.4, .9); if (tt >= 1) star(bp[0], bp[1], 3.5, i === 2 ? C.mag : C.white, .9); }
  }
  screen(); schFrame('01', a.title || 'ROUTES', a.sub || 'ALL DEPARTURES', C.lav);
} };

SU.sTraveller = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 560, lerp(1.05, 1.15, eo(p)));
  lattice(960, 560, 70, 12, C.lav, .07); graticule(960, 540, 1800, 1000, 60, C.lav, .05);
  gc(900, 600, 420, C.lav, .2, 1, [3, 7]); gl(900, 0, 900, H, C.lav, .2); gl(0, 980, W, 980, C.lav, .3);
  traveller(900, 980, 1.6, { sch: 1, col: C.lav, case: true, look: .4 });
  cloud(900, 260, .8, { sch: 1, col: C.cyan, rain: true });
  bracket(1180, 980, 1180, 980 - 365 * 1.6, C.cyan, .85, '1.78 M');
  const C2 = [[1010, 410, 'HAT · FELT', 1350, 330], [1020, 760, 'SUITCASE · PACKED', 1350, 700], [900, 260, 'BLUES · 100%', 1350, 200], [880, 640, 'COAT · LONG', 1350, 520]];
  C2.forEach(([x, y, t, tx, ty], i) => { const v = seg(p, i * .14, i * .14 + .2); if (v <= 0) return; gc(x, y, lerp(0, 34, eo(v)), i === 2 ? C.mag : C.cyan, .95, 1.6); gl(x, y, lerp(x, tx, eo(v)), lerp(y, ty, eo(v)), C.lav, .7, 1); if (v > .9) lab(tx + 10, ty + 5, t, i === 2 ? C.mag : C.white, .95, 15); });
  screen(); schFrame('02', 'THE TRAVELLER', 'FIELD DIAGRAM');
} };

const DEST = [['LISBON', '06:40', 'ON TIME'], ['REYKJAVIK', '07:15', 'DELAYED'], ['TIMBUKTU', '08:05', 'ON TIME'], ['ULAANBAATAR', '09:30', 'CANCELLED'], ['KATHMANDU', '10:10', 'ON TIME'], ['TIERRA DEL FUEGO', '11:55', 'DELAYED'], ['ANYWHERE', '12:00', 'BOARDING'], ['NOT HERE', '13:13', 'BOARDING']];
SU.sBoard = { mode: 'sch', f(q, p, a, T) {
  schBG(C.navy2); cam(960, 540, lerp(1.08, 1, eo(p)));
  graticule(960, 540, 1900, 1100, 40, C.lav, .05);
  const x0 = 180, y0 = 210, cw = 46, rh = 86, AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  lab(x0, 170, 'DEPARTURES', C.white, .95, 22, 'left', 'alphabetic', 'bold'); lab(x0 + 900, 170, 'TIME', C.lav, .7, 14); lab(x0 + 1160, 170, 'STATUS', C.lav, .7, 14);
  DEST.forEach(([d, t, s], i) => {
    const y = y0 + i * rh, settled = q * 1.4 > (i + 1) * .12 || p > .85, txt = d.padEnd(17, ' ');
    for (let c = 0; c < 17; c++) { const x = x0 + c * cw; X.strokeStyle = C.lav; X.globalAlpha = .35; X.lineWidth = 1; X.strokeRect(x, y, cw - 6, rh - 16); X.globalAlpha = 1; gl(x, y + (rh - 16) / 2, x + cw - 6, y + (rh - 16) / 2, C.lav, .25); const ch = settled ? txt[c] : AZ[(R() * AZ.length) | 0]; if (ch !== ' ') lab(x + (cw - 6) / 2, y + (rh - 16) / 2 + 2, ch, C.white, .95, 30, 'center', 'middle', 'bold'); }
    lab(x0 + 900, y + 46, settled ? t : '--:--', C.cyan, .9, 26, 'left', 'alphabetic', 'bold');
    const hot = s === 'BOARDING'; lab(x0 + 1160, y + 46, settled ? s : '·······', hot ? C.mag : C.lav, hot && (FD >> 2) % 2 ? .4 : .95, 22, 'left', 'alphabetic', 'bold');
    if (hot && settled) star(x0 + 1440, y + 36, 4, C.mag, .9);
  });
  screen(); schFrame('03', 'DEPARTURES', 'GATE 0');
} };

SU.sPlan = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1, 1.1, eo(p)), a.rot || 0);
  graticule(960, 540, 1900, 1100, 30, C.lav, .05);
  const x = 420, y = 170, w = 1080, h = 740; for (const d of [0, 14]) { X.strokeStyle = C.lav; X.globalAlpha = .85; X.lineWidth = 1.4; X.strokeRect(x - d, y - d, w + 2 * d, h + 2 * d); } X.globalAlpha = 1;
  stip(PR(x - 14, y - 14, w + 28, 14), 960, y - 7, 700, 1500, C.lav, .7, 1.4); stip(PR(x - 14, y + h, w + 28, 14), 960, y + h + 7, 700, 1500, C.lav, .7, 1.4);
  fillP(PR(x + 120, y + h - 4, 160, 22), C.navy); gc(x + 120, y + h, 160, C.lav, .7, 1, null, -Math.PI / 2, 0); gl(x + 120, y + h, x + 120, y + h - 160, C.lav, .8, 1.4);
  X.strokeStyle = C.white; X.lineWidth = 1.4; X.strokeRect(x + 560, y + 300, 400, 130); stip(PR(x + 560, y + 300, 400, 130), x + 760, y + 365, 260, 900, C.lav, .5, 1.3);
  gc(x + 760, y + 230, 40, C.white, .9, 1.4); gc(x + 620, y + 360, 28, C.white, .6); gc(x + 760, y + 540, 46, C.white, .9, 1.4); gc(x + 360, y + 360, 60, C.cyan, .7, 1.2); lab(x + 360, y + 450, 'GLOBE', C.cyan, .8, 12, 'center');
  const ag = [x + 760, y + 230], tr = [x + 760, y + 540];
  for (const [o, d, col] of [[ag, Math.PI / 2, C.mag], [tr, -Math.PI / 2, C.cyan]]) { X.beginPath(); X.moveTo(o[0], o[1]); X.arc(o[0], o[1], 200, d - .35, d + .35); X.closePath(); stroke(col, 1.4, .9); stip(null, o[0] + Math.cos(d) * 110, o[1] + Math.sin(d) * 110, 90, 200, col, .5, 1.4); }
  bracket(x, y + h + 60, x + w, y + h + 60, C.cyan, .8, '6.0 M'); bracket(x - 60, y + h, x - 60, y, C.cyan, .8, '4.1 M');
  lab(ag[0] + 60, ag[1] - 10, 'AGENT', C.mag, .95, 14); lab(tr[0] + 60, tr[1] + 10, 'CLIENT', C.cyan, .95, 14);
  const dt = q * 3 % 1; star(lerp(tr[0], ag[0], dt), lerp(tr[1] - 40, ag[1] + 40, dt), 3.5, C.white, .9);
  screen(); schFrame('04', 'THE AGENCY', 'PLAN · 1:50');
} };

SU.sClock = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.1, 1, ex(p)));
  lattice(960, 540, 110, 7, C.lav, .07); gc(960, 540, 470, C.lav, .2, 1, [2, 8]);
  const r = 340; gc(960, 540, r, C.lav, .9, 1.6); gc(960, 540, r - 14, C.lav, .4); ticks(960, 540, r - 40, 60, 10, C.lav, .8, 1.2, 5);
  for (let i = 1; i <= 12; i++) { const an = i / 12 * TAU - Math.PI / 2; lab(960 + Math.cos(an) * (r - 80), 540 + Math.sin(an) * (r - 80) + 2, String(i), C.white, .9, 22, 'center', 'middle'); }
  const sp = a.fast ? 9 : 1, ma = T * sp, ha = ma / 12, sa = T * sp * 8;
  gl(960, 540, 960 + Math.sin(ha) * 170, 540 - Math.cos(ha) * 170, C.white, 1, 5); gl(960, 540, 960 + Math.sin(ma) * 260, 540 - Math.cos(ma) * 260, C.white, 1, 3); gl(960, 540, 960 + Math.sin(sa) * 300, 540 - Math.cos(sa) * 300, C.mag, 1, 1.6);
  gc(960, 540, 300, C.mag, .8, 2.4, null, sa - Math.PI / 2 - .8, sa - Math.PI / 2); star(960, 540, 6, C.white, 1);
  lab(1360, 300, 'Δt → 0', C.mag, .95, 18); bracket(1360, 340, 1360, 740, C.cyan, .7);
  screen(); schFrame('05', 'URGENCY', 'MINUTES PER MINUTE: ' + sp.toFixed(0));
} };

SU.sLoop = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1, 1.08, eo(p)));
  lattice(960, 540, 80, 9, C.lav, .07); gc(960, 540, 470, C.lav, .15); gc(960, 540, 200, C.lav, .2, 1, [3, 6]);
  const R0 = 340, st = ['BLUES', 'TRAVEL AGENT', 'TICKET', 'AWAY', 'HOME'], ang = -Math.PI / 2 + (q * 2.2 + p * .1) * TAU;
  gc(960, 540, R0, C.lav, .8, 1.4); ticks(960, 540, R0 + 16, 100, 5, C.lav, .4, 1, 10);
  for (let i = 0; i < 20; i++) { const aa = i / 20 * TAU, px = 960 + Math.cos(aa) * R0, py = 540 + Math.sin(aa) * R0; X.save(); X.translate(px, py); X.rotate(aa + Math.PI / 2); X.beginPath(); X.moveTo(-6, -6); X.lineTo(0, 0); X.lineTo(-6, 6); stroke(C.lav, 1.4, .7); X.restore(); }
  st.forEach((s, i) => { const aa = -Math.PI / 2 + i / 5 * TAU, px = 960 + Math.cos(aa) * R0, py = 540 + Math.sin(aa) * R0; const hp = hexPts(px, py, 38); fillP(PP(hp), C.navy); iP(hp, true, C.white, 1.4, .9, false, .3); stip(PP(hp), px, py, 38, 120, C.lav, .6, 1.3); lab(px + Math.cos(aa) * 80, py + Math.sin(aa) * 70 + 5, s, i === 0 ? C.mag : C.white, .95, 15, Math.cos(aa) > .3 ? 'left' : Math.cos(aa) < -.3 ? 'right' : 'center'); });
  gc(960, 540, R0, C.mag, .95, 3, null, ang - 1.2, ang); star(960 + Math.cos(ang) * R0, 540 + Math.sin(ang) * R0, 6, C.mag, 1);
  traveller(960, 660, .45, { sch: 1, col: C.lav, legs: walkPh() * 1.3, case: true });
  lab(960, 720, 'n = ∞', C.mag, .9, 18, 'center');
  screen(); schFrame('06', 'THE LOOP', 'EXIT: NONE FOUND');
} };

SU.sSound = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1, 1.1, eo(p)));
  graticule(960, 540, 1900, 1100, 60, C.lav, .05); gl(0, 540, W, 540, C.lav, .3);
  const sx = 420, sy = 540; star(sx, sy, 14, C.white, 1); gc(sx, sy, 110, C.white, .7, 1.4); ticks(sx, sy, 120, 48, 8, C.white, .6, 1, 4);
  for (let i = 0; i < 9; i++) { const base = 140 + i * 110 + ((T * 90) % 110); X.beginPath(); for (let k = 0; k <= 120; k++) { const an = -.7 + k / 120 * 1.4, rr = base + Math.sin(an * 22 + T * 6) * 7; const x = sx + Math.cos(an) * rr, y = sy + Math.sin(an) * rr; k ? X.lineTo(x, y) : X.moveTo(x, y); } stroke(i % 3 === 0 ? C.mag : C.cyan, 1.4, cl(1 - base / 1200)); }
  const ex2 = 1460, ey = 540; X.beginPath(); for (let k = 0; k < 300; k++) { const th = k / 300 * 6 * Math.PI, rr = 8 + th * 12; const x = ex2 + Math.cos(th) * rr, y = ey + Math.sin(th) * rr * .8; k ? X.lineTo(x, y) : X.moveTo(x, y); } stroke(singing(T) ? C.mag : C.lav, 1.6, .95);
  stip(PE(ex2, ey, 230, 190), ex2, ey, 240, 900, C.lav, .45, 1.4);
  bracket(sx, 880, ex2, 880, C.cyan, .8, '149,600,000 KM'); lab(sx, 380, 'SOURCE', C.white, .9, 14, 'center'); lab(ex2, 300, 'RECEIVER', C.white, .9, 14, 'center');
  lab(960, 220, 'SUN · VOLUME', C.mag, .95, 16, 'center'); X.beginPath(); for (let i = 0; i < 40; i++) { const h = 10 + Math.abs(Math.sin(i * .7 + T * 8)) * 60 * (singing(T) ? 1 : .3); X.moveTo(760 + i * 10, 260); X.lineTo(760 + i * 10, 260 - h); } stroke(C.cyan, 3, .8);
  screen(); schFrame('07', 'ACOUSTICS', 'THE SUN, OUT LOUD');
} };

const COAST = (() => { const r = M32(808), o = []; for (let i = 0; i < 40; i++) { const a = i / 40 * TAU, rr = 300 + r() * 120 + Math.sin(a * 3) * 60; o.push([900 + Math.cos(a) * rr * 1.6, 560 + Math.sin(a) * rr]); } return o; })();
SU.sMap = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.15, 1, eo(p)));
  graticule(960, 540, 2000, 1200, 80, C.lav, .15);
  const land = PP(COAST); stip(land, 900, 560, 800, 9000, C.lav, .5, 1.6); iP(COAST, true, C.lav, 1.3, .9, false, .4);
  for (let k = 1; k < 4; k++) iP(COAST.map(([x, y]) => [900 + (x - 900) * (1 - k * .12), 560 + (y - 560) * (1 - k * .12)]), true, C.lav, 1, .25, false, .3);
  const A = [420, 760], B = [700, 300], Cc = [1200, 820], D = [1500, 380], u = a.half ? .5 * eo(seg(q, 0, .6)) + .0001 : (q * 1.3) % 1;
  path(bzPts(A, B, Cc, D, 0, u), C.mag, 2.4, .95); path(bzPts(A, B, Cc, D, u, 1), C.lav, 1.2, .6, [4, 8]);
  star(A[0], A[1], 5, C.white, .9); star(D[0], D[1], 5, C.white, .7); const [px, py] = bz(A, B, Cc, D, u); star(px, py, 6, C.mag, 1);
  const rx = 1700, ry = 190; gc(rx, ry, 70, C.lav, .8, 1.2); ticks(rx, ry, 70, 32, 6, C.lav, .7, 1, 4); gl(rx, ry - 100, rx, ry + 100, C.lav, .7); gl(rx - 100, ry, rx + 100, ry, C.lav, .7); lab(rx, ry - 112, 'N', C.white, .95, 16, 'center');
  bracket(180, 980, 480, 980, C.cyan, .85, '0 — 100 KM');
  if (a.half) { const pct = Math.round(u * 100); X.strokeStyle = C.lav; X.lineWidth = 1.2; X.strokeRect(1240, 900, 500, 30); fillP(PR(1240, 900, 500 * u * 2 * .5, 30), C.mag, .85); lab(1240, 885, 'CURE  ' + pct + '%', C.mag, .95, 16); }
  screen(); schFrame('08', a.half ? 'MOTION' : 'ROUTE', a.half ? 'KEEP MOVING' : 'BY LAND');
} };

SU.sCarrot = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1, 1.08, eo(p)));
  lattice(960, 540, 70, 12, C.lav, .06); gl(0, 900, W, 900, C.lav, .4);
  const step = (T * .8) % 1;
  for (let g = 0; g < 4; g++) { const off = g * 160 - step * 160, hx = 420 + off, a2 = g === 3 ? .95 : .18; traveller(hx, 900, 1, { sch: 1, col: g === 3 ? C.lav : C.lav, legs: walkPh() + g, case: false }); if (g < 3) continue; }
  const hx = 420 + 480 - step * 160, hy = 900 - 360, px = hx + 520, py = hy - 70, sw = Math.sin(T * 2.4) * .18, cx = px + Math.sin(sw) * 300, cy = py + Math.cos(sw) * 300;
  gl(hx, hy, px, py, C.white, .9, 2); gl(px, py, cx, cy, C.white, .9, 1.2); gc(px, py, 300, C.lav, .5, 1, [3, 6], Math.PI / 2 - .3, Math.PI / 2 + .3);
  const cp = PP([[cx - 14, cy], [cx + 14, cy], [cx, cy + 100]]); fillP(cp, C.navy); stip(cp, cx, cy + 40, 60, 400, C.mag, .9, 1.5); iP([[cx - 14, cy], [cx + 14, cy], [cx, cy + 100]], true, C.mag, 1.4, .95, false, .3);
  gl(hx + 20, hy + 50, cx, cy + 40, C.mag, .9, 1.4, [6, 6]); bracket(hx + 20, 960, cx, 960, C.cyan, .85, 'GAP = CONSTANT');
  lab(px + 20, py - 16, 'STRING · VISIBLE', C.white, .9, 14); lab(cx + 30, cy + 60, 'CARROT', C.mag, .95, 14);
  screen(); schFrame('09', 'MOTIVATION', 'MULE, TALENTED');
} };

SU.sSetting = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.1, 1, eo(p)));
  graticule(960, 540, 1900, 1100, 50, C.lav, .1);
  gc(960, 540, 250, C.white, .9, 1.6); gc(960, 540, 180, C.lav, .6); gc(960, 540, 60, C.lav, .3, 1, [2, 5]);
  X.strokeStyle = C.white; X.lineWidth = 1.4; X.strokeRect(1280, 340, 26, 400); X.strokeRect(1360, 330, 30, 120); gc(1375, 300, 32, C.white, .8);
  X.setLineDash([8, 8]); X.strokeStyle = C.mag; X.globalAlpha = (FD >> 2) % 2 ? 1 : .45; X.lineWidth = 2; X.strokeRect(600, 340, 26, 300); for (let i = 0; i < 4; i++) X.strokeRect(596 + i * 9, 250, 4, 90); X.globalAlpha = 1; X.setLineDash([]);
  lab(613, 700, 'FORK', C.mag, .95, 16, 'center'); lab(613, 724, 'NOT FOUND', C.mag, .8, 12, 'center');
  gc(1560, 260, 70, C.cyan, .8, 1.2); lab(1560, 370, 'GLASS', C.cyan, .8, 12, 'center');
  bracket(710, 860, 1210, 860, C.cyan, .8, 'Ø 270 MM'); bracket(560, 200, 660, 200, C.mag, .8, '?');
  screen(); schFrame('10', 'PLACE SETTING', 'ITEMS: 3 OF 4');
} };

SU.sBottle = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.08, 1, eo(p)));
  lattice(960, 540, 60, 13, C.lav, .06);
  const b = [[860, 980], [860, 560], [920, 480], [920, 300], [1000, 300], [1000, 480], [1060, 560], [1060, 980]]; const bp = PP(b);
  stip(PP([[860, 980], [860, 640], [1060, 640], [1060, 980]]), 960, 810, 220, 4500, C.lav, .55, 1.5); iP(b, true, C.white, 1.6, .95, false, .3);
  const pop = a.pop ? eo(seg(p, .25, .6)) : 0, ky = 300 - pop * 360, kx = 960 + pop * 180;
  const kp = PR(kx - 40, ky - 10, 80, 120); fillP(kp, C.navy); stip(kp, kx, ky + 50, 90, 900, C.mag, .85, 1.5); X.strokeStyle = C.mag; X.lineWidth = 1.4; X.strokeRect(kx - 40, ky - 10, 80, 120);
  for (let i = 0; i < 5; i++) { const tx = kx - 50 + i * 25; X.strokeStyle = C.white; X.strokeRect(tx, ky - 50, 18, 26); }
  for (let i = 0; i < 3; i++) { const ax = kx - 40 + i * 40; gl(ax, ky + 120, ax, ky - 120, C.mag, .9, 2); X.beginPath(); X.moveTo(ax - 8, ky - 108); X.lineTo(ax, ky - 124); X.lineTo(ax + 8, ky - 108); stroke(C.mag, 2, .9); }
  if (pop > 0) for (let i = 0; i < 4; i++) gc(960, 300, 40 + pop * 260 + i * 30, C.mag, (1 - pop) * .9, 1.6);
  bracket(1120, 300, 1120, 420, C.cyan, .8, '24 MM'); lab(kx + 60, ky - 60, 'F', C.mag, .95, 20); lab(1100, 800, 'VIN · 750 ML', C.lav, .8, 13);
  screen(); schFrame('11', 'EXTRACTION', 'TOOL: TEETH');
} };

SU.sWard = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1, 1.1, eo(p)));
  graticule(960, 540, 1900, 1100, 30, C.lav, .05);
  const rooms = []; for (let i = 0; i < 5; i++) { rooms.push([260 + i * 290, 180, 270, 260]); rooms.push([260 + i * 290, 640, 270, 260]); }
  for (const [x, y, w, h] of rooms) { X.strokeStyle = C.lav; X.lineWidth = 1.4; X.globalAlpha = .85; X.strokeRect(x, y, w, h); X.globalAlpha = 1; stip(PR(x, y, w, h), x + w / 2, y + h / 2, 200, 120, C.lav, .35, 1.3);
    const bx = x + 40, by2 = y + 50; X.strokeStyle = C.white; X.globalAlpha = .7; X.strokeRect(bx, by2, 110, 170); X.strokeRect(bx + 15, by2 + 10, 80, 34); X.globalAlpha = 1; stip(PR(bx, by2 + 50, 110, 120), bx + 55, by2 + 110, 90, 260, C.lav, .55, 1.3); gc(x + w - 50, y + h - 50, 18, C.lav, .5); }
  gl(200, 470, 1720, 470, C.white, .7, 1.4); gl(200, 610, 1720, 610, C.white, .7, 1.4); lab(230, 548, 'CORRIDOR', C.lav, .6, 12);
  rooms.forEach(([x, y, w, h], i) => { const dy = i % 2 ? y : y + h, lx = x + w / 2; gc(lx, dy, 40, C.lav, .6, 1, null, i % 2 ? Math.PI : 0, i % 2 ? TAU : Math.PI); X.strokeStyle = C.mag; X.lineWidth = 1.6; X.strokeRect(lx - 9, dy + (i % 2 ? -30 : 10), 18, 16); gc(lx, dy + (i % 2 ? -30 : 10), 7, C.mag, .9, 1.6, null, Math.PI, TAU); });
  const u = eo(q), path2 = [[200, 540], [1290, 540], [1290, 640]], segL = [1090, 100], d = u * 1190; const px = d < 1090 ? 200 + d : 1290, py = d < 1090 ? 540 : 540 + (d - 1090);
  path([[200, 540], [px, py]].length && d < 1090 ? [[200, 540], [px, py]] : [[200, 540], [1290, 540], [px, py]], C.cyan, 1.6, .9, [6, 6]);
  star(px, py, 5, C.white, 1); star(px - 40, py - 26, 3, C.lav, .7); star(px - 40, py + 26, 3, C.lav, .7);
  bracket(260, 960, 1680, 960, C.cyan, .7, 'WARD 3 · 48 M');
  screen(); schFrame('12', 'ADMISSION', 'CONSENT: NOT GIVEN');
} };

const PROFILE = [[0, -260], [70, -250], [120, -210], [140, -150], [150, -90], [170, -50], [150, -30], [160, 10], [146, 30], [150, 60], [120, 90], [80, 100], [60, 160], [-60, 170], [-90, 90], [-140, 20], [-150, -80], [-120, -190], [-70, -245]];
SU.sHead = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.12, 1, eo(p)));
  gc(900, 500, 430, C.lav, .15); gl(0, 500, W, 500, C.lav, .15);
  const hp = PROFILE.map(([x, y]) => [900 + x * 1.6, 520 + y * 1.6]), hpp = PP(hp);
  fillP(hpp, C.navy); X.save(); X.clip(PE(890, 330, 230, 170)); lattice(890, 330, 22, 10, C.lav, .55); X.restore(); iP(hp, true, C.white, 1.6, .9, false, .3);
  stip(hpp, 900, 600, 300, 900, C.lav, .35, 1.4);
  const zap = (FD >> 1) % 4 === 0 && q > .2; for (const ex2 of [[1120, 360], [700, 360]]) { gc(ex2[0], ex2[1], 18, C.mag, .95, 2); }
  if (zap) { X.beginPath(); X.moveTo(1120, 360); for (let i = 1; i <= 10; i++) X.lineTo(lerp(1120, 700, i / 10), 360 + jit(26)); stroke(C.mag, 2.4, 1); star(890, 330, 8, C.mag, 1); }
  for (let i = 0; i < 5; i++) { const t = cl(q * 1.4 - i * .12), px = 1500 - t * 420, py = 160 + i * 140 + Math.sin(t * 3) * 20; const pp = PE(px, py, 40, 17, .3); fillP(pp, C.navy); stip(pp, px, py, 42, 200, C.cyan, .9, 1.4); iE(px, py, 40, 17, .3, C.cyan, 1.2, .9, false, .3); gl(px - 10, py - 16, px + 10, py + 16, C.cyan, .6); }
  lab(1520, 120, 'DOSE · 3 × DAILY', C.cyan, .9, 14); lab(1140, 330, 'ELECTRODE', C.mag, .9, 13);
  screen(); schFrame('13', 'TREATMENT', 'CONSENT: NOT GIVEN');
} };

SU.sPlaneW = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1, 1.12, eo(p)));
  lattice(960, 540, 80, 10, C.lav, .06); for (let i = 0; i < 12; i++) { gl(120, 140 + i * 70, 160, 140 + i * 70, C.lav, .6); lab(170, 145 + i * 70, String((11 - i) * 1000) + ' M', C.lav, .5, 11); }
  const A = [300, 900], B = [800, 860], Cc = [1200, 400], D = [1800, 200], u = lerp(.3, .75, a.byP ? p : q);
  path(bzPts(A, B, Cc, D, 0, u), C.mag, 2, .95); path(bzPts(A, B, Cc, D, u, 1), C.lav, 1, .5, [4, 8]);
  const [px, py] = bz(A, B, Cc, D, u), [nx, ny] = bz(A, B, Cc, D, u + .01);
  plane(px, py, 1.1, Math.atan2(ny - py, nx - px), { sch: 1, col: C.lav }); star(px + 260, py - 40, 4, C.white, .9);
  bracket(px - 290, py + 140, px + 290, py + 140, C.cyan, .8, '58.6 M'); gl(px, py, px, 1000, C.lav, .4, 1, [3, 6]);
  screen(); schFrame('14', 'DEPARTURE', 'CLIMB · 2,000 FT/MIN');
} };

SU.sProjector = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.08, 1, eo(p)));
  graticule(960, 540, 1900, 1100, 60, C.lav, .05);
  X.strokeStyle = C.white; X.lineWidth = 1.4; X.strokeRect(220, 480, 260, 160);
  for (const [rx, ry] of [[270, 400], [430, 400]]) { gc(rx, ry, 70, C.white, .9, 1.4); for (let i = 0; i < 5; i++) { const an = T * 4 + i * TAU / 5; gl(rx, ry, rx + Math.cos(an) * 66, ry + Math.sin(an) * 66, C.lav, .8); } star(rx, ry, 3, C.white, .8); }
  for (let i = 0; i < 18; i++) { const t = i / 17; gl(480, 560, 1500, 200 + t * 700, i % 4 ? C.lav : C.cyan, .3); }
  X.strokeStyle = C.white; X.strokeRect(1500, 200, 30, 700); stip(PR(1440, 200, 60, 700), 1470, 550, 400, 600, C.lav, .4, 1.4);
  for (let i = 0; i < 6; i++) { const fx = 560 + ((i * 160 + T * 240) % 900); X.strokeStyle = C.lav; X.globalAlpha = .7; X.strokeRect(fx, 520, 110, 80); X.globalAlpha = 1; }
  bracket(480, 960, 1500, 960, C.cyan, .8, 'THROW · 18 M'); lab(260, 680, '24 FPS', C.mag, .95, 18);
  screen(); schFrame('15', 'THE MOVIE', 'PROJECTION');
} };

SU.sFilm = { mode: 'sch', f(q, p, a, T) {
  schBG(C.navy2); cam(960, 540, lerp(1, 1.06, eo(p)));
  const y = 300, h = 480, off = (T * 220) % 420;
  gl(0, y, W, y, C.lav, .9, 1.4); gl(0, y + h, W, y + h, C.lav, .9, 1.4);
  for (let x = -off; x < W + 40; x += 42) { X.strokeStyle = C.lav; X.globalAlpha = .7; X.strokeRect(x, y + 14, 20, 26); X.strokeRect(x, y + h - 40, 20, 26); X.globalAlpha = 1; }
  for (let k = -1; k < 6; k++) { const fx = k * 420 - off, real = (k + Math.floor((T * 220) / 420)) % 2 !== 0, col = real ? C.mag : C.cyan; X.strokeStyle = col; X.lineWidth = 1.4; X.strokeRect(fx + 30, y + 60, 360, h - 120);
    stip(PR(fx + 30, y + 60, 360, h - 120), fx + 210, y + h / 2, 260, 500, col, .35, 1.4);
    traveller(fx + 210, y + h - 70, .85, { sch: 1, col, hat: real, look: 0, armR: real ? [-.4, .6] : [2.8, 0], armL: real ? [.2, 0] : [-2.8, 0] });
    if (real) fillP(PR(fx + 180, y + h - 70 - 322 * .85, 60, 12), col); lab(fx + 210, y + 100, real ? 'REAL' : 'MAKE-BELIEVE', col, .95, 16, 'center');
    lab(fx + 40, y + h - 70, String(1000 + k), C.lav, .5, 11); }
  screen(); schFrame('16', 'CASTING', 'HEROES 0 · CROOKS ∞');
} };

SU.sThinkFeel = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.05, 1, eo(p)));
  graticule(960, 540, 1900, 1100, 40, C.lav, .05);
  const x0 = 300, L = 1300; gl(x0, 820, x0 + L, 820, C.lav, .8, 1.4); for (let i = 0; i <= 26; i++) { gl(x0 + i * L / 26, 820, x0 + i * L / 26, 820 + (i % 5 ? 8 : 18), C.lav, .7); }
  const tl = a.feel ? 1 : eo(q) * .98;
  X.strokeStyle = C.cyan; X.lineWidth = 1.4; X.strokeRect(x0, 360, L * tl, 120); stip(PR(x0, 360, L * tl, 120), x0 + L * tl / 2, 420, L * tl / 2 + 20, 4000 * tl, C.cyan, .6, 1.4); lab(x0, 340, 'THINK', C.white, .95, 18);
  if (a.feel) { const fp = ex(p * 3); X.strokeStyle = C.mag; X.strokeRect(x0, 580, 60 * fp, 120); stip(PR(x0, 580, 60 * fp, 120), x0 + 30, 640, 80, 600, C.mag, .9, 1.5); lab(x0, 560, 'FEEL', C.mag, .95, 18); star(x0 + 60, 640, 6, C.mag, fp); bracket(x0, 740, x0 + 60, 740, C.mag, .8, '0.2 S'); }
  bracket(x0, 300, x0 + L * tl, 300, C.cyan, .7, 'T = ' + (tl * 41).toFixed(1) + ' YR');
  X.save(); X.beginPath(); X.rect(1500, 120, 300, 200); X.clip(); lattice(1650, 220, 18, 6, C.lav, .5); X.restore();
  screen(); schFrame('17', 'LATENCY', 'THINK vs FEEL');
} };

SU.sCage = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.05, 1, eo(p)));
  lattice(960, 540, 60, 14, C.lav, .06);
  const cx = 960, by = 900, ry = 620, rx = 330; X.beginPath(); for (let i = 0; i <= 15; i++) { const t = i / 15, xx = cx - rx + t * 2 * rx, top = by - ry + (1 - Math.sin(Math.PI * t)) * 240; X.moveTo(xx, by); X.lineTo(xx, top + 120); X.quadraticCurveTo(xx, top, cx + (xx - cx) * .1, by - ry); } stroke(C.lav, 1.2, .8);
  gl(cx - rx - 40, by, cx + rx + 40, by, C.white, .9, 1.6);
  const wg = a.wings ? eo(seg(q, .2, .7)) : 0; bird(cx, by - 260, 1.6, wg > .1 ? flap() * wg : 0, { sch: 1, col: C.lav });
  if (a.wings) { gc(cx, by - 270, 140 + wg * 160, C.mag, .9, 2.2, null, Math.PI * 1.1, Math.PI * 1.9); bracket(cx - 140 - wg * 160, by - 450, cx + 140 + wg * 160, by - 450, C.mag, .9, 'WINGSPAN ' + Math.round(wg * 38) + ' CM'); }
  else { lab(cx + rx + 60, by - 300, 'SONG · 0 DB', C.mag, .95, 15); gc(cx + 60, by - 300, 50, C.mag, .6, 1.4, [3, 5]); }
  bracket(cx - rx, by + 50, cx + rx, by + 50, C.cyan, .7, '66 CM');
  screen(); schFrame('18', 'THE CAGE', a.wings ? 'WINGS: REQUIRED' : 'OUTPUT: SILENCE');
} };

SU.sSnow = { mode: 'sch', f(q, p, a, T) {
  schBG(C.navy2); cam(960, 540, lerp(1, 1.18, eo(p)));
  lattice(960, 540, 120, 6, C.lav, .1); gc(960, 540, 460, C.lav, .2, 1, [3, 7]);
  const g = eo(q * 1.2); X.beginPath();
  for (let i = 0; i < 6; i++) { const an = i * TAU / 6 - Math.PI / 2, L = 380 * g; X.moveTo(960, 540); X.lineTo(960 + Math.cos(an) * L, 540 + Math.sin(an) * L);
    for (let k = 1; k <= 5; k++) { const d = L * k / 6, bl = (L - d) * .35; for (const s of [-1, 1]) { const bx = 960 + Math.cos(an) * d, by = 540 + Math.sin(an) * d; X.moveTo(bx, by); X.lineTo(bx + Math.cos(an + s * Math.PI / 3) * bl, by + Math.sin(an + s * Math.PI / 3) * bl); } } }
  stroke(C.white, 1.6, .95); iP(hexPts(960, 540, 60 * g, 0), true, C.cyan, 1.4, .9, false, .2); star(960, 540, 6, C.white, 1);
  snowFlakes(220, T, C.lav, .7, 2.4);
  traveller(1500, 940, .9, { sch: 1, col: C.lav, hat: false, look: 0 }); lab(1500, 990, 'CLOTHING: NONE', C.mag, .9, 13, 'center');
  screen(); schFrame('19', 'CRYSTAL', '6-FOLD · −15 °C');
} };

SU.sEnd = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.2, 1, ex(p * 1.4)));
  lattice(960, 540, 90, 10, C.lav, .05); gc(960, 540, 470, C.lav, .15); gl(0, 0, W, H, C.lav, .08); gl(W, 0, 0, H, C.lav, .08);
  gc(960, 540, 300, C.lav, .4, 1); ticks(960, 540, 316, 120, 6, C.lav, .4, 1, 10);
  gc(960, 540, 300, C.mag, 1, 3, null, -Math.PI / 2, -Math.PI / 2 + eo(p * 1.1) * TAU);
  if (p > .85) star(960, 240, 7, C.mag, 1);
  traveller(960, 640, .5, { sch: 1, col: C.lav, case: true });
  lab(960, 700, 'BACK AT THE DESK', C.lav, .7, 13, 'center');
} };

// The cut list lives in story.js.

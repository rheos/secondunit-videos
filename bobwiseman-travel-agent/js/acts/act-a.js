// Act A (0 - 116.6 s): grounded, then one impossible thing per scene.
// Intro: the street, the shop, the posters, in through the door. Verse: the old-fashioned office, the news, the globe.
// From 59: the sun as a loudspeaker, the sun in a shell, a car that sails on land, the road rolling up.
// Chorus 1: the agent is a voice on a roadside payphone; she answers from a desk on top of a telephone pole.
// Every cut is a new picture; each SCH insert diagrams the ILL shot just before it.
'use strict';

// ---------- helpers ----------
function a_facade(x, y, w, h, col, name, seed, awn) { // a shopfront on the street: y is the pavement line
  const r = M32(seed), f = PR(x, y - h, w, h); fillP(f, col); shade(f, x + w / 2, y - h / 2, Math.max(w, h), [-w * .12, 0], .8, 7, C.ink, .35);
  X.beginPath(); for (let yy = y - h + 18; yy < y; yy += 18) { X.moveTo(x, yy); X.lineTo(x + w, yy); } stroke(C.ink, .8, .18);
  iBox(x, y - h, w, h, C.ink, 2.4);
  const cn = PR(x - 12, y - h - 22, w + 24, 22); fillP(cn, C.tan); hatch(cn, x + w / 2, y - h - 11, w, 0, 4, C.ink, .8, .5); iBox(x - 12, y - h - 22, w + 24, 22, C.ink, 2);
  const rows = Math.max(1, Math.floor((h - 300) / 150)), cols = Math.max(1, Math.floor(w / 130));
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
    const ww = w / cols, wx = x + j * ww + ww * .22, wy = y - h + 40 + i * 150, wp = PR(wx, wy, ww * .56, 100);
    fillP(wp, r() < .3 ? C.ochre : '#cfd8cc'); hatch(wp, wx + ww * .28, wy + 50, 80, -.9, 12, C.cream, 2.4, .35); hatch(wp, wx + ww * .28, wy + 50, 80, .8, 5, C.ink, .8, .35, [8, 8]);
    iBox(wx, wy, ww * .56, 100, C.ink, 1.8); iline(wx + ww * .28, wy, wx + ww * .28, wy + 100, C.ink, 1.4, 1, false); iline(wx - 6, wy + 104, wx + ww * .56 + 6, wy + 104, C.ink, 3, 1, false);
  }
  // shop window + sign + door at street level
  const sy = y - 270, sg = PR(x + 20, sy - 70, w - 40, 56); fillP(sg, C.cream); iBox(x + 20, sy - 70, w - 40, 56, C.ink, 2);
  X.font = 'bold 34px Georgia, serif'; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = C.ink; X.fillText(name, x + w / 2 + jit(1), sy - 40 + jit(1));
  if (awn) { const ap = PP([[x + 10, sy], [x + w - 10, sy], [x + w + 10, sy + 50], [x - 10, sy + 50]]); fillP(ap, C.cream); X.save(); X.clip(ap); for (let i = 0; i < w / 40 + 2; i++) fillP(PR(x - 10 + i * 40, sy, 20, 60), awn); X.restore(); iP([[x + 10, sy], [x + w - 10, sy], [x + w + 10, sy + 50], [x - 10, sy + 50]], true, C.ink, 2); }
  const sw = PR(x + 24, sy + 70, w * .55, 190); fillP(sw, '#cbd6cf'); hatch(sw, x + 24 + w * .27, sy + 165, 200, -.95, 16, C.cream, 3, .35); hatch(sw, x + 24 + w * .27, sy + 165, 200, .8, 6, C.ink, .8, .3, [-30, 20]); iBox(x + 24, sy + 70, w * .55, 190, C.ink, 2.4);
  const dw = w * .3, dx = x + w - dw - 20, dp = PR(dx, sy + 40, dw, 230); fillP(dp, r() < .5 ? C.teal : C.plum); shade(dp, dx + dw / 2, sy + 155, 200, [-20, 0], .9, 5); iBox(dx, sy + 40, dw, 230, C.ink, 2.4); fillP(PE(dx + dw - 14, sy + 160, 6, 6), C.ochre);
}
function a_pole(x, y, h, s = 1, col = '#7a5634') { // telephone pole: foot at (x,y); returns the crossarm insulator points
  const pw = 16 * s, pp = PP([[x - pw, y], [x - pw * .7, y - h], [x + pw * .7, y - h], [x + pw, y]]); fillP(pp, col); hatch(pp, x, y - h / 2, h, 1.45, 5 * s, C.ink, .8, .6, [pw * .6, 0]); iP([[x - pw, y], [x - pw * .7, y - h], [x + pw * .7, y - h], [x + pw, y]], true, C.ink, 2.2 * Math.max(.5, s));
  const ay = y - h + 30 * s, aw = 120 * s, arm = PR(x - aw, ay, aw * 2, 12 * s); fillP(arm, col); iBox(x - aw, ay, aw * 2, 12 * s, C.ink, 1.8 * Math.max(.5, s));
  const pts = []; for (const dx of [-.85, -.4, .4, .85]) { const ix = x + aw * dx, iy = ay - 14 * s; fillP(PE(ix, iy + 4 * s, 6 * s, 9 * s), C.sage); iE(ix, iy + 4 * s, 6 * s, 9 * s, 0, C.ink, 1.4 * Math.max(.5, s), 1, false); pts.push([ix, iy]); }
  return pts;
}
function a_wire(x1, y1, x2, y2, sag, col = C.ink, w = 1.6, a = .9) { X.beginPath(); for (let i = 0; i <= 24; i++) { const t = i / 24; const xx = lerp(x1, x2, t), yy = lerp(y1, y2, t) + Math.sin(t * Math.PI) * sag; i ? X.lineTo(xx + jit(.6), yy + jit(.6)) : X.moveTo(xx, yy); } stroke(col, w, a); }
const a_wireAt = (x1, y1, x2, y2, sag, t) => [lerp(x1, x2, t), lerp(y1, y2, t) + Math.sin(t * Math.PI) * sag];
function a_noteGlyph(x, y, s, col = '#3f5f8f', rot = .15) { X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s); fillP(PE(0, 0, 9, 7, -.4), col); iline(8, -1, 8, -32, col, 2.2, 1, false); iline(8, -32, 18, -24, col, 2.2, 1, false); X.restore(); }
function a_fields(hz, col1 = '#b9b98a', col2 = C.sage) { // flat farmland to a low horizon, furrows converging
  const g = PR(-300, hz, W + 600, H - hz + 300); fillP(g, col1); hatch(g, 960, hz + 300, 1500, -.15, 9, C.ink, .8, .28);
  X.beginPath(); for (let i = -30; i <= 30; i++) { X.moveTo(960 + i * 14, hz); X.lineTo(960 + i * 260, H + 300); } stroke(C.ink, 1, .3);
  for (let i = 0; i < 5; i++) { const y = hz + 20 + i * i * 26, band = PR(-300, y, W + 600, 10 + i * 6); fillP(band, i % 2 ? col2 : C.ochre, .55); }
  iline(-300, hz, W + 300, hz, C.ink, 2.2);
}
// draft 6: the arm angles that put the traveller's hand at (hx, hy) in his own local units (side 1 = front arm, -1 = back)
function a_armTo(side, hx, hy) { const sx = side * 26, sy = -262, [, e, h] = ik(sx, sy, hx, hy, side), a1 = Math.atan2(e[0] - sx, e[1] - sy); return [a1, Math.atan2(h[0] - e[0], h[1] - e[1]) - a1]; }
// his fedora on its own, brim centre at (0,0) in the current transform, crown up, local units as traveller()
function a_fedora(s = 1) {
  const k = 1 / s; X.save(); X.scale(s, s);
  const cr = [[-26, 0], [-22, -34], [0, -28], [22, -34], [26, 0]], crp = PP(cr); fillP(crp, '#4b3426'); shade(crp, 0, -15, 34, [6, -4], .7, 4 * k); iP(cr, true, C.ink, 2.2 * k, 1, true, .8 * k);
  X.beginPath(); wP([[-25, -8], [25, -8]], false, .4 * k); stroke(C.ochre, 4 * k, .9);
  const hb = PE(0, 0, 46, 8); fillP(hb, '#3d2a1f'); iE(0, 0, 46, 8, 0, C.ink, 2 * k, 1, true, .8 * k);
  X.restore();
}
// a hand blob for the traveller's back arm, which traveller() draws without one
function a_backHand(x, y, s) { fillP(PE(x, y + 4 * s, 8 * s, 9 * s), '#efd9b9'); iE(x, y + 4 * s, 8 * s, 9 * s, 0, C.ink, 1.8); }

// ---------- 0.0 the street: a row of other shops; he walks in small under his cloud ----------
SU.a_street = { mode: 'ill', f(q, p, a, T) {
  stripes('#e9e2cc', '#dad7c2', 150, -.62, -T * 10, C.sage);
  cam(lerp(820, 1120, eio(p)), 540, 1);
  const py = 840;
  const shops = [[-220, 360, 560, C.ochre, 'BARBER', '#b8432f'], [160, 330, 640, C.sage, 'LAUNDRY', C.teal], [520, 420, 520, C.rose, 'CAFE', C.orange], [970, 330, 700, '#b9a27a', 'PAWN', null], [1330, 430, 600, C.plum, 'HARDWARE', C.ochre], [1790, 380, 560, C.brick, 'BAKERY', C.rose], [2200, 340, 660, C.sage, 'SHOES', C.teal]];
  shops.forEach(([x, w, h, col, nm, aw], i) => a_facade(x, py, w, h, col, nm, 300 + i, aw));
  // chimneys + roofline aerials
  for (let i = 0; i < 6; i++) { const cx = -100 + i * 420, ch = PR(cx, 160 + (i % 3) * 40, 40, 90); fillP(ch, C.brick); iBox(cx, 160 + (i % 3) * 40, 40, 90, C.ink, 2); iline(cx + 80, 200, cx + 80, 90, C.ink, 1.6, 1, false); iline(cx + 60, 110, cx + 100, 110, C.ink, 1.4, 1, false); }
  // pavement, kerb, road
  const pv = PR(-400, py, W + 1000, 120); fillP(pv, '#cdbb98'); hatch(pv, 960, py + 60, 1600, .2, 9, C.ink, .8, .3);
  X.beginPath(); for (let x = -400; x < W + 600; x += 120) { X.moveTo(x, py); X.lineTo(x - 50, py + 120); } stroke(C.ink, 1.1, .45);
  iline(-400, py, W + 600, py, C.ink, 2.6); iline(-400, py + 120, W + 600, py + 120, C.ink, 3);
  const rd = PR(-400, py + 124, W + 1000, 300); fillP(rd, '#8a8172'); hatch(rd, 960, py + 240, 1600, .05, 6, C.ink, .9, .45);
  for (let x = -400; x < W + 600; x += 220) fillP(PR(x, py + 190, 110, 10), C.cream);
  // puddles reflecting the sky
  for (const [x, w] of [[420, 140], [1180, 200], [1720, 120]]) { const pd = PE(x, py + 70, w, 14); fillP(pd, C.sky); hatch(pd, x, py + 70, w, 0, 4, C.cream, 1.4, .6); iE(x, py + 70, w, 14, 0, C.ink, 1.6, 1, false); }
  // lamp posts
  for (const lx of [80, 1000, 1900]) { iline(lx, py + 20, lx, 260, C.ink, 6); iline(lx, 260, lx + 60, 260, C.ink, 4); const l = PE(lx + 60, 280, 20, 16); fillP(l, C.cream); iE(lx + 60, 280, 20, 16, 0, C.ink, 2); }
  // him, small, walking right under the cloud
  const tx = lerp(260, 1320, p), ty = py + 50;
  traveller(tx, ty, .6, { legs: walkPh(), case: true, look: 1 }); cloud(tx - 6, ty - 300, .5, { rain: true });
  X.setLineDash([12, 10]); X.beginPath(); X.moveTo(tx + 60, ty - 20); X.lineTo(2300, ty - 20); stroke(C.teal, 1.8, .7); X.setLineDash([]);
  for (let i = 0; i < 3; i++) gc(tx, ty - 300, 90 + i * 22, C.orange, .6, 1.6, null, Math.PI * .95 + i * .2, Math.PI * 1.4 + i * .2);
  consL([[-400, py, W + 600, py], [-400, 280, W + 600, 280], [tx, -100, tx, H + 100]]);
} };

// ---------- 10.8 the puddle: his shoe steps by a puddle that holds the TRAVEL AGENT sign, upside down ----------
SU.a_puddle = { mode: 'ill', f(q, p, a, T) {
  stripes('#d9cfb8', '#cdbfa2', 120, -.3, 0, C.tan);
  cam(960, 540, lerp(1.06, 1, eo(p)));
  // cobbles in perspective
  const g = PR(-200, 200, W + 400, H); fillP(g, '#bfae8a'); hatch(g, 960, 700, 1300, .3, 8, C.ink, .8, .25);
  X.beginPath(); for (let i = 0; i < 14; i++) { const y = 200 + Math.pow(i / 13, 1.6) * 900; X.moveTo(-200, y); X.lineTo(W + 200, y); } for (let i = -20; i <= 20; i++) { X.moveTo(960 + i * 40, 200); X.lineTo(960 + i * 220, H + 40); } stroke(C.ink, 1.3, .45);
  const kb = PR(-200, 120, W + 400, 80); fillP(kb, '#9c8d72'); hatch(kb, 960, 160, 1300, 0, 5, C.ink, .9, .5); iline(-200, 200, W + 200, 200, C.ink, 3); iline(-200, 120, W + 200, 120, C.ink, 2.4);
  // the puddle and what it holds
  const pc = [960, 640], pd = PE(pc[0], pc[1], 620, 230, -.04); fillP(pd, C.sky);
  X.save(); X.clip(pd);
  const fb = PR(400, 420, 1120, 420); fillP(fb, C.brick); X.beginPath(); for (let y = 420; y < 840; y += 20) { X.moveTo(400, y); X.lineTo(1520, y); } stroke(C.ink, 1, .3);
  X.save(); X.translate(960, 640); X.scale(1, -1);
  const sg = PR(-380, -120, 760, 110); fillP(sg, C.cream); iBox(-380, -120, 760, 110, C.ink, 2.4);
  X.font = 'bold 74px Georgia, serif'; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = C.ink; X.fillText('TRAVEL  AGENT', jit(1), -64 + jit(1));
  const aw = PP([[-420, 20], [420, 20], [450, 110], [-450, 110]]); fillP(aw, C.cream); X.save(); X.clip(aw); for (let i = 0; i < 22; i++) fillP(PR(-450 + i * 44, 20, 22, 100), C.orange); X.restore(); iP([[-420, 20], [420, 20], [450, 110], [-450, 110]], true, C.ink, 2);
  X.restore();
  cloud(560, 470, .8, {});
  hatch(pd, 960, 640, 700, -.08, 13, C.cream, 2.4, .45, null, .4); hatch(pd, 960, 640, 700, .9, 6, C.ink, .8, .25, [0, -60]);
  X.restore();
  iE(pc[0], pc[1], 620, 230, -.04, C.ink, 3); iE(pc[0], pc[1], 600, 214, -.04, C.ink, 1.2, .5, false);
  // rain rings on the water
  for (let i = 0; i < 9; i++) { const r2 = M32(i * 17 + 3), rx = 520 + r2() * 880, ry = 520 + r2() * 220, ph = ((T * 1.3 + r2()) % 1); iE(rx, ry, 8 + ph * 60, (8 + ph * 60) * .3, 0, C.teal, 1.6, (1 - ph) * .9, false); }
  rain(-100, -100, W + 200, 600, 70, C.teal, .6);
  // his shoe comes down beside it, then lifts on
  const st = p < .45 ? eo(p / .45) : 1 - eo(seg(p, .8, 1)), sx = lerp(1260, 1380, p), sy = lerp(-120, 760, st);
  const leg = PP([[sx - 70, sy - 1200], [sx + 70, sy - 1200], [sx + 70, sy - 70], [sx - 70, sy - 70]]); fillP(leg, '#4a3b33'); shade(leg, sx, sy - 400, 700, [24, 0], 1.4, 6); iP(dens([[sx - 70, sy - 1200], [sx - 70, sy - 70], [sx + 70, sy - 70], [sx + 70, sy - 1200]], 40), false, C.ink, 3);
  const cuff = PR(sx - 76, sy - 100, 152, 34); fillP(cuff, '#3e3129'); iBox(sx - 76, sy - 100, 152, 34, C.ink, 2.4);
  const coat = PP([[sx - 150, sy - 1200], [sx + 120, sy - 1200], [sx + 160, sy - 380], [sx - 170, sy - 360]]); fillP(coat, C.teal); shade(coat, sx, sy - 800, 600, [-30, 0], .9, 6); iP(dens([[sx - 170, sy - 360], [sx - 150, sy - 1200]], 30), false, C.ink, 3); iP(dens([[sx + 160, sy - 380], [sx + 120, sy - 1200]], 30), false, C.ink, 3); iP(dens([[sx - 170, sy - 360], [sx + 160, sy - 380]], 30), false, C.ink, 3);
  const shoe = PE(sx - 40, sy - 30, 150, 46); fillP(shoe, '#2b1d14'); hatch(shoe, sx - 40, sy - 30, 150, .6, 4, C.cream, .9, .25, [20, 20]); iE(sx - 40, sy - 30, 150, 46, 0, C.ink, 3);
  iline(sx - 120, sy - 40, sx + 40, sy - 40, C.ink, 1.6, .8, false);
  if (p > .42 && p < .8) for (let i = 0; i < 4; i++) iE(sx - 60, sy, 160 + i * 60 + (p - .42) * 500, 30 + i * 12 + (p - .42) * 90, 0, C.orange, 2, .8 - i * .16, false);
  consL([[0, 640, W, 640], [960, 0, 960, H], [sx, -100, sx, H + 100]]);
} };

// ---------- 22.5 the door: from inside, the bell rings; he comes in, his cloud ducks under the lintel after him ----------
SU.a_doorBell = { mode: 'ill', f(q, p, a, T) {
  // wallpaper
  stripes('#e8d9b9', '#dccaa2', 60, 1.5708, 0, C.ochre);
  cam(960, 540, lerp(1, 1.06, eo(p)));
  for (let i = 0; i < 40; i++) { const x = -100 + (i % 10) * 220, y = 60 + Math.floor(i / 10) * 260; const fl = PE(x + ((i / 10 | 0) % 2) * 110, y, 14, 18); fillP(fl, C.rose, .7); iE(x + ((i / 10 | 0) % 2) * 110, y, 14, 18, 0, C.ink, 1.2, .6, false); }
  const fl = PR(-200, 930, W + 400, 300); fillP(fl, '#9a7a52'); hatch(fl, 960, 1000, 1400, 0, 7, C.ink, .9, .4); X.beginPath(); for (let x = -200; x < W + 200; x += 110) { X.moveTo(x, 930); X.lineTo(x + (x - 760) * .4, 1200); } stroke(C.ink, 1.1, .5); iline(-200, 930, W + 200, 930, C.ink, 2.6);
  const sk = PR(-200, 900, W + 400, 30); fillP(sk, '#7a5634'); iBox(-200, 900, W + 400, 30, C.ink, 2);
  // the doorway: the wet street outside
  const dx = 520, dy = 160, dw = 480, dh = 770, op = PR(dx, dy, dw, dh); fillP(op, C.sky);
  X.save(); X.clip(op);
  const ob = PR(dx - 40, dy + 80, dw + 80, 420); fillP(ob, C.sage); X.beginPath(); for (let y = dy + 90; y < dy + 500; y += 20) { X.moveTo(dx - 40, y); X.lineTo(dx + dw + 40, y); } stroke(C.ink, 1, .3); iBox(dx - 40, dy + 80, dw + 80, 420, C.ink, 2);
  for (const wx of [dx + 30, dx + 260]) { const wp = PR(wx, dy + 160, 160, 120); fillP(wp, '#cfd8cc'); hatch(wp, wx + 80, dy + 220, 100, -.9, 12, C.cream, 2.4, .4); iBox(wx, dy + 160, 160, 120, C.ink, 1.8); }
  const sv = PR(dx - 40, dy + 500, dw + 80, 300); fillP(sv, '#cdbb98'); hatch(sv, dx + dw / 2, dy + 600, 400, .2, 8, C.ink, .8, .35); iline(dx - 40, dy + 500, dx + dw + 40, dy + 500, C.ink, 2.2);
  rain(dx, dy, dw, dh, 60, C.teal, .7);
  X.restore();
  // the door swings in toward camera on its left hinge
  const op2 = eo(seg(p, 0, .35)), dwv = dw * lerp(1, .18, op2), door = PP([[dx, dy], [dx - dwv * .25 * op2 + dwv, dy - 40 * op2], [dx - dwv * .25 * op2 + dwv, dy + dh + 50 * op2], [dx, dy + dh]]);
  fillP(door, C.teal); shade(door, dx + dwv / 2, dy + dh / 2, 500, [-30, 0], .9, 5); iP([[dx, dy], [dx - dwv * .25 * op2 + dwv, dy - 40 * op2], [dx - dwv * .25 * op2 + dwv, dy + dh + 50 * op2], [dx, dy + dh]], true, C.ink, 3);
  if (dwv > 120) { const gp = PR(dx + dwv * .18, dy + 60, dwv * .6, 280); fillP(gp, '#dfe6dd'); iBox(dx + dwv * .18, dy + 60, dwv * .6, 280, C.ink, 2); lab(dx + dwv * .48, dy + 210, 'OPEN', C.ink, .9, 22 * dwv / dw + 6, 'center', 'middle', 'bold'); }
  // frame
  const fr = [[dx - 40, dy + dh], [dx - 40, dy - 40], [dx + dw + 40, dy - 40], [dx + dw + 40, dy + dh]]; X.lineWidth = 1; for (const [x0, y0, w0, h0] of [[dx - 40, dy - 40, 40, dh + 40], [dx + dw, dy - 40, 40, dh + 40], [dx - 40, dy - 40, dw + 80, 40]]) { const pf = PR(x0, y0, w0, h0); fillP(pf, '#7a5634'); hatch(pf, x0 + w0 / 2, y0 + h0 / 2, Math.max(w0, h0), .4, 5, C.ink, .8, .5); }
  iP(fr, false, C.ink, 3); iBox(dx, dy, dw, dh, C.ink, 2.2, 1, false);
  // him stepping in, his cloud ducking under the lintel after him
  const ts = lerp(1.25, 1.75, eo(seg(p, .15, 1))), tx = lerp(800, 860, p), ty = lerp(900, 1130, eo(seg(p, .15, 1)));
  const cx = lerp(820, 860, p), cy = lerp(60, dy + 120, eo(seg(p, .3, .9))), cs = lerp(.75, .6, p);
  if (cy < dy + 60) { X.save(); X.clip(PR(dx - 400, -400, dw + 800, dy - 40 + 400)); cloud(cx, cy - 120, cs, { rain: true }); X.restore(); }
  traveller(tx, ty, ts, { legs: walkPh() * .7, case: true, look: -.3, armL: [.3, -.3] });
  if (cy >= dy + 60) cloud(cx, cy, cs, { rain: true });
  // the bell on its curly bracket
  const bx = dx + dw + 40, by = dy - 60, sw = Math.sin(T * 22) * .5 * (1 - seg(p, .5, 1));
  X.beginPath(); X.moveTo(bx + 60, by - 40); X.quadraticCurveTo(bx + 20, by - 70, bx, by - 30); X.arc(bx + 14, by - 30, 14, Math.PI, TAU); stroke(C.ink, 3, 1);
  X.save(); X.translate(bx, by - 30); X.rotate(sw); const bl = PP([[-30, 60], [-24, 18], [-12, 4], [12, 4], [24, 18], [30, 60]]); fillP(bl, C.ochre); shade(bl, 0, 30, 40, [8, -4], .7, 4); iP([[-30, 60], [-24, 18], [-12, 4], [12, 4], [24, 18], [30, 60]], true, C.ink, 2.4); fillP(PE(0, 66, 8, 8), C.ink); X.restore();
  for (let i = 0; i < 4; i++) { const rr = 50 + i * 30 + ((FD * 6) % 30); gc(bx, by + 10, rr, C.orange, .85 * (1 - p * .7), 2.2, null, -1.2, .4); }
  // inside: coat hooks, umbrella stand, mat
  iline(1200, 300, 1560, 300, C.ink, 4); for (let i = 0; i < 4; i++) { const hx = 1230 + i * 100; X.beginPath(); X.moveTo(hx, 300); X.quadraticCurveTo(hx + 20, 330, hx + 4, 346); stroke(C.ink, 3, 1); }
  const coat2 = PP([[1310, 330], [1360, 330], [1390, 640], [1280, 640]]); fillP(coat2, C.ochre); shade(coat2, 1335, 480, 200, [12, 0], .9, 5); iP([[1310, 330], [1360, 330], [1390, 640], [1280, 640]], true, C.ink, 2.2);
  const us = PR(1500, 720, 110, 190); fillP(us, C.brick); shade(us, 1555, 815, 120, [14, 0], .9, 4); iBox(1500, 720, 110, 190, C.ink, 2.4); for (const ux of [1520, 1560, 1590]) iline(ux, 720, ux + 20, 560, C.ink, 4);
  const mat = PP([[560, 960], [1000, 960], [1060, 1060], [500, 1060]]); fillP(mat, '#b9925f'); hatch(mat, 780, 1010, 300, 1.57, 5, C.ink, .9, .45); iP([[560, 960], [1000, 960], [1060, 1060], [500, 1060]], true, C.ink, 2.4); lab(780, 1030, 'WELCOME', C.ink, .8, 20, 'center', 'middle', 'bold');
  gc(dx, dy + dh, 380 * op2, C.teal, .7, 1.6, [8, 8], -Math.PI / 2, 0);
  consL([[0, 930, W, 930], [dx, -100, dx, H + 100], [dx + dw, -100, dx + dw, H + 100]]);
} };

// ---------- 27.6 the office: wide, old-fashioned; she is at the far desk, he drips on the mat ----------
SU.a_interior = { mode: 'ill', f(q, p, a, T) {
  stripes('#eadcbc', '#dfcca4', 90, 1.5708, 0, C.tan);
  cam(lerp(960, 1040, eo(p)), lerp(540, 560, eo(p)), lerp(1, 1.12, eo(p)));
  // wainscot + floor
  const ws = PR(-200, 640, W + 400, 300); fillP(ws, '#a5703f'); shade(ws, 960, 790, 1200, [0, -40], 1.57, 8, C.ink, .4); X.beginPath(); for (let x = -200; x < W + 200; x += 120) { X.moveTo(x, 650); X.lineTo(x, 930); } stroke(C.ink, 1.2, .5); iBox(-200, 640, W + 400, 290, C.ink, 2.4);
  const fl = PR(-200, 930, W + 400, 300); fillP(fl, '#8a6a44'); X.beginPath(); for (let i = 0; i < 18; i++) { const x = -200 + i * 150; X.moveTo(x, 930); X.lineTo(960 + (x - 960) * 1.9, 1200); } stroke(C.ink, 1.2, .55); hatch(fl, 960, 1040, 1400, 0, 9, C.ink, .8, .35); iline(-200, 930, W + 200, 930, C.ink, 2.6);
  // world map on the back wall, pins in it
  const mp = PR(700, 160, 640, 360); fillP(mp, C.sky); X.save(); X.clip(mp); for (let i = 0; i < 5; i++) { const r2 = M32(60 + i), cx = 760 + r2() * 520, cy = 200 + r2() * 280, pts = []; for (let k = 0; k < 12; k++) { const an = k / 12 * TAU, rr = 40 + r2() * 50; pts.push([cx + Math.cos(an) * rr * 1.4, cy + Math.sin(an) * rr]); } fillP(PP(pts), C.sage); hatch(PP(pts), cx, cy, 90, .6, 4, C.ink, .8, .5); iP(pts, true, C.ink, 1.4, 1, false); } graticule(1020, 340, 640, 360, 40, C.ink, .2); X.restore(); iBox(700, 160, 640, 360, C.ink, 3);
  for (const [px, py, col] of [[820, 260, C.brick], [1180, 420, C.orange], [1010, 330, C.teal], [1260, 230, C.brick]]) { iline(px, py, px + 10, py - 18, C.ink, 1.4, 1, false); fillP(PE(px + 10, py - 20, 6, 6), col); iE(px + 10, py - 20, 6, 6, 0, C.ink, 1.2, 1, false); }
  // wall clock
  const ck = PE(470, 230, 80, 80); fillP(ck, C.cream); iE(470, 230, 80, 80, 0, C.ink, 3); iE(470, 230, 92, 92, 0, C.ink, 2); ticks(470, 230, 64, 12, 10, C.ink, .9, 2); const ma = T * .5, ha = ma / 12 + 1.2; iline(470, 230, 470 + Math.sin(ha) * 40, 230 - Math.cos(ha) * 40, C.ink, 4, 1, false); iline(470, 230, 470 + Math.sin(ma) * 60, 230 - Math.cos(ma) * 60, C.ink, 2.6, 1, false);
  // venetian blind window, right
  const wn = PR(1460, 160, 340, 420); fillP(wn, '#e9e1c4'); for (let i = 0; i < 18; i++) { const sl = PR(1460, 170 + i * 23, 340, 12); fillP(sl, C.wax); iline(1460, 182 + i * 23, 1800, 182 + i * 23, C.ink, 1, .6, false); } iBox(1460, 160, 340, 420, C.ink, 3); iline(1630, 160, 1630, 580, C.ink, 1.2, .8, false);
  // filing cabinets, left
  for (let i = 0; i < 2; i++) { const cx = 60 + i * 190, cb = PR(cx, 520, 180, 410); fillP(cb, '#8f9a86'); shade(cb, cx + 90, 720, 260, [20, 0], .9, 5); iBox(cx, 520, 180, 410, C.ink, 2.6); for (let d = 0; d < 4; d++) { iBox(cx + 14, 536 + d * 98, 152, 86, C.ink, 1.6, 1, false); fillP(PR(cx + 70, 570 + d * 98, 40, 10), C.ink); const lb = PR(cx + 64, 546 + d * 98, 52, 16); fillP(lb, C.cream); } }
  // ceiling fan turning
  iline(1020, -200, 1020, 70, C.ink, 4); const hb = PE(1020, 80, 34, 16); fillP(hb, C.dark); iE(1020, 80, 34, 16, 0, C.ink, 2);
  for (let i = 0; i < 4; i++) { const an = T * 4 + i * TAU / 4, ex2 = 1020 + Math.cos(an) * 260, ey2 = 84 + Math.sin(an) * 28, bl = PP([[1020, 78], [ex2, ey2 - 10], [ex2, ey2 + 10], [1020, 90]]); fillP(bl, '#7a5634'); iP([[1020, 78], [ex2, ey2 - 10], [ex2, ey2 + 10], [1020, 90]], true, C.ink, 1.8); }
  // her desk, far, with typewriter
  desk(1220, 720, 520, .8); agent(1220, 720, 1.1, { look: -.5, talk: 0 });
  const tw = PP([[1290, 700], [1420, 700], [1400, 650], [1310, 650]]); fillP(tw, '#2b2420'); iP([[1290, 700], [1420, 700], [1400, 650], [1310, 650]], true, C.ink, 2); const pp = PR(1325, 590, 60, 62); fillP(pp, C.cream); iBox(1325, 590, 60, 62, C.ink, 1.6);
  const pl = PR(1050, 640, 60, 62); fillP(pl, C.brick); iBox(1050, 640, 60, 62, C.ink, 2); for (let i = 0; i < 5; i++) { const an = -2.6 + i * .5; const lf = PE(1080 + Math.cos(an) * 50, 640 + Math.sin(an) * 50, 12, 40, an + 1.57); fillP(lf, C.sage); iE(1080 + Math.cos(an) * 50, 640 + Math.sin(an) * 50, 12, 40, an + 1.57, C.ink, 1.6, 1, false); }
  // him on the mat, hat in hand, dripping; his cloud presses on the ceiling
  const mat = PP([[420, 990], [760, 990], [800, 1060], [380, 1060]]); fillP(mat, '#b9925f'); hatch(mat, 590, 1020, 240, 1.57, 5, C.ink, .9, .45); iP([[420, 990], [760, 990], [800, 1060], [380, 1060]], true, C.ink, 2.2);
  const pd = PE(600, 1040, 150, 16); fillP(pd, C.sky, .9); iE(600, 1040, 150, 16, 0, C.ink, 1.4, 1, false);
  // hat in hand: he holds it by the brim at his side, crown out, dripping onto the mat
  const HA = a_armTo(1, 58, -150); traveller(600, 1040, 1.3, { look: .9, hat: false, armR: HA, case: false });
  { const [hx, hy] = handAt(600, 1040, 1.3, HA); X.save(); X.translate(hx, hy + 8); X.rotate(1.3); X.translate(40 * 1.3, 0); a_fedora(1.3); X.restore(); a_backHand(hx, hy, 1.3);
    for (let i = 0; i < 3; i++) { const d2 = ((T * 1.6 + i / 3) % 1); fillP(PE(hx + 6 + i * 6, lerp(hy + 100, 1030, d2), 3, 6), C.teal); } }
  suitcase(430, 950, .9);
  cloud(600, 120, .62, { rain: true });
  for (let i = 0; i < 6; i++) { const dy2 = ((T * 2 + i / 6) % 1); fillP(PE(560 + i * 14, lerp(780, 1030, dy2), 3, 6), C.teal); }
  X.setLineDash([10, 9]); X.beginPath(); X.moveTo(680, 640); X.quadraticCurveTo(900, 520, 1160, 520); stroke(C.teal, 1.8, .8); X.setLineDash([]);
  consL([[0, 930, W, 930], [0, 640, W, 640], [1220, 0, 1220, H]]);
} };

// ---------- 35.0 the newspaper: she opens the paper; the forecast over his town is one cloud ----------
SU.a_newspaper = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#ead6a6', 120, -.62, 0, C.ochre);
  cam(960, 550, lerp(1, 1.08, eo(p)));
  // her head behind the paper: bun, pencil, glasses over the top edge
  X.save(); X.translate(960, 262); X.scale(2.2, 2.2); const hd = PE(0, -10, 30, 34); fillP(hd, '#e7c9a2'); shade(hd, 0, -10, 40, [-8, -6], .5, 4); iE(0, -10, 30, 34, 0, C.ink, 1.2);
  const hr = PE(0, -36, 32, 16); fillP(hr, '#3b2a22'); hatch(hr, 0, -36, 36, .3, 2.4, C.ink, .6, .6); iE(0, -36, 32, 16, 0, C.ink, 1); const bn = PE(-6, -64, 18, 15); fillP(bn, '#3b2a22'); hatch(bn, -6, -64, 20, .3, 2.4, C.ink, .6, .6); iE(-6, -64, 18, 15, 0, C.ink, 1);
  iline(-30, -80, 20, -52, C.ink, 2.4, 1, false); iline(-3, -10, 3, -10, C.ink, 1, 1, false); // round reading glasses, brows up: she reads, she doesn't glare
  for (const sx of [-1, 1]) { const gx = sx * 12; fillP(PE(gx, -10, 9, 7), '#f3ebd6', .6); iE(gx, -10, 9, 7, 0, C.ink, 1.2, 1, false, .3); fillP(PE(gx, -9, 1.7, 1.7), C.ink); X.beginPath(); X.moveTo(gx - 7, -23); X.quadraticCurveTo(gx, -27, gx + 7, -23); stroke(C.ink, 1.1, .9); }
  X.restore();
  // the paper unfolds out from the fold
  const op = eo(seg(p, 0, .3)), x0 = 460, x1 = 1460, y0 = 300, y1 = 1000, cx = 960;
  const lw = (cx - x0) * lerp(.15, 1, op);
  const pg = PP([[cx - lw, y0 + 10], [cx, y0], [cx + lw, y0 + 10], [cx + lw, y1], [cx, y1 - 10], [cx - lw, y1]]); fillP(pg, '#f3ebd6'); hatch(pg, cx, (y0 + y1) / 2, 700, .7, 11, C.ink, .7, .12);
  X.save(); X.clip(pg); X.translate(cx, 0); X.scale(lw / (cx - x0), 1); X.translate(-cx, 0);
  X.font = 'bold 56px Georgia, serif'; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = C.ink; X.fillText('THE DAILY FORECAST', 960, y0 + 60);
  iline(x0 + 30, y0 + 104, x1 - 30, y0 + 104, C.ink, 3); iline(x0 + 30, y0 + 112, x1 - 30, y0 + 112, C.ink, 1.2, 1, false);
  // weather map: sun everywhere, one cloud over him
  const wm = PR(x0 + 30, y0 + 130, 440, 240); fillP(wm, '#e9c58a'); iBox(x0 + 30, y0 + 130, 440, 240, C.ink, 2);
  X.save(); X.clip(wm); const ld = PP([[x0 + 40, y0 + 200], [x0 + 200, y0 + 160], [x0 + 380, y0 + 190], [x0 + 460, y0 + 300], [x0 + 300, y0 + 360], [x0 + 80, y0 + 340]]); fillP(ld, C.sage); hatch(ld, x0 + 250, y0 + 260, 240, .6, 5, C.ink, .8, .45); iP([[x0 + 40, y0 + 200], [x0 + 200, y0 + 160], [x0 + 380, y0 + 190], [x0 + 460, y0 + 300], [x0 + 300, y0 + 360], [x0 + 80, y0 + 340]], true, C.ink, 1.6);
  for (const [sx, sy] of [[x0 + 90, y0 + 180], [x0 + 400, y0 + 240], [x0 + 330, y0 + 330], [x0 + 140, y0 + 310]]) { const sp = PE(sx, sy, 16, 16); fillP(sp, C.orange); iE(sx, sy, 16, 16, 0, C.ink, 1.4); X.beginPath(); for (let k = 0; k < 8; k++) { const an = k / 8 * TAU; X.moveTo(sx + Math.cos(an) * 20, sy + Math.sin(an) * 20); X.lineTo(sx + Math.cos(an) * 28, sy + Math.sin(an) * 28); } stroke(C.ink, 1.4, .8); }
  cloud(x0 + 240, y0 + 240, .28, { rain: true }); fillP(PE(x0 + 240, y0 + 290, 5, 5), C.brick); X.restore();
  // fare sale advert
  const fs = PR(x0 + 520, y0 + 130, 450, 240); fillP(fs, C.cream); iBox(x0 + 520, y0 + 130, 450, 240, C.ink, 2); iBox(x0 + 532, y0 + 142, 426, 216, C.ink, 1.2, 1, false);
  X.font = 'bold 44px Georgia, serif'; X.fillText('FARE SALE', x0 + 745, y0 + 190); plane(x0 + 745, y0 + 280, .4, -.1);
  // columns
  X.beginPath(); for (let c = 0; c < 4; c++) { const cx2 = x0 + 30 + c * 245; for (let l = 0; l < 13; l++) { const y = y0 + 410 + l * 20; X.moveTo(cx2, y); X.lineTo(cx2 + 200 - (l % 5 === 4 ? 80 : 0) + jit(6), y); } } stroke(C.ink, 2, .55);
  X.restore();
  iP([[cx - lw, y0 + 10], [cx, y0], [cx + lw, y0 + 10], [cx + lw, y1], [cx, y1 - 10], [cx - lw, y1]], true, C.ink, 2.6); iline(cx, y0, cx, y1 - 10, C.ink, 1.6, .7, false);
  // her hands at the edges
  for (const sx of [-1, 1]) { const hx = cx + sx * (lw + 10), hp = PE(hx, 640, 34, 52); fillP(hp, '#e7c9a2'); shade(hp, hx, 640, 50, [sx * 8, -6], .6, 4); iE(hx, 640, 34, 52, 0, C.ink, 2.4); limb([[hx + sx * 60, 1200], [hx + sx * 70, 900], [hx + sx * 20, 680]], 40, {}, 1, C.rose); }
  gc(x0 + 270, y0 + 250, 160 * eo(seg(p, .4, .9)), C.orange, .9, 2.4);
  consL([[0, y0 + 130, W, y0 + 130], [cx, 0, cx, H]]);
} };

// ---------- 39.8 the rolodex: cards flip past, every destination on file ----------
const A_DEST = ['LISBON', 'REYKJAVIK', 'TIMBUKTU', 'ULAANBAATAR', 'KATHMANDU', 'TIERRA DEL FUEGO', 'ANYWHERE', 'NOT HERE'];
SU.a_rolodex = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e6d3a8', 130, -.62, 0, C.ochre);
  cam(960, 560, lerp(1.04, 1, eo(p)));
  const dk = PR(-200, 820, W + 400, 400); fillP(dk, '#c08a50'); hatch(dk, 960, 950, 1400, .05, 8, C.ink, .8, .35); X.beginPath(); for (let i = 0; i < 8; i++) { const y = 840 + i * 30; X.moveTo(-200, y); for (let x = -200; x < W + 200; x += 60) X.lineTo(x + 60, y + Math.sin(x * .03 + i) * 4); } stroke(C.ink, .9, .4); iline(-200, 820, W + 200, 820, C.ink, 2.6);
  const ax = 960, ay = 640, R0 = 300, step = Math.floor(p * 16 + T * 0), flip = (p * 16) % 1;
  // base + side wheels
  const base = PP([[620, 820], [1300, 820], [1250, 760], [670, 760]]); fillP(base, '#2b2420'); iP([[620, 820], [1300, 820], [1250, 760], [670, 760]], true, C.ink, 2.6);
  for (const wx of [640, 1280]) { const wh = PE(wx, ay, 46, R0 * .8); fillP(wh, '#3b3530'); shade(wh, wx, ay, R0, [10, 0], .9, 4); iE(wx, ay, 46, R0 * .8, 0, C.ink, 2.6); fillP(PE(wx, ay, 16, 16), C.ochre); iE(wx, ay, 16, 16, 0, C.ink, 1.8); iline(wx, ay + R0 * .8 - 10, wx + (wx < 960 ? -20 : 20), 770, C.ink, 6); }
  iline(640, ay, 1280, ay, C.ink, 5);
  // the cards, fanned around the axle: back stack leans away, one card flips forward, the flipped ones lie toward us
  const Hc = 330, cw0 = 700, cw1 = 1220, cardAt = (th, i, front) => {
    const top = ay - Hc * .75 * Math.cos(th) + Math.sin(th) * Hc * .55, bot = ay + 16 + Math.sin(th) * 12, skew = Math.sin(th) * 40;
    const pts = [[cw0 - skew, top], [cw1 + skew, top], [cw1, bot], [cw0, bot]], cp = PP(pts);
    fillP(cp, front ? '#e2d3b0' : (i % 4 === 0 ? '#f2e3c0' : C.cream)); hatch(cp, 960, (top + bot) / 2, 320, front ? 1.2 : .2, front ? 6 : 9, C.ink, .7, front ? .4 : .16, [0, -10]);
    iP(pts, true, C.ink, 1.6, .9, false); iline(cw0 - skew, top, cw1 + skew, top, C.ink, 2.2, 1, false);
    return top;
  };
  for (let i = 18; i >= 1; i--) cardAt(-.12 - i * .07, i, false);
  const thF = lerp(-.1, 1.45, eio(flip)), d0 = A_DEST[step % A_DEST.length], d1 = A_DEST[(step + 1) % A_DEST.length];
  // the card behind the flipping one, revealed
  const t1 = cardAt(-.12, 0, false); lab(730, t1 + 52, flip > .5 ? d1 : A_DEST[(step + 2) % A_DEST.length], C.ink, flip > .5 ? 1 : .35, 30, 'left', 'alphabetic', 'bold');
  // the lying-forward pile
  for (let i = 1; i <= 8; i++) cardAt(1.2 + i * .04, i, true);
  // the flipping card
  if (thF < Math.PI / 2) { const tp = cardAt(thF, 0, thF > .9); if (thF < .9) { lab(730, tp + 52 + thF * 20, d0, C.ink, 1, 36, 'left', 'alphabetic', 'bold'); X.beginPath(); for (let l = 0; l < 4; l++) { X.moveTo(730, tp + 100 + l * 34 * Math.cos(thF)); X.lineTo(1100 - l * 40, tp + 100 + l * 34 * Math.cos(thF)); } stroke(C.teal, 1.4, .6); lab(1190, tp + 52, 'No.' + (101 + step), C.brick, .9, 16, 'right'); } }
  // her finger flicking the top card
  const fx = 1180, fy = lerp(380, 300, Math.sin(flip * Math.PI)); limb([[1700, 120], [1440, 260], [fx, fy]], 30, {}, 1, '#b8766b'); const fp = PE(fx, fy, 20, 16, -.4); fillP(fp, '#e7c9a2'); iE(fx, fy, 20, 16, -.4, C.ink, 2); fillP(PE(fx - 14, fy - 4, 7, 5, -.4), C.brick);
  for (let i = 0; i < 3; i++) gc(960, ay, R0 + 30 + i * 24, C.orange, .7, 2, null, -2.6 + flip * .3, -1.8 + flip * .3);
  souvenirsOn(1420, 810, T, 1);
  consL([[0, ay, W, ay], [960, 0, 960, H], [0, 820, W, 820]]); consC([[960, ay, R0]]);
} };

// ---------- 50.7 the pencil: she pushes her bun pencil through the desk globe; it comes out the other side ----------
SU.a_pin = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#dfe3cc', 150, -.62, 0, C.sage);
  cam(960, 540, lerp(1, 1.1, eo(p)));
  const gx = 960, gy = 520, r = 330, ang = .62, ux = Math.cos(ang), uy = Math.sin(ang);
  // desk globe stand
  iline(gx, gy + r + 10, gx, gy + r + 120, C.ink, 7); const bs = PE(gx, gy + r + 130, 220, 40); fillP(bs, '#6b4a2e'); shade(bs, gx, gy + r + 130, 230, [0, -12], .4, 5); iE(gx, gy + r + 130, 220, 40, 0, C.ink, 2.6);
  iE(gx, gy, r + 26, r + 26, -.35, C.ink, 4, 1, true, 1.2, -Math.PI * .8, Math.PI * .25);
  globe(gx, gy, r, 1.9);
  const home = [gx - ux * r, gy - uy * r], anti = [gx + ux * r, gy + uy * r];
  fillP(PE(home[0], home[1], 10, 10), C.brick); iE(home[0], home[1], 10, 10, 0, C.ink, 2);
  // the pencil slides along the diameter
  const L = 900, push = eo(seg(p, .05, .7)), tip = [lerp(home[0] - ux * 40, anti[0] + ux * 120, push), lerp(home[1] - uy * 40, anti[1] + uy * 120, push)], tail = [tip[0] - ux * L, tip[1] - uy * L];
  const nx = -uy * 16, ny = ux * 16;
  const shaft = PP([[tail[0] + nx, tail[1] + ny], [tip[0] - ux * 60 + nx, tip[1] - uy * 60 + ny], [tip[0] - ux * 60 - nx, tip[1] - uy * 60 - ny], [tail[0] - nx, tail[1] - ny]]);
  const inG = (x, y) => Math.hypot(x - gx, y - gy) < r;
  // draw the pencil outside the globe only (inside is hidden), then the bit that pokes out
  X.save(); const outside = new Path2D(); outside.rect(-W, -H, 3 * W, 3 * H); outside.addPath(PE(gx, gy, r, r)); X.clip(outside, 'evenodd');
  fillP(shaft, C.ochre); hatch(shaft, (tail[0] + tip[0]) / 2, (tail[1] + tip[1]) / 2, L, ang, 5, C.ink, .9, .55, [nx * .5, ny * .5]);
  const cone = PP([[tip[0] - ux * 60 + nx, tip[1] - uy * 60 + ny], [tip[0], tip[1]], [tip[0] - ux * 60 - nx, tip[1] - uy * 60 - ny]]); fillP(cone, C.tan); fillP(PP([[tip[0] - ux * 18 + nx * .3, tip[1] - uy * 18 + ny * .3], [tip[0], tip[1]], [tip[0] - ux * 18 - nx * .3, tip[1] - uy * 18 - ny * .3]]), C.ink);
  iP([[tail[0] + nx, tail[1] + ny], [tip[0] - ux * 60 + nx, tip[1] - uy * 60 + ny], [tip[0], tip[1]], [tip[0] - ux * 60 - nx, tip[1] - uy * 60 - ny], [tail[0] - nx, tail[1] - ny]], true, C.ink, 2.4);
  const er = PP([[tail[0] + nx, tail[1] + ny], [tail[0] - ux * 40 + nx, tail[1] - uy * 40 + ny], [tail[0] - ux * 40 - nx, tail[1] - uy * 40 - ny], [tail[0] - nx, tail[1] - ny]]); fillP(er, C.rose); iP([[tail[0] + nx, tail[1] + ny], [tail[0] - ux * 40 + nx, tail[1] - uy * 40 + ny], [tail[0] - ux * 40 - nx, tail[1] - uy * 40 - ny], [tail[0] - nx, tail[1] - ny]], true, C.ink, 2);
  X.restore();
  // her hand on the pencil
  // her arm comes in from a shoulder fixed off frame left; the fist closes round the shaft (fingers over, thumb along it)
  const hp = [tail[0] + ux * 160, tail[1] + uy * 160], root = [-420, 80], wr = [hp[0] - ux * 34 + uy * 6, hp[1] - uy * 34 - ux * 6];
  const dx0 = wr[0] - root[0], dy0 = wr[1] - root[1], d0 = Math.hypot(dx0, dy0), bend = Math.sqrt(Math.max(0, 680 * 680 - d0 * d0 / 4)), nx0 = -dy0 / d0, ny0 = dx0 / d0, sg = ny0 < 0 ? 1 : -1;
  const el = [root[0] + dx0 / 2 + nx0 * bend * sg, root[1] + dy0 / 2 + ny0 * bend * sg]; // the elbow bends up, out of frame
  limb([root, el, wr], 40, {}, 1, '#b8766b');
  X.save(); X.translate(hp[0], hp[1]); X.rotate(ang);
  const fist = PE(0, 8, 44, 34); fillP(fist, '#e7c9a2'); shade(fist, 0, 8, 46, [-6, 8], .6, 4); iE(0, 8, 44, 34, 0, C.ink, 2.6);
  for (let i = 0; i < 4; i++) { const fx2 = -27 + i * 18; X.beginPath(); X.moveTo(fx2, -14); X.quadraticCurveTo(fx2 + 6, 6, fx2 + 2, 30); stroke(C.ink, 1.8, .9); } // knuckles wrapped over the shaft
  const th = PE(6, -18, 30, 9, -.05); fillP(th, '#e7c9a2'); iE(6, -18, 30, 9, -.05, C.ink, 2.2); fillP(PE(30, -19, 5, 4), C.cream);
  X.restore();
  // where it comes out: a little flag
  if (push > .82) { const k = seg(push, .82, 1); gc(anti[0], anti[1], 20 + 120 * k, C.orange, .9 * (1 - k * .5), 2.4); lab(anti[0] + 40, anti[1] + 70, 'THE OTHER SIDE', C.brick, .95, 18, 'left', 'alphabetic', 'bold'); }
  gl(home[0], home[1], anti[0], anti[1], C.teal, .5, 1.6, [6, 8]);
  for (let i = 0; i < 3; i++) gc(home[0], home[1], 30 + i * 20 + ((FD * 4) % 20), C.orange, .7, 1.8);
  traveller(260, 1080, 1.0, { look: 1, mouth: sing(T), case: false }); cloud(260, 640, .5, { rain: true });
  consL([[0, gy, W, gy], [gx, 0, gx, H], [home[0] - ux * 900, home[1] - uy * 900, anti[0] + ux * 900, anti[1] + uy * 900]]); consC([[gx, gy, r + 60]]);
} };

// ---------- 53.8 SCH: the pencil's line through the earth, crust to core to the antipode ----------
SU.a_sPin = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 520, lerp(1, 1.08, eo(p)));
  const gx = 960, gy = 520, r = 330, ang = .62, ux = Math.cos(ang), uy = Math.sin(ang);
  lattice(gx, gy, 80, 10, C.lav, .06);
  const layers = [[1, 'CRUST', 300], [.84, 'MANTLE', 1400], [.55, 'OUTER CORE', 900], [.25, 'INNER CORE', 600]];
  layers.forEach(([k, nm, n], i) => { gc(gx, gy, r * k, i ? C.lav : C.white, i ? .6 : .9, i ? 1 : 1.6); stip(PE(gx, gy, r * k, r * k), gx, gy, r * k, n, i === 3 ? C.white : C.lav, .35 + i * .12, 1.4); lab(gx - r * k * .72, gy + r * k * .72 + 22, nm, C.lav, .85, 12, 'right'); gl(gx - r * k * .7, gy + r * k * .7, gx - r * k * .72 - 6, gy + r * k * .72 + 8, C.lav, .6); });
  ticks(gx, gy, r + 10, 72, 6, C.lav, .5, 1, 6);
  const home = [gx - ux * r, gy - uy * r], anti = [gx + ux * r, gy + uy * r], k = eo(seg(p, .05, .75));
  gl(home[0] - ux * 300, home[1] - uy * 300, home[0], home[1], C.white, .7, 1.4, [6, 6]);
  gl(home[0], home[1], lerp(home[0], anti[0], k), lerp(home[1], anti[1], k), C.mag, .95, 2.4);
  star(home[0], home[1], 6, C.white, 1); lab(home[0] - 30, home[1] - 26, 'HOME · BLUES 100%', C.white, .9, 14, 'right');
  const dot = [lerp(home[0], anti[0], k), lerp(home[1], anti[1], k)]; star(dot[0], dot[1], 5, C.mag, 1);
  if (k > .97) { star(anti[0], anti[1], 8, C.mag, 1); gc(anti[0], anti[1], 40 + 30 * Math.sin(T * 4), C.mag, .7, 1.4); lab(anti[0] + 40, anti[1] + 30, 'ANTIPODE', C.mag, .95, 16); lab(anti[0] + 40, anti[1] + 54, 'OPEN OCEAN · NO DESK', C.lav, .8, 12); }
  bracket(home[0] + uy * 70, home[1] - ux * 70, anti[0] + uy * 70, anti[1] - ux * 70, C.cyan, .85, '12,742 KM');
  gc(gx, gy, r + 70, C.lav, .2, 1, [3, 7]);
  lab(1500, 860, 'DEPTH OF BLUES: UNKNOWN', C.cyan, .8, 13);
  screen(); schFrame('03', 'STRAIGHT THROUGH', 'FARTHEST POINT · BY PENCIL');
} };

// ---------- 61.5 the sun is a loudspeaker: its face is a cone that pumps; he holds his hat on ----------
SU.a_sunHorn = { mode: 'ill', f(q, p, a, T) {
  stripes('#f1e1bd', '#ead197', 150, -.62, 0, C.ochre);
  const pump = Math.abs(Math.sin(T * 7.4)) * (singing(T) ? 1 : .4), sh = jit(4 * pump);
  cam(960 + sh, 600 + sh, lerp(1, 1.06, eo(p)));
  const sx = 960, sy = 400, sr = 340;
  // sound rings out over everything
  for (let i = 0; i < 7; i++) { const rr = sr + 40 + ((FD * 7 + i * 70) % 490); gc(sx, sy, rr, i % 2 ? C.orange : C.teal, cl(1 - (rr - sr) / 520) * .9, 3); }
  // rays as the speaker's mounting bolts and spokes
  X.beginPath(); for (let i = 0; i < 36; i++) { const an = i / 36 * TAU, L = i % 3 ? 60 : 110; X.moveTo(sx + Math.cos(an) * (sr + 14), sy + Math.sin(an) * (sr + 14)); X.lineTo(sx + Math.cos(an) * (sr + L), sy + Math.sin(an) * (sr + L)); } stroke(C.ink, 2.4, .9);
  const rim = PE(sx, sy, sr, sr); fillP(rim, C.orange); hatch(rim, sx, sy, sr, .8, 6, C.ink, 1, .55, [-sr * .12, -sr * .12]); iE(sx, sy, sr, sr, 0, C.ink, 3);
  for (let i = 0; i < 8; i++) { const an = i / 8 * TAU + .2, bx = sx + Math.cos(an) * (sr - 26), by = sy + Math.sin(an) * (sr - 26); fillP(PE(bx, by, 9, 9), C.ink); }
  // the cone, pushing in and out
  const cr = sr * .78 * (1 + pump * .04), cone = PE(sx, sy, cr, cr); fillP(cone, C.ochre); for (let k = 1; k < 9; k++) iE(sx, sy, cr * k / 9, cr * k / 9, 0, C.ink, 1.3, .6, false, 1.4);
  hatch(cone, sx, sy, cr, .8, 5, C.ink, .9, .5, [cr * .2, cr * .2]); iE(sx, sy, cr, cr, 0, C.ink, 2.6);
  const cap = PE(sx, sy, 90 + pump * 10, 90 + pump * 10); fillP(cap, C.wax); shade(cap, sx, sy, 100, [-14, -14], .6, 4); iE(sx, sy, 90 + pump * 10, 90 + pump * 10, 0, C.ink, 2.6);
  // beach far below, everything bent away from it
  const sea = PR(-200, 790, W + 400, 80); fillP(sea, C.teal); hatch(sea, 960, 830, 1400, .05, 6, C.ink, .9, .5); iline(-200, 790, W + 200, 790, C.ink, 2.2);
  X.beginPath(); for (let i = 0; i < 30; i++) { const wx = (i * 83) % (W + 200) - 100, wy = 800 + (i * 29) % 60; X.moveTo(wx, wy); X.quadraticCurveTo(wx + 26, wy + 10, wx + 52, wy); } stroke(C.cream, 2, .8);
  const sand = PR(-200, 870, W + 400, 400); fillP(sand, C.tan); stipRect(-200, 870, W + 400, 400, 2600, C.ink, .5, 2); iline(-200, 870, W + 200, 870, C.ink, 2.2);
  X.beginPath(); for (let i = 0; i < 9; i++) { const y = 900 + i * 22; X.moveTo(-200, y); for (let x = -200; x < W + 200; x += 40) X.lineTo(x + 40, y + Math.sin(x * .02 + T * 6 + i) * 6); } stroke(C.ink, 1.2, .45);
  palm(260, 950, 1.1, { sway: -3 - pump * 2 });
  // him: braced, both hands clamped on his hat brim, leaning into the blast; coat tail flapping out behind
  const tx = 1360, ty = 1030, ts = 1.05, lk = -.6 * 6, lean = -.14 - pump * .03;
  X.beginPath(); for (let i = 0; i < 5; i++) { X.moveTo(tx + 30, ty - 140 - i * 30); X.lineTo(tx + 120 + i * 14 + jit(10), ty - 150 - i * 30 + jit(6)); } stroke(C.ink, 2, .8);
  X.save(); X.translate(tx, ty); X.rotate(lean);
  const coatTail = [[30, -150], [120 + pump * 30, -120 + jit(6)], [90 + pump * 20, -60], [44, -122]]; fillP(PP(coatTail.map(([x2, y2]) => [x2 * ts, y2 * ts])), C.teal); iP(coatTail.map(([x2, y2]) => [x2 * ts, y2 * ts]), true, C.ink, 2.2);
  traveller(0, 0, ts, { look: -.6, armR: a_armTo(1, lk + 40, -336), armL: a_armTo(-1, lk - 42, -336), mouth: sing(T), case: false, legs: .5 });
  a_backHand((lk - 42) * ts, -336 * ts, ts);
  X.restore();
  suitcase(tx + 150, ty - 100, .7);
  cloud(tx + 80, ty - 520, .5, { rain: true });
  for (let i = 0; i < 4; i++) { const t2 = (T * .9 + i / 4) % 1; X.beginPath(); X.moveTo(tx + 60 + t2 * 400, ty - 400 + i * 70); X.lineTo(tx + 120 + t2 * 400, ty - 400 + i * 70); stroke(C.ink, 2, 1 - t2); }
  consL([[0, sy, W, sy], [sx, 0, sx, H], [0, 790, W, 790]]); consC([[sx, sy, sr + 140]]);
} };

// ---------- 68.8 the sun in a shell: he holds a conch to his ear; inside it, a small sun is roaring ----------
SU.a_shell = { mode: 'ill', f(q, p, a, T) {
  stripes('#f0ddb6', '#e8cb94', 140, -.62, 0, C.orange);
  cam(lerp(940, 980, p), 540, lerp(1.04, 1.12, eo(p)));
  const sea = PR(-200, 760, W + 400, 400); fillP(sea, C.teal); hatch(sea, 960, 900, 1400, .05, 7, C.ink, .9, .5); iline(-200, 760, W + 200, 760, C.ink, 2.2);
  X.beginPath(); for (let i = 0; i < 40; i++) { const wx = (i * 71 + T * 40) % (W + 200) - 100, wy = 780 + (i * 31) % 240; X.moveTo(wx, wy); X.quadraticCurveTo(wx + 22, wy - 8, wx + 44, wy); } stroke(C.cream, 2, .8);
  // the real sun, low and quiet, far off
  const rs = PE(1600, 640, 70, 70); fillP(rs, C.ochre, .9); hatch(rs, 1600, 640, 70, .8, 5, C.ink, .9, .45, [-14, -14]); iE(1600, 640, 70, 70, 0, C.ink, 2); lab(1600, 560, 'MUTE', C.ink, .7, 14, 'center', 'alphabetic', 'bold');
  // him, big: head and shoulders
  const s = 3.0, x = 760, y = 420 + 306 * s, A = [2.0, 2.2];
  traveller(x, y, s, { look: .2, armR: A, case: false, mouth: 0 });
  const hand = arm(26, -262, A[0], A[1])[2], hx = x + hand[0] * s, hy = y + hand[1] * s;
  // the conch, opening to camera; the sun inside pumps on every sung syllable (and keeps a pulse on the beat after the line)
  const shx = hx + 70, shy = hy - 40, pl = Math.max(sing(T), .32 * Math.abs(Math.sin(T * 7.4)));
  X.save(); X.translate(shx, shy); X.rotate(-.35);
  const sp = PP([[-160, 40], [-120, -100], [0, -170], [150, -110], [220, 10], [140, 110], [0, 140], [-100, 110]]); fillP(sp, '#f1d3b8'); shade(sp, 0, 0, 230, [-24, -18], .7, 5);
  X.beginPath(); for (let k = 0; k < 7; k++) { X.moveTo(-160 + k * 50, 50 - k * 6); X.quadraticCurveTo(-100 + k * 50, -120 + k * 10, -40 + k * 54, -150 + k * 20); } stroke(C.ink, 1.6, .55);
  iP(dens([[-160, 40], [-120, -100], [0, -170], [150, -110], [220, 10], [140, 110], [0, 140], [-100, 110]], 24, true), true, C.ink, 3);
  for (let i = 0; i < 6; i++) { const an = -2.6 + i * .5; const kn = PP([[-160 + i * 60, -80 - i * 14], [-140 + i * 60, -150 - i * 10], [-120 + i * 60, -84 - i * 14]]); fillP(kn, '#e3b998'); iP([[-160 + i * 60, -80 - i * 14], [-140 + i * 60, -150 - i * 10], [-120 + i * 60, -84 - i * 14]], false, C.ink, 2); }
  const mouth = PE(40, 10, 120, 80, -.2); fillP(mouth, C.rose);
  X.save(); X.clip(mouth); const glow = PE(40, 10, 120, 80, -.2); hatch(glow, 40, 10, 130, .8, 5, C.ink, .9, .35, [20, 20]); sunIll(40, 10, 38 + pl * 26, C.orange, pl); X.restore();
  iE(40, 10, 120, 80, -.2, C.ink, 2.8);
  X.restore();
  // the sun's sound coming out of the shell into his ear, as rings and rays
  for (let i = 0; i < 6; i++) { const rr = 30 + ((FD * 6 + i * 40) % 240) * (.6 + pl * .6); gc(shx + 40, shy, rr, i % 2 ? C.orange : C.teal, cl(1 - rr / 300) * (.35 + pl * .65), 2 + pl * 2, null, -2.2, 1.0); }
  X.beginPath(); for (let i = 0; i < 12; i++) { const an = -1.4 + i * .22, r1 = 150, r2 = 180 + pl * 90 + (i % 3) * 30; X.moveTo(shx + 40 + Math.cos(an) * r1, shy + Math.sin(an) * r1); X.lineTo(shx + 40 + Math.cos(an) * r2, shy + Math.sin(an) * r2); } stroke(C.orange, 1.6 + pl * 1.6, .9);
  cloud(x - 380, 160, .8, { rain: true });
  consL([[0, 760, W, 760], [shx, 0, shx, H]]); consC([[shx + 40, shy, 300]]);
} };

// ---------- 73.7 the land ship: a car with a mast and sail crosses a wheat field, leaving a wake ----------
SU.a_landShip = { mode: 'ill', f(q, p, a, T) {
  stripes('#e9e2cc', '#d8dcc6', 150, -.62, 0, C.sky);
  cam(lerp(900, 1020, p), 540, 1);
  const hz = 560;
  // far hills, lighthouse on one: a coast with no sea
  const hl = PE(1500, hz + 40, 520, 120); fillP(hl, C.sage); hatch(hl, 1500, hz, 520, -.5, 7, C.ink, .9, .35, [-30, 20]); iE(1500, hz + 40, 520, 120, 0, C.ink, 2.2, 1, true, 1, Math.PI, TAU);
  const lh = PP([[1560, hz - 70], [1600, hz - 70], [1592, hz - 240], [1568, hz - 240]]); fillP(lh, C.cream); X.save(); X.clip(lh); for (let i = 0; i < 6; i++) fillP(PR(1550, hz - 240 + i * 34, 60, 17), C.brick); X.restore(); iP([[1560, hz - 70], [1600, hz - 70], [1592, hz - 240], [1568, hz - 240]], true, C.ink, 2); const lt = PR(1564, hz - 270, 32, 30); fillP(lt, C.wax); iBox(1564, hz - 270, 32, 30, C.ink, 1.8);
  const bm = Math.sin(T * 2); X.beginPath(); X.moveTo(1580, hz - 255); X.lineTo(1580 + bm * 400, hz - 300); X.lineTo(1580 + bm * 400, hz - 210); X.closePath(); fillP(new Path2D(), C.wax); stroke(C.ochre, 2, .8);
  a_fields(hz, '#d9bf74', C.ochre);
  // wheat stalks foreground band
  X.beginPath(); for (let i = 0; i < 220; i++) { const r2 = M32(i * 7 + 1), sx = -200 + r2() * (W + 600), sy = 900 + r2() * 220, lean = Math.sin(T * 2 + sx * .01) * 8; X.moveTo(sx, sy); X.lineTo(sx + lean, sy - 60 - r2() * 50); } stroke(C.ink, 1.4, .7);
  // the car, sailing; its wake parts the wheat
  const cx = lerp(300, 1500, p), cy = 820, cs = 1.6, bob = Math.sin(T * 3.2) * 6;
  X.beginPath(); for (const sgn of [-1, 1]) { X.moveTo(cx - 160, cy + 10); for (let k = 1; k <= 12; k++) X.lineTo(cx - 160 - k * 70, cy + 10 + sgn * k * 14 + jit(4)); } stroke(C.ink, 2, .8);
  for (let k = 1; k < 8; k++) { iE(cx - 160 - k * 90, cy + 10, 30, 8 + k * 6, 0, C.orange, 1.6, .7 - k * .08, false); }
  X.save(); X.translate(0, bob); X.rotate(Math.sin(T * 1.6) * .015);
  iline(cx + 10, cy - 130, cx + 10, cy - 640, C.ink, 6); iline(cx - 200, cy - 150, cx + 10, cy - 150, C.ink, 4);
  const sail = PP([[cx + 20, cy - 620], [cx + 20, cy - 160], [cx - 190, cy - 160], [cx - 40, cy - 600]]); fillP(sail, C.cream); X.save(); X.clip(sail); for (let i = 0; i < 6; i++) fillP(PR(cx - 220 + i * 80, cy - 640, 40, 500), C.orange, .85); X.restore();
  hatch(sail, cx - 80, cy - 400, 300, .9, 6, C.ink, .9, .5, [24, 10]); iP([[cx + 20, cy - 620], [cx + 20, cy - 160], [cx - 190, cy - 160], [cx - 40, cy - 600]], true, C.ink, 2.6);
  const fl = PP([[cx + 10, cy - 640], [cx + 70, cy - 620], [cx + 10, cy - 600]]); fillP(fl, C.teal); iP([[cx + 10, cy - 640], [cx + 70, cy - 620], [cx + 10, cy - 600]], true, C.ink, 1.8);
  car(cx, cy, cs);
  // him at the tiller, hat on, cloud above the masthead
  X.save(); X.beginPath(); X.rect(cx - 200, cy - 400, 400, 270); X.clip(); traveller(cx + 20, cy - 60, .62, { look: 1, mouth: sing(T), case: false, armR: [1.3, .3] }); X.restore();
  X.restore();
  cloud(cx - 30, cy - 760, .6, { rain: true });
  X.beginPath(); for (let i = 0; i < 4; i++) { X.moveTo(cx - 600 + i * 40, cy - 520 + i * 70); X.quadraticCurveTo(cx - 400, cy - 540 + i * 70, cx - 230, cy - 500 + i * 60); } stroke(C.teal, 1.8, .7);
  consL([[-300, hz, W + 300, hz], [cx, -100, cx, H + 100]]);
} };

// ---------- 90.8 chorus 1: the roadside payphone, alone on the prairie; he calls her ----------
SU.a_payphone = { mode: 'ill', f(q, p, a, T) {
  stripes('#e9dfc4', '#dcd3b8', 170, -.62, 0, C.sky);
  cam(lerp(940, 1000, eo(p)), lerp(560, 540, eo(p)), lerp(1, 1.08, eo(p)));
  const hz = 700;
  a_fields(hz, '#c9b77a', C.sage);
  // poles marching off to the horizon, wires between
  const poles = []; for (let i = 0; i < 9; i++) { const t = i / 8, x = lerp(1180, 1880, Math.pow(t, .6)), s = lerp(1, .18, Math.pow(t, .6)), y = lerp(1000, hz + 6, Math.pow(t, .6)); poles.push(a_pole(x, y, 620 * s, s)); }
  for (let i = 0; i < poles.length - 1; i++) for (let w = 0; w < 4; w++) { const [x1, y1] = poles[i][w], [x2, y2] = poles[i + 1][w]; a_wire(x1, y1, x2, y2, 20 * (1 - i / 9), C.ink, 1.2, .8); }
  // the road, side on, along the bottom
  const rd = PR(-200, 1000, W + 400, 200); fillP(rd, '#8a8172'); hatch(rd, 960, 1060, 1400, .05, 6, C.ink, .9, .45); iline(-200, 1000, W + 200, 1000, C.ink, 2.6); for (let x = -200; x < W + 200; x += 240) fillP(PR(x, 1050, 120, 10), C.cream);
  const gv = PR(-200, 960, W + 400, 40); fillP(gv, '#cdbb98'); stipRect(-200, 960, W + 400, 40, 900, C.ink, .6, 2.4);
  // the payphone: a hooded box on a post
  const px = 820, top = 360;
  iline(px, 1000, px, top + 300, C.ink, 9); const post = PR(px - 10, top + 300, 20, 700); fillP(post, '#6b6b6b'); iBox(px - 10, top + 300, 20, 700, C.ink, 2);
  const hood = PP([[px - 180, top - 30], [px + 180, top - 30], [px + 160, top + 330], [px - 160, top + 330]]); fillP(hood, C.brick); shade(hood, px, top + 150, 260, [30, 0], .9, 6); iP(dens([[px - 180, top - 30], [px + 180, top - 30], [px + 160, top + 330], [px - 160, top + 330]], 30, true), true, C.ink, 3);
  const plate = PR(px - 150, top - 20, 300, 44); fillP(plate, C.cream); iBox(px - 150, top - 20, 300, 44, C.ink, 2); lab(px, top + 12, 'TELEPHONE', C.ink, .95, 22, 'center', 'alphabetic', 'bold');
  const bx = PR(px - 100, top + 50, 200, 250); fillP(bx, '#9aa3a0'); shade(bx, px, top + 175, 160, [16, -10], .8, 4); iBox(px - 100, top + 50, 200, 250, C.ink, 2.6);
  const dial = PE(px, top + 170, 60, 60); fillP(dial, C.cream); iE(px, top + 170, 60, 60, 0, C.ink, 2.2); for (let i = 0; i < 10; i++) { const an = -2.2 + i * .42; iE(px + Math.cos(an) * 40, top + 170 + Math.sin(an) * 40, 8, 8, 0, C.ink, 1.4, 1, false); }
  fillP(PR(px + 50, top + 80, 30, 8), C.ink); lab(px - 80, top + 280, 'PLEASE DEPOSIT 25¢', C.ink, .8, 11);
  // him, receiver to his ear, the cord coiling to the box
  const tx = 560, ty = 1000, ts = 1.35; traveller(tx, ty, ts, { look: .8, mouth: sing(T), phone: 'handset', case: false });
  const ex = tx + (4.8 + 24) * ts, ey = ty - 300 * ts; // the handset's mouthpiece end
  X.beginPath(); for (let i = 0; i <= 40; i++) { const t = i / 40, xx = lerp(ex + 20, px - 100, t), yy = lerp(ey + 50, top + 230, t) + Math.sin(t * Math.PI) * 120; X.lineTo(xx + Math.cos(i * 1.6) * 10, yy + Math.sin(i * 1.6) * 10); } stroke(C.ink, 2.2, 1);
  suitcase(380, 900, .9);
  cloud(tx, ty - 520 * ts + 40, .72, { rain: true });
  // it rings at her end: rings travel off along the wires
  for (let i = 0; i < 3; i++) gc(ex + 10, ey + 10, 40 + i * 30 + ((FD * 6) % 30), C.orange, .8, 1.8, null, -1.2, .6);
  const [w1, w2] = [poles[0][1], poles[8][1]], t3 = (T * .6) % 1; const at = a_wireAt(w1[0], w1[1], w2[0], w2[1], 0, t3); gc(at[0], at[1], 16 * (1 - t3) + 4, C.orange, .9, 2.4);
  consL([[0, hz, W, hz], [px, 0, px, H], [0, 1000, W, 1000]]);
} };

// ---------- 93.7 SCH: the line from the payphone along the poles, her location unknown ----------
SU.a_sWire = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 560, lerp(1, 1.06, eo(p)));
  graticule(960, 540, 1900, 1100, 60, C.lav, .05); gl(0, 700, W, 700, C.lav, .45); lab(60, 690, 'HORIZON', C.lav, .6, 11);
  const px = 820, top = 360;
  X.strokeStyle = C.lav; X.lineWidth = 1.2; X.strokeRect(px - 180, top - 30, 360, 360); X.strokeRect(px - 100, top + 50, 200, 250); gc(px, top + 170, 60, C.white, .9, 1.4); ticks(px, top + 170, 60, 10, 10, C.white, .7, 1.2);
  gl(px, top + 300, px, 1000, C.lav, .7, 1.4); lab(px + 200, top - 4, 'TELEPHONE · ROADSIDE', C.white, .9, 14); lab(px + 200, top + 20, 'COIN · 25¢', C.lav, .7, 12);
  traveller(560, 1000, 1.35, { sch: 1, col: C.lav, phone: 'handset', case: false, look: .8 });
  const poles = []; for (let i = 0; i < 9; i++) { const t = i / 8, x = lerp(1180, 1880, Math.pow(t, .6)), s = lerp(1, .18, Math.pow(t, .6)), y = lerp(1000, 706, Math.pow(t, .6)); gl(x, y, x, y - 620 * s, C.lav, .7, 1.2); gl(x - 120 * s, y - 590 * s, x + 120 * s, y - 590 * s, C.lav, .7, 1); poles.push([x, y - 604 * s]); }
  const pts = [[px + 100, top + 120], ...poles, [2200, 690]];
  path(pts, C.cyan, 1.4, .8);
  const k = (p * 1.5) % 1, i0 = Math.min(pts.length - 2, Math.floor(k * (pts.length - 1))), f = k * (pts.length - 1) - i0, sp = [lerp(pts[i0][0], pts[i0 + 1][0], f), lerp(pts[i0][1], pts[i0 + 1][1], f)];
  path(pts.slice(0, i0 + 1).concat([sp]), C.mag, 2.4, .95); star(sp[0], sp[1], 6, C.mag, 1);
  poles.forEach(([x, y], i) => { gc(x, y, 8, C.white, .8); if (i % 2 === 0) lab(x, y - 22, 'P' + (i + 1), C.lav, .7, 10, 'center'); });
  bracket(px + 100, 1040, 1880, 1040, C.cyan, .8, 'LINE LENGTH: ?');
  lab(1500, 300, 'CALLED PARTY', C.white, .9, 15); lab(1500, 326, 'TRAVEL AGENT', C.mag, .95, 18, 'left', 'alphabetic', 'bold'); lab(1500, 352, 'LOCATION: NOT AT DESK', C.lav, .8, 12);
  gl(1500, 360, 1880, 640, C.mag, .5, 1, [4, 6]);
  for (let i = 0; i < 3; i++) gc(560, 1000 - 330 * 1.35, 30 + i * 22, C.cyan, .7, 1.2, null, -1.2, .6);
  screen(); schFrame('09', 'THE LINE', 'RINGING · 1 OF ∞');
} };

// ---------- 95.5 she answers from a desk on top of a telephone pole, and puts him on hold ----------
SU.a_poleDesk = { mode: 'ill', f(q, p, a, T) {
  stripes('#dbe4dc', '#ccd8d0', 160, -.62, 0, C.sky);
  cam(960, lerp(560, 500, eo(p)), lerp(1.04, 1, eo(p)));
  // land far below
  const fl = PR(-200, 960, W + 400, 300); fillP(fl, '#b9b98a'); hatch(fl, 960, 1020, 1400, -.1, 7, C.ink, .8, .35); X.beginPath(); for (let i = 0; i < 8; i++) { X.moveTo(-200, 970 + i * 14); X.lineTo(W + 200, 970 + i * 16); } stroke(C.ink, 1, .3); iline(-200, 960, W + 200, 960, C.ink, 2);
  for (let i = 0; i < 6; i++) { const r2 = M32(i * 5 + 9), fx = -100 + r2() * W, fw = 120 + r2() * 200; fillP(PR(fx, 975 + r2() * 40, fw, 18), i % 2 ? C.sage : C.ochre, .8); }
  iline(-200, 1050, W + 200, 1020, C.ink, 2.4); car(300, 1040, .25);
  // clouds at desk height
  for (const [cx, cy, s] of [[260, 300, .9], [1700, 220, 1.1], [1500, 700, .7]]) { X.save(); X.translate(cx, cy); X.scale(s, s); const u = new Path2D(); for (const [a2, b2, r2] of [[-90, 0, 50], [-30, -30, 64], [40, -20, 56], [90, 6, 44], [0, 14, 60]]) u.addPath(PE(a2, b2, r2, r2 * .8)); fillP(u, C.cream); hatch(u, 0, 0, 150, .6, 6, C.ink, .8, .35, [10, -20]); X.restore(); }
  // the pole, tall, from out of frame below
  const px = 960, py = 640; const pp = PP([[px - 26, 1200], [px - 18, py], [px + 18, py], [px + 26, 1200]]); fillP(pp, '#7a5634'); hatch(pp, px, 900, 600, 1.45, 5, C.ink, .8, .6, [12, 0]); iP([[px - 26, 1200], [px - 18, py], [px + 18, py], [px + 26, 1200]], true, C.ink, 2.6);
  for (let i = 0; i < 8; i++) iline(px - 30, 720 + i * 50, px - 14, 720 + i * 50, C.ink, 4, 1, false);
  const ay = 700, arm = PR(px - 300, ay, 600, 18); fillP(arm, '#7a5634'); iBox(px - 300, ay, 600, 18, C.ink, 2.2);
  const ins = []; for (const dx of [-270, -170, 170, 270]) { fillP(PE(px + dx, ay - 12, 9, 14), C.sage); iE(px + dx, ay - 12, 9, 14, 0, C.ink, 1.6, 1, false); ins.push([px + dx, ay - 22]); }
  for (const [ix, iy] of ins) { a_wire(ix, iy, ix < px ? -300 : W + 300, iy + 60, 40, C.ink, 1.8, .9); }
  // her desk balanced on the top
  const dp = PR(px - 220, 560, 440, 22); fillP(dp, '#7a5634'); iBox(px - 220, 560, 440, 22, C.ink, 2.2); iline(px - 200, 582, px - 18, 650, C.ink, 4); iline(px + 200, 582, px + 18, 650, C.ink, 4);
  X.save(); X.beginPath(); X.rect(-W, -H, 3 * W, 560 + 100 + H); X.clip();
  desk(px, 420, 380, .85); X.restore();
  agent(px, 420, .9, { look: -.8, talk: singing(T) ? 0 : Math.abs(Math.sin(T * 9)) * .8 });
  // candlestick phone, receiver held to her ear
  const cx = px - 140; iline(cx, 400, cx, 300, C.ink, 5); const bs = PE(cx, 402, 30, 10); fillP(bs, '#2b2420'); iE(cx, 402, 30, 10, 0, C.ink, 2); const mth = PE(cx, 292, 18, 12); fillP(mth, '#2b2420'); iE(cx, 292, 18, 12, 0, C.ink, 2);
  const rx = px - 40, ry = 420 - 196 * .9; const rcv = PE(rx, ry, 10, 26, .2); fillP(rcv, '#2b2420'); iE(rx, ry, 10, 26, .2, C.ink, 1.8);
  X.beginPath(); X.moveTo(cx, 360); X.quadraticCurveTo(cx + 40, 440, rx, ry + 26); stroke(C.ink, 1.8, 1);
  // the HOLD button, pressed; hold music goes off down the wire toward him as a queue of notes
  const pr = p > .45, hbx = px + 120, hby = 404; const hb = PE(hbx, hby - (pr ? 2 : 8), 24, 10); fillP(PR(hbx - 40, hby - 4, 80, 16), C.ink); fillP(hb, C.brick); iE(hbx, hby - (pr ? 2 : 8), 24, 10, 0, C.ink, 2); lab(hbx, hby + 34, 'HOLD', C.brick, .95, 16, 'center', 'alphabetic', 'bold');
  if (pr) { for (let i = 0; i < 3; i++) gc(hbx, hby, 30 + i * 24 + ((FD * 5) % 24), C.orange, .8, 2); const [ix, iy] = ins[0]; for (let i = 0; i < 10; i++) { const t2 = cl((p - .45) * 2.2 - i * .06); if (t2 <= 0) continue; const [nx, ny] = a_wireAt(ix, iy, -300, iy + 60, 40, t2); a_noteGlyph(nx, ny - 14, 1.2, C.teal); } }
  // birds on the wire
  for (const [bx, by] of [[1290, 735], [1420, 745], [1560, 752]]) bird(bx, by - 30, .35, flap() * .5);
  consL([[0, 560, W, 560], [px, 0, px, H], [0, ay, W, ay]]);
} };

// ---------- 112.2 help me quick: he runs off along a sea causeway still holding the receiver; the cord stretches back to the box ----------
// draft 6: off the prairie (the poles were the third time in 26 s); legs on walkPh, scroll matched to the stride
SU.a_rushRoad = { mode: 'ill', f(q, p, a, T) {
  const sp = 470, off = T * sp, hz = 560;
  stripes('#e6e7dc', '#d5ddd3', 150, -.62, T * 90, C.sky);
  cam(960, 540, 1);
  // gulls hanging in the wind
  for (let i = 0; i < 4; i++) { const gx = ((1700 - i * 380 - T * 60) % 2200 + 2200) % 2200 - 140, gy = 180 + (i % 2) * 90, w2 = flap() ? 14 : 8; X.beginPath(); X.moveTo(gx - 26, gy - w2); X.quadraticCurveTo(gx - 12, gy - 4, gx, gy); X.quadraticCurveTo(gx + 12, gy - 4, gx + 26, gy - w2); stroke(C.ink, 2.2, .9); }
  // the grey sea, waves sliding past slower than the deck
  const sea = PR(-200, hz, W + 400, H); fillP(sea, '#86aaa4'); hatch(sea, 960, 800, 1400, .03, 7, C.ink, .8, .32);
  X.beginPath(); for (let i = 0; i < 46; i++) { const r2 = M32(i * 13 + 5), wy = hz + 16 + Math.pow(r2(), 1.4) * 330, wx = ((r2() * (W + 300) - off * (.15 + (wy - hz) / 900)) % (W + 300) + W + 300) % (W + 300) - 150, L = 20 + (wy - hz) * .12; X.moveTo(wx, wy); X.quadraticCurveTo(wx + L / 2, wy - 6, wx + L, wy); } stroke(C.cream, 2, .85);
  iline(-200, hz, W + 200, hz, C.ink, 2.2);
  // a freighter far out, and a buoy
  { const shx = 1500 - T * 8, sb = PP([[shx - 90, hz - 4], [shx + 90, hz - 4], [shx + 70, hz + 14], [shx - 80, hz + 14]]); fillP(sb, '#5a5048'); iP([[shx - 90, hz - 4], [shx + 90, hz - 4], [shx + 70, hz + 14], [shx - 80, hz + 14]], true, C.ink, 1.6); fillP(PR(shx + 20, hz - 34, 30, 30), C.cream); iBox(shx + 20, hz - 34, 30, 30, C.ink, 1.4); iline(shx + 40, hz - 34, shx + 40, hz - 60, C.ink, 3); }
  // the far shore behind him: a spit of land with the payphone on it, shrinking
  const fx = lerp(330, 150, p), fs = lerp(.4, .22, p), fy = hz + 4;
  const spit = PE(fx - 80, hz + 6, 260, 20); fillP(spit, C.sage); hatch(spit, fx - 80, hz, 260, .3, 5, C.ink, .8, .5); iE(fx - 80, hz + 6, 260, 20, 0, C.ink, 1.6, 1, false, .6, Math.PI, TAU);
  iline(fx, fy, fx, fy - 140 * fs * 2, C.ink, 2); const hd = PR(fx - 30 * fs * 2, fy - 200 * fs * 2, 60 * fs * 2, 70 * fs * 2); fillP(hd, C.brick); iBox(fx - 30 * fs * 2, fy - 200 * fs * 2, 60 * fs * 2, 70 * fs * 2, C.ink, 1.4);
  // the causeway: the far railing behind him, the deck, the truss under it, all sliding past
  const dk = 930, pitch = 240, o2 = off % pitch;
  X.beginPath(); for (let x = -o2 - pitch; x < W + pitch; x += pitch) { X.moveTo(x, dk); X.lineTo(x, dk - 120); } stroke(C.ink, 5, 1);
  X.beginPath(); for (const ry of [dk - 120, dk - 62]) { X.moveTo(-200, ry); X.lineTo(W + 200, ry); } stroke(C.ink, 3, 1);
  const rl = PR(-200, dk - 124, W + 400, 8); fillP(rl, '#7a5634');
  const deck = PR(-200, dk, W + 400, 46); fillP(deck, '#a5835a'); hatch(deck, 960, dk + 23, 1400, 0, 5, C.ink, .8, .4); X.beginPath(); for (let x = -(off % 60) - 60; x < W + 60; x += 60) { X.moveTo(x, dk); X.lineTo(x - 8, dk + 46); } stroke(C.ink, 1.2, .55); iline(-200, dk, W + 200, dk, C.ink, 2.6); iline(-200, dk + 46, W + 200, dk + 46, C.ink, 2.6);
  const tr = PR(-200, dk + 46, W + 400, 120); fillP(tr, '#6f6458', .25);
  X.beginPath(); for (let x = -o2 - pitch; x < W + pitch; x += pitch) { X.moveTo(x, dk + 46); X.lineTo(x + pitch, H + 10); X.moveTo(x + pitch, dk + 46); X.lineTo(x, H + 10); X.moveTo(x, dk + 46); X.lineTo(x, H + 10); } stroke(C.ink, 4, .9);
  // him running, receiver at his ear, the cord pulled taut and coiling all the way back over the rail to the shore
  const tx = lerp(1000, 1260, eo(p)), ty = dk, ts = 1.3;
  X.beginPath(); for (let i = 0; i < 6; i++) { X.moveTo(tx - 120 - i * 30, ty - 120 - i * 40); X.lineTo(tx - 260 - i * 50, ty - 120 - i * 40); } stroke(C.ink, 2, .6);
  const ex = tx + 30 * ts, ey = ty - 300 * ts;
  traveller(tx, ty, ts, { legs: walkPh() * 1.3, look: 1, mouth: sing(T), phone: 'handset', armL: [-.9 + Math.sin(walkPh() * 1.3) * .5, .4], case: false });
  X.beginPath(); for (let i = 0; i <= 160; i++) { const t = i / 160, xx = lerp(ex, fx, t), yy = lerp(ey + 40, fy - 180 * fs * 2, t) + Math.sin(t * Math.PI) * 60; const amp = 10 * (1 - t) + 2; X.lineTo(xx + Math.cos(i * 1.4) * amp, yy + Math.sin(i * 1.4) * amp); } stroke(C.ink, 2.2, 1);
  for (let i = 0; i < 3; i++) gc(ex + 10, ey + 10, 40 + i * 30 + ((FD * 6) % 30), C.orange, .85, 2, null, -1.1, .7); // it is still ringing at her end
  X.save(); X.translate(tx - 170, ty - 260); X.rotate(-.5 + Math.sin(T * 9) * .15); suitcase(0, 0, .9); X.restore();
  cloud(tx - 140, ty - 560, .62, { rain: true }); X.beginPath(); for (let i = 0; i < 5; i++) { X.moveTo(tx - 260, ty - 600 + i * 22); X.lineTo(tx - 420 - i * 30, ty - 600 + i * 22); } stroke(C.teal, 2, .7);
  for (let i = 0; i < 4; i++) { const t2 = ((T * 3 + i / 4) % 1); iE(tx - 60 - t2 * 260, ty - 8 - t2 * 26, 16 + t2 * 30, 8 + t2 * 12, 0, C.ink, 1.4, .7 * (1 - t2), false); }
  for (let i = 0; i < 3; i++) gc(tx, ty - 200, 260 + i * 26, C.orange, .8, 2.2, null, Math.PI * .7 + i * .1, Math.PI * 1.1 + i * .1);
  consL([[0, hz, W, hz], [0, dk, W, dk], [tx, -100, tx, H + 100]]);
} };

// ---------- draft 6 re-stagings (each replaces a shared set-up in this act's slot, with its audit fix) ----------

// 17.6 the poster through the shop glass: frame in frame in frame; his rain runs down the glass over the sun
SU.a_posterCU = { mode: 'ill', f(q, p, a, T) {
  stripes('#d7dfd2', '#cbd5c6', 120, -.62, 0, C.teal); cam(960, 540, lerp(1.02, 1.1, eo(p)));
  const wx = 330, wy = -10, ww = 1260, wh = 1060, win = PR(wx, wy, ww, wh);
  // brick around the window
  const br = new Path2D(); br.rect(-300, -300, W + 600, H + 600); br.rect(wx - 40, wy - 40, ww + 80, wh + 80); X.save(); X.clip(br, 'evenodd'); fillP(PR(-300, -300, W + 600, H + 600), C.brick); X.beginPath(); for (let y = -300; y < H + 300; y += 26) { X.moveTo(-300, y); X.lineTo(W + 300, y); const o = (y / 26) % 2 ? 0 : 32; for (let x = -300 + o; x < W + 300; x += 64) { X.moveTo(x, y); X.lineTo(x, y + 26); } } stroke(C.ink, 1, .3); hatch(PR(-300, -300, W + 600, H + 600), 960, 540, 1300, .8, 7, C.ink, .8, .2); X.restore();
  const fr = new Path2D(); fr.rect(wx - 40, wy - 40, ww + 80, wh + 80); fr.rect(wx, wy, ww, wh); fillP(fr, '#7a5634'); X.save(); X.clip(fr, 'evenodd'); hatch(PR(wx - 40, wy - 40, ww + 80, wh + 80), 960, 540, 900, 1.2, 6, C.ink, .8, .5); X.restore();
  // behind the glass: the shop's back wall and the poster
  fillP(win, '#e3e6d8'); X.save(); X.clip(win); hatch(win, 960, 540, 800, 1.57, 22, C.ink, .8, .12);
  poster(560, 40, 800, 1000, 'palm');
  // the sun on the poster, its rings dimming as the water sheets over it
  const sx = 1104, sy = 240, dim = eo(seg(p, .15, 1));
  for (let i = 0; i < 4; i++) gc(sx, sy, 150 + i * 40 + ((FD * 5) % 40), C.orange, .6 * (1 - dim * .85), 2);
  { const sd = PE(sx, sy, 130, 130); X.save(); X.clip(sd); X.beginPath(); for (let x = sx - 140; x < sx + 140; x += 9) { X.moveTo(x, sy - 140); for (let y = sy - 140; y < sy + 140; y += 10) X.lineTo(x + Math.sin(y * .05 + x) * 4 * dim, y); } stroke(C.cream, 3, .6 * dim); X.restore(); } // the sun, smeared by the water
  // the rain on the glass: drops start, then run down in wandering rivulets
  for (let i = 0; i < 22; i++) {
    const r2 = M32(i * 41 + 9), near = i < 10, x0 = near ? sx - 170 + r2() * 340 : wx + 30 + r2() * (ww - 60), t0 = r2() * .6, spd = 700 + r2() * 1100, y0 = wy + 20 + r2() * (near ? 120 : 500);
    const run = Math.max(0, p - t0) * spd, yE = Math.min(wy + wh, y0 + run);
    if (p < t0) { fillP(PE(x0, y0, 5, 6), C.cream, .9); iE(x0, y0, 5, 6, 0, C.ink, 1, .6, false, .3); continue; }
    const pts = []; for (let y = y0; y <= yE; y += 14) pts.push([x0 + Math.sin(y * .021 + i * 2.1) * 9 + Math.sin(y * .067 + i) * 3, y]); pts.push([x0 + Math.sin(yE * .021 + i * 2.1) * 9, yE]);
    path(pts, '#9fbcb8', near ? 5 : 3, near ? .75 : .45); path(pts.map(([x2, y2]) => [x2 + 2, y2]), C.ink, 1, near ? .45 : .25); const hb = pts[pts.length - 1]; fillP(PE(hb[0], hb[1], 9, 12), C.cream, .95); iE(hb[0], hb[1], 9, 12, 0, C.ink, 1.4, .8, false, .3);
  }
  // reflections on the glass
  hatch(win, 960, 540, 1100, -.95, 18, C.cream, 3, .28, null, .3); X.restore();
  iBox(wx, wy, ww, wh, C.ink, 3);
  cloud(300, 300, 1, { rain: true }); traveller(250, 1240, 1.6, { look: 1, mouth: 0 });
  consL([[0, 660, W, 660], [960, 0, 960, H], [sx, 0, sx, H]]); consC([[sx, sy, 220]]);
} };

// 59.0 "where can I hear the sun": square-on emblem; he stands dead centre, hands cupped behind his ears, palms either
// side as brackets; the sun is a silent hatched burst, and his own cloud sits between him and it
SU.a_beach = { mode: 'ill', f(q, p, a, T) {
  stripes('#f1e1bd', '#ead197', 150, -.62, 0, C.ochre);
  cam(960, 540, lerp(1, 1.06, eo(p)));
  const sx = 960, sy = 300;
  ngoBurst(sx, sy, 158, 300 + Math.sin(T * 1.2) * 6, 26, p * .12, '#e8b25a', C.cream);
  const sun = PE(sx, sy, 146, 146); fillP(sun, C.orange); hatch(sun, sx, sy, 146, .8, 5, C.ink, 1, .55, [-30, -30]); iE(sx, sy, 146, 146, 0, C.ink, 3);
  // sea + sand, square to camera
  const hz = 600, sea = PR(-200, hz, W + 400, 130); fillP(sea, C.teal); hatch(sea, 960, hz + 65, 1400, .05, 7, C.ink, .9, .5); X.beginPath(); for (let i = 0; i < 40; i++) { const wx = (i * 97 + T * 30) % (W + 200) - 100, wy = hz + 16 + (i * 37) % 100; X.moveTo(wx, wy); X.quadraticCurveTo(wx + 20, wy - 8, wx + 40, wy); } stroke(C.cream, 2, .8); iline(-200, hz, W + 200, hz, C.ink, 2.4);
  const sand = PR(-200, hz + 130, W + 400, 500); fillP(sand, C.tan); stipRect(-200, hz + 130, W + 400, 500, 3200, C.ink, .5, 2); iline(-200, hz + 130, W + 200, hz + 130, C.ink, 2.2);
  // his footprints, straight up the middle from the bottom edge
  for (let i = 0; i < 7; i++) { const fy = 1080 - i * 22 - i * i * 1.2, fx = 960 + (i % 2 ? 22 : -22) * (1 - i * .06); fillP(PE(fx, fy, 9 - i * .6, 5 - i * .3), '#a98a5c'); iE(fx, fy, 9 - i * .6, 5 - i * .3, 0, C.ink, 1, .6, false, .3); }
  // palms as matching brackets
  palm(300, 960, 1.3, { sway: Math.sin(T) }); X.save(); X.translate(W, 0); X.scale(-1, 1); palm(300, 960, 1.3, { sway: Math.sin(T + 1) }); X.restore();
  // him, square-on, listening
  const tx = 960, ty = 960, ts = 1.2;
  suitcase(tx + 150, ty - 96, .78);
  traveller(tx, ty, ts, { look: 0, mouth: sing(T), armR: a_armTo(1, 36, -314), armL: a_armTo(-1, -36, -314), case: false });
  a_backHand(tx - 36 * ts, ty - 314 * ts, ts);
  // what he listens for runs up toward the sun and stops dead at the underside of his cloud
  for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { const rr = 40 + i * 34 + ((FD * 4) % 34); gc(tx + sd * 44 * ts, ty - 314 * ts, rr, C.teal, .8 * (1 - i * .25), 2, [6, 6], sd > 0 ? -1.5 : Math.PI + .2, sd > 0 ? -.2 : Math.PI + 1.5); }
  cloud(tx, ty - 470 * ts - 40, .78, { rain: true });
  consL([[0, hz, W, hz], [sx, 0, sx, H]]); consC([[sx, sy, 330]]);
} };

// 66.3 SCH acoustics (label moved off the level bars)
SU.a_sSound = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1, 1.1, eo(p)));
  graticule(960, 540, 1900, 1100, 60, C.lav, .05); gl(0, 540, W, 540, C.lav, .3);
  const sx = 420, sy = 540; star(sx, sy, 14, C.white, 1); gc(sx, sy, 110, C.white, .7, 1.4); ticks(sx, sy, 120, 48, 8, C.white, .6, 1, 4);
  for (let i = 0; i < 9; i++) { const base = 140 + i * 110 + ((T * 90) % 110); X.beginPath(); for (let k = 0; k <= 120; k++) { const an = -.7 + k / 120 * 1.4, rr = base + Math.sin(an * 22 + T * 6) * 7; const x = sx + Math.cos(an) * rr, y = sy + Math.sin(an) * rr; k ? X.lineTo(x, y) : X.moveTo(x, y); } stroke(i % 3 === 0 ? C.mag : C.cyan, 1.4, cl(1 - base / 1200)); }
  const ex2 = 1460, ey = 540; X.beginPath(); for (let k = 0; k < 300; k++) { const th = k / 300 * 6 * Math.PI, rr = 8 + th * 12; const x = ex2 + Math.cos(th) * rr, y = ey + Math.sin(th) * rr * .8; k ? X.lineTo(x, y) : X.moveTo(x, y); } stroke(singing(T) ? C.mag : C.lav, 1.6, .95);
  stip(PE(ex2, ey, 230, 190), ex2, ey, 240, 900, C.lav, .45, 1.4);
  bracket(sx, 880, ex2, 880, C.cyan, .8, '149,600,000 KM'); lab(sx, 380, 'SOURCE', C.white, .9, 14, 'center'); lab(ex2, 300, 'RECEIVER', C.white, .9, 14, 'center');
  X.beginPath(); for (let i = 0; i < 40; i++) { const h = 10 + Math.abs(Math.sin(i * .7 + T * 8)) * 60 * (singing(T) ? 1 : .3); X.moveTo(760 + i * 10, 260); X.lineTo(760 + i * 10, 260 - h); } stroke(C.cyan, 3, .8);
  gl(750, 268, 1160, 268, C.lav, .6, 1); lab(955, 300, 'SUN · VOLUME', C.mag, .95, 16, 'center');
  screen(); schFrame('07', 'ACOUSTICS', 'THE SUN, OUT LOUD');
} };

// 78.3 SCH terrain under the land ship (neutral labels; the marker moves once across the shot)
SU.a_sContour = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.1, 1, eo(p)));
  for (const [cx, cy, n] of [[600, 420, 9], [1350, 640, 11], [1000, 200, 6]]) for (let i = 1; i <= n; i++) { X.beginPath(); for (let k = 0; k <= 60; k++) { const an = k / 60 * TAU, rr = i * 36 * (1 + .18 * Math.sin(an * 3 + i + cx) + .08 * Math.sin(an * 7)); const x = cx + Math.cos(an) * rr * 1.3, y = cy + Math.sin(an) * rr; k ? X.lineTo(x, y) : X.moveTo(x, y); } stroke(i % 5 === 0 ? C.white : C.lav, i % 5 === 0 ? 1.4 : 1, i % 5 === 0 ? .7 : .4); if (i % 3 === 0) lab(cx + i * 46, cy, String(i * 100), C.lav, .5, 10); }
  const rd = []; for (let i = 0; i <= 40; i++) { const t = i / 40; rd.push([lerp(0, W, t), 900 - Math.sin(t * 3) * 120 - t * 200]); } path(rd, C.white, 2, .8, [12, 8]);
  const cu = lerp(.18, .62, eio(p)), ci = Math.floor(cu * 40), fr = cu * 40 - ci, cp = [lerp(rd[ci][0], rd[ci + 1][0], fr), lerp(rd[ci][1], rd[ci + 1][1], fr)];
  path(rd.slice(0, ci + 1).concat([cp]), C.mag, 2.2, .9); star(cp[0], cp[1], 5, C.mag, 1); gl(cp[0], cp[1], cp[0], cp[1] - 150, C.mag, .8, 1.4); { const sl = [[cp[0] + 4, cp[1] - 146], [cp[0] + 4, cp[1] - 24], [cp[0] + 96, cp[1] - 24]]; stip(PP(sl), cp[0] + 40, cp[1] - 60, 90, 260, C.mag, .55, 1.3); iP(sl, true, C.mag, 1.2, .85, false, .2); lab(cp[0] + 50, cp[1] - 160, 'SAIL', C.lav, .7, 10, 'center'); }
  lab(cp[0] + 20, cp[1] - 16, 'HULL 01', C.mag, .9, 13); lab(cp[0] + 20, cp[1] + 6, 'WIND 4 KN', C.lav, .7, 11);
  star(rd[40][0] - 40, rd[40][1], 4, C.white, .7); lab(1500, 760, 'NEAREST WATER: 412 KM', C.cyan, .9, 14);
  screen(); schFrame('08', 'TERRAIN', 'CONTOUR 100 M');
} };

// 80.1 the road rolls itself up toward us like a carpet; the roll keeps turning and growing, the car keeps just ahead of it
SU.a_roadCarpet = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e6d9b8', 140, -.62, 0, C.tan); cam(960, 540, lerp(1.05, 1, eo(p)));
  const hz = 520, u = lerp(.04, .9, p);
  const h1 = PE(500, hz + 260, 900, 280); fillP(h1, '#b9b98a'); hatch(h1, 500, hz + 100, 900, .5, 8, C.ink, .9, .35, [40, 30]); iE(500, hz + 260, 900, 280, 0, C.ink, 2.2, 1, true, 1, Math.PI, TAU);
  const h2 = PE(1500, hz + 300, 800, 300); fillP(h2, C.sage); hatch(h2, 1500, hz + 100, 800, -.5, 7, C.ink, .9, .35, [-40, 30]); iE(1500, hz + 300, 800, 300, 0, C.ink, 2.2, 1, true, 1, Math.PI, TAU);
  const gnd = PR(-200, hz + 120, W + 400, 600); fillP(gnd, '#a8a878'); hatch(gnd, 960, hz + 400, 1400, -.2, 9, C.ink, .8, .3);
  const yAt = (t) => lerp(hz + 120, H + 40, t), xl = (y) => lerp(930, 420, (y - hz - 120) / (H + 40 - hz - 120)), xr = (y) => lerp(990, 1500, (y - hz - 120) / (H + 40 - hz - 120));
  const ry = lerp(hz + 150, 880, u), lx = xl(ry), rx = xr(ry), rr = lerp(22, 105, u);
  // bare paper where the road was: just its construction lines
  fillP(PP([[930, hz + 120], [990, hz + 120], [rx, ry], [lx, ry]]), C.paper, .9);
  X.setLineDash([6, 8]); X.beginPath(); X.moveTo(930, hz + 120); X.lineTo(lx, ry); X.moveTo(990, hz + 120); X.lineTo(rx, ry); X.moveTo(960, hz + 120); X.lineTo(960, ry); stroke(C.ink, 1.2, .5); X.setLineDash([]);
  // the road still down, ahead of the roll
  const rd = PP([[lx, ry], [rx, ry], [1500, H + 40], [420, H + 40]]); fillP(rd, '#8a8172'); hatch(rd, 960, 900, 600, .1, 6, C.ink, .9, .5); iP([[lx, ry], [420, H + 40]], false); iP([[rx, ry], [1500, H + 40]], false);
  for (let i = 0; i < 9; i++) { const t2 = i / 9, y = yAt(t2 * t2); if (y < ry + 6) continue; fillP(PR(958 - 6 * t2, y, 4 + 14 * t2, 8 + 40 * t2), C.cream); }
  // the roll: asphalt face turning toward us, the dashes and edge lines wrapping round it, spirals at both ends
  const cy = ry - rr, spin = T * 5.5, face = PR(lx - 6, ry - 2 * rr, rx - lx + 12, 2 * rr); fillP(face, '#7d7466'); hatch(face, 960, cy, rx - lx, 0, 4, C.ink, .9, .5); hatch(face, 960, cy, rx - lx, .2, 7, C.ink, .8, .35, [0, -rr * .5]);
  X.save(); X.clip(face);
  for (let k = 0; k < 8; k++) { const th = ((k / 8 * TAU + spin) % TAU) - Math.PI; if (Math.abs(th) > Math.PI / 2) continue; const y = cy + Math.sin(th) * rr, fh = Math.cos(th) * rr * .35; fillP(PR(952, y - fh / 2, 16, fh), C.cream); iline(lx - 6, y, rx + 6, y, C.ink, 1.2, .55, false); }
  for (const ex2 of [lx + 14, rx - 18]) fillP(PR(ex2, ry - 2 * rr, 4, 2 * rr), C.cream, .9);
  X.restore(); iBox(lx - 6, ry - 2 * rr, rx - lx + 12, 2 * rr, C.ink, 2.6);
  for (const [ex3, dir] of [[lx - 6, 1], [rx + 6, -1]]) {
    const cap = PE(ex3, cy, rr * .38, rr); fillP(cap, '#9a9080'); iE(ex3, cy, rr * .38, rr, 0, C.ink, 2.4);
    const turns = 2.5 + u * 4; X.beginPath(); for (let k = 0; k <= 120; k++) { const t2 = k / 120, th = t2 * turns * TAU * dir + spin * dir, r3 = t2 * rr * .95; k ? X.lineTo(ex3 + Math.cos(th) * r3 * .38, cy + Math.sin(th) * r3) : X.moveTo(ex3, cy); } stroke(C.ink, 1.4, .85);
  }
  for (let i = 0; i < 3; i++) gc(960, cy, rr * 2 + 50 + i * 30, C.orange, .6, 1.8, null, Math.PI * 1.15 + spin * .02, Math.PI * 1.85 + spin * .02);
  // the car keeps just ahead of it, always in frame
  const ccy = Math.min(1010, ry + 70 + rr * .6), cs = lerp(.45, 1.45, cl((ccy - hz - 120) / (1010 - hz - 120)));
  for (let i = 0; i < 3; i++) { const t2 = ((T * 2.4 + i / 3) % 1); iE(940 - 120 * cs - t2 * 30, ccy - 20 - t2 * 40, 14 + t2 * 30, 10 + t2 * 20, 0, C.ink, 1.4, .7 * (1 - t2), false); }
  car(940, ccy, cs);
  traveller(260, 1060, 1.15, { look: 1, mouth: sing(T) }); cloud(260, 520, .62, { rain: true });
  consL([[0, hz + 120, W, hz + 120], [960, hz + 120, 0, H], [960, hz + 120, W, H]]);
} };

// 84.7 SCH: the route, drawn once across the shot; the road behind the marker is rolled up
SU.a_sMap = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.15, 1, eo(p)));
  graticule(960, 540, 2000, 1200, 80, C.lav, .15);
  const land = PP(COAST); stip(land, 900, 560, 800, 9000, C.lav, .5, 1.6); iP(COAST, true, C.lav, 1.3, .9, false, .4);
  for (let k = 1; k < 4; k++) iP(COAST.map(([x, y]) => [900 + (x - 900) * (1 - k * .12), 560 + (y - 560) * (1 - k * .12)]), true, C.lav, 1, .25, false, .3);
  const A = [420, 760], B = [700, 300], Cc = [1200, 820], D = [1500, 380], u = lerp(.02, 1, eio(seg(p, .04, .94)));
  path(bzPts(A, B, Cc, D, 0, Math.max(0, u - .12)), C.lav, 1.2, .5, [2, 9]); path(bzPts(A, B, Cc, D, Math.max(0, u - .12), u), C.mag, 2.6, .95); path(bzPts(A, B, Cc, D, u, 1), C.white, 1.2, .55, [4, 8]);
  star(A[0], A[1], 5, C.white, .9); star(D[0], D[1], 5, C.white, .7); const [px, py] = bz(A, B, Cc, D, u); star(px, py, 6, C.mag, 1);
  const [bx, by] = bz(A, B, Cc, D, Math.max(0, u - .12)); gc(bx, by, 16, C.cyan, .9, 1.4); gl(bx, by, bx - 60, by + 90, C.cyan, .6); lab(bx - 64, by + 108, 'ROAD BEHIND: ROLLED UP', C.cyan, .9, 12, 'right');
  lab(A[0] - 20, A[1] + 34, 'HOME', C.white, .9, 13, 'right'); lab(D[0] + 20, D[1] - 16, '?', C.white, .9, 18);
  const rx = 1700, ry = 190; gc(rx, ry, 70, C.lav, .8, 1.2); ticks(rx, ry, 70, 32, 6, C.lav, .7, 1, 4); gl(rx, ry - 100, rx, ry + 100, C.lav, .7); gl(rx - 100, ry, rx + 100, ry, C.lav, .7); lab(rx, ry - 112, 'N', C.white, .95, 16, 'center');
  bracket(180, 980, 480, 980, C.cyan, .85, '0 — 100 KM'); lab(1240, 930, 'WAY BACK: 0 KM', C.mag, .95, 15);
  screen(); schFrame('08', 'ROUTE', 'ONE WAY ONLY');
} };

// 100.0 SCH on hold: the queue number only ever goes up, slowly
SU.a_sHold = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.05, 1, eo(p)));
  lattice(960, 540, 70, 12, C.lav, .06); gl(0, 540, W, 540, C.lav, .3);
  X.beginPath(); for (let x = 0; x <= W; x += 6) { const y = 540 + Math.sin(x * .02 + T * 6) * 60 * Math.sin(x * .003 + T); x ? X.lineTo(x, y) : X.moveTo(x, y); } stroke(C.cyan, 1.6, .9);
  const n = 47 + Math.floor(Math.max(0, T - 100.6) * 1.2); lab(960, 330, 'POSITION IN QUEUE', C.lav, .8, 16, 'center'); lab(960, 420, String(n), C.mag, 1, 90, 'center', 'alphabetic', 'bold');
  if (T > 100.6) { star(1150, 360, 5, C.mag, .9); lab(1180, 366, '▲ ' + (n - 47), C.mag, .9, 18); }
  for (let i = 0; i < 12; i++) { const t2 = (T * .4 + i / 12) % 1; const x = lerp(1900, 20, t2); fillP(PE(x, 760, 9, 7, -.4), C.cyan); gl(x + 8, 760, x + 8, 730, C.cyan, .9, 1.6); }
  lab(960, 860, 'HOLD MUSIC · ' + Math.floor(T / 60) + ':' + String(Math.floor(T % 60)).padStart(2, '0') + ' ELAPSED', C.lav, .7, 14, 'center');
  screen(); schFrame('21', 'ON HOLD', 'YOUR CALL IS IMPORTANT');
} };

// 104.2 the giant rubber stamp on the town: URGENT in dark oxblood on a cream knockout, so it reads over the red roofs
SU.a_stampWorld = { mode: 'ill', f(q, p, a, T) {
  const hit = .34, shake = p > hit && p < hit + .12 ? 1 : 0, INK2 = '#5e1c19';
  stripes(C.paper, '#e6d9b8', 140, -.62, 0, C.tan); cam(960 + jit(14 * shake), 540 + jit(14 * shake), 1);
  const hz = 700;
  for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) { const w2 = 150 + ((i * 37 + row * 11) % 60), x = -60 + i * 230 + row * 70, hh = 140 + ((i * 53 + row * 29) % 120), y = 420 + row * 120; const b = PR(x, y - hh, w2, hh + 40); fillP(b, [C.brick, C.tan, C.sage, C.ochre, C.rose][(i + row) % 5]); shade(b, x + w2 / 2, y - hh / 2, hh, [w2 * .25, 0], .9, 5); iBox(x, y - hh, w2, hh + 40, C.ink, 2); const rf = PP([[x - 10, y - hh], [x + w2 / 2, y - hh - 60], [x + w2 + 10, y - hh]]); fillP(rf, '#7a4a2a'); hatch(rf, x + w2 / 2, y - hh - 30, w2, .4, 4, C.ink, .9, .55); iP([[x - 10, y - hh], [x + w2 / 2, y - hh - 60], [x + w2 + 10, y - hh]], true, C.ink, 2); for (let k = 0; k < 2; k++) { const wn = PR(x + 20 + k * (w2 / 2), y - hh + 30, 30, 40); fillP(wn, C.cream); iBox(x + 20 + k * (w2 / 2), y - hh + 30, 30, 40, C.ink, 1.4); } }
  const g = PR(-200, hz + 140, W + 400, 500); fillP(g, '#b9a98a'); hatch(g, 960, hz + 300, 1400, .15, 9, C.ink, .8, .35); iline(-200, hz + 140, W + 200, hz + 140, C.ink, 2.6);
  traveller(330, 1040, .9, { look: 1, mouth: sing(T) }); cloud(330, 620, .5, { rain: true }); kioskMini(1600, 1000, .55);
  if (p > hit) { X.save(); X.translate(1000, 560); X.rotate(-.12); const kn = [[-350, -70], [350, -78], [356, 72], [-344, 80]]; fillP(PP(kn), C.cream, .92); iP(kn, true, INK2, 2, .7, false, 2); X.restore(); stampMark(1000, 560, 380, a.mark || 'URGENT', INK2, -.12, .95); }
  const sy = p < hit ? lerp(-900, 380, eo(p / hit)) : lerp(380, -900, eo((p - hit - .12) / .5)), sx = 1000;
  if (sy > -880) { const b = PR(sx - 380, sy, 760, 120); fillP(b, '#3b2a22'); iBox(sx - 380, sy, 760, 120, C.ink, 3); const nk = PR(sx - 70, sy - 380, 140, 380); fillP(nk, '#8a5530'); shade(nk, sx, sy - 190, 200, [20, 0], .9, 5); iBox(sx - 70, sy - 380, 140, 380, C.ink, 3); const kb = PE(sx, sy - 430, 190, 110); fillP(kb, '#a5703f'); shade(kb, sx, sy - 430, 200, [30, -20], .7, 5); iE(sx, sy - 430, 190, 110, 0, C.ink, 3); }
  if (shake) for (let i = 0; i < 4; i++) gc(1000, 600, 400 + i * 70 + (p - hit) * 900, C.orange, .8, 3, null, Math.PI, TAU);
  consL([[0, hz + 140, W, hz + 140], [1000, 0, 1000, H]]);
} };

// 109.95 SCH ticket: the note sits inside the stub, under the band
SU.a_sTicket = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.1, 1, eo(p)));
  lattice(960, 540, 70, 10, C.lav, .06); ticket(960, 540, 2, -.05, { sch: 1, col: C.lav, to: a.to || 'AWAY' });
  X.save(); X.translate(960, 540); X.rotate(-.05); star(500, -96, 5, C.mag, 1); lab(320, -82, a.note || 'RETURN: INCLUDED', C.mag, .95, 14); X.restore();
  bracket(400, 860, 1520, 860, C.cyan, .8, '1 WAY');
  screen(); schFrame('05', 'TICKET', 'CLASS: ECONOMY');
} };

// ---------- the cut list: 0 - 116.6 ----------
var CUTS_A = [
  // intro, wordless: the street, the shop, in through the door
  [0.0, 'a_street', {}],
  [4.02, 'cloudWalk', {}],
  [7.57, 'sTraveller', {}],
  [10.82, 'a_puddle', {}],
  [13.56, 'shop', { walk: [-120, 1300], byP: 1, ring: 1 }],
  [17.6, 'a_posterCU', {}],
  [22.55, 'a_doorBell', {}],
  [25.29, 'sPlan', {}],
  [27.59, 'a_interior', {}],
  // "give me the news": the old-fashioned office
  [31.1, 'desk', {}],
  [35.04, 'a_newspaper', {}],
  [37.04, 'sNews', {}],
  [39.78, 'a_rolodex', {}],
  [42.38, 'sBoard', {}],
  // "farthest away from these blues": the globe, the antipode
  [44.7, 'globeSpin', { fast: 1, cloud: 1 }],
  [47.07, 'sGlobe', { anti: 1, title: 'FARTHEST POINT', sub: 'FROM THESE BLUES' }],
  [50.69, 'a_pin', {}],
  [53.85, 'a_sPin', {}],
  // from here: one impossible thing per scene. "hear the sun out loud"
  [59.0, 'a_beach', {}],
  [61.7, 'a_sunHorn', {}],
  [66.28, 'a_sSound', {}],
  [68.70, 'a_shell', {}],
  // "the car on a land"
  [73.7, 'a_landShip', {}],
  [78.3, 'a_sContour', {}],
  [80.13, 'a_roadCarpet', {}],
  [84.66, 'a_sMap', {}],
  // chorus 1: a roadside payphone; she answers somewhere else
  [90.8, 'a_payphone', {}],
  [93.69, 'a_sWire', {}],
  [95.48, 'a_poleDesk', {}],
  [100.0, 'a_sHold', {}],
  // "help me quick"
  [104.2, 'a_stampWorld', { mark: 'URGENT' }],
  [107.8, 'mvu_dialFace', {}],
  [109.95, 'a_sTicket', { note: 'DEPARTS: NOW' }],
  [112.25, 'a_rushRoad', {}],
];

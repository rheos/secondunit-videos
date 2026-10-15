// Act A (0 - 116.6 s): grounded, then one impossible thing per scene.
// Intro: the street, the shop, the posters, in through the door. Verse: the old-fashioned office, the news, the globe.
// From 59: the sun as a loudspeaker, the sun in a shell, a car refused everywhere, then a footpath.
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

// ---------- draft 11 helpers ----------
// The punchline label of a shot: >= 28 px bold, tighter tracking than lab() so it still fits its box or bracket.
function a_punch(x, y, t, col, a = 1, sz = 30, al = 'left', bl = 'alphabetic') {
  X.font = `bold ${sz}px ${MONO}`; try { X.letterSpacing = (sz * .06).toFixed(1) + 'px'; } catch (e) {}
  X.textAlign = al; X.textBaseline = bl; X.globalAlpha = a; X.fillStyle = col; X.fillText(t, x, y); X.globalAlpha = 1;
  try { X.letterSpacing = '0px'; } catch (e) {}
}
// Draw a shared set-up with its punchline label enlarged: lab() is swapped for the length of the call only.
function a_withPunch(map, fn) {
  const L0 = lab;
  lab = function (x, y, t, col, a, sz, al, bl, wt) { return t in map ? a_punch(x, y, t, col, a ?? 1, map[t], al || 'left', bl || 'alphabetic') : L0(x, y, t, col, a, sz, al, bl, wt); };
  try { fn(); } finally { lab = L0; }
}
const a_punchSU = (key, map) => ({ mode: SU[key].mode, f(q, p, a, T) { a_withPunch(map, () => SU[key].f(q, p, a, T)); } });
// Full colour belongs to the screens (Robin, draft 11): pull a shot back to about 2/3 of its saturation, keeping its
// light and dark, so act A's ochre paper holds it.
function a_mute(k = .46, warm = .16) { screen(); X.save(); X.globalCompositeOperation = 'saturation'; X.globalAlpha = k; X.fillStyle = '#808080'; X.fillRect(0, 0, W, H); X.globalCompositeOperation = 'color'; X.globalAlpha = warm; X.fillStyle = C.ochre; X.fillRect(0, 0, W, H); X.restore(); }
// A coiled phone cord: a helix round a base curve fb(t) -> [x, y], sampled finely so it reads as a coil, not a zigzag.
function a_coil(fb, turns, amp, col = C.ink, w = 2.2, N = 360) {
  X.beginPath();
  for (let i = 0; i <= N; i++) {
    const t = i / N, [x, y] = fb(t), [x2, y2] = fb(Math.min(1, t + .002)), [x0, y0] = fb(Math.max(0, t - .002)), L = Math.hypot(x2 - x0, y2 - y0) || 1;
    const tx = (x2 - x0) / L, ty = (y2 - y0) / L, ph = t * turns * TAU, am = typeof amp === 'function' ? amp(t) : amp;
    const px = x - ty * Math.sin(ph) * am + tx * Math.cos(ph) * am * .45, py = y + tx * Math.sin(ph) * am + ty * Math.cos(ph) * am * .45;
    i ? X.lineTo(px, py) : X.moveTo(px, py);
  }
  stroke(col, w, 1);
}
// A pale knockout behind his cloud, so it reads on a dark sky (the stamp's cream knockout, same idea)
function a_cloudHalo(x, y, s, col = C.cream, a = .9) {
  X.save(); X.translate(x, y); X.scale(s, s); const u = new Path2D();
  for (const [a2, b2, r2] of [[-80, 0, 52], [-30, -30, 64], [30, -22, 58], [80, 4, 46], [0, 12, 60]]) u.addPath(PE(a2, b2, r2 + 16, (r2 + 16) * .82));
  fillP(u, col, a); X.restore();
}

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
  // draft 11: before the cut he puts it back on, so he is wearing it at the desk (hat continuity 27.6 / 31.1)
  const lk = .9 * 6, kOn = eio(seg(p, .55, .82)), kDown = eio(seg(p, .84, 1)), worn = p >= .82;
  const hand = worn ? [lerp(lk + 40, 40, kDown), lerp(-336, -150, kDown)] : [lerp(58, lk + 40, kOn), lerp(-150, -336, kOn)];
  const HA = a_armTo(1, hand[0], hand[1]); traveller(600, 1040, 1.3, { look: .9, hat: worn, armR: HA, case: false });
  { const [hx, hy] = handAt(600, 1040, 1.3, HA);
    if (!worn) { X.save(); X.translate(hx, hy + 8); X.rotate(lerp(1.3, 0, kOn)); X.translate(lerp(40, -40, kOn) * 1.3, 0); a_fedora(1.3); X.restore(); }
    a_backHand(hx, hy, 1.3);
    if (kOn < .3) for (let i = 0; i < 3; i++) { const d2 = ((T * 1.6 + i / 3) % 1); fillP(PE(hx + 6 + i * 6, lerp(hy + 100, 1030, d2), 3, 6), C.teal); } }
  suitcase(430, 950, .9);
  cloud(600, 120, .62, { rain: true });
  for (let i = 0; i < 6; i++) { const dy2 = ((T * 2 + i / 6) % 1); fillP(PE(560 + i * 14, lerp(780, 1030, dy2), 3, 6), C.teal); }
  X.setLineDash([10, 9]); X.beginPath(); X.moveTo(680, 640); X.quadraticCurveTo(900, 520, 1160, 520); stroke(C.teal, 1.8, .8); X.setLineDash([]);
  consL([[0, 930, W, 930], [0, 640, W, 640], [1220, 0, 1220, H]]);
} };

// ---------- 31.1 the desk (draft 11, was the shared 'desk', ~4 s near still): on "Travel agent" he rocks his chair
// forward onto its front legs, leans in and taps her desk globe twice; each tap sets it turning ----------
const A_TAPS = [31.62, 32.52];
SU.a_desk = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#ead6a6', 120, -.62, 0, C.ochre);
  cam(960, 560, lerp(1, 1.06, eo(p)));
  poster(170, 120, 250, 320, 'palm'); poster(1540, 110, 250, 320, 'plane');
  iline(-200, 960, W + 200, 960, C.ink, 2.4); const fl = PR(-200, 960, W + 400, 300); fillP(fl, '#b9925f'); hatch(fl, 960, 1060, 1200, .15, 8, C.ink, .8, .35); X.beginPath(); for (let x = -200; x < W + 200; x += 140) { X.moveTo(x, 960); X.lineTo(x + (x - 960) * .3, 1200); } stroke(C.ink, 1.1, .45);
  consL([[0, 700, W, 700], [1180, 0, 1180, H], [560, 0, 560, H]]); consC([[930, 560, 210]]);
  for (let i = 0; i < 3; i++) { const bx = 1560 + i * 70, by = 520 - i * 4, bp = PR(bx, by, 60, 86); fillP(bp, [C.teal, C.rose, C.sage][i]); hatch(bp, bx + 30, by + 43, 60, .8, 5, C.ink, .8, .45, [6, -6]); iBox(bx, by, 60, 86, C.ink, 1.8); }
  iline(1540, 610, 1790, 610, C.ink, 3); iline(1560, 610, 1560, 960, C.ink, 3); iline(1770, 610, 1770, 960, C.ink, 3);
  desk(1180, 700, 640);
  agent(1180, 700, 1.55, { talk: 0, look: lerp(-.7, -.95, eo(seg(T, 31.5, 32))) });
  // the taps: a quick touch per tap; each one adds a turn to the globe that runs down
  let tap = 0, spin = 0; for (const t0 of A_TAPS) { const d = T - t0; if (d >= -.12 && d < .25) tap = Math.max(tap, d < 0 ? 1 + d / .12 : 1 - d / .25); if (d > 0) spin += 1.6 * (1 - Math.exp(-d * 2.2)); }
  globeOnDesk(905, 545, 92, .8 + spin);
  if (spin > 0) for (let i = 0; i < 2; i++) { const a0 = -2.6 + i * .5 + spin * 1.5; gc(905, 545, 112 + i * 16, C.orange, .7, 1.8, null, a0, a0 + .7); }
  const ph = PR(1380, 664, 90, 34); fillP(ph, '#2b1d14'); iBox(1380, 664, 90, 34, C.ink, 1.8); iE(1425, 660, 56, 12, 0, C.ink, 3, 1, false, 1, Math.PI, TAU);
  // him: chair and all tip forward about the front chair foot
  const lean = .2 * eio(seg(T, 31.1, 31.5)) * (1 - eio(seg(T, 33.9, 34.9))), pv = [637, 960], ts = 1.42, tx = 560, ty = 960;
  const toLocal = ([x, y]) => { const dx = x - pv[0], dy = y - pv[1], c = Math.cos(-lean), s = Math.sin(-lean); return [((pv[0] + dx * c - dy * s) - tx) / ts, ((pv[1] + dx * s + dy * c) - ty) / ts]; };
  const toScreen = ([lx, ly]) => { const x = tx + lx * ts - pv[0], y = ty + ly * ts - pv[1], c = Math.cos(lean), s = Math.sin(lean); return [pv[0] + x * c - y * s, pv[1] + x * s + y * c]; };
  const reach = eio(seg(T, 31.2, 31.55)) * (1 - eio(seg(T, 33.6, 34.4))), hover = [792, 506], touch = [818, 520];
  const tgt = toLocal([lerp(lerp(700, hover[0], reach), touch[0], tap * reach), lerp(lerp(700, hover[1], reach), touch[1], tap * reach)]);
  const armR = reach > .02 ? a_armTo(1, tgt[0], tgt[1]) : [.55, .95];
  X.save(); X.translate(pv[0], pv[1]); X.rotate(lean); X.translate(-pv[0], -pv[1]);
  chair(540, 960, 1.05);
  traveller(tx, ty, ts, { sit: 1, mouth: sing(T), look: .9, armR, armL: [.35, .6], case: false });
  X.restore();
  if (tap > .6) { const [hx, hy] = toScreen(tgt); for (let i = 0; i < 3; i++) gc(hx + 4, hy, 14 + i * 12, C.orange, .85, 2, null, -1.4 + i * .1, 1.4 - i * .1); }
  suitcase(380, 860, .9);
  const hd = toScreen([5.4, -306]); cloud(hd[0] - 40, 300, .62, {});
  if (singing(T)) for (let i = 0; i < 3; i++) { const rr = 30 + ((FD * 5 + i * 30) % 90); gc(hd[0] + 40, hd[1] + 20, rr, C.orange, .75 * (1 - rr / 120), 1.8, null, -.8, .8); }
  X.setLineDash([10, 9]); X.beginPath(); X.moveTo(hd[0] + 40, hd[1] - 20); X.quadraticCurveTo(900, 330, 1165, 470); stroke(C.teal, 1.8, .8); X.setLineDash([]);
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

// ---------- 39.8 the rolodex: she turns its knob; the cards flip past, every destination on file, and stop on NOT HERE ----------
// draft 11: her hand is on the knob (no floating sleeve); seven slower flips land on the empty card; each card's little
// inhabited place (Nakamura, draft 10) fills the card face, so its waving resident reads on a phone.
const A_DEST = ['LISBON', 'REYKJAVIK', 'TIMBUKTU', 'ULAANBAATAR', 'KATHMANDU', 'TIERRA DEL FUEGO', 'ANYWHERE', 'NOT HERE'];
// one card's place, in native units (h = 130); the caller scales it onto the card face. NOT HERE is empty.
function a_cardWorld(name, x, y, w, h, T) {
  const i = A_DEST.indexOf(name), gy = y + h, wv = (FD >> 2) % 2; X.save(); const fr = PR(x, y, w, h); X.clip(fr);
  fillP(fr, i === 7 ? '#efe4c8' : '#dfe7e0'); hatch(fr, x + w / 2, y + h / 2, w, -.9, 7, C.ink, .7, .15);
  if (i !== 7) { const gr = PR(x, gy - 22, w, 22); fillP(gr, i === 2 ? C.ochre : i === 1 || i === 5 ? '#f4f4ef' : C.sage); iline(x, gy - 22, x + w, gy - 22, C.ink, 1.4, 1, false); }
  const cx = x + w * .58;
  if (i === 0) { for (let k = 0; k < 4; k++) { const hx = x + w * .34 + k * 34, hh = 30 + (k % 2) * 14; fillP(PR(hx, gy - 22 - hh, 28, hh), [C.brick, C.cream, C.ochre, C.rose][k]); iBox(hx, gy - 22 - hh, 28, hh, C.ink, 1.2); } }
  else if (i === 1) { const v = PP([[cx - 50, gy - 22], [cx - 10, gy - 70], [cx + 10, gy - 70], [cx + 50, gy - 22]]); fillP(v, '#7c8794'); iP([[cx - 50, gy - 22], [cx - 10, gy - 70], [cx + 10, gy - 70], [cx + 50, gy - 22]], true, C.ink, 1.4); fillP(PE(cx, gy - 84, 14, 8), '#c9ccd2'); }
  else if (i === 2) { const d = PE(cx, gy - 22, 70, 26); fillP(d, '#d9a46a'); iE(cx, gy - 22, 70, 26, 0, C.ink, 1.4, 1, false, 1, Math.PI, TAU); fillP(PR(cx - 18, gy - 72, 36, 26), '#c08a50'); iBox(cx - 18, gy - 72, 36, 26, C.ink, 1.2); }
  else if (i === 3) { const yt = PP([[cx - 34, gy - 22], [cx - 34, gy - 46], [cx, gy - 66], [cx + 34, gy - 46], [cx + 34, gy - 22]]); fillP(yt, C.cream); iP([[cx - 34, gy - 22], [cx - 34, gy - 46], [cx, gy - 66], [cx + 34, gy - 46], [cx + 34, gy - 22]], true, C.ink, 1.4); fillP(PR(cx - 8, gy - 40, 16, 18), C.brick); }
  else if (i === 4) { iP([[x + 10, gy - 22], [cx - 10, gy - 92], [cx + 20, gy - 60], [x + w - 10, gy - 22]], false, C.ink, 1.6); fillP(PP([[cx - 24, gy - 70], [cx - 10, gy - 92], [cx + 4, gy - 72]]), '#ffffff'); }
  else if (i === 5) { fillP(PR(cx - 8, gy - 82, 16, 60), C.cream); hatch(PR(cx - 8, gy - 82, 16, 60), cx, gy - 52, 30, 0, 14, C.brick, 6, .9); iBox(cx - 8, gy - 82, 16, 60, C.ink, 1.2); for (let k = 0; k < 2; k++) gl(cx, gy - 78, cx + (k ? 60 : -60), gy - 90, C.ochre, wv ? .9 : .4, 2); }
  else if (i === 6) { fillP(PE(cx, gy - 24, 44, 10), C.ochre); iline(cx, gy - 26, cx + 6, gy - 74, C.ink, 2, 1, false); fillP(PE(cx + 6, gy - 76, 22, 8, .3), C.sage); }
  if (i !== 7) { // the resident, in front, waving on fours (3 Hz, not a strobe)
    const rx = x + w * .17, ry = gy - 22, hy = ry - (wv ? 46 : 36); X.save(); X.translate(rx, ry); X.scale(1.3, 1.3); X.translate(-rx, -ry);
    iline(rx - 3, ry, rx - 4, ry - 10, C.ink, 2.4, 1, false); iline(rx + 3, ry, rx + 4, ry - 10, C.ink, 2.4, 1, false);
    const bd = PE(rx, ry - 19, 7, 12); fillP(bd, [C.brick, C.teal, C.plum, C.orange, C.rose, C.teal, C.brick][i]); iE(rx, ry - 19, 7, 12, 0, C.ink, 1.3, 1, false);
    iline(rx - 5, ry - 25, rx - 11, ry - 12, C.ink, 2.2, 1, false); iline(rx + 5, ry - 26, rx + 16, hy, C.ink, 2.4, 1, false); fillP(PE(rx + 16, hy, 3, 3), '#e7c9a2');
    const hd = PE(rx, ry - 37, 7, 7.5); fillP(hd, '#e7c9a2'); iE(rx, ry - 37, 7, 7.5, 0, C.ink, 1.3, 1, false); fillP(PE(rx + 2, ry - 38, 1.2, 1.4), C.ink);
    if (wv) for (let k = 0; k < 2; k++) gc(rx + 16, hy, 8 + k * 6, C.orange, .8, 1.2, null, -2.2, -.6);
    X.restore();
  }
  else lab(x + w / 2, y + h / 2 + 4, '(EMPTY)', C.ink, .45, 14, 'center');
  X.restore(); iBox(x, y, w, h, C.ink, 1.6);
}
// a card face: number, name, and its place, squashed with the card as it flips (279 = the face's standing height)
function a_cardFace(name, tp, bot, no, T) {
  const kk = (bot - tp) / 279; if (kk < .12) return;
  X.save(); X.translate(0, tp); X.scale(1, kk);
  lab(1196, 24, 'No.' + no, C.brick, .9, 16, 'right');
  lab(730, 60, name, C.ink, 1, 36, 'left', 'alphabetic', 'bold');
  X.translate(726, 72); X.scale(1.46, 1.46); a_cardWorld(name, 0, 0, 466 / 1.46, 130, T);
  X.restore();
}
SU.a_rolodex = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e6d3a8', 130, -.62, 0, C.ochre);
  cam(1000, 560, lerp(1.34, 1.28, eo(p)));
  const dk = PR(-200, 820, W + 400, 400); fillP(dk, '#c08a50'); hatch(dk, 960, 950, 1400, .05, 8, C.ink, .8, .35); X.beginPath(); for (let i = 0; i < 8; i++) { const y = 840 + i * 30; X.moveTo(-200, y); for (let x = -200; x < W + 200; x += 60) X.lineTo(x + 60, y + Math.sin(x * .03 + i) * 4); } stroke(C.ink, .9, .4); iline(-200, 820, W + 200, 820, C.ink, 2.6);
  const ax = 960, ay = 640, R0 = 300, u = cl(p / .84), step = u >= 1 ? 7 : Math.floor(u * 7), flip = u >= 1 ? 0 : (u * 7) % 1;
  // base + side wheels
  const base = PP([[620, 820], [1300, 820], [1250, 760], [670, 760]]); fillP(base, '#2b2420'); iP([[620, 820], [1300, 820], [1250, 760], [670, 760]], true, C.ink, 2.6);
  for (const wx of [640, 1280]) { const wh = PE(wx, ay, 46, R0 * .8); fillP(wh, '#3b3530'); shade(wh, wx, ay, R0, [10, 0], .9, 4); iE(wx, ay, 46, R0 * .8, 0, C.ink, 2.6); fillP(PE(wx, ay, 16, 16), C.ochre); iE(wx, ay, 16, 16, 0, C.ink, 1.8); iline(wx, ay + R0 * .8 - 10, wx + (wx < 960 ? -20 : 20), 770, C.ink, 6); }
  iline(640, ay, 1280, ay, C.ink, 5);
  // the knob on the right axle
  const kx = 1330; iline(1290, ay, kx, ay, C.ink, 9); const kb = PE(kx, ay, 22, 46); fillP(kb, '#6b4a2e'); shade(kb, kx, ay, 48, [8, 0], .9, 4); iE(kx, ay, 22, 46, 0, C.ink, 2.6);
  // the cards, fanned around the axle: back stack leans away, one card flips forward, the flipped ones lie toward us
  const Hc = 330, cw0 = 700, cw1 = 1220, topAt = (th) => ay - Hc * .75 * Math.cos(th) + Math.sin(th) * Hc * .55, botAt = (th) => ay + 16 + Math.sin(th) * 12, cardAt = (th, i, front) => {
    const top = topAt(th), bot = botAt(th), skew = Math.sin(th) * 40;
    const pts = [[cw0 - skew, top], [cw1 + skew, top], [cw1, bot], [cw0, bot]], cp = PP(pts);
    fillP(cp, front ? '#e2d3b0' : (i % 4 === 0 ? '#f2e3c0' : C.cream)); hatch(cp, 960, (top + bot) / 2, 320, front ? 1.2 : .2, front ? 6 : 9, C.ink, .7, front ? .4 : .16, [0, -10]);
    iP(pts, true, C.ink, 1.6, .9, false); iline(cw0 - skew, top, cw1 + skew, top, C.ink, 2.2, 1, false);
    return top;
  };
  for (let i = 18; i >= 1; i--) cardAt(-.12 - i * .07, i, false);
  const thF = lerp(-.1, 1.45, eio(flip)), d0 = A_DEST[step % A_DEST.length], d1 = A_DEST[(step + 1) % A_DEST.length];
  // the card behind the flipping one, revealed once the flipper has gone over
  const t1 = cardAt(-.12, 0, false); if (thF >= .9) a_cardFace(d1, t1, botAt(-.12), 102 + step, T);
  for (let i = 1; i <= 8; i++) cardAt(1.2 + i * .04, i, true);
  if (thF < Math.PI / 2) { const tp = cardAt(thF, 0, thF > .9); if (thF < .9) a_cardFace(d0, tp, botAt(thF), 101 + step, T); }
  for (let i = 0; i < 3; i++) gc(kx, ay, 70 + i * 22, C.orange, .7 * (flip > 0 ? 1 : .3), 2, null, -2.4 + flip * .5, -1.5 + flip * .5);
  // her hand round the knob, her arm in from off frame right; the wrist rolls a notch per card
  limb([[1820, 1010], [1640, 830], [1415, 694]], 44, {}, 1, '#b8766b');
  X.save(); X.translate(kx, ay); X.rotate(-.12 + Math.sin(flip * Math.PI) * .16); X.translate(-kx, -ay);
  const cf = PE(1408, 690, 20, 36, -.9); fillP(cf, C.rose); hatch(cf, 1408, 690, 40, .4, 4, C.ink, .8, .5); iE(1408, 690, 20, 36, -.9, C.ink, 2.2);
  const palm = PE(1368, 660, 44, 36, -.5); fillP(palm, '#e7c9a2'); shade(palm, 1368, 660, 46, [8, 8], .6, 4); iE(1368, 660, 44, 36, -.5, C.ink, 2.4);
  for (let i = 0; i < 4; i++) { const by = 622 + i * 17, fp = [[1356, by + 4], [1328, by - 2], [1312, by + 8]]; limb(fp, 13, {}, 1, '#e7c9a2'); }
  limb([[1372, 690], [1344, 702], [1322, 694]], 14, {}, 1, '#e7c9a2');
  X.restore();
  souvenirsOn(330, 810, T, 1);
  consL([[0, ay, W, ay], [960, 0, 960, H], [0, 820, W, 820]]); consC([[960, ay, R0]]);
} };

// ---------- 50.7 the pencil, from the far side (draft 11: a close-up on the globe's far face, not a fourth globe on a
// stand). He stands at the antipode, small on the curve of her desk globe under its brass meridian ring; the pencil
// she pushed through from home breaks out of the sea beside him. ----------
SU.a_pin = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#dfe3cc', 150, -.62, 0, C.sage);
  cam(960, 540, lerp(1, 1.06, eo(p)));
  const gx = 960, gy = 3250, R = 2400, yAt = (x) => gy - Math.sqrt(R * R - (x - gx) * (x - gx)), disc = PE(gx, gy, R, R);
  // the brass meridian ring, arching over the sky, degrees marked
  { const mx = 900, my = 1700, mr = 1640, a0 = Math.PI * 1.05, a1 = Math.PI * 1.95, band = new Path2D(); band.arc(mx, my, mr + 24, a0, a1); band.arc(mx, my, mr - 24, a1, a0, true); band.closePath();
    fillP(band, '#b0823f'); hatch(band, mx, my - mr, mr, .9, 6, C.ink, .9, .45, [0, 16]);
    for (const rr of [mr + 24, mr - 24]) { X.beginPath(); for (let k = 0; k <= 160; k++) { const an = lerp(a0, a1, k / 160); X.lineTo(mx + Math.cos(an) * rr + jit(.8), my + Math.sin(an) * rr + jit(.8)); } stroke(C.ink, 2.6, 1); }
    X.beginPath(); for (let k = 0; k <= 90; k++) { const an = lerp(a0, a1, k / 90), L = k % 5 ? 9 : 20; X.moveTo(mx + Math.cos(an) * (mr - 24), my + Math.sin(an) * (mr - 24)); X.lineTo(mx + Math.cos(an) * (mr - 24 + L), my + Math.sin(an) * (mr - 24 + L)); } stroke(C.ink, 1.4, .8); }
  // the globe's far face: sea, its graticule in perspective, and the land he stands on
  fillP(disc, C.sky); X.save(); X.clip(disc);
  hatch(PR(-200, 800, W + 400, 500), 960, 1000, 1300, .04, 9, C.ink, .8, .3);
  X.beginPath(); for (let i = -9; i <= 9; i++) { const hx = gx + i * 210, hy = yAt(hx); X.moveTo(hx, hy); X.lineTo(gx + (hx - gx) * .25, gy - R * .35); } stroke(C.ink, 1.2, .35);
  for (const d of [40, 110, 210, 350]) { X.beginPath(); for (let k = 0; k <= 80; k++) { const x = -200 + k * 29, y = gy - Math.sqrt((R - d) * (R - d) - (x - gx) * (x - gx)); X.lineTo(x, y); } stroke(C.ink, 1.2, .35); }
  X.beginPath(); for (let i = 0; i < 26; i++) { const r2 = M32(i * 11 + 4), wx = r2() * W, wy = yAt(wx) + 30 + r2() * 200; if (Math.abs(wx - 1340) < 120 && wy < 960) continue; X.moveTo(wx, wy); X.quadraticCurveTo(wx + 18, wy - 7, wx + 36, wy); } stroke(C.cream, 2, .8);
  const land = []; for (let x = 300; x <= 880; x += 20) land.push([x, yAt(x) - 1]); land.push([900, yAt(900) + 50], [800, 1140], [270, 1140], [250, yAt(250) + 40]);
  fillP(PP(land), C.sage); hatch(PP(land), 580, 980, 400, .6, 5, C.ink, .9, .5); iP(land.slice(-4).concat([land[0]]), false, C.ink, 2.2);
  X.restore();
  X.beginPath(); for (let k = 0; k <= 120; k++) { const x = -60 + k * 17, y = yAt(x); X.lineTo(x + jit(.8), y + jit(.8)); } stroke(C.ink, 3, 1);
  X.beginPath(); for (let k = 0; k <= 120; k++) { const x = -60 + k * 17, y = yAt(x); X.lineTo(x + jit(1.6), y + jit(1.6)); } stroke(C.ink, 1.5, .5);
  // where it breaks through: cracks, then the hole, then the pencil rising out of the sea
  const bx = 1340, by = yAt(bx), nx = (bx - gx) / R, ny = (by - gy) / R, ang = Math.atan2(ny, nx) + Math.PI / 2;
  const crack = eo(seg(p, .02, .2)), h = 620 * eo(seg(p, .18, .72)), burst = seg(p, .17, .24);
  X.beginPath(); for (let k = 0; k < 10; k++) { const an = k / 10 * TAU + .3, L = (60 + (k % 3) * 40) * crack; X.moveTo(bx + Math.cos(an) * 40 * burst, by + Math.sin(an) * 10 * burst); X.lineTo(bx + Math.cos(an) * (50 + L), by + Math.sin(an) * (12 + L) * .26); } stroke(C.ink, 2, .9 * crack);
  if (burst > 0) { const hl = PE(bx, by, 84 * burst, 22 * burst, ang); fillP(hl, '#2b3a40'); iE(bx, by, 84 * burst, 22 * burst, ang, C.ink, 2.2); }
  if (p > .2) for (let i = 0; i < 4; i++) { const ph = ((T * 1.1 + i / 4) % 1); iE(bx, by + 6, 110 + ph * 300, 26 + ph * 70, ang, C.orange, 2, (1 - ph) * .85, false); }
  if (p > .18 && p < .5) { const k = seg(p, .18, .5); for (let i = 0; i < 9; i++) { const r2 = M32(i * 5 + 1), dx = (r2() - .5) * 2, sx = bx + dx * (60 + 260 * k), sy = by - 10 - Math.sin(k * Math.PI) * (90 + r2() * 140) + k * 40; fillP(PE(sx, sy, 5, 7), C.cream, 1 - k); iE(sx, sy, 5, 7, 0, C.ink, 1, .7 * (1 - k), false); } }
  if (h > 0) {
    X.save(); const outside = new Path2D(); outside.rect(-W, -H, 3 * W, 3 * H); outside.addPath(disc); X.clip(outside, 'evenodd');
    X.translate(bx, by); X.rotate(ang);
    const wv = 70, cone = 220, gr = 66, tipY = -h, sTop = Math.min(40, tipY + cone);
    if (sTop < 40) { const sh = PP([[-wv, 40], [wv, 40], [wv, sTop], [-wv, sTop]]); fillP(sh, C.ochre); shade(sh, 0, sTop / 2, 400, [-22, 0], 1.45, 6); for (const fx of [-24, 24]) iline(fx, 40, fx, sTop, C.ink, 1.6, .8, false); }
    const cn = PP([[-wv, sTop], [wv, sTop], [0, tipY]]); fillP(cn, C.tan); hatch(cn, 0, tipY + cone / 2, cone, 1.57, 5, C.ink, .8, .4, [-14, 0]);
    X.beginPath(); for (let k = 0; k <= 6; k++) { const x = -wv + k * wv / 3; X.lineTo(x, sTop - (k % 2 ? 22 : 0)); } stroke(C.ink, 1.6, .9);
    const gw = wv * gr / cone; fillP(PP([[-gw, tipY + gr], [gw, tipY + gr], [0, tipY]]), '#3b3530');
    iP([[-wv, 40], [-wv, sTop], [0, tipY], [wv, sTop], [wv, 40]], false, C.ink, 2.8);
    X.restore();
    if (h > 560) { const tip = [bx + nx * h, by + ny * h]; for (let i = 0; i < 3; i++) gc(tip[0], tip[1], 26 + i * 18 + ((FD * 4) % 18), C.orange, .8, 2); }
  }
  // the near lip of the hole, in front of the pencil
  if (burst > 0) { iE(bx, by, 92 * burst, 26 * burst, ang, C.ink, 2.4, 1, true, 1, .1, Math.PI - .1); X.beginPath(); for (let k = 0; k < 7; k++) { const an = .3 + k * .42, x = bx + Math.cos(an) * 92 * burst, y = by + Math.sin(an) * 26 * burst; X.moveTo(x, y); X.lineTo(x + Math.cos(an) * 14, y + 8); } stroke(C.cream, 2.2, .9); }
  if (h > 400) a_punch(1270, 520, 'THE OTHER SIDE', C.brick, .95 * seg(h, 400, 560), 30, 'right');
  // him at the antipode, standing square to the curve, under his cloud
  { const hx = 600, hy = yAt(hx), tilt = Math.asin((hx - gx) / R); X.save(); X.translate(hx, hy); X.rotate(tilt);
    traveller(0, 0, 1.1, { look: 1, mouth: sing(T), case: false }); suitcase(-110, -68, .7); cloud(0, -525, .55, { rain: true }); X.restore();
    if (p > .17 && p < .3) { X.beginPath(); for (let i = 0; i < 3; i++) { X.moveTo(hx + 70, hy - 360 + i * 30); X.lineTo(hx + 110 + i * 8, hy - 370 + i * 30); } stroke(C.ink, 2, .8); } }
  consL([[0, yAt(960), W, yAt(960)], [bx, 0, bx, H], [600, 0, 600, H]]);
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
  star(home[0], home[1], 6, C.white, 1); a_punch(home[0] - 74, home[1] + 64, 'HOME · BLUES 100%', C.white, .95, 28, 'right');
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
  a_mute(); // draft 11: full colour belongs to the screens
} };

// ---------- 68.8 the sun in a shell: he holds a conch to his ear; inside it, a small sun is roaring ----------
SU.a_shell = { mode: 'ill', f(q, p, a, T) {
  stripes('#f0ddb6', '#e8cb94', 140, -.62, 0, C.orange);
  cam(lerp(940, 980, p), 540, lerp(1.04, 1.12, eo(p)));
  const sea = PR(-200, 760, W + 400, 400); fillP(sea, C.teal); hatch(sea, 960, 900, 1400, .05, 7, C.ink, .9, .5); iline(-200, 760, W + 200, 760, C.ink, 2.2);
  X.beginPath(); for (let i = 0; i < 40; i++) { const wx = (i * 71 + T * 40) % (W + 200) - 100, wy = 780 + (i * 31) % 240; X.moveTo(wx, wy); X.quadraticCurveTo(wx + 22, wy - 8, wx + 44, wy); } stroke(C.cream, 2, .8);
  // the real sun, low and quiet, far off
  const rs = PE(1600, 640, 70, 70); fillP(rs, C.ochre, .9); hatch(rs, 1600, 640, 70, .8, 5, C.ink, .9, .45, [-14, -14]); iE(1600, 640, 70, 70, 0, C.ink, 2); a_punch(1600, 552, 'MUTE', C.ink, .85, 30, 'center');
  // him, big: head and shoulders
  const s = 3.0, x = 760, y = 420 + 306 * s, A = [2.0, 2.2];
  traveller(x, y, s, { look: .2, armR: A, case: false, mouth: 0, handTo: [62, -278] }); // his hand under the shell
  const hand = arm(26, -262, A[0], A[1])[2], hx = x + hand[0] * s, hy = y + hand[1] * s;
  // the shell, pressed to his ear, seen from its back so the spiral shows (Robin on draft 8: the opening-to-camera conch
  // with the sun inside read as a giant eyeball, and a wedge conch read as a crab claw). A logarithmic spiral, each
  // turn .45 of the last, ribbed between the whorls, a brown band along each whorl; its opening (the ray at angle
  // pi from the centre) is against his ear. The sun is heard, not seen: light at the lip, short rays off the shell.
  const pl = Math.max(sing(T), .32 * Math.abs(Math.sin(T * 7.4))), ex = x + 36 * s, ey = y - 300 * s, SR = 96, sb = Math.log(1 / .45) / TAU;
  const scx = ex + SR * .7, scy = ey - 6, rr0 = (th) => SR * Math.exp(sb * (th - Math.PI)), spt = (th, f = 1) => [scx + Math.cos(th) * rr0(th) * f, scy + Math.sin(th) * rr0(th) * f * .92];
  for (let i = 0; i < 4; i++) { const rr = 30 + ((FD * 5 + i * 26) % 100); gc(ex + 4, ey, rr, i % 2 ? C.orange : C.teal, cl(1 - rr / 140) * (.35 + pl * .6), 2 + pl * 1.4, null, 1.9, 4.4); }
  X.beginPath(); for (let i = 0; i < 11; i++) { const an = -1.5 + i * .3, r1 = SR + 18, r2 = SR + 34 + pl * 30 + (i % 3) * 10; X.moveTo(scx + Math.cos(an) * r1, scy + Math.sin(an) * r1); X.lineTo(scx + Math.cos(an) * r2, scy + Math.sin(an) * r2); } stroke(C.orange, 1.5 + pl * 1.5, .9);
  const outer = []; for (let th = Math.PI - TAU; th <= Math.PI + 1e-6; th += .08) outer.push(spt(th)); const shellP = PP(outer.concat([spt(Math.PI - TAU)]));
  fillP(shellP, '#f1d8bc'); shade(shellP, scx, scy, SR * 1.1, [14, 16], .8, 4.5);
  X.save(); X.clip(shellP);
  X.beginPath(); for (let th = Math.PI - 3 * TAU; th <= Math.PI; th += .06) { const q = spt(th, .78); th === Math.PI - 3 * TAU ? X.moveTo(q[0], q[1]) : X.lineTo(q[0], q[1]); } stroke('#c98a5a', 5, .8);
  X.beginPath(); for (let th = Math.PI - 3 * TAU; th <= Math.PI; th += .2) { const [a0, a1] = spt(th - TAU), [b0, b1] = spt(th); X.moveTo(a0, a1); X.lineTo(b0, b1); } stroke(C.ink, 1.3, .55);
  X.restore();
  X.beginPath(); for (let th = Math.PI - 3.4 * TAU; th <= Math.PI; th += .05) { const q = spt(th); th === Math.PI - 3.4 * TAU ? X.moveTo(q[0], q[1]) : X.lineTo(q[0], q[1]); } stroke(C.ink, 2.4, 1);
  X.beginPath(); { const [a0, a1] = spt(Math.PI - TAU), [b0, b1] = spt(Math.PI); X.moveTo(a0, a1); X.lineTo(b0, b1); } stroke(C.ink, 2.6, 1);
  // (the opening is edge-on against his ear, so it is only the closing ink line; the sound rings carry the glow)
  
  cloud(x - 380, 160, .8, { rain: true });
  consL([[0, 760, W, 760], [scx, 0, scx, H]]); consC([[scx, scy, SR * 1.6]]);
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
  a_coil((t) => [lerp(ex + 20, px - 100, t), lerp(ey + 50, top + 230, t) + Math.sin(t * Math.PI) * 120], 34, 11); // draft 11: a coil, not a zigzag
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
  lab(1290, 330, 'CALLED PARTY', C.white, .9, 15); lab(1290, 358, 'THE AGENT', C.lav, .9, 18, 'left', 'alphabetic', 'bold'); a_punch(1290, 404, 'LOCATION: NOT AT DESK', C.mag, .95, 28);
  gl(1500, 418, 1880, 640, C.mag, .5, 1, [4, 6]);
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
  const pr = p > .45, hbx = px + 120, hby = 404; const hb = PE(hbx, hby - (pr ? 2 : 8), 24, 10); fillP(PR(hbx - 40, hby - 4, 80, 16), C.ink); fillP(hb, C.brick); iE(hbx, hby - (pr ? 2 : 8), 24, 10, 0, C.ink, 2); a_punch(hbx + 40, hby - 112, 'HOLD', C.brick, .95, 32, 'center');
  if (pr) { for (let i = 0; i < 3; i++) gc(hbx, hby, 30 + i * 24 + ((FD * 5) % 24), C.orange, .8, 2); const [ix, iy] = ins[0]; for (let i = 0; i < 10; i++) { const t2 = cl((p - .45) * 2.2 - i * .06); if (t2 <= 0) continue; const [nx, ny] = a_wireAt(ix, iy, -300, iy + 60, 40, t2); a_noteGlyph(nx, ny - 14, 1.2, C.teal); } }
  // birds on the wire
  for (const [bx, by] of [[1290, 735], [1420, 745], [1560, 752]]) bird(bx, by - 30, .35, flap() * .5);
  consL([[0, 560, W, 560], [px, 0, px, H], [0, ay, W, ay]]);
} };

// ---------- 112.2 help me quick: he runs off along a sea causeway still holding the receiver; the cord stretches back to the box ----------
// draft 6: off the prairie (the poles were the third time in 26 s); legs on walkPh, scroll matched to the stride
SU.a_rushRoad = { mode: 'ill', f(q, p, a, T) {
  const sp = 300, off = T * sp, hz = 560, wp = walkPh() * .5; // draft 11: legs on twos at walkPh()*.5, the deck scrolls to match the stride
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
  // he leans forward into the pull of the cord; the bob of his stride rides on the same phase as his legs
  const lean = .13, bob = -Math.abs(Math.sin(wp)) * 6, rot = (lx, ly) => [tx + lx * Math.cos(lean) - ly * Math.sin(lean), ty + bob + lx * Math.sin(lean) + ly * Math.cos(lean)];
  const [ex, ey] = rot(30 * ts, -300 * ts);
  // the suitcase hangs from his far hand and swings on his stride, behind him
  const aL = [-.15 - Math.sin(wp) * .45, .15], hl = arm(-26, -262, aL[0], aL[1])[2], [cx2, cy2] = rot(hl[0] * ts, hl[1] * ts);
  X.save(); X.translate(cx2, cy2); X.rotate(-lean * .5 - Math.sin(wp) * .2); suitcase(0, 0, .9); X.restore();
  X.save(); X.translate(tx, ty + bob); X.rotate(lean);
  traveller(0, 0, ts, { legs: wp, look: 1, mouth: sing(T), phone: 'handset', armL: aL, case: false });
  X.restore();
  a_coil((t) => [lerp(ex, fx, t), lerp(ey + 40, fy - 180 * fs * 2, t) + Math.sin(t * Math.PI) * 60], 46, (t) => 10 * (1 - t) + 2);
  for (let i = 0; i < 3; i++) gc(ex + 10, ey + 10, 40 + i * 30 + ((FD * 6) % 30), C.orange, .85, 2, null, -1.1, .7); // it is still ringing at her end
  
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
  a_withPunch({ 'VISIT THE SUN': 44 }, () => poster(560, 40, 800, 1000, 'palm')); // draft 11: the punchline label, phone-legible
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
  a_mute(); // draft 11: full colour belongs to the screens
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
  gl(750, 268, 1160, 268, C.lav, .6, 1); a_punch(955, 306, 'SUN · VOLUME', C.mag, .95, 30, 'center');
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
  // Robin 2026-10-15: URGENT must land on "help me quick". With a.hitT the drop is timed to the word (seconds), and the
  // shadow of the stamp grows over the town while he sings "Travel agent" first.
  const H0 = a.hitT, down = H0 ? T >= H0 : false, hit = H0 ? 2 : .34, shake = H0 ? (T >= H0 && T < H0 + .4 ? 1 : 0) : (p > hit && p < hit + .12 ? 1 : 0), INK2 = '#5e1c19';
  stripes(C.paper, '#e6d9b8', 140, -.62, 0, C.tan); cam(960 + jit(14 * shake), 540 + jit(14 * shake), 1);
  const hz = 700;
  for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) { const w2 = 150 + ((i * 37 + row * 11) % 60), x = -60 + i * 230 + row * 70, hh = 140 + ((i * 53 + row * 29) % 120), y = 420 + row * 120; const b = PR(x, y - hh, w2, hh + 40); fillP(b, [C.brick, C.tan, C.sage, C.ochre, C.rose][(i + row) % 5]); shade(b, x + w2 / 2, y - hh / 2, hh, [w2 * .25, 0], .9, 5); iBox(x, y - hh, w2, hh + 40, C.ink, 2); const rf = PP([[x - 10, y - hh], [x + w2 / 2, y - hh - 60], [x + w2 + 10, y - hh]]); fillP(rf, '#7a4a2a'); hatch(rf, x + w2 / 2, y - hh - 30, w2, .4, 4, C.ink, .9, .55); iP([[x - 10, y - hh], [x + w2 / 2, y - hh - 60], [x + w2 + 10, y - hh]], true, C.ink, 2); for (let k = 0; k < 2; k++) { const wn = PR(x + 20 + k * (w2 / 2), y - hh + 30, 30, 40); fillP(wn, C.cream); iBox(x + 20 + k * (w2 / 2), y - hh + 30, 30, 40, C.ink, 1.4); } }
  const g = PR(-200, hz + 140, W + 400, 500); fillP(g, '#b9a98a'); hatch(g, 960, hz + 300, 1400, .15, 9, C.ink, .8, .35); iline(-200, hz + 140, W + 200, hz + 140, C.ink, 2.6);
  traveller(330, 1040, .9, { look: 1, mouth: sing(T) }); cloud(330, 620, .5, { rain: true }); kioskMini(1600, 1000, .55);
  if (H0 && !down) { const u = eo(seg(T, H0 - 2.6, H0)); fillP(PE(1000, 600, 120 + 300 * u, 40 + 110 * u, -.12), C.ink, .06 + .22 * u); } // the stamp's shadow
  if (H0 ? down : p > hit) { X.save(); X.translate(1000, 560); X.rotate(-.12); const kn = [[-350, -70], [350, -78], [356, 72], [-344, 80]]; fillP(PP(kn), C.cream, .92); iP(kn, true, INK2, 2, .7, false, 2); X.restore(); stampMark(1000, 560, 380, a.mark || 'URGENT', INK2, -.12, .95); }
  // draft 11: a rubber stamp, not a plank: red rubber face under a chamfered wooden mount, a short neck, a round knob
  const sy = H0 ? (down ? lerp(430, -700, eo(seg(T, H0 + .1, H0 + .6))) : lerp(-700, 430, Math.pow(seg(T, H0 - .55, H0), 2))) : (p < hit ? lerp(-700, 430, eo(p / hit)) : lerp(430, -700, eo((p - hit - .12) / .5))), sx = 1000;
  if (sy > -680) {
    const rb = PR(sx - 370, sy + 96, 740, 34); fillP(rb, '#b8432f'); hatch(rb, sx, sy + 113, 760, 0, 5, C.ink, .8, .45); iBox(sx - 370, sy + 96, 740, 34, C.ink, 2.6);
    X.beginPath(); for (let x = sx - 340; x < sx + 340; x += 46) { X.moveTo(x, sy + 104); X.lineTo(x + 26, sy + 122); } stroke('#7a2a1e', 2, .7);
    const mt = [[sx - 380, sy + 96], [sx + 380, sy + 96], [sx + 380, sy + 30], [sx + 330, sy], [sx - 330, sy], [sx - 380, sy + 30]], mp = PP(mt); fillP(mp, '#8a5530'); shade(mp, sx, sy + 48, 420, [60, -10], .9, 6); iP(dens(mt, 40, true), true, C.ink, 3); iline(sx - 380, sy + 30, sx + 380, sy + 30, C.ink, 1.6, .7, false);
    const nk = PP([[sx - 60, sy], [sx + 60, sy], [sx + 44, sy - 150], [sx - 44, sy - 150]]); fillP(nk, '#a5703f'); shade(nk, sx, sy - 75, 160, [16, 0], .9, 5); iP([[sx - 60, sy], [sx + 60, sy], [sx + 44, sy - 150], [sx - 44, sy - 150]], true, C.ink, 3);
    const kb = PE(sx, sy - 220, 120, 86); fillP(kb, '#6b3f22'); shade(kb, sx, sy - 220, 130, [26, -14], .7, 5); iE(sx, sy - 220, 120, 86, 0, C.ink, 3); hatch(PE(sx - 40, sy - 250, 40, 22), sx - 40, sy - 250, 40, -.5, 9, C.cream, 3, .5);
  }
  if (shake) for (let i = 0; i < 4; i++) gc(1000, 600, 400 + i * 70 + (p - hit) * 900, C.orange, .8, 3, null, Math.PI, TAU);
  consL([[0, hz + 140, W, hz + 140], [1000, 0, 1000, H]]);
} };

// 109.95 SCH ticket: the note sits inside the stub, under the band
SU.a_sTicket = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.1, 1, eo(p)));
  lattice(960, 540, 70, 10, C.lav, .06); ticket(960, 540, 2, -.05, { sch: 1, col: C.lav, to: a.to || 'AWAY' });
  X.save(); X.translate(960, 540); X.rotate(-.05); star(430, -140, 5, C.mag, 1); a_punch(430, -86, a.note || 'RETURN: INCLUDED', C.mag, .95, 28, 'center'); X.restore();
  bracket(400, 860, 1520, 860, C.cyan, .8, '1 WAY');
  screen(); schFrame('05', 'TICKET', 'CLASS: ECONOMY');
} };

// ---------- issue 120: turned away everywhere (73.7–90.8) ----------
// A spring rises once, settles, and stays put. Absolute song time makes random seeks safe.
function a_signRise(dt) {
  if (dt <= 0) return 0;
  return dt >= .75 ? 1 : 1 - Math.exp(-7 * dt) * Math.cos(12 * dt);
}
function a_noCarsSign(x, ground, rise, s = 1) {
  if (rise <= 0) return;
  X.save(); X.beginPath(); X.rect(x - 170 * s, ground - 650 * s, 340 * s, 650 * s); X.clip();
  const y = ground - 440 * s * rise, r = 112 * s;
  const post = PR(x - 9 * s, y, 18 * s, ground - y); fillP(post, C.tan);
  hatch(post, x, (y + ground) / 2, 500 * s, .8, 5, C.ink, 1, .5); iBox(x - 9 * s, y, 18 * s, ground - y, C.ink, 2);
  fillP(PE(x, y, r, r), C.cream); iE(x, y, r, r, 0, C.brick, 13 * s);
  car(x, y + 25 * s, .64 * s); iline(x - 73 * s, y + 75 * s, x + 73 * s, y - 75 * s, C.brick, 13 * s, 1, false);
  X.restore();
}
function a_carDriver(x, y, s, hatLift = 0) {
  car(x, y, s);
  X.save(); X.translate(x, y); X.scale(s, s);
  X.save(); X.clip(PP([[-40, -52], [-20, -82], [46, -82], [64, -52]]));
  traveller(7, 48, .4, { sit: 1, case: false, look: 1, hat: false, handTo: [55, -245] }); X.restore();
  X.save(); X.translate(9, -84 - hatLift); a_fedora(.4); X.restore();
  X.restore();
}
// draft 11: the door is hinged at the A-pillar (its front edge, below the windscreen) and swings out toward us; it
// no longer hangs to the ground. The doorway behind it shows the dark cabin.
function a_carDoorway(x, y, s, amount) {
  if (amount <= 0) return;
  X.save(); X.translate(x, y); X.scale(s, s);
  const dw = PP([[-16, -50], [60, -50], [60, -13], [-16, -13]]); fillP(dw, '#3b2a22', cl(amount * 2)); iP([[-16, -50], [60, -50], [60, -13], [-16, -13]], true, C.ink, 1.2, cl(amount * 2), false);
  X.restore();
}
function a_openCarDoor(x, y, s, amount) {
  if (amount <= 0) return;
  X.save(); X.translate(x, y); X.scale(s, s);
  const ang = amount * 1.2, hx = 62, fx = hx - 78 * Math.cos(ang), dz = 5 * Math.sin(ang), ext = 7 * Math.sin(ang);
  const top = [[hx, -82], [fx, -82 + dz - ext]], mid = [[hx, -50], [fx, -50 + dz]], bot = [[hx, -12], [fx, -12 + dz + ext]];
  const panel = PP([mid[0], mid[1], bot[1], bot[0]]); fillP(panel, C.ochre); hatch(panel, (hx + fx) / 2, -31, 60, .6, 3, C.ink, .7, .45); iP([mid[0], mid[1], bot[1], bot[0]], true, C.ink, 1.4);
  const glass = PP([top[0], top[1], mid[1], mid[0]]); fillP(glass, '#cfe0da', .55); iP([top[0], top[1], mid[1], mid[0]], true, C.ink, 1.3);
  iline(fx + 4, -38 + dz, fx + 13, -38 + dz, C.ink, 1.8, 1, false);
  X.restore();
}
SU.a_noCarVillage = { mode: 'ill', f(q, p, a, T) {
  const dt = T - 73.7, stop = cl(dt / 2.48), cx = lerp(-270, 660, 1 - Math.pow(1 - stop, 2)), cy = 860;
  stripes('#e9e2cc', '#d8dcc6', 150, -.62, 0, C.sage); cam(960, 540, 1);
  const hill = PP([[980, 790], [1100, 630], [1330, 520], [1480, 490], [1640, 550], [1880, 720], [2050, 820]]);
  fillP(hill, C.sage); hatch(hill, 1500, 700, 740, .4, 12, C.ink, .8, .35); iP([[980,790],[1100,630],[1330,520],[1480,490],[1640,550],[1880,720]], false, C.ink, 2);
  // A frontal, balanced village; no previously used beach or wheat-field composition.
  for (const [hx, hh, col] of [[1190,190,C.rose],[1350,220,C.ochre],[1540,220,C.ochre],[1700,190,C.rose]]) {
    const hp = PR(hx, 630-hh, 135, hh); fillP(hp,col); hatch(hp,hx+67,630-hh/2,220,.7,7,C.ink,.8,.4); iBox(hx,630-hh,135,hh,C.ink,2);
    fillP(PP([[hx-10,630-hh],[hx+67,565-hh],[hx+145,630-hh]]),C.brick); iP([[hx-10,630-hh],[hx+67,565-hh],[hx+145,630-hh]],true,C.ink,2);
    for(const wx of [hx+25,hx+85]) { fillP(PR(wx,660-hh,25,45),C.cream); iBox(wx,660-hh,25,45,C.ink,1.5); }
    fillP(PR(hx+52,570,30,60),C.teal);
  }
  fillP(PR(1460,310,50,320),C.cream); iBox(1460,310,50,320,C.ink,2);
  fillP(PP([[1448,310],[1485,210],[1522,310]]),C.brick); iP([[1448,310],[1485,210],[1522,310]],true,C.ink,2);
  const road=PR(-50,895,2020,200); fillP(road,'#938675'); hatch(road,960,990,1200,.1,8,C.ink,.8,.4); iline(0,895,W,895,C.ink,3);
  for(let x=0;x<W;x+=200) fillP(PR(x,1010,95,8),C.cream);
  const hit=Math.max(0,T-76.18), bounce=T>=76.18?Math.exp(-hit*5)*Math.sin(hit*13):0;
  a_noCarsSign(1040,895,a_signRise(T-76.18),.85);
  // Nose dip precedes the delayed hat/cloud response.
  X.save(); X.translate(cx,cy); X.rotate(.045*bounce); a_carDriver(0,0,2.15,Math.max(0,Math.sin(hit*8))*Math.exp(-hit*3)*20); X.restore();
  cloud(cx-100+70*Math.sin(cl((T-76.18)/.7)*Math.PI),410,.62,{rain:true});
  if(T>75.7) for(let i=0;i<3;i++) iline(cx-290-i*50,895+i*8,cx-180-i*20,895+i*8,C.ink,2,.75,false);
  consL([[0,895,W,895],[1040,160,1040,1040]]);
} };
SU.a_sNoCar = { mode: 'sch', f(q,p,a,T) {
  schBG(); cam(960,540,1); graticule(960,540,1800,950,80,C.lav,.1);
  car(550,600,2.8,{sch:true,col:C.white}); bracket(245,760,870,760,C.cyan,.9,'VEHICLE 01');
  lab(1230,265,'PERMITTED',C.white,1,34,'center');
  const places=['BEACH','ISLAND','VILLAGE','MOUNTAIN','MOON'];
  places.forEach((name,i)=>{const y=370+i*95; lab(1060,y,name,C.white,.95,31);
    const u=cl((T-78.3-.13-i*.22)/.16); if(u>0) gl(1040,y-12,1040+390*u,y-12,C.mag,1,4);
  });
  screen(); schFrame('08A','ACCESS','NO ENTRY');
} };
SU.a_carMoon = { mode: 'ill', f(q,p,a,T) {
  const dt=T-80.13;
  stripes('#59616d','#68717a',180,-.62,0,C.cream); cam(960,540,1);
  for(let i=0;i<28;i++){const r=M32(960+i),x=80+r()*1760,y=90+r()*500,sz=3+r()*4;iline(x-sz,y,x+sz,y,C.cream,1.7,.8,false);iline(x,y-sz,x,y+sz,C.cream,1.7,.8,false);}
  // Earth is a globe with continents, never an opening with a pupil-like centre.
  const earth=PE(1600,235,130,130); fillP(earth,C.sky); X.save(); X.clip(earth);
  fillP(PP([[1470,150],[1540,120],[1580,170],[1560,210],[1620,240],[1580,300],[1530,285],[1510,230]]),C.sage);
  hatch(earth,1600,235,150,.5,8,C.ink,.8,.35); X.restore(); iE(1600,235,130,130,0,C.ink,2);
  const ground=PP([[-100,860],[350,815],[850,845],[1360,780],[2020,820],[2020,1150],[-100,1150]]);
  fillP(ground,'#d2c9b4'); hatch(ground,960,940,1250,.12,9,C.ink,.9,.4); iP([[-100,860],[350,815],[850,845],[1360,780],[2020,820]],false,C.ink,2);
  for(const [x,y,rx,ry] of [[220,970,130,26],[1080,920,150,32],[1680,1000,200,38]]) {
    const cr=PE(x,y,rx,ry);fillP(cr,'#aaa596');hatch(cr,x,y,rx,0,5,C.ink,1,.6);iE(x,y,rx,ry,0,C.ink,2);
  }
  a_noCarsSign(830,860,a_signRise(T-80.4),.68);
  const exit=cl((dt-.85)/.65), hopTime=Math.max(0,dt-1.5), hop=hopTime/1.05, hx=hop-Math.floor(hop);
  const tx=exit<1?lerp(522.6,890,exit):890+hopTime*250, ty=exit<1?lerp(941.4,1015,exit):1015-110*4*hx*(1-hx);
  const dOpen=eo(cl((dt-.55)/.5));
  if(exit===0) { a_carDriver(510,855,1.8); a_carDoorway(510,855,1.8,dOpen); } else {
    car(510,855,1.8); a_carDoorway(510,855,1.8,dOpen);
    traveller(tx,ty,.72,{case:true,look:1,sit:exit<.45,legs:exit<1?exit*Math.PI:hx*Math.PI*2});
    for(let i=0;i<Math.floor(hop)+1;i++) { const fx=890+i*262; if(fx<tx){fillP(PE(fx,1023,17,5,.2),C.ink,.5);fillP(PE(fx+33,1033,17,5,.2),C.ink,.5);} }
  }
  a_openCarDoor(510,855,1.8,dOpen);
  { const clx=lerp(490,tx-20,cl(exit)), cly=exit===0?450:ty-430; a_cloudHalo(clx,cly,.58,'#dfe2e3',.92); cloud(clx,cly,.58,{rain:true}); } // draft 11: a pale rim so it reads on the slate sky
  consL([[0,1045,W,1045]]);
} };
SU.a_sFootpath = { mode:'sch', f(q,p,a,T) {
  schBG(); cam(960,540,1); graticule(960,540,2000,1200,80,C.lav,.12);
  const land=PP(COAST); stip(land,900,560,800,3500,C.lav,.35,1.3); iP(COAST,true,C.lav,1.6,.8,false,.4);
  const A=[400,730],B=[660,240],Cc=[1080,850],D=[1500,420],u=cl((T-84.9)/4.5);
  path(bzPts(A,B,Cc,D,0,1),C.lav,2,.5,[4,9]); path(bzPts(A,B,Cc,D,0,u),C.cyan,4,1);
  for(let i=0;i<24;i++){const v=i/24;if(v>u)break;const [x,y]=bz(A,B,Cc,D,v);fillP(PE(x,y+(i%2?10:-10),7,3,-.3),C.white,.9);}
  car(350,800,.65,{sch:true,col:C.white});gl(265,820,430,690,C.mag,1,4);a_punch(350,876,'CAR LEFT HERE',C.white,1,28,'center');
  iBox(1435,285,130,200,C.white,3);lab(1500,325,'TEL',C.white,1,24,'center');
  gl(1470,355,1470,425,C.cyan,1,7);gc(1485,355,16,C.cyan,1,4);gc(1485,425,16,C.cyan,1,4);
  lab(1500,545,'ON FOOT',C.white,1,27,'center');
  const ring=T-89.7;if(ring>=0&&ring<=.8)for(let i=0;i<3;i++){const r=90+i*36+ring*70;gc(1500,385,r,C.mag,1-ring/.95,3,null,-.7,.7);gc(1500,385,r,C.mag,1-ring/.95,3,null,Math.PI-.7,Math.PI+.7);}
  screen();schFrame('08B','FOOTPATH','NEXT: TELEPHONE');
} };

// ---------- draft 11: shared set-ups in this act, with their punchline label at phone size (lab() swapped locally) ----------
SU.a_cloudWalk = a_punchSU('cloudWalk', { 'ALWAYS 1 M': 30 });
SU.a_sTraveller = a_punchSU('sTraveller', { 'BLUES · 100%': 28 });
SU.a_sNews = a_punchSU('sNews', { 'BLUES: 100%': 30 });
SU.a_sGlobe = a_punchSU('sGlobe', { 'ANTIPODE': 28 });

// ---------- the cut list: 0 - 116.6 ----------
var CUTS_A = [
  // intro, wordless: the street, the shop, in through the door
  [0.0, 'a_street', {}],
  [4.02, 'a_cloudWalk', {}],
  [7.57, 'a_sTraveller', {}],
  [10.82, 'a_puddle', {}],
  [13.56, 'shop', { walk: [-120, 1300], byP: 1, ring: 1 }],
  [17.6, 'a_posterCU', {}],
  [22.55, 'a_doorBell', {}],
  [25.29, 'sPlan', {}],
  [27.59, 'a_interior', {}],
  // "give me the news": the old-fashioned office
  [31.1, 'a_desk', {}],
  [35.04, 'a_newspaper', {}],
  [37.04, 'a_sNews', {}],
  [39.78, 'a_rolodex', {}],
  [42.38, 'sBoard', {}],
  // "farthest away from these blues": the globe, the antipode
  [44.7, 'globeSpin', { fast: 1, cloud: 1, route: 1, fy: 600, fz: .9 }], // draft 11: reframed so the push no longer clips the stand's base
  [47.07, 'a_sGlobe', { anti: 1, title: 'FARTHEST POINT', sub: 'FROM THESE BLUES' }],
  [50.69, 'a_pin', {}],
  [53.85, 'a_sPin', {}],
  // from here: one impossible thing per scene. "hear the sun out loud"
  [59.0, 'a_beach', {}],
  [61.7, 'a_sunHorn', {}],
  [66.28, 'a_sSound', {}],
  [68.70, 'a_shell', {}],
  // Cars are not allowed: turned away everywhere, then onward on foot.
  [73.7, 'a_noCarVillage', {}],
  [78.3, 'a_sNoCar', {}],
  [80.13, 'a_carMoon', {}],
  [84.66, 'a_sFootpath', {}],
  // chorus 1: a roadside payphone; she answers somewhere else
  [90.8, 'a_payphone', {}],
  [93.69, 'a_sWire', {}],
  [95.48, 'a_poleDesk', {}],
  [100.0, 'a_sHold', {}],
  // "help me quick"
  [104.2, 'a_stampWorld', { mark: 'URGENT', hitT: 107.8 }], // URGENT lands on "help" (onset 107.8), reads through "help me"
  [108.83, 'mvu_dialFace', {}],                              // on "quick" (108.83); its dial spins on "quick" (109.0)
  [109.95, 'a_sTicket', { note: 'DEPARTS: NOW' }],
  [112.25, 'a_rushRoad', {}],
];

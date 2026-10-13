// Act C (188.7-276.0): the world won't hold still. Rooms stretch, corridors loop, floors float apart and
// every space opens into another one. Verse: the diner man (hatless, plum coat) taken into treatment, staged
// quietly, the system acting on him. Chorus 2: the traveller on hold in a corridor that loops back on itself,
// her desk floating out of reach. Then the movie: heroes are make-believe, the crooks reach out of the screen.
'use strict';

// ---------- cast helpers ----------
const C_PLUM2 = '#6e4c5d', C_WHITE = '#f4f1e8';
function c_man(x, y, s, o = {}) { traveller(x, y, s, { hat: false, coat: C.plum, sleeve: C_PLUM2, ...o }); }
function c_ord(x, y, s, o = {}) { traveller(x, y, s, { hat: false, coat: C_WHITE, sleeve: '#ece6d6', ...o }); }
function c_hat(x, y, s, rot = 0) { // a lone fedora, brim centre at (x,y)
  X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s); const k = 1 / s;
  const hb = PE(0, 0, 46, 8); fillP(hb, '#3d2a1f'); iE(0, 0, 46, 8, 0, C.ink, 2 * k);
  const cr = [[-26, 0], [-22, -34], [0, -28], [22, -34], [26, 0]], crp = PP(cr); fillP(crp, '#4b3426'); hatch(crp, 0, -15, 34, .7, 4 * k, C.ink, .9 * k, .7, [6, -4]); iP(cr, true, C.ink, 2 * k);
  X.beginPath(); wP([[-25, -8], [25, -8]], false, .4 * k); stroke(C.ochre, 4 * k, .9); X.restore();
}
function c_bottle(x, y, s) { // wine bottle, base at (x,y)
  X.save(); X.translate(x, y); X.scale(s, s); const k = 1 / s;
  const pts = [[-34, 0], [-34, -170], [-14, -210], [-14, -270], [14, -270], [14, -210], [34, -170], [34, 0]], bt = PP(pts);
  fillP(bt, '#3e5a3a'); shade(bt, 0, -130, 160, [10, 0], .9, 4 * k); hatch(bt, 0, -130, 160, .9, 12 * k, C.cream, 2 * k, .25); iP(dens(pts, 20, true), true, C.ink, 2.2 * k);
  const lb = PR(-34, -120, 68, 70); fillP(lb, C.cream); iBox(-34, -120, 68, 70, C.ink, 1.6 * k); X.restore();
}
// one-point corridor drawn inside a rectangle; o.ph slides the doors toward camera (the corridor keeps arriving)
function c_corr(x, y, w, h, o = {}) {
  const vx = x + w / 2, vy = y + h * .44, bw = w * (o.back || .14), bh = h * .2, n = o.n || 6, ph = o.ph || 0;
  const bx0 = vx - bw / 2, bx1 = vx + bw / 2, by0 = vy - bh * .6, by1 = vy + bh * .4;
  X.save(); X.clip(PR(x, y, w, h)); fillP(PR(x, y, w, h), o.wall || '#ddd6c2');
  const fl = PP([[x, y + h], [x + w, y + h], [bx1, by1], [bx0, by1]]); fillP(fl, o.floor || '#c9c2a8');
  X.beginPath(); for (let i = -6; i <= 6; i++) { X.moveTo(vx + i * bw / 12, by1); X.lineTo(vx + i * w / 6, y + h); } for (let k = 0; k < 9; k++) { const t = Math.pow((k + ph) / 9, 2.2), yy = lerp(by1, y + h, t); X.moveTo(x, yy); X.lineTo(x + w, yy); } stroke(C.ink, 1, .35);
  const lw = PP([[x, y], [bx0, by0], [bx0, by1], [x, y + h]]), rw = PP([[x + w, y], [bx1, by0], [bx1, by1], [x + w, y + h]]);
  hatch(lw, x + w * .25, y + h / 2, w, .9, 7, C.ink, .8, .32); hatch(rw, x + w * .75, y + h / 2, w, -.9, 6, C.ink, .8, .45);
  fillP(PP([[x, y], [x + w, y], [bx1, by0], [bx0, by0]]), o.ceil || '#efe9d8');
  fillP(PR(bx0, by0, bw, by1 - by0), '#efe9d8'); iBox(bx0, by0, bw, by1 - by0, C.ink, 1.4);
  for (let k = n - 1; k >= 0; k--) {
    const t0 = Math.pow((k + ph) / n, 2), t1 = Math.pow((k + ph + .42) / n, 2);
    for (const sd of [-1, 1]) {
      const fx = sd < 0 ? bx0 : bx1, nx = sd < 0 ? x : x + w, e0 = lerp(fx, nx, t0), e1 = lerp(fx, nx, t1);
      const tp0 = lerp(lerp(by0, y, t0), lerp(by1, y + h, t0), .3), tp1 = lerp(lerp(by0, y, t1), lerp(by1, y + h, t1), .3), b0 = lerp(by1, y + h, t0), b1 = lerp(by1, y + h, t1);
      const dq = [[e0, tp0], [e1, tp1], [e1, b1], [e0, b0]]; fillP(PP(dq), o.door || C.sage); if (t1 > .04) { hatch(PP(dq), (e0 + e1) / 2, (tp0 + b0) / 2, 200, 1.4, 5, C.ink, .8, .45, [sd * 8, 0]); iP(dq, true, C.ink, lerp(.8, 2.2, t1)); }
    }
    const lt = Math.pow((k + ph + .2) / n, 2), lw2 = lerp(bw * .3, w * .3, lt), ly = lerp(by0, y, lt); fillP(PR(vx - lw2 / 2, ly + 2, lw2, 4 + lw2 * .03), C.cream);
  }
  X.beginPath(); for (const [a1, b1] of [[[x, y], [bx0, by0]], [[x + w, y], [bx1, by0]], [[x, y + h], [bx0, by1]], [[x + w, y + h], [bx1, by1]]]) wl(a1[0], a1[1], b1[0], b1[1], 1); stroke(C.ink, 1.6, .9);
  X.restore();
}

// ---------- 188.7 "they took him to hospitals": the diner floor stretches and carries him into a corridor ----------
SU.c_dinerLift = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e0cfd6', 120, -.62, 0, C.plum); cam(960, 560, lerp(1, 1.05, eo(p)));
  const st = eo(seg(p, .05, .95));
  const wall = PR(-200, 80, 1340, 600); hatch(wall, 470, 380, 900, 0, 46, C.ink, 1, .14); hatch(wall, 470, 380, 900, Math.PI / 2, 46, C.ink, 1, .14);
  // the far wall opens: a doorway that widens into a hospital corridor
  const dx0 = lerp(1300, 1140, st), dw = lerp(260, 720, st), dy0 = 150, dh = 530;
  fillP(PR(dx0 - 30, dy0 - 30, dw + 60, dh + 30), '#cdb8bf'); c_corr(dx0, dy0, dw, dh, { wall: '#dfe6dd', door: C.sage, ph: (T * .6) % 1 });
  iBox(dx0, dy0, dw, dh, C.ink, 3); iBox(dx0 - 30, dy0 - 30, dw + 60, dh + 30, C.ink, 2, .7, false);
  // floor: checks stretch to the right, so the room gets longer under him
  const fy = 680, fl = PR(-200, fy, W + 400, H); fillP(fl, '#e6d9cc');
  const xs = []; for (let i = 0; i < 40; i++) { const xx = -200 + i * 90 * (i * 90 > 900 ? lerp(1, 2.6, st) : 1); xs.push(xx); if (xx > W + 300) break; }
  for (let r = 0; r < 6; r++) { const y0 = fy + r * 70; for (let i = 0; i + 1 < xs.length; i++) if ((i + r) % 2 === 0) { const tl = PR(xs[i], y0, xs[i + 1] - xs[i], 70); fillP(tl, C.brick, .55); hatch(tl, xs[i] + 40, y0 + 35, Math.max(80, xs[i + 1] - xs[i]), .8, 6, C.ink, .8, .45); } }
  X.beginPath(); for (const xx of xs) { X.moveTo(xx, fy); X.lineTo(xx, H + 60); } for (let r = 0; r <= 6; r++) { X.moveTo(-200, fy + r * 70); X.lineTo(W + 200, fy + r * 70); } stroke(C.ink, 1.2, .5);
  iline(-200, fy, W + 200, fy, C.ink, 2.6);
  // his table stays behind: cloth, plate, the wine bottle
  const tb = PP([[80, 640], [600, 640], [660, 740], [20, 740]]); fillP(tb, C.cream); hatch(tb, 340, 690, 400, 0, 34, C.brick, 6, .35); hatch(tb, 340, 690, 400, Math.PI / 2, 34, C.brick, 6, .35); iP(dens([[80, 640], [600, 640], [660, 740], [20, 740]], 30, true), true);
  const cl2 = PR(20, 740, 640, 200); fillP(cl2, C.cream); hatch(cl2, 340, 840, 400, 0, 34, C.brick, 6, .3); shade(cl2, 340, 840, 400, [0, -40], .3, 6); iBox(20, 740, 640, 200, C.ink, 2.4);
  fillP(PE(330, 680, 100, 24), '#ffffff'); iE(330, 680, 100, 24, 0, C.ink, 2); iE(330, 680, 66, 15, 0, C.ink, 1.2, .7, false);
  c_bottle(520, 670, .8);
  // he rides the stretching floor away from the table, an orderly at each side, a hand at his shoulder
  const mx = lerp(840, 1260, st);
  chair(mx - 40, 980, 1); c_man(mx, 980, 1.3, { sit: 1, look: .3, armR: [.5, .8], armL: [.4, .6] });
  c_ord(mx - 230, 1010, 1.3, { look: .6, legs: walkPh(), armR: [1.45, .25] });
  c_ord(mx + 250, 1010, 1.3, { look: .8, legs: walkPh() + 2, armL: [.3, -.2] });
  path([[700, 1050], [mx - 60, 1050]], C.orange, 2.4, .9, [12, 8]); X.beginPath(); X.moveTo(mx - 76, 1040); X.lineTo(mx - 58, 1050); X.lineTo(mx - 76, 1060); stroke(C.orange, 2.4, .9);
  for (let i = 0; i < 3; i++) gc(dx0 + dw / 2, dy0 + dh * .44, 40 + i * 30 + ((FD * 5) % 30), C.teal, .5, 1.6);
  consL([[0, fy, W, fy], [dx0 + dw / 2, 0, dx0 + dw / 2, H], [340, 0, 340, H]]);
} };

// ---------- 195.1 "against his will": they walk him on; his shadow stays sitting at the diner door ----------
SU.c_shadowStay = { mode: 'ill', f(q, p, a, T) {
  stripes('#e4e8dc', '#d8ddcc', 130, -.62, 0, C.sage); cam(960, 540, 1);
  const wtop = 110, wb = 780, sp = lerp(330, 520, eo(p)), off = 360;
  const wall = PR(-200, wtop, W + 400, wb - wtop); fillP(wall, '#dfe6dd'); hatch(wall, 960, 450, 1200, -.9, 9, C.ink, .8, .2);
  const lw = PR(-200, 590, W + 400, wb - 590); fillP(lw, '#b9c7a8'); hatch(lw, 960, 690, 1200, .9, 6, C.ink, .8, .4); iline(-200, 590, W + 200, 590, C.ink, 2.2);
  iline(-200, wtop, W + 200, wtop, C.ink, 2.4); iline(-200, wb, W + 200, wb, C.ink, 2.6);
  const fl = PR(-200, wb, W + 400, 400); fillP(fl, '#cbbf9f'); X.beginPath(); for (let i = 0; i < 6; i++) { const y = wb + 20 + i * i * 9; X.moveTo(-200, y); X.lineTo(W + 200, y); } stroke(C.ink, 1, .4);
  // doors drift apart: the corridor grows while they walk it
  for (let i = 0; i < 9; i++) { const dx = off + i * sp; if (dx > W + 100) break; const dp = PR(dx, 330, 150, wb - 330); fillP(dp, C.sage); shade(dp, dx + 75, 560, 240, [-20, 0], .9, 5); iBox(dx, 330, 150, wb - 330, C.ink, 2.4);
    const pn = PR(dx + 40, 370, 70, 90); fillP(pn, '#cfe0da'); hatch(pn, dx + 75, 415, 60, -.9, 12, C.cream, 3, .5); iBox(dx + 40, 370, 70, 90, C.ink, 1.6); fillP(PE(dx + 128, 560, 7, 7), C.ochre); iE(dx + 128, 560, 7, 7, 0, C.ink, 1.4);
    lab(dx + 75, 318, 'W3·' + (i + 1), C.ink, .7, 13, 'center'); fillP(PR(dx + 30, wtop + 4, 90, 12), C.cream); iBox(dx + 30, wtop + 4, 90, 12, C.ink, 1.2); }
  // the diner door at the far left: checks in its porthole
  const dd = PR(40, 300, 200, wb - 300); fillP(dd, '#c98478'); shade(dd, 140, 540, 260, [16, 0], .9, 5); iBox(40, 300, 200, wb - 300, C.ink, 2.6);
  const pw = PE(140, 400, 56, 56); fillP(pw, C.cream); X.save(); X.clip(pw); hatch(pw, 140, 400, 60, 0, 14, C.brick, 5, .5); hatch(pw, 140, 400, 60, Math.PI / 2, 14, C.brick, 5, .5); X.restore(); iE(140, 400, 56, 56, 0, C.ink, 2.6); lab(140, 500, 'DINER', C.ink, .85, 16, 'center', 'alphabetic', 'bold');
  // the group walks right
  const gx = lerp(1060, 1340, p);
  // shadow: a long band from his heels back along the floor, rising into a seated figure at the diner door
  const sh = new Path2D(); sh.addPath(PP([[gx - 30, 1006], [gx + 20, 994], [470, 792], [300, 800]]));
  sh.addPath(PE(330, 470, 30, 36)); sh.addPath(PP([[316, 500], [346, 500], [348, 512], [390, 530], [404, 640], [480, 652], [486, 790], [462, 790], [452, 690], [300, 690], [292, 560], [300, 528], [316, 512]]));
  sh.addPath(PP([[280, 560], [296, 560], [292, 790], [278, 790]])); sh.addPath(PP([[280, 690], [420, 690], [420, 704], [280, 704]]));
  X.save(); X.globalCompositeOperation = 'multiply'; fillP(sh, '#a89c86', .95); X.restore();
  hatch(sh, 600, 700, 900, .75, 3.4, C.ink, 1, .8); hatch(sh, 600, 700, 900, -.6, 5, C.ink, .9, .6);
  iE(330, 470, 30, 36, 0, C.ink, 1.4, .6, false);
  c_ord(gx - 200, 1000, 1.2, { look: .7, legs: walkPh(), armR: [1.35, .3] });
  c_man(gx, 1004, 1.2, { look: -.8, legs: walkPh() + 1.5, armL: [.1, 0], armR: [-.15, .1] });
  c_ord(gx + 200, 1000, 1.2, { look: .9, legs: walkPh() + 3, armL: [-.2, .1] });
  X.setLineDash([3, 10]); X.beginPath(); X.moveTo(gx - 40, 600); X.quadraticCurveTo((gx + 360) / 2, 300, 380, 440); stroke(C.orange, 3, .9); X.setLineDash([]);
  gc(340, 560, 120, C.orange, .7, 2);
  consL([[0, wb, W, wb], [0, 590, W, 590], [300, 0, 300, H]]);
} };

// ---------- 203.3 "now they fry his brain": his profile, calm; a pad on a coiled cord comes down; the window won't stay put ----------
SU.c_profile = { mode: 'ill', f(q, p, a, T) {
  stripes('#e5e0cf', '#d8d4c0', 110, -.62, 0, C.sage); cam(900, 500, lerp(1, 1.06, eo(p)));
  const wx = lerp(130, 20, eo(p)), wy = lerp(150, 120, p), ww = 440, wh = 420, wp = PR(wx, wy, ww, wh);
  fillP(wp, '#cfe0da'); X.save(); X.clip(wp);
  const hz = wy + wh * .62, sl = T * 160; const hill = []; for (let x = wx - 20; x <= wx + ww + 20; x += 20) hill.push([x, hz - 40 - Math.sin((x + sl) * .012) * 30 - Math.sin((x + sl) * .031) * 12]); hill.push([wx + ww + 20, wy + wh], [wx - 20, wy + wh]);
  fillP(PP(hill), C.sage); hatch(PP(hill), wx + ww / 2, hz, ww, .6, 6, C.ink, .8, .45); iP(hill.slice(0, -2), false, C.ink, 1.6, .9, false);
  for (let i = 0; i < 4; i++) { const px = wx + ((i * 170 - sl * 1.8) % 680 + 680) % 680 - 100; iline(px, hz - 150, px, wy + wh, C.ink, 3.4); iline(px - 26, hz - 136, px + 26, hz - 136, C.ink, 2.2); }
  X.beginPath(); for (let i = 0; i < 4; i++) { const px = wx + ((i * 170 - sl * 1.8) % 680 + 680) % 680 - 100; X.moveTo(px - 26, hz - 136); X.quadraticCurveTo(px + 60, hz - 110, px + 144, hz - 136); } stroke(C.ink, 1, .7);
  hatch(wp, wx + ww / 2, wy + wh / 2, 400, -.95, 22, C.cream, 4, .35); X.restore();
  iBox(wx, wy, ww, wh, C.ink, 4); iline(wx + ww / 2, wy, wx + ww / 2, wy + wh, C.ink, 4); iline(wx, wy + wh / 2, wx + ww, wy + wh / 2, C.ink, 4);
  gl(wx + ww + 30, wy + wh / 2, wx + ww + 120, wy + wh / 2, C.orange, .8, 2.4, [8, 6]); lab(wx + ww + 130, wy + wh / 2 + 5, '←', C.orange, .9, 22);
  // shoulders: the plum coat
  const sh = [[620, 1120], [660, 840], [780, 790], [1080, 790], [1180, 850], [1230, 1120]]; fillP(PP(sh), C.plum); shade(PP(sh), 920, 960, 360, [40, -20], .9, 5.5); iP(dens(sh, 30), false, C.ink, 2.6);
  iP([[870, 790], [930, 900], [1000, 800]], false, C.ink, 2); iP([[930, 900], [920, 1100]], false, C.ink, 1.8);
  // head: the same profile the treatment diagram uses
  const hp = PROFILE.map(([x, y]) => [900 + x * 1.6, 520 + y * 1.6]), hpp = PP(hp);
  fillP(hpp, '#efd9b9'); shade(hpp, 900, 520, 320, [-34, -10], .7, 5.5);
  X.save(); X.clip(hpp); const hr = PP([[560, 60], [1080, 60], [1070, 240], [990, 230], [930, 300], [860, 330], [800, 460], [560, 620]]); fillP(hr, '#4a3a2e'); hatch(hr, 820, 330, 360, .5, 3.6, C.ink, 1, .8); hatch(hr, 820, 330, 360, -.9, 5, C.ink, .9, .5); X.restore();
  iP(dens(hp, 26, true), true, C.ink, 3);
  iE(884, 430, 26, 40, 0, C.ink, 2.4); X.beginPath(); X.arc(888, 432, 14, -1.4, 1.8); stroke(C.ink, 1.8, .9); fillP(PE(890, 432, 26, 40), '#efd9b9', 0);
  fillP(PE(1062, 340, 7, 6), C.ink); iline(1040, 316, 1084, 312, C.ink, 2.4, 1, false); iline(1050, 352, 1076, 350, C.ink, 1.2, .7, false);
  // the pad comes down on its coiled cord (no harm shown: it just arrives)
  const d = eo(seg(p, .05, .9)), px2 = 972, py2 = lerp(-40, 372, d) + Math.sin(T * 2) * 4;
  X.beginPath(); for (let i = 0; i <= 60; i++) { const t = i / 60, yy = lerp(-120, py2 - 30, t), xx = lerp(1060, px2, t) + Math.sin(t * 40) * 14; i ? X.lineTo(xx, yy) : X.moveTo(xx, yy); } stroke(C.ink, 2.4, 1);
  const pd = PE(px2, py2, 32, 24); fillP(pd, '#9aa0a8'); hatch(pd, px2, py2, 34, .6, 4, C.ink, .9, .7, [6, -6]); iE(px2, py2, 32, 24, 0, C.ink, 2.4); iE(px2, py2, 20, 14, 0, C.ink, 1.2, .8, false);
  if (d > .6) for (let i = 0; i < 3; i++) gc(px2, py2, 44 + i * 22 + ((FD * 4) % 22), C.orange, .6 * (d - .5) * 2, 1.6, null, -.4, Math.PI + .4);
  consL([[0, 520, W, 520], [900, 0, 900, H]]); consC([[890, 330, 240]]);
} };

// pills overlay: his hand, palm out, pushes the bottle back; the pills roll off the edge of the table
function c_refuse(q, p, T) {
  const r = M32(17); for (let i = 0; i < 5; i++) { const px = 1000 + r() * 400 + eo(p) * (600 + i * 90), py = 780 + r() * 140, an = r() * 3 + p * 8, pp = PE(px, py, 30, 13, an); fillP(pp, i % 2 ? C.cream : C.rose); hatch(pp, px, py, 32, .5, 3.5, C.ink, .9, .6, [4, -6]); iE(px, py, 30, 13, an, C.ink, 1.8); gl(px - 40, py, px - 90, py, C.orange, .7, 2, [6, 6]); }
  const hx = lerp(1060, 820, eo(seg(p, 0, .6))), hy = 540;
  limb([[W + 120, 640], [1500, 600], [hx + 70, hy + 10]], 34, {}, 1, C_PLUM2);
  const palm = PP([[hx + 70, hy - 40], [hx + 70, hy + 60], [hx - 10, hy + 70], [hx - 30, hy + 20], [hx - 20, hy - 60], [hx + 20, hy - 80]]); fillP(palm, '#efd9b9'); shade(palm, hx + 20, hy, 90, [-10, -10], .6, 4); iP(dens([[hx + 70, hy - 40], [hx + 70, hy + 60], [hx - 10, hy + 70], [hx - 30, hy + 20], [hx - 20, hy - 60], [hx + 20, hy - 80]], 16, true), true, C.ink, 2.6);
  for (let i = 0; i < 4; i++) { const fy = hy - 60 + i * 26; const f = PE(hx - 30, fy, 26, 10, -.15); fillP(f, '#efd9b9'); iE(hx - 30, fy, 26, 10, -.15, C.ink, 1.8); }
  for (let i = 0; i < 3; i++) gc(hx - 60, hy, 60 + i * 26, C.teal, .7, 1.8, null, Math.PI * .6, Math.PI * 1.4);
}

// ---------- 211.3 SCH: the dosage, a calendar that never runs out ----------
SU.c_sDose = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.06, 1, eo(p)));
  const bx = 640; X.strokeStyle = C.white; X.lineWidth = 1.4; X.globalAlpha = .9; X.strokeRect(bx - 110, 360, 220, 360); X.strokeRect(bx - 124, 300, 248, 70); X.globalAlpha = 1;
  X.beginPath(); for (let i = 0; i < 26; i++) { X.moveTo(bx - 120 + i * 9.5, 304); X.lineTo(bx - 120 + i * 9.5, 366); } stroke(C.lav, 1, .5);
  stip(PR(bx - 110, 470, 220, 250), bx, 600, 200, 900, C.lav, .45, 1.3); X.strokeStyle = C.lav; X.strokeRect(bx - 90, 440, 180, 180);
  lab(bx, 486, 'TAKE', C.white, .9, 18, 'center', 'middle', 'bold'); lab(bx, 520, '3 × DAILY', C.lav, .8, 13, 'center', 'middle');
  bracket(bx - 160, 300, bx - 160, 720, C.cyan, .8, 'H 420'); bracket(bx - 124, 760, bx + 124, 760, C.cyan, .7, 'Ø 248');
  gl(-50, 720, 860, 720, C.lav, .5, 1.2);
  const g0 = 900, g1 = 1860, cw = 130, gy = 260, ch = 150, sc = (q * 6 + p * 2) * cw, d0 = Math.floor(sc / cw);
  X.save(); X.beginPath(); X.rect(g0, 180, g1 - g0, 760); X.clip();
  for (let j = -1; j < 9; j++) { const day = d0 + j, cx = g0 + j * cw - (sc % cw); X.strokeStyle = C.lav; X.globalAlpha = .5; X.strokeRect(cx, gy, cw, ch * 3); X.globalAlpha = 1; lab(cx + cw / 2, gy - 18, 'DAY ' + (day + 1), C.lav, .7, 11, 'center');
    for (let r = 0; r < 3; r++) { const py = gy + ch * r + ch / 2, px = cx + cw / 2, now = j === 4, refused = now && r === 1; gl(cx, gy + ch * r, cx + cw, gy + ch * r, C.lav, .3);
      iE(px, py, 32, 13, .3, refused ? C.mag : C.cyan, 1.2, .9, false, .3); stip(PE(px, py, 32, 13, .3), px, py, 34, 60, refused ? C.mag : C.cyan, .7, 1.3);
      if (j < 4) { gl(px - 26, py + 20, px + 26, py - 20, C.cyan, .8, 1.4); } if (refused) { gc(px, py, 50, C.mag, .95, 1.6); lab(px, py + 72, 'REFUSED', C.mag, .95, 12, 'center', 'alphabetic', 'bold'); } } }
  X.restore();
  for (const [r, t] of [[0, 'MORN'], [1, 'NOON'], [2, 'NIGHT']]) lab(g0 - 14, gy + ch * r + ch / 2 + 4, t, C.lav, .7, 11, 'right');
  gl(1660, 840, 1840, 840, C.mag, .9, 1.6); lab(1850, 846, '∞', C.mag, .95, 22);
  lab(1000, 880, 'END DATE: NONE GIVEN', C.cyan, .85, 14);
  gl(bx + 124, 330, g0, gy, C.lav, .25, 1, [3, 6]); gl(bx + 110, 720, g0, gy + ch * 3, C.lav, .25, 1, [3, 6]);
  screen(); schFrame('31', 'DOSAGE', '3 × DAILY · NO END DATE');
} };

// ---------- 213.7 the ward window opens onto the diner, which opens onto the road, which opens onto sky ----------
function c_nest(x, y, w, h, lvl, T, p) {
  if (w < 14 || lvl > 3) return; X.save(); X.clip(PR(x, y, w, h)); const k = w / 600;
  if (lvl === 0) { // the diner: checked wall, his table, his empty chair
    fillP(PR(x, y, w, h), C.paper); hatch(PR(x, y, w, h), x + w / 2, y + h / 2, w, 0, 30 * k, C.ink, 1, .14); hatch(PR(x, y, w, h), x + w / 2, y + h / 2, w, Math.PI / 2, 30 * k, C.ink, 1, .14);
    const fl = PR(x, y + h * .7, w, h * .3); fillP(fl, '#e6d9cc'); hatch(fl, x + w / 2, y + h * .85, w, .1, 6 * k, C.ink, .8, .35); iline(x, y + h * .7, x + w, y + h * .7, C.ink, 1.8);
    const tbx = x + w * .62, tby = y + h * .66; const tb = PR(tbx - w * .2, tby, w * .4, h * .2); fillP(tb, C.cream); hatch(tb, tbx, tby + h * .1, w * .3, 0, 14 * k, C.brick, 4 * k, .4); hatch(tb, tbx, tby + h * .1, w * .3, Math.PI / 2, 14 * k, C.brick, 4 * k, .4); iBox(tbx - w * .2, tby, w * .4, h * .2, C.ink, 1.8);
    c_bottle(tbx + w * .1, tby, .55 * k); chair(tbx - w * .28, y + h * .94, .62 * k);
  } else if (lvl === 1) { // the road and the payphone
    fillP(PR(x, y, w, h), '#ecd9a8'); hatch(PR(x, y, w, h), x + w / 2, y + h / 2, w, -.62, 10 * k, C.ochre, 1, .4);
    const rd = PP([[x + w * .45, y + h * .55], [x + w * .55, y + h * .55], [x + w, y + h], [x, y + h]]); fillP(rd, '#9b8a6e'); hatch(rd, x + w / 2, y + h * .8, w, .2, 6 * k, C.ink, .8, .5); iline(x, y + h * .55, x + w, y + h * .55, C.ink, 1.6);
    const pb = PR(x + w * .12, y + h * .25, w * .12, h * .4); fillP(pb, '#dfe6dd'); iBox(x + w * .12, y + h * .25, w * .12, h * .4, C.brick, 3 * Math.max(.4, k)); fillP(PR(x + w * .1, y + h * .2, w * .16, h * .06), C.brick);
  } else { fillP(PR(x, y, w, h), '#cfe0da'); hatch(PR(x, y, w, h), x + w / 2, y + h / 2, w, -.95, 16 * k, C.cream, 3, .4); if (lvl === 2) plane(x + w * (.2 + p * .6), y + h * .4, .5 * k, -.1); }
  // its own window, drifting a different way each level
  const iw = w * lerp(.42, .3, p), ih = h * lerp(.42, .3, p), ix = x + w * (.08 + .05 * Math.sin(T * .9 + lvl * 2)), iy = y + h * (.08 + .04 * Math.cos(T * .7 + lvl));
  fillP(PR(ix - 4, iy - 4, iw + 8, ih + 8), '#7a4a2a'); c_nest(ix, iy, iw, ih, lvl + 1, T, p); iBox(ix, iy, iw, ih, C.ink, Math.max(1, 3 * k));
  X.restore();
}
SU.c_windowRoom = { mode: 'ill', f(q, p, a, T) {
  stripes('#e9e2cf', '#dcd3bd', 110, -.62, 0, C.tan); cam(960, 560, lerp(1, 1.05, eo(p)));
  const fl = PR(-200, 890, W + 400, 400); fillP(fl, '#c9c2a8'); hatch(fl, 960, 1000, 1300, .08, 7, C.ink, .8, .4); iline(-200, 890, W + 200, 890, C.ink, 2.6);
  // the window, which won't stay the size of a window
  const ww = lerp(560, 700, eo(p)), wh = lerp(520, 600, eo(p)), wx = 1150 - (ww - 560) * .3, wy = 150 - (wh - 520) * .5;
  fillP(PR(wx - 26, wy - 26, ww + 52, wh + 52), '#d6c8a6'); iBox(wx - 26, wy - 26, ww + 52, wh + 52, C.ink, 2.4);
  c_nest(wx, wy, ww, wh, 0, T, p); iBox(wx, wy, ww, wh, C.ink, 4);
  X.beginPath(); for (let i = 1; i < 6; i++) { X.moveTo(wx + i * ww / 6, wy); X.lineTo(wx + i * ww / 6, wy + wh); } stroke(C.ink, 3, .9); // ward bars
  fillP(PR(wx - 40, wy + wh + 6, ww + 80, 26), '#bfae88'); iBox(wx - 40, wy + wh + 6, ww + 80, 26, C.ink, 2.2);
  // iron bed, the man sitting on its edge, looking out
  const mat = PR(160, 660, 720, 80); fillP(mat, C.cream); hatch(mat, 520, 700, 400, .3, 7, C.ink, .8, .3);
  const bl = PP([[160, 660], [560, 650], [600, 760], [160, 770]]); fillP(bl, C.teal); shade(bl, 380, 710, 260, [20, -10], .9, 5); iP(dens([[160, 660], [560, 650], [600, 760], [160, 770]], 30, true), true);
  iBox(160, 660, 720, 80, C.ink, 2.2); for (const lx of [170, 870]) iline(lx, 740, lx, 890, C.ink, 5); iline(160, 520, 160, 890, C.ink, 6); iline(160, 520, 160 + 2, 660, C.ink, 4);
  X.beginPath(); for (let i = 0; i < 5; i++) { X.moveTo(180 + i * 30, 540); X.lineTo(180 + i * 30, 660); } X.moveTo(160, 540); X.lineTo(320, 540); stroke(C.ink, 3, .9);
  const pil = PE(270, 640, 80, 26); fillP(pil, '#ffffff'); hatch(pil, 270, 640, 80, .4, 6, C.ink, .8, .4, [0, -8]); iE(270, 640, 80, 26, 0, C.ink, 2);
  c_man(760, 890, 1.25, { sit: 1, look: .8, armR: [.4, .9], armL: [.3, .7] });
  X.setLineDash([3, 10]); X.beginPath(); X.moveTo(790, 500); X.quadraticCurveTo(980, 380, wx + 40, wy + wh * .5); stroke(C.orange, 3, .9); X.setLineDash([]);
  gc(wx + ww * .3, wy + wh * .3, lerp(60, 220, p), C.orange, .6, 1.8, [6, 8]);
  consL([[0, 890, W, 890], [wx, 0, wx, H], [0, wy + wh, W, wy + wh]]);
} };

// ---------- 220.5 chorus 2: on hold in a corridor that loops up, over and back (an upside-down him is on hold up top) ----------
const C_LOOP = { x0: -260, y: 930, cx: 1240, cy: 560, r: 370, ex: 2400 };
function c_loopPt(s) { // arc-length along the corridor floor -> [x, y, nx, ny] (n points into the corridor)
  const L1 = C_LOOP.cx - C_LOOP.x0, Lc = TAU * C_LOOP.r;
  if (s < L1) return [C_LOOP.x0 + s, C_LOOP.y, 0, -1];
  if (s < L1 + Lc) { const a = Math.PI / 2 - (s - L1) / C_LOOP.r, x = C_LOOP.cx + Math.cos(a) * C_LOOP.r, y = C_LOOP.cy + Math.sin(a) * C_LOOP.r; return [x, y, -Math.cos(a), -Math.sin(a)]; }
  return [C_LOOP.cx + (s - L1 - Lc), C_LOOP.y, 0, -1];
}
const C_LOOPLEN = (C_LOOP.cx - C_LOOP.x0) + TAU * C_LOOP.r + (C_LOOP.ex - C_LOOP.cx);
function c_holdMan(x, y, s, rot, T, flipLook) {
  X.save(); X.translate(x, y); X.rotate(rot);
  traveller(0, 0, s, { look: flipLook || 0, mouth: sing(T), armR: [2.75, -2.1], case: false });
  phoneBody(33 * s, -322 * s, .13 * s, -.3, (w, h) => appScreen(w, h, T, 'hold'));
  X.restore();
}
SU.c_corridorLoop = { mode: 'ill', f(q, p, a, T) {
  stripes('#ece4d2', '#e2d5c6', 130, -.62, 0, C.plum); cam(1000, 540, lerp(1, 1.05, eo(p)));
  const HT = 230, N = 260, segs = [];
  for (let i = 0; i <= N; i++) segs.push(c_loopPt(i / N * C_LOOPLEN));
  // the band, drawn in pieces so the loop can cross itself
  for (let i = 0; i < N; i++) { const [x1, y1, nx1, ny1] = segs[i], [x2, y2, nx2, ny2] = segs[i + 1]; const q4 = PP([[x1, y1], [x2, y2], [x2 + nx2 * HT, y2 + ny2 * HT], [x1 + nx1 * HT, y1 + ny1 * HT]]); fillP(q4, '#ddd6c2'); X.lineWidth = 1; X.strokeStyle = '#ddd6c2'; X.stroke(q4); }
  for (let i = 0; i < N; i += 2) { const [x1, y1, nx1, ny1] = segs[i]; X.beginPath(); X.moveTo(x1 + nx1 * 6, y1 + ny1 * 6); X.lineTo(x1 + nx1 * (HT - 6) + (i % 4 ? 4 : -4), y1 + ny1 * (HT - 6)); stroke(C.ink, .9, .35); }
  // doors and ceiling lamps slide along the corridor: it keeps moving although he stands still
  const sh = (T * 70) % 190;
  for (let s = sh; s < C_LOOPLEN - 70; s += 190) { const A = c_loopPt(s), B = c_loopPt(s + 70); const dq = [[A[0], A[1]], [B[0], B[1]], [B[0] + B[2] * 165, B[1] + B[3] * 165], [A[0] + A[2] * 165, A[1] + A[3] * 165]]; fillP(PP(dq), C.sage); hatch(PP(dq), (A[0] + B[0]) / 2, (A[1] + B[1]) / 2, 120, 1.2, 5, C.ink, .8, .5); iP(dq, true, C.ink, 2); const M = c_loopPt(s + 95); fillP(PE(M[0] + M[2] * (HT - 10), M[1] + M[3] * (HT - 10), 18, 6, Math.atan2(M[3], M[2]) + Math.PI / 2), C.cream); }
  iP(segs.map(([x, y]) => [x, y]), false, C.ink, 3); iP(segs.map(([x, y, nx, ny]) => [x + nx * HT, y + ny * HT]), false, C.ink, 2.4);
  fillP(PR(-400, C_LOOP.y, 3200, 400), '#c9c2a8'); hatch(PR(-400, C_LOOP.y, 3200, 400), 960, 1050, 1600, .1, 7, C.ink, .8, .4); iline(-400, C_LOOP.y, 2800, C_LOOP.y, C.ink, 3);
  // hold music runs round the loop
  for (let i = 0; i < 10; i++) { const s = ((T * 140 + i * C_LOOPLEN / 10) % C_LOOPLEN), [x, y, nx, ny] = c_loopPt(s); X.save(); X.translate(x + nx * 120, y + ny * 120); X.rotate(Math.atan2(ny, nx) + Math.PI / 2); fillP(PE(0, 0, 9, 7, -.4), C.teal); iline(8, 0, 8, -28, C.teal, 2, 1, false); X.restore(); }
  // him, on hold; and him again, upside down at the top of the loop
  const top = c_loopPt((C_LOOP.cx - C_LOOP.x0) + Math.PI * C_LOOP.r);
  c_holdMan(top[0], top[1], .42, Math.atan2(top[3], top[2]) + Math.PI / 2, T, .4);
  suitcase(250, 834, 1); c_holdMan(420, C_LOOP.y, 1.0, 0, T, 0);
  cloud(420, C_LOOP.y - 480, .62, { rain: true });
  path([[480, 600], [800, 560], [C_LOOP.cx - 60, C_LOOP.cy + C_LOOP.r - 120]], C.orange, 2, .7, [8, 8]);
  for (let i = 0; i < 3; i++) gc(C_LOOP.cx, C_LOOP.cy, C_LOOP.r + 60 + i * 30 + ((FD * 5) % 30), C.orange, .35, 1.6, [6, 10]);
  consL([[0, C_LOOP.y, W, C_LOOP.y], [C_LOOP.cx, 0, C_LOOP.cx, H]]); consC([[C_LOOP.cx, C_LOOP.cy, C_LOOP.r]]);
} };

// ---------- 223.4 SCH: the queue is a spiral; position 47 rides it outward ----------
SU.c_sQueue = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(1000, 540, lerp(1.05, 1, eo(p)));
  const cx = C_LOOP.cx, cy = C_LOOP.cy, rot = T * .5, sp = (th) => [cx + Math.cos(th + rot) * (30 + th * 24), cy + Math.sin(th + rot) * (30 + th * 24)];
  lattice(cx, cy, 64, 9, C.lav, .05); gc(cx, cy, C_LOOP.r, C.lav, .3, 1, [3, 6]); ticks(cx, cy, C_LOOP.r, 72, 6, C.lav, .4, 1, 6);
  const pts = []; for (let th = 0; th < 17; th += .05) pts.push(sp(th)); path(pts, C.cyan, 1.4, .8);
  for (let n = 1; n <= 52; n++) { const th = Math.sqrt(n) * 2.3; if (th > 17) break; const [x, y] = sp(th); gc(x, y, 6, C.lav, .7, 1); if (n % 5 === 0) lab(x + 10, y - 8, String(n), C.lav, .55, 10); }
  star(cx, cy, 6, C.white, .9); lab(cx + 18, cy + 30, 'AGENT', C.white, .85, 12);
  const th47 = Math.sqrt(47) * 2.3, [hx, hy] = sp(th47); star(hx, hy, 6, C.mag, 1); gc(hx, hy, 30, C.mag, .9, 1.4); lab(hx + 36, hy + 4, 'YOU · 47', C.mag, .95, 14, 'left', 'alphabetic', 'bold');
  gl(-60, C_LOOP.y, cx, C_LOOP.y, C.lav, .6, 1.4); gl(-60, C_LOOP.y - 230, cx - 120, C_LOOP.y - 230, C.lav, .4, 1, [4, 6]); lab(80, C_LOOP.y - 14, 'ENTRY', C.lav, .7, 12);
  star(420, C_LOOP.y - 160, 4, C.white, .8); gl(420, C_LOOP.y - 160, hx, hy, C.mag, .5, 1, [4, 6]);
  bracket(cx - C_LOOP.r, C_LOOP.y + 60, cx + C_LOOP.r, C_LOOP.y + 60, C.cyan, .7, 'R 370 · ONE LAP = NO PROGRESS');
  lab(160, 300, 'EST. WAIT', C.lav, .7, 13); lab(160, 350, '∞ MIN', C.cyan, .95, 34, 'left', 'alphabetic', 'bold');
  screen(); schFrame('32', 'THE QUEUE', 'YOUR CALL IS IMPORTANT TO US');
} };

// ---------- 228.2 "agent": the counter keeps lengthening; the bell and the agent slide away from his passport ----------
SU.c_bellFar = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#ead6a6', 120, -.62, 0, C.ochre); cam(960, 540, 1);
  const st = eo(p), vx = lerp(760, 250, st), vy = 470, NX = W + 140;
  const top = PP([[NX, 640], [NX, 520], [vx, vy - 6], [vx, vy]]); fillP(top, '#c08a50'); hatch(top, 1200, 560, 1000, -.08, 7, C.ink, .8, .35);
  const front = PP([[NX, 640], [NX, H + 60], [vx, vy + 10], [vx, vy]]); fillP(front, '#a5703f'); hatch(front, 1200, 760, 1100, .9, 6, C.ink, .9, .5, [0, -60]);
  X.beginPath(); for (let i = 1; i < 10; i++) { const t = Math.pow(i / 10, 1.8); X.moveTo(lerp(vx, NX, t), lerp(vy, 640, t)); X.lineTo(lerp(vx, NX, t), lerp(vy + 10, H + 60, t)); } stroke(C.ink, 1.6, .8);
  for (let i = 3; i < 10; i++) { const t = Math.pow((i + .5) / 10, 1.8), px = lerp(vx, NX, t), py = lerp(vy + 4, 760, t), s = t; if (s < .12) continue; const pl = PR(px - 70 * s, py, 140 * s, 30 * s); fillP(pl, C.cream); iBox(px - 70 * s, py, 140 * s, 30 * s, C.ink, 1.4); if (s > .3) lab(px, py + 21 * s, 'PLEASE WAIT', C.ink, .85, 13 * s, 'center'); }
  iP(dens([[NX, 640], [vx, vy]], 40), false, C.ink, 2.6); iP(dens([[NX, 520], [vx, vy - 6]], 40), false, C.ink, 2); iP(dens([[NX, H + 60], [vx, vy + 10]], 40), false, C.ink, 2.2);
  // her, very small at the far end
  const ft = .04, ax = lerp(vx, NX, ft), ay = lerp(vy - 3, 580, ft); agent(ax + 6, ay, .16, { look: .7 });
  // the bell rides away along the counter top
  const bt = lerp(.42, .1, st), bx = lerp(vx, NX, bt), by = lerp(vy - 3, 580, bt), bs = lerp(.3, 1, bt);
  X.save(); X.translate(bx, by); X.scale(bs, bs); const dome = new Path2D(); dome.ellipse(0, -10, 44, 40, 0, Math.PI, TAU); dome.closePath(); fillP(dome, C.ochre); hatch(dome, 0, -30, 46, .7, 4 / bs, C.ink, 1, .7, [-10, -6]); iE(0, -10, 44, 40, 0, C.ink, 2.4 / bs, 1, true, 1, Math.PI, TAU);
  fillP(PE(0, -6, 56, 10), '#6b4a2e'); iE(0, -6, 56, 10, 0, C.ink, 2 / bs); iline(0, -50, 0, -62, C.ink, 4 / bs); fillP(PE(0, -64, 10, 5), C.ink); X.restore();
  for (let i = 0; i < 3; i++) gc(bx, by - 30 * bs, (60 + i * 26) * bs + ((FD * 4) % 26), C.orange, .6, 1.8, null, Math.PI * 1.1, Math.PI * 1.9);
  // him, leaning in with his passport held out
  const tx = 1520, ty = 1070; traveller(tx, ty, 1.25, { look: -.9, mouth: sing(T), armR: [-1.9, .2], armL: [-.4, .3], case: false });
  const hx = tx - 106 * 1.25, hy = ty - 293 * 1.25; X.save(); X.translate(hx - 20, hy - 18); X.rotate(-.25); const pp = PR(-30, -40, 60, 80); fillP(pp, C.teal); hatch(pp, 0, 0, 50, .7, 4, C.ink, .8, .5, [6, -6]); iBox(-30, -40, 60, 80, C.ink, 2); iE(0, -6, 14, 14, 0, C.ochre, 2, 1, false); lab(0, 26, 'PASS', C.ochre, 1, 10, 'center', 'alphabetic', 'bold'); X.restore();
  cloud(tx, ty - 470 * 1.25, .7, { rain: true }); noteRain(tx - 110, ty - 470 * 1.25 + 60, 220, 120, 5);
  path([[hx - 60, hy - 30], [bx + 60 * bs, by - 30 * bs]], C.orange, 2, .8, [10, 8]); lab((hx + bx) / 2, Math.min(hy, by) - 60, 'REACH ' + Math.round(lerp(1.2, 9.8, st) * 10) / 10 + ' M', C.brick, .9, 15, 'center', 'alphabetic', 'bold');
  consL([[0, vy, W, vy], [vx, 0, vx, H], [vx, vy, 0, 0], [vx, vy, 0, H]]);
} };

// ---------- 234.1 "you gotta help me out": the corridor has come apart in the sky; her desk drifts off ----------
function c_slab(x, y, w, rot, o = {}) { // a floating piece of corridor: floor slab with earthy underside, a wall with a door
  X.save(); X.translate(x, y); X.rotate(rot);
  if (o.wall !== false) { const wp = PR(-w / 2, -o.wh, w, o.wh); fillP(wp, '#dfe6dd'); hatch(wp, 0, -o.wh / 2, w, -.9, 8, C.ink, .8, .3); iBox(-w / 2, -o.wh, w, o.wh, C.ink, 2.2);
    if (o.door !== false) { const dw = Math.min(w * .26, 110), dh = o.wh * .78, dx = o.dx ?? w * .22; const dp = PR(dx - dw / 2, -dh, dw, dh); fillP(dp, C.sage); shade(dp, dx, -dh / 2, dh, [-12, 0], .9, 5); iBox(dx - dw / 2, -dh, dw, dh, C.ink, 2); fillP(PE(dx + dw * .32, -dh * .45, 5, 5), C.ochre); } }
  const und = [[-w / 2, 0], [w / 2, 0], [w * .4, 50], [w * .15, 120], [-w * .1, 150], [-w * .32, 80]], up = PP(und); fillP(up, '#b9925f'); hatch(up, 0, 60, w * .6, .9, 5, C.ink, 1, .6, [0, -30]); iP(dens(und, 24, true), true, C.ink, 2.2);
  const tp = PR(-w / 2, -14, w, 14); fillP(tp, '#c9c2a8'); iBox(-w / 2, -14, w, 14, C.ink, 2);
  X.restore();
}
SU.c_holdSky = { mode: 'ill', f(q, p, a, T) {
  stripes('#efe3cf', '#e6d2c4', 150, -.62, T * 20, C.rose); cam(960, 540, lerp(1.04, 1, eo(p)));
  const sp = lerp(1, 1.5, eo(p)), bob = (i) => Math.sin(T * 1.1 + i * 1.7) * 14;
  for (let i = 0; i < 2; i++) cloud(((i * 900 + T * 50) % (W + 600)) - 300, 120 + i * 680, .6, {});
  c_slab(960 + (220 - 960) * sp * .9, 840 + bob(1), 380, -.12, { wh: 260 });
  c_slab(960 + (380 - 960) * sp, 260 + (sp - 1) * -120 + bob(2), 300, .18, { wh: 200, dx: -60 });
  c_slab(960 + (1500 - 960) * sp, 960 + bob(3), 320, .1, { wh: 230 });
  c_slab(960 + (700 - 960) * sp * 1.1, 120 + bob(4), 220, -.3, { wh: 140, door: false });
  // her desk on its own piece, further every second
  const dx = lerp(1520, 1790, eo(p)), dy = lerp(380, 300, eo(p)) + bob(5), ds = lerp(.5, .36, eo(p));
  c_slab(dx, dy, 420 * ds / .5, .04, { wall: false }); agent(dx, dy - 14, ds, { look: -.6, talk: Math.abs(Math.sin(T * 7)) * .8 }); desk(dx, dy - 14, 420, ds);
  fillP(PE(dx + 40 * ds, dy - 230 * ds, 10 * ds / .5, 20 * ds / .5, -.3), C.ink);
  // his piece: wall behind him, the floor under the hold-phone figure
  c_slab(960, 994, 620, 0, { wh: 420, dx: 210 });
  X.beginPath(); for (let i = 0; i <= 40; i++) { const t = i / 40, xx = lerp(1010, dx - 60, t), yy = lerp(680, dy - 120, t) - Math.sin(t * Math.PI) * 140 + Math.sin(t * 30 + T * 6) * 6; i ? X.lineTo(xx, yy) : X.moveTo(xx, yy); } X.setLineDash([10, 9]); stroke(C.orange, 2.2, .85); X.setLineDash([]);
  bracket(1100, 160, dx - 120, 160, C.brick, .8, Math.round(lerp(40, 95, eo(p))) + ' M AND RISING');
  consC([[960, 994, 700]]);
} };

// ---------- 239.3 "out": she throws him a lifebuoy; the rope runs out short of his hands ----------
SU.c_lifebuoy = { mode: 'ill', f(q, p, a, T) {
  stripes('#e6e0d0', '#d6dcc8', 140, -.62, -T * 25, C.sage); cam(960, 540, 1);
  for (let i = 0; i < 3; i++) cloud(((i * 700 - T * 40) % (W + 600) + W + 600) % (W + 600) - 300, 140 + i * 280, .55, {});
  const gap = eo(p), hx0 = 1500 + gap * 90, hy0 = 470 - gap * 50 + Math.sin(T * 1.2) * 10;
  c_slab(hx0, hy0, 620, -.04, { wall: false }); desk(hx0 + 40, hy0 - 14, 440, .75); agent(hx0 + 40, hy0 - 14, .75, { look: -1, point: 1, talk: .6 });
  c_slab(430, 930 + Math.sin(T * 1.3) * 8, 700, .03, { wall: false });
  traveller(430, 916, 1.15, { look: .8, mouth: sing(T), armR: [2.7, .2], armL: [3.0, -.1], case: false }); suitcase(640, 830, .8); cloud(430, 916 - 560, .62, { rain: true });
  // the throw: rope from her hand; the ring arcs out and hangs, swinging, short of him
  const hand = [hx0 + 40 - 80, hy0 - 14 - 145 * .75], fly = eo(seg(p, 0, .45)), swing = Math.sin(T * 3) * 26 * seg(p, .45, .7);
  const end = [lerp(hand[0], 820, fly) + swing, lerp(hand[1], 560, fly) - Math.sin(fly * Math.PI) * 160];
  X.beginPath(); X.moveTo(hand[0], hand[1]); X.quadraticCurveTo((hand[0] + end[0]) / 2, Math.min(hand[1], end[1]) - 40 * (1 - fly) + 40, end[0], end[1]); stroke(C.ink, 3, 1);
  X.beginPath(); X.moveTo(hand[0], hand[1]); X.quadraticCurveTo((hand[0] + end[0]) / 2, Math.min(hand[1], end[1]) - 40 * (1 - fly) + 40, end[0], end[1]); stroke(C.tan, 1.4, 1);
  X.save(); X.translate(end[0], end[1] + 70); X.rotate(Math.sin(T * 3) * .15);
  const ring = new Path2D(); ring.ellipse(0, 0, 76, 76, 0, 0, TAU); ring.ellipse(0, 0, 40, 40, 0, 0, TAU); fillP(ring, C.cream);
  X.save(); X.clip(ring, 'evenodd'); for (let i = 0; i < 4; i++) fillP(PP([[0, 0], [Math.cos(i * Math.PI / 2) * 120, Math.sin(i * Math.PI / 2) * 120], [Math.cos(i * Math.PI / 2 + .7) * 120, Math.sin(i * Math.PI / 2 + .7) * 120]]), C.orange); X.restore();
  X.save(); X.clip(ring, 'evenodd'); hatch(PR(-80, -80, 160, 160), 0, 0, 80, .7, 4, C.ink, .9, .55, [14, -14]); X.restore(); iE(0, 0, 76, 76, 0, C.ink, 2.6); iE(0, 0, 40, 40, 0, C.ink, 2.2); X.restore();
  bracket(end[0] - 40, end[1] + 160, 560, 560, C.brick, .85, 'SHORT BY ' + Math.round(lerp(4, 22, gap)) + ' FT');
  for (let i = 0; i < 3; i++) gc(end[0], end[1] + 70, 100 + i * 26 + ((FD * 5) % 26), C.orange, .5, 1.6);
  consL([[0, 930, W, 930], [hx0, 0, hx0, H]]);
} };

// ---------- 247.3 "I'm watching this movie": the rows keep multiplying and the screen keeps backing off ----------
function c_backView(x, y, s) { // him from behind in a seat: hat, back of head, shoulders
  X.save(); X.translate(x, y); X.scale(s, s); const k = 1 / s;
  const sh = [[-90, 0], [-80, -60], [-36, -84], [36, -84], [80, -60], [90, 0]]; fillP(PP(sh), C.teal); shade(PP(sh), 0, -40, 100, [16, -6], .9, 5 * k); iP(dens(sh, 20), false, C.ink, 2.4 * k);
  const hd = PE(0, -118, 30, 36); fillP(hd, '#efd9b9'); X.save(); X.clip(hd); fillP(PR(-40, -150, 80, 46), '#4a3a2e'); hatch(PR(-40, -150, 80, 46), 0, -128, 40, .3, 3 * k, C.ink, .9 * k, .7); X.restore(); iE(0, -118, 30, 36, 0, C.ink, 2.2 * k);
  for (const ex of [-31, 31]) { fillP(PE(ex, -114, 6, 11), '#efd9b9'); iE(ex, -114, 6, 11, 0, C.ink, 1.6 * k); }
  X.restore(); c_hat(x, y - 140 * s, s);
}
SU.c_seatsStretch = { mode: 'ill', f(q, p, a, T) {
  stripes('#dccbbf', '#cdb6a8', 140, -.62, 0, C.plum); cam(960, 540, 1);
  const zs = lerp(1, .5, eo(p)), sw = 860 * zs, sh = 470 * zs, sx = 960 - sw / 2, sy = 300 - sh / 2;
  fillP(PR(sx - 60 * zs, sy - 50 * zs, 60 * zs, sh + 100 * zs), '#7a2a3a'); fillP(PR(sx + sw, sy - 50 * zs, 60 * zs, sh + 100 * zs), '#7a2a3a');
  hatch(PR(sx - 60 * zs, sy - 50 * zs, 60 * zs, sh + 100 * zs), sx - 30 * zs, sy + sh / 2, sh, 1.57, 7, C.ink, 1, .55); hatch(PR(sx + sw, sy - 50 * zs, 60 * zs, sh + 100 * zs), sx + sw + 30 * zs, sy + sh / 2, sh, 1.57, 7, C.ink, 1, .55);
  c_corr(sx, sy, sw, sh, { wall: '#efe7d2', door: C.sage, ph: (T * .4) % 1, n: 5 }); hatch(PR(sx, sy, sw, sh), 960, sy + sh / 2, sw, .7, 14, C.cream, 3, .3); iBox(sx, sy, sw, sh, C.ink, 3);
  X.save(); for (let i = 0; i < 22; i++) { const t = i / 21; X.beginPath(); X.moveTo(960 + (t - .5) * 160, -60); X.lineTo(sx + t * sw, sy + sh); stroke(C.cream, 2, .35); } X.restore();
  const floorY = sy + sh + 30 * zs; fillP(PR(-200, floorY, W + 400, H), '#a8735a'); hatch(PR(-200, floorY, W + 400, H), 960, 900, 1300, .1, 7, C.ink, .8, .35);
  // rows: more of them each second, packed toward the retreating screen
  const N = Math.round(lerp(6, 15, eo(p)));
  for (let k = N - 1; k >= 0; k--) { const d = k / N, y = lerp(H + 30, floorY + 30, Math.pow(d, .55)), s = lerp(1.15, .18, Math.pow(d, .55)), half = 70 * s, n = Math.ceil(1100 / (110 * s));
    for (let i = -n; i <= n; i++) { if (i === 0) continue; const cx = 960 + i * 110 * s + (i > 0 ? -55 * s : 55 * s) + (i > 0 ? 50 * s : -50 * s); if (cx < -200 || cx > W + 200) continue;
      const bk = [[cx - half * .7, y], [cx - half * .7, y - 110 * s], [cx - half * .55, y - 130 * s], [cx + half * .55, y - 130 * s], [cx + half * .7, y - 110 * s], [cx + half * .7, y]];
      fillP(PP(bk), '#8a3a3a'); if (s > .3) hatch(PP(bk), cx, y - 60 * s, 90 * s, .9, Math.max(3, 5 * s), C.ink, .9, .5, [10 * s, -6 * s]); iP(bk, false, C.ink, Math.max(.8, 2 * s)); }
    if (k === 2) { const bx = 960 - 2 * 110 * s - 5 * s, by = y - 70 * s; c_backView(bx, by, 1.1 * s); cloud(bx, by - 290 * s, .5 * s, { rain: true }); } }
  for (let i = 0; i < 3; i++) gc(960, sy + sh / 2, sw * .7 + i * 30 + ((FD * 5) % 30), C.orange, .3, 1.6);
  consL([[960, sy + sh / 2, 0, H], [960, sy + sh / 2, W, H], [0, floorY, W, floorY]]);
} };

// ---------- 256.7 the film runs out of the projector port and becomes the road; he walks off along it ----------
SU.c_reelSpill = { mode: 'ill', f(q, p, a, T) {
  stripes('#efe3c8', '#e3d2ae', 150, -.62, 0, C.ochre); cam(960, 540, 1);
  const hz = 520; fillP(PR(-200, hz, W + 400, H), '#d8c08e'); hatch(PR(-200, hz, W + 400, H), 960, 800, 1300, .05, 6, C.ink, .8, .35); stipRect(0, hz, W, H - hz, 900, C.ink, .35, 2); iline(-200, hz, W + 200, hz, C.ink, 2.2);
  for (let i = 0; i < 2; i++) cloud(1100 + i * 480 - T * 15, 200 + i * 90, .6, {});
  // the cinema booth wall, standing alone in the field, its back open to the sky
  const bw = PP([[-200, -200], [560, -200], [600, 640], [-200, 680]]); fillP(bw, '#c98478'); shade(bw, 200, 240, 600, [30, 0], .9, 6); X.beginPath(); for (let r = 0; r < 18; r++) { const yy = -200 + r * 48; X.moveTo(-200, yy); X.lineTo(580, yy); for (let c = 0; c < 9; c++) { const xx = -200 + c * 100 + (r % 2) * 50; X.moveTo(xx, yy); X.lineTo(xx, yy + 48); } } stroke(C.ink, 1, .3); iP(dens([[560, -200], [600, 640], [-200, 680]], 30), false, C.ink, 2.6);
  const port = PE(330, 280, 74, 74); fillP(port, '#2b1d14'); iE(330, 280, 74, 74, 0, C.ink, 3); iE(330, 280, 90, 90, 0, C.ink, 2, .8, false); for (let i = 0; i < 3; i++) gc(330, 280, 110 + i * 26 + ((FD * 5) % 26), C.orange, .5, 1.6);
  // the strip
  const A = [330, 300], B = [360, 1000], Cc = [1180, 760], D = [1760, hz], tMax = lerp(.3, 1, eo(seg(p, 0, .8))), N = 120;
  const wAt = (t) => t < .18 ? 120 : lerp(300, 8, Math.pow((t - .18) / .82, .7));
  const P = []; for (let i = 0; i <= N; i++) { const t = i / N * tMax, [x, y] = bz(A, B, Cc, D, t), [x2, y2] = bz(A, B, Cc, D, Math.min(1, t + .005)); let nx = -(y2 - y), ny = x2 - x; const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L; P.push([x, y, nx, ny, wAt(t), t]); }
  for (let i = 0; i < N; i++) { const [x1, y1, nx1, ny1, w1] = P[i], [x2, y2, nx2, ny2, w2] = P[i + 1]; const qd = PP([[x1 + nx1 * w1 / 2, y1 + ny1 * w1 / 2], [x2 + nx2 * w2 / 2, y2 + ny2 * w2 / 2], [x2 - nx2 * w2 / 2, y2 - ny2 * w2 / 2], [x1 - nx1 * w1 / 2, y1 - ny1 * w1 / 2]]); fillP(qd, '#3b2a22'); X.lineWidth = 1; X.strokeStyle = '#3b2a22'; X.stroke(qd); }
  // frames: places he has been
  const kinds = ['table', 'door', 'desk', 'cloud', 'phone'];
  for (let f = 0; f < 40; f++) { const t = .2 + f * .045 * Math.pow(1 - f / 40, .4); if (t > tMax - .01) break; const i = Math.round(t / tMax * N); if (i >= N) break; const [x, y, nx, ny, w] = P[i]; if (w < 18) continue; const fw = w * .7, fh = w * .6, an = Math.atan2(ny, nx) - Math.PI / 2;
    X.save(); X.translate(x, y); X.rotate(an); const fr = PR(-fw / 2, -fh / 2, fw, fh); fillP(fr, '#efe2c4'); const k = fw / 200, kind = kinds[f % 5];
    if (kind === 'table') { fillP(PR(-60 * k, 10 * k, 120 * k, 30 * k), C.rose); c_bottle(30 * k, 10 * k, .3 * k); } else if (kind === 'door') { fillP(PR(-26 * k, -50 * k, 52 * k, 100 * k), C.sage); iBox(-26 * k, -50 * k, 52 * k, 100 * k, C.ink, 1.2); } else if (kind === 'desk') { fillP(PR(-70 * k, 0, 140 * k, 50 * k), '#a5703f'); fillP(PE(0, -30 * k, 22 * k, 26 * k), C.rose); } else if (kind === 'cloud') { cloud(0, 0, .35 * k, {}); } else { fillP(PR(-18 * k, -36 * k, 36 * k, 72 * k), '#2b2420'); fillP(PR(-14 * k, -30 * k, 28 * k, 56 * k), C.orange); }
    hatch(fr, 0, 0, fw, .7, Math.max(3, 8 * k), C.ink, .8, .25); X.restore(); }
  for (let i = 0; i < N; i += 2) { const [x, y, nx, ny, w] = P[i]; if (w < 30) continue; for (const sd of [-1, 1]) { const hx = x + nx * sd * w * .43, hy = y + ny * sd * w * .43; fillP(PE(hx, hy, w * .025, w * .02, Math.atan2(ny, nx)), C.cream); } }
  // him, walking it into the distance
  const tw = lerp(.42, .62, p), [mx, my] = bz(A, B, Cc, D, tw), sc = wAt(tw) / 260; traveller(mx, my, sc * 1.1, { look: .6, legs: walkPh(), case: true, mouth: 0 }); cloud(mx, my - 470 * sc * 1.1, .7 * sc, { rain: true });
  path(bzPts(A, B, Cc, D, tMax, 1, 30), C.orange, 2, .7, [8, 10]);
  consL([[0, hz, W, hz], [1760, hz, 0, H], [1760, hz, W, H]]);
} };

// ---------- 271.8 "the crooks are real": a crook's arm comes out through the screen and lifts his hat ----------
SU.c_crookReal = { mode: 'ill', f(q, p, a, T) {
  stripes('#e2d2c4', '#d4bfae', 140, -.62, 0, C.plum); cam(960, 540, lerp(1, 1.04, eo(p)));
  const sx = 760, sy = 50, sw = 1100, sh = 600, scr = PR(sx, sy, sw, sh);
  fillP(PR(sx - 50, sy - 50, 50, sh + 100), '#7a2a3a'); fillP(PR(sx + sw, sy - 50, 50, sh + 100), '#7a2a3a'); hatch(PR(sx - 50, sy - 50, 50, sh + 100), sx - 25, sy + sh / 2, sh, 1.57, 8, C.ink, 1, .5); hatch(PR(sx + sw, sy - 50, 50, sh + 100), sx + sw + 25, sy + sh / 2, sh, 1.57, 8, C.ink, 1, .5);
  fillP(scr, '#fbf4e2'); X.save(); X.clip(scr); stripes('#f3e9d4', '#e9dcc2', 90, -.62, 0, C.tan);
  for (let i = 0; i < 3; i++) { const cx = sx + 260 + i * 300, cy = sy + sh + 60; traveller(cx, cy, 1.25, { hat: true, look: i - 1, coat: '#4a4038', sleeve: '#4a4038', armR: i === 0 ? [1.2, .3] : [-.3, .5] }); X.beginPath(); for (let k = 0; k < 7; k++) { const xx = cx - 50 + k * 16; X.moveTo(xx, cy - 330); X.lineTo(xx + 4, cy - 160); } stroke(C.cream, 1.2, .5); fillP(PR(cx - 36, cy - 404, 72, 18), C.ink); }
  hatch(scr, sx + sw / 2, sy + sh / 2, 700, .7, 14, C.ink, .8, .12); X.restore(); iBox(sx, sy, sw, sh, C.ink, 3);
  // the screen stretches where the arm comes through
  const ox = 1216, oy = 420; for (let i = 0; i < 5; i++) iE(ox, oy, 30 + i * 30 + ((FD * 3) % 30), (30 + i * 30) * .55, -.3, i % 2 ? C.orange : C.ink, 1.8, .8 - i * .12, false);
  const take = eo(seg(p, .15, .85)), head = [520, 1100 - 330 * 1.3], hatTo = [lerp(head[0], 900, take), lerp(head[1], 430, take)];
  const elbow = [lerp(900, 760, take), lerp(560, 520, take)];
  limb([[ox, oy], elbow, [hatTo[0] + 20, hatTo[1] - 20]], 26, {}, 1, '#4a4038');
  X.beginPath(); for (let k = -2; k <= 2; k++) { X.moveTo(ox + k * 6, oy + k * 3); X.lineTo(elbow[0] + k * 6, elbow[1] + k * 3); X.moveTo(elbow[0] + k * 6, elbow[1] + k * 3); X.lineTo(hatTo[0] + 20 + k * 5, hatTo[1] - 20 + k * 3); } stroke(C.cream, 1.1, .6);
  const cuff = PE(hatTo[0] + 24, hatTo[1] - 24, 22, 16, .6); fillP(cuff, C_WHITE); iE(hatTo[0] + 24, hatTo[1] - 24, 22, 16, .6, C.ink, 2);
  // front-row seat, him in it, deadpan
  for (let i = 0; i < 4; i++) { const x2 = 160 + i * 360, st = PP([[x2, 900], [x2 + 300, 900], [x2 + 320, 1120], [x2 - 20, 1120]]); fillP(st, '#8a3a3a'); shade(st, x2 + 150, 1000, 200, [12, -10], .8, 5); iP([[x2, 900], [x2 + 300, 900], [x2 + 320, 1120], [x2 - 20, 1120]], true, C.ink, 2.2); }
  traveller(520, 1100, 1.3, { hat: false, look: .6, mouth: sing(T), armR: [.3, .4], case: false });
  souvenirsOn(760, 905, T, .9);
  c_hat(hatTo[0], hatTo[1], 1.3, -take * .4);
  fillP(PE(hatTo[0] + 4, hatTo[1] - 30, 24, 18), '#e7c9a2'); iE(hatTo[0] + 4, hatTo[1] - 30, 24, 18, 0, C.ink, 2);
  cloud(520, 1100 - 600, .55, { rain: true });
  X.setLineDash([3, 10]); X.beginPath(); X.moveTo(head[0], head[1] - 30); X.quadraticCurveTo(head[0] + 120, head[1] - 160, hatTo[0] - 30, hatTo[1] + 10); stroke(C.orange, 3, .9); X.setLineDash([]);
  lab(sx + sw - 30, sy + sh + 40, 'NOT IN THE PICTURE', C.brick, .9, 16, 'right', 'alphabetic', 'bold');
  consL([[0, sy + sh, W, sy + sh], [ox, 0, ox, H]]);
} };

// ---------- cut list ----------
var CUTS_C = [
  [188.7, 'c_dinerLift', {}],
  [192.24, 'corridorInf', {}],
  [195.12, 'c_shadowStay', {}],
  [199.38, 'sWard', {}],
  [203.34, 'c_profile', {}],
  [206.62, 'sHead', {}],
  [209.2, 'pills', {}, c_refuse],
  [211.34, 'c_sDose', {}],
  [213.7, 'c_windowRoom', {}],
  [220.54, 'c_corridorLoop', {}],
  [223.38, 'c_sQueue', {}],
  [225.5, 'deskFloat', {}],
  [228.16, 'c_bellFar', {}],
  [231.0, 'sPassport', { n: 2 }],
  [234.06, 'c_holdSky', {}, POST.holdPhone],
  [239.3, 'c_lifebuoy', {}],
  [242.3, 'window', {}],
  [244.9, 'sPlaneW', {}],
  [247.3, 'c_seatsStretch', {}],
  [250.16, 'sProjector', {}],
  [252.02, 'screenWindow', {}],
  [256.7, 'c_reelSpill', {}],
  [262.64, 'cinema', {}],
  [266.7, 'sFilm', {}],
  [268.78, 'cinema', { crooks: 1 }, POST.crooksSeats],
  [271.8, 'c_crookReal', {}],
];

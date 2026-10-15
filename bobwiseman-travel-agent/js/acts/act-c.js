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
// draft 11: legs driven by the distance walked, so the planted foot stays put on the floor (no skating). d = how far the
// hips have travelled in screen px, s = figure scale, F = the foot's excursion either side of the hip (half a step, px).
// A triangle wave puts the foot exactly under the ground speed; the swing foot slides forward at twice it.
function c_stride(d, s, F) {
  const u = d / (2 * F), fr = ((u % 2) + 2) % 2, tri = fr < 1 ? 1 - 2 * fr : -3 + 2 * fr;
  const sw = Math.asin(cl(F * tri / (150 * s), -1, 1)); return Math.asin(cl(sw / .42, -1, 1));
}
// a punchline label at phone size: bold, tight tracking so it fits its box (lab() spaces letters at .16 em)
function c_big(x, y, t, col, sz = 28, al = 'center', bl = 'alphabetic', a = .95) {
  X.font = `bold ${sz}px ${MONO}`; try { X.letterSpacing = '1px'; } catch (e) {}
  X.textAlign = al; X.textBaseline = bl; X.globalAlpha = a; X.fillStyle = col; X.fillText(t, x, y); X.globalAlpha = 1;
  try { X.letterSpacing = '0px'; } catch (e) {}
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
// draft 6: the shot now runs on to 195.12 (corridorInf cut); the first 55% is draft 5's action, then the camera
// pushes in through the doorway while the three of them are already far down the corridor
SU.c_dinerLift = { mode: 'ill', f(q, p, a, T) {
  const p1 = cl(p / .55), pz = eio(seg(p, .5, 1));
  stripes(C.paper, '#e0cfd6', 120, -.62, 0, C.plum); cam(lerp(960, 1500, pz), lerp(560, 430, pz), lerp(lerp(1, 1.05, eo(p1)), 2.05, pz));
  const st = eo(seg(p1, .05, .95));
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
  // the floor carries them on through the doorway and down the corridor (shrinking toward its horizon, y = 383)
  const fz = Math.pow(.12, pz), mx = lerp(lerp(840, 1260, st), 1500, eo(seg(pz, 0, .33))), my = 383 + 597 * fz;
  X.save(); if (fz < .5) X.clip(PR(dx0, dy0, dw, dh));
  chair(mx - 40 * fz, my, fz); c_man(mx, my, 1.3 * fz, { sit: 1, look: .3, armR: [.5, .8], armL: [.4, .6] });
  c_ord(mx - 230 * fz, my + 30 * fz, 1.3 * fz, { look: .6, legs: walkPh(), armR: [1.45, .25] });
  c_ord(mx + 250 * fz, my + 30 * fz, 1.3 * fz, { look: .8, legs: walkPh() + 2, armL: [.3, -.2] });
  X.restore();
  if (pz < .2) { path([[700, 1050], [mx - 60, 1050]], C.orange, 2.4, .9, [12, 8]); X.beginPath(); X.moveTo(mx - 76, 1040); X.lineTo(mx - 58, 1050); X.lineTo(mx - 76, 1060); stroke(C.orange, 2.4, .9); }
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
  const pw = PE(140, 400, 56, 56); fillP(pw, C.cream); X.save(); X.clip(pw); hatch(pw, 140, 400, 60, 0, 14, C.brick, 5, .5); hatch(pw, 140, 400, 60, Math.PI / 2, 14, C.brick, 5, .5); X.restore(); iE(140, 400, 56, 56, 0, C.ink, 2.6);
  fillP(PR(62, 478, 156, 44), C.cream, .9); iBox(62, 478, 156, 44, C.ink, 1.8); c_big(140, 510, 'DINER', C.ink, 28);
  // the group walks right at a slow, steady hospital pace; draft 11: the legs are driven by the distance walked, so
  // the feet stay planted (draft 10's trio skated: 66 px/s on legs pacing 600 px/s)
  const gx0 = 1000, gx = lerp(gx0, 1500, p), wd = gx - gx0, F = 39;
  // shadow: a long band from his heels back along the floor, rising into a seated figure at the diner door
  const sh = new Path2D(); sh.addPath(PP([[gx - 30, 1006], [gx + 20, 994], [470, 792], [300, 800]]));
  sh.addPath(PE(330, 470, 30, 36)); sh.addPath(PP([[316, 500], [346, 500], [348, 512], [390, 530], [404, 640], [480, 652], [486, 790], [462, 790], [452, 690], [300, 690], [292, 560], [300, 528], [316, 512]]));
  sh.addPath(PP([[280, 560], [296, 560], [292, 790], [278, 790]])); sh.addPath(PP([[280, 690], [420, 690], [420, 704], [280, 704]]));
  X.save(); X.globalCompositeOperation = 'multiply'; fillP(sh, '#a89c86', .95); X.restore();
  hatch(sh, 600, 700, 900, .75, 3.4, C.ink, 1, .8); hatch(sh, 600, 700, 900, -.6, 5, C.ink, .9, .6);
  iE(330, 470, 30, 36, 0, C.ink, 1.4, .6, false);
  c_ord(gx - 200, 1000, 1.2, { look: .7, legs: c_stride(wd, 1.2, F), armR: [1.35, .3] });
  c_man(gx, 1004, 1.2, { look: -.8, legs: c_stride(wd + F * .9, 1.2, F), armL: [.1, 0], armR: [-.15, .1] });
  c_ord(gx + 200, 1000, 1.2, { look: .9, legs: c_stride(wd + F * 1.7, 1.2, F), armL: [-.2, .1] });
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
  const d = eo(seg(p, .05, .9));
  iline(860, 22, 1720, 22, C.ink, 5); for (let i = 0; i < 9; i++) iline(880 + i * 100, 0, 880 + i * 100, 22, C.ink, 2); // the ceiling rail
  c_machine(1360, 1010, d);
  // shoulders: the plum coat
  const sh = [[620, 1120], [660, 840], [780, 790], [1080, 790], [1180, 850], [1230, 1120]]; fillP(PP(sh), C.plum); shade(PP(sh), 920, 960, 360, [40, -20], .9, 5.5); iP(dens(sh, 30), false, C.ink, 2.6);
  iP([[870, 790], [930, 900], [1000, 800]], false, C.ink, 2); iP([[930, 900], [920, 1100]], false, C.ink, 1.8);
  // head: the treatment diagram's face (brow to neck); draft 11: bald, with a round skull, like him everywhere else in
  // the verse (draft 10 gave him dark hair here only)
  const hp = C_HEADP.map(([x, y]) => [900 + x * 1.6, 520 + y * 1.6]), hpp = PP(hp);
  fillP(hpp, '#efd9b9'); shade(hpp, 900, 520, 320, [-34, -10], .7, 5.5);
  X.save(); X.clip(hpp); const crn = PP([[560, 40], [900, 40], [830, 200], [790, 330], [770, 470], [560, 620]]); hatch(crn, 760, 300, 360, .5, 5, C.ink, .9, .4); hatch(crn, 700, 380, 260, -.9, 7, C.ink, .8, .25);
  X.beginPath(); X.ellipse(950, 190, 70, 30, -.35, Math.PI * 1.05, Math.PI * 1.75); stroke(C.cream, 6, .55); X.restore();
  iP(dens(hp, 26, true), true, C.ink, 3);
  iE(884, 430, 26, 40, 0, C.ink, 2.4); X.beginPath(); X.arc(888, 432, 14, -1.4, 1.8); stroke(C.ink, 1.8, .9); fillP(PE(890, 432, 26, 40), '#efd9b9', 0);
  fillP(PE(1062, 340, 7, 6), C.ink); iline(1040, 316, 1084, 312, C.ink, 2.4, 1, false); iline(1050, 352, 1076, 350, C.ink, 1.2, .7, false);
  // draft 6: the machine stands at the right; its cord runs up to a ceiling rail and hangs straight down to the pad,
  // which settles on the temple. The cord only ever crosses the background and the top of his head.
  const cx2 = 965, py2 = lerp(-40, 292, d) + Math.sin(T * 2) * 3 * (1 - d);
  X.beginPath(); X.moveTo(1580, 424); X.lineTo(1582, 52); X.quadraticCurveTo(1582, 40, 1570, 40); X.lineTo(cx2 + 12, 40); X.quadraticCurveTo(cx2, 40, cx2, 54);
  for (let i = 1; i <= 24; i++) { const t2 = i / 24; X.lineTo(cx2 + Math.sin(t2 * 9 + T) * 2 * (1 - d), lerp(54, py2 - 18, t2)); } stroke(C.ink, 2.6, 1);
  for (const px3 of [cx2, 1582]) { fillP(PE(px3, 40, 16, 16), '#8a8a82'); iE(px3, 40, 16, 16, 0, C.ink, 2); fillP(PE(px3, 40, 4, 4), C.ink); }
  const pdp = [[cx2 - 24, py2 - 15], [cx2 + 24, py2 - 17], [cx2 + 26, py2 + 14], [cx2 - 22, py2 + 16]], pd = PP(pdp); fillP(pd, '#ebe5d4'); hatch(pd, cx2, py2, 30, .6, 4, C.ink, .8, .5, [5, -5]); iP(pdp, true, C.ink, 2.2);
  fillP(PR(cx2 - 5, py2 - 22, 10, 9), '#9aa0a8'); iBox(cx2 - 5, py2 - 22, 10, 9, C.ink, 1.4, 1, false);
  if (d > .6) for (let i = 0; i < 3; i++) gc(cx2, py2, 40 + i * 20 + ((FD * 4) % 20), C.orange, .55 * (d - .5) * 2, 1.6, null, -.6, .9);
  consL([[0, 520, W, 520], [900, 0, 900, H]]); consC([[890, 330, 240]]);
} };
// the profile with a round cranium: PROFILE's face from brow to the back of the neck, then an arc over the top
const C_HEADP = PROFILE.slice(3, 16).concat(Array.from({ length: 24 }, (_, i) => { const a = -3.6 + i / 24 * 3.24; return [-5 + 160 * Math.cos(a), -95 + 160 * Math.sin(a)]; }));
// the treatment machine: a hatched cabinet on castors, three dials, a calm paper trace; d = how far the pad has come down
function c_machine(x, y, d) {
  X.save();
  const cb = PR(x, y - 560, 440, 520); fillP(cb, '#b8b2a2'); shade(cb, x + 220, y - 300, 380, [-40, -10], .9, 6); iBox(x, y - 560, 440, 520, C.ink, 2.8);
  const top = PP([[x - 14, y - 560], [x + 454, y - 560], [x + 440, y - 590], [x, y - 590]]); fillP(top, '#cfc9b8'); iP([[x - 14, y - 560], [x + 454, y - 560], [x + 440, y - 590], [x, y - 590]], true, C.ink, 2.2);
  for (const wx of [x + 50, x + 390]) { iline(wx, y - 40, wx, y - 16, C.ink, 4); fillP(PE(wx, y - 6, 18, 14), '#2b2420'); iE(wx, y - 6, 18, 14, 0, C.ink, 2); }
  // dials: needles lean over a little as the pad arrives, nothing more
  for (let i = 0; i < 3; i++) { const dx = x + 80 + i * 140, dy = y - 470, dp = PE(dx, dy, 52, 52); fillP(dp, C.cream); iE(dx, dy, 52, 52, 0, C.ink, 2.4); ticks(dx, dy, 40, 12, 6, C.ink, .8, 1.2, 0, Math.PI * 1.15, Math.PI * 1.85);
    const an = Math.PI * 1.2 + (.12 + d * (.25 + i * .12) + Math.sin(FD * .7 + i) * .02) * Math.PI * .6; iline(dx, dy, dx + Math.cos(an) * 38, dy + Math.sin(an) * 38, C.brick, 2.4, 1, false); fillP(PE(dx, dy, 6, 6), C.ink); }
  // the paper trace: a calm line that barely lifts
  const tp = PR(x + 40, y - 380, 360, 120); fillP(tp, '#f7f0dd'); hatch(tp, x + 220, y - 320, 200, 0, 12, C.teal, .8, .35); iBox(x + 40, y - 380, 360, 120, C.ink, 2);
  X.beginPath(); for (let i = 0; i <= 60; i++) { const xx = x + 40 + i * 6, ph2 = i * .5 - FD * .4; const yy = y - 320 + Math.sin(ph2) * (3 + d * 6) + (i > 40 ? Math.sin(ph2 * 3) * d * 4 : 0); i ? X.lineTo(xx, yy) : X.moveTo(xx, yy); } stroke(C.ink, 1.8, .9);
  // a row of switches and a lever, the lever down
  for (let i = 0; i < 6; i++) { const sx = x + 60 + i * 40; fillP(PR(sx - 8, y - 230, 16, 30), '#5a4a3e'); iBox(sx - 8, y - 230, 16, 30, C.ink, 1.4); fillP(PE(sx, y - (i % 2 ? 222 : 208), 5, 5), C.cream); }
  iBox(x + 330, y - 250, 70, 120, C.ink, 2); iline(x + 365, y - 140, x + 365 + 26, y - 190 + d * 40, C.ink, 5); fillP(PE(x + 391, y - 190 + d * 40, 12, 12), C.brick); iE(x + 391, y - 190 + d * 40, 12, 12, 0, C.ink, 1.8);
  // vents
  X.beginPath(); for (let i = 0; i < 7; i++) { X.moveTo(x + 60, y - 110 + i * 10); X.lineTo(x + 300, y - 110 + i * 10); } stroke(C.ink, 1.6, .6);
  X.restore();
}

// ---------- 209.28 "take their pills": square-on, the bottle between two hands like brackets. A white sleeve pushes it
// in from the left; his plum sleeve, palm out, holds it off from the right. It gives a little, then stops. ----------
function c_sleeve(pts, w0, w1, col) { // a tapered, shaded sleeve along a polyline (shoulder end w0, cuff end w1), with folds at the bend
  const L = [], Rr = [], n = pts.length;
  for (let i = 0; i < n; i++) { const a0 = pts[Math.max(0, i - 1)], a1 = pts[Math.min(n - 1, i + 1)], dx = a1[0] - a0[0], dy = a1[1] - a0[1], d = Math.hypot(dx, dy) || 1, w = lerp(w0, w1, i / (n - 1)) / 2;
    L.push([pts[i][0] - dy / d * w, pts[i][1] + dx / d * w]); Rr.push([pts[i][0] + dy / d * w, pts[i][1] - dx / d * w]); }
  const poly = L.concat(Rr.slice().reverse()), pp = PP(poly); fillP(pp, col); const m = pts[Math.floor(n / 2)];
  shade(pp, m[0], m[1], Math.max(w0, 300), [12, -10], .9, 6); iP(dens(L, 24), false, C.ink, 2.6); iP(dens(Rr, 24), false, C.ink, 2.6);
  for (let k = 1; k <= 3; k++) { const e = pts[Math.floor(n / 2)], q2 = pts[Math.floor(n / 2) + 1] || e; X.beginPath(); X.moveTo(e[0] - 16 + k * 9, e[1] - 22 + k * 10); X.quadraticCurveTo(e[0] + k * 6, e[1] - 4 + k * 6, q2[0] * .2 + e[0] * .8 + k * 4, q2[1] * .2 + e[1] * .8 + 18); stroke(C.ink, 1.4, .6); }
}
function c_sideHand(x, y, s, side, cuff) { // a flat hand seen edge-on, fingers up, palm toward side*x (against something); wrist at (x,y)
  X.save(); X.translate(x, y); X.scale(side * s, s); const k = 1 / s;
  const hp = [[22, 30], [20, -20], [24, -96], [18, -122], [6, -132], [-6, -128], [-12, -100], [-14, -40], [-30, -46], [-50, -70], [-60, -64], [-52, -30], [-30, 6], [-24, 30]];
  fillP(PP(hp), '#efd9b9'); shade(PP(hp), 0, -50, 90, [-8, -6], .5, 4 * k); iP(dens(hp, 12, true), true, C.ink, 2.4 * k);
  X.beginPath(); for (const fx of [-2, 8]) { X.moveTo(fx, -38); X.quadraticCurveTo(fx + 2, -90, fx + 4, -122 + Math.abs(fx)); } stroke(C.ink, 1.3 * k, .65);
  X.beginPath(); X.moveTo(-14, -40); X.quadraticCurveTo(-26, -34, -34, -20); stroke(C.ink, 1.3 * k, .6);
  const cf = PR(-30, 22, 56, 30); fillP(cf, cuff); hatch(cf, 0, 37, 40, .8, 5 * k, C.ink, .8 * k, .4); iBox(-30, 22, 56, 30, C.ink, 2 * k);
  X.restore();
}
function c_gripHand(x, y, s, side, cuff) { // a hand gripping the edge at (x,y): back of the hand outside, four fingers wrapped onto the front
  X.save(); X.translate(x, y); X.scale(side * s, s); const k = 1 / s;
  const bk = [[-70, -50], [-8, -64], [6, -40], [8, 40], [-10, 60], [-70, 52], [-86, 0]]; fillP(PP(bk), '#efd9b9'); shade(PP(bk), -40, 0, 70, [-10, -8], .7, 4 * k); iP(dens(bk, 14, true), true, C.ink, 2.4 * k);
  for (let i = 0; i < 4; i++) { const fy = -46 + i * 28, fp = PR(-6, fy, 46 - Math.abs(i - 1.5) * 6, 24); fillP(fp, '#efd9b9'); hatch(fp, 14, fy + 12, 30, .3, 3.5 * k, C.ink, .8 * k, .4, [0, -4]); iBox(-6, fy, 46 - Math.abs(i - 1.5) * 6, 24, C.ink, 1.8 * k); fillP(PE(34 - Math.abs(i - 1.5) * 6, fy + 12, 4, 7), '#f7eadb'); }
  X.beginPath(); for (let i = 0; i < 4; i++) { X.moveTo(-14, -40 + i * 28); X.lineTo(-30, -36 + i * 26); } stroke(C.ink, 1.2 * k, .5);
  const cf = PR(-130, -40, 52, 92); fillP(cf, cuff); hatch(cf, -104, 6, 60, .8, 5 * k, C.ink, .8 * k, .4); iBox(-130, -40, 52, 92, C.ink, 2 * k);
  X.restore();
}
SU.c_pills = { mode: 'ill', f(q, p, a, T) {
  stripes('#e4e5d6', '#d6d9c6', 110, -.62, 0, C.sage); cam(640, 600, lerp(1.16, 1.22, eo(p)));
  // on the wall behind: the clock (three times a day) and the chart the next diagram draws
  const ck = PE(200, 360, 110, 110); fillP(ck, C.cream); hatch(ck, 200, 360, 110, .7, 6, C.ink, .8, .3, [20, -20]); iE(200, 360, 110, 110, 0, C.ink, 3); ticks(200, 360, 92, 12, 10, C.ink, .9, 2);
  const ha2 = T * .05, ma2 = T * .6; iline(200, 360, 200 + Math.sin(ha2) * 55, 360 - Math.cos(ha2) * 55, C.ink, 6, 1, false); iline(200, 360, 200 + Math.sin(ma2) * 82, 360 - Math.cos(ma2) * 82, C.ink, 3.4, 1, false); fillP(PE(200, 360, 8, 8), C.ink);
  const chx = 900, chy = 240, chart = PR(chx, chy, 340, 300); fillP(chart, '#f4efe0'); iBox(chx, chy, 340, 300, C.ink, 2.4); fillP(PR(chx, chy, 340, 46), C.sage); iBox(chx, chy, 340, 46, C.ink, 2);
  X.beginPath(); for (let i = 1; i < 7; i++) { X.moveTo(chx + i * 340 / 7, chy + 46); X.lineTo(chx + i * 340 / 7, chy + 300); } for (let r2 = 1; r2 < 3; r2++) { X.moveTo(chx, chy + 46 + r2 * 85); X.lineTo(chx + 340, chy + 46 + r2 * 85); } stroke(C.ink, 1.4, .7);
  for (let i = 0; i < 7; i++) for (let r2 = 0; r2 < 3; r2++) { const ex2 = chx + (i + .5) * 340 / 7, ey2 = chy + 46 + (r2 + .5) * 85; if (i < 4) iline(ex2 - 12, ey2 - 12, ex2 + 12, ey2 + 12, C.ink, 2, .9, false); if (i < 4) iline(ex2 - 12, ey2 + 12, ex2 + 12, ey2 - 12, C.ink, 2, .9, false); }
  iE(chx + 4.5 * 340 / 7, chy + 46 + 1.5 * 85, 26, 26, 0, C.brick, 2.4);
  iline(chx + 170, chy - 30, chx + 170, chy, C.ink, 2); fillP(PE(chx + 170, chy - 34, 6, 6), C.ink);
  const tb = PR(-400, 720, W + 800, 600); fillP(tb, '#b08a5c'); hatch(tb, 640, 860, 1500, .1, 7, C.ink, .8, .4); iline(-400, 720, W + 400, 720, C.ink, 2.6);
  // the tray and its paper cups
  const tr = PP([[180, 760], [1100, 760], [1150, 860], [130, 860]]); fillP(tr, '#c9c2a8'); hatch(tr, 640, 810, 600, 1.4, 9, C.ink, .8, .35); iP(dens([[180, 760], [1100, 760], [1150, 860], [130, 860]], 30, true), true, C.ink, 2.2);
  for (const [cx, n] of [[300, 3], [980, 2]]) { const cu = PP([[cx - 34, 760], [cx + 34, 760], [cx + 24, 830], [cx - 24, 830]]); fillP(cu, C.cream); X.beginPath(); for (let i = 0; i < 7; i++) { X.moveTo(cx - 30 + i * 10, 762); X.lineTo(cx - 22 + i * 7.4, 828); } stroke(C.ink, 1, .6); iP([[cx - 34, 760], [cx + 34, 760], [cx + 24, 830], [cx - 24, 830]], true, C.ink, 2); iE(cx, 760, 34, 8, 0, C.ink, 1.8); for (let i = 0; i < n; i++) fillP(PE(cx - 12 + i * 12, 756, 9, 5, .3), i % 2 ? C.rose : C.cream); }
  // the push: the white sleeve shoves, his palm holds, the bottle gives 50 px and stops
  const push = eo(seg(p, .05, .5)), hold = seg(p, .5, 1), bx = 640 - 50 * push + Math.sin(T * 30) * 2 * hold;
  const bt = PR(bx - 110, 360, 220, 360); fillP(bt, '#c86b2c'); shade(bt, bx, 540, 250, [30, 0], .9, 5); hatch(bt, bx, 540, 250, -.8, 18, C.cream, 3, .25); iBox(bx - 110, 360, 220, 360, C.ink, 2.6);
  const cap = PR(bx - 124, 300, 248, 70); fillP(cap, C.cream); X.beginPath(); for (let i = 0; i < 26; i++) { X.moveTo(bx - 120 + i * 9.5, 304); X.lineTo(bx - 120 + i * 9.5, 366); } stroke(C.ink, 1, .6); iBox(bx - 124, 300, 248, 70, C.ink, 2.4);
  // draft 11: the dose is the label's one big line (phone size), set above the orderly's fingers; no "TAKE" (sung word)
  const lb = PR(bx - 100, 392, 200, 228); fillP(lb, C.cream); iBox(bx - 100, 392, 200, 228, C.ink, 1.8); c_big(bx, 446, '3 × DAILY', C.ink, 28); iline(bx - 84, 462, bx + 84, 462, C.ink, 1.4, .7, false);
  lab(bx + 82, 500, '℞', C.ink, .85, 22, 'right', 'alphabetic', 'bold'); for (let i = 0; i < 5; i++) iline(bx - 80, 528 + i * 18, bx + 80 - (i % 2) * 40, 528 + i * 18, C.ink, 1, .5, false);
  fillP(PE(bx, 724, 130, 10), C.ink, .25);
  // left: the orderly's arm comes up from below, white sleeve; the hand grips the bottle's edge and shoves.
  // draft 11: the forearm now runs level into the shirt cuff (draft 10's sleeve ended below it, so the cuff floated)
  const cfx = bx - 110 - 104 * 1.15, cfy = 560 + 6 * 1.15; // the cuff's centre
  c_sleeve(dens([[-420, 1300], [20, 760], [cfx - 150, cfy + 10], [cfx - 6, cfy]], 30), 150, 118, C_WHITE); c_gripHand(bx - 110, 560, 1.15, 1, '#d9e3e0');
  // right: his arm, plum sleeve, bent; the hand flat against the other side, holding it off
  c_sleeve(dens([[1720, 1260], [1160, 1020], [bx + 136, 690]], 40), 150, 80, C_PLUM2); c_sideHand(bx + 136, 640, 1.5, -1, C_WHITE);
  // the pills that were in the cup roll off the edge, away from him
  const r = M32(17); for (let i = 0; i < 6; i++) { const px = 1180 + r() * 300 + eo(p) * (420 + i * 80), py = 900 + r() * 120, an = r() * 3 + p * 8, pp = PE(px, py, 30, 13, an); fillP(pp, i % 2 ? C.cream : C.rose); hatch(pp, px, py, 32, .5, 3.5, C.ink, .9, .6, [4, -6]); iE(px, py, 30, 13, an, C.ink, 1.8); gl(px - 40, py, px - 90, py, C.orange, .7, 2, [6, 6]); }
  for (let i = 0; i < 3; i++) gc(bx + 150, 520, 70 + i * 26 + ((FD * 4) % 26), C.teal, .6, 1.8, null, -Math.PI * .4, Math.PI * .4);
  for (let i = 0; i < 3; i++) gc(bx - 150, 520, 70 + i * 26 + ((FD * 4) % 26), C.orange, .5, 1.8, null, Math.PI * .6, Math.PI * 1.4);
  consL([[0, 720, W, 720], [640, 0, 640, H]]); consC([[640, 540, 300]]);
} };

// ---------- 211.3 SCH: the dosage, a calendar that never runs out ----------
SU.c_sDose = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.06, 1, eo(p)));
  const bx = 640; X.strokeStyle = C.white; X.lineWidth = 1.4; X.globalAlpha = .9; X.strokeRect(bx - 110, 360, 220, 360); X.strokeRect(bx - 124, 300, 248, 70); X.globalAlpha = 1;
  X.beginPath(); for (let i = 0; i < 26; i++) { X.moveTo(bx - 120 + i * 9.5, 304); X.lineTo(bx - 120 + i * 9.5, 366); } stroke(C.lav, 1, .5);
  stip(PR(bx - 110, 470, 220, 250), bx, 600, 200, 900, C.lav, .45, 1.3); X.strokeStyle = C.lav; X.strokeRect(bx - 100, 392, 200, 228);
  lab(bx, 446, '3 × DAILY', C.white, .85, 15, 'center', 'alphabetic', 'bold'); lab(bx + 82, 500, '℞', C.lav, .8, 16, 'right');
  bracket(bx - 160, 300, bx - 160, 720, C.cyan, .8, 'H 420'); bracket(bx - 124, 760, bx + 124, 760, C.cyan, .7, 'Ø 248');
  gl(-50, 720, 860, 720, C.lav, .5, 1.2);
  const g0 = 900, g1 = 1860, cw = 130, gy = 260, ch = 150, sc = (q * 6 + p * 2) * cw, d0 = Math.floor(sc / cw);
  X.save(); X.beginPath(); X.rect(g0, 180, g1 - g0, 760); X.clip();
  for (let j = -1; j < 9; j++) { const day = d0 + j, cx = g0 + j * cw - (sc % cw); X.strokeStyle = C.lav; X.globalAlpha = .5; X.strokeRect(cx, gy, cw, ch * 3); X.globalAlpha = 1; lab(cx + cw / 2, gy - 18, 'DAY ' + (day + 1), C.lav, .7, 11, 'center');
    for (let r = 0; r < 3; r++) { const py = gy + ch * r + ch / 2, px = cx + cw / 2, RD = 7, refused = day === RD && r === 1, taken = day < RD || (day === RD && r === 0); // the refusal is pinned to its day and scrolls with it gl(cx, gy + ch * r, cx + cw, gy + ch * r, C.lav, .3);
      iE(px, py, 32, 13, .3, refused ? C.mag : C.cyan, 1.2, .9, false, .3); stip(PE(px, py, 32, 13, .3), px, py, 34, 60, refused ? C.mag : C.cyan, .7, 1.3);
      if (taken) { gl(px - 26, py + 20, px + 26, py - 20, C.cyan, .8, 1.4); } if (refused) { gc(px, py, 50, C.mag, .95, 1.6); lab(px, py + 72, 'REFUSED', C.mag, .95, 12, 'center', 'alphabetic', 'bold'); } } }
  X.restore();
  for (const [r, t] of [[0, 'MORN'], [1, 'NOON'], [2, 'NIGHT']]) lab(g0 - 14, gy + ch * r + ch / 2 + 4, t, C.lav, .7, 11, 'right');
  gl(1660, 840, 1840, 840, C.mag, .9, 1.6); lab(1850, 846, '∞', C.mag, .95, 22);
  c_big(1000, 892, 'END DATE: NONE GIVEN', C.cyan, 30, 'left'); // draft 11: the punchline at phone size
  gl(bx + 124, 330, g0, gy, C.lav, .25, 1, [3, 6]); gl(bx + 110, 720, g0, gy + ch * 3, C.lav, .25, 1, [3, 6]);
  screen(); schFrame('31', 'DOSAGE', '3 × DAILY · NO END DATE');
} };

// ---------- 213.7 the ward window opens onto the diner, which opens onto the road, which opens onto sky ----------
// draft 6: the man stays still on the bed. The camera pushes slowly through the barred window into the diner, through
// the diner's window onto the road, through the window hanging over the road into the sky. Each level is drawn
// straight in screen space at its on-screen size (k = width / 600), so the ink keeps its weight however deep we go.
const C_WR = [1150, 170, 600, 540]; // the ward window, in ward coordinates
function c_inRect(r, lvl, T) { const [x, y, w, h] = r, f = .27; return [x + w * (.5 - f / 2 + .018 * Math.sin(T * .8 + lvl * 2)), y + h * (.16 + .025 * Math.cos(T * .6 + lvl)), w * f, h * f]; }
const c_fit = (r) => { const h = r[2] * 9 / 16; return [r[0], r[1] + (r[3] - h) / 2, r[2], h]; };
const c_covers = (r) => r[0] <= 0 && r[1] <= 0 && r[0] + r[2] >= W && r[1] + r[3] >= H;
function c_lvl(r, lvl, T, p) { // draw level lvl (0 diner, 1 road, 2 sky) filling screen rect r, then its own window
  const [x, y, w, h] = r, k = w / 600, lw = cl(1.4 * k, 1.2, 4.5); if (w < 10 || lvl > 2) return;
  const inner = lvl < 2 ? c_inRect(r, lvl, T) : null;
  if (inner && c_covers(inner)) { c_lvl(inner, lvl + 1, T, p); return; }
  X.save(); X.clip(PR(x, y, w, h));
  if (lvl === 0) { // the diner: checked wall, his table and the wine bottle, his empty chair, a lamp
    fillP(PR(x, y, w, h), C.paper); hatch(PR(x, y, w, h), x + w / 2, y + h / 2, w, 0, 30 * k, C.brick, 1.2 * k, .22); hatch(PR(x, y, w, h), x + w / 2, y + h / 2, w, Math.PI / 2, 30 * k, C.brick, 1.2 * k, .22);
    const fl = PR(x, y + h * .72, w, h * .28); fillP(fl, '#e6d9cc'); hatch(fl, x + w / 2, y + h * .86, w, .1, 6 * k, C.ink, .8, .35); iline(x, y + h * .72, x + w, y + h * .72, C.ink, lw * 1.2);
    const tbx = x + w * .78, tby = y + h * .68, tb = PR(tbx - w * .15, tby, w * .3, h * .2); fillP(tb, C.cream); hatch(tb, tbx, tby + h * .1, w * .3, 0, 14 * k, C.brick, 4 * k, .4); hatch(tb, tbx, tby + h * .1, w * .3, Math.PI / 2, 14 * k, C.brick, 4 * k, .4); iBox(tbx - w * .15, tby, w * .3, h * .2, C.ink, lw);
    c_bottle(tbx + w * .06, tby, .5 * k); fillP(PE(tbx - w * .05, tby - 4 * k, 40 * k, 9 * k), '#ffffff'); iE(tbx - w * .05, tby - 4 * k, 40 * k, 9 * k, 0, C.ink, lw * .8);
    chair(x + w * .2, y + h * .95, .6 * k); iline(tbx, y, tbx, y + h * .3, C.ink, lw * .7); const lp = PP([[tbx - 40 * k, y + h * .38], [tbx + 40 * k, y + h * .38], [tbx + 18 * k, y + h * .3], [tbx - 18 * k, y + h * .3]]); fillP(lp, C.ochre); hatch(lp, tbx, y + h * .34, 40 * k, .7, 4 * k, C.ink, .8, .5); iP([[tbx - 40 * k, y + h * .38], [tbx + 40 * k, y + h * .38], [tbx + 18 * k, y + h * .3], [tbx - 18 * k, y + h * .3]], true, C.ink, lw * .8);
  } else if (lvl === 1) { // the road and the payphone, under a sky with a window hanging in it
    fillP(PR(x, y, w, h), '#e3e8dc'); hatch(PR(x, y, w, h), x + w / 2, y + h * .3, w, -.95, 16 * k, C.cream, 3 * k, .4);
    const hz = y + h * .62, fd = PR(x, hz, w, h * .38); fillP(fd, '#ecd9a8'); hatch(fd, x + w / 2, hz + h * .2, w, -.62, 10 * k, C.ochre, 1, .45);
    const rd = PP([[x + w * .47, hz], [x + w * .53, hz], [x + w * .8, y + h], [x + w * .2, y + h]]); fillP(rd, '#9b8a6e'); hatch(rd, x + w / 2, hz + h * .2, w * .4, .2, 6 * k, C.ink, .8, .5); iline(x, hz, x + w, hz, C.ink, lw);
    X.beginPath(); for (let i = 0; i < 5; i++) { const t = i / 5, yy = lerp(hz, y + h, t * t); X.moveTo(x + w / 2, yy); X.lineTo(x + w / 2, yy + h * .03 * (t + .2)); } stroke(C.cream, 3 * k, .9);
    for (let i = 0; i < 4; i++) { const px = x + w * (.06 + i * .07), top = hz - h * (.22 - i * .04); iline(px, top, px, hz + 2, C.ink, lw); iline(px - 10 * k, top + 6 * k, px + 10 * k, top + 6 * k, C.ink, lw * .7); }
    const pb = PR(x + w * .8, hz - h * .3, w * .08, h * .32); fillP(pb, '#dfe6dd'); iBox(x + w * .8, hz - h * .3, w * .08, h * .32, C.brick, lw * 1.4); fillP(PR(x + w * .79, hz - h * .34, w * .1, h * .05), C.brick);
    if (inner) fillP(PE(inner[0] + inner[2] / 2, hz + h * .05, inner[2] * .5, h * .02), C.ink, .25); // the hanging window's shadow on the field
  } else { // the sky: clouds and the plane crossing it
    fillP(PR(x, y, w, h), '#cfe0da'); hatch(PR(x, y, w, h), x + w / 2, y + h / 2, w, -.95, 16 * k, C.cream, 3 * k, .4);
    cloud(x + w * .2, y + h * .28, .45 * k, {}); cloud(x + w * .84, y + h * .7, .38 * k, {});
    // draft 9: on the wordless vocal (219.4-220.05) the plane loops the loop once
    const pp = seg(p, .6, 1), lu = eio(cl((T - 219.35) / .75)), lr = h * .09, la = TAU * lu;
    plane(x + w * lerp(.05, .9, pp) + lr * Math.sin(la), y + h * lerp(.62, .42, pp) - lr * (1 - Math.cos(la)), .45 * k, -.12 - la);
    for (let i = 0; i < 3; i++) gc(x + w * lerp(.05, .9, pp) - 200 * k, y + h * .6, (40 + i * 30 + ((FD * 5) % 30)) * k * .5, C.teal, .5, 1.6);
  }
  X.restore();
  if (inner) { const [ix, iy, iw, ih] = inner, bd = iw * .035; fillP(PR(ix - bd, iy - bd, iw + 2 * bd, ih + 2 * bd), '#7a4a2a'); c_lvl(inner, lvl + 1, T, p); iBox(ix, iy, iw, ih, C.ink, cl(3 * iw / 600 * 3.7, 1, 6)); iBox(ix - bd, iy - bd, iw + 2 * bd, ih + 2 * bd, C.ink, cl(2 * iw / 600 * 3.7, 1, 4), .9, false); }
}
SU.c_windowRoom = { mode: 'ill', f(q, p, a, T) {
  // the camera: three similar steps (frame > ward window > diner window > road window), each an exponential push about its fixed point
  const R0 = C_WR, R1 = c_inRect(R0, 0, T), R2 = c_inRect(R1, 1, T), K = [[0, 0, W, H], c_fit(R0), c_fit(R1), c_fit(R2)];
  const u = seg(p, .06, .97), sv = 3 * (.55 * eio(u) + .45 * u), i = Math.min(2, Math.floor(sv)), t = sv - i, A = K[i], B = K[i + 1], r = B[2] / A[2];
  const fx = (B[0] - r * A[0]) / (1 - r), fy = (B[1] - r * A[1]) / (1 - r), rt = Math.pow(r, t), V = [fx + (A[0] - fx) * rt, fy + (A[1] - fy) * rt, A[2] * rt], Z = W / V[2];
  const toS = (rr) => [(rr[0] - V[0]) * Z, (rr[1] - V[1]) * Z, rr[2] * Z, rr[3] * Z], S0 = toS(R0), ward = () => X.setTransform(Z, 0, 0, Z, -V[0] * Z, -V[1] * Z);
  const [wx, wy, ww, wh] = R0;
  if (!c_covers(S0)) {
    ward(); stripes('#e9e2cf', '#dcd3bd', 110, -.62, 0, C.tan);
    const fl = PR(-200, 890, W + 400, 400); fillP(fl, '#c9c2a8'); hatch(fl, 960, 1000, 1300, .08, 7, C.ink, .8, .4); iline(-200, 890, W + 200, 890, C.ink, 2.6);
    fillP(PR(wx - 26, wy - 26, ww + 52, wh + 52), '#d6c8a6'); iBox(wx - 26, wy - 26, ww + 52, wh + 52, C.ink, 2.4);
    // iron bed, the man sitting on its edge, looking out; he does not move
    const mat = PR(160, 660, 720, 80); fillP(mat, C.cream); hatch(mat, 520, 700, 400, .3, 7, C.ink, .8, .3);
    const bl = PP([[160, 660], [560, 650], [600, 760], [160, 770]]); fillP(bl, C.teal); shade(bl, 380, 710, 260, [20, -10], .9, 5); iP(dens([[160, 660], [560, 650], [600, 760], [160, 770]], 30, true), true);
    iBox(160, 660, 720, 80, C.ink, 2.2); for (const lx of [170, 870]) iline(lx, 740, lx, 890, C.ink, 5); iline(160, 520, 160, 890, C.ink, 6); iline(160, 520, 160 + 2, 660, C.ink, 4);
    X.beginPath(); for (let j = 0; j < 5; j++) { X.moveTo(180 + j * 30, 540); X.lineTo(180 + j * 30, 660); } X.moveTo(160, 540); X.lineTo(320, 540); stroke(C.ink, 3, .9);
    const pil = PE(270, 640, 80, 26); fillP(pil, '#ffffff'); hatch(pil, 270, 640, 80, .4, 6, C.ink, .8, .4, [0, -8]); iE(270, 640, 80, 26, 0, C.ink, 2);
    c_man(760, 890, 1.25, { sit: 1, look: .8, armR: [.4, .9], armL: [.3, .7] });
    const cab = PR(940, 700, 140, 190); fillP(cab, '#cfc6ae'); shade(cab, 1010, 795, 120, [-14, 0], .9, 5); iBox(940, 700, 140, 190, C.ink, 2.2); iline(940, 790, 1080, 790, C.ink, 1.6); fillP(PE(1010, 745, 6, 6), C.ink); fillP(PE(1010, 835, 6, 6), C.ink);
    const cup = PP([[985, 700], [1015, 700], [1010, 668], [990, 668]]); fillP(cup, C.cream); iP([[985, 700], [1015, 700], [1010, 668], [990, 668]], true, C.ink, 1.6);
    consL([[0, 890, W, 890], [wx, 0, wx, H], [0, wy + wh, W, wy + wh]]);
    screen();
  }
  c_lvl(S0, 0, T, p);
  { // the window's own frame and its two bars, in front (they pass out of frame as the camera goes through)
    ward(); iBox(wx, wy, ww, wh, C.ink, 4); X.beginPath(); for (const fr of [1 / 3, 2 / 3]) { X.moveTo(wx + fr * ww, wy); X.lineTo(wx + fr * ww, wy + wh); } X.moveTo(wx, wy + wh * .58); X.lineTo(wx + ww, wy + wh * .58); stroke(C.ink, 5, .95);
    X.beginPath(); for (const fr of [1 / 3, 2 / 3]) { X.moveTo(wx + fr * ww + 3, wy); X.lineTo(wx + fr * ww + 3, wy + wh); } stroke(C.cream, 1.2, .6);
    fillP(PR(wx - 40, wy + wh + 6, ww + 80, 26), '#bfae88'); iBox(wx - 40, wy + wh + 6, ww + 80, 26, C.ink, 2.2);
    if (Z < 1.6) { X.setLineDash([3, 10]); X.beginPath(); X.moveTo(790, 500); X.quadraticCurveTo(980, 380, wx + ww / 2, wy + wh * .3); stroke(C.orange, 3, .9); X.setLineDash([]); }
    screen();
  }
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
  traveller(0, 0, s, { look: flipLook || 0, mouth: sing(T), phone: 'mobile', case: false });
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

// ---------- 223.4 SCH: the hold music as a waveform. Draft 11: no longer a spiral (it rhymed with the corridor loop
// before it and the waiting room after it, three round centred pictures in a row). The track is the same bar four times
// over; the playhead (him, position 47) runs the first bar and jumps back to its start. The agent waits at the far end.
function c_wave(u) { // the hold tune's amplitude at u (0..1 across one bar): four plucked notes, the same every bar
  const n = Math.floor(u * 4), v = u * 4 - n, env = Math.min(1, v * 14) * Math.exp(-v * 3.2), hz = [5, 7, 6, 9][n];
  return env * (.55 + .45 * Math.abs(Math.sin(v * hz * 6.3))) * [1, .8, .9, .7][n];
}
SU.c_sQueue = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.04, 1, eo(p)));
  const x0 = 160, BAR = 380, NB = 4, x1 = x0 + BAR * NB, wy = 520, amp = 150;
  graticule(x0 + BAR * NB / 2, wy, BAR * NB, amp * 2 + 40, 40, C.lav, .07);
  gl(x0, wy, x1, wy, C.lav, .45, 1.2); gl(x0, wy - amp - 20, x1, wy - amp - 20, C.lav, .3, 1); gl(x0, wy + amp + 20, x1, wy + amp + 20, C.lav, .3, 1);
  // the bars: identical copies, so the track reads as one bar repeated
  for (let b = 0; b < NB; b++) {
    const bx0 = x0 + b * BAR; X.beginPath();
    for (let i = 0; i < BAR; i += 5) { const h = c_wave(i / BAR) * amp; X.moveTo(bx0 + i, wy - h); X.lineTo(bx0 + i, wy + h); }
    stroke(b === 0 ? C.cyan : C.lav, 2, b === 0 ? .85 : .45);
    const env = []; for (let i = 0; i <= BAR; i += 4) env.push([bx0 + i, wy - c_wave(i / BAR) * amp - 3]); path(env, C.white, 1.4, b === 0 ? .6 : .3);
    gl(bx0, wy - amp - 40, bx0, wy + amp + 40, C.lav, .55, 1.4, [5, 6]); lab(bx0 + 30, wy - amp - 30, 'A', C.lav, .7, 13, 'left', 'alphabetic', 'bold');
  }
  gl(x1, wy - amp - 40, x1, wy + amp + 40, C.lav, .55, 1.4, [5, 6]);
  // the agent, at the far end of the track
  star(x1 + 70, wy, 7, C.white, .95); lab(x1 + 70, wy + 52, 'AGENT', C.white, .85, 12, 'center');
  gl(x0 + BAR, wy + amp + 70, x1 + 70, wy + amp + 70, C.lav, .35, 1.2, [3, 8]); gl(x1 + 70, wy + 30, x1 + 70, wy + amp + 70, C.lav, .35, 1.2, [3, 8]);
  // the playhead: him, riding bar 1 and jumping back to its start (on twos, about 1.2 loops a second)
  const ph = ((T - 223.38) * 1.25) % 1, hx = x0 + ph * BAR;
  X.save(); X.beginPath(); X.rect(x0, wy - amp - 20, hx - x0, amp * 2 + 40); X.clip(); stip(PR(x0, wy - amp - 20, BAR, amp * 2 + 40), x0 + BAR / 2, wy, BAR, 700, C.mag, .4, 1.2); X.restore();
  gl(hx, wy - amp - 60, hx, wy + amp + 40, C.mag, .95, 2.4); star(hx, wy - c_wave(ph) * amp, 5, C.mag, 1);
  X.beginPath(); X.moveTo(hx - 12, wy - amp - 74); X.lineTo(hx + 12, wy - amp - 74); X.lineTo(hx, wy - amp - 58); X.closePath(); X.fillStyle = C.mag; X.globalAlpha = .95; X.fill(); X.globalAlpha = 1;
  lab(hx + 16, wy + amp + 36, 'YOU · 47', C.mag, .95, 14, 'left', 'alphabetic', 'bold');
  // the loop back: square-cornered, from the end of bar 1 over the top to its start
  const ly = wy - amp - 110; X.beginPath(); X.moveTo(x0 + BAR - 6, wy - amp - 24); X.lineTo(x0 + BAR - 6, ly); X.lineTo(x0 + 6, ly); X.lineTo(x0 + 6, wy - amp - 24); X.setLineDash([10, 7]); stroke(C.mag, 2.2, .9); X.setLineDash([]);
  X.beginPath(); X.moveTo(x0 - 6, wy - amp - 40); X.lineTo(x0 + 6, wy - amp - 24); X.lineTo(x0 + 18, wy - amp - 40); stroke(C.mag, 2.2, .9);
  c_big(x0 + BAR / 2, ly - 18, 'REPEAT ∞', C.mag, 32); // the punchline
  bracket(x0, wy + amp + 70, x0 + BAR, wy + amp + 70, C.cyan, .7, 'ONE BAR · 0:48');
  screen(); schFrame('32', 'THE QUEUE', 'YOUR CALL IS IMPORTANT TO US');
} };

// ---------- 225.5 the queue, drawn: the spiral from the diagram is a waiting room seen from above. Every chair faces the
// phone at its centre; on its screen she is a tiny pixel figure (the first glint of the world behind the glass). ----------
const C_COATS = [C.sage, C.rose, C.ochre, C.plum, '#8d93a8', C.tan, C.brick, '#6f8a8a'], C_HAIR = ['#3b2a22', '#6b4a2e', '#9a8a7a', '#2b1d14', '#b0864a'];
function c_topSeat(x, y, ang, o = {}) { // a chair and its sitter seen from straight above; +x local = the way they face
  X.save(); X.translate(x, y); X.rotate(ang);
  const st = PR(-26, -26, 52, 52); fillP(st, '#d9c7a0'); hatch(st, 0, 0, 40, .8, 6, C.ink, .8, .35); iBox(-26, -26, 52, 52, C.ink, 1.8);
  const bk = PR(-36, -28, 12, 56); fillP(bk, '#b89a6a'); iBox(-36, -28, 12, 56, C.ink, 1.6);
  if (o.empty) { X.restore(); return; }
  for (const sy of [-11, 11]) { const kn = PR(-2, sy - 8, 40, 16); fillP(kn, '#4a3b33'); iBox(-2, sy - 8, 40, 16, C.ink, 1.4, 1, false); fillP(PE(42, sy, 8, 7), '#2b1d14'); }
  const sh = PE(-12, 0, 16, 32); fillP(sh, o.coat); hatch(sh, -12, 0, 34, .6, 4, C.ink, .8, .5, [5, -5]); iE(-12, 0, 16, 32, 0, C.ink, 1.8);
  if (o.hat) { const br = PE(-10, 0, 30, 30); fillP(br, '#3d2a1f'); iE(-10, 0, 30, 30, 0, C.ink, 2); gc(-10, 0, 21, C.ochre, 1, 4); const cr = PE(-10, 0, 17, 13); fillP(cr, '#4b3426'); hatch(cr, -10, 0, 18, .7, 3, C.ink, .9, .7); iE(-10, 0, 17, 13, 0, C.ink, 1.6); iline(-24, 0, 4, 0, C.ink, 1.4, .8, false); }
  else { const hd = PE(-10, 0, 14, 14); fillP(hd, o.hair); hatch(hd, -10, 0, 15, .4, 2.6, C.ink, .8, .6); iE(-10, 0, 14, 14, 0, C.ink, 1.6); }
  const ps = o.hat ? 32 : 17; fillP(PR(-16, ps - 2, 12, 7), '#2b2420'); limb([[-12, 26], [6, 30], [-6, ps + 2]], 6, {}, 1, o.coat);
  X.restore();
}
function c_pxHold(g, w, h, T) { // the hold screen behind the glass: spinner, hold-music zigzags, her at her desk with the headset on
  const st = pxStep(T); pR(g, 0, 0, w, h, PX.k); pDots(g, 1, 1, w, h, 3, PX.n, 1);
  for (let i = 0; i < 3; i++) pZig(g, 0, 4 + i * 3, w, 1, 4, [PX.c, PX.m, PX.y][i], 1, st * (i + 1));
  for (let i = 0; i < 8; i++) { const an = i / 8 * TAU, on = (st % 8) === i; pC(g, w / 2 + Math.cos(an) * 8, h * .27 + Math.sin(an) * 8, on ? 2 : 1.2, on ? PX.y : PX.b); }
  pxAgent(g, w / 2, h * .7, w / 120, T, { talk: true, burst: true });
  pR(g, 3, h - 7, w - 6, 4, PX.r); pR(g, 3 + ((st * 2) % (w - 10)), h - 7, 4, 4, PX.y);
}
SU.c_holdSpiral = { mode: 'ill', f(q, p, a, T) {
  stripes('#e6e6d8', '#d9dccb', 120, -.62, 0, C.sage); cam(960, 540, lerp(1.04, 1, eo(p)));
  // the diagram's spiral as a room: chairs every 80 px along r = 150 + 36 θ, numbered from the phone outward;
  // the spiral turns slowly, so he (47, near the outer end) is carried round on the left without getting nearer
  const cx = 960, cy = 540, b0 = 130, bb = 50, NS = 50, seats = []; let th = 0;
  for (let n = 1; n <= NS; n++) { seats.push(th); th += 70 / (b0 + bb * th); }
  const rot = Math.PI - seats[46] + (T - 226.83) * .16, sp = (t) => [cx + Math.cos(t + rot) * (b0 + bb * t), cy + Math.sin(t + rot) * (b0 + bb * t) * .84];
  X.beginPath(); for (let i = -2; i < 14; i++) { X.moveTo(i * 160, -200); X.lineTo(i * 160 - 120, H + 200); X.moveTo(-200, i * 160 - 300); X.lineTo(W + 200, i * 160 - 380); } stroke(C.ink, 1, .12);
  ngoBurst(cx, cy, 100, 210, 24, rot * .2, '#d8c9a2', C.cream); iE(cx, cy, 212, 212 * .84, 0, C.ink, 2, .8, false);
  const pts = []; for (let t = -.4; t < seats[NS - 1] + .8; t += .03) pts.push(sp(t)); path(pts, C.orange, 5, .85, [16, 10]); const tip = sp(seats[NS - 1] + .8), tq = sp(seats[NS - 1] + .7); X.save(); X.translate(tip[0], tip[1]); X.rotate(Math.atan2(tip[1] - tq[1], tip[0] - tq[0])); X.beginPath(); X.moveTo(-16, -10); X.lineTo(0, 0); X.lineTo(-16, 10); stroke(C.orange, 5, .85); X.restore();
  // hold music rides the gap between the turns, outward
  for (let i = 0; i < 14; i++) { const t = ((T * .9 + i * .85) % (seats[NS - 1] - 1)) + .3, [x, y] = sp(t), [x2, y2] = sp(t + TAU), nx = lerp(x, x2, .5), ny = lerp(y, y2, .5); if (t + TAU > seats[NS - 1] + .6) continue; X.save(); X.translate(nx, ny); X.rotate(.2); fillP(PE(0, 0, 9, 7, -.4), C.teal); iline(8, 0, 8, -26, C.teal, 2, 1, false); if (i % 3 === 0) iline(8, -26, 16, -20, C.teal, 2, 1, false); X.restore(); }
  let me = null;
  seats.forEach((t, i) => { const n = i + 1, [x, y] = sp(t), ang = Math.atan2(cy - y, cx - x);
    if (n === 47) { me = [x, y, ang]; return; }
    c_topSeat(x, y, ang, { empty: (n * 7) % 11 === 0, coat: C_COATS[n % 8], hair: C_HAIR[n % 5] }); if (n % 5 === 0) lab(x + (cx - x) * .16, y + (cy - y) * .16 + 4, String(n), C.ink, .75, 13, 'center'); });
  const [hx, hy, ha] = me; fillP(PE(hx + 18, hy + 10, 70, 50), C.ink, .16);
  c_topSeat(hx, hy, ha, { coat: C.teal, hat: true });
  X.save(); X.translate(hx, hy); X.rotate(ha); const cs = PR(-30, 34, 60, 34); fillP(cs, '#9a5a34'); shade(cs, 0, 51, 40, [-6, -4], .8, 4); iBox(-30, 34, 60, 34, C.ink, 1.8); X.restore();
  for (let i = 0; i < 3; i++) gc(hx, hy, 56 + i * 18 + ((FD * 4) % 18), C.orange, .75, 2.2);
  c_big(hx + (cx - hx) * .14, hy + (cy - hy) * .14 + 10, '47', C.brick, 30); // draft 11: phone size
  cloud(hx - 30, hy - 120, .6, {});
  const scr = pixWorld('c_hold', 48, 95, (g, w, h) => c_pxHold(g, w, h, T));
  phoneBody(cx, cy, .62, 0, (w, h) => blitPix(scr, 0, 0, w, h));
  for (let i = 0; i < 3; i++) gc(cx, cy, 150 + i * 22 + ((FD * 5) % 22), C.teal, .5, 1.6);
  consC([[cx, cy, 620]]); consL([[0, cy, W, cy], [cx, 0, cx, H]]);
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
  path([[hx - 60, hy - 30], [bx + 60 * bs, by - 30 * bs]], C.orange, 2, .8, [10, 8]); c_big((hx + bx) / 2, Math.min(hy, by) - 60, 'REACH ' + (Math.round(lerp(1.2, 9.8, st) * 10) / 10).toFixed(1) + ' M', C.brick, 30); // draft 11: phone size
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
  bracket(1020, 236, dx - 120, 236, C.brick, .8); c_big((1020 + dx - 120) / 2, 214, Math.round(lerp(40, 95, eo(p))) + ' M AND RISING', C.brick, 28); // draft 11: phone size, inside the bracket's span
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
  { const rc = [end[0], end[1] + 70], hd = [500, 470], rl = Math.hypot(hd[0] - rc[0], hd[1] - rc[1]), b0 = [rc[0] + (hd[0] - rc[0]) / rl * 90, rc[1] + (hd[1] - rc[1]) / rl * 90], b1 = hd, an = Math.atan2(b1[1] - b0[1], b1[0] - b0[0]) + Math.PI, nx = Math.sin(an), ny = -Math.cos(an); bracket(b0[0], b0[1], b1[0], b1[1], C.brick, .85);
    X.save(); X.translate((b0[0] + b1[0]) / 2 + nx * 30, (b0[1] + b1[1]) / 2 + ny * 30); X.rotate(an); c_big(0, 0, Math.round(lerp(4, 22, gap)) + ' FT SHORT', C.brick, 28, 'center', 'middle'); X.restore(); } // draft 11: phone size
  for (let i = 0; i < 3; i++) gc(end[0], end[1] + 70, 100 + i * 26 + ((FD * 5) % 26), C.orange, .5, 1.6);
  consL([[0, 930, W, 930], [hx0, 0, hx0, H]]);
} };

// ---------- 242.3 after "help me out": the boarding stairs keep adding steps up into the sky; the plane climbs away off
// the top of them, and he climbs, and never gets nearer. The stairs follow the climb curve the next diagram draws. ----------
const C_PA = [300, 900], C_PB = [800, 860], C_PC = [1200, 400], C_PD = [1800, 200];
SU.c_stairs = { mode: 'ill', f(q, p, a, T) {
  stripes('#e6ece4', '#d3e1db', 150, -.62, T * 30, C.teal); cam(960, 540, lerp(1.04, 1, eo(p)));
  for (let i = 0; i < 4; i++) cloud(((i * 560 - T * 60) % (W + 600) + W + 600) % (W + 600) - 300, 70 + (i % 2) * 70, .42 + (i % 2) * .1, {});
  // the airfield, low
  const g = PR(-200, 960, W + 400, 300); fillP(g, '#cdbb8a'); hatch(g, 960, 1020, 1300, .05, 7, C.ink, .8, .4); iline(-200, 960, W + 200, 960, C.ink, 2.6);
  X.beginPath(); for (let i = 0; i < 12; i++) { const xx = ((i * 220 - T * 40) % 2640 + 2640) % 2640 - 360; X.moveTo(xx, 1010); X.lineTo(xx + 120, 1010); } stroke(C.cream, 6, .9);
  // the terminal low along the horizon, the control tower, a windsock blowing the wrong way
  const tm = PR(980, 880, 900, 80); fillP(tm, '#d8cfb8'); hatch(tm, 1430, 920, 500, .9, 8, C.ink, .8, .35); iBox(980, 880, 900, 80, C.ink, 2); X.beginPath(); for (let i = 0; i < 18; i++) { X.moveTo(1000 + i * 50, 896); X.lineTo(1000 + i * 50, 940); } stroke(C.ink, 3, .5);
  const tw = PP([[1690, 880], [1730, 880], [1722, 640], [1698, 640]]); fillP(tw, '#cfc6ae'); shade(tw, 1710, 760, 120, [-8, 0], .9, 5); iP([[1690, 880], [1730, 880], [1722, 640], [1698, 640]], true, C.ink, 2.2);
  const cab2 = PP([[1660, 640], [1760, 640], [1748, 590], [1672, 590]]); fillP(cab2, '#9fbcb8'); hatch(cab2, 1710, 615, 60, -.9, 8, C.cream, 3, .6); iP([[1660, 640], [1760, 640], [1748, 590], [1672, 590]], true, C.ink, 2.4); fillP(PR(1666, 572, 88, 18), '#a8553a'); iBox(1666, 572, 88, 18, C.ink, 2); iline(1710, 572, 1710, 530, C.ink, 2.4);
  iline(110, 960, 110, 760, C.ink, 3); const ws = PP([[110, 770], [110, 800], [40, 794 + Math.sin(T * 5) * 4], [40, 778 + Math.sin(T * 5) * 4]]); fillP(ws, C.orange); hatch(ws, 75, 786, 40, 1.57, 12, C.cream, 6, .9); iP([[110, 770], [110, 800], [40, 794], [40, 778]], true, C.ink, 2);
  // the stairs, built step by step along the curve; the top steps are still only drawn in construction line
  const tTop = lerp(.4, .5, snap(p, 8)), STEP = 46, P = []; let acc = 0, prev = bz(C_PA, C_PB, C_PC, C_PD, 0); P.push(prev);
  for (let i = 1; i <= 400; i++) { const t = i / 400 * tTop, pt = bz(C_PA, C_PB, C_PC, C_PD, t); acc += Math.hypot(pt[0] - prev[0], pt[1] - prev[1]); prev = pt; if (acc >= STEP) { P.push(pt); acc = 0; } }
  const n = P.length, fresh = 3;
  // stringer (side) under the steps, then treads and risers
  for (let i = 0; i + 1 < n; i++) { const [x1, y1] = P[i], [x2, y2] = P[i + 1], live = i < n - fresh - 1;
    const sq = PP([[x1, y1], [x2, y1], [x2, y1 + 60], [x1, y1 + 60]]); if (live) { fillP(sq, i % 2 ? '#e9e1cc' : '#dcd2b8'); hatch(sq, (x1 + x2) / 2, y1 + 30, 50, .9, 5, C.ink, .8, .45); fillP(PR(x1, y1 + 44, x2 - x1, 9), C.orange); iline(x1, y1 + 6, x2, y1 + 6, C.ink, 1, .5, false); }
    iP([[x1, y1], [x2, y1], [x2, y2]], false, C.ink, live ? 2.2 : 1, live ? 1 : .45, live); if (live) iline(x1, y1 + 60, x2, y2 + 60, C.ink, 2); }
  // the handrail and its posts
  X.beginPath(); for (let i = 0; i < n - fresh; i += 3) { X.moveTo(P[i][0] + 6, P[i][1]); X.lineTo(P[i][0] + 6, P[i][1] - 110); } stroke(C.ink, 2.6, .9);
  iP(P.slice(0, n - fresh).map(([x, y]) => [x + 6, y - 110]), false, C.ink, 3); iP(P.slice(0, n - fresh).map(([x, y]) => [x + 6, y - 56]), false, C.ink, 1.6, .7, false);
  // the truck the stairs stand on
  const tk = PR(150, 880, 360, 70); fillP(tk, C.ochre); shade(tk, 330, 915, 200, [-20, -6], .9, 5); iBox(150, 880, 360, 70, C.ink, 2.4); for (const wx of [210, 450]) { fillP(PE(wx, 958, 30, 30), '#2b1d14'); iE(wx, 958, 30, 30, 0, C.ink, 2.2); fillP(PE(wx, 958, 10, 10), '#8a8a82'); }
  const cbn = PR(150, 800, 110, 80); fillP(cbn, '#cfe0da'); hatch(cbn, 205, 840, 70, -.9, 9, C.cream, 3, .5); iBox(150, 800, 110, 80, C.ink, 2.2);
  // the plane, climbing away off the top; its door open
  const tp = lerp(.48, .68, eo(p)), [px, py] = bz(C_PA, C_PB, C_PC, C_PD, tp), [nx, ny] = bz(C_PA, C_PB, C_PC, C_PD, tp + .01), an = Math.atan2(ny - py, nx - px);
  const tr = []; for (let t = Math.max(tTop + .03, tp - .3); t < tp - .05; t += .01) tr.push(bz(C_PA, C_PB, C_PC, C_PD, t));
  if (tr.length > 1) { path(tr.map(([x, y]) => [x, y - 18]), C.cream, 14, .8); path(tr.map(([x, y]) => [x, y - 18]), C.ink, 1, .3, [4, 8]); }
  plane(px, py, .95, an);
  X.save(); X.translate(px, py); X.rotate(an); fillP(PR(-200 * .95, -30 * .95, 22 * .95, 46 * .95), '#2b1d14'); iBox(-200 * .95, -30 * .95, 22 * .95, 46 * .95, C.ink, 1.6); X.restore();
  // the gap, as a dotted guide from the top step to the door
  const top = P[n - 1]; path([[top[0], top[1] - 40], [px - Math.cos(an) * 180, py - Math.sin(an) * 180]], C.orange, 2.4, .9, [10, 8]);
  // him, a step at a time, case in hand, cloud over him
  const ti = Math.min(n - fresh - 2, 6 + Math.floor(p * 8)), [mx, my] = P[ti];
  traveller(mx + 14, my, 1.1, { look: 1, legs: (FD >> 1) % 2 ? .9 : -.6, case: true, armL: [.3, -.3] }); cloud(mx + 14, my - 500, .6, { rain: true });
  for (let i = 0; i < 3; i++) gc(px, py, 120 + i * 30 + ((FD * 5) % 30), C.teal, .4, 1.6);
  consL([[0, 960, W, 960], [C_PA[0], C_PA[1], C_PD[0], C_PD[1]]]);
} };

// ---------- 247.3 "I'm watching this movie": the rows keep multiplying and the screen keeps backing off ----------
function c_backView(x, y, s, noHat) { // him from behind in a seat: hat, back of head, shoulders
  X.save(); X.translate(x, y); X.scale(s, s); const k = 1 / s;
  const sh = [[-90, 0], [-80, -60], [-36, -84], [36, -84], [80, -60], [90, 0]]; fillP(PP(sh), C.teal); shade(PP(sh), 0, -40, 100, [16, -6], .9, 5 * k); iP(dens(sh, 20), false, C.ink, 2.4 * k);
  const hd = PE(0, -118, 30, 36); fillP(hd, '#efd9b9'); X.save(); X.clip(hd); fillP(PR(-40, -150, 80, 46), '#4a3a2e'); hatch(PR(-40, -150, 80, 46), 0, -128, 40, .3, 3 * k, C.ink, .9 * k, .7); X.restore(); iE(0, -118, 30, 36, 0, C.ink, 2.2 * k);
  for (const ex of [-31, 31]) { fillP(PE(ex, -114, 6, 11), '#efd9b9'); iE(ex, -114, 6, 11, 0, C.ink, 1.6 * k); }
  X.restore(); if (!noHat) c_hat(x, y - 140 * s, s);
}
// the movie: the flight he missed, climbing away on an old sepia print; then the sun comes up on the film where the
// beach's sun will be (screen-relative .74, .3, as in mvu_cinema), so the film he climbs into is already rising
function c_filmSky(sx, sy, sw, sh, zs, p, T) {
  const k = sw / 860;
  fillP(PR(sx - 20, sy - 20, sw + 40, sh + 40), '#efe4cc'); hatch(PR(sx - 20, sy - 20, sw + 40, sh + 40), sx + sw / 2, sy + sh / 2, sw, -.9, 12 * k, '#b89a6a', 1.2, .45);
  const gl2 = eo(seg(p, .4, 1)); if (gl2 > 0) { const r0 = 64 * k * gl2, cx = sx + sw * .74, cy = sy + sh * (.42 - .12 * gl2); sunIll(cx, cy, r0, '#e8c27a'); }
  const hz = sy + sh * .8, fd = PR(sx - 20, hz, sw + 40, sh * .2 + 20); fillP(fd, '#d8c49c'); hatch(fd, sx + sw / 2, hz + sh * .1, sw, .05, 6 * k, C.ink, .8, .4); iline(sx - 20, hz, sx + sw + 20, hz, C.ink, 1.6);
  for (let i = 0; i < 3; i++) { const cx = sx + sw * ((i * .37 + .1 + T * .01) % 1), cy = sy + sh * (.18 + i * .16); const cl2 = new Path2D(); for (const [dx, r] of [[-30, 22], [0, 30], [32, 20]]) cl2.addPath(PE(cx + dx * k, cy, r * k, r * .7 * k)); fillP(cl2, '#d9c8a6'); hatch(cl2, cx, cy, 60 * k, .6, 4 * k, C.ink, .7, .45); }
  plane(sx + sw * lerp(.12, .6, p), sy + sh * lerp(.66, .36, p), .36 * k, -.32);
}
SU.c_seatsStretch = { mode: 'ill', f(q, p, a, T) {
  stripes('#dccbbf', '#cdb6a8', 140, -.62, 0, C.plum); cam(960, 540, 1);
  const zs = lerp(1, .5, eo(p)), sw = 860 * zs, sh = 470 * zs, sx = 960 - sw / 2, sy = 300 - sh / 2;
  fillP(PR(sx - 60 * zs, sy - 50 * zs, 60 * zs, sh + 100 * zs), '#7a2a3a'); fillP(PR(sx + sw, sy - 50 * zs, 60 * zs, sh + 100 * zs), '#7a2a3a');
  hatch(PR(sx - 60 * zs, sy - 50 * zs, 60 * zs, sh + 100 * zs), sx - 30 * zs, sy + sh / 2, sh, 1.57, 7, C.ink, 1, .55); hatch(PR(sx + sw, sy - 50 * zs, 60 * zs, sh + 100 * zs), sx + sw + 30 * zs, sy + sh / 2, sh, 1.57, 7, C.ink, 1, .55);
  filmScreen(sx, sy, sw, sh, T, () => c_filmSky(sx, sy, sw, sh, zs, p, T), { tone: 'sepia' }); hatch(PR(sx, sy, sw, sh), 960, sy + sh / 2, sw, .7, 14, C.cream, 3, .3); iBox(sx, sy, sw, sh, C.ink, 3);
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

// ---------- 268.78-276.0 "but the crooks are real", one continuous shot, square-on to the screen (no seats).
// The movie is an old silver print now: three crooks on a night street. On "crooks" the outer two step
// out of the film and are drawn men, standing either side of him like brackets; on "real" the middle one's arm comes
// out of the screen and lifts his hat. Then it lets go, and the hat drops back onto his head (into act D he has it).
// One costume on screen and off: dark pinstripe coat, black hat, a bandit's mask. ----------
const C_CROOK = '#4a3a34', C_CROOK2 = '#3b2e29';
function c_darkHat(x, y, s, rot = 0) { // a crook's fedora, brim centre at (x,y)
  X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s); const k = 1 / s;
  const hb = PE(0, 0, 46, 8); fillP(hb, '#1f1a18'); iE(0, 0, 46, 8, 0, C.ink, 2 * k);
  const cr = [[-26, 0], [-22, -34], [0, -28], [22, -34], [26, 0]]; fillP(PP(cr), '#2b2420'); hatch(PP(cr), 0, -15, 34, .7, 4 * k, C.cream, .8 * k, .3, [6, -4]); iP(cr, true, C.ink, 2 * k);
  X.beginPath(); wP([[-25, -8], [25, -8]], false, .4 * k); stroke('#0f0c0b', 4 * k, 1); X.restore();
}
function c_crook(x, y, s, o = {}) { // the traveller's build in the crooks' costume (never his teal coat or brown hat)
  traveller(x, y, s, { hat: false, coat: C_CROOK, sleeve: C_CROOK2, trouser: '#2b2420', look: o.look || 0, legs: o.legs ?? null, armR: o.armR, armL: o.armL, handTo: o.handTo, flip: o.flip, case: false });
  const fl = o.flip ? -1 : 1, lk = (o.look || 0) * 6;
  X.save(); X.translate(x, y); X.scale(fl * s, s); const k = 1 / s;
  const cp = PP([[-34, -276], [34, -276], [46, -130], [50, -118], [-50, -118], [-46, -130]]); X.save(); X.clip(cp); X.beginPath(); for (let i = -6; i <= 6; i++) { X.moveTo(i * 9, -280); X.lineTo(i * 9 * 1.25, -110); } stroke(C.cream, 1.1 * k, .55); X.restore();
  const mk = PP([[lk - 30, -318], [lk + 30, -318], [lk + 27, -302], [lk - 27, -302]]); fillP(mk, '#16110f'); for (const ex of [-9, 9]) fillP(PE(lk + ex + lk * .4, -310, 3.4, 3), C.cream);
  X.restore(); c_darkHat(x + fl * lk * s, y - 330 * s, s);
}
// the movie behind them: a night street on a silver print, square to the screen (Von Ulrich's frontal emblem framing:
// the moon centred over the middle crook, the street running straight back between mirrored buildings, a lamp each side)
function c_noirStreet(sx, sy, sw, sh, T, gone, reach) {
  const cx = sx + sw / 2, hz = sy + sh * .64, k = sw / 1320;
  const sky = PR(sx - 20, sy - 20, sw + 40, hz - sy + 20); fillP(sky, '#3b3632'); hatch(sky, cx, sy + sh * .3, sw * .7, .7, 9 * k, C.ink, 1, .55); hatch(sky, cx, sy + sh * .3, sw * .7, -.7, 12 * k, C.ink, .9, .35);
  const my = sy + sh * .17; fillP(PE(cx, my, 54 * k, 54 * k), '#ece6d6'); hatch(PE(cx, my, 54 * k, 54 * k), cx, my, 54 * k, .8, 5 * k, C.ink, .9, .5, [16 * k, -10 * k]); iE(cx, my, 54 * k, 54 * k, 0, C.ink, 2);
  for (let i = 0; i < 3; i++) gc(cx, my, 80 * k + i * 26 * k, '#ece6d6', .35 - i * .1, 1.6);
  // the buildings, mirrored about the centre line, with a few lit windows that change on the beat of the drawings
  for (const sd of [-1, 1]) for (let i = 0; i < 5; i++) { const bw = 132 * k, x0 = cx + sd * (110 * k + i * bw) - (sd < 0 ? bw : 0), bh = sh * (.2 + ((i * 37) % 5) * .055 + i * .03), y0 = hz - bh, bp = PR(x0, y0, bw - 6 * k, bh);
    fillP(bp, i % 2 ? '#57504a' : '#4a443f'); hatch(bp, x0 + bw / 2, y0 + bh / 2, bh, sd * .9, 6 * k, C.ink, .9, .5, [sd * 14 * k, 0]); iP(dens([[x0, hz], [x0, y0], [x0 + bw - 6 * k, y0], [x0 + bw - 6 * k, hz]], 30), false, C.ink, 1.6);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) { const wy = y0 + 14 * k + r * 26 * k; if (wy > hz - 18 * k) continue; if ((i * 7 + r * 3 + c + (sd > 0 ? 1 : 0) + (FD >> 4)) % 4 === 0) fillP(PR(x0 + 16 * k + c * 36 * k, wy, 16 * k, 14 * k), '#efe4c8', .9); } }
  // the street, one-point, straight back to the centre
  const st = PP([[cx - 26 * k, hz], [cx + 26 * k, hz], [sx + sw + 200, sy + sh + 20], [sx - 200, sy + sh + 20]]); fillP(st, '#6b645c'); hatch(st, cx, sy + sh * .85, sw * .6, .03, 6 * k, C.ink, .8, .4);
  const pv = PR(sx - 20, hz, sw + 40, sy + sh - hz + 20); X.save(); X.clip(pv); for (const sd of [-1, 1]) { const sw2 = PP([[cx + sd * 26 * k, hz], [cx + sd * 60 * k, hz], [cx + sd * (sw * .5 + 260), sy + sh + 20], [cx + sd * (sw * .5 + 200), sy + sh + 20]]); fillP(sw2, '#8a8278'); hatch(sw2, cx + sd * sw * .3, sy + sh * .85, sw * .4, sd * 1.2, 7 * k, C.ink, .8, .4); } X.restore();
  iline(cx - 26 * k, hz, sx - 200, sy + sh + 20, C.ink, 1.8); iline(cx + 26 * k, hz, sx + sw + 200, sy + sh + 20, C.ink, 1.8);
  for (let i = 0; i < 6; i++) { const t = Math.pow((i + ((T * .8) % 1)) / 6, 2), y2 = lerp(hz, sy + sh, t), w2 = lerp(2, 18, t) * k; fillP(PR(cx - w2 / 2, y2, w2, lerp(3, 30, t) * k), '#d9d2c2', .8); }
  // a lamp each side, its light a hatched cone (no gradient)
  for (const sd of [-1, 1]) { const lx = cx + sd * sw * .4, ly = sy + sh * .3; iline(lx, ly, lx, sy + sh * .92, C.ink, 4); fillP(PE(lx, ly, 14 * k, 10 * k), '#f3ecd8'); iE(lx, ly, 14 * k, 10 * k, 0, C.ink, 1.6);
    const cone = PP([[lx - 10 * k, ly + 8 * k], [lx + 10 * k, ly + 8 * k], [lx + 120 * k, sy + sh * .92], [lx - 120 * k, sy + sh * .92]]); fillP(cone, '#efe6cf', .22); hatch(cone, lx, sy + sh * .6, sh * .4, 1.57, 8 * k, '#efe6cf', 1, .35); }
  // the three of them on the print; the outer two leave it (they are drawn men in the room now), the middle one reaches out
  const fy = sy + sh * .9; if (!gone[0]) c_crook(sx + sw * .28, fy, 1.15); if (!gone[1]) c_crook(sx + sw * .72, fy, 1.15);
  c_crook(cx, fy, 1.15); // his hanging hand is where the drawn arm comes out of the screen (ox, oy below)
}
SU.c_crookReal = { mode: 'ill', f(q, p, a, T) {
  stripes('#e2d2c4', '#d4bfae', 140, -.62, 0, C.plum); cam(960, 540, lerp(1, 1.03, eo(p)));
  const sx = 300, sy = 40, sw = 1320, sh = 660;
  for (const cx0 of [sx - 80, sx + sw]) { const cu = PR(cx0, sy - 80, 80, sh + 150); fillP(cu, '#7a2a3a'); hatch(cu, cx0 + 40, sy + sh / 2, sh, 1.57, 8, C.ink, 1, .5); X.beginPath(); for (let i = 1; i < 4; i++) { X.moveTo(cx0 + i * 20, sy - 80); X.lineTo(cx0 + i * 20 + Math.sin(i) * 6, sy + sh + 70); } stroke(C.ink, 1.4, .6); }
  const stg = PR(-200, sy + sh, W + 400, 80); fillP(stg, '#5a3a22'); hatch(stg, 960, sy + sh + 40, 1200, .05, 6, C.ink, .9, .5); iline(-200, sy + sh + 80, W + 200, sy + sh + 80, C.ink, 2.4);
  // draft 11: the room's floor, so the two who step out stand on something (draft 10's legs ran off the bottom)
  const FLY = 1010, flr = PR(-200, FLY, W + 400, 400); fillP(flr, '#b08a68'); hatch(flr, 960, FLY + 120, 1300, .04, 7, C.ink, .8, .4);
  X.beginPath(); for (let i = -12; i <= 12; i++) { X.moveTo(960 + i * 70, FLY); X.lineTo(960 + i * 260, FLY + 400); } stroke(C.ink, 1, .3); iline(-200, FLY, W + 200, FLY, C.ink, 2.6);
  c_big(1270, sy + sh + 52, 'NOT IN THE PICTURE', C.cream, 28, 'center', 'alphabetic', .9); // draft 11: phone size, on the stage lip
  const e1 = eo(seg(T, 270.42, 271.05)), e2 = eo(seg(T, 270.74, 271.37)), reach = eo(seg(T, 271.8, 272.45)), lift = eo(seg(T, 272.45, 273.15)), back = eo(seg(T, 274.8, 275.9)); // assembler: the crook KEEPS the hat and pulls it back into the screen; act D drops it back onto his head on camera at ~278
  const armOut = T >= 271.8 && back < 1;
  filmScreen(sx, sy, sw, sh, T, () => c_noirStreet(sx, sy, sw, sh, T, [e1 > 0, e2 > 0], armOut), { tone: 'silver', cue: [[275.5, 275.75]] }); iBox(sx, sy, sw, sh, C.ink, 4);
  for (let i = 0; i < 3; i++) gc(960, sy + sh / 2, 700 + i * 40 + ((FD * 6) % 40), C.orange, .3, 1.6, null, Math.PI * 1.1, Math.PI * 1.9);
  // the two that step out, drawn now, growing as they come forward to flank him
  const fy0 = sy + sh * .9;
  for (const [e, side, x0] of [[e1, -1, sx + sw * .28], [e2, 1, sx + sw * .72]]) { if (e <= 0) continue;
    if (e < .6) for (let i = 0; i < 4; i++) iE(x0, fy0 - 210, 90 + i * 34 + e * 120, 230 + i * 30 + e * 120, 0, i % 2 ? C.orange : C.ink, 1.8, (.8 - i * .15) * (1 - e / .6), false);
    // draft 11: they land on the floor line, feet in shot; legs driven by the distance walked (no skating); the left
    // one walks left, so he is drawn facing left. Through the hold they tip their own hats, then turn to face us.
    const cx1 = lerp(x0, 960 + side * 560, e), cy1 = lerp(fy0, FLY + 6, e), cs = lerp(1.15, 1.5, e), wdist = Math.hypot(cx1 - x0, (cy1 - fy0) * .5);
    const tip = eio(seg(T, 273.2, 274.1)) * (1 - eio(seg(T, 274.7, 275.5))), lookE = lerp(-1, -.15, eio(seg(T, 275.15, 275.95)));
    if (e > .5) fillP(PE(cx1 + side * 10, cy1 + 4, 70 * cs, 9 * cs), C.ink, .22 * seg(e, .5, 1));
    c_crook(cx1, cy1, cs, { look: lookE, flip: side < 0, legs: e < 1 ? c_stride(wdist, cs, 60 * cs) : null, armL: [.2, -.1], armR: [-.1, .2], handTo: tip > .01 ? [lerp(25.6, 32, tip), lerp(-126.6, -326, tip)] : undefined }); }
  // him from behind, front and centre
  c_backView(960, 1150, 2.5, true); cloud(700, 690, .42, { rain: true });
  // the middle crook's arm: out through the screen, down to the hat, up with it, then back in without it
  const ox = 990, oy = 486, onHead = [960, 800], up = [1015, 560];
  // draft 11: no dead hold once the hat is up: the hand keeps drawing it slowly toward the screen, turning it over
  const creep = eio(seg(T, 273.15, 274.8)), up2 = [1050, 512], sway = Math.sin(T * 3.1) * creep * (1 - back);
  const held = [lerp(up[0], up2[0], creep) + sway * 6, lerp(up[1], up2[1], creep) + sway * 3];
  let hand = [ox, oy]; if (armOut) { if (T < 272.45) hand = [lerp(ox, onHead[0] + 10, reach), lerp(oy, onHead[1] - 40, reach)]; else if (T < 274.8) hand = [lerp(onHead[0] + 10, held[0], lift), lerp(onHead[1] - 40, held[1], lift)]; else hand = [lerp(held[0], ox, back), lerp(held[1], oy, back)]; }
  if (armOut && Math.hypot(hand[0] - ox, hand[1] - oy) > 8) {
    const el = [lerp(ox, hand[0], .5) + 110, lerp(oy, hand[1], .5) - 10];
    for (let i = 0; i < 4; i++) iE(ox, oy, 26 + i * 22 + ((FD * 3) % 22), 18 + i * 14, -.2, i % 2 ? C.orange : C.ink, 1.8, .85 - i * .15, false);
    limb([[ox, oy], el, hand], 30, {}, 1, C_CROOK);
    X.beginPath(); for (let k2 = -2; k2 <= 2; k2++) { X.moveTo(ox + k2 * 5, oy + k2 * 2); X.lineTo(el[0] + k2 * 5, el[1] + k2 * 2); X.moveTo(el[0] + k2 * 5, el[1] + k2 * 2); X.lineTo(hand[0] + k2 * 4, hand[1] + k2 * 2); } stroke(C.cream, 1.1, .55);
    const ca = Math.atan2(hand[1] - el[1], hand[0] - el[0]); fillP(PE(hand[0], hand[1], 20, 14, ca), C_WHITE); iE(hand[0], hand[1], 20, 14, ca, C.ink, 2);
  }
  // the hat: on him; lifted; held; dropped back
  let hx = onHead[0], hy = onHead[1], hr = 0;
  if (T >= 272.2) { hx = hand[0] - 10; hy = hand[1] + 40; hr = -.25 * lift - .4 * creep + .08 * sway; }
  if (back < .97) c_hat(hx, hy, 2.5 * (1 - .5 * back), hr);
  if (armOut && T >= 272.2 && back < .97) { fillP(PE(hand[0] + 6, hand[1] - 6, 26, 20), '#e7c9a2'); iE(hand[0] + 6, hand[1] - 6, 26, 20, 0, C.ink, 2); }
  if (T >= 272.2 && T < 275.3) { X.setLineDash([3, 10]); X.beginPath(); X.moveTo(960, 760); X.quadraticCurveTo(1100, 700, hx + 20, hy + 20); stroke(C.orange, 3, .9); X.setLineDash([]); }
  consL([[0, sy + sh, W, sy + sh], [960, 0, 960, H]]);
} };

// ---------- cut list ----------
var CUTS_C = [
  [188.7, 'c_dinerLift', {}],                 // "took him to hospitals": the floor carries him into the corridor; the camera follows in
  [195.12, 'c_shadowStay', {}],               // "against his will": his shadow stays sitting at the diner door
  [199.38, 'sWard', {}],                      // admission, consent not given
  [203.34, 'c_profile', {}],                  // "now they fry": the machine's pad comes down to his temple
  [206.43, 'sHead', {}],                      // "brain" (nudged onto its onset)
  [209.28, 'c_pills', {}],                    // "take their pills": two hands bracket the bottle
  [211.34, 'c_sDose', {}],                    // the dosage calendar
  [213.7, 'c_windowRoom', {}],                // still man; the camera goes through window after window
  [220.54, 'c_corridorLoop', {}],             // chorus 2: on hold in the loop
  [223.38, 'c_sQueue', {}],                   // the queue spiral
  [225.5, 'c_holdSpiral', {}],                // the spiral is a waiting room; she is a pixel voice in the phone at its centre
  [228.16, 'c_bellFar', {}],                  // "agent": the counter lengthens
  [231.0, 'sPassport', { n: 2 }],
  [234.06, 'c_holdSky', {}, POST.holdPhone],  // "help me out"
  [239.3, 'c_lifebuoy', {}],
  [242.3, 'c_stairs', {}],                    // the boarding stairs keep growing; the plane climbs away
  [244.9, 'sPlaneW', {}],
  [247.3, 'c_seatsStretch', {}],              // "I'm watching this movie": the film is the plane he missed; the sun comes up on the print
  [250.02, 'sProjector', {}],                 // "movie" (nudged onto its onset)
  [252.02, 'mvu_cinema', {}],                 // LOCKED
  [256.7, 'c_reelSpill', {}],
  [262.64, 'f_heroFlat', {}],
  [266.7, 'sFilm', {}],
  [268.78, 'c_crookReal', {}],                // one continuous shot to 276.0: crooks on film step out of the screen as drawn men; the hat comes back
];

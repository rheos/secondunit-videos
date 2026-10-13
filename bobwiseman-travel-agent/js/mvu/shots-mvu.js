// Draft 6 look test: Mark Von Ulrich as guest art director (MVU-DIRECTION.md). Five shots in their real song slots.
// Outside screens: the Kevin Ngo hand, with his THINKING (frontal emblem framing, device-as-body, nesting, bursts).
// Inside screens: the pixel world (pixel.js). Schematics never pixelated.
'use strict';

// a radiating burst drawn in the Ngo hand: ink outlines, hatching, muted palette
function ngoBurst(cx, cy, r0, r1, n, rot, c1, c2) {
  for (let i = 0; i < n; i++) {
    const a0 = rot + i / n * TAU, a1 = rot + (i + .5) / n * TAU, a2 = rot + (i + 1) / n * TAU;
    const pts = [[cx + Math.cos(a0) * r0, cy + Math.sin(a0) * r0], [cx + Math.cos(a1) * r1, cy + Math.sin(a1) * r1], [cx + Math.cos(a2) * r0, cy + Math.sin(a2) * r0]];
    const sp = PP(pts); fillP(sp, i % 2 ? c2 : c1); hatch(sp, (pts[0][0] + pts[1][0] + pts[2][0]) / 3, (pts[0][1] + pts[1][1] + pts[2][1]) / 3, r1 * .6, a1 + 1.4, 6, C.ink, .9, .45); iP(pts, true, C.ink, 2, 1, false, .8);
  }
}
function handPair(cx, y, gap, s, rot = .25) { for (const sx of [-1, 1]) { X.save(); X.translate(cx + sx * gap, y); X.scale(sx, 1); hand(0, 0, s, -rot); X.restore(); } }

// ---------- 107.8 "help me quick": his face IS the payphone dial ----------
SU.mvu_dialFace = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#ead2a8', 130, -.62, 0, C.ochre); cam(960, 480, lerp(.98, 1.05, eo(p)));
  ngoBurst(960, 430, 300, 560, 28, pxStep(T, 6) * .04, '#d99a52', C.cream);
  const sh = [[260, H + 60], [420, 860], [780, 770], [1140, 770], [1500, 860], [1660, H + 60]], shp = PP(sh); fillP(shp, C.teal); shade(shp, 960, 950, 800, [120, -20], .9, 7); iP(dens(sh, 40), false, C.ink, 4);
  iP([[870, 770], [930, 900], [960, H + 40]], false, C.ink, 3); iP([[1050, 770], [990, 900], [960, H + 40]], false, C.ink, 3);
  // the dial face
  const fx = 960, fy = 440, R0 = 240, hp = PE(fx, fy, R0, R0); fillP(hp, '#e8dcc0'); hatch(hp, fx, fy, R0, .6, 6, C.ink, 1, .5, [50, -40]); iE(fx, fy, R0, R0, 0, C.ink, 4);
  const spin = T >= 109.0 ? -(pxStep(T - 109.0, 12) * .35) : -eo(seg(p, .0, .45)) * .9;
  for (let i = 0; i < 10; i++) {
    const an = -Math.PI * .5 - .55 - i * .5 + spin, hx = fx + Math.cos(an) * 160, hy = fy + Math.sin(an) * 160, hole = PE(hx, hy, 42, 42);
    fillP(hole, '#2b2420'); iE(hx, hy, 42, 42, 0, C.ink, 3);
    if (i === 0 || i === 9) { fillP(PE(hx, hy, 18, 18), C.cream); fillP(PE(hx + Math.cos(T * 3) * 5, hy + 4, 8, 8), C.ink); } // two holes are his eyes
    else lab(hx, hy + 2, String((i + 1) % 10), '#6b5a48', .9, 20, 'center', 'middle', 'bold');
  }
  const cp = PE(fx, fy, 80, 80); fillP(cp, C.cream); iE(fx, fy, 80, 80, 0, C.ink, 3); fillP(PR(fx - 30, fy + 18, 60, 8), C.ink); // the centre plate is his mouth
  iline(fx + 150, fy + 150, fx + 210, fy + 90, '#8a8a8a', 10, 1, false); // finger stop
  // fedora on top
  const brim = PE(fx, fy - 238, 330, 46); fillP(brim, '#3d2a1f'); iE(fx, fy - 238, 330, 46, 0, C.ink, 4);
  const cr = [[800, fy - 238], [830, fy - 400], [960, fy - 372], [1090, fy - 400], [1120, fy - 238]], crp = PP(cr); fillP(crp, '#4b3426'); shade(crp, 960, fy - 320, 200, [30, -20], .7, 6); iP(cr, true, C.ink, 4); iline(810, fy - 268, 1110, fy - 268, C.ochre, 16, 1, false);
  // handset at his ear (left), finger dialling (right): hands as brackets
  const hs = [[fx - 290, fy - 120], [fx - 250, fy - 150], [fx - 230, fy + 170], [fx - 270, fy + 190]]; fillP(PP(hs), '#2b2420'); iP(hs, true, C.ink, 3);
  X.beginPath(); for (let i = 0; i <= 80; i++) { const t2 = i / 80; X.lineTo(lerp(fx - 255, 380, t2) + Math.cos(i * 1.3) * 16, lerp(fy + 190, H + 40, t2) + Math.sin(i * 1.3) * 16); } stroke(C.ink, 3, 1);
  limb([[1400, H + 40], [1300, 820], [fx + 120, fy + 70]], 26, {}, 1, '#3a7a76'); fillP(PE(fx + 120, fy + 70, 26, 26), '#efd9b9'); iE(fx + 120, fy + 70, 26, 26, 0, C.ink, 3);
  cloud(330, 170, 1, { rain: true });
  if (T >= 109.0) for (let i = 0; i < 3; i++) gc(fx, fy, 270 + i * 40 + ((FD * 9) % 40), C.orange, .8, 3, null, -1.2, 1.2);
  consC([[fx, fy, 330]]); consL([[0, fy, W, fy], [fx, 0, fx, H]]);
} };

// ---------- 252.02 the cinema screen opens onto the pixel world; he climbs in and turns to pixels ----------
SU.mvu_cinema = { mode: 'ill', f(q, p, a, T) {
  stripes('#e2d2c4', '#d4bfae', 140, -.62, 0, C.plum); cam(1180, 520, lerp(1.12, 1.2, eo(p)));
  const sx = 860, sy = 120, sw = 840, sh = 480, PW = 210, PH = 120;
  fillP(PR(sx - 50, sy - 50, 50, sh + 100), '#7a2a3a'); fillP(PR(sx + sw, sy - 50, 50, sh + 100), '#7a2a3a');
  hatch(PR(sx - 50, sy - 50, 50, sh + 100), sx - 25, sy + sh / 2, 320, 1.57, 8, C.ink, 1, .5); hatch(PR(sx + sw, sy - 50, 50, sh + 100), sx + sw + 25, sy + sh / 2, 320, 1.57, 8, C.ink, 1, .5);
  // his path: up over the seat backs, head first through the bottom edge of the screen, then on into the world
  const u = eo(cl(p * 1.15)), x = lerp(760, 1180, u), y = lerp(980, sy + sh * .9, u), s = lerp(1.0, .62, u);
  const px = (x - sx) / sw * PW, py = (y - sy) / sh * PH, ps = 365 * s / 280;
  const world = pixWorld('cine', PW, PH, (g, w, h) => { pxBeach(g, w, h, T); if (y - 360 * s < sy + sh) pxTraveller(g, px, py, ps, T, { walk: true, case: true, cloud: false }); });
  blitPix(world, sx, sy, sw, sh); iBox(sx, sy, sw, sh, C.ink, 4);
  for (let r2 = 0; r2 < 2; r2++) for (let i = 0; i < 9; i++) { const x2 = 420 + i * 200 + r2 * 60, y2 = 700 + r2 * 120, st = PP([[x2, y2], [x2 + 170, y2], [x2 + 180, y2 + 140], [x2 - 10, y2 + 140]]); fillP(st, '#8a3a3a'); shade(st, x2 + 85, y2 + 70, 110, [10, -10], .8, 5); iP([[x2, y2], [x2 + 170, y2], [x2 + 180, y2 + 140], [x2 - 10, y2 + 140]], true, C.ink, 2); }
  // the Ngo part of him is whatever is still on this side of the screen
  X.save(); const outside = new Path2D(); outside.rect(-W, -H, 3 * W, 3 * H); outside.rect(sx, sy, sw, sh); X.clip(outside, 'evenodd');
  traveller(x, y, s, { look: 1, legs: walkPh(), case: true, mouth: 0 }); X.restore();
  if (u < .98) for (let i = 0; i < 3; i++) gc(x, sy + sh, 40 + i * 30 + ((FD * 6) % 30), C.orange, .8, 2, null, Math.PI, TAU);
  cloud(x - 40, Math.min(y - 470 * s, sy - 60), .5, { rain: true });
  for (let i = 0; i < 26; i++) { const t2 = i / 25; X.beginPath(); X.moveTo(240, 240); X.lineTo(sx, sy + t2 * sh); stroke(C.cream, 2, .25); }
  consL([[0, sy + sh, W, sy + sh], [sx, 0, sx, H]]);
} };

// ---------- 293.72 chorus 3, the agent is the app: frontal emblem, his two hands bracketing the phone ----------
SU.mvu_app = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e2d6e8', 130, -.62, 0, C.plum); cam(960, 540, lerp(1, 1.05, eo(p)));
  ngoBurst(960, 470, 340, 620, 32, pxStep(T, 6) * .03, '#c9a0b4', C.cream);
  const app = pixWorld('app', 64, 126, (g, w, h) => pxApp(g, w, h, T));
  phoneBody(960, 500, 1.72, 0, (w, h) => blitPix(app, 0, 0, w, h));
  handPair(960, 850, 240, 1.05, .35);
  const tp = eo(seg(p, .55, .9)); limb([[1500, H + 80], [1300, 960], [lerp(1260, 1010, tp), lerp(900, 790, tp)]], 30, {}, 1, '#e7c9a2');
  cloud(300, 220, .95, { rain: true });
  consC([[960, 470, 520]]); consL([[0, 470, W, 470], [960, 0, 960, H]]);
} };

// ---------- 302.6 the field-guide chart: one face, one part changed per state (schematic, never pixelated) ----------
const MVU_STATES = ['BLUES', 'ON HOLD', 'BOOKED', 'CAGED', 'SNOW'];
SU.mvu_sChart = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.06, 1, eo(p)));
  graticule(960, 540, 1900, 1100, 40, C.lav, .06);
  lab(960, 170, 'THE TRAVELLER · FIVE STATES', C.white, .95, 22, 'center', 'alphabetic', 'bold'); gl(360, 200, 1560, 200, C.lav, .5, 1.2);
  MVU_STATES.forEach((name, i) => {
    const v = seg(p, i * .12, i * .12 + .18); if (v <= 0) return;
    const cx = 300 + i * 330, cy = 520, hot = i === 2, col = hot ? C.mag : C.cyan;
    X.save(); X.globalAlpha = eo(v);
    gc(cx, cy, 150, C.lav, .25, 1, [3, 6]); ticks(cx, cy, 152, 48, 5, C.lav, .35, 1, 6);
    iE(cx, cy, 90, 108, 0, C.lav, 1.6, .9, false, .3); stip(PE(cx, cy, 90, 108), cx, cy, 110, 260, C.lav, .35, 1.3, [1, .4], .4);
    X.beginPath(); X.ellipse(cx, cy - 104, 128, 16, 0, 0, TAU); X.rect(cx - 70, cy - 170, 140, 66); stroke(C.lav, 1.3, .85);
    if (i === 0) { for (const [dx, r] of [[-50, 40], [0, 55], [50, 40]]) gc(cx + dx, cy - 250, r, col, .95, 1.6); X.beginPath(); for (let k = 0; k < 8; k++) { X.moveTo(cx - 60 + k * 17, cy - 210); X.lineTo(cx - 66 + k * 17, cy - 180); } stroke(col, 1.2, .9); }
    if (i === 1) { for (const ex2 of [-32, 32]) { X.beginPath(); for (let k = 0; k < 40; k++) { const th = k / 40 * 4 * Math.PI, r = 2 + k * .45; k ? X.lineTo(cx + ex2 + Math.cos(th + T * 4) * r, cy - 10 + Math.sin(th + T * 4) * r) : X.moveTo(cx + ex2, cy - 10); } stroke(col, 1.4, .95); } }
    else if (i !== 3 && i !== 4) for (const ex2 of [-32, 32]) star(cx + ex2, cy - 10, 3, C.white, .9);
    if (i === 2) { X.strokeStyle = col; X.lineWidth = 1.6; X.strokeRect(cx - 70, cy - 132, 140, 22); lab(cx, cy - 116, 'TOUR', col, .95, 12, 'center'); for (const ex2 of [-32, 32]) { gc(cx + ex2, cy - 10, 14, col, .95, 1.6); gl(cx + ex2 - 9, cy - 19, cx + ex2 + 9, cy - 1, col, .95, 1.4); } }
    if (i === 3) { for (const ex2 of [-32, 32]) star(cx + ex2, cy - 10, 3, C.white, .9); X.save(); X.beginPath(); X.ellipse(cx, cy, 90, 108, 0, 0, TAU); X.clip(); X.beginPath(); for (let k = -4; k <= 4; k++) { X.moveTo(cx + k * 22, cy - 120); X.lineTo(cx + k * 22, cy + 120); } stroke(col, 1.6, .95); X.restore(); }
    if (i === 4) { gc(cx, cy - 10, 70, col, .9, 1.6); stip(PE(cx, cy - 10, 70, 70), cx, cy - 10, 72, 300, C.white, .8, 1.6); X.strokeStyle = col; X.strokeRect(cx - 50, cy + 60, 100, 24); }
    if (i !== 1 && i !== 4) gl(cx - 22, cy + 50, cx + 22, cy + 50, C.lav, .8, 1.4);
    lab(cx, cy + 190, name, hot ? C.mag : C.white, .95, 16, 'center', 'alphabetic', 'bold'); lab(cx, cy + 214, '0 KM FROM BLUES', C.lav, .6, 11, 'center');
    if (hot) { star(cx + 110, cy - 150, 6, C.mag, 1); gc(cx, cy, 175, C.mag, .7, 1.4, null, -Math.PI * .9, -Math.PI * .1); }
    X.restore();
  });
  bracket(300, 820, 1620, 820, C.cyan, .7, 'DISTANCE FROM BLUES · ALL STATES: 0 KM');
  screen(); schFrame('D3', 'FIELD CHART', 'ONE FACE, ONE PART CHANGED');
} };

// ---------- 375.08 the favourite, redone: his phone screen shows her pixel world, nested ----------
function pxDrLayer(g, w, h, T) {
  const st = pxStep(T); pR(g, 0, 0, w, h, PX.k); pDots(g, 1, 1, w, h, 4, PX.n, 2);
  for (let i = 0; i < 4; i++) pZig(g, 0, 6 + i * 4, w, 1.4, 7, [PX.c, PX.m, PX.y, PX.g][i], 1, st * (i + 1));
  for (const [bx, kind] of [[22, 'sun'], [w - 58, 'plane']]) { pR(g, bx, 44, 36, 48, PX.w); pR(g, bx + 2, 46, 32, 28, kind === 'sun' ? PX.o : PX.c); if (kind === 'sun') { pC(g, bx + 24, 56, 6, PX.y); pR(g, bx + 2, 66, 32, 8, PX.b); pR(g, bx + 9, 52, 2, 16, PX.u); } else { pR(g, bx + 8, 58, 20, 3, PX.w); pR(g, bx + 16, 54, 3, 11, PX.w); } pR(g, bx + 6, 80, 24, 3, PX.r); }
  const EK = 3.6, ow = w / EK, oh = h / EK, ox = (w - ow) / 2, oy = (h - oh) / 2;
  pxAgent(g, w / 2, oy + 10, .95, T, { desk: false, talk: true });
  pR(g, ox - 14, oy - 9, ow + 28, oh + 30, PX.b); pR(g, ox - 3, oy - 3, ow + 6, oh + 6, PX.k);
  pR(g, ox - 30, oy + oh + 16, ow + 60, h - (oy + oh + 16), PX.u); pZig(g, ox - 28, oy + oh + 24, ow + 56, 2, 6, PX.y, 1.2, st);
  for (let i = 0; i < 3; i++) pC(g, ox + ow - 6 - i * 7, oy + oh + 12, 1.6, [PX.r, PX.g, PX.y][i]);
  g.fillStyle = PX.k; for (let x = 4; x < w; x += 11) g.fillRect(x, 0, 2, h);   // the phone's bars: she is caged in it
}
SU.mvu_droste = { mode: 'ill', f(q, p, a, T) {
  const L = p * (a.loops || 1.5), start = Math.floor(L), zz = Math.pow(EDK, L - start); let depth = 0;
  const pix = pixWorld('drost', 320, 180, (g, w, h) => pxDrLayer(g, w, h, T));
  for (let i = 0; i < 4; i++) {
    const s = zz / Math.pow(EDK, i); if (s * W < 6) break;
    X.save(); X.translate(W / 2, H / 2); X.scale(s, s); X.translate(-W / 2, -H / 2);
    if ((start + i) % 2 === 0) e_drLayer(0, T); else blitPix(pix, 0, 0, W, H);
    X.restore();
    const ow = W / EDK * s, oh = H / EDK * s; X.save(); depth++; X.beginPath(); X.rect(W / 2 - ow / 2, H / 2 - oh / 2, ow, oh); X.clip();
  }
  while (depth-- > 0) X.restore();
} };

// (slots now live directly in the act cut lists; see js/acts/act-*.js)

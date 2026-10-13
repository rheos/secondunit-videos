// Act E (365.5-403.42): dissolution, then resolution.
// Chorus 4: she is tiny inside his phone and its screen's bars are a cage; then who is inside whose screen dissolves
// (a two-layer Droste: him peering over his phone, her peering over her monitor). Typing dots; the answer is a map pin
// on the shop he started from. The world un-draws itself, his blue notes freeze into snow, his mind is the snow,
// and the snow draws the opening shopfront back: closed, for lease, little Bob passing. The loop closes.
'use strict';

// ---------- helpers ----------
function e_flake(x, y, r, rot = 0, a = 1) { // a six-armed ink snowflake (ILL)
  X.save(); X.translate(x, y); X.rotate(rot); X.beginPath();
  for (let i = 0; i < 6; i++) { const an = i * TAU / 6, cx = Math.cos(an), sy = Math.sin(an); X.moveTo(0, 0); X.lineTo(cx * r, sy * r);
    const bx = cx * r * .55, by = sy * r * .55; for (const s of [-1, 1]) { X.moveTo(bx, by); X.lineTo(bx + Math.cos(an + s * 1.05) * r * .35, by + Math.sin(an + s * 1.05) * r * .35); } }
  X.strokeStyle = '#ffffff'; X.lineWidth = Math.max(1.6, r * .28); X.globalAlpha = a; X.lineCap = 'round'; X.stroke();
  X.strokeStyle = C.ink; X.lineWidth = Math.max(.8, r * .08); X.globalAlpha = a * .8; X.stroke(); X.globalAlpha = 1; X.restore();
}
function e_note(x, y, s = 1, col = '#3f5f8f') { X.save(); X.translate(x, y); X.scale(s, s); X.rotate(.15); fillP(PE(0, 0, 7, 5.4, -.4), col); iline(6, -1, 6, -24, col, 1.8 / s, 1, false); iline(6, -24, 14, -18, col, 1.8 / s, 1, false); X.restore(); }
function e_bars(x0, x1, sp, y0, y1, w = 10) { // straight cage bars, ink with a cream glint
  X.beginPath(); for (let x = x0; x <= x1; x += sp) wl(x, y0, x, y1, 1.2, 12); stroke(C.ink, w, 1);
  X.beginPath(); for (let x = x0; x <= x1; x += sp) wl(x - w * .22, y0, x - w * .22, y1, .6, 12); stroke(C.cream, w * .22, .7);
}
// tiny map glyphs for the answer: every place he went, in ink
function e_glyph(kind, x, y) {
  X.save(); X.translate(x, y);
  if (kind === 'palm') { iline(0, 0, 4, -40, C.ink, 3); for (let i = 0; i < 5; i++) { const an = -Math.PI + .3 + i * .6; iline(4, -40, 4 + Math.cos(an) * 26, -40 + Math.sin(an) * 16 + 8, C.sage, 4, 1, false); iline(4, -40, 4 + Math.cos(an) * 26, -40 + Math.sin(an) * 16 + 8, C.ink, 1.2, .9, false); } }
  if (kind === 'booth') { const b = PR(-14, -50, 28, 50); fillP(b, C.brick); iBox(-14, -50, 28, 50, C.ink, 1.6); fillP(PR(-9, -42, 18, 22), '#dfe6dd'); }
  if (kind === 'cross') { const cp = [[-6, -36], [6, -36], [6, -24], [18, -24], [18, -12], [6, -12], [6, 0], [-6, 0], [-6, -12], [-18, -12], [-18, -24], [-6, -24]]; fillP(PP(cp), C.cream); iP(cp, true, C.brick, 2, 1, false, .3); }
  if (kind === 'marquee') { const m = PR(-24, -40, 48, 22); fillP(m, '#7a2a3a'); iBox(-24, -40, 48, 22, C.ink, 1.6); for (let i = 0; i < 5; i++) fillP(PE(-20 + i * 10, -43, 2.5, 2.5), C.ochre); fillP(PR(-16, -18, 32, 18), '#c9a06a'); iBox(-16, -18, 32, 18, C.ink, 1.4); }
  if (kind === 'cage') { X.beginPath(); for (let i = 0; i <= 5; i++) { const xx = -18 + i * 7.2; X.moveTo(xx, 0); X.lineTo(xx, -30); } stroke(C.ink, 1.6); iE(0, -30, 18, 14, 0, C.ink, 1.6, 1, false, .3, Math.PI, TAU); iline(-22, 0, 22, 0, C.ink, 2.4, 1, false); }
  if (kind === 'diner') { iE(0, -16, 20, 16, 0, C.ink, 1.6, 1, false, .3); fillP(PE(0, -16, 16, 12), C.cream); iline(-26, -2, -26, -30, C.ink, 1.6, 1, false); iline(26, -2, 26, -30, C.ink, 1.6, 1, false); }
  if (kind === 'shop') {
    const f = PR(-46, -70, 92, 70); fillP(f, C.brick); hatch(f, 0, -35, 60, .8, 4, C.ink, .8, .45, [-10, 0]); iBox(-46, -70, 92, 70, C.ink, 2);
    const sg = PR(-34, -66, 68, 14); fillP(sg, C.cream); iBox(-34, -66, 68, 14, C.ink, 1.2);
    const aw = PP([[-42, -48], [42, -48], [46, -38], [-46, -38]]); fillP(aw, C.cream); X.save(); X.clip(aw); for (let i = 0; i < 9; i++) fillP(PR(-46 + i * 11, -50, 5.5, 14), C.orange); X.restore(); iP([[-42, -48], [42, -48], [46, -38], [-46, -38]], true, C.ink, 1.4, 1, false, .3);
    fillP(PR(-38, -30, 40, 22), '#d7dfd2'); iBox(-38, -30, 40, 22, C.ink, 1.4); fillP(PR(14, -32, 22, 32), C.teal); iBox(14, -32, 22, 32, C.ink, 1.4);
  }
  X.restore();
}

// ---------- 371.88 her side of the glass: she looks up through the bars at his giant face ----------
SU.e_fromInside = { mode: 'ill', f(q, p, a, T) {
  stripes('#dfe6dd', '#d0dbcf', 150, -.62, 0, C.teal); cam(960, 540, lerp(1, 1.07, eo(p)));
  // his face outside the glass, filling the sky, looking down into the phone
  const fx = 960 + Math.sin(T * .7) * 18, fy = 470, face = PE(fx, fy + 200, 860, 900);
  fillP(face, '#efd9b9'); hatch(face, fx, fy + 200, 900, .6, 7, C.ink, 1, .55, [150, -90]); hatch(face, fx, fy + 200, 900, -.6, 10, C.ink, .9, .35, [260, -160]); iE(fx, fy + 200, 860, 900, 0, C.ink, 6);
  const blink = p > .56 && p < .63, tx = 960, ty = 820;
  for (const sx of [-1, 1]) {
    const ex2 = fx + sx * 320, ey = fy + 30, eye = PE(ex2, ey, 130, 86);
    fillP(eye, C.cream); iE(ex2, ey, 130, 86, 0, C.ink, 4.5);
    if (!blink) { const d = Math.hypot(tx - ex2, ty - ey), px = ex2 + (tx - ex2) / d * 60, py = ey + (ty - ey) / d * 40; const pu = PE(px, py, 46, 46); fillP(pu, C.teal); hatch(pu, px, py, 50, .6, 4, C.ink, 1, .6); iE(px, py, 46, 46, 0, C.ink, 3); fillP(PE(px, py, 20, 20), C.ink); fillP(PE(px - 12, py - 14, 8, 8), C.cream); }
    else { fillP(eye, '#e6caa5'); hatch(eye, ex2, ey, 140, .3, 6, C.ink, 1, .5); iline(ex2 - 130, ey + 6, ex2 + 130, ey + 6, C.ink, 5); }
    iline(ex2 - 150, ey - 130 - sx * 10, ex2 + 140, ey - 140 + sx * 10, C.ink, 12);
  }
  X.beginPath(); wP([[fx + 10, fy + 110], [fx + 90, fy + 470], [fx - 30, fy + 500]], false, 2); stroke(C.ink, 6);
  const brim = PE(fx, fy - 400, 1300, 170); fillP(brim, '#3d2a1f'); hatch(brim, fx, fy - 400, 1300, .3, 8, C.ink, 1, .5); iE(fx, fy - 400, 1300, 170, 0, C.ink, 5);
  iline(fx - 900, fy - 310, fx + 900, fy - 310, C.ochre, 26, 1, false); iline(fx - 900, fy - 296, fx + 900, fy - 296, C.ink, 3, .9);
  // his fingertip taps the glass from outside
  const tap = eo(seg(p, .3, .5)), fxT = lerp(2300, 1560, tap), fyT = lerp(1000, 560, tap);
  limb([[2400, 1300], [lerp(2300, 1820, tap), lerp(1150, 800, tap)], [fxT, fyT]], 120, {}, 1, '#efd9b9');
  const tip = PE(fxT, fyT, 72, 64, -.6); fillP(tip, '#f3dcbd'); hatch(tip, fxT, fyT, 80, .7, 5, C.ink, 1, .5, [16, 10]); iE(fxT, fyT, 72, 64, -.6, C.ink, 3.5);
  const nail = PE(fxT + 18, fyT - 6, 34, 26, -.6); fillP(nail, '#f7e7d2'); iE(fxT + 18, fyT - 6, 34, 26, -.6, C.ink, 2);
  if (tap >= 1) for (let i = 0; i < 4; i++) gc(fxT - 30, fyT, 70 + i * 50 + ((FD * 7) % 50), C.orange, .8 - i * .15, 2.4);
  // the glass: his blue notes running down it, a glare
  noteRain(0, 0, W, H, 26);
  hatch(PP([[200, -100], [520, -100], [-100, 700], [-100, 380]]), 200, 300, 600, -.9, 9, C.cream, 3, .45);
  hatch(PP([[1500, -100], [1640, -100], [1100, 1200], [960, 1200]]), 1300, 500, 800, -1.2, 10, C.cream, 3, .4);
  // the app's header seen from behind: lettering backwards
  fillP(PR(-100, -100, W + 200, 170), '#2b2420'); fillP(PR(-100, 70, W + 200, 80), C.orange); iline(-100, 150, W + 100, 150, C.ink, 3);
  X.save(); X.translate(960, 124); X.scale(-1, 1); lab(0, 0, 'TRAVEL AGENT', C.cream, 1, 40, 'center', 'alphabetic', 'bold'); X.restore();
  for (let i = 0; i < 4; i++) { const bh = 12 + i * 10, bx = 1640 + i * 22; fillP(PR(bx, 40 - bh, 14, bh), C.cream, .9); }
  // the bars: the screen of his phone, from inside
  e_bars(40, W, 148, 150, 900, 14);
  // her room: floor, desk, her looking up, reaching for the bars
  const fl = PR(-200, 880, W + 400, 400); fillP(fl, '#c9a06a'); hatch(fl, 960, 1000, 1300, .15, 8, C.ink, .9, .4); iline(-200, 880, W + 200, 880, C.ink, 3);
  X.beginPath(); for (let x = -200; x < W + 200; x += 150) { X.moveTo(x, 880); X.lineTo(lerp(x, 960, -.6), 1180); } stroke(C.ink, 1.2, .45);
  agent(960, 900, 1.05, { look: .3, point: eo(seg(p, .15, .5)) });
  desk(960, 900, 520, 1.05);
  const lamp = PE(1150, 860, 30, 14); iline(1150, 870, 1150, 800, C.ink, 4); fillP(PP([[1115, 800], [1185, 800], [1165, 760], [1135, 760]]), C.ochre); iP([[1115, 800], [1185, 800], [1165, 760], [1135, 760]], true, C.ink, 2); fillP(lamp, '#5a3a22'); iE(1150, 860, 30, 14, 0, C.ink, 2);
  gc(1110, 640, 60 + 20 * Math.sin(T * 6), C.teal, .6, 1.6, [5, 6]);
  consL([[0, 880, W, 880], [960, 0, 960, H]]); consC([[960, 700, 500]]);
} };

// ---------- 368.28 blueprint of the handset: the signal bars are the cage bars ----------
SU.e_sPhoneCage = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 520, lerp(1.06, 1, eo(p)));
  lattice(960, 540, 70, 10, C.lav, .05);
  X.save(); X.translate(960, 500); X.rotate(-.04);
  const bw = 440, bh = 880, sw = 384, sh = 760;
  X.strokeStyle = C.lav; X.lineWidth = 1.6; X.globalAlpha = .9; X.strokeRect(-bw / 2, -bh / 2, bw, bh); X.lineWidth = 1; X.strokeRect(-sw / 2, -sh / 2 + 10, sw, sh); X.globalAlpha = 1;
  stip(PR(-bw / 2, -bh / 2, bw, 30), 0, -bh / 2 + 15, 240, 500, C.lav, .5, 1.2); gl(-40, -bh / 2 + 16, 40, -bh / 2 + 16, C.white, .8, 2);
  X.save(); X.beginPath(); X.rect(-sw / 2, -sh / 2 + 10, sw, sh); X.clip();
  graticule(0, 0, sw, sh, 32, C.lav, .1);
  agent(0, 250, .82, { sch: 1, col: C.cyan, look: 0, point: eo(seg(p, .2, .6)) }); desk(0, 250, 330, .82, { sch: 1, col: C.cyan });
  // her voice goes out and stops at the bars
  for (let i = 0; i < 4; i++) { const r = ((p * 2.2 + i / 4) % 1) * 260 + 20; gc(0, 80, r, C.mag, .9 * (1 - r / 300), 1.8, null, -2.6, -.5); }
  X.restore();
  X.beginPath(); for (let i = 0; i < 9; i++) { const bx = -sw / 2 + i * sw / 8; X.moveTo(bx, -sh / 2 + 10); X.lineTo(bx, sh / 2 + 10); } stroke(C.white, 2.2, .85);
  for (let i = 1; i < 8; i++) { const bx = -sw / 2 + i * sw / 8; gc(bx, 80 - 150 + ((i * 37) % 60), 7, C.mag, .9, 1.4); gl(bx - 5, 80 - 155 + ((i * 37) % 60), bx + 5, 80 - 145 + ((i * 37) % 60), C.mag, .9, 1.4); }
  X.restore();
  // the signal glyph, enlarged; leaders run from its bars down to the cage bars
  const gx = 1400, gy = 330; for (let i = 0; i < 4; i++) { const h2 = 40 + i * 40, x0 = gx + i * 56; const b = PR(x0, gy - h2, 40, h2); stip(b, x0 + 20, gy - h2 / 2, h2, h2 * 6, C.cyan, .8, 1.3); X.strokeStyle = C.cyan; X.lineWidth = 1.2; X.strokeRect(x0, gy - h2, 40, h2); gl(x0 + 20, gy, lerp(780, 1140, i / 3), 120, C.cyan, .35, 1, [3, 6]); }
  lab(gx, gy + 34, 'SIGNAL  ▮▮▮▮', C.cyan, .9, 13); lab(gx, gy + 56, 'BARS: 4  ·  EXITS: 0', C.mag, .95, 13);
  bracket(752, 980, 1192, 960, C.cyan, .75, 'W 71.5 MM'); bracket(1250, 70, 1214, 940, C.cyan, .75, 'H 146.7 MM');
  lab(260, 360, 'OCCUPANT', C.lav, .7, 12); lab(260, 384, '1 AGENT · SCALE 1:48', C.white, .9, 15); gl(470, 378, 880, 640, C.lav, .45, 1, [2, 5]); gc(890, 650, 26, C.lav, .6);
  lab(260, 600, 'VOICE OUT', C.mag, .9, 13); lab(260, 622, 'REFLECTED 100%', C.mag, .7, 12);
  screen(); schFrame('E1', 'HANDSET', 'THE CAGE FITS IN A POCKET');
} };

// ---------- 375.08 who is inside whose screen: him over his phone, her over her monitor, forever ----------
const EDK = 3.6;
function e_drLayer(type, T) {
  const ow = W / EDK, oh = H / EDK, ox = (W - ow) / 2, oy = (H - oh) / 2;
  if (type === 0) { // him, peering over the phone he holds sideways
    stripes(C.paper, '#e3dbc0', 120, -.62, 0, C.sage);
    cloud(330, 200, 1.1, { rain: true }); noteRain(200, 280, 280, 360, 10);
    const sh = [[230, H + 60], [380, 860], [760, 760], [1160, 760], [1540, 860], [1690, H + 60]], shp = PP(sh);
    fillP(shp, C.teal); shade(shp, 960, 950, 800, [120, -20], .9, 7); iP(dens(sh, 40), false, C.ink, 4);
    iP([[860, 760], [920, 900], [960, H + 40]], false, C.ink, 3); iP([[1060, 760], [1000, 900], [960, H + 40]], false, C.ink, 3);
    const hp = PE(960, 330, 230, 270); fillP(hp, '#efd9b9'); hatch(hp, 960, 330, 270, .6, 6, C.ink, 1, .55, [50, -30]); iE(960, 330, 230, 270, 0, C.ink, 4);
    for (const ex2 of [880, 1040]) { fillP(PE(ex2, 330, 13, 16), C.ink); iline(ex2 - 34, 290, ex2 + 30, 284, C.ink, 5); }
    const brim = PE(960, 140, 420, 56); fillP(brim, '#3d2a1f'); iE(960, 140, 420, 56, 0, C.ink, 4);
    const cr = [[760, 140], [790, -60], [960, -30], [1130, -60], [1160, 140]], crp = PP(cr); fillP(crp, '#4b3426'); shade(crp, 960, 60, 220, [30, -20], .7, 6); iP(cr, true, C.ink, 4); iline(770, 104, 1150, 104, C.ochre, 18, 1, false);
    for (const sx of [-1, 1]) { const hx = W / 2 + sx * (ow / 2 + 70); const hd = PE(hx, 560, 80, 130); fillP(hd, '#efd9b9'); hatch(hd, hx, 560, 130, .7, 6, C.ink, 1, .5, [sx * 20, -10]); iE(hx, 560, 80, 130, 0, C.ink, 4); }
    const ph = PR(ox - 40, oy - 34, ow + 80, oh + 68); fillP(ph, '#2b2420'); iBox(ox - 40, oy - 34, ow + 80, oh + 68, C.ink, 4); fillP(PE(ox - 20, H / 2, 6, 6), C.cream, .6);
    for (const sx of [-1, 1]) { const tx = W / 2 + sx * (ow / 2 + 26); const th = PE(tx, oy + 70, 30, 58, sx * .35); fillP(th, '#efd9b9'); iE(tx, oy + 70, 30, 58, sx * .35, C.ink, 3.5); }
  }
  if (type === 1) { // her, peering over the old monitor on her desk, inside the cage
    stripes(C.paper, '#ead6a6', 120, -.62, 0, C.ochre);
    poster(140, 160, 300, 400, 'palm'); poster(1480, 160, 300, 400, 'plane');
    agent(960, 760, 2.2, { look: 0 });
    desk(960, 760, 1600, 2.2);
    const mb = PR(ox - 70, oy - 60, ow + 140, oh + 150); fillP(mb, '#d8cdb0'); shade(mb, W / 2, H / 2, 420, [60, -30], .8, 6); iBox(ox - 70, oy - 60, ow + 140, oh + 150, C.ink, 4);
    fillP(PR(ox - 20, oy - 16, ow + 40, oh + 32), '#3a3430'); iBox(ox - 20, oy - 16, ow + 40, oh + 32, C.ink, 3);
    for (let i = 0; i < 3; i++) fillP(PE(ox + ow - 30 - i * 30, oy + oh + 56, 7, 7), [C.orange, C.sage, C.ochre][i]);
    e_bars(60, W, 160, -40, H + 40, 16);
    iline(-100, 40, W + 100, 40, C.ink, 14); iline(-100, 1010, W + 100, 1010, C.ink, 14);
  }
}
SU.e_droste = { mode: 'ill', f(q, p, a, T) {
  const L = p * (a.loops || 1.5), start = Math.floor(L), zz = Math.pow(EDK, L - start); let depth = 0;
  for (let i = 0; i < 4; i++) {
    const s = zz / Math.pow(EDK, i); if (s * W < 6) break;
    X.save(); X.translate(W / 2, H / 2); X.scale(s, s); X.translate(-W / 2, -H / 2); e_drLayer((start + i) % 2, T); X.restore();
    const ow = W / EDK * s, oh = H / EDK * s; X.save(); depth++; X.beginPath(); X.rect(W / 2 - ow / 2, H / 2 - oh / 2, ow, oh); X.clip();
  }
  while (depth-- > 0) X.restore();
} };

// ---------- 382.46 blueprint of the typing dots: the reply that is always about to arrive ----------
SU.e_sTyping = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.08, 1, eo(p)));
  lattice(960, 540, 80, 9, C.lav, .05);
  X.beginPath(); X.roundRect(420, 250, 1080, 440, 90); X.moveTo(560, 690); X.lineTo(470, 800); X.lineTo(680, 690); stroke(C.lav, 1.6, .9);
  X.save(); X.beginPath(); X.roundRect(420, 250, 1080, 440, 90); X.clip(); graticule(960, 470, 1080, 440, 30, C.lav, .1); X.restore();
  const act = Math.floor(T * 3.2) % 3;
  for (let i = 0; i < 3; i++) {
    const x = 740 + i * 220, on = act === i, y = 470 - (on ? 34 : 0);
    gc(x, 470, 74, C.lav, .45, 1, [3, 5]); ticks(x, 470, 80, 36, 6, C.lav, .45, 1, 9);
    star(x, y, on ? 10 : 6, on ? C.mag : C.white, 1); gl(x, 470, x, y, C.mag, on ? .8 : 0, 1.4);
    X.beginPath(); for (let k = 0; k <= 60; k++) { const xx = x - 90 + k * 3, yy = 620 + Math.sin(k * .5 + T * 9 + i * 2) * (on ? 26 : 6); k ? X.lineTo(xx, yy) : X.moveTo(xx, yy); } stroke(on ? C.mag : C.cyan, 1.4, .85);
  }
  lab(960, 330, 'TYPING …', C.white, .9, 22, 'center'); lab(960, 362, 'SHE IS WRITING BACK', C.lav, .6, 12, 'center');
  const el = Math.max(0, T - 379.3); lab(470, 880, 'T+ ' + el.toFixed(1) + ' S', C.cyan, .9, 18); bracket(470, 920, lerp(480, 1450, eo(p)), 920, C.cyan, .7, 'WAIT');
  const nx = 1600, ny = 880, an = -Math.PI + eo(p) * Math.PI * .97; gc(nx, ny, 130, C.lav, .5, 1, null, -Math.PI, 0); ticks(nx, ny, 130, 20, 8, C.lav, .6, 1, 5, -Math.PI, 0);
  gl(nx, ny, nx + Math.cos(an) * 120, ny + Math.sin(an) * 120, C.mag, 1, 2.4); lab(nx, ny + 34, 'REPLY ETA', C.lav, .7, 12, 'center');
  if (p > .7) { const k = eo(seg(p, .7, .95)); gc(1250, 205, 18 + k * 10, C.mag, .95, 2); lab(1280, 210, 'RESULT: 1 PLACE', C.mag, .95 * k, 14); }
  screen(); schFrame('E2', 'TYPING', 'ANSWER PENDING');
} };

// ---------- 385.18 "know": her reply lands as a map, and the pin falls on the shop he started from ----------
const E_LAND = (() => { const r = M32(5150), out = []; for (const [cx, cy, s] of [[860, 300, 170], [1460, 330, 190], [1100, 640, 230], [760, 660, 120]]) { const pts = []; for (let i = 0; i < 22; i++) { const an = i / 22 * TAU, rr = s * (.75 + r() * .4 + .15 * Math.sin(an * 3 + cx)); pts.push([cx + Math.cos(an) * rr * 1.3, cy + Math.sin(an) * rr * .8]); } out.push(pts); } return out; })();
const E_STOPS = [[740, 220, 'palm'], [1620, 210, 'booth'], [1660, 720, 'marquee'], [720, 760, 'cross'], [790, 420, 'diner'], [1470, 470, 'cage'], [1300, 620, 'palm'], [1000, 560, null], [1180, 470, 'shop']];
SU.e_answerHome = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e8dcc0', 140, -.62, 0, C.ochre); cam(960, 560, lerp(1, 1.05, eo(p)));
  const gr = PR(-200, 990, W + 400, 300); fillP(gr, '#cdbb98'); hatch(gr, 960, 1100, 1400, .2, 8, C.ink, .8, .32); iline(-200, 990, W + 200, 990, C.ink, 2.6);
  traveller(330, 1010, 1.15, { look: 1, mouth: sing(T), armR: [2.6, -1.9], case: false });
  phoneBody(366, 651, .23, -.2, (w, h) => appScreen(w, h, T, 'chat'));
  cloud(330, 1010 - 520 * 1.15, .7, { rain: true }); souvenirsOn(130, 1000, T, .8);
  // the bubble grows out of the phone
  const u = eo(seg(p, 0, .28)), ax = 430, ay = 600;
  X.save(); X.translate(ax, ay); X.scale(u, u); X.translate(-ax, -ay);
  const bub = new Path2D(); bub.roundRect(620, 110, 1180, 760, 70); const tail = PP([[640, 720], [430, 600], [640, 630]]);
  const all = new Path2D(); all.addPath(bub); all.addPath(tail); fillP(all, C.cream); hatch(all, 1200, 490, 900, .7, 10, C.ink, .8, .15);
  X.save(); X.clip(PR(660, 150, 1100, 680));
  fillP(PR(660, 150, 1100, 680), '#cfdcd4'); hatch(PR(660, 150, 1100, 680), 1200, 490, 700, -.3, 7, C.teal, 1, .35);
  for (const L of E_LAND) { const lp = PP(L); fillP(lp, C.sage); hatch(lp, 1200, 490, 700, .6, 5, C.ink, .9, .45); iP(L, true, C.ink, 2, 1, false, .6); }
  graticule(1210, 490, 1100, 680, 110, C.ink, .12);
  // his whole route, spiralling in
  const rt = []; for (let i = 0; i < E_STOPS.length - 1; i++) { const [x1, y1] = E_STOPS[i], [x2, y2] = E_STOPS[i + 1]; for (let k = 0; k < 20; k++) { const t = k / 20; rt.push([lerp(x1, x2, t) + Math.sin(t * Math.PI) * 30 * (i % 2 ? 1 : -1), lerp(y1, y2, t) + Math.sin(t * Math.PI) * 24]); } }
  rt.push([1180, 470]); const n = Math.max(2, Math.floor(rt.length * eo(seg(p, .15, .75))));
  path(rt.slice(0, n), C.orange, 4, .95, [14, 10]);
  E_STOPS.forEach(([x, y, k], i) => { if (k && n >= i * 20) { e_glyph(k, x, y); if (k !== 'shop') { gc(x, y - 18, 34, C.orange, .55, 1.4); } } });
  const [hx, hy] = rt[n - 1]; gc(hx, hy, 12, C.orange, 1, 3);
  // the pin
  if (p > .66) {
    const d = eo(seg(p, .66, .8)), py = lerp(140, 400, d); const pin = new Path2D(); pin.moveTo(1180, py); pin.bezierCurveTo(1120, py - 60, 1130, py - 120, 1180, py - 120); pin.bezierCurveTo(1230, py - 120, 1240, py - 60, 1180, py);
    fillP(pin, C.brick); hatch(pin, 1180, py - 70, 70, .7, 4, C.ink, 1, .55, [10, -6]); X.lineWidth = 3; X.strokeStyle = C.ink; X.stroke(pin); fillP(PE(1180, py - 82, 14, 14), C.cream); iE(1180, py - 82, 14, 14, 0, C.ink, 2);
    if (d >= 1) { for (let i = 0; i < 3; i++) gc(1180, 440, 50 + i * 40 + ((FD * 6) % 40), C.orange, .8 - i * .2, 2.4); const tg = PR(1060, 486, 240, 40); fillP(tg, C.cream); iBox(1060, 486, 240, 40, C.ink, 2); lab(1180, 514, 'YOU ARE HERE', C.brick, 1, 18, 'center', 'alphabetic', 'bold'); }
  }
  X.restore();
  X.lineWidth = 3; X.strokeStyle = C.ink; X.stroke(bub); iline(620, 636, 620, 714, C.cream, 7, 1, false, .3); iP([[622, 630], [430, 600], [622, 720]], false, C.ink, 3);
  X.restore();
  consL([[0, 990, W, 990], [1180, 0, 1180, H]]); consC([[1180, 470, 420]]);
} };

// ---------- 387.84 the world un-draws itself; his blue notes freeze into snow ----------
const E_WORLD = [
  [[-200, 900], [W + 200, 900]],
  [[300, 900], [900, 620], [1020, 620], [1620, 900]],
  [[1500, 900], [1500, 480], [1430, 480], [1430, 420], [1640, 420], [1640, 480], [1570, 480]],
  [[260, 900], [270, 700], [290, 520], [330, 400]],
  [[330, 400], [200, 440], [330, 400], [430, 380], [330, 400], [260, 330], [330, 400], [420, 470]],
  [[-100, 620], [500, 600], [700, 520], [1200, 540], [1500, 600], [2100, 610]],
];
SU.e_freeze = { mode: 'ill', f(q, p, a, T) {
  paperOnly('#efe8d6'); illDress(); cam(960, 560, lerp(1.04, 1, eo(p)));
  // what is left of the world, shrinking into him
  const rr = lerp(1500, 260, eo(seg(p, 0, .8)));
  X.save(); X.clip(PE(900, 640, rr * 1.35, rr)); stripes(C.paper, '#d9dccb', 130, -.62, 0, C.sage); X.restore();
  iE(900, 640, rr * 1.35, rr, 0, C.ink, 2, .7, false, 3);
  const keep = 1 - eo(seg(p, .05, .85));
  for (const l of E_WORLD) { const d = dens(l, 14), n = Math.floor(d.length * keep); if (n > 1) { iP(d.slice(0, n), false, C.ink, 2.6, 1, true, 1.2); const [x, y] = d[n - 1]; star(x, y, 3, C.orange, .8); } }
  if (keep > .3) { X.globalAlpha = keep; lab(1535, 462, 'ANYWHERE', C.ink, 1, 22, 'center', 'alphabetic', 'bold'); X.globalAlpha = 1; }
  // him, his cloud, and the freeze line climbing from the ground to the cloud
  const s = 1.25, tx = 900, ty = 1000, cy = ty - 520 * s;
  traveller(tx, ty, s, { look: 0, case: true, mouth: 0 });
  souvenirsOn(tx + 130, ty, T, .8);
  const fz = lerp(1060, cy + 40, eo(seg(p, .1, .9))), sp = lerp(260, 50, eo(p)), r = M32(919);
  for (let i = 0; i < 46; i++) {
    const x = tx - 230 + r() * 460, y0 = cy + 50, y = y0 + ((r() * 640 + T * sp * (.8 + r() * .4)) % 640), wob = Math.sin(T * 2 + i) * 10;
    if (y < fz) e_note(x + wob, y, 1.2); else e_flake(x + wob, y, 9 + r() * 6, T * .5 + i);
  }
  cloud(tx, cy, .9, {});
  if (p > .45) { const k = eo(seg(p, .45, .9)); const mnd = PE(tx, ty - 334 * s, 50 * s, 10 * k * s); fillP(mnd, '#ffffff'); iE(tx, ty - 334 * s, 50 * s, 10 * k * s, 0, C.ink, 1.6, 1, false, .5, Math.PI, TAU); const cm = PE(tx, cy - 40, 150, 26 * k); fillP(cm, '#ffffff'); iE(tx, cy - 40, 150, 26 * k, 0, C.ink, 1.6, 1, false, .5, Math.PI, TAU); }
  gl(tx - 420, fz, tx + 420, fz, C.teal, .8, 1.6, [8, 8]); lab(tx + 430, fz + 6, '0 °C', C.teal, .9, 16);
  consL([[0, 1000, W, 1000], [tx, 0, tx, H]]); consC([[tx, 640, 600]]);
} };

// ---------- 397.14 "my mind's the snow": the hat lifts, and his head is a snowfield that pours out ----------
SU.e_mindSnow = { mode: 'ill', f(q, p, a, T) {
  stripes('#e6e0d0', '#d8d0bd', 140, -.62, 0, C.sky); cam(960, 560, lerp(1, 1.06, eo(p)));
  const hx = 760, hy = 660, k = 2.1, hp = PROFILE.map(([x, y]) => [hx + x * k, hy + y * k]), hpp = PP(hp);
  const coat = PP([[hx - 360, H + 60], [hx - 220, hy + 300], [hx + 200, hy + 300], [hx + 380, H + 60]]); fillP(coat, C.teal); shade(coat, hx, hy + 450, 400, [60, -20], .9, 6); iP([[hx - 360, H + 60], [hx - 220, hy + 300], [hx + 200, hy + 300], [hx + 380, H + 60]], false, C.ink, 3.5);
  fillP(hpp, '#efd9b9'); hatch(hpp, hx, hy, 400, .6, 6, C.ink, 1, .55, [-60, 20]); iP(dens(hp, 30, true), true, C.ink, 4);
  fillP(PE(hx + 240, hy - 230, 12, 16), C.ink); iline(hx + 200, hy - 280, hx + 280, hy - 290, C.ink, 6); iline(hx + 230, hy + 140, hx + 290, hy + 140, C.ink, 4);
  // the open crown: a snowfield inside, a tiny him walking in it
  const ox = hx, oy = hy - 330, orx = 250, ory = 120, op = PE(ox, oy, orx, ory);
  fillP(op, '#eef1ee'); X.save(); X.clip(op);
  fillP(PE(ox, oy + 100, 320, 90), '#ffffff'); iE(ox, oy + 100, 320, 90, 0, C.ink, 1.6, .8, false);
  for (const [px, ph] of [[ox - 170, 70], [ox - 120, 50], [ox + 150, 80], [ox + 200, 56]]) { const tr = PP([[px - ph * .35, oy + 40], [px + ph * .35, oy + 40], [px, oy + 40 - ph]]); fillP(tr, C.sage); hatch(tr, px, oy + 10, ph, .7, 3, C.ink, .8, .5); iP([[px - ph * .35, oy + 40], [px + ph * .35, oy + 40], [px, oy + 40 - ph]], true, C.ink, 1.4, 1, false, .3); }
  traveller(lerp(ox - 80, ox + 60, p), oy + 40, .16, { legs: walkPh(), case: true, look: 1 });
  snowFlakes(60, T, '#ffffff', .95, 3);
  X.restore(); iE(ox, oy, orx, ory, 0, C.ink, 3.5);
  // the hat lifts off like a lid
  const lift = eo(seg(p, 0, .4)); X.save(); X.translate(ox + lift * 260, oy - 40 - lift * 200); X.rotate(-.1 - lift * .5);
  const brim = PE(0, 0, 330, 44); fillP(brim, '#3d2a1f'); iE(0, 0, 330, 44, 0, C.ink, 3.5);
  const cr = [[-180, 0], [-160, -170], [0, -140], [160, -170], [180, 0]], crp = PP(cr); fillP(crp, '#4b3426'); shade(crp, 0, -80, 200, [30, -20], .7, 5); iP(cr, true, C.ink, 3.5); iline(-176, -34, 176, -34, C.ochre, 16, 1, false);
  X.restore();
  // the snow pours up and out of him, across the frame
  const r = M32(4471), N = 760, reach = eo(seg(p, .05, .95)) * 1.15;
  for (let i = 0; i < N; i++) {
    const t = r(), sp2 = r() - .5, sz = 5 + r() * 7; if (t > reach) continue;
    const [bx, by] = bz([ox, oy - 40], [ox + 120, oy - 300], [ox + 700, oy - 280], [W + 100, oy + 120], t);
    const x = bx + sp2 * t * 700 + Math.sin(T * 2 + i) * 14, y = by + sp2 * t * 360 + ((T * 40 + i * 7) % 30);
    if (i % 9 === 0) e_flake(x, y, sz * 2.2, T + i); else { X.fillStyle = '#ffffff'; X.fillRect(x, y, sz, sz); X.strokeStyle = C.ink; X.globalAlpha = .45; X.lineWidth = .8; X.strokeRect(x, y, sz, sz); X.globalAlpha = 1; }
  }
  for (let i = 0; i < 3; i++) gc(ox, oy, orx + 40 + i * 50 + ((FD * 6) % 50), C.teal, .55, 1.6, null, Math.PI * 1.05, Math.PI * 1.95);
  consL([[0, oy, W, oy], [hx, 0, hx, H]]); consC([[ox, oy, 420]]);
} };

// ---------- the cut list ----------
var CUTS_E = [
  [365.5, 'appInside', {}],                               // "Travel agent": she is tiny inside his phone, the screen's bars a cage
  [368.28, 'e_sPhoneCage', {}],                           // blueprint: signal bars = cage bars, her voice bounces back
  [371.88, 'e_fromInside', {}],                           // "travel agent": her side of the glass, his giant face, his finger taps
  [375.08, 'e_droste', { loops: 1.5 }],                   // instrumental: him over his phone / her over her monitor, forever
  [379.3, 'phoneApp', { screen: 'chat', z0: 1.12, z1: 1.3, fy: 440 }], // "Travel agent": the chat, her typing dots
  [382.46, 'e_sTyping', {}],                              // "I've got to know": blueprint of the typing dots
  [385.18, 'e_answerHome', {}],                           // "know": her reply is a map; the pin lands on the shop he started from
  [387.84, 'e_freeze', {}],                               // instrumental: the world un-draws, his notes freeze into snow
  [392.08, 'snowGlobe', { blow: 1 }],                     // "I feel like": inside the snow globe
  [395.08, 'sSnow', {}],                                  // "naked": the crystal, clothing none
  [397.14, 'e_mindSnow', {}],                             // "my mind's": the hat lifts and the snow pours out of his head
  [398.76, 'snowSettle', {}],                             // "the snow": the snow draws the shopfront back
  [400.0, 'shopClosed', {}],                              // closed, for lease, him on his phone, little Bob passing
  [402.3, 'sEnd', {}],                                    // the loop closes
];

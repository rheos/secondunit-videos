// Draft 3, Robin's notes: the agent is not always a desk (does anyone still go to an office?) and more symbolism
// from the lyrics. The agent's form evolves: shop desk -> roadside payphone -> on hold -> the app -> her inside
// the phone, the phone a cage -> the typing dots -> the agency closed, for lease. Lyric symbols: blue notes for
// rain, the hand that holds the carrot's string, a fork in the road, the snake that eats its tail, a pop-up book,
// a treadmill.
'use strict';

// ---------- the blues rain music notes (from act 2 on, more as it goes) ----------
function noteRain(x, y, w, h, n, col = '#3f5f8f') {
  for (let i = 0; i < n; i++) { const r2 = M32(i * 31 + 7), nx = x + r2() * w, ny = y + ((r2() * h + FD * 6) % h); X.save(); X.translate(nx, ny); X.rotate(.15); fillP(PE(0, 0, 7, 5.4, -.4), col); iline(6, -1, 6, -24, col, 1.8, 1, false); if (i % 3 === 0) iline(6, -24, 14, -18, col, 1.8, 1, false); X.restore(); }
}

// ---------- phone props ----------
function phoneBody(x, y, s, rot = 0, screenFn, o = {}) { // a hand-held smartphone, screen drawn by screenFn(w,h) in local coords
  const k = 1 / s; X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s);
  const b = PR(-110, -220, 220, 440); fillP(b, '#2b2420'); iBox(-110, -220, 220, 440, C.ink, 3 * k);
  const sc = PR(-96, -196, 192, 380); fillP(sc, '#f6f0df'); X.save(); X.clip(sc); X.translate(-96, -196); if (screenFn) screenFn(192, 380); X.restore(); iBox(-96, -196, 192, 380, C.ink, 1.6 * k);
  fillP(PR(-24, -212, 48, 6), C.ink); if (o.bars) { X.beginPath(); for (let i = 0; i < 9; i++) { const bx = -96 + i * 24; X.moveTo(bx, -196); X.lineTo(bx, 184); } stroke(C.ink, 3 * k, 1); }
  X.restore();
}
function hand(x, y, s, rot = 0) { X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s); const h = PP([[-130, 40], [-40, -60], [60, -40], [130, 60], [120, 260], [-120, 260]]); fillP(h, '#e7c9a2'); shade(h, 0, 100, 200, [-30, -10], .7, 6); iP(dens([[-130, 40], [-40, -60], [60, -40], [130, 60], [120, 260], [-120, 260]], 30, true), true, C.ink, 3); const th = PE(-120, -10, 34, 80, -.5); fillP(th, '#e7c9a2'); iE(-120, -10, 34, 80, -.5, C.ink, 2.6); X.restore(); }
function appScreen(w, h, T, mode) { // the booking app, hand-drawn
  fillP(PR(0, 0, w, 40), C.orange); lab(w / 2, 26, 'TRAVEL AGENT', C.cream, 1, 13, 'center', 'alphabetic', 'bold');
  if (mode === 'cards') { const off = ((T * 60) % 140); for (let i = -1; i < 4; i++) { const cy = 54 + i * 140 - off * 0; const cx = 12 - (i === 0 ? (T * 120 % 220) : 0); const c = PR(cx, 54 + i * 112, w - 24, 100); fillP(c, [C.sky, '#e9c58a', C.sage, C.rose, C.tan][(i + 5) % 5]); hatch(c, cx + 80, 104 + i * 112, 90, .7, 6, C.ink, .8, .3); iBox(cx, 54 + i * 112, w - 24, 100, C.ink, 1.4); lab(cx + 10, 74 + i * 112, ['LISBON', 'ANYWHERE', 'TIMBUKTU', 'NOT HERE', 'REYKJAVIK'][(i + 5) % 5], C.ink, .9, 11, 'left', 'alphabetic', 'bold'); fillP(PE(cx + w - 60, 116 + i * 112, 16, 16), C.orange); } }
  if (mode === 'hold') { lab(w / 2, 110, 'ON HOLD', C.ink, .95, 18, 'center', 'alphabetic', 'bold'); const an = T * 5; gc(w / 2, 190, 40, C.ink, .25, 6); gc(w / 2, 190, 40, C.orange, 1, 6, null, an, an + 1.6); lab(w / 2, 290, 'YOU ARE NO.', C.ink, .8, 11, 'center'); lab(w / 2, 330, String(47 + Math.floor((T * 3) % 9)), C.brick, 1, 30, 'center', 'alphabetic', 'bold'); }
  if (mode === 'book') { lab(w / 2, 120, 'BOOKED', C.brick, 1, 28, 'center', 'alphabetic', 'bold'); stampMark(w / 2, 220, 70, 'TOUR', C.brick, -.2, .9); }
  if (mode === 'chat') { const n = Math.min(4, 1 + Math.floor(T * 1.3 % 5)); for (let i = 0; i < n; i++) { const me = i % 2 === 0, by = 60 + i * 74, bw = me ? 120 : 110; const b = PR(me ? w - bw - 10 : 10, by, bw, 54); fillP(b, me ? C.teal : '#ddd6c2'); iBox(me ? w - bw - 10 : 10, by, bw, 54, C.ink, 1.4); lab(me ? w - bw / 2 - 10 : 10 + bw / 2, by + 36, me ? '?' : '...', me ? C.cream : C.ink, 1, 22, 'center', 'alphabetic', 'bold'); } }
}

// ---------- set-ups ----------
SU.phoneBooth = { mode: 'ill', f(q, p, a, T) { // chorus 1: a payphone by the empty road; split with her answering
  SU.road.f(q, p, {}, T);
  const bx = 520, by = 1060, bw = 300, bh = 640, bp = PR(bx - bw / 2, by - bh, bw, bh);
  fillP(PR(bx - bw / 2 - 20, by - bh - 70, bw + 40, 70), C.brick); iBox(bx - bw / 2 - 20, by - bh - 70, bw + 40, 70, C.ink, 2.6); lab(bx, by - bh - 25, 'TELEPHONE', C.cream, 1, 22, 'center', 'alphabetic', 'bold');
  fillP(bp, '#dfe6dd', .55); traveller(bx, by - 10, 1.0, { look: 1, mouth: sing(T), phone: 'handset', case: false });
  const rx = bx + 30, ry = by - 10 - 300; X.beginPath(); for (let i = 0; i <= 20; i++) { const t = i / 20; X.lineTo(lerp(rx, bx + 120, t) + Math.sin(t * 30) * 8, lerp(ry + 30, by - 330, t)); } stroke(C.ink, 2, 1); fillP(PR(bx + 100, by - 400, 44, 90), '#5a5a5a'); iBox(bx + 100, by - 400, 44, 90, C.ink, 2);
  X.beginPath(); for (let i = 0; i <= 6; i++) { X.moveTo(bx - bw / 2 + i * bw / 6, by - bh); X.lineTo(bx - bw / 2 + i * bw / 6, by); } for (let j = 0; j <= 8; j++) { X.moveTo(bx - bw / 2, by - bh + j * bh / 8); X.lineTo(bx + bw / 2, by - bh + j * bh / 8); } stroke(C.brick, 6, 1); iBox(bx - bw / 2, by - bh, bw, bh, C.ink, 3);
  cloud(bx, by - bh - 180, .7, { rain: true }); noteRain(bx - 120, by - bh - 130, 240, 120, 6);
  if (a.split) { const sp = PP([[1150, 0], [W, 0], [W, H], [1350, H]]); X.save(); X.clip(sp); stripes(C.paper, '#ead6a6', 120, -.62, 0, C.ochre); desk(1560, 760, 520); agent(1560, 760, 1.2, { talk: Math.abs(Math.sin(T * 9)) * .9, look: -.7 }); fillP(PE(1640, 520, 14, 30, -.3), C.ink); X.restore(); iP([[1150, 0], [1350, H]], false, C.ink, 4); }
  for (let i = 0; i < 3; i++) gc(rx, ry, 40 + i * 30 + ((FD * 6) % 30), C.orange, .7, 1.8, null, -1, 1);
} };
SU.sHold = { mode: 'sch', f(q, p, a, T) { // on hold: the queue number that never comes down
  schBG(); cam(960, 540, lerp(1.05, 1, eo(p)));
  lattice(960, 540, 70, 12, C.lav, .06); gl(0, 540, W, 540, C.lav, .3);
  X.beginPath(); for (let x = 0; x <= W; x += 6) { const y = 540 + Math.sin(x * .02 + T * 6) * 60 * Math.sin(x * .003 + T) ; x ? X.lineTo(x, y) : X.moveTo(x, y); } stroke(C.cyan, 1.6, .9);
  const n = 47 + Math.floor((T * 3) % 9); lab(960, 330, 'POSITION IN QUEUE', C.lav, .8, 16, 'center'); lab(960, 420, String(n), C.mag, 1, 90, 'center', 'alphabetic', 'bold');
  for (let i = 0; i < 12; i++) { const t2 = (T * .4 + i / 12) % 1; const x = lerp(1900, 20, t2); fillP(PE(x, 760, 9, 7, -.4), C.cyan); gl(x + 8, 760, x + 8, 730, C.cyan, .9, 1.6); }
  lab(960, 860, 'HOLD MUSIC · ' + Math.floor(T / 60) + ':' + String(Math.floor(T % 60)).padStart(2, '0') + ' ELAPSED', C.lav, .7, 14, 'center');
  screen(); schFrame('21', 'ON HOLD', 'YOUR CALL IS IMPORTANT');
} };
SU.phoneApp = { mode: 'ill', f(q, p, a, T) { // the app: his hand, his phone, the booking cards; on 'book' a pop-up book opens out of it
  stripes(C.paper, '#e2d6e8', 130, -.62, 0, C.plum); cam(960, 540, lerp(a.z0 || 1, a.z1 || 1.08, eo(p)));
  if (a.popup) { const o = eo(cl(p / .7)); popupBook(960, 640, 1.1, o, T); }
  else { hand(1010, 860, 1.3, -.1); phoneBody(960, 470, 1.9, -.06, (w, h) => appScreen(w, h, T, a.screen || 'cards')); if (a.screen === 'cards' || !a.screen) { limb([[1260, 1100], [1180, 760], [1080, 640]], 26, {}, 1, '#e7c9a2'); gc(1080, 640, 40 + ((FD * 6) % 30), C.orange, .8, 2); } }
  cloud(300, 260, .8, { rain: true }); noteRain(200, 330, 200, 300, 8);
  consL([[0, 470, W, 470], [960, 0, 960, H]]);
} };
function popupBook(x, y, s, o, T) { // a tour guide that opens into a landscape; o = 0 shut .. 1 open
  X.save(); X.translate(x, y); X.scale(s, s);
  const ang = lerp(0, 1, o);
  for (const sd of [-1, 1]) { const pg = PP([[0, 0], [sd * 620 * ang + sd * 10, -40 * ang], [sd * 620 * ang + sd * 10, 240], [0, 280]]); fillP(pg, C.cream); hatch(pg, sd * 300, 120, 320, .7, 8, C.ink, .8, .2); iP([[0, 0], [sd * 620 * ang + sd * 10, -40 * ang], [sd * 620 * ang + sd * 10, 240], [0, 280]], true, C.ink, 2.6); }
  const cv = PR(-30, 0, 60, 290); fillP(cv, C.brick); iBox(-30, 0, 60, 290, C.ink, 2.4);
  if (o > .2) { const u = eo(cl((o - .2) / .8)); X.save(); X.translate(0, 0); X.scale(1, u);
    const hl = PP([[-560, 0], [-300, -260], [-80, -120], [120, -320], [380, -140], [560, 0]]); fillP(hl, C.sage); hatch(hl, 0, -150, 560, .5, 7, C.ink, .9, .4, [0, 40]); iP([[-560, 0], [-300, -260], [-80, -120], [120, -320], [380, -140], [560, 0]], true, C.ink, 2.4);
    sunIll(340, -420, 70, C.orange, .6); palm(-380, 0, .6); plane(-60, -460, .45, -.2); iline(-560, 0, 560, 0, C.ink, 2.4);
    for (const tx of [-240, 200]) { iline(tx, 0, tx, -200, C.ink, 2, .6, false); } X.restore(); traveller(-120, -6, .45 * u + .01, { look: 1, legs: walkPh(), case: true }); }
  lab(-300, 200, 'THE GRAND TOUR', C.ink, .9, 22, 'center', 'alphabetic', 'bold'); X.restore();
}
SU.appInside = { mode: 'ill', f(q, p, a, T) { // chorus 4: she is inside his phone; the screen's bars are the cage
  stripes(C.paper, '#d9e0cf', 130, -.62, 0, C.sage); cam(a.fx2 || 960, a.fy2 || 520, lerp(a.z0 || 1, a.z1 || 1.08, eo(p)));
  hand(1020, 900, 1.5, -.08);
  phoneBody(960, 470, 2.2, -.04, (w, h) => { stripes(C.paper, '#ead6a6', 40, -.62, 0, C.ochre); X.save(); X.translate(w / 2, h * .82); X.scale(.22, .22); agent(0, 0, 1, { talk: a.talk ? Math.abs(Math.sin(T * 9)) * .9 : 0, look: 0 }); desk(0, 0, 420, 1); X.restore(); fillP(PR(0, 0, w, 30), C.orange); lab(w / 2, 21, 'TRAVEL AGENT', C.cream, 1, 11, 'center', 'alphabetic', 'bold'); }, { bars: true });
  traveller(300, 1180, 1.6, { look: 1, mouth: sing(T), case: false }); cloud(300, 1180 - 720, .9, { rain: true }); noteRain(160, 520, 280, 300, 10);
  bird(1500, 220, .9, flap()); gc(1500, 220, 120, C.orange, .6, 1.6);
} };
SU.shopClosed = { mode: 'ill', f(q, p, a, T) { // the ending (Robin's call: end on the shop): the agency closed, for lease, at dusk in
  // settled snow; he stands under the lamp reading his phone, turns his head as little Bob passes with piano and Junos
  SU.shop.f(q, p, { snow: 1, closed: 1, z: 1, push: 1.03 }, T);
  const fx = 380, fy = 150, fw = 1160, fh = 760;
  // the lamp is lit: a flat hatched pool of light, no gradient
  const cone = PP([[300, 150], [130, fy + fh + 90], [480, fy + fh + 90]]); fillP(cone, '#f0d27a', .32); hatch(cone, 300, 600, 480, 1.4, 9, C.ochre, 1, .35); fillP(PE(300, 140, 24, 18), '#ffe9a8'); iE(300, 140, 26, 20, 0, C.ink, 2.2);
  const wx = 470, wy = 490, ww = 620, wh = 360; fillP(PR(wx, wy, ww, wh), '#cbc3b0'); hatch(PR(wx, wy, ww, wh), wx + ww / 2, wy + wh / 2, 420, .8, 10, C.ink, .9, .45); iBox(wx, wy, ww, wh, C.ink, 3); iline(wx + ww / 2, wy, wx + ww / 2, wy + wh, C.ink, 3);
  const sg = PR(wx + 160, wy + 110, 300, 140); fillP(sg, C.cream); iBox(wx + 160, wy + 110, 300, 140, C.ink, 2.4); lab(wx + 310, wy + 175, 'FOR LEASE', C.brick, 1, 30, 'center', 'alphabetic', 'bold'); lab(wx + 310, wy + 215, 'ENQUIRE ONLINE', C.ink, .8, 13, 'center');
  souvenirsOn(wx + 30, wy + wh - 6, T, .6);
  // settled snow: on the sign, the awning, the sill, and drifts along the pavement
  const drift = (x0, x1, y, th, seed) => { const r = M32(seed), top = []; for (let x = x0; x <= x1; x += 24) top.push([x, y - th * (.6 + r() * .5)]); const pts = top.concat([[x1, y + 4], [x0, y + 4]]); fillP(PP(pts), '#fbfbf6'); hatch(PP(pts), (x0 + x1) / 2, y, (x1 - x0) / 2, .2, 9, C.sky, .8, .25); iP(top, false, C.ink, 1.8, 1, false, .6); };
  drift(fx + 130, fx + fw - 130, fy + 36, 16, 71); drift(fx + 60, fx + fw - 60, fy + 190, 20, 72); drift(wx, wx + ww, wy + wh, 14, 73); drift(-40, W + 40, fy + fh + 6, 26, 74);
  const pv = PP([[-200, fy + fh + 40], [W + 200, fy + fh + 40], [W + 200, H + 40], [-200, H + 40]]); fillP(pv, '#f4f4ee', .75); hatch(pv, 960, 1000, 1100, .1, 14, C.sky, .8, .3);
  // little Bob crosses the whole frame, on screen from the cut, at a walk (Bob's standing request)
  const bx = lerp(930, 1880, seg(T, 400.0, 403.42));
  // the traveller under the lamp: reading his phone, then his head turns to watch little Bob go by
  const tx = 330, ty = 1010, ts = .78, look = lerp(-.3, 1, eo(seg(bx, 960, 1250)));
  traveller(tx, ty, ts, { look, armR: [2.6, -1.9], hat: true }); const [hx, hy] = handAt(tx, ty, ts, [2.6, -1.9]);
  phoneBody(hx + 6, hy - 20, .14, -.2, (w, h) => appScreen(w, h, T, 'chat')); cloud(tx, ty - 520 * ts, .45, {});
  littleBob(bx, 1050, .8, T);
} };
SU.forkRoad = { mode: 'ill', f(q, p, a, T) { // "didn't use a fork": a fork in the road, and he goes straight between the branches
  stripes(C.paper, '#e0cfd6', 140, -.62, 0, C.plum); cam(960, 540, lerp(1.05, 1, eo(p)));
  const hz = 500, g = PR(-200, hz, W + 400, 700); fillP(g, '#a8a878'); hatch(g, 960, hz + 300, 1400, -.2, 9, C.ink, .8, .3); iline(-200, hz, W + 200, hz, C.ink, 2.4);
  const rd = (pts) => { const pp = PP(pts); fillP(pp, '#8a8172'); hatch(pp, 960, 800, 700, .1, 6, C.ink, .9, .5); iP(pts, true, C.ink, 2.4); };
  rd([[860, H + 40], [1060, H + 40], [1010, 760], [910, 760]]); rd([[910, 760], [960, 760], [420, hz + 4], [380, hz + 4]]); rd([[960, 760], [1010, 760], [1540, hz + 4], [1500, hz + 4]]);
  for (const [x, t] of [[420, 'LEFT'], [1500, 'RIGHT']]) { const sp = PR(x - 70, hz - 160, 140, 50); iline(x, hz, x, hz - 110, C.ink, 4); fillP(sp, C.cream); iBox(x - 70, hz - 160, 140, 50, C.ink, 2); lab(x, hz - 126, t, C.ink, .9, 18, 'center', 'alphabetic', 'bold'); }
  const u = eo(p), y = lerp(1000, hz + 40, u), s = lerp(1.1, .25, u); X.setLineDash([6, 8]); X.beginPath(); X.moveTo(960, 1000); X.lineTo(960, hz); stroke(C.orange, 2.4, .9); X.setLineDash([]);
  traveller(960, y, s, { hat: false, coat: C.plum, legs: walkPh(), look: 0 }); lab(980, hz - 40, 'STRAIGHT ON', C.orange, .9, 16, 'left', 'alphabetic', 'bold');
  const fk = PP([[1700, 900], [1712, 900], [1712, 1000], [1700, 1000]]); for (let i = 0; i < 4; i++) iline(1694 + i * 7, 830, 1694 + i * 7, 900, C.ink, 2.2, 1, false); fillP(fk, '#9aa0a8'); iBox(1700, 900, 12, 100, C.ink, 1.6); X.setLineDash([4, 6]); gc(1706, 900, 90, C.brick, .9, 2); X.setLineDash([]);
  consL([[0, hz, W, hz], [960, 0, 960, H]]);
} };
SU.treadmill = { mode: 'ill', f(q, p, a, T) { // moving is half the cure: he walks hard and goes nowhere
  stripes(C.paper, '#e3dbc0', 140, -.62, -T * 200, C.tan); cam(960, 560, lerp(1, 1.1, eo(p)));
  const ty = 900, b = PR(360, ty, 1200, 60); fillP(b, '#3b3430'); X.beginPath(); const off = (T * 400) % 40; for (let x = 360 - off; x < 1560; x += 40) { X.moveTo(x, ty + 4); X.lineTo(x + 10, ty + 56); } stroke(C.cream, 2, .6); iBox(360, ty, 1200, 60, C.ink, 3);
  for (const ex2 of [360, 1560]) { fillP(PE(ex2, ty + 30, 30, 30), '#6b6b6b'); iE(ex2, ty + 30, 30, 30, 0, C.ink, 2.4); }
  iline(1500, ty, 1600, ty - 420, C.ink, 7); const cp = PR(1520, ty - 520, 220, 130); fillP(cp, '#2b2420'); iBox(1520, ty - 520, 220, 130, C.ink, 2.4); lab(1630, ty - 470, 'DIST 0.0 KM', C.cyan, 1, 15, 'center'); lab(1630, ty - 430, 'CURE 50%', C.orange, 1, 18, 'center', 'alphabetic', 'bold');
  traveller(960, ty, 1.35, { legs: walkPh() * 1.8, look: 1, mouth: sing(T), case: true, armL: [-.5, -.4] }); cloud(960, ty - 640, .9, { rain: true }); noteRain(820, ty - 580, 280, 300, 12);
  for (let i = 0; i < 8; i++) { const y = 300 + i * 70; gl(200 - ((T * 900 + i * 120) % 300), y, 330 - ((T * 900 + i * 120) % 300), y, C.ink, .5, 2); }
  consL([[0, ty, W, ty], [960, 0, 960, H]]);
} };
SU.puppetHand = { mode: 'ill', f(q, p, a, T) { // "I see the string": it goes up to a hand in the sky
  SU.mule.f(q, p, { fz: 1 }, T);
  const s = 1.25, tx = 760, gy = 930, hatY = gy + 10 - 360 * s, px = tx + 560, py = hatY - 90;
  const hx = lerp(px + 120, px + 40, eo(p)), hy = -60;
  X.beginPath(); X.moveTo(px, py); X.lineTo(hx, hy + 200); stroke(C.ink, 1.4, 1); gl(px, py, hx, hy + 200, C.orange, .9, 2.4);
  for (const [dx2, tx2] of [[-40, tx - 20], [40, tx + 40]]) { X.beginPath(); X.moveTo(hx + dx2, hy + 200); X.lineTo(tx2, gy + 10 - 300 * s); stroke(C.ink, 1, .8); }
  hand(hx, hy, 1.1, Math.PI); X.save(); X.translate(hx, hy + 210); X.rotate(Math.sin(T * 2) * .1); const bar = PR(-140, -10, 280, 20); fillP(bar, '#8a5530'); iBox(-140, -10, 280, 20, C.ink, 2.4); X.restore();
  lab(hx + 180, hy + 260, 'WHO HOLDS IT?', C.brick, .95, 20, 'left', 'alphabetic', 'bold');
} };
SU.sOuroboros = { mode: 'sch', f(q, p, a, T) { // the vicious circle as a snake eating its tail, his route printed along it
  schBG(); cam(960, 540, lerp(1, 1.1, eo(p)));
  lattice(960, 540, 80, 9, C.lav, .06);
  const R0 = 330, th = T * .5, n = 140;
  for (let i = 0; i < n; i++) { const an = th + i / n * TAU * .94, w = lerp(10, 60, Math.sin(Math.PI * i / n) * .7 + .3 * (1 - i / n)); const x = 960 + Math.cos(an) * R0, y = 540 + Math.sin(an) * R0; if (i % 2 === 0) { gl(x - Math.cos(an) * w / 2, y - Math.sin(an) * w / 2, x + Math.cos(an) * w / 2, y + Math.sin(an) * w / 2, C.lav, .6, 1.2); } }
  X.beginPath(); for (let i = 0; i <= n; i++) { const an = th + i / n * TAU * .94; const x = 960 + Math.cos(an) * R0, y = 540 + Math.sin(an) * R0; i ? X.lineTo(x, y) : X.moveTo(x, y); } stroke(C.white, 2, .9);
  const ha = th + TAU * .94, hx = 960 + Math.cos(ha) * R0, hy = 540 + Math.sin(ha) * R0; gc(hx, hy, 46, C.mag, .95, 2); star(hx + Math.cos(ha + 1.4) * 20, hy + Math.sin(ha + 1.4) * 20, 4, C.mag, 1);
  const st = ['BLUES', 'TRAVEL AGENT', 'TICKET', 'AWAY', 'HOME']; st.forEach((s2, i) => { const an = th + (i + .5) / 5 * TAU * .94; lab(960 + Math.cos(an) * (R0 + 80), 540 + Math.sin(an) * (R0 + 80), s2, i === 0 ? C.mag : C.white, .9, 14, 'center', 'middle'); });
  traveller(960, 640, .42, { sch: 1, col: C.lav, legs: walkPh() * 1.3, case: true }); lab(960, 690, 'LAP ' + (Math.floor(q * 4) + 1), C.mag, .9, 18, 'center');
  screen(); schFrame('06', 'THE LOOP', 'OUROBOROS · EXIT: NONE');
} };

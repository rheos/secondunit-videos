// Draft 2 story layer: the desk that follows him, the passport that fills, the things he carries, little Bob,
// and the hand-placed cut list. Every cut is [time, set-up, args, post]: a new action or framing, timed to a sung
// word (Whisper word starts; snap to vocal-stem onsets later). args.fx/fy/fz re-frame any set-up (see cam()).
// post(q, p, T) draws over the set-up in its own camera, for the gags that escalate within a scene.
'use strict';

// ---------- things he carries: collected on a word, then on every desk and suitcase after it ----------
const SOUV = [['carrot', 158.0], ['cork', 186.0], ['ticket', 316.0], ['feather', 362.0]];
const carried = (T) => SOUV.filter(([, t]) => T >= t).map(([k]) => k);
function souvenir(k, x, y, s = 1) {
  X.save(); X.translate(x, y); X.scale(s, s);
  if (k === 'carrot') carrot(0, -10, .6, 1.35);
  if (k === 'cork') { const c = PR(-12, -34, 24, 34); fillP(c, C.tan); shade(c, 0, -17, 30, [6, -4], .6, 3); iBox(-12, -34, 24, 34, C.ink, 1.8); }
  if (k === 'ticket') { for (let i = 0; i < 5; i++) { const b = PR(-60 + i * 4, -8 - i * 7, 120, 14); fillP(b, i % 2 ? C.cream : C.orange); iBox(-60 + i * 4, -8 - i * 7, 120, 14, C.ink, 1.4); } }
  if (k === 'feather') { const f = PE(0, -30, 10, 34, .5); fillP(f, C.teal); hatch(f, 0, -30, 36, .5 + 1.57, 3, C.ink, .8, .6); iE(0, -30, 10, 34, .5, C.ink, 1.6); iline(-14, 4, 12, -60, C.ink, 1.4, 1, false); }
  X.restore();
}
function souvenirsOn(x, y, T, s = 1) { carried(T).forEach((k, i) => souvenir(k, x + i * 80 * s, y, s)); }

// ---------- little Bob (Bob's standing request, 2026-10-11): the Satisfied Mind figure, redrawn in this ink ----------
// Profile, walking right; red brimmed hat, blue tunic, red sleeves, yellow belt and legs; drags his toy piano on a
// rope with three Junos hopping behind it on strings. Shapes follow the approved drawing (satisfied-mind tarot figures).
function littleBob(x, y, s, T) {
  const st = Math.floor(T * 8 + 1e-6) % 4, aa = [.34, 0, -.34, 0][st], bob = st % 2 ? 0 : -3, k = 1 / s;
  const RED = '#b8432f', BLUE = '#4f6f9a', YEL = '#d9a636', FLESH = '#eac09a';
  // piano + junos behind him (to his left)
  const px = x - 250 * s, py = y, tilt = st % 2 ? .03 : -.02;
  for (let i = 0; i < 3; i++) {
    const jx = px - (110 + i * 70) * s, hop = (st + i) % 2 ? 10 : 0, jy = py - hop * s, rot = [[0, .5, -.4, 1.1][(st + i) % 4]][0] * (i % 2 ? -1 : 1);
    X.beginPath(); X.moveTo(px - 80 * s, py - 16 * s); X.quadraticCurveTo((px - 80 * s + jx) / 2, py, jx, jy - 14 * s); stroke(C.ink, 1.6, .9);
    X.save(); X.translate(jx, jy); X.rotate(rot); X.scale(s, s);
    const bs = PR(-16, -10, 32, 10); fillP(bs, '#2b2420'); iBox(-16, -10, 32, 10, C.ink, 1.6 * k);
    const fig = [[-5, -18], [5, -18], [4, -46], [16, -78], [11, -80], [3, -56], [0, -60], [-3, -56], [-11, -80], [-16, -78], [-4, -46]];
    fillP(PP(fig), '#d6a632'); hatch(PP(fig), 0, -45, 50, .8, 3 * k, C.ink, .7 * k, .5, [4, -2]); iP(fig, true, C.ink, 1.6 * k, 1, false, .4 * k);
    fillP(PE(0, -66, 5.5, 5.5), '#d6a632'); iE(0, -66, 5.5, 5.5, 0, C.ink, 1.4 * k, 1, false, .3 * k);
    X.restore();
    if (hop) for (let c = 0; c < 3; c++) { const an = -1.9 + c * .5; gl(jx + Math.cos(an) * 22 * s, jy - 10 * s + Math.sin(an) * 22 * s, jx + Math.cos(an) * 34 * s, jy - 10 * s + Math.sin(an) * 34 * s, C.ink, .9, 1.6); }
  }
  X.save(); X.translate(px, py); X.rotate(tilt); X.scale(s, s);
  for (const wx of [-60, 60]) { fillP(PE(wx, -9, 9, 9), '#2b2420'); iE(wx, -9, 9, 9, 0, C.ink, 1.8 * k); }
  const body = PR(-80, -176, 160, 152); fillP(body, '#8a5530'); shade(body, 0, -100, 120, [20, -10], .9, 5 * k); iBox(-80, -176, 160, 152, C.ink, 2.6 * k);
  const lid = PR(-88, -190, 176, 16); fillP(lid, '#8a5530'); iBox(-88, -190, 176, 16, C.ink, 2.2 * k);
  const pan = PR(-56, -160, 112, 46); fillP(pan, YEL); iBox(-56, -160, 112, 46, C.ink, 1.8 * k); X.beginPath(); wP([[-40, -134], [-24, -150], [-6, -134], [10, -150], [28, -134], [42, -146]], false, .5 * k); stroke(C.ink, 1.6 * k);
  const keys = PR(-84, -104, 168, 22); fillP(keys, '#ffffff'); iBox(-84, -104, 168, 22, C.ink, 1.8 * k); X.beginPath(); for (let i = 1; i < 14; i++) { X.moveTo(-84 + i * 12, -104); X.lineTo(-84 + i * 12, -83); } stroke(C.ink, 1 * k, .8);
  for (let i = 0; i < 13; i++) { const n = i % 7; if (n === 2 || n === 6) continue; fillP(PR(-84 + (i + 1) * 12 - 3.5, -104, 7, 12), C.ink); }
  X.restore();
  // rope from his back hand to the piano hook
  const hook = [px + 84 * s, py - 70 * s], hand = [x - 34 * s, y - 150 * s + bob * s];
  X.beginPath(); X.moveTo(hand[0], hand[1]); X.quadraticCurveTo((hand[0] + hook[0]) / 2, (hand[1] + hook[1]) / 2 + 22 * s, hook[0], hook[1]); stroke(C.ink, 3, 1);
  // the man
  X.save(); X.translate(x, y + bob * s); X.scale(s, s);
  const leg = (a, col) => limb([[0, -126], [Math.sin(a) * 62, -126 + Math.cos(a) * 62], [Math.sin(a) * 118, -126 + Math.cos(a) * 118]], 13, {}, k, col);
  leg(-aa, YEL); limb([[-22, -230], [-30, -170], [-34, -150]], 11, {}, k, RED);
  leg(aa, YEL); for (const a of [aa, -aa]) { const fx = Math.sin(a) * 118; fillP(PE(fx + 10, -6, 18, 8), '#2b2420'); iE(fx + 10, -6, 18, 8, 0, C.ink, 1.6 * k); }
  const tun = [[-30, -240], [0, -246], [30, -240], [34, -180], [44, -112], [0, -102], [-42, -112], [-34, -180]]; fillP(PP(tun), BLUE); shade(PP(tun), 0, -170, 90, [-14, -6], .9, 5 * k); iP(dens(tun, 20, true), true, C.ink, 2.6 * k, 1, true, .7 * k);
  fillP(PR(-36, -156, 73, 12), YEL); iBox(-36, -156, 73, 12, C.ink, 1.8 * k, 1, false);
  const hd = [[-20, -30], [-4, -50], [16, -48], [26, -30], [27, -12], [20, 2], [6, 6], [-12, -2], [-22, -14]].map(([a, b]) => [a + 2, b - 244]);
  fillP(PR(-7, -262, 18, 22), FLESH); fillP(PP(hd), FLESH); hatch(PP(hd), 0, -270, 30, .5, 3.4 * k, C.ink, .8 * k, .55, [6, -2]); iP(hd, true, C.ink, 2.4 * k, 1, true, .5 * k);
  fillP(PE(16.5, -269, 2.6, 2.6), C.ink); X.beginPath(); wP([[23, -274], [31, -260], [23, -257]], false, .3 * k); stroke(C.ink, 2 * k); X.beginPath(); wP([[14, -248], [22, -249]], false, .3 * k); stroke(C.ink, 1.8 * k);
  const crown = [[-18, -44], [-16, -76], [0, -82], [20, -78], [22, -44]].map(([a, b]) => [a + 2, b - 244]), brim = [[-40, -44], [-10, -50], [30, -50], [48, -42], [20, -36], [-20, -36]].map(([a, b]) => [a + 2, b - 244]);
  fillP(PP(crown), RED); shade(PP(crown), 2, -304, 30, [6, -3], .7, 3.4 * k); iP(crown, true, C.ink, 2.4 * k, 1, true, .5 * k); fillP(PP(brim), RED); iP(brim, true, C.ink, 2.4 * k, 1, true, .5 * k);
  limb([[20, -230], [-4, -180], [-34, -150]], 11, {}, k, RED); fillP(PE(-34, -150, 8, 8), FLESH); iE(-34, -150, 8, 8, 0, C.ink, 1.4 * k);
  X.restore();
}

// ---------- new set-ups ----------
function cageBars(cx, by, rx, ry, col = C.ink, w = 2.6, a = 1, gap) {
  X.beginPath(); for (let i = 0; i <= 17; i++) { const t = i / 17, xx = cx - rx + t * 2 * rx; if (gap && t > gap[0] && t < gap[1]) continue; const top = by - ry + (1 - Math.sin(Math.PI * t)) * 240; X.moveTo(xx + jit(1), by); X.lineTo(xx + jit(1), top + 120); X.quadraticCurveTo(xx, top, cx + (xx - cx) * .1, by - ry); } stroke(col, w, a);
  for (const yy of [by - 220, by - 460]) iE(cx, yy, rx, 30, 0, col, w * .85, a, false, 1, 0, Math.PI);
}
// The desk that follows him: wherever he ends up, her desk is already there.
SU.kiosk = { mode: 'ill', f(q, p, a, T) {
  const pl = a.place;
  if (pl === 'road') SU.road.f(q, p, {}, T);
  else if (pl === 'corridor') SU.corridor.f(q, p, { empty: 1 }, T);
  else if (pl === 'box') {
    stripes('#e2d2c4', '#d4bfae', 140, -.62, 0, C.plum); cam(960, 560, lerp(1, 1.05, eo(p)));
    const mq = PR(300, 60, 1320, 220); fillP(mq, '#7a2a3a'); shade(mq, 960, 170, 700, [0, -40], .2, 6); iBox(300, 60, 1320, 220, C.ink, 3);
    const bd = PR(420, 110, 1080, 120); fillP(bd, C.cream); iBox(420, 110, 1080, 120, C.ink, 2.2);
    X.font = 'bold 84px Georgia, serif'; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = C.ink; X.fillText(a.word || 'TOURS', 960, 172);
    for (let i = 0; i < 34; i++) { const bx = 320 + i * 38.8, on = ((i + (FD >> 1)) % 3) !== 0; for (const by of [80, 262]) { fillP(PE(bx, by, 9, 9), on ? '#ffe9a8' : '#b9a27a'); iE(bx, by, 9, 9, 0, C.ink, 1.2, 1, false, .4); if (on) gc(bx, by, 16, C.orange, .45, 1.2); } }
    const booth = PP([[760, 300], [1640, 300], [1640, 840], [760, 840]]); fillP(booth, '#c9a06a'); shade(booth, 1200, 570, 600, [40, 0], .9, 6); iBox(760, 300, 880, 540, C.ink, 3);
    const gls = PR(860, 360, 680, 340); fillP(gls, '#dfe6dd'); hatch(gls, 1200, 530, 420, -.95, 20, C.cream, 4, .4);
    poster(320, 380, 300, 400, 'plane'); iline(-200, 960, W + 200, 960, C.ink, 2.4);
  } else if (pl === 'cage') { stripes(C.paper, '#d9e0cf', 130, -.62, 0, C.sage); cam(960, 560, lerp(1, 1.05, eo(p))); const base = PE(1250, 880, 470, 60); fillP(base, '#7a4a2a'); iE(1250, 880, 470, 60, 0, C.ink, 2.6); }
  // her desk, her, him, his cloud
  const dx = pl === 'box' ? 1200 : 1250, dy = pl === 'box' ? 700 : 820, ds = pl === 'box' ? 1.15 : 1.3;
  if (pl === 'road') { iline(1460, dy, 1460, 300, C.ink, 5); const can = PP([[1160, 330], [1760, 330], [1460, 200]]); fillP(can, C.cream); X.save(); X.clip(can); for (let i = 0; i < 12; i++) fillP(PP([[1160 + i * 100, 330], [1210 + i * 100, 330], [1460, 200]]), C.orange); X.restore(); iP([[1160, 330], [1760, 330], [1460, 200]], true, C.ink, 2.4); }
  agent(dx, dy, ds, { talk: a.talk ? (singing(T) ? 0 : Math.abs(Math.sin(T * 9)) * .9) : 0, point: a.point ? eo(seg(p, .1, .5)) : 0, stamp: a.stamp ? (((FD >> 1) % 3) === 0 ? 1 : 0) : 0, look: -.7 });
  if (pl === 'box') { const gls = PR(860, 360, 680, 340); hatch(gls, 1200, 530, 420, -.95, 26, C.cream, 5, .35); iBox(860, 360, 680, 340, C.ink, 3); fillP(PR(1120, 640, 160, 60), '#2b1d14'); }
  desk(dx, dy, pl === 'box' ? 700 : 560, 1);
  souvenirsOn(dx - 200, dy - 22, T, .9);
  if (pl === 'cage') cageBars(1250, 880, 450, 720, C.ink, 3, 1);
  const tx = a.tx || 600; traveller(tx, 1060, 1.25, { look: .9, mouth: sing(T), case: !a.ticket, armR: a.ticket ? [2.0, -.6] : a.beg ? [1.6, .3] : [-.1, .2], armL: a.beg ? [1.3, .4] : [.15, -.2] });
  if (a.ticket) ticket(tx + 150, 1060 - 330 * 1.25, .32, -.3, { to: a.to || 'AWAY' });
  cloud(tx, 1060 - 470 * 1.25, .7, { rain: true });
  if (a.exit) { const ex2 = PR(1500, 360, 240, 90); fillP(ex2, C.sage); iBox(1500, 360, 240, 90, C.ink, 2.4); lab(1620, 418, 'EXIT →', C.cream, 1, 34, 'center', 'alphabetic', 'bold'); gc(1620, 405, 160, C.orange, .8, 2); }
  consL([[0, dy, W, dy], [dx, 0, dx, H]]);
} };
SU.posterCU = { mode: 'ill', f(q, p, a, T) {
  stripes('#d7dfd2', '#cbd5c6', 120, -.62, 0, C.teal); cam(960, 540, lerp(1, 1.12, eo(p)));
  poster(560, 30, 800, 1020, a.kind || 'palm');
  if ((a.kind || 'palm') === 'palm') for (let i = 0; i < 4; i++) gc(1104, 234, 150 + i * 40 + ((FD * 5) % 40), C.orange, .6, 2);
  cloud(300, 300, 1, { rain: true }); traveller(250, 1240, 1.6, { look: 1, mouth: 0 });
  consL([[0, 660, W, 660], [960, 0, 960, H]]);
} };
SU.seesaw = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e8d0c4', 130, -.62, 0, C.rose); cam(960, 560, lerp(1, 1.06, eo(p)));
  const flip = cl((T - 283.6) / .25), ang = lerp(-.28, .36, eo(flip)) + (flip >= 1 ? Math.sin((T - 283.8) * 18) * .04 * Math.max(0, 1 - (T - 283.8)) : 0);
  const fl = PP([[900, 900], [1020, 900], [960, 760]]); fillP(fl, '#7a4a2a'); shade(fl, 960, 840, 80, [10, 0], .9, 4); iP([[900, 900], [1020, 900], [960, 760]], true, C.ink, 2.6);
  iline(-200, 900, W + 200, 900, C.ink, 2.6); fillP(PR(-200, 900, W + 400, 300), '#c4ae84');
  X.save(); X.translate(960, 760); X.rotate(ang);
  const pk = PR(-640, -24, 1280, 24); fillP(pk, '#a5703f'); shade(pk, 0, -12, 640, [0, -8], .1, 5); iBox(-640, -24, 1280, 24, C.ink, 2.6);
  // THINK: a stack of heavy books, left
  for (let i = 0; i < 4; i++) { const b = PR(-560, -24 - (i + 1) * 46, 260, 44); fillP(b, [C.teal, C.brick, C.ochre, C.sage][i]); shade(b, -430, -24 - (i + .5) * 46, 140, [0, -10], .2, 4); iBox(-560, -24 - (i + 1) * 46, 260, 44, C.ink, 2.2); }
  lab(-430, -240, 'THINK', C.ink, .95, 30, 'center', 'alphabetic', 'bold');
  // FEEL: one small heart, right
  X.save(); X.translate(450, -70); X.scale(1.2, 1.2); const hp = new Path2D(); hp.moveTo(0, 40); hp.bezierCurveTo(-60, 0, -40, -50, 0, -20); hp.bezierCurveTo(40, -50, 60, 0, 0, 40); fillP(hp, C.rose); hatch(hp, 0, 0, 50, .7, 4, C.ink, .9, .6, [8, -8]); X.lineWidth = 2.4; X.strokeStyle = C.ink; X.stroke(hp); X.restore();
  lab(450, -160, 'FEEL', C.ink, .95, 30, 'center', 'alphabetic', 'bold');
  X.restore();
  if (flip > 0 && flip < 1 || (T > 283.8 && T < 284.6)) for (let i = 0; i < 3; i++) gc(960 + 540, 760 + 230, 60 + i * 40 + (T - 283.8) * 200, C.orange, .8, 2.4);
  traveller(300, 1000, 1.1, { look: 1, mouth: sing(T), hat: true }); cloud(300, 480, .6, { rain: true });
  consL([[0, 760, W, 760], [960, 0, 960, H]]); consC([[960, 760, 640]]);
} };
SU.sSeesaw = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.05, 1, eo(p)));
  const flip = cl((T - 283.6) / .25), ang = lerp(-.28, .36, eo(flip));
  X.save(); X.translate(960, 700); X.rotate(ang); gl(-640, 0, 640, 0, C.white, .9, 2); stip(PR(-560, -190, 260, 186), -430, -100, 200, 1500, C.cyan, .6, 1.4); X.strokeStyle = C.cyan; X.lineWidth = 1.2; X.strokeRect(-560, -190, 260, 186);
  star(450, -60, 8, C.mag, 1); gc(450, -60, 40, C.mag, .8, 1.4);
  for (const [x2, col, L] of [[-430, C.cyan, flip ? 80 : 220], [450, C.mag, flip ? 260 : 60]]) { gl(x2, 10, x2, 10 + L, col, .9, 2.2); X.beginPath(); X.moveTo(x2 - 9, L - 4); X.lineTo(x2, 10 + L); X.lineTo(x2 + 9, L - 4); stroke(col, 2.2, .9); }
  X.restore(); X.beginPath(); X.moveTo(900, 840); X.lineTo(1020, 840); X.lineTo(960, 700); X.closePath(); stroke(C.lav, 1.4, .9);
  gc(960, 700, 220, C.lav, .5, 1, [3, 6], -Math.PI, 0); lab(1180, 640, 'θ = ' + (ang * 57.3).toFixed(0) + '°', C.white, .9, 16);
  lab(530, 300, 'm(THINK) = 41 YR', C.cyan, .9, 14); lab(1300, 300, 'm(FEEL) = 0.2 S', C.mag, .9, 14);
  screen(); schFrame('17', 'BALANCE', 'THINK vs FEEL');
} };
const STAMPS = [['HOME', 'ellipse'], ['ROADSIDE', 'rect'], ['WARD 3', 'hex'], ['BOX OFFICE', 'rect'], ['THE CAGE', 'ellipse']];
SU.sPassport = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.08, 1, eo(p)));
  for (const x0 of [440, 980]) { X.strokeStyle = C.lav; X.lineWidth = 1.4; X.strokeRect(x0, 200, 500, 680); graticule(x0 + 250, 540, 500, 680, 34, C.lav, .1); }
  gl(960, 190, 960, 890, C.white, .8, 1.6); lab(470, 240, 'VISAS', C.white, .9, 16);
  const n = a.n || 1;
  for (let i = 0; i <= n && i < STAMPS.length; i++) {
    const [name, sh] = STAMPS[i], cx = [640, 760, 1180, 1300, 700][i], cy = [380, 640, 360, 640, 800][i], newest = i === n, sc = newest ? ex(p * 3) : 1, col = newest ? C.mag : C.cyan;
    if (sc <= 0) continue; X.save(); X.translate(cx, cy); X.rotate([-.2, .15, -.1, .25, -.3][i]); X.scale(sc * (newest ? lerp(1.6, 1, ex(p * 3)) : 1), sc * (newest ? lerp(1.6, 1, ex(p * 3)) : 1));
    if (sh === 'ellipse') { gc(0, 0, 90, col, .95, 2); gc(0, 0, 74, col, .6, 1); } else if (sh === 'hex') iP(hexPts(0, 0, 90), true, col, 2, .95, false, .3); else { X.strokeStyle = col; X.lineWidth = 2; X.strokeRect(-110, -60, 220, 120); X.strokeRect(-100, -50, 200, 100); }
    stip(PE(0, 0, 80, 60), 0, 0, 90, 300, col, .5, 1.4); lab(0, 6, name, col, .95, 18, 'center', 'middle', 'bold'); X.restore();
  }
  lab(1000, 850, 'DISTANCE FROM BLUES: 0 KM', C.mag, .95, 15);
  screen(); schFrame('20', 'PASSPORT', 'VISA ' + (n + 1) + ' OF ∞');
} };
SU.sNews = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1, 1.1, eo(p)));
  X.strokeStyle = C.lav; X.lineWidth = 1.4; X.strokeRect(460, 120, 1000, 860); gl(460, 260, 1460, 260, C.white, .8, 2);
  lab(960, 220, 'THE DAILY FORECAST', C.white, .95, 40, 'center', 'alphabetic', 'bold');
  for (let c = 0; c < 4; c++) { const x0 = 490 + c * 245; for (let l = 0; l < 26; l++) { const y = 420 + l * 20, L = 200 - (l % 5 === 4 ? 80 : 0) - R() * 10; gl(x0, y, x0 + L, y, C.lav, .45, 2); } }
  X.strokeStyle = C.lav; X.strokeRect(490, 290, 440, 110); lab(510, 340, 'BLUES: 100%', C.cyan, .95, 24, 'left', 'alphabetic', 'bold'); lab(510, 375, 'OUTLOOK: MORE OF THE SAME', C.lav, .8, 13);
  X.strokeRect(980, 290, 450, 110); lab(1000, 340, 'FARE SALE', C.mag, .95, 24, 'left', 'alphabetic', 'bold'); lab(1000, 375, 'ANYWHERE BUT HERE', C.lav, .8, 13);
  gc(1205, 340, 260 * ex(p * 2), C.mag, .9, 2, null, 0, TAU * eo(p * 1.5)); cloud(700, 700, .8, { sch: 1, col: C.cyan, rain: true });
  screen(); schFrame('00', 'THE NEWS', 'TODAY');
} };
SU.sContour = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.1, 1, eo(p)));
  for (const [cx, cy, n] of [[600, 420, 9], [1350, 640, 11], [1000, 200, 6]]) for (let i = 1; i <= n; i++) { X.beginPath(); for (let k = 0; k <= 60; k++) { const an = k / 60 * TAU, rr = i * 36 * (1 + .18 * Math.sin(an * 3 + i + cx) + .08 * Math.sin(an * 7)); const x = cx + Math.cos(an) * rr * 1.3, y = cy + Math.sin(an) * rr; k ? X.lineTo(x, y) : X.moveTo(x, y); } stroke(i % 5 === 0 ? C.white : C.lav, i % 5 === 0 ? 1.4 : 1, i % 5 === 0 ? .7 : .4); if (i % 3 === 0) lab(cx + i * 46, cy, String(i * 100), C.lav, .5, 10); }
  const rd = []; for (let i = 0; i <= 40; i++) { const t = i / 40; rd.push([lerp(0, W, t), 900 - Math.sin(t * 3) * 120 - t * 200]); } path(rd, C.white, 2, .8, [12, 8]);
  const cu = (q * 1.2) % 1, ci = Math.floor(cu * 40); star(rd[ci][0], rd[ci][1], 5, C.mag, 1); lab(rd[ci][0] + 20, rd[ci][1] - 16, 'CAR', C.mag, .9, 13);
  star(rd[40][0] - 40, rd[40][1], 4, C.white, .7); lab(1500, 760, 'LAND · ALL OF IT', C.cyan, .9, 14);
  screen(); schFrame('08', 'TERRAIN', 'CONTOUR 100 M');
} };
SU.sForm = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.06, 1, eo(p)));
  X.strokeStyle = C.lav; X.lineWidth = 1.4; X.strokeRect(560, 90, 800, 920); lab(600, 160, 'FORM 27', C.white, .95, 28, 'left', 'alphabetic', 'bold'); lab(600, 195, 'ADMISSION · TREATMENT', C.lav, .7, 13);
  for (let i = 0; i < 8; i++) { const y = 260 + i * 70; X.strokeRect(600, y, 26, 26); if (i < Math.floor(q * 10)) { gl(604, y + 13, 612, y + 22, C.cyan, .95, 2); gl(612, y + 22, 624, y + 2, C.cyan, .95, 2); } gl(650, y + 20, 1300 - (i % 3) * 120, y + 20, C.lav, .45, 2); }
  gl(600, 900, 1100, 900, C.white, .8, 1.4); lab(600, 930, 'SIGNATURE OF PATIENT', C.lav, .7, 12);
  if ((FD >> 2) % 2) { gl(700, 860, 760, 920, C.mag, 1, 3); gl(760, 860, 700, 920, C.mag, 1, 3); }
  lab(1120, 905, 'NOT SIGNED', C.mag, .95, 18, 'left', 'alphabetic', 'bold');
  screen(); schFrame('12', 'CONSENT', 'NOT GIVEN');
} };
SU.sTicket = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.1, 1, eo(p)));
  lattice(960, 540, 70, 10, C.lav, .06); ticket(960, 540, 2, -.05, { sch: 1, col: C.lav, to: a.to || 'AWAY' });
  bracket(400, 860, 1520, 860, C.cyan, .8, '1 WAY'); star(1400, 400, 6, C.mag, 1); lab(1430, 380, a.note || 'RETURN: INCLUDED', C.mag, .95, 15);
  screen(); schFrame('05', 'TICKET', 'CLASS: ECONOMY');
} };
SU.shopEnd = { mode: 'ill', f(q, p, a, T) {
  SU.shop.f(q, p, { snow: 1, closed: 0, z: 1, push: 1.03 }, T);
  // back where he began: him and her through the window, his souvenirs on the sill
  X.save(); X.clip(PR(470, 490, 620, 360)); fillP(PR(470, 490, 620, 360), '#c9b896', .85); agent(900, 760, .55, { look: -.6 }); desk(900, 760, 260, .55); traveller(640, 850, .5, { sit: 0, look: .9, hat: true }); cloud(640, 590, .3, {}); X.restore();
  souvenirsOn(560, 845, T, .6);
  littleBob(lerp(-250, 2300, seg(T, 400.0, 402.3)), 1000, .62, T);
} };

// ---------- overlays (post) ----------
const POST = {
  rain: () => rain(380, 360, 300, 400, 30),
  paper: () => { const np = PR(1060, 470, 260, 190); fillP(np, C.cream); hatch(np, 1190, 565, 160, 0, 9, C.ink, 1, .45); iBox(1060, 470, 260, 190, C.ink, 2.2); lab(1190, 500, 'NEWS', C.ink, 1, 26, 'center', 'middle', 'bold'); },
  fan: (q, p) => { for (let i = 0; i < 5; i++) { X.save(); X.translate(1300, 640); X.rotate(-.9 + i * .3 * eo(p * 2)); const b = PR(-10, -170, 80, 120); fillP(b, [C.teal, C.rose, C.sage, C.ochre, C.orange][i]); hatch(b, 30, -110, 80, .8, 5, C.ink, .8, .45, [6, -6]); iBox(-10, -170, 80, 120, C.ink, 1.8); X.restore(); } },
  deskSouv: (q, p, T) => souvenirsOn(1000, 682, T, 1),
  shrug: () => { lab(1180, 300, '?', C.brick, 1, 120, 'center', 'middle', 'bold'); gc(1180, 300, 90, C.orange, .8, 2); },
  twin: () => { cloud(1180, 800, .35, { rain: true }); gc(1180, 800, 90, C.orange, .9, 2); },
  finger: () => { limb([[1500, 180], [1260, 300], [1120, 380]], 18, {}, 1, '#b8766b'); fillP(PE(1112, 384, 14, 12), '#e7c9a2'); iE(1112, 384, 14, 12, 0, C.ink, 1.8); gc(1112, 384, 50, C.orange, .9, 2); },
  horn: (q, p) => { const cone = PP([[1290, 350], [1300, 230], [980, 120 + 0], [940, 520]]); fillP(cone, '#d9b25a'); shade(cone, 1120, 320, 260, [-20, 0], .9, 5); iP([[1290, 350], [1300, 230], [980, 120], [940, 520]], true, C.ink, 2.6); for (let i = 0; i < 4; i++) gc(960, 320, 80 + i * 60 + ((FD * 8) % 60), C.orange, .8, 2.4, null, 2.2, 4.1); },
  hatFly: (q, p) => { X.save(); X.translate(lerp(1000, 300, eo(p)), lerp(530, 120, eo(p))); X.rotate(p * 9); const hb = PE(0, 0, 60, 11); fillP(hb, '#3d2a1f'); iE(0, 0, 60, 11, 0, C.ink, 2.2); X.restore(); },
  hitch: (q, p, T) => { traveller(560, 1060, 1.2, { look: 1, armR: [1.57, 1.57], mouth: sing(T) }); cloud(560, 1060 - 560, .7, { rain: true }); },
  ditch: (q, p) => { const d = PE(960, 760, 650, 210); hatch(d, 960, 760, 660, .3, 5, C.ink, 1, .5); iE(960, 760, 560, 160, 0, C.ink, 3, 1, true, 1, 0, Math.PI); lab(1500, 1000, 'DEPTH · LAP ' + (Math.floor(q * 4) + 2), C.brick, .9, 16, 'left', 'alphabetic', 'bold'); },
  peas: () => { for (let i = 0; i < 6; i++) { const pp = PE(1120 + i * 16, 728 - (i % 2) * 6, 7, 7); fillP(pp, C.sage); iE(1120 + i * 16, 728 - (i % 2) * 6, 7, 7, 0, C.ink, 1.2); } gc(1160, 740, 70, C.orange, .8, 2); lab(1160, 640, 'KNIFE ONLY', C.brick, .9, 14, 'center'); },
  waiter: (q, p, T) => { traveller(1560, 990, 1.3, { hat: false, coat: '#f4f1e8', sleeve: '#f4f1e8', look: -1, armR: [2.2, -.6] }); const tw = PR(1650, 520, 26, 80); fillP(tw, '#ffffff'); iBox(1650, 520, 26, 80, C.ink, 1.6); },
  orderlies: (q, p, T) => { for (const [x2, lk] of [[520, 1], [1320, -1]]) traveller(x2, 1000, 1.35, { hat: false, coat: '#f4f1e8', sleeve: '#f4f1e8', look: lk, armR: [-.1, .2] }); gc(860, 520, 240, C.teal, .7, 1.6, [6, 8]); },
  watcher: (q, p, T) => { traveller(200, 1060, 1.1, { look: 1, mouth: sing(T), sit: 0 }); cloud(200, 540, .55, { rain: true }); if (T >= 185.6) souvenir('cork', 260, 760, 1); },
  stick: () => { iline(1450, 600, 1450, 760, C.ink, 7); const br = PP([[1450, 460], [1530, 600], [1450, 600]]); fillP(br, '#a5703f'); iP([[1450, 460], [1530, 600], [1450, 600]], true, C.ink, 2); lab(1600, 560, 'CARDBOARD', C.brick, 1, 22, 'left', 'alphabetic', 'bold'); gc(1450, 500, 120, C.orange, .9, 2.2); },
  crooksSeats: (q, p, T) => { for (let i = 0; i < 3; i++) { const cx = 800 + i * 230, st = eo(seg(p, i * .15, i * .15 + .5)); traveller(lerp(1300 + i * 120, cx, st), lerp(760, 1000, st), lerp(.9, 1.2, st), { hat: true, look: -1, legs: walkPh() + i, coat: '#4a4038' }); fillP(PR(lerp(1300 + i * 120, cx, st) - 30 * lerp(.9, 1.2, st), lerp(760, 1000, st) - 322 * lerp(.9, 1.2, st), 60 * lerp(.9, 1.2, st), 14 * lerp(.9, 1.2, st)), C.ink); } },
  steal: (q, p) => { const hx = lerp(820, 640, eo(p)); limb([[960, 640], [880, 700], [hx, 760]], 14, {}, 1, '#4a4038'); ticket(hx - 60, 790, .25, .3, {}); lab(hx, 860, 'TICKET · GONE', C.brick, .95, 16, 'center', 'alphabetic', 'bold'); },
  singBird: (q, p, T) => { traveller(330, 1060, 1.3, { look: 1, mouth: sing(T) || Math.abs(Math.sin(T * 6)) * .8 }); cloud(330, 1060 - 610, .7, { rain: true }); for (let i = 0; i < 4; i++) { const t = (T * .8 + i / 4) % 1; X.save(); X.translate(lerp(420, 860, t), lerp(560, 400, t) + Math.sin(t * 12) * 20); fillP(PE(0, 0, 10, 8, -.4), C.ink); iline(9, 0, 9, -40, C.ink, 2.4, 1, false); X.restore(); } },
  ticketBird: (q, p, T) => { traveller(330, 1060, 1.3, { look: 1, armR: [2.0, -.5] }); cloud(330, 1060 - 610, .7, { rain: true }); ticket(560, 640, .3, -.2, { to: 'SKY' }); gc(620, 640, 110, C.orange, .8, 2); },
  feather: (q, p, T) => { traveller(330, 1060, 1.3, { look: 1, armR: [1.2, .6] }); cloud(330, 1060 - 610, .7, { rain: true }); souvenir('feather', lerp(900, 520, eo(p)), lerp(500, 860, eo(p)) + Math.sin(p * 14) * 20, 1.4); },
  homeQ: () => { lab(1180, 300, 'HOME?', C.brick, 1, 60, 'center', 'middle', 'bold'); },
  bullseye: (q, p) => { for (let i = 0; i < 3; i++) gc(800, 440, 30 + i * 30 + (1 - eo(p)) * 200, C.brick, .9, 2.6); lab(820, 360, 'HOME', C.brick, 1, 30, 'left', 'alphabetic', 'bold'); },
  ricochet: (q, p) => { const pts = [[960, 300], [1500, 140], [1700, 620], [1200, 980], [420, 760], [300, 260]]; const n = Math.max(2, Math.ceil(eo(p) * pts.length)); path(pts.slice(0, n), C.mag, 2.4, .95, [10, 6]); pts.slice(1, n).forEach(([x, y]) => { gc(x, y, 26, C.mag, .9, 1.6); ticks(x, y, 30, 12, 6, C.mag, .7, 1); }); lab(310, 230, 'BOUNCES: ' + (n - 1), C.mag, .95, 16); },
  windowMan: (q, p, T) => { const wp = PR(760, 380, 400, 220); fillP(wp, '#cfe0da'); cloud(960, 470, .5, {}); hatch(wp, 960, 490, 260, -.9, 18, C.cream, 4, .35); iBox(760, 380, 400, 220, C.ink, 3); chair(980, 1010, .9); traveller(1000, 1010, 1.25, { sit: 1, hat: false, look: -.2, coat: C.plum }); },
  doorShut: (q, p) => { const w2 = lerp(0, 360, eo(p * 1.5)); const d = PR(780, 360, w2, 240); fillP(d, C.sage); shade(d, 780 + w2 / 2, 480, 200, [-20, 0], .9, 4); iBox(780, 360, w2, 240, C.ink, 2.6); },
};

// ---------- the cut list (draft 3) ----------
// [time, set-up, args, post]. The world gets stranger act by act; the agent's form evolves:
// shop desk (31) -> roadside payphone (90.8) -> on hold in the endless corridor (220.5) -> the app (293.7)
// -> her inside the phone, the phone a cage (365.5) -> typing dots (379.3) -> the agency closed, for lease (400).
POST.holdPhone = (q, p, T) => { traveller(960, 980, .9, { look: 0, mouth: sing(T), phone: 'mobile' }); cloud(960, 980 - 420, .5, { rain: true }); for (let i = 0; i < 8; i++) { const t2 = (T * .3 + i / 8) % 1; X.save(); X.translate(960 + Math.sin(i * 2) * 300 * (1 - t2), lerp(470, 900, t2)); X.scale(lerp(.3, 1.4, t2), lerp(.3, 1.4, t2)); fillP(PE(0, 0, 8, 6, -.4), C.teal); iline(7, 0, 7, -26, C.teal, 2, 1, false); X.restore(); } };
var NOTES = 0;
// Cuts live in js/acts/act-*.js (CUTS_A..CUTS_E); buildShots() concatenates them in time order.
const SEC_T = [0, 31.1, 44.7, 59.0, 73.7, 90.8, 104.2, 116.6, 131.2, 160.1, 174.6, 188.7, 203.3, 220.5, 247.3, 262.6, 276.0, 293.7, 319.5, 334.4, 365.5, 392.1, 400.0, 403.42];
function buildShots() {
  const CUTS = [].concat(...['A', 'B', 'C', 'D', 'E'].map((k) => window['CUTS_' + k] || [])).sort((a, b) => a[0] - b[0]);
  return CUTS.map(([t0, key, args, post], i) => {
    const t1 = i + 1 < CUTS.length ? CUTS[i + 1][0] : 403.42, su = SU[key];
    const frame = (args.fx !== undefined || args.fy !== undefined || args.fz !== undefined) ? { fx: args.fx, fy: args.fy, fz: args.fz } : null;
    // q runs across the sung section this cut sits in, so a scene keeps moving over its returns
    const k = SEC_T.findIndex((t) => t > t0 + 1e-6), s0 = SEC_T[Math.max(0, k - 1)], s1 = SEC_T[k] ?? 403.42;
    return { t0, t1, mode: su.mode, key, draw: (p, lt) => { const T = t0 + lt, q = cl((T - s0) / (s1 - s0)); NOTES = T < 59 ? 0 : Math.round(lerp(2, 10, cl((T - 59) / 250))); CAMO = frame; su.f(q, p, args, T); if (post) post(q, p, T); CAMO = null; if (su.mode === 'ill' && key !== 'shopClosed' && key !== 'snowSettle' && key !== 'droste' && key !== 'e_droste' && T > LEAK_T0) { screen(); leak(cl((T - LEAK_T0) / (LEAK_T1 - LEAK_T0))); } } };
  });
}

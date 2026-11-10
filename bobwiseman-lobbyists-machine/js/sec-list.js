// Lobbyists at Parliament, the pay-for-a-hit machine (look test 01, rescue-machine look). One gold coin on one continuous
// path, the camera following it (contraptions method); every part a joke on its line (Kevin Ngo's K30). The hook is the
// machine ticking over: coins fed into a HIT slot, then the coin climbing the charts rung by rung, back into the slot.
// The publicist's list runs as one pass: yo-yo off a cellist's bow, a cardboard orchestra flipped up along a xylophone,
// a camera bulb for the zoo photo, a loop-the-loop through giant eyeglasses that are then hoisted onto the Rocker's face.
// Section 'list' of the whole-song machine: hook 1, verse 2, hook 2 (song 20.0-53.5), test 01. Engine: js/core.js.
(() => {
'use strict';
// ---------- places ----------
const SLOT = [-520, -884], BAGM = [-520, -1004];
const BOARD = { x: -380, y: -200, s: 1.1 };
const CELL = { x: 120, y: -110, s: 1.15 };
const XY0 = [360, -300], XY1 = [1040, -130];
const FUNNEL = [1090, -40], BULB = [1160, 418];
const CAMERA = [1060, 300];
const ZOO = 560, ROCK = [760, ZOO];
const LENS_R = [1000, 760], LENS_L = [760, 760], RIM = 78, RIN = 57;
const BUCKET = [560, 852], BUCKET_LOW = 994;
const LAD0 = [-250, 1050], LAD1 = [-760, -900];
const rung = (i) => [lerp(LAD0[0], LAD1[0], i / 10), lerp(LAD0[1], LAD1[1], i / 10)];
const CHART = ['#50', '#40', '#30', '#20', '#15', '#10', '#7', '#5', '#3', '#2', '#1'];

const RAMP = [[BULB[0], BULB[1] + 4], [BULB[0] + 16, 520], [LENS_R[0] + RIN + 30, 664], [LENS_R[0] + RIN, LENS_R[1]]];
const TAPE = COIL([-404, -804], [-300, -772], 5, 15);
const HOSE = COIL([FUNNEL[0], FUNNEL[1] + 34], [BULB[0], BULB[1] - 30], 5.5, 30);

// ---------- times ----------
const TM = {}, L0 = 4; // verse 2 is lines 4-8 of the song
const lw = (l, i) => wt(L0 + l, i);
function times() {
  const h1 = C.hooks[0], h2 = C.hooks[1];
  Object.assign(TM, {
    h1: h1.ticks, a1: h1.again, h2: h2.ticks, a2: h2.again,
    what: lw(0, 0), said1: lw(0, 2), said2: lw(0, 8), she3: lw(0, 9), said3: lw(0, 10),
    you: lw(1, 0), yo1: lw(1, 2), yo2: lw(1, 3), ma: lw(1, 4),
    and2: lw(2, 0), the2: lw(2, 1), nat: lw(2, 2), arts: lw(2, 3), orch: lw(2, 4),
    and3: lw(3, 0), kids: lw(3, 5), zoo: lw(3, 8),
    and4: lw(4, 0), honey: lw(4, 1), get4: lw(4, 6), eye: lw(4, 8), frames: lw(4, 9), too: lw(4, 10),
  });
}
// the yo-yo's string hangs from the cellist's bow tip; the bow is drawn at the same place in cast.js
function bowAt(t) { return clamp(ease(seg(t, TM.ma - 0.04, TM.ma + 0.2)) - ease(seg(t, TM.ma + 0.9, TM.ma + 2.4))); }
function bowTip(t) { const bx = lerp(-30, 60, bowAt(t)); return [CELL.x - CELL.s * (bx + 120), CELL.y - CELL.s * 140]; }
function yoyoDrop(t) { return ease(seg(t, TM.yo1, TM.yo1 + 0.3)) * (1 - ease(seg(t, TM.yo2, TM.yo2 + 0.3))); }
function yoyoAt(t) { const [x, y] = bowTip(t); return [x, y + 46 + yoyoDrop(t) * 260]; }
const boardTilt = (t) => {
  const bob = [TM.said1, TM.said2].reduce((m, s) => m + pulse(t, s - 0.02, 0.22) * 0.07, 0);
  return -0.04 - bob + ease(seg(t, TM.said2 - 0.05, TM.said2 + 0.15)) * 0.62 - ease(seg(t, TM.said3 + 0.4, TM.said3 + 1.2)) * 0.62;
};
const boardTop = (t, u = 58) => { const b = pubBoard(BOARD.x, BOARD.y, BOARD.s, boardTilt(t)), p = b.top(u); return [p[0] + b.n[0] * 21, p[1] + b.n[1] * 21]; };
// the list paper: unrolled from the board's far end down to the yo-yo
const PAPER_END = () => [bowTip(0)[0] - 26, bowTip(0)[1] + 18];
function paperPts(t) { const b = pubBoard(BOARD.x, BOARD.y, BOARD.s, boardTilt(t)), e = b.end, k = ease(seg(t, TM.said2 - 0.12, TM.said2 + 0.1)), f = PAPER_END(); return [e, [lerp(e[0], f[0], k), lerp(e[1], f[1], k)]]; }

function legs(add, land) {
  const T = TM;
  add(SEC.list.enterT, T.a1 - 0.2, () => BAGM);
  add(T.a1 - 0.2, T.a1, (k) => [SLOT[0], lerp(BAGM[1], SLOT[1], k * k)]);
  add(T.a1, T.a1 + 0.25, (k) => [SLOT[0], lerp(SLOT[1], -804, k * k)]);
  add(T.a1 + 0.25, T.what - 0.36, (k) => along([[-520, -804], ...TAPE], k));
  add(T.what - 0.36, T.what, (k, t) => { const e = TAPE[TAPE.length - 1], b = boardTop(t); return [lerp(e[0], b[0], k), lerp(e[1], b[1], k * k)]; });
  add(T.what, T.said2, (k, t) => { const hop = [T.said1].reduce((m, s) => m + pulse(t, s, 0.24) * 22, 0), b = boardTop(t, lerp(58, 74, k)); return [b[0], b[1] - hop]; });
  add(T.said2, T.you, (k, t) => { const b = boardTop(t, 74), [, f] = paperPts(t), y = yoyoAt(t); return along([b, [f[0], f[1] - 22], [y[0], y[1] - 46]], k ** 1.7); });
  add(T.you, T.ma, (k, t) => { const y = yoyoAt(t); return [y[0], y[1] - 46]; });
  add(T.ma, T.and2, (k, t) => { const a = yoyoAt(T.ma); a[1] -= 46; const b = [XY0[0], XY0[1] - 24]; return [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - Math.sin(k * Math.PI) * 430]; });
  const xy = (k) => [lerp(XY0[0], XY1[0], k), lerp(XY0[1], XY1[1], k) - 24];
  const xk = (x) => (x - XY0[0]) / (XY1[0] - XY0[0]);
  [[T.and2, T.the2, 0, xk(700)], [T.the2, T.nat, xk(700), xk(790)], [T.nat, T.arts, xk(790), xk(890)], [T.arts, T.orch, xk(890), xk(960)], [T.orch, T.orch + 0.25, xk(960), 1]].forEach(([a, b, k0, k1]) => add(a, b, (k) => xy(lerp(k0, k1, k))));
  add(T.orch + 0.25, T.orch + 0.6, (k) => { const a = xy(1); return [lerp(a[0], FUNNEL[0], k), lerp(a[1], FUNNEL[1] + 34, k * k)]; });
  add(T.orch + 0.6, T.zoo, (k) => along(HOSE, k));
  add(T.zoo, T.and4, (k) => along(RAMP, k ** 1.3));
  const loop = (c, a) => [c[0] + Math.cos(a) * RIN, c[1] + Math.sin(a) * RIN];
  add(T.and4, T.get4 - 0.26, (k) => loop(LENS_R, -3 * Math.PI * (k ** 0.9)));
  add(T.get4 - 0.26, T.eye - 0.27, (k) => { const a = loop(LENS_R, Math.PI), b = loop(LENS_L, 0); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - Math.sin(k * Math.PI) * 54]; });
  add(T.eye - 0.27, T.frames, (k) => loop(LENS_L, -3 * Math.PI * k));
  add(T.frames, T.too, (k) => along([loop(LENS_L, Math.PI), [LENS_L[0] - RIN - 40, 790], [BUCKET[0], BUCKET[1] - 8]], k ** 1.4));
  add(T.too, T.too + 0.38, (k) => [BUCKET[0], lerp(BUCKET[1] - 8, BUCKET_LOW - 8, k * k)]);
  const chute = [[BUCKET[0] - 30, BUCKET_LOW + 8], [BUCKET[0] - 120, BUCKET_LOW + 30], [LAD0[0] + 20, LAD0[1] - 22]];
  add(T.too + 0.38, T.h2[0] - 0.02, (k) => along(chute, k ** 1.5));
  T.h2.forEach((tk, i) => {
    const a = rung(i), b = rung(i + 1); a[1] -= 22; b[1] -= 22;
    add(tk, tk + 0.24, (k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - Math.sin(k * Math.PI) * 46]);
    const nx = i + 1 < T.h2.length ? T.h2[i + 1] : T.a2 - 0.3; add(tk + 0.24, nx, () => b);
  });
  add(T.a2 - 0.3, T.a2, (k) => { const a = rung(10); a[1] -= 22; return [lerp(a[0], SLOT[0], k), lerp(a[1], SLOT[1], k) - Math.sin(k * Math.PI) * 120]; });
  add(T.a2, SEC.list.exitT, (k, t) => [SLOT[0], lerp(SLOT[1], -820, ease(seg(t, T.a2, T.a2 + 0.25)))]);
  [['slot', T.a1], ['board', T.what], ['yoyo', T.you], ['xylo', T.and2], ['bulb', T.zoo], ['bucket', T.too]].forEach(([n, tt]) => land(n, tt));
}

// ---------- camera: follows the coin, smoothed over its own path; held framings for the opening, the zoo, the end ----------
function cam(hold, t, st) {
  // hook 2: the camera trails the coin up the charts, so each rung's words stay up 1.5 s after they're written
  const hk = ease(seg(t, TM.h2[0] + 0.15, TM.h2[1] + 0.15)) * (1 - ease(seg(t, TM.a2 + 0.2, TM.a2 + 0.8)));
  if (hk > 0) { const b0 = ballAt(t), b1 = ballAt(t - 1.5); st.x = lerp(st.x, (b0[0] + b1[0]) / 2 + 60, hk); st.y = lerp(st.y, (b0[1] + b1[1]) / 2, hk); st.z = lerp(st.z, 0.77, hk); }
  hold(-470, -960, 1.12, TM.h1[0] - 1.6, TM.h1[0] - 0.8, TM.a1 + 0.6, TM.what - 0.6);
  hold(-200, -400, 0.82, TM.what - 0.6, TM.what - 0.1, TM.ma + 1.3, TM.ma + 2.1);
  hold(720, -200, 0.95, TM.the2 - 0.5, TM.the2, TM.and3 - 1.3, TM.and3 - 0.3);
  hold(800, 250, 0.92, TM.and3 - 1.3, TM.and3 - 0.3, TM.and4, TM.and4 + 0.4);
  hold(714, 500, 0.74, TM.zoo + 0.25, TM.and4 - 0.1, TM.frames - 0.3, TM.too);
  hold(507, 605, 0.74, TM.frames - 0.3, TM.too, TM.h2[0] + 0.15, TM.h2[1] + 0.15); // the frames land on his face, then the charts, no whip
  // test 01 ended on the pull-back to the jukebox; in the whole song the next section takes the camera from here
  if (SEC.list.pullback) { const end = TM.a2 + 0.2, k = ease(seg(t, end, end + 1.6)); st.x = lerp(st.x, 190, k); st.y = lerp(st.y, -90, k); st.z = Math.exp(lerp(Math.log(st.z), Math.log(0.25), k)); }
}

// ---------- parts ----------
function hitSlot(t) {
  if (!near(-520, -900)) return;
  const x = SLOT[0];
  // the money bag on its rope; every tick a coin drops into the slot
  ink([[x, -1400], [x, -1100]], 'bagr', { w: 2.2 });
  const sq = TM.h1.reduce((m, h) => Math.max(m, pulse(t, h - 0.2, 0.25)), 0);
  blob([[x - 10, -1100], [x - 70, -1060 + sq * 4], [x - 64, -1010], [x - 20, -1000], [x + 20, -1000], [x + 64, -1010], [x + 70 + sq * 4, -1060], [x + 10, -1100]], TAN, 'bag', 2);
  ink([[x - 18, -1092], [x + 18, -1092]], 'bagt', { w: 3, col: OX }); label('$', x, -1046, 42, OX);
  TM.h1.forEach((h, i) => { const k = seg(t, h - 0.2, h); if (k > 0 && k < 1) coin(x, lerp(-1000, SLOT[1], k * k), 'c' + i, k * 9); });
  // the cabinet: glass window, a counter that never moves, a coin return marked AGAIN? no: marked EMPTY
  shape(box(x - 84, -884, 168, 300), RED, 'cab', 2.4); shape(box(x - 62, -858, 124, 74), GLASS, 'cabw', 1.6);
  shape(box(x - 34, -896, 68, 14), INK, 'slotlip', 1.4);
  shape(box(x - 72, -770, 144, 40), GILT, 'cabs', 2); boxLabel('HITS 25¢', [x - 72, -770, 144, 40], 28, INK);
  // the hit meter: needle kicks on every tick and falls back to zero
  const kick = TM.h1.concat(TM.h2).reduce((m, h) => Math.max(m, pulse(t, h, 0.3)), 0), na = -Math.PI * 0.9 + kick * 0.5;
  blob(circ(x, -620, 40, 40, Math.PI, TAU, 16).concat([[x + 40, -620], [x - 40, -620]]), PAPER, 'meter', 1.6);
  ink([[x, -620], [x + Math.cos(na) * 32, -620 + Math.sin(na) * 32]], 'needle', { w: 2, col: RED }); label('0', x - 30, -606, 14);
  // the coin rides the red tape out of the spout, above the publicist's head
  shape(box(x + 84, -818, 40, 26), GILT, 'spout', 1.6);
  ink(TAPE.map(([a, b]) => [a, b + 24]), 'tape', { w: 3.4, col: RED, poly: true });
  ink([[-350, -740], [-350, -716]], 'tapeh', { w: 2 });
  shape(box(-402, -716, 104, 32), PAPER, 'tapes', 1.4); boxLabel('RED TAPE', [-402, -716, 104, 32], 18, RED);
}
function publicistPart(t) {
  if (!near(-420, -500)) return;
  // she talks on her own words
  const ws = C.lines[0].words.map((w) => w.t), talk = ws.reduce((m, s) => Math.max(m, pulse(t, s - 0.03, 0.2)), 0);
  shape(box(-510, -200, 270, 14), TAN, 'pfloor', 1.6); for (const lx of [-490, -262]) ink([[lx, -186], [lx, -110]], 'pfl' + lx, { w: 2.2 });
  shape(box(-500, -186, 96, 30), PAPER, 'press', 1.2); boxLabel('PRESS', [-500, -186, 96, 30], 18, RED);
  publicist(BOARD.x, BOARD.y, BOARD.s, { tray: boardTilt(t), talk, look: t > TM.said3 ? 'open' : 'lid' });
  // the list paper rolls off her board
  const [e, f] = paperPts(t);
  if (dist(e, f) > 4) {
    const n = [(f[1] - e[1]) / dist(e, f), -(f[0] - e[0]) / dist(e, f)], wd = 30;
    const strip = [e, f, [f[0] + n[0] * wd, f[1] + n[1] * wd], [e[0] + n[0] * wd, e[1] + n[1] * wd], e];
    shape(strip.map(([a, b]) => [a - n[0] * 4, b - n[1] * 4]), PAPER, 'list', 1.4);
    const u = [(f[0] - e[0]) / dist(e, f), (f[1] - e[1]) / dist(e, f)], ticks = [TM.ma, TM.orch, TM.zoo, TM.too];
    ticks.forEach((tk, i) => {
      const s = 70 + i * 90; if (s > dist(e, f) - 20) return;
      const bx = e[0] + u[0] * s + n[0] * 6, by = e[1] + u[1] * s + n[1] * 6;
      X.save(); X.translate(bx, by); X.rotate(Math.atan2(u[1], u[0]));
      ink(box(-7, 0, 14, 14), 'lb' + i, { w: 1.2, poly: true }); ink([[12, 7], [64, 7]], 'll' + i, { w: 0.9, col: PENCIL });
      if (t > tk) ink([[-6, 6], [-1, 13], [9, -4]], 'lt' + i, { w: 2.2, col: RED });
      X.restore();
    });
  }
}
function cellistPart(t) {
  if (!near(60, -260)) return;
  // a little stage and a spotlight
  X.save(); X.globalAlpha = 0.16; X.fillStyle = LAMP; X.beginPath(); X.moveTo(CELL.x - 30, -900); X.lineTo(CELL.x + 40, -900); X.lineTo(CELL.x + 230, -110); X.lineTo(CELL.x - 230, -110); X.fill(); X.restore();
  shape(box(30, -110, 270, 18), TAN, 'stage', 1.8); for (const lx of [50, 270]) ink([[lx, -92], [lx, 60]], 'stl' + lx, { w: 2.2 });
  cellist(CELL.x, CELL.y, CELL.s, { bow: bowAt(t), flip: -1 });
  // the yo-yo on its string from the bow tip
  const tip = bowTip(t), y = yoyoAt(t), spin = (t - TM.yo1) * 30;
  ink([tip, [y[0], y[1] - 20]], 'ystr', { w: 1.2 });
  blob(circ(y[0], y[1], 26, 26), RED, 'yoyo', 2); ink([[y[0] - 24, y[1]], [y[0] + 24, y[1]]], 'yoyog', { w: 1.6 });
  dot(y[0] + Math.cos(spin) * 14, y[1] + Math.sin(spin) * 14 * 0.3, 3.5, PAPER);
}
function orchestraPart(t) {
  if (!near(700, -260, 600)) return;
  // riser for the cardboard players
  shape(box(330, -330, 720, 16), TAN, 'riser', 1.6);
  const players = [[400, 'violin', 'VIOLINS', TM.and2], [540, 'flute', 'FLUTES', TM.the2], [680, 'tuba', 'TUBA', TM.nat], [820, 'drum', 'DRUMS', TM.arts], [960, 'violin', 'CELLOS?', TM.orch]];
  players.forEach(([x, inst, name, tk], i) => {
    const k = seg(t, tk - 0.05, tk + 0.22), up = k <= 0 ? 0 : k >= 1 ? 1 + Math.sin(seg(t, tk + 0.22, tk + 0.6) * Math.PI) * 0.05 * (1 - seg(t, tk + 0.22, tk + 0.6)) : ease(k) * 1.08;
    cutout(x, -330, 0.8, { inst, up: Math.max(0.05, up), name: '' });
    if (up > 0.6) { shape(box(x - 32, -392, 64, 22), PAPER, 'tag' + i, 1.1); boxLabel(name, [x - 32, -392, 64, 22], 15, INK); }
  });
  shape(box(1000, -470, 120, 44), GILT, 'rent', 1.6); boxLabel('FOR RENT', [1000, -470, 120, 44], 20, OX);
  // the xylophone: bars that plink as the coin crosses them
  const n = 14, cols = [RED, GILT, PAPER, TAN];
  for (let i = 0; i < n; i++) {
    const k0 = i / n, k1 = (i + 0.86) / n, a = [lerp(XY0[0], XY1[0], k0), lerp(XY0[1], XY1[1], k0)], b = [lerp(XY0[0], XY1[0], k1), lerp(XY0[1], XY1[1], k1)];
    const b0 = ballAt(t), hit = Math.abs(b0[0] - (a[0] + b[0]) / 2) < 25 && Math.abs(b0[1] - a[1]) < 60 ? 1 : 0, h = 30 - i * 1.1;
    shape([[a[0], a[1] + hit * 3], [b[0], b[1] + hit * 3], [b[0], b[1] + h], [a[0], a[1] + h], [a[0], a[1] + hit * 3]], cols[i % 4], 'bar' + i, 1.4);
  }
  ink([[XY0[0], XY0[1] + 40], [XY1[0], XY1[1] + 28]], 'xyr', { w: 3, col: OX });
  for (const k of [0.1, 0.9]) { const x = lerp(XY0[0], XY1[0], k), y = lerp(XY0[1], XY1[1], k); ink([[x, y + 40], [x - 8, y + 130]], 'xyl' + k, { w: 2.4 }); }
}
function zooPart(t) {
  if (!near(800, 300, 700)) return;
  // funnel and the camera's bulb hose
  blob([[FUNNEL[0] - 50, FUNNEL[1] - 20], [FUNNEL[0] + 50, FUNNEL[1] - 20], [FUNNEL[0] + 12, FUNNEL[1] + 30], [FUNNEL[0] - 12, FUNNEL[1] + 30]], GILT, 'funnel', 1.8);
  ink(HOSE.map(([a, b]) => [a, b + 22]), 'hose', { w: 4.5, col: OX, poly: true });
  const sq = pulse(t, TM.zoo - 0.02, 0.3);
  blob(circ(BULB[0], BULB[1] + 22, 24 - sq * 6, 30 + sq * 4), INK, 'bulb', 1.6);
  ink([[BULB[0], BULB[1] + 52], [BULB[0] - 20, 330], [CAMERA[0] + 70, 320]], 'bulbh', { w: 2 });
  // platform, fence, ZOO sign
  shape(box(130, ZOO, 1110, 22), TAN, 'zfl', 2);
  for (let i = 0; i < 12; i++) ink([[150 + i * 34, ZOO], [150 + i * 34, ZOO - 70]], 'fen' + i, { w: 2, col: TAN });
  ink([[142, ZOO - 56], [540, ZOO - 56]], 'fenr', { w: 2, col: TAN });
  shape(box(140, 330, 140, 50), GREEN, 'zsign', 1.8); ink([[210, 380], [210, ZOO]], 'zsp', { w: 3 }); boxLabel('CITY ZOO', [140, 330, 140, 50], 24, PAPER);
  // the cast: giraffe leans in, the kids stare, the Rocker turns on the thumbs
  giraffe(400, ZOO, 1.0, { lean: ease(seg(t, TM.and3 + 1.4, TM.zoo - 0.2)) });
  const fl = t > TM.zoo && t < TM.zoo + 0.2;
  kid(560, ZOO, 1.05, { kind: 'balloon' }); kid(650, ZOO, 1.05, { kind: 'ice' });
  const thumbs = t > TM.kids - 0.1;
  rocker(ROCK[0] + 60, ZOO, 1, { pose: thumbs ? 'thumbs' : 'play', glasses: glassesOn(t), wave: t * 2 });
  if (fl) { X.save(); X.globalAlpha = 0.5; dot(560 - 13, ZOO - 146, 6, SKIN); X.restore(); }
  // the camera on its tripod, facing the set
  for (const dx of [-40, 0, 40]) ink([[CAMERA[0] + 70, CAMERA[1] + 60], [CAMERA[0] + 70 + dx * 1.6, ZOO]], 'trip' + dx, { w: 2.6 });
  shape(box(CAMERA[0] + 20, CAMERA[1] - 10, 110, 76), NAVY, 'cam', 2); shape([[CAMERA[0] + 20, CAMERA[1] + 2], [CAMERA[0] - 50, CAMERA[1] - 16], [CAMERA[0] - 50, CAMERA[1] + 72], [CAMERA[0] + 20, CAMERA[1] + 54], [CAMERA[0] + 20, CAMERA[1] + 2]], INK, 'bellows', 1.6);
  blob(circ(CAMERA[0] - 56, CAMERA[1] + 28, 18, 34), GLASS, 'lens', 1.6);
  shape(box(CAMERA[0] + 50, CAMERA[1] - 54, 50, 40), PAPER, 'flashp', 1.6);
  if (t > TM.zoo - 0.02 && t < TM.zoo + 0.16) {
    const k = seg(t, TM.zoo - 0.02, TM.zoo + 0.16);
    X.save(); X.globalAlpha = 0.9 * (1 - k); dot(CAMERA[0] + 75, CAMERA[1] - 34, 50 + k * 220, '#fffbe9'); X.restore();
    for (let i = 0; i < 12; i++) { const a = i * TAU / 12; ink([[CAMERA[0] + 75 + Math.cos(a) * 60, CAMERA[1] - 34 + Math.sin(a) * 60], [CAMERA[0] + 75 + Math.cos(a) * 130, CAMERA[1] - 34 + Math.sin(a) * 130]], 'fr' + i, { w: 2.4, col: GILT }); }
  }
  // the print slides out after the flash
  const pk = ease(seg(t, TM.zoo + 0.3, TM.zoo + 1.4));
  if (pk > 0) { const px = CAMERA[0] + 30, py = CAMERA[1] + 66; shape(box(px, py, 80, 20 + pk * 70), PAPER, 'print', 1.4); if (pk > 0.6) { X.save(); X.globalAlpha = (pk - 0.6) / 0.4; shape(box(px + 8, py + 26, 64, 48), GLASS, 'printi', 0.8); dot(px + 30, py + 44, 6, INK); dot(px + 48, py + 40, 5, GILT); X.restore(); } }
}
// the eyeglass frames: on the track until the bucket drops, then hoisted onto the Rocker's face
const glassesUp = (t) => ease(seg(t, TM.too, TM.too + 0.5));
const glassesOn = (t) => (t > TM.too + 0.48 ? 1 : 0);
function glassesPart(t) {
  if (!near(800, 800, 600)) return;
  // eye chart on the wall, an optician's sign
  shape(box(330, 640, 150, 210), PAPER, 'chart', 1.8);
  [['E', 60], ['F P', 38], ['T O Z', 26], ['L P E D', 18], ['P E C F D', 13]].forEach(([s, z], i) => label(s, 405, 676 + i * 38 - (i ? 6 : 0), z));
  // the pulley and the bucket that hoists the frames
  const up = glassesUp(t), bk = t < TM.too ? BUCKET[1] : lerp(BUCKET[1], BUCKET_LOW, ease(seg(t, TM.too, TM.too + 0.38)));
  blob(circ(BUCKET[0] + 30, 620, 18), GREY, 'pulley', 1.6); dot(BUCKET[0] + 30, 620, 4);
  ink([[BUCKET[0], bk - 42], [BUCKET[0] + 12, 620]], 'rope1', { w: 1.6 });
  const g0 = [lerp(LENS_L[0], LENS_R[0], 0.5), LENS_L[1]], face = [ROCK[0] + 60, ZOO - 372], gs = lerp(1, 0.27, up), gx = lerp(g0[0], face[0], up), gy = lerp(g0[1], face[1], up) - Math.sin(up * Math.PI) * 120;
  if (t < TM.too + 0.48) ink([[BUCKET[0] + 48, 620], [gx, gy - RIM * gs]], 'rope2', { w: 1.6 });
  plank(RAMP.slice(1, 3), 'ramp');
  shape([[BUCKET[0] - 36, bk - 40], [BUCKET[0] + 36, bk - 40], [BUCKET[0] + 28, bk + 10], [BUCKET[0] - 28, bk + 10], [BUCKET[0] - 36, bk - 40]], GREY, 'bucket', 1.8);
  ink(circ(BUCKET[0], bk - 40, 36, 30, Math.PI, TAU, 10), 'bail', { w: 1.4 });
  // the frames themselves (track while down; drawn at the face for the hoist, cast.js draws them once on)
  if (t < TM.too + 0.48) {
    const hw = (LENS_R[0] - LENS_L[0]) / 2 * gs, r = RIM * gs, w = 14 * gs;
    for (const s of [-1, 1]) { const cx = gx + s * hw; X.save(); X.strokeStyle = INK; X.lineWidth = w + 6; X.beginPath(); X.arc(cx, gy, r, 0, TAU); X.stroke(); X.strokeStyle = OX; X.lineWidth = w; X.stroke(); X.restore(); X.save(); X.globalAlpha = 0.25; dot(cx, gy, r - w / 2, GLASS); X.restore(); }
    ink(circ(gx, gy - 6 * gs, hw - r, 30 * gs, Math.PI, TAU, 10), 'bridge', { w: 3 * gs + 1, col: OX });
    if (up < 0.05) { ink([[LENS_L[0] - RIM - 60, LENS_L[1] - 40], [LENS_L[0] - RIM, LENS_L[1] - 10]], 'templeL', { w: 4, col: OX }); ink([[LENS_R[0] + RIM, LENS_R[1] - 10], [LENS_R[0] + RIM + 60, LENS_R[1] - 40]], 'templeR', { w: 4, col: OX }); }
  }
  // the chute down to the charts
  const ch = [[BUCKET[0] - 30, BUCKET_LOW + 30], [BUCKET[0] - 120, BUCKET_LOW + 52], [LAD0[0] + 20, LAD0[1]]];
  plank(ch, 'chute');
  // a sign: NEW LOOK
  shape(box(1100, 806, 150, 50), GILT, 'newlook', 1.6); boxLabel('NEW LOOK', [1100, 806, 150, 50], 24, OX);
}
function chartsPart(t) {
  if (!near(-500, 100, 900)) return;
  // two rails and the rungs, each with its chart number
  const off = [-46, 46];
  off.forEach((o, i) => ink([[LAD0[0] + o, LAD0[1] + 30], [LAD1[0] + o, LAD1[1] - 30]], 'rail' + i, { w: 3, col: TAN }));
  for (let i = 0; i <= 10; i++) {
    const [x, y] = rung(i), lit = i > 0 && t > TM.h2[i - 1];
    shape(box(x - 52, y - 2, 104, 12), lit ? GILT : TAN, 'rung' + i, 1.4);
    fitLabel(CHART[i], x - 92, y + 2, 64, i === 10 ? 34 : 24, lit ? RED : INK);
  }
  const [tx, ty] = rung(10); shape(box(tx - 150, ty - 120, 240, 54), RED, 'charts', 2); boxLabel('THE CHARTS', [tx - 150, ty - 120, 240, 54], 30, PAPER);
}
function jukebox(t) {
  if (VIEW[2] - VIEW[0] < 2600) return;
  // the whole machine stands inside a jukebox: arch, bubble tubes, grille and the selector
  const x0 = -1080, x1 = 1460, yb = 1200, yt = -820, cx = (x0 + x1) / 2, rx = (x1 - x0) / 2, ry = 640;
  const arch = (inset) => { const o = [[x0 + inset, yb]]; for (let i = 0; i <= 40; i++) { const a = Math.PI + Math.PI * i / 40; o.push([cx + Math.cos(a) * (rx - inset), yt + Math.sin(a) * (ry - inset)]); } o.push([x1 - inset, yb]); return o; };
  ink(arch(0), 'jb0', { w: 9, col: OX }); ink(arch(46), 'jb1', { w: 7, col: GILT }); ink(arch(80), 'jb2', { w: 4, col: RED });
  const ap = arch(23); for (let i = 1; i < ap.length - 1; i += 2) dot(ap[i][0], ap[i][1], 9, i % 4 === 1 ? LAMP : RED);
  shape(box(x0 - 30, yb, x1 - x0 + 60, 120), OX, 'jbase', 3); for (let i = 0; i < 9; i++) shape(box(x0 + 120 + i * 260, yb + 28, 170, 64), i % 2 ? GILT : RED, 'jbtn' + i, 2);
  boxLabel('SELECT YOUR HIT', [cx - 480, yb + 20, 960, 80], 60, PAPER);
}
const SPOTS = [[-170, -700, 520, 34], [-330, -50, 440, 36], [360, -70, 720, 36], [178, 80, 320, 38], [650, 900, 600, 36]];
function words(t) {
  const hk = C.hookText, ag = C.againText, lines = C.lines.slice(L0, L0 + 5);
  C.hooks[0].ticks.forEach((tk, i) => letterWords(phrase(hk, tk), -390, -1150 + i * 38, 30, INK, 400));
  letterWords([{ w: ag, t: C.hooks[0].again }], -390, -1150 + 8 * 38 + 4, 34, INK, 400);
  lines.forEach((l, i) => { const [x, y, mw, s] = SPOTS[i]; letterWords(l.words, x, y, s, INK, mw); });
  C.hooks[1].ticks.forEach((tk, i) => { const [x, y] = rung(i + 1); letterWords(phrase(hk, tk), i < 5 ? x + 66 : x - 300, y + 8, 28, RED, 400); });
  letterWords([{ w: ag, t: C.hooks[1].again }], -390, -1150 + 9 * 38 + 10, 34, RED, 400);
}

// ---------- register ----------
SEC.list = { enterT: 0, exitT: 999, pullback: true, entry: BAGM, exit: [SLOT[0], -820] };
section({
  id: 'list', range: [20.0, 53.5],
  init() { times(); SEC.list.enterT = TM.h1[0] - 0.5; },
  legs, cam,
  parts(t) { if (SEC.list.pullback) jukebox(t); chartsPart(t); hitSlot(t); cellistPart(t); orchestraPart(t); zooPart(t); glassesPart(t); publicistPart(t); },
  words,
});
})();

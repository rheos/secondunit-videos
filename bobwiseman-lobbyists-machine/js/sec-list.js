// Lobbyists at Parliament, the pay-for-a-hit machine (rescue-machine look). One gold coin on one continuous path, the
// camera following it; every part a joke on its line. Section 'list' of the whole-song machine: hook 1, verse 2, hook 2
// (song 19.92-51.9), test 01 rebuilt for draft 2 from the critic's findings. Engine: js/core.js.
// The hook is the machine ticking over: coins fed into a HITS cabinet whose meter kicks on every tick. The publicist's
// list runs as one pass: yo-yo off a cellist's bow, a cardboard orchestra pulled up on strings by a xylophone, a coin
// funnel and a hose to a camera bulb for the zoo photo, a loop-the-loop through giant eyeglasses that a rope and an
// overhead arm then hoist onto the Rocker's face. Hook 2: THE CHARTS ladder unfolds and the coin climbs it to #1,
// back into the cabinet, which jackpots on "Again".
// Hand-offs: enters at SEC.attic.exit (19.92, the bag's mouth); exits at 51.9 at [-520, -820] inside the cabinet.
// Camera: follow-cam for the first 0.8 s and from 51.7 (b7 owns 51.7-55.0). No jukebox here: b7 draws it.
(() => {
'use strict';
const T0 = 19.92, T1 = 51.9;
// ---------- places ----------
const SLOT = [-520, -884], BAGM = [-520, -1004];
const BOARD = { x: -380, y: -200, s: 1.1 };
const CELL = { x: 180, y: -110, s: 1.15 }; // far enough right of the list line that the climb's frame edge falls in the gap
const XY0 = [360, -300], XY1 = [1040, -150];
const xyY = (x) => lerp(XY0[1], XY1[1], (x - XY0[0]) / (XY1[0] - XY0[0]));
const RISER = -380, PLAYERS = [450, 590, 720, 850, 980], COINX = [390, 560, 690, 820, 950]; // the coin's bar on each word
const FUN = [1150, 0], NECK = 80; // funnel mouth centre; the neck's y
const HOSE = [[1150, 74], [1162, 86], [1200, 88], [1250, 90], [1290, 112], [1305, 150], [1305, 420], [1293, 466], [1285, 499]];
const BULB = [1285, 600]; // the bulb sits on the platform: its foot
const CAMERA = [1060, 340];
const ZOO = 600, ROCKX = 820, FACE = [820, 228];
const LENS_L = [520, 790], LENS_R = [760, 790], RIM = 78, RIN = 57;
const BUCKET = [360, 892], BUCKET_LOW = 1034;
const POST = 1225, ARMY = 70, P1 = [360, 645], P2 = [1212, 645], P3 = [1212, 94], P4 = [640, 94];
const LAD0 = [-300, 1070], LAD1 = [-730, -900];
const rung = (i) => [lerp(LAD0[0], LAD1[0], i / 10), lerp(LAD0[1], LAD1[1], i / 10)];
const CHART = ['#50', '#40', '#30', '#20', '#15', '#10', '#7', '#5', '#3', '#2', '#1'];
const TAPE = COIL([-404, -804], [-300, -772], 5, 15);
const RUNUP = [[1368, 688], [800, 847], [LENS_R[0], LENS_R[1] + RIN]];
const CHUTE = [[BUCKET[0] - 30, BUCKET_LOW + 8], [BUCKET[0] - 120, BUCKET_LOW + 12], [LAD0[0], LAD0[1] - 22]];

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
  TM.words = [TM.and2, TM.the2, TM.nat, TM.arts, TM.orch];
  // the coin's schedule (song s); each is cause for something on a sung word
  Object.assign(TM, {
    trill: TM.and2 + 1.7, xyEnd: TM.orch + 0.2, inFun: TM.orch + 0.5, outFun: TM.zoo - 0.75, // funnel: catch, spin, drop
    offBulb: TM.zoo + 0.73, onRamp: TM.zoo + 1.13, loopR: TM.zoo + 2.09, // the bulb, then the run-up
    hopL: TM.frames - 1.24, loopL: TM.frames - 0.94, // both lenses at the same speed (0.75 s a turn)
    rise: TM.too + 0.43, land: TM.too + 0.75, // the frames: hoisted up behind the kids, then swung onto his face
    unfold: TM.too + 0.08, // THE CHARTS ladder unfolds out of its crate while the coin rides the chute
  });
}
// the yo-yo's string hangs from the cellist's bow tip; the bow is drawn at the same place in cast.js
function bowAt(t) { return clamp(ease(seg(t, TM.ma - 0.04, TM.ma + 0.2)) - ease(seg(t, TM.ma + 0.9, TM.ma + 2.4))); }
function bowTip(t) { const bx = lerp(-30, 60, bowAt(t)); return [CELL.x - CELL.s * (bx + 120), CELL.y - CELL.s * 140]; }
function yoyoDrop(t) { return ease(seg(t, TM.yo1, TM.yo1 + 0.3)) * (1 - ease(seg(t, TM.yo2, TM.yo2 + 0.3))); }
function yoyoAt(t) { const [x, y] = bowTip(t); return [x, y + 46 + yoyoDrop(t) * 150]; }
const boardTilt = (t) => {
  const bob = [TM.said1, TM.said2].reduce((m, s) => m + pulse(t, s - 0.02, 0.22) * 0.07, 0);
  return -0.04 - bob + ease(seg(t, TM.said2 - 0.05, TM.said2 + 0.15)) * 0.62 - ease(seg(t, TM.said3 + 0.4, TM.said3 + 1.2)) * 0.62;
};
const boardTop = (t, u = 58) => { const b = pubBoard(BOARD.x, BOARD.y, BOARD.s, boardTilt(t)), p = b.top(u); return [p[0] + b.n[0] * 21, p[1] + b.n[1] * 21]; };
// the list paper: unrolled from the board's far end down to the yo-yo
const PAPER_END = () => [bowTip(0)[0] - 26, bowTip(0)[1] + 18];
function paperPts(t) { const b = pubBoard(BOARD.x, BOARD.y, BOARD.s, boardTilt(t)), e = b.end, k = ease(seg(t, TM.said2 - 0.12, TM.said2 + 0.1)), f = PAPER_END(); return [e, [lerp(e[0], f[0], k), lerp(e[1], f[1], k)]]; }
// the camera bulb: squashed by the coin landing on "zoo", springs back with the coin still on it
const bulbSq = (t) => ease(seg(t, TM.zoo - 0.02, TM.zoo + 0.06)) * (1 - ease(seg(t, TM.zoo + 0.22, TM.zoo + 0.62)) * 0.8);
const bulbR = (t) => { const s = t >= TM.zoo - 0.02 && t < TM.offBulb + 0.1 ? bulbSq(t) : 0; return [38 + s * 10, 40 - s * 16]; };
// the funnel: the coin rolls round it, slow and wide, then fast and tight, and drops out of the neck
function funnelAt(t) {
  const s = seg(t, TM.inFun, TM.outFun), d = s ** 1.5, ph = Math.PI + TAU * 8.75 * (0.3 * s + 0.7 * s * s * s);
  return [FUN[0] + (lerp(64, 24, d) - 22) * Math.cos(ph), lerp(FUN[1], NECK, d) - 12 + 6 * Math.sin(ph)];
}
const loopAt = (c, a) => [c[0] + Math.cos(a) * RIN, c[1] + Math.sin(a) * RIN];
const bucketY = (t) => (t < TM.too ? BUCKET[1] : lerp(BUCKET[1], BUCKET_LOW, ease(seg(t, TM.too, TM.too + 0.38)) ** 1.6));
// the eyeglass frames: centre, scale and whether they are in front of the cast yet
function framesAt(t) {
  const g0 = [(LENS_L[0] + LENS_R[0]) / 2, LENS_L[1]], u1 = ease(seg(t, TM.too, TM.rise)), u2 = ease(seg(t, TM.rise, TM.land));
  const L = dist(P4, FACE), th = Math.atan2(FACE[0] - P4[0], FACE[1] - P4[1]) * u2;
  if (u2 <= 0) return { x: g0[0], y: lerp(g0[1], P4[1] + L, u1), s: lerp(1, 0.32, u1), front: false, th: 0 };
  return { x: P4[0] + Math.sin(th) * L, y: P4[1] + Math.cos(th) * L, s: lerp(0.32, 0.2, u2), front: u2 > 0.55, th };
}
const glassesOn = (t) => (t >= TM.land ? 1 : 0);
// the ladder unfolds upward out of its crate: 0 folded, 1 standing at #1
const unfoldAt = (t) => ease(seg(t, TM.unfold, TM.unfold + 1.0));

function legs(add, land) {
  const T = TM;
  // the hand-off: the coin drops into the bag's mouth and settles there for the hook
  add(SEC.list.enterT, T.a1 - 0.2, (k, t) => { const s = clamp((t - SEC.list.enterT) / 0.6); return [BAGM[0], BAGM[1] + Math.sin(s * Math.PI) * 10 * (1 - s)]; });
  add(T.a1 - 0.2, T.a1, (k) => [SLOT[0], lerp(BAGM[1], SLOT[1], k * k)]);
  add(T.a1, T.a1 + 0.25, (k) => [SLOT[0], lerp(SLOT[1], -804, k * k)]);
  add(T.a1 + 0.25, T.what - 0.36, (k) => along([[-520, -804], ...TAPE], k));
  add(T.what - 0.36, T.what, (k, t) => { const e = TAPE[TAPE.length - 1], b = boardTop(t); return [lerp(e[0], b[0], k), lerp(e[1], b[1], k * k)]; });
  add(T.what, T.said2, (k, t) => { const hop = [T.said1].reduce((m, s) => m + pulse(t, s, 0.24) * 22, 0), b = boardTop(t, lerp(58, 74, k)); return [b[0], b[1] - hop]; });
  add(T.said2, T.you, (k, t) => { const b = boardTop(t, 74), [, f] = paperPts(t), y = yoyoAt(t); return along([b, [f[0], f[1] - 22], [y[0], y[1] - 46]], k ** 1.7); });
  add(T.you, T.ma, (k, t) => { const y = yoyoAt(t); return [y[0], y[1] - 46]; });
  // the fling on "Ma": up over his head (peak early, above the hair) and down onto the first bar
  const bar0 = [COINX[0], xyY(COINX[0]) - 24];
  add(T.ma, T.and2, (k) => { const a = yoyoAt(T.ma); a[1] -= 46; return [lerp(a[0], bar0[0], k), lerp(a[1], bar0[1], k) - Math.sin(Math.PI * k ** 0.6) * 310]; });
  // the held "and": the coin trills on the first bar, then rolls, faster downhill, one bar per word
  add(T.and2, T.trill, (k, t) => { const s = t - T.and2; return [bar0[0], bar0[1] - 36 * Math.exp(-1.9 * s) * Math.abs(Math.sin(Math.PI * s / 0.28))]; });
  const xs = [[T.trill, COINX[0]], [T.the2, COINX[1]], [T.nat, COINX[2]], [T.arts, COINX[3]], [T.orch, COINX[4]], [T.xyEnd, XY1[0]]];
  for (let i = 1; i < xs.length; i++) { const [ta, xa] = xs[i - 1], [tb, xb] = xs[i]; add(ta, tb, (k) => { const x = lerp(xa, xb, i === 1 ? k ** 1.5 : k); return [x, xyY(x) - 24]; }); }
  // off the end into the funnel's rim, round and round, then down the hose onto the bulb on "zoo"
  add(T.xyEnd, T.inFun, (k) => { const a = [XY1[0], XY1[1] - 24], b = funnelAt(T.inFun); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - Math.sin(k * Math.PI) * 40]; });
  add(T.inFun, T.outFun, (k, t) => funnelAt(t));
  add(T.outFun, T.zoo, (k) => along(HOSE, k * k));
  add(T.zoo, T.offBulb, (k, t) => [BULB[0], BULB[1] - 2 * bulbR(t)[1] - 21]);
  // the run-up: off the bulb, off the platform's end, down the ramp into the right lens
  add(T.offBulb, T.onRamp, (k) => along([[BULB[0], BULB[1] - 2 * bulbR(T.offBulb)[1] - 21], [1316, 530], [1330, 579], [1348, 582], RUNUP[0]], k * k));
  add(T.onRamp, T.loopR, (k) => along(RUNUP, k));
  add(T.loopR, T.hopL, (k) => loopAt(LENS_R, Math.PI / 2 + 2.5 * Math.PI * k));
  add(T.hopL, T.loopL, (k) => { const a = loopAt(LENS_R, Math.PI), b = loopAt(LENS_L, 0); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - Math.sin(k * Math.PI) * 60]; });
  add(T.loopL, T.frames, (k) => loopAt(LENS_L, 2.5 * Math.PI * k));
  add(T.frames, T.too, (k) => along([loopAt(LENS_L, Math.PI / 2), [420, 850], [372, 860], [BUCKET[0], BUCKET[1] - 8]], k ** 1.3));
  add(T.too, T.too + 0.38, (k, t) => [BUCKET[0], bucketY(t) - 8]);
  add(T.too + 0.38, T.h2[0] - 0.02, (k) => along(CHUTE, k ** 1.5));
  add(T.h2[0] - 0.02, T.h2[0], () => [LAD0[0], LAD0[1] - 22]);
  T.h2.forEach((tk, i) => {
    const a = rung(i), b = rung(i + 1); a[1] -= 22; b[1] -= 22;
    add(tk, tk + 0.24, (k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - Math.sin(k * Math.PI) * 46]);
    const nx = i + 1 < T.h2.length ? T.h2[i + 1] : T.a2 - 0.3; add(tk + 0.24, nx, () => b);
  });
  add(T.a2 - 0.3, T.a2, (k) => { const a = rung(10); a[1] -= 22; return [lerp(a[0], SLOT[0], k), lerp(a[1], SLOT[1], k) - Math.sin(k * Math.PI) * 120]; });
  add(T.a2, SEC.list.exitT, (k, t) => [SLOT[0], lerp(SLOT[1], -820, ease(seg(t, T.a2, T.a2 + 0.25)))]);
  [['slot', T.a1], ['board', T.what], ['yoyo', T.you], ['xylo', T.and2], ['bulb', T.zoo], ['bucket', T.too]].forEach(([n, tt]) => land(n, tt));
}

// ---------- camera ----------
// Hook 1 is the follow-cam itself (the coin sits in the bag's mouth, the meter is in the cabinet's window).
// Then held framings, each eased in over 0.8 s or more while the one before it is still fully on. Every sung line
// stays in frame 1.5 s after its last word, so the zoo is reached in two steps (the funnel first, with the
// orchestra line still up). Hook 2 trails the climb at an even speed, keeps the zoo out of frame, settles wide on
// the cabinet for the jackpot and is released into the follow-cam by 51.7 (b7 owns the camera from there).
// the coin's rung on the ladder at time t, as an even climb (no per-tick lurch for the camera)
function climbP(t) {
  const h = TM.h2; if (t <= h[0]) return 0;
  for (let i = 0; i < h.length - 1; i++) if (t < h[i + 1]) return i + (t - h[i]) / (h[i + 1] - h[i]);
  return Math.min(10, h.length - 1 + (t - h[h.length - 1]) / 0.54);
}
const rungAt = (p) => { const k = clamp(p, 0, 10) / 10; return [lerp(LAD0[0], LAD1[0], k), lerp(LAD0[1], LAD1[1], k)]; };
function cam(hold, t, st) {
  if (t < T0 - 0.5 || t > T1 + 0.5) return;
  hold(-130, -470, 0.95, TM.a1 + 0.5, TM.what - 0.2, TM.said2 + 0.3, TM.said2 + 0.4); // the tape, the publicist, her list
  hold(-120, -420, 0.95, TM.said1, TM.said2 + 0.3, TM.the2 + 0.1, TM.the2 + 0.2); // the list down to the yo-yo, the fling
  hold(680, -385, 0.95, TM.ma + 1.5, TM.the2 + 0.1, TM.orch + 1.05, TM.orch + 1.15); // the cardboard orchestra
  hold(720, -40, 0.95, TM.orch + 0.05, TM.orch + 1.05, TM.and3 + 1.85, TM.and3 + 1.95); // the funnel, the orchestra line still up
  hold(705, 310, 0.95, TM.and3 + 0.65, TM.and3 + 1.85, TM.offBulb + 1.05, TM.offBulb + 1.15); // the zoo, the bulb
  hold(740, 605, 0.74, TM.offBulb - 0.65, TM.offBulb + 0.15, TM.loopR + 0.5, TM.loopR + 0.6); // the run-up: the zoo line still up, the honey line starting
  hold(780, 770, 0.95, TM.offBulb + 0.9, TM.offBulb + 1.8, TM.too + 0.5, TM.too + 0.6); // the lenses
  hold(500, 640, 0.68, TM.too - 0.57, TM.too + 0.5, TM.h2[0] + 2.2, TM.h2[0] + 2.3); // payoff, wide: frames on, ladder unfolds
  // hook 2: trail the climb at an even speed. The newest hook phrase is lettered a rung above the coin and each one
  // stays up 1.5 s (3.2 rungs), so the frame centres 0.6 of a rung below the coin. The frame's right edge
  // stays left of the zoo and the cellist; then it settles on the cabinet for the jackpot and is let go by 51.7.
  const hk = ease(seg(t, TM.h2[0] - 0.1, TM.h2[0] + 1.8)) * (1 - ease(seg(t, TM.a2 - 0.15, TM.a2 + 0.21)));
  if (hk > 0) {
    const p = climbP(t), z = 0.96, pm = p - 0.6, a = rungAt(pm);
    const right = lerp(60, 20, ease(seg(p, 3, 4.5))), cx = Math.min(a[0] + lerp(104, -83, ease(seg(pm, 4, 6.5))), right - W / 2 / z);
    const w = ease(seg(t, TM.h2[9] + 0.13, TM.a2 - 0.09));
    const gx = lerp(cx, -615, w), gy = lerp(a[1] - 71, -800, w), gz = lerp(z, 1.0, w);
    st.x = lerp(st.x, gx, hk); st.y = lerp(st.y, gy, hk); st.z = Math.exp(lerp(Math.log(st.z), Math.log(gz), hk));
  }
}

// ---------- parts ----------
// The bag and the HITS cabinet. Joke: you feed it and the meter kicks, every time. Payoff: the meter, in the window.
// On hook 2's "Again" it jackpots: lamps blink, the needle pins, a fountain of coins.
function hitSlot(t) {
  if (!near(-520, -900)) return;
  const x = SLOT[0], jk = t >= TM.a2 ? 1 : 0, js = t - TM.a2;
  // the money bag on its rope (the hand-off object: drawn from the start)
  ink([[x, -1460], [x, -1100]], 'bagr', { w: 2.2 });
  const sq = TM.h1.reduce((m, h) => Math.max(m, pulse(t, h - 0.2, 0.25)), 0);
  blob([[x - 10, -1100], [x - 70, -1060 + sq * 4], [x - 64, -1010], [x - 20, -1000], [x + 20, -1000], [x + 64, -1010], [x + 70 + sq * 4, -1060], [x + 10, -1100]], TAN, 'bag', 2);
  ink([[x - 18, -1092], [x + 18, -1092]], 'bagt', { w: 3, col: OX }); label('$', x, -1046, 42, OX);
  if (t < T0 - 0.5) return;
  TM.h1.forEach((h, i) => { const k = seg(t, h - 0.2, h); if (k > 0 && k < 1) coin(x, lerp(-1000, SLOT[1], k * k), 'c' + i, k * 9); });
  // the jackpot fountain: coins thrown up out of the slot, falling back behind the cabinet
  if (js > 0 && js < 1.3) for (let i = 0; i < 11; i++) {
    const s = js - i * 0.035; if (s <= 0) continue;
    const vx = (i - 5) * 38 + (i % 2 ? 14 : -14), vy = -620 - (i % 3) * 90, px = x + vx * s, py = SLOT[1] - 10 + vy * s + 1300 * s * s;
    if (py < SLOT[1] + 20) coin(px, py, 'jc' + i, s * 14 + i, 15);
  }
  shape(box(x - 84, -884, 168, 300), RED, 'cab', 2.4); shape(box(x - 62, -858, 124, 74), GLASS, 'cabw', 1.6);
  if (jk) { X.save(); X.globalAlpha = 0.32 * (0.6 + 0.4 * Math.cos(js * TAU * 2.5)); X.fillStyle = LAMP; X.fillRect(x - 60, -856, 120, 70); X.restore(); }
  // the hit meter in the window: the needle kicks on every tick and falls back; pins on the jackpot
  const kick = TM.h1.concat(TM.h2).reduce((m, h) => Math.max(m, pulse(t, h, 0.32)), 0);
  const pin = ease(seg(t, TM.a2, TM.a2 + 0.15)), na = Math.PI * 1.1 + lerp(kick * 0.85, 0.8 * Math.PI - 0.05 + Math.sin(js * 50) * 0.04, pin);
  const mc = [x, -794];
  ink(circ(mc[0], mc[1], 48, 48, Math.PI * 1.05, Math.PI * 1.95, 18), 'marc', { w: 1.4 });
  for (let i = 0; i <= 6; i++) { const a = Math.PI * (1.08 + i * 0.14); ink([[mc[0] + Math.cos(a) * 40, mc[1] + Math.sin(a) * 40], [mc[0] + Math.cos(a) * 48, mc[1] + Math.sin(a) * 48]], 'mtk' + i, { w: i === 6 ? 2.4 : 1.2, col: i === 6 ? RED : INK }); }
  ink([mc, [mc[0] + Math.cos(na) * 42, mc[1] + Math.sin(na) * 42]], 'needle', { w: 2.4, col: RED }); dot(mc[0], mc[1], 4);
  shape(box(x - 34, -896, 68, 14), INK, 'slotlip', 1.4);
  // lamps on the cabinet's shoulders: dark until the jackpot, then they blink twice a second
  for (const lx of [x - 66, x + 66]) {
    const on = jk && (js > 1.6 || Math.cos(js * TAU * 2) > -0.2);
    if (on) { X.save(); X.globalAlpha = 0.3; dot(lx, -900, 26, LAMP); X.restore(); }
    blob(circ(lx, -900, 11), on ? LAMP : PAPER, 'lamp' + lx, 1.4);
  }
  shape(box(x - 72, -770, 144, 40), GILT, 'cabs', 2); boxLabel('HITS 25¢', [x - 72, -770, 144, 40], 28, INK);
  // the coin rides the red tape out of the spout, above the publicist's head
  shape(box(x + 84, -818, 40, 26), GILT, 'spout', 1.6);
  ink(TAPE.map(([a, b]) => [a, b + 24]), 'tape', { w: 3.4, col: RED, poly: true });
  ink([[-300, -748], [-290, -756]], 'tapeh', { w: 2 });
  shape(box(-290, -772, 104, 32), PAPER, 'tapes', 1.4); boxLabel('RED TAPE', [-290, -772, 104, 32], 18, RED);
}
// The publicist. Joke: she talks, tips her clipboard and the list unrolls, ticked as each item is bought.
function publicistPart(t) {
  if (t < T0 - 0.5 || !near(-420, -500)) return;
  const ws = C.lines[L0].words.map((w) => w.t), talk = ws.reduce((m, s) => Math.max(m, pulse(t, s - 0.03, 0.2)), 0);
  shape(box(-510, -200, 270, 14), TAN, 'pfloor', 1.6); for (const lx of [-460, -290]) ink([[lx, -186], [lx, -110]], 'pfl' + lx, { w: 2.2 });
  shape(box(-500, -186, 96, 30), PAPER, 'press', 1.2); boxLabel('PRESS', [-500, -186, 96, 30], 18, RED);
  publicist(BOARD.x, BOARD.y, BOARD.s, { tray: boardTilt(t), talk, look: t > TM.said3 ? 'open' : 'lid' });
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
// The cellist. Joke: the first two syllables of his name are a yo-yo off his bow, the last is the bow stroke that flings the coin. He plays with his
// eyes shut in rapture, but opens one on "Ma" to watch the coin go.
function cellistPart(t) {
  if (t < T0 - 0.5 || !near(120, -260)) return;
  shape(box(90, -110, 270, 18), TAN, 'stage', 1.8); for (const lx of [110, 330]) ink([[lx, -92], [lx + (lx < 200 ? -8 : 8), -76]], 'stl' + lx, { w: 2.2 });
  cellist(CELL.x, CELL.y, CELL.s, { bow: bowAt(t), flip: -1 });
  // one eye open on "Ma", following the coin, then shut again
  const eo = seg(t, TM.ma - 0.08, TM.ma + 0.02) * (1 - seg(t, TM.and2 + 1.1, TM.and2 + 1.25));
  if (eo > 0) {
    const ex = CELL.x + 16 * CELL.s, ey = CELL.y - 300 * CELL.s, c = ballAt(t), dd = dist(c, [ex, ey]) || 1;
    X.save(); X.fillStyle = SKIN; X.beginPath(); X.ellipse(ex, ey + 3, 13, 10, 0, 0, TAU); X.fill(); X.restore();
    X.save(); X.fillStyle = PAPER; X.beginPath(); X.ellipse(ex, ey, 9, 8 * eo, 0, 0, TAU); X.fill(); X.restore();
    ink(circ(ex, ey, 9, 8 * eo), 'cleye', { w: 1.6 });
    if (eo > 0.5) dot(ex + (c[0] - ex) / dd * 3.5, ey + (c[1] - ey) / dd * 3, 4.2);
    ink([[ex - 12, ey - 14], [ex + 10, ey - 19]], 'clbrow', { w: 2 });
  }
  const tip = bowTip(t), y = yoyoAt(t), spin = (t - TM.yo1) * 30;
  ink([tip, [y[0], y[1] - 20]], 'ystr', { w: 1.2 });
  blob(circ(y[0], y[1], 26, 26), RED, 'yoyo', 2); ink([[y[0] - 24, y[1]], [y[0] + 24, y[1]]], 'yoyog', { w: 1.6 });
  dot(y[0] + Math.cos(spin) * 14, y[1] + Math.sin(spin) * 14 * 0.3, 3.5, PAPER);
}
// The cardboard orchestra. Joke: a whole national orchestra for hire, cardboard on sticks, $5 an hour. Cause: the
// coin strikes a bar on each word; the bar's string snaps taut and pulls its player up on its hinge.
function orchestraPart(t) {
  if (t < T0 - 0.5 || !near(700, -260, 600)) return;
  const n = 14, cols = [RED, GILT, PAPER, TAN], b0 = ballAt(t);
  const barOf = (x) => Math.min(n - 1, Math.floor((x - XY0[0]) / (XY1[0] - XY0[0]) * n));
  // the xylophone: bars that dip and plink as the coin crosses them
  for (let i = 0; i < n; i++) {
    const k0 = i / n, k1 = (i + 0.86) / n, a = [lerp(XY0[0], XY1[0], k0), lerp(XY0[1], XY1[1], k0)], b = [lerp(XY0[0], XY1[0], k1), lerp(XY0[1], XY1[1], k1)];
    const on = Math.abs(b0[0] - (a[0] + b[0]) / 2) < 25 && Math.abs(b0[1] + 24 - (a[1] + b[1]) / 2) < 40 ? 1 : 0, h = 30 - i * 1.1;
    shape([[a[0], a[1] + on * 3], [b[0], b[1] + on * 3], [b[0], b[1] + h], [a[0], a[1] + h], [a[0], a[1] + on * 3]], cols[i % 4], 'bar' + i, 1.4);
    if (on) for (const s of [-1, 1]) ink([[(a[0] + b[0]) / 2 + s * 14, a[1] - 14], [(a[0] + b[0]) / 2 + s * 26, a[1] - 30]], 'plk' + i + s, { w: 1.4 });
  }
  ink([[XY0[0], XY0[1] + 40], [XY1[0], XY1[1] + 28]], 'xyr', { w: 3, col: OX });
  for (const k of [0.02, 0.98]) { const x = lerp(XY0[0], XY1[0], k), y = lerp(XY0[1], XY1[1], k); ink([[x, y + 40], [x - 6, y + 90]], 'xyl' + k, { w: 2.4 }); }
  // the riser, the strings and the players
  shape(box(410, RISER, 640, 16), TAN, 'riser', 1.6);
  const players = [['violin', 'VIOLINS'], ['flute', 'FLUTES'], ['tuba', 'TUBA'], ['drum', 'DRUMS'], ['violin', 'CELLOS?']];
  players.forEach(([inst, name], i) => {
    const px = PLAYERS[i], tk = TM.words[i], cx = COINX[i], bi = barOf(cx);
    const bx = lerp(XY0[0], XY1[0], (bi + 0.43) / n), by = xyY(bx), pull = t >= tk - 0.02;
    // string from the struck bar up to the player's hinge lever: slack until the coin hits, then taut
    const lv = [px - 34, RISER + 16], sa = [bx, by + (pull && t < tk + 0.2 ? 3 : 0)];
    ink(pull ? [sa, lv] : bend(sa, lv, 9, 8), 'str' + i, { w: 1.3, col: OX });
    ink([[px - 34, RISER + 16], [px - 8, RISER + 4]], 'lev' + i, { w: 2.2 });
    const k = seg(t, tk - 0.02, tk + 0.22), up = k <= 0 ? 0 : k >= 1 ? 1 + Math.sin(seg(t, tk + 0.22, tk + 0.6) * Math.PI) * 0.05 * (1 - seg(t, tk + 0.22, tk + 0.6)) : ease(k) * 1.08;
    cutout(px, RISER, 0.8, { inst, up: Math.max(0.05, up), name: '' });
    if (up > 0.6) { shape(box(px - 59, RISER - 116, 118, 34), PAPER, 'tag' + i, 1.1); boxLabel(name, [px - 59, RISER - 116, 118, 34], 24, INK); }
  });
  // one big price tag on a string off the riser's end
  ink([[1050, RISER + 8], [1092, -326]], 'ptags', { w: 1.2 });
  X.save(); X.translate(1165, -300); X.rotate(0.05);
  shape([[-88, -48], [92, -48], [92, 48], [-88, 48], [-104, 0], [-88, -48]], GILT, 'ptag', 1.8); dot(-84, 0, 5, PAPER);
  boxLabel('ORCHESTRA', [-72, -42, 156, 40], 26, OX); boxLabel('$5/HR', [-72, -2, 156, 44], 30, RED);
  X.restore();
}
// The zoo photo. Joke: the coin pays for the photo op: it spins down a coin funnel, falls through the hose and lands
// on a big rubber bulb; the squeeze puffs air up the line and trips the flash. Payoff: the flash on "zoo", the kids
// deadpan, the giraffe leaning in, the Rocker startled, the print sliding out.
function zooPart(t) {
  if (t < T0 - 0.5 || !near(760, 300, 760)) return;
  // the post and the overhead arm with its pulleys (it carries the frames' rope); the funnel hangs off the post
  shape(box(POST - 7, -100, 14, ZOO + 100), TAN, 'post', 1.6);
  shape(box(P4[0] - 14, ARMY, POST - P4[0] + 21, 10), TAN, 'arm', 1.6);
  ink([[POST - 7, ARMY + 70], [POST - 80, ARMY + 10]], 'brace', { w: 2.4, col: TAN });
  ink([[FUN[0] + 50, 30], [POST - 7, 30]], 'fbr', { w: 3, col: TAN });
  // the rope: bucket, under the platform, up the post, along the arm, down to the frames
  const fr = framesAt(t), bk = bucketY(t), rope = [[BUCKET[0], bk - 70], P1, P2, P3, P4, [fr.x, fr.y - 36 * fr.s]];
  if (t < TM.land) ink(rope, 'rope', { w: 1.6, poly: true }); else ink(rope.slice(0, 5).concat([[P4[0], P4[1] + 60]]), 'rope', { w: 1.6, poly: true });
  for (const p of [P1, P2, P3, P4]) { blob(circ(p[0], p[1], 13), GREY, 'pul' + p[0] + p[1], 1.4); dot(p[0], p[1], 3); }
  ink([[P4[0], ARMY + 10], [P4[0], P4[1] - 10]], 'p4b', { w: 2 }); ink([[P3[0] + 6, P3[1]], [POST - 7, P3[1]]], 'p3b', { w: 2 });
  // the frames, hoisted up behind the kids (drawn behind the cast until they swing in front to land)
  if (!fr.front) drawFrames(t, fr);
  // funnel and hose (a tube, not a spring), routed round the outside of the camera
  blob([[FUN[0] - 64, FUN[1]], [FUN[0] + 64, FUN[1]], [FUN[0] + 26, NECK - 8], [FUN[0] + 26, NECK + 8], [FUN[0] - 26, NECK + 8], [FUN[0] - 26, NECK - 8]], GILT, 'funnel', 1.8);
  ink(circ(FUN[0], FUN[1], 64, 9, Math.PI, TAU, 14), 'funr', { w: 1.2 });
  ink(HOSE.slice(0, -1), 'hoseo', { w: 15, col: INK }); ink(HOSE.slice(0, -1), 'hosei', { w: 10, col: OX }); ink(HOSE.slice(0, -1).map(([a, b]) => [a - 2, b - 2]), 'hoseh', { w: 1.6, col: RED });
  // platform, fence, ZOO sign
  shape(box(130, ZOO, 1210, 22), TAN, 'zfl', 2);
  for (let i = 0; i < 12; i++) ink([[150 + i * 34, ZOO], [150 + i * 34, ZOO - 70]], 'fen' + i, { w: 2, col: TAN });
  ink([[142, ZOO - 56], [540, ZOO - 56]], 'fenr', { w: 2, col: TAN });
  shape(box(140, ZOO - 230, 140, 50), GREEN, 'zsign', 1.8); ink([[210, ZOO - 180], [210, ZOO]], 'zsp', { w: 3 }); boxLabel('CITY ZOO', [140, ZOO - 230, 140, 50], 24, PAPER);
  // the cast: the giraffe leans in by stages while the coin spins in the funnel; the kids stare
  giraffe(400, ZOO, 0.88, { lean: ease(seg(t, TM.and3 + 0.45, TM.and3 + 1.25)) * 0.5 + ease(seg(t, TM.kids - 0.3, TM.zoo - 0.15)) * 0.5 });
  kid(560, ZOO, 1.05, { kind: 'balloon' }); kid(650, ZOO, 1.05, { kind: 'ice' });
  rockerActing(t);
  if (fr.front && t < TM.land) drawFrames(t, fr);
  // the camera on its tripod, facing the set; the air line from the bulb runs up the tripod to the shutter
  for (const dx of [-40, 0, 40]) ink([[CAMERA[0] + 70, CAMERA[1] + 60], [CAMERA[0] + 70 + dx * 1.6, ZOO]], 'trip' + dx, { w: 2.6 });
  const [brx, bry] = bulbR(t), bc = [BULB[0], BULB[1] - bry], sq = bulbSq(t);
  const air = [[bc[0] - brx - 14, ZOO - 12], [CAMERA[0] + 76, ZOO - 12], [CAMERA[0] + 76, CAMERA[1] + 66]];
  ink(air, 'air', { w: 3.4, col: OX, poly: true });
  const ap = seg(t, TM.zoo - 0.02, TM.zoo + 0.06); if (ap > 0 && ap < 1) { const q = along(air, ap); dot(q[0], q[1], 6, OX); }
  shape(box(CAMERA[0] + 20, CAMERA[1] - 10, 110, 76), NAVY, 'cam', 2); shape([[CAMERA[0] + 20, CAMERA[1] + 2], [CAMERA[0] - 50, CAMERA[1] - 16], [CAMERA[0] - 50, CAMERA[1] + 72], [CAMERA[0] + 20, CAMERA[1] + 54], [CAMERA[0] + 20, CAMERA[1] + 2]], INK, 'bellows', 1.6);
  blob(circ(CAMERA[0] - 56, CAMERA[1] + 28, 18, 34), GLASS, 'lens', 1.6);
  shape(box(CAMERA[0] + 50, CAMERA[1] - 54, 50, 40), PAPER, 'flashp', 1.6);
  // the bulb: big red rubber, neck to the air line; squashed flat on "zoo", with a puff out of the neck
  blob([[bc[0] - brx - 16, ZOO - 18], [bc[0] - brx - 16, ZOO - 6], [bc[0] - brx + 6, ZOO - 4], [bc[0] - brx + 6, ZOO - 20]], OX, 'bneck', 1.4);
  blob(circ(bc[0], bc[1], brx, bry), RED, 'bulb', 2.2); ink(circ(bc[0] - brx * 0.35, bc[1] - bry * 0.35, brx * 0.35, bry * 0.3, Math.PI * 1.1, Math.PI * 1.7, 6), 'bulbh', { w: 1.6, col: PAPER });
  const pf = seg(t, TM.zoo, TM.zoo + 0.5);
  if (pf > 0 && pf < 1) for (let i = 0; i < 3; i++) { X.save(); X.globalAlpha = 0.8 * (1 - pf); blob(circ(bc[0] - brx - 30 - pf * 40 - i * 16, ZOO - 30 - pf * 30 + i * 6, 9 + pf * 10 - i * 2), PAPER, 'puff' + i, 1.2); X.restore(); }
  if (sq > 0.3) for (const s of [-1, 1]) ink([[bc[0] + s * (brx + 6), bc[1] - 4], [bc[0] + s * (brx + 20), bc[1] - 10]], 'bsq' + s, { w: 1.6 });
  // the flash on "zoo" (lamp glow at or under 0.4) and the print sliding out
  const fc = [CAMERA[0] + 75, CAMERA[1] - 34];
  if (t > TM.zoo - 0.02 && t < TM.zoo + 0.16) {
    const k = seg(t, TM.zoo - 0.02, TM.zoo + 0.16);
    X.save(); X.globalAlpha = 0.4 * (1 - k); dot(fc[0], fc[1], 50 + k * 220, '#fffbe9'); X.restore();
    for (let i = 0; i < 12; i++) { const a = i * TAU / 12; ink([[fc[0] + Math.cos(a) * 60, fc[1] + Math.sin(a) * 60], [fc[0] + Math.cos(a) * 130, fc[1] + Math.sin(a) * 130]], 'fr' + i, { w: 2.4, col: GILT }); }
  }
  const pk = ease(seg(t, TM.zoo + 0.3, TM.zoo + 1.4));
  if (pk > 0) { const px = CAMERA[0] + 30, py = CAMERA[1] + 66; shape(box(px, py, 80, 20 + pk * 70), PAPER, 'print', 1.4); if (pk > 0.6) { X.save(); X.globalAlpha = (pk - 0.6) / 0.4; shape(box(px + 8, py + 26, 64, 48), GLASS, 'printi', 0.8); dot(px + 30, py + 44, 6, INK); dot(px + 48, py + 40, 5, GILT); X.restore(); } }
}
// The Rocker: squints (he needs glasses), leans in at the camera before the flash, startles at it, and his eyes go
// wide behind the new frames. Drawn by cast.js; the lean and the faces are added here, in his own transform.
function rockerActing(t) {
  const leanIn = ease(seg(t, TM.kids - 0.8, TM.zoo - 0.25)) * 0.08;
  const st = ease(seg(t, TM.zoo - 0.01, TM.zoo + 0.08)) * (1 - ease(seg(t, TM.zoo + 0.35, TM.zoo + 0.9)));
  const pop = pulse(t, TM.land, 0.3) * 0.05;
  const ang = leanIn * (1 - st) - st * 0.1, hop = st * 16;
  const x = ROCKX, y = ZOO;
  X.save(); X.translate(x, y - hop); X.rotate(ang); X.scale(1 + pop, 1 + pop); X.translate(-x, -y);
  rocker(x, y, 1, { pose: t > TM.kids - 0.1 ? 'thumbs' : 'play', glasses: glassesOn(t), wave: t * 2 });
  X.translate(x, y);
  const face = t >= TM.land ? 'wide-glasses' : st > 0.3 ? 'startle' : 'squint';
  rockerFace(face, leanIn > 0.04 && face === 'squint' ? 1 : 0.6);
  X.restore();
}
function rockerFace(kind, hard) { // local units: feet at 0,0; eyes at (+-21, -372)
  X.save(); X.fillStyle = SKIN;
  for (const ex of [-21, 21]) { X.beginPath(); X.ellipse(ex, -371, 15, 11, 0, 0, TAU); X.fill(); }
  X.beginPath(); X.moveTo(-34, -405); X.lineTo(34, -405); X.lineTo(34, -386); X.lineTo(-34, -386); X.fill();
  X.restore();
  if (kind === 'squint') {
    for (const s of [-1, 1]) {
      const ex = s * 21;
      ink([[ex - 12, -372], [ex - 2, -375 + hard], [ex + 12, -372]], 'rsq' + s, { w: 2.8 });
      ink([[ex - 9, -366], [ex + 7, -365]], 'rsl' + s, { w: 1.1 });
      ink([[s * 34, -394 + hard * 2], [s * 8, -386 + hard * 2]], 'rsb' + s, { w: 2.8 }); // brows pulled down to the nose
    }
    ink([[-4, -392], [-2, -384]], 'rsf', { w: 1.2 }); ink([[4, -392], [2, -384]], 'rsf2', { w: 1.2 });
  } else {
    const big = kind === 'startle' ? 12 : 13, pr = kind === 'startle' ? 3.2 : 6;
    for (const s of [-1, 1]) {
      const ex = s * 21;
      X.save(); X.fillStyle = PAPER; X.beginPath(); X.ellipse(ex, -372, big - 1, big, 0, 0, TAU); X.fill(); X.restore();
      ink(circ(ex, -372, big - 1, big), 'rwe' + s, { w: 1.8 });
      dot(ex + (kind === 'startle' ? 0 : s * -1.5), -371, pr); if (pr > 4) dot(ex + 2, -374, 1.8, PAPER);
      ink([[s * 34, -398], [s * 10, -402]], 'rwb' + s, { w: 2.4 }); // brows up
    }
    if (kind === 'wide-glasses') { for (const ex of [-21, 21]) ink(circ(ex, -372, 19, 17), 'rkgl2' + ex, { w: 2.6, col: OX }); ink([[-3, -374], [3, -374]], 'rkglb2', { w: 2.4, col: OX }); }
    if (kind === 'startle') { // the grin drops to an O
      X.save(); X.fillStyle = SKIN; X.beginPath(); X.ellipse(0, -331, 33, 14, 0, 0, TAU); X.fill(); X.restore();
      const m = circ(0, -332, 9, 12); X.save(); X.fillStyle = OX; X.fill(pathOf(m)); X.restore(); ink(m, 'rkO', { w: 1.8 });
    }
  }
}
// the frames: two big rims with a bridge and temples; s scales them down as they rise to his face
function drawFrames(t, fr) {
  const { x: gx, y: gy, s: gs } = fr, hw = (LENS_R[0] - LENS_L[0]) / 2 * gs, r = RIM * gs, w = 14 * gs;
  X.save(); X.translate(gx, gy); X.rotate(-fr.th * 0.3); X.translate(-gx, -gy);
  for (const s of [-1, 1]) { const cx = gx + s * hw; X.save(); X.strokeStyle = INK; X.lineWidth = w + 6 * Math.max(gs, 0.4); X.beginPath(); X.arc(cx, gy, r, 0, TAU); X.stroke(); X.strokeStyle = OX; X.lineWidth = w; X.stroke(); X.restore(); X.save(); X.globalAlpha = 0.25; dot(cx, gy, Math.max(1, r - w / 2), GLASS); X.restore(); }
  ink(circ(gx, gy - 6 * gs, hw - r, 30 * gs, Math.PI, TAU, 10), 'bridge', { w: 3 * gs + 1, col: OX });
  if (gs > 0.95) { ink([[gx - hw - r - 60, gy - 40], [gx - hw - r, gy - 10]], 'templeL', { w: 4, col: OX }); ink([[gx + hw + r, gy - 10], [gx + hw + r + 60, gy - 40]], 'templeR', { w: 4, col: OX }); }
  X.restore();
}
// The optician's corner. Joke: the loop-the-loops run through a giant pair of eyeglasses; the coin's weight in the
// bucket hoists them. Payoff: the frames on his face. Then the chute out to THE CHARTS.
function glassesPart(t) {
  if (t < T0 - 0.5 || !near(700, 850, 700)) return;
  // eye chart with its NEW LOOK header
  shape(box(150, 700, 140, 220), PAPER, 'chart', 1.8);
  shape(box(158, 708, 124, 36), RED, 'nlook', 1.2); boxLabel('NEW LOOK', [158, 708, 124, 36], 22, PAPER);
  [['E', 56, 810], ['F P', 30, 856], ['T O Z', 22, 888], ['L P E D', 15, 910]].forEach(([s, z, y]) => label(s, 220, y - z * 0.35, z));
  // the run-up ramp, the bucket and its rope hook
  plank(RUNUP.slice(0, 2), 'ramp');
  const bk = bucketY(t);
  shape([[BUCKET[0] - 36, bk - 40], [BUCKET[0] + 36, bk - 40], [BUCKET[0] + 28, bk + 10], [BUCKET[0] - 28, bk + 10], [BUCKET[0] - 36, bk - 40]], GREY, 'bucket', 1.8);
  ink(circ(BUCKET[0], bk - 40, 36, 30, Math.PI, TAU, 10), 'bail', { w: 1.4 });
  if (framesAt(t).y > 700) drawFrames(t, framesAt(t)); // on the track (the hoist is drawn with the zoo, behind the cast)
  plank(CHUTE, 'chute');
}
// THE CHARTS. Joke: a hit is a ladder you pay to climb, one rung per hook phrase. It is folded in a crate until
// hook 2, then telescopes up to #1 while the coin rides the chute. Rungs turn gold as they're climbed.
function chartsPart(t) {
  if (t < TM.unfold - 0.4 || !near(-500, 100, 1100)) return;
  const u = unfoldAt(t), top = [lerp(LAD0[0], LAD1[0], u), lerp(LAD0[1], LAD1[1], u)];
  shape(box(LAD0[0] - 70, LAD0[1] + 12, 140, 50), RED, 'crate', 2); boxLabel('CHARTS', [LAD0[0] - 70, LAD0[1] + 12, 140, 50], 26, PAPER);
  if (u <= 0) return;
  [-46, 46].forEach((o, i) => ink([[LAD0[0] + o, LAD0[1] + 12], [top[0] + o, top[1] - 30 * u]], 'rail' + i, { w: 3, col: TAN }));
  for (let i = 0; i <= 10; i++) {
    if (i / 10 > u + 0.001) break;
    const [x, y] = rung(i), lit = i > 0 && t > TM.h2[i - 1];
    shape(box(x - 52, y - 2, 104, 12), lit ? GILT : TAN, 'rung' + i, 1.4);
    const lx = i <= 5 ? x - 84 : x + 72, on = i === 0 ? TM.h2[0] - 0.3 : TM.h2[i - 1] + 0.1;
    if (t > on) fitLabel(CHART[i], lx, y + 2, 60, i === 10 ? 34 : 24, lit ? RED : INK);
  }
  const pop = ease(seg(t, TM.unfold + 1.0, TM.unfold + 1.25));
  if (pop > 0) {
    const [tx, ty] = rung(10), bx = [tx - 150, ty - 190, 240, 54], cy = bx[1] + bx[3];
    for (const o of [-46, 46]) ink([[tx + o, ty - 30], [tx + o, lerp(ty - 30, cy, pop)]], 'cpost' + o, { w: 3, col: TAN }); // the rails run on up to the banner
    X.save(); X.translate(0, cy); X.scale(1, Math.max(0.05, pop)); X.translate(0, -cy);
    shape(box(...bx), RED, 'charts', 2); if (pop > 0.9) boxLabel('THE CHARTS', bx, 30, PAPER); X.restore();
  }
}
function words(t) {
  if (t < T0 - 0.5) return;
  const hk = C.hookText, ag = C.againText, lines = C.lines.slice(L0, L0 + 5);
  C.hooks[0].ticks.forEach((tk, i) => letterWords(phrase(hk, tk), -390, -1236 + i * 48, 44, INK, 400));
  letterWords([{ w: ag, t: C.hooks[0].again }], -390, -852, 44, INK, 400);
  const SPOTS = [[70, -725, 430], [-262, -130, 250], [385, -140, 440], [100, 185, 370], [560, 925, 540]];
  lines.forEach((l, i) => { const [x, y, mw] = SPOTS[i]; letterWords(l.words, x, y, 44, INK, mw); });
  // hook 2 in red, one hook phrase per rung, just above it: right of rungs 1-5, left of 6-10 (the chart numbers
  // take the other side)
  C.hooks[1].ticks.forEach((tk, i) => { const [x, y] = rung(i + 1); letterWords(phrase(hk, tk), i < 5 ? x + 62 : x - 310, y - 60, 36, RED, 400); });
  letterWords([{ w: ag, t: C.hooks[1].again }], -390, -804, 44, RED, 400);
}

// ---------- register ----------
SEC.list = { enterT: T0, exitT: T1, pullback: false, entry: BAGM, exit: { t: T1, p: [SLOT[0], -820] } };
section({
  id: 'list', range: [T0, T1],
  init() { times(); SEC.list.enterT = SEC.attic ? SEC.attic.exit.t : T0; },
  legs, cam,
  parts(t) { chartsPart(t); hitSlot(t); cellistPart(t); orchestraPart(t); glassesPart(t); zooPart(t); publicistPart(t); },
  words,
});
})();

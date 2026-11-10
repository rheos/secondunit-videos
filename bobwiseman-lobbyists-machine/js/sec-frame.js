// Section 'frame' (b7): the jukebox that keeps turning out bigger, and the outro. Owner: b7.
// Joke: a hit isn't written, it's bought, and the machine that sells it is only ever the window of a bigger one.
// J1 (pull-back 1, 51.7-55.0): test 01 turns out to sit inside a real jukebox (bubble tubes, a record turning in the
// crown, chrome grille, a SELECT YOUR HIT card, lamps coming on). J2 (pull-back 2, 115.2-118.0): J1 is only the title
// window of a jukebox that holds every floor built so far, with a big record turning in a dome top right. J3
// (pull-back 3, 166-182): the whole page is one jukebox; a slow pan down it. Coin slot at [1600, 5650].
// Outro (207.8-268.6): the coin goes in the slot; each round the camera dives into a jukebox window and finds the
// machine again, a step darker and running faster, and the machine eats the Rocker (round 3 he is the cellist,
// round 4 he is a bolted-in lever, round 5 a row of copies, round 6 only the coin's gold line is left). Round 7 pulls
// all the way back out to the money bag, empty, and the coin comes out of the COIN RETURN.
// Song time throughout (t 0 = song start). Words come from window.CUES at run time.
(() => {
'use strict';
const T0 = 207.8, T1 = 268.6;
SEC.frame = { exit: { t: T1, p: [1600, 5846] } };

// ---------- framings and windows ----------
// VJ: the first jukebox, whole. Every level of the outro arrives on this framing; its base window shows the next level
// framed exactly the same way, so the dive into the window lands on the next level's VJ without a seam.
const Q = [184, -60], ZJ = 720 / 2835, VJ = { x: Q[0], y: Q[1], z: ZJ };
const WIN1 = { c: [184, 1250], w: 256, h: 144 }, S1 = WIN1.h / 2835;         // J1's base window (16:9)
const W3 = { c: [2160, 5764.5], w: 320, h: 180 }, S3 = W3.h / 2835;          // J3's base window, right of the coin slot
const DLOG = Math.log(1 / S1);                                               // one level of zoom
const FP = [Q[0], (WIN1.c[1] - S1 * Q[1]) / (1 - S1)];                       // the point the windows nest towards
// The basement sits right on J3's base: its busts end at y 5451, b6's APPROVED mark is at x 1035..1462, y 5462..5549 and
// its heart monitor reaches down to y 5267 from x 2470. Both base framings start at y 5456, between the busts and the mark.
const F0 = { x: 1688, y: 5835, z: 0.95 };      // round 1: the base, slot, window, card, coin return, the chant below
const FE = { x: 1472, y: 5713, z: 1.4 };       // the last chord: the card, the COIN RETURN and the coin in its tray
const VB = { x: -680, y: -900, z: 0.9 };       // the first money bag (top under J1's crown, right edge short of verse 2's lettering)
const VJ2 = { x: 1600, y: 560, z: 720 / 7400 }, VJ3 = { x: 1600, y: 1450, z: 720 / 9300 };
const VTOP = { x: 1600, y: -1250, z: 0.2 }, PANY = [-1250, 4150];
const VP = { x: 184, y: -40, z: 0.245 };        // pull-back 1's whole J1: porthole top -1477 and base bottom 1330 inside y -1509..1429
const W1 = { x: 2170, y: -1000, z: 0.6 };
// out from the cabinet to VP about the one point whose screen spot stays put, so the zoom never whips (51.7-52.75)
let P1 = null;
function pull1(t) {
  if (!P1) { const c = followAt(51.7), z0 = 1.1, k = z0 - VP.z, p = [(c[0] * z0 - VP.x * VP.z) / k, (c[1] * z0 - VP.y * VP.z) / k]; P1 = { z0, p, s: [(p[0] - c[0]) * z0, (p[1] - c[1]) * z0] }; }
  const z = Math.exp(lerp(Math.log(P1.z0), Math.log(VP.z), ease(seg(t, 51.7, 52.75))));
  return { x: P1.p[0] - P1.s[0] / z, y: P1.p[1] - P1.s[1] / z, z };
}       // pull-back 1 lands over b3's first framing (2170, -950, 0.95): left edge x 1103 clears test 01, top -1600 the attic
// pull-back 2 zooms out about hook 4's "Again" (written in the doorway at 115.13, sharp until 116.63): the word's screen
// spot holds while the zoom runs, and only once it is wide (from 116.5) does the framing slide over to J2's centre
const AGAIN = [1662, 3447];
function followAt(t) { let x = 0, y = 0, sum = 0; for (let j = -10; j <= 14; j++) { const w = 1 - Math.abs(j - 2) / 14, b = ballAt(t + j * 0.04); x += b[0] * w; y += b[1] * w; sum += w; } return [x / sum, y / sum - 30]; }
let P2 = null;
function pull2(t) {
  if (!P2) { const a = followAt(115.2), z0 = 1.1; P2 = { z0, s0: [(AGAIN[0] - a[0]) * z0, (AGAIN[1] - a[1]) * z0], s1: [(AGAIN[0] - VJ2.x) * VJ2.z, (AGAIN[1] - VJ2.y) * VJ2.z] }; }
  const z = Math.exp(lerp(Math.log(P2.z0), Math.log(VJ2.z), ease(seg(t, 115.2, 116.6)))), e = ease(seg(t, 116.5, 117.2));
  return { x: AGAIN[0] - lerp(P2.s0[0], P2.s1[0], e) / z, y: AGAIN[1] - lerp(P2.s0[1], P2.s1[1], e) / z, z };
}
// dives in the gaps after each chant (level k to k+1), round 6's hold, round 7's pull-out
// each dive starts once the round's last word has held 1.5 s, and lands as the next round's chant starts
const DV = [[214.15, 216.75], [222.95, 225.4], [231.3, 234.0], [240.35, 242.95], [249.05, 251.25]];
const PO = [257.5, 260.5];                     // round 7: back out through the levels, after round 6's words have held
// chant onsets read off the vocal stem (C.outro's beat grid runs up to 2 s off from round 4 on); six sung bursts
const CH = [208.0, 216.8, 225.1, 234.2, 242.9, 251.05], WSP = 0.36, SECOND = 2.8;
const SKEL = 5;                                // from level 5 on only the jukebox and the coin's gold line are left
const STEP = [0.9, 0.86, 0.8];                 // each level's paper, one step darker (multiplied)
const CHORD = 264.45;                          // the last chord: SELECT YOUR HIT lights

let NOW = 0, MAIN = -1;                        // real song time of the frame; the level the outro is drawing as main

// ---------- small helpers ----------
const vis = (x0, y0, x1, y1, m = 0) => !VIEW || (x1 > VIEW[0] - m && x0 < VIEW[2] + m && y1 > VIEW[1] - m && y0 < VIEW[3] + m);
const stepCol = (n) => `rgb(${STEP.map((s) => Math.round(255 * s ** n)).join(',')})`;
function ring(x, y, r, w = 1.6, col = INK) { X.save(); X.strokeStyle = col; X.lineWidth = w; X.beginPath(); X.arc(x, y, r, 0, TAU); X.stroke(); X.restore(); }
function lamp(x, y, r, on) {
  if (on > 0) { X.save(); X.globalAlpha = 0.3 * on; dot(x, y, r * 2.3, LAMP); X.restore(); }
  dot(x, y, r, on > 0.5 ? LAMP : GREY); ring(x, y, r, 1.4);
}
// a lit bubble tube along a path: ink casing, coloured fluid, lamp glow, bubbles rising
function tube(pts, fluid, lit, n, w = 22) {
  const path = () => { X.beginPath(); pts.forEach((p, i) => (i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1]))); };
  X.save(); X.lineCap = 'round'; X.lineJoin = 'round';
  if (lit > 0) { X.globalAlpha = 0.26 * lit; X.strokeStyle = LAMP; X.lineWidth = w * 2.3; path(); X.stroke(); }
  X.globalAlpha = 1; X.strokeStyle = INK; X.lineWidth = w + 6; path(); X.stroke();
  X.strokeStyle = lit > 0.5 ? fluid : GREY; X.lineWidth = w; path(); X.stroke();
  X.restore();
  if (lit < 0.5) return;
  for (let i = 0; i < n; i++) { const k = (i / n + NOW * 0.06 * (1 + (i % 3) * 0.2)) % 1, p = along(pts, k); dot(p[0], p[1], w * 0.22, PAPER); ring(p[0], p[1], w * 0.22, 1); }
}
function record(cx, cy, r, ang, tag) {
  dot(cx, cy, r, INK);
  X.save(); X.globalAlpha = 0.55; X.strokeStyle = '#5a4d44'; X.lineWidth = r * 0.012 + 0.6;
  for (let k = 0.42; k < 0.97; k += 0.08) { X.beginPath(); X.arc(cx, cy, r * k, 0, TAU); X.stroke(); }
  X.globalAlpha = 0.4; X.strokeStyle = PAPER; X.lineWidth = r * 0.05;
  for (const o of [0, Math.PI]) { X.beginPath(); X.arc(cx, cy, r * 0.72, ang + o, ang + o + 0.55); X.stroke(); }
  X.restore();
  blob(circ(cx, cy, r * 0.3), RED, tag + 'l', 1.4); dot(cx + Math.cos(ang) * r * 0.17, cy + Math.sin(ang) * r * 0.17, r * 0.04, PAPER); dot(cx, cy, r * 0.035, INK);
}
// the title cards behind a window's glass, waiting for a coin (a = how much they show)
function strips(x0, y0, w, h, a, tag) {
  if (a <= 0) return;
  X.save(); X.globalAlpha = a; X.fillStyle = GLASS; X.fillRect(x0, y0, w, h);
  const cw = w * 0.42, ch = h * 0.22;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
    const x = x0 + w * 0.05 + c * w * 0.49, y = y0 + h * 0.08 + r * h * 0.3;
    X.globalAlpha = a; X.fillStyle = PAPER; X.fillRect(x, y, cw, ch); X.strokeStyle = INK; X.lineWidth = Math.max(0.6, h * 0.008); X.strokeRect(x, y, cw, ch);
    X.strokeStyle = r === 0 && c === 0 ? RED : PENCIL; X.beginPath(); X.moveTo(x + cw * 0.1, y + ch * 0.5); X.lineTo(x + cw * 0.9, y + ch * 0.5); X.stroke();
  }
  X.restore();
}
// camera framings: interpolate in log zoom, the centre moving with the view size so nothing slides sideways
function mixV(a, b, k) {
  const z = Math.exp(lerp(Math.log(a.z), Math.log(b.z), k));
  const w = Math.abs(a.z - b.z) < 1e-6 ? 1 - k : (1 / z - 1 / b.z) / (1 / a.z - 1 / b.z);
  return { x: b.x + (a.x - b.x) * w, y: b.y + (a.y - b.y) * w, z };
}
function blendTo(st, tg, k) { if (k <= 0) return; const v = mixV(st, tg, k); st.x = v.x; st.y = v.y; st.z = v.z; }
// a dive into a window: the window rises to the frame's middle while it grows to fill the frame
function dive(u, v0, win, z1) {
  const z = Math.exp(lerp(Math.log(v0.z), Math.log(z1), u));
  const sx = lerp(640 + (win.c[0] - v0.x) * v0.z, 640, u), sy = lerp(360 + (win.c[1] - v0.y) * v0.z, 360, u);
  return { x: win.c[0] - (sx - 640) / z, y: win.c[1] - (sy - 360) / z, z };
}
// a level's framing seen from the level above, through a window
const toOuter = (v, win, s) => ({ x: win.c[0] + s * (v.x - Q[0]), y: win.c[1] + s * (v.y - Q[1]), z: v.z / s });
// pure zoom about the nesting point; lam counts levels in log zoom (lam = k * DLOG is level k's VJ)
function fz(lam) {
  const L = Math.max(0, Math.floor(lam / DLOG + 1e-6)), z = ZJ * Math.exp(lam - L * DLOG);
  return { L, x: FP[0], y: FP[1] - (FP[1] - Q[1]) * ZJ / z, z };
}

// the outro camera: which level is on screen and the framing in that level's own units
function outroView(t) {
  if (t < DV[0][0]) return { L: 0, ...F0 };
  if (t < DV[0][1]) return { L: 0, ...dive(ease(seg(t, DV[0][0], DV[0][1])), F0, W3, ZJ / S3) };
  for (let k = 1; k < DV.length; k++) {
    if (t < DV[k][0]) return { L: k, ...VJ };
    if (t < DV[k][1]) return { L: k, ...dive(ease(seg(t, DV[k][0], DV[k][1])), VJ, WIN1, ZJ / S1) };
  }
  // round 6: held on the bare jukebox (only the coin's gold line is left), its windows nesting into its base; the
  // chant sits in the margins outside the cabinet, so the camera keeps still until it has held
  if (t < PO[0]) return fz(5 * DLOG);
  if (t < PO[1]) return fz(lerp(5 * DLOG, DLOG, ease(seg(t, PO[0], PO[1]))));
  if (t < 262.3) return { L: 1, ...mixV(VJ, VB, ease(seg(t, PO[1], 261.6))) };
  if (t < 263.6) return { L: 0, ...mixV(toOuter(VB, W3, S3), F0, ease(seg(t, 262.3, 263.6))) };
  return { L: 0, ...mixV(F0, FE, ease(seg(t, 264.4, 268.2))) };
}

// each level replays test 01 (19.95-51.4) on a loop, faster the deeper it is; offsets put round 3's yo-yo and
// round 4's lever between their chants
const LOOP0 = 19.95, LOOPN = 31.45, SPEED = [1, 2, 3, 4, 5, 6, 8];
const OFF = [0, 0, 0, 0, 0, 0, 0];
[[2, 228.2, 30.4], [3, 236.8, 29.8]].forEach(([L, tt, tl]) => { OFF[L] = (((tl - LOOP0 - SPEED[L] * (tt - T0)) % LOOPN) + LOOPN) % LOOPN; });
function levelT(L, t) { const i = Math.min(L, SPEED.length - 1), v = SPEED[i]; return LOOP0 + ((((v * (t - T0) + OFF[i]) % LOOPN) + LOOPN) % LOOPN); }

// ---------- cheap pens for machines drawn a few pixels tall inside a window (nests safely) ----------
const PENS = {}; let CHEAP = 0;
function cheapPens(on) {
  if (on) {
    if (CHEAP++ > 0) return;
    Object.assign(PENS, { ink, crayon, wax });
    ink = (pts, tag, { col = INK, w = 1.5, a = 1 } = {}) => { if (pts.length < 2) return; X.save(); X.globalAlpha = a; X.strokeStyle = col; X.lineWidth = w * 1.2; X.lineJoin = 'round'; X.lineCap = 'round'; X.beginPath(); pts.forEach((p, i) => (i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1]))); X.stroke(); X.restore(); };
    // the wax strokes across a fill average out to a light soft-light darkening at this size
    crayon = (path, col, tag, a = 1) => { X.save(); X.globalAlpha = a * 0.9; X.fillStyle = col; X.fill(path); X.globalCompositeOperation = 'soft-light'; X.globalAlpha = a * 0.11; X.fillStyle = '#000'; X.fill(path); X.restore(); };
    wax = (path, col) => { X.save(); X.fillStyle = col; X.fill(path); X.globalCompositeOperation = 'soft-light'; X.globalAlpha = 0.08; X.fillStyle = '#000'; X.fill(path); X.restore(); };
  } else if (--CHEAP === 0) { ink = PENS.ink; crayon = PENS.crayon; wax = PENS.wax; }
}
// a stroke cache. Inside the jukebox and the outro's levels the line boil runs as a three-drawing cycle (SEED 1-3, still
// changing on twos), so a stroke that doesn't move is built once and reused, however many levels draw it. Same pen as
// pen.js ink(); it only saves rebuilding the outline (the outro draws the machine several times a frame).
const SC = new Map();
function inkCached(pts, tag, { col = INK, w = 1.5, pen = 'ink', poly = false, a = 1 } = {}) {
  if (pts.length < 2) return;
  if (SC.size > 40000) SC.clear();
  let h = 2166136261; for (const p of pts) { h = Math.imul(h ^ Math.round(p[0] * 16), 16777619); h = Math.imul(h ^ Math.round(p[1] * 16), 16777619); }
  const key = `${SEED}|${tag}|${h}|${pts.length}|${w}|${pen}|${poly ? 1 : 0}`;
  let L = SC.get(key);
  if (!L) { const r = LLPen.stroke(pts, pen, rng(tag), { width: w, wobble: 1.1, tier: 'lo', poly, round: 2 }); L = r.layers.map((l) => [new Path2D(l.d), l.op, l.rule || 'nonzero']); SC.set(key, L); }
  X.save(); X.fillStyle = col; for (const [p2, op, rule] of L) { X.globalAlpha = Math.min(1, op * a); X.fill(p2, rule); } X.restore();
}
let RAWINK = null, WIDE = false;
function wideOff() { if (WIDE) { WIDE = false; cheapPens(false); } }
function cached(fn) {
  if (RAWINK) return fn();
  const s0 = SEED; RAWINK = ink; SEED = 1 + (((s0 % 3) + 3) % 3);
  if (!CHEAP) ink = inkCached; else PENS.ink = inkCached;
  try { return fn(); } finally { if (!CHEAP) ink = RAWINK; else PENS.ink = RAWINK; RAWINK = null; SEED = s0; }
}

let OFFC = null;
function offscreen() { if (!OFFC) { const c = document.createElement('canvas'); c.width = W; c.height = H; OFFC = c.getContext('2d'); } return OFFC; }

// ---------- a window that shows the next level of the machine ----------
function nest(win, s, depth) {
  const x0 = win.c[0] - win.w / 2, y0 = win.c[1] - win.h / 2, a = X.getTransform().a, px = win.w * a;
  X.save(); X.beginPath(); X.rect(x0, y0, win.w, win.h); X.clip();
  X.fillStyle = PAPER; X.fillRect(x0, y0, win.w, win.h);
  if (px > 3) {
    const sv = VIEW, st = T, L2 = depth + 1, tl = levelT(L2, NOW);
    const v = sv || [x0, y0, x0 + win.w, y0 + win.h];
    const ix0 = Math.max(v[0], x0), iy0 = Math.max(v[1], y0), ix1 = Math.min(v[2], x0 + win.w), iy1 = Math.min(v[3], y0 + win.h);
    if (ix1 > ix0 && iy1 > iy0) {
      X.save(); X.translate(win.c[0], win.c[1]); X.scale(s, s); X.translate(-Q[0], -Q[1]);
      VIEW = [(ix0 - win.c[0]) / s + Q[0], (iy0 - win.c[1]) / s + Q[1], (ix1 - win.c[0]) / s + Q[0], (iy1 - win.c[1]) / s + Q[1]];
      const full = L2 < SKEL ? clamp((px - 120) / 120) : 0, cheap = a * s < 0.12;
      if (cheap) cheapPens(true);
      if (full < 1) skeleton(L2, tl);
      if (full > 0) {
        T = tl;
        if (full >= 1) drawWorld(tl, L2);
        else { // fade the whole machine in over the bare jukebox while the window grows
          const m = X.getTransform(), main = X, o = offscreen();
          o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, W, H); o.setTransform(m); X = o;
          try { drawWorld(tl, L2); } finally { X = main; }
          X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = full; X.drawImage(o.canvas, 0, 0); X.restore();
        }
      }
      if (cheap) cheapPens(false);
      X.restore(); VIEW = sv; T = st;
    }
  }
  X.globalCompositeOperation = 'multiply'; X.fillStyle = stepCol(1); X.fillRect(x0, y0, win.w, win.h);
  X.restore();
}
// round 6 on: the bare jukebox, its window, and the coin as a gold line
function skeleton(L, tl, main = false) {
  j1(tl, L);
  if (!main) { goldLine(tl); marginText(L, false); }
}
function goldLine(tl) {
  const pts = []; for (let j = 0; j <= 60; j++) { const tt = tl - j * 0.07; if (tt < LOOP0) break; pts.push(ballAt(tt)); }
  if (pts.length < 2) return;
  X.save(); X.lineCap = 'round'; X.lineJoin = 'round';
  const path = () => { X.beginPath(); pts.forEach((p, i) => (i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1]))); };
  X.globalAlpha = 0.3; X.strokeStyle = LAMP; X.lineWidth = 80; path(); X.stroke();
  X.globalAlpha = 1; X.strokeStyle = GILT; X.lineWidth = 18; path(); X.stroke();
  X.restore();
  X.save(); X.globalAlpha = 0.35; dot(pts[0][0], pts[0][1], 60, LAMP); X.restore();
  coin(pts[0][0], pts[0][1], 'gold', NOW * 6, 26);
}

// ---------- J1: the first jukebox, round test 01 ----------
// A squared arch (a superellipse, n 6) so its shoulders clear test 01's top-left lettering and its walls clear the chart
// rung words; the band is 70 deep over the crown (under b3's tube at y -1510) and 46 down the sides.
const J1 = { x0: -1112, x1: 1480, top: -1460, ys: -935, yb: 1160, cx: 184, bt: 70, bs: 46 };
J1.rx = (J1.x1 - J1.x0) / 2; J1.ry = J1.ys - J1.top;
// a line through the band: f 0 is the outer edge, f 1 the inner
function j1Ring(f) {
  const rx = J1.rx - J1.bs * f, ry = J1.ry - J1.bt * f, o = [[J1.cx - rx, J1.yb]];
  for (let k = 0; k <= 64; k++) {
    const a = Math.PI + Math.PI * k / 64, c = Math.cos(a), s = Math.sin(a);
    o.push([J1.cx + Math.sign(c) * Math.abs(c) ** (1 / 3) * rx, J1.ys + Math.sign(s) * Math.abs(s) ** (1 / 3) * ry]);
  }
  o.push([J1.cx + rx, J1.yb]); return o;
}
const J1R0 = j1Ring(0), J1R1 = j1Ring(1), J1T = j1Ring(0.64), J1L = j1Ring(0.22), J1BAND = J1R0.concat(J1R1.slice().reverse());
function j1(t, depth) {
  if (!vis(J1.x0 - 20, J1.top - 20, J1.x1 + 20, 1350, 80)) return;
  const n = 34, lit = (i) => (depth > 0 ? 1 : seg(t, 52.3 + i * 1.25 / n, 52.42 + i * 1.25 / n)), cx = J1.cx;
  X.save();
  if (depth === 0) { const k = ease(seg(t, 51.7, 52.5)); if (k < 1) { X.beginPath(); X.arc(-520, -820, 40 + k * 3600, 0, TAU); X.clip(); } }
  // the plinth: chrome grille, SELECT YOUR HIT, the window, the selector buttons
  shape(box(J1.x0, 1160, J1.x1 - J1.x0, 170), OX, 'j1base', 2.4); shape(box(J1.x0, 1160, J1.x1 - J1.x0, 12), GILT, 'j1trim', 1.2);
  for (const [gx0, gx1] of [[J1.x0 + 30, -840], [960, J1.x1 - 30]]) {
    X.save(); X.fillStyle = GREY; X.fillRect(gx0, 1180, gx1 - gx0, 136); X.restore();
    for (let x = gx0 + 14; x < gx1; x += 32) ink([[x, 1184], [x, 1312]], 'j1g' + x, { w: 2.2, col: INK });
    ink(box(gx0, 1180, gx1 - gx0, 136), 'j1gb' + gx0, { w: 2, poly: true });
  }
  shape(box(-800, 1188, 760, 124), PAPER, 'j1card', 2); boxLabel('SELECT YOUR HIT', [-800, 1188, 760, 124], 72, RED);
  for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) { const x = 394 + i * 108, y = 1196 + r * 66; shape(box(x, y, 76, 46), r ? GILT : RED, `j1b${r}${i}`, 1.6); lamp(x + 38, y + 23, 9, lit(i * 6 + r)); }
  shape(box(cx - 142, 1167, 284, 160), GREY, 'j1wf', 2);
  if (depth === 0) strips(WIN1.c[0] - WIN1.w / 2, WIN1.c[1] - WIN1.h / 2, WIN1.w, WIN1.h, 1, 'j1s');
  else nest(WIN1, S1, depth);
  ink(box(WIN1.c[0] - WIN1.w / 2, WIN1.c[1] - WIN1.h / 2, WIN1.w, WIN1.h), 'j1wg', { w: 1.6, poly: true });
  // the body: a crayon-filled arch round everything, a bubble tube inside it, lamps along its outer edge
  crayon(pathOf(J1BAND), OX, 'j1band'); ink(J1R0, 'j1o', { w: 3.4 }); ink(J1R1, 'j1i', { w: 2.4 });
  const tl = clamp(depth > 0 ? 1 : seg(t, 52.3, 53.4)), h = Math.floor(J1T.length / 2);
  tube(J1T.slice(0, h + 1), RED, tl, 12, 16); tube(J1T.slice(h), RED, tl, 12, 16);
  for (let i = 0; i < n; i++) { const p = along(J1L, (i + 0.5) / n); lamp(p[0], p[1], 6, lit(i)); }
  // the crown: a porthole with the record turning in it
  blob(circ(cx, -1425, 52), GREY, 'j1port', 2.4); record(cx, -1425, 42, NOW * 3.4, 'j1rec');
  X.restore();
}

// ---------- J2: J1 turns out to be the title window of a jukebox round every floor so far ----------
const crown2 = (x, i = 0) => -2830 - 140 * Math.sqrt(Math.max(0, 1 - ((x - 1600) / 2850) ** 2)) + i;
const crown3 = (x, i = 0) => -2860 - 140 * Math.sqrt(Math.max(0, 1 - ((x - 1600) / 2900) ** 2)) + i;
const xs = (a, b, n) => [...Array(n + 1)].map((_, i) => lerp(a, b, i / n));
function j2(t) {
  if (!vis(-1260, -2980, 4460, 4100, 80)) return;
  const n = 46, lit = (i) => seg(t, 115.8 + i * 1.2 / n, 115.95 + i * 1.2 / n), tl = seg(t, 115.8, 116.6);
  X.save();
  const k = ease(seg(t, 115.2, 116.4)); if (k < 1) { const c = SEC.frame.c2 || [1400, 3700]; X.beginPath(); X.arc(c[0], c[1], 60 + k * 9000, 0, TAU); X.clip(); }
  // crown
  const top = xs(-1250, 4450, 60).map((x) => [x, crown2(x)]), bot = xs(4450, -1250, 60).map((x) => [x, crown2(x, 64)]);
  crayon(pathOf(top.concat(bot)), OX, 'j2cr'); ink(top, 'j2cro', { w: 3.4, poly: true }); ink(bot, 'j2cri', { w: 2.4, poly: true });
  for (let i = 0; i < n; i++) { const x = lerp(-1180, 4380, (i + 0.5) / n); lamp(x, crown2(x, 30), 11, lit(i)); }
  // pilasters with bubble tubes
  for (const [px, s] of [[-1258, 0], [4310, 1]]) { // the left one stops short of J1's wall (x -1112)
    shape(box(px, -2830, 132, 6750), OX, 'j2p' + s, 2.6); ink([[px + 18, -2820], [px + 18, 3910]], 'j2pg' + s, { w: 4, col: GILT });
    tube([[px + 68, 3880], [px + 68, -2770]], s ? GILT : RED, tl, 40, 36);
  }
  // the record dome, top right
  const dome = (i) => { const o = [[1700 + i, -1600]]; for (let q = 0; q <= 40; q++) { const a = Math.PI + Math.PI * q / 40; o.push([2900 + Math.cos(a) * (1200 - i), -1600 + Math.sin(a) * (1050 - i)]); } o.push([4100 - i, -1600]); return o; };
  const d0 = dome(0), d1 = dome(56);
  crayon(pathOf(d0.concat(d1.slice().reverse())), GREY, 'j2dome'); ink(d0, 'j2do', { w: 3.4, poly: true }); ink(d1, 'j2di', { w: 2.2, poly: true });
  ink([[1700, -1600], [4100, -1600]], 'j2db', { w: 3.4 });
  X.save(); X.globalAlpha = 0.35; X.fillStyle = GLASS; X.fill(pathOf(d1)); X.globalAlpha = 0.18 * tl; X.fillStyle = LAMP; X.fill(pathOf(d1)); X.restore();
  for (let i = 0; i < 9; i++) { const x = 1880 + i * 46; shape(box(x, -2180, 18, 520), INK, 'j2stk' + i, 1); shape(box(x + 2, -1960, 14, 80), RED, 'j2stl' + i, 0.8); }
  record(2950, -2060, 400, NOW * 2.2, 'j2rec');
  ink([[3830, -2420], [3560, -2260], [3290, -2180]], 'j2arm', { w: 14, col: GREY }); blob(circ(3830, -2420, 44), GREY, 'j2piv', 2); ink([[3270, -2200], [3310, -2160]], 'j2nd', { w: 6 });
  // the base: a title strip under everything (the coin's way down into the basement stays open on the left)
  shape(box(-820, 3920, 5270, 170), OX, 'j2base', 2.6); shape(box(-820, 3920, 5270, 12), GILT, 'j2bt', 1.2);
  for (let i = 0; i < 22; i++) { const x = -760 + i * 232; if (x > 1000 && x < 2180) continue; shape(box(x, 3960, 190, 64), PAPER, 'j2ts' + i, 1.4); ink([[x + 20, 3992], [x + 170, 3992]], 'j2tl' + i, { w: 1.2, col: i % 3 ? PENCIL : RED }); }
  shape(box(1040, 3946, 1120, 120), PAPER, 'j2card', 2); boxLabel('SELECT YOUR HIT', [1040, 3946, 1120, 120], 90, RED);
  X.restore();
}

// ---------- J3: the whole page is one jukebox; its base holds the coin slot, a window and the COIN RETURN ----------
const SLOT = [1600, 5650], CARD = [1090, 5640, 410, 100], TRAY = [1548, 5815, 104, 57];
function j3(t) {
  if (!vis(-1310, -3010, 4510, 5910, 80)) return;
  const n = 52, lit = (i) => seg(t, 167.4 + i * 1.6 / n, 167.55 + i * 1.6 / n), tl = seg(t, 167.4, 168.6);
  X.save();
  const k = ease(seg(t, 166, 168)); if (k < 1) { const c = SEC.frame.c3 || [1600, 4600]; X.beginPath(); X.arc(c[0], c[1], 60 + k * 11000, 0, TAU); X.clip(); }
  // a second crown above J2's, and chrome rails down both sides
  const top = xs(-1300, 4500, 60).map((x) => [x, crown3(x)]), bot = xs(4500, -1300, 60).map((x) => [x, crown3(x, 40)]);
  crayon(pathOf(top.concat(bot)), RED, 'j3cr'); ink(top, 'j3cro', { w: 3.4, poly: true });
  for (let i = 0; i < n; i++) { const x = lerp(-1240, 4440, (i + 0.5) / n); lamp(x, crown3(x, 20), 10, lit(i)); }
  for (const [px, s] of [[-1300, 0], [4460, 1]]) { shape(box(px, crown3(px), 40, 5600 - crown3(px)), GREY, 'j3rail' + s, 2); ink([[px + 14, crown3(px) + 20], [px + 14, 5590]], 'j3rh' + s, { w: 2, col: PAPER }); }
  // the lower cabinet, beside the basement
  for (const [px, s] of [[-1260, 0], [4310, 1]]) { shape(box(px, 4090, 150, 1510), OX, 'j3p' + s, 2.4); tube([[px + 75, 5560], [px + 75, 4130]], s ? RED : GILT, tl, 14, 40); }
  // the base
  shape(box(-1300, 5600, 5800, 300), OX, 'j3base', 3); shape(box(-1300, 5600, 5800, 14), GILT, 'j3bt', 1.4);
  for (const [gx0, gx1] of [[-1240, 1040], [2380, 4440]]) {
    if (!vis(gx0, 5620, gx1, 5890, 40)) continue;
    X.save(); X.fillStyle = GREY; X.fillRect(gx0, 5630, gx1 - gx0, 250); X.restore();
    for (let x = gx0 + 20; x < gx1; x += 44) if (vis(x - 5, 5630, x + 5, 5880, 20)) ink([[x, 5636], [x, 5874]], 'j3g' + x, { w: 2.6 });
    ink(box(gx0, 5630, gx1 - gx0, 250), 'j3gb' + gx0, { w: 2.2, poly: true });
  }
  // SELECT YOUR HIT: lamps round the card come on with the last chord
  const on = seg(t, CHORD, CHORD + 0.12);
  if (on > 0) { X.save(); X.globalAlpha = 0.3 * on; X.fillStyle = LAMP; X.fillRect(CARD[0] - 26, CARD[1] - 22, CARD[2] + 52, CARD[3] + 44); X.restore(); }
  shape(box(...CARD), PAPER, 'j3card', 2.2); boxLabel('SELECT YOUR HIT', CARD, 56, on > 0.5 ? RED : OX);
  for (let i = 0; i < 6; i++) { lamp(CARD[0] + 20 + i * 74, CARD[1] - 11, 7, on); lamp(CARD[0] + 20 + i * 74, CARD[1] + CARD[3] + 11, 7, on); }
  // the slot plate (its lower half is drawn over the coin in words), the COIN RETURN's dark mouth and tray
  shape(box(1545, 5615, 110, 30), GREY, 'j3slt', 1.8); shape(box(1568, 5638, 64, 9), INK, 'j3slit', 1);
  shape(box(1565, 5742, 70, 58), INK, 'j3crm', 1.4);
  shape([[TRAY[0], TRAY[1]], [TRAY[0] + TRAY[2], TRAY[1]], [TRAY[0] + TRAY[2] - 8, TRAY[1] + TRAY[3]], [TRAY[0] + 8, TRAY[1] + TRAY[3]], [TRAY[0], TRAY[1]]], GREY, 'j3tray', 1.8);
  // three jewel lamps between the coin return and the window, lit with the card
  for (let i = 0; i < 3; i++) lamp(1745 + i * 62, 5700, 14, Math.max(on, lit(i * 9)));
  // the window: title cards until the coin goes in, then the whole machine again, small
  shape(box(W3.c[0] - W3.w / 2 - 14, W3.c[1] - W3.h / 2 - 14, W3.w + 28, W3.h + 28), GREY, 'j3wf', 2.2);
  const wx = W3.c[0] - W3.w / 2, wy = W3.c[1] - W3.h / 2;
  if (t >= T0 + 0.1 && vis(wx, wy, wx + W3.w, wy + W3.h)) nest(W3, S3, 0);
  strips(wx, wy, W3.w, W3.h, t < T0 + 0.1 ? 1 : Math.max(1 - seg(t, T0 + 0.1, T0 + 0.7), seg(t, CHORD, CHORD + 0.8)), 'j3s');
  ink(box(wx, wy, W3.w, W3.h), 'j3wg', { w: 1.8, poly: true });
  X.restore();
}
// drawn after the coin: the front of the slot plate and the COIN RETURN flap and tray lip, so the coin goes in and out
function j3Front(t) {
  if (!vis(1500, 5600, 1700, 5900, 40)) return;
  shape(box(1545, 5652, 110, 46), GREY, 'j3slf', 1.8); ink([[1560, 5664], [1640, 5664]], 'j3slh', { w: 1.4, col: PAPER });
  shape(box(1508, 5704, 184, 32), PAPER, 'j3crl', 1.4); boxLabel('COIN RETURN', [1508, 5704, 184, 32], 22, INK);
  const op = ease(seg(t, 263.5, 263.7)) * (1 - ease(seg(t, 264.5, 264.9))), fh = 58 * Math.cos(op * 1.35);
  shape(box(1565, 5742, 70, Math.max(4, fh)), GREY, 'j3flap', 1.6); dot(1600, 5742 + Math.max(4, fh) - 9, 4, INK);
  shape(box(TRAY[0] + 4, 5850, TRAY[2] - 8, 22), GREY, 'j3lip', 1.6);
}

// ---------- the machine eats the Rocker (drawn over test 01's parts, levels 2-4 only) ----------
const CELLX = 120, CELLY = -110;
function coverCellist() {
  if (!vis(-100, -590, 300, -84)) return;
  X.save(); X.beginPath(); X.rect(-100, -590, 400, 479); X.clip(); X.fillStyle = PAPER; X.fillRect(-100, -590, 400, 479);
  X.globalAlpha = 0.16; X.fillStyle = LAMP; X.beginPath(); X.moveTo(CELLX - 30, -900); X.lineTo(CELLX + 40, -900); X.lineTo(CELLX + 230, -110); X.lineTo(CELLX - 230, -110); X.fill(); X.restore();
  X.save(); X.fillStyle = PAPER; X.fillRect(105, -111, 30, 26); X.restore();
  shape(box(30, -110, 270, 18), TAN, 'stage', 1.8);
}
const beat = (t) => (t - CH[0]) / 0.54; // the chant's beat, from the vocal
// round 3: he stands where the cellist sat and bows the cello in the yo-yo motion, deadpan
function rockerCellist(tag) {
  if (!vis(-120, -700, 340, -100)) return;
  rocker(CELLX + 30, CELLY, 1.0, { pose: 'play', tag }); // 1.0: his quiff stays under verse 2's lettering above
  const cb = [[160, -128], [140, -190], [158, -232], [146, -280], [168, -320], [205, -326], [238, -306], [246, -270], [232, -232], [250, -190], [232, -128]];
  blob(cb, OX, tag + 'cello', 2.2); ink([[194, -322], [262, -520]], tag + 'cneck', { w: 9 }); blob(circ(266, -530, 11, 13), OX, tag + 'cscr', 1.6);
  ink([[194, -128], [194, -100]], tag + 'cpin', { w: 3 });
  for (const sx of [-6, 6]) ink([[194 + sx, -140], [194 + sx * 0.6 + 40, -480]], tag + 'cst' + sx, { w: 0.6, col: GREY });
  const ph = beat(NOW) * Math.PI, o = Math.sin(ph) * 60, d = [0.93, -0.36];
  const b0 = [118 + d[0] * (o - 120), -242 + d[1] * (o - 120)], b1 = [118 + d[0] * (o + 150), -242 + d[1] * (o + 150)];
  ink([b0, b1], tag + 'bow', { w: 4, col: OX }); ink([[b0[0], b0[1] + 6], [b1[0], b1[1] + 6]], tag + 'bowh', { w: 1, col: GREY });
  const drop = Math.abs(Math.sin(ph)) * 170, yy = [b0[0], b0[1] + 40 + drop];
  ink([b0, [yy[0], yy[1] - 22]], tag + 'ystr', { w: 1.2 }); blob(circ(yy[0], yy[1], 22), RED, tag + 'yoyo', 2); ink([[yy[0] - 20, yy[1]], [yy[0] + 20, yy[1]]], tag + 'yg', { w: 1.4 });
}
// round 4: bolted in front of the empty stage; his guitar neck is the lever the coin trips
const LEVER_P = [72, -19], LEVER_TIP = [-60, -283];
function rockerLever(tl) {
  if (!vis(-200, -500, 340, 40)) return;
  // the empty chair
  ink([[86, -280], [198, -280]], 'chs', { w: 5, col: TAN }); for (const x of [92, 192]) ink([[x, -278], [x, -112]], 'chl' + x, { w: 4, col: TAN }); ink([[196, -282], [206, -380]], 'chb', { w: 4, col: TAN });
  let trip = 0; for (let j = 0; j <= 16; j++) if (dist(ballAt(tl - j * 0.2), [LEVER_TIP[0], LEVER_TIP[1] - 21]) < 46) trip = Math.max(trip, 1 - j / 16);
  X.save(); X.translate(LEVER_P[0], LEVER_P[1]); X.rotate(-0.24 * ease(trip)); X.translate(-LEVER_P[0], -LEVER_P[1]);
  rocker(LEVER_P[0], LEVER_P[1], 0.8, { pose: 'play', flip: -1, tag: 'lv' });
  for (const [bx, by] of [[LEVER_P[0], LEVER_P[1] - 190], [LEVER_P[0] - 26, LEVER_P[1] - 120]]) { blob(circ(bx, by, 13, 13, 0, TAU, 6), GREY, 'bolt' + bx, 1.8); ink([[bx - 7, by], [bx + 7, by]], 'boltx' + bx, { w: 1.4 }); }
  X.restore();
  shape(box(LEVER_P[0] - 92, LEVER_P[1], 184, 14), GREY, 'lvplate', 1.8);
  for (const bx of [-70, 0, 70]) { blob(circ(LEVER_P[0] + bx, LEVER_P[1] + 7, 8, 8, 0, TAU, 6), PAPER, 'lvb' + bx, 1.4); }
  blob(circ(LEVER_P[0], LEVER_P[1] - 6, 16), GREY, 'lvpiv', 2);
}
// round 5: the cardboard orchestra is a row of Rocker copies, squinting, glasses gone
function rockerRow() {
  if (!vis(330, -560, 1000, -320)) return;
  X.save(); X.fillStyle = PAPER; X.fillRect(335, -560, 657, 229); X.restore();
  const b = Math.floor(beat(NOW));
  for (let i = 0; i < 5; i++) { const hop = ((b + i) % 5 === 0) ? pulse(NOW, CH[0] + Math.floor(beat(NOW)) * 0.54, 0.3) * 14 : 0; rocker(400 + i * 140, -331 - hop, 0.42, { pose: (b + i) % 2 ? 'thumbs' : 'play', tag: 'cp' + i }); }
}
// round 7: the first money bag, empty, swaying
function emptyBag() {
  if (!vis(-600, -1110, -440, -990)) return;
  X.save(); X.fillStyle = PAPER; X.fillRect(-596, -1104, 152, 112); X.restore();
  ink([[-520, -1110], [-520, -1094]], 'ebr', { w: 2.2 });
  X.save(); X.translate(-520, -1096); X.rotate(Math.sin(NOW * 2.6) * 0.16);
  blob([[-8, 0], [-30, 16], [-40, 64], [-26, 86], [-6, 78], [8, 90], [28, 84], [40, 62], [30, 14], [8, 0]], TAN, 'ebag', 2);
  ink([[-12, 6], [12, 6]], 'ebt', { w: 2.6, col: OX }); ink([[-14, 44], [6, 52]], 'ebc', { w: 1.1 }); label('$', 2, 66, 22, OX);
  X.restore();
}

// ---------- the chant, lettered in the margins (round 1 under the big jukebox, then red, a step higher each round) ----------
function chantWords(r, second) { const t0 = CH[r] + (second ? SECOND : 0); return C.outroText.split(' ').map((w, i) => ({ w, t: t0 + i * WSP })); }
function marginText(L, probe) {
  if (L < 1 || L > 5) return;
  const sy = [0, 510, 410, 310, 210, 110][L], wx = (s) => Q[0] + (s - 640) / ZJ, wy = (s) => Q[1] + (s - 360) / ZJ;
  const st = T, pw = PROBE_WORDS; T = NOW; PROBE_WORDS = probe;
  letterWords(chantWords(L, 0), wx(52), wy(sy), 46 / ZJ, RED, 250 / ZJ);
  letterWords(chantWords(L, 1), wx(1000), wy(sy), 46 / ZJ, RED, 230 / ZJ);
  T = st; PROBE_WORDS = pw;
}

// ---------- the outro's levels, drawn over the whole frame ----------
function renderLevel(v, t) {
  const sway = Math.sin(t * 0.6) * 4, sv = VIEW, st = T, tl = levelT(v.L, t);
  const xf = () => { X.translate(W / 2 + sway, H / 2); X.scale(v.z, v.z); X.translate(-v.x, -v.y); };
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0); paper(); xf();
  VIEW = [v.x - W / 2 / v.z, v.y - H / 2 / v.z, v.x + W / 2 / v.z, v.y + H / 2 / v.z];
  MAIN = v.L; T = tl;
  try { if (v.L >= SKEL) skeleton(v.L, tl, true); else drawWorld(tl, v.L); } finally { MAIN = -1; T = st; }
  X.restore();
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = 'multiply'; X.fillStyle = stepCol(v.L); X.fillRect(0, 0, W, H); X.restore();
  // the main level's chant and gold line sit on top of the darkening, so they stay bright
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0); xf();
  if (v.L >= SKEL) goldLine(tl);
  marginText(v.L, true);
  X.restore(); VIEW = sv;
}

// the case is drawn first, under every other part, so the machine sits in front of it
SECTIONS.unshift({
  id: 'frame-case', range: [51.7, T1],
  // pull-back 1: out from the HITS cabinet to the whole jukebox, then, still wide, across over its crown to floor 1's
  // first framing (b3's line 9), so b3's ease-in from 55.0 is a zoom, not a pan. Runs before every other section's
  // camera, so b3 starts from this framing; b3's first framing replaces it completely by 57.2.
  // The whole cabinet is framed 52.6-53.7 and held still; the travel then pans at that zoom and zooms in late.
  cam(hold, t, st) {
    if (t <= 51.7 || t >= 57.3) return;
    if (t < 52.75) { blendTo(st, pull1(t), ease(seg(t, 51.7, 51.85))); return; }
    const ep = ease(seg(t, 53.75, 55.0)), ez = ease(seg(t, 54.4, 55.0));
    st.x = lerp(VP.x, W1.x, ep); st.y = lerp(VP.y, W1.y, ep); st.z = Math.exp(lerp(Math.log(VP.z), Math.log(W1.z), ez));
  },
  parts(t, depth) {
    // pull-backs 2 and 3 (my camera) show every floor at a tenth of its size: lines there are under half a pixel, so the
    // whole page is drawn with the plain pens until the frame's last words (frame.words), the same as inside a window
    if (depth === 0 && !WIDE && X.getTransform().a < 0.21) { WIDE = true; cheapPens(true); }
    cached(() => {
      if (depth === 0) { if (t >= 166) j3(t); if (t >= 115.2) j2(t); if (t >= 51.7) j1(t, 0); }
      else if (depth < SKEL) j1(t, depth);
    });
  },
});

section({
  id: 'frame', range: [T0, T1],
  init() {
    if (SEC.list) SEC.list.pullback = false; // test 01's outline arch is gone (b2); J1 replaces it
  },
  legs(add, land) {
    const a = SEC.basement.exit.p, SL = [1600, 5702], CR = [1600, 5772], TR = [TRAY[0] + TRAY[2] / 2, 5846];
    add(T0, T0 + 0.3, (k) => [a[0], lerp(a[1], SL[1], k * k)]);              // into the slot
    add(T0 + 0.3, 225, () => SL);                                            // inside the machine, out of sight
    add(225, 245, (k) => [SL[0], lerp(SL[1], CR[1], k)]);
    add(245, 263.55, () => CR);                                              // behind the COIN RETURN flap
    add(263.55, 264.0, (k) => [lerp(CR[0], TR[0], k), lerp(CR[1], TR[1], k * k)]);
    add(264.0, 264.5, (k) => [TR[0] + Math.sin(k * Math.PI * 3) * 7 * (1 - k), TR[1] - Math.abs(Math.sin(k * Math.PI * 2)) * 9 * (1 - k)]);
    add(264.5, T1 + 1, () => TR);                                            // lies still
    land('coinreturn', 264.0);
  },
  cam(hold, t, st) {
    NOW = t;
    // pull-back 1 is framed by the case section (it runs first, so b3's camera eases on from it at 55.0)
    // pull-back 2: out from hook 4's "Again" to J2, then down into b5's first framing
    if (t > 115.2 && t < 118.8) { if (!SEC.frame.c2) SEC.frame.c2 = ballAt(115.2); blendTo(st, pull2(t), ease(seg(t, 115.2, 115.5)) * (1 - ease(seg(t, 117.25, 118.8)))); }
    // pull-back 3: out of the coin wash to the whole jukebox, up to its crown, then a slow pan down the page
    if (t > 166 && t < 182) {
      if (!SEC.frame.c3) SEC.frame.c3 = ballAt(166);
      const tg = t < 170.4 ? VJ3 : t < 172.6 ? mixV(VJ3, VTOP, ease(seg(t, 170.4, 172.6))) : { x: VTOP.x, y: lerp(PANY[0], PANY[1], ease(seg(t, 172.6, 180.4))), z: VTOP.z };
      blendTo(st, tg, ease(seg(t, 166, 169)) * (1 - ease(seg(t, 180.4, 182))));
    }
    // the outro: level 0 frames here; deeper levels are drawn by over(), so the page camera waits off the page
    if (t >= T0) {
      const v = outroView(t);
      if (v.L === 0) blendTo(st, v, ease(seg(t, T0 + 0.8, T0 + 2.0)));
      else { st.x = 1600; st.y = 60000; st.z = 1.1; }
    }
  },
  parts(t, depth) {
    if (depth === 0) return;
    if (depth === 2) { coverCellist(); rockerCellist('rc'); }
    if (depth === 3) { coverCellist(); rockerLever(t); }
    if (depth === 4) { coverCellist(); rockerCellist('rc4'); rockerRow(); }
    if (NOW >= 256.6) emptyBag();
  },
  words(t, depth) {
    if (depth === 0) wideOff();
    if (depth === 0) {
      if (t >= 166) j3Front(t);
      // round 1 is lettered once, on its second burst: during the first the camera is still on the hand-off framing
      if (t >= CH[0] + SECOND - 0.1 && vis(1000, 5900, 2700, 6200)) { const st = T; T = t; letterWords(chantWords(0, 1), 1215, 6060, 64, INK, 1200); T = st; } // under FE's bottom edge (5970)
    } else if (depth !== MAIN) marginText(depth, false);
  },
  over(t) {
    wideOff();
    if (t < T0) return;
    const v = outroView(t);
    if (v.L >= 1) cached(() => renderLevel(v, t));
  },
  coinFree(t) {
    if (t >= DV[0][0] && t < 263.55) return true; // the hero coin is inside the machine; the one we see is a level's
    // the pan passes the coin by: it may leave the frame
    if (t > 166 && t < 182) { const c = camAt(t), b = ballAt(t), hw = W / 2 / c.z, hh = H / 2 / c.z; return Math.abs(b[0] - c.x) > hw * 0.88 || Math.abs(b[1] - c.y) > hh * 0.88; }
    return false;
  },
});
})();

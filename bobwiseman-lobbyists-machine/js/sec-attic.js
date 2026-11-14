// Section 'attic': intro and verse 1. Song 0.0-19.92. Owner: b1. Block (world units): x -1100..1300, y -2800..-1500.
// Contract (BRIEF.md): the coin's last leg ends at t 19.92 at [-520, -1004] (the money bag's mouth; test 01 starts there).
// Camera holds only inside 0-19.92, released into the list section's opening hold (it rises 18.8-19.6).
// The story, right to left along the attic floor: a RECORD LABEL loft where a bored sleeve cranks a coin press that
// stamps the hero coin on the band's hit; a chute to the hired minder's cardboard wing; the wing's gust, the Rocker's
// cape and the FRIGHT-O-METER; the minder folds into a RETURNS box; the box rides a conveyor and the Publicist springs
// out of it; she fans out the microphones; the coin pinballs them and slides down the money bag's rope.
(() => {
'use strict';
const T0 = 0, T1 = 19.92;
SEC.attic = { exit: { t: T1, p: [-520, -1004] } };

// ---------- places ----------
const FL = -1520;                                   // attic floor top
const LOFT = -2150;                                 // the record label's loft floor
const ANV = [-100, -2207];                          // the coin on the press's anvil
const CW = [-300, -2250], CR = 40;                  // crank wheel
const HATCH = [-560, -2330, 100, 120];              // the hole in the wall the sleeve comes out of
const CH0 = [-30, -2192], CH1 = [540, -2110];       // the chute (coin centres); the coin drops off its end onto the wing
const MX = 500, MY = -1555, MS = 0.72;              // the minder, standing in the open box
const BELT = -1545, BW = 180, BH = 100, BX0 = 500, BX1 = -20;  // conveyor top, the box, its ride
const LAND = -1520, BELT_END = 100;                // the landing the box slides onto, level with the attic floor (nothing of the attic below y -1494)
const RX = 920, RS = 0.7;                           // the Rocker
const MET = [1180, -1850], MR = 86;                 // the FRIGHT-O-METER
const PX = BX1, PS = 0.68;                          // the Publicist on her spring
const HUB = [-300, LAND];                             // the mic fan's hub on the floor
// mic heads, masthead flag (two lines) and flag width: fanned like a hand of cards, the middle one highest
const MICS = [[-185, -1640, 'DAILY', 'GUSH', 124], [-305, -1750, 'THE NODDING', 'POST', 170], [-410, -1640, 'RADIO', 'YES', 120]];
const ROPE = -520, ROPE_TOP = LOFT + 22, RP = [-520, -1640]; // the bag's rope hangs from under the label's loft
const BAGM = [-520, -1004];

// ---------- times ----------
const TM = {};
function times() {
  Object.assign(TM, {
    stamp: 3.37,                                    // the band's hit before the first line (audio onset 3.375)
    scat: [0.33, 0.87, 1.415, 1.98, 2.805],         // the intro scat's five syllables (vocal stem onsets); the 4th is held
    right0: wt(0, 5), wing0: wt(0, 6), man0: wt(0, 7),
    but1: wt(1, 0), right1: wt(1, 2), wing1: wt(1, 3), man1: wt(1, 4), was1: wt(1, 5), just1: wt(1, 6), too1: wt(1, 7), fright: wt(1, 8),
    so2: wt(2, 0), pub: wt(2, 6),
    said3: wt(3, 0), hit3: wt(3, 1), me3: wt(3, 2), best: wt(3, 5), media: wt(3, 6), list: wt(3, 7),
  });
}

// ---------- moving parts as functions of time ----------
// the press: through the intro scat the crank is yanked a notch per syllable and the ram ratchets up a notch with it;
// it slams on the hit, then lifts. After the stamp the crank turns steadily.
const notches = (t, d) => TM.scat.reduce((s, p) => s + ease(seg(t, p, p + d)), 0);
function crankA(t) {
  if (t >= TM.stamp) return t * 1.9;
  return 0.4 * t + notches(t, 0.14) * (TM.stamp * 1.5) / 5;   // meets t * 1.9 at the stamp
}
function ramY(t) {
  const up = -2262 - 6 * notches(t, 0.07);
  if (t < TM.stamp - 0.07) return up;
  if (t < TM.stamp) return lerp(-2292, -2228, seg(t, TM.stamp - 0.07, TM.stamp) ** 2);
  if (t < TM.stamp + 0.1) return -2228;
  return lerp(-2228, -2282, ease(seg(t, TM.stamp + 0.1, TM.stamp + 0.5)));
}
const anvTilt = (t) => ease(seg(t, TM.stamp + 0.15, TM.stamp + 0.3)) * 0.22 * (1 - ease(seg(t, TM.stamp + 0.8, TM.stamp + 1.2)));
// the wing: one big flap on each "wing", and harder and harder through line 1
const FLAPS = () => [[TM.wing0 - 0.06, 1], [5.55, 0.45], [6.25, 0.35], [6.95, 0.25], [TM.right1, 0.5], [TM.wing1 - 0.06, 1], [8.45, 0.9], [TM.was1, 1], [TM.just1 - 0.05, 1]];
const flapAt = (t) => FLAPS().reduce((m, [p, a]) => Math.max(m, pulse(t, p, 0.42) * a), 0);
const gustAt = (t) => (t > TM.fright + 0.3 ? 0 : FLAPS().reduce((m, [p, a]) => Math.max(m, pulse(t, p + 0.08, 0.6) * a), 0));
const foldAt = (t) => ease(seg(t, TM.fright, TM.fright + 0.24));
// a point on the wing in world units (the same geometry as cast.js minder(), flipped: the wing is on our right)
function wingPt(u, v, t) {
  const wa = 0.35 + flapAt(t) * 0.7, lx = -56 - Math.cos(wa) * u + Math.sin(wa) * v, ly = -296 - Math.sin(wa) * u - Math.cos(wa) * v;
  return [MX - lx * MS, MY + ly * MS];
}
const wingCoin = (t) => wingPt(110, 57 + 21 / MS, t);
// the box: flaps open while he stands in it, shut on the fold, burst open on "publicist"
// the box rides the belt to its end, then slides down a short ramp onto the landing: [centre x, bottom y]
function boxAt(t) {
  const k2 = seg(t, 11.75, 12.4);
  if (k2 <= 0) return [lerp(BX0, BELT_END + 40, ease(seg(t, 9.9, 11.75))), BELT];
  const k = ease(k2); return [lerp(BELT_END + 40, BX1, k), lerp(BELT, LAND, k)];
}
const boxX = (t) => boxAt(t)[0];
const RIM = LAND - BH;
function flapOpen(t) { if (t < TM.fright + 0.25) return 1; if (t < TM.pub) return 1 - ease(seg(t, TM.fright + 0.25, TM.fright + 0.45)); return ease(seg(t, TM.pub - 0.02, TM.pub + 0.1)) * (1 - ease(seg(t, TM.media + 0.6, TM.media + 0.8))); }
// the Publicist's feet on the spring: shoots up on "publicist", bobs and settles just above the rim
function feetY(t) {
  const rest = RIM - 5, peak = RIM - 200, tp = TM.pub + 0.15;
  if (t < tp) return lerp(LAND - 10, peak, 1 - (1 - seg(t, TM.pub, tp)) ** 2);
  const d = t - tp; return rest + (peak - rest) * Math.exp(-3.2 * d) * Math.cos(9 * d) + 300 * sinkK(t);
}
// her job done, she goes back down into the box like a jack-in-the-box pushed shut (after "media", before "list")
const sinkK = (t) => (TM.media ? ease(seg(t, TM.media + 0.22, TM.media + 0.6)) : 0);
// her clipboard held out as a tray to our left: tips on "best" to send the coin to the first mic
const trayTilt = (t) => -0.05 * pulse(t, TM.pub + 0.15, 0.4) + 0.55 * ease(seg(t, TM.best - 0.3, TM.best - 0.16)) * (1 - ease(seg(t, TM.media, TM.media + 0.5)));
function trayCoin(t, u) {
  const tilt = trayTilt(t), b = pubBoard(0, 0, 1, tilt), p = b.top(u), q = [p[0] + b.n[0] * 21 / PS, p[1] + b.n[1] * 21 / PS];
  return [PX - q[0] * PS, feetY(t) + q[1] * PS];
}
// the mic fan opens on the first word of line 3, one stand at a time, like a hand of cards
const riseK = (t) => ease(seg(t, TM.said3, TM.said3 + 0.35));
const fanK = (t) => ease(seg(t, TM.said3 + 0.35, TM.said3 + 0.95));
function micHead(t, i) {
  const [hx, hy] = MICS[i], L = dist(HUB, [hx, hy]) * lerp(0.3, 1, riseK(t)), a1 = Math.atan2(hy - HUB[1], hx - HUB[0]), a0 = -Math.PI / 2, k = fanK(t);
  const hits = [TM.best, TM.media, TM.list], wob = Math.sin((t - hits[i]) * 22) * Math.exp(-(t - hits[i]) * 5) * (t > hits[i] ? 0.05 : 0);
  const a = lerp(a0, a1, k) + wob;
  return [HUB[0] + Math.cos(a) * L, HUB[1] + Math.sin(a) * L];
}
const micCoin = (t, i) => { const h = micHead(t, i); return [h[0], h[1] - 48]; };
const hop = (a, b, h, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - Math.sin(Math.PI * k) * h];

// ---------- the coin's path ----------
function legs(add, land) {
  const T = TM, offAnv = [-48, -2203];
  add(-1, T.stamp + 0.2, () => ANV);
  add(T.stamp + 0.2, T.stamp + 0.42, (k) => along([ANV, offAnv, CH0], k * k));
  add(T.stamp + 0.42, 4.55, (k) => along([CH0, CH1], k ** 1.3));
  add(4.55, T.right0, (k, t) => { const w = wingCoin(t); return [lerp(CH1[0], w[0], k), lerp(CH1[1], w[1], k * k)]; });
  add(T.right0, T.fright, (k, t) => wingCoin(t));
  add(T.fright, T.fright + 0.27, (k, t) => { const a = wingCoin(T.fright); return [lerp(a[0], BX0, k), lerp(a[1], BELT - 45, k * k) - Math.sin(k * Math.PI) * 30]; });
  add(T.fright + 0.27, T.pub, (k, t) => { const b = boxAt(t); return [b[0], b[1] - 45]; });
  add(T.pub, T.pub + 0.55, (k, t) => { const e = trayCoin(t, 66); return [lerp(BX1, e[0], k), lerp(LAND - 45, e[1], k) - Math.sin(k * Math.PI) * 260]; });
  add(T.pub + 0.55, T.best - 0.28, (k, t) => trayCoin(t, 66));
  add(T.best - 0.28, T.best - 0.14, (k, t) => trayCoin(t, lerp(66, 128, k * k)));
  add(T.best - 0.14, T.best, (k, t) => hop(trayCoin(T.best - 0.14, 128), micCoin(t, 0), 60, k));
  add(T.best, T.media, (k, t) => hop(micCoin(T.best, 0), micCoin(t, 1), 70, k));
  add(T.media, T.list - 0.3, (k, t) => { const c = micCoin(t, 1); return [c[0], c[1] - Math.abs(Math.sin(k * Math.PI * 3)) * 12 * (1 - k)]; }); // it rattles on the nodding post
  add(T.list - 0.3, T.list, (k, t) => hop(micCoin(T.list - 0.3, 1), micCoin(t, 2), 30, k));
  add(T.list, T.list + 0.14, (k) => hop(micCoin(T.list, 2), RP, 24, k));
  add(T.list + 0.14, T1, (k) => [ROPE, lerp(RP[1], BAGM[1], k ** 0.7)]); // it grabs the rope and slides, the camera close behind
  [['stamp', T.stamp], ['wing', T.right0], ['returns', T.fright + 0.27], ['tray', T.pub + 0.55], ['best', T.best], ['media', T.media], ['list', T.list], ['bag', T1]].forEach(([n, tt]) => land(n, tt));
}

// ---------- camera: keyed framings with eased moves (each move 0.9 s or more) ----------
// [t, x, y, z, how]: how 'dip' widens a little mid-move (lower screen speed on the long moves), 'slow' starts gently
const KEYS = [
  [0, -40, -2240, 0.94], [3.37, 20, -2225, 1.02],            // the loft, a slow push in on the press for the stamp
  [3.45, 20, -2225, 1.02], [5.0, 650, -1820, 0.97, 'dip'],    // down the chute with the coin to the minder
  [10.75, 650, -1820, 0.97], [12.6, 25, -1760, 1.0, 'dip'],   // with the RETURNS box along the belt to the landing
  [14.5, 25, -1760, 1.0], [16.0, -600, -1488, 0.907],          // over to the mic fan and line 3
  [18.33, -600, -1488, 0.907], [18.85, -560, -1380, 0.95],     // she has dropped into her box: start down while "list" lands;
  // from 18.85 the camera eases into the follow-cam down the rope (see cam below)
];
function camKey(t) {
  if (t <= KEYS[0][0]) return KEYS[0];
  for (let i = 1; i < KEYS.length; i++) if (t <= KEYS[i][0]) {
    const a = KEYS[i - 1], b = KEYS[i], u = ease(seg(t, a[0], b[0])), k = b[4] === 'slow' ? u ** 1.6 : u;
    const dip = b[4] === 'dip' ? 1 - 0.12 * Math.sin(Math.PI * u) : 1;
    return [t, lerp(a[1], b[1], k), lerp(a[2], b[2], k), Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), k)) * dip];
  }
  return KEYS[KEYS.length - 1];
}
function cam(hold, t, st) {
  if (t > T1) return;
  // over the rope slide the keyed framing hands over to the follow-cam, so at 19.92 the list section takes a plain follow
  const [, x, y, z] = camKey(t), r = ease(seg(t, 18.85, 19.85));
  st.x = lerp(x, st.x, r); st.y = lerp(y, st.y, r); st.z = Math.exp(lerp(Math.log(z), Math.log(st.z), r));
}

// ---------- parts ----------
// The loft. Joke: a record label is a mint; nobody even looks, it's one bored sleeve turning a crank. Payoff: the stamp.
function loftPart(t) {
  if (!near(-200, -2300, 700)) return;
  for (const rx of [-580, 120]) ink([[rx, LOFT], [rx, -2760]], 'lrod' + rx, { w: 1.6, col: PENCIL });
  shape(box(-620, LOFT, 780, 22), TAN, 'loft', 2);
  shape(box(-380, -2500, 300, 58), RED, 'rlsign', 2); boxLabel('RECORD LABEL', [-380, -2500, 300, 58], 34, PAPER);
  // marquee bulbs along the sign's top: one lights per scat syllable and stays lit, the held one shimmers;
  // all five flash on the stamp, then go dark for the rest of the song
  for (let i = 0; i < 5; i++) {
    const bx = -350 + i * 60, by = -2517, on = t >= TM.scat[i] && t < TM.stamp + 0.7;
    ink([[bx, -2500], [bx, by + 8]], 'bsock' + i, { w: 2.2 });
    const dk = (a, r) => (t >= a ? Math.exp(-(t - a) * r) : 0), pop = dk(TM.scat[i], 6), fl = dk(TM.stamp, 4), hold = i === 3 && t < TM.scat[4] ? 0.25 * (0.5 + 0.5 * Math.sin(t * 30)) : 0;
    const glow = on ? Math.min(1, 0.35 + 0.65 * Math.max(pop, fl) + hold) : 0;
    if (glow > 0) { X.save(); const g = X.createRadialGradient(bx, by, 3, bx, by, 34); g.addColorStop(0, `rgba(255,211,107,${0.6 * glow})`); g.addColorStop(1, 'rgba(255,211,107,0)'); X.fillStyle = g; X.fillRect(bx - 36, by - 36, 72, 72); X.restore(); }
    blob(circ(bx, by, 11), on ? LAMP : PAPER, 'bulb' + i, 1.4);
  }
  // the hatch in the wall
  shape(box(...HATCH), INK, 'hatch', 2); ink(box(HATCH[0] - 8, HATCH[1] - 8, HATCH[2] + 16, HATCH[3] + 16), 'hatchf', { w: 1.6, poly: true });
  // the crank: wheel on a post, a belt to the press's screw
  ink([[CW[0], LOFT], [CW[0], CW[1]]], 'cpost', { w: 4 });
  blob(circ(CW[0], CW[1], CR), GREY, 'cwheel', 2); for (let i = 0; i < 4; i++) { const a = crankA(t) + i * Math.PI / 2; ink([CW, [CW[0] + Math.cos(a) * CR, CW[1] + Math.sin(a) * CR]], 'csp' + i, { w: 1.4 }); }
  ink([[CW[0], CW[1] - CR], [-100, -2428]], 'belt1', { w: 1.8, col: OX }); ink([[CW[0] + 8, CW[1] + CR - 2], [-100, -2396]], 'belt2', { w: 1.8, col: OX });
  // the press: uprights, crossbar, screw, pulley, ram, anvil with its tipping plate
  shape(box(-176, -2380, 14, 202), OX, 'pupl', 1.8); shape(box(-38, -2380, 14, 202), OX, 'pupr', 1.8);
  shape(box(-190, -2400, 180, 22), OX, 'pbar', 2);
  blob(circ(-100, -2412, 16), GILT, 'ppul', 1.6);
  // the ratchet's pawl on the press's pulley: it flicks up and clacks back down on each scat notch
  if (t < TM.stamp + 0.3) {
    const flick = TM.scat.reduce((m, p) => Math.max(m, pulse(t, p, 0.14)), 0), pv = [-52, -2444], tip = [-86, lerp(-2422, -2438, flick)];
    ink([pv, tip], 'pawl', { w: 3.4 }); dot(pv[0], pv[1], 4.5);
    TM.scat.forEach((p, n) => { const k = seg(t, p + 0.1, p + 0.32); if (k > 0 && k < 1) for (let j = 0; j < 3; j++) { const a = -0.7 + j * 0.45, r0 = 24 + k * 10; ink([[-100 + Math.cos(a) * r0, -2412 + Math.sin(a) * r0], [-100 + Math.cos(a) * (r0 + 13), -2412 + Math.sin(a) * (r0 + 13)]], 'clk' + n + j, { w: 2, a: 1 - k }); } });
  }
  const ry = ramY(t);
  ink([[-100, -2400], [-100, ry - 46]], 'screw', { w: 5 }); for (let y = -2392; y < ry - 50; y += 12) ink([[-106, y], [-94, y + 6]], 'thr' + y, { w: 1, a: 0.7 });
  shape(box(-132, ry - 46, 64, 46), GREY, 'ram', 2); shape(box(-118, ry - 6, 36, 6), INK, 'die', 1);
  shape(box(-140, -2178, 80, 28), GREY, 'anvil', 2);
  const at = anvTilt(t), c = Math.cos(at), s = Math.sin(at), pl = [[-44, 0], [44, 0], [44, -8], [-44, -8]].map(([u, v]) => [-100 + u * c - v * s, -2178 + u * s + v * c]);
  shape(pl.concat([pl[0]]), OX, 'aplate', 1.4);
  // the lamp on the press lights up on the stamp (lamp glow is the one gradient allowed)
  const lit = pulse(t, TM.stamp, 0.7);
  ink([[-20, -2400], [-20, -2418]], 'lampw', { w: 1.6 });
  if (lit > 0) { X.save(); const g = X.createRadialGradient(-20, -2430, 4, -20, -2430, 90); g.addColorStop(0, `rgba(255,211,107,${0.55 * lit})`); g.addColorStop(1, 'rgba(255,211,107,0)'); X.fillStyle = g; X.fillRect(-110, -2520, 180, 180); X.restore(); }
  blob(circ(-20, -2430, 12), lit > 0.05 ? LAMP : PAPER, 'lamp', 1.4);
  // the stamp's thump: a puff and a ring of short strokes, quick and soft
  const sk = seg(t, TM.stamp, TM.stamp + 0.3);
  if (sk > 0 && sk < 1) {
    X.save(); X.globalAlpha = 0.35 * (1 - sk); dot(ANV[0], ANV[1], 30 + sk * 60, '#fffbe9'); X.restore();
    for (let i = 0; i < 8; i++) { const a = Math.PI + i * Math.PI / 7, r0 = 40 + sk * 30, r1 = r0 + 24; ink([[ANV[0] + Math.cos(a) * r0, ANV[1] + 10 + Math.sin(a) * r0 * 0.6], [ANV[0] + Math.cos(a) * r1, ANV[1] + 10 + Math.sin(a) * r1 * 0.6]], 'st' + i, { w: 2, col: INK, a: 1 - sk }); }
  }
  // the bored sleeve: out of the hatch to the crank handle; a wristwatch it keeps not looking at
  const a = crankA(t), hnd = [CW[0] + Math.cos(a) * (CR - 6), CW[1] + Math.sin(a) * (CR - 6)];
  const F = Fig('slv', 0, 0, 1, 1), sh = [HATCH[0] + HATCH[2] - 16, HATCH[1] + 58];
  ftube(F, bend(sh, [hnd[0] - 14, hnd[1] + 4], 18 + Math.sin(a) * 6), 30, NAVY);
  ftube(F, [[hnd[0] - 20, hnd[1] + 5], [hnd[0] - 10, hnd[1] + 3]], 26, SNOW);
  fcirc(F, hnd[0], hnd[1], 14, 13, SKIN);
  drawFig(F, () => { const w = bend(sh, [hnd[0] - 14, hnd[1] + 4], 18 + Math.sin(a) * 6)[7]; d(box(w[0] - 7, w[1] - 13, 14, 10), 'slvw', 1.4); dot(w[0], w[1] - 8, 2.2, GILT); for (const y of [-6, 4]) d([[sh[0] + 30, sh[1] + y], [w[0] - 20, w[1] + y]], 'slvp' + y, 0.7, PENCIL); });
  // the chute down to the wing, hung from the loft on two wires
  plank([CH0, CH1], 'chute');
  for (const k of [0.25, 0.75]) { const p = along([CH0, CH1], k); ink([[p[0], p[1] - 22], [p[0], -2640]], 'cw' + k, { w: 1.1, col: PENCIL }); }
}

// The minder. Joke: the wing man is literal, a hired man with one cardboard wing on his right. Payoff: the coin on the wing.
// Then "too frightening": the wing's gust blows the Rocker's cape over his head and pins the FRIGHT-O-METER at TOO,
// and the minder folds up like a deckchair into a box stamped RETURNS.
function minderPart(t) {
  if (!near(600, -1800, 700)) return;
  // the attic floor and the conveyor
  shape(box(BELT_END - 20, FL, 1190, 26), TAN, 'floor', 2);
  shape(box(-492, LAND, 612, 24), TAN, 'landing', 2); // the landing stops just short of the rope at x -520
  plank([[BELT_END + 30, BELT - 22], [BX1 + 60, LAND - 22]], 'ramp', 8);
  // no braces under the landing: they would hang into the jukebox's crown below
  shape(box(BELT_END, BELT, 560, 14), INK, 'belt', 1.6);
  const roll = (boxX(t) - BX0) / 14;
  for (const cx of [BELT_END + 10, BELT_END + 550]) { blob(circ(cx, BELT + 7, 13), GREY, 'roll' + cx, 1.4); ink([[cx, BELT + 7], [cx + Math.cos(roll) * 11, BELT + 7 + Math.sin(roll) * 11]], 'rs' + cx, { w: 1.2 }); }
  for (const lx of [BELT_END + 40, BELT_END + 300, BELT_END + 530]) ink([[lx, BELT + 14], [lx, FL]], 'bl' + lx, { w: 2.4 });
  // the box's dark inside, behind whoever stands in it
  const [bx, bb] = boxAt(t);
  shape(box(bx - BW / 2 + 6, bb - BH - 6, BW - 12, 16), INK, 'boxin', 1);
  // the minder, folding away into the box; his wing slides in after him
  if (t < TM.fright + 0.45) {
    const fd = foldAt(t), cx = lerp(2000, BX0 + BW / 2, ease(seg(fd, 0.2, 0.9)));
    X.save(); X.beginPath(); X.rect(-3000, -4000, cx + 3000, 6000); X.clip();
    minder(MX, MY, MS, { flap: fd > 0 ? 0.6 * (1 - fd) : flapAt(t), fold: fd, flip: -1 });
    X.restore();
  }
  // gusts off the wing toward the Rocker and the meter
  const g = gustAt(t);
  if (g > 0.08) for (let i = 0; i < 4; i++) {
    const y0 = -1900 + i * 46, ph = t * 9 + i, x0 = 660 + i * 12;
    const pts = []; for (let j = 0; j <= 12; j++) { const k = j / 12, x = lerp(x0, 1100, k); pts.push([x, y0 + 40 * k + Math.sin(ph + k * 7) * 10]); }
    ink(pts.slice(0, 2 + Math.round(10 * Math.min(1, g * 1.4))), 'gust' + i, { w: 1.4, col: PENCIL, a: Math.min(1, g * 1.5) });
  }
  // the Rocker: deadpan, then eyes wide, then his cape blows up over his head
  const blow = ease(seg(t, TM.wing1 + 0.05, TM.wing1 + 0.3)), ro = { flip: -1, face: t > TM.right1 ? 'open' : 'lid', wave: t * 2 + g * 3 };
  if (blow > 0) rockerBlown(t, blow, g, ro); else rocker(RX, FL, RS, ro);
  // the FRIGHT-O-METER on its post
  ink([[MET[0], FL], [MET[0], MET[1] + 8]], 'mpost', { w: 4 });
  const half = circ(MET[0], MET[1], MR, MR, Math.PI, TAU, 18).concat([[MET[0] + MR, MET[1] + 8], [MET[0] - MR, MET[1] + 8]]);
  blob(half, PAPER, 'mdial', 2);
  [[GREEN, Math.PI, Math.PI * 1.4], [GILT, Math.PI * 1.4, Math.PI * 1.72], [RED, Math.PI * 1.72, TAU]].forEach(([col, a0, a1], i) => ink(circ(MET[0], MET[1], MR - 12, MR - 12, a0, a1, 8), 'mz' + i, { w: 8, col }));
  label('OK', MET[0] - 50, MET[1] - 18, 21); label('EEK', MET[0] - 4, MET[1] - 48, 21); label('TOO', MET[0] + 48, MET[1] - 20, 23, RED);
  const pin = ease(seg(t, TM.too1 - 0.04, TM.too1 + 0.1)), m = lerp(0.12 + g * 0.45, 1 + Math.sin(t * 40) * 0.025, pin);
  const na = lerp(-Math.PI * 0.94, -Math.PI * 0.08, m);
  ink([[MET[0], MET[1]], [MET[0] + Math.cos(na) * (MR - 8), MET[1] + Math.sin(na) * (MR - 8)]], 'mneedle', { w: 3.4, col: INK }); dot(MET[0], MET[1], 6);
  shape(box(MET[0] - 104, MET[1] + 14, 208, 40), GILT, 'mplate', 1.6); boxLabel('FRIGHT-O-METER', [MET[0] - 104, MET[1] + 14, 208, 40], 24, INK);
}
// the gust takes the Rocker's cape: it streams out flat behind him (to our right) like a flag, he stays deadpan.
// His own hanging cape is clipped away on that side and this one is drawn behind him, grown out of the same shape.
const CAPE_HANG = [[-50, -296], [50, -296], [70, -170], [96, -40], [20, -28], [-60, -36], [-150, -50], [-92, -190]];
function rockerBlown(t, k, g, ro) {
  const f = Math.sin(t * 13) * 12 * (0.4 + g), f2 = Math.sin(t * 13 + 1.3) * 8 * (0.4 + g), wx = (x, y) => [RX - x * RS, FL + y * RS];
  const hang = CAPE_HANG.map(([x, y]) => wx(x, y));
  const fly = [[RX + 35, FL - 210], [RX - 30, FL - 207], [RX - 30, FL - 119], [RX - 20, FL - 40], [RX + 10, FL - 28], [RX + 62, FL - 58 + f2], [RX + 205 + f, FL - 196 + f], [RX + 150, FL - 236 + f2 * 0.5]];
  const pts = hang.map((p, i) => [lerp(p[0], fly[i][0], k), lerp(p[1], fly[i][1], k)]);
  blob(pts.concat([pts[0]]), OX, 'capefly', 3.2);
  const lh = [wx(-92, -190), wx(-150, -50), wx(-100, -46), wx(-64, -170)], lf = [[RX + 150, FL - 236 + f2 * 0.5], [RX + 205 + f, FL - 196 + f], [RX + 168 + f * 0.7, FL - 168 + f * 0.6], [RX + 118, FL - 206]];
  const lin = lh.map((p, i) => [lerp(p[0], lf[i][0], k), lerp(p[1], lf[i][1], k)]);
  blob(lin.concat([lin[0]]), RED, 'capefl', 1.6);
  X.save(); X.beginPath();
  [[-1e4, -1e4], [1e4, -1e4], [1e4, FL - 212], [RX + 36, FL - 212], [RX + 36, FL - 110], [RX + 50, FL - 22], [1e4, FL - 22], [1e4, 1e4], [-1e4, 1e4]].forEach((q, i) => (i ? X.lineTo(q[0], q[1]) : X.moveTo(q[0], q[1])));
  X.closePath(); X.clip();
  rocker(RX, FL, RS, ro);
  X.restore();
}

// The box and the jack-in-the-box. Joke: the same box, new contents: he goes back as RETURNS, she springs out of it.
function boxBack(t) {
  if (!near(200, -1650, 700)) return;
  if (t < TM.pub - 0.02) return;
  if (sinkK(t) >= 1) return;
  const bx = boxX(t), fy = feetY(t);
  X.save(); X.beginPath(); X.rect(-1e4, -1e4, 2e4, 1e4 + LAND - 4); X.clip(); // nothing of her below the box floor
  ink(COIL([bx, LAND - 8], [bx, Math.min(fy, LAND - 14)], 6, 15), 'spring', { w: 3.2, col: GREY });
  const talk = Math.max(0.9 * pulse(t, TM.pub, 0.5), ...[TM.best, TM.media].map((s) => pulse(t, s - 0.03, 0.22)));
  publicist(PX, fy, PS, { flip: -1, tray: trayTilt(t), talk, look: t < TM.pub + 0.6 ? 'open' : 'lid' });
  X.restore();
}
function boxFront(t) { // drawn after the coin, so whatever is inside the box is inside it
  if (!near(200, -1650, 700)) return;
  const [bx, bb] = boxAt(t), x0 = bx - BW / 2, x1 = bx + BW / 2, RIM = bb - BH;
  shape(box(x0, RIM, BW, BH), TAN, 'boxf', 2.4);
  ink([[x0 + 10, RIM + 8], [x1 - 10, RIM + 8]], 'boxt', { w: 1, col: OX, a: 0.6 });
  const o = flapOpen(t), L = BW / 2 - 4, A = t > TM.pub - 0.05 ? 4.6 : 2.35; // after the pop they hang straight down the sides
  for (const sd of [-1, 1]) {
    const hx = sd < 0 ? x0 : x1, a = sd < 0 ? lerp(0, -A, o) : lerp(Math.PI, Math.PI + A, o);
    const e = [hx + Math.cos(a) * L, RIM + Math.sin(a) * L], n = [Math.cos(a + Math.PI / 2) * 6 * sd, Math.sin(a + Math.PI / 2) * 6 * sd];
    shape([[hx, RIM], e, [e[0] + n[0], e[1] + n[1]], [hx + n[0], RIM + n[1]], [hx, RIM]], TAN, 'flap' + sd, 1.6);
  }
  // the stamp lands as the flaps shut
  const st = seg(t, TM.fright + 0.45, TM.fright + 0.55);
  if (st > 0) {
    const sq = 1 + 0.25 * (1 - st), lb = [bx - 72 * sq, RIM + 26, 144 * sq, 50];
    X.save(); X.translate(bx, RIM + 51); X.rotate(-0.06); X.translate(-bx, -RIM - 51);
    ink(box(...lb), 'retb', { w: 2.4, col: RED, poly: true }); boxLabel('RETURNS', lb, 32, RED);
    X.restore();
  }
}

// The mic fan. Joke: her press list is a hand of cards: microphones fanned out, each flying a masthead.
// Payoff: the coin pinballs DAILY GUSH, THE NODDING POST, RADIO YES on the last three words of line 3.
function micsPart(t) {
  if (t < TM.said3 - 0.05 || !near(-380, -1650, 700)) return;
  const hits = [TM.best, TM.media, TM.list];
  // draw the outer two first so the middle card sits on top, like a hand
  [0, 2, 1].forEach((i) => {
    const m = MICS[i], h = micHead(t, i), a = Math.atan2(h[1] - HUB[1], h[0] - HUB[0]);
    ink([HUB, [h[0] - Math.cos(a) * 24, h[1] - Math.sin(a) * 24]], 'mstand' + i, { w: 3.6, col: INK });
    // the masthead flag on the shaft, a playing card with a red pip in its corner; it lights when the coin hits its mic
    if (fanK(t) > 0.5) {
      const lit = pulse(t, hits[i], 0.4), cw = m[4], cb = [h[0] - cw / 2, h[1] + 30, cw, 74];
      shape(box(...cb), lit > 0.1 ? LAMP : PAPER, 'mcard' + i, 1.8); dot(cb[0] + 9, cb[1] + 9, 3.4, RED);
      boxLabel(m[2], [cb[0] + 10, cb[1] + 3, cw - 20, 34], 29, INK); boxLabel(m[3], [cb[0] + 10, cb[1] + 36, cw - 20, 34], 29, RED);
    }
    blob(circ(h[0], h[1], 20, 26), GREY, 'mhead' + i, 2.2); for (let j = -1; j <= 1; j++) ink([[h[0] - 15, h[1] + j * 9], [h[0] + 15, h[1] + j * 9]], 'mg' + i + j, { w: 0.9 });
  });
  blob(circ(HUB[0], HUB[1] - 6, 28, 8), INK, 'mhub', 1.4);
}
// the bag's rope, hung from under the label's loft, down through the gap in the landing
function ropePart(t) {
  if (!near(-520, -1750, 600)) return;
  ink([[ROPE, ROPE_TOP], [ROPE, ROPE_TOP + 16]], 'hook', { w: 3 });
  ink(circ(ROPE, ROPE_TOP + 24, 9, 9, -Math.PI / 2, Math.PI, 10), 'hookc', { w: 2.4 });
  ink([[ROPE, ROPE_TOP + 32], [ROPE, -1400]], 'rope', { w: 2.2 });
}

// ---------- words: lines 0-3, black, beside their parts ----------
const SPOTS = [[90, -2030, 470], [680, -2115, 600], [120, -1760, 480], [-1000, -1224, 460]];
function words(t, depth) {
  // the blank on the anvil before the stamp (drawn over the coin), and the box front over whatever is inside
  if (t < TM.stamp && near(ANV[0], ANV[1], 200)) { dot(ANV[0], ANV[1], 21, GILT); blob(circ(ANV[0], ANV[1], 21), GILT, 'blank', 2); }
  boxFront(t);
  SPOTS.forEach(([x, y, mw], i) => letterWords(lineWords(i), x, y, 44, INK, mw));
}

section({
  id: 'attic', range: [T0, T1],
  init: times,
  legs, cam,
  parts(t) { loftPart(t); ropePart(t); minderPart(t); micsPart(t); boxBack(t); },
  words,
});
})();

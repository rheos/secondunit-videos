// Section 'floor2': verse 4, hook 4 (lobbying, the knocking door). Song 91.0-116.5. Owner: b4. Block (world units): x 1500..4300, y 1350..3900, read right to left.
// Contract (BRIEF.md): the coin's first leg starts at t 91.0 at SEC.floor1 exit point; its last leg ends at t 116.5 at SEC.floor2.exit.p.
// Draw nothing before t 91.0 - 0.5 (no pre-showing); keep drawing after 116.5 (the machine grows). Camera holds only inside 91.0-116.5.
// Four stations down a staircase of floors, right to left:
//   A (floor y 1900): a garage lift FIXED WHILE U WAIT holding a cracked record, fed by a FIX-O-METER parking meter.
//   B (floor y 2650): the hotel lobby: a bellhop runs a shell game on the front desk, a revolving door marked LOBBY.
//   C (lobby stairs down to y 3600): a balance scale, a pebble labelled REPUTATION against the coin.
//   D (floor y 3600): a big panelled door; the coin is its knocker. Hook 4 knocks it open.
// Things the coin goes behind (the meter, the desk front, the cups, the revolving door's front wings, the pans) are drawn
// in words(), which the engine draws after the coin, so the coin can vanish inside them.
(() => {
'use strict';
const T0 = 91.0, T1 = 116.5;
SEC['floor2'] = { exit: { t: T1, p: [1400, 3700] } };

// ---------- places ----------
const YA = 1900, YB = 2650, YD = 3600, CR = 21;           // floor tops; coin radius
const ENTRY = [4100, 1150];
// A: entry zigzag, the meter, the lift, the grate
const Z1 = [[4070, 1400], [4236, 1440]], UC = [4236, 1484], UR = 44, Z2 = [[4236, 1528], [4140, 1556]];
const MX = 4090, SLOT = [MX, 1600];                        // meter: head 4020..4160 x 1612..1750, post to the floor
const SPOUT = [4036, YA - CR], GRATE = 3570;
const LIFT = { l: 3600, r: 3960, rise: 150 }, REC = { x: 3780, r: 88 };
const ROCK_A = [3420, YA];
// B: the front desk, cups, bellhop, revolving door
const DESK = { l: 2870, r: 3300, top: 2520 }, CUPS = [3000, 3100, 3200], SEAT_B = YB - CR;
const BELL = [3100, YB - 22], RDOOR = { cx: 2760, hw: 110, top: 2330 };
// C: lobby stairs (4 steps) and the scale
const STEP = (i) => [2630 - 60 * i, YB - CR + 60 * i];      // coin seat on step i (0 = the end of floor B)
const PIV = [2210, 3160], ARM = 150, HANG = 100;
const LIP = [2364, YB - CR + 240];                          // the bottom step's lip, where the coin teeters
// D: the door
const DOOR = { l: 1572, r: 1828, top: 3190 }, KY = 3310, ROCK_D = [1950, YD];
const EXITP = SEC.floor2.exit.p;

// ---------- times ----------
const TM = {};
function times() {
  const h = C.hooks[3];
  Object.assign(TM, {
    cost: wt(14, 3), me: wt(14, 4), fixed: lineEnd(14),
    l15: wt(15, 0), see: wt(15, 2), all: wt(15, 3), of: wt(15, 4), lob: wt(15, 6), tricks: lineEnd(15),
    you: wt(16, 0), rep: lineEnd(16),
    i17: wt(17, 0), knock: wt(17, 4), in17: lineEnd(17),
    ticks: h.ticks, again: h.again,
  });
  TM.knocks = [TM.knock, TM.in17, ...TM.ticks];
}

// ---------- moving parts as functions of time ----------
// A: the lift rises once the meter is paid; the flag counts up to $$$ on "fixed"
const liftUp = (t) => ease(seg(t, TM.cost + 0.1, TM.cost + 0.85)) * LIFT.rise;
const flagText = (t) => (t < TM.cost + 0.2 ? 'EXPIRED' : t < TM.me ? '$' : t < TM.fixed ? '$$' : '$$$');
// B: the shell game. the middle cup hovers over the coin, the outer cups swap over it on the words, and it slams on "tricks"
function cupAt(i, t) {
  let x = CUPS[i], y = DESK.top, lift = 0;
  // all three cups are lifted to show them empty while the coin rolls in under them; the outer two go down, the middle
  // one hovers over the coin until it slams on the last word
  const up = 54 * ease(seg(t, TM.l15 - 1.2, TM.l15 - 0.85));
  lift = i === 1 ? up * (1 - ease(seg(t, TM.tricks - 0.12, TM.tricks))) : up * (1 - ease(seg(t, TM.l15 + 0.05, TM.l15 + 0.35)));
  // swaps: outer cups trade places in an arc on see / all / lobbying (an odd number, so they end swapped)
  const swaps = [TM.see, TM.all, TM.lob];
  if (i !== 1) {
    let side = i === 0 ? -1 : 1;
    for (const s of swaps) {
      const k = seg(t, s - 0.05, s + 0.3);
      if (k >= 1) side = -side;
      else if (k > 0) { const kk = ease(k); x = 3100 + side * 100 * Math.cos(kk * Math.PI); y = DESK.top - Math.sin(kk * Math.PI) * 30 * (side === (i === 0 ? -1 : 1) ? 1 : 0.6); break; }
      x = 3100 + side * 100;
    }
  }
  // the reveal: all three cups lift, all empty
  lift += 40 * ease(seg(t, TM.tricks + 0.35, TM.tricks + 0.6)) * (1 - ease(seg(t, TM.tricks + 1.9, TM.tricks + 2.2)));
  return [x, y - lift];
}
// B: revolving door angle (the coin goes round inside it 1.5 times)
const RD0 = () => TM.tricks + 0.6, RD1 = () => TM.tricks + 1.3;
const rdoorPhi = (t) => Math.PI * 3 * ease(seg(t, RD0(), RD1())) + Math.PI * 0.6 * ease(seg(t, RD1(), RD1() + 0.8)) + Math.PI / 4;
// C: the scale beam angle (right end's angle; + is down). empty: pebble side down; coin lands, it slams; line 17 swings it round
function beamAt(t) {
  if (t < TM.rep) return -0.1;
  if (t < TM.i17) { const u = t - TM.rep; return 0.42 - 0.52 * Math.exp(-5 * u) * Math.cos(13 * u); }
  const sw = ease(seg(t, TM.i17, TM.i17 + 0.34));
  if (t < TM.i17 + 0.34) return lerp(0.42, Math.PI + 0.62, sw);
  // coin gone: the pebble's side sinks back and the beam settles where it began (one turn round, same pose)
  const u = t - (TM.i17 + 0.34); return lerp(Math.PI + 0.62, 2 * Math.PI - 0.1, ease(seg(u, 0, 1.2))) + Math.sin(u * 9) * 0.08 * Math.exp(-2.5 * u) * (u > 1.2 ? 1 : 0);
}
const armEnd = (th) => [PIV[0] + Math.cos(th) * ARM, PIV[1] + Math.sin(th) * ARM];
const panSeat = (th) => { const e = armEnd(th); return [e[0], e[1] + HANG - 4]; };
// D: the door's gap (units of opening on the free, left edge), a crack wider per knock, wide on "Again"
const DW = DOOR.r - DOOR.l;
function gapAt(t) {
  const base = TM.ticks.reduce((m, tk) => m + 15 * ease(seg(t, tk, tk + 0.12)), 0);
  return base + (DW - 20 - base) * ease(seg(t, TM.again - 0.12, TM.again + 0.1));
}
const knockerX = (t) => DOOR.l + gapAt(t) + (DW - gapAt(t)) / 2;
// the knocker lifts away from the door before each knock and slams on it
const knockLift = (t) => TM.knocks.reduce((m, tk) => Math.max(m, t > tk - 0.2 && t < tk ? 24 * Math.sin(seg(t, tk - 0.2, tk) * Math.PI * 0.5) : 0), 0);
const knockHit = (t) => TM.knocks.reduce((m, tk) => Math.max(m, t >= tk && t < tk + 0.2 ? 1 - (t - tk) / 0.2 : 0), 0);
const DROP = () => TM.again + 0.3; // the coin lets go of the knocker ring
const ROCK_A_OUT = 96.0; // the Rocker leaves floor A (off screen) and is waiting at the door from then on

// ---------- the coin's path ----------
const hop = (a, b, h) => (k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - Math.sin(k * Math.PI) * h];
function uBend() { const o = []; for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + Math.PI * i / 12; o.push([UC[0] + Math.cos(a) * UR, UC[1] + Math.sin(a) * UR]); } return o; }
const PATH_A = () => [...Z1, ...uBend().slice(1), Z2[1]];
function legs(add, land) {
  const T = TM;
  // A: in from floor 1 above, already falling; down the zigzag; into the meter on "cost"
  add(T0, 91.3, (k) => [lerp(ENTRY[0], Z1[0][0], k), lerp(ENTRY[1], Z1[0][1] - CR, k * (0.45 + 0.55 * k))]);
  const pa = PATH_A().map(([x, y]) => [x, y - CR]);
  add(91.3, 92.85, (k) => along(pa, k));
  add(92.85, T.cost, hop(pa[pa.length - 1], [SLOT[0], SLOT[1] + 6], 34));
  add(T.cost, T.cost + 0.55, (k) => [MX, lerp(SLOT[1] + 6, YA - CR, k * k)]);            // down inside the meter
  add(T.cost + 0.55, T.cost + 0.7, (k) => [lerp(MX, SPOUT[0], k), YA - CR]);              // out of the spout
  add(T.cost + 0.7, T.cost + 1.7, (k) => [lerp(SPOUT[0], GRATE, k), YA - CR]);            // under the raised lift
  add(T.cost + 1.7, T.cost + 1.85, (k) => [GRATE, lerp(YA - CR, YA + 60, k * k)]);       // through the grate
  const chute = [[GRATE, YA + 60], [3352, 2440], [3318, DESK.top - CR]];
  add(T.cost + 1.85, T.l15 - 0.5, (k) => along(chute, k ** 1.35));
  add(T.l15 - 0.5, T.l15, (k) => { const a = chute[2]; return [lerp(a[0], CUPS[1], 1 - (1 - k) ** 2), DESK.top - CR]; });
  // B: sits under the hovering cup; hidden on "tricks"; down through the desk; round the revolving door
  add(T.l15, T.tricks, () => [CUPS[1], DESK.top - CR]);
  add(T.tricks, T.tricks + 0.3, (k) => [CUPS[1], lerp(DESK.top - CR, SEAT_B, k * k)]);
  add(T.tricks + 0.3, RD0(), (k) => [lerp(CUPS[1], RDOOR.cx + 92, k), SEAT_B]);
  add(RD0(), RD1(), (k) => [RDOOR.cx + 92 * Math.cos(Math.PI * 3 * ease(k)), SEAT_B]);
  add(RD1(), RD1() + 0.13, (k) => [lerp(RDOOR.cx - 92, STEP(0)[0], k), SEAT_B]);
  // C: down the lobby stairs one step at a time, teeters on the bottom step's lip for the first half of the line, drops into the pan on "reputation"
  const s0 = RD1() + 0.13, hs = 0.2, s1 = s0 + 4 * hs;
  for (let i = 0; i < 4; i++) add(s0 + i * hs, s0 + (i + 1) * hs, hop(STEP(i), STEP(i + 1), 26));
  add(s1, T.rep - 0.45, (k, t) => { const u = ease(seg(k, 0, 0.55)), w = k > 0.55 ? Math.sin((t - s1) * 26) * 3 * (1 - k) : 0; return [lerp(STEP(4)[0], LIP[0], u) + w, LIP[1]]; });
  add(T.rep - 0.45, T.rep, (k) => { const b = panSeat(-0.1); return [lerp(LIP[0], b[0], k), lerp(LIP[1], b[1], k * k)]; });
  add(T.rep, T.i17 + 0.34, (k, t) => panSeat(beamAt(t)));
  // D: flung over the Rocker's head into the knocker's ring on "knocking"; then it IS the knocker
  add(T.i17 + 0.34, T.knock, (k) => { const a = panSeat(Math.PI + 0.62), b = [knockerX(T.knock), KY]; return hop(a, b, 120)(k); });
  // it hangs on the wide-open door a beat after "Again" (the camera is still up on the lettering), then drops and rolls out
  add(T.knock, DROP(), (k, t) => [knockerX(t), KY - knockLift(t)]);
  const fx = () => knockerX(DROP());
  add(DROP(), DROP() + 0.22, (k) => [fx() - 6 * k, lerp(KY, YD - CR, k * k)]);
  add(DROP() + 0.22, T1 - 0.45, (k) => [lerp(fx() - 6, 1520, ease(k) * 0.3 + k * 0.7), YD - CR]);
  add(T1 - 0.45, T1, (k) => along([[1520, YD - CR], [1470, YD - CR + 22], EXITP], k ** 1.25));
  [['meter', T.cost], ['desk', T.l15], ['pan', T.rep], ['knocker', T.knock]].forEach(([n, tt]) => land(n, tt));
}
// the coin is out of sight inside the meter's post (it is drawn there, under the post, so the frame check stays on)
function coinFree() { return false; }

// ---------- camera ----------
function cam(hold, t, st) {
  // moves run 1.2 s or more (B to C is the long one, 1.9 s) so the camera stays under the blur speed.
  // each hold lets go only once the next one is fully in, so the follow-cam never leaks in between two holds
  const T = TM, a2b = [T.cost + 1.3, T.cost + 2.5], b = [T.l15 - 0.97, T.l15 + 0.08], c = [T.tricks + 0.83, T.tricks + 2.73];
  const d = [T.i17 - 1.2, T.i17 - 0.3], h = [T.ticks[0] - 0.95, T.ticks[0] - 0.1];
  const after = (w) => [w[1], w[1] + 0.05];
  hold(3830, 1755, 1.0, 92.0, 92.8, ...after(a2b));          // A: meter and lift
  hold(3560, 2240, 1.0, ...a2b, ...after(b));                // A to B: down the chute, line 14 stays up
  hold(3030, 2460, 1.0, ...b, ...after(c));                  // B: the desk and the revolving door
  hold(2100, 3215, 0.9, ...c, ...after(d));                  // C: bottom step, scale, the Rocker at the door
  hold(1960, 3420, 0.97, ...d, ...after(h));                 // D: line 17 at the door
  hold(1890, 3343, 0.93, ...h, 114.4, 115.2);                // hook 4; b7 owns 115.2-118.0
}

// ---------- parts ----------
// a part the coin hides behind: paper underneath first, so nothing shows through the crayon
function solid(pts, fill, tag, w = 2) { X.save(); X.fillStyle = PAPER; X.fill(pathOf(pts)); X.restore(); shape(pts, fill, tag, w); }
function floorPlank(x0, x1, y, tag) { shape(box(x0, y, x1 - x0, 22), TAN, tag, 1.8); }
function stationA(t) {
  if (!near(3800, 1700, 700)) return;
  // the entry zigzag: two planks and a curved rail
  plank(Z1.map(([x, y]) => [x, y - CR]), 'fz1'); plank(Z2.map(([x, y]) => [x, y - CR]), 'fz2');
  ink(circ(UC[0], UC[1] - CR, UR + CR + 6, UR + CR + 6, -Math.PI / 2, Math.PI / 2, 14), 'fzu', { w: 3, col: OX });
  floorPlank(3330, 4230, YA, 'fla');
  // the grate in the floor
  shape(box(GRATE - 30, YA - 2, 60, 10), INK, 'fgr', 1.2);
  // the hose from the meter to the lift: when the coin pays, a gold bulge runs along it and the lift goes up
  const hose = bend([MX - 26, 1832], [LIFT.r + 14, 1826], -26, 16); ink(hose, 'fhose', { w: 5, col: OX });
  const hb = seg(t, TM.cost + 0.02, TM.cost + 0.22); if (hb > 0 && hb < 1) { const q = along(hose, hb); dot(q[0], q[1], 7, GILT); }
  // the garage lift: two posts, the sign is the crossbar, a platform that rises, the cracked record standing on it
  const up = liftUp(t), py = YA - 24 - up;
  for (const x of [LIFT.l, LIFT.r]) { shape(box(x - 14, 1480, 28, YA - 1480), GREY, 'fpost' + x, 1.8); }
  shape(box(LIFT.l - 20, 1476, LIFT.r - LIFT.l + 40, 52), GILT, 'fsign', 2); boxLabel('FIXED WHILE U WAIT', [LIFT.l - 20, 1476, LIFT.r - LIFT.l + 40, 52], 34, OX);
  for (const x of [LIFT.l, LIFT.r]) ink([[x, py + 10], [x + (x < 3800 ? 40 : -40), py + 10]], 'farm' + x, { w: 4 });
  shape(box(LIFT.l + 10, py, LIFT.r - LIFT.l - 20, 18), RED, 'fplat', 1.8);
  // the record: black disc, red label, a crack; on "fixed" gold staples snap across the crack
  const rc = [REC.x, py - REC.r - 6];
  shape([[REC.x - 40, py], [REC.x + 40, py], [REC.x + 30, py - 18], [REC.x - 30, py - 18], [REC.x - 40, py]], TAN, 'fstand', 1.4);
  blob(circ(rc[0], rc[1], REC.r), INK, 'frec', 2);
  for (const r of [70, 54]) ink(circ(rc[0], rc[1], r), 'fgroove' + r, { w: 0.8, col: GREY });
  blob(circ(rc[0], rc[1], 26), RED, 'flab', 1.4); dot(rc[0], rc[1], 4, PAPER);
  const crack = [[rc[0] - 12, rc[1] - REC.r + 2], [rc[0] + 6, rc[1] - 50], [rc[0] - 8, rc[1] - 30], [rc[0] + 10, rc[1] - 8]];
  ink(crack, 'fcrk', { w: 3, col: PAPER });
  if (t > TM.fixed) for (let i = 0; i < 3; i++) { const p = crack[i], q = crack[i + 1], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], sk = seg(t, TM.fixed + i * 0.06, TM.fixed + i * 0.06 + 0.08); if (sk > 0) ink([[m[0] - 16 * sk, m[1] - 3], [m[0] + 16 * sk, m[1] + 3]], 'fstap' + i, { w: 4, col: GILT }); }
  // the Rocker waits, then thumbs up on "fixed" (he leaves before the camera comes back)
  if (t < ROCK_A_OUT) rocker(ROCK_A[0], ROCK_A[1], 0.85, { pose: t > TM.fixed - 0.04 ? 'thumbs' : 'play', glasses: 1, tag: 'fA' });
}
function meterOcc(t) { // drawn over the coin
  if (!near(MX, 1750, 600)) return;
  solid(box(MX - 26, 1750, 52, YA - 1750), GREY, 'fmpost', 1.8);
  solid([[MX - 70, 1750], [MX - 70, 1640], [MX - 50, 1612], [MX + 50, 1612], [MX + 70, 1640], [MX + 70, 1750], [MX - 70, 1750]], NAVY, 'fmhead', 2.2);
  shape(box(MX - 24, 1604, 48, 10), INK, 'fmslot', 1.2);
  shape(box(MX - 56, 1630, 112, 54), GLASS, 'fmwin', 1.6);
  // the flag: red EXPIRED, then a gold flag counting up
  const fl = flagText(t), flip = t > TM.fixed ? clamp(1 - seg(t, TM.fixed, TM.fixed + 0.14)) : 1;
  const fc = fl === 'EXPIRED' ? RED : GILT;
  shape(box(MX - 48, 1636 + (1 - flip) * 20, 96, 42 * Math.max(0.15, flip)), fc, 'fmflag' + fl.length, 1.2);
  if (flip > 0.5) boxLabel(fl, [MX - 48, 1636, 96, 42], fl === 'EXPIRED' ? 20 : 34, fl === 'EXPIRED' ? PAPER : OX);
  shape(box(MX - 92, 1772, 184, 40), PAPER, 'fmplate', 1.4); boxLabel('FIX-O-METER', [MX - 92, 1772, 184, 40], 26, OX);
  // the spout at the foot of the post
  shape(box(MX - 38, YA - 34, 14, 34), GREY, 'fmspout', 1.2);
}
function stationB(t) {
  if (!near(3000, 2450, 700)) return;
  floorPlank(2600, 3330, YB, 'flb');
  // the chute down from the grate
  plank([[GRATE, YA + 60 - CR], [3352, 2440 - CR], [3318, DESK.top - CR - 4]], 'fch');
  // the bellhop: his eyes follow the cups, then a sly look at us on the reveal
  const look = t < TM.l15 ? 0 : t < TM.tricks ? Math.sin((t - TM.l15) * 5) : t < TM.tricks + 0.35 ? -1 : 1;
  bellhop(BELL[0], BELL[1], 0.9, { look, tag: 'f' });
  // the desk top (the front panel is drawn over the coin)
  shape(box(DESK.l - 10, DESK.top - 2, DESK.r - DESK.l + 20, 16), GILT, 'fdtop', 1.8);
  // the desk bell, dinged by the bellhop's look on "tricks"
  const dg = pulse(t, TM.tricks, 0.3);
  blob(circ(2930, DESK.top - 4, 22, 18 + dg * 3, Math.PI, TAU, 12).concat([[2952, DESK.top - 2], [2908, DESK.top - 2]]), GILT, 'fbell', 1.6);
  if (dg > 0) for (let i = 0; i < 3; i++) ink([[2930 + (i - 1) * 24, DESK.top - 40], [2930 + (i - 1) * 36, DESK.top - 58]], 'fding' + i, { w: 1.6 });
  // the revolving door: housing back, back wings
  shape(box(RDOOR.cx - RDOOR.hw, RDOOR.top, RDOOR.hw * 2, YB - RDOOR.top), GLASS, 'frdb', 1.4);
  blob(circ(RDOOR.cx, YB - 6, RDOOR.hw - 4, 14), TAN, 'frdfl', 1.4);                    // the round floor it turns on
  rdoorWings(t, false);
  // the lobby stairs, red runner down the middle
  const st = [[2660, YB], [2600, YB]]; for (let i = 1; i <= 4; i++) { st.push([2660 - 60 * i, YB + 60 * (i - 1)]); st.push([2660 - 60 * i, YB + 60 * i]); }
  const stp = [[2660, YB], ...st.slice(1), [LIP[0] - 14, YB + 240], [LIP[0] - 14, YB + 256], [2660, YB + 30], [2660, YB]];
  shape(stp, TAN, 'fstairs', 1.8);
  for (let i = 1; i <= 4; i++) shape(box(2600 - 60 * (i - 1) - 60 + 6, YB + 60 * i - 2, 48, 8), RED, 'frun' + i, 1);
}
function rdoorWings(t, front) {
  const phi = rdoorPhi(t), { cx, hw, top } = RDOOR;
  for (let k = 0; k < 4; k++) {
    const a = phi + k * Math.PI / 2, x = cx + Math.sin(a) * (hw - 6), isFront = Math.cos(a) > 0;
    if (isFront !== front) continue;
    X.save(); X.globalAlpha = front ? 0.45 : 0.7; shape(box(Math.min(cx, x), top + 8, Math.abs(x - cx) + 1, YB - top - 10), GLASS, 'frw' + k, 1.2); X.restore();
    ink([[x, top + 8], [x, YB - 2]], 'frwe' + k, { w: 2.4, col: OX });
  }
}
function deskOcc(t) {
  if (!near(3000, 2450, 700)) return;
  // the desk's front panel, floor to top
  solid(box(DESK.l, DESK.top + 14, DESK.r - DESK.l, YB - DESK.top - 14), OX, 'fdfront', 2);
  shape(box(DESK.l + 70, DESK.top + 34, 290, 50), GILT, 'fdsign', 1.6); boxLabel('FRONT DESK', [DESK.l + 70, DESK.top + 34, 290, 50], 32, OX);
  // the three cups
  CUPS.forEach((_, i) => { const [x, y] = cupAt(i, t); solid([[x - 34, y], [x + 34, y], [x + 24, y - 64], [x - 24, y - 64], [x - 34, y]], RED, 'fcup' + i, 2); ink([[x - 30, y - 10], [x + 30, y - 10]], 'fcupb' + i, { w: 1.2, col: OX }); });
  // the revolving door: front wings, posts, canopy and its sign
  rdoorWings(t, true);
  ink([[RDOOR.cx, RDOOR.top + 4], [RDOOR.cx, YB - 4]], 'frdax', { w: 4, col: OX });   // the post it turns on
  ink(circ(RDOOR.cx, RDOOR.top + 10, RDOOR.hw - 4, 12, 0, Math.PI, 14), 'frdrim', { w: 2, col: OX });
  for (const x of [RDOOR.cx - RDOOR.hw, RDOOR.cx + RDOOR.hw - 14]) shape(box(x, RDOOR.top, 14, YB - RDOOR.top), OX, 'frdp' + x, 1.6);
  shape(box(RDOOR.cx - RDOOR.hw - 20, RDOOR.top - 52, RDOOR.hw * 2 + 40, 52), RED, 'frdc', 2); boxLabel('LOBBY', [RDOOR.cx - RDOOR.hw - 20, RDOOR.top - 52, RDOOR.hw * 2 + 40, 52], 38, PAPER);
}
function stationC(t) {
  if (!near(2230, 3200, 700)) return;
  floorPlank(1520, 2620, YD, 'fld');
  // the scale: post and base, beam, strings (the pans are drawn over the coin)
  shape(box(PIV[0] - 70, YD - 16, 140, 16), GREY, 'fsbase', 1.6);
  shape(box(PIV[0] - 10, PIV[1], 20, YD - 16 - PIV[1]), GREY, 'fspost', 1.6);
  const th = beamAt(t), a = armEnd(th), b = armEnd(th + Math.PI);
  ink([b, a], 'fbeam', { w: 7, col: OX }); blob(circ(PIV[0], PIV[1], 13), GILT, 'fpiv', 1.6);
  for (const e of [a, b]) for (const dx of [-38, 0, 38]) ink([e, [e[0] + dx, e[1] + HANG]], 'fstr' + dx + (e === a ? 'a' : 'b'), { w: 1, col: PENCIL });
  // the pebble in the left pan (tiny), with its big tag
  const pb = [b[0], b[1] + HANG - 9], ph = pulse(t, TM.rep + 0.05, 0.4) * 40;
  blob(circ(pb[0] + 6, pb[1] - ph, 9, 7), GREY, 'fpeb', 1.4);
  // the tag hangs off to the right of the pan, clear of the Rocker's head when this side flies up
  ink([[b[0] + 30, b[1] + HANG + 16], [b[0] + 70, b[1] + HANG + 40]], 'ftagstr', { w: 1, col: PENCIL });
  shape(box(b[0] + 60, b[1] + HANG + 40, 180, 40), PAPER, 'ftag', 1.4); boxLabel('REPUTATION', [b[0] + 60, b[1] + HANG + 40, 180, 40], 28, INK);
}
function panOcc(t) {
  if (!near(2230, 3200, 700)) return;
  const th = beamAt(t);
  [armEnd(th), armEnd(th + Math.PI)].forEach((e, j) => solid([[e[0] - 46, e[1] + HANG], [e[0] + 46, e[1] + HANG], [e[0] + 30, e[1] + HANG + 20], [e[0] - 30, e[1] + HANG + 20], [e[0] - 46, e[1] + HANG]], GILT, 'fpan' + j, 1.8));
}
function stationD(t) {
  if (!near(1800, 3400, 700)) return;
  const g = gapAt(t), { l, r, top } = DOOR;
  // the floor in front of the door, and the wedge of lamp light spilling out of the gap
  shape(box(1520, YD, 1100, 40), PAPER, 'ffront', 1.2);
  if (g > 1) {
    X.save();
    const gr = X.createLinearGradient(0, top, 0, YD); gr.addColorStop(0, '#fff1c4'); gr.addColorStop(1, LAMP);
    X.fillStyle = gr; X.fillRect(l, top, g, YD - top);
    X.globalAlpha = 0.55; X.fillStyle = LAMP;
    X.beginPath(); X.moveTo(l, YD); X.lineTo(l + g, YD); X.lineTo(l + g * 1.9 + 20, YD + 40); X.lineTo(l - 24, YD + 40); X.closePath(); X.fill();
    X.restore();
    // a lamp, lit, deep inside the room (seen through the gap)
    X.save(); X.beginPath(); X.rect(l, top, g, YD - top); X.clip(); ink([[l + 60, top], [l + 60, top + 60]], 'flampc', { w: 1.4 }); blob(circ(l + 60, top + 84, 34, 26, Math.PI, TAU, 10).concat([[l + 94, top + 84]]), RED, 'flamps', 1.4); X.restore();
  }
  // the frame
  shape(box(l - 24, top - 24, DW + 48, 24), OX, 'fdlin', 2); for (const x of [l - 24, r]) shape(box(x, top, 24, YD - top), OX, 'fdpost' + x, 2);
  // the door: hinged on the right, its free edge swings away from us as it opens
  const fx = l + g, sq = (g / DW), ft = top + 18 * sq, fb = YD - 9 * sq, jud = knockHit(t) * 2;
  const P = (u, v) => [lerp(fx, r, u) + jud * (1 - u), lerp(lerp(ft, top, u), lerp(fb, YD, u), v)];
  if (r - fx > 3) {
    shape([P(0, 0), P(1, 0), P(1, 1), P(0, 1), P(0, 0)], TAN, 'fdoor', 2.2);
    for (const [u0, u1, v0, v1] of [[0.14, 0.86, 0.07, 0.42], [0.14, 0.86, 0.52, 0.93]]) ink([P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1), P(u0, v0)], 'fdpan' + v0, { w: 1.6, col: OX, poly: true });
    // the knocker's plate and the ring the coin hangs from
    const kx = knockerX(t); blob([[kx - 18, KY - 52], [kx + 18, KY - 52], [kx + 14, KY - 30], [kx - 14, KY - 30]], GILT, 'fkplate', 1.6);
  } else ink([[r, top], [r, YD]], 'fdedge', { w: 3 });
  // knock marks on the door around the coin
  const kh = knockHit(t); if (kh > 0) { const kx = knockerX(t); for (let i = 0; i < 3; i++) { const a = Math.PI * (0.75 + i * 0.25); ink([[kx + Math.cos(a) * 34, KY + Math.sin(a) * 34], [kx + Math.cos(a) * (34 + 22 * kh), KY + Math.sin(a) * (34 + 22 * kh)]], 'fkm' + i, { w: 2.2 }); } }
  // the exit ramp to floor 3
  plank([[1520, YD - CR], [1470, YD - CR + 22], EXITP], 'fexr');
  // the Rocker waits at the door to be let in; he turns to the scale on "reputation", back to the door as the coin flies
  if (t >= ROCK_A_OUT) {
    const turned = t > TM.rep - 0.04 && t < TM.i17 + 0.3;
    rocker(ROCK_D[0], ROCK_D[1], 0.85, { pose: t > TM.again + 0.1 ? 'thumbs' : 'play', glasses: 1, flip: turned ? 1 : -1, tag: 'fD' });
  }
}
function knockerOcc(t) { // the ring over the coin
  if (!near(1800, 3400, 700) || t < TM.knock || t > DROP()) return;
  const kx = knockerX(t), y = KY - knockLift(t);
  ink(circ(kx, y - 14, 12, 18, Math.PI * 1.05, Math.PI * 1.95, 10).concat([[kx, KY - 34]]), 'fkring', { w: 3, col: OX });
}

// ---------- words ----------
// hook 4: three columns of red above the door and the Rocker, read right to left (3, 4, 4), all inside this block;
// "Again" is written into the lit doorway as the door swings wide. b7 frames the pull-back from 115.2.
const hookAt = (i) => { const c = i < 3 ? 0 : i < 7 ? 1 : 2, r = i < 3 ? i : (i - 3) % 4; return [2100 - 280 * c, 3038 + r * 40]; }; // 3 rows over the scale (clear of its beam), then 4 and 4
function words(t) {
  meterOcc(t); deskOcc(t); panOcc(t); knockerOcc(t);
  letterWords(lineWords(14), 3605, 2010, 44, INK, 580); // under floor A, so it stays up while the coin drops to the desk
  letterWords(lineWords(15), 2700, 2730, 44, INK, 640); // under the lobby floor, so it stays up as the camera starts down
  letterWords(lineWords(16), 1720, 2880, 44, INK, 430); // above the door, left of the bottom step
  letterWords(lineWords(17), 1530, 3690, 44, INK, 1040); // one line under the door's floor
  const hk = C.hookText;
  TM.ticks.forEach((tk, i) => { const [x, y] = hookAt(i); letterWords(phrase(hk, tk), x, y, 36, RED, 300); });
  letterWords([{ w: C.againText, t: TM.again }], DOOR.l + 40, 3460, 38, RED, 300);
}

section({
  id: 'floor2', range: [T0, T1],
  init: times, legs, cam, coinFree,
  parts(t) { if (t < T0 - 0.5) return; stationA(t); stationB(t); stationC(t); stationD(t); },
  words(t) { if (t < T0 - 0.5) return; words(t); },
});
})();

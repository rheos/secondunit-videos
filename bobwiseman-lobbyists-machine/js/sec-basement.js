// Section 'basement': instrumental coin wash, the long chute, verse 6, the APPROVED stamp. Song 157.5-207.8. Owner: b6. Block (world units): x -1100..4300, y 4100..5600.
// Contract (BRIEF.md): the coin's first leg starts at t 157.5 at SEC.floor3 exit point; its last leg ends at t 207.8 at SEC.basement.exit.p.
// Draw nothing before t 157.5 - 0.5 (no pre-showing); keep drawing after 207.8 (the machine grows). Camera holds only inside 157.5-207.8,
// and none in 166.0-182.0 (b7's pull-back 3). Verse 6 runs west along the basement floor, from the pump jack to the floor hole above the jukebox slot.
(() => {
'use strict';
const T0 = 157.5, T1 = 207.8;
SEC['basement'] = { exit: { t: T1, p: [1600, 5650] } };

// ---------- places ----------
const FL = 5450;                                   // the basement floor
const FUN = [-950, 3965];                          // the funnel under floor 3's cannon
const PIPE = [FUN, [-950, 4060], [-880, 4140], [-760, 4176], [-690, 4190], [-690, 4236]];
const WD = [-690, 4450], RD = 66, WR = 105;        // the hero washer's door centre, the coin's drum radius, the door radius
const C0 = [-430, 4600];                           // where the long chute starts
const OUT = [[WD[0], WD[1] + RD], [-560, 4545], C0];
const LOOP_R = 100;
const PV = [3880, 5130];                           // pump jack pivot
const BELT = [2960, 3480], BELT_Y = 5300;          // the report-card conveyor (west end, east end), its top
const STX = 3150, FLAP = 3238;                     // the stamp over the belt, the trip flap
const MON = [2380, 5000, 420, 240], MON_Y = 5170;  // heart monitor screen box, trace baseline
const TR0 = 2770, TR1 = 2410;                      // trace sweep (east to west)
const BUSTS = [1840, 1975, 2110, 2245], BS = 0.72;
const RAIL = 5370;                                 // the pie-dish rail top
const DISH = [[2260, RAIL - 29], [1700, RAIL - 29], [1380, FL - 29], [1250, FL - 29]];
const HOLE = 1600;

// ---------- times (verse 6 is lines 23-26) ----------
const TM = {};
function times() {
  Object.assign(TM, {
    an: wt(23, 0), poll: wt(23, 4),
    will: wt(24, 0), duped: wt(24, 6),
    pay: wt(25, 0), well: wt(25, 3),
    heads: wt(26, 0), smell: wt(26, 5),
  });
  TM.blips = [TM.pay, TM.pay + 0.5, wt(25, 1), wt(25, 1) + 0.5, wt(25, 1) + 1.0, wt(25, 2), TM.well, TM.well + 0.48];
}

// ---------- the chute: rail east with two upward loops, then a coil down the east wall ----------
function loopPts(l, R) { const o = []; for (let i = 0; i <= 48; i++) { const th = i / 48 * TAU; o.push([l[0] + Math.sin(th) * R + i / 48 * 40, l[1] - R + Math.cos(th) * R]); } return o; }
let CHUTE = null, RAILS = null, LOOPS = null, COILP = null;
function buildChute() {
  const y = (x) => lerp(4600, 4730, (x - C0[0]) / (4180 - C0[0]));
  const L1 = [900, y(900)], L2 = [2500, y(2500)];
  LOOPS = [[L1, loopPts(L1, LOOP_R)], [L2, loopPts(L2, LOOP_R)]];
  const l1e = LOOPS[0][1][48], l2e = LOOPS[1][1][48];
  RAILS = [[C0, L1], [l1e, L2], [l2e, [4180, 4730]]];
  COILP = COIL([4180, 4730], [4080, beamPt(TM.an, 200, 36)[1]], 2, 55);
  COILP[COILP.length - 1] = beamPt(TM.an, 200, 36);
  CHUTE = [C0, L1, ...LOOPS[0][1].slice(1), L2, ...LOOPS[1][1].slice(1), [4180, 4730], ...COILP.slice(1)];
}

// ---------- the pump jack: beam nods twice a bar, the coin rides its arm ----------
const nodPhase = (t) => TAU * (t - 182.2) / 1.08;
const phi = (t) => 0.18 * Math.sin(nodPhase(t));
function beamPt(t, u, v) { const f = phi(t), c = Math.cos(f), s = Math.sin(f); return [PV[0] + u * c - v * s, PV[1] - u * s - v * c]; }

// ---------- the washer drum: a slow wash rock, then a spin cycle of six whole turns ----------
const ROCK0 = 158.7, SPIN0 = 161.6, SPIN1 = 164.1, SPIN_R = 6 / 1.9;
function spinRev(t) { // turns done since SPIN0: ramp up 0.6 s, hold, ramp down 0.6 s, six turns exactly
  const u = t - SPIN0; if (u <= 0) return 0;
  if (u < 0.6) return SPIN_R * u * u / 1.2;
  if (u < 1.9) return SPIN_R * (0.3 + (u - 0.6));
  if (u < 2.5) { const v = u - 1.9; return SPIN_R * (1.6 + v - v * v / 1.2); }
  return 6;
}
function drumAngle(t) {
  const amp = 1.1 * ease(seg(t, ROCK0, ROCK0 + 0.5)) * (1 - ease(seg(t, 160.9, SPIN0)));
  return Math.PI / 2 + amp * Math.sin(TAU * 0.9 * (t - ROCK0)) + TAU * spinRev(t);
}

// ---------- the APPROVED stamp from above (band gap) ----------
const S_IN = 199.0, S_LAND = 200.2, S_LIFT = 201.0, S_UP = 202.2, S_GO = 204.8, S_JERK = 206.3, S_DROP = 206.6;
function stampX(t) { return lerp(1250, HOLE, ease(seg(t, S_UP, S_GO))); }
function stampB(t) { // the rubber face's bottom
  if (t < S_LAND) { const k = seg(t, S_IN, S_LAND); return lerp(4350, FL, k * k); }
  if (t < S_LIFT) return FL;
  return lerp(FL, 5150, ease(seg(t, S_LIFT, S_UP))) + pulse(t, S_JERK, 0.3) * 40;
}
// the pie dish's x on its rail and ramp (the coin sits in it)
// it reaches the ramp's foot exactly as the stamp leg takes over (S_IN), so the coin never jumps there
const dishK = (t) => t < TM.smell ? seg(t, TM.heads, TM.smell) * (560 / 1010) : lerp(560 / 1010, 1, ease(seg(t, TM.smell, S_IN)));
function dishPos(t) { return along(DISH, dishK(t)); }

// ---------- legs ----------
function legs(add, land) {
  const E = SEC['floor3'].exit.p;
  add(T0, 157.7, (k) => [lerp(E[0], FUN[0], k), lerp(E[1], FUN[1], k)]);             // out of the cannon, into the funnel
  add(157.7, 158.4, (k) => along(PIPE, k ** 1.2));                                   // down the pipe to the washer's coin slot
  add(158.4, ROCK0, (k) => [WD[0], lerp(4236, WD[1] + RD, k * k)]);                  // in through the slot
  add(ROCK0, 164.3, (k, t) => { const a = drumAngle(t); return [WD[0] + Math.cos(a) * RD, WD[1] + Math.sin(a) * RD]; }); // wash, spin
  add(164.3, 165.2, (k) => along(OUT, k));                                           // out of the door, gleaming
  add(165.2, TM.an, (k) => along(CHUTE, k));                                         // the long chute (b7's pull-back watches)
  add(TM.an, 184.4, (k, t) => beamPt(t, 200, 36));                                   // rides the nodding arm
  add(184.4, 185.3, (k, t) => beamPt(t, lerp(200, -290, k * k), 36));                // rolls down the arm to the donkey's head
  add(185.3, TM.will, (k) => { const a = beamPt(185.3, -290, 36), b = [3450, BELT_Y - 21]; return [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - Math.sin(k * Math.PI) * 70]; });
  add(TM.will, 188.5, (k) => [lerp(3450, FLAP + 24, ease(k)), BELT_Y - 21]);          // rides the belt behind the stack, onto the trip flap
  add(188.5, 190.3, () => [FLAP + 24, BELT_Y - 21]);
  add(190.3, TM.pay, (k) => { const a = [FLAP + 24, BELT_Y - 21], b = [TR0, MON_Y - 21]; return [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - Math.sin(k * Math.PI) * 360]; }); // flipped over the stamp
  add(TM.pay, 194.5, (k, t) => [lerp(TR0, TR1, k), MON_Y - 21 - spike(t) * 90]);     // rides the pulse
  add(194.5, TM.heads, (k) => { const a = [TR1, MON_Y - 21], b = DISH[0]; return [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - Math.sin(k * Math.PI) * 60]; });
  add(TM.heads, S_IN, (k, t) => dishPos(t));                                         // in the steaming pie dish, past the noses
  add(S_IN, S_DROP, (k, t) => { const b = stampB(t); return t < S_LAND ? [1250, Math.max(DISH[3][1], b - 14)] : [stampX(t), b - 14]; }); // pressed into the stamp's face
  add(S_DROP, T1, (k) => [HOLE, lerp(stampB(S_DROP) - 14, 5650, k * k)]);           // dropped through the floor hole into the slot
  [['washer', 158.4], ['jack', TM.an], ['belt', TM.will], ['monitor', TM.pay], ['dish', TM.heads], ['stamp', S_LAND]].forEach(([n, t]) => land(n, t));
}
const spike = (t) => TM.blips.reduce((m, b) => Math.max(m, pulse(t, b - 0.02, 0.24)), 0);

// ---------- camera: one held framing per part; nothing in 166-182 (b7). Each hold stays full until the next one is fully in, so a move
// never dips back toward the follow-cam halfway ----------
function cam(hold, t, st) {
  // inside this range the base is the plain follow-cam again (an earlier section's wide pull-back must not leak in here)
  if (t >= T0 && t <= T1) { let x = 0, y = 0, sum = 0; for (let j = -10; j <= 14; j++) { const w = 1 - Math.abs(j - 2) / 14, b = ballAt(t + j * 0.04); x += b[0] * w; y += b[1] * w; sum += w; } st.x = x / sum; st.y = y / sum - 30; st.z = 1.1; }
  // Lettering rule: while a line is being written or within 1.5 s of its last word the camera stays under the core's blur
  // threshold (34 px a frame). So the moves between lines fit the gaps (185.22-186.12, 190.18-191.04) over short distances,
  // and lines 25-26 (which overlap) get slow glides instead of cuts.
  hold(-660, 4400, 1.0, 158.3, 159.1, 165.1, 166.0);                 // the laundromat
  hold(3740, 5130, 1.0, 182.0, 182.8, 186.12, 186.2);                // line 23, the pump jack
  hold(3280, 5130, 1.0, 185.22, 186.12, 191.04, 191.1);              // line 24, the stamp (460 units in 0.9 s: 32 px a frame at peak)
  hold(2860, 5130, 1.0, 190.2, 191.04, 194.85, 194.9);               // line 25, the monitor (420 units in 0.84 s: 31 px a frame)
  hold(2340, 5130, 1.0, 193.0, 194.85, 197.0, 197.1);                // slow glide: line 25 still up while line 26 starts
  hold(1920, 5130, 1.0, 195.35, 197.0, 199.4, 199.45);               // line 26, the busts (slow glide in)
  // the band gap: the stamp from above. A slow 1.7 s glide that starts after the noses lift on the last word, so line 26 stays
  // still while it lands and the dish (with the coin) is never left at the frame edge on its way down the ramp
  hold(1490, 5060, 0.75, 197.7, 199.4, 206.0, 206.9);
}

// ---------- drawing helpers ----------
function scribble(cx, cy, r, tag, a) { // crayon-scribble smoke: a looping pen line
  const q = LLPen.makeRng([...tag].reduce((h, c) => h * 31 + c.charCodeAt(0), 7) >>> 0), o = [];
  for (let i = 0; i <= 26; i++) { const an = i * 1.05, rr = r * (0.55 + 0.45 * q()); o.push([cx + Math.cos(an) * rr, cy + Math.sin(an) * rr * 0.8]); }
  ink(o, tag, { w: 1.8, col: GREY, a });
}
function sparkle(x, y, r, tag, col = LAMP) { ink([[x - r, y], [x + r, y]], tag + 'h', { w: 2, col }); ink([[x, y - r], [x, y + r]], tag + 'v', { w: 2, col }); dot(x, y, r * 0.18, col); }

// ---------- parts ----------
// The joke: money laundering, literally. A coin-op washer that takes the coin as payment AND as the wash load; it comes out gleaming.
function laundromat(t) {
  if (!near(-680, 4300, 700)) return;
  // the funnel and pipe down from floor 3's cannon
  blob([[FUN[0] - 60, FUN[1] - 30], [FUN[0] + 60, FUN[1] - 30], [FUN[0] + 16, FUN[1] + 20], [FUN[0] - 16, FUN[1] + 20]], GILT, 'bfun', 1.8);
  ink(PIPE.slice(1).map(([a, b]) => [a + 2, b + 24]), 'bpipe', { w: 4, col: GREY, poly: true });
  shape(box(-1100, 4640, 820, 16), TAN, 'blfl', 1.6);
  shape(box(-1090, 4246, 230, 70), RED, 'bcw', 2); boxLabel('COIN WASH', [-1090, 4246, 230, 70], 40, PAPER);
  // the second washer, IN USE, tumbling banknotes
  shape(box(-1080, 4330, 210, 310), PAPER, 'bw2', 2); shape(box(-1080, 4330, 210, 50), GREY, 'bw2p', 1.4);
  boxLabel('IN USE', [-1066, 4336, 120, 38], 22, RED);
  blob(circ(-975, 4510, 72), GLASS, 'bw2d', 2.4);
  for (let i = 0; i < 3; i++) { const a = t * 2.4 + i * 2.1, x = -975 + Math.cos(a) * 34, y = 4510 + Math.sin(a) * 34; X.save(); X.translate(x, y); X.rotate(a * 1.3); shape(box(-20, -11, 40, 22), GREEN, 'bnote' + i, 1.1); label('$', 0, 0, 16, PAPER); X.restore(); }
  // the hero washer: panel, coin slot, SPIN lamp, the drum behind a round glass door
  shape(box(-840, 4200, 300, 440), PAPER, 'bw1', 2.2); shape(box(-840, 4200, 300, 72), GREY, 'bw1p', 1.6);
  shape(box(-720, 4214, 60, 10), INK, 'bslot', 1.2);
  const spinning = t > SPIN0 && t < SPIN1;
  if (spinning) { X.save(); X.globalAlpha = 0.3; dot(-600, 4236, 30, LAMP); X.restore(); }
  shape(box(-640, 4220, 80, 34), spinning ? LAMP : PAPER, 'bspin', 1.2); boxLabel('SPIN', [-640, 4220, 80, 34], 20, spinning ? RED : INK);
  blob(circ(WD[0], WD[1], WR + 14), GREY, 'bring', 2.2);
  blob(circ(WD[0], WD[1], WR - 4), t > SPIN1 ? '#8f8a80' : GLASS, 'bdrum', 1.6);
  // suds while it washes
  if (t > ROCK0 && t < SPIN0 + 0.4) {
    const fade = 1 - seg(t, SPIN0 - 0.3, SPIN0 + 0.4);
    for (let i = 0; i < 9; i++) { const a = i * 0.7 + t * 1.3, rr = 30 + (i * 13) % 50; X.save(); X.globalAlpha = 0.85 * fade; blob(circ(WD[0] + Math.cos(a) * rr, WD[1] + 30 + Math.sin(a) * rr * 0.5, 9 + (i % 3) * 4), SNOW, 'bsud' + i, 1); X.restore(); }
  }
  // the door: shut and glassy, then swung open on its left hinge
  const ok = ease(seg(t, SPIN1, SPIN1 + 0.2));
  if (ok < 1) { X.save(); X.globalAlpha = 0.35; dot(WD[0], WD[1], WR - 8, GLASS); X.restore(); ink(circ(WD[0], WD[1], WR - 8), 'bdoor', { w: 6, col: INK }); }
  if (ok > 0) { const rx = WR * lerp(1, 0.25, ok), cx = lerp(WD[0], WD[0] - WR - 40, ok); blob(circ(cx, WD[1], rx, WR), GLASS, 'bdooro', 3); }
  // the little ramp out of the door to the chute
  plank(OUT.slice(1), 'bout');
}
// the long chute: hung from the ceiling, rail east with two loops, a coil down the east wall
function chute(t) {
  if (!near(1900, 4700, 2700)) return;
  RAILS.forEach((r, i) => plank(r, 'brail' + i));
  RAILS.forEach((r, i) => { const n = Math.max(1, Math.round((r[1][0] - r[0][0]) / 520)); for (let j = i ? 0 : 1; j <= n; j++) { const x = lerp(r[0][0], r[1][0], j / n), y = lerp(r[0][1], r[1][1], j / n); ink([[x, 4100], [x, y + 18]], `bhang${i}_${j}`, { w: 1.4, col: PENCIL }); } });
  LOOPS.forEach(([l], i) => { const c = [l[0] + 20, l[1] - LOOP_R]; ink(circ(c[0], c[1], LOOP_R + 24, LOOP_R + 24, 0, TAU, 40), 'bloop' + i, { w: 9, col: TAN }); ink(circ(c[0], c[1], LOOP_R + 30, LOOP_R + 30, 0, TAU, 40), 'bloopo' + i, { w: 1.4 }); });
  ink(COILP.map(([a, b]) => [a, b + 24]), 'bcoil', { w: 4.5, col: GREY, poly: true });
}
// The glint: from far out (b7's pull-back) the coin is one gold spark travelling down the page.
function glint(t) {
  if (t < 164.3 || t > 182.6) return;
  const z = X.getTransform().a, [x, y] = ballAt(t);
  if (z < 0.55) { const r = 16 / z; X.save(); X.globalAlpha = 0.35; dot(x, y, r, LAMP); X.restore(); sparkle(x, y, 26 / z, 'bgl', GILT); }
  else if (t < 166.5) { for (let i = 0; i < 3; i++) { const a = i * 2.1 + t * 3, s = 8 + 5 * Math.sin(t * 9 + i); sparkle(x + Math.cos(a) * 38, y + Math.sin(a) * 38, s, 'bsp' + i); } }
}
// Line 23. The joke: the nodding donkey keeps nodding yes to oil, and scribbles smoke. Payoff: the smoke; the coin rides its arm.
function pumpJack(t) {
  if (!near(3880, 5200, 700)) return;
  ink([[3790, FL], PV, [3970, FL]], 'bsam', { w: 4, col: INK });
  // crank, counterweight, pitman arm
  const ps = nodPhase(t), cc = [4110, 5340], pin = [cc[0] + Math.cos(ps) * 50, cc[1] - Math.sin(ps) * 50];
  blob(circ(cc[0], cc[1], 26), GREY, 'bcrank', 1.6);
  const cw = [cc[0] - Math.cos(ps) * 46, cc[1] + Math.sin(ps) * 46]; blob(circ(cw[0], cw[1], 30), RED, 'bcw2', 1.8);
  ink([beamPt(t, 230, -15), pin], 'bpit', { w: 5, col: INK }); dot(pin[0], pin[1], 5);
  // motor and its smoke stack
  shape(box(4170, 5370, 110, 80), NAVY, 'bmot', 1.8); shape(box(4232, 5260, 26, 110), GREY, 'bstack', 1.6);
  for (let i = -3; i < 6; i++) {
    const b = 182.2 + i * 1.08 - (t < 182.2 ? Math.ceil((182.2 - t) / 1.08) * 1.08 : 0), age = t - b;
    if (age < 0 || age > 3.2) continue;
    scribble(4245 - age * 50, 5240 - age * 120, 20 + age * 22, 'bsm' + i, 1 - age / 3.2);
  }
  // the beam
  const bm = [beamPt(t, -300, -15), beamPt(t, 240, -15), beamPt(t, 240, 15), beamPt(t, -300, 15)];
  shape(bm.concat([bm[0]]), OX, 'bbeam', 2);
  // the horsehead, drawn as a deadpan donkey's head: one eye, one ear
  const hh = [[-300, 15], [-330, 12], [-352, -20], [-346, -60], [-326, -78], [-300, -64], [-296, -15]].map(([u, v]) => beamPt(t, u, v));
  shape(hh.concat([hh[0]]), RED, 'bhh', 2.2);
  const ey = beamPt(t, -318, -2); dot(ey[0], ey[1], 4); ink([beamPt(t, -300, 15), beamPt(t, -292, 46), beamPt(t, -282, 15)], 'bear', { w: 2 });
  // the bridle and the rod into the well
  const q = beamPt(t, -336, -74); ink([q, [q[0], 5392]], 'brod', { w: 2.4 });
  shape(box(q[0] - 30, 5392, 60, 58), GREY, 'bwell', 1.6); dot(PV[0], PV[1], 7, INK);
}
// Line 24 (the named children are never shown). The joke: a rubber-stamp machine stamps DUPED on a stack of blank report cards.
// Payoff: DUPED on the top card; the coin trips the stamp by landing on the flap.
const stackX = (t) => lerp(3380, STX, ease(seg(t, TM.will, 188.6)));
const stampDown = (t) => t < 188.5 ? 0 : t < TM.duped ? seg(t, 188.5, TM.duped) ** 2 : 1 - ease(seg(t, 189.7, 190.2));
function stampMachine(t) {
  if (!near(3200, 5200, 700)) return;
  // the belt and its legs
  for (const lx of [3000, 3440]) ink([[lx, BELT_Y + 26], [lx, FL]], 'bbl' + lx, { w: 2.4 });
  shape(box(BELT[0], BELT_Y, BELT[1] - BELT[0], 26), INK, 'bbelt', 1.4);
  for (const rx of BELT) blob(circ(rx, BELT_Y + 13, 15), GREY, 'brol' + rx, 1.4);
  // the stack of blank report cards (no names)
  const sx = stackX(t), top = BELT_Y - 100;
  for (let i = 3; i > 0; i--) shape(box(sx - 75 + i * 4, top - i * 4, 150, 100), PAPER, 'bcard' + i, 1.2);
  shape(box(sx - 75, top, 150, 100), PAPER, 'bcard0', 1.4);
  boxLabel('REPORT CARD', [sx - 68, top + 6, 136, 26], 18, INK);
  for (let i = 0; i < 3; i++) ink([[sx - 58, top + 50 + i * 16], [sx + 58, top + 50 + i * 16]], 'bcl' + i, { w: 0.9, col: PENCIL });
  if (t > TM.duped) { ink(box(sx - 64, top + 40, 128, 52), 'bdupb', { w: 2.4, col: RED, poly: true }); boxLabel('DUPED', [sx - 64, top + 40, 128, 52], 40, RED); }
  // the frame, the spring and the stamp head
  for (const px of [2990, 3310]) ink([[px, 4960], [px, BELT_Y]], 'bfp' + px, { w: 4, col: TAN });
  shape(box(2970, 4950, 360, 18), TAN, 'bftop', 1.6);
  const b = lerp(5110, top - 16, stampDown(t)), bt = b - 70;
  const sp = []; for (let i = 0; i <= 12; i++) sp.push([STX + (i % 2 ? 14 : -14), lerp(4968, bt, i / 12)]); ink(sp, 'bspr', { w: 2, col: GREY });
  shape(box(STX - 66, b - 70, 132, 56), OX, 'bshead', 2); shape(box(STX - 60, b - 14, 120, 14), RED, 'bsrub', 1.4);
  if (pulse(t, TM.duped, 0.25) > 0) for (const dx of [-90, 90]) ink([[STX + dx, top - 10], [STX + dx * 1.5, top - 30]], 'bthk' + dx, { w: 2.4 });
  // the trip flap on the belt and its string up to the latch
  const fl = pulse(t, 190.25, 0.4), fa = -fl * 1.2;
  ink([[FLAP, BELT_Y], [FLAP + Math.sin(fa) * 44, BELT_Y - Math.cos(fa) * 44]], 'bflap', { w: 5, col: GILT });
  ink([[FLAP, BELT_Y - 40], [3300, 5010], [STX + 66, Math.min(b - 50, 5060)]], 'bstr', { w: 1.2 });
}
// Line 25. The joke: payola's pulse is strong and cheerful. Payoff: the blips under the coin; a deadpan bellhop watches it.
function monitor(t) {
  if (!near(2600, 5150, 700)) return;
  const [mx, my, mw, mh] = MON;
  ink([[mx + mw / 2, my + mh], [mx + mw / 2, FL - 20]], 'bmpole', { w: 4 });
  ink([[mx + mw / 2 - 90, FL - 14], [mx + mw / 2 + 90, FL - 14]], 'bmbase', { w: 4 }); for (const dx of [-90, 90]) blob(circ(mx + mw / 2 + dx, FL - 8, 8), GREY, 'bmw' + dx, 1);
  shape(box(mx - 14, my - 66, mw + 28, mh + 80), GREY, 'bmcase', 2);
  shape(box(mx + 40, my - 58, mw - 80, 48), GILT, 'bmhead', 1.6); boxLabel('PAYOLA', [mx + 40, my - 58, mw - 80, 48], 38, OX);
  shape(box(mx, my, mw, mh), NAVY, 'bmscr', 1.6);
  // the trace: swept east to west behind the coin, with a blip wherever the pulse kicked it
  const live = t > TM.pay, cx = live ? clamp(lerp(TR0, TR1, seg(t, TM.pay, 194.5)), TR1, TR0) : TR0;
  const tAt = (x) => TM.pay + (TR0 - x) / (TR0 - TR1) * (194.5 - TM.pay), pts = [];
  pts.push([mx + mw - 6, MON_Y]); for (let x = TR0; x >= cx; x -= 5) pts.push([x, MON_Y - spike(tAt(x)) * 90]);
  if (!live) pts.push([mx + 8, MON_Y]);
  X.save(); X.globalAlpha = 0.25; ink(pts, 'btrg', { w: 8, col: LAMP }); X.restore(); ink(pts, 'btr', { w: 2.4, col: LAMP });
  // a heart that beats on every blip
  const hb = 1 + spike(t) * 0.4, hx = mx + 40, hy = my + 36, h = [];
  for (let i = 0; i <= 30; i++) { const a = i / 30 * TAU, x = 16 * Math.sin(a) ** 3, y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); h.push([hx + x * hb, hy + y * hb]); }
  shape(h, RED, 'bheart', 1.2);
  bellhop(2880, FL, 0.78, { look: -1, tag: 'b6' });
}
// Line 26. The joke: the leaders are blank stone busts that can only smell; the coin goes by in a steaming pie dish
// and every nose lifts together on the last word. Payoff: four noses up at once.
function bustRow(t) {
  if (!near(1800, 5250, 900)) return;
  const sn = ease(seg(t, TM.smell - 0.05, TM.smell + 0.25));
  BUSTS.forEach((x, i) => bust(x, FL, BS, { sniff: sn, tag: 'b6' + i }));
  // the dish rail in front of their shoulders, down to the floor
  ink([[2290, RAIL + 2], [1700, RAIL + 2], [1380, FL - 2]], 'bdr', { w: 6, col: GREY, poly: true });
  for (const lx of [2270, 1720]) ink([[lx, RAIL + 4], [lx, FL]], 'bdrl' + lx, { w: 2 });
  // the dish: flattened by the stamp, otherwise steaming
  const flat = t > S_LAND;
  const [dx, dy] = t < S_IN ? dishPos(t) : [1250, DISH[3][1]], db = dy + 29;
  if (flat) { shape([[dx - 70, FL - 3], [dx + 70, FL - 3], [dx + 64, FL], [dx - 64, FL], [dx - 70, FL - 3]], TAN, 'bdishf', 1.2); return; }
  if (t < TM.heads - 0.5) return;
  shape([[dx - 52, db - 22], [dx + 52, db - 22], [dx + 40, db], [dx - 40, db], [dx - 52, db - 22]], TAN, 'bdish', 1.6);
  ink([[dx - 54, db - 22], [dx + 54, db - 22]], 'bdishr', { w: 4, col: OX });
  if (t > TM.heads) for (let i = -1; i <= 1; i++) { const o = []; for (let k = 0; k <= 8; k++) o.push([dx + i * 22 + Math.sin(k * 0.9 + t * 4 + i) * 7, db - 50 - k * 12]); ink(o, 'bstm' + i, { w: 1.6, col: GREY }); }
}
// The band gap. The joke: the one stop from above, a giant APPROVED stamp; it prints APPROVED across the floor, picks the coin up
// in its rubber and posts it down the hole into the jukebox. No one hurt, no bust touched, the noses stay up.
function bigStamp(t) {
  if (t < S_IN - 0.2 || !near(1500, 5000, 1100)) return;
  const sx = stampX(t), b = stampB(t);
  ink([[sx, 3000], [sx, b - 300]], 'bscab', { w: 2.4 });
  blob(circ(sx, b - 250, 70, 45), RED, 'bsknob', 2.4);
  shape(box(sx - 30, b - 216, 60, 34), OX, 'bsneck', 2);
  shape(box(sx - 240, b - 186, 480, 150), TAN, 'bsbody', 2.6); boxLabel('APPROVED', [sx - 220, b - 176, 440, 130], 86, RED);
  shape(box(sx - 220, b - 36, 440, 36), RED, 'bsface', 2);
  if (pulse(t, S_LAND, 0.4) > 0) for (const s of [-1, 1]) for (let i = 0; i < 3; i++) ink([[sx + s * (250 + i * 16), FL - 4 - i * 14], [sx + s * (300 + i * 26), FL - 20 - i * 24]], `bdust${s}${i}`, { w: 2 });
}
function floorParts(t) {
  if (!near(2000, FL, 2600)) return;
  shape(box(900, FL, HOLE - 30 - 900, 110), TAN, 'bfl0', 1.6); shape(box(HOLE + 30, FL, 4300 - HOLE - 30, 110), TAN, 'bfl1', 1.6);
  ink([[HOLE - 46, FL - 16], [HOLE - 30, FL]], 'bholel', { w: 3 }); ink([[HOLE + 46, FL - 16], [HOLE + 30, FL]], 'bholer', { w: 3 });
  if (t > S_LIFT) { ink(box(1040, FL + 14, 420, 82), 'bapb', { w: 3, col: RED, poly: true }); boxLabel('APPROVED', [1040, FL + 14, 420, 82], 64, RED); }
}

// ---------- words ----------
function words(t) {
  // each line stays up while its part is framed (well past its 1.5 s), then leaves so it never slivers into the next framing;
  // from far out (a pull-back or an outro dive) every line is back on its part
  const far = X.getTransform().a < 0.5, on = (off) => far || t < off;
  if (on(185.6)) letterWords(lineWords(23), 3640, 4860, 48, INK, 470);
  if (on(190.5)) letterWords(lineWords(24), 2990, 4830, 46, INK, 560);
  if (on(195.5)) letterWords(lineWords(25), 2380, 4860, 48, INK, 560);
  if (on(202.0)) letterWords(lineWords(26), 1770, 4930, 46, INK, 380); // off before the big stamp glides through it
}

// ---------- register ----------
section({
  id: 'basement', range: [T0, T1],
  init() { times(); buildChute(); },
  legs, cam,
  parts(t) {
    if (t < T0 - 0.5) return;
    floorParts(t); laundromat(t); chute(t); pumpJack(t); stampMachine(t); monitor(t); bustRow(t); bigStamp(t); glint(t);
  },
  words,
});
})();

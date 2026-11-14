// Section 'floor3': verse 5, lines 18-22 (the second opinion bend, the pigs, the jester claw machine, the cracked ruler, the scat
// drums). Song 116.5-157.5.
// Owner: b5. Block (world units): x -1100..1300, y 1350..3900. The coin goes in at the bottom right, climbs the pig
// escalator, runs the claw machine across the top, rolls down the cracked ruler and bounces down the drum stack to the
// exit at the bottom left. Lines are lines 18-22 of C.lines; words come from window.CUES at run time.
// Contract (BRIEF.md): first leg starts at 116.5 at SEC.floor2's exit point, last leg ends at 157.5 at SEC.floor3.exit.p.
(() => {
'use strict';
const T0 = 116.5, T1 = 157.5, L0 = 18;
SEC['floor3'] = { exit: { t: T1, p: [-950, 3850] } };
const lw = (l, i) => wt(L0 + l, i);
const hop = (a, b, k, h) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - Math.sin(Math.PI * k) * h];
const bez = (a, c, b, k) => [(1 - k) * (1 - k) * a[0] + 2 * (1 - k) * k * c[0] + k * k * b[0], (1 - k) * (1 - k) * a[1] + 2 * (1 - k) * k * c[1] + k * k * b[1]];
// a part is drawn only when its bounding box (world units, with a little slack for wobble) meets the view
let CULL = true; // off inside the outro's nested windows (depth > 0), where VIEW is the outer camera's
const vis = (x0, y0, x1, y1) => !CULL || !VIEW || (x1 > VIEW[0] - 20 && x0 < VIEW[2] + 20 && y1 > VIEW[1] - 20 && y0 < VIEW[3] + 20);
const PINK = '#f2b7b0'; // the pink already used for the kid's ice cream in cast.js
const TM = {};
function times() {
  Object.assign(TM, {
    w0: lw(0, 0), w1: lw(0, 1), w2: lw(0, 2), saw: lw(0, 3), w4: lw(0, 4), opin: lw(0, 5), bend: lw(0, 6),
    and19: lw(1, 0), again: lw(1, 7), end19: lineEnd(L0 + 1),
    fool: C.lines[L0 + 2].words.map((w) => w.t), end20: lineEnd(L0 + 2),
    thats: lw(3, 0), rule: lw(3, 4), end21: lineEnd(L0 + 3),
    scat: C.lines[L0 + 4].words.map((w) => w.t), end22: lineEnd(L0 + 4),
  });
  // pigs: one new pig per beat from the line's first word (beat 0.54 s, the hooks' grid)
  TM.beats = []; for (let j = 1; j <= 13; j++) TM.beats.push(TM.and19 + (j - 1) * 0.54);
  // the scat line in bounce groups: words closer than 0.15 s share a bounce
  const g = []; TM.scat.forEach((s, i) => { if (g.length && s - g[g.length - 1].t1 < 0.15) { g[g.length - 1].w.push(i); g[g.length - 1].t1 = s; } else g.push({ t: s, t1: s, w: [i] }); });
  TM.groups = g; // six bounce groups on this line's word times
}

// ================= A: line 18, the public opinion ruler bends into a loop =================
// Joke: the same opinion as verse 3a, bigger, every head already turned to the Shoveller; this time it bends all the way round.
// Payoff object: the loop-the-loop. Cause: the coin knocks each head's stick and the head swings to face him; he lifts his shovels on "bend".
const RY = 3699, RH = 28, RS = [1340, RY], RB = [620, RY], RR = 181, LFLEX = TAU * RR, LTIP = 230, COFF = RH + 21;
const HEADS = [1180, 1080, 980, 880];
const SHOV = [1335, 3727];
const curlK = (t) => ease(seg(t, TM.saw + 0.8, TM.bend - 0.02));
const tipDip = (t) => 0.16 * ease(seg(t, TM.bend + 1.25, TM.bend + 1.55)) * (1 - seg(t, TM.bend + 1.55, TM.bend + 1.62)) - 0.05 * pulse(t, TM.bend + 1.62, 0.25);
// a point on the ruler's centerline at arc length s from the right end (s<0 is not used), with its heading angle
function rulerAt(s, t) {
  const ls = RS[0] - RB[0];
  if (s <= ls) return { p: [RS[0] - s, RY], a: 0 };
  const k = curlK(t), c = Math.max(1e-4, k / RR), u = Math.min(s - ls, LFLEX);
  let p = [RB[0] - Math.sin(c * u) / c, RY + (Math.cos(c * u) - 1) / c], a = c * u;
  if (s - ls > LFLEX) { // the tip: straight on from the loop's end, dipping about its root under the coin
    const v = s - ls - LFLEX, b = a + tipDip(t); p = [p[0] - Math.cos(b) * v, p[1] - Math.sin(b) * v]; a = b;
  }
  return { p, a };
}
const nrm = (a) => [Math.sin(a), -Math.cos(a)]; // the ruler's top side (the inside of the loop)
function onRuler(s, t) { const { p, a } = rulerAt(s, t), n = nrm(a); return [p[0] + n[0] * COFF, p[1] + n[1] * COFF]; }
const sOfX = (x) => RS[0] - x;
const headSwing = (i, t) => { const tk = [TM.w0, TM.w1, TM.w2, TM.w4][i]; const k = seg(t, tk - 0.05, tk + 0.25); return lerp(-0.22, 0.42, ease(k)) + Math.sin(seg(t, tk + 0.25, tk + 1.2) * Math.PI * 3) * 0.08 * (1 - seg(t, tk + 0.25, tk + 1.2)); };

function partA(t) {
  if (t < T0 - 0.5 || !vis(370, 3270, 1500, 3910)) return;
  // the bench the ruler lies on
  shape(box(390, RY + RH, 990, 16), TAN, 'a3bench', 1.6);
  for (const lx of [420, 1340]) ink([[lx, RY + RH + 16], [lx, 3890]], 'a3bl' + lx, { w: 2.4 });
  // the opinion heads on their sticks, planted behind the ruler, all turning to the Shoveller
  HEADS.forEach((hx, i) => opinionHead(hx, RY - 8, 0.95, { tilt: headSwing(i, t), tag: 'f3' + i }));
  // the Shoveller at the end of the ruler; shovels up on his name, all the way up on "bend"
  const arms = 0.3 + 0.25 * ease(seg(t, TM.w1, TM.w1 + 0.4)) + 0.45 * ease(seg(t, TM.bend - 0.1, TM.bend + 0.3)) - 0.15 * pulse(t, TM.bend + 0.3, 0.6);
  shoveller(SHOV[0], SHOV[1], 0.62, { arms, flip: -1, tag: 'f3' });
  // the ruler: straight part, the bending part, the springy tip
  const strip = (s0, s1, tag, fill) => {
    const n = Math.max(2, Math.ceil((s1 - s0) / 14)), top = [], bot = [];
    for (let i = 0; i <= n; i++) { const s = lerp(s0, s1, i / n), { p, a } = rulerAt(s, t), q = nrm(a); top.push([p[0] + q[0] * RH, p[1] + q[1] * RH]); bot.push([p[0] - q[0] * RH, p[1] - q[1] * RH]); }
    shape(top.concat(bot.reverse(), [top[0]]), fill, tag, 2);
    // inch ticks along the top edge
    for (let s = Math.ceil(s0 / 30) * 30; s < s1; s += 30) { const { p, a } = rulerAt(s, t), q = nrm(a), L = s % 120 === 0 ? 16 : 8; ink([[p[0] + q[0] * RH, p[1] + q[1] * RH], [p[0] + q[0] * (RH - L), p[1] + q[1] * (RH - L)]], tag + 'tk' + s, { w: 1, pen: 'ink.fine' }); }
  };
  const ls = sOfX(RB[0]);
  strip(ls + LFLEX, ls + LFLEX + LTIP, 'a3tip', GILT);
  strip(ls, ls + LFLEX, 'a3flex', GILT);
  strip(0, ls, 'a3str', GILT);
  shape(box(700, RY - 20, 440, 40), PAPER, 'a3sg', 1.2); boxLabel('PUBLIC OPINION', [700, RY - 20, 440, 40], 34, INK);
}

// ================= B: line 19, the pig escalator =================
// Joke: money that breeds. Every pig the coin drops into lays another pig, one per beat, all in his star sunglasses, up and up.
// Payoff object: the row of pigs. Cause: the coin lands in a pig's slot and the next pig pops out of it.
const F = [440, 3045], G = [1190, 2610], BL = dist(F, G), BU = [(G[0] - F[0]) / BL, (G[1] - F[1]) / BL];
const slotS = (j) => 40 + j * 61;
const beltPt = (s) => [F[0] + BU[0] * s, F[1] + BU[1] * s];
function pigState(j, t) { // position along the belt and size; pig 0 is the seed pig
  if (j === 0) return { s: slotS(0), z: 1 };
  const b = TM.beats[j - 1], k = seg(t, b - 0.15, b + 0.08);
  if (k <= 0) return null;
  return { s: lerp(slotS(j - 1), slotS(j), ease(k)), z: k >= 1 ? 1 + 0.08 * pulse(t, b + 0.08, 0.2) : lerp(0.35, 1.06, k) };
}
function pigBack(j, t) { const st = pigState(j, t) || { s: slotS(j), z: 1 }; const p = beltPt(st.s); return [p[0] + 4, p[1] - 70 * st.z + 4]; }
const star = (cx, cy, R) => { const p = []; for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? R * 0.45 : R; p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return p; };
function pig(x, y, z, tag) { // a piggy bank, feet at (x, y), facing up the belt (right), in his star sunglasses
  X.save(); X.translate(x, y); X.scale(z, z);
  for (const lx of [-22, -8, 10, 24]) shape(box(lx - 5, -14, 10, 14), PINK, tag + 'l' + lx, 1.2);
  blob(circ(0, -34, 36, 26), PINK, tag + 'b', 2);
  blob([[-14, -54], [-6, -72], [4, -56]], PINK, tag + 'e', 1.4);
  blob(circ(36, -32, 8, 10), PINK, tag + 'sn', 1.4); dot(35, -35, 1.8, OX); dot(37, -28, 1.8, OX);
  ink([[-36, -38], [-46, -46], [-42, -54], [-36, -48]], tag + 'tl', { w: 1.4 });
  ink([[-10, -59], [8, -59]], tag + 'slot', { w: 3.2, col: INK });
  for (const ex of [12, 24]) { const p = star(ex, -42, 7); X.save(); X.fillStyle = RED; X.fill(pathOf(p)); X.restore(); ink(p, tag + 'st' + ex, { w: 0.9 }); }
  X.restore();
}
function partB(t) {
  if (t < TM.bend + 0.6 || !vis(410, 2520, 1290, 3175)) return;
  // the floor under the escalator, the legs, the belt with its chevrons
  shape(box(420, 3150, 840, 14), TAN, 'b3fl', 1.6);
  for (const s of [10, BL - 10]) { const p = beltPt(s); ink([[p[0], p[1] + 30], [p[0], 3150]], 'b3lg' + s, { w: 2.4 }); }
  const n = [-BU[1], BU[0]];
  const belt = [beltPt(-10), beltPt(BL + 10)], th = 26;
  shape([belt[0], belt[1], [belt[1][0] + n[0] * th, belt[1][1] + n[1] * th], [belt[0][0] + n[0] * th, belt[0][1] + n[1] * th], belt[0]], GREY, 'b3belt', 1.8);
  for (const s of [-10, BL + 10]) { const p = beltPt(s); blob(circ(p[0] + n[0] * 13, p[1] + n[1] * 13, 15), TAN, 'b3rl' + s, 1.4); }
  const off = (t * 40) % 40;
  for (let s = off; s < BL; s += 40) { const p = beltPt(s); ink([[p[0] + n[0] * 6, p[1] + n[1] * 6], [p[0] + BU[0] * 10 + n[0] * 13, p[1] + BU[1] * 10 + n[1] * 13], [p[0] + n[0] * 20, p[1] + n[1] * 20]], 'b3ch' + Math.round(s - off), { w: 1, col: INK, pen: 'ink.fine' }); }
  shape(box(G[0] - 70, G[1] + 50, 150, 40), GILT, 'b3sg', 1.4); boxLabel('COMPOUNDING', [G[0] - 70, G[1] + 50, 150, 40], 22, OX);
  for (let j = 0; j <= 13; j++) { const st = pigState(j, t); if (!st) continue; const p = beltPt(st.s); pig(p[0], p[1], st.z * 0.95, 'pg' + j); }
}

// ================= C: line 20, the claw machine of jesters =================
// Joke: the fools are stock on a shelf; the coin buys the claw and it picks them off the shelf one per word, price tags flipping to SOLD.
// Payoff object: the jesters hung up SOLD. Cause: the coin rides the claw's carriage; the claw drops on each word.
const MX0 = 50, MX1 = 850, MTOP = 1640, GL0 = 1700, GL1 = 2050, MBOT = 2200, RAIL = 1760, SHELF = 2040, JS = 0.78;
const JX = [720, 610, 500, 390, 280], SLOT = [790, 2140], TUBEX = 815, CHUTE = [60, 180], DOOR = [70, 2085, 120, 95];
const CARRY = 1724; // the coin's height riding on the carriage
const HUNG = RAIL + 58 + 214 * JS; // a bought jester's feet, hung under the rail
const CLAW0 = HUNG - 214 * JS - 30, CLAW1 = SHELF - 214 * JS - 30; // claw hub height at rest and at the bottom of a grab
function carriageX(t) {
  const w = TM.fool, end = 150;
  if (t < w[0] - 0.12) return lerp(TUBEX, JX[0], ease(seg(t, TM.end19 + 3.6, w[0] - 0.12)));
  for (let i = 0; i < 4; i++) if (t < w[i + 1] - 0.12) return lerp(JX[i], JX[i + 1], ease(seg(t, w[i] + 0.05, w[i + 1] - 0.12)));
  return lerp(JX[4], end, ease(seg(t, w[4] + 0.25, w[4] + 0.55)));
}
function clawDrop(t) { return TM.fool.reduce((m, w) => Math.max(m, seg(t, w - 0.12, w) * (1 - ease(seg(t, w + 0.02, w + 0.3)))), 0); }
const grabbed = (i, t) => t >= TM.fool[i];
function partC(t) {
  if (t < TM.end19 || !vis(30, 1620, 870, 2215)) return;
  // cabinet: marquee, glass, base with the coin slot and the prize door
  shape(box(MX0, MTOP, MX1 - MX0, GL0 - MTOP), RED, 'c3mq', 2.2); boxLabel('WIN A JESTER', [MX0 + 150, MTOP + 6, 500, 48], 40, PAPER);
  shape(box(MX0, GL0, MX1 - MX0, GL1 - GL0), GLASS, 'c3gl', 2);
  ink([[CHUTE[1], RAIL + 20], [CHUTE[1], GL1]], 'c3cw', { w: 2 });
  shape(box(CHUTE[1] + 10, SHELF, MX1 - CHUTE[1] - 30, 10), TAN, 'c3sh', 1.4);
  ink([[TUBEX - 18, GL1], [TUBEX - 18, RAIL + 10]], 'c3tb1', { w: 1.2, col: PENCIL }); ink([[TUBEX + 18, GL1], [TUBEX + 18, RAIL + 10]], 'c3tb2', { w: 1.2, col: PENCIL });
  shape(box(MX0, GL1, MX1 - MX0, MBOT - GL1), OX, 'c3base', 2.2);
  shape(box(SLOT[0] - 34, SLOT[1] - 36, 68, 66), GILT, 'c3slp', 1.4); ink([[SLOT[0], SLOT[1] - 22], [SLOT[0], SLOT[1] + 4]], 'c3slot', { w: 4 }); label('25¢', SLOT[0], SLOT[1] + 17, 16, OX);
  // the prize door: its flap swings open when the coin comes down the chute
  const [dx, dy, dw, dh] = DOOR, flap = pulse(t, TM.fool[4] + 0.9, 0.6);
  shape(box(dx, dy, dw, dh), INK, 'c3door', 1.4);
  shape([[dx, dy], [dx + dw, dy], [dx + dw - flap * 10, dy + 30 - flap * 30], [dx + flap * 10, dy + 30 - flap * 30], [dx, dy]], GREY, 'c3flap', 1.2);
  shape(box(300, 2092, 300, 46), PAPER, 'c3pz', 1.2); boxLabel('PRIZE', [300, 2092, 300, 46], 30, RED);
  // the jesters: on the shelf until grabbed, then hung from the rail; the tag flips from $1 to SOLD on the grab
  JX.forEach((x, i) => {
    let y = SHELF; const g = grabbed(i, t);
    if (g) { y = lerp(SHELF, HUNG, ease(seg(t, TM.fool[i] + 0.02, TM.fool[i] + 0.3))); ink([[x, RAIL], [x, y - 214 * JS]], 'c3hk' + i, { w: 1.2 }); }
    jester(x, y, JS, { price: '', tag: 'f3' + i });
    const tb = [x + 2, y - 80, 70, 36]; shape(box(...tb), PAPER, 'c3tg' + i, 1.2); boxLabel(g ? 'SOLD' : '$1', tb, 26, RED);
  });
  // rail, carriage, claw
  ink([[CHUTE[0], RAIL], [MX1 - 10, RAIL]], 'c3rail', { w: 3.4 });
  const cx = carriageX(t), drop = clawDrop(t);
  const cy = lerp(CLAW0, CLAW1, drop), shut = TM.fool.some((w) => t > w - 0.02 && t < w + 0.32);
  shape(box(cx - 36, RAIL - 14, 72, 30), GILT, 'c3car', 1.8);
  ink([[cx, RAIL + 16], [cx, cy - 10]], 'c3cab', { w: 1.6 });
  shape(box(cx - 12, cy - 12, 24, 14), GREY, 'c3hub', 1.2);
  for (const sd of [-1, 1]) { const o = shut ? 8 : 24; ink([[cx + sd * 8, cy], [cx + sd * o, cy + 22], [cx + sd * (o - 8), cy + 40]], 'c3pr' + sd, { w: 3, col: INK }); }
}

// ================= D: line 21, the old cracked ruler =================
// Joke: the oldest business rule is a cracked old ruler, and its far end is held up by a fool. The coin rolls its inches; on "rule"
// it reaches the crack, the fool tips over (deadpan, cardboard) and the cracked end swings down onto the drums.
// Payoff object: the cracked end dropping. Cause: the coin's weight at the crack. Reaction: the jester holding it up topples.
const R0 = [110, 2590], RC = [-320, 2780], JF = [-612, 3060], JSD = 0.8, DH = 30, DOFF = DH + 21;
const L1 = dist(R0, RC), DA = Math.atan2(RC[1] - R0[1], RC[0] - R0[0]);
const E2 = [JF[0], JF[1] - 214 * JSD - DH], P2L = dist(RC, E2), A2 = Math.atan2(E2[1] - RC[1], E2[0] - RC[0]);
const SWING = 0.55; // how far the cracked end swings down (radians)
const swing = (t) => { const k = seg(t, TM.rule + 0.08, TM.rule + 0.45); return SWING * k * k - 0.05 * pulse(t, TM.rule + 0.45, 0.22); };
const tip = (t) => { const k = seg(t, TM.rule + 0.02, TM.rule + 0.55); return -1.32 * k * k + 0.06 * pulse(t, TM.rule + 0.55, 0.2); };
const dAng = (i, t) => (i === 1 ? DA : A2 - swing(t));
const dn = (a) => [Math.sin(a), -Math.cos(a)];
function dPiece(i, s, t) { const a = dAng(i, t), o = i === 1 ? R0 : RC; return [o[0] + Math.cos(a) * s, o[1] + Math.sin(a) * s]; }
function onD(i, s, t) { const q = dn(dAng(i, t)), p = dPiece(i, s, t); return [p[0] - q[0] * DOFF, p[1] - q[1] * DOFF]; }
function partD(t) {
  if (t < TM.end20 || !vis(-900, 2530, 160, 3090)) return;
  const up = (p, q, o) => [p[0] - q[0] * o, p[1] - q[1] * o];
  // the fool holding the end up: stands on the top drum, tips over on "rule" (drawn first: the ruler rests on its hat)
  X.save(); X.translate(JF[0] - 28, JF[1]); X.rotate(tip(t)); X.translate(-(JF[0] - 28), -JF[1]);
  jester(JF[0], JF[1], JSD, { price: '', tag: 'd3' }); const tb = [JF[0] + 2, JF[1] - 82, 70, 36]; shape(box(...tb), PAPER, 'd3tg', 1.2); boxLabel('SOLD', tb, 26, RED);
  X.restore();
  // posts under the high end and the middle
  for (const s of [12, 390]) { const p = dPiece(1, s, t); ink([[p[0], p[1] + DH - 4], [p[0], p[1] + 120]], 'd3p' + s, { w: 2.6 }); ink([[p[0] - 22, p[1] + 120], [p[0] + 22, p[1] + 120]], 'd3pf' + s, { w: 2.6 }); }
  const piece = (i, L, tag) => {
    const q = dn(dAng(i, t)), A = dPiece(i, 0, t), B = dPiece(i, L, t);
    shape([up(A, q, DH), up(B, q, DH), up(B, q, -DH), up(A, q, -DH), up(A, q, DH)], TAN, tag, 2);
    for (let s = 12; s < L - 6; s += 24) { const p = dPiece(i, s, t), m = (Math.round(s / 24) % 4 === 0) ? 15 : 7; ink([up(p, q, DH), up(p, q, DH - m)], tag + 'tk' + s, { w: 1, pen: 'ink.fine' }); }
    ink([up(dPiece(i, 30, t), q, -10), up(dPiece(i, L - 40, t), q, -6)], tag + 'gr', { w: 0.8, col: OX, a: 0.5, pen: 'ink.fine' });
  };
  piece(1, L1, 'd3r1'); piece(2, P2L, 'd3r2');
  // inch numbers, counted from the far (left) end of the whole ruler
  for (let n = 1; n <= 8; n++) {
    const u = n * 96, i = u < P2L ? 2 : 1, s = i === 2 ? P2L - u : L1 - (u - P2L); if (s < 20 || s > (i === 1 ? L1 : P2L) - 10) continue;
    const a = dAng(i, t), q = dn(a), p = up(dPiece(i, s, t), q, DH - 26); label(String(n), p[0], p[1], 15, INK, a + Math.PI);
  }
  // the crack at the join: jagged, and it opens when the end gives
  const o = swing(t) * 40, c0 = dPiece(1, L1 - 3, t), q1 = dn(DA);
  ink([up(c0, q1, DH), up(c0, q1, 12).map((v, j) => v + (j ? 0 : 7)), up(c0, q1, 0), up(c0, q1, -14).map((v, j) => v - (j ? 0 : 6 + o * 0.2)), up(c0, q1, -DH)], 'd3cr', { w: 2.4 });
  // the stamp, turned with the ruler
  X.save(); const sc = dPiece(1, 230, t); X.translate(sc[0], sc[1]); X.rotate(DA + Math.PI);
  boxLabel('BUSINESS RULE No. 1', [-180, -21, 360, 42], 30, RED); ink(box(-182, -22, 364, 44), 'd3stb', { w: 1.6, col: RED, poly: true });
  X.restore();
}

// ================= E: line 22, the drum stack and the confetti cannon =================
// Joke: the scat line is pure sound, so it is pure drum: the coin bounces down a stack of drums, one per syllable, each a comic
// burst; the bass drum drops it into a confetti cannon. Payoff object: the cannon on the last word (it drops in on "bam", fires on
// "boom"). Reaction: the Shoveller, whose scat it is, lifts his shovels on every hit and throws them up on "boom".
const DRUMS = [ // [centre x, top y, width, height, shell colour], top to bottom, staggered; each sits on the next
  [-570, 3060, 160, 80, RED], [-470, 3140, 150, 70, NAVY], [-560, 3210, 180, 110, GILT], [-460, 3320, 210, 140, RED],
];
const BASS = [-530, 3650, 190], FLOOR = 3880;
const BOUNCE = [[-520, 3039], [-440, 3119], [-600, 3189], [-412, 3299], [-674, 3496]]; // coin centres on each exposed head
const MOUTH = [-830, 3690], EXIT = [-950, 3850], SHV = [-160, FLOOR];
function burstPts(cx, cy, w, h) { const o = []; for (let i = 0; i <= 24; i++) { const a = i * TAU / 24, r = i % 2 ? 0.78 : 1.08; o.push([cx + Math.cos(a) * w / 2 * r, cy + Math.sin(a) * h / 2 * r]); } return o; }
let BURSTS = null; // per scat word: baseline-left [x, y] for the lettering and the burst's centre and size
function layoutBursts() { // each burst beside the drum the coin hits on that syllable, on the drum's open side
  // The last row is placed clear of the coin's flight out of the cannon (x -975..-805, y 3485 down to the hole): the first of its
  // two words low on the left of that path, the cannon's blast word up to the right of it, over the bass drum's shoulder.
  const rows = [ // [x of the first burst's left edge, row centre y]
    [-470, 3030], [-380, 3130], [-800, 3205], [-340, 3300], [-1080, 3400]];
  const last = [[-1050, 3680, 26, 66], [-690, 3420, 70, 84]]; // [centre x, centre y, padding, height] for the last group's two words
  X.save(); X.font = '46px KevinSans'; BURSTS = [];
  TM.groups.forEach((g, gi) => { let [x, cy] = rows[Math.min(gi, rows.length - 1)]; g.w.forEach((wi, n) => {
    const ww = X.measureText(C.lines[L0 + 4].words[wi].w).width;
    if (gi === TM.groups.length - 1) { const [lx, ly, pad, h] = last[Math.min(n, 1)]; BURSTS[wi] = { x: lx - ww / 2, y: ly + 16, cx: lx, cy: ly, w: ww + pad, h }; return; }
    const w = ww + 50; BURSTS[wi] = { x: x + 25, y: cy + 16, cx: x + w / 2, cy, w, h: 70 }; x += w + 6; }); });
  X.restore();
}
function drumHit(i, t) { const g = TM.groups[i]; return g ? pulse(t, g.t - 0.02, 0.22) : 0; }
function partE(t) {
  if (t < TM.end20 || !vis(-1100, t > TM.groups[TM.groups.length - 1].t1 ? 2500 : 2970, -30, 3905)) return;
  shape(box(-1090, FLOOR, 1050, 14), TAN, 'e3fl', 1.6);
  blob(circ(EXIT[0], FLOOR + 7, 38, 9), INK, 'e3hole', 1.4); // the exit: a hole in the floor down to the basement
  // the bass drum on its side, on two spurs
  const [bx, by, br] = BASS, bd = drumHit(4, t) * 6;
  for (const sd of [-1, 1]) ink([[bx + sd * 120, by + 120], [bx + sd * 170, FLOOR]], 'e3sp' + sd, { w: 2.6 });
  blob(circ(bx, by, br), NAVY, 'e3bs', 2.4); blob(circ(bx, by, br - 22 + bd * 0.3), PAPER, 'e3bh', 1.6);
  for (let i = 0; i < 8; i++) { const a = i * TAU / 8; dot(bx + Math.cos(a) * (br - 11), by + Math.sin(a) * (br - 11), 3.4, GILT); }
  // the stack, bottom first so each drum sits over the one below
  for (let i = DRUMS.length - 1; i >= 0; i--) {
    const [x, y, w, h, col] = DRUMS[i], dip = drumHit(i, t) * 5;
    shape(box(x - w / 2, y + 8, w, h - 8), col, 'e3d' + i, 2);
    for (let r = 1; r < 4; r++) ink([[x - w / 2 + r * w / 4, y + 10], [x - w / 2 + r * w / 4 + 6, y + h - 2]], 'e3dr' + i + r, { w: 1, col: GILT });
    blob(circ(x, y + 8 + dip, w / 2, 10), PAPER, 'e3dh' + i, 1.8);
    shape(box(x - w / 2 - 4, y + h - 8, w + 8, 8), GREY, 'e3dhb' + i, 1.2);
  }
  // the confetti cannon: an upright barrel on wheels with a CONFETTI band; it kicks on "boom"
  const fire = TM.groups[TM.groups.length - 1], tf = fire.t1, kick = pulse(t, tf, 0.3) * 10;
  const [mx, my] = MOUTH;
  shape([[mx - 40, my + kick], [mx + 40, my + kick], [mx + 50, FLOOR - 34], [mx - 50, FLOOR - 34], [mx - 40, my + kick]], GREY, 'e3bar', 2.4);
  blob(circ(mx, my + kick, 40, 9), INK, 'e3mo', 1.6);
  shape(box(mx - 48, my + 46, 96, 34), LAMP, 'e3band', 1.2); boxLabel('CONFETTI', [mx - 48, my + 46, 96, 34], 20, RED);
  for (const sd of [-1, 1]) { blob(circ(mx + sd * 44, FLOOR - 24, 24), TAN, 'e3wh' + sd, 1.8); dot(mx + sd * 44, FLOOR - 24, 4, INK); }
  // the Shoveller, whose scat this is: a lift of the shovels on every hit, both up and held on "boom"
  const arms = Math.max(0.15 + 0.4 * TM.groups.slice(0, -1).reduce((m, g) => Math.max(m, pulse(t, g.t - 0.02, 0.3)), 0), ease(seg(t, tf - 0.05, tf + 0.25)));
  shoveller(SHV[0], SHV[1], 0.5, { arms, flip: -1, tag: 'e3' });
  if (t > tf) { // confetti: colour, not light; one soft puff under 0.4
    const k = seg(t, tf, tf + 1.8), r = LLPen.makeRng(77);
    X.save(); X.globalAlpha = 0.35 * (1 - seg(t, tf, tf + 0.25)); dot(mx, my - 20, 40 + 60 * k, PAPER); X.restore();
    const cols = [RED, GILT, GREEN, BALL, LAMP, OX];
    for (let i = 0; i < 84; i++) {
      const a = -Math.PI / 2 + (r() - 0.5) * 1.2, v = 420 + r() * 420, tt = (t - tf) * (0.8 + r() * 0.4);
      const x = mx + Math.cos(a) * v * tt, y = my + Math.sin(a) * v * tt + 330 * tt * tt;
      if (y > FLOOR - 4) continue;
      X.save(); X.translate(x, y); X.rotate(r() * 6 + tt * (4 + r() * 6)); X.fillStyle = cols[i % cols.length]; X.globalAlpha = 0.9; X.fillRect(-9, -4.5, 18, 9); X.restore();
    }
  }
  // the sound bursts behind each word (the words themselves are lettered in words()); laid out on first use, after the font loads
  if (!BURSTS) layoutBursts();
  BURSTS.forEach((b, i) => { const k = seg(t, TM.scat[i] - 0.05, TM.scat[i] + 0.08); if (k <= 0) return; const sc = k < 1 ? ease(k) * 1.1 : 1 + 0.06 * pulse(t, TM.scat[i] + 0.08, 0.2); X.save(); X.translate(b.cx, b.cy); X.scale(sc, sc); X.translate(-b.cx, -b.cy); const bp = burstPts(b.cx, b.cy, b.w, b.h), col = i % 2 ? LAMP : GILT; X.fillStyle = col; X.fill(pathOf(bp)); blob(bp, col, 'e3bu' + i, 2); X.restore(); }); // opaque: confetti passes behind
}

// ================= the coin's path =================
function legs(add, land) {
  const ent = SEC['floor2'].exit.p, sx = sOfX, ls = sOfX(RB[0]);
  const at = (s) => (k, t) => onRuler(s, t);
  const roll = (s0, s1, pw = 1) => (k, t) => onRuler(lerp(s0, s1, k ** pw), t);
  // A
  add(T0, T0 + 0.5, (k, t) => hop(ent, onRuler(sx(1300), t), k, 40));
  add(T0 + 0.5, TM.w0 - 0.4, at(sx(1300)));
  const knocks = [[TM.w0, 1185], [TM.w1, 1085], [TM.w2, 985], [TM.w4, 885]];
  let prevX = 1300, prevT = TM.w0 - 0.4;
  knocks.forEach(([tk, x], i) => {
    const r0 = Math.max(prevT, tk - 0.4);
    if (r0 > prevT) add(prevT, r0, at(sx(prevX)));
    add(r0, tk, roll(sx(prevX), sx(x), 1.4));
    prevX = x; prevT = tk;
  });
  add(prevT, TM.opin, at(sx(prevX)));
  add(TM.opin, TM.bend, roll(sx(prevX), ls, 2));
  const tl = TM.bend + 1.0;
  add(TM.bend, tl, roll(ls, ls + LFLEX, 1));
  const tipEnd = ls + LFLEX + LTIP - 25;
  add(tl, TM.bend + 1.25, roll(ls + LFLEX, tipEnd, 1));
  const tFl = TM.bend + 1.62;
  add(TM.bend + 1.25, tFl, at(tipEnd));
  const tLand = tFl + 0.85;
  add(tFl, tLand, (k, t) => { const a = onRuler(tipEnd, tFl), b = pigBack(0, t); return bez(a, [a[0] - 60, b[1] - 70], b, 1 - (1 - k) ** 1.3); });
  // B
  add(tLand, TM.beats[0] - 0.05, (k, t) => pigBack(0, t));
  TM.beats.forEach((b, j) => {
    add(b - 0.05, b + 0.22, (k, t) => hop(pigBack(j, t), pigBack(j + 1, t), k, 46));
    const nx = j + 1 < TM.beats.length ? TM.beats[j + 1] - 0.05 : TM.end19 + 2.1;
    add(b + 0.22, nx, (k, t) => pigBack(j + 1, t));
  });
  // C: up the slot tube onto the carriage, ride the claw, off the end and down the chute to the prize door
  const tS = TM.end19 + 2.1, tTube = tS + 0.6, tCar = tTube + 0.7;
  add(tS, tTube, (k) => hop(pigBack(13, tS), SLOT, k, 140));
  add(tTube, tCar, (k) => along([SLOT, [TUBEX, GL1], [TUBEX, CARRY]], k));
  const tOff = TM.fool[4] + 0.55, tChute = tOff + 0.45, tOut = tChute + 0.1;
  add(tCar, tOff, (k, t) => [carriageX(t), CARRY]);
  const DOORC = [DOOR[0] + DOOR[2] / 2, DOOR[1] + DOOR[3] / 2 + 5];
  add(tOff, tChute, (k) => [lerp(150, DOORC[0], k), lerp(CARRY, DOORC[1], k * k)]);
  add(tChute, tOut, () => DOORC);
  // D: out of the door onto the ruler's high end, roll its inches to the crack on "rule", down the cracked end as it swings
  const tD = TM.thats - 0.15, d0 = onD(1, 0, 0);
  add(tOut, tD, (k) => [lerp(DOORC[0], d0[0], k), lerp(DOORC[1], d0[1], k * k)]);
  add(tD, TM.rule, (k) => onD(1, L1 * (k ** 1.15), 0));
  const tR2 = TM.rule + 0.9, s2 = P2L - 14;
  add(TM.rule, tR2, (k, t) => onD(2, s2 * k * k, t));
  // E
  const g = TM.groups;
  add(tR2, g[0].t, (k) => { const a = onD(2, s2, tR2), b = BOUNCE[0]; return [lerp(a[0], b[0], k), lerp(a[1], b[1], k * k)]; });
  for (let i = 0; i < 5; i++) {
    const p = BOUNCE[i], tNext = g[i + 1].t, hopT = 0.32, rest = tNext - hopT, tStart = g[i].t;
    // a held syllable: small bounces on the same drum, about four a second
    if (rest - tStart > 0.3 && i !== 1) { const nb = Math.max(1, Math.round((rest - tStart) / 0.27)); add(tStart, rest, (k) => { const u = (k * nb) % 1; return [p[0], p[1] - Math.sin(Math.PI * u) * 26]; }); }
    else if (rest > tStart) add(tStart, rest, () => p);
    const q = i < 4 ? BOUNCE[i + 1] : [MOUTH[0], MOUTH[1] - 12];
    add(Math.max(tStart, rest), tNext, (k) => hop(p, q, k, i < 4 ? 44 : 70));
  }
  const tb = g[5].t, tf = g[5].t1;
  add(tb, tf, (k) => [MOUTH[0], MOUTH[1] - 12 + k * 20]);
  add(tf, T1, (k) => bez([MOUTH[0], MOUTH[1] + 8], [-905, 3260], SEC['floor3'].exit.p, k));
  [['f3knock0', TM.w0], ['f3loop', TM.bend], ['f3pig', TM.beats[0] + 0.22], ['f3slot', tTube], ['f3ruler', tD], ['f3crack', TM.rule], ['f3drum', g[0].t], ['f3cannon', tb]].forEach(([n, tt]) => land(n, tt));
}

// ================= camera =================
// Each held framing eases in fully before the previous one lets go, so a move is a clean blend from one framing to the next.
function cam(hold, t, st) {
  // inside this range the camera starts from the plain follow-cam (an earlier section's pull-back must not leak in)
  if (t >= 118.0 && t <= T1) { let x = 0, y = 0, sum = 0; for (let j = -10; j <= 14; j++) { const w = 1 - Math.abs(j - 2) / 14, b = ballAt(t + j * 0.04); x += b[0] * w; y += b[1] * w; sum += w; } st.x = x / sum; st.y = y / sum - 30; st.z = 1.1; }
  const tA = lineEnd(L0) + 1.52, tB = TM.end19 + 1.5, tC = TM.fool[4] + 0.4, tE = TM.groups[1].t + 0.75, tE2 = TM.groups[3].t1 + 1.3;
  hold(860, 3530, 1.0, 118.0, 118.8, tA + 1.4, tA + 1.5);          // line 18: the ruler, the heads, the loop
  hold(815, 2825, 0.95, tA, tA + 1.4, tB + 1.8, tB + 1.9);          // line 19: the pig escalator
  hold(300, 1960, 0.96, tB, tB + 1.8, tC + 2.0, tC + 2.1);          // line 20: the claw machine (2 s move down to the ruler)
  hold(-330, 2813, 0.98, tC, tC + 2.0, tE + 1.4, tE + 1.5);         // line 21: the cracked ruler, the fool, the top drums
  hold(-620, 3450, 0.96, tE, tE + 1.4, tE2 + 1.0, tE2 + 1.1);       // line 22 first half: the middle drums
  hold(-620, 3530, 0.96, tE2, tE2 + 1.0, T1 - 1.6, T1 - 0.8);       // line 22 end: the bass drum, the cannon, the Shoveller
}

// ================= lettering =================
function words(t) {
  if (t < T0) return;
  letterWords(lineWords(L0), 440, 3795, 46, RED, 890);
  letterWords(lineWords(L0 + 1), 650, 3000, 46, INK, 520);
  letterWords(lineWords(L0 + 2), -200, 2285, 46, INK, 640);
  letterWords(lineWords(L0 + 3), -170, 2880, 46, INK, 380);
  if (!BURSTS) layoutBursts();
  lineWords(L0 + 4).forEach((w, i) => { const b = BURSTS[i]; letterWords([w], b.x, b.y, 46, INK, 400); });
}

section({
  id: 'floor3', range: [T0, T1],
  init: times,
  legs, cam,
  parts(t, depth = 0) { CULL = depth === 0; partE(t); partD(t); partC(t); partB(t); partA(t); },
  words,
});
})();

// 136.84-162.1  "In her dream there's a big reunion gonna come" x2, then the vocal gap.
// A paper medallion seen from straight above, with the cast as paper-doll chains standing round it (side-view
// puppets, radial, like a chain cut from a folded sheet). Her family is the inner ring, heads together round a
// small gold sun; friends and doctors stand on the next rim, the many-colour crowd on the next. People slide in
// along radial slots like a toy theatre (the near rings walking). On "reunion" hands join in a ripple and the
// rings turn, alternate ways. On "gonna come" the view pulls up and a fourth ring of 50 arrives. Second line:
// a lift, the centre swells into the sun and the outer rings raise their joined hands into its rays. In the
// gap the sun shrinks into 10's street-lamp glow while a dusk cloth drops in.
// (Arm solver and chain maths borrowed from 16-reunion2.js, copied here.)
// Draft 2 (layered on top, the look unchanged): the medallion's paper layers pop in one after another under the
// fade and the family slides in on "In"; on each "big" the rosette breathes out and the hub throws gold laugh
// rings; through each held "come" the rings wind up at their own speeds like a paper toy; small props from the
// earlier scenes (orange, moon cradle, paper bird, cup) pop into the family's wedges on the beats and melt into
// the sun on the second "big". Everything new is finished by 157.5: from there on every frame is draft 1's.
(() => {
const T = { start: 136.84, inn: 137.70, dream: 138.97, there: 140.11, big: 140.89, reunion: 141.33, gonna: 144.17, come: 144.49,
  in2: 150.21, dream2: 151.11, big2: 153.10, reunion2: 153.53, gonna2: 156.40, come2: 156.90, gap: 157.6, end: 162.1 };
const BEATS = [136.32, 137.09, 137.88, 138.65, 139.41, 140.22, 140.97, 141.71, 142.48, 143.24, 144.01, 144.75, 145.52, 146.28,
  147.05, 147.79, 148.56, 149.30, 150.07, 150.84, 151.63, 152.39, 153.16, 153.92, 154.71, 155.48, 156.29, 157.06, 157.73,
  158.43, 159.10, 159.94, 160.63, 161.33, 162.03];
const beatPulse = (t) => { let p = 0; for (const b of BEATS) { const d = t - b; if (d >= 0 && d < .5) p = Math.max(p, Math.pow(1 - d / .5, 2)); } return p; };
const CX = 960, CY = 540;
const LAMP = { x: 1043, y: 340 };          // where 10's street lamp glows (10 opens on it)
const rampInt = (t, a, r) => t < a ? 0 : t < a + r ? (t - a) * (t - a) / (2 * r) : t - a - r / 2;

// ---------------- the cast, by ring ----------------
const ex = (col, kind, head, hair, height) => ({ col, kind, head, hair, height });
const HUB = 62;                                       // the little gold sun the family's heads ring
const RINGS = [
  // A: her family, heads in toward the sun, feet out: cut twice round, like a doll chain from a folded sheet
  { unit: [CAST.her, CAST.girl3, CAST.boy8, CAST.girl11], N: 8, s: .25, out: -1, rim: (h, s) => HUB + 975 * s * h,
    arrive: [T.dream - .15, .3], join: [T.reunion - .05, .2], w: .30, off: 0, live: true,
    slideT: 1.15, slideD: 800, ease: ei },   // draft 2: in from the frame edge on "In" (137.7), home on "dream"
  // B: friends and doctors, standing out from the cream rim (live puppets)
  { unit: [CAST.friendA, CAST.doctor, CAST.friendB, ex(C.sky2, 'shirt', 'short', null, 1)], N: 24, s: .2, out: 1, rim: () => 332,
    arrive: [T.there - .1, .7], join: [T.reunion + .05, .7], w: -.2, off: Math.PI / 24, live: true },
  // C: the street and the bus riders, many colours (sprites)
  { unit: [ex(C.orange, 'dress', 'her', null, 1), ex(C.gold, 'shirt', 'short', null, 1), ex(C.leaf, 'dress', 'short', 'curls', 1),
    ex(C.mint, 'shirt', 'short', null, 1), ex(C.red, 'dress', 'her', 'bob', 1)], N: 40, s: .18, out: 1, rim: () => 566,
    arrive: [T.big - .25, .7], join: [T.reunion + .2, 1.0], up: T.reunion2 - .05, w: .13, off: 0 },
  // D: everyone else, one rose-dark paper (sprites)
  { unit: [ex(C.roseDark, 'dress', 'her', null, 1), ex(C.roseDark, 'shirt', 'short', null, 1)], N: 50, s: .17, out: 1, rim: () => 782,
    arrive: [T.come + 1.6, .9], join: [T.come + 2.6, 1.2], up: T.reunion2 + .45, w: -.075, off: Math.PI / 50 },
];
const SLIDE_T = 1.3, SLIDE_D = 1000;

// ---- draft 2: the wind-up. Extra turn per ring in SLOTS (one slot = one person's place), through each held
// "come". Each total is a whole multiple of the ring's repeating unit, so once a wind is done every slot holds
// exactly the person draft 1 had there (and from 157.5 on the frame is draft 1's, bit for bit).
const WIND = [{ w1: 4, w2: 0 }, { w1: -4, w2: -4 }, { w1: 5, w2: 5 }, { w1: -4, w2: -2 }];
const WIN1 = [T.come, T.in2], WIN2 = [155.66, 157.5];      // 2nd: from the end of "reunion" through "gonna come", done as the gap starts
function windMap(ri, t) {
  const e = WIND[ri].w1 * eio((t - WIN1[0]) / (WIN1[1] - WIN1[0])) + WIND[ri].w2 * eio((t - WIN2[0]) / (WIN2[1] - WIN2[0]));
  const eInt = Math.floor(e);
  return { e, eInt, frac: e - eInt };
}
const personAt = (rg, mp, k) => (((k - mp.eInt) % rg.N) + rg.N) % rg.N;
const NOWIND = { e: 0, eInt: 0, frac: 0 };

// two-link arm IK in the puppet's arm space (+x forward, +y down, units). Returns [sh, el]. (from 16)
function reach(fx, fy, bk) {
  const a1 = 168, a2 = 176; let d = Math.hypot(fx, fy); d = Math.min(d, a1 + a2 - .5); d = Math.max(d, 40);
  const th = Math.atan2(fx, fy);
  const E = Math.acos(clamp((d * d - a1 * a1 - a2 * a2) / (2 * a1 * a2), -1, 1)) * (bk ? -1 : 1);
  return [th - Math.atan2(a2 * Math.sin(E), a1 + a2 * Math.cos(E)), E];
}
const HANG = [[.05, .2], [-.05, .2]];
const lerpArm = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// Lay out a ring: each person's frame (feet at the origin, up = away from their rim), shoulders, and the
// IK poses for "hands joined" and "hands joined overhead".
function layout(rg, m0, rot, slideOf, bobOf, wm = NOWIND) {
  const people = [];
  for (let i = 0; i < rg.N; i++) {                              // i = slot; the person in it is personAt()
    const spec = rg.unit[personAt(rg, wm, i) % rg.unit.length], h = spec.height || 1;
    let a = rot + rg.off + Math.PI * 2 * i / rg.N;
    if (wm.frac) a += Math.PI * 2 * wm.frac / rg.N;
    let m = m0.rotate(a * 180 / Math.PI).translate(0, -(rg.rim(h, rg.s) + slideOf(i)));
    if (rg.out < 0) m = m.scale(1, -1);
    const bob = bobOf(i);
    const mp = m.translate(0, bob * rg.s).scale(rg.s * h, rg.s * h);
    people.push({ spec, h, m, mp, bob, near: mp.transformPoint(new DOMPoint(8, -752)), far: mp.transformPoint(new DOMPoint(-8, -752)),
      top: mp.transformPoint(new DOMPoint(20, -1010)) });
  }
  const N = rg.N, meet = (q, r, dy = 0) => new DOMPoint((q.x + r.x) / 2, (q.y + r.y) / 2);
  for (let i = 0; i < N; i++) {
    const p = people[i], nx = people[(i + 1) % N], pv = people[(i - 1 + N) % N];
    const inv = p.mp.translate(8, -752).inverse(), invF = p.mp.translate(-8, -752).inverse();
    let A1 = inv.transformPoint(meet(p.near, nx.far)), A2 = invF.transformPoint(meet(p.far, pv.near));
    let swap = false;
    if (A1.x < 0) { swap = true; [A1, A2] = [invF.transformPoint(meet(p.far, nx.near)), inv.transformPoint(meet(p.near, pv.far))]; }
    p.joined = [reach(A1.x, A1.y + 30, false), reach(A2.x, A2.y + 30, true)];
    // overhead: hands meet above the heads, between neighbours
    let U1 = inv.transformPoint(meet(p.top, nx.top)), U2 = invF.transformPoint(meet(p.top, pv.top));
    if (swap) { U1 = invF.transformPoint(meet(p.top, nx.top)); U2 = inv.transformPoint(meet(p.top, pv.top)); }
    p.upPose = [reach(U1.x, U1.y - 60, false), reach(U2.x, U2.y - 60, true)];
  }
  return people;
}
// per-person timing: slide-in left, hand-join and arms-up amounts
function cue(rg, i, t) {
  const arr = rg.arrive[0] + (hash(i * 7.1 + rg.N) - .5) * rg.arrive[1];
  const ST = rg.slideT || SLIDE_T, SD = rg.slideD || SLIDE_D, EZ = rg.ease || eio;
  const rem = Math.max(0, arr - t) / ST;                       // 1+ = still off in its slot, 0 = home
  const slide = EZ(clamp(rem)) * SD + Math.max(0, rem - 1) * SD;
  const j0 = rg.join[0] + (i / rg.N) * rg.join[1];
  const join = t < j0 ? 0 : Math.min(1, back((t - j0) / .4));
  const up = rg.up ? eo((t - (rg.up + (i / rg.N) * .55)) / .6) : 0;
  return { slide, rem, join, up };
}

// ---- live rings (A, B): real puppets, walking in, posed per frame ----
function liveRing(rg, rot, t, mp = NOWIND) {
  const m0 = g.getTransform();
  const cs = [...Array(rg.N).keys()].map((k) => cue(rg, personAt(rg, mp, k), t));
  const hop = beatPulse(t);
  const people = layout(rg, m0, rot, (i) => cs[i].slide, (i) => -hop * 18 * cs[i].join, mp);
  people.forEach((p, i) => {
    const c = cs[i];
    if (c.slide > 1400) return;
    // toy theatre: they ride in along their slot with a little skip, arms swinging
    const moving = clamp(c.rem * 6);
    const skip = Math.abs(Math.sin(c.slide / 90)) * moving;
    const swing = Math.sin(c.slide / 90) * .35 * moving;
    const arms = [lerpArm([HANG[0][0] + swing, .3], p.joined[0], c.join), lerpArm([HANG[1][0] - swing, .3], p.joined[1], c.join)];
    const sway = Math.sin((t - 141) / .768 * Math.PI) * .1 * c.join;
    const legs = [[sway + skip * .25, Math.max(0, sway) * .6 + skip * .5], [-sway - skip * .1, Math.max(0, -sway) * .6 + skip * .2]];
    const wk = { bob: -skip * 40 };
    const walking = 1;
    g.setTransform(p.m);
    puppet(0, 0, rg.s, 1, p.spec, { arms, legs, bob: p.bob + (wk.bob || 0) * walking, head: -.05 * hop * c.join });
  });
  g.setTransform(m0);
}

// ---- sprite rings (C, D): each spec is cut once per pose (hanging, half, joined, half-up, up) ----
const SPR = new Map();
const SK = 1.5;                                                  // sprite resolution over world px
function sprite(rg, ri, si, pi, people) {
  const key = ri + ':' + si + ':' + pi;
  if (SPR.has(key)) return SPR.get(key);
  const p = people[si], s = rg.s, ox = 470 * s, oy = 1110 * s;
  const cv = document.createElement('canvas'); cv.width = Math.ceil(940 * s * SK); cv.height = Math.ceil(1180 * s * SK);
  const ctx = cv.getContext('2d'); const g0 = g; g = ctx;
  ctx.setTransform(SK, 0, 0, SK, ox * SK, oy * SK);
  const arms = pi <= 2 ? [lerpArm(HANG[0], p.joined[0], pi / 2), lerpArm(HANG[1], p.joined[1], pi / 2)]
    : [lerpArm(p.joined[0], p.upPose[0], (pi - 2) / 2), lerpArm(p.joined[1], p.upPose[1], (pi - 2) / 2)];
  try { puppet(0, 0, s, 1, p.spec, { arms }); } finally { g = g0; }
  const spr = { cv, ox, oy, w: cv.width / SK, h: cv.height / SK };
  SPR.set(key, spr); return spr;
}
let CANON = null;   // canonical layouts (rot 0, home) used to solve each sprite's pose once
function spriteRing(rg, ri, rot, t, mp = NOWIND) {
  const m0 = g.getTransform();
  if (!CANON) CANON = {};
  if (!CANON[ri]) CANON[ri] = layout(rg, new DOMMatrix(), 0, () => 0, () => 0);
  const hop = beatPulse(t);
  for (let k = 0; k < rg.N; k++) {                              // k = slot, i = the person in it
    const i = personAt(rg, mp, k);
    const c = cue(rg, i, t);
    if (c.slide > 1400) continue;
    const si = i % rg.unit.length;
    const pi = c.up > 0 ? 2 + Math.round(c.up * 2) : Math.round(c.join * 2);
    const spr = sprite(rg, ri, si, pi, CANON[ri]);
    let a = rot + rg.off + Math.PI * 2 * k / rg.N;
    if (mp.frac) a += Math.PI * 2 * mp.frac / rg.N;
    const bob = -hop * 16 * c.join * rg.s;
    g.setTransform(m0.rotate(a * 180 / Math.PI).translate(0, -(rg.rim(1, rg.s) + c.slide) + bob));
    g.drawImage(spr.cv, -spr.ox, -spr.oy, spr.w, spr.h);
  }
  g.setTransform(m0);
}

// scalloped disc (the paper medallion bands)
function scallop(r, n, depth, rot = 0) {
  const p = new Path2D(); const N = n * 8;
  for (let i = 0; i <= N; i++) { const a = rot + i / N * Math.PI * 2; const rr = r * (1 - depth + depth * Math.abs(Math.cos(a * n / 2)));
    i ? p.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : p.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  p.closePath(); return p;
}
// the dusk backdrop drops in from the top like a theatre cloth, torn lower edge (10 opens on this sky)
function dusk(k) {
  if (k <= 0) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const y = lerp(-60, H + 70, k), p = new Path2D(); p.moveTo(-20, -20); p.lineTo(W + 20, -20);
  for (let i = 24; i >= 0; i--) p.lineTo(i * W / 24, y + (hash(i * 5.3 + 2) - .5) * 26);
  p.closePath();
  g.save(); g.shadowColor = 'rgba(15,10,30,.45)'; g.shadowBlur = 30; g.shadowOffsetY = 12; g.fillStyle = C.sky1; g.fill(p); g.restore();
  g.clip(p);
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, C.sky0); gr.addColorStop(.55, C.sky1); gr.addColorStop(1, C.sky2);
  g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
}

// ---- draft 2 helpers (all finished well before 157.5) ----
// "big": the rosette breathes out ~4% with a back() overshoot, then settles
const breathe = (t, at) => pop(t, at, .35) * (1 - ss(at + .45, at + 1.15, t));
// the hub's laugh: short gold arcs thrown out four ways (the film's joy rings), riding with the family ring
function hubLaugh(t, at, rot, cols) {
  for (let q = 0; q < 4; q++) for (let r = 0; r < 3; r++) {
    const d = t - at - r * .16; if (d < 0 || d > 1.6) continue; const k = d / 1.6;
    g.save(); g.rotate(rot + q * Math.PI / 2 + Math.PI / 8); g.globalAlpha *= (1 - k) * .95;
    g.strokeStyle = cols[r % 2]; g.lineWidth = lerp(24, 5, k); g.lineCap = 'round';
    g.beginPath(); g.arc(0, 0, 80 + k * 420, -.42, .42); g.stroke(); g.restore();
  }
}
// tiny props from the earlier scenes, one per wedge between the family's spokes, popping in on the held "come"
const PROP_BEATS = [144.75, 145.52, 146.28, 147.05];
const PROP_OUT = T.big2;                                        // they melt into the swelling sun
function prop(j, t) {
  if (j === 0) orange(0, 0, 30);
  else if (j === 1) { const rk = Math.sin((t - 141) / .768 * Math.PI) * .22;      // the moon cradle rocks (03)
    g.save(); g.rotate(rk); cut(crescent(0, 0, 40, .32, Math.PI / 2), C.gold, { sh: .6, grain: .2 });
    cut(circle(-6, 14, 10), C.cream, { sh: .3, grain: .1 }); g.restore(); }
  else if (j === 2) {                                           // the paper bird, in profile, both wings up in a V
    const f = .85 + .15 * Math.sin(Math.floor(t * 12) * 1.9);
    g.save(); g.scale(1.45, 1.45);
    cut(poly([[-4, -6], [12, -6], [-26, -6 - 50 * f]]), C.white, { sh: .45 });            // far wing, swept back
    cut(poly([[-34, -2], [-62, -16], [-54, 0], [-62, 14], [-34, 4]]), C.white, { sh: .45 }); // forked tail
    cut(blob([[-40, 0], [-10, -10], [26, -8], [34, -16], [48, -14], [52, -6], [40, 4], [-10, 10]], .6), C.white, { sh: .6 }); // body + head
    cut(poly([[50, -12], [64, -8], [50, -5]]), C.gold, { sh: .3, grain: .1 });             // beak
    cut(poly([[-2, -4], [18, -4], [26, -4 - 54 * f]]), C.white, { sh: .5 });              // near wing, forward
    g.restore(); }
  else {                                                          // the cup: saucer, cup, handle
    cut(ellipse(0, 26, 44, 10), C.white, { sh: .5 });
    cut(rrect(-26, -22, 52, 46, [4, 4, 14, 14]), C.red, { sh: .5 });
    g.save(); g.strokeStyle = C.red; g.lineWidth = 9; g.beginPath(); g.arc(28, 2, 13, -1.3, 1.3); g.stroke(); g.restore(); }
}
function props(t, rotA, eA) {
  if (t < PROP_BEATS[0] || t > PROP_OUT + .5) return;
  const rg = RINGS[0], out = 1 - eio((t - PROP_OUT) / .45);
  for (let i = 0; i < rg.N; i++) {
    const j = i % 4, k = pop(t, PROP_BEATS[j], .4) * out * (1 + .06 * beatPulse(t));
    if (k <= 0) continue;
    g.save(); g.rotate(rotA + rg.off + Math.PI * 2 * (i + eA + .5) / rg.N); g.translate(0, -240); g.scale(k, k);
    prop(j, t); g.restore();
  }
}
// the opening: the medallion's paper layers pop in one after another, landing as "In" is sung
const PLATE_IN = [137.02, 137.17, 137.32, 137.47];
function layer(t, i, draw) {
  const k = pop(t, PLATE_IN[i], .45);
  if (k === 1) { draw(); return; }                              // landed: exactly draft 1's call
  if (k <= 0) return;
  g.save(); g.scale(k, k); draw(); g.restore();
}

SHOT(T.start, T.end, 'reunion', (t) => {
  const A0 = g.globalAlpha;
  sheet(C.rose);
  // ---- camera: back a little for each ring that arrives, a lift on the second line ----
  let z = .9;
  z = lerp(z, .74, eio((t - (T.big - .9)) / 1.4));
  z = lerp(z, .6, eio((t - (T.come - .2)) / 2.4));
  const liftPop = bump(t, T.dream2 - .15, .9) * .05;
  z *= 1 + liftPop;
  const br = breathe(t, T.big) + breathe(t, T.big2);          // draft 2: the rosette breathes out on "big"
  if (br) z *= 1 + .04 * br;
  // ---- the sinking: everything shrinks into the lamp glow ----
  const sink = eio((t - T.gap) / (T.end - 1.3 - T.gap));
  const sunR = 330;
  const zz = z * lerp(1, 16 / (sunR * .6), Math.pow(sink, .8));
  const ox = lerp(CX, LAMP.x, sink), oy = lerp(CY, LAMP.y, sink) + bump(t, T.gap, 1.6) * 30;
  const spin = .05 * rampInt(t, T.reunion, 2) + .12 * rampInt(t, T.big2, 1.5);
  const toRing = () => { g.translate(ox, oy); g.scale(zz, zz); };

  dusk(eio((t - (T.gap + 1.0)) / 2.4));
  const fade = 1 - ss(T.gap + .6, T.gap + 2.2, t);            // people fade as they become a point of light

  // ---- the medallion floor: one band per ring; on the second line the centre swells to a sun ----
  const sunK = back(clamp((t - T.big2) / .9));
  const lift = ss(T.in2, T.dream2 + .3, t) * .8 + bump(t, T.dream2 - .15, .9) * .6;
  g.save(); toRing();
  g.globalAlpha = A0 * fade;
  layer(t, 0, () => cut(scallop(780, 52, .02, spin * .3), C.roseDeep, { sh: .5, grain: .25, lift: lift * .3 }));
  layer(t, 1, () => cut(scallop(560, 40, .03, -spin * .5), C.cream, { sh: .6, grain: .25, lift: .2 + lift * .5 }));
  layer(t, 2, () => cut(scallop(326, 26, .045, spin), C.sun, { sh: .6, grain: .25, lift: .2 + lift }));
  g.globalAlpha = A0;
  // draft 2: the family ring's angle (draft 1's turn plus the wind) for the props and the hub's laugh
  const mA = windMap(0, t), rotA = RINGS[0].w * rampInt(t, T.reunion + .5, 1.6) + RINGS[0].w * .6 * rampInt(t, T.dream2, 2);
  props(t, rotA, mA.e);
  if (sunK > 0) {
    g.globalAlpha = A0 * clamp(sunK);
    cut(scallop(lerp(60, sunR + 26, sunK), 36, .03, spin), C.goldPale, { sh: .6 * (1 - sink), grain: .25, lift: .4 });
    g.globalAlpha = A0;
  }
  const cr = lerp(HUB, sunR, sunK) * (1 + .03 * beatPulse(t));
  layer(t, 3, () => cut(scallop(cr, 22, .05, -spin * 2), C.gold, { sh: .8 * (1 - sink), grain: .22, lift: .3 + sunK * .5 }));
  // draft 2: the hub laughs on each "big"
  if (t > T.big && t < T.big + 2) hubLaugh(t, T.big, rotA, [C.gold, C.goldPale]);
  if (t > T.big2 && t < T.big2 + 2) hubLaugh(t, T.big2, rotA, [C.cream, C.white]);

  // gold flash rings on "reunion", "come" and the second "reunion"
  for (const [at, r0] of [[T.reunion, 150], [T.come, 566], [T.reunion2, 340]]) {
    for (let k = 0; k < 2; k++) { const d = t - at - k * .2; if (d < 0 || d > 1.8) continue; const u = d / 1.8;
      g.save(); g.globalAlpha = A0 * (1 - u) * .85 * fade; g.strokeStyle = k ? C.goldPale : C.gold; g.lineWidth = lerp(14, 3, u);
      g.beginPath(); g.arc(0, 0, r0 + u * 700, 0, Math.PI * 2); g.stroke(); g.restore(); }
  }

  // ---- the people: outer rings first ----
  if (fade > 0) {
    g.globalAlpha = A0 * fade;
    for (let ri = 3; ri >= 0; ri--) {
      const rg = RINGS[ri];
      if (t < rg.arrive[0] - rg.arrive[1] - SLIDE_T * 1.6) continue;
      const rot = rg.w * rampInt(t, T.reunion + .5, 1.6) + rg.w * .6 * rampInt(t, T.dream2, 2);
      const mp = windMap(ri, t);
      if (rg.live) liveRing(rg, rot, t, mp); else spriteRing(rg, ri, rot, t, mp);
    }
    g.globalAlpha = A0;
  }
  g.restore();

  // ---- the lamp glow it becomes (matches streetLamp() in 10) ----
  const glow = ss(T.end - 1.5, T.end - .3, t);
  if (glow > 0) {
    g.save(); g.globalAlpha *= glow * .55; const gr = g.createRadialGradient(LAMP.x, LAMP.y, 10, LAMP.x, LAMP.y, 260);
    gr.addColorStop(0, 'rgba(247,210,126,.9)'); gr.addColorStop(1, 'rgba(247,210,126,0)'); g.fillStyle = gr; g.fill(circle(LAMP.x, LAMP.y, 260)); g.restore();
    cut(circle(LAMP.x, LAMP.y, 16), C.goldPale, { sh: 0, grain: .1, alpha: glow });
  }
}, { xin: .5, tr: 'fade' });
})();

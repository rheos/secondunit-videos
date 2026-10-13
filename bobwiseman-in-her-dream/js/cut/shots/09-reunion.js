// 136.84-162.1  "In her dream there's a big reunion gonna come" x2, then the vocal gap.
// A paper medallion seen from straight above, with the cast as paper-doll chains standing round it (side-view
// puppets, radial, like a chain cut from a folded sheet). Her family is the inner ring, heads together round a
// small gold sun; friends and doctors stand on the next rim, the many-colour crowd on the next. People slide in
// along radial slots like a toy theatre (the near rings walking). On "reunion" hands join in a ripple and the
// rings turn, alternate ways. On "gonna come" the view pulls up and a fourth ring of 50 arrives. Second line:
// a lift, the centre swells into the sun and the outer rings raise their joined hands into its rays. In the
// gap the sun shrinks into 10's street-lamp glow while a dusk cloth drops in.
// (Arm solver and chain maths borrowed from 16-reunion2.js, copied here.)
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
    arrive: [T.dream - .15, .3], join: [T.reunion - .05, .2], w: .30, off: 0, live: true },
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
function layout(rg, m0, rot, slideOf, bobOf) {
  const people = [];
  for (let i = 0; i < rg.N; i++) {
    const spec = rg.unit[i % rg.unit.length], h = spec.height || 1;
    const a = rot + rg.off + Math.PI * 2 * i / rg.N;
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
  const rem = Math.max(0, arr - t) / SLIDE_T;                  // 1+ = still off in its slot, 0 = home
  const slide = eio(clamp(rem)) * SLIDE_D + Math.max(0, rem - 1) * SLIDE_D;
  const j0 = rg.join[0] + (i / rg.N) * rg.join[1];
  const join = t < j0 ? 0 : Math.min(1, back((t - j0) / .4));
  const up = rg.up ? eo((t - (rg.up + (i / rg.N) * .55)) / .6) : 0;
  return { slide, rem, join, up };
}

// ---- live rings (A, B): real puppets, walking in, posed per frame ----
function liveRing(rg, rot, t) {
  const m0 = g.getTransform();
  const cs = [...Array(rg.N).keys()].map((i) => cue(rg, i, t));
  const hop = beatPulse(t);
  const people = layout(rg, m0, rot, (i) => cs[i].slide, (i) => -hop * 18 * cs[i].join);
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
function spriteRing(rg, ri, rot, t) {
  const m0 = g.getTransform();
  if (!CANON) CANON = {};
  if (!CANON[ri]) CANON[ri] = layout(rg, new DOMMatrix(), 0, () => 0, () => 0);
  const hop = beatPulse(t);
  for (let i = 0; i < rg.N; i++) {
    const c = cue(rg, i, t);
    if (c.slide > 1400) continue;
    const si = i % rg.unit.length;
    const pi = c.up > 0 ? 2 + Math.round(c.up * 2) : Math.round(c.join * 2);
    const spr = sprite(rg, ri, si, pi, CANON[ri]);
    const a = rot + rg.off + Math.PI * 2 * i / rg.N;
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

SHOT(T.start, T.end, 'reunion', (t) => {
  const A0 = g.globalAlpha;
  sheet(C.rose);
  // ---- camera: back a little for each ring that arrives, a lift on the second line ----
  let z = .9;
  z = lerp(z, .74, eio((t - (T.big - .9)) / 1.4));
  z = lerp(z, .6, eio((t - (T.come - .2)) / 2.4));
  const liftPop = bump(t, T.dream2 - .15, .9) * .05;
  z *= 1 + liftPop;
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
  cut(scallop(780, 52, .02, spin * .3), C.roseDeep, { sh: .5, grain: .25, lift: lift * .3 });
  cut(scallop(560, 40, .03, -spin * .5), C.cream, { sh: .6, grain: .25, lift: .2 + lift * .5 });
  cut(scallop(326, 26, .045, spin), C.sun, { sh: .6, grain: .25, lift: .2 + lift });
  g.globalAlpha = A0;
  if (sunK > 0) {
    g.globalAlpha = A0 * clamp(sunK);
    cut(scallop(lerp(60, sunR + 26, sunK), 36, .03, spin), C.goldPale, { sh: .6 * (1 - sink), grain: .25, lift: .4 });
    g.globalAlpha = A0;
  }
  const cr = lerp(HUB, sunR, sunK) * (1 + .03 * beatPulse(t));
  cut(scallop(cr, 22, .05, -spin * 2), C.gold, { sh: .8 * (1 - sink), grain: .22, lift: .3 + sunK * .5 });

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
      if (rg.live) liveRing(rg, rot, t); else spriteRing(rg, ri, rot, t);
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
}, { xin: .8, tr: 'fade' });
})();

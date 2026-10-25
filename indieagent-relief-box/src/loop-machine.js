// The living loop, the machine. All timing is periodic in LOOP (12 s) so the film loops without a seam.
//
//   the sculpture  three funnel arms in a recycle-symbol loop around C. Each arm flares into a mouth and narrows to
//                  a spout that pours into the next arm's mouth. Beads circulate around it for ever (two laps a
//                  loop); inside an arm a bead shows as a swelling that travels along it, in a gap as a bead in
//                  flight. It breathes.
//   the system     every 4 s one item goes round the wider loop, three in flight at once (phases 0, 4, 8 s):
//                    u 0.0-0.4   a bead drops from the spigot under the bottom arm onto the piping
//                    u 0.4-3.2   it rolls along the piping to the tree
//                    u 3.2-3.6   it drops into the crown; at 3.6 a rosette blooms in its slot
//                    u 6.0-8.0   the picker takes the rosette and loads it into a bucket on the lift
//                    u 8.0-~11.3 the bucket climbs, tips over the top and pours it into the top mouth
//   the crank      a figure turns a crank (one turn every 2 s) whose belt drives the sculpture's hub

import { RNG } from '../vendor/paper-fox/core/rng.js';
import { radial } from '../vendor/paper-fox/core/piece.js';
import { mix, shade, rgba, vary } from '../vendor/paper-fox/core/color.js';
import { drawSprites } from '../vendor/paper-fox/core/sprite.js';
import { along } from '../vendor/paper-fox/core/geom.js';
import { clamp, lerp, smoothstep, E } from '../vendor/paper-fox/core/ease.js';
import { LIGHT, PAL, CLAY_MAT, CLAY_EDGE, clayForm, tube, tubeOutline, steps, dot, chaikin } from './kit.js';
import { rosette, drawBead } from './density.js';
import { LOOP, cyc } from './loop-world.js';

const P = PAL, TAU = Math.PI * 2;
const circle = (cx, cy, r, n = 36) => [...Array(n)].map((_, i) => [cx + Math.cos(i / n * TAU) * r, cy + Math.sin(i / n * TAU) * r]);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], add = (a, b) => [a[0] + b[0], a[1] + b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
const len = (a) => Math.hypot(a[0], a[1]), unit = (a) => mul(a, 1 / (len(a) || 1));
const mod = (x, m) => ((x % m) + m) % m;
export const popSpring = (x) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-5.2 * x) * Math.cos(x * 8.2);

// ---------------- the sculpture ----------------
export const C = [960, 470], R = 232, GAP = 62;
const ARM_COLORS = [P.mint, P.pink, P.butter];
const V = [-90, 30, 150].map((a) => [C[0] + Math.cos(a * Math.PI / 180) * R, C[1] + Math.sin(a * Math.PI / 180) * R]);
const qb = (p0, p1, p2, u) => [(1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * p1[0] + u * u * p2[0], (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * p1[1] + u * u * p2[1]];
const width = (u) => 11 + 30 * (1 - u) ** 3;
export const ARMS = V.map((v0, k) => {
  const v1 = V[(k + 1) % 3], mid = mul(add(v0, v1), 0.5), out = unit(sub(mid, C));
  const p1 = add(mid, mul(out, R * 0.14)), p2 = sub(v1, mul(unit(sub(v1, p1)), GAP));
  const pts = [...Array(41)].map((_, i) => qb(v0, p1, p2, i / 40));
  let L = 0; const acc = [0];
  for (let i = 1; i < pts.length; i++) { L += len(sub(pts[i], pts[i - 1])); acc.push(L); }
  return { k, v0, p1, p2, pts, acc, L, next: v1, color: ARM_COLORS[k] };
});
const LOOP_LEN = ARMS.reduce((a, A) => a + A.L + GAP, 0);
// point, tangent and width at s px along arm A
function armAt(A, s) {
  const u = clamp(s / A.L), i = Math.min(39, Math.floor(u * 40)), f = u * 40 - i;
  const p = [lerp(A.pts[i][0], A.pts[i + 1][0], f), lerp(A.pts[i][1], A.pts[i + 1][1], f)];
  return { p, ang: Math.atan2(A.pts[i + 1][1] - A.pts[i][1], A.pts[i + 1][0] - A.pts[i][0]), w: width(u) };
}

function drawArm(g, A) {
  const ws = A.pts.map((_, i) => width(i / 40));
  // the arm, rolled from one piece of clay, flaring at the mouth
  tube(g, A.pts, ws, A.color);
  // pressed rings along the arm, like a coiled pot
  for (let s = 40; s < A.L - 20; s += 34) {
    const { p, ang, w } = armAt(A, s), n = [-Math.sin(ang), Math.cos(ang)];
    g.strokeStyle = rgba(shade(A.color, -0.28), 0.35); g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(p[0] + n[0] * w * 0.9, p[1] + n[1] * w * 0.9); g.quadraticCurveTo(p[0] + Math.cos(ang) * 4, p[1] + Math.sin(ang) * 4, p[0] - n[0] * w * 0.9, p[1] - n[1] * w * 0.9); g.stroke();
  }
  // the mouth: a thick lip around a dark opening, set across the arm's start
  const { ang } = armAt(A, 2), n = [-Math.sin(ang), Math.cos(ang)], w0 = width(0) + 4;
  const lip = [...Array(40)].map((_, i) => { const a = i / 40 * TAU; return add(A.v0, add(mul(n, Math.cos(a) * w0), mul([Math.cos(ang), Math.sin(ang)], Math.sin(a) * w0 * 0.42))); });
  clayForm(g, lip, shade(A.color, 0.08), { size: 30, sheen: 0.25 });
  const hole = lip.map((q) => add(A.v0, mul(sub(q, A.v0), 0.72)));
  g.fillStyle = radial(g, A.v0[0], A.v0[1], 2, w0, [shade(A.color, -0.7), shade(A.color, -0.45)]);
  g.beginPath(); hole.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); g.fill();
  // the spout's lip
  const e = armAt(A, A.L);
  clayForm(g, circle(e.p[0], e.p[1], e.w + 3, 28), shade(A.color, 0.1), { size: 14, sheen: 0.2 });
  dot(g, e.p[0], e.p[1], e.w * 0.55, shade(A.color, -0.6));
}

// the spigot under the bottom arm, and the hub the crank belt drives
const BOTTOM = ARMS[1];
export const SPIGOT = (() => { const { p, w } = armAt(BOTTOM, BOTTOM.L * 0.48); return { top: add(p, [0, w * 0.6]), tip: add(p, [0, w + 36]) }; })();
export const HUB = [V[2][0] - 10, V[2][1] + 62];

function drawSculpture(g) {
  // the sculpture floats: no stand. A small pulley under the lower-left corner takes the crank's belt
  tube(g, [HUB, V[2]], 5, P.slate);
  clayForm(g, circle(HUB[0], HUB[1], 15, 30), P.slate, { sheen: 0.25 });
  dot(g, HUB[0], HUB[1], 5, P.butter);
  // the arms, the one whose spout pours into the top mouth last so the overlaps stack in flow order
  for (const A of [ARMS[1], ARMS[2], ARMS[0]]) drawArm(g, A);
  // the spigot: a short pipe with a valve knob
  tube(g, [SPIGOT.top, SPIGOT.tip], 7, P.slate);
  clayForm(g, circle(SPIGOT.tip[0] + 14, SPIGOT.tip[1] - 14, 7, 20), P.butter, { sheen: 0.3 });
  // a core in the middle, held by three spokes, its centre a slow eye of windows
  for (const v of V) tube(g, [C, add(C, mul(sub(v, C), 0.55))], 5, mix(P.bone, P.slate, 0.25));
  clayForm(g, circle(C[0], C[1], 46, 40), P.bone, { sheen: 0.25 });
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; clayForm(g, circle(C[0] + Math.cos(a) * 30, C[1] + Math.sin(a) * 30, 6, 16), i % 2 ? P.mint : P.pink, { sheen: 0.2 }); }
  dot(g, C[0], C[1], 12, P.butter);
}

// ---------------- the piping and the tree ----------------
export const TRACK_Y = SPIGOT.tip[1] + 44;
export const TRACK = { w: 6, path: chaikin([[SPIGOT.tip[0] - 30, TRACK_Y], [1200, TRACK_Y], [1250, TRACK_Y + 30], [1590, TRACK_Y + 30]], 3) };
const TRACK_LEN = TRACK.path.reduce((a, p, i) => i ? a + len(sub(p, TRACK.path[i - 1])) : 0, 0);
export const TREE = { x: 1610, base: 985 };
// every item blooms in the same spot within the picker's reach: one bloom is only ever open at a time
export const SLOTS = [[1566, 888], [1566, 888], [1566, 888]];
const TREE_FIXED = [[1640, 900, 30, P.slate], [1700, 905, 28, P.mintDeep], [1606, 850, 26, mix(P.slate, P.mint, 0.4)], [1666, 846, 24, P.slateDeep]];
function drawTree(g) {
  const rng = new RNG('loop-tree');
  for (let i = 0; i < 4; i++) {
    const y = TREE.base - i * 22, w = 40 - i * 4;
    clayForm(g, [[TREE.x - w / 2, y], [TREE.x - w / 2 + 3, y - 22], [TREE.x + w / 2 - 3, y - 22], [TREE.x + w / 2, y]], vary(i % 2 ? '#8d7a72' : '#a08b80', rng, 0.05), { smooth: false, size: 18 });
  }
  for (const b of [[[TREE.x, 905], [1586, 893], [1570, 888]], [[TREE.x, 900], [1660, 884], [1690, 872]], [[TREE.x, 900], [1612, 862]]]) tube(g, b, [6, 4.5, 3.5].slice(0, b.length), '#8d7a72');
  for (const [x, y, r, c] of TREE_FIXED) rosette(g, x, y, r, c, rng);
}
function drawPiping(g) {
  tube(g, TRACK.path, TRACK.w, P.butter);
  clayForm(g, circle(TRACK.path[0][0], TRACK.path[0][1], 12, 24), P.butter, { sheen: 0.25 });
}

// ---------------- the lift ----------------
export const LIFT = { B: [1336, 952], T: [1160, 236], r: 30 };
const LD = unit(sub(LIFT.T, LIFT.B)), LN = [-LD[1], LD[0]];   // LN points to the right of the upward run
const LL = len(sub(LIFT.T, LIFT.B)), BELT = 2 * LL + TAU * LIFT.r, BV = (BELT / 2) / 4, P_LOAD = 46;
// belt position p (0 at the bottom of the rising right-hand run) -> point, outward normal, bucket rotation
function beltAt(p) {
  p = mod(p, BELT);
  const { B, T, r } = LIFT, a0 = Math.atan2(LN[1], LN[0]);
  if (p < LL) return { q: add(add(B, mul(LN, r)), mul(LD, p)), out: LN, rot: 0 };
  p -= LL;
  if (p < Math.PI * r) { const a = a0 - p / r; const out = [Math.cos(a), Math.sin(a)]; return { q: add(T, mul(out, r)), out, rot: -p / r }; }
  p -= Math.PI * r;
  if (p < LL) return { q: sub(add(T, mul(LN, -r)), mul(LD, p)), out: mul(LN, -1), rot: -Math.PI };
  p -= LL;
  const a = a0 + Math.PI - p / r, out = [Math.cos(a), Math.sin(a)];
  return { q: add(B, mul(out, r)), out, rot: -Math.PI - p / r };
}
// bucket j's belt position at time t: a bucket is at the loading point at every t = 0 mod 4
const bucketP = (t, j) => P_LOAD + BV * t + j * BELT / 2;
const T_TIP = (LL - P_LOAD) / BV;                        // seconds from loading to the start of the top turn
function drawLiftFrame(g) {
  const { B, T, r } = LIFT;
  // two posts and the pulleys
  tube(g, [add(B, [0, 0]), [B[0], 985]], 6, P.slateDeep);
  for (const c of [B, T]) { clayForm(g, circle(c[0], c[1], r + 6, 32), P.slate, { sheen: 0.25 }); dot(g, c[0], c[1], 7, P.butter); }
}
function drawBucket(g) {
  // a little clay cup, open at the top, origin at its rim centre
  clayForm(g, [[-15, -2], [15, -2], [11, 20], [-11, 20]], P.aqua, { size: 18, sheen: 0.22 });
  clayForm(g, [[-17, -5], [17, -5], [17, 1], [-17, 1]], shade(P.aqua, 0.1), { smooth: false, size: 6 });
}

// ---------------- the crank ----------------
export const CRANK = { c: [672, 905], r: 16 };
export const crankAngle = (t) => TAU * t / 2;

export function addMachine(S) {
  const sp = (name, box, draw, o = {}) => S.sprite({ name, ...box, res: o.res ?? 1.25, mat: CLAY_MAT, edge: CLAY_EDGE, shadow: { blur: o.blur ?? 18 }, draw });
  const sculpt = sp('sculpture', { x: C[0] - R - 120, y: C[1] - R - 90, w: (R + 120) * 2, h: R * 2 + 220 }, drawSculpture, { blur: 22 });
  const lumps = ARMS.map((A) => sp(`lump-${A.k}`, { x: -26, y: -26, w: 52, h: 52 }, (g) => clayForm(g, circle(0, 0, 20, 32), shade(A.color, 0.05), { sheen: 0.3 }), { blur: 6 }));
  const beads = [P.mint, P.pink, P.butter, P.lilac, P.aqua, P.pinkDeep, '#c6d957'].map((c, i) => sp(`lbead-${i}`, { x: -20, y: -20, w: 40, h: 40 }, (g) => drawBead(g, c), { res: 1.5, blur: 8 }));
  const tree = sp('tree', { x: 1460, y: 800, w: 300, h: 200 }, drawTree);
  const blooms = SLOTS.map(([x, y], i) => sp(`bloom-${i}`, { x: x - 50, y: y - 50, w: 100, h: 100 }, (g) => rosette(g, x, y, 28, [P.mint, P.pink, P.butter][i], new RNG(`bloom-${i}`)), { blur: 10 }));
  const piping = sp('piping', { x: 900, y: TRACK_Y - 40, w: 760, h: 120 }, drawPiping);
  const liftFrame = sp('lift', { x: 1000, y: 160, w: 380, h: 840 }, drawLiftFrame);
  const bucket = sp('bucket', { x: -24, y: -12, w: 48, h: 40 }, drawBucket, { res: 1.5, blur: 8 });
  const crank = sp('crank', { x: 600, y: 860, w: 140, h: 140 }, (g) => {
    tube(g, [[CRANK.c[0], CRANK.c[1]], [CRANK.c[0] - 8, 985]], 6, P.slateDeep);
    tube(g, [[CRANK.c[0], CRANK.c[1]], [CRANK.c[0] + 10, 985]], 6, P.slateDeep);
    clayForm(g, circle(CRANK.c[0], CRANK.c[1], CRANK.r + 6, 36), P.butter, { sheen: 0.25 });
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; dot(g, CRANK.c[0] + Math.cos(a) * CRANK.r * 0.62, CRANK.c[1] + Math.sin(a) * CRANK.r * 0.62, 4, P.butterDeep); }
  });
  const handle = sp('handle', { x: -12, y: -12, w: 24, h: 24 }, (g) => clayForm(g, circle(0, 0, 7, 20), P.pinkDeep, { sheen: 0.3 }), { res: 1.5, blur: 6 });

  // the tree, its blooms, and the piping with the beads rolling on it
  S.add({ name: 'tree', z: 1030, shadow: { dx: 9, dy: 15, alpha: 0.4 }, render(ctx, t, env) {
    const items = [{ s: tree }];
    SLOTS.forEach(([x, y], i) => {
      const u = mod(t - 4 * i, LOOP);
      if (u < 3.6 || u >= 6.4) return;
      const k = popSpring((u - 3.6) / 0.9);
      items.push({ s: blooms[i], ax: x, ay: y, x, y, sx: 0.15 + 0.85 * k, sy: 0.15 + 0.85 * k, rot: -0.7 * (1 - k) });
    });
    drawSprites(ctx, items, env.shadow);
  } });
  S.add({ name: 'piping', z: 1015, shadow: { dx: 8, dy: 14, alpha: 0.42 }, render(ctx, t, env) {
    const items = [{ s: piping }];
    for (let i = 0; i < 3; i++) {
      const u = mod(t - 4 * i, LOOP), b = beads[i * 2];
      if (u < 0.4) { const f = E.in(u / 0.4); items.push({ s: b, x: SPIGOT.tip[0], y: lerp(SPIGOT.tip[1] + 4, TRACK_Y - TRACK.w - 13, f), rot: 0 }); }
      else if (u < 3.2) {
        const s = TRACK_LEN * E.smooth((u - 0.4) / 2.8), { p, ang } = along(TRACK.path, s / TRACK_LEN), d = TRACK.w + 13;
        items.push({ s: b, x: p[0] + Math.sin(ang) * d, y: p[1] - Math.cos(ang) * d, rot: s / 13 });
      } else if (u < 3.6) {
        const f = (u - 3.2) / 0.4, e = TRACK.path[TRACK.path.length - 1];
        items.push({ s: b, x: lerp(e[0] + 4, SLOTS[i][0], f), y: lerp(e[1] - 19, SLOTS[i][1], E.in(f)) - 30 * Math.sin(Math.PI * f), rot: 9 + f * 3, alpha: 1 - smoothstep(0.75, 1, f) });
      }
    }
    drawSprites(ctx, items, { ...env.shadow, dx: 4, dy: 7 });
  } });

  // the lift: frame, belt, buckets, and the bloom each bucket carries up and pours into the top mouth
  S.add({ name: 'lift', z: 995, shadow: { dx: 8, dy: 14, alpha: 0.4 }, render(ctx, t, env) {
    drawSprites(ctx, [{ s: liftFrame }], env.shadow);
    // the belt: a cord with bead marks that move with it
    ctx.save();
    ctx.strokeStyle = shade(P.slateDeep, -0.1); ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); for (let p = 0; p <= BELT; p += 8) { const { q } = beltAt(p); p ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); } ctx.closePath(); ctx.stroke();
    // marks spaced an even fraction of the belt, so the 1.5 belt-turns in a loop land them back on their places
    const MS = BELT / (2 * Math.round(BELT / 52));
    for (let p = mod(BV * t, MS); p < BELT; p += MS) { const { q } = beltAt(p); ctx.fillStyle = P.mint; ctx.beginPath(); ctx.arc(q[0], q[1], 3, 0, TAU); ctx.fill(); }
    ctx.restore();
    const items = [];
    for (let j = 0; j < 2; j++) {
      const { q, out, rot } = beltAt(bucketP(t, j)), at = add(q, mul(out, 14));
      items.push({ s: bucket, x: at[0], y: at[1], rot });
    }
    drawSprites(ctx, items, env.shadow);
    // blooms riding in buckets, then pouring into the top mouth
    const ride = [];
    for (let i = 0; i < 3; i++) {
      const u = mod(t - 4 * i, LOOP), since = u - 8.0;
      if (since < 0) continue;
      const j = mod(Math.round((t - since) / 4), 2), tipAt = T_TIP + 0.25;
      if (since < tipAt) {
        const { q, out, rot } = beltAt(bucketP(t, j)), at = add(add(q, mul(out, 14)), [Math.sin(rot) * 6, -Math.cos(rot) * 6]);
        ride.push({ s: blooms[i], ax: SLOTS[i][0], ay: SLOTS[i][1], x: at[0], y: at[1], sx: 0.5, sy: 0.5, rot });
      } else if (since < tipAt + 0.5) {
        const f = (since - tipAt) / 0.5, { q, out } = beltAt(LL + BV * 0.25), from = add(q, mul(out, 20)), to = add(V[0], [0, 6]);
        ride.push({ s: blooms[i], ax: SLOTS[i][0], ay: SLOTS[i][1], x: lerp(from[0], to[0], f), y: lerp(from[1], to[1], E.in(f)) - 40 * Math.sin(Math.PI * f), sx: 0.5 * (1 - 0.6 * f), sy: 0.5 * (1 - 0.6 * f), rot: -2 - f * 2, alpha: 1 - smoothstep(0.8, 1, f) });
      }
    }
    drawSprites(ctx, ride, { ...env.shadow, dx: 4, dy: 7 });
  } });

  // the sculpture breathes; beads swell along its arms and hop the gaps between spout and mouth
  S.add({ name: 'sculpture', z: 1000, shadow: { dx: 10, dy: 18, alpha: 0.42 }, anim: (t) => ({ sx: 1 + 0.012 * cyc(t, 3), sy: 1 + 0.012 * cyc(t, 3), ox: C[0], oy: C[1] }), render(ctx, t, env) {
    drawSprites(ctx, [{ s: sculpt }], env.shadow);
    const N = 15, s0 = (LOOP_LEN / 6) * t, swell = [], fly = [];
    for (let n = 0; n < N; n++) {
      let s = mod(s0 + n * LOOP_LEN / N, LOOP_LEN);
      for (const A of ARMS) {
        if (s < A.L) {
          const { p, ang, w } = armAt(A, s);
          swell.push({ s: lumps[A.k], x: p[0], y: p[1], rot: ang, sx: 1.5 * w / 20 * 1.05, sy: w / 20 * 1.12, alpha: smoothstep(0, 30, s) * smoothstep(A.L, A.L - 30, s) * 0.9 });
          break;
        }
        s -= A.L;
        if (s < GAP) {
          const f = s / GAP, e = armAt(A, A.L).p;
          fly.push({ s: beads[n % beads.length], x: lerp(e[0], A.next[0], f), y: lerp(e[1], A.next[1], f) - 18 * Math.sin(Math.PI * f), rot: f * 4, sx: 0.8, sy: 0.8 });
          break;
        }
        s -= GAP;
      }
    }
    drawSprites(ctx, swell, { ...env.shadow, alpha: 0 });
    drawSprites(ctx, fly, { ...env.shadow, dx: 4, dy: 7 });
  } });

  // the crank, its turning handle, and the belt from it to the sculpture's hub
  S.add({ name: 'crank', z: 990, shadow: { dx: 8, dy: 14, alpha: 0.42 }, render(ctx, t, env) {
    const a = crankAngle(t), h = add(CRANK.c, [Math.cos(a) * CRANK.r, Math.sin(a) * CRANK.r]);
    ctx.save();
    ctx.strokeStyle = shade(P.slateDeep, -0.1); ctx.lineWidth = 3.5;
    const ang = Math.atan2(HUB[1] - CRANK.c[1], HUB[0] - CRANK.c[0]), n = [-Math.sin(ang), Math.cos(ang)];
    for (const sgn of [1, -1]) { ctx.beginPath(); ctx.moveTo(CRANK.c[0] + n[0] * 16 * sgn, CRANK.c[1] + n[1] * 16 * sgn); ctx.lineTo(HUB[0] + n[0] * 9 * sgn, HUB[1] + n[1] * 9 * sgn); ctx.stroke(); }
    const d = len(sub(HUB, CRANK.c));
    for (let k = mod(t * 110, 22); k < d; k += 22) for (const sgn of [1, -1]) {   // 110 px/s: 60 marks a loop
      const kk = sgn > 0 ? k : d - k, q = add(add(CRANK.c, mul(unit(sub(HUB, CRANK.c)), kk)), mul(n, (16 + (9 - 16) * kk / d) * sgn));
      ctx.fillStyle = P.butter; ctx.beginPath(); ctx.arc(q[0], q[1], 2.6, 0, TAU); ctx.fill();
    }
    ctx.restore();
    drawSprites(ctx, [{ s: crank }, { s: handle, x: h[0], y: h[1] }], env.shadow);
  } });

  return { V, ARMS, blooms };
}

// where the picker loads: the bucket's position on the rising run at the loading point
export const LOAD_AT = (() => { const { q, out } = beltAt(P_LOAD); return add(q, mul(out, 14)); })();

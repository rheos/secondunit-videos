// 207.64-215.4  "In her dream her & her kids are playing for the same team"
// Street hockey on green paper, staged with depth: she and boy8 near, girl11 and girl3 further up the
// street, a big cream net on the right. Athletic crouch, short sticks, blade just ahead of the front foot.
// "In her dream": a gold ball drops in and bounces to her stick. "her & her kids": she taps it, the kids
// slap their sticks down one, two, three, calling for it. "playing": the ball zigzags stick to stick on the
// beat; each player turns toward the one they pass to. "same": all four face the middle and tap together,
// a huddle. "team": the smallest one shoots, it's in, a big gold ring, everyone jumps, sticks overhead.
// Colours: navy (family), cream (sticks, net, chalk), gold (ball, rings). Ground: leaf paper street.
(() => {
const T = { drop: 208.2, her: 209.03, kids: [209.25, 209.47, 209.69], same: 212.83, shot: 213.3, team: 213.65,
  clink: 214.27, pop: 214.27, apex: 214.95, push0: 214.95, push1: 215.33, end: 215.4 };
// passes on the beat: from -> to, strike, arrive
const PASS = [{ f: 0, to: 1, s: 210.75, a: 211.22 }, { f: 1, to: 2, s: 211.66, a: 212.05 }, { f: 2, to: 3, s: 212.42, a: 212.8 }];
// x1: where each one lands after the leap on "team" (they gather under the ball)
const TEAM = [
  { spec: CAST.her, x: 300, x1: 560, y: 940, s: .62, face: [[0, 1]] },
  { spec: CAST.girl11, x: 760, x1: 715, y: 812, s: .52, face: [[0, -1], [211.42, 1], [213.7, -1]] },
  { spec: CAST.boy8, x: 1000, x1: 905, y: 965, s: .62, face: [[0, -1], [212.22, 1], [212.66, -1]] },
  { spec: CAST.girl3, x: 1215, x1: 1030, y: 818, s: .52, face: [[0, -1], [212.98, 1], [213.8, -1]] },
];
const NET = { x: 1440, top: 560, base: 945, backTop: { x: 1700, y: 600 }, backBot: { x: 1790, y: 945 } };
const TURN = .09;
// the toast: everyone's stick aims through TP; the ball hangs at APEX above it, then becomes 14's coin
const TP = { x: 800, y: 345 }, APEX = { x: 805, y: 215 }, R_APEX = 30, COIN = { x: 960, y: 500, r: 70 };
// street papers: dusk green-grey under the lamps
const PAL = { sky0: '#222f36', sky1: '#41544f', back: '#33433f', house: '#6c8174', stoop: '#56695e', pave: '#87998c',
  street: '#5a6e62', winDark: '#2b3935' };
const HB = 760;                                   // house base / back of the pavement
const HOUSES = [...Array(6).keys()].map((i) => ({ x: -90 + i * 380, w: 360, h: 430 + (i % 3) * 36, seed: i * 13 + 2 }));
const BACKS = [...Array(8).keys()].map((i) => ({ x: -200 + i * 300, w: 280, h: 470 + hash(i * 3.3) * 160, seed: i * 7 + 50, gable: i % 3 === 1 }));

// ---- local FK / IK (the kit has no hand-position helper) ----
const DEG = 180 / Math.PI;
function rootM(x, y, s, dir, spec, pose) {
  const h = spec.height || 1;
  return new DOMMatrix().translateSelf(x, y + (pose.bob || 0) * s).scaleSelf(s * h * dir, s * h).rotateSelf((pose.lean || 0) * DEG);
}
const armRoot = (M, near) => M.multiply(new DOMMatrix().translateSelf(near ? 8 : -8, -752));
function ik(M, near, P) {
  const L1 = 168, L2 = 190;
  const q = armRoot(M, near).inverse().transformPoint(new DOMPoint(P.x, P.y));
  let d = clamp(Math.hypot(q.x, q.y), 40, L1 + L2 - .5);
  const a1 = Math.atan2(q.x, q.y) - Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  return [a1, Math.atan2(q.x - L1 * Math.sin(a1), q.y - L1 * Math.cos(a1)) - a1];
}
const mixP = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });
function footDrop(legs, h) {
  const y = (l) => 266 * Math.cos(l[0]) + 250 * Math.cos(l[1] - l[0]);
  return (516 - Math.max(y(legs[0]), y(legs[1]))) * h;
}
// facing: +1 right, -1 left; a turn squashes the paper through edge-on (never quite 0)
function facing(p, t) {
  let d = p.face[0][1];
  for (let k = 1; k < p.face.length; k++) {
    const [tk, dk] = p.face[k], prev = p.face[k - 1][1];
    if (t >= tk) d = dk; else if (t > tk - TURN) { const c = Math.cos(Math.PI * (t - (tk - TURN)) / TURN); d = prev * c; if (Math.abs(d) < .45) d = (c > 0 ? prev : dk) * .45; }
  }
  return d;
}
const turnHop = (p, t) => p.face.slice(1).reduce((a, [tk]) => Math.max(a, bump(t, tk - TURN - .04, TURN + .12)), 0);

// the stick in the player's ground frame (units; +x forward, y up negative, feet at 0):
// butt U (top hand) at the hip, heel B just ahead of the front foot; about 0.5 of her height long
const U0 = { x: 185, y: -465 }, B0 = { x: 365, y: -12 };
const L0 = Math.hypot(B0.x - U0.x, B0.y - U0.y), TH0 = Math.atan2(B0.x - U0.x, B0.y - U0.y);
const BALL_X = 500;   // where the ball sits, at the blade's toe

// a straight paper strip a -> b, width w, rounded ends
function strip(a, b, w) {
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || .1;
  const p = new Path2D(); const ang = Math.atan2(dy, dx), nx = -dy / L * w / 2, ny = dx / L * w / 2;
  p.moveTo(a.x + nx, a.y + ny); p.lineTo(b.x + nx, b.y + ny); p.arc(b.x, b.y, w / 2, ang + Math.PI / 2, ang - Math.PI / 2, true);
  p.lineTo(a.x - nx, a.y - ny); p.arc(a.x, a.y, w / 2, ang - Math.PI / 2, ang + Math.PI / 2, true); p.closePath(); return p;
}
// ---- the street behind the pitch (the rowhouse drawing from 10, recoloured; a local copy) ----
function stoop(dx) {
  for (let s = 0; s < 3; s++) cut(cutRect(dx - 70 + s * 10, HB - 32 - s * 30, 140 - s * 20, 34, 71 + s + dx, 1.5), PAL.stoop, { sh: .6, grain: .2 });
  for (const sx of [-78, 78]) cut(strip({ x: dx + sx, y: HB - 10 }, { x: dx + sx * .8, y: HB - 130 }, 7), C.ink, { sh: .4, grain: .1 });
}
function street(t) {
  g.save(); const gr = g.createLinearGradient(0, -200, 0, HB); gr.addColorStop(0, PAL.sky0); gr.addColorStop(1, PAL.sky1);
  g.fillStyle = gr; g.fillRect(-400, -400, W + 800, HB + 400); g.restore();
  BACKS.forEach((b) => {
    const y = HB - 120, top = y - b.h;
    const body = b.gable ? poly([[b.x, y], [b.x, top], [b.x + b.w / 2, top - b.w * .3], [b.x + b.w, top], [b.x + b.w, y]]) : cutRect(b.x, top, b.w, b.h, b.seed);
    cut(body, PAL.back, { sh: .5, grain: .22 });
    if (!b.gable) cut(cutRect(b.x + b.w * .7, top - 46, 34, 50, b.seed + 3), PAL.back, { sh: .4, grain: .2 });
    for (let w = 0; w < 2; w++) if (hash(b.seed + w * 9) > .62) cut(rect(b.x + 50 + w * (b.w - 140), top + 50, 40, 54), C.goldPale, { sh: 0, grain: .2, alpha: .7 });
  });
  HOUSES.forEach((hs) => { house(hs.x, HB, hs.w, hs.h, PAL.house, { lit: .62, seed: hs.seed, door: true, darkWin: PAL.winDark, winCol: C.goldPale });
    stoop(hs.x + hs.w / 3 / 2); });
  cut(cutRect(-400, HB - 6, W + 800, 40, 91, 2), PAL.pave, { sh: .6, lift: .2 });
  cut(cutRect(-400, HB + 30, W + 800, H, 92, 3), PAL.street, { sh: .7, lift: .2 });
  for (const lx of [118, 1610]) streetLamp(lx, HB + 24, 520, 1);
  // painted markings, cut as paper: a line well below everyone's feet, the crease in front of the net
  cut(cutRect(-400, 1024, W + 800, 14, 72, 2), C.cream, { sh: .35, grain: .2, alpha: .85 });
  const cr = new Path2D(); cr.ellipse(NET.x + 60, NET.base, 236, 56, 0, Math.PI * .5, Math.PI * 1.5); cr.ellipse(NET.x + 60, NET.base, 220, 44, 0, Math.PI * 1.5, Math.PI * .5, true); cr.closePath();
  cut(cr, C.cream, { sh: .35, grain: .2, alpha: .85 });
}
// the net: punched paper, a cream sheet with a grid of holes, stretched front post -> back frame
function netSheet(bt, bb, bulge) {
  const Pt = (u, v) => {
    const top = { x: lerp(NET.x, bt.x, u), y: lerp(NET.top, bt.y, u) }, bot = { x: lerp(NET.x, bb.x, u), y: lerp(NET.base, bb.y, u) };
    return { x: lerp(top.x, bot.x, v) + bulge * 34 * Math.sin(u * Math.PI) * Math.sin(v * Math.PI), y: lerp(top.y, bot.y, v) };
  };
  const p = new Path2D(); const q = [Pt(0, 0), Pt(1, 0), Pt(1, 1), Pt(0, 1)];
  p.moveTo(q[0].x, q[0].y); q.slice(1).forEach((c) => p.lineTo(c.x, c.y)); p.closePath();
  const nu = 9, nv = 11, m = .2;
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const u0 = (i + m) / nu, u1 = (i + 1 - m) / nu, v0 = (j + m) / nv, v1 = (j + 1 - m) / nv;
    const c = [Pt(u0, v0), Pt(u1, v0), Pt(u1, v1), Pt(u0, v1)];
    p.moveTo(c[0].x, c[0].y); c.slice(1).forEach((d) => p.lineTo(d.x, d.y)); p.closePath();
  }
  cut(p, C.cream, { sh: .45, grain: .2, rule: 'evenodd' });
}

SHOT(207.64, T.end, 'team', (t) => {
  // ---- the camera: still, then on the last beats a push in on the ball until it is 14's coin ----
  const push = eio(ss(T.push0, T.push1, t));
  const Zs = lerp(1, COIN.r / R_APEX, push), Sx = lerp(APEX.x, COIN.x, push), Sy = lerp(APEX.y, COIN.y, push);
  sheet(PAL.sky0);
  g.save(); g.translate(Sx, Sy); g.scale(Zs, Zs); g.translate(-APEX.x, -APEX.y);
  street(t);

  const cheer = ss(T.team, T.team + .18, t);
  const leap = eio(ss(T.team, T.team + .5, t));
  // a springy hop on "team" (back() up, then down), a small one again on the clink
  const hop = pop(t, T.team, .3) * (1 - ss(T.team + .3, T.team + .52, t)) + bump(t, T.clink - .05, .3) * .35;
  const look = ss(T.pop, T.pop + .4, t);

  // ---- each player's state: facing, pose, stick ----
  const allTap = bump(t, T.same - .12, .3);
  const S = TEAM.map((p, i) => {
    const h = p.spec.height || 1, ks = p.s * h;
    const dir = facing(p, t);
    const sgn = Math.sign(dir);
    const px = lerp(p.x, p.x1, leap);
    // athletic crouch, weight on the front foot; little shuffles between plays
    const sh = Math.sin(t * 6.4 + i * 1.9) * (1 - cheer);
    const tuck = clamp(hop);
    const legs = [[.32 + .06 * sh + .35 * tuck, .68 * (1 - cheer) + .1 + .8 * tuck], [-.2 + .06 * sh + .25 * tuck, .28 * (1 - cheer) + .06 + .7 * tuck]];
    const pose = { legs, lean: .2 * (1 - cheer) - .05 * cheer, head: .03 * Math.sin(t * 2 + i) + .14 * cheer + .3 * look, laugh: cheer * .7 };
    pose.bob = footDrop(legs, h) - hop * (170 + i * 12) - turnHop(p, t) * 40;
    const toW = (q) => ({ x: px + dir * ks * q.x, y: p.y + ks * q.y });
    const toL = (q) => ({ x: (q.x - px) / (dir * ks), y: (q.y - p.y) / ks });
    // swings about the top hand: a < 0 winds the blade back and up, a > 0 follows through
    let a = 0;
    const strike = (ts, amt = 1) => {
      const w = ss(ts - .34, ts - .08, t) * (1 - ss(ts - .08, ts, t)), f = bump(t, ts - .02, .42);
      a += (-1.0 * w + .7 * f) * amt;
    };
    PASS.forEach((ps) => { if (ps.f === i) strike(ps.s); });
    if (i === 3) strike(T.shot, 1.2);
    // taps: hers on "her", the kids' call one-two-three, everyone on "same", each receiver calling for it
    const taps = [allTap, i === 0 ? bump(t, T.her - .12, .28) * .7 : bump(t, T.kids[i - 1] - .12, .28)];
    PASS.forEach((ps) => { if (ps.to === i) taps.push(bump(t, ps.s - .25, .3)); });
    a += Math.max(...taps) * .38 * (1 - cheer);
    let U = { ...U0 };
    const th = TH0 + a;
    let B = { x: U.x + Math.sin(th) * L0, y: U.y + Math.cos(th) * L0 };
    if (B.y > -10) { U.y -= B.y + 10; B.y = -10; }                       // never through the street
    // after the goal: one hand (the far one, behind the head) thrusts the stick up, aimed through the toast point
    const M0 = rootM(px, p.y, p.s, dir, p.spec, pose);
    const shoW = armRoot(M0, false).transformPoint(new DOMPoint(0, 0));
    const dx = TP.x - shoW.x, dy = TP.y - shoW.y, dd = Math.hypot(dx, dy), ux = dx / dd, uy = dy / dd;
    const reach = Math.min(330 * ks, dd - 40);
    const hand = { x: shoW.x + ux * reach, y: shoW.y + uy * reach }, Lw = L0 * ks;
    const Uc = toL({ x: hand.x - ux * .3 * Lw, y: hand.y - uy * .3 * Lw }), Bc = toL({ x: hand.x + ux * .7 * Lw, y: hand.y + uy * .7 * Lw });
    U = mixP(U, Uc, cheer); B = mixP(B, Bc, cheer);
    const lowHand = mixP(U, B, lerp(.44, .3, cheer));
    const topHand = mixP(mixP(U, B, .03), toL(M0.transformPoint(new DOMPoint(70, -430))), cheer);
    pose.arms = [ik(M0, true, toW(topHand)), ik(M0, false, toW(lowHand))];
    const shaftAng = Math.atan2(B.x - U.x, B.y - U.y) - TH0;              // how far the shaft has turned
    return { p, i, dir, sgn, ks, px, pose, U, B, shaftAng, toW, ball: toW({ x: BALL_X, y: 0 }) };
  });
  const ballR = (y) => lerp(15, 21, clamp((y - 800) / 165));

  // ---- the ball ----
  let ball = null;
  const spot = (i) => { const b = S[i].ball; return { x: b.x, y: b.y - ballR(b.y) }; };
  const G = { x: NET.x + 150, y: NET.base - 90 };
  if (t >= T.drop && t < PASS[0].s) {
    const d = t - T.drop, Bp = spot(0);
    const bounce = Math.abs(Math.cos(d * 7.2)) * Math.exp(-d * 3.4) * 520;
    const tap = bump(t, T.her, .32) * 60 + bump(t, T.her + .4, .3) * 30;
    ball = { x: Bp.x, y: Bp.y - bounce - tap };
  } else if (t >= PASS[0].s && t < T.shot) {
    for (let k = 0; k < PASS.length; k++) {
      const ps = PASS[k], next = PASS[k + 1] ? PASS[k + 1].s : T.shot;
      if (t < ps.s || t >= next) continue;
      if (t < ps.a) ball = mixP(spot(ps.f), spot(ps.to), eo((t - ps.s) / (ps.a - ps.s)));
      else ball = spot(ps.to);
    }
  } else if (t >= T.shot && t < T.pop) {
    if (t < T.team) {
      const A = spot(3), s = clamp((t - T.shot) / (T.team - T.shot));
      ball = { x: lerp(A.x, G.x, eo(s)), y: lerp(A.y, G.y, s) - Math.sin(s * Math.PI) * 110 };
    } else { const d = t - T.team; ball = { x: G.x + 40 * (1 - Math.exp(-d * 9)), y: G.y + Math.min(70, d * d * 900) }; }
  }
  // after the clink it springs up out of the net and hangs over the crossed sticks
  let flying = null;
  if (t >= T.pop) {
    const k = clamp((t - T.pop) / (T.apex - T.pop)), G2 = { x: G.x + 40, y: G.y + 70 };
    flying = { x: lerp(G2.x, APEX.x, eio(k)), y: lerp(G2.y, APEX.y, eo(k)) - Math.sin(k * Math.PI) * 60, r: lerp(21, R_APEX, eo(k)) };
  }

  // ---- the net (the punched sheet behind the ball; it bulges on the goal) ----
  const bulge = bump(t, T.team, .5);
  const bt = { x: NET.backTop.x + bulge * 40, y: NET.backTop.y }, bb = { x: NET.backBot.x + bulge * 60, y: NET.backBot.y };

  // ---- draw back to front ----
  const drawPlayer = (St) => {
    const { p, i, dir, ks, px, pose, U, B, shaftAng, toW } = St;
    const w = 15;
    const ux = B.x - U.x, uy = B.y - U.y, ln = Math.hypot(ux, uy), nx = -uy / ln * w, ny = ux / ln * w;
    const sh = [U.x + nx, U.y + ny, U.x - nx, U.y - ny, B.x - nx, B.y - ny, B.x + nx, B.y + ny];
    const shaftW = [[0, 1], [2, 3], [4, 5], [6, 7]].map(([a, b]) => { const q = toW({ x: sh[a], y: sh[b] }); return [q.x, q.y]; });
    const ca = Math.cos(shaftAng), sa = Math.sin(shaftAng);
    const blade = [[-8, -10], [100, -16], [132, -32], [140, -16], [116, 16], [-8, 18]].map(([bx, by]) => {
      const q = toW({ x: B.x + bx * ca + by * sa, y: B.y - bx * sa + by * ca }); return [q.x, q.y]; });
    puppet(px, p.y, p.s, dir, p.spec, pose);
    cut(poly(shaftW), C.cream, { sh: .7, lift: .2, grain: .2 });
    cut(blob(blade, .35), C.cream, { sh: .7, lift: .2, grain: .2 });
    const tapAt = [T.same, i === 0 ? T.her : T.kids[i - 1]];
    PASS.forEach((ps) => { if (ps.to === i) tapAt.push(ps.s - .13); });
    const bp = toW({ x: B.x + 60, y: -10 });
    for (const tt of tapAt) ticks(bp.x, bp.y, tt, t, ks * 1.6);
  };
  const order = S.slice().sort((a, b) => a.p.y - b.p.y);
  let netDrawn = false;
  const drawNet = () => {
    cut(strip({ x: NET.x, y: NET.base }, bb, 12), C.cream, { sh: .4, grain: .2 });
    netSheet(bt, bb, bulge);
    // the gold ring on the goal, then the ball inside the net
    laughRings(t, NET.x + 150, NET.base - 150, T.team, { n: 4, dir: 0, spread: Math.PI, reach: 820, life: 1.5, w0: 18 });
    if (ball) cut(circle(ball.x, ball.y, ballR(ball.y + 20)), C.gold, { sh: .8, lift: .4, grain: .15 });
    cut(strip({ x: NET.x, y: NET.top }, bt, 18), C.cream, { sh: .7, lift: .3, grain: .2 });
    cut(strip(bt, bb, 16), C.cream, { sh: .7, lift: .3, grain: .2 });
    cut(cutRect(NET.x - 11, NET.top - 6, 22, NET.base - NET.top + 6, 81, 1.5), C.cream, { sh: .8, lift: .4 });
    netDrawn = true;
  };
  for (const St of order) {
    if (!netDrawn && St.p.y > NET.base) drawNet();
    drawPlayer(St);
  }
  if (!netDrawn) drawNet();
  // the clink: the raised sticks meet like glasses
  const ck = bump(t, T.clink - .04, .45);
  if (ck > 0) { cut(star4(TP.x, TP.y, 44 * ck), C.goldPale, { sh: .2, grain: 0 }); ticks(TP.x, TP.y + 20, T.clink, t, 1.8); }
  g.restore();

  // ---- the flying ball, last and outside the camera so its end state is exact: (960, 500) r 70 ----
  if (flying) {
    const sx = Sx + (flying.x - APEX.x) * Zs, sy = Sy + (flying.y - APEX.y) * Zs;
    cut(circle(sx, sy, flying.r * Zs), C.gold, { sh: .8, lift: .4, grain: .15 });
  }
}, { xin: .6, tr: 'wipe' });

function ticks(x, y, at, t, sc = 1) {
  const k = clamp((t - at) / .3); if (k <= 0 || k >= 1) return;
  for (const a of [-2.2, -1.57, -.94]) { const r0 = 20 + k * 30, r1 = 44 + k * 40;
    cut(strip({ x: x + Math.cos(a) * r0 * sc, y: y + Math.sin(a) * r0 * sc }, { x: x + Math.cos(a) * r1 * sc, y: y + Math.sin(a) * r1 * sc }, 7 * sc), C.gold, { sh: .3, grain: .1, alpha: 1 - k }); }
}
})();

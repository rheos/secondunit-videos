// 207.64-215.4  "In her dream her & her kids are playing for the same team"
// Street hockey on green paper, staged with depth: she and boy8 near, girl11 and girl3 further up the
// street, a big cream net on the right. Athletic crouch, short sticks, blade just ahead of the front foot.
// "In her dream": a gold ball drops in and bounces to her stick. "her & her kids": she taps it, the kids
// slap their sticks down one, two, three, calling for it. "playing": the ball zigzags stick to stick on the
// beat; each player turns toward the one they pass to. "same": all four face the middle and tap together,
// a huddle. "team": the smallest one shoots, it's in, a big gold ring, everyone jumps, sticks overhead.
// Colours: navy (family), cream (sticks, net, chalk), gold (ball, rings). Ground: leaf paper street.
(() => {
const T = { drop: 208.2, her: 209.03, kids: [209.25, 209.47, 209.69], same: 212.83, team: 213.65, goal: 213.98, end: 215.4 };
// passes on the beat: from -> to, strike, arrive
const PASS = [{ f: 0, to: 1, s: 210.75, a: 211.22 }, { f: 1, to: 2, s: 211.66, a: 212.05 }, { f: 2, to: 3, s: 212.42, a: 212.8 }];
const TEAM = [
  { spec: CAST.her, x: 300, y: 940, s: .62, face: [[0, 1]] },
  { spec: CAST.girl11, x: 760, y: 800, s: .52, face: [[0, -1], [211.42, 1]] },
  { spec: CAST.boy8, x: 1000, y: 965, s: .62, face: [[0, -1], [212.22, 1], [212.66, -1]] },
  { spec: CAST.girl3, x: 1215, y: 805, s: .52, face: [[0, -1], [213.22, 1]] },
];
const NET = { x: 1440, top: 560, base: 945, backTop: { x: 1700, y: 600 }, backBot: { x: 1790, y: 945 } };
const TURN = .09;

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

SHOT(207.64, T.end, 'team', (t) => {
  // ---- ground: leaf paper, a tonal roofline, the street ----
  sheet(C.leaf);
  const roof = [[-60, H], [-60, 600]]; let rx = -60;
  for (let i = 0; rx < W + 100; i++) {
    const w = 170 + hash(i * 4.3 + 2) * 160, h = 560 + hash(i * 6.1 + 1) * 80;
    roof.push([rx, h]); if (hash(i + 9) > .5) { const cx = rx + w * .3; roof.push([cx, h], [cx, h - 36], [cx + 30, h - 36], [cx + 30, h]); }
    roof.push([rx + w, h]); rx += w;
  }
  roof.push([rx, H]);
  cut(poly(roof), '#4f8050', { sh: .5, grain: .25 });
  cut(cutRect(-60, 712, W + 120, 420, 71, 4), C.leafDeep, { sh: .7, lift: .2 });
  // chalk: a kerb line, a faint centre circle, a crease in front of the net
  g.save(); g.globalAlpha *= .45;
  cut(cutRect(-60, 724, W + 120, 8, 72, 2), C.cream, { sh: 0, grain: .2 });
  g.strokeStyle = C.cream; g.lineWidth = 8;
  g.beginPath(); g.ellipse(760, 880, 250, 62, 0, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.ellipse(NET.x + 60, NET.base, 230, 52, 0, Math.PI * .5, Math.PI * 1.5); g.stroke();
  g.restore();
  // "same": the centre circle rings gold under the huddle
  for (let r = 0; r < 3; r++) {
    const d = t - T.same - r * .12; if (d < 0 || d > 1.3) continue;
    const kq = d / 1.3; g.save(); g.globalAlpha *= (1 - kq) * .9; g.strokeStyle = r % 2 ? C.goldPale : C.gold; g.lineWidth = lerp(14, 3, kq);
    g.beginPath(); g.ellipse(760, 880, 250 + eo(kq) * 520, 62 + eo(kq) * 130, 0, 0, Math.PI * 2); g.stroke(); g.restore();
  }

  const cheer = ss(T.goal, T.goal + .15, t);
  const jump = Math.max(bump(t, T.goal + .08, .5), bump(t, 214.68, .45) * .7);

  // ---- each player's state: facing, pose, stick ----
  const allTap = bump(t, T.same - .12, .3);
  const P = TEAM.map((p, i) => {
    const h = p.spec.height || 1, ks = p.s * h;
    const dir = facing(p, t);
    const sgn = Math.sign(dir);
    // athletic crouch, weight on the front foot; little shuffles between plays
    const sh = Math.sin(t * 6.4 + i * 1.9) * (1 - cheer);
    const legs = [[.32 + .06 * sh + .3 * jump, .68 + .7 * jump], [-.2 + .06 * sh + .2 * jump, .28 + .6 * jump]];
    const pose = { legs, lean: .2 * (1 - cheer), head: .03 * Math.sin(t * 2 + i) + .22 * cheer, laugh: cheer * .7 };
    pose.bob = footDrop(legs, h) - jump * (110 + i * 10) - turnHop(p, t) * 40;
    const toW = (q) => ({ x: p.x + dir * ks * q.x, y: p.y + ks * q.y });
    // swings about the top hand: a < 0 winds the blade back and up, a > 0 follows through
    let a = 0;
    const strike = (ts, amt = 1) => {
      const w = ss(ts - .34, ts - .08, t) * (1 - ss(ts - .08, ts, t)), f = bump(t, ts - .02, .42);
      a += (-1.0 * w + .7 * f) * amt;
    };
    PASS.forEach((ps) => { if (ps.f === i) strike(ps.s); });
    if (i === 3) strike(T.team, 1.2);
    // taps: hers on "her", the kids' call one-two-three, everyone on "same", each receiver calling for it
    const taps = [allTap, i === 0 ? bump(t, T.her - .12, .28) * .7 : bump(t, T.kids[i - 1] - .12, .28)];
    PASS.forEach((ps) => { if (ps.to === i) taps.push(bump(t, ps.s - .25, .3)); });
    a += Math.max(...taps) * .38;
    let U = { ...U0 };
    const th = TH0 + a;
    let B = { x: U.x + Math.sin(th) * L0, y: U.y + Math.cos(th) * L0 };
    if (B.y > -10) { U.y -= B.y + 10; B.y = -10; }                       // never through the street
    // after the goal: the stick goes up overhead, level, in both hands
    const M0 = rootM(p.x, p.y, p.s, dir, p.spec, pose);
    const sho = armRoot(M0, true).transformPoint(new DOMPoint(0, 0));
    const shoL = { x: (sho.x - p.x) / (dir * ks), y: (sho.y - p.y) / ks };
    const Hup = { x: shoL.x + 70, y: shoL.y - 300 };
    const Uc = { x: Hup.x - .3 * L0, y: Hup.y + 14 }, Bc = { x: Hup.x + .7 * L0, y: Hup.y - 16 };
    U = mixP(U, Uc, cheer); B = mixP(B, Bc, cheer);
    const lowHand = mixP(U, B, lerp(.44, .32, cheer)), topHand = mixP(U, B, lerp(.03, .08, cheer));
    pose.arms = [ik(M0, true, toW(topHand)), ik(M0, false, toW(lowHand))];
    const shaftAng = Math.atan2(B.x - U.x, B.y - U.y) - TH0;              // how far the shaft has turned
    return { p, i, dir, sgn, ks, pose, U, B, shaftAng, toW, ball: toW({ x: BALL_X, y: 0 }) };
  });
  const ballR = (y) => lerp(15, 21, clamp((y - 800) / 165));

  // ---- the ball ----
  let ball = null;
  const spot = (i) => { const b = P[i].ball; return { x: b.x, y: b.y - ballR(b.y) }; };
  if (t >= T.drop && t < PASS[0].s) {
    const d = t - T.drop, B = spot(0);
    const bounce = Math.abs(Math.cos(d * 7.2)) * Math.exp(-d * 3.4) * 520;
    const tap = bump(t, T.her, .32) * 60 + bump(t, T.her + .4, .3) * 30;
    ball = { x: B.x, y: B.y - bounce - tap };
  } else if (t >= PASS[0].s && t < T.team) {
    for (let k = 0; k < PASS.length; k++) {
      const ps = PASS[k], next = PASS[k + 1] ? PASS[k + 1].s : T.team;
      if (t < ps.s || t >= next) continue;
      if (t < ps.a) {
        // travelling: a diagonal from the passer's blade (at the strike) to the receiver's blade
        const kk = eo((t - ps.s) / (ps.a - ps.s)), A = spot(ps.f), Bp = spot(ps.to);
        ball = mixP(A, Bp, kk);
      } else ball = spot(ps.to);
    }
  } else if (t >= T.team) {
    const A = spot(3), G = { x: NET.x + 150, y: NET.base - 90 };
    const s = clamp((t - T.team) / (T.goal - T.team));
    ball = { x: lerp(A.x, G.x, eo(s)), y: lerp(A.y, G.y, s) - Math.sin(s * Math.PI) * 110 };
    if (t > T.goal) { const d = t - T.goal; ball = { x: G.x + 40 * (1 - Math.exp(-d * 9)), y: G.y + Math.min(70, d * d * 900) }; }
  }

  // ---- the net (behind the ball; it bulges on the goal) ----
  const bulge = bump(t, T.goal, .5);
  const bt = { x: NET.backTop.x + bulge * 40, y: NET.backTop.y }, bb = { x: NET.backBot.x + bulge * 60, y: NET.backBot.y };
  const netP = poly([[NET.x, NET.base], [NET.x, NET.top], [bt.x, bt.y], [bb.x, bb.y]]);
  const drawNetMesh = () => {
    g.save(); g.clip(netP); g.strokeStyle = 'rgba(244,234,214,.42)'; g.lineWidth = 3;
    for (let i = 0; i < 16; i++) { const x = NET.x + i * 24; g.beginPath(); g.moveTo(x, NET.top - 10); g.lineTo(x + bulge * 30 * Math.sin(i / 15 * Math.PI), NET.base + 10); g.stroke(); }
    for (let j = 0; j < 17; j++) { const y = NET.top + j * 24; g.beginPath(); g.moveTo(NET.x - 10, y); g.quadraticCurveTo(NET.x + 160, y + bulge * 24, NET.backBot.x + 60, y); g.stroke(); }
    g.restore();
  };

  // ---- draw back to front ----
  const drawPlayer = (S) => {
    const { p, i, dir, ks, pose, U, B, shaftAng, toW } = S;
    // the shaft
    const w = 11;
    const ux = B.x - U.x, uy = B.y - U.y, ln = Math.hypot(ux, uy), nx = -uy / ln * w, ny = ux / ln * w;
    const sh = [U.x + nx, U.y + ny, U.x - nx, U.y - ny, B.x - nx, B.y - ny, B.x + nx, B.y + ny];
    const shaftW = [[0, 1], [2, 3], [4, 5], [6, 7]].map(([a, b]) => { const q = toW({ x: sh[a], y: sh[b] }); return [q.x, q.y]; });
    // the blade: short, angled up a touch at the toe, turning with the shaft
    const ca = Math.cos(shaftAng), sa = Math.sin(shaftAng);
    const blade = [[-8, -6], [96, -12], [126, -26], [132, -14], [110, 12], [-8, 14]].map(([bx, by]) => {
      const q = toW({ x: B.x + bx * ca + by * sa, y: B.y - bx * sa + by * ca }); return [q.x, q.y]; });
    puppet(p.x, p.y, p.s, dir, p.spec, pose);
    cut(poly(shaftW), C.cream, { sh: .6, grain: .2 });
    cut(blob(blade, .35), C.cream, { sh: .6, grain: .2 });
    const tapAt = [T.same, i === 0 ? T.her : T.kids[i - 1]];
    PASS.forEach((ps) => { if (ps.to === i) tapAt.push(ps.s - .13); });
    const bp = toW({ x: B.x + 60, y: -10 });
    for (const tt of tapAt) ticks(bp.x, bp.y, tt, t, ks * 1.6);
  };
  const order = P.slice().sort((a, b) => a.p.y - b.p.y);
  let netDrawn = false;
  for (const S of order) {
    if (!netDrawn && S.p.y > NET.base) { drawNetMesh(); netDrawn = true; }
    drawPlayer(S);
  }
  if (!netDrawn) drawNetMesh();

  // ---- the big gold ring on the goal ----
  laughRings(t, NET.x + 150, NET.base - 150, T.goal, { n: 4, dir: 0, spread: Math.PI, reach: 950, life: 1.7, w0: 18 });
  // ---- the ball, then the net's frame in front of it ----
  if (ball) cut(circle(ball.x, ball.y, ballR(ball.y + 20)), C.gold, { sh: .8, lift: .4, grain: .15 });
  cut(cutRect(NET.x - 9, NET.top, 18, NET.base - NET.top, 81, 1.5), C.cream, { sh: .7, lift: .3 });
  g.save(); g.strokeStyle = C.cream; g.lineWidth = 16; g.lineCap = 'round'; g.lineJoin = 'round';
  g.shadowColor = 'rgba(20,16,30,.3)'; g.shadowBlur = 12; g.shadowOffsetX = 5; g.shadowOffsetY = 8;
  g.beginPath(); g.moveTo(NET.x, NET.top); g.lineTo(bt.x, bt.y); g.lineTo(bb.x, bb.y); g.stroke(); g.restore();
}, { xin: .6, tr: 'wipe' });

function ticks(x, y, at, t, sc = 1) {
  const k = clamp((t - at) / .3); if (k <= 0 || k >= 1) return;
  g.save(); g.globalAlpha *= 1 - k; g.strokeStyle = C.gold; g.lineWidth = 6 * sc; g.lineCap = 'round';
  for (const a of [-2.2, -1.57, -.94]) { const r0 = 20 + k * 30, r1 = 44 + k * 40;
    g.beginPath(); g.moveTo(x + Math.cos(a) * r0 * sc, y + Math.sin(a) * r0 * sc); g.lineTo(x + Math.cos(a) * r1 * sc, y + Math.sin(a) * r1 * sc); g.stroke(); }
  g.restore();
}
})();

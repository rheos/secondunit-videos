// 177.64-190.7  "In her dream the wallet she lost is returned and she stamps her feet"
// A frieze of strangers cut from one cream paper stands along a dusk pavement. The first one picks a small
// red wallet off the ground and it travels down the line relay-style, hand to hand, every second beat.
// She (navy, nearer, facing them) pats her empty hip on "lost", takes it on "returned", holds it up, and
// stamps three times: each stamp sends a gold ring along the pavement and the line hops as it passes.
// Colours: cream (strangers), navy (her), red (wallet), gold (rings). Ground: dusk sky + rose pavement.
(() => {
const T = { pick: 179.05, grab: 179.38, wallet: 183.29, lost: 184.29, ret: 185.69, stamps: [187.65, 188.28, 188.9], end: 190.7 };
// hand-offs land on every second beat (beat ~0.39 s); the last one is "returned"
const HAND = [T.grab, 180.4, 181.4, 182.19, 183.37, 184.47, 185.72];
const N = 6;
const BASE = 905, HER_BASE = 958, S = .6, HER_S = .66, HER_X = 1650;

// ---- local FK / IK for the kit's puppet (kit has no hand-position helper) ----
const DEG = 180 / Math.PI;
function rootM(x, y, s, dir, spec, pose) {
  const h = spec.height || 1;
  const m = new DOMMatrix().translateSelf(x, y + (pose.bob || 0) * s).scaleSelf(s * h * dir, s * h);
  if (pose.sit) m.translateSelf(0, 270);
  return m.rotateSelf((pose.lean || 0) * DEG);
}
const armRoot = (M, near) => M.multiply(new DOMMatrix().translateSelf(near ? 8 : -8, -752));
function handAt(M, near, sh, el) {
  const m = armRoot(M, near).rotateSelf(-sh * DEG).translateSelf(0, 168).rotateSelf(-el * DEG).translateSelf(4, 190);
  return m.transformPoint(new DOMPoint(0, 0));
}
// two-link IK in the arm's own frame: returns [sh, el] that put the hold point on world point P
function ik(M, near, P, bend = 1) {
  const L1 = 168, L2 = 190;
  const q = armRoot(M, near).inverse().transformPoint(new DOMPoint(P.x, P.y));
  const tx = q.x, ty = q.y; let d = Math.hypot(tx, ty);
  d = clamp(d, 40, L1 + L2 - .5);
  const gam = Math.atan2(tx, ty);
  const beta = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const a1 = gam - beta * bend;
  const ex = L1 * Math.sin(a1), ey = L1 * Math.cos(a1);
  const a2 = Math.atan2(tx - ex, ty - ey);
  return [a1, a2 - a1];
}
const mixP = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });
// keep the lower foot on the ground when the knees bend (pose.bob is in s units, before height)
function footDrop(legs, h) {
  const y = (l) => 266 * Math.cos(l[0]) + 250 * Math.cos(l[1] - l[0]);
  return (516 - Math.max(y(legs[0]), y(legs[1]))) * h;
}

// ---- the line: one cream paper, many shapes ----
const LINE = [
  { spec: { kind: 'coat', head: 'short', hair: 'hat', height: 1.02 } },
  { spec: { kind: 'dress', head: 'her', hair: 'bob', height: .95 } },
  { spec: { kind: 'shirt', head: 'child', hair: 'cap', height: .64, headK: .31 } },
  { spec: { kind: 'coat', head: 'short', height: 1.05 } },
  { spec: { kind: 'dress', head: 'short', hair: 'curls', height: .93 } },
  { spec: { kind: 'dressShort', head: 'child', hair: 'pony', height: .72, headK: .3 } },
].map((p, i) => ({ ...p, x: 150 + i * 228, spec: { ...p.spec, col: i % 2 ? C.creamDeep : C.cream } }));
const WALLET0 = { x: LINE[0].x + 125, y: BASE - 12 };

function wallet(x, y, rot, s = 1) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  cut(rrect(-24, -16, 48, 32, 6), C.red, { sh: .7, lift: .3, grain: .25 });
  g.save(); g.globalAlpha *= .35; cut(rrect(-24, -16, 48, 13, [6, 6, 2, 2]), C.ink, { sh: 0, grain: 0 }); g.restore();
  cut(circle(16, -4, 3.2), C.goldPale, { sh: 0, grain: 0 });
  g.restore();
}
// a ground ring: a flattened gold ellipse riding out along the pavement
function groundRing(t, x, y, at) {
  for (let r = 0; r < 3; r++) {
    const d = t - at - r * .12; if (d < 0 || d > 1.6) continue;
    const k = d / 1.6, rx = 40 + eo(k) * 1900;
    g.save(); g.globalAlpha *= (1 - k) * (r ? .55 : .95); g.strokeStyle = r % 2 ? C.goldPale : C.gold;
    g.lineWidth = lerp(16, 4, k) * (r ? .6 : 1);
    g.beginPath(); g.ellipse(x, y, rx, rx * .06, 0, 0, Math.PI * 2); g.stroke(); g.restore();
  }
}
// time the ring from a stamp at `at` reaches x (inverse of the eased radius, sampled)
function hitTime(at, dx) {
  for (let k = 0; k <= 1; k += .01) if (40 + eo(k) * 1900 >= dx) return at + k * 1.6;
  return at + 1.6;
}

SHOT(177.64, T.end, 'wallet', (t, k) => {
  // ---- ground: dusk sky, a far roofline, the pavement ----
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, C.sky2); sky.addColorStop(.55, C.sky3); sky.addColorStop(.85, C.roseDeep);
  g.fillStyle = sky; g.fillRect(0, 0, W, H); g.restore();

  // a slow drift toward her end of the line
  const zoom = lerp(1.0, 1.05, eio(k)), cx = lerp(0, -70, eio(k));
  g.save(); g.translate(W / 2, H * .62); g.scale(zoom, zoom); g.translate(-W / 2 + cx, -H * .62);

  // a low dusk sun behind her, half down behind the roofs: her halo
  cut(circle(HER_X - 30, 600, 290), C.goldPale, { sh: .5, grain: .3 });
  cut(circle(HER_X - 30, 600, 262), C.sun, { sh: .4, grain: .3 });
  // far roofline (tonal, the sky's own paper a shade down)
  const roof = [[-60, H], [-60, 720]]; let rx = -60;
  for (let i = 0; rx < W + 100; i++) {
    const w = 150 + hash(i * 3.7) * 170, h = 640 + hash(i * 5.1) * 90;
    roof.push([rx, h]);
    if (hash(i) > .45) { const cx = rx + w * (.2 + hash(i * 2.2) * .5); roof.push([cx, h], [cx, h - 34], [cx + 28, h - 34], [cx + 28, h]); }
    roof.push([rx + w, h]);
    rx += w;
  }
  roof.push([rx, H]);
  cut(poly(roof), '#8a5480', { sh: .5, grain: .25 });
  // pavement: two strips of rose paper, the kerb a shade lighter
  cut(cutRect(-60, 880, W + 120, 260, 21, 4), C.roseDark, { sh: .7, lift: .2 });
  cut(cutRect(-60, 872, W + 120, 16, 22, 3), C.roseDeep, { sh: .4 });

  // ---- the stamps' rings (on the pavement, behind feet) ----
  for (const s of T.stamps) groundRing(t, HER_X - 10, HER_BASE - 4, s);

  // ---- who holds the wallet ----
  let holder = -1; for (let i = 0; i < HAND.length; i++) if (t >= HAND[i]) holder = i;

  // hop of each figure when a ring passes under it; a last cheer from everyone
  const hopOf = (x) => { let h = 0; for (const s of T.stamps) h = Math.max(h, bump(t, hitTime(s, Math.abs(HER_X - x)), .34)); return h; };
  const cheer = ss(189.55, 189.95, t);

  // build every stranger's pose first (the meet points need everyone's shoulders)
  const poses = LINE.map((p, i) => {
    const hop = hopOf(p.x) + bump(t, 189.95 + i * .03, .34) * .9;
    const legs = [[.12 * hop, .55 * hop], [-.08 * hop, .5 * hop]];
    const pose = { legs, arms: [[0, .15], [0, .15]], head: .03 * Math.sin(t * 1.3 + i * 1.7) + .08 * cheer };
    // the first stranger looks down at the wallet, then up at it held high
    if (i === 0) pose.head += -.2 * ss(178.5, 178.8, t) * (1 - ss(T.grab, T.grab + .3, t)) + .14 * bump(t, T.grab, 1.1);
    pose.bob = footDrop(pose.legs, p.spec.height || 1) - hop * 80;
    return pose;
  });
  const herPose = { arms: [[0, .15], [0, .15]], legs: [[0, 0], [0, 0]], head: 0 };
  // her stamps: lift a knee, slam it down on the word
  T.stamps.forEach((s, j) => {
    const up = ss(s - .26, s - .1, t) * (1 - ss(s - .04, s, t));
    const L = j % 2 ? 1 : 0;
    herPose.legs[L] = [lerp(herPose.legs[L][0], .95, up), lerp(herPose.legs[L][1], 1.45, up)];
  });
  const herHop = bump(t, 189.95, .34);
  herPose.legs = herPose.legs.map((l) => [l[0] + .1 * herHop, l[1] + .5 * herHop]);
  const impact = T.stamps.reduce((a, s) => Math.max(a, bump(t, s, .14)), 0);
  herPose.bob = footDrop(herPose.legs.map((l, j) => l), 1) * 0 + impact * 10 - herHop * 70;
  // "lost": she looks down; "returned": she looks up, laughs on the stamps
  herPose.head = -.22 * ss(T.lost - .1, T.lost + .2, t) * (1 - ss(T.ret - .5, T.ret, t)) + .1 * ss(T.ret, T.ret + .4, t);
  const joy = ss(T.stamps[0] - .3, T.stamps[0], t);
  Object.assign(herPose, { laugh: joy * (.6 + .4 * Math.abs(Math.sin(t * 7))) });

  const MS = LINE.map((p, i) => rootM(p.x, BASE, S, 1, p.spec, poses[i]));
  const MH = () => rootM(HER_X, HER_BASE, HER_S, -1, CAST.her, herPose);
  // where two neighbours' hands meet: between their shoulders, dropped to about waist height
  const shoulder = (M) => armRoot(M, true).transformPoint(new DOMPoint(0, 0));
  const meet = (Ma, Mb, ra, rb) => {
    const a = shoulder(Ma), b = shoulder(Mb), half = Math.abs(b.x - a.x) / 2;
    const R = Math.min(ra, rb) * .93, drop = Math.sqrt(Math.max(0, R * R - half * half)) * .72;
    return { x: (a.x + b.x) / 2, y: Math.max(a.y, b.y) + drop };
  };
  const reach = (spec, s) => 358 * s * (spec.height || 1);
  const restHand = (M) => handAt(M, true, 0, .15);
  const M8 = MH();
  const allM = MS.concat([M8]);
  const reachOf = (i) => i < N ? reach(LINE[i].spec, S) : reach(CAST.her, HER_S);
  const meetPt = (i) => meet(allM[i - 1], allM[i], reachOf(i - 1), reachOf(i));   // between i-1 and i

  // each stranger's near-hand target over time
  const low0 = () => MS[0].transformPoint(new DOMPoint(150, -400));
  const targets = LINE.map((p, i) => {
    const rest = restHand(MS[i]), give = HAND[i + 1], front = meetPt(i + 1);
    if (t < HAND[i]) {
      // reach for it: the first one down to the pavement, the rest back for the relay
      return i === 0 ? mixP(rest, low0(), ss(178.65, 179.0, t)) : mixP(rest, meetPt(i), ss(HAND[i] - .42, HAND[i] - .05, t));
    }
    if (t < give) {
      // carry: the hand sweeps low past the hip from the back meet to the front meet
      if (i === 0) {
        // found it: up high for everyone to see, then on down the line
        const up = MS[0].transformPoint(new DOMPoint(190, -1130));
        return mixP(mixP(low0(), up, ss(T.grab, T.grab + .35, t)), front, ss(180.0, give - .08, t));
      }
      const from = meetPt(i);
      const c = ss(HAND[i] + .05, give - .12, t);
      const P = mixP(from, front, c);
      return { x: P.x, y: P.y + (i ? Math.sin(c * Math.PI) * 26 : 0) };
    }
    return mixP(front, rest, ss(give + .05, give + .5, t));
  });

  // ---- draw the strangers ----
  LINE.forEach((p, i) => {
    const pose = poses[i];
    const [sh, el] = ik(MS[i], true, targets[i]);
    pose.arms = [[sh, el], [lerp(.05, 2.7, cheer), lerp(.15, .25, cheer)]];
    if (cheer > 0 && t > HAND[i + 1] + .5) pose.arms[0] = [lerp(sh, 2.9, cheer), lerp(el, .15, cheer)];
    puppet(p.x, BASE, S, 1, p.spec, pose);
  });

  // ---- her ----
  {
    const rest = restHand(M8);
    // "lost": two pats at the empty pocket on her hip, head down
    const hip = M8.transformPoint(new DOMPoint(95, -455));
    const pat = Math.max(bump(t, T.lost, .22), bump(t, T.lost + .26, .22));
    const lostK = ss(T.lost - .25, T.lost, t) * (1 - ss(T.lost + .6, T.lost + .9, t));
    let P = mixP(rest, { x: hip.x, y: hip.y + pat * 16 }, lostK);
    const recv = meetPt(N);
    P = mixP(P, recv, ss(HAND[N] - .5, HAND[N] - .05, t));
    // to her chest, then held up high for the stamps
    const chest = M8.transformPoint(new DOMPoint(150, -620));
    const high = M8.transformPoint(new DOMPoint(150, -1170));
    if (t > HAND[N]) P = mixP(recv, chest, ss(HAND[N] + .1, HAND[N] + .6, t));
    if (t > 186.9) P = mixP(chest, high, ss(186.9, 187.4, t));
    const [sh, el] = ik(M8, true, P, 1);
    // far hand: a fist pumping on the stamps
    const [fsh, fel] = [0, .15];
    const pump = joy * (.5 + .45 * Math.sin(t * 9.6));
    herPose.arms = [[sh, el], [lerp(fsh, .35 + pump * .35, joy), lerp(fel, 1.95, joy)]];
    puppet(HER_X, HER_BASE, HER_S, -1, CAST.her, herPose);
    // joy rings from her on each stamp
    for (const s of T.stamps) laughRings(t, HER_X - 50, HER_BASE - 548, s, { n: 2, dir: Math.PI + .35, spread: .55, reach: 300, life: 1.4, w0: 9 });
  }

  // ---- the wallet ----
  {
    let P = WALLET0, rot = 0, sc = 1;
    if (holder >= 0) {
      const M = holder < N ? MS[holder] : M8;
      const pose = holder < N ? poses[holder] : herPose;
      P = handAt(M, true, pose.arms[0][0], pose.arms[0][1]);
      rot = Math.sin(t * 2 + holder) * .12;
    } else if (t > T.pick) {
      // the wallet hops up off the pavement into his hand, like paper on a stick
      const k = ss(T.pick, T.grab, t), Q = low0();
      P = { x: lerp(WALLET0.x, Q.x, k), y: lerp(WALLET0.y, Q.y, k) - Math.sin(k * Math.PI) * 90 };
      rot = k * Math.PI * 2;
    }
    // "wallet": a glint and a little swell; "returned": she takes it and it swells again
    sc = 1 + .3 * bump(t, T.grab, .5) + .35 * bump(t, T.wallet - .05, .45) + .3 * bump(t, T.ret, .5);
    wallet(P.x, P.y, rot, sc * 1.2);
    const gl = bump(t, T.grab + .1, .6) + bump(t, T.wallet, .6) + bump(t, T.ret + .05, .6) + T.stamps.reduce((a, s) => a + bump(t, s, .3) * .6, 0);
    if (gl > 0) cut(star4(P.x + 22, P.y - 22, 26 * Math.min(1, gl)), C.goldPale, { sh: .2, grain: 0 });
  }
  g.restore();
}, { xin: .8, tr: 'slide' });
})();

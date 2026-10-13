// 177.64-190.7  "In her dream the wallet she lost is returned and she stamps her feet"
// A continuous move out of 10: she walks on out of the street at the same screen place and size, the camera
// keeps travelling and settles on a line of strangers along a later-dusk pavement, ahead of her. She stops at
// the head of the line (the flower from 10 in her hair). At the far end the first one picks a small red wallet
// off the ground and it travels down the line toward her, hand to hand; each stranger takes their own colour
// as it passes through their hands, so by "returned" the line is alive. Punch-in on the wallet in her hands on
// "returned", then on her feet for the stamps: each stamp sends a gold ring along the pavement and the line
// hops as it passes. Wide again for everyone's cheer. Colours: the strangers' three tints, navy (her), red
// (wallet), gold (rings). Ground: a darker violet dusk than 10, a low moon behind her.
(() => {
const T = { start: 177.64, pick: 179.05, grab: 179.38, wallet: 183.29, lost: 184.29, ret: 185.69, stamps: [187.65, 188.28, 188.9], end: 190.7 };
const HAND = [T.grab, 180.4, 181.4, 182.19, 183.37, 184.47, 185.72];
const N = 6;
const BASE = 905, HER_BASE = 958, S = .6, HER_S = .66, HER_X = 240;
const DEG = 180 / Math.PI;
const hexRGB = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mixC = (a, b, k) => { const A = hexRGB(a), B = hexRGB(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; };

// ---- her walk, continuous with 10 (10: x = -150 + 196 (t - 162.1) at scale .5, camera holding her at screen 920) ----
const STRIDE = (s) => 2 * 516 * s * Math.sin(.3);
const PH0 = 196 * (T.start - 162.1) / STRIDE(.5) * Math.PI;         // her walk phase at the seam, as 10 has it
const ZA = .5 / HER_S;                                                // camera zoom that makes her 10's size
const VW = 196 / ZA;                                                  // her pace in this shot's units
const DD = .6;                                                        // seconds to slow to a stop
// stop with her feet together (walk phase a whole number of half cycles), about 1.5 s in
const DIST = (() => { const f = PH0 / Math.PI % 1; let k = 1; while ((k - f) * STRIDE(HER_S) < VW * (1.5 - DD / 2)) k++; return (k - f) * STRIDE(HER_S); })();
const TS = T.start + DIST / VW + DD / 2;
function hx(t) { const u = TS - t; const d = u <= 0 ? 0 : u >= DD ? VW * (u - DD / 2) : VW * u * u / (2 * DD); return HER_X - d; }
const herPh = (t) => PH0 + (hx(t) - hx(T.start)) / STRIDE(HER_S) * Math.PI;

// ---- camera ----
function camera(t) {
  const rest = { fx: 975, fy: H * .62, sx: W / 2, sy: H * .62, z: lerp(1, 1.03, eio((t - 180) / 10)) };
  if (t >= 185.6 && t < 187.45) return { fx: 400, fy: 560, sx: W / 2, sy: H / 2, z: lerp(2.1, 2.22, (t - 185.6) / 1.85) };   // her hands
  if (t >= 187.45 && t < 189.3) return { fx: 560, fy: 760, sx: W / 2, sy: H / 2, z: lerp(1.8, 1.86, (t - 187.45) / 1.85) };  // her feet
  const e = eio((t - T.start) / 2.6);
  if (e >= 1) return rest;
  const A = { fx: hx(t), fy: HER_BASE, sx: 920, sy: 968, z: ZA };
  const o = {}; for (const k in rest) o[k] = lerp(A[k], rest[k], e); return o;
}

// ---- local FK / IK for the kit's puppet (kit has no hand-position helper) ----
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
function ik(M, near, P, bend = 1) {
  const L1 = 168, L2 = 190;
  const q = armRoot(M, near).inverse().transformPoint(new DOMPoint(P.x, P.y));
  const tx = q.x, ty = q.y; let d = Math.hypot(tx, ty);
  d = clamp(d, 40, L1 + L2 - .5);
  const gam = Math.atan2(tx, ty);
  const beta = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const a1 = gam - beta * bend;
  const ex = L1 * Math.sin(a1), ey = L1 * Math.cos(a1);
  return [a1, Math.atan2(tx - ex, ty - ey) - a1];
}
const mixP = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });
function footDrop(legs, h) {
  const y = (l) => 266 * Math.cos(l[0]) + 250 * Math.cos(l[1] - l[0]);
  return (516 - Math.max(y(legs[0]), y(legs[1]))) * h;
}

// ---- the line: strangers in the 09 crowd's tints, muted until the wallet passes through their hands ----
const TINTS = [C.orange, C.mint, C.rose, C.orange, C.mint, C.rose];
const MUTE = '#433d72';
const LINE = [
  { spec: { kind: 'coat', head: 'short', hair: 'hat', height: 1.02 } },
  { spec: { kind: 'dress', head: 'her', hair: 'bob', height: .95 } },
  { spec: { kind: 'shirt', head: 'child', hair: 'cap', height: .64, headK: .31 } },
  { spec: { kind: 'coat', head: 'short', height: 1.0 } },
  { spec: { kind: 'dress', head: 'short', hair: 'curls', height: .93 } },
  { spec: { kind: 'dressShort', head: 'child', hair: 'pony', height: .72, headK: .3 } },
].map((p, i) => ({ ...p, x: 1730 - i * 228 }));
const WALLET0 = { x: LINE[0].x - 125, y: BASE - 12 };

function wallet(x, y, rot, s = 1) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  cut(rrect(-24, -16, 48, 32, 6), C.red, { sh: .7, lift: .3, grain: .25 });
  g.save(); g.globalAlpha *= .35; cut(rrect(-24, -16, 48, 13, [6, 6, 2, 2]), C.ink, { sh: 0, grain: 0 }); g.restore();
  cut(circle(-16, -4, 3.2), C.goldPale, { sh: 0, grain: 0 });
  g.restore();
}
function groundRing(t, x, y, at) {
  for (let r = 0; r < 3; r++) {
    const d = t - at - r * .12; if (d < 0 || d > 1.6) continue;
    const k = d / 1.6, rx = 40 + eo(k) * 1900;
    g.save(); g.globalAlpha *= (1 - k) * (r ? .55 : .95); g.strokeStyle = r % 2 ? C.goldPale : C.gold;
    g.lineWidth = lerp(16, 4, k) * (r ? .6 : 1);
    g.beginPath(); g.ellipse(x, y, rx, rx * .06, 0, 0, Math.PI * 2); g.stroke(); g.restore();
  }
}
function hitTime(at, dx) {
  for (let k = 0; k <= 1; k += .01) if (40 + eo(k) * 1900 >= dx) return at + k * 1.6;
  return at + 1.6;
}
// her skirt: when a knee lifts for a stamp, the skirt front tents over it instead of the thigh poking through
function drape(pose) {
  pose.legs.forEach((l, j) => {
    if (l[0] < .12) return;
    const px = j ? -6 : 6, kx = px + 266 * Math.sin(l[0]), ky = -540 + 266 * Math.cos(l[0]);
    cut(blob([[-30, -585], [56, -585], [kx + 32, ky - 34], [kx + 40, ky + 16], [kx + 16, ky + 70], [96, -186], [-60, -200]], .45), C.navy, { sh: .4, grain: .26, lift: .1 });
  });
}
// the flower she tucked in her hair in 10 (head units, HEAD_HER)
function hairFlower(p) {
  g.save(); g.rotate(-(p.head || 0) * .9 - (p.laugh || 0) * .18); g.scale(.265, .265); g.translate(-580, -800);
  flower(430, 420, 120, C.rose, C.gold, .4, { grain: .12 }); g.restore();
}
const HER = { ...CAST.her, acc: [drape], headAcc: hairFlower };

SHOT(T.start, T.end, 'wallet', (t, k) => {
  // ---- ground: a later dusk than 10, darker violet ----
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#11173a'); sky.addColorStop(.5, '#1e1f52'); sky.addColorStop(.85, '#3a2f6c');
  g.fillStyle = sky; g.fillRect(0, 0, W, H); g.restore();

  const cam = camera(t);
  g.save(); g.translate(cam.sx, cam.sy); g.scale(cam.z, cam.z); g.translate(-cam.fx, -cam.fy);

  // a low moon behind her: her halo
  cut(circle(HER_X + 60, 610, 300), C.goldPale, { sh: .5, grain: .3 });
  cut(circle(HER_X + 60, 610, 272), C.sun, { sh: .4, grain: .3 });
  // far roofline (tonal, a shade down from the sky)
  const roof = [[-1700, H + 200], [-1700, 720]]; let rx = -1700;
  for (let i = 0; rx < W + 1700; i++) {
    const w = 150 + hash(i * 3.7) * 170, h = 640 + hash(i * 5.1) * 90;
    roof.push([rx, h]);
    if (hash(i) > .45) { const cx = rx + w * (.2 + hash(i * 2.2) * .5); roof.push([cx, h], [cx, h - 34], [cx + 28, h - 34], [cx + 28, h]); }
    roof.push([rx + w, h]); rx += w;
  }
  roof.push([rx, H + 200]);
  cut(poly(roof), '#2a2658', { sh: .5, grain: .25 });
  cut(cutRect(-1700, 880, W + 3400, 400, 21, 4), '#2f2a66', { sh: .7, lift: .2 });
  cut(cutRect(-1700, 872, W + 3400, 16, 22, 3), '#4a3d80', { sh: .4 });

  for (const s of T.stamps) groundRing(t, HER_X + 10, HER_BASE - 4, s);

  let holder = -1; for (let i = 0; i < HAND.length; i++) if (t >= HAND[i]) holder = i;
  const hopOf = (x) => { let h = 0; for (const s of T.stamps) h = Math.max(h, bump(t, hitTime(s, Math.abs(HER_X - x)), .34)); return h; };
  const cheer = ss(189.55, 189.95, t);

  const poses = LINE.map((p, i) => {
    const hop = Math.max(hopOf(p.x), bump(t, HAND[i] + .05, .3) * .45) + bump(t, 189.95 + i * .03, .34) * .9;
    const legs = [[.12 * hop, .55 * hop], [-.08 * hop, .5 * hop]];
    const pose = { legs, arms: [[0, .15], [0, .15]], head: .03 * Math.sin(t * 1.3 + i * 1.7) + .08 * cheer };
    if (i === 0) pose.head += -.2 * ss(178.5, 178.8, t) * (1 - ss(T.grab, T.grab + .3, t)) + .14 * bump(t, T.grab, 1.1);
    pose.bob = footDrop(pose.legs, p.spec.height || 1) - hop * 80;
    return pose;
  });

  // ---- her pose: walking in, stopping, then the story ----
  const walkK = 1 - ss(TS - .25, TS + .2, t);
  const wp = POSE.walk(herPh(t));
  const herPose = { arms: [[0, .15], [0, .15]], legs: [[0, 0], [0, 0]], head: 0 };
  if (walkK > 0) {
    herPose.legs = wp.legs.map((l) => [l[0] * walkK, l[1] * walkK]);
    herPose.arms = wp.arms.map((a, j) => [lerp(0, a[0], walkK), lerp(.15, a[1], walkK)]);
    herPose.bob = wp.bob * walkK;
  }
  T.stamps.forEach((s, j) => {
    const up = ss(s - .26, s - .1, t) * (1 - ss(s - .04, s, t));
    const L = j % 2 ? 1 : 0;
    herPose.legs[L] = [lerp(herPose.legs[L][0], .75, up), lerp(herPose.legs[L][1], 1.35, up)];
  });
  const herHop = bump(t, 189.95, .34);
  herPose.legs = herPose.legs.map((l) => [l[0] + .1 * herHop, l[1] + .5 * herHop]);
  const impact = T.stamps.reduce((a, s) => Math.max(a, bump(t, s, .14)), 0);
  if (walkK <= 0) herPose.bob = impact * 10 - herHop * 70;
  herPose.head = (.05 + .02 * Math.sin(herPh(t) * 2)) * walkK
    - .22 * ss(T.lost - .1, T.lost + .2, t) * (1 - ss(T.ret - .5, T.ret, t)) + .1 * ss(T.ret, T.ret + .4, t);
  const joy = ss(T.stamps[0] - .3, T.stamps[0], t);
  herPose.laugh = joy * (.6 + .4 * Math.abs(Math.sin(t * 7)));
  const herXNow = hx(t);

  const MS = LINE.map((p, i) => rootM(p.x, BASE, S, -1, p.spec, poses[i]));
  const M8 = rootM(herXNow, HER_BASE, HER_S, 1, HER, herPose);
  const shoulder = (M) => armRoot(M, true).transformPoint(new DOMPoint(0, 0));
  const meet = (Ma, Mb, ra, rb) => {
    const a = shoulder(Ma), b = shoulder(Mb), half = Math.abs(b.x - a.x) / 2;
    const R = Math.min(ra, rb) * .93, drop = Math.sqrt(Math.max(0, R * R - half * half)) * .72;
    return { x: (a.x + b.x) / 2, y: Math.max(a.y, b.y) + drop };
  };
  const reach = (spec, s) => 358 * s * (spec.height || 1);
  const restHand = (M) => handAt(M, true, 0, .15);
  const allM = MS.concat([M8]);
  const reachOf = (i) => i < N ? reach(LINE[i].spec, S) : reach(HER, HER_S);
  const meetPt = (i) => meet(allM[i - 1], allM[i], reachOf(i - 1), reachOf(i));

  const low0 = () => MS[0].transformPoint(new DOMPoint(150, -400));
  const targets = LINE.map((p, i) => {
    const rest = restHand(MS[i]), give = HAND[i + 1], front = meetPt(i + 1);
    if (t < HAND[i]) return i === 0 ? mixP(rest, low0(), ss(178.65, 179.0, t)) : mixP(rest, meetPt(i), ss(HAND[i] - .42, HAND[i] - .05, t));
    if (t < give) {
      if (i === 0) {
        const up = MS[0].transformPoint(new DOMPoint(190, -1130));
        return mixP(mixP(low0(), up, ss(T.grab, T.grab + .35, t)), front, ss(180.0, give - .08, t));
      }
      const c = ss(HAND[i] + .05, give - .12, t), P = mixP(meetPt(i), front, c);
      return { x: P.x, y: P.y + Math.sin(c * Math.PI) * 26 };
    }
    return mixP(front, rest, ss(give + .05, give + .5, t));
  });

  // ---- the strangers: colour floods in as the wallet passes through their hands ----
  LINE.forEach((p, i) => {
    const pose = poses[i];
    pose.arms[0] = ik(MS[i], true, targets[i]);
    // cheer: only the far arm goes up (behind the head), elbow folding on the way so it never passes level
    pose.arms[1] = [lerp(.05, 2.95, cheer), .15 + 1.7 * Math.sin(Math.PI * cheer)];
    const alive = ss(HAND[i] - .05, HAND[i] + .3, t);
    const col = mixC(TINTS[i], MUTE, .62 * (1 - alive));
    puppet(p.x, BASE, S, -1, { ...p.spec, col }, pose);
  });

  // ---- her ----
  {
    const rest = restHand(M8);
    let sh, el;
    if (t < TS + .2) { [sh, el] = herPose.arms[0]; }
    else {
      const hip = M8.transformPoint(new DOMPoint(95, -455));
      const pat = Math.max(bump(t, T.lost, .22), bump(t, T.lost + .26, .22));
      const lostK = ss(T.lost - .25, T.lost, t) * (1 - ss(T.lost + .6, T.lost + .9, t));
      let P = mixP(rest, { x: hip.x, y: hip.y + pat * 16 }, lostK);
      const recv = meetPt(N);
      P = mixP(P, recv, ss(HAND[N] - .5, HAND[N] - .05, t));
      const chest = M8.transformPoint(new DOMPoint(150, -620));
      const high = M8.transformPoint(new DOMPoint(240, -1110));
      if (t > HAND[N]) P = mixP(recv, chest, ss(HAND[N] + .1, HAND[N] + .6, t));
      if (t > 187.2) P = mixP(chest, high, ss(187.2, 187.6, t));
      [sh, el] = ik(M8, true, P, 1);
    }
    const pump = joy * (.5 + .45 * Math.sin(t * 9.6));
    herPose.arms = [[sh, el], [lerp(herPose.arms[1][0], .35 + pump * .35, joy), lerp(herPose.arms[1][1], 1.95, joy)]];
    puppet(herXNow, HER_BASE, HER_S, 1, HER, herPose);
    for (const s of T.stamps) laughRings(t, HER_X + 50, HER_BASE - 548, s, { n: 2, dir: -.35, spread: .55, reach: 300, life: 1.4, w0: 9 });
  }

  // ---- the wallet ----
  {
    let P = WALLET0, rot = 0;
    if (holder >= 0) {
      const M = holder < N ? MS[holder] : M8;
      const pose = holder < N ? poses[holder] : herPose;
      P = handAt(M, true, pose.arms[0][0], pose.arms[0][1]);
      rot = Math.sin(t * 2 + holder) * .12;
    } else if (t > T.pick) {
      const k2 = ss(T.pick, T.grab, t), Q = low0();
      P = { x: lerp(WALLET0.x, Q.x, k2), y: lerp(WALLET0.y, Q.y, k2) - Math.sin(k2 * Math.PI) * 90 };
      rot = -k2 * Math.PI * 2;
    }
    const sc = 1 + .3 * bump(t, T.grab, .5) + .35 * bump(t, T.wallet - .05, .45) + .3 * bump(t, T.ret, .5);
    wallet(P.x, P.y, rot, sc * 1.2);
    const gl = bump(t, T.grab + .1, .6) + bump(t, T.wallet, .6) + bump(t, T.ret + .05, .6) + T.stamps.reduce((a, s) => a + bump(t, s, .3) * .6, 0);
    if (gl > 0) cut(star4(P.x - 22, P.y - 22, 26 * Math.min(1, gl)), C.goldPale, { sh: .2, grain: 0 });
  }
  g.restore();
}, { xin: .5, tr: 'fade' });
})();

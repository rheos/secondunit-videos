// 162.1-177.64  "In her dream the kids don't look with suspicious eyes / as she goes down the street"
// Her street at dusk, under the street lamp the reunion sun became. She walks in from the left at once.
// The kids on the stoops sit muted, chin on fist, a narrow slanted slit cut in each big head; they turn to
// track her as she passes (the suspicion). Close-up on "kids": on "don't" and "look" the slits soften into
// the film's closed happy crescent and the colour warms. Back wide: an ordinary warm street. Kids wave and
// laugh from their stoops, one plays hopscotch, one skips rope, one tosses her a ball and she bounces it
// back, a little one on a step offers her a flower on "street" and she tucks it in her hair. Nobody
// follows her; she walks on out of the street (11 picks her up at the same screen place and scale).
(() => {
const T = { start: 162.1, inn: 163.12, dream: 164.24, the: 167.62, kids: 167.82, dont: 168.22, look: 168.63, with: 169.39,
  susp: 169.81, eyes: 171.87, eyesEnd: 172.9, as: 174.23, goes: 174.67, down: 175.77, street: 176.31, end: 177.64 };
const BEATS = [162.03, 162.79, 163.56, 164.35, 165.14, 165.91, 166.72, 167.53, 168.32, 169.09, 169.85, 170.64, 171.46, 172.22,
  173.01, 173.78, 174.57, 175.36, 176.15, 177.0, 177.77, 178.55, 179.33];
const LAMP_X = 1043, LAMP_TOP = 340;
const GROUND = 968, HOUSE_BASE = 905, STEP_Y = HOUSE_BASE - 32, PAVE_Y = 930;
const S_HER = .5;
const STRIDE = (s, hgt) => 2 * 516 * s * hgt * Math.sin(.3);       // body travel per half walk cycle
const V = 196;                                                       // her pace: about a step a beat
const H0 = -150;                                                     // off frame at 162.1, in frame by 162.7
const herX = (t) => H0 + V * (t - T.start);
const camX = (t) => { const e = herX(t) - 820; return e <= 0 ? 0 : e < 200 ? e * e / 400 : e - 100; };
const DEG = 180 / Math.PI;
const hexRGB = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mixC = (a, b, k) => { const A = hexRGB(a), B = hexRGB(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; };

// ---- local FK / IK for the kit's puppet (same maths as 11-wallet.js) ----
function rootM(x, y, s, dir, spec, pose) {
  const h = spec.height || 1;
  const m = new DOMMatrix().translateSelf(x, y + (pose.bob || 0) * s).scaleSelf(s * h * dir, s * h);
  if (pose.sit) m.translateSelf(0, 270);
  return m.rotateSelf((pose.lean || 0) * DEG);
}
const armRoot = (M, near) => M.multiply(new DOMMatrix().translateSelf(near ? 8 : -8, -752));
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
const loc = (M, x, y) => M.transformPoint(new DOMPoint(x, y));
const mixP = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });
const mixArm = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// ---------------- the eye: a narrow slanted slit that softens into the closed happy crescent ----------------
// head units (HEAD_CHILD); s = 0 suspicious slit, 1 crescent; drawn in the colour behind the head (a cut-out)
const EYE = { x: 712, y: 486 };
function eyeDraw(s, bg, sz = 1) {
  g.save(); g.translate(EYE.x, EYE.y); g.scale(sz, sz);
  if (s < .5) {
    const k = s * 2, hh = lerp(30, 4, k), sl = lerp(13, 0, k);
    const p = new Path2D(); p.moveTo(-56, -sl); p.quadraticCurveTo(-6, -sl * .3 - 3, 44, sl);   // a lowered, slanted lid
    p.quadraticCurveTo(-8, hh + sl * .6, -56, -sl); p.closePath();
    cut(p, bg, { sh: 0, grain: .12 });
  } else {
    const d = 24 * back((s - .5) * 2);
    g.strokeStyle = bg; g.lineWidth = 15; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-50, -8); g.quadraticCurveTo(-4, -8 + d * 2, 42, -8); g.stroke();
  }
  g.restore();
}
// local hair (head units, HEAD_CHILD), none of them her own kids' pony / cap / pigtails
const HAIRK = {
  puff: (() => { const p = new Path2D(); p.addPath(circle(400, 290, 135)); p.addPath(circle(290, 400, 95)); return p; })(),
  beanie: (() => { const p = new Path2D(); p.addPath(blob([[262, 440], [290, 300], [420, 210], [580, 196], [716, 254], [776, 352], [700, 364], [520, 322], [340, 384]], .5)); p.addPath(circle(470, 180, 52)); return p; })(),
  topknot: (() => { const p = new Path2D(); p.addPath(circle(450, 196, 78)); p.addPath(blob([[268, 520], [280, 360], [400, 262], [560, 252], [680, 290], [560, 300], [420, 340], [330, 460]], .5)); return p; })(),
};

// ---------------- the kids ----------------
// seat: on a stoop (the three from draft 1, same places); others play on the pavement or stand on a bottom step
const S_KID = .34;
const KIDS = [
  { x: 843,  seat: true, col: C.rose, kind: 'dressShort', hair: 'bob', height: .7, headK: .36, soft: T.dont },
  { x: 1243, seat: true, col: C.mint, kind: 'shirt', hair: 'curls', height: .62, headK: .37, soft: T.look },
  { x: 1643, seat: true, col: C.gold, kind: 'shirt', hairP: 'puff', height: .72, headK: .35, soft: T.look + .3 },
  { x: 2040, hop: true,  col: C.rose, kind: 'shirt', hairP: 'beanie', height: .6, headK: .37 },
  { x: 2425, ball: true, col: C.mint, kind: 'dressShort', hairP: 'topknot', height: .64, headK: .36 },
  { x: 2800, flower: true, col: C.gold, kind: 'dressShort', hair: 'bob', height: .5, headK: .41 },
  { x: 3150, skip: true, col: C.rose, kind: 'dressShort', hair: 'curls', height: .66, headK: .36 },
];
const HOUSE_COL = C.sky3, STOOP_COL = C.plum;
function kidSpec(k, warm, eyeS, bg = HOUSE_COL) {
  const col = mixC(k.col, C.sky1, .5 * (1 - warm));
  return { col, kind: k.kind, head: 'child', hair: k.hair, height: k.height, headK: k.headK,
    headAcc: (pose) => { g.save(); g.rotate(-(pose.head || 0) * .9 - (pose.laugh || 0) * .18); g.scale(k.headK, k.headK); g.translate(-580, -800);
      if (k.hairP) cut(HAIRK[k.hairP], col, { sh: .3, grain: .2 });
      eyeDraw(eyeS, bg, 1.5); g.restore(); } };
}
// a paper turn: the figure flips facing over two drawings (edge-on sliver in between)
function turnDir(t, at, from = -1) { const u = clamp((t - at) / .17); const d = lerp(from, -from, u); return Math.sign(d || -from) * Math.max(.28, Math.abs(d)); }
const mouthOf = (M) => loc(M, 92, -840);

// ---- the ball: tossed to her, bounced back, then dribbled on the step ----
const BALL = { toss: 172.62, catch: 173.01, push: 173.3, bounce: 173.5, back: 173.78 };
const KB = KIDS[4];
const kbM = (t, pose) => rootM(KB.x, STEP_Y, S_KID, -1, KB, pose);
const herCatch = (t) => loc(herM(t), 150, -640);
const kidHold = (t) => loc(kbM(t, {}), 120, -600);
function ballPos(t) {
  const arc = (A, B, k, hgt) => ({ x: lerp(A.x, B.x, k), y: lerp(A.y, B.y, k) - Math.sin(k * Math.PI) * hgt });
  if (t < BALL.toss - .3) return kidHold(t);
  if (t < BALL.toss) return mixP(kidHold(t), loc(kbM(t, {}), 150, -820), ss(BALL.toss - .3, BALL.toss, t));
  if (t < BALL.catch) return arc(loc(kbM(t, {}), 150, -820), herCatch(BALL.catch), (t - BALL.toss) / (BALL.catch - BALL.toss), 110);
  if (t < BALL.push) return herCatch(t);
  const Q = { x: herX(BALL.bounce) + 170, y: GROUND - 14 };
  if (t < BALL.bounce) { const k = (t - BALL.push) / (BALL.bounce - BALL.push); const A = herCatch(BALL.push); return { x: lerp(A.x, Q.x, k), y: lerp(A.y, Q.y, k * k) }; }
  if (t < BALL.back) return arc(Q, kidHold(BALL.back), (t - BALL.bounce) / (BALL.back - BALL.bounce), 90);
  // dribble on the beats: down to the step and back up into her hand
  let y = 0; for (const b of BEATS) if (b > BALL.back + .2) y = Math.max(y, bump(t, b - .18, .36));
  const H = kidHold(t); return { x: H.x - 10 * y, y: lerp(H.y, STEP_Y - 16, y) };
}

// ---- the flower: offered on "as", she takes it on "street" and tucks it in her hair ----
const KF = KIDS[5];
const kfM = () => rootM(KF.x, STEP_Y, S_KID, -1, KF, {});
const FL = { offer: T.as, take: 176.43, tuck: 176.9 };
const HAIR_SPOT = { x: 430, y: 420 };                     // in HEAD_HER units: high on the back of her head
const flowerOffer = () => loc(kfM(), 150, -900);
function hairSpot(M, pose) {
  const a = -(pose.head || 0) * .9 - (pose.laugh || 0) * .18, c = Math.cos(a), s = Math.sin(a);
  const ux = (HAIR_SPOT.x - 580) * .265, uy = (HAIR_SPOT.y - 800) * .265;
  return loc(M, 10 + ux * c - uy * s, -790 + ux * s + uy * c);
}
function hairFlower(r = 120) { flower(HAIR_SPOT.x, HAIR_SPOT.y, r, C.rose, C.gold, .4, { grain: .12 }); }

// ---- her ----
function herBase(t) {
  const h = herX(t), ph = (h - H0) / STRIDE(S_HER, 1) * Math.PI;
  const glad = ss(T.eyes, T.eyes + .6, t);
  return { ...POSE.walk(ph), head: .05 * glad + .02 * Math.sin(ph * 2) };
}
function herM(t) { return rootM(herX(t), GROUND, S_HER, 1, CAST.her, herBase(t)); }
function herDraw(t) {
  const pose = herBase(t), M = rootM(herX(t), GROUND, S_HER, 1, CAST.her, pose);
  // near-arm actions: catch and bounce the ball, take the flower and tuck it in her hair
  let w = 0, P = null;
  const wb = ss(BALL.toss + .05, BALL.catch - .08, t) * (1 - ss(BALL.push + .08, BALL.push + .4, t));
  if (wb > 0) { w = wb; P = t < BALL.push ? ballPos(Math.max(t, BALL.catch - .001)) : mixP(herCatch(BALL.push), loc(M, 210, -440), ss(BALL.push, BALL.push + .1, t)); }
  const wf = ss(176.0, 176.3, t) * (1 - ss(FL.tuck + .02, FL.tuck + .45, t));
  if (wf > 0) { w = wf; P = t < FL.take ? flowerOffer() : mixP(flowerOffer(), hairSpot(M, pose), eio((t - FL.take) / (FL.tuck - FL.take))); }
  if (w > 0) { const a = mixArm(pose.arms[0], ik(M, true, P, 1), w);
    // lowering from the hair: the elbow folds so the hand comes down beside her, not swung out behind
    if (t > FL.tuck) a[1] += 1.6 * Math.sin(Math.PI * w);
    pose.arms = [a, pose.arms[1]]; }
  pose.laugh = .5 * bump(t, BALL.catch, .7) + .5 * bump(t, FL.tuck - .1, .8);
  const spec = { ...CAST.her, headAcc: (p) => { if (t < FL.tuck) return; g.save(); g.rotate(-(p.head || 0) * .9 - (p.laugh || 0) * .18); g.scale(.265, .265); g.translate(-580, -800); hairFlower(); g.restore(); } };
  puppet(herX(t), GROUND, S_HER, 1, spec, pose);
  // the flower in her hand between the take and the tuck
  if (t >= FL.take && t < FL.tuck) { const Q = mixP(flowerOffer(), hairSpot(M, pose), eio((t - FL.take) / (FL.tuck - FL.take))); flower(Q.x, Q.y, 16, C.rose, C.gold, .4, { grain: .12 }); }
  const m = mouthOf(M);
  laughRings(t, m.x, m.y, BALL.catch + .05, { n: 2, dir: -.25, spread: .6, reach: 160, life: 1.1, w0: 6 });
  laughRings(t, m.x, m.y, FL.tuck, { n: 2, dir: -.25, spread: .6, reach: 160, life: 1.1, w0: 6 });
}

// ---- the kids, each frame ----
function seatedKid(k, i, t, h) {
  const sc = S_KID * k.height;
  const yy = (HOUSE_BASE - 92) + 540 * sc;
  const passAt = T.start + (k.x + 30 - H0) / V;          // when she draws level
  const warm = ss(k.soft, k.soft + .4, t), eyeS = ss(k.soft, k.soft + .45, t);
  const dir = t < passAt ? -1 : turnDir(t, passAt, -1);
  const seated = { sit: true, legs: [[1.5, 1.45], [1.42, 1.5]] };
  // suspicious: leaning in, chin on fist, chin down, the head following her as she comes
  const near = clamp(1 - Math.abs(h - k.x) / 1100);
  const sus = 1 - warm;
  const pose = { ...seated, lean: .1 * sus - .04 * warm, head: -.13 * sus + near * .06 * sus + .06 * warm, arms: [[.2, .4], [.1, .5]] };
  const M = rootM(k.x, yy, S_KID, dir, k, pose);
  const chin = ik(M, true, loc(M, 70, -770), -1);
  const relax = [[.35, 1.05], [.1, .5]];
  // warm: a wave toward her on "suspicious", a laugh on the beats
  const waveAt = [T.susp + .05, T.susp - .05, T.susp + .3][i];
  const wv = ss(waveAt, waveAt + .25, t) * (1 - ss(waveAt + 1.6, waveAt + 1.9, t));
  const waveArm = [2.25, .35 + .4 * Math.sin(t * 9 + i)];
  pose.arms = [mixArm(mixArm(chin, relax[0], warm), waveArm, wv), relax[1]];
  pose.laugh = .7 * Math.max(bump(t, T.eyes - .05 + i * .1, 1.0), bump(t, [T.dont, T.look, 170.64][i] + .3, .9) * warm);
  puppet(k.x, yy, S_KID, dir, kidSpec(k, warm, eyeS), pose);
  const m = mouthOf(rootM(k.x, yy, S_KID, Math.sign(dir), k, pose));
  const fwd = Math.sign(dir) > 0 ? -.3 : Math.PI + .3;
  laughRings(t, m.x, m.y, T.eyes + i * .1, { n: 2, dir: fwd, spread: .6, reach: 150, life: 1.2, w0: 6 });
  if (i === 1) laughRings(t, m.x, m.y, 170.64, { n: 2, dir: fwd, spread: .6, reach: 150, life: 1.2, w0: 6 });
}
const TILES = [0, 1, 2, 3, 4].map((j) => 2000 + j * 62);
function hopscotch(t) {
  // chalk squares laid flat on the pavement
  TILES.forEach((x, j) => cut(poly([[x + 8, PAVE_Y - 4], [x + 60, PAVE_Y - 4], [x + 52, PAVE_Y + 8], [x, PAVE_Y + 8]]), C.cream, { sh: .2, grain: .2, alpha: .75 }));
  const k = KIDS[3];
  // one square per beat, up the row and back
  let n = -1; for (const b of BEATS) if (t >= b) n++;
  const idx = (q) => { const c = ((q % 10) + 10) % 10; return c < 5 ? c : 9 - c; };
  const b0 = BEATS[Math.max(0, n)], b1 = BEATS[Math.min(BEATS.length - 1, n + 1)];
  const u = clamp((t - b0) / Math.max(.1, b1 - b0));
  const from = idx(n), to = idx(n + 1), x = lerp(TILES[from], TILES[to], eio(clamp(u * 1.6))) + 30;
  const facing = to >= from ? 1 : -1;
  const air = Math.sin(clamp(u * 1.6) * Math.PI);
  const pose = { legs: [[.15 + .25 * air, .25 + .3 * air], [-.35, 1.5]], arms: [[.9 - .3 * air, .25], [-.7, .3]], bob: -air * 90, head: .05 };
  puppet(x, PAVE_Y, S_KID, facing, kidSpec(k, 1, 1), pose);
}
function ballKid(t) {
  const k = KB;
  const pose = { legs: [[0, 0], [0, 0]], arms: [[0, .15], [0, .15]], head: 0 };
  const M = kbM(t, pose);
  const B = ballPos(t);
  let P;
  if (t < BALL.toss - .3) P = B;
  else if (t < BALL.toss + .2) P = t < BALL.toss ? B : loc(M, 150, -820);
  else if (t < BALL.back - .25) P = mixP(loc(M, 150, -820), loc(M, 20, -420), ss(BALL.toss + .2, BALL.toss + .6, t));
  else P = t < BALL.back ? mixP(loc(M, 20, -420), kidHold(t), ss(BALL.back - .25, BALL.back, t)) : B;
  pose.arms = [ik(M, true, P, 1), [.2, .3]];
  pose.legs = [[.12 * bump(t, BALL.toss - .1, .4), .1], [-.1 * bump(t, BALL.toss - .1, .4), .1]];
  pose.laugh = .7 * bump(t, BALL.back + .05, 1.0);
  pose.head = .1 * ss(BALL.toss, BALL.toss + .2, t) * (1 - ss(BALL.catch + .3, BALL.catch + .6, t));
  puppet(k.x, STEP_Y, S_KID, -1, kidSpec(k, 1, 1, C.plum), pose);
  const m = mouthOf(kbM(t, pose));
  laughRings(t, m.x, m.y, BALL.back + .05, { n: 2, dir: Math.PI + .3, spread: .6, reach: 150, life: 1.2, w0: 6 });
}
function drawBall(t) {
  const B = ballPos(t);
  cut(circle(B.x, B.y, 15), C.cream, { sh: .7, lift: .3, grain: .15 });
  cut(poly([[B.x - 15, B.y - 3], [B.x + 15, B.y - 3], [B.x + 15, B.y + 3], [B.x - 15, B.y + 3]]), C.rose, { sh: 0, grain: .1 });
}
function flowerKid(t) {
  const k = KF;
  const pose = { legs: [[0, 0], [0, 0]], arms: [[0, .15], [0, .15]], head: 0 };
  const M = kfM();
  const up = ss(FL.offer - .1, FL.offer + .25, t) * (1 - ss(FL.take + .05, FL.take + .35, t));
  const P = mixP(loc(M, 90, -520), flowerOffer(), up);
  pose.arms = [ik(M, true, P, 1), [.15, .3]];
  // after giving it: claps and laughs
  const clap = t > FL.take + .3 ? Math.abs(Math.sin((t - FL.take) * 9)) : 0;
  if (clap) pose.arms = [[.9 + .25 * clap, .9], [.9 - .2 * clap, .9]];
  pose.laugh = .7 * bump(t, FL.take + .25, 1.2);
  pose.head = .08 * up;
  puppet(k.x, STEP_Y, S_KID, -1, kidSpec(k, 1, 1, C.plum), pose);
  if (t < FL.take) flower(P.x, P.y - 4, 16, C.rose, C.gold, .4, { grain: .12 });
  const m = mouthOf(M);
  laughRings(t, m.x, m.y, FL.take + .25, { n: 2, dir: Math.PI + .3, spread: .6, reach: 150, life: 1.2, w0: 6 });
}
function skipKid(t) {
  const k = KIDS[6], sc = S_KID * k.height;
  const per = .785, th = 2 * Math.PI * (t - 173.01) / per + Math.PI;      // the rope passes under her feet on the beat
  const air = Math.max(0, -Math.cos(th));
  const pose = { legs: [[.15 * air, .5 * air], [.05 * air, .55 * air]], arms: [[.5, -.4], [.45, -.35]], bob: -air * 70, head: .04 };
  const M = rootM(k.x, PAVE_Y, S_KID, -1, k, pose);
  const Hd = loc(M, 60, -400);
  // the rope: a paper strip loop from her hands, swinging over her head and under her feet
  const cy = PAVE_Y - 560 * sc + pose.bob * sc, c = Math.cos(th);
  const P = { x: k.x - Math.sin(th) * 380 * sc, y: c >= 0 ? cy - c * 640 * sc : cy - c * (PAVE_Y + 8 - cy) };
  const dx = P.x - Hd.x, dy = P.y - Hd.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, wv = L * .16;
  const pts = [];
  for (let j = 0; j <= 16; j++) { const u = j / 16, a = u * Math.PI * 2, rr = Math.sin(u * Math.PI);
    pts.push([Hd.x + dx * rr + nx * wv * Math.sin(a), Hd.y + dy * rr + ny * wv * Math.sin(a)]); }
  cut(ribbonAlong(pts, 7), C.goldPale, { sh: .4, grain: .1 });
  puppet(k.x, PAVE_Y, S_KID, -1, kidSpec(k, 1, 1), pose);
}

// ---------------- the street (unchanged from draft 1; two more houses on the right for the walk-out) ----------------
const HOUSES = [...Array(12).keys()].map((i) => ({ x: -420 + i * 400, w: 380, h: 470 + (i % 3) * 40, seed: i * 13 + 2 }));
const BACK = [...Array(12).keys()].map((i) => ({ x: -300 + i * 330, w: 300, h: 470 + hash(i * 3.3) * 170, seed: i * 7 + 50, gable: i % 3 === 1 }));
function skyDusk() {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, C.sky0); gr.addColorStop(.55, C.sky1); gr.addColorStop(1, C.sky2);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
}
function stoop(dx, col) {
  for (let s = 0; s < 3; s++) cut(cutRect(dx - 70 + s * 10, HOUSE_BASE - 32 - s * 30, 140 - s * 20, 34, 71 + s + dx, 1.5), col, { sh: .6, grain: .2 });
  g.save(); g.strokeStyle = C.ink; g.lineWidth = 5; g.lineCap = 'round';
  for (const sx of [-78, 78]) { g.beginPath(); g.moveTo(dx + sx, HOUSE_BASE - 10); g.lineTo(dx + sx * .8, HOUSE_BASE - 130); g.stroke(); }
  g.restore();
}
const SILL_COLS = [C.rose, C.cream, C.gold];
function sillFlowers(hs, t) {
  const cols = Math.max(2, Math.floor(hs.w / 120)), rows = Math.max(1, Math.floor((hs.h - 120) / 150));
  const r = rows - 1, wyS = HOUSE_BASE - hs.h + 60 + r * 150 + 78;
  for (let c = 1; c < cols; c++) {
    const wx = hs.x + (c + .5) * hs.w / cols;
    const at = T.goes + (wx - herX(T.goes)) / 900;
    for (let f = 0; f < 3; f++) {
      const k = pop(t, at + f * .08, .45); if (k <= 0) continue;
      flower(wx - 22 + f * 22, wyS - 6 - 10 * k, 13 * k, SILL_COLS[(c + f + hs.seed) % 3], C.gold, t * .3 + f, { grain: .1 });
    }
  }
}
function street(t, cam) {
  skyDusk();
  g.save(); g.translate(-cam * .5, 0);
  BACK.forEach((b) => {
    const y = HOUSE_BASE - 140, top = y - b.h;
    if (b.x - cam * .5 > W + 40 || b.x + b.w - cam * .5 < -80) return;
    const body = b.gable ? poly([[b.x, y], [b.x, top], [b.x + b.w / 2, top - b.w * .3], [b.x + b.w, top], [b.x + b.w, y]]) : cutRect(b.x, top, b.w, b.h, b.seed);
    cut(body, C.sky1, { sh: .5, grain: .22 });
    if (!b.gable) cut(cutRect(b.x + b.w * .7, top - 46, 34, 50, b.seed + 3), C.sky1, { sh: .4, grain: .2 });
    for (let w = 0; w < 2; w++) if (hash(b.seed + w * 9) > .45) cut(rect(b.x + 50 + w * (b.w - 140), top + 50, 40, 54), C.goldPale, { sh: 0, grain: .2, alpha: .75 });
  });
  g.restore();
  g.save(); g.translate(-cam, 0);
  HOUSES.forEach((hs) => {
    if (hs.x - cam > W + 40 || hs.x + hs.w - cam < -40) return;
    house(hs.x, HOUSE_BASE, hs.w, hs.h, HOUSE_COL, { lit: 1, seed: hs.seed, door: true, darkWin: C.sky1, winCol: C.goldPale });
    sillFlowers(hs, t);
    stoop(hs.x + hs.w / 3 / 2, STOOP_COL);
  });
  cut(cutRect(cam - 20, HOUSE_BASE - 6, W + 40, H - HOUSE_BASE + 20, 91, 2), C.sky1, { sh: .7, lift: .2 });
  cut(cutRect(cam - 20, 1010, W + 40, 12, 92, 2), C.sky2, { sh: .3, grain: .1 });
  streetLamp(LAMP_X, HOUSE_BASE + 30, HOUSE_BASE + 30 - LAMP_TOP, 1);
  g.restore();
}
const vis = (x, cam, m = 220) => x - cam > -m && x - cam < W + m;
function people(t, cam) {
  const h = herX(t);
  g.save(); g.translate(-cam, 0);
  KIDS.forEach((k, i) => { if (k.seat && vis(k.x, cam)) seatedKid(k, i, t, h); });
  if (vis(KB.x, cam)) ballKid(t);
  if (vis(KF.x, cam)) flowerKid(t);
  if (t > 168 && vis(2120, cam, 400)) hopscotch(t);
  if (t > 168 && vis(KIDS[6].x, cam)) skipKid(t);
  if (h - cam > -200) herDraw(t);
  if (t > 170 && t < 178.5 && vis(KB.x, cam, 700)) drawBall(t);
  g.restore();
}

// ---- 10a: the street, she walks in under the lamp, the kids watch her with slit eyes and turn as she passes ----
SHOT(T.start, T.the, 'street-wide', (t) => {
  street(t, camX(t));
  people(t, camX(t));
}, { xin: .7, tr: 'fade' });

// ---- 10b: close on two kids' heads; the slits soften into closed happy crescents on "don't" and "look" ----
SHOT(T.the, T.susp - .06, 'street-eyes', (t, k, d) => {
  skyDusk();
  const drift = d * 14;
  cut(circle(760 - drift, 500, 400), C.goldPale, { sh: .4, grain: .25 });
  cut(circle(760 - drift, 500, 368), C.sun, { sh: .5, grain: .25 });
  const heads = [
    { kd: KIDS[1], hair: [HAIR.curls], x: 1500 - drift * 1.4, y: 930, s: .8, at: T.look, seed: 1.3, bg: C.sky1 },
    { kd: KIDS[0], hair: [HAIR.bob], x: 820 - drift * 1.8, y: 900, s: 1.0, at: T.dont, seed: 0, bg: C.sun },
  ];
  heads.forEach((hd) => {
    const s = ss(hd.at, hd.at + .45, t), warm = ss(hd.at, hd.at + .4, t);
    const col = mixC(hd.kd.col, C.sky1, .36 * (1 - warm));
    const laugh = bump(t, hd.at + .15, 1.1) * .5;
    g.save(); g.translate(hd.x, hd.y); g.scale(-hd.s, hd.s);           // facing left, toward her
    // suspicious: chin tucked; softened: chin lifts with the smile
    g.rotate(-.05 * (1 - warm) + .05 * warm + laugh * .08 + jit(t, hd.seed, .002));
    g.translate(-580, -800);
    cut(blob([[330, 980], [470, 900], [700, 900], [860, 980], [900, 1400], [300, 1400]], .5), col, { sh: .9, lift: .6, grain: .25 });
    cut(HEADS.child, col, { sh: 1, lift: .8, grain: .28 });
    hd.hair.forEach((hp) => cut(hp, col, { sh: .55, grain: .24 }));
    eyeDraw(s, hd.bg, .55);
    g.restore();
    // a little gold laugh as the eye softens (rings ride out from the mouth, toward her)
    const mx = hd.x - (790 - 580) * hd.s, my = hd.y - (800 - 640) * hd.s;
    laughRings(t, mx, my, hd.at + .2, { n: 3, dir: Math.PI + .25, spread: .55, reach: 330, life: 1.5, w0: 11, scale: hd.s });
  });
}, { xin: .25, tr: 'fade' });

// ---- 10c: wide again: an ordinary warm street, she walks on through it and out ----
SHOT(T.susp - .06, T.end, 'street-walk', (t) => {
  street(t, camX(t));
  people(t, camX(t));
}, { xin: .3, tr: 'fade' });
})();

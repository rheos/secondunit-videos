// 106.0-124.0  "In her dream the television's broken / the only words spoken are real and in front
// of her eyes". Her front room: she sits in an armchair facing an old set full of grey paper static.
// On "broken" the screen tears and goes dark; on "only words spoken" the static spills out of the tear
// and the grey squares fall into place as her three kids; on "real" they are solid paper; on "in front
// of her eyes" their words loop to her as gold ribbons, and her globe lamp warms into a halo (the hand-off
// to 08's close profile).
(() => {
const T = {
  a: 106.0, dream: wordAt('dream', 0, 107.5), tv: wordAt("television's", 0, 110), broken: wordAt('broken', 0, 110),
  only: wordAt('only', 0, 117), words: wordAt('words', 0, 117), spoken: wordAt('spoken', 0, 117), real: wordAt('real', 0, 120),
  and: wordAt('and', 0, 121.5), front: wordAt('front', 0, 121.5), her: wordAt('her', 0, 123), eyes: wordAt('eyes', 0, 123), b: 124.0,
};
const FLOOR = 960, S = .75;
const P = { wall: C.rose, wallLine: C.roseDeep, floor: C.roseDeep, chair: C.roseDark, chairDeep: '#b15e5a',
  tv: C.w2, tvDeep: C.w1, scr: C.w0, st: [C.w1, C.w2, C.w3, C.w4, '#d5d9e1'], ink: C.ink, gold: C.gold, goldPale: C.goldPale, cream: C.cream };
const plant = (s, h = 1) => 24 * s * h;

// ---------- the room's pieces ----------
const TV = { x: 1390, y: 430, w: 460, h: 360 };                       // the cabinet box
const SCR = { x: TV.x + 42, y: TV.y + 42, w: 300, h: 256, r: 50 };   // the rounded screen
const SCR_C = [SCR.x + SCR.w / 2, SCR.y + SCR.h / 2];
const CRACK = (() => {                                               // a ragged tear across the screen
  const pts = []; const n = 22;
  for (let i = 0; i <= n; i++) { const u = i / n;
    pts.push([SCR.x - 8 + (SCR.w + 16) * u + (hash(i * 3.3) - .5) * 6, SCR.y + SCR.h * (.42 + .16 * u) + Math.sin(u * 7) * 16 + (hash(i * 5.1) - .5) * 16]); }
  return pts;
})();
const scrPath = () => rrect(SCR.x, SCR.y, SCR.w, SCR.h, SCR.r);
function staticSnow(t, alive) {
  // grey paper squares jittering on twos, with a rolling bright band
  g.save(); g.clip(scrPath());
  const cs = 18, f = Math.floor(t * 12);
  const band = SCR.y + ((t * 90) % (SCR.h + 120)) - 60;
  for (let y = SCR.y; y < SCR.y + SCR.h; y += cs) for (let x = SCR.x; x < SCR.x + SCR.w; x += cs) {
    const h = hash(x * 1.7 + y * 13.1 + f * 7.7);
    let v = Math.floor(h * 5); if (Math.abs(y - band) < 30) v = Math.min(4, v + 2);
    g.fillStyle = P.st[v]; g.globalAlpha = 1; g.fillRect(x, y, cs - 2, cs - 2);
  }
  g.restore();
  // a soft glass sheen
  g.save(); g.globalAlpha *= .14 * alive; g.fillStyle = '#fff'; g.fill(ellipse(SCR.x + 80, SCR.y + 60, 90, 40, -.4)); g.restore();
}
function tvSet(t, A0) {
  const brk = t >= T.broken;
  // a jolt on "television's" and a bigger one on "broken"
  const jolt = bump(t, T.tv, .25) * 6 + bump(t, T.broken, .35) * 16;
  g.save(); g.translate(jit(t, 41) * jolt * .3, -jolt);
  // rabbit-ear antenna, twitching on "dream"
  const tw = bump(t, T.dream, .8) * .25 * Math.sin(t * 30) + bump(t, T.broken, .6) * .3;
  g.save(); g.strokeStyle = P.ink; g.lineWidth = 5; g.lineCap = 'round';
  const ax = TV.x + TV.w * .55, ay = TV.y;
  g.beginPath(); g.moveTo(ax, ay - 20); g.lineTo(ax - 120 * Math.cos(.9 + tw), ay - 20 - 170 * Math.sin(.9 + tw)); g.stroke();
  g.beginPath(); g.moveTo(ax, ay - 20); g.lineTo(ax + 140 * Math.cos(1.05 - tw), ay - 20 - 160 * Math.sin(1.05 - tw)); g.stroke();
  g.restore();
  cut(ellipse(ax, ay - 14, 40, 22), P.tvDeep, { sh: .5 });
  // legs
  cut(poly([[TV.x + 50, TV.y + TV.h - 4], [TV.x + 72, TV.y + TV.h - 4], [TV.x + 52, FLOOR], [TV.x + 36, FLOOR]]), P.ink, { sh: .5 });
  cut(poly([[TV.x + TV.w - 72, TV.y + TV.h - 4], [TV.x + TV.w - 50, TV.y + TV.h - 4], [TV.x + TV.w - 36, FLOOR], [TV.x + TV.w - 52, FLOOR]]), P.ink, { sh: .5 });
  // cabinet, screen bezel, knobs, speaker slots
  cut(rrect(TV.x, TV.y, TV.w, TV.h, 30), P.tv, { sh: 1, lift: .5, grain: .25 });
  cut(rrect(SCR.x - 16, SCR.y - 16, SCR.w + 32, SCR.h + 32, SCR.r + 12), P.tvDeep, { sh: .3 });
  const kx = TV.x + TV.w - 62;
  cut(circle(kx, TV.y + 86, 24), P.tvDeep, { sh: .5 }); cut(circle(kx, TV.y + 156, 18), P.tvDeep, { sh: .5 });
  g.save(); g.fillStyle = P.tvDeep; for (let i = 0; i < 5; i++) g.fill(rrect(kx - 26, TV.y + 206 + i * 18, 52, 7, 3)); g.restore();
  // the screen: static, then torn and dark
  if (!brk) {
    staticSnow(t, 1);
    // restless static: little bursts of squares hop out over the bezel and drop back in
    for (let b = 0; b < 6; b++) {
      const t0 = T.dream + 2.6 + b * .78; const d = t - t0; if (d < 0 || d > .7) continue;
      for (let j = 0; j < 5; j++) {
        const hx = SCR.x + 30 + hash(b * 9 + j) * (SCR.w - 60), up = (60 + hash(b * 3 + j * 7) * 90) * Math.sin(d / .7 * Math.PI);
        g.fillStyle = P.st[1 + (j + b) % 4]; g.fillRect(hx + (hash(j + b) - .5) * 40 * d, SCR.y + 6 - up, 16, 16);
      }
    }
  }
  else {
    cut(scrPath(), P.scr, { sh: 0, grain: .3 });
    // the tear: the screen paper ripped across, its pale torn core showing, the halves pulled apart
    const open = eo(clamp((t - T.broken) / .3));
    g.save(); g.clip(scrPath());
    const edge = new Path2D();
    CRACK.forEach(([x, y], i) => { const yy = y - (3 + hash(i * 7.7) * 7) * open; i ? edge.lineTo(x, yy) : edge.moveTo(x, yy); });
    for (let i = CRACK.length - 1; i >= 0; i--) edge.lineTo(CRACK[i][0] + 2, CRACK[i][1] + (4 + hash(i * 9.9) * 9) * open);
    edge.closePath(); cut(edge, P.st[4], { sh: .5, grain: .35 });
    // a last flicker of static in the lower half just as it breaks
    if (t < T.broken + .25) { g.save(); g.clip(rect(SCR.x, CRACK[0][1], SCR.w, SCR.h)); staticSnow(t, 0); g.restore(); }
    g.restore();
  }
  g.restore();
}
function armchair(front) {
  if (!front) {
    cut(rrect(HX - 180, 520, 250, 300, [90, 90, 20, 20]), P.chair, { sh: .9, lift: .3 });      // the back, a wing
    cut(cutRect(HX - 150, 720, 380, 80, 712), P.chairDeep, { sh: .5 });                          // seat
    cut(poly([[HX - 134, 790], [HX - 108, 790], [HX - 116, FLOOR], [HX - 130, FLOOR]]), P.ink, { sh: .4 });   // back leg
  } else {
    cut(rrect(HX - 90, 736, 310, 100, [40, 40, 14, 14]), P.chair, { sh: .8, lift: .3 });       // the near arm
    cut(cutRect(HX - 170, 810, 420, 54, 713), P.chair, { sh: .7, lift: .2 });                  // skirt of the chair
    cut(poly([[HX + 198, 860], [HX + 224, 860], [HX + 230, FLOOR], [HX + 212, FLOOR]]), P.ink, { sh: .4 });   // front leg
  }
}
// a globe lamp on a tall stand behind her chair; warm 0..1 lights it gold
function globeLamp(warm, t) {
  const x = HX + 4, y = HEAD_Y, r = 150;
  cut(cutRect(x - 6, y, 12, FLOOR - y, 721), P.ink, { sh: .5 });
  if (warm > 0) {
    g.save(); g.globalAlpha *= warm * .6; const gr = g.createRadialGradient(x, y, r * .6, x, y, r * 3.2);
    gr.addColorStop(0, 'rgba(247,210,126,.95)'); gr.addColorStop(1, 'rgba(247,210,126,0)'); g.fillStyle = gr; g.fill(circle(x, y, r * 3.2)); g.restore();
  }
  cut(circle(x, y, r), P.cream, { sh: .6, lift: .3 });
  if (warm > 0) { g.save(); g.globalAlpha *= warm; cut(circle(x, y, r + 2), P.goldPale, { sh: 0, grain: .25 }); cut(circle(x, y, r * .82), C.sun, { sh: 0, grain: .2 }); g.restore(); }
}

// ---------- her, seated in the armchair ----------
function lapSkirt(a) {
  const sA = clamp(a / 1.55), d = [Math.sin(a), Math.cos(a)], n = [d[1], -d[0]];
  const H = [6, -540], at = (u, v) => [H[0] + u * d[0] + v * n[0], H[1] + u * d[1] + v * n[1]];
  const M = at(140, 50), KT = at(268, 42), KF = at(300, 4);
  const hemY = KF[1] + 165;
  const HF = [KF[0] + 22, hemY], HB = [KF[0] - 120, hemY];
  const pts = [[44, -630], [68, -592], M, KT, KF];
  const nS = 6; for (let i = 0; i <= nS; i++) { const u = i / nS; pts.push([lerp(HF[0], HB[0], u), hemY + (i % 2 ? 9 : -2)]); }
  pts.push(at(100, -50), [-58, -520], [-62, -600], [-50, -640]);
  return blob(pts, .4);
}
const HER_SIT = { ...CAST.her, lace: false, kind: 'shirt', acc: [() => cut(lapSkirt(1.55), C.navy, { sh: .5, grain: .26, lift: .2 })] };
const HX = 340, HIP_Y = 742, HEAD_Y = HIP_Y - 352 * S;   // HEAD_Y: the centre of her head

// ---------- the kids, built from squares of static ----------
const KIDS = [
  { spec: CAST.girl3, x: 830, at: T.only - .1 },
  { spec: CAST.boy8, x: 1020, at: T.only + .25 },
  { spec: CAST.girl11, x: 1210, at: T.only + .6 },
];
const CELL = 15;
let TARGETS = null;                       // sampled once from offscreen renders of the kids (deterministic)
function kidPose(i, t) {
  const talk = t > T.and - .2 ? Math.max(0, Math.sin((t - T.and) * 9 + i * 2)) : 0;
  const wave = eio(clamp(2.4 * (i === 1 ? bump(t, T.front - .25, 1.5) : i === 2 ? bump(t, T.her - .2, 1.1) : 0)));
  return { head: .05 + talk * .05, bob: -talk * 6, arms: [[lerp(.25, 2.5 + Math.sin(t * 8) * .2, wave), lerp(.3, .35, wave)], [.05, .2]] };
}
function drawKid(i, t, extra = {}) { const k = KIDS[i]; puppet(k.x, FLOOR + plant(S, k.spec.height), S, -1, k.spec, { ...kidPose(i, t), ...extra }); }
function sampleTargets() {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const o = c.getContext('2d');
  const keep = g; const res = [];
  KIDS.forEach((k, i) => {
    o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, W, H); g = o;
    try { puppet(k.x, FLOOR + plant(S, k.spec.height), S, -1, { ...k.spec }, { head: .05, arms: [[.25, .3], [.05, .2]] }); } finally { g = keep; }
    const d = o.getImageData(0, 0, W, H).data;
    for (let y = 0; y < H; y += CELL) for (let x = k.x - 260; x < k.x + 260; x += CELL) {
      const a = d[((y + CELL / 2 | 0) * W + (x + CELL / 2 | 0)) * 4 + 3];
      if (a > 200) res.push({ kid: i, x, y, h: hash(x * .37 + y * 1.13 + i) });
    }
  });
  return res;
}

SHOT(T.a, T.b, 'tv', (t) => {
  const A0 = g.globalAlpha;
  if (!TARGETS) TARGETS = sampleTargets();

  // ---------- camera ----------
  // wide; a slow push toward the set into "broken"; back out for the kids; then in on her for the hand-off
  const zIn = eio(clamp((t - (T.dream + .6)) / (T.broken - T.dream - .4))) * (1 - eio(clamp((t - (T.broken + .9)) / 1.6)));
  const zHer = eio(clamp((t - (T.front - .4)) / (T.b - T.front + .4)));
  const z = 1 + zIn * .1 + zHer * .7;
  const fx = lerp(lerp(960, 1000, zIn), HX + 40, zHer), fy = lerp(lerp(540, 600, zIn), HEAD_Y, zHer);
  const tx = lerp(960, 860, zHer), ty = lerp(540, 520, zHer);
  g.save(); g.translate(tx, ty); g.scale(z, z); g.translate(-fx, -fy);

  // ---------- room ----------
  sheet(P.wall);
  // tone-on-tone striped wallpaper
  g.save(); g.globalAlpha *= .22; g.fillStyle = P.wallLine;
  for (let x = -200; x < W + 200; x += 64) g.fill(rect(x, 264, 18, FLOOR - 264));
  g.restore();
  cut(cutRect(-200, FLOOR, W + 400, 400, 701), P.floor, { sh: .6 });
  cut(cutRect(-200, 250, W + 400, 14, 702), P.wallLine, { sh: .3, grain: .15 });          // picture rail
  // a rug in front of the set
  cut(ellipse(980, FLOOR + 60, 560, 46), P.chair, { sh: .4, grain: .3 });

  const warm = ss(T.her - .3, T.eyes + .3, t);
  globeLamp(warm, t);
  tvSet(t, A0);

  // ---------- her ----------
  armchair(false);
  const lift = ss(T.real - .2, T.real + .5, t);                     // she lifts her head when they are real
  const laughK = bump(t, T.eyes - .1, 1.8) * .9;
  const slump = (1 - ss(T.broken, T.broken + .6, t)) * -.12 + ss(T.broken, T.broken + .6, t) * (1 - lift) * .02;
  const pose = { sit: true, legs: [[1.55, 1.6], [1.5, 1.65]], head: slump + lift * .1, laugh: laughK,
    arms: [[.45 + lift * .2, 1.05 + lift * .3], [.4, 1.0]], lean: -.04 + bump(t, T.broken, .5) * -.05 + lift * .05 };
  puppet(HX, HIP_Y + 270 * S - 2, S, 1, HER_SIT, pose);
  armchair(true);
  // her closed, smiling eye cut from the big head as the camera arrives (the 04 motif), only when close
  if (zHer > .6) {
    g.save(); g.translate(HX, HIP_Y + 270 * S - 2); g.scale(S, S); g.translate(0, 270); g.rotate(pose.lean);
    g.translate(10, -790); g.rotate(-pose.head * .9 - laughK * .18); g.scale(.265, .265); g.translate(-580, -800);
    g.strokeStyle = C.rose; g.globalAlpha *= ss(.6, .9, zHer); g.lineWidth = 16; g.lineCap = 'round';
    g.beginPath(); g.arc(706, 448, 26, Math.PI * .12, Math.PI * .88); g.stroke(); g.restore();
  }

  // ---------- the kids ----------
  const solid = pop(t, T.real - .05, .5);
  if (solid > 0) {
    KIDS.forEach((k, i) => {
      const sc = 1 + (1 - Math.min(1, solid)) * .0 + (solid > 1 ? (solid - 1) * .25 : 0);
      g.save(); g.translate(k.x, FLOOR); g.scale(sc, sc); g.translate(-k.x, -FLOOR); drawKid(i, t); g.restore();
    });
  }
  // the squares: spill out of the tear, arc over, fall into place; fade as the paper kids arrive
  const sqA = 1 - clamp((t - T.real) / .25);
  if (t > T.only - .3 && sqA > 0) {
    const src = CRACK;
    g.save(); g.globalAlpha *= sqA;
    for (const q of TARGETS) {
      const k = KIDS[q.kid];
      const start = k.at + q.h * 1.3 + (FLOOR - q.y) / 900;       // low squares first, so the kids build up from the floor
      const dur = .9 + hash(q.h * 9) * .5;
      const u = clamp((t - start) / dur);
      if (u <= 0) continue;
      const c = src[1 + Math.floor(q.h * (src.length - 2))];
      const e = eio(u);
      const x = lerp(c[0], q.x, e) + Math.sin(u * Math.PI) * (hash(q.h * 3) - .5) * 160;
      const y = lerp(c[1], q.y, e) - Math.sin(u * Math.PI) * (160 + hash(q.h * 5) * 240);
      const sz = CELL - 2;
      const landed = u >= 1;
      const col = landed ? C.navy : P.st[1 + Math.floor(hash(q.h * 7 + Math.floor(t * 12)) * 4)];
      g.save(); g.translate(x + sz / 2, y + sz / 2); g.rotate((1 - e) * (hash(q.h * 11) - .5) * 6);
      g.fillStyle = col; g.fillRect(-sz / 2, -sz / 2, sz, sz); g.restore();
    }
    g.restore();
  }

  // ---------- their words: paper ribbons (banderoles) floating from each kid to her ----------
  if (t > T.and - .3) {
    const face = [HX + 100, HEAD_Y + 4];
    KIDS.forEach((k, i) => {
      const t0 = T.and - .25 + i * .3, grow = eo(clamp((t - t0) / 1.2));
      if (grow <= 0) return;
      const hd = FLOOR - 1000 * S * k.spec.height * .84;
      const mouth = [k.x - 70 * S, hd];
      const lift = 70 + i * 70, pts = [], n = 30;
      for (let j = 0; j <= n * grow; j++) {
        const u = j / n;
        const bx = lerp(mouth[0], face[0], u), by = lerp(mouth[1], face[1], u) - Math.sin(u * Math.PI) * lift;
        pts.push([bx, by + Math.sin(u * 7 - t * 5 + i) * 12 * Math.sin(u * Math.PI)]);
      }
      if (pts.length > 2) cut(ribbonAlong(pts, 18 - i * 3), [P.gold, P.goldPale, P.cream][i], { sh: .55, grain: .2, lift: .2 });
    });
  }

  g.restore();
  g.globalAlpha = A0;
}, { xin: 1.0, tr: 'iris', ix: SCR_C[0], iy: SCR_C[1] });
})();

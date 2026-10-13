// 106.0-124.0  "In her dream the television's broken / the only words spoken are real and in front
// of her eyes". Her front room in warm afternoon light: she sits in an armchair facing an old set.
// The diner's pie dome fills with static and a round hole opens in the diner from it (the dome is the
// set's screen; her head stays put across the cut). The set flicks through grey "channels" (a
// newsreader, an ad, a finger-wagging talking head: false words) while stray squares drift toward her
// on "dream". On "broken" the screen tears and goes dark; on "only words spoken" the static spills out of
// the tear and the grey squares fall into place as her three kids; on "real" they are solid paper; on
// "in front of her eyes" their words loop to her as gold ribbons and her globe lamp warms into a halo
// (08 opens from where the ribbons meet).
(() => {
const T = {
  a: 106.0, dream: wordAt('dream', 0, 107.5), tv: wordAt("television's", 0, 110), broken: wordAt('broken', 0, 110),
  only: wordAt('only', 0, 117), words: wordAt('words', 0, 117), spoken: wordAt('spoken', 0, 117), real: wordAt('real', 0, 120),
  and: wordAt('and', 0, 121.5), front: wordAt('front', 0, 121.5), her: wordAt('her', 0, 123), eyes: wordAt('eyes', 0, 123), b: 124.0,
};
const BEAT = (n) => 124.02 - .769 * n;       // the pulse, counted back from 08's first beat
const FLOOR = 960, S = .75;
const P = { wall: C.rose, wallLine: C.roseDeep, floor: C.roseDeep, chair: C.roseDark, chairDeep: '#b15e5a',
  tv: C.w2, tvDeep: C.w1, scr: C.w0, st: [C.w1, C.w2, C.w3, C.w4, '#d5d9e1'], ink: C.ink, gold: C.gold, goldPale: C.goldPale, cream: C.cream };
const plant = (s, h = 1) => 24 * s * h;

// ---------- the iris out of the diner: a round hole cut in 06's sheet, opening from the pie dome ----------
const IRIS0 = 106.6, IRISD = .85;
const IC = [1563, 590];                              // the pie dome in 06's frame = the set's screen here
const RMAX = Math.hypot(IC[0], H - IC[1]) + 60;
let PREV = null;
function drawShotNamed(name, t) {
  // 06 is a pure function of t, so we can draw it ourselves and cut a hole in it
  const sh = SHOTS.find((s) => s.name === name); if (!sh) return null;
  if (!PREV) { PREV = document.createElement('canvas'); PREV.width = W; PREV.height = H; }
  const o = PREV.getContext('2d'), keep = g;
  o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1; o.globalCompositeOperation = 'source-over'; o.filter = 'none'; o.clearRect(0, 0, W, H);
  g = o;
  try { sh.fn(t, clamp((t - sh.a) / (sh.b - sh.a)), t - sh.a, t); } catch (e) { console.error(name, e); } finally { g = keep; }
  return PREV;
}
function holePath(r) {
  const p = new Path2D(), n = 96;
  for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, rr = r + (hash(i * 4.1) - .5) * 5;
    i ? p.lineTo(IC[0] + Math.cos(a) * rr, IC[1] + Math.sin(a) * rr) : p.moveTo(IC[0] + Math.cos(a) * rr, IC[1] + Math.sin(a) * rr); }
  p.closePath(); return p;
}
function dinerOver(t) {
  const img = drawShotNamed('diner', t); if (!img) return;
  const r = eio((t - IRIS0) / IRISD) * RMAX;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const outside = new Path2D(); outside.rect(-20, -20, W + 40, H + 40);
  if (r > 1) {
    outside.addPath(holePath(r));
    // the diner sheet's edge casts its shadow into the hole
    g.save(); g.clip(holePath(r));
    g.shadowColor = 'rgba(20,16,30,.42)'; g.shadowBlur = 26; g.shadowOffsetX = 7; g.shadowOffsetY = 11;
    g.fillStyle = '#000'; g.fill(outside, 'evenodd'); g.restore();
  }
  g.clip(outside, 'evenodd'); g.drawImage(img, 0, 0);
  g.restore();
}

// ---------- the room's pieces ----------
const TV = { x: 1500, y: 430, w: 460, h: 360 };                       // the cabinet box
const SCR = { x: TV.x + 42, y: TV.y + 42, w: 300, h: 256, r: 50 };   // the rounded screen
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
    g.fillStyle = P.st[v]; g.fillRect(x, y, cs - 2, cs - 2);
  }
  g.restore();
  g.save(); g.globalAlpha *= .14 * alive; g.fillStyle = '#fff'; g.fill(ellipse(SCR.x + 80, SCR.y + 60, 90, 40, -.4)); g.restore();
}

// ---------- the channels: false words, all in grey paper ----------
const CH = [[0, 'static'], [BEAT(19), 'news'], [BEAT(17), 'ad'], [BEAT(15), 'talk'], [BEAT(14), 'news'], [BEAT(14) + .385, 'ad'],
  [BEAT(13), 'talk'], [BEAT(13) + .385, 'static']];
function channelAt(t) { let c = CH[0], i0 = 0; CH.forEach((x, i) => { if (t >= x[0]) { c = x; i0 = i; } }); return { kind: c[1], since: t - c[0], i: i0 }; }
// grey squares pouring out of a mouth: words that mean nothing
function wordSquares(t, x, y, dir, seed) {
  for (let j = 0; j < 9; j++) {
    const u = ((t * 1.6 + hash(j + seed)) % 1), sz = 7 + hash(j * 3 + seed) * 7;
    g.fillStyle = P.st[2 + (j % 3)]; g.fillRect(x + dir * u * 150, y - 6 + Math.sin(u * 9 + j) * 10 - u * 20, sz, sz);
  }
}
function chNews(t, since) {
  const cx = SCR.x + SCR.w * .58, cy = SCR.y + SCR.h;
  g.fillStyle = C.w3; g.fillRect(SCR.x, SCR.y, SCR.w, SCR.h);
  cut(rect(SCR.x + 22, SCR.y + 30, 96, 66), C.w2, { sh: .2, grain: .1 });                            // the map behind him
  cut(blob([[cx - 120, cy + 10], [cx - 104, cy - 70], [cx - 40, cy - 100], [cx + 60, cy - 96], [cx + 110, cy - 50], [cx + 120, cy + 10]], .6), C.w0, { sh: .4 });
  const nod = Math.max(0, Math.sin(t * 13)) * .06;
  g.save(); g.translate(cx - 6, cy - 98); g.scale(-1, 1); head('short', null, C.w0, .15, -nod); g.restore();
  cut(rect(SCR.x - 4, cy - 46, SCR.w + 8, 50), C.w1, { sh: .5 });                                    // the desk
  wordSquares(t, cx - 40, cy - 118, -1, 3);
}
function chAd(t, since) {
  g.fillStyle = C.w4; g.fillRect(SCR.x, SCR.y, SCR.w, SCR.h);
  const cx = SCR.x + SCR.w / 2, cy = SCR.y + SCR.h / 2 + 6;
  const star = new Path2D(); const n = 14;
  for (let i = 0; i <= n * 2; i++) { const a = t * .9 + i / (n * 2) * Math.PI * 2, r = i % 2 ? 70 : 150;
    i ? star.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : star.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
  cut(star, C.w3, { sh: .2, grain: .1 });
  const b = 1 + (pop(t, t - since, .35) - 1) * .5 + bump(t, t - since + .385, .3) * .08;   // the product jumps in, then bounces
  g.save(); g.translate(cx, cy + 70); g.scale(b, b);
  cut(rrect(-46, -130, 92, 130, 18), C.w1, { sh: .6 });
  cut(rrect(-38, -150, 76, 26, 6), C.w0, { sh: .4 });
  cut(rect(-46, -92, 92, 34), C.w4, { sh: .2, grain: .1 });
  cut(star4(0, -75, 13), C.w2, { sh: 0, grain: .1 });
  g.restore();
}
function chTalk(t, since) {
  g.fillStyle = C.w2; g.fillRect(SCR.x, SCR.y, SCR.w, SCR.h);
  g.save(); g.translate(SCR.x + SCR.w * .7, SCR.y + SCR.h + 30); g.scale(-1, 1); head('short', null, C.w0, .3, Math.sin(t * 11) * .03); g.restore();
  // a wagging finger
  g.save(); g.translate(SCR.x + 70, SCR.y + SCR.h + 10); g.rotate(-.25 + Math.sin(t * 15) * .25);
  cut(rrect(-22, -120, 44, 130, 18), C.w1, { sh: .5 });
  cut(rrect(-12, -190, 18, 80, 9), C.w1, { sh: .4 });
  g.restore();
  wordSquares(t, SCR.x + SCR.w * .38, SCR.y + SCR.h * .62, -1, 7);
}
function screenContent(t) {
  const c = channelAt(t);
  if (c.kind === 'static' || c.since < .17) { staticSnow(t, 1); return c; }
  g.save(); g.clip(scrPath());
  // a slight vertical roll when the channel lands
  g.translate(0, (1 - clamp(c.since / .3)) * 18);
  ({ news: chNews, ad: chAd, talk: chTalk })[c.kind](t, c.since);
  // scan bars
  g.globalAlpha *= .14; g.fillStyle = '#fff'; for (let y = SCR.y; y < SCR.y + SCR.h; y += 9) g.fillRect(SCR.x, y, SCR.w, 3);
  g.restore();
  g.save(); g.globalAlpha *= .14; g.fillStyle = '#fff'; g.fill(ellipse(SCR.x + 80, SCR.y + 60, 90, 40, -.4)); g.restore();
  return c;
}
function tvSet(t) {
  const brk = t >= T.broken;
  // a jolt on every channel flick, on "television's" and a bigger one on "broken"
  const flick = CH.slice(1).reduce((m, c) => m + bump(t, c[0], .2), 0);
  const jolt = flick * 3 + bump(t, T.tv, .25) * 6 + bump(t, T.broken, .35) * 16;
  g.save(); g.translate(jit(t, 41) * jolt * .3, -jolt);
  // rabbit-ear antenna, twitching on "dream" and on the flicks
  const tw = bump(t, T.dream, .8) * .25 * Math.sin(t * 30) + bump(t, T.broken, .6) * .3 + flick * .08;
  g.save(); g.strokeStyle = P.ink; g.lineWidth = 5; g.lineCap = 'round';
  const ax = TV.x + TV.w * .55, ay = TV.y;
  g.beginPath(); g.moveTo(ax, ay - 20); g.lineTo(ax - 120 * Math.cos(.9 + tw), ay - 20 - 170 * Math.sin(.9 + tw)); g.stroke();
  g.beginPath(); g.moveTo(ax, ay - 20); g.lineTo(ax + 140 * Math.cos(1.05 - tw), ay - 20 - 160 * Math.sin(1.05 - tw)); g.stroke();
  g.restore();
  cut(ellipse(ax, ay - 14, 40, 22), P.tvDeep, { sh: .5 });
  cut(poly([[TV.x + 50, TV.y + TV.h - 4], [TV.x + 72, TV.y + TV.h - 4], [TV.x + 52, FLOOR], [TV.x + 36, FLOOR]]), P.ink, { sh: .5 });
  cut(poly([[TV.x + TV.w - 72, TV.y + TV.h - 4], [TV.x + TV.w - 50, TV.y + TV.h - 4], [TV.x + TV.w - 36, FLOOR], [TV.x + TV.w - 52, FLOOR]]), P.ink, { sh: .5 });
  cut(rrect(TV.x, TV.y, TV.w, TV.h, 30), P.tv, { sh: 1, lift: .5, grain: .25 });
  cut(rrect(SCR.x - 16, SCR.y - 16, SCR.w + 32, SCR.h + 32, SCR.r + 12), P.tvDeep, { sh: .3 });
  const kx = TV.x + TV.w - 62;
  cut(circle(kx, TV.y + 86, 24), P.tvDeep, { sh: .5 }); cut(circle(kx, TV.y + 156, 18), P.tvDeep, { sh: .5 });
  g.save(); g.fillStyle = P.tvDeep; for (let i = 0; i < 5; i++) g.fill(rrect(kx - 26, TV.y + 206 + i * 18, 52, 7, 3)); g.restore();
  if (!brk) {
    screenContent(t);
    // restless static: a few squares hop out over the bezel on each flick and drop back in
    CH.slice(1).forEach(([t0], b) => {
      const d = t - t0; if (d < 0 || d > .7) return;
      for (let j = 0; j < 5; j++) {
        const hx = SCR.x + 30 + hash(b * 9 + j) * (SCR.w - 60), up = (60 + hash(b * 3 + j * 7) * 90) * Math.sin(d / .7 * Math.PI);
        g.fillStyle = P.st[1 + (j + b) % 4]; g.fillRect(hx + (hash(j + b) - .5) * 40 * d, SCR.y + 6 - up, 16, 16);
      }
    });
  } else {
    cut(scrPath(), P.scr, { sh: 0, grain: .3 });
    const open = eo(clamp((t - T.broken) / .3));
    g.save(); g.clip(scrPath());
    const edge = new Path2D();
    CRACK.forEach(([x, y], i) => { const yy = y - (3 + hash(i * 7.7) * 7) * open; i ? edge.lineTo(x, yy) : edge.moveTo(x, yy); });
    for (let i = CRACK.length - 1; i >= 0; i--) edge.lineTo(CRACK[i][0] + 2, CRACK[i][1] + (4 + hash(i * 9.9) * 9) * open);
    edge.closePath(); cut(edge, P.st[4], { sh: .5, grain: .35 });
    if (t < T.broken + .25) { g.save(); g.clip(rect(SCR.x, CRACK[0][1], SCR.w, SCR.h)); staticSnow(t, 0); g.restore(); }
    g.restore();
  }
  g.restore();
}
// on "dream": a handful of grey squares drift out of the set toward her, sink and fade before they reach her
function strays(t) {
  for (let i = 0; i < 16; i++) {
    const t0 = T.dream - .1 + hash(i * 2.7) * 1.1, life = 1.8 + hash(i * 5.3) * .7, u = (t - t0) / life;
    if (u <= 0 || u >= 1) continue;
    const reach = .55 + hash(i * 8.1) * .2;                       // how far toward her it gets
    const sx = SCR.x + 20 + hash(i * 1.9) * (SCR.w - 40), sy = SCR.y + 30 + hash(i * 3.3) * (SCR.h - 60);
    const e = eo(u) * reach;
    const x = lerp(sx, HX + 140, e), y = lerp(sy, HEAD_Y + 10, e) + Math.sin(u * 6 + i) * 18 + ei(u) * 120;
    g.save(); g.globalAlpha *= 1 - ss(.55, 1, u); g.translate(x, y); g.rotate(u * (hash(i) - .5) * 5);
    g.fillStyle = P.st[1 + i % 4]; g.fillRect(-7, -7, 14, 14); g.restore();
  }
}
function armchair(part) {
  if (part === 'back') {
    cut(rrect(HX - 180, 520, 250, 300, [90, 90, 20, 20]), P.chair, { sh: .9, lift: .3 });      // the back, a wing
    cut(cutRect(HX - 150, 720, 380, 80, 712), P.chairDeep, { sh: .5 });                          // seat
    cut(poly([[HX - 134, 790], [HX - 108, 790], [HX - 116, FLOOR], [HX - 130, FLOOR]]), P.ink, { sh: .4 });   // back leg
    cut(poly([[HX + 168, 860], [HX + 194, 860], [HX + 200, FLOOR], [HX + 182, FLOOR]]), P.ink, { sh: .4 });   // front leg, behind her shins
    cut(cutRect(HX - 170, 810, 400, 54, 713), P.chair, { sh: .7, lift: .2 });                   // skirt of the chair, under her lap
  } else {
    cut(rrect(HX - 90, 736, 236, 100, [40, 40, 14, 14]), P.chair, { sh: .8, lift: .3 });       // the near arm; her knees come past it
  }
}
// a globe lamp on a tall stand behind her chair; warm 0..1 lights it gold
function globeLamp(warm) {
  const x = HX + 4, y = HEAD_Y, r = 150;
  cut(cutRect(x - 6, y, 12, FLOOR - y, 721), P.ink, { sh: .5 });
  if (warm > 0) {
    g.save(); g.globalAlpha *= warm * .6; const gr = g.createRadialGradient(x, y, r * .6, x, y, r * 3.2);
    gr.addColorStop(0, 'rgba(247,210,126,.95)'); gr.addColorStop(1, 'rgba(247,210,126,0)'); g.fillStyle = gr; g.fill(circle(x, y, r * 3.2)); g.restore();
  }
  cut(circle(x, y, r), P.cream, { sh: .6, lift: .3 });
  if (warm > 0) { g.save(); g.globalAlpha *= warm; cut(circle(x, y, r + 2), P.goldPale, { sh: 0, grain: .25 }); cut(circle(x, y, r * .82), C.sun, { sh: 0, grain: .2 }); g.restore(); }
}
// afternoon sun through a window we don't see: a slanted pale-gold patch of four panes on the wall
function sunPatch() {
  const x0 = 640, y0 = 300, w = 120, h = 190, sk = 70;
  g.save(); g.globalAlpha *= .34;
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    const px = x0 + i * (w + 18) + j * sk * (h + 18) / h, py = y0 + j * (h + 18);
    cut(poly([[px, py], [px + w, py], [px + w + sk, py + h], [px + sk, py + h]]), P.goldPale, { sh: 0, grain: .3 });
  }
  g.restore();
}

// ---------- her, seated in the armchair ----------
function lapSkirt(a) {
  const d = [Math.sin(a), Math.cos(a)], n = [d[1], -d[0]];
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
const HER_Y = HIP_Y + 270 * S - 2;

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
function drawKid(i, t) { const k = KIDS[i]; puppet(k.x, FLOOR + plant(S, k.spec.height), S, -1, k.spec, kidPose(i, t)); }
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

// ---------- camera: screen = (tx,ty) + (world - (fx,fy)) * z ----------
// M0 puts her neck exactly where 06 leaves it (diner: neck (276.8,566) under a 1.06 push about (420,700)
// = screen (268.2,558.0), figure scale .68*1.06), so the hole opens around one woman, not two.
const M0 = { fx: HX + 10 * S, fy: HER_Y - 520 * S, tx: 268.2, ty: 558.0, z: .68 * 1.06 / S };
const K1 = { fx: 1120, fy: 600, tx: 960, ty: 540, z: 1.06 };          // into "broken": the set, her profile at the left edge
const K2 = { fx: 1000, fy: 560, tx: 960, ty: 540, z: .97 };           // back out for the kids
const K3 = { fx: HX + 100, fy: HEAD_Y + 4, tx: 780, ty: 500, z: 1.1 }; // the ribbons' meeting point at (780,500): 08 irises open from it
const mixCam = (A, B, u) => ({ fx: lerp(A.fx, B.fx, u), fy: lerp(A.fy, B.fy, u), tx: lerp(A.tx, B.tx, u), ty: lerp(A.ty, B.ty, u), z: lerp(A.z, B.z, u) });

SHOT(T.a, T.b, 'tv', (t) => {
  const A0 = g.globalAlpha;
  if (t < IRIS0) { dinerOver(t); return; }
  if (!TARGETS) TARGETS = sampleTargets();

  // a slow push from the first frame of the room ("In her dream" 107.2), out for the kids, then in to where the words meet her
  const u1 = eio((t - 107.0) / (T.broken - .3 - 107.0)), u2 = eio((t - (T.broken + .7)) / 1.6), u3 = eio((t - (T.front - .7)) / (T.b - T.front + .7));
  const cm = mixCam(mixCam(mixCam(M0, K1, u1), K2, u2), K3, u3);
  g.save(); g.translate(cm.tx, cm.ty); g.scale(cm.z, cm.z); g.translate(-cm.fx, -cm.fy);

  // ---------- room: warm afternoon ----------
  sheet(P.wall);
  g.save(); g.globalAlpha *= .22; g.fillStyle = P.wallLine;
  for (let x = -400; x < W + 400; x += 64) g.fill(rect(x, 264, 18, FLOOR - 264));
  g.restore();
  sunPatch();
  cut(cutRect(-400, FLOOR, W + 800, 500, 701), P.floor, { sh: .6 });
  cut(cutRect(-400, 250, W + 800, 14, 702), P.wallLine, { sh: .3, grain: .15 });          // picture rail
  cut(ellipse(1100, FLOOR + 60, 600, 46), P.chair, { sh: .4, grain: .3 });                // a rug in front of the set

  const warm = ss(T.her - .3, T.eyes + .3, t);
  globeLamp(warm);
  tvSet(t);

  // ---------- her ----------
  armchair('back');
  const settle = ss(107.35, 107.95, t);                              // from the diner's pose into the armchair
  const lift = ss(T.real - .2, T.real + .5, t);                     // she lifts her head when they are real
  const laughK = bump(t, T.eyes - .1, 1.8) * .9;
  // she stirs on "dream", droops through the channels, starts on "television's" and on "broken"
  const watch = -ss(109.2, T.tv - .2, t) * .1 + bump(t, T.dream - .1, 1.0) * .05 + bump(t, T.tv, .5) * .06;
  const after = ss(T.broken, T.broken + .6, t);
  const headA = lerp(lerp(0, watch, settle), .02 * (1 - lift), after) + lift * .1;
  const pose = { sit: true, legs: [[lerp(1.55, 1.5, settle), lerp(1.75, 1.45, settle)], [1.5, lerp(1.8, 1.5, settle)]], head: headA, laugh: laughK,
    arms: [[lerp(.88, .45 + lift * .2, settle), lerp(.7, 1.05 + lift * .3, settle)], [lerp(.8, .4, settle), lerp(.78, 1.0, settle)]],
    lean: lerp(0, -.04, settle) + bump(t, T.broken, .5) * -.05 + lift * .05 };
  puppet(HX, HER_Y, S, 1, HER_SIT, pose);
  armchair('arm');
  // her closed, smiling eye cut from the head as the camera arrives (the 04 motif)
  if (u3 > .6) {
    g.save(); g.translate(HX, HER_Y); g.scale(S, S); g.translate(0, 270); g.rotate(pose.lean);
    g.translate(10, -790); g.rotate(-pose.head * .9 - laughK * .18); g.scale(.265, .265); g.translate(-580, -800);
    g.strokeStyle = C.rose; g.globalAlpha *= ss(.6, .9, u3); g.lineWidth = 16; g.lineCap = 'round';
    g.beginPath(); g.arc(706, 448, 26, Math.PI * 1.12, Math.PI * 1.88); g.stroke(); g.restore();
  }
  if (t < T.broken) strays(t);

  // ---------- the kids ----------
  const solid = pop(t, T.real - .05, .5);
  if (solid > 0) {
    KIDS.forEach((k, i) => {
      const sc = solid > 1 ? 1 + (solid - 1) * .25 : 1;
      g.save(); g.translate(k.x, FLOOR); g.scale(sc, sc); g.translate(-k.x, -FLOOR); drawKid(i, t); g.restore();
    });
  }
  // the squares: spill out of the tear, arc over, fall into place; fade as the paper kids arrive
  const sqA = 1 - clamp((t - T.real) / .25);
  if (t > T.only - .3 && sqA > 0) {
    g.save(); g.globalAlpha *= sqA;
    for (const q of TARGETS) {
      const k = KIDS[q.kid];
      const start = k.at + q.h * 1.3 + (FLOOR - q.y) / 900;       // low squares first, so the kids build up from the floor
      const dur = .9 + hash(q.h * 9) * .5;
      const u = clamp((t - start) / dur);
      if (u <= 0) continue;
      const c = CRACK[1 + Math.floor(q.h * (CRACK.length - 2))];
      const e = eio(u);
      const x = lerp(c[0], q.x, e) + Math.sin(u * Math.PI) * (hash(q.h * 3) - .5) * 160;
      const y = lerp(c[1], q.y, e) - Math.sin(u * Math.PI) * (160 + hash(q.h * 5) * 240);
      const sz = CELL - 2;
      const col = u >= 1 ? C.navy : P.st[1 + Math.floor(hash(q.h * 7 + Math.floor(t * 12)) * 4)];
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
      const lift2 = 70 + i * 70, pts = [], n = 30;
      for (let j = 0; j <= n * grow; j++) {
        const u = j / n;
        const bx = lerp(mouth[0], face[0], u), by = lerp(mouth[1], face[1], u) - Math.sin(u * Math.PI) * lift2;
        pts.push([bx, by + Math.sin(u * 7 - t * 5 + i) * 12 * Math.sin(u * Math.PI)]);
      }
      if (pts.length > 2) cut(ribbonAlong(pts, 18 - i * 3), [P.gold, P.goldPale, P.cream][i], { sh: .55, grain: .2, lift: .2 });
    });
  }

  g.restore();
  g.globalAlpha = A0;
  if (t < IRIS0 + IRISD) dinerOver(t);
});
})();

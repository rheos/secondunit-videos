// 07-final, 146.6-185.0. "Harta de tu bronca" (4 and 5) and the brass outro.
// A (146.6-164.6): her GOLD big close profile (In Her Dream 04-sky framing) in the sun halo. A last scrap of
//   the storm cloud drifts up to her face; on "bronca" she blows it out like a candle (a puff of gold rings,
//   the scrap tumbles off). "Ah", then "Haaarta" sung big: gold rings pour out, paper flowers bloom along the
//   bottom, one per beat; "bronca" bursts the halo.
// B (164.6-179.25): on the big brass hit the camera pulls back out of the close profile (her head becomes the
//   head of her full-figure puppet, the halo becomes the sun) to a fiesta: five friends in plum, teal, leaf,
//   sand and rose dance in on the beats, the gold paper brass band blows rings on the hits, confetti falls;
//   everyone spins together; the band breaks and the camera drifts back in on her.
// C (179.25-185): on the last chord an iris opens on her gold profile in the sun halo, everyone small behind.
//   main.js fades to black over 182-185.
// Beats and brass hits measured from work/demucs/htdemucs/harta/no_vocals.wav (out/b/07/beats.py), sung
// onsets from vocals.wav (out/b/07/voc.py).
(() => {
const T = { a: 146.6, scrapIn: 146.8, harta1: 147.43, de1: 148.77, tu1: 150.31, bronca1: 150.63, ah: 152.82, ahEnd: 155.0,
  harta2: 155.99, harta2End: 159.9, de2: 161.19, tu2: 162.81, bronca2: 163.10, ab: 164.6, pull0: 164.71, pull1: 167.2,
  dance0: 167.08, enter0: 166.49, enter1: 169.42, spin: 171.96, brk: 176.3, iris: 179.25, chord: 179.34, end: 185.0 };
// the beat grid the tracker heard (it re-locks half a beat later at 171.37: live band, syncopated brass)
const BEATS = [146.02, 146.61, 147.21, 147.79, 148.37, 148.95, 149.52, 150.11, 150.69, 151.28, 151.86, 152.47, 153.05, 153.63,
  154.22, 154.80, 155.39, 155.97, 156.56, 157.14, 157.70, 158.31, 158.89, 159.47, 160.06, 160.64, 161.23, 161.81, 162.39,
  162.98, 163.56, 164.13, 164.74, 165.33, 165.91, 166.49, 167.08, 167.66, 168.25, 168.82, 169.42, 170.01, 170.61, 171.37,
  171.96, 172.55, 173.14, 173.71, 174.30, 174.88, 175.46, 176.06, 176.66, 177.30, 177.96, 178.60, 179.25, 179.85, 180.45,
  181.05, 181.65, 182.25, 182.85, 183.45, 184.05, 184.65, 185.25];
// brass hits (onset strength in the 400-3500 Hz band), big = the whole band answers
const HITS = [[164.71, 1], [165.69, 0], [166.88, 1], [168.45, 0], [168.80, 1], [169.98, 1], [170.36, 0], [171.56, 0],
  [171.92, 1], [173.11, 1], [173.93, 0], [174.30, 0], [175.26, 0], [175.86, 0], [177.97, 1], [179.30, 1]];
const UP = [168.80, 173.11, 177.97];                                 // everyone throws their arms up
function beatOf(t) {
  let i = 0; while (i + 1 < BEATS.length && BEATS[i + 1] <= t) i++;
  const b0 = BEATS[i], b1 = BEATS[i + 1] || b0 + .6;
  return { i, f: clamp((t - b0) / (b1 - b0)), b0 };
}
const nBeat = (t, from) => beatOf(t).i - beatOf(from).i;              // whole beats since `from`

// ---- palette for the ending (gold her, cream and gold sun, carmine and cream flowers, leaf stems) ----
const GOLD = C.gold, GOLD_D = '#d6952a', CARM = '#b3262e', ROSE_F = '#cf5f7d';
const STORM = '#5c566b', STORM_D = '#4a4458', SHARD = '#8e3b3b';
const SKY = ['#e39c8b', '#eeb293', '#f6cda4'];
const HILL1 = '#dc8c7f', HILL2 = '#c9746f', FLOOR = '#a9545a', FLOOR_D = '#8f4552';

// ---- 04-sky framing, copied: ox 470, oy -150, zoom 1.3, pivots (1060,560) and (560,900) ----
const OX = 470, OY = -150, Z0 = 1.3;                                // 06-oro lands on zoom 1.3
const toHalo = (dy = 0) => { g.translate(OX, OY + dy); g.scale(Z0, Z0); };
const toHer = (tilt, dy = 0, push = 1) => { g.translate(1060, 560); g.scale(push, push); g.translate(-1060, -560);
  g.translate(OX, OY + dy); g.scale(Z0, Z0); g.translate(560, 900); g.rotate(tilt); g.translate(-560, -900); };
const SUN_C = { x: OX + Z0 * 470, y: OY + Z0 * 470 };                 // the halo centre on screen (1062, 442)
const MOUTH = { x: 784, y: 642 };
const HALO_R = 400 * Z0, RING_D = '#de8a1f';                           // 04-sky sunR 400 head units                                      // her lips, head units

// ---------------- the ground: a warm evening sky, one gradient sheet ----------------
function sky() {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, SKY[0]); gr.addColorStop(.55, SKY[1]); gr.addColorStop(1, SKY[2]);
  g.fillStyle = gr; g.fillRect(-10, -10, W + 20, H + 20); g.restore();
}
// paper sun rays around a centre (screen units), r0 = where they start
function rays(t, cx, cy, r0, grow = 0) {
  const n = 18, rot = twos(t) * .045;
  const p = new Path2D();
  for (let i = 0; i < n; i++) {
    const a = rot + i * Math.PI * 2 / n, w = Math.PI / n * (.55 + grow * .12), L = r0 + 1600;
    p.moveTo(cx + Math.cos(a - w * .25) * r0, cy + Math.sin(a - w * .25) * r0);
    p.lineTo(cx + Math.cos(a - w) * L, cy + Math.sin(a - w) * L); p.lineTo(cx + Math.cos(a + w) * L, cy + Math.sin(a + w) * L);
    p.lineTo(cx + Math.cos(a + w * .25) * r0, cy + Math.sin(a + w * .25) * r0); p.closePath();
  }
  cut(p, C.goldPale, { sh: .35, grain: .2, alpha: .78 });
}
// the halo: a goldPale ring and a cream sun disc (screen centre, radius of the disc)
function halo(cx, cy, r, flare = 0) {
  cut(circle(cx, cy, r * 1.068 + flare * 40), C.goldPale, { sh: .5, grain: .25 });
  cut(circle(cx, cy, r), C.sun, { sh: .6, grain: .25 });
}
// a pulse ring that rides out of the halo on "bronca"
function haloPulse(t, at, cx, cy, r) {
  const d = t - at; if (d < 0 || d > 1.4) return;
  const k = d / 1.4; g.save(); g.globalAlpha *= (1 - k) * .9; g.strokeStyle = C.gold; g.lineWidth = lerp(26, 4, k);
  g.beginPath(); g.arc(cx, cy, r * (1.1 + k * .9), 0, Math.PI * 2); g.stroke(); g.restore();
}

// gold rings from her lips, drawn in head units (so they ride with her wherever the camera puts her)
function mouthRings(t, at, { n = 3, dir = -.35, spread = .75, reach = 520, life = 2.4, w0 = 22, gap = .16, cols = [RING_D, GOLD] } = {}) {
  for (let r = 0; r < n; r++) {
    const d = t - at - r * gap; if (d < 0 || d > life) continue;
    const k = d / life;
    g.save(); g.translate(MOUTH.x + 16, MOUTH.y); g.rotate(dir);
    g.globalAlpha *= Math.pow(1 - k, .7); g.strokeStyle = cols[r % 2]; g.lineWidth = lerp(w0, 5, k); g.lineCap = 'round';
    g.beginPath(); g.arc(0, 0, 40 + eo(k) * reach, -spread, spread); g.stroke(); g.restore();
  }
}
// every ring she sings in section A (and its tail in B), head units
function singRings(t) {
  mouthRings(t, T.harta1 - .05, { n: 2, reach: 420 });
  // the blow: tight fast rings straight at the scrap, slightly upward
  mouthRings(t, T.bronca1, { n: 5, dir: -.32, spread: .42, reach: 760, life: 1.1, w0: 26, gap: .09, cols: [RING_D, C.cream] });
  mouthRings(t, 151.47, { n: 2, reach: 380 });
  // "Ah": a ring on every other beat
  for (const b of [152.82, 154.22, 155.39]) mouthRings(t, b, { n: 2, reach: 460, w0: 12 });
  // "Haaarta" held: they pour out, two a beat
  for (let a = T.harta2; a < T.harta2End; a += .29) mouthRings(t, a, { n: 1, reach: 760, spread: .8, w0: 24, cols: [a * 10 % 2 < 1 ? RING_D : GOLD], dir: -.38 + Math.sin(a * 3) * .08 });
  mouthRings(t, T.de2, { n: 2, reach: 420 }); mouthRings(t, T.tu2, { n: 1, reach: 380 });
  mouthRings(t, T.bronca2, { n: 6, spread: 1.05, reach: 900, life: 2.6, w0: 24, gap: .12 });
}
// her closed laughing eye cut out of the head (head units)
function eye(k) {
  g.save(); g.strokeStyle = '#fbe9c4'; g.lineCap = 'round';
  g.shadowColor = 'rgba(120,70,10,.45)'; g.shadowBlur = 3; g.shadowOffsetY = 2;
  g.lineWidth = lerp(5, 8, k); g.beginPath();
  if (k < .5) g.arc(706, 452, 14, Math.PI * .1, Math.PI * .9); else g.arc(706, 446, 19, Math.PI * .12, Math.PI * .88);
  g.stroke(); g.restore();
}

// ---------------- the last scrap of the storm cloud (screen units) ----------------
function scrap(t) {
  if (t < T.scrapIn || t > T.bronca1 + 1.6) return;
  const arrive = eo((t - T.scrapIn) / 1.7);
  let x = lerp(2120, 1735, arrive) + Math.sin(t * 2.1) * 10, y = lerp(470, 560, arrive) + Math.sin(t * 1.6) * 8;
  x -= ss(T.tu1 - .3, T.tu1 + .1, t) * 25;                             // it creeps in closer on "tu"
  let rot = Math.sin(t * 1.3) * .05, sc = 1 + bump(t, T.de1 - .05, .45) * .16;
  const blow = clamp((t - T.bronca1 - .12) / 1.3);
  if (blow > 0) {                                                       // blasted: it tumbles off to the upper right
    const e = ei(blow) * .55 + eo(blow) * .45;
    x += e * 620; y -= e * 330 - Math.sin(blow * Math.PI) * 40; rot += e * 5.2; sc *= 1 - e * .45;
  }
  // the shard it spits on "de": a small zigzag that drops and crumples to nothing before it reaches her
  const sd = t - T.de1;
  if (sd > 0 && sd < .9) {
    const k = sd / .9;
    g.save(); g.translate(1720, 600 + eo(k) * 150); g.rotate(.25); g.scale(1 - k * .7, 1 - k * .7);
    cut(poly([[-8, -50], [14, -50], [4, -14], [20, -14], [-10, 46], [-2, 4], [-18, 4]]), SHARD, { sh: .6, grain: .15, alpha: 1 - ei(k) });
    g.restore();
  }
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc * 1.35, sc * 1.35);
  // after the blow it comes apart: the three puffs drift away from each other
  const sp = eo(blow) * 70;
  cut(cloud(-40 - sp, 14 + sp * .3, 170, 104, 41), STORM_D, { sh: .9, lift: .5, grain: .25 });
  cut(cloud(30 + sp, -6 - sp * .4, 190, 120, 42), STORM, { sh: .9, lift: .6, grain: .25 });
  cut(cloud(-4, -40 - sp, 130, 86, 43), STORM, { sh: .7, lift: .6, grain: .25 });
  g.restore();
  // wisps of her breath: short cream ribbons streaking right from her lips
  const wd = t - T.bronca1;
  if (wd > 0 && wd < .9) {
    const k = wd / .9;
    for (let i = 0; i < 3; i++) {
      const x0 = 1505 + eo(k) * 380 + i * 20, y0 = 640 - i * 30 + i * i * 4;
      g.save(); g.globalAlpha *= (1 - ei(k)); cut(ribbon(x0, x0 + 120 + i * 30, y0 - eo(k) * (60 + i * 30), 10, i * 2.1, 5), C.cream, { sh: .5, grain: .1 }); g.restore();
    }
  }
  // gold sparks where it was, once it is gone
  for (let i = 0; i < 7; i++) {
    const at = T.bronca1 + .45 + i * .07, d = t - at; if (d < 0 || d > 1.3) continue;
    const a = i * .9, r = 30 + eo(d / 1.3) * 120;
    g.save(); g.globalAlpha *= 1 - ei(d / 1.3); g.fillStyle = i % 2 ? GOLD : C.goldPale;
    g.fill(star4(1780 + Math.cos(a) * r, 520 + Math.sin(a) * r, 16 * (1 - d / 1.3 * .5))); g.restore();
  }
}

// ---------------- the flowers along the bottom (screen units, foreground) ----------------
// stems rise on the "Ah"; one blooms on each beat of "Haaarta de tu"; all bounce on "bronca".
const FLW = (() => {
  const xs = [70, 230, 1290, 390, 1440, 560, 1140, 1600, 740, 990, 1760, 870, 1880, 1370];
  const blooms = BEATS.filter((b) => b > 156.3 && b < 163.2).concat([163.10, 163.10]);
  return xs.map((x, i) => ({ x: x + (hash(i * 3.7) - .5) * 30, y: 790 + hash(i * 5.3) * 70 - (x > 1200 && x < 1500 ? 0 : 10),
    r: 58 + hash(i * 1.9) * 26, col: i % 2 ? C.cream : CARM, at: blooms[i] || 163.1, stem: T.ah + .2 + hash(i * 2.3) * 2.2,
    rot: hash(i) * 3, lean: (hash(i * 8.1) - .5) * 40 }));
})();
FLW.sort((a, b) => a.y - b.y);                                         // nearer (lower) ones in front
function flowers(t, dy = 0, sc = 1) {
  const brk = bump(t, T.bronca2 - .05, .55);
  g.save(); g.translate(960, 1080 + dy); g.scale(sc, sc); g.translate(-960, -1080);
  for (const f of FLW) {
    const grow = eo((t - f.stem) / 1.4); if (grow <= 0) continue;
    const sway = Math.sin(twos(t) * 2.2 + f.x) * 6 + bump(t, f.at, .4) * 10;
    const top = lerp(1120, f.y, grow), bx = f.x + f.lean * grow + sway;
    cut(ribbonAlong([[f.x, 1130], [f.x + f.lean * .3, lerp(1120, top, .5)], [bx, top + 10]], 16), C.leafDeep, { sh: .4, grain: 0 });
    if (grow > .5) {
      const lk = eo((grow - .5) * 2);
      cut(ellipse(f.x + 24 * lk + f.lean * .2, lerp(1120, top, .45), 34 * lk, 12 * lk, -.5), C.leaf, { sh: .35, grain: 0 });
      cut(ellipse(f.x - 22 * lk + f.lean * .3, lerp(1120, top, .62), 30 * lk, 11 * lk, .5), C.leaf, { sh: .35, grain: 0 });
    }
    const op = pop(t, f.at, .45) * (1 + brk * .14);
    if (op <= 0) { if (grow > .9) cut(ellipse(bx, top, 15, 24), f.col, { sh: .5, grain: .15 }); continue; }
    g.save(); g.translate(bx, top); g.rotate(f.rot + (t - f.at) * .08);
    cut(flowerPath(0, 0, f.r * op, 5, 0), f.col, { sh: .7, grain: .2, lift: .3 });
    cut(circle(0, 0, f.r * .27 * op), f.col === CARM ? C.goldPale : GOLD, { sh: .35, grain: 0 });
    g.restore();
  }
  g.restore();
}
function sparkBurst(t, at, cx, cy, R = 420) {
  for (let i = 0; i < 12; i++) {
    const d = t - at - hash(i * 3.3) * .15; if (d < 0 || d > 1.3) continue;
    const k = d / 1.3, a = i / 12 * Math.PI * 2 + .2, r = R * (.75 + hash(i) * .4) + eo(k) * 180;
    g.save(); g.globalAlpha *= 1 - ei(k); g.fillStyle = i % 3 ? C.goldPale : C.cream;
    g.fill(star4(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 22 * (1 - k * .5))); g.restore();
  }
}

// her head tilt and lift through A: negative tilt lifts the chin (singing up), positive drops it (the blow)
function tiltA(t) {
  let tl = -.035 * ss(T.harta1 - .2, T.harta1 + .2, t) * (1 - ss(148.2, 148.9, t));
  tl += -.06 * ss(T.tu1 - .3, T.bronca1 - .02, t) * (1 - ss(T.bronca1 - .02, T.bronca1 + .1, t));   // breath in
  tl += .035 * ss(T.bronca1 - .02, T.bronca1 + .1, t) * (1 - ss(151.2, 151.9, t));                 // blow
  tl += -.025 * ss(T.ah - .2, T.ah + .4, t) * (1 - ss(T.ahEnd, T.harta2, t));
  tl += -.07 * ss(T.harta2 - .25, T.harta2 + .35, t) * (1 - ss(T.harta2End - .2, 160.6, t));
  tl += -.03 * ss(160.4, 160.9, t) * (1 - ss(163.6, 164.3, t));
  tl += .03 * bump(t, T.bronca2 - .05, .45) - .02 * bump(t, T.de2, .4);
  return tl;
}
function liftA(t) { return -10 * ss(T.tu1 - .3, T.bronca1, t) * (1 - ss(T.bronca1, T.bronca1 + .3, t)) - 8 * ss(T.harta2 - .2, T.harta2 + .3, t) * (1 - ss(T.harta2End - .2, 160.6, t)); }

// ================= A: the close profile =================
SHOT(T.a, T.ab, '07-final-close', (t) => {
  sky();
  const grow = bump(t, T.harta2, T.harta2End - T.harta2 + .6) * .8 + bump(t, T.bronca2 - .1, 1.2);
  rays(t, SUN_C.x, SUN_C.y, HALO_R * 1.11, grow);
  const flare = bump(t, T.bronca2 - .05, .7) + bump(t, T.harta2, .6) * .4;
  halo(SUN_C.x, SUN_C.y, HALO_R + Math.sin(t * .5) * 5, flare);
  haloPulse(t, T.bronca2, SUN_C.x, SUN_C.y, HALO_R);
  const tl = tiltA(t), dy = liftA(t) + jit(t, 4) * .6;
  g.save(); toHer(tl, dy); cut(HEADS.her, GOLD, { sh: 1.2, lift: 1, grain: .3 });
  eye(ss(T.bronca1, T.bronca1 + .3, t)); singRings(t); g.restore();
  sparkBurst(t, T.bronca2 + .05, SUN_C.x, SUN_C.y, 470);
  scrap(t);
  flowers(t);
}, { xin: .6, tr: 'fade' });

// ================= B: pull back to the fiesta =================
// her puppet's place on the stage; the camera starts exactly on the 04-sky framing of its head
const HER = { x: 780, y: 888, s: .56 }, HK = .265;
const hw = (X, Y) => ({ x: HER.x + HER.s * (10 + HK * (X - 580)), y: HER.y + HER.s * (-790 + HK * (Y - 800)) });
const ZC = Z0 / (HER.s * HK), PA = { X: 600, Y: 600 }, PW = hw(PA.X, PA.Y), SC = { x: OX + Z0 * PA.X, y: OY + Z0 * PA.Y };
const SUN_W = { x: 782, y: 470, r: 300 };
const IRIS = { x: SUN_C.x, y: SUN_C.y };
function camB(rt) {
  const e = eio(clamp((rt - T.pull0) / (T.pull1 - T.pull0)));
  let Z = Math.pow(ZC, 1 - e), Sx = lerp(SC.x, PW.x, e), Sy = lerp(SC.y, PW.y, e);
  // the last bars: a slow push back in on her, so the iris opens out of her head
  const p = eio(ss(T.brk, T.iris + .3, rt));
  const hz = lerp(1, 1.4, p);
  Sx = lerp(Sx, 1000, p); Sy = lerp(Sy, 600, p);
  return { e, Z: Z * hz, Sx, Sy, hz, p };
}
const camApply = (c) => { g.translate(c.Sx, c.Sy); g.scale(c.Z, c.Z); g.translate(-PW.x, -PW.y); };
const camPt = (c, w) => ({ x: c.Sx + c.Z * (w.x - PW.x), y: c.Sy + c.Z * (w.y - PW.y) });

// ---- a local copy of the kit puppet with: a head clip line, head shadow, a swishing skirt, an eye callback ----
const DRESS_FL = [.94, 1.02, 1.1, 1.18, 1.26, 1.34].map((f) => dressPath(-175, f));
const LACE_FL = DRESS_FL.map((d, j) => { const p = new Path2D(); p.addPath(d); const f = .94 + j * .08;
  for (let i = 0; i < 7; i++) { const x = (-96 + i * 30) * f, y = -232 + (i % 2) * 6; p.moveTo(x + 9, y); p.arc(x, y, 9, 0, Math.PI * 2); }
  for (let i = 0; i < 6; i++) { const x = (-84 + i * 32) * f, y = -272; p.moveTo(x + 5, y); p.arc(x, y, 5, 0, Math.PI * 2); }
  return p; });
function pup(x, y, s, dir, spec, pose, o = {}) {
  const col = spec.col, h = spec.height || 1, hk = spec.headK || HK;
  const arms = pose.arms || [[0, .15], [0, .15]], legs = pose.legs || [[0, 0], [0, 0]];
  const fl = clamp(Math.round(((pose.flare || 1) - .94) / .08), 0, 5);
  g.save(); g.translate(x, y + (pose.bob || 0) * s); g.scale(s * h * dir, s * h); g.rotate(pose.lean || 0);
  g.save(); g.translate(-6, -540); leg(legs[1][0], legs[1][1], col); g.restore();
  g.save(); g.translate(-8, -752); arm(arms[1][0], arms[1][1], col); g.restore();
  g.save(); g.translate(6, -540); leg(legs[0][0], legs[0][1], col); g.restore();
  if (spec.lace) cut(LACE_FL[fl], col, { sh: .6, grain: .26, lift: .2, rule: 'evenodd' });
  else cut(DRESS_FL[fl], col, { sh: .6, grain: .26, lift: .2 });
  g.save(); g.translate(10, -790); g.rotate(-(pose.head || 0) * .9 - (pose.laugh || 0) * .18); g.scale(hk, hk); g.translate(-580, -800);
  g.save(); g.beginPath(); g.rect(-200, -200, 1400, (o.clipY || 840) + 200); g.clip();
  cut(HEADS[spec.head || 'her'], col, { sh: o.hsh ?? .5, lift: o.hlift || 0, grain: .25 });
  if (spec.hair && HAIR[spec.hair]) cut(HAIR[spec.hair], col, { sh: .3, grain: .2 });
  g.restore();
  if (o.inHead) o.inHead();
  g.restore();
  g.save(); g.translate(8, -752); arm(arms[0][0], arms[0][1], col); g.restore();
  g.restore();
}
// keep the lowest foot on the floor (from 13-team)
function footDrop(legs, h = 1) { const y = (l) => 266 * Math.cos(l[0]) + 250 * Math.cos(l[1] - l[0]); return (516 - Math.max(y(legs[0]), y(legs[1]))) * h; }

// ---- the dance: a salsa basic in profile (forward on 1, replace, together, tap; back on 5, replace, together, tap) ----
// [nearHip, nearKnee, farHip, farKnee, lean]
const STEP = [[.36, .06, -.14, .24, .05], [.16, .14, -.04, .1, .02], [.03, .12, 0, .12, 0], [.06, .42, -.02, .08, 0],
  [.1, .22, -.36, .08, -.04], [.04, .12, -.17, .14, -.02], [.03, .12, 0, .12, 0], [.02, .08, .06, .44, 0]];
function salsa(t, from, amp = 1, ph = 0) {
  const { f } = beatOf(t), n = nBeat(t, from), c = ((n % 8) + 8) % 8, pc = (c + 7) % 8;
  const k = eo(f / .42), A = STEP[pc], B = STEP[c];
  const v = A.map((a, j) => lerp(a, B[j], k) * amp);
  const legs = [[v[0], v[1] + .04], [v[2], v[3] + .04]];
  const sw = Math.sin((n + f) * Math.PI + ph);
  return { legs, lean: v[4], bob: -Math.sin(f * Math.PI) * 14 * amp + footDrop(legs),
    arms: [[.95 + .3 * sw * amp, 1.55 - .2 * sw], [.45 - .3 * sw * amp, 1.95 + .2 * sw]],
    head: -.04 * Math.sin((n + f) * Math.PI * .5), flare: 1.06 + Math.abs(sw) * .12 * amp };
}
// travelling in on the beats: one stride a beat
function travel(t) {
  const { f } = beatOf(t), n = nBeat(t, T.enter0), ph = (n + eo(f / .6)) * Math.PI;
  const s = Math.sin(ph), c = Math.cos(ph);
  const legs = [[.34 * s, Math.max(0, -c) * .6 + .05], [-.34 * s, Math.max(0, c) * .6 + .05]];
  return { legs, bob: -Math.abs(c) * 12 + footDrop(legs), arms: [[.95 - .25 * s, 1.55], [.45 + .25 * s, 1.95]], flare: 1.1 + Math.abs(s) * .08, lean: .03 };
}
// arms up and a laugh on the big hits
function hooray(pose, t, at) {
  const k = clamp(bump(t, at - .06, .9) * 1.6);
  if (k <= 0) return pose;
  pose.arms = [[lerp(pose.arms[0][0], 2.35, k), lerp(pose.arms[0][1], .35, k)], [lerp(pose.arms[1][0], 2.95, k), lerp(pose.arms[1][1], .15, k)]];
  pose.head = lerp(pose.head || 0, -.14, k); pose.laugh = k * .6; pose.bob = (pose.bob || 0) - k * 18; pose.flare = Math.max(pose.flare || 1, 1 + k * .25);
  return pose;
}
// everyone spins once on the beat: the paper turns edge-on and back
function spinDir(t, dir, at = T.spin, len = .6) {
  const k = clamp((t - at) / len); if (k <= 0 || k >= 1) return dir;
  const c = Math.cos(k * Math.PI * 2); return dir * (Math.abs(c) < .22 ? .22 * Math.sign(c || 1) : c);
}

// ---- the friends: profile puppets in plum, teal, leaf, sand and rose (never navy) ----
const FRIENDS = [
  { spec: { col: '#c99a64', kind: 'dress', head: 'short', hair: 'bob', height: .97 }, x: 120, y: 872, from: -260, dir: 1, ph: .4 },
  { spec: { col: C.teal, kind: 'dress', head: 'short', hair: 'curls', height: .95 }, x: 320, y: 868, from: -330, dir: 1, ph: 1.1 },
  { spec: { col: C.leaf, kind: 'dress', head: 'short', hair: 'pony', height: 1 }, x: 530, y: 876, from: -420, dir: 1, ph: 2.2 },
  { spec: { col: C.plum, kind: 'dress', head: 'her', height: .98 }, x: 1020, y: 874, from: 2140, dir: -1, ph: .7 },
  { spec: { col: ROSE_F, kind: 'dress', head: 'her', height: .96 }, x: 1235, y: 868, from: 2260, dir: -1, ph: 1.7 },
];
function friendPose(fr, i, t, amp = 1) {
  let pose = t < T.enter1 ? travel(t) : salsa(t, T.dance0, amp, fr.ph * .3);
  for (const u of UP) pose = hooray(pose, t, u + i * .03);
  return pose;
}
function friendX(fr, t) {
  if (t >= T.enter1) return fr.x;
  const { f } = beatOf(t), n = nBeat(t, T.enter0), N = nBeat(T.enter1, T.enter0);
  if (t < T.enter0) return fr.from;
  return lerp(fr.from, fr.x, clamp((n + eo(f / .6)) / N));
}

// ---- the gold paper brass band (no players; instruments on rods, bells toward the dancers) ----
function strip(a, b, w) {
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || .1;
  const p = new Path2D(); const ang = Math.atan2(dy, dx), nx = -dy / L * w / 2, ny = dx / L * w / 2;
  p.moveTo(a.x + nx, a.y + ny); p.lineTo(b.x + nx, b.y + ny); p.arc(b.x, b.y, w / 2, ang + Math.PI / 2, ang - Math.PI / 2, true);
  p.lineTo(a.x - nx, a.y - ny); p.arc(a.x, a.y, w / 2, ang - Math.PI / 2, ang + Math.PI / 2, true); p.closePath(); return p;
}
function ringPath(cx, cy, r, w, a0 = 0, a1 = Math.PI * 2) {
  const p = new Path2D(); p.arc(cx, cy, r + w / 2, a0, a1); p.arc(cx, cy, r - w / 2, a1, a0, true); p.closePath(); return p;
}
function bellPath(x0, y0, len, r0, r1) {
  const p = new Path2D(); p.moveTo(x0, y0 - r0); p.quadraticCurveTo(x0 + len * .75, y0 - r0 * 1.1, x0 + len, y0 - r1);
  p.lineTo(x0 + len, y0 + r1); p.quadraticCurveTo(x0 + len * .75, y0 + r0 * 1.1, x0, y0 + r0); p.closePath(); return p;
}
// each instrument faces right in its own units; the bell end is returned so rings can come out of it
function trumpet(press) {
  cut(ringPath(-30, 26, 30, 13, 0, Math.PI * 2), GOLD_D, { sh: .5, grain: .15 });
  cut(strip({ x: -150, y: 0 }, { x: 70, y: 0 }, 16), GOLD, { sh: .6, grain: .2 });
  cut(bellPath(60, 0, 120, 9, 54), GOLD, { sh: .7, grain: .2, lift: .2 });
  cut(ellipse(181, 0, 9, 55), C.goldPale, { sh: .3, grain: .1 });
  cut(poly([[-150, -6], [-180, -12], [-180, 12], [-150, 6]]), C.ink, { sh: .3, grain: 0 });
  for (let v = 0; v < 3; v++) {
    const vx = -44 + v * 26, dn = press[v] * 12;
    cut(rect(vx, -30, 18, 62), C.ink, { sh: .35, grain: 0 });
    cut(rect(vx + 6, -42 + dn, 6, 14 - dn * .4), C.ink, { sh: 0, grain: 0 });
    cut(circle(vx + 9, -44 + dn, 11), C.cream, { sh: .35, grain: 0 });
  }
  return { x: 186, y: 0 };
}
function trombone(slide) {
  const sl = slide * 150;
  cut(strip({ x: -170, y: -24 }, { x: 130, y: -24 }, 15), GOLD, { sh: .6, grain: .2 });
  cut(ringPath(-170, -3, 21, 14, Math.PI * .5, Math.PI * 1.5), GOLD, { sh: .5, grain: .2 });
  cut(strip({ x: -170, y: 18 }, { x: -70, y: 18 }, 14), GOLD, { sh: .5, grain: .2 });
  cut(bellPath(110, -24, 150, 10, 66), GOLD, { sh: .7, grain: .2, lift: .2 });
  cut(ellipse(262, -24, 10, 67), C.goldPale, { sh: .3, grain: .1 });
  // inner slide (fixed) and the outer slide that moves
  cut(strip({ x: -70, y: 18 }, { x: 150, y: 18 }, 10), GOLD_D, { sh: .4, grain: .1 });
  cut(strip({ x: -70, y: 52 }, { x: 150, y: 52 }, 10), GOLD_D, { sh: .4, grain: .1 });
  cut(strip({ x: 40 + sl, y: 18 }, { x: 250 + sl, y: 18 }, 16), GOLD, { sh: .6, grain: .2, lift: .2 });
  cut(strip({ x: 40 + sl, y: 52 }, { x: 250 + sl, y: 52 }, 16), GOLD, { sh: .6, grain: .2, lift: .2 });
  cut(ringPath(250 + sl, 35, 17, 15, -Math.PI * .5, Math.PI * .5), GOLD, { sh: .5, grain: .2, lift: .2 });
  cut(rect(50 + sl, 14, 10, 42), C.ink, { sh: .3, grain: 0 });
  cut(poly([[-70, 46], [-98, 40], [-98, 64], [-70, 58]]), C.ink, { sh: .3, grain: 0 });
  return { x: 266, y: -24 };
}
function sax(press) {
  // body tube widening downward, the bow, the bell turned up, the crook and mouthpiece
  cut(poly([[-16, -200], [16, -200], [36, 110], [-36, 110]]), GOLD, { sh: .7, grain: .2, lift: .2 });
  cut(ringPath(52, 110, 52, 70, 0, Math.PI), GOLD_D, { sh: .6, grain: .2 });
  cut(poly([[70, 112], [134, 112], [176, -110], [92, -110]]), GOLD, { sh: .7, grain: .2, lift: .2 });
  cut(ellipse(134, -112, 46, 15, -.06), C.goldPale, { sh: .3, grain: .1 });
  cut(ringPath(-20, -212, 26, 13, Math.PI * .95, Math.PI * 2.3), GOLD, { sh: .5, grain: .2 });
  cut(poly([[-46, -206], [-80, -214], [-80, -194], [-46, -198]]), C.ink, { sh: .3, grain: 0 });
  for (let k = 0; k < 6; k++) { const ky = -160 + k * 46, kx = 24 + k * 3.4;
    cut(circle(kx, ky, 11 - press * (k % 2) * 3), C.cream, { sh: .3, grain: 0 }); }
  cut(strip({ x: -6, y: -150 }, { x: -2, y: 60 }, 8), C.ink, { sh: .2, grain: 0 });
  return { x: 134, y: -125 };
}
// band layout in world units (x, y = the rod's foot on the riser); every one faces left (dir -1)
const BAND = [
  { kind: 'tb', x: 1690, y: 735, s: .72, top: 410, ph: 2 },
  { kind: 'tp', x: 1500, y: 735, s: .8, top: 520, ph: 0 },
  { kind: 'sx', x: 1820, y: 735, s: .85, top: 610, ph: 3 },
  { kind: 'tp', x: 1560, y: 735, s: .8, top: 645, ph: 1 },
];
function band(t, scale = 1, ringK = 1) {
  const { f, i: bi } = beatOf(t);
  BAND.forEach((b, j) => {
    let lift = 0, hitK = 0;
    for (const [h, big] of HITS) if (big || (Math.round(h * 10) + j) % 2 === 0) { const k = bump(t, h - .04, .45); if (k > hitK) hitK = k; }
    lift = hitK;
    const dip = Math.sin(f * Math.PI) * 7 * (1 - lift);
    const y = b.top + dip - lift * 14;
    // the rod
    cut(strip({ x: b.x, y: y + 40 }, { x: b.x, y: b.y }, 7 / scale), C.ink, { sh: .4, grain: 0 });
    g.save(); g.translate(b.x, y); g.scale(-b.s, b.s); g.rotate(-.1 - lift * .18 + Math.sin(t * 2 + b.ph) * .02);
    let bell;
    if (b.kind === 'tp') bell = trumpet([0, 1, 2].map((v) => ((bi + v + j) % 3 === 0 ? Math.sin(f * Math.PI) : 0)));
    else if (b.kind === 'tb') { const seq = [0, .7, .35, 1, .15, .85, .45, .95]; const s0 = seq[bi % 8], s1 = seq[(bi + 1) % 8]; bell = trombone(lerp(s0, s1, eio(f))); }
    else bell = sax(Math.sin(f * Math.PI));
    g.restore();
    // its rings, out of the bell, on its hits (bell points left and a little up)
    const ang = Math.PI + .1 + .18;
    const bx = b.x - Math.cos(-.1) * bell.x * b.s, by = y + bell.y * b.s + Math.sin(.28) * bell.x * b.s * .4;
    if (ringK > 0) for (const [h, big] of HITS) if (big || (Math.round(h * 10) + j) % 2 === 0) {
      g.save(); g.globalAlpha *= ringK; laughRings(t, bx, by, h, { n: big ? 3 : 2, dir: ang + (j - 1.5) * .06, spread: .55, reach: 420 * b.s, life: 1.6, w0: 18 }); g.restore();
    }
  });
}

// ---- the stage ----
function hill(y, amp, ph, col, x0 = -400, x1 = W + 400) {
  const p = new Path2D(); p.moveTo(x0, H + 400); p.lineTo(x0, y);
  for (let x = x0; x <= x1; x += 40) p.lineTo(x, y + Math.sin(x / 260 + ph) * amp); p.lineTo(x1, H + 400); p.closePath(); cut(p, col, { sh: .6 });
}
function stage() {
  hill(790, 24, 1.2, HILL1); hill(840, 16, 3.4, HILL2);
  cut(cutRect(1360, 735, 640, 30, 61, 3), FLOOR_D, { sh: .6, lift: .2 });            // the band's riser
  cut(cutRect(-400, 864, W + 800, 500, 62, 3), FLOOR, { sh: .8, lift: .3 });
  cut(cutRect(-400, 864, W + 800, 12, 63, 2), C.cream, { sh: .3, grain: .1, alpha: .8 });
}
// a row of small flowers along the front edge of the stage (world units)
function footFlowers(t) {
  for (let i = 0; i < 17; i++) {
    const x = -20 + i * 122 + (hash(i * 2.2) - .5) * 30, y = 975 + hash(i * 4.4) * 30, r = 34 + hash(i * 6.6) * 10;
    const op = pop(t, 165.3 + i * .05, .4);
    if (op <= 0) continue;
    cut(ellipse(x + 14, y + 26, 20, 8, -.4), C.leaf, { sh: .3, grain: 0 });
    flower(x, y, r * op, i % 2 ? C.cream : CARM, i % 2 ? GOLD : C.goldPale, hash(i) * 3 + Math.sin(twos(t) * 2 + i) * .1);
  }
}
// cream and gold paper confetti, falling from the top (screen units)
function confetti(t, tS, n = 70, k = 1) {
  for (let i = 0; i < n; i++) {
    const sp = 110 + hash(i * 1.7) * 130, off = hash(i * 7.3) * 1240, run = (twos(t) - tS) * sp + off;
    if (run < 1240) continue;
    const y = run % 1240 - 80, x = hash(i * 3.1) * (W + 120) - 60 + Math.sin(twos(t) * 1.4 + i) * 40;
    const flip = Math.cos(twos(t) * (3 + hash(i) * 4) + i), col = i % 3 === 0 ? GOLD : i % 3 === 1 ? C.cream : C.goldPale;
    g.save(); g.translate(x, y); g.rotate(i + twos(t) * (hash(i * 9) - .5) * 3); g.scale(k, k * Math.max(.12, Math.abs(flip)));
    cut(rect(-11, -6, 22, 12), col, { sh: .3, grain: 0 }); g.restore();
  }
}
function herPoseB(t) {
  let pose;
  if (t < T.dance0) {
    // she throws her arms open, elbows first (no straight-arm sleepwalker in between)
    const open = ss(165.85, 166.3, t), bend = Math.sin(open * Math.PI) * 1.1;
    pose = { arms: [[lerp(0, 1.9, open), lerp(.12, .55, open) + bend], [lerp(0, 2.7, open), lerp(.12, .3, open) + bend * .8]], head: -.1 * open, laugh: .5 * open };
  } else pose = salsa(t, T.dance0, t > T.brk ? lerp(1, .55, ss(T.brk, T.brk + .6, t)) : 1);
  for (const u of UP) pose = hooray(pose, t, u);
  return pose;
}

SHOT(T.ab, T.iris, '07-final-fiesta', (t, k, d, rt) => {
  const c = camB(rt), e = c.e;
  sky();
  // the sun: from the halo behind her close profile to the sun over the stage (it is far away, so it shrinks less)
  const sw = camPt(c, SUN_W);
  const sx = lerp(SUN_C.x, lerp(SUN_W.x, sw.x, c.p), e), sy = lerp(SUN_C.y, lerp(SUN_W.y, sw.y, c.p), e);
  const sr = HALO_R * Math.pow(SUN_W.r / HALO_R, e) * lerp(1, c.hz, c.p);
  rays(t, sx, sy, sr * 1.11, bump(t, 164.6, 1.0) * .5);
  halo(sx, sy, sr, bump(t, T.chord - .3, .5));
  for (const [h, big] of HITS) if (big && h > 166) haloPulse(t, h, sx, sy, sr);
  // the world under the camera
  g.save(); camApply(c);
  if (e > .02) { stage(); band(t, c.Z); }
  // the friends dance in from both edges
  if (rt > T.enter0 - .1) FRIENDS.forEach((fr, i) => {
    const amp = t > T.brk ? lerp(1, .55, ss(T.brk, T.brk + .6, t)) : 1;
    const pose = friendPose(fr, i, t, amp);
    pup(friendX(fr, t), fr.y, .5, spinDir(t, fr.dir), fr.spec, pose);
  });
  // her: at the start her head is drawn exactly as the close profile (no clip, the big soft shadow);
  // the neck clip and the shadow settle to the puppet's as the camera pulls back
  const close = 1 - ss(0, .35, e);
  const hpE = e < .3 ? { arms: [[0, .12], [0, .12]] } : herPoseB(t);
  pup(HER.x, HER.y, HER.s, spinDir(t, 1), { col: GOLD, kind: 'dress', head: 'her', lace: true }, hpE, {
    clipY: lerp(840, 1300, close), hsh: lerp(.5, 1.2, close), hlift: close,
    inHead: () => { if (c.Z * HER.s * HK > .45) { eye(1); } if (e < .9) { g.save(); g.globalAlpha *= 1 - ss(.5, .9, e); singRings(t); g.restore(); }
      for (const u of UP) mouthRings(t, u, { n: 2, reach: 420, w0: 26 }); } });
  footFlowers(t);
  g.restore();
  sparkBurst(t, T.bronca2 + .05, sx, sy, sr * .93);
  // confetti starts on the first big hit after the pull-back and thickens
  confetti(t, 165.6, 46, lerp(1, c.hz, c.p)); confetti(t, 169.9, 34, lerp(1, c.hz, c.p));
  // the close shot's flowers drop away below the frame (foreground, so they move fastest)
  const fd = eio(ss(T.pull0, T.pull0 + 1.3, rt));
  if (fd < 1) flowers(t, fd * 620, 1 + fd * .5);
});

// ================= C: the last image =================
const TINY = FRIENDS.map((fr, i) => ({ ...fr, x: 70 + i * 112, y: 880 - Math.sin(i * .7 + .5) * 14, s: .19, dir: 1 }));
const BAND_C = [{ kind: 'tp', x: 1600, top: 760, s: .42 }, { kind: 'tp', x: 1680, top: 735, s: .42 }, { kind: 'tb', x: 1770, top: 770, s: .4 },
  { kind: 'sx', x: 1860, top: 750, s: .42 }];
SHOT(T.iris, T.end, '07-final-last', (t) => {
  sky();
  const sing = bump(t, T.chord, 1.6);
  rays(t, SUN_C.x, SUN_C.y, HALO_R * 1.11, .6 + sing * .5);
  halo(SUN_C.x, SUN_C.y, HALO_R + Math.sin(t * .5) * 5, sing * .7);
  haloPulse(t, T.chord, SUN_C.x, SUN_C.y, HALO_R);
  // the far hills with everyone small on them
  hill(872, 20, 2.1, HILL1, -40, 1150); hill(880, 14, .4, HILL1, 1250, W + 40);
  TINY.forEach((fr, i) => { const pose = hooray(salsa(t, T.dance0, .8, fr.ph * .3), t, T.chord + i * .04);
    pup(fr.x, fr.y, fr.s, 1, fr.spec, pose); });
  const { f, i: bi } = beatOf(t);
  BAND_C.forEach((b, j) => {
    const lift = bump(t, T.chord - .04, .7), y = b.top + Math.sin(f * Math.PI) * 3 - lift * 8;
    cut(strip({ x: b.x, y: y + 18 }, { x: b.x, y: 880 }, 4), C.ink, { sh: .3, grain: 0 });
    g.save(); g.translate(b.x, y); g.scale(-b.s, b.s); g.rotate(-.12 - lift * .15);
    let bell; if (b.kind === 'tp') bell = trumpet([0, 0, 0]); else if (b.kind === 'tb') bell = trombone(.4 + .4 * Math.sin(bi * 1.7)); else bell = sax(0);
    g.restore();
    for (const a of [T.chord, 180.45, 181.65]) laughRings(t, b.x - bell.x * b.s, y + bell.y * b.s, a + j * .05, { n: 2, dir: Math.PI + .3, spread: .5, reach: 160, life: 1.4, w0: 7 });
  });
  // her, close, laughing; the final chord comes out of her as rings
  const tl = -.03 * ss(T.iris, T.iris + .5, t) - .02 * sing, push = 1 + .035 * eio(ss(T.iris, T.end, t));
  g.save(); toHer(tl, jit(t, 4) * .6, push); cut(HEADS.her, GOLD, { sh: 1.2, lift: 1, grain: .3 }); eye(1);
  mouthRings(t, T.chord, { n: 4, reach: 640, w0: 20 }); mouthRings(t, 180.45, { n: 2, reach: 520 }); mouthRings(t, 181.65, { n: 2, reach: 520 });
  g.restore();
  confetti(t, 160.0, 70);
  // the flower bank across the bottom edge (no captions here)
  g.save(); g.translate(0, 120); flowers(Math.max(t, 164)); g.restore();
}, { xin: .8, tr: 'iris', ix: IRIS.x, iy: IRIS.y });
})();

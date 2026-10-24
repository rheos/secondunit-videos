// 05-fuego (90.0 - 127.0): "Harta de tu bronca" (3), then the long brass break.
// A (90.0-101.55): opens on 04's last frame: her big close profile (04-sky framing, zoom 1.22), all carmine paper
//   on rose, in 04's rose tonal halo, the fire still burning low in her chest. The storm cloud creeps back in from
//   the left and hangs over the back of her head. "Harta" (held 93.58-97.6): she shuts her eye, lifts her chin,
//   the fire in her chest flares and heat rises off her head in wavy carmine/orange paper strips that lick the
//   cloud's belly (it glows). "bronca" (100.72): the cloud's underside bursts into flame and it shrinks to half
//   size, smoking, and backs off up-left.
// B (101.55-127.0): the camera pulls back out of her head (the big profile lands exactly on the full-figure
//   puppet's head) to 03's paper stage (hill, floor, ink slot). The brass band slides back in on its slot
//   (03's instruments, copied) on the 102.34 entry and she DANCES on the beat: salsa basic (forward, back),
//   a turn with her hand up, a shoulder shimmy, arms up in a V on every big brass hit. Paper flames along the
//   floor hop on the beat; gold rings ride out of the bells, stamp out from her feet on each bar and burst from
//   her on the big hits. The shrunken cloud tries to rain on her three times (in the brass dips) and every drop
//   turns to gold sparks over her head; the third, biggest try is beaten on the 121.73 hit and the cloud shrinks
//   again. 124.66-127: arms up, a hop on every beat, flames tall, slow push in. Cloud ends upper left.
// Beat grid and brass hits measured from work/demucs/htdemucs/harta/no_vocals.wav: 153.8 bpm (beat 0.39 s),
// bar lines 102.14, 103.70, ... 127.10. Colours: rose ground, carmine (her, flames), orange, gold, cloud grey-violet.
// Local helpers (no kit edits): 00-intro's storm cloud, 03-harta2's brass band + stage, 04-segura's chest flame
// and bust (all copied), leg IK, pose blending, the pull-back camera.
(() => {
const CAR = '#b3262e', CAR2 = '#d23a2f', CL = { dark: '#4a4458', mid: '#5c566b' }, SMOKE = '#6b6478';
const T = { harta: 93.58, hartaEnd: 97.63, de: 99.23, tu: 100.46, bronca: 100.72, pb0: 101.55, pb1: 102.62, entry: 102.34, end: 127.0 };
// big close profile: 04-sky framing as 04-segura leaves it (ox 470, oy -150, zoom 1.22)
const OX = 470, OY = -150, ZA = 1.22;
// the stage (03-harta2's): floor top 872, ink slot 893; her feet, scale; the puppet's head scale (kit)
const HX = 680, FY = 880, S = .56, HK = .265, SLOT = 893;
// beat grid
const BEAT0 = 102.14, P = .39;
const nOf = (t) => (t - BEAT0) / P;
const beatPulse = (t) => { const n = nOf(t); return Math.pow(1 - (n - Math.floor(n)), 2.5); };
// brass loudness (500-4000 Hz RMS of the stem), 12 values a second from 102.0, 0-9
const ENV = '323355676779889988422227878987789776568888987678688999856753586662132111214469989897786757887577556557422789863322223862257867667666776655465453436543234446696322236653532466555544326565575666655222457875656445766545565455777557533331027886765772132498778877862288423121289888887879888887777798899998';
const env = (t) => { const i = Math.floor((t - 102) * 12); return i < 0 || i >= ENV.length ? 0 : +ENV[i] / 9; };
// brass onsets (RMS rises in the stem) and the big ones
const HITS = [102.34, 102.78, 103.96, 104.26, 105.17, 105.9, 106.31, 107.12, 108.41, 108.87, 109.48, 110.82, 111.78, 112.17,
  113.46, 114.2, 115.12, 115.79, 116.4, 117.21, 118.58, 119.04, 120.1, 121.73, 122.04, 122.63, 123.46, 123.89, 124.66, 125.42, 126.66];
const BIG = [102.34, 108.41, 115.12, 121.73, 124.66, 126.66];
// who blows on each hit: 0 trumpet A, 1 trumpet B, 2 trombone, 3 bari sax
const ROT = [[0, 1], [2], [3], [0], [1, 2], [3, 0]];
// 116-119 call and response: she points, that instrument answers alone
const CALL = [{ h: 116.4, j: 0 }, { h: 117.21, j: 2 }, { h: 118.58, j: 1 }];
const WHO = HITS.map((h, i) => BIG.includes(h) ? [0, 1, 2, 3] : (CALL.find((c) => c.h === h) || { j: -1 }).j >= 0 ? [CALL.find((c) => c.h === h).j] : ROT[i % ROT.length]);
// the cloud's three tries at raining on her (the brass dips); the third is beaten on the 121.73 hit
const RAIN = [{ a: 107.2, b: 108.0, n: 11, v: 300 }, { a: 114.1, b: 114.85, n: 10, v: 300 }, { a: 120.85, b: 121.55, n: 26, v: 170, at: 121.7 }];
const energy = (t) => ss(115, 124.5, t) * .55 + ss(124.4, 126.7, t) * .45;

// ======================= the storm cloud (00-intro's full-grown cloud, copied) =======================
const LOBES = [[-90, -60, 170], [80, -50, 160], [0, 20, 150], [-220, 0, 130], [220, 10, 130], [-330, 30, 100], [330, 30, 100],
  [-150, -150, 120], [150, -140, 120], [-420, 60, 80], [420, 55, 85], [0, -190, 110], [-280, -90, 110], [410, -40, 105],
  [-470, 50, 85], [270, -170, 115], [-330, -170, 105], [60, -265, 115], [470, 45, 80], [-200, -260, 95]];
function lobePath(t, grow = 0, dy = 0) {
  const p = new Path2D();
  LOBES.forEach(([x, y, r], i) => { const cx = x + Math.sin(t * .55 + i * 1.7) * 7, cy = y + Math.cos(t * .5 + i * 2.3) * 5 + dy;
    const rr = r + grow; p.moveTo(cx + rr, cy); p.arc(cx, cy, Math.max(.1, rr), 0, Math.PI * 2); });
  return p;
}
const X0 = -470 - 85 * .8, X1 = 470 + 80 * .8;
function underPath(t) {
  const n = Math.max(2, Math.round((X1 - X0) / 230)); const p = new Path2D();
  for (let i = 0; i < n; i++) { const u = (i + .5) / n, bw = (X1 - X0) / n * (1.15 + hash(i * 4.7) * .35), bh = 88 + hash(i * 2.9) * 40;
    const bx = lerp(X0 + 40, X1 - 40, u) + (hash(i * 6.1) - .5) * 40 + Math.sin(t * .6 + i * 2.1) * 5, by = 78 + (i % 2) * 14;
    p.addPath(cloud(bx, by, bw, bh, i * 11 + 3)); }
  return p;
}
// a flame tongue (base at x,y, pointing up, tip swayed sideways), added into a path
function tongueInto(p, x, y, w, h, sway) {
  p.moveTo(x - w / 2, y);
  p.bezierCurveTo(x - w * .56, y - h * .45, x + sway * .4 - w * .3, y - h * .72, x + sway, y - h);
  p.bezierCurveTo(x + sway * .4 + w * .32, y - h * .66, x + w * .56, y - h * .42, x + w / 2, y);
  p.quadraticCurveTo(x, y + w * .2, x - w / 2, y); p.closePath();
}
// a paper flame into three paths (outer carmine, orange, gold core): one cut per colour for a whole row
function flameInto(ps, x, y, w, h, sway) {
  if (h < 4) return;
  tongueInto(ps[0], x, y, w, h, sway);
  tongueInto(ps[0], x - w * .3, y + 2, w * .55, h * .6, sway * .6 - w * .14);
  tongueInto(ps[0], x + w * .32, y + 2, w * .5, h * .5, sway * .55 + w * .12);
  tongueInto(ps[1], x + sway * .05, y, w * .62, h * .7, sway * .8);
  tongueInto(ps[2], x + sway * .08, y, w * .3, h * .4, sway * .6);
}
const flamePaths = () => [new Path2D(), new Path2D(), new Path2D()];
function cutFlames(ps) { cut(ps[0], CAR2, { sh: .7, lift: .3, grain: .2 }); cut(ps[1], C.orange, { sh: .4, grain: .18 }); cut(ps[2], C.gold, { sh: .25, grain: .12 }); }
// the whole cloud at (x, y), scale sc. heat: orange glow on its belly; fire: flames up its underside
function stormCloud(x, y, sc, t, { heat = 0, fire = 0, shake = 0, puff = 0 } = {}) {
  g.save(); g.translate(x + jit(t, 11, shake), y + jit(t, 12, shake * .6)); g.scale(sc * (1 + puff), sc * (1 + puff * .6));
  const slab = rrect(X0 + 20, 22, X1 - X0 - 40, 100, 50);
  const back = lobePath(t, 14, 10); back.addPath(slab);
  cut(back, CL.dark, { sh: 1.1, lift: 1.2, grain: .28 });
  g.save(); g.beginPath(); g.rect(-900, -700, 1800, 758); g.clip();
  cut(lobePath(t, 0, -6), CL.mid, { sh: .5, lift: .3, grain: .26 });
  g.restore();
  const under = underPath(t);
  cut(under, CL.dark, { sh: .7, lift: .3, grain: .26 });
  if (heat > 0) {
    const all = new Path2D(); all.addPath(back); all.addPath(under);
    g.save(); g.clip(all); g.globalAlpha *= clamp(heat);
    const gr = g.createLinearGradient(0, 150, 0, -80); gr.addColorStop(0, 'rgba(232,116,59,.95)'); gr.addColorStop(.45, 'rgba(210,58,47,.5)'); gr.addColorStop(1, 'rgba(210,58,47,0)');
    g.fillStyle = gr; g.fillRect(-700, -420, 1400, 600); g.restore();
  }
  if (fire > .02) {
    const ps = flamePaths(), n = 10;
    for (let i = 0; i < n; i++) {
      const u = (i + .5) / n, fx = lerp(X0 + 40, X1 - 40, u) + (hash(i * 3.7) - .5) * 40, fy = 140 + (i % 2) * 8;
      const h = (170 + hash(i * 2.3) * 130) * fire * (.8 + .25 * Math.sin(t * 9 + i * 2.4));
      flameInto(ps, fx, fy, 96 + hash(i * 5.1) * 40, h, Math.sin(t * 7 + i * 1.9) * 26);
    }
    cutFlames(ps);
  }
  g.restore();
}
// smoke: grey-violet puffs rising off the cloud after "bronca" (cloud units)
function smokePuffs(x, y, sc, t, more = 0) {
  const p = new Path2D(); let any = false;
  for (let j = 0; j < 72; j++) {
    const tb = j < 12 ? T.bronca + .05 + j * .1 : T.bronca + 1.3 + (j - 12) * .42, life = j < 12 ? 2.0 : 2.3;
    const age = t - tb; if (age < 0 || age > life) continue;
    // they billow out of the burning belly and roll off both ends of the cloud (mostly the left), rising
    const k = age / life, r = (70 + hash(j * 3.3) * 70) * Math.pow(Math.sin(Math.PI * k), .7) * (j < 12 ? 1.5 : 1.15 + more);
    const side = hash(j * 7.1) < .68 ? -1 : 1;
    const px = side * (380 + hash(j * 2.1) * 160 + 260 * age), py = 40 - 230 * age;
    p.addPath(cloud(x + px * sc, y + py * sc, r * 2 * sc, r * 1.5 * sc, j * 5 + 1)); any = true;
  }
  if (any) cut(p, SMOKE, { sh: .5, lift: .2, grain: .2 });
}

// ======================= the brass band (03-harta2's instruments and layout, copied) =======================
const GOLD = { hi: C.goldPale, mid: C.gold, lo: '#c98d2a', dark: '#9c6a1c' };
function tube(pts, w) {
  const L = [], R = []; const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const ww = (typeof w === 'function' ? w(i / (n - 1)) : w) / 2;
    L.push([pts[i][0] - dy * ww, pts[i][1] + dx * ww]); R.push([pts[i][0] + dy * ww, pts[i][1] - dx * ww]);
  }
  return poly(L.concat(R.reverse()));
}
const arcPts = (cx, cy, r, a0, a1, n = 12) => [...Array(n + 1).keys()].map((i) => { const a = lerp(a0, a1, i / n); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
function flare(x0, x1, y, r0, R, pw = 3) {
  const top = [], bot = []; const n = 16;
  for (let i = 0; i <= n; i++) { const u = i / n, x = lerp(x0, x1, u), r = r0 + (R - r0) * Math.pow(u, pw); top.push([x, y - r]); bot.push([x, y + r]); }
  return poly(top.concat(bot.reverse()));
}
function bellMouth(x, y, R, rot = 0) {
  cut(ellipse(x, y, R * .2, R, rot), GOLD.hi, { sh: .3, grain: .15 });
  g.save(); g.fillStyle = GOLD.dark; g.fill(ellipse(x + Math.cos(rot) * 2, y + Math.sin(rot) * 2, R * .12, R * .78, rot)); g.restore();
}
const BELL = { trumpet: [250, 0], trombone: [322, -44], sax: [96, -190] };
function trumpet(press) {
  const back = new Path2D();
  back.addPath(tube([[-150, 14], [-58, 14]], 12));
  back.addPath(tube([...arcPts(-150, -6, 20, Math.PI * .5, Math.PI * 1.5)], 12));
  back.addPath(tube([[95, 46], [40, 46]], 11));
  back.addPath(tube([...arcPts(95, 26, 20, -Math.PI * .5, Math.PI * .5)], 11));
  back.addPath(tube([[-20, 64], [-20, 84], ...arcPts(-5, 84, 15, Math.PI, 0, 6).slice(1), [10, 64]], 9));
  cut(back, GOLD.lo, { sh: .6, grain: .2 });
  const front = new Path2D();
  front.addPath(tube([[-150, -26], [72, -26]], 13));
  front.addPath(flare(70, 250, -26 + 13, 7, 62, 3.2));
  front.addPath(tube([[-232, -2], [95, 6]], 11));
  front.addPath(poly([[-266, -12], [-252, -12], [-232, -5], [-232, 3], [-252, 10], [-266, 10]]));
  cut(front, GOLD.mid, { sh: .8, grain: .22, lift: .2 });
  bellMouth(250, -13, 62);
  const ink = new Path2D();
  [-45, -10, 25].forEach((x, i) => {
    const dn = press[i] * 9;
    ink.addPath(rrect(x - 14, -40, 28, 102, 6));
    ink.addPath(rect(x - 3, -62 + dn, 6, 24));
    ink.addPath(rrect(x - 11, 60, 22, 10, 3));
  });
  cut(ink, C.ink, { sh: .7, grain: .15 });
  [-45, -10, 25].forEach((x, i) => cut(ellipse(x, -64 + press[i] * 9, 14, 6), C.cream, { sh: .4, grain: .1 }));
  cut(rrect(-100, -6, 46, 9, 4), C.ink, { sh: .3, grain: 0 });
}
function trombone(ext) {
  const back = new Path2D();
  back.addPath(tube([[-10, 0], [300, 0]], 7)); back.addPath(tube([[-10, 28], [300, 28]], 7));
  back.addPath(tube([...arcPts(-150, -22, 22, Math.PI * .5, Math.PI * 1.5)], 13));
  back.addPath(tube([[-150, 0], [0, 0]], 12));
  cut(back, GOLD.lo, { sh: .6, grain: .2 });
  const sl = new Path2D(); const x0 = 40 + ext, x1 = 372 + ext;
  sl.addPath(tube([[x0, 0], [x1, 0]], 12)); sl.addPath(tube([[x0, 28], [x1, 28]], 12));
  sl.addPath(tube(arcPts(x1, 14, 14, -Math.PI * .5, Math.PI * .5), 12));
  sl.addPath(tube([[x0 + 22, -4], [x0 + 22, 32]], 9));
  sl.addPath(tube([[x1 - 40, -4], [x1 - 40, 32]], 7));
  cut(sl, GOLD.mid, { sh: .9, grain: .22, lift: .3 });
  cut(circle(x1 + 16, 14, 7), C.ink, { sh: .3, grain: 0 });
  const bell = new Path2D();
  bell.addPath(tube([[-150, -44], [150, -44]], 14));
  bell.addPath(flare(148, 322, -44, 7, 60, 3.3));
  bell.addPath(tube([[40, -40], [40, 2]], 6));
  bell.addPath(poly([[-34, 20], [-22, 20], [-6, 25], [-6, 31], [-22, 36], [-34, 36]]));
  cut(bell, GOLD.mid, { sh: .8, grain: .22, lift: .2 });
  bellMouth(322, -44, 60);
  cut(rrect(-176, -30, 14, 16, 3), C.ink, { sh: .3, grain: 0 });
}
function sax(press) {
  const bodyW = (u) => lerp(30, 56, u);
  const body = new Path2D();
  body.addPath(tube([[0, -300], [2, -150], [4, 40]], bodyW));
  body.addPath(tube(arcPts(48, 40, 44, Math.PI, 0, 14), 60));
  body.addPath(tube([[92, 40], [93, -60], [94, -96]], (u) => lerp(62, 70, u)));
  cut(body, GOLD.mid, { sh: .9, grain: .22, lift: .3 });
  g.save(); g.translate(94, -96); g.rotate(-Math.PI / 2 + .12); cut(flare(0, 94, 0, 35, 54, 2.4), GOLD.mid, { sh: .7, grain: .22 }); g.restore();
  bellMouth(BELL.sax[0] + 11, BELL.sax[1], 54, Math.PI / 2 + .12);
  const loop = new Path2D();
  loop.addPath(tube([[0, -300], [-2, -330], ...arcPts(-32, -342, 30, 0, -Math.PI * 1.75, 16)], 18));
  loop.addPath(tube([[-32 + Math.cos(-Math.PI * 1.75) * 30, -342 + Math.sin(-Math.PI * 1.75) * 30], [-86, -322]], 14));
  cut(loop, GOLD.lo, { sh: .6, grain: .2 });
  cut(poly([[-86, -330], [-118, -326], [-124, -318], [-118, -312], [-86, -314]]), C.ink, { sh: .4, grain: 0 });
  const keys = new Path2D();
  keys.addPath(tube([[26, -280], [30, -10]], 5));
  for (let i = 0; i < 8; i++) { const y = -270 + i * 34, r = 9 + i * .5 - press * 2; keys.addPath(circle(20 + i * .5, y, r)); }
  keys.addPath(circle(116, -64, 12)); keys.addPath(circle(118, -30, 12));
  keys.addPath(tube([[118, -76], [118, -18]], 5));
  cut(keys, C.ink, { sh: .5, grain: .12 });
  [[-20, -236], [-20, -206], [-22, -112], [-22, -84]].forEach(([x, y]) => cut(ellipse(x, y, 9, 6), C.cream, { sh: .3, grain: .1 }));
}
const BAND = [
  { kind: 'trumpet', x: 1235, y: 335, s: .66, rot: -.08, rod: 1250 },
  { kind: 'trumpet', x: 1300, y: 690, s: .66, rot: .03, rod: 1320 },
  { kind: 'trombone', x: 1475, y: 505, s: .9, rot: -.03, rod: 1500 },
  { kind: 'sax', x: 1765, y: 755, s: 1.05, rot: .04, rod: 1765 },
];
const playing = (t) => t > T.entry && env(t) > .42;
function blowEnv(t, j) {
  let e = 0;
  HITS.forEach((h, i) => { if (!WHO[i].includes(j)) return; const d = t - h; if (d >= 0 && d < 1.2) e = Math.max(e, Math.min(1, d / .06) * Math.exp(-d * 3.2)); });
  return e;
}
// back in on the slot from the right on the entry, the way 03 brought them on
const bandX = (t) => (1 - back(clamp((t - (T.entry - .4)) / .8))) * 1150;
const bob = (t, j) => -Math.abs(Math.sin(Math.PI * nOf(t) + j * .7)) * (6 + 8 * energy(t));
function bellWorld(b, t, j) {
  const e = blowEnv(t, j), bx = bandX(t);
  const [lx, ly] = BELL[b.kind];
  const ax = b.x + bx + e * 16, ay = b.y + bob(t, j);
  const r = b.rot - e * .05;
  const x = -lx * b.s, y = ly * b.s;
  return [ax + x * Math.cos(r) - y * Math.sin(r), ay + x * Math.sin(r) + y * Math.cos(r)];
}
function drawBand(t) {
  const bx = bandX(t);
  if (bx > 1400) return;
  const beat = Math.floor(nOf(t)), on = playing(t);
  BAND.forEach((b, j) => {
    const e = blowEnv(t, j);
    const ax = b.x + bx + e * 16, ay = b.y + bob(t, j);
    cut(rect(b.rod + bx - 3, ay + 10, 6, SLOT - ay - 6), C.ink, { sh: .4, grain: 0, alpha: .9 });
    g.save(); g.translate(ax, ay); g.rotate(b.rot - e * .05); g.scale(-b.s, b.s);
    if (b.kind === 'trumpet') trumpet([0, 1, 2].map((i) => (on && ((beat + i + j) % 3 === 0)) ? 1 : 0));
    else if (b.kind === 'trombone') { const pos = [0, 70, 140, 40, 190, 100]; const sp = on ? pos[((beat % pos.length) + pos.length) % pos.length] : 0; trombone(lerp(sp, 250, e)); }
    else sax(on && beat % 2 === 0 ? 1 : 0);
    g.restore();
  });
}
function brassRings(t) {
  const A0 = g.globalAlpha, life = 1.6, reach = 1150;
  HITS.forEach((h, i) => WHO[i].forEach((j) => {
    const b = BAND[j], big = BIG.includes(h);
    for (let r = 0; r < (big ? 3 : 2); r++) {
      const d = t - h - r * .16; if (d < 0 || d > life) continue;
      const k = d / life;
      const [x, y] = bellWorld(b, h + .05, j);
      const dir = b.kind === 'sax' ? -2.55 : Math.PI + b.rot * .5;
      g.save(); g.translate(x, y); g.rotate(dir);
      g.globalAlpha = A0 * (1 - k * k) * .95; g.strokeStyle = r % 2 ? C.goldPale : C.gold;
      g.lineWidth = lerp(big ? 20 : 15, 5, k); g.lineCap = 'round';
      const rr = 30 + k * reach, sp = Math.min(.5, 125 / rr); g.beginPath(); g.arc(0, 0, rr, -sp, sp); g.stroke();
      g.restore();
    }
  }));
  g.globalAlpha = A0;
}

// ======================= her, the full-figure dancer =======================
// the lace dress flares out like a spinning skirt on turns and hops (pose.flare 0..1)
function skirtFlare(pose) {
  const f = pose.flare || 0; if (f < .03) return;
  const pts = [[-70, -470], [-96 - 40 * f, -330], [-126 - 105 * f, -170 - 70 * f]];
  const n = 8; for (let i = 0; i <= n; i++) { const u = i / n; pts.push([lerp(-126 - 105 * f, 120 + 105 * f, u), -170 - 70 * f + Math.sin(u * Math.PI) * 36 * f + (i % 2 ? 12 : -2)]); }
  pts.push([100 + 40 * f, -330], [66, -470]);
  cut(blob(pts, .45), CAR, { sh: .5, lift: .2, grain: .26 });
}
const HER = { col: CAR, kind: 'dress', head: 'her', height: 1, lace: true, acc: [skirtFlare] };
function legIK(fx, lift) {
  const L1 = 266, L2 = 250, ty = 516 - lift;
  const d = clamp(Math.hypot(fx, ty), 60, L1 + L2 - .01), a = Math.atan2(fx, ty);
  const knee = Math.PI - Math.acos(clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
  const hip = a + Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  return [hip, knee];
}
const footY = (l) => 266 * Math.cos(l[0]) + 250 * Math.cos(l[0] - l[1]);
// stepping tables: foot positions and body after each count; a foot moves (lifted) in the .45 beat before it lands
function steps(m, F0, F1, BODY, win = .45) {
  const n = F0.length, c = Math.floor(m + win), p = clamp((m - (c - win)) / win);
  const i1 = ((c % n) + n) % n, i0 = (((c - 1) % n) + n) % n, e = eio(p), lift = Math.sin(Math.PI * p);
  return { f0: lerp(F0[i0], F0[i1], e), f1: lerp(F1[i0], F1[i1], e), body: lerp(BODY[i0], BODY[i1], e),
    l0: F0[i0] !== F0[i1] ? lift * 80 : 0, l1: F1[i0] !== F1[i1] ? lift * 80 : 0 };
}
// two-bone arm IK in body units (from 04-segura): the far hand on her hip
function ikArm(near, P, bend = 1) {
  const L1 = 168, L2 = 190, qx = P.x - (near ? 8 : -8), qy = P.y + 752;
  const d = clamp(Math.hypot(qx, qy), 40, L1 + L2 - .5);
  const a1 = Math.atan2(qx, qy) - bend * Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  return [a1, Math.atan2(qx - L1 * Math.sin(a1), qy - L1 * Math.cos(a1)) - a1];
}
const HIP = ikArm(false, { x: -24, y: -556 }, 1);
const NEUT = { body: 0, f0: 0, f1: 0, l0: 0, l1: 0, a00: .04, a01: .12, a10: -.04, a11: .12, lean: 0, head: 0, bounce: 0, flare: 0, laugh: 0, dir: 1 };
const MOVES = {
  stand: (t) => ({ ...NEUT, bounce: -7 * Math.abs(Math.sin(Math.PI * nOf(t))) * ss(102.4, 102.8, t), a00: lerp(.04, .5, ss(102.3, 102.7, t)), a01: lerp(.12, 1.0, ss(102.3, 102.7, t)) }),
  // salsa basic on 1, in profile: forward-replace-close, back-replace-close
  basic: (t, n0) => {
    const m = nOf(t) - n0, st = steps(m, [160, 160, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, -160, -160, 0, 0], [75, 25, 0, 0, -75, -25, 0, 0]);
    const sw = st.body / 150;
    return { ...NEUT, ...st, a00: .35 - .32 * sw, a01: 1.3, a10: .12 + .32 * sw, a11: 1.4, lean: st.body / 1700, head: .04 * Math.sin(Math.PI * m),
      bounce: -11 * Math.abs(Math.sin(Math.PI * m)), flare: .12 * Math.abs(sw) };
  },
  // step-close forward and back with one hand up, waving on the beat, the other on her hip (salsa styling)
  shimmy: (t, n0) => {
    const m = nOf(t) - n0, st = steps(m, [120, 120, 120, 0], [0, 120, 0, 0], [60, 120, 60, 0]), s2 = Math.sin(Math.PI * m);
    return { ...NEUT, ...st, body: st.body - 60, f0: st.f0 - 60, f1: st.f1 - 60, a00: 2.55 + .3 * s2, a01: .35 - .25 * s2, a10: HIP[0], a11: HIP[1],
      lean: .045 * s2, head: .05 * s2 + .08, bounce: -10 * Math.abs(Math.sin(Math.PI * m)), laugh: .25, flare: .15 * Math.abs(s2) };
  },
  // a spin with the near hand raised (salsa turn); the paper squashes through edge-on
  turn: (t, a, b, spins = 1) => {
    const u = clamp((t - a) / (b - a)), ue = eio(u), up = Math.pow(Math.sin(Math.PI * u), .5);
    let d = Math.cos(Math.PI * 2 * spins * ue); if (Math.abs(d) < .42) d = (d >= 0 ? 1 : -1) * .42;
    const st = Math.sin(Math.PI * 4 * spins * u);
    return { ...NEUT, dir: d, a00: lerp(.6, 2.85, up), a01: lerp(1.3, .25, up), a10: lerp(.25, -1.15, up), a11: .55, flare: Math.sin(Math.PI * u),
      f0: 28 * st, f1: -28 * st, l0: Math.max(0, st) * 45, l1: Math.max(0, -st) * 45, bounce: -18 * Math.sin(Math.PI * u), head: .08 * up };
  },
  // arms up in a V on a big brass hit, with a hop
  cheer: (t, h) => ({ ...NEUT, a00: 2.5, a01: .35, a10: -2.4, a11: -.3, head: .14, laugh: .45, f0: 30, f1: -30,
    l0: 45 * bump(t, h - .1, .5), l1: 45 * bump(t, h - .1, .5), bounce: -80 * bump(t, h - .1, .5), flare: .4 * bump(t, h - .1, .5) }),
  // call and response: she points at one instrument and it answers on the next hit (far hand on her hip)
  point: (t) => {
    const m = nOf(t), st = steps(m, [90, 0, 0, 0], [0, 0, -90, 0], [30, 0, -30, 0], .4);
    let j = CALL[0].j; for (const c of CALL) if (t >= c.h - .35) j = c.j;
    const [bx, by] = bellWorld(BAND[j], t, j), shx = HX + 8 * S, shy = FY - 752 * S;
    const dx = bx - shx, dy = by - shy, d = Math.hypot(dx, dy);
    const nr = ikArm(true, { x: 8 + dx / d * 345, y: -752 + dy / d * 345 }, 1);
    return { ...NEUT, ...st, a00: nr[0], a01: nr[1], a10: HIP[0], a11: HIP[1], head: .06 - dy / d * .25, lean: .03, bounce: -9 * Math.abs(Math.sin(Math.PI * m)), laugh: .2 };
  },
  // she looks up at the cloud, knees bent, ready
  lookUp: (t) => ({ ...NEUT, head: .34, a00: .95, a01: .5, a10: -.55, a11: .4, l0: 34, l1: 34, f0: 40, f1: -40, lean: -.05 }),
  // the finale: arms up and waving, a hop on every beat, the biggest hop on 126.66
  finale: (t) => {
    const m = nOf(t), st = steps(m, [90, 0, 0, 0], [0, 0, -90, 0], [35, 0, -35, 0], .4), w = Math.sin(Math.PI * m), E = energy(t);
    const fin = bump(t, 126.56, .5);
    return { ...NEUT, ...st, a00: 2.45 + .3 * w, a01: .35, a10: -2.35 + .3 * w, a11: -.3, head: .12 + .05 * w, laugh: .45,
      bounce: -(18 + 20 * E) * Math.abs(Math.sin(Math.PI * m)) - 70 * fin, l0: st.l0 + 40 * fin, l1: st.l1 + 40 * fin, flare: .2 * Math.abs(w) + .5 * fin };
  },
};
// [from, to, move, args]: the choreography, on the beat grid
const DANCE = [
  [100, 102.72, 'stand'],
  [102.72, 103.62, 'cheer', 102.93],
  [103.62, 108.12, 'basic', 4],                 // bar line 103.70
  [108.12, 108.78, 'cheer', 108.41],
  [108.78, 109.62, 'turn', 108.78, 109.6, 1],
  [109.62, 114.98, 'shimmy', 20],               // bar line 109.94
  [114.98, 115.56, 'cheer', 115.12],
  [115.56, 116.3, 'turn', 115.56, 116.28, 1],
  [116.3, 118.9, 'point'],
  [118.9, 121.2, 'basic', 44],                  // bar line 119.30 (counts carry on)
  [121.2, 121.62, 'lookUp'],
  [121.62, 122.52, 'cheer', 121.73],
  [122.52, 123.96, 'turn', 122.52, 123.94, 2],
  [123.96, 124.5, 'lookUp'],
  [124.5, 127.2, 'finale'],
];
const KEYS = Object.keys(NEUT);
function herPose(t) {
  const acc = {}; KEYS.forEach((k) => acc[k] = 0); let wsum = 0;
  for (const [a, b, mv, ...args] of DANCE) {
    const w = ss(a - .09, a + .09, t) * (1 - ss(b - .09, b + .09, t)); if (w <= 0) continue;
    const p = MOVES[mv](t, ...args); KEYS.forEach((k) => acc[k] += p[k] * w); wsum += w;
  }
  KEYS.forEach((k) => acc[k] /= wsum || 1);
  return acc;
}
function drawHer(q) {
  const legs = [legIK(q.f0 - q.body, q.l0), legIK(q.f1 - q.body, q.l1)];
  const pose = { legs, arms: [[q.a00, q.a01], [q.a10, q.a11]], lean: q.lean, head: q.head, laugh: q.laugh, flare: q.flare,
    bob: 516 - Math.max(footY(legs[0]), footY(legs[1])) + q.bounce };
  let d = q.dir; if (Math.abs(d) < .42) d = (d >= 0 ? 1 : -1) * .42;
  puppet(HX + q.body * S, FY, S, d, HER, pose);
}
const herX = (q) => HX + q.body * S;
const chestY = FY - 560 * S;

// her own gold rings on the big hits: full circles opening out from behind her (they start wide, so no ring
// sits on her like a belt)
function herBurst(t, x) {
  const A0 = g.globalAlpha; g.save(); g.lineCap = 'round';
  for (const h of BIG) {
    if (h < 108) continue;
    for (let r = 0; r < 3; r++) {
      const d = t - h - r * .14; if (d < 0 || d > 1.5) continue;
      const k = d / 1.5; g.globalAlpha = A0 * (1 - k) * .95; g.strokeStyle = r % 2 ? C.goldPale : C.gold; g.lineWidth = lerp(18, 4, k);
      g.beginPath(); g.arc(x, chestY - 40, 190 + eo(k) * 640, 0, Math.PI * 2); g.stroke();
    }
  }
  g.restore();
}
// gold embers flying up off the floor flames, more as the energy builds
function embers(t) {
  const E = energy(t), n = Math.round(10 + 34 * E), p = new Path2D(); let any = false;
  for (let j = 0; j < n; j++) {
    const life = 1.6 + hash(j * 2.9), ph = hash(j * 7.3) * life, age = ((t - 102.4 + ph) % life + life) % life;
    if (t < 102.4 + age) continue;
    const f = FLOOR_FLAMES[j % FLOOR_FLAMES.length], k = age / life;
    const x = f[0] + (hash(j * 3.7) - .5) * f[2] + Math.sin(age * 4 + j) * 26, y = 860 - f[1] * .6 - age * (260 + 180 * hash(j * 5.1));
    const r = (9 + 9 * hash(j * 1.3)) * Math.sin(Math.PI * k);
    if (r > .8) { p.addPath(star4(x, y, r)); any = true; }
  }
  if (any) cut(p, C.gold, { sh: .3, grain: 0, lift: .2 });
}

// ======================= the stage (03-harta2's, now burning) =======================
const HILL_B = (() => { const p = new Path2D(); p.moveTo(-40, H + 40); p.lineTo(-40, 780);
  for (let x = -40; x <= W + 40; x += 40) p.lineTo(x, 780 + Math.sin(x / 280 + 1.4) * 22); p.lineTo(W + 40, H + 40); p.closePath(); return p; })();
const FLOOR = cutRect(-60, 872, W + 120, 300, 21, 4), SLOT_P = cutRect(820, SLOT - 4, W, 10, 23, 2);
// flames along the back of the floor: x, height, width (kept clear of her and the rods)
const FLOOR_FLAMES = [[40, 190, 104], [190, 150, 90], [345, 175, 96], [470, 120, 78], [1000, 120, 76], [1130, 100, 70], [1400, 110, 70], [1600, 130, 80], [1890, 190, 104]];
function floorFlames(t) {
  const ps = flamePaths(), n = nOf(t), E = energy(t), on = back(clamp((t - 102.2) / .5));
  FLOOR_FLAMES.forEach(([x, h, w], i) => {
    const hop = Math.pow(Math.max(0, Math.cos(Math.PI * (n + (i % 2) * .5))), 5);
    const sway = Math.sin(Math.PI * (n + i * .5)) * w * .38;
    const hh = h * on * (.8 + .32 * hop + .6 * E + .3 * bump(t, 121.7, .9)) * (.95 + .08 * Math.sin(t * 11 + i * 3));
    flameInto(ps, x + sway * .2, 878, w * (1 + .25 * E), hh, sway);
  });
  cutFlames(ps);
}
// gold rings stamped out along the floor from her feet on each bar line, big ones on the big hits
function floorRings(t, x) {
  const A0 = g.globalAlpha; g.save(); g.lineCap = 'round';
  const nb = Math.floor(nOf(t) / 4) * 4;
  for (let k = 0; k < 3; k++) {
    const at = BEAT0 + (nb - 4 * k) * P, d = t - at; if (at < 103.6 || d < 0 || d > 1.3) continue;
    const u = d / 1.3; g.globalAlpha = A0 * (1 - u) * .95; g.strokeStyle = C.gold; g.lineWidth = lerp(11, 3, u);
    g.beginPath(); g.ellipse(x, FY + 4, 50 + u * 460, 8 + u * 46, 0, 0, Math.PI * 2); g.stroke();
  }
  for (const h of BIG) { const d = t - h; if (d < 0 || d > 1.5) continue; const u = d / 1.5;
    g.globalAlpha = A0 * (1 - u); g.strokeStyle = C.goldPale; g.lineWidth = lerp(16, 3, u);
    g.beginPath(); g.ellipse(x, FY + 4, 70 + u * 820, 11 + u * 70, 0, 0, Math.PI * 2); g.stroke(); }
  g.restore();
}

// ======================= the cloud's path =======================
function cloudA(t) {
  const inK = ss(90.0, 93.6, t);
  const x = lerp(-760, 690, inK) + Math.sin(t * .7) * 10, y = lerp(150, 250, inK) + Math.sin(t * .9) * 6;
  const sc = .85 * (1 - .5 * back(clamp((t - T.bronca - .05) / .62)));
  const away = eo((t - T.bronca) / 1.0);
  return { x: lerp(x, 520, away), y: lerp(y, 165, away), sc };
}
function cloudB(t, q) {
  let x = herX(q) * .3 + HX * .7 - 190 + Math.sin(t * .6) * 30, y = 165 + Math.sin(t * .9) * 6;
  let sc = .42;
  sc *= 1 + .28 * ss(120.4, 121.1, t) * (1 - ss(121.7, 122.0, t));            // swells up for the big try
  sc = lerp(sc, .3, back(clamp((t - 121.72) / .7)));                            // beaten smaller
  const dr = eio(ss(125.3, 126.95, t)); x = lerp(x, 330, dr); y = lerp(y, 175, dr);
  return { x, y, sc };
}
// the camera: the pull-back maps 04-sky's big profile exactly onto the puppet's head, then a slow push-in
const HEAD_W = { x: HX + 10 * S, y: FY - 790 * S };
const Z0 = ZA / (S * HK);
function camAt(t) {
  if (t < T.pb1) {
    const e = eio(ss(T.pb0, T.pb1, t));
    const Z = Math.exp(Math.log(Z0) * (1 - e));
    const sx = lerp(OX + ZA * 580, HEAD_W.x, e), sy = lerp(OY + ZA * 800, HEAD_W.y, e);
    return { Z, tx: sx - Z * HEAD_W.x, ty: sy - Z * HEAD_W.y, e };
  }
  const Z = 1 + .07 * eio(ss(115.5, 127, t)), F = { x: 900, y: 560 };
  return { Z, tx: F.x - Z * F.x, ty: F.y - Z * F.y, e: 1 };
}

// ======================= rain that turns to gold =======================
// drops fall from the cloud and turn to gold sparks where they meet the heat over her (a dome round her chest)
const DOME = 300;
function rainAndSparks(t) {
  const drops = new Path2D(), sparkG = new Path2D(), sparkP = new Path2D(); let nd = 0, ns = 0;
  RAIN.forEach((R, ri) => {
    for (let j = 0; j < R.n; j++) {
      const ts = R.a + (R.b - R.a) * hash(j * 3.1 + ri * 17), qs = herPose(ts), c = cloudB(ts, qs);
      const x0 = c.x + (hash(j * 5.3 + ri) - .5) * c.sc * 860, y0 = c.y + c.sc * 125;
      const v = R.v * (.85 + .3 * hash(j * 1.7 + ri));
      const hx = herX(qs), dx = x0 - hx;
      const yc = Math.abs(dx) < DOME * .97 ? chestY - Math.sqrt(DOME * DOME - dx * dx) : chestY;
      const tc = R.at ? R.at + hash(j * 4.4) * .1 : ts + Math.max(.18, (yc - y0) / v);
      if (t < ts) continue;
      if (t < tc) {
        const y = y0 + v * (t - ts), r = 10 + 3 * hash(j);
        drops.moveTo(x0, y - r * 2.6); drops.quadraticCurveTo(x0 + r * 1.1, y - r * .6, x0 + r, y + r * .2);
        drops.arc(x0, y + r * .2, r, 0, Math.PI); drops.quadraticCurveTo(x0 - r * 1.1, y - r * .6, x0, y - r * 2.6); drops.closePath(); nd++;
        continue;
      }
      const age = t - tc, life = R.at ? 1.4 : 1.0; if (age > life) continue;
      const cy = y0 + v * (tc - ts);
      const nk = R.at ? 5 : 4;
      for (let k = 0; k < nk; k++) {
        const a = k * Math.PI * 2 / nk + hash(j * 9.1 + k) * 1.2, sp = (R.at ? 280 : 180) * (.7 + .5 * hash(j + k * 3.3));
        const sx = x0 + Math.cos(a) * sp * age, sy = cy + Math.sin(a) * sp * age + 240 * age * age;
        const r = (R.at ? 26 : 23) * (1 - age / life) * (.7 + .5 * hash(j * 2 + k));
        (k % 2 ? sparkP : sparkG).addPath(star4(sx, sy, Math.max(.5, r))); ns++;
      }
    }
  });
  if (nd) cut(drops, SMOKE, { sh: .5, lift: .3, grain: .15 });
  if (ns) { cut(sparkG, C.gold, { sh: .4, lift: .3, grain: 0 }); cut(sparkP, C.goldPale, { sh: .4, lift: .3, grain: 0 }); }
}

// ======================= A: the big profile (04-segura's bust, halo and chest fire, copied) =======================
const BUST = (() => { const pts = HEAD_HER, p = new Path2D(); p.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 6) p.bezierCurveTo(pts[i], pts[i + 1], pts[i + 2], pts[i + 3], pts[i + 4], pts[i + 5]);
  p.lineTo(950, 1500); p.lineTo(120, 1500); p.closePath(); return p; })();
const CH = { x: 640, y: 1062 };
function tongue04(w, h, sway) {
  const p = new Path2D(); p.moveTo(-w / 2, 0);
  p.bezierCurveTo(-w * .58, -h * .36, -w * .12 + sway * .3, -h * .62, sway, -h);
  p.bezierCurveTo(w * .06 + sway * .45, -h * .6, w * .58, -h * .38, w / 2, 0);
  p.bezierCurveTo(w * .46, w * .46, -w * .46, w * .46, -w / 2, 0); p.closePath(); return p;
}
const FIRE_COLS = [CAR, CAR2, C.orange, C.gold];
function flame04(x, y, w, h, t, seed, layers = 4) {
  if (w < 1 || h < 1) return;
  for (let i = 0; i < layers; i++) {
    const k = 1 - i * .21, hk = 1 - i * .22;
    const sway = (Math.sin(t * 8.3 + seed * 3.1 + i * .7) * .2 + (hash(Math.floor(t * 12) * 3.7 + seed * 11 + i) - .5) * .14) * w * k;
    const hh = h * hk * (1 + .08 * Math.sin(t * 12.7 + seed * 5 + i));
    g.save(); g.translate(x, y + i * w * .05); cut(tongue04(w * k, hh, sway), FIRE_COLS[i], { sh: .45, grain: .2, lift: .1 }); g.restore();
  }
}
const HILLS = [[900, 26, 1.2, '#d9877f'], [975, 18, 3.4, '#c9746f']].map(([y, amp, ph, col]) => {
  const p = new Path2D(); p.moveTo(-20, H + 20); p.lineTo(-20, y);
  for (let x = 0; x <= W + 40; x += 40) p.lineTo(x, y + Math.sin(x / 260 + ph) * amp); p.lineTo(W + 40, H + 20); p.closePath(); return [p, col]; });
// heat rises from the back of her head, her crown and her brow (head units)
const HEAT_SRC = [[300, 690], [318, 600], [326, 500], [350, 400], [395, 320], [450, 255], [520, 215], [600, 200], [672, 240], [712, 290], [738, 350], [260, 780]];
function heatOf(t) {
  return clamp(ss(T.harta - .1, T.harta + .9, t) * (1 - .5 * ss(T.hartaEnd - .2, T.hartaEnd + 1.2, t)) + .25 * ss(T.de, T.bronca, t) + .9 * bump(t, T.bronca - .15, 1.0))
    * (1 - ss(T.pb0 - .2, T.pb0 + .2, t));
}
function heatStrips(t, toScreen) {
  const ps = [new Path2D(), new Path2D()]; let any = false;
  for (let j = 0; j < 110; j++) {
    const tb = T.harta - .15 + j * .075, life = 1.6, age = t - tb; if (age < 0 || age > life) continue;
    if (heatOf(tb) < .15 + .7 * hash(j * 1.9)) continue;
    const src = HEAT_SRC[Math.floor(hash(j * 7.7) * HEAT_SRC.length)], b = toScreen(src[0] + 20, src[1] + 30);
    const k = age / life, L = 170 + 150 * hash(j * 3.1), rise = 300 * age, drift = -(30 + 70 * hash(j * 2.3)) * age;
    const w = (36 + 24 * hash(j * 5.5)) * Math.sin(Math.PI * Math.min(1, k * 1.3 + .06));
    const ph = j * 1.3 + twos(t) * 6;
    const pts = []; for (let i = 0; i <= 10; i++) { const u = i / 10; pts.push([b[0] + drift + Math.sin(u * 4.2 + ph) * 26 - u * 24, b[1] - rise - u * L]); }
    ps[j % 2].addPath(ribbonAlong(pts, Math.max(1, w))); any = true;
  }
  if (any) { cut(ps[0], CAR2, { sh: .8, lift: .4, grain: .2 }); cut(ps[1], C.orange, { sh: .7, lift: .3, grain: .2 }); }
}

SHOT(90.0, 127.0, '05-fuego', (t) => {
  const q = herPose(t);
  const cam = camAt(t);
  const camM = new DOMMatrix([cam.Z, 0, 0, cam.Z, cam.tx, cam.ty]);
  const inPB = t >= T.pb0;
  const aFade = inPB ? 1 - ss(0, .3, cam.e) : 1;          // the big-profile pieces fade out under the pull-back

  // ---------------- ground ----------------
  sheet(C.rose);
  const warm = ss(104, 127, t) * .45 + energy(t) * .3;
  if (warm > 0) sheet('#ea9478', warm);

  // ---------------- B: the stage ----------------
  if (inPB) {
    g.save(); g.setTransform(camM);
    const hx = herX(q);
    // a fire glow behind her, breathing on the beat
    const gR = 560 + 140 * energy(t);
    g.save(); g.globalAlpha *= (.4 + .2 * beatPulse(t) + .3 * energy(t)) * ss(.3, 1, cam.e);
    const gg = g.createRadialGradient(hx, chestY, 40, hx, chestY, gR); gg.addColorStop(0, 'rgba(247,210,126,.85)'); gg.addColorStop(.45, 'rgba(232,116,59,.42)'); gg.addColorStop(1, 'rgba(232,116,59,0)');
    g.fillStyle = gg; g.fillRect(hx - gR, chestY - gR, gR * 2, gR * 2); g.restore();
    cut(HILL_B, C.roseDeep, { sh: .6 });
    cut(FLOOR, C.roseDark, { sh: .9, lift: .2 });
    cut(SLOT_P, C.ink, { sh: .2, grain: 0, alpha: .85 });
    floorFlames(t);
    brassRings(t);
    drawBand(t);
    g.save(); g.globalAlpha *= .22; g.fillStyle = C.ink; g.fill(ellipse(hx + 10, FY + 4, 120, 14)); g.restore();
    floorRings(t, hx);
    herBurst(t, hx);
    drawHer(q);
    embers(t);
    g.restore();
  }

  // ---------------- A: the big profile (and its hand-over under the pull-back) ----------------
  const tilt = (-.05 * ss(T.harta - .15, T.harta + .5, t) * (1 - ss(T.hartaEnd - .3, T.hartaEnd + .6, t))
    + .045 * bump(t, T.bronca - .08, .55) - .012 * bump(t, T.de - .05, .4) - .016 * bump(t, T.tu - .05, .35)) * (inPB ? 0 : 1);
  const lift = (18 * ss(T.harta - .15, T.harta + .6, t) * (1 - ss(T.hartaEnd - .3, T.hartaEnd + .6, t)) + 2.5 * Math.sin(t * 1.7) * (1 - ss(100.8, 101.5, t))) * (inPB ? 0 : 1);
  const toHer = () => {
    if (inPB) { g.setTransform(camM); g.translate(HEAD_W.x, HEAD_W.y); g.scale(S * HK, S * HK); g.translate(-580, -800); return; }
    g.translate(OX, OY - lift); g.scale(ZA, ZA); g.translate(560, 900); g.rotate(tilt); g.translate(-560, -900);
  };
  const toScreen = (hx, hy) => { const c = Math.cos(tilt), s2 = Math.sin(tilt), x = hx - 560, y = hy - 900;
    return [OX + ZA * (560 + x * c - y * s2), OY - lift + ZA * (900 + x * s2 + y * c)]; };
  // the fire in her chest: 04's end state, flaring on "Harta" and "bronca"
  const flareK = ss(T.harta - .2, T.harta + .6, t) * (1 - .6 * ss(T.hartaEnd - .2, T.hartaEnd + 1.0, t)) + .7 * bump(t, T.bronca - .1, .9);
  const heat = clamp(1 - .45 * ss(90.2, 92.5, t) + .5 * flareK);

  if (aFade > 0) {
    if (!inPB) HILLS.forEach(([p, col]) => cut(p, col, { sh: .6 }));
    // 04's tonal halo (rose papers) warmed by the fire's glow
    g.save(); g.globalAlpha *= aFade; toHer();
    cut(circle(470, 470, 434), '#eaa99e', { sh: .4, grain: .22 });
    cut(circle(470, 470, 400), '#efb8ab', { sh: .5, grain: .22 });
    if (!inPB) {
      const gl = g.createRadialGradient(CH.x, CH.y - 120, 40, CH.x, CH.y - 120, 900);
      gl.addColorStop(0, `rgba(240,140,70,${.55 * heat})`); gl.addColorStop(.5, `rgba(232,116,59,${.22 * heat})`); gl.addColorStop(1, 'rgba(232,116,59,0)');
      g.fillStyle = gl; g.fillRect(-600, -500, 2400, 2400);
    }
    g.restore();
  }

  // ---------------- the cloud (A: behind her; B: over the stage) ----------------
  let cs;
  if (!inPB) cs = cloudA(t);
  else {
    // under the pull-back it glides from where A left it to its stage place (the camera is identity at pb1)
    const a = cloudA(T.pb0), bw = cloudB(t, q), bs = { x: cam.Z * bw.x + cam.tx, y: cam.Z * bw.y + cam.ty, sc: bw.sc * cam.Z };
    cs = cam.e < 1 ? { x: lerp(a.x, bw.x, cam.e), y: lerp(a.y, bw.y, cam.e), sc: lerp(a.sc, bw.sc, cam.e) } : bs;
  }
  const raining = RAIN.reduce((m, R) => Math.max(m, ss(R.a - .3, R.a, t) * (1 - ss(R.b + .1, R.b + .5, t))), 0);
  const cloudOpts = inPB ? { heat: .5 + .2 * Math.sin(t * 3) - .3 * raining, fire: .32 + .1 * Math.sin(t * 6) - .26 * raining, shake: 3 + 9 * raining, puff: .06 * raining }
    : { heat: clamp(ss(T.harta + .6, T.de, t) * .8 + ss(T.de, T.bronca, t) * .3), fire: clamp(pop(t, T.bronca, .35)) * (1 - .55 * ss(T.bronca + .7, T.pb0, t)),
      shake: 2 + 6 * ss(T.de - .2, T.bronca, t) + 12 * bump(t, T.bronca, .7) };
  const drawCloud = () => { smokePuffs(cs.x, cs.y, cs.sc, t); stormCloud(cs.x, cs.y, cs.sc, t, cloudOpts); };
  if (!inPB) { drawCloud(); heatStrips(t, toScreen); }

  // ---------------- her big silhouette, the chest fire, the eye ----------------
  if (aFade > 0) {
    g.save(); g.globalAlpha *= aFade; toHer(); cut(BUST, CAR, { sh: 1.2 * aFade, lift: 1, grain: .3 }); g.restore();
    if (!inPB) {
      g.save(); toHer(); g.clip(BUST);
      // 04's chest fill and flames (w 240, h 420 at its end), flaring with her
      const top = 985 - 60 * flareK, pts = [[60, 1600], [60, top + 40]];
      for (let x = 60; x <= 980; x += 30) pts.push([x, top + 40 - Math.abs(Math.sin(x / 70 + t * 5)) * 70 - (hash(Math.floor(t * 12) + x) - .5) * 10]);
      pts.push([980, 1600]);
      g.save(); g.globalAlpha *= .4; cut(poly(pts), CAR2, { sh: .5, grain: .2, lift: .1 }); g.restore();
      const w = 240 * (1 + .12 * flareK), h = 420 * (1 + .35 * flareK), side = 1.4, baseY = CH.y + 50;
      flame04(CH.x - w * .5, baseY + 12, w * .62 * side, h * .62 * side, t, 2);
      flame04(CH.x + w * .48, baseY + 16, w * .58 * side, h * .7 * side, t, 3);
      flame04(CH.x - w * 1.05, baseY + 40, w * .5, h * .45, t, 4);
      flame04(CH.x + w * 1.0, baseY + 30, w * .5, h * .55, t, 5);
      flame04(CH.x, baseY, w, h, t, 1);
      g.restore();
    }
    // her eye, cut out of the big head (gold-pale, as 04 leaves it): shut hard on "Harta" and "bronca"
    const hard = clamp(ss(T.harta - .15, T.harta + .05, t) * (1 - ss(T.hartaEnd, T.hartaEnd + .25, t)) + bump(t, T.bronca - .1, .9));
    g.save(); g.globalAlpha *= aFade; toHer(); g.strokeStyle = C.goldPale; g.lineCap = 'round';
    g.lineWidth = lerp(5, 9, hard); g.beginPath();
    g.arc(706, lerp(452, 446, hard), lerp(13, 19, hard), Math.PI * lerp(.1, .14, hard), Math.PI * lerp(.9, .86, hard));
    g.stroke(); g.restore();
  }

  // ---------------- B: the cloud over the stage, its rain, the sparks ----------------
  if (inPB) {
    drawCloud();
    if (t > 107) { g.save(); g.setTransform(camM); rainAndSparks(t); g.restore(); }
  }
}, { xin: .5, tr: 'fade' });
})();

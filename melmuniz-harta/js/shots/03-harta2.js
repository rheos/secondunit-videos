// 03-harta2  50.0-72.4  "Harta (held) de tu bronca" + the 60-72 brass break.
// Big close profile (04-sky framing) on grey-blue, cream speech bubbles crowding her, the faceless storm
// cloud above. On "Harta" (51.56) she shuts her eye (crescent cut out of the head) and her shoulders rise
// up to her jaw; the held note squeezes the bubbles in. On "bronca" (57.96) she shakes her head three
// times and the nearest bubbles pop into cream confetti, two or three per turn.
// 60.3 the brass break: the camera pulls back from her face to the paper stage (she is now the full-figure
// puppet) while a paper brass section slides in on a slot from the right: two trumpets, a trombone with a
// working slide, a baritone sax, gold paper with ink valves and keys, each on a rod. On every brass hit
// (measured from the Demucs no_vocals stem) they blow gold rings that shove the last bubbles and the cloud
// toward the left edge, and the paper world warms a step from grey-blue to rose. The final two stabs
// (71.80, 72.00) throw the cloud out of frame; the band eases off to the right on rose.
// Local helpers (no kit edits): mix() colour blend, tube() constant-width paper tubes, herP() = the kit
// puppet with a shoulder hunch, a head turn (x squash) and the closed-eye crescent.
(() => {
const T = { harta: 51.56, held: 55.45, de: 57.23, tu: 57.62, bronca: 57.96, shake: 58.0, brk: 60.30, zoomEnd: 61.75, end: 72.4 };
// brass phrase attacks in 60-72 (band-limited 500-2500 Hz rise after a gap, no_vocals stem)
const HITS = [61.30, 62.50, 64.40, 65.60, 67.50, 68.70, 70.65, 71.80, 72.00];
// which instruments blow on each hit: 0 trumpet A, 1 trumpet B, 2 trombone, 3 bari sax
const WHO = [[0, 1, 2, 3], [0, 1], [2], [3], [0, 1], [0, 1, 2, 3], [2, 3], [0, 1, 2, 3], [0, 1]];
// how far each hit shoves the bubbles (px); the cloud is heavier until the last two stabs
const STEP = [80, 100, 110, 120, 130, 140, 160, 400, 400];
const CSTEP = [60, 80, 95, 105, 115, 130, 160, 700, 500];
// phrases the band is actually playing (for valve presses and slide moves)
const PHR = [[60.30, 62.35], [62.50, 64.15], [64.40, 65.35], [65.60, 67.25], [67.50, 68.30], [68.70, 70.35], [70.65, 71.50], [71.80, 71.95], [72.00, 72.45]];
const BEAT0 = 60.04, BEAT = .3903;                 // percussion grid in the break
const RING = { reach: 1200, life: 1.8 };           // ring speed = reach / life px per second
const RSPD = RING.reach / RING.life;

// ---------------- colour ----------------
const rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, k) => { const A = rgb(a), B = rgb(b); k = clamp(k); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; };
const CL = { a: '#4a4458', b: '#5c566b' };          // storm cloud papers
const GOLD = { hi: C.goldPale, mid: C.gold, lo: '#c98d2a', dark: '#9c6a1c' };

// ---------------- framing ----------------
// world = the wide stage (screen px at camera scale 1). Her puppet stands at (HX, HY), scale HS.
// The close shot is the same puppet seen through a camera that puts her head exactly on 04-sky's
// big profile: ox 470, oy -150, zoom ZC (head units -> screen = ox + ZC*u, oy + ZC*v).
const HX = 540, HY = 880, HS = .6, HK = .265;
const ZC = 1.26, OX = 470, OY = -150;
const SC = ZC / HK;                                 // puppet scale in the close shot
const PXc = OX - SC * 10 + ZC * 580, PYc = OY + SC * 790 + ZC * 800;
const KC = SC / HS;
const CC = [(W / 2 - (PXc - KC * HX)) / KC, (H / 2 - (PYc - KC * HY)) / KC];   // world point at screen centre, close
const CW = [W / 2, H / 2];
function camera(t) {
  const z = eio(clamp((t - T.brk) / (T.zoomEnd - T.brk)));
  const k = Math.exp(lerp(Math.log(KC), 0, z));
  const w = (1 / k - 1 / KC) / (1 - 1 / KC);       // straight-line zoom: a fixed point stays put
  return { z, k, cx: lerp(CC[0], CW[0], w), cy: lerp(CC[1], CW[1], w) };
}
const applyCam = (cam, t) => { g.translate(W / 2 + jit(t, 3) * (1 - cam.z), H / 2 + jit(t, 4) * (1 - cam.z)); g.scale(cam.k, cam.k); g.translate(-cam.cx, -cam.cy); };
const toScreen = (cam, x, y) => [W / 2 + cam.k * (x - cam.cx), H / 2 + cam.k * (y - cam.cy)];

// ---------------- her (the kit puppet, plus hunch / turn / eye) ----------------
function herP(x, y, s, pose, eye) {
  const col = C.navy, hunch = pose.hunch || 0, up = -hunch * 46;
  const arms = pose.arms || [[0, .15], [0, .15]], legs = pose.legs || [[0, 0], [0, 0]];
  g.save(); g.translate(x, y + (pose.bob || 0) * s); g.scale(s, s); g.rotate(pose.lean || 0);
  g.save(); g.translate(-6, -540); leg(legs[1][0], legs[1][1], col); g.restore();
  g.save(); g.translate(-8, -752 + up); arm(arms[1][0], arms[1][1], col); g.restore();
  g.save(); g.translate(6, -540); leg(legs[0][0], legs[0][1], col); g.restore();
  // the dress stretches up from a fixed hem, so the shoulders climb toward her jaw
  g.save(); g.translate(0, -175); g.scale(1, (631 - up) / 631); g.translate(0, 175);
  cut(LACE, col, { sh: .6, grain: .26, lift: .2, rule: 'evenodd' }); g.restore();
  // close shot: a cameo bust under the neck whose shoulders climb toward her jaw on the hunch
  if (pose.mound > 0) {
    const hu = (u, v) => [10 + HK * (u - 580), -790 + HK * (v - 800) - hunch * 150 * HK];
    g.save(); g.globalAlpha *= pose.mound;
    cut(blob([[400, 840], [330, 870], [210, 930], [90, 1010], [-40, 1120], [-120, 1300], [1060, 1300], [990, 1110], [880, 1010],
      [760, 950], [660, 905], [560, 880]].map(([u, v]) => hu(u, v)), .5), col, { sh: .7, grain: .26, lift: .2 });
    g.restore();
  }
  // head: sinks a little into the raised shoulders; sx < 1 = the head turning (a paper flip)
  g.save(); g.translate(10, -790 + hunch * 14); g.rotate(-(pose.head || 0) * .9); g.scale(HK * (pose.sx || 1), HK); g.translate(-580, -800);
  g.save(); g.beginPath(); g.rect(-200, -200, 1400, 1040); g.clip(); cut(HEADS.her, col, { sh: .5, grain: .25 }); g.restore();
  if (eye && eye.k > 0) {
    // the closed eye, cut out of the head so the ground shows through; squeezed = lower, thicker, wider
    g.save(); g.globalAlpha *= eye.k; g.strokeStyle = eye.col; g.lineCap = 'round';
    g.lineWidth = lerp(6, 10, eye.sq);
    g.beginPath(); g.arc(706, lerp(448, 444, eye.sq), lerp(16, 21, eye.sq), Math.PI * lerp(.12, .08, eye.sq), Math.PI * lerp(.88, .92, eye.sq)); g.stroke();
    g.restore();
  }
  g.restore();
  g.save(); g.translate(8, -752 + up); arm(arms[0][0], arms[0][1], col); g.restore();
  g.restore();
}

// ---------------- speech bubbles ----------------
// cream oval + a tail toward (tx, ty), one path with one winding (no hole where they overlap)
function bubblePath(x, y, rx, ry, tx, ty) {
  const p = ellipse(x, y, rx, ry); const a = Math.atan2((ty - y) / ry, (tx - x) / rx);
  const P = (an, k) => [x + Math.cos(an) * rx * k, y + Math.sin(an) * ry * k];
  const b1 = P(a - .32, .92), tip = P(a + .1, 1.55), b2 = P(a + .32, .92);
  p.moveTo(b1[0], b1[1]); p.lineTo(tip[0], tip[1]); p.lineTo(b2[0], b2[1]); p.closePath();
  return p;
}
// c: close-shot screen pos/size; w: wide screen pos/size (null = popped on the shake); pop: which turn (0,1,2)
const BUB = [
  { c: [1700, 290, 118], pop: 1 }, { c: [1745, 560, 132], pop: 0 }, { c: [1660, 800, 108], pop: 0 },
  { c: [1850, 120, 92], w: [860, 190, 54] }, { c: [1330, 66, 104], w: [690, 110, 48] },
  { c: [560, 420, 124], pop: 2 }, { c: [400, 700, 118], w: [300, 560, 58] }, { c: [215, 360, 100], w: [240, 300, 54] },
  { c: [130, 620, 88], w: [120, 470, 48] }, { c: [580, 770, 94], pop: 2 }, { c: [250, 860, 78], w: [400, 760, 46] },
  { c: [1530, 160, 100], pop: 1 }, { c: [790, 215, 96], pop: 1 }, { c: [1880, 410, 80], w: [420, 200, 50] },
];
const POPT = [58.0, 58.25, 58.5];
// cumulative push of a thing at wide x0 by time t; each hit's push lands when its ring arrives
function pushed(t, x0, steps, bellX = 1100) {
  let px = 0;
  for (let i = 0; i < HITS.length; i++) {
    const delay = clamp((bellX - (x0 - px)) / RSPD, .1, HITS[i] >= 71.8 ? .2 : 1.5);
    const k = eo((t - HITS[i] - delay) / (HITS[i] >= 71.8 ? .4 : .55));
    px += steps[i] * k;
    if (k <= 0) break;
  }
  return px;
}
// the moment hit i's ring reaches x (for squash / tumble kicks)
const arrive = (i, x0, px) => HITS[i] + clamp((1100 - (x0 - px)) / RSPD, .1, 1.7);

function confetti(t, x, y, r, at, seed) {
  const d = t - at; if (d < 0 || d > 1.6) return;
  const A0 = g.globalAlpha;
  // the pop: a burst of cream rays for two drawings
  if (d < .17) { g.save(); g.translate(x, y); g.fillStyle = C.cream;
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + seed; g.save(); g.rotate(a); g.fill(poly([[r * .55, -7], [r * (1.05 + d * 3), 0], [r * .55, 7]])); g.restore(); }
    g.restore(); }
  // the bubble tears into pieces: a few big shards and many small bits, falling and spinning
  for (let i = 0; i < 18; i++) {
    const big = i < 5;
    const a = hash(seed * 31 + i) * Math.PI * 2, sp = (big ? 200 : 300) + hash(seed * 17 + i * 3) * 480;
    const px = x + Math.cos(a) * (r * .45 + sp * d), py = y + Math.sin(a) * (r * .3 + sp * d * .8) - 180 * d + 900 * d * d;
    const sz = (big ? 26 + hash(i * 2.1 + seed) * 20 : 10 + hash(i * 5.3 + seed) * 10) * (r / 110);
    g.save(); g.translate(px, py); g.rotate(a + d * (5 + hash(i) * 7) * (i % 2 ? 1 : -1));
    g.globalAlpha = A0 * (1 - ss(.8, 1.6, d));
    const sh = big ? poly([[-sz * .5, -sz * .3], [sz * .45, -sz * .42], [sz * .2, sz * .1], [sz * .5, sz * .35], [-sz * .3, sz * .3]])
      : poly([[-sz / 2, -sz * .35], [sz / 2, -sz * .3], [sz * .4, sz * .35], [-sz / 2, sz * .3]]);
    g.translate(3, 5); g.fillStyle = 'rgba(20,16,30,.25)'; g.fill(sh); g.translate(-3, -5);
    g.fillStyle = i % 4 === 3 ? C.creamDeep : C.cream; g.fill(sh);
    g.restore();
  }
  g.globalAlpha = A0;
}

// ---------------- the storm cloud (faceless) ----------------
function stormCloud(x, y, s, t) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const br = (i) => 1 + .025 * Math.sin(twos(t) * 2.2 + i * 1.7);
  cut(cloud(0, 40, 1060 * br(0), 300, 3), CL.a, { sh: .9, lift: .5 });
  cut(cloud(-270, -30, 560 * br(1), 330, 7), CL.b, { sh: .7, lift: .3 });
  cut(cloud(240, -50, 640 * br(2), 370, 11), CL.b, { sh: .7, lift: .3 });
  cut(cloud(-10, -120, 470 * br(3), 300, 5), CL.b, { sh: .6, lift: .2 });
  cut(cloud(10, 120, 880, 120, 13), CL.a, { sh: .5 });
  g.restore();
}

// ---------------- paper brass (drawn facing RIGHT, bell at +x; the band flips them) ----------------
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
// a bell flare along +x from x0 (radius r0) to x1 (rim radius R), axis at y
function flare(x0, x1, y, r0, R, pw = 3) {
  const top = [], bot = []; const n = 16;
  for (let i = 0; i <= n; i++) { const u = i / n, x = lerp(x0, x1, u), r = r0 + (R - r0) * Math.pow(u, pw); top.push([x, y - r]); bot.push([x, y + r]); }
  return poly(top.concat(bot.reverse()));
}
// the open bell seen nearly edge-on: a rim and a dark throat
function bellMouth(x, y, R, rot = 0) {
  cut(ellipse(x, y, R * .2, R, rot), GOLD.hi, { sh: .3, grain: .15 });
  g.save(); g.fillStyle = GOLD.dark; g.fill(ellipse(x + Math.cos(rot) * 2, y + Math.sin(rot) * 2, R * .12, R * .78, rot)); g.restore();
}
const BELL = { trumpet: [250, 0], trombone: [322, -44], sax: [96, -190] };   // rim centre, local units

function trumpet(press) {
  // back tubes first (darker gold), then the front ones
  const back = new Path2D();
  back.addPath(tube([[-150, 14], [-58, 14]], 12));                                        // lower tube from the back bow
  back.addPath(tube([...arcPts(-150, -6, 20, Math.PI * .5, Math.PI * 1.5)], 12));          // back bow
  back.addPath(tube([[95, 46], [40, 46]], 11));                                            // tuning slide return
  back.addPath(tube([...arcPts(95, 26, 20, -Math.PI * .5, Math.PI * .5)], 11));            // main tuning slide
  back.addPath(tube([[-20, 64], [-20, 84], ...arcPts(-5, 84, 15, Math.PI, 0, 6).slice(1), [10, 64]], 9));  // 2nd valve slide
  cut(back, GOLD.lo, { sh: .6, grain: .2 });
  const front = new Path2D();
  front.addPath(tube([[-150, -26], [72, -26]], 13));                                       // bell tube
  front.addPath(flare(70, 250, -26 + 13, 7, 62, 3.2));
  front.addPath(tube([[-232, -2], [95, 6]], 11));                                          // leadpipe
  front.addPath(poly([[-266, -12], [-252, -12], [-232, -5], [-232, 3], [-252, 10], [-266, 10]]));  // mouthpiece
  cut(front, GOLD.mid, { sh: .8, grain: .22, lift: .2 });
  bellMouth(250, -13, 62);
  // three ink valve casings, finger buttons pressed on the beat
  const ink = new Path2D();
  [-45, -10, 25].forEach((x, i) => {
    const dn = press[i] * 9;
    ink.addPath(rrect(x - 14, -40, 28, 102, 6));
    ink.addPath(rect(x - 3, -62 + dn, 6, 24));
    ink.addPath(rrect(x - 11, 60, 22, 10, 3));
  });
  cut(ink, C.ink, { sh: .7, grain: .15 });
  [-45, -10, 25].forEach((x, i) => cut(ellipse(x, -64 + press[i] * 9, 14, 6), C.cream, { sh: .4, grain: .1 }));
  cut(rrect(-100, -6, 46, 9, 4), C.ink, { sh: .3, grain: 0 });                              // finger hook brace
}

function trombone(ext) {
  // outer slide (moves) behind, inner slide, bell section in front
  const back = new Path2D();
  back.addPath(tube([[-10, 0], [300, 0]], 7)); back.addPath(tube([[-10, 28], [300, 28]], 7));          // inner slide
  back.addPath(tube([...arcPts(-150, -22, 22, Math.PI * .5, Math.PI * 1.5)], 13));                      // tuning-slide bow
  back.addPath(tube([[-150, 0], [0, 0]], 12));                                                         // gooseneck to the slide
  cut(back, GOLD.lo, { sh: .6, grain: .2 });
  const sl = new Path2D(); const x0 = 40 + ext, x1 = 372 + ext;
  sl.addPath(tube([[x0, 0], [x1, 0]], 12)); sl.addPath(tube([[x0, 28], [x1, 28]], 12));
  sl.addPath(tube(arcPts(x1, 14, 14, -Math.PI * .5, Math.PI * .5), 12));
  sl.addPath(tube([[x0 + 22, -4], [x0 + 22, 32]], 9));                                                  // hand brace
  sl.addPath(tube([[x1 - 40, -4], [x1 - 40, 32]], 7));                                                  // front stay
  cut(sl, GOLD.mid, { sh: .9, grain: .22, lift: .3 });
  cut(circle(x1 + 16, 14, 7), C.ink, { sh: .3, grain: 0 });                                            // bumper
  const bell = new Path2D();
  bell.addPath(tube([[-150, -44], [150, -44]], 14));
  bell.addPath(flare(148, 322, -44, 7, 60, 3.3));
  bell.addPath(tube([[40, -40], [40, 2]], 6));                                                         // bell brace
  bell.addPath(poly([[-34, 20], [-22, 20], [-6, 25], [-6, 31], [-22, 36], [-34, 36]]));               // mouthpiece
  cut(bell, GOLD.mid, { sh: .8, grain: .22, lift: .2 });
  bellMouth(322, -44, 60);
  cut(rrect(-176, -30, 14, 16, 3), C.ink, { sh: .3, grain: 0 });                                      // water key
}

function sax(press) {
  // body (narrow at the top, wide at the bow), the bow, the bell section, the crook loop, the neck
  const bodyW = (u) => lerp(30, 56, u);
  const body = new Path2D();
  body.addPath(tube([[0, -300], [2, -150], [4, 40]], bodyW));
  body.addPath(tube(arcPts(48, 40, 44, Math.PI, 0, 14), 60));
  body.addPath(tube([[92, 40], [93, -60], [94, -96]], (u) => lerp(62, 70, u)));
  cut(body, GOLD.mid, { sh: .9, grain: .22, lift: .3 });
  // the bell flares upward: build it in a rotated frame
  g.save(); g.translate(94, -96); g.rotate(-Math.PI / 2 + .12); cut(flare(0, 94, 0, 35, 54, 2.4), GOLD.mid, { sh: .7, grain: .22 }); g.restore();
  bellMouth(BELL.sax[0] + 11, BELL.sax[1], 54, Math.PI / 2 + .12);
  // crook loop and neck (the bari's pigtail), mouthpiece in ink
  const loop = new Path2D();
  loop.addPath(tube([[0, -300], [-2, -330], ...arcPts(-32, -342, 30, 0, -Math.PI * 1.75, 16)], 18));
  loop.addPath(tube([[-32 + Math.cos(-Math.PI * 1.75) * 30, -342 + Math.sin(-Math.PI * 1.75) * 30], [-86, -322]], 14));
  cut(loop, GOLD.lo, { sh: .6, grain: .2 });
  cut(poly([[-86, -330], [-118, -326], [-124, -318], [-118, -312], [-86, -314]]), C.ink, { sh: .4, grain: 0 });
  // ink key cups down the front, rods, cream pearl touches at the back; on the beat the cups close
  const keys = new Path2D();
  keys.addPath(tube([[26, -280], [30, -10]], 5));
  for (let i = 0; i < 8; i++) { const y = -270 + i * 34, r = 9 + i * .5 - press * 2; keys.addPath(circle(20 + i * .5, y, r)); }
  keys.addPath(circle(116, -64, 12)); keys.addPath(circle(118, -30, 12));                              // low B / Bb cups on the bell
  keys.addPath(tube([[118, -76], [118, -18]], 5));                                                     // their rod
  cut(keys, C.ink, { sh: .5, grain: .12 });
  [[-20, -236], [-20, -206], [-22, -112], [-22, -84]].forEach(([x, y]) => cut(ellipse(x, y, 9, 6), C.cream, { sh: .3, grain: .1 }));
}

// ---------------- the band ----------------
// world anchors (facing LEFT after the flip), rod foot on the slot at y SLOT
const SLOT = 893;
const BAND = [
  { kind: 'trumpet', x: 1235, y: 335, s: .66, rot: -.08, rod: 1250 },
  { kind: 'trumpet', x: 1300, y: 690, s: .66, rot: .03, rod: 1320 },
  { kind: 'trombone', x: 1475, y: 505, s: .9, rot: -.03, rod: 1500 },
  { kind: 'sax', x: 1765, y: 755, s: 1.05, rot: .04, rod: 1765 },
];
const playing = (t) => PHR.some(([a, b]) => t >= a && t < b);
function blowEnv(t, j) {
  let e = 0;
  HITS.forEach((h, i) => { if (!WHO[i].includes(j)) return; const d = t - h; if (d >= 0 && d < 1.2) e = Math.max(e, Math.min(1, d / .06) * Math.exp(-d * 3.2)); });
  return e;
}
function bandX(t) {
  const inn = 1 - back(clamp((t - 60.45) / .8));                     // slides in on the slot
  const out = ss(71.95, 73.0, t);                                      // eases off to the right
  return inn * 1150 + out * 1000;
}
function bellWorld(b, t, j) {
  const e = blowEnv(t, j), bx = bandX(t);
  const [lx, ly] = BELL[b.kind];
  const ax = b.x + bx + e * 16, ay = b.y + bob(t, j);
  const r = b.rot - e * .05;
  // flipped: local (lx, ly) -> (-lx, ly), then rotate by r, scale
  const x = -lx * b.s, y = ly * b.s;
  return [ax + x * Math.cos(r) - y * Math.sin(r), ay + x * Math.sin(r) + y * Math.cos(r)];
}
function bob(t, j) {
  if (t < 60.3) return 0;
  const ph = (t - BEAT0) / BEAT;
  return -Math.abs(Math.sin(Math.PI * ph + j * .7)) * 6;
}
function drawBand(t, warm) {
  const bx = bandX(t);
  if (bx > 1400) return;
  const beat = Math.floor((t - BEAT0) / BEAT), on = playing(t);
  BAND.forEach((b, j) => {
    const e = blowEnv(t, j);
    const ax = b.x + bx + e * 16, ay = b.y + bob(t, j);
    // the rod down to the slot
    cut(rect(b.rod + bx - 3, ay + 10, 6, SLOT - ay - 6), C.ink, { sh: .4, grain: 0, alpha: .9 });
    g.save(); g.translate(ax, ay); g.rotate(b.rot - e * .05); g.scale(-b.s, b.s);
    if (b.kind === 'trumpet') {
      const press = [0, 1, 2].map((i) => (on && ((beat + i + j) % 3 === 0)) ? 1 : 0);
      trumpet(press);
    } else if (b.kind === 'trombone') {
      // slide positions move on the beat while playing, and shoot out on its hits
      const pos = [0, 70, 140, 40, 190, 100];
      const sp = on ? pos[((beat % pos.length) + pos.length) % pos.length] : 0;
      trombone(lerp(sp, 250, e));
    } else sax(on && beat % 2 === 0 ? 1 : 0);
    g.restore();
  });
}
function brassRings(t) {
  const A0 = g.globalAlpha;
  HITS.forEach((h, i) => WHO[i].forEach((j) => {
    const b = BAND[j];
    for (let r = 0; r < 2; r++) {
      const d = t - h - r * .16; if (d < 0 || d > RING.life) continue;
      const k = d / RING.life;
      const [x, y] = bellWorld(b, h + .05, j);
      const dir = b.kind === 'sax' ? -2.55 : Math.PI + b.rot * .5;
      g.save(); g.translate(x, y); g.rotate(dir);
      g.globalAlpha = A0 * (1 - k * k) * .95; g.strokeStyle = r % 2 ? C.goldPale : C.gold;
      g.lineWidth = lerp(18, 7, k); g.lineCap = 'round';
      const rr = 30 + k * RING.reach, sp = Math.min(.5, 125 / rr); g.beginPath(); g.arc(0, 0, rr, -sp, sp); g.stroke();
      g.restore();
    }
  }));
  g.globalAlpha = A0;
}

// ---------------- the shot ----------------
SHOT(50.0, 72.4, '03-harta2', (t) => {
  const A0 = g.globalAlpha;
  const cam = camera(t), z = cam.z;
  // warmth: a drift plus a step on every brass hit; full rose by 72.4
  let steps = 0; HITS.forEach((h) => { steps += ss(h, h + .35, t); });
  const warm = clamp(ss(60.4, 72.2, t) * .45 + steps / HITS.length * .55);
  const ground = mix(C.w2, C.rose, warm);
  sheet(ground);
  // the cloud's shadow darkens the top of the frame until it is pushed away
  const cloudShade = (1 - ss(66, 72.2, t)) * .5;
  if (cloudShade > 0) { g.save(); g.globalAlpha = A0 * cloudShade; const gr = g.createLinearGradient(0, 0, 0, H * .7); gr.addColorStop(0, C.w0); gr.addColorStop(1, 'rgba(42,48,66,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore(); }

  // ---- times ----
  const hunch = ss(T.harta - .05, T.harta + .55, t) * (1 - ss(58.95, 59.8, t));
  const sqz = ss(T.harta, T.held, t) * (1 - ss(58.9, 59.6, t) * .6);
  // the shake: 3 turns x 3 drawings from 58.0 (twos), squash through edge-on and back
  let sx = 1, rot = 0;
  const n = Math.round((t - T.shake) * 12);
  if (n >= 0 && n < 9) { const ph = n % 3, side = (Math.floor(n / 3) % 2) ? -1 : 1; sx = [.64, .82, 1][ph]; rot = [.06, .025, 0][ph] * side; }
  const flinch = bump(t, T.harta - .04, .5) * .05;
  // head: negative = chin down
  const headA = -(.05 * hunch + flinch) + rot + lerp(0, .1, ss(61.8, 66, t));

  // ---- the stage (world, under the camera): back hill, floor, slot, band, her ----
  const cloudX0 = lerp(420, 560, z), cloudY0 = lerp(215, 150, z);
  const cloudS = lerp(.88, .62, z) * lerp(1, .86, ss(T.harta, T.held, t));
  const cPush = pushed(t, cloudX0 + 310, CSTEP);
  const cloudGone = cloudX0 - cPush < -500;
  // the cloud hangs behind her
  if (!cloudGone) {
    let kick = 0; HITS.forEach((h, i) => { kick += bump(t, arrive(i, cloudX0 + 310, 0), .35); });
    g.save(); g.translate(cloudX0 - cPush, cloudY0 + jit(t, 9, 1.5)); g.rotate(-kick * .04); g.scale(1 - kick * .06, 1 + kick * .04);
    stormCloud(0, 0, cloudS, t); g.restore();
  }

  g.save(); applyCam(cam, t);
  if (z > 0) {
    const hill = (y, amp, ph, col) => { const p = new Path2D(); p.moveTo(-40, H + 40); p.lineTo(-40, y);
      for (let x = -40; x <= W + 40; x += 40) p.lineTo(x, y + Math.sin(x / 280 + ph) * amp); p.lineTo(W + 40, H + 40); p.closePath(); cut(p, col, { sh: .6 }); };
    hill(780, 22, 1.4, mix(C.w3, C.roseDeep, warm));
    cut(cutRect(-60, 872, W + 120, 300, 21, 4), mix(C.w1, C.roseDark, warm), { sh: .9, lift: .2 });
    cut(cutRect(820, SLOT - 4, W, 10, 23, 2), C.ink, { sh: .2, grain: 0, alpha: .85 });
    // her shadow on the floor
    g.save(); g.globalAlpha *= .22; g.fillStyle = C.ink; g.fill(ellipse(HX + 10, HY + 4, 120, 14)); g.restore();
    brassRings(t);
    drawBand(t, warm);
  }
  // her pose in the break: chin lifts as the rings wash past, a small bounce on the beat from 66
  const groove = ss(65.6, 68.7, t) * (1 - ss(71.95, 72.4, t) * .5);
  const ph = (t - BEAT0) / BEAT;
  const bounce = -Math.abs(Math.sin(Math.PI * ph)) * 12 * groove;
  const open = ss(68.6, 69.4, t);
  const pose = {
    hunch, sx, head: headA + bounce * -.003, mound: 1 - ss(0, .08, z),
    bob: bounce,
    lean: -.02 * ss(62, 66, t),
    arms: [[lerp(0, -.22, open), lerp(.15, .35, open)], [lerp(0, .25, open), lerp(.15, .3, open)]],
    legs: [[0, groove * Math.max(0, Math.sin(Math.PI * ph)) * .12], [0, 0]],
  };
  herP(HX, HY, HS, pose, { k: ss(T.harta - .05, T.harta + .06, t) * (1 - ss(.15, .45, z)), sq: sqz, col: ground });
  g.restore();

  // swish marks either side of her head while it shakes (close shot, on the shake drawings)
  if (n >= 0 && n < 9 && n % 3 !== 2) {
    const side = (Math.floor(n / 3) % 2) ? -1 : 1;
    g.save(); g.strokeStyle = C.w4; g.lineCap = 'round'; g.globalAlpha = A0 * .85;
    for (let i = 0; i < 3; i++) {
      g.lineWidth = 14 - i * 3;
      g.beginPath(); g.arc(1150 + side * 12, 470, 440 + i * 50, -.5 + i * .06, .14 - i * .04); g.stroke();
      g.beginPath(); g.arc(1150 + side * 12, 470, 440 + i * 50, Math.PI - .14 + i * .04, Math.PI + .5 - i * .06); g.stroke();
    }
    g.restore();
  }

  // ---- bubbles (a foreground layer: screen space, interpolated from the close to the wide) ----
  const [hcx, hcy] = toScreen(cam, HX + HS * (10 + HK * (520 - 580)), HY + HS * (-790 + HK * (470 - 800)));
  const crowd = .1 * ss(T.harta, T.held, t) + .05 * bump(t, T.de, .35) + .06 * bump(t, T.tu, .35) + .04 * ss(T.tu, T.bronca, t);
  // popped ones first, so their confetti falls BEHIND the survivors (no specks that read as writing)
  const order = BUB.map((b, i) => i).sort((p, q) => (BUB[p].pop === undefined) - (BUB[q].pop === undefined));
  order.forEach((i) => {
    const b = BUB[i];
    const [x0, y0, r0] = b.c;
    if (b.pop !== undefined) {
      const tp = POPT[b.pop];
      let x = lerp(x0, hcx, crowd), y = lerp(y0, hcy, crowd);
      if (t >= tp) { confetti(t, x, y, r0, tp, i + 1); return; }
      const sw = 1 + .14 * ss(tp - .12, tp, t);
      x += jit(t, i * 3, 3); y += jit(t, i * 3 + 1, 3);
      cut(bubblePath(x, y, r0 * sw, r0 * .72 * sw, hcx, hcy), C.cream, { sh: .9, lift: .5, grain: .18 });
      return;
    }
    const [wx, wy, wr] = b.w;
    // talking: each bubble pulses on its own beats
    const talk = .06 * Math.max(0, Math.sin(twos(t) * (5 + hash(i) * 3) + i * 2)) * (1 - ss(61, 64, t));
    // the shake throws the survivors back a little
    let jolt = 0; POPT.forEach((p) => { jolt += bump(t, p, .3); });
    let x = lerp(lerp(x0, hcx, crowd), wx, z), y = lerp(lerp(y0, hcy, crowd), wy, z), r = lerp(r0, wr, z) * (1 + talk);
    const dx = x - hcx, dy = y - hcy, dd = Math.hypot(dx, dy) || 1;
    x += dx / dd * jolt * 22; y += dy / dd * jolt * 22;
    // the brass shoves them left; they tumble and squash where the ring hits
    const px = pushed(t, wx, STEP);
    let kick = 0; HITS.forEach((h, k) => { kick += bump(t, arrive(k, wx, 0), .3); });
    x -= px * z; y += Math.sin(px / 140 + i) * 18 * z - kick * 6;
    if (x < -r * 2) return;
    const tail = [lerp(hcx, x - 300, ss(61.2, 62.6, t)), lerp(hcy, y + 40, ss(61.2, 62.6, t))];
    g.save(); g.translate(x + jit(t, i * 3, 2.5), y + jit(t, i * 3 + 1, 2.5)); g.rotate(px / 260 * (i % 2 ? 1 : -1) + kick * .15); g.scale(1 - kick * .12, 1 + kick * .08);
    cut(bubblePath(0, 0, r, r * .72, tail[0] - x, tail[1] - y), C.cream, { sh: .9, lift: .5, grain: .18 });
    g.restore();
  });

  // the first brass pickup (59.7) sends one ring in from off the right edge, before the band is seen
  g.save();
  for (let r = 0; r < 2; r++) {
    const d = t - 59.70 - r * .2; if (d < 0 || d > 1.3) continue; const k = d / 1.3;
    g.translate(0, 0); g.globalAlpha = A0 * (1 - k) * .9; g.strokeStyle = r ? C.goldPale : C.gold; g.lineWidth = lerp(18, 6, k); g.lineCap = 'round';
    g.beginPath(); g.arc(2080, 470, 60 + k * 620, Math.PI - .45, Math.PI + .45); g.stroke();
  }
  g.restore();
  g.globalAlpha = A0;
}, { xin: .6, tr: 'fade' });
})();

// 162.1-177.64  "In her dream the kids don't look with suspicious eyes / as she goes down the street"
// Her street at dusk, under the street lamp the reunion sun became. Kids sit on the stoops and watch her come
// with narrow slit eyes cut in their big heads. Close-up on "kids": on "don't" and "look" the slits open into
// paper flowers. Back wide: the rest bloom on "suspicious eyes", then they hop down and fall in behind her
// as she goes down the street (a procession that hands off to 11's line of people).
(() => {
const T = { start: 162.1, inn: 163.12, dream: 164.24, the: 167.62, kids: 167.82, dont: 168.22, look: 168.63, with: 169.39,
  susp: 169.81, eyes: 171.87, eyesEnd: 172.9, as: 174.23, goes: 174.67, down: 175.77, street: 176.31, end: 177.64 };
const BEATS = [162.03, 162.79, 163.56, 164.35, 165.14, 165.91, 166.72, 167.53, 168.32, 169.09, 169.85, 170.64, 171.46, 172.22,
  173.01, 173.78, 174.57, 175.36, 176.15, 177.0, 177.77];
const LAMP_X = 1043, LAMP_TOP = 340;
const GROUND = 968, LANE = 942, HOUSE_BASE = 905;
const S_HER = .5;
const STRIDE = (s, hgt) => 2 * 516 * s * hgt * Math.sin(.3);       // body travel per half walk cycle
const V = 196;                                                       // her pace: about a step a beat
const herX = (t) => -260 + V * (t - 163.0);
const camX = (t) => { const e = herX(t) - 820; return e <= 0 ? 0 : e < 200 ? e * e / 400 : e - 100; };

// ---------------- the eye: a narrow cut slit that opens into a paper flower ----------------
// drawn in HEAD units (the kit's 1000-unit head box); EYE = where it sits on HEAD_CHILD
const EYE = { x: 712, y: 486 };
function eyeDraw(open, t, seed, bg, sz = 1) {
  g.save(); g.translate(EYE.x, EYE.y); g.scale(sz, sz); g.translate(-EYE.x, -EYE.y);
  const { x, y } = EYE;
  if (open < .5) {
    // suspicious: a narrow lens cut out of the head, its top edge a lowered straight lid
    const h = lerp(10, 30, clamp(open * 2)), tilt = -4;
    const p = new Path2D(); p.moveTo(x - 58, y + 2); p.lineTo(x + 46, y + tilt - 6);
    p.quadraticCurveTo(x - 2, y + h * 1.4, x - 58, y + 2); p.closePath();
    cut(p, bg, { sh: 0, grain: .12 });
  }
  if (open > .25) {
    const k = back((open - .25) / .75);
    const r = 72 * k;
    g.save(); g.translate(x, y); g.rotate(t * .5 + seed);
    cut(petals5(r), C.cream, { sh: .45, grain: .12 });
    cut(circle(0, 0, r * .26), C.gold, { sh: .25, grain: .1 });
    g.restore();
  }
  g.restore();
}
// five distinct, slender petals (each its own subpath, so they don't join)
function petals5(r) {
  const p = new Path2D();
  for (let i = 0; i < 5; i++) { const a = Math.PI * 2 * i / 5 - Math.PI / 2, x = Math.cos(a) * r * .56, y = Math.sin(a) * r * .56;
    p.moveTo(x + Math.cos(a) * r * .44, y + Math.sin(a) * r * .44); p.ellipse(x, y, r * .44, r * .22, a, 0, Math.PI * 2); }
  return p;
}
// close-up hair (head units, HEAD_CHILD): a soft cap of hair over the skull with a fringe, and a nape tuft
const HAIR_CAP = blob([[236, 660], [240, 430], [320, 280], [470, 200], [630, 206], [750, 268], [786, 352], [780, 398], [744, 386],
  [690, 318], [560, 296], [430, 330], [340, 450], [300, 600], [296, 700]], .5);
const NAPE = blob([[268, 540], [240, 620], [250, 700], [292, 712], [306, 630], [296, 560]], .5);

// ---------------- the kids ----------------
const KIDS = [
  { x: 843,  col: C.rose,  hair: 'pony',    height: .7,  headK: .35,  bloom: T.dont, hop: T.eyesEnd + .05, gap: 760 },
  { x: 1243, col: C.mint,  hair: 'cap',     height: .62, headK: .36, bloom: T.look, hop: T.eyesEnd + .25, gap: 610 },
  { x: 1643, col: C.gold,  hair: 'bob',     height: .74, headK: .34, bloom: T.susp + .1, hop: T.eyesEnd + .4, gap: 460 },
  { x: 2043, col: C.rose,  hair: 'curls',   height: .58, headK: .37, bloom: T.susp + .75, hop: T.eyesEnd + .6, gap: 310 },
  { x: 2443, col: C.mint,  hair: 'pigtail', height: .66, headK: .35, bloom: T.eyes, hop: T.eyesEnd + .8, gap: 160 },
];
const S_KID = .52;
const HOUSE_COL = C.sky3, STOOP_COL = C.plum;
function kidSpec(k, open, t, i) {
  return { col: k.col, kind: 'shirt', head: 'child', hair: k.hair, height: k.height, headK: k.headK,
    headAcc: (pose) => { g.save(); g.rotate(-(pose.head || 0) * .9 - (pose.laugh || 0) * .18); g.scale(k.headK, k.headK); g.translate(-580, -800);
      eyeDraw(open, t, i * 1.3, HOUSE_COL); g.restore(); } };
}
// where each kid is at time t (world), and how
function kidState(k, i, t, h) {
  const seatY = HOUSE_BASE - 92;                       // top step
  // they hop down once she has gone past (or on their cue, whichever is later)
  const hopAt = Math.max(k.hop, 163.0 + (k.x + 170 + 260) / V);
  const hop = clamp((t - hopAt) / .42);
  const sc = S_KID * k.height;
  const seated = { legs: [[1.5, 1.45], [1.42, 1.5]], arms: [[.32, .95], [.26, 1.05]] };
  let x = k.x, y = seatY + 540 * sc, dir = -1, pose;
  const watch = (1 - ss(k.bloom, k.bloom + .5, t));
  if (hop <= 0) {
    // watching her come: chin down, leaning in, head following her a little
    const look = clamp((h - k.x) / 900 + .5, -1, 1);
    pose = { ...seated, head: -.1 * watch + .06 * (1 - watch) + look * .05, lean: .04 * watch };
    if (t > k.bloom) pose.laugh = bump(t, k.bloom + .1, 1.2) * .7;
    dir = h > k.x + 60 ? 1 : -1;
    if (t > k.bloom + .3) dir = 1;
  } else {
    // hop: up off the step, forward and down to the lane
    const u = eio(hop);
    dir = 1;
    y = lerp(seatY + 540 * sc, LANE, u) - Math.sin(u * Math.PI) * 70;
    x = k.x + u * 40;
    const legs = [[lerp(1.5, .1, u), lerp(1.45, .5 * (1 - u), u)], [lerp(1.42, -.1, u), lerp(1.5, .2 * (1 - u), u)]];
    pose = { legs, arms: [[lerp(.32, 1.4, Math.sin(u * Math.PI)), lerp(.95, .3, u)], [lerp(.26, 1.1, Math.sin(u * Math.PI)), lerp(1.05, .3, u)]], head: .05 };
    if (hop >= 1) {
      // then fall in behind her: wait for her to pass, or hurry to catch up
      const vk = 330, t0 = hopAt + .42;
      const want = h - k.gap;
      const nx = Math.max(k.x + 40, Math.min(want, k.x + 40 + vk * (t - t0)));
      const dist = nx - (k.x + 40);
      x = nx; y = LANE;
      const moving = nx > k.x + 41 ? 1 : 0;
      pose = { ...POSE.walk(dist / STRIDE(S_KID, k.height) * Math.PI, moving ? 1 : 0), head: .05 };
      if (!moving) pose.arms = [[.1, .3], [-.05, .2]];
    }
  }
  return { x, y, dir, pose };
}

// ---------------- the street ----------------
const HOUSES = [...Array(10).keys()].map((i) => ({ x: -420 + i * 400, w: 380, h: 470 + (i % 3) * 40, seed: i * 13 + 2 }));
const BACK = [...Array(10).keys()].map((i) => ({ x: -300 + i * 330, w: 300, h: 470 + hash(i * 3.3) * 170, seed: i * 7 + 50, gable: i % 3 === 1 }));
function skyDusk() {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, C.sky0); gr.addColorStop(.55, C.sky1); gr.addColorStop(1, C.sky2);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
}
function stoop(dx, col) {
  // three steps up to the door, and a railing
  for (let s = 0; s < 3; s++) cut(cutRect(dx - 70 + s * 10, HOUSE_BASE - 32 - s * 30, 140 - s * 20, 34, 71 + s + dx, 1.5), col, { sh: .6, grain: .2 });
  g.save(); g.strokeStyle = C.ink; g.lineWidth = 5; g.lineCap = 'round';
  for (const sx of [-78, 78]) { g.beginPath(); g.moveTo(dx + sx, HOUSE_BASE - 10); g.lineTo(dx + sx * .8, HOUSE_BASE - 130); g.stroke(); }
  g.restore();
}
// window-box flowers on the lower sills bloom in a wave down the street on "goes down the street"
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
function street(t, cam, opts = {}) {
  skyDusk();
  // back row, far: dark silhouettes with a few warm windows
  g.save(); g.translate(-cam * .5, 0);
  BACK.forEach((b, i) => {
    const y = HOUSE_BASE - 140, top = y - b.h;
    const body = b.gable ? poly([[b.x, y], [b.x, top], [b.x + b.w / 2, top - b.w * .3], [b.x + b.w, top], [b.x + b.w, y]]) : cutRect(b.x, top, b.w, b.h, b.seed);
    cut(body, C.sky1, { sh: .5, grain: .22 });
    if (!b.gable) cut(cutRect(b.x + b.w * .7, top - 46, 34, 50, b.seed + 3), C.sky1, { sh: .4, grain: .2 });
    // one or two small warm windows, high up
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
  // pavement and kerb
  cut(cutRect(cam - 20, HOUSE_BASE - 6, W + 40, H - HOUSE_BASE + 20, 91, 2), C.sky1, { sh: .7, lift: .2 });
  cut(cutRect(cam - 20, 1010, W + 40, 12, 92, 2), C.sky2, { sh: .3, grain: .1 });
  streetLamp(LAMP_X, HOUSE_BASE + 30, HOUSE_BASE + 30 - LAMP_TOP, 1);
  g.restore();
}
function people(t, cam) {
  const h = herX(t);
  g.save(); g.translate(-cam, 0);
  // kids behind her lane first
  KIDS.forEach((k, i) => {
    const st = kidState(k, i, t, h);
    if (st.x - cam < -200 || st.x - cam > W + 200) return;
    const open = clamp((t - k.bloom) / .5);
    puppet(st.x, st.y, S_KID, st.dir, kidSpec(k, open, t, i), st.pose);
  });
  // her
  if (h - cam > -200) {
    const ph = (h + 260) / STRIDE(S_HER, 1) * Math.PI;
    const glad = ss(T.eyes, T.eyes + .6, t);
    const pose = { ...POSE.walk(ph), head: .05 * glad + .02 * Math.sin(ph * 2) };
    puppet(h, GROUND, S_HER, 1, CAST.her, pose);
  }
  g.restore();
}

// ---- 10a: the street, she walks in under the lamp, the kids watch with slit eyes ----
SHOT(T.start, T.the, 'street-wide', (t) => {
  street(t, camX(t));
  people(t, camX(t));
}, { xin: .7, tr: 'fade' });

// ---- 10b: close on two kids' heads, the slits open into flowers on "don't" and "look" ----
SHOT(T.the, T.susp - .06, 'street-eyes', (t, k, d) => {
  skyDusk();
  // the lamp glow behind them, a halo as in 04
  const drift = d * 14;
  cut(circle(760 - drift, 500, 400), C.goldPale, { sh: .4, grain: .25 });
  cut(circle(760 - drift, 500, 368), C.sun, { sh: .5, grain: .25 });
  const heads = [
    { k: KIDS[1], col: C.teal, hair: [HAIR.cap, NAPE], x: 1500 - drift * 1.4, y: 930, s: .8, at: T.look, seed: 1.3, bg: C.sky1 },
    { k: KIDS[0], col: C.roseDark, hair: [HAIR_CAP, HAIR.pony], x: 820 - drift * 1.8, y: 900, s: 1.0, at: T.dont, seed: 0, bg: C.sun },
  ];
  heads.forEach((hd) => {
    const open = clamp((t - hd.at) / .5);
    const laugh = bump(t, hd.at + .15, 1.1) * .5;
    g.save(); g.translate(hd.x, hd.y); g.scale(-hd.s, hd.s);           // facing left, toward her
    g.rotate(-.04 + laugh * .1 - (1 - ss(hd.at, hd.at + .4, t)) * .03 + jit(t, hd.seed, .002));
    g.translate(-580, -800);
    // shoulders under the neck so the head is not floating
    cut(blob([[330, 980], [470, 900], [700, 900], [860, 980], [900, 1400], [300, 1400]], .5), hd.col, { sh: .9, lift: .6, grain: .25 });
    cut(HEADS.child, hd.col, { sh: 1, lift: .8, grain: .28 });
    hd.hair.forEach((hp) => cut(hp, hd.col, { sh: .55, grain: .24 }));
    eyeDraw(open, t, hd.seed, hd.bg, .5);
    g.restore();
  });
}, { xin: .25, tr: 'fade' });

// ---- 10c: wide again, the rest bloom, they hop down and walk with her ----
SHOT(T.susp - .06, T.end, 'street-walk', (t) => {
  street(t, camX(t));
  people(t, camX(t));
}, { xin: .3, tr: 'fade' });
})();

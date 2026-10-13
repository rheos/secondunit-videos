// 89.96-106.0  "In her dream it's a big greasy spoon she can have what she wants /
// and the doctors are finally waiters". A paper diner, side on: she sits at the end of a long red
// counter; on "big greasy spoon" the diner's sign (a big chrome spoon) drops in on its strings; on
// "have / what / she / wants" plates slide down the counter to her one by one; on "doctors" two
// doctors push through the swing door with coffee pots, pour on "finally" and bow on "waiters".
(() => {
const T = {
  a: 89.96, dream: wordAt('dream', 0, 92), big: wordAt('big', 0, 95), greasy: wordAt('greasy', 0, 95), spoon: wordAt('spoon', 0, 95),
  have: wordAt('have', 0, 98), what: wordAt('what', 0, 98), she: wordAt('she', 0, 99.8), wants: wordAt('wants', 0, 98),
  doctors: wordAt('doctors', 0, 100), are: wordAt('are', 0, 103), finally: wordAt('finally', 0, 103), waiters: wordAt('waiters', 0, 104), b: 106.0,
};
const FLOOR = 1000, TOP = 676;             // floor line, counter top
const END = 470;                           // the counter's left end (she sits just past it)
const S = .68;                             // figure scale
const P = { red: C.red, redDeep: '#a9372f', chrome: C.chrome, chromeDeep: '#a9adb8', white: C.white, ink: C.ink, gold: C.gold, wall: C.mint, wallDeep: '#a9d2c1' };
const plant = (s, h = 1) => 24 * s * h;

// ---------- her, seated: the dress becomes a bodice plus a lap skirt that drapes over the knee ----------
function lapSkirt(a, lace) {
  const sA = clamp(a / 1.55), d = [Math.sin(a), Math.cos(a)], n = [d[1], -d[0]];
  const H = [6, -540], at = (u, v) => [H[0] + u * d[0] + v * n[0], H[1] + u * d[1] + v * n[1]];
  const M = at(140, 50), KT = at(268, 42), KF = at(300, 4);
  const hemY = KF[1] + lerp(95, 165, sA);
  const HF = [KF[0] + lerp(80, 22, sA), hemY], HB = [lerp(-120, KF[0] - 120, sA), hemY];
  const U0 = at(100, -50), U = [lerp(-104, U0[0], sA), lerp(-320, U0[1], sA)];
  const B = [lerp(-80, -58, sA), lerp(-450, -520, sA)];
  const pts = [[44, -630], [lerp(64, 68, sA), lerp(-560, -592, sA)], M, KT, KF];
  const nS = 6; for (let i = 0; i <= nS; i++) { const u = i / nS; pts.push([lerp(HF[0], HB[0], u), hemY + (i % 2 ? 9 : -2)]); }
  pts.push(U, B, [-62, -600], [-50, -640]);
  const p = new Path2D(); p.addPath(blob(pts, .4));
  if (lace) for (let i = 0; i < 5; i++) { const x = lerp(HF[0] - 22, HB[0] + 18, i / 4), y = hemY - 30 + (i % 2) * 5; p.moveTo(x + 7, y); p.arc(x, y, 7, 0, Math.PI * 2); }
  return p;
}
const HER_SIT = { ...CAST.her, lace: false, kind: 'shirt', acc: [() => cut(lapSkirt(1.55, false), C.navy, { sh: .5, grain: .26, lift: .2, rule: 'evenodd' })] };
const SIT = (extra = {}) => ({ sit: true, legs: [[1.55, 1.75], [1.5, 1.8]], ...extra });

// the doctors carry things; their stethoscopes swing
const steth = (sw) => () => {
  g.save(); g.strokeStyle = P.ink; g.lineWidth = 9; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-34, -778); g.bezierCurveTo(-40 + sw * 8, -690, 40 + sw * 10, -680, 36, -772); g.stroke();
  g.beginPath(); g.moveTo(-36 + sw * 4, -716); g.lineTo(-30 + sw * 12, -650); g.stroke();
  g.restore(); cut(circle(-30 + sw * 12, -640, 13), P.chrome, { sh: .4, grain: .1 });
};
const docSpec = (sw) => ({ ...CAST.doctor, acc: [steth(sw)] });
// a chrome coffee pot, held at the handle; tilt in radians (positive pours forward)
let SPOUT = null;
function pot(tilt, arm) {
  return () => {
    g.save(); g.rotate(arm[0] + arm[1] + tilt); g.scale(.78, .78); g.translate(-6, -20);
    SPOUT = new DOMPoint(152, 16).matrixTransform(g.getTransform());
    cut(blob([[-20, 0], [60, -6], [96, 20], [104, 120], [96, 150], [10, 150], [0, 120], [8, 30]], .5), P.chrome, { sh: .5, grain: .15 });
    cut(poly([[96, 40], [150, 10], [154, 22], [104, 64]]), P.chromeDeep, { sh: .3, grain: .1 });   // spout
    cut(rrect(-14, 20, 26, 90, 12), P.ink, { sh: .3, grain: .1 });                              // handle
    g.restore();
  };
}
const towel = (arm) => () => { g.save(); g.rotate(arm[0] + arm[1]); cut(blob([[-50, -20], [50, -24], [56, 60], [40, 110], [-36, 104], [-50, 30]], .3), P.white, { sh: .4, grain: .15 }); g.restore(); };
const pad = (arm) => () => { g.save(); g.rotate(arm[0] + arm[1] - .2); cut(rect(-10, -100, 80, 104), P.white, { sh: .4, grain: .15 }); cut(rect(-10, -100, 80, 18), P.red, { sh: 0, grain: .1 }); g.restore(); };

// ---------- props ----------
function stool(x, top = 790, k = 1) {
  cut(cutRect(x - 9, top, 18, FLOOR - top, 300 + x), P.chromeDeep, { sh: .5 });
  cut(ellipse(x, FLOOR - 4, 52, 10), P.chromeDeep, { sh: .4, grain: .1 });
  cut(rrect(x - 62 * k, top - 26, 124 * k, 32, 14), P.red, { sh: .7, lift: .2 });
  cut(rect(x - 60 * k, top + 4, 120 * k, 6), P.chrome, { sh: .2, grain: .1 });
}
function plate(x, y, food, k = 1.25) {
  g.save(); g.translate(x, y); g.scale(k, k);
  if (food) food(0, -12);
  cut(ellipse(0, -6, 70, 11), P.white, { sh: .6, grain: .15 });
  g.restore();
}
const FOOD = [
  // a slice of cherry pie
  (x, y) => { cut(poly([[x - 50, y], [x + 46, y], [x + 46, y - 44], [x - 50, y - 8]]), C.goldPale, { sh: .4 });
    cut(poly([[x - 50, y - 8], [x + 46, y - 44], [x + 46, y - 54], [x - 54, y - 14]]), C.gold, { sh: .3, grain: .2 });
    cut(circle(x + 12, y - 48, 10), P.red, { sh: .3, grain: .1 }); },
  // two eggs, sunny side up
  (x, y) => { cut(blob([[x - 56, y], [x - 40, y - 16], [x - 8, y - 12], [x - 2, y]], .7), P.white, { sh: .3 });
    cut(blob([[x + 2, y], [x + 10, y - 14], [x + 44, y - 18], [x + 56, y]], .7), P.white, { sh: .3 });
    cut(ellipse(x - 26, y - 12, 13, 9), C.gold, { sh: .2 }); cut(ellipse(x + 28, y - 14, 13, 9), C.gold, { sh: .2 }); },
  // a milkshake in a tall glass, a cherry on top
  (x, y) => { cut(poly([[x - 26, y], [x + 26, y], [x + 38, y - 120], [x - 38, y - 120]]), P.white, { sh: .4, alpha: .95 });
    cut(blob([[x - 40, y - 118], [x - 30, y - 150], [x, y - 162], [x + 30, y - 150], [x + 40, y - 118]], .7), P.white, { sh: .3 });
    cut(rect(x + 8, y - 210, 8, 70), P.red, { sh: .3, grain: .1 }); cut(circle(x - 6, y - 166, 12), P.red, { sh: .3, grain: .1 }); },
  // a burger
  (x, y) => { cut(rrect(x - 44, y - 14, 88, 14, 6), C.gold, { sh: .3 }); cut(rrect(x - 48, y - 30, 96, 18, 8), P.ink, { sh: .3 });
    cut(ribbon(x - 50, x + 50, y - 32, 10, 1.3, 3), C.leaf, { sh: .2, grain: .1 });
    cut(blob([[x - 46, y - 34], [x - 30, y - 74], [x + 30, y - 74], [x + 46, y - 34]], .7), C.gold, { sh: .4 }); },
];
// plates slide down the counter on each word and stop in a queue in front of her
const PLATES = [{ at: T.have, x: 630 }, { at: T.what, x: 790 }, { at: T.she, x: 950 }, { at: T.wants, x: 1100 }];
function plateX(p, t) {
  const k = clamp((t - (p.at - .32)) / .62);
  if (k <= 0) return null;
  const e = eo(k); let x = lerp(W + 140, p.x, e);
  // a little knock-back when it stops
  x += bump(t, p.at + .3, .25) * 10;
  return x;
}
function clock(x, y, r, t) {
  cut(circle(x, y, r + 14), P.red, { sh: .7, lift: .2 });
  cut(circle(x, y, r), P.white, { sh: .3, grain: .2 });
  // on "dream" the hands spin, then settle (time does not matter here)
  const spin = eio(clamp((t - T.dream) / 2.6)) * Math.PI * 2 * 3;
  const hrs = -.9 + spin / 12, mins = 1.2 + spin;
  g.save(); g.translate(x, y);
  g.save(); g.rotate(hrs); cut(rrect(-6, -r * .5, 12, r * .56, 6), P.ink, { sh: .3, grain: .1 }); g.restore();
  g.save(); g.rotate(mins); cut(rrect(-4, -r * .8, 8, r * .86, 4), P.ink, { sh: .3, grain: .1 }); g.restore();
  cut(circle(0, 0, 8), P.red, { sh: .2, grain: .1 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.fillStyle = P.ink; g.fill(circle(Math.cos(a) * r * .84, Math.sin(a) * r * .84, i % 3 ? 3 : 6)); }
  g.restore();
}
// the diner's emblem: a big chrome spoon hung on two strings, dropping in on "big", landing on "spoon"
const SPX = 990;
function spoonSign(t) {
  const k = clamp((t - (T.big - .1)) / .7);
  if (k <= 0) return;
  const drop = lerp(-420, 0, back(k)), swing = Math.sin((t - T.big) * 5.5) * .07 * Math.exp(-(t - T.big) * 1.2);
  g.save(); g.translate(SPX, 20 + drop); g.rotate(swing);
  g.save(); g.strokeStyle = P.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(-230, -400); g.lineTo(-230, 140); g.moveTo(230, -400); g.lineTo(230, 140); g.stroke(); g.restore();
  // the spoon lies across: bowl at the left, handle to the right
  const sp = new Path2D();
  sp.ellipse(-180, 170, 110, 62, 0, 0, Math.PI * 2);
  sp.addPath(blob([[-90, 158], [80, 156], [250, 146], [300, 156], [304, 178], [250, 190], [80, 184], [-90, 182]], .3));
  cut(sp, P.chrome, { sh: 1, lift: .6, grain: .25 });
  cut(ellipse(-186, 164, 82, 40), P.chromeDeep, { sh: 0, grain: .2 });
  g.restore();
  // a glint on "spoon"
  const gl = bump(t, T.spoon - .05, .7);
  if (gl > 0) cut(star4(SPX - 210, 20 + drop + 150, 40 * gl), C.goldPale, { sh: 0, grain: 0 });
}
function lampShade(x, t, i) {
  const sw = Math.sin(t * 1.3 + i * 1.7) * .03;
  g.save(); g.translate(x, -10); g.rotate(sw);
  g.save(); g.strokeStyle = P.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 240); g.stroke(); g.restore();
  g.save(); g.globalAlpha *= .45; const gr = g.createRadialGradient(0, 300, 10, 0, 300, 230); gr.addColorStop(0, 'rgba(247,210,126,.9)'); gr.addColorStop(1, 'rgba(247,210,126,0)');
  g.fillStyle = gr; g.fill(circle(0, 300, 230)); g.restore();
  cut(poly([[-18, 230], [18, 230], [80, 300], [-80, 300]]), P.red, { sh: .6 });
  cut(ellipse(0, 302, 26, 9), C.goldPale, { sh: 0, grain: .1 });
  g.restore();
}
// the swing door at the back right, with a round porthole; open = 0..1 (swings toward us and back)
function swingDoor(x, open) {
  cut(cutRect(x - 14, 330, 228, FLOOR - 330, 501), P.wallDeep, { sh: .5 });             // frame
  cut(rect(x, 344, 200, FLOOR - 344), P.ink, { sh: 0, grain: .2 });                       // the dark kitchen behind
  const w = 200 * Math.max(.08, Math.cos(open * 1.35));
  cut(cutRect(x, 344, w, FLOOR - 344, 502), P.red, { sh: .6, lift: .2 });
  if (w > 60) cut(ellipse(x + w / 2, 460, 36 * w / 200, 36), P.chrome, { sh: .2, grain: .15 });
}

SHOT(T.a, T.b, 'diner', (t) => {
  const A0 = g.globalAlpha;
  // a slow push toward her through the section
  const z = lerp(1, 1.06, eio(clamp((t - T.a) / (T.b - T.a))));
  g.save(); g.translate(420, 700); g.scale(z, z); g.translate(-420, -700);

  sheet(P.wall);
  // a wainscot band of deeper mint, and the checker floor
  cut(cutRect(-40, 770, W + 80, FLOOR - 770, 601), P.wallDeep, { sh: .3 });
  cut(rect(-40, FLOOR, W + 80, H - FLOOR + 80), P.white, { sh: .6 });
  g.save(); g.globalAlpha *= .9; g.fillStyle = P.ink;
  for (let i = 0; i < 26; i++) for (let j = 0; j < 2; j++) if ((i + j) % 2 === 0) g.fill(rect(-40 + i * 80, FLOOR + 4 + j * 56, 80, 56));
  g.restore();

  // back wall: the clock, the pendant lamps, the swing door, the spoon sign
  clock(200, 190, 100, t);
  [560, 1460].forEach((x, i) => lampShade(x, t, i));
  const d1 = bump(t, T.doctors - .25, .9), d2 = bump(t, T.doctors + .35, .9);
  swingDoor(1670, Math.max(d1, d2));
  spoonSign(t);

  // ---------- the doctors, behind the counter ----------
  const docs = [
    { at: T.doctors - .1, x0: 1760, x1: 800, arrive: T.are + .15, hold: 'pot' },
    { at: T.doctors + .5, x0: 1760, x1: 1300, arrive: T.finally - .05, hold: 'pad' },
  ];
  const ds = S * 1.03;
  docs.forEach((dc, i) => {
    if (t < dc.at) return;
    const k = clamp((t - dc.at) / (dc.arrive - dc.at));
    const x = lerp(dc.x0, dc.x1, 1 - (1 - k) * (1 - k));            // walk in, slowing to a stop
    const dist = dc.x0 - x;
    const amp = 1 - ss(.8, 1, k);
    const pose = POSE.walk(-dist / (305 * ds) * Math.PI, amp);
    const sw = Math.sin(t * 7 + i);
    // "waiters": both bow from the waist
    const bowK = bump(t, T.waiters - .1, 1.0);
    pose.lean = (pose.lean || 0) + bowK * .2;
    const ready = ss(.55, 1, k);
    if (dc.hold === 'pot') {
      const pour = bump(t, T.finally - .1, 1.6);
      const near = [lerp(.35, 1.0, ready) - bowK * .3, lerp(.5, .9, ready)], far = [.3, 1.3];
      pose.arms = [near, far];
      pose.holdNear = pot(-.1 + pour * .95, near); pose.holdFar = towel(far);
      dc.pour = pour;
    } else {
      // the prescription pad becomes the guest check: torn off on "waiters" and laid by her
      const torn = t > T.waiters + .1;
      const near = [lerp(.3, .35, ready) - bowK * .3, lerp(.4, 1.85, ready)];
      pose.arms = [near, [.15, .2]];
      if (!torn) pose.holdNear = pad(near);
    }
    SPOUT = null;
    g.save(); g.beginPath(); g.rect(-100, -100, W + 200, TOP + 140); g.clip();     // only ever seen above the counter
    puppet(x, FLOOR + plant(ds), ds, -1, docSpec(sw * (1 - bowK)), pose);
    g.restore();
    // the coffee stream, from the spout into her cup
    if (dc.pour > .5 && SPOUT) {
      const m = g.getTransform().inverse(), sp = SPOUT.matrixTransform(m), cx = 500, cy = TOP - 52;
      g.save(); g.globalAlpha *= clamp((dc.pour - .5) * 5);
      cut(ribbonAlong([[sp.x, sp.y], [lerp(sp.x, cx, .4), lerp(sp.y, cy, .3)], [lerp(sp.x, cx, .8), lerp(sp.y, cy, .75)], [cx, cy]], 11), P.ink, { sh: .2, grain: .1 });
      g.restore();
    }
  });

  // ---------- the counter (in front of the doctors) ----------
  cut(cutRect(END, TOP + 24, W - END + 60, FLOOR - TOP - 24, 611), P.red, { sh: .9, lift: .3 });
  cut(rect(END, TOP + 24, W - END + 60, 12), P.redDeep, { sh: 0, grain: .2 });
  cut(rect(END, FLOOR - 44, W - END + 60, 44), P.chromeDeep, { sh: .3, grain: .1 });            // kick plate
  cut(cutRect(END - 44, TOP, W - END + 104, 26, 612), P.chrome, { sh: .7, lift: .2 });          // the chrome-edged top
  cut(rrect(END - 70, 914, W - END + 140, 12, 6), P.chrome, { sh: .5, grain: .1 });          // foot rail
  for (let x = END + 40; x < W; x += 320) cut(rect(x, 924, 10, 24), P.chromeDeep, { sh: .3, grain: .1 });

  // pie case at the far end of the counter
  const pc = 1500;
  cut(rrect(pc - 100, TOP - 16, 200, 16, 4), P.chromeDeep, { sh: .4 });
  g.save(); g.translate(pc, TOP - 16); g.scale(1.2, 1.2); FOOD[0](-34, 0); FOOD[0](36, 0); g.restore();
  g.save(); g.globalAlpha *= .3; cut(blob([[pc - 110, TOP - 14], [pc - 104, TOP - 130], [pc, TOP - 176], [pc + 104, TOP - 130], [pc + 110, TOP - 14]], .8), P.white, { sh: 0, grain: .1 }); g.restore();
  g.save(); g.strokeStyle = P.white; g.globalAlpha *= .85; g.lineWidth = 4; g.beginPath(); g.ellipse(pc, TOP - 14, 108, 160, 0, Math.PI, Math.PI * 2); g.stroke(); g.restore();

  // her cup, then the plates arriving
  cup(500, TOP, 1.5, P.white);
  PLATES.forEach((p, i) => { const x = plateX(p, t); if (x != null) plate(x, TOP, FOOD[i]); });
  // the guest check: flies from the pad and lands by her cup
  const ck = clamp((t - (T.waiters + .1)) / .55);
  if (ck > 0) {
    const x = lerp(1190, 580, eo(ck)), y = lerp(470, TOP - 4, eo(ck)) - Math.sin(ck * Math.PI) * 100;
    const r = lerp(-.5, -.04, eo(ck)) + (1 - ck) * Math.sin(t * 20) * .25, flat = lerp(1, .16, ss(.7, 1, ck));
    g.save(); g.translate(x, y); g.rotate(r); g.scale(1, flat);
    cut(rect(-40, -100, 80, 104), P.white, { sh: .5, grain: .15 }); cut(rect(-40, -100, 80, 18), P.red, { sh: 0 }); g.restore();
  }

  // ---------- HER on her stool, at the end of the counter ----------
  const HX = 270, seat = 742;
  stool(HX, seat + 22, 1);
  const laughK = Math.min(1, bump(t, T.wants - .05, 1.4) + .8 * bump(t, T.waiters - .05, 1.0));
  const look = ss(T.doctors - .3, T.doctors + .4, t) * .12 * (1 - ss(T.finally + .2, T.finally + .8, t));
  const pose = SIT(laughK > 0 ? POSE.laugh(t, laughK) : {});
  pose.head = (pose.head || 0) + look;
  // forearms rest on the counter; on "doctors" her near hand goes to her chest
  const hand = bump(t, T.doctors, 1.7);
  pose.arms = [[lerp(.88, .5, hand), lerp(.7, 2.3, hand)], [.8, .78]];
  // she leans in a little each time a plate arrives
  pose.lean = (pose.lean || 0) + PLATES.reduce((m, p) => m + bump(t, p.at + .25, .4) * .035, 0);
  puppet(HX, seat + 270 * S - 6, S, 1, HER_SIT, pose);
  laughRings(t, HX + 190, 470, T.wants + .05, { n: 3, dir: -.5, spread: .6, reach: 300, life: 1.6, w0: 9 });

  g.restore();
  g.globalAlpha = A0;
}, { xin: .9, tr: 'slide' });
})();

// 89.96-106.0  "In her dream it's a big greasy spoon she can have what she wants /
// and the doctors are finally waiters". The gold afternoon begins: a paper diner on a warm ground.
// We arrive through 05's lit round window, which is this diner's clock. On "dream" the pendant lamps
// swing on and the big silver spoon (the diner's sign) starts down on its strings, landing on "spoon".
// "have / what / she / wants": she calls each dish with her hand and it slides in and stops on the
// gesture; on "wants" a punch-in on her and the plates, she throws her head back, then sips her shake.
// "doctors": two doctors (one bald with a head mirror, one in a soda-fountain cap) push
// through the swing door; one pours her coffee on "finally", the other tears a guest check off his
// prescription pad and flips it to her; both bow on "waiters".
(() => {
const T = {
  a: 89.96, dream: wordAt('dream', 0, 92), big: wordAt('big', 0, 95), greasy: wordAt('greasy', 0, 95), spoon: wordAt('spoon', 0, 95),
  have: wordAt('have', 0, 98), what: wordAt('what', 0, 98), she: wordAt('she', 0, 99.8), wants: wordAt('wants', 0, 98),
  doctors: wordAt('doctors', 0, 100), are: wordAt('are', 0, 103), finally: wordAt('finally', 0, 103), waiters: wordAt('waiters', 0, 104), b: 106.0,
};
const FLOOR = 1000, TOP = 676;             // floor line, counter top
const END = 470;                           // the counter's left end (she sits just past it)
const S = .68;                             // figure scale
// warm gold ground; accents: navy (her), white (coats, plates, check), red (small), silver (spoon, chrome)
const P = { wall: '#f1c886', wallDeep: '#e3aa60', floor: '#c98a48', counter: '#cf8840', counterDeep: '#a9682f', door: '#b8743a',
  red: C.red, redDeep: '#a9372f', chrome: '#cfd2d8', chromeDeep: '#a4a9b4', white: C.white, cream: C.cream, ink: C.ink, gold: C.gold };
const plant = (s, h = 1) => 24 * s * h;
const CLOCK = { x: 1000, y: 290, r: 80 };  // 05's round window lands exactly here

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

// ---------- the doctors: their own heads (a bald one with a head mirror; one in a soda-fountain cap) ----------
// a man's short-cropped skull from the kit's 'short' face, with a nape instead of long hair
const DOC_HEAD = (() => {
  const a = HEAD_SHORT.slice();
  a.splice(0, 2 + 36,
    360, 1180,
    370, 1040, 392, 930, 400, 860,
    384, 800, 352, 760, 338, 700,
    322, 640, 318, 580, 328, 520,
    340, 440, 372, 360, 422, 300,
    452, 252, 522, 214, 600, 202,
    642, 198, 670, 222, 682, 250);
  return pathOf(a);
})();
const JERK_CAP = blob([[372, 330], [420, 236], [540, 186], [664, 196], [706, 250], [690, 292], [560, 262], [420, 330]], .45);
const JERK_BAND = blob([[392, 326], [690, 278], [696, 300], [400, 350]], .3);
function docHead(kind) {
  return (pose) => {
    g.save(); g.rotate(-(pose.head || 0) * .9 - (pose.laugh || 0) * .18); g.scale(.265, .265); g.translate(-580, -800);
    g.save(); g.beginPath(); g.rect(-200, -200, 1400, 1040); g.clip();
    cut(DOC_HEAD, P.ink, { sh: .5, grain: .25 });
    if (kind === 'bald') {
      // the head mirror on its band
      cut(blob([[420, 352], [740, 300], [744, 330], [424, 382]], .3), P.chromeDeep, { sh: .2, grain: .1 });
      cut(circle(752, 316, 70), P.chrome, { sh: .45, grain: .15 });
      cut(circle(752, 316, 24), P.chromeDeep, { sh: 0, grain: .1 });
    } else {
      cut(JERK_CAP, P.white, { sh: .45, grain: .2 });
      cut(JERK_BAND, P.red, { sh: .1, grain: .1 });
    }
    g.restore(); g.restore();
  };
}
// the stethoscope swings
const steth = (sw) => () => {
  g.save(); g.strokeStyle = P.ink; g.lineWidth = 9; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-34, -778); g.bezierCurveTo(-40 + sw * 8, -690, 40 + sw * 10, -680, 36, -772); g.stroke();
  g.beginPath(); g.moveTo(-36 + sw * 4, -716); g.lineTo(-30 + sw * 12, -650); g.stroke();
  g.restore(); cut(circle(-30 + sw * 12, -640, 13), P.chrome, { sh: .4, grain: .1 });
};
const DOCS = [
  { ...CAST.doctor, height: 1.03, headK: 1e-4, headAcc: docHead('bald') },
  { ...CAST.doctor, height: .97, headK: 1e-4, headAcc: docHead('cap'), kind: 'coat' },
];
const docSpec = (i, sw) => ({ ...DOCS[i], acc: [steth(sw)] });
// a silver coffee pot, held at the handle; tilt in radians (positive pours forward)
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
// a folded towel over the far forearm: a hanging cloth with a fringe of cut slits, not a box
const towel = (arm) => () => { g.save(); g.rotate(arm[0] + arm[1]);
  const p = blob([[-46, -16], [40, -20], [48, 40], [38, 118], [-30, 112], [-44, 40]], .35);
  cut(p, P.white, { sh: .4, grain: .15 });
  cut(rect(-36, 60, 76, 9), P.red, { sh: 0, grain: .1 });
  g.restore(); };
// the prescription pad: white, with a red header
const PAD = { w: 110, h: 140 };
const pad = (arm, sheet = true) => () => { g.save(); g.rotate(arm[0] + arm[1] - .2);
  cut(rect(-10, -PAD.h + 4, PAD.w, PAD.h), P.white, { sh: .4, grain: .15 }); cut(rect(-10, -PAD.h + 4, PAD.w, 22), P.red, { sh: 0, grain: .1 });
  if (!sheet) cut(rect(-10, -PAD.h + 4, PAD.w, 6), P.redDeep, { sh: 0, grain: .1 });
  g.restore(); };

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
  cut(ellipse(0, -6, 70, 11), P.cream, { sh: .6, grain: .15 });
  cut(ellipse(0, -2, 70, 4), P.red, { sh: 0, grain: .1, alpha: .85 });
  g.restore();
}
const FOOD = {
  // a slice of cherry pie: cream crust, red filling showing at the cut face
  pie: (x, y) => { cut(poly([[x - 50, y], [x + 46, y], [x + 46, y - 44], [x - 50, y - 8]]), P.red, { sh: .4 });
    cut(poly([[x - 50, y - 8], [x + 46, y - 44], [x + 46, y - 56], [x - 54, y - 14]]), P.cream, { sh: .3, grain: .2 });
    cut(rect(x - 50, y - 4, 96, 4), P.cream, { sh: 0, grain: .1 }); },
  // two eggs, sunny side up
  eggs: (x, y) => { cut(blob([[x - 56, y], [x - 40, y - 16], [x - 8, y - 12], [x - 2, y]], .7), P.white, { sh: .3 });
    cut(blob([[x + 2, y], [x + 10, y - 14], [x + 44, y - 18], [x + 56, y]], .7), P.white, { sh: .3 });
    cut(ellipse(x - 26, y - 12, 13, 9), C.gold, { sh: .2 }); cut(ellipse(x + 28, y - 14, 13, 9), C.gold, { sh: .2 }); },
  // a burger: toasted buns, a dark patty, a leaf of lettuce
  burger: (x, y) => { cut(rrect(x - 44, y - 14, 88, 14, 6), P.counterDeep, { sh: .3 }); cut(rrect(x - 48, y - 30, 96, 18, 8), P.ink, { sh: .3 });
    cut(ribbon(x - 50, x + 50, y - 32, 10, 1.3, 3), C.leaf, { sh: .2, grain: .1 });
    cut(blob([[x - 46, y - 34], [x - 30, y - 74], [x + 30, y - 74], [x + 46, y - 34]], .7), P.counterDeep, { sh: .4 }); },
};
// a soda-fountain shake in a silver tumbler, cream on top, a cherry; drawn standing on (x, y)
function shake(x, y, k = 1) {
  g.save(); g.translate(x, y); g.scale(k, k);
  cut(rect(6, -196, 7, 70), P.red, { sh: .25, grain: .1 });                                           // straw
  cut(blob([[-34, -110], [-26, -138], [0, -150], [26, -138], [34, -110]], .7), P.cream, { sh: .3 });   // the cream
  cut(circle(-6, -150, 11), P.red, { sh: .3, grain: .1 });
  cut(poly([[-22, 0], [22, 0], [32, -112], [-32, -112]]), P.chrome, { sh: .45, grain: .15 });          // the tumbler
  cut(rect(-26, -90, 4, 70), P.white, { sh: 0, grain: 0, alpha: .7 });                                 // a cut highlight strip
  g.restore();
}
// plates slide down the counter from the right and stop ON her gesture (have / what / she / wants)
const SHAKE_X = 548;                          // stands under her resting near hand
const PLATES = [{ at: T.have, x: SHAKE_X, f: 'shake' }, { at: T.what, x: 770, f: 'pie' }, { at: T.she, x: 910, f: 'eggs' }, { at: T.wants, x: 1050, f: 'burger' }];
function plateX(p, t) {
  const k = clamp((t - (p.at - .5)) / .55);
  if (k <= 0) return null;
  let x = lerp(W + 140, p.x, eo(k));
  x += bump(t, p.at + .05, .22) * 12;        // a little knock-back when it stops
  return x;
}
function clock(x, y, r, t) {
  cut(circle(x, y, r + 14), P.red, { sh: .7, lift: .2 });
  cut(circle(x, y, r), C.goldPale, { sh: .3, grain: .2 });
  // on "dream" the hands spin, then settle (time does not matter here)
  const spin = eio(clamp((t - T.dream) / 2.6)) * Math.PI * 2 * 3;
  const hrs = -.9 + spin / 12, mins = 1.2 + spin;
  g.save(); g.translate(x, y);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.fillStyle = P.ink; g.fill(circle(Math.cos(a) * r * .82, Math.sin(a) * r * .82, i % 3 ? 3 : 6)); }
  g.save(); g.rotate(hrs); cut(rrect(-6, -r * .5, 12, r * .56, 6), P.ink, { sh: .3, grain: .1 }); g.restore();
  g.save(); g.rotate(mins); cut(rrect(-4, -r * .8, 8, r * .86, 4), P.ink, { sh: .3, grain: .1 }); g.restore();
  cut(circle(0, 0, 8), P.red, { sh: .2, grain: .1 });
  g.restore();
}
// the diner's emblem: a big silver spoon hung on two strings. It starts down on "dream", slowly, a theatre
// flat lowered by hand, and lands on "spoon" with a bounce.
const SPX = 470;
const SPOON = (() => { const p = new Path2D(); p.ellipse(-180, 170, 110, 62, 0, 0, Math.PI * 2);
  p.addPath(blob([[-90, 158], [80, 156], [250, 146], [300, 156], [304, 178], [250, 190], [80, 184], [-90, 182]], .3)); return p; })();
function spoonSign(t) {
  const t0 = T.dream + .3, k = clamp((t - t0) / (T.spoon - t0));
  if (k <= 0) return;
  // lowered in short pulls (paper on strings): eased steps, then a bounce on landing
  const steps = 6, u = k * steps, s0 = Math.floor(u), f = u - s0;
  const kk = k >= 1 ? 1 : (s0 + eio(clamp(f * 1.6))) / steps;
  const land = t > T.spoon ? Math.sin((t - T.spoon) * 13) * 18 * Math.exp(-(t - T.spoon) * 4.5) : 0;
  const drop = lerp(-270, 0, kk) + land;
  const swing = Math.sin((t - t0) * 2.6) * .025 * (1 - kk * .6) + Math.sin((t - T.spoon) * 5.5) * .05 * (t > T.spoon ? Math.exp(-(t - T.spoon) * 1.4) : 0);
  g.save(); g.translate(SPX, 20 + drop); g.rotate(swing);
  cut(rect(-232, -460, 4, 600), P.ink, { sh: .2, grain: 0 }); cut(rect(228, -460, 4, 600), P.ink, { sh: .2, grain: 0 });
  cut(SPOON, P.chrome, { sh: 1, lift: .6, grain: .2 });
  cut(ellipse(-186, 166, 84, 42), P.chromeDeep, { sh: .15, grain: .15 });             // the bowl, cut in a darker silver
  cut(blob([[-250, 150], [-222, 128], [-170, 122], [-200, 136]], .5), P.white, { sh: 0, grain: 0, alpha: .9 });   // a cut sliver of shine
  g.restore();
  const gl = bump(t, T.spoon - .05, .7);
  if (gl > 0) cut(star4(SPX - 230, 20 + drop + 140, 44 * gl), C.goldPale, { sh: 0, grain: 0 });
}
// a pendant lamp: off until "dream", then each swings on (a kick, a decaying swing, the glow pops)
function lampShade(x, t, i) {
  const on = t - (T.dream + .15 + i * .3);
  const kick = on > 0 ? Math.sin(on * 4.2) * .16 * Math.exp(-on * 1.1) : 0;
  const sw = Math.sin(t * 1.3 + i * 1.7) * .02 + kick;
  g.save(); g.translate(x, -10); g.rotate(sw);
  g.save(); g.strokeStyle = P.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 240); g.stroke(); g.restore();
  const lit = clamp(on / .15);
  if (lit > 0) { g.save(); g.globalAlpha *= .5 * lit; const gr = g.createRadialGradient(0, 300, 10, 0, 300, 240); gr.addColorStop(0, 'rgba(255,236,170,.95)'); gr.addColorStop(1, 'rgba(255,236,170,0)');
    g.fillStyle = gr; g.fill(circle(0, 300, 240)); g.restore(); }
  cut(poly([[-18, 230], [18, 230], [80, 300], [-80, 300]]), P.red, { sh: .6 });
  cut(ellipse(0, 302, 26, 9), lit > 0 ? C.goldPale : P.counterDeep, { sh: 0, grain: .1 });
  g.restore();
}
// the swing door at the back right, with a round porthole; open = 0..1 (swings toward us and back)
function swingDoor(x, open) {
  cut(cutRect(x - 14, 330, 228, FLOOR - 330, 501), P.wallDeep, { sh: .5 });             // frame
  cut(rect(x, 344, 200, FLOOR - 344), P.ink, { sh: 0, grain: .2 });                       // the dark kitchen behind
  const w = 200 * Math.max(.08, Math.cos(open * 1.35));
  cut(cutRect(x, 344, w, FLOOR - 344, 502), P.door, { sh: .6, lift: .2 });
  if (w > 60) cut(ellipse(x + w / 2, 460, 36 * w / 200, 36), P.chrome, { sh: .2, grain: .15 });
}
// the guest check: cream, a red header, ink lines; front = the check, back = plain pad paper
function guestCheck(front) {
  cut(rect(-55, -75, 110, 150), front ? P.cream : P.white, { sh: .5, grain: .15 });
  if (front) { cut(rect(-55, -75, 110, 24), P.red, { sh: 0, grain: .1 });
    for (let i = 0; i < 5; i++) cut(rect(-40, -38 + i * 20, i === 4 ? 46 : 80, 5), P.ink, { sh: 0, grain: 0, alpha: .75 }); }
}

SHOT(T.a, T.b, 'diner', (t) => {
  const A0 = g.globalAlpha;
  // the punch-in on "wants": close on her and the plates, then back to the room
  const pin = eio(clamp((t - (T.wants - .2)) / .26)) * (1 - eio(clamp((t - 101.4) / .6)));
  if (pin > 0) { const zp = lerp(1, 1.62, pin); g.translate(W / 2, H / 2); g.scale(zp, zp); g.translate(-lerp(W / 2, 600, pin), -lerp(H / 2, 560, pin)); }
  // a slow push toward her through the section
  const z = lerp(1, 1.06, eio(clamp((t - T.a) / (T.b - T.a))));
  g.save(); g.translate(420, 700); g.scale(z, z); g.translate(-420, -700);

  sheet(P.wall);
  cut(cutRect(-200, 770, W + 400, FLOOR - 770, 601), P.wallDeep, { sh: .3 });   // wainscot
  cut(rect(-200, FLOOR, W + 400, H - FLOOR + 200), P.floor, { sh: .6 });
  // one strip of checker along the foot of the wall: the diner's tile, as an accent
  g.save(); g.fillStyle = P.ink; g.globalAlpha *= .85;
  for (let i = -6; i < 60; i++) if (i % 2 === 0) g.fill(rect(i * 34, FLOOR + 2, 34, 22));
  g.fillStyle = P.cream; for (let i = -6; i < 60; i++) if (i % 2) g.fill(rect(i * 34, FLOOR + 2, 34, 22));
  g.restore();

  // back wall: the clock, the pendant lamps, the swing door, the spoon sign
  clock(CLOCK.x, CLOCK.y, CLOCK.r, t);
  [1270, 1560].forEach((x, i) => lampShade(x, t, i));
  const d1 = bump(t, T.doctors - .25, .9), d2 = bump(t, T.doctors + .35, .9);
  swingDoor(1670, Math.max(d1, d2));
  spoonSign(t);

  // ---------- the doctors, behind the counter ----------
  const docs = [
    { at: T.doctors - .1, x0: 1760, x1: 900, arrive: T.are + .15, hold: 'pot' },
    { at: T.doctors + .5, x0: 1760, x1: 1270, arrive: T.finally - .05, hold: 'pad' },
  ];
  const ds = S * 1.03;
  const TEAR = T.finally + .45, LAND = TEAR + .7;
  docs.forEach((dc, i) => {
    if (t < dc.at) return;
    const k = clamp((t - dc.at) / (dc.arrive - dc.at));
    const x = lerp(dc.x0, dc.x1, 1 - (1 - k) * (1 - k));            // walk in, slowing to a stop
    const dist = dc.x0 - x;
    const amp = 1 - ss(.8, 1, k);
    const pose = POSE.walk(-dist / (305 * ds) * Math.PI, amp);
    const sw = Math.sin(t * 7 + i);
    // "waiters": both bow from the waist, heads down, a beat apart
    const bowK = Math.sin(clamp((t - (T.waiters - .15 + i * .12)) / 1.0) * Math.PI);
    pose.lean = (pose.lean || 0) + bowK * .34;
    pose.head = (pose.head || 0) - bowK * .22;
    const ready = ss(.55, 1, k);
    if (dc.hold === 'pot') {
      const pour = bump(t, T.finally - .1, 1.6);
      const near = [lerp(.35, 1.25, ready) + pour * .3 - bowK * .5, lerp(.5, .7, ready)], far = [.3 + bowK * .5, 1.3];
      pose.arms = [near, far];
      pose.holdNear = pot(-.1 + pour * 1.05, near); pose.holdFar = towel(far);
      dc.pour = pour;
    } else {
      // the pad is held up while he writes; on TEAR the top sheet comes away and flips to her
      const torn = t > TEAR;
      const lift = bump(t, TEAR - .35, .7);
      const near = [lerp(.3, .55, ready) + lift * .5 - bowK * .3, lerp(.4, 1.6, ready) - lift * .3];
      pose.arms = [near, [.15 + ready * .5, .2 + ready * 1.2]];
      pose.holdNear = pad(near, !torn);
    }
    SPOUT = null;
    g.save(); g.beginPath(); g.rect(-400, -400, W + 800, TOP + 440); g.clip();     // only ever seen above the counter
    puppet(x, FLOOR + plant(ds * DOCS[i].height), ds, -1, docSpec(i, sw * (1 - bowK)), pose);
    g.restore();
    // the coffee stream, from the spout into her cup
    if (dc.pour > .5 && SPOUT) {
      const m = g.getTransform().inverse(), sp = SPOUT.matrixTransform(m), cx = CUP_X, cy = TOP - 54;
      g.save(); g.globalAlpha *= clamp((dc.pour - .5) * 5);
      cut(ribbonAlong([[sp.x, sp.y], [lerp(sp.x, cx, .35), lerp(sp.y, cy, .2)], [lerp(sp.x, cx, .75), lerp(sp.y, cy, .65)], [cx, cy]], 11), P.ink, { sh: .2, grain: .1 });
      g.restore();
    }
  });

  // ---------- the counter (in front of the doctors) ----------
  cut(cutRect(END, TOP + 24, W - END + 260, FLOOR - TOP - 24, 611), P.counter, { sh: .9, lift: .3 });
  cut(rect(END, TOP + 24, W - END + 260, 14), P.red, { sh: 0, grain: .15 });                   // the red band
  cut(rect(END, FLOOR - 44, W - END + 260, 44), P.counterDeep, { sh: .3, grain: .1 });         // kick plate
  cut(cutRect(END - 44, TOP, W - END + 304, 26, 612), P.chrome, { sh: .7, lift: .2 });          // the silver-edged top
  cut(rrect(END - 70, 914, W - END + 340, 12, 6), P.chrome, { sh: .5, grain: .1 });          // foot rail
  for (let x = END + 40; x < W + 200; x += 320) cut(rect(x, 924, 10, 24), P.chromeDeep, { sh: .3, grain: .1 });

  // pie case at the far end of the counter
  const pc = 1500;
  cut(rrect(pc - 100, TOP - 16, 200, 16, 4), P.chromeDeep, { sh: .4 });
  g.save(); g.translate(pc, TOP - 16); g.scale(1.2, 1.2); FOOD.pie(-34, 0); FOOD.pie(36, 0); g.restore();
  g.save(); g.globalAlpha *= .3; cut(blob([[pc - 110, TOP - 14], [pc - 104, TOP - 130], [pc, TOP - 176], [pc + 104, TOP - 130], [pc + 110, TOP - 14]], .8), P.white, { sh: 0, grain: .1 }); g.restore();
  g.save(); g.strokeStyle = P.white; g.globalAlpha *= .85; g.lineWidth = 4; g.beginPath(); g.ellipse(pc, TOP - 14, 108, 160, 0, Math.PI, Math.PI * 2); g.stroke(); g.restore();

  // the guest check: torn off the pad, flips over (pad side, then the check) as it arcs to her, lands flat
  const ck = clamp((t - TEAR) / (LAND - TEAR));
  if (ck > 0) {
    const x = lerp(1180, 500, eo(ck)), y = lerp(440, TOP - 6, eo(ck)) - Math.sin(ck * Math.PI) * 300;
    const flip = Math.cos(eio(ck) * Math.PI * 3);                 // one and a half turns
    const flat = ck >= 1 ? .14 : lerp(1, .14, ss(.75, 1, ck));
    g.save(); g.translate(x, y); g.rotate(lerp(-.4, 0, eo(ck))); g.scale(Math.abs(flip) < .06 ? .06 : flip, flat);
    guestCheck(ck >= 1 || flip < 0);
    g.restore();
  }

  // her cup, then the dishes arriving (the shake first, right to her hand)
  cup(CUP_X, TOP, 1.5, P.white);
  const sipping = t > SIP.grab && t < SIP.down;
  PLATES.forEach((p) => { const x = plateX(p, t); if (x == null) return;
    if (p.f === 'shake') { if (!sipping) shake(x, TOP, .9); } else plate(x, TOP, FOOD[p.f]); });
  // ---------- HER on her stool, at the end of the counter ----------
  const HX = 270, seat = 742;
  stool(HX, seat + 22, 1);
  // her joy on "wants" is bigger now (head back, a bounce), and she laughs again on "waiters"
  const joy = bump(t, T.wants - .08, 1.2);
  const laughK = Math.min(1, joy * 1.25 + .8 * bump(t, T.waiters - .05, 1.0));
  const look = ss(T.doctors - .3, T.doctors + .4, t) * .12 * (1 - ss(T.finally + .2, T.finally + .8, t));
  const pose = SIT(laughK > 0 ? POSE.laugh(t, laughK) : {});
  pose.head = (pose.head || 0) + look;
  // forearms rest on the counter. She calls each dish with her near hand: it lifts on "have" and flicks
  // on "what", "she", "wants"; then she lifts the shake to sip it.
  const call = ss(T.have - .25, T.have + .05, t) * (1 - ss(T.wants + .1, T.wants + .4, t));
  const flick = [T.have, T.what, T.she, T.wants].reduce((m, w) => m + bump(t, w - .08, .2), 0);
  let near = [lerp(.88, 1.05, call) + flick * .06, lerp(.7, 1.35, call) - flick * .45];
  const sip = ss(SIP.grab, SIP.up, t) * (1 - ss(SIP.hold, SIP.down, t));
  if (sip > 0) near = [lerp(near[0], .22, sip), lerp(near[1], 2.6, sip)];
  pose.arms = [near, [.8, .78]];
  if (sipping) pose.holdNear = () => { g.save(); g.rotate(near[0] + near[1]); g.translate(-6, 172); shake(0, 0, .9 / S); g.restore(); };
  pose.head += sip * .12;                                        // head dips to the straw
  // she leans in a little each time a dish arrives
  pose.lean = (pose.lean || 0) + PLATES.reduce((m, p) => m + bump(t, p.at, .4) * .035, 0) + sip * .04;
  puppet(HX, seat + 270 * S - 6, S, 1, HER_SIT, pose);
  laughRings(t, HX + 150, 440, T.wants + .02, { n: 4, dir: -.55, spread: .7, reach: 360, life: 1.5, w0: 12 });

  g.restore();
  g.globalAlpha = A0;
}, { xin: .55, tr: 'iris', ix: CLOCK.x, iy: CLOCK.y });
const CUP_X = 640;
const SIP = { grab: T.wants + .55, up: T.wants + .85, hold: 101.3, down: 101.62 };
})();

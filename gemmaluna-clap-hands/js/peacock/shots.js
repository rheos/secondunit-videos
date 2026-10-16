// Look test: verse 1 + chorus 1 (26.04 to 56.88) in cut paper, peacock palette.
// Cues from STORYBOARD.md c01/c02 (word times are Whisper, ~0.3 s slop; claps are exact).

// ---- the tram car: clerestory of stained glass, brass rail, swinging straps, lily lamps ----
function tramCar(t, wild, swayK = 1) {
  sheet(C.plumDeep);
  // clerestory band
  cut(cutRect(-40, 280, W + 80, 470, 3), C.plum, { sh: .6 });
  for (let i = 0; i < 3; i++) {
    const x = 120 + i * 300, y = 330, w = 240, h = 380;
    // panes: teal and gold glass pieces with dark lead gaps between them
    cut(archPath(x, y, w, h), C.tealInk, { sh: 0 });
    for (let j = 0; j < 9; j++) {
      const r = hash(i * 31 + j), col = [C.tealLight, C.teal, C.goldPale, C.tealDeep][(j + i) % 4];
      const px = x + (j % 3) * w / 3 + 6, py = y + w / 2 + Math.floor(j / 3) * (h - w / 2) / 3 + 6;
      cut(rrect(px, py, w / 3 - 12, (h - w / 2) / 3 - 12, 6), col, { sh: .2, grain: .3, alpha: .9 });
    }
    cut(flowerPath(x + w / 2, y + w / 2 - 10, 70, 5, i), C.goldPale, { sh: .3 });
    cut(circle(x + w / 2, y + w / 2 - 10, 18), C.plum, { sh: .2 });
    archFrame(x, y, w, h, 18, C.gold);
    rain(t, 10, i * 9, .45, .5, x, x + w * .6);
  }
  // brass rail
  cut(cutRect(-40, 800, W + 80, 22, 5), C.gold, { sh: .8, lift: .3 });
  // lily lamps hanging from the ceiling, swaying
  for (const [lx, ph] of [[270, 0], [810, 1.3]]) {
    const a = Math.sin(t * 2.3 + ph) * .07 * swayK + wild * Math.sin(t * 13 + ph) * .35;
    g.save(); g.translate(lx, 240); g.rotate(a);
    cut(rect(-3, 0, 6, 260), C.goldDeep, { sh: .4 });
    glow(0, 300, 260, '240,200,120', .35);
    lily(0, 250, Math.PI / 2, 110, .8, [C.goldPale, C.cream]);
    g.restore();
  }
  // straps: plum leather loops hanging from the rail, all swinging with the car
  for (let i = 0; i < 6; i++) {
    const x = 120 + i * 168, a = Math.sin(t * 2.3 + i * .25) * .1 * swayK + wild * Math.sin(t * 11 - i * .4) * .55;
    g.save(); g.translate(x, 812); g.rotate(a);
    cut(cutRect(-11, 0, 22, 210, 40 + i), C.plumLight, { sh: .6 });
    cut(ringLace(0, 250, 30, 46), C.plumLight, { sh: .7, lift: .2, rule: 'evenodd' });
    g.restore();
  }
  // the bench along the far wall
  cut(cutRect(-40, 1240, W + 80, 260, 8), C.teal, { sh: .9, lift: .3 });
  for (let i = 0; i < 6; i++) cut(rrect(40 + i * 170, 1270, 150, 200, 20), C.tealLight, { sh: .4, grain: .3 });
  cut(cutRect(-40, 1480, W + 80, 70, 9), C.plum, { sh: 1, lift: .4 });
  cut(cutRect(-40, 1550, W + 80, 500, 10), C.tealInk, { sh: .4 });
  // floor boards
  for (let i = 0; i < 9; i++) cut(rect(-40, 1600 + i * 40, W + 80, 4), C.tealDeep, { sh: 0, grain: 0, alpha: .7 });
}

// 26.04 "sane, sane" / 28.44 "all insane" (the straps go wild) / 29.44 "five months blind" (spectacles on the seat)
// opens zoomed into its right lily lamp: the intro's Metro lamp bud became it
SHOT(26.04, 31.94, 'tram', (t, k, d) => {
  const wild = bump(t, 28.4, 1.2);
  const u = eio(clamp((t - 26.04) / 1.3)), zEnd = lerp(1.0, 1.12, eio(k));
  g.save(); cam(lerp(810, 540, u), lerp(490, lerp(980, 1100, eio(k)), u), Math.exp(lerp(Math.log(6), Math.log(zEnd), u)), (Math.sin(t * 2.3) * .012 + wild * Math.sin(t * 13) * .025) * u);
  tramCar(t, wild);
  // spectacles left on the seat
  const p = pop(t, 29.5, .45);
  if (p > 0) {
    g.save(); g.translate(560, 1500); g.scale(p, p); g.rotate(-.08);
    for (const sx of [-1, 1]) { cut(ringLace(sx * 70, -40, 50, 64), C.goldDeep, { sh: 1, lift: .3, rule: 'evenodd' }); cut(circle(sx * 70, -40, 50), C.tealInk, { sh: 0, alpha: .92 }); cut(ellipse(sx * 70 - 16, -58, 12, 7, -.5), C.cream, { sh: 0, grain: 0, alpha: .5 }); }
    cut(blob([[-14, -54], [0, -66], [14, -54], [8, -48], [-8, -48]], .7), C.goldDeep, { sh: .4 });
    for (const sx of [-1, 1]) cut(ribbonAlong([[sx * 130, -50], [sx * 165, -30], [sx * 185, 0]], 14), C.goldDeep, { sh: .5 });
    g.restore();
  }
  g.restore();
  sheet(C.goldPale, .75 * (1 - ss(26.04, 26.6, t)));
});

// 31.94-36.44 the conductor, built from his tools (Mark Von Ulrich, guest director: the person built from
// their tools, U03). His cap drops onto the hook as a head, the lantern swings in where his heart would be, the
// cane slides up as his bad leg; on the jacket line (33.76) the jacket drops in as his body. A man who isn't there,
// standing in his booth, swaying with the car.
function conductorJacket() { // the jacket, hung at (0,0): plum, cream lapels, gold buttons (about 1010 tall)
  const coat = blob([[0, 40], [-140, 80], [-230, 160], [-250, 520], [-210, 1000], [-30, 1010], [0, 960], [30, 1010], [210, 1000], [250, 520], [230, 160], [140, 80]], .35);
  cut(coat, C.plum, { sh: 1.1, lift: .6 });
  for (const sx of [-1, 1]) {
    cut(poly([[0, 60], [sx * 110, 90], [sx * 90, 420], [sx * 20, 600]]), C.cream, { sh: .6, lift: .2 });
    cut(blob([[sx * 230, 170], [sx * 290, 430], [sx * 270, 860], [sx * 210, 900], [sx * 200, 500]], .45), C.plumLight, { sh: .7, lift: .3 });
    cut(poly([[sx * 60, 640], [sx * 190, 640], [sx * 190, 670], [sx * 60, 670]]), C.plumDeep, { sh: .3 });
  }
  for (let i = 0; i < 3; i++) { cut(circle(-28, 660 + i * 110, 15), C.gold, { sh: .5 }); cut(circle(28, 660 + i * 110, 15), C.gold, { sh: .5 }); }
}
SHOT(31.94, 36.44, 'conductor', (t, k, d) => {
  const z = kf3(t, [[31.94, 1.05], [33.6, 1.18], [36.44, 1.34]]);
  g.save(); cam(540, kf3(t, [[31.94, 980], [33.6, 920], [36.44, 900]]), z, Math.sin(t * 2.3) * .01);
  sheet(C.tealDeep);
  for (let r = 0; r < 9; r++) for (let c = 0; c < 5; c++) { const x = 60 + c * 240 + (r % 2) * 120, y = 160 + r * 220; cut(flowerPath(x, y, 46, 5, r), C.teal, { sh: .2, grain: .2, alpha: .9 }); }
  cut(cutRect(160, 360, 760, 1380, 21), C.plum, { sh: 1, lift: .4 });
  cut(archPath(220, 420, 640, 1180), C.tealInk, { sh: 0 });
  glow(540, 820, 560, '240,200,120', .2);
  archFrame(220, 420, 640, 1180, 28, C.gold);
  for (const sx of [-1, 1]) tendril(whipPts([540 + sx * 300, 1580], [540 + sx * 340, 1260], [540 + sx * 140, 1000], [540 + sx * 200, 760], 46, -sx), 16, C.goldDeep);
  cut(cutRect(340, 500, 400, 18, 22), C.goldDeep, { sh: .6 });
  cut(rect(536, 500, 8, 50), C.gold, { sh: .3 });
  // the whole figure hangs from the hook and sways with the car
  const sway = Math.sin(t * 2.3) * .035 + Math.sin(t * 5.1) * .01;
  g.save(); g.translate(540, 540); g.rotate(sway); g.translate(-540, -540);
  // the cane slides up into place as his leg (one leg: he is lame)
  const caneIn = back(clamp((t - 32.55) / .6));
  if (caneIn > 0) { g.save(); g.translate(520, 1150 + (1 - caneIn) * 500); g.rotate(.06); cut(cutRect(-9, 0, 18, 440, 9), C.goldDeep, { sh: .8, lift: .2 }); cut(ringLace(-30, 0, 20, 36), C.goldDeep, { sh: .7, rule: 'evenodd' }); g.restore(); }
  // the jacket drops onto the hanger as his body
  const jk = back(clamp((t - 33.62) / .55));
  if (jk > 0) { g.save(); g.translate(540, 640 - (1 - jk) * 700); g.scale(.52, .52); cut(ribbonAlong(whipPts([0, -120], [0, -60], [-16, -20], [0, 0], 0), 22), C.gold, { sh: .4 }); conductorJacket(); g.restore(); }
  // the cap drops onto the hook as his head
  const cp = back(clamp((t - 31.98) / .45));
  g.save(); g.translate(540, 540 - (1 - cp) * 500);
  cut(blob([[-90, 90], [-70, 40], [0, 26], [70, 40], [90, 90]], .6), C.plum, { sh: .8, lift: .2 });
  cut(cutRect(-90, 80, 180, 26, 3), C.gold, { sh: .4 });
  cut(blob([[-20, 104], [90, 100], [130, 116], [40, 124]], .6), C.tealInk, { sh: .5 });
  g.restore();
  // the lantern swings in where his heart would be; it beats
  const ln = eo(clamp((t - 32.2) / .6)), lx = lerp(900, 505, ln), ly = 820, beat = .5 + .5 * Math.max(0, Math.sin(t * Math.PI * 2 / 1.0));
  g.save(); g.translate(lx, ly); g.rotate(Math.sin(t * 3.1) * .08 * ln + (1 - ln) * .6); g.scale(.62, .62);
  glow(0, 120, 340, '245,205,120', .35 + .3 * beat);
  cut(blob([[-50, 40], [50, 40], [40, 170], [-40, 170]], .2), C.goldPale, { sh: .8, lift: .3 });
  cut(cutRect(-60, 28, 120, 20, 5), C.goldDeep, { sh: .5 }); cut(cutRect(-50, 166, 100, 18, 6), C.goldDeep, { sh: .5 });
  for (let i = -1; i <= 1; i++) cut(rect(i * 22 - 3, 48, 6, 118), C.goldDeep, { sh: 0, grain: 0 });
  cut(ellipse(0, 110, 14 + 4 * beat, 26 + 6 * beat), C.white, { sh: 0, grain: 0 });
  cut(ringLace(0, 14, 10, 18), C.goldDeep, { sh: .3, rule: 'evenodd' });
  g.restore();
  g.restore();
  rain(t, 12, 5, .25);
  g.restore();
}, { xin: .35, tr: 'slide' });

// 36.44 "hard luck day": the horseshoe over the door hangs upside down; it slips and spins away
SHOT(36.44, 37.7, 'horseshoe', (t, k, d) => {
  g.save(); cam(540, kf3(t, [[36.44, 900], [37.1, 900], [37.7, 1037]]), kf3(t, [[36.44, 1.05], [37.1, 1.05], [37.7, 1.156]]));
  sheet(C.plumDeep);
  cut(cutRect(200, 520, 680, 1500, 41), C.plum, { sh: 1, lift: .3 });
  cut(archPath(270, 700, 540, 1300), C.tealDeep, { sh: 0 });
  archFrame(270, 700, 540, 1300, 30, C.gold);
  for (let i = 0; i < 2; i++) cut(archPath(320 + i * 230, 1000, 210, 520), C.tealLight, { sh: .2, alpha: .85 });
  rain(t, 14, 8, .4, .4, 320, 780);
  // the slip: it rocks on its nail, then falls off spinning
  const sl = clamp((t - 36.85) / .75);
  const rock = Math.sin(t * 16) * .12 * (1 - sl) * clamp((t - 36.5) * 3);
  g.save(); g.translate(540, 560 + ei(sl) * 1300); g.rotate(Math.PI + rock + sl * sl * 7);
  const shoe = new Path2D(); shoe.arc(0, 0, 110, Math.PI * .92, Math.PI * .08, false); shoe.arc(0, 0, 66, Math.PI * .08, Math.PI * .92, true); shoe.closePath();
  cut(shoe, C.gold, { sh: 1.1, lift: .5 });
  for (let i = 0; i < 6; i++) { const a = Math.PI + .5 + i * .43; cut(circle(Math.cos(a) * -88, Math.sin(a) * -88, 7), C.plumDeep, { sh: 0, grain: 0 }); }
  g.restore();
  cut(circle(540, 470, 9), C.goldDeep, { sh: .4 });
  g.restore();
}, { xin: .25, tr: 'fade' });

// ---- CHORUS 1: the clap catches on. 1 pair, then 3, then 6, then everyone (Robin, look test v1 notes).
// Each pair visits for its clap only: up just before "clap", open on "hands", gone a second later.

// The tenement: three by three arched windows; the bottle window is the centre one.
// Inside a window everything is drawn in a local 600 x 825 frame (scale .4 in the world).
const WIN = { xs: [90, 420, 750], ys: [640, 1040, 1440], k: .4, w: 600, h: 825 };
const PEOPLE = [ // sleeve, cuff: one paper pair per person
  [C.plumLight, C.gold], [C.tealDeep, C.goldPale], [C.goldDeep, C.cream], [C.plum, C.gold], [C.teal, C.gold], [C.plumDeep, C.goldPale],
];
function inWin(c, r, fn) { g.save(); g.translate(WIN.xs[c], WIN.ys[r]); g.scale(WIN.k, WIN.k); fn(); g.restore(); }
const opening = () => archPath(0, 0, WIN.w, WIN.h);
// lit 0..1; inside() draws in the opening (clipped), front() over the frame and sill
function tenWindow(c, r, lit, inside, front) {
  inWin(c, r, () => {
    cut(opening(), C.tealInk, { sh: 0 });
    if (lit > 0) { g.save(); g.globalAlpha *= lit; cut(opening(), C.goldPale, { sh: 0, grain: .3 }); g.restore(); glow(300, 520, 560, '250,215,140', .4 * lit); }
    g.save(); g.clip(opening());
    for (const sx of [0, 1]) cut(blob(sx ? [[610, 60], [610, 840], [540, 840], [500, 520], [560, 300]] : [[-10, 60], [-10, 840], [60, 840], [100, 520], [40, 300]], .5), lit > .5 ? C.tealLight : C.tealDeep, { sh: .5 });
    if (inside) inside();
    g.restore();
    archFrame(0, 0, WIN.w, WIN.h, 30, C.gold);
    cut(poly([[-70, WIN.h], [WIN.w + 70, WIN.h], [WIN.w + 90, WIN.h + 54], [-90, WIN.h + 54]]), C.cream, { sh: 1, lift: .3 });
    if (front) front();
  });
}
// the Galle bottle, its base at (0,0): teal glass, a gold lily, filling with rain
function galleBottle(fill) {
  const b = blob([[-80, 0], [-100, -100], [-90, -200], [-34, -260], [-28, -380], [28, -380], [34, -260], [90, -200], [100, -100], [80, 0]], .55);
  cut(b, C.tealLight, { sh: 1, lift: .5, alpha: .94 });
  g.save(); g.clip(b); cut(rect(-110, lerp(10, -300, fill), 220, 420), C.teal, { sh: 0, grain: .3 }); g.restore();
  cut(flowerPath(0, -120, 50, 5, .3), C.goldPale, { sh: .3, alpha: .9 });
  cut(cutRect(-36, -402, 72, 26, 4), C.gold, { sh: .5 });
}
// a window lights with a flare when its people clap
const flare = (t, k) => t < k ? 0 : Math.exp(-3 * (t - k)) * .5;

// 37.7 to 49.4, one place: the bottle window, then the street joins in.
// 37.7 "hanging out the window with a bottle full of rain"; 40.4 the bottle is set on the sill;
// clap 1 (41.6) the same person's hands come up and clap; pull back; clap 2 (46.0) both neighbours too;
// the rest of the building lights up window by window.
SHOT(37.7, 49.4, 'tenement', (t, k, d) => {
  const k1 = CLAPS[0], k2 = CLAPS[1];
  g.save();
  const z = kf3(t, [[37.7, 2.6], [41.0, 2.75], [42.7, 2.75], [45.3, 1.0], [48.0, 1.02], [49.4, 1.25]]);
  const cy = kf3(t, [[37.7, 1190], [42.7, 1190], [45.3, 1010], [48.0, 1000], [49.4, 380]]);
  cam(540, cy, z);
  sheet(C.tealInk);
  // the moon-halo over the roofs; its lilies open on clap 1
  halo(540, 380, 200, t * .05, 1, [C.goldDeep, C.creamDeep, C.teal, C.gold]);
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t * .04; lily(540 + Math.cos(a) * 240, 380 + Math.sin(a) * 240, a, 64, back(clamp((t - k1 - i * .04) / .7)), [C.cream, C.goldPale]); }
  // the building
  cut(cutRect(-60, 560, W + 120, 1400, 51), C.plum, { sh: 1, lift: .4 });
  cut(cutRect(-60, 540, W + 120, 40, 52), C.gold, { sh: .8, lift: .3 });
  for (const sx of [-1, 1]) tendril(whipPts([540 + sx * 40, 545], [540 + sx * 200, 470], [540 + sx * 360, 600], [540 + sx * 470, 500], 40, -sx), 14, C.gold);
  for (const y of [1010, 1410, 1810]) cut(cutRect(-60, y, W + 120, 12, y), C.goldDeep, { sh: .4 });
  cut(cutRect(-60, 1840, W + 120, 200, 53), C.tealDeep, { sh: .6 });
  // windows: the centre is lit throughout; its neighbours light on clap 2; the rest wake after
  const order = [[0, 0], [2, 2], [1, 0], [0, 2], [2, 0], [1, 2]];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    let lit;
    if (c === 1 && r === 1) lit = 1 + flare(t, k1);
    else if (r === 1) lit = ss(k2 - .02, k2 + .04, t) + flare(t, k2);
    else { const j = order.findIndex(([a, b]) => a === c && b === r); lit = ss(46.7 + j * .4, 46.76 + j * .4, t); }
    lit = Math.min(1.25, lit);
    const centre = c === 1 && r === 1;
    // the bottle: held up 37.7 to 40.4, set down on the sill by 40.9, the arm gone inside by 41.2
    const set = ss(40.2, 40.7, t), gone = ss(40.7, 41.0, t);
    const bx = lerp(430, 500, set), by = lerp(WIN.h - 230, WIN.h, set), fill = ss(37.9, 40.2, t), lean = Math.sin(t * 2.2) * .03 * (1 - set);
    tenWindow(c, r, lit, () => {
      if (centre && gone < 1) {
        // the arm: sleeve from behind the left jamb to the elbow on the sill, up to a gold cuff, the palm behind the bottle
        g.save(); g.translate(-gone * 120, gone * 520);
        const ex = 220, ey = WIN.h - 50, wx = bx - 112, wy = by - 92, a = Math.atan2(wy - ey, wx - ex);
        cut(capsule(-120, WIN.h - 170, ex, ey, 66, 60), PEOPLE[0][0], { sh: .9, lift: .4 });
        cut(capsule(ex, ey, wx - Math.cos(a) * 40, wy - Math.sin(a) * 40, 60, 50), PEOPLE[0][0], { sh: .9, lift: .4 });
        cut(capsule(wx - Math.cos(a) * 52, wy - Math.sin(a) * 52, wx - Math.cos(a) * 14, wy - Math.sin(a) * 14, 56), PEOPLE[0][1], { sh: .6, lift: .3 });
        cut(ellipse(wx + 22, wy - 20, 52, 66, a + Math.PI / 2), C.cream, { sh: .7, lift: .3 });
        g.restore();
      }
      if (centre) visitClap(t, 230, 560, 170, k1, { dy: 700, sleeveLen: 4, sleeveCol: PEOPLE[0][0], cuffCol: PEOPLE[0][1] });
      if (r === 1 && !centre) visitClap(t, 300, 560, 170, k2, { dy: 700, sleeveLen: 4, sleeveCol: PEOPLE[c ? 1 : 2][0], cuffCol: PEOPLE[c ? 1 : 2][1] });
      if (centre) visitClap(t, 230, 560, 170, k2, { dy: 700, sleeveLen: 4, sleeveCol: PEOPLE[0][0], cuffCol: PEOPLE[0][1] });
    }, centre ? () => {
      g.save(); g.translate(bx, by); g.rotate(lean); galleBottle(fill);
      // the hand round the bottle: four fingers across the front, until it lets go
      g.restore();
      if (gone < 1) { g.save(); g.clip(opening()); g.translate(bx - gone * 120, by + gone * 520); g.rotate(lean);
        for (let i = 0; i < 4; i++) cut(rrect(-98, -150 + i * 30, 120 - i * 6, 26, 13), C.cream, { sh: .6, lift: .2 }); g.restore(); }
    } : null);
  }
  for (let i = 0; i < 2; i++) clapRings(t, 540, 1150, [k1, k2][i], .6);
  g.restore();
  rain(t, lerp(80, 40, ss(42.7, 45.3, t)), 2, .45, .1);
}, { xin: .3, tr: 'fade', smooth: true }); // the door's arch becomes the window's arch

// clap 3 (50.033): a ring of six pairs grows out from under the halo, clapping as one; then peacock
// feathers open in the gaps and the ring turns on without them
SHOT(49.4, 53.5, 'ring', (t, k, d) => {
  const kk = CLAPS[2], rot = -Math.PI / 2 + t * .05;
  g.save(); cam(540, 960, lerp(1.0, 1.08, eio(k)));
  sheet(C.plumDeep);
  rays(540, 960, 200, 1400, 36, -t * .02, C.plum);
  const fan = back(clamp((t - kk - .2) / 1.0));
  if (fan > 0) for (let i = 0; i < 6; i++) feather(540, 960, rot + (i + .5) / 6 * TAU, lerp(240, 600, fan), fan);
  for (let i = 0; i < 6; i++) {
    const a = rot + i / 6 * TAU, [sl, cf] = PEOPLE[i];
    g.save(); g.translate(540 + Math.cos(a) * 330, 960 + Math.sin(a) * 330); g.rotate(a + Math.PI / 2);
    visitClap(t, 0, 0, 115, kk, { dy: 360, sleeveLen: 2.6, sleeveCol: sl, cuffCol: cf, pre: .75 });
    g.restore();
  }
  halo(540, 960, 250, t * .06, 1);
  clapRings(t, 540, 960, kk);
  g.restore();
}, { xin: .35, tr: 'fade', smooth: true }); // the moon-halo becomes the ring's halo

// clap 4 (54.133): everyone. A crowd of raised arms rises from the bottom, three rows deep, and claps
// once; the great halo bursts open, the brightest image of the chorus; they sink and we push in
// Mark Von Ulrich (guest director): the neighbours become ONE creature. The arms fan out of a single patchwork
// body (one patch per person's paper) and the great halo is its head.
const BODY = { x: 540, y: 1580 };
const CROWD = (() => { const out = []; let n = 0;
  for (const [a0, a1] of [[-158, -104], [-76, -22]]) for (const [r, sc, m] of [[300, 92, 4], [470, 112, 4]]) for (let i = 0; i < m; i++) {
    const a = (a0 + (a1 - a0) * (i + .5) / m) * Math.PI / 180;
    out.push({ a, r, sc, p: PEOPLE[n % PEOPLE.length], j: r > 400 ? (hash(n) - .5) * .04 : 0, pre: .55 + hash(n * 7) * .35 }); n++;
  }
  return out; })();
function crowdBody(t) {
  const torso = blob([[BODY.x - 360, 2100], [BODY.x - 380, BODY.y + 160], [BODY.x - 250, BODY.y - 20], [BODY.x, BODY.y - 70], [BODY.x + 250, BODY.y - 20], [BODY.x + 380, BODY.y + 160], [BODY.x + 360, 2100]], .5);
  cut(torso, C.plum, { sh: 1.1, lift: .6 });
  g.save(); g.clip(torso);
  PEOPLE.forEach(([col], i) => cut(poly([[BODY.x - 420 + i * 140, BODY.y - 120], [BODY.x - 280 + i * 140, BODY.y - 120], [BODY.x - 300 + i * 140, 2200], [BODY.x - 440 + i * 140, 2200]]), col, { sh: .4, grain: .3 }));
  g.restore();
  cut(scallop(BODY.x, BODY.y - 40, 130, 14, .1), C.gold, { sh: .7, lift: .3 });
  cut(circle(BODY.x, BODY.y - 40, 92), C.plum, { sh: .3 });
}
SHOT(53.5, 56.88, 'everyone', (t, k, d) => {
  const kk = CLAPS[3], burst = back(clamp((t - kk) / .9));
  g.save(); cam(540, kf3(t, [[53.5, 760], [54.05, 900]]), kf3(t, [[53.5, .818], [54.05, 1.0], [55.2, 1.0], [56.88, 1.16]]));
  sheet(C.teal);
  glow(540, 760, 1100, '250,215,140', .55 * ss(kk - .05, kk + .3, t) * (1 - .4 * ss(kk + .5, kk + 2.5, t)));
  rays(540, 760, 420, 1500, 36, t * .04, C.tealLight);
  cut(poly([[BODY.x - 80, BODY.y + 40], [BODY.x - 70, 760], [BODY.x + 70, 760], [BODY.x + 80, BODY.y + 40]]), C.plum, { sh: .8, lift: .3 }); // the creature's neck
  halo(540, 760, lerp(330, 600, burst), t * .05, 1); // ...and the halo is its head
  for (const sx of [-1, 1]) for (let j = 0; j < 2; j++) {
    const v = whipPts([540 + sx * 600, 1300 + j * 160], [540 + sx * 300, 1440 - j * 80], [540 + sx * 60, 1120], [540 + sx * 220, 980 - j * 60], 50 - j * 14, -sx);
    tendril(grow(v, ss(kk, kk + 1.6 + j * .4, t)), 26 - j * 8, j ? C.goldPale : C.gold);
  }
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU - t * .05; lily(540 + Math.cos(a) * 640, 760 + Math.sin(a) * 640, a, 110, back(clamp((t - kk - i * .05) / .7)), [C.cream, C.goldPale]); }
  // the arms fan out of the one body, each pair rising along its own arm, then sinking back into it
  for (const h of CROWD) {
    g.save(); g.translate(BODY.x + Math.cos(h.a) * h.r, BODY.y + Math.sin(h.a) * h.r); g.rotate(h.a + Math.PI / 2);
    visitClap(t, 0, 0, h.sc, kk + h.j, { dy: h.r * .9, pre: h.pre, post: 1.5, sleeveLen: h.r / h.sc + .4, sleeveCol: h.p[0], cuffCol: h.p[1] });
    g.restore();
  }
  crowdBody(t);
  clapRings(t, 540, 760, kk, 1.3);
  g.restore();
}, { xin: .3, tr: 'fade', smooth: true }); // the ring's halo becomes the crowd's

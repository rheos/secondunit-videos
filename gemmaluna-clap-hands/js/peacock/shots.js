// Look test: verse 1 + chorus 1 (26.04 to 56.88) in cut paper, peacock palette.
// Cues from STORYBOARD.md c01/c02 (word times are Whisper, ~0.3 s slop; claps are exact).
const CLAPS = [41.6, 46.0, 50.033, 54.133];
const cam = (cx, cy, z = 1, rot = 0) => { g.translate(W / 2, H / 2); g.rotate(rot); g.scale(z, z); g.translate(-cx, -cy); };

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
SHOT(26.04, 31.94, 'tram', (t, k, d) => {
  const wild = bump(t, 28.4, 1.2);
  g.save(); cam(540, lerp(980, 1100, eio(k)), lerp(1.0, 1.12, eio(k)), Math.sin(t * 2.3) * .012 + wild * Math.sin(t * 13) * .025);
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
});

// 31.94 "the conductor is lame": his empty booth, cap on a hook, a cane, a lantern swinging
SHOT(31.94, 33.76, 'booth', (t, k, d) => {
  g.save(); cam(540, 960, lerp(1.05, 1.0, eo(k)), Math.sin(t * 2.3) * .01);
  sheet(C.tealDeep);
  cut(cutRect(160, 420, 760, 1300, 21), C.plum, { sh: 1, lift: .4 });
  cut(archPath(220, 480, 640, 900), C.tealInk, { sh: 0 });
  glow(540, 760, 520, '240,200,120', .18);
  archFrame(220, 480, 640, 900, 28, C.gold);
  // whiplash ironwork in the arch
  for (const sx of [-1, 1]) tendril(whipPts([540 + sx * 300, 1380], [540 + sx * 340, 1100], [540 + sx * 120, 900], [540 + sx * 180, 720], 46, -sx), 16, C.goldDeep);
  // hook rail
  cut(cutRect(300, 640, 480, 18, 22), C.goldDeep, { sh: .6 });
  // the cap on its hook
  g.save(); g.translate(400, 660); g.rotate(Math.sin(t * 2.3) * .04);
  cut(rect(-4, 0, 8, 40), C.gold, { sh: .3 });
  cut(blob([[-90, 90], [-70, 40], [0, 26], [70, 40], [90, 90]], .6), C.plum, { sh: .8, lift: .2 });
  cut(cutRect(-90, 80, 180, 26, 3), C.gold, { sh: .4 });
  cut(blob([[-20, 104], [90, 100], [130, 116], [40, 124]], .6), C.tealInk, { sh: .5 });
  g.restore();
  // the lantern swinging from the right hook
  const la = Math.sin(t * 3.1) * .32;
  g.save(); g.translate(680, 660); g.rotate(la);
  cut(rect(-3, 0, 6, 120), C.goldDeep, { sh: .3 });
  glow(0, 200, 300, '245,205,120', .55);
  cut(blob([[-50, 140], [50, 140], [40, 270], [-40, 270]], .2), C.goldPale, { sh: .8, lift: .3 });
  cut(cutRect(-60, 128, 120, 20, 5), C.goldDeep, { sh: .5 }); cut(cutRect(-50, 266, 100, 18, 6), C.goldDeep, { sh: .5 });
  for (let i = -1; i <= 1; i++) cut(rect(i * 22 - 3, 148, 6, 118), C.goldDeep, { sh: 0, grain: 0 });
  cut(ellipse(0, 210, 14, 26), C.white, { sh: 0, grain: 0 });
  g.restore();
  // the cane leaning in the corner
  g.save(); g.translate(330, 1380); g.rotate(-.22);
  cut(cutRect(-9, -560, 18, 560, 9), C.goldDeep, { sh: .8, lift: .2 });
  cut(ringLace(-34, -560, 22, 40), C.goldDeep, { sh: .7, rule: 'evenodd' });
  g.restore();
  rain(t, 12, 5, .25);
  g.restore();
}, { xin: .35, tr: 'slide' });

// 33.76 "Cincinnati jacket": a jacket on a hook, swinging with the car
SHOT(33.76, 36.44, 'jacket', (t, k, d) => {
  g.save(); cam(540, 980, lerp(1.0, 1.08, eio(k)), Math.sin(t * 2.3) * .01);
  sheet(C.teal);
  // wallpaper: rows of gold lilies on teal
  for (let r = 0; r < 9; r++) for (let c = 0; c < 5; c++) { const x = 60 + c * 240 + (r % 2) * 120, y = 160 + r * 220; cut(flowerPath(x, y, 46, 5, r), C.tealLight, { sh: .2, grain: .2, alpha: .9 }); }
  cut(cutRect(260, 560, 560, 22, 31), C.goldDeep, { sh: .7, lift: .2 });
  const a = Math.sin(t * 2.3 + .5) * .08 + Math.sin(t * 5.1) * .02;
  g.save(); g.translate(540, 590); g.rotate(a);
  cut(ribbonAlong(whipPts([0, -10], [0, 20], [-16, 40], [0, 54], 0), 14), C.gold, { sh: .4 });
  // the jacket: plum, cream lapels, gold buttons
  const coat = blob([[0, 40], [-140, 80], [-230, 160], [-250, 520], [-210, 1000], [-30, 1010], [0, 960], [30, 1010], [210, 1000], [250, 520], [230, 160], [140, 80]], .35);
  cut(coat, C.plum, { sh: 1.1, lift: .6 });
  for (const sx of [-1, 1]) {
    cut(poly([[0, 60], [sx * 110, 90], [sx * 90, 420], [sx * 20, 600]]), C.cream, { sh: .6, lift: .2 });
    cut(blob([[sx * 230, 170], [sx * 290, 430], [sx * 270, 860], [sx * 210, 900], [sx * 200, 500]], .45), C.plumLight, { sh: .7, lift: .3 });
    cut(poly([[sx * 60, 640], [sx * 190, 640], [sx * 190, 670], [sx * 60, 670]]), C.plumDeep, { sh: .3 });
  }
  for (let i = 0; i < 3; i++) { cut(circle(-28, 660 + i * 110, 15), C.gold, { sh: .5 }); cut(circle(28, 660 + i * 110, 15), C.gold, { sh: .5 }); }
  g.restore();
  g.restore();
}, { xin: .35, tr: 'slide' });

// 36.44 "hard luck day": the horseshoe over the door hangs upside down; it slips and spins away
SHOT(36.44, 37.7, 'horseshoe', (t, k, d) => {
  g.save(); cam(540, 900, 1.05);
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

// 37.7 "hanging out the window with a bottle full of rain": the arched window, a cream arm, a Galle bottle filling
SHOT(37.7, 41.0, 'window', (t, k, d) => {
  g.save(); cam(540, lerp(980, 1040, eio(k)), lerp(1.0, 1.18, eio(k)));
  sheet(C.tealInk);
  halo(540, 520, 330, t * .05, ss(37.0, 38.0, t), [C.goldDeep, C.creamDeep, C.teal, C.gold]);
  cut(cutRect(-60, 900, W + 120, 1200, 51), C.plum, { sh: 1, lift: .4 });
  const wx = 240, wy = 1000, ww = 600, wh = 760;
  cut(archPath(wx, wy, ww, wh), C.goldPale, { sh: 0 });
  glow(540, wy + wh * .55, 520, '250,215,140', .35);
  archFrame(wx, wy, ww, wh, 26, C.gold);
  // ironwork tendrils grow up the frame through the line
  const gu = ss(37.7, 40.6, t);
  for (const sx of [-1, 1]) {
    const x0 = 540 + sx * 340;
    const v = whipPts([x0, wy + wh + 80], [x0 + sx * 90, wy + wh * .55], [x0 - sx * 40, wy + wh * .2], [x0 + sx * 60, wy - 40], 54, -sx);
    tendril(grow(v, gu), 22, C.goldDeep);
    for (let i = 0; i < 3; i++) if (gu > .3 + i * .2) lily(x0 + sx * 34, wy + wh - 120 - i * 210, -Math.PI / 2 + sx * .9, 70, eo((gu - .3 - i * .2) * 4), [C.cream, C.goldPale]);
  }
  // the sill
  cut(poly([[wx - 70, wy + wh], [wx + ww + 70, wy + wh], [wx + ww + 90, wy + wh + 54], [wx - 90, wy + wh + 54]]), C.cream, { sh: 1, lift: .3 });
  // the bottle (Galle: teal glass, gold lily on it) filling with rain, held up by an arm from below the sill
  const lean = Math.sin(t * 2.2) * .03, fill = ss(37.9, 41.0, t), sy = wy + wh;
  g.save(); g.translate(540, sy + 40); g.rotate(lean);
  tendril([[-60, 120], [-50, 0], [-30, -120], [0, -230]], 150, C.plumLight, { sh: .9, lift: .4 });
  tendril([[-6, -210], [0, -300], [6, -380], [10, -450]], 92, C.cream, { sh: .8, lift: .4 });
  g.translate(10, -600);
  const bottle = blob([[-80, 230], [-100, 130], [-90, 30], [-34, -30], [-28, -150], [28, -150], [34, -30], [90, 30], [100, 130], [80, 230]], .55);
  cut(bottle, C.tealLight, { sh: 1, lift: .5, alpha: .92 });
  g.save(); g.clip(bottle); cut(rect(-110, lerp(240, -60, fill), 220, 400), C.teal, { sh: 0, grain: .3 }); g.restore();
  cut(flowerPath(0, 120, 50, 5, .3), C.goldPale, { sh: .3, alpha: .9 });
  cut(cutRect(-36, -172, 72, 26, 4), C.gold, { sh: .5 });
  // the hand cupping the bottle from below: fingers curled up its side
  cut(blob([[-70, 250], [-96, 190], [-60, 170], [60, 170], [96, 190], [70, 250], [0, 270]], .6), C.cream, { sh: .8, lift: .4 });
  for (let i = 0; i < 3; i++) cut(rrect(-92 + i * 6, 120 + i * 24, 34, 20, 10), C.cream, { sh: .5 });
  g.restore();
  // rain falls into the open mouth
  rain(t, 70, 2, .5, .1);
  g.restore();
}, { xin: .45, tr: 'rise' });

// CHORUS 1 · clap 1 (41.6): slender hands meet in front of the halo; lilies open round the ring on the clap
SHOT(41.0, 45.4, 'clap1', (t, k, d) => {
  const kk = CLAPS[0];
  g.save(); cam(540, 900, lerp(1.1, 1.0, eo(d / 1.4)));
  sheet(C.tealDeep);
  rays(540, 820, 360, 1200, 24, t * .03, C.teal);
  halo(540, 820, 470, t * .06, 1);
  const ok = back(clamp((t - kk) / .7));
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + t * .04, R = 520; lily(540 + Math.cos(a) * R, 820 + Math.sin(a) * R, a, 100, i % 2 ? ok : back(clamp((t - kk - .53) / .7)), i % 2 ? [C.cream, C.goldPale] : [C.goldPale, C.cream]); }
  for (const sx of [-1, 1]) tendril(whipPts([540 + sx * 120, 1950], [540 + sx * 520, 1600], [540 + sx * 160, 1360], [540 + sx * 380, 1230], 60, -sx), 30, C.plum);
  clapRings(t, 540, 760, kk);
  clapPair(t, 540, 1000, 280, kk);
  rain(t, 40, 11, .3);
  g.restore();
}, { xin: .6, tr: 'iris', ix: 540, iy: 1000, smooth: true });

// clap 2 (46.0): two Guimard lily-bud lamps over the wet street light on the clap, the hands between them
SHOT(45.4, 49.4, 'clap2', (t, k, d) => {
  const kk = CLAPS[1], on = clamp((t - kk + .04) / .12);
  g.save(); cam(540, 980, lerp(.98, 1.08, k));
  sheet(C.tealInk);
  halo(540, 520, 250, t * .05, 1, [C.goldDeep, C.creamDeep, C.tealDeep, C.gold]);
  // the street and its reflections
  cut(cutRect(-60, 1500, W + 120, 600, 61), C.tealDeep, { sh: .6 });
  for (let i = 0; i < 6; i++) cut(ribbon(-40, W + 40, 1560 + i * 60, 10, i * 1.3 + t * .8, 8), on > 0 ? C.goldDeep : C.teal, { sh: 0, grain: .2, alpha: .45 + .3 * on });
  for (const [x, dir] of [[150, 1], [930, -1]]) guimard(x, 1520, 980, dir, on * (.9 + .1 * Math.sin(t * 17 + x)), Math.sin(t * 1.4) * 8);
  clapRings(t, 540, 1000, kk, .8);
  clapPair(t, 540, 1200, 220, kk);
  rain(t, 80, 21, .45);
  g.restore();
}, { xin: .4, tr: 'slideL', smooth: true });

// clap 3 (50.033): the peacock: a fan of feathers opens behind the hands on the clap
SHOT(49.4, 53.5, 'clap3', (t, k, d) => {
  const kk = CLAPS[2], fan = back(clamp((t - kk) / .9));
  g.save(); cam(540, 960, lerp(1.0, 1.06, k));
  sheet(C.plumDeep);
  rays(540, 1180, 200, 1300, 30, -t * .02, C.plum);
  const n = 11;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i - (n - 1) / 2) * lerp(.03, .24, fan) + Math.sin(t * 1.8 + i) * .01;
    feather(540, 1220, a, lerp(380, 820, fan) * (1 - Math.abs(i - 6) * .025), fan);
  }
  cut(scallop(540, 1220, 150, 18, .08, t * .2), C.gold, { sh: 1, lift: .4 });
  cut(circle(540, 1220, 110), C.teal, { sh: .5 });
  clapRings(t, 540, 940, kk);
  clapPair(t, 540, 1160, 260, kk);
  g.restore();
}, { xin: .5, tr: 'iris', ix: 540, iy: 1160, smooth: true });

// clap 4 (54.133): the great halo unfolds ring by ring on the clap; the hands drift open; push in
SHOT(53.5, 56.88, 'clap4', (t, k, d) => {
  const kk = CLAPS[3];
  g.save(); cam(540, 900, lerp(1.0, 1.16, eio(k)));
  sheet(C.teal);
  rays(540, 860, 420, 1400, 36, t * .04, C.tealLight);
  halo(540, 860, lerp(380, 640, back(clamp((t - kk) / .9))), t * .05, 1);
  for (const sx of [-1, 1]) for (let j = 0; j < 2; j++) {
    const v = whipPts([540 + sx * 600, 1500 + j * 160], [540 + sx * 300, 1640 - j * 80], [540 + sx * 60, 1320], [540 + sx * 220, 1180 - j * 60], 50 - j * 14, -sx);
    tendril(grow(v, ss(kk, kk + 1.6 + j * .4, t)), 26 - j * 8, j ? C.goldPale : C.gold);
  }
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU - t * .05; lily(540 + Math.cos(a) * 700, 860 + Math.sin(a) * 700, a, 120, back(clamp((t - kk - i * .05) / .7)), [C.cream, C.goldPale]); }
  clapRings(t, 540, 820, kk, 1.2);
  clapPair(t, 540, 1080, 300, kk, { drift: ss(55.6, 56.8, t) * .9 });
  g.restore();
}, { xin: .45, tr: 'fade', smooth: true });

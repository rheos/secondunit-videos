// Look test: verse 1 + chorus 1 (26.04 to 56.88) in cut paper, peacock palette.
// Cues from STORYBOARD.md c01/c02 (word times are Whisper, ~0.3 s slop; claps are exact).

// TRAM_BUD: the right pier lamp's bud of light (its calyx hand's palm centre, 724 - .5 * 58), where the Metro's push lands
const TRAM_LAMPS = [[390, 0], [690, 1.3]], TRAM_HAND = 58, TRAM_BUD = { x: 690, y: 724 - .5 * TRAM_HAND };
// the Metro bud (calyx hand sc 150) at zoom 9 is the tram bud (sc 58) at this zoom: the light-to-light hand-off
const TRAM_Z0 = 9 * (typeof CALYX_LAMP_SC === 'number' ? CALYX_LAMP_SC : 150) / TRAM_HAND;
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
    g.save(); g.clip(archPath(x, y, w, h)); rain(t, 10, i * 9, .45, .5, x, x + w * .6); g.restore(); // rain stays in the glass
  }
  // brass rail
  cut(cutRect(-40, 800, W + 80, 22, 5), C.gold, { sh: .8, lift: .3 });
  // lamps on the piers between the windows: the same iron calyx lamps as the Metro's (the lamp-to-lamp match)
  for (const [lx, ph] of TRAM_LAMPS) {
    const a = Math.sin(t * 2.3 + ph) * .03 * swayK + wild * Math.sin(t * 13 + ph) * .2;
    g.save(); g.translate(lx, 800); g.rotate(a); g.translate(-lx, -800);
    tendril(whipPts([lx, 800], [lx - 10, 780], [lx + 10, 750], [lx, 724], 0), 12, C.tealDeep, { sh: .5 });
    glow(lx, 650, 260, '240,200,120', .25);
    // draft 4: the Metro's iron calyx hand holding its bud of light (the old cupped hand and lily read as a lotus in a pot)
    if (typeof calyxHand === 'function') calyxHand(lx, 724, TRAM_HAND, .7, { skin: 'iron', palm: 'bud', thumb: lx < 540 ? -1 : 1 });
    else { nouveauHand(lx, 724, 58, .55, { fill: C.tealDeep, edge: C.gold }); metroBud(lx, 724 - 58 * .2, 36, 1); }
    g.restore();
  }
  // straps: plum leather loops hanging from the rail, all swinging with the car
  for (let i = 0; i < 6; i++) {
    const x = 120 + i * 168, a = Math.sin(t * 2.3 + i * .25) * .1 * swayK + wild * Math.sin(t * 11 - i * .4) * 1.0 + (i === 3 ? TAU * eio(clamp((t - 28.55) / .75)) : 0); // a real whip on "insane"; one strap loops over the rail
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
  // opens inside its right lamp's bud (the Metro bud's size), pulls back; punches in on the spectacles on
  // "blind"; ends pushing into the same lamp, which becomes the conductor's lantern
  const u = eio(clamp((t - 26.04) / 1.3)), up = eio(clamp((t - 26.25) / 1.1)), zEnd = lerp(1.0, 1.12, eio(k)); // the lamp stays centred while the zoom starts
  let cx = lerp(TRAM_BUD.x, 540, up), cy = lerp(TRAM_BUD.y, lerp(980, 1100, eio(k)), up), z = Math.exp(lerp(Math.log(TRAM_Z0), Math.log(zEnd), u));
  const sp = eio(clamp((t - 29.45) / .5)) * (1 - eio(clamp((t - 30.7) / .6)));
  cx = lerp(cx, 720, sp); cy = lerp(cy, 1380, sp); z = lerp(z, 1.7, sp);
  const out = ei(clamp((t - 31.45) / .49));
  cx = lerp(cx, TRAM_BUD.x, out); cy = lerp(cy, TRAM_BUD.y, out); z = Math.exp(lerp(Math.log(z), Math.log(260 / (.62 * TRAM_HAND)), out));
  g.save(); cam(cx, cy, z, (Math.sin(t * 2.3) * .012 + wild * Math.sin(t * 13) * .025) * u * (1 - out));
  tramCar(t, wild);
  // spectacles left on the seat, on the right third
  const p = pop(t, 29.5, .45);
  if (p > 0) {
    g.save(); g.translate(760, 1500); g.scale(p, p); g.rotate(-.08);
    for (const sx of [-1, 1]) {
      cut(ringLace(sx * 70, -40, 50, 64), C.goldDeep, { sh: 1, lift: .3, rule: 'evenodd' });
      cut(circle(sx * 70, -40, 50), C.tealInk, { sh: 0, alpha: .92 });
      cut(ellipse(sx * 70 - 16, -58, 12, 7, -.5), C.cream, { sh: 0, grain: 0, alpha: .5 });
    }
    cut(blob([[-14, -54], [0, -66], [14, -54], [8, -48], [-8, -48]], .7), C.goldDeep, { sh: .4 });
    for (const sx of [-1, 1]) cut(ribbonAlong([[sx * 130, -50], [sx * 165, -30], [sx * 185, 0]], 14), C.goldDeep, { sh: .5 });
    g.restore();
  }
  g.restore();
  sheet(C.goldPale, .4 * (1 - ss(26.04, 26.21, t)) + .35 * ss(31.8, 31.94, t));
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
  const z0 = kf3(t, [[31.94, 1.05], [33.6, 1.18], [36.44, 1.34]]), into = eio(clamp((t - 31.94) / .75));
  const z = Math.exp(lerp(Math.log(4.5), Math.log(z0), into));
  g.save(); cam(lerp(505, 540, into), lerp(885, kf3(t, [[31.94, 980], [33.6, 920], [36.44, 900]]), into), z, Math.sin(t * 2.3) * .01 * into); // opens on the lantern
  sheet(C.tealDeep);
  for (let r = 0; r < 9; r++) for (let c = 0; c < 5; c++) { const x = 60 + c * 240 + (r % 2) * 120, y = 160 + r * 220; cut(flowerPath(x, y, 46, 5, r), C.teal, { sh: .2, grain: .2, alpha: .9 }); }
  cut(cutRect(160, 360, 760, 1380, 21), C.plum, { sh: 1, lift: .4 });
  cut(archPath(220, 420, 640, 1180), C.tealInk, { sh: 0 });
  glow(540, 820, 560, '240,200,120', .2);
  archFrame(220, 420, 640, 1180, 28, C.gold);
  // the booth's tendrils grow up as the camera pulls off the lantern (draft 3: their curls read as a stray scroll by it)
  for (const sx of [-1, 1]) tendril(grow(whipPts([540 + sx * 300, 1580], [540 + sx * 340, 1260], [540 + sx * 140, 1000], [540 + sx * 200, 760], 46, -sx), ss(32.0, 32.9, t)), 16, C.goldDeep);
  cut(cutRect(340, 500, 400, 18, 22), C.goldDeep, { sh: .6 });
  cut(rect(536, 500, 8, 50), C.gold, { sh: .3 });
  // the whole figure hangs from the hook and sways with the car
  const sway = Math.sin(t * 2.3) * .035 + Math.sin(t * 5.1) * .01;
  g.save(); g.translate(540, 540); g.rotate(sway); g.translate(-540, -540);
  // the cane slides up into place as his leg (one leg: he is lame)
  const caneIn = back(clamp((t - 32.8) / .6));
  if (caneIn > 0) { g.save(); g.translate(520, 1150 + (1 - caneIn) * 500); g.rotate(.06); cut(cutRect(-9, 0, 18, 440, 9), C.goldDeep, { sh: .8, lift: .2 }); cut(ringLace(-30, 0, 20, 36), C.goldDeep, { sh: .7, rule: 'evenodd' }); g.restore(); }
  // the jacket drops onto the hanger as his body
  const jk = back(clamp((t - 33.62) / .55));
  if (jk > 0) { g.save(); g.translate(540, 640 - (1 - jk) * 700); g.scale(.52, .52); cut(ribbonAlong(whipPts([0, -120], [0, -60], [-16, -20], [0, 0], 0), 22), C.gold, { sh: .4 }); conductorJacket(); g.restore(); }
  // the cap drops onto the hook as his head
  const cp = back(clamp((t - 32.3) / .45)), tip = bump(t, 35.45, .8); // he tips his cap before "hard luck"
  g.save(); g.translate(540, 540 - (1 - cp) * 500 - 26 * tip); g.translate(-80, 96); g.rotate(-.3 * tip); g.translate(80, -96);
  cut(blob([[-90, 90], [-70, 40], [0, 26], [70, 40], [90, 90]], .6), C.plum, { sh: .8, lift: .2 });
  cut(cutRect(-90, 80, 180, 26, 3), C.gold, { sh: .4 });
  cut(blob([[-20, 104], [90, 100], [130, 116], [40, 124]], .6), C.tealInk, { sh: .5 });
  g.restore();
  // the lantern where his heart would be (draft 4): the tram lamp's bud of light in a gilt calyx cradle, hung
  // from a ring (critic A: a square cage lantern broke the lamp rhyme). It swings to a side on every beat and its
  // flame pulses on the beat
  const lx = 505, ly = 820, pulse = Math.exp(-6 * beatClock.since(t));
  g.save(); g.translate(lx, ly); g.rotate(Math.cos(Math.PI * beatClock.phase(t)) * .09); g.scale(.62, .62);
  glow(0, 105, 340, '245,205,120', .3 + .3 * pulse);
  cut(ringLace(0, 14, 10, 18), C.goldDeep, { sh: .3, rule: 'evenodd' });
  cut(rect(-4, 26, 8, 22), C.goldDeep, { sh: .3, grain: 0 });
  metroBud(0, 152, 93, 1, .25);
  glow(0, 108, 90, '255,240,200', .35 * pulse);
  // three gilt sepals hug the glass from below, curling in (a lantern's cradle, not a flower's fan); gold, so the
  // heart still reads as a lit lantern on the booth's dark teal
  for (const i of [-1, 1, 0]) { const pth = petalPath(i * 16, 166, i * .38, 50 - (i === 0) * 10, 26, -i * .35);
    cut(pth, C.gold, { sh: .5, lift: .2, grain: .1 }); g.save(); g.lineWidth = 3; g.strokeStyle = C.goldDeep; g.stroke(pth); g.restore(); }
  cut(ellipse(0, 172, 22, 12), C.goldDeep, { sh: .4 }); cut(circle(0, 188, 8), C.gold, { sh: .3, grain: 0 });
  // its cap: a little gilt dome with a finial over the glass
  cut(blob([[-34, 66], [-26, 44], [0, 34], [26, 44], [34, 66]], .6), C.gold, { sh: .5 }); g.save(); g.lineWidth = 3; g.strokeStyle = C.goldDeep; g.beginPath(); g.moveTo(-34, 66); g.lineTo(34, 66); g.stroke(); g.restore();
  g.restore();
  g.restore();
  rain(t, 12, 5, .25);
  g.restore();
  sheet(C.goldPale, .35 * (1 - ss(31.94, 32.1, t)));
}, { xin: 0 });

// 36.44 "hard luck day": the horseshoe over the door hangs upside down; it slips and spins away
SHOT(36.44, 37.7, 'horseshoe', (t, k, d) => {
  g.save(); cam(540, kf3(t, [[36.44, 1104], [37.7, 1037]]), kf3(t, [[36.44, 1.59], [37.7, 1.156]])); // booth arch to window arch
  sheet(C.plumDeep);
  cut(cutRect(200, 520, 680, 1500, 41), C.plum, { sh: 1, lift: .3 });
  cut(archPath(270, 700, 540, 1300), C.tealDeep, { sh: 0 });
  archFrame(270, 700, 540, 1300, 30, C.gold);
  for (let i = 0; i < 2; i++) cut(archPath(320 + i * 230, 1000, 210, 520), C.tealLight, { sh: .2, alpha: .85 });
  rain(t, 14, 8, .4, .4, 320, 780);
  // the slip: it rocks on its nail, then falls off spinning. The upside-down horseshoe (open end DOWN: the luck runs
  // out) hangs by its crown from the nail. Draft 4: hung lower (nail at 600, it was 470) and a little smaller, so the
  // whole shoe is in frame from the cut and still for 0.3 s before it rocks (the crown sat under the border and the
  // shoe read as a staple); pale gold with a deep keyline so it parts from the gold door arch it hangs over
  const NAIL = 600, RO = 92, RI = 54;
  const sl = clamp((t - 36.98) / .65);
  const rock = Math.sin((t - 36.7) * 16) * .14 * (1 - sl) * clamp((t - 36.7) * 3);
  g.save(); g.translate(540, NAIL + ei(sl) * 1400); g.rotate(rock + sl * sl * 7); g.translate(0, RO);
  const shoeP = (ro, ri, a0 = .1) => { const p = new Path2D(); p.arc(0, 0, ro, Math.PI * (1 - a0), Math.PI * a0 + TAU, false); p.arc(0, 0, ri, Math.PI * a0 + TAU, Math.PI * (1 - a0), true); p.closePath(); return p; };
  cut(shoeP(RO, RI), C.goldDeep, { sh: 1.2, lift: .6 });
  cut(shoeP(RO - 6, RI + 6, .12), C.goldPale, { sh: 0, grain: .2 });
  for (let i = 0; i < 6; i++) { const a = Math.PI * .9 + (i + .5) / 6 * Math.PI * 1.2; cut(ellipse(Math.cos(a) * (RO + RI) / 2, Math.sin(a) * (RO + RI) / 2, 5, 7, a), C.plumDeep, { sh: 0, grain: 0 }); }
  for (const sx of [-1, 1]) cut(rrect(sx * (RO + RI) / 2 - 20, RO * Math.sin(Math.PI * .1) - 4, 40, 14, 6), C.goldDeep, { sh: .3, grain: 0 }); // the heels
  g.restore();
  cut(circle(540, NAIL, 9), C.goldDeep, { sh: .4 });
  g.restore();
}, { xin: .25, tr: 'fade' });

// ---- CHORUS 1: the clap catches on. 1 pair, then 3, then 6, then everyone (Robin, look test v1 notes).
// Each pair visits for its clap only: up just before "clap", open on "hands", gone a second later.

// The tenement: three by three arched windows; the bottle window is the centre one.
// Inside a window everything is drawn in a local 600 x 825 frame (scale .4 in the world).
const WIN = { xs: [150, 420, 690], ys: [640, 1040, 1440], k: .4, w: 600, h: 825 }; // close-set, Castel Beranger style
const PEOPLE = [ // sleeve, cuff: one paper pair per person
  [C.plumLight, C.gold], [C.tealDeep, C.goldPale], [C.goldDeep, C.cream], [C.plum, C.gold], [C.teal, C.gold], [C.plumDeep, C.goldPale],
];
function inWin(c, r, fn) { g.save(); g.translate(WIN.xs[c], WIN.ys[r]); g.scale(WIN.k, WIN.k); fn(); g.restore(); }
// a horseshoe arch (draft 3, Nouveau): the round head bulges wider than the opening's base. pad grows it (frames)
function shoePath(w, h, pad = 0) {
  const R = w * .52 + pad, cx = w / 2, cy = w * .52, hb = w * .44 + pad, ys = cy + Math.sqrt(R * R - hb * hb);
  const a0 = Math.atan2(ys - cy, -hb), a1 = Math.atan2(ys - cy, hb) + TAU, p = new Path2D();
  p.moveTo(cx - hb, h + pad * .3); p.lineTo(cx - hb, ys); p.arc(cx, cy, R, a0, a1, false); p.lineTo(cx + hb, h + pad * .3); p.closePath(); return p;
}
const opening = () => shoePath(WIN.w, WIN.h);
// lit 0..1; inside() draws in the opening (clipped), front() over the frame and sill
function tenWindow(c, r, lit, inside, front) {
  inWin(c, r, () => {
    cut(opening(), C.tealInk, { sh: 0 });
    if (lit > 0) { g.save(); g.globalAlpha *= lit; cut(opening(), C.goldPale, { sh: 0, grain: .3 }); g.restore(); glow(300, 520, 560, '250,215,140', .4 * lit); }
    g.save(); g.clip(opening());
    // glazing: a mullion and a transom, two lower panes, and a fanlight in the arched head (draft 4: the two curling
    // stems read as a bulb's filament); dark lead on lit glass, gold on dark
    const lead = lit > .5 ? C.plumDeep : C.goldDeep, lw = 13;
    cut(rect(300 - lw / 2, 330, lw, WIN.h), lead, { sh: .2, grain: 0 });
    cut(rect(0, 330 - lw / 2, WIN.w, lw), lead, { sh: .2, grain: 0 });
    cut(rect(0, 590 - lw / 2, WIN.w, lw * .8), lead, { sh: .2, grain: 0 });
    { const fan = new Path2D(); fan.arc(300, 330, 150 + lw / 2, Math.PI, 0); fan.arc(300, 330, 150 - lw / 2, 0, Math.PI, true); fan.closePath(); cut(fan, lead, { sh: .2, grain: 0 }); // an arched fanlight bar in the head
      cut(rect(300 - lw / 2, 180, lw, 150), lead, { sh: .2, grain: 0 }); }
    // straight drapes down both jambs, wide enough to hide the head's bulge, so the light is a plain arched window
    for (const sx of [0, 1]) { const x0 = sx ? WIN.w + 20 : -20, x1 = sx ? WIN.w - 84 : 84;
      cut(poly([[x0, -10], [x0, WIN.h + 10], ...[...Array(9).keys()].map((i) => [x1 + (sx ? 1 : -1) * 8 * Math.sin(i * 1.7), WIN.h - i * WIN.h / 8])]), lit > .5 ? C.tealLight : C.tealDeep, { sh: .5 });
      for (let j = 1; j < 3; j++) cut(rect(lerp(x0, x1, j / 3) - 3, 0, 6, WIN.h), lit > .5 ? C.teal : C.tealInk, { sh: 0, grain: 0, alpha: .5 }); } // folds
    if (inside) inside();
    g.restore();
    { const fr = shoePath(WIN.w, WIN.h, 30); fr.addPath(shoePath(WIN.w, WIN.h)); cut(fr, C.gold, { sh: .9, lift: .3, rule: 'evenodd' }); }
    cut(poly([[-70, WIN.h], [WIN.w + 70, WIN.h], [WIN.w + 90, WIN.h + 54], [-90, WIN.h + 54]]), C.cream, { sh: 1, lift: .3 });
    if (r === 1) { // a bowed iron balcony with whiplash balusters under the middle row
      tendril([[-60, WIN.h + 70], [150, WIN.h + 200], [300, WIN.h + 230], [450, WIN.h + 200], [660, WIN.h + 70]], 22, C.tealDeep, { sh: .6 });
      for (let i = 0; i < 5; i++) { const bx = 40 + i * 130, by = WIN.h + 70 + Math.sin((i + .5) / 5 * Math.PI) * 130; tendril(whipPts([bx, WIN.h + 60], [bx - 30, WIN.h + 100], [bx + 40, by - 40], [bx + 10, by], 18, i % 2 ? 1 : -1), 9, C.gold, { sh: .3, grain: 0 }); }
    }
    if (front) front();
  });
}
// the Galle bottle, its base at (0,0): teal glass, a gold lily, filling with rain
function galleBottle(fill) {
  const b = blob([[-80, 0], [-100, -100], [-90, -200], [-34, -260], [-28, -380], [28, -380], [34, -260], [90, -200], [100, -100], [80, 0]], .55);
  cut(b, C.tealLight, { sh: 1, lift: .5, alpha: .94 });
  g.save(); g.clip(b); const wl = lerp(10, -300, fill); cut(rect(-110, wl, 220, 420), C.teal, { sh: 0, grain: .3 });
  cut(ellipse(0, wl, 110, 9), C.goldPale, { sh: 0, grain: 0, alpha: .75 }); g.restore(); // the waterline, rising
  borderBloom(0, -110, 46, 'iris', 1, 1); tendril([[0, -60], [-10, -20], [6, 0]], 10, C.tealDeep, { sh: 0, grain: 0 });
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
  let z = kf3(t, [[37.7, 2.6], [41.0, 2.75], [42.7, 2.75], [44.7, 1.16], [46.5, 1.2], [47.6, 1.0], [48.2, 1.02], [49.4, 1.25]]);
  let cy = kf3(t, [[37.7, 1190], [42.7, 1190], [44.7, 1210], [46.5, 1210], [47.6, 1010], [48.2, 1000], [49.4, 380]]), cx = 540;
  // draft 4: a punch onto the bottle on "bottle" (40.5), following it down onto the sill, then back for clap 1
  { const pb = eio(clamp((t - 40.28) / .3)) * (1 - eio(clamp((t - 40.95) / .45))), st = ss(40.2, 40.7, t);
    const bxw = WIN.xs[1] + WIN.k * lerp(430, 555, st), byw = WIN.ys[1] + WIN.k * (lerp(WIN.h - 230, WIN.h, st) - 190);
    cx = lerp(cx, bxw, .8 * pb); cy = lerp(cy, byw, .8 * pb); z *= 1 + .2 * pb; }
  cam(cx, cy, z);
  sheet(C.tealInk);
  // the moon-halo over the roofs; its lilies open on clap 1
  halo(540, 380, 200, t * .05, 1, [C.goldDeep, C.creamDeep, C.teal, C.gold]);
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t * .04; lily(540 + Math.cos(a) * 240, 380 + Math.sin(a) * 240, a, 64, back(clamp((t - k1 - i * .04) / .7)), [C.cream, C.goldPale]); }
  // the building
  cut(cutRect(-60, 560, W + 120, 1400, 51), C.plum, { sh: 1, lift: .4 });
  cut(cutRect(-60, 540, W + 120, 40, 52), C.gold, { sh: .8, lift: .3 });
  for (const sx of [-1, 1]) tendril(whipPts([540 + sx * 40, 545], [540 + sx * 200, 470], [540 + sx * 360, 600], [540 + sx * 470, 500], 40, -sx), 14, C.gold);
  cut(cutRect(-60, 580, W + 120, 52, 54), C.plumDeep, { sh: .5 });
  for (let i = 0; i < 13; i++) { const x = 20 + i * 86; if (i % 2) borderBloom(x, 606, 18, 'iris', 1, 1); else { g.fillStyle = [C.gold, C.teal, C.goldPale][i % 3]; g.fillRect(x - 10, 596, 20, 20); } }
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
    const bx = lerp(430, 555, set), by = lerp(WIN.h - 230, WIN.h, set), fill = ss(37.9, 40.6, t), lean = Math.sin(t * 2.2) * .03 * (1 - set);
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
      if (set < 1) for (let j = 0; j < 4; j++) { const ph = (t * 1.7 + j / 4) % 1, dy = lerp(-80, by - 420, ph); g.save(); g.globalAlpha *= (1 - set) * .9; cut(ellipse(bx + 4, dy, 7, 12), C.cream, { sh: 0, grain: 0 }); g.restore(); } // rain dripping off the lintel into it
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
// where the ring shot's camera ends: its halo (540, 960, r 250) on the upper-left third; the crowd shot opens on it
const RING_END = { cx: 688, cy: 1300, z: 1.08 };
SHOT(49.4, 53.5, 'ring', (t, k, d) => {
  const kk = CLAPS[2], rot = -Math.PI / 2 + t * .05;
  // warmer ground; the feathers spring open in two waves on the beats while the camera tilts the halo up into
  // the top third, so the crowd rises into a fresh frame (draft 3)
  // draft 4: after the clap the halo drifts up onto the upper-left third (the crowd shot opens there and swings it back
  // to the centre for clap 4); the feathers open one per beat; the quills are bright gold and thin (the audit: the
  // muddy brown rays read as sticks and roots)
  const dr = eio(clamp((t - 51.0) / 2.4));
  g.save(); cam(lerp(540, RING_END.cx, dr), lerp(960, RING_END.cy, dr), lerp(1.0, RING_END.z, eio(k)));
  sheet(C.plum);
  rays(540, 960, 260, 900, 17, -t * .02, C.gold); // an odd count, so no two quills mirror into a teardrop under the halo
  const fb = beatClock.beats.findIndex((b) => b >= kk + .2);
  for (let j = 0; j < 6; j++) { const i = [0, 3, 1, 4, 2, 5][j], t0 = fb >= 0 ? beatClock.beats[fb + j] : kk + .2 + j * .52, fan = back(clamp((t - t0) / .55)); if (fan > 0) feather(540, 960, rot + (i + .5) / 6 * TAU, lerp(240, 560, fan), fan); }
  for (let i = 0; i < 6; i++) {
    const a = rot + i / 6 * TAU, [sl, cf] = PEOPLE[i];
    g.save(); g.translate(540 + Math.cos(a) * 285, 960 + Math.sin(a) * 285); g.rotate(a + Math.PI / 2);
    visitClap(t, 0, 0, 105, kk, { dy: 320, sleeveLen: 2.4, sleeveCol: sl, cuffCol: cf, pre: .55 });
    g.restore();
  }
  halo(540, 960, 250, t * .06, 1, undefined, 'peacock');
  clapRings(t, 540, 960, kk);
  g.restore();
}, { xin: .35, tr: 'fade', smooth: true }); // the moon-halo becomes the ring's halo

// clap 4 (54.133): everyone. A crowd of raised arms rises from the bottom, three rows deep, and claps
// once; the great halo bursts open, the brightest image of the chorus; they sink and we push in
// Mark Von Ulrich (guest director): the neighbours become ONE creature. The arms fan out of a single patchwork
// body (one patch per person's paper) and the great halo is its head.
const BODY = { x: 540, y: 1580 };
// draft 3: ten larger pairs in staggered tiers, each arm rooted in the body's shoulders (radial, never crossing)
const CROWD = (() => { const out = []; let n = 0;
  for (const [r, sc, angs] of [[270, 112, [-158, -132, -48, -22]], [420, 120, [-128, -110, -70, -52]], [560, 108, [-100, -80]]]) for (const deg of angs) {
    out.push({ a: deg * Math.PI / 180, r, sc, p: PEOPLE[n % PEOPLE.length], j: r > 400 ? (hash(n) - .5) * .03 : 0, pre: .55 + hash(n * 7) * .3 }); n++;
  }
  return out; })();
// the creature's arms after the clap (draft 4): as the hands sink back, each sleeve stays and sweeps out along the
// moon-head's rim like Mucha hair, the tips curling at the frame's edges, so the body keeps its arms round its head
// (critic A: with the arms gone the body read as a prize rosette). Long and uneven on purpose: short symmetric
// curls by the neck read as an urn's handles
const CROWD_HEAD = { x: 540, y: 760, R: 600 };
function cradleArm(h, j, u) {
  if (u <= 0) return;
  const sx = Math.cos(h.a) < 0 ? -1 : 1, f = clamp(Math.abs(h.a + Math.PI / 2) / 1.25), lane = (j * 7) % 5;
  const S = [BODY.x + Math.cos(h.a) * 150, BODY.y + Math.sin(h.a) * 150];
  const rr = CROWD_HEAD.R - 10 - lane * 34, a0 = Math.PI / 2 - sx * (.12 + .1 * f), a1 = Math.PI / 2 - sx * (.62 + .5 * f + .08 * lane);
  const pts = [S, [lerp(S[0], CROWD_HEAD.x + Math.cos(a0) * rr, .55), lerp(S[1], CROWD_HEAD.y + Math.sin(a0) * rr, .7) + 30]];
  for (let i = 0; i <= 14; i++) { const a = lerp(a0, a1, i / 14); pts.push([CROWD_HEAD.x + Math.cos(a) * rr, CROWD_HEAD.y + Math.sin(a) * rr]); }
  // the tip lifts off the rim and curls back toward the head
  let [x, y] = pts[pts.length - 1], dir = Math.atan2(y - pts[pts.length - 2][1], x - pts[pts.length - 2][0]), r = 34;
  for (let i = 0; i < 18; i++) { dir += (sx > 0 ? -1 : 1) * .34; r *= .93; x += Math.cos(dir) * r * .5; y += Math.sin(dir) * r * .5; pts.push([x, y]); }
  const v = grow(smoothPts(pts), u), w = h.sc * .46;
  tendril(v, w, h.p[0], { sh: .8, lift: .4 });
  tendril(v.map(([px, py]) => [px, py - w * .2]), w * .14, h.p[1], { sh: 0, grain: 0, alpha: .85 }); // a cuff-coloured edge
}
// a polyline smoothed by corner cutting (twice)
function smoothPts(pts) { let p = pts; for (let r = 0; r < 2; r++) { const q = [p[0]]; for (let i = 0; i < p.length - 1; i++) { const [ax, ay] = p[i], [bx, by] = p[i + 1]; q.push([ax * .75 + bx * .25, ay * .75 + by * .25], [ax * .25 + bx * .75, ay * .25 + by * .75]); } q.push(p[p.length - 1]); p = q; } return p; }
function crowdBody(t) {
  const torso = blob([[BODY.x - 360, 2100], [BODY.x - 380, BODY.y + 160], [BODY.x - 250, BODY.y - 20], [BODY.x, BODY.y - 70], [BODY.x + 250, BODY.y - 20], [BODY.x + 380, BODY.y + 160], [BODY.x + 360, 2100]], .5);
  cut(torso, C.plum, { sh: 1.1, lift: .6 });
  g.save(); g.clip(torso);
  PEOPLE.forEach(([col], i) => cut(poly([[BODY.x - 420 + i * 140, BODY.y - 120], [BODY.x - 280 + i * 140, BODY.y - 120], [BODY.x - 300 + i * 140, 2200], [BODY.x - 440 + i * 140, 2200]]), col, { sh: .4, grain: .3 }));
  g.restore();
  // a Mucha collar (draft 4): a crescent of gold petals lying round the neck, open where the neck rises (a full
  // scalloped disc with a plum centre read as a rosette)
  const cx = BODY.x, cy = BODY.y - 30, band = new Path2D();
  band.ellipse(cx, cy, 190, 120, 0, -.15, Math.PI + .15); band.ellipse(cx, cy - 6, 104, 64, 0, Math.PI + .15, -.15, true); band.closePath();
  cut(band, C.gold, { sh: .8, lift: .3 });
  for (let i = 0; i < 11; i++) { const a = Math.PI * (.05 + .9 * i / 10), bx = cx + Math.cos(a) * 150, by = cy + Math.sin(a) * 94;
    cut(circle(bx, by, 15), i % 2 ? C.goldPale : C.cream, { sh: .5, grain: .1 });
    if (i % 2 === 0) { cut(ellipse(bx + Math.cos(a) * 34, by + Math.sin(a) * 30, 11, 15, a - Math.PI / 2), C.gold, { sh: 0, grain: 0 }); } } // a strand of pearls with gold drops
}
// the push's night palette (draft 4): the crowd halo turns to lamplight gold as it bursts, and the moon stays the one
// bright thing, so the push is a lamp in the night (the audit: luma 155-159, brighter than early dawn). Its size and
// place at the cut into the storm are unchanged.
const HALO_NIGHT = [C.goldDeep, C.plum, C.tealDeep, C.goldDeep];
SHOT(53.5, 56.88, 'everyone', (t, k, d) => {
  const kk = CLAPS[3], burst = back(clamp((t - kk) / .9));
  // opens with its halo where the ring's ended (upper-left third, r 270), swings it to the centre for the clap; the
  // night stays night (no daylight sky, no rays), the light comes from the halo-head
  const z = kf3(t, [[53.5, .818], [54.05, 1.0], [55.2, 1.0], [56.88, 1.16]]);
  const ox = 540 + (540 - RING_END.cx) * RING_END.z, oy = 960 + (960 - RING_END.cy) * RING_END.z; // the ring halo on screen at its end
  g.save(); cam(kf3(t, [[53.5, 540 - (ox - 540) / .818], [54.05, 540]]), kf3(t, [[53.5, 760 - (oy - 960) / .818], [54.05, 900]]), z);
  sheet(C.tealInk);
  glow(540, 760, 1100, '250,215,140', .06 + .14 * ss(kk - .05, kk + .3, t) * (1 - .6 * ss(kk + .5, kk + 2.0, t)));
  for (const sx of [-1, 1]) for (let j = 0; j < 2; j++) {
    const v = whipPts([540 + sx * 600, 1300 + j * 160], [540 + sx * 300, 1440 - j * 80], [540 + sx * 60, 1120], [540 + sx * 220, 980 - j * 60], 50 - j * 14, -sx);
    tendril(grow(v, ss(kk, kk + 1.6 + j * .4, t)), 26 - j * 8, j ? C.gold : C.goldDeep);
  }
  cut(poly([[BODY.x - 80, BODY.y + 40], [BODY.x - 70, 760], [BODY.x + 70, 760], [BODY.x + 80, BODY.y + 40]]), C.plum, { sh: .8, lift: .3 }); // the creature's neck
  const HR = lerp(330, CROWD_HEAD.R, burst);
  halo(540, 760, HR, t * .05, 1, t < kk + .08 ? undefined : HALO_NIGHT, 'lace'); // ...and the halo is its head, a moon inside
  // the moon in the head: haloMoon's paper with a softer glow after the burst (its full glow lit the whole frame);
  // the moon swells into its storm size over the push (it reaches it 1 s before the cut, so the hand-off is unchanged)
  { const r = .42 * lerp(330, CROWD_HEAD.R, ss(kk, 55.85, t)) * (t < kk ? HR / 330 : 1), gk = lerp(.35, .12, ss(kk, kk + .6, t)); glow(540, 760, r * 2.4, '250,230,180', gk); cut(circle(540, 760, r), C.cream, { sh: .4, grain: .3 }); cut(crescent(540 + r * .1, 760, r * .96, .82, .3), C.goldPale, { sh: 0, grain: .2, alpha: .7 }); }
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU - t * .05; lily(540 + Math.cos(a) * 640, 760 + Math.sin(a) * 640, a, 110, back(clamp((t - kk - i * .05) / .7)), [C.gold, C.goldDeep]); }
  // the arms rise out of the one body, each rooted in its shoulders; after the clap the hands sink back into it and
  // the sleeves stay, curling up round the head
  CROWD.forEach((h, j) => cradleArm(h, j, ss(kk + .45 + j * .03, kk + 1.25 + j * .03, t)));
  for (const h of CROWD) {
    g.save(); g.translate(BODY.x + Math.cos(h.a) * h.r, BODY.y + Math.sin(h.a) * h.r); g.rotate(h.a + Math.PI / 2);
    visitClap(t, 0, 0, h.sc, kk + h.j, { dy: h.r * .6, pre: h.pre, post: 1.5, sleeveCol: h.p[0], cuffCol: h.p[1], L: { root: [-28, h.r - 150] }, R: { root: [28, h.r - 150] } });
    g.restore();
  }
  crowdBody(t);
  clapRings(t, 540, 760, kk, 1.3);
  g.restore();
}, { xin: .3, tr: 'fade', smooth: true }); // the ring's halo becomes the crowd's

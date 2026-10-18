// Real Thing, rotoscope animatic: every shot of the song. Times are song seconds (work/timing.json, onset-snapped
// MMS alignment of Bob's sheet). Each shot is a pure function of song time; a transition (tr) hands the next shot
// in through an element of this one: a wobbly iris that opens from that element's point (ripple, ink, dust, drop).
// The story: a man in a canoe is offered a fake lake (brochure, painted water, a treaty, a jar of dirt) and keeps
// refusing it. Fake things are flat and still; real things breathe (see world.js).
const W_ = {  // word times
  v1real: 28.72, v1thing: 29.13, fishless: 33.91, lake: 34.65, v1real2: 41.05, treaty: 44.91, govt: 46.42, makes: 47.24,
  r1dont: 56.77, r1wanna: 57.91, r1settle: 63.77, r1less: 65.0, r1real: 67.12,
  v2real: 84.9, decide: 88.39, me: 90.11, fair: 91.15, v2real2: 97.27, dirt: 102.33, air: 103.46,
  r2dont: 106.75, r2settle: 113.49, r2less: 120.76, r2real: 122.52,
  I: 130.74, love: 131.89, please: 132.72, fake: 134.62,
  r3dont: 142.07, r3settle: 148.72, r3less: 155.94, r3real: 157.92, r3thing: 158.76,
};
const HZ = 520;

// S01 0-5.5 intro A (harmonica alone): dawn mist over the empty lake, slow push in.
function sLakeDawn(t, tt, len) {
  T = t; HAND = HANDS.paint; HUE = 0; fx({ dim: 1 - q01(t, 0, 2.2), warm: .3 });
  withT(() => { cam(960, 520, 1.06 + tt / len * .06);
    lakeSky({ hz: HZ, dawn: .55 }); hills(HZ); water(HZ, { n: 40, flow: .4 }); mist(HZ, 1);
    // a loon's wake: one ripple ring opening (the only motion on the water)
    for (let k = 0; k < 3; k++) { const a = (tt * .35 + k * .33) % 1; stroke(ellipse(1240, 700, 30 + a * 220, 6 + a * 40, 18).concat([[1270 + a * 220, 700]]), 45 + k, .6, { force: true, alpha: (1 - a) * .7, col: hsl(40, 30, 92) }); }
  });
}
// S02 5.5-12.5 intro B: the canoe glides in from the left, wide, mist lifting.
function sCanoeWide(t, tt, len) {
  T = t; HAND = HANDS.clean; fx({ warm: .3 });
  withT(() => { cam(960, 540, 1);
    lakeSky({ hz: HZ, dawn: .55 }); hills(HZ, 10, { billboards: [[1500, 120, 301]] }); water(HZ, { flow: .5 }); mist(HZ, .8 - tt / len * .4);
    paddler(t, lerp(150, 760, ease.out(tt / len)), 700, .55, { turn: .5 });
  });
}
// S03 12.5-25.2 drums in: tracking beside him, medium; the shore slides by with brochure billboards on it.
function sCanoeTrack(t, tt, len) {
  T = t; HAND = HANDS.clean; fx({ warm: .25 });
  const pan = tt * 70;
  withT(() => { cam(960, 560, 1);
    withT(() => { s.translate(-pan * .25, 0); lakeSky({ hz: 470, dawn: .5 }); });
    withT(() => { s.translate(-pan, 0); hills(470, 12, { billboards: [[700, 130, 302], [1500, 110, 303], [2300, 140, 304], [3000, 120, 305]] }); });
    water(470, { flow: 2.2 });
    paddler(t, 930, 860, 1.05, { turn: .6 });
  });
}
// S04 25.2-31.5 verse: the fake man on a dock holds up the brochure; it is brighter than the lake behind it.
// On "real thing" the man in the canoe looks past it at the real water.
function sDock(t, tt, len) {
  T = t; HAND = HANDS.clean; fx({});
  const look = q01(t, W_.v1real - .3, W_.v1thing + .2);
  withT(() => { cam(960, 540, 1.04 + tt / len * .05);
    lakeSky({ hz: 560, dawn: .45 }); hills(560, 14); water(560, { flow: .6 });
    // dock
    part([[1060, 760], [1980, 740], [1980, 800], [1060, 820]], { fill: hsl(30, 26, 46), shade: hsl(26, 26, 34), shadeShift: [0, -16], seed: 200, inkW: 1, sharp: 50 });
    for (const x of [1120, 1400, 1700]) part(rect(x, 800, 26, 200), { fill: hsl(28, 24, 34), seed: 201 + x, inkW: .8, sharp: 40 });
    // fake man holding the brochure out at arm's length
    const P = who(CAST.slick, { x: 1560, y: 470, sc: .72, seed: 140, breath: breath(t, 2), turn: -.5, blink: blinkAt(t, 5), brow: .6,
      armL: [-1.45, -.15, 0, .7, 1], armR: [1.2, -.6, 0, .4, 1], legs: [.05, 0, -.05, 0], footDown: true, flipR: true });
    person({ ...P, parts: 'body' });
    const J = person({ ...P, parts: 'arms' }), wr = [P.x + J.armL.wr[0] * P.sc, P.y + J.armL.wr[1] * P.sc];
    fake(() => brochurePic(wr[0] - 330, wr[1] - 150, 360, 216, 210));
    // our man in the canoe, foreground left, looking from the brochure (turn right) to the lake (turn away)
    paddler(t, 420, 900, 1.0, { still: true, noPaddle: true, turn: lerp(.65, -.4, look), tilt: lerp(-.05, .08, look) });
  });
}
// S05 31.5-37.8 over the side: under the water the fish are flat brochure cut-outs; on "fishless" they turn edge-on
// and vanish, on "lake" the water goes grey.
function sUnderwater(t, tt, len) {
  T = t; HAND = HANDS.paint; const g = q01(t, W_.lake - .2, W_.lake + 1.2);
  fx({ grey: g * .75 });
  withT(() => { cam(960, 540, 1.1 - tt / len * .06);
    fill(hsl(200, 34 * (1 - g), 30 + g * 10));
    for (let i = 0; i < 7; i++) { const x = 200 + i * 260 + snoise(t * .2, i) * 30; part([[x, -100], [x + 120, -100], [x + 240 + i * 10, 1200], [x - 80, 1200]], { fill: hsl(190, 40 * (1 - g), 60, .12), seed: 300 + i, ink: false, wob: 6, tone2: false }); }
    part([[-200, 900], [2200, 880], [2200, 1300], [-200, 1300]], { fill: hsl(40, 20 * (1 - g), 34), shade: hsl(36, 20 * (1 - g), 26), shadeShift: [0, -30], seed: 310, inkW: .8 }); // lake bed
    for (let i = 0; i < 5; i++) { const x = 120 + i * 420; stroke([[x, 900], [x + snoise(t * .5, i) * 30, 700], [x + snoise(t * .4, i + 9) * 50, 520]], 320 + i, 1.2, { force: true, col: hsl(120, 30 * (1 - g), 30) }); }
    // the flat fish: still, printed, sliding on rails
    const edge = 1 - q01(t, W_.fishless - .1, W_.fishless + .55);
    fake(() => { for (let i = 0; i < 5; i++) flatFish(((i * 410 + tt * 60) % 2100) - 100, 300 + (i % 3) * 170, 2.2, 0, edge); });
    // his reflection-hand at the surface
    part([[-200, -100], [2200, -100], [2200, 70], [-200, 90]], { fill: hsl(200, 30 * (1 - g), 72, .5), seed: 330, ink: false, wob: 5 });
  });
}
// S06 37.8-43.9: wide; a painted sky (a theatre flat, still) drops down over the real sky and lands on "real thing".
function sBackdrop(t, tt, len) {
  T = t; HAND = HANDS.clean; fx({ grey: .55 - tt / len * .1 });
  const drop = ease.out(inv(38.4, W_.v1real2 + .05, t)), bump = hit(t, W_.v1real2, 8) * 12;
  withT(() => { cam(960, 540, 1.08);
    lakeSky({ hz: HZ, dawn: .3 }); hills(HZ); water(HZ, { grey: .8 });
    paddler(t, 900, 820, .5, { still: true, noPaddle: true, turn: 0, tilt: -.25 });
    // the flat comes down on its battens
    const y = lerp(-1100, 0, drop) + bump;
    stroke([[300, -400], [300, y - 20]], 340, .6); stroke([[1620, -400], [1620, y - 20]], 341, .6);
    fake(() => { brochurePic(-120, y - 40, 2160, HZ + 40, 342, { noFish: true }); s.fillStyle = '#5a3a22'; s.fillRect(-140, y - 60, 2200, 24); });
  });
}
// S07 43.9-49.3: a paper treaty unrolls across the lake towards us; a big hand from the clouds signs it on
// "government"; on "makes" the ink runs off the paper into the water.
function sTreaty(t, tt, len) {
  T = t; HAND = HANDS.clean; fx({ grey: .45 });
  const un = ease.out(inv(43.9, 45.6, t)), sign = inv(W_.govt - .1, W_.makes + .3, t), run = q01(t, W_.makes, 49.3);
  withT(() => { cam(960, 520, 1.02);
    lakeSky({ hz: 440, dawn: .2 }); hills(440, 16); water(440, { grey: .7 });
    // the paper road, in perspective: from the horizon to the bottom of frame
    const near = lerp(470, 1200, un);
    fake(() => { poly([[900, 450], [1020, 450], [lerp(1020, 1640, un), near], [lerp(900, 280, un), near]], '#f4ecd6'); s.strokeStyle = '#8a8070'; s.lineWidth = 2;
      for (let k = 1; k < 9; k++) { const v = k / 9, yy = lerp(450, near, v * v); if (yy > near - 4) break; const hw = lerp(60, lerp(60, 680, un), v * v); s.beginPath(); s.moveTo(960 - hw * .8, yy); s.lineTo(960 + hw * .8 * (k % 3 ? 1 : .5), yy); s.stroke(); }
      dot(1120, 1020, 46 * un, '#c0332b'); });
    // the hand and pen
    const hx = lerp(700, 1300, sign), hy = 820 + Math.sin(sign * 40) * 12 * (sign > 0 && sign < 1), ha = 1 - q01(t, 48.4, 49.2);
    if (t > W_.govt - .8) withT(() => { s.globalAlpha = ha;
      const arm = [[hx + 40, hy - 20], [hx + 360, -300]];
      part([[arm[0][0] - 40, arm[0][1]], [arm[0][0] + 40, arm[0][1] + 10], [arm[1][0] + 90, arm[1][1]], [arm[1][0] - 60, arm[1][1]]], { fill: hsl(198, 36, 66), shade: hsl(204, 34, 52), shadeShift: [16, 0], seed: 350, inkW: 1 });
      part(lump(hx + 20, hy - 30, 70, 56, 351, 12), { fill: hsl(18, 44, 70), shade: hsl(10, 40, 58), shadeShift: [10, -8], seed: 352, inkW: 1 });
      stroke([[hx - 60, hy + 20], [hx + 40, hy - 70]], 353, 3, { col: hsl(0, 0, 10) });
    });
    // the signature line
    if (sign > 0) { const P = []; const n = Math.floor(sign * 40); for (let i = 0; i <= n; i++) P.push([700 + i * 15, 840 + Math.sin(i * 1.3) * 20 + Math.sin(i * .4) * 10]); if (P.length > 2) stroke(P, 354, 1.6, { col: hsl(220, 60, 20) }); }
    // the ink runs into the water: dark tendrils down off the paper's edge
    if (run > 0) for (let k = 0; k < 6; k++) { const x0 = 760 + k * 110; stroke([[x0, 860], [x0 + snoise(t, k) * 40, 860 + run * 200], [x0 + snoise(t * .7, k + 5) * 80, 860 + run * 420]], 360 + k, 1.8 * run + .2, { col: hsl(220, 50, 16, .8) }); }
  });
}
// S08 49.3-56.8 refrain 1: men in grey coveralls on rafts paint the grey lake bright brochure blue with rollers.
function sPainters(t, tt, len) {
  T = t; HAND = HANDS.clean; fx({ grey: .2 });
  const cover = inv(49.6, 56.6, t);
  withT(() => { cam(960, 560, 1.06 - tt / len * .06);
    lakeSky({ hz: 460, dawn: .2 }); hills(460, 18); water(460, { grey: .85 });
    // painted strip: flat blue, growing from the left, still
    const edge = lerp(-200, 2100, cover);
    fake(() => { s.fillStyle = vgrad(470, 1080, [[0, '#0aa0e6'], [1, '#0d6fd0']]); s.fillRect(-1600, 462, edge + 1600, 1200); });
    for (let i = 0; i < 3; i++) { const x = edge - 120 - i * 380, y = 560 + i * 170, sc = .38 + i * .14;
      part([[x - 150 * sc / .4, y + 40], [x + 150 * sc / .4, y + 40], [x + 140 * sc / .4, y + 70], [x - 140 * sc / .4, y + 70]], { fill: hsl(30, 30, 50), seed: 400 + i, inkW: .8, sharp: 40 });
      const roll = Math.sin(t * 3 + i) * .25;
      const P = who({ ...CAST.folk3, top: [210, 6, 56], topSh: [210, 8, 44], pants: [210, 6, 50], pantsSh: [210, 8, 40] }, { x, y: y - 330 * sc, sc, seed: 410 + i * 10, lean: .35 + roll * .3, turn: .5, breath: breath(t, i),
        armL: [-.2 + roll, .5, 0, .3, 1], armR: [.3 + roll, .4, 0, .3, 1], legs: [-.2, .3, .25, -.1], footDown: true, flipR: true });
      person({ ...P, parts: 'body' }); const J = person({ ...P, parts: 'arms' }), h = [P.x + J.armR.wr[0] * sc, P.y + J.armR.wr[1] * sc];
      stroke([h, [h[0] + 160 * sc / .4, y + 40]], 420 + i, 1); part(rect(h[0] + 120 * sc / .4, y + 26, 90 * sc / .4, 22), { fill: hsl(200, 70, 50), seed: 430 + i, inkW: .6, sharp: 30 });
    }
  });
}
// S09 56.8-63.8 the long held note: our man stands up in his canoe, grabs the edge of the paint and pulls it back
// like a tablecloth; the real dark living water shows underneath, catching light.
function sPullSheet(t, tt, len) {
  T = t; HAND = HANDS.clean; fx({});
  const stand = q01(t, 56.9, 57.9), pull = ease.inOut(inv(58.0, 63.6, t));
  withT(() => { cam(960, 560, 1.12 - pull * .1);
    lakeSky({ hz: 460, dawn: .3 + pull * .2 }); hills(460, 18); water(460, { flow: 1.2 });
    s.save(); s.globalCompositeOperation = 'screen'; s.fillStyle = rgrad(1200, 700, 20, 700, [[0, hsl(45, 70, 70, .35 * pull)], [1, hsl(45, 70, 60, 0)]]); s.fillRect(0, 460, 1920, 700); s.restore();
    // the painted sheet: flat blue, its edge pulled toward camera-left, folding up in a curl
    const ex = lerp(2000, 120, pull);
    fake(() => { s.fillStyle = vgrad(470, 1080, [[0, '#0aa0e6'], [1, '#0d6fd0']]); s.fillRect(-1600, 462, ex + 1600, 1200);
      s.fillStyle = '#7fd6f6'; s.beginPath(); s.moveTo(ex, 462); s.quadraticCurveTo(ex + 120, 700, ex - 40, 1100); s.lineTo(ex - 140, 1100); s.quadraticCurveTo(ex + 10, 700, ex - 30, 462); s.closePath(); s.fill(); });
    // him: standing in the canoe at the right, hauling with both hands
    const P = who(CAST.lead, { x: 1420, y: 640 - stand * 60, sc: .6, seed: 120, breath: breath(t), lean: -.25 * pull - .05, turn: -.45, blink: blinkAt(t, 3), brow: .5,
      armL: [-1.5 + stand * .2, -.3, 0, .8, 1], armR: [-1.3 + stand * .1, -.5, 0, .8, 1], legs: [-.15, .2, .2, -.1], footDown: true });
    canoeHull(1420, 900, .62, 0);
    const J = person({ ...P, parts: 'body' }); toque(J.hc, P.sc, P.lean);
    person({ ...P, parts: 'arms' });
    canoeFront(1420, 900, .62, 0);
  });
}
// S10 63.8-68.9: close on his hand in the real water; ripples; a real fish brushes past on "real thing".
function sRealWater(t, tt, len) {
  T = t; HAND = HANDS.fine; fx({ warm: .2 });
  const fp = inv(W_.r1real - .9, W_.r1real + 1.6, t);
  withT(() => { cam(960, 540, 1.02 + tt / len * .05);
    fill(hsl(205, 36, 34));
    for (let i = 0; i < 9; i++) { const yy = 120 + i * 110; stroke([[-100, yy + snoise(t * .5, i) * 20], [600, yy + 10], [1300, yy - 10], [2020, yy + snoise(t * .4, i + 3) * 20]], 500 + i, 1, { col: hsl(195, 40, 60, .5) }); }
    if (fp > 0 && fp < 1) fish(lerp(-200, 2100, fp), 760 + Math.sin(fp * 6) * 40, 2.2, -.05, t, 510);
    for (let k = 0; k < 4; k++) { const a = (tt * .5 + k * .25) % 1; stroke(ellipse(980, 520, 80 + a * 520, 20 + a * 130, 22).concat([[1060 + a * 520, 520]]), 520 + k, 1, { alpha: (1 - a) * .8, col: hsl(190, 40, 82) }); }
    // the hand, entering from top: a forearm and an open hand under the surface
    withStyle({ style: CAST.lead }, () => { part([[900, -100], [1040, -100], [1030, 440], [940, 450]], { fill: C('top'), shade: C('topSh'), shadeShift: [16, 0], seed: 530, inkW: 1 }); hand([985, 450], 0, .8 + Math.sin(t * 1.3) * .1, false, 531, 2.4); });
    part([[-200, -100], [2200, -100], [2200, 420], [-200, 440]], { fill: hsl(200, 40, 78, .22), seed: 540, ink: false, wob: 5 });
  });
}
// S11 68.9-75.5 break (harmonica solo): people on the shore with placards (drawn signs, no words), bobbing.
function sShoreCrowd(t, tt, len) {
  T = t; HAND = HANDS.clean; fx({ warm: .15 });
  withT(() => { cam(960 + tt * 40, 560, 1);
    lakeSky({ hz: 420, dawn: .4 }); hills(420, 20); water(420, { n: 30 });
    part([[-600, 760], [400, 720], [1200, 740], [2900, 700], [2900, 1300], [-600, 1300]], { fill: hsl(70, 22, 44), shade: hsl(80, 22, 34), shadeShift: [0, -40], seed: 600, inkW: 1 });
    const syms = ['fish', 'drop', 'tree', 'heart', 'fish', 'drop', 'tree'], st = [CAST.folk, CAST.folk2, CAST.folk3, CAST.her, CAST.folk2, CAST.folk, CAST.folk3];
    for (let i = 0; i < 7; i++) marcher(t, 120 + i * 330, 560 + (i % 2) * 40, .55 + (i % 2) * .05, syms[i], 610 + i * 20, st[i]);
  });
}
// S12 75.5-81.5: the camera floats up and over the crowd and the lake (dream float); the lake's surface tilts flat
// until it reads as a table top: the match into the office.
function sFloatUp(t, tt, len) {
  T = t; HAND = HANDS.paint; fx({ warm: .1 });
  const k = ease.inOut(tt / len);
  withT(() => { cam(960, lerp(560, 320, k), lerp(1, .7, k));
    lakeSky({ hz: lerp(420, -300, k), dawn: .3 }); hills(lerp(420, -300, k), 22); water(lerp(420, -300, k), { n: 70 });
    paddler(t, 960, lerp(900, 640, k), lerp(.4, .22, k), { per: 2.8 });
  });
}
// the office set: one wall, a window, a table (shared by S13-S16)
function office(t, o = {}) {
  const g = o.dirt ?? 0;
  part([[-400, -200], [2400, -200], [2400, 700], [-400, 700]], { fill: hsl(48, 14, 70 - g * 20), shade: hsl(44, 14, 60 - g * 18), shadeShift: [-300, 0], seed: 700, ink: false, wob: 5 });
  const win = [[1300, 100], [1800, 96], [1806, 560], [1306, 566]];
  part(win, { fill: hsl(lerp(200, 34, g), lerp(30, 40, g), lerp(74, 46, g)), seed: 701, inkW: 1.4, sharp: 30, extra: () => {
    part([[1290, 470], [1420, 380], [1520, 420], [1600, 300], [1700, 360], [1820, 330], [1820, 580], [1290, 580]], { fill: hsl(220, 10, lerp(40, 30, g)), seed: 702, inkW: .6 });
    for (const x of [1450, 1640]) { part(rect(x, 230, 40, 200), { fill: hsl(0, 0, 36), seed: 703 + x, inkW: .6, sharp: 30 }); for (let k = 0; k < 3; k++) part(lump(x + 20 + k * 30 + T * 10 % 40, 200 - k * 50, 40 + k * 16, 22 + k * 8, 704 + x + k), { fill: hsl(30, 10 + g * 30, 50 - g * 10, .8), seed: 705 + x + k, ink: false, wob: 2 }); }
  } });
  stroke([[1553, 98], [1556, 564]], 706, 1.2);
  part([[-400, 760], [2400, 750], [2400, 1400], [-400, 1400]], { fill: hsl(30, 30, 40), shade: hsl(26, 30, 30), shadeShift: [0, -80], seed: 710, inkW: 1.2, sharp: 80 });
}
function slickPose(t, o = {}) {
  return who(CAST.slick, { x: 760, y: 800, sc: .9, seed: 140, breath: breath(t, 2), turn: .15, blink: blinkAt(t, 5), brow: .4, armL: [-.5, 1.6, 0, .4, 1], armR: [.5, -1.6, 0, .4, 1], flipR: true, ...o });
}
// S13 81.5-87.6: across the table the fake man slides a plate: a fish shrink-wrapped flat. On "real thing" our man
// pushes it back.
function sOffice(t, tt, len) {
  T = t; HAND = HANDS.clean; fx({});
  const slide = ease.out(inv(81.6, 83.2, t)), back = ease.inOut(inv(W_.v2real - .1, W_.v2real + .9, t));
  withT(() => { cam(960, 560, 1.04);
    office(t);
    const P = slickPose(t, { armR: [.9 - slide * .3, -1.0, 0, .6, 1] }); person({ ...P, parts: 'body' }); person({ ...P, parts: 'arms' });
    part([[-400, 760], [2400, 750], [2400, 800], [-400, 812]], { fill: hsl(28, 30, 48), seed: 711, inkW: 1, sharp: 80 });
    const px = lerp(780, 1060, slide) - back * 300;
    part(ellipse(px, 900, 210, 60, 18), { fill: hsl(40, 16, 92), shade: hsl(36, 12, 78), shadeShift: [0, -14], seed: 720, inkW: 1 });
    fake(() => { s.fillStyle = 'rgba(220,240,255,.85)'; s.fillRect(px - 150, 860, 300, 70); flatFish(px, 895, 3.4, 0, 1); s.strokeStyle = '#ffffff'; s.lineWidth = 3; s.strokeRect(px - 150, 860, 300, 70); });
    // our man, back to camera, foreground right; his hand pushes the plate back
    const Q = who(CAST.lead, { x: 1500, y: 980, sc: 1.25, seed: 120, back: true, turn: -.3, breath: breath(t), armL: [-.3 - back * .9, -.4 - back * .6, 0, .7, 1], armR: [.3, -.2, 0, .3, .8] });
    const J = person({ ...Q, parts: 'body' }); toque(J.hc, Q.sc, 0); person({ ...Q, parts: 'arms' });
  });
}
// S14 87.6-94.4: close on brass scales on the table. The fake man's finger presses one pan down on "decide";
// on "fair" our man's hand lifts it level.
function sScales(t, tt, len) {
  T = t; HAND = HANDS.fine; fx({});
  const press = q01(t, W_.decide - .1, W_.decide + .5), lift = q01(t, W_.fair - .4, W_.fair + .5), tilt = (press - lift) * .32;
  withT(() => { cam(960, 520, 1.0 + tt / len * .05);
    part([[-200, -200], [2200, -200], [2200, 760], [-200, 760]], { fill: hsl(48, 14, 66), shade: hsl(44, 14, 58), shadeShift: [-400, 0], seed: 730, ink: false, wob: 5 });
    part([[-200, 740], [2200, 730], [2200, 1300], [-200, 1300]], { fill: hsl(30, 30, 42), shade: hsl(26, 30, 32), shadeShift: [0, -60], seed: 731, inkW: 1.2, sharp: 80 });
    const gold = hsl(42, 60, 52), goldSh = hsl(36, 58, 36);
    part([[880, 760], [1040, 760], [1010, 720], [910, 720]], { fill: gold, shade: goldSh, seed: 732, inkW: 1 });
    part(rect(948, 260, 24, 470), { fill: gold, shade: goldSh, shadeShift: [6, 0], seed: 733, inkW: .9, sharp: 30 });
    const bx = 960, by = 270, L = 420, ca = Math.cos(tilt), sa = Math.sin(tilt), ends = [[bx - L * ca, by - L * sa], [bx + L * ca, by + L * sa]];
    stroke([ends[0], ends[1]], 734, 3, { col: goldSh });
    ends.forEach(([x, y], i) => { stroke([[x, y], [x - 90, y + 250]], 735 + i, .7); stroke([[x, y], [x + 90, y + 250]], 737 + i, .7);
      part([[x - 130, y + 250], [x + 130, y + 250], [x + 90, y + 300], [x - 90, y + 300]], { fill: gold, shade: goldSh, shadeShift: [0, -10], seed: 740 + i, inkW: 1 }); });
    // the fake man's pressing finger from the right, our man's lifting hand from below left
    const r = ends[1];
    withStyle({ style: CAST.slick }, () => { const fy = r[1] + 160 - press * 20 + lift * 0; part([[r[0] + 40, fy - 40], [2100, fy - 200], [2100, fy - 60], [r[0] + 60, fy + 20]], { fill: C('top'), shade: C('topSh'), seed: 750, inkW: 1 }); hand([r[0] + 40, fy], -Math.PI / 2 - .6, .2, true, 751, 2.4); });
    if (lift > 0) withStyle({ style: CAST.lead }, () => { const hy = lerp(1300, r[1] + 360, lift); part([[r[0] - 60, hy + 40], [r[0] + 20, hy + 40], [r[0] - 40, 1400], [r[0] - 160, 1400]], { fill: C('top'), shade: C('topSh'), seed: 760, inkW: 1 }); hand([r[0] - 20, hy + 20], Math.PI, .9, false, 761, 2.4); });
  });
}
// S15 94.4-100.6: the fake man smiles from behind a flat smiling mask on a stick; on "real thing" he lowers it,
// and behind it is another mask. Then another.
function sMasks(t, tt, len) {
  T = t; HAND = HANDS.clean; fx({});
  const l1 = ease.inOut(inv(W_.v2real2 - .2, W_.v2real2 + .6, t)), l2 = ease.inOut(inv(99.0, 99.8, t));
  withT(() => { cam(960, 430, 1.55);
    office(t);
    const P = slickPose(t, { x: 960, y: 800, sc: .95, turn: 0, armL: [-.2, 2.6, 0, .5, 1], armR: [.4, -1.5, 0, .4, 1] });
    person({ ...P, parts: 'body' });
    const J = person({ ...P, parts: 'arms' }), hc = J.hc;
    const mask = (dy, alpha, seed) => fake(() => withT(() => { s.globalAlpha = alpha; s.translate(hc[0], hc[1] + dy); s.scale(P.sc, P.sc);
      s.fillStyle = '#ffe2c4'; s.beginPath(); s.ellipse(0, 0, 66, 80, 0, 0, TAU); s.fill(); s.strokeStyle = '#1e2a40'; s.lineWidth = 3; s.stroke();
      s.fillStyle = '#1e2a40'; for (const x of [-24, 24]) { s.beginPath(); s.arc(x, -12, 7, 0, TAU); s.fill(); }
      s.lineWidth = 5; s.beginPath(); s.arc(0, 10, 34, .2, Math.PI - .2); s.stroke(); s.fillStyle = '#ff9a8a'; for (const x of [-40, 40]) { s.beginPath(); s.arc(x, 18, 10, 0, TAU); s.fill(); }
      s.strokeStyle = '#6a4a2a'; s.lineWidth = 6; s.beginPath(); s.moveTo(20, 76); s.lineTo(60, 240); s.stroke(); }));
    if (l1 < 1) mask(l1 * 380, 1, 1);
    if (t > W_.v2real2) mask(l2 * 380, 1 - l2 * 0, 2);
    if (t > 99.0) mask(0, l2, 3);
  });
}
// S16 100.6-105.8: he opens a glass jar of "air" and dirt pours out; the window behind goes brown; dust on "air".
function sDirtJar(t, tt, len) {
  T = t; HAND = HANDS.clean;
  const open = q01(t, W_.dirt - .5, W_.dirt), pour = inv(W_.dirt, 105.6, t), dust = q01(t, W_.air - .2, 105.8);
  fx({ grey: dust * .5 });
  withT(() => { cam(960, 520, 1.12 + tt / len * .08);
    office(t, { dirt: dust });
    const P = slickPose(t, { x: 820, armL: [-.4, 1.9, 0, .5, 1], armR: [.9, -1.3 + open * .3, 0, .5, 1] });
    person({ ...P, parts: 'body' }); const J = person({ ...P, parts: 'arms' });
    part([[-400, 760], [2400, 750], [2400, 800], [-400, 812]], { fill: hsl(28, 30, 48), seed: 711, inkW: 1, sharp: 80 });
    // jar, tipped as it pours
    const jx = 1060, jy = 700, tip = open * -1.6;
    withT(() => { s.translate(jx, jy); s.rotate(tip);
      part([[-70, -140], [70, -140], [80, -120], [80, 60], [60, 80], [-60, 80], [-80, 60], [-80, -120]], { fill: hsl(190, 30, 86, .45), seed: 770, inkW: 1 });
      part(rect(-74, 40 - (1 - pour) * 150, 148, 120 - pour * 100), { fill: hsl(28, 40, 26 + 0), seed: 771, ink: false, sharp: 20, alpha: 1 - pour });
      if (open < .5) part(rect(-76, -172, 152, 34), { fill: hsl(0, 0, 60), seed: 772, inkW: .8, sharp: 20 });
    });
    if (pour > 0) for (let i = 0; i < 26; i++) { const u = (i / 26 + tt * .8) % 1, x = jx - 150 + snoise(i, 3) * 30 - u * 60, y = jy - 40 + u * 330; part(lump(x, y, 10 + u * 20, 8 + u * 12, 780 + i, 7), { fill: hsl(28, 36, 30), seed: 780 + i, ink: false, wob: .6 }); }
    if (dust > 0) for (let i = 0; i < 14; i++) { const x = -200 + ((i * 260 + tt * 120) % 2300), y = 200 + (i % 5) * 180; part(lump(x, y, 220, 90, 800 + i), { fill: hsl(30, 30, 50, .35 * dust), seed: 800 + i, ink: false, wob: 3 }); }
  });
}
// S17 105.8-120.6 refrain 2: he walks out into a dust field (brown sky). The fake man's building on the horizon is
// a paper cut-out; during the long "settle" the wind tears it into flying treaty pages.
function sDustField(t, tt, len) {
  T = t; HAND = HANDS.scratch; fx({ grey: .5 - q01(t, 118, 120.6) * .2 });
  const tear = ease.in(inv(W_.r2settle, 119.6, t)), walk = tt / len;
  withT(() => { cam(960, 540, 1.0 + walk * .1);
    s.fillStyle = vgrad(0, 640, [[0, hsl(32, 34, 46)], [1, hsl(36, 40, 66)]]); s.fillRect(-400, -400, 2800, 1100);
    part([[-400, 640], [2400, 620], [2400, 1400], [-400, 1400]], { fill: hsl(30, 34, 38), shade: hsl(26, 34, 28), shadeShift: [0, -60], seed: 820, inkW: 1 });
    // the paper building: flat, still, then its pieces lift and fly right
    fake(() => { const bx = 1340, by = 640, pcs = [[0, -260, 300, 260], [40, -340, 80, 80], [180, -320, 70, 60], [20, -200, 50, 70], [120, -200, 50, 70], [220, -200, 50, 70], [20, -100, 50, 70], [120, -100, 50, 70], [220, -100, 50, 70]];
      pcs.forEach(([x, y, w, h], i) => { const d = clamp(tear * 1.6 - i * .07), fx_ = d * (900 + i * 90), fy = -d * (300 + i * 40) + Math.sin(d * 8 + i) * 40 * d;
        withT(() => { s.translate(bx + x + w / 2 + fx_, by + y + h / 2 + fy); s.rotate(d * (2 + i)); s.fillStyle = i ? (i < 3 ? '#9fb3c7' : '#3a4a5a') : '#e7e2d6'; s.fillRect(-w / 2, -h / 2, w, h); s.strokeStyle = '#1e2a40'; s.lineWidth = 2; s.strokeRect(-w / 2, -h / 2, w, h); }); }); });
    // dust curls
    for (let i = 0; i < 12; i++) { const x = -300 + ((i * 230 + tt * 160) % 2600), y = 300 + (i % 4) * 160 + Math.sin(t + i) * 30; part(lump(x, y, 180, 50, 840 + i), { fill: hsl(32, 30, 60, .3), seed: 840 + i, ink: false, wob: 3, tone2: false }); }
    // him, walking away from us into the wind, small
    const x = lerp(700, 820, walk), sc = lerp(.42, .3, walk), ph = t * 1.6 * TAU;
    const P = who(CAST.lead, { x, y: 900 - walk * 140, sc, seed: 120, back: true, breath: breath(t), lean: -.08, armL: [-.2 + Math.sin(ph) * .3, .2, 0, .3, 1], armR: [.2 - Math.sin(ph) * .3, -.2, 0, .3, 1], legs: [Math.sin(ph) * .3, .1, -Math.sin(ph) * .3, .1], footDown: true });
    const J = person({ ...P, parts: 'body' }); toque(J.hc, sc, 0); person({ ...P, parts: 'arms' });
  });
}
// S18 120.6-125.5: the dust settles; close on the ground; a green shoot pushes up on "real thing".
function sShoot(t, tt, len) {
  T = t; HAND = HANDS.fine; const g = q01(t, W_.r2real - .4, W_.r2real + 1.5);
  fx({ grey: .3 * (1 - g) });
  withT(() => { cam(960, 520, 1.25 + tt / len * .15);
    s.fillStyle = vgrad(0, 620, [[0, hsl(36, 30, 62)], [1, hsl(40, 34, 74)]]); s.fillRect(-400, -400, 2800, 1100);
    part([[-400, 640], [2400, 630], [2400, 1400], [-400, 1400]], { fill: hsl(30, 34, 38), shade: hsl(26, 34, 28), shadeShift: [0, -80], seed: 860, inkW: 1 });
    for (let i = 0; i < 8; i++) part(lump(200 + i * 220, 700 + (i % 3) * 120, 30 + (i % 2) * 20, 14, 862 + i, 8), { fill: hsl(28, 30, 30), seed: 862 + i, inkW: .6 });
    const h = g * 520;
    if (h > 2) { stroke([[960, 660], [956 + snoise(t * .4, 1) * 6, 660 - h * .5], [966, 660 - h]], 870, 1.6, { col: hsl(110, 50, 32) });
      for (const sgn of [-1, 1]) { const k = clamp(g * 1.3 - .3); if (k > 0) part([[966, 660 - h * .8], [966 + sgn * 90 * k, 660 - h * .8 - 50 * k], [966 + sgn * 150 * k, 660 - h * .8 - 10 * k], [966 + sgn * 60 * k, 660 - h * .8 + 14 * k]], { fill: hsl(105, 50, 42), shade: hsl(110, 50, 30), shadeShift: [0, 6], seed: 871 + sgn, inkW: .8 }); } }
  });
}
// S19 125.5-130.4 turn: rain. One drop falls on the shoot; we follow it down; its splash becomes a ripple on the lake.
function sRain(t, tt, len) {
  T = t; HAND = HANDS.paint; fx({});
  const k = ease.inOut(inv(126.4, 129.6, t));
  withT(() => { cam(960, 540, 1);
    s.fillStyle = vgrad(0, 1080, [[0, hsl(210, 20, 50)], [1, hsl(205, 26, 40)]]); s.fillRect(-400, -400, 2800, 1900);
    for (let i = 0; i < 60; i++) { const x = (i * 97) % 2000, y = ((i * 211 + tt * 1400) % 1300) - 100; stroke([[x, y], [x - 8, y + 40]], 880 + i, .4, { force: true, col: hsl(200, 30, 86, .6) }); }
    // one big drop falling down the frame
    const dy = lerp(-100, 560, k), r = 22;
    part([[960, dy - r * 2.2], [960 + r, dy], [960, dy + r], [960 - r, dy]], { fill: hsl(195, 40, 80, .9), seed: 890, inkW: .8, seg: 4 });
    const sp = q01(t, 129.4, 130.4);
    if (sp > 0) for (let kk = 0; kk < 3; kk++) { const a = clamp(sp - kk * .2); stroke(ellipse(960, 600, a * 400, a * 90, 24).concat([[960 + a * 400, 600]]), 892 + kk, .8, { force: true, alpha: 1 - a * .6, col: hsl(195, 40, 86) }); }
  });
}
// S20 130.4-137.9 bridge: rain on the lake, the far dock; a woman stands there. She is a flat cardboard stand-up;
// he reaches for her on "love"; on "fake" the cardboard tips over and falls, and she is behind it, real, breathing.
function sBridge(t, tt, len) {
  T = t; HAND = HANDS.pastel; fx({ warm: .1 });
  const fall = ease.in(inv(W_.fake, W_.fake + .8, t)), reach = q01(t, W_.love - .4, W_.please);
  withT(() => { cam(lerp(1000, 1180, tt / len), 560, 1.06 + tt / len * .12);
    lakeSky({ hz: 520, dawn: .15 }); hills(520, 24); water(520, { flow: .3, n: 80 });
    for (let i = 0; i < 40; i++) { const x = (i * 137) % 2400 - 200, y = ((i * 211 + tt * 1300) % 1300) - 100; stroke([[x, y], [x - 6, y + 36]], 900 + i, .35, { force: true, col: hsl(200, 30, 90, .5) }); }
    part([[1150, 720], [1900, 710], [1900, 760], [1150, 770]], { fill: hsl(30, 26, 44), shade: hsl(26, 26, 32), shadeShift: [0, -12], seed: 910, inkW: .9, sharp: 50 });
    // the real her (behind the stand-up)
    const H = who(CAST.her, { x: 1500, y: 450, sc: .62, seed: 160, breath: breath(t, 4), turn: -.4, blink: blinkAt(t, 9), legs: [.04, 0, -.04, 0], footDown: true, armL: [-.2, .3, 0, .3, 1], armR: [.25 - fall * .6, -.3 - fall * 1.2, 0, .6 * fall, 1], flipR: true });
    person({ ...H, parts: 'body' }); person({ ...H, parts: 'arms' });
    // the cardboard stand-up in front of her: still, flat, then hinging forward and flat on the dock
    if (fall < 1) fake(() => withT(() => { s.translate(1500, 720); s.transform(1, 0, 0, Math.cos(fall * Math.PI / 2), 0, 0); s.scale(1.6, 1.6);
      poly([[-60, 0], [-70, -110], [-80, -170], [-58, -230], [-30, -250], [-34, -290], [-20, -320], [20, -320], [34, -290], [30, -250], [58, -230], [80, -170], [70, -110], [60, 0]], '#c9a26a');
      poly([[-46, -10], [-56, -110], [-62, -170], [-44, -226], [44, -226], [62, -170], [56, -110], [46, -10]], '#c7d24a');
      s.fillStyle = '#f0c8a0'; s.beginPath(); s.ellipse(0, -282, 26, 32, 0, 0, TAU); s.fill(); s.fillStyle = '#7a2a14'; s.beginPath(); s.ellipse(0, -300, 30, 22, 0, Math.PI, TAU); s.fill();
      s.fillStyle = '#1e2a40'; for (const x of [-10, 10]) { s.beginPath(); s.arc(x, -284, 3, 0, TAU); s.fill(); } s.lineWidth = 3; s.strokeStyle = '#1e2a40'; s.beginPath(); s.arc(0, -276, 12, .3, Math.PI - .3); s.stroke(); }));
    if (fall >= 1) fake(() => { s.fillStyle = '#c9a26a'; s.fillRect(1430, 722, 140, 10); });
    // him in the canoe, foreground left, reaching out
    paddler(t, 520, 900, .95, { still: true, noPaddle: true, turn: .55, pose: { armR: [lerp(.3, 2.0, reach), lerp(-.3, -.2, reach), 0, .3 + reach * .6, 1] } });
  });
}
// S21 137.9-141.5 turnaround: she steps down into the canoe; they push off.
function sTogether(t, tt, len) {
  T = t; HAND = HANDS.pastel; fx({ warm: .2 });
  const k = ease.inOut(inv(138.0, 140.4, t));
  withT(() => { cam(1100, 560, 1.12);
    lakeSky({ hz: 520, dawn: .3 }); hills(520, 24); water(520, { flow: .5, n: 70 });
    part([[1150, 720], [1900, 710], [1900, 760], [1150, 770]], { fill: hsl(30, 26, 44), shade: hsl(26, 26, 32), shadeShift: [0, -12], seed: 910, inkW: .9, sharp: 50 });
    const cx = lerp(950, 900, q01(t, 140.2, 141.5));
    canoeHull(cx, 900, .9, 0);
    const H = who(CAST.her, { x: lerp(1500, cx + 160, k), y: lerp(450, 640, k) + Math.sin(k * Math.PI) * -40, sc: lerp(.62, .55, k), seed: 160, breath: breath(t, 4), turn: -.5, blink: blinkAt(t, 9), legs: [.2 * Math.sin(k * 6), .1, -.2 * Math.sin(k * 6), .1], footDown: true, armL: [-.6, .4, 0, .5, 1], armR: [.9, -.6, 0, .5, 1], flipR: true });
    const Pm = paddlerPose(t, cx - 140, 870, .56, { still: true, turn: .5 });
    const J = person({ ...Pm, parts: 'body' }); toque(J.hc, Pm.sc, Pm.lean); person({ ...Pm, parts: 'arms' });
    person({ ...H, parts: 'body' }); person({ ...H, parts: 'arms' });
    canoeFront(cx, 900, .9, 0);
  });
}
// two in the canoe, paddling together
function twoInCanoe(t, x, y, sc) {
  canoeHull(x, y, sc, 0);
  const H = who(CAST.her, { x: x + 150 * sc, y: y - 30 * sc, sc: sc * .58, seed: 160, breath: breath(t, 4), turn: .55, blink: blinkAt(t, 9), armL: [-.8, 1.3, 0, .3, .9], armR: [.4, -.6, 0, .3, .9], flipR: true });
  const Pm = paddlerPose(t, x - 140 * sc, y - 30 * sc, sc * .62, { turn: .5 });
  const J = person({ ...Pm, parts: 'body' }); toque(J.hc, Pm.sc, Pm.lean); const J2 = person({ ...Pm, parts: 'arms' }); paddle(J2, Pm);
  person({ ...H, parts: 'body' }); person({ ...H, parts: 'arms' });
  canoeFront(x, y, sc, 0);
}
// S22 141.5-148.4 refrain 3 ("don't..." held): they paddle along the shore; the brochure billboards peel off and
// blow away like leaves; real fish jump.
function sPeel(t, tt, len) {
  T = t; HAND = HANDS.clean; fx({ warm: .35 });
  const pan = tt * 80;
  withT(() => { cam(960, 560, 1);
    withT(() => { s.translate(-pan * .2, 0); lakeSky({ hz: 470, dawn: .6, sunX: 1500 }); });
    withT(() => { s.translate(-pan, 0); hills(470, 12, { billboards: [[700, 130, 302], [1300, 110, 303], [1900, 140, 304], [2500, 120, 305]], peel: (sd) => ease.in(inv(142.2 + (sd - 302) * 1.3, 144.6 + (sd - 302) * 1.3, t)) }); });
    water(470, { flow: 2 });
    for (const [t0, x0, sd] of [[143.2, 400, 1], [145.0, 1500, 2], [146.6, 900, 3]]) { const u = inv(t0, t0 + 1.1, t); if (u > 0 && u < 1) fish(x0 + u * 300, 640 - Math.sin(u * Math.PI) * 220, .9, -1.2 + u * 2.4, t, 960 + sd); }
    twoInCanoe(t, 960, 860, 1.0);
  });
}
// S23 148.4-155.9 the long "settle": crane up and back; the whole lake alive, the crowd on the shore, the sun up.
function sRise(t, tt, len) {
  T = t; HAND = HANDS.paint; const k = ease.inOut(tt / len);
  fx({ warm: .4 + k * .2 });
  withT(() => { cam(960, lerp(560, 420, k), lerp(1, .62, k));
    lakeSky({ hz: lerp(470, 300, k), dawn: .8, sunX: 1300 }); hills(lerp(470, 300, k), 26); water(lerp(470, 300, k), { n: 90, flow: 1 });
    for (let i = 0; i < 10; i++) { const u = ((tt * .7 + i * .37) % 1.6); if (u < 1) fish(-200 + i * 260, 900 - Math.sin(u * Math.PI) * 160, .5, -1.2 + u * 2.4, t, 980 + i); }
    twoInCanoe(t, 980, lerp(860, 760, k), lerp(.8, .42, k));
    // the crowd on the near shore (bottom), waving
    part([[-1000, 1280], [3000, 1240], [3000, 2400], [-1000, 2400]], { fill: hsl(80, 26, 40), shade: hsl(86, 26, 30), shadeShift: [0, -40], seed: 990, inkW: 1 });
    const syms = ['fish', 'drop', 'tree', 'heart', 'fish', 'drop'], st = [CAST.folk, CAST.folk2, CAST.folk3, CAST.folk, CAST.folk2, CAST.folk3];
    for (let i = 0; i < 6; i++) marcher(t, -400 + i * 560, 1260, .7, syms[i], 1000 + i * 20, st[i]);
  });
}
// S24 155.9-160.6: the shore path at dawn; little Bob walks through in front with his piano and Junos while the
// canoe glides behind ("real thing").
function sLittleBob(t, tt, len) {
  T = t; HAND = HANDS.clean; fx({ warm: .6 });
  withT(() => { cam(960, 540, 1);
    lakeSky({ hz: 500, dawn: .9, sunX: 1100 }); hills(500, 28); water(500, { n: 50 });
    twoInCanoe(t, lerp(700, 1200, tt / len), 690, .42);
    part([[-400, 860], [2400, 840], [2400, 1400], [-400, 1400]], { fill: hsl(60, 24, 46), shade: hsl(70, 24, 36), shadeShift: [0, -40], seed: 1100, inkW: 1 });
    for (let i = 0; i < 18; i++) stroke([[i * 120, 900], [i * 120 + 10, 860 - (i % 3) * 14]], 1101 + i, .6, { col: hsl(90, 30, 30) });
    lilBob(lerp(-200, 2500, tt / len), 990, .95, t, true);
  });
}
// S25 160.6-end outro: the wide lake again, mist coming back, the canoe small and far, fade.
function sOutro(t, tt, len) {
  T = t; HAND = HANDS.paint; fx({ warm: .5, dim: q01(t, 163.6, 165.7) });
  withT(() => { cam(960, 520, 1.12 - tt / len * .06);
    lakeSky({ hz: HZ, dawn: .8 }); hills(HZ); water(HZ, { n: 40, flow: .4 });
    twoInCanoe(t, lerp(1100, 1400, tt / len), 640, .2);
    mist(HZ, q01(t, 160.6, 163));
  });
}

// ---- the edit: [start, shot, transition into the next shot] ----
// tr: { d: seconds before the cut it starts, at: [x, y] the element the next shot opens from (screen) }
chapter('rt', 0, DUR, [
  [0, sLakeDawn, { tr: { d: .9, at: [1240, 700] } }],
  [5.5, sCanoeWide],
  [12.5, sCanoeTrack],
  [25.2, sDock, { tr: { d: .7, at: [420, 980] } }],
  [31.5, sUnderwater],
  [37.8, sBackdrop],
  [43.9, sTreaty, { tr: { d: .8, at: [960, 980] } }],
  [49.3, sPainters],
  [56.8, sPullSheet],
  [63.8, sRealWater],
  [68.9, sShoreCrowd],
  [75.5, sFloatUp, { tr: { d: 1.0, at: [960, 700] } }],
  [81.5, sOffice],
  [87.6, sScales],
  [94.4, sMasks],
  [100.6, sDirtJar, { tr: { d: 1.0, at: [900, 900] } }],
  [105.8, sDustField],
  [120.6, sShoot],
  [125.5, sRain, { tr: { d: .9, at: [960, 600] } }],
  [130.4, sBridge],
  [137.9, sTogether],
  [141.5, sPeel],
  [148.4, sRise],
  [155.9, sLittleBob],
  [160.6, sOutro],
]);

// THE SWITCHES (Robin's brainstorm, 2026-10-17): rotoscope = the offer (the deal, the promised lake, "settle");
// crisp = the thing itself (the real lake, the land, the dirt, a real face). Every refusal line snaps into focus,
// every "settle for less" line goes soft again. A switch starts at one element (the fish, the treaty, the scales,
// the jar, her) and spreads out from it across the frame. The last switch, on "love", is permanent.
// [song time, to crisp?, element point on screen, seconds to spread]
const SWITCH = [
  [W_.fishless - .15, 1, [960, 420], .7],   // the brochure fish go; the real lake is empty and clear
  [38.2, 0, [960, 60], .8],                 // "don't want to settle...": the painted sky comes down soft
  [44.26, 1, [960, 640], .6],               // "don't trust the treaty": the paper snaps sharp
  [50.0, 0, [400, 700], .9],                // refrain 1: the painters, the long settle
  [69.0, 1, [450, 260], .7],                // the people on the shore (a placard first)
  [76.0, 0, [960, 820], .9],                // the float into the office: the offer again
  [W_.decide - .7, 1, [960, 300], .6],      // "you can't decide for me what's fair": the scales
  [94.44, 0, [960, 430], .7],               // the smiling masks
  [W_.dirt - .1, 1, [1060, 700], .6],       // "dirt for air": the jar
  [W_.r2dont, 0, [720, 820], .9],           // refrain 2, the dust field and the long settle
  [W_.r2real - .2, 1, [960, 400], .7],      // the shoot
  [125.6, 0, [960, 80], .8],                // the rain comes in soft
  [W_.love - .15, 1, [1480, 300], .9],      // "I want to love you": she comes into focus, and stays
];
function crispState(t) {
  let base = 0, sw = null;
  for (const S of SWITCH) { if (t < S[0]) break; if (t < S[0] + S[3]) { sw = S; break; } base = S[1]; }
  return { base, sw, R: sw ? ease.inOut(inv(sw[0], sw[0] + sw[3], t)) * 2300 : 0 };
}
// frame assembly with element-led transitions: the next shot opens through a wobbly iris from the element's point
const TR = {}; // index -> tr
[[0, { d: .9, at: [1240, 700] }], [3, { d: .7, at: [420, 980] }], [6, { d: .8, at: [960, 980] }], [11, { d: 1.0, at: [960, 700] }], [15, { d: 1.0, at: [900, 900] }], [18, { d: .9, at: [960, 600] }]].forEach(([i, o]) => TR[i] = o);
function drawShot(sh, t) { FX = {}; s.save(); try { sh.fn(t, t - sh.a, sh.b - sh.a); } catch (e) { console.error(sh.name, e); } s.restore(); }
function drawFrame(t) {
  const cs = crispState(t);
  CRISP = cs.base; const fxv = drawCut(t);
  if (cs.sw) { CRISP = cs.sw[1]; const [x, y] = cs.sw[2], R = cs.R;
    layer(1, () => { s.save(); s.beginPath(); s.arc(x, y, Math.max(1, R), 0, TAU); s.clip(); drawCut(t); s.restore(); }, null, 1); }
  CRISP = 0;
  Object.assign(fxv, { cb: cs.base, ct: cs.sw ? cs.sw[1] : cs.base, cx: cs.sw ? cs.sw[2][0] : 0, cy: cs.sw ? cs.sw[2][1] : 0, cr: cs.R });
  T = t; Look.present(t, fxv);
}
function drawCut(t) {
  s.setTransform(RS, 0, 0, RS, 0, 0); s.globalAlpha = 1; s.globalCompositeOperation = 'source-over'; s.filter = 'none';
  const i = Math.max(0, SHOTS.findIndex((x) => t >= x.a && t < x.b)), sh = SHOTS[i] || SHOTS[SHOTS.length - 1];
  drawShot(sh, t); const keep = { ...FX };
  const tr = TR[i], nx = SHOTS[i + 1];
  if (tr && nx && t >= sh.b - tr.d) {
    const u = ease.in(inv(sh.b - tr.d, sh.b, t)), R = u * 2300;
    layer(1, () => { s.save(); s.beginPath(); const Lp = lump(tr.at[0], tr.at[1], R, R * .8, 77, 22); Lp.forEach(([x, y], k) => k ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.clip(); drawShot(nx, t); s.restore(); });
    for (const k of Object.keys(FX)) keep[k] = lerp(keep[k] ?? 0, FX[k], u);
  }
  return keep;
}

// 142.48-165.0 VERSE 3 AGAIN: an empty Nouveau theatre. Opens on the spotlight on the closed curtain (the falling
// star). The curtains part (143.2-145.4). "a hundred bad dreams": in the spotlight on the backdrop, hand shadows
// make a dog whose jaw snaps on the words, then dragonfly shadows cross it. "pistol in his jeans" (148.7-152.5)
// the spotlight finds jeans on a costume rail; "paladin's hat" (152.9-156.1) the helmet on a stool, the note in
// it; "nobody's sure where Mr. Knickerbocker's at" (156.1-161.5) the spotlight searches the empty stage and
// lands on a chair turning slowly, only the bowler on it. The curtains close (161.5-163.3); the spotlight left on
// the curtain turns gold and solid: it becomes the rising sun (bridge 2 opens on it).
const SUN0 = { x: 540, y: 1100, r: 200 };
(() => {
  const OP = { x: 110, y: 330, w: 860, h: 1380 }, FLOOR = 1520;
  const opening = () => archPath(OP.x, OP.y, OP.w, OP.h);
  const SNAPS = [144.46, 145.92, 146.84, 147.7];
  // the house is full, of things: the film's leftovers sit in the front row as its audience
  const SEATS = [140, 290, 440, 590, 740, 890], SEAT = { x: 740, y: 1800 };
  function audience(t, lit) {
    SEATS.forEach((x, i) => {
      cut(rrect(x - 66, 1772, 132, 220, [44, 44, 0, 0]), C.plumDeep, { sh: .9, lift: .3 });
      cut(rrect(x - 66, 1772, 132, 16, [8, 8, 0, 0]), C.plum, { sh: 0, grain: .2 });
      g.save(); g.filter = i === 4 ? 'none' : 'brightness(0.32)';
      g.translate(x, 1770);
      if (i === 0) { cut(blob([[-80, 0], [-60, -50], [0, -64], [60, -50], [80, 0]], .6), C.plum, { sh: .4 }); cut(blob([[-10, 4], [80, 0], [110, 14], [30, 20]], .6), C.tealInk, { sh: .3 }); }
      else if (i === 1) { cut(blob([[-56, -10], [-70, 40], [-76, 170], [-40, 176], [-30, 60], [30, 60], [40, 176], [76, 170], [70, 40], [56, -10], [0, -30]], .4), C.plum, { sh: .4 }); for (const sx of [-1, 1]) cut(poly([[0, -26], [sx * 34, -10], [sx * 10, 70]]), C.cream, { sh: .2 }); } // a jacket over the seat
      else if (i === 2) { for (const sx of [-1, 1]) cut(ringLace(sx * 34, -26, 22, 30), C.goldDeep, { sh: .3, rule: 'evenodd' }); cut(rect(-10, -30, 20, 6), C.goldDeep, { sh: 0 }); }
      else if (i === 3) { g.translate(0, -4); g.scale(.7, .7); cut(ellipse(0, 0, 120, 24), C.plumDeep, { sh: .3 }); cut(blob([[-70, -6], [-78, -190], [60, -206], [78, -190], [70, -6]], .3), C.plumDeep, { sh: .3 }); cut(rect(-72, -54, 144, 30), C.gold, { sh: .2 }); }
      else if (i === 4) { g.translate(0, 8); bowler(1.15); }
      else { cut(ringLace(0, -128, 10, 18), C.goldDeep, { sh: 0, rule: 'evenodd' }); cut(blob([[-40, -110], [40, -110], [30, -96], [-30, -96]], .4), C.goldDeep, { sh: .3 }); cut(rect(-30, -96, 60, 80), C.goldPale, { sh: .3 }); for (let q = -1; q <= 1; q++) cut(rect(q * 18 - 3, -96, 6, 80), C.goldDeep, { sh: 0, grain: 0 }); cut(rect(-36, -18, 72, 16), C.goldDeep, { sh: .3 }); } // a lantern
      g.restore();
    });
  }
  // where the spotlight is, and how big
  function spot(t) {
    let x = kf3(t, [[142.48, SPOT0.x], [145.6, 540], [148.4, 540], [149.2, 300], [152.6, 300], [153.4, 700], [156.1, 700]]);
    let y = kf3(t, [[142.48, SPOT0.y], [145.6, 1060], [148.4, 1060], [149.2, 1240], [152.6, 1240], [153.4, 1330], [156.1, 1330]]);
    let r = kf3(t, [[142.48, SPOT0.r], [143.4, 260], [145.6, 300], [148.4, 300], [149.2, 240], [152.6, 240], [153.4, 220], [156.1, 220]]);
    if (t > 156.1) { // the search: wandering, then settling on the chair on "Nick" (159.0)
      const u = t - 156.1, sx = 540 + Math.sin(u * 1.9) * 300, sy = 1250 + Math.sin(u * 2.7 + 1) * 160, s = ss(158.4, 159.2, t);
      x = lerp(lerp(700, sx, ss(156.1, 156.7, t)), 530, s); y = lerp(lerp(1330, sy, ss(156.1, 156.7, t)), 1380, s); r = 220;
      // Mark Von Ulrich (guest director): the chair on stage is empty, so the light swings off the stage onto the
      // house: one seat in the front row, with only the bowler in it
      const h = ss(159.6, 160.4, t); x = lerp(x, SEAT.x, h); y = lerp(y, SEAT.y - 30, h); r = lerp(r, 170, h);
    }
    // the operator's hand is never quite still: the light breathes and drifts
    const dr = ss(142.48, 142.9, t); x += (Math.sin(t * 1.1) * 14 + Math.sin(t * 2.3) * 6) * dr; y += Math.sin(t * .9 + 1) * 10 * dr; r *= 1 + .025 * Math.sin(t * 1.7) * dr;
    if (t > 161.5) { const c = ss(161.6, 163.4, t); x = lerp(x, SUN0.x, c); y = lerp(y, SUN0.y, c); r = lerp(r, SUN0.r, c); }
    return { x, y, r };
  }
  // the dog: a hand shadow (thumb ear, fingers snout, little finger jaw), wrist rising from below
  function dogShadow(t, x, y, s, openK = 0) {
    let jaw = 0; for (const k of SNAPS) { const d = t - k; if (d > -.12 && d < .4) jaw = Math.max(jaw, d < 0 ? 1 + d / .12 : 1 - d / .4); }
    jaw = Math.max(jaw, openK * 1.4);
    g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = C.plumDeep;
    const p = new Path2D();
    p.addPath(capsule(170, 520, 60, 80, 80, 70));                          // forearm
    p.addPath(ellipse(20, 0, 130, 92, -.15));                              // the back of the hand: the head
    p.addPath(capsule(-20, -20, -190, 0, 62, 48));                         // four fingers together: the snout
    p.addPath(capsule(70, -60, 160, -180, 30, 20));                        // the thumb: one ear, up
    const jw = new Path2D(); jw.addPath(capsule(0, 0, -170, 0, 36, 30), new DOMMatrix().translate(-10, 56).rotate(jaw * 28)); p.addPath(jw); // little finger: the jaw
    g.fill(p);
    g.fillStyle = C.goldPale; g.fill(circle(-40, -40, 15));                // the eye: light between the fingers
    for (let i = 0; i < 3; i++) g.fill(poly([[-60 - i * 40, -48], [-70 - i * 40, -30], [-80 - i * 40, -48]])); // notches between the fingers
    g.fillRect(150, 420, 120, 14);                                         // the cuff's edge on the wrist
    g.restore();
  }
  function curtain(side, o, t) { // side -1 left, 1 right; o = 0 closed .. 1 open
    const half = OP.w / 2 + 40, w = lerp(half, 110, o), x0 = side < 0 ? OP.x - 40 : OP.x + OP.w + 40 - w;
    const n = 7;
    for (let i = 0; i < n; i++) {
      const fx = x0 + i * w / n, sw = Math.sin(t * .9 + i) * 4;
      cut(poly([[fx, OP.y - 60], [fx + w / n + 2, OP.y - 60], [fx + w / n + 2 + sw, FLOOR + 190], [fx + sw, FLOOR + 190]]), i % 2 ? C.plum : C.plumLight, { sh: .5, grain: .3 });
    }
    for (let i = 0; i < n; i++) for (let j = 0; j < 3; j++) { const fx = x0 + (i + .5) * w / n, fy = OP.y + 260 + j * 420 + (i % 2) * 180; if (w / n < 30) continue; g.save(); g.translate(fx, fy); cut(ellipse(0, 0, 18, 26), C.gold, { sh: .2, grain: 0 }); cut(ellipse(0, 4, 11, 16), C.teal, { sh: 0, grain: 0 }); cut(ellipse(0, 7, 5, 8), C.blue, { sh: 0, grain: 0 }); g.restore(); }
    for (let i = 0; i < Math.ceil(w / 40); i++) cut(circle(x0 + 20 + i * 40, FLOOR + 196, 16), C.gold, { sh: .3, grain: 0 });
    const tb = ss(.4, .75, o); if (tb > 0) { const tx = side < 0 ? x0 + w - 20 : x0 + 20; cut(capsule(tx - 30, 1000, tx + 30, 1040, 14), C.gold, { sh: .5, alpha: tb }); }
  }
  function costumeRail(x, y) {
    for (const sx of [-1, 1]) tendril(whipPts([x + sx * 150, y], [x + sx * 140, y + 160], [x + sx * 190, y + 260], [x + sx * 170, y + 330], 20, sx), 12, C.goldDeep, { sh: .6 });
    cut(rect(x - 160, y, 320, 12), C.gold, { sh: .6 });
    g.save(); g.translate(x, y + 10); g.rotate(Math.sin(t0 * 1.4) * .05); cut(poly([[0, 0], [-70, 50], [70, 50]]), C.goldDeep, { sh: .3 }); g.translate(0, 50); jeans(.7, Math.sin(t0 * 2.1) * .04, C.tealLight); g.restore();
  }
  let t0 = 0;
  function bentwoodChair(x, y, turn) { // three-quarter view: a hoop back, a round seat at sitting height, curved legs
    const c = Math.cos(turn), sx = c * .85 + .15 * Math.sign(c || 1);
    g.save(); g.translate(x, y); g.scale(sx, 1);
    for (const [lx, ly] of [[-60, 14], [60, 14], [-40, -10], [40, -10]]) tendril([[lx * .8, ly - 170], [lx * 1.05, ly - 80], [lx * 1.2, ly]], 12, C.goldDeep, { sh: .5 });
    cut(ellipse(0, -176, 86, 26), C.plum, { sh: .8, lift: .3 });
    cut(ellipse(0, -182, 74, 18), C.plumLight, { sh: 0, grain: .2 });
    cut(ringLace(0, -330, 56, 70), C.goldDeep, { sh: .6, rule: 'evenodd' });
    for (const s2 of [-1, 1]) cut(rect(s2 * 62 - 6, -330, 12, 160), C.goldDeep, { sh: .5 });
    tendril(whipPts([-30, -300], [-10, -340], [20, -330], [10, -300], 10, 1), 6, C.gold, { sh: 0, grain: 0 });
    g.restore();
  }
  SHOT(142.48, 165.0, 'theatre', (t, k, d) => {
    t0 = t;
    const op = ss(143.2, 145.4, t) * (1 - ss(161.5, 163.3, t)), S = spot(t);
    let z = kf3(t, [[142.48, 1.0], [148.0, 1.06], [156.0, 1.06], [159.5, 1.06], [160.4, 1.35], [161.5, 1.35], [162.6, 1.0]]);
    let cx = kf3(t, [[159.5, 540], [160.4, 700], [161.5, 700], [162.6, 540]]), cy = kf3(t, [[159.5, 1000], [160.4, 1560], [161.5, 1560], [162.6, 1000]]);
    for (const [t0p, t1p, px, py, pz] of [[150.7, 152.1, 300, 1260, 1.55], [153.3, 155.4, 700, 1430, 1.6]]) { const pk = eio(clamp((t - t0p) / .4)) * (1 - eio(clamp((t - t1p) / .5))); cx = lerp(cx, px, pk); cy = lerp(cy, py, pk); z = lerp(z, pz, pk); }
    g.save(); cam(cx, cy, z); // down to the house when the light finds the bowler; punch-ins on "pistol" and "bill"
    sheet(C.plumDeep);
    // the house: dark boxes either side
    for (const sx of [-1, 1]) for (let r = 0; r < 3; r++) { cut(archPath(540 + sx * 520 - 60, 520 + r * 420, 120, 220), C.tealInk, { sh: .4 }); archFrame(540 + sx * 520 - 60, 520 + r * 420, 120, 220, 10, C.goldDeep); }
    // inside the opening: the backdrop of dreams, the floor, the props
    g.save(); g.clip(opening());
    cut(rect(OP.x, OP.y, OP.w, FLOOR - OP.y), C.tealDeep, { sh: 0 });
    // a lace roundel for the shadow play; once the dog and dragonflies are done it sinks into the dark, so the
    // spotlit jeans and helmet read against plain backdrop, not a busy disc (draft 4)
    { const rk = 1 - .85 * ss(148.2, 149.0, t); g.save(); g.globalAlpha *= rk; halo(540, 1060, 290, t * .03, 1, [C.goldDeep, C.creamDeep, C.cream, C.goldDeep], 'lace'); g.restore(); }
    for (let i = 0; i < 14; i++) cut(star4(OP.x + 40 + hash(i * 3.1) * (OP.w - 80), OP.y + 120 + hash(i * 7.7) * 500, 10 + hash(i) * 8), C.goldPale, { sh: .2, grain: 0 });
    cut(poly([[OP.x - 40, FLOOR], [OP.x + OP.w + 40, FLOOR], [OP.x + OP.w + 120, OP.y + OP.h], [OP.x - 120, OP.y + OP.h]]), C.goldDeep, { sh: .6 });
    for (let i = 0; i < 6; i++) cut(rect(OP.x - 100, FLOOR + 20 + i * 32, OP.w + 200, 3), C.plumDeep, { sh: 0, grain: 0, alpha: .5 });
    costumeRail(300, 1150);
    { cut(ellipse(700, 1520, 80, 18), C.plum, { sh: .7 }); for (const sx of [-1, 1]) tendril(whipPts([700 + sx * 50, 1520], [700 + sx * 70, 1580], [700 + sx * 50, 1640], [700 + sx * 80, 1690], 12, sx), 9, C.goldDeep, { sh: .5 }); g.save(); g.translate(700, 1430); g.rotate(Math.sin(t * 1.2) * .02); helmet(.5, ss(153.3, 153.9, t) * (1 + .04 * Math.sin(t * 2.6))); g.restore(); }
    bentwoodChair(530, 1520, Math.max(0, t - 155.5) * .8); // empty: the bowler is in the house
    // the shadow play, inside the spotlight on the backdrop
    g.save(); g.clip(circle(S.x, S.y, S.r));
    glow(S.x, S.y, S.r, '250,220,160', .6);
    const dog = ss(143.9, 144.2, t) * (1 - ss(147.8, 148.2, t)), openK = ss(147.6, 147.9, t);
    if (dog > 0) { g.save(); g.globalAlpha *= dog; dogShadow(t, S.x + 40, S.y + 30 + (1 - ss(143.9, 144.2, t)) * 200, .9, openK); g.restore(); }
    for (let i = 0; i < 4; i++) { const tt = t - 147.75 - i * .12; if (tt < 0 || tt > 1.6) continue; g.save(); g.globalAlpha *= .9; g.filter = 'brightness(0.2)'; dragonfly(S.x - 150 - tt * 420 * (i % 2 ? -1 : 1), S.y - 120 + i * 80 + Math.sin(tt * 6) * 30, .9, .1, t * 30 + i, C.plumDeep); g.restore(); }
    g.restore();
    g.restore();
    // the curtains
    for (const side of [-1, 1]) curtain(side, op, t);
    // the dark outside the spotlight (inside the opening only, curtains included), then the light itself
    g.save(); g.clip(opening());
    const dark = new Path2D(); dark.rect(-200, -200, W + 400, H + 400); dark.arc(S.x, S.y, S.r * 1.05, 0, TAU, true);
    g.fillStyle = 'rgba(30,14,30,.7)'; g.fill(dark);
    g.globalCompositeOperation = 'screen';
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = .35 * (1 - ss(159.9, 160.3, t) * (1 - ss(161.6, 162.0, t))); g.fillStyle = C.goldPale; g.fill(circle(S.x, S.y, S.r)); g.globalAlpha = 1; g.globalCompositeOperation = 'screen';
    const beamP = poly([[540 - 30, 250], [540 + 30, 250], [S.x + S.r, S.y], [S.x - S.r, S.y]]);
    g.fillStyle = 'rgba(250,215,140,.07)'; g.fill(beamP);
    // dust turning in the beam
    g.save(); g.clip(beamP); g.globalCompositeOperation = 'source-over'; g.fillStyle = C.cream;
    for (let i = 0; i < 40; i++) { const u = hash(i * 3.3), v = (hash(i * 7.1) + t * (.02 + hash(i) * .04)) % 1; g.globalAlpha = .35 + .3 * Math.sin(t * 2 + i); g.fill(circle(lerp(540, S.x, v) + (u - .5) * lerp(60, 2 * S.r, v) + Math.sin(t + i) * 8, lerp(250, S.y, v), 2 + hash(i * 5) * 2.5)); }
    g.restore();
    g.restore();
    // the sun to come: the spotlight on the closed curtain turns gold and solid
    const sunK = ss(163.4, 165.0, t);
    if (sunK > 0) { g.save(); g.globalAlpha *= sunK; cut(circle(S.x, S.y, S.r), C.goldPale, { sh: .4 }); g.restore(); glow(S.x, S.y, S.r * 2, '250,200,120', .5 * sunK); }
    cut(poly([[OP.x - 50, OP.y - 70], [OP.x + OP.w + 50, OP.y - 70], [OP.x + OP.w + 50, OP.y + 40], ...[...Array(9).keys()].map((i) => [OP.x + OP.w + 50 - i * (OP.w + 100) / 8, OP.y + 40 + (i % 2 ? 50 : 10)]), [OP.x - 50, OP.y + 40]]), C.plum, { sh: .8, lift: .3 });
    // the proscenium: gold arch, whiplash ornament, a Mucha halo crest
    archFrame(OP.x, OP.y, OP.w, OP.h, 54, C.gold, { sh: 1.1, lift: .6 });
    for (const sx of [-1, 1]) tendril(whipPts([540 + sx * 480, 1700], [540 + sx * 520, 1200], [540 + sx * 440, 700], [540 + sx * 300, 420], 50, -sx), 22, C.goldDeep, { sh: .6 });
    halo(540, 300, 110, t * .05, 1, undefined, 'peacock'); lily(540, 330, -Math.PI / 2, 70, 1, [C.cream, C.goldPale]);
    // footlights
    for (let i = 0; i < 9; i++) { const fx = 160 + i * 95; glow(fx, 1720, 70, '250,215,140', .5); cut(blob([[fx - 26, 1736], [fx, 1700], [fx + 26, 1736]], .6), C.goldPale, { sh: .4 }); }
    cut(cutRect(-60, 1736, W + 120, 400, 501), C.plumDeep, { sh: .8 });
    const seatLit = ss(159.9, 160.4, t) * (1 - ss(161.6, 162.2, t));
    audience(t, seatLit);
    if (seatLit > 0) { g.save(); g.globalAlpha *= .4 * seatLit; g.fillStyle = C.goldPale; g.fill(ellipse(SEAT.x, 1800, 120, 90)); g.restore(); g.save(); g.globalAlpha *= seatLit; g.translate(SEAT.x, 1778); bowler(1.15); g.restore(); }
    g.restore();
    // the falling star landing: a bright disc that settles into the spotlight
    if (t < 143.0) { g.save(); g.globalAlpha *= 1 - ss(142.48, 143.0, t); g.fillStyle = C.goldPale; g.fill(circle(SPOT0.x, SPOT0.y, SPOT0.r)); g.restore(); }
  });
})();

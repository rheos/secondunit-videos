// 142.48-165.0 VERSE 3 AGAIN: an empty Nouveau theatre. Opens on the spotlight on the closed curtain (the falling
// star). The curtains part (143.2-145.4). "a hundred bad dreams": in the spotlight a hand shadow makes a dog whose
// jaw snaps on the words, then dragonfly shadows cross it. "pistol in his jeans" (148.7-152.5) the spotlight finds
// jeans on a costume rail; "paladin's hat" (152.9-156.1) the helmet on a stool, the note it swallowed on the avenue
// inside it: it spits the note out (Gilliam 9A). "nobody's sure where Mr. Knickerbocker's at" (156.1-161.5) the
// spotlight hunts the falling note, gives up on an empty chair turning slowly, then swings off the stage onto the
// house: the note lands on the top hat in the front row, and one seat along there is only the bowler. The curtains
// close (161.5-163.3); the spotlight left on the curtain turns gold and solid: it becomes the rising sun.
// Draft 4: the stage is dark outside the beam, so the light does every reveal; each spotlit thing sits on a third
// and the camera moves on the beats; the centre is kept for the two disc hand-offs.
const SUN0 = { x: 540, y: 1100, r: 200 };
(() => {
  const OP = { x: 110, y: 330, w: 860, h: 1380 }, FLOOR = 1520;
  const opening = () => archPath(OP.x, OP.y, OP.w, OP.h);
  const KEEP = 143.48; // the falling star's match cut: spot and camera exactly as in draft 3 until here
  // the dog's jaw on the sung words (vocal stem onsets): said, steam, hundred, bad (a small one), dreams (the big one)
  const SNAPS = [[143.62, .8], [144.1, 1], [146.68, 1], [147.4, .5], [147.9, 1.35]];
  const EAR_BEATS = [144.33, 145.37, 146.43, 147.4];
  // where things stand (world): the dog's screen on the left third, the jeans on the right, the helmet on the
  // left, the empty chair in the middle, the front row below the stage lip
  const DOG = { x: 380, y: 960 }, RAIL = { x: 790, y: 1150 }, STOOL = { x: 250, y: 1520 }, CHAIR = { x: 540, y: 1610 }; // the chair downstage, below every spot's reach
  const HELM = { x: STOOL.x, y: 1425, s: .6 };
  const SEATS = [140, 290, 440, 590, 740, 890], SEAT = { x: 740, y: 1800 }, HAT = { x: 590, y: 1622 }; // HAT: top of the top hat
  const GRIP = false; // props.js jeans() now draws the dark revolver grip itself (b4); true would draw a second one

  // ---- Gilliam 9A: the note. "bill": a corner pokes out of the helmet's jaw; "inside": slurped back; "hat": spat
  // out. It flutters down through the hunting light, past the empty chair, off the stage lip, and lands on the top
  // hat in the front row on "same"
  const SPIT = 155.6, LAND = 159.88;
  const NX = [[156.07, 290], [156.57, 600], [157.07, 860], [157.6, 740], [158.13, 860], [158.63, 630], [159.13, 660], [159.55, 610], [LAND, HAT.x]];
  const NY = [[156.07, 860], [156.57, 880], [157.07, 950], [157.6, 1030], [158.13, 1110], [158.63, 1330], [159.13, 1480], [159.55, 1580], [LAND, HAT.y + 2]];
  function notePos(t) {
    if (t < SPIT) return null;
    if (t < 156.07) { const p = eo((t - SPIT) / .47); return { x: lerp(HELM.x + 6, 290, p), y: lerp(HELM.y + 40, 860, p), rot: lerp(-.5, 2.6, p), fl: 1 }; } // straight up: it throws its head back
    if (t < LAND) { const vx = (kf3(t + .03, NX) - kf3(t - .03, NX)) / .06; return { x: kf3(t, NX), y: kf3(t, NY), rot: TAU + clamp(vx / 700, -1, 1) * .55, fl: .55 + .45 * Math.cos((t - 156.07) * 6.5) }; }
    return { x: HAT.x, y: HAT.y + 2, rot: .1, fl: 1 };
  }
  function banknote(s) { // a plain banknote, no numbers (as the helmet's): cream paper, teal panel, gold oval portrait
    g.save(); g.scale(s, s); g.translate(-105, 0);
    cut(rrect(0, -48, 210, 96, 6), C.cream, { sh: .7, lift: .3 });
    cut(rrect(10, -38, 190, 76, 4), C.tealLight, { sh: 0, grain: .3, alpha: .8 });
    cut(ellipse(105, 0, 30, 30), C.gold, { sh: 0, grain: .2 }); cut(ellipse(105, -2, 13, 17), C.plum, { sh: 0, grain: 0 });
    for (const sx of [-1, 1]) cut(circle(105 + sx * 70, 0, 10), C.goldPale, { sh: 0, grain: 0 });
    g.restore();
  }
  // how much of the beam falls on a point (1 inside, 0 outside, a soft rim)
  const litAt = (S, x, y) => 1 - ss(S.r * .85, S.r * 1.05, Math.hypot(x - S.x, y - S.y));

  // ---- where the spotlight is, and how big
  function spot(t) {
    let x, y, r;
    if (t < KEEP) { // draft 3's path, untouched, through the match cut
      x = kf3(t, [[142.48, SPOT0.x], [145.6, 540]]); y = kf3(t, [[142.48, SPOT0.y], [145.6, 1060]]); r = kf3(t, [[142.48, SPOT0.r], [143.4, 260], [145.6, 300]]);
    } else {
      const y0 = kf3(KEEP, [[142.48, SPOT0.y], [145.6, 1060]]), r0 = kf3(KEEP, [[142.48, SPOT0.r], [143.4, 260], [145.6, 300]]), x0 = kf3(KEEP, [[142.48, SPOT0.x], [145.6, 540]]);
      x = kf3(t, [[KEEP, x0], [145.37, DOG.x], [155.6, DOG.x]]); y = kf3(t, [[KEEP, y0], [143.95, 985], [145.37, DOG.y], [155.6, DOG.y]]); r = kf3(t, [[KEEP, r0], [143.95, 245], [145.37, 270], [155.6, 270]]); // up off the chair as the curtains part
      // the swings from the dog to the jeans and from the jeans to the helmet: the operator lifts the beam, crosses
      // high and drops it onto the next thing, so the chair stays dark until "Mr."
      const swing = (a, b2, A, B, ra, rb, lift) => { if (t <= a) return; const e = eio((t - a) / (b2 - a)), u = ss(.15, .85, e);
        x = lerp(A.x, B.x, u); y = lerp(A.y, B.y, e) - lift * ss(0, .3, e) * (1 - ss(.7, 1, e)); r = lerp(ra, rb, e); };
      swing(148.43, 149.4, DOG, { x: RAIL.x, y: 1300 }, 270, 215, 330);
      swing(152.5, 153.25, { x: RAIL.x, y: 1300 }, { x: HELM.x - 5, y: 1360 }, 215, 175, 430);
    }
    if (t > 155.6) {
      // the hunt: it chases the falling note, a beat behind and overshooting (high over the chair, down the right side)
      const n = notePos(Math.max(SPIT + .05, Math.min(LAND, t - .3 * ss(156.0, 156.6, t)))), u = t - 155.6, wob = ss(155.6, 156.3, t) * (1 - ss(157.8, 158.13, t));
      const h0 = ss(155.6, 155.85, t); x = lerp(x, n.x + (Math.sin(u * 2.3) * 80 + 30) * wob, h0); y = lerp(y, n.y - 20 + Math.sin(u * 3.1 + 1) * 50 * wob, h0); r = lerp(r, lerp(160, 195, ss(156.1, 156.6, t)), h0);
      // on "Mr." it gives up on the note and lands on the empty chair
      const c = ss(158.13, 158.55, t); x = lerp(x, CHAIR.x + 24, c); y = lerp(y, 1436, c); r = lerp(r, 180, c);
      // Mark Von Ulrich (guest director): the chair on stage is empty, so on "same" the light swings off the stage onto
      // the house: the note landing on the top hat, then one seat along, only the bowler
      const h1 = ss(159.55, 159.9, t); x = lerp(x, HAT.x, h1); y = lerp(y, 1700, h1); r = lerp(r, 160, h1);
      const h2 = ss(160.1, 160.5, t); x = lerp(x, SEAT.x, h2); y = lerp(y, SEAT.y - 30, h2); r = lerp(r, 170, h2);
    }
    // the operator's hand is never quite still: the light breathes and drifts
    const dr = ss(142.48, 142.9, t); x += (Math.sin(t * 1.1) * 14 + Math.sin(t * 2.3) * 6) * dr; y += Math.sin(t * .9 + 1) * 10 * dr; r *= 1 + .025 * Math.sin(t * 1.7) * dr;
    if (t > 161.5) { const c = ss(161.6, 163.4, t); x = lerp(x, SUN0.x, c); y = lerp(y, SUN0.y, c); r = lerp(r, SUN0.r, c); }
    return { x, y, r };
  }

  // ---- the dog: a hand shadow cast in the spotlight (d4: the audit read the old one as a unicorn). The hand in
  // profile: four fingers together are the snout, the little finger below is the jaw, the thumb bent back is a
  // floppy ear, the back of the hand is the head; the forearm and a frilled cuff rise from below the light
  function dogShadow(t, x, y, s, rise) {
    let jaw = 0;
    for (const [k, a] of SNAPS) { const d = t - k; if (d > -.06 && d < .4) jaw = Math.max(jaw, a * (d < 0 ? 1 + d / .06 : d < .1 ? 1 : 1 - ss(.1, .34, d))); }
    let tw = 0; for (const b of EAR_BEATS) tw += bump(t, b, .3);
    const lunge = bump(t, 147.84, .5);
    g.save(); g.translate(x - 22 * lunge, y + (1 - rise) * 560 * s); g.scale(s, s);
    g.rotate(-.09 * Math.min(1, jaw) + Math.sin(t * 2.2) * .025);
    const p = new Path2D(), M = (tr, q) => p.addPath(q, tr); // every part wound clockwise, so one fill makes one silhouette
    p.addPath(capsule(80, 60, 200, 300, 66, 80));                                                                       // the wrist
    p.addPath(poly([[96, 150], [128, 128], [160, 148], [192, 124], [224, 146], [256, 126], [282, 150], [340, 400], [140, 420]])); // the frilled cuff, in the light
    p.addPath(blob([[-50, -70], [10, -96], [90, -92], [140, -40], [146, 30], [110, 80], [30, 92], [-50, 60]], .55));    // back of the hand: the head
    p.addPath(blob([[-196, -54], [-120, -70], [-30, -84], [-20, 30], [-110, 22], [-196, 14], [-218, -20]], .45));       // four fingers: the snout
    p.addPath(circle(-204, -32, 27));                                                                                  // the nose
    M(new DOMMatrix().translate(36, -88).rotate(tw * 8 - 4).translate(-36, 88), blob([[-4, -84], [14, -150], [56, -188], [102, -180], [98, -130], [76, -88]], .55)); // thumb: the ear, tipped back
    M(new DOMMatrix().translate(-6, 46).rotate(-jaw * 30), blob([[-176, 36], [-90, 30], [10, 28], [14, 70], [-90, 62], [-170, 58], [-186, 48]], .45)); // little finger: the jaw
    g.fillStyle = C.plumDeep; g.fill(p);
    g.fillStyle = C.goldPale; g.fill(ellipse(-70, -40, 14, 9, -.15)); // the eye: light between the fingers
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
  // the pistol grip, drawn over the one jeans() draws, in its frame: a dark curved butt with checkered cuts, a gold
  // butt cap and trigger guard (the audit: the cream grip read as a luggage tag)
  function pistolGrip() { // the revolver's back half out of the pocket; it covers the whole footprint of jeans()'s cream grip
    cut(blob([[-20, -26], [-24, -60], [-22, -98], [0, -110], [34, -106], [50, -96], [50, -76], [32, -58], [26, -26]], .4), C.plumDeep, { sh: .8, lift: .3 }); // the butt
    g.save(); g.clip(rect(-14, -96, 40, 60)); g.globalAlpha *= .7; g.strokeStyle = C.goldDeep; g.lineWidth = 2; g.beginPath(); // checkered cuts
    for (let i = -4; i <= 4; i++) { g.moveTo(-20 + i * 12, -30); g.lineTo(20 + i * 12, -100); g.moveTo(20 + i * 12, -30); g.lineTo(-20 + i * 12, -100); } g.stroke(); g.restore();
    cut(rrect(-24, -116, 76, 16, 7), C.gold, { sh: .3 });                                    // butt cap
    cut(poly([[24, -46], [48, -64], [54, -54], [32, -34]]), C.plumDeep, { sh: .5 });         // the hammer spur
    cut(rrect(-28, -32, 84, 40, 9), C.plumDeep, { sh: .7, lift: .3 });                       // the frame
    cut(circle(16, -14, 18), C.plum, { sh: .4 }); for (let i = -1; i <= 1; i++) cut(rect(14 + i * 9, -28, 3, 28), C.goldDeep, { sh: 0, grain: 0 }); // cylinder
    cut(ringLace(36, 12, 10, 17), C.gold, { sh: .4, rule: 'evenodd' });                      // trigger guard
  }
  function costumeRail(t, S) {
    const { x, y } = RAIL;
    for (const sx of [-1, 1]) tendril(whipPts([x + sx * 124, y], [x + sx * 116, y + 160], [x + sx * 160, y + 260], [x + sx * 142, y + 330], 18, sx), 12, C.goldDeep, { sh: .6 });
    cut(rect(x - 134, y, 268, 12), C.gold, { sh: .6 });
    g.save(); g.translate(x, y + 10); g.rotate(Math.sin(t * 1.4) * .05); cut(poly([[0, 0], [-70, 50], [70, 50]]), C.goldDeep, { sh: .3 }); g.translate(0, 50);
    const sw = Math.sin(t * 2.1) * .04; jeans(.7, sw, C.tealDeep); // dark teal on the cream flat (d3: teal on a teal beam lost them)
    if (GRIP && Math.hypot(S.x - x - 36, S.y - y - 110) < S.r + 120) { g.save(); g.scale(.7, .7); g.rotate(sw); g.translate(52, 70); g.rotate(-.5); pistolGrip(); g.restore(); }
    g.restore();
  }
  // the paladin's helmet with its lower plate as a jaw: drawn twice with helmet(s, 0), split at the visor line, the
  // lower half dropped (so it works with any helmet() drawing). lit > 0 adds a dark keyline so the cream helm reads
  function paladin(t, lit) {
    const peek = ss(153.47, 153.62, t) * (1 - ss(154.0, 154.12, t)), drop = ss(155.42, 155.58, t) * (1 - ss(155.95, 156.07, t));
    const jaw = Math.max(.35 * peek, drop), hop = bump(t, 155.5, .5), s = HELM.s, HG = 30 * s, OPEN = 80 * s; // split under the lower visor slit
    const helm = () => { g.save(); g.scale(-1, 1); helmet(s, 0); g.restore(); }; // mirrored, so the plume curls into the light, not under the left curtain
    g.save(); g.translate(HELM.x, HELM.y - 24 * hop); g.rotate(Math.sin(t * 1.2) * .02 - .15 * hop); // it throws its head back to spit
    if (lit > .02) { g.save(); g.filter = 'brightness(0.12)'; g.globalAlpha *= lit; g.scale(1.07, 1.07); helm(); g.restore(); } // keyline (and the dark of the mouth)
    if (peek > 0) { g.save(); g.translate(52 * s, HG + 10 * s); g.rotate(.22); g.translate(lerp(-40, 70, peek) * s, 0); banknote(s); g.restore(); } // on "bill" a corner shows
    if (jaw > 0) { cut(rrect(-100 * s, HG - 8 * s, 200 * s, 16 * s + jaw * OPEN, 10 * s), C.plumDeep, { sh: 0, grain: 0 }); // the dark inside the mouth
      g.save(); g.globalAlpha *= .7 * drop; cut(ellipse(0, HG + jaw * OPEN * .55, 60 * s, jaw * OPEN * .3), C.plum, { sh: 0, grain: 0 }); g.restore(); }
    if (jaw <= 0) helm();
    else for (const top of [true, false]) { // split only while the jaw is open
      g.save();
      if (!top) { g.translate(0, jaw * OPEN); g.rotate(jaw * .06); }
      g.clip(top ? rect(-700, -900, 1400, 900 + HG) : rect(-700, HG, 1400, 900));
      helm();
      g.restore();
    }
    g.restore();
  }
  // a bentwood chair (Thonet's No. 14) built on a seat circle seen from just above, so a turn reads as a turn,
  // not a squash (d4: the audit couldn't find the old chair or its turn). Gold wood with a plum keyline, plum seat
  // with a cream rim. turn = radians about the upright axis
  function bentwoodChair(x, y, s, turn) {
    const R = 92, SY = -190, TL = .3, P = (a, r, h) => [Math.cos(a) * r, h + Math.sin(a) * r * TL];
    const wood = (pts, w) => { tendril(pts, w + 9, C.plumDeep, { sh: .6, grain: 0 }); tendril(pts, w, C.goldDeep, { sh: 0, grain: .15 }); tendril(pts, w * .35, C.gold, { sh: 0, grain: 0 }); };
    const ring = (h, rr, col, w) => { g.save(); g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.ellipse(0, h, rr, rr * TL, 0, 0, TAU); g.stroke(); g.restore(); };
    g.save(); g.translate(x, y); g.scale(s, s);
    const b = turn - Math.PI / 2; // the back of the chair, on the far side of the seat
    const rod = (a) => whipPts(P(a, R * 1.12, 0), P(a, R * .88, SY * .6), P(a, R * 1.02, SY - 90), P(a, R * 1.1, SY - 160), 0, 1, 18); // rear foot up into the back
    const arch = (l, r2, up, n = 16) => { const o = []; for (let i = 1; i < n; i++) { const u = i / n; o.push([lerp(l[0], r2[0], u), lerp(l[1], r2[1], u) - Math.sqrt(Math.sin(Math.PI * u)) * up]); } return o; };
    const Lr = rod(b - .9), Rr = rod(b + .9);
    wood([...Lr, ...arch(Lr[Lr.length - 1], Rr[Rr.length - 1], 80), ...Rr.slice().reverse()], 14); // the round hoop back
    const il = P(b - .5, R * .97, SY - 10), ir = P(b + .5, R * .97, SY - 10), ilt = [il[0], il[1] - 120], irt = [ir[0], ir[1] - 120];
    wood([il, [il[0], il[1] - 60], ilt, ...arch(ilt, irt, 46, 12), irt, [ir[0], ir[1] - 60], ir], 8); // the small inner hoop
    const mid = [(ilt[0] + irt[0]) / 2, (ilt[1] + irt[1]) / 2 - 46];
    tendril(whipPts([mid[0] - 30, mid[1] + 50], [mid[0] - 10, mid[1] + 6], [mid[0] + 22, mid[1] + 14], [mid[0] + 10, mid[1] + 44], 10, 1), 6, C.gold, { sh: 0, grain: 0 });
    ring(SY * .4, R * .86, C.plumDeep, 14); ring(SY * .4, R * .86, C.goldDeep, 8);
    for (const a of [turn + Math.PI / 2 - .75, turn + Math.PI / 2 + .75]) wood(whipPts(P(a, R * .82, SY + 6), P(a, R * .9, SY * .6), P(a, R, SY * .3), P(a, R * 1.14, 0), 0, 1, 14), 13);
    cut(ellipse(0, SY + 12, R, R * TL), C.plumDeep, { sh: .8, lift: .3 });
    cut(ellipse(0, SY, R, R * TL), C.plum, { sh: 0, grain: .2 });
    g.save(); g.strokeStyle = C.cream; g.lineWidth = 5; g.beginPath(); g.ellipse(0, SY, R - 3, R * TL - 2, 0, 0, TAU); g.stroke(); g.restore();
    cut(ellipse(0, SY, R * .72, R * TL * .72), C.plumLight, { sh: 0, grain: .25 });
    g.restore();
  }
  // the house, front row: theatre seats seen from behind (plum backs, gold rims, buttons, gold arm scrolls), the
  // film's leftovers sitting in them as its audience. Drawn into its own sheet so the dark and the beam can light it
  // nothing in the house moves, so it is cut once into its own sheet (world y from HY) and laid in each frame
  const HOUSE = document.createElement('canvas'), HY = 1580; HOUSE.width = W; HOUSE.height = 560; let houseCut = false;
  function houseSheet() { if (!houseCut) { const gg = g; g = HOUSE.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, -HY); house(); g = gg; houseCut = true; } return HOUSE; }
  function house() {
    for (let i = 0; i <= SEATS.length; i++) { const ax = 65 + i * 150; tendril(whipPts([ax, 2000], [ax - 2, 1910], [ax + 6, 1862], [ax - 14, 1846], 13, -1), 13, C.goldDeep, { sh: .6 }); cut(circle(ax, 1996, 12), C.gold, { sh: .3, grain: 0 }); }
    SEATS.forEach((x, i) => {
      cut(rrect(x - 68, 1766, 136, 240, [52, 52, 8, 8]), C.goldDeep, { sh: .9, lift: .3 });
      cut(rrect(x - 62, 1772, 124, 236, [46, 46, 6, 6]), C.plum, { sh: 0, grain: .25 });
      cut(rrect(x - 46, 1794, 92, 196, [34, 34, 4, 4]), C.plumDeep, { sh: 0, grain: .25 });
      for (const bx of [-24, 0, 24]) cut(circle(x + bx, 1866, 5), C.plumLight, { sh: 0, grain: 0 });
      g.save(); g.translate(x, 1770);
      if (i === 0) { cut(blob([[-80, 0], [-60, -50], [0, -64], [60, -50], [80, 0]], .6), C.plum, { sh: .4 }); cut(blob([[-10, 4], [80, 0], [110, 14], [30, 20]], .6), C.tealInk, { sh: .3 }); }
      else if (i === 1) { cut(blob([[-56, -10], [-70, 40], [-76, 170], [-40, 176], [-30, 60], [30, 60], [40, 176], [76, 170], [70, 40], [56, -10], [0, -30]], .4), C.plum, { sh: .4 }); for (const sx of [-1, 1]) cut(poly([[0, -26], [sx * 34, -10], [sx * 10, 70]]), C.cream, { sh: .2 }); } // a jacket over the seat
      else if (i === 2) { for (const sx of [-1, 1]) cut(ringLace(sx * 34, -26, 22, 30), C.goldDeep, { sh: .3, rule: 'evenodd' }); cut(rect(-10, -30, 20, 6), C.goldDeep, { sh: 0 }); }
      else if (i === 3) { g.translate(0, -4); g.scale(.7, .7); cut(ellipse(0, 0, 120, 24), C.plumDeep, { sh: .3 }); cut(blob([[-70, -6], [-78, -190], [60, -206], [78, -190], [70, -6]], .3), C.plumDeep, { sh: .3 }); cut(rect(-72, -54, 144, 30), C.gold, { sh: .2 }); }
      else if (i === 4) { g.translate(0, 8); bowler(1.15); }
      else { cut(ringLace(0, -128, 10, 18), C.goldDeep, { sh: 0, rule: 'evenodd' }); cut(blob([[-40, -110], [40, -110], [30, -96], [-30, -96]], .4), C.goldDeep, { sh: .3 }); cut(rect(-30, -96, 60, 80), C.goldPale, { sh: .3 }); for (let q = -1; q <= 1; q++) cut(rect(q * 18 - 3, -96, 6, 80), C.goldDeep, { sh: 0, grain: 0 }); cut(rect(-36, -18, 72, 16), C.goldDeep, { sh: .3 }); } // a lantern
      g.restore();
    });
  }

  const PUNCH = [[147.5, 148.25, 440, 985, 1.46], [150.7, 152.1, 725, 1305, 1.55], [153.3, 155.4, 350, 1395, 1.6]]; // "dreams", "pistol", "bill"
  SHOT(142.48, 165.0, 'theatre', (t, k, d) => {
    const op = ss(143.2, 145.4, t) * (1 - ss(161.5, 163.3, t)), S = spot(t), note = notePos(t);
    let z, cx, cy;
    if (t < KEEP) { z = kf3(t, [[142.48, 1.0], [148.0, 1.06]]); cx = 540; cy = 1000; }
    else {
      // between reveals the lit thing sits on a third; the moves start on the beats
      const z0 = kf3(KEEP, [[142.48, 1.0], [148.0, 1.06]]);
      z = kf3(t, [[KEEP, z0], [145.37, 1.08], [147.4, 1.12], [148.43, 1.12], [149.47, 1.1], [150.47, 1.13], [152.53, 1.14], [153.25, 1.12], [156.07, 1.14], [158.63, 1.12], [159.5, 1.12], [160.4, 1.35], [161.5, 1.35], [162.6, 1.0]]);
      cx = kf3(t, [[KEEP, 540], [145.37, 520], [147.4, 505], [148.43, 505], [149.47, 600], [150.47, 615], [152.53, 625], [153.25, 460], [156.07, 470], [158.63, 400], [159.5, 400], [160.4, 640], [161.5, 640], [162.6, 540]]);
      cy = kf3(t, [[KEEP, 1000], [145.37, 990], [147.4, 995], [148.43, 995], [149.47, 1080], [150.47, 1095], [152.53, 1100], [153.25, 1150], [156.07, 1100], [158.63, 1000], [159.5, 1000], [160.4, 1560], [161.5, 1560], [162.6, 1000]]);
      if (note && t < 158.6) { const fk = ss(155.9, 156.4, t) * (1 - ss(157.9, 158.5, t)); cx = lerp(cx, 470 + (note.x - 550) * .6, fk); cy = lerp(cy, 1080 + (note.y - 1130) * .5, fk); } // following the note
      for (const [a, b2, px, py, pz] of PUNCH) { const pk = eio(clamp((t - a) / .4)) * (1 - eio(clamp((t - b2) / .5))); cx = lerp(cx, px, pk); cy = lerp(cy, py, pk); z = lerp(z, pz, pk); }
    }
    const washK = clamp(1 - ss(148.2, 149.0, t) + ss(161.6, 162.0, t)), poolK = 1 - washK; // goldPale wash on the curtain and the shadow play; the lit stage between
    const darkA = .7 + .2 * ss(143.5, 144.1, t) * (1 - ss(161.6, 162.4, t)); // d4: everything outside the beam darker, so only the light reveals
    g.save(); cam(cx, cy, z); // down to the house when the light finds the bowler; punch-ins on "dreams", "pistol" and "bill"
    sheet(C.plumDeep);
    // the house: dark boxes either side
    for (const sx of [-1, 1]) for (let r = 0; r < 3; r++) { cut(archPath(540 + sx * 520 - 60, 520 + r * 420, 120, 220), C.tealInk, { sh: .4 }); archFrame(540 + sx * 520 - 60, 520 + r * 420, 120, 220, 10, C.goldDeep); }
    // inside the opening: the backdrop of dreams, the floor, the props
    g.save(); g.clip(opening());
    cut(rect(OP.x, OP.y, OP.w, FLOOR - OP.y), C.tealDeep, { sh: 0 });
    if (poolK > 0) { g.save(); g.globalAlpha *= .7 * poolK; g.fillStyle = C.tealLight; g.fill(circle(S.x, S.y, S.r)); g.restore(); } // where the beam falls the backdrop is lit
    // a lace roundel for the shadow play; once the dog and dragonflies are done it sinks into the dark, so the
    // spotlit jeans and helmet read against plain backdrop, not a busy disc (draft 4)
    { const rk = 1 - .85 * ss(148.2, 149.0, t); g.save(); g.globalAlpha *= rk; halo(DOG.x, DOG.y, 240, t * .03, 1, [C.goldDeep, C.creamDeep, C.cream, C.goldDeep], 'lace'); g.restore(); }
    for (let i = 0; i < 14; i++) cut(star4(OP.x + 40 + hash(i * 3.1) * (OP.w - 80), OP.y + 120 + hash(i * 7.7) * 500, 10 + hash(i) * 8), C.goldPale, { sh: .2, grain: 0 });
    // a painted cream flat behind the costume rail, so the beam on the jeans is warm and they stand out
    cut(archPath(RAIL.x - 140, 990, 280, 530), C.creamDeep, { sh: .5 }); archFrame(RAIL.x - 140, 990, 280, 530, 10, C.goldDeep, { sh: .4 });
    tendril(whipPts([RAIL.x - 110, 1500], [RAIL.x - 120, 1300], [RAIL.x - 60, 1120], [RAIL.x + 10, 1060], 22, 1), 10, C.gold, { sh: .2 });
    cut(poly([[OP.x - 40, FLOOR], [OP.x + OP.w + 40, FLOOR], [OP.x + OP.w + 120, OP.y + OP.h], [OP.x - 120, OP.y + OP.h]]), C.goldDeep, { sh: .6 });
    for (let i = 0; i < 6; i++) cut(rect(OP.x - 100, FLOOR + 20 + i * 32, OP.w + 200, 3), C.plumDeep, { sh: 0, grain: 0, alpha: .5 });
    costumeRail(t, S);
    { cut(ellipse(STOOL.x, STOOL.y, 80, 18), C.plum, { sh: .7 }); for (const sx of [-1, 1]) tendril(whipPts([STOOL.x + sx * 50, STOOL.y], [STOOL.x + sx * 70, STOOL.y + 60], [STOOL.x + sx * 50, STOOL.y + 120], [STOOL.x + sx * 80, STOOL.y + 170], 12, sx), 9, C.goldDeep, { sh: .5 });
      paladin(t, litAt(S, HELM.x, HELM.y - 40)); }
    // empty: the bowler is in the house. It starts to turn on its own as the light lands on it ("Mr.")
    bentwoodChair(CHAIR.x, CHAIR.y, .82, -.35 + .62 * eio(clamp((t - 158.13) / 1.4)) + .03 * Math.sin(t * 3.1) * ss(158.13, 158.5, t));
    // the light on the backdrop and the dragonflies' shadows, inside the spotlight
    g.save(); g.clip(circle(S.x, S.y, S.r));
    glow(S.x, S.y, S.r, '250,220,160', .6);
    for (let i = 0; i < 4; i++) { const tt = t - 147.75 - i * .12; if (tt < 0 || tt > 1.6) continue; g.save(); g.globalAlpha *= .9; g.filter = 'brightness(0.2)'; dragonfly(S.x - 150 - tt * 420 * (i % 2 ? -1 : 1), S.y - 120 + i * 80 + Math.sin(tt * 6) * 30, .9, .1, t * 30 + i, C.plumDeep); g.restore(); }
    g.restore();
    g.restore();
    // the curtains
    for (const side of [-1, 1]) curtain(side, op, t);
    // the dog: a shadow falls on whatever the light hits, so it is cast on the closing curtain as well as the backdrop
    { const rise = eo(clamp((t - 143.36) / .26)) * (1 - ei(clamp((t - 148.05) / .4)));
      if (rise > 0 && t < 148.5) { g.save(); g.clip(opening()); g.clip(circle(S.x, S.y, S.r)); dogShadow(t, S.x + 40, S.y + 20, .95, rise); g.restore(); } }
    // the dark outside the spotlight (inside the opening only, curtains included), then the light itself
    g.save(); g.clip(opening());
    const dark = new Path2D(); dark.rect(-200, -200, W + 400, H + 400); dark.arc(S.x, S.y, S.r * 1.05, 0, TAU, true);
    g.fillStyle = `rgba(30,14,30,${darkA})`; g.fill(dark);
    const onHouse = ss(159.55, 159.8, t) * (1 - ss(161.6, 161.8, t)); // the beam is on the front row: the stage behind it stays dark
    if (onHouse > 0) { g.save(); g.globalAlpha *= onHouse; g.fill(circle(S.x, S.y, S.r * 1.05)); g.restore(); }
    g.globalAlpha = .35 * washK; g.fillStyle = C.goldPale; g.fill(circle(S.x, S.y, S.r)); g.globalAlpha = 1;
    if (poolK > 0) { g.save(); g.globalAlpha = .3 * poolK; g.strokeStyle = C.goldPale; g.lineWidth = 4; g.beginPath(); g.arc(S.x, S.y, S.r * 1.02, 0, TAU); g.stroke(); g.restore(); } // the beam's hard edge
    g.globalCompositeOperation = 'screen';
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
    // the front row: in the dark until the beam swings onto it, then lit only where it falls (d3: the bowler showed
    // from the first frame, and a pale disc under it read as a basin)
    { const HS = houseSheet(); g.save(); g.filter = 'brightness(0.3)'; g.drawImage(HS, 0, HY); g.restore();
      if (S.y + S.r > OP.y + OP.h) { g.save(); g.clip(rect(-200, OP.y + OP.h, W + 400, 900)); g.globalCompositeOperation = 'screen'; g.fillStyle = 'rgba(250,215,140,.07)'; // the beam carries on down into the house
        g.fill(poly([[540 - 30, 250], [540 + 30, 250], [S.x + S.r, S.y], [S.x - S.r, S.y]])); g.restore(); }
      if (S.y + S.r > 1640) { g.save(); g.clip(circle(S.x, S.y, S.r)); g.drawImage(HS, 0, HY); glow(S.x, S.y, S.r * 1.05, '250,220,160', .45);
        // the beam from above catches the bowler's crown: a rim of light so the dark hat reads on the dark seat
        const rim = ss(160.1, 160.5, t) * (1 - ss(161.6, 162.2, t));
        if (rim > 0) { g.save(); g.translate(SEAT.x, 1778); g.scale(1.15, 1.15); g.clip(rect(-90, -130, 180, 86)); const cr = new Path2D(); cr.moveTo(-70, -4); cr.bezierCurveTo(-74, -120, 74, -120, 70, -4);
          g.globalAlpha *= .8 * rim; g.strokeStyle = C.goldPale; g.lineWidth = 6; g.lineCap = 'round'; g.stroke(cr); g.restore(); }
        g.restore(); } }
    // the note in flight and on the top hat, lit only by the beam
    if (note) { const nl = litAt(S, note.x, note.y); g.save(); g.translate(note.x, note.y); g.rotate(note.rot); g.scale(1, note.fl); if (nl < .99) g.filter = `brightness(${lerp(.3, 1, nl).toFixed(3)})`; banknote(HELM.s); g.restore(); }
    g.restore();
    // the falling star landing: a bright disc that settles into the spotlight
    if (t < 143.0) { g.save(); g.globalAlpha *= 1 - ss(142.48, 143.0, t); g.fillStyle = C.goldPale; g.fill(circle(SPOT0.x, SPOT0.y, SPOT0.r)); g.restore(); }
  });
})();

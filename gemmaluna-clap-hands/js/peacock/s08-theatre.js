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
  // where the spotlight is, and how big
  function spot(t) {
    let x = kf3(t, [[142.48, SPOT0.x], [145.6, 540], [148.4, 540], [149.2, 300], [152.6, 300], [153.4, 700], [156.1, 700]]);
    let y = kf3(t, [[142.48, SPOT0.y], [145.6, 1060], [148.4, 1060], [149.2, 1240], [152.6, 1240], [153.4, 1330], [156.1, 1330]]);
    let r = kf3(t, [[142.48, SPOT0.r], [143.4, 260], [145.6, 300], [148.4, 300], [149.2, 240], [152.6, 240], [153.4, 220], [156.1, 220]]);
    if (t > 156.1) { // the search: wandering, then settling on the chair on "Nick" (159.0)
      const u = t - 156.1, sx = 540 + Math.sin(u * 1.9) * 300, sy = 1250 + Math.sin(u * 2.7 + 1) * 160, s = ss(158.4, 159.2, t);
      x = lerp(lerp(700, sx, ss(156.1, 156.7, t)), 540, s); y = lerp(lerp(1330, sy, ss(156.1, 156.7, t)), 1320, s); r = 220;
    }
    // the operator's hand is never quite still: the light breathes and drifts
    x += Math.sin(t * 1.1) * 14 + Math.sin(t * 2.3) * 6; y += Math.sin(t * .9 + 1) * 10; r *= 1 + .025 * Math.sin(t * 1.7);
    if (t > 161.5) { const c = ss(161.6, 163.4, t); x = lerp(x, SUN0.x, c); y = lerp(y, SUN0.y, c); r = lerp(220, SUN0.r, c); }
    return { x, y, r };
  }
  // the dog: a hand shadow (thumb ear, fingers snout, little finger jaw), wrist rising from below
  function dogShadow(t, x, y, s) {
    let jaw = 0; for (const k of SNAPS) { const d = t - k; if (d > -.12 && d < .4) jaw = Math.max(jaw, d < 0 ? 1 + d / .12 : 1 - d / .4); }
    g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = C.plumDeep;
    const p = new Path2D();
    p.addPath(capsule(170, 520, 60, 80, 80, 70));
    p.addPath(ellipse(20, 0, 130, 92, -.15));
    p.addPath(capsule(-20, -20, -190, 0, 62, 48));
    p.addPath(capsule(60, -60, 150, -170, 34, 22));
    p.addPath(capsule(20, -70, 80, -170, 26, 18));
    const jw = new Path2D(); jw.addPath(capsule(0, 0, -170, 0, 36, 30), new DOMMatrix().translate(-10, 56).rotate(jaw * 28));
    p.addPath(jw);
    g.fill(p);
    g.fillStyle = C.goldPale; g.fill(circle(-40, -40, 15));
    g.restore();
  }
  function curtain(side, o, t) { // side -1 left, 1 right; o = 0 closed .. 1 open
    const half = OP.w / 2 + 40, w = lerp(half, 110, o), x0 = side < 0 ? OP.x - 40 : OP.x + OP.w + 40 - w;
    const n = 7;
    for (let i = 0; i < n; i++) {
      const fx = x0 + i * w / n, sw = Math.sin(t * .9 + i) * 4;
      cut(poly([[fx, OP.y - 60], [fx + w / n + 2, OP.y - 60], [fx + w / n + 2 + sw, FLOOR + 190], [fx + sw, FLOOR + 190]]), i % 2 ? C.plum : C.plumLight, { sh: .5, grain: .3 });
    }
    for (let i = 0; i < Math.ceil(w / 40); i++) cut(circle(x0 + 20 + i * 40, FLOOR + 196, 16), C.gold, { sh: .3, grain: 0 });
    if (o > .5) { const tx = side < 0 ? x0 + w - 20 : x0 + 20; cut(capsule(tx - 30, 1000, tx + 30, 1040, 14), C.gold, { sh: .5 }); }
  }
  function costumeRail(x, y) {
    for (const sx of [-1, 1]) cut(rect(x + sx * 150 - 6, y, 12, 330), C.goldDeep, { sh: .6 });
    cut(rect(x - 160, y, 320, 12), C.gold, { sh: .6 });
    g.save(); g.translate(x, y + 10); g.rotate(Math.sin(t0 * 1.4) * .05); cut(poly([[0, 0], [-70, 50], [70, 50]]), C.goldDeep, { sh: .3 }); g.translate(0, 50); jeans(.7, Math.sin(t0 * 2.1) * .04, C.tealLight); g.restore();
  }
  let t0 = 0;
  function bentwoodChair(x, y, turn) {
    g.save(); g.translate(x, y); g.scale(Math.cos(turn) * .9 + .1 * Math.sign(Math.cos(turn) || 1), 1);
    cut(ringLace(0, -260, 60, 76), C.goldDeep, { sh: .7, rule: 'evenodd' });
    for (const sx of [-1, 1]) { cut(rect(sx * 70 - 7, -270, 14, 280), C.goldDeep, { sh: .6 }); cut(capsule(sx * 70, -20, sx * 90, 150, 7), C.goldDeep, { sh: .6 }); }
    cut(ellipse(0, -10, 100, 22), C.plum, { sh: .8 });
    g.restore();
  }
  SHOT(142.48, 165.0, 'theatre', (t, k, d) => {
    t0 = t;
    const op = ss(143.2, 145.4, t) * (1 - ss(161.5, 163.3, t)), S = spot(t);
    const z = kf3(t, [[142.48, 1.0], [148.0, 1.06], [156.0, 1.06], [161.0, 1.0]]);
    g.save(); cam(540, 1000, z);
    sheet(C.plumDeep);
    // the house: dark boxes either side
    for (const sx of [-1, 1]) for (let r = 0; r < 3; r++) { cut(archPath(540 + sx * 520 - 60, 520 + r * 420, 120, 220), C.tealInk, { sh: .4 }); archFrame(540 + sx * 520 - 60, 520 + r * 420, 120, 220, 10, C.goldDeep); }
    // inside the opening: the backdrop of dreams, the floor, the props
    g.save(); g.clip(opening());
    cut(rect(OP.x, OP.y, OP.w, FLOOR - OP.y), C.tealDeep, { sh: 0 });
    cut(crescent(760, 620, 110, .6, -.4), C.cream, { sh: .7, lift: .3 });
    for (let i = 0; i < 4; i++) cut(cloud(200 + i * 220, 820 + (i % 2) * 120, 300, 90, i + 80), C.teal, { sh: .5 });
    for (let i = 0; i < 14; i++) cut(star4(OP.x + 40 + hash(i * 3.1) * (OP.w - 80), OP.y + 120 + hash(i * 7.7) * 500, 10 + hash(i) * 8), C.goldPale, { sh: .2, grain: 0 });
    cut(poly([[OP.x - 40, FLOOR], [OP.x + OP.w + 40, FLOOR], [OP.x + OP.w + 120, OP.y + OP.h], [OP.x - 120, OP.y + OP.h]]), C.goldDeep, { sh: .6 });
    for (let i = 0; i < 6; i++) cut(rect(OP.x - 100, FLOOR + 20 + i * 32, OP.w + 200, 3), C.plumDeep, { sh: 0, grain: 0, alpha: .5 });
    if (t > 147.5) costumeRail(300, 1150);
    if (t > 151.5) { cut(ellipse(700, 1520, 80, 18), C.plum, { sh: .7 }); for (const sx of [-1, 1]) cut(capsule(700 + sx * 50, 1520, 700 + sx * 70, 1680, 8), C.goldDeep, { sh: .5 }); g.save(); g.translate(700, 1430); g.rotate(Math.sin(t * 1.2) * .02); helmet(.5, 1 + .04 * Math.sin(t * 2.6)); g.restore(); }
    if (t > 155.5) { bentwoodChair(540, 1640, (t - 155.5) * .8); g.save(); g.translate(540 + Math.cos((t - 155.5) * .8) * 10, 1622); bowler(.42); g.restore(); }
    // the shadow play, inside the spotlight on the backdrop
    g.save(); g.clip(circle(S.x, S.y, S.r));
    glow(S.x, S.y, S.r, '250,220,160', .6);
    const dog = ss(143.9, 144.2, t) * (1 - ss(146.9, 147.3, t));
    if (dog > 0) { g.save(); g.globalAlpha *= dog; dogShadow(t, S.x + 40, S.y + 30 + (1 - dog) * 200, .9); g.restore(); }
    for (let i = 0; i < 4; i++) { const tt = t - 146.8 - i * .3; if (tt < 0 || tt > 1.6) continue; g.save(); g.globalAlpha *= .9; g.filter = 'brightness(0.2)'; dragonfly(S.x - 380 + tt * 520, S.y - 120 + i * 80 + Math.sin(tt * 6) * 30, .9, .1, t * 30 + i, C.plumDeep); g.restore(); }
    g.restore();
    g.restore();
    // the curtains
    for (const side of [-1, 1]) curtain(side, op, t);
    // the dark outside the spotlight (inside the opening only, curtains included), then the light itself
    g.save(); g.clip(opening());
    const dark = new Path2D(); dark.rect(-200, -200, W + 400, H + 400); dark.arc(S.x, S.y, S.r * 1.05, 0, TAU, true);
    g.fillStyle = 'rgba(30,14,30,.55)'; g.fill(dark);
    g.globalCompositeOperation = 'screen';
    const sg = g.createRadialGradient(S.x, S.y, 0, S.x, S.y, S.r * 1.06); sg.addColorStop(0, 'rgba(250,225,170,.42)'); sg.addColorStop(.85, 'rgba(250,215,140,.3)'); sg.addColorStop(1, 'rgba(250,215,140,0)');
    g.fillStyle = sg; g.fill(circle(S.x, S.y, S.r * 1.06));
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
    halo(540, 300, 110, t * .05, 1);
    // footlights
    for (let i = 0; i < 9; i++) { const fx = 160 + i * 95; glow(fx, 1720, 70, '250,215,140', .5); cut(blob([[fx - 26, 1736], [fx, 1700], [fx + 26, 1736]], .6), C.goldPale, { sh: .4 }); }
    cut(cutRect(-60, 1736, W + 120, 400, 501), C.plumDeep, { sh: .8 });
    g.restore();
    // the falling star landing: a bright disc that settles into the spotlight
    if (t < 143.0) { g.save(); g.globalAlpha *= 1 - ss(142.48, 143.0, t); g.fillStyle = C.goldPale; g.fill(circle(SPOT0.x, SPOT0.y, SPOT0.r)); g.restore(); }
  });
})();

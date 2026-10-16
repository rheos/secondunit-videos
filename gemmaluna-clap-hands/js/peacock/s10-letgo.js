// 179.85-197.0 THE LAST CHORUS, "letting go" (draft 3). Opens on the dawn's sun (same place and size) 0.8 s before
// clap 1, so the first pair rises instead of popping in; the far bank and the ladder dissolve into the light.
// Each clap has its own framing, matched on the sun: clap 1 close and low on the window person's hands (plum
// sleeves, gold cuffs, as in chorus 1), a bird flies out; clap 2 wide, three pairs across the river, three
// birds; clap 3 tight on a corona of six pairs round the sun's core, then a flock; clap 4 the pair claps and
// becomes a hand-shadow bird, while the sun becomes an open Nouveau hand rising out of the river (the same
// drawing as the Metro's iron hands that held the first light), and the bird flies into its palm. The light
// grows out of the palm to fill the frame: the brightest image, gold by 197.0.
(() => {
  const [K1, K2, K3, K4] = CLAPS.slice(12, 16);
  function swallow(x, y, s, ph, col) {
    const f = .55 + .45 * Math.sin(ph);
    g.save(); g.translate(x, y); g.scale(s, s);
    for (const sd of [-1, 1]) tendril([[0, 0], [sd * 40, -46 * f], [sd * 100, -40 * f - 6], [sd * 150, 14 - 30 * f]], 34, col, { sh: .5, grain: .2 });
    cut(ellipse(0, 6, 15, 26), col, { sh: .5 });
    cut(poly([[-8, 26], [-22, 62], [0, 40], [22, 62], [8, 26]]), col, { sh: .4 });
    g.restore();
  }
  function released(t, x0, y0, t0, seed, life = 3.2, s0 = 2.0) {
    const d = t - t0; if (d < 0 || d > life) return;
    const u = d / life, a = seed * 2.3 + u * 3.2 * (seed % 2 ? 1 : -1);
    const x = lerp(x0, SUN4.x + Math.cos(a) * 520 * (1 - u), eo(u)), y = lerp(y0, SUN4.y + Math.sin(a) * 300 * (1 - u), eo(u));
    swallow(x, y - Math.sin(u * Math.PI) * 80, lerp(s0, .35, u) * .7, t * 14 + seed, seed % 3 ? C.plum : C.plumDeep);
  }
  function handBird(x, y, sc, ph) {
    const f = Math.sin(ph) * .32;
    g.save(); g.translate(x, y);
    palmHand(-.12 * sc, 0, sc, { dir: 1, rot: -1.05 - f, spread: .32 });
    palmHand(.12 * sc, 0, sc, { dir: -1, rot: 1.05 + f, spread: .32 });
    cut(circle(0, -.42 * sc, .16 * sc), C.cream, { sh: .5 });
    cut(poly([[-.06 * sc, -.5 * sc], [0, -.68 * sc], [.06 * sc, -.5 * sc]]), C.goldDeep, { sh: .3 });
    g.restore();
  }
  const THREE = [[260, 1420, 160, C.plum], [540, 1360, 180, C.goldDeep], [820, 1420, 160, C.plum]];
  const SUNPAPER = [[C.gold, C.goldPale], [C.goldPale, C.gold], [C.cream, C.gold], [C.gold, C.cream], [C.goldPale, C.gold], [C.cream, C.goldPale]];
  SHOT(DAWN_END, END + .1, 'letgo', (t, k, d) => {
    const hand = eo(clamp((t - K4 + .05) / 1.1));
    // the framings: matched on the sun; the climax pushes IN (the audit: draft 2 zoomed out and went dark)
    const cx = 540;
    const cy = kf3(t, [[DAWN_END, 960], [180.3, 1240], [181.8, 1240], [184.2, 1000], [185.6, 1000], [188.0, 860], [189.6, 860], [192.4, 980], [194.0, 900], [END, 880]]);
    const z = kf3(t, [[DAWN_END, 1.0], [180.3, 1.45], [181.8, 1.45], [184.2, .95], [185.6, .95], [188.0, 1.3], [189.6, 1.3], [192.4, 1.0], [END, 1.06]]);
    g.save(); cam(cx, cy, z);
    dawnSky(t, ss(181, 192, t));
    sheet(C.goldPale, .2 * ss(188, 192.5, t) + .35 * ss(192.8, 195.0, t)); // the sky warms to gold toward the climax
    glow(SUN4.x, SUN4.y, 1000, '250,215,140', .55);
    // the peacock's tail from the dawn stays open behind the sun, then folds into the sun-hand's fingers
    peacockFan(SUN4.x, SUN4.y, 760, 1 - hand, t);
    // clap 4's sun-hand: an open Nouveau hand rising out of the river behind the sun (the sun is its palm)
    const HSC = 640, wristY = lerp(2400, SUN4.y + 330, hand), sunR = lerp(SUN4.R, 310, hand);
    if (hand > 0) {
      cut(capsule(SUN4.x, 2400, SUN4.x, wristY, HSC * .36, HSC * .4), C.gold, { sh: .9, lift: .4 }); // the forearm, out of the river
      cut(capsule(SUN4.x - HSC * .12, 2400, SUN4.x - HSC * .1, wristY + 40, HSC * .05, HSC * .05), C.goldPale, { sh: 0, grain: .2, alpha: .6 });
      nouveauHand(SUN4.x, wristY, HSC, hand, { fill: C.gold, edge: C.goldDeep });
    }
    // the far bank and the ladder of light dissolve into the morning
    const fade = 1 - ss(DAWN_END, 180.6, t);
    if (fade > 0) { dawnFarBank(t, fade); }
    halo(SUN4.x, SUN4.y, sunR, t * .04, 1, [C.gold, C.cream, C.goldPale, C.gold], 'sunflower'); // the sun settles into the palm
    // clap 3: a corona of six pairs in sun papers round the core, out from under it
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + i / 6 * TAU + t * .03, [sl, cf] = SUNPAPER[i];
      g.save(); g.translate(SUN4.x + Math.cos(a) * SUN4.R * .7, SUN4.y + Math.sin(a) * SUN4.R * .7); g.rotate(a + Math.PI / 2);
      visitClap(t, 0, 0, 105, K3, { dy: 300, sleeveLen: 1.1, sleeveCol: sl, cuffCol: cf, pre: .75 });
      g.restore();
      released(t, SUN4.x + Math.cos(a) * (SUN4.R + 200), SUN4.y + Math.sin(a) * (SUN4.R + 200), K3 + .5 + i * .05, i + 7, 3.0, 1.1);
    }
    cut(circle(SUN4.x, SUN4.y, sunR * .52), C.goldPale, { sh: .5, lift: .3, grain: .3 });
    // lilies round the sun; the upper ones fade as the fingers come through
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + t * .03, kk = CLAPS[12 + (i % 4)], fa = Math.sin(a) < .2 ? 1 - hand : 1; if (fa <= 0) continue; g.save(); g.globalAlpha *= fa; lily(SUN4.x + Math.cos(a) * (SUN4.R + 90), SUN4.y + Math.sin(a) * (SUN4.R + 90), a, 100, back(clamp((t - kk - .1) / .7)), [C.cream, C.goldPale]); g.restore(); }
    for (const sx of [-1, 1]) { const v = whipPts([540 + sx * 600, 1700], [540 + sx * 300, 1800], [540 + sx * 80, 1450], [540 + sx * 260, 1330], 60, -sx); tendril(grow(v, ss(K1, K4, t)), 30, C.gold); }
    // the river; it warms to gold as the light grows
    cut(cutRect(-200, 1500, 1480, 900, 701), C.teal, { sh: .6 });
    g.save(); g.globalAlpha *= .85 * ss(193.0, 195.6, t); cut(cutRect(-200, 1500, 1480, 900, 702), C.goldPale, { sh: 0, grain: .3 }); g.restore();
    if (hand > 0) { g.save(); g.globalAlpha *= hand; g.strokeStyle = C.goldPale; g.lineWidth = 8; for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(SUN4.x, 1510 + i * 18, HSC * .42 + i * 40 + Math.sin(t * 3 + i) * 6, 16 + i * 6, 0, 0, Math.PI); g.stroke(); } g.restore(); } // ripples round the wrist
    for (let i = 0; i < 8; i++) { const w = 60 + i * 30, y = 1530 + i * 46; g.strokeStyle = C.goldPale; g.lineWidth = 10; g.lineCap = 'round'; g.globalAlpha = .75; g.beginPath(); g.moveTo(540 - w, y); g.quadraticCurveTo(540, y + 14, 540 + w, y); g.stroke(); g.globalAlpha = 1; }
    if (fade > 0) dawnPath(t, fade);
    // clap 1: one pair, one bird
    visitClap(t, 540, 1360, 230, K1, { sleeveLen: 6, sleeveCol: PEOPLE[0][0], cuffCol: PEOPLE[0][1], dy: 1000, post: 1.5 });
    released(t, 540, 1080, K1 + .5, 1, 3.4, 2.4);
    // clap 2: three pairs across the river, three birds
    THREE.forEach(([x, y, sc, sl], i) => { visitClap(t, x, y, sc, K2, { sleeveLen: 6, sleeveCol: sl, cuffCol: C.gold, dy: 1000, post: 1.5 }); released(t, x, y - sc * 1.2, K2 + .5 + i * .06, i + 3, 3.2, 1.3); });
    if (t > K3 + 1) for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + (t - K3) * .9, r = SUN4.R + 160 + Math.sin(t * 2 + i) * 40; g.save(); g.globalAlpha *= ss(K3 + 1, K3 + 2, t) * (1 - ss(195, 196.5, t)); swallow(SUN4.x + Math.cos(a) * r, SUN4.y + Math.sin(a) * r * .8, .55, t * 14 + i, i % 2 ? C.plum : C.plumDeep); g.restore(); }
    // clap 4: the pair claps and becomes the hand-shadow bird, big, then flies into the palm
    const swap = K4 + .45;
    if (t < swap) visitClap(t, 540, 1300, 260, K4, { sleeveLen: 6, sleeveCol: PEOPLE[0][0], cuffCol: PEOPLE[0][1], dy: 1100, pre: .8 });
    else { const u = clamp((t - swap) / 2.4), x = lerp(540, SUN4.x, eo(u)) + Math.sin(u * 5) * 70 * (1 - u), y = lerp(1300 - 260 * .9, SUN4.y, eo(u));
      handBird(x, y, lerp(300, 46, ei(u)), t * 11); }
    for (const kk of [K1, K2, K4]) clapRings(t, 540, 1100, kk, 1.0);
    clapRings(t, SUN4.x, SUN4.y, K3, 1.5);
    // the light grows out of the palm until it fills the frame
    const bloom = ss(194.2, END, t);
    if (bloom > 0) glow(SUN4.x, SUN4.y, lerp(500, 2400, bloom), '252,236,190', .95 * bloom);
    g.restore();
    sheet(C.goldPale, .85 * ss(196.0, END - .1, t));
    sheet(C.white, .3 * ss(196.3, END, t));
  });
})();

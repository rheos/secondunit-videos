// 180.633-197.0 THE LAST CHORUS, "letting go": the sun as a giant halo at dawn. Clap 1 the window person's hands
// (plum sleeves, gold cuffs, as in chorus 1) clap and open: a bird flies out. Clap 2 three pairs, three birds.
// Clap 3 a ring of six pairs grows out from under the sun; six birds, then a flock circling it. Clap 4 the one
// pair claps and becomes a hand-shadow bird that flies into the sun; the frame fills with gold by 197.0.
(() => {
  const [K1, K2, K3, K4] = CLAPS.slice(12, 16);
  // a swallow seen from below: an M of two swept wings, a small body, a forked tail; ph flaps the wings
  function swallow(x, y, s, ph, col) {
    const f = .55 + .45 * Math.sin(ph);
    g.save(); g.translate(x, y); g.scale(s, s);
    for (const sd of [-1, 1]) tendril([[0, 0], [sd * 40, -46 * f], [sd * 100, -40 * f - 6], [sd * 150, 14 - 30 * f]], 34, col, { sh: .5, grain: .2 });
    cut(ellipse(0, 6, 15, 26), col, { sh: .5 });
    cut(poly([[-8, 26], [-22, 62], [0, 40], [22, 62], [8, 26]]), col, { sh: .4 });
    g.restore();
  }
  // a paper swallow flying along a path from (x0,y0), released at t0, toward the sun with a curl
  function released(t, x0, y0, t0, seed, life = 3.2, s0 = 2.0) {
    const d = t - t0; if (d < 0 || d > life) return;
    const u = d / life, a = seed * 2.3 + u * 3.2 * (seed % 2 ? 1 : -1);
    const x = lerp(x0, SUN4.x + Math.cos(a) * 520 * (1 - u), eo(u)), y = lerp(y0, SUN4.y + Math.sin(a) * 300 * (1 - u), eo(u));
    const s = lerp(s0, .35, u), dir = Math.cos(a + Math.PI / 2) > 0 ? 1 : -1;
    swallow(x, y - Math.sin(u * Math.PI) * 80, s * .7, t * 14 + seed, seed % 3 ? C.plum : C.plumDeep);
  }
  // the hand-shadow bird: two palms crossed at the wrists, thumbs hooked into a head, fingers spread as wings
  function handBird(x, y, sc, ph) {
    const f = Math.sin(ph) * .32;
    g.save(); g.translate(x, y);
    palmHand(-.12 * sc, 0, sc, { dir: 1, rot: -1.05 - f, spread: .32 });
    palmHand(.12 * sc, 0, sc, { dir: -1, rot: 1.05 + f, spread: .32 });
    cut(circle(0, -.42 * sc, .16 * sc), C.cream, { sh: .5 });
    cut(poly([[-.06 * sc, -.5 * sc], [0, -.68 * sc], [.06 * sc, -.5 * sc]]), C.goldDeep, { sh: .3 });
    g.restore();
  }
  const THREE = [[220, 1400, 150, 1], [540, 1330, 180, 0], [860, 1400, 150, 2]];
  SHOT(180.633, END + .1, 'letgo', (t, k, d) => {
    g.save(); cam(540, 960, 1 + .04 * ss(180.6, 196, t));
    dawnSky(t, ss(181, 194, t));
    rays(SUN4.x, SUN4.y, SUN4.R * 1.02, 1700, 36, t * .04, C.goldPale, .7);
    glow(SUN4.x, SUN4.y, 1000, '250,215,140', .55);
    halo(SUN4.x, SUN4.y, SUN4.R, t * .04, 1, [C.gold, C.cream, C.goldPale, C.gold]);
    // clap 3: a corona of six pairs round the sun's core, out from under it; six birds, then a flock circling
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + i / 6 * TAU + t * .03, [sl, cf] = PEOPLE[i];
      g.save(); g.translate(SUN4.x + Math.cos(a) * SUN4.R * .7, SUN4.y + Math.sin(a) * SUN4.R * .7); g.rotate(a + Math.PI / 2);
      visitClap(t, 0, 0, 105, K3, { dy: 300, sleeveLen: 1.6, sleeveCol: sl, cuffCol: cf, pre: .75 });
      g.restore();
      released(t, SUN4.x + Math.cos(a) * (SUN4.R + 200), SUN4.y + Math.sin(a) * (SUN4.R + 200), K3 + .5 + i * .05, i + 7, 3.0, 1.1);
    }
    cut(circle(SUN4.x, SUN4.y, SUN4.R * .52), C.goldPale, { sh: .5, lift: .3, grain: .3 });
    // lilies round the sun open a few more on each clap; tendrils unfurl
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + t * .03, kk = CLAPS[12 + (i % 4)]; lily(SUN4.x + Math.cos(a) * (SUN4.R + 90), SUN4.y + Math.sin(a) * (SUN4.R + 90), a, 100, back(clamp((t - kk - .1) / .7)), [C.cream, C.goldPale]); }
    for (const sx of [-1, 1]) { const v = whipPts([540 + sx * 600, 1700], [540 + sx * 300, 1800], [540 + sx * 80, 1450], [540 + sx * 260, 1330], 60, -sx); tendril(grow(v, ss(K1, K4, t)), 30, C.gold); }
    // the river under the sun
    cut(cutRect(-200, 1500, 1480, 700, 701), C.teal, { sh: .6 });
    for (let i = 0; i < 8; i++) { const w = 60 + i * 30; cut(rrect(540 - w, 1530 + i * 46, w * 2, 12, 6), C.goldPale, { sh: 0, grain: .2, alpha: .7 }); }
    // clap 1: one pair, one bird
    visitClap(t, 540, 1360, 230, K1, { sleeveLen: 6, sleeveCol: PEOPLE[0][0], cuffCol: PEOPLE[0][1], dy: 1000, post: 1.5 });
    released(t, 540, 1080, K1 + .5, 1, 3.4, 2.4);
    // clap 2: three pairs, three birds
    THREE.forEach(([x, y, sc, p], i) => { visitClap(t, x, y, sc, K2, { sleeveLen: 6, sleeveCol: PEOPLE[p][0], cuffCol: PEOPLE[p][1], dy: 1000, post: 1.5 }); released(t, x, y - sc * 1.2, K2 + .5 + i * .06, i + 3, 3.2, 1.3); });
    if (t > K3 + 1) for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + (t - K3) * .9, r = SUN4.R + 160 + Math.sin(t * 2 + i) * 40; g.save(); g.globalAlpha *= ss(K3 + 1, K3 + 2, t); swallow(SUN4.x + Math.cos(a) * r, SUN4.y + Math.sin(a) * r * .8, .55, t * 14 + i, i % 2 ? C.plum : C.plumDeep); g.restore(); }
    // clap 4: the pair claps, then becomes a bird and flies into the sun
    const swap = K4 + .45;
    if (t < swap) visitClap(t, 540, 1300, 260, K4, { sleeveLen: 6, sleeveCol: PEOPLE[0][0], cuffCol: PEOPLE[0][1], dy: 1100, pre: .8 });
    else { const u = clamp((t - swap) / 2.6), x = lerp(540, SUN4.x, eo(u)) + Math.sin(u * 5) * 60 * (1 - u), y = lerp(1300 - 260 * .9, SUN4.y, eo(u));
      handBird(x, y, lerp(260 * .84, 40, eo(u)), t * 11); }
    for (const kk of [K1, K2, K4]) clapRings(t, 540, 1100, kk, 1.0);
    clapRings(t, SUN4.x, SUN4.y, K3, 1.5);
    g.restore();
    // into the sun's light
    sheet(C.goldPale, ss(195.0, END - .15, t));
    sheet(C.white, .35 * ss(196.0, END, t));
  }, { smooth: true });
})();

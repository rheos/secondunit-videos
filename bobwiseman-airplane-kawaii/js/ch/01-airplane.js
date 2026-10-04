// 71.0 - 91.0  "I'm an airplane on the highway / and I feel so strange / mnuh nuh nuh /
// I'm an airplane on the highway / and I'm sick of the passing lane"
// Kawaii watercolour: a chunky cream box of a prop airliner with a kaomoji face, on car tyres.
//   71.00 cruise    head-on wide: he putters up a country road through a picture-book landscape; his
//                   wings are far too long and slap the roadside lollipop trees (on airplane / highway)
//   77.20 strange   close head-on: worried eyes on "feel"; on "strange" (78.30) spiral eyes and the
//                   watercolour floods, runs and shifts hue; "mnuh nuh nuh" = three mini-hims pop up
//                   with confetti on 79.03 / 79.73 / 80.20
//   80.83 overhead  top-down: the passing lane is a roped-off red carpet; his top wing pokes over the
//                   rope and smug VIP cars in sunglasses hop over it as they zip past
//   85.90 sideline  side-on stage set: he trundles behind the velvet rope while VIP cars cruise the
//                   carpet above; sly flat eyes on "sick" (86.57); a heart-eyed pink limo on
//                   "passing lane", hearts on "lane" (87.30); confetti falls on the VIP lane only
(() => {
  const FEEL = 77.20, STRANGE = 78.30, MN = [79.03, 79.73, 80.20], SICK = 86.57, LANE = 87.30;
  const voc = (t) => clamp((F('voc', t, 1) - .08) / .42);
  const wrap = (x, m) => ((x % m) + m) % m;

  function sky(y0, y1, c0, c1, sd) {
    s.fillStyle = vgrad(y0, y1, [[0, c0], [1, c1]]); s.fillRect(-W, -H, W * 3, H * 3);
    const r = rng(sd); // soft wet patches so the sky is a wash, not a gradient
    for (let i = 0; i < 8; i++) {
      const x = r() * W, y = y0 + r() * (y1 - y0) * .8, rx = 260 + r() * 320, ry = 80 + r() * 100, col = [PAL.lilac, PAL.peach, PAL.pink, '#fff3d8'][i % 4];
      s.save(); s.translate(x, y); s.scale(1, ry / rx); s.globalAlpha = .45; s.fillStyle = rgrad(0, 0, 0, rx, [[0, col], [.6, col + '99'], [1, col + '00']]); s.fillRect(-rx, -rx, rx * 2, rx * 2); s.restore();
    }
  }
  function dome(cx, base, rx, ry, col, sd) { seedAt(sd); const P = []; for (let i = 0; i <= 24; i++) { const a = Math.PI + i / 24 * Math.PI; P.push([cx + Math.cos(a) * rx, base + Math.sin(a) * ry]); } P.push([cx + rx, base + 60], [cx - rx, base + 60]); shape(P, col, 6); }
  function camera(cx, cy, z, a = 0) { tr(cx, cy); rot(a); sc(z); tr(-cx, -cy); }

  // ---------------------------------------------------------------- 1. cruise (head-on wide)
  const HZ = 505, KP = 395, V1 = 1.05;
  const Y = (d) => HZ + KP / d;
  const TREES = [ // tc = when the tree reaches his wing (d = 1)
    { tc: 72.87, side: -1, col: PAL.mint, bonk: 1 }, { tc: 73.6, side: 1, col: PAL.lilac, x: 820 },
    { tc: 74.77, side: 1, col: '#f7b6a8', bonk: 1 }, { tc: 75.9, side: -1, col: PAL.lemon, x: 860 },
    { tc: 76.75, side: -1, col: PAL.pink, bonk: 1 }, { tc: 77.9, side: 1, col: PAL.mint, x: 800 },
    { tc: 72.0, side: 1, col: PAL.lemon, x: 860 }, { tc: 78.6, side: -1, col: '#f7b6a8', bonk: 1 },
  ];
  function tree1(tr0, t) {
    const d = 1 + V1 * (tr0.tc - t); if (d < .5 || d > 14) return;
    const wx = tr0.side * (tr0.x || 520), x = 960 + wx / d, y = Y(d), h = 360 / d;
    const dt = t - tr0.tc, bend = tr0.bonk && dt > 0 ? tr0.side * .55 * Math.exp(-3 * dt) * Math.cos(dt * 15) : 0;
    lollipopTree(x, y, h, tr0.col, 7000 + Math.round(tr0.tc * 10), bend);
    if (tr0.bonk) { confetti(x, y - h * .75, tr0.tc, t, 14, Math.round(tr0.tc * 100), 420, 1.2); }
  }
  function cruise(t) {
    t = onTwos(t); TB = Math.floor(t * 12);
    fx({ seed: 1.3, wet: .35 });
    camera(960, 760, lerp(1, 1.07, ease.inOut(inv(71, 77.2, t))));
    sky(-40, HZ, PAL.sky1, PAL.sky2, 11);
    sun(1570, 190, 78, t, 6000);
    cloud(380 + (t - 71) * 9, 170, 1, 6100, true, t); cloud(1180 + (t - 71) * 6, 300, .7, 6110);
    dome(220, HZ + 10, 360, 120, PAL.lilac, 6200); dome(1720, HZ + 10, 400, 140, PAL.mint, 6210); dome(980, HZ + 12, 320, 70, '#d9eab0', 6220);
    seedAt(6300); paint([[-200, HZ], [W + 200, HZ], [W + 200, H + 200], [-200, H + 200]], PAL.grass);
    ink([[-200, HZ + 4], [W + 200, HZ + 4]], false, 5);
    // the road
    const df = 40, dn = .55, hw = (d) => 400 / d;
    seedAt(6400); shape([[960 - hw(df), Y(df)], [960 + hw(df), Y(df)], [960 + hw(dn), Y(dn)], [960 - hw(dn), Y(dn)]], PAL.road, 0);
    ink([[960 - hw(df), Y(df)], [960 - hw(dn), Y(dn)]], false, 6); ink([[960 + hw(df), Y(df)], [960 + hw(dn), Y(dn)]], false, 6);
    const ph = wrap(t * V1, 1.3);
    for (let i = 0; i < 14; i++) { const d0 = .55 + i * 1.3 - ph, d1 = d0 + .5; if (d0 < .5) continue; const w0 = 14 / d0, w1 = 14 / d1; paint([[960 - w1, Y(d1)], [960 + w1, Y(d1)], [960 + w0, Y(d0)], [960 - w0, Y(d0)]], PAL.dash, .95); }
    // flowers along the verge, stage-set flat
    for (let i = 0; i < 10; i++) { const d = .6 + wrap(i * 1.7 - t * V1, 17); const x = 960 + (i % 2 ? 1 : -1) * (620 + 90 * hash(i)) / d, y = Y(d); if (d < 1.2) continue; seedAt(6500 + i); const r = 30 / d; for (let p = 0; p < 5; p++) { const a = p / 5 * TAU; shape(ell(x + Math.cos(a) * r, y - r * 2 + Math.sin(a) * r, r * .6, r * .6, 12), [PAL.pink, PAL.lemon, '#ffffff'][i % 3], 3.5); } shape(ell(x, y - r * 2, r * .5, r * .5, 12), PAL.coral, 3.5); }
    const far = TREES.filter((q) => 1 + V1 * (q.tc - t) >= 1), near = TREES.filter((q) => 1 + V1 * (q.tc - t) < 1);
    far.sort((a, b) => b.tc - a.tc).forEach((q) => tree1(q, t));
    // him
    const bonk = Math.max(...TREES.filter((q) => q.bonk).map((q) => hit(t, q.tc, 5)));
    const bp = beatPulse(t, 8);
    planeFront(960, 900, 1.0, {
      t, bob: -bp * 10 + Math.sin(t * 9) * 2, tilt: Math.sin(t * 2.1) * .02 + bonk * .05 * Math.sin(t * 30),
      eyes: bonk > .35 ? 'squeeze' : 'happy', mouth: 'smile', open: voc(t), w: 7,
    });
    near.forEach((q) => tree1(q, t));
  }

  // ---------------------------------------------------------------- 2. strange (close head-on)
  function mini(x, y, kk, t, t0, i) {
    const p = ease.back(inv(t0, t0 + .28, t)); if (p <= 0) return;
    const sing = t - t0 < .4;
    planeFront(x, y, kk * p, { t: t + i, bob: -Math.abs(Math.sin((t - t0) * 9)) * 18, tilt: Math.sin(t * 6 + i) * .08, eyes: 'happy', mouth: 'smile', open: sing ? .9 : 0, w: 6 });
  }
  function strange(t) {
    t = onTwos(t); TB = Math.floor(t * 12);
    const st = smooth(inv(STRANGE, STRANGE + .7, t));
    fx({ seed: 2.1, wet: .35 + st * 1.05, runs: st * .9, hue: st * (t - STRANGE) * 2.0, boil: 1 + st * 1.4 });
    camera(960, 640, lerp(1, 1.05, inv(FEEL, STRANGE, t)) + st * .03 * Math.sin(t * 3), st * .03 * Math.sin(t * 2.3));
    sky(-60, 640, PAL.sky1, PAL.sky2, 21);
    if (st > 0) { // the colour blooms open across the wet sheet
      const r = rng(77);
      for (let i = 0; i < 9; i++) { const t0 = STRANGE + i * .2, g = ease.out(inv(t0, t0 + 1.4, t)); if (g <= 0) continue; s.globalAlpha = .45 * (1 - g * .4); s.fillStyle = CONF[i % CONF.length]; s.beginPath(); s.ellipse(r() * W, r() * 900, 80 + g * 420, 60 + g * 300, 0, 0, TAU); s.fill(); }
      s.globalAlpha = 1;
    }
    cloud(260, 200, 1.3, 6150, true, t);
    dome(160, 640, 520, 170, PAL.lilac, 6230); dome(1800, 640, 560, 190, PAL.mint, 6240);
    seedAt(6310); paint([[-300, 636], [W + 300, 636], [W + 300, H + 300], [-300, H + 300]], PAL.grass); ink([[-300, 640], [W + 300, 640]], false, 6);
    seedAt(6410); shape([[930, 640], [990, 640], [1500, H + 100], [420, H + 100]], PAL.road, 6);
    const sp = st ? 'spiral' : t >= FEEL ? 'worried' : 'dot';
    const sh = st * Math.sin(t * 13) * 6;
    planeFront(960 + sh, 1140, 2.25, { t, bob: -beatPulse(t, 8) * 8, tilt: st * .04 * Math.sin(t * 5), eyes: sp, mouth: st ? 'wavy' : 'wavy', open: voc(t), w: 8 });
    // mnuh nuh nuh: three little hims pop up, one per hit
    const spots = [[330, 600, .34], [1590, 600, .34], [960, 262, .3]];
    MN.forEach((t0, i) => { const [x, y, kk] = spots[i]; confetti(x, y - 140 * kk * 3, t0, t, 26, 900 + i, 700, 1.8); });
    MN.forEach((t0, i) => { const [x, y, kk] = spots[i]; mini(x, y, kk, t, t0, i); });
  }

  // ---------------------------------------------------------------- 3. overhead (top-down)
  const LANE_Y = 285, ROPE_Y = 440, HIS_Y = 625, VR = 640;
  const CARS3 = [{ te: 80.75, col: PAL.lilac, eyes: 'shades' }, { te: 82.0, col: PAL.wing, eyes: 'smug' }, { te: 83.15, col: PAL.lemon, eyes: 'shades' }, { te: 84.35, col: PAL.pink, eyes: 'smug', len: 300 }];
  function overhead(t) {
    t = onTwos(t); TB = Math.floor(t * 12);
    fx({ seed: 3.7, wet: .3 });
    camera(960, 560, lerp(1.0, 1.06, inv(80.83, 85.9, t)));
    const gx = t * 230, px = 720 + (t - 80.83) * 18;
    seedAt(8000);
    paint([[-200, -200], [W + 200, -200], [W + 200, 160], [-200, 160]], PAL.grass);
    paint([[-200, 812], [W + 200, 812], [W + 200, H + 200], [-200, H + 200]], PAL.grass);
    // the red carpet with gold piping
    shape([[-200, 160], [W + 200, 160], [W + 200, 420], [-200, 420]], PAL.carpet, 6);
    seedAt(8010); paint([[-200, 176], [W + 200, 176], [W + 200, 186], [-200, 186]], PAL.gold); paint([[-200, 394], [W + 200, 394], [W + 200, 404], [-200, 404]], PAL.gold);
    // his lane
    shape([[-200, 452], [W + 200, 452], [W + 200, 812], [-200, 812]], PAL.road, 6);
    for (let i = 0; i < 9; i++) { const x = wrap(i * 260 - gx, 260 * 9) - 260; paint(rrect(x, HIS_Y - 7, 120, 14, 6), PAL.dash, .95); }
    // verge trees and bushes from above
    for (let i = 0; i < 8; i++) {
      const x = wrap(i * 330 - gx + 60, 330 * 8) - 300; seedAt(8100 + i);
      shape(ell(x, 70 + 30 * hash(i), 64, 58, 22), [PAL.mint, '#f7b6a8', PAL.lemon][i % 3], 6); paint(ell(x - 18, 52 + 30 * hash(i), 18, 12), '#ffffff', .5);
      const x2 = wrap(i * 300 - gx + 200, 300 * 8) - 300; seedAt(8200 + i);
      shape(ell(x2, 950 + 40 * hash(i + 9), 74, 68, 22), [PAL.lilac, PAL.mint, PAL.pink][i % 3], 6); paint(ell(x2 - 22, 928 + 40 * hash(i + 9), 20, 13), '#ffffff', .5);
    }
    // cars on the carpet: they hop over his wing tip
    const near = [];
    CARS3.forEach((c, i) => {
      const x = -320 + (t - c.te) * VR; if (x < -400 || x > W + 400) return;
      const dx = x - px, hop = Math.abs(dx) < 230 ? Math.sin(Math.PI * (dx + 230) / 460) : 0;
      near.push({ ...c, x, hop, i });
    });
    near.filter((c) => c.hop <= 0).forEach((c) => carTop(c.x, LANE_Y, .82, { col: c.col, eyes: c.eyes, sd: 5000 + c.i * 100, len: c.len || 250 }));
    // the velvet rope and brass stanchions
    for (let i = 0; i < 9; i++) {
      const x = wrap(i * 280 - gx, 280 * 9) - 280; seedAt(8300 + i);
      shape(rrect(x, ROPE_Y - 9, 280, 18, 8, 8300 + i), PAL.velvet, 5);
    }
    for (let i = 0; i < 9; i++) { const x = wrap(i * 280 - gx, 280 * 9) - 280; seedAt(8400 + i); shape(ell(x, ROPE_Y, 24, 24, 18), PAL.gold, 6); shape(ell(x, ROPE_Y, 10, 10, 12), '#fff0b8', 3.5); }
    // him: look at the nearest car
    const cl = near.length ? near.reduce((a, b) => Math.abs(b.x - px) < Math.abs(a.x - px) ? b : a) : null;
    const look = cl ? clamp((cl.x - px) / 300, -1, 1) : 0;
    const hopping = near.some((c) => c.hop > .3);
    planeTop(px, HIS_Y + Math.sin(t * 9) * 3, .74, { t, eyes: hopping ? 'wide' : 'dot', look, mouth: 'smile', open: voc(t), w: 6 });
    near.filter((c) => c.hop > 0).forEach((c) => { carTop(c.x, LANE_Y - c.hop * 30, .82, { col: c.col, eyes: c.eyes, sd: 5000 + c.i * 100, hop: c.hop, len: c.len || 250 }); });
    near.forEach((c) => speedLines(c.x - (c.len || 250) * .41, LANE_Y + 60, 120, t, c.i));
  }

  // ---------------------------------------------------------------- 4. sideline (side-on stage)
  const CARS4 = [
    { te: 85.2, col: PAL.wing, eyes: 'smug', v: 430 }, { te: 86.05, col: PAL.lemon, eyes: 'shades', v: 470 },
    { te: 86.62, col: PAL.pink, eyes: 'heart', v: 300, len: 560, bow: true, limo: true },
  ];
  function sideline(t) {
    t = onTwos(t); TB = Math.floor(t * 12);
    fx({ seed: 4.4, wet: .32 });
    const pX = 500, pY = 1010, pk = 1.05;
    camera(pX + 205 * pk, pY - 220 * pk, lerp(1, 1.08, ease.inOut(inv(85.9, 91, t))));
    const gx = t * 250;
    sky(-60, 390, PAL.sky3, PAL.sky1, 41);
    cloud(wrap(1500 - gx * .08, 2400) - 200, 120, .9, 6120, true, t); cloud(wrap(600 - gx * .08, 2400) - 200, 200, .6, 6130);
    for (let i = 0; i < 6; i++) { const x = wrap(i * 520 - gx * .3, 520 * 6) - 400; dome(x, 395, 300, 80 + 40 * hash(i), [PAL.mint, PAL.lilac, '#d9eab0'][i % 3], 6250 + i); }
    // the carpet lane, raised like a stage
    seedAt(8500); shape([[-300, 385], [W + 300, 385], [W + 300, 580], [-300, 580]], PAL.carpet, 6);
    paint([[-300, 400], [W + 300, 400], [W + 300, 410], [-300, 410]], PAL.gold); paint([[-300, 555], [W + 300, 555], [W + 300, 565], [-300, 565]], PAL.gold);
    if (t > 88.6) { s.save(); s.beginPath(); s.rect(-300, -300, W + 600, 880); s.clip(); fallingConfetti(t, -100, W + 100, -60, 580, 60, 4242); s.restore(); }
    // cars cruise the carpet
    CARS4.forEach((c, i) => {
      const len = c.len || 300, x = -len * .7 + (t - c.te) * c.v; if (x < -len || x > W + len + 400) return;
      const open = c.limo ? hit(t, LANE, 3) * .9 : 0;
      carSide(x, 548, .85, { col: c.col, eyes: c.eyes, len, t, sd: 4000 + i * 100, bow: c.bow, mouth: c.limo ? 'cat' : 'smirk', open, bob: Math.abs(Math.sin(t * 6 + i)) * -4 });
      speedLines(x - len * .85 * .5, 548, 100, t, 40 + i);
      if (c.limo) for (let j = 0; j < 9; j++) { const t0 = LANE + j * .36, dt = t - t0; if (dt < 0 || dt > 2.4) continue; const hx = -len * .7 + (t0 - c.te) * c.v + len * .3 * .85 + Math.sin(dt * 3 + j) * 40 - dt * 40, hy = 430 - dt * 140; alpha(clamp((2.4 - dt) * 1.5)); seedAt(8600 + j); heart(hx, hy, 28 + 10 * hash(j), PAL.berry, 5); alpha(1); }
    });
    // his road and the front verge
    seedAt(8900); shape([[-300, 590], [W + 300, 590], [W + 300, 1040], [-300, 1040]], PAL.road, 6);
    for (let i = 0; i < 8; i++) { const x = wrap(i * 300 - gx, 300 * 8) - 300; paint(rrect(x, 800, 140, 14, 6), PAL.dash, .95); }
    // rope and stanchions in front of the carpet
    for (let i = 0; i < 8; i++) {
      const x = wrap(i * 300 - gx, 300 * 8) - 300; seedAt(8700 + i);
      const P = quadPts([x, 505], [x + 150, 565], [x + 300, 505], 12), Q = [...P, ...P.slice().reverse().map(([a, b]) => [a, b + 16])];
      shape(Q, PAL.velvet, 5);
    }
    for (let i = 0; i < 8; i++) { const x = wrap(i * 300 - gx, 300 * 8) - 300; seedAt(8800 + i); shape(rrect(x - 9, 495, 18, 120, 6, 8800 + i), PAL.gold, 5); shape(ell(x, 492, 18, 18, 14), PAL.gold, 5); shape(rrect(x - 32, 608, 64, 18, 6, 8810 + i), PAL.gold, 5); }
    seedAt(8950); shape([[-300, 1040], [W + 300, 1040], [W + 300, H + 300], [-300, H + 300]], PAL.grass, 6);
    // him
    const sick = t >= SICK, limo = CARS4[2], lx = -(limo.len) * .7 + (t - limo.te) * limo.v;
    const look = sick ? clamp((lx + 200 - (pX + 205 * pk)) / 500, -1, 1) : .7;
    const sigh = smooth(inv(89.3, 89.9, t));
    planeSide(pX, pY, pk, { t, bob: -beatPulse(t, 8) * 6 + sigh * 6, eyes: sick ? 'flat' : 'dot', look, brow: 0, mouth: sick ? 'flat' : 'smile', open: voc(t), w: 6.5, blush: sick ? .5 : 1 });
    for (let i = 0; i < 8; i++) { const x = wrap(i * 260 - gx * 1.3 + 90, 260 * 8) - 260; seedAt(9000 + i); const r = 16; for (let p = 0; p < 5; p++) { const a = p / 5 * TAU; shape(ell(x + Math.cos(a) * r, 1066 + Math.sin(a) * r, r * .62, r * .62, 12), [PAL.pink, PAL.lemon, '#ffffff'][i % 3], 4); } shape(ell(x, 1066, 9, 9, 10), PAL.coral, 3.5); }
    // after "sick": a gloom scribble over his head, then a sweat drop on the sigh
    const gl = smooth(inv(SICK + .1, SICK + .6, t));
    if (gl > 0) { // a small private raincloud
      const cx = pX + 215 * pk, cy = pY - 410 * pk;
      for (let j = 0; j < 5; j++) { const ph = wrap((t - SICK) * 1.5 + j * .21, 1); alpha(clamp((1 - ph) * 2.5) * gl); seedAt(9150 + j); shape(ell(cx - 60 + j * 30, cy + 30 + ph * 80, 5, 10, 10), PAL.blue, 3); alpha(1); }
      cloud(cx, cy, .62 * gl, 9100, false, t, '#a9a3bd');
      push(); tr(cx, cy - 6); sc(gl * .5); seedAt(9120);
      const P = []; for (let a = 0; a < TAU * 3; a += .22) { const r = 30 + 12 * Math.sin(a * 2.3); P.push([Math.cos(a) * r * 1.5 + a * 4 - 38, Math.sin(a) * r * .6]); }
      ink(P, false, 4, { wob: 3 }); pop();
    }
    const dr = smooth(inv(89.5, 89.9, t));
    if (dr > 0) {
      push(); tr(pX + 300 * pk, pY - 300 * pk + (t - 89.5) * 30); seedAt(9200);
      const P = []; for (let i = 0; i <= 24; i++) { const a = i / 24 * TAU; const r = 18; P.push([Math.sin(a) * r * (1 - Math.cos(a)) * .55 * dr, (-Math.cos(a) * r * 1.3 - r * .2) * dr]); }
      shape(P, PAL.blue, 4.5); pop();
    }
  }

  chapter('airplane', 71.0, 91.0, [
    [71.00, cruise], [FEEL, strange], [80.83, overhead], [85.90, sideline],
  ]);
})();

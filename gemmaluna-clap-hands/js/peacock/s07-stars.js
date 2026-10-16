// 129.2-142.48 CHORUS 3, "time and stars": opens on the clock face, small, which becomes the moon; the rowboat
// sails among the stars. Clap 2 (131.867) the stars join into one pair of constellation hands that clap; clap 3
// (135.9) four constellation pairs across the sky clap together, shooting stars fly off them; clap 4 (139.967)
// two great hands of the Milky Way clap, and the stars shower down. One falling star drops to the middle of the
// frame and swells: it becomes the spotlight on the theatre curtain (verse 3b).
const SPOT0 = { x: 540, y: 1180, r: 240 };   // where the theatre's spotlight opens (the falling star's end)
(() => {
  const [, K2, K3, K4] = CLAPS.slice(8, 12);
  const starAt = (x, y, r, col = C.goldPale) => { g.fillStyle = col; g.fill(star4(x, y, r)); };
  // Draft 3 constellation hands: drawn with real fingers (each finger two parallel star-lines round a rounded
  // tip, the same for the thumb), a palm outline, stars on the tips, knuckles and wrist. q 1 = open palm to
  // camera, 0 = closed in profile (the hand narrows, the fingers close up, the thumb folds in).
  function starHand(dir, q, sc, a) {
    const sx = lerp(.35, 1, q), X = (x) => dir * -x * sc * sx, Y = (y) => y * sc;
    const fingers = [[-.3, .62], [-.1, .74], [.1, .7], [.3, .56]], spread = lerp(0, .12, q), w = .085;
    const paths = [], stars = [];
    const pal = new Path2D(); pal.moveTo(X(-.38), Y(0)); pal.lineTo(X(-.42), Y(-.5)); pal.lineTo(X(-.4), Y(-.95)); pal.moveTo(X(.4), Y(-.95)); pal.lineTo(X(.42), Y(-.5)); pal.lineTo(X(.38), Y(0)); pal.lineTo(X(-.38), Y(0)); paths.push(pal);
    stars.push([X(-.38), Y(0), .03], [X(.38), Y(0), .03], [X(-.4), Y(-.95), .025], [X(.4), Y(-.95), .025]);
    const capsuleLines = (bx, by, ang, L) => { const dx = Math.sin(ang), dy = -Math.cos(ang), px = -dy * w, py = dx * w, tx = bx + dx * L, ty = by + dy * L;
      const p = new Path2D(); p.moveTo(X(bx - px), Y(by - py)); p.lineTo(X(tx - px), Y(ty - py));
      p.arc(X(tx), Y(ty), w * sc * sx, Math.atan2(Y(ty - py) - Y(ty), X(tx - px) - X(tx)), Math.atan2(Y(ty + py) - Y(ty), X(tx + px) - X(tx)), dir > 0);
      p.lineTo(X(bx + px), Y(by + py)); paths.push(p); stars.push([X(tx), Y(ty), .055], [X(bx), Y(by), .022]); };
    fingers.forEach(([fx, L], i) => capsuleLines(fx, -.95, (i - 1.5) * spread, L));
    const tTip = [lerp(-.3, -.82, q), lerp(-.72, -.85, q)], tb = [-.4, -.32], tang = Math.atan2(tTip[0] - tb[0], -(tTip[1] - tb[1]));
    capsuleLines(tb[0], tb[1], tang, Math.hypot(tTip[0] - tb[0], tTip[1] - tb[1]));
    g.save(); g.globalAlpha *= .9 * a; g.strokeStyle = C.goldPale; g.lineWidth = Math.max(2.5, sc * .022); g.lineJoin = 'round'; g.lineCap = 'round';
    g.shadowColor = 'rgba(250,215,140,.85)'; g.shadowBlur = 14; for (const p of paths) g.stroke(p); g.restore();
    g.save(); g.globalAlpha *= a; stars.forEach(([x, y, r], i) => starAt(x, y, r * sc * (.85 + .15 * Math.sin(i * 2 + a * 9)), i % 3 ? C.goldPale : C.white)); g.restore();
    return stars;
  }
  // a pair: its own clap timing (contact on k), drawn in screen space; linger keeps its stars twinkling after
  function constellation(t, cx, cy, sc, k, { rot = 0, milky = 0, linger = 0 } = {}) {
    const lt = t - k, a = ss(k - 1.1, k - .7, t) * (1 - ss(k + .9, k + 1.5, t));
    const d = lt < 0 ? Math.pow(clamp(-lt / .42), .6) : eo(clamp((lt - .06) / .45));
    const q = ss(.14, .58, d), off = lerp(.17, .85, d) * sc;
    g.save(); g.translate(cx, cy); g.rotate(rot);
    for (const dir of [-1, 1]) {
      g.save(); g.translate(dir * off, 0);
      if (milky && a > 0) { // the Milky Way runs from the wrist down to the bottom corner: a dense, bright ribbon of stars
        g.save(); g.globalAlpha *= .22 * a; tendril([[0, 0], [dir * .4 * sc, .9 * sc], [dir * .9 * sc, 1.8 * sc]], .8 * sc, C.tealLight, { sh: 0, grain: 0 }); g.restore();
        g.save(); g.globalAlpha *= .95 * a; for (let i = 0; i < 300; i++) { const u = hash(i * 1.3 + dir), v = hash(i * 7.9 + dir) - .5, y = u * 1.9 * sc, x = dir * .9 * sc * u * u + v * lerp(.35, .9, u) * sc; starAt(x, y, 2 + hash(i) * 6, i % 4 ? C.cream : C.goldPale); } g.restore();
      }
      if (a > 0) starHand(dir, q, sc, a);
      else if (linger > 0) { g.save(); g.globalAlpha *= linger * .6; const st = []; for (const [x, y] of [[-.38, 0], [.38, 0], [-.3, -1.57], [-.1, -1.69], [.1, -1.65], [.3, -1.51], [-.82, -.85]]) starAt(-dir * x * sc, y * sc, sc * (.03 + .015 * Math.sin(t * 5 + x * 9)), C.goldPale); g.restore(); }
      g.restore();
    }
    if (lt >= 0 && lt < .7) for (let i = 0; i < 12; i++) { const b = i / 12 * TAU, r = sc * (.2 + 1.4 * eo(lt / .7)); g.save(); g.globalAlpha *= (1 - lt / .7); starAt(Math.cos(b) * r, -sc * 1.1 + Math.sin(b) * r, sc * .06, C.white); g.restore(); }
    g.restore();
  }
  function shooting(t, x0, y0, ang, t0, len = 600) {
    const d = t - t0; if (d < 0 || d > .9) return;
    const u = eo(d / .9), x = x0 + Math.cos(ang) * len * u, y = y0 + Math.sin(ang) * len * u;
    g.save(); g.globalAlpha *= 1 - d / .9; tendril([[x - Math.cos(ang) * 260, y - Math.sin(ang) * 260], [x - Math.cos(ang) * 100, y - Math.sin(ang) * 100], [x, y]], 14, C.goldPale, { sh: 0, grain: 0 }); starAt(x, y, 20, C.white); g.restore();
  }
  const SKY = [...Array(170).keys()].map((i) => [hash(i * 3.7) * 1400 - 160, hash(i * 9.1) * 2600 - 400, 3 + hash(i * 5.3) * 8, hash(i)]);
  const FOUR = [[330, 1130, 200, -.22], [760, 1080, 190, .22], [330, 1640, 205, -.14], [760, 1600, 195, .18]];
  const MOON = { x: 540, y: 560, r: 147 }; // world; the camera carries it to the upper-left third
  SHOT(129.2, 142.48, 'stars', (t, k, d) => {
    // the camera drifts so the moon settles in the upper-left third, then keeps rising slowly
    const cx = kf3(t, [[129.2, 540], [131.0, 700], [142.48, 760]]), cy = kf3(t, [[129.2, 560], [131.0, 960], [142.48, 900]]);
    g.save(); cam(cx, cy, 1.0);
    sheet(C.tealInk);
    for (let i = 0; i < 5; i++) { g.save(); g.globalAlpha *= .45; cut(cloud(200 + i * 220 + Math.sin(t * .15 + i) * 40, 500 + i * 380, 900, 260, i + 60), i % 2 ? C.tealDeep : C.plumDeep, { sh: 0, grain: .3 }); g.restore(); }
    for (const [x, y, r, p] of SKY) { g.save(); g.globalAlpha *= .55 + .45 * Math.sin(t * (1.5 + p * 3) + p * 20); starAt(x, y, r, p > .7 ? C.white : C.goldPale); g.restore(); }
    // the moon: the clock face turning into a poppy-ringed moon (sleep, dreams); it dims as the star falls
    const mo = ss(129.4, 130.7, t), dim = 1 - .6 * ss(141.6, 142.4, t);
    g.save(); g.globalAlpha *= (1 - mo) * dim; clockFace(MOON.x, MOON.y, MOON.r, t, .3);
    for (const dir of [-1, 1]) clockHand(MOON.x, MOON.y, dir * .6, MOON.r * .62, MOON.r * .16);
    g.restore();
    g.save(); g.globalAlpha *= mo * dim; halo(MOON.x, MOON.y, MOON.r, t * .04, 1, [C.gold, C.cream, C.goldPale, C.gold], 'poppy'); haloMoon(MOON.x, MOON.y, MOON.r * .42); g.restore();
    glow(MOON.x, MOON.y, 420, '250,215,140', .25 * dim);
    g.restore();
    // the rowboat (screen space): drifting, then sailing down between the great starry palms, held inside the
    // last clap, glowing like a firefly, then rising out again
    const bx = kf3(t, [[129.2, 540], [137.8, 860], [139.3, 540], [140.7, 540], [141.7, 780], [142.48, 880]]);
    const by = kf3(t, [[129.2, 729], [131.0, 560], [137.8, 520], [139.3, 1180], [140.7, 1180], [141.7, 560], [142.48, 470]]) + Math.sin(t * 1.3) * 10;
    const bs = kf3(t, [[129.2, .315], [131, .42], [137.8, .42], [139.3, .34], [140.7, .34], [141.7, .38]]);
    const fire = t > K4 - .05 ? Math.exp(-1.5 * (t - K4)) * (.75 + .25 * Math.sin(t * 18)) : 0;
    if (fire > .02) glow(bx, by - 40, 240, '250,225,150', .75 * fire);
    rowboat(bx, by, bs, t * TAU / 1.03, 1 + fire);
    // the claps: one pair; then four; then the Milky Way's two great hands from the bottom corners
    constellation(t, 560, 1400, 300, K2, { linger: ss(K2 + 1.2, K2 + 1.6, t) * (1 - ss(K3 - 1.1, K3 - .8, t)) });
    for (const [x, y, sc, rot] of FOUR) { constellation(t, x, y, sc, K3, { rot, linger: ss(K3 + 1.2, K3 + 1.6, t) * (1 - ss(K4 - 1.1, K4 - .8, t)) }); for (let j = 0; j < 2; j++) shooting(t, x, y - sc * 1.6, rot - Math.PI / 2 + (j ? .9 : -.9), K3 + .02 + j * .08, 760); }
    constellation(t, 540, 1700, 560, K4, { milky: 1 });
    // the shower after the great clap
    for (let i = 0; i < 46; i++) { const t0 = K4 + .1 + hash(i * 2.2) * 1.4; shooting(t, hash(i * 4.4) * 1200 - 60, -200 + hash(i * 6.6) * 500, Math.PI / 2 + (hash(i) - .5) * .5, t0, 1600); }
    // the one falling star: a streak from the top left, curving down into the middle, swelling into the spotlight
    const f = ss(141.2, 142.45, t);
    if (f > 0) {
      const P = (u) => [lerp(lerp(120, 300, u), lerp(300, SPOT0.x, u), u), lerp(lerp(160, 900, u), lerp(900, SPOT0.y, u), u)];
      const [sx2, sy2] = P(eio(f)), trail = []; for (let i = 0; i <= 12; i++) trail.push(P(eio(Math.max(0, f - i * .025))));
      g.save(); g.globalAlpha *= .9; tendril(trail.reverse(), 16, C.goldPale, { sh: 0, grain: 0 }); g.restore();
      const r = lerp(14, SPOT0.r, ei(clamp((f - .7) / .3)));
      glow(sx2, sy2, r * 2.2 + 60, '250,215,140', .6 * f);
      starAt(sx2, sy2, 30 + r * .3, C.white);
      if (f > .7) { g.save(); g.globalAlpha *= ei(clamp((f - .7) / .3)); g.fillStyle = C.goldPale; g.fill(circle(sx2, sy2, r)); g.restore(); }
    }
  });
})();

// c03 · VERSE 2 (SEC.v2 - SEC.c2): the river in a thunderstorm, the steamers leaving, a heron on a lamp, the coal.
// Picks up c02's halo (teal, (540, 860) r 600, zoom 1.1) and turns it into a moon; ends pushing into the furnace mouth.
(() => {
  const hex = (c) => c[0] === '#' ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : c.match(/[\d.]+/g).slice(0, 3).map(Number);   // '#rrggbb' or 'rgb(r,g,b)', so mixes nest
  const mix = (a, b, k) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(k)))).join(',')})`; };
  const COAL = '#2c2a35';
  const ROARS = [59.1, 60.1, 61.13, 62.13];   // vocal onsets: roar, roar, thunder, roar (each on a beat)
  const BIRD = 69.33;                          // vocal onset of the cue word
  const LIGHT = 67.55;                         // the window lights on the line's first syllable
  const BITES = [71.367, 72.4, 73.433], TOSSES = [71.9, 72.9, 73.933];

  // a strike's envelope: a hard double flash, then decay
  const strikeE = (t, k) => { const lt = t - k; if (lt < 0) return 0; return Math.exp(-4.2 * lt) * (lt < .07 ? 1 : lt < .13 ? .35 : .9); };
  const spiral = (cx, cy, r0, a0, dir, n = 30) => [...Array(n)].map((_, i) => { const a = a0 + dir * i * .24, r = r0 * Math.pow(.94, i); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });

  // whiplash lightning: a sinuous bolt that ends in a spiral over the water, plus a branch
  function bolt(seed, x0, y0, x1, y1, e) {
    if (e < .03) return;
    const r = rng(seed), dir = r() < .5 ? 1 : -1;
    const main = whip([x0, y0], [x0 + (r() - .5) * 520, lerp(y0, y1, .3)], [x1 + (r() - .5) * 420, lerp(y0, y1, .68)], [x1, y1], .45, dir, 26)
      .map(([x, y], i) => i < 26 && i > 0 ? [x + (i % 2 ? 1 : -1) * 18 * (.4 + r()), y] : [x, y]);
    const b0 = main[9], br = whip(b0, [b0[0] - dir * 120, b0[1] + 90], [b0[0] - dir * 220, b0[1] + 160], [b0[0] - dir * 300, b0[1] + 300], .5, -dir, 14)
      .map(([x, y], i) => i < 14 && i > 0 ? [x + (i % 2 ? 1 : -1) * 12, y] : [x, y]);
    if (e > .2) { vine(s, br, 18, 8, C.gold); vine(s, main, 30, 12, C.gold); }
    f.save(); f.globalCompositeOperation = 'lighter'; f.lineCap = 'round'; f.lineJoin = 'round';
    for (const [pts, w] of [[main, 1], [br, .6]]) for (const [lw, col] of [[56 * w, `rgba(255,170,60,${.1 * e})`], [24 * w, `rgba(255,200,100,${.32 * e})`], [9 * w, `rgba(255,236,170,${.8 * e})`]]) { f.lineWidth = lw; f.strokeStyle = col; P(f, pts); f.stroke(); }
    f.restore();
    glowAt(x0, y0, 360, `rgba(255,200,130,${.25 * e})`);
    glowAt(x1, y1, 200, `rgba(255,215,150,${.35 * e})`);
  }
  function skyFlash(e, a = .09) { if (e < .02) return; f.save(); f.globalCompositeOperation = 'lighter'; f.fillStyle = `rgba(210,190,255,${a * e})`; f.fillRect(-W, -H, W * 3, H * 3); f.restore(); }

  // a Nouveau storm cloud: lobes in one outline (stroke pass, then fill pass), spiral curls in the lobes
  function cloud(x, y, w, h, seed, fillC) {
    const r = rng(seed), lobes = [];
    for (let i = 0; i < 6; i++) { const u = i / 5; lobes.push([x - w / 2 + u * w + (r() - .5) * w * .06, y - Math.sin(u * Math.PI) * h * (.35 + r() * .3), h * (.3 + .32 * Math.sin(u * Math.PI)) + r() * h * .1]); }
    const base = blobPts(x, y + h * .12, w * .56, h * .28, seed, .05, 40);
    s.lineJoin = 'round'; s.lineWidth = 30; s.strokeStyle = C.umber;
    for (const [lx, ly, lr] of lobes) { P(s, circle(lx, ly, lr, 36)); s.closePath(); s.stroke(); }
    P(s, base); s.closePath(); s.stroke();
    s.fillStyle = mix(fillC, C.cream, .22);
    for (const [lx, ly, lr] of lobes) { P(s, circle(lx, ly, lr, 36)); s.closePath(); s.fill(); }
    P(s, base); s.closePath(); s.fill();
    s.fillStyle = fillC;   // the body, leaving a pale moonlit rim on the lobes' tops
    for (const [lx, ly, lr] of lobes) { P(s, circle(lx + lr * .06, ly + lr * .14, lr * .86, 36)); s.closePath(); s.fill(); }
    P(s, base); s.closePath(); s.fill();
    for (let i = 1; i < 5; i += 2) { const [lx, ly, lr] = lobes[i]; line(spiral(lx + lr * .1, ly + lr * .05, lr * .55, r() * TAU, i % 4 ? 1 : -1), C.umber, 12); }
  }
  // the far shore: Nouveau rooftops and domes, a few lit windows
  function shore(yH, seed, e, lit = 1) {
    const r = rng(seed), pts = [[-400, yH + 40]]; let x = -400; const wins = [];
    while (x < 1500) { const w = 90 + r() * 170, h = 60 + r() * 230, dome = r() < .35; pts.push([x, yH - h]);
      if (dome) for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; pts.push([x + w / 2 + Math.cos(a) * w / 2, yH - h + Math.sin(a) * w * .45]); }
      else if (r() < .5) pts.push([x + w * .5, yH - h - 50]);
      pts.push([x + w, yH - h]); if (r() < .6) wins.push([x + w * (.3 + r() * .4), yH - h * (.3 + r() * .4)]); x += w; }
    pts.push([1500, yH + 40]);
    shape(s, pts, mix('#141a28', C.plum, .25 + .15 * e), C.umber, 16);
    for (const [wx, wy] of wins) { shape(s, [[wx - 12, wy + 18], [wx - 12, wy - 6], [wx, wy - 18], [wx + 12, wy - 6], [wx + 12, wy + 18]], C.amber, C.umber, 8); glowAt(wx, wy, 60, `rgba(255,190,110,${.5 * lit})`); }
  }
  // the river: deep teal, rows of whiplash crests, nearer rows bigger and faster
  function river(yH, t, e = 0, sp = 1, rows = 9) {
    s.fillStyle = vgrad(yH, yH + 1000, [[0, mix(C.dusk, C.parch, e * .5)], [.3, C.teal], [1, C.deep]]); s.fillRect(-W, yH, W * 3, H * 3);
    for (let j = 0; j < rows; j++) { const q = j / (rows - 1), y = yH + 26 + Math.pow(q, 1.5) * 1000, A = 5 + q * 26, L = 140 + q * 380, ph = t * (.8 + q * 2.2) * sp + j * 1.7;
      const pts = []; for (let x = -320; x <= 1400; x += 28) pts.push([x, y + Math.sin(x / L * TAU + ph) * A + Math.sin(x / L * 2.3 + j) * A * .4]);
      line(pts, C.umber, 8 + q * 12); line(pts, mix(C.glass, C.cream, e * .7), 3 + q * 6); }
  }
  // a Nouveau river steamer in profile, bow to +x; origin on the waterline, ~760 px long at sc 1
  function steamer(x, y, sc, t, lit = 1, seed = 0, crew = true) {
    for (const g of [s, f]) { g.save(); g.translate(x, y); g.scale(sc, sc); }
    // smoke first (behind the stacks): ribbons trailing back, curling into spirals
    for (const [sx, i] of [[40, 0], [180, 1]]) { const wb = Math.sin(t * 1.3 + i + seed) * 40;
      vine(s, whip([sx, -330], [sx - 30 + wb * .3, -560], [sx - 230, -680 - wb], [sx - 380, -560 + wb], 1.25, -1, 34), 62, 26, i ? C.parch : mix(C.parch, C.dusk, .35)); }
    // stacks
    for (const sx of [40, 180]) { shape(s, [[sx - 26, -150], [sx - 32, -340], [sx + 32, -340], [sx + 26, -150]], C.deep, C.umber, 14); shape(s, [[sx - 34, -300], [sx + 34, -300], [sx + 34, -270], [sx - 34, -270]], C.gold, C.umber, 8); }
    // cabin with arched windows
    shape(s, [[-250, -40], [-250, -170], [300, -170], [300, -40]], C.cream, C.umber, 14);
    shape(s, [[-280, -170], [330, -170], [300, -205], [-250, -205]], C.olive, C.umber, 12);
    for (let i = 0; i < 6; i++) { const wx = -200 + i * 90; shape(s, [[wx, -60], [wx, -120], ...circle(wx + 24, -120, 24, 16).filter(([, py]) => py <= -120).sort((a, b) => a[0] - b[0]), [wx + 48, -120], [wx + 48, -60]], C.amber, C.umber, 8); if (lit > 0) glowAt(wx + 24, -95, 70, `rgba(255,190,110,${.55 * lit})`); }
    // hull with a gold stripe
    shape(s, [...cub([-380, -40], [-150, -48], [200, -50], [420, -80], 16), ...cub([420, -80], [380, 0], [340, 30], [300, 40], 8), [-330, 40], [-380, -40]], C.plum, C.umber, 16);
    line(cub([-370, -22], [-150, -28], [200, -30], [400, -58], 16), C.gold, 12);
    // stern paddle wheel, turning
    shape(s, circle(-360, -30, 105, 36), C.olive, C.umber, 14);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t * 3; line([[-360, -30], [-360 + Math.cos(a) * 100, -30 + Math.sin(a) * 100]], C.umber, 12); }
    shape(s, circle(-360, -30, 26, 16), C.gold, C.umber, 8);
    // a dark wheelhouse on the roof: the value step the crew reads against
    if (crew) shape(s, [[-270, -205], [-270, -400], [-10, -400], [-10, -205]], mix(C.night, C.plum, .3), C.umber, 14);
    for (const g of [s, f]) g.restore();
    // the crew at the roof rail, waving white handkerchiefs back toward the shore
    if (crew && sc * 230 > 50) for (let i = 0; i < 3; i++) sailor(t, x + (-220 + i * 85) * sc, y - 205 * sc, 230 * sc, { seed: seed * 7 + i, facing: -1 });
  }
  // a cream heron: feet at (x, y). fold 0 = wings spread in flight .. 1 = folded; flap = wing phase
  function heron(x, y, sc, fold, flap, legs = 1, rot = 0) {
    s.save(); s.translate(x, y); s.rotate(rot); s.scale(sc, sc);
    const wa = lerp(-1.85 + Math.sin(flap) * .85, Math.PI + .3, fold), wl = lerp(330, 230, fold);
    // a wing: three layered almonds from the shoulder, swept back (they close up as it folds)
    const wing = (col, da, k) => { const a = wa + da, L = wl * k;
      for (let i = 2; i >= 0; i--) petal(s, 10, -200, a + i * lerp(.22, .06, fold), L * (1 - i * .12), lerp(64, 46, fold) * k, [col, C.parch, C.cream][i], C.umber, 12); };
    wing(C.sage, -.25 * (1 - fold), .9);                                                // far wing
    // legs: hanging forward to land, trailing when flying
    const la = lerp(.9, 0, legs);
    for (const dx of [-14, 14]) { const ft = [dx - Math.sin(la) * 150, -150 + Math.cos(la) * 150]; line([[dx * .5, -150], ft], C.umber, 16); line([[dx * .5, -150], ft], C.ochre, 7); }
    // body, tail plumes
    for (let i = 0; i < 3; i++) petal(s, -60, -175, Math.PI - .25 + (i - 1) * .25, 150, 30, i === 1 ? C.parch : C.cream, C.umber, 10);
    shape(s, blobPts(0, -190, 120, 58, 3, .04, 36, -.25), C.cream, C.umber, 14);
    // the S of the neck, head, gold beak, a trailing crest
    const neck = cub([80, -220], [40, -330], [150, -350], [100, -450], 24);
    vine(s, neck, 34, 24, C.cream);
    shape(s, blobPts(110, -465, 34, 26, 5, .03, 20, -.1), C.cream, C.umber, 12);
    petal(s, 132, -470, .12, 130, 13, C.gold, C.umber, 10);
    vine(s, whip([92, -480], [60, -500], [30, -495], [5, -470], .6, -1, 10), 14, 7, C.parch);
    wing(C.cream, .2 * (1 - fold), 1);                                                  // near wing
    s.restore();
  }
  // coal lumps and sparks
  function lump(x, y, r, seed) { shape(s, blobPts(x, y, r, r * .8, seed, .25, 7, seed), '#3a3646', C.umber, 10); petal(s, x - r * .45, y - r * .1, -.6 + seed, r * .9, r * .35, C.dusk, null); }
  function sparks(t, k, x, y, n, seed, spd = 800, life = .9, spread = TAU, a0 = 0, grav = 900) {
    const lt = t - k; if (lt < 0 || lt > life * 1.3) return;
    const r = rng(seed); f.save(); f.globalCompositeOperation = 'lighter'; f.lineCap = 'round';
    for (let i = 0; i < n; i++) { const a = a0 + (r() - .5) * spread, v = spd * (.35 + r() * .65), L = life * (.5 + r() * .7), g = 150 + r() * 90 | 0, w = 3 + r() * 5, u = lt / L; if (u >= 1) continue;
      const px = x + Math.cos(a) * v * lt, py = y + Math.sin(a) * v * lt + .5 * grav * lt * lt, vx = Math.cos(a) * v, vy = Math.sin(a) * v + grav * lt;
      f.strokeStyle = `rgba(255,${g},80,${1 - u})`; f.lineWidth = w; f.beginPath(); f.moveTo(px - vx * .04, py - vy * .04); f.lineTo(px, py); f.stroke(); }
    f.restore();
  }

  // ---- shots ----
  // 56.88: c02's halo loses its mosaic and becomes a ringed moon; its tendrils draw back in; storm clouds roll over it; the river appears
  function moon(t, lt, dur) {
    const m = ease.inOut(inv(SEC.v2 + .15, SEC.v2 + 1.7, t)), cl = ease.inOut(inv(57.2, 59.1, t));
    cam(540, lerp(900, 930, m), lerp(1.1, .94, ease.inOut(inv(SEC.v2, 59.1, t))));
    s.fillStyle = vgrad(-300, 1700, [[0, mix(C.teal, '#151d2e', m)], [1, mix(C.teal, C.dusk, m)]]); s.fillRect(-W, -H, W * 3, H * 3);
    const R = lerp(600, 330, m), cy = lerp(860, 640, m);
    glowAt(540, cy, R * 1.5, `rgba(220,230,255,${.22 * m * (1 - .6 * cl)})`);
    shape(s, circle(540, cy, R), C.parch, C.umber, 16); shape(s, circle(540, cy, R * .82), C.cream, C.umber, 12);
    for (let i = 0; i < 3; i++) petal(s, 540 + [-.3, .25, .05][i] * R, cy + [-.2, .1, .38][i] * R, [.4, 2.2, -1][i], R * .3, R * .1, mix(C.cream, C.parch, .6), null);
    if (m < 1) { s.globalAlpha = 1 - m; halo(540, cy, R, -t * .1); s.globalAlpha = 1; }
    // c02's tendrils, drawing back into the ring
    const u = 1 - ease.in(inv(SEC.v2, 57.9, t)), k = R / 600;
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + .13, dir = i % 2 ? 1 : -1, Q = (q) => [540 + Math.cos(a + q[1] * dir) * q[0] * k, cy + Math.sin(a + q[1] * dir) * q[0] * k];
      vine(s, whip(Q([610, 0]), Q([720, .12]), Q([820, .32]), Q([880, .5]), .8, dir, 36), 30, 12, i % 3 ? C.sage : C.gold, u); }
    // the river and the far shore fade up under it
    s.globalAlpha = m; river(1420, t, 0, 1, 7); shore(1420, 4, 0, m); s.globalAlpha = 1;
    // storm clouds roll in from both sides and over the moon
    const e0 = .5 * hit(t, 58.6, 5) * (t > 58.6 ? 1 : 0);
    cloud(lerp(-760, 250, cl), cy + 130, 950, 300, 21, mix(C.dusk, C.blush, e0 * .4));
    cloud(lerp(1850, 860, cl), cy - 60, 900, 280, 22, mix(mix(C.dusk, C.night, .4), C.blush, e0 * .3));
    cloud(lerp(-900, 120, ease.inOut(inv(57.8, 59.1, t))), cy - 330, 820, 240, 23, mix(C.night, C.dusk, .3));
    glowAt(300, cy + 80, 360, `rgba(255,210,170,${.5 * e0})`);   // heat lightning in the cloud on the pickup
    rain(t, Math.round(lerp(60, 170, m)), 19, lerp(.35, .55, m), lerp(2100, 2600, m), lerp(.12, .2, m));
    border(t, 1);
  }
  // 59.1: wide over the river, a gold whiplash bolt on each roar; the sky flashes
  function storm(t, lt, dur) {
    const e1 = strikeE(t, ROARS[0]), e2 = strikeE(t, ROARS[1]), e = Math.max(e1, e2);
    cam(540 + Math.sin(t * 61) * 14 * e, 960 + Math.cos(t * 53) * 10 * e, kf(lt, [[0, .98], [dur, 1.08]], ease.out), Math.sin(t * 40) * .006 * e);
    s.fillStyle = vgrad(-200, 1300, [[0, mix('#151d2e', C.plum, e * .6)], [1, mix(C.dusk, C.blush, e * .5)]]); s.fillRect(-W, -H, W * 3, H * 3);
    shape(s, circle(800, 300, 140), C.parch, C.umber, 14); shape(s, circle(800, 300, 115), C.cream, C.umber, 10);
    bolt(301, 330, 520, 420, 1200, e1); bolt(302, 760, 480, 650, 1200, e2);
    const d = t * 14;
    cloud(170 + d, 560, 900, 320, 31, mix(C.dusk, C.blush, e1 * .55));
    cloud(980 - d, 400, 960, 300, 32, mix(mix(C.dusk, C.night, .3), C.blush, e2 * .5));
    cloud(450 + d * .5, 160, 1100, 260, 33, mix(C.night, C.plum, .3 + e * .4));
    river(1200, t, e, 1.4); shore(1200, 6, e);
    for (const [x, ee] of [[420, e1], [650, e2]]) for (let i = 0; i < 5; i++) glowAt(x + Math.sin(i * 2.1 + t * 5) * 20, 1280 + i * 110, 110 - i * 10, `rgba(255,220,150,${.5 * ee})`);
    skyFlash(e);
    rain(t, 220, 23, .6, 2700, .2);
    border(t, 1);
  }
  // 61.13: lower and closer over the churning water: the thunder splits in two, then the last roar; a steamer shows on the horizon
  function stormLow(t, lt, dur) {
    const e1 = strikeE(t, ROARS[2]), e2 = strikeE(t, ROARS[3]), e = Math.max(e1, e2);
    cam(540 + Math.sin(t * 61) * 18 * e, 1080 + Math.cos(t * 53) * 12 * e, kf(lt, [[0, 1.12], [dur, 1.2]], ease.out), Math.sin(t * 40) * .008 * e);
    s.fillStyle = vgrad(0, 1050, [[0, mix('#151d2e', C.plum, e * .6)], [1, mix(C.dusk, C.blush, e * .5)]]); s.fillRect(-W, -H, W * 3, H * 3);
    bolt(311, 520, 480, 260, 1020, e1); bolt(312, 520, 480, 820, 1020, e1 * .9); bolt(313, 700, 420, 560, 1020, e2);
    const d = t * 18;
    cloud(-60 + d, 520, 1000, 330, 41, mix(C.dusk, C.blush, e1 * .55));
    cloud(1100 - d, 420, 900, 320, 42, mix(mix(C.dusk, C.night, .3), C.blush, e2 * .55));
    shore(1020, 8, e);
    const sp = ease.out(inv(61.6, 62.4, t)); if (sp > 0) steamer(900, 1030, .2, t, sp, 1, false);
    river(1020, t, e, 2.2, 10);
    for (const [x, ee] of [[260, e1], [820, e1], [560, e2]]) for (let i = 0; i < 5; i++) glowAt(x + Math.sin(i * 2.1 + t * 5) * 24, 1100 + i * 120, 120 - i * 10, `rgba(255,220,150,${.5 * ee})`);
    skyFlash(e, .2);
    rain(t, 260, 27, .65, 3000, .24);
    border(t, 1);
  }
  // 62.4: the steamers sail away down the river into the rain, smoke curling, shrinking toward the horizon
  function leaving(t, lt, dur) {
    cam(540, 980, kf(lt, [[0, 1.0], [dur, 1.08]]));
    const yH = 820, VP = [640, yH];
    s.fillStyle = vgrad(-200, yH, [[0, '#151d2e'], [1, C.dusk]]); s.fillRect(-W, -H, W * 3, H * 3);
    cloud(200 + t * 10, 300, 1000, 280, 51, mix(C.dusk, C.night, .3)); cloud(900 - t * 10, 200, 900, 260, 52, mix(C.night, C.plum, .3));
    shore(yH, 10, 0);
    river(yH, t, 0, 1, 11);
    // three boats, the farthest first; each glides toward the vanishing point and fades into the rain
    for (const [t0, x0, y0, s0, sd] of [[60.6, 760, 1050, .5, 1], [61.8, 300, 1240, .75, 2], [62.6, 620, 1480, 1.05, 3]]) {
      const p = clamp((t - t0) / 6.5), q = ease.out(p) * .85, sc = s0 * Math.pow(.12, q);
      s.globalAlpha = lerp(1, .3, q); steamer(lerp(x0, VP[0], q), lerp(y0, VP[1] + 6, q), sc, t, 1 - q * .6, sd); s.globalAlpha = 1;
    }
    s.fillStyle = vgrad(yH - 260, yH + 260, [[0, 'rgba(61,74,104,0)'], [.5, 'rgba(61,74,104,.55)'], [1, 'rgba(61,74,104,0)']]); s.fillRect(-W, yH - 260, W * 3, 520);
    rain(t, 220, 29, .55, 2600, .2);
    border(t, 1);
  }
  // 64.88: close on the last steamer's stern, its wheel churning a wake, then it shrinks away into the rain and mist
  function lastBoat(t, lt, dur) {
    cam(560, 1000, kf(lt, [[0, 1.0], [dur, 1.1]]));
    const yH = 760, p = ease.inOut(inv(0, dur, lt)), x = lerp(640, 680, p), y = lerp(1330, yH + 40, ease.out(p)), sc = lerp(1.6, .22, ease.out(p));
    s.fillStyle = vgrad(-200, yH, [[0, '#151d2e'], [1, C.dusk]]); s.fillRect(-W, -H, W * 3, H * 3);
    cloud(400 + t * 12, 260, 1100, 300, 61, mix(C.dusk, C.night, .3));
    shore(yH, 12, 0);
    river(yH, t, 0, 1.2, 11);
    // the wake: whiplash lines spreading behind the stern
    for (const dir of [-1, 1]) { const x0 = x - 400 * sc, y0 = y + 20 * sc; vine(s, whip([x0, y0], [x0 - 220, y0 + dir * 30 * sc + 20], [x0 - 480, y0 + dir * 70 * sc + 60], [x0 - 700, y0 + dir * 110 * sc + 120], .7, dir, 30), 18, 8, mix(C.glass, C.cream, .3), 1); }
    s.globalAlpha = lerp(1, .25, p); steamer(x, y, sc, t, 1 - p * .7, 4); s.globalAlpha = 1;
    s.fillStyle = vgrad(yH - 300, yH + 400, [[0, 'rgba(61,74,104,0)'], [.5, `rgba(61,74,104,${lerp(.3, .7, p)})`], [1, 'rgba(61,74,104,0)']]); s.fillRect(-W, yH - 300, W * 3, 700);
    rain(t, 230, 31, .55, 2600, .2);
    border(t, 1);
  }
  // 66.96: the waterfront: a window lights (a Galle lamp in it); pan to a lamp pole; a heron glides in and lands on the cue word, folding its wings
  function heronShot(t, lt, dur) {
    const pan = ease.inOut(inv(67.9, 69.0, t));
    cam(lerp(400, 760, pan), lerp(1060, 820, pan), lerp(1.12, 1.04, pan) + .14 * ease.inOut(inv(BIRD - .2, 70.68, t)));
    s.fillStyle = vgrad(-200, 1500, [[0, '#151d2e'], [1, C.dusk]]); s.fillRect(-W, -H, W * 3, H * 3);
    cloud(700 + t * 8, 280, 1000, 260, 71, mix(C.dusk, C.night, .4));
    const on = clamp(inv(LIGHT - .05, LIGHT + .12, t)) * (.9 + .1 * Math.sin(t * 13));
    // the building: plum stucco, an arched window with leading
    shape(s, [[-400, 1520], [-400, 380], [620, 380], [620, 1520]], C.plum, C.umber, 18);
    shape(s, [[-400, 380], [660, 380], [660, 330], [-400, 330]], C.olive, C.umber, 14);
    const wx = 110, wy = 620, ww = 440, wh = 680;
    const arch = [[wx, wy + wh], [wx, wy + ww / 2], ...circle(wx + ww / 2, wy + ww / 2, ww / 2, 40).filter(([, py]) => py <= wy + ww / 2 + .1).sort((a, b) => a[0] - b[0]), [wx + ww, wy + ww / 2], [wx + ww, wy + wh]];
    shape(s, arch, mix(C.deep, C.amber, on), C.umber, 22);
    // one in the window: the old passenger with the walrus moustache, looking out at the rain, lit from behind
    s.save(); P(s, arch); s.closePath(); s.clip();
    passenger(t, wx + ww * .42, wy + wh + 470, 980, { who: 'old', pose: 'stand', facing: 1, ph: t * .5 });
    s.restore();
    line([[wx + ww / 2, wy + 20], [wx + ww / 2, wy + 150]], C.umber, 14);
    shape(s, [[wx - 40, wy + wh], [wx + ww + 40, wy + wh], [wx + ww + 55, wy + wh + 40], [wx - 55, wy + wh + 40]], C.ochre, C.umber, 12);
    if (on > 0) { glowAt(wx + ww / 2, wy + 400, 420, `rgba(255,180,100,${.45 * on})`);  }
    // the quay and the water
    shape(s, [[-400, 1520], [1500, 1520], [1500, 1580], [-400, 1580]], C.ochre, C.umber, 16);
    river(1580, t, 0, 1, 6);
    for (let i = 0; i < 5; i++) { glowAt(wx + ww / 2 + Math.sin(t * 3 + i) * 20, 1640 + i * 70, 90, `rgba(255,170,90,${.35 * on})`); glowAt(860 + Math.sin(t * 3 + i + 2) * 16, 1640 + i * 70, 80, `rgba(255,190,110,.3)`); }
    // the lamp pole: an iron whiplash stem with a lit lily-bud lantern; it rocks when the heron lands
    const px = 860, sw = Math.sin((t - BIRD) * 9) * 14 * hit(t, BIRD, 2.5);
    vine(s, cub([px, 1530], [px - 30, 1200], [px + 30, 950], [px + sw, 800], 30), 34, 22, C.olive);
    for (const d of [-1, 1]) vine(s, whip([px, 1300], [px + d * 50, 1260], [px + d * 80, 1200], [px + d * 70, 1150], .7, d, 16), 18, 8, C.olive);
    shape(s, blobPts(px + sw, 740, 52, 70, 8, .03, 30), C.amber, C.umber, 14);
    shape(s, [[px + sw - 80, 680], [px + sw + 80, 680], [px + sw + 40, 650], [px + sw - 40, 650]], C.olive, C.umber, 12);
    glowAt(px + sw, 740, 300, 'rgba(255,170,80,.5)'); glowAt(px + sw, 740, 80, 'rgba(255,235,190,.9)');
    // the heron: glides in, flaps, flares its wings to brake, lands, folds
    const fp = inv(68.25, BIRD, t);
    if (fp > 0) {
      const path = cub([-260, 260], [250, 120], [700, 420], [px + 10, 650], 60), i = Math.floor((1 - (1 - fp) * (1 - fp)) * 60), [hx, hy] = path[Math.min(60, i)];
      const fold = ease.inOut(inv(BIRD + .05, BIRD + .75, t)), brake = inv(BIRD - .35, BIRD, t);
      const flap = (t - 68.25) * TAU * 2.1 * (1 - brake) + brake * -1.3;
      const bob = t > BIRD ? Math.sin((t - BIRD) * 14) * 12 * hit(t, BIRD, 4) : 0;
      heron(hx + (t > BIRD ? sw : 0), hy + bob, .95, fold, flap, ease.inOut(inv(BIRD - .55, BIRD - .1, t)), lerp(-.2, 0, ease.out(fp)));
    }
    rain(t, 170, 37, .5, 2400, .18);
    border(t, 1);
  }
  // 70.68: on the steamer's deck the millionaire himself (top hat, monocle, tails) shovels the coal: his blade bites
  // the heap on each bite beat and throws on the next beat, the furnace flaring; then we push into its mouth
  function stokePh(t) { const b = beatPhase(t) - lastBeat(BITES[0] + .01), c = Math.floor(b / 2), r = b - c * 2; return c + (r < 1 ? r * .62 : .62 + (r - 1) * .38); }
  function coal(t, lt, dur) {
    const push = ease.in(inv(73.95, SEC.c2, t)), mx = 960, my = 820;
    // wide on the deck, in close on him for the cue word, back out to the furnace, then into its mouth
    const cx0 = kf(t, [[70.68, 520], [72.2, 500], [73.0, 540], [73.95, 660]]), cy0 = kf(t, [[70.68, 1150], [72.2, 1040], [73.0, 1060], [73.95, 1000]]), z0 = kf(t, [[70.68, 1.0], [72.1, 1.32], [72.95, 1.3], [73.95, 1.0]]);
    cam(lerp(cx0, mx, push), lerp(cy0, my, push), lerp(z0, 4.6, push));
    let flare = 0; for (const k of TOSSES) flare = Math.max(flare, hit(t, k, 3.5) * (t >= k ? 1 : 0));
    const heat = lerp(.35, .85, inv(70.68, 74.2, t)) + .4 * flare;
    // night and rain beyond the ironwork railing
    s.fillStyle = vgrad(-300, 1000, [[0, '#151d2e'], [1, C.dusk]]); s.fillRect(-W, -H, W * 3, H * 3);
    line([[-400, 1000], [1500, 1000]], C.umber, 30); line([[-400, 1000], [1500, 1000]], C.olive, 14);
    for (let i = 0; i < 7; i++) { const x = -160 + i * 230, d = i % 2 ? 1 : -1; vine(s, whip([x, 1150], [x + d * 60, 1100], [x - d * 40, 1050], [x + d * 50, 1020], .6, d, 18), 18, 8, C.olive); line([[x, 1000], [x, 1150]], C.umber, 14); }
    // the deck: planks in perspective
    shape(s, [[-400, 1150], [1500, 1150], [1500, 2400], [-400, 2400]], C.ochre, C.umber, 16);
    for (let i = -6; i <= 12; i++) line([[540 + i * 90, 1150], [540 + i * 260, 2400]], C.umber, 12);
    // the furnace: a riveted boiler front with an arched mouth up high, its door swung open
    shape(s, [[760, 1350], [760, 470], ...circle(1000, 470, 240, 40).filter(([, py]) => py <= 470).sort((a, b) => a[0] - b[0]), [1240, 470], [1240, 1350]], C.deep, C.umber, 20);
    for (let i = 0; i < 10; i++) shape(s, circle(790, 520 + i * 85, 13, 10), C.olive, C.umber, 6);
    const mw = 300, mh = 300;
    const mouth = [[mx - mw / 2, my + mh / 2], [mx - mw / 2, my - mh / 2 + mw / 2], ...circle(mx, my - mh / 2 + mw / 2, mw / 2, 30).filter(([, py]) => py <= my - mh / 2 + mw / 2 + .1).sort((a, b) => a[0] - b[0]), [mx + mw / 2, my - mh / 2 + mw / 2], [mx + mw / 2, my + mh / 2]];
    shape(s, mouth, mix(C.ruby, C.amber, clamp(heat - .2)), C.umber, 22);
    for (let i = 0; i < 5; i++) { const fx = mx - 120 + i * 60, fh = 110 + 70 * noise1(t * 4 + i * 3, 2) + 80 * flare; petal(s, fx, my + mh / 2 - 10, -Math.PI / 2 + Math.sin(t * 5 + i) * .15, fh, 30, i % 2 ? C.gold : C.cream, C.umber, 8); }
    glowAt(mx, my, 520, `rgba(255,140,60,${.4 * heat})`); glowAt(mx, my + 40, 220, `rgba(255,225,160,${.7 * heat})`);
    shape(s, [[mx - mw / 2 - 10, my + mh / 2], [mx - mw / 2 - 10, my - mh / 2 + 40], [mx - mw / 2 - 110, my - mh / 2 + 70], [mx - mw / 2 - 110, my + mh / 2 + 40]], C.olive, C.umber, 16);
    // the coal heap at his feet
    shape(s, blobPts(980, 1770, 300, 150, 9, .1, 40), COAL, C.umber, 18);
    const r = rng(77); for (let i = 0; i < 22; i++) { const a = r() * Math.PI, rr = Math.sqrt(r()), x = 980 + Math.cos(a) * rr * 270 * (r() < .5 ? 1 : -1), y = 1770 - Math.sin(a) * rr * 120; lump(x, y, 22 + r() * 14, i); }
    // the millionaire, lit from the furnace side
    const J = millionaire(t, 330, 1760, 1000, { ph: stokePh(t), facing: 1 });
    glowAt(J.hc[0] + 120, J.hc[1], 260, `rgba(255,150,70,${.22 * heat})`);
    // a bite kicks up grit at the blade; each throw sends sparks out of the mouth
    BITES.forEach((k, j) => { if (J.blade && t >= k && t < k + .5) sparks(t, k, J.blade[0], J.blade[1], 14, 500 + j, 450, .5, 1.6, -Math.PI / 2, 900); });
    TOSSES.forEach((k, j) => sparks(t, k + .08, mx, my, 34, 600 + j, 700, .8, 1.6, -Math.PI / 2 - .9, 700));
    // the glow takes the frame as we push in
    if (push > .3) { s.fillStyle = `rgba(240,176,74,${ease.in(inv(.3, 1, push)) * .85})`; s.fillRect(-W, -H, W * 3, H * 3); glowAt(mx, my, 900, `rgba(255,190,110,${.6 * ease.in(inv(.3, 1, push))})`); }
    rain(t, 120, 41, .4 * (1 - push), 2400, .18);
    border(t, 1);
  }
  chapter('c03', SEC.v2, SEC.c2, [
    [SEC.v2, moon],
    [ROARS[0], storm],
    [ROARS[2], stormLow],
    [62.4, leaving],
    [64.88, lastBoat],
    [66.96, heronShot],
    [70.68, coal],
  ], { fx: PAINT });
})();

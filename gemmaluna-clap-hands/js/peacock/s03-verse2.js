// 56.88-73.6 VERSE 2: the storm river. The crowd's great halo becomes the moon in the storm; gold lightning on
// each "roar" and "thunder"; tilt down to steamers leaving into the rain; the last one shrinks to its stern
// light on the horizon, which becomes the lit window on the waterfront (a hand waves from it); a heron lands on
// the lamp pole on "bird"; the lamp becomes a lantern on the steamer's deck, where white gloves shovel coal
// on the beats; push into the furnace door, which becomes the boiler room's furnace (chorus 2).
(() => {
  const ROARS = [58.98, 59.86, 61.06, 62.04];
  // a lightning bolt: a gold zigzag ribbon with a whiplash curl branching off
  function bolt(x0, y0, x1, y1, seed, w = 34) {
    const pts = [], n = 8;
    for (let i = 0; i <= n; i++) { const u = i / n; pts.push([lerp(x0, x1, u) + (i && i < n ? (i % 2 ? 1 : -1) * (40 + hash(seed + i) * 60) : 0), lerp(y0, y1, u)]); }
    cut(ribbonAlong(pts, w), C.goldPale, { sh: .8, lift: .5 });
    cut(ribbonAlong(pts, w * .35), C.white, { sh: 0, grain: 0 });
    const m = pts[3]; tendril(whipPts(m, [m[0] + 60, m[1] + 40], [m[0] + 140, m[1] + 60], [m[0] + 170, m[1] + 160], 34, 1), 14, C.goldPale, { sh: .4 });
  }
  // a paddle steamer, side view, facing left; its stern light is at (130 s, -60 s)
  function steamer(x, y, s, t, seed, lightOnly = 0) {
    g.save(); g.translate(x, y); g.scale(s, s); g.rotate(Math.sin(t * 1.7 + seed) * .025);
    for (const fx of [-20, 50]) {
      const v = whipPts([fx, -230], [fx + 60, -320], [fx + 180, -300], [fx + 260, -380], 40, -1);
      tendril(v, 36, C.cream, { sh: .3, alpha: .5, grain: .3 });
    }
    cut(blob([[-230, -50], [-170, 30], [150, 30], [200, -40], [210, -60], [-240, -66]], .4), C.plum, { sh: .9, lift: .3 });
    cut(rect(-235, -72, 445, 12), C.gold, { sh: .3, grain: 0 });
    cut(cutRect(-150, -140, 260, 70, seed), C.cream, { sh: .6 });
    for (let i = 0; i < 5; i++) cut(archPath(-130 + i * 48, -128, 26, 40), C.goldPale, { sh: 0, grain: .2 });
    for (const fx of [-40, 30]) { cut(rect(fx - 14, -240, 28, 100), C.goldDeep, { sh: .5 }); cut(rect(fx - 18, -250, 36, 14), C.plumDeep, { sh: .3 }); }
    const pb = new Path2D(); pb.arc(20, -50, 80, Math.PI, 0); pb.closePath(); cut(pb, C.gold, { sh: .6 });
    for (let i = 0; i < 5; i++) { const a = Math.PI + (i + .5) / 5 * Math.PI; g.save(); g.globalAlpha *= .7; g.strokeStyle = C.goldDeep; g.lineWidth = 6; g.beginPath(); g.moveTo(20, -50); g.lineTo(20 + Math.cos(a) * 76, -50 + Math.sin(a) * 76); g.stroke(); g.restore(); }
    cut(circle(185, -78, 12), C.goldPale, { sh: .2, grain: 0 });
    g.restore();
  }
  // the heron: perched (fold 1 = wings folded) or flying (wings at flap phase ph). Feet at (0,0), facing left
  function heron(x, y, s, fold, ph) {
    g.save(); g.translate(x, y); g.scale(s, s);
    const fly = 1 - fold;
    // legs: down when perched, trailing back in flight
    if (fold > .2) for (const lx of [0, 16]) cut(capsule(lx, 0, lx + 6, -130, 5, 6), C.plumDeep, { sh: .3, grain: 0 });
    else for (const ly of [0, 10]) cut(capsule(110, -170 + ly, 230, -150 + ly, 5, 4), C.plumDeep, { sh: .3, grain: 0 });
    // the far wing, then the body, neck, head
    const wa = fly * (Math.sin(ph) * .9 - .2);
    g.save(); g.translate(10, -190); g.rotate(-wa - .2); g.scale(lerp(.5, 1, fly), 1);
    cut(blob([[0, 0], [60, -40], [200, -60 - 80 * fly], [260, -30 - 120 * fly], [150, 10], [20, 20]], .5), C.creamDeep, { sh: .4, alpha: .9 }); g.restore();
    cut(blob([[-70, -180], [-20, -215], [70, -205], [120, -170], [60, -150], [-30, -150]], .5), C.cream, { sh: .8, lift: .3 });
    const neck = fold > .2 ? [[-50, -190], [-80, -240], [-40, -290], [-70, -340]] : [[-60, -185], [-110, -195], [-150, -190], [-190, -200]];
    tendril(neck, 26, C.cream, { sh: .5 });
    const hx = neck[3][0], hy = neck[3][1];
    cut(ellipse(hx, hy, 26, 18, -.2), C.cream, { sh: .5 });
    cut(poly([[hx - 18, hy - 6], [hx - 110, hy + 6], [hx - 18, hy + 8]]), C.goldDeep, { sh: .3 });
    cut(blob([[hx + 10, hy - 14], [hx + 60, hy - 30], [hx + 90, hy - 20], [hx + 30, hy - 4]], .5), C.plum, { sh: .3 });
    cut(circle(hx - 8, hy - 4, 4), C.plumDeep, { sh: 0, grain: 0 });
    // near wing: folded over the body, or spread
    g.save(); g.translate(20, -190); g.rotate(wa * .9 + .05); g.scale(lerp(.5, 1, fly), 1);
    cut(blob([[-60, 0], [0, -30], [140, -40 - 90 * fly], [230, -10 - 140 * fly], [140, 20], [0, 26]], .5), C.creamDeep, { sh: .6, lift: .3 });
    cut(blob([[150, 0], [230, -10 - 140 * fly], [250, -6 - 150 * fly], [200, 18]], .5), C.tealDeep, { sh: .3 });
    g.restore();
    g.restore();
  }
  function lampPole(x, yb, yt, lit) {
    cut(cutRect(x - 10, yt, 20, yb - yt, 61), C.goldDeep, { sh: .7 });
    tendril(whipPts([x, yt + 40], [x - 60, yt - 20], [x - 110, yt + 20], [x - 70, yt + 60], 20, -1), 10, C.goldDeep);
    cut(rect(x - 34, yt - 8, 68, 12), C.goldDeep, { sh: .5 });
    glow(x, yt + 30, 300, '250,215,140', .45 * lit);
    cut(blob([[x - 34, yt + 4], [x + 34, yt + 4], [x + 26, yt + 60], [x, yt + 74], [x - 26, yt + 60]], .6), C.goldPale, { sh: .6 });
  }
  // a coal lump heap: dark polygons with gold glints, seeded so it never boils
  function coalHeap(cx, by, w, h) {
    cut(blob([[cx - w / 2, by], [cx - w * .3, by - h * .6], [cx, by - h], [cx + w * .32, by - h * .55], [cx + w / 2, by]], .6), C.tealInk, { sh: .9, lift: .3 });
    for (let i = 0; i < 46; i++) {
      const u = hash(i * 1.7) - .5, v = hash(i * 3.9), x = cx + u * w * .9, top = by - h * (1 - Math.abs(u) * 1.8), y = lerp(by - 20, top + 20, v);
      if (y > by - 10) continue;
      const r = 16 + hash(i * 5.3) * 22, pts = []; for (let j = 0; j < 5; j++) { const a = j / 5 * TAU + i; pts.push([x + Math.cos(a) * r * (.7 + hash(i + j) * .5), y + Math.sin(a) * r * (.7 + hash(i * 2 + j) * .5)]); }
      cut(poly(pts), i % 3 ? C.plumDeep : C.tealDeep, { sh: .4, grain: .2 });
      if (i % 5 === 0) cut(circle(x - r * .2, y - r * .3, 4), C.goldPale, { sh: 0, grain: 0 });
    }
  }
  function topHat(x, y, s, tilt = 0) {
    g.save(); g.translate(x, y); g.rotate(tilt); g.scale(s, s);
    cut(ellipse(0, 0, 120, 24), C.plumDeep, { sh: .8 });
    cut(blob([[-70, -6], [-78, -190], [-60, -206], [60, -206], [78, -190], [70, -6]], .3), C.plumDeep, { sh: .8, lift: .3 });
    cut(rect(-72, -54, 144, 30), C.gold, { sh: .3 });
    cut(ellipse(0, -204, 66, 12), C.plum, { sh: .2 });
    g.restore();
  }
  // a gloved fist round a handle, seen from the side: four knuckles, the thumb over, a tailcoat sleeve off right
  function gloveFist(x, y, s, a, sleeve = true) {
    g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s);
    if (sleeve) cut(capsule(30, 10, 700, -260, 44, 60), C.plumDeep, { sh: .8, lift: .3 });
    cut(capsule(40, 6, 70, -6, 40), C.white, { sh: .5 });
    cut(blob([[-44, -40], [-10, -56], [40, -50], [56, -10], [44, 44], [0, 56], [-46, 40], [-56, 0]], .6), C.white, { sh: .8, lift: .4 });
    for (let i = 0; i < 4; i++) cut(ellipse(-46, -36 + i * 24, 14, 12), C.white, { sh: .4 });
    cut(blob([[-20, -54], [30, -62], [44, -48], [0, -38]], .6), C.cream, { sh: .4 });
    g.save(); g.globalAlpha *= .5; g.strokeStyle = C.creamDeep; g.lineWidth = 3; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(-58, -48 + i * 24); g.lineTo(-30, -48 + i * 24); g.stroke(); } g.restore();
    g.restore();
  }
  function shovel(x, y, a, bite, sleeves = true) {
    g.save(); g.translate(x, y); g.rotate(a);
    // handle up the shaft to a D-grip; the square-mouth blade at the bottom (0,0)
    cut(rect(-9, -560, 18, 500), C.creamDeep, { sh: .6 });
    const dg = new Path2D(); dg.moveTo(-40, -600); dg.lineTo(40, -600); dg.lineTo(40, -560); dg.lineTo(-40, -560); dg.closePath(); dg.moveTo(-26, -594); dg.lineTo(-26, -566); dg.lineTo(26, -566); dg.lineTo(26, -594); dg.closePath();
    cut(dg, C.creamDeep, { sh: .5, rule: 'evenodd' });
    cut(poly([[-70, -70], [70, -70], [74, 40], [-74, 40]]), C.goldDeep, { sh: .8, lift: .3 });
    cut(rect(-18, -110, 36, 50), C.goldDeep, { sh: .4 });
    if (bite > 0) for (let i = 0; i < 7; i++) cut(circle(-50 + i * 16, 30 - hash(i) * 30 * bite, 15), C.plumDeep, { sh: .3, grain: 0 });
    gloveFist(0, -250, 1, -.25, sleeves); gloveFist(0, -500, .9, -.25, sleeves);
    g.restore();
  }

  // ---- 56.88-66.9 the storm and the boats leaving ----
  const BOATS = [[62.4, 260, -1], [63.2, 860, 1], [64.0, 520, 0]];   // start time, start x, drift
  const HORIZ = 1340;
  function boatAt(t, i) { const [t0, x0] = BOATS[i], p = clamp((t - t0) / 3.0); return { p, x: lerp(x0, 560 + i * 4, eo(p)), y: lerp(2100, HORIZ - 4, eo(p)), s: lerp(1.15, .03, eo(p)) }; }
  const LAST = (t) => boatAt(t, 2);
  SHOT(56.88, 66.9, 'storm', (t, k, d) => {
    const fl = ROARS.reduce((m, r) => Math.max(m, t >= r ? Math.exp(-9 * (t - r)) : 0), 0);
    // camera: from the moon at the crowd halo's size, pull back; tilt down to the river; push into the last light
    const lb = LAST(65.9), push = ei(clamp((t - 65.6) / 1.3));
    let cx = 540, cy = kf3(t, [[56.88, 571], [58.8, 900], [62.2, 900], [63.8, 1500]]), z = kf3(t, [[56.88, 3.16], [58.8, 1.0]]);
    if (t > 65.6) { const L = LAST(t); cx = lerp(540, L.x + 130 * L.s, push); cy = lerp(1500, L.y - 60 * L.s, push); z = Math.pow(14, push); }
    g.save(); cam(cx, cy, z);
    sheet(C.tealInk);
    rays(540, 520, 240, 1200, 28, t * .02, C.tealDeep, 1 - .5 * ss(57, 58.8, t));
    halo(540, 520, 220, t * .05, 1);
    // storm cloud cards rolling in over the moon
    for (let i = 0; i < 7; i++) {
      const side = i % 2 ? 1 : -1, slide = ss(56.9 + i * .18, 58.6 + i * .18, t);
      const x = 540 + side * lerp(1100, 120 + i * 40, slide) + Math.sin(t * .4 + i) * 30, y = 300 + i * 95;
      cut(cloud(x, y, 640 + hash(i) * 200, 170 + hash(i + 2) * 60, i + 3), [C.plumDeep, C.plum, C.plumDeep][i % 3], { sh: 1, lift: .5, alpha: .97 });
    }
    // lightning on each "roar" / "thunder"
    ROARS.forEach((r, i) => { const dt = t - r; if (dt >= 0 && dt < .36) { const x = [300, 760, 470, 640][i]; bolt(x, 620, x + [-120, 90, -40, 120][i], 1320, i * 13, 36); } });
    // the far bank and the river
    cut(poly([[-60, HORIZ], ...[...Array(14).keys()].map((i) => [i * 90 - 40, HORIZ - 30 - hash(i * 4.1) * 70]), [1200, HORIZ - 40], [1200, HORIZ]]), C.plumDeep, { sh: .5 });
    cut(cutRect(-60, HORIZ, W + 120, 1400, 71), C.tealDeep, { sh: .6 });
    for (let i = 0; i < 14; i++) cut(ribbon(-60, W + 60, HORIZ + 30 + i * i * 6, 4 + i * .8, i * 1.3 + t * (.4 + i * .05), 4 + i), C.teal, { sh: 0, grain: .2, alpha: .7 });
    for (let i = 0; i < 6; i++) cut(rrect(540 - (60 - i * 6), HORIZ + 30 + i * 50, (60 - i * 6) * 2, 10, 5), C.goldDeep, { sh: 0, grain: .2, alpha: .5 });
    // steamers sailing away, shrinking to the horizon; their stern lights stay as gold points
    for (let i = 0; i < 3; i++) {
      if (t < BOATS[i][0]) continue;
      const b = boatAt(t, i);
      steamer(b.x, b.y, b.s, t, i * 7);
      const lx = b.x + 185 * b.s, ly = b.y - 78 * b.s;
      glow(lx, ly, 40 + 80 * (1 - b.s), '250,215,140', .5);
      cut(circle(lx, ly, Math.max(5, 12 * b.s)), C.goldPale, { sh: 0, grain: 0 });
    }
    g.restore();
    rain(t, 150, 41, .5, .14);
    if (fl > 0) sheet(C.goldPale, .22 * fl);
    sheet(C.goldPale, .8 * ss(66.4, 66.9, t)); // into the stern light, out of the lit window
  });

  // ---- 66.9-70.6 the waterfront: one lit window, a hand waving after the boats, a heron lands on the lamp ----
  const WX = 130, WY = 690, WW = 240, WH = 330, LAMP_X = 780, LAMP_Y = 690;
  SHOT(66.9, 70.6, 'heron', (t, k, d) => {
    const u = eio(clamp((t - 66.9) / 1.4));
    g.save(); cam(lerp(WX + WW / 2, 540, u), lerp(WY + 190, 1000, u), Math.exp(lerp(Math.log(5), 0, u)));
    sheet(C.tealInk);
    for (let i = 0; i < 4; i++) cut(cloud(150 + i * 300 + Math.sin(t * .3 + i) * 20, 220 + (i % 2) * 90, 520, 140, i + 20), i % 2 ? C.plumDeep : C.tealDeep, { sh: .8, lift: .3 });
    cut(cutRect(-60, 420, 560, 1200, 81), C.plum, { sh: 1, lift: .4 });
    cut(cutRect(-60, 400, 580, 30, 82), C.gold, { sh: .5 });
    cut(archPath(WX, WY, WW, WH), C.goldPale, { sh: 0, grain: .3 });
    glow(WX + WW / 2, WY + 200, 360, '250,215,140', .4);
    // lace curtain half drawn
    g.save(); g.clip(archPath(WX, WY, WW, WH));
    cut(blob([[WX - 10, WY], [WX + 90, WY], [WX + 60, WY + 200], [WX + 80, WY + WH + 10], [WX - 10, WY + WH + 10]], .5), C.cream, { sh: .4, alpha: .85 });
    for (let i = 0; i < 5; i++) cut(circle(WX + 30, WY + 60 + i * 55, 8), C.goldPale, { sh: 0, grain: 0 });
    // one in the window: a hand waving after the boats
    const wv = ss(67.5, 67.9, t) * (1 - ss(69.4, 69.9, t));
    if (wv > 0) { sleeve(WX + 160, WY + WH + 40 - wv * 160, 90, 1, 4, C.plumLight); palmHand(WX + 160, WY + WH + 40 - wv * 160, 90 * .84, { dir: 1, rot: .15 + Math.sin(t * 7) * .35, spread: .16 }); }
    g.restore();
    archFrame(WX, WY, WW, WH, 16, C.gold);
    cut(rect(WX - 30, WY + WH, WW + 60, 22), C.cream, { sh: .8 });
    // more of the building: dark windows
    for (const [x, y] of [[60, 1160], [300, 1160], [60, 1460], [300, 1460]]) { cut(archPath(x, y, 140, 220), C.tealInk, { sh: .3 }); archFrame(x, y, 140, 220, 10, C.goldDeep); }
    // the quay and the river
    cut(cutRect(-60, 1640, W + 120, 60, 83), C.creamDeep, { sh: .7 });
    cut(cutRect(-60, 1700, W + 120, 400, 84), C.tealDeep, { sh: .6 });
    for (let i = 0; i < 5; i++) cut(ribbon(-40, W + 40, 1730 + i * 40, 6, i * 1.9 + t * .6, 5), C.teal, { sh: 0, grain: .2, alpha: .6 });
    lampPole(LAMP_X, 1640, LAMP_Y, 1);
    // the heron: flies in from the upper right, lands on the lamp on "bird" (69.26), folds its wings
    const land = 69.26, f = clamp((t - (land - 1.0)) / 1.0);
    if (t > land - 1.0) {
      const p = eo(f), hx = lerp(1250, LAMP_X + 10, p), hy = lerp(260, LAMP_Y - 8, p) - Math.sin(p * Math.PI) * 60;
      const fold = ss(land - .05, land + .5, t);
      heron(hx, hy, .9, fold, t * 9);
    }
    g.restore();
    rain(t, 70, 51, .4, .14);
    sheet(C.goldPale, .8 * (1 - ss(66.9, 67.3, t)));
  }, { smooth: true });

  // ---- 70.6-73.6 the steamer's deck: a lantern (the lamp), the coal heap, a top hat, white gloves shovelling ----
  const BITES = [70.9, 71.92, 72.94];
  SHOT(70.6, 73.6, 'deck', (t, k, d) => {
    const push = ei(clamp((t - 73.05) / .55));
    const cy = kf3(t, [[70.6, 1000], [71.4, 1180], [73.05, 1180]]), z = kf3(t, [[70.6, 1.0], [71.4, 1.02]]);
    g.save(); cam(540, lerp(cy, 1000, eio(push)), z * Math.pow(6 / z, push));
    sheet(C.plumDeep);
    // the riveted iron wall and the furnace door, glowing round its edge
    cut(cutRect(-60, 380, W + 120, 1200, 91), C.plum, { sh: .6 });
    for (let r = 0; r < 6; r++) for (let c = 0; c < 9; c++) cut(circle(60 + c * 120, 460 + r * 190, 7), C.goldDeep, { sh: .2, grain: 0 });
    const open = ss(72.95, 73.35, t);
    glow(540, 1000, 420, '250,190,110', .35 + .4 * open);
    cut(scallop(540, 1000, 168, 24, .06), C.gold, { sh: 1, lift: .4 });
    cut(circle(540, 1000, 136), C.goldPale, { sh: .3, grain: .3 });
    g.save(); g.translate(540 - 136 * open, 1000); g.scale(1 - open * .85, 1);
    cut(circle(0, 0, 136), C.plumDeep, { sh: .5 });
    for (let i = 0; i < 5; i++) cut(rect(-100 + i * 50 - 6, -90, 12, 180), C.goldDeep, { sh: .3, grain: 0 });
    g.restore();
    // the lantern hanging where the waterfront lamp was
    cut(rect(LAMP_X - 3, 420, 6, LAMP_Y - 420), C.goldDeep, { sh: .3 });
    glow(LAMP_X, LAMP_Y + 40, 260, '250,215,140', .4);
    cut(blob([[LAMP_X - 34, LAMP_Y + 4], [LAMP_X + 34, LAMP_Y + 4], [LAMP_X + 26, LAMP_Y + 60], [LAMP_X, LAMP_Y + 74], [LAMP_X - 26, LAMP_Y + 60]], .6), C.goldPale, { sh: .6 });
    // the deck
    cut(cutRect(-60, 1560, W + 120, 600, 92), C.goldDeep, { sh: .8 });
    for (let i = 0; i < 8; i++) cut(rect(-60, 1600 + i * 50, W + 120, 4), C.plumDeep, { sh: 0, grain: 0, alpha: .5 });
    // Mark Von Ulrich (guest director): the coal heap IS the millionaire. A coal head under his top hat, his
    // tailcoat arms from his own shoulders, his white gloves shovelling himself into the fire; each bite he
    // takes leaves less of him.
    let bite = 0;
    for (const b of BITES) { const dt = t - b; if (dt > -.15 && dt < .8) { bite = Math.max(bite, dt < 0 ? ei(1 + dt / .15) : 1 - eo(dt / .8)); } }
    const lift = ss(73.0, 73.4, t), gone = BITES.filter((b) => t > b + .3).length, hh = 330 - gone * 34 - lift * 20;
    coalHeap(560, 1720, 760 - gone * 40, hh);
    const headY = 1720 - hh - 50;
    const sx = 700, sy = lerp(lerp(1440, 1560, bite), 1300, lift), sa = lerp(.45, .25, bite) - lift * .6;
    const fist = (L) => [sx + L * Math.sin(sa), sy - L * Math.cos(sa)];
    const [f1x, f1y] = fist(250), [f2x, f2y] = fist(500);
    cut(capsule(470, headY + 120, f2x, f2y, 54, 40), C.tealInk, { sh: .8, lift: .3 });
    cut(capsule(650, headY + 130, f1x, f1y, 56, 44), C.tealInk, { sh: .9, lift: .3 });
    // his head: a knot of coal lumps with two gold glints for eyes, the top hat on it
    for (let i = 0; i < 11; i++) { const a = i / 11 * TAU, r = 36 + hash(i) * 36; cut(poly([...Array(5).keys()].map((j) => [560 + Math.cos(a) * r + Math.cos(j / 5 * TAU + i) * 36, headY + Math.sin(a) * r * .85 + Math.sin(j / 5 * TAU + i) * 36])), i % 3 ? C.tealDeep : C.tealInk, { sh: .6 }); }
    cut(circle(532, headY - 6, 11), C.goldPale, { sh: .2, grain: 0 }); cut(circle(590, headY - 6, 11), C.goldPale, { sh: .2, grain: 0 });
    topHat(560, headY - 66, .9, -.06);
    shovel(sx, sy, sa, Math.max(bite > .3 ? 1 : 0, lift), false);
    g.restore();
    sheet(C.goldPale, .6 * ss(73.35, 73.6, t)); // into the furnace's glow
  }, { xin: .35, tr: 'fade' }); // the waterfront lamp becomes the deck lantern
})();

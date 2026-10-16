// 56.88-73.6 VERSE 2: the storm river. The crowd's great halo becomes the moon in the storm; gold lightning on
// each "roar" and "thunder"; tilt down to steamers leaving into the rain; the last one shrinks to its stern
// light on the horizon, which becomes the lit window on the waterfront (a hand waves from it); a heron lands on
// the lamp pole on "bird"; the lamp becomes a lantern on the steamer's deck, where white gloves shovel coal
// on the beats; push into the furnace door, which becomes the boiler room's furnace (chorus 2).
// A fire seen through a round furnace door, shared with the boiler room (s04): a dark firebox, a bed of embers,
// and flame tongues that lean, curl at the tip and leap on the beats (draft 4: the old row of even triangles read
// as teeth). r = the opening's radius; p = the beat pump (0..1); flare = coal just landed (0..1).
function furnaceFire(x, y, r, t, p = 0, flare = 0, flick = 1) { // flick 0 holds the flames still (when the door fills the frame)
  cut(circle(x, y, r), C.plumDeep, { sh: .3, grain: .2 });
  g.save(); g.clip(circle(x, y, r));
  cut(ellipse(x, y + r * .35, r * 1.05, r * .85), C.goldDeep, { sh: 0, grain: .25 });
  glow(x, y + r * .45, r * 1.1, '250,190,110', .35 + .25 * flare);
  const tongue = (bx, by, h, w, lean, curl) => {
    const p2 = new Path2D(), tx = bx + lean, ty = by - h;
    p2.moveTo(bx - w / 2, by);
    p2.bezierCurveTo(bx - w * .75, by - h * .45, tx - w * .45 - curl * w * .3, ty + h * .3, tx, ty);
    p2.bezierCurveTo(tx + curl * w * .35, ty + h * .12, tx + w * .2, ty + h * .4, tx + w * .12, ty + h * .3);
    p2.bezierCurveTo(bx + w * .7, by - h * .35, bx + w * .55, by - h * .1, bx + w / 2, by);
    p2.closePath(); return p2;
  };
  const by = y + r * .8;
  const flames = (layer) => {
    const n = layer ? 5 : 6;
    for (let i = 0; i < n; i++) {
      const u = (i + (layer ? .5 : 0)) / (n - (layer ? 0 : 1)) - .5, bx = x + u * r * 1.5;
      const beat = .75 + (.2 * Math.sin(t * 7.3 + i * 1.9 + layer * 2.3) + .35 * p) * flick + .3 * flare;
      const h = r * (layer ? .75 : 1.15) * (.7 + .5 * hash(i * 3.1 + layer)) * beat * (1 - Math.abs(u) * .7);
      const lean = Math.sin(t * 4.1 + i * 2.2 + layer) * r * .14 * flick + u * r * .2, curl = (i % 2 ? 1 : -1);
      cut(tongue(bx, by, h, r * (layer ? .3 : .38), lean, curl), layer ? C.goldPale : C.gold, { sh: 0, grain: 0, alpha: .95 });
    }
  };
  flames(0);
  // the coals on the grate: a heap of irregular lumps, part hidden by the front flames
  for (let i = 0; i < 9; i++) {
    const ex = x + (hash(i * 7.7) - .5) * r * 1.5, ey = y + r * (.78 + hash(i * 4.3) * .2), er = r * (.1 + hash(i * 2.9) * .08), pts = [];
    for (let j = 0; j < 6; j++) { const a = j / 6 * TAU + i; pts.push([ex + Math.cos(a) * er * (.7 + hash(i * 6 + j) * .6), ey + Math.sin(a) * er * (.6 + hash(i * 9 + j) * .5)]); }
    cut(poly(pts), i % 3 ? C.plumDeep : C.plum, { sh: 0, grain: 0 }); if (i % 2) cut(circle(ex - er * .3, ey - er * .3, er * .22), C.goldPale, { sh: 0, grain: 0, alpha: .8 });
  }
  flames(1);
  g.restore();
}
(() => {
  const ROARS = [58.98, 59.86, 61.06, 62.04];
  const beats = (window.FEAT && FEAT.beats) || [];
  const pump = (t) => { let p = 0; for (const b of beats) { const d = t - b; if (d >= 0 && d < .45) p = Math.max(p, 1 - d / .45); if (b > t) break; } return p; };
  // a lightning bolt (draft 4: the audit read the smoothed zigzag as a phone cord): three or four long, sharp
  // zags that taper from the cloud to a point on the river, the whiplash tail curl branching off the first zag,
  // and a gold splash where it strikes. big = the THUNDER bolt: wider, four zags, a second branch
  function bolt(x0, y0, x1, y1, seed, w = 34, big = 0, dt = 0) {
    const nz = big ? 4 : 3, pts = [[x0, y0]];
    for (let i = 1; i <= nz; i++) {
      const u = i / (nz + 1) + (hash(seed + i * 1.7) - .5) * .07, side = (i % 2 ? 1 : -1) * (seed % 2 ? -1 : 1);
      pts.push([lerp(x0, x1, u) + side * (85 + hash(seed + i * 3.3) * 55) * (1 + big * .35), lerp(y0, y1, u)]);
    }
    pts.push([x1, y1]);
    // one tapered polygon with mitred corners, so the zags stay sharp
    const shape = (k) => {
      const L = [], R = [], n = pts.length;
      for (let i = 0; i < n; i++) {
        const a = pts[Math.max(0, i - 1)], b = pts[i], c = pts[Math.min(n - 1, i + 1)];
        const d1 = [b[0] - a[0], b[1] - a[1]], d2 = [c[0] - b[0], c[1] - b[1]], l1 = Math.hypot(...d1) || 1, l2 = Math.hypot(...d2) || 1;
        let tx = d1[0] / l1 + d2[0] / l2, ty = d1[1] / l1 + d2[1] / l2; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
        const nx = -ty, ny = tx, nIn = i ? [-d1[1] / l1, d1[0] / l1] : [-d2[1] / l2, d2[0] / l2], mit = 1 / Math.max(.45, nx * nIn[0] + ny * nIn[1]);
        const ww = w * k * (1 + big) * lerp(1, .12, i / (n - 1)) * .5 * mit;
        L.push([b[0] + nx * ww, b[1] + ny * ww]); R.push([b[0] - nx * ww, b[1] - ny * ww]);
      }
      return poly(L.concat(R.reverse()));
    };
    cut(shape(1), C.goldPale, { sh: .8, lift: .5, grain: .1 });
    cut(shape(.36), C.white, { sh: 0, grain: 0 });
    const m = [lerp(pts[1][0], pts[2][0], .35), lerp(pts[1][1], pts[2][1], .35)], s1 = pts[1][0] > x0 ? 1 : -1;
    tendril(whipPts(m, [m[0] + s1 * 60, m[1] + 30], [m[0] + s1 * 150, m[1] + 50], [m[0] + s1 * 180, m[1] + 150], 34, s1), 14 + big * 10, C.goldPale, { sh: .4, grain: 0 });
    if (big) { const m2 = pts[3]; tendril(whipPts(m2, [m2[0] - s1 * 70, m2[1] + 30], [m2[0] - s1 * 160, m2[1] + 90], [m2[0] - s1 * 190, m2[1] + 200], 40, -s1), 20, C.goldPale, { sh: .4, grain: 0 }); }
    // the splash where it hits the water
    const u = clamp(dt / .36);
    cut(ellipse(x1, y1, 40 + 160 * eo(u) * (1 + big), 10 + 30 * eo(u)), C.goldPale, { sh: 0, grain: .2, alpha: .8 * (1 - u) });
    for (let i = 0; i < 7; i++) { const a = -Math.PI * (.15 + .7 * i / 6), r = 120 * eo(u) * (1 + big); cut(ellipse(x1 + Math.cos(a) * r, y1 + Math.sin(a) * r * .7 + 60 * u * u, 8, 12), C.goldPale, { sh: 0, grain: 0, alpha: 1 - u }); }
  }
  // a paddle steamer, side view, facing left; its stern light is at (185 s, -78 s)
  function steamer(x, y, s, t, seed) {
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
  // the heron: perched (fold 1 = wings folded) or flying (wings at flap phase ph). Feet at (0,0), facing left.
  // (s09 calls it with fold 0: anything new here is drawn only when fold > 0, so the dawn heron is unchanged)
  function heron(x, y, s, fold, ph) {
    g.save(); g.translate(x, y); g.scale(s, s);
    const fly = 1 - fold;
    // legs: down when perched, trailing back in flight
    if (fold > .2) for (const lx of [0, 16]) cut(capsule(lx, 0, lx + 6, -130, 5, 6), C.plumDeep, { sh: .3, grain: 0 });
    else for (const ly of [0, 10]) cut(capsule(110, -170 + ly, 230, -150 + ly, 5, 4), C.plumDeep, { sh: .3, grain: 0 });
    // the far wing, then the body, neck, head
    const wa = fly * (Math.sin(ph) * .9 - .2);
    g.save(); g.translate(lerp(-30, 10, fly), -192); g.rotate(-wa - .2); g.scale(lerp(.55, 1, fly), lerp(.5, 1, fly));
    cut(blob([[0, 0], [60, -40], [200, -60 - 80 * fly], [260, -30 - 120 * fly], [150, 10], [20, 20]], .5), C.creamDeep, { sh: .4, alpha: .9 }); g.restore();
    cut(blob([[-70, -180], [-20, -215], [70, -205], [120, -170], [60, -150], [-30, -150]], .5), C.cream, { sh: .8, lift: .3 });
    const neck = fold > .2 ? whipPts([-50, -190], [-140, -232], [20, -296], [-70, -345], 0, 1, 18) : [[-60, -185], [-110, -195], [-150, -190], [-190, -200]];
    tendril(neck, 26, C.cream, { sh: .5 });
    const hx = neck[neck.length - 1][0], hy = neck[neck.length - 1][1];
    // draft 4: a grey heron's long black head plumes trailing back (it read as a swan)
    if (fold > 0) { g.save(); g.globalAlpha *= clamp(fold * 3); tendril(whipPts([hx + 10, hy - 8], [hx + 60, hy - 20], [hx + 120, hy - 6], [hx + 170, hy + 18], 0), 9, C.plumDeep, { sh: .2, grain: 0 }); tendril(whipPts([hx + 6, hy - 2], [hx + 50, hy - 6], [hx + 100, hy + 10], [hx + 140, hy + 34], 0), 6, C.plumDeep, { sh: 0, grain: 0 }); g.restore(); }
    cut(ellipse(hx, hy, 26, 18, -.2), C.cream, { sh: .5 });
    cut(poly([[hx - 18, hy - 6], [hx - 110, hy + 6], [hx - 18, hy + 8]]), C.goldDeep, { sh: .3 });
    cut(blob([[hx + 10, hy - 14], [hx + 60, hy - 30], [hx + 90, hy - 20], [hx + 30, hy - 4]], .5), C.plum, { sh: .3 });
    cut(circle(hx - 8, hy - 4, 4), C.plumDeep, { sh: 0, grain: 0 });
    // near wing: folded over the body, or spread
    g.save(); g.translate(lerp(-30, 20, fly), lerp(-196, -190, fly)); g.rotate(wa * .9 + lerp(-.08, .05, fly)); g.scale(lerp(.62, 1, fly), lerp(.55, 1, fly));
    cut(blob([[-60, 0], [0, -30], [140, -40 - 90 * fly], [230, -10 - 140 * fly], [140, 20], [0, 26]], .5), C.creamDeep, { sh: .6, lift: .3 });
    cut(blob([[150, 0], [230, -10 - 140 * fly], [250, -6 - 150 * fly], [200, 18]], .5), C.tealDeep, { sh: .3 });
    g.restore();
    g.restore();
  }
  window.heron = heron; // the dawn's heron leads the floating band (draft 3)
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
  // a gloved fist round a handle, seen from the side: four knuckles, the thumb over
  function gloveFist(x, y, s, a) {
    g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s);
    cut(capsule(40, 6, 70, -6, 40), C.white, { sh: .5 });
    cut(blob([[-44, -40], [-10, -56], [40, -50], [56, -10], [44, 44], [0, 56], [-46, 40], [-56, 0]], .6), C.white, { sh: .8, lift: .4 });
    for (let i = 0; i < 4; i++) cut(ellipse(-46, -36 + i * 24, 14, 12), C.white, { sh: .4 });
    cut(blob([[-20, -54], [30, -62], [44, -48], [0, -38]], .6), C.cream, { sh: .4 });
    g.save(); g.globalAlpha *= .5; g.strokeStyle = C.creamDeep; g.lineWidth = 3; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(-58, -48 + i * 24); g.lineTo(-30, -48 + i * 24); g.stroke(); } g.restore();
    g.restore();
  }
  function shovel(x, y, a, bite) {
    g.save(); g.translate(x, y); g.rotate(a);
    // handle up the shaft to a D-grip; the square-mouth blade at the bottom (0,0)
    cut(rect(-9, -560, 18, 500), C.creamDeep, { sh: .6 });
    const dg = new Path2D(); dg.moveTo(-40, -600); dg.lineTo(40, -600); dg.lineTo(40, -560); dg.lineTo(-40, -560); dg.closePath(); dg.moveTo(-26, -594); dg.lineTo(-26, -566); dg.lineTo(26, -566); dg.lineTo(26, -594); dg.closePath();
    cut(dg, C.creamDeep, { sh: .5, rule: 'evenodd' });
    cut(poly([[-70, -70], [70, -70], [74, 40], [-74, 40]]), C.goldDeep, { sh: .8, lift: .3 });
    cut(rect(-18, -110, 36, 50), C.goldDeep, { sh: .4 });
    if (bite > 0) for (let i = 0; i < 6; i++) cut(poly([...Array(5).keys()].map((j) => [-46 + i * 18 + Math.cos(j * 1.3 + i) * 15, 26 - hash(i) * 24 + Math.sin(j * 1.3 + i) * 13])), i % 2 ? C.plumDeep : C.tealDeep, { sh: .3, grain: 0 });
    gloveFist(0, -250, 1, -.25); gloveFist(0, -500, .9, -.25);
    g.restore();
  }
  // a coal shard (a cut-paper lump with a glint), for the shovelfuls in flight
  function shard(x, y, r, rot, i) {
    const pts = []; for (let j = 0; j < 5; j++) { const a = j / 5 * TAU + rot; pts.push([x + Math.cos(a) * r * (.75 + hash(i * 3 + j) * .45), y + Math.sin(a) * r * (.75 + hash(i * 5 + j) * .45)]); }
    cut(poly(pts), i % 2 ? C.plumDeep : C.tealDeep, { sh: .5, grain: 0 }); cut(circle(x - r * .25, y - r * .25, r * .16), C.goldPale, { sh: 0, grain: 0 });
  }

  // ---- 56.88-66.9 the storm and the boats leaving ----
  const BOATS = [[62.4, 260, -1], [63.2, 860, 1], [64.0, 520, 0]];   // start time, start x, drift
  const HORIZ = 1340;
  function boatAt(t, i) { const [t0, x0] = BOATS[i], p = clamp((t - t0) / 3.0); return { p, x: lerp(x0, 560 + i * 4, eo(p)), y: lerp(2600, HORIZ - 4, eo(p)), s: lerp(1.15, .03, eo(p)) }; }
  const LAST = (t) => boatAt(t, 2);
  const LZ = 12, LR = 150;   // the push into the last stern light ends at zoom LZ with the light LR px across the radius
  const lightAt = (t) => { const L = LAST(t); return [L.x + 185 * L.s, L.y - 78 * L.s]; };
  SHOT(56.88, 66.9, 'storm', (t, k, d) => {
    const fl = ROARS.reduce((m, r) => Math.max(m, t >= r ? Math.exp(-9 * (t - r)) : 0), 0);
    // camera: from the moon at the crowd halo's size, pull back; tilt down to the river; push into the last light
    const push = ei(clamp((t - 65.6) / 1.3));
    let cx = 540, cy = kf3(t, [[56.88, 571], [58.8, 900], [62.2, 900], [63.8, 1500]]), z = kf3(t, [[56.88, 3.16], [58.8, 1.0]]);
    if (t > 65.6) { const [lx, ly] = lightAt(t); cx = lerp(540, lx, push); cy = lerp(1500, ly, push); z = Math.pow(LZ, push); }
    const kick = t > ROARS[2] ? Math.exp(-9 * (t - ROARS[2])) : 0; cy += Math.sin((t - ROARS[2]) * 60) * 22 * kick; cx += Math.cos((t - ROARS[2]) * 47) * 14 * kick;
    g.save(); cam(cx, cy, z);
    sheet(C.tealInk);
    // no quills in the storm: chorus 1's night halo arrives without them, and in the storm sky they read as trees
    halo(540, 520, 220, t * .05, 1, typeof HALO_NIGHT !== 'undefined' ? HALO_NIGHT : undefined, 'lace'); haloMoon(540, 520, 220 * .42); // chorus 1's night halo carries over the cut
    // storm cloud cards with whiplash scroll ends roll in, parting round the moon
    for (let i = 0; i < 7; i++) {
      const side = i % 2 ? 1 : -1, slide = ss(56.9 + i * .18, 58.6 + i * .18, t);
      const x = 540 + side * lerp(1100, 360 + i * 26, slide) + Math.sin(t * .4 + i) * 30, y = 260 + i * 95, cw = 640 + hash(i) * 200, col = [C.plumDeep, C.plum, C.plumDeep][i % 3];
      cut(cloud(x, y, cw, 170 + hash(i + 2) * 60, i + 3), col, { sh: 1, lift: .5, alpha: .97 });
      tendril(whipPts([x - side * cw * .45, y + 20], [x - side * cw * .58, y + 40], [x - side * cw * .62, y - 30], [x - side * cw * .54, y - 40], 30, side), 22, col, { sh: .6 });
    }
    // the far bank and the river
    cut(poly([[-60, HORIZ], ...[...Array(14).keys()].map((i) => [i * 90 - 40, HORIZ - 30 - hash(i * 4.1) * 70]), [1200, HORIZ - 40], [1200, HORIZ]]), C.plumDeep, { sh: .5 });
    cut(cutRect(-60, HORIZ, W + 120, 1400, 71), C.tealDeep, { sh: .6 });
    for (let i = 0; i < 14; i++) cut(ribbon(-60, W + 60, HORIZ + 30 + i * i * 6, 4 + i * .8, i * 1.3 + t * (.4 + i * .05), 4 + i), C.teal, { sh: 0, grain: .2, alpha: .7 });
    // the moon's broken reflection; it fades as we push into the stern light (it smeared into gold bars)
    for (let i = 0; i < 6; i++) cut(rrect(540 - (60 - i * 6), HORIZ + 30 + i * 50, (60 - i * 6) * 2, 10, 5), C.goldDeep, { sh: 0, grain: .2, alpha: .5 * (1 - ss(65.6, 66.3, t)) });
    // lightning on each roar; THUNDER is the big one
    ROARS.forEach((r, i) => { const dt = t - r; if (dt >= 0 && dt < .45) { const x = [300, 760, 470, 640][i]; if (dt < .36 || i === 2) bolt(x, 640, x + [-120, 90, -40, 120][i], HORIZ + 40, i * 13 + 1, 36, i === 2 ? 1 : 0, dt); } });
    // the little rowboat riding out the storm on the left third, its lantern lit (it pays off at the clock and the
    // dawn). Draft 4: inside the border and bigger; each bolt catches its hull in a gold rim for two frames
    const rbx = lerp(360, 280, ss(57.5, 66.9, t)), rby = 1640 + Math.sin(t * 2.1) * 10, rs = .5;
    const lit = ROARS.some((r) => t >= r && t < r + .085);
    for (let i = 0; i < 3; i++) cut(rrect(rbx + 158 * rs - 18 + i * 6, rby + 26 + i * 22, 36 - i * 12, 7, 3), C.goldDeep, { sh: 0, grain: 0, alpha: .6 }); // the lantern's reflection
    cut(ribbon(rbx + 60, rbx + 260, rby + 8, 8, t * 2, 4), C.teal, { sh: 0, grain: 0, alpha: .8 }); // its wake
    if (lit) { g.save(); g.translate(rbx, rby); g.scale(rs, rs); g.lineWidth = 22; g.lineJoin = 'round'; g.strokeStyle = C.goldPale; g.stroke(blob([[-170, -60], [-120, 20], [120, 20], [180, -70], [150, -60], [-150, -50]], .4)); g.restore(); glow(rbx, rby - 30, 220, '250,235,190', .45); }
    rowboat(rbx, rby, rs, t * TAU / 1.03, 1);
    // steamers sailing away, shrinking to the horizon; their stern lights stay as gold points
    for (let i = 0; i < 3; i++) {
      if (t < BOATS[i][0]) continue;
      const b = boatAt(t, i), fade = i === 2 ? 1 : 1 - ss(.15, .5, push); // the two earlier lights fade as we push into the last
      if (fade <= 0) continue;
      g.save(); g.globalAlpha *= fade;
      steamer(b.x, b.y, b.s, t, i * 7);
      const lx = b.x + 185 * b.s, ly = b.y - 78 * b.s, pu = push;
      // draft 4: the last light becomes a crisp round lamp the size of the window's arch, with a small glow, so
      // the hand-off is a lamp on a dark frame (it used to bloom into a pink, near-white sheet)
      glow(lx, ly, lerp(40 + 80 * (1 - b.s), LR * 2 / LZ, pu), '250,215,140', lerp(.5, .3, pu));
      cut(circle(lx, ly, lerp(Math.max(5, 12 * b.s), i === 2 ? LR / LZ : 5, pu)), C.goldPale, { sh: 0, grain: 0 });
      g.restore();
    }
    g.restore();
    rain(t, 150, 41, .5, .14);
    if (fl > 0) sheet(C.goldPale, (ROARS.some((r, i) => i === 2 && t >= r && t < r + .5) ? .4 : .2) * fl);
  });

  // ---- 66.9-70.6 the waterfront: one lit window, a hand waving after the boats, a heron lands on the lamp ----
  const WX = 130, WY = 690, WW = 240, WH = 330;
  // the quay lamp is a Guimard lamp (the intro's iron calyx); the heron perches on the top of its arching stem
  const QL = { x: 1065, y: 1640, h: 950 }, QSTEM = whipPts([QL.x, QL.y], [QL.x + QL.h * .06, QL.y - QL.h * .55], [QL.x - QL.h * .02, QL.y - QL.h * 1.1], [QL.x - QL.h * .3, QL.y - QL.h], 0);
  const PERCH = QSTEM.reduce((m, p) => p[1] < m[1] ? p : m, QSTEM[0]), QBUD = { x: QL.x - QL.h * .3, y: QL.y - QL.h - 120 };
  // draft 4: the intro's iron calyx hand (calyxHand, b1) holds the lamp's bud of light in its palm, at QBUD; its
  // forearm runs down onto the stem's end (it read as a lotus in a pot)
  function calyxLamp(x, wy) { calyxHand(x, wy - 70, GUIMARD_HAND_SC, 1, { skin: 'iron', palm: 'bud', thumb: -1, arm: .75, armFill: C.tealDeep }); }
  // the camera opens with the window's round arch on the screen centre at the stern light's size (a 4-frame
  // dissolve, no white-out), pushes in on "window", pans to the lamp on the beat, punches in as the heron lands on
  // "bird", releases, and the heron lifts off on "pole" before the push into the lamp
  const AZ = LR / (WW / 2), HCAM = [[66.9, [WX + WW / 2, WY + WW / 2, AZ]], [67.3, [WX + WW / 2 + 6, WY + WW / 2 + 12, AZ * 1.05]], [68.33, [WX + WW / 2 + 40, WY + 190, 1.5]], [68.83, [560, 860, 1.1]]];
  SHOT(66.9, 70.6, 'heron', (t, k, d) => {
    const out = ei(clamp((t - 70.22) / .38));
    const hk = eio(clamp((t - 68.85) / .48)) * (1 - eio(clamp((t - 69.9) / .3))); // a push onto the heron as it lands on "bird"
    const base = [0, 1, 2].map((j) => kf3(t, HCAM.map(([tt, v]) => [tt, j === 2 ? Math.log(v[2]) : v[j]])));
    const bx0 = lerp(base[0], PERCH[0] - 60, hk), by0 = lerp(base[1], PERCH[1] + 120, hk), bz0 = lerp(base[2], Math.log(1.45), hk);
    g.save(); cam(lerp(bx0, QBUD.x, out), lerp(by0, QBUD.y, out), Math.exp(lerp(bz0, Math.log(4), out)));
    sheet(C.tealInk);
    for (let i = 0; i < 4; i++) cut(cloud(150 + i * 300 + Math.sin(t * .3 + i) * 20, 220 + (i % 2) * 90, 520, 140, i + 20), i % 2 ? C.plumDeep : C.tealDeep, { sh: .8, lift: .3 });
    cut(cutRect(-60, 420, 560, 1200, 81), C.plum, { sh: 1, lift: .4 });
    cut(cutRect(-60, 400, 580, 30, 82), C.gold, { sh: .5 });
    cut(archPath(WX, WY, WW, WH), C.goldPale, { sh: 0, grain: .3 });
    glow(WX + WW / 2, WY + 200, 300, '250,215,140', .32);
    // lace curtain half drawn, held back by a gold cord with a tassel (draft 4: the two gold tendrils that stood
    // in the glass read as a letter V)
    g.save(); g.clip(archPath(WX, WY, WW, WH));
    cut(blob([[WX - 10, WY], [WX + 96, WY], [WX + 70, WY + 120], [WX + 40, WY + 205], [WX + 74, WY + WH + 10], [WX - 10, WY + WH + 10]], .5), C.cream, { sh: .4, alpha: .85 });
    for (let i = 0; i < 5; i++) cut(circle(WX + 28, WY + 50 + i * 60, 8), C.goldPale, { sh: 0, grain: 0 });
    // the moon in the window: a crescent caught in the glass (the line Whisper misheard as "wound")
    glow(WX + 186, WY + 64, 80, '250,240,210', .5); cut(crescent(WX + 186, WY + 64, 30, .62, -.4), C.cream, { sh: .3 });
    tendril(whipPts([WX - 4, WY + 196], [WX + 30, WY + 222], [WX + 58, WY + 214], [WX + 50, WY + 196], 10, -1), 6, C.gold, { sh: .3, grain: 0 });
    tendril([[WX + 46, WY + 212], [WX + 44, WY + 240], [WX + 47, WY + 262]], 5, C.gold, { sh: 0, grain: 0 });
    cut(blob([[WX + 38, WY + 258], [WX + 56, WY + 258], [WX + 60, WY + 296], [WX + 34, WY + 296]], .5), C.gold, { sh: .3, grain: 0 });
    // one in the window: a hand waving after the boats (draft 4: up by 67.3, not after 0.8 s of empty glass)
    const wv = ss(66.98, 67.3, t) * (1 - ss(69.4, 69.9, t));
    if (wv > 0) { sleeve(WX + 156, WY + WH + 40 - wv * 132, 90, 1, 4, C.plumLight); palmHand(WX + 156, WY + WH + 40 - wv * 132, 90 * .84, { dir: 1, rot: .15 + Math.sin(t * 7) * .35, spread: .16 }); }
    g.restore();
    archFrame(WX, WY, WW, WH, 16, C.gold);
    cut(rect(WX - 30, WY + WH, WW + 60, 22), C.cream, { sh: .8 });
    // more of the building: dark windows
    for (const [x, y] of [[60, 1160], [300, 1160], [60, 1460], [300, 1460]]) { cut(archPath(x, y, 140, 220), C.tealInk, { sh: .3 }); archFrame(x, y, 140, 220, 10, C.goldDeep); }
    // the quay and the river
    cut(cutRect(-60, 1640, W + 120, 60, 83), C.creamDeep, { sh: .7 });
    cut(cutRect(-60, 1700, W + 120, 400, 84), C.tealDeep, { sh: .6 });
    for (let i = 0; i < 5; i++) cut(ribbon(-40, W + 40, 1730 + i * 40, 6, i * 1.9 + t * .6, 5), C.teal, { sh: 0, grain: .2, alpha: .6 });
    tendril(QSTEM, 30, C.tealDeep, { sh: .8, lift: .3 }); tendril(QSTEM.map(([x, y]) => [x + 6, y]), 7, C.gold, { sh: 0, grain: 0 });
    calyxLamp(QBUD.x, QL.y - QL.h);
    // the heron: flies in from the upper right, lands on the lamp on "bird" (69.26), folds its wings; on "pole"
    // (70.18) it lifts off and flies up out of frame before the push into the lamp (its head used to clip into
    // the border's mosaic and vanish)
    const land = 69.26, f = clamp((t - (land - 1.0)) / 1.0), TO = 70.1;
    if (t > land - 1.0 && t < 70.75) {
      const p = eo(f), lift = ei(clamp((t - TO) / .55));
      const hx = lerp(1250, PERCH[0], p) + lift * 820, hy = lerp(260, PERCH[1] - 6, p) - Math.sin(p * Math.PI) * 60 - lift * 1150;
      const fold = ss(land - .05, land + .5, t) * (1 - ss(TO, TO + .16, t)), turn = lerp(1, -1, ss(TO - .04, TO + .1, t)); // it turns to fly off right
      g.save(); g.translate(hx, hy); g.scale(turn, 1); heron(0, 0, .9, fold, t * 9); g.restore();
    }
    g.restore();
    rain(t, 70, 51, .4, .14);
    sheet(C.goldPale, .2 * ss(70.45, 70.6, t)); // draft 4: a lighter flash into the lamp (.3 over plum read pink)
  }, { xin: 4 / 24 });

  // ---- 70.6-73.6 the steamer's deck: a lantern (the lamp), the coal heap, a top hat, white gloves shovelling ----
  // Draft 4 layout: the furnace stands on the left third at his shoulder height and the shovel swings sideways
  // into it (stacked above his hat it read as a totem). Gilliam 4A, always another millionaire: the heap is full of
  // top hats; each shovelful flings one into the fire on the beat and a fresh one pops up out of the coal.
  const BITES = [70.9, 71.92, 72.94];
  const FUR = { x: 270, y: 1250, r: 170 }, HX = 680;
  const DIG = [480, 1652], TOSS = [470, 1330];
  // shovel pose: 0 = blade in the heap, 1 = flung toward the furnace
  const pose = (t) => { for (const b of BITES) { if (t >= b - .32 && t < b) return 1 - eio((t - b + .32) / .32); if (t >= b && t < b + .34) return back(clamp((t - b - .02) / .32)); } return 1; };
  const blade = (t) => { const s = pose(t); return { x: lerp(DIG[0], TOSS[0], s), y: lerp(DIG[1], TOSS[1], s), a: lerp(.62, 1.12, s), s }; };
  const FLING = .22, LAND = .52; // a shovelful leaves the blade at b + FLING and drops into the fire at b + LAND (the next beat)
  // hats in the coal: [slot x, y, pop-up time (0 = there from the start), the bite that throws it (-1 = stays)]
  const HATS = [[476, 1606, 0, 0], [500, 1612, 71.37, 1], [488, 1608, 72.24, 2], [850, 1560, 72.9, -1]];
  SHOT(70.6, 73.6, 'deck', (t, k, d) => {
    let bite = 0;
    for (const b of BITES) { const dt = t - b; if (dt > -.15 && dt < .8) { bite = Math.max(bite, dt < 0 ? ei(1 + dt / .15) : 1 - eo(dt / .8)); } }
    const gone = BITES.filter((b) => t > b + .3).length, drop = BITES.reduce((m, b) => m + back(clamp((t - b - .3) / .4)) * 34, 0);
    const headY = 1720 - 330 + drop - 50;
    // his own hat: on his head, then on "shovel" it topples off into the open door
    const HT = 73.12, hp = eio(clamp((t - HT) / .42));
    const hatX = lerp(HX, FUR.x, hp), hatY = lerp(headY - 66, FUR.y, hp) - Math.sin(hp * Math.PI) * 200;
    // camera: out of the lamp, settle with a pulse on the beats; punch on him for "millionaire" (a pop-up hat in
    // frame on the word); follow his hat into the fire
    const into = eio(clamp((t - 70.6) / .7));
    let cx = lerp(QBUD.x, kf3(t, [[71.3, 540], [72.1, 520]]), into), cy = lerp(QBUD.y, kf3(t, [[70.6, 1000], [71.4, 1180]]), into), z = Math.exp(lerp(Math.log(4), Math.log(1.02), into)) * (1 + .02 * pump(t) * into);
    const pk = eio(clamp((t - 72.05) / .3)) * (1 - eio(clamp((t - 72.95) / .2)));
    cx = lerp(cx, 610, pk); cy = lerp(cy, headY - 30, pk); z = lerp(z, 1.55, pk);
    const fo = ei(clamp((t - HT) / .48));
    cx = lerp(cx, hatX, fo); cy = lerp(cy, hatY, fo); z = Math.exp(lerp(Math.log(z), Math.log(6), fo));
    g.save(); cam(cx, cy, z);
    sheet(C.plumDeep);
    cut(cutRect(-60, 380, W + 120, 1200, 91), C.plum, { sh: .6 });
    for (let r = 0; r < 6; r++) for (let c = 0; c < 9; c++) cut(circle(60 + c * 120, 460 + r * 190, 7), C.goldDeep, { sh: .2, grain: 0 });
    // the lamp on its iron bracket, where the quay lamp stood
    tendril(whipPts([1110, 700], [1010, 770], [880, 770], [QBUD.x, QL.y - QL.h], 0), 24, C.tealDeep, { sh: .6 });
    calyxLamp(QBUD.x, QL.y - QL.h);
    // the furnace: a Guimard firebox of cast iron with a flue, its round door standing open
    const flareK = BITES.reduce((m, b) => Math.max(m, t > b + LAND ? Math.exp(-4 * (t - b - LAND)) : 0), 0);
    cut(rect(FUR.x - 40, 380, 80, 700), C.tealInk, { sh: .6 }); for (let i = 0; i < 3; i++) cut(rect(FUR.x - 48, 520 + i * 180, 96, 16), C.goldDeep, { sh: .3, grain: 0 });
    cut(rrect(FUR.x - 220, 1010, 440, 600, [140, 140, 20, 20]), C.tealDeep, { sh: 1, lift: .5 });
    for (const sx of [-1, 1]) tendril(whipPts([FUR.x + sx * 200, 1560], [FUR.x + sx * 215, 1200], [FUR.x + sx * 120, 1040], [FUR.x + sx * 30, 1090], 26, -sx), 16, C.gold, { sh: .4, grain: 0 });
    cut(rect(FUR.x - 220, 1500, 440, 18), C.gold, { sh: .3, grain: 0 });
    glow(FUR.x, FUR.y, 430, '250,190,110', .4 + .3 * flareK);
    cut(scallop(FUR.x, FUR.y, FUR.r, 26, .06), C.gold, { sh: 1, lift: .4 });
    furnaceFire(FUR.x, FUR.y, FUR.r * .8, t, pump(t), flareK, 1 - ss(73.25, 73.45, t));
    g.save(); g.translate(FUR.x - FUR.r * .8, FUR.y); g.scale(.15, 1); cut(circle(0, 0, FUR.r * .8), C.plumDeep, { sh: .5 }); g.restore();
    // the deck
    cut(cutRect(-60, 1560, W + 120, 600, 92), C.goldDeep, { sh: .8 });
    for (let i = 0; i < 8; i++) cut(rect(-60, 1600 + i * 50, W + 120, 4), C.plumDeep, { sh: 0, grain: 0, alpha: .5 });
    // Mark Von Ulrich (guest director): the coal heap IS the millionaire, shovelling himself into the fire
    coalHeap(HX, 1720, 640 - gone * 40, 330 - drop);
    // the hats waiting in the coal; a fresh one pops up like a jack-in-the-box, throwing coal
    const B = blade(t);
    HATS.forEach(([hx0, hy0, tp, bi], i) => {
      if (t < tp) return;
      const scoop = bi >= 0 ? BITES[bi] : 99;
      if (t >= scoop) return; // on the shovel or in the air: drawn with the shovelful
      const pu = tp ? back(clamp((t - tp) / .32)) : 1, wob = tp ? Math.sin((t - tp) * 18) * .25 * Math.exp(-5 * (t - tp)) : 0;
      if (tp) for (let j = 0; j < 4; j++) { const u = clamp((t - tp) / .5); if (u < 1) shard(hx0 + (j - 1.5) * 50 * (1 + u), hy0 - 40 - 160 * Math.sin(u * Math.PI) * (.6 + .3 * (j % 2)), 16, t * 5 + j, j); }
      topHat(hx0, hy0 + drop * .5 + (1 - pu) * 60, .5 * Math.max(.05, pu), -.18 + i * .12 + wob);
    });
    // his tailcoat sleeves to the gloves on the shovel, his face of coal and two gold eyes
    const fist = (L) => [B.x + L * Math.sin(B.a), B.y - L * Math.cos(B.a)];
    const [f1x, f1y] = fist(250), [f2x, f2y] = fist(500);
    cut(capsule(HX + 100, headY + 120, f2x, f2y, 52, 40), C.plumDeep, { sh: .8, lift: .3 });
    cut(capsule(HX - 90, headY + 130, f1x, f1y, 54, 42), C.plum, { sh: .9, lift: .4 }); // both sleeves behind his face
    for (let i = 0; i < 11; i++) { const a = i / 11 * TAU, r = 36 + hash(i) * 36; cut(poly([...Array(5).keys()].map((j) => [HX + Math.cos(a) * r + Math.cos(j / 5 * TAU + i) * 36, headY + Math.sin(a) * r * .85 + Math.sin(j / 5 * TAU + i) * 36])), i % 3 ? C.tealDeep : C.tealInk, { sh: .6 }); }
    cut(circle(HX - 28, headY - 6, 11), C.goldPale, { sh: .2, grain: 0 }); cut(circle(HX + 30, headY - 6, 11), C.goldPale, { sh: .2, grain: 0 });
    shovel(B.x, B.y, B.a, bite > .3 ? 1 : 0);
    // each shovelful (lumps of himself, and a hat) rides the blade, then arcs into the open door on the next beat
    BITES.forEach((b, bi) => {
      const dt = t - b; if (dt < 0 || dt > LAND + .05) return;
      const hat = HATS.find((h) => h[3] === bi), tf = b + FLING, B0 = blade(Math.min(t, tf));
      const u = clamp((t - tf) / (LAND - FLING)), sx0 = B0.x - 30, sy0 = B0.y - 30;
      const at = (ox, oy, hgt) => [lerp(sx0 + ox, FUR.x + ox * .3, u), lerp(sy0 + oy, FUR.y + 30 + oy * .2, u) - Math.sin(u * Math.PI) * hgt];
      const sc = 1 - .45 * ei(u);
      for (let i = 0; i < 5; i++) { const [x, y] = at((i - 2) * 26, (i % 2) * 18, 220 + i * 24); shard(x, y, (24 + (i % 3) * 5) * sc, t * 6 + i, i + bi); }
      if (hat) { const [x, y] = at(0, -50, 260); topHat(x, y, .5 * sc, -.4 - u * 4.2); }
    });
    // sparks off the fire as each one lands
    BITES.forEach((b) => { const d2 = t - b - LAND; if (d2 < 0 || d2 > .6) return; for (let i = 0; i < 7; i++) { const a = -Math.PI * (.2 + .6 * hash(i * 2.1 + b)), r = 60 + 340 * eo(d2 / .6); g.save(); g.globalAlpha *= 1 - d2 / .6; cut(star4(FUR.x + Math.cos(a) * r, FUR.y - 40 + Math.sin(a) * r + 300 * d2 * d2, 12), i % 2 ? C.goldPale : C.gold, { sh: 0, grain: 0 }); g.restore(); } });
    g.save(); g.translate(hatX, hatY); g.rotate(-.06 - hp * 5.5); g.scale(1 - hp * .5, 1 - hp * .5); topHat(0, 0, .9, 0); g.restore();
    g.restore();
    sheet(C.goldPale, .1 * ss(73.45, 73.6, t) + .2 * (1 - ss(70.6, 70.75, t))); // a light wash into the furnace
  }); // the quay lamp becomes the deck lamp (same lamp, same place, pulled back from)
})();

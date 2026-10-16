const TAU = Math.PI * 2;
// Art Nouveau motifs cut from paper: whiplash tendrils, Mucha halos, lilies, peacock feathers,
// arched frames, Guimard lamps, and the clapping hands as three key drawings.
// All of them draw through cut() so they get the paper edge, grain and drop shadow.

// a cubic curve that ends in a curl (the whiplash): p0..p3 control points, curl radius r, turn sign dir
function whipPts(p0, p1, p2, p3, r = 40, dir = 1, n = 36) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, v = 1 - u;
    pts.push([v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0],
      v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]);
  }
  if (r > 0) {
    const [ax, ay] = pts[n - 1], [bx, by] = pts[n]; let a = Math.atan2(by - ay, bx - ax);
    // a spiral that keeps turning the same way, shrinking
    let x = bx, y = by, rr = r;
    for (let i = 0; i < 26; i++) { a += dir * .32; rr *= .94; x += Math.cos(a) * rr * .32; y += Math.sin(a) * rr * .32; pts.push([x, y]); }
  }
  return pts;
}
// grow a tendril along its length: u = 0..1 shown
function grow(pts, u) { const n = Math.max(2, Math.round(pts.length * clamp(u))); return pts.slice(0, n); }
function tendril(pts, w, col, opts = {}) { if (pts.length < 2) return; cut(ribbonAlong(pts, w), col, { sh: .5, grain: .2, ...opts }); }

// a scalloped disc (the edge of a Mucha halo)
function scallop(x, y, r, n = 32, depth = .06, rot = 0) {
  const p = new Path2D();
  for (let i = 0; i <= n * 6; i++) {
    const a = rot + TAU * i / (n * 6), k = 1 - depth * (1 - Math.abs(Math.cos(a * n / 2)));
    const px = x + Math.cos(a) * r * k, py = y + Math.sin(a) * r * k;
    i ? p.lineTo(px, py) : p.moveTo(px, py);
  }
  p.closePath(); return p;
}
// an annulus with a row of round holes punched in it (paper lace), evenodd
function ringLace(x, y, r0, r1, holes = 0, rot = 0) {
  const p = new Path2D(); p.arc(x, y, r1, 0, TAU); p.moveTo(x + r0, y); p.arc(x, y, r0, 0, TAU, true);
  const rm = (r0 + r1) / 2, hr = (r1 - r0) * .26;
  for (let i = 0; i < holes; i++) { const a = rot + TAU * i / holes; p.moveTo(x + Math.cos(a) * rm + hr, y + Math.sin(a) * rm); p.arc(x + Math.cos(a) * rm, y + Math.sin(a) * rm, hr, 0, TAU); }
  return p;
}
// the Mucha halo: layered paper rings. u = how many layers have unfolded (0..1), rot turns the lace
// the Mucha halo: layered paper rings. u = how many layers have unfolded (0..1), rot turns the ornament.
// style (draft 3, the audit: the dotted ring read Deco) chooses the ornament ring for each appearance:
// 'lace' petal-cut lace (default), 'rose' a rose window, 'peacock' feather eyes, 'zodiac' twelve roundels,
// 'poppy' plum poppies, 'sunflower' petals
function haloOrnament(x, y, R, rot, style, col) {
  const r0 = R * .72, r1 = R * .9, rm = (r0 + r1) / 2, bw = r1 - r0;
  if (style === 'sunflower') {
    for (let i = 0; i < 30; i++) { const a = rot + TAU * i / 30; g.save(); g.translate(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.rotate(a + Math.PI / 2);
      cut(blob([[-bw * .22, 0], [0, -bw * 1.25], [bw * .22, 0], [0, bw * .1]], .6), i % 2 ? C.goldPale : C.cream, { sh: .4, grain: .15 }); g.restore(); }
    return;
  }
  const p = new Path2D(); p.arc(x, y, r1, 0, TAU); p.moveTo(x + r0, y); p.arc(x, y, r0, 0, TAU, true);
  if (style === 'lace' || style === 'rose') {
    const n = style === 'rose' ? 12 : 20;
    for (let i = 0; i < n; i++) { const a = rot + TAU * i / n, cx = x + Math.cos(a) * rm, cy = y + Math.sin(a) * rm;
      const e = new Path2D(); e.ellipse(cx, cy, bw * .36, bw * (style === 'rose' ? .16 : .12), a, 0, TAU); p.addPath(e);
      if (style === 'rose') { const c2 = new Path2D(); c2.arc(x + Math.cos(a + Math.PI / n) * rm, y + Math.sin(a + Math.PI / n) * rm, bw * .1, 0, TAU); p.addPath(c2); } }
  }
  cut(p, col, { sh: .7, lift: .3, rule: 'evenodd' });
  if (style === 'peacock') for (let i = 0; i < 16; i++) { const a = rot + TAU * i / 16, cx = x + Math.cos(a) * rm, cy = y + Math.sin(a) * rm;
    g.save(); g.translate(cx, cy); g.rotate(a + Math.PI / 2); cut(ellipse(0, 0, bw * .26, bw * .38), C.gold, { sh: .3, grain: 0 }); cut(ellipse(0, bw * .04, bw * .17, bw * .25), C.teal, { sh: 0, grain: 0 }); cut(ellipse(0, bw * .08, bw * .09, bw * .13), C.blue, { sh: 0, grain: 0 }); g.restore(); }
  if (style === 'zodiac') for (let i = 0; i < 12; i++) { const a = rot + TAU * i / 12, cx = x + Math.cos(a) * rm, cy = y + Math.sin(a) * rm;
    cut(circle(cx, cy, bw * .36), C.gold, { sh: .4 }); cut(circle(cx, cy, bw * .26), C.tealDeep, { sh: 0 }); cut(flowerPath(cx, cy, bw * .22, 5, a), C.goldPale, { sh: 0, grain: 0 }); }
  if (style === 'poppy') for (let i = 0; i < 12; i++) { const a = rot + TAU * i / 12, cx = x + Math.cos(a) * rm, cy = y + Math.sin(a) * rm;
    cut(flowerPath(cx, cy, bw * .42, 4, a), C.plumLight, { sh: .3 }); cut(circle(cx, cy, bw * .12), C.plumDeep, { sh: 0, grain: 0 }); }
}
function halo(x, y, R, rot = 0, u = 1, cols = [C.gold, C.cream, C.tealLight, C.goldPale], style = 'lace') {
  const L = [
    () => cut(scallop(x, y, R, 36, .05, rot * .3), cols[0], { sh: 1, lift: .6 }),
    () => haloOrnament(x, y, R, rot, style, cols[1]),
    () => cut(circle(x, y, R * .7), cols[2], { sh: .6, lift: .2 }),
    () => cut(ringLace(x, y, R * .5, R * .58, 0), cols[3], { sh: .4, rule: 'evenodd' }),
  ];
  for (let i = 0; i < L.length; i++) {
    const k = clamp(u * L.length - i); if (k <= 0) break;
    g.save(); g.translate(x, y); const s = back(k); g.scale(s, s); g.translate(-x, -y); L[i](); g.restore();
  }
}
// a moon set inside a halo (the audit: several haloes read as empty teal medallions, not moons)
function haloMoon(x, y, r, t = 0) { glow(x, y, r * 2.4, '250,230,180', .35); cut(circle(x, y, r), C.cream, { sh: .4, grain: .3 }); cut(crescent(x + r * .1, y, r * .96, .82, .3), C.goldPale, { sh: 0, grain: .2, alpha: .7 }); }
// rays of the halo (draft 3): curving whiplash quills, not straight Deco spokes. Each sweeps out in an S and
// ends in a small curl, alternating the turn
function rays(x, y, r0, r1, n, rot, col, alpha = 1) {
  if (alpha <= 0) return;
  const pol = (r, a) => [x + Math.cos(a) * r, y + Math.sin(a) * r], L = r1 - r0;
  for (let i = 0; i < n; i++) {
    const a = rot + TAU * i / n, b = (i % 2 ? 1 : -1) * .32;
    const pts = whipPts(pol(r0, a), pol(r0 + L * .35, a + b), pol(r0 + L * .7, a - b * .5), pol(r1, a + b * .4), L * .045, i % 2 ? 1 : -1, 24);
    cut(ribbonAlong(pts, Math.max(10, L * .05)), col, { sh: .3, grain: .12, alpha });
  }
}
// a lily seen from the side: petals open from a bud (open 0..1), stem pointing along ang
function lily(x, y, ang, size, open, cols = [C.cream, C.goldPale]) {
  g.save(); g.translate(x, y); g.rotate(ang + Math.PI / 2);
  const o = clamp(open);
  for (let i = -2; i <= 2; i++) {
    const a = i * lerp(.08, .5, o), c = i % 2 ? cols[1] : cols[0];
    g.save(); g.rotate(a);
    cut(blob([[0, 0], [-size * .16, -size * .45], [-size * .06, -size * .95], [size * .02, -size * 1.04], [size * .12, -size * .6], [size * .14, -size * .2]], .6), c, { sh: .5, grain: .18 });
    g.restore();
  }
  if (o > .4) for (let i = -1; i <= 1; i++) { g.save(); g.rotate(i * .22 * o); cut(rect(-2.5, -size * .78 * o, 5, size * .5 * o), C.goldDeep, { sh: .2, grain: 0 }); cut(ellipse(0, -size * .8 * o, 7, 12), C.plum, { sh: .2, grain: 0 }); g.restore(); }
  g.restore();
}
// a peacock feather: shaft from (x,y) along ang, len long; open 0..1 fans the barbs; the eye at the tip
function feather(x, y, ang, len, open = 1) {
  g.save(); g.translate(x, y); g.rotate(ang + Math.PI / 2);
  const o = clamp(open), w = len * .13 * lerp(.4, 1, o);
  cut(blob([[0, 0], [-w * .35, -len * .35], [-w, -len * .78], [-w * .55, -len * 1.04], [0, -len * 1.1], [w * .55, -len * 1.04], [w, -len * .78], [w * .35, -len * .35]], .55), C.tealLight, { sh: .6, grain: .25 });
  // barbs: fine slits in the vane, cut as darker paper strips
  for (let i = 0; i < 9; i++) { const yy = -len * (.3 + i * .07), ww = w * Math.sin(Math.PI * (.2 + i * .085)) * .9;
    g.save(); g.globalAlpha *= .5; g.strokeStyle = C.tealDeep; g.lineWidth = 3; g.beginPath(); g.moveTo(-ww, yy - 18); g.quadraticCurveTo(0, yy + 6, ww, yy - 18); g.stroke(); g.restore(); }
  cut(rect(-3, -len * .9, 6, len * .9), C.goldPale, { sh: .25, grain: 0 });
  const ey = -len * .86, er = w * .62;
  cut(ellipse(0, ey, er, er * 1.25), C.gold, { sh: .5 });
  cut(ellipse(0, ey + er * .1, er * .72, er * .92), C.teal, { sh: .35 });
  cut(ellipse(0, ey + er * .2, er * .42, er * .55), C.blue, { sh: .3 });
  cut(ellipse(-er * .1, ey + er * .1, er * .14, er * .2), C.goldPale, { sh: 0, grain: 0 });
  g.restore();
}
// an arched frame (window, booth, door): outer arched shape minus the inner opening
function archPath(x, y, w, h) { // x,y = top-left of the bounding box; round top
  const p = new Path2D(), r = w / 2;
  p.moveTo(x, y + h); p.lineTo(x, y + r); p.arc(x + r, y + r, r, Math.PI, 0); p.lineTo(x + w, y + h); p.closePath(); return p;
}
function archFrame(x, y, w, h, th, col, opts = {}) {
  const p = archPath(x - th, y - th, w + th * 2, h + th); p.addPath(archPath(x, y, w, h));
  cut(p, col, { sh: .9, lift: .3, rule: 'evenodd', ...opts });
}
// a soft light (lamplight through paper): additive radial glow
function glow(x, y, r, rgb = '232,205,134', a = .5) {
  if (a <= 0) return;
  g.save(); g.globalCompositeOperation = 'screen';
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
}
// rain: cream paper slivers falling (pure in t)
function rain(t, n, seed = 1, alpha = .5, ang = .12, x0 = -100, x1 = W + 100) {
  g.save(); g.globalAlpha *= alpha; g.fillStyle = C.cream;
  for (let i = 0; i < n; i++) {
    const sp = 1300 + hash(i * 3.1 + seed) * 700, L = 30 + hash(i + seed) * 40;
    const y = ((hash(i * 7.7 + seed) * (H + 300) + t * sp) % (H + 300)) - 150, x = lerp(x0, x1, hash(i * 1.3 + seed)) + y * ang;
    g.save(); g.translate(x, y); g.rotate(-ang); g.fillRect(-1.5, 0, 3, L); g.restore();
  }
  g.restore();
}
// a Guimard lamp: a gold whiplash stem bending over into a plum lily-bud lamp that lights
// hand (0..1, optional): instead of hanging, the bud is held up in an iron hand rising from the stem's end,
// whose fingers spread open (0 closed, 1 open) as it lights. Mark: hands enter the film holding light.
const IRON = { fill: C.goldDeep, shade: C.gold, line: C.plumDeep };
const GUIMARD_HAND_SC = 100;
function guimard(x, y, h, dir, lit, sway = 0, hand = -1) {
  const stem = whipPts([x, y], [x - dir * h * .06, y - h * .55], [x + dir * h * .02 + sway, y - h * 1.1], [x + dir * h * .3 + sway, y - h], 0);
  tendril(stem, 30, hand >= 0 ? C.tealDeep : C.goldDeep, { sh: .8, lift: .3 });
  if (hand >= 0) tendril(stem.map(([px, py]) => [px - dir * 6, py]), 7, C.gold, { sh: 0, grain: 0 }); // cast iron: teal with a gold highlight
  const [bx, by] = stem[stem.length - 1];
  if (hand >= 0) {
    const o = clamp(hand), sc = GUIMARD_HAND_SC, cy = by - sc * 1.15;
    if (lit > 0) glow(bx, cy, 360, '240,190,110', .55 * lit);
    nouveauHand(bx, by, sc, o * .8, { fill: C.tealDeep, edge: C.gold });
    lily(bx, cy + 40, -Math.PI / 2, 90, .15 + .7 * o, lit > .5 ? [C.goldPale, C.white] : [C.plumLight, C.plum]);
    if (lit > 0) { g.save(); g.globalAlpha *= lit; cut(ellipse(bx, cy + 10, 14, 26), C.white, { sh: 0, grain: .1 }); g.restore(); }
    return;
  }
  if (lit > 0) glow(bx + dir * 10, by + 70, 360, '240,190,110', .55 * lit);
  cut(blob([[bx + dir * 10 - 46, by + 40], [bx + dir * 10, by + 6], [bx + dir * 10 + 46, by + 40], [bx + dir * 10 + 34, by + 120], [bx + dir * 10, by + 150], [bx + dir * 10 - 34, by + 120]], .7), lit > .5 ? C.goldPale : C.plum, { sh: .7, lift: .2 });
  if (lit > 0) { g.save(); g.globalAlpha *= lit; cut(ellipse(bx + dir * 10, by + 84, 24, 40), C.white, { sh: 0, grain: .1 }); g.restore(); }
  for (let i = -1; i <= 1; i++) { g.save(); g.translate(bx + dir * 10, by + 20); g.rotate(i * .7); cut(blob([[-14, 0], [0, -70], [14, 0]], .6), C.goldDeep, { sh: .4 }); g.restore(); }
}

// A Nouveau hand (draft 3): a palm and five tapered petal fingers that curve. open 0 cups them like a calyx
// round whatever it holds, open 1 spreads them like a lily with the tips curling out. Wrist at (0,0), up is -y,
// the middle finger about 2.1 units from the wrist. The Metro's iron lamp hands and the final sun-hand share it.
function petalPath(bx, by, ang, L, w, curl) {
  const dx = Math.sin(ang), dy = -Math.cos(ang), px = -dy, py = dx, tx = bx + dx * L + px * curl * L * .25, ty = by + dy * L + py * curl * L * .25;
  const p = new Path2D(); p.moveTo(bx - px * w / 2, by - py * w / 2);
  p.quadraticCurveTo(bx + dx * L * .6 - px * w * .7 + px * curl * L * .1, by + dy * L * .6 - py * w * .7 + py * curl * L * .1, tx, ty);
  p.quadraticCurveTo(bx + dx * L * .6 + px * w * .7 + px * curl * L * .1, by + dy * L * .6 + py * w * .7 + py * curl * L * .1, bx + px * w / 2, by + py * w / 2);
  p.closePath(); return p;
}
function nouveauHand(x, y, sc, open, { fill = C.cream, edge = null, thumbSide = -1, glowFill = null } = {}) {
  g.save(); g.translate(x, y); g.scale(sc, sc);
  const o = clamp(open), F = [[-.33, 1.0], [-.11, 1.22], [.11, 1.16], [.33, .92]];
  const draw = (path, col, sh = .7) => { if (edge) cut(path, edge, { sh, lift: .3 }); g.save(); if (edge) { g.translate(0, 0); } cut(path, col, { sh: edge ? 0 : sh, lift: .3, grain: .2 }); g.restore(); };
  const parts = [];
  F.forEach(([fx, L]) => { const a = lerp(-fx * 1.3, fx * 1.5, o), curl = lerp(-fx * 1.2, fx * 2.0, o); parts.push(petalPath(fx, -.8, a, L, .2, curl)); });
  parts.push(petalPath(thumbSide * .4, -.3, thumbSide * lerp(.25, 1.05, o), .78, .22, thumbSide * lerp(-.4, .8, o)));
  parts.push(blob([[-.42, 0], [-.46, -.5], [-.36, -.9], [0, -.98], [.36, -.9], [.46, -.5], [.42, 0]], .55));
  for (const pth of parts) { if (edge) { g.save(); g.lineWidth = .05; g.strokeStyle = edge; g.stroke(pth); g.restore(); } }
  for (const pth of parts) cut(pth, fill, { sh: .7, lift: .3, grain: .2 });
  if (edge) for (const pth of parts) { g.save(); g.lineWidth = .035; g.strokeStyle = edge; g.stroke(pth); g.restore(); }
  g.restore();
}

// ---------------- the clapping hands ----------------
// Three key drawings swapped by distance, as in the painted version (memory: clapping-hands
// perspective): 1 apart = palms to camera, thumbs out, tilted out; 2 closing = the same hand
// narrowed to a three-quarter turn, fingers together; 3 contact = profile, palm to palm.
// Units: the hand is ~1.9 tall, wrist at (0,0), up is -y. sc = px per unit.
function palmPath(spread, dir) {
  const p = new Path2D();
  p.roundRect(-.4, -1.0, .8, 1.0, [.12, .12, .2, .2]);
  const F = [[-.29, .62], [-.1, .74], [.1, .7], [.29, .56]]; // x, length (little finger to index, left hand mirrored below)
  F.forEach(([fx, L], i) => {
    const a = (i - 1.5) * spread * .5, cx = fx, cy = -.9;
    const tx = cx + Math.sin(a) * L, ty = cy - Math.cos(a) * L, w = .095;
    p.moveTo(cx - w, cy); p.lineTo(tx - w * Math.cos(a), ty - w * Math.sin(a));
    p.arc(tx, ty, w * .98, Math.PI + a, a); p.lineTo(cx + w, cy); p.closePath();
  });
  // thumb on the outside edge, swung out
  const ta = dir * (.75 + spread), tx = dir * .36, ty = -.28, L = .55, w = .11;
  const ex = tx + Math.sin(ta) * L, ey = ty - Math.cos(ta) * L, c = Math.cos(ta), sn = Math.sin(ta);
  p.moveTo(tx - w * c, ty - w * sn); p.lineTo(ex - w * c, ey - w * sn); p.arc(ex, ey, w, Math.PI + ta, ta); p.lineTo(tx + w * c, ty + w * sn); p.closePath();
  return p;
}
function cuff(sc, col = C.gold) { // a scalloped gold cuff below the wrist (Nouveau sleeve edge)
  const pts = [[-.44, 0]]; for (let i = 0; i <= 6; i++) pts.push([lerp(-.44, .44, i / 6), -(i % 2 ? .07 : 0)]);
  pts.push([.48, .7], [-.48, .7]);
  cut(poly(pts), col, { sh: .6, lift: .2 });
}
// Skins: what the hands are made of. fill, the thumb's shade, the pencil lines. print = a soot print on the palm.
const SKIN = {
  cream: { fill: C.cream, shade: C.creamDeep, line: C.plumLight },
  glove: { fill: C.white, shade: C.cream, line: C.creamDeep },          // the millionaire's white gloves
  soot: { fill: C.plumDeep, shade: C.tealInk, line: C.plumLight, rim: C.goldPale }, // the stoker's hands, rim-lit by the fire
  brass: { fill: C.gold, shade: C.goldDeep, line: C.goldDeep },          // the engine's hands
};
function palmHand(x, y, sc, { dir = -1, rot = 0, spread = .14, sx = 1, cuffCol = C.gold, skin = SKIN.cream, print = 0 } = {}) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc * sx, sc);
  const pp = palmPath(spread, dir);
  if (skin.rim) { g.save(); g.scale(1.07, 1.04); cut(pp, skin.rim, { sh: .5, grain: 0 }); g.restore(); }
  cut(pp, skin.fill, { sh: skin.rim ? 0 : .8, lift: .4 });
  if (print > 0) { g.save(); g.clip(pp); g.globalAlpha *= print * .72; g.scale(-.86, .86); g.translate(0, -.12); cut(palmPath(.14, -dir), C.plumDeep, { sh: 0, grain: .6 }); g.restore(); } // the sooty hand's own print
  // palm creases in pencil
  g.save(); g.globalAlpha *= .45 * sx; g.strokeStyle = skin.line; g.lineWidth = .025; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-.3, -.72); g.quadraticCurveTo(0, -.6, .32, -.75); g.moveTo(dir * .05, -.12); g.quadraticCurveTo(dir * .2, -.4, dir * .02, -.6); g.stroke(); g.restore();
  cuff(sc, cuffCol);
  g.restore();
}
// drawing 3: the hand in profile, upright, palm facing the other hand; fingers stacked behind
function profileHand(x, y, sc, dir, open = 0, cuffCol = C.gold, skin = SKIN.cream) {
  const m = -dir;
  g.save(); g.translate(x, y); g.translate(.15 * m * sc, -.3 * sc); g.rotate(dir * open); g.translate(-.15 * m * sc, .3 * sc); g.scale(sc * m, sc);
  const body = [[-.3, 0], [-.34, -.4], [-.35, -.78], [-.31, -1.0], [-.28, -1.3], [-.21, -1.62], [-.1, -1.84], [.02, -1.88], [.11, -1.8], [.15, -1.5], [.17, -1.05], [.17, -.55], [.14, 0]];
  if (skin.rim) { g.save(); g.scale(1.08, 1.03); cut(blob(body, .4), skin.rim, { sh: .5, grain: 0 }); g.restore(); }
  cut(blob(body, .4), skin.fill, { sh: skin.rim ? 0 : .8, lift: .4 });
  g.save(); g.globalAlpha *= .5; g.strokeStyle = skin.line; g.lineWidth = .022; g.lineCap = 'round';
  for (const l of [[[-.2, -1.02], [-.14, -1.42], [-.05, -1.7]], [[-.08, -1.04], [-.03, -1.4], [.04, -1.62]], [[.04, -1.06], [.08, -1.36], [.11, -1.5]]]) { g.beginPath(); g.moveTo(...l[0]); g.quadraticCurveTo(...l[1], ...l[2]); g.stroke(); }
  g.restore();
  cut(blob([[.02, -.2], [.1, -.5], [.15, -.8], [.21, -1.0], [.27, -.98], [.27, -.86], [.22, -.55], [.17, -.22], [.12, -.08]], .5), skin.shade, { sh: .5 });
  g.translate(-.08, 0); g.scale(.62, 1); cuff(sc, cuffCol);
  g.restore();
}
// the hinge angle through a clap at k: swings shut fast, bounces open, settles half open
function clapOpen(t, k, wide = .5) { const lt = t - k; if (lt < 0) return wide * eo(clamp(-lt / .38)); return wide * (.55 * eo(clamp(lt / .3)) - .1 * eio(clamp((lt - .3) / 1.2))); }
// a round-ended limb from (x0,y0) to (x1,y1), radius r0 at the start, r1 at the end
function capsule(x0, y0, x1, y1, r0, r1 = r0) {
  const a = Math.atan2(y1 - y0, x1 - x0), p = new Path2D();
  p.arc(x1, y1, r1, a - Math.PI / 2, a + Math.PI / 2); p.arc(x0, y0, r0, a + Math.PI / 2, a + Math.PI * 1.5); p.closePath(); return p;
}
// a sleeve running from the wrist down out of view (len in hand units), leaning outward
function sleeve(wx, wy, sc, dir, len, col) {
  const L = len * sc, lean = dir * .22 * L;
  cut(poly([[wx - .27 * sc, wy + .5 * sc], [wx + .27 * sc, wy + .5 * sc], [wx + lean + .42 * sc, wy + L], [wx + lean - .42 * sc, wy + L]]), col, { sh: .7, lift: .2 });
}
// a sleeve (or a machine's arm) running from the wrist to a fixed root point
function sleeveTo(wx, wy, sc, root, col) {
  const [rx, ry] = root, a = Math.atan2(ry - (wy + .5 * sc), rx - wx), nx = -Math.sin(a), ny = Math.cos(a);
  cut(poly([[wx + nx * .27 * sc, wy + .5 * sc + ny * .27 * sc], [wx - nx * .27 * sc, wy + .5 * sc - ny * .27 * sc], [rx - nx * .4 * sc, ry - ny * .4 * sc], [rx + nx * .4 * sc, ry + ny * .4 * sc]]), col, { sh: .7, lift: .2 });
}
// the pair, centred at cx, wrists at cy. The approach accelerates into the hit (d = u^0.6), so
// contact lands on the sung "clap", not early. drift (0..1) lets them float open after the last clap.
// cuffCol / sleeveCol / skin give each person their own paper; sleeveLen 0 = no arms.
// L and R override any of those for one hand (the glove and the sooty hand meeting).
function clapPair(t, cx, cy, sc, k, { drift = 0, L = {}, R = {}, ...o } = {}) {
  const base = { cuffCol: C.gold, sleeveCol: C.plumLight, sleeveLen: 0, skin: SKIN.cream, print: 0, ...o };
  const side = (dir) => ({ ...base, ...(dir < 0 ? L : R) });
  const lt = t - k;
  let d = lt < 0 ? Math.pow(clamp(-lt / .42), .6) : eo(clamp((lt - .06) / .45));
  d = Math.max(d, drift);
  const bob = Math.sin(t * Math.PI * 2 / 1.02) * sc * .02, wy = cy + bob;
  const xs = (off) => [-1, 1].map((dir) => [dir, cx + dir * off]);
  let off, draw;
  if (d <= .14) {
    const op = lt < 0 ? 0 : .12 * eo(clamp(lt / .1)), sq = (lt < 0 ? 0 : Math.exp(-14 * lt)) * .04;
    off = .17 * sc + op * .04 * sc; draw = (dir, x) => { const h = side(dir); profileHand(x, wy, sc * (1 - sq), dir, op, h.cuffCol, h.skin); };
  } else if (d <= .58) {
    const q = (d - .14) / .44, sx = lerp(.45, .72, q); off = lerp(.3, .6, q) * sc;
    draw = (dir, x) => { const h = side(dir); palmHand(x, wy, sc * .84, { dir, rot: dir * lerp(.03, .1, q), spread: 0, sx, cuffCol: h.cuffCol, skin: h.skin, print: h.print }); };
  } else {
    const q = (d - .58) / .42, rk = Math.sin(lt * Math.PI * 2) * .03; off = lerp(.68, .92, q) * sc;
    draw = (dir, x) => { const h = side(dir); palmHand(x, wy, sc * .84, { dir, rot: dir * (.16 + rk), spread: .14, cuffCol: h.cuffCol, skin: h.skin, print: h.print }); };
  }
  for (const [dir, x] of xs(off)) { const h = side(dir); if (h.root) sleeveTo(x, wy, sc, h.root, h.sleeveCol); else if (h.sleeveLen > 0) sleeve(x, wy, sc, dir, h.sleeveLen, h.sleeveCol); }
  for (const [dir, x] of xs(off)) draw(dir, x);
}
// A clap that visits (Robin, look test v1: no hands hanging on screen between claps). The pair comes
// in over [k-pre, k-.2], claps on k, opens on the sung "hands" (k+.53) and is gone by k+post.
// It travels along local +y by dy (rises from below, or out from under a halo in a rotated frame).
function visitClap(t, cx, cy, sc, k, { dy = 600, pre = .7, post = 1.35, ...o } = {}) {
  if (t < k - pre || t > k + post) return;
  const i = eo(clamp((t - k + pre) / (pre - .2))), out = ei(clamp((t - k - .62) / (post - .62)));
  clapPair(t, cx, cy + (1 - i) * dy + out * dy, sc, k, o);
}
// gold rings bursting from the hit
function clapRings(t, x, y, k, scale = 1) {
  for (let r = 0; r < 3; r++) {
    const d = t - k - r * .09; if (d < 0 || d > 1.1) continue; const u = d / 1.1;
    g.save(); g.globalAlpha *= (1 - u) * .9; g.strokeStyle = r % 2 ? C.goldPale : C.gold; g.lineWidth = lerp(16, 3, u) * scale;
    g.setLineDash([22 * scale, 16 * scale]); g.beginPath(); g.arc(x, y, (60 + u * 520) * scale, 0, TAU); g.stroke(); g.restore();
  }
}

// ---------------- the poster border (static, over every frame) ----------------
// Cream paper frame with an arched top opening and a gold inner rule; corner roundels.
// Draft 3 (the audit: "make the border a living Mucha frame"): a mosaic band under the arch, and on each side
// rail one plant climbs, a different flower per act, its blooms opening on every chorus.
const ACTS = [[0, 56.88, 'lily'], [56.88, 89.7, 'iris'], [89.7, 165.0, 'poppy'], [165.0, 999, 'sunflower']];
const CHORUS_SPANS = [[41.0, 56.9], [73.8, 89.7], [127.4, 142.5], [180.0, 197.5]];
function borderBloom(x, y, r, kind, open, side) {
  if (kind === 'lily') { lily(x, y, -Math.PI / 2 + side * .5, r * 1.6, open, [C.cream, C.goldPale]); return; }
  if (kind === 'iris') { for (const [a, col] of [[-.9, C.plumLight], [0, C.plum], [.9, C.plumLight]]) { g.save(); g.translate(x, y); g.rotate(a * (.4 + .6 * open)); cut(blob([[-r * .3, 0], [0, -r * 1.3], [r * .3, 0]], .6), col, { sh: .4, grain: 0 }); g.restore(); }
    cut(blob([[x - r * .25, y], [x, y + r * .9 * open], [x + r * .25, y]], .6), C.goldPale, { sh: .3, grain: 0 }); return; }
  if (kind === 'poppy') { cut(flowerPath(x, y, r * (.5 + .5 * open), 4, side), C.plumLight, { sh: .4, grain: 0 }); cut(circle(x, y, r * .22), C.plumDeep, { sh: 0, grain: 0 }); return; }
  for (let i = 0; i < 12; i++) { const a = TAU * i / 12; g.save(); g.translate(x, y); g.rotate(a); cut(blob([[-r * .14, -r * .25], [0, -r * (.5 + .55 * open)], [r * .14, -r * .25]], .6), C.gold, { sh: .3, grain: 0 }); g.restore(); }
  cut(circle(x, y, r * .3), C.plumDeep, { sh: .2, grain: 0 });
}
function posterBorder(ctx, t = 0) {
  const prev = g; g = ctx;
  const m = 44, top = 300, p = new Path2D();
  p.rect(-20, -20, W + 40, H + 40);
  const ix = m, iw = W - m * 2, r = iw / 2;
  p.moveTo(ix, H - m); p.lineTo(ix, top); p.ellipse(W / 2, top, r, top - m, 0, Math.PI, 0); p.lineTo(ix + iw, H - m); p.closePath();
  cut(p, C.cream, { sh: 1.1, lift: .5, rule: 'evenodd' });
  const q = new Path2D(); const o = 14, j = 8;
  q.moveTo(ix + o, H - m - o); q.lineTo(ix + o, top); q.ellipse(W / 2, top, r - o, top - m - o, 0, Math.PI, 0); q.lineTo(ix + iw - o, H - m - o); q.closePath();
  q.moveTo(ix + o + j, H - m - o - j); q.lineTo(ix + iw - o - j, H - m - o - j); q.lineTo(ix + iw - o - j, top); q.ellipse(W / 2, top, r - o - j, top - m - o - j, 0, 0, Math.PI, true); q.lineTo(ix + o + j, H - m - o - j); q.closePath();
  cut(q, C.gold, { sh: .5, rule: 'evenodd', grain: .25 });
  // the mosaic band hung under the arch: two rows of small tesserae following it
  const tiles = [C.gold, C.plum, C.teal, C.cream, C.goldDeep, C.plumLight];
  for (let row = 0; row < 2; row++) { const rr = r - o - j - 12 - row * 15, rt = top - m - o - j - 12 - row * 15, n = 64 - row * 4;
    for (let i = 0; i < n; i++) { const a = Math.PI + Math.PI * (i + .5) / n, cx = W / 2 + Math.cos(a) * rr, cy = top + Math.sin(a) * rt;
      g.save(); g.translate(cx, cy); g.rotate(a + Math.PI / 2); g.fillStyle = tiles[(i * 7 + row * 3) % tiles.length]; g.fillRect(-6, -6, 12, 12); g.restore(); } }
  // the climbing plants
  const act = ACTS.find(([a0, a1]) => t >= a0 && t < a1) || ACTS[3], kind = act[2];
  const ch = Math.max(...CHORUS_SPANS.map(([a0, a1]) => ss(a0, a0 + .8, t) * (1 - ss(a1 - .3, a1, t)))), grow = ss(act[0], act[0] + 1.5, t) * .6 + .4;
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? ix + o + j + 6 : ix + iw - o - j - 6, sway = Math.sin(t * .8 + side) * 4;
    const stem = []; for (let i = 0; i <= 24; i++) { const u = i / 24, y = H - m - 30 - u * 1180 * grow; stem.push([x0 - side * (6 + 10 * Math.sin(u * 9 + side)) + sway * u, y]); }
    tendril(stem, 9, C.goldDeep, { sh: .3, grain: 0 });
    for (let i = 3; i < 24; i += 4) { const [lx, ly] = stem[i]; g.save(); g.translate(lx, ly); g.rotate(-side * (.9 + .2 * Math.sin(i))); cut(blob([[0, 0], [-8, -26], [0, -46], [8, -26]], .6), i % 8 ? C.teal : C.tealLight, { sh: .2, grain: 0 }); g.restore(); }
    for (const [i, rad] of [[8, 22], [15, 26], [23, 30]]) { const [bx, by] = stem[Math.min(i, stem.length - 1)]; borderBloom(bx - side * 14, by, rad, kind, .25 + .75 * ch, side); }
  }
  for (const [x, y] of [[m + 6, H - m - 6], [W - m - 6, H - m - 6]]) { cut(circle(x, y, 30), C.gold, { sh: .6 }); cut(circle(x, y, 14), C.plum, { sh: .3 }); }
  g = prev;
}

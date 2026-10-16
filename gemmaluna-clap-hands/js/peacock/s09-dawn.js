// 165.0-179.85 BRIDGE 2: dawn on the river (draft 3). Opens on the sun at the spotlight's place and size (the
// curtain's spotlight became it). "shine, shine" (164.98, 166.18): it rises as a sunflower halo and a peacock's
// tail fans open behind it. The camera drops low over the water; "wait up all tomorrow" (169.3-172.8): a gold
// sweep crosses the river and lights the far bank's windows one by one, paper mist lifts. "salvation army ... in
// the hole" (173.6-176.9): the band floats through the close foreground, the heron flying ahead of it. "go to
// heaven in a little rowboat" (177.46-179.8): the sun's path is a ladder and the camera cranes up it with the
// rowboat (the horseshoe on its bow, the right way up now) into the sun. The last chorus opens on that sun.
const SUN4 = { x: 540, y: 820, R: 420 };   // where the last chorus's sun sits (the dawn pushes in to it)
const DAWN_END = 179.85, DAWN_HZ = 1260;
const dawnSunY = (t) => kf3(t, [[165.0, SUN0.y], [168.8, 760]]);
function dawnSky(t, bright = 0) {
  const bands = [[C.tealDeep, -400], [C.plumDeep, 200], [C.plum, 480], [C.plumLight, 760], [C.creamDeep, 1000], [C.goldPale, 1160]];
  sheet(C.tealDeep);
  bands.forEach(([col, y], i) => cut(poly([[-200, y + Math.sin(t * .2 + i) * 10], ...[...Array(13).keys()].map((j) => [j * 110 - 120, y + Math.sin(j * .9 + i * 2 + t * .15) * 26]), [1400, y], [1400, 2600], [-200, 2600]]), col, { sh: .5, grain: .3 }));
  if (bright > 0) sheet(C.goldPale, .25 * bright);
}
// a peacock's tail fanning open behind the sun (open 0..1)
function peacockFan(x, y, len, open, t) {
  if (open <= 0) return;
  for (let i = 0; i < 15; i++) { const a = -Math.PI / 2 + (i - 7) * lerp(.02, .2, open) + Math.sin(t * 1.2 + i) * .01; feather(x, y, a, len * (1 - Math.abs(i - 7) * .03), open); }
}
// the far bank: Guimard and Horta roofs (curved mansards, wrought balconies), the clock spire, the theatre's
// dome, the Metro's two lamps at the waterline. Its windows light as the sweep reaches them.
function dawnFarBank(t, alpha = 1, sweepX = 9999) {
  const HZ = DAWN_HZ;
  g.save(); g.globalAlpha *= alpha;
  for (let i = 0; i < 12; i++) {
    const x = -60 + i * 100, h = 70 + hash(i * 3.3) * 110, w = 96;
    const p = new Path2D(); p.moveTo(x, HZ); p.lineTo(x, HZ - h); p.bezierCurveTo(x + 6, HZ - h - 40, x + w - 6, HZ - h - 40, x + w, HZ - h); p.lineTo(x + w, HZ); p.closePath();
    cut(p, C.plum, { sh: .3, grain: .2, alpha: .95 });
    tendril([[x + 10, HZ - h * .45], [x + w / 2, HZ - h * .4], [x + w - 10, HZ - h * .45]], 4, C.gold, { sh: 0, grain: 0 });
    for (let r = 0; r < 2; r++) { const wx = x + 22 + r * 34, wy = HZ - h + 26; const lit = ss(x - 60, x + 40, sweepX); g.fillStyle = lit > .5 ? C.goldPale : C.plumDeep; g.fill(archPath(wx, wy, 18, 30)); }
  }
  cut(rect(700, HZ - 260, 44, 260), C.plum, { sh: .3, alpha: .92 }); cut(poly([[694, HZ - 260], [722, HZ - 320], [750, HZ - 260]]), C.plum, { sh: .3, alpha: .92 });
  cut(circle(722, HZ - 232, 12), C.goldPale, { sh: 0, grain: 0, alpha: .85 });
  const dome = new Path2D(); dome.arc(330, HZ - 150, 70, Math.PI, 0); dome.closePath(); cut(dome, C.plum, { sh: .3, alpha: .92 }); cut(rect(326, HZ - 250, 8, 34), C.plum, { sh: 0, alpha: .92 });
  for (const sx of [-1, 1]) { const st = whipPts([900 + sx * 40, HZ], [900 + sx * 44, HZ - 50], [900 + sx * 10, HZ - 80], [900 - sx * 4, HZ - 70], 0); tendril(st, 6, C.tealDeep, { sh: 0, grain: 0 }); cut(circle(900 - sx * 4, HZ - 78, 6), C.goldPale, { sh: 0, grain: 0 }); }
  g.restore();
}
// the sun's path: curved ripples, and the ladder of light rising out of it into the sun
function dawnPath(t, alpha = 1) {
  const HZ = DAWN_HZ;
  g.save(); g.globalAlpha *= alpha;
  for (let i = 0; i < 9; i++) { const w = 40 + i * 26, y = HZ + 24 + i * 52; g.strokeStyle = C.goldPale; g.lineWidth = 10; g.lineCap = 'round'; g.globalAlpha = alpha * .8; g.beginPath(); g.moveTo(540 - w, y); g.quadraticCurveTo(540, y + 14 + Math.sin(t * 2 + i) * 4, 540 + w, y); g.stroke(); }
  g.globalAlpha = alpha;
  const lad = eo(clamp((t - 176.6) / 1.4)), sy = dawnSunY(t);
  if (lad > 0) {
    const top = lerp(HZ + 460, sy + 130, lad);
    for (const sd of [-1, 1]) {
      const pts = [[540 + sd * (40 + 8 * 26 + 18), HZ + 24 + 8 * 52 + 140], ...[...Array(9).keys()].reverse().map((i) => [540 + sd * (40 + i * 26 + 10), HZ + 30 + i * 52]), [540 + sd * 44, HZ], [540 + sd * 32, sy + 130]];
      const keep = pts.filter(([, y]) => y >= top - 1); if (keep.length < 2) continue;
      tendril(keep.concat([[keep[keep.length - 1][0], Math.max(top, keep[keep.length - 1][1] - 1)]]), 12, C.gold, { sh: .4, grain: .2 });
    }
    for (let y = HZ - 40; y > Math.max(top, sy + 140); y -= 46) { const w = lerp(44, 32, (HZ - y) / (HZ - sy - 130)); cut(rrect(540 - w, y, w * 2, 9, 4), C.goldPale, { sh: .2, grain: .1, alpha: .85 }); }
  }
  g.restore();
}
(() => {
  const HZ = DAWN_HZ;
  SHOT(165.0, DAWN_END, 'dawn', (t, k, d) => {
    const cx = kf3(t, [[165.0, 540], [169.0, 540], [172.8, 600], [173.6, 540]]);
    const cy = kf3(t, [[165.0, 960], [166.8, 960], [169.0, 1300], [172.8, 1320], [173.6, 1380], [177.0, 1380], [178.6, 1300], [179.3, 1000], [DAWN_END, 860]]);
    const z = kf3(t, [[165.0, 1.0], [166.8, 1.0], [169.0, 1.25], [173.6, 1.3], [177.0, 1.3], [178.6, 1.35], [DAWN_END, 1.4]]);
    g.save(); cam(cx, cy, z);
    dawnSky(t);
    // the sun: a disc that unfolds into a sunflower halo on "shine", a peacock's tail fanning open behind it
    const sy = dawnSunY(t), u = ss(165.2, 167.4, t);
    glow(540, sy, 700, '250,215,140', .4 + .2 * u);
    peacockFan(540, sy, 560, back(clamp((t - 165.0) / 1.0)) * .55 + back(clamp((t - 166.2) / 1.0)) * .45, t);
    if (u > 0) halo(540, sy, 300, t * .04, u, [C.gold, C.cream, C.goldPale, C.gold], 'sunflower');
    cut(circle(540, sy, lerp(SUN0.r, 150, u)), C.goldPale, { sh: .3, grain: .3 });
    // the far bank; the river, ripples and lily pads; the sweep that lights the bank
    const sw = ss(169.3, 172.8, t), sweepX = lerp(-300, 1400, sw);
    dawnFarBank(t, 1, sweepX);
    cut(cutRect(-200, HZ, 1480, 1200, 601), C.teal, { sh: .6 });
    for (let i = 0; i < 12; i++) cut(ribbon(-200, 1300, HZ + 20 + i * i * 5, 4 + i * .7, i * 1.3 + t * (.3 + i * .04), 4 + i * .8), C.tealLight, { sh: 0, grain: .2, alpha: .6 });
    for (let i = 0; i < 9; i++) { const lx = ((hash(i * 5.1) * 1300 + t * 12) % 1300) - 100, ly = HZ + 120 + hash(i * 2.7) * 700; cut(ellipse(lx, ly, 46 + i * 3, 14 + i), C.tealDeep, { sh: .3 }); cut(poly([[lx, ly], [lx + 46, ly - 6], [lx + 46, ly + 6]]), C.teal, { sh: 0, grain: 0 }); if (i % 3 === 0) cut(flowerPath(lx - 10, ly - 6, 14, 5, i), C.cream, { sh: .2, grain: 0 }); }
    if (sw > 0 && sw < 1) { g.save(); g.globalAlpha *= Math.sin(sw * Math.PI); cut(ribbon(sweepX - 420, sweepX + 420, HZ + 220, 90, t, 30), C.goldPale, { sh: 0, grain: .2 }); cut(ribbon(sweepX - 300, sweepX + 300, HZ + 420, 60, t + 1, 24), C.gold, { sh: 0, grain: .2, alpha: .8 }); g.restore(); }
    dawnPath(t, 1);
    // paper mist: layered cream bands, lifting and thinning
    const mist = ss(168.8, 170.2, t) * (1 - ss(172.6, 174.4, t));
    if (mist > 0) for (let i = 0; i < 4; i++) { const yb = HZ - 30 + i * 70 - (t - 168.8) * (22 + i * 6); g.save(); g.globalAlpha *= (.55 - i * .1) * mist; cut(poly([[-200, yb + 60], ...[...Array(12).keys()].map((j) => [j * 120 - 160, yb + Math.sin(j * 1.3 + i + t * .4) * 18]), [1400, yb + 60]]), C.cream, { sh: .2, grain: .3 }); g.restore(); }
    // the band floats through the close foreground, the heron flying low ahead of it
    [[173.4, 'drum', 1700], [173.9, 'tuba', 1820], [174.3, 'tam', 1640]].forEach(([t0, kind, y], i) => {
      const p = clamp((t - t0) / 3.6); if (p <= 0 || p >= 1) return;
      g.save(); g.translate(lerp(-260, 1340, p), y + Math.sin(t * 2.3 + i) * 12); g.rotate(Math.sin(t * 1.7 + i) * .12 + (kind === 'drum' ? 0 : i * .3));
      if (kind === 'drum') bassDrum(.85); else if (kind === 'tuba') { g.rotate(-.6); tuba(.78); } else tambourine(.9);
      g.restore();
    });
    if (t > 173.0 && t < 177.2) { const p = clamp((t - 173.0) / 3.9); g.save(); g.translate(lerp(-120, 1300, p), 1480 - Math.sin(p * 6) * 20); g.scale(-1, 1); heron(0, 0, .8, 0, t * 9); g.restore(); }
    // the rowboat, the horseshoe on its bow the right way up, sails up the path and climbs the ladder into the sun
    if (t > 177.0) {
      const bx = kf3(t, [[177.0, 300], [178.0, 520], [178.6, 540]]), by = kf3(t, [[177.0, 1760], [178.6, HZ + 6], [179.7, sy + 60]]), bs = kf3(t, [[177.0, .95], [178.6, .5], [179.7, .38]]);
      g.save(); g.translate(bx, by); g.rotate(-.5 * ss(178.6, 179.0, t)); rowboat(0, 0, bs, t * TAU / 1.03, 1);
      g.scale(bs, bs); g.translate(-150, -96);
      const hs = new Path2D(); hs.arc(0, 0, 30, Math.PI * .08, Math.PI * .92, false); hs.arc(0, 0, 18, Math.PI * .92, Math.PI * .08, true); hs.closePath(); cut(hs, C.gold, { sh: .4 }); // the horseshoe, U: luck held
      g.restore();
    }
    g.restore();
    sheet(C.goldPale, .35 * (1 - ss(165.0, 165.2, t)));
  }, { xin: .4, tr: 'fade' }); // the curtain's spotlight becomes the sun
})();

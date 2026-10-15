// 165.0-180.633 BRIDGE 2: dawn on the river. Opens on the sun at the spotlight's place and size (the curtain's
// spotlight became it). "shine, shine" (164.98, 166.18) it rises and unfolds into a gold Mucha halo; "wait up
// all tomorrow" (169.3-172.8) light sweeps across the water, mist lifts; "salvation army ... in the hole"
// (173.6-176.9) the drum, the tuba and the tambourine float past; "go to heaven in a little rowboat"
// (177.46-180.4) the rowboat sails into the sun's path; push in until the sun's halo is big and centred.
const SUN4 = { x: 540, y: 820, R: 420 };   // where the last chorus's sun sits (the dawn pushes in to it)
function dawnSky(t, bright = 0) {
  const bands = [[C.tealDeep, -400], [C.plumDeep, 200], [C.plum, 480], [C.plumLight, 760], [C.creamDeep, 1000], [C.goldPale, 1160]];
  sheet(C.tealDeep);
  bands.forEach(([col, y], i) => cut(poly([[-200, y + Math.sin(t * .2 + i) * 10], ...[...Array(13).keys()].map((j) => [j * 110 - 120, y + Math.sin(j * .9 + i * 2 + t * .15) * 26]), [1400, y], [1400, 2600], [-200, 2600]]), col, { sh: .5, grain: .3 }));
  if (bright > 0) sheet(C.goldPale, .25 * bright);
}
(() => {
  const HZ = 1260;
  const sunY = (t) => kf3(t, [[165.0, SUN0.y], [168.8, 760]]);
  SHOT(165.0, 180.633, 'dawn', (t, k, d) => {
    const z = kf3(t, [[165.0, 1.0], [179.6, 1.0], [180.633, 1.4]]), cy = kf3(t, [[165.0, 960], [179.6, 960], [180.633, 860]]);
    g.save(); cam(540, cy, z);
    dawnSky(t);
    // the sun: a plain disc that unfolds into a halo on "shine"
    const sy = sunY(t), u = ss(165.2, 167.4, t);
    rays(540, sy, 220, 1500, 30, t * .03, C.goldPale, .5 * u);
    glow(540, sy, 700, '250,215,140', .4 + .2 * u);
    if (u > 0) halo(540, sy, 300, t * .04, u, [C.gold, C.cream, C.goldPale, C.gold]);
    cut(circle(540, sy, lerp(SUN0.r, 150, u)), C.goldPale, { sh: .3, grain: .3 });
    // the far bank: the night's city, small: towers, the clock, the theatre's dome
    // tenements, the clock tower's spire and the theatre's dome, small and far
    for (let i = 0; i < 16; i++) { const x = -60 + i * 76, h = 50 + hash(i * 3.3) * 110; cut(rect(x, HZ - h, 78, h + 4), C.plum, { sh: .3, grain: .2, alpha: .92 }); }
    cut(rect(700, HZ - 260, 44, 260), C.plum, { sh: .3, alpha: .92 }); cut(poly([[694, HZ - 260], [722, HZ - 320], [750, HZ - 260]]), C.plum, { sh: .3, alpha: .92 });
    cut(circle(722, HZ - 232, 12), C.goldPale, { sh: 0, grain: 0, alpha: .85 });
    const dome = new Path2D(); dome.arc(330, HZ - 150, 70, Math.PI, 0); dome.closePath(); cut(dome, C.plum, { sh: .3, alpha: .92 }); cut(rect(326, HZ - 250, 8, 34), C.plum, { sh: 0, alpha: .92 });
    // the river, the sun's path on it, light sweeping across, mist
    cut(cutRect(-200, HZ, 1480, 1200, 601), C.teal, { sh: .6 });
    for (let i = 0; i < 12; i++) cut(ribbon(-200, 1300, HZ + 20 + i * i * 5, 4 + i * .7, i * 1.3 + t * (.3 + i * .04), 4 + i * .8), C.tealLight, { sh: 0, grain: .2, alpha: .6 });
    for (let i = 0; i < 9; i++) { const w = 40 + i * 26; cut(rrect(540 - w, HZ + 24 + i * 52, w * 2, 12, 6), C.goldPale, { sh: 0, grain: .2, alpha: .75 }); }
    const sw = ss(169.3, 172.8, t);
    if (sw > 0 && sw < 1) for (let i = 0; i < 6; i++) { const x = lerp(-600, 1500, sw) - i * 120; cut(ribbon(x - 300, x + 300, HZ + 120 + i * 90, 10, i + t, 10), C.goldPale, { sh: 0, grain: .2, alpha: .7 * Math.sin(sw * Math.PI) }); }
    const mist = ss(169.0, 170.5, t) * (1 - ss(172.5, 174.5, t));
    if (mist > 0) for (let i = 0; i < 5; i++) { g.save(); g.globalAlpha *= .5 * mist; cut(cloud(150 + i * 200 + (t - 169) * 20, HZ - 20 - (t - 169) * 18 + (i % 2) * 40, 420, 70, i + 90), C.cream, { sh: 0, grain: .3 }); g.restore(); }
    // the band, washed up on the river: floating past, bobbing
    [[173.4, 'drum', 1560], [173.9, 'tuba', 1700], [174.3, 'tam', 1500]].forEach(([t0, kind, y], i) => {
      const p = clamp((t - t0) / 4.2); if (p <= 0 || p >= 1) return;
      g.save(); g.translate(lerp(-200, 1300, p), y + Math.sin(t * 2.3 + i) * 12); g.rotate(Math.sin(t * 1.7 + i) * .12 + i * .4);
      if (kind === 'drum') bassDrum(.55); else if (kind === 'tuba') tuba(.5); else tambourine(.6);
      g.restore();
    });
    // the rowboat sails up the sun's path into it
    const bp = clamp((t - 177.2) / 2.9);
    if (bp > 0) rowboat(lerp(260, 540, eo(bp)), lerp(1760, HZ + 6, eo(bp)), lerp(.95, .12, eo(bp)), t * TAU / 1.03, 1);
    g.restore();
    sheet(C.goldPale, .5 * (1 - ss(165.0, 165.6, t)));
  }, { xin: .4, tr: 'fade' }); // the curtain's spotlight becomes the sun
})();

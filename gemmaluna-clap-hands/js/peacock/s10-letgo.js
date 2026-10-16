// 179.85-197.0 THE LAST CHORUS, "letting go" (draft 4). Opens on the dawn's sun (same place and size) 0.8 s before
// clap 1, so the first pair rises instead of popping in; the far bank and the ladder dissolve into the light, and the
// sky turns from the dawn's bands to cream and gold and keeps brightening to the end (the audit: draft 3 dimmed
// under a pink and grey band from 189 to 193). Each clap has its own framing, matched on the sun: clap 1 close and
// low on the window person's hands (plum sleeves, gold cuffs, as in chorus 1), a bird flies out; clap 2 wide,
// three pairs across the river, three birds, and the middle one is the missing man's bowler flapping its brim; clap 3
// a corona of six pairs round the sun's core, keylined in plum on a teal ring so they read against the gold, then a
// flock; clap 4 one pair at clap 1's size that claps, lets go of its sleeves and becomes a hand-shadow bird (never
// wider than 40% of the frame), while the sun becomes an open Nouveau hand rising out of the river (the same drawing
// as the Metro's iron hands that held the first light), and the bird flies into its palm. The light grows out of
// the palm to fill the frame: the brightest image, gold by 197.0.
(() => {
  const [K1, K2, K3, K4] = CLAPS.slice(12, 16);
  // the dawn's sky, town and ladder are drawn in the dawn's own world, mapped through its last camera (540, 860, 1.4),
  // so nothing jumps at the cut
  const inDawn = (fn) => { g.save(); g.translate(540, 960); g.scale(1.4, 1.4); g.translate(-540, -860); fn(); g.restore(); };
  function swallow(x, y, s, ph, col) {
    const f = .55 + .45 * Math.sin(ph);
    g.save(); g.translate(x, y); g.scale(s, s);
    for (const sd of [-1, 1]) tendril([[0, 0], [sd * 40, -46 * f], [sd * 100, -40 * f - 6], [sd * 150, 14 - 30 * f]], 34, col, { sh: .5, grain: .2 });
    cut(ellipse(0, 6, 15, 26), col, { sh: .5 });
    cut(poly([[-8, 26], [-22, 62], [0, 40], [22, 62], [8, 26]]), col, { sh: .4 });
    g.restore();
  }
  // Gilliam 11A: the missing man's bowler, flying, its brim flapping as two wings
  function flyingBowler(x, y, s, ph) {
    const f = Math.sin(ph) * .45;
    g.save(); g.translate(x, y); g.scale(s, s);
    for (const sd of [-1, 1]) {
      g.save(); g.translate(sd * 46, 2); g.rotate(sd * (-.18 - f));
      cut(ellipse(sd * 60, 0, 72, 19), C.plumDeep, { sh: .6, lift: .2 });
      g.save(); g.strokeStyle = C.cream; g.lineWidth = 6; g.globalAlpha *= .9; g.beginPath(); g.ellipse(sd * 60, 0, 70, 17, 0, .15, Math.PI - .15); g.stroke(); g.restore();
      g.restore();
    }
    const c = new Path2D(); c.moveTo(-70, 6); c.bezierCurveTo(-74, -116, 74, -116, 70, 6); c.closePath(); cut(c, C.plumDeep, { sh: .8, lift: .3 });
    cut(rect(-71, -22, 142, 22), C.gold, { sh: .2 });
    g.save(); g.globalAlpha *= .55; g.strokeStyle = C.plumLight; g.lineWidth = 6; g.beginPath(); g.arc(-10, -34, 52, -2.6, -1.6); g.stroke(); g.restore();
    g.restore();
  }
  function released(t, x0, y0, t0, seed, life = 3.2, s0 = 2.0, draw = null) {
    const d = t - t0; if (d < 0 || d > life) return;
    const u = d / life, a = seed * 2.3 + u * 3.2 * (seed % 2 ? 1 : -1);
    const x = lerp(x0, SUN4.x + Math.cos(a) * 520 * (1 - u), eo(u)), y = lerp(y0, SUN4.y + Math.sin(a) * 300 * (1 - u), eo(u));
    const s = lerp(s0, .35, u) * .7, yy = y - Math.sin(u * Math.PI) * 80;
    if (draw) draw(x, yy, s, t * 14 + seed); else swallow(x, yy, s, t * 14 + seed, seed % 3 ? C.plum : C.plumDeep);
  }
  // the hand-shadow bird: two palms crossed at the wrists, thumbs hooked into the head, fingers the wings.
  // open 0 = wings folded up (as the pair lets go of the clap), 1 = spread and flapping
  const birdRot = (open, ph) => lerp(.22, .95, open) + Math.sin(ph) * .3 * open;
  const birdWidth = (rot) => 2 * (.12 + .4 * Math.cos(rot) + 1.64 * Math.sin(rot)); // in hand units, both wings
  function handBird(x, y, sc, ph, open) {
    const r = birdRot(open, ph);
    g.save(); g.translate(x, y);
    palmHand(-.12 * sc, 0, sc, { dir: 1, rot: -r, spread: .32 });
    palmHand(.12 * sc, 0, sc, { dir: -1, rot: r, spread: .32 });
    cut(circle(0, -.42 * sc, .16 * sc), C.cream, { sh: .5 });
    cut(poly([[-.06 * sc, -.5 * sc], [0, -.68 * sc], [.06 * sc, -.5 * sc]]), C.goldDeep, { sh: .3 });
    g.restore();
  }
  // the morning sky: the dawn's bands give way to gold, then cream climbs it toward the end
  function letgoSky(t) {
    const w = ss(DAWN_END, 183.0, t);
    if (w < 1) inDawn(() => dawnSky(t));
    if (w <= 0) return;
    g.save(); g.globalAlpha *= w;
    const gr = ss(181.0, 192.0, t) * .8 + ss(192.0, 196.0, t) * .2;
    sheet(C.gold);
    [[C.goldPale, lerp(260, -260, gr)], [C.cream, lerp(780, 160, gr)], [C.white, lerp(1300, 640, gr)]].forEach(([col, y], i) =>
      cut(poly([[-200, y], ...[...Array(13).keys()].map((j) => [j * 110 - 120, y + Math.sin(j * .9 + i * 2 + t * .15) * 26]), [1400, y], [1400, 2600], [-200, 2600]]), col, { sh: .4, grain: .3 }));
    g.restore();
    glow(SUN4.x, SUN4.y, 1300, '255,240,200', .3 * w);
  }
  const THREE = [[260, 1420, 160, C.plum], [540, 1360, 180, C.goldDeep], [820, 1420, 160, C.plum]];
  const SUNPAPER = [[C.gold, C.goldPale], [C.goldPale, C.gold], [C.cream, C.gold], [C.gold, C.cream], [C.goldPale, C.gold], [C.cream, C.goldPale]];
  const RIMMED = { fill: C.cream, shade: C.creamDeep, line: C.plumLight, rim: C.plum }; // clap 3: a plum keyline so cream reads on gold
  const LAST = { x: 540, y: 1300, sc: 340, home: [540, 1200] }; // clap 4's pair: clap 1's size on screen (230 x 1.45)
  SHOT(DAWN_END, END + .1, 'letgo', (t, k, d) => {
    const hand = eo(clamp((t - K4 + .05) / 1.1));
    // the framings: matched on the sun; the climax pushes IN (the audit: draft 2 zoomed out and went dark)
    const cx = 540;
    const cy = kf3(t, [[DAWN_END, 960], [180.3, 1240], [181.8, 1240], [184.2, 1000], [185.6, 1000], [188.0, 880], [189.6, 880], [192.4, 980], [194.0, 900], [END, 880]]);
    const z = kf3(t, [[DAWN_END, 1.0], [180.3, 1.45], [181.8, 1.45], [184.2, .95], [185.6, .95], [188.0, 1.05], [189.6, 1.05], [192.4, 1.0], [END, 1.06]]);
    g.save(); cam(cx, cy, z);
    letgoSky(t);
    glow(SUN4.x, SUN4.y, 1000, '250,215,140', .55 + .2 * ss(185.5, 193.0, t)); // the light keeps growing
    // the peacock's tail from the dawn stays open behind the sun, then folds into the sun-hand's fingers
    if (hand < 1) { g.save(); g.globalAlpha *= 1 - ss(.2, .75, hand); peacockFan(SUN4.x, SUN4.y, 784 * (1 - .35 * hand), 1 - hand, t); g.restore(); } // folds down and fades as the hand rises
    // clap 4's sun-hand (draft 4): the Metro's calyx hand, now in gold, rising out of the river on its forearm and
    // opening from a bud as it comes; the sun shrinks into its palm (the audit: draft 3's hand was cropped by the arch
    // and its wrist read as an urn). Sized so every fingertip and the thumb stay inside the arch.
    const HSC = 420, wristY = lerp(2500, SUN4.y + .5 * HSC, hand), sunR = lerp(SUN4.R, 142, hand); // at most .34 x the hand's scale, so the palm reads round the sun
    if (hand > 0) calyxHand(SUN4.x, wristY, HSC, lerp(.15, 1, eo(clamp((t - K4 - .15) / 1.25))), { skin: 'gold', arm: 4, edge: C.plumDeep });
    // the far bank and the ladder of light dissolve into the morning
    const fade = 1 - ss(DAWN_END, 180.6, t);
    if (fade > 0) inDawn(() => dawnFarBank(t, fade));
    dawnCorona(SUN4.x, SUN4.y, sunR, t * .04, 1); // the sun settles into the palm
    // clap 3: a corona of six pairs in sun papers round the core, out from under it, on a teal ring
    // behind each pair a teal petal unfolds from the core, so the cream hands read on the gold corona (the audit: they
    // dissolved into it); six petals, not a full ring, so the sun stays bright
    const ringA = back(clamp((t - K3 + .8) / .4)) * (1 - eio(clamp((t - K3 - .95) / .45)));
    if (ringA > 0) {
      const lobes = new Path2D(), L = 240 * ringA;
      for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + i / 6 * TAU + t * .03;
        lobes.addPath(blob([[-40, 0], [-112, -L * .45], [-70, -L * .9], [0, -L * 1.02], [70, -L * .9], [112, -L * .45], [40, 0]], .55), new DOMMatrix().translate(SUN4.x + Math.cos(a) * 228, SUN4.y + Math.sin(a) * 228).rotate((a + Math.PI / 2) * 180 / Math.PI)); }
      g.save(); g.strokeStyle = C.teal; g.lineWidth = 10; g.stroke(lobes); g.restore();
      cut(lobes, C.tealLight, { sh: .7, lift: .2 });
    }
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + i / 6 * TAU + t * .03, [sl, cf] = SUNPAPER[i];
      g.save(); g.translate(SUN4.x + Math.cos(a) * 245, SUN4.y + Math.sin(a) * 245); g.rotate(a + Math.PI / 2);
      visitClap(t, 0, 0, 96, K3, { dy: 300, sleeveLen: 1.15, sleeveCol: sl, cuffCol: cf, pre: .75, skin: RIMMED });
      g.restore();
      released(t, SUN4.x + Math.cos(a) * (SUN4.R + 200), SUN4.y + Math.sin(a) * (SUN4.R + 200), K3 + .5 + i * .05, i + 7, 3.0, 1.1);
    }
    cut(circle(SUN4.x, SUN4.y, sunR * .52), C.goldPale, { sh: .5, lift: .3, grain: .3 });
    // lilies round the sun; the upper ones fade as the fingers come through
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + t * .03, kk = CLAPS[12 + (i % 4)], fa = Math.sin(a) < .2 ? 1 - hand : 1; if (fa <= 0) continue; g.save(); g.globalAlpha *= fa; lily(SUN4.x + Math.cos(a) * (SUN4.R + 90), SUN4.y + Math.sin(a) * (SUN4.R + 90), a, 100, back(clamp((t - kk - .1) / .7)), [C.cream, C.goldPale]); g.restore(); }
    if (hand < 1) for (const sx of [-1, 1]) { const v = whipPts([540 + sx * 600, 1700], [540 + sx * 300, 1800], [540 + sx * 80, 1450], [540 + sx * 260, 1330], 60, -sx); tendril(grow(v, ss(K1, K4, t)), 30, C.gold, { alpha: 1 - hand }); } // they give way to the rising wrist (they read as an urn's handles round it)
    // the river; it warms to gold as the light grows
    cut(cutRect(-200, 1520, 1480, 900, 701), C.teal, { sh: .6 }); // the dawn's waterline, through its last camera
    g.save(); g.globalAlpha *= .5 * ss(185.5, 192.5, t) + .35 * ss(193.0, 195.6, t); cut(cutRect(-200, 1520, 1480, 900, 702), C.goldPale, { sh: 0, grain: .3 }); g.restore();
    if (hand > 0) { g.save(); g.globalAlpha *= hand; g.strokeStyle = C.goldPale; g.lineWidth = 8; for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(SUN4.x, 1530 + i * 18, HSC * .4 + i * 40 + Math.sin(t * 3 + i) * 6, 16 + i * 6, 0, 0, Math.PI); g.stroke(); } g.restore(); } // ripples round the wrist
    for (let i = 0; i < 8; i++) { const w = 60 + i * 30, y = 1530 + i * 46; g.strokeStyle = C.goldPale; g.lineWidth = 10; g.lineCap = 'round'; g.globalAlpha = .75 * (1 - fade); g.beginPath(); g.moveTo(540 - w, y); g.quadraticCurveTo(540, y + 14, 540 + w, y); g.stroke(); g.globalAlpha = 1; }
    if (fade > 0) inDawn(() => dawnPath(t, fade));
    if (t < 180.15) { const sp = 1 - ss(DAWN_END, 180.15, t); glow(SUN4.x, SUN4.y, 160, '255,244,214', .3 * sp); } // the rowboat's spark, fading
    // clap 1: one pair, one bird
    visitClap(t, 540, 1360, 230, K1, { sleeveLen: 6, sleeveCol: PEOPLE[0][0], cuffCol: PEOPLE[0][1], dy: 1000, post: 1.5 });
    released(t, 540, 1080, K1 + .5, 1, 3.4, 2.4);
    // clap 2: three pairs across the river, three birds; the middle pair lets the missing man's bowler go
    THREE.forEach(([x, y, sc, sl], i) => { visitClap(t, x, y, sc, K2, { sleeveLen: 6, sleeveCol: sl, cuffCol: C.gold, dy: 1000, post: 1.5 }); released(t, x, y - sc * 1.2, K2 + .5 + i * .06, i + 3, 3.2, i === 1 ? 1.25 : 1.3, i === 1 ? flyingBowler : null); });
    if (t > K3 + 1) for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + (t - K3) * .9, r = SUN4.R + 160 + Math.sin(t * 2 + i) * 40; g.save(); g.globalAlpha *= ss(K3 + 1, K3 + 2, t) * (1 - ss(195, 196.5, t)); swallow(SUN4.x + Math.cos(a) * r, SUN4.y + Math.sin(a) * r * .8, .55, t * 14 + i, i % 2 ? C.plum : C.plumDeep); g.restore(); }
    // clap 4: the pair claps at clap 1's size, holds the clap as it lifts away, lets go of its sleeves, and becomes the
    // hand-shadow bird; the wings open on "hands" and it flies into the palm, never wider than 40% of the frame
    const swap = K4 + .4, sleeves = { sleeveLen: 6, sleeveCol: PEOPLE[0][0], cuffCol: PEOPLE[0][1] };
    if (t < K4) visitClap(t, LAST.x, LAST.y, LAST.sc, K4, { ...sleeves, dy: 1100, pre: .8 });
    else if (t < swap) { const q = eo((t - K4) / .4); clapPair(Math.min(t, K4 + .03), LAST.x, lerp(LAST.y, LAST.home[1], q), lerp(LAST.sc, 190, q), K4, sleeves); }
    else {
      const fall = clamp((t - swap) / .55); // the sleeves it let go of drop away
      if (fall < 1) { g.save(); g.beginPath(); g.rect(-600, -600, 2400, 2100); g.clip(); g.globalAlpha *= 1 - fall * fall; for (const dir of [-1, 1]) sleeve(LAST.x + dir * .17 * 190, LAST.home[1] + 900 * ei(fall), 190, dir, 6, sleeves.sleeveCol); g.restore(); }
      const u = clamp((t - swap) / 2.4), open = ss(K4 + .45, K4 + .75, t), ph = t * 11;
      const x = lerp(LAST.home[0], SUN4.x, eo(u)) + Math.sin(u * 5) * 70 * (1 - u), y = lerp(LAST.home[1], SUN4.y, eo(u));
      const cap = 432 / (z * birdWidth(birdRot(open, ph) + .02));
      handBird(x, y, Math.min(lerp(190, 40, ei(u)), cap), ph, open);
    }
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

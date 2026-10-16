// 73.6-89.7 CHORUS 2, "the engine": the steamer's boiler room. Opens inside the furnace door's glow (the deck's
// door), pulls back. Clap 1 (74.433) the millionaire's white gloves; the furnace door slams, sparks. Clap 2
// (78.867) the stoker's sooty hands in front of the open fire; coal dust, the pistons strike, the whistle.
// Clap 3 (83.033) one glove and one sooty hand clap TOGETHER; the glove keeps a soot print; every gauge needle
// jumps. Clap 4 (86.8) the engine claps: brass hands on piston arms, the centre on the beat, the clap echoing
// out along the row; the whistle blows. Then climb the spiral stair to the round hatch: its disc of night sky
// and moon becomes the avenue's moon (verse 3).
(() => {
  const [K1, K2, K3, K4] = CLAPS.slice(4, 8);
  const DOOR = { x: 540, y: 1380, r: 170 };
  const HATCH = { x: 540, y: -560, r: 160 };
  const beats = (window.FEAT && FEAT.beats) || [];
  const pump = (t) => { let p = 0; for (const b of beats) { const d = t - b; if (d >= 0 && d < .45) p = Math.max(p, 1 - d / .45); if (b > t) break; } return p; };
  // a pressure gauge as a small Mucha halo: scallop, cream face, ticks, a plum needle
  function gauge(x, y, r, a, flare) {
    if (flare > 0) glow(x, y, r * 2.4, '250,215,140', .55 * flare);
    cut(ringLace(x, y, r * .98, r * 1.22, 12, .2), C.cream, { sh: .6, rule: 'evenodd' });
    cut(scallop(x, y, r, 18, .08), C.gold, { sh: .9, lift: .3 });
    cut(circle(x, y, r * .78), C.cream, { sh: .3, grain: .2 });
    g.save(); g.strokeStyle = C.plumDeep; g.lineWidth = 3; g.globalAlpha *= .7;
    for (let i = 0; i <= 8; i++) { const b = -2.3 + i * 4.6 / 8; g.beginPath(); g.moveTo(x + Math.cos(b - Math.PI / 2) * r * .62, y + Math.sin(b - Math.PI / 2) * r * .62); g.lineTo(x + Math.cos(b - Math.PI / 2) * r * .72, y + Math.sin(b - Math.PI / 2) * r * .72); g.stroke(); }
    g.restore();
    g.save(); g.translate(x, y); g.rotate(a); cut(poly([[-5, 8], [0, -r * .66], [5, 8]]), C.plum, { sh: .4 }); g.restore();
    cut(circle(x, y, 9), C.goldDeep, { sh: .3 });
  }
  function valveWheel(x, y, r, a) {
    cut(ringLace(x, y, r * .82, r), C.gold, { sh: .8, rule: 'evenodd' });
    for (let i = 0; i < 6; i++) { g.save(); g.translate(x, y); g.rotate(a + i * Math.PI / 3); cut(rect(-5, 0, 10, r * .85), C.goldDeep, { sh: .3, grain: 0 }); g.restore(); }
    cut(circle(x, y, r * .2), C.goldDeep, { sh: .5 });
  }
  function piston(x, top, len, ext) {
    cut(cutRect(x - 34, top, 68, len, x), C.goldDeep, { sh: .8, lift: .3 });
    for (let i = 0; i < 3; i++) cut(rect(x - 38, top + 20 + i * (len - 40) / 2, 76, 10), C.gold, { sh: .3, grain: 0 });
    cut(rect(x - 10, top - 30 - ext, 20, 40 + ext), C.cream, { sh: .5 });
    cut(rrect(x - 26, top - 52 - ext, 52, 26, 8), C.gold, { sh: .5 });
  }
  function steam(t, x, y, t0, n = 4, size = 1) {
    const d = t - t0; if (d < 0 || d > 2.2) return;
    for (let j = 0; j < n; j++) {
      const u = clamp(d / (1.2 + j * .2)), sx = x + (j - (n - 1) / 2) * 18, rise = 380 * size * eo(u);
      const v = whipPts([sx, y], [sx + (j % 2 ? 80 : -80) * size, y - rise * .4], [sx + (j % 2 ? -40 : 40) * size, y - rise * .8], [sx + (j % 2 ? 90 : -90) * size, y - rise], 40 * size, j % 2 ? 1 : -1);
      tendril(grow(v, eo(u * 1.4)), (40 - j * 6) * size, j % 2 ? C.cream : C.white, { sh: .3, alpha: .7 * (1 - ei(clamp((d - 1) / 1.2))), grain: .3 });
    }
  }
  // sparks from the door's rim on the slam: gold chips on ballistic arcs
  function sparks(t, x, y, t0, n = 26) {
    const d = t - t0; if (d < 0 || d > 1.4) return;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI * (.1 + .8 * hash(i * 3.7)), sp = 500 + hash(i * 1.9) * 700;
      const px = x + Math.cos(a) * (DOOR.r + sp * d), py = y + Math.sin(a) * (DOOR.r * .6 + sp * d) + 900 * d * d;
      g.save(); g.globalAlpha *= 1 - d / 1.4; cut(star4(px, py, 12 + hash(i) * 10), i % 3 ? C.goldPale : C.gold, { sh: 0, grain: 0 }); g.restore();
    }
  }
  // coal dust: dark paper puffs blooming out from the hit
  function dust(t, x, y, t0) {
    const d = t - t0; if (d < 0 || d > 1.6) return;
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + .3, r = 40 + 260 * eo(d / 1.2);
      g.save(); g.globalAlpha *= .75 * (1 - d / 1.6); cut(cloud(x + Math.cos(a) * r, y + Math.sin(a) * r * .7, 120 + 80 * eo(d), 70 + 40 * eo(d), i), i % 2 ? C.tealInk : C.plumDeep, { sh: .3 }); g.restore(); }
  }
  const GLOVE = { skin: SKIN.glove, cuffCol: C.white, sleeveCol: C.plumDeep };
  const SOOT = { skin: SKIN.soot, cuffCol: C.cream, sleeveCol: C.tealDeep };

  // the four claps, each with its own setup (draft 3): the camera drifts between them, always on the furnace
  const SETUP = { c1: [540, 1240, 1.35, 0], c2: [540, 1430, 1.45, -.05], c3: [540, 1140, 2.0, 0], c4: [540, 900, .92, 0] };
  const ECHO = [[380, .12], [700, .12], [230, .24], [850, .24]];
  SHOT(73.6, 89.7, 'engine', (t, k, d) => {
    const key = (n) => SETUP[n];
    const KS = [[73.6, [DOOR.x, DOOR.y, 5.9, 0]], [74.25, key('c1')], [75.4, key('c1')], [77.9, key('c2')], [79.8, key('c2')], [82.4, key('c3')], [84.0, key('c3')], [86.0, key('c4')], [87.6, key('c4')]];
    let [cx, cy, z, rot] = [0, 1, 2, 3].map((j) => kf3(t, KS.map(([tt, v]) => [tt, v[j]])));
    if (t < 74.25) z = Math.exp(lerp(Math.log(5.9), Math.log(1.35), eo(clamp((t - 73.6) / .65))));
    const up = eio(clamp((t - 87.6) / 1.5)), into = ei(clamp((t - 89.0) / .62));
    if (t > 87.6) { cy = lerp(cy, HATCH.y + 120, up); z = lerp(z, 1.0, up); }
    if (t > 89.0) { cy = lerp(HATCH.y + 120, HATCH.y, eio(clamp((t - 89.0) / .5))); z = Math.pow(5.6, into); }
    g.save(); cam(cx, cy, z, rot);
    const p = pump(t);
    sheet(C.plumDeep);
    if (t > 86.8) { // the stairwell and the hatch exist only once we climb (the audit: a stray gold "E" above the room)
      cut(cutRect(-60, -1200, W + 120, 900, 101), C.plumDeep, { sh: .3 });
      cut(circle(HATCH.x, HATCH.y, HATCH.r), C.tealInk, { sh: 0 });
      for (let i = 0; i < 9; i++) { const a = i * 2.4, r = 40 + hash(i) * 55; cut(star4(HATCH.x - 30 + Math.cos(a) * r, HATCH.y + 40 + Math.sin(a) * r * .8, 5 + hash(i) * 5), C.goldPale, { sh: 0, grain: 0 }); }
      cut(circle(HATCH.x + 30, HATCH.y - 20, 60), C.goldPale, { sh: .3, grain: .2 });
      cut(ringLace(HATCH.x, HATCH.y, HATCH.r, HATCH.r + 34, 16), C.gold, { sh: .9, lift: .3, rule: 'evenodd' });
      // a Horta stair: whiplash balustrade, the post's capital bursting into tendrils that curl round the hatch
      const ST = [...Array(27).keys()].map((i) => { const a = i * .5, y = 960 - i * 50; return { a, y, x: 540 + Math.cos(a) * 240, front: Math.sin(a) > 0 }; });
      for (const pass of [0, 1]) {
        for (const s0 of ST) if (s0.front === !!pass) { const x0 = Math.min(540, s0.x), w = Math.max(30, Math.abs(s0.x - 540)); g.save(); g.globalAlpha *= pass ? 1 : .6; cut(rrect(x0, s0.y - 10, w, 20, 6), pass ? C.gold : C.goldDeep, { sh: .5 }); g.restore(); }
        if (!pass) cut(rect(530, -350, 20, 1330), C.goldDeep, { sh: .5 });
      }
      tendril(ST.map((s0) => [s0.x, s0.y - 70]), 12, C.gold, { sh: .4 });
      for (const sx of [-1, 1]) tendril(whipPts([540, -350], [540 + sx * 60, -390], [540 + sx * 230, -420], [540 + sx * 200, -600], 40, -sx), 14, C.gold, { sh: .4 });
    }
    // the room: plum wall with gold tesserae, a Guimard canopy of whiplash iron over the boiler
    cut(cutRect(-60, 300, W + 120, 1700, 102), C.plum, { sh: .6 });
    for (let r = 0; r < 8; r++) for (let c = 0; c < 9; c++) { g.save(); g.translate(60 + c * 120 + (r % 2) * 60, 360 + r * 200); g.rotate(Math.PI / 4); g.fillStyle = (r + c) % 3 ? C.goldDeep : C.gold; g.fillRect(-7, -7, 14, 14); g.restore(); }
    for (const sx of [-1, 1]) tendril(whipPts([540 + sx * 520, 1000], [540 + sx * 560, 420], [540 + sx * 200, 160], [540 + sx * 30, 330], 60, -sx), 30, C.tealDeep, { sh: .8, lift: .3 });
    for (const sx of [-1, 1]) {
      tendril(whipPts([540 + sx * 520, 1500], [540 + sx * 500, 900], [540 + sx * 200, 700], [540 + sx * 330, 420], 50, -sx), 34, C.goldDeep, { sh: .7 });
      tendril(whipPts([540 + sx * 420, 1700], [540 + sx * 460, 1200], [540 + sx * 120, 1000], [540 + sx * 160, 760], 36, sx), 22, C.gold, { sh: .6 });
    }
    valveWheel(150, 760, 64, t * 1.4 + p * .6); valveWheel(930, 760, 64, -t * 1.4 - p * .6);
    const jump = t > K3 ? back(clamp((t - K3) / .35)) * (1 - ss(K3 + 1.2, K3 + 2.4, t)) : 0;
    [[250, 560, 92], [540, 470, 104], [830, 560, 92]].forEach(([x, y, r], i) => gauge(x, y, r, -1.2 + .25 * Math.sin(t * 2.1 + i) + .5 * p + 2.1 * jump, jump * .9 + .15 * p));
    const strike = t > K2 ? Math.exp(-6 * (t - K2)) : 0;
    piston(110, 1130, 300, 110 * p + 160 * strike); piston(970, 1130, 300, 110 * p + 160 * strike);
    // clap 4's echo: small soot-printed brass hands rising from behind the boiler, clapping in a ripple outward
    for (const [x, lag] of ECHO) visitClap(t, x, 1000, 86, K4 + lag, { skin: SKIN.brass, cuffCol: C.goldPale, sleeveCol: C.goldDeep, sleeveLen: 3, dy: 260, pre: .6, print: 1 });
    // the boiler, its whistle and the furnace door: a leaded-glass rondel of irises when it is shut
    cut(rrect(170, 1000, 740, 780, 150), C.plum, { sh: 1.1, lift: .5 });
    for (let i = 0; i < 3; i++) cut(rect(170, 1080 + i * 220, 740, 16), C.gold, { sh: .3 });
    cut(rect(520, 930, 40, 80), C.gold, { sh: .6 }); cut(ellipse(540, 926, 34, 14), C.goldPale, { sh: .4 });
    const shut = ss(K1 - .18, K1, t) * (1 - ss(77.5, 78.0, t));
    const fire = .6 + .25 * p + .2 * Math.sin(t * 11);
    glow(DOOR.x, DOOR.y, 520, '250,180,100', (.25 + .35 * (1 - shut)) * fire);
    cut(scallop(DOOR.x, DOOR.y, DOOR.r, 26, .06), C.gold, { sh: 1, lift: .4 });
    cut(circle(DOOR.x, DOOR.y, DOOR.r * .8), C.goldPale, { sh: .3, grain: .3 });
    for (let i = 0; i < 5; i++) { const fx = DOOR.x - 90 + i * 45, fh = 60 + 50 * Math.abs(Math.sin(t * 6 + i * 1.7)); cut(blob([[fx - 22, DOOR.y + 100], [fx, DOOR.y + 100 - fh], [fx + 22, DOOR.y + 100]], .6), i % 2 ? C.gold : C.white, { sh: 0, grain: .2, alpha: .9 }); }
    g.save(); g.translate(DOOR.x - DOOR.r * .8 * (1 - shut), DOOR.y); g.scale(lerp(.15, 1, shut), 1);
    cut(circle(0, 0, DOOR.r * .8), C.teal, { sh: .6 });
    glow(0, 0, DOOR.r * .8, '250,200,120', .5 * fire);
    for (let i = -1; i <= 1; i++) { tendril([[i * 46, 120], [i * 40, 40], [i * 52, -30]], 8, C.plumDeep, { sh: 0, grain: 0 }); borderBloom(i * 52, -40, 30, 'iris', 1, 1); }
    cut(ringLace(0, 0, DOOR.r * .74, DOOR.r * .8), C.plumDeep, { sh: 0, rule: 'evenodd' });
    g.restore();
    // the claps
    visitClap(t, 540, 1080, 200, K1, { ...GLOVE, sleeveLen: 6, dy: 1000, pre: .7 });
    sparks(t, DOOR.x, DOOR.y, K1);
    visitClap(t, 540, 1260, 190, K2, { ...SOOT, sleeveLen: 6, dy: 1000 });
    dust(t, 540, 1000, K2 + .02);
    visitClap(t, 540, 1260, 210, K3, { L: { ...GLOVE, print: ss(K3 + .02, K3 + .1, t) }, R: SOOT, sleeveLen: 6, dy: 1000 });
    // clap 4 (Mark): the machine claps above its gauges, its piston arms reaching into the canopy
    visitClap(t, 540, 430, 200, K4, { skin: SKIN.brass, cuffCol: C.goldPale, sleeveCol: C.goldDeep, L: { root: [110, 1110] }, R: { root: [970, 1110] }, dy: 640, pre: .9, post: 1.6 });
    for (const kk of [K2, K4]) steam(t, 540, 920, kk, 5, 1.2);
    for (const kk of [K1, K2, K3]) clapRings(t, 540, 900, kk, .7);
    clapRings(t, 540, 250, K4, 1.1);
    g.restore();
    // clap 2's foreground: two great pistons pumping close to the lens, low angle
    const fg = ss(77.2, 77.9, t) * (1 - ss(79.9, 80.6, t));
    if (fg > 0) for (const x of [80, 1000]) { const e = 120 * p + 220 * strike; g.save(); g.globalAlpha *= fg * .95; cut(rect(x - 46, 1100 - e, 92, 900), C.goldDeep, { sh: 1, lift: .6 }); cut(rect(x - 52, 1060 - e, 104, 50), C.gold, { sh: .4 }); g.restore(); }
    sheet(C.goldPale, .2 * (1 - ss(73.6, 74.15, t))); // draft 4: a slower wash out of the furnace covers the pull-back's
    // second brightening (the flash check sat at its 3/s limit here)
  });
})();

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
  const BRASS = [[150, 1000, 92, .2], [345, 880, 104, .1], [540, 840, 122, 0], [735, 880, 104, .1], [930, 1000, 92, .2]];
  const GLOVE = { skin: SKIN.glove, cuffCol: C.white, sleeveCol: C.plumDeep };
  const SOOT = { skin: SKIN.soot, cuffCol: C.cream, sleeveCol: C.tealDeep };

  SHOT(73.6, 89.7, 'engine', (t, k, d) => {
    // camera: out of the door's glow; steady; then up the stair to the hatch and into its sky
    const out = eo(clamp((t - 73.6) / .65));
    let cx = 540, cy = lerp(DOOR.y, 1050, out), z = Math.exp(lerp(Math.log(5.9), 0, out));
    const up = eio(clamp((t - 87.6) / 1.5)), into = ei(clamp((t - 89.0) / .7));
    if (t > 87.6) { cy = lerp(1050, HATCH.y + 120, up); }
    if (t > 89.0) { cy = lerp(HATCH.y + 120, HATCH.y, eio(clamp((t - 89.0) / .5))); z = Math.pow(5.6, into); }
    g.save(); cam(cx, cy, z);
    const p = pump(t);
    sheet(C.plumDeep);
    // the hatch above, and the spiral stair up to it
    cut(cutRect(-60, -1200, W + 120, 900, 101), C.plumDeep, { sh: .3 });
    for (const sx of [-1, 1]) tendril(whipPts([540 + sx * 560, -120], [540 + sx * 420, -300], [540 + sx * 300, -520], [540 + sx * 220, -700], 40, sx), 26, C.goldDeep, { sh: .6 });
    cut(circle(HATCH.x, HATCH.y, HATCH.r), C.tealInk, { sh: 0 });
    for (let i = 0; i < 12; i++) cut(star4(HATCH.x - 120 + hash(i * 3.1) * 240, HATCH.y - 120 + hash(i * 5.3) * 240, 6 + hash(i) * 6), C.goldPale, { sh: 0, grain: 0 });
    cut(circle(HATCH.x + 30, HATCH.y - 20, 60), C.goldPale, { sh: .3, grain: .2 });
    cut(ringLace(HATCH.x, HATCH.y, HATCH.r, HATCH.r + 34, 16), C.gold, { sh: .9, lift: .3, rule: 'evenodd' });
    // the spiral stair: treads radiate from a gold post, a handrail spirals up their outer ends
    const ST = [...Array(27).keys()].map((i) => { const a = i * .5, y = 960 - i * 50; return { a, y, x: 540 + Math.cos(a) * 240, front: Math.sin(a) > 0 }; });
    for (const pass of [0, 1]) {
      for (const s0 of ST) if (s0.front === !!pass) {
        const x0 = Math.min(540, s0.x), w = Math.max(30, Math.abs(s0.x - 540));
        g.save(); g.globalAlpha *= pass ? 1 : .6; cut(rrect(x0, s0.y - 10, w, 20, 6), pass ? C.gold : C.goldDeep, { sh: .5 }); g.restore();
      }
      if (!pass) cut(rect(530, -420, 20, 1400), C.goldDeep, { sh: .5 });
    }
    tendril(ST.map((s0) => [s0.x, s0.y - 70]), 12, C.gold, { sh: .4 });
    // the room: riveted plum wall, whiplash pipes, valve wheels, gauges
    cut(cutRect(-60, 300, W + 120, 1700, 102), C.plum, { sh: .6 });
    for (let r = 0; r < 8; r++) for (let c = 0; c < 9; c++) cut(circle(60 + c * 120, 360 + r * 200, 6), C.goldDeep, { sh: .1, grain: 0 });
    for (const sx of [-1, 1]) {
      tendril(whipPts([540 + sx * 520, 1500], [540 + sx * 500, 900], [540 + sx * 200, 700], [540 + sx * 330, 420], 50, -sx), 34, C.goldDeep, { sh: .7 });
      tendril(whipPts([540 + sx * 420, 1700], [540 + sx * 460, 1200], [540 + sx * 120, 1000], [540 + sx * 160, 760], 36, sx), 22, C.gold, { sh: .6 });
    }
    valveWheel(150, 760, 64, t * 1.4); valveWheel(930, 760, 64, -t * 1.4);
    const jump = t > K3 ? back(clamp((t - K3) / .35)) * (1 - ss(K3 + 1.2, K3 + 2.4, t)) : 0;
    [[250, 560, 92], [540, 470, 104], [830, 560, 92]].forEach(([x, y, r], i) => gauge(x, y, r, -1.2 + .25 * Math.sin(t * 2.1 + i) + .3 * p + 2.1 * jump, jump * .9 + .15 * p));
    // pistons pumping on the beat; they strike on clap 2
    const strike = t > K2 ? Math.exp(-6 * (t - K2)) : 0;
    piston(110, 1130, 300, 60 * p + 160 * strike); piston(970, 1130, 300, 60 * p + 160 * strike);
    // the boiler and its furnace door
    cut(rrect(170, 1000, 740, 780, 150), C.plum, { sh: 1.1, lift: .5 });
    for (let i = 0; i < 3; i++) cut(rect(170, 1080 + i * 220, 740, 16), C.gold, { sh: .3 });
    for (let i = 0; i < 12; i++) cut(circle(200 + i * 62, 1060, 7), C.goldDeep, { sh: .1, grain: 0 });
    cut(rect(520, 930, 40, 80), C.gold, { sh: .6 }); cut(ellipse(540, 926, 34, 14), C.goldPale, { sh: .4 }); // the whistle
    // door: open (swung left) except from the slam on clap 1 until the stoker opens it again (77.5-78.0)
    const shut = ss(K1 - .18, K1, t) * (1 - ss(77.5, 78.0, t));
    const fire = .6 + .25 * p + .2 * Math.sin(t * 11);
    glow(DOOR.x, DOOR.y, 520, '250,180,100', (.25 + .35 * (1 - shut)) * fire);
    cut(scallop(DOOR.x, DOOR.y, DOOR.r, 26, .06), C.gold, { sh: 1, lift: .4 });
    cut(circle(DOOR.x, DOOR.y, DOOR.r * .8), C.goldPale, { sh: .3, grain: .3 });
    for (let i = 0; i < 5; i++) { const fx = DOOR.x - 90 + i * 45, fh = 60 + 50 * Math.abs(Math.sin(t * 6 + i * 1.7)); cut(blob([[fx - 22, DOOR.y + 100], [fx, DOOR.y + 100 - fh], [fx + 22, DOOR.y + 100]], .6), i % 2 ? C.gold : C.white, { sh: 0, grain: .2, alpha: .9 }); }
    g.save(); g.translate(DOOR.x - DOOR.r * .8 * (1 - shut), DOOR.y); g.scale(lerp(.15, 1, shut), 1);
    cut(circle(0, 0, DOOR.r * .8), C.plumDeep, { sh: .6 });
    for (let i = 0; i < 5; i++) cut(rect(-90 + i * 45 - 6, -84, 12, 168), C.goldDeep, { sh: .3, grain: 0 });
    cut(flowerPath(0, 0, 50, 5, .2), C.gold, { sh: .3, alpha: .8 });
    g.restore();
    // the claps
    visitClap(t, 540, 1290, 210, K1, { ...GLOVE, sleeveLen: 6, dy: 1000, pre: .7 });
    sparks(t, DOOR.x, DOOR.y, K1);
    visitClap(t, 540, 1330, 210, K2, { ...SOOT, sleeveLen: 6, dy: 1000 });
    dust(t, 540, 1050, K2 + .02);
    visitClap(t, 540, 1310, 220, K3, { L: { ...GLOVE, print: ss(K3 + .02, K3 + .1, t) }, R: SOOT, sleeveLen: 6, dy: 1000 });
    for (const [x, y, sc, lag] of BRASS) visitClap(t, x, y, sc, K4 + lag, { skin: SKIN.brass, cuffCol: C.goldPale, sleeveCol: C.goldDeep, sleeveLen: 7, dy: 900, pre: .8 });
    for (const k of [K2, K4]) steam(t, 540, 920, k, 5, 1.2);
    for (const k of [K1, K2, K3]) clapRings(t, 540, 1080, k, .7);
    clapRings(t, 540, 650, K4, 1.1);
    g.restore();
    sheet(C.goldPale, .55 * (1 - ss(73.6, 74.0, t)));
  }, { smooth: true });
})();

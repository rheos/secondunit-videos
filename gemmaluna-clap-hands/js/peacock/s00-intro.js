// 11.0-26.04 INTRO: rooftops in the rain under the moon-halo, a slow tilt down the façades to a Guimard
// Metro entrance. Its lily-bud lamps flicker on (~23 to 25); push into the right one: its glow becomes the
// tram's hanging lily lamp (the tram opens zoomed into it).
(() => {
  // a cheap fill with no shadow or grain (small, many: stars, rivets, sparks)
  function waterTower(x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s);
    for (const lx of [-70, -24, 24, 70]) cut(rect(lx - 5, -150, 10, 150), C.plumDeep, { sh: .3, grain: 0 });
    cut(rect(-80, -110, 160, 8), C.plumDeep, { sh: .2, grain: 0 });
    cut(cutRect(-90, -330, 180, 180, 7), C.plum, { sh: .8, lift: .3 });
    for (let i = 0; i < 3; i++) cut(rect(-92, -300 + i * 55, 184, 7), C.goldDeep, { sh: .2, grain: 0 });
    cut(poly([[-104, -326], [0, -420], [104, -326]]), C.plumDeep, { sh: .6 });
    cut(circle(0, -426, 8), C.gold, { sh: .2 });
    g.restore();
  }
  function chimney(x, y, w, h, t, seed) {
    cut(cutRect(x - w / 2, y - h, w, h, seed), C.plumDeep, { sh: .6 });
    cut(cutRect(x - w / 2 - 8, y - h - 14, w + 16, 16, seed + 1), C.plum, { sh: .4 });
    // whiplash smoke curling off to the right
    for (let j = 0; j < 2; j++) {
      const ph = t * .6 + seed + j * 1.7, sx = x + 10 * j, sy = y - h - 10;
      const v = whipPts([sx, sy], [sx - 30 + Math.sin(ph) * 20, sy - 120], [sx + 90, sy - 200 + Math.cos(ph) * 20], [sx + 200, sy - 230], 36, 1);
      tendril(v, 24 - j * 8, j ? C.creamDeep : C.cream, { sh: .3, alpha: .4 - j * .12, grain: .3 });
    }
  }
  // the skyline: back row plumDeep (taller), front row plum with arched windows down to the street
  const BACK = [[-40, 300, -760], [260, 220, -820], [480, 260, -700], [740, 240, -860], [980, 200, -720]];
  const FRONT = [[-40, 330, -540], [290, 260, -640], [550, 240, -480], [790, 330, -600]];
  function skyline(t) {
    for (const [x, w, top] of BACK) cut(cutRect(x, top, w, 2600, x + 3), C.plumDeep, { sh: .7, lift: .3 });
    waterTower(380, -820, 1.0); waterTower(900, -860, .8);
    chimney(560, -700, 46, 120, t, 3); chimney(120, -760, 40, 90, t, 9);
    for (const [x, w, top] of FRONT) {
      cut(cutRect(x, top, w, 2600, x + 11), C.plum, { sh: 1, lift: .4 });
      cut(cutRect(x - 6, top, w + 12, 18, x + 12), C.gold, { sh: .5 });
      const cols = Math.max(1, Math.floor(w / 110));
      for (let r = 0; top + 90 + r * 260 < 1160; r++) for (let c = 0; c < cols; c++) {
        const wx = x + (c + .5) * w / cols - 34, wy = top + 90 + r * 260, lit = hash(x + r * 7 + c * 3) > .62;
        cut(archPath(wx, wy, 68, 130), lit ? C.goldPale : C.tealInk, { sh: .3, grain: .25 });
        if (lit) glow(wx + 34, wy + 70, 120, '250,215,140', .25);
        cut(rect(wx - 8, wy + 128, 84, 10), C.cream, { sh: .3, grain: .1, alpha: .85 });
      }
    }
  }
  // the Metro entrance: two Guimard lamps arching over a stair, a blank cream cartouche between them
  const LAMPS = [[150, 1, 23.0], [930, -1, 23.35]];
  const flick = (t, t0) => { // stutters on, then holds
    const d = t - t0; if (d < 0) return 0; if (d > 1.6) return 1;
    return [1, 0, 1, 1, 0, 1, 0, 1][Math.floor(d / .2)] ? .9 : .15;
  };
  // where the right lamp's bud glows (matches guimard(): the stem's end, plus the bud's offset)
  const H_LAMP = 760, BASE = 1660, BUD = { x: 930 - H_LAMP * .3, y: BASE - H_LAMP - GUIMARD_HAND_SC * .62 }; // the bud in the right iron hand
  function metro(t) {
    cut(cutRect(-60, 1640, W + 120, 400, 31), C.tealDeep, { sh: .6 });
    for (let i = 0; i < 5; i++) cut(ribbon(-40, W + 40, 1700 + i * 44, 8, i * 1.7 + t * .5, 6), C.teal, { sh: 0, grain: .2, alpha: .6 });
    // the stair mouth and its railings
    cut(poly([[300, 1660], [780, 1660], [700, 1900], [380, 1900]]), C.tealInk, { sh: .4 });
    for (let i = 0; i < 5; i++) cut(rect(330 - i * 0 + i * 8, 1700 + i * 40, 420 - i * 16, 8), C.tealDeep, { sh: 0, grain: 0 });
    for (const sx of [-1, 1]) {
      const x0 = 540 + sx * 250;
      cut(rect(x0 - 6, 1500, 12, 170), C.goldDeep, { sh: .5 });
      tendril(whipPts([x0, 1520], [x0 - sx * 80, 1540], [x0 - sx * 140, 1600], [x0 - sx * 200, 1560], 24, sx), 12, C.goldDeep);
    }
    cut(rect(290, 1500, 500, 12), C.goldDeep, { sh: .5 });
    for (const [x, dir, t0] of LAMPS) guimard(x, BASE, H_LAMP, dir, flick(t, t0), Math.sin(t * 1.2 + x) * 4, ss(t0 - .7, t0 + .3, t)); // iron hands open round the light
    // the cartouche, held between the stems (no lettering)
    cut(rrect(370, 1040, 340, 74, 30), C.cream, { sh: .9, lift: .3 });
    cut(rrect(384, 1052, 312, 50, 22), C.goldPale, { sh: 0, grain: .2, alpha: .6 });
    for (const sx of [-1, 1]) cut(circle(540 + sx * 190, 1077, 16), C.gold, { sh: .4 });
  }
  SHOT(START, 26.04, 'intro', (t, k, d) => {
    // the tilt: from the moon down the façades to the Metro, then a push into the right lamp's bud
    const cy0 = kf3(t, [[11.0, -1480], [12.5, -1450], [20.8, 1280], [25.3, 1300]]);
    const z0 = kf3(t, [[11.0, 1.0], [25.3, 1.06]]);
    const u = ei(clamp((t - 25.3) / .74));
    const z = z0 * Math.pow(9 / z0, u), cx = lerp(540, BUD.x, eio(clamp((t - 25.3) / .6))), cy = lerp(cy0, BUD.y, eio(clamp((t - 25.3) / .6)));
    g.save(); cam(cx, cy, z);
    sheet(C.tealInk);
    rays(540, -1560, 300, 1300, 28, t * .02, C.tealDeep);
    halo(540, -1560, 270, t * .04, 1, [C.goldDeep, C.creamDeep, C.teal, C.gold]);
    // cloud cards drifting across the moon
    for (let i = 0; i < 5; i++) {
      const x = ((hash(i * 3.3) * 1400 + t * (14 + i * 5)) % 1700) - 300, y = -2050 + i * 170;
      cut(cloud(x, y, 420 + hash(i) * 200, 120 + hash(i + 4) * 50, i), i % 2 ? C.plum : C.plumDeep, { sh: .7, lift: .3, alpha: .95 });
    }
    skyline(t);
    metro(t);
    g.restore();
    rain(t, 90, 31, .45, .12);
    sheet(C.goldPale, .75 * ss(25.6, 26.04, t)); // into the lamp's light (the tram opens out of its own lamp's light)
  });
})();

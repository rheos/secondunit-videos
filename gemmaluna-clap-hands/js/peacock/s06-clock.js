// 111.8-129.2 BRIDGE 1 + chorus 3's first clap: the clock tower. Opens on the clock face filling the frame (the
// avenue pushed into it). "shine, shine" (111.56, 113.12) the face lights; "running out of time" (115.4-119.6)
// the hands spin faster, the hour hand backwards; "salvation armies ... in the hole" (119.6-123.7) the band's
// drum, tambourine and tuba tumble off the ledge and fall into a dark round hole in the street far below; "go to
// heaven in a little rowboat" (123.74-127.5) the rowboat rises out of the hole, up past the clock. CLAPS[8]
// (127.967): the two clock hands, pointing hands, swing together and meet palm to palm at twelve. Then we rise
// with the boat: the night closes in and the clock face shrinks to the moon (chorus 3 opens on it).
(() => {
  const CK = { x: 540, y: 900, r: 420 }, LEDGE = 1440, HOLE = { x: 540, y: 3560 }, K = CLAPS[8];
  const BAND = [[-210, 'drum', 121.15, -1], [20, 'tam', 121.3, 1], [230, 'tuba', 121.45, 1]];
  const FALL_G = 868;
  function bandAt(t, [dx, kind, tf, sp]) {
    if (t < tf) { const wob = t > 120.3 ? Math.sin(t * 18 + dx) * .08 * ss(120.3, 120.8, t) : 0; return { x: CK.x + dx, y: LEDGE, a: wob, s: 1 }; }
    const τ = t - tf, y = LEDGE + .5 * FALL_G * τ * τ, s = 1 - ss(HOLE.y - 260, HOLE.y, y);
    return { x: lerp(CK.x + dx, HOLE.x + dx * .15, ss(LEDGE, HOLE.y, y)), y: Math.min(y, HOLE.y), a: sp * τ * 2.6, s };
  }
  const boatY = (t) => lerp(HOLE.y + 260, CK.y - 660, eio(clamp((t - 123.95) / 3.4)));
  // the clock hands as a clapping pair: the minute hand from the left, the hour hand from the right
  function clockClap(t, len, sc) {
    const lt = t - K;
    const d = lt < 0 ? Math.pow(clamp(-lt / .42), .6) : eo(clamp((lt - .06) / .45));
    const spread = .6 * d;
    if (d > .14) { clockHand(CK.x, CK.y, -spread, len, sc); clockHand(CK.x, CK.y, spread, len, sc); return; }
    const op = lt < 0 ? 0 : .12 * eo(clamp(lt / .1));
    for (const dir of [-1, 1]) {
      g.save(); g.translate(CK.x, CK.y); g.rotate(dir * spread);
      cut(rect(-8, -len + sc * .3, 16, len - sc * .3), C.goldDeep, { sh: .6, lift: .3 });
      profileHand(dir * .17 * sc * 1.4, -len + sc * .3, sc * 1.4, dir, op);
      g.restore();
    }
  }
  SHOT(111.8, 129.2, 'clock', (t, k, d) => {
    // camera
    let cy = kf3(t, [[111.8, 900], [113.0, 1000], [119.6, 1000], [120.6, 1520], [121.3, 1520], [123.1, 3380], [124.2, 3380], [127.0, 900]]);
    let z = kf3(t, [[111.8, 1.286], [113.0, 1.0], [115.4, 1.0], [119.4, 1.12], [120.6, 1.2], [121.3, 1.2], [123.1, 1.0], [127.0, 1.0], [127.9, 1.08]]);
    // a punch onto twelve as the hands meet (K-.35 to K+.35), released into the rise
    const pk = eio(clamp((t - (K - .35)) / .3)) * (1 - eio(clamp((t - (K + .35)) / .4)));
    z = lerp(z, 1.75, pk); cy = lerp(cy, CK.y - CK.r * .55, pk);
    const rise = eio(clamp((t - 128.3) / .9));
    if (t > 128.3) { z = lerp(1.08, .35, rise); cy = 900; }
    g.save(); cam(540, cy, z);
    sheet(C.tealInk);
    // the tower: plum stone, gold bands, arched windows, down to the street and its hole
    cut(cutRect(40, 300, 1000, 3400, 401), C.plum, { sh: .8 });
    cut(poly([[40, 300], [540, -300], [1040, 300]]), C.plumDeep, { sh: .8 });
    // mosaic friezes instead of plain bands; lilies climbing both sides of the tower
    for (const y of [380, 1380, 2100, 2800]) { cut(rect(40, y, 1000, 30), C.plumDeep, { sh: .4 }); for (let i = 0; i < 40; i++) { g.fillStyle = [C.gold, C.teal, C.goldPale, C.plumLight][(i + y) % 4]; g.fillRect(48 + i * 25, y + 7, 16, 16); } }
    for (let r = 0; r < 3; r++) for (const x of [180, 820]) { const wy = 1700 + r * 620; cut(archPath(x - 70, wy, 140, 300), (r + x) % 3 ? C.tealInk : C.goldPale, { sh: .3 }); archFrame(x - 70, wy, 140, 300, 12, C.goldDeep); }
    for (const sx of [-1, 1]) {
      const stem = []; for (let i = 0; i <= 30; i++) { const u = i / 30; stem.push([540 + sx * (470 - 16 * Math.sin(u * 14)), 3500 - u * 2900]); }
      tendril(stem, 12, C.tealDeep, { sh: .3 });
      for (let i = 3; i < 30; i += 4) { const [lx, ly] = stem[i]; lily(lx - sx * 20, ly, -Math.PI / 2 - sx * .5, 70, .8, [C.cream, C.goldPale]); }
    }
    // Guimard whiplash brackets holding the clock face
    for (const sx of [-1, 1]) { tendril(whipPts([540 + sx * 480, 1440], [540 + sx * 560, 1100], [540 + sx * 520, 700], [540 + sx * 380, 470], 60, -sx), 40, C.tealDeep, { sh: .8, lift: .3 }); tendril(whipPts([540 + sx * 474, 1440], [540 + sx * 552, 1100], [540 + sx * 512, 700], [540 + sx * 372, 470], 56, -sx), 10, C.gold, { sh: 0, grain: 0 }); }
    // the street: cream cobbles, a flat clock set into them round the hole (narrower than the tower)
    cut(cutRect(-200, 3590, 1480, 700, 402), C.creamDeep, { sh: .6 });
    for (let r = 0; r < 6; r++) for (let c = 0; c < 18; c++) cut(ellipse(-160 + c * 90 + (r % 2) * 45, 3620 + r * 34 + r * r * 4, 38 + r * 3, 12 + r), C.cream, { sh: 0, grain: .2, alpha: .7 });
    // Mark Von Ulrich (guest director): the hole is the centre of a clock face set in the street; time swallows
    // the band, and the rowboat rises out of time's own centre
    cut(ellipse(HOLE.x, HOLE.y + 30, 400, 118), C.gold, { sh: .6 });
    cut(ellipse(HOLE.x, HOLE.y + 30, 374, 106), C.cream, { sh: .2 });
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, px = HOLE.x + Math.cos(a) * 330, py = HOLE.y + 30 + Math.sin(a) * 92; cut(ellipse(px, py, i % 3 ? 14 : 26, i % 3 ? 6 : 10), C.plumDeep, { sh: .1, grain: 0 }); }
    for (const [a, L] of [[-.55, 300], [1.0, 210]]) { g.save(); g.translate(HOLE.x, HOLE.y + 30); g.scale(1, .28); g.rotate(a); g.translate(0, -L * .55); manicule(L * .35); g.restore(); g.save(); g.translate(HOLE.x, HOLE.y + 30); g.scale(1, .28); g.rotate(a); cut(rect(-8, -L * .5, 16, L * .5), C.goldDeep, { sh: .2 }); g.restore(); }
    cut(ellipse(HOLE.x, HOLE.y + 30, 176, 52), C.gold, { sh: .7 });
    cut(ellipse(HOLE.x, HOLE.y + 30, 156, 42), C.plumDeep, { sh: 0 });
    cut(ellipse(HOLE.x, HOLE.y + 22, 150, 30), '#1c0d1b', { sh: 0, grain: 0 });
    // the ledge and the band's instruments on it, then falling
    cut(cutRect(80, LEDGE, 920, 40, 404), C.gold, { sh: 1, lift: .4 });
    for (const B of BAND) {
      const p = bandAt(t, B); if (p.s <= .01) continue;
      g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.scale(p.s, p.s);
      if (B[1] === 'drum') { g.translate(0, -90); bassDrum(.8); } else if (B[1] === 'tam') { g.translate(0, -60); tambourine(.8); } else { g.translate(0, -40); tuba(.75); }
      g.restore();
    }
    // the clock
    const shine = Math.max(t < 113.12 ? 1 - ss(111.8, 112.9, t) * .6 : 0, t >= 113.12 ? Math.exp(-1.6 * (t - 113.12)) : 0) * .9 + .25;
    clockFace(CK.x, CK.y, CK.r, t, shine + .4 * (t > K ? Math.exp(-3 * (t - K)) : 0));
    const hl = lerp(.45, .62, ss(126.3, 127.0, t)) * CK.r, sc = CK.r * .16;
    if (t < K - 1.0) { const A = clockAngles(t); clockHand(CK.x, CK.y, A.h, hl, sc); clockHand(CK.x, CK.y, A.m, CK.r * .62, sc); }
    else clockClap(t, CK.r * .62, sc);
    cut(circle(CK.x, CK.y, 24), C.gold, { sh: .5 });
    clapRings(t, CK.x, CK.y - CK.r * .62, K, .9);
    // the rowboat rising out of the hole, past the clock, rowing on the beats
    if (t > 123.95) {
      const by = boatY(t);
      g.save(); if (by > HOLE.y - 300) { g.beginPath(); g.rect(-400, -6000, 2000, HOLE.y + 30 + 6000); g.clip(); }
      rowboat(CK.x + Math.sin(t * .8) * 30 * ss(124.6, 125.4, t), by, .9, t * TAU / 1.03, 1); g.restore();
      if (by > HOLE.y - 300) { const near = new Path2D(); near.ellipse(HOLE.x, HOLE.y + 30, 176, 52, 0, 0, Math.PI); near.ellipse(HOLE.x, HOLE.y + 30, 156, 42, 0, Math.PI, 0, true); cut(near, C.gold, { sh: .4 }); }
    }
    g.restore();
    rain(t, 30, 71, .25 * (1 - rise), .1);
    // the night closes in round the clock as we rise; the face stays bright (it becomes the moon)
    if (rise > 0) {
      sheet(C.tealInk, .9 * rise);
      g.save(); cam(540, 900, z);
      clockFace(CK.x, CK.y, CK.r, t, .3);
      clockClap(t, CK.r * .62, sc);
      cut(circle(CK.x, CK.y, 24), C.gold, { sh: .5 });
      rowboat(CK.x + Math.sin(t * .8) * 30, boatY(t), .9, t * TAU / 1.03, 1);
      g.restore();
    }
    sheet(C.goldPale, .3 * (1 - ss(111.8, 112.0, t)));
  });
})();

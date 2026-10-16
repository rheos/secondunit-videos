// 111.8-129.2 BRIDGE 1 + chorus 3's first clap: the clock tower, cold in the moonlight. Opens on the clock face
// (the avenue pushed into it). "shine, shine" (111.56, 113.12) the bezel's zodiac roundels light in two sweeps of
// six, throwing moonlight quills; "running out of time" (115.4-119.3) the hands spin faster and faster, the hour hand
// backwards; on "time" (119.3) the clock's driving weight drops from above and slams onto the end of the band's
// see-saw ledge: the hands stop dead and the drum, tambourine and tuba are catapulted up past the stopped clock, then
// fall all the way down into the hole at the centre of a clock set in the street, on "hole" (123.4); the hands hang
// at twenty past eight; "go to heaven
// in a little rowboat" (123.74-127.5) the rowboat rises out of the hole, up past the clock and away. The stopped
// hands wake only for CLAPS[8] (127.967): the two pointing hands swing up and meet palm to palm at twelve. Then the
// night closes in and the clock face shrinks to the moon (chorus 3 opens on it).
// Draft 4 (AUDIT-d3: critic C, the film critic, Gilliam 7A): no pale full-frame wash on the first "shine"; cold teal
// moonlit stone instead of warm plum; the disc drifts to the upper-left third between claps with moves on the beats;
// no chequer bands (lily-stem friezes with zodiac medallions); iron lily stems frame the tower and curl over the dial;
// the street clock is a teal dial on plum cobbles; the instruments drop INTO the hole; a punch-in on "hole"; the
// boat reads (moonlit, rimmed) and is out of the twelve-clap's frame; the twelve clap is bigger.
// CLOCKTOWER.far(t) draws the same tower for the avenue's last pan (s05), so the cut at 111.8 changes nothing.
const CLOCKTOWER = (() => {
  const CK = { x: 540, y: 900, r: 420 }, LEDGE = 1440, PIV = 790, HOLE = { x: 540, y: 3590 }, K = CLAPS[8], TIME = 119.30;
  const SHINE = [111.56, 113.12];
  // how many bezel roundels are lit (two sweeps of six; they go out in a sweep as the clock becomes the moon)
  const litN = (t) => (6 * eo(clamp((t - SHINE[0]) / .4)) + 6 * eo(clamp((t - SHINE[1]) / .4))) * (1 - ss(128.35, 129.05, t));
  // the dial's own light: brightens from inside on each "shine", a little on the clap
  const lightAt = (t) => (t < SHINE[0] ? 0 : .3 + .38 * Math.exp(-2.2 * (t - SHINE[0]))) + (t < SHINE[1] ? 0 : .38 * Math.exp(-2.2 * (t - SHINE[1]))) + (t > K ? .3 * Math.exp(-3 * (t - K)) : 0);
  // the bezel counter-rotates while the hands spin, and stops with them (passed to clockFace as its time)
  const spinU = (t) => Math.pow(clamp((t - 115.4) / (TIME - 115.4)), 1.7);
  const bezelT = (t) => t - 45 * spinU(t);

  // ---------------- the tower ----------------
  function stars(t) { for (let i = 0; i < 26; i++) { const x = hash(i * 4.1) > .5 ? 1080 + hash(i * 2.2) * 900 : -60 - hash(i * 2.2) * 900, y = -600 + hash(i * 7.7) * 2400; g.save(); g.globalAlpha *= .5 + .4 * Math.sin(t * 2 + i); g.fillStyle = C.goldPale; g.fill(star4(x, y, 6 + hash(i) * 8)); g.restore(); } }
  function roof() {
    cut(poly([[20, 312], [540, -340], [1060, 312]]), C.plumDeep, { sh: .8, lift: .3 });
    for (const sx of [-1, 1]) for (let i = 1; i < 6; i++) { // iron cresting along the roof's edges: small whiplash curls
      const u = i / 6, bx = lerp(540 + sx * 520, 540, u), by = lerp(312, -340, u);
      tendril(whipPts([bx, by], [bx + sx * 20, by - 40], [bx + sx * 50, by - 50], [bx + sx * 56, by - 30], 10, sx), 7, C.gold, { sh: .3, grain: 0 });
    }
    cut(rect(536, -470, 8, 140), C.gold, { sh: .4, grain: 0 }); lily(540, -470, -Math.PI / 2, 60, .55, [C.gold, C.goldPale]);
    cut(rect(20, 296, 1040, 18), C.gold, { sh: .5, grain: 0 });
  }
  // a frieze: a band with a lily stem running through it and zodiac medallions (no chequer)
  function frieze(y, n0) {
    cut(rect(40, y, 1000, 48), C.tealDeep, { sh: .4, grain: .15 });
    g.fillStyle = C.gold; g.fillRect(40, y, 1000, 6); g.fillRect(40, y + 42, 1000, 6);
    const pts = []; for (let i = 0; i <= 50; i++) { const x = 40 + i * 20; pts.push([x, y + 24 + Math.sin(i * .63) * 11]); }
    tendril(pts, 5, C.goldDeep, { sh: 0, grain: 0 });
    for (let i = 2; i < 50; i += 5) { const [bx, by] = pts[i], up = (i % 10 < 5) ? -1 : 1; g.save(); g.translate(bx, by); g.rotate(up < 0 ? -.4 : Math.PI + .4); cut(blob([[-5, 0], [-6, -12], [0, -19], [6, -12], [5, 0]], .6), C.cream, { sh: .2, grain: 0 }); g.restore(); }
    for (let i = 0; i < 4; i++) { const mx = 165 + i * 250; cut(circle(mx, y + 24, 30), C.gold, { sh: .4, grain: 0 }); cut(circle(mx, y + 24, 22), C.tealInk, { sh: 0, grain: 0 }); zodiacGlyph(n0 + i, mx, y + 24, 13, C.goldPale, .18); }
  }
  function windows() {
    for (let r = 0; r < 3; r++) for (const x of [180, 820]) {
      const wy = 1720 + r * 620, lit = (r + x) % 3 === 0, w = archPath(x - 70, wy, 140, 300);
      cut(w, lit ? C.tealLight : C.tealInk, { sh: .3, grain: .2 });
      g.save(); g.clip(w); g.globalAlpha *= lit ? .7 : .4; g.strokeStyle = C.cream; g.lineWidth = 6; g.beginPath(); g.moveTo(x - 60, wy + 220); g.lineTo(x + 30, wy + 60); g.stroke(); g.restore();
      archFrame(x - 70, wy, 140, 300, 12, C.goldDeep, { grain: 0 });
    }
  }
  // two cast-iron lily stems: up both sides of the tower from the street, curling in over the dial's shoulders,
  // each ending in a lily lamp that lights cold with the roundels
  const STEMS = [-1, 1].map((sx) => {
    const p = []; for (let i = 0; i <= 40; i++) { const u = i / 40; p.push([540 + sx * (470 - 14 * Math.sin(u * 13)), 3580 - u * 2820]); }
    const top = whipPts([540 + sx * 470, 760], [540 + sx * 486, 520], [540 + sx * 400, 404], [540 + sx * 262, 436], 30, sx, 24);
    return { sx, pts: p.concat(top.slice(1)) };
  });
  function ironStems(t, lit) {
    for (const { sx, pts } of STEMS) {
      tendril(pts, 30, C.goldDeep, { sh: .7, lift: .3, grain: .15 });
      tendril(pts.map(([x, y]) => [x - sx * 7, y]), 7, C.goldPale, { sh: 0, grain: 0 });
      for (let i = 4; i < 40; i += 6) { const [lx, ly] = pts[i]; g.save(); g.translate(lx, ly); g.rotate(sx * (i % 12 < 6 ? .9 : 2.2)); cut(blob([[0, 0], [-12, -50], [0, -96], [12, -50]], .6), C.goldDeep, { sh: .4, grain: 0 }); g.save(); g.strokeStyle = C.gold; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -6); g.lineTo(0, -84); g.stroke(); g.restore(); g.restore(); }
      for (const i of [9, 21, 33]) { const [lx, ly] = pts[i]; lily(lx - sx * 16, ly, -Math.PI / 2 - sx * .55, 64, .75, [C.cream, C.goldPale]); }
      const [ex, ey] = pts[pts.length - 1];
      if (lit > 0) glow(ex, ey + 40, 200, '215,240,230', .35 * lit);
      lily(ex, ey + 6, Math.PI / 2 + sx * .3, 78, .35 + .4 * lit, lit > .3 ? [C.cream, C.white] : [C.creamDeep, C.cream]);
    }
  }
  function body(t, far) {
    cut(cutRect(40, 300, 1000, 3300, 401), C.teal, { sh: .8 });
    g.save(); g.globalAlpha *= .8; g.fillStyle = C.tealLight; g.fillRect(40, 300, 26, 3300); g.globalAlpha /= .8; g.globalAlpha *= .45; g.fillStyle = C.tealDeep; g.fillRect(990, 300, 50, 3300); g.restore();
    glow(-200, 300, 1700, '200,235,225', .14); // moonlight from the upper left
    roof();
    frieze(330, 0); frieze(2120, 4); frieze(2800, 8);
    windows();
  }

  // ---------------- the clock ----------------
  // the shine: each roundel lights with a cold glint that flares and settles, and a ring of moonlight flares
  // round the bezel on each "shine" (draft 3's pale full-frame wash is gone). Drawn over the face.
  function glints(t, lit) {
    const fl = (s0) => t > s0 ? Math.exp(-1.7 * (t - s0)) : 0, ring = .55 * (fl(SHINE[0]) + fl(SHINE[1]));
    if (ring > .02) { g.save(); g.globalAlpha *= Math.min(.4, ring); g.strokeStyle = C.cream; g.lineWidth = 12; g.beginPath(); g.arc(CK.x, CK.y, CK.r * 1.07, 0, TAU); g.stroke(); g.lineWidth = 5; g.beginPath(); g.arc(CK.x, CK.y, CK.r * 1.14, 0, TAU); g.stroke(); g.restore(); }
    const rot = bezelT(t) * .02, rm = CK.r * .81, bw = CK.r * .18;
    for (let i = 0; i < 12; i++) {
      const l = clamp(lit - i); if (l <= 0) continue;
      const f = fl((i < 6 ? SHINE[0] : SHINE[1]) + (i % 6) * .066), a = rot + TAU * i / 12 - Math.PI / 2, x = CK.x + Math.cos(a) * rm, y = CK.y + Math.sin(a) * rm;
      const r = bw * 1.2 * f; if (r < 3) continue;
      g.save(); g.globalAlpha *= l * .95; g.fillStyle = C.white; g.fill(star4(x, y, r)); g.restore();
    }
  }
  function hands(t) {
    const sc = CK.r * .16;
    if (t < K - .42) {
      const A = clockAngles(t), hl = lerp(.45, .62, ss(126.7, 127.5, t)) * CK.r;
      clockHand(CK.x, CK.y, A.h, hl, sc); clockHand(CK.x, CK.y, A.m, CK.r * .62, sc);
    } else clockClap(t, CK.r * .62, sc);
    cut(circle(CK.x, CK.y, 24), C.gold, { sh: .5 });
  }
  // the clock hands as a clapping pair: the hour hand from the left, the minute hand from the right. Draft 4: the
  // pointing hands grow as they rise to twelve and the palms meet bigger (critic C: enlarge only)
  function clockClap(t, len, sc) {
    const lt = t - K;
    const d = lt < 0 ? Math.pow(clamp(-lt / .42), .6) : eo(clamp((lt - .06) / .45));
    const spread = .6 * d, grow = lt < 0 ? ss(K - .42, K, t) : 1 - ss(K + .1, K + .9, t);
    if (d > .14) { const s2 = sc * (1 + .3 * grow); clockHand(CK.x, CK.y, -spread, len, s2); clockHand(CK.x, CK.y, spread, len, s2); return; }
    const op = lt < 0 ? 0 : .12 * eo(clamp(lt / .1)), hs = sc * 1.8;
    for (const dir of [-1, 1]) {
      g.save(); g.translate(CK.x, CK.y); g.rotate(dir * spread);
      cut(rect(-8, -len + sc * .3, 16, len - sc * .3), C.goldDeep, { sh: .6, lift: .3 });
      profileHand(dir * .17 * hs, -len + sc * .3, hs, dir, op);
      g.restore();
    }
  }
  const PALMS_Y = CK.y - CK.r * .62 + CK.r * .16 * .3 - 1.88 * CK.r * .16 * 1.8 * .5; // the middle of the meeting palms
  function clock(t, far) {
    const lit = litN(t);
    clockFace(CK.x, CK.y, CK.r, bezelT(t), lightAt(t), 1, lit, 1.3);
    glints(t, lit);
    hands(t);
    return lit;
  }

  // ---------------- the band's see-saw ledge and the clock's weight ----------------
  // the ledge pivots at PIV; the weight lands on its right end on "time" and the left arm whips up
  const beamA = (t) => { const τ = t - TIME; return τ <= 0 ? 0 : .17 * (1 - Math.exp(-30 * τ)) + .08 * Math.sin(14 * τ) * Math.exp(-4 * τ); };
  const beamPt = (t, rx, ry = 0) => { const a = beamA(t), c = Math.cos(a), s = Math.sin(a); return [PIV + rx * c - ry * s, LEDGE + 18 + rx * s + ry * c]; };
  // the band: [kind, rest x relative to the pivot, arrival in the hole, time to the top of the arc, landing offset, spin]
  const BAND = [['drum', -520, 123.05, 1.0, -14, -1], ['tam', -330, 123.22, 1.1, 12, 1], ['tuba', -150, 123.42, 1.15, 0, 1]].map(([kind, rx, t1, tp, dx, sp]) => {
    const t0 = TIME + .03, T = t1 - t0, y0 = LEDGE, x0 = PIV + rx, G = (HOLE.y - y0) / (T * (T / 2 - tp));
    return { kind, rx, t0, t1, T, x0, y0, x1: HOLE.x + dx, G, vy: -G * tp, sp };
  });
  function bandAt(t, B) {
    if (t < B.t0) {
      const shake = ss(117.6, 119.2, t), [x, y] = beamPt(t, B.rx, -18);
      return { x, y: y - Math.abs(Math.sin(t * 19 + B.rx)) * 10 * shake, a: Math.sin(t * 23 + B.rx) * .07 * shake + beamA(t), s: 1, air: 0 };
    }
    // a ballistic arc up past the clock and down to the hole; there it sinks in over a few frames (the hole swallows)
    const τ = t - B.t0, y = τ < B.T ? B.y0 + B.vy * τ + .5 * B.G * τ * τ : HOLE.y + 240 * eo((τ - B.T) / .4), x = τ < B.T ? lerp(B.x0, B.x1, τ / B.T) : B.x1;
    const s = lerp(1, .52, ss(2100, HOLE.y, Math.min(y, HOLE.y))) * (1 - .25 * ss(HOLE.y, HOLE.y + 200, y));
    return { x, y, a: B.sp * τ * 2.3 * (1 - .7 * ss(B.t1 - .5, B.t1, t)), s, air: 1 };
  }
  // drawn standing on (x, y), turning about its own middle
  function drawInstrument(kind, p) {
    const off = kind === 'drum' ? 72 : kind === 'tam' ? 60 : 70;
    g.save(); g.translate(p.x, p.y - off * p.s); g.scale(p.s, p.s); g.rotate(p.a);
    if (kind === 'drum') bassDrum(.8); else if (kind === 'tam') tambourine(.8); else { g.translate(0, -29); tuba(.75); }
    g.restore();
  }
  function ledge(t) {
    // the bracket: Guimard iron springing from the wall up to the pivot
    for (const sx of [-1, 1]) tendril(whipPts([PIV + sx * 90, LEDGE + 260], [PIV + sx * 70, LEDGE + 120], [PIV + sx * 10, LEDGE + 90], [PIV, LEDGE + 30], 0), 18, C.goldDeep, { sh: .6, grain: 0 });
    tendril(whipPts([PIV - 120, LEDGE + 300], [PIV - 160, LEDGE + 200], [PIV - 230, LEDGE + 170], [PIV - 250, LEDGE + 210], 24, -1), 12, C.goldDeep, { sh: .4, grain: 0 });
    g.save(); g.translate(PIV, LEDGE + 18); g.rotate(beamA(t));
    cut(cutRect(-700, -18, 910, 38, 404), C.gold, { sh: 1, lift: .4 });
    g.fillStyle = C.goldPale; g.fillRect(-700, -18, 910, 6);
    for (let i = 0; i < 9; i++) cut(circle(-660 + i * 104, 2, 6), C.goldDeep, { sh: 0, grain: 0 });
    g.restore();
    cut(circle(PIV, LEDGE + 18, 22), C.goldDeep, { sh: .6, grain: 0 }); cut(circle(PIV, LEDGE + 18, 9), C.goldPale, { sh: 0, grain: 0 });
  }
  // the clock's driving weight: a gold cast-iron cylinder with a lily finial on its chain
  function weight(t) {
    const fall = .45, t0 = TIME - fall; if (t < t0) return;
    let x, y, a = 0;
    if (t < TIME) { const u = (t - t0) / fall; x = PIV + 160; y = LEDGE - 1800 * (1 - u * u); }
    else { [x, y] = beamPt(t, 160, -18); a = beamA(t); }
    // speed streaks while it falls
    if (t < TIME + .05) { g.save(); g.globalAlpha *= .5; g.fillStyle = C.cream; for (const sx of [-46, -10, 30]) g.fillRect(x + sx, y - 900, 6, 560); g.restore(); }
    g.save(); g.translate(x, y); g.rotate(a);
    const sway = t > TIME ? Math.sin((t - TIME) * 6) * 30 * Math.exp(-1.5 * (t - TIME)) : 0;
    g.fillStyle = C.goldDeep; for (let i = 0; i < 70; i++) { const yy = -312 - i * 26, xx = sway * (i / 70) * Math.sin(i * .2); if (i % 2) g.fillRect(xx - 3, yy - 13, 6, 26); else { g.save(); g.lineWidth = 5; g.strokeStyle = C.goldDeep; g.beginPath(); g.ellipse(xx, yy, 9, 15, 0, 0, TAU); g.stroke(); g.restore(); } }
    cut(ringLace(0, -296, 10, 20), C.gold, { sh: .4, rule: 'evenodd', grain: 0 });
    lily(0, -262, -Math.PI / 2, 46, .5, [C.gold, C.goldPale]);
    const body = rrect(-72, -270, 144, 270, 26);
    cut(body, C.goldDeep, { sh: 1.1, lift: .6 });
    g.save(); g.clip(body); g.fillStyle = C.gold; g.fillRect(-60, -270, 26, 270); g.fillRect(-80, -246, 160, 16); g.fillRect(-80, -40, 160, 16); g.restore();
    tendril(whipPts([0, -60], [-30, -110], [26, -170], [-6, -210], 14, 1), 8, C.goldPale, { sh: 0, grain: 0 });
    g.restore();
  }
  // cut-paper dust puffs off the slam
  function dust(t) {
    const τ = t - TIME; if (τ < 0 || τ > 1.2) return; const u = τ / 1.2;
    for (let i = 0; i < 7; i++) { const a = -Math.PI * (.1 + .8 * i / 6), d = 40 + 220 * eo(u), [x, y] = beamPt(TIME + .3, 160, -10);
      g.save(); g.globalAlpha *= (1 - u) * .85; cut(cloud(x + Math.cos(a) * d, y + Math.sin(a) * d * .5, 70 + 50 * u, 40 + 30 * u, i + 80), i % 2 ? C.cream : C.creamDeep, { sh: .3, grain: 0 }); g.restore(); }
  }

  // ---------------- the street, its clock and the hole ----------------
  const HC = HOLE.y; // the hole's centre
  function street(t) {
    cut(cutRect(-200, HC - 40, 1480, 800, 402), C.plumDeep, { sh: .6 });
    { let y = HC - 30; for (let r = 0; r < 12; r++) { const h = 14 + r * 3.2, w = 52 + r * 6; for (let c = -1; c * w < 1500; c++) { g.fillStyle = (r + c) % 3 ? C.plum : C.plumLight; g.globalAlpha = .8; g.beginPath(); g.roundRect(-200 + c * w + (r % 2) * w / 2 + 3, y + 2, w - 6, h - 4, h * .35); g.fill(); } y += h; } g.globalAlpha = 1; }
    // the street clock: a teal dial set flat in the cobbles, twelve gold marks, two pointing hands stopped at
    // twenty past eight like the tower's, the hole at its centre (Mark: time swallows the band)
    cut(ellipse(HOLE.x, HC, 340, 104), C.goldDeep, { sh: .7 });
    cut(ellipse(HOLE.x, HC, 322, 96), C.teal, { sh: .2 });
    g.save(); g.strokeStyle = C.gold; g.lineWidth = 4; g.beginPath(); g.ellipse(HOLE.x, HC, 296, 86, 0, 0, TAU); g.stroke(); g.restore();
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU - Math.PI / 2, px = HOLE.x + Math.cos(a) * 262, py = HC + Math.sin(a) * 76;
      if (i % 3 === 0) { g.save(); g.translate(px, py); g.scale(1, .32); cut(flowerPath(0, 0, 30, 5, a), C.goldPale, { sh: .2, grain: 0 }); g.restore(); } else cut(ellipse(px, py, 11, 4.5), C.gold, { sh: .1, grain: 0 }); }
    for (const [a, L] of [[-2.09, 200], [2.09, 250]]) { g.save(); g.translate(HOLE.x, HC); g.scale(1, .3); g.rotate(a); cut(rect(-10, -L * .66, 20, L * .5), C.gold, { sh: .2, grain: 0 }); g.translate(0, -L * .62); manicule(L * .34, SKIN.cream, C.gold); g.restore(); }
    cut(ellipse(HOLE.x, HC, 152, 46), C.gold, { sh: .6 });
    cut(ellipse(HOLE.x, HC, 134, 38), '#1c0d1b', { sh: 0, grain: 0 });
    cut(ellipse(HOLE.x, HC - 8, 132, 28), C.plumDeep, { sh: 0, grain: 0, alpha: .7 });
    cut(ellipse(HOLE.x, HC + 4, 124, 30), '#1c0d1b', { sh: 0, grain: 0 });
  }
  // things going down into (or up out of) the hole: shown above the street's line, or inside the hole's mouth
  function holeClip() { const p = new Path2D(); p.rect(-600, -9000, 2400, HC + 9000); p.ellipse(HOLE.x, HC, 134, 38, 0, 0, TAU); g.clip(p); }
  function nearLip() { const near = new Path2D(); near.ellipse(HOLE.x, HC, 152, 46, 0, 0, Math.PI); near.ellipse(HOLE.x, HC, 134, 38, 0, Math.PI, 0, true); cut(near, C.gold, { sh: .4, grain: 0 }); }
  // the ripple ring when something goes under
  function gulp(t, t1, k = 1) { const d = t - t1; if (d < 0 || d > .9) return; const u = d / .9; g.save(); g.globalAlpha *= (1 - u) * .8 * k; g.strokeStyle = C.goldPale; g.lineWidth = 6 * (1 - u) + 2; g.setLineDash([16, 12]); g.beginPath(); g.ellipse(HOLE.x, HC, 150 + 150 * eo(u), 45 + 45 * eo(u), 0, 0, TAU); g.stroke(); g.restore(); }

  // ---------------- the rowboat rising out of the hole ----------------
  const boatAt = (t) => {
    if (t < 127.4) { const u = ss(123.95, 127.4, t); const y = lerp(HC + 150, -180, u); return { x: CK.x + Math.sin(t * .8) * 30 * ss(124.6, 125.4, t), y, s: lerp(.5, .9, ss(HC - 60, 2300, y)) }; }
    const u = eio(clamp((t - 128.3) / .9)); return { x: CK.x + Math.sin(t * .8) * 30, y: lerp(-180, 240, u), s: .9 };
  };
  function boat(t) {
    if (t < 123.95) return;
    const b = boatAt(t);
    glow(b.x, b.y - 60, 380 * b.s, '205,238,228', .32);
    g.save(); if (b.y > HC - 320) holeClip();
    rowboat(b.x, b.y, b.s, t * TAU / 1.03, 1); g.restore();
    if (b.y > HC - 320) nearLip();
  }

  // ---------------- the camera ----------------
  const logZ = (a, b, k) => Math.exp(lerp(Math.log(a), Math.log(b), k));
  // a monotone cubic through keys [[t, v], ...], flat at both ends (kf3 eases every segment, which lurches)
  function mspline(t, K) {
    const n = K.length; if (t <= K[0][0]) return K[0][1]; if (t >= K[n - 1][0]) return K[n - 1][1];
    const d = []; for (let i = 0; i < n - 1; i++) d.push((K[i + 1][1] - K[i][1]) / (K[i + 1][0] - K[i][0]));
    const m = [0]; for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : 2 / (1 / d[i - 1] + 1 / d[i])); m.push(0);
    let i = 0; while (t > K[i + 1][0]) i++;
    const h = K[i + 1][0] - K[i][0], s = (t - K[i][0]) / h, s2 = s * s, s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * K[i][1] + (s3 - 2 * s2 + s) * h * m[i] + (3 * s2 - 2 * s3) * K[i + 1][1] + (s3 - s2) * h * m[i + 1];
  }
  function camAt(t) {
    let cx, cy, z;
    if (t < 113.0) { const u = eio(clamp((t - 111.8) / 1.2)); cx = lerp(540, 700, u); cy = lerp(900, 1130, u); z = logZ(1.2857, .82, u); }
    else if (t < 115.4) { const u = clamp((t - 113.0) / 2.4); cx = lerp(700, 712, u); cy = lerp(1130, 1118, u); z = lerp(.82, .84, u); }
    else if (t < TIME) { const u = eio(clamp((t - 115.4) / (TIME - 115.4))); cx = lerp(712, 650, u); cy = lerp(1118, 1110, u); z = lerp(.84 * 1.048, .97, u); }
    else { cx = 650; cy = 1110; z = .97; }
    // a creep in on each beat while the clock ticks ("the rules are well done"), a pulse on the second "shine"
    if (t >= 113.0 && t < 115.4) { let n = 0; for (const b of [113.63, 114.17, 114.67, 115.17]) n += eo(clamp((t - b) / .12)); z *= 1 + .012 * n; }
    z *= 1 + .03 * bump(t, SHINE[1], .5);
    if (t >= TIME) {
      // after the slam: back to the whole clock as the band flies up past it, then down the tower after them
      const u = eio(clamp((t - (TIME + .1)) / 1.1));
      cx = lerp(650, 540, u); z = lerp(.97, .86, u);
      cy = t < 120.45 ? lerp(1110, 1040, eio(clamp((t - TIME - .1) / (120.45 - TIME - .1)))) : mspline(t, [[120.45, 1040], [121.4, 1400], [122.0, 1950], [122.5, 2700], [123.05, 3430]]);
      // the punch on "hole", the tuba going under, then up with the rising boat
      z = lerp(z, 1.0, ss(122.4, 123.05, t));
      const ph = eio(clamp((t - 123.05) / .35)) * (1 - eio(clamp((t - 123.95) / .55)));
      z = lerp(z, 1.45, ph); cy = lerp(cy, HC - 40, ph);
      if (t > 123.9) { const b = boatAt(Math.min(t, 127.0)); cy = lerp(cy, clamp(b.y + 260, 900, HC - 40), ss(123.9, 124.5, t)); }
      if (t > 126.8) { cy = lerp(cy, 900, ss(126.8, 127.3, t)); z = lerp(z, 1.06, ss(126.9, 127.55, t)); }
      // the twelve clap: punch onto the palms (upper third), hold, then ease out to the moon
      const pk = eio(clamp((t - 127.6) / .27));
      z = logZ(z, 1.75, pk); cy = lerp(cy, PALMS_Y + 320 / 1.75, pk);
      if (t > 128.32) { const v = ss(128.32, 129.2, t); z = logZ(1.75, .35, v); cy = lerp(PALMS_Y + 320 / 1.75, 900, v); cx = 540; }
    }
    // the slam shakes the frame
    let sy = 0; if (t > TIME && t < TIME + .6) { const τ = t - TIME; sy = 16 * Math.sin(τ * 55) * Math.exp(-8 * τ); z *= 1 + .035 * Math.exp(-6 * τ) * (1 - Math.exp(-40 * τ)); }
    return { cx, cy: cy + sy, z };
  }

  SHOT(111.8, 129.2, 'clock', (t, k, d) => {
    const { cx, cy, z } = camAt(t);
    const rise = eio(clamp((t - 128.3) / .9));
    g.save(); cam(cx, cy, z);
    sheet(C.tealInk); stars(t);
    body(t, 0);
    ironStems(t, clamp(litN(t) / 12));
    if (rise <= 0) clock(t, 0); // once the night closes in, the clock and boat are drawn once, over it (below)
    ledge(t);
    for (const B of BAND) if (t < B.t0) drawInstrument(B.kind, bandAt(t, B));
    weight(t); dust(t);
    if (t > 120.5) street(t);
    for (const B of BAND) { if (t < B.t0) continue; const p = bandAt(t, B); if (p.y > HC + 235) continue; g.save(); if (p.y > HC - 320) holeClip(); drawInstrument(B.kind, p); g.restore(); if (p.y > HC - 320 && p.y < HC + 260) nearLip(); }
    for (const B of BAND) gulp(t, B.t1 + .05, B.kind === 'tuba' ? 1.3 : .8);
    if (rise <= 0) boat(t);
    clapRings(t, CK.x, PALMS_Y, K, .9);
    g.restore();
    rain(t, 40, 61, .3 * (1 - rise), .12); // the avenue's rain, so nothing changes at the cut
    // the night closes in round the clock as we pull back; the face stays (it becomes the moon)
    if (rise > 0) {
      sheet(C.tealInk, .9 * rise);
      g.save(); cam(cx, cy, z);
      clockFace(CK.x, CK.y, CK.r, bezelT(t), .3, 1, litN(t), 1.3);
      hands(t);
      const b = boatAt(t); glow(b.x, b.y - 60, 380 * b.s, '205,238,228', .32 * (1 - rise)); rowboat(b.x, b.y, b.s, t * TAU / 1.03, 1);
      g.restore();
    }
  });

  // the avenue's view of the tower (s05 draws it in these coordinates, scaled down): everything above the street,
  // the band waiting on its ledge
  function far(t) {
    body(t, 1);
    ironStems(t, clamp(litN(t) / 12));
    clock(t, 1);
    ledge(t);
    for (const B of BAND) drawInstrument(B.kind, bandAt(t, B));
  }
  return { CK, LEDGE, far, litN, lightAt, camAt };
})();

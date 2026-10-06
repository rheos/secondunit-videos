// p4-instr2: INSTRUMENTAL 2 (112.0 - 152.9), recomposed for the 9:16 page (wood-9x16.html, 1080 x 1920).
// Same beats and hit times as js/wch/w4-instr2.js (the 16:9 master, untouched), re-staged for the tall frame:
//   shot 1: a tall sky for the piano to fall through; Ellen walks UP the frame from a big foreground figure into
//           depth toward it; the key-towers are real skyscrapers (up to 2/3 of the frame); the camera pushes in on
//           her, pulls back as the city rises, rides the Victorian hand as it plays, pulls out for the Ellens.
//   shot 2: big Ellen low in the frame; her hair streams right and climbs as a rising red staff, so the notes walk
//           DOWN it like commuters on a ramp and the one that trips has a long fall into the piano.
//   shot 3: the open lid towers up the frame, the mouth inside; big Ellen on the stool in front works the lid;
//           the notes puff up into the tall sky. The 16:9 notes follow.
// w4-instr2: INSTRUMENTAL 2 (112.0 - 152.9), Bob's beat 19.
// 112-130  an enormous black grand piano in an empty Victorian landscape; tiny Ellen walks toward it carrying
//          her slide guitar; from 122, on each piano onset, a key shoots up like a skyscraper: a city of keys.
// 130-140  a giant Victorian hand comes down out of the clouds and plays the city: fish in spectacles (131.63),
//          a boot (133.23), a teapot (134.80), a tiny Ellen (136.33), another (137.40), then a glissando and
//          Ellens everywhere (138.77). The real harmonica (133.5-137.6) leaks out of the piano: its lid lifts a
//          crack, breath gusts out and every Ellen's hair blows.
// 140-146  Ellen's hair blows sideways (no wind: the pennant hangs limp), stretches across the screen, becomes a
//          red staff; notes with briefcases walk along it; one trips (144.17) and falls into the piano.
// 146-152.9 the lid opens slowly: inside, an enormous mouth playing harmonica. Ellen peers in, it stops; she closes
//          the lid (148.93, silence), opens (149.47, harmonica), closes (150.00, silence), opens (151.07, the
//          one harmonica breath after 140); shrugs, leaves it open. The audio has no harmonica in 146-153, so the
//          mouth's playing moments are short and land on beats.
(() => {
  // ---------- audio-derived tables (from source/harmonica-band.json and FEAT.onset, measured 2026-10-04) ----------
  const HARM = [[126, .004], [126.5, .006], [127, .004], [127.5, .021], [128, .011], [128.5, .004], [133, .003], [133.5, .036], [134, .102], [134.5, .047],
    [135, .044], [135.5, .027], [136, .039], [136.5, .030], [137, .040], [137.5, .037], [138, .008], [139, .009], [139.5, .020], [140, .058], [140.5, .022], [141, .010], [142, .003]];
  const harm = (t) => { if (t <= HARM[0][0] || t >= HARM[HARM.length - 1][0]) return 0; for (let i = 1; i < HARM.length; i++) if (t < HARM[i][0]) { const [a, va] = HARM[i - 1], [b, vb] = HARM[i]; return lerp(va, vb, (t - a) / (b - a)); } return 0; };
  const harmK = (t) => clamp((harm(t) - .012) / .03);           // 0 = no harmonica, 1 = clearly playing
  // piano-note onsets 122-130: one key-tower per onset
  const HZ = 1060, PO = [140, 1230, 820];        // shot 1: horizon low enough for a tall sky; piano origin x, y and scale (spans the frame width)
  const RISE = [122.00, 122.27, 123.07, 123.60, 123.83, 124.13, 124.40, 124.67, 124.93, 125.17, 125.40, 125.97, 126.23, 126.50, 126.73, 126.97, 127.23, 128.03, 128.27, 128.53, 129.30, 129.57];

  // ---------- the Victorian landscape ----------
  function sky(t, horizon = 600, seed = 3) {
    shape(() => { s.beginPath(); s.rect(-20, -20, W + 40, H + 40); }, CUT);
    // engraved sky: fine horizontal rules, thicker toward the top
    clipTo(() => { s.beginPath(); s.rect(0, 0, W, horizon); }, () => rows(0, 0, W, horizon, 0, 15, (u) => u < .5 ? lerp(4.5, .3, u * 2) : 0, INK, 2, seed));
    // carved clouds: CUT bodies with INK hatching under them
    // portrait: clouds staggered down the tall sky instead of strung along a wide one
    const r = rng(seed * 17);
    for (let i = 0; i < 5; i++) {
      const cx = 100 + (i % 3) * 420 + (i > 2 ? 210 : 0) + (r() - .5) * 120 + Math.sin(t * .05 + i) * 20, cy = 80 + i * Math.min(110, horizon * .09) + r() * 60, cw = 170 + r() * 110;
      const P = () => { s.beginPath(); s.ellipse(cx, cy, cw, 34, 0, 0, TAU); s.moveTo(cx + cw * .5, cy - 20); s.ellipse(cx - cw * .1, cy - 26, cw * .55, 40, 0, 0, TAU); };
      shape(P, CUT, 4);
      clipTo(P, () => rows(cx - cw, cy - 70, cx + cw, cy + 40, 0, 11, (u) => u > .55 ? (u - .55) * 9 : 0, INK));
    }
  }
  function ground(t, horizon = 600, seed = 5) {
    shape(() => pathOf(chisel([[-20, horizon], [W + 20, horizon], [W + 20, H + 20], [-20, H + 20]], seed, 3)), CUT);
    taper([[-20, horizon], [W + 20, horizon]], 5, 5);
    // furrows that open toward the viewer
    clipTo(() => { s.beginPath(); s.rect(0, horizon, W, H - horizon); }, () => {
      for (let i = 0; i < 9; i++) { const u = i / 9, y = horizon + Math.pow(u, 1.8) * (H - horizon) + 6; taper([[-20, y], [W + 20, y + Math.sin(i * 3.1) * 6]], .8 + u * 4, .8 + u * 4); }
    });
    flicks(0, horizon + 40, W, H, 70, -Math.PI / 2, 22, 3, seed + 9, INK, .5);
  }
  // distant Victorian things: chimneys, a spire, a gas lamp
  function victorian(horizon = 600, x0 = 0, gaslamp = 1700, gy = horizon + 120) {
    const ch = (x, w, h) => { shape(() => pathOf([[x, horizon], [x, horizon - h], [x + w, horizon - h], [x + w, horizon]]), INK); taper([[x + w / 2, horizon - h - 6], [x + w / 2 + 30, horizon - h - 60]], 10, 2); };
    ch(x0 + 40, 18, 70); ch(x0 + 70, 12, 46); ch(x0 + 1010, 16, 64);
    shape(() => pathOf([[x0 + 900, horizon], [x0 + 900, horizon - 40], [x0 + 912, horizon - 110], [x0 + 924, horizon - 40], [x0 + 924, horizon]]), INK);
    if (gaslamp != null) {
      const gx = gaslamp;
      taper([[gx, gy], [gx, gy - 260]], 12, 7); taper([[gx - 26, gy], [gx + 26, gy]], 10, 10);
      shape(() => pathOf([[gx - 22, gy - 262], [gx + 22, gy - 262], [gx + 30, gy - 312], [gx - 30, gy - 312]]), CUT, 5);
      shape(() => pathOf([[gx - 36, gy - 312], [gx + 36, gy - 312], [gx, gy - 340]]), INK);
      taper([[gx - 30, gy - 236], [gx + 30, gy - 236]], 5, 5);
    }
  }

  // ---------- the grand piano, 3/4 view from above-front ----------
  // plan coords: X 0 (keyboard end, left) .. 1 (tail), Z 0 (far, straight side, lid hinge) .. .42 (near, curved side)
  const PLAN = [[0, 0], [.5, 0], [.93, 0], [.985, .02], [1.0, .06], [.99, .1], [.93, .15], [.82, .215], [.68, .29], [.54, .355], [.42, .40], [.28, .42], [0, .42]];
  const HC = .2, RIM = .07;
  function piano(ox, oy, sc, lid = 0, o = {}) {
    const P = (X, Y, Z) => [ox + (X + Z * .12) * sc, oy + (Z * .5 - Y) * sc];
    const top = PLAN.map(([X, Z]) => P(X, HC, Z));
    // legs (turned Victorian legs) and the pedal lyre
    const leg = (X, Z) => { const a = P(X, HC - RIM, Z), b = P(X, 0, Z); const h = b[1] - a[1];
      taper([[a[0], a[1]], [a[0], a[1] + h * .25], [a[0], a[1] + h * .6], [b[0], b[1] - 8]], .055 * sc, .03 * sc, INK);
      dot(a[0], a[1] + h * .25, .036 * sc, INK); dot(b[0], b[1] - 6, .02 * sc, INK); flick(a[0] - .012 * sc, a[1] + h * .1, Math.PI / 2, h * .7, 3); };
    leg(.05, .03); leg(.84, .12);
    // case side: the visible curved near side, extruded down by the rim
    const side = PLAN.slice(4).map(([X, Z]) => [X, Z]);
    const sidePoly = [...side.map(([X, Z]) => P(X, HC, Z)), ...side.slice().reverse().map(([X, Z]) => P(X, HC - RIM, Z))];
    // the keyboard end face
    shape(() => pathOf(sidePoly), INK);
    clipTo(() => pathOf(sidePoly), () => { for (let i = 0; i < 3; i++) taper(side.map(([X, Z]) => { const p = P(X, HC - RIM * (.3 + i * .2), Z); return [p[0], p[1]]; }), 2 + i, 2 + i, CUT); });
    leg(.05, .40); leg(.5, .39);
    // pedal lyre
    { const a = P(.07, HC - RIM, .22), b = P(.07, .03, .22); taper([[a[0] - 14, a[1]], [b[0] - 10, b[1]]], 8, 6); taper([[a[0] + 14, a[1]], [b[0] + 10, b[1]]], 8, 6);
      shape(() => { s.beginPath(); s.rect(b[0] - 34, b[1] - 10, 68, 16); }, INK); for (const d of [-20, 0, 20]) taper([[b[0] + d, b[1]], [b[0] + d - 12, b[1] + 10]], 6, 4); }
    // keyboard: a key bed sticking out of the left end
    const KB = [[-.075, .02], [0, .02], [0, .4], [-.075, .4]];
    const kbTop = KB.map(([X, Z]) => P(X, HC - .055, Z)), kbFront = [P(-.075, HC - .055, .02), P(-.075, HC - .055, .4), P(-.075, HC - .1, .4), P(-.075, HC - .1, .02)];
    const kbNear = [P(-.075, HC - .055, .4), P(0, HC - .055, .4), P(0, HC - .1, .4), P(-.075, HC - .1, .4)];
    shape(() => pathOf(kbFront), INK); shape(() => pathOf(kbNear), INK);
    shape(() => pathOf(kbTop), CUT, 4);
    for (let i = 1; i < 22; i++) { const Z = .02 + i * .38 / 22; taper([P(-.075, HC - .055, Z), P(0, HC - .055, Z)], 1.6, 1.6); }
    for (let i = 0; i < 22; i++) { if ([2, 6, 9, 13, 16, 20].includes(i % 22)) continue; const Z = .02 + (i + .7) * .38 / 22; taper([P(-.03, HC - .055, Z), P(0, HC - .055, Z)], .009 * sc, .009 * sc); }
    // fallboard / music desk at the back of the keys
    shape(() => pathOf([P(0, HC, .03), P(0, HC, .41), P(.005, HC + .05, .41), P(.005, HC + .05, .03)]), INK);
    // top: the interior (when the lid is up) or the closed lid
    const rimTop = () => pathOf(top);
    if (lid > .015) {
      shape(rimTop, INK);
      const inner = PLAN.map(([X, Z]) => { const cx = .5, cz = .2; return P(cx + (X - cx) * .95, HC, cz + (Z - cz) * .9); });
      const innerP = () => pathOf(inner);
      shape(innerP, o.interior ? CUT : INK);
      if (o.interior) clipTo(innerP, () => o.interior(P, sc));
      else clipTo(innerP, () => { for (let i = 0; i < 9; i++) taper([P(.1 + i * .02, HC, .03), P(.6 + i * .04, HC, .4 - i * .03)], 1.2, 1.2, CUT); });
    }
    // the lid: hinged on the far straight side (Z = 0), rotating up by angle lid
    const ca = Math.cos(lid), sa = Math.sin(lid);
    const lidPts = PLAN.map(([X, Z]) => P(X, HC + .006 + Z * sa, Z * ca));
    if (o.prop && lid > .25) { const a = P(.56, HC, .34), b = P(.56, HC + .3 * sa, .3 * ca); taper([a, b], 9, 7, INK); taper([a, b], 3, 3, CUT); }
    shape(() => pathOf(chisel(lidPts, 41, 2)), INK);
    clipTo(() => pathOf(lidPts), () => {
      // glossy black: a few long carved reflections
      for (let i = 0; i < 4; i++) taper([P(.12 + i * .05, HC + .006 + (.06 + i * .07) * sa, (.06 + i * .07) * ca), P(.55 + i * .08, HC + .006 + (.05 + i * .055) * sa, (.05 + i * .055) * ca)], 2 + i % 2 * 3, 1, CUT);
      rows(ox - 50, oy - sc, ox + sc * 1.2, oy + sc * .3, -.2, 26, () => 1.1, CUT);
    });
    // near edge of the lid as a cut line (shows its thickness)
    taper(PLAN.slice(4).map(([X, Z]) => P(X, HC + .006 + Z * sa, Z * ca)), 3, 3, CUT);
    return { P, lidEdge: (X, Z) => P(X, HC + .006 + Z * sa, Z * ca) };
  }

  // ---------- key-towers: piano keys standing up as skyscrapers ----------
  function tower(x, base, w, h, black, seed, press = 0) {
    if (h < 4) return;
    const top = base - h + press;
    const d = Math.min(18, w * .2);      // depth face to the right
    if (!black) {
      // white key: wide front section below, narrower notched upper part above (the key's setback)
      const notch = top + (base - top) * .45, nw = w * .62;
      const front = () => pathOf([[x, base], [x, notch], [x + w, notch], [x + w, base]]);
      const upper = () => pathOf([[x, notch], [x, top], [x + nw, top], [x + nw, notch]]);
      shape(() => pathOf([[x + w, base], [x + w, notch], [x + w + d, notch - d * .6], [x + w + d, base - d * .6]]), INK);
      shape(() => pathOf([[x + nw, notch], [x + nw, top], [x + nw + d, top - d * .6], [x + nw + d, notch - d * .6]]), INK);
      shape(() => pathOf([[x, top], [x + d, top - d * .6], [x + nw + d, top - d * .6], [x + nw, top]]), CUT, 3);
      shape(front, CUT, 5); shape(upper, CUT, 5);
      const r = rng(seed);
      clipTo(upper, () => { for (let yy = top + 18; yy < notch - 10; yy += 22) for (let xx = x + 10; xx < x + nw - 10; xx += 16) if (r() > .25) shape(() => { s.beginPath(); s.rect(xx, yy, 6, 10); }, INK); });
      clipTo(front, () => { rows(x, notch, x + w, base, Math.PI / 2, 12, (u) => u > .7 ? (u - .7) * 12 : 0, INK); for (let yy = notch + 18; yy < base - 30; yy += 24) for (let xx = x + 10; xx < x + w * .65; xx += 16) if (r() > .3) shape(() => { s.beginPath(); s.rect(xx, yy, 6, 11); }, INK); });
      taper([[x, base - 14], [x + w, base - 14]], 3, 3);   // the key's front lip
    } else {
      const P = () => pathOf([[x, base], [x, top + 10], [x + 8, top], [x + w - 8, top], [x + w, top + 10], [x + w, base]]);
      shape(() => pathOf([[x + w, base], [x + w, top + 10], [x + w + d, top + 10 - d * .6], [x + w + d, base - d * .6]]), INK);
      shape(P, INK);
      taper([[x + 7, top + 14], [x + 7, base - 6]], 4, 2, CUT);
      const r = rng(seed);
      for (let yy = top + 26; yy < base - 24; yy += 24) for (let xx = x + 16; xx < x + w - 8; xx += 14) if (r() > .35) shape(() => { s.beginPath(); s.rect(xx, yy, 5, 10); }, CUT);
    }
  }
  // the city: [x, base, w, h, black, riseIndex]
  const CITY = [];
  // portrait: a far row of real skyscrapers on the horizon (tops 1/4 to 1/2 way down the frame), two mid towers on
  // the ground in front of the piano either side of Ellen's path, two huge near towers rising out of the bottom corners
  { const r = rng(77); let x = 14, i = 0;
    while (x < 1040) { const black = (i % 7) === 1 || (i % 7) === 3 || (i % 7) === 5 ? 1 : 0;
      const w = black ? 52 : 80, h = (black ? 330 + r() * 200 : 420 + r() * 230) + (i % 2 ? 0 : 60);
      CITY.push({ x, base: HZ + 12, w, h, black, row: 0 }); x += w + 6 + r() * 8; i++; } }
  CITY.push({ x: 236, base: 1640, w: 84, h: 400, black: 0, row: 1 }, { x: 760, base: 1660, w: 60, h: 360, black: 1, row: 1 },
    { x: -70, base: 1990, w: 150, h: 1180, black: 0, row: 2 }, { x: 990, base: 1990, w: 130, h: 1100, black: 1, row: 2 });
  // which tower rises on which onset: shuffled, but the 125.40 hit (strongest) raises the big front-left tower
  { const r = rng(9); const idx = CITY.map((_, i) => i); for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    const big = CITY.findIndex((c) => c.row === 2), bi = idx.indexOf(big); [idx[bi], idx[10]] = [idx[10], idx[bi]];
    idx.forEach((ci, k) => { CITY[ci].rise = RISE[k % RISE.length] + Math.floor(k / RISE.length) * .13; }); }
  const riseK = (c, t) => { const u = inv(c.rise, c.rise + .3, onTwos(t, 24)); return u <= 0 ? 0 : ease.back(u); };

  // ---------- pop-outs ----------
  function spring(x, y0, len, w = 22) { const n = 8, pts = []; for (let i = 0; i <= n; i++) pts.push([x + (i % 2 ? w : -w) * (i && i < n ? 1 : 0), y0 - len * i / n]); line(pts, INK, 5, 'butt'); }
  function fishSpecs(x, y, k, t) {
    withT(() => { s.translate(x, y); s.scale(k, k); s.rotate(Math.sin(t * 5) * .08);
      const body = () => { s.beginPath(); s.ellipse(0, -40, 70, 38, 0, 0, TAU); };
      shape(() => pathOf([[60, -40], [110, -78], [102, -40], [110, -2]]), INK);
      shape(body, CUT, 5); clipTo(body, () => { for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) { s.beginPath(); s.arc(-10 + i * 18, -58 + j * 18 + (i % 2) * 9, 9, .2, Math.PI - .2); s.lineWidth = 2.5; s.strokeStyle = INK; s.stroke(); } });
      taper([[-30, -76], [-26, -6]], 3, 3);
      // spectacles
      for (const ex of [-48, -24]) { s.beginPath(); s.arc(ex, -48, 11, 0, TAU); s.lineWidth = 4; s.strokeStyle = INK; s.stroke(); dot(ex + 2, -48, 3.5, INK); }
      taper([[-37, -50], [-35, -50]], 4, 4); taper([[-13, -50], [8, -58]], 3, 3);
      taper([[-68, -30], [-56, -28]], 3, 3);
    });
  }
  function boot(x, y, k, t) {
    withT(() => { s.translate(x, y); s.scale(k, k); s.rotate(Math.sin(t * 4.3) * .06);
      const P = () => pathOf(chisel([[-30, -150], [22, -150], [24, -50], [80, -34], [92, -14], [90, 0], [-34, 0], [-36, -40]], 5, 2));
      shape(P, INK);
      for (let i = 0; i < 5; i++) { taper([[-14, -138 + i * 20], [10, -126 + i * 20]], 3, 3, CUT); taper([[10, -138 + i * 20], [-14, -126 + i * 20]], 3, 3, CUT); }
      taper([[-34, -10], [90, -10]], 3, 3, CUT); shape(() => { s.beginPath(); s.rect(-36, -4, 28, 14); }, INK);
      flick(30, -40, 0, 50, 3);
    });
  }
  function teapot(x, y, k, t) {
    withT(() => { s.translate(x, y); s.scale(k, k); s.rotate(Math.sin(t * 4.7) * .06);
      const body = () => { s.beginPath(); s.ellipse(0, -52, 62, 50, 0, 0, TAU); };
      taper([[50, -60], [86, -90], [108, -104]], 18, 8);
      s.beginPath(); s.ellipse(-62, -56, 22, 28, 0, 0, TAU); s.lineWidth = 9; s.strokeStyle = INK; s.stroke();
      shape(body, CUT, 5); clipTo(body, () => rows(-62, -102, 62, -2, .3, 13, (u) => u > .5 ? (u - .5) * 8 : 0));
      shape(() => { s.beginPath(); s.ellipse(0, -100, 34, 9, 0, 0, TAU); }, INK); dot(0, -112, 9, INK);
      taper([[-40, -50], [40, -50]], 3, 3); shape(() => { s.beginPath(); s.rect(-40, -6, 80, 8); }, INK);
    });
  }
  function popAt(kind, x, y, t, t0, k = 1, lift = 1) {
    if (t < t0 - .02) return;
    const u = inv(t0 - .02, t0 + .22, onTwos(t, 24)), e = ease.back(u), wob = Math.sin((t - t0) * 9) * 6 * Math.exp(-(t - t0) * 2);
    const len = 70 * k * e * lift, oy = y - len + wob;     // portrait: neighbours alternate short and long springs so the curios stack up the sky
    spring(x, y, len, 14 * k);
    const sc = k * clamp(e, 0, 1.2);
    if (kind === 'fish') fishSpecs(x + 6, oy, sc * .8, t);
    else if (kind === 'boot') boot(x - 18 * sc, oy, sc * .75, t);
    else if (kind === 'teapot') teapot(x, oy, sc * .8, t);
    else if (kind === 'ellen') ellenPlaying(x, oy, .17 * sc, t, t0);
    else if (kind === 'hat') topHat(x, oy, sc * .8, t);
    else if (kind === 'watch') pocketWatch(x, oy, sc * .8, t);
    else if (kind === 'umbrella') umbrella(x, oy, sc * .8, t);
    else if (kind === 'cage') birdcage(x, oy, sc * .8, t);
  }
  // Bob (draft-4 notes): 'more eye candy and earlier' -- Victorian curios that pop from the towers before the hand comes
  function topHat(x, y, k, t) {
    withT(() => { s.translate(x, y); s.scale(k, k); s.rotate(Math.sin(t * 5.2) * .07);
      shape(() => { s.beginPath(); s.ellipse(0, -8, 74, 14, 0, 0, TAU); }, INK);
      const cr = () => pathOf([[-44, -12], [-50, -120], [50, -120], [44, -12]]); shape(cr, INK); clipTo(cr, () => rows(-50, -120, 50, -12, Math.PI / 2, 14, () => 2.2, CUT));
      shape(() => pathOf([[-46, -30], [46, -30], [45, -46], [-45, -46]]), CUT); });
  }
  function pocketWatch(x, y, k, t) {
    withT(() => { s.translate(x, y); s.scale(k, k);
      taper([[0, -112], [0, -132]], 10, 10); s.beginPath(); s.arc(0, -142, 12, 0, TAU); s.lineWidth = 6; s.strokeStyle = INK; s.stroke();
      shape(() => { s.beginPath(); s.arc(0, -56, 58, 0, TAU); }, CUT, 9, INK);
      for (let i = 0; i < 12; i++) { const a = i * TAU / 12; taper([[Math.cos(a) * 42, -56 + Math.sin(a) * 42], [Math.cos(a) * 50, -56 + Math.sin(a) * 50]], 4, 4); }
      const a1 = t * 2.4, a2 = t * 9; taper([[0, -56], [Math.cos(a1) * 26, -56 + Math.sin(a1) * 26]], 6, 3); taper([[0, -56], [Math.cos(a2) * 40, -56 + Math.sin(a2) * 40]], 4, 2); dot(0, -56, 6, INK); });
  }
  function umbrella(x, y, k, t) {
    withT(() => { s.translate(x, y); s.scale(k, k); s.rotate(Math.sin(t * 3.7) * .1);
      taper([[0, 0], [0, -150]], 7, 7); s.beginPath(); s.arc(-14, 0, 14, 0, Math.PI); s.lineWidth = 7; s.strokeStyle = INK; s.stroke();
      const can = () => { s.beginPath(); s.moveTo(-110, -120); for (let i = 0; i < 4; i++) s.quadraticCurveTo(-110 + i * 55 + 27, -140, -110 + (i + 1) * 55, -120); s.quadraticCurveTo(80, -230, 0, -232); s.quadraticCurveTo(-80, -230, -110, -120); s.closePath(); };
      shape(can, INK); clipTo(can, () => { for (let i = 0; i < 4; i++) taper([[0, -232], [-110 + i * 55 + 55, -122]], 3, 3, CUT); }); taper([[0, -232], [0, -262]], 6, 4); });
  }
  function birdcage(x, y, k, t) {
    withT(() => { s.translate(x, y); s.scale(k, k);
      const bars = () => { s.beginPath(); s.moveTo(-60, 0); s.lineTo(-60, -110); s.quadraticCurveTo(0, -200, 60, -110); s.lineTo(60, 0); s.closePath(); };
      shape(() => { s.beginPath(); s.rect(-70, -10, 140, 14); }, INK);
      for (let i = 0; i < 7; i++) { const bx = -60 + i * 20; taper([[bx, 0], [bx, -110 - Math.sin(Math.PI * i / 6) * 50]], 3, 3); }
      bars(); s.lineWidth = 5; s.strokeStyle = INK; s.stroke(); s.beginPath(); s.arc(0, -170, 10, 0, TAU); s.stroke();
      const hop = Math.abs(Math.sin(t * 9)) * 10;        // the bird hops on its perch, beak open
      taper([[-40, -50], [40, -50]], 4, 4);
      withT(() => { s.translate(0, -66 - hop); shape(() => { s.beginPath(); s.ellipse(0, 0, 22, 15, -.2, 0, TAU); }, INK); dot(16, -12, 9, INK); dot(19, -14, 2.5, CUT); shape(() => pathOf([[24, -12], [36, -10], [24, -6]]), INK); taper([[-18, 4], [-36, 14]], 8, 2); }); });
  }

  // ---------- the sky circus (112-124): balloons, a zeppelin, a flock, a penny-farthing, all on the beats ----------
  function hotAir(x, y, k, seed) {
    withT(() => { s.translate(x, y); s.scale(k, k);
      const env = () => { s.beginPath(); s.moveTo(-34, 60); s.bezierCurveTo(-130, -40, -110, -190, 0, -190); s.bezierCurveTo(110, -190, 130, -40, 34, 60); s.closePath(); };
      shape(env, seed % 2 ? CUT : INK, 6, INK);
      clipTo(env, () => { for (let i = -3; i <= 3; i++) taper([[i * 12, 64], [i * 36, -100], [i * 14, -192]], 3, 3, seed % 2 ? INK : CUT); rows(-130, -40, 130, -10, 0, 12, () => 3, seed % 2 ? INK : CUT); });
      for (const sd of [-1, 1]) taper([[sd * 34, 60], [sd * 22, 110]], 2.5, 2.5);
      shape(() => pathOf([[-26, 108], [26, 108], [22, 150], [-22, 150]]), INK); taper([[-24, 120], [24, 120]], 2, 2, CUT); });
  }
  function zeppelin(x, y, k) {
    withT(() => { s.translate(x, y); s.scale(k, k);
      // the banner trails behind (to the right): black cloth, carved words with a margin all round
      // portrait: a shorter, two-line banner so the whole sign fits the 1080 frame with the airship
      const bw = 400, bh = 124;
      for (let i = 0; i < 3; i++) taper([[150, -6 + i * 10], [220, -50 + i * 50]], 2, 2);
      shape(() => pathOf([[220, -62], [220 + bw, -68], [220 + bw - 26, 0], [220 + bw, 68], [220, 62]]), INK);
      carveText('ELLEN McILWAINE', 220 + (bw - 34) / 2, -26, 40, CUT, { w: bw - 96 });
      carveText('TONIGHT', 220 + (bw - 34) / 2, 30, 40, CUT, { w: 170 });
      const body = () => { s.beginPath(); s.ellipse(0, 0, 170, 52, 0, 0, TAU); };
      shape(body, CUT, 6, INK); clipTo(body, () => { for (let i = -5; i <= 5; i++) taper([[i * 30, -60], [i * 30, 60]], 3, 3); rows(-170, 14, 170, 52, 0, 10, () => 2.5); });
      shape(() => pathOf([[150, -10], [196, -46], [196, 46], [150, 10]]), INK);
      shape(() => pathOf([[-40, 50], [40, 50], [30, 74], [-30, 74]]), INK); for (let i = 0; i < 4; i++) dot(-21 + i * 14, 62, 3.5, CUT); });
  }
  function bird(x, y, k, ph) {
    const f = Math.sin(ph) * 16; taper([[x - 22 * k, y - f * k], [x - 6 * k, y + 3 * k], [x, y]], 4 * k, 2 * k); taper([[x, y], [x + 6 * k, y + 3 * k], [x + 22 * k, y - f * k]], 2 * k, 4 * k);
  }
  function pennyFarthing(x, y, k, t) {
    withT(() => { s.translate(x, y); s.scale(-k, k);          // faces left, riding right-to-left
      const sp = (cx, cy, r, n) => { s.beginPath(); s.arc(cx, cy, r, 0, TAU); s.lineWidth = 8; s.strokeStyle = INK; s.stroke(); const a0 = onTwos(t, 12) * 6;
        for (let i = 0; i < n; i++) { const a = a0 + i * TAU / n; taper([[cx, cy], [cx + Math.cos(a) * r, cy + Math.sin(a) * r]], 2, 2); } dot(cx, cy, 8, INK); };
      sp(60, -110, 110, 14); sp(-110, -34, 34, 8);
      taper([[60, -110], [40, -236], [-20, -230], [-110, -34]], 7, 5);
      // the rider: top hat, frock coat, legs on the pedals
      const ph = onTwos(t, 12) * 6;
      for (const sd of [0, Math.PI]) { const px = 60 + Math.cos(ph + sd) * 26, py = -110 + Math.sin(ph + sd) * 26; taper([[40, -270], [50 + Math.cos(ph + sd) * 10, -190], [px, py]], 16, 12); }
      shape(() => pathOf(chisel([[18, -360], [70, -360], [66, -262], [12, -262]], 4, 2)), INK);
      taper([[60, -340], [110, -250], [70, -236]], 12, 10);
      shape(() => { s.beginPath(); s.ellipse(44, -386, 22, 26, 0, 0, TAU); }, CUT, 5);
      shape(() => pathOf([[22, -404], [68, -404], [64, -456], [26, -456]]), INK); taper([[14, -404], [76, -404]], 6, 6); });
  }
  function skyCircus(t) {
    const T = onTwos(t, 12);
    // balloons rise from behind the horizon, one every four beats (113.10, 115.10, 117.23, 119.37)
    // portrait: they rise the whole height of the tall sky
    [[113.10, 800, .85], [115.10, 190, .7], [117.23, 940, .75], [119.37, 470, .6]].forEach(([t0, x, k], i) => {
      if (T < t0) return; const u = (T - t0) / 9; hotAir(x + Math.sin(T * .7 + i) * 20, lerp(HZ + 40, -300, u), k, i); });
    // the zeppelin, right to left across the top; it slows mid-frame so the whole banner reads (about 115.5-120.5)
    const zx = kf(T, [[112.6, 1350], [115.6, 290], [120.4, 150], [123.6, -950]], ease.inOut);
    if (T > 112.6 && T < 123.6) zeppelin(zx, 320 + Math.sin(T * 1.3) * 8, .9);   // low enough that the push-in never crops the banner
    // a flock, flapping on the beats
    const fu = inv(117.77, 124.13, T); if (fu > 0 && fu < 1) for (let i = 0; i < 11; i++) { const r = rng(i + 70); bird(lerp(-120, 1200, fu) - (i % 4) * 46 - Math.floor(i / 4) * 30, 520 + (i % 4) * 30 + Math.floor(i / 4) * 44 + r() * 20, 1.15, (T * 14 + i) * 1.0); }
  }
  // the piano falls out of the sky and lands on the beat at 112.67
  const PDROP = 112.67;
  const pianoDrop = (t) => t >= PDROP ? -Math.abs(Math.sin((t - PDROP) * 18)) * 30 * Math.exp(-(t - PDROP) * 7) : -1500 * Math.pow(1 - inv(112.0, PDROP, t), 2);   // portrait: a longer fall
  function ellenPlaying(x, y, k, t, seed = 0) {
    const tt = onTwos(t, 12);
    ellen(x, y, k, { pose: 'play', t: tt * 1.4 + seed, slide: .5 + .42 * Math.sin(tt * 26 + seed * 3), wind: .55 * harmK(t), facing: hash(Math.floor(seed * 100)) > .5 ? 1 : -1 });
  }

  // ---------- the Victorian hand: lace cuff, frock-coat sleeve, index finger down; tip at (x, y) ----------
  function vhand(x, y, k = 1, rot = 0) {
    withT(() => { s.translate(x, y); s.rotate(rot); s.scale(k, k);
      // sleeve up to the clouds
      const sleeve = () => pathOf(chisel([[-120, -470], [150, -470], [190, -1400], [-150, -1400]], 12, 4));
      shape(sleeve, INK); clipTo(sleeve, () => { rows(-160, -1400, 200, -470, .15, 20, (u) => 1 + u * 2.5, CUT); });
      for (const by of [-520, -580]) { dot(118, by, 11, CUT); dot(118, by, 5, INK); }
      // lace cuff: scalloped frill
      const lace = () => { s.beginPath(); s.moveTo(-110, -470); for (let i = 0; i <= 10; i++) { const xx = -110 + i * 25; s.quadraticCurveTo(xx + 12, -400, xx + 25, -455); } s.lineTo(140, -485); s.lineTo(-115, -485); s.closePath(); };
      shape(lace, CUT, 4); clipTo(lace, () => { for (let i = 0; i < 11; i++) { dot(-98 + i * 25, -446, 5, INK); taper([[-98 + i * 25, -470], [-98 + i * 25, -455]], 2, 1); } });
      // back of the hand
      const backH = () => pathOf(chisel([[-70, -440], [110, -440], [130, -300], [108, -232], [-40, -232], [-74, -320]], 14, 3));
      // curled fingers (knuckles to the right of the index)
      for (let i = 0; i < 3; i++) { const fx = 46 + i * 30; shape(() => { s.beginPath(); s.ellipse(fx, -218 + i * 6, 17, 34, -.1, 0, TAU); }, CUT, 5); taper([[fx - 10, -214 + i * 6], [fx + 10, -210 + i * 6]], 2.5, 2.5); }
      shape(backH, CUT, 6);
      clipTo(backH, () => { rows(-80, -440, 140, -232, Math.PI / 2 + .1, 14, (u) => u > .6 ? (u - .6) * 10 : 0); for (let i = 0; i < 3; i++) taper([[-20 + i * 36, -420], [-4 + i * 34, -260]], 2.5, 1); });
      // thumb
      const th = () => { s.beginPath(); s.ellipse(-70, -280, 20, 58, .45, 0, TAU); }; shape(th, CUT, 5); taper([[-84, -248], [-70, -238]], 3, 3);
      // the index finger, pointing straight down, with a signet ring
      const fin = () => { s.beginPath(); s.moveTo(-34, -250); s.lineTo(-30, -26); s.quadraticCurveTo(-28, 4, 0, 4); s.quadraticCurveTo(28, 4, 28, -26); s.lineTo(30, -250); s.closePath(); };
      shape(fin, CUT, 6);
      for (const j of [-140, -66]) taper([[-14, j], [0, j + 4], [14, j]], 2.5, 2.5);
      shape(() => pathOf([[-12, -40], [12, -40], [10, -12], [-10, -12]]), CUT, 3);   // fingernail
      shape(() => { s.beginPath(); s.rect(-34, -196, 66, 18); }, INK); dot(0, -187, 6, CUT);
    });
  }

  // breath gusts (the harmonica leaking out of the piano): carved curls drifting right
  function gusts(x0, y0, t, amt, seed) {
    if (amt <= .02) return;
    const tt = onTwos(t, 12);
    for (let i = 0; i < 7; i++) {
      const ph = wrap(tt * .45 + i / 7, 1), x = x0 + ph * 380 + Math.sin(i * 2.3) * 60, y = y0 - ph * 620, L = (170 + 90 * hash(i + seed)) * amt;   // portrait: the breath climbs
      const pts = []; for (let j = 0; j <= 10; j++) { const u = j / 10; pts.push([x + u * L, y + Math.sin(u * 5 + tt * 3 + i) * 12 - u * 20]); }
      taper(pts, 2, 12 * amt, INK);
      if (i % 2 === 0) noteGlyph(x + L + 10, y - 30, .9 + .4 * amt, i, CUT);
    }
  }
  function noteGlyph(x, y, k, seed, c = INK) {
    withT(() => { s.translate(x, y); s.scale(k, k); s.rotate(-.35);
      const g = (col, o) => { dot(0, 0, 14 + o, col); taper([[12, -2 + o], [12, -64 - o]], 5 + o * 2, 5 + o * 2, col); if (seed % 2) taper([[12, -64], [34, -40]], 7 + o * 2, 3 + o * 2, col); };
      if (c === CUT) g(INK, 4); g(c, 0); });
  }

  // ===================================== SHOT 1: piano, walk, city, hand (112 - 140) =====================================
  // camera: scale k about (cx, cy) (k >= 1, centre inside the frame, so the view never leaves the drawn page)
  const cam = (k, cx, cy, dx = 0, dy = 0) => { s.translate(cx + dx, cy + dy); s.scale(k, k); s.translate(-cx, -cy); };
  const PRESS = [ // finger presses: [time, city index (picked below), what pops out]
    [131.63, 'fish'], [133.23, 'boot'], [134.80, 'teapot'], [136.33, 'ellen'], [137.40, 'ellen']];
  // pick towers by x near targets (far row, top clearly visible above the piano)
  const pickNear = (tx, row = 0, not = []) => { let bi = 0, bd = 1e9; CITY.forEach((c, i) => { if (c.row !== row || not.includes(i)) return; const d = Math.abs(c.x + c.w / 2 - tx); if (d < bd) { bd = d; bi = i; } }); return bi; };
  const PT = [pickNear(120), pickNear(880), pickNear(540), pickNear(270, 1), pickNear(790, 1)];
  const EARLY = [[126.23, 'hat', pickNear(370, 0, PT)], [127.27, 'watch', pickNear(700, 0, PT)], [128.27, 'umbrella', pickNear(1010, 0, PT)], [129.30, 'cage', pickNear(240, 0, PT)]];
  // spring length per curio: alternate short and long across the skyline so the seven curios stack up the sky, not in a row
  const LIFT = {};
  [...PT.slice(0, 3), ...EARLY.map((e) => e[2])].map((ci) => [ci, CITY[ci].x]).sort((a, b) => a[1] - b[1]).forEach(([ci], j) => { LIFT[ci] = j % 2 ? 2.0 : 1; });
  const GLISS = [137.75, 138.77];
  const GX0 = 40, GX1 = 1040;                     // the glissando runs across the whole far row
  const towerTopY = (c, t) => c.base - c.h * riseK(c, t);
  function handPose(t) {
    // returns finger tip [x, y] and pressed tower info
    const tops = PT.map((ci) => { const c = CITY[ci]; return [c.x + (c.black ? c.w / 2 : c.w * .31), c.base - c.h]; });
    if (t < 131.2) { const [x, y] = tops[0]; const u = ease.out(inv(129.9, 131.2, onTwos(t, 12))); return [x + 60, lerp(-500, y - 70, u)]; }
    if (t < GLISS[0]) {
      let i = 0; while (i + 1 < PRESS.length && t >= PRESS[i + 1][0] - .55) i++;
      const [tp] = PRESS[i], [x, y] = tops[i];
      const prev = i ? tops[i - 1] : [x + 60, y + 130];
      const travel = ease.inOut(inv(tp - .55, tp - .25, onTwos(t, 12)));
      const dip = t < tp ? ease.in(inv(tp - .2, tp, t)) * 70 : 70 - 110 * ease.out(inv(tp, tp + .3, onTwos(t, 12)));
      return [lerp(prev[0], x, travel), lerp(prev[1] - 110, y - 70, travel) + dip, i, Math.max(0, dip)];
    }
    // glissando across the far row, left to right
    const u = inv(GLISS[0], GLISS[1], onTwos(t, 24)), gx = lerp(GX0, GX1, u);
    let best = null; CITY.forEach((c) => { if (c.row === 0 && gx >= c.x && gx <= c.x + c.w) best = c; });
    const gy = best ? best.base - best.h + 10 : 500;
    if (t > GLISS[1]) { const v = ease.in(inv(GLISS[1] + .3, 139.9, t)); return [GX1 + v * 60, lerp(gy, -900, v)]; }
    return [gx, gy];
  }
  // Ellen's walk: she starts as a big figure at the bottom of the frame and walks up into depth toward the piano
  const WALK_END = 129.6;
  const ellenAt = (t) => { const u = inv(112, WALK_END, t); return [lerp(200, 520, u), lerp(1965, 1650, u), lerp(1.05, .56, Math.pow(u, .8))]; };
  // camera keys: [time, [k, cx, cy]]
  const CAM1 = [[112.0, [1.0, 540, 960]], [112.67, [1.0, 540, 960]],
    [121.6, [1.16, 420, 1640]],                  // push in on Ellen walking, the piano over her
    [124.0, [1.0, 540, 1100]],                   // pull back as the key-towers shoot up
    [129.4, [1.07, 540, 560]],                   // drift up the skyline to the curios
    [129.9, [1.07, 540, 560]]];
  function camShot1(t) {
    if (t < 129.9) return kf(t, CAM1);
    if (t < GLISS[0] - .1) {                       // ride the hand as it plays the city (centre lags toward the middle)
      const hp = handPose(t), k = lerp(1.07, 1.2, ease.inOut(inv(129.9, 131.4, t)));
      return [k, lerp(540, clamp(hp[0], 0, W), .65), lerp(560, 700, ease.inOut(inv(129.9, 131.4, t)))];
    }
    const hpA = handPose(GLISS[0] - .1), a = [1.2, lerp(540, clamp(hpA[0], 0, W), .65), 700];
    return kf(t, [[GLISS[0] - .1, a], [GLISS[1] + .1, [1.0, 540, 900]], [140, [1.08, 540, 1250]]]);   // out for the glissando, then in on the Ellens
  }
  function shot1(t) {
    const [ck, ccx, ccy] = camShot1(t);
    const shake = hit(t, PDROP, 6) * Math.sin((t - PDROP) * 40) * 16 + hit(t, 125.40, 7) * Math.sin((t - 125.40) * 38) * 9;
    withT(() => { cam(ck, ccx, ccy, 0, shake); shot1World(t); });
  }
  function shot1World(t) {
    sky(t, HZ, 3);
    ground(t, HZ, 5);
    victorian(HZ, 0, t < 122 ? 960 : null, 1560);
    skyCircus(t);
    const hp = handPose(t);
    // press depths per tower
    const pressOf = (ci) => { if (t < 131 || t >= GLISS[0]) return 0; const k = PT.indexOf(ci); return k >= 0 && hp[2] === k ? Math.max(0, hp[3] - 40) : 0; };
    const glissPress = (c) => { if (t < GLISS[0] || t > GLISS[1] + .1 || c.row !== 0) return 0; return Math.abs(hp[0] - (c.x + c.w / 2)) < c.w * .6 ? 18 : 0; };
    // far row
    CITY.forEach((c, i) => { if (c.row === 0) tower(c.x, c.base, c.w, c.h * riseK(c, t), c.black, i * 13 + 1, pressOf(i) + glissPress(c)); });
    // pop-outs on the far row
    const popsFar = [], popsMid = [];
    PRESS.forEach(([tp, kind], k) => { const ci = PT[k], c = CITY[ci]; (c.row === 0 ? popsFar : popsMid).push([kind, c, tp, LIFT[ci] || 1]); });
    // Ellens everywhere: the glissando pops one from every far-row tower it passes, then the rest at 138.77
    const gl = (c) => GLISS[0] + inv(GX0, GX1, c.x + c.w / 2) * (GLISS[1] - GLISS[0]);
    const usedFar = new Set([...PT, ...EARLY.map((e) => e[2])]);
    EARLY.forEach(([tp, kind, ci]) => { const c = CITY[ci]; (c.row === 0 ? popsFar : popsMid).push([kind, c, tp, LIFT[ci] || 1]); });
    CITY.forEach((c, i) => { if (!usedFar.has(i) && c.row === 0) popsFar.push(['ellen', c, gl(c) + .04, i % 2 ? 2.2 : 1]); if (!usedFar.has(i) && c.row === 1) popsMid.push(['ellen', c, GLISS[1] + .05 + hash(i) * .15, 1]); });
    for (const [kind, c, tp, lift] of popsFar) popAt(kind, c.x + (c.black ? c.w / 2 : c.w * .31), towerTopY(c, t) + 2, t, tp, kind === 'ellen' ? 1.25 : 1.2, lift);
    // the piano: lid lifts a crack while the real harmonica plays, breath gusts out
    const hk = harmK(t), lidA = t > 126 ? (.26 + .1 * Math.sin(onTwos(t, 12) * 14)) * hk : 0;
    const dropY = pianoDrop(onTwos(t, 24));
    if (t < PDROP + .1) { const sh = 1 - Math.min(1, -dropY / 1500); shape(() => { s.beginPath(); s.ellipse(PO[0] + .46 * PO[2], PO[1] + .14 * PO[2], .56 * PO[2] * sh, 30 * sh, 0, 0, TAU); }, INK); }
    let pp; withT(() => { s.translate(0, dropY); pp = piano(PO[0], PO[1], PO[2], lidA); });
    if (t >= PDROP && t < PDROP + .45) { const k = 1 - (t - PDROP) / .45; for (let j = 0; j < 12; j++) flick(PO[0] - 100 + j * 90, PO[1] + .2 * PO[2], -Math.PI / 2 + (j - 5.5) * .14, 110 * k + 20, 7, INK); }
    if (hk > .02) { const e = pp.P(.6, HC + .02, .2); gusts(e[0] - 120, e[1] - 30, t, hk, 3); }
    // the penny-farthing rider wheels past behind her, right to left
    const pfu = inv(116.17, 121.5, onTwos(t, 12)); if (pfu > 0 && pfu < 1) pennyFarthing(lerp(1300, -300, pfu), 1560, .62, t);
    // mid row (in front of the piano)
    CITY.forEach((c, i) => { if (c.row === 1) tower(c.x, c.base, c.w, c.h * riseK(c, t), c.black, i * 13 + 1, pressOf(i)); });
    for (const [kind, c, tp, lift] of popsMid) popAt(kind, c.x + (c.black ? c.w / 2 : c.w * .31), towerTopY(c, t) + 2, t, tp, kind === 'ellen' ? 1.35 : 1.4, lift);
    // Ellen
    const walking = t < WALK_END;
    const [ex, ey, ek] = ellenAt(t);
    // a few Ellens on the ground too, at the end (behind her ones first)
    const ground_ = [[880, 1560, .3], [160, 1590, .3], [700, 1720, .4], [330, 1800, .46], [930, 1840, .5], [90, 1880, .52]];
    const groundE = (filt) => { if (t > GLISS[1]) ground_.forEach(([x, y, k], i) => { if (!filt(y)) return;
      const u = ease.back(inv(GLISS[1] + .1 + i * .08, GLISS[1] + .35 + i * .08, onTwos(t, 24))); if (u > 0) ellenPlaying(x, y, k * u, t, i + 2); }); };
    groundE((y) => y < ey);
    if (walking) {
      // her slide guitar slung across her back (drawn first, behind her)
      withT(() => { s.translate(ex, ey); s.scale(ek, ek); guitar(-40, -250, .75, -2.2, .5, t); });
      ellen(ex, ey, ek, { pose: 'walk', t: onTwos(t, 12), case_: false, wind: .5 * hk });
    } else if (t < GLISS[1] + .3) ellen(ex, ey, ek, { pose: 'hold', t: onTwos(t, 12), wind: .6 * hk, eyes: t > 131.6 ? 'brow' : 'open' });
    else ellenPlaying(ex, ey, ek, t, 7);
    groundE((y) => y >= ey);
    // near row: the two huge towers out of the bottom corners
    CITY.forEach((c, i) => { if (c.row === 2) tower(c.x, c.base, c.w, c.h * riseK(c, t), c.black, i * 13 + 1); });
    // dust where a tower lands
    CITY.forEach((c, i) => { const d = t - c.rise; if (d > 0 && d < .4) { const k = 1 - d / .4; for (let j = 0; j < 6; j++) flick(c.x + c.w / 2 + (j - 2.5) * c.w * .3, c.base - 4, -Math.PI / 2 + (j - 2.5) * .5, 40 * k + 10, 5, INK); } });
    // the hand, and the clouds it comes out of
    if (t >= 129.9 && t < 140) {
      vhand(hp[0], hp[1], .8, 0);
      const cl = () => { s.beginPath(); for (let i = 0; i < 7; i++) s.ellipse(hp[0] - 300 + i * 100, -14 + (i % 2) * 22, 120, 50, 0, 0, TAU); };
      if (hp[1] > -450) { shape(cl, CUT, 5); clipTo(cl, () => rows(hp[0] - 450, 0, hp[0] + 450, 140, 0, 12, (u) => u > .55 ? (u - .55) * 8 : 0)); }
    }
  }

  // ===================================== SHOT 2: the hair becomes a red staff (140 - 146) =====================================
  // portrait: Ellen big and low in the frame, facing left; her mane streams right, then snakes UP the tall frame in two
  // switchbacks and straightens into a winding red staff. The notes come in along its top run and walk toward her;
  // the one that trips (144.17) falls the full height of the frame into the piano at the bottom right.
  const HZ2 = 1150;
  const S2 = { ex: 230, ey: 1900, k: 1.55 };
  const S2YC = S2.ey - 430 * S2.k, S2X0 = S2.ex + 243 * S2.k;
  const S2PATH = (() => {
    const P = [[S2X0, S2YC], [880, 1205], [1005, 1080], [950, 925], [700, 860], [330, 825], [150, 700], [185, 520], [450, 425], [800, 385], [1180, 335]];
    const out = [];
    for (let i = 0; i < P.length - 1; i++) { const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      for (let j = 0; j < 14; j++) { const u = j / 14, u2 = u * u, u3 = u2 * u;
        out.push([0, 1].map((k) => .5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3))); } }
    out.push(P[P.length - 1]);
    const L = [0]; for (let i = 1; i < out.length; i++) L.push(L[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
    return { pts: out, L, len: L[L.length - 1] };
  })();
  // point on the path at arclength a: [x, y, nx, ny] (n = the normal; line 0 sits on the -n side)
  function along(a) {
    const { pts, L, len } = S2PATH; a = clamp(a, 0, len);
    let i = 1; while (i < L.length - 1 && L[i] < a) i++;
    const u = (a - L[i - 1]) / ((L[i] - L[i - 1]) || 1), p = pts[i - 1], q = pts[i];
    let dx = q[0] - p[0], dy = q[1] - p[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    return [lerp(p[0], q[0], u), lerp(p[1], q[1], u), -dy, dx];
  }
  const staffPt = (i, a, gap = 44) => { const [x, y, nx, ny] = along(a); return [x + nx * (i - 2) * gap, y + ny * (i - 2) * gap]; };
  const CAM2 = [[140.0, [1.22, 330, 1330]], [140.3, [1.22, 330, 1330]], [141.6, [1.0, 540, 960]], [146.0, [1.06, 640, 760]]];
  function shot2(t, tl) {
    const [ck, ccx, ccy] = kf(t, CAM2);
    withT(() => { cam(ck, ccx, ccy); shot2World(t); });
  }
  function shot2World(t) {
    sky(t, HZ2, 11);
    ground(t, HZ2, 13);
    // the city far behind, small, along the horizon
    CITY.forEach((c, i) => { if (c.row === 0) tower(30 + c.x * .95, HZ2, c.w * .5, c.h * .38, c.black, i * 13 + 1); });
    // a pennant on a pole, hanging limp: there is no wind
    { const px = 60, py = HZ2 + 20; taper([[px, py], [px, py - 300]], 9, 6); shape(() => pathOf([[px + 3, py - 296], [px + 34, py - 284], [px + 18, py - 210], [px + 6, py - 190]]), INK); }
    // the piano in the middle distance, lid just ajar, under the staff
    const pp = piano(540, 1440, 500, .14 + .3 * hit(t, 145.0, 7) * (t > 145.0 ? 1 : 0));   // the lid bumps when the tripper lands in it
    // Ellen
    const wind = t < 140.07 ? 0 : clamp(onTwos(t - 140.07, 12) / .25);
    ellen(S2.ex, S2.ey, S2.k, { pose: 'stand', t: 140, wind, facing: -1, eyes: t > 140.4 ? 'brow' : 'open' });
    // the hair stretches across the screen, snakes up it and becomes the staff
    if (t > 140.3) {
      const grow = ease.sine(inv(140.3, 141.6, onTwos(t, 12)));
      const st = ease.inOut(inv(141.4, 142.4, onTwos(t, 12)));        // 0 = a mane of hair, 1 = a staff
      const aEnd = lerp(300, S2PATH.len + 40, grow);
      const gap = lerp(16, 44, st), w = lerp(24, 6, st), amp = lerp(22, 0, st), T = onTwos(t, 12);
      for (let i = 0; i < 5; i++) {
        const pts = [];
        for (let a = 0; a <= aEnd; a += 22) { const [x, y, nx, ny] = along(a), off = (i - 2) * gap + Math.sin(a * .012 + i * .9 + T * 4) * amp * Math.min(1, a / 500);
          pts.push([x + nx * off, y + ny * off]); }
        if (pts.length > 1) taper(pts, w * 1.5, lerp(w * .4, w, st), RED);
      }
    }
    // notes with briefcases come in along the top run (right to left) and walk toward her
    if (t > 142.1) for (let n = 0; n < 5; n++) {
      const line_ = [0, 2, 4, 1, 3][n], t0 = 142.1 + n * .45;
      if (t < t0) continue;
      const isTrip = n === 2;
      const a = S2PATH.len + 30 - ((isTrip && t > 144.17 ? 144.17 : onTwos(t, 12)) - t0) * 260;
      if (a < 80) continue;
      const [x, y] = staffPt(line_, a);
      walkerNote(x, y, t, n, isTrip, pp);
    }
  }
  function walkerNote(x, y, t, n, isTrip, pp) {
    const tt = onTwos(t, 12), ph = Math.sin(tt * 9 + n);
    let rot = 0, dx = 0, dy = 0;
    if (isTrip && t > 144.17) {
      // trips: pitches forward, drops off the staff and falls into the piano's open crack
      const target = pp.P(.55, HC + .03, .18), u = inv(144.3, 145.0, tt);
      rot = -Math.min(1, (t - 144.17) * 6) * 1.1 - u * 3.2;
      dx = (target[0] - x) * ease.in(u); dy = (target[1] - y) * ease.in(u) - Math.sin(u * Math.PI) * 60;
      if (u >= 1) return;
    }
    withT(() => { s.translate(x + dx, y + dy); s.rotate(rot); s.scale(1.6, 1.6);   // portrait: bigger walkers
      // legs to the line
      if (!(isTrip && t > 144.17)) { taper([[-4, -26], [-14 + ph * 10, -2]], 5, 4); taper([[6, -26], [14 - ph * 10, -2]], 5, 4); }
      else { taper([[-4, -26], [-20, -14]], 5, 4); taper([[6, -26], [24, -36]], 5, 4); }
      // the note: head and stem, a little hat
      withT(() => { s.translate(0, -44); s.rotate(-.35); s.beginPath(); s.ellipse(0, 0, 22, 15, 0, 0, TAU); s.fillStyle = INK; s.fill(); });
      taper([[18, -50], [18, -128]], 6, 6);
      if (n % 2 === 0) taper([[18, -128], [42, -102]], 8, 3);
      // briefcase in its hand (an arm from the stem)
      taper([[16, -76], [-14, -60 + ph * 3], [-22, -50]], 4, 3);
      shape(() => { s.beginPath(); s.rect(-44, -50, 40, 28); }, INK, 0);
      taper([[-34, -50], [-34, -56], [-14, -56], [-14, -50]], 3, 3); taper([[-44, -38], [-4, -38]], 2, 2, CUT);
    });
  }

  // ===================================== SHOT 3: the lid, the mouth, the harmonica (146 - 152.9) =====================================
  // lid timeline: [time, angle]; between keys it moves (slow open first, then quick slams on beats)
  const OPEN = 1.35;                       // portrait: the lid swings right up, a tall black wall behind the mouth
  const LID = [[146.0, 0], [147.6, OPEN], [148.78, OPEN], [148.93, 0], [149.35, 0], [149.47, OPEN], [149.88, OPEN], [150.0, 0], [150.95, 0], [151.07, OPEN]];
  const lidAt = (t) => { for (let i = 1; i < LID.length; i++) if (t < LID[i][0]) { const [a, va] = LID[i - 1], [b, vb] = LID[i]; const u = (t - a) / (b - a); return lerp(va, vb, i === 1 ? ease.inOut(u) : vb < va ? ease.in(u) : ease.out(u)); } return OPEN; };
  const playing = (t) => (t >= 147.4 && t < 148.4) || (t >= 149.47 && t < 150.0) || t >= 151.07;
  function mouthInterior(t) {
    return (P, sc) => {
      const c = P(.5, HC, .21), ms = sc / 1180;          // portrait: the mouth scales with the (smaller) piano
      // the dark throat, the lips, teeth, the harmonica
      const tt = onTwos(t, 12), on = playing(t);
      const shift = on ? Math.sin(tt * 7) * 60 : 0, pucker = on ? .9 + .1 * Math.sin(tt * 11) : 1;
      shape(() => { s.beginPath(); s.rect(c[0] - 900, c[1] - 400, 1800, 800); }, INK);
      clipTo(() => { s.beginPath(); s.rect(c[0] - 900, c[1] - 400, 1800, 800); }, () => rows(c[0] - 900, c[1] - 400, c[0] + 900, c[1] + 400, .1, 30, () => 1.2, CUT));
      withT(() => { s.translate(c[0], c[1]); s.scale(pucker * ms, ms);
        const upper = () => { s.beginPath(); s.moveTo(-430, 0); s.bezierCurveTo(-300, -120, -120, -150, -40, -110); s.quadraticCurveTo(0, -96, 40, -110); s.bezierCurveTo(120, -150, 300, -120, 430, 0); s.bezierCurveTo(260, -40, 120, -50, 0, -40); s.bezierCurveTo(-120, -50, -260, -40, -430, 0); s.closePath(); };
        const lower = () => { s.beginPath(); s.moveTo(-430, 0); s.bezierCurveTo(-260, 50, -120, 50, 0, 46); s.bezierCurveTo(120, 50, 260, 50, 430, 0); s.bezierCurveTo(300, 120, 120, 150, 0, 150); s.bezierCurveTo(-120, 150, -300, 120, -430, 0); s.closePath(); };
        // the harmonica between the lips
        const hx = shift;
        const hb = () => pathOf([[hx - 270, -36], [hx + 270, -36], [hx + 270, 40], [hx - 270, 40]]);
        shape(hb, CUT, 7); clipTo(hb, () => { rows(hx - 270, -36, hx + 270, 40, Math.PI / 2, 9, () => 1.4); });
        shape(() => { s.beginPath(); s.rect(hx - 270, -6, 540, 18); }, INK);
        for (let i = 0; i < 10; i++) shape(() => { s.beginPath(); s.rect(hx - 240 + i * 50, -2, 26, 10); }, CUT);
        shape(upper, CUT, 7); clipTo(upper, () => rows(-430, -150, 430, 0, Math.PI / 2 + .2, 12, (u) => u < .35 ? 3 : 0));
        shape(lower, CUT, 7); clipTo(lower, () => rows(-430, 0, 430, 150, Math.PI / 2 - .2, 12, (u) => u > .55 ? (u - .55) * 7 : 0));
        // lip creases
        for (let i = -3; i <= 3; i++) { taper([[i * 60, -100 + Math.abs(i) * 6], [i * 64, -64 + Math.abs(i) * 4]], 2.5, 1); taper([[i * 60, 70], [i * 64, 120 - Math.abs(i) * 6]], 2.5, 1); }
        if (!on) { taper([[-430, 0], [-470, 24]], 8, 3); taper([[430, 0], [470, 24]], 8, 3); }   // stopped: corners turn down
      });
    };
  }
  // portrait staging: the piano fills the width a third of the way down, its open lid towering into the sky; Ellen big
  // on the stool in the foreground at the keyboard end, her pointing hand right under the near rim where the lid is
  const S3 = { ox: 110, oy: 1080, sc: 940, hz: 1200, ex: 200, ey: 1600, k: 1.15 };
  // camera: close on Ellen at the shut piano; tilt up and pull back as the lid opens on the mouth; push in on the mouth
  // through the slams; pull back up after the notes as they climb the sky while she shrugs
  const CAM3 = [[146.0, [1.3, 330, 1250]], [146.3, [1.3, 330, 1250]], [147.6, [1.0, 540, 960]], [148.85, [1.1, 560, 1000]],
    [150.95, [1.14, 560, 1020]], [151.3, [1.1, 560, 960]], [152.9, [1.0, 540, 700]]];
  function stool(sx, sy, k) {
    withT(() => { s.translate(sx, sy); s.scale(k, k);
      for (const d of [-60, 60]) taper([[d, -150], [d * 1.2, 0]], 16, 10);
      taper([[-66, -70], [66, -70]], 8, 8);
      shape(() => { s.beginPath(); s.ellipse(0, -160, 95, 26, 0, 0, TAU); }, INK); shape(() => { s.beginPath(); s.ellipse(0, -170, 90, 22, 0, 0, TAU); }, CUT, 5);
      clipTo(() => { s.beginPath(); s.ellipse(0, -170, 90, 22, 0, 0, TAU); }, () => rows(-90, -192, 90, -148, .4, 10, () => 2)); });
  }
  function shot3(t) {
    const [ck, ccx, ccy] = kf(t, CAM3);
    const jolt = hit(t, 148.93, 9) * Math.sin((t - 148.93) * 44) * 16 + hit(t, 150.0, 9) * Math.sin((t - 150.0) * 44) * 16;   // the slams shake the frame
    withT(() => { cam(ck, ccx, ccy, 0, jolt); shot3World(t); });
  }
  function shot3World(t) {
    sky(t, S3.hz, 21); ground(t, S3.hz, 23);
    const a = lidAt(t);
    const pp = piano(S3.ox, S3.oy, S3.sc, a, { interior: mouthInterior(t), prop: true });
    // notes puffing out while it plays: they climb the whole tall sky
    if (playing(t) && a > .4) {
      const tt = onTwos(t, 12), t0 = t >= 151.07 ? 151.07 : t >= 149.47 ? 149.47 : 147.4;
      for (let i = 0; i < 12; i++) { const ph = (tt - t0) * 1.1 - i * .1; if (ph < 0 || ph > 1.4) continue;
        const c = pp.P(.25 + (i % 5) * .14, HC, .2); noteGlyph(c[0] + Math.sin(i * 2.1 + ph * 3) * 60, c[1] - 80 - ph * 820, 1.5 + .5 * hash(i), i, CUT); }
    }
    // slams: cut lines bursting out along the rim when the lid comes down
    for (const ts of [148.93, 150.0]) { const k = hit(t, ts, 8); if (k > .08) { for (let j = 0; j < 9; j++) { const p = pp.P(.1 + j * .1, HC, PLAN_Z(.1 + j * .1)); taper([[p[0], p[1] + 10], [p[0] + (j - 4) * 14 * k, p[1] + 30 + 90 * k]], 7 * k, 1); }
      for (let j = 0; j < 7; j++) { const p = pp.P(.15 + j * .13, HC + .02, 0); taper([[p[0], p[1] - 10], [p[0] + (j - 3) * 18 * k, p[1] - 40 - 110 * k]], 7 * k, 1); } } }
    // a Victorian piano stool by the keyboard, for Ellen to stand on
    stool(S3.ex, S3.ey + 205, 1.25);
    const ex = S3.ex, ey = S3.ey, k = S3.k;
    let pose = 'stand', eyes = 'open', lean = 0, facing = 1, smile = 0;
    if (t < 146.6) { pose = 'stand'; }
    else if (t < 148.6) { pose = 'stand'; lean = t > 147.8 ? .22 : 0; eyes = t > 148.4 ? 'brow' : 'open'; }
    else if (t < 148.95) { pose = 'point'; }                                // reaches for the prop: slam
    else if (t < 149.3) { pose = 'stand'; eyes = 'brow'; }
    else if (t < 149.6) { pose = 'point'; }                                 // lifts it: harmonica
    else if (t < 149.9) { pose = 'stand'; eyes = 'roll'; }
    else if (t < 150.05) { pose = 'point'; }                                // slams it: silence
    else if (t < 150.9) { pose = 'stand'; lean = .12; eyes = 'brow'; }      // listens to nothing
    else if (t < 151.2) { pose = 'point'; }                                 // opens it again: harmonica
    else { pose = 'stand'; eyes = 'roll'; smile = .3; facing = t > 152.2 ? -1 : 1; }   // shrug; leaves it open
    withT(() => { s.translate(ex, ey); s.rotate(lean); ellen(0, 0, k, { pose, t: onTwos(t, 12), eyes, smile, facing }); });
    // the shrug: shoulders hitch on the beat 151.60, two little carved lifts by her shoulders
    if (t > 151.55 && t < 152.3) { const u = hit(t, 151.6, 5); for (const sd of [-1, 1]) { taper([[ex + sd * 60 * k, ey - 420 * k], [ex + sd * 95 * k, ey - 470 * k - 30 * u]], 7, 2); taper([[ex + sd * 85 * k, ey - 400 * k], [ex + sd * 125 * k, ey - 440 * k - 30 * u]], 7, 2); } }
  }
  // near-edge Z of the plan at X (for the slam marks)
  function PLAN_Z(X) { for (let i = 5; i < PLAN.length; i++) { const [x1, z1] = PLAN[i - 1], [x2, z2] = PLAN[i]; if (X <= x1 && X >= x2) return lerp(z1, z2, (x1 - X) / (x1 - x2)); } return .42; }

  chapter('p4', 112.0, 152.9, [
    [112.0, shot1],
    [140.0, shot2],
    [146.0, shot3],
  ]);
})();

// c01 · VERSE 1 (SEC.v1 - 37.7, 26.04 - 37.7) · painter A.
// Inside a Nouveau night tram rattling through the rain: stained-glass clerestory, brass rails, leather
// straps, swaying Galle lamps. Cues (vocal-stem onsets): "sane" 26.4 / 27.45 the car lurches and the lamps
// come on; "insane" 28.2-30.4 straps and lamps swing wildly together; "blind" 30.4-32.15 dark spectacles left
// on a seat, the light dies on the word; "lame" 32.15-33.75 the conductor's empty booth, cap on a hook,
// swinging lantern, the cane slips and clatters (33.47); "jacket" 33.75-35.75 a checked jacket swinging on a
// hook; "hard luck" 35.75-37.7 an upside-down horseshoe over the door slips and spins away, then we push
// through the door's rain-streaked window into c02's first frame (plum wall, amber arch, halo). No hands.
(() => {
  const DARK = '#17110e', WOOD = '#7a5530', BRASS = C.gold;
  function screen(g, fn) { g.save(); g.setTransform(.5, 0, 0, .5, 0, 0); fn(); g.restore(); }
  function veil(a) {
    if (a <= .003) return;
    screen(s, () => { s.fillStyle = `rgba(16,13,20,${clamp(a)})`; s.fillRect(-10, -10, W + 20, H + 20); });
    screen(f, () => { f.globalCompositeOperation = 'source-over'; f.fillStyle = `rgba(0,0,0,${clamp(a)})`; f.fillRect(-10, -10, W + 20, H + 20); });
  }
  const arch = (x, y, w, h, n = 24) => [[x, y + h], ...circle(x + w / 2, y + w / 2, w / 2, n * 2).filter(([, py]) => py <= y + w / 2 + .1).sort((p, q) => p[0] - q[0]), [x + w, y + h]];
  // an outlined stroke (umber under colour) so thin brass and leather survive the brushstrokes
  function rod(pts, w, col, ex = 9) { line(pts, C.umber, w + ex); line(pts, col, w); }
  // ---- the car's motion: one swing for everything that hangs ----
  // a steady rock on the beat (extremes on the beats), the "sane" lurches, the "insane" frenzy, the "jacket" lurch
  const JOLTS = [[26.4, .3], [27.45, .3], [33.47, .14], [34.97, .26]];
  function swing(t) {
    const A = .1 + kf(t, [[28.15, 0], [28.55, .6], [29.6, .62], [30.5, .1]], (x) => x);
    let th = A * Math.cos(Math.PI * (t - 28.43) / .5);
    for (const [k, a] of JOLTS) th += a * hit(t, k, 2.6) * Math.sin(TAU * (t - k) / 1.0);
    return th;
  }
  const rock = (t) => -.1 * swing(t) + .004 * Math.sin(t * 41) + .003 * snoise(t * 6, 3);
  const shake = (t) => 3 * Math.sin(t * 47) + 2 * snoise(t * 9, 8);
  // the street lamps passing outside, as a 0..1 sweep for window position x
  const pass = (t, ph) => Math.pow(Math.max(0, Math.sin(t * 6.5 + ph)), 6);
  // dark glass with the city sliding by and rain running down it; pts is the pane outline, (x0..x1, y0..y1) its box
  function wetGlass(pts, x0, y0, x1, y1, t, seed, k = 1) {
    shape(s, pts, C.night, C.umber, 18);
    s.save(); P(s, pts); s.closePath(); s.clip();
    const w = x1 - x0, h = y1 - y0;
    for (let i = 0; i < 4; i++) { const u = (t * .55 + i / 4 + hash(seed + i)) % 1, bx = lerp(x1 + w * .4, x0 - w * .9, u); shape(s, [[bx, y1], [bx, y0 + h * (.35 + .3 * hash(seed * 3 + i))], [bx + w * .5, y0 + h * (.35 + .3 * hash(seed * 3 + i))], [bx + w * .5, y1]], C.dusk, null); }
    s.restore();
    f.save(); P(f, pts); f.closePath(); f.clip();
    for (let i = 0; i < 2; i++) { const u = (t * 1.1 + i / 2 + hash(seed + 9 + i)) % 1; glowAt(lerp(x1 + w * .3, x0 - w * .3, u), y0 + h * (.3 + .25 * i), Math.max(w, h) * .45, `rgba(255,190,110,${.5 * k})`); }
    f.globalCompositeOperation = 'lighter'; f.lineCap = 'round';
    const r = rng(seed);
    for (let i = 0; i < 12; i++) { const x = lerp(x0, x1, r()), sp = .25 + r() * .5, v = (r() + t * sp) % 1, y = lerp(y0 - 40, y1 + 40, v), L = h * (.06 + r() * .12);
      f.strokeStyle = `rgba(210,225,255,${.4 * k})`; f.lineWidth = Math.max(3, w * .006 + r() * 3); f.beginPath(); f.moveTo(x, y); f.lineTo(x - L * .3, y - L); f.stroke(); }
    f.restore();
  }

  // ================= the car in perspective (shots 1 - 2) =================
  const VX = 540, VY = 760, FOC = 640, ZF = 5;
  function car(t, cz, lamp, o = {}) {
    const th = swing(t), K = (Z) => FOC / Math.max(.08, Z - cz + 1), pj = (X, Y, Z) => { const k = K(Z); return [VX + X * k, VY + Y * k]; };
    const LW = (Z, b = 26) => clamp(b * K(Z) / FOC, 10, b * 1.6);
    const zn = cz - .55, quad = (a, b, c, d) => [a, b, c, d];
    // far end: a panelled wall with the door, its window, and the horseshoe over it
    s.fillStyle = DARK; s.fillRect(-W, -H, W * 3, H * 3);
    shape(s, quad(pj(-1, -1, ZF), pj(1, -1, ZF), pj(1, 1.25, ZF), pj(-1, 1.25, ZF)), C.ochre, C.umber, 12);
    shape(s, quad(pj(-.36, -.58, ZF), pj(.36, -.58, ZF), pj(.36, 1.25, ZF), pj(-.36, 1.25, ZF)), C.olive, C.umber, 12);
    wetGlass(arch(...pj(-.26, -.5, ZF), K(ZF) * .52, K(ZF) * .7, 10), ...pj(-.26, -.5, ZF), ...pj(.26, .2, ZF), t, 41, .6);
    { const [hx, hy] = pj(0, -.74, ZF), r = K(ZF) * .08; s.lineCap = 'round'; for (const [c, w] of [[C.umber, 14], [C.ochre, 7]]) { s.strokeStyle = c; s.lineWidth = w; s.beginPath(); s.arc(hx, hy, r, Math.PI * .85, Math.PI * 2.15); s.stroke(); } }
    // ceiling with ribs, floor with a ruby runner
    shape(s, quad(pj(-1, -1, zn), pj(1, -1, zn), pj(1, -1, ZF), pj(-1, -1, ZF)), '#b9a37a', C.umber, 14);
    for (let Z = Math.ceil(zn); Z < ZF; Z += .5) line([pj(-1, -1, Z), pj(-.4, -1.02, Z), pj(.4, -1.02, Z), pj(1, -1, Z)], '#b89c6c', LW(Z, 18));
    line([pj(0, -1, zn), pj(0, -1, ZF)], C.ochre, 18);
    shape(s, quad(pj(-1, 1.25, zn), pj(1, 1.25, zn), pj(1, 1.25, ZF), pj(-1, 1.25, ZF)), '#5e4128', C.umber, 14);
    shape(s, quad(pj(-.32, 1.25, zn), pj(.32, 1.25, zn), pj(.32, 1.25, ZF), pj(-.32, 1.25, ZF)), C.ruby, C.umber, 14);
    for (const X of [-.24, .24]) line([pj(X, 1.25, zn), pj(X, 1.25, ZF)], C.gold, 14);
    // walls, segment by segment, far to near: clerestory glass, windows on the night, wainscot, benches
    for (let Z = ZF - 1; Z >= Math.floor(zn); Z -= 1) for (const sx of [-1, 1]) {
      const z0 = Math.max(Z, zn), z1 = Z + 1; if (z1 <= zn) continue;
      const X = sx, wall = (y0, y1, a, b, col, lw = 12) => shape(s, quad(pj(X, y0, a), pj(X, y0, b), pj(X, y1, b), pj(X, y1, a)), col, C.umber, lw);
      wall(-1, .6, z0, z1, C.teal, LW(Z, 14));
      // clerestory: a stained-glass pane per bay, lit from within
      if (Z + .2 > zn) { const pa = Z + .18, pb = Z + .82, cols = [C.amber, C.rose, C.sage, C.gold], col = cols[(Z + 8 + (sx > 0 ? 2 : 0)) % 4];
        wall(-.98, -.74, pa, pb, col, LW(Z, 14)); line([pj(X, -.86, pa), pj(X, -.86, pb)], C.umber, LW(Z, 10));
        const [gx, gy] = pj(X, -.86, (pa + pb) / 2); glowAt(gx, gy, K(Z) * .35, `rgba(255,${190 + 30 * (Z % 2)},130,${(.18 + .25 * pass(t, Z * 1.3 + sx)) * lamp})`); }
      // the side window
      if (Z + .12 > zn) { const pa = Math.max(zn, Z + .1), pb = Z + .9, pts = quad(pj(X, -.62, pa), pj(X, -.62, pb), pj(X, .2, pb), pj(X, .2, pa)), xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
        wetGlass(pts, Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), t + Z * .21, 50 + Z * 7 + (sx > 0 ? 3 : 0), .8); }
      wall(.2, .6, z0, z1, WOOD, LW(Z, 14));
      // the bench: velvet top, wood front
      shape(s, quad(pj(X, .6, z0), pj(X, .6, z1), pj(X * .72, .6, z1), pj(X * .72, .6, z0)), C.rose, C.umber, LW(Z, 14));
      shape(s, quad(pj(X * .72, .6, z0), pj(X * .72, .6, z1), pj(X * .72, 1.25, z1), pj(X * .72, 1.25, z0)), C.ochre, C.umber, LW(Z, 14));
      if (o.specs && Z === 1 && sx < 0) { for (const dz of [.38, .62]) { const [ex, ey] = pj(-.86, .6, Z + dz); s.fillStyle = C.night; s.beginPath(); s.ellipse(ex, ey, K(Z) * .05, K(Z) * .02, 0, 0, TAU); s.fill(); } }
    }
    // the window light sweeping over the floor as the street lamps pass
    for (let Z = Math.ceil(zn); Z < ZF; Z++) { const [gx, gy] = pj(-.3, 1.2, Z + .5); glowAt(gx, gy, K(Z) * .6, `rgba(255,190,110,${.12 * pass(t, Z * 1.3 - 1)})`); const [hx, hy] = pj(.3, 1.2, Z + .5); glowAt(hx, hy, K(Z) * .6, `rgba(255,190,110,${.12 * pass(t, Z * 1.3 + 1)})`); }
    // brass: rails along both sides, poles at the bench ends
    for (const sx of [-1, 1]) {
      const pts = [...Array(16)].map((_, i) => pj(sx * .6, -.84, lerp(zn, ZF, i / 15)));
      vine(s, pts, LW(zn, 30), LW(ZF, 30), BRASS);
      for (const Z of [2, 4]) if (Z > zn + .2) rod([pj(sx * .7, .6, Z), pj(sx * .64, -.84, Z)], LW(Z, 16), BRASS);
    }
    // the hanging things, far to near: leather straps on the rails, Galle lamps down the middle
    const items = [];
    for (let Z = ZF - .5; Z > zn + .15; Z -= .65) for (const sx of [-1, 1]) items.push(['strap', Z, sx]);
    for (const Z of [1.2, 3.1, 4.8]) if (Z > zn + .2) items.push(['lamp', Z, 0]);
    items.sort((a, b) => b[1] - a[1]);
    for (const [kind, Z, sx] of items) {
      const k = K(Z), lw = LW(Z, 18);
      if (kind === 'strap') {
        const a = th * (1 + .08 * Math.sin(Z * 3.1)), L = .34, [x0, y0] = pj(sx * .6, -.84, Z), x1 = x0 + Math.sin(a) * L * k, y1 = y0 + Math.cos(a) * L * k;
        rod([[x0, y0], [x1, y1]], lw * .9, '#8a5a30');
        const rr = .065 * k, cx = x1 + Math.sin(a) * rr, cy = y1 + Math.cos(a) * rr;
        s.lineWidth = lw + 9; s.strokeStyle = C.umber; s.beginPath(); s.arc(cx, cy, rr, 0, TAU); s.stroke();
        s.lineWidth = lw * .8; s.strokeStyle = '#a06a38'; s.beginPath(); s.arc(cx, cy, rr, 0, TAU); s.stroke();
      } else {
        const a = th * .75, [x0, y0] = pj(0, -1, Z), L = .2 * k, bx = x0 + Math.sin(a) * L, by = y0 + Math.cos(a) * L;
        rod([[x0, y0], [bx, by]], lw * .6, BRASS);
        const R = (px, py) => [bx + (px * Math.cos(a) + py * Math.sin(a)) * k, by + (-px * Math.sin(a) + py * Math.cos(a)) * k];
        const bell = [...cub([-.02, 0], [-.05, .02], [-.13, .05], [-.14, .14], 10), ...cub([.14, .14], [.13, .05], [.05, .02], [.02, 0], 10)].map(([p, q]) => R(p, q));
        shape(s, bell, lamp > .5 ? C.amber : C.ochre, C.umber, lw);
        for (const px of [-.07, 0, .07]) line([R(px * .3, .01), R(px, .14)], C.rose, Math.max(8, lw * .5));
        const [gx, gy] = R(0, .16);
        if (lamp > 0) { glowAt(gx, gy, k * .62, `rgba(255,190,110,${.4 * lamp})`); glowAt(gx, gy, k * .14, `rgba(255,240,200,${.9 * lamp})`); }
      }
    }
  }
  const lampOn = (t) => t < 26.4 ? .12 + .1 * (hash(Math.floor(t * 12)) > .7) : clamp(.75 + .25 * hit(t, 26.4, 4) + .25 * hit(t, 27.45, 4) - .35 * (hash(Math.floor(t * 14) * 3) > .9 ? 1 : 0));
  // 26.04: down the aisle out of the dark; the lamps snap on with the first "sane", the car lurches on both
  function aisle(t, lt, dur) {
    cam(540, 960 + shake(t), kf(lt, [[0, 1.0], [dur, 1.06]]), rock(t));
    car(t, kf(lt, [[0, -.45], [dur, .35]], (x) => x), lampOn(t));
    veil(kf(t, [[26.04, .85], [26.36, .55], [26.42, 0]], (x) => x));
    border(t, 1);
  }
  // 28.2: up among the straps and lamps, everything swinging together, wildly, the car rocking crazy
  function insane(t, lt, dur) {
    const fl = .7 + .3 * (hash(Math.floor(t * 16)) > .3 ? 1 : 0);
    cam(540 + 30 * swing(t), 700 + shake(t) * 2, kf(lt, [[0, 1.3], [dur, 1.42]]), rock(t) * 2.2);
    car(t, kf(lt, [[0, .6], [dur, 1.5]], (x) => x), fl);
    border(t, 1);
  }

  // ================= close-ups (shots 3 - 5) =================
  // 30.4: dark round spectacles left on the velvet seat; passing light glints in them until "blind" (31.5)
  function specs(t, lt, dur) {
    const th = swing(t), blind = inv(31.42, 31.56, t) * (1 - .5 * inv(31.95, 32.1, t));
    cam(kf(lt, [[0, 520], [dur, 545]]), kf(lt, [[0, 1200], [dur, 1340]]) + shake(t), kf(lt, [[0, 1.12], [dur, 1.42]]), rock(t) * .7);
    s.fillStyle = C.teal; s.fillRect(-W, -H, W * 3, H * 3);
    // the window behind the seat
    shape(s, [[40, 80], [1040, 80], [1040, 820], [40, 820]], WOOD, C.umber, 20);
    wetGlass([[90, 130], [990, 130], [990, 770], [90, 770]], 90, 130, 990, 770, t, 71, 1 - blind * .8);
    line([[540, 130], [540, 770]], WOOD, 26); line([[540, 130], [540, 770]], C.umber, 10);
    // the carved backrest
    shape(s, [[-100, 820], [1180, 820], [1180, 1150], [-100, 1150]], C.ochre, C.umber, 20);
    for (const sx of [1, -1]) { const x0 = 540 - sx * 40; vine(s, whip([x0, 1110], [x0 - sx * 160, 1100], [x0 - sx * 300, 900], [x0 - sx * 420, 960], .9, -sx, 40), 20, 10, WOOD); }
    shape(s, circle(540, 985, 50, 30), C.gold, C.umber, 14);
    // the velvet seat, tufted
    shape(s, [[-100, 1150], [1180, 1150], [1300, 1760], [-220, 1760]], C.rose, C.umber, 20);
    for (let i = -6; i <= 6; i++) { line([[540 + i * 150, 1150], [540 + i * 190 + 190, 1760]], '#a8675c', 12); line([[540 + i * 150, 1150], [540 + i * 190 - 190, 1760]], '#a8675c', 12); }
    for (let j = 0; j < 4; j++) for (let i = -6; i <= 6; i++) { const y = lerp(1150, 1760, (j + .5) / 4), x = 540 + (i + (j % 2 ? .5 : 0)) * lerp(150, 190, (j + .5) / 4); dot(x, y, 11, C.umber); }
    shape(s, [[-220, 1760], [1300, 1760], [1300, 2200], [-220, 2200]], C.ochre, C.umber, 20);
    // the spectacles, sliding a little with the car
    const ox = 540 + 26 * th, oy = 1400, L = [ox - 135, oy], R = [ox + 135, oy];
    for (const [x, y] of [L, R]) { s.fillStyle = 'rgba(70,30,50,.55)'; s.beginPath(); s.ellipse(x + 24, y + 36, 125, 82, 0, 0, TAU); s.fill(); }
    rod([[L[0] - 108, oy - 26], [ox + 120, oy - 96], [ox + 170, oy - 84]], 12, BRASS);
    rod([[R[0] + 108, oy - 26], [ox - 120, oy - 104], [ox - 170, oy - 92]], 12, BRASS);
    for (const [x, y] of [L, R]) { s.fillStyle = rgrad(x - 30, y - 20, 10, 130, [[0, '#2a3550'], [1, '#121826']]); s.beginPath(); s.ellipse(x, y, 112, 78, 0, 0, TAU); s.fill();
      for (const [c, w] of [[C.umber, 30], [BRASS, 13]]) { s.lineWidth = w; s.strokeStyle = c; s.beginPath(); s.ellipse(x, y, 112, 78, 0, 0, TAU); s.stroke(); } }
    rod(cub([L[0] + 100, oy - 24], [ox - 20, oy - 70], [ox + 20, oy - 70], [R[0] - 100, oy - 24], 12), 13, BRASS);
    // glints: the passing lamps in the lenses (die on "blind")
    const sw = pass(t, 0) * (1 - blind);
    for (const [x, y] of [L, R]) { f.save(); f.globalCompositeOperation = 'lighter'; f.lineCap = 'round'; f.strokeStyle = `rgba(255,236,200,${.25 + .7 * sw})`; f.lineWidth = 10; f.beginPath(); f.ellipse(x, y, 82, 52, 0, Math.PI * 1.1, Math.PI * 1.45); f.stroke(); f.restore();
      glowAt(x - 50, y - 30, 70 + 60 * sw, `rgba(255,220,170,${(.2 + .6 * sw) * (1 - blind)})`); }
    glowAt(540, 1300, 700, `rgba(255,190,110,${.16 * (1 - blind)})`);
    veil(.55 * blind);
    border(t, 1);
  }
  // 32.15: the conductor's empty booth: his cap on a hook, the cane leaning, a lantern swinging; the cane
  // slips on "lame" and clatters down (33.47)
  function booth(t, lt, dur) {
    const th = swing(t);
    cam(kf(lt, [[0, 520], [dur, 600]]), 1000 + shake(t), kf(lt, [[0, 1.04], [dur, 1.16]]), rock(t) * .6);
    s.fillStyle = C.teal; s.fillRect(-W, -H, W * 3, H * 3);
    // panelled wood booth, the front window on the right
    shape(s, [[-200, -300], [640, -300], [640, 1760], [-200, 1760]], C.ochre, C.umber, 20);
    for (const [x, y, w, h] of [[-120, 120, 640, 560], [-120, 760, 640, 360], [-120, 1180, 640, 520]]) shape(s, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], '#94693a', C.umber, 16);
    vine(s, whip([-100, 300], [80, 160], [300, 300], [420, 180], .8, 1, 40), 18, 10, WOOD);
    shape(s, [[640, -300], [1300, -300], [1300, 1760], [640, 1760]], WOOD, C.umber, 20);
    wetGlass(arch(690, 120, 420, 760, 24), 690, 120, 1110, 880, t, 83, 1);
    shape(s, [[-200, 1760], [1300, 1760], [1300, 2300], [-200, 2300]], '#5e4128', C.umber, 18);
    for (let x = -200; x < 1300; x += 170) line([[x, 1760], [x - 120, 2300]], C.umber, 12);
    // the hook rail
    rod([[60, 380], [1020, 380]], 20, BRASS);
    for (const hx of [330, 830]) rod([[hx, 380], [hx, 430], [hx + 26, 446]], 14, BRASS);
    // the cap, hung by its band: crown, gold piping (no badge), visor
    withT(() => { s.translate(330, 420); s.rotate(-.12 + th * .3);
      shape(s, [[-168, 70], ...cub([-168, 70], [-150, 120], [-120, 140], [-112, 160], 10), [112, 160], ...cub([112, 160], [120, 140], [150, 120], [168, 70], 10)], '#2a3550', C.umber, 20);
      s.fillStyle = '#34416a'; s.beginPath(); s.ellipse(0, 66, 170, 52, 0, 0, TAU); s.fill(); s.lineWidth = 20; s.strokeStyle = C.umber; s.stroke();
      shape(s, [[-114, 152], [114, 152], [112, 204], [-112, 204]], '#1e2433', C.umber, 16);
      line([[-108, 160], [108, 160]], BRASS, 10);
      shape(s, [...cub([-118, 200], [-90, 268], [90, 268], [118, 200], 16), ...cub([118, 200], [60, 226], [-60, 226], [-118, 200], 16)], C.night, C.umber, 18);
      line(cub([-80, 228], [-40, 246], [20, 248], [60, 236], 8), '#4a5a80', 10);
      for (const x of [-100, 100]) dot(x, 178, 13, BRASS);
      shape(s, blobPts(0, 112, 34, 24, 2, .03, 24), BRASS, C.umber, 12); });
    // the cane: leaning, then slipping on "lame" and clattering to the floor
    const fall = ease.in(inv(33.0, 33.47, t)), bounce = .07 * hit(t, 33.47, 7) * Math.abs(Math.sin((t - 33.47) * 22));
    const al = .26 + fall * 1.02 - bounce, foot = [240 - 60 * fall, 1760], Lc = 820, top = [foot[0] + Math.sin(al) * Lc, foot[1] - Math.cos(al) * Lc];
    const dx = Math.sin(al), dy = -Math.cos(al), nx = Math.cos(al), ny = Math.sin(al);
    rod([foot, top], 22, '#8a5a32');
    rod([top, ...cub(top, [top[0] + dx * 70, top[1] + dy * 70], [top[0] + dx * 70 + nx * 130, top[1] + dy * 70 + ny * 130], [top[0] + nx * 130 - dx * 50, top[1] + ny * 130 - dy * 50], 14)], 22, '#8a5a32');
    rod([[foot[0] + dx * 10, foot[1] + dy * 10], [foot[0] + dx * 60, foot[1] + dy * 60]], 24, BRASS, 6);
    if (t > 33.47) glowAt(top[0], top[1] + 20, 120, `rgba(255,220,160,${.4 * hit(t, 33.47, 6)})`);
    // the lantern, swinging on its bail in front of the window
    withT(() => { s.translate(856, 446); const a = th * 1.25 + .1 * hit(t, 33.47, 5) * Math.sin((t - 33.47) * 14); s.rotate(a);
      rod(cub([-50, 110], [-50, 10], [50, 10], [50, 110], 14), 10, BRASS);
      shape(s, [[0, 60], [-80, 130], [80, 130]], BRASS, C.umber, 14);
      shape(s, [[-70, 130], [70, 130], [70, 330], [-70, 330]], C.amber, C.umber, 18);
      for (const x of [-24, 24]) line([[x, 134], [x, 326]], C.umber, 12);
      shape(s, [[-84, 330], [84, 330], [64, 372], [-64, 372]], BRASS, C.umber, 14);
      const fl = .85 + .15 * snoise(t * 11, 4); f.save(); f.translate(856, 446); f.rotate(a); glowAt(0, 230, 360, `rgba(255,170,80,${.5 * fl})`); glowAt(0, 230, 80, `rgba(255,240,200,${.9 * fl})`); f.restore(); });
    border(t, 1);
  }
  // 33.75: a loud checked jacket on a hook, empty, swinging with the car; it lurches on "jacket" (34.97)
  function jacket(t, lt, dur) {
    const th = swing(t);
    cam(kf(lt, [[0, 520], [dur, 560]]), kf(lt, [[0, 980], [dur, 920]]) + shake(t), kf(lt, [[0, 1.0], [dur, 1.12]]), rock(t) * .7);
    s.fillStyle = C.teal; s.fillRect(-W, -H, W * 3, H * 3);
    shape(s, [[-200, -300], [1300, -300], [1300, 1240], [-200, 1240]], C.teal, C.umber, 18);
    for (const x of [-60, 1000]) vine(s, whip([x, 1200], [x + 80, 900], [x - 60, 600], [x + 40, 380], .8, x < 0 ? 1 : -1, 40), 20, 10, C.sage);
    wetGlass(arch(830, 160, 300, 700, 20), 830, 160, 1130, 860, t, 97, 1);
    shape(s, [[-200, 1240], [1300, 1240], [1300, 2300], [-200, 2300]], C.ochre, C.umber, 20);
    for (const x of [-120, 280, 680]) shape(s, [[x, 1320], [x + 340, 1320], [x + 340, 1880], [x, 1880]], '#94693a', C.umber, 16);
    shape(s, blobPts(480, 330, 56, 40, 3, .02, 30), BRASS, C.umber, 14);
    const a = th * .95, hook = [480, 360];
    // its swinging shadow on the wall
    s.save(); s.translate(hook[0] + 46, hook[1] + 34); s.rotate(a * .9); s.fillStyle = 'rgba(28,52,51,.6)'; P(s, [[-60, 40], [-250, 150], [-300, 300], [-310, 830], [-250, 960], [250, 960], [310, 830], [300, 300], [250, 150], [60, 40]]); s.closePath(); s.fill(); s.restore();
    withT(() => { s.translate(...hook); s.rotate(a);
      rod([[0, -10], [0, 40], [16, 52]], 14, BRASS);
      const body = [[-60, 40], [-240, 150], [-262, 300], [-252, 950], [-20, 980], [20, 980], [252, 950], [262, 300], [240, 150], [60, 40]];
      const sleeve = (d) => [[d * 236, 150], [d * 292, 300], [d * 304, 830], [d * 196, 840], [d * 190, 310]];
      const check = (pts) => { shape(s, pts, C.gold, null); s.save(); P(s, pts); s.closePath(); s.clip(); for (let x = -340; x <= 340; x += 84) line([[x, 0], [x, 1000]], C.ruby, 14); for (let y = 60; y <= 1000; y += 84) line([[-340, y], [340, y]], C.deep, 12); s.restore(); shape(s, pts, null, C.umber, 20); };
      check(body);
      // the hollow inside: lining shows between the lapels, nothing in it
      shape(s, [[-60, 40], [60, 40], [0, 560]], C.plum, C.umber, 16);
      shape(s, [[-60, 40], [-150, 150], [-120, 330], [-6, 560], [-40, 300]], '#d9b25a', C.umber, 16);
      shape(s, [[60, 40], [150, 150], [120, 330], [6, 560], [40, 300]], '#d9b25a', C.umber, 16);
      line([[0, 560], [0, 950], [-30, 980]], C.umber, 14);
      for (const y of [640, 760]) dot(16, y, 16, C.umber);
      for (const d of [-1, 1]) { shape(s, [[d * 70, 700], [d * 200, 700], [d * 200, 744], [d * 70, 744]], C.ochre, C.umber, 14); check(sleeve(d)); shape(s, [[d * 304, 790], [d * 196, 798], [d * 196, 840], [d * 304, 830]], C.ochre, C.umber, 14); } });
    glowAt(480, 700, 600, 'rgba(255,190,110,.12)');
    border(t, 1);
  }

  // ================= the door and the push through its window (shot 6) =================
  // c02's first frame, drawn exactly as it opens (cam(540, 900, 1.0)): night sky, halo, plum wall, amber arch,
  // sill, the Galle bottle, the tendrils at .35
  function tenement(t, rainA) {
    s.fillStyle = C.night; s.fillRect(-W, -H, W * 3, H * 3);
    halo(540, 520, 360, t * .05);
    shape(s, [[-200, 900], [1280, 900], [1280, 2400], [-200, 2400]], C.plum, null);
    const wx = 230, wy = 640, ww = 620, wh = 820;
    shape(s, [[wx, wy + wh], [wx, wy + ww / 2], ...circle(wx + ww / 2, wy + ww / 2, ww / 2).filter(([, py]) => py <= wy + ww / 2 + .1).sort((a, b) => a[0] - b[0]), [wx + ww, wy + ww / 2], [wx + ww, wy + wh]], C.amber, C.umber, 24);
    glowAt(540, wy + wh * .55, 520, 'rgba(255,190,110,.4)');
    for (const sx of [1, -1]) { const x0 = sx > 0 ? wx - 10 : wx + ww + 10; vine(s, whip([x0, wy + wh + 60], [x0 - sx * 120, wy + wh * .6], [x0 + sx * 60, wy + wh * .2], [x0 + sx * 150, wy + 40], .9, sx, 50), 26, 10, C.olive, .35); }
    shape(s, [[wx - 70, wy + wh], [wx + ww + 70, wy + wh], [wx + ww + 90, wy + wh + 60], [wx - 90, wy + wh + 60]], C.ochre, C.umber, 14);
    const bx = 600, by = wy + wh, bh = 360, fillK = .1;
    const bottle = [...cub([bx - 30, by - bh], [bx - 40, by - bh * .6], [bx - 120, by - bh * .45], [bx - 90, by], 20), ...cub([bx + 90, by], [bx + 120, by - bh * .45], [bx + 40, by - bh * .6], [bx + 30, by - bh], 20)];
    shape(s, bottle, C.glass, C.umber, 14);
    s.save(); P(s, bottle); s.closePath(); s.clip(); shape(s, [[bx - 200, by - bh * .9 * fillK + Math.sin(t * 6) * 6], [bx + 200, by - bh * .9 * fillK - Math.sin(t * 6) * 6], [bx + 200, by], [bx - 200, by]], C.teal, null);
    lily(s, bx, by - bh * .35, -Math.PI / 2, 90, .6, [C.rose, C.cream]); s.restore();
    glowAt(bx - 50, by - bh * .5, 60, 'rgba(220,255,240,.35)');
    rain(t, 120, 7, rainA);
  }
  // 35.75: the tram door; an upside-down horseshoe over it slips on "luck" and spins away on "day"; the
  // tram slows outside the lit window and we push through the glass into c02
  function door(t, lt, dur) {
    const p = ease.inOut(inv(37.0, 37.7, t)), zf = Math.pow(6, p), zo = .56 * Math.pow(1 / .56, p), rot = rock(t) * .6 * (1 - p), sh = shake(t) * (1 - p);
    const ox = kf(t, [[35.75, 420], [37.15, 0]], ease.out), oy = kf(t, [[35.75, 40], [37.15, 0]], ease.out);
    const win = arch(300, 560, 480, 680, 30);
    s.fillStyle = DARK; s.fillRect(-W, -H, W * 3, H * 3);
    // through the window: the tenement, sliding to a stop
    s.save(); f.save();
    cam(540, 900 + sh, zf, rot);
    P(s, win); s.closePath(); s.clip(); P(f, win); f.closePath(); f.clip();
    s.setTransform(.5, 0, 0, .5, 0, 0); f.setTransform(.5, 0, 0, .5, 0, 0);
    cam(540 + ox, 900 + oy, zo, rot);
    tenement(t, .55 * lerp(.6, 1, p));
    s.restore(); f.restore();
    // the door and its wall, a hole where the glass is
    s.save(); f.save();
    cam(540, 900 + sh, zf, rot);
    const holed = (x, y, w, h, col) => { s.beginPath(); s.rect(x, y, w, h); win.forEach(([px, py], i) => i ? s.lineTo(px, py) : s.moveTo(px, py)); s.closePath(); s.fillStyle = col; s.fill('evenodd'); };
    holed(-800, -800, 2680, 3600, C.ochre);
    shape(s, [[-800, 330], [1880, 330], [1880, 400], [-800, 400]], C.gold, C.umber, 18);
    holed(250, 400, 580, 2200, C.olive); shape(s, [[250, 400], [830, 400], [830, 2600], [250, 2600]], null, C.umber, 22);
    shape(s, win, null, C.umber, 26); P(s, win); s.closePath(); s.lineWidth = 10; s.strokeStyle = BRASS; s.stroke();
    shape(s, [[310, 1320], [770, 1320], [770, 1840], [310, 1840]], '#4e5c3a', C.umber, 18);
    for (const sx of [1, -1]) { const x0 = 540 - sx * 20; vine(s, whip([x0, 1800], [x0 - sx * 120, 1700], [x0 - sx * 220, 1500], [x0 - sx * 150, 1390], .8, -sx, 36), 18, 10, C.sage); }
    for (const x of [200, 880]) rod([[x, 700], [x, 1500]], 22, BRASS);
    for (const x of [-500, 1250]) shape(s, [[x, 500], [x + 330, 500], [x + 330, 1300], [x, 1300]], '#94693a', C.umber, 18);
    // rain beading on the glass, fading as we pass through it
    f.save(); P(f, win); f.closePath(); f.clip(); f.globalCompositeOperation = 'lighter'; f.lineCap = 'round';
    { const r = rng(113); for (let i = 0; i < 26; i++) { const x = 300 + r() * 480, v = (r() + t * (.2 + r() * .4)) % 1, y = lerp(520, 1280, v), L = 30 + r() * 60; f.strokeStyle = `rgba(210,225,255,${.45 * (1 - p)})`; f.lineWidth = 4 + r() * 3; f.beginPath(); f.moveTo(x, y); f.lineTo(x - 8, y - L); f.stroke(); } }
    f.restore();
    glowAt(540, 300, 500, `rgba(255,190,110,${.15 * (1 - p)})`);
    // the horseshoe over the door, ends down: it wobbles on "luck" (36.45), lets go, spins and drops past the glass
    const slip = inv(36.45, 36.62, t), dt = Math.max(0, t - 36.62);
    const hx = 540 + 90 * dt, hy = 250 + .5 * 5200 * dt * dt, ha = th0(t) + .3 * slip * Math.sin((t - 36.45) * 40) * (dt > 0 ? 0 : 1) + dt * 11;
    if (dt === 0) rod([[540, 186], [540, 212]], 14, BRASS);
    withT(() => { s.translate(hx, hy); s.rotate(ha); const pts = [[-70, 70], [-72, 0], ...[...Array(17)].map((_, i) => { const a = Math.PI + i / 16 * Math.PI; return [Math.cos(a) * 72, Math.sin(a) * 72]; }), [72, 0], [70, 70]];
      line(pts, C.umber, 52); line(pts, '#8f8a7e', 30); for (const q of [3, 7, 11, 15]) dot(pts[q][0] * .98, pts[q][1] * .98, 6, C.umber); });
    s.restore(); f.restore();
    border(t, 1 - p);
  }
  const th0 = (t) => swing(t) * .25;
  chapter('c01', SEC.v1, 37.7, [
    [SEC.v1, aisle],
    [28.2, insane],
    [30.42, specs],
    [32.15, booth],
    [33.75, jacket],
    [35.75, door],
  ], { fx: PAINT });
})();

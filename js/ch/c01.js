// c01 · VERSE 1 (SEC.v1 - 37.7, 26.04 - 37.7) · painter A.
// Inside a Nouveau night tram rattling through the rain: stained-glass clerestory, brass rails, leather
// straps, swaying Galle lamps, and the cast (js/cast.js). Cues (vocal-stem onsets): "sane" 26.4 / 27.45 the
// lamps come on and the car lurches; "insane" 28.2-30.42 the four passengers sway together wildly on the
// straps; "blind" 30.42-32.15 close on the conductor's dark spectacles, his lantern gutters on the word;
// "lame" 32.15-33.75 he limps down the car on his cane, stumbles and the cane clatters (33.47); "jacket"
// 33.75-35.75 the jacket man slumped on a bench, hard luck; 35.75-37.7 an upside-down horseshoe over the
// door slips and spins away, then we push through the door's rain-streaked window into c02's first frame
// (plum wall, the window leaner in the lit arch, halo).
(() => {
  const DARK = '#17110e', WOOD = '#7a5530', BRASS = C.gold;
  function screen(g, fn) { g.save(); g.setTransform(PX, 0, 0, PX, 0, 0); fn(); g.restore(); }
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
  // the passengers rock with the car: their sway peaks on the beats like the straps
  const swayAmp = (t) => .06 + .36 * kf(t, [[28.15, 0], [28.55, .6], [29.6, .62], [30.5, .1]], (x) => x) + .12 * (hit(t, 26.4, 2.6) + hit(t, 27.45, 2.6));
  const swayPh = (t) => t - 28.43 + .25;
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
    const ppl = (o.people || []).filter((q) => q.Z > zn + .25);
    for (let Z = ZF - .5; Z > zn + .15; Z -= .65) for (const sx of [-1, 1]) if (!ppl.some((q) => Math.sign(q.X) === sx && Math.abs(q.Z - Z) < .4)) items.push(['strap', Z, sx]);
    for (const q of ppl) items.push(['person', q.Z, q]);
    for (const Z of [1.2, 3.1, 4.8]) if (Z > zn + .2) items.push(['lamp', Z, 0]);
    items.sort((a, b) => b[1] - a[1]);
    for (const [kind, Z, sx] of items) {
      const k = K(Z), lw = LW(Z, 18);
      if (kind === 'person') {
        const q = sx, [gx, gy] = pj(q.X, 1.25, Z);
        passenger(t, gx, gy, 1.72 * k, { who: q.who, facing: q.facing, ph: swayPh(t) + (q.dph || 0), amp: swayAmp(t), strap: true, strapY: pj(q.X, -.84, Z)[1], flail: q.flail });
      } else if (kind === 'strap') {
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
    car(t, kf(lt, [[0, -.45], [dur, .35]], (x) => x), lampOn(t), { people: [
      { who: 'tall', X: .5, Z: 2.7, facing: -1 }, { who: 'stout', X: -.5, Z: 2.1, facing: 1, dph: .03 },
      { who: 'old', X: .5, Z: 1.5, facing: -1, dph: .05 }, { who: 'dandy', X: -.5, Z: .95, facing: 1, dph: .02 }] });
    veil(kf(t, [[26.04, .85], [26.36, .55], [26.42, 0]], (x) => x));
    border(t, 1);
  }
  // ---- flat side-on interior for the close shots: clerestory, rail, rainy windows, wainscot, floor ----
  function hangLamp(x, y, a, sz, lamp) {
    const bx = x + Math.sin(a) * sz * 1.1, by = y + Math.cos(a) * sz * 1.1;
    rod([[x, y], [bx, by]], 12, BRASS);
    const R = (px, py) => [bx + (px * Math.cos(a) + py * Math.sin(a)) * sz, by + (-px * Math.sin(a) + py * Math.cos(a)) * sz];
    shape(s, [...cub([-.1, 0], [-.3, .05], [-.7, .25], [-.72, .7], 10), ...cub([.72, .7], [.7, .25], [.3, .05], [.1, 0], 10)].map(([p, q]) => R(p, q)), lamp > .5 ? C.amber : C.ochre, C.umber, 16);
    for (const px of [-.35, 0, .35]) line([R(px * .3, .06), R(px, .68)], C.rose, 10);
    const [gx, gy] = R(0, .8); if (lamp > 0) { glowAt(gx, gy, sz * 4, `rgba(255,190,110,${.36 * lamp})`); glowAt(gx, gy, sz * .7, `rgba(255,240,200,${.9 * lamp})`); }
  }
  function sideWall(t, o = {}) {
    const lamp = o.lamp ?? 1, th = swing(t);
    s.fillStyle = '#5e4128'; s.fillRect(-W, -H, W * 3, H * 3);
    shape(s, [[-500, -900], [1580, -900], [1580, 300], [-500, 300]], '#b9a37a', C.umber, 16);
    for (let i = -3; i < 8; i++) { const x = i * 230 + 30; shape(s, arch(x + 20, 300, 190, 130, 12), [C.amber, C.rose, C.sage, C.gold][(i + 12) % 4], C.umber, 14); glowAt(x + 115, 380, 130, `rgba(255,200,130,${(.18 + .3 * pass(t, i * 1.3)) * lamp})`); }
    shape(s, [[-500, 440], [1580, 440], [1580, 1040], [-500, 1040]], C.teal, C.umber, 16);
    for (let i = -2; i < 6; i++) { const x = i * 320 + 70; wetGlass([[x, 500], [x + 250, 500], [x + 250, 980], [x, 980]], x, 500, x + 250, 980, t + i * .31, 120 + i * 5, .9 * lamp); }
    shape(s, [[-500, 1040], [1580, 1040], [1580, 1480], [-500, 1480]], WOOD, C.umber, 16);
    for (let i = -2; i < 6; i++) { const x = i * 320 + 70; shape(s, [[x, 1090], [x + 250, 1090], [x + 250, 1430], [x, 1430]], '#94693a', C.umber, 14); }
    rod([[-500, 450], [1580, 450]], 26, BRASS);
    if (o.bench) { shape(s, [[-500, o.bench - 60], [1580, o.bench - 60], [1580, o.bench + 10], [-500, o.bench + 10]], C.rose, C.umber, 18); shape(s, [[-500, o.bench + 10], [1580, o.bench + 10], [1580, 1760], [-500, 1760]], C.ochre, C.umber, 18); }
    shape(s, [[-500, 1760], [1580, 1760], [1580, 2600], [-500, 2600]], '#5e4128', C.umber, 16);
    shape(s, [[180, 1760], [900, 1760], [1060, 2600], [20, 2600]], C.ruby, C.umber, 14);
    for (const x of o.lamps || []) hangLamp(x, 300, th * .75, 70, lamp);
  }
  const lampFl = (t) => .7 + .3 * (hash(Math.floor(t * 16)) > .3 ? 1 : 0);
  // 28.2: the passengers on the straps, all four swaying together, wildly; lamps swinging, the car rocking crazy
  function insane(t, lt, dur) {
    cam(540 + 24 * swing(t), kf(lt, [[0, 1000], [dur, 970]]) + shake(t) * 2, kf(lt, [[0, .96], [dur, 1.03]]), rock(t) * 2);
    sideWall(t, { lamp: lampFl(t), lamps: [180, 900] });
    const ph = swayPh(t), amp = swayAmp(t), sy = 450;
    // back row first, then the front row, offset so they rock in parallel without tangling
    passenger(t, 380, 1680, 660, { who: 'old', facing: 1, ph: ph + .02, amp, strap: true, strapY: sy });
    passenger(t, 800, 1690, 680, { who: 'dandy', facing: -1, ph: ph + .04, amp, strap: true, strapY: sy, flail: 1 });
    passenger(t, 220, 1880, 900, { who: 'stout', facing: 1, ph, amp, strap: true, strapY: sy });
    passenger(t, 660, 1900, 920, { who: 'tall', facing: -1, ph: ph + .03, amp, strap: true, strapY: sy });
    border(t, 1);
  }

  // ================= the conductor (shots 3 - 4), the jacket man (shot 5) =================
  // 30.42: close on the conductor, five months blind behind his dark round spectacles; the passing lights glint
  // in them until "blind" (31.5), when his lantern gutters and the car goes dim
  function blind(t, lt, dur) {
    const th = swing(t), dim = inv(31.42, 31.56, t) * (1 - .5 * inv(31.95, 32.12, t));
    cam(kf(lt, [[0, 560], [dur, 590]]), kf(lt, [[0, 1000], [dur, 960]]) + shake(t), kf(lt, [[0, 1.0], [dur, 1.12]]), rock(t) * .6);
    sideWall(t, { lamp: 1 - .8 * dim, lamps: [900] });
    const J = conductor(t, 420, 2650, 1800, { pose: 'stand', ph: t * .5, facing: 1, lit: 1 - .85 * dim, swing: th * 1.2 });
    const sw = pass(t, 0) * (1 - dim), [ex, ey] = [J.hc[0] + .03 * J.h, J.hc[1] + .005 * J.h];
    glowAt(ex, ey, .03 * J.h + 40 * sw, `rgba(255,236,200,${(.25 + .6 * sw) * (1 - dim)})`);
    veil(.5 * dim);
    border(t, 1);
  }
  // 32.15: the conductor limps down the car on his cane, lantern swinging; on "lame" he stumbles and the
  // cane clatters on the boards (33.47)
  function lame(t, lt, dur) {
    const th = swing(t), st = hit(t, 33.47, 4) * Math.sin((t - 33.47) * 14);
    cam(kf(lt, [[0, 470], [dur, 620]]), 1050 + shake(t), kf(lt, [[0, 1.04], [dur, 1.12]]), rock(t) * .6);
    sideWall(t, { lamps: [260, 980] });
    const x = 180 + lt * 230, J = conductor(t, x, 1830, 900, { ph: lt * .9, facing: 1, swing: th * 1.3 + .15, rot: .1 * st + .05 * ease.in(inv(33.2, 33.47, t)) * (1 - inv(33.47, 33.8, t)) });
    for (const k of [33.0, 33.47]) if (t >= k) { const g = J.ground || [J.hand[0] + .06 * J.h, 1830]; glowAt(J.hand[0] + .06 * J.h, 1820, 140, `rgba(255,220,160,${.5 * hit(t, k, 7)})`); }
    border(t, 1);
  }
  // 33.75: the jacket man in his loud check, slumped on the bench, hard luck; the car rocks him and he
  // lurches on "jacket" (34.97)
  function jacket(t, lt, dur) {
    const th = swing(t), lj = hit(t, 34.97, 3) * Math.sin((t - 34.97) * 9);
    cam(kf(lt, [[0, 540], [dur, 580]]), kf(lt, [[0, 1080], [dur, 1000]]) + shake(t), kf(lt, [[0, 1.18], [dur, 1.38]]), rock(t) * .7);
    sideWall(t, { bench: 1340, lamps: [960] });
    jacketMan(t, 520, 1300, 1050, { pose: 'slump', facing: 1, rot: .05 * th + .12 * lj });
    glowAt(560, 1000, 600, 'rgba(255,190,110,.12)');
    border(t, 1);
  }

  // ================= the door and the push through its window (shot 6) =================
  // c02's first frame, drawn exactly as it opens (cam(540, 900, 1.0)): night sky, halo, plum wall, amber arch,
  // the sill, the window leaner with the Galle bottle (as c02's window_ at lt = 0), the tendrils at .35
  function tenement(t, rainA) {
    s.fillStyle = C.night; s.fillRect(-W, -H, W * 3, H * 3);
    halo(540, 520, 360, t * .05);
    shape(s, [[-200, 900], [1280, 900], [1280, 2400], [-200, 2400]], C.plum, null);
    const wx = 230, wy = 640, ww = 620, wh = 820;
    shape(s, [[wx, wy + wh], [wx, wy + ww / 2], ...circle(wx + ww / 2, wy + ww / 2, ww / 2).filter(([, py]) => py <= wy + ww / 2 + .1).sort((a, b) => a[0] - b[0]), [wx + ww, wy + ww / 2], [wx + ww, wy + wh]], C.amber, C.umber, 24);
    glowAt(540, wy + wh * .55, 520, 'rgba(255,190,110,.4)');
    for (const sx of [1, -1]) { const x0 = sx > 0 ? wx - 10 : wx + ww + 10; vine(s, whip([x0, wy + wh + 60], [x0 - sx * 120, wy + wh * .6], [x0 + sx * 60, wy + wh * .2], [x0 + sx * 150, wy + 40], .9, sx, 50), 26, 10, C.olive, .35); }
    shape(s, [[wx - 70, wy + wh], [wx + ww + 70, wy + wh], [wx + ww + 90, wy + wh + 60], [wx - 90, wy + wh + 60]], C.parch, C.umber, 14);
    const lt = t - 37.7;
    windowLeaner(t, 400, wy + wh, 1000, { frame: false, facing: 1, fill: .1, lean: .75 + .06 * Math.sin(lt * 2.2) });
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
    s.setTransform(PX, 0, 0, PX, 0, 0); f.setTransform(PX, 0, 0, PX, 0, 0);
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
    [30.42, blind],
    [32.15, lame],
    [33.75, jacket],
    [35.75, door],
  ], { fx: PAINT });
})();

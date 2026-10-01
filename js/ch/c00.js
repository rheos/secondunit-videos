// c00 · INTRO (SEC.prevTail - SEC.v1, 0 - 26.04) · painter A.
// Harlem rooftops at night, painted as a Mucha poster assembling itself: the border draws itself in, a halo
// moon rises behind water towers and chimneys, the rain starts with the guitar (7.0), the camera drifts down
// a facade to a dark Guimard Metro entrance, its lily-bud lamps flicker on (~23-25), and we push into the
// stairway's mouth: the last frames are its darkness. No hands.
(() => {
  const DARK = '#17110e', SMOKE = '#9aa0b8';
  // ---- private helpers ----
  function screen(g, fn) { g.save(); g.setTransform(.5, 0, 0, .5, 0, 0); fn(); g.restore(); }
  // darken the whole frame (underpainting and light) toward night
  function veil(a) {
    if (a <= .003) return;
    screen(s, () => { s.fillStyle = `rgba(16,13,20,${clamp(a)})`; s.fillRect(-10, -10, W + 20, H + 20); });
    screen(f, () => { f.globalCompositeOperation = 'source-over'; f.fillStyle = `rgba(0,0,0,${clamp(a)})`; f.fillRect(-10, -10, W + 20, H + 20); });
  }
  // the Mucha border drawing itself in: two pens start at the bottom centre and run up both sides to meet
  // at the top of the arch. u 0..1.
  function borderIn(t, u, vu) {
    if (u >= 1) return border(t, vu);
    if (u <= 0) return;
    const cx = W / 2, cy = H * .55, a = u * Math.PI, m = 46;
    s.save(); s.setTransform(.5, 0, 0, .5, 0, 0);
    s.beginPath(); s.moveTo(cx, cy); for (let i = 0; i <= 48; i++) { const th = Math.PI / 2 - a + 2 * a * i / 48; s.lineTo(cx + Math.cos(th) * 3200, cy + Math.sin(th) * 3200); } s.closePath(); s.clip();
    border(t, vu); s.restore();
    // a gold spark at each pen
    const inside = (x, y) => x > m && x < W - m && y < H - m && (y > 420 || Math.hypot(x - W / 2, y - 420) < W / 2 - m);
    screen(f, () => { for (const th of [Math.PI / 2 - a, Math.PI / 2 + a]) { let r = 0; while (r < 2400 && inside(cx + Math.cos(th) * r, cy + Math.sin(th) * r)) r += 8;
      const x = cx + Math.cos(th) * r, y = cy + Math.sin(th) * r; glowAt(x, y, 120, 'rgba(255,200,120,.55)'); glowAt(x, y, 34, 'rgba(255,240,210,.9)'); } });
  }
  function solid(g, pts, col, lw = 16) { if (g === f) { P(f, pts); f.closePath(); f.fillStyle = '#000'; f.fill(); } else shape(s, pts, col, C.umber, lw); }
  // a tapered outlined stroke drawn between fractions a0..a1 of a path (smoke puffs grow, rise and are eaten from the tail)
  function seg(pts, a0, a1, w0, w1, col) {
    const n = pts.length - 1, i0 = Math.floor(clamp(a0) * n), i1 = Math.floor(clamp(a1) * n); if (i1 - i0 < 2) return;
    s.lineCap = 'round'; s.lineJoin = 'round';
    for (const [cl, ex] of [[C.umber, 9], [col, 0]]) { s.strokeStyle = cl; for (let i = i0 + 1; i <= i1; i++) { s.lineWidth = lerp(w0, w1, i / n) + ex; s.beginPath(); s.moveTo(...pts[i - 1]); s.lineTo(...pts[i]); s.stroke(); } }
  }
  function stars(t, n, seed, a) { const r = rng(seed); for (let i = 0; i < n; i++) { const x = r() * 1500 - 210, y = r() * 1500 - 400, tw = .55 + .45 * Math.sin(t * (1 + r() * 2) + r() * 9); glowAt(x, y, 12 + r() * 16, `rgba(230,232,255,${a * tw * (.4 + r() * .6)})`); } }
  const arch = (x, y, w, h, n = 24) => [[x, y + h], ...circle(x + w / 2, y + w / 2, w / 2, n * 2).filter(([, py]) => py <= y + w / 2 + .1).sort((p, q) => p[0] - q[0]), [x + w, y + h]];
  // a window: lit amber (and glowing) or dark glass; lights come on through the night
  function win(x, y, w, h, on, lw = 14) {
    shape(s, arch(x, y, w, h, 14), on > .5 ? C.amber : C.deep, C.umber, lw);
    if (on > .5) { line([[x + w / 2, y + 6], [x + w / 2, y + h]], C.umber, Math.max(10, lw * .7)); glowAt(x + w / 2, y + h * .55, Math.max(w, h) * .9, `rgba(255,180,90,${.32 * on})`); }
    else line([[x + w * .25, y + h * .75], [x + w * .6, y + h * .35]], '#3d6a68', Math.max(10, lw * .7));
  }
  const winOn = (t, id, p = .4, t0 = 1, t1 = 20) => hash(id * 131 + 7) < p ? clamp((t - (t0 + hash(id * 17 + 3) * (t1 - t0))) / .15) : 0;
  const rainK = (t) => inv(7.0, 8.4, t);

  // ================= the rooftops (shots 1 - 4) =================
  const HX = 560, HR = 430;
  const haloY = (t) => lerp(1590, 760, ease.sine(t / 13.4));
  const BACK = (() => { const r = rng(31), pts = [[-600, 2600], [-600, 1300]]; let x = -600; while (x < 1700) { const w = 150 + r() * 170, h = 1236 + r() * 80;
    if (r() < .3) pts.push(...cub([x, h], [x + w * .12, h - w * .55], [x + w * .88, h - w * .55], [x + w, h], 10)); else { pts.push([x, h], [x + w, h]); } x += w; } pts.push([1700, 2600]); return pts; })();
  const FRONT = [
    { x0: -600, x1: 380, top: 1420, col: C.plum, kind: 'gable' },
    { x0: 380, x1: 760, top: 1470, col: C.teal, kind: 'mansard' },
    { x0: 760, x1: 1700, top: 1380, col: C.dusk, kind: 'flat' },
  ];
  function bodyPts(b) {
    if (b.kind === 'gable') return [[b.x0, 2600], [b.x0, b.top], ...cub([-60, b.top], [0, b.top], [60, b.top - 170], [160, b.top - 180], 14), ...cub([160, b.top - 180], [260, b.top - 170], [300, b.top], [b.x1, b.top], 14), [b.x1, 2600]];
    if (b.kind === 'mansard') return [[b.x0, 2600], [b.x0, b.top], [b.x1, b.top], [b.x1, 2600]];
    return [[b.x0, 2600], [b.x0, b.top - 40], [b.x1, b.top - 40], [b.x1, 2600]];
  }
  function tower(g, cx, base, sc) {
    const w = 210 * sc, legH = 170 * sc, tH = 220 * sc, cH = 140 * sc, tb = base - legH, tt = tb - tH;
    for (const lx of [-.42, -.13, .16, .45]) solid(g, [[cx + lx * w - 11 * sc, base], [cx + lx * w * .9 - 9 * sc, tb], [cx + lx * w * .9 + 9 * sc, tb], [cx + lx * w + 11 * sc, base]], '#3a2c22', 10);
    if (g === s) { line([[cx - .42 * w, base - 20 * sc], [cx + .4 * w, tb + 16 * sc]], C.umber, 13); line([[cx + .45 * w, base - 20 * sc], [cx - .38 * w, tb + 16 * sc]], C.umber, 13); }
    solid(g, [[cx - w / 2, tb], [cx - w / 2, tt], [cx + w / 2, tt], [cx + w / 2, tb]], '#6b4a2e', 16);
    if (g === s) for (const k of [.25, .55, .85]) line([[cx - w / 2, tt + tH * k], [cx + w / 2, tt + tH * k]], C.umber, 14);
    solid(g, [...cub([cx - w / 2 - 18 * sc, tt + 4], [cx - w * .3, tt - cH * .4], [cx - w * .06, tt - cH * .8], [cx, tt - cH], 12), ...cub([cx, tt - cH], [cx + w * .06, tt - cH * .8], [cx + w * .3, tt - cH * .4], [cx + w / 2 + 18 * sc, tt + 4], 12)], '#3d4766', 16);
    if (g === s) vine(s, whip([cx, tt - cH], [cx + 6, tt - cH - 40 * sc], [cx - 34 * sc, tt - cH - 70 * sc], [cx + 22 * sc, tt - cH - 104 * sc], .6, 1, 16), 12, 6, C.gold);
  }
  function chimney(g, x, base, h) {
    const w = 92;
    solid(g, [[x - w / 2, base + 30], [x - w / 2, base - h], [x + w / 2, base - h], [x + w / 2, base + 30]], '#7a4638', 14);
    solid(g, [[x - w / 2 - 14, base - h], [x - w / 2 - 14, base - h - 28], [x + w / 2 + 14, base - h - 28], [x + w / 2 + 14, base - h]], C.ochre, 12);
    for (const dx of [-.22, .22]) solid(g, [[x + dx * w - 22, base - h - 28], [x + dx * w - 15, base - h - 92], [x + dx * w + 15, base - h - 92], [x + dx * w + 22, base - h - 28]], C.rose, 12);
  }
  const CHIM = [[880, 1380, 170, 4.2, 1], [1050, 1380, 130, 6.0, -1], [694, 1330, 110, 8.0, 1]];
  // whiplash smoke: puffs grow out of the pot, rise and curl, and are eaten from the tail
  function smoke(t, x, y, seed, start, dir) {
    if (t < start) return;
    for (let j = 0; j < 2; j++) {
      const age = (t - start) * .26 - j / 2; if (age < 0) continue;
      const ph = age % 1, cyc = Math.floor(age), d = (cyc + j + seed) % 2 ? dir : -dir, wind = 80 * snoise(cyc * 1.7 + j, seed) + 60, lift = ph * 230;
      const pts = whip([x, y - lift * .4], [x + 80 * d + wind * .2, y - 170 - lift], [x - 170 * d + wind, y - 330 - lift], [x + 190 * d + wind * 1.4, y - 470 - lift], 1.0, d, 44);
      seg(pts, ease.in(ph) * .9, Math.min(1, ph * 2.4), 28, 12, SMOKE);
    }
  }
  function roofScene(t) {
    s.fillStyle = vgrad(-400, 1500, [[0, '#101626'], [1, C.night]]); s.fillRect(-W, -H, W * 3, H * 4);
    stars(t, 26, 5, .5 * inv(.5, 4, t) * (1 - .6 * inv(8, 13, t)));
    const hy = haloY(t);
    halo(HX, hy, HR, t * .04, .25 + .15 * inv(3, 10, t));
    solid(s, BACK, '#2b3150', 14);
    for (const b of FRONT) solid(s, bodyPts(b), b.col, 18);
    // roof details
    for (const b of FRONT) {
      if (b.kind === 'mansard') { shape(s, [[b.x0 + 10, b.top], [b.x0 + 70, b.top - 140], [b.x1 - 70, b.top - 140], [b.x1 - 10, b.top]], '#323a58', C.umber, 16);
        const mx = (b.x0 + b.x1) / 2; shape(s, circle(mx, b.top - 62, 66, 40), C.ochre, C.umber, 14); win(mx - 40, b.top - 104, 80, 84, inv(2.2, 2.4, t)); }
      if (b.kind === 'gable') { shape(s, circle(160, b.top - 78, 52, 36), C.ochre, C.umber, 14); shape(s, circle(160, b.top - 78, 34, 30), t > 5.2 ? C.amber : C.deep, C.umber, 12); if (t > 5.2) glowAt(160, b.top - 78, 140, 'rgba(255,180,90,.35)'); }
      shape(s, [[b.x0, b.top + 30], [b.x1, b.top + 30], [b.x1, b.top + 62], [b.x0, b.top + 62]], b.kind === 'flat' ? C.ochre : '#8a6a3a', C.umber, 12);
    }
    tower(s, 520, 1330, 1); tower(s, 1230, 1380, .75); tower(s, -40, 1420, .8);
    for (const [x, b, h] of CHIM) chimney(s, x, b, h);
    // occlude the halo's glow behind the roofs on the light layer
    solid(f, BACK); for (const b of FRONT) solid(f, bodyPts(b)); tower(f, 520, 1330, 1); tower(f, 1230, 1380, .75); tower(f, -40, 1420, .8); for (const [x, b, h] of CHIM) chimney(f, x, b, h);
    // windows down the walls, lighting up through the night
    let id = 0;
    for (const b of FRONT) for (let y = b.top + 130; y < 2500; y += 240) for (let x = b.x0 + 60; x < b.x1 - 80; x += 165) { id++; if (x < -260 || x > 1350) continue; win(x, y, 84, 136, winOn(t, id, .48, .8, 10)); }
    for (const [x, b, h, st, dir] of CHIM) for (const dx of [-.22, .22]) smoke(t, x + dx * 92, b - h - 92, (x | 0) + (dx > 0 ? 1 : 0), st + (dx > 0 ? 1.9 : 0), dx > 0 ? -dir : dir);
    rain(t, Math.round(150 * rainK(t)), 3, .5 * rainK(t));
  }
  // 0.0: nearly black; the border starts drawing itself, the halo moon just breaking above the roofs
  function sky(t, lt, dur) {
    cam(540, kf(lt, [[0, 1180], [dur, 1110]]), kf(lt, [[0, 1.06], [dur, 1.02]]));
    roofScene(t);
    veil(kf(t, [[0, .9], [3.2, .62], [7, .3], [9, 0]], (x) => x));
    borderIn(t, ease.inOut(inv(.4, 6.4, t)), inv(5.2, 8.4, t));
  }
  // 3.2: closer: a water tower silhouetted on the rising halo; the first smoke curls up
  function towers(t, lt, dur) {
    cam(kf(lt, [[0, 500], [dur, 540]]), kf(lt, [[0, 1230], [dur, 1150]]), kf(lt, [[0, 1.42], [dur, 1.58]]));
    roofScene(t);
    veil(kf(t, [[0, .9], [3.2, .62], [7, .3], [9, 0]], (x) => x));
    borderIn(t, ease.inOut(inv(.4, 6.4, t)), inv(5.2, 8.4, t));
  }
  // 7.0 (the guitar): wide over the rooftops, the halo risen, rain begins, smoke from every chimney
  function rooftops(t, lt, dur) {
    cam(kf(lt, [[0, 470], [dur, 620]]), kf(lt, [[0, 1080], [dur, 1040]]), kf(lt, [[0, .86], [dur, .92]]));
    roofScene(t);
    veil(kf(t, [[7, .3], [9, 0]], (x) => x));
    borderIn(t, 1, inv(5.2, 8.4, t));
  }
  // 10.23: in close on the chimney pots, whiplash smoke spiralling up across the halo
  function chimneys(t, lt, dur) {
    cam(kf(lt, [[0, 860], [dur, 910]]), kf(lt, [[0, 1000], [dur, 900]]), kf(lt, [[0, 1.6], [dur, 1.74]]), kf(lt, [[0, -.02], [dur, .02]]));
    roofScene(t);
    border(t, 1);
  }

  // ================= the facade (shots 5 - 6) =================
  function facade(t, lt) {
    s.fillStyle = vgrad(-500, 500, [[0, '#101626'], [1, C.night]]); s.fillRect(-W, -H * 2, W * 3, H * 3);
    halo(1080, -160, 430, t * .04, .35);
    // the pediment: a Mucha roundel with a lily over the cornice
    halo(540, 300, 190, -t * .05);
    lily(s, 540, 330, -Math.PI / 2, 120, .5 + .3 * inv(13.3, 16, t), [C.cream, C.blush]);
    shape(s, [[-200, 520], [1280, 520], [1280, 3220], [-200, 3220]], C.teal, C.umber, 18);
    shape(s, [[-200, 380], [1280, 380], [1280, 520], [-200, 520]], C.ochre, C.umber, 18);
    for (let x = -160; x < 1260; x += 120) petal(s, x, 470, Math.PI / 2, 70, 26, C.gold, C.umber, 10);
    line([[-200, 440], [1280, 440]], C.umber, 14);
    let id = 0;
    for (const y0 of [660, 1280, 1900]) for (const xc of [210, 540, 870]) {
      id++; const w = 230, h = 390, x = xc - w / 2, on = winOn(t, id + 40, .6, 12.6, 18);
      shape(s, arch(x - 22, y0 - 22, w + 44, h + 30), C.sage, C.umber, 16);
      win(x, y0, w, h, on, 18);
      // a swelling Guimard balcony: slab and whiplash railing
      shape(s, [[x - 50, y0 + h], [x + w + 50, y0 + h], [x + w + 36, y0 + h + 36], [x - 36, y0 + h + 36]], C.ochre, C.umber, 14);
      line([[x - 40, y0 + h - 150], [x + w + 40, y0 + h - 150]], C.olive, 18);
      for (const sx of [1, -1]) { const ax = sx > 0 ? x - 30 : x + w + 30; vine(s, whip([ax, y0 + h], [ax + sx * 10, y0 + h - 120], [ax + sx * 110, y0 + h - 40], [ax + sx * (w / 2 + 10), y0 + h - 70], .7, -sx, 26), 14, 9, C.olive); }
    }
    // vines climbing between the windows, growing as we pass
    for (const [vx, i] of [[375, 0], [705, 1], [45, 2], [1035, 3]]) for (const y0 of [2500, 1880, 1260]) {
      const u = inv(13.4 + i * .3 + (2500 - y0) / 1400, 15.6 + i * .3 + (2500 - y0) / 900, t);
      vine(s, whip([vx, y0], [vx - 50, y0 - 200], [vx + 60, y0 - 400], [vx + (i % 2 ? 40 : -40), y0 - 560], .8, i % 2 ? 1 : -1, 40), 20, 8, C.sage, u);
      if (u > .7) petal(s, vx + (i % 2 ? 40 : -40), y0 - 470, -Math.PI / 2 + (i % 2 ? .5 : -.5), 70 * ease.back(inv(.7, 1, u)), 24, C.sage, C.umber, 10);
    }
    // ground floor: a lit shopfront under a plum fascia (no lettering)
    shape(s, [[-200, 2620], [1280, 2620], [1280, 2720], [-200, 2720]], C.plum, C.umber, 18);
    for (let x = -120; x < 1240; x += 160) shape(s, circle(x, 2670, 22, 24), C.gold, C.umber, 10);
    for (const [x, w] of [[90, 380], [610, 380]]) { shape(s, arch(x, 2760, w, 440, 20), C.amber, C.umber, 22); glowAt(x + w / 2, 3000, 380, 'rgba(255,180,90,.42)');
      // Galle vases in the window, silhouettes
      for (const k of [.3, .7]) { const vx = x + w * k, vy = 3200; shape(s, [...cub([vx - 22, vy - 170], [vx - 30, vy - 90], [vx - 70, vy - 60], [vx - 46, vy], 10), ...cub([vx + 46, vy], [vx + 70, vy - 60], [vx + 30, vy - 90], [vx + 22, vy - 170], 10)], C.olive, C.umber, 12); } }
    // the wet pavement, the shop light shivering in it, rings where the rain lands
    s.fillStyle = vgrad(3200, 3800, [[0, C.dusk], [1, '#232c44']]); s.fillRect(-W, 3200, W * 3, 1400);
    line([[-200, 3200], [1280, 3200]], C.umber, 18);
    for (const x of [280, 800]) for (let i = 0; i < 8; i++) { const wob = Math.sin(t * 3.2 + i * 1.3) * 18; s.fillStyle = i % 2 ? C.ochre : '#8a6a3a'; s.fillRect(x - 110 + wob, 3240 + i * 60, 220 - i * 18, 28); glowAt(x + wob, 3250 + i * 60, 90, 'rgba(255,170,80,.18)'); }
    for (let i = 0; i < 9; i++) { const cyc = Math.floor(t * 1.6 + hash(i)), ph = (t * 1.6 + hash(i)) % 1, x = hash(cyc * 31 + i) * 1100, y = 3260 + hash(cyc * 7 + i) * 420; f.save(); f.globalCompositeOperation = 'lighter'; f.strokeStyle = `rgba(200,220,255,${.5 * (1 - ph)})`; f.lineWidth = 4; f.beginPath(); f.ellipse(x, y, 20 + ph * 90, 6 + ph * 22, 0, 0, TAU); f.stroke(); f.restore(); }
    // a dark Metro lamp at the kerb, to be followed
    guimard(1120, 3500, 1000, -1, 0, Math.sin(t * .8) * 6);
    rain(t, 140, 21, .5);
  }
  // 13.33: tilt down the facade: Mucha pediment, sage-framed arched windows, Guimard balconies, vines growing
  function facadeTop(t, lt, dur) {
    cam(540, kf(lt, [[0, 560], [dur, 1560]], ease.inOut), kf(lt, [[0, 1.06], [dur, 1.0]]));
    facade(t, lt);
    border(t, 1);
  }
  // 16.43: down to the shopfront and the wet street; drift right toward a dark Metro lamp
  function street(t, lt, dur) {
    cam(kf(lt, [[0, 520], [dur, 760]]), kf(lt, [[0, 2380], [dur, 2960]], ease.inOut), kf(lt, [[0, 1.0], [dur, .92]]));
    facade(t, lt);
    border(t, 1);
  }

  // ================= the Metro entrance (shots 7 - 8) =================
  function lampK(t) {
    if (t < 23.2) return 0;
    if (t >= 25.0) return 1;
    const slot = Math.floor(t * 14), p = inv(23.2, 24.9, t);
    return (hash(slot * 13 + 5) < .25 + p * .8 ? 1 : .08) * (.75 + .25 * beatPulse(t, 6));
  }
  function metro(t, lit, rainA = .48) {
    s.fillStyle = C.night; s.fillRect(-W, -H, W * 3, H * 3);
    // the building across the pavement: lit windows
    shape(s, [[-300, -400], [1380, -400], [1380, 960], [-300, 960]], C.plum, C.umber, 18);
    let id = 0; for (let y = -300; y < 900; y += 300) for (let x = -160; x < 1200; x += 220) { id++; win(x, y, 120, 200, winOn(t, id + 90, .45, 19, 24), 14); }
    shape(s, [[-300, 900], [1380, 900], [1380, 960], [-300, 960]], C.ochre, C.umber, 14);
    // the wet pavement
    s.fillStyle = vgrad(960, 1900, [[0, '#2a3450'], [1, C.dusk]]); s.fillRect(-W, 960, W * 3, H * 2);
    line([[-300, 962], [1380, 962]], C.umber, 16);
    // the stairwell: tiled far wall with the tunnel mouth, landing, steps rising to us
    shape(s, [[330, 1150], [750, 1150], [750, 1370], [330, 1370]], '#b7a684', C.umber, 16);
    for (let y = 1186; y < 1370; y += 36) line([[330, y], [750, y]], '#8f7f62', 10);
    shape(s, arch(392, 1172, 296, 200, 20), DARK, C.umber, 18);
    s.fillStyle = rgrad(540, 1300, 10, 200, [[0, '#0e0a08'], [1, DARK]]); P(s, arch(400, 1180, 280, 190, 20)); s.closePath(); s.fill();
    shape(s, [[250, 1585], [330, 1150], [330, 1370]], '#9c8c6c', C.umber, 14);
    shape(s, [[830, 1585], [750, 1150], [750, 1370]], '#9c8c6c', C.umber, 14);
    for (let i = 0; i < 6; i++) { const y0 = lerp(1370, 1585, i / 6), y1 = lerp(1370, 1585, (i + 1) / 6), xa = lerp(330, 250, i / 6), xb = lerp(330, 250, (i + 1) / 6);
      const dk = 1 - (i + 1) / 6; s.globalAlpha = 1; shape(s, [[xa, y0], [1080 - xa, y0], [1080 - xb, y1], [xb, y1]], i % 2 ? '#7d5a32' : C.ochre, C.umber, 12); s.fillStyle = `rgba(20,14,10,${.75 * dk})`; P(s, [[xa, y0], [1080 - xa, y0], [1080 - xb, y1], [xb, y1]]); s.closePath(); s.fill(); }
    // Guimard railings along both sides of the opening, whiplash infill
    for (const sx of [1, -1]) { const X = (x) => sx > 0 ? x : 1080 - x;
      const rail = [[X(250), 1585], [X(330), 1150], [X(330), 900], [X(250), 1330]];
      shape(s, rail, null, C.olive, 22); P(s, rail); s.closePath(); s.lineWidth = 8; s.strokeStyle = C.umber; s.stroke();
      for (let k = 0; k < 3; k++) { const a = k / 3, b = (k + 1) / 3, x0 = lerp(250, 330, a), x1 = lerp(250, 330, b), yb0 = lerp(1585, 1150, a), yt0 = lerp(1330, 900, a), yb1 = lerp(1585, 1150, b), yt1 = lerp(1330, 900, b);
        vine(s, whip([X(x0), yb0 - 20], [X(x0 + 10), (yb0 + yt0) / 2], [X(x1), (yb1 + yt1) / 2 + 40], [X((x0 + x1) / 2), (yb0 + yt0) / 2 - 30], .7, sx * (k % 2 ? 1 : -1), 24), 13, 8, C.olive, inv(19.6 + k * .4, 21.6 + k * .4, t)); } }
    // reflections of the lamps in the wet pavement
    for (const x of [130, 950]) for (let i = 0; i < 6; i++) { const wob = Math.sin(t * 3 + i) * 12; s.fillStyle = lit > .5 ? C.ruby : '#3a3048'; s.fillRect(x - 36 + wob, 1640 + i * 58, 72 - i * 8, 22); if (lit > .5) glowAt(x + wob, 1650 + i * 58, 70, `rgba(255,120,60,${.22 * lit})`); }
    // the arch: two lamp stems and the iron crossbar with a plain Mucha roundel (no lettering)
    const sway = Math.sin(t * .8) * 6;
    vine(s, whip([250, 1060], [380, 900], [700, 900], [830, 1060], 0, 1, 40), 26, 26, C.olive);
    guimard(130, 1590, 950, 1, lit, sway); guimard(950, 1590, 950, -1, lit, -sway);
    shape(s, circle(540, 905, 64, 40), C.sage, C.umber, 14); shape(s, circle(540, 905, 40, 32), C.gold, C.umber, 10);
    lily(s, 540, 925, -Math.PI / 2, 60, .4 + .5 * lit, [C.cream, C.blush]);
    if (lit > 0) { glowAt(540, 1460, 420, `rgba(255,140,80,${.22 * lit})`); glowAt(540, 1180, 300, `rgba(255,150,90,${.1 * lit})`); }
    rain(t, 140, 33, rainA);
  }
  // 19.57: the Guimard Metro entrance, lamps dark, the stairway going down into the tunnel; iron tendrils grow
  function entrance(t, lt, dur) {
    cam(540, kf(lt, [[0, 1000], [dur, 1080]]), kf(lt, [[0, .9], [dur, 1.02]]));
    metro(t, 0);
    border(t, 1);
  }
  // 23.23: the lamps flicker on; at 25 they hold, and we push down into the dark of the stairway mouth
  function descend(t, lt, dur) {
    const z = t < 25 ? lerp(1.02, 1.2, (t - 23.23) / 1.77) : 1.2 * Math.pow(8 / 1.2, Math.pow(inv(25, 26.04, t), 1.5));
    cam(540, t < 25 ? lerp(1080, 1150, (t - 23.23) / 1.77) : lerp(1150, 1285, ease.out(inv(25, 25.8, t))), z);
    metro(t, lampK(t), .48 * clamp(1.5 / z));
    veil(.92 * ease.in(inv(25.45, 26.0, t)));
    border(t, 1);
  }
  chapter('c00', SEC.prevTail, SEC.v1, [
    [SEC.prevTail, sky],
    [3.2, towers],
    [SEC.intro, rooftops],
    [10.23, chimneys],
    [13.33, facadeTop],
    [16.43, street],
    [19.57, entrance],
    [23.23, descend],
  ], { fx: PAINT });
})();

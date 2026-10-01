// c09 · BRIDGE 2 (SEC.b2 - SEC.out). Dawn on the river. The theatre curtain's seam of light turns into the
// horizon, the sun rises as a gold Mucha halo, dawn sweeps the water and the rain lifts into mist, the
// band's drum and tuba drift past and go down a whirlpool, and a little rowboat rows up into the sun.
(() => {
  // ---- private helpers ----
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, k) => { const A = rgb(a), B = rgb(b); k = clamp(k); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); };
  const ell = (x, y, rx, ry, n = 48, rot = 0) => [...Array(n)].map((_, i) => { const a = i / n * TAU, px = Math.cos(a) * rx, py = Math.sin(a) * ry; return [x + px * Math.cos(rot) - py * Math.sin(rot), y + px * Math.sin(rot) + py * Math.cos(rot)]; });
  // a stroke with an umber edge (cheaper than vine for the many small water strokes)
  const stroke2 = (pts, w, col) => { line(pts, C.umber, w + 10); line(pts, col, w); };
  // light-layer helpers: paint a solid black on f so glows don't shine through it; a lighter line
  function blackF(pts) { f.save(); f.globalCompositeOperation = 'source-over'; f.globalAlpha = 1; P(f, pts); f.closePath(); f.fillStyle = '#000'; f.fill(); f.restore(); }
  function lightLine(pts, w, col) { f.save(); f.globalCompositeOperation = 'lighter'; f.lineCap = 'round'; f.lineJoin = 'round'; f.lineWidth = w; f.strokeStyle = col; P(f, pts); f.stroke(); f.restore(); }
  const BEAT = (i) => FEAT.beats[i] || 0;

  // sky colour at height v (0 horizon .. 1 top) for dawn progress k
  function skyCol(v, k) {
    const st = [[0, mix(C.plum, mix(C.amber, C.parch, .45), k)], [.25, mix(C.plum, C.blush, k)], [.6, mix(C.dusk, C.rose, k)], [1, mix(C.night, mix(C.dusk, C.rose, .45), k)]];
    for (let i = 1; i < st.length; i++) if (v <= st[i][0]) return mix(st[i - 1][1], st[i][1], inv(st[i - 1][0], st[i][0], v));
    return st[st.length - 1][1];
  }
  function sky(yH, span, k) {
    s.fillStyle = vgrad(yH - span, yH, [[0, skyCol(1, k)], [.4, skyCol(.6, k)], [.75, skyCol(.25, k)], [1, skyCol(0, k)]]);
    s.fillRect(-2500, yH - 4000, 6000, 4000 + 2);
  }
  // whiplash cloud ribbons drifting across the sky
  function clouds(yH, k, t, n = 4, seed = 3) {
    const r = rng(seed);
    for (let i = 0; i < n; i++) {
      const y = yH - 180 - r() * 640, L = 420 + r() * 380, x0 = ((r() * 1800 + t * (14 + r() * 18)) % 2000) - 600, dir = r() < .5 ? 1 : -1;
      vine(s, whip([x0, y], [x0 + L * .3, y - 40], [x0 + L * .7, y + 34], [x0 + L, y - 10], .55, dir, 26), 30, 10, mix(C.rose, C.blush, k), 1);
    }
  }
  // the sun: long gold ray-petals behind a Mucha halo
  function sun(cx, cy, R, rot, lit, rayK) {
    const n = 20;
    for (let i = 0; i < n; i++) {
      const a = rot * .6 + i / n * TAU, L = R * (i % 2 ? .45 : .75) * rayK * (1 + .08 * Math.sin(i * 1.7 + rot * 9));
      if (L > 8) petal(s, cx + Math.cos(a) * R * .92, cy + Math.sin(a) * R * .92, a, L, R * .11, i % 2 ? C.parch : C.gold, C.umber, 12);
    }
    halo(cx, cy, R, rot, lit);
    glowAt(cx, cy, R * 2.4, `rgba(255,190,120,${.24 * lit})`);
  }
  // a far bank of Nouveau roofs: domes, a spire, chimneys
  function skyline(yH, k, seed = 5, x0 = -600, x1 = 1700, hk = 1) {
    const r = rng(seed), pts = [[x0, yH + 14]];
    let x = x0;
    while (x < x1) {
      const w = 70 + r() * 110, h = (30 + r() * 80) * hk, ty = r();
      if (ty < .3) { pts.push([x, yH - h * .6]); for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; pts.push([x + w / 2 + Math.cos(a) * w / 2, yH - h * .6 + Math.sin(a) * w * .5 * hk]); } pts.push([x + w, yH - h * .6]); }
      else if (ty < .45) { pts.push([x, yH - h], [x + w / 2, yH - h - 90 * hk], [x + w, yH - h]); }
      else { pts.push([x, yH - h], [x + w * .2, yH - h], [x + w * .2, yH - h - 26], [x + w * .32, yH - h - 26], [x + w * .32, yH - h], [x + w, yH - h]); }
      x += w; pts.push([x, yH - (20 + r() * 20) * hk]);
    }
    pts.push([x1, yH + 14]);
    shape(s, pts, mix(C.plum, C.dusk, k * .5), C.umber, 12);
    blackF(pts);
  }
  // water from the horizon down: a gradient, rows of wave strokes in perspective, the sun's reflection road
  function water(yH, yB, k, t, sx, refl = 1, o = {}) {
    const lit = o.lit ?? k;
    if (!o.noBase) {
    s.fillStyle = vgrad(yH, yB, [[0, mix(C.dusk, mix(C.rose, C.parch, .45), lit)], [.3, mix(C.deep, mix(C.teal, C.rose, .45), lit)], [1, mix(C.deep, C.teal, lit * .8)]]);
    s.fillRect(-2500, yH, 6000, 5000);
    blackF([[-2500, yH], [3500, yH], [3500, yH + 5000], [-2500, yH + 5000]]);
    }
    const N = o.rows || 13, clip = o.clipX;
    for (let i = 0; i < N; i++) {
      const v = (i + .5) / N, y = yH + (yB - yH) * Math.pow(v, 1.7), w = lerp(4, 20, v), L = lerp(70, 360, v);
      for (let j = 0; j < 6; j++) {
        const x = ((hash(i * 31 + j * 7 + 3) * 2000 + t * lerp(12, 60, v) * (j % 2 ? 1 : .7)) % 2000) - 460;
        if (clip && x > clip(y)) continue;
        const pts = cub([x, y], [x + L * .3, y - w * 1.4], [x + L * .7, y + w * 1.4], [x + L, y], 10);
        stroke2(pts, w, (i + j) % 3 ? mix(C.deep, C.sage, .3 + lit * .6) : mix(C.dusk, C.gold, lit * .8));
      }
    }
    if (refl > 0) for (let i = 0; i < N + 4; i++) {
      const v = (i + .3) / (N + 4), y = yH + 8 + (yB - yH) * Math.pow(v, 1.7), hw = lerp(30, 230, v) * (.7 + .3 * Math.sin(t * 3 + i * 1.9)), hh = lerp(4, 18, v);
      const x = sx + Math.sin(t * 1.3 + i * 2.3) * lerp(6, 40, v);
      shape(s, ell(x, y, hw, hh, 20), i % 2 ? C.gold : C.parch, C.umber, 8);
      glowAt(x, y, hw * 1.2, `rgba(255,210,140,${.22 * refl})`);
    }
  }
  // an iris clump: whiplash stems with lily heads that open with u
  function irises(x, y, sc, u, seed, cols = [C.rose, C.cream]) {
    const r = rng(seed);
    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * 70 * sc + (r() - .5) * 30, hh = (380 + r() * 220) * sc, dir = r() < .5 ? 1 : -1, tip = [x + dx + dir * 60 * sc, y - hh];
      vine(s, whip([x + dx, y], [x + dx - dir * 50 * sc, y - hh * .4], [x + dx + dir * 40 * sc, y - hh * .75], tip, .35, dir, 24), 20 * sc, 9 * sc, C.olive);
      petal(s, x + dx, y - 40 * sc, -Math.PI / 2 - dir * .5, 220 * sc, 34 * sc, C.sage, C.umber, 10);
      lily(s, tip[0], tip[1], -Math.PI / 2 + dir * .2, 120 * sc, clamp(u), cols);
    }
  }
  function pad(x, y, rx, ry, rot, col = C.sage) {
    const pts = [[x, y]]; for (let i = 0; i <= 30; i++) { const a = rot + .35 + i / 30 * (TAU - .7); pts.push([x + Math.cos(a) * rx, y + Math.sin(a) * ry]); }
    shape(s, pts, col, C.umber, 12);
  }
  // the Salvation Army bass drum, floating on its side; local units, ~460 px tall at sc 1
  function drum(x, y, sc, rot, k) {
    s.save(); s.translate(x, y); s.rotate(rot); s.scale(sc, sc); const lw = 14 / sc;
    shape(s, ell(250, -16, 95, 232), mix(C.ruby, C.plum, .4), C.umber, lw);
    shape(s, [[0, -230], [250, -248], [250, 216], [0, 230]], C.ruby, C.umber, lw);
    const zz = []; for (let i = 0; i <= 6; i++) zz.push([i % 2 ? 236 : 20, lerp(-212, 212, i / 6)]);
    line(zz, C.umber, 22 / sc + 6); line(zz, C.gold, 12 / sc);
    shape(s, ell(0, 0, 100, 236), C.gold, C.umber, lw);
    shape(s, ell(0, 0, 78, 204), mix(C.cream, C.parch, .2), C.umber, lw * .8);
    lily(s, 0, 40, -Math.PI / 2, 120, .8, [C.ruby, C.blush]);
    s.restore();
    glowAt(x - 30 * sc, y - 120 * sc, 120 * sc, `rgba(255,220,170,${.25 * k})`);
  }
  // the tuba: a coil of gold tubing, a mouthpipe, a flared bell; ~420 px at sc 1
  function tuba(x, y, sc, rot, k) {
    s.save(); s.translate(x, y); s.rotate(rot); s.scale(sc, sc); const lw = 14 / sc;
    const coil = ell(0, 0, 120, 130, 40); coil.push(coil[0]);
    line(coil, C.umber, 52 / sc + 10); line(coil, C.gold, 52 / sc);
    line([[-60, -110], [-150, -210]], C.umber, 34 / sc + 10); line([[-60, -110], [-150, -210]], C.ochre, 34 / sc);
    const bell = [[70, -100], ...cub([70, -230], [70, -300], [10, -340], [-50, -380], 12), ...cub([300, -380], [230, -340], [150, -300], [150, -230], 12), [150, -100]];
    shape(s, bell, C.gold, C.umber, lw);
    shape(s, ell(125, -380, 175, 40), C.ochre, C.umber, lw);
    shape(s, ell(125, -378, 120, 22), mix(C.umber, C.ochre, .4), C.umber, lw * .7);
    s.restore();
    glowAt(x + 125 * sc * Math.cos(rot) + 380 * sc * Math.sin(rot), y - 380 * sc * Math.cos(rot), 160 * sc, `rgba(255,220,150,${.35 * k})`);
  }
  function tambourine(x, y, sc, rot, t, k) {
    shape(s, ell(x, y, 110 * sc, 42 * sc, 36, rot), C.parch, C.umber, 14);
    shape(s, ell(x, y - 8 * sc, 82 * sc, 26 * sc, 36, rot), C.cream, C.umber, 10);
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, px = x + Math.cos(a) * 100 * sc, py = y + Math.sin(a) * 38 * sc; shape(s, ell(px, py, 20 * sc, 12 * sc, 12, rot), C.gold, C.umber, 8); glowAt(px, py, 40 * sc, `rgba(255,230,170,${(.3 + .7 * beatPulse(t + i * .07, 7)) * .5 * k})`); }
  }
  // the little rowboat seen from behind: hull, the inside, oars that dip on every beat
  function boat(x, y, sc, t, onWater) {
    const bi = lastBeat(t), dip = beatPulse(t, 4.5), ph = clamp((t - BEAT(bi)) / .5);
    s.save(); s.translate(x, y); s.scale(sc, sc); const lw = 16 / sc;
    for (const d of [-1, 1]) {
      const a = lerp(-.42, .5, dip), sw = lerp(-.3, .3, ph) * .6, L = 330;
      const tip = [d * (150 + Math.cos(a) * L), -30 + Math.sin(a) * L + sw * 40];
      line([[d * 150, -30], tip], C.umber, 24 / sc + 10); line([[d * 150, -30], tip], C.ochre, 24 / sc);
      petal(s, tip[0] - d * Math.cos(a) * 30, tip[1] - Math.sin(a) * 30, Math.atan2(Math.sin(a), d * Math.cos(a)), 120, 34, C.gold, C.umber, lw * .8);
    }
    shape(s, [[-190, -40], ...cub([-190, -40], [-150, 60], [-70, 100], [0, 104], 12), ...cub([0, 104], [70, 100], [150, 60], [190, -40], 12)], C.ochre, C.umber, lw);
    shape(s, [[-176, -38], ...cub([-176, -38], [-120, -96], [120, -96], [176, -38], 16)], mix(C.umber, C.ochre, .45), C.umber, lw * .8);
    line([[-150, -10], ...cub([-150, -10], [-80, 40], [80, 40], [150, -10], 12)], C.umber, 12 / sc);
    shape(s, [[-120, -66], [120, -66], [120, -48], [-120, -48]], C.parch, C.umber, lw * .7);
    s.restore();
    if (onWater > 0) for (const d of [-1, 1]) { const a = lerp(-.42, .5, dip); if (dip > .3) glowAt(x + d * (150 + Math.cos(a) * 330) * sc, y + (-30 + Math.sin(a) * 330) * sc, 90 * sc, `rgba(255,240,210,${.6 * dip * onWater})`); }
  }

  // ---- shots ----
  // 165.0: the closed curtain's seam of light turns a quarter turn and becomes the horizon; the folds of the
  // velvet become bands of sky above and waves below; on the second "shine" the sun's rim breaks the line
  function seam(t, lt, dur) {
    const th = kf(t, [[165.15, Math.PI / 2], [166.4, 0]], ease.inOut), m = ease.inOut(inv(165.3, 166.75, t));
    cam(540, kf(t, [[165.6, 960], [167.4, 1010]]), kf(t, [[165.0, 1.22], [167.4, 1.0]], ease.inOut), th);
    const yH = 960, k = .25 * m + .2 * inv(166.2, 167.4, t), flare = .5 + .7 * hit(t, 165.45, 2.2) + .8 * hit(t, 166.55, 2.2);
    s.fillStyle = mix(C.plum, C.dusk, m); s.fillRect(-2500, -2500, 6000, 7000);
    const gap = lerp(10, 4, m), N = 13, xs = []; for (let x = -800; x <= 1900; x += 60) xs.push(x);
    const edge = (sg, j) => { if (j === 0) return xs.map((x) => [x, yH + sg * gap]); const v = j / N, o = lerp(j * 105, (sg < 0 ? 1150 : 1100) * Math.pow(v, sg < 0 ? 1 : 1.6), m) + gap; return xs.map((x) => [x, yH + sg * (o + lerp(14, 8, m) * Math.sin(x * .004 + j * 1.3 + t * .6))]); };
    const band = (sg, j) => { const a = edge(sg, j), b = edge(sg, j + 1).reverse(); return [...a, ...b]; };
    // the sky half (velvet folds that become sky bands)
    for (let j = 0; j < N; j++) {
      const v = (j + .5) / N, cur = j % 2 ? C.ruby : mix(C.ruby, C.plum, .65), fl = mix(cur, skyCol(v, k), m);
      shape(s, band(-1, j), fl, mix(C.umber, fl, m * .8), 14);
    }
    // the sun rises behind the line on the second shine
    const sy = kf(t, [[166.1, 1290], [167.4, 1090]], ease.out);
    if (t > 166.0) sun(540, sy, 300, t * .05, .3 + .5 * hit(t, 166.55, 1.5), inv(166.2, 167.4, t));
    // the water half (folds that become wave bands)
    for (let j = 0; j < N; j++) {
      const v = (j + .5) / N, cur = j % 2 ? mix(C.ruby, C.plum, .65) : C.ruby, wc = j % 2 ? mix(C.deep, C.dusk, k) : mix(C.teal, C.rose, k * .4), fl = mix(cur, wc, m);
      const pts = band(1, j); shape(s, pts, fl, C.umber, 14); blackF(pts);
    }
    // the folds break up into waves as the water takes over
    const wv = inv(.45, 1, m); if (wv > 0) { s.save(); s.globalAlpha = wv; water(yH + gap, 2100, k, t, 540, wv * .8, { noBase: 1, lit: k }); s.restore(); }
    // the seam of light, now the first light on the horizon
    const sl = xs.map((x) => [x, yH]);
    shape(s, [...xs.map((x) => [x, yH - gap - 2]), ...xs.map((x) => [x, yH + gap + 2]).reverse()], C.cream, null);
    lightLine(sl, lerp(16, 10, m), `rgba(255,236,190,${.9 * clamp(flare)})`);
    lightLine(sl, 70, `rgba(255,180,110,${.22 * flare})`);
    glowAt(540, yH, 700, `rgba(255,190,120,${.25 * flare})`);
    border(t, 1);
  }
  // 167.4: wide on the river; the sun climbs over the far roofs, its rays fan open; irises open in the dawn
  function sunrise(t, lt, dur) {
    cam(540, kf(lt, [[0, 1010], [dur, 960]]), kf(lt, [[0, 1.06], [dur, .98]], ease.out));
    const yH = 1090, k = kf(lt, [[0, .45], [dur, .7]]), pk = hit(t, 167.95, 1.6);
    sky(yH, 1300, k); clouds(yH, k, t, 4, 3);
    const sy = kf(lt, [[0, 1090], [dur, 880]], ease.out);
    sun(540, sy, 300, t * .05, .45 + .5 * pk, lerp(.9, 1.2, inv(0, dur, lt)) + .15 * pk);
    skyline(yH, k);
    water(yH, 2200, k, t, 540, .4 + .6 * inv(0, dur, lt));
    irises(70, 1960, 1.0, kf(lt, [[0, .1], [dur, .8]]), 11, [C.rose, C.cream]);
    irises(1030, 1980, .9, kf(lt, [[.3, 0], [dur, .7]]), 12, [C.gold, C.cream]);
    rain(t, 40, 21, .28 * (1 - k));
    border(t, 1);
  }
  // 169.47: low over the water, the dawn light sweeps across it left to right; the irises it passes open
  function sweep(t, lt, dur) {
    cam(kf(lt, [[0, 470], [dur, 610]]), 960, kf(lt, [[0, 1.12], [dur, 1.04]]));
    const yH = 700, k = .72, sxp = kf(lt, [[0, -300], [dur - .2, 1500]], ease.inOut), edge = (y) => sxp - (y - yH) * .45;
    sky(yH, 1100, k); clouds(yH, k, t, 3, 8);
    sun(200, 470, 240, t * .05, .6, 1.1 + .1 * beatPulse(t, 5));
    skyline(yH, k, 6, -600, 1800);
    water(yH, 2100, k, t, 200, .5, { lit: .15 });
    // the lit water, clipped left of the sweeping edge
    s.save(); s.beginPath(); s.moveTo(-2000, yH); s.lineTo(edge(yH), yH); s.lineTo(edge(2600), 2600); s.lineTo(-2000, 2600); s.closePath(); s.clip();
    water(yH, 2100, k, t, 200, 1, { lit: 1 });
    s.restore();
    // the light front itself, a glint running along the edge
    lightLine([[edge(yH), yH], [edge(2300), 2300]], 40, 'rgba(255,214,150,.35)');
    for (let i = 0; i < 18; i++) { const y = yH + 60 + i * 80, x = edge(y) - 40 - hash(i * 13) * 400; glowAt(x, y, 30 + 30 * hash(i), `rgba(255,240,200,${.5 * (.4 + .6 * beatPulse(t + i * .03, 6))})`); }
    for (const [x, sc, sd] of [[60, 1.05, 21], [420, .8, 22], [760, .9, 23], [1120, 1.1, 24]]) { const u = inv(x - 150, x + 250, edge(1700)); irises(x, 1990, sc, .15 + .85 * ease.out(u), sd, u > .5 ? [C.gold, C.cream] : [C.plum, C.dusk]); if (u > 0) glowAt(x, 1500, 260, `rgba(255,200,140,${.3 * u})`); }
    rain(t, 30, 25, .2 * (1 - inv(0, dur, lt)));
    border(t, 1);
  }
  // 171.5: the night's rain lifts off the river as mist, whiplash ribbons rising and curling on the beats;
  // the camera tilts up with them to the sun
  function mist(t, lt, dur) {
    cam(540, kf(lt, [[0, 1180], [dur, 860]], ease.inOut), kf(lt, [[0, 1.05], [dur, 1.0]]));
    const yH = 1260, k = kf(lt, [[0, .78], [dur, .9]]);
    sky(yH, 1400, k); clouds(yH, k, t, 4, 14);
    sun(540, kf(lt, [[0, 880], [dur, 820]]), 280, t * .05, .6 + .2 * beatPulse(t, 4), 1.2);
    skyline(yH, k, 7);
    water(yH, 2400, k, t, 540, 1);
    const b0 = lastBeat(171.45);
    s.save(); s.globalAlpha = .78;
    for (let i = 0; i < 7; i++) {
      const bt = BEAT(b0 + (i >> 1)), u = ease.out(inv(bt - .15, bt + .8, t)), dir = i % 2 ? 1 : -1, lift = (t - 171.3) * (70 + 30 * hash(i * 5));
      const x0 = dir > 0 ? -160 + 260 * hash(i) : 1240 - 260 * hash(i), y0 = yH + 300 - i * 80 - lift, L = 340 + 360 * hash(i * 3 + 1);
      vine(s, whip([x0, y0], [x0 + dir * L * .35, y0 - 120], [x0 + dir * L * .7, y0 + 60], [x0 + dir * L, y0 - 150], .9, -dir, 30), 64, 18, i % 2 ? C.cream : C.blush, u);
    }
    s.restore();
    rain(t, 40 * (1 - inv(0, 1.2, lt)), 27, .25 * (1 - inv(0, 1.2, lt)));
    border(t, 1);
  }
  // 173.53: the brass band's bass drum floats past, bobbing on the beats, a tambourine jingling beside it
  function drumShot(t, lt, dur) {
    cam(kf(lt, [[0, 760], [dur, 380]]), 1060, kf(lt, [[0, 1.1], [dur, 1.16]]));
    const yH = 560, k = .92;
    sky(yH, 900, k); clouds(yH, k, t, 3, 31);
    skyline(yH, k, 8, -800, 1900);
    water(yH, 2000, k, t, 700, 1);
    const bob = Math.sin(t * 2.4) * 14 - beatPulse(t, 5) * 22;
    const dx = kf(lt, [[0, 1200], [dur, 260]]), dy = 1080 + bob;
    for (let i = 0; i < 3; i++) pad(dx - 420 + i * 380 + 200 * Math.sin(i * 2.1), 1500 + i * 120, 120 + i * 20, 40 + i * 6, i * 1.3, i % 2 ? C.sage : C.olive);
    const wy = (x) => dy + 150 + Math.sin(x * .03 + t * 4) * 8;
    s.save(); s.beginPath(); s.moveTo(-1000, -1000); s.lineTo(3000, -1000); for (let x = 3000; x >= -1000; x -= 20) s.lineTo(x, x > dx - 200 && x < dx + 400 ? wy(x) : 3000); s.closePath(); s.clip();
    drum(dx, dy, .95, Math.sin(t * 1.6) * .06 - .05, k);
    s.restore();
    // the waterline round the drum: ripples lapping its lower body
    for (let i = 0; i < 3; i++) { const yy = dy + 150 + i * 34, w0 = 300 + i * 90, pts = []; for (let x = dx - 160 - w0 * .3; x <= dx + 360 + w0 * .3; x += 24) pts.push([x, yy + Math.sin(x * .03 + t * 4 + i) * 8]); stroke2(pts, 12 - i * 2, i ? mix(C.deep, C.sage, .8) : C.parch); }
    glowAt(dx + 100, dy + 150, 220, `rgba(255,220,160,${.2 + .2 * beatPulse(t, 5)})`);
    tambourine(dx - 330, 1290 + Math.sin(t * 2.4 + 1.3) * 10 - beatPulse(t, 6) * 12, 1.1, Math.sin(t * 1.9) * .08, t, k);
    border(t, 1);
  }
  // 175.57: drum and tuba circle a whirlpool and go down the hole; then the water smooths over
  function whirl(t, lt, dur) {
    cam(540, kf(lt, [[0, 1080], [dur, 1040]]), kf(lt, [[0, 1.0], [1.4, 1.14], [dur, 1.06]], ease.inOut), kf(lt, [[0, 0], [dur, -.08]]));
    const yH = 520, k = .95, cx = 540, cy = 1180, hole = 176.55;
    sky(yH, 900, k); clouds(yH, k, t, 3, 33);
    skyline(yH, k, 9, -800, 1900);
    water(yH, 2200, k, t, 540, .8);
    const sw = kf(t, [[175.567, .8], [hole, 1.6], [177.0, 1.2], [177.56, .25]], ease.inOut), spin = t * 1.6 + (t - 175.5) * (t - 175.5) * .9;
    const holeR = kf(t, [[175.567, 50], [hole, 120], [177.1, 20], [177.4, 0]]);
    shape(s, ell(cx, cy, 700 * clamp(sw, .2, 1), 300 * clamp(sw, .2, 1)), mix(C.teal, C.deep, .4 * sw), C.umber, 14);
    for (let i = 0; i < 7; i++) {
      const pts = []; for (let q = 0; q <= 28; q++) { const r = lerp(660, 40, q / 28), a = spin + i * TAU / 7 + (1 - r / 660) * 2.8 * sw; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * .43]); }
      stroke2(pts, 16 * clamp(sw, .3, 1), i % 2 ? mix(C.glass, C.parch, .4) : C.sage);
    }
    if (holeR > 1) { shape(s, ell(cx, cy, holeR, holeR * .43), C.deep, C.umber, 14); }
    // the band goes round and down
    for (const [kind, ph] of [['drum', 0], ['tuba', Math.PI]]) {
      const r = kf(t, [[175.567, 520], [hole, 150], [176.9, 0]], ease.in), a = spin * 1.1 + ph, sc = lerp(.12, .52, r / 520);
      if (r < 8) continue;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * .43 - 60 * sc;
      if (kind === 'drum') drum(x, y, sc, a * .3, k); else tuba(x, y, sc, Math.sin(a) * .4, k);
    }
    // splash of light as they go under, then rings spread
    const sp = hit(t, 176.9, 2.5);
    if (t > 176.9) { glowAt(cx, cy - 40, 260, `rgba(255,236,190,${.7 * sp})`); for (let i = 0; i < 3; i++) { const rr = (t - 176.9) * 380 - i * 90; if (rr > 10) { const rp = ell(cx, cy, rr, rr * .43); rp.push(rp[0]); stroke2(rp, 10, C.parch); } } }
    border(t, 1);
  }
  // 177.57: the little rowboat rows away up the sun's road on the beats, lifts off the water at the horizon
  // and rises into the halo; the camera pushes in until the sun is big and centred
  function rowboat(t, lt, dur) {
    const z = kf(t, [[177.567, 1.0], [178.9, 1.08], [180.633, 1.6]], ease.inOut);
    cam(540, kf(t, [[177.567, 1150], [178.9, 1080], [180.633, 720]], ease.inOut), z);
    const yH = 1100, k = 1;
    sky(yH, 1400, k); clouds(yH, k, t, 4, 41);
    const enter = hit(t, 180.25, 3) * (t > 180.25 ? 1 : 0);
    sun(540, 720, 300, t * .05, .6 + .2 * beatPulse(t, 4) + .5 * enter, 1.25 + .12 * beatPulse(t, 5));
    skyline(yH, k, 10, -600, 1700, .55);
    water(yH, 2500, k, t, 540, 1);
    // lily pads sliding past as the boat moves out
    for (let i = 0; i < 4; i++) { const py = 1500 + ((t - 177.5) * 260 + i * 260) % 1100, px = i % 2 ? 180 + i * 40 : 900 - i * 40; pad(px, py, lerp(60, 160, inv(1300, 2500, py)), lerp(20, 54, inv(1300, 2500, py)), i * 1.7, i % 2 ? C.sage : C.olive); if (i % 2 === 0) lily(s, px + 20, py - 10, -Math.PI / 2, lerp(50, 110, inv(1300, 2500, py)), .8, [C.cream, C.blush]); }
    const u1 = ease.inOut(inv(177.567, 178.9, t)), u2 = ease.inOut(inv(178.85, 180.2, t)), gone = ease.in(inv(180.2, 180.6, t));
    const bx = 540 + Math.sin(t * 1.4) * 10 * (1 - u2), by = lerp(lerp(1720, 1112, u1), 735, u2), sc = lerp(lerp(.95, .32, u1), .26, u2) * (1 - gone), onW = 1 - inv(178.85, 179.2, t);
    // the wake behind it on the water
    if (onW > 0) for (let i = 1; i <= 4; i++) { const yy = by + (40 + i * 90) * sc, hw = (150 + i * 110) * sc, ph = Math.sin(t * 5 - i) * 6 * sc; stroke2(cub([bx - hw, yy - 30 * sc + ph], [bx - hw * .4, yy + 26 * sc], [bx + hw * .4, yy + 26 * sc], [bx + hw, yy - 30 * sc - ph], 12), lerp(12, 7, i / 4) * onW, C.parch); }
    if (sc > .01) boat(bx, by, sc, t, onW);
    // the boat in black on the light layer too, so it stays a silhouette against the sun's glow
    const s0 = s; s = f; f.save(); f.globalAlpha = .9 * inv(178.6, 179.6, t); f.filter = 'brightness(0)'; try { if (f.globalAlpha > 0 && sc > .01) boat(bx, by, sc, t, 0); } finally { f.restore(); s = s0; }
    if (u2 > 0) { glowAt(bx, by - 40 * sc, 420 * sc + 60, `rgba(255,236,190,${.25 * u2})`); for (let i = 0; i < 6; i++) { const dy = ((t * 400 + i * 120) % 500) * sc * 2; glowAt(bx + (i - 2.5) * 70 * sc, by + 60 * sc + dy, 14, `rgba(220,240,255,${.6 * (1 - u2 * .5)})`); } }
    glowAt(540, 720, 420, `rgba(255,240,200,${.6 * enter})`);
    border(t, 1);
  }
  chapter('c09', SEC.b2, SEC.out, [
    [SEC.b2, seam],
    [167.4, sunrise],
    [169.467, sweep],
    [171.5, mist],
    [173.533, drumShot],
    [175.567, whirl],
    [177.567, rowboat],
  ], { fx: PAINT });
})();

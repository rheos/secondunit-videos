// LOOK PROBE: Art Nouveau, painted. 37.7 - 56.0 ("bottle full of rain" into the first four "clap hands").
// Gemma Luna loves Art Nouveau. No figure: the movement's objects carry it (Guimard ironwork and his
// lily-bud Metro lamps, Galle glass, Tiffany-style stained glass, Mucha's halo circles and borders).
// Flat underpainting with heavy umber contours (>= 12 px, so the brushstrokes follow them instead of
// dissolving them), muted Mucha palette, light (lamps, glass, rain glints) on the light layer.
const LOOK = { span: [37.7, 56.0] };

(() => {
  const C = {
    cream: '#efe2c4', parch: '#e2cc9c', gold: '#c9a046', ochre: '#a87a2c', sage: '#93a274', olive: '#5d6c45',
    teal: '#2f5a55', deep: '#1c3433', rose: '#c98a7a', blush: '#e2b4a0', plum: '#5e3b4e', umber: '#33241a',
    night: '#1e2a40', dusk: '#3d4a68', ruby: '#a8402e', amber: '#f0b04a', glass: '#6f9a8a',
  };
  const PAINT = { boil: 6, bloom: 1.15, flowK: .7, strokeK: .8, grain: .06, vig: .45, sat: .92, con: 1.06, lift: .03, tint: [1, .9, .74], tintK: .1, scratch: 0, dust: .05, weave: .3, flick: .01 };
  // ---- drawing (g = s underpainting, or f light layer) ----
  const P = (g, pts) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); };
  function shape(g, pts, fillC, lineC = C.umber, lw = 14) { P(g, pts); g.closePath(); if (fillC) { g.fillStyle = fillC; g.fill(); } if (lineC) { g.lineJoin = 'round'; g.lineWidth = lw; g.strokeStyle = lineC; g.stroke(); } }
  function glowAt(x, y, r, col, a = 1) { if (!(r > .5)) return; f.save(); f.globalCompositeOperation = 'lighter'; f.globalAlpha = a; const gr = f.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); f.fillStyle = gr; f.fillRect(x - r, y - r, r * 2, r * 2); f.restore(); }
  // a cubic through four points, sampled
  const cub = (p0, p1, p2, p3, n = 40) => [...Array(n + 1)].map((_, i) => { const u = i / n, v = 1 - u; return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]; });
  // the whiplash: a path that ends in a tightening spiral (the movement's signature curve)
  function whip(p0, p1, p2, p3, curl = 1, dir = 1, n = 50) {
    const a = cub(p0, p1, p2, p3, n), [ex, ey] = a[a.length - 1], [px, py] = a[a.length - 3];
    let ang = Math.atan2(ey - py, ex - px), r = Math.hypot(p3[0] - p2[0], p3[1] - p2[1]) * .35 * curl;
    let cx = ex - Math.sin(ang) * r * dir, cy = ey + Math.cos(ang) * r * dir, th = ang - Math.PI / 2 * dir;
    for (let i = 0; i < 40 * curl; i++) { th += .16 * dir; r *= .965; a.push([cx + Math.cos(th) * r, cy + Math.sin(th) * r]); }
    return a;
  }
  // a tapered stroke along a path, grown to fraction u (vines grow)
  function vine(g, pts, w0, w1, col, u = 1, outline = C.umber) {
    const n = Math.max(2, Math.floor(pts.length * clamp(u))); if (n < 2 || u <= 0) return;
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (const [cl, extra] of outline ? [[outline, 8], [col, 0]] : [[col, 0]]) {
      g.strokeStyle = cl;
      for (let i = 1; i < n; i++) { g.lineWidth = lerp(w0, w1, i / (pts.length - 1)) + extra; g.beginPath(); g.moveTo(...pts[i - 1]); g.lineTo(...pts[i]); g.stroke(); }
    }
  }
  // an almond leaf / petal from base (x, y) along angle, opened 0..1
  function petal(g, x, y, ang, len, wid, fillC, lineC = C.umber, lw = 10) {
    const d = [Math.cos(ang), Math.sin(ang)], n = [-d[1], d[0]], tip = [x + d[0] * len, y + d[1] * len];
    const pts = [...cub([x, y], [x + d[0] * len * .3 + n[0] * wid, y + d[1] * len * .3 + n[1] * wid], [x + d[0] * len * .75 + n[0] * wid * .7, y + d[1] * len * .75 + n[1] * wid * .7], tip, 14),
      ...cub(tip, [x + d[0] * len * .75 - n[0] * wid * .7, y + d[1] * len * .75 - n[1] * wid * .7], [x + d[0] * len * .3 - n[0] * wid, y + d[1] * len * .3 - n[1] * wid], [x, y], 14)];
    shape(g, pts, fillC, lineC, lw);
  }
  // a lily (or iris): petals fanning from a point, `open` 0..1
  function lily(g, x, y, ang, sz, open, cols = [C.cream, C.blush]) {
    for (let i = 0; i < 6; i++) { const a = ang + (i - 2.5) * lerp(.12, .48, open), L = sz * (i % 2 ? .9 : 1.05) * lerp(.55, 1, open); petal(g, x, y, a, L, sz * .2, cols[i % 2], C.umber, Math.max(6, sz * .05)); }
    g.fillStyle = C.gold; g.beginPath(); g.arc(x, y, sz * .09, 0, TAU); g.fill();
  }
  // Mucha's halo: concentric rings with a mosaic band and spokes
  function halo(cx, cy, R, rot = 0, lit = 0) {
    shape(s, circle(cx, cy, R), C.parch, C.umber, 16);
    shape(s, circle(cx, cy, R * .86), C.gold, C.umber, 10);
    const n = 28; for (let i = 0; i < n; i++) { const a0 = rot + i / n * TAU, a1 = rot + (i + .78) / n * TAU; shape(s, [[cx + Math.cos(a0) * R * .86, cy + Math.sin(a0) * R * .86], [cx + Math.cos(a1) * R * .86, cy + Math.sin(a1) * R * .86], [cx + Math.cos(a1) * R * .7, cy + Math.sin(a1) * R * .7], [cx + Math.cos(a0) * R * .7, cy + Math.sin(a0) * R * .7]], i % 2 ? C.sage : C.rose, C.umber, 6); }
    shape(s, circle(cx, cy, R * .7), C.cream, C.umber, 12);
    if (lit > 0) glowAt(cx, cy, R * 1.1, `rgba(255,214,150,${.35 * lit})`);
  }
  const circle = (x, y, r, n = 72) => [...Array(n)].map((_, i) => [x + Math.cos(i / n * TAU) * r, y + Math.sin(i / n * TAU) * r]);
  // rain: long curving glints on the light layer
  function rain(t, n, seed, a = .5, sp = 2100, lean = .12) {
    const r = rng(seed); f.save(); f.globalCompositeOperation = 'lighter'; f.lineCap = 'round';
    for (let i = 0; i < n; i++) { const x0 = r() * (W + 500) - 250, ph = r(), L = 60 + r() * 110, y = ((ph * (H + 500) + t * sp * (.7 + r() * .6)) % (H + 500)) - 250, x = x0 + y * lean;
      f.strokeStyle = `rgba(200,220,255,${a * (.3 + r() * .7)})`; f.lineWidth = 2 + r() * 3; f.beginPath(); f.moveTo(x, y); f.quadraticCurveTo(x - lean * L * .5 + 6, y - L * .5, x - lean * L, y - L); f.stroke(); }
    f.restore();
  }
  // a slender Mucha hand: the shared rig, narrowed, cream with a blush shade and a heavy contour
  function hand(x, y, sc, o, tone = C.blush) {
    s.save(); s.translate(x, y); s.scale(.82, 1); s.translate(-x, -y);
    const h = handShape(x, y, sc, { ...o, spread: .02 }), lw = Math.max(9, sc * .055);
    shape(s, h.cuff, C.teal, C.umber, lw);
    for (const p of [...h.fingers, h.thumb, h.palm]) shape(s, p, tone, C.umber, lw);
    s.restore();
  }
  function clapPair(t, cx, cy, sc, k, { tilt = .14, tone = C.blush } = {}) {
    const lt = t - k;
    const gap = (lt < 0 ? ease.in(clamp(-lt / .45)) : .45 * ease.out(clamp(lt / .6)) * (1 - .3 * ease.inOut(clamp((lt - .6) / 1.4)))) * sc;
    const sq = hit(t, k, 12) * .08;
    hand(cx - gap - sc * .5, cy + sc * .9, sc * (1 - sq), { dir: -1, rot: tilt + sq }, tone);
    hand(cx + gap + sc * .5, cy + sc * .9, sc * (1 - sq), { dir: 1, rot: -tilt - sq }, tone);
  }
  // a Guimard Metro lamp: a whiplash iron stem bending over into a glowing ruby lily-bud lamp
  function guimard(x, y, h, dir, lit, sway = 0) {
    const top = [x + dir * h * .28, y - h], stem = cub([x, y], [x - dir * h * .05, y - h * .55], [x + dir * h * .05 + sway, y - h * 1.08], top, 50);
    vine(s, stem, 34, 18, C.olive);
    const [bx, by] = stem[stem.length - 1], bud = blobPts(bx + dir * 20, by + 60, 46, 74, 5, .02, 30);
    shape(s, bud, C.ruby, C.umber, 12);
    if (lit > 0) { glowAt(bx + dir * 20, by + 60, 300, `rgba(255,120,60,${.5 * lit})`); glowAt(bx + dir * 20, by + 60, 70, `rgba(255,230,190,${.9 * lit})`); }
    for (let i = 0; i < 3; i++) petal(s, bx + dir * 20, by + 10, -Math.PI / 2 + (i - 1) * .6, 70, 22, C.olive, C.umber, 8);
  }
  // a stained-glass panel: lead lines, panes; light comes through the panes on the light layer
  function glassPanel(x, y, w, h, t, lights) {
    shape(s, [[x, y + h], [x, y + w / 2], ...circle(x + w / 2, y + w / 2, w / 2, 60).filter(([px, py]) => py <= y + w / 2 + .1).sort((a, b) => a[0] - b[0]), [x + w, y + w / 2], [x + w, y + h]], C.deep, C.umber, 22);
    const r = rng(9), cols = [C.amber, C.rose, C.sage, C.gold, C.glass, C.plum];
    // panes: rows of uneven quads in muted glass colours, leaded; each column lights with its iris
    const rows = 7, colsN = 4;
    for (let j = 0; j < rows; j++) for (let i = 0; i < colsN; i++) {
      const x0 = x + w * i / colsN + (i ? (r() - .5) * 60 : 0), x1 = x + w * (i + 1) / colsN + (i < colsN - 1 ? (r() - .5) * 60 : 0);
      const y0 = y + w / 2 + (h - w / 2) * j / rows, y1 = y + w / 2 + (h - w / 2) * (j + 1) / rows;
      shape(s, [[x0, y0 + (r() - .5) * 40], [x1, y0 + (r() - .5) * 40], [x1, y1], [x0, y1]], [C.deep, C.teal, C.glass, C.dusk][(i + j * 3 + (r() * 4 | 0)) % 4], C.umber, 14);
      const on = lights[i] || 0; if (on > 0) glowAt((x0 + x1) / 2, (y0 + y1) / 2, 140, `rgba(${[255, 255, 200, 255][i]},${[200, 150, 230, 210][i]},${[120, 140, 170, 90][i]},${.28 * on})`);
    }
    // iris stems rising through the panes, flowers at top
    for (let i = 0; i < 4; i++) {
      const sx = x + w * (.16 + i * .23), on = lights[i] || 0;
      const stem = whip([sx, y + h], [sx - 40, y + h * .7], [sx + 50, y + h * .45], [sx + (i % 2 ? 40 : -40), y + h * .32], .5, i % 2 ? 1 : -1, 30);
      vine(s, stem, 22, 10, C.sage);
      lily(s, sx + (i % 2 ? 40 : -40), y + h * .3, -Math.PI / 2, 130, .5 + .5 * on, [cols[i], C.cream]);
      if (on > 0) glowAt(sx, y + h * .3, 260, `rgba(255,200,140,${.55 * on})`);
    }
  }
  // a Mucha border: double frame with an arched top, corner tendrils
  function border(t, u = 1) {
    s.save(); s.setTransform(.5, 0, 0, .5, 0, 0);
    const m = 46; s.lineJoin = 'round';
    for (const [lw, c, k] of [[34, C.umber, 0], [20, C.gold, 0], [10, C.umber, 18]]) { s.lineWidth = lw; s.strokeStyle = c; s.beginPath(); s.moveTo(m + k, H - m - k); s.lineTo(m + k, 420); s.arc(W / 2, 420, W / 2 - m - k, Math.PI, 0); s.lineTo(W - m - k, H - m - k); s.closePath(); s.stroke(); }
    for (const sx of [1, -1]) { const x0 = sx > 0 ? m : W - m; vine(s, whip([x0, H - 300], [x0 + sx * 120, H - 420], [x0 + sx * 40, H - 560], [x0 + sx * 180, H - 620], .7, sx, 30), 18, 8, C.sage, u); }
    s.restore();
  }

  // ---- shots ----
  // 37.7: an arched window wrapped in ironwork tendrils; a Galle glass bottle on the sill fills with rain; vines grow
  function window_(t, lt, dur) {
    cam(540, kf(lt, [[0, 900], [dur, 1040]]), kf(lt, [[0, 1.0], [dur, 1.3]]));
    s.fillStyle = C.night; s.fillRect(-W, -H, W * 3, H * 3);
    halo(540, 520, 360, t * .05);
    // the wall: plum stucco
    shape(s, [[-200, 900], [1280, 900], [1280, 2400], [-200, 2400]], C.plum, null);
    // arched window
    const wx = 230, wy = 640, ww = 620, wh = 820;
    shape(s, [[wx, wy + wh], [wx, wy + ww / 2], ...circle(wx + ww / 2, wy + ww / 2, ww / 2).filter(([, py]) => py <= wy + ww / 2 + .1).sort((a, b) => a[0] - b[0]), [wx + ww, wy + ww / 2], [wx + ww, wy + wh]], C.amber, C.umber, 24);
    glowAt(540, wy + wh * .55, 520, 'rgba(255,190,110,.4)');
    // ironwork tendrils climbing the frame, growing through the line
    const gu = inv(0, dur, lt);
    for (const sx of [1, -1]) { const x0 = sx > 0 ? wx - 10 : wx + ww + 10; vine(s, whip([x0, wy + wh + 60], [x0 - sx * 120, wy + wh * .6], [x0 + sx * 60, wy + wh * .2], [x0 + sx * 150, wy + 40], .9, sx, 50), 26, 10, C.olive, .35 + .65 * gu);
      for (let i = 0; i < 4; i++) if (gu > .2 + i * .18) petal(s, x0 - sx * (30 + i * 10), wy + wh - i * 170, Math.PI + sx * (.6 + i * .3) - (sx > 0 ? Math.PI : 0), 80, 26, C.sage); }
    // sill and the glass bottle (Galle: tall, swelling, floral)
    shape(s, [[wx - 70, wy + wh], [wx + ww + 70, wy + wh], [wx + ww + 90, wy + wh + 60], [wx - 90, wy + wh + 60]], C.ochre, C.umber, 14);
    const bx = 600, by = wy + wh, bh = 360, fillK = kf(lt, [[0, .1], [dur - .1, .9]]);
    const bottle = [...cub([bx - 30, by - bh], [bx - 40, by - bh * .6], [bx - 120, by - bh * .45], [bx - 90, by], 20), ...cub([bx + 90, by], [bx + 120, by - bh * .45], [bx + 40, by - bh * .6], [bx + 30, by - bh], 20)];
    shape(s, bottle, C.glass, C.umber, 14);
    s.save(); P(s, bottle); s.closePath(); s.clip(); shape(s, [[bx - 200, by - bh * .9 * fillK + Math.sin(t * 6) * 6], [bx + 200, by - bh * .9 * fillK - Math.sin(t * 6) * 6], [bx + 200, by], [bx - 200, by]], C.teal, null);
    lily(s, bx, by - bh * .35, -Math.PI / 2, 90, .6, [C.rose, C.cream]); s.restore();
    glowAt(bx - 50, by - bh * .5, 60, 'rgba(220,255,240,.35)');
    rain(t, 120, 7, .55);
    border(t, gu);
  }
  // CLAP 1 (41.6): slender hands meet in front of a turning halo; lilies open around the ring on the clap
  function clap1(t, lt, dur) {
    const k = CLAPS[0], ok = ease.back(inv(k, k + .8, t));
    cam(540, kf(lt, [[0, 900], [dur, 860]]), kf(lt, [[0, 1.12], [.5, 1.0], [dur, .96]], ease.out));
    s.fillStyle = C.deep; s.fillRect(-W, -H, W * 3, H * 3);
    halo(540, 860, 520, t * .08, .5 * hit(t, k, 1.5) + .2);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t * .08, R = 560; lily(s, 540 + Math.cos(a) * R, 860 + Math.sin(a) * R, a, 120, ok * (i % 2 ? 1 : ease.back(inv(HANDS[0], HANDS[0] + .8, t))), i % 2 ? [C.cream, C.blush] : [C.gold, C.cream]); }
    clapPair(t, 540, 820, 240, k);
    glowAt(540, 900, 380, `rgba(255,230,180,${.35 * hit(t, k, 3)})`);
    rain(t, 70, 11, .4);
    border(t, 1);
  }
  // CLAP 2 (46.0): two Guimard lily-bud lamps over the wet street; they light on the clap, the hands between them
  function clap2(t, lt, dur) {
    const k = CLAPS[1], on = clamp(inv(k - .05, k + .1, t)) * (.85 + .15 * Math.sin(t * 17));
    cam(kf(lt, [[0, 500], [dur, 580]]), 980, kf(lt, [[0, .96], [dur, 1.1]]));
    s.fillStyle = C.night; s.fillRect(-W, -H, W * 3, H * 3);
    shape(s, [[-300, 1400], [1400, 1400], [1400, 2400], [-300, 2400]], C.dusk, null);
    // reflections of the lamps in the wet street
    for (const x of [170, 910]) for (let i = 0; i < 7; i++) { s.fillStyle = on ? C.ruby : C.plum; s.fillRect(x - 40 + Math.sin(t * 3 + i) * 14, 1450 + i * 70, 80 - i * 7, 26); if (on) glowAt(x, 1450 + i * 70, 70, `rgba(255,120,60,${.25 * on})`); }
    guimard(80, 1400, 1050, 1, on, Math.sin(t * .8) * 8); guimard(1000, 1400, 1050, -1, on, -Math.sin(t * .8) * 8);
    clapPair(t, 540, 860, 190, k, { tone: C.cream });
    rain(t, 150, 13, .55);
    border(t, 1);
  }
  // CLAP 3 (50.0): a stained-glass window of irises; on each beat after the clap another pane lights
  function clap3(t, lt, dur) {
    const k = CLAPS[2];
    cam(540, 1000, kf(lt, [[0, 1.12], [dur, .97]], ease.out));
    s.fillStyle = C.plum; s.fillRect(-W, -H, W * 3, H * 3);
    const bi = lastBeat(t), b0 = lastBeat(k);
    const lights = [0, 1, 2, 3].map((i) => t >= k ? clamp(inv(FEAT.beats[b0 + i] || 0, (FEAT.beats[b0 + i] || 0) + .25, t)) * (.8 + .2 * beatPulse(t, 6)) : 0);
    glassPanel(140, 300, 800, 1500, t, lights);
    clapPair(t, 540, 1400, 150, k, { tone: C.blush });
    glowAt(540, 1500, 260, `rgba(255,230,180,${.5 * hit(t, k, 3)})`);
    border(t, 1);
  }
  // CLAP 4 (54.1): the big one: hands huge in the halo, every tendril in the frame spirals open at once
  function clap4(t, lt, dur) {
    const k = CLAPS[3], u = ease.out(inv(k - .1, k + 1.0, t));
    cam(540, 900, kf(lt, [[0, 1.0], [dur, 1.16]], ease.in));
    s.fillStyle = C.teal; s.fillRect(-W, -H, W * 3, H * 3);
    halo(540, 860, 600, -t * .1, .3 + .4 * hit(t, k, 2));
    // tendrils whip out of the ring on the clap and curl
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + .13, dir = i % 2 ? 1 : -1, R = (q) => [540 + Math.cos(a + q[1] * dir) * q[0], 860 + Math.sin(a + q[1] * dir) * q[0]];
      vine(s, whip(R([610, 0]), R([720, .12]), R([820, .32]), R([880, .5]), .8, dir, 36), 30, 12, i % 3 ? C.sage : C.gold, u); }
    clapPair(t, 540, 800, 250, k, { tilt: .12 });
    glowAt(540, 900, 520, `rgba(255,225,170,${.3 * hit(t, k, 3)})`);
    rain(t, 60, 19, .35);
    border(t, 1);
  }
  chapter('nouveau', 37.7, 56.0, [[37.7, window_], [CLAPS[0] - .45, clap1], [CLAPS[1] - .45, clap2], [CLAPS[2] - .45, clap3], [CLAPS[3] - .45, clap4]], { fx: PAINT });
})();

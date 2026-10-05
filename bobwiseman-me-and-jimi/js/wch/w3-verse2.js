// w3-verse2: VERSE 2, 77.6 - 112.0 (Bob's beats 11-16, then 26-27 as the recording sings them).
// 77.63 before Beyonce / 80.33 before the Pixies / 83.47 she found her calling / 87.23 in the sixties (the plug
// connects, the room explodes) / 91.37 sermons about open tuning fitness / 96.4 plays slide guitar (slide 97.37) /
// 99.33 like no one's business / 101.47 I hope this song helps you / 105.6 remember her name / 108.97 Ellen McIlwaine.
// Harmonica answers: 89-90.5 (hair and swirls blown by the wind) and 97.6-99.1 (the slide's steam whistle).
(() => {
  const OT = (t) => onTwos(t, 12);
  const RECT = (x, y, w, h) => () => { s.beginPath(); s.rect(x, y, w, h); };
  const CIRC = (x, y, r) => () => { s.beginPath(); s.arc(x, y, r, 0, TAU); };
  const ELL = (x, y, rx, ry) => () => { s.beginPath(); s.ellipse(x, y, rx, ry, 0, 0, TAU); };
  const bg = (c) => shape(RECT(-40, -40, W + 80, H + 80), c);
  const cam = (cx, cy, k) => { s.translate(cx, cy); s.scale(k, k); s.translate(-cx, -cy); };
  const measure = (str, size) => { s.save(); s.font = `900 ${size}px "Superclarendon"`; const m = s.measureText(str).width; s.restore(); return m; };
  // carved text squeezed (never stretched) to fit maxW
  function fitText(str, x, y, size, maxW, c = INK, o = {}) { const m = measure(str, size); carveText(str, x, y, size, c, { ...o, w: m > maxW ? maxW : null }); }
  const ring = (x, y, r, lw, c = INK) => { s.beginPath(); s.arc(x, y, r, 0, TAU); s.lineWidth = lw; s.strokeStyle = c; s.stroke(); };

  // harmonica envelope (source/harmonica-band.json, 0..1)
  const HARM = [[76, .41], [76.5, .41], [77, .24], [77.5, .2], [78.5, .1], [79, 0], [88.5, 0], [89, .21], [89.5, .39], [90, .25], [90.6, .21], [91, 0], [97.5, 0], [98, .2], [98.5, .37], [99, .15], [99.4, 0], [120, 0]];
  const harm = (t) => clamp(kf(t, HARM, (x) => x) / .39);

  function stars(seed, n, x0, y0, x1, y1, t) {
    const r = rng(seed);
    for (let i = 0; i < n; i++) { const x = lerp(x0, x1, r()), y = lerp(y0, y1, r()), z = r();
      if (z < .22) { flick(x - 11, y, 0, 22, 2.6); flick(x, y - 11, Math.PI / 2, 22, 2.6); }
      else dot(x, y, hash(i * 31 + Math.floor(t * 4)) > .85 ? 1.4 : 2 + z * 2.2, CUT); }
  }
  // music note glyph (eighth note), head at (x, y)
  function note(x, y, k, c = INK, rot = 0) {
    withT(() => { s.translate(x, y); s.rotate(rot); s.scale(k, k);
      s.beginPath(); s.ellipse(0, 0, 15, 11, -.4, 0, TAU); s.fillStyle = c; s.fill();
      taper([[12, -4], [12, -62]], 5, 5, c); taper([[12, -62], [30, -44], [32, -24]], 6, 3, c); });
  }

  // ---------- 77.63 / 80.33: the street of giants ----------
  function marquee(x, y, w, h, str, t, seed) {
    shape(() => pathOf(chisel([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], seed, 3)), CUT, 6);
    const ix = x + 36, iy = y + 36, iw = w - 72, ih = h - 72;
    shape(RECT(ix, iy, iw, ih), INK);
    clipTo(RECT(ix, iy, iw, ih), () => rows(ix, iy, ix + iw, iy + ih, 0, 14, (u) => 1.2, CUT));
    shape(RECT(ix + 12, iy + 12, iw - 24, ih - 24), INK);
    fitText(str, x + w / 2, y + h / 2 + 4, ih * .56, iw - 60, CUT);
    // bulbs round the frame, chasing on threes
    const bx0 = x + 18, by0 = y + 18, bw = w - 36, bh = h - 36, per = 2 * (bw + bh), n = Math.round(per / 34), ph = Math.floor(t * 8) % 3;
    for (let i = 0; i < n; i++) { const d = i * per / n; let bx, by;
      if (d < bw) { bx = bx0 + d; by = by0; } else if (d < bw + bh) { bx = bx0 + bw; by = by0 + d - bw; }
      else if (d < 2 * bw + bh) { bx = bx0 + bw - (d - bw - bh); by = by0 + bh; } else { bx = bx0; by = by0 + bh - (d - 2 * bw - bh); }
      if ((i + ph) % 3) { dot(bx, by, 10, INK); dot(bx, by, 6.5, CUT); } else dot(bx, by, 8, INK); }
  }
  function street(t, seed) {
    bg(INK); stars(seed, 80, 40, 40, W - 40, 760, t);
    // far rooftops, carved in cut line
    const r = rng(seed + 5); let x = -40;
    while (x < W + 40) { const w = 120 + r() * 200, h = 120 + r() * 220;
      shape(() => pathOf([[x, 905], [x, 905 - h], [x + w, 905 - h], [x + w, 905]]), INK, 4, CUT);
      for (let j = 0; j < 6; j++) if (r() > .5) shape(RECT(x + 20 + (j % 3) * 36, 905 - h + 30 + Math.floor(j / 3) * 50, 18, 26), CUT);
      x += w + 10; }
  }
  function pavement() {
    shape(RECT(-40, 900, W + 80, 200), CUT); taper([[-40, 903], [W + 40, 903]], 12, 12);
    for (let i = -2; i < 16; i++) taper([[i * 160, 908], [i * 160 - 150, 1080]], 4, 7);
    taper([[-40, 980], [W + 40, 980]], 3, 4);
  }
  function plinth(x0, x1, y0, y1, seed) {
    shape(() => pathOf(chisel([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], seed, 3)), CUT, 7);
    clipTo(RECT(x0, y0, x1 - x0, y1 - y0), () => rows(x0, y0, x1, y1, 0, 18, () => 2.6, INK, 3, seed));
  }
  function pole(x, y0, y1) { shape(RECT(x - 14, y0, 28, y1 - y0), CUT, 5); for (let y = y0 + 40; y < y1; y += 70) taper([[x - 14, y], [x + 14, y + 8]], 3, 3); }
  function walker(t, tl, dur) {
    const x = lerp(230, 1320, OT(tl) / dur);
    ellen(x, 1040, .55, { pose: 'walk', t: OT(t), wind: harm(t) * .7, facing: 1 });
  }
  function beyonce(t, tl, dur) {
    withT(() => { cam(1150, 560, 1 + tl * .012);
      street(t, 11);
      // braces behind the cut-out
      taper([[930, 905], [1020, 300]], 24, 16, CUT); taper([[1390, 905], [1300, 300]], 24, 16, CUT);
      put('beyonce', 1160, 806, 770, { crop: [0, 0, 1, .86] });
      plinth(820, 1500, 790, 905, 5);
      pole(390, 330, 905);
      marquee(70, 120, 640, 230, 'BEYONCÉ', t, 3);
      pavement();
      walker(t, tl, dur);
    });
  }
  function pixies(t, tl, dur) {
    withT(() => { cam(800, 560, 1 + tl * .012);
      street(t, 23);
      taper([[500, 905], [600, 300]], 24, 16, CUT); taper([[1150, 905], [1050, 300]], 24, 16, CUT);
      put('pixies', 830, 806, 740);
      plinth(300, 1360, 790, 905, 9);
      pole(1610, 320, 905);
      marquee(1360, 110, 520, 220, 'PIXIES', t, 4);
      pavement();
      walker(t, tl, dur);
    });
  }

  // ---------- 83.47: teenage Ellen's bedroom, black and white ----------
  function amp(x, y, k, glow = 0) {
    withT(() => { s.translate(x, y); s.scale(k, k);
      const box = () => pathOf(chisel([[-82, -146], [82, -146], [86, 0], [-86, 0]], 17, 3));
      shape(box, INK);
      shape(RECT(-64, -108, 128, 96), CUT, 5);
      clipTo(RECT(-64, -108, 128, 96), () => { rows(-64, -108, 64, -12, .8, 13, () => 2.5, INK); rows(-64, -108, 64, -12, -.8, 13, () => 2.5, INK); });
      for (let i = 0; i < 3; i++) dot(-50 + i * 26, -128, 6, CUT);
      dot(58, -128, 9, CUT); dot(58, -128, 4, INK);
      shape(RECT(-30, -158, 60, 12), INK);
    });
  }
  const AMPX = 1240, AMPY = 1010, AMPK = .8, JACK = [AMPX + 58 * AMPK, AMPY - 128 * AMPK];
  function roomBase(t) {
    shape(RECT(-40, -40, W + 80, 860), CUT);
    clipTo(RECT(-40, -40, W + 80, 860), () => rows(-40, -40, W + 40, 820, Math.PI / 2, 46, () => 4, INK));
    taper([[-40, 120], [W + 40, 120]], 10, 10);
    // window, night outside
    shape(RECT(1400, 190, 330, 380), INK, 0); shape(RECT(1384, 174, 362, 412), null, 14, INK);
    dot(1630, 280, 46, CUT); dot(1650, 266, 40, INK);
    stars(5, 10, 1420, 330, 1720, 560, t);
    taper([[1565, 190], [1565, 570]], 10, 10, CUT); taper([[1400, 380], [1730, 380]], 10, 10, CUT);
    // a poster: a little guitar carved on paper
    shape(() => pathOf(chisel([[300, 210], [560, 210], [560, 520], [300, 520]], 8, 4)), INK);
    shape(RECT(322, 232, 216, 266), CUT); withT(() => { s.translate(430, 400); s.scale(.42, .42); guitar(0, 0, 1, -1.1, .5, 0); });
    // floor boards
    shape(RECT(-40, 820, W + 80, 300), CUT); taper([[-40, 822], [W + 40, 822]], 22, 22);
    for (let i = -6; i < 18; i++) taper([[i * 130, 834], [(i - 9) * 150 + 960 * .1 + i * 40, 1080]], 3, 7);
    // bed at left
    shape(() => pathOf([[60, 860], [640, 860], [640, 1000], [60, 1000]]), INK);
    shape(() => pathOf(chisel([[40, 700], [660, 700], [680, 880], [20, 880]], 4, 3)), CUT, 6);
    clipTo(() => pathOf([[40, 700], [660, 700], [680, 880], [20, 880]]), () => rows(20, 700, 680, 880, .6, 24, () => 4, INK));
    shape(ELL(160, 690, 110, 40), CUT, 6); taper([[30, 560], [30, 1010]], 26, 26); taper([[660, 760], [660, 1010]], 22, 22);
  }
  // the cable: from the guitar's tail to (ex, ey), drawn with a paper edge so it reads on anything
  function cable(pts, w = 11) { taper(pts, w + 8, w + 8, CUT); taper(pts, w, w, INK); }
  function room(t, tl, dur) {
    withT(() => { cam(1100, 860, 1 + tl * .04);
      roomBase(t);
      amp(AMPX, AMPY, AMPK);
      ellen(860, 1010, .85, { pose: 'hold', t, smile: .3 });
      // guitar tail (hold pose) -> floor -> the loose plug, lying by the amp
      const tail = [860 - 74 * .85, 1010 - 222 * .85];
      cable([tail, [tail[0] - 30, 900], [tail[0] - 10, 1012], [900, 1040], [1060, 1032], [1110, 1020]]);
      withT(() => { s.translate(1110, 1020); s.rotate(-.12);
        shape(RECT(0, -9, 46, 18), INK); shape(RECT(46, -6, 40, 12), CUT, 3); dot(88, 0, 6, CUT); ring(88, 0, 6, 2.5); });
    });
  }
  // 85.9 insert: her hand brings the plug to the amp's INPUT
  const SOCK = [1040, 300];
  function ampFace() {
    shape(RECT(-40, -40, W + 80, H + 80), CUT);
    clipTo(RECT(-40, -40, 760, H + 80), () => rows(-40, -40, 720, H + 40, Math.PI / 2, 92, () => 8, INK));
    shape(() => pathOf(chisel([[700, 50], [2000, 50], [2000, 1130], [700, 1130]], 7, 5)), INK);
    flicks(720, 60, 1900, 1100, 60, 0, 60, 3, 4);
    shape(RECT(770, 120, 1180, 330), CUT, 7);
    clipTo(RECT(770, 120, 1180, 330), () => rows(770, 120, 1950, 450, 0, 20, () => 1.6, INK));
    // labels and knobs
    [['INPUT', SOCK[0]], ['VOL', 1360], ['TONE', 1640]].forEach(([str, x]) => {
      shape(RECT(x - 110, 140, 220, 66), CUT); fitText(str, x, 175, 46, 190, INK); });
    for (const kx of [1360, 1640]) { dot(kx, 330, 78, INK); dot(kx, 330, 62, CUT); taper([[kx, 330], [kx + 34, 284]], 12, 6); for (let i = 0; i < 9; i++) { const a = Math.PI * .75 + i * Math.PI * 1.5 / 8; flick(kx + Math.cos(a) * 84, 330 + Math.sin(a) * 84, a, 14, 3, INK); } }
    // the socket
    dot(SOCK[0], SOCK[1], 72, INK); dot(SOCK[0], SOCK[1], 56, CUT); ring(SOCK[0], SOCK[1], 44, 5); dot(SOCK[0], SOCK[1], 30, INK);
    // grille
    shape(RECT(770, 500, 1180, 560), CUT, 7);
    clipTo(RECT(770, 500, 1180, 560), () => { rows(770, 500, 1950, 1060, .8, 30, () => 7, INK); rows(770, 500, 1950, 1060, -.8, 30, () => 7, INK); });
  }
  function plug(tip, ang) {
    // parts along -u from the tip: tip ball, sleeve, insulator, grip; then the cable
    const ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux;
    const at = (d, w) => [[tip[0] - ux * d + nx * w, tip[1] - uy * d + ny * w], [tip[0] - ux * d - nx * w, tip[1] - uy * d - ny * w]];
    const quad = (d0, d1, w0, w1, c, lw = 5) => { const a = at(d0, w0), b = at(d1, w1); shape(() => pathOf([a[0], b[0], b[1], a[1]]), c, lw); };
    cable([[tip[0] - ux * 330, tip[1] - uy * 330], [tip[0] - ux * 700, tip[1] - uy * 700 + 60], [tip[0] - ux * 1100, tip[1] - uy * 1100 + 260]], 30);
    quad(150, 340, 44, 40, INK, 0); clipTo(() => { const a = at(150, 44), b = at(340, 40); pathOf([a[0], b[0], b[1], a[1]]); }, () => { for (let d = 170; d < 340; d += 26) taper(at(d, 46), 4, 4, CUT); });
    quad(10, 150, 24, 26, CUT); for (const d of [60, 95]) taper(at(d, 24), 4, 4, INK);
    quad(100, 116, 27, 27, INK, 0);
    dot(tip[0] - ux * 6, tip[1] - uy * 6, 16, CUT); ring(tip[0] - ux * 6, tip[1] - uy * 6, 16, 4);
    return { at };
  }
  function hand(x, y, ang, k = 1) {
    // a fist from the back: knuckles toward the socket, sleeve trailing out of frame
    withT(() => { s.translate(x, y); s.rotate(ang); s.scale(k, k);
      taper([[-120, 10], [-700, 40]], 190, 230, INK);
      clipTo(() => { s.beginPath(); s.rect(-700, -120, 560, 260); }, () => rows(-700, -120, -140, 140, .2, 26, () => 3, CUT));
      taper([[-150, -100], [-150, 120]], 16, 16, CUT);
      const fist = () => smoothPath([[-130, -90], [-20, -110], [70, -80], [90, -10], [70, 80], [-30, 100], [-130, 90]]);
      shape(fist, CUT, 7);
      for (let i = 0; i < 4; i++) taper([[60 - i * 6, -70 + i * 44], [-10, -60 + i * 44]], 5, 2);
      taper([[-80, -70], [-10, -40], [40, -50]], 6, 3);
    });
  }
  function plugIn(t, tl) {
    const TC = 87.23, ang = Math.atan2(-.62, 1); // the plug points up and right toward the socket
    const ux = Math.cos(ang), uy = Math.sin(ang);
    const gap = OT(t) < TC ? kf(OT(t), [[85.9, 620], [86.45, 200], [86.85, 170], [TC - .04, 0]], ease.inOut) : 0;
    const shake = t < TC ? Math.sin(t * 40) * 2 : 0;
    const tip = [SOCK[0] - ux * gap + shake, SOCK[1] - uy * gap];
    ampFace();
    // contact: rings of energy out of the socket
    if (t >= TC) {
      const te = t - TC;
      clipTo(CIRC(SOCK[0], SOCK[1], 120 + te * 3600), () => {
        const cols = [RED, INK, CUT, INK];
        for (let j = 40; j >= 0; j--) { const r = j * 70 + wrap(te * 900, 280); dot(SOCK[0], SOCK[1], r, cols[(j % 4 + 4) % 4]); }
      });
      for (let i = 0; i < 18; i++) { const a = i * TAU / 18 + .2; flick(SOCK[0] + Math.cos(a) * (150 + te * 900), SOCK[1] + Math.sin(a) * (150 + te * 900), a, 120, 12, i % 2 ? CUT : INK); }
      if (te < .09) fx({ inv: 1 });
    }
    const P = plug(tip, ang);
    const g = P.at(250, 0)[0];
    hand(g[0], g[1], ang, 1);
  }

  // ---------- 87.6: the explosion of the sixties ----------
  function spiral(cx, cy, k, rot, c1, c2) {
    withT(() => { s.translate(cx, cy); s.rotate(rot); s.scale(k, k);
      const pts = []; for (let i = 0; i <= 80; i++) { const th = i / 80 * TAU * 2.6, r = 6 + th * 22; pts.push([Math.cos(th) * r, Math.sin(th) * r]); }
      taper(pts, 6, 70, c1); taper(pts, 2, 30, c2); });
  }
  function wavyText(str, cx, cy, size, maxW, t) {
    s.save(); s.font = `900 ${size}px "Superclarendon"`; s.textAlign = 'center'; s.textBaseline = 'middle';
    const ws = [...str].map((ch) => s.measureText(ch).width + size * .06), tot = ws.reduce((a, b) => a + b, 0), sc = Math.min(1, maxW / tot);
    let x = cx - tot * sc / 2; const tt = OT(t);
    [...str].forEach((ch, i) => { const w = ws[i] * sc, y = cy + Math.sin(i * .9 - tt * 7) * size * .2, rot = Math.sin(i * .9 - tt * 7 + 1.2) * .16;
      if (ch !== ' ') withT(() => { s.translate(x + w / 2, y); s.rotate(rot); s.scale(sc, 1 + .12 * Math.sin(i + tt * 9));
        s.lineJoin = 'round'; s.lineWidth = size * .2; s.strokeStyle = INK; s.strokeText(ch, 0, 0); s.fillStyle = CUT; s.fillText(ch, 0, 0); });
      x += w; });
    s.restore();
  }
  function explosion(t, tl) {
    const te = t - 87.23, C = [AMPX, AMPY - 70], tt = OT(t), h = harm(t);
    // the room, being blown away at the edges for the first moment
    roomBase(t);
    clipTo(CIRC(C[0], C[1], 500 + (t - 87.6) * 4200), () => {
      const B = 64, off = wrap(te * 520, B * 4), cols = [INK, CUT, RED, CUT];
      const ringsA = (ph) => { for (let j = 40; j >= -4; j--) { const r = off + j * B; if (r > 0) dot(C[0], C[1], r, cols[((j + ph) % 4 + 4) % 4]); } };
      ringsA(0);
      const N = 24, rot = tt * .5 + h * tt * .6;
      clipTo(() => { s.beginPath(); for (let i = 0; i < N; i += 2) { const a0 = rot + i * TAU / N, a1 = rot + (i + 1) * TAU / N; s.moveTo(C[0], C[1]); s.lineTo(C[0] + Math.cos(a0) * 3000, C[1] + Math.sin(a0) * 3000); s.lineTo(C[0] + Math.cos(a1) * 3000, C[1] + Math.sin(a1) * 3000); s.closePath(); } }, () => ringsA(1));
      // swirls in the corners, spinning harder on the harmonica
      const sp = tt * (2 + h * 5);
      spiral(150, 170, 1.5, sp, INK, CUT); spiral(1780, 160, 1.3, -sp, INK, CUT); spiral(120, 960, 1.2, -sp * .8, INK, CUT); spiral(1800, 960, 1.4, sp * .9, INK, CUT);
      // the halo she stands in
      shape(CIRC(860, 760, 300), CUT, 14);
      clipTo(CIRC(860, 760, 300), () => { for (let i = 0; i < 20; i++) { const a = i * TAU / 20 + tt; flick(860 + Math.cos(a) * 296, 760 + Math.sin(a) * 296, a + Math.PI, 70 + 30 * beatPulse(t), 7, INK); } });
      amp(AMPX, AMPY, AMPK);
      // gust of the harmonica
      if (h > .05) flicks(-40, 300, W, 900, Math.round(40 * h), Math.PI, 160, 6, 99 + Math.floor(t * 8), CUT, .1);
      const sl = .45 + .3 * Math.sin(tt * 4);
      ellen(860, 1010, .85, { pose: 'play', t, slide: sl, wind: .35 + h * .65, eyes: 'closed', smile: .8 });
      const tail = [860 - 96 * .85, 1010 - 251 * .85];
      cable([tail, [tail[0] + 20, 960], [1000, 1040], [1180, 1030], [JACK[0] + 30, JACK[1] + 40], JACK], 9);
      wavyText('THE SIXTIES', 960, 150, 150, 1500, t);
    });
    // white-on-black flashes on the downbeats
    for (const b of [88.667, 89.733, 90.8]) if (t >= b && t < b + .09) fx({ inv: 1 });
  }

  // ---------- 91.37: the church of open tuning ----------
  const TUNING = ['D', 'A', 'D', 'F#', 'A', 'D'], LIGHT = [91.367, 91.9, 92.433, 92.933, 93.467, 94.033];
  function lancet(x0, yb, w, h) { const x1 = x0 + w, cx = x0 + w / 2, ys = yb - h + w * .7, yt = yb - h;
    return () => { s.beginPath(); s.moveTo(x0, yb); s.lineTo(x0, ys); s.quadraticCurveTo(x0, yt + w * .15, cx, yt); s.quadraticCurveTo(x1, yt + w * .15, x1, ys); s.lineTo(x1, yb); s.closePath(); }; }
  function church(t, tl) {
    const tt = OT(t);
    withT(() => { cam(960, 560, 1 + tl * .012);
      bg(INK);
      // stone courses on the wall
      rows(-40, -40, W + 40, 680, 0, 70, () => 2, CUT, 0, 3);
      const WX = (i) => 150 + i * 280 + (i >= 3 ? 40 : 0), WW = 180, YB = 600, WH = 470;
      for (let i = 0; i < 6; i++) {
        const lit = t >= LIGHT[i], x0 = WX(i), mk = lancet(x0, YB, WW, WH), cx = x0 + WW / 2, cy = YB - 190;
        // light falling from it
        if (lit) clipTo(() => pathOf([[x0, YB], [x0 + WW, YB], [x0 + WW + 260 - i * 40, 1080], [x0 - 120 - i * 40, 1080]]), () => rows(x0 - 200, YB, x0 + WW + 300, 1080, .3, 16, (u) => 1 + 2 * (1 - u), CUT));
        shape(mk, lit ? CUT : INK, 12, CUT);
        clipTo(mk, () => {
          if (lit) { rows(x0, YB - WH, x0 + WW, YB, .9, 46, () => 4, INK); rows(x0, YB - WH, x0 + WW, YB, -.9, 46, () => 4, INK); }
          else { rows(x0, YB - WH, x0 + WW, YB, .9, 46, () => 1.5, CUT); rows(x0, YB - WH, x0 + WW, YB, -.9, 46, () => 1.5, CUT); }
        });
        if (lit) { const pop = 1 + .25 * hit(t, LIGHT[i], 9);
          dot(cx, cy, 74 * pop, INK); dot(cx, cy, 64 * pop, CUT);
          fitText(TUNING[i], cx, cy + 4, 96 * pop, 100 * pop, INK);
          for (let j = 0; j < 8; j++) { const a = j * TAU / 8; flick(cx + Math.cos(a) * 78 * pop, cy + Math.sin(a) * 78 * pop, a, 26, 5, INK); }
          // the sill: its note name read like a chapter number
          shape(RECT(x0 - 6, YB + 4, WW + 12, 20), CUT);
        }
      }
      // pews in the dark
      for (const [x, k] of [[-60, 1], [1500, -1]]) for (let r = 0; r < 3; r++) { const y = 900 + r * 70;
        shape(() => pathOf([[x + (k < 0 ? 0 : 0), y], [x + 520, y], [x + 520, y + 40], [x, y + 40]]), INK, 6, CUT); }
      // Ellen behind the pulpit, the guitar held up like scripture
      const lift = -14 * beatPulse(t, 8);
      ellen(960, 1090 + lift, 1, { pose: 'hold', t, smile: .45, eyes: t > 94.1 ? 'brow' : 'open' });
      // the pulpit
      const pul = () => pathOf(chisel([[700, 850], [1220, 850], [1190, 1100], [730, 1100]], 21, 4));
      shape(pul, INK, 8, CUT);
      clipTo(pul, () => rows(700, 850, 1220, 1100, Math.PI / 2, 30, () => 2.5, CUT));
      shape(RECT(670, 828, 580, 36), CUT, 6);
      shape(RECT(800, 900, 320, 120), CUT, 7);
      fitText('OPEN D', 960, 962, 64, 270, INK);
    });
  }

  // ---------- 96.4: the slide on the strings; the strings become six railway tracks ----------
  const HZ = 330, PJ = (X, Z) => [960 + X * 980 / Z, HZ + 750 / Z];
  const SL_Z = (t) => t < 97.37 ? 1.55 : t < 98.0 ? lerp(1.55, 2.3, ease.out(inv(97.37, 97.75, t))) : lerp(2.3, 46, ease.in(inv(98.0, 99.33, t)));
  function rails(t, m, travel = 0) {
    // ground + far landscape appear as the neck turns into track
    if (m > 0) { stars(41, Math.round(70 * m), 40, 40, W - 40, HZ - 20, t);
      shape(() => pathOf([[-40, HZ + 2], [300, HZ - 40 * m], [520, HZ - 10], [800, HZ - 60 * m], [1100, HZ - 15], [1400, HZ - 70 * m], [1700, HZ - 20], [W + 40, HZ - 50 * m], [W + 40, HZ + 4]]), INK, 4 * m, CUT); }
    // fretboard binding + inlays (guitar), ballast (track)
    if (m < 1) { for (const X of [-.78, .78]) taper([PJ(X, .95), PJ(X, 80)], 14 * (1 - m), 1, CUT);
      for (const Zi of [3.1, 5.2, 8.9, 15.2]) { const p = PJ(0, Zi); s.beginPath(); s.ellipse(p[0], p[1], 120 / Zi * (1 - m), 30 / Zi * (1 - m) + .1, 0, 0, TAU); s.fillStyle = CUT; s.fill(); } }
    if (m > 0) { const r = rng(7); for (let i = 0; i < 260; i++) { const X = (r() - .5) * 2.4, Z = 1 + r() * 30, p = PJ(X, Z); flick(p[0], p[1], r() * 3, 26 / Z * m + .5, 4 / Z * m + .3, CUT); } }
    const XI = (i) => (i - 2.5) * lerp(.27, .36, m), G = lerp(0, .065, m);
    // frets (guitar) fade as sleepers (track) grow
    for (let j = 0; j < 16; j++) { const Z = 1.05 * Math.pow(1.3, j); if (Z > 70) break;
      if (m < 1) taper([PJ(-.78, Z), PJ(.78, Z)], 34 / Z * (1 - m) + .1, 34 / Z * (1 - m) + .1, CUT); }
    if (m > 0) for (let i = 0; i < 6; i++) for (let k = 0; k < 140; k++) { const Z = .9 + wrap(k * .32 - travel, 140 * .32); if (Z > 46) continue;
      taper([PJ(XI(i) - .12, Z), PJ(XI(i) + .12, Z)], 46 / Z * m, 46 / Z * m, CUT); }
    // strings -> rails
    for (let i = 0; i < 6; i++) { const w0 = lerp(22 - i * 2.2, 16, m);
      if (G < .004) taper([PJ(XI(i), .9), PJ(XI(i), 90)], w0, .6, CUT);
      else for (const d of [-G, G]) { taper([PJ(XI(i) + d, .9), PJ(XI(i) + d, 90)], w0, .6, CUT); taper([PJ(XI(i) + d, .9), PJ(XI(i) + d, 90)], w0 * .25, .2, INK); } }
  }
  function slideTube(Z, chim) {
    const L = PJ(-.84, Z), R_ = PJ(.84, Z), hs = 150 / Z, y = L[1] - 8 / Z;
    const tube = RECT(L[0], y - hs, R_[0] - L[0], hs);
    shape(tube, CUT, Math.max(1.5, 7 / Z));
    clipTo(tube, () => { taper([[L[0], y - hs * .72], [R_[0], y - hs * .72]], 14 / Z, 14 / Z, INK); taper([[L[0], y - hs * .4], [R_[0], y - hs * .4]], 5 / Z, 5 / Z, INK);
      for (let x = L[0]; x < R_[0]; x += 60 / Z) taper([[x, y - hs], [x + 40 / Z, y]], 1.5 / Z + .3, 1.5 / Z + .3, INK); });
    s.beginPath(); s.ellipse(R_[0], y - hs / 2, hs * .22, hs / 2, 0, 0, TAU); s.fillStyle = CUT; s.fill(); s.lineWidth = 6 / Z; s.strokeStyle = INK; s.stroke();
    s.beginPath(); s.ellipse(R_[0], y - hs / 2, hs * .13, hs * .34, 0, 0, TAU); s.fillStyle = INK; s.fill();
    if (chim > 0) { const cx = lerp(L[0], R_[0], .78), ch = hs * .9 * chim; shape(() => pathOf([[cx - hs * .2, y - hs + 2], [cx + hs * .2, y - hs + 2], [cx + hs * .32, y - hs - ch], [cx - hs * .32, y - hs - ch]]), INK, 3 / Z, CUT); }
    return { top: [lerp(L[0], R_[0], .78), y - hs - hs * .9 * chim], hs, L };
  }
  function finger(L, hs, out) {
    // the ring finger inside the slide, the hand off to the left
    withT(() => { s.translate(-out, 0);
      const fy = L[1] - 8 / 1.55 - hs * .5;
      taper([[L[0] + 60, fy], [L[0] - 280, fy + 10], [-200, fy + 60]], hs * .62, hs * 1.4, CUT);
      s.lineWidth = 6; s.strokeStyle = INK; s.beginPath(); s.moveTo(L[0] + 40, fy - hs * .31); s.lineTo(L[0] - 280, fy - hs * .34); s.lineTo(-200, fy - hs * .4); s.stroke();
      s.beginPath(); s.moveTo(L[0] + 40, fy + hs * .31); s.lineTo(L[0] - 280, fy + hs * .36); s.lineTo(-200, fy + hs * .8); s.stroke();
      taper([[L[0] - 150, fy - hs * .3], [L[0] - 140, fy + hs * .3]], 4, 4); taper([[L[0] - 190, fy - hs * .3], [L[0] - 182, fy + hs * .32]], 3, 3);
      shape(() => smoothPath([[-260, fy - 160], [L[0] - 330, fy - 120], [L[0] - 300, fy + 40], [L[0] - 380, fy + 200], [-260, fy + 260]]), CUT, 7);
      taper([[-260, fy - 160], [-260, fy + 260]], 400, 400, INK);
    });
  }
  function slideRails(t, tl) {
    const m = smooth(inv(97.9, 98.9, OT(t))), Z = SL_Z(OT(t)), h = harm(t);
    bg(INK);
    rails(t, m, 0);
    // steam puffs from the slide's new chimney (the harmonica whistle), blown back by the wind
    const chim = smooth(inv(97.95, 98.3, t));
    const st = slideTube(Z, chim);
    for (let k = 0; k < 24; k++) { const te = 98.05 + k * .055; if (t < te) break;
      const a = t - te, Ze = SL_Z(te), p0 = PJ(-.84 + 1.68 * .78, Ze), hs0 = 150 / Ze, top = [p0[0], p0[1] - hs0 - hs0 * .9 * smooth(inv(97.95, 98.3, te))];
      const r = 18 / Ze + 40 * a + 70 * a * a, x = top[0] - a * (160 + 500 * h) * (k % 2 ? 1 : .7), y = top[1] - a * 260;
      if (a < 1.6) { dot(x, y, r + 4, INK); dot(x, y, r, CUT); dot(x + r * .3, y - r * .3, r * .55, INK); dot(x + r * .3, y - r * .3, r * .45, CUT); } }
    if (t < 98.4) finger(st.L, 150 / 1.55, t < 98.0 ? 0 : ease.in(inv(98.0, 98.4, t)) * 700);
    // the whistle's carved shout
    if (h > .3 && t > 98.2) fitText('WHOOO', 960 + (t - 98.2) * 120, 150, 92, 420, CUT, { rot: -.06 });
  }

  // ---------- 99.33: the slide is a locomotive; sparks become notes; Jimi hangs off the back ----------
  const SYL = [99.33, 99.87, 100.33, 100.6];
  const TRACKY = [790, 822, 858, 900, 950, 1010];
  function loco(x, y, t) {
    withT(() => { s.translate(x, y);
      const wa = OT(t) * 22;
      // chassis + cowcatcher
      shape(RECT(-430, -160, 820, 46), INK);
      shape(() => pathOf([[390, -160], [480, -40], [390, -40]]), INK); for (let i = 0; i < 4; i++) taper([[400 + i * 18, -150], [400 + i * 18, -50]], 5, 5, CUT);
      // the boiler is the glass slide, on its side
      const tube = RECT(-270, -340, 610, 180);
      shape(tube, CUT, 8);
      clipTo(tube, () => { taper([[-270, -295], [340, -295]], 20, 20, INK); taper([[-270, -230], [340, -230]], 7, 7, INK); for (let xx = -260; xx < 340; xx += 40) taper([[xx, -340], [xx + 26, -160]], 2, 2, INK); });
      s.beginPath(); s.ellipse(340, -250, 40, 90, 0, 0, TAU); s.fillStyle = CUT; s.fill(); s.lineWidth = 8; s.strokeStyle = INK; s.stroke();
      s.beginPath(); s.ellipse(340, -250, 24, 60, 0, 0, TAU); s.fillStyle = INK; s.fill();
      // smokestack
      shape(() => pathOf([[210, -340], [260, -340], [290, -450], [180, -450]]), INK, 6, CUT);
      // cab
      shape(() => pathOf(chisel([[-440, -440], [-250, -440], [-250, -160], [-440, -160]], 33, 3)), INK, 6, CUT);
      shape(RECT(-470, -470, 250, 34), INK, 6, CUT);
      shape(RECT(-410, -400, 120, 100), CUT, 5);
      taper([[-450, -420], [-450, -200]], 10, 10, CUT); // grab rail
      // wheels
      for (const [wx, wr] of [[-330, 74], [-130, 74], [70, 74], [280, 44]]) { dot(wx, -74 + (74 - wr), wr, INK); dot(wx, -74 + (74 - wr), wr - 10, CUT);
        for (let i = 0; i < 6; i++) { const a = wa + i * TAU / 6; taper([[wx, -74 + (74 - wr)], [wx + Math.cos(a) * (wr - 12), -74 + (74 - wr) + Math.sin(a) * (wr - 12)]], 7, 4); }
        dot(wx, -74 + (74 - wr), 12, INK); }
      const ca = [Math.cos(wa) * 40, Math.sin(wa) * 40];
      taper([[-330 + ca[0], -74 + ca[1]], [70 + ca[0], -74 + ca[1]]], 14, 14, INK);
    });
  }
  function jimiHanging(x, y, t, laugh) {
    // hands on the cab's grab rail at (x, y); the body streams out behind in the wind
    withT(() => { s.translate(x, y);
      const fl = Math.sin(OT(t) * 26) * 18;
      // legs (flared trousers) flapping
      taper([[-250, 60], [-420, 70 + fl], [-560, 40 + fl * 1.6]], 46, 60, INK);
      taper([[-250, 80], [-400, 120 - fl], [-540, 140 - fl * 1.4]], 46, 60, INK);
      // fringed psychedelic jacket
      const torso = () => pathOf(chisel([[-20, -40], [-60, -70], [-270, 30], [-250, 110], [-30, 50]], 12, 3));
      shape(torso, INK);
      clipTo(torso, () => { for (let i = 0; i < 6; i++) { s.beginPath(); s.arc(-90 - i * 30, 10 + (i % 2) * 30, 12, 0, TAU); s.lineWidth = 4; s.strokeStyle = CUT; s.stroke(); } });
      for (let i = 0; i < 12; i++) { const px = -40 - i * 19, py = 56 + i * 4; flick(px, py, Math.PI * .75 + Math.sin(OT(t) * 30 + i) * .25, 48, 6, INK); }
      // arms up to the rail
      taper([[-40, -50], [30, -120], [90, -150]], 26, 20, INK); taper([[-70, -40], [20, -70], [90, -60]], 26, 20, INK);
      dot(90, -150, 16, CUT); ring(90, -150, 16, 4); dot(90, -60, 16, CUT); ring(90, -60, 16, 4);
      // his carved head, thrown back laughing
      put('jimi-1968', -110, -30, 240, { crop: [.42, 0, .58, .27], ay: .85, rot: -.12 - laugh * .12 });
    });
  }
  function locomotive(t, tl) {
    const tt = OT(t);
    bg(CUT);
    // speed lines in the sky
    for (let i = 0; i < 22; i++) { const r = hash(i * 13 + 7), y = 60 + r * 640, x = wrap(r * 3000 - tt * 2600 * (.6 + r), 2600) - 300; taper([[x, y], [x + 260 + r * 300, y]], 1, 7 * r + 2); }
    // the ground and its six tracks (the strings, side on)
    shape(RECT(-40, 760, W + 80, 360), INK);
    TRACKY.forEach((y, i) => { const sp = 60 + i * 12; for (let x = -wrap(tt * 2400 * (1 + i * .15), sp); x < W + 40; x += sp) taper([[x, y + 2], [x - 14, y + 8 + i * 2]], 6 + i, 6 + i, CUT);
      taper([[-40, y], [W + 40, y]], 5 + i * 1.2, 5 + i * 1.2, CUT); });
    const bump = SYL.reduce((a, b) => a + hit(t, b, 9), 0), bounce = (Math.floor(t * 12) % 2) * 4 + bump * 16;
    const LX = 1080 + bump * 30, LY = TRACKY[1] - 2 - bounce;
    // smoke from the stack, streaming back
    for (let k = 0; k < 26; k++) { const te = 99.0 + k * .09, a = t - te; if (a < 0) break; if (a > 1.6) continue;
      const x = LX + 235 - a * 900, y = LY - 460 - a * 120 - Math.sin(k) * 20, r = 30 + a * 80; dot(x, y, r + 6, INK); dot(x, y, r, CUT); }
    // sparks off the wheels that turn into notes as they fly up
    const emit = []; for (let k = 0; k < 40; k++) emit.push([99.33 + k * .05, k]);
    for (const b of SYL) for (let k = 0; k < 10; k++) emit.push([b + k * .01, 100 + Math.round(b * 10) + k]);
    for (const [te, k] of emit) { const a = t - te; if (a < 0 || a > 1.1) continue;
      const r = rng(k * 77 + 3), vx = -500 - r() * 800, vy = -500 - r() * 700, w0 = [LX - 330 + r() * 400, LY];
      const x = w0[0] + vx * a, y = w0[1] + vy * a + 600 * a * a;
      if (y > 760) flick(x, y, Math.atan2(vy + 1200 * a, vx) + Math.PI, 40, 6, CUT);
      else note(x, y, .8 + r() * .7, INK, Math.sin(a * 6 + k) * .4); }
    loco(LX, LY, t);
    const laugh = SYL.reduce((a, b) => a + hit(t, b, 7), 0);
    jimiHanging(LX - 540, LY - 300, t, laugh);
    // his laughing, carved
    SYL.forEach((b, i) => { const a = t - b; if (a < 0 || a > .55) return; const k = ease.back(a / .18);
      fitText('HA!', LX - 820 + i * 190 - a * 60, LY - 640 + (i % 2) * 90 - a * 80, 90 * k, 220, INK, { rot: -.2 + (i % 2) * .3 }); });
  }

  // ---------- 101.47: Bob puts a tiny record on a turntable; the bus drives round it ----------
  function recordDisc(cx, cy, rx, ry, ang, labelStr) {
    withT(() => { s.translate(cx, cy); s.scale(1, ry / rx);
      dot(0, 0, rx, INK); ring(0, 0, rx, Math.max(3, rx * .015), CUT);
      for (let r = rx * .36; r < rx * .97; r += rx * .045) ring(0, 0, r, Math.max(1, rx * .004), CUT);
      s.rotate(ang);
      // the sheen, rotating with it
      for (const a0 of [0, Math.PI]) clipTo(() => { s.beginPath(); s.moveTo(0, 0); s.arc(0, 0, rx * .96, a0 - .18, a0 + .18); s.closePath(); }, () => { for (let r = rx * .37; r < rx * .96; r += rx * .018) ring(0, 0, r, Math.max(1, rx * .006), CUT); });
      // the label: a little globe map
      const lr = rx * .32; dot(0, 0, lr, CUT); ring(0, 0, lr, Math.max(2, rx * .012), INK);
      clipTo(CIRC(0, 0, lr), () => { for (let i = 1; i < 4; i++) ring(0, 0, lr * i / 4, Math.max(1, rx * .004), INK); for (let i = 0; i < 6; i++) taper([[0, 0], [Math.cos(i * TAU / 12) * lr, Math.sin(i * TAU / 12) * lr]], 1, 1); for (let i = 6; i < 12; i++) taper([[0, 0], [Math.cos(i * TAU / 12) * lr, Math.sin(i * TAU / 12) * lr]], 1, 1);
        shape(() => smoothPath([[-lr * .7, -lr * .2], [-lr * .3, -lr * .6], [lr * .1, -lr * .3], [-lr * .1, lr * .1], [-lr * .5, lr * .2]]), INK); shape(() => smoothPath([[lr * .3, lr * .2], [lr * .7, lr * .1], [lr * .6, lr * .6], [lr * .2, lr * .55]]), INK); });
      if (labelStr) { shape(RECT(-lr * .78, -lr * .2, lr * 1.56, lr * .4), CUT, Math.max(1, rx * .006)); fitText(labelStr, 0, 0, lr * .3, lr * 1.4, INK); }
      dot(0, 0, Math.max(3, rx * .022), CUT); ring(0, 0, Math.max(3, rx * .022), 2);
    });
  }
  function busOnRecord(cx, cy, rx, ry, phi, k, t) {
    const x = cx + Math.cos(phi) * rx, y = cy + Math.sin(phi) * ry, dx = -Math.sin(phi) * rx, dy = Math.cos(phi) * ry;
    const dep = .82 + .18 * Math.sin(phi), dir = dx >= 0 ? 1 : -1, rot = clamp(Math.atan2(dy * dir, Math.abs(dx)), -.32, .32);
    withT(() => { s.translate(x, y); s.rotate(rot); s.scale(dir, 1);
      schoolBus(0, 0, k * dep, { t, kids: 5, asleep: false, lights: false }); });
  }
  function bobHead(x, y, h, tilt) { put('bob-1989', x, y, h, { crop: [.22, 0, .46, .4], rot: tilt, ay: 1 }); }
  function turntable(t, tl) {
    const tt = OT(t), TD = 102.45;
    shape(RECT(-40, -40, W + 80, H + 80), CUT);
    rows(-40, -40, W + 40, 620, 0, 22, (u) => 1 + u * 2.5, INK);
    // the turntable's top, wood, and the platter
    const top = () => pathOf(chisel([[560, 470], [1780, 470], [1880, 1010], [470, 1010]], 13, 4));
    shape(top, INK); clipTo(top, () => rows(470, 470, 1880, 1010, .05, 22, () => 2, CUT, 4, 2));
    shape(() => pathOf([[470, 1010], [1880, 1010], [1880, 1080], [470, 1080]]), INK, 5, CUT);
    shape(ELL(1130, 745, 470, 180), CUT, 6); shape(ELL(1130, 725, 470, 180), INK, 5, CUT);
    clipTo(ELL(1130, 725, 470, 180), () => { withT(() => { s.translate(1130, 725); s.scale(1, 180 / 470); for (let r = 60; r < 470; r += 34) ring(0, 0, r, 4, CUT); }); });
    // tonearm at rest
    dot(1690, 560, 46, CUT); ring(1690, 560, 46, 5); taper([[1690, 560], [1740, 900]], 18, 14, CUT); taper([[1690, 560], [1740, 900]], 6, 4, INK);
    // the record: held, lowered, let go, spinning
    const c = OT(t) < TD ? kf(OT(t), [[101.47, [930, 360]], [101.9, [980, 430]], [TD, [1130, 712]]], ease.inOut) : [1130, 712];
    const ang = t < TD ? 0 : (t - TD) * TAU * .75;
    // Bob: torso, arm, head
    shape(() => pathOf(chisel([[90, 560], [560, 600], [660, 1100], [20, 1100]], 41, 5)), INK);
    clipTo(() => pathOf([[90, 560], [560, 600], [660, 1100], [20, 1100]]), () => rows(20, 560, 660, 1100, .6, 30, () => 3, CUT));
    const hold = t < TD, hp = hold ? [c[0] - 205, c[1]] : kf(OT(t), [[TD, [c[0] - 205, c[1]]], [TD + .45, [620, 560]]], ease.out);
    taper([[480, 640], [lerp(480, hp[0], .5), Math.max(hp[1], 640) + 60], [hp[0] - 40, hp[1] + 20]], 92, 64, INK);
    clipTo(() => { s.beginPath(); s.rect(380, 500, 1200, 700); }, () => {});
    bobHead(250, 640, 420, .08 + (hold ? .06 : 0));   // smaller and half out of frame: Bob, 'too much bob face'
    recordDisc(c[0], c[1], 210, 80, ang, null);
    // his hand pinching the record's edge
    shape(() => smoothPath([[hp[0] - 70, hp[1] - 40], [hp[0] + 10, hp[1] - 52], [hp[0] + 34, hp[1] - 12], [hp[0] + 30, hp[1] + 30], [hp[0] - 40, hp[1] + 50], [hp[0] - 80, hp[1] + 20]]), CUT, 6);
    taper([[hp[0] + 4, hp[1] - 30], [hp[0] - 30, hp[1] - 20]], 4, 2); taper([[hp[0] + 6, hp[1]], [hp[0] - 30, hp[1] + 6]], 4, 2); taper([[hp[0] + 4, hp[1] + 26], [hp[0] - 34, hp[1] + 30]], 4, 2);
    // the bus starts round it
    if (t > 102.7) busOnRecord(1130, 712, 172, 66, Math.PI * .5 + (t - 102.7) * 2.0, .085, tt);
  }
  function recordClose(t, tl) {
    const tt = OT(t), CX = 960, CY = 600, RX = 820, RY = 330, ang = (t - 102.45) * TAU * .75, TA = 104.17;
    bg(INK);
    rows(-40, -40, W + 40, H + 40, .05, 26, () => 2, CUT, 5, 9);
    shape(ELL(CX, CY + 40, 1010, 410), CUT, 8); shape(ELL(CX, CY + 10, 1010, 410), INK, 6, CUT);
    clipTo(ELL(CX, CY + 10, 1010, 410), () => withT(() => { s.translate(CX, CY + 10); s.scale(1, 410 / 1010); for (let r = 840; r < 1010; r += 40) ring(0, 0, r, 6, CUT); }));
    // the bus on the far side drives behind the spindle, the near side in front: draw by depth
    const phi = Math.PI * .5 + (t - 102.7) * 2.0, near = Math.sin(phi) > 0;
    recordDisc(CX, CY, RX, RY, ang, 'ELLEN');
    // tonearm swings in on "hope"
    const sw = ease.inOut(inv(TA, TA + .35, OT(t))), aA = lerp(1.92, 2.42, sw), PV = [1800, 30], AL = 900;
    const tip = [PV[0] + Math.cos(aA) * AL, PV[1] + Math.sin(aA) * AL];
    if (!near) busOnRecord(CX, CY, RX * .72, RY * .72, phi, .3, tt);
    taper([PV, tip], 30, 22, CUT); taper([PV, tip], 10, 8, INK); dot(PV[0], PV[1], 90, CUT); ring(PV[0], PV[1], 90, 8);
    shape(() => pathOf([[tip[0] - 40, tip[1] - 20], [tip[0] + 50, tip[1] - 30], [tip[0] + 60, tip[1] + 30], [tip[0] - 30, tip[1] + 40]]), CUT, 6);
    if (near) busOnRecord(CX, CY, RX * .72, RY * .72, phi, .3, tt);
    // notes rise from the needle once it drops
    if (t > TA + .35) for (let k = 0; k < 14; k++) { const te = TA + .35 + k * .2, a = t - te; if (a < 0 || a > 1.8) continue;
      note(tip[0] - 40 * k % 120 - a * 160, tip[1] - 60 - a * 380, 1.2, CUT, Math.sin(a * 5 + k) * .3); }
  }

  // ---------- 105.6: the kids spell her name ----------
  const NAME = ['E', 'L', 'L', 'E', 'N', 'M', 'c', 'I', 'L', 'W', 'A', 'I', 'N', 'E'];
  const SLOT = (j) => 137 + j * 122 + (j >= 5 ? 60 : 0);
  const SCR = [9, 3, 12, 6, 0, 13, 1, 10, 4, 8, 2, 7, 5, 11]; // kid j stands at slot SCR[j] at first (none in place)
  const DOOR = [1022, 690], KY = 1046, KK = 1.04, TDONE = 108.97;
  function letterKid(x, y, k, letter, seed) {
    kid(x, y, k, { seed });
    withT(() => { s.translate(x, y); s.scale(k, k);
      shape(RECT(-46, -142, 92, 102), CUT, 6); fitText(letter, 0, -90, 76, 70, INK); });
  }
  function kidPos(j, t) {
    const te = 105.72 + j * .1, ta = 107.8, tb = 108.9, x0 = SLOT(SCR[j]), x1 = SLOT(j);
    if (t < te) return null;
    if (t < te + .7) { const u = ease.out((OT(t) - te) / .7); return [lerp(DOOR[0], x0, u), lerp(DOOR[1] + 40, KY, u) - Math.abs(Math.sin(u * 9)) * 22, lerp(.62, KK, u)]; }
    if (t < ta) return [x0, KY - (Math.floor(t * 6 + j) % 2) * 4, KK];
    const u = ease.inOut(inv(ta, tb, OT(t))), hop = Math.sin(u * Math.PI) * Math.min(260, 40 + Math.abs(x1 - x0) * .22);
    return [lerp(x0, x1, u), KY - hop, KK];
  }
  function nameKids(t, tl) {
    const tt = OT(t);
    bg(INK); stars(77, 90, 40, 40, W - 40, 640, t);
    // the road
    shape(RECT(-40, 700, W + 80, 420), CUT); taper([[-40, 702], [W + 40, 702]], 10, 10);
    for (let i = 0; i < 9; i++) taper([[i * 260 - 40, 790], [i * 260 + 90, 790]], 10, 10);
    rows(-40, 820, W + 40, 1080, 0, 40, (u) => .6 + u * 2.4, INK);
    // the bus, parked, door open
    schoolBus(760, 700, .62, { t: 105.6, kids: 5, asleep: false, doorOpen: t > 105.65, lights: false });
    // firework of cut flicks when the name is whole
    if (t >= TDONE) { const a = t - TDONE, R = 120 + a * 900;
      for (const [fx_, fy, sd] of [[380, 230, 1], [960, 160, 2], [1540, 240, 3]]) for (let i = 0; i < 16; i++) { const an = i * TAU / 16 + sd; flick(fx_ + Math.cos(an) * R * .4, fy + Math.sin(an) * R * .4, an, 50 + 40 * hit(t, TDONE, 2), 6, CUT); } }
    // kids, back to front
    const list = []; for (let j = 0; j < 14; j++) { const p = kidPos(j, t); if (p) list.push([p, j]); }
    list.sort((a, b) => a[0][2] - b[0][2] || a[0][1] - b[0][1]);
    const jump = t >= TDONE ? Math.sin(Math.min(1, (t - TDONE) / .3) * Math.PI) * 40 : 0;
    for (const [[x, y, k], j] of list) letterKid(x, y - jump * (j % 2 ? 1 : .7), k, NAME[j], j + 3);
  }

  chapter('w3', 77.6, 112.0, [
    [77.6, beyonce],
    [80.33, pixies],
    [83.47, room],
    [85.9, plugIn],
    [87.6, explosion],
    [91.37, church],
    [96.4, slideRails],
    [99.33, locomotive],
    [101.47, turntable],
    [103.3, recordClose],
    [105.6, nameKids],
  ]);
})();

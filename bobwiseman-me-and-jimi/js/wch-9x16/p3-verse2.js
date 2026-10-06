// p3-verse2 (9:16, 1080 x 1920): VERSE 2, 77.6 - 112.0, recomposed for the tall frame from js/wch/w3-verse2.js
// (the 16:9 master file is untouched). Bob's beats 11-16, then 26-27 as the recording sings them.
// 77.63 before Beyonce / 80.33 before the Pixies / 83.47 she found her calling / 87.23 in the sixties (the plug
// connects, the room explodes) / 91.37 sermons about open tuning fitness / 96.4 plays slide guitar (slide 97.37) /
// 99.33 like no one's business / 101.47 I hope this song helps you / 105.6 remember her name / 108.97 Ellen McIlwaine.
// Harmonica answers: 89-90.5 (hair and swirls blown by the wind) and 97.6-99.1 (the slide's steam whistle).
// Every cut and hit is on the same time as the 16:9 version; only the staging changed (stacked, bigger, moving camera).
(() => {
  const OT = (t) => onTwos(t, 12);
  const RECT = (x, y, w, h) => () => { s.beginPath(); s.rect(x, y, w, h); };
  const CIRC = (x, y, r) => () => { s.beginPath(); s.arc(x, y, r, 0, TAU); };
  const ELL = (x, y, rx, ry) => () => { s.beginPath(); s.ellipse(x, y, rx, ry, 0, 0, TAU); };
  const bg = (c) => shape(RECT(-120, -120, W + 240, H + 240), c);
  // camera: scale k about (cx, cy), then shift by (dx, dy)
  const cam = (k, cx = W / 2, cy = H / 2, dx = 0, dy = 0) => { s.translate(cx + dx, cy + dy); s.scale(k, k); s.translate(-cx, -cy); };
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

  // ---------- 77.63 / 80.33: the street of giants (name in lights on top, the giant in the middle, Ellen walking past in front) ----------
  const HZN = 1400;   // the street line
  function marquee(x, y, w, h, str, t, seed) {
    shape(() => pathOf(chisel([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], seed, 3)), CUT, 6);
    const ix = x + 36, iy = y + 36, iw = w - 72, ih = h - 72;
    shape(RECT(ix, iy, iw, ih), INK);
    clipTo(RECT(ix, iy, iw, ih), () => rows(ix, iy, ix + iw, iy + ih, 0, 14, (u) => 1.2, CUT));
    shape(RECT(ix + 12, iy + 12, iw - 24, ih - 24), INK);
    fitText(str, x + w / 2, y + h / 2 + 4, ih * .56, iw - 80, CUT);
    // bulbs round the frame, chasing on threes
    const bx0 = x + 18, by0 = y + 18, bw = w - 36, bh = h - 36, per = 2 * (bw + bh), n = Math.round(per / 34), ph = Math.floor(t * 8) % 3;
    for (let i = 0; i < n; i++) { const d = i * per / n; let bx, by;
      if (d < bw) { bx = bx0 + d; by = by0; } else if (d < bw + bh) { bx = bx0 + bw; by = by0 + d - bw; }
      else if (d < 2 * bw + bh) { bx = bx0 + bw - (d - bw - bh); by = by0 + bh; } else { bx = bx0; by = by0 + bh - (d - 2 * bw - bh); }
      if ((i + ph) % 3) { dot(bx, by, 10, INK); dot(bx, by, 6.5, CUT); } else dot(bx, by, 8, INK); }
  }
  // the marquee hangs from two chains out of the top of frame
  function hungMarquee(x, y, w, h, str, t, seed) {
    for (const cx of [x + 90, x + w - 90]) { taper([[cx, -60], [cx, y + 4]], 10, 10, CUT); for (let yy = -40; yy < y; yy += 34) { dot(cx, yy, 9, CUT); dot(cx, yy, 4, INK); } }
    marquee(x, y, w, h, str, t, seed);
  }
  function street(t, seed) {
    bg(INK); stars(seed, 110, 30, 30, W - 30, HZN - 300, t);
    // far rooftops, carved in cut line
    const r = rng(seed + 5); let x = -40;
    while (x < W + 40) { const w = 110 + r() * 170, h = 160 + r() * 300;
      shape(() => pathOf([[x, HZN + 5], [x, HZN + 5 - h], [x + w, HZN + 5 - h], [x + w, HZN + 5]]), INK, 4, CUT);
      for (let j = 0; j < 9; j++) if (r() > .5) shape(RECT(x + 20 + (j % 3) * 32, HZN + 5 - h + 30 + Math.floor(j / 3) * 50, 16, 24), CUT);
      x += w + 10; }
  }
  function pavement() {
    shape(RECT(-120, HZN, W + 240, H - HZN + 120), CUT); taper([[-120, HZN + 3], [W + 120, HZN + 3]], 12, 12);
    for (let i = -4; i < 12; i++) taper([[i * 150, HZN + 8], [i * 150 - 300, H + 40]], 4, 9);
    taper([[-120, HZN + 150], [W + 120, HZN + 150]], 3, 4); taper([[-120, HZN + 380], [W + 120, HZN + 380]], 4, 6);
  }
  function plinth(x0, x1, y0, y1, seed) {
    shape(() => pathOf(chisel([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], seed, 3)), CUT, 7);
    clipTo(RECT(x0, y0, x1 - x0, y1 - y0), () => rows(x0, y0, x1, y1, 0, 18, () => 2.6, INK, 3, seed));
  }
  // Ellen big in the foreground, walking left to right past the giant (a third of the frame tall)
  function walker(t, tl, dur) {
    const x = lerp(220, 900, OT(tl) / dur);
    ellen(x, 1880, 1.12, { pose: 'walk', t: OT(t), wind: harm(t) * .7, facing: 1 });
  }
  function beyonce(t, tl, dur) {
    withT(() => { cam(1 + tl * .02, 540, 900, 0, lerp(30, -30, tl / dur));
      street(t, 11);
      taper([[260, HZN], [330, 500]], 24, 16, CUT); taper([[820, HZN], [750, 500]], 24, 16, CUT);   // braces behind the cut-out
      put('beyonce', 540, HZN - 70, 1020, { crop: [0, 0, 1, .86] });
      plinth(120, 960, HZN - 90, HZN + 10, 5);
      hungMarquee(80, 80, 920, 270, 'BEYONCÉ', t, 3);
      pavement();
      walker(t, tl, dur);
    });
  }
  function pixies(t, tl, dur) {
    withT(() => { cam(1 + tl * .02, 540, 900, 0, lerp(30, -30, tl / dur));
      street(t, 23);
      taper([[200, HZN], [290, 700]], 24, 16, CUT); taper([[880, HZN], [790, 700]], 24, 16, CUT);
      put('pixies', 540, HZN - 70, 800, { crop: [.02, 0, .96, 1] });
      plinth(40, 1040, HZN - 90, HZN + 10, 9);
      hungMarquee(150, 150, 780, 260, 'PIXIES', t, 4);
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
  const FLOOR = 1380;
  const AMPX = 860, AMPY = 1800, AMPK = 1.25, JACK = [AMPX + 58 * AMPK, AMPY - 128 * AMPK];
  const EX = 470, EY = 1800, EK = 1.55;   // teenage Ellen in her room
  function roomBase(t) {
    shape(RECT(-120, -120, W + 240, FLOOR + 120), CUT);
    clipTo(RECT(-120, -120, W + 240, FLOOR + 120), () => rows(-120, -120, W + 120, FLOOR, Math.PI / 2, 46, () => 4, INK));
    taper([[-120, 150], [W + 120, 150]], 10, 10);
    // window, night outside (high on the right)
    shape(RECT(640, 260, 340, 460), INK, 0); shape(RECT(624, 244, 372, 492), null, 14, INK);
    dot(880, 360, 50, CUT); dot(902, 344, 44, INK);
    stars(5, 14, 660, 430, 960, 700, t);
    taper([[810, 260], [810, 720]], 10, 10, CUT); taper([[640, 490], [980, 490]], 10, 10, CUT);
    // a poster: a little guitar carved on paper
    shape(() => pathOf(chisel([[90, 300], [380, 300], [380, 660], [90, 660]], 8, 4)), INK);
    shape(RECT(112, 322, 246, 316), CUT); withT(() => { s.translate(230, 520); s.scale(.5, .5); guitar(0, 0, 1, -1.1, .5, 0); });
    // floor boards, receding
    shape(RECT(-120, FLOOR, W + 240, H - FLOOR + 120), CUT); taper([[-120, FLOOR + 2], [W + 120, FLOOR + 2]], 22, 22);
    for (let i = -6; i < 14; i++) taper([[i * 110, FLOOR + 14], [540 + (i * 110 - 540) * 2.2, H + 40]], 3, 8);
  }
  // the cable: drawn with a paper edge so it reads on anything
  function cable(pts, w = 11) { taper(pts, w + 8, w + 8, CUT); taper(pts, w, w, INK); }
  function room(t, tl, dur) {
    withT(() => { cam(1 + tl * .05, 540, 1300, 0, -tl * 10);
      roomBase(t);
      amp(AMPX, AMPY, AMPK);
      ellen(EX, EY, EK, { pose: 'hold', t, smile: .3 });
      // guitar tail (hold pose) -> floor -> the loose plug, lying by the amp
      const tail = [EX - 74 * EK, EY - 222 * EK];
      cable([tail, [tail[0] - 40, 1640], [tail[0] - 10, 1830], [EX + 60, 1870], [640, 1860], [700, 1850]], 13);
      withT(() => { s.translate(700, 1850); s.rotate(-.12); s.scale(1.3, 1.3);
        shape(RECT(0, -9, 46, 18), INK); shape(RECT(46, -6, 40, 12), CUT, 3); dot(88, 0, 6, CUT); ring(88, 0, 6, 2.5); });
    });
  }
  // 85.9 insert: her hand brings the plug up into the amp's INPUT, from the bottom of the frame
  const SOCK = [250, 500];
  function ampFace() {
    shape(RECT(-120, -120, W + 240, H + 240), CUT);
    clipTo(RECT(-120, -120, W + 240, 200), () => rows(-120, -120, W + 120, 80, 0, 40, () => 6, INK));
    shape(() => pathOf(chisel([[30, 110], [1050, 110], [1050, 2000], [30, 2000]], 7, 5)), INK);
    flicks(40, 120, 1040, 1900, 70, Math.PI / 2, 60, 3, 4);
    shape(RECT(80, 190, 920, 470), CUT, 7);
    clipTo(RECT(80, 190, 920, 470), () => rows(80, 190, 1000, 660, 0, 20, () => 1.6, INK));
    // labels and knobs
    [['INPUT', SOCK[0]], ['VOL', 560], ['TONE', 840]].forEach(([str, x]) => {
      shape(RECT(x - 115, 215, 230, 74), CUT); fitText(str, x, 254, 50, 200, INK); });
    for (const kx of [560, 840]) { const ky = SOCK[1]; dot(kx, ky, 88, INK); dot(kx, ky, 70, CUT); taper([[kx, ky], [kx + 38, ky - 52]], 13, 7); for (let i = 0; i < 9; i++) { const a = Math.PI * .75 + i * Math.PI * 1.5 / 8; flick(kx + Math.cos(a) * 94, ky + Math.sin(a) * 94, a, 16, 3, INK); } }
    // the socket
    dot(SOCK[0], SOCK[1], 80, INK); dot(SOCK[0], SOCK[1], 62, CUT); ring(SOCK[0], SOCK[1], 48, 5); dot(SOCK[0], SOCK[1], 33, INK);
    // grille
    shape(RECT(80, 730, 920, 1110), CUT, 7);
    clipTo(RECT(80, 730, 920, 1110), () => { rows(80, 730, 1000, 1840, .8, 30, () => 7, INK); rows(80, 730, 1000, 1840, -.8, 30, () => 7, INK); });
  }
  function plug(tip, ang) {
    // parts along -u from the tip: tip ball, sleeve, insulator, grip; then the cable
    const ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux;
    const at = (d, w) => [[tip[0] - ux * d + nx * w, tip[1] - uy * d + ny * w], [tip[0] - ux * d - nx * w, tip[1] - uy * d - ny * w]];
    const quad = (d0, d1, w0, w1, c, lw = 5) => { const a = at(d0, w0), b = at(d1, w1); shape(() => pathOf([a[0], b[0], b[1], a[1]]), c, lw); };
    cable([[tip[0] - ux * 330, tip[1] - uy * 330], [tip[0] - ux * 800 - 60, tip[1] - uy * 800], [tip[0] - ux * 1500 - 260, tip[1] - uy * 1500]], 30);
    quad(150, 340, 44, 40, INK, 0); clipTo(() => { const a = at(150, 44), b = at(340, 40); pathOf([a[0], b[0], b[1], a[1]]); }, () => { for (let d = 170; d < 340; d += 26) taper(at(d, 46), 4, 4, CUT); });
    quad(10, 150, 24, 26, CUT); for (const d of [60, 95]) taper(at(d, 24), 4, 4, INK);
    quad(100, 116, 27, 27, INK, 0);
    dot(tip[0] - ux * 6, tip[1] - uy * 6, 16, CUT); ring(tip[0] - ux * 6, tip[1] - uy * 6, 16, 4);
    return { at };
  }
  function hand(x, y, ang, k = 1) {
    // a fist from the back: knuckles toward the socket, sleeve trailing out of frame
    withT(() => { s.translate(x, y); s.rotate(ang); s.scale(k, k);
      taper([[-120, 10], [-900, 40]], 190, 250, INK);
      clipTo(() => { s.beginPath(); s.rect(-900, -130, 760, 280); }, () => rows(-900, -130, -140, 150, .2, 26, () => 3, CUT));
      taper([[-150, -100], [-150, 120]], 16, 16, CUT);
      const fist = () => smoothPath([[-130, -90], [-20, -110], [70, -80], [90, -10], [70, 80], [-30, 100], [-130, 90]]);
      shape(fist, CUT, 7);
      for (let i = 0; i < 4; i++) taper([[60 - i * 6, -70 + i * 44], [-10, -60 + i * 44]], 5, 2);
      taper([[-80, -70], [-10, -40], [40, -50]], 6, 3);
    });
  }
  function plugIn(t, tl) {
    const TC = 87.23, ang = -Math.PI / 2 - .3; // the plug rises from the bottom of frame, leaning right, into the socket
    const ux = Math.cos(ang), uy = Math.sin(ang);
    const gap = OT(t) < TC ? kf(OT(t), [[85.9, 900], [86.45, 260], [86.85, 200], [TC - .04, 0]], ease.inOut) : 0;
    const shake = t < TC ? Math.sin(t * 40) * 2 : 0;
    const tip = [SOCK[0] - ux * gap + shake, SOCK[1] - uy * gap];
    withT(() => { cam(1.12 - tl * .06, SOCK[0], SOCK[1]);
      ampFace();
      // contact: rings of energy out of the socket
      if (t >= TC) {
        const te = t - TC;
        clipTo(CIRC(SOCK[0], SOCK[1], 120 + te * 4600), () => {
          const cols = [RED, INK, CUT, INK];
          for (let j = 40; j >= 0; j--) { const r = j * 70 + wrap(te * 900, 280); dot(SOCK[0], SOCK[1], r, cols[(j % 4 + 4) % 4]); }
        });
        for (let i = 0; i < 18; i++) { const a = i * TAU / 18 + .2; flick(SOCK[0] + Math.cos(a) * (150 + te * 900), SOCK[1] + Math.sin(a) * (150 + te * 900), a, 120, 12, i % 2 ? CUT : INK); }
        if (te < .09) fx({ inv: 1 });
      }
      const P = plug(tip, ang);
      const g = P.at(250, 0)[0];
      hand(g[0], g[1], ang, 1.1);
    });
  }

  // ---------- 87.6: the explosion of the sixties ----------
  function spiral(cx, cy, k, rot, c1, c2) {
    withT(() => { s.translate(cx, cy); s.rotate(rot); s.scale(k, k);
      const pts = []; for (let i = 0; i <= 80; i++) { const th = i / 80 * TAU * 2.6, r = 6 + th * 22; pts.push([Math.cos(th) * r, Math.sin(th) * r]); }
      taper(pts, 6, 70, c1); taper(pts, 2, 30, c2); });
  }
  function wavyText(str, cx, cy, size, maxW, t, ph = 0) {
    s.save(); s.font = `900 ${size}px "Superclarendon"`; s.textAlign = 'center'; s.textBaseline = 'middle';
    const ws = [...str].map((ch) => s.measureText(ch).width + size * .06), tot = ws.reduce((a, b) => a + b, 0), sc = Math.min(1, maxW / tot);
    let x = cx - tot * sc / 2; const tt = OT(t);
    [...str].forEach((ch, i) => { const w = ws[i] * sc, y = cy + Math.sin(i * .9 + ph - tt * 7) * size * .16, rot = Math.sin(i * .9 + ph - tt * 7 + 1.2) * .14;
      if (ch !== ' ') withT(() => { s.translate(x + w / 2, y); s.rotate(rot); s.scale(sc, 1 + .1 * Math.sin(i + tt * 9));
        s.lineJoin = 'round'; s.lineWidth = size * .2; s.strokeStyle = INK; s.strokeText(ch, 0, 0); s.fillStyle = CUT; s.fillText(ch, 0, 0); });
      x += w; });
    s.restore();
  }
  function explosion(t, tl, dur) {
    const te = t - 87.23, C = [AMPX, AMPY - 90], tt = OT(t), h = harm(t);
    const HC = [EX, EY - 330 * EK];   // the halo round her
    withT(() => { cam(lerp(1, 1.07, tl / dur), EX, 1300);
      // the room, being blown away at the edges for the first moment
      roomBase(t);
      clipTo(CIRC(C[0], C[1], 500 + (t - 87.6) * 5200), () => {
        const B = 64, off = wrap(te * 520, B * 4), cols = [INK, CUT, RED, CUT];
        const ringsA = (ph) => { for (let j = 44; j >= -4; j--) { const r = off + j * B; if (r > 0) dot(C[0], C[1], r, cols[((j + ph) % 4 + 4) % 4]); } };
        ringsA(0);
        const N = 24, rot = tt * .5 + h * tt * .6;
        clipTo(() => { s.beginPath(); for (let i = 0; i < N; i += 2) { const a0 = rot + i * TAU / N, a1 = rot + (i + 1) * TAU / N; s.moveTo(C[0], C[1]); s.lineTo(C[0] + Math.cos(a0) * 4000, C[1] + Math.sin(a0) * 4000); s.lineTo(C[0] + Math.cos(a1) * 4000, C[1] + Math.sin(a1) * 4000); s.closePath(); } }, () => ringsA(1));
        // swirls up and down the frame, spinning harder on the harmonica
        const sp = tt * (2 + h * 5);
        spiral(120, 560, 1.4, sp, INK, CUT); spiral(970, 600, 1.3, -sp, INK, CUT); spiral(110, 1780, 1.2, -sp * .8, INK, CUT); spiral(990, 1150, 1.1, sp * .9, INK, CUT);
        // the halo she stands in
        shape(CIRC(HC[0], HC[1], 430), CUT, 16);
        clipTo(CIRC(HC[0], HC[1], 430), () => { for (let i = 0; i < 22; i++) { const a = i * TAU / 22 + tt; flick(HC[0] + Math.cos(a) * 426, HC[1] + Math.sin(a) * 426, a + Math.PI, 90 + 40 * beatPulse(t), 8, INK); } });
        amp(AMPX, AMPY, AMPK);
        // gust of the harmonica
        if (h > .05) flicks(-40, 500, W, 1700, Math.round(46 * h), Math.PI, 180, 7, 99 + Math.floor(t * 8), CUT, .1);
        const sl = .45 + .3 * Math.sin(tt * 4);
        ellen(EX, EY, EK, { pose: 'play', t, slide: sl, wind: .35 + h * .65, eyes: 'closed', smile: .8 });
        const tail = [EX - 96 * EK, EY - 251 * EK];
        cable([tail, [tail[0] + 20, 1760], [EX + 120, 1870], [AMPX - 40, 1860], [JACK[0] + 40, JACK[1] + 50], JACK], 11);
        // the title stacked on two lines across the top
        wavyText('THE', 540, 170, 160, 600, t, 0);
        wavyText('SIXTIES', 540, 340, 160, 820, t, 2.4);
      });
    });
    // white-on-black flashes on the downbeats
    for (const b of [88.667, 89.733, 90.8]) if (t >= b && t < b + .09) fx({ inv: 1 });
  }

  // ---------- 91.37: the church of open tuning (two tiers of three windows over the pulpit) ----------
  const TUNING = ['D', 'A', 'D', 'F#', 'A', 'D'], LIGHT = [91.367, 91.9, 92.433, 92.933, 93.467, 94.033];
  function lancet(x0, yb, w, h) { const x1 = x0 + w, cx = x0 + w / 2, ys = yb - h + w * .7, yt = yb - h;
    return () => { s.beginPath(); s.moveTo(x0, yb); s.lineTo(x0, ys); s.quadraticCurveTo(x0, yt + w * .15, cx, yt); s.quadraticCurveTo(x1, yt + w * .15, x1, ys); s.lineTo(x1, yb); s.closePath(); }; }
  function church(t, tl, dur) {
    const tt = OT(t);
    // the camera tilts down the windows as they light, then settles on her
    const k = kf(t, [[91.37, 1.06], [94.2, 1.0], [96.4, 1.06]], ease.inOut), dy = kf(t, [[91.37, 50], [94.2, 0], [96.4, -60]], ease.inOut);
    withT(() => { cam(k, 540, 900, 0, dy);
      bg(INK);
      // stone courses on the wall
      rows(-120, -120, W + 120, 1500, 0, 70, () => 2, CUT, 0, 3);
      const WW = 250, WH = 470, WX = (i) => 85 + (i % 3) * 330, YB = (i) => i < 3 ? 570 : 1100;
      for (let i = 0; i < 6; i++) {
        const lit = t >= LIGHT[i], x0 = WX(i), yb = YB(i), mk = lancet(x0, yb, WW, WH), cx = x0 + WW / 2, cy = yb - 200;
        // light falling from the lower tier onto the floor
        if (lit && i >= 3) clipTo(() => pathOf([[x0, yb], [x0 + WW, yb], [x0 + WW + 120 - (i - 3) * 80, 1560], [x0 - 40 - (i - 3) * 80, 1560]]), () => rows(x0 - 200, yb, x0 + WW + 200, 1560, .3, 16, (u) => 1 + 2 * (1 - u), CUT));
        shape(mk, lit ? CUT : INK, 12, CUT);
        clipTo(mk, () => {
          if (lit) { rows(x0, yb - WH, x0 + WW, yb, .9, 46, () => 4, INK); rows(x0, yb - WH, x0 + WW, yb, -.9, 46, () => 4, INK); }
          else { rows(x0, yb - WH, x0 + WW, yb, .9, 46, () => 1.5, CUT); rows(x0, yb - WH, x0 + WW, yb, -.9, 46, () => 1.5, CUT); }
        });
        if (lit) { const pop = 1 + .25 * hit(t, LIGHT[i], 9);
          dot(cx, cy, 92 * pop, INK); dot(cx, cy, 80 * pop, CUT);
          fitText(TUNING[i], cx, cy + 5, 120 * pop, 124 * pop, INK);
          for (let j = 0; j < 8; j++) { const a = j * TAU / 8; flick(cx + Math.cos(a) * 96 * pop, cy + Math.sin(a) * 96 * pop, a, 30, 6, INK); }
          shape(RECT(x0 - 6, yb + 4, WW + 12, 20), CUT);
        }
      }
      // pews in the dark either side of the pulpit
      for (const x of [-120, 900]) for (let r = 0; r < 4; r++) { const y = 1600 + r * 80;
        shape(() => pathOf([[x, y], [x + 300, y], [x + 300, y + 44], [x, y + 44]]), INK, 6, CUT); }
      // Ellen behind the pulpit, the guitar held up like scripture
      const lift = -16 * beatPulse(t, 8);
      ellen(540, 1950 + lift, 1.45, { pose: 'hold', t, smile: .45, eyes: t > 94.1 ? 'brow' : 'open' });
      // the pulpit
      const pul = () => pathOf(chisel([[200, 1580], [880, 1580], [850, 2000], [230, 2000]], 21, 4));
      shape(pul, INK, 8, CUT);
      clipTo(pul, () => rows(200, 1580, 880, 2000, Math.PI / 2, 30, () => 2.5, CUT));
      shape(RECT(170, 1555, 740, 40), CUT, 6);
      shape(RECT(330, 1650, 420, 150), CUT, 7);
      fitText('OPEN D', 540, 1727, 84, 360, INK);
    });
  }

  // ---------- 96.4: the slide on the strings; the strings become six railway tracks running up the tall frame ----------
  const CX = W / 2, HZ = 560, FX = 700, FY = 1250, KS = FX / 980;
  const PJ = (X, Z) => [CX + X * FX / Z, HZ + FY / Z];
  const SL_Z = (t) => t < 97.37 ? 1.55 : t < 98.0 ? lerp(1.55, 2.3, ease.out(inv(97.37, 97.75, t))) : lerp(2.3, 46, ease.in(inv(98.0, 99.33, t)));
  function rails(t, m, travel = 0) {
    // ground + far landscape appear as the neck turns into track
    if (m > 0) { stars(41, Math.round(90 * m), 30, 30, W - 30, HZ - 20, t);
      shape(() => pathOf([[-120, HZ + 2], [W * .16, HZ - 40 * m], [W * .27, HZ - 10], [W * .42, HZ - 60 * m], [W * .57, HZ - 15], [W * .73, HZ - 70 * m], [W * .89, HZ - 20], [W + 120, HZ - 50 * m], [W + 120, HZ + 4]]), INK, 4 * m, CUT); }
    // fretboard binding + inlays (guitar), ballast (track)
    if (m < 1) { for (const X of [-.78, .78]) taper([PJ(X, .95), PJ(X, 80)], 14 * (1 - m), 1, CUT);
      for (const Zi of [3.1, 5.2, 8.9, 15.2]) { const p = PJ(0, Zi); s.beginPath(); s.ellipse(p[0], p[1], 120 * KS / Zi * (1 - m), 40 / Zi * (1 - m) + .1, 0, 0, TAU); s.fillStyle = CUT; s.fill(); } }
    if (m > 0) { const r = rng(7); for (let i = 0; i < 260; i++) { const X = (r() - .5) * 2.4, Z = 1 + r() * 30, p = PJ(X, Z); flick(p[0], p[1], r() * 3, 26 / Z * m + .5, 4 / Z * m + .3, CUT); } }
    const XI = (i) => (i - 2.5) * lerp(.27, .36, m), G = lerp(0, .065, m);
    // frets (guitar) fade as sleepers (track) grow
    for (let j = 0; j < 16; j++) { const Z = 1.05 * Math.pow(1.3, j); if (Z > 70) break;
      if (m < 1) taper([PJ(-.78, Z), PJ(.78, Z)], 40 / Z * (1 - m) + .1, 40 / Z * (1 - m) + .1, CUT); }
    if (m > 0) for (let i = 0; i < 6; i++) for (let k = 0; k < 140; k++) { const Z = .9 + wrap(k * .32 - travel, 140 * .32); if (Z > 46) continue;
      taper([PJ(XI(i) - .12, Z), PJ(XI(i) + .12, Z)], 52 / Z * m, 52 / Z * m, CUT); }
    // strings -> rails
    for (let i = 0; i < 6; i++) { const w0 = lerp(20 - i * 2, 15, m);
      if (G < .004) taper([PJ(XI(i), .9), PJ(XI(i), 90)], w0, .6, CUT);
      else for (const d of [-G, G]) { taper([PJ(XI(i) + d, .9), PJ(XI(i) + d, 90)], w0, .6, CUT); taper([PJ(XI(i) + d, .9), PJ(XI(i) + d, 90)], w0 * .25, .2, INK); } }
  }
  const HS = 145;   // the slide's height at Z = 1 (kept chunky for the phone)
  function slideTube(Z, chim) {
    const L = PJ(-.84, Z), R_ = PJ(.84, Z), hs = HS / Z, y = L[1] - 8 / Z;
    const tube = RECT(L[0], y - hs, R_[0] - L[0], hs);
    shape(tube, CUT, Math.max(1.5, 7 / Z));
    clipTo(tube, () => { taper([[L[0], y - hs * .72], [R_[0], y - hs * .72]], 14 / Z, 14 / Z, INK); taper([[L[0], y - hs * .4], [R_[0], y - hs * .4]], 5 / Z, 5 / Z, INK);
      for (let x = L[0]; x < R_[0]; x += 60 / Z) taper([[x, y - hs], [x + 40 / Z, y]], 1.5 / Z + .3, 1.5 / Z + .3, INK); });
    s.beginPath(); s.ellipse(R_[0], y - hs / 2, hs * .22, hs / 2, 0, 0, TAU); s.fillStyle = CUT; s.fill(); s.lineWidth = 6 / Z; s.strokeStyle = INK; s.stroke();
    s.beginPath(); s.ellipse(R_[0], y - hs / 2, hs * .13, hs * .34, 0, 0, TAU); s.fillStyle = INK; s.fill();
    if (chim > 0) { const cx = lerp(L[0], R_[0], .78), ch = hs * .9 * chim; shape(() => pathOf([[cx - hs * .2, y - hs + 2], [cx + hs * .2, y - hs + 2], [cx + hs * .32, y - hs - ch], [cx - hs * .32, y - hs - ch]]), INK, 3 / Z, CUT); }
    return { top: [lerp(L[0], R_[0], .78), y - hs - hs * .9 * chim], hs, L, y };
  }
  function finger(L, y, hs, out) {
    // the ring finger inside the slide; her hand comes in from the lower left
    withT(() => { s.translate(-out, out * .4);
      const fy = y - hs * .5;
      taper([[L[0] + 60, fy], [L[0] - 140, fy + 10], [-120, fy + 150]], hs * .62, hs * 1.4, CUT);
      s.lineWidth = 6; s.strokeStyle = INK; s.beginPath(); s.moveTo(L[0] + 40, fy - hs * .31); s.lineTo(L[0] - 140, fy - hs * .34); s.lineTo(-120, fy + 150 - hs * .6); s.stroke();
      s.beginPath(); s.moveTo(L[0] + 40, fy + hs * .31); s.lineTo(L[0] - 140, fy + hs * .36); s.lineTo(-120, fy + 150 + hs * .7); s.stroke();
      taper([[L[0] - 40, fy - hs * .3], [L[0] - 32, fy + hs * .3]], 4, 4); taper([[L[0] - 80, fy - hs * .3], [L[0] - 72, fy + hs * .32]], 3, 3);
      // the rest of the hand and the jacket cuff below, out of frame at the left
      shape(() => smoothPath([[-160, fy + 40], [L[0] - 150, fy + 60], [L[0] - 120, fy + 220], [L[0] - 200, fy + 420], [-160, fy + 460]]), CUT, 7);
      taper([[-200, fy + 60], [-200, fy + 700]], 380, 380, INK);
    });
  }
  function slideRails(t, tl, dur) {
    const m = smooth(inv(97.9, 98.9, OT(t))), Z = SL_Z(OT(t)), h = harm(t);
    withT(() => { cam(1 + .03 * tl / dur, CX, HZ + 300);
      bg(INK);
      rails(t, m, 0);
      // steam puffs from the slide's new chimney (the harmonica whistle), rising up the tall sky
      const chim = smooth(inv(97.95, 98.3, t));
      const st = slideTube(Z, chim);
      for (let k = 0; k < 24; k++) { const te = 98.05 + k * .055; if (t < te) break;
        const a = t - te, Ze = SL_Z(te), p0 = PJ(-.84 + 1.68 * .78, Ze), hs0 = HS / Ze, top = [p0[0], p0[1] - 8 / Ze - hs0 - hs0 * .9 * smooth(inv(97.95, 98.3, te))];
        const r = 18 / Ze + 40 * a + 70 * a * a, x = top[0] - a * (90 + 300 * h) * (k % 2 ? 1 : .7), y = top[1] - a * 420;
        if (a < 1.6) { dot(x, y, r + 4, INK); dot(x, y, r, CUT); dot(x + r * .3, y - r * .3, r * .55, INK); dot(x + r * .3, y - r * .3, r * .45, CUT); } }
      if (t < 98.4) finger(st.L, st.y, HS / 1.55, t < 98.0 ? 0 : ease.in(inv(98.0, 98.4, t)) * 700);
      // the whistle's carved shout
      if (h > .3 && t > 98.2) fitText('WHOOO', 540, 230 - (t - 98.2) * 60, 130, 700, CUT, { rot: -.06 });
    });
  }

  // ---------- 99.33: the slide is a locomotive; sparks become notes; Jimi hangs off the back, flying up like a flag ----------
  const SYL = [99.33, 99.87, 100.33, 100.6];
  const TRACKY = [1330, 1385, 1460, 1560, 1690, 1850];
  const LK = .95;   // locomotive scale
  function loco(x, y, t) {
    withT(() => { s.translate(x, y); s.scale(LK, LK);
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
  // Jimi: hands on the cab's grab rail at (hx, hy); the body streams out behind, swung up by the wind (rot), at scale sc
  function jimiHanging(hx, hy, sc, rot, t, laugh) {
    withT(() => { s.translate(hx, hy); s.rotate(rot); s.scale(sc, sc); s.translate(-90, 105);
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
      // his carved head, thrown back laughing (counter-turned so it stays near upright as his body swings up)
      put('jimi-1968', -110, -30, 250, { crop: [.42, 0, .58, .27], ay: .85, rot: -.12 - laugh * .12 - rot * .75 });
    });
  }
  function locomotive(t, tl, dur) {
    const tt = OT(t);
    withT(() => { cam(1 + .04 * tl / dur, 400, 1100);
      bg(CUT);
      // speed lines in the tall sky
      for (let i = 0; i < 30; i++) { const r = hash(i * 13 + 7), y = 60 + r * 1150, x = wrap(r * 3000 - tt * 2200 * (.6 + r), 1800) - 400; taper([[x, y], [x + 200 + r * 260, y]], 1, 7 * r + 2); }
      // the ground and its six tracks (the strings, side on), spreading toward us
      shape(RECT(-120, TRACKY[0] - 20, W + 240, H), INK);
      TRACKY.forEach((y, i) => { const sp = 60 + i * 16; for (let x = -wrap(tt * 2400 * (1 + i * .25), sp); x < W + 40; x += sp) taper([[x, y + 2], [x - 14 - i * 3, y + 10 + i * 4]], 6 + i * 1.5, 6 + i * 1.5, CUT);
        taper([[-120, y], [W + 120, y]], 5 + i * 1.6, 5 + i * 1.6, CUT); });
      const bump = SYL.reduce((a, b) => a + hit(t, b, 9), 0), bounce = (Math.floor(t * 12) % 2) * 4 + bump * 16;
      const LX = 900 + bump * 24, LY = TRACKY[1] - 2 - bounce;
      // smoke from the stack, streaming back and up the sky
      for (let k = 0; k < 26; k++) { const te = 99.0 + k * .09, a = t - te; if (a < 0) break; if (a > 1.8) continue;
        const x = LX + 235 * LK - a * 380, y = LY - 460 * LK - a * 520 - Math.sin(k) * 20, r = 30 + a * 80; dot(x, y, r + 6, INK); dot(x, y, r, CUT); }
      // sparks off the wheels that turn into notes as they fly up
      const emit = []; for (let k = 0; k < 40; k++) emit.push([99.33 + k * .05, k]);
      for (const b of SYL) for (let k = 0; k < 10; k++) emit.push([b + k * .01, 100 + Math.round(b * 10) + k]);
      for (const [te, k] of emit) { const a = t - te; if (a < 0 || a > 1.3) continue;
        const r = rng(k * 77 + 3), vx = -250 - r() * 550, vy = -800 - r() * 800, w0 = [LX - 330 * LK + r() * 400 * LK, LY];
        const x = w0[0] + vx * a, y = w0[1] + vy * a + 600 * a * a;
        if (y > LY - 40) flick(x, y, Math.atan2(vy + 1200 * a, vx) + Math.PI, 40, 6, CUT);
        else note(x, y, 1 + r() * .8, INK, Math.sin(a * 6 + k) * .4); }
      loco(LX, LY, t);
      const laugh = SYL.reduce((a, b) => a + hit(t, b, 7), 0), sw = .6 + Math.sin(OT(t) * 9) * .06;
      jimiHanging(LX - 450 * LK, LY - 335 * LK, 1.3, sw, t, laugh);
      // his laughing, carved, stacked up the sky above him
      SYL.forEach((b, i) => { const a = t - b; if (a < 0 || a > .55) return; const k = ease.back(a / .18);
        fitText('HA!', 200 + (i % 2) * 300 + i * 40, 260 + i * 130 - a * 70, 120 * k, 300, INK, { rot: -.2 + (i % 2) * .3 }); });
    });
  }

  // ---------- 101.47: Bob, behind the turntable, puts a tiny record on it; the bus drives round it ----------
  function recordDisc(cx, cy, rx, ry, ang, labelStr) {
    withT(() => { s.translate(cx, cy); s.scale(1, ry / rx);
      dot(0, 0, rx, INK); ring(0, 0, rx, Math.max(3, rx * .015), CUT);
      for (let r = rx * .36; r < rx * .97; r += rx * .045) ring(0, 0, r, Math.max(1, rx * .004), CUT);
      s.rotate(ang);
      // the sheen, rotating with it
      for (const a0 of [0, Math.PI]) clipTo(() => { s.beginPath(); s.moveTo(0, 0); s.arc(0, 0, rx * .96, a0 - .18, a0 + .18); s.closePath(); }, () => { for (let r = rx * .37; r < rx * .96; r += rx * .018) ring(0, 0, r, Math.max(1, rx * .006), CUT); });
      // the label: a little globe map
      const lr = rx * .32; dot(0, 0, lr, CUT); ring(0, 0, lr, Math.max(2, rx * .012), INK);
      clipTo(CIRC(0, 0, lr), () => { for (let i = 1; i < 4; i++) ring(0, 0, lr * i / 4, Math.max(1, rx * .004), INK); for (let i = 0; i < 12; i++) taper([[0, 0], [Math.cos(i * TAU / 12) * lr, Math.sin(i * TAU / 12) * lr]], 1, 1);
        shape(() => smoothPath([[-lr * .7, -lr * .2], [-lr * .3, -lr * .6], [lr * .1, -lr * .3], [-lr * .1, lr * .1], [-lr * .5, lr * .2]]), INK); shape(() => smoothPath([[lr * .3, lr * .2], [lr * .7, lr * .1], [lr * .6, lr * .6], [lr * .2, lr * .55]]), INK); });
      if (labelStr) { shape(RECT(-lr * .78, -lr * .2, lr * 1.56, lr * .4), CUT, Math.max(1, rx * .006)); fitText(labelStr, 0, 0, lr * .3, lr * 1.3, INK); }
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
  const PC = [560, 1390], PRX = 430, PRY = 200;   // the platter
  function turntable(t, tl, dur) {
    const tt = OT(t), TD = 102.45;
    withT(() => { cam(1 + .05 * tl / dur, PC[0], PC[1] - 100);
      shape(RECT(-120, -120, W + 240, H + 240), CUT);
      rows(-120, -120, W + 120, 1100, 0, 22, (u) => 1 + u * 2.5, INK);
      // Bob behind the turntable: torso, then his head above it (kept off-centre, not too much Bob face)
      shape(() => pathOf(chisel([[20, 940], [520, 980], [640, 1400], [-60, 1400]], 41, 5)), INK);
      clipTo(() => pathOf([[20, 940], [520, 980], [640, 1400], [-60, 1400]]), () => rows(-60, 940, 640, 1400, .6, 30, () => 3, CUT));
      const hold = t < TD;
      bobHead(270, 1000, 540, .08 + (hold ? .06 : 0));
      // the turntable's top, wood, receding; then the platter
      const top = () => pathOf(chisel([[90, 1090], [1010, 1090], [1110, 1740], [-30, 1740]], 13, 4));
      shape(top, INK); clipTo(top, () => rows(-30, 1090, 1110, 1740, .05, 22, () => 2, CUT, 4, 2));
      shape(() => pathOf([[-30, 1740], [1110, 1740], [1110, 2000], [-30, 2000]]), INK, 5, CUT);
      shape(ELL(PC[0], PC[1] + 22, PRX, PRY), CUT, 6); shape(ELL(PC[0], PC[1], PRX, PRY), INK, 5, CUT);
      clipTo(ELL(PC[0], PC[1], PRX, PRY), () => { withT(() => { s.translate(PC[0], PC[1]); s.scale(1, PRY / PRX); for (let r = 60; r < PRX; r += 34) ring(0, 0, r, 4, CUT); }); });
      // tonearm at rest
      dot(990, 1150, 46, CUT); ring(990, 1150, 46, 5); taper([[990, 1150], [1010, 1560]], 18, 14, CUT); taper([[990, 1150], [1010, 1560]], 6, 4, INK);
      // the record: held up by his face, lowered, let go, spinning
      const c = OT(t) < TD ? kf(OT(t), [[101.47, [640, 960]], [101.9, [620, 1060]], [TD, [PC[0], PC[1] - 14]]], ease.inOut) : [PC[0], PC[1] - 14];
      const ang = t < TD ? 0 : (t - TD) * TAU * .75, RRX = 250, RRY = 116;
      const hp = hold ? [c[0] - RRX + 5, c[1]] : kf(OT(t), [[TD, [c[0] - RRX + 5, c[1]]], [TD + .45, [430, 1010]]], ease.out);
      recordDisc(c[0], c[1], RRX, RRY, ang, null);
      // his arm, from the shoulder down to the record's edge
      taper([[440, 1010], [lerp(440, hp[0], .5) - 30, Math.max(hp[1], 1010) + 40], [hp[0] - 40, hp[1] + 20]], 96, 66, INK);
      // his hand pinching the record's edge
      shape(() => smoothPath([[hp[0] - 70, hp[1] - 40], [hp[0] + 10, hp[1] - 52], [hp[0] + 34, hp[1] - 12], [hp[0] + 30, hp[1] + 30], [hp[0] - 40, hp[1] + 50], [hp[0] - 80, hp[1] + 20]]), CUT, 6);
      taper([[hp[0] + 4, hp[1] - 30], [hp[0] - 30, hp[1] - 20]], 4, 2); taper([[hp[0] + 6, hp[1]], [hp[0] - 30, hp[1] + 6]], 4, 2); taper([[hp[0] + 4, hp[1] + 26], [hp[0] - 34, hp[1] + 30]], 4, 2);
      // the bus starts round it
      if (t > 102.7) busOnRecord(PC[0], PC[1] - 14, 205, 95, Math.PI * .5 + (t - 102.7) * 2.0, .1, tt);
    });
  }
  // 103.3: looking down on the record, nearly from above, so it fills the tall frame
  function recordClose(t, tl, dur) {
    const tt = OT(t), RCX = 540, RCY = 1060, RX = 520, RY = 440, ang = (t - 102.45) * TAU * .75, TA = 104.17;
    withT(() => { cam(1.04 + .05 * tl / dur, RCX, RCY);
      bg(INK);
      rows(-120, -120, W + 120, H + 120, .05, 26, () => 2, CUT, 5, 9);
      shape(ELL(RCX, RCY + 50, 640, 560), CUT, 8); shape(ELL(RCX, RCY + 20, 640, 560), INK, 6, CUT);
      clipTo(ELL(RCX, RCY + 20, 640, 560), () => withT(() => { s.translate(RCX, RCY + 20); s.scale(1, 560 / 640); for (let r = 540; r < 640; r += 36) ring(0, 0, r, 6, CUT); }));
      // the bus on the far side drives behind the tonearm, the near side in front: draw by depth
      const phi = Math.PI * .5 + (t - 102.7) * 2.0, near = Math.sin(phi) > 0;
      recordDisc(RCX, RCY, RX, RY, ang, 'ELLEN');
      // tonearm swings in from the top right on "hope"
      const sw = ease.inOut(inv(TA, TA + .35, OT(t))), aA = lerp(1.2, 2.05, sw), PV = [980, 230], AL = 640;
      const tip = [PV[0] + Math.cos(aA) * AL, PV[1] + Math.sin(aA) * AL];
      if (!near) busOnRecord(RCX, RCY, RX * .74, RY * .74, phi, .3, tt);
      taper([PV, tip], 34, 24, CUT); taper([PV, tip], 11, 9, INK); dot(PV[0], PV[1], 100, CUT); ring(PV[0], PV[1], 100, 8); dot(PV[0], PV[1], 40, INK);
      withT(() => { s.translate(tip[0], tip[1]); s.rotate(aA - Math.PI / 2); shape(() => pathOf([[-45, -10], [45, -10], [55, 70], [-40, 70]]), CUT, 6); taper([[0, 0], [0, 60]], 6, 6); });
      if (near) busOnRecord(RCX, RCY, RX * .74, RY * .74, phi, .3, tt);
      // notes rise from the needle once it drops
      if (t > TA + .35) for (let k = 0; k < 14; k++) { const te = TA + .35 + k * .2, a = t - te; if (a < 0 || a > 1.8) continue;
        note(tip[0] - (40 * k) % 160 + 40 - a * 120, tip[1] - 80 - a * 520, 1.4, CUT, Math.sin(a * 5 + k) * .3); }
    });
  }

  // ---------- 105.6: the kids spell her name, ELLEN over McILWAINE ----------
  const NAME = ['E', 'L', 'L', 'E', 'N', 'M', 'c', 'I', 'L', 'W', 'A', 'I', 'N', 'E'];
  // slot j: ELLEN on the back row (bigger cards, 5 across), McILWAINE on the front row (9 across)
  const SLOT = (j) => j < 5 ? [540 + (j - 2) * 195, 1330, 1.32] : [540 + (j - 9) * 110, 1770, 1.08];
  const SCR = [9, 3, 12, 6, 0, 13, 1, 10, 4, 8, 2, 7, 5, 11]; // kid j stands at slot SCR[j] at first (none in place)
  const BUSX = 560, BUSY = 840, BUSK = .56, DOOR = [BUSX + 430 * BUSK, BUSY - 40], TDONE = 108.97;
  function letterKid(x, y, k, letter, seed) {
    kid(x, y, k, { seed });
    withT(() => { s.translate(x, y); s.scale(k, k);
      shape(RECT(-46, -142, 92, 102), CUT, 6); fitText(letter, 0, -90, 76, 70, INK); });
  }
  function kidPos(j, t) {
    const te = 105.72 + j * .1, ta = 107.8, tb = 108.9, p0 = SLOT(SCR[j]), p1 = SLOT(j);
    if (t < te) return null;
    if (t < te + .7) { const u = ease.out((OT(t) - te) / .7); return [lerp(DOOR[0], p0[0], u), lerp(DOOR[1], p0[1], u) - Math.abs(Math.sin(u * 9)) * 22, lerp(.5, p0[2], u)]; }
    if (t < ta) return [p0[0], p0[1] - (Math.floor(t * 6 + j) % 2) * 4, p0[2]];
    const u = ease.inOut(inv(ta, tb, OT(t))), hop = Math.sin(u * Math.PI) * Math.min(260, 60 + Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) * .22);
    return [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u) - hop, lerp(p0[2], p1[2], u)];
  }
  function nameKids(t, tl) {
    const tt = OT(t);
    // the camera starts on the bus door and pulls back to show the whole name, then leans in on it
    const k = kf(OT(t), [[105.6, 1.14], [107.7, 1.0], [TDONE, 1.0], [112, 1.02]], ease.inOut), cy = kf(OT(t), [[105.6, 960], [107.7, 1100], [TDONE, 1100], [112, 1560]], ease.inOut);
    withT(() => { cam(k, 540, cy);
      bg(INK); stars(77, 110, 30, 30, W - 30, 640, t);
      // the road
      shape(RECT(-120, BUSY, W + 240, H - BUSY + 120), CUT); taper([[-120, BUSY + 2], [W + 120, BUSY + 2]], 10, 10);
      for (let i = 0; i < 6; i++) taper([[i * 220 - 40, BUSY + 80], [i * 220 + 90, BUSY + 80]], 10, 10);
      rows(-120, BUSY + 120, W + 120, H + 120, 0, 44, (u) => .6 + u * 2.4, INK);
      // the bus, parked, door open
      schoolBus(BUSX, BUSY, BUSK, { t: 105.6, kids: 5, asleep: false, doorOpen: t > 105.65, lights: false });
      // firework of cut flicks in the sky when the name is whole
      if (t >= TDONE) { const a = t - TDONE, R = 120 + a * 900;
        for (const [fx_, fy, sd] of [[200, 250, 1], [540, 150, 2], [880, 270, 3]]) for (let i = 0; i < 16; i++) { const an = i * TAU / 16 + sd; flick(fx_ + Math.cos(an) * R * .3, fy + Math.sin(an) * R * .3, an, 50 + 40 * hit(t, TDONE, 2), 6, CUT); } }
      // kids, back to front
      const list = []; for (let j = 0; j < 14; j++) { const p = kidPos(j, t); if (p) list.push([p, j]); }
      list.sort((a, b) => a[0][1] - b[0][1] || a[0][2] - b[0][2]);
      const jump = t >= TDONE ? Math.sin(Math.min(1, (t - TDONE) / .3) * Math.PI) * 40 : 0;
      for (const [[x, y, kk], j] of list) letterKid(x, y - jump * (j % 2 ? 1 : .7), kk, NAME[j], j + 3);
    });
  }

  chapter('p3', 77.6, 112.0, [
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

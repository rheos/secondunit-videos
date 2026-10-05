// w5-verse3: VERSE 3 (152.9 - 187.0), Bob's beats 19b, 20, 21, 22, 23, 25, 17, 18 (STORYBOARD.md).
//   152.90 MJ moonwalks in and dances with Ellen on a lit 80s floor ("I heard about her in the 80s")
//   159.47 record store: tiny Ellen plays furiously in a listening booth; Bob studies her through a magnifier
//   163.50 through the glass: Ellen looks straight at Bob, one eyebrow up, keeps playing
//   167.53 Bob walks away; the shop stretches impossibly far behind him, the booth shrinking to a speck
//   172.33 present-day Bob opens his hand: a guest check rises out of it, AMOUNT DUE: PAY ATTENTION
//   175.20 he tries to pay; the cashier is Jimi, who shakes his head; NO SALE on "cheque" (176.42)
//   177.00 the Ellen McIlwaine train already leaving; the station clock has no hands; Bob takes his hat off
//   185.03 the smoke writes ELLEN McILWAINE across the sky; the harmonica wind breaks it apart
(() => {
  // harmonica band, 150.0 .. 190.0 every 0.5 s (source/harmonica-band.json): the wind
  const HARM = [.001, .002, .011, .005, .004, .004, .003, .002, .001, .002, .009, .006, .004, .006, .003, .012, .012, .04, .026, .038,
    .03, .01, .005, .004, .017, .056, .105, .103, .193, .038, .008, .01, .053, .082, .021, .022, .005, .013, .02, .007,
    .005, .036, .042, .04, .059, .049, .055, .093, .14, .165, .029, .121, .063, .002, 0, 0, 0, 0, .001, .001,
    .004, .001, 0, .001, .004, .003, .025, .003, .001, .001, .001, .001, 0, .08, .026, .265, .231, .163, .309, .009, .004];
  const harm = (t) => { const i = (t - 150) / .5, a = Math.floor(i), u = i - a, g = (k) => HARM[clamp(k, 0, HARM.length - 1)]; return lerp(g(a), g(a + 1), u); };
  const wind = (t) => smooth(clamp((harm(t) - .015) / .09));
  const R = (x, y, w, h) => () => { s.beginPath(); s.rect(x, y, w, h); };
  const OV = (x, y, rx, ry, a = 0) => () => { s.beginPath(); s.ellipse(x, y, rx, ry, a, 0, TAU); };
  const bg = (c) => shape(R(-20, -20, W + 40, H + 40), c);
  const ring = (x, y, r, lw, c = INK) => { s.beginPath(); s.arc(x, y, r, 0, TAU); s.lineWidth = lw; s.strokeStyle = c; s.stroke(); };
  const pivot = (x, y, rot, fn, sx = 1) => withT(() => { s.translate(x, y); s.rotate(rot); s.scale(sx, 1); fn(); });
  // carved text that shrinks (never squashes) to fit maxW
  const fitText = (str, x, y, size, maxW, c = INK, o = {}) => { s.font = `900 ${size}px "Superclarendon"`; const m = s.measureText(str).width; carveText(str, x, y, m > maxW ? size * maxW / m : size, c, o); };
  const beatT = (t) => { const i = lastBeat(t); return i < 0 ? 0 : FEAT.beats[i]; };

  // ---------------- props ----------------
  // Michael Jackson: the carved mj-1984 piece on drawn legs (black trousers, white socks, loafers). (0,0) = feet.
  function mjFig(h, o = {}) {
    const { toe = -1, spread = 0 } = o;
    const legL = h * .31, hipY = -legL;
    for (const sd of [-1, 1]) {
      const i = sd < 0 ? 0 : 1, up = toe === i ? 1 : 0;
      const ax = sd * (30 + spread), ay = -up * 30;
      const kx = sd * (30 + spread * .5) - up * sd * 22, ky = hipY + legL * .5 - up * 14;
      taper([[sd * 28, hipY], [kx, ky], [ax, ay - 30]], 50, 38, INK);
      shape(R(ax - 19, ay - 40, 38, 20), CUT, 4);                                    // the white socks
      const sh = up ? [[ax - 20, ay - 22], [ax + 20, ay - 22], [ax + sd * 34, ay + 8], [ax - sd * 8, ay + 4]]
        : [[ax - 22, ay - 20], [ax + 22, ay - 20], [ax + sd * 50, ay + 2], [ax - sd * 26, ay + 2]];
      shape(() => pathOf(chisel(sh, 5 + i, 2)), INK);
    }
    shape(() => pathOf([[-58, hipY - 60], [58, hipY - 60], [52, hipY + 22], [-52, hipY + 22]]), INK);
    put('mj-1984', 0, hipY + 40, h * .66, { ax: .55, ay: 1 });
  }
  // a hand seen palm-on, fingers up, coat sleeve below; (x,y) = palm centre. open 0 (fist) .. 1 (spread)
  function hand(x, y, k, open, rot = 0, o = {}) {
    withT(() => { s.translate(x, y); s.rotate(rot); s.scale(k, k);
      const sl = () => pathOf(chisel([[-150, 110], [150, 110], [200, 760], [-200, 760]], 71, 4));
      shape(sl, INK); clipTo(sl, () => rows(-210, 110, 210, 760, .35, 20, () => 3.5, CUT));
      shape(() => pathOf(chisel([[-150, 96], [150, 96], [154, 140], [-154, 140]], 72, 2)), CUT, 6);       // shirt cuff
      if (o.behind) o.behind();
      const palm = () => pathOf(chisel([[-118, -70], [118, -70], [128, 30], [86, 110], [-86, 110], [-128, 30]], 73, 3));
      shape(palm, CUT, 7);
      taper([[-70, 10], [-10, 40], [60, 20]], 3, 2); taper([[-60, -20], [40, -30]], 2.5, 1.5);
      if (o.mid) o.mid();
      const fing = (pts, w) => { taper(pts, w + 20, w + 12, INK); taper(pts, w - 2, w - 10, CUT); };
      const fx = [-84, -28, 28, 84], fl = [150, 180, 172, 132];
      if (open < .25) {
        for (let i = 0; i < 4; i++) { fing([[fx[i], -76], [fx[i], -40], [fx[i] * .95, 4]], 44); taper([[fx[i] - 14, -34], [fx[i] + 14, -34]], 3, 3); }
        fing([[-122, 30], [-70, -2], [-14, -6]], 40);
      } else {
        for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 + (i - 1.5) * .16 * open, L = fl[i] * lerp(.55, 1, open);
          fing([[fx[i], -60], [fx[i] + Math.cos(a) * L * .55, -60 + Math.sin(a) * L * .55], [fx[i] + Math.cos(a) * L, -60 + Math.sin(a) * L]], 44);
          taper([[fx[i] + Math.cos(a) * L * .5 - 14, -60 + Math.sin(a) * L * .5], [fx[i] + Math.cos(a) * L * .5 + 14, -60 + Math.sin(a) * L * .5]], 2.5, 2.5); }
        const ta = lerp(-.4, -2.5, open);
        fing([[-120, 30], [-120 + Math.cos(ta) * 70, 30 + Math.sin(ta) * 70], [-120 + Math.cos(ta) * 130, 30 + Math.sin(ta) * 130]], 46);
      }
    });
  }
  // the guest check: (x, y) = top centre, 600 x 780 at k = 1
  function cheque(x, y, k, rot = 0, shear = 0) {
    withT(() => { s.translate(x, y); s.rotate(rot); s.transform(1, 0, shear, 1, 0, 0); s.scale(k, k);
      const P = () => pathOf(chisel([[-300, 0], [300, 0], [300, 780], [-300, 780]], 91, 3));
      shape(P, CUT, 9);
      shape(R(-300, 0, 600, 104), INK);
      fitText('GUEST CHECK', 0, 54, 62, 480, CUT);
      for (let i = 0; i < 4; i++) {
        const ly = 176 + i * 58, r = rng(17 + i);
        taper([[-266, ly], [266, ly]], 2.5, 2.5);
        const pts = []; for (let x = -246; x < -246 + 160 + r() * 150; x += 14) pts.push([x, ly - 16 + Math.sin(x * .5 + i) * 7 * (r() + .4)]);
        taper(pts, 4, 3);
        const pp = []; for (let x = 150; x < 246; x += 13) pp.push([x, ly - 15 + Math.cos(x * .6 + i) * 7]); taper(pp, 4, 3);
      }
      taper([[-266, 418], [266, 418]], 5, 5); taper([[-266, 432], [266, 432]], 2.5, 2.5);
      fitText('AMOUNT DUE:', 0, 492, 62, 480, INK);
      shape(R(-268, 548, 536, 124), null, 7);
      fitText('PAY ATTENTION', 0, 611, 84, 480, INK);
      for (let i = 0; i < 9; i++) flick(-250 + i * 62, 742, -Math.PI / 2 + (i % 2 ? .2 : -.2), 26, 2.5, INK);
    });
  }
  // present-day Bob: the 1989 piece's head (flipped to face right) on a drawn coat, with a hat. (0,0) = feet
  const BOB_HEAD = [.2, 0, .5, .42];
  function presentBob(x, y, k, o = {}) {
    const { hatOff = 0, bow = 0, slump = 0 } = o;
    withT(() => { s.translate(x, y + slump * 10); s.scale(k, k);
      for (const sd of [-1, 1]) { taper([[sd * 34, -250], [sd * 38, -120], [sd * 40, -18]], 52, 40, INK);
        shape(() => pathOf(chisel([[sd * 40 - 30, -26], [sd * 40 + 46, -26], [sd * 40 + 52, 4], [sd * 40 - 32, 4]], 8 + sd, 2)), INK); }
      const coat = () => pathOf(chisel([[-84, -470], [84, -470], [112, -330], [118, -150], [-118, -150], [-112, -330]], 61, 3));
      shape(coat, INK); clipTo(coat, () => { rows(-120, -470, 120, -150, -.2, 22, (u) => 1 + u * 2.5, CUT); taper([[0, -460], [6, -152]], 3, 3, CUT); });
      shape(() => pathOf([[-34, -474], [0, -410], [34, -474]]), CUT, 4);
      pivot(0, -466, bow, () => {
        put('bob-1989', 0, 14, 230, { ax: .5, ay: 1, crop: BOB_HEAD, flip: true });
        if (hatOff < .5) {
          shape(OV(4, -150, 126, 22), INK);
          shape(() => pathOf(chisel([[-72, -152], [80, -152], [68, -226], [4, -214], [-58, -226]], 63, 2)), INK);
          shape(R(-70, -174, 148, 14), CUT);
        }
      });
      // arms; with the hat off, it is held against his chest
      if (hatOff >= .5) {
        taper([[-80, -450], [-60, -360], [10, -330]], 36, 28, INK);
        withT(() => { s.translate(20, -320); s.rotate(.3); shape(OV(0, 0, 92, 30), INK, 6, CUT); shape(() => pathOf([[-56, -6], [56, -6], [46, -64], [-46, -64]]), INK, 6, CUT); shape(OV(0, 0, 86, 24), INK); shape(R(-54, -24, 108, 10), CUT); });
        dot(-6, -312, 18, CUT); ring(-6, -312, 18, 4);
        taper([[80, -450], [96, -320], [92, -200]], 36, 28, INK); dot(92, -196, 17, CUT); ring(92, -196, 17, 4);
      } else for (const sd of [-1, 1]) { taper([[sd * 80, -450], [sd * 100, -320], [sd * 94, -200]], 36, 28, INK); dot(sd * 94, -196, 17, CUT); ring(sd * 94, -196, 17, 4); }
    });
  }

  // ---------------- 152.9 MJ and Ellen dance ("I heard about her in the 80s") ----------------
  function danceFloor(T) {
    bg(INK);
    const hz = 590, Y = (z) => hz + 490 / z, X = (u, z) => 960 + u * 300 / z, bi = lastBeat(T);
    const zs = []; for (let z = 1; z < 16; z *= 1.3) zs.push(z);
    for (let j = 0; j < zs.length - 1; j++) for (let i = -10; i < 10; i++) {
      const z0 = zs[j], z1 = zs[j + 1], lit = hash(i * 31 + j * 7 + bi * 131 + 999) < .32;
      const q = [[X(i, z0), Y(z0)], [X(i + 1, z0), Y(z0)], [X(i + 1, z1), Y(z1)], [X(i, z1), Y(z1)]];
      shape(() => pathOf(q), lit ? CUT : INK, 3, lit ? INK : CUT);
      if (lit && j < 4) { const cx = (q[0][0] + q[2][0]) / 2, cy = (q[0][1] + q[2][1]) / 2; flick(cx - 30 / z0, cy, 0, 60 / z0, 5 / z0, INK); }
    }
    // the back wall: sparkles thrown by the mirror ball, re-thrown every beat
    const r = rng(500 + bi);
    for (let i = 0; i < 26; i++) { const x = r() * W, y = 40 + r() * (hz - 80), l = 10 + r() * 22; flick(x - l, y, 0, l * 2, 3, CUT); flick(x, y - l, Math.PI / 2, l * 2, 3, CUT); }
    // mirror ball
    taper([[960, -10], [960, 70]], 4, 4, CUT);
    const ball = OV(960, 130, 66, 66);
    shape(ball, CUT, 6); clipTo(ball, () => { rows(880, 60, 1040, 200, 0, 18, () => 3.5); rows(880, 60, 1040, 200, Math.PI / 2, 18, () => 3.5); });
    flick(930, 100, -2.3, 26, 7, INK);
  }
  function spot(x, xTop) {
    const P = () => pathOf([[xTop - 34, -20], [xTop + 34, -20], [x + 300, 975], [x - 300, 975]]);
    shape(P, CUT); clipTo(P, () => rows(x - 320, -20, x + 320, 980, Math.atan2(x - xTop, 995) * -1, 26, () => 1.6));
    shape(OV(x, 975, 300, 54), CUT); shape(OV(x, 975, 300, 54), null, 3);
  }
  function shotDance(t) {
    const T = onTwos(t), bi = lastBeat(T), bt = beatT(T), hop = hit(T, bt, 9);
    danceFloor(T);
    const mx = kf(T, [[152.9, 1830], [155.3, 1270]], (x) => x), ex = 640;
    spot(ex, 760); spot(mx, 1160);
    // poses: moonwalk in (feet alternate on the beat), groove, lean together on "80s", spin, hit the pose
    let rM = 0, rE = 0, spinM = 1, spinE = 1, toe = -1, ePose = 'stand', dyM = 0, dyE = 0;
    if (T < 155.3) { toe = bi % 2; rM = -.03; dyE = -hop * 14; rE = (bi % 2 ? .04 : -.04); }
    else if (T < 157.47) { rM = bi % 2 ? .08 : -.08; rE = bi % 2 ? -.07 : .07; dyM = -hop * 26; dyE = -hop * 22; ePose = bi % 2 ? 'point' : 'stand'; toe = bi % 2 ? 1 : 0; }
    else if (T < 158.53) { const l = ease.out(inv(157.47, 157.85, T)); rM = -.3 * l; rE = .3 * l; ePose = 'point'; }
    else { const u = inv(158.53, 159.3, T); spinM = Math.cos(u * TAU * 2); spinE = Math.cos(u * TAU * 2 + .4); ePose = u >= 1 ? 'point' : 'stand'; }
    pivot(ex, 975 + dyE, rE, () => ellen(0, 0, 1.22, { pose: ePose, t: T, smile: .7, eyes: 'open' }), spinE < 0 ? Math.min(-.12, spinE) : Math.max(.12, spinE));
    pivot(mx, 975 + dyM, rM, () => mjFig(900, { toe, spread: toe >= 0 ? 10 : 0 }), Math.abs(spinM) < .12 ? .12 * Math.sign(spinM || 1) : spinM);
    // the moonwalk leaves glide marks on the floor
    if (T < 155.5) for (let i = 1; i < 5; i++) { const gx = mx + i * 70; if (gx < 1900) taper([[gx, 990 + i * 3], [gx + 50, 990 + i * 3]], 5, 0, CUT); }
  }

  // ---------------- 159.47 the listening booth ("I wondered what's so special") ----------------
  function storeBack(T) {
    bg(CUT);
    for (let r = 0; r < 3; r++) {
      const y0 = 40 + r * 210;
      clipTo(R(0, y0, W, 176), () => { const rr = rng(40 + r); for (let x = -4; x < W;) { const w = 7 + rr() * 18; if (rr() < .82) shape(R(x, y0 + 6 + rr() * 26, w - 3, 180), INK); x += w; } });
      shape(R(0, y0 + 176, W, 18), INK);
    }
    // the bins in front: sleeves facing out
    shape(R(-20, 800, W + 40, 300), INK);
    for (let i = 0; i < 9; i++) { const x = 60 + i * 210, r = rng(60 + i), a = (r() - .5) * .12;
      withT(() => { s.translate(x + 90, 900); s.rotate(a);
        shape(R(-86, -96, 172, 172), CUT, 5); dot(30, -40, 40 + r() * 20, INK); dot(30, -40, 10, CUT);
        clipTo(R(-86, -96, 172, 172), () => rows(-86, -96, 86, 76, r() * 3, 16, (u) => u * 4 * r()));
      }); }
  }
  function boothWindowInside(x0, y0, w, h, fx, fy, fr) {
    shape(R(x0, y0, w, h), CUT);
    for (let y = y0 + 20; y < y0 + h; y += 34) for (let x = x0 + 20; x < x0 + w; x += 34) if (Math.hypot(x - fx, (y - fy) * .8) > fr) dot(x, y, 4, INK);
  }
  function furiousLines(x, y, k, T) {
    const r = rng(Math.floor(T * 12) + 3);
    for (let i = 0; i < 5; i++) { const a = -2.6 + r() * 1.6, d = (60 + r() * 50) * k; taper([[x + Math.cos(a) * d, y + Math.sin(a) * d], [x + Math.cos(a) * (d + 40 * k), y + Math.sin(a) * (d + 40 * k)]], 5 * k, 1, INK); }
  }
  function shotBooth(t) {
    const T = onTwos(t), wd = wind(T), jit = wd * 4 * Math.sin(T * 97);
    storeBack(T);
    const bx = 380 + jit;
    const box = () => pathOf(chisel([[bx, 110], [bx + 620, 110], [bx + 620, 1010], [bx, 1010]], 81, 3));
    shape(box, INK); clipTo(box, () => rows(bx, 110, bx + 620, 1010, 0, 40, () => 3, CUT));
    const ex = bx + 300, ey = 790, ek = .85, sl = .5 + .42 * Math.sin(T * TAU * 3.3);
    const wx = bx + 80, wy = 270, ww = 460, wh = 530;
    const inside = () => { boothWindowInside(wx, wy, ww, wh, ex, ey - 462 * ek, 70); ellen(ex, ey, ek, { pose: 'play', t: T, slide: sl, wind: wd }); furiousLines(ex + 140, ey - 380 * ek, ek, T); };
    clipTo(R(wx, wy, ww, wh), inside);
    shape(R(wx, wy, ww, wh), null, 12);
    for (let i = 0; i < 3; i++) taper([[wx + 20 + i * 34, wy + 120 - i * 10], [wx + 120 + i * 34, wy + 16]], 3, 1, INK);
    // the sign
    shape(() => pathOf(chisel([[bx + 50, 136], [bx + 570, 136], [bx + 570, 236], [bx + 50, 236]], 82, 2)), INK);
    shape(R(bx + 62, 146, 496, 80), null, 3, CUT);
    fitText('LISTENING BOOTH', bx + 310, 187, 54, 440, CUT);
    // harmonica: the booth rattles and the sound leaks out of its seams
    if (wd > .05) for (let i = 0; i < 4; i++) { const a = -2.2 + i * .25; for (const sd of [-1, 1]) { const ox = sd < 0 ? bx - 10 : bx + 630, a2 = sd < 0 ? a : Math.PI - a;
      flick(ox + Math.cos(a2) * 20, 320 + i * 60, sd < 0 ? Math.PI + (i - 1.5) * .2 : (i - 1.5) * .2, 60 + 70 * wd, 6, INK); } }
    // Bob studies the species: the 1989 piece, leaning in, with a magnifier on the glass
    const lean = kf(T, [[159.47, 0], [161.5, 1]], ease.out);
    put('bob-1989', 1560 - lean * 50, 1110, 840, { ax: .5, ay: 1, rot: -.05 - lean * .05, crop: [0, 0, 1, .62] });
    const lx = 856 + jit, ly = 540, lr = 104;
    taper([[lx + 70, ly + 74], [1070, 800]], 26, 30, INK);
    clipTo(OV(lx, ly, lr, lr), () => withT(() => { s.translate(lx, ly); s.scale(1.7, 1.7); s.translate(-lx, -ly); inside(); }));
    ring(lx, ly, lr, 16); ring(lx, ly, lr - 12, 3, CUT);
    flick(lx - 60, ly - 40, -.9, 40, 5, INK);
    taper([[1340, 1100], [1220, 900], [1090, 810]], 120, 70, INK);
    hand(1080, 790, .42, 0, -.7);
  }

  // ---------------- 163.5 through the glass ("about this lady") ----------------
  function shotGlass(t) {
    const T = onTwos(t), wd = wind(T);
    bg(INK); rows(-20, -20, W + 20, H + 20, 0, 46, () => 4, CUT);
    const wx = 240, wy = 50, ww = 1440, wh = 990, ex = 960, ey = 1200, ek = 1.72;
    const brow = T >= 163.84;
    clipTo(R(wx, wy, ww, wh), () => {
      boothWindowInside(wx, wy, ww, wh, ex, ey - 462 * ek, 150);
      withT(() => { s.translate(ex, ey); s.rotate(brow ? -.04 : 0); ellen(0, 0, ek, { pose: 'play', t: T, slide: .5 + .3 * Math.sin(T * TAU * 1.6), wind: wd, eyes: brow ? 'brow' : 'open', smile: T > 165.5 ? .3 : 0 }); });
      for (let i = 0; i < 4; i++) taper([[wx + 30 + i * 46, wy + 260 - i * 18], [wx + 230 + i * 46, wy + 20]], 4, 1, INK);
      for (let i = 0; i < 3; i++) taper([[wx + ww - 240 + i * 40, wy + wh - 40], [wx + ww - 60 + i * 40, wy + wh - 240]], 3, 1, INK);
    });
    shape(R(wx, wy, ww, wh), null, 22);
    // harmonica: the glass hums
    if (wd > .05) for (let i = 0; i < 3; i++) { const d = 40 + i * 50 + wd * 30; taper(arcPts(ex, 380, 300 + d, 300 + d, -2.7, -2.25, 8), 6 * wd, 6 * wd, CUT); taper(arcPts(ex, 380, 300 + d, 300 + d, -.89, -.44, 8), 6 * wd, 6 * wd, CUT); }
    // the back of Bob's head, close, in the corner of frame
    const hd = OV(1720, 1010, 250, 270);
    shape(hd, INK); clipTo(hd, () => { const r = rng(9); for (let i = 0; i < 40; i++) { const a = r() * TAU, d = r() * 230; flick(1720 + Math.cos(a) * d, 1010 + Math.sin(a) * d * 1.05, a + 1.6, 26, 5, CUT); } });
    shape(OV(1476, 980, 34, 58, .2), CUT, 6); taper(arcPts(1480, 980, 16, 32, -1.2, 1.2, 8), 4, 4);
  }

  // ---------------- 167.53 the endless shop ("I made no effort to inspect") ----------------
  function shotWalk(t) {
    const T = onTwos(t), u = inv(167.53, 172.33, T), wd = wind(T);
    const vx = 700, vy = 420, Xl = (z) => vx - 1000 / z, Xr = (z) => vx + 1400 / z, Yf = (z) => vy + 700 / z, Yc = (z) => vy - 520 / z;
    const zB = 3 * Math.pow(30, Math.pow(u, 1.25));
    bg(CUT);
    // ceiling with strip lights
    shape(() => pathOf([[Xl(1), Yc(1)], [Xr(1), Yc(1)], [vx, vy]]), INK);
    for (let z = 1.2; z < zB; z += 1.6) { const z1 = z + .6, a = -200, b = 200;
      shape(() => pathOf([[vx + a / z, vy - 470 / z], [vx + b / z, vy - 470 / z], [vx + b / z1, vy - 470 / z1], [vx + a / z1, vy - 470 / z1]]), CUT); }
    // floor planks
    for (let i = -14; i <= 14; i++) taper([[vx + i * 160, Yf(1)], [vx, vy]], 3, 0, INK);
    for (let z = 1; z < zB; z *= 1.18) taper([[Xl(z), Yf(z)], [Xr(z), Yf(z)]], Math.max(1, 3 / z), Math.max(1, 3 / z));
    // the walls of records, as long as the booth is far
    for (const side of [Xl, Xr]) {
      shape(() => pathOf([[side(1), Yc(1)], [side(zB), Yc(zB)], [side(zB), Yf(zB)], [side(1), Yf(1)]]), CUT, 5);
      const r = rng(side === Xl ? 3 : 4);
      for (let z = 1; z < zB; z *= 1.022) { if (r() < .18) continue; const x = side(z);
        taper([[x, lerp(Yc(z), Yf(z), .1)], [x, lerp(Yc(z), Yf(z), .9)]], Math.max(1, 7 / z), Math.max(1, 7 / z)); }
      for (const h of [.1, .37, .64, .9]) taper([[side(1), lerp(Yc(1), Yf(1), h)], [side(zB), lerp(Yc(zB), Yf(zB), h)]], 18, Math.max(1, 18 / zB), h === .1 || h === .9 ? INK : CUT);
    }
    // the far end wall, and the booth at the end of it
    shape(() => pathOf([[Xl(zB), Yc(zB)], [Xr(zB), Yc(zB)], [Xr(zB), Yf(zB)], [Xl(zB), Yf(zB)]]), CUT, Math.max(1, 6 / zB));
    const bh = 1000 / zB, bw = 640 / zB, bx = vx - bw / 2, by = Yf(zB) - bh;
    shape(R(bx, by, bw, bh), INK);
    const wx = bx + bw * .13, wy = by + bh * .18, ww = bw * .74, wh = bh * .6;
    clipTo(R(wx, wy, ww, wh), () => { shape(R(wx, wy, ww, wh), CUT); const ek = wh * .78 / 560; ellen(wx + ww * .45, wy + wh, ek, { pose: 'play', t: T, slide: .5 + .42 * Math.sin(T * TAU * 3.3), wind: wd }); });
    // harmonica: the sleeves blow off the shelves
    for (let k = 0; k < 12; k++) { const ts = 170.45 + k * .14; if (T < ts) continue; const a = T - ts, r = rng(300 + k), sd = r() < .5 ? -1 : 1;
      const z0 = 1.6 + r() * 3, sx = (sd < 0 ? Xl(z0) : Xr(z0)), sy = lerp(Yc(z0), Yf(z0), .2 + r() * .5);
      const x = sx + (vx - sx) * .2 * a + a * (500 + r() * 500) * (r() < .7 ? 1 : -1), y = sy - a * 260 + a * a * 120, sz = (80 + r() * 50) * (1 + a * .8);
      withT(() => { s.translate(x, y); s.rotate(a * (3 + r() * 4) * sd); shape(R(-sz / 2, -sz / 2, sz, sz), CUT, 5); dot(sz * .2, 0, sz * .32, INK); dot(sz * .2, 0, sz * .08, CUT); }); }
    // Bob walks toward us, not looking back
    const bi = lastBeat(T), ph = hit(T, beatT(T), 8);
    put('bob-1989', 1420 - u * 70, 1230 - ph * 22, lerp(880, 1010, ease.inOut(u)), { ax: .5, ay: 1, rot: bi % 2 ? .035 : -.035 });
  }

  // ---------------- 172.33 the cheque ("now all I got is the cheque") ----------------
  function rays(cx, cy, n, seed) { for (let i = 0; i < n; i++) { const a = i / n * TAU + seed, b = a + TAU / n * .45; shape(() => pathOf([[cx, cy], [cx + Math.cos(a) * 2400, cy + Math.sin(a) * 2400], [cx + Math.cos(b) * 2400, cy + Math.sin(b) * 2400]]), INK); } }
  function shotCheque(t) {
    const T = onTwos(t), wd = wind(T);
    bg(CUT); rays(960, 430, 28, .05);
    shape(OV(960, 430, 420, 470), CUT);
    const open = T < 172.88 ? 0 : T < 173.05 ? .5 : 1;
    const rise = T < 173.22 ? 0 : T < 174.1 ? Math.ceil(inv(173.22, 174.1, T) * 6) / 6 : 1;
    const flap = wd * Math.sin(T * TAU * 2.6);
    const px = 960, py = 1000, hk = 1.25;
    hand(px, py, hk, open, 0, { mid: () => {
      if (rise > 0) clipTo(R(0 - 700, -2000, 1400, 2000 - 60), () => cheque(0, (-80 - rise * 820) / hk, .85 / hk, flap * .05, flap * .06));
      else if (open > 0) { shape(() => pathOf(chisel([[-60, -90], [60, -100], [70, -40], [-56, -30]], 5, 3)), CUT, 6); taper([[-50, -64], [56, -70]], 3, 3); }
    } });
    // harmonica: the wind tugs at the check
    if (wd > .05) for (let i = 0; i < 6; i++) { const y = 160 + i * 110, x = wrap(i * 377 + T * 1900, 2400) - 300; taper([[x, y], [x + 260, y + 6]], 1, 8 * wd); }
  }

  // ---------------- 175.2 Jimi at the till ----------------
  function register(x, y, flag) {
    withT(() => { s.translate(x, y);
      const body = () => pathOf(chisel([[-200, 0], [200, 0], [180, -170], [130, -320], [-130, -320], [-180, -170]], 41, 3));
      shape(body, INK); clipTo(body, () => rows(-200, -320, 200, 0, Math.PI / 2, 26, () => 2.5, CUT));
      for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) { const kx = -125 + c * 50 + r * 6, ky = -150 + r * 46; dot(kx, ky, 17, CUT); dot(kx, ky, 6, INK); }
      if (flag > 0) clipTo(R(-200, -800, 400, 800 - 300), () => { const fy = -300 - 112 * flag;
        taper([[0, fy + 90], [0, -300]], 8, 8);
        shape(R(-130, fy, 260, 90), CUT, 7); fitText('NO SALE', 0, fy + 46, 52, 210, INK); });
      shape(R(-110, -306, 220, 56), CUT, 6); for (let i = 0; i < 4; i++) shape(R(-88 + i * 46, -294, 34, 34), null, 3);
      taper(arcPts(210, -170, 60, 60, -1.6, .3, 10), 12, 12); dot(270, -150, 16, INK);
    });
  }
  function shotTill(t) {
    const T = onTwos(t);
    bg(CUT); rows(-20, -20, W + 20, 780, Math.PI / 2, 44, (u) => 5, INK);
    shape(R(-20, 230, W + 40, 60), CUT); shape(R(-20, 230, W + 40, 60), null, 4);
    // Jimi behind the counter: fringed jacket, head from the Helsinki piece, shaking no
    const jx = 1420, shake = T >= 175.6 ? .16 * Math.sin((T - 175.6) * TAU * 3.2) : 0;
    const torso = () => pathOf(chisel([[jx - 190, 790], [jx + 190, 790], [jx + 170, 560], [jx + 70, 510], [jx - 70, 510], [jx - 170, 560]], 51, 3));
    shape(torso, INK); clipTo(torso, () => { rows(jx - 200, 500, jx + 200, 800, -.5, 30, () => 3, CUT); for (let i = 0; i < 12; i++) flick(jx - 180 + i * 32, 600 + (i % 2) * 20, Math.PI / 2, 60, 4); });
    pivot(jx, 540, shake, () => put('jimi-1968', 0, 40, 330, { ax: .5, ay: 1, crop: [.4, 0, .6, .25] }));
    // the counter
    shape(R(-20, 760, W + 40, 340), CUT); clipTo(R(-20, 800, W + 40, 300), () => rows(-20, 800, W + 20, 1100, Math.PI / 2, 60, () => 5));
    shape(R(-20, 760, W + 40, 44), INK);
    for (const sd of [-1, 1]) { taper([[jx + sd * 170, 600], [jx + sd * 200, 740], [jx + sd * 120, 770]], 56, 44, INK); dot(jx + sd * 112, 770, 26, CUT); ring(jx + sd * 112, 770, 26, 5); }
    // the till and the check on its spike
    const ding = hit(T, 176.42, 7), flag = T < 176.42 ? 0 : Math.min(1, Math.ceil(inv(176.42, 176.6, T) * 2) / 2);
    register(400, 768, flag);
    if (ding > .05) for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .32; flick(400 + Math.cos(a) * 250, 330 + Math.sin(a) * 200, a, 60 * (.5 + ding), 7, INK); }
    const cx = 880; shape(OV(cx, 772, 54, 12), INK); taper([[cx, 772], [cx, 300]], 8, 2);
    cheque(cx, 360, .55, -.04 + ding * .05);
    taper([[cx - 2, 370], [cx, 300]], 6, 2);
    // Bob's hand offers a banknote
    const reach = kf(T, [[175.2, 0], [175.6, 1]], ease.out);
    hand(1060 + reach * 30, 1260 - reach * 390, .6, .6, .32, {});
    withT(() => { s.translate(1060 + reach * 30, 1260 - reach * 390); s.rotate(.32); s.scale(.6, .6); s.translate(-20, -230); s.rotate(-.25);
      shape(R(-160, -75, 320, 150), CUT, 8); shape(R(-140, -56, 280, 112), null, 3); shape(OV(0, 0, 46, 54), null, 6); fitText('$', 0, 2, 62, 60, INK); fitText('$', -112, -30, 34, 34, INK); fitText('$', 112, 30, 34, 34, INK); });
  }

  // ---------------- 177.0 the train has gone ("I'm ashamed I missed that train") ----------------
  const VX = 1180, VY = 560, trY = (z) => VY + 520 / z, trX = (z) => VX + 40 / z;
  const trainZ = (t) => 2.2 + Math.max(0, t - 177) * 2.5;
  function carriage(x, y, k, T) {   // rear of the last car, (x,y) = rails centre; k = scale
    withT(() => { s.translate(x, y); s.scale(k, k);
      for (const sd of [-1, 1]) { dot(sd * 280, -40, 46, INK); dot(sd * 280, -40, 16, CUT); }
      const body = () => pathOf([[-450, -80], [450, -80], [450, -940], [300, -1000], [-300, -1000], [-450, -940]]);
      shape(body, INK); clipTo(body, () => rows(-450, -1000, 450, -80, Math.PI / 2, 34, () => 3, CUT));
      shape(R(-130, -780, 260, 560), CUT, 8);
      for (const sd of [-1, 1]) shape(R(sd * 300 - 70, -760, 140, 220), CUT, 6);
      ellen(0, -170, 1.0, { pose: 'play', t: T, slide: .5 + .35 * Math.sin(T * TAU * 1.5), wind: .85 });
      shape(R(-480, -180, 960, 60), INK);
      for (const yy of [-380, -290]) taper([[-470, yy], [470, yy]], 12, 12);
      for (let i = -5; i <= 5; i++) taper([[i * 92, -400], [i * 92, -180]], 10, 10);
      shape(R(-420, -1100, 840, 104), CUT, 9);
      fitText('ELLEN McILWAINE', 0, -1046, 72, 740, INK);
    });
  }
  function puffsFrom(T, tMax, maxAge) {
    const step_ = .2, base = Math.floor(T / step_) * step_;
    for (let k = 0; k < maxAge / step_; k++) {
      const tb = base - k * step_, age = T - tb; if (tb < 176.6 || tb > tMax) continue;
      const z = trainZ(tb), x = trX(z) + age * 110, y = trY(z) - 1100 / z - age * 75, r = (90 / z + 12) * (.6 + age * .35) * (age > maxAge - .8 ? (maxAge - age) / .8 : 1);
      if (r <= 1) continue;
      const P = OV(x, y, r * 1.2, r); shape(P, INK); clipTo(P, () => taper(arcPts(x, y, r * .6, r * .45, 3.6, 5.6, 8), r * .12, 1, CUT));
    }
  }
  function station(T) {
    bg(CUT);
    for (let i = 0; i < 6; i++) taper([[-20, 20 + i * 34], [W + 20, 20 + i * 34]], 9 - i * 1.4, 9 - i * 1.4);
    shape(() => pathOf([[1000, VY + 4], [1120, 520], [1300, 540], [1500, 500], [1700, 530], [1940, 505], [1940, VY + 4]]), INK);
    clipTo(() => pathOf([[1000, VY + 4], [1120, 520], [1300, 540], [1500, 500], [1700, 530], [1940, 505], [1940, VY + 4]]), () => flicks(1000, 500, 1940, 560, 30, 0, 30, 3, 21));
    // ground beyond the rails
    const gr = () => pathOf([[VX, VY], [1940, VY], [1940, 1100], [1640, 1100]]);
    shape(gr, INK); clipTo(gr, () => flicks(1200, VY, 1940, 1100, 70, -Math.PI / 2, 40, 4, 22));
    // the bed, sleepers, rails
    shape(() => pathOf([[VX, VY], [1640, 1100], [760, 1100]]), CUT);
    for (let z = 1; z < 40; z *= 1.16) { const y = trY(z), x = trX(z), hw = 400 / z; taper([[x - hw, y], [x + hw, y]], Math.max(1, 22 / z), Math.max(1, 22 / z)); }
    for (const g of [-340, 340]) taper([[trX(1) + g, trY(1)], [VX, VY]], 14, 1);
    // the platform and its edge
    const pf = () => pathOf([[-20, 600], [1050, 586], [820, 1100], [-20, 1100]]);
    shape(pf, CUT); clipTo(pf, () => { for (let i = 0; i < 9; i++) taper([[-200 + i * 130, 1100], [1100, 580]], 3, 0); for (let y = 640; y < 1100; y += 60 + (y - 600) * .25) taper([[-20, y], [1100, y]], 2, 2); });
    taper([[830, 1100], [1060, 586]], 70, 4, INK);
    // the canopy, its posts, and the clock with no hands
    const cp = () => pathOf([[-20, -20], [880, -20], [1110, 480], [-20, 240]]);
    shape(cp, INK); clipTo(cp, () => rows(-20, -20, 1110, 480, -.21, 26, () => 3, CUT));
    for (const px of [140, 700, 960]) { const ty = lerp(240, 480, (px + 20) / 1130), by = lerp(600, 586, px / 1050) + (1100 - 600) * (1 - (px + 20) / 1130) * .1;
      taper([[px, ty], [px, by + 30]], Math.max(4, 30 * (1.2 - px / 1100)), Math.max(4, 30 * (1.2 - px / 1100))); }
    const cx = 400, cyy = 470, cr = 118;
    taper([[cx, 320], [cx, cyy - cr]], 12, 12);
    dot(cx, cyy, cr + 14, INK); dot(cx, cyy, cr, CUT);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, l = i % 3 ? 16 : 30; taper([[cx + Math.cos(a) * (cr - 8), cyy + Math.sin(a) * (cr - 8)], [cx + Math.cos(a) * (cr - 8 - l), cyy + Math.sin(a) * (cr - 8 - l)]], i % 3 ? 5 : 9, i % 3 ? 5 : 9); }
    dot(cx, cyy, 9, INK);
  }
  function shotTrain(t) {
    const T = onTwos(t);
    station(T);
    const z = trainZ(T);
    puffsFrom(T, 999, 3.4 + inv(183, 185, T) * 1.2);
    carriage(trX(z), trY(z), 1 / z, T);
    // Bob on the platform, too late: hat off on "ashamed", slumps on "missed"
    const hatOff = T >= 179.68 ? 1 : 0, bow = T >= 179.68 ? .16 : .02, slump = T >= 182.44 ? 1 : 0;
    presentBob(690, 1040, 1.02, { hatOff, bow, slump });
  }

  // ---------------- 185.03 the smoke writes her name; the wind takes it ----------------
  function shotSky(t) {
    const T = onTwos(t), wd = Math.max(wind(T), inv(186.1, 186.6, T));
    bg(CUT);
    for (let i = 0; i < 5; i++) taper([[-20, 18 + i * 30], [W + 20, 18 + i * 30]], 8 - i * 1.5, 8 - i * 1.5);
    const hz = 930;
    shape(() => pathOf([[-20, hz], [300, hz - 30], [700, hz - 10], [1100, hz - 40], [1500, hz - 14], [1940, hz - 34], [1940, 1100], [-20, 1100]]), INK);
    clipTo(R(-20, hz - 40, W + 40, 200), () => flicks(-20, hz, 1940, 1100, 60, 0, 40, 3, 31));
    // the train, tiny, on the horizon (Ellen's hair a fleck of red)
    const tx = 1580, ty = hz - 8;
    shape(R(tx - 26, ty - 34, 52, 30), CUT, 3); shape(R(tx - 10, ty - 30, 8, 22), RED);
    // the letters
    const str = 'ELLEN McILWAINE', size = 196, L = 170, Wd = 1580, y0 = 400;
    s.font = `900 ${size}px "Superclarendon"`;
    const tot = s.measureText(str).width, sc = Wd / tot;
    const head = lerp(L - 40, L + Wd + 40, inv(185.03, 185.75, T));
    const brk = ease.in(inv(186.05, 187.0, T));
    // the smoke column from the train up to the writing head
    const hx = Math.min(head, L + Wd), hy = y0 + 60;
    for (let i = 0; i < 16; i++) { const u = i / 15, r = rng(70 + i);
      let x = Math.pow(1 - u, 2) * tx + 2 * (1 - u) * u * (tx + 260) + u * u * hx, y = Math.pow(1 - u, 2) * (ty - 40) + 2 * (1 - u) * u * (hy + 120) + u * u * hy;
      x += brk * (300 + r() * 700) * (1 - u * .3); y -= brk * r() * 200;
      const rr = (22 + u * 30) * (1 - brk * .6);
      if (rr > 2) { shape(OV(x, y, rr * 1.2, rr), INK); flick(x - rr * .5, y, -.3, rr, rr * .15, CUT); } }
    let acc = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i], cw = s.measureText(ch).width; s.font = `900 ${size}px "Superclarendon"`;
      const cx = L + (acc + cw / 2) * sc; acc += cw; if (ch === ' ' || cx > head) continue;
      for (let j = 0; j < 3; j++) {
        const h1 = hash(i * 13 + j * 5 + 7), h2 = hash(i * 7 + j * 11 + 3);
        const dx = brk * (260 + h1 * 760) * (1 + j * .25), dy = -brk * (40 + h2 * 220) + brk * brk * 60 * j, rot = brk * (h2 - .4) * 1.8;
        const by = y0 - size * .42 + j * size * .28;
        withT(() => { s.translate(cx + dx, y0 + dy); s.rotate(rot); s.translate(-cx, -y0);
          s.beginPath(); s.rect(cx - cw * sc, by, cw * sc * 2, size * .28 + (j === 2 ? size * .2 : 0)); s.clip();
          carveText(ch, cx, y0, size, INK, { w: cw * sc * .96 });
          for (let k = 0; k < 4; k++) taper([[cx - cw * sc, by + 14 + k * 16], [cx + cw * sc, by + 10 + k * 16]], 3, 2, CUT);
        });
        s.font = `900 ${size}px "Superclarendon"`;
      }
    }
    // the writing head's puff
    if (head < L + Wd + 40 && brk === 0) { shape(OV(hx, hy - 40, 60, 48), INK); flick(hx - 30, hy - 40, -.3, 50, 8, CUT); }
    // harmonica wind streaks
    if (wd > .05) for (let i = 0; i < 12; i++) { const y = 120 + hash(i * 3 + 1) * 700, x = wrap(hash(i * 5 + 2) * 2400 + T * 2600, 2600) - 400; taper([[x, y], [x + 340, y - 10]], 1, 9 * wd); }
  }

  chapter('w5', 152.9, 187.0, [
    [152.9, shotDance],
    [159.47, shotBooth],
    [163.5, shotGlass],
    [167.53, shotWalk],
    [172.33, shotCheque],
    [175.2, shotTill],
    [177.0, shotTrain],
    [185.03, shotSky],
  ]);
})();

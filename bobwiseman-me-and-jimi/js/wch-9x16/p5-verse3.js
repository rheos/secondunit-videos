// p5-verse3 (9:16, 1080 x 1920): VERSE 3, 152.9 - 187.0, recomposed for the tall frame from js/wch/w5-verse3.js
// (the 16:9 master is untouched). Bob's beats 19b, 20, 21, 22, 23, 25, 17, 18 (STORYBOARD.md). Same cuts, same hits:
//   152.90 MJ moonwalks in and dances with Ellen on a lit 80s floor ("I heard about her in the 80s")
//          Lauper slides in 153.07, Springsteen 155.30, both further back on the floor
//   156.40 the 80s line-up, staged on three lit risers (a TV variety-show staircase) instead of nine across:
//          Madonna + Prince 156.40, Bowie 156.93, Boy George 157.47, Byrne 158.00, everyone spins 158.53
//   159.47 record store: Ellen plays furiously in a tall listening booth; Bob, in the foreground, studies her through a magnifier
//   163.50 through the glass: Ellen close, one eyebrow up on 163.84, keeps playing; the back of Bob's head below
//   167.53 Bob walks toward us; the shop stretches impossibly far behind him, the booth shrinking to a speck
//   172.33 present-day Bob opens his hand (172.88 / 173.05): a guest check rises out of it (173.22-174.1), AMOUNT DUE: PAY ATTENTION
//   175.20 he tries to pay (reach 175.2-175.6); the cashier is Jimi, who shakes his head from 175.6; NO SALE on "cheque" (176.42)
//   177.00 the Ellen McIlwaine train already leaving; the station clock has no hands; hat off 179.68, slump 182.44
//   185.03 the smoke writes ELLEN / McILWAINE up the tall sky (185.03-185.75); the harmonica wind breaks it apart (186.05-187)
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
  // camera: zoom k (>= 1) with the world point (fx, fy) at the centre of frame, clamped so the frame never leaves the drawing
  const cam = (k, fx, fy) => { const hx = W / 2 / k, hy = H / 2 / k; fx = clamp(fx, hx, W - hx); fy = clamp(fy, hy, H - hy);
    s.translate(W / 2, H / 2); s.scale(k, k); s.translate(-fx, -fy); };

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
  // the tall frame: a mirror ball high up, the sparkling back wall, and the lit floor running from a high horizon to our feet
  const HZ = 1000, FY = (z) => HZ + (1940 - HZ) / z, FX = (u, z) => 540 + u * 250 / z;
  function backWall(T, y1, bx, by, br) {
    const bi = lastBeat(T), r = rng(500 + bi);
    for (let i = 0; i < 30; i++) { const x = r() * W, y = 40 + r() * (y1 - 80), l = 10 + r() * 22; flick(x - l, y, 0, l * 2, 3, CUT); flick(x, y - l, Math.PI / 2, l * 2, 3, CUT); }
    taper([[bx, -10], [bx, by - br]], 4, 4, CUT);
    const ball = OV(bx, by, br, br);
    shape(ball, CUT, 6); clipTo(ball, () => { rows(bx - br, by - br, bx + br, by + br, 0, br * .26, () => 3.5); rows(bx - br, by - br, bx + br, by + br, Math.PI / 2, br * .26, () => 3.5); });
    flick(bx - br * .45, by - br * .45, -2.3, br * .4, 7, INK);
  }
  function danceFloor(T) {
    bg(INK);
    const bi = lastBeat(T);
    const zs = []; for (let z = 1; z < 18; z *= 1.3) zs.push(z);
    for (let j = 0; j < zs.length - 1; j++) for (let i = -7; i < 7; i++) {
      const z0 = zs[j], z1 = zs[j + 1], lit = hash(i * 31 + j * 7 + bi * 131 + 999) < .32;
      const q = [[FX(i, z0), FY(z0)], [FX(i + 1, z0), FY(z0)], [FX(i + 1, z1), FY(z1)], [FX(i, z1), FY(z1)]];
      shape(() => pathOf(q), lit ? CUT : INK, 3, lit ? INK : CUT);
      if (lit && j < 4) { const cx = (q[0][0] + q[2][0]) / 2, cy = (q[0][1] + q[2][1]) / 2; flick(cx - 30 / z0, cy, 0, 60 / z0, 5 / z0, INK); }
    }
    backWall(T, HZ, 540, 210, 105);
  }
  // a spotlight cone from the rig above down to a pool on the floor at yF
  function spot(x, xTop, yF, rw = 230) {
    const P = () => pathOf([[xTop - 30, -20], [xTop + 30, -20], [x + rw, yF], [x - rw, yF]]);
    shape(P, CUT); clipTo(P, () => rows(x - rw - 20, -20, x + rw + 20, yF + 10, Math.atan2(x - xTop, yF + 20) * -1, 26, () => 1.6));
    shape(OV(x, yF, rw, rw * .18), CUT); shape(OV(x, yF, rw, rw * .18), null, 3);
  }
  // a carved photo piece dancing on the black floor: white rim so it reads, bops and tilts on the beat, spins like a cut-out
  function dancer(n, x, y, h, rot, spin) {
    withT(() => { s.translate(x, y); s.rotate(rot); s.scale(Math.abs(spin) < .12 ? .12 * Math.sign(spin || 1) : spin, 1);
      withT(() => { s.filter = 'brightness(0) invert(1)'; for (let i = 0; i < 10; i++) { const a = i * TAU / 10; put(n, Math.cos(a) * 6, Math.sin(a) * 6, h, { ax: .5, ay: 1 }); } });
      put(n, 0, 0, h, { ax: .5, ay: 1 }); });
  }
  const spinSafe = (v) => Math.abs(v) < .12 ? .12 * Math.sign(v || 1) : v;
  function shotDance(t, tl, dur) {
    const T = onTwos(t), bi = lastBeat(T), bt = beatT(T), hop = hit(T, bt, 9), bop = hit(T, bt, 9);
    withT(() => {
      cam(lerp(1, 1.08, ease.inOut(tl / dur)), 560, 1320);   // a slow push in toward the pair
      danceFloor(T);
      // Bob (draft-4 notes): more of the 80s around MJ. Here they arrive further back on the floor, so the pair stays big:
      // Cyndi Lauper slides in from the left on 153.07, Springsteen from the right on 155.30
      const cyIn = ease.out(inv(153.07, 153.6, T)), brIn = ease.out(inv(155.3, 155.83, T));
      if (cyIn > 0) { const x = lerp(-260, 150, cyIn); spot(x, 300, 1150, 150); dancer('lauper', x, 1150 - bop * 16, 440, (bi % 2 ? .06 : -.06), 1); }
      if (brIn > 0) { const x = lerp(1360, 940, brIn); spot(x, 780, 1150, 150); dancer('springsteen', x, 1150 - bop * 14, 440, (bi % 2 ? -.05 : .05), 1); }
      const mx = kf(T, [[152.9, 1340], [155.3, 790]], (x) => x), ex = 320;
      spot(ex, 420, 1800, 250); spot(mx, 640, 1800, 270);
      // poses: moonwalk in (feet alternate on the beat), then groove together
      let rM = 0, rE = 0, toe = -1, ePose = 'stand', dyM = 0, dyE = 0;
      if (T < 155.3) { toe = bi % 2; rM = -.03; dyE = -hop * 14; rE = (bi % 2 ? .04 : -.04); }
      else { rM = bi % 2 ? .08 : -.08; rE = bi % 2 ? -.07 : .07; dyM = -hop * 26; dyE = -hop * 22; ePose = bi % 2 ? 'point' : 'stand'; toe = bi % 2 ? 1 : 0; }
      pivot(ex, 1800 + dyE, rE, () => ellen(0, 0, 1.22, { pose: ePose, t: T, smile: .7, eyes: 'open' }));
      pivot(mx, 1800 + dyM, rM, () => mjFig(940, { toe, spread: toe >= 0 ? 10 : 0 }));
      // the moonwalk leaves glide marks on the floor
      if (T < 155.5) for (let i = 1; i < 5; i++) { const gx = mx + i * 70; if (gx < W + 40) taper([[gx, 1812 + i * 3], [gx + 50, 1812 + i * 3]], 5, 0, CUT); }
    });
  }

  // ---------------- 156.40 the 80s line-up, on a lit staircase ----------------
  // nine across a wide floor would be a pile at 1080 wide; on a variety-show staircase each tier holds two or three, back
  // tiers higher and smaller, Ellen and MJ big on the floor in front. The camera starts high on the top tiers (where the
  // first pops land) and tilts down and out to the whole staircase for the spin.
  const TIERS = [470, 820, 1170];   // the top edge of each riser (the dancers' feet)
  function riser(T, y, i) {
    const bi = lastBeat(T);
    shape(R(-20, y, W + 40, 70), INK);
    clipTo(R(-20, y, W + 40, 70), () => rows(-20, y, W + 20, y + 70, Math.PI / 2, 14, () => 2, CUT));
    shape(R(-20, y - 4, W + 40, 18), CUT, 3);
    for (let k = 0; k < 14; k++) { const x = 40 + k * 78, on = (k + bi + i) % 2 === 0; dot(x, y + 42, 13, on ? CUT : INK); ring(x, y + 42, 13, 3, CUT); }
  }
  function shotLineup(t, tl, dur) {
    const T = onTwos(t), bi = lastBeat(T), bt = beatT(T), bop = hit(T, bt, 9);
    const spin = T >= 158.53 ? Math.cos(inv(158.53, 159.3, T) * TAU * 2) : 1, tilt = (k) => (bi % 2 ? .05 : -.05) * (k % 2 ? 1 : -1);
    const ck = kf(T, [[156.4, 1.22], [157.47, 1.12], [158.4, 1.0], [159.47, 1.06]]), cy = kf(T, [[156.4, 760], [157.47, 880], [158.4, 960], [159.47, 1180]]);
    withT(() => {
      cam(ck, 540, cy);
      bg(INK);
      backWall(T, TIERS[0], 540, 110, 70);
      // a pool of light on each tier instead of one big cone, so the cone never eats the middle of the tall frame
      TIERS.forEach((y) => { const P = () => pathOf([[200, y], [880, y], [760, y - 60], [320, y - 60]]); shape(P, CUT); clipTo(P, () => rows(200, y - 60, 880, y, 0, 12, () => 2)); });
      // [name, x, pop time (0 = there already, -1 = Prince on his bike), height]; tier by tier, back to front
      const ROWS = [
        [['madonna', 290, 156.40, 310], ['bowie', 790, 156.93, 320]],
        [['boygeorge', 280, 157.47, 360], ['byrne', 790, 158.00, 290]],
        [['lauper', 140, 0, 400], ['prince', 540, -1, 370], ['springsteen', 940, 0, 390]],
      ];
      ROWS.forEach((row, ti) => {
        riser(T, TIERS[ti], ti);
        row.forEach(([n, x, ta, h], k) => {
          const y = TIERS[ti] - bop * 14;
          if (n === 'prince') { const pu = ease.out(inv(156.40, 156.93, T)); if (pu > 0) dancer('prince', lerp(-450, x, pu), y + 6 - (pu < 1 ? Math.abs(Math.sin(T * 30)) * 8 : 0), h, pu < 1 ? .04 : tilt(k) * .5, spin); return; }
          const pk = ta <= 0 ? 1 : T < ta ? 0 : ease.back(inv(ta, ta + .25, T));
          if (pk > 0) dancer(n, x, y, h * pk, tilt(k + ti) * pk, spin);
        });
      });
      // the floor in front, and the two of them big on it
      shape(R(-20, TIERS[2] + 70, W + 40, H), INK);
      for (let j = 0; j < 6; j++) for (let i = 0; i < 8; i++) { const y0 = TIERS[2] + 70 + j * 100, lit = hash(i * 13 + j * 5 + bi * 71) < .3;
        if (lit) { shape(R(i * 140, y0, 136, 96), CUT, 3); } }
      pivot(310, 1880 - bop * 18, tilt(4), () => ellen(0, 0, 1.0, { pose: bi % 2 ? 'point' : 'stand', t: T, smile: .7 }), spinSafe(spin));
      pivot(770, 1880 - bop * 18, tilt(5), () => mjFig(720, { toe: bi % 2, spread: 8 }), spinSafe(spin));
    });
  }

  // ---------------- 159.47 the listening booth ("I wondered what's so special") ----------------
  function storeBack(T) {
    bg(CUT);
    for (let r = 0; r < 7; r++) {
      const y0 = 30 + r * 230;
      clipTo(R(0, y0, W, 196), () => { const rr = rng(40 + r); for (let x = -4; x < W;) { const w = 7 + rr() * 18; if (rr() < .82) shape(R(x, y0 + 6 + rr() * 26, w - 3, 200), INK); x += w; } });
      shape(R(0, y0 + 196, W, 18), INK);
    }
  }
  function boothWindowInside(x0, y0, w, h, fx, fy, fr) {
    shape(R(x0, y0, w, h), CUT);
    for (let y = y0 + 20; y < y0 + h; y += 34) for (let x = x0 + 20; x < x0 + w; x += 34) if (Math.hypot(x - fx, (y - fy) * .8) > fr) dot(x, y, 4, INK);
  }
  function furiousLines(x, y, k, T) {
    const r = rng(Math.floor(T * 12) + 3);
    for (let i = 0; i < 5; i++) { const a = -2.6 + r() * 1.6, d = (60 + r() * 50) * k; taper([[x + Math.cos(a) * d, y + Math.sin(a) * d], [x + Math.cos(a) * (d + 40 * k), y + Math.sin(a) * (d + 40 * k)]], 5 * k, 1, INK); }
  }
  function shotBooth(t, tl, dur) {
    const T = onTwos(t), wd = wind(T), jit = wd * 4 * Math.sin(T * 97);
    const lean = kf(T, [[159.47, 0], [161.5, 1]], ease.out);
    const lx = 420 + jit, ly = 800, lr = 150;
    withT(() => {
      cam(lerp(1, 1.1, ease.inOut(tl / dur)), lx, ly - 80);   // push in on the magnifier
      storeBack(T);
      // the booth: a tall cabinet, nearly the height of the shop
      const bx = 90 + jit, bw = 720, by = 170, bh = 1450;
      const box = () => pathOf(chisel([[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh]], 81, 3));
      shape(box, INK); clipTo(box, () => rows(bx, by, bx + bw, by + bh, 0, 40, () => 3, CUT));
      const ex = bx + 300, ey = 1290, ek = 1.12, sl = .5 + .42 * Math.sin(T * TAU * 3.3);
      const wx = bx + 70, wy = 400, ww = bw - 140, wh = 960;
      const inside = () => { boothWindowInside(wx, wy, ww, wh, ex, ey - 462 * ek, 90); ellen(ex, ey, ek, { pose: 'play', t: T, slide: sl, wind: wd }); furiousLines(ex + 160, ey - 380 * ek, ek, T); };
      clipTo(R(wx, wy, ww, wh), inside);
      shape(R(wx, wy, ww, wh), null, 12);
      for (let i = 0; i < 3; i++) taper([[wx + 20 + i * 34, wy + 140 - i * 10], [wx + 140 + i * 34, wy + 16]], 3, 1, INK);
      // the sign, across the top of the booth
      shape(() => pathOf(chisel([[bx + 40, by + 34], [bx + bw - 40, by + 34], [bx + bw - 40, by + 174], [bx + 40, by + 174]], 82, 2)), INK);
      shape(R(bx + 54, by + 48, bw - 108, 112), null, 3, CUT);
      fitText('LISTENING', bx + bw / 2, by + 80, 52, bw - 160, CUT);
      fitText('BOOTH', bx + bw / 2, by + 132, 52, bw - 160, CUT);
      // harmonica: the booth rattles and the sound leaks out of its seams
      if (wd > .05) for (let i = 0; i < 5; i++) { const a = -2.2 + i * .25; for (const sd of [-1, 1]) { const ox = sd < 0 ? bx - 10 : bx + bw + 10;
        flick(ox, 520 + i * 120, sd < 0 ? Math.PI + (i - 2) * .2 : (i - 2) * .2, 50 + 60 * wd, 6, INK); } }
      // the record bins along the bottom, in front of the booth
      shape(R(-20, 1600, W + 40, 340), INK);
      for (let i = 0; i < 5; i++) { const x = 30 + i * 215, r = rng(60 + i), a = (r() - .5) * .12;
        withT(() => { s.translate(x + 90, 1720); s.rotate(a);
          shape(R(-86, -96, 172, 172), CUT, 5); dot(30, -40, 40 + r() * 20, INK); dot(30, -40, 10, CUT);
          clipTo(R(-86, -96, 172, 172), () => rows(-86, -96, 86, 76, r() * 3, 16, (u) => u * 4 * r()));
        }); }
      // Bob studies the species from the foreground, bottom right: the 1989 piece, leaning in, magnifier up to the glass
      put('bob-1989', 690 - lean * 40, 2000, 760, { ax: .5, ay: 1, rot: -.05 - lean * .05, crop: [0, 0, 1, .62] });
      taper([[lx + 100, ly + 110], [560, 1060]], 30, 34, INK);   // the magnifier's handle
      clipTo(OV(lx, ly, lr, lr), () => withT(() => { s.translate(lx, ly); s.scale(1.7, 1.7); s.translate(-lx, -ly); inside(); }));
      ring(lx, ly, lr, 18); ring(lx, ly, lr - 13, 3, CUT);
      flick(lx - 90, ly - 60, -.9, 50, 6, INK);
      taper([[380, 1900], [470, 1420], [560, 1080]], 120, 70, INK);   // his arm up to the handle
      hand(565, 1070, .44, 0, -.5);
    });
  }

  // ---------------- 163.5 through the glass ("about this lady") ----------------
  function shotGlass(t, tl, dur) {
    const T = onTwos(t), wd = wind(T);
    const brow = T >= 163.84;
    const ex = 560, ey = 1800, ek = 2.3, faceY = ey - 466 * ek;
    // a slow push, with a nudge in on the raised eyebrow
    const ck = 1 + .05 * ease.inOut(inv(163.5, 163.84, T)) + .11 * ease.out(inv(163.84, 164.2, T)) + .05 * ease.inOut(inv(164.2, 167.53, T));
    withT(() => {
      cam(ck, ex, faceY + 300);
      bg(INK); rows(-20, -20, W + 20, H + 20, 0, 46, () => 4, CUT);
      const wx = 50, wy = 60, ww = 980, wh = 1790;
      clipTo(R(wx, wy, ww, wh), () => {
        boothWindowInside(wx, wy, ww, wh, ex, faceY, 170);
        withT(() => { s.translate(ex, ey); s.rotate(brow ? -.04 : 0); ellen(0, 0, ek, { pose: 'play', t: T, slide: .5 + .3 * Math.sin(T * TAU * 1.6), wind: wd, eyes: brow ? 'brow' : 'open', smile: T > 165.5 ? .3 : 0 });
          // the kit's brows sit under her fringe; carve them on top so the raised one reads on a phone
          s.scale(ek, ek);
          const bl = [[-26, -494], [-4, -497]], br = brow ? [[6, -500], [20, -516], [36, -508]] : [[8, -497], [32, -494]];
          for (const b of [bl, br]) { taper(b, 9, 9, CUT); taper(b, 5, 5, INK); } });
        for (let i = 0; i < 4; i++) taper([[wx + 30 + i * 46, wy + 300 - i * 18], [wx + 230 + i * 46, wy + 20]], 4, 1, INK);
        for (let i = 0; i < 3; i++) taper([[wx + ww - 240 + i * 40, wy + wh - 300], [wx + ww - 60 + i * 40, wy + wh - 500]], 3, 1, INK);
      });
      shape(R(wx, wy, ww, wh), null, 22);
      // harmonica: the glass hums
      if (wd > .05) for (let i = 0; i < 3; i++) { const d = 40 + i * 50 + wd * 30; taper(arcPts(ex, faceY, 300 + d, 300 + d, -2.7, -2.25, 8), 6 * wd, 6 * wd, CUT); taper(arcPts(ex, faceY, 300 + d, 300 + d, -.89, -.44, 8), 6 * wd, 6 * wd, CUT); }
      // the back of Bob's head, close, filling the bottom of frame: he is the one looking
      const hx = 720, hy = 1900, hd = OV(hx, hy, 400, 370);
      shape(hd, INK); clipTo(hd, () => { const r = rng(9); for (let i = 0; i < 50; i++) { const a = r() * TAU, d = r() * 360; flick(hx + Math.cos(a) * d, hy + Math.sin(a) * d * .9, a + 1.6, 30, 5, CUT); } });
      shape(OV(334, 1820, 42, 70, .2), CUT, 6); taper(arcPts(338, 1820, 18, 38, -1.2, 1.2, 8), 4, 4);
    });
  }

  // ---------------- 167.53 the endless shop ("I made no effort to inspect") ----------------
  function shotWalk(t, tl, dur) {
    const T = onTwos(t), u = inv(167.53, 172.33, T), wd = wind(T);
    const vx = 540, vy = 700, Xl = (z) => vx - 640 / z, Xr = (z) => vx + 640 / z, Yf = (z) => vy + 1300 / z, Yc = (z) => vy - 800 / z;
    const zB = 3 * Math.pow(30, Math.pow(u, 1.25));
    withT(() => {
      cam(lerp(1.07, 1, ease.inOut(u)), vx, vy + 300);   // the camera backs away with him
      bg(CUT);
      // ceiling with strip lights
      shape(() => pathOf([[Xl(1), Yc(1)], [Xr(1), Yc(1)], [vx, vy]]), INK);
      for (let z = 1.2; z < zB; z += 1.6) { const z1 = z + .6, a = -220, b = 220;
        shape(() => pathOf([[vx + a / z, vy - 760 / z], [vx + b / z, vy - 760 / z], [vx + b / z1, vy - 760 / z1], [vx + a / z1, vy - 760 / z1]]), CUT); }
      // floor planks
      for (let i = -10; i <= 10; i++) taper([[vx + i * 130, Yf(1)], [vx, vy]], 3, 0, INK);
      for (let z = 1; z < zB; z *= 1.18) taper([[Xl(z), Yf(z)], [Xr(z), Yf(z)]], Math.max(1, 3 / z), Math.max(1, 3 / z));
      // the walls of records, as long as the booth is far
      for (const side of [Xl, Xr]) {
        shape(() => pathOf([[side(1), Yc(1)], [side(zB), Yc(zB)], [side(zB), Yf(zB)], [side(1), Yf(1)]]), CUT, 5);
        const r = rng(side === Xl ? 3 : 4);
        for (let z = 1; z < zB; z *= 1.022) { if (r() < .18) continue; const x = side(z);
          taper([[x, lerp(Yc(z), Yf(z), .1)], [x, lerp(Yc(z), Yf(z), .9)]], Math.max(1, 7 / z), Math.max(1, 7 / z)); }
        for (const h of [.1, .3, .5, .7, .9]) taper([[side(1), lerp(Yc(1), Yf(1), h)], [side(zB), lerp(Yc(zB), Yf(zB), h)]], 18, Math.max(1, 18 / zB), h === .1 || h === .9 ? INK : CUT);
      }
      // the far end wall, and the booth at the end of it
      shape(() => pathOf([[Xl(zB), Yc(zB)], [Xr(zB), Yc(zB)], [Xr(zB), Yf(zB)], [Xl(zB), Yf(zB)]]), CUT, Math.max(1, 6 / zB));
      const bh = 1500 / zB, bw = 720 / zB, bx = vx - bw / 2, by = Yf(zB) - bh;
      shape(R(bx, by, bw, bh), INK);
      const wx = bx + bw * .1, wy = by + bh * .2, ww = bw * .8, wh = bh * .66;
      clipTo(R(wx, wy, ww, wh), () => { shape(R(wx, wy, ww, wh), CUT); const ek = wh * .7 / 560; ellen(wx + ww * .42, wy + wh, ek, { pose: 'play', t: T, slide: .5 + .42 * Math.sin(T * TAU * 3.3), wind: wd }); });
      // harmonica: the sleeves blow off the shelves and tumble down the tall shop toward us
      for (let k = 0; k < 12; k++) { const ts = 170.45 + k * .14; if (T < ts) continue; const a = T - ts, r = rng(300 + k), sd = r() < .5 ? -1 : 1;
        const z0 = 1.6 + r() * 3, sx = (sd < 0 ? Xl(z0) : Xr(z0)), sy = lerp(Yc(z0), Yf(z0), .15 + r() * .5);
        const x = sx + (vx - sx) * .3 * a + a * (240 + r() * 300) * (r() < .5 ? 1 : -1), y = sy - a * 200 + a * a * 260, sz = (80 + r() * 50) * (1 + a * .8);
        withT(() => { s.translate(x, y); s.rotate(a * (3 + r() * 4) * sd); shape(R(-sz / 2, -sz / 2, sz, sz), CUT, 5); dot(sz * .2, 0, sz * .32, INK); dot(sz * .2, 0, sz * .08, CUT); }); }
      // Bob walks toward us, not looking back: a black silhouette against the lit shop, no face (Bob: too much bob face).
      // big in the bottom of the tall frame, the corridor and the booth above his shoulder
      const bi = lastBeat(T), ph = hit(T, beatT(T), 8), bxp = 760 - u * 50, byp = 2280 - ph * 22, bhp = lerp(1150, 1300, ease.inOut(u)), bo = { ax: .5, ay: 1, rot: bi % 2 ? .035 : -.035 };
      withT(() => { s.filter = 'brightness(0)'; put('bob-1989', bxp, byp, bhp, bo); });
    });
  }

  // ---------------- 172.33 the cheque ("now all I got is the cheque") ----------------
  function rays(cx, cy, n, seed) { for (let i = 0; i < n; i++) { const a = i / n * TAU + seed, b = a + TAU / n * .45; shape(() => pathOf([[cx, cy], [cx + Math.cos(a) * 2600, cy + Math.sin(a) * 2600], [cx + Math.cos(b) * 2600, cy + Math.sin(b) * 2600]]), INK); } }
  function shotCheque(t, tl, dur) {
    const T = onTwos(t), wd = wind(T);
    const open = T < 172.88 ? 0 : T < 173.05 ? .5 : 1;
    const rise = T < 173.22 ? 0 : T < 174.1 ? Math.ceil(inv(173.22, 174.1, T) * 6) / 6 : 1;
    const flap = wd * Math.sin(T * TAU * 2.6);
    const px = 540, py = 1470, hk = 1.6, kc = 1.32;
    withT(() => {
      // start on the hand, tilt up with the check as it rises
      cam(kf(T, [[172.33, 1.28], [173.2, 1.22], [174.1, 1.03], [175.2, 1.0]]), 540, kf(T, [[172.33, 1300], [173.2, 1250], [174.1, 900], [175.2, 860]]));
      bg(CUT); rays(540, 800, 30, .05);
      shape(OV(540, 800, 470, 640), CUT);
      hand(px, py, hk, open, 0, { mid: () => {
        if (rise > 0) clipTo(R(-700, -2400, 1400, 2400 - 60), () => cheque(0, (-80 - rise * 1150) / hk, kc / hk, flap * .05, flap * .06));
        else if (open > 0) { shape(() => pathOf(chisel([[-60, -90], [60, -100], [70, -40], [-56, -30]], 5, 3)), CUT, 6); taper([[-50, -64], [56, -70]], 3, 3); }
      } });
      // harmonica: the wind tugs at the check
      if (wd > .05) for (let i = 0; i < 8; i++) { const y = 160 + i * 190, x = wrap(i * 377 + T * 1500, 1700) - 300; taper([[x, y], [x + 240, y + 6]], 1, 8 * wd); }
    });
  }

  // ---------------- 175.2 Jimi at the till ----------------
  function register(x, y, flag, k = 1) {
    withT(() => { s.translate(x, y); s.scale(k, k);
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
  function shotTill(t, tl, dur) {
    const T = onTwos(t);
    const CT = 1130;                 // the counter's back edge
    withT(() => {
      cam(lerp(1, 1.06, ease.inOut(tl / dur)), 540, 900);
      bg(CUT); rows(-20, -20, W + 20, CT, Math.PI / 2, 44, () => 5, INK);
      shape(R(-20, 300, W + 40, 60), CUT); shape(R(-20, 300, W + 40, 60), null, 4);
      // Jimi behind the counter, big in the top of frame: fringed jacket, head from the 1968 piece, shaking no
      const shake = T >= 175.6 ? .16 * Math.sin((T - 175.6) * TAU * 3.2) : 0;
      withT(() => { s.translate(540, CT + 20); s.scale(1.5, 1.5); s.translate(0, -790);
        const torso = () => pathOf(chisel([[-190, 790], [190, 790], [170, 560], [70, 510], [-70, 510], [-170, 560]], 51, 3));
        shape(torso, INK); clipTo(torso, () => { rows(-200, 500, 200, 800, -.5, 30, () => 3, CUT); for (let i = 0; i < 12; i++) flick(-180 + i * 32, 600 + (i % 2) * 20, Math.PI / 2, 60, 4); });
        pivot(0, 540, shake, () => put('jimi-1968', 0, 40, 330, { ax: .5, ay: 1, crop: [.4, 0, .6, .25] }));
        for (const sd of [-1, 1]) { taper([[sd * 170, 600], [sd * 200, 740], [sd * 120, 778]], 56, 44, INK); dot(sd * 112, 778, 26, CUT); ring(sd * 112, 778, 26, 5); }
      });
      // the counter top, seen from above, and its front
      shape(R(-20, CT, W + 40, 420), CUT); clipTo(R(-20, CT, W + 40, 420), () => rows(-20, CT, W + 20, CT + 420, 0, 60, () => 3));
      shape(R(-20, CT - 10, W + 40, 26), INK);
      shape(R(-20, CT + 420, W + 40, 400), INK); clipTo(R(-20, CT + 420, W + 40, 400), () => rows(-20, CT + 420, W + 20, CT + 820, Math.PI / 2, 60, () => 5, CUT));
      // the till at the back left, the check on its spike at the front right
      const ding = hit(T, 176.42, 7), flag = T < 176.42 ? 0 : Math.min(1, Math.ceil(inv(176.42, 176.6, T) * 2) / 2);
      register(240, CT + 90, flag, 1.0);
      if (ding > .05) for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .32; flick(240 + Math.cos(a) * 250, CT - 340 + Math.sin(a) * 200, a, 60 * (.5 + ding), 7, INK); }
      const cx = 830, cb = CT + 340; shape(OV(cx, cb, 54, 12), INK); taper([[cx, cb], [cx, cb - 470]], 8, 2);
      cheque(cx, cb - 430, .56, -.04 + ding * .05);
      taper([[cx - 2, cb - 420], [cx, cb - 470]], 6, 2);
      // Bob's hand comes up from the bottom of frame with a banknote
      const reach = kf(T, [[175.2, 0], [175.6, 1]], ease.out), hx = 560 + reach * 20, hy = 2150 - reach * 520;
      hand(hx, hy, .66, .6, .2, {});
      withT(() => { s.translate(hx, hy); s.rotate(.2); s.scale(.66, .66); s.translate(-20, -230); s.rotate(-.25);
        shape(R(-160, -75, 320, 150), CUT, 8); shape(R(-140, -56, 280, 112), null, 3); shape(OV(0, 0, 46, 54), null, 6); fitText('$', 0, 2, 62, 60, INK); fitText('$', -112, -30, 34, 34, INK); fitText('$', 112, 30, 34, 34, INK); });
    });
  }

  // ---------------- 177.0 the train has gone ("I'm ashamed I missed that train") ----------------
  // tall: the clock with no hands hangs over Bob on the platform; the rails run up the frame to a high vanishing point,
  // the train shrinking along them and its smoke climbing the sky
  const VX = 650, VY = 800, trY = (z) => VY + 1080 / z, trX = (z) => VX + 70 / z;
  const trainZ = (t) => 1.75 + Math.max(0, t - 177) * 2.4;
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
      shape(R(-420, -1150, 840, 154), CUT, 9);
      fitText('ELLEN', 0, -1110, 64, 740, INK); fitText('McILWAINE', 0, -1040, 64, 740, INK);
    });
  }
  function puffsFrom(T, maxAge) {
    const step_ = .2, base = Math.floor(T / step_) * step_;
    for (let k = 0; k < maxAge / step_; k++) {
      const tb = base - k * step_, age = T - tb; if (tb < 176.6) continue;
      const z = trainZ(tb), x = trX(z) + age * 80, y = trY(z) - 1150 / z - age * 130, r = (110 / z + 14) * (.6 + age * .35) * (age > maxAge - .8 ? (maxAge - age) / .8 : 1);
      if (r <= 1) continue;
      const P = OV(x, y, r * 1.2, r); shape(P, INK); clipTo(P, () => taper(arcPts(x, y, r * .6, r * .45, 3.6, 5.6, 8), r * .12, 1, CUT));
    }
  }
  function station(T) {
    bg(CUT);
    for (let i = 0; i < 7; i++) taper([[-20, 20 + i * 36], [W + 20, 20 + i * 36]], 9 - i * 1.2, 9 - i * 1.2);
    const hills = () => pathOf([[560, VY + 4], [640, VY - 40], [760, VY - 22], [880, VY - 60], [1000, VY - 30], [1100, VY - 44], [1100, VY + 4]]);
    shape(hills, INK); clipTo(hills, () => flicks(560, VY - 60, 1100, VY, 20, 0, 26, 3, 21));
    // ground beyond the rails
    const gr = () => pathOf([[VX, VY], [1100, VY], [1100, 1940], [1060, 1940]]);
    shape(gr, INK); clipTo(gr, () => flicks(VX, VY, 1100, 1940, 70, -Math.PI / 2, 40, 4, 22));
    // the bed, sleepers, rails
    shape(() => pathOf([[VX, VY], [1060, 1940], [380, 1940]]), CUT);
    for (let z = 1; z < 40; z *= 1.16) { const y = trY(z), x = trX(z), hw = 330 / z; taper([[x - hw, y], [x + hw, y]], Math.max(1, 22 / z), Math.max(1, 22 / z)); }
    for (const g of [-260, 260]) taper([[trX(1) + g, trY(1)], [VX, VY]], 14, 1);
    // the platform and its edge, on the left
    const pf = () => pathOf([[-20, 860], [VX - 20, VY - 6], [400, 1940], [-20, 1940]]);
    shape(pf, CUT); clipTo(pf, () => { for (let i = 0; i < 8; i++) taper([[-300 + i * 110, 1940], [VX - 10, VY]], 3, 0); for (let y = 900; y < 1940; y += 50 + (y - 860) * .2) taper([[-20, y], [VX, y]], 2, 2); });
    taper([[410, 1940], [VX - 14, VY - 6]], 60, 4, INK);
    // the canopy, its posts, and the clock with no hands
    const cp = () => pathOf([[-20, -20], [760, -20], [VX - 30, 560], [-20, 420]]);
    shape(cp, INK); clipTo(cp, () => rows(-20, -20, 780, 560, -.3, 26, () => 3, CUT));
    for (const [px, ty] of [[70, 432], [560, 520]]) taper([[px, ty], [px, lerp(1940, VY, px / VX) + 40]], px < 300 ? 34 : 14, px < 300 ? 40 : 14);
    const cx = 300, cyy = 640, cr = 150;
    taper([[cx, 460], [cx, cyy - cr]], 14, 14);
    dot(cx, cyy, cr + 16, INK); dot(cx, cyy, cr, CUT);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, l = i % 3 ? 20 : 38; taper([[cx + Math.cos(a) * (cr - 10), cyy + Math.sin(a) * (cr - 10)], [cx + Math.cos(a) * (cr - 10 - l), cyy + Math.sin(a) * (cr - 10 - l)]], i % 3 ? 6 : 11, i % 3 ? 6 : 11); }
    dot(cx, cyy, 11, INK);
  }
  function shotTrain(t) {
    const T = onTwos(t);
    // start close on the leaving train (her name on the back still readable), pull out to the platform just before
    // "ashamed" so Bob's hat comes off in frame, then a slow push in on him
    const ck = kf(T, [[177, 1.32], [178.9, 1.26], [179.55, 1.0], [185.03, 1.08]]), fx = kf(T, [[177, 700], [178.9, 680], [179.55, 540], [185.03, 380]]), fy = kf(T, [[177, 1080], [178.9, 1040], [179.55, 960], [185.03, 1150]]);
    withT(() => {
      cam(ck, fx, fy);
      station(T);
      const z = trainZ(T);
      puffsFrom(T, 3.4 + inv(183, 185, T) * 1.2);
      carriage(trX(z), trY(z), 1 / z, T);
      // Bob on the platform under the clock, too late: hat off on "ashamed", slumps on "missed"
      const hatOff = T >= 179.68 ? 1 : 0, bow = T >= 179.68 ? .16 : .02, slump = T >= 182.44 ? 1 : 0;
      presentBob(290, 1880, 1.32, { hatOff, bow, slump });
    });
  }

  // ---------------- 185.03 the smoke writes her name; the wind takes it ----------------
  // two lines up the tall sky, ELLEN over McILWAINE, written left to right by the smoke climbing from the train on the horizon
  function shotSky(t, tl, dur) {
    const T = onTwos(t), wd = Math.max(wind(T), inv(186.1, 186.6, T));
    withT(() => {
      cam(lerp(1.03, 1, ease.out(tl / dur)), 540, 900);
      bg(CUT);
      for (let i = 0; i < 6; i++) taper([[-20, 18 + i * 32], [W + 20, 18 + i * 32]], 8 - i * 1.3, 8 - i * 1.3);
      const hz = 1560;
      shape(() => pathOf([[-20, hz], [200, hz - 30], [460, hz - 10], [700, hz - 40], [900, hz - 14], [1100, hz - 34], [1100, 1940], [-20, 1940]]), INK);
      clipTo(R(-20, hz - 40, W + 40, 400), () => flicks(-20, hz, 1100, 1940, 60, 0, 40, 3, 31));
      // the train, tiny, on the horizon (Ellen's hair a fleck of red)
      const tx = 860, ty = hz - 22;
      shape(R(tx - 30, ty - 38, 60, 34), CUT, 3); shape(R(tx - 12, ty - 34, 10, 26), RED);
      // the letters, laid out per line at a size that fits 1080 minus margins (measured)
      const LINES = [['ELLEN', 680], ['McILWAINE', 980]], maxW = 880;
      const L = LINES.map(([str, y]) => { s.font = `900 100px "Superclarendon"`; const w100 = s.measureText(str).width, size = Math.min(300, 100 * maxW / w100);
        s.font = `900 ${size}px "Superclarendon"`; const tot = s.measureText(str).width, x0 = W / 2 - tot / 2; let acc = 0;
        const chars = [...str].map((ch) => { const cw = s.measureText(ch).width, c = { ch, cx: x0 + acc + cw / 2, cw }; acc += cw; return c; });
        return { str, y, size, x0, tot, chars }; });
      const wsum = L[0].tot + L[1].tot, f1 = L[0].tot / wsum;
      const p = inv(185.03, 185.75, T);
      const brk = ease.in(inv(186.05, 187.0, T));
      // the writing head: along line 1, then along line 2
      const headOn = (li) => li === 0 ? (p < f1 ? L[0].x0 + L[0].tot * (p / f1) : Infinity) : (p < f1 ? -Infinity : L[1].x0 + L[1].tot * ((p - f1) / (1 - f1)));
      const hli = p < f1 ? 0 : 1, hx = clamp(headOn(hli), L[hli].x0, L[hli].x0 + L[hli].tot) + (p >= 1 ? 40 : 0), hy = L[hli].y + L[hli].size * .3;
      // the smoke column from the train up to the writing head
      for (let i = 0; i < 20; i++) { const u = i / 19, r = rng(70 + i);
        let x = Math.pow(1 - u, 2) * tx + 2 * (1 - u) * u * (tx + 160) + u * u * hx, y = Math.pow(1 - u, 2) * (ty - 40) + 2 * (1 - u) * u * (hy + 360) + u * u * hy;
        x += brk * (200 + r() * 500) * (1 - u * .3); y -= brk * r() * 200;
        const rr = (22 + u * 28) * (1 - brk * .6);
        if (rr > 2) { shape(OV(x, y, rr * 1.2, rr), INK); flick(x - rr * .5, y, -.3, rr, rr * .15, CUT); } }
      L.forEach((ln, li) => {
        const head = headOn(li);
        ln.chars.forEach(({ ch, cx, cw }, i) => {
          if (ch === ' ' || cx > head) return;
          const size = ln.size, y0 = ln.y, n = li * 20 + i;
          for (let j = 0; j < 3; j++) {
            const h1 = hash(n * 13 + j * 5 + 7), h2 = hash(n * 7 + j * 11 + 3);
            const dx = brk * (200 + h1 * 640) * (1 + j * .25), dy = -brk * (40 + h2 * 260) + brk * brk * 60 * j, rot = brk * (h2 - .4) * 1.8;
            const by = y0 - size * .42 + j * size * .28;
            withT(() => { s.translate(cx + dx, y0 + dy); s.rotate(rot); s.translate(-cx, -y0);
              s.beginPath(); s.rect(cx - cw, by, cw * 2, size * .28 + (j === 2 ? size * .2 : 0)); s.clip();
              carveText(ch, cx, y0, size, INK);
              for (let k = 0; k < 4; k++) taper([[cx - cw, by + size * .07 + k * size * .08], [cx + cw, by + size * .05 + k * size * .08]], 3, 2, CUT);
            });
          }
        });
      });
      // the writing head's puff
      if (p < 1 && brk === 0) { shape(OV(hx, hy - 40, 60, 48), INK); flick(hx - 30, hy - 40, -.3, 50, 8, CUT); }
      // harmonica wind streaks
      if (wd > .05) for (let i = 0; i < 14; i++) { const y = 120 + hash(i * 3 + 1) * 1360, x = wrap(hash(i * 5 + 2) * 1600 + T * 2000, 1700) - 400; taper([[x, y], [x + 300, y - 10]], 1, 9 * wd); }
    });
  }

  chapter('p5', 152.9, 187.0, [
    [152.9, shotDance],
    [156.40, shotLineup],
    [159.47, shotBooth],
    [163.5, shotGlass],
    [167.53, shotWalk],
    [172.33, shotCheque],
    [175.2, shotTill],
    [177.0, shotTrain],
    [185.03, shotSky],
  ]);
})();

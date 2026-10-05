// w1-verse1: VERSE 1, 0.0 - 35.0 (Bob's beats 1-9). One IIFE; every frame of 0.0-35.0 is covered.
// Cuts on the vocal onsets: 0.33 life is hard / 3.2 life ain't nice / 4.37 good luck / 10.0 roll the dice
// (dice land 10.63) / 11.53 school bus driver / 16.2 kids in their jammies / 19.6 should be winning / 21.57 award /
// 22.4 Grammies / 24.23 me and Jimi / 26.0 Jimi Hendrix / 27.9 feel the same / 31.8-33.2 Ellen McIlwaine.
(() => {
  const OT = (t) => onTwos(t, 12);
  const box = (x, y, w, h) => () => { s.beginPath(); s.rect(x, y, w, h); };
  const bg = (c) => shape(box(-20, -20, W + 40, H + 40), c);
  // carved text that always fits inside maxW x maxH (measured, never eyeballed)
  function fitText(str, x, y, maxW, maxH, c = INK, o = {}) {
    s.font = `900 100px "Superclarendon"`; const m = s.measureText(str).width;
    const size = Math.min(maxH, 100 * maxW / m); carveText(str, x, y, size, c, o); return size;
  }
  // camera: scale k about (cx, cy), then shift
  const cam = (k, cx = W / 2, cy = H / 2, dx = 0, dy = 0) => { s.translate(cx + dx, cy + dy); s.scale(k, k); s.translate(-cx, -cy); };
  // a ghost layer: draw fn on an offscreen copy of the canvas (same transform), print it back at alpha
  let offC = null, offX = null;
  function ghost(alpha, fn, inv_ = false) {
    if (!offC) { offC = document.createElement('canvas'); offC.width = W * RS; offC.height = H * RS; offX = offC.getContext('2d'); }
    const main = s, tr = main.getTransform();
    offX.setTransform(1, 0, 0, 1, 0, 0); offX.clearRect(0, 0, offC.width, offC.height); offX.globalAlpha = 1;
    offX.setTransform(tr); s = offX;
    try { fn(); } finally { s = main; }
    main.save(); main.setTransform(1, 0, 0, 1, 0, 0); main.globalAlpha = alpha; if (inv_) main.filter = 'invert(1)'; main.drawImage(offC, 0, 0); main.restore();
  }

  // ---------------- props ----------------
  // a giant guitar tuning peg standing in for a telephone pole: pole, gear housing, the oval key, the string post
  function peg(x, yb, h, side, seed) {
    const w = Math.max(4, h * .05);
    taper([[x, yb], [x, yb - h * .86]], w * 1.2, w * .8, INK);
    const hy = yb - h * .9;
    shape(() => pathOf(chisel([[x - h * .07, hy - h * .06], [x + h * .07, hy - h * .06], [x + h * .07, hy + h * .06], [x - h * .07, hy + h * .06]], seed, Math.max(1, h * .01))), INK);
    dot(x, hy, Math.max(2, h * .018), CUT);
    // shaft and the key (the wing you turn), on the side away from the road
    const kx = x + side * h * .2;
    taper([[x + side * h * .06, hy], [kx - side * h * .06, hy]], h * .035, h * .03, INK);
    const key = () => { s.beginPath(); s.ellipse(kx, hy, h * .085, h * .055, 0, 0, TAU); };
    shape(key, CUT, Math.max(2.5, h * .012));
    if (h > 120) clipTo(key, () => rows(kx - h * .09, hy - h * .06, kx + h * .09, hy + h * .06, Math.PI / 2, Math.max(5, h * .022), () => Math.max(1.5, h * .006)));
    // the string post on top, a string wound round it
    shape(box(x - h * .018, hy - h * .16, h * .036, h * .1), CUT, Math.max(2, h * .008));
    for (let i = 0; i < 3; i++) taper([[x - h * .022, hy - h * .08 - i * h * .02], [x + h * .022, hy - h * .09 - i * h * .02]], Math.max(2, h * .008), Math.max(2, h * .008), INK);
    return [x, hy - h * .14];
  }
  // the sky is the worn finish of an old sunburst guitar: dark rim, pale centre, grain, worn-through patches
  function sunburst(cx, cy, y1, seed = 3) {
    clipTo(box(-20, -20, W + 40, y1 + 20), () => {
      bg(INK);
      for (let r = 1500; r > 0; r -= 24) { const u = r / 1150; const w = clamp((1 - u) * 2.1, 0, 1) * 24; if (w < 1) continue;
        s.beginPath(); s.ellipse(cx, cy, r * 1.25, r, 0, 0, TAU); s.lineWidth = w; s.strokeStyle = CUT; s.stroke(); }
      dot(cx, cy, 160, CUT);
      // wood grain through the finish
      for (let i = 0; i < 26; i++) { const y = cy - 560 + i * 24, pts = []; for (let x = -40; x <= W + 40; x += 60) pts.push([x, y + Math.sin(x * .004 + i * .9) * 14 + snoise(x * .003 + i, seed) * 10]); taper(pts, 2.5, 3.5, INK); }
      // player wear: patches rubbed through to bare wood (cut), with grain inside
      const r = rng(seed * 17);
      for (let i = 0; i < 4; i++) { const px = lerp(140, W - 140, r()), py = lerp(60, Math.max(80, cy - 300), r()), pr = 50 + r() * 70;
        const pts = []; for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; pts.push([px + Math.cos(a) * pr * (.7 + .5 * r()) * 1.6, py + Math.sin(a) * pr * (.6 + .4 * r())]); }
        const mk = () => smoothPath(pts); shape(mk, CUT); clipTo(mk, () => rows(px - 200, py - 120, px + 200, py + 120, .05, 13, () => 2.5, INK, 4, i)); }
      flicks(0, 0, W, cy - 200, 40, .1, 40, 2.5, seed + 5);
    });
  }
  function star(x, y, r) { taper([[x - r, y], [x + r, y]], r * .35, r * .35, CUT); taper([[x, y - r], [x, y + r]], r * .35, r * .35, CUT); }

  // the Grammy: a gramophone on a pedestal (origin at the bottom centre, about 210*k tall)
  function gramophone(x, y, k, rot = 0, c = INK, cc = CUT, arms = -1) {
    withT(() => { s.translate(x, y); s.rotate(rot); s.scale(k, k);
      shape(() => pathOf([[-52, 0], [52, 0], [42, -26], [-42, -26]]), c);
      shape(box(-34, -70, 68, 44), c); taper([[-30, -48], [30, -48]], 3, 3, cc);
      dot(0, -74, 20, c);
      const horn = () => { s.beginPath(); s.moveTo(-8, -80); s.quadraticCurveTo(-30, -120, -70, -190); s.lineTo(10, -214); s.quadraticCurveTo(0, -140, 10, -84); s.closePath(); };
      shape(horn, c); clipTo(horn, () => rows(-80, -220, 20, -80, -1.1, 14, (u) => 1.5 + u * 3, cc));
      withT(() => { s.translate(-30, -202); s.rotate(-.33); shape(() => { s.beginPath(); s.ellipse(0, 0, 44, 16, 0, 0, TAU); }, cc, 5, c); dot(0, 0, 8, c); });
      taper([[22, -70], [18, -100], [0, -112]], 6, 4, c);
      if (arms >= 0) { // little arms applauding: hands meet (arms 1) or part (0)
        const sp = arms ? 4 : 30;
        taper([[-34, -54], [-60, -70], [-sp, -96]], 9, 7, c); taper([[34, -54], [60, -70], [sp, -96]], 9, 7, c);
        dot(-sp - 4, -97, 9, c); dot(sp + 4, -97, 9, c);
      }
    });
  }
  // a gold record in its frame (origin top centre, hung from the top)
  function goldRecord(x, y, k, rot) {
    withT(() => { s.translate(x, y); s.rotate(rot); s.scale(k, k);
      shape(box(-80, 0, 160, 190), INK); shape(box(-66, 14, 132, 132), CUT);
      dot(0, 80, 60, INK); for (let r = 54; r > 26; r -= 7) { s.beginPath(); s.arc(0, 80, r, 0, TAU); s.lineWidth = 2.5; s.strokeStyle = CUT; s.stroke(); }
      flick(-40, 56, .9, 40, 6); dot(0, 80, 22, CUT); dot(0, 80, 5, INK);
      shape(box(-40, 156, 80, 22), CUT); taper([[-28, 167], [28, 167]], 3, 3, INK);
    });
  }
  // a grocery coupon (origin top centre)
  function coupon(x, y, k, rot, line2 = '10¢ OFF EGGS') {
    withT(() => { s.translate(x, y); s.rotate(rot); s.scale(k, k);
      shape(box(-100, 0, 200, 118), CUT, 5);
      s.setLineDash([12, 8]); s.lineWidth = 4; s.strokeStyle = INK; s.strokeRect(-88, 12, 176, 94); s.setLineDash([]);
      fitText('COUPON', 0, 42, 150, 36); fitText(line2, 0, 80, 150, 24);
    });
  }
  // one die: front face square + top and side faces for depth; face(sz) draws on the front face (origin at its centre)
  function die(x, y, sz, rot, face) {
    withT(() => { s.translate(x, y); s.rotate(rot); const h = sz / 2, d = sz * .22;
      shape(() => pathOf([[-h, -h], [-h + d, -h - d], [h + d, -h - d], [h, -h]]), CUT, 6);
      clipTo(() => pathOf([[-h, -h], [-h + d, -h - d], [h + d, -h - d], [h, -h]]), () => rows(-h, -h - d, h + d, -h, 0, 9, () => 3));
      shape(() => pathOf([[h, -h], [h + d, -h - d], [h + d, h - d], [h, h]]), INK);
      shape(() => pathOf(chisel([[-h, -h], [h, -h], [h, h], [-h, h]], 7, 3)), CUT, 7);
      face(sz);
    });
  }
  const pips = (n) => (sz) => { const q = sz * .27, r = sz * .085, P = { 1: [[0, 0]], 2: [[-q, -q], [q, q]], 3: [[-q, -q], [0, 0], [q, q]], 4: [[-q, -q], [q, -q], [-q, q], [q, q]], 5: [[-q, -q], [q, -q], [0, 0], [-q, q], [q, q]], 6: [[-q, -q], [q, -q], [-q, 0], [q, 0], [-q, q], [q, q]] }[n];
    P.forEach(([a, b]) => dot(a, b, r, INK)); };
  // a sleepy kid: the kit's kid awake, with heavy lids half down
  function sleepyKid(x, y, k, seed, lid = .55) {
    kid(x, y, k, { asleep: false, seed });
    withT(() => { s.translate(x, y); s.scale(k, k);
      for (const ex of [-11, 11]) { shape(box(ex - 7, -197, 14, 9 * lid + 1), CUT); taper([[ex - 8, -197 + 9 * lid], [ex + 8, -197 + 9 * lid]], 2.6, 2.6, INK); } });
  }
  // a tuxedoed attendant, bent over pushing (origin at the feet)
  function attendant(x, y, k, lean = .45, step_ = 0) {
    withT(() => { s.translate(x, y); s.scale(k, k);
      taper([[0, -150], [18 + step_ * 20, -70], [30 + step_ * 30, 0]], 30, 24, INK); taper([[0, -150], [-10 - step_ * 20, -70], [-24 - step_ * 30, 0]], 30, 24, INK);
      shape(box(-6 + step_ * 30, -12, 54, 14), INK); shape(box(-44 - step_ * 30, -12, 54, 14), INK);
      s.translate(0, -150); s.rotate(lean);
      const body = () => pathOf(chisel([[-34, 0], [34, 0], [40, -160], [-40, -160]], 13, 2));
      shape(body, INK); shape(() => pathOf([[-16, -160], [16, -160], [0, -96]]), CUT); shape(() => pathOf([[-12, -156], [0, -146], [12, -156], [12, -136], [0, -146], [-12, -136]]), INK);
      dot(-0, -122, 3.5, CUT); dot(0, -106, 3.5, CUT);
      shape(() => { s.beginPath(); s.ellipse(6, -196, 28, 32, 0, 0, TAU); }, CUT, 5);
      shape(() => { s.beginPath(); s.ellipse(6, -216, 30, 14, 0, Math.PI, 0); }, INK);
      dot(18, -198, 3.5, INK); taper([[12, -182], [26, -182]], 3, 3);
      taper([[30, -140], [80, -90], [118, -80]], 22, 18, INK); taper([[-20, -140], [40, -80], [104, -60]], 22, 18, INK);
      dot(122, -80, 12, CUT); dot(108, -60, 12, CUT);
    });
  }

  // ======================= 1. 0.0-4.37  the endless highway =======================
  const VX = 1060, VY = 560;
  function highway(t, k, dzRate, seed) {
    sunburst(VX, VY - 40, VY, seed);
    // ground: ink rows thickening toward us
    shape(box(-20, VY, W + 40, H - VY + 20), CUT);
    clipTo(box(-20, VY, W + 40, H - VY + 20), () => { for (let i = 1; i < 40; i++) { const y = VY + Math.pow(i / 40, 2.2) * 540; taper([[-20, y], [W + 20, y]], 1 + i * .25, 1 + i * .25, INK); } });
    // road: paper, ink edges, dashes that stream toward us
    const road = () => pathOf([[VX - 8, VY], [VX + 8, VY], [VX + 1500, H + 20], [VX - 1500, H + 20]]);
    shape(road, CUT);
    taper([[VX - 6, VY], [VX - 1500, H + 20]], 2, 26, INK); taper([[VX + 6, VY], [VX + 1500, H + 20]], 2, 26, INK);
    const tt = OT(t), ph = tt * dzRate;
    for (let i = 0; i < 14; i++) { const z0 = .7 + wrap(i - ph, 14) * .9, z1 = z0 + .35;
      if (z0 < .55) continue; const ya = VY + 520 / z1, yb = VY + 520 / z0; const wa = 30 / z1, wb = 30 / z0;
      shape(() => pathOf([[VX - wa, ya], [VX + wa, ya], [VX + wb, yb], [VX - wb, yb]]), INK); }
    // tuning pegs both sides, with strings slung between them like wires
    for (const side of [-1, 1]) {
      const tops = [];
      const N = 12; for (let i = N - 1; i >= 0; i--) { const z = .55 + wrap(i - ph * .5 + (side > 0 ? .5 : 0), N) * 1.25;
        const x = VX + side * 1150 / z, yb = VY + 520 / z, h = 1300 / z; tops.push([x, yb - h * .86, z]); peg(x, yb, h, side, seed + i * 7); }
      tops.sort((a, b) => b[2] - a[2]);
      for (let i = 0; i + 1 < tops.length; i++) { const [x0, y0, z0] = tops[i], [x1, y1] = tops[i + 1]; const sag = 60 / z0;
        const pts = []; for (let u = 0; u <= 1.001; u += .1) pts.push([lerp(x0, x1, u), lerp(y0, y1, u) + Math.sin(u * Math.PI) * sag]);
        for (let j = 0; j < 2; j++) taper(pts.map(([a, b]) => [a, b + j * 10 / z0]), Math.max(2.4, 3 / z0), Math.max(2.4, 3 / z0), INK); }
    }
  }
  function roadWide(t) {
    highway(t, 1, 1.2, 3);
    ellen(VX - 10, 770, .34, { pose: 'walk', t: OT(t) });
  }
  function roadClose(t, tl) {
    highway(t, 1, 3.2, 3);
    ellen(VX - 60, 1110, 1.02, { pose: 'walk', t: OT(t) });
  }

  // ======================= 2. 4.37-10.0  the carnival booth =======================
  function booth(t, tl, dur) {
    const tt = OT(t);
    withT(() => { cam(lerp(1, 1.1, ease.inOut(tl / dur)), 960, 520);
      bg(CUT); rows(-20, -20, W + 20, 760, Math.PI / 2, 46, () => 2.5, INK);
      // a string of carnival bulbs across the night
      const bulbs = []; for (let x = -40; x <= W + 40; x += 20) bulbs.push([x, 70 + Math.sin(x / W * Math.PI) * 50]);
      taper(bulbs, 3, 3, INK); for (let i = 0; i < bulbs.length; i += 5) { const [x, y] = bulbs[i]; shape(() => { s.beginPath(); s.ellipse(x, y + 14, 9, 13, 0, 0, TAU); }, (i / 5 + Math.floor(tt * 4)) % 2 ? CUT : INK, 3); }
      // ground
      shape(box(-20, 860, W + 40, 240), INK); flicks(0, 870, W, 1080, 60, 0, 60, 4, 12);
      const L = 400, R = 1520;
      // inside the booth: patterned paper wall
      shape(box(L, 330, R - L, 400), CUT); clipTo(box(L, 330, R - L, 400), () => { rows(L, 330, R, 730, Math.PI / 2, 30, () => 3, INK); for (let i = 0; i < 30; i++) dot(L + 20 + (i % 10) * 112, 380 + Math.floor(i / 10) * 130, 8, INK); });
      // the prize rail and the prizes, swinging
      taper([[L, 368], [R, 368]], 10, 10, INK);
      const kinds = ['g', 'r', 'c', 'g', 'r', 'c', 'g'];
      kinds.forEach((kd, i) => { const x = L + 110 + i * 150, rot = Math.sin(tt * 2.2 + i * 1.3) * .07 + hit(t, FEAT.beats[lastBeat(t)] ?? 0, 9) * .03 * (i % 2 ? 1 : -1);
        withT(() => { s.translate(x, 368); s.rotate(rot); taper([[0, 0], [0, 50]], 3, 3, INK);
          if (kd === 'g') gramophone(0, 274, 1.0, 0); else if (kd === 'r') goldRecord(0, 50, .82, 0); else coupon(0, 50, .74, 0, i < 3 ? '10¢ OFF EGGS' : '5¢ OFF SOUP'); }); });
      // posts and the striped awning with its scalloped edge
      shape(box(L - 40, 160, 44, 720), INK); shape(box(R - 4, 160, 44, 720), INK);
      const aw = () => { s.beginPath(); s.moveTo(L - 70, 210); s.lineTo(R + 70, 210); s.lineTo(R + 70, 320); for (let i = 0; i < 9; i++) { const x0 = R + 70 - i * (R - L + 140) / 9, x1 = x0 - (R - L + 140) / 9; s.quadraticCurveTo((x0 + x1) / 2, 380, x1, 320); } s.closePath(); };
      shape(aw, CUT, 6); clipTo(aw, () => { for (let i = 0; i < 9; i += 2) { const x0 = L - 70 + i * (R - L + 140) / 9; shape(box(x0, 200, (R - L + 140) / 9, 200), INK); } });
      // the sign: CAREER IN MUSIC (measured to fit the board with margin)
      const sb = () => pathOf(chisel([[L - 20, 50], [R + 20, 50], [R + 20, 200], [L - 20, 200]], 4, 3));
      shape(sb, INK); shape(box(L, 66, R - L, 118), CUT, 4);
      fitText('CAREER IN MUSIC', 960, 128, R - L - 80, 96);
      // the counter, empty: a bell, the dice, a stool with nobody on it, a sign
      shape(box(L - 60, 690, R - L + 120, 34), INK);
      const ct = () => pathOf(chisel([[L - 40, 724], [R + 40, 724], [R + 40, 880], [L - 40, 880]], 9, 3));
      shape(ct, INK); clipTo(ct, () => { for (let i = 0; i < 12; i++) taper([[L - 20 + i * 104, 726], [L - 24 + i * 104, 880]], 3, 4, CUT); rows(L, 730, R, 880, 0, 22, (u) => u * 2.4, CUT); });
      // the stool behind the counter: its seat just shows above, empty
      shape(() => { s.beginPath(); s.ellipse(1300, 676, 70, 14, 0, 0, TAU); }, INK); taper([[1300, 676], [1300, 690]], 18, 18, INK);
      // the bell
      shape(() => { s.beginPath(); s.arc(560, 690, 34, Math.PI, 0); s.closePath(); }, INK); dot(560, 650, 7, INK); flick(540, 676, -1.2, 22, 4);
      // two dice waiting on the counter
      die(760, 650, 70, -.12, pips(5)); die(860, 656, 70, .1, pips(2));
      // the hand-lettered sign: nobody's here
      withT(() => { s.translate(1080, 610); s.rotate(.06); taper([[-40, -56], [0, -80], [40, -56]], 3, 3, INK);
        shape(box(-110, -56, 220, 82), CUT, 5); fitText('BACK IN', 0, -32, 170, 30); fitText('5 MINUTES', 0, 2, 180, 30); });
    });
  }

  // ======================= 3. 10.0-11.53  roll the dice =======================
  const LAND = 10.63;
  function dice(t, tl) {
    const tt = OT(t);
    // the stage: pale back wall, amps, players in silhouette, boards
    bg(CUT); rows(-20, -20, W + 20, 700, 0, 26, (u) => .6 + u * 3.5, INK);
    shape(() => pathOf([[0, 700], [W, 700], [W, H + 20], [0, H + 20]]), INK);
    clipTo(box(0, 700, W, 400), () => { for (let i = 0; i < 16; i++) taper([[i * 128 - 40, 700], [i * 170 - 400, 1100]], 3, 6, CUT); taper([[0, 712], [W, 712]], 4, 4, CUT); });
    // amps
    for (const [ax, aw_, ah] of [[260, 260, 300], [1520, 300, 340], [1180, 200, 220]]) {
      shape(box(ax, 700 - ah, aw_, ah), INK); shape(box(ax + 18, 700 - ah + 50, aw_ - 36, ah - 72), CUT);
      clipTo(box(ax + 18, 700 - ah + 50, aw_ - 36, ah - 72), () => rows(ax, 700 - ah, ax + aw_, 700, .8, 11, () => 4, INK));
      for (let i = 0; i < 4; i++) dot(ax + 30 + i * 22, 700 - ah + 26, 7, CUT);
    }
    // players in silhouette at the back, mid-song
    const player = (x, k, ph) => withT(() => { s.translate(x, 700); s.scale(k, k);
      taper([[-14, 0], [-10, -180]], 34, 30, INK); taper([[14, 0], [10, -180]], 34, 30, INK);
      shape(() => pathOf([[-40, -170], [40, -170], [36, -330], [-36, -330]]), INK); dot(0, -366, 34, INK);
      withT(() => { s.translate(0, -230); s.rotate(-.35 + Math.sin(ph) * .05); shape(() => { s.beginPath(); s.ellipse(-10, 0, 60, 40, 0, 0, TAU); }, CUT, 6); taper([[30, 0], [210, 0]], 14, 12, INK); dot(-10, 0, 14, INK); }); });
    player(640, .95, tt * 6); player(1420, .9, tt * 6 + 1);
    // Ellen at the left: she has just flung them
    const throwK = ease.out(inv(10.0, 10.25, t));
    ellen(170, 1010, 1.0, { pose: throwK > .4 ? 'point' : 'stand', t: tt });
    // the two dice, huge, tumbling across, landing on 10.63
    const fly = (x0, x1, peakY, endY, spin, seed) => { const u = inv(10.06, LAND, t), ue = ease.out(u);
      const x = lerp(x0, x1, ue), y = u < 1 ? lerp(520, endY, u) - Math.sin(u * Math.PI) * peakY : endY;
      return [x, y, u < 1 ? (1 - ue) * spin : 0]; };
    const bounce = hit(t, LAND, 10) * 30;
    const [ax, ay, ar] = fly(380, 980, 260, 820 - bounce, 7, 1), [bx, by, br] = fly(380, 1460, 320, 830 - bounce * .8, -8, 2);
    const flying = t < LAND;
    const pipN = (k) => 1 + Math.floor(hash(Math.floor(tt * 12) * 13 + k) * 6);
    die(ax, ay, 270, ar, flying ? pips(pipN(1)) : (sz) => fitText('TALENT', 0, 0, sz * .78, sz * .3));
    // LUCK: lands, then cracks in half (10.95) and the halves fall apart
    const cr = ease.out(inv(10.95, 11.25, t));
    if (flying || cr <= 0) die(bx, by, 270, br, flying ? pips(pipN(2)) : (sz) => fitText('LUCK', 0, 0, sz * .7, sz * .34));
    else {
      const crack = [[-20, -150], [10, -80], [-18, -20], [16, 40], [-8, 100], [12, 150]];
      for (const side of [-1, 1]) withT(() => {
        s.translate(bx + side * cr * 70, by + cr * 20); s.rotate(side * cr * .32);
        const half = side < 0 ? [[-200, -200], ...crack, [-200, 200]] : [[200, -200], ...crack, [200, 200]];
        clipTo(() => pathOf(half), () => die(0, 0, 270, 0, (sz) => fitText('LUCK', 0, 0, sz * .7, sz * .34)));
        taper(crack, 8, 8, INK);
      });
      flicks(bx - 60, by - 140, bx + 60, by + 140, 10, -Math.PI / 2, 40, 5, 33, INK);
    }
    // the dust of the landing
    if (t >= LAND) { const d = hit(t, LAND, 5); for (let i = 0; i < 8; i++) { const a = Math.PI + i / 7 * Math.PI; flick(ax + Math.cos(a) * (140 + (1 - d) * 80), 960, a, 50 * d + 4, 7 * d, INK); flick(bx + Math.cos(a) * (140 + (1 - d) * 80), 965, a, 50 * d + 4, 7 * d, INK); } }
  }

  // ======================= 4. 11.53-16.2  the school bus drives through a night concert stage =======================
  function busStage(t, tl) {
    const tt = OT(t);
    bg(INK);
    // stars and the lighting truss
    const r = rng(41); for (let i = 0; i < 40; i++) star(r() * W, r() * 300, 4 + r() * 6);
    taper([[0, 120], [W, 120]], 8, 8, CUT); taper([[0, 170], [W, 170]], 8, 8, CUT);
    for (let x = 0; x < W; x += 60) taper([[x, 120], [x + 60, 170]], 4, 4, CUT);
    // speaker stacks at both wings
    for (const sx of [40, 1640]) for (let j = 0; j < 3; j++) { const y = 380 + j * 140; shape(box(sx, y, 240, 130), INK, 5, CUT); dot(sx + 70, y + 65, 46, CUT); dot(sx + 70, y + 65, 22, INK); dot(sx + 180, y + 65, 30, CUT); dot(sx + 180, y + 65, 12, INK); }
    // the boards
    shape(() => pathOf([[0, 800], [W, 800], [W, H + 20], [0, H + 20]]), INK);
    for (let i = 0; i < 22; i++) taper([[i * 92, 800], [(i - 11) * 180 + 960, 1100]], 3, 6, CUT);
    taper([[0, 802], [W, 802]], 6, 6, CUT);
    // the bus rolls on and stops on centre stage
    const bx = kf(tt, [[11.53, -380], [13.1, 640], [13.4, 660]], ease.out), rock = hit(t, 13.1, 4) * Math.sin((t - 13.1) * 18) * .015;
    // headlights -> spotlights: two beams level along the boards, then swing up into the rig as spotlights
    const lift = ease.inOut(inv(12.75, 13.5, t)), hx = bx + 596 * .62, hy = 800 - 22 * .62 - 110 * .62;
    const beam = (a, spread, len) => { const p = [[hx, hy - 8], [hx + Math.cos(a - spread) * len, hy + Math.sin(a - spread) * len], [hx + Math.cos(a + spread) * len, hy + Math.sin(a + spread) * len], [hx, hy + 8]];
      shape(() => pathOf(p), CUT); clipTo(() => pathOf(p), () => rows(hx, hy - len, hx + len, hy + len, a, 24, (u) => .5 + u * 4, INK)); };
    beam(lerp(.02, -.62, lift), .1, 1500); beam(lerp(.06, -1.05, lift), .09, 1500);
    if (lift > .9) { for (const [px, py] of [[hx + Math.cos(-.62) * 760, hy + Math.sin(-.62) * 760], [hx + Math.cos(-1.05) * 640, hy + Math.sin(-1.05) * 640]]) {
      shape(() => { s.beginPath(); s.ellipse(px, Math.max(150, py), 80, 34, 0, 0, TAU); }, CUT, 5); } }
    withT(() => { s.translate(bx, 800 - 22 * .62); s.rotate(rock); schoolBus(0, 0, .62, { t: tt, lights: false, kids: 5, asleep: false }); });
  }
  function busWindows(t, tl) {
    const tt = OT(t);
    bg(INK);
    // the side of the bus, close: cut panel with the black stripe, three windows of kids staring out sleepily
    shape(box(-20, 120, W + 40, 900), CUT);
    clipTo(box(-20, 700, W + 40, 320), () => rows(-20, 700, W + 20, 1020, Math.PI / 2, 14, (u) => 1 + u * 5));
    taper([[-20, 760], [W + 20, 760]], 30, 30); taper([[-20, 820], [W + 20, 820]], 14, 14);
    shape(box(-20, 120, W + 40, 34), INK);
    const sx = -kf(t, [[14.37, 0], [16.2, 160]], ease.inOut);
    for (let i = 0; i < 4; i++) { const wx = sx + 120 + i * 470, win = box(wx, 200, 400, 440);
      shape(win, INK);
      clipTo(win, () => { const r = rng(i + 9); for (let j = 0; j < 6; j++) star(wx + r() * 400, 220 + r() * 120, 5 + r() * 5);
        // the spotlights sweep across the glass
        const sp = wrap(tt * .6 + i * .3, 1.6) - .3; shape(() => pathOf([[wx + sp * 600 - 60, 200], [wx + sp * 600 + 40, 200], [wx + sp * 600 - 60, 640], [wx + sp * 600 - 160, 640]]), CUT);
        sleepyKid(wx + 200, 700 + (i === 2 ? 10 : 0), 2.15, i + 2, i === 1 ? .75 : .5); });
      shape(win, null, 14, INK);
      taper([[wx + 200, 200], [wx + 200, 230]], 6, 6, CUT);
    }
  }

  // ======================= 5. 16.2-19.6  inside: kids asleep, dream balloons, Ellen in the mirror =======================
  function inside(t, tl) {
    const tt = OT(t), vx = 960, vy = 440;
    bg(CUT);
    // ceiling ribs and the side walls with night windows
    shape(() => pathOf([[-20, -20], [W + 20, -20], [vx + 220, vy - 120], [vx - 220, vy - 120]]), INK);
    for (let i = 0; i < 9; i++) { const u = i / 8; taper([[lerp(-20, W + 20, u), -20], [lerp(vx - 220, vx + 220, u), vy - 120]], 6, 2, CUT); }
    for (const side of [-1, 1]) {
      for (let z = 1; z < 6; z += .9) { const z2 = z + .5, xa = vx + side * 1100 / z, xb = vx + side * 1100 / z2, ya = vy - 420 / z, yb = vy - 420 / z2;
        shape(() => pathOf([[xa, ya + 40 / z], [xb, yb + 40 / z2], [xb, vy - 60 / z2], [xa, vy - 60 / z]]), INK);
        star((xa + xb) / 2, (ya + vy) / 2, 8 / z); }
    }
    // the aisle floor
    shape(() => pathOf([[vx - 40, vy + 40], [vx + 40, vy + 40], [vx + 500, H + 20], [vx - 500, H + 20]]), CUT, 4);
    clipTo(() => pathOf([[vx - 40, vy + 40], [vx + 40, vy + 40], [vx + 500, H + 20], [vx - 500, H + 20]]), () => { for (let i = 1; i < 16; i++) { const y = vy + 40 + Math.pow(i / 16, 2) * 640; taper([[0, y], [W, y]], 2 + i * .2, 2 + i * .2, INK); } });
    // seats back to front, kids asleep, their dreams floating up
    const dreams = [[1.0, -1, 16.2, 'guitar'], [1.0, 1, 16.9, 'planet'], [1.65, -1, 17.47, 'dino'], [1.65, 1, 18.03, 'shoes']];
    const rowsZ = [3.4, 2.4, 1.65, 1.0];
    for (const z of rowsZ) for (const side of [-1, 1]) {
      const cx = vx + side * 560 / z, fl = vy + 640 / z, sk = 1 / z;
      withT(() => { s.translate(cx, fl); s.scale(sk, sk);
        shape(() => pathOf(chisel([[-230, -470], [230, -470], [240, -150], [-240, -150]], 5 + side, 4)), INK);
        clipTo(() => pathOf([[-230, -470], [230, -470], [240, -150], [-240, -150]]), () => { taper([[-220, -450], [220, -450]], 8, 8, CUT); rows(-240, -470, 240, -150, Math.PI / 2, 40, () => 3, CUT); });
        const tilt = side * .22 + Math.sin(tt * 1.4 + z) * .03;
        withT(() => { s.translate(side * -40, -170); s.rotate(tilt); kid(0, 0, 1.4, { asleep: true, seed: Math.round(z * 3) + side + 4 }); });
        shape(() => pathOf(chisel([[-250, -200], [250, -200], [260, 0], [-260, 0]], 9, 4)), INK);
        clipTo(() => pathOf([[-250, -200], [250, -200], [260, 0], [-260, 0]]), () => { taper([[-240, -186], [240, -186]], 6, 6, CUT); });
      });
    }
    // dream balloons
    for (const [z, side, t0, what] of dreams) {
      const a = ease.back(inv(t0, t0 + .3, t)); if (a <= 0) continue;
      const kx = vx + side * 560 / z - side * 40 / z, ky = vy + 640 / z - 170 / z - 280 * 1.4 / z;
      const r = (z < 1.2 ? 135 : 95) * a, bx = kx + side * (z < 1.2 ? 120 : 70) + Math.sin(tt * 1.6 + z) * 8, by = (z < 1.2 ? 255 : 300) + Math.sin(tt * 2 + side) * 8;
      const strPts = []; for (let u = 0; u <= 1.001; u += .1) strPts.push([lerp(kx, bx, u) + Math.sin(u * 7 + tt * 3) * 6, lerp(ky, by + r, u)]);
      taper(strPts, 3, 3, INK);
      shape(() => { s.beginPath(); s.ellipse(bx, by, r, r * .92, 0, 0, TAU); }, CUT, 6);
      shape(() => pathOf([[bx - 10, by + r * .92 - 2], [bx + 10, by + r * .92 - 2], [bx, by + r * .92 + 16]]), INK);
      withT(() => { s.translate(bx, by); s.scale(a * r / 135, a * r / 135);
        if (what === 'guitar') guitar(-40, 30, .3, -.7, .5, tt);
        else if (what === 'planet') { taper(arcPts(0, 0, 105, 28, Math.PI, TAU, 20), 9, 9, INK); dot(0, 0, 60, INK); clipTo(() => { s.beginPath(); s.arc(0, 0, 60, 0, TAU); }, () => rows(-60, -60, 60, 60, 0, 18, () => 5, CUT, 6)); taper(arcPts(0, 0, 105, 28, 0, Math.PI, 20), 9, 9, INK); star(-80, -70, 10); star(70, -80, 7); }
        else if (what === 'dino') { shape(() => { s.beginPath(); s.ellipse(-10, 20, 62, 36, 0, 0, TAU); }, INK); taper([[30, 0], [62, -50], [70, -90]], 26, 16, INK); dot(78, -94, 15, INK); dot(84, -98, 3, CUT);
          taper([[-60, 20], [-100, 30], [-118, 52]], 22, 4, INK); for (const lx of [-44, -18, 14, 34]) taper([[lx, 30], [lx, 76]], 16, 14, INK); for (let i = 0; i < 4; i++) flick(-50 + i * 24, -10, -1.5, 20, 6); }
        else { for (const [ox, rr] of [[-44, -.1], [40, .12]]) withT(() => { s.translate(ox, 10); s.rotate(rr);
          shape(() => { s.beginPath(); s.moveTo(-55, -35); s.quadraticCurveTo(-60, 0, -50, 5); s.lineTo(-46, 44); s.lineTo(-38, 44); s.lineTo(-34, 8);
            s.quadraticCurveTo(0, 10, 20, 30); s.lineTo(62, 30); s.quadraticCurveTo(72, 14, 50, 6); s.quadraticCurveTo(10, -6, -10, -18); s.quadraticCurveTo(-35, -14, -55, -35); s.closePath(); }, INK);
          taper([[-50, -28], [-12, -14]], 3, 3, CUT); });
          flick(-80, -50, -.6, 30, 5, INK); flick(76, -66, -2.4, 30, 5, INK); }
      });
    }
    // the rear-view mirror at the top: Ellen's eyes watching them
    const mir = () => { s.beginPath(); s.roundRect(640, 34, 640, 170, 40); };
    taper([[960, -20], [960, 40]], 18, 18, INK);
    shape(mir, INK); clipTo(() => { s.beginPath(); s.roundRect(656, 50, 608, 138, 30); }, () => {
      bg(CUT); rows(640, 30, 1280, 210, .3, 18, () => 2.5, INK);
      ellen(950, 120 + 474 * 3.0 - 4, 3.0, { pose: 'drive', t: 0, eyes: 'open', smile: t > 18.6 ? .7 : 0 });
    });
    shape(() => { s.beginPath(); s.roundRect(656, 50, 608, 138, 30); }, null, 6, INK);
  }

  // ======================= 6. 19.6-22.4  the awards palace; red carpet rolled out, rolled away =======================
  function palace(t, tl) {
    const tt = OT(t), G = 900;
    bg(CUT);
    // searchlights from behind the palace
    for (const [a, ph] of [[-1.25, 0], [-1.9, 1.3]]) { const aa = a + Math.sin(tt * 1.3 + ph) * .18, x0 = 1300, y0 = 500;
      const p = [[x0, y0], [x0 + Math.cos(aa - .05) * 1400, y0 + Math.sin(aa - .05) * 1400], [x0 + Math.cos(aa + .05) * 1400, y0 + Math.sin(aa + .05) * 1400]];
      clipTo(() => pathOf(p), () => rows(0, -400, W, 600, aa, 16, () => 3, INK)); }
    // the palace: absurd, columned, domed, with trophies for towers
    const P = { L: 780, R: 1860 };
    shape(box(P.L, 380, P.R - P.L, G - 380), INK);
    shape(() => { s.beginPath(); s.ellipse(1320, 390, 200, 140, 0, Math.PI, 0); }, INK);
    clipTo(() => { s.beginPath(); s.ellipse(1320, 390, 200, 140, 0, Math.PI, 0); }, () => { for (let i = 0; i < 9; i++) taper([[1130 + i * 48, 390], [1320 + (i - 4) * 18, 250]], 4, 2, CUT); });
    shape(() => pathOf([[P.L - 30, 380], [P.R + 30, 380], [(P.L + P.R) / 2, 300]]), INK);
    gramophone(1320, 262, 1.0, Math.sin(tt * 2) * .03, INK, CUT);   // a gramophone the size of a house, on the dome
    for (const [tx, h] of [[860, 190], [1780, 190]]) { shape(box(tx - 50, 380 - h, 100, h), INK); clipTo(box(tx - 50, 380 - h, 100, h), () => rows(tx - 50, 80, tx + 50, 380, 0, 30, () => 4, CUT)); gramophone(tx, 380 - h, .7, Math.sin(tt * 3 + tx) * .04, INK, CUT); }
    // the banner on the frieze
    shape(box(P.L + 60, 400, P.R - P.L - 120, 80), CUT, 5);
    fitText('LIFETIME ACHIEVEMENT', (P.L + P.R) / 2, 441, P.R - P.L - 220, 56);
    // columns
    for (let i = 0; i < 8; i++) { const cx = P.L + 70 + i * 136; if (Math.abs(cx - 1320) < 90) continue;
      shape(box(cx - 30, 500, 60, 300), CUT); clipTo(box(cx - 30, 500, 60, 300), () => { for (let j = 0; j < 4; j++) taper([[cx - 18 + j * 12, 500], [cx - 18 + j * 12, 800]], 3, 3, INK); });
      shape(box(cx - 40, 490, 80, 16), CUT); shape(box(cx - 40, 796, 80, 16), CUT); }
    // the doors, steps
    shape(box(1250, 560, 140, 260), CUT, 6); taper([[1320, 560], [1320, 820]], 5, 5, INK);
    for (let j = 0; j < 4; j++) shape(box(P.L - 20 + j * 10, 820 + j * 20, P.R - P.L + 40 - j * 20, 20), j % 2 ? INK : CUT, 4);
    // ground
    shape(box(-20, G, W + 40, H - G + 20), CUT); clipTo(box(-20, G, W + 40, H - G + 20), () => { for (let i = 0; i < 12; i++) taper([[-20, G + 20 + i * 16], [W + 20, G + 20 + i * 16]], 1 + i * .4, 1 + i * .4, INK); });
    // the bus has just pulled up (left)
    const bx = kf(tt, [[19.6, -260], [20.1, 150], [20.3, 140]], ease.out);
    schoolBus(bx, G + 4, .5, { t: tt, kids: 5, asleep: true, doorOpen: t > 20.3 });
    // Ellen beside it, waiting for her carpet
    const eIn = t > 20.3;
    if (eIn) ellen(650, G + 20, .62, { pose: 'stand', t: tt, eyes: t > 21.9 ? 'roll' : 'open' });
    // the red carpet: unrolls from the doors toward her (19.9 -> 21.3), then the attendants roll it back (21.57 -> 22.4)
    const door = 1290, near = 760;
    const outK = ease.out(inv(19.9, 21.3, t)), backK = ease.inOut(inv(21.57, 22.4, t));
    const edge = backK > 0 ? lerp(near, door, backK) : lerp(door, near, outK);
    if (backK > 0) {   // being rolled back up: the roll is at the near (left) end, carpet runs from roll to the door
      shape(() => pathOf([[edge - 30, G + 40], [door + 30, G + 40], [door + 10, G - 14], [edge, G - 14]]), RED, 4);
      const rr = 40 + backK * 40; withT(() => { s.translate(edge - 20, G - rr + 30); shape(() => { s.beginPath(); s.arc(0, 0, rr, 0, TAU); }, RED, 4); taper(arcPts(0, 0, rr * .6, rr * .6, backK * 20, backK * 20 + 5, 14), 3, 3, INK); dot(0, 0, 5, INK); });
      const stp = Math.sin(tt * 14);
      attendant(edge - rr - 150, G + 40, .8, .5, stp); attendant(edge - rr - 270, G + 46, .78, .55, -stp);
    } else if (outK > 0) {
      shape(() => pathOf([[edge - 30, G + 40], [door + 30, G + 40], [door + 10, G - 14], [edge, G - 14]]), RED, 4);
      const rr = 80 - outK * 40; withT(() => { s.translate(edge - 20, G - rr + 30); shape(() => { s.beginPath(); s.arc(0, 0, rr, 0, TAU); }, RED, 4); taper(arcPts(0, 0, rr * .6, rr * .6, -outK * 20, -outK * 20 + 5, 14), 3, 3, INK); dot(0, 0, 5, INK); });
    }
  }

  // ======================= 7. 22.4-24.23  the Grammies: trophies applauding each other; Ellen outside =======================
  function grammies(t, tl) {
    const tt = OT(t), clap = Math.floor(t * 8) % 2;
    // the hall through the doors: pale floor, rows and rows of gramophone trophies clapping
    bg(CUT); rows(-20, -20, W + 20, 520, Math.PI / 2, 40, () => 3, INK);
    for (let i = 0; i < 4; i++) { const cx = 520 + i * 300; taper([[cx, 0], [cx, 70]], 4, 4, INK); shape(() => { s.beginPath(); s.ellipse(cx, 90, 70, 26, 0, 0, TAU); }, INK); for (let j = 0; j < 6; j++) taper([[cx - 60 + j * 24, 104], [cx - 62 + j * 24, 140]], 4, 2, INK); }
    for (let rowI = 9; rowI >= 1; rowI--) { const z = 1 + rowI * .55, k = 1.5 / z, y = 430 + 640 / z, n = Math.ceil(10 * z);
      for (let i = 0; i < n; i++) { const x = 960 + (i - (n - 1) / 2) * 175 * k + (rowI % 2) * 80 * k;
        if (x < 300 || x > 1640) continue;
        gramophone(x, y, k, 0, INK, CUT, (clap + i + rowI) % 2); } }
    // the doorway: thick carved frame, the doors flung open, the street outside
    const door = () => pathOf([[420, 170], [1500, 170], [1500, 1100], [420, 1100]]);
    const wall = () => { s.beginPath(); s.rect(-20, -20, W + 40, H + 40); s.moveTo(420, 170); s.lineTo(420, 1100); s.lineTo(1500, 1100); s.lineTo(1500, 170); s.closePath(); };
    withT(() => { wall(); s.fillStyle = INK; s.fill('evenodd'); });
    withT(() => { wall(); s.clip('evenodd'); rows(-20, -20, W + 20, H + 20, 0, 34, () => 3, CUT); });
    shape(door, null, 26, CUT); shape(() => pathOf([[440, 190], [1480, 190], [1480, 1100], [440, 1100]]), null, 8, INK);
    shape(box(700, 50, 520, 100), CUT, 6); fitText('THE GRAMMIES', 960, 101, 440, 64);
    // the open door leaves, panelled
    for (const [x0, x1] of [[200, 420], [1500, 1720]]) { shape(() => pathOf([[x0, 180], [x1, 170], [x1, 1100], [x0, 1090]]), CUT, 6); shape(box(x0 + 30, 240, x1 - x0 - 60, 280), null, 6, INK); shape(box(x0 + 30, 560, x1 - x0 - 60, 420), null, 6, INK); }
    // the step outside, and Ellen, holding her slide guitar
    shape(box(-20, 980, W + 40, 120), CUT, 6); clipTo(box(-20, 990, W + 40, 120), () => rows(-20, 990, W + 20, 1100, 0, 14, () => 3, INK));
    ellen(310, 1010, 1.05, { pose: 'hold', t: tt, slide: .55 });
  }

  // ======================= 8. 24.23-27.9  the bus stop: Jimi appears like a ghost, waiting for the Number 7 =======================
  function stopScene(t, tt, G) {
    bg(CUT);
    rows(-20, -20, W + 20, G, 0, 22, (u) => 4 * (1 - u) + .3, INK);
    // the far road with the tuning pegs strung along it (the highway again)
    shape(box(-20, G, W + 40, 60), INK); taper([[-20, G + 30], [W + 20, G + 30]], 4, 4, CUT);
    for (let i = 0; i < 9; i++) { const x = 60 + i * 240; peg(x, G, 200, 1, 50 + i); }
    for (let i = 0; i < 8; i++) { const x0 = 60 + i * 240, x1 = x0 + 240, y = G - 172; const pts = []; for (let u = 0; u <= 1.001; u += .1) pts.push([lerp(x0, x1, u), y + Math.sin(u * Math.PI) * 18]); taper(pts, 2.5, 2.5, INK); }
    shape(box(-20, G + 60, W + 40, H - G), CUT); clipTo(box(-20, G + 60, W + 40, H - G), () => rows(-20, G + 60, W + 20, H + 20, 0, 18, (u) => 1 + u * 3, INK));
    // the stop: pole, round sign with a carved 7, a little plate
    taper([[960, 1100], [960, 170]], 22, 18, INK);
    shape(() => { s.beginPath(); s.arc(960, 170, 104, 0, TAU); }, INK); shape(() => { s.beginPath(); s.arc(960, 170, 84, 0, TAU); }, CUT);
    fitText('7', 960, 176, 110, 130);
    shape(box(890, 290, 140, 60), CUT, 5); fitText('BUS STOP', 960, 320, 112, 30);
  }
  function busStop(t, tl) {
    const tt = OT(t), G = 640;
    stopScene(t, tt, G);
    // Ellen to the right of the pole, her case stood up beside her, waiting
    guitarCase(1500, 1056 - 150 * 1.05, 1.05, 0);
    ellen(1260, 1060, 1.12, { pose: 'stand', t: tt });
    // Jimi: arrives a little at a time, a ghost (alpha steps on threes), hailing the Number 7
    const a = t < 24.5 ? 0 : t < 24.8 ? .28 : t < 25.1 ? .42 : t < 26.0 ? .55 : .6;
    if (a > 0) ghost(a, () => put('jimi-helsinki', 600, 1100 + Math.sin(tt * 2.2) * 6, 880, { ax: .5, ay: 1 }));
  }

  // ======================= 9. 27.9-35.0  Jimi points at Ellen; a giant glowing E; she rolls her eyes =======================
  function glowE(x, y, size, t) {
    const p = 1 + beatPulse(t, 5) * .06;
    for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + t * .15; const r0 = size * .62, r1 = size * (.85 + .12 * Math.sin(i * 2.3 + t * 3)) * p;
      taper([[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], size * .045, 2, RED); }
    s.beginPath(); s.arc(x, y, size * .56 * p, 0, TAU); s.lineWidth = 8; s.strokeStyle = RED; s.stroke();
    carveText('E', x, y + size * .04, size * .8 * p, RED);
  }
  function nightSky(G) {
    bg(CUT); rows(-20, -20, W + 20, G, 0, 18, (u) => 18 * Math.pow(1 - u, 1.3), INK);
    const r = rng(77); for (let i = 0; i < 50; i++) { const y = r() * G * .55; star(r() * W, y, 4 + r() * 7); }
    shape(box(-20, G, W + 40, H - G + 20), CUT); clipTo(box(-20, G, W + 40, H - G + 20), () => rows(-20, G, W + 20, H + 20, 0, 20, (u) => .5 + u * 3, INK));
  }
  function points(t, tl) {
    const tt = OT(t), G = 800;
    nightSky(G);
    // the E rises up behind her (27.9 -> 29.0) and hangs there glowing
    const rise = ease.back(inv(28.1, 29.0, t));
    if (rise > 0) glowE(1360, lerp(820, 270, rise), 400, t);
    // the bus-stop pole between them
    taper([[950, 1100], [950, 230]], 20, 16, INK); shape(() => { s.beginPath(); s.arc(950, 230, 90, 0, TAU); }, INK); shape(() => { s.beginPath(); s.arc(950, 230, 72, 0, TAU); }, CUT); fitText('7', 950, 236, 90, 110);
    ellen(1360, 1040, 1.08, { pose: 'stand', t: tt, eyes: t > 30.4 ? 'roll' : 'open' });
    // Jimi (1968 piece: hat, grin, pointing out) swings in on 27.9, leaning toward her, a ghost like at the stop
    const sw = ease.back(inv(27.9, 28.3, OT(t)));
    ghost(.62, () => put('jimi-1968', lerp(300, 470, sw), 1070 + Math.sin(tt * 2.2) * 5, 940, { ax: .5, ay: 1, rot: lerp(-.05, .1, sw) }));
  }
  function nameClose(t, tl) {
    const tt = OT(t), G = 960;
    withT(() => { cam(lerp(1, 1.04, tl / 3.2), 1200, 600);
      nightSky(G); shape(box(-20, -20, W + 40, 760), INK);
      const r = rng(78); for (let i = 0; i < 30; i++) star(r() * W, r() * 330, 4 + r() * 6);
      glowE(1330, 250, 420, t);
      // Jimi, close, still pointing her way: head and pointing hand from the left edge (ghost)
      // on the night sky the ghost prints white (the block inverted), the same ghost alpha
      ghost(.62, () => put('jimi-1968', 190, 770 + Math.sin(tt * 2.2) * 5, 660, { ax: .5, ay: 1, rot: .08, crop: [0, 0, 1, .56] }), true);
      // her name carves itself into the sky: ELLEN (31.8), McILWAINE (32.4)
      if (t >= 31.8) fitText('ELLEN', 790, 470, 540, 190, CUT);
      if (t >= 32.4) fitText('McILWAINE', 790, 640, 600, 150, CUT);
      // Ellen, closer; she rolls her eyes at the pair of them
      ellen(1330, 1330, 1.6, { pose: 'stand', t: tt, eyes: t > 33.2 ? 'roll' : 'open', smile: 0 });
    });
  }

  chapter('w1', 0.0, 35.0, [
    [0.0, roadWide], [3.2, roadClose],
    [4.37, booth],
    [10.0, dice],
    [11.53, busStage], [14.37, busWindows],
    [16.2, inside],
    [19.6, palace],
    [22.4, grammies],
    [24.23, busStop],
    [27.9, points], [31.8, nameClose],
  ]);
})();

// p1-verse1 (9:16, 1080 x 1920): VERSE 1, 0.0 - 35.0 (Bob's beats 1-9), recomposed for the tall frame from js/wch/w1-verse1.js.
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
  // a giant guitar tuning machine planted on the verge (Bob: pegs instead of telephone poles). Drawn squat and chrome so
  // it can't read as a fence post (Bob, draft 9: the old poles + sagging wires looked like a camp fence): a gear plate on
  // the ground, the string post with the string wound round it, a pearl key out to the side. No pole, no wires.
  function peg(x, yb, h, side, seed) {
    const lw = Math.max(2, h * .012);
    // gear housing: a rounded plate sitting on the ground
    const gw = h * .34, gh = h * .3;
    shape(() => { s.beginPath(); s.roundRect(x - gw / 2, yb - gh, gw, gh, gh * .25); }, INK, lw * 1.4, CUT);
    if (h > 90) { dot(x - gw * .28, yb - gh * .5, h * .025, CUT); dot(x + gw * .28, yb - gh * .5, h * .025, CUT); }   // the two screws
    // the string post: a chrome cylinder, white with a carved highlight, the string wound round it
    const pw = h * .16, ph = h * .62, py = yb - gh - ph;
    shape(() => { s.beginPath(); s.roundRect(x - pw / 2, py, pw, ph + 4, pw * .3); }, CUT, lw * 1.4, INK);
    taper([[x - pw * .22, py + ph * .1], [x - pw * .22, py + ph * .92]], pw * .1, pw * .1, INK);
    for (let i = 0; i < 6; i++) { const yy = py + ph * (.28 + i * .07); taper([[x - pw * .55, yy + h * .02], [x + pw * .55, yy - h * .02]], Math.max(2, h * .018), Math.max(2, h * .018), INK); }
    shape(() => { s.beginPath(); s.ellipse(x, py, pw / 2, pw * .2, 0, 0, TAU); }, CUT, lw * 1.2, INK);   // top of the post
    dot(x, py, Math.max(1.5, pw * .1), INK);                                                            // the string hole
    // the shaft and the pearl key, on the side away from the road
    const ky = yb - gh * .5, kx = x + side * (gw / 2 + h * .24);
    taper([[x + side * gw / 2, ky], [kx - side * h * .08, ky]], h * .05, h * .045, INK);
    const key = () => { s.beginPath(); s.ellipse(kx, ky, h * .14, h * .2, 0, 0, TAU); };
    shape(key, CUT, lw * 1.4, INK);
    if (h > 60) taper([[kx - side * h * .05, ky - h * .12], [kx - side * h * .07, ky - h * .02]], Math.max(2, h * .02), Math.max(1.5, h * .012), INK);   // the pearl's sheen
    if (h > 120) clipTo(key, () => rows(kx - h * .12, ky - h * .16, kx + h * .12, ky + h * .16, .5, Math.max(5, h * .03), () => Math.max(1.5, h * .006)));
    return [x, py];
  }
  // the sky is the worn finish of an old sunburst guitar: a pale gold centre burning out to a dark rim, as RAYS of grain
  // fanning out from the centre (no rings closing over the road: those read as a cage)
  function sunburst(cx, cy, y1, seed = 3) {
    clipTo(box(-20, -20, W + 40, y1 + 20), () => {
      bg(CUT);
      // the dark rim: ink rays that thicken toward the edge of the guitar
      const r = rng(seed * 31);
      for (let i = 0; i < 120; i++) { const a = Math.PI + (i + .5) / 120 * Math.PI, j = (r() - .5) * .02, r0 = 230 + r() * 140;
        const pts = []; for (let q = 0; q <= 1.001; q += .1) { const rr = lerp(r0, 2000, q); pts.push([cx + Math.cos(a + j) * rr * 1.4, cy + Math.sin(a + j) * rr]); }
        taper(pts, .5, 30 + r() * 10, INK); }
      // wood grain under the finish, faint, running across
      for (let i = 0; i < 9; i++) { const y = cy - 520 + i * 56, pts = []; for (let x = -40; x <= W + 40; x += 60) pts.push([x, y + Math.sin(x * .004 + i * .9) * 14 + snoise(x * .003 + i, seed) * 10]); taper(pts, 1.5, 2.2, INK); }
      // player wear rubbed through to bare wood
      for (let i = 0; i < 3; i++) { const px = lerp(160, W - 160, r()), py = lerp(60, Math.max(80, cy - 360), r()), pr = 40 + r() * 50;
        const pts = []; for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; pts.push([px + Math.cos(a) * pr * (.7 + .5 * r()) * 1.6, py + Math.sin(a) * pr * (.6 + .4 * r())]); }
        const mk = () => smoothPath(pts); shape(mk, CUT); clipTo(mk, () => rows(px - 200, py - 120, px + 200, py + 120, .05, 13, () => 2.5, INK, 4, i)); }
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


  // ======================= 1. 0.0-4.37  the endless highway (tall: big sunburst sky over a neck running up to the horizon) =======================
  const VX = 540, VY = 760, HB = 760, DZ = H + 20 - VY;   // vanishing point, half-width of the neck at the bottom, depth unit
  function highway(t, dzRate, seed) {
    sunburst(VX, VY - 40, VY, seed);
    const tt = OT(t), ph = tt * dzRate;
    // the fields: the guitar's top, grain curving like the body's edge, thickening toward us
    shape(box(-20, VY, W + 40, H - VY + 20), CUT);
    clipTo(box(-20, VY, W + 40, H - VY + 20), () => { for (let i = 1; i < 34; i++) { const y = VY + Math.pow(i / 34, 2.0) * (H - VY), pts = [];
      for (let x = -40; x <= W + 40; x += 60) pts.push([x, y + Math.pow(Math.abs(x - VX) / 700, 2) * -18 * (i / 34) + Math.sin(x * .008 + i) * 3]); taper(pts, .8 + i * .22, .8 + i * .22, INK); } });
    // the road is the guitar's neck: dark rosewood, frets streaming toward us, six strings running to the horizon
    const road = () => pathOf([[VX - 6, VY], [VX + 6, VY], [VX + HB, H + 20], [VX - HB, H + 20]]);
    shape(road, INK);
    clipTo(road, () => {
      for (let i = 0; i < 16; i++) { const z = .55 + wrap(i - ph, 16) * .8, y = VY + DZ / z; if (y > H + 30) continue;
        const half = HB * (y - VY) / DZ;
        taper([[VX - half, y], [VX + half, y]], Math.max(2, 16 / z), Math.max(2, 16 / z), CUT);                  // a fret
        if (i % 3 === 1) { const y2 = VY + DZ / (z + .4), ym = (y + y2) / 2; dot(VX, ym, Math.max(2, 22 / z), CUT); } }   // fret marker
      for (let j = 0; j < 6; j++) { const u = (j - 2.5) / 2.5; taper([[VX + u * 4, VY], [VX + u * HB * .66, H + 20]], 1, 4 + (5 - j) * 1.6, CUT); }   // strings, bass side thicker
    });
    taper([[VX - 5, VY], [VX - HB, H + 20]], 2, 24, CUT); taper([[VX + 5, VY], [VX + HB, H + 20]], 2, 24, CUT);   // the neck's bound edges
    // tuning machines on both verges, receding up to the horizon (tall now: the frame has the height for them)
    for (const side of [-1, 1]) {
      const N = 10; for (let i = N - 1; i >= 0; i--) { const z = .9 + wrap(i - ph * .5 + (side > 0 ? .5 : 0), N) * 1.4;
        const x = VX + side * 560 / z, yb = VY + DZ / z, h = 560 / z; if (x < -200 || x > W + 200) continue; peg(x, yb, h, side, seed + i * 7); }
    }
  }
  function roadWide(t) {
    highway(t, 1.2, 3);
    ellen(VX - 14, 1190, .62, { pose: 'walk', t: OT(t) });
  }
  function roadClose(t, tl) {
    highway(t, 3.2, 3);
    ellen(VX - 30, 1890, 1.78, { pose: 'walk', t: OT(t) });
  }

  // ======================= 2. 4.37-10.0  the carnival booth (tall: sign on two lines, two rails of prizes, empty counter) =======================
  function booth(t, tl, dur) {
    const tt = OT(t);
    withT(() => { cam(lerp(1, 1.08, ease.inOut(tl / dur)), 540, 1010);
      bg(CUT); rows(-20, -20, W + 20, 1490, Math.PI / 2, 40, () => 2.5, INK);
      for (const [by0, amp] of [[34, 26], [150, 40]]) { const bl = []; for (let x = -40; x <= W + 40; x += 20) bl.push([x, by0 + Math.sin(x / W * Math.PI) * amp]);
        taper(bl, 3, 3, INK); for (let i = 0; i < bl.length; i += 4) { const [x, y] = bl[i]; shape(() => { s.beginPath(); s.ellipse(x, y + 14, 9, 13, 0, 0, TAU); }, (i / 4 + Math.floor(tt * 4) + (by0 > 100 ? 1 : 0)) % 2 ? CUT : INK, 3); } }
      s.translate(0, 150);
      // ground
      shape(box(-20, 1560, W + 40, H), INK); flicks(0, 1580, W, H - 150, 40, 0, 60, 4, 12);
      const L = 80, R = 1000;
      // inside the booth: patterned paper wall
      shape(box(L, 520, R - L, 800), CUT); clipTo(box(L, 520, R - L, 800), () => { rows(L, 520, R, 1320, Math.PI / 2, 30, () => 3, INK); for (let i = 0; i < 24; i++) dot(L + 60 + (i % 6) * 160, 580 + Math.floor(i / 6) * 180, 8, INK); });
      // two prize rails, stacked, the prizes swinging
      const rail = (ry, kinds, off) => { taper([[L, ry], [R, ry]], 10, 10, INK);
        kinds.forEach((kd, i) => { const x = L + 120 + i * 227, rot = Math.sin(tt * 2.2 + i * 1.3 + off) * .07 + hit(t, FEAT.beats[lastBeat(t)] ?? 0, 9) * .03 * ((i + off) % 2 ? 1 : -1);
          withT(() => { s.translate(x, ry); s.rotate(rot); taper([[0, 0], [0, 50]], 3, 3, INK);
            if (kd === 'g') gramophone(0, 296, 1.15, 0); else if (kd === 'r') goldRecord(0, 50, .96, 0); else coupon(0, 50, .86, 0, i < 2 ? '10¢ OFF EGGS' : '5¢ OFF SOUP'); }); }); };
      rail(600, ['g', 'r', 'c', 'g'], 0); rail(930, ['r', 'c', 'g', 'r'], 1);
      // posts and the striped awning with its scalloped edge
      shape(box(L - 40, 380, 44, 1200), INK); shape(box(R - 4, 380, 44, 1200), INK);
      const n = 6, aw = () => { s.beginPath(); s.moveTo(L - 60, 420); s.lineTo(R + 60, 420); s.lineTo(R + 60, 510); for (let i = 0; i < n; i++) { const x0 = R + 60 - i * (R - L + 120) / n, x1 = x0 - (R - L + 120) / n; s.quadraticCurveTo((x0 + x1) / 2, 580, x1, 510); } s.closePath(); };
      shape(aw, CUT, 6); clipTo(aw, () => { for (let i = 0; i < n; i += 2) { const x0 = L - 60 + i * (R - L + 120) / n; shape(box(x0, 410, (R - L + 120) / n, 200), INK); } });
      // the sign: CAREER / IN MUSIC on two lines (measured to fit the board with margin)
      const sb = () => pathOf(chisel([[L - 30, 90], [R + 30, 90], [R + 30, 420], [L - 30, 420]], 4, 3));
      shape(sb, INK); shape(box(L - 6, 110, R - L + 12, 290), CUT, 4);
      fitText('CAREER', 540, 190, R - L - 110, 130); fitText('IN MUSIC', 540, 330, R - L - 110, 120);
      // the counter, empty: a bell, the dice, a stool with nobody on it, a sign
      shape(box(L - 60, 1290, R - L + 120, 34), INK);
      const ct = () => pathOf(chisel([[L - 40, 1324], [R + 40, 1324], [R + 40, 1570], [L - 40, 1570]], 9, 3));
      shape(ct, INK); clipTo(ct, () => { for (let i = 0; i < 10; i++) taper([[L - 20 + i * 104, 1326], [L - 24 + i * 104, 1570]], 3, 4, CUT); rows(L, 1330, R, 1570, 0, 22, (u) => u * 2.4, CUT); });
      // the stool behind the counter: its seat just shows above, empty
      shape(() => { s.beginPath(); s.ellipse(830, 1276, 74, 15, 0, 0, TAU); }, INK); taper([[830, 1276], [830, 1292]], 18, 18, INK);
      // the bell
      shape(() => { s.beginPath(); s.arc(190, 1290, 38, Math.PI, 0); s.closePath(); }, INK); dot(190, 1246, 8, INK); flick(168, 1274, -1.2, 24, 4);
      // two dice waiting on the counter
      die(330, 1246, 78, -.12, pips(5)); die(440, 1252, 78, .1, pips(2));
      // the hand-lettered sign: nobody's here
      withT(() => { s.translate(650, 1196); s.rotate(.06); taper([[-40, -60], [0, -86], [40, -60]], 3, 3, INK);
        shape(box(-125, -60, 250, 100), CUT, 5); fitText('BACK IN', 0, -32, 190, 36); fitText('5 MINUTES', 0, 8, 205, 36); });
    });
  }

  // ======================= 3. 10.0-11.53  roll the dice (tall: thrown from the foreground up the stage, in depth) =======================
  const LAND = 10.63, FL3 = 1000;
  function dice(t, tl) {
    const tt = OT(t);
    // the stage: pale back wall, a wall of amps, players in silhouette, boards running away from us
    bg(CUT); rows(-20, -20, W + 20, FL3, 0, 26, (u) => .6 + u * 3.5, INK);
    shape(() => pathOf([[0, FL3], [W, FL3], [W, H + 20], [0, H + 20]]), INK);
    clipTo(box(0, FL3, W, H - FL3 + 20), () => { for (let i = 0; i < 12; i++) taper([[i * 100 - 20, FL3], [(i - 5.5) * 260 + 540, H + 20]], 3, 7, CUT); taper([[0, FL3 + 12], [W, FL3 + 12]], 4, 4, CUT); });
    // the lighting rig over the stage, lamps hanging, pointing down at the boards
    taper([[0, 150], [W, 150]], 8, 8, INK); taper([[0, 200], [W, 200]], 8, 8, INK);
    for (let x = 0; x < W; x += 60) taper([[x, 150], [x + 60, 200]], 4, 4, INK);
    for (const [lx, la] of [[180, .35], [540, 0], [900, -.35]]) withT(() => { s.translate(lx, 200); s.rotate(la);
      taper([[0, 0], [0, 50]], 8, 8, INK); shape(() => pathOf([[-44, 50], [44, 50], [60, 150], [-60, 150]]), INK); shape(() => { s.beginPath(); s.ellipse(0, 150, 60, 18, 0, 0, TAU); }, CUT, 5); });
    // amps, stacked tall
    for (const [ax, aw_, ah] of [[40, 280, 560], [760, 290, 640], [470, 220, 330]]) {
      for (let y = FL3 - ah, j = 0; y < FL3 - 10; j++) { const hh = Math.min(260, FL3 - y); shape(box(ax, y, aw_, hh), INK); shape(box(ax + 18, y + 50, aw_ - 36, hh - 70), CUT);
        clipTo(box(ax + 18, y + 50, aw_ - 36, hh - 70), () => rows(ax, y, ax + aw_, y + hh, .8, 11, () => 4, INK));
        for (let i = 0; i < 4; i++) dot(ax + 30 + i * 22, y + 26, 7, CUT); y += hh + 6; }
    }
    // players in silhouette at the back, mid-song
    const player = (x, k, ph) => withT(() => { s.translate(x, FL3); s.scale(k, k);
      taper([[-14, 0], [-10, -180]], 34, 30, INK); taper([[14, 0], [10, -180]], 34, 30, INK);
      shape(() => pathOf([[-40, -170], [40, -170], [36, -330], [-36, -330]]), INK); dot(0, -366, 34, INK);
      withT(() => { s.translate(0, -230); s.rotate(-.35 + Math.sin(ph) * .05); shape(() => { s.beginPath(); s.ellipse(-10, 0, 60, 40, 0, 0, TAU); }, CUT, 6); taper([[30, 0], [210, 0]], 14, 12, INK); dot(-10, 0, 14, INK); }); });
    player(380, 1.05, tt * 6); player(700, 1.0, tt * 6 + 1);
    // Ellen in the foreground, bottom left: she has just flung them up the stage
    const throwK = ease.out(inv(10.0, 10.25, t));
    ellen(210, 1900, 1.3, { pose: throwK > .4 ? 'point' : 'stand', t: tt });
    // the two dice, huge, tumbling away from us up the boards, landing on 10.63: TALENT far, LUCK near
    const fly = (x0, y0, x1, y1, peak, spin) => { const u = inv(10.06, LAND, t), ue = ease.out(u);
      const x = lerp(x0, x1, ue), y = u < 1 ? lerp(y0, y1, u) - Math.sin(u * Math.PI) * peak : y1;
      return [x, y, u < 1 ? (1 - ue) * spin : 0]; };
    const bounce = hit(t, LAND, 10) * 30;
    const flying = t < LAND, u = inv(10.06, LAND, t);
    const TS = lerp(240, 270, flying ? u : 1), LS = lerp(250, 360, flying ? u : 1);
    const [ax, ay, ar] = fly(560, 1330, 470, 1060 - bounce, 380, 7), [bx, by, br] = fly(600, 1400, 780, 1380 - bounce * .8, 300, -8);
    const pipN = (k) => 1 + Math.floor(hash(Math.floor(tt * 12) * 13 + k) * 6);
    die(ax, ay, TS, ar, flying ? pips(pipN(1)) : (sz) => fitText('TALENT', 0, 0, sz * .78, sz * .3));
    // LUCK: lands, then cracks in half (10.95) and the halves fall apart
    const cr = ease.out(inv(10.95, 11.25, t));
    if (flying || cr <= 0) die(bx, by, LS, br, flying ? pips(pipN(2)) : (sz) => fitText('LUCK', 0, 0, sz * .7, sz * .34));
    else {
      const q = LS / 270, crack = [[-20, -150], [10, -80], [-18, -20], [16, 40], [-8, 100], [12, 150]].map(([a, b]) => [a * q, b * q]);
      for (const side of [-1, 1]) withT(() => {
        s.translate(bx + side * cr * 80, by + cr * 24); s.rotate(side * cr * .3);
        const half = side < 0 ? [[-300, -300], ...crack, [-300, 300]] : [[300, -300], ...crack, [300, 300]];
        clipTo(() => pathOf(half), () => die(0, 0, LS, 0, (sz) => fitText('LUCK', 0, 0, sz * .7, sz * .34)));
        taper(crack, 9, 9, INK);
      });
      flicks(bx - 70, by - 190, bx + 70, by + 190, 10, -Math.PI / 2, 46, 5, 33, INK);
    }
    // the dust of the landing
    if (t >= LAND) { const d = hit(t, LAND, 5); for (let i = 0; i < 8; i++) { const a = Math.PI + i / 7 * Math.PI;
      flick(ax + Math.cos(a) * (TS * .5 + (1 - d) * 70), ay + TS * .5, a, 46 * d + 4, 7 * d, CUT); flick(bx + Math.cos(a) * (LS * .5 + (1 - d) * 90), by + LS * .5, a, 56 * d + 4, 8 * d, CUT); } }
  }

  // ======================= 4. 11.53-16.2  the school bus drives onto a night concert stage (tall: the beams swing up into the rig) =======================
  function busStage(t, tl) {
    const tt = OT(t), FL = 1320, K = .8;
    bg(INK);
    // stars and the lighting truss high above
    const r = rng(41); for (let i = 0; i < 46; i++) star(r() * W, 320 + r() * 560, 4 + r() * 6);
    for (let i = 0; i < 14; i++) star(r() * W, r() * 180, 3 + r() * 5);
    taper([[0, 220], [W, 220]], 8, 8, CUT); taper([[0, 270], [W, 270]], 8, 8, CUT);
    for (let x = 0; x < W; x += 60) taper([[x, 220], [x + 60, 270]], 4, 4, CUT);
    // speaker stacks at both wings, tall
    for (const sx of [10, 830]) for (let j = 0; j < 5; j++) { const y = 400 + j * 140; shape(box(sx, y, 240, 130), INK, 5, CUT); dot(sx + 70, y + 65, 46, CUT); dot(sx + 70, y + 65, 22, INK); dot(sx + 180, y + 65, 30, CUT); dot(sx + 180, y + 65, 12, INK); }
    // the boards
    shape(() => pathOf([[0, FL], [W, FL], [W, H + 20], [0, H + 20]]), INK);
    for (let i = 0; i < 13; i++) taper([[i * 90, FL], [(i - 6) * 230 + 540, H + 20]], 3, 7, CUT);
    taper([[0, FL + 2], [W, FL + 2]], 6, 6, CUT);
    // the bus rolls on and stops on centre stage
    const bx = kf(tt, [[11.53, -560], [13.1, 530], [13.4, 545]], ease.out), rock = hit(t, 13.1, 4) * Math.sin((t - 13.1) * 18) * .015;
    // headlights -> spotlights: two beams level along the boards, then swing UP over the bus into the rig (the frame's height)
    const lift = ease.inOut(inv(12.75, 13.5, t)), hx = bx + 596 * K, hy = FL - 22 * K - 110 * K;
    const beam = (a, spread, len) => { const p = [[hx, hy - 8], [hx + Math.cos(a - spread) * len, hy + Math.sin(a - spread) * len], [hx + Math.cos(a + spread) * len, hy + Math.sin(a + spread) * len], [hx, hy + 8]];
      shape(() => pathOf(p), CUT); clipTo(() => pathOf(p), () => rows(hx - len, hy - len, hx + len, hy + len, a, 24, (u) => .5 + u * 4, INK)); };
    const a1 = lerp(.02, -1.95, lift), a2 = lerp(.06, -2.25, lift);
    beam(a1, .08, 2200); beam(a2, .07, 2200);
    if (lift > .9) { for (const a of [-1.95, -2.25]) { const L = (hy - 300) / -Math.sin(a), px = hx + Math.cos(a) * L;
      shape(() => { s.beginPath(); s.ellipse(px, 300, 90, 34, 0, 0, TAU); }, CUT, 5); } }
    withT(() => { s.translate(bx, FL - 22 * K); s.rotate(rock); schoolBus(0, 0, K, { t: tt, lights: false, kids: 5, asleep: false, cry: true, crowd: 3 }); });
  }
  // the side of the bus, close: one big window fills the frame, three crying kids in it, the next window sliding in
  function busWindows(t, tl) {
    const tt = OT(t);
    bg(INK);
    shape(box(-20, 120, W + 40, 1640), CUT);
    carveText('SCHOOL BUS', 540, 250, 120, INK, { w: 860 });
    clipTo(box(-20, 1240, W + 40, 520), () => rows(-20, 1240, W + 20, 1760, Math.PI / 2, 16, (u) => 1 + u * 5));
    taper([[-20, 1300], [W + 20, 1300]], 40, 40); taper([[-20, 1380], [W + 20, 1380]], 18, 18);
    shape(box(-20, 120, W + 40, 40), INK);
    // the wheel at the bottom, turning slowly
    dot(780, 1830, 230, INK); dot(780, 1830, 110, CUT); dot(780, 1830, 46, INK);
    for (let i = 0; i < 8; i++) { const a = tt * 1.5 + i * TAU / 8; flick(780 + Math.cos(a) * 210, 1830 + Math.sin(a) * 210, a + Math.PI, 46, 9); }
    const sx = -kf(t, [[14.37, 0], [16.2, 180]], ease.inOut);
    for (let i = 0; i < 2; i++) { const wx = sx + 130 + i * 920, ww = 800, win = box(wx, 380, ww, 820);
      shape(win, INK);
      clipTo(win, () => { const r = rng(i + 9); for (let j = 0; j < 8; j++) star(wx + r() * ww, 410 + r() * 220, 6 + r() * 6);
        // the spotlights sweep across the glass
        const sp = wrap(tt * .6 + i * .3, 1.6) - .3; shape(() => pathOf([[wx + sp * 1100 - 90, 380], [wx + sp * 1100 + 60, 380], [wx + sp * 1100 - 90, 1200], [wx + sp * 1100 - 260, 1200]]), CUT);
        // all crying, three to a window
        for (const [ox, oy, kk] of [[-250, -30, 2.45], [250, -20, 2.45], [0, 10, 2.7]]) kid(wx + ww / 2 + ox, 1300 + oy, kk, { seed: i * 3 + 2 + ox, t: tt, cry: true }); });
      shape(win, null, 18, INK);
      taper([[wx + ww / 2, 380], [wx + ww / 2, 420]], 8, 8, CUT);
    }
  }

  // ======================= 5. 16.2-19.6  inside: down the aisle (tall: mirror on top, balloons in the middle, seats below) =======================
  function inside(t, tl) {
    const tt = OT(t), vx = 540, vy = 860, D = 1000, LAT = 410, SK = .9;
    bg(CUT);
    // ceiling ribs and the side walls with night windows
    shape(() => pathOf([[-20, -20], [W + 20, -20], [vx + 140, vy - 260], [vx - 140, vy - 260]]), INK);
    for (let i = 0; i < 9; i++) { const u = i / 8; taper([[lerp(-20, W + 20, u), -20], [lerp(vx - 140, vx + 140, u), vy - 260]], 6, 2, CUT); }
    for (const side of [-1, 1]) {
      for (let z = 1; z < 7; z += .9) { const z2 = z + .5, xa = vx + side * 600 / z, xb = vx + side * 600 / z2, ya = vy - 700 / z, yb = vy - 700 / z2;
        shape(() => pathOf([[xa, ya + 60 / z], [xb, yb + 60 / z2], [xb, vy - 80 / z2], [xa, vy - 80 / z]]), INK);
        star((xa + xb) / 2, (ya + vy) / 2, 10 / z); }
    }
    // the aisle floor
    const aisle = () => pathOf([[vx - 26, vy + 30], [vx + 26, vy + 30], [vx + 250, H + 20], [vx - 250, H + 20]]);
    shape(aisle, CUT, 4);
    clipTo(aisle, () => { for (let i = 1; i < 18; i++) { const y = vy + 30 + Math.pow(i / 18, 2) * (H - vy); taper([[0, y], [W, y]], 2 + i * .2, 2 + i * .2, INK); } });
    // seats back to front, three crying kids on each, their dreams floating up
    const rowsZ = [4.2, 3.0, 2.2, 1.6, 1.0];
    for (const z of rowsZ) for (const side of [-1, 1]) {
      const cx = vx + side * LAT / z, fl = vy + D / z, sk = SK / z;
      withT(() => { s.translate(cx, fl); s.scale(sk, sk);
        shape(() => pathOf(chisel([[-230, -470], [230, -470], [240, -150], [-240, -150]], 5 + side, 4)), INK);
        clipTo(() => pathOf([[-230, -470], [230, -470], [240, -150], [-240, -150]]), () => { taper([[-220, -450], [220, -450]], 8, 8, CUT); rows(-240, -470, 240, -150, Math.PI / 2, 40, () => 3, CUT); });
        const tilt = side * .22 + Math.sin(tt * 1.4 + z) * .03;
        for (const [ox, kk] of [[-150, 1.12], [150, 1.12], [0, 1.22]]) withT(() => { s.translate(side * -20 + ox, -170); s.rotate(tilt + ox * .0008); kid(0, 0, kk, { cry: true, t: OT(t), seed: Math.round(z * 3) + side + 4 + ox }); });
        shape(() => pathOf(chisel([[-250, -200], [250, -200], [260, 0], [-260, 0]], 9, 4)), INK);
        clipTo(() => pathOf([[-250, -200], [250, -200], [260, 0], [-260, 0]]), () => { taper([[-240, -186], [240, -186]], 6, 6, CUT); });
      });
    }
    // dream balloons, filling the height between the mirror and the seats: near pair low, far pair high
    const dreams = [[1.0, -1, 16.2, 'guitar', 220, 1130, 165], [1.0, 1, 16.9, 'planet', 860, 1150, 165], [1.6, -1, 17.47, 'dino', 230, 640, 130], [1.6, 1, 18.03, 'shoes', 850, 660, 130]];
    for (const [z, side, t0, what, bx0, by0, R0] of dreams) {
      const a = ease.back(inv(t0, t0 + .3, t)); if (a <= 0) continue;
      const sk = SK / z, kx = vx + side * LAT / z - side * 20 * sk, ky = vy + D / z - (170 + 222 * 1.22) * sk;
      const r = R0 * a, bx = bx0 + Math.sin(tt * 1.6 + z) * 8, by = by0 + Math.sin(tt * 2 + side) * 8;
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
    // the rear-view mirror across the top: Ellen's eyes watching them, big
    const MX = 90, MY = 70, MW = 900, MH = 250, cyM = MY + MH / 2, kM = 4.3;
    taper([[540, -20], [540, MY + 10]], 22, 22, INK);
    shape(() => { s.beginPath(); s.roundRect(MX, MY, MW, MH, 50); }, INK);
    const inner = () => { s.beginPath(); s.roundRect(MX + 18, MY + 18, MW - 36, MH - 36, 36); };
    clipTo(inner, () => {
      bg(CUT); rows(MX, MY, MX + MW, MY + MH, .3, 18, () => 2.5, INK);
      ellen(530, cyM + 473 * kM - 50, kM, { pose: 'drive', t: 0, eyes: 'open', smile: t > 18.6 ? .7 : 0, edge: false });
    });
    shape(inner, null, 7, INK);
  }

  // ======================= 6. 19.6-22.4  the awards palace (tall: palace up top, the carpet rolls DOWN toward Ellen in the foreground) =======================
  function palace(t, tl) {
    const tt = OT(t), G = 1020, GR = 1110, NEAR = 1770;
    bg(CUT);
    // searchlights from behind the palace, sweeping the tall sky
    for (const [a, ph] of [[-1.2, 0], [-1.95, 1.3]]) { const aa = a + Math.sin(tt * 1.3 + ph) * .18, x0 = 540, y0 = 700;
      const p = [[x0, y0], [x0 + Math.cos(aa - .05) * 1500, y0 + Math.sin(aa - .05) * 1500], [x0 + Math.cos(aa + .05) * 1500, y0 + Math.sin(aa + .05) * 1500]];
      clipTo(() => pathOf(p), () => rows(-200, -800, W + 200, 800, aa, 16, () => 3, INK)); }
    // the palace: absurd, columned, domed, with trophies for towers
    const P = { L: 110, R: 970 };
    for (const [tx, h] of [[180, 330], [900, 330]]) { shape(box(tx - 55, 560 - h, 110, h), INK); clipTo(box(tx - 55, 560 - h, 110, h), () => rows(tx - 55, 200, tx + 55, 560, 0, 30, () => 4, CUT)); gramophone(tx, 560 - h, .8, Math.sin(tt * 3 + tx) * .04, INK, CUT); }
    shape(() => pathOf([[P.L - 30, 570], [P.R + 30, 570], [540, 480]]), INK);
    shape(() => { s.beginPath(); s.ellipse(540, 575, 210, 160, 0, Math.PI, 0); }, INK);
    clipTo(() => { s.beginPath(); s.ellipse(540, 575, 210, 160, 0, Math.PI, 0); }, () => { for (let i = 0; i < 9; i++) taper([[340 + i * 50, 575], [540 + (i - 4) * 18, 420]], 4, 2, CUT); });
    gramophone(540, 430, 1.15, Math.sin(tt * 2) * .03, INK, CUT);   // a gramophone the size of a house, on the dome
    shape(box(P.L, 570, P.R - P.L, G - 570), INK);
    // the banner on the frieze: LIFETIME / ACHIEVEMENT on two lines
    shape(box(P.L + 40, 590, P.R - P.L - 80, 180), CUT, 5);
    fitText('LIFETIME', 540, 640, P.R - P.L - 200, 70); fitText('ACHIEVEMENT', 540, 722, P.R - P.L - 160, 70);
    // columns
    for (let i = 0; i < 8; i++) { const cx = P.L + 55 + i * 107; if (Math.abs(cx - 540) < 100) continue;
      shape(box(cx - 24, 800, 48, 200), CUT); clipTo(box(cx - 24, 800, 48, 200), () => { for (let j = 0; j < 3; j++) taper([[cx - 12 + j * 12, 800], [cx - 12 + j * 12, 1000]], 3, 3, INK); });
      shape(box(cx - 32, 790, 64, 14), CUT); shape(box(cx - 32, 996, 64, 14), CUT); }
    // the doors, steps
    shape(box(470, 800, 140, 220), CUT, 6); taper([[540, 800], [540, 1020]], 5, 5, INK);
    for (let j = 0; j < 4; j++) shape(box(P.L - 20 + j * 10, G + j * 22, P.R - P.L + 40 - j * 20, 22), j % 2 ? INK : CUT, 4);
    // ground, receding: lines thicken toward us
    clipTo(box(-20, GR, W + 40, H - GR + 20), () => { for (let i = 0; i < 26; i++) { const y = GR + 10 + Math.pow(i / 26, 1.6) * (H - GR); taper([[-20, y], [W + 20, y]], 1 + i * .3, 1 + i * .3, INK); } });
    // the bus has just pulled up (mid-ground left)
    const bx = kf(tt, [[19.6, -520], [20.1, 120], [20.3, 110]], ease.out);
    schoolBus(bx, 1330, .42, { t: tt, kids: 5, asleep: true, doorOpen: t > 20.3 });
    // the red carpet in depth: unrolls from the doors down toward Ellen (19.9 -> 21.3), then is rolled back up (21.57 -> 22.4)
    const hw = (y) => lerp(64, 250, (y - GR) / (NEAR - GR)), pk = (y) => lerp(.55, 1.35, (y - GR) / (NEAR - GR));
    const outK = ease.out(inv(19.9, 21.3, t)), backK = ease.inOut(inv(21.57, 22.4, t));
    const edge = backK > 0 ? lerp(NEAR, GR, backK) : lerp(GR, NEAR, outK);
    const carpetTo = (e) => shape(() => pathOf([[540 - hw(GR), GR], [540 + hw(GR), GR], [540 + hw(e), e], [540 - hw(e), e]]), RED, 4);
    const roll = (e, rr, spin) => { const w = hw(e) + 10;
      shape(() => { s.beginPath(); s.roundRect(540 - w, e - rr * 2 + 6, w * 2, rr * 2, rr * .5); }, RED, 4);
      for (const sd of [-1, 1]) { const ex = 540 + sd * w; shape(() => { s.beginPath(); s.ellipse(ex, e - rr + 6, rr * .45, rr, 0, 0, TAU); }, RED, 4); taper(arcPts(ex, e - rr + 6, rr * .25, rr * .6, spin, spin + 5, 14), 3, 3, INK); dot(ex, e - rr + 6, 4, INK); } };
    if (backK > 0) {
      carpetTo(edge); const rr = lerp(22, 46, backK) * pk(edge); roll(edge, rr, backK * 20);
      // two attendants bent over the roll at its ends, pushing it back up to the doors
      const stp = Math.sin(tt * 14), ak = .78 * pk(edge), w = hw(edge) + 10;
      attendant(540 - w - 110 * ak, edge + 30 * ak, ak, .5, stp);
      withT(() => { s.translate(540 + w + 110 * ak, edge + 30 * ak); s.scale(-1, 1); attendant(0, 0, ak, .5, -stp); });
    } else if (outK > 0) { carpetTo(edge); roll(edge, lerp(46, 22, outK) * pk(edge), -outK * 20); }
    // Ellen in the foreground, beside where the carpet should end, waiting for it
    if (t > 20.3) ellen(870, 1890, 1.02, { pose: 'stand', t: tt, eyes: t > 21.9 ? 'roll' : 'open' });
  }

  // ======================= 7. 22.4-24.23  the Grammies (tall: a tall doorway of applauding trophies; Ellen big on the step) =======================
  function grammies(t, tl) {
    const tt = OT(t), clap = Math.floor(t * 8) % 2;
    const DL = 110, DR = 970, DT = 380, DB = 1500;
    // the hall through the doors: rows and rows of gramophone trophies clapping, rising away up the floor
    bg(CUT); rows(-20, -20, W + 20, 760, Math.PI / 2, 40, () => 3, INK);
    for (let i = 0; i < 3; i++) { const cx = 270 + i * 270; taper([[cx, DT], [cx, DT + 80]], 4, 4, INK); shape(() => { s.beginPath(); s.ellipse(cx, DT + 100, 70, 26, 0, 0, TAU); }, INK); for (let j = 0; j < 6; j++) taper([[cx - 60 + j * 24, DT + 114], [cx - 62 + j * 24, DT + 150]], 4, 2, INK); }
    for (let rowI = 11; rowI >= 1; rowI--) { const z = 1 + rowI * .5, k = 1.45 / z, y = 680 + 900 / z, n = Math.ceil(8 * z);
      for (let i = 0; i < n; i++) { const x = 540 + (i - (n - 1) / 2) * 175 * k + (rowI % 2) * 80 * k;
        if (x < DL - 40 || x > DR + 40) continue;
        gramophone(x, y, k, 0, INK, CUT, (clap + i + rowI) % 2); } }
    // the doorway: thick carved frame, the doors flung open
    const wall = () => { s.beginPath(); s.rect(-20, -20, W + 40, H + 40); s.moveTo(DL, DT); s.lineTo(DL, DB); s.lineTo(DR, DB); s.lineTo(DR, DT); s.closePath(); };
    withT(() => { wall(); s.fillStyle = INK; s.fill('evenodd'); });
    withT(() => { wall(); s.clip('evenodd'); rows(-20, -20, W + 20, H + 20, 0, 34, () => 3, CUT); });
    shape(() => pathOf([[DL, DT], [DR, DT], [DR, DB], [DL, DB]]), null, 26, CUT); shape(() => pathOf([[DL + 20, DT + 20], [DR - 20, DT + 20], [DR - 20, DB], [DL + 20, DB]]), null, 8, INK);
    // the sign over the door: THE / GRAMMIES
    shape(box(150, 110, 780, 220), CUT, 6); fitText('THE', 540, 160, 260, 62); fitText('GRAMMIES', 540, 258, 680, 120);
    // the open door leaves, panelled, folded back against the wall
    for (const [x0, x1] of [[10, DL], [DR, 1070]]) { shape(() => pathOf([[x0, DT + 10], [x1, DT], [x1, DB], [x0, DB - 10]]), CUT, 6); shape(box(x0 + 20, DT + 70, x1 - x0 - 40, 360), null, 5, INK); shape(box(x0 + 20, DT + 480, x1 - x0 - 40, 560), null, 5, INK); }
    // the step outside, and Ellen, big in the foreground, holding her slide guitar
    shape(box(-20, 1490, W + 40, 460), CUT, 6); clipTo(box(-20, 1500, W + 40, 460), () => rows(-20, 1500, W + 20, H + 20, 0, 16, (u) => 2 + u * 3, INK));
    ellen(300, 1860, 1.5, { pose: 'hold', t: tt, slide: .55 });
  }

  // ======================= 8. 24.23-27.9  the bus stop (tall: the 7 sign high up, Ellen mid-ground, Bob and Jimi in front) =======================
  function stopScene(t, tt, G, poleX) {
    bg(CUT);
    rows(-20, -20, W + 20, G, 0, 22, (u) => 4 * (1 - u) + .3, INK);
    // the far road with the tuning pegs along it (the highway again; no wires between them)
    shape(box(-20, G, W + 40, 60), INK); taper([[-20, G + 30], [W + 20, G + 30]], 4, 4, CUT);
    for (let i = 0; i < 6; i++) { const x = 60 + i * 200; peg(x, G, 170, 1, 50 + i); }
    shape(box(-20, G + 60, W + 40, H - G), CUT); clipTo(box(-20, G + 60, W + 40, H - G), () => rows(-20, G + 60, W + 20, H + 20, 0, 18, (u) => 1 + u * 3, INK));
    // the stop: a tall pole, a big round sign with a carved 7, a little plate
    taper([[poleX, 1500], [poleX, 300]], 26, 20, INK);
    shape(() => { s.beginPath(); s.arc(poleX, 300, 150, 0, TAU); }, INK); shape(() => { s.beginPath(); s.arc(poleX, 300, 122, 0, TAU); }, CUT);
    fitText('7', poleX, 308, 160, 190);
    shape(box(poleX - 100, 470, 200, 80), CUT, 5); fitText('BUS STOP', poleX, 510, 164, 42);
  }
  function busStop(t, tl) {
    const tt = OT(t), G = 980;
    stopScene(t, tt, G, 640);
    // Ellen beside the pole, her case stood up beside her, waiting
    guitarCase(990, 1416 - 150 * .9, .9, 0);
    ellen(850, 1420, .98, { pose: 'stand', t: tt });
    // Jimi fades in on 'Jimi', a ghost standing just behind Bob (alpha steps on threes)
    const a = t < 24.5 ? 0 : t < 24.8 ? .28 : t < 25.1 ? .42 : t < 26.0 ? .55 : .6;
    if (a > 0) ghost(a, () => put('jimi-helsinki', 260, 1500 + Math.sin(tt * 2.2) * 6, 820, { ax: .5, ay: 1 }));
    // Bob steps up into the foreground on 'me' (24.23), solid and big
    const bIn = ease.back(inv(24.23, 24.5, tt));
    if (bIn > 0) put('bob-1989', 330, 1950 + (1 - bIn) * 200, 860, { ax: .5, ay: 1 });
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
    const tt = OT(t), G = 1460;
    nightSky(G);
    // the E rises up out of the ground behind her (28.1 -> 29.0) and hangs high in the tall sky, glowing
    const rise = ease.back(inv(28.1, 29.0, t));
    if (rise > 0) glowE(740, lerp(1250, 470, rise), 470, t);
    // the bus-stop pole between them
    taper([[470, 1500], [470, 880]], 20, 16, INK); shape(() => { s.beginPath(); s.arc(470, 880, 90, 0, TAU); }, INK); shape(() => { s.beginPath(); s.arc(470, 880, 72, 0, TAU); }, CUT); fitText('7', 470, 886, 90, 110);
    ellen(770, 1610, 1.32, { pose: 'stand', t: tt, eyes: t > 30.4 ? 'roll' : 'open' });
    // Jimi (1968 piece: hat, grin, pointing out) swings in on 27.9, leaning toward her, a ghost like at the stop
    const sw = ease.back(inv(27.9, 28.3, OT(t)));
    ghost(.62, () => put('jimi-1968', lerp(120, 210, sw), 1520 + Math.sin(tt * 2.2) * 5, 980, { ax: .5, ay: 1, rot: lerp(-.05, .1, sw) }));
    put('bob-1989', 330, 1960, 760, { ax: .5, ay: 1, rot: .03 * sw });    // Bob in front of him, both looking her way
  }
  function nameClose(t, tl) {
    const tt = OT(t), G = 1640;
    withT(() => { cam(lerp(1, 1.04, tl / 3.2), 540, 700);
      nightSky(G); shape(box(-20, -20, W + 40, 1600), INK);
      const r = rng(78); for (let i = 0; i < 30; i++) star(r() * W, r() * 520, 4 + r() * 6);
      glowE(540, 300, 400, t);
      // her name carves itself into the sky, stacked big: ELLEN (31.8), McILWAINE (32.4)
      if (t >= 31.8) fitText('ELLEN', 540, 650, 880, 240, CUT);
      if (t >= 32.4) fitText('McILWAINE', 540, 860, 940, 180, CUT);
      // Jimi, close, still pointing her way: head and pointing hand at the left (ghost; prints white on the night sky)
      ghost(.62, () => put('jimi-1968', 200, 1580 + Math.sin(tt * 2.2) * 5, 560, { ax: .5, ay: 1, rot: .08, crop: [0, 0, 1, .56] }), true);
      put('bob-1989', 220, 1935, 330, { ax: .5, ay: 1, crop: [.18, 0, .56, .44] });   // Bob's head below Jimi's: the pair of them
      // Ellen, close; she rolls her eyes at the pair of them
      ellen(700, 2230, 2.1, { pose: 'stand', t: tt, eyes: t > 33.2 ? 'roll' : 'open', smile: 0 });
    });
  }

  chapter('p1', 0.0, 35.0, [
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

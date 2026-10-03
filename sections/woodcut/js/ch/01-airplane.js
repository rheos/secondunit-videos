// 71.0 - 91.0  "I'm an airplane on the highway / and I feel so strange / mnuh nuh nuh /
// I'm an airplane on the highway / and I'm sick of the passing lane"
// WOODCUT. A stubby 1950s prop airliner stuck on the highway on car tyres, carved into a folk-print
// block: cut-paper body, black outline and gouged shading, a red cheat line. Motion is on twos (a new
// block every 1/12 s); look.js re-pulls the print on threes so the gouge texture boils.
//   71.00 open     the sheet lifts off the block (peel reveal); wide, he drives through a carved
//                  landscape: gouged sky, a rayed sun, hills cut in patterns, telegraph poles
//   74.86 highway  closer; his too-long wing clips a roadside sign, he winces
//   77.22 uneasy   close on his face, the sky lines start to writhe, eyes dart
//   78.38 strange  the print inverts to white-on-black, the gouges swirl into a vortex round his head,
//                  the block splits down a crack; spiral eyes, he hops
//   79.13 nuh x3   blank paper; on each beat (79.13 / 79.73 / 80.30) his face is stamped onto the sheet,
//                  black, red, black; each stamp sings its "nuh"
//   80.88 lane     the passing lane: a roped-off red carpet, carved cars zoom past under his wing
//   84.24 highway  low and close, cars blasting through the foreground
//   86.60 sick     tight on the windscreen: the eye roll
//   87.52 lane     wide again: a stretch limo glides down the carpet, he glares, then sighs a carved puff
(() => {
  const STRANGE = 78.38, NUH = [79.13, 79.73, 80.30], LINE2 = 80.88;

  // ======================= the plane, side view =======================
  // local units, origin on the road under his middle, facing +x
  const FUSE = [[292, -170], [276, -236], [200, -276], [60, -283], [-110, -271], [-250, -251], [-345, -243], [-360, -214], [-302, -183], [-232, -136], [-110, -100], [60, -92], [200, -90], [274, -114]];
  const BELLY = [[-380, -200], [-302, -183], [-232, -136], [-110, -100], [60, -92], [150, -90], [175, -60]];
  const FIN = chisel([[-225, -244], [-290, -410], [-356, -416], [-364, -236]], 11, 5);
  const STAB = chisel([[-250, -208], [-320, -212], [-378, -150], [-340, -146]], 12, 4);
  const WING = chisel([[60, -115], [-100, 170], [-128, 186], [-182, 172], [-70, -108]], 13, 4);
  const FWING = chisel([[40, -230], [-70, -350], [-112, -360], [-140, -350], [-80, -240]], 14, 4);
  const SCREEN = chisel([[128, -272], [268, -263], [278, -190], [132, -183]], 15, 3);
  const EYES = [[168, -228, 29, 37], [231, -224, 27, 35]];

  function starPath(x, y, r, n = 5, inner = .45, rot = -Math.PI / 2) { s.beginPath(); for (let i = 0; i < n * 2; i++) { const rr = i % 2 ? r * inner : r, a = rot + i * Math.PI / n; s[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); } s.closePath(); }
  function tyre(cx, cy, r, ang) {
    dot(cx, cy, r + 6, CUT);
    dot(cx, cy, r, INK);
    for (let i = 0; i < 10; i++) { const a = ang + i * TAU / 10; flick(cx + Math.cos(a) * r * .98, cy + Math.sin(a) * r * .98, a + Math.PI, r * .26, 7); }
    s.beginPath(); s.arc(cx, cy, r * .56, 0, TAU); s.lineWidth = 7; s.strokeStyle = CUT; s.stroke();
    for (let i = 0; i < 4; i++) { const a = ang * 1.3 + i * TAU / 4; flick(cx, cy, a, r * .4, 6); }
  }
  function nacelle(cx, cy, len, rad) {
    const P = [[cx + len * .5, cy], [cx + len * .35, cy - rad], [cx - len * .4, cy - rad * .7], [cx - len * .62, cy], [cx - len * .4, cy + rad * .7], [cx + len * .35, cy + rad]];
    shape(() => smoothPath(P), CUT, 7);
    clipTo(() => smoothPath(P), () => { for (let i = 0; i < 3; i++) taper([[cx - len * .6, cy + rad * (.35 + i * .22)], [cx + len * .5, cy + rad * (.4 + i * .22)]], 2 + i * 2, 2 + i * 2); });
    s.beginPath(); s.ellipse(cx + len * .38, cy, rad * .3, rad * .98, 0, 0, TAU); s.fillStyle = INK; s.fill();
    s.beginPath(); s.ellipse(cx + len * .38, cy, rad * .12, rad * .6, 0, 0, TAU); s.lineWidth = 3.5; s.strokeStyle = CUT; s.stroke();
  }
  function prop(cx, cy, R, spin, c = INK) {
    // the blur as carved arcs, one solid blade pair
    for (let g = 0; g < 4; g++) { const f = .5 + g * .16, a0 = spin * .7 + g * 1.9;
      s.beginPath(); s.ellipse(cx, cy, R * .3 * f, R * f, 0, a0, a0 + 1.5); s.lineWidth = 3.5; s.strokeStyle = c; s.lineCap = 'round'; s.stroke(); }
    for (let i = 0; i < 2; i++) { const a = spin + i * Math.PI, tip = [cx + Math.sin(a) * R * .3, cy + Math.cos(a) * R];
      taper([[cx, cy], [(cx + tip[0]) / 2 + 4, (cy + tip[1]) / 2], tip], 14, 4, c); }
    dot(cx + 4, cy, R * .18, c); dot(cx + 2, cy - 3, R * .06, c === INK ? CUT : INK);
  }
  function eye(i, cx, cy, rx, ry, o) {
    const { look = [.6, .1], lid = 0, wobble = 0, t = 0 } = o;
    s.beginPath(); s.ellipse(cx, cy, rx, ry, 0, 0, TAU); s.fillStyle = CUT; s.fill();
    withT(() => {
      s.beginPath(); s.ellipse(cx, cy, rx, ry, 0, 0, TAU); s.clip();
      if (wobble < .5) {
        const px = cx + look[0] * rx * .45, py = cy + look[1] * ry * .5;
        dot(px, py, 15, INK); dot(px - 5, py - 6, 4.5, CUT);
      } else { // dizzy spiral, carved
        s.beginPath();
        for (let a = 0; a < TAU * 2.4; a += .2) { const r = a * 2.2, aa = a + t * 12 * (i ? -1 : 1); s[a ? 'lineTo' : 'moveTo'](cx + Math.cos(aa) * r, cy + Math.sin(aa) * r * ry / rx); }
        s.lineWidth = 5.5; s.strokeStyle = INK; s.lineCap = 'round'; s.stroke();
      }
      if (lid > 0) { // the black upper lid comes down, with a cut lash line
        const ly = cy - ry + lid * ry * 2.1;
        s.beginPath(); s.moveTo(cx - rx - 4, cy - ry - 4); s.lineTo(cx + rx + 4, cy - ry - 4); s.lineTo(cx + rx + 4, ly - 4); s.quadraticCurveTo(cx, ly + 8, cx - rx - 4, ly - 4); s.closePath();
        s.fillStyle = INK; s.fill();
        if (lid < .95) taper(arcPts(cx, ly - 12, rx * .8, 8, Math.PI * .15, Math.PI * .85, 8), 3, 3, CUT);
      }
    });
  }
  function mouth(L, R, up, open, scale = 1) {
    const dn = [up[0], up[1] + 95 * open * scale];
    if (open < .06) { taper([L, [(L[0] + up[0]) / 2, up[1] + 2], up, [(R[0] + up[0]) / 2, up[1] + 2], R], 6 * scale, 6 * scale); return; }
    const mp = () => { s.beginPath(); s.moveTo(...L); s.quadraticCurveTo(...up, ...R); s.quadraticCurveTo(...dn, ...L); s.closePath(); };
    mp(); s.fillStyle = INK; s.fill();
    clipTo(mp, () => {
      s.beginPath(); s.ellipse(up[0] + 4 * scale, (up[1] + dn[1]) / 2 + 22 * open * scale, 24 * scale, (10 + 7 * open) * scale, 0, 0, TAU); s.fillStyle = RED; s.fill();
      s.beginPath(); s.moveTo(...L); s.quadraticCurveTo(...up, ...R); s.lineWidth = 13 * scale; s.strokeStyle = CUT; s.stroke();
      for (let k = 1; k < 4; k++) { const x = lerp(L[0], R[0], k / 4); taper([[x, up[1] - 10 * scale], [x, up[1] + 6 * scale]], 3, 3); }
    });
    mp(); s.lineWidth = 6 * scale; s.strokeStyle = INK; s.stroke();
  }
  function plane(x, y, k, o) {
    const { t, pass, open = 0, brow = [0, 0], bob = 0, hop = 0, roll = t * 3, spin = t * TAU * 2.3, pax = 0 } = o;
    withT(() => {
      s.translate(x, y + hop * k); s.scale(k, k);
      if (pass === 'back') {
        withT(() => { s.translate(0, bob);
          shape(() => pathOf(FWING), CUT);
          clipTo(() => pathOf(FWING), () => { for (let i = 0; i < 9; i++) taper([[40 - i * 14, -232], [-70 - i * 9, -352]], 2 + i * .6, 2 + i * .6); });
          shape(() => pathOf(FWING), null, 7);
          shape(() => pathOf(chisel([[-262, -232], [-322, -236], [-360, -300], [-336, -304]], 16, 3)), INK);
          s.beginPath(); s.ellipse(-50, -296, 46, 16, 0, 0, TAU); s.fillStyle = INK; s.fill();
          taper([[-90, -296], [-10, -298]], 3, 3, CUT);
          prop(-4, -296, 40, spin + 1);
        });
        return;
      }
      if (pass === 'wing') {
        withT(() => { s.translate(0, bob);
          shape(() => pathOf(WING), CUT);
          clipTo(() => pathOf(WING), () => {
            for (let i = 3; i < 11; i++) taper([[60 - i * 13, -115 + i * 2], [-100 - i * 13, 170 + i * 2]], 1 + (i - 3) * 1.1, 1 + (i - 3) * 1.1); // cut lines darkening to the trailing edge
            s.beginPath(); s.rect(-260, 135, 260, 80); s.fillStyle = INK; s.fill();                                                           // black wing tip
            for (let i = 0; i < 5; i++) flick(-170 + i * 22, 148 + i * 3, .2, 60, 6);
          });
          shape(() => pathOf(WING), null, 9);
          for (const [f, R] of [[.3, 55], [.66, 50]]) { const lx = 60 + (-100 - 60) * f, ly = -115 + (170 + 115) * f; nacelle(lx - 10, ly, 92, 18); prop(lx + 42, ly, R, spin + f * 3); }
        });
        return;
      }
      // ---- body ----
      withT(() => {
        s.translate(0, bob);
        shape(() => pathOf(FIN), INK);
        clipTo(() => pathOf(FIN), () => { for (let i = 0; i < 7; i++) flick(-352 + i * 15, -238, -1.95, 120 + i * 9, 8); });
        starPath(-318, -352, 22); s.fillStyle = INK; s.fill();
        starPath(-318, -352, 18); s.fillStyle = CUT; s.fill();
        shape(() => smoothPath(FUSE), CUT);
        clipTo(() => smoothPath(FUSE), () => {
          for (let i = 0; i < 8; i++) taper(BELLY.map(([a, b]) => [a, b - i * 11]), 10 * Math.pow(1 - i / 8, 1.3), 10 * Math.pow(1 - i / 8, 1.3)); // belly: cut lines thinning into the light
          pathOf([[-390, -186], [150, -168], [208, -154], [150, -142], [-390, -160]]); s.fillStyle = RED; s.fill();                             // cheat line
          taper([[-390, -136], [-110, -132], [160, -134]], 4, 4);
          taper([[-300, -262], [-110, -276], [60, -279], [190, -270]], 3, 3);
          for (let i = 0; i < 9; i++) flick(-330 + i * 22, -240 + i * 1.2, -.03, 26, 3.5, INK);
        });
        for (let i = 0; i < 6; i++) { // cabin windows, a passenger in each
          const wx = -250 + i * 58, wy = -212;
          withT(() => { s.beginPath(); s.arc(wx, wy, 15, 0, TAU); s.fillStyle = CUT; s.fill(); s.clip();
            const jb = pax * Math.abs(Math.sin(t * 9 + i * 1.3)) * 8;
            dot(wx + 2, wy + 10 - jb, 9, INK); if (i % 3 === 1) { s.fillStyle = INK; s.fillRect(wx - 9, wy - 3 - jb, 22, 4); s.fillRect(wx - 4, wy - 10 - jb, 12, 8); } });
          s.beginPath(); s.arc(wx, wy, 15, 0, TAU); s.lineWidth = 6; s.strokeStyle = INK; s.stroke();
        }
        shape(() => smoothPath(FUSE), null, 10);
        shape(() => pathOf(STAB), CUT, 7);
        clipTo(() => pathOf(STAB), () => { for (let i = 0; i < 3; i++) taper([[-385, -160 + i * 9], [-250, -170 + i * 9]], 2 + i * 2, 2 + i * 2); });
      });
      for (const tx of [120, -175]) tyre(tx, -52, 52, roll);
      withT(() => {
        s.translate(0, bob);
        for (const tx of [120, -175]) { // fenders
          s.beginPath(); s.arc(tx, -52, 72, Math.PI * 1.04, Math.PI * 1.96); s.arc(tx, -52, 58, Math.PI * 1.96, Math.PI * 1.04, true); s.closePath(); s.fillStyle = INK; s.fill();
          taper(arcPts(tx, -52, 65, 65, Math.PI * 1.15, Math.PI * 1.6, 8), 2, 4, CUT);
        }
        shape(() => pathOf(SCREEN), INK);
        EYES.forEach(([ex, ey, rx, ry], i) => eye(i, ex, ey, rx, ry, o));
        const [raise, tilt] = brow;
        EYES.forEach(([ex, ey, rx, ry], i) => {
          const inner = i ? -1 : 1, by = ey - ry - 22 - raise * 14;
          const a = [ex - 28, by + (inner < 0 ? tilt * 12 : -tilt * 4)], b = [ex + 28, by + (inner > 0 ? tilt * 12 : -tilt * 4)];
          taper([a, [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 7], b], i ? 7 : 13, i ? 13 : 7);
        });
        clipTo(() => smoothPath(FUSE), () => { s.beginPath(); s.ellipse(240, -112, 70, 40, 0, 0, TAU); s.fillStyle = CUT; s.fill(); });
        shape(() => smoothPath(FUSE), null, 10);
        mouth([196, -132], [274, -130], [235, -118], open);
        dot(292, -166, 30, INK);                                                                 // the black ball nose
        taper(arcPts(292, -166, 19, 19, -2.7, -1.5, 8), 3, 7, CUT);
      });
    });
  }
  function drawPlane(px, py, k, st, between = () => {}) { plane(px, py, k, { ...st, pass: 'back' }); plane(px, py, k, { ...st, pass: 'body' }); between(); plane(px, py, k, { ...st, pass: 'wing' }); }
  const scr = (px, py, k, lx, ly) => [px + lx * k, py + ly * k];

  // ======================= the plane, head on (the stamps) =======================
  function frontPlane(x, y, k, o) {
    const { open = 0, look = [0, 0], spin = 0, lid = 0, rot = 0, c = INK } = o;
    withT(() => {
      s.translate(x, y); s.rotate(rot); s.scale(k, k);
      shape(() => pathOf(chisel([[-16, -430], [16, -430], [10, -520], [-10, -520]], 3, 3)), c);
      for (const sd of [-1, 1]) {
        const Wg = chisel([[sd * 150, -252], [sd * 600, -268], [sd * 612, -236], [sd * 150, -206]], 20 + sd, 4);
        shape(() => pathOf(Wg), CUT);
        clipTo(() => pathOf(Wg), () => { for (let i = 0; i < 3; i++) taper([[sd * 150, -214 - i * 9], [sd * 612, -240 - i * 8]], 7 - i * 2.4, 7 - i * 2.4, c); });
        shape(() => pathOf(Wg), null, 9, c);
        for (const ex of [300, 465]) {
          const cx = sd * ex, cy = -238;
          s.beginPath(); s.arc(cx, cy, 96, 0, TAU); s.setLineDash([22, 16]); s.lineWidth = 3.5; s.strokeStyle = c; s.stroke(); s.setLineDash([]);
          dot(cx, cy + 6, 46, c); s.beginPath(); s.arc(cx, cy + 6, 30, 0, TAU); s.lineWidth = 6; s.strokeStyle = CUT; s.stroke();
          for (let i = 0; i < 2; i++) { const a = spin * sd + i * Math.PI + ex; taper([[cx, cy], [cx + Math.cos(a) * 95, cy + Math.sin(a) * 95]], 16, 4, c); }
          dot(cx, cy, 11, c);
        }
      }
      for (const sd of [-1, 1]) { // tyres
        s.beginPath(); s.roundRect(sd * 108 - 34, -118, 68, 118, 18); s.fillStyle = CUT; s.fill();
        s.beginPath(); s.roundRect(sd * 108 - 28, -112, 56, 110, 14); s.fillStyle = c; s.fill();
        for (let i = 0; i < 4; i++) taper([[sd * 108 - 18, -92 + i * 24], [sd * 108 + 18, -92 + i * 24]], 5, 3, CUT);
      }
      const body = () => { s.beginPath(); s.arc(0, -262, 192, 0, TAU); };
      shape(body, CUT);
      clipTo(body, () => {
        for (let i = 0; i < 9; i++) taper(arcPts(0, -262 + 20, 200, 160 - i * 15, .15, Math.PI - .15, 16).reverse(), 12 * Math.pow(1 - i / 9, 1.2), 12 * Math.pow(1 - i / 9, 1.2), c);
        s.fillStyle = RED; s.fillRect(-200, -238, 400, 26);
      });
      shape(body, null, 12, c);
      shape(() => pathOf(chisel([[-150, -398], [150, -398], [166, -298], [-166, -298]], 30, 4)), c);
      for (const sd of [-1, 1]) eye(sd > 0 ? 1 : 0, sd * 70, -348, 54, 42, { look, lid, t: 0 });
      for (const sd of [-1, 1]) taper([[sd * 25, -418 - (sd > 0 ? 0 : 0)], [sd * 70, -430], [sd * 118, -420]], sd > 0 ? 14 : 8, sd > 0 ? 8 : 14, c);
      mouth([-68, -168], [68, -168], [0, -150], open, 1.25);
      dot(0, -232, 46, c); taper(arcPts(0, -232, 30, 30, -2.7, -1.5, 8), 4, 9, CUT);
    });
  }

  // ======================= the carved world =======================
  // rows of black tapered dashes: the gouged sky (wTop at the top row -> wBot at the bottom)
  function skyLines(T, y0, y1, gap, scroll, wTop, wBot, seed, writhe = 0) {
    for (let y = y0, r = 0; y < y1; y += gap, r++) {
      const w = lerp(wTop, wBot, (y - y0) / Math.max(1, y1 - y0)); if (w < 1) continue;
      const g = rng(seed + r * 31), PER = 2400, off = wrap(scroll * (.6 + .4 * g()) + g() * PER, PER);
      const dashes = []; for (let x = 0; x < PER;) { const l = 90 + g() * 260, gp = 26 + g() * 70; dashes.push([x, l]); x += l + gp; }
      for (const rep of [-PER, 0, PER]) for (const [dx, l] of dashes) {
        const x = dx - off + rep; if (x > W + 50 || x + l < -50) continue;
        const pts = []; for (let k = 0; k <= 6; k++) { const xx = x + l * k / 6; pts.push([xx, y + Math.sin(xx * .006 + r) * 6 + writhe * Math.sin(xx * .02 + T * 9 + r * 1.3) * 14]); }
        taper(pts.slice(0, 4), .5, w); taper(pts.slice(3), w, .5);
      }
    }
  }
  function sun(T, x, y, r) {
    dot(x, y, r * 2.05, CUT);
    for (let i = 0; i < 20; i++) { const a = i / 20 * TAU + T * .25; const l = i % 2 ? r * .55 : r * .85;
      const p0 = [x + Math.cos(a) * r * 1.22, y + Math.sin(a) * r * 1.22]; taper([p0, [x + Math.cos(a) * (r * 1.22 + l), y + Math.sin(a) * (r * 1.22 + l)]], 14, 1); }
    s.beginPath(); s.arc(x, y, r, 0, TAU); s.lineWidth = 11; s.strokeStyle = INK; s.stroke();
    for (let i = 0; i < 3; i++) { s.beginPath(); s.arc(x, y, r * (.72 - i * .2), .3 + i, 2.6 + i); s.lineWidth = 4; s.stroke(); }
  }
  function cloud(x, y, sc, seed) {
    const r = rng(seed), C = []; for (let i = 0; i < 5; i++) C.push([x + (i - 2) * 52 * sc + (r() - .5) * 20 * sc, y - Math.sin(i / 4 * Math.PI) * 38 * sc + (r() - .5) * 10, (38 + r() * 26) * sc]);
    C.push([x, y + 8 * sc, 70 * sc]);
    for (const [a, b, rr] of C) dot(a, b, rr + 7, INK);
    for (const [a, b, rr] of C) dot(a, b, rr, CUT);
    s.fillStyle = CUT; s.fillRect(x - 170 * sc, y + 24 * sc, 340 * sc, 60 * sc);
    taper([[x - 175 * sc, y + 26 * sc], [x + 175 * sc, y + 26 * sc]], 5, 5);
    for (const [a, b, rr] of C.slice(0, 5)) taper(arcPts(a, b, rr * .62, rr * .62, Math.PI * .7, Math.PI * 1.45, 8), 1, 5);
  }
  function farHills(T, base, scroll, seed) {
    const hy = (x) => base - 120 + 46 * Math.sin((x + scroll) * .0042 + seed) + 26 * Math.sin((x + scroll) * .011 + seed * 2);
    const mk = () => { s.beginPath(); s.moveTo(-60, base + 4); for (let x = -60; x <= W + 60; x += 20) s.lineTo(x, hy(x)); s.lineTo(W + 60, base + 4); s.closePath(); };
    shape(mk, INK);
    clipTo(mk, () => { for (let j = 0; j < 6; j++) for (let x = -60 - wrap(scroll, 36); x < W + 60; x += 36) { const y = hy(x + 18) + 20 + j * 19; flick(x + (j % 2) * 18, y, -.5, 22, 6); flick(x + (j % 2) * 18 + 16, y - 10, .5, 22, 6); } }); // chevron cuts
  }
  function tree(x, y, h, seed) {
    taper([[x, y], [x, y - h * .6]], 10, 6);
    const r = h * .28, cy = y - h * .62 - r * .7;
    s.beginPath(); s.ellipse(x, cy, r, r * 1.2, 0, 0, TAU); s.fillStyle = INK; s.fill();
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .42; flick(x + Math.cos(a) * r * .2, cy + r * .5 + Math.sin(a) * r * .2, a, r * .95, 6); }
  }
  function nearHills(T, base, scroll, seed) {
    const PER = 2600, g = rng(seed), M = []; for (let x = 0; x < PER;) { const R = 170 + g() * 120; M.push([x, R, g()]); x += R * 1.35; }
    for (const rep of [-PER, 0, PER]) for (const [mx, R, kind] of M) {
      const x = mx - wrap(scroll, PER) + rep; if (x + R < -50 || x - R > W + 50) continue;
      const mk = () => { s.beginPath(); s.ellipse(x, base, R, R * .55, 0, Math.PI, TAU); s.closePath(); };
      shape(mk, CUT);
      clipTo(mk, () => { // furrows that follow the mound, thicker at its foot
        for (let i = 1; i < 9; i++) { const f = 1 - i * .1; taper(arcPts(x, base, R * f, R * .55 * f, Math.PI * 1.02, TAU * .99, 20), 1 + (1 - f) * 0 + i * .2, 1 + i * .2); }
        if (kind > .55) rows(x - R, base - R, x + R, base, .6, 15, () => 4);
      });
      shape(mk, null, 7);
      if (kind < .5) tree(x + (kind - .25) * R, base - R * .55 + 6, 110 + kind * 60, mx);
    }
  }
  function poles(T, base, scroll, h = 260, spacing = 720) {
    const xs = []; for (let x = -spacing - wrap(scroll, spacing); x < W + spacing; x += spacing) xs.push(x);
    for (let i = 0; i < xs.length - 1; i++) for (const dy of [0, 24]) { const a = [xs[i] + 40, base - h + 18 + dy], b = [xs[i + 1] - 40, base - h + 18 + dy]; s.beginPath(); s.moveTo(...a); s.quadraticCurveTo((a[0] + b[0]) / 2, a[1] + 60, ...b); s.lineWidth = 3; s.strokeStyle = INK; s.stroke(); }
    for (const x of xs) { taper([[x, base], [x, base - h]], 12, 8); taper([[x - 50, base - h + 22], [x + 50, base - h + 22]], 9, 9); for (const dx of [-40, 40]) dot(x + dx, base - h + 12, 6, INK); }
  }
  function road(T, y0, y1, scroll, dashY) {
    s.fillStyle = INK; s.fillRect(-50, y0, W + 100, y1 - y0);
    taper([[-50, y0 + 10], [W + 50, y0 + 12]], 5, 5, CUT); taper([[-50, y1 - 10], [W + 50, y1 - 12]], 5, 5, CUT);
    for (let x = -wrap(scroll, 150) - 150; x < W + 150; x += 150) flick(x, dashY, 0, 90, 13);   // carved dashes
    const g = rng(7); for (let i = 0; i < 26; i++) { const x = wrap(g() * 2600 - scroll * 1.0, 2600) - 300, y = lerp(y0 + 26, y1 - 26, g()); flick(x, y, 0, 40 + g() * 70, 3.5); } // speed gouges
  }
  function verge(T, y0, scroll) {
    s.fillStyle = INK; s.fillRect(-50, y0, W + 100, H - y0 + 60);
    for (let j = 0; j < 5; j++) for (let x = -wrap(scroll, 46) - 46; x < W + 46; x += 46) { const y = y0 + 34 + j * 32, xx = x + (j % 2) * 23; flick(xx, y, -1.9, 26, 6); flick(xx + 6, y, -1.25, 26, 6); }
  }
  function sign(x, y, ang) { // a diamond road sign on a post: a little plane, struck out
    withT(() => { s.translate(x, y); s.rotate(ang);
      taper([[0, 0], [0, -150]], 14, 12, CUT); taper([[0, 0], [0, -150]], 8, 8);
      const D = [[0, -290], [72, -218], [0, -146], [-72, -218]];
      shape(() => pathOf(D), CUT, 9);
      withT(() => { s.translate(0, -218); s.scale(.55, .55);
        pathOf([[44, -4], [30, -16], [-36, -12], [-50, -26], [-58, -24], [-52, 2], [30, 10]]); s.fillStyle = INK; s.fill();
        pathOf([[8, -4], [-14, 30], [-24, 30], [-12, -4]]); s.fill(); });
      taper([[-34, -252], [34, -184]], 9, 9);
    });
  }

  // ======================= world A: the folk-print highway, side on =======================
  const PXA = 900, PYA = 862, KA = 1.1, VP = 820;
  const WING_X = PXA - 150 * KA;
  const SIGNS = [73.25, 75.75];                       // when the near wing smacks each sign
  function worldA(T, o = {}) {
    const sc = (T - 71) * VP;
    s.fillStyle = CUT; s.fillRect(-50, -50, W + 100, H + 100);
    if (o.vortex) vortex(T, o.vortex);
    else {
      skyLines(T, 40, 560, 34, sc * .05, 13, 2, 101, o.writhe || 0);
      sun(T, 1540, 230, 92);
      for (let i = 0; i < 3; i++) cloud(wrap(400 + i * 760 - sc * .03, W + 700) - 300, 150 + i * 70 % 160, .8 + .2 * (i % 2), 50 + i);
      farHills(T, 640, sc * .12, 3);
      nearHills(T, 706, sc * .32, 9);
    }
    poles(T, 706, sc);
    road(T, 700, 915, sc, 808);
    verge(T, 915, sc);
  }
  function vergeA(T) {
    for (const tc of SIGNS) { const x = WING_X + (tc - T) * VP, dt = T - tc; if (x < -200 || x > W + 300) continue;
      const ang = dt > 0 ? -.55 * Math.exp(-4 * dt) * Math.sin(dt * 16) : 0; sign(x, 1060, ang);
      if (dt > 0 && dt < .5) for (let q = 0; q < 6; q++) { const a = q / 6 * TAU, rr = 60 + dt * 200; taper([[x + Math.cos(a) * rr, 830 + Math.sin(a) * rr * .7], [x + Math.cos(a) * (rr + 40), 830 + Math.sin(a) * (rr + 40) * .7]], 10 * (1 - dt * 2), 1, CUT); } }
  }
  function vortex(T, v) {
    const [cx, cy] = v.c, rot = (T - STRANGE) * 3.2;
    for (let i = 0; i < 34; i++) {
      const r = 70 + i * 40, m = Math.floor(r * TAU / 150);
      for (let j = 0; j < m; j++) {
        const a = j / m * TAU + rot * (1.6 - i * .03) + hash(i * 97 + j) * .4, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * .8;
        if (x < -300 || x > W + 300 || y < -300 || y > H + 300) continue;
        const pts = []; for (let k = 0; k <= 8; k++) { const aa = a + k * .06 * (1 + 8 / (i + 4)), rr = r * (1 - k * .012); pts.push([cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr * .8]); }
        taper(pts.slice(0, 4), 1, 8 + i * .45); taper(pts.slice(3), 8 + i * .45, 1);
      }
    }
  }
  function base(T) {
    const b = beatPulse(T, 7), blink = Math.max(...[72.4, 74.1, 76.2, 82.1, 85.0, 88.7].map((bt) => tri(T - bt, .09)));
    return { t: T, open: clamp((F('voc', T, 1) - .1) / .4), bob: b * 9, lid: blink, roll: T * 3, spin: T * TAU * 2.3, look: [.7, .15], brow: [0, 0] };
  }
  function planeA(T) {
    const st = base(T);
    const hS = hit(T, SIGNS[1], 3);
    if (T > SIGNS[1] - .9 && T < SIGNS[1]) { const g = tri(T - (SIGNS[1] - .35), .55); st.look = [lerp(.7, -.6, g), lerp(.15, .95, g)]; st.brow = [.6 * g, 0]; }
    if (hS > .05) { st.brow = [hS, 0]; st.lid = Math.max(st.lid, .3 * hS); st.look = [-.6, .7]; }
    if (T >= 77.22) { // uneasy: eyes dart left, right, up
      const u = T - 77.22, d = [[-.7, -.2], [.8, -.1], [-.2, -.8], [.6, .4]][Math.floor(u / .3) % 4];
      st.look = d; st.brow = [.6, -1]; st.lid = Math.max(st.lid, .12);
    }
    if (T >= STRANGE) {
      st.wobble = 1; st.brow = [1.1, 0]; st.pax = 1;
      const bi = lastBeat(T), bt = FEAT.beats[bi], nb = FEAT.beats[bi + 1] || bt + .567, p = clamp((T - bt) / (nb - bt));
      st.hop = (-90 * Math.sin(Math.PI * clamp((T - STRANGE) / .45)) - 26 * Math.sin(Math.PI * p) * (T > STRANGE + .4 ? 1 : 0)) / KA;
    }
    return st;
  }
  // the sheet lifting off the block: everything where x + .45 y > L is still covered
  function peel(L, fw = 180) {
    const a = .45, ln = (c) => [[c + a * 80, -80], [c - a * 1160, 1160]];
    const [p0, p1] = ln(L), [q0, q1] = ln(L + 5000), [f0, f1] = ln(L - fw), [g0, g1] = ln(L - fw - 26);
    pathOf([p0, q0, q1, p1]); s.fillStyle = CUT; s.fill();
    pathOf([g0, f0, f1, g1]); s.fillStyle = INK; s.fill();                         // the curl's shadow on the print
    pathOf([f0, p0, p1, f1]); s.fillStyle = CUT; s.fill();
    for (let c = L - fw + 18; c < L - 4; c += 15) { const u = (c - (L - fw)) / fw, [h0, h1] = ln(c); taper([h0, h1], 1 + u * 7, 1 + u * 7); }
    s.lineWidth = 7; s.strokeStyle = INK; pathOf([f0, p0, p1, f1]); s.stroke();
  }
  function cam(z, cx, cy) { s.translate(W / 2, H / 2); s.scale(z, z); s.translate(-cx, -cy); }

  // 71.00 open: wide; the print is pulled
  function open(t) {
    const T = step(t);
    worldA(T);
    drawPlane(PXA, PYA, KA, planeA(T), () => vergeA(T));
    if (t < 71.8) peel(lerp(-700, W + 900, ease.inOut(inv(71.0, 71.6, step(t, 24)))));
  }
  // 74.86 highway: closer on the front half, the sign gets smacked
  function highway(t) {
    const T = step(t);
    withT(() => { cam(1.42, kf(T, [[74.86, 1060], [77.2, 1010]]), 690);
      worldA(T); drawPlane(PXA, PYA, KA, planeA(T), () => vergeA(T)); });
  }
  // 77.22 uneasy -> 78.38 strange: inversion, vortex, the block splits
  function strange(t) {
    const T = step(t), on = T >= STRANGE, z = on ? 1.5 : kf(T, [[77.22, 1.6], [78.3, 1.85]]);
    const head = scr(PXA, PYA, KA, 205, -228);
    const scene = () => withT(() => { cam(z, on ? head[0] - 60 : 1040, on ? head[1] + 70 : 660);
      const st = planeA(T);
      worldA(T, on ? { vortex: { c: [head[0], head[1] + st.hop * KA] } } : { writhe: smooth(inv(77.5, 78.3, T)) });
      drawPlane(PXA, PYA, KA, st, () => vergeA(T)); });
    if (!on) { scene(); return; }
    const g = rng(4), C = []; for (let i = 0; i <= 12; i++) C.push([lerp(1150, 350, i / 12) + (g() - .5) * 90, lerp(-60, H + 60, i / 12)]);
    const sp = 14 + 26 * ease.out(inv(STRANGE, STRANGE + .2, T));
    s.fillStyle = RED; s.fillRect(-50, -50, W + 100, H + 100);              // the split shows the red plate underneath
    withT(() => { s.translate(-sp, sp * .4); pathOf([[-60, -60], ...C, [-60, H + 60]]); s.clip(); scene(); });
    withT(() => { s.translate(sp, -sp * .4); pathOf([[W + 60, -60], ...C, [W + 60, H + 60]]); s.clip(); scene(); });
    fx({ inv: 1, flash: .5 * hit(t, STRANGE, 14) });
  }
  // 79.13 nuh x3: his face stamped onto the sheet on each beat
  function nuh(t) {
    const T = step(t);
    s.fillStyle = CUT; s.fillRect(-50, -50, W + 100, H + 100);
    const STAMPS = [[NUH[0], 560, 700, -.1, INK], [NUH[1], 1080, 1010, .06, RED], [NUH[2], 1400, 620, .13, INK]];
    STAMPS.forEach(([bt, x, y, rot, c], i) => {
      if (T < bt) return;
      const slam = 1 + .18 * (1 - smooth(inv(bt, bt + .12, T)));
      const newest = i === STAMPS.length - 1 || T < STAMPS[i + 1][0];
      const op = newest ? Math.max(.25, clamp((F('voc', T, 1) - .05) / .35)) * (T - bt < .5 ? 1 : .6) : 0;
      const nx = newest ? 0 : (STAMPS[STAMPS.length - 1][1] > x ? .8 : -.8);
      // spatter flung by the slam
      if (T - bt < .25) { const r = rng(i * 9 + 3); for (let q = 0; q < 14; q++) { const a = r() * TAU, d = 380 + r() * 160 + (T - bt) * 300; dot(x + Math.cos(a) * d, y - 300 + Math.sin(a) * d * .7, 5 + r() * 9, c); } }
      frontPlane(x, y, .9 * slam, { open: op, look: newest ? [0, .3] : [nx, .2], spin: T * 9 + i, rot, c, lid: newest ? 0 : .25 });
    });
    fx({ flash: .25 * Math.max(...NUH.map((b) => hit(t, b, 18))) });
  }

  // ======================= world B: the roped-off red-carpet passing lane =======================
  const PXB = 860, PYB = 760, KB = 1.0, VB = 820;
  const CARS = [[81.0, 1500], [82.1, 1600], [83.25, 1450], [84.3, 1650], [85.3, 1500], [87.35, 1080, true], [89.6, 1700]];
  const carX = (c, T) => -520 + (T - c[0]) * c[1];
  function car(x, y, sc, T, limo = false) {
    withT(() => { s.translate(x, y); s.scale(sc, sc);
      const st = limo ? 1.7 : 1, X = (v) => v < 0 ? v * st : v;
      for (let i = 0; i < 4; i++) flick(X(-180) - 40 - i * 30, -40 - i * 22, Math.PI, 150 + i * 30, 6);      // speed gouges behind
      const body = chisel([[152, -40], [142, -82], [70, -92], [36, -134], [X(-50), -139], [X(-86), -96], [X(-150), -88], [X(-172), -80], [X(-164), -40], [X(-142), -20], [142, -20]], limo ? 77 : 33, 3);
      shape(() => pathOf(body), INK);
      const glass = [[28, -125], [X(-44), -129], [X(-74), -96], [56, -94]];
      pathOf(glass); s.fillStyle = CUT; s.fill();
      clipTo(() => pathOf(glass), () => { dot(-8, -100, 15, INK); taper([[-18, -106], [12, -106]], 5, 5, CUT); taper([[-30, -140], [40, -90]], 6, 6); if (limo) for (const wx of [-90, -170, -250]) taper([[wx, -134], [wx - 6, -92]], 9, 9); });
      if (limo) { s.fillStyle = INK; s.fillRect(-24, -126, 32, 6); s.fillRect(-16, -142, 18, 18); }
      taper([[X(-150), -62], [134, -64]], 6, 6, CUT);
      flicks(X(-140), -56, 120, -30, 6, 0, 40, 4, limo ? 5 : 6);
      dot(142, -62, 11, CUT); dot(X(-164), -64, 9, RED);
      tyre(94, -24, 26, T * 4); tyre(X(-102), -24, 26, T * 4);
    });
  }
  function velvet(T, y0) {
    const sp = 300, off = wrap((T - 71) * VB, sp), h = 108, y = y0;
    const xs = []; for (let x = -sp - off; x < W + sp * 2; x += sp) xs.push(x);
    for (let i = 0; i < xs.length - 1; i++) {
      const a = [xs[i], y - h + 4], b = [xs[i + 1], y - h + 4], c = [(a[0] + b[0]) / 2, y - h + 66];
      s.beginPath(); s.moveTo(...a); s.quadraticCurveTo(...c, ...b); s.lineCap = 'round'; s.lineWidth = 15; s.strokeStyle = INK; s.stroke();
      for (let k = 1; k < 10; k++) { const u = k / 10, px = (1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], py = (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]; flick(px - 6, py - 4, .6, 13, 4); }
    }
    for (const x of xs) { s.beginPath(); s.ellipse(x, y, 24, 8, 0, 0, TAU); s.fillStyle = INK; s.fill(); taper([[x, y], [x, y - h]], 13, 10); taper([[x - 2, y - 8], [x - 2, y - h + 10]], 3, 3, CUT); dot(x, y - h - 9, 14, INK); flick(x - 6, y - h - 14, -.6, 10, 4); }
  }
  function carpet(T, y0, y1) {
    s.fillStyle = RED; s.fillRect(-50, y0, W + 100, y1 - y0);
    const g = rng(23), sc = (T - 71) * VB;                       // pile, gouged in rows
    for (let i = 0; i < 60; i++) { const x = wrap(g() * 2600 - sc, 2600) - 300, y = lerp(y0 + 30, y1 - 30, g()); flick(x, y, 0, 40 + g() * 50, 4); }
    for (const [yy, dir] of [[y0 + 6, 1], [y1 - 6, -1]]) {        // carved zigzag borders
      s.fillStyle = INK; s.fillRect(-50, yy - 7, W + 100, 14);
      s.beginPath(); for (let x = -wrap(sc, 40) - 40; x < W + 40; x += 40) { s.moveTo(x, yy + dir * 7); s.lineTo(x + 20, yy + dir * 24); s.lineTo(x + 40, yy + dir * 7); } s.fill();
    }
  }
  function worldB(T) {
    const sc = (T - 71) * VB;
    s.fillStyle = CUT; s.fillRect(-50, -50, W + 100, H + 100);
    skyLines(T, 40, 470, 34, sc * .05, 13, 2, 202);
    sun(T, 300, 200, 80);
    for (let i = 0; i < 3; i++) cloud(wrap(700 + i * 760 - sc * .03, W + 700) - 300, 120 + (i * 70) % 160, .75, 70 + i);
    farHills(T, 530, sc * .12, 7);
    nearHills(T, 606, sc * .32, 21);
    poles(T, 606, sc, 230);
    road(T, 600, 806, sc, 700);
    carpet(T, 806, 990);
    verge(T, 990, sc);
  }
  function planeB(T) {
    const st = base(T);
    let best = null; for (const c of CARS) { const x = carX(c, T); if (x > -300 && x < W + 200 && (!best || Math.abs(x - 1000) < Math.abs(best - 1000))) best = x; }
    if (best !== null) { st.look = [clamp((best - 1050) / 450, -1, 1), .85]; st.brow = [.3, .5]; }
    const u = inv(86.6, 87.4, T);                                    // "sick": the eye roll
    if (u > 0 && u < 1) { const th = lerp(-.25, Math.PI + .3, ease.inOut(u)); st.look = [Math.cos(th), -Math.sin(th) * 1.1]; st.lid = Math.max(st.lid, .1); st.brow = [1, -.3]; }
    if (T >= 87.4 && T < 89.3) { const lx = carX(CARS[5], T); st.look = [clamp((lx - 1050) / 450, -1, 1), .8]; st.lid = Math.max(st.lid, .38); st.brow = [0, 1]; }
    if (T >= 89.3) { const v = smooth(inv(89.3, 89.9, T)); st.look = [lerp(.3, .5, v), .5]; st.lid = Math.max(st.lid, .55 * v); st.brow = [-.2 * v, -.5 * v]; }
    return st;
  }
  function sceneB(T) {
    worldB(T);
    drawPlane(PXB, PYB, KB, planeB(T), () => { velvet(T, 965); for (const c of CARS) { const x = carX(c, T); if (x > -700 && x < W + 600) car(x, 968, c[2] ? 1 : .95, T, c[2]); } });
    for (let q = 0; q < 3; q++) { const u = (T - 89.4 - q * .2) / 1.1; if (u < 0 || u >= 1) continue;   // the sigh, a carved puff
      const [mx, my] = scr(PXB, PYB, KB, 300, -112); cloud(mx + 60 + u * 220 + q * 30, my - 10 - u * 140 - q * 30, (.3 + u * .3) * (1 - u * .3), 991 + q); }
  }
  function lane(t) { const T = step(t); withT(() => { cam(kf(T, [[LINE2, 1.0], [84.2, 1.1]]), kf(T, [[LINE2, 960], [84.2, 1000]]), 560); sceneB(T); }); }
  function lane2(t) { const T = step(t); withT(() => { cam(1.55, kf(T, [[84.24, 1020], [86.6, 1080]]), 700); sceneB(T); }); }
  function sick(t) { const T = step(t); withT(() => { cam(2.3, 1090, 600); sceneB(T); }); }
  function lane3(t) { const T = step(t); withT(() => { cam(kf(T, [[87.52, 1.25], [89.0, 1.05]]), kf(T, [[87.52, 1040], [89.0, 980]]), kf(T, [[87.52, 640], [89.0, 560]])); sceneB(T); }); }

  chapter('airplane', 71.0, 91.0, [[71.0, open], [74.86, highway], [77.22, strange], [NUH[0], nuh], [LINE2, lane], [84.24, lane2], [86.6, sick], [87.52, lane3]]);
})();

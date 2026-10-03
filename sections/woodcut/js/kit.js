// Shared woodcut kit for v1 sections C and E, lifted from the look test's js/ch/01-airplane.js
// (the plane side-on and head-on, and the carved world). Exposed as window.K.
(() => {
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
    const { t, pass, open = 0, brow = [0, 0], bob = 0, hop = 0, roll = t * 3, spin = t * TAU * 2.3, pax = 0, rot = 0, tyres = true, flap = 0, wingY = 1 } = o;
    // rot: pitch about the body centre; tyres: false for the legend's real airplanes (gear tucked away);
    // flap: -1..1, the wings beat like a bird's (far wing taller as the near wing shortens)
    withT(() => {
      s.translate(x, y + hop * k); s.scale(k, k);
      if (rot) { s.translate(0, -180); s.rotate(rot); s.translate(0, 180); }
      if (pass === 'back') {
        withT(() => { s.translate(0, bob);
          if (flap) { s.translate(0, -236); s.scale(1, 1 + .45 * flap); s.translate(0, 236); }
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
          if (flap || wingY !== 1) { s.translate(0, -112); s.scale(1, wingY * (1 - .55 * flap)); s.translate(0, 112); }
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
      if (tyres) for (const tx of [120, -175]) tyre(tx, -52, 52, roll);
      withT(() => {
        s.translate(0, bob);
        if (tyres) for (const tx of [120, -175]) { // fenders
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
        // (FACE.md) no chin/muzzle patch: the mouth sits straight on the cream nose cone
        shape(() => smoothPath(FUSE), null, 10);
        mouth([196, -132], [274, -130], [235, -118], open);
        // (FACE.md) the nose is his own cream nose cone: one thin carved radome seam near the tip, a few fine hatch cuts in the cap
        taper([[278, -224], [287, -196], [289, -168], [284, -142], [276, -122]], 2.5, 3.5); for (let i = 0; i < 4; i++) taper([[287 + (i % 2), -200 + i * 16], [294, -196 + i * 16]], 1.5, 1.5);
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
      s.beginPath(); s.arc(0, -232, 46, 0, TAU); s.lineWidth = 4; s.strokeStyle = c; s.stroke();   // (FACE.md) radome seam on the cream nose cone, no ball nose
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
  window.K = { plane, drawPlane, scr, frontPlane, starPath, tyre, nacelle, prop, eye, mouth, skyLines, sun, cloud, farHills, tree, nearHills, poles, road, verge, sign, peel, cam, EYES };
})();

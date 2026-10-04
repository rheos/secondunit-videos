// THE PLANE (hybrid exploration). One design carried through all three looks; only the PEN changes.
// A stubby 1950s propeller airliner on car tyres: big eyes in the windscreen, a black ball nose, a mouth
// that opens with the vocal (F('voc', t)), a red cheat line. The wings are LEVEL with the body: side on
// they are a flat slab across the lower fuselage, head on they stick straight out, far wider than a lane.
// Side-view geometry follows the woodcut take's fuselage; the wing is redrawn level.
// Local units: origin on the road under his middle, +x is forward (he faces right), y up is negative.
const PLANE = (() => {
  const FUSE = [[292, -170], [276, -236], [200, -276], [60, -283], [-110, -271], [-250, -251], [-345, -243], [-360, -214], [-302, -183], [-232, -136], [-110, -100], [60, -92], [200, -90], [274, -114]];
  const FIN = [[-225, -246], [-290, -410], [-356, -416], [-364, -238]];
  const STAB = [[-250, -210], [-322, -214], [-392, -176], [-344, -168]];
  const CHEAT = [[-292, -207], [150, -171], [214, -158], [150, -147], [-292, -187]];
  const WING = [[86, -164], [-150, -166], [-236, -124], [4, -120]];          // near wing, level slab (tip toward us, a little aft)
  const SCREEN = [[128, -272], [268, -263], [279, -190], [132, -183]];
  const EYES = [[168, -228, 29, 37], [231, -224, 27, 35]];

  function eye(pen, cx, cy, rx, ry, st, i) {
    const { look = [.6, .1], lid = 0 } = st;
    pen.fill(circPts(cx, cy, rx, ry, 26), 'white', { lw: 0, seed: 40 + i, smooth: true, pencil: true, shadow: .3, rim: 2 });
    const px = cx + clamp(look[0], -1, 1) * rx * .42, py = cy + clamp(look[1], -1, 1) * ry * .5;
    pen.dotp(px, py, rx * .5, 'pupil', { lw: 0, flat: true, pencil: false, shadow: 0, rim: 0, mask: false });
    pen.dotp(px - rx * .17, py - ry * .17, rx * .15, 'white', { lw: 0, flat: true, pencil: false, shadow: 0, rim: 0, mask: false });
    if (lid > .02) { // the upper lid comes down in the body colour
      const ly = cy - ry + lid * ry * 2.05;
      const P = [[cx - rx - 3, cy - ry - 5], [cx + rx + 3, cy - ry - 5], [cx + rx + 3, ly], ...quadPts([cx + rx + 3, ly], [cx, ly + 10], [cx - rx - 3, ly], 8).slice(1)];
      pen.fill(P, pen.name === 'wood' ? 'dark' : 'body', { lw: 0, shadow: 0, rim: 0, pencil: false, ink: true, col: pen.name === 'gouache' ? GCOL.glass : undefined });
      pen.line([[cx - rx, ly + 2], [cx, ly + 8], [cx + rx, ly + 2]], 5, pen.name === 'wood' ? 'white' : 'dark', { ink: true, pencil: false });
    }
  }
  function mouthPts(L, R, up, open, sc) { const dn = [up[0], up[1] + MO * open * sc]; return [...quadPts(L, up, R, 10), ...quadPts(R, dn, L, 10).slice(1, -1)]; }
  let MO = 64;
  function mouth(pen, L, R, up, open, sc = 1) {
    if (open < .07) { pen.line(quadPts(L, [up[0], up[1] + 4], R, 8), 6 * sc, 'pupil', { ink: true, pencil: false }); return; }
    const P = mouthPts(L, R, up, open, sc);
    pen.fill(P, 'pupil', { lw: 0, shadow: .3, rim: 2, ink: true, pencil: false, mask: true, noRim: true });
    const dn = up[1] + MO * open * sc;
    if (open > .25) pen.fill(circPts(up[0] + 3 * sc, lerp(up[1], dn, .68), 22 * sc * Math.min(1, open * 1.5), MO * .16 * open * sc, 18), 'tongue', { lw: 0, shadow: 0, rim: 0, pencil: false, ink: true });
    pen.line(quadPts([L[0] + 6, L[1] + 3], [up[0], up[1] + 10 * sc], [R[0] - 6, R[1] + 3], 8), 9 * sc, 'white', { ink: true, pencil: false });
  }
  function tyre(pen, cx, cy, r, ang, seed) {
    if (pen.name === 'wood') pen.dotp(cx, cy, r + 6, 'white', {});
    pen.fill(circPts(cx, cy, r, r, 28), 'tyre', { lw: 0, seed, smooth: true });
    pen.fill(circPts(cx, cy, r * .5, r * .5, 20), 'hub', { lw: 5, seed: seed + 1, smooth: true, shadow: .4 });
    for (let i = 0; i < 4; i++) { const a = ang + i * TAU / 4; pen.line([[cx + Math.cos(a) * r * .12, cy + Math.sin(a) * r * .12], [cx + Math.cos(a) * r * .44, cy + Math.sin(a) * r * .44]], 6, 'dark', { seed: seed + i, pencil: false }); }
    for (let i = 0; i < 10; i++) { const a = ang + i * TAU / 10; pen.line([[cx + Math.cos(a) * r * .72, cy + Math.sin(a) * r * .72], [cx + Math.cos(a) * r * .94, cy + Math.sin(a) * r * .94]], 5, pen.name === 'wood' ? 'white' : 'hub', { pencil: false }); }
  }
  function prop(pen, cx, cy, R, spin, seed) {
    // the blur as a pale disc seen edge on, one blade pair
    if (pen.name === 'gouache') pen.pencil(circPts(cx, cy, R * .28, R, 20), true, true, seed, 1.6, .45);
    else if (pen.name === 'cut') { s.save(); s.globalAlpha = .55; pen.fill(circPts(cx, cy, R * .28, R, 20), 'white', { seed, smooth: true, shadow: .3, rim: 0 }); s.restore(); }
    else { s.save(); s.setLineDash([16, 12]); pathOn(s, circPts(cx, cy, R * .28, R, 24), true); s.lineWidth = 3.5; s.strokeStyle = CUT; s.stroke(); s.restore(); }
    for (let i = 0; i < 2; i++) { const a = spin + i * Math.PI; const tip = [cx + Math.sin(a) * R * .28, cy + Math.cos(a) * R];
      pen.fill([[cx - 6, cy], [lerp(cx, tip[0], .5) - 9, lerp(cy, tip[1], .5)], tip, [lerp(cx, tip[0], .5) + 9, lerp(cy, tip[1], .5)], [cx + 6, cy]], 'dark', { lw: 0, seed: seed + i, shadow: .4, rim: 2, pencil: false }); }
    pen.dotp(cx + 3, cy, R * .17, 'dark', { seed: seed + 5 });
  }

  // ---------------- side view ----------------
  // st: { t, open, look, lid, brow:[raise, tilt], bob, roll, spin }
  function side(pen, x, y, k, st) {
    const { open = 0, brow = [0, 0], bob = 0, roll = 0, spin = 0 } = st;
    TX(pen, x, y, k, 0, () => {
      TX(pen, 0, bob, 1, 0, () => {
        pen.fill(FIN, 'body', { seed: 11, shade: false });
        pen.fill([[-300, -398], [-352, -404], [-357, -372], [-308, -368]], 'accent', { lw: 0, seed: 17, shadow: .4, rim: 2, pencil: false });
        pen.fill(FUSE, 'body', { smooth: true, seed: 12, shade: true, amt: 2, maskCol: '#5e5e5e' });
        pen.fill(CHEAT, 'accent', { lw: 0, seed: 13, rim: 3, shadow: .5, mask: true, pencil: false });
        for (let i = 0; i < 5; i++) { const wx = -244 + i * 58, wy = -214; pen.fill(circPts(wx, wy, 15, 15, 14), 'glass', { lw: 5, seed: 20 + i, smooth: true, shadow: .4, rim: 2 }); }
        pen.fill(STAB, 'body', { seed: 14 });
        pen.fill(SCREEN, 'glass', { seed: 15, lw: 6 });
      });
      for (const [i, tx] of [120, -175].entries()) tyre(pen, tx, -52, 52, roll + i, 60 + i * 7);
      TX(pen, 0, bob, 1, 0, () => {
        for (const [i, tx] of [120, -175].entries()) { // fenders
          const P = [...arcPts(tx, -52, 72, 72, Math.PI * 1.04, Math.PI * 1.96, 12), ...arcPts(tx, -52, 59, 59, Math.PI * 1.96, Math.PI * 1.04, 12)];
          pen.fill(P, 'dark', { lw: 0, seed: 70 + i, shadow: .5, rim: 3 });
        }
        EYES.forEach(([ex, ey, rx, ry], i) => eye(pen, ex, ey, rx, ry, st, i));
        const [raise, tilt] = brow;
        EYES.forEach(([ex, ey, , ry], i) => {
          const inner = i ? -1 : 1, by = ey - ry - 20 - raise * 14;
          const a = [ex - 26, by + (inner < 0 ? tilt * 12 : -tilt * 4)], b = [ex + 26, by + (inner > 0 ? tilt * 12 : -tilt * 4)];
          pen.line(quadPts(a, [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 7], b, 6), 11, pen.name === 'wood' ? 'white' : 'dark', { ink: true, pencil: false });
        });
        pen.fill(circPts(234, -124, 64, 40, 22), 'body', { lw: 0, seed: 81, smooth: true, shadow: .3, rim: 0, pencil: false, maskCol: '#5e5e5e' });   // the chin
        MO = 52; mouth(pen, [194, -150], [266, -148], [230, -138], open, 1);
        pen.dotp(292, -168, 30, 'dark', { seed: 80 });
        pen.line(arcPts(292, -168, 18, 18, -2.6, -1.6, 6), 5, pen.name === 'wood' ? 'white' : 'white', { ink: true, pencil: false });
        // the near wing, level, with its two engines
        pen.fill(WING, 'body', { seed: 16, lw: 7 });
        pen.line([[60, -158], [-150, -159]], 3, 'dark', { seed: 3 });
        for (const [j, ex] of [[0, 16], [1, -128]]) {
          const ey = -142 - j * 2;
          const N = [[ex + 78, ey], [ex + 60, ey - 24], [ex - 54, ey - 21], [ex - 80, ey], [ex - 54, ey + 21], [ex + 60, ey + 24]];
          pen.fill(N, 'body', { smooth: true, seed: 90 + j, lw: 6 });
          pen.fill(circPts(ex + 66, ey, 9, 22, 14), 'dark', { seed: 95 + j, lw: 0 });
          prop(pen, ex + 84, ey, 66, spin + j * 1.3, 100 + j * 10);
        }
      });
    });
  }

  // ---------------- head on ----------------
  function front(pen, x, y, k, st) {
    const { open = 0, look = [0, .2], lid = 0, spin = 0, brow = [0, 0], bob = 0 } = st;
    TX(pen, x, y, k, 0, () => {
      for (const sd of [-1, 1]) { // tyres (no bob)
        pen.fill(rrectPts(sd * 108 - 32, -122, 64, 122, 16), 'tyre', { seed: 300 + sd, lw: 0 });
        for (let i = 0; i < 4; i++) pen.line([[sd * 108 - 18, -98 + i * 25 + wrap(st.roll * 30, 25)], [sd * 108 + 18, -98 + i * 25 + wrap(st.roll * 30, 25)]], 4, pen.name === 'wood' ? 'white' : 'hub', { pencil: false });
      }
      TX(pen, 0, bob, 1, 0, () => {
        pen.fill([[-14, -440], [14, -440], [8, -560], [-8, -560]], 'body', { seed: 301 });
        for (const sd of [-1, 1]) {
          const Wg = [[sd * 150, -270], [sd * 626, -280], [sd * 632, -244], [sd * 150, -226]];
          pen.fill(sd < 0 ? Wg : Wg.slice().reverse(), 'body', { seed: 310 + sd, lw: 7 });
          pen.fill([[sd * 590, -279], [sd * 630, -280], [sd * 632, -244], [sd * 592, -245]], 'accent', { seed: 315 + sd, lw: 0, pencil: false, rim: 2 });
          for (const [j, ex] of [[0, 300], [1, 465]]) {
            const cx = sd * ex, cy = -250;
            pen.fill(circPts(cx, cy + 4, 44, 44, 22), 'body', { seed: 320 + j + sd * 5, lw: 6, smooth: true });
            pen.fill(circPts(cx, cy + 4, 28, 28, 18), 'dark', { seed: 330 + j + sd * 5, lw: 0, smooth: true });
            if (pen.name === 'wood') { s.save(); s.setLineDash([20, 14]); pathOn(s, circPts(cx, cy, 92, 92, 30)); s.lineWidth = 3.5; s.strokeStyle = CUT; s.stroke(); s.restore(); }
            else if (pen.name === 'gouache') pen.pencil(circPts(cx, cy, 92, 92, 26), true, true, 340 + j, 1.6, .4);
            else { s.save(); s.globalAlpha = .45; pen.fill(circPts(cx, cy, 92, 92, 26), 'white', { seed: 345 + j, smooth: true, shadow: .2, rim: 0 }); s.restore(); }
            for (let i = 0; i < 2; i++) { const a = spin * sd + i * Math.PI + ex; const tip = [cx + Math.cos(a) * 92, cy + Math.sin(a) * 92], nx = -Math.sin(a) * 10, ny = Math.cos(a) * 10;
              pen.fill([[cx + nx, cy + ny], tip, [cx - nx, cy - ny]], 'dark', { seed: 350 + i, lw: 0, pencil: false, rim: 2, shadow: .3 }); }
            pen.dotp(cx, cy, 10, 'dark', { seed: 360 });
          }
        }
        const body = circPts(0, -262, 190, 190, 36);
        pen.fill(body, 'body', { smooth: true, seed: 370, shade: true, amt: 2, maskCol: '#5e5e5e' });
        pen.fill([[-186, -240], [186, -240], [182, -212], [-182, -212]], 'accent', { seed: 371, lw: 0, pencil: false, rim: 3, shadow: .4 });
        pen.fill([[-118, -404], [118, -404], [160, -300], [-160, -300]], 'glass', { seed: 372, lw: 7 });
        for (const sd of [-1, 1]) eye(pen, sd * 70, -350, 54, 42, { look, lid }, sd > 0 ? 1 : 0);
        for (const sd of [-1, 1]) { const by = -420 - brow[0] * 16, ti = brow[1] * 12; pen.line(quadPts([sd * 26, by + (sd > 0 ? ti : ti)], [sd * 70, by - 14], [sd * 116, by - ti * .3], 6), 12, pen.name === 'wood' ? 'white' : 'dark', { ink: true, pencil: false }); }
        MO = 80; mouth(pen, [-66, -170], [66, -170], [0, -152], open, 1.2);
        pen.dotp(0, -236, 44, 'dark', { seed: 380 });
        pen.line(arcPts(0, -236, 27, 27, -2.6, -1.6, 6), 7, 'white', { ink: true, pencil: false });
      });
    });
  }
  return { side, front };
})();

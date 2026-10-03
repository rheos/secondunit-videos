// HIM, rotoscoped. The same stubby 1950s propeller airliner as every other look (geometry follows the
// hybrid take): windscreen eyes, his own rounded nose cone (no ball nose, no chin; see v1/FACE.md), red cheat line, two engines per wing, car tyres,
// wings LEVEL with the body. Drawn with the roto kit, so his fill, shadow and ink layers each float on
// their own, and the acid passes can pull those layers apart (st.split).
// Local units: origin on the road under his middle, +x forward (he faces right), y up is negative.
const AP = {
  body: [42, 22, 88], bodySh: [222, 14, 66], red: [356, 66, 46], glass: [200, 30, 34], dark: [240, 12, 14],
  tyre: [240, 8, 16], hub: [210, 8, 66], white: [40, 30, 96],
};
const PC = (k, dl = 0, a = 1) => { const [h, sa, l] = AP[k]; return hsl(h, sa, l + dl, a); };
const PL = (() => {
  const FUSE = [[292, -170], [276, -236], [200, -276], [60, -283], [-110, -271], [-250, -251], [-345, -243], [-360, -214], [-302, -183], [-232, -136], [-110, -100], [60, -92], [200, -90], [274, -114]];
  const FIN = [[-225, -246], [-290, -410], [-356, -416], [-364, -238]];
  const STAB = [[-250, -210], [-322, -214], [-392, -176], [-344, -168]];
  const CHEAT = [[-300, -207], [150, -171], [214, -158], [150, -147], [-300, -187]];
  const WING = [[90, -166], [-150, -168], [-240, -124], [4, -120]];
  const SCREEN = [[128, -272], [268, -263], [279, -190], [132, -183]];
  const EYES = [[168, -228, 29, 37], [231, -224, 27, 35]];
  const ell = (cx, cy, rx, ry, n = 14) => [...Array(n)].map((_, i) => [cx + Math.cos(i / n * TAU) * rx, cy + Math.sin(i / n * TAU) * ry]);
  // split: the layers come apart. 0 = together. Each sub-part gets its own extra drift.
  let SPL = 0, K = 1, OUT = null; // OUT: outline-only colour (echoes), no fills at all
  const pp = (P, o) => {
    const extra = SPL ? drift(o.seed * 3 + 1, SPL * 60 / K, .5) : [0, 0];
    const oo = { wob: 1 / K, reg: 1 / K, inkW: (o.iw ?? 1) / K, ...o };
    if (OUT) { delete oo.fill; delete oo.shade; oo.ink = true; oo.inkCol = OUT; oo.inkW = 1.4 / K; }
    return part(SPL ? add(P, extra) : P, oo);
  };
  const dot_ = (x, y, r, c) => { if (!OUT) dot(x, y, r, c); };
  const line_ = (P, c, w) => { if (!OUT) line(P, c, w); };
  const poly_ = (P, c) => { if (OUT) line([...P, P[0]], OUT, 1.4 / K); else poly(P, c); };
  function eye(cx, cy, rx, ry, st, i) {
    const { look = [.5, .1], lid = 0 } = st;
    pp(ell(cx, cy, rx, ry), { fill: PC('white'), shade: hsl(210, 20, 80), shadeShift: [4, 6], seed: 40 + i, iw: .8, hatch: false, wob: .4 / K, reg: .5 / K });
    const px = cx + clamp(look[0], -1, 1) * rx * .42, py = cy + clamp(look[1], -1, 1) * ry * .5;
    dot_(px, py, rx * .5, PC('dark')); dot_(px - rx * .17, py - ry * .17, rx * .15, PC('white'));
    if (lid > .02 && !OUT) { const ly = cy - ry + lid * ry * 2; part([[cx - rx - 4, cy - ry - 6], [cx + rx + 4, cy - ry - 6], [cx + rx + 4, ly], [cx, ly + 8], [cx - rx - 4, ly]], { fill: PC('glass'), seed: 45 + i, ink: false, sharp: 12, wob: .4 / K, reg: .4 / K }); }
  }
  function tyre(cx, cy, r, ang, seed) {
    pp(ell(cx, cy, r, r, 16), { fill: PC('tyre'), seed, iw: .9, hatch: false });
    pp(ell(cx, cy, r * .5, r * .5, 10), { fill: PC('hub'), shade: PC('hub', -18), shadeShift: [6, -6], seed: seed + 1, iw: .6, hatch: false });
    for (let i = 0; i < 4; i++) { const a = ang + i * TAU / 4; line_([[cx + Math.cos(a) * r * .12, cy + Math.sin(a) * r * .12], [cx + Math.cos(a) * r * .44, cy + Math.sin(a) * r * .44]], PC('dark'), 4 / K + 2); }
  }
  function prop(cx, cy, R, spin, seed, flat = .28) {
    if (!OUT) { s.save(); s.globalAlpha *= .4; s.fillStyle = PC('white'); s.beginPath(); s.ellipse(cx, cy, R * flat, R, 0, 0, TAU); s.fill(); s.restore(); }
    s.save(); s.globalAlpha *= OUT ? 1 : .55; s.strokeStyle = OUT || PC('dark'); s.lineWidth = 1.6 / K + 1; s.beginPath(); s.ellipse(cx, cy, R * flat, R, 0, 0, TAU); s.stroke(); s.restore();
    for (let i = 0; i < 2; i++) { const a = spin + i * Math.PI, tip = [cx + Math.sin(a) * R * flat, cy + Math.cos(a) * R]; poly_([[cx - 6, cy], [lerp(cx, tip[0], .5) - 8, lerp(cy, tip[1], .5)], tip, [lerp(cx, tip[0], .5) + 8, lerp(cy, tip[1], .5)], [cx + 6, cy]], PC('dark')); }
    dot_(cx + 3, cy, R * .16, PC('dark'));
  }
  function mouth(L, R, up, open) {
    if (open < .07) { stroke([L, [up[0], up[1] + 6], R], 88, 1.1 / K, { force: true, col: OUT || PC('dark') }); return; }
    const dn = up[1] + 46 * open;
    if (OUT) return;
    part([L, up, R, [up[0], dn]], { fill: hsl(355, 40, 22), seed: 89, seg: 4, inkW: .8 / K, wob: .4 / K, reg: .4 / K });
  }
  // st: { open, look, lid, brow, spin, roll, hang (tyres drop), split, eyesOnly }
  function side(x, y, k, ang, st = {}) {
    const { open = 0, brow = 0, spin = T * 40, roll = 0, hang = 0 } = st;
    SPL = st.split || 0; K = k; OUT = st.outline || null;
    withT(() => {
      s.translate(x, y); s.rotate(ang); s.scale(k, k);
      pp(FIN, { fill: PC('body'), shade: PC('bodySh'), shadeShift: [10, 10], seed: 11, sharp: 30 });
      if (!OUT) part([[-300, -398], [-352, -404], [-357, -372], [-308, -368]], { fill: PC('red'), seed: 17, ink: false, sharp: 20, wob: .5 / k, reg: .5 / k });
      // tyres hang below on their struts when he is off the ground
      const dh = hang * 30;
      for (const [i, tx] of [120, -175].entries()) {
        if (hang > .02) line_([[tx, -100], [tx, -52 + dh]], PC('dark'), 9);
        tyre(tx + snoise(T * 1.3, 61 + i) * hang * 5, -52 + dh, 52, roll + i, 60 + i * 7);
      }
      pp(FUSE, { fill: PC('body'), shade: PC('bodySh'), shadeShift: [0, 24], seed: 12 });
      pp(CHEAT, { fill: PC('red'), seed: 13, sharp: 40, iw: .6, hatch: false });
      for (let i = 0; i < 5; i++) pp(ell(-244 + i * 58, -214, 14, 14, 10), { fill: PC('glass', 20), seed: 20 + i, iw: .6, hatch: false, wob: .25 / K, reg: .5 / K });
      pp(STAB, { fill: PC('body'), shade: PC('bodySh'), seed: 14, sharp: 30 });
      pp(SCREEN, { fill: PC('glass'), seed: 15, sharp: 30, iw: 1.1 });
      for (const [i, tx] of [120, -175].entries()) { // fenders
        const P = []; for (let j = 0; j <= 10; j++) { const a = Math.PI * (1.04 + .92 * j / 10); P.push([tx + Math.cos(a) * 72, -52 + Math.sin(a) * 72]); }
        for (let j = 10; j >= 0; j--) { const a = Math.PI * (1.04 + .92 * j / 10); P.push([tx + Math.cos(a) * 60, -52 + Math.sin(a) * 60]); }
        pp(P, { fill: PC('dark'), seed: 70 + i, dense: true, iw: .6 });
      }
      EYES.forEach(([ex, ey, rx, ry], i) => eye(ex, ey, rx, ry, st, i));
      EYES.forEach(([ex, ey, , ry], i) => { const by = ey - ry - 18 - brow * 14; stroke([[ex - 24, by + 3], [ex, by - 6], [ex + 24, by + 3]], 30 + i, 2 / k, { force: true, col: OUT || PC('dark') }); });
      // the nose is his own nose cone: a faint radome tint on the tip, and the mouth drawn on its lower curve
      if (!OUT) part([[281, -214], [291, -184], [292, -162], [285, -134], [276, -122], [281, -150], [283, -180]], { fill: PC('body', -7), seed: 81, ink: false, wob: .3 / K, reg: .4 / K });
      mouth([214, -150], [270, -150], [244, -141], open);
      pp(WING, { fill: PC('body'), shade: PC('bodySh'), shadeShift: [0, 14], seed: 16, sharp: 40, iw: 1.1 });
      for (const [j, ex] of [[0, 16], [1, -128]]) {
        const ey = -142 - j * 2;
        pp([[ex + 78, ey], [ex + 60, ey - 24], [ex - 54, ey - 21], [ex - 80, ey], [ex - 54, ey + 21], [ex + 60, ey + 24]], { fill: PC('body'), shade: PC('bodySh'), shadeShift: [0, 10], seed: 90 + j });
        prop(ex + 86, ey, 66, spin + j * 1.3, 100 + j * 10);
      }
    });
    SPL = 0; OUT = null;
  }
  // head on (wings straight out, far wider than a lane)
  function front(x, y, k, ang, st = {}) {
    const { open = 0, brow = 0, spin = T * 40, hang = 0 } = st;
    SPL = st.split || 0; K = k; OUT = st.outline || null;
    withT(() => {
      s.translate(x, y); s.rotate(ang); s.scale(k, k);
      for (const sd of [-1, 1]) { line_([[sd * 108, -150], [sd * 108, -90 + hang * 30]], PC('dark'), 10); pp([[sd * 108 - 30, -122 + hang * 30], [sd * 108 + 30, -122 + hang * 30], [sd * 108 + 30, hang * 30], [sd * 108 - 30, hang * 30]], { fill: PC('tyre'), seed: 300 + sd, sharp: 20, iw: .8 }); }
      pp([[-14, -440], [14, -440], [8, -560], [-8, -560]], { fill: PC('body'), shade: PC('bodySh'), seed: 301, sharp: 25 });
      pp([[-8, -560], [8, -560], [9, -520], [-9, -520]], { fill: PC('red'), seed: 302, sharp: 12, iw: .5 });
      for (const sd of [-1, 1]) {
        pp([[sd * 150, -272], [sd * 626, -282], [sd * 632, -244], [sd * 150, -226]], { fill: PC('body'), shade: PC('bodySh'), shadeShift: [0, 12], seed: 310 + sd, sharp: 40 });
        pp([[sd * 592, -281], [sd * 630, -282], [sd * 632, -244], [sd * 594, -245]], { fill: PC('red'), seed: 315 + sd, sharp: 15, iw: .5 });
        for (const [j, ex] of [[0, 300], [1, 465]]) {
          const cx = sd * ex, cy = -250;
          pp(ell(cx, cy + 4, 44, 44, 14), { fill: PC('body'), shade: PC('bodySh'), shadeShift: [6, 8], seed: 320 + j + sd * 5 });
          pp(ell(cx, cy + 4, 27, 27, 12), { fill: PC('dark'), seed: 330 + j + sd * 5, iw: .5 });
          if (!OUT) { s.save(); s.globalAlpha *= .35; dot(cx, cy, 92, PC('white')); s.restore(); }
          s.save(); s.globalAlpha *= OUT ? 1 : .5; s.strokeStyle = OUT || PC('dark'); s.lineWidth = 2.5; s.beginPath(); s.arc(cx, cy, 92, 0, TAU); s.stroke(); s.restore();
          for (let i = 0; i < 2; i++) { const a = spin * sd + i * Math.PI + ex, tip = [cx + Math.cos(a) * 92, cy + Math.sin(a) * 92], nx = -Math.sin(a) * 10, ny = Math.cos(a) * 10; poly_([[cx + nx, cy + ny], tip, [cx - nx, cy - ny]], PC('dark')); }
          dot_(cx, cy, 10, PC('dark'));
        }
      }
      pp(ell(0, -262, 190, 190, 20), { fill: PC('body'), shade: PC('bodySh'), shadeShift: [-18, 22], seed: 370 });
      for (const sd of [-1, 1]) pp([[sd * 188, -242], [sd * 118, -240], [sd * 116, -214], [sd * 184, -212]], { fill: PC('red'), seed: 371 + sd, sharp: 20, iw: .6, hatch: false }); // cheat line on the flanks, not across his face
      if (!OUT) part(ell(0, -232, 70, 60, 16), { fill: PC('body', -3.5), seed: 381, ink: false, wob: .3 / K, reg: .4 / K }); // radome tint, no ball
      pp([[-118, -404], [118, -404], [160, -300], [-160, -300]], { fill: PC('glass'), seed: 372, sharp: 30, iw: 1.1 });
      for (const sd of [-1, 1]) eye(sd * 70, -350, 52, 40, st, sd > 0 ? 1 : 0);
      for (const sd of [-1, 1]) { const by = -414 - brow * 16; stroke([[sd * 28, by + 4], [sd * 70, by - 12], [sd * 114, by + 2]], 380 + sd, 2.4 / k, { force: true, col: OUT || PC('dark') }); }
      mouth([-58, -150], [58, -150], [0, -134], open);
    });
    SPL = 0; OUT = null;
  }
  return { side, front, prop: (x, y, R, spin, k = 1) => { K = k; prop(x, y, R, spin, 500); }, eye: (x, y, k, st) => { K = k; withT(() => { s.translate(x, y); s.scale(k, k); eye(0, 0, 60, 46, st, 7); }); } };
})();

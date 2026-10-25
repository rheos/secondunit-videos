// First Night Out, scene 2: the creek by moonlight. 3 bars at 80 BPM (9 s, 24 fps); every frame a pure function of t.
// The parent stands on a flat rock at the water and washes a crayfish; the kit, on a lower rock in front, copies every
// move a beat late (0.75 s), but where the parent lifts the crayfish to look at it the kit's paws come up empty and
// slap back into the water: a splash, a flinch, a head shake, then it goes back to washing nothing, still a beat late.
//   0.0 - 0.8   the parent sniffs the water            4.6         the kit's slap: splash; the parent flinches
//   0.8 - 1.4   both paws down into the creek          4.9 - 5.8   the kit shakes its head
//   1.4 - 3.1   washing; the crayfish turns up         5.6 - 6.1   the parent puts the crayfish back in the water
//   3.1 - 5.6   lifted up to look at it                6.1 - 9.0   washing again; the kit copies; fireflies
// SCENES.creek(Q) builds it (js/scene.js renders it); creek.html shows it alone.
// The look is the night-paper and bloom test for the film: the moon, its reflection broken across every layer of the
// water, the fireflies and the splash are the bright paper the bloom works on.
// Planes after paper-fox's depth bands (sky 20000 ... lens 470); water is stacked bands, each nearer band starting
// lower in frame and flowing at its own speed.
SCENES.creek = (Q) => {
  const { clamp, lerp, ss, E, RNG, noise, sprite, tear, polyPath, smoothPath, ellipsePts, ridge, cutp, glow } = PD;
  const H = FOREST.H, LT = [-.5, -.85];

  // ---------------- timeline ----------------
  const END = 9, LAG = .75, SC = 1.35, TS = 4.6;
  const PX = 1100, PG = 932, KX = 430, KG = 976;      // the parent's hip x and the top of its rock; the kit's
  const WLA = 950, WLB = 996;                          // the water's surface in front of each rock
  const MOON = [880, 150, 86];
  const washAt = (t) => ss(.8, 1.4, t);
  const liftAt = (t) => ss(3.1, 3.6, t) - ss(5.6, 6.1, t);
  const rubAt = (t) => (ss(1.3, 1.6, t) - ss(3, 3.2, t)) + (ss(6.1, 6.4, t) - ss(8.4, 8.8, t));
  const sniffAt = (t) => .7 * (1 - ss(.6, .9, t)) + ss(3.7, 3.9, t) - ss(4.5, 4.7, t);
  function parentState(t) {
    return { d: PX / SC, t, walk: 0, depth: 30, wash: washAt(t), lift: liftAt(t), rub: rubAt(t), hold: ss(2.5, 2.7, t), sniff: sniffAt(t),
      look: -.16 * (ss(4.7, 5, t) - ss(5.5, 5.9, t)) + .08 * (1 - ss(.6, .9, t)), flinch: ss(TS, TS + .08, t) * (1 - ss(TS + .5, TS + 1, t)) };
  }
  // the kit: the parent's curves a beat late, except that its lift collapses into a slap and it stops to shake its head
  function kitState(t) {
    const tk = t - LAG;
    return { d: KX / SC, t: t + 1.7, walk: 0, depth: 36, wash: washAt(tk), lift: liftAt(tk) * (1 - ss(TS - .18, TS - .02, t)),
      dip: 12 * ss(TS - .12, TS, t) * (1 - ss(TS + .3, TS + .8, t)), rub: rubAt(tk) * (1 - (ss(TS, TS + .05, t) - ss(6.6, 6.9, t))),
      sniff: sniffAt(tk) * (t < TS ? 1 : 0), shake: ss(TS + .3, TS + .45, t) - ss(TS + 1, TS + 1.2, t),
      look: -.2 * (ss(5.9, 6.3, t) - ss(7.2, 7.6, t)) + .08 * (1 - ss(1.35, 1.65, t)) };
  }
  // the camera eases in a little over the scene
  const cam = (t) => { const k = E.sine(t / END); return { x: 30 * k, y: -10 * k, z: 70 * k, roll: .0008 * noise('cam').n1(t * .1 + 4) }; };

  // ---------------- build ----------------
  const parent = RAC.make('parent'), kit = RAC.make('kit');
  parent.build(Q * SC * 1.25, LT); kit.build(Q * SC * 1.25, LT);
  parent.setGait(PX / SC, PX / SC, 1); kit.setGait(KX / SC, KX / SC, 1);

  const X0 = -420, X1 = 2340;
  const mk = (name, y0, y1, res, draw, o = {}) => sprite({ x: o.x0 ?? X0, y: y0, w: (o.x1 ?? X1) - (o.x0 ?? X0), h: y1 - y0, res: Q * res, seed: name, light: LT, mat: o.mat ?? 'paper', edge: o.edge, shadow: o.shadow ?? { blur: 12 }, draw: (g) => draw(g, new RNG('creek:' + name)) });
  // a tileable sheet of flowing water: torn strips of a few blues and the odd pale highlight line, wrapped at WS
  const WS = 2400;
  function waterSheet(name, y0, y1, cols, { step = [7, 16], len = [90, 420], thick = [3, 8], hi = .35 } = {}) {
    return sprite({ x: 0, y: y0 - 10, w: WS, h: y1 - y0 + 20, res: Q * 1.05, seed: name, light: LT, mat: 'smooth', edge: { width: 1.4, hi: .25, lo: .2 }, shadow: false, draw(g) {
      const R = new RNG('sheet:' + name);
      for (let y = y0; y < y1; y += R.range(...step)) {
        const k = (y - y0) / (y1 - y0);
        for (let x = R.range(0, 200); x < WS; x += R.range(150, 520)) {
          const L = R.range(...len) * (.6 + .6 * k), th = R.range(...thick) * (.6 + .7 * k), col = R.pick(cols), sd = R.int(1, 1e6);
          for (const ox of [-WS, 0, WS]) {
            g.fillStyle = col; g.fill(polyPath(tear([[x + ox, y], [x + ox + L * .5, y - th * .4], [x + ox + L, y], [x + ox + L * .5, y + th]], { amp: 1.2, freq: .08, seed: sd })));
            if (R.chance(hi)) { g.fillStyle = 'rgba(190,206,245,.45)'; g.fill(polyPath(tear([[x + ox + L * .1, y - 1], [x + ox + L * .7, y - 2], [x + ox + L * .75, y], [x + ox + L * .1, y + .6]], { amp: .6, freq: .1, seed: sd + 1 }))); }
          }
        }
      }
    } });
  }
  const flowing = (sheet, speed) => (g, t) => { const off = ((t * speed) % WS + WS) % WS; for (let k = 0; k < 3; k++) { g.save(); g.translate(X0 - off + k * WS, 0); PD.drawPaper(g, sheet); g.restore(); } };
  // the moon on the water: a column of broken cream strips, wider and looser toward the viewer
  function reflection(g, t, y0, y1, gain = 1) {
    const nz = noise('refl');
    let i = 0;
    for (let y = y0 + 4; y < y1; y += 7 + (y - y0) * .06 + 4 * Math.abs(nz.n2(i * .7, 3)), i++) {
      const k = (y - y0) / Math.max(1, y1 - y0), w = (16 + 34 * k) * gain * (.55 + .8 * Math.abs(nz.n2(i * .9, t * .9)));
      if (w < 5 || nz.n2(i * 1.3, t * .7) < -.5) continue;                            // the odd gap where the water breaks it
      const dx = 14 * nz.n2(i * .5 + 7, t * .6), th = 2 + 3 * k, cx = MOON[0] + dx;
      g.fillStyle = `rgba(255,242,210,${.75 + .25 * Math.abs(nz.n2(i * .3, t * 1.5))})`;
      g.fill(polyPath([[cx - w, y + th * .5], [cx - w * .3, y - th * .4], [cx + w * .4, y - th * .2], [cx + w, y + th * .4], [cx + w * .2, y + th]]));
    }
    glow(g, MOON[0], (y0 + y1) / 2, Math.max(60, (y1 - y0) * .8), `rgba(255,232,180,${.26 * gain})`);
  }
  // rings spreading from a paw in the water, while it is in
  function rings(g, t, x, y, on) {
    if (on <= 0) return;
    g.save(); g.lineWidth = 2;
    for (let i = 0; i < 3; i++) { const f = (t * 1.2 + i / 3) % 1; g.strokeStyle = `rgba(215,228,255,${.55 * (1 - f) * on})`; g.beginPath(); g.ellipse(x, y + 2, 10 + 52 * f, (10 + 52 * f) * .22, 0, 0, 7); g.stroke(); }
    g.restore();
  }

  const planes = [];
  // sky, stars, the moon and its glow
  planes.push({ name: 'sky', z: 20000, sprites: [{ s: mk('sky', -80, 1100, .7, (g, R) => {
    const gr = g.createLinearGradient(0, -80, 0, 760); gr.addColorStop(0, '#070b24'); gr.addColorStop(.7, '#152054'); gr.addColorStop(1, '#2a3876');
    g.fillStyle = gr; g.fillRect(X0, -80, X1 - X0, 1180);
    for (let i = 0; i < 520; i++) { g.fillStyle = `rgba(255,238,200,${R.range(.25, .8)})`; g.beginPath(); g.arc(R.range(X0, X1), R.range(-60, 620), R.range(.5, 1.7), 0, 7); g.fill(); }
    for (let i = 0; i < 22; i++) cutp(g, H.star4(R.range(X0, X1), R.range(20, 480), R.range(7, 16)), '#f0c96a', { light: LT, sh: .5, blur: 3, dist: 2, bev: { width: 1.2, hi: .35 } });
  }, { mat: 'sky', shadow: false }), shadow: false }, { s: mk('moon', MOON[1] - 110, MOON[1] + 110, 1, (g) => {
    const [mx, my, r] = MOON, p = polyPath(tear(ellipsePts(mx, my, r, r, 64), { amp: 1.5, freq: .08, seed: 3 }));
    cutp(g, p, '#f3e8c9', { light: LT, blur: 8, dist: 4, bev: { width: 2, hi: .35 } });
    for (const [dx, dy, rr] of [[20, -18, 17], [-28, 24, 11], [34, 31, 8], [-10, -38, 7]]) { g.fillStyle = 'rgba(180,160,120,.22)'; g.fill(polyPath(tear(ellipsePts(mx + dx, my + dy, rr, rr, 18), { amp: 1.2, seed: rr }))); }
    H.form(g, p, { w: 7, steps: 2, lit: 'rgba(255,255,240,.2)', shade: 'rgba(120,100,60,.14)' });
  }, { mat: 'crumpled', shadow: false, x0: MOON[0] - 120, x1: MOON[0] + 120 }), shadow: false }], draw(g) { glow(g, MOON[0], MOON[1], 300, 'rgba(255,236,190,.42)'); } });
  planes.push({ name: 'clouds', z: 12000, sprites: [{ s: mk('clouds', 40, 420, .8, (g, R) => {
    H.puffBank(g, 360, 1020, 262, 112, R);
    H.puffBank(g, 1380, 1920, 190, 80, R);
    H.puffBank(g, -300, 120, 330, 70, R);
  }, { mat: 'sky' }) }] });
  planes.push({ name: 'peaks', z: 7000, sprites: [{ s: mk('peaks', 300, 760, .8, (g, R) => {
    const pts = ridge(X0, X1, 610, 760, { amp: 190, freq: .0026, sharp: .8, seed: 33, step: 10 }), path = polyPath(tear(pts, { amp: 1.5, freq: .05, seed: 33 }));
    cutp(g, path, '#4a5292', { light: LT, blur: 8, dist: 4 });
    g.save(); g.clip(path);
    const top = pts.slice(0, -2);
    for (let i = 2; i < top.length - 2; i++) {
      if (!(top[i][1] < top[i - 1][1] && top[i][1] <= top[i + 1][1]) || top[i][1] > 540) continue;
      const [px, py] = top[i], dep = (580 - py) * .55, snow = [[px - dep * 1.1, py + dep], [px, py - 2], [px + dep * 1.1, py + dep]];
      for (let j = 1; j < 7; j++) snow.push([px + dep * 1.1 - j * dep * 2.2 / 7, py + dep * (j & 1 ? .55 : .95) + R.range(-6, 6)]);
      g.fillStyle = '#d6d8ef'; g.fill(polyPath(snow));
      g.fillStyle = 'rgba(70,75,140,.45)'; g.fill(polyPath([[px, py - 2], [px + dep * 1.1, py + dep], [px + dep * .2, py + dep * .8]]));
    }
    g.restore();
    H.haze(g, X0, 300, X1 - X0, 460, 'rgba(60,72,140,A)', 0, .75);
  }, { mat: 'crumpled' }) }] });
  planes.push({ name: 'farwood', z: 4200, sprites: [{ s: mk('farwood', 520, 740, .8, (g, R) => {
    const pts = ridge(X0, X1, 670, 740, { amp: 40, freq: .003, sharp: .1, seed: 43 });
    cutp(g, polyPath(tear(pts, { amp: 2, freq: .05, seed: 43 })), '#18374a', { light: LT, blur: 5, dist: 3 });
    for (let x = X0; x < X1; x += R.range(12, 26)) H.pine(g, x, pts[Math.min(pts.length - 3, Math.max(0, Math.round((x - X0) / 8)))][1] + 8, R.range(36, 76), ['#15374a', '#1b4253', '#214e5c'], R, { sh: .5 });
    H.haze(g, X0, 520, X1 - X0, 220, 'rgba(62,80,140,A)', .25, .6);
  }) }] });
  // the far bank: big cedars and pines over bushes and ferns, a mossy lip and the dark wet band where it meets the water
  planes.push({ name: 'farbank', z: 2400, sprites: [{ s: mk('farbank', -60, 760, 1, (g, R) => {
    cutp(g, polyPath(tear([[X0, 690], [X1, 686], [X1, 760], [X0, 760]], { amp: 3, freq: .03, seed: 51 })), '#13252c', { light: LT, blur: 4, dist: 2 });
    for (let x = X0 + R.range(0, 120); x < X1; x += R.range(150, 330)) {
      if (R.chance(.45)) H.cedar(g, x, 700, R.range(520, 820), R);
      else H.pine(g, x, 700, R.range(260, 480), ['#153630', '#1c4538', '#245240'], R);
    }
    for (let x = X0; x < X1; x += R.range(70, 150)) { if (R.chance(.55)) H.bush(g, x, 702, R.range(110, 210), R.range(60, 110), R); else for (let i = 0; i < 5; i++) H.fern(g, x, 700, R.range(60, 100), -Math.PI / 2 + R.range(-1.2, 1.2), R); }
    const lip = []; for (let x = X0; x <= X1; x += 40) lip.push([x, 696 + 7 * Math.sin(x * .011) + R.range(-3, 3)]);
    cutp(g, polyPath(tear([...lip, [X1, 712], [X0, 714]], { amp: 3, freq: .05, seed: 52 })), '#2f5631', { light: LT, blur: 3, dist: 2 });
    for (let x = X0; x < X1; x += R.range(180, 380)) H.rock(g, x, 712, R.range(60, 120), R.range(26, 44), R);
    g.fillStyle = '#0d1820'; g.fill(polyPath(tear([[X0, 706], [X1, 704], [X1, 716], [X0, 718]], { amp: 2, freq: .06, seed: 53 })));
    H.haze(g, X0, -60, X1 - X0, 820, 'rgba(40,55,110,A)', .14, .26);
  }) }] });
  // the creek, far: deep blue sheet under slow strips, the moon's long reflection, mist drifting low
  const farSheet = waterSheet('far', 712, 900, ['#1a2a62', '#22346f', '#15224f'], { step: [5, 10], len: [60, 240], thick: [2, 5], hi: .25 });
  planes.push({ name: 'farwater', z: 1900, sprites: [{ s: mk('farwater', 700, 1100, .9, (g) => {
    const gr = g.createLinearGradient(0, 700, 0, 1000); gr.addColorStop(0, '#0f1946'); gr.addColorStop(1, '#16245a');
    g.fillStyle = gr; g.fill(polyPath(tear([[X0, 708], [X1, 706], [X1, 1100], [X0, 1100]], { amp: 2, freq: .04, seed: 61 })));
  }, { shadow: false }), shadow: false }], draw(g, t) {
    flowing(farSheet, 14)(g, t);
    // the bank's trees reflected: dark inverted teeth, broken by the flow
    g.save(); const RR = new RNG('treerefl'); g.fillStyle = 'rgba(6,12,30,.55)';
    for (let x = X0; x < X1; x += RR.range(60, 160)) { const hh = RR.range(60, 150), w = hh * .35, j = 4 * Math.sin(t * 1.5 + x); g.fill(polyPath([[x - w + j, 712], [x + w + j, 712], [x + j * 2, 712 + hh]])); }
    g.restore();
    reflection(g, t, 712, 900, .8);
    const nz = noise('mist');
    for (let i = 0; i < 4; i++) { const x = ((i * 700 + t * 18) % 2800) - 500; g.fillStyle = 'rgba(160,172,220,.14)'; g.fill(polyPath(tear([[x, 722 + i * 9], [x + 620, 718 + i * 9], [x + 640, 740 + i * 9], [x, 744 + i * 9]], { amp: 6 + 2 * nz.n1(i), freq: .01, seed: 70 + i, step: 14 }))); }
  } });
  // stepping stones across the creek with foam piled on their upstream side, and a fallen log off the far bank
  planes.push({ name: 'stones', z: 1400, sprites: [{ s: mk('stones', 600, 900, 1, (g, R) => {
    const log = polyPath(tear([[1480, 742], [2280, 690], [2290, 722], [1500, 800]], { amp: 2.5, freq: .04, seed: 81 }));
    cutp(g, log, '#3e2a22', { light: LT, blur: 6, dist: 4 }); H.form(g, log, { w: 6, steps: 2, lit: 'rgba(255,210,170,.14)', shade: 'rgba(10,0,10,.3)' });
    for (let i = 0; i < 6; i++) cutp(g, polyPath(tear(ellipsePts(1560 + i * 120, 744 - i * 8 - 8, R.range(18, 34), 7, 14), { amp: 1.8, freq: .2, seed: R.int(1, 1e6) })), '#4a7a3a', { light: LT, sh: .5, blur: 2, dist: 1.5 });
    for (let x = -260; x < 2200; x += R.range(150, 300)) {
      const w = R.range(70, 150), y = R.range(842, 876);
      H.rock(g, x, y, w, R.range(34, 60), R);
      for (let j = 0; j < 3; j++) { const fx = x - w * .5 - j * 10, fy = y - 4 + j * 5; g.fillStyle = 'rgba(225,234,255,.75)'; g.fill(polyPath(tear([[fx - 24 - j * 10, fy], [fx + 6, fy - 6], [fx + w * .2, fy + 2], [fx - 10, fy + 4]], { amp: 1.4, freq: .2, seed: R.int(1, 1e6) }))); }
    }
  }) }] });
  const midSheet = waterSheet('mid', 885, 1000, ['#1d2f6b', '#26397a', '#18275c'], { step: [6, 12], len: [80, 300], thick: [3, 6] });
  planes.push({ name: 'midwater', z: 1250, sprites: [{ s: mk('midwater', 870, 1100, 1, (g) => {
    g.fillStyle = '#132050'; g.fill(polyPath(tear([[X0, 880], [X1, 878], [X1, 1100], [X0, 1100]], { amp: 2.5, freq: .04, seed: 91 })));
  }, { shadow: false }), shadow: false }], draw(g, t) { flowing(midSheet, 26)(g, t); reflection(g, t, 882, 960, .9); } });
  // fireflies over the water, drawn live (they blink and drift)
  const flies = [...Array(22)].map((_, i) => { const R = new RNG('cfly' + i); return { x: R.range(-200, 2100), y: R.range(420, 860), ph: R.range(0, 10), sp: R.range(.6, 1.2) }; });
  planes.push({ name: 'flies', z: 1150, draw(g, t) {
    const nz = noise('cflies');
    for (const [i, f] of flies.entries()) {
      const x = f.x + 40 * nz.n2(t * .15 * f.sp, i), y = f.y + 30 * nz.n2(i * 3.1, t * .2 * f.sp), on = ss(.2, .6, .5 + .5 * Math.sin(t * 1.7 * f.sp + f.ph));
      if (on < .02) continue;
      glow(g, x, y, 30, `rgba(255,226,130,${.6 * on})`);
      g.fillStyle = `rgba(255,248,205,${on})`; g.beginPath(); g.arc(x, y, 2.6, 0, 7); g.fill();
    }
  } });
  // the parent's rock: flat top, a lip at the right where it goes into the water, facets, moss, wet dark at the waterline
  const rockSprite = (name, pts, top, R0, hump) => mk(name, top - 110, 1100, 1.1, (g, R) => {
    // a shoulder of the same rock rising behind where the feet stand, so the rock stands out of the water
    const hp = polyPath(tear(hump, { amp: 3, freq: .04, seed: R0 + 7 }));
    cutp(g, hp, '#55525f', { light: LT, blur: 8, dist: 5 });
    g.save(); g.clip(hp); g.fillStyle = '#6a6777'; g.fill(polyPath([hump[0], hump[1], hump[2], [hump[2][0], top]])); g.fillStyle = 'rgba(20,16,30,.35)'; g.fill(polyPath([hump[2], hump[3], hump[4], [hump[2][0], top + 4]])); g.restore();
    for (let i = 0; i < 3; i++) cutp(g, polyPath(tear(ellipsePts(lerp(hump[1][0], hump[3][0], .2 + i * .3), lerp(hump[1][1], hump[2][1], .5) + 4, R.range(18, 34), 7, 14), { amp: 2, freq: .2, seed: R.int(1, 1e6) })), '#4f7f3c', { light: LT, sh: .5, blur: 2, dist: 1.5 });
    const p = polyPath(tear(pts, { amp: 2.5, freq: .04, seed: R0 }));
    cutp(g, p, '#4b4856', { light: LT, blur: 8, dist: 5 });
    g.save(); g.clip(p);
    g.fillStyle = '#5f5c6b'; g.fill(polyPath(tear([[pts[1][0], top - 4], [pts[2][0], top - 4], [pts[2][0] - 40, top + 14], [pts[1][0] + 30, top + 18]], { amp: 2, freq: .05, seed: R0 + 1 })));
    for (let i = 0; i < 5; i++) { const x = R.range(pts[1][0], pts[2][0]); g.fillStyle = 'rgba(20,16,30,.3)'; g.fill(polyPath(tear([[x, top + 16], [x + R.range(30, 80), top + R.range(40, 90)], [x + R.range(-10, 20), 1100], [x - 8, 1100]], { amp: 2, seed: R.int(1, 1e6) }))); }
    g.fillStyle = 'rgba(8,10,24,.45)'; g.fillRect(X0, top + 22, X1 - X0, 200);
    for (let i = 0; i < 900; i++) { g.fillStyle = R.chance(.5) ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.16)'; g.beginPath(); g.arc(R.range(pts[0][0], pts[3][0]), R.range(top - 6, top + 120), R.range(.5, 1.5), 0, 7); g.fill(); }
    g.restore();
    for (let i = 0; i < 6; i++) { const mx = R.range(pts[1][0] + 20, pts[2][0] - 40), mw = R.range(20, 46); cutp(g, polyPath(tear(ellipsePts(mx, top - 1, mw, mw * .2, 16), { amp: 2, freq: .2, seed: R.int(1, 1e6) })), i & 1 ? '#4f7f3c' : '#3f6a34', { light: LT, sh: .5, blur: 2, dist: 1.5, bev: { width: 1 } }); }
  });
  planes.push({ name: 'prock', z: 1000.5, sprites: [{ s: rockSprite('prock', [[470, 1100], [600, PG], [1395, PG], [1470, 1100]], PG, 101, [[560, PG + 4], [640, PG - 58], [760, PG - 74], [900, PG - 40], [960, PG + 4]]) }] });
  const CHAR_P = { name: 'parent', z: 1000 };
  planes.push(CHAR_P);
  // the water in front of the parent's rock: hides the paws under its surface, rings where they go in, foam at the lip
  const sheetA = waterSheet('A', WLA + 4, 1090, ['#21357a', '#2a4288', '#1a2b66'], { step: [7, 14], len: [100, 380], thick: [3, 7] });
  planes.push({ name: 'waterA', z: 990, sprites: [{ s: mk('waterA', WLA - 10, 1100, 1.05, (g, R) => {
    g.fillStyle = '#16245c'; g.fill(polyPath(tear([[X0, WLA], [X1, WLA - 2], [X1, 1100], [X0, 1100]], { amp: 1.6, freq: .05, seed: 111 })));
    for (const fx of [1395, 600]) for (let j = 0; j < 4; j++) { g.fillStyle = 'rgba(225,234,255,.7)'; g.fill(polyPath(tear([[fx - 30 + j * 14, WLA + 2 + j * 4], [fx + 50 + j * 10, WLA + j * 4], [fx + 60 + j * 10, WLA + 4 + j * 4], [fx - 20 + j * 14, WLA + 6 + j * 4]], { amp: 1.2, freq: .2, seed: R.int(1, 1e6) }))); }
  }, { shadow: false }), shadow: false }], draw(g, t, env) {
    flowing(sheetA, 40)(g, t);
    reflection(g, t, WLA, WLB + 6, 1);
    for (const L of FRAME.pp.legs.slice(2)) { const x = L.ankle[0] * SC, y = PG + L.ankle[1] * SC; rings(g, t, x, WLA, ss(WLA - 6, WLA + 8, y)); }
  } });
  planes.push({ name: 'krock', z: 975, sprites: [{ s: rockSprite('krock', [[60, 1100], [190, KG], [605, KG], [660, 1100]], KG, 121, [[110, KG + 4], [150, KG - 44], [230, KG - 56], [300, KG - 30], [340, KG + 4]]) }] });
  const CHAR_K = { name: 'kit', z: 970 };
  planes.push(CHAR_K);
  // the near water: the kit's paws go under it; the splash lives here
  const sheetB = waterSheet('B', WLB + 4, 1100, ['#27408a', '#3150a0', '#1e3274'], { step: [8, 16], len: [120, 460], thick: [4, 9] });
  const SPLASH = [...Array(44)].map((_, i) => { const R = new RNG('drop' + i); return { vx: R.range(-300, 260), vy: R.range(-680, -260), r: R.range(3.5, 10), spin: R.range(-8, 8), pale: R.chance(.6) }; });
  let splashAt = null;
  planes.push({ name: 'waterB', z: 962, sprites: [{ s: mk('waterB', WLB - 10, 1110, 1.1, (g, R) => {
    g.fillStyle = '#1b2c6c'; g.fill(polyPath(tear([[X0, WLB], [X1, WLB - 2], [X1, 1110], [X0, 1110]], { amp: 1.8, freq: .05, seed: 131 })));
    for (let j = 0; j < 4; j++) { const fx = 605; g.fillStyle = 'rgba(225,234,255,.7)'; g.fill(polyPath(tear([[fx - 30 + j * 14, WLB + 2 + j * 4], [fx + 46 + j * 10, WLB + j * 4], [fx + 56 + j * 10, WLB + 4 + j * 4], [fx - 20 + j * 14, WLB + 6 + j * 4]], { amp: 1.2, freq: .2, seed: R.int(1, 1e6) }))); }
  }, { shadow: false }), shadow: false }], draw(g, t) {
    flowing(sheetB, 64)(g, t);
    reflection(g, t, WLB, 1090, 1.15);
    for (const L of FRAME.kp.legs.slice(2)) { const x = L.ankle[0] * SC, y = KG + L.ankle[1] * SC; rings(g, t, x, WLB, ss(WLB - 6, WLB + 6, y)); }
    // the splash: a crown of torn water, paper drops flying and falling, big rings
    const dt = t - TS;
    if (dt > -.02 && dt < 1.3) {
      if (!splashAt) { const ps = kit.pose({ ...kitState(TS), d: KX / SC }); splashAt = [((ps.legs[2].ankle[0] + ps.legs[3].ankle[0]) / 2) * SC, WLB]; }
      const [sx, sy] = splashAt, k = clamp(dt / .35);
      if (dt < .45) {
        const h = 120 * Math.sin(Math.PI * k), crown = [[sx - 70, sy + 4]];
        for (let j = 0; j <= 10; j++) { const u = j / 10; crown.push([sx - 70 + 140 * u, sy - (j & 1 ? h * (.45 + .55 * Math.sin(Math.PI * u)) : h * .15)]); }
        crown.push([sx + 70, sy + 4]);
        g.fillStyle = `rgba(205,222,255,${.85 * (1 - k * .6)})`; g.fill(polyPath(tear(crown, { amp: 1.5, freq: .2, seed: 141 })));
      }
      for (const d of SPLASH) {
        const tt = Math.max(0, dt), x = sx + d.vx * tt, y = sy - 6 + d.vy * tt + 1100 * tt * tt;
        if (y > sy + 4 && tt > .1) continue;
        g.save(); g.translate(x, y); g.rotate(d.spin * tt); g.fillStyle = d.pale ? 'rgba(232,240,255,.95)' : 'rgba(150,180,240,.9)';
        g.fill(polyPath(tear(ellipsePts(0, 0, d.r, d.r * .7, 8), { amp: d.r * .25, freq: .5, seed: Math.round(d.r * 100) }))); g.restore();
      }
      g.save(); g.lineWidth = 2.5;
      for (let i = 0; i < 3; i++) { const f = clamp((dt - i * .12) / 1.1); if (f <= 0) continue; g.strokeStyle = `rgba(220,232,255,${.7 * (1 - f)})`; g.beginPath(); g.ellipse(sx, sy + 3, 20 + 130 * f, (20 + 130 * f) * .2, 0, 0, 7); g.stroke(); }
      g.restore();
    }
  } });
  // near the lens: reeds and skunk cabbage at the edges, cedar sprays hanging in from the top, ferns and a big leaf low
  planes.push({ name: 'near', z: 820, sprites: [{ s: mk('near', 700, 1120, 1.1, (g, R) => {
    for (const [x0, x1] of [[-300, 170], [1760, 2240]]) for (let x = x0; x < x1; x += R.range(18, 40)) {
      const hh = R.range(160, 330), lean = R.range(-.25, .25), w = R.range(5, 9), tip = [x + Math.sin(lean) * hh, 1110 - hh];
      const blade = polyPath([[x - w, 1110], [tip[0] - 1, tip[1] + 8], tip, [x + w, 1110]]);
      cutp(g, blade, R.pick(['#22472f', '#2b5636', '#335f3a']), { light: LT, blur: 4, dist: 3, bev: { width: 1.2 } });
      if (R.chance(.2)) { const cx = tip[0] + R.range(-2, 2), cy = tip[1] + 20; cutp(g, smoothPath(ellipsePts(cx, cy, 5, 16, 12)), '#4a3326', { light: LT, sh: .5 }); }   // a cattail head
    }
    for (const x of [-40, 60, 1880]) for (let i = 0; i < 3; i++) H.bigLeaf(g, x + R.range(-30, 30), 1120, R.range(150, 230), R.range(-.5, .5), R.pick(['#5d7a2e', '#6c8a34', '#4f6c2a']), R);
  }) }] });
  planes.push({ name: 'lens', z: 470, sprites: [{ s: mk('lens', -120, 1200, 1.15, (g, R) => {
    // a cedar bough reaching in from the top right, sprays hanging off it
    const bough = polyPath(tear([[2300, -120], [1500, 40], [1490, 62], [2300, -60]], { amp: 3, freq: .03, seed: 151 }));
    cutp(g, bough, '#2a1a15', { light: LT, blur: 12, dist: 8 });
    // cedar sprays: flat fans hanging off the bough, toothed on both sides, a lighter fan laid over a darker one
    for (let x = 1530; x < 2300; x += R.range(70, 110)) {
      const y0 = lerp(46, -100, (x - 1500) / 800);
      for (const [col, k] of [['#13301d', 1], ['#1d4227', .78]]) {
        const len = R.range(170, 290) * k, wide = len * .42, pts = [[x, y0]], tips = 9;
        for (let j = 0; j <= tips; j++) { const u = j / tips, a = -.9 + 1.8 * u, r = len * (j & 1 ? .82 : 1); pts.push([x + Math.sin(a) * wide * (j & 1 ? .8 : 1) + 10, y0 + Math.cos(a) * r * .9 + 18]); }
        cutp(g, polyPath(tear(pts, { amp: 2, freq: .15, seed: R.int(1, 1e6) })), col, { light: LT, blur: 10, dist: 6, bev: { width: 1.6, hi: .2 } });
      }
    }
    for (let i = 0; i < 5; i++) H.fern(g, -60 + R.range(-30, 30), 1200, R.range(260, 380), -Math.PI / 2 + R.range(-.2, 1.2), R, ['#163a20', '#1d4828', '#25562f']);
    for (let i = 0; i < 3; i++) H.bigLeaf(g, 2000 + R.range(-40, 40), 1200, R.range(220, 320), R.range(-.7, -.1), R.pick(['#173a22', '#1e4628', '#255230']), R);
  }, { shadow: { blur: 20 } }) }] });

  // ---------------- one frame ----------------
  const FRAME = { pp: null, kp: null };
  function prepare(t) {
    const P = parentState(t), K = kitState(t);
    FRAME.pp = parent.pose({ ...P }); FRAME.kp = kit.pose({ ...K });
    CHAR_P.draw = (g) => parent.draw(g, 0, PG, { ...P, d: PX }, { scale: SC, light: LT, shadow: [9, 5] });
    CHAR_K.draw = (g) => kit.draw(g, 0, KG, { ...K, d: KX }, { scale: SC, light: LT, shadow: [8, 4] });
  }
  // meta for the transitions: where the raccoons' heads are, the scene's light, its bright water, its horizon
  return { name: 'creek', END, planes, camera: cam, prepare, background: '#070b24', light: LT, shadowAlpha: .5,
    post: { bloom: .55, threshold: .62, vignette: .32, grain: .05, grade: { color: '#3c4c9a', amount: .12, mode: 'soft-light' } },
    meta: { hero: [PX + 330, PG - 150], light: [MOON[0], MOON[1]], water: [MOON[0], WLB + 34], horizon: 712 },
    parent, kit, parentState, kitState };
};

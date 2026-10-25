// First Night Out, scene 2: the creek by moonlight. 3 bars at 80 BPM (9 s, 24 fps); every frame a pure function of t.
// The parent stands on a perch rock at the water and washes a crayfish; the kit, on a stone in the river below,
// copies every move a beat late (0.75 s), but where the parent lifts the crayfish to look at it the kit's paws come up
// empty and slap back into the water: a splash, a flinch, a head shake, then it goes back to washing nothing.
//   0.0 - 0.8   the parent sniffs the water            4.6         the kit's slap: splash; the parent flinches
//   0.8 - 1.4   both paws down into the creek          4.9 - 5.8   the kit shakes its head
//   1.4 - 3.1   washing; the crayfish turns up         5.6 - 6.1   the parent puts the crayfish back in the water
//   3.1 - 5.6   lifted up to look at it                6.1 - 9.0   washing again; the kit copies; fireflies
// SCENES.creek(Q) builds it (js/scene.js renders it); creek.html shows it alone.
//
// Draft 2 is staged as paper-fox stages every scene (COMPOSITION.md): a high vantage over a vista; the creek a ribbon
// that enters wide at the bottom and winds back to a vanishing point under the moon in the upper right, carrying the
// moon's reflection down toward us; the parent perched at the left third on a rock at the water, facing the light; the
// banks stepping back on diagonals with their pines shrinking toward the vanishing point; a cedar on the left edge,
// the biggest ferns and flowers in the bottom-left corner, rocks and foam bottom right; one slow push in.
// Paws in the water: the creek is drawn behind the raccoons, then drawn again in front of them, clipped to the water
// below each one's waterline round its paws, so the paws go under without the water ever covering a head held over it.
SCENES.creek = (Q) => {
  const { clamp, lerp, ss, E, RNG, noise, sprite, tear, polyPath, smoothPath, ellipsePts, ridge, cutp, glow } = PD;
  const H = FOREST.H, LT = [.5, -.85];

  // ---------------- timeline (the acting is draft 1's, approved) ----------------
  const END = 9, LAG = .75, SC = .9, TS = 4.6;
  const PX = 500, PG = 760, KX = 760, KG = 950;      // the parent's hip x on its perch rock, the rock's top; the kit's on its stone
  const WLP = 786, WLK = 960;                          // where each one's paws go under the water
  const MOON = [1450, 205, 76], HZ = 650;              // the moon; the line where the near ground meets the far lake and hills
  const washAt = (t) => ss(.8, 1.4, t);
  const liftAt = (t) => ss(3.1, 3.6, t) - ss(5.6, 6.1, t);
  const rubAt = (t) => (ss(1.3, 1.6, t) - ss(3, 3.2, t)) + (ss(6.1, 6.4, t) - ss(8.4, 8.8, t));
  const sniffAt = (t) => .7 * (1 - ss(.6, .9, t)) + ss(3.7, 3.9, t) - ss(4.5, 4.7, t);
  function parentState(t) {
    return { d: PX / SC, t, walk: 0, depth: 36, wash: washAt(t), lift: liftAt(t), rub: rubAt(t), hold: ss(2.5, 2.7, t), sniff: sniffAt(t),
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
  // one slow push toward the parent, at rest mid-scene (paper-fox s02: zoom 1.025 either side, a small dolly and drift)
  const cam = (t) => { const u = 2 * E.sine(t / END) - 1; return { x: -14 * u, y: -4 * u, z: 22 * u, zoom: 1.025 ** u, roll: .0006 * noise('cam').n1(t * .1 + 4) }; };

  // ---------------- build ----------------
  H.setLight(LT);
  const parent = RAC.make('parent'), kit = RAC.make('kit');
  parent.build(Q * SC * 1.3, LT); kit.build(Q * SC * 1.3, LT);
  parent.setGait(PX / SC, PX / SC, 1); kit.setGait(KX / SC, KX / SC, 1);
  const X0 = -420, X1 = 2340;
  const mk = (name, y0, y1, res, draw, o = {}) => sprite({ x: o.x0 ?? X0, y: y0, w: (o.x1 ?? X1) - (o.x0 ?? X0), h: y1 - y0, res: Q * res, seed: name, light: LT, mat: o.mat ?? 'paper', edge: o.edge, shadow: o.shadow ?? { blur: 12 }, draw: (g) => draw(g, new RNG('creek:' + name)) });
  // isPointInPath tests device pixels: map an authored point through the sprite's transform first
  const inPath = (g, p, x, y) => { const q = g.getTransform().transformPoint(new DOMPoint(x, y)); return g.isPointInPath(p, q.x, q.y); };
  const depthK = (y) => clamp((y - HZ + 90) / (1080 - HZ + 90));      // 0 far back, 1 at the bottom of frame

  // ---- the creek: a ribbon along a spline, narrow at the vanishing point, wide at the bottom edge ----
  const chaikin = (pts, it) => { for (let k = 0; k < it; k++) { const o = [pts[0]]; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; o.push(a.map((v, j) => v * .75 + b[j] * .25), a.map((v, j) => v * .25 + b[j] * .75)); } o.push(pts[pts.length - 1]); pts = o; } return pts; };
  // it zigzags, as paper-fox's water does: comes out from behind a forest mass, swings left past the perch rock, then
  // across the foreground and out of frame at the right. No vanishing point: its far end is hidden.
  const RS = chaikin([[1240, 690, 30], [1080, 708, 60], [910, 740, 100], [770, 792, 150], [710, 862, 190], [790, 942, 240], [1030, 1004, 290], [1380, 1056, 330], [1780, 1096, 370], [2240, 1118, 400]], 4)
    .map(([x, y, w]) => ({ x, y, w }));
  let L = 0, Sg = 0;
  RS.forEach((p, i) => {
    if (i) { const q = RS[i - 1], d = Math.hypot(p.x - q.x, p.y - q.y); L += d; Sg += d / ((p.w + q.w) / 2); }
    p.L = L; p.sg = Sg;
    const a = RS[Math.max(0, i - 1)], b = RS[Math.min(RS.length - 1, i + 1)], dl = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    p.tx = (b.x - a.x) / dl; p.ty = (b.y - a.y) / dl; p.nx = -p.ty; p.ny = p.tx;            // n points to the left bank
  });
  RS.forEach((p) => { p.s = p.L / L; p.q = p.sg / Sg; });
  // a point on the creek by arc length s (0 far .. 1 near), or by q: the flow coordinate in which strips ride evenly,
  // slow and close where the creek is far and narrow, fast where it is near and wide (paper-fox water-flow.js warp)
  const sample = (key, v) => {
    let i = 1; while (i < RS.length - 1 && RS[i][key] < v) i++;
    const a = RS[i - 1], b = RS[i], f = clamp((v - a[key]) / ((b[key] - a[key]) || 1));
    return { x: lerp(a.x, b.x, f), y: lerp(a.y, b.y, f), w: lerp(a.w, b.w, f), tx: lerp(a.tx, b.tx, f), ty: lerp(a.ty, b.ty, f), nx: lerp(a.nx, b.nx, f), ny: lerp(a.ny, b.ny, f) };
  };
  const EL = RS.map((p) => [p.x + p.nx * p.w / 2, p.y + p.ny * p.w / 2]), ER = RS.map((p) => [p.x - p.nx * p.w / 2, p.y - p.ny * p.w / 2]);
  const RIB = polyPath(tear([...EL, ...ER.slice().reverse()], { amp: 2, freq: .05, seed: 201, step: 5 }));
  const STRIPS = [...Array(440)].map((_, i) => { const R = new RNG('strip' + i); return { q0: R.next(), v: R.range(-.94, .94), len: R.range(.5, 1.6), th: R.range(.5, 1.4), col: R.pick(['#3e78d8', '#5a92ea', '#2a5cbc', '#3368c8', '#76aaf0', '#2550aa']), white: R.chance(.26) }; });
  const nzR = noise('refl');
  // small cascades where the creek steps down: a dark lip, then a torn white band of falling water
  const CASCADES = [.07, .74].map((sc, j) => { const R = new RNG('cascade' + j); return { sc, jit: [...Array(17)].map(() => R.range(.55, 1.15)), seed: R.int(1, 1e6) }; });
  function drawRiver(g, t) {
    const gr = g.createLinearGradient(0, 680, 0, 1100);
    gr.addColorStop(0, '#5c86d8'); gr.addColorStop(.4, '#3466c6'); gr.addColorStop(1, '#1f4898');
    g.save(); g.fillStyle = gr; g.fill(RIB); g.clip(RIB);
    // paper strips riding the flow toward us, longer and thicker where the creek is wide; about a quarter of them
    // long thin white streaks, the way paper-fox cuts moving water
    for (const st of STRIPS) {
      const q = (st.q0 + t * .05) % 1, p = sample('q', q), k = p.w / 100;
      if (p.w < 10) continue;
      const len = st.len * (st.white ? 70 : 46) * k, th = st.white ? st.th * 1.1 * k + .4 : st.th * 3 * k + .5;
      const cx = p.x + p.nx * p.w * .5 * st.v, cy = p.y + p.ny * p.w * .5 * st.v;
      const A = [cx - p.tx * len / 2, cy - p.ty * len / 2], B = [cx + p.tx * len / 2, cy + p.ty * len / 2];
      g.fillStyle = st.white ? 'rgba(236,244,255,.85)' : st.col;
      g.fill(polyPath([A, [cx + p.nx * th * .5, cy + p.ny * th * .5], B, [cx - p.nx * th * .7, cy - p.ny * th * .7]]));
    }
    for (const c of CASCADES) {
      const p = sample('s', c.sc), k = depthK(p.y), h = 8 + 46 * k, lip = [], low = [];
      for (let j = 0; j <= 16; j++) {
        const u = j / 16 * 2 - 1, x = p.x + p.nx * p.w * .55 * u, y = p.y + p.ny * p.w * .55 * u;
        lip.push([x, y]); low.push([x + p.tx * h * c.jit[j] * (1 + .12 * Math.sin(t * 9 + j)), y + p.ty * h * c.jit[j] * (1 + .12 * Math.sin(t * 9 + j))]);
      }
      g.fillStyle = 'rgba(16,40,110,.55)'; g.fill(polyPath([...lip.map(([x, y]) => [x - p.tx * h * .5, y - p.ty * h * .5]), ...lip.slice().reverse()]));
      g.fillStyle = 'rgba(150,190,245,.85)'; g.fill(polyPath(tear([...lip, ...low.slice().reverse()], { amp: 1 + 2 * k, freq: .2, seed: c.seed })));
      g.fillStyle = 'rgba(240,247,255,.95)'; g.fill(polyPath(tear([...lip.map(([x, y]) => [x + p.tx * h * .15, y + p.ty * h * .15]), ...low.map(([x, y], j) => [x - p.tx * h * .25 * c.jit[j], y - p.ty * h * .25 * c.jit[j]]).reverse()], { amp: 1.4 + 3 * k, freq: .25, seed: c.seed + 1 })));
      for (let j = 0; j < 9; j++) { const u = j / 8 * 2 - 1, x = low[j * 2][0], y = low[j * 2][1]; g.fillStyle = 'rgba(240,247,255,.85)'; g.beginPath(); g.ellipse(x + u * 3, y + 2, 4 + 14 * k, 2 + 6 * k, 0, 0, 7); g.fill(); }   // foam at its foot
    }
    // mist drifting low over the far water
    for (let j = 0; j < 4; j++) { const x = ((j * 520 + t * 16) % 2400) - 300, y = 578 + j * 16; g.fillStyle = 'rgba(190,196,235,.16)'; g.fill(polyPath(tear([[x, y], [x + 560, y - 4], [x + 580, y + 16], [x, y + 20]], { amp: 6, freq: .012, seed: 70 + j, step: 14 }))); }
    g.restore();
    // foam on the water: along both banks, the perch rock's lip and round the stones
    g.fillStyle = 'rgba(236,244,255,.85)';
    for (const f of FOAM) g.fill(f);
  }
  const FOAM = [];
  { const R = new RNG('foam');
    const crescent = (x, y, w, h, a = 0) => { const c = Math.cos(a), s = Math.sin(a), P = (u, v) => [x + u * c - v * s, y + u * s + v * c]; return polyPath(tear([P(-w, 0), P(-w * .4, -h), P(w * .5, -h * .8), P(w, 0), P(w * .3, -h * .35), P(-w * .5, -h * .3)], { amp: 1.4, freq: .2, seed: R.int(1, 1e6) })); };
    for (let j = 0; j < 5; j++) FOAM.push(crescent(720 + j * 34, KG + 14 + (j & 1) * 6, 30, 7, .05 * j));
    for (const [E, sgn] of [[EL, 1], [ER, -1]]) for (let i = 6; i < E.length - 2; i += 3) { const p = RS[i], k = depthK(p.y); FOAM.push(crescent(E[i][0] - sgn * p.nx * (4 + 10 * k), E[i][1] - sgn * p.ny * (4 + 10 * k), 6 + 26 * k, 2 + 5 * k, Math.atan2(p.ty, p.tx))); }   // along the banks
  }

  const planes = [];
  // sky, stars, the moon and its glow
  planes.push({ name: 'sky', z: 20000, sprites: [{ s: mk('sky', -80, 1100, .7, (g, R) => {
    const gr = g.createLinearGradient(0, -80, 0, 700); gr.addColorStop(0, '#070b24'); gr.addColorStop(.5, '#141e55'); gr.addColorStop(.8, '#2c2b70'); gr.addColorStop(1, '#5c4b94');
    g.fillStyle = gr; g.fillRect(X0, -80, X1 - X0, 1180);
    for (let i = 0; i < 520; i++) { g.fillStyle = `rgba(255,238,200,${R.range(.25, .8)})`; g.beginPath(); g.arc(R.range(X0, X1), R.range(-60, 560), R.range(.5, 1.7), 0, 7); g.fill(); }
    for (let i = 0; i < 18; i++) cutp(g, H.star4(R.range(X0, X1), R.range(20, 430), R.range(7, 16)), '#f0c96a', { light: LT, sh: .5, blur: 3, dist: 2, bev: { width: 1.2, hi: .35 } });
  }, { mat: 'sky', shadow: false }), shadow: false }, { s: mk('moon', MOON[1] - 110, MOON[1] + 110, 1, (g) => {
    const [mx, my, r] = MOON, p = polyPath(tear(ellipsePts(mx, my, r, r, 64), { amp: 1.5, freq: .08, seed: 3 }));
    cutp(g, p, '#f3e8c9', { light: LT, blur: 8, dist: 4, bev: { width: 2, hi: .35 } });
    for (const [dx, dy, rr] of [[-18, -16, 15], [24, 22, 10], [-30, 28, 7], [8, -34, 6]]) { g.fillStyle = 'rgba(180,160,120,.22)'; g.fill(polyPath(tear(ellipsePts(mx + dx, my + dy, rr, rr, 18), { amp: 1.2, seed: rr }))); }
    H.form(g, p, { w: 7, steps: 2, lit: 'rgba(255,255,240,.2)', shade: 'rgba(120,100,60,.14)' });
  }, { mat: 'crumpled', shadow: false, x0: MOON[0] - 120, x1: MOON[0] + 120 }), shadow: false }], draw(g) { glow(g, MOON[0], MOON[1], 320, 'rgba(255,236,190,.45)'); } });
  planes.push({ name: 'clouds', z: 11000, sprites: [{ s: mk('clouds', 20, 420, .8, (g, R) => {
    H.puffBank(g, 1230, 1720, 300, 96, R);
    H.puffBank(g, 80, 700, 190, 104, R);
    H.puffBank(g, 1820, 2200, 150, 70, R);
  }, { mat: 'sky' }) }] });
  // snowy peaks behind the vanishing point, the tallest under the moon
  planes.push({ name: 'peaks', z: 6000, sprites: [{ s: mk('peaks', 180, 700, .8, (g, R) => {
    const pts = ridge(300, X1, 560, 700, { amp: 300, freq: .0024, sharp: .82, seed: 37, step: 10 }).map(([x, y]) => [x, y + 150 * ss(1200, 400, x) + 50 * ss(1800, 2300, x)]);
    const path = polyPath(tear(pts, { amp: 1.5, freq: .05, seed: 37 }));
    cutp(g, path, '#5f63b6', { light: LT, blur: 8, dist: 4 });
    g.save(); g.clip(path);
    const top = pts.slice(0, -2);
    for (let i = 2; i < top.length - 2; i++) {
      if (!(top[i][1] < top[i - 1][1] && top[i][1] <= top[i + 1][1]) || top[i][1] > 560) continue;
      const [px, py] = top[i], dep = (600 - py) * .55, snow = [[px - dep * 1.1, py + dep], [px, py - 2], [px + dep * 1.1, py + dep]];
      for (let j = 1; j < 7; j++) snow.push([px + dep * 1.1 - j * dep * 2.2 / 7, py + dep * (j & 1 ? .55 : .95) + R.range(-6, 6)]);
      g.fillStyle = '#ece8fb'; g.fill(polyPath(snow));
      g.fillStyle = 'rgba(60,62,140,.5)'; g.fill(polyPath([[px, py - 2], [px - dep * 1.1, py + dep], [px - dep * .2, py + dep * .8]]));   // the face away from the moon
    }
    g.restore();
    H.haze(g, 300, 180, X1 - 300, 520, 'rgba(96,84,160,A)', 0, .6);
  }, { mat: 'crumpled' }) }] });
  // hills as rounded humps overlapping in layers, paper-fox's way: depth from overlap, size and haze, no lines
  // running to a point. The far range is lighter and bluer; a gap in the near range shows the lake.
  const humps = (name, base, list, pineCols, pineSize) => mk(name, 380, base + 20, .9, (g, R) => {
    for (const [cx, top, hw, col] of list) {
      const pts = []; for (let i = 0; i <= 40; i++) { const th = Math.PI * i / 40; pts.push([cx - Math.cos(th) * hw, base - Math.sin(th) ** .8 * (base - top)]); }
      const path = polyPath(tear(pts, { amp: 2, freq: .04, seed: R.int(1, 1e6) }));
      cutp(g, path, col, { light: LT, blur: 5, dist: 3 });
      H.form(g, path, { w: 6, steps: 2, lit: 'rgba(200,215,255,.08)', shade: 'rgba(5,10,30,.14)' });
      for (let i = 2; i < 39; i += 1) { if (R.chance(.45)) continue; const th = Math.PI * i / 40; H.pine(g, cx - Math.cos(th) * hw + R.range(-6, 6), base - Math.sin(th) ** .8 * (base - top) + 6, pineSize * R.range(.7, 1.2), pineCols, R, { sh: .5 }); }
      for (let i = 0; i < hw / 30; i++) { const th = R.range(.15, .85) * Math.PI, f = R.range(.2, .85), x = cx - Math.cos(th) * hw * f, y = base - Math.sin(th) ** .8 * (base - top) * f + 6; H.pine(g, x, y, pineSize * R.range(.8, 1.3), pineCols, R, { sh: .5 }); }
    }
    H.haze(g, X0, 380, X1 - X0, base - 360, 'rgba(84,88,160,A)', .18, .4);
  });
  planes.push({ name: 'farhills', z: 3200, sprites: [{ s: humps('farhills', 700,
    [[300, 470, 560, '#36597e'], [1000, 500, 470, '#3a5e84'], [1720, 488, 540, '#33557a'], [2260, 462, 430, '#375a80']], ['#27506a', '#2f5c74', '#386a80'], 26) }] });
  // the lake under the moon: a level band of water with its far shore of tiny pines and the moon's broken reflection
  const LAKE = { y: 612, x0: 700 };
  planes.push({ name: 'lake', z: 2600, sprites: [{ s: mk('lake', 560, 700, .9, (g, R) => {
    const p = polyPath(tear([[LAKE.x0, LAKE.y], [X1, LAKE.y - 4], [X1, 700], [LAKE.x0 - 40, 700]], { amp: 3, freq: .03, seed: 501 }));
    const gr = g.createLinearGradient(0, LAKE.y, 0, 690); gr.addColorStop(0, '#93a6e4'); gr.addColorStop(1, '#4a72cc');
    cutp(g, p, gr, { light: LT, blur: 3, dist: 2 });
    g.save(); g.clip(p);
    for (let i = 0; i < 160; i++) { const x = R.range(LAKE.x0, X1), y = R.range(LAKE.y + 3, 690), w = R.range(20, 90); g.fillStyle = R.pick(['rgba(230,240,255,.5)', 'rgba(60,100,200,.45)', 'rgba(150,175,235,.5)']); g.fillRect(x, y, w, 1.2 + (y - LAKE.y) * .03); }
    g.restore();
    for (let x = LAKE.x0 + 20; x < X1; x += R.range(9, 18)) H.pine(g, x, LAKE.y + 3, R.range(14, 26), ['#21425a', '#284d64'], R, { sh: .4 });
  }) }], draw(g, t) {
    const nz = noise('lakerefl');
    for (let i = 0; i < 9; i++) { const y = LAKE.y + 8 + i * 6, w = (16 + i * 6) * (.5 + .7 * Math.abs(nz.n2(i * .9, t * .8))); g.fillStyle = `rgba(255,242,205,${.8 - i * .04})`; g.fillRect(MOON[0] - w + 6 * nz.n2(i, t * .5), y, w * 2, 2 + i * .3); }
    glow(g, MOON[0], LAKE.y + 30, 140, 'rgba(255,236,190,.35)');
  } });
  planes.push({ name: 'midhills', z: 2000, sprites: [{ s: humps('midhills', 760,
    [[-80, 540, 560, '#22505a'], [560, 566, 430, '#24555c'], [2340, 548, 560, '#22515a'], [1130, 616, 230, '#3f6e4a']], ['#1d4f48', '#255d52', '#2e6c5c'], 54) }] });
  // the near ground the creek runs through, then the creek, then everything standing on the ground
  const inRiver = (g, x, y) => { const q = g.getTransform().transformPoint(new DOMPoint(x, y)); return g.isPointInPath(RIB, q.x, q.y); };
  planes.push({ name: 'ground', z: 1080.4, sprites: [{ s: mk('ground', 600, 1220, 1.05, (g, R) => {
    const top = []; for (let x = X0; x <= X1; x += 40) top.push([x, HZ + 10 * Math.sin(x * .006) + R.range(-3, 3)]);
    const p = polyPath(tear([...top, [X1, 1220], [X0, 1220]], { amp: 3, freq: .04, seed: 601 }));
    const gr = g.createLinearGradient(0, HZ, 0, 1100); gr.addColorStop(0, '#2d4e5e'); gr.addColorStop(.25, '#2a5a3e'); gr.addColorStop(1, '#1f4a2c');
    cutp(g, p, gr, { light: LT, blur: 4, dist: 2 });
    for (let i = 0; i < 520; i++) {
      const x = R.range(X0, X1), y = R.range(HZ + 8, 1110), k = depthK(y);
      if (inRiver(g, x, y)) continue;
      if (R.chance(.25)) cutp(g, polyPath(tear([[x - 6 - 30 * k, y], [x, y - 3 - 8 * k], [x + 8 + 34 * k, y - 1], [x + 2, y + 3 + 4 * k]], { amp: .8 + 2 * k, freq: .3, seed: R.int(1, 1e6) })), R.pick(['#3a7a44', '#4a8a4e', '#2f6a3e']), { light: LT, sh: .5, blur: 2, dist: 1.5, bev: { width: .8 } });
      else H.grassTuft(g, x, y, 8 + 70 * k * k, R, ['#2f6a3e', '#3a7a46', '#4a8a4e']);
    }
  }, { shadow: false }), shadow: false }] });
  const RIVER = { name: 'river', z: 1080, draw(g, t) { drawRiver(g, t); } };
  planes.push(RIVER);
  // what stands on the ground, far to near: stands of pines as masses (one hides the creek's far end), a few mossy
  // ledges of different sizes, night-muted yellow shrubs (paper-fox's tansy), rocks and flowers at the water's edge
  function drawLedge(g, L, R) {
    const { cx, y, w, h, d, k } = L, x0 = cx - w / 2, x1 = cx + w / 2;
    const face = polyPath(tear([[x0 - 4, y + 2], [x1 + 6, y], [x1 + 2, y + h], [x0, y + h + 4]], { amp: 1.5 + 3 * k, freq: .05, seed: L.seed }));
    cutp(g, face, '#56536a', { light: LT, blur: 3 + 6 * k, dist: 2 + 4 * k });
    g.save(); g.clip(face);
    for (let x = x0 + R.range(0, 40) * k; x < x1; x += (30 + 110 * k) * R.range(.7, 1.3)) { g.fillStyle = R.pick(['rgba(170,166,200,.3)', 'rgba(8,6,22,.3)', 'rgba(120,116,150,.18)']); g.fill(polyPath([[x, y], [x + (24 + 90 * k) * R.range(.6, 1.2), y], [x + (18 + 70 * k) * R.range(.4, 1.2), y + h + 6], [x - 10 * k, y + h + 6]])); }
    g.fillStyle = 'rgba(190,186,225,.26)'; g.fill(polyPath([[x1 - w * .28, y], [x1 + 8, y], [x1 + 4, y + h + 6], [x1 - w * .22, y + h + 6]]));   // the face toward the moon
    g.restore();
    const tg = g.createLinearGradient(0, y - d, 0, y); tg.addColorStop(0, '#3a6232'); tg.addColorStop(1, '#4a7a3a');
    cutp(g, polyPath(tear([[x0, y - d], [x1, y - d - w * .03], [x1 + 6, y + 1], [x0 - 4, y + 3]], { amp: 1.5 + 2 * k, freq: .06, seed: L.seed + 1 })), tg, { light: LT, sh: .6, blur: 3, dist: 2, bev: { width: 1 + 1.5 * k, hi: .3 } });
    const lip = [[x0 - 4, y - 2]];
    for (let x = x0; x <= x1 + 4; x += 6 + 18 * k) lip.push([x, y + (R.chance(.4) ? (6 + 22 * k) * R.next() : 2 + 4 * k)]);
    lip.push([x1 + 6, y - 2]);
    cutp(g, polyPath(lip), '#4e8038', { light: LT, sh: .5, blur: 2, dist: 1.5, bev: { width: 1, hi: .3 } });
    for (let x = x0 + R.range(0, 60) * k; x < x1; x += (60 + 160 * k) * R.range(.8, 1.8)) H.moss(g, x, y - d * .3, 14 + 40 * k, R);
  }
  const LEDGES = [[1560, 900, 440, 120], [2000, 770, 280, 74], [420, 704, 280, 58]].map(([cx, y, w, h], i) => ({ cx, y, w, h, d: 8 + 40 * depthK(y), k: depthK(y), seed: 700 + i }));
  const lupine = (g, x, y, h, R) => {
    cutp(g, polyPath([[x - 1.5, y], [x - 1, y - h], [x + 1, y - h], [x + 1.5, y]]), '#2f5c36', { light: LT, sh: .5 });
    for (let i = 0; i < 10; i++) cutp(g, H.circ(x + (i & 1 ? 1 : -1) * h * .03, y - h * .35 - i * h * .065, h * (.06 - i * .004)), i < 3 ? '#b49aee' : '#8a6ad6', { light: LT, sh: .45, blur: 1.5, dist: 1, bev: { width: .8 } });
  };
  const TANSY = ['#4e5a26', '#66722c', '#7e8a34', '#97a03e', '#acb44a'];
  planes.push({ name: 'bankitems', z: 1079.5, sprites: [{ s: mk('bankitems', 380, 1180, 1.05, (g, R) => {
    const items = [];
    const stand = (cx, cy, sx, sy, n, hmin, hmax) => { for (let i = 0; i < n; i++) { const x = cx + R.range(-sx, sx), y = cy + R.range(-sy, sy); if (inRiver(g, x, y + 4)) continue; const h = R.range(hmin, hmax); items.push({ y, draw: () => H.pine(g, x, y, h, ['#1b4a3a', '#235842', '#2c664c'], R, { sh: .6 }) }); } };
    stand(1250, 704, 190, 12, 16, 80, 170);                         // the mass the creek comes out from behind
    stand(220, 700, 220, 18, 12, 90, 180);                          // behind the perch rock
    stand(980, 696, 90, 8, 5, 50, 100);
    stand(2080, 820, 220, 70, 12, 160, 330);                        // the right bank's wood, clear of the lake under the moon
    for (const L of LEDGES) items.push({ y: L.y, draw: () => { drawLedge(g, L, R); for (let j = 0; j < R.int(1, 3); j++) H.pine(g, L.cx + R.range(-.4, .4) * L.w, L.y - L.d * .6, (40 + 360 * Math.pow(L.k, 1.4)) * R.range(.7, 1.1), ['#1b4a3a', '#235842', '#2c664c'], R, { sh: .6 }); } });
    for (const [x, y, w, h] of [[1060, 772, 200, 100], [1380, 820, 220, 110], [1760, 958, 260, 150], [560, 708, 180, 90]]) if (!inRiver(g, x, y)) items.push({ y, draw: () => H.bush(g, x, y, w, h, R, TANSY) });
    for (const [E, side] of [[EL, 1], [ER, -1]]) for (let i = 6; i < E.length; i += 5) {
      const p = RS[i], k = depthK(p.y), x = E[i][0] + p.nx * side * (10 + 30 * k), y = E[i][1] + p.ny * side * (10 + 30 * k) + 4;
      if (inRiver(g, x, y) || (x < 760 && y > 740)) continue;        // the perch rock and the kit's stone are there
      const r = R.next();
      items.push({ y, draw: () => {
        if (r < .4) H.rock(g, x, y + 4, 24 + 120 * k, 14 + 60 * k, R);
        else if (r < .68) for (let j = 0; j < 3; j++) lupine(g, x + j * (6 + 14 * k), y, 20 + 110 * k, R);
        else if (r < .74) for (let j = 0; j < 5; j++) cutp(g, H.circ(x + R.range(-1, 1) * (4 + 16 * k), y - R.range(2, 20) * (.4 + k), 1.5 + 4 * k), '#c4302c', { light: LT, sh: .5, blur: 1.5, dist: 1, bev: { width: .7 } });
        else for (let j = 0; j < 4; j++) H.fern(g, x, y, 20 + 110 * k, -Math.PI / 2 + R.range(-1.2, 1.2), R);
      } });
    }
    items.sort((a, b) => a.y - b.y);
    for (const it of items) it.draw();
  }) }] });
  // a thin fall spilling off the near ledge into the creek (drawn live: the water moves)
  const FALLS = [{ x: LEDGES[0].cx - LEDGES[0].w * .38, top: LEDGES[0].y - LEDGES[0].d * .4, bot: 1012, w: 26, k: LEDGES[0].k }];
  planes.push({ name: 'falls', z: 1079.4, sortZ: 1079.4, draw(g, t) {
    for (const [j, f] of FALLS.entries()) {
      const R = new RNG('fall' + j), body = polyPath([[f.x - f.w / 2, f.top], [f.x + f.w / 2, f.top], [f.x + f.w * .62, f.bot], [f.x - f.w * .62, f.bot]]);
      g.fillStyle = '#9cc4f4'; g.fill(body);
      g.save(); g.clip(body);
      for (let i = 0; i < 14; i++) { const off = ((R.next() + t * (.9 + R.next() * .4)) % 1) * (f.bot - f.top + 40) + f.top - 40, x = f.x + R.range(-.45, .45) * f.w; g.fillStyle = R.chance(.5) ? 'rgba(245,250,255,.9)' : 'rgba(110,160,230,.7)'; g.fillRect(x, off, 1 + f.w * .12, 10 + 40 * f.k); }
      g.restore();
      for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(240,247,255,.88)'; g.beginPath(); g.ellipse(f.x + (i - 1.5) * f.w * .4, f.bot + 1 + Math.sin(t * 7 + i) * 1.2, f.w * .45, f.w * .22, 0, 0, 7); g.fill(); }
    }
  } });
  // fireflies over the creek and its banks (drawn live: they blink and drift)
  const flies = [...Array(26)].map((_, i) => { const R = new RNG('cfly' + i); return { x: R.range(300, 1900), y: R.range(420, 940), ph: R.range(0, 10), sp: R.range(.6, 1.2) }; });
  planes.push({ name: 'flies', z: 1060, draw(g, t) {
    const nz = noise('cflies');
    for (const [i, f] of flies.entries()) {
      const x = f.x + 40 * nz.n2(t * .15 * f.sp, i), y = f.y + 30 * nz.n2(i * 3.1, t * .2 * f.sp), on = ss(.2, .6, .5 + .5 * Math.sin(t * 1.7 * f.sp + f.ph));
      if (on < .02) continue;
      glow(g, x, y, 30, `rgba(255,226,130,${.6 * on})`);
      g.fillStyle = `rgba(255,248,205,${on})`; g.beginPath(); g.arc(x, y, 2.6, 0, 7); g.fill();
    }
  } });
  // the perch rock: a flat top where the parent stands, a lip at the right over the water, a shoulder rising behind;
  // facets lit from the moon at the upper right, moss along the edges, wet and dark where it meets the creek
  function rockSprite(name, body, hump, top, sd) {
    const xs = [...body, ...hump].map((p) => p[0]), tops = body.filter((p) => p[1] <= top + 10).map((p) => p[0]), TX0 = Math.min(...tops), TX1 = Math.max(...tops);   // the flat top's ends
    return mk(name, top - 110, 1120, 1.1, (g, R) => {
      const hp = polyPath(tear(hump, { amp: 3, freq: .04, seed: sd + 7 }));
      cutp(g, hp, '#53505e', { light: LT, blur: 8, dist: 5 });
      g.save(); g.clip(hp); g.fillStyle = '#6a6778'; g.fill(polyPath([hump[2], hump[3], hump[4], [hump[2][0], top]])); g.fillStyle = 'rgba(16,12,28,.35)'; g.fill(polyPath([hump[0], hump[1], hump[2], [hump[2][0], top + 4]])); g.restore();
      const p = polyPath(tear(body, { amp: 2.5, freq: .04, seed: sd }));
      cutp(g, p, '#4b4856', { light: LT, blur: 8, dist: 5 });
      g.save(); g.clip(p);
      const slab = polyPath(tear([[TX0 - 30, top - 6], [TX1 + 14, top - 6], [TX1 - 10, top + 30], [TX0 + 10, top + 36]], { amp: 2.5, freq: .05, seed: sd + 1 }));
      // the front cut into facets by creases running down from the top edge: faces turned toward the moon lighter,
      // faces turned away darker, so the rock reads as a craggy block rather than a slab
      const x0 = TX0, x1 = TX1 + 30, creases = [];
      for (let x = x0 + R.range(30, 90); x < x1; x += R.range(110, 240)) creases.push([[x, top + 18], [x + R.range(-60, 60), lerp(top, 1120, R.range(.3, .6))], [x + R.range(-90, 90), 1120]]);
      for (let i = 0; i < creases.length - 1; i++) {
        const a = creases[i], c = creases[i + 1];
        g.fillStyle = R.pick(['rgba(170,166,195,.34)', 'rgba(6,4,18,.36)', 'rgba(120,116,140,.16)', 'rgba(6,4,18,.18)']);
        g.fill(polyPath(tear([...a, ...c.slice().reverse()], { amp: 2, freq: .06, seed: R.int(1, 1e6) })));
        g.strokeStyle = 'rgba(10,8,20,.3)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(...a[0]); g.lineTo(...a[1]); g.lineTo(...a[2]); g.stroke();
      }
      g.fillStyle = 'rgba(10,8,22,.35)'; g.fill(polyPath(tear([[x0 - 80, top + 20], [x0 + 60, top + 26], [x0 + 20, 1120], [x0 - 120, 1120]], { amp: 2, seed: sd + 3 })));   // the end away from the moon
      for (let i = 0; i < 3; i++) H.moss(g, R.range(x0, x1 - 40), R.range(top + 50, top + 120), R.range(30, 60), R);   // moss in the cracks of the face
      for (let i = 0; i < 1200; i++) { g.fillStyle = R.chance(.5) ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.16)'; g.beginPath(); g.arc(R.range(Math.min(...xs), Math.max(...xs)), R.range(top - 6, 1120), R.range(.5, 1.5), 0, 7); g.fill(); }
      g.restore();
      cutp(g, slab, '#7a7686', { light: LT, sh: .7, blur: 5, dist: 3, bev: { width: 2, hi: .35, lo: .3 } });   // the flat top, a lighter slab lapping over the face
      for (let i = 0; i < 5; i++) H.moss(g, R.range(TX0 + 10, TX1 - 50), top + 2, R.range(30, 70), R);   // moss cushions along the top
    });
  }
  planes.push({ name: 'prock', z: 1000.5, sprites: [{ s: rockSprite('prock',
    [[-60, 1120], [-30, 900], [12, PG + 8], [110, PG], [690, PG], [712, PG + 24], [736, 838], [716, 900], [738, 968], [690, 1050], [660, 1120]],
    [[100, PG + 4], [150, PG - 52], [240, PG - 74], [340, PG - 50], [400, PG + 4]], PG, 301) }] });
  const CHAR_P = { name: 'parent', z: 1000 };
  planes.push(CHAR_P);
  // the water again in front of the parent, only below its waterline round its paws, and the rings where they go in
  const FRAME = { pp: null, kp: null };
  const pawsOf = (ps, ground) => ps.legs.slice(2).map((Lg) => [Lg.ankle[0] * SC, ground + Lg.ankle[1] * SC]);
  function dipPatch(g, t, paws, wl) {
    const xs = paws.map((p) => p[0]), clip = new Path2D(); clip.rect(Math.min(...xs) - 80, wl, Math.max(...xs) - Math.min(...xs) + 160, 200);
    g.save(); g.clip(clip); drawRiver(g, t); g.restore();
    g.save(); g.lineWidth = 2;
    for (const [x, y] of paws) {
      const on = ss(wl - 6, wl + 8, y);
      if (on <= 0) continue;
      for (let i = 0; i < 3; i++) { const f = (t * 1.2 + i / 3) % 1, r = 8 + 44 * f; g.strokeStyle = `rgba(215,228,255,${.55 * (1 - f) * on})`; g.beginPath(); g.ellipse(x, wl + 2, r, r * .3, 0, 0, 7); g.stroke(); }
    }
    g.restore();
  }
  planes.push({ name: 'pdip', z: 1080, sortZ: 999.8, draw(g, t) { dipPatch(g, t, pawsOf(FRAME.pp, PG), WLP); } });
  planes.push({ name: 'kstone', z: 975, sprites: [{ s: rockSprite('kstone',
    [[676, 1060], [686, 990], [702, KG + 8], [740, KG], [858, KG], [884, KG + 16], [900, 1004], [886, 1060]],
    [[670, KG + 4], [688, KG - 34], [730, KG - 44], [770, KG - 26], [786, KG + 4]], KG, 311) }] });
  const CHAR_K = { name: 'kit', z: 970 };
  planes.push(CHAR_K);
  // the splash: a crown of torn water, paper drops flying and falling, big rings
  const SPLASH = [...Array(44)].map((_, i) => { const R = new RNG('drop' + i); return { vx: R.range(-300, 260), vy: R.range(-680, -260), r: R.range(3.5, 10), spin: R.range(-8, 8), pale: R.chance(.6) }; });
  let splashAt = null;
  planes.push({ name: 'kdip', z: 1080, sortZ: 969.8, draw(g, t) {
    dipPatch(g, t, pawsOf(FRAME.kp, KG), WLK);
    const dt = t - TS;
    if (dt > -.02 && dt < 1.3) {
      if (!splashAt) { const ps = kit.pose({ ...kitState(TS), d: KX / SC }); splashAt = [((ps.legs[2].ankle[0] + ps.legs[3].ankle[0]) / 2) * SC, WLK]; }
      const [sx, sy] = splashAt, k = clamp(dt / .35);
      if (dt < .45) {
        const h = 110 * Math.sin(Math.PI * k), crown = [[sx - 64, sy + 4]];
        for (let j = 0; j <= 10; j++) { const u = j / 10; crown.push([sx - 64 + 128 * u, sy - (j & 1 ? h * (.45 + .55 * Math.sin(Math.PI * u)) : h * .15)]); }
        crown.push([sx + 64, sy + 4]);
        g.fillStyle = `rgba(205,222,255,${.85 * (1 - k * .6)})`; g.fill(polyPath(tear(crown, { amp: 1.5, freq: .2, seed: 141 })));
      }
      for (const d of SPLASH) {
        const tt = Math.max(0, dt), x = sx + d.vx * tt, y = sy - 6 + d.vy * tt + 1100 * tt * tt;
        if (y > sy + 4 && tt > .1) continue;
        g.save(); g.translate(x, y); g.rotate(d.spin * tt); g.fillStyle = d.pale ? 'rgba(232,240,255,.95)' : 'rgba(150,180,240,.9)';
        g.fill(polyPath(tear(ellipsePts(0, 0, d.r, d.r * .7, 8), { amp: d.r * .25, freq: .5, seed: Math.round(d.r * 100) }))); g.restore();
      }
      g.save(); g.lineWidth = 2.5;
      for (let i = 0; i < 3; i++) { const f = clamp((dt - i * .12) / 1.1); if (f <= 0) continue; g.strokeStyle = `rgba(220,232,255,${.7 * (1 - f)})`; g.beginPath(); g.ellipse(sx, sy + 3, 20 + 120 * f, (20 + 120 * f) * .3, 0, 0, 7); g.stroke(); }
      g.restore();
    }
  } });
  // framing: the cedar on the left edge, cut off by the top of frame, its sprays reaching in over the parent
  planes.push({ name: 'edgecedar', z: 720, sprites: [{ s: mk('edgecedar', -140, 1180, 1.1, (g, R) => {
    const p = polyPath(tear([[-120, -140], [110, -140], [130, 700], [190, 1180], [-160, 1180]], { amp: 4, freq: .02, seed: 401, step: 6 }));
    cutp(g, p, '#4a2f25', { light: LT, blur: 12, dist: 8 });
    g.save(); g.clip(p);
    for (let i = 0; i < 16; i++) { const bx = R.range(-130, 160), w = R.range(5, 12); g.fillStyle = R.chance(.45) ? 'rgba(255,210,170,.1)' : 'rgba(5,0,0,.28)'; g.fill(polyPath(tear([[bx - w, -140], [bx + w, -140], [bx + w * 1.3, 1180], [bx - w * 1.3, 1180]], { amp: 3, freq: .02, seed: R.int(1, 1e6), step: 8 }))); }
    g.restore();
    H.form(g, p, { w: 18, steps: 2, lit: 'rgba(255,220,190,.12)', shade: 'rgba(0,0,8,.35)' });
    for (let y = -100; y < 420; y += R.range(60, 95)) {
      for (const [col, k] of [['#13301d', 1], ['#1c4127', .8], ['#24512f', .62]]) {
        const len = R.range(240, 420) * k, x0 = 90, ang = R.range(.25, .55), tips = 11, pts = [[x0, y]];
        for (let j = 0; j <= tips; j++) { const u = j / tips, a = ang - .5 + u, r = len * (j & 1 ? .8 : 1) * (.55 + .45 * Math.sin(Math.PI * u)); pts.push([x0 + Math.cos(a) * r, y + Math.sin(a) * r * .7 + 20]); }
        cutp(g, polyPath(tear(pts, { amp: 2, freq: .15, seed: R.int(1, 1e6) })), col, { light: LT, blur: 10, dist: 6, bev: { width: 1.6, hi: .2 } });
      }
    }
  }, { shadow: { blur: 20 } }) }] });
  // growth round the perch rock's foot, so only its top and shoulder show, as paper-fox's perches do
  planes.push({ name: 'rockfoot', z: 840, sprites: [{ s: mk('rockfoot', 700, 1180, 1.1, (g, R) => {
    for (let x = 60; x < 600; x += R.range(90, 150)) {
      if (R.chance(.55)) H.bush(g, x, 1150, R.range(220, 330), R.range(170, 250), R);
      else for (let j = 0; j < 6; j++) H.fern(g, x, 1150, R.range(220, 320), -Math.PI / 2 + R.range(-1.1, 1.1), R, ['#24532f', '#2e6338', '#3a7342']);
    }
    for (const [x, y] of [[200, 960], [420, 990], [560, 1010]]) H.bunchberry(g, x, y, 2.2, R);
  }) }] });
  // bottom right: rocks standing in the near water with foam piled on their upstream side, skunk cabbage at the edge
  planes.push({ name: 'nearright', z: 760, sprites: [{ s: mk('nearright', 760, 1180, 1.1, (g, R) => {
    for (const [x, y, w, h] of [[1300, 1010, 170, 90], [1540, 1110, 230, 120], [1790, 1070, 270, 160], [2040, 1120, 240, 130]]) {
      for (let j = 0; j < 3; j++) { g.fillStyle = 'rgba(228,236,255,.8)'; g.fill(polyPath(tear([[x - w * .55 - j * 14, y - 8 + j * 7], [x - w * .1, y - h * .3 - j * 4], [x + w * .1, y - 4 + j * 6], [x - w * .3, y + 4 + j * 6]], { amp: 1.6, freq: .2, seed: R.int(1, 1e6) }))); }
      H.rock(g, x, y, w, h, R);
    }
    H.rock(g, 1440, 960, 200, 110, R); H.bush(g, 1700, 930, 180, 110, R);
    for (const fx of [1360, 1580]) for (let i = 0; i < 6; i++) H.fern(g, fx, 975, R.range(150, 240), -Math.PI / 2 + R.range(-1.1, 1.1), R, ['#2f6a3a', '#3b7a44', '#48894e']);
    for (let i = 0; i < 4; i++) H.bigLeaf(g, 2110 + R.range(-60, 60), 1180, R.range(240, 330), R.range(-.8, -.2), R.pick(['#5d7a2e', '#6c8a34', '#4f6c2a']), R);
  }) }] });
  // bottom left: the biggest pieces in the picture, ferns, foxgloves, bunchberry, mushrooms, a mossy stone
  planes.push({ name: 'nearleft', z: 640, sprites: [{ s: mk('nearleft', 560, 1200, 1.15, (g, R) => {
    H.rock(g, 380, 1150, 320, 150, R);
    for (let i = 0; i < 9; i++) H.fern(g, R.range(-80, 320), 1200, R.range(420, 600), -Math.PI / 2 + R.range(-.3, 1.15), R, ['#2f6a3a', '#3b7a44', '#48894e']);
    for (const [x, y] of [[520, 1080], [330, 1040], [680, 1130], [140, 1090], [420, 1000]]) H.bunchberry(g, x, y, 3.2, R);
    for (let i = 0; i < 3; i++) H.mushroom(g, 580 + i * 70, 1180 - i * 12, 2.8 - i * .5, R, i ? '#c9a25a' : '#c2402f');
    for (const [x, y, k] of [[740, 1080, 2.8], [690, 1150, 2.5], [300, 960, 2.6], [90, 1000, 2.4], [820, 1140, 2.2]]) H.daisy(g, x, y, k, R);
  }, { shadow: { blur: 18 } }) }] });
  H.setLight([-.5, -.85]);

  // ---------------- one frame ----------------
  function prepare(t) {
    const P = parentState(t), K = kitState(t);
    FRAME.pp = parent.pose({ ...P }); FRAME.kp = kit.pose({ ...K });
    const rim = { width: 2.8, hi: .62, lo: .3, hiColor: '#fff3d8' };                 // the moon catching their edges
    CHAR_P.draw = (g) => parent.draw(g, 0, PG, { ...P, d: PX }, { scale: SC, light: LT, shadow: [-9, 5], edge: rim });
    CHAR_K.draw = (g) => kit.draw(g, 0, KG, { ...K, d: KX }, { scale: SC, light: LT, shadow: [-8, 4], edge: rim });
  }
  // meta for the transitions: where the parent's head is, the moon, the bright water, the horizon
  // ---------------- sound cues ----------------
  // The scene reports its own sound events from the same curves it draws with, so a timing change can't desync the
  // sound: paws going into and out of the water, each washing stroke, sniffs, the slap and every drop landing, and
  // the voices at their acting beats. x is film px (for the pan). tools/cues.mjs writes them to assets/creek_cues.json.
  function cues(fps = 96) {
    const out = [], who = [['parent', parentState, parent, PG, WLP], ['kit', kitState, kit, KG, WLK]], prev = {};
    for (let i = 0; i <= END * fps; i++) {
      const t = i / fps;
      for (const [name, stateOf, rig, ground, wl] of who) {
        const st = stateOf(t), paws = pawsOf(rig.pose({ ...st }), ground), pt = st.t;
        const P = prev[name] || { under: paws.map((q) => q[1] > wl + 2), stroke: Math.floor(pt * 7.5 / Math.PI), sniff: Math.floor(pt * 26 / (Math.PI * 2)) };
        const under = paws.map((q, j) => P.under[j] ? q[1] > wl - 4 : q[1] > wl + 8);   // in once clearly under, out once clearly clear
        paws.forEach((q, j) => { if (under[j] && !P.under[j]) out.push({ k: 'pawIn', t, who: name, x: q[0] }); if (!under[j] && P.under[j]) out.push({ k: 'pawOut', t, who: name, x: q[0] }); });
        const stroke = Math.floor(pt * 7.5 / Math.PI);                     // each half turn of the circling paws
        if (stroke !== P.stroke && (st.rub ?? 0) > .3 && under.some(Boolean)) out.push({ k: 'dab', t, who: name, x: paws[stroke & 1][0] });
        const sn = Math.floor(pt * 26 / (Math.PI * 2));
        if (sn !== P.sniff && (st.sniff ?? 0) > .3) out.push({ k: 'sniff', t, who: name, x: (name === 'parent' ? PX + 330 * SC : KX + 190 * SC) });
        prev[name] = { under, stroke, sniff: sn };
      }
    }
    const ps = kit.pose({ ...kitState(TS) }), sx = ((ps.legs[2].ankle[0] + ps.legs[3].ankle[0]) / 2) * SC;
    out.push({ k: 'splash', t: TS, who: 'kit', x: sx });
    for (const d of SPLASH) { const tt = (-d.vy + Math.sqrt(d.vy * d.vy + 4 * 1100 * 10)) / 2200; out.push({ k: 'drop', t: TS + tt, x: sx + d.vx * tt, size: d.r }); }
    const ph = PX + 330 * SC, kh = KX + 190 * SC;
    out.push({ k: 'churr', t: 3.62, who: 'parent', x: ph }, { k: 'chitter', t: 3.95, who: 'kit', x: kh }, { k: 'squeak', t: TS + .04, who: 'kit', x: kh },
      { k: 'huff', t: TS + .06, who: 'parent', x: ph }, { k: 'sneeze', t: TS + .3, who: 'kit', x: kh }, { k: 'shake', t: TS + .45, dur: .6, who: 'kit', x: kh },
      { k: 'chitter', t: 6.05, who: 'kit', x: kh }, { k: 'churr', t: 6.5, who: 'parent', x: ph });
    return out.sort((a, b) => a.t - b.t);
  }
  return { name: 'creek', END, planes, camera: cam, prepare, cues, background: '#070b24', light: LT, shadowAlpha: .5,
    post: { bloom: .55, threshold: .62, vignette: .3, grain: .05, grade: { color: '#3c4c9a', amount: .1, mode: 'soft-light' } },
    meta: { hero: [PX + 330 * SC, PG - 150 * SC], light: [MOON[0], MOON[1]], water: [MOON[0], LAKE.y + 14], horizon: HZ },
    parent, kit, parentState, kitState };
};

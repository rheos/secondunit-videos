// First Night Out, the scene changes. A port of Leon Lin's paper-fox src/film/transitions.js with the parts of
// compose.js and props.js they use (MIT, Copyright (c) 2026 Leonxlnx; notice in LICENSE-paper-fox.md). The rule is
// paper-fox's: the cut from scene A to scene B always happens behind something from the story world (a trunk passing
// the lens, branches, a ring of rock, a light, the page itself), so a character is never seen twice. The moves, their
// timings and eases are paper-fox's; the props they hide behind are ours, drawn with js/forest.js's helpers (a cedar
// trunk and cedar sprays, torn-paper boulders, a forest-floor page). paper-fox's tree, rock and cloud painters are
// not used. Every transition is a pure function of p (0..1 through its window) and the two scenes' local times.
//
// TRANS.run(name, ctx, { A, B, tA, tB, p, o }) draws one transition frame (before PD.finish); TRANS.intro(ctx, S, t, p)
// is the opening, the cut-outs settling onto their stands nearest last.
const TRANS = (() => {
  const { clamp, lerp, ss, E, RNG, noise, sprite, tear, polyPath, ellipsePts, cutp, surface } = PD;
  const W = 1920, H = 1080, LT = [-.5, -.85], Hp = FOREST.H;
  // paper-fox's eases (core/ease.js): smooth for drifts and fades, dolly for a push through a hold
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (u) => ((ax * u + bx) * u + cx) * u, Y = (u) => ((ay * u + by) * u + cy) * u, dX = (u) => (3 * ax * u + 2 * bx) * u + cx;
    return (x) => { x = clamp(x); let u = x; for (let i = 0; i < 8; i++) { const d = X(u) - x; if (Math.abs(d) < 1e-6) break; u -= d / (dX(u) || 1e-6); u = clamp(u); } return Y(u); };
  }
  const EZ = { smooth: bezier(.65, 0, .35, 1), dolly: bezier(.35, 0, .65, 1), in: E.in, out: E.out };
  const add = (cam, d) => ({ ...cam, x: (cam.x || 0) + (d.x ?? 0), y: (cam.y || 0) + (d.y ?? 0), z: (cam.z || 0) + (d.z ?? 0), zoom: (cam.zoom ?? 1) * (d.zoom ?? 1), roll: (cam.roll ?? 0) + (d.roll ?? 0) });
  const REST = { x: 0, y: 0, z: 0, zoom: 1, roll: 0 };

  // ---------------- buffers (compose.js buffer, renderToBuffer) ----------------
  const pool = new Map();
  function buffer(key, ref) {
    let b = pool.get(key);
    if (!b || b.canvas.width !== ref.width || b.canvas.height !== ref.height) { b = surface(ref.width, ref.height); pool.set(key, b); }
    b.ctx.setTransform(1, 0, 0, 1, 0, 0); b.ctx.globalAlpha = 1; b.ctx.globalCompositeOperation = 'source-over'; b.ctx.filter = 'none';
    return b;
  }
  const renderToBuffer = (key, ref, S, t, o = {}) => { const b = buffer(key, ref); b.ctx.clearRect(0, 0, b.canvas.width, b.canvas.height); SCENE.render(b.ctx, S, t, o); return b; };
  const blit = (ctx, b, alpha = 1) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = alpha; ctx.drawImage(b.canvas, 0, 0); ctx.restore(); };
  const inFilm = (ctx, fn) => { const q = ctx.canvas.width / W; ctx.save(); ctx.setTransform(q, 0, 0, q, 0, 0); fn(ctx); ctx.restore(); };
  // a baked sprite drawn at (x, y) in film px, turned and scaled about its authored origin, its shadow cast first
  function place(ctx, s, x, y, { rot = 0, sx = 1, sy = sx, alpha = 1, sh = .55, dx = -16, dy = 18 } = {}) {
    if (alpha <= .002) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    if (sh > 0) { ctx.save(); ctx.translate(x + dx, y + dy); ctx.rotate(rot); ctx.scale(sx, sy); PD.drawShadow(ctx, s, 0, 0, sh); ctx.restore(); }
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx, sy); PD.drawPaper(ctx, s);
    ctx.restore();
  }
  const heroOf = (S, t) => S.meta.heroAt ? S.meta.heroAt(t) : S.meta.hero;
  // a scene's named point (its light, its bright water), fixed or following its camera
  const pointOf = (S, key, t) => { const v = S.meta[key]; return typeof v === 'function' ? v(t) : v; };

  // ---------------- props, baked once per resolution ----------------
  const cache = new Map();
  const once = (key, make) => { if (!cache.has(key)) cache.set(key, make()); return cache.get(key); };
  // a cedar spray: a stem with fans of toothed leaf-scale fronds along it, flat like the real thing
  function spray(g, x, y, len, ang, R, cols) {
    const c = Math.cos(ang), s = Math.sin(ang), at = (u, v) => [x + c * len * u - s * v, y + s * len * u + c * v];
    for (let u = .06; u < 1; u += .085) {
      for (const side of [1, -1]) {
        const L = len * .26 * (1 - u * .7) * R.range(.8, 1.15), base = at(u, 0), tipA = ang + side * .9 * R.range(.8, 1.1);
        const pts = [base], n = 7;
        for (let j = 0; j <= n; j++) { const v = j / n, a = tipA + (v - .5) * .9, r = L * (j & 1 ? .74 : 1); pts.push([base[0] + Math.cos(a) * r, base[1] + Math.sin(a) * r]); }
        cutp(g, polyPath(tear(pts, { amp: 1.5, freq: .2, seed: R.int(1, 1e6) })), R.pick(cols), { light: LT, sh: .55, blur: 4, dist: 3, bev: { width: 1.2, hi: .2, lo: .18 } });
      }
    }
    g.strokeStyle = '#2a1c15'; g.lineWidth = Math.max(2, len * .012); g.beginPath(); g.moveTo(...at(0, 0)); g.lineTo(...at(1, 0)); g.stroke();
  }
  const NIGHT_GREENS = ['#102a1a', '#163421', '#1c3f28', '#234a2f'];
  // T1: the old cedar passing the lens, sprays drooping off it, so close it sits mostly in shadow
  const trunkSprite = (Q) => once('trunk' + Q, () => sprite({ x: -470, y: -160, w: 940, h: H + 320, res: Q * .8, seed: 'pass-trunk', light: LT, shadow: { blur: 36 }, draw(g) {
    const R = new RNG('pass-trunk');
    for (let k = 0; k < 9; k++) for (const side of [-1, 1]) spray(g, side * 70, -60 + k * 150 + R.range(-25, 25), R.range(300, 400), side < 0 ? Math.PI - R.range(.3, .55) : R.range(.3, .55), R, NIGHT_GREENS);
    const p = polyPath(tear([[-135, -160], [130, -160], [140, H + 160], [-150, H + 160]], { amp: 5, freq: .02, seed: 7, step: 6 }));
    cutp(g, p, '#2a1b15', { light: LT, blur: 14, dist: 8 });
    g.save(); g.clip(p);
    for (let i = 0; i < 18; i++) { const bx = R.range(-150, 140), w = R.range(6, 14); g.fillStyle = R.chance(.45) ? 'rgba(255,200,160,.08)' : 'rgba(5,0,0,.3)'; g.fill(polyPath(tear([[bx - w, -160], [bx + w, -160], [bx + w * 1.3, H + 160], [bx - w * 1.3, H + 160]], { amp: 3, freq: .02, seed: R.int(1, 1e6), step: 8 }))); }
    g.restore();
    Hp.form(g, p, { w: 24, steps: 2, lit: 'rgba(255,215,190,.1)', shade: 'rgba(0,0,6,.4)' });
    for (let k = 0; k < 4; k++) spray(g, R.range(-50, 50), 120 + k * 260 + R.range(-30, 30), R.range(220, 300), R.chance(.5) ? Math.PI - .45 : .45, R, NIGHT_GREENS);
  } }));
  function passingTrunk(ctx, Q, x, p, dim = .62) {
    ctx.save(); ctx.filter = `brightness(${dim}) saturate(.85)`;
    place(ctx, trunkSprite(Q), x, 0, { rot: Math.sin(p * Math.PI) * .012, sx: 1.2, sy: 1.08, sh: .6, dx: -36, dy: 12 });
    ctx.restore();
  }
  // T2: cedar sprays rushing past the lens, the camera flying through them
  const branchSprite = (Q, i) => once('branch' + i + Q, () => sprite({ x: -60, y: -330, w: 1020, h: 660, res: Q * .55, seed: 'branch' + i, light: LT, shadow: { blur: 24 }, draw(g) {
    const R = new RNG('branch' + i);
    spray(g, 0, 0, 900, -.05, R, NIGHT_GREENS);
    spray(g, 260, 10, 520, .55, R, NIGHT_GREENS);
    spray(g, 420, -10, 460, -.6, R, NIGHT_GREENS);
  } }));
  const BRANCHES = [
    { a: 3.0, r: 760, spin: 1.4, z: 1.0 }, { a: .3, r: 820, spin: -1.6, z: 1.05 }, { a: -1.7, r: 700, spin: .2, z: 1.1 },
    { a: 1.9, r: 740, spin: 3.3, z: 1.0 }, { a: -.5, r: 780, spin: 2.6, z: 1.18 }, { a: 4.0, r: 720, spin: -.4, z: 1.12 },
    { a: -2.6, r: 800, spin: 1.0, z: 1.24 }, { a: 1.1, r: 690, spin: -2.2, z: 1.3 }, { a: 2.5, r: 860, spin: .7, z: 1.36 },
  ];
  const branchCover = (p) => p < .5 ? ss(.34, .5, p) : 1 - ss(.5, .64, p);
  function branches(ctx, Q, p, cover) {
    // each spray sits at a fixed offset from the lens axis and grows and slides outward as the camera passes it
    for (let i = BRANCHES.length - 1; i >= 0; i--) {
      const b = BRANCHES[i], f = .42 * Math.pow(30, clamp(p / Math.min(b.z, 1.15)));
      const x = W / 2 + Math.cos(b.a) * b.r * f, y = H / 2 + Math.sin(b.a) * b.r * f * .7;
      const alpha = ss(.55, 1, f) * (1 - ss(.82, 1, p));
      ctx.save(); ctx.translate(x, y); ctx.rotate(b.spin); ctx.scale(f, f * (i % 2 ? -1 : 1)); ctx.translate(-450, 0);
      place(ctx, branchSprite(Q, i % 3), 0, 0, { alpha, sh: .55, dx: -14, dy: 18 });
      ctx.restore();
    }
    if (cover > 0) {
      // the dense needle mass at the heart of the push: a dark bed with sprays radiating from the centre, turning
      // slowly so the cut never sits on a still frame
      ctx.save(); ctx.globalAlpha = cover;
      const gr = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * .75); gr.addColorStop(0, '#183a26'); gr.addColorStop(1, '#0a1a12');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore();
      const spin = (p - .5) * .5;
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2 + spin + (i % 2) * .13, sc = 1.9 + (i % 3) * .35;
        ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(a); ctx.scale(sc, sc * (i % 2 ? -1 : 1));
        place(ctx, branchSprite(Q, i % 3), 0, 0, { alpha: cover, sh: .5 * cover, dx: -8, dy: 10 });
        ctx.restore();
      }
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .35 * cover; ctx.fillStyle = '#20302a'; ctx.fillRect(0, 0, W, H); ctx.restore();
    }
  }
  // T5: a ring of torn-paper boulders round a ragged opening, scaled to close on the hero and open on the next
  const IRIS_R = 520, IRIS_OUT = 1250;
  const irisSprite = (Q) => once('iris' + Q, () => sprite({ x: -IRIS_OUT, y: -IRIS_OUT, w: IRIS_OUT * 2, h: IRIS_OUT * 2, res: Q * .5, seed: 'iris', mat: 'crumpled', light: LT, shadow: { blur: 30 }, draw(g) {
    const R = new RNG('iris'), nz = noise(77), hole = [];
    for (let i = 0; i < 96; i++) { const a = i / 96 * Math.PI * 2, k = 1 + .16 * nz.fbm(Math.cos(a) * 1.7, Math.sin(a) * 1.7, 3); hole.push([Math.cos(a) * IRIS_R * k, Math.sin(a) * IRIS_R * k * .84]); }
    const outer = new Path2D(); outer.rect(-IRIS_OUT, -IRIS_OUT, IRIS_OUT * 2, IRIS_OUT * 2); outer.addPath(polyPath(hole));
    const gr = g.createRadialGradient(0, 0, IRIS_R, 0, 0, IRIS_OUT); gr.addColorStop(0, '#2c2934'); gr.addColorStop(.5, '#1c1a22'); gr.addColorStop(1, '#100f14');
    g.fillStyle = gr; g.fill(outer, 'evenodd');
    // boulders crowding the rim, standing out from the opening
    for (let i = 0; i < 34; i++) {
      const a = i / 34 * Math.PI * 2 + R.range(-.05, .05), rad = IRIS_R * R.range(1.02, 1.2), size = R.range(130, 230);
      g.save(); g.translate(Math.cos(a) * rad, Math.sin(a) * rad * .84); g.rotate(a + Math.PI / 2);
      Hp.rock(g, 0, size * .35, size * 1.3, size * .8, R);
      g.restore();
    }
  } }));
  function rockIris(ctx, Q, cx, cy, r) {
    if (r > 2400) return;
    const k = Math.max(.0005, r / IRIS_R);
    place(ctx, irisSprite(Q), cx, cy, { sx: k, sy: k, sh: .7, dx: 0, dy: 0 });
    const outR = IRIS_OUT * k * .97;                                  // beyond the baked ring everything is rock in shadow
    if (outR < Math.hypot(W, H)) { const p = new Path2D(); p.rect(-200, -200, W + 400, H + 400); p.ellipse(cx, cy, outR, outR, 0, 0, Math.PI * 2); ctx.fillStyle = '#100f14'; ctx.fill(p, 'evenodd'); }
  }
  // T6 and T9: a light bloom with a smooth falloff, a white-hot core in a coloured halo, and a full-frame wash rising with k
  const mixHex = (a, b, k) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), c = (s) => Math.round(((pa >> s) & 255) * (1 - k) + ((pb >> s) & 255) * k); return `rgb(${c(16)},${c(8)},${c(0)})`; };
  const withA = (rgb, a) => rgb.replace('rgb(', 'rgba(').replace(')', `,${a})`);
  function bloomLight(ctx, x, y, k, color, wash) {
    const r = lerp(90, 2400, Math.pow(k, 1.5));
    const fill = (rr) => { const gr = ctx.createRadialGradient(x, y, 0, x, y, rr); for (let i = 0; i <= 10; i++) { const d = i / 10; gr.addColorStop(d, withA(mixHex('#ffffff', color, Math.min(1, d * 2.2)), Math.exp(-d * d * 4.5))); } ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); };
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    fill(r); fill(r * .25);
    ctx.globalAlpha = ss(.35, 1, k) * .9; ctx.fillStyle = wash; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = ss(.82, 1, k); ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  const flare = (ctx, x, y, k, warm = 1) => bloomLight(ctx, x, y, k, mixHex('#cfe4ff', '#ffd98a', warm), mixHex('#eef6ff', '#fff2d6', warm));
  const flood = (ctx, x, y, k, color) => { if (k > .001) bloomLight(ctx, x, y, k, color, mixHex(color, '#fffaf0', .55)); };
  function flashFade(ctx, a) { if (a <= .002) return; ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = a; ctx.fillStyle = '#eef6ff'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  // T8: the page the cut-outs fold down onto: forest-floor paper, darker toward the viewer, faint printed fold lines
  const pageSprite = (Q) => once('page' + Q, () => sprite({ x: -120, y: -40, w: W + 240, h: 820, res: Q * .5, seed: 'page', light: LT, shadow: { blur: 20 }, draw(g) {
    const gr = g.createLinearGradient(0, 0, 0, 780); gr.addColorStop(0, '#2c3a3c'); gr.addColorStop(.5, '#1e2a2c'); gr.addColorStop(1, '#141c1e');
    g.fillStyle = gr; g.fill(polyPath(tear([[-120, 0], [W + 120, 0], [W + 120, 780], [-120, 780]], { amp: 4, freq: .03, seed: 9 })));
    const R = new RNG('page');
    for (let i = 0; i < 7; i++) { const y = 40 + i * 100 + R.range(-20, 20); g.fillStyle = 'rgba(0,0,0,.18)'; g.fill(polyPath([[-120, y], [W + 120, y + R.range(-8, 8)], [W + 120, y + 3], [-120, y + 3]])); }
  } }));
  const popSpring = (x) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-5.2 * x) * Math.cos(x * 8.2);
  const isSky = (P) => P.sky || P.name === 'sky' || P.name === 'clouds';
  // how far back a plane sits among a scene's non-sky planes, on a log scale: 0 nearest, 1 farthest
  function depthRank(S, P) {
    const zs = S.planes.filter((L) => !isSky(L)).map((L) => L.z), lo = Math.log(Math.min(...zs)), hi = Math.log(Math.max(...zs));
    return hi > lo ? clamp((Math.log(P.z) - lo) / (hi - lo)) : 0;
  }
  // where a plane stands on the page: the bottom of its pieces
  function hingeOf(P) {
    if (P.hinge == null) { let y = -Infinity; for (const it of P.sprites || []) y = Math.max(y, it.s.y + it.s.h); P.hinge = Number.isFinite(y) ? Math.min(y, H + 80) : 1000; }
    return P.hinge;
  }

  // ---------------- the transitions ----------------
  const T = {
    fade(ctx, { A, B, tA, tB, p }) { blit(ctx, renderToBuffer('A', ctx.canvas, A, tA)); blit(ctx, renderToBuffer('B', ctx.canvas, B, tB), EZ.smooth(p)); },
    // the camera keeps tracking with the walkers; a huge cedar sweeps across the lens and the next world is behind it
    trackPine(ctx, { A, B, tA, tB, p, Q }) {
      const e = EZ.smooth(p), PAN = 240;
      const a = renderToBuffer('A', ctx.canvas, A, tA, { cam: add(A.camera(tA), { x: e * PAN }) });
      const b = renderToBuffer('B', ctx.canvas, B, tB, { cam: add(B.camera(tB), { x: (e - 1) * PAN }) });
      const x = lerp(W + 560, -560, e), q = ctx.canvas.width / W;
      blit(ctx, a);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.beginPath(); ctx.rect(x * q, 0, ctx.canvas.width - x * q, ctx.canvas.height); ctx.clip(); ctx.drawImage(b.canvas, 0, 0); ctx.restore();
      inFilm(ctx, (c) => passingTrunk(c, Q, x, p, lerp(.7, .55, e)));
    },
    // push forward into the sprays; they rush in from the edges, fill the lens, and part again on the next world
    throughBranches(ctx, { A, B, tA, tB, p, Q }) {
      const cover = branchCover(p);
      if (p < .5) { const k = EZ.dolly(p / .5); blit(ctx, renderToBuffer('A', ctx.canvas, A, tA, { cam: add(A.camera(tA), { z: k * 420, x: -k * 60 }) })); }
      else { const k = 1 - E.out((p - .5) / .5); blit(ctx, renderToBuffer('B', ctx.canvas, B, tB, { cam: add(B.camera(tB), { z: -k * 260 }) })); }
      inFilm(ctx, (c) => branches(c, Q, p, cover));
    },
    // a ragged ring of rock closes on the hero, is shut for about a fifth of a second, and opens on the next
    rockIris(ctx, { A, B, tA, tB, p, Q }) {
      let r, cx, cy;
      if (p < .5) { const k = EZ.smooth(clamp(p / .48)), h = heroOf(A, tA); blit(ctx, renderToBuffer('A', ctx.canvas, A, tA, { cam: add(A.camera(tA), { z: k * 160 }) })); r = lerp(2300, 0, k); [cx, cy] = h; }
      else { const k = EZ.smooth(clamp((p - .52) / .48)), h = heroOf(B, tB); blit(ctx, renderToBuffer('B', ctx.canvas, B, tB, { cam: add(B.camera(tB), { z: -(1 - k) * 160 }) })); r = lerp(0, 2300, k); [cx, cy] = h; }
      inFilm(ctx, (c) => rockIris(c, Q, cx, cy, r));
    },
    // the scene's light flares, turns cold, and is the flash that opens the next
    lightFlash(ctx, { A, B, tA, tB, p, o = {} }) {
      const [lx, ly] = pointOf(A, o.light || 'light', tA);
      if (p < .5) { const k = E.in(clamp(p / .5)); blit(ctx, renderToBuffer('A', ctx.canvas, A, tA, { cam: add(A.camera(tA), { z: k * 220 }) })); inFilm(ctx, (c) => flare(c, lx, ly, k, 1 - k)); }
      else { const k = clamp((p - .5) / .5); blit(ctx, renderToBuffer('B', ctx.canvas, B, tB)); inFilm(ctx, (c) => flashFade(c, Math.exp(-k * 5) * (1 - k))); }
    },
    // the scene's light floods the frame and draws back into the next scene's light
    lightFlood(ctx, { A, B, tA, tB, p, o = {} }) {
      const [ax, ay] = pointOf(A, o.light || 'light', tA), [bx, by] = pointOf(B, o.toLight || 'light', tB);
      if (p < .5) { const k = E.in(clamp(p / .5)); blit(ctx, renderToBuffer('A', ctx.canvas, A, tA, { cam: add(A.camera(tA), { z: k * 260 }) })); inFilm(ctx, (c) => flood(c, ax, ay, k, '#ffe2a0')); }
      else { const k = 1 - E.out(clamp((p - .5) / .5)); blit(ctx, renderToBuffer('B', ctx.canvas, B, tB)); inFilm(ctx, (c) => flood(c, lerp(bx, ax, k * .3), lerp(by, ay, k * .3), k, '#ffe7b0')); }
    },
    // the pop-up book: every cut-out folds flat onto the page front to back, the sky turns, and the next world springs
    // up back to front, the far hills of the new world already rising while the last of the old lie down
    popup(ctx, { A, B, tA, tB, p }) {
      const skyMix = ss(.28, .56, p), flatFade = (k) => ss(.03, .22, Math.cos(k * Math.PI / 2));
      const kA = (P) => E.in(clamp((p - (1 - depthRank(A, P)) * .14) / .3));
      const kB = (P) => { const x = clamp((p - .34 - depthRank(B, P) * .3) / .32); return 1 - popSpring(x * x * (3 - 2 * x) * .6 + x * .4); };
      A.prepare(tA); B.prepare(tB);
      const own = new Map(); for (const P of A.planes) own.set(P, 'A'); for (const P of B.planes) own.set(P, 'B');
      const keep = (P) => own.get(P) === 'A' ? (isSky(P) ? skyMix < 1 : kA(P) < .999) : (isSky(P) ? skyMix > 0 : kB(P) < .999);
      const farZ = Math.max(...[...A.planes, ...B.planes].filter((P) => !isSky(P)).map((P) => P.z));
      const horizon = lerp(A.meta.horizon ?? 600, B.meta.horizon ?? 600, skyMix), pageAlpha = ss(.2, .36, p) * (1 - ss(.56, .74, p));
      const PAGE = { name: 'page', z: farZ * 1.001, draw(c) { if (pageAlpha > .002) place(c, pageSprite(ctx.canvas.width / W), 0, horizon, { alpha: pageAlpha, sh: .4, dx: 0, dy: -10 }); } };
      const list = [...A.planes, ...B.planes].filter(keep).concat([PAGE]).sort((a, b) => (b.sortZ ?? b.z) - (a.sortZ ?? a.z));   // sortZ: a plane drawn out of its depth order
      const camA = A.camera(tA), camB = B.camera(tB);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = A.background; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.globalAlpha = skyMix; ctx.fillStyle = B.background; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore();
      PD.renderPlanes(ctx, list, camA, tA, {
        q: ctx.canvas.width / W, light: LT, shadowAlpha: .5,
        camOf: (P) => P === PAGE ? REST : own.get(P) === 'A' ? camA : camB, tOf: (P) => own.get(P) === 'B' ? tB : tA,
        fold: (P) => { if (P === PAGE || isSky(P)) return 0; hingeOf(P); return own.get(P) === 'A' ? kA(P) : kB(P); },
        alpha: (P) => P === PAGE ? 1 : isSky(P) ? (own.get(P) === 'A' ? 1 - skyMix : skyMix) : flatFade(own.get(P) === 'A' ? kA(P) : kB(P)),
      });
    },
  };
  // the opening: the cut-outs drop onto their stands, the far ones first, the nearest last (film.js drawIntro)
  function intro(ctx, S, t, p) {
    const zs = S.planes.filter((P) => !isSky(P)).map((P) => P.z), lo = Math.log(Math.min(...zs)), hi = Math.log(Math.max(...zs));
    SCENE.render(ctx, S, t, { offset: (P) => { if (isSky(P)) return null; const near = hi > lo ? 1 - (Math.log(P.z) - lo) / (hi - lo) : 0, k = E.out(clamp((p - near * .35) / .65)); return { dy: (1 - k) * (40 + near * 160) }; } });
  }
  const run = (name, ctx, args) => (T[name] || T.fade)(ctx, args);
  return { run, intro, EZ, NAMES: Object.keys(T) };
})();

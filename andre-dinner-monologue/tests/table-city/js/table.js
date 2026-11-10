// Table-city, the pieces: a cut-paper dinner table seen from above and slightly in front, lit by its candle, that
// rises into a walled city. Every piece is baked once (js/paper.js: paper texture, lit cut edge, torn white core,
// blurred silhouette for its shadow) and only moved per frame.
//
// Two kinds of piece. FLAT pieces lie on the cloth (plates, napkin, the cloth itself) and are authored top-down in
// table space; on screen they squash by sin(tilt). STANDEES are upright cut-outs with their base at local (0, 0)
// (glasses, bottle, candle, towers, cutlery, figures, the tree) and squash by cos(tilt): the engine's pop-up fold,
// scale(1, cos(k * PI/2)) about the hinge, with the hinge at the piece's base. A standee that lies down on the
// cloth (cutlery before the fence) is the same fold with k = 1 and its length laid along a direction on the table.
//
// Table space: origin at the table's centre, x right, y toward the viewer (down the frame); the candle at (0, 0).
// The candle is the key light: every piece's lit edge and cast shadow point away from the centre.
const TC = (() => {
  const { lerp, clamp, ss, RNG, noise, sprite, tear, polyPath, smoothPath, ellipsePts, cutp, bevel, drawShadow, drawPaper } = PD;
  const PAL = { indigo: '#35366f', peach: '#f2b38a', violet: '#6c66a5', green: '#5f8350', teal: '#23636b', gold: '#e9ae3a', rust: '#7e3b2f', navy: '#1f2755', cream: '#efe3c8', metal: '#a9a3d6', ink: '#1f2755' };
  const circ = (x, y, r) => smoothPath(ellipsePts(x, y, r, r, 28));
  const ell = (x, y, rx, ry, rot = 0) => smoothPath(ellipsePts(x, y, rx, ry, 28, rot));
  const rectP = (x, y, w, h) => polyPath([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
  const rrect = (x, y, w, h, r) => { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; };
  // form in paper (after paper-fox): stepped parallel cuts, lighter toward the light, darker away from it
  function form(g, path, light, { lit = 'rgba(255,240,215,.2)', shade = 'rgba(24,12,44,.2)', w = 6, steps = 2 } = {}) {
    const BIG = 1e5; g.save(); g.clip(path);
    const band = (dx, dy, col) => { const p = new Path2D(); p.rect(-BIG, -BIG, BIG * 2, BIG * 2); p.addPath(path, new DOMMatrix([1, 0, 0, 1, dx, dy])); g.fillStyle = col; g.fill(p, 'evenodd'); };
    for (let i = steps; i >= 1; i--) { if (lit) band(-light[0] * w * i, -light[1] * w * i, lit); if (shade) band(light[0] * w * i, light[1] * w * i, shade); }
    g.restore();
  }
  // a torn piece with the white paper core showing along its edge
  function torn(g, pts, fill, seed, light, { amp = 2.5, core = 2.6, ...o } = {}) {
    g.fillStyle = '#f7f1e4'; g.fill(polyPath(tear(pts, { amp: amp + core, freq: .09, seed: seed + 17 })));
    return cutp(g, polyPath(tear(pts, { amp, seed })), fill, { light, ...o });
  }
  // windows lit from inside: small gold panes in rows, warmer and denser on the candle side (light.x > 0 means the
  // candle is to the right of the piece)
  function windows(g, x0, x1, y0, y1, light, r, { pw = 5, ph = 7, sx = 11, sy = 13, p = .55 } = {}) {
    for (let y = y0; y < y1 - ph; y += sy) for (let x = x0; x < x1 - pw; x += sx) {
      const side = clamp(.5 + (x - (x0 + x1) / 2) / (x1 - x0) * light[0] * 1.6);   // 1 facing the candle
      if (!r.chance(p * (.45 + .7 * side))) continue;
      g.fillStyle = side > .5 ? `rgba(246,200,96,${.75 + .25 * r.next()})` : `rgba(233,174,58,${.5 + .3 * r.next()})`;
      g.fillRect(x + r.range(-.5, .5), y, pw, ph);
    }
  }
  const unit = (x, y) => { const d = Math.hypot(x, y) || 1; return [x / d, y / d]; };
  const C0 = [-70, 0];   // the candle, in table space: off the plates' axis so the towers never hide it
  // light direction (toward the candle) for a piece at table (tx, ty): standees see it from the side and a
  // little above; flat pieces see it across the cloth
  const standLight = (tx, ty) => unit(-(tx - C0[0]) * .9, -(.45 * Math.hypot(tx - C0[0], ty - C0[1]) + 20));
  const flatLight = (tx, ty) => unit(-(tx - C0[0]), -(ty - C0[1]));

  // ---------------- bakes ----------------
  function build(Q) {
    const R = (k) => Q * k, S = {};
    const sp = (o) => sprite({ res: R(1.6), edge: { width: 2.2, hi: .42, lo: .34 }, shadow: { blur: 9 }, ...o });

    // the room beyond the table: navy paper, a little warmer toward the middle
    S.room = sp({ x: -220, y: -340, w: 1160, h: 1960, res: R(.6), mat: 'sky', seed: 'room', edge: false, shadow: false, draw(g) {
      g.fillStyle = '#161c45'; g.fillRect(-220, -340, 1160, 1960);   // outsizes the frame so the pull-back never shows its edge
      const gr = g.createRadialGradient(360, 700, 60, 360, 700, 900); gr.addColorStop(0, 'rgba(90,70,60,.55)'); gr.addColorStop(.5, 'rgba(40,36,70,.3)'); gr.addColorStop(1, 'rgba(10,12,40,0)');
      g.fillStyle = gr; g.fillRect(-220, -340, 1160, 1960);
    } });
    // the tablecloth, top-down: a long rectangle with softened corners, torn edge with a white core, the candle's
    // pool of light baked in (warm cream at the centre, umber toward the edges), a hem line, a few creases
    const CW = 600, CH = 900, rc = new RNG('cloth');
    S.cloth = sp({ x: -CW / 2 - 30, y: -CH / 2 - 30, w: CW + 60, h: CH + 60, res: R(1.05), mat: 'felt', seed: 'cloth', edge: { width: 2.6, hi: .5, lo: .4 }, shadow: { blur: 22 }, light: [0, -1], draw(g) {
      const pts = ellipsePts(0, 0, CW / 2, CH / 2, 64).map(([x, y]) => [Math.sign(x) * Math.min(Math.abs(x), CW / 2 - 4) * (Math.abs(y) > CH / 2 - 60 ? 1 : 1), y]);
      const rect = []; const n = 72; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, c = Math.cos(a), s = Math.sin(a); const k = 1 / Math.max(Math.abs(c) / (CW / 2), Math.abs(s) / (CH / 2)); rect.push([c * k * (1 - .04 * Math.abs(c * s) ** 2), s * k]); }
      const path = torn(g, rect, PAL.cream, 3, [0, -1], { amp: 3, core: 3, sh: 0, bev: { width: 2.4, hi: .3, lo: .22 } });
      g.save(); g.clip(path);
      const gr = g.createRadialGradient(0, 0, 40, 0, 0, 560); gr.addColorStop(0, 'rgba(255,236,190,.55)'); gr.addColorStop(.35, 'rgba(240,200,140,.18)'); gr.addColorStop(.7, 'rgba(120,80,60,.3)'); gr.addColorStop(1, 'rgba(50,30,50,.6)');
      g.fillStyle = gr; g.fillRect(-CW, -CH, CW * 2, CH * 2);
      for (let i = 0; i < 5; i++) { const x = rc.range(-CW / 2, CW / 2); g.fillStyle = 'rgba(120,90,60,.1)'; g.fillRect(x, -CH / 2, 2.5, CH); g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(x + 2.5, -CH / 2, 1.5, CH); }   // ironing creases
      for (let i = 0; i < 4; i++) { const y = rc.range(-CH / 2, CH / 2); g.fillStyle = 'rgba(120,90,60,.08)'; g.fillRect(-CW / 2, y, CW, 2); }
      g.restore();
    } });
    // a plate: cream centre, peach rim, a thin rust ring; two paper layers
    const plate = (seed, tx, ty, r = 74) => sp({ x: -r - 10, y: -r - 10, w: r * 2 + 20, h: r * 2 + 20, seed, light: flatLight(tx, ty), edge: { width: 2.2, hi: .5, lo: .3 }, shadow: { blur: 7 }, draw(g) {
      const L = flatLight(tx, ty);
      form(g, cutp(g, circ(0, 0, r), PAL.peach, { light: L, sh: 0, bev: { width: 2.4, hi: .4 } }), L, { w: 4, steps: 2, lit: 'rgba(255,240,220,.25)', shade: 'rgba(100,40,40,.18)' });
      g.strokeStyle = PAL.rust; g.lineWidth = 2.2; g.beginPath(); g.arc(0, 0, r - 11, 0, 7); g.stroke();
      cutp(g, circ(0, 0, r - 18), '#f4e8cd', { light: L, blur: 5, dist: 3, bev: { width: 1.8, hi: .35 } });
      g.fillStyle = 'rgba(120,70,40,.12)'; g.fill(ell(6 * -L[0] * 0 + 0, 0, r - 24, r - 26));
      g.fillStyle = '#f7ecd4'; g.fill(circ(-L[0] * 14, -L[1] * 14, r - 40));
    } });
    S.plateFar = plate('plateFar', 40, -240); S.plateNear = plate('plateNear', 40, 240);
    // a napkin, flat: folded square, indigo, a lighter fold
    S.napkin = sp({ x: -46, y: -46, w: 92, h: 92, seed: 'napkin', light: flatLight(250, -360), shadow: { blur: 6 }, draw(g) {
      const L = flatLight(250, -360), sq = polyPath([[-34, -34], [34, -36], [36, 34], [-36, 36]]);
      cutp(g, sq, PAL.indigo, { light: L, sh: 0, bev: { width: 2.2, hi: .4 } });
      cutp(g, polyPath([[-34, -34], [34, -36], [-36, 36]]), '#3f4080', { light: L, blur: 4, dist: 2, bev: { width: 1.8, hi: .35 } });
    } });
    // the backpack standee that the napkin becomes: indigo body, darker flap, cream buckle, one strap showing
    S.pack = sp({ x: -30, y: -52, w: 60, h: 60, seed: 'pack', light: standLight(262, -384), shadow: { blur: 6 }, draw(g) {
      const L = standLight(262, -384);
      form(g, cutp(g, rrect(-22, -44, 44, 44, 9), PAL.indigo, { light: L, sh: 0, bev: { width: 2, hi: .4 } }), L, { w: 4, steps: 2, lit: 'rgba(200,200,255,.16)', shade: 'rgba(0,0,30,.25)' });
      cutp(g, rrect(-20, -46, 40, 20, 8), '#2a2b5c', { light: L, blur: 4, dist: 2, bev: { width: 1.6 } });
      cutp(g, rectP(-16, -30, 4, 26), '#2a2b5c', { light: L, sh: .4, blur: 2, dist: 1, bev: { width: 1 } });
      cutp(g, rectP(-4, -30, 8, 7), PAL.cream, { light: L, sh: .5, blur: 2, dist: 1, bev: { width: 1 } });
    } });
    // a wine glass standee: teal bowl with the candle's warmth in it, stem, foot
    const glass = (seed, tx, ty) => sp({ x: -32, y: -118, w: 64, h: 126, seed, light: standLight(tx, ty), shadow: { blur: 7 }, draw(g) {
      const L = standLight(tx, ty);
      cutp(g, ell(0, -2, 22, 5), PAL.teal, { light: L, blur: 3, dist: 2, bev: { width: 1.6 } });
      cutp(g, polyPath([[-3, -4], [-2, -50], [2, -50], [3, -4]]), '#2c7079', { light: L, blur: 3, dist: 2, bev: { width: 1.2 } });
      const bowl = smoothPath([[-5, -50], [-24, -64], [-26, -92], [-16, -110], [16, -110], [26, -92], [24, -64], [5, -50]], .45);
      cutp(g, bowl, PAL.teal, { light: L, blur: 5, dist: 3, bev: { width: 2, hi: .45 } });
      g.save(); g.clip(bowl);
      const gr = g.createLinearGradient(-26, 0, 26, 0); const a = L[0] > 0 ? 1 : 0;
      gr.addColorStop(a, 'rgba(246,200,96,.75)'); gr.addColorStop(.5, 'rgba(233,174,58,.3)'); gr.addColorStop(1 - a, 'rgba(35,99,107,0)');
      g.fillStyle = gr; g.fillRect(-26, -92, 52, 42);                                           // the wine, lit through
      g.fillStyle = 'rgba(255,255,255,.28)'; g.fill(ell(L[0] * 12, -88, 4, 14));                 // a highlight on the candle side
      g.restore();
    } });
    S.glassFar = glass('glassFar', 170, -200); S.glassNear = glass('glassNear', 150, 170);
    // the bottle: indigo, a rust label, cream cap
    S.bottle = sp({ x: -34, y: -232, w: 68, h: 240, seed: 'bottle', light: standLight(96, -70), shadow: { blur: 8 }, draw(g) {
      const L = standLight(96, -70);
      const body = smoothPath([[-26, 0], [-26, -140], [-9, -175], [-9, -220], [9, -220], [9, -175], [26, -140], [26, 0]], .3);
      form(g, cutp(g, body, PAL.indigo, { light: L, sh: 0, bev: { width: 2.2, hi: .4 } }), L, { w: 6, steps: 2, lit: 'rgba(200,200,255,.14)', shade: 'rgba(0,0,30,.3)' });
      cutp(g, rectP(-22, -112, 44, 58), PAL.rust, { light: L, blur: 4, dist: 2, bev: { width: 1.6 } });
      cutp(g, rectP(-14, -100, 28, 10), PAL.cream, { light: L, sh: .4, blur: 2, dist: 1, bev: { width: 1 } });
      cutp(g, rectP(-11, -228, 22, 16), PAL.cream, { light: L, blur: 3, dist: 2, bev: { width: 1.4 } });
    } });
    // salt: a squat cream cylinder with a violet cap
    S.salt = sp({ x: -24, y: -58, w: 48, h: 64, seed: 'salt', light: standLight(-140, 50), shadow: { blur: 5 }, draw(g) {
      const L = standLight(-140, 50);
      form(g, cutp(g, rrect(-16, -46, 32, 46, 6), PAL.cream, { light: L, sh: 0, bev: { width: 2, hi: .4 } }), L, { w: 4, steps: 2, lit: 'rgba(255,250,230,.25)', shade: 'rgba(80,50,50,.25)' });
      cutp(g, rrect(-17, -54, 34, 12, 4), PAL.violet, { light: L, blur: 3, dist: 2, bev: { width: 1.4 } });
      g.fillStyle = 'rgba(40,30,60,.5)'; for (let i = -1; i <= 1; i++) g.fillRect(i * 7 - 1, -51, 2, 2);
    } });
    // the bread basket: a rust weave, three cream rolls showing
    S.basket = sp({ x: -70, y: -60, w: 140, h: 70, seed: 'basket', light: standLight(-160, -130), shadow: { blur: 7 }, draw(g) {
      const L = standLight(-160, -130);
      for (const [x, r] of [[-30, 17], [8, 19], [38, 15]]) cutp(g, ell(x, -40, r, r * .8), '#e8cf9f', { light: L, blur: 4, dist: 2, bev: { width: 1.6, hi: .4 } });
      const bk = polyPath([[-58, 0], [-52, -42], [52, -42], [58, 0]]);
      form(g, cutp(g, bk, PAL.rust, { light: L, sh: 0, bev: { width: 2.2, hi: .35 } }), L, { w: 5, steps: 2, lit: 'rgba(255,200,160,.14)', shade: 'rgba(30,0,0,.3)' });
      g.save(); g.clip(bk); g.strokeStyle = 'rgba(255,220,190,.18)'; g.lineWidth = 1.5;
      for (let y = -36; y < 0; y += 8) { g.beginPath(); g.moveTo(-60, y); g.lineTo(60, y + 2); g.stroke(); }
      for (let x = -56; x < 60; x += 9) { g.beginPath(); g.moveTo(x, -42); g.lineTo(x + 3, 0); g.stroke(); }
      g.restore();
      cutp(g, rectP(-56, -46, 112, 6), '#93483a', { light: L, blur: 3, dist: 2, bev: { width: 1.4 } });
    } });
    // the candle: a cream stick in a small brass dish; the flame is its own piece so it can flicker and lean
    S.candle = sp({ x: -30, y: -100, w: 60, h: 108, seed: 'candle', light: [0, -1], edge: { width: 2.2, hi: .55, lo: .25 }, shadow: { blur: 6 }, draw(g) {
      cutp(g, ell(0, -2, 24, 6), PAL.gold, { light: [0, -1], blur: 3, dist: 2, bev: { width: 1.6 } });
      form(g, cutp(g, rrect(-11, -88, 22, 86, 3), '#f6ebd2', { light: [0, -1], sh: 0, bev: { width: 2, hi: .5, lo: .15 } }), [-.6, -.8], { w: 4, steps: 2, lit: 'rgba(255,250,230,.3)', shade: 'rgba(120,80,60,.22)' });
      g.fillStyle = 'rgba(80,50,30,.8)'; g.fillRect(-1, -96, 2, 9);
      for (const [x, y, w, h] of [[-11, -70, 4, 30], [7, -40, 4, 28]]) cutp(g, rrect(x, y, w, h, 2), '#fff6e0', { light: [0, -1], sh: .3, blur: 2, dist: 1, bev: { width: 1 } });   // drips
    } });
    S.flame = sp({ x: -16, y: -40, w: 32, h: 44, seed: 'flame', light: [0, -1], edge: { width: 1.6, hi: .6, lo: 0 }, shadow: false, draw(g) {
      cutp(g, smoothPath([[-8, -2], [-10, -16], [0, -36], [10, -16], [8, -2]], .5), PAL.gold, { light: [0, -1], sh: 0, bev: { width: 1.5, hi: .5, lo: 0 } });
      g.fillStyle = '#fff2c4'; g.fill(smoothPath([[-4, -3], [-5, -12], [0, -22], [5, -12], [4, -3]], .5));
      g.fillStyle = 'rgba(80,40,60,.6)'; g.fill(ell(0, -6, 2.2, 4));
    } });
    // the pot: rust with a lip
    S.pot = sp({ x: -42, y: -60, w: 84, h: 68, seed: 'pot', light: standLight(225, -405), shadow: { blur: 7 }, draw(g) {
      const L = standLight(225, -405);
      form(g, cutp(g, polyPath([[-28, 0], [-34, -46], [34, -46], [28, 0]]), PAL.rust, { light: L, sh: 0, bev: { width: 2.2, hi: .35 } }), L, { w: 5, steps: 2, lit: 'rgba(255,200,160,.16)', shade: 'rgba(30,0,0,.3)' });
      cutp(g, rrect(-38, -56, 76, 12, 3), '#93483a', { light: L, blur: 4, dist: 2, bev: { width: 1.6 } });
      g.fillStyle = 'rgba(40,30,20,.5)'; g.fill(ell(0, -58, 30, 4));
    } });
    // the tree as tiers: each tier its own standee so it can spring in. tier(i) authored with its base at (0, 0):
    // sapling tiers are wide and low, redwood tiers narrow and tall. col darker toward the base
    const LT = standLight(225, -405);
    const tier = (i, w, h, seed) => sp({ x: -w / 2 - 8, y: -h - 8, w: w + 16, h: h + 14, seed, light: LT, shadow: { blur: 5 }, draw(g) {
      const col = ['#4b6e45', '#52784a', '#5f8350', '#6a8f58'][Math.min(3, i % 4)];
      const p = polyPath(tear([[0, -h], [w / 2, -h * .12], [w * .3, 0], [-w * .3, 0], [-w / 2, -h * .12]], { amp: 1.4, freq: .2, seed: 100 + i }));
      cutp(g, p, col, { light: LT, sh: 0, bev: { width: 1.8, hi: .35 } });
      g.save(); g.clip(p); g.fillStyle = 'rgba(10,30,20,.3)'; g.fill(polyPath([[0, -h], [LT[0] < 0 ? w / 2 : -w / 2, -h * .12], [LT[0] < 0 ? w * .3 : -w * .3, 0], [0, 0]])); g.restore();   // the far face in shade
    } });
    S.tiers = [tier(0, 64, 40, 't0'), tier(1, 54, 36, 't1'), tier(2, 46, 34, 't2')];
    for (let i = 3; i < 10; i++) S.tiers.push(tier(i, i < 8 ? 44 : 44 - (i - 7) * 9, 44, 't' + i));   // a redwood is a column, not a cone
    S.trunk = sp({ x: -10, y: -420, w: 20, h: 426, seed: 'trunk', light: LT, shadow: { blur: 4 }, draw(g) {
      cutp(g, polyPath([[-7, 0], [-4, -416], [4, -416], [7, 0]]), '#6b3a2a', { light: LT, sh: 0, bev: { width: 1.6 } });
    } });
    // cutlery standees (blade or tines up, base at the handle's end): knife, fork, spoon
    const metal = (kind, seed) => sp({ x: -14, y: -140, w: 28, h: 146, seed, light: [-.6, -.8], edge: { width: 1.8, hi: .55, lo: .3 }, shadow: { blur: 5 }, draw(g) {
      const L = [-.6, -.8];
      cutp(g, rrect(-6, -52, 12, 52, 4), PAL.indigo, { light: L, sh: 0, bev: { width: 1.6, hi: .4 } });
      if (kind === 'knife') { cutp(g, smoothPath([[-5, -52], [-5, -118], [0, -132], [6, -126], [6, -52]], .3), PAL.metal, { light: L, blur: 3, dist: 2, bev: { width: 1.6, hi: .5 } }); g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(-4, -116, 1.6, 60); }
      else if (kind === 'fork') { cutp(g, rrect(-7, -94, 14, 44, 4), PAL.metal, { light: L, blur: 3, dist: 2, bev: { width: 1.6, hi: .5 } }); for (let i = 0; i < 4; i++) cutp(g, rrect(-7 + i * 3.7, -122, 2.6, 32, 1.2), PAL.metal, { light: L, sh: .4, blur: 2, dist: 1, bev: { width: 1, hi: .4 } }); }
      else { cutp(g, ell(0, -92, 10, 20), PAL.metal, { light: L, blur: 3, dist: 2, bev: { width: 1.6, hi: .5 } }); g.fillStyle = 'rgba(40,30,70,.3)'; g.fill(ell(L[0] * 2, -92, 6, 14)); }
    } });
    S.knife = metal('knife', 'knife'); S.fork = metal('fork', 'fork'); S.spoon = metal('spoon', 'spoon');
    // towers: what each piece rises into. Paper layers stacked, windows lit from inside by the candle.
    const rw = new RNG('towers');
    const plateTower = (seed, tx, ty, h) => sp({ x: -90, y: -h - 16, w: 180, h: h + 26, seed, light: standLight(tx, ty), shadow: { blur: 9 }, draw(g) {
      const L = standLight(tx, ty), r = new RNG(seed), n = 7;
      for (let i = 0; i < n; i++) {                                   // stacked plates, each a little smaller: a ziggurat
        const w = 150 - i * 15, y1 = -i * (h / n), y0 = y1 - h / n - 3, col = i % 2 ? '#d99a78' : '#b9826a';
        form(g, cutp(g, rrect(-w / 2, y0, w, h / n + 3, 5), col, { light: L, blur: 5, dist: 3, bev: { width: 2, hi: .4 } }), L, { w: 5, steps: 2, lit: 'rgba(255,240,220,.2)', shade: 'rgba(100,40,40,.18)' });
        g.fillStyle = 'rgba(120,50,40,.35)'; g.fillRect(-w / 2 + 6, y0 + 3, w - 12, 2);
        windows(g, -w / 2 + 8, w / 2 - 8, y0 + 8, y1 - 4, L, r, { pw: 5, ph: 8, sx: 11, sy: 13, p: .62 });
      }
      cutp(g, circ(0, -h - 2, 10), PAL.rust, { light: L, blur: 3, dist: 2, bev: { width: 1.4 } });
    } });
    S.towerPlateFar = plateTower('tPlateFar', 40, -240, 440); S.towerPlateNear = plateTower('tPlateNear', 40, 240, 350);
    const glassTower = (seed, tx, ty, h) => sp({ x: -40, y: -h - 16, w: 80, h: h + 26, seed, light: standLight(tx, ty), shadow: { blur: 8 }, draw(g) {
      const L = standLight(tx, ty), r = new RNG(seed), bh = h * .36;
      cutp(g, ell(0, -2, 26, 6), PAL.teal, { light: L, blur: 3, dist: 2, bev: { width: 1.6 } });
      form(g, cutp(g, polyPath([[-9, -4], [-7, -h + bh], [7, -h + bh], [9, -4]]), '#2c7079', { light: L, sh: 0, bev: { width: 1.8, hi: .4 } }), L, { w: 3, steps: 1, lit: 'rgba(200,255,255,.14)', shade: 'rgba(0,20,30,.3)' });
      windows(g, -7, 7, -h + bh + 10, -10, L, r, { pw: 3, ph: 6, sx: 7, sy: 12, p: .45 });
      const bowl = smoothPath([[-7, -h + bh], [-30, -h + bh * .75], [-32, -h + bh * .2], [-20, -h], [20, -h], [32, -h + bh * .2], [30, -h + bh * .75], [7, -h + bh]], .45);
      cutp(g, bowl, PAL.teal, { light: L, blur: 5, dist: 3, bev: { width: 2, hi: .45 } });
      g.save(); g.clip(bowl);
      const gr = g.createLinearGradient(-32, 0, 32, 0), a = L[0] > 0 ? 1 : 0;
      gr.addColorStop(a, 'rgba(246,200,96,.85)'); gr.addColorStop(.5, 'rgba(233,174,58,.4)'); gr.addColorStop(1 - a, 'rgba(35,99,107,0)');
      g.fillStyle = gr; g.fillRect(-32, -h, 64, bh);                                            // lit from inside
      windows(g, -28, 28, -h + 10, -h + bh - 8, L, r, { pw: 5, ph: 7, sx: 10, sy: 12, p: .6 });
      g.restore();
    } });
    S.towerGlassFar = glassTower('tGlassFar', 170, -200, 320); S.towerGlassNear = glassTower('tGlassNear', 150, 170, 270);
    S.towerBottle = sp({ x: -40, y: -530, w: 80, h: 540, seed: 'tBottle', light: standLight(96, -70), shadow: { blur: 9 }, draw(g) {
      const L = standLight(96, -70), r = new RNG('tBottle');
      const body = smoothPath([[-28, 0], [-28, -360], [-11, -420], [-11, -500], [11, -500], [11, -420], [28, -360], [28, 0]], .3);
      form(g, cutp(g, body, PAL.indigo, { light: L, sh: 0, bev: { width: 2.2, hi: .4 } }), L, { w: 6, steps: 2, lit: 'rgba(200,200,255,.14)', shade: 'rgba(0,0,30,.3)' });
      g.save(); g.clip(body); windows(g, -24, 24, -350, -12, L, r, { pw: 5, ph: 8, sx: 11, sy: 15, p: .5 }); windows(g, -9, 9, -490, -425, L, r, { pw: 4, ph: 6, sx: 8, sy: 11, p: .5 }); g.restore();
      cutp(g, rectP(-24, -270, 48, 60), PAL.rust, { light: L, blur: 4, dist: 2, bev: { width: 1.6 } });
      cutp(g, rectP(-14, -257, 28, 10), PAL.cream, { light: L, sh: .4, blur: 2, dist: 1, bev: { width: 1 } });
      cutp(g, polyPath([[-13, -500], [0, -528], [13, -500]]), PAL.cream, { light: L, blur: 3, dist: 2, bev: { width: 1.4 } });   // the spire
    } });
    S.towerSalt = sp({ x: -30, y: -170, w: 60, h: 180, seed: 'tSalt', light: standLight(-140, 50), shadow: { blur: 6 }, draw(g) {
      const L = standLight(-140, 50), r = new RNG('tSalt');
      form(g, cutp(g, rrect(-18, -150, 36, 150, 6), PAL.cream, { light: L, sh: 0, bev: { width: 2, hi: .4 } }), L, { w: 4, steps: 2, lit: 'rgba(255,250,230,.25)', shade: 'rgba(80,50,50,.25)' });
      windows(g, -14, 14, -140, -8, L, r, { pw: 4, ph: 7, sx: 9, sy: 13, p: .5 });
      cutp(g, rrect(-19, -160, 38, 14, 4), PAL.violet, { light: L, blur: 3, dist: 2, bev: { width: 1.4 } });
      g.fillStyle = 'rgba(40,30,60,.5)'; for (let i = -1; i <= 1; i++) g.fillRect(i * 8 - 1, -157, 2, 2);
    } });
    S.towerBasket = sp({ x: -72, y: -120, w: 144, h: 130, seed: 'tBasket', light: standLight(-160, -130), shadow: { blur: 8 }, draw(g) {
      const L = standLight(-160, -130), r = new RNG('tBasket');
      const dome = smoothPath([[-58, 0], [-60, -60], [-40, -98], [0, -110], [40, -98], [60, -60], [58, 0]], .4);
      form(g, cutp(g, dome, PAL.rust, { light: L, sh: 0, bev: { width: 2.2, hi: .35 } }), L, { w: 6, steps: 2, lit: 'rgba(255,200,160,.14)', shade: 'rgba(30,0,0,.3)' });
      g.save(); g.clip(dome); g.strokeStyle = 'rgba(255,220,190,.16)'; g.lineWidth = 1.5; for (let y = -100; y < 0; y += 9) { g.beginPath(); g.moveTo(-62, y); g.lineTo(62, y + 2); g.stroke(); } g.restore();
      windows(g, -50, 50, -80, -10, L, r, { pw: 6, ph: 9, sx: 14, sy: 16, p: .45 });
      cutp(g, ell(0, -108, 10, 5), '#e8cf9f', { light: L, blur: 3, dist: 2, bev: { width: 1.2 } });
    } });
    // figures: profile silhouettes in one colour, eight walk poses, facing +x; the base at the feet
    S.figures = [...Array(8)].map((_, i) => sp({ x: -16, y: -40, w: 32, h: 44, res: R(2.4), seed: 'fig' + i, mat: 'smooth', light: [-.4, -.9], edge: { width: 1.2, hi: .3, lo: .25 }, shadow: { blur: 3 }, draw(g) {
      const p = i / 8 * Math.PI * 2, sw = Math.sin(p), H = 34;
      g.fillStyle = PAL.ink;
      g.fill(circ(1.5, -H + 4, 4.3));                                                             // head
      g.fill(smoothPath([[-4, -H + 8], [4.5, -H + 8], [5.5, -H + 20], [3, -16], [-3, -16], [-5, -H + 20]], .3));   // torso
      const leg = (a, len = 15) => { g.save(); g.translate(0, -16); g.rotate(a); g.fill(rrect(-2.2, 0, 4.4, len, 2)); g.translate(0, len); g.fill(rrect(-2, -1, 7, 3, 1.2)); g.restore(); };
      leg(sw * .55); leg(-sw * .55);
      const arm = (a) => { g.save(); g.translate(1, -H + 10); g.rotate(a); g.fill(rrect(-1.6, 0, 3.2, 12, 1.5)); g.restore(); };
      arm(-sw * .5); arm(sw * .5);
    } }));
    return S;
  }

  // ---------------- per-frame placement ----------------
  // The view: tilt k in [0, 1] takes the camera from high (68 deg) to three-quarter (36 deg). sinT squashes what
  // lies on the cloth, cosT what stands on it. cy is where the table's centre sits on screen.
  function view(k) {
    const th = lerp(68, 34, k) * Math.PI / 180;
    return { k, sinT: Math.sin(th), cosT: Math.cos(th), cx: 360, cy: lerp(690, 830, k) };
  }
  // table (tx, ty, height h) to screen
  const proj = (V, tx, ty, h = 0) => [V.cx + tx, V.cy + ty * V.sinT - h * V.cosT];
  // the matrix that places a standee at base b: its up axis (local -y) and width axis (local x) on screen. dir is a
  // unit direction on the table; phi 0 lays the piece along dir, 1 stands it up (the pop-up fold about its base).
  function standee(g, V, b, phi, dir = [0, 1], sy = 1, lean = 0) {
    const c = Math.cos(phi * Math.PI / 2), s = Math.sin(phi * Math.PI / 2);
    const ux = (dir[0] * c + lean * s) * sy, uy = (dir[1] * V.sinT * c - V.cosT * s) * sy;
    const vx = -dir[1] * c + s, vy = dir[0] * V.sinT * c;
    g.transform(vx, vy, -ux, -uy, b[0], b[1]);
  }
  // a standee's shadow laid on the cloth away from the candle: the blurred silhouette through the lying matrix,
  // its length growing with the piece's distance from the flame, fading with it too
  function castShadow(g, V, s, tx, ty, { k = 1, alpha = .42, sy = 1 } = {}) {
    const d = Math.hypot(tx - C0[0], ty - C0[1]), dir = unit(tx - C0[0], ty - C0[1]), len = clamp(.3 + d / 420, .3, 1.1) * k * sy;
    const b = proj(V, tx, ty);
    g.save(); standee(g, V, b, 0, dir, len); g.scale(.8, 1); drawShadow(g, s, 0, 0, alpha * clamp(1.1 - d / 600, .25, 1)); g.restore();
  }
  const contact = (g, V, s, tx, ty, alpha = .3) => { const b = proj(V, tx, ty), dir = unit(tx - C0[0], ty - C0[1]); g.save(); g.translate(b[0] + dir[0] * 3, b[1] + dir[1] * 3 * V.sinT); g.scale(1, V.sinT); drawShadow(g, s, 0, 0, alpha); g.restore(); };
  // draw a standee at table (tx, ty) standing (phi 1 by default), scaled sy about its base
  function stand(g, V, s, tx, ty, { sy = 1, phi = 1, dir = [0, 1], lean = 0, shadow = true, alpha = .3, flip = false, h = 0 } = {}) {
    if (sy <= .001) return;
    if (shadow) castShadow(g, V, s, tx, ty, { k: 1, alpha, sy: phi * sy + (1 - phi) * .3 });
    const b = proj(V, tx, ty, h);
    g.save(); standee(g, V, b, phi, dir, sy, lean); if (flip) g.scale(-1, 1); drawPaper(g, s); g.restore();
  }
  // draw a flat piece lying at table (tx, ty), rotated rot on the cloth
  function flat(g, V, s, tx, ty, { rot = 0, shadow = true, alpha = .3, sx = 1 } = {}) {
    if (shadow) contact(g, V, s, tx, ty, alpha);
    const b = proj(V, tx, ty);
    g.save(); g.translate(b[0], b[1]); g.scale(1, V.sinT); g.rotate(rot); g.scale(sx, 1); drawPaper(g, s); g.restore();
  }

  return { PAL, C0, build, view, proj, standee, stand, flat, castShadow, contact, unit, form };
})();

// First Night Out, the night forest the character test walks through: a deep stack of baked paper planes in
// paper-fox's manner (depth bands after its docs/AUTHORING.md: sky far back, mountains thousands deep, the hero at
// 1000, a lens plane in front), every plane packed with cut pieces. Our own drawing; the helpers star4, form, haze,
// grassTuft and bigLeaf come from our paper-depth look test (indieagent-paper-depth/js/scenes.js).
//
// FOREST.build(Q, c0, c1, { trunkAt }) returns the planes, far to near, for a camera that trucks from c0 to c1
// (plane-1000 px). Each plane is authored as seen with the camera at x 0 and is wide enough for its own parallax.
const FOREST = (() => {
  const { lerp, clamp, ss, RNG, noise, sprite, tear, polyPath, smoothPath, ellipsePts, ridge, cutp, glow } = PD;
  // the key light the helpers cut their lit and shaded sides by; a scene lit from elsewhere sets it while it builds
  let LT = [-.5, -.85];
  const setLight = (l) => { LT = l; };

  // ---------------- drawing helpers (inside a sprite's draw, authored px) ----------------
  const circ = (x, y, r) => smoothPath(ellipsePts(x, y, r, r, 24));
  function star4(x, y, r) {
    const k = r * .26, p = new Path2D();
    p.moveTo(x, y - r); p.quadraticCurveTo(x + k * .3, y - k * .3, x + r, y); p.quadraticCurveTo(x + k * .3, y + k * .3, x, y + r);
    p.quadraticCurveTo(x - k * .3, y + k * .3, x - r, y); p.quadraticCurveTo(x - k * .3, y - k * .3, x, y - r); p.closePath(); return p;
  }
  // Form in paper: a shape lit from one side is cut again in stepped layers, lighter toward the light and darker away
  function form(g, path, { lit = 'rgba(255,240,215,.16)', shade = 'rgba(8,8,30,.22)', w = 10, steps = 2 } = {}) {
    const BIG = 1e5;
    g.save(); g.clip(path);
    const band = (dx, dy, col) => { const p = new Path2D(); p.rect(-BIG, -BIG, BIG * 2, BIG * 2); p.addPath(path, new DOMMatrix([1, 0, 0, 1, dx, dy])); g.fillStyle = col; g.fill(p, 'evenodd'); };
    for (let i = steps; i >= 1; i--) { if (lit) band(-LT[0] * w * i, -LT[1] * w * i, lit); if (shade) band(LT[0] * w * i, LT[1] * w * i, shade); }
    g.restore();
  }
  // haze: far pieces drift toward the colour of the air, more at their base
  function haze(g, x, y, w, h, col, top, bottom) {
    g.save(); g.globalCompositeOperation = 'source-atop';
    const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, col.replace('A', top)); gr.addColorStop(1, col.replace('A', bottom));
    g.fillStyle = gr; g.fillRect(x, y, w, h); g.restore();
  }
  const mist = (g, x0, x1, y, h, col, R) => { g.fillStyle = col; g.fill(polyPath(tear([[x0, y], [x1, y], [x1, y + h], [x0, y + h]], { amp: h * .35, freq: .006, seed: R.int(1, 1e6), step: 12 }))); };
  // a pine: saw-toothed tiers, the half away from the light in shade
  function pine(g, x, y, h, cols, R, { sh = .8, trunk = '#3b2a26' } = {}) {
    const w = h * R.range(.36, .44), n = Math.max(3, Math.round(h / 26));
    g.fillStyle = trunk; g.fillRect(x - h * .02, y - h * .14, h * .04, h * .14);
    for (let i = n - 1; i >= 0; i--) {
      const k = (i + 1) / n, top = y - h + h * (i / n) * .86, bot = y - h + h * k * .86 + h * .05, half = w / 2 * (.22 + .78 * k);
      const teeth = Math.max(3, Math.round(half / 6)), pts = [[x, top], [x + half, bot + R.range(0, 3)]];
      for (let j = 1; j < teeth * 2; j++) pts.push([x + half - half * 2 * j / (teeth * 2), bot - (j & 1 ? h * .045 : 0) + R.range(-1, 1)]);
      pts.push([x - half, bot + R.range(0, 3)]);
      const path = polyPath(pts), col = cols[Math.min(cols.length - 1, i % cols.length)];
      cutp(g, path, col, { light: LT, sh, blur: 3, dist: 2, bev: { width: 1.1, hi: .22, lo: .2 } });
      g.save(); g.clip(path); g.fillStyle = 'rgba(4,12,24,.32)'; g.fill(polyPath([[x, top], [x + half + 4, bot + 4], [x + half * .05, bot + 4]])); g.restore();
    }
  }
  // a western red cedar: a flared trunk with bark strips, drooping sprays layered down both sides, lit on the left
  function cedar(g, x, y, h, R) {
    const tw = h * .055;
    const trunk = polyPath(tear([[x - tw * .4, y - h * .96], [x + tw * .4, y - h * .96], [x + tw * .7, y - h * .3], [x + tw * 1.6, y + 6], [x - tw * 1.6, y + 6], [x - tw * .7, y - h * .3]], { amp: 2, freq: .05, seed: R.int(1, 1e6) }));
    cutp(g, trunk, '#5a392c', { light: LT, blur: 6, dist: 4 });
    g.save(); g.clip(trunk);
    for (let i = 0; i < 9; i++) { const bx = x + R.range(-tw * 1.4, tw * 1.4); g.fillStyle = R.chance(.5) ? 'rgba(255,200,170,.1)' : 'rgba(10,0,0,.22)'; g.fill(polyPath(tear([[bx - 3, y - h], [bx + 3, y - h], [bx + 4, y + 10], [bx - 4, y + 10]], { amp: 1.5, freq: .05, seed: R.int(1, 1e6) }))); }
    g.restore();
    form(g, trunk, { w: tw * .5, steps: 1, lit: 'rgba(255,210,180,.12)', shade: 'rgba(10,0,10,.3)' });
    const n = Math.round(h / 40), cols = ['#15352b', '#1c4434', '#24523d', '#2e6047'];
    for (let i = 0; i < n; i++) {
      const yb = y - h * .93 + i * (h * .78 / n) + R.range(-6, 6), k = (i + 1) / n;
      for (const side of [1, -1]) {
        const len = (30 + 170 * k) * R.range(.75, 1.15), th = (16 + 20 * k) * R.range(.8, 1.1), ex = x + side * len, ey = yb + len * R.range(.45, .7);
        const pts = [[x, yb - th * .3], [lerp(x, ex, .5), yb - th * .2 + len * .12], [ex, ey]];
        const teeth = Math.max(3, Math.round(len / 13));
        for (let j = 1; j <= teeth; j++) { const u = 1 - j / (teeth + 1); pts.push([lerp(x, ex, u) + R.range(-3, 3), lerp(yb, ey, u) + th * (j & 1 ? 1.15 : .55)]); }
        pts.push([x, yb + th * .6]);
        const path = polyPath(pts), lit = side < 0;
        cutp(g, path, cols[clamp((lit ? 2 : 0) + (i & 1) + (R.chance(.3) ? 1 : 0), 0, 3)], { light: LT, blur: 5, dist: 3, bev: { width: 1.2, hi: .2, lo: .2 } });
        g.save(); g.clip(path); g.fillStyle = 'rgba(4,14,14,.28)'; g.fill(polyPath(pts.slice(2).map(([px, py]) => [px, py + th * .1]).concat([[x, yb + th]]))); g.restore();
      }
    }
    pine(g, x, y - h * .82, h * .22, ['#22503b', '#2c6046'], R, { sh: .5 });   // the leader
  }
  // a bush: a mound of pointed oval leaves, the lit ones laid last
  function bush(g, x, y, w, h, R, cols = ['#173a2a', '#1f4a33', '#2a5c3c', '#376e45', '#4a8250']) {
    const mound = polyPath(tear(ellipsePts(x, y - h * .45, w / 2, h * .55, 30).filter(([, py]) => py < y + 4), { amp: 3, freq: .06, seed: R.int(1, 1e6) }));
    cutp(g, mound, cols[0], { light: LT, blur: 6, dist: 4 });
    const leaves = [];
    for (let i = 0; i < Math.round(w * h / 260); i++) {
      const a = R.range(0, Math.PI * 2), d = Math.sqrt(R.next()), px = x + Math.cos(a) * d * w * .48, py = y - h * .45 + Math.sin(a) * d * h * .5;
      if (py > y - 4) continue;
      const tone = clamp(.5 + ((px - x) * -LT[0] + (py - (y - h * .5)) * -LT[1]) / (w * .5) * .6 + R.range(-.18, .18));
      leaves.push({ px, py, tone, ang: R.range(-Math.PI, 0) });
    }
    leaves.sort((p, q) => p.tone - q.tone);
    for (const L of leaves) {
      const s = R.range(9, 15), c = Math.cos(L.ang), sn = Math.sin(L.ang);
      const pts = [[0, 0], [s * .5, -s * .32], [s * 1.1, 0], [s * .5, s * .32]].map(([u, v]) => [L.px + u * c - v * sn, L.py + u * sn + v * c]);
      cutp(g, polyPath(pts), cols[Math.round(L.tone * 3) + 1], { light: LT, sh: .5, blur: 2, dist: 1.5, bev: { width: .9, hi: .2, lo: .15 } });
    }
  }
  // a boulder: cut facets lit from the left, moss on its shoulders, specks
  function rock(g, x, y, w, h, R) {
    const o = [[x - w / 2, y + 4], [x - w * .46, y - h * .55], [x - w * .2, y - h], [x + w * .22, y - h * R.range(.85, 1)], [x + w * .5, y - h * .45], [x + w * .5, y + 4]];
    const path = polyPath(tear(o, { amp: 2, freq: .05, seed: R.int(1, 1e6) }));
    cutp(g, path, '#4a4755', { light: LT, blur: 7, dist: 5 });
    g.save(); g.clip(path);
    const top = [x + R.range(-w * .1, w * .1), y - h * .55];
    g.fillStyle = '#625f6e'; g.fill(polyPath([o[1], o[2], o[3], top]));
    g.fillStyle = '#56535f'; g.fill(polyPath([o[0], o[1], top, [x - w * .05, y + 4]]));
    g.fillStyle = '#383542'; g.fill(polyPath([o[3], o[4], o[5], [x + w * .1, y + 4], top]));
    for (let i = 0; i < w * h / 90; i++) { g.fillStyle = R.chance(.5) ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.18)'; g.beginPath(); g.arc(x + R.range(-w / 2, w / 2), y - R.range(0, h), R.range(.6, 1.6), 0, 7); g.fill(); }
    g.restore();
    for (let i = 0; i < 3; i++) {
      const mx = x + R.range(-w * .35, w * .2), my = y - h * R.range(.75, .95) + i * 4, mw = w * R.range(.12, .22);
      const moss = polyPath(tear(ellipsePts(mx, my, mw, mw * .32, 16), { amp: 2.2, freq: .2, seed: R.int(1, 1e6) }));
      cutp(g, moss, i ? '#5d8a3f' : '#46733a', { light: LT, sh: .6, blur: 3, dist: 2, bev: { width: 1 } });
    }
  }
  // a fern frond: a drooping rachis with pointed leaflets on both sides, shrinking to the tip
  function fern(g, x, y, len, ang, R, cols = ['#2a5e36', '#357042', '#3f7e4a']) {
    const c = Math.cos(ang), sn = Math.sin(ang), droop = R.range(.25, .5) * (Math.cos(ang) < 0 ? -1 : 1);
    const at = (u) => [x + c * len * u - sn * len * u * u * droop * .0, y + sn * len * u + Math.abs(droop) * len * u * u * .55];
    const tan = (u) => { const a = at(u - .01), b2 = at(u + .01); return Math.atan2(b2[1] - a[1], b2[0] - a[0]); };
    for (let u = .08; u < .97; u += .055) {
      const p = at(u), t = tan(u), s = len * .14 * (1 - u * .75);
      for (const side of [1, -1]) {
        const a = t + side * 1.05 - side * .25, e = [p[0] + Math.cos(a) * s, p[1] + Math.sin(a) * s];
        const m1 = [lerp(p[0], e[0], .5) + Math.cos(a + 1.57) * s * .18, lerp(p[1], e[1], .5) + Math.sin(a + 1.57) * s * .18];
        const m2 = [lerp(p[0], e[0], .5) - Math.cos(a + 1.57) * s * .18, lerp(p[1], e[1], .5) - Math.sin(a + 1.57) * s * .18];
        cutp(g, polyPath([p, m1, e, m2]), cols[(side > 0 ? 1 : 0) + (R.chance(.3) ? 1 : 0)], { light: LT, sh: .45, blur: 2, dist: 1.5, bev: { width: .8, hi: .18, lo: .14 } });
      }
    }
    g.strokeStyle = '#24502e'; g.lineWidth = Math.max(1.2, len * .012); g.beginPath(); for (let u = 0; u <= 1; u += .05) { const p = at(u); u ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.stroke();
  }
  function grassTuft(g, x, y, h, R, cols = ['#24503a', '#2e6040', '#3a7248']) {
    for (let i = 0; i < 9; i++) {
      const bx = x + R.range(-22, 22), lean = R.range(-.4, .4), hh = h * R.range(.55, 1), w = R.range(4, 7), tip = [bx + Math.sin(lean) * hh, y - hh];
      const blade = polyPath([[bx - w, y + 4], [tip[0] - 1, tip[1] + 6], tip, [bx + w, y + 4]]);
      cutp(g, blade, R.pick(cols), { light: LT, blur: 3, dist: 2, bev: { width: 1.1 } });
      g.save(); g.clip(blade); g.fillStyle = 'rgba(4,16,12,.3)'; g.fill(polyPath([[bx, y + 4], tip, [bx + w * 2, tip[1]], [bx + w * 2, y + 4]])); g.restore();
    }
  }
  function foxglove(g, x, y, h, R) {
    cutp(g, polyPath([[x - 3.5, y], [x - 2, y - h], [x + 2, y - h], [x + 3.5, y]]), '#2f5c36', { light: LT, sh: .5 });
    for (let i = 0; i < 4; i++) fern(g, x, y - 4, h * .28, [Math.PI - .15, Math.PI + .35, .15, -.35][i], R, ['#2c5a34', '#356840', '#3f7646']);   // the leaf rosette
    for (let i = 0; i < 9; i++) {
      const yy = y - h * .45 - i * h * .055, side = i & 1 ? 1 : -1, bx = x + side * 4, s = 10 - i * .6;
      const bell = polyPath([[bx, yy - s * .4], [bx + side * s * 1.4, yy - s * .1], [bx + side * s * 1.5, yy + s * .7], [bx + side * s * .2, yy + s * .5]]);
      cutp(g, bell, i < 3 ? '#d77fb4' : '#b9508f', { light: LT, sh: .5, blur: 2, dist: 1.2, bev: { width: 1 } });
      g.fillStyle = 'rgba(60,10,40,.45)'; g.beginPath(); g.ellipse(bx + side * s * 1.2, yy + s * .35, s * .25, s * .2, 0, 0, 7); g.fill();
    }
  }
  function daisy(g, x, y, s, R) {
    cutp(g, polyPath([[x - 1.2, y], [x - 1, y + 60 * s], [x + 1.2, y + 60 * s], [x + 1.2, y]]), '#33603a', { light: LT, sh: .5 });
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; cutp(g, smoothPath(ellipsePts(x + Math.cos(a) * 9 * s, y + Math.sin(a) * 9 * s, 8 * s, 3.2 * s, 10, a)), '#ede7da', { light: LT, sh: .4, blur: 2, dist: 1, bev: { width: .9 } }); }
    cutp(g, circ(x, y, 5 * s), '#e2a93a', { light: LT, sh: .6, blur: 2, dist: 1 });
  }
  function bunchberry(g, x, y, s, R) {
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + .3; const e = [x + Math.cos(a) * 20 * s, y + Math.sin(a) * 9 * s]; cutp(g, polyPath([[x, y], [lerp(x, e[0], .5) + Math.sin(a) * 5 * s, lerp(y, e[1], .5) - Math.cos(a) * 3 * s], e, [lerp(x, e[0], .5) - Math.sin(a) * 5 * s, lerp(y, e[1], .5) + Math.cos(a) * 3 * s]]), i & 1 ? '#2f6a3c' : '#3a7a46', { light: LT, sh: .5, blur: 2, dist: 1.2, bev: { width: .9 } }); }
    for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + .78; cutp(g, smoothPath(ellipsePts(x + Math.cos(a) * 7 * s, y - 6 * s + Math.sin(a) * 5 * s, 7 * s, 4.4 * s, 10, a)), '#f1ebe0', { light: LT, sh: .45, blur: 2, dist: 1, bev: { width: .9 } }); }
    cutp(g, circ(x, y - 6 * s, 2.6 * s), '#7d8b4a', { light: LT, sh: .4 });
  }
  function mushroom(g, x, y, s, R, cap = '#c23f2e') {
    cutp(g, polyPath([[x - 5 * s, y], [x - 4 * s, y - 26 * s], [x + 4 * s, y - 26 * s], [x + 6 * s, y]]), '#e8dfcc', { light: LT, sh: .5, blur: 2, dist: 1.5, bev: { width: 1 } });
    const capP = polyPath(tear([[x - 20 * s, y - 24 * s], [x - 15 * s, y - 36 * s], [x, y - 42 * s], [x + 15 * s, y - 36 * s], [x + 20 * s, y - 24 * s]], { amp: .8, seed: R.int(1, 1e6) }));
    cutp(g, capP, cap, { light: LT, blur: 3, dist: 2, bev: { width: 1.2 } });
    form(g, capP, { w: 3 * s, steps: 2, lit: 'rgba(255,220,200,.18)', shade: 'rgba(60,0,10,.25)' });
    for (let i = 0; i < 6; i++) { g.fillStyle = '#f2eadb'; g.beginPath(); g.arc(x + R.range(-13, 13) * s, y - R.range(28, 38) * s, R.range(1.2, 2.4) * s, 0, 7); g.fill(); }
  }
  function bigLeaf(g, x, y, len, ang, col, R) {
    const c = Math.cos(ang), sn = Math.sin(ang), P = (u, v) => [x + sn * u + c * v, y - c * u + sn * v];
    const wmax = len * R.range(.16, .22), half = (side) => { const pts = [P(0, 0)]; for (let i = 1; i <= 10; i++) { const u = i / 10; pts.push(P(len * u, side * wmax * Math.sin(Math.PI * u) ** .8)); } return pts; };
    const Lh = half(-1), Rh = half(1), path = polyPath(tear([...Lh, ...Rh.reverse()], { amp: 1.5, freq: .2, seed: R.int(1, 1e6) }));
    cutp(g, path, col, { light: LT, blur: 8, dist: 5, bev: { width: 2 } });
    g.save(); g.clip(path); g.fillStyle = 'rgba(4,16,10,.3)'; g.fill(polyPath([...half(1), P(len, 0)])); g.restore();
    g.strokeStyle = 'rgba(190,230,170,.3)'; g.lineWidth = 2; g.beginPath(); g.moveTo(...P(0, 0)); g.lineTo(...P(len * .92, 0)); g.stroke();
  }
  function puffBank(g, x0, x1, y, h, R, { col = '#8d87bd', lit = 'rgba(235,228,255,.32)', shade = 'rgba(30,25,80,.32)' } = {}) {
    const puffs = [];
    for (let x = x0; x < x1; x += R.range(h * .35, h * .6)) { const u = (x - x0) / (x1 - x0), r = h * (.32 + .55 * Math.sin(Math.PI * u)) * R.range(.75, 1.1); puffs.push([x, y - r * .55, r]); }
    puffs.sort((a, b) => a[2] - b[2]);
    for (const [px, py, r] of puffs) {
      const p = polyPath(tear(ellipsePts(px, py, r, r * .92, 32).map(([qx, qy]) => [qx, Math.min(qy, y + h * .08)]), { amp: 1.6, freq: .1, seed: R.int(1, 1e6) }));
      cutp(g, p, col, { light: LT, blur: 8, dist: 4, bev: { width: 1.6, hi: .3 } });
      form(g, p, { w: r * .14, steps: 2, lit, shade });
    }
  }

  // ---------------- the planes ----------------
  function build(Q, c0, c1, { trunkAt = null } = {}) {
    const planes = [];
    const span = (z) => { const k = 1000 / z; return [Math.floor(c0 * k - 460), Math.ceil(c1 * k + 1920 + 460)]; };
    const mk = (name, z, y0, y1, res, draw, o = {}) => { const [x0, x1] = span(z); return sprite({ x: x0, y: y0, w: x1 - x0, h: y1 - y0, res: Q * res, seed: name, light: LT, mat: o.mat ?? 'paper', edge: o.edge, shadow: o.shadow ?? { blur: 12 }, draw: (g) => draw(g, x0, x1, new RNG('forest:' + name)) }); };
    const plane = (name, z, sprites, extra = {}) => planes.push({ name, z, sprites: sprites.map((s) => ({ s, shadow: extra.noShadow ? false : undefined })), ...extra });

    // the sky: night blue, a field of small stars and gold four-point ones, the moon
    const SKY = 20000, sk = span(SKY), moonX = sk[0] + 460 + 360, moonY = 165;
    plane('sky', SKY, [mk('sky', SKY, -80, 1100, .7, (g, x0, x1, R) => {
      const gr = g.createLinearGradient(0, -80, 0, 900); gr.addColorStop(0, '#080c26'); gr.addColorStop(.6, '#162156'); gr.addColorStop(1, '#2c3a78');
      g.fillStyle = gr; g.fillRect(x0, -80, x1 - x0, 1180);
      for (let i = 0; i < (x1 - x0) * .16; i++) { g.fillStyle = `rgba(255,238,200,${R.range(.25, .8)})`; g.beginPath(); g.arc(R.range(x0, x1), R.range(-60, 640), R.range(.5, 1.7), 0, 7); g.fill(); }
      for (let i = 0; i < (x1 - x0) / 120; i++) cutp(g, star4(R.range(x0, x1), R.range(20, 520), R.range(7, 17)), '#f0c96a', { light: LT, sh: .5, blur: 3, dist: 2, bev: { width: 1.2, hi: .35 } });
    }, { mat: 'sky', shadow: false }), mk('moon', SKY, moonY - 120, moonY + 120, 1, (g) => {
      const p = polyPath(tear(ellipsePts(moonX, moonY, 96, 96, 64), { amp: 1.5, freq: .08, seed: 3 }));
      cutp(g, p, '#f3e8c9', { light: LT, blur: 8, dist: 4, bev: { width: 2, hi: .35 } });
      for (const [dx, dy, r] of [[22, -20, 18], [-30, 26, 12], [36, 34, 9], [-12, -42, 7]]) { g.fillStyle = 'rgba(180,160,120,.22)'; g.fill(polyPath(tear(ellipsePts(moonX + dx, moonY + dy, r, r, 18), { amp: 1.2, seed: r }))); }
      form(g, p, { w: 7, steps: 2, lit: 'rgba(255,255,240,.2)', shade: 'rgba(120,100,60,.14)' });
    }, { mat: 'crumpled', shadow: false })], { draw(g) { glow(g, moonX, moonY, 300, 'rgba(255,236,190,.4)'); }, noShadow: true });
    // cloud banks: round lavender puffs, one across the foot of the moon
    plane('clouds', 12000, [mk('clouds', 12000, 60, 470, .8, (g, x0, x1, R) => {
      puffBank(g, moonX * .6 + x0 * .4 - 120, moonX * .6 + x0 * .4 + 520, 300, 120, R);
      for (let x = x0 + 1100; x < x1; x += R.range(900, 1400)) puffBank(g, x, x + R.range(420, 640), R.range(150, 260), R.range(70, 110), R);
    }, { mat: 'sky' })]);
    // snowy peaks, hazed at their feet
    plane('peaks', 7000, [mk('peaks', 7000, 300, 800, .8, (g, x0, x1, R) => {
      const pts = ridge(x0, x1, 640, 800, { amp: 210, freq: .0024, sharp: .8, seed: 31, step: 10 });
      const path = polyPath(tear(pts, { amp: 1.5, freq: .05, seed: 31 }));
      cutp(g, path, '#4d5596', { light: LT, blur: 8, dist: 4 });
      g.save(); g.clip(path);
      const top = pts.slice(0, -2);
      for (let i = 2; i < top.length - 2; i++) {
        if (!(top[i][1] < top[i - 1][1] && top[i][1] <= top[i + 1][1]) || top[i][1] > 560) continue;
        const [px, py] = top[i], depth = (600 - py) * .55;
        const snow = [[px - depth * 1.1, py + depth], [px, py - 2], [px + depth * 1.1, py + depth]];
        for (let j = 1; j < 7; j++) snow.push([px + depth * 1.1 - j * depth * 2.2 / 7, py + depth * (j & 1 ? .55 : .95) + R.range(-6, 6)]);
        g.fillStyle = '#d9dbf1'; g.fill(polyPath(snow));
        g.fillStyle = 'rgba(70,75,140,.45)'; g.fill(polyPath([[px, py - 2], [px + depth * 1.1, py + depth], [px + depth * .2, py + depth * .8]]));   // the face away from the light
        g.fillStyle = 'rgba(40,44,100,.35)'; g.fill(polyPath([[px, py], [px + depth * 1.3, py + depth * 1.6], [px + depth * 1.6, 800], [px + depth * .3, 800]]));
      }
      g.restore();
      haze(g, x0, 300, x1 - x0, 500, 'rgba(60,72,140,A)', 0, .7);
    }, { mat: 'crumpled' })]);
    // a far ridge of small pines, then a nearer one of taller pines, mist between
    plane('farwood', 4200, [mk('farwood', 4200, 540, 820, .8, (g, x0, x1, R) => {
      const pts = ridge(x0, x1, 700, 820, { amp: 45, freq: .003, sharp: .1, seed: 41 });
      cutp(g, polyPath(tear(pts, { amp: 2, freq: .05, seed: 41 })), '#1a3a4a', { light: LT, blur: 5, dist: 3 });
      for (let x = x0; x < x1; x += R.range(12, 26)) { const y = pts[Math.min(pts.length - 3, Math.max(0, Math.round((x - x0) / 8)))][1] + 8; pine(g, x, y, R.range(36, 78), ['#16394a', '#1c4454', '#22505e'], R, { sh: .5 }); }
      haze(g, x0, 560, x1 - x0, 260, 'rgba(62,80,140,A)', .25, .65);
      for (let x = x0; x < x1; x += R.range(500, 900)) mist(g, x, x + R.range(400, 800), R.range(742, 770), 20, 'rgba(150,160,210,.22)', R);
    })]);
    plane('midwood', 2600, [mk('midwood', 2600, 480, 880, .9, (g, x0, x1, R) => {
      const pts = ridge(x0, x1, 770, 880, { amp: 30, freq: .004, sharp: .1, seed: 51 });
      cutp(g, polyPath(tear(pts, { amp: 2, freq: .05, seed: 51 })), '#132f36', { light: LT, blur: 6, dist: 4 });
      for (let x = x0; x < x1; x += R.range(26, 54)) { const y = pts[Math.min(pts.length - 3, Math.max(0, Math.round((x - x0) / 8)))][1] + 12; pine(g, x, y, R.range(100, 210), ['#173c3c', '#1f4a46', '#285a50'], R); }
      haze(g, x0, 480, x1 - x0, 400, 'rgba(50,70,130,A)', .12, .4);
      for (let x = x0; x < x1; x += R.range(600, 1000)) mist(g, x, x + R.range(500, 900), R.range(830, 856), 22, 'rgba(150,165,215,.18)', R);
    })]);
    // big cedars and a few younger pines
    plane('cedars', 1700, [mk('cedars', 1700, 60, 930, 1, (g, x0, x1, R) => {
      for (let x = x0 + R.range(0, 200); x < x1; x += R.range(260, 640)) {
        if (R.chance(.5)) pine(g, x - R.range(110, 190), 905, R.range(200, 380), ['#153630', '#1c4538', '#245240'], R);
        if (R.chance(.7)) cedar(g, x, 905, R.range(560, 1000), R);
        else pine(g, x, 905, R.range(420, 640), ['#163a32', '#1e483a', '#285844'], R);
      }
      haze(g, x0, 60, x1 - x0, 870, 'rgba(40,55,110,A)', .1, .22);
    })]);
    // bushes, mossy boulders, ferns and foxgloves along the back of the path
    plane('understory', 1250, [mk('understory', 1250, 560, 930, 1.05, (g, x0, x1, R) => {
      for (let x = x0; x < x1; x += R.range(45, 95)) {
        const r = R.next();
        if (r < .34) bush(g, x, 912, R.range(160, 300), R.range(100, 175), R);
        else if (r < .52) rock(g, x, 916, R.range(110, 220), R.range(60, 120), R);
        else if (r < .93) for (let i = 0; i < 6; i++) fern(g, x, 912, R.range(100, 170), -Math.PI / 2 + R.range(-1.25, 1.25), R);
        else foxglove(g, x, 916, R.range(150, 210), R);
      }
    })]);
    // the forest floor: the path the raccoons walk, moss along its back edge, pebbles, fallen needles and leaves
    plane('ground', 1000.5, [mk('ground', 1000.5, 870, 1100, 1.05, (g, x0, x1, R) => {
      g.fillStyle = '#211b29'; g.fill(polyPath(tear([[x0, 896], [x1, 896], [x1, 1100], [x0, 1100]], { amp: 3, freq: .03, seed: 61 })));
      g.fillStyle = '#3a3242'; g.fill(polyPath(tear([[x0, 918], [x1, 918], [x1, 985], [x0, 985]], { amp: 6, freq: .01, seed: 62, step: 10 })));
      for (let x = x0; x < x1; x += R.range(90, 220)) cutp(g, polyPath(tear(ellipsePts(x, R.range(1000, 1070), R.range(40, 110), R.range(10, 22), 20), { amp: 3, freq: .1, seed: R.int(1, 1e6) })), R.pick(['#2f5a32', '#3a6a38', '#28492c']), { light: LT, sh: .5, blur: 3, dist: 2, bev: { width: 1 } });
      cutp(g, polyPath(tear([[x0, 886], [x1, 886], [x1, 904], [x0, 906]], { amp: 4, freq: .04, seed: 63 })), '#365e37', { light: LT, blur: 3, dist: 2 });
      for (let x = x0; x < x1; x += R.range(18, 50)) {
        const y = R.range(912, 1080), r = R.next();
        if (r < .45) cutp(g, polyPath(tear(ellipsePts(x, y, R.range(4, 11), R.range(2.5, 5), 10), { amp: 1, freq: .3, seed: R.int(1, 1e6) })), R.pick(['#3b3443', '#47404f', '#2c2633']), { light: LT, sh: .6, blur: 2, dist: 1.5, bev: { width: .9 } });
        else if (r < .75) { g.strokeStyle = R.pick(['#5a3c2c', '#4a3226', '#6a4a32']); g.lineWidth = R.range(1, 2); const a = R.range(0, Math.PI); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * R.range(8, 18), y + Math.sin(a) * 3); g.stroke(); }
        else cutp(g, smoothPath(ellipsePts(x, y, R.range(6, 10), R.range(3, 4.5), 10, R.range(-.5, .5))), R.pick(['#6b4a2a', '#7d5a30', '#5a3e28']), { light: LT, sh: .5, blur: 2, dist: 1, bev: { width: .8 } });
      }
      for (let x = x0 + 80; x < x1; x += R.range(420, 900)) mushroom(g, x, 900, R.range(.5, .8), R, R.chance(.5) ? '#b83c2e' : '#c9a25a');
    }, { shadow: false })]);
    // fireflies drifting over the path (drawn live: they blink)
    const flies = [...Array(18)].map((_, i) => { const R = new RNG('fly' + i); return { x: R.range(...span(1150)), y: R.range(560, 880), ph: R.range(0, 10), sp: R.range(.6, 1.2) }; });
    planes.push({ name: 'flies', z: 1150, draw(g, t) {
      const nz = noise('flies');
      for (const [i, f] of flies.entries()) {
        const x = f.x + 40 * nz.n2(t * .15 * f.sp, i), y = f.y + 30 * nz.n2(i * 3.1, t * .2 * f.sp), on = ss(.2, .6, .5 + .5 * Math.sin(t * 1.7 * f.sp + f.ph));
        if (on < .02) continue;
        glow(g, x, y, 26, `rgba(255,226,130,${.55 * on})`);
        g.fillStyle = `rgba(255,246,200,${on})`; g.beginPath(); g.arc(x, y, 2.4, 0, 7); g.fill();
      }
    } });
    // in front of the path: grass, ferns, daisies, bunchberry, mushrooms, the odd mossy log
    plane('near', 820, [mk('near', 820, 820, 1110, 1.1, (g, x0, x1, R) => {
      for (let x = x0; x < x1; x += R.range(28, 62)) {
        const r = R.next(), y = R.range(1070, 1100);
        if (r < .26) grassTuft(g, x, y, R.range(90, 150), R);
        else if (r < .48) for (let i = 0; i < 5; i++) fern(g, x, y, R.range(100, 160), -Math.PI / 2 + R.range(-1.2, 1.2), R);
        else if (r < .58) daisy(g, x, y - R.range(70, 120), R.range(1.1, 1.5), R);
        else if (r < .68) bunchberry(g, x, y - R.range(30, 70), R.range(1.2, 1.6), R);
        else if (r < .72) for (let i = 0; i < R.int(1, 3); i++) mushroom(g, x + i * R.range(14, 26), y - 10 - R.range(0, 20), R.range(.9, 1.5), R, R.chance(.5) ? '#b83c2e' : R.pick(['#c9a25a', '#8a5a3a', '#d8c7a0']));
        else if (r < .84) rock(g, x, y, R.range(90, 160), R.range(50, 90), R);
        else if (r < .9) { const w = R.range(160, 260); const log = polyPath(tear([[x - w / 2, y - 34], [x + w / 2, y - 40], [x + w / 2 + 6, y + 10], [x - w / 2, y + 12]], { amp: 2, seed: R.int(1, 1e6) })); cutp(g, log, '#4b3328', { light: LT, blur: 6, dist: 4 }); form(g, log, { w: 6, steps: 2, lit: 'rgba(255,210,170,.14)', shade: 'rgba(10,0,10,.3)' }); for (let i = 0; i < 4; i++) cutp(g, polyPath(tear(ellipsePts(x + R.range(-w * .4, w * .4), y - 36, R.range(14, 28), 6, 14), { amp: 1.8, freq: .2, seed: R.int(1, 1e6) })), '#4f7f3c', { light: LT, sh: .5, blur: 2, dist: 1.5 }); }
      }
    })]);
    // the lens: big fronds and leaves sweeping past low in frame, and one old trunk crossing the whole frame
    plane('lens', 470, [mk('lens', 470, 560, 1180, 1.15, (g, x0, x1, R) => {
      for (let x = x0; x < x1; x += R.range(170, 380)) {
        const kind = R.next(), y = 1180;
        if (kind < .5) for (let i = 0; i < 4; i++) fern(g, x + R.range(-30, 30), y, R.range(220, 330), -Math.PI / 2 + R.range(-1.15, 1.15), R, ['#163a20', '#1d4828', '#25562f']);
        else for (let i = 0; i < 3; i++) bigLeaf(g, x + R.range(-40, 40), y, R.range(180, 300), R.range(-.7, .7), R.pick(['#173a22', '#1e4628', '#255230']), R);
      }
    }, { shadow: { blur: 18 } }), ...(trunkAt != null ? [sprite({ x: trunkAt * 1000 / 470 + 960 - 330, y: -80, w: 660, h: 1280, res: Q * 1.1, seed: 'oldtrunk', light: LT, shadow: { blur: 26 }, draw(g) {
      const cx = trunkAt * 1000 / 470 + 960, R = new RNG('oldtrunk');
      const p = polyPath(tear([[cx - 170, -80], [cx + 150, -80], [cx + 165, 900], [cx + 230, 1200], [cx - 250, 1200], [cx - 185, 900]], { amp: 5, freq: .02, seed: 7, step: 6 }));
      cutp(g, p, '#241712', { light: LT, blur: 14, dist: 8 });
      g.save(); g.clip(p);
      for (let i = 0; i < 22; i++) { const bx = cx + R.range(-190, 170), w = R.range(6, 16); g.fillStyle = R.chance(.45) ? 'rgba(255,200,160,.08)' : 'rgba(5,0,0,.3)'; g.fill(polyPath(tear([[bx - w, -80], [bx + w, -80], [bx + w * 1.3, 1200], [bx - w * 1.3, 1200]], { amp: 3, freq: .02, seed: R.int(1, 1e6), step: 8 }))); }
      g.restore();
      form(g, p, { w: 30, steps: 2, lit: 'rgba(255,215,190,.1)', shade: 'rgba(0,0,6,.4)' });
    } })] : [])]);
    planes.moon = [moonX, moonY];                                       // for the transitions: the light, at camera x 0
    return planes;
  }
  // the drawing helpers, for the film's scenes
  const H = { setLight, circ, star4, form, haze, mist, pine, cedar, bush, rock, fern, grassTuft, foxglove, daisy, bunchberry, mushroom, bigLeaf, puffBank };
  return { build, H };
})();

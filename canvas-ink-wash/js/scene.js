// Spotify Canvas loop in the ink-wash look: one karst spire with a pine on its shoulder, mist rising
// through the gorge in front, three birds wheeling, a small red sun behind the far range. 8 s, 9:16.
// Everything is a pure function of the loop phase, so frame 192 is frame 0:
//   - the cards (far range, side peaks, spire, pine, near rocks) are baked and inkified once and only move
//     on looping paths (a camera wander and the pine's sway, both LoopNoise);
//   - the mist is LoopNoise fields, and the rising is a two-layer flow map (each layer scrolls one full step
//     per loop and resets while its weight is zero);
//   - the birds go round once a loop and flap a whole number of times.
// Rock, spire and pine helpers are copied from indieagent-ink-wash/js/scene.js (the look test).
(function () {
  const K = window.INK, LN = window.LoopNoise;
  const DW = 720, DH = 1280;                 // design space; the canvas may be any 9:16 size
  const LOOP = 8, FPS = 24;
  const M = 12;                              // card margin for the camera wander, design px
  const RED = 'rgb(200,52,30)';              // the one red: the sun, under 1 percent of the frame
  let W = DW, H = DH, S = 1;

  // a card the size of the frame plus margin, drawn in design coordinates
  function card(draw) {
    return K.bake(Math.ceil((DW + 2 * M) * S), Math.ceil((DH + 2 * M) * S), (ctx) => {
      ctx.scale(S, S);
      ctx.translate(M, M);
      draw(ctx);
    });
  }

  // ---------- rock, after the look test ----------
  function rockMass(ctx, outline, v, seed, { fibres = 1, light = -1, fade = 0.75, contour = 1 } = {}) {
    const r = K.rng(seed);
    let minY = 1e9, maxY = -1e9, minX = 1e9, maxX = -1e9;
    for (const [x, y] of outline) { minY = Math.min(minY, y); maxY = Math.max(maxY, y); minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
    const hgt = maxY - minY, wid = maxX - minX;
    const path = new Path2D();
    path.moveTo(outline[0][0], outline[0][1]);
    for (const p of outline.slice(1)) path.lineTo(p[0], p[1]);
    path.closePath();
    ctx.save();
    const g = ctx.createLinearGradient(0, minY, 0, maxY);
    g.addColorStop(0, K.tone(v, 1));
    g.addColorStop(Math.min(0.98, fade * 0.6), K.tone(Math.min(0.95, v + 0.12), 0.95));
    g.addColorStop(Math.min(0.99, fade), K.tone(Math.min(0.95, v + 0.25), 0.6));
    g.addColorStop(1, K.tone(Math.min(0.95, v + 0.3), fade > 1 ? 0.5 : 0));
    ctx.fillStyle = g;
    ctx.fill(path);
    ctx.clip(path);
    const sx = light < 0 ? maxX - wid * 0.28 : minX + wid * 0.28;
    const inkH = hgt * Math.min(1, fade * 0.75);
    const nS = Math.max(4, Math.round(wid / 40));
    for (let k = 0; k < nS; k++) {
      const x0 = wid > 300 ? minX + r() * wid : sx + (r() - 0.5) * wid * 0.3;
      const y0 = minY + r() * inkH * 0.3, len = inkH * (0.4 + r() * 0.5);
      K.dryStroke(ctx, [[x0, y0], [x0 + (r() - 0.5) * 20, y0 + len * 0.5], [x0 + (r() - 0.5) * 30, y0 + len]],
        { width: Math.min(60, wid * 0.22), bristles: 10, dry: 0.55, seed: seed * 7 + k, fill: K.tone(Math.max(0, v - 0.2), 0.3) });
    }
    const nF = Math.round((wid * hgt) / 1600 * fibres);
    for (let k = 0; k < nF; k++) {
      const x0 = minX + r() * wid, y0 = minY + r() * inkH * 0.85, len = 18 + r() * inkH * 0.25, bend = (r() - 0.5) * 14;
      K.stroke(ctx, [[x0, y0], [x0 + bend * 0.5, y0 + len * 0.5], [x0 + bend, y0 + len]],
        { width: 1.2 + r() * 1.6, profile: 'taper', rough: 0.4, seed: seed * 31 + k, fill: K.tone(Math.max(0, v - 0.18 - r() * 0.1), 0.35 + r() * 0.3) });
    }
    ctx.restore();
    if (contour) {
      const top = outline.reduce((b, p) => (p[1] < b[1] ? p : b), outline[0]);
      const side = outline.filter((p) => (light < 0 ? p[0] >= top[0] - 2 : p[0] <= top[0] + 2) && p[1] < minY + hgt * 0.65);
      side.sort((a, b) => a[1] - b[1]);
      if (side.length > 2) K.stroke(ctx, side, { width: 3.2 * contour, profile: 'brush', rough: 0.45, seed: seed + 9, fill: K.tone(Math.max(0, v - 0.32), 0.85) });
    }
  }

  function spireOutline(cx, base, w, h, seed) {
    const L = [], R = [], steps = 22;
    for (let i = 0; i <= steps; i++) {
      const s = i / steps, y = base - h + s * h;
      const prof = 0.18 + 0.82 * Math.pow(s, 0.7);
      const ledge = Math.floor(s * 5 + K.vnoise2(seed, 1) * 3) * 0.06;
      const wl = w * 0.5 * prof * (1 + (K.vnoise2(s * 7, 3, seed) - 0.5) * 0.5 + ledge);
      const wr = w * 0.5 * prof * (1 + (K.vnoise2(s * 7, 9, seed) - 0.5) * 0.5 + ledge * 0.7);
      L.push([cx - wl, y]);
      R.push([cx + wr, y]);
    }
    const top = [];
    for (let k = 1; k < 6; k++) {
      const s = k / 6;
      top.push([L[0][0] + (R[0][0] - L[0][0]) * s, base - h - Math.sin(Math.PI * s) * w * 0.12 - (K.vnoise2(k * 1.7, 4, seed) - 0.5) * w * 0.12]);
    }
    return [...L.slice().reverse(), ...top, ...R];
  }

  function ridgePines(ctx, x, y, n, size, v, seed) {
    const r = K.rng(seed);
    for (let i = 0; i < n; i++) {
      const px = x + (r() - 0.5) * size * 4, py = y + r() * size * 0.8, s = size * (0.6 + r() * 0.6);
      K.stroke(ctx, [[px, py + s * 1.4], [px + (r() - 0.5) * 3, py - s * 0.6]], { width: s * 0.22, profile: 'needle', seed: seed + i, fill: K.tone(v, 1) });
      for (let k = 0; k < 3; k++) {
        K.blob(ctx, px, py - k * s * 0.42, s * (0.9 - k * 0.22), s * 0.16, { n: 10, jit: 0.35, seed: seed * 3 + i * 7 + k, fill: K.tone(v, 0.95) });
      }
    }
  }

  function peak(ctx, cx, base, w, h, v, seed) {
    const r = K.rng(seed);
    rockMass(ctx, spireOutline(cx + (r() - 0.5) * w * 0.8, base, w * 0.9, h * (0.55 + r() * 0.2), seed + 1), Math.min(0.9, v + 0.1), seed + 1, { contour: 0.7 });
    rockMass(ctx, spireOutline(cx, base, w, h, seed), v, seed);
    rockMass(ctx, spireOutline(cx + (r() - 0.5) * w * 0.6, base, w * 0.75, h * (0.3 + r() * 0.15), seed + 2), Math.max(0, v - 0.05), seed + 2, { contour: 0.8 });
    const topY = base - h - w * 0.08;
    K.dots(ctx, cx, topY + 6, w * 0.25, 22, 2.2, { seed: seed + 5, fill: K.tone(Math.max(0, v - 0.35), 0.9) });
    if (r() < 0.75) ridgePines(ctx, cx + (r() - 0.5) * w * 0.3, topY - 2, 2 + Math.floor(r() * 3), 7 + r() * 5, Math.max(0, v - 0.38), seed + 6);
  }

  // ---------- the cards ----------
  // far: the sun, then two pale ranges over its lower half
  function farCard() {
    const c = card((ctx) => {
      K.blob(ctx, 584, 476, 31, 31, { n: 20, jit: 0.03, seed: 5, fill: RED });
      for (const [base, amp, v, seed] of [[520, 70, 0.8, 21], [575, 60, 0.7, 22]]) {
        ctx.beginPath();
        ctx.moveTo(-M, DH);
        for (let x = -M; x <= DW + M; x += 4) {
          const n = K.fbm2(x * 0.006, 0.5, seed, 5);
          const spike = Math.pow(K.vnoise2(x * 0.016, 2.3, seed + 5), 3) * 0.9;
          ctx.lineTo(x, base - amp * (n * 0.9 + spike));
        }
        ctx.lineTo(DW + M, DH);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, base - amp * 1.4, 0, base + 110);
        g.addColorStop(0, K.tone(v, 1));
        g.addColorStop(0.6, K.tone(v, 0.75));
        g.addColorStop(1, K.tone(v, 0));
        ctx.fillStyle = g;
        ctx.filter = 'blur(1.5px)';
        ctx.fill();
        ctx.filter = 'none';
      }
    });
    return K.inkify(c, { edge: 0.1, gran: 0.1, bleed: 0.5, seed: 1 });
  }

  // side peaks, paler, framing the gorge from behind
  function sideCard() {
    const c = card((ctx) => {
      peak(ctx, 70, 1000, 120, 360, 0.6, 140);
      peak(ctx, 676, 1010, 130, 320, 0.62, 151);
      peak(ctx, 600, 1040, 90, 210, 0.5, 163);
    });
    return K.inkify(c, { edge: 0.42, gran: 0.26, bleed: 1.0, seed: 2 });
  }

  // the spire: a back shoulder, the main spire, a front-left shoulder that carries the pine
  const PINE_ROOT = [318, 590];
  function spireCard() {
    const c = card((ctx) => {
      rockMass(ctx, spireOutline(520, 1200, 240, 600, 31), 0.46, 31, { contour: 0.7, fade: 0.7 });
      rockMass(ctx, spireOutline(430, 1200, 270, 880, 30), 0.3, 30, { fade: 0.72, fibres: 1.1 });
      rockMass(ctx, spireOutline(345, 1200, 190, 610, 32), 0.22, 32, { contour: 0.9, fade: 0.62, light: 1 });
      // karst ledges: short dark cuts across the lit face
      const lr = K.rng(38);
      for (const [y, x0, len] of [[430, 398, 34], [530, 380, 44], [650, 392, 40]]) {
        const pts = [[x0, y], [x0 + len * 0.5, y + 3 + lr() * 4], [x0 + len, y + 1 + lr() * 6]];
        K.stroke(ctx, pts, { width: 2.6, profile: 'taper', rough: 0.6, seed: 700 + y, fill: K.tone(0.12, 0.5) });
        K.stroke(ctx, pts.map(([x, yy]) => [x + 4, yy + 5]), { width: 6, profile: 'taper', rough: 0.4, seed: 760 + y, fill: K.tone(0.55, 0.25) });
      }
      K.dots(ctx, 430, 318, 52, 30, 2.4, { seed: 35, fill: K.tone(0.02, 0.9) });
      K.dots(ctx, 345, 602, 40, 18, 2.2, { seed: 36, fill: K.tone(0.0, 0.9) });
      ridgePines(ctx, 440, 312, 3, 9, 0.0, 37);
    });
    return K.inkify(c, { edge: 0.45, gran: 0.24, bleed: 1.1, seed: 3 });
  }

  // the pine on the shoulder, leaning out over the gorge; its own card so it can sway about its root
  function pineCard() {
    const [rx0, ry0] = PINE_ROOT;
    const c = card((ctx) => {
      ctx.translate(rx0, ry0);
      ctx.scale(0.92, 0.92);
      ctx.translate(-rx0, -ry0);
      K.stroke(ctx, [[322, 600], [300, 548], [252, 504], [192, 478], [128, 470], [76, 480]], { width: 22, profile: 'brush', rough: 0.5, seed: 92, fill: K.tone(0.02, 1) });
      K.dryStroke(ctx, [[316, 590], [296, 545], [252, 506], [194, 482]], { width: 9, bristles: 8, dry: 0.4, seed: 93, fill: K.tone(0.45, 0.6) });
      K.stroke(ctx, [[252, 504], [238, 450], [206, 416]], { width: 8, profile: 'needle', seed: 94, fill: K.tone(0.02, 1) });
      K.stroke(ctx, [[166, 474], [136, 438], [96, 422]], { width: 6, profile: 'needle', seed: 95, fill: K.tone(0.02, 1) });
      const pads = [[86, 476, 80, 21], [62, 450, 52, 16], [100, 424, 62, 18], [150, 442, 50, 15], [206, 412, 66, 19], [222, 440, 44, 13], [262, 488, 44, 13], [44, 496, 38, 12]];
      pads.forEach(([px, py, rx, ry], i) => {
        const pr = K.rng(100 + i);
        K.blob(ctx, px, py + 3, rx * 0.85, ry * 0.5, { seed: 300 + i, fill: K.tone(0.18, 0.55) });
        for (let k = 0; k < 56; k++) {
          const a = Math.PI * (1.02 + (k / 55) * 0.96);
          const x0 = px + (pr() - 0.5) * rx * 0.4, y0 = py + 3;
          K.stroke(ctx, [[x0, y0], [px + Math.cos(a) * rx * (0.55 + pr() * 0.5), py + Math.sin(a) * ry * (0.7 + pr() * 0.7)]],
            { width: 2, profile: 'needle', seed: 200 + i * 70 + k, fill: K.tone(0.03, 0.8) });
        }
        K.stroke(ctx, [[px - rx * 0.8, py + 4], [px, py + 6], [px + rx * 0.8, py + 3]], { width: 2.5, profile: 'taper', seed: 600 + i, fill: K.tone(0, 0.9) });
      });
    });
    return K.inkify(c, { edge: 0.5, gran: 0.2, bleed: 1.2, seed: 4 });
  }

  // near rocks in true black, left and right, with the gorge between
  function nearCard() {
    const c = card((ctx) => {
      const tier = (pts, v, seed, light) => rockMass(ctx, pts, v, seed, { fade: 1.2, fibres: 1.6, light, contour: 1.6 });
      tier([[-M - 10, 1050], [60, 1030], [150, 1046], [214, 1098], [244, 1170], [256, DH + M], [-M - 10, DH + M]], 0.14, 81, 1);
      tier([[-M - 10, 1140], [92, 1118], [196, 1150], [262, 1220], [284, DH + M], [-M - 10, DH + M]], 0.03, 82, 1);
      tier([[DW + M + 10, 1000], [690, 1018], [626, 1070], [584, 1146], [566, DH + M], [DW + M + 10, DH + M]], 0.12, 83, -1);
      tier([[DW + M + 10, 1110], [664, 1140], [614, 1206], [600, DH + M], [DW + M + 10, DH + M]], 0.02, 84, -1);
      K.dots(ctx, 104, 1066, 56, 26, 3.0, { seed: 90, fill: K.tone(0, 1) });
      K.dots(ctx, 676, 1058, 40, 18, 2.8, { seed: 91, fill: K.tone(0, 1) });
      ridgePines(ctx, 70, 1036, 2, 10, 0.0, 96);
    });
    return K.inkify(c, { edge: 0.5, gran: 0.2, bleed: 1.2, seed: 5 });
  }

  // ---------- mist ----------
  // A coarse alpha map of paper colour, scaled up with smoothing. Each layer samples a warped LoopNoise fbm.
  // Rising or drifting: two copies of the field, offset by half a step, each scrolling by (vx, rise) per loop;
  // each copy jumps back while its weight is zero, and the blend is variance-normalised so it doesn't pulse.
  const CELL = 5, GW = DW / CELL + 2, GH = DH / CELL + 2;
  let small = null, simg = null;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, x) => { const s = clamp((x - a) / (b - a)); return s * s * (3 - 2 * s); };
  const gauss = (x, c, w) => Math.exp(-((x - c) / w) * ((x - c) / w));

  function field(x, y, ph, o) {
    const X = x * o.sx, Y = y * o.sy;
    const wx = LN.loopFbm2(X * 0.5 + 9.1, Y * 0.5, ph, o.R * 0.7, o.seed + ':w', 2);
    return LN.loopFbm2(X + wx * o.warp, Y + wx * o.warp * 0.4, ph, o.R, o.seed, o.oct || 4);
  }
  function mist(ctx, ph, cam, o) {
    const sctx = small.getContext('2d'), d = simg.data;
    const f1 = ph, f2 = (ph + 0.5) % 1, w1 = 1 - Math.abs(2 * f1 - 1), w2 = 1 - w1, nrm = 1 / Math.hypot(w1, w2);
    const ox = cam[0] * o.depth, oy = cam[1] * o.depth;
    for (let j = 0; j < GH; j++) {
      const Y = (j - 1) * CELL, ey = o.envY(Y);
      for (let i = 0; i < GW; i++) {
        const k = (j * GW + i) * 4, X = (i - 1) * CELL, e = ey * (o.envX ? o.envX(X) : 1);
        if (e < 0.01) { d[k + 3] = 0; continue; }
        const x = X - ox, y = Y - oy;
        const n1 = w1 > 0 ? field(x - f1 * o.vx, y + f1 * o.rise, ph, o) : 0;
        const n2 = w2 > 0 ? field(x - f2 * o.vx + 57.3 / o.sx, y + f2 * o.rise, ph, o) : 0;
        const n = (w1 * n1 + w2 * n2) * nrm;
        const wisp = clamp((n - o.thr) * o.gain);
        d[k] = K.PAPER[0]; d[k + 1] = K.PAPER[1]; d[k + 2] = K.PAPER[2];
        d[k + 3] = Math.round(clamp(e * (o.base + wisp) * o.amt) * 255);
      }
    }
    sctx.putImageData(simg, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(small, -1.5 * CELL * S, -1.5 * CELL * S, GW * CELL * S, GH * CELL * S);
  }

  const MIST = {
    // a sideways veil at the foot of the far range
    far: { seed: 'far', depth: 0.15, envY: (y) => gauss(y, 640, 80), sx: 0.005, sy: 0.022, warp: 1.4, R: 0.3, vx: 60, rise: 0, thr: -0.05, gain: 2.2, base: 0.35, amt: 0.95 },
    // a veil at the foot of the side peaks, drifting the other way and lifting a little
    side: { seed: 'side', depth: 0.35, envY: (y) => gauss(y, 950, 95), sx: 0.006, sy: 0.018, warp: 1.4, R: 0.3, vx: -50, rise: 40, thr: -0.02, gain: 2.4, base: 0.3, amt: 0.95 },
    // the gorge: plumes rising in front of the spire's foot, thinning as they climb
    gorge: { seed: 'gorge', depth: 0.7, envY: (y) => smooth(560, 1000, y), envX: (x) => 0.35 + 0.65 * gauss(x, 400, 220), sx: 0.006, sy: 0.004, warp: 1.2, R: 0.25, oct: 3, vx: 14, rise: 230, thr: 0.02, gain: 2.6, base: 0.06, amt: 1.0 },
    // thin wisps in front of the near rocks
    front: { seed: 'front', depth: 1.1, envY: (y) => smooth(880, 1180, y), envX: (x) => gauss(x, 410, 250), sx: 0.005, sy: 0.0035, warp: 0.9, R: 0.25, oct: 3, vx: -10, rise: 300, thr: 0.08, gain: 1.6, base: 0.0, amt: 0.7 },
  };

  // ---------- birds: three, wheeling once round per loop to the left of the spire ----------
  const BIRDS = [
    { cx: 200, cy: 300, rx: 64, ry: 20, off: 0.0, flaps: 12, size: 8.5 },
    { cx: 214, cy: 318, rx: 88, ry: 28, off: 0.36, flaps: 10, size: 7.5 },
    { cx: 192, cy: 284, rx: 46, ry: 15, off: 0.7, flaps: 14, size: 6.5 },
  ];
  function birds(ctx, ph, cam) {
    ctx.strokeStyle = K.tone(0.12, 0.9);
    ctx.lineCap = 'round';
    for (const b of BIRDS) {
      const a = 2 * Math.PI * (ph + b.off);
      const near = 1 + 0.15 * Math.sin(a);
      const x = b.cx + b.rx * Math.cos(a) + cam[0] * 0.2, y = b.cy + b.ry * Math.sin(a) + cam[1] * 0.2;
      // flaps in bursts: two glides a loop, a whole number of wingbeats
      const glide = 0.5 + 0.5 * Math.cos(2 * Math.PI * (2 * ph + b.off));
      const f = Math.sin(2 * Math.PI * (b.flaps * ph + b.off)) * 3.4 * glide + (1 - glide) * 2.2;
      const s = b.size * near;
      ctx.lineWidth = 1.5 * near * S;
      ctx.beginPath();
      ctx.moveTo((x - s) * S, (y - f * near) * S);
      ctx.quadraticCurveTo((x - s * 0.4) * S, (y - 2) * S, x * S, y * S);
      ctx.quadraticCurveTo((x + s * 0.4) * S, (y - 2) * S, (x + s) * S, (y - f * near) * S);
      ctx.stroke();
    }
  }

  // ---------- frame ----------
  let B = null, paper = null;
  function build(w = DW, h = DH) {
    W = w; H = h; S = W / DW;
    small = K.canvas(GW, GH);
    simg = small.getContext('2d').createImageData(GW, GH);
    B = { far: farCard(), side: sideCard(), spire: spireCard(), pine: pineCard(), near: nearCard() };
    paper = K.paperField(W, H, 5);
  }

  function draw(ctx, t) {
    if (!B) build(ctx.canvas.width, ctx.canvas.height);
    const ph = LN.phase(t, LOOP);
    const cam = LN.loopWander(ph, 0.45, 5, 'cam');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = K.tone(1);
    ctx.fillRect(0, 0, W, H);
    const lay = (img, depth) => ctx.drawImage(img, (-M + cam[0] * depth) * S, (-M + cam[1] * depth) * S);
    lay(B.far, 0.15);
    mist(ctx, ph, cam, MIST.far);
    birds(ctx, ph, cam);
    lay(B.side, 0.35);
    mist(ctx, ph, cam, MIST.side);
    lay(B.spire, 0.6);
    // the pine sways a little about its root
    const sway = 0.018 * LN.loopNoise1(ph, 0.5, 'pine');
    const px = (PINE_ROOT[0] + cam[0] * 0.6) * S, py = (PINE_ROOT[1] + cam[1] * 0.6) * S;
    ctx.save();
    ctx.translate(px, py); ctx.rotate(sway); ctx.translate(-px, -py);
    lay(B.pine, 0.6);
    ctx.restore();
    mist(ctx, ph, cam, MIST.gorge);
    lay(B.near, 1.0);
    mist(ctx, ph, cam, MIST.front);
    K.unify(ctx, paper, Math.round(ph * LOOP * FPS) % (LOOP * FPS));
  }

  window.INKCANVAS = { DW, DH, LOOP, FPS, build, draw };
})();

// The ink-wash look test: a tour van crossing a stone bridge between karst peaks, in mist.
// The van is the only red. Every card is baked and inkified once; each frame composites the
// cards with parallax, draws the mist and the van, then runs the whole-frame ink unify.
(function () {
  const K = window.INK;
  const W = 1280, H = 720, DUR = 12, FPS = 30;
  const PAN = 300; // camera travel in px over the film, at depth 1
  const RED = 'rgb(200,52,30)'; // IndieAgent red, under 2 percent of the frame

  // each plane: depth (parallax factor), drawn wide enough for its share of the pan
  const planeW = (depth) => Math.ceil(W + PAN * depth + 40);

  function peaksFar() {
    const w = planeW(0.2), h = H;
    const c = K.bake(w, h, (ctx) => {
      // two far ranges, palest at the back; no inner detail, bases dissolve into paper
      for (const [base, amp, v, seed] of [[330, 120, 0.8, 21], [370, 90, 0.7, 22]]) {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 4) {
          const n = K.fbm2(x * 0.004, 0.5, seed, 5);
          const spike = Math.pow(K.vnoise2(x * 0.011, 2.3, seed + 5), 3) * 0.9;
          ctx.lineTo(x, base - amp * (n * 0.9 + spike));
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, base - amp, 0, base + 90);
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

  // ---------- rock: a ragged mass filled light-to-mist, hemp-fibre texture, a dark contour on one side ----------
  // outline: a closed list of points. v: the mass's tone at its top. light: which side the light comes from.
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
    // fade above 1 keeps the base of the mass in ink (near rocks); below 1 it dissolves into mist
    g.addColorStop(1, K.tone(Math.min(0.95, v + 0.3), fade > 1 ? 0.5 : 0));
    ctx.fillStyle = g;
    ctx.fill(path);
    ctx.clip(path);
    // shadow side: a darker dry-brush wash down the far side from the light
    const sx = light < 0 ? maxX - wid * 0.28 : minX + wid * 0.28;
    const inkH = hgt * Math.min(1, fade * 0.75); // below this the mass has faded to mist: no texture there
    const nS = Math.max(4, Math.round(wid / 40));
    for (let k = 0; k < nS; k++) {
      const x0 = wid > 300 ? minX + r() * wid : sx + (r() - 0.5) * wid * 0.3;
      const y0 = minY + r() * inkH * 0.3, len = inkH * (0.4 + r() * 0.5);
      K.dryStroke(ctx, [[x0, y0], [x0 + (r() - 0.5) * 20, y0 + len * 0.5], [x0 + (r() - 0.5) * 30, y0 + len]],
        { width: Math.min(60, wid * 0.22), bristles: 10, dry: 0.55, seed: seed * 7 + k, fill: K.tone(Math.max(0, v - 0.2), 0.3) });
    }
    // hemp-fibre texture strokes: long, thin, gently curved, running down the slope
    const nF = Math.round((wid * hgt) / 1600 * fibres);
    for (let k = 0; k < nF; k++) {
      const x0 = minX + r() * wid, y0 = minY + r() * inkH * 0.85, len = 18 + r() * inkH * 0.25, bend = (r() - 0.5) * 14;
      K.stroke(ctx, [[x0, y0], [x0 + bend * 0.5, y0 + len * 0.5], [x0 + bend, y0 + len]],
        { width: 1.2 + r() * 1.6, profile: 'taper', rough: 0.4, seed: seed * 31 + k, fill: K.tone(Math.max(0, v - 0.18 - r() * 0.1), 0.35 + r() * 0.3) });
    }
    ctx.restore();
    // contour: a pressure stroke down the outline's shadow side and over the top
    if (contour) {
      const top = outline.reduce((b, p) => (p[1] < b[1] ? p : b), outline[0]);
      const side = outline.filter((p) => (light < 0 ? p[0] >= top[0] - 2 : p[0] <= top[0] + 2) && p[1] < minY + hgt * 0.65);
      side.sort((a, b) => a[1] - b[1]);
      if (side.length > 2) K.stroke(ctx, side, { width: 3.2 * contour, profile: 'brush', rough: 0.45, seed: seed + 9, fill: K.tone(Math.max(0, v - 0.32), 0.85) });
    }
  }

  // a spire's outline: narrow lumpy top, sides that step out in ledges, wide base
  function spireOutline(cx, base, w, h, seed) {
    const L = [], R = [], steps = 16;
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

  // pines on a ridge: small flat needle fans on short dark trunks
  function ridgePines(ctx, x, y, n, size, v, seed) {
    const r = K.rng(seed);
    for (let i = 0; i < n; i++) {
      const px = x + (r() - 0.5) * size * 4, py = y + r() * size * 0.8, s = size * (0.6 + r() * 0.6);
      K.stroke(ctx, [[px, py + s * 1.4], [px + (r() - 0.5) * 3, py - s * 0.6]], { width: s * 0.22, profile: 'needle', seed: seed + i, fill: K.tone(v, 1) });
      for (let k = 0; k < 3; k++) {
        const ty = py - k * s * 0.42;
        K.blob(ctx, px, ty, s * (0.9 - k * 0.22), s * 0.16, { n: 10, jit: 0.35, seed: seed * 3 + i * 7 + k, fill: K.tone(v, 0.95) });
      }
    }
  }

  // one peak: a main spire with lower shoulders behind and in front, pines and moss on the top
  function peak(ctx, cx, base, w, h, v, seed) {
    const r = K.rng(seed);
    const back = spireOutline(cx + (r() - 0.5) * w * 0.8, base, w * 0.9, h * (0.55 + r() * 0.2), seed + 1);
    rockMass(ctx, back, Math.min(0.9, v + 0.1), seed + 1, { contour: 0.7 });
    const main = spireOutline(cx, base, w, h, seed);
    rockMass(ctx, main, v, seed);
    const front = spireOutline(cx + (r() - 0.5) * w * 0.6, base, w * 0.75, h * (0.3 + r() * 0.15), seed + 2);
    rockMass(ctx, front, Math.max(0, v - 0.05), seed + 2, { contour: 0.8 });
    const topY = base - h - w * 0.08;
    K.dots(ctx, cx, topY + 6, w * 0.25, 22, 2.2, { seed: seed + 5, fill: K.tone(Math.max(0, v - 0.35), 0.9) });
    if (r() < 0.75) ridgePines(ctx, cx + (r() - 0.5) * w * 0.3, topY - 2, 2 + Math.floor(r() * 3), 7 + r() * 5, Math.max(0, v - 0.38), seed + 6);
  }

  function peaksMid() {
    const w = planeW(0.5), h = H;
    const c = K.bake(w, h, (ctx) => {
      // a back cluster, paler and smaller, then the front cluster
      const back = [[60, 470, 110, 250], [250, 480, 90, 210], [470, 470, 120, 270], [700, 480, 100, 230], [960, 470, 120, 280], [1200, 480, 100, 240], [1420, 470, 110, 260]];
      back.forEach(([x, b, wd, ht], i) => peak(ctx, x, b, wd, ht, 0.58, 140 + i * 11));
      const front = [[150, 500, 150, 330], [400, 510, 120, 260], [640, 500, 170, 360], [930, 510, 140, 300], [1180, 500, 160, 350], [1440, 510, 130, 290]];
      front.forEach(([x, b, wd, ht], i) => peak(ctx, x, b, wd, ht, 0.36, 240 + i * 13));
    });
    return K.inkify(c, { edge: 0.42, gran: 0.26, bleed: 1.0, seed: 2 });
  }

  // the bridge plane: two cliffs rising above the road, a hump-backed stone arch over the gorge.
  // Returns the card and the road height function (plane coordinates) for the van.
  function bridgePlane() {
    const w = planeW(0.8), h = H;
    const gapL = 560, gapR = 900, mid = (gapL + gapR) / 2;
    const road = (x) => {
      if (x < gapL) return 470 + Math.sin(x * 0.011) * 5 + (gapL - x) * 0.035;
      if (x > gapR) return 468 + Math.sin(x * 0.009 + 1) * 5 + (x - gapR) * 0.03;
      const s = (x - gapL) / (gapR - gapL);
      return 470 - Math.sin(Math.PI * s) * 22; // the hump
    };
    const c = K.bake(w, h, (ctx) => {
      // cliffs: masses that rise above the road on the outer sides, with the road cut along their face
      const cliff = (x0, x1, faceX, side, seed) => {
        const pts = [];
        const steps = 20;
        for (let i = 0; i <= steps; i++) {
          const x = x0 + (x1 - x0) * (i / steps);
          const rise = Math.min(230, Math.max(0, Math.abs(x - faceX) - 50) * 0.5);
          pts.push([x, road(x) + 6 - rise * (0.6 + K.fbm2(x * 0.01, 2, seed, 3)) - (K.vnoise2(x * 0.04, 5, seed) - 0.5) * 14]);
        }
        const face = [];
        for (let y = road(faceX) + 10; y <= h + 10; y += 9) face.push([faceX + side * ((K.fbm2(y * 0.03, 5, seed, 4) - 0.5) * 70 + Math.floor((y - 470) / 38) * 9 + (y - 470) * 0.06), y]);
        // left cliff: top runs out to the face, then down it; right cliff: top runs away from the face,
        // down the far edge, then back up the face
        return side < 0 ? [...pts, ...face, [x0, h + 10]] : [...pts, [x1, h + 10], ...face.reverse()];
      };
      rockMass(ctx, cliff(-20, gapL + 14, gapL + 14, -1, 61), 0.2, 61, { fade: 0.5, fibres: 1.0, light: 1 });
      rockMass(ctx, cliff(gapR - 14, w + 20, gapR - 14, 1, 62), 0.24, 62, { fade: 0.5, fibres: 1.0 });
      // the road: a pale ledge cut into each cliff face
      for (const [a, b, s] of [[0, gapL + 4, 72], [gapR - 4, w, 73]]) {
        const pts = [];
        for (let x = a; x <= b; x += 30) pts.push([x, road(x) + 2]);
        K.stroke(ctx, pts, { width: 5, profile: 'even', rough: 0.2, seed: s, fill: K.tone(0.7, 0.9) });
        K.stroke(ctx, pts.map(([x, y]) => [x, y + 5]), { width: 2, profile: 'even', rough: 0.3, seed: s + 1, fill: K.tone(0.05, 0.7) });
      }
      // the arch bridge: parapet, deck, one round arch springing from both cliffs
      const span = (gapR - gapL) / 2 + 6;
      const body = new Path2D();
      body.moveTo(gapL - 10, road(gapL) - 4);
      for (let x = gapL - 10; x <= gapR + 10; x += 8) body.lineTo(x, road(Math.min(gapR, Math.max(gapL, x))) - 6);
      body.lineTo(gapR + 10, road(gapR) + 28);
      body.ellipse(mid, road(gapR) + 120, span - 8, 112, 0, 0, Math.PI, true);
      body.lineTo(gapL - 10, road(gapL) + 28);
      body.closePath();
      ctx.fillStyle = K.tone(0.34, 1);
      ctx.fill(body);
      ctx.save();
      ctx.clip(body);
      const r = K.rng(74);
      for (let k = 0; k < 40; k++) {
        const x = gapL + r() * (gapR - gapL), y = road(x) + 4 + r() * 50;
        K.stroke(ctx, [[x, y], [x + 10 + r() * 14, y + (r() - 0.5) * 2]], { width: 1.4, profile: 'taper', seed: 400 + k, fill: K.tone(0.16, 0.5) });
      }
      ctx.restore();
      const deck = [];
      for (let x = gapL - 10; x <= gapR + 10; x += 12) deck.push([x, road(Math.min(gapR, Math.max(gapL, x))) - 7]);
      K.stroke(ctx, deck, { width: 3.5, profile: 'even', rough: 0.25, seed: 70, fill: K.tone(0.04, 0.95) });
      const arch = [];
      for (let k = 0; k <= 24; k++) { const a = Math.PI + (k / 24) * Math.PI; arch.push([mid + Math.cos(a) * (span - 8), road(gapR) + 120 + Math.sin(a) * 112]); }
      K.stroke(ctx, arch, { width: 4.5, profile: 'taper', rough: 0.3, seed: 71, fill: K.tone(0.06, 0.85) });
      // parapet posts
      for (let x = gapL + 8; x < gapR; x += 26) K.stroke(ctx, [[x, road(x) - 7], [x, road(x) - 15]], { width: 2.4, profile: 'even', seed: 500 + x, fill: K.tone(0.08, 0.9) });
    });
    return { card: K.inkify(c, { edge: 0.45, gran: 0.22, bleed: 1.1, seed: 3 }), road };
  }

  // the near plane: a black rock mass bottom left in tiers, and a pine leaning out over the gorge
  function nearPlane() {
    const w = planeW(1.15), h = H;
    const c = K.bake(w, h, (ctx) => {
      const tier = (pts, v, seed) => rockMass(ctx, pts, v, seed, { fade: 1.2, fibres: 1.6, light: 1, contour: 1.6 });
      tier([[-20, 330], [60, 300], [140, 312], [200, 360], [236, 420], [250, 470], [-20, 480]], 0.18, 81);
      tier([[-20, 430], [80, 400], [170, 410], [250, 450], [300, 520], [320, 600], [-20, 600]], 0.08, 82);
      tier([[-20, 560], [120, 540], [250, 560], [330, 620], [360, 730], [-20, 730]], 0.02, 83);
      K.dots(ctx, 100, 306, 80, 46, 3.4, { seed: 90, fill: K.tone(0, 1) });
      K.dots(ctx, 180, 412, 70, 30, 3.0, { seed: 91, fill: K.tone(0, 1) });
      // the pine: a twisting trunk leaning out, branches, needle-fan pads
      K.stroke(ctx, [[110, 310], [140, 250], [200, 196], [270, 168], [360, 160], [430, 172]], { width: 26, profile: 'brush', rough: 0.5, seed: 92, fill: K.tone(0.02, 1) });
      K.dryStroke(ctx, [[120, 300], [150, 245], [205, 198], [272, 172]], { width: 10, bristles: 8, dry: 0.4, seed: 93, fill: K.tone(0.45, 0.6) });
      K.stroke(ctx, [[200, 196], [230, 140], [280, 108]], { width: 9, profile: 'needle', seed: 94, fill: K.tone(0.02, 1) });
      K.stroke(ctx, [[330, 162], [370, 126], [420, 112]], { width: 7, profile: 'needle', seed: 95, fill: K.tone(0.02, 1) });
      const pads = [[440, 168, 92, 24], [470, 140, 60, 18], [410, 118, 70, 20], [350, 136, 58, 17], [285, 106, 76, 21], [300, 132, 50, 15], [232, 166, 52, 15], [505, 190, 44, 13]];
      pads.forEach(([px, py, rx, ry], i) => {
        const pr = K.rng(100 + i);
        K.blob(ctx, px, py + 3, rx * 0.85, ry * 0.5, { seed: 300 + i, fill: K.tone(0.18, 0.55) });
        for (let k = 0; k < 64; k++) {
          const a = Math.PI * (1.02 + (k / 63) * 0.96);
          const x0 = px + (pr() - 0.5) * rx * 0.4, y0 = py + 3;
          K.stroke(ctx, [[x0, y0], [px + Math.cos(a) * rx * (0.55 + pr() * 0.5), py + Math.sin(a) * ry * (0.7 + pr() * 0.7)]],
            { width: 2, profile: 'needle', seed: 200 + i * 70 + k, fill: K.tone(0.03, 0.8) });
        }
        K.stroke(ctx, [[px - rx * 0.8, py + 4], [px, py + 6], [px + rx * 0.8, py + 3]], { width: 2.5, profile: 'taper', seed: 600 + i, fill: K.tone(0, 0.9) });
      });
    });
    return K.inkify(c, { edge: 0.5, gran: 0.2, bleed: 1.2, seed: 4 });
  }

  // ---------- mist: wisps, not a fog band. Domain-warped noise stretched sideways, drawn low-res and scaled up ----------
  const MW = 200, MH = 112;
  const mistSmall = K.canvas(MW, MH);
  function mist(ctx, t, { y0, spread, amt, speed, depth, seed }) {
    const m = mistSmall.getContext('2d'), img = m.createImageData(MW, MH), d = img.data;
    const shift = (PAN * depth * camP(t)) / W * MW;
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      const Y = y / MH * H, band = Math.exp(-Math.pow((Y - y0) / spread, 2));
      if (band < 0.01) { d[(y * MW + x) * 4 + 3] = 0; continue; }
      const X = (x + shift) * 0.018 + t * speed, Yn = y * 0.07;
      const wx = K.fbm3(X * 0.7, Yn * 0.7, t * 0.04, seed + 20, 3), wy = K.fbm3(X * 0.7 + 5, Yn * 0.7 + 5, t * 0.04, seed + 30, 3);
      const n = K.fbm3(X + wx * 1.6, Yn + wy * 0.8, t * 0.05, seed, 4);
      const wisp = Math.min(1, Math.max(0, (n - 0.42) * 3.2));
      const a = Math.min(1, band * (0.25 + wisp * 0.9) * amt);
      const i = (y * MW + x) * 4;
      d[i] = K.PAPER[0]; d[i + 1] = K.PAPER[1]; d[i + 2] = K.PAPER[2]; d[i + 3] = a * 255;
    }
    m.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(mistSmall, 0, 0, W, H);
  }

  // ---------- the van, the only red ----------
  function van(ctx, x, y, bob) {
    ctx.save();
    ctx.translate(x, y - 10 + bob);
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.moveTo(-11, 2); ctx.lineTo(-11, -6); ctx.quadraticCurveTo(-11, -9, -7, -9); ctx.lineTo(5, -9);
    ctx.lineTo(10, -3); ctx.lineTo(11, 2); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = K.tone(0.85, 0.9);
    ctx.fillRect(4, -7, 4, 3);
    ctx.fillStyle = K.tone(0, 1);
    ctx.beginPath(); ctx.arc(-6, 3, 2.4, 0, Math.PI * 2); ctx.arc(6, 3, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // birds: three small strokes crossing the sky
  function birds(ctx, t) {
    ctx.strokeStyle = K.tone(0.15, 0.85);
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const x = 760 + i * 34 - t * 18, y = 120 + i * 12 + Math.sin(t * 1.4 + i) * 3, f = Math.sin(t * 5 + i * 1.3) * 3;
      ctx.beginPath();
      ctx.moveTo(x - 7, y - f); ctx.quadraticCurveTo(x - 3, y - 2, x, y); ctx.quadraticCurveTo(x + 3, y - 2, x + 7, y - f);
      ctx.stroke();
    }
  }

  // ---------- timing ----------
  const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  // the camera moves at an even pace with soft starts and stops
  const camP = (t) => {
    const p = clamp(t / DUR);
    const v = p < 0.1 ? 0.5 * p * p / 0.1 : p > 0.9 ? 0.9 - 0.5 * (1 - p) * (1 - p) / 0.1 : p - 0.05;
    return v / 0.9;
  };
  // paint-in by value: darkest ink first, palest last
  const inAt = (t, t0, d = 0.9) => ease(clamp((t - t0) / d));

  let B = null, paper = null;
  function build() {
    B = { far: peaksFar(), mid: peaksMid(), bridge: bridgePlane(), near: nearPlane() };
    paper = K.paperField(W, H, 5);
  }

  function draw(ctx, t) {
    if (!B) build();
    const cam = camP(t) * PAN;
    ctx.fillStyle = K.tone(1);
    ctx.fillRect(0, 0, W, H);
    const lay = (img, depth, a, dy = 0) => { if (a <= 0) return; ctx.globalAlpha = a; ctx.drawImage(img, -cam * depth, dy); ctx.globalAlpha = 1; };
    lay(B.far, 0.2, inAt(t, 0.9));
    mist(ctx, t, { y0: 380, spread: 60, amt: 0.9 * inAt(t, 0.4, 1.2), speed: 0.05, depth: 0.3, seed: 1 });
    lay(B.mid, 0.5, inAt(t, 0.55));
    birds(ctx, t);
    mist(ctx, t, { y0: 470, spread: 70, amt: 1.0 * inAt(t, 0.3, 1.2), speed: 0.08, depth: 0.6, seed: 2 });
    lay(B.bridge.card, 0.8, inAt(t, 0.25));
    // the van: from the left cliff, over the bridge, to the right, from 1.4 s to 11.2 s
    const p = clamp((t - 1.4) / 9.8), vx = 420 + p * 820;
    const vy = B.bridge.road(vx);
    const bob = Math.sin(t * 18) * 0.4 + (Math.abs(vx - 560) < 6 || Math.abs(vx - 900) < 6 ? 0.8 : 0);
    ctx.globalAlpha = inAt(t, 0.9, 0.5);
    van(ctx, vx - cam * 0.8, vy, bob);
    ctx.globalAlpha = 1;
    mist(ctx, t, { y0: 640, spread: 90, amt: 0.95 * inAt(t, 0.2, 1.2), speed: 0.11, depth: 0.9, seed: 3 });
    lay(B.near, 1.15, inAt(t, 0));
    K.unify(ctx, paper, Math.round(t * FPS));
  }

  window.INKWASH = { W, H, DUR, FPS, draw, build };
})();

// hand.js · paper, pen and pencil for the pen-and-pencil plate. Window global HAND.
//
// Everything is a stroke: a polyline in page px (1920x1080 space) with a kind, a width, a colour and a time window
// [t0, t1] in which the hand draws it from its first point to its last. Each frame is drawn from nothing, so the
// page is pure in t (render frames in any order). The line boils on twos: each stroke's wobble is keyed to
// floor(frame / 2), so every mark holds its shape for two frames and then moves on.
//   kind 'ink'     warm-black pen, a filled ribbon whose width swells and tapers with pressure
//   kind 'pencil'  coloured pencil, a thin line that only touches the crests of the paper's tooth
//   kind 'blue'    construction pencil (non-photo blue), same as pencil, laid down first
(function () {
  'use strict';
  const W = 1920, H = 1080, FPS = 24;

  // ---- deterministic noise ---------------------------------------------------------------------------
  function h32(a, b = 0, c = 0) {
    let h = 0x9e3779b9 ^ Math.imul(a | 0, 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 15) ^ (b | 0), 0xc2b2ae35); h ^= h >>> 13;
    h = Math.imul(h ^ (c | 0), 0x27d4eb2f); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function vnoise(seed, x) { const i = Math.floor(x), f = x - i, s = f * f * (3 - 2 * f); const a = h32(seed, i) * 2 - 1, b = h32(seed, i + 1) * 2 - 1; return a + (b - a) * s; }
  function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // ---- paper ---------------------------------------------------------------------------------------------
  // Cream ground with pulp mottling, a fine grain and laid fibres, plus a tooth mask (alpha) that pencil passes through.
  function makePaper(cw, ch, { base = [240, 228, 208], seed = 7 } = {}) {
    const k = cw / W;
    const paper = new OffscreenCanvas(cw, ch), tooth = new OffscreenCanvas(cw, ch);
    const pd = paper.getContext('2d').createImageData(cw, ch), td = tooth.getContext('2d').createImageData(cw, ch);
    const lowW = Math.ceil(cw / (48 * k)) + 2, lowH = Math.ceil(ch / (48 * k)) + 2, low = new Float32Array(lowW * lowH);
    for (let i = 0; i < low.length; i++) low[i] = h32(seed, i) * 2 - 1;
    const midS = 7 * k, midW = Math.ceil(cw / midS) + 2, midH = Math.ceil(ch / midS) + 2, mid = new Float32Array(midW * midH);
    for (let i = 0; i < mid.length; i++) mid[i] = h32(seed + 1, i) * 2 - 1;
    const bil = (g, gw, x, y) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, i = yi * gw + xi;
      return (g[i] * (1 - fx) + g[i + 1] * fx) * (1 - fy) + (g[i + gw] * (1 - fx) + g[i + gw + 1] * fx) * fy; };
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
      const lo = bil(low, lowW, x / (48 * k), y / (48 * k)), mi = bil(mid, midW, x / midS, y / midS), fine = h32(seed + 2, x, y) * 2 - 1;
      const v = lo * 3.2 + mi * 1.6 + fine * 2.4, i = (y * cw + x) * 4;
      pd.data[i] = base[0] + v; pd.data[i + 1] = base[1] + v; pd.data[i + 2] = base[2] + v * 1.1; pd.data[i + 3] = 255;
      // tooth: crests take pencil, valleys stay bare; light pressure shows the grain
      const crest = 0.55 + 0.5 * mi + 0.35 * fine;
      td.data[i + 3] = Math.max(0, Math.min(255, crest * 255));
    }
    paper.getContext('2d').putImageData(pd, 0, 0); tooth.getContext('2d').putImageData(td, 0, 0);
    // fibres laid along the machine direction
    const g = paper.getContext('2d'), r = rng(seed + 3);
    g.lineCap = 'round';
    for (let n = 0; n < 2600; n++) {
      const x = r() * cw, y = r() * ch, len = (6 + r() * 26) * k, a = (r() - 0.5) * 0.9, bend = (r() - 0.5) * 6 * k;
      g.strokeStyle = r() < 0.6 ? 'rgba(255,250,238,0.35)' : 'rgba(150,120,90,0.07)';
      g.lineWidth = (0.4 + r() * 0.7) * k;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * len / 2 - Math.sin(a) * bend, y + Math.sin(a) * len / 2 + Math.cos(a) * bend, x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
    }
    return { paper, tooth };
  }

  // ---- strokes ---------------------------------------------------------------------------------------------
  let SEED = 1;
  // Make a stroke. P in page px. opts: kind, w, color, alpha, amp (wobble px), spacing (resample px), text (bool)
  function stroke(P, opts = {}) {
    const st = { kind: 'ink', w: 1.4, color: '#2b2320', alpha: 1, amp: 0.7, spacing: 3, text: false, t0: 0, t1: 0, ...opts, seed: SEED++ };
    st.P = resample(P, st.spacing);
    st.cum = [0]; for (let i = 1; i < st.P.length; i++) st.cum.push(st.cum[i - 1] + Math.hypot(st.P[i][0] - st.P[i - 1][0], st.P[i][1] - st.P[i - 1][1]));
    st.len = st.cum[st.cum.length - 1];
    return st;
  }
  function resample(P, sp) {
    const out = [P[0]];
    for (let i = 1; i < P.length; i++) {
      const [ax, ay] = P[i - 1], [bx, by] = P[i], d = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(d / sp));
      for (let j = 1; j <= n; j++) out.push([ax + (bx - ax) * j / n, ay + (by - ay) * j / n]);
    }
    return out;
  }
  // Schedule strokes in order over [t0, t1] with `hands` pens working at once: each stroke goes to the pen that
  // is free first. The pen speed is found by bisection so the last stroke, short strokes and pen lifts included,
  // ends at t1. Returns the end time.
  function spread(strokes, t0, t1, hands = 1, lift = 0.006, min = 0.012) {
    if (!strokes.length) return t0;
    const run = (v, write) => {
      const free = new Array(hands).fill(t0);
      for (const st of strokes) {
        let k = 0; for (let i = 1; i < hands; i++) if (free[i] < free[k]) k = i;
        const a = free[k], b = a + Math.max(min, st.len / v);
        if (write) { st.t0 = a; st.t1 = b; }
        free[k] = b + lift;
      }
      return Math.max(...free) - lift;
    };
    let lo = 1, hi = 1e7; for (let i = 0; i < 60; i++) { const v = Math.sqrt(lo * hi); if (run(v) > t1) lo = v; else hi = v; }
    return run(hi, true);
  }
  // One pen, in order, at a fixed speed (px/s). Returns the time the last stroke ends.
  function lane(strokes, t0, speed, lift = 0.015, min = 0.008) {
    let t = t0;
    for (const st of strokes) { st.t0 = t; st.t1 = t + Math.max(min, st.len / speed); t = st.t1 + lift; }
    return t;
  }

  // The points of a stroke drawn to progress u (0..1), wobbled by the hand for boil key b.
  function handPoints(st, u, b) {
    const P = st.P, cum = st.cum, L = st.len, upto = L * u;
    const A = st.amp, s1 = st.seed * 13 + b * 7919, s2 = st.seed * 29 + b * 104729;
    const gx = (h32(st.seed, b, 1) - 0.5) * A * 0.9, gy = (h32(st.seed, b, 2) - 0.5) * A * 0.9;
    const lam = st.text ? 18 : 70;
    const out = [], ws = [];
    for (let i = 0; i < P.length; i++) {
      let x = P[i][0], y = P[i][1], s = cum[i];
      if (s > upto) {
        if (i === 0) break;
        const f = (upto - cum[i - 1]) / Math.max(1e-6, s - cum[i - 1]);
        x = P[i - 1][0] + (x - P[i - 1][0]) * f; y = P[i - 1][1] + (y - P[i - 1][1]) * f; s = upto;
      }
      const a = P[Math.max(0, i - 1)], c = P[Math.min(P.length - 1, i + 1)];
      let nx = -(c[1] - a[1]), ny = c[0] - a[0]; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
      const off = A * (vnoise(s1, s / lam) + 0.3 * vnoise(s2, s / 6));
      out.push([x + nx * off + gx, y + ny * off + gy]); ws.push(s);
      if (s >= upto) break;
    }
    return { pts: out, s: ws };
  }

  // ---- rendering ------------------------------------------------------------------------------------------
  function renderer(canvas, strokes, { paperOpts } = {}) {
    const cw = canvas.width, ch = canvas.height, k = cw / W;
    const g = canvas.getContext('2d');
    const { paper, tooth } = makePaper(cw, ch, paperOpts);
    const pc = new OffscreenCanvas(cw, ch), pg = pc.getContext('2d');
    const ic = new OffscreenCanvas(cw, ch), ig = ic.getContext('2d');
    const ordered = strokes.slice().sort((a, b) => a.t0 - b.t0);
    const ease = (u) => 0.5 * u + 0.5 * u * u * (3 - 2 * u);

    function draw(t, { notext = false } = {}) {
      const frame = Math.round(t * FPS), b = Math.floor(frame / 2);
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
      g.drawImage(paper, 0, 0);
      pg.setTransform(1, 0, 0, 1, 0, 0); pg.globalCompositeOperation = 'source-over'; pg.clearRect(0, 0, cw, ch); pg.setTransform(k, 0, 0, k, 0, 0);
      ig.setTransform(1, 0, 0, 1, 0, 0); ig.clearRect(0, 0, cw, ch); ig.setTransform(k, 0, 0, k, 0, 0);
      pg.lineCap = 'round'; pg.lineJoin = 'round';
      for (const st of ordered) {
        if (st.t0 > t) break;
        if (notext && st.text) continue;
        const u = st.t1 <= t ? 1 : ease((t - st.t0) / Math.max(1e-6, st.t1 - st.t0));
        const { pts, s } = handPoints(st, u, b);
        if (pts.length < 2) continue;
        if (st.kind === 'ink') ribbon(ig, st, pts, s);
        else {
          pg.strokeStyle = st.color; pg.globalAlpha = st.alpha * (0.85 + 0.3 * h32(st.seed, b, 3)); pg.lineWidth = st.w;
          pg.beginPath(); pg.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) pg.lineTo(pts[i][0], pts[i][1]); pg.stroke();
        }
      }
      pg.globalAlpha = 1; pg.setTransform(1, 0, 0, 1, 0, 0); pg.globalCompositeOperation = 'destination-in'; pg.drawImage(tooth, 0, 0);
      g.globalCompositeOperation = 'multiply'; g.drawImage(pc, 0, 0); g.drawImage(ic, 0, 0);
      g.globalCompositeOperation = 'source-over';
    }
    // The pen: a filled ribbon, tapered at both ends, its width breathing with pressure along the line.
    function ribbon(c, st, pts, s) {
      const L = st.len, n = pts.length, left = [], right = [];
      for (let i = 0; i < n; i++) {
        const a = pts[Math.max(0, i - 1)], d = pts[Math.min(n - 1, i + 1)];
        let nx = -(d[1] - a[1]), ny = d[0] - a[0]; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
        const taper = Math.min(1, 0.35 + 0.65 * s[i] / 7) * Math.min(1, 0.4 + 0.6 * (L - s[i]) / 9);
        const hw = 0.5 * st.w * taper * (0.88 + 0.24 * vnoise(st.seed * 3 + 11, s[i] / 45));
        left.push([pts[i][0] + nx * hw, pts[i][1] + ny * hw]); right.push([pts[i][0] - nx * hw, pts[i][1] - ny * hw]);
      }
      c.fillStyle = st.color; c.globalAlpha = st.alpha;
      c.beginPath(); c.moveTo(left[0][0], left[0][1]);
      for (let i = 1; i < n; i++) c.lineTo(left[i][0], left[i][1]);
      for (let i = n - 1; i >= 0; i--) c.lineTo(right[i][0], right[i][1]);
      c.closePath(); c.fill();
      // a round nib at each end so short marks (dots, serifs) don't vanish
      const r0 = st.w * 0.3;
      c.beginPath(); c.arc(pts[0][0], pts[0][1], r0, 0, 7);
      c.moveTo(pts[n - 1][0] + r0, pts[n - 1][1]); c.arc(pts[n - 1][0], pts[n - 1][1], r0, 0, 7); c.fill();
      c.globalAlpha = 1;
    }
    return { draw };
  }

  window.HAND = { W, H, FPS, h32, vnoise, rng, stroke, spread, lane, renderer, resample };
})();

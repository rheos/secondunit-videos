// Relief-woodcut renderer. A block is painted as a TONE MAP (canvas 2D, block-local units):
//   R = tone (0 black, 255 white), G = pattern id * 16, B = red second colour (255 = red ink).
// Then a pixel pass turns tone into cut marks: white gouges whose width follows the tone (white-line cutting),
// knife-cut cross-hatching (black lines left standing, white lozenges cut out), flick cuts (short tapered gouges),
// radial contour cuts and ray cuts. Lines live in block units, so they scale with the camera like a real print.
// Ink is printed by multiply onto the paper, with woodgrain in the solid blacks and ink-starved patches.

const WC = (() => {
  // ---------- noise tables (seeded, fixed) ----------
  const NT = new Float32Array(1024); { const R = mulberry(4242); for (let i = 0; i < 1024; i++) NT[i] = R(); }
  const N2 = new Float32Array(256 * 256); { const R = mulberry(777); for (let i = 0; i < N2.length; i++) N2[i] = R(); }
  function vn(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); const a = NT[i & 1023], b = NT[(i + 1) & 1023]; return (a + (b - a) * u) * 2 - 1; }
  function vn2(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    const x0 = ix & 255, x1 = (ix + 1) & 255, y0 = (iy & 255) << 8, y1 = ((iy + 1) & 255) << 8;
    const a = N2[y0 + x0], b = N2[y0 + x1], c = N2[y1 + x0], d = N2[y1 + x1];
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy; // 0..1
  }

  // ---------- pattern registry (reset per block) ----------
  let PATS = [null];
  function reset() { PATS = [null]; }
  function reg(p) {
    if (PATS.length > 15) throw new Error('too many patterns in one block');
    p.sp = p.sp || 9; p.g = p.g || 0.85; p.wob = p.wob == null ? 0.12 : p.wob; p.jit = p.jit == null ? 0.25 : p.jit;
    const a = (p.a || 0) * Math.PI / 180; p.ca = Math.cos(a); p.sa = Math.sin(a);
    if (p.a2 != null) { const b = p.a2 * Math.PI / 180; p.cb = Math.cos(b); p.sb = Math.sin(b); }
    // tone LUTs: white half-width (white-line modes) and black half-width (black-line modes)
    p.lw = new Float32Array(256); p.lb = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const tn = i / 255; p.lw[i] = 0.5 * Math.pow(tn, p.g); p.lb[i] = 0.5 * Math.pow(1 - tn, p.g); }
    p.seed = p.seed || PATS.length * 13.7;
    PATS.push(p); return PATS.length - 1;
  }
  const P = {
    lin: (a, sp, o = {}) => reg({ ...o, t: 'lin', a, sp }),           // parallel white gouges
    dash: (a, sp, dl, duty, o = {}) => reg({ ...o, t: 'dash', a, sp, dl, duty }), // flick cuts
    wave: (a, sp, amp, wl, o = {}) => reg({ ...o, t: 'wave', a, sp, amp, wl }),
    rad: (cx, cy, sp, o = {}) => reg({ ...o, t: 'rad', cx, cy, sp }),  // concentric contour cuts
    ray: (cx, cy, n, o = {}) => reg({ ...o, t: 'ray', cx, cy, n }),    // rays from a point
    blk: (a, sp, o = {}) => reg({ ...o, t: 'blk', a, sp }),            // black lines on white (shading a white area)
    xh: (a, a2, sp, o = {}) => reg({ ...o, t: 'xh', a, a2, sp }),       // knife-cut cross-hatching
    brad: (cx, cy, sp, o = {}) => reg({ ...o, t: 'brad', cx, cy, sp }), // black contour lines on white
  };
  // colour for the tone map
  const C = (tone, id = 0, red = 0) => `rgb(${Math.round(clamp(tone) * 255)},${id * 16},${Math.round(red * 255)})`;
  function LG(g, x0, y0, x1, y1, stops, id = 0, red = 0) { const gr = g.createLinearGradient(x0, y0, x1, y1); for (const [o, tn] of stops) gr.addColorStop(o, C(tn, id, red)); return gr; }
  function RG(g, x0, y0, r0, x1, y1, r1, stops, id = 0, red = 0) { const gr = g.createRadialGradient(x0, y0, r0, x1, y1, r1); for (const [o, tn] of stops) gr.addColorStop(o, C(tn, id, red)); return gr; }

  // ---------- canvases ----------
  const TC = mkCanvas(W, H), TG = TC.getContext('2d', { willReadFrequently: true });
  const OC = mkCanvas(W, H), OG = OC.getContext('2d');
  let outBuf = null;

  // smooth coverage helper
  const cov = (x) => x <= 0 ? 0 : x >= 1 ? 1 : x;
  const TAU_ = Math.PI * 2;

  // Render one block. drawFn(g, P, C) paints in block-local units [0,bw]x[0,bh].
  // Screen placement: local (0,0) at (bx,by), scale s. Prints by multiply onto dst.
  function block(dst, bx, by, s, bw, bh, drawFn, opt = {}) {
    let rx = Math.floor(Math.max(0, bx - 6)), ry = Math.floor(Math.max(0, by - 6));
    let rx2 = Math.ceil(Math.min(W, bx + bw * s + 6)), ry2 = Math.ceil(Math.min(H, by + bh * s + 6));
    const rw = rx2 - rx, rh = ry2 - ry; if (rw <= 2 || rh <= 2) return;
    reset();
    TG.setTransform(1, 0, 0, 1, 0, 0); TG.globalAlpha = 1; TG.globalCompositeOperation = 'source-over';
    TG.fillStyle = C(1); TG.fillRect(0, 0, rw, rh);
    TG.setTransform(s, 0, 0, s, bx - rx, by - ry);
    TG.lineCap = 'round'; TG.lineJoin = 'round';
    // the block itself: irregular edges, solid wood
    const seed = opt.seed || 1;
    TG.beginPath();
    const ed = [];
    const nE = 40;
    for (let k = 0; k <= nE; k++) ed.push([bw * k / nE, (rnd(seed, k, 1) - .5) * 2.2]);
    TG.moveTo(0, 0);
    for (let k = 0; k <= nE; k++) TG.lineTo(bw * k / nE, ed[k][1]);
    for (let k = 0; k <= 20; k++) TG.lineTo(bw + (rnd(seed, k, 2) - .5) * 2.2, bh * k / 20);
    for (let k = nE; k >= 0; k--) TG.lineTo(bw * k / nE, bh + (rnd(seed, k, 3) - .5) * 2.2);
    for (let k = 20; k >= 0; k--) TG.lineTo((rnd(seed, k, 4) - .5) * 2.2, bh * k / 20);
    TG.closePath(); TG.fillStyle = C(0); TG.fill();
    // a fine white line cut inside the border (the cutter's frame)
    TG.strokeStyle = C(1); TG.lineWidth = 2.6; TG.strokeRect(9, 9, bw - 18, bh - 18);
    TG.save(); TG.beginPath(); TG.rect(15, 15, bw - 30, bh - 30); TG.clip();
    drawFn(TG, P, C);
    TG.restore();
    // small chips knocked out of the border (old blocks)
    for (let k = 0; k < 7; k++) {
      const side = k % 4, u = rnd(seed, k, 9);
      const x = side === 0 ? u * bw : side === 1 ? bw - 4 : side === 2 ? u * bw : 4, y = side === 0 ? 4 : side === 1 ? u * bh : side === 2 ? bh - 4 : u * bh;
      TG.fillStyle = C(1); TG.beginPath(); TG.ellipse(x, y, 2 + rnd(seed, k, 10) * 3, 1.5 + rnd(seed, k, 11) * 2, rnd(seed, k, 12) * 3, 0, TAU); TG.fill();
    }
    pass(dst, rx, ry, rw, rh, bx, by, s, seed, opt);
  }

  function pass(dst, rx, ry, rw, rh, bx, by, s, seed, opt) {
    const src = TG.getImageData(0, 0, rw, rh).data;
    if (!outBuf || outBuf.width !== rw || outBuf.height !== rh) outBuf = OG.createImageData(rw, rh);
    const o = outBuf.data;
    const inv = 1 / s;
    const K = opt.ink || [24, 20, 17], RD = [176, 42, 30];
    const dxr = Math.round(3 * s), dyr = Math.round(-2 * s); // red plate misregister
    const inkAmt = opt.inkAmt || 1;
    for (let y = 0; y < rh; y++) {
      const ly = (ry + y - by) * inv;
      for (let x = 0; x < rw; x++) {
        const i = (y * rw + x) << 2;
        const lx = (rx + x - bx) * inv;
        const T = src[i];
        let ink;
        if (T >= 251) ink = 0;
        else if (T <= 4) ink = 1;
        else {
          const id = (src[i + 1] + 8) >> 4;
          const p = id ? PATS[id] : null;
          if (!p) ink = 1 - T / 255;
          else {
            const spx = p.sp * s;
            let u, v, d;
            switch (p.t) {
              case 'lin': case 'dash': case 'blk': case 'wave': {
                u = (-lx * p.sa + ly * p.ca); v = (lx * p.ca + ly * p.sa); // a = direction the cuts run
                if (p.t === 'wave') u += p.amp * Math.sin(v / p.wl + p.seed);
                u /= p.sp; break;
              }
              case 'rad': case 'brad': {
                const dx = lx - p.cx, dy = ly - p.cy; u = Math.sqrt(dx * dx + dy * dy) / p.sp; v = (dx - dy) * .7; break;
              }
              case 'ray': {
                const dx = lx - p.cx, dy = ly - p.cy, r = Math.sqrt(dx * dx + dy * dy) + 1e-3;
                u = (Math.atan2(dy, dx) / TAU_ + .5) * p.n; v = r;
                const sp2 = TAU_ * r / p.n * s; // local spacing in px
                const li = Math.floor(u); u += p.wob * .6 * vn(li * 7.31 + v * .01 + p.seed);
                const f = u - Math.floor(u); d = Math.abs(f - .5);
                const h = p.lw[T] * (1 + p.jit * vn(li * 3.7 + 50 + v * .015));
                ink = cov((d - h) * sp2 + .5);
                break;
              }
              case 'xh': {
                const u1 = (-lx * p.sa + ly * p.ca) / p.sp, u2 = (-lx * p.sb + ly * p.cb) / p.sp;
                const l1 = Math.floor(u1), l2 = Math.floor(u2);
                const w1 = u1 + p.wob * vn(l1 * 5.1 + (lx * p.ca + ly * p.sa) * .02), w2 = u2 + p.wob * vn(l2 * 4.3 + 9 + (lx * p.cb + ly * p.sb) * .02);
                const d1 = Math.abs(w1 - Math.floor(w1) - .5), d2 = Math.abs(w2 - Math.floor(w2) - .5);
                const hb = p.lb[T];
                ink = Math.max(cov((hb - d1) * spx + .5), cov((hb - d2) * spx + .5));
                break;
              }
            }
            if (p.t !== 'ray' && p.t !== 'xh') {
              const li = Math.floor(u);
              u += p.wob * vn(li * 7.31 + v * .012 + p.seed);
              const li2 = Math.floor(u), f = u - li2; d = Math.abs(f - .5);
              const jit = 1 + p.jit * vn(li2 * 3.7 + 100 + v * .02 + p.seed);
              if (p.t === 'blk' || p.t === 'brad') {
                const hb = p.lb[T] * jit; ink = cov((hb - d) * spx + .5);
              } else {
                let h = p.lw[T] * jit;
                if (p.t === 'dash') {
                  const q = v / p.dl + rnd(li2, p.seed) * 7, fq = q - Math.floor(q);
                  h = fq < p.duty ? h * Math.sqrt(Math.sin(Math.PI * fq / p.duty)) * 1.25 : 0;
                }
                ink = cov((d - h) * spx + .5);
              }
            }
          }
        }
        // red plate (shifted)
        let red = 0;
        const xr = x - dxr, yr = y - dyr;
        if (xr >= 0 && yr >= 0 && xr < rw && yr < rh) red = src[((yr * rw + xr) << 2) + 2] / 255;
        // ink density: woodgrain along the plank, starved patches, overall unevenness
        let dens = inkAmt;
        if (ink > 0) {
          // woodgrain: long streaks along the plank, a little lighter where the grain was soft
          const gr = vn2(lx * .004 + 3, ly * .05 + 1.5 * vn2(lx * .003, ly * .02));
          dens *= .92 + .08 * Math.sin(ly * .42 + gr * 10) * Math.sin(ly * .42 + gr * 10);
          const st = vn2(lx * .02 + 40, ly * .12 + 17);
          if (st > .78) dens *= 1 - (st - .78) * .9;
        }
        const ak = ink * dens, ar = red * (.86 + .14 * vn2(lx * .05 + 70, ly * .05));
        const mk0 = 255 - ak * (255 - K[0]), mk1 = 255 - ak * (255 - K[1]), mk2 = 255 - ak * (255 - K[2]);
        o[i] = mk0 * (255 - ar * (255 - RD[0])) / 255;
        o[i + 1] = mk1 * (255 - ar * (255 - RD[1])) / 255;
        o[i + 2] = mk2 * (255 - ar * (255 - RD[2])) / 255;
        o[i + 3] = 255;
      }
    }
    OG.putImageData(outBuf, 0, 0);
    dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0); dst.globalCompositeOperation = 'multiply'; dst.globalAlpha = opt.alpha == null ? 1 : opt.alpha;
    dst.drawImage(OC, 0, 0, rw, rh, rx, ry, rw, rh); dst.restore();
  }

  return { block, P, C, LG, RG, vn, vn2 };
})();

// ---------- small drawing helpers for block art (block-local units) ----------
const Cw = WC.C;
function pth(g, pts, close = true) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); if (close) g.closePath(); }
function ell(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, TAU); }
function fillWith(g, style) { g.fillStyle = style; g.fill(); }
function ink(g, w) { g.strokeStyle = Cw(0); g.lineWidth = w; g.stroke(); }
function cutl(g, w) { g.strokeStyle = Cw(1); g.lineWidth = w; g.stroke(); }
function line(g, x0, y0, x1, y1) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); }
// a tapered gouge (white) or a tapered black stroke, from (x0,y0) to (x1,y1) bulging to width w
function gouge(g, x0, y0, x1, y1, w, tone = 1, bend = 0) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const mx = (x0 + x1) / 2 + nx * bend, my = (y0 + y1) / 2 + ny * bend;
  g.beginPath(); g.moveTo(x0, y0);
  g.quadraticCurveTo(mx + nx * w, my + ny * w, x1, y1);
  g.quadraticCurveTo(mx - nx * w, my - ny * w, x0, y0);
  g.fillStyle = Cw(tone); g.fill();
}

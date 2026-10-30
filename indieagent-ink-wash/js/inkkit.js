// Ink-wash kit: brush primitives, the ink pass on baked cards, and the whole-frame ink unify.
// Method after Leon Lin's shanshui (github.com/Leonxlnx/shanshui, MIT, Copyright (c) 2026 Leonxlnx):
// inkify (wet edge, granulation, bleed) and the frame pass (edge wobble along paper fibres, wicking,
// paper texture, dither). Ported to plain Canvas2D on the CPU so it renders anywhere, no WebGL.
// Study: references/leon-lin/STUDY-shanshui.md. Everything here is deterministic from its seeds.
(function () {
  const PAPER = [239, 231, 220];
  const INK = [11, 9, 6];

  // ---------- randomness and noise ----------
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(x, y, z, s) {
    let h = (x * 374761393 + y * 668265263 + z * 2147483647 + s * 1274126177) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  const sm = (t) => t * t * (3 - 2 * t);
  function vnoise2(x, y, s = 0) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = sm(x - xi), yf = sm(y - yi);
    const a = hash(xi, yi, 0, s), b = hash(xi + 1, yi, 0, s), c = hash(xi, yi + 1, 0, s), d = hash(xi + 1, yi + 1, 0, s);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  }
  function vnoise3(x, y, z, s = 0) {
    const zi = Math.floor(z), zf = sm(z - zi);
    const lo = vnoise2(x + zi * 17.3, y + zi * 31.7, s), hi = vnoise2(x + (zi + 1) * 17.3, y + (zi + 1) * 31.7, s);
    return lo + (hi - lo) * zf;
  }
  function fbm2(x, y, s = 0, oct = 4) {
    let v = 0, a = 0.5, f = 1, n = 0;
    for (let i = 0; i < oct; i++) { v += a * vnoise2(x * f, y * f, s + i); n += a; a *= 0.5; f *= 2.03; }
    return v / n;
  }
  function fbm3(x, y, z, s = 0, oct = 4) {
    let v = 0, a = 0.5, f = 1, n = 0;
    for (let i = 0; i < oct; i++) { v += a * vnoise3(x * f, y * f, z * f, s + i); n += a; a *= 0.5; f *= 2.03; }
    return v / n;
  }

  // every grey is ink diluted toward the paper, never a neutral grey (v: 0 ink, 1 paper)
  function toneRGB(v) { return INK.map((k, i) => Math.round(k + (PAPER[i] - k) * v)); }
  function tone(v, a = 1) { const c = toneRGB(v); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }

  // ---------- brush ----------
  // Catmull-Rom through the points, resampled every `step` px
  function spline(pts, step = 3) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
      const n = Math.max(2, Math.ceil(len / step));
      for (let j = 0; j < n; j++) {
        const t = j / n, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  const PROFILE = {
    brush: (s) => Math.min(1, s / 0.12) * Math.pow(1 - s, 0.6),     // swells fast, tapers long
    taper: (s) => Math.sin(Math.PI * Math.min(1, Math.max(0, s))),
    needle: (s) => Math.pow(1 - s, 1.4),
    even: () => 1,
  };
  // a pressure stroke: offset left and right along the normals, filled as one polygon
  function stroke(ctx, pts, { width = 6, profile = 'brush', rough = 0.25, seed = 1, fill = tone(0) } = {}) {
    const P = spline(pts), prof = PROFILE[profile] || profile, r = rng(seed);
    const L = [], R = [];
    let wob = 0;
    for (let i = 0; i < P.length; i++) {
      const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
      let nx = -(b[1] - a[1]), ny = b[0] - a[0];
      const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      wob = wob * 0.8 + (r() - 0.5) * 0.2;
      const w = width * 0.5 * Math.max(0.04, prof(i / (P.length - 1))) * (1 + rough * wob * 4);
      L.push([P[i][0] + nx * w, P[i][1] + ny * w]);
      R.push([P[i][0] - nx * w, P[i][1] - ny * w]);
    }
    ctx.beginPath();
    ctx.moveTo(L[0][0], L[0][1]);
    for (const p of L) ctx.lineTo(p[0], p[1]);
    for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }
  // dry brush: thin bristles across the width; outer bristles and the stroke end break first
  function dryStroke(ctx, pts, { width = 14, bristles = 12, dry = 0.5, seed = 1, fill = tone(0.1) } = {}) {
    const P = spline(pts, 2), r = rng(seed);
    ctx.fillStyle = fill;
    for (let k = 0; k < bristles; k++) {
      const off = (k / (bristles - 1) - 0.5) * width, edgeness = Math.abs(off) / (width / 2), bs = r() * 100;
      for (let i = 0; i < P.length - 1; i++) {
        const s = i / (P.length - 1);
        if (vnoise2(i * 0.15, k * 3.1, bs | 0) < dry * (0.55 + edgeness * 0.6 + s * 0.6) - 0.35) continue;
        const a = P[i], b = P[i + 1];
        let nx = -(b[1] - a[1]), ny = b[0] - a[0];
        const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
        const w = (width / bristles) * (0.6 + 0.8 * r()) * (1 - s * 0.5);
        ctx.beginPath();
        ctx.arc(a[0] + nx * off, a[1] + ny * off, Math.max(0.4, w * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  // irregular jittered polygon, smoothed with quadratics
  function blob(ctx, cx, cy, rx, ry, { n = 14, jit = 0.3, seed = 1, fill = tone(0.3) } = {}) {
    const r = rng(seed), P = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, k = 1 + (r() - 0.5) * 2 * jit;
      P.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
    }
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const p = P[i % n], q = P[(i + 1) % n], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      if (i === 0) ctx.moveTo(m[0], m[1]); else ctx.quadraticCurveTo(p[0], p[1], m[0], m[1]);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }
  // moss dots, sqrt-distributed in a radius
  function dots(ctx, cx, cy, rad, n, size, { seed = 1, fill = tone(0.05) } = {}) {
    const r = rng(seed);
    ctx.fillStyle = fill;
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * rad;
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.6, size * (0.6 + r() * 0.7), size * (0.4 + r() * 0.5), r() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }
  function bake(w, h, draw) {
    const c = canvas(w, h);
    draw(c.getContext('2d'), w, h);
    return c;
  }

  // ---------- the ink pass, once per baked card ----------
  // separable box blur of a Float32 plane
  function boxBlur(src, w, h, rad) {
    if (rad < 1) return src.slice();
    const tmp = new Float32Array(w * h), out = new Float32Array(w * h), d = 2 * rad + 1;
    for (let y = 0; y < h; y++) {
      let acc = 0;
      for (let x = -rad; x <= rad; x++) acc += src[y * w + Math.min(w - 1, Math.max(0, x))];
      for (let x = 0; x < w; x++) {
        tmp[y * w + x] = acc / d;
        acc += src[y * w + Math.min(w - 1, x + rad + 1)] - src[y * w + Math.max(0, x - rad)];
      }
    }
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let y = -rad; y <= rad; y++) acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
      for (let y = 0; y < h; y++) {
        out[y * w + x] = acc / d;
        acc += tmp[Math.min(h - 1, y + rad + 1) * w + x] - tmp[Math.max(0, y - rad) * w + x];
      }
    }
    return out;
  }
  // wet edge (pigment pools inside the rim), granulation (alpha breaks up in mid-tones),
  // bleed (a faint halo where the stroke wicked into the paper). Works on premultiplied planes.
  function inkify(src, { edge = 0.45, gran = 0.22, bleed = 1.2, grainScale = 1, seed = 0 } = {}) {
    const w = src.width, h = src.height, ctx = src.getContext('2d');
    const img = ctx.getImageData(0, 0, w, h), d = img.data, n = w * h;
    const A = new Float32Array(n), Rp = new Float32Array(n), Gp = new Float32Array(n), Bp = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const a = d[i * 4 + 3] / 255;
      A[i] = a; Rp[i] = d[i * 4] / 255 * a; Gp[i] = d[i * 4 + 1] / 255 * a; Bp[i] = d[i * 4 + 2] / 255 * a;
    }
    const r1 = Math.max(1, Math.round(bleed * 2)), r2 = Math.max(1, Math.round(bleed * 5));
    const mix = (p) => { const a = boxBlur(p, w, h, r1), b = boxBlur(p, w, h, r2); for (let i = 0; i < n; i++) a[i] = a[i] * 0.6 + b[i] * 0.4; return a; };
    const AB = mix(A), RB = mix(Rp), GB = mix(Gp), BB = mix(Bp);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, a = A[i], ab = AB[i];
      if (a <= 0 && ab <= 0.002) { d[i * 4 + 3] = 0; continue; }
      const rim = Math.min(1, Math.max(0, (a - ab) * 2.5)) * a;
      let cr = a > 0 ? Rp[i] / a : 0, cg = a > 0 ? Gp[i] / a : 0, cb = a > 0 ? Bp[i] / a : 0;
      const dark = 1 - edge * rim * 0.6;
      cr *= dark; cg *= dark; cb *= dark;
      const px = x * grainScale + seed * 37, py = y * grainScale + seed * 37;
      const g = vnoise2(px * 0.9, py * 0.9, seed) * 0.55 + vnoise2(px * 2.3 + 4, py * 2.3 + 4, seed + 1) * 0.3 + vnoise2(px * 0.25 + 9, py * 0.25 + 9, seed + 2) * 0.15;
      const mid = 4 * a * (1 - a);
      const a2 = Math.max(0, a * (1 - gran * (g - 0.35) * (0.6 + mid)));
      const halo = Math.max(0, ab - a) * 0.35;
      const hr = ab > 0 ? RB[i] / ab : cr, hg = ab > 0 ? GB[i] / ab : cg, hb = ab > 0 ? BB[i] / ab : cb;
      const AA = Math.min(1, a2 + halo);
      if (AA <= 0) { d[i * 4 + 3] = 0; continue; }
      d[i * 4] = Math.round(((cr * Math.min(1, a2) + hr * halo) / AA) * 255);
      d[i * 4 + 1] = Math.round(((cg * Math.min(1, a2) + hg * halo) / AA) * 255);
      d[i * 4 + 2] = Math.round(((cb * Math.min(1, a2) + hb * halo) / AA) * 255);
      d[i * 4 + 3] = Math.round(AA * 255);
    }
    const out = canvas(w, h);
    out.getContext('2d').putImageData(img, 0, 0);
    return out;
  }

  // ---------- paper, once ----------
  // a fibre field: mottle plus two crossed fibre directions minus specks; and its gradient
  function paperField(w, h, seed = 3) {
    const f = new Float32Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const m = fbm2(x * 0.012, y * 0.012, seed, 4) - 0.5;
      const s1 = vnoise2(x * 0.9 + y * 0.08, y * 0.05, seed + 7) - 0.5;
      const s2 = vnoise2(x * 0.05, y * 0.8 - x * 0.06, seed + 9) - 0.5;
      const sp = hash(x, y, 1, seed) > 0.9985 ? -1.5 : 0;
      f[y * w + x] = m * 0.9 + s1 * 0.35 + s2 * 0.3 + sp;
    }
    const gx = new Float32Array(w * h), gy = new Float32Array(w * h);
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      gx[i] = (f[i + 1] - f[i - 1]) * 0.5;
      gy[i] = (f[i + w] - f[i - w]) * 0.5;
    }
    return { w, h, f, gx, gy };
  }

  // ---------- whole-frame ink unify, every frame ----------
  // edges wobble along the paper fibres, dark ink wicks into lighter neighbours, paper texture,
  // vignette, and 1 LSB triangular dither so mist gradients don't band
  function unify(ctx, paper, frame, { wobble = 0.42, wick = 0.32, wickR = 1, paperAmt = 0.045, vignette = 0.1 } = {}) {
    const { w, h, f, gx, gy } = paper;
    const img = ctx.getImageData(0, 0, w, h), s = img.data, o = new Uint8ClampedArray(s.length);
    const k = wobble * 20;
    for (let y = 0; y < h; y++) {
      const vy = (y / h - 0.5) * 2;
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        // edge wobble: read the source a little along the fibre gradient
        const sx = Math.min(w - 1, Math.max(0, Math.round(x + gx[i] * k))), sy = Math.min(h - 1, Math.max(0, Math.round(y + gy[i] * k)));
        const j = (sy * w + sx) * 4;
        let r = s[j], g = s[j + 1], b = s[j + 2];
        // wicking: darker neighbours creep in (it can only darken)
        if (x > wickR && y > wickR && x < w - wickR - 1 && y < h - wickR - 1) {
          let mr = 255, mg = 255, mb = 255, ar = 0, ag = 0, ab = 0;
          for (let t = 0; t < 8; t++) {
            const a = (t / 8) * Math.PI * 2, q = ((sy + Math.round(Math.sin(a) * wickR)) * w + sx + Math.round(Math.cos(a) * wickR)) * 4;
            const nr = s[q], ng = s[q + 1], nb = s[q + 2];
            if (nr < mr) mr = nr; if (ng < mg) mg = ng; if (nb < mb) mb = nb;
            ar += nr; ag += ng; ab += nb;
          }
          ar /= 8; ag /= 8; ab /= 8;
          const wr = Math.min(r, ar + (mr - ar) * 0.35 + 6), wg = Math.min(g, ag + (mg - ag) * 0.35 + 6), wb = Math.min(b, ab + (mb - ab) * 0.35 + 6);
          r += (wr - r) * wick; g += (wg - g) * wick; b += (wb - b) * wick;
        }
        // paper texture, stronger in ink than on bare paper
        const dark = 1 - (r + g + b) / 765;
        const pf = 1 + paperAmt * f[i] * (0.45 + 1.1 * dark);
        // vignette
        const vx = (x / w - 0.5) * 2, vg = 1 - vignette * Math.min(1, (vx * vx + vy * vy) * 0.5);
        // triangular dither, deterministic per pixel and frame
        const dt = hash(x, y, frame, 11) + hash(x, y, frame, 12) - 1;
        o[i * 4] = r * pf * vg + dt;
        o[i * 4 + 1] = g * pf * vg + dt;
        o[i * 4 + 2] = b * pf * vg + dt;
        o[i * 4 + 3] = 255;
      }
    }
    img.data.set(o);
    ctx.putImageData(img, 0, 0);
  }

  window.INK = { PAPER, INK, rng, hash, vnoise2, vnoise3, fbm2, fbm3, tone, toneRGB, spline, stroke, dryStroke, blob, dots, canvas, bake, inkify, paperField, unify };
})();

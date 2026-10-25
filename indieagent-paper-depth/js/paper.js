// Paper depth, the paper engine: seeded randomness, paper textures baked into each piece, the lit and unlit
// cut edge, torn edges with a white core, baked drop shadows, and a multiplane camera.
//
// Adapted from Leon Lin's paper-fox (github.com/Leonxlnx/paper-fox, src/core: rng.js, paper.js, sprite.js,
// stage.js, geom.js, piece.js, post.js), MIT licence, Copyright (c) 2026 Leonxlnx. The notice is in
// LICENSE-paper-fox.md beside this folder's code. Changed for our pipeline: plain globals instead of ES modules
// (cloud renders load pages from file://), a smaller crumple texture, shadows whose offset and blur grow with the
// gap to the plane behind, and a fold transform per plane for the pop-up book. None of paper-fox's scenes, fox
// drawing or audio is used.
const PD = (() => {
  const W = 1920, H = 1080, F = 1000;

  // ---------------- maths ----------------
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
  const E = {
    in: (k) => clamp(k) ** 3,
    out: (k) => 1 - (1 - clamp(k)) ** 3,
    io: (k) => { k = clamp(k); return k < .5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2; },
    sine: (k) => .5 - .5 * Math.cos(Math.PI * clamp(k)),
  };

  // ---------------- seeded randomness (paper-fox core/rng.js) ----------------
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashString(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function hash2(x, y, seed = 0) {
    let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  class RNG {
    constructor(seed = 1) { this.seed = typeof seed === 'string' ? hashString(seed) : seed >>> 0; this.n = mulberry32(this.seed); }
    next() { return this.n(); }
    range(a, b) { return a + (b - a) * this.n(); }
    int(a, b) { return Math.floor(this.range(a, b + 1)); }
    pick(arr) { return arr[Math.floor(this.n() * arr.length)]; }
    chance(p) { return this.n() < p; }
  }
  // gradient noise, roughly [-1, 1]
  const GRAD = [...Array(16)].map((_, i) => [Math.cos(i / 16 * Math.PI * 2), Math.sin(i / 16 * Math.PI * 2)]);
  class Noise {
    constructor(seed = 1) {
      const r = mulberry32(typeof seed === 'string' ? hashString(seed) : seed);
      const p = new Uint8Array(256); for (let i = 0; i < 256; i++) p[i] = i;
      for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = p[i]; p[i] = p[j]; p[j] = t; }
      this.perm = new Uint8Array(512); for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
    }
    n2(x, y) {
      const P = this.perm, xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, X = xi & 255, Y = yi & 255;
      const g00 = GRAD[P[X + P[Y]] & 15], g10 = GRAD[P[X + 1 + P[Y]] & 15], g01 = GRAD[P[X + P[Y + 1]] & 15], g11 = GRAD[P[X + 1 + P[Y + 1]] & 15];
      const f = (t) => t * t * t * (t * (t * 6 - 15) + 10), u = f(xf), v = f(yf);
      const a = g00[0] * xf + g00[1] * yf, b = g10[0] * (xf - 1) + g10[1] * yf, c = g01[0] * xf + g01[1] * (yf - 1), d = g11[0] * (xf - 1) + g11[1] * (yf - 1);
      return 1.414 * ((a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v);
    }
    n1(x) { return this.n2(x, 7.31); }
    fbm(x, y, oct = 4) { let a = 1, f = 1, s = 0, n = 0; for (let i = 0; i < oct; i++) { s += a * this.n2(x * f, y * f); n += a; a *= .5; f *= 2; } return s / n; }
  }
  const noiseCache = new Map();
  const noise = (seed = 1) => { const k = typeof seed === 'string' ? hashString(seed) : seed; if (!noiseCache.has(k)) noiseCache.set(k, new Noise(k)); return noiseCache.get(k); };

  // ---------------- canvas helpers (paper-fox core/canvas.js) ----------------
  function surface(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return { canvas: c, ctx: c.getContext('2d') }; }
  function silhouette(src, color = '#fff') {
    const { canvas, ctx } = surface(src.width, src.height);
    ctx.drawImage(src, 0, 0); ctx.globalCompositeOperation = 'source-in'; ctx.fillStyle = color; ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
  }
  // blurred silhouette at reduced scale for big radii; pad is in source pixels
  function blurred(src, radius) {
    const s = radius > 24 ? .25 : radius > 6 ? .5 : 1, p = Math.ceil(radius * 2.6 + 2);
    const tmp = surface((src.width + p * 2) * s, (src.height + p * 2) * s);
    tmp.ctx.filter = `blur(${Math.max(.01, radius * s)}px)`;
    tmp.ctx.drawImage(silhouette(src, '#000'), p * s, p * s, src.width * s, src.height * s);
    return { canvas: tmp.canvas, pad: p };
  }

  // ---------------- paper textures, made once (paper-fox core/paper.js) ----------------
  const TEX = 512;
  function fieldToCanvas(field, N, spread) {
    let mean = 0; for (let i = 0; i < field.length; i++) mean += field[i]; mean /= field.length;
    let v = 0; for (let i = 0; i < field.length; i++) v += (field[i] - mean) ** 2;
    const sd = Math.sqrt(v / field.length) || 1;
    const { canvas, ctx } = surface(N, N); const img = ctx.createImageData(N, N);
    for (let i = 0; i < field.length; i++) {
      const g = clamp(128 + (field[i] - mean) / sd * spread, 0, 255);
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = g; img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0); return canvas;
  }
  // Crumpled paper as a lit height field: Voronoi ridges and creases at four scales, a tilt per cell,
  // shaded by a raking light so the facets come out with a light and a dark side.
  function makeCrumple(N, seed) {
    const r = mulberry32(seed), h = new Float32Array(N * N);
    const scales = [{ cells: 6, w: 1, ridge: true, tilt: .55 }, { cells: 12, w: .6, ridge: false, tilt: .45 }, { cells: 24, w: .35, ridge: true, tilt: .35 }, { cells: 48, w: .16, ridge: false, tilt: .2 }];
    for (const S of scales) {
      const C = S.cells, cs = N / C, px = new Float32Array(C * C), py = new Float32Array(C * C), tx = new Float32Array(C * C), ty = new Float32Array(C * C);
      for (let j = 0; j < C; j++) for (let i = 0; i < C; i++) {
        const k = j * C + i; px[k] = (i + .05 + .9 * r()) * cs; py[k] = (j + .05 + .9 * r()) * cs;
        const a = r() * Math.PI * 2; tx[k] = Math.cos(a) * S.tilt; ty[k] = Math.sin(a) * S.tilt;
      }
      for (let y = 0; y < N; y++) {
        const cj = Math.floor(y / cs);
        for (let x = 0; x < N; x++) {
          const ci = Math.floor(x / cs); let d1 = 1e9, d2 = 1e9, best = 0, bx = 0, by = 0;
          for (let dj = -1; dj <= 1; dj++) {
            const uj = cj + dj, jj = ((uj % C) + C) % C, oy = (uj - jj) * cs;
            for (let di = -1; di <= 1; di++) {
              const ui = ci + di, ii = ((ui % C) + C) % C, ox = (ui - ii) * cs, k = jj * C + ii;
              const qx = px[k] + ox, qy = py[k] + oy, d = (qx - x) ** 2 + (qy - y) ** 2;
              if (d < d1) { d2 = d1; d1 = d; best = k; bx = qx; by = qy; } else if (d < d2) d2 = d;
            }
          }
          const f1 = Math.sqrt(d1) / cs, f2 = Math.sqrt(d2) / cs;
          const relief = S.ridge ? f1 : -Math.min(f2 - f1, .35);
          const tilt = (tx[best] * (x - bx) + ty[best] * (y - by)) / cs;
          h[y * N + x] += S.w * cs * (relief + tilt) * .5;
        }
      }
    }
    const L = [-.55, -.6, .58], ll = Math.hypot(...L), lx = L[0] / ll, ly = L[1] / ll, lz = L[2] / ll, field = new Float32Array(N * N);
    for (let y = 0; y < N; y++) {
      const ym = ((y - 1 + N) % N) * N, yp = ((y + 1) % N) * N, yy = y * N;
      for (let x = 0; x < N; x++) {
        const dx = (h[yy + (x + 1) % N] - h[yy + (x - 1 + N) % N]) * .5, dy = (h[yp + x] - h[ym + x]) * .5;
        field[yy + x] = (-dx * lx - dy * ly + lz) / Math.hypot(dx, dy, 1);
      }
    }
    return fieldToCanvas(field, N, 30);
  }
  function tileNoise(x, y, period, seed) {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const w = (a) => ((a % period) + period) % period;
    const a = hash2(w(xi), w(yi), seed), b = hash2(w(xi + 1), w(yi), seed), c = hash2(w(xi), w(yi + 1), seed), d = hash2(w(xi + 1), w(yi + 1), seed);
    return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
  }
  // Paper fibre: mottling, fine grain, short curved fibres and specks.
  function makeFiber(N, seed, { mottle = 16, grain = 9, fibers = 700, specks = 500, fiberAlpha = .16, speckAlpha = .25 } = {}) {
    const r = mulberry32(seed), field = new Float32Array(N * N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let m = 0, amp = 1, norm = 0;
      for (let o = 0; o < 4; o++) { const per = 4 << o; m += amp * tileNoise(x / N * per, y / N * per, per, seed + o * 31); norm += amp; amp *= .55; }
      field[y * N + x] = (m / norm - .5) * 2 * mottle + (r() - .5) * 2 * grain;
    }
    const canvas = fieldToCanvas(field, N, Math.hypot(mottle, grain) * .55), ctx = canvas.getContext('2d');
    const wrap = (x, y, pad, fn) => { for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) { const X = x + ox, Y = y + oy; if (X > -pad && Y > -pad && X < N + pad && Y < N + pad) fn(X, Y); } };
    ctx.lineCap = 'round';
    for (let i = 0; i < fibers; i++) {
      const x = r() * N, y = r() * N, len = 3 + r() * r() * 18, a = r() * Math.PI * 2, bend = (r() - .5) * .9, light = r() < .62;
      ctx.strokeStyle = light ? `rgba(255,255,255,${fiberAlpha * (.5 + r())})` : `rgba(0,0,0,${fiberAlpha * .8 * (.5 + r())})`;
      ctx.lineWidth = .35 + r() * .7;
      wrap(x, y, len, (X, Y) => { ctx.beginPath(); ctx.moveTo(X, Y); ctx.quadraticCurveTo(X + Math.cos(a + bend) * len * .5, Y + Math.sin(a + bend) * len * .5, X + Math.cos(a) * len, Y + Math.sin(a) * len); ctx.stroke(); });
    }
    for (let i = 0; i < specks; i++) {
      const x = r() * N, y = r() * N, rad = .3 + r() * r() * 2, dark = r() < .5;
      ctx.fillStyle = dark ? `rgba(0,0,0,${speckAlpha * (.4 + r())})` : `rgba(255,255,255,${speckAlpha * (.4 + r())})`;
      wrap(x, y, rad, (X, Y) => { ctx.beginPath(); ctx.arc(X, Y, rad, 0, Math.PI * 2); ctx.fill(); });
    }
    return canvas;
  }
  const texCache = new Map();
  const BUILD = {
    crumple: () => makeCrumple(TEX, 7),
    fiber: () => makeFiber(TEX, 11),
    felt: () => makeFiber(TEX, 37, { mottle: 12, grain: 7, fibers: 2400, specks: 200, fiberAlpha: .2 }),
    brick: () => makeFiber(TEX, 23, { mottle: 22, grain: 14, fibers: 250, specks: 4000, speckAlpha: .4 }),
  };
  const texture = (name) => { if (!texCache.has(name)) texCache.set(name, BUILD[name]()); return texCache.get(name); };
  // soft-light recipes per material; scale is the texture's size in authored pixels
  const MATERIALS = {
    paper: [{ tex: 'fiber', amt: .7, scale: 1.4 }, { tex: 'crumple', amt: .45, scale: .9 }],
    smooth: [{ tex: 'fiber', amt: .55, scale: 1.4 }],
    crumpled: [{ tex: 'crumple', amt: 1.1, scale: .7 }, { tex: 'fiber', amt: .5, scale: 1.4 }],
    sky: [{ tex: 'crumple', amt: .42, scale: 1.1 }, { tex: 'fiber', amt: .5, scale: 1.6 }],
    felt: [{ tex: 'felt', amt: .85, scale: 1.2 }, { tex: 'crumple', amt: .25, scale: .8 }],
    brick: [{ tex: 'brick', amt: .9, scale: 1.2 }, { tex: 'crumple', amt: .4, scale: .8 }],
    none: [],
  };
  // Soft-light the texture into a painted canvas, only where it is opaque, so the grain belongs to the piece.
  function applyTexture(canvas, { res = 1, mat = 'paper', seed = 1 } = {}) {
    const recipe = Array.isArray(mat) ? mat : MATERIALS[mat];
    if (!recipe || !recipe.length) return;
    const ctx = canvas.getContext('2d'), tmp = surface(canvas.width, canvas.height), r = mulberry32(seed);
    for (const L of recipe) {
      const t = tmp.ctx; t.globalCompositeOperation = 'copy';
      const pat = t.createPattern(texture(L.tex), 'repeat');
      // quarter turns only: arbitrary angles resample the grain into a faint lattice
      pat.setTransform(new DOMMatrix().translate(r() * TEX, r() * TEX).rotate(Math.floor(r() * 4) * 90).scale(res * (L.scale ?? 1)));
      t.fillStyle = pat; t.fillRect(0, 0, canvas.width, canvas.height);
      t.globalCompositeOperation = 'destination-in'; t.drawImage(canvas, 0, 0);
      ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = Math.min(1, L.amt); ctx.drawImage(tmp.canvas, 0, 0);
      if (L.amt > 1) { ctx.globalAlpha = L.amt - 1; ctx.drawImage(tmp.canvas, 0, 0); }
      ctx.restore();
    }
  }
  // The cut edge of thick paper: the silhouette shifted toward the light and subtracted from itself leaves a
  // band on the lit edges (warm white), and the same on the far side in black. light points toward the light.
  function edgeLight(canvas, { res = 1, light = [-.5, -.85], width = 2.4, hi = .42, lo = .34, soft = .5, hiColor = '#fff6e2', loColor = '#000' } = {}) {
    const ctx = canvas.getContext('2d'), S = silhouette(canvas, '#fff');
    const band = (dir, color, alpha) => {
      if (!alpha) return;
      const b = surface(canvas.width, canvas.height);
      b.ctx.drawImage(S, 0, 0); b.ctx.globalCompositeOperation = 'destination-out';
      b.ctx.drawImage(S, -dir[0] * width * res, -dir[1] * width * res);
      b.ctx.globalCompositeOperation = 'source-in'; b.ctx.fillStyle = color; b.ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.globalAlpha = alpha;
      if (soft > 0) ctx.filter = `blur(${soft * res}px)`;
      ctx.drawImage(b.canvas, 0, 0); ctx.restore();
    };
    band(light, hiColor, hi); band([-light[0], -light[1]], loColor, lo);
  }

  // ---------------- geometry (paper-fox core/geom.js, piece.js) ----------------
  function subdivide(pts, maxLen = 6, closed = true) {
    const out = [], n = pts.length, m = closed ? n : n - 1;
    for (let i = 0; i < m; i++) {
      const a = pts[i], b = pts[(i + 1) % n], k = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / maxLen));
      for (let j = 0; j < k; j++) out.push([lerp(a[0], b[0], j / k), lerp(a[1], b[1], j / k)]);
    }
    if (!closed) out.push(pts[n - 1]);
    return out;
  }
  function normals(pts, closed = true) {
    const n = pts.length;
    return pts.map((p, i) => {
      const a = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
      return [dy / d, -dx / d];
    });
  }
  // a hand-torn outline: subdivide and push along the normals by fbm noise
  function tear(pts, { amp = 3, freq = .08, fine = .8, seed = 1, closed = true, step = 4 } = {}) {
    const sub = subdivide(pts, step, closed), nm = normals(sub, closed), nz = noise(seed);
    let dist = 0;
    return sub.map((p, i) => {
      if (i > 0) dist += Math.hypot(p[0] - sub[i - 1][0], p[1] - sub[i - 1][1]);
      const d = nz.fbm(dist * freq, seed * .13, 3) * amp + nz.n2(dist * .9, 3.7) * fine;
      return [p[0] + nm[i][0] * d, p[1] + nm[i][1] * d];
    });
  }
  function polyPath(pts) { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); return p; }
  function smoothPath(pts, tension = .5) {
    const p = new Path2D(), n = pts.length; p.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      p.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3, p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3, p2[0], p2[1]);
    }
    p.closePath(); return p;
  }
  function ellipsePts(cx, cy, rx, ry, n = 40, rot = 0) {
    const c = Math.cos(rot), s = Math.sin(rot);
    return [...Array(n)].map((_, i) => { const a = i / n * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * c - y * s, cy + x * s + y * c]; });
  }
  // a ridge line from x0 to x1 (for hills and mountains), closed down to yBottom
  function ridge(x0, x1, baseY, yBottom, { amp = 80, freq = .004, sharp = .6, seed = 1, step = 8, oct = 4 } = {}) {
    const nz = noise(seed), pts = [];
    for (let x = x0; x <= x1 + step; x += step) {
      let v = nz.fbm(x * freq, seed * .37, oct); v = lerp(v, 1 - Math.abs(v) * 2, sharp);
      pts.push([x, baseY - v * amp]);
    }
    pts.push([x1, yBottom], [x0, yBottom]);
    return pts;
  }
  // One cut-out drawn while baking: optional white torn core, the fill, then a faint contact shadow under it.
  function piece(ctx, pts, { fill = '#888', smooth = false, torn = null, rim = null, shadow = null } = {}) {
    const shape = torn ? tear(pts, torn) : pts;
    const path = smooth && !torn ? smoothPath(shape) : polyPath(shape);
    ctx.save();
    if (shadow) setShadow(ctx, shadow);
    if (rim) {
      const rp = polyPath(tear(pts, { ...(torn || {}), amp: (torn?.amp ?? 2) + (rim.width ?? 3), seed: (torn?.seed ?? 1) + 17 }));
      ctx.fillStyle = rim.color ?? '#f6efe0'; ctx.fill(rp); clearShadow(ctx);
    }
    ctx.fillStyle = fill; ctx.fill(path);
    ctx.restore();
    return path;
  }
  // canvas shadows ignore the transform, so they are scaled by the bake resolution
  function setShadow(ctx, { color = 'rgba(30,20,20,.35)', blur = 6, x = 2, y = 3 } = {}) {
    const k = ctx.__res || 1; ctx.shadowColor = color; ctx.shadowBlur = blur * k; ctx.shadowOffsetX = x * k; ctx.shadowOffsetY = y * k;
  }
  function clearShadow(ctx) { ctx.shadowColor = 'rgba(0,0,0,0)'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; }
  // Light and dark bands just inside one piece's outline (paper-fox piece.js bevelBands): the lit and unlit cut
  // edges of a piece painted inside a sprite, where the sprite-wide edgeLight can't reach.
  function bevel(ctx, path, { light = [-.5, -.85], width = 2, hi = .3, lo = .24, hiColor = '255,248,232', loColor = '0,0,0' } = {}) {
    const BIG = 1e5;
    ctx.save(); ctx.clip(path);
    const band = (dx, dy, col, a) => {
      const p = new Path2D(); p.rect(-BIG, -BIG, BIG * 2, BIG * 2); p.addPath(path, new DOMMatrix([1, 0, 0, 1, dx, dy]));
      ctx.fillStyle = `rgba(${col},${a})`; ctx.fill(p, 'evenodd');
    };
    if (hi) band(-light[0] * width, -light[1] * width, hiColor, hi);
    if (lo) band(light[0] * width, light[1] * width, loColor, lo);
    ctx.restore();
  }
  // One cut piece inside a sprite: a soft contact shadow on what lies beneath it, the fill, then its bevel.
  function cutp(ctx, path, fill, { light = [-.5, -.85], sh = 1, blur = 5, dist = 3, bev = {} } = {}) {
    ctx.save();
    if (sh > 0) setShadow(ctx, { color: `rgba(28,16,24,${.32 * sh})`, blur, x: -light[0] * dist, y: -light[1] * dist });
    ctx.fillStyle = fill; ctx.fill(path); ctx.restore();
    if (bev !== false) bevel(ctx, path, { light, ...bev });
    return path;
  }

  // ---------------- sprites: painted once, baked, then only moved (paper-fox core/sprite.js) ----------------
  // draw(ctx) paints in authored coords inside the box (x, y, w, h). The paper texture and the edge light are baked
  // in, and a blurred silhouette is kept for the drop shadow. shadow.blur is in authored px.
  function sprite({ x, y, w, h, res = 1, draw, mat = 'paper', seed = 1, light = [-.5, -.85], edge = {}, shadow = { blur: 10 } }) {
    const { canvas, ctx } = surface(w * res, h * res);
    ctx.__res = res; ctx.scale(res, res); ctx.translate(-x, -y); draw(ctx); ctx.__res = undefined;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    applyTexture(canvas, { res, mat, seed: typeof seed === 'string' ? hashString(seed) : seed });
    if (edge !== false) edgeLight(canvas, { res, light, ...edge });
    let sh = null;
    if (shadow) { const b = blurred(canvas, (shadow.blur ?? 10) * res); sh = { canvas: b.canvas, pad: b.pad / res }; }
    return { canvas, x, y, w: canvas.width / res, h: canvas.height / res, res, shadow: sh };
  }
  function drawShadow(ctx, s, dx, dy, alpha) {
    if (!s.shadow || alpha <= 0) return;
    const p = s.shadow.pad;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.drawImage(s.shadow.canvas, s.x - p + dx, s.y - p + dy, s.w + 2 * p, s.h + 2 * p); ctx.restore();
  }
  function drawPaper(ctx, s) { ctx.drawImage(s.canvas, s.x, s.y, s.w, s.h); }

  // ---------------- the multiplane camera (paper-fox core/stage.js layerMatrix) ----------------
  // Planes are authored as seen with the camera at rest. z = F moves 1:1 with a pan; nearer planes move faster.
  // cam: { x, y, z (dolly), zoom, roll }.
  function layerMatrix(cam, z, q = 1) {
    const d = z - (cam.z || 0);
    if (d <= 20) return null;
    const s = z / d, k = F / d, zoom = cam.zoom ?? 1, r = cam.roll ?? 0, cos = Math.cos(r), sin = Math.sin(r);
    const cx = W / 2, cy = H / 2, vx = -s * cx - (cam.x || 0) * k, vy = -s * cy - (cam.y || 0) * k, zs = zoom * s;
    return new DOMMatrix([cos * zs * q, sin * zs * q, -sin * zs * q, cos * zs * q, (cx + zoom * (cos * vx - sin * vy)) * q, (cy + zoom * (sin * vx + cos * vy)) * q]);
  }

  // A scene is a list of planes, far to near. A plane: { z, sprites: [{ s, x, y }], draw(ctx, t, env), hinge, sky }.
  // Each plane casts the shadows of its sprites onto whatever is already drawn behind it, offset away from the
  // light by an amount that grows with the gap to the plane behind (and, being drawn through the plane's
  // matrix, scales with the camera). fold(plane) returns { k } for the pop-up book: 0 standing, 1 flat.
  function renderPlanes(ctx, planes, cam, t, { light = [-.5, -.85], shadowAlpha = .42, fold = null, alpha = null, q = 1 } = {}) {
    for (let i = 0; i < planes.length; i++) {
      const P = planes[i];
      const a = alpha ? alpha(P) : 1;
      if (a <= .001) continue;
      const m = layerMatrix(cam, P.z, q);
      if (!m) continue;
      ctx.save();
      ctx.setTransform(m);
      ctx.globalAlpha = a;
      if (P.ox) ctx.translate(P.ox, 0);
      if (P.anim) { const o = P.anim(t); ctx.translate(o.x || 0, o.y || 0); }
      const k = fold ? fold(P) : 0;
      if (k > 0) {
        // fold the plane flat about its hinge line: it lies back onto the page, so it squashes toward the hinge
        const hy = P.hinge ?? 1000;
        ctx.translate(0, hy); ctx.scale(1, Math.max(.002, Math.cos(k * Math.PI / 2))); ctx.translate(0, -hy);
      }
      const behind = planes[i - 1];
      const gap = behind ? clamp((behind.z - P.z) / 1500, .15, 1.6) : 0;
      const Lt = P.light || light;
      const sd = P.shadowDist ?? 6 + 8 * Math.sqrt(gap), dx = -Lt[0] * sd, dy = -Lt[1] * sd;
      const env = { t, cam, light: Lt, plane: P, dx, dy, shadowAlpha: shadowAlpha * (1 - k * .7) * (P.shadowAlpha ?? 1), k };
      // an item may sway about its own origin (grass in the wind)
      const place = (it) => { if (it.x || it.y) ctx.translate(it.x || 0, it.y || 0); if (it.sway) ctx.rotate(it.sway(t)); };
      if (behind && P.sprites) for (const it of P.sprites) if (it.shadow !== false) {
        ctx.save(); ctx.translate(dx, dy); place(it); drawShadow(ctx, it.s, 0, 0, env.shadowAlpha); ctx.restore();
      }
      if (P.under) P.under(ctx, t, env);
      if (P.sprites) for (const it of P.sprites) { ctx.save(); place(it); drawPaper(ctx, it.s); ctx.restore(); }
      if (P.draw) P.draw(ctx, t, env);
      ctx.restore();
    }
  }

  // ---------------- finish (paper-fox core/post.js) ----------------
  const BW = 480, BH = 270; let small = null, small2 = null, grainTiles = null;
  function finish(ctx, { bloom = 0, threshold = .7, vignette = .26, grain = .05, frame = 0, grade = null } = {}) {
    const w = ctx.canvas.width, h = ctx.canvas.height;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (bloom > 0) {
      if (!small) { small = surface(BW, BH); small2 = surface(BW, BH); small.ctx.willReadFrequently = true; }
      small.ctx.globalCompositeOperation = 'copy'; small.ctx.drawImage(ctx.canvas, 0, 0, BW, BH);
      const img = small.ctx.getImageData(0, 0, BW, BH), d = img.data, t1 = Math.min(1, threshold + .25);
      for (let i = 0; i < d.length; i += 4) {
        const l = (.2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2]) / 255, kk = ss(threshold, t1, l);
        d[i] *= kk; d[i + 1] *= kk; d[i + 2] *= kk;
      }
      small.ctx.putImageData(img, 0, 0);
      small2.ctx.globalCompositeOperation = 'copy'; small2.ctx.filter = 'blur(10px)'; small2.ctx.drawImage(small.canvas, 0, 0); small2.ctx.filter = 'none';
      ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = Math.min(1, bloom); ctx.drawImage(small2.canvas, 0, 0, w, h); ctx.globalAlpha = 1;
    }
    if (grade) { ctx.globalCompositeOperation = grade.mode ?? 'soft-light'; ctx.globalAlpha = grade.amount; ctx.fillStyle = grade.color; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1; }
    if (vignette > 0) {
      ctx.globalCompositeOperation = 'multiply';
      const g = ctx.createRadialGradient(w / 2, h * .48, h * .35, w / 2, h * .5, Math.hypot(w, h) * .62);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, `rgba(58,48,64,${1 - vignette})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // multiply leaves the edges darker by (1 - vignette) mixed toward the plum tone
    }
    if (grain > 0) {
      if (!grainTiles) grainTiles = [...Array(6)].map((_, k) => {
        const r = mulberry32(900 + k), { canvas, ctx: c } = surface(256, 256), img = c.createImageData(256, 256);
        for (let i = 0; i < 256 * 256; i++) { const v = 128 + (r() + r() + r() - 1.5) / 1.5 * 110; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
        c.putImageData(img, 0, 0); return canvas;
      });
      const r = mulberry32(frame * 7919 + 13), pat = ctx.createPattern(grainTiles[frame % 6], 'repeat');
      pat.setTransform(new DOMMatrix().translate(Math.floor(r() * 256), Math.floor(r() * 256)));
      ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = grain; ctx.fillStyle = pat; ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }

  // a soft additive glow (lamps, bulbs, the door)
  function glow(ctx, x, y, r, color, alpha = 1) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= alpha;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color); g.addColorStop(.3, color.replace(/[\d.]+\)$/, m => (parseFloat(m) * .4) + ')')); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
  }

  return { W, H, F, clamp, lerp, ss, E, mulberry32, hashString, hash2, RNG, noise, surface, silhouette, blurred, texture, applyTexture, edgeLight,
    tear, polyPath, smoothPath, ellipsePts, ridge, piece, setShadow, clearShadow, bevel, cutp, sprite, drawShadow, drawPaper, layerMatrix, renderPlanes, finish, glow };
})();

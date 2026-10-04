// Cut-out kit in the manner of 1970s Gilliam animation: procedural steel engravings, hand tinted, cut out
// with scissors, laid on airbrushed skies, moved on single pivots on 2s and 3s.
//
// A PIECE is painted ONCE at load into an offscreen canvas. Its draw function runs three times:
//   tone: a grey value map (fills + gradients for volume). R = tone (0 black .. 1 paper), G = hatch angle.
//   tint: the watercolour wash (flat muted colours, blotched, blurred and slipped off the lines).
//   line: crisp ink (contours, eyes, type) and coloured inks (a red rubber stamp, a violet date stamp).
// engrave() turns the tone map into parallel lines whose spacing bends with the tone (so lines curve
// around a gradient-lit form), thicken with darkness, and cross-hatch in the darkest tones. Then the
// silhouette is grown a few pixels with a wobbling threshold (the scissor cut, with a paper margin) and a
// soft shadow canvas is made from it. Per frame a piece is only transformed and blitted.
(() => {
  const PAPER = [238, 228, 205], INKC = [40, 30, 24];
  const INK = 'rgb(40,30,24)';
  const TINT = { rose: '#d27c70', ochre: '#e2a446', sage: '#8cad78', prussian: '#4b78a2', flesh: '#efab84',
    red: '#c0402f', brass: '#dda13c', grey: '#9a978c', dun: '#a8946f', sky: '#8fb2c0', violet: '#7b6aa0', cream: '#efe0b8', moss: '#7aa34c' };

  // ---- a tileable value-noise texture (deterministic) ----
  const NZ = 256, NT = new Float32Array(NZ * NZ); { const r = rng(9137); for (let i = 0; i < NT.length; i++) NT[i] = r(); }
  function nz(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), u = x - xi, v = y - yi;
    const x0 = xi & 255, y0 = yi & 255, x1 = (x0 + 1) & 255, y1 = (y0 + 1) & 255;
    const su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v);
    const a = NT[y0 * NZ + x0], b = NT[y0 * NZ + x1], c = NT[y1 * NZ + x0], d = NT[y1 * NZ + x1];
    return a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv;
  }
  const fbmz = (x, y) => nz(x, y) * .55 + nz(x * 2.1 + 17, y * 2.1 + 5) * .3 + nz(x * 4.3 + 3, y * 4.3 + 41) * .15;

  const COS = new Float32Array(256), SIN = new Float32Array(256), COS2 = new Float32Array(256), SIN2 = new Float32Array(256);
  const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };

  // ---- path builders (design units) ----
  const E = (x, y, rx, ry = rx, r = 0) => (g) => g.ellipse(x, y, Math.abs(rx), Math.abs(ry), r, 0, TAU);
  const R = (x, y, w, h) => (g) => g.rect(x, y, w, h);
  const PL = (pts) => (g) => { pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };
  const L = (pts) => (g) => pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
  // closed smooth curve through the midpoints of the given points
  const BL = (pts) => (g) => {
    const n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const m0 = mid(pts[n - 1], pts[0]); g.moveTo(m0[0], m0[1]);
    for (let i = 0; i < n; i++) { const p = pts[i], m = mid(p, pts[(i + 1) % n]); g.quadraticCurveTo(p[0], p[1], m[0], m[1]); }
    g.closePath();
  };
  // open smooth curve
  const SC = (pts) => (g) => {
    g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) { const p = pts[i], q = pts[i + 1]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
    const l = pts[pts.length - 1]; g.lineTo(l[0], l[1]);
  };
  const ARC = (x, y, r, a0, a1) => (g) => g.arc(x, y, r, a0, a1);

  // fit a string into maxW (design units) by shrinking the font; returns the size used
  function fitFont(g, str, font, size, maxW) {
    g.font = font.replace('{s}', size); const w = g.measureText(str).width;
    if (w > maxW) { size = size * maxW / w; g.font = font.replace('{s}', size); }
    return size;
  }

  // ---- the painter handed to every draw function ----
  function painter(g, mode) {
    const toneCol = (v, ang) => `rgb(${Math.round(clamp(v) * 255)},${Math.round(clamp(128 + ang / (Math.PI / 2) * 127, 0, 255))},0)`;
    const P = (path) => { g.beginPath(); path(g); };
    const grad = (spec, ang) => {
      const G = spec[0] === 'r' ? g.createRadialGradient(spec[1], spec[2], spec[3], spec[1], spec[2], spec[4]) : g.createLinearGradient(spec[1], spec[2], spec[3], spec[4]);
      spec[5].forEach(([o, v]) => G.addColorStop(o, toneCol(v, ang))); return G;
    };
    return {
      mode, g, TINT,
      // fill: tone (number or gradient spec ['r',x,y,r0,r1,stops] / ['l',x0,y0,x1,y1,stops]), tint colour, hatch angle offset
      f(path, tone, tint, ang = 0) {
        if (mode === 'tone') g.fillStyle = typeof tone === 'number' ? toneCol(tone, ang) : grad(tone, ang);
        else if (mode === 'tint') { if (!tint) return; g.fillStyle = tint; } else return;
        P(path); g.fill();
      },
      // erase (cut a hole through everything already drawn in this layer)
      cut(path) { g.save(); g.globalCompositeOperation = 'destination-out'; P(path); g.fillStyle = '#000'; g.fill(); g.restore(); },
      // ink stroke (line layer)
      s(path, w = 2, col = INK) { if (mode !== 'line') return; P(path); g.lineWidth = w; g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); },
      // solid ink fill; solid=false keeps it out of the silhouette (a stamp printed on a card)
      ink(path, col = INK, solid = true) {
        if (mode === 'line') { g.fillStyle = col; P(path); g.fill(); }
        else if (mode === 'tone' && solid) { g.fillStyle = toneCol(0, 0); P(path); g.fill(); }
      },
      // a line of type, fitted to maxW; in the tone pass it also joins the silhouette when solid
      text(str, x, y, font, size, maxW, { col = INK, align = 'center', solid = false, base = 'alphabetic' } = {}) {
        if (mode === 'tint') return size;
        const sz = fitFont(g, str, font, size, maxW); g.textAlign = align; g.textBaseline = base;
        if (mode === 'line') { g.fillStyle = col; g.fillText(str, x, y); }
        else if (solid) { g.fillStyle = toneCol(0, 0); g.fillText(str, x, y); }
        return sz;
      },
      // parallel hatch strokes inside a path (for shading that must read as engraver's work at any tone)
      hatch(path, x0, y0, x1, y1, gap, ang, w = 1.4, col = INK) {
        if (mode !== 'line') return; g.save(); P(path); g.clip();
        const c = Math.cos(ang), sn = Math.sin(ang), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, r = Math.hypot(x1 - x0, y1 - y0) / 2;
        g.beginPath(); for (let d = -r; d <= r; d += gap) { g.moveTo(cx - sn * d - c * r, cy + c * d - sn * r); g.lineTo(cx - sn * d + c * r, cy + c * d + sn * r); }
        g.lineWidth = w; g.strokeStyle = col; g.stroke(); g.restore();
      },
    };
  }

  // ---- engraving + composite ----
  const PERIOD = 6.4; // world units between engraved lines when a piece is drawn at its native size
  function engrave(tone, tint, line, wpx, hpx, o) {
    const n = wpx * hpx, P = Math.max(2.6, PERIOD * RS * (o.period || 1)), iP = 1 / P;
    const td = tone.getContext('2d').getImageData(0, 0, wpx, hpx).data;
    const ld = line.getContext('2d').getImageData(0, 0, wpx, hpx).data;
    // the wash: blurred, slipped off the line plate
    const tb = mkCanvas(wpx, hpx), tg = tb.getContext('2d');
    tg.filter = `blur(${(2.2 * RS).toFixed(2)}px)`; tg.drawImage(tint, 3.5 * RS, 2.5 * RS); tg.filter = 'none';
    const tn = tg.getImageData(0, 0, wpx, hpx).data;
    // the scissor cut: blurred silhouette, thresholded at a wobbling level
    const mb = mkCanvas(wpx, hpx), mg = mb.getContext('2d');
    mg.filter = `blur(${(o.margin ?? 3.6) * RS}px)`; mg.drawImage(tone, 0, 0); mg.drawImage(line, 0, 0); mg.filter = 'none';
    const md = mg.getImageData(0, 0, wpx, hpx).data;
    const out = mkCanvas(wpx, hpx), og = out.getContext('2d'), img = og.createImageData(wpx, hpx), od = img.data;
    const a0 = o.ang ?? .55, cross = o.cross ?? 1.05, bend = o.bend ?? 2.8, seed = o.seed || 0;
    const sc = 1 / (11 * RS), sw = 1 / (60 * RS), sb = 1 / (34 * RS);
    for (let i = 0; i < 256; i++) { const a = a0 + (i - 128) / 127 * Math.PI / 2; COS[i] = Math.cos(a); SIN[i] = Math.sin(a); COS2[i] = Math.cos(a + cross); SIN2[i] = Math.sin(a + cross); }
    for (let y = 0, i = 0; y < hpx; y++) {
      for (let x = 0; x < wpx; x++, i++) {
        const j = i * 4;
        const mt = .5 + (nz(x * sc + seed, y * sc) - .5) * .5;              // threshold wobble along the cut
        const mv = md[j + 3] / 255; let m = (mv - (mt - .07)) / .14; m = m < 0 ? 0 : m > 1 ? 1 : m;
        const ta = td[j + 3] / 255; if (m <= 0 && ta <= 0) continue;
        const v = 1 - (1 - td[j] / 255) * ta, gi = ta > .02 ? td[j + 1] : 128;
        const cA = COS[gi], sA = SIN[gi];
        const warp = (nz(x * sw + 40 + seed, y * sw) - .5) * 1.1;
        // primary lines: spacing direction from the angle channel, bent by the tone itself
        let u = (x * cA + y * sA) * iP + v * bend + warp; u -= Math.floor(u);
        const d = Math.abs(u - .5) * P, dk = 1 - v, th = Math.pow(dk, 1.3) * P * .5 + (dk > .05 ? .16 : 0);
        let cov = th - d + .5; cov = cov < 0 ? 0 : cov > 1 ? 1 : cov;
        if (v < .52) {                                                         // cross-hatch in the darks
          const c2 = COS2[gi], s2 = SIN2[gi];
          let u2 = (x * c2 + y * s2) * iP * 1.05 + v * .6 + warp * .5; u2 -= Math.floor(u2);
          const th2 = (.52 - v) / .52 * P * .4, c22 = th2 - Math.abs(u2 - .5) * P + .5;
          if (c22 > cov) cov = c22 > 1 ? 1 : c22;
        }
        if (v < .08) cov = cov + (1 - cov) * (.08 - v) / .08;
        // paper, then the blotchy wash (multiply), then the engraved ink, then the line plate
        let r = PAPER[0], g = PAPER[1], b = PAPER[2];
        const wa = tn[j + 3] / 255;
        if (wa > 0) {
          const bl = .5 + .62 * fbmz(x * sb + seed * 3, y * sb), k = Math.min(1, wa * bl * (o.wash ?? 1.15));
          const ur = tn[j], ug = tn[j + 1], ub = tn[j + 2];
          r *= 1 - k + k * ur / 255 * 1.04; g *= 1 - k + k * ug / 255 * 1.04; b *= 1 - k + k * ub / 255 * 1.04;
        }
        const ik = cov * .94; r += (INKC[0] - r) * ik; g += (INKC[1] - g) * ik; b += (INKC[2] - b) * ik;
        const la = ld[j + 3] / 255; if (la > 0) { r += (ld[j] - r) * la; g += (ld[j + 1] - g) * la; b += (ld[j + 2] - b) * la; }
        od[j] = r; od[j + 1] = g; od[j + 2] = b; od[j + 3] = Math.max(m, ta) * 255;
      }
    }
    og.putImageData(img, 0, 0);
    const sh = mkCanvas(wpx / 4, hpx / 4), sg = sh.getContext('2d');
    sg.filter = `brightness(0) blur(${Math.max(1, 2.2 * RS).toFixed(1)}px)`; sg.drawImage(out, 0, 0, sh.width, sh.height);
    return { out, sh };
  }

  // piece(name, {w, h, px, py, size, pad, ang, ...}, draw)
  //   w,h: design box; px,py: the pivot in design units; size: world units per design unit
  const PIECES = {};
  function piece(name, o, draw) {
    const size = o.size || 1, pad = o.pad ?? 10, d = size * RS;
    const wpx = Math.ceil((o.w + pad * 2) * d), hpx = Math.ceil((o.h + pad * 2) * d);
    const C = { tone: mkCanvas(wpx, hpx), tint: mkCanvas(wpx, hpx), line: mkCanvas(wpx, hpx) };
    for (const mode of ['tone', 'tint', 'line']) {
      const g = C[mode].getContext('2d'); g.setTransform(d, 0, 0, d, pad * d, pad * d); g.lineCap = 'round'; g.lineJoin = 'round';
      draw(painter(g, mode), g);
    }
    const { out, sh } = engrave(C.tone, C.tint, C.line, wpx, hpx, { seed: (hash(name.length * 977 + name.charCodeAt(0)) * 50) | 0, ...o });
    const p = { name, c: out, sh, w: o.w * size, h: o.h * size, px: (o.px ?? o.w / 2) * size, py: (o.py ?? o.h / 2) * size, pad: pad * size, size, id: (hash(name.split('').reduce((a, c) => a * 31 + c.charCodeAt(0) | 0, 7)) * 1e6) | 0 };
    PIECES[name] = p; return p;
  }

  // ---- placing pieces ----
  const SHADOW = [11, 13], AF = 10;            // world shadow offset; animation steps per second (on 2s/3s at 24)
  const G = { step: 0, jit: 1 };
  const stepT = (t, af = AF) => Math.floor(t * af + 1e-6) / af;
  function setStep(t) { G.step = Math.floor(t * AF + 1e-6); }
  // draw a piece with its pivot at (x, y); rot radians; sx, sy scale; o: {shadow, alpha, jit, k (instance)}
  function put(p, x, y, rot = 0, sx = 1, sy = sx, o = {}) {
    const k = o.k || 0, jm = (o.jit ?? 1) * G.jit, st = G.step;
    const jx = (hash(st * 7919 + p.id + k * 131) - .5) * 2.4 * jm, jy = (hash(st * 104729 + p.id + k * 197) - .5) * 2.4 * jm;
    const jr = (hash(st * 31337 + p.id + k * 89) - .5) * .009 * jm;
    s.save(); s.translate(x + jx, y + jy); s.rotate(rot + jr); s.scale(sx, sy);
    const X = -p.px - p.pad, Y = -p.py - p.pad, Wd = p.w + p.pad * 2, Hd = p.h + p.pad * 2;
    if (o.alpha !== undefined) s.globalAlpha *= o.alpha;
    if (o.shadow !== 0) {
      const m = s.getTransform(), det = m.a * m.d - m.b * m.c, sk = o.shadow ?? 1;
      const dx = SHADOW[0] * RS * sk, dy = SHADOW[1] * RS * sk;
      const lx = (m.d * dx - m.c * dy) / det, ly = (-m.b * dx + m.a * dy) / det;
      const ga = s.globalAlpha; s.globalAlpha = ga * .42; s.drawImage(p.sh, X + lx, Y + ly, Wd, Hd); s.globalAlpha = ga;
    }
    s.drawImage(p.c, X, Y, Wd, Hd);
    s.restore();
  }
  // run fn in a local frame (for rigs): translate, rotate, scale
  function at(x, y, rot, sx, sy, fn) { s.save(); s.translate(x, y); if (rot) s.rotate(rot); if (sx !== undefined) s.scale(sx, sy ?? sx); fn(); s.restore(); }

  // ---- airbrushed backdrops (painted once, at output resolution) ----
  function sky(name, stops, clouds = [], o = {}) {
    const w = Math.round(W * RS), h = Math.round(H * RS), c = mkCanvas(w, h), g = c.getContext('2d');
    g.setTransform(RS, 0, 0, RS, 0, 0);
    const gr = g.createLinearGradient(0, 0, 0, H); stops.forEach(([o, col]) => gr.addColorStop(o, col)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    if (o.glow) { const [x, y, r, col] = o.glow; const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H); }
    // soft airbrushed clouds: clusters of radial blobs, lit from below-right
    const r = rng(o.seed || 5);
    for (const [cx, cy, cw, ch, col, a] of clouds) {
      // an airbrushed cumulus: a shaded underside first, then the lit puffs, flat along the bottom
      for (const pass of [0, 1]) for (let i = 0; i < 11; i++) {
        const u = (i / 10) * 2 - 1 + (r() - .5) * .15, bx = cx + u * cw * .5, top = (1 - u * u);
        const br = ch * (.32 + top * .5) * (.85 + r() * .3), by = cy - top * ch * .32 + (pass ? -br * .12 : br * .1);
        const c0 = pass ? col : 'rgba(150,120,130,A)', aa = pass ? a : a * .35;
        const rg = g.createRadialGradient(bx, by, 0, bx, by, br); rg.addColorStop(0, c0.replace('A', aa)); rg.addColorStop(.6, c0.replace('A', aa * .7)); rg.addColorStop(1, c0.replace('A', 0));
        g.fillStyle = rg; g.fillRect(bx - br, by - br, br * 2, br * 2);
      }
    }
    // airbrush spatter + a fine speckle in the paint
    g.setTransform(1, 0, 0, 1, 0, 0);
    const id = g.getImageData(0, 0, w, h), dd = id.data;
    for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i += 4) {
      const n = (nz(x * .9, y * .9) - .5) * 9 + (nz(x * .05 + 9, y * .05) - .5) * 10;
      dd[i] += n; dd[i + 1] += n; dd[i + 2] += n * .9;
    }
    g.putImageData(id, 0, 0);
    return { name, c };
  }
  function backdrop(b, dx = 0, dy = 0, sc = 1) { s.drawImage(b.c, dx, dy, W * sc, H * sc); }

  // ---- a stamp (no engraving: rubber-stamp ink, eaten by the paper) ----
  function stampPlate(str, col, o = {}) {
    const fs = o.size || 120, font = o.font || `900 {s}px "SuperClarendon", "Rockwell", serif`;
    const d = RS * (o.scale || 1), pw = (o.w || 520), ph = (o.h || 200);
    const c = mkCanvas(pw * d, ph * d), g = c.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0);
    g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 12;
    g.strokeRect(14, 14, pw - 28, ph - 28); g.lineWidth = 4; g.strokeRect(30, 30, pw - 60, ph - 60);
    fitFont(g, str, font, fs, pw - 100); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(str, pw / 2, ph / 2 + 4);
    g.setTransform(1, 0, 0, 1, 0, 0);
    const id = g.getImageData(0, 0, c.width, c.height), dd = id.data, sd = 1 / (5 * RS);
    for (let y = 0, i = 3; y < c.height; y++) for (let x = 0; x < c.width; x++, i += 4) {
      const e = nz(x * sd + 70, y * sd) * .6 + nz(x * sd * 4, y * sd * 4 + 9) * .4;
      dd[i] *= clamp((e - .28) * 3.2) * .9;
    }
    g.putImageData(id, 0, 0);
    return { c, w: pw, h: ph };
  }
  function putStamp(st, x, y, rot, sc, alpha = 1) {
    s.save(); s.translate(x, y); s.rotate(rot); s.scale(sc, sc); s.globalAlpha *= alpha; s.globalCompositeOperation = 'multiply';
    s.drawImage(st.c, -st.w / 2, -st.h / 2, st.w, st.h); s.restore();
  }

  window.GK = { PIECES, piece, put, at, sky, backdrop, stampPlate, putStamp, fitFont, stepT, setStep, G, AF, TINT, INK, E, R, PL, L, BL, SC, ARC, nz };
})();

// ================================================================================================
// THE PIECES. Each is a function of size (so a close-up gets its own engraving at its own scale,
// with the same line spacing on screen). All figures face RIGHT in design; flip with a negative sx.
// ================================================================================================
(() => {
  const { piece, TINT, E, R, PL, L, BL, SC, ARC } = GK;
  const COAT = '#4f6f92', HAT = '#7d8b80', TROUS = '#7a7468', SHOE = '#4d3b2c', CLERKC = '#9aa27a', CASE = '#86613f';
  const cyl = (x0, x1, lo = .3, hi = .88) => ['l', x0, 0, x1, 0, [[0, lo + .05], [.3, hi], [.62, (lo + hi) / 2], [1, lo]]];
  const vgr = (y0, y1, a, b) => ['l', 0, y0, 0, y1, [[0, a], [1, b]]];
  const DISPLAY = '900 {s}px "SuperClarendon", "Rockwell", Georgia, serif';
  const SERIF = 'bold {s}px "Bodoni 72", Didot, Georgia, serif';
  const TYPE = '{s}px "American Typewriter", "Courier New", monospace';
  const P = {};
  const mk = (name, o, draw) => (P[name] = piece(name, o, draw));

  // ---------- people ----------
  function face(m, clerk) {
    m.f(R(46, 102, 26, 44), ['l', 46, 0, 72, 0, [[0, .4], [1, .82]]], TINT.flesh);
    const fc = BL([[34, 46], [92, 44], [100, 62], [103, 76], [117, 92], [104, 98], [106, 108], [100, 114], [97, 124], [76, 133], [48, 129], [33, 102]]);
    m.f(fc, ['r', 94, 82, 4, 74, [[0, .98], [.5, .8], [1, .4]]], TINT.flesh, -.3);
    m.s(fc, 2.6);
    m.f(E(55, 88, 8, 12), .62, TINT.flesh); m.s(E(55, 88, 8, 12), 1.8); m.s(ARC(56, 88, 4.5, -1.2, 1.6), 1.3);
    m.ink(E(93, 79, 3.4, 2.8)); m.s(L([[83, 70], [99, 69]]), 2.6);
    m.s(L([[95, 115], [104, 114]]), 1.8);
    if (clerk) {
      const ch = BL([[47, 78], [60, 76], [68, 96], [70, 114], [60, 118], [51, 102]]);
      m.f(ch, .5, '#8a6a4a', .7); m.s(ch, 1.6);
      const mu = BL([[92, 102], [112, 99], [120, 106], [108, 110], [96, 109]]); m.f(mu, .15, '#6e5640', .9); m.s(mu, 1.4);
    } else m.f(PL([[34, 58], [52, 56], [48, 100], [36, 104]]), .25, '#6b5a48');
  }
  function fedora(m) {
    const crown = BL([[30, 52], [33, 20], [52, 8], [70, 15], [88, 6], [105, 17], [109, 52]]);
    m.f(crown, cyl(30, 110, .22, .7), HAT); m.s(crown, 2.6);
    m.f(PL([[31, 38], [108, 38], [109, 51], [30, 51]]), .1, '#5a4a40'); m.s(PL([[31, 38], [108, 38], [109, 51], [30, 51]]), 1.8);
    const brim = BL([[2, 56], [36, 46], [100, 44], [130, 52], [112, 63], [60, 65], [12, 63]]);
    m.f(brim, vgr(44, 65, .62, .25), HAT, .5); m.s(brim, 2.6);
    m.s(SC([[54, 12], [70, 24], [86, 9]]), 1.6);
  }
  function bowler(m) {
    const crown = BL([[34, 50], [36, 22], [56, 6], [84, 6], [104, 22], [106, 50]]);
    m.f(crown, ['r', 82, 18, 4, 60, [[0, .9], [.4, .45], [1, .12]]], '#4f4a44'); m.s(crown, 2.6);
    m.f(PL([[35, 40], [105, 40], [106, 50], [34, 50]]), .06); 
    const brim = BL([[8, 54], [30, 46], [110, 46], [130, 52], [114, 60], [24, 60]]);
    m.f(brim, .3, '#4f4a44', .5); m.s(brim, 2.4);
  }
  for (const [nm, clerk] of [['man', 0], ['clerk', 1]]) {
    const sizes = [1];
    mk(nm + 'Head', { w: 130, h: 150, px: 58, py: 140, ang: .3 }, (m) => face(m, clerk));
    mk(nm + 'Hat', { w: 134, h: 70, px: 68, py: 52, ang: .2 }, (m) => clerk ? bowler(m) : fedora(m));
    const hem = clerk ? 286 : 322, cc = clerk ? CLERKC : COAT;
    mk(nm + 'Coat', { w: 170, h: 340, px: 80, py: 150, ang: .25 }, (m) => {
      const pts = [[52, 6], [100, 4], [118, 24], [124, 90], [128, 150], [136, 240], [146, hem], [94, hem + 6], [30, hem], [38, 240], [44, 150], [42, 60], [46, 20]];
      m.f(PL(pts), cyl(30, 150, .26, .7), cc, .15); m.s(BL(pts.slice(0, 1).concat(pts)), 0); m.s(PL(pts), 2.6);
      const col = PL([[50, 6], [78, -2], [102, 4], [98, 32], [72, 44], [58, 28]]);
      m.f(col, .42, cc, -.5); m.s(col, 2.2);
      m.s(SC([[98, 32], [106, 70], [112, 150], [118, 240], [124, hem]]), 2.2);
      m.f(R(44, 140, 86, 13), .18, cc); m.s(R(44, 140, 86, 13), 1.8);
      m.f(R(98, 138, 16, 17), .85, TINT.brass); m.s(R(98, 138, 16, 17), 1.6);
      for (const y of [80, 112, 190]) { m.ink(E(110, y, 3.4)); }
      m.s(L([[58, 196], [94, 196]]), 2); m.s(SC([[70, 170], [62, 250], [58, hem - 4]]), 1.4); m.s(SC([[96, 210], [100, 270], [104, hem - 4]]), 1.3);
    });
    mk(nm + 'Leg', { w: 60, h: 210, px: 28, py: 6, ang: .15 }, (m) => {
      const tr = PL([[13, 0], [43, 0], [41, 178], [17, 178]]); m.f(tr, cyl(13, 43, .3, .7), TROUS); m.s(tr, 2.2);
      const sh = BL([[12, 172], [40, 170], [58, 184], [57, 200], [8, 200]]); m.f(sh, vgr(170, 200, .45, .08), SHOE, .4); m.s(sh, 2.2);
    });
    mk(nm + 'Arm', { w: 50, h: clerk ? 320 : 196, px: 24, py: 10, ang: .1 }, (m) => {
      const sl = PL([[6, 0], [42, 0], [39, 148], [11, 150]]); m.f(sl, cyl(6, 42, .25, .68), cc); m.s(sl, 2.2);
      m.f(R(10, 145, 30, 13), .9); m.s(R(10, 145, 30, 13), 1.6);
      const hd = BL([[10, 156], [38, 156], [42, 176], [32, 192], [14, 190], [8, 172]]); m.f(hd, ['r', 30, 168, 2, 26, [[0, .95], [1, .55]]], TINT.flesh); m.s(hd, 2);
      if (clerk) { // a rolled umbrella
        const um = PL([[24, 160], [32, 160], [36, 290], [28, 318], [20, 290]]); m.f(um, cyl(20, 36, .15, .5), '#3e3a36'); m.s(um, 2);
        m.s(ARC(16, 162, 10, Math.PI, 0), 4);
      }
    });
  }
  mk('case', { w: 334, h: 120, px: 140, py: 4, ang: .9 }, (m) => {
    const b = BL([[4, 62], [16, 18], [70, 10], [110, 28], [140, 22], [182, 30], [204, 46], [318, 48], [330, 60], [318, 72], [204, 74], [182, 90], [140, 98], [110, 92], [70, 112], [16, 104]]);
    m.f(b, vgr(26, 112, .78, .18), CASE); m.s(b, 2.8);
    m.s(SC([[16, 70], [60, 64], [120, 66], [200, 64], [320, 62]]), 1.6);
    for (const x of [90, 240]) { m.f(R(x, 56, 14, 14), .8, TINT.brass); m.s(R(x, 56, 14, 14), 1.4); }
    m.s(ARC(140, 26, 15, Math.PI * 1.05, Math.PI * 1.95), 6);
  });

  // ---------- the ministry: a building with a face ----------
  // design 1200 x 940, origin top-left; the street line is y 905. Mouth arch 530..670, 700..880.
  const MOUTH = { x0: 530, x1: 670, top: 700, cx: 600, cy: 770, r: 70, floor: 880 };
  function ministry(m) {
    // roof and chimneys
    for (const x of [190, 330, 860, 1000]) {
      const c = PL([[x, 172], [x + 56, 172], [x + 56, 290], [x, 290]]); m.f(c, cyl(x, x + 56, .3, .78), '#b47a66', .5); m.s(c, 2.4);
      const cap = PL([[x - 8, 160], [x + 64, 160], [x + 64, 176], [x - 8, 176]]); m.f(cap, .35, '#a07060'); m.s(cap, 2.2);
      m.ink(E(x + 28, 162, 22, 4));
      for (let y = 190; y < 286; y += 16) m.s(L([[x + 2, y], [x + 54, y]]), 1);
    }
    const roof = PL([[110, 300], [180, 236], [1020, 236], [1090, 300]]); m.f(roof, vgr(236, 300, .5, .3), '#5f86a0', .9); m.s(roof, 2.6);
    // main block
    const blk = PL([[80, 300], [1120, 300], [1120, 905], [80, 905]]);
    m.f(blk, vgr(300, 905, .86, .62), '#e4b08a', -.9); m.s(blk, 2.8);
    for (let y = 640; y < 900; y += 26) m.s(L([[82, y], [378, y]]), 1.3), m.s(L([[822, y], [1118, y]]), 1.3);
    m.f(R(76, 296, 1048, 18), .4, '#cbb68c'); m.s(R(76, 296, 1048, 18), 2);
    m.f(R(80, 620, 300, 14), .45, '#cbb68c'); m.f(R(820, 620, 300, 14), .45, '#cbb68c');
    // wing windows
    for (const wx of [120, 205, 290, 860, 945, 1030]) for (const wy of [360, 490]) {
      const w = (g) => { g.moveTo(wx, wy + 90); g.lineTo(wx, wy + 26); g.arc(wx + 26, wy + 26, 26, Math.PI, 0); g.lineTo(wx + 52, wy + 90); g.closePath(); };
      m.f(w, vgr(wy, wy + 90, .08, .32), TINT.prussian, .8); m.s(w, 2.2);
      m.s(L([[wx + 26, wy + 2], [wx + 26, wy + 90]]), 1.6); m.s(L([[wx, wy + 52], [wx + 52, wy + 52]]), 1.6);
      m.f(R(wx - 6, wy + 90, 64, 9), .55, '#cbb68c'); m.s(R(wx - 6, wy + 90, 64, 9), 1.4);
    }
    // portico: back wall in shade, pediment, entablature with the name, columns
    m.f(R(380, 330, 440, 560), vgr(330, 890, .45, .6), '#c88f7a', .6); m.s(R(380, 330, 440, 560), 2.2);
    const ped = PL([[350, 300], [600, 150], [850, 300]]); m.f(ped, vgr(150, 300, .9, .6), '#eac48a', -.4); m.s(ped, 2.8);
    m.s(PL([[392, 290], [600, 170], [808, 290]]), 1.6);
    m.f(R(350, 296, 500, 46), .95, '#e6d8b4'); m.s(R(350, 296, 500, 46), 2.4);
    m.text('BOARD OF PUNCTUALITY', 600, 330, SERIF, 30, 440, { solid: false });
    m.f(E(600, 240, 50), .3, TINT.brass); m.s(E(600, 240, 50), 2.6);
    m.f(E(600, 240, 42), ['r', 590, 230, 2, 46, [[0, 1], [1, .82]]], '#f1e6c8'); m.s(E(600, 240, 42), 1.8);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; m.s(L([[600 + Math.cos(a) * 34, 240 + Math.sin(a) * 34], [600 + Math.cos(a) * 40, 240 + Math.sin(a) * 40]]), i % 3 ? 1.6 : 3.2); }
    for (const cx of [430, 510, 690, 770]) {
      const c = PL([[cx - 22, 350], [cx + 22, 350], [cx + 24, 870], [cx - 24, 870]]); m.f(c, cyl(cx - 24, cx + 24, .25, .95), '#f0dcae', 1.2); m.s(c, 2.4);
      m.f(R(cx - 32, 342, 64, 16), .55, '#d2bd94'); m.s(R(cx - 32, 342, 64, 16), 2);
      m.f(R(cx - 32, 866, 64, 22), .55, '#d2bd94'); m.s(R(cx - 32, 866, 64, 22), 2);
      for (const d of [-12, 0, 12]) m.s(L([[cx + d, 362], [cx + d * 1.05, 862]]), .9);
    }
    // the face: two round windows for eyes (pupils move, drawn per frame), a lantern for a nose
    for (const ex of [565, 635]) { m.f(E(ex, 600, 28), .3, '#cbb68c'); m.s(E(ex, 600, 28), 2.4); m.f(E(ex, 600, 21), ['r', ex - 6, 594, 2, 24, [[0, 1], [1, .8]]], '#f4ecd2'); m.s(E(ex, 600, 21), 1.8); }
    m.s(L([[600, 628], [600, 646]]), 2.2);
    const lan = PL([[588, 646], [612, 646], [618, 672], [600, 684], [582, 672]]); m.f(lan, ['r', 600, 664, 1, 22, [[0, 1], [1, .6]]], TINT.ochre); m.s(lan, 2);
    // the mouth: a dark gullet under an arch of teeth
    const mo = (g) => { g.moveTo(MOUTH.x0, 905); g.lineTo(MOUTH.x0, MOUTH.cy); g.arc(MOUTH.cx, MOUTH.cy, MOUTH.r, Math.PI, 0); g.lineTo(MOUTH.x1, 905); g.closePath(); };
    m.f(mo, vgr(700, 905, .02, .1), '#40302a', .9); m.s(mo, 3);
    for (let i = 0; i < 7; i++) {
      const a = Math.PI + (i + .5) / 7 * Math.PI, bx = MOUTH.cx + Math.cos(a) * MOUTH.r, by = MOUTH.cy + Math.sin(a) * MOUTH.r;
      const tx = MOUTH.cx + Math.cos(a) * (MOUTH.r - 22), ty = MOUTH.cy + Math.sin(a) * (MOUTH.r - 22), da = .2;
      const tth = PL([[MOUTH.cx + Math.cos(a - da) * MOUTH.r, MOUTH.cy + Math.sin(a - da) * MOUTH.r], [tx, ty], [MOUTH.cx + Math.cos(a + da) * MOUTH.r, MOUTH.cy + Math.sin(a + da) * MOUTH.r]]);
      m.f(tth, .93, '#f3ead2'); m.s(tth, 1.8); void bx; void by;
    }
  }
  const JAW = { w: 230, h: 300, px: 115, py: 0 };
  function jaw(m) {
    for (let i = 0; i < 6; i++) { const x = 18 + i * 34; const tth = PL([[x, 4], [x + 15, -22], [x + 30, 4]]); m.f(tth, .93, '#f3ead2'); m.s(tth, 1.8); }
    const t1 = PL([[10, 2], [220, 2], [220, 40], [10, 40]]), t2 = PL([[0, 40], [230, 40], [230, 300], [0, 300]]);
    m.f(t2, vgr(40, 300, .75, .4), '#cfbb93'); m.s(t2, 2.6); for (let y = 66; y < 300; y += 26) m.s(L([[2, y], [228, y]]), 1.2);
    m.f(t1, vgr(2, 40, .9, .6), '#dccaa2'); m.s(t1, 2.6);
    const tg = PL([[84, 4], [146, 4], [150, 300], [80, 300]]); m.f(tg, cyl(80, 150, .35, .8), TINT.red, .4); m.s(tg, 1.8);
  }
  mk('ministry', { w: 1200, h: 940, px: 0, py: 0, ang: .2 }, ministry);
  mk('jaw', { ...JAW, ang: .2 }, jaw);
  mk('ministryFar', { w: 1200, h: 940, px: 600, py: 905, size: .34, ang: .2, period: 1 }, ministry);
  mk('jawBig', { ...JAW, size: 2.3, ang: .2 }, jaw);
  mk('ministryBig', { w: 1200, h: 940, px: 0, py: 0, size: 2.3, ang: .2 }, ministry);
  P.MOUTH = MOUTH;

  // ---------- clocks ----------
  function alarm(m, k) {
    for (const sg of [-1, 1]) { const b = E(60 + sg * 34, 30, 20, 14, sg * .5); m.f(b, ['r', 60 + sg * 30, 24, 2, 22, [[0, 1], [1, .35]]], TINT.brass); m.s(b, 2); }
    m.s(L([[60, 12], [60, 22]]), 4);
    m.f(E(60, 82, 54), ['r', 48, 70, 4, 58, [[0, .95], [.7, .55], [1, .2]]], TINT.brass, .5); m.s(E(60, 82, 54), 2.6);
    m.f(E(60, 82, 42), ['r', 52, 74, 2, 44, [[0, 1], [1, .84]]], '#f3ead0'); m.s(E(60, 82, 42), 1.6);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; m.s(L([[60 + Math.cos(a) * 34, 82 + Math.sin(a) * 34], [60 + Math.cos(a) * 39, 82 + Math.sin(a) * 39]]), i % 3 ? 1.4 : 3); }
    // a face: worried brows, eyes, a moustache over the hands' hub
    const r = rng(k * 31 + 7), b = (r() - .5) * .5;
    m.s(L([[38, 64 + b * 10], [52, 60]]), 2.4); m.s(L([[68, 60], [82, 64 - b * 10]]), 2.4);
    m.ink(E(46, 72, 3.5)); m.ink(E(74, 72, 3.5));
    const h1 = r() * TAU, h2 = r() * TAU;
    m.s(L([[60, 82], [60 + Math.cos(h1) * 26, 82 + Math.sin(h1) * 26]]), 3); m.s(L([[60, 82], [60 + Math.cos(h2) * 18, 82 + Math.sin(h2) * 18]]), 4);
    const mu = BL([[44, 98], [60, 92], [76, 98], [70, 104], [60, 100], [50, 104]]); m.f(mu, .15, '#5a4636'); m.s(mu, 1.4);
    for (const sg of [-1, 1]) m.s(L([[60 + sg * 30, 128], [60 + sg * 42, 146]]), 5);
  }
  for (let k = 0; k < 4; k++) mk('alarm' + k, { w: 120, h: 150, px: 60, py: 146, ang: .6 + k * .2 }, (m) => alarm(m, k));
  mk('spring', { w: 40, h: 120, px: 20, py: 120, ang: 0 }, (m) => {
    const pts = []; for (let i = 0; i <= 12; i++) pts.push([i % 2 ? 34 : 6, 120 - i * 10]);
    m.f(R(4, 0, 32, 120), .97); m.s(L(pts), 4); m.s(L(pts), 1.4, '#8a7a5a');
  });
  mk('pupil', { w: 30, h: 30, ang: 0, margin: 1.4 }, (m) => { m.ink(E(15, 15, 13)); m.f(E(10, 10, 4), 1); m.s(E(10, 10, 3), 2, '#efe6d0'); });
  mk('hand', { w: 16, h: 70, px: 8, py: 64, ang: 0, margin: 1.5 }, (m) => { const h = PL([[8, 0], [14, 52], [8, 70], [2, 52]]); m.ink(h); });

  // ---------- the punch-clock machine (design 900 x 900, pivot bottom centre) ----------
  function cogPath(cx, cy, r, n, depth = .18) {
    return (g) => { for (let i = 0; i < n * 4; i++) { const a = i / (n * 4) * TAU, rr = (i % 4 < 2) ? r : r * (1 - depth); const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); };
  }
  function cog(m, r, n, tint) {
    const c = r + 6, p = cogPath(c, c, r, n);
    m.f(p, ['r', c - r * .3, c - r * .3, 2, r * 1.2, [[0, .9], [1, .3]]], tint, .4); m.s(p, 2.4);
    m.s(E(c, c, r * .72), 1.6); m.f(E(c, c, r * .2), .3, tint); m.s(E(c, c, r * .2), 2);
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + .3, a2 = a + .75; m.cut((g) => { g.moveTo(c + Math.cos(a) * r * .28, c + Math.sin(a) * r * .28); g.arc(c, c, r * .62, a, a2 - .35); g.closePath(); }); }
  }
  mk('cogA', { w: 232, h: 232, px: 116, py: 116, ang: .3 }, (m) => cog(m, 110, 14, TINT.brass));
  mk('cogB', { w: 152, h: 152, px: 76, py: 76, ang: 1.1 }, (m) => cog(m, 70, 10, '#b98a5a'));
  mk('cogC', { w: 112, h: 112, px: 56, py: 56, ang: .7 }, (m) => cog(m, 50, 8, TINT.brass));
  mk('rod', { w: 50, h: 300, px: 25, py: 300, ang: 0 }, (m) => {
    m.f(R(16, 30, 18, 270), cyl(16, 34, .3, .95), '#9aa0a0'); m.s(R(16, 30, 18, 270), 2);
    const k = E(25, 22, 22, 18); m.f(k, ['r', 18, 16, 2, 26, [[0, 1], [1, .3]]], TINT.brass); m.s(k, 2.2);
  });
  mk('machine', { w: 900, h: 900, px: 450, py: 900, ang: .15 }, (m) => {
    // the pipes behind, then the cylinders
    m.s(SC([[180, 520], [180, 380], [300, 330], [420, 330]]), 22); m.s(SC([[180, 520], [180, 380], [300, 330], [420, 330]]), 14, '#b59a66');
    m.s(SC([[720, 520], [720, 380], [640, 300], [560, 290]]), 22); m.s(SC([[720, 520], [720, 380], [640, 300], [560, 290]]), 14, '#b59a66');
    for (const x of [130, 670]) {
      const c = PL([[x, 470], [x + 100, 470], [x + 100, 760], [x, 760]]); m.f(c, cyl(x, x + 100, .25, .9), '#a4aaa6', 1); m.s(c, 2.6);
      for (const y of [470, 600, 740]) { m.f(R(x - 10, y, 120, 20), cyl(x - 10, x + 110, .3, .8), TINT.brass); m.s(R(x - 10, y, 120, 20), 2); }
    }
    // the cabinet
    const cab = PL([[280, 330], [620, 330], [640, 820], [260, 820]]);
    m.f(cab, cyl(260, 640, .32, .82), '#bf8c55', -.6); m.s(cab, 3);
    const pan = PL([[320, 450], [580, 450], [590, 760], [310, 760]]); m.f(pan, vgr(450, 760, .7, .45), '#cf9e62', -.6); m.s(pan, 2.2);
    m.f(R(340, 470, 220, 50), .92, '#efe1b8'); m.s(R(340, 470, 220, 50), 2);
    m.text('TIME RECORDER', 450, 506, SERIF, 30, 196);
    m.f(R(350, 560, 200, 22), .02); m.s(R(342, 552, 216, 38), 2.4);
    for (const [x, y] of [[330, 466], [570, 466], [322, 744], [578, 744]]) { m.f(E(x, y, 6), .5, TINT.brass); m.s(E(x, y, 6), 1.2); }
    m.f(R(250, 800, 400, 40), .3, '#8c6440'); m.s(R(250, 800, 400, 40), 2.6);
    for (const x of [270, 600]) { const f = BL([[x, 836], [x + 40, 836], [x + 50, 890], [x - 10, 892]]); m.f(f, .25, TINT.brass); m.s(f, 2.2); }
    // the crown: a carved top, the great dial, a bell
    const top = PL([[250, 340], [650, 340], [620, 300], [280, 300]]); m.f(top, .5, '#a87848'); m.s(top, 2.4);
    m.f(E(450, 200, 130), ['r', 420, 170, 4, 140, [[0, .95], [.75, .55], [1, .2]]], TINT.brass, .5); m.s(E(450, 200, 130), 3);
    m.f(E(450, 200, 108), ['r', 430, 180, 2, 112, [[0, 1], [1, .84]]], '#f3ead0'); m.s(E(450, 200, 108), 2);
    const RN = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU - Math.PI / 2; m.text(RN[i], 450 + Math.cos(a) * 84, 200 + Math.sin(a) * 84 + 9, SERIF, 24, 40); }
    const bell = BL([[410, 72], [450, 40], [490, 72], [496, 92], [404, 92]]); m.f(bell, ['r', 438, 60, 2, 50, [[0, 1], [1, .3]]], TINT.brass); m.s(bell, 2.4);
    m.s(L([[450, 92], [450, 72]]), 6);
    // a smokestack for steam
    const st = PL([[760, 160], [800, 160], [796, 470], [764, 470]]); m.f(st, cyl(760, 800, .2, .7), '#8a8a84'); m.s(st, 2.4);
    m.f(PL([[744, 150], [816, 150], [806, 170], [754, 170]]), .3, '#8a8a84'); m.s(PL([[744, 150], [816, 150], [806, 170], [754, 170]]), 2);
    m.s(SC([[640, 400], [700, 400], [764, 420]]), 12);
  });
  mk('lever', { w: 380, h: 120, px: 360, py: 40, ang: .9 }, (m) => {
    const arm = PL([[60, 30], [370, 30], [370, 50], [60, 52]]); m.f(arm, vgr(30, 52, .9, .3), '#9aa0a0'); m.s(arm, 2.2);
    const hd = PL([[10, 10], [90, 10], [96, 90], [4, 90]]); m.f(hd, cyl(4, 96, .25, .8), '#7a5034'); m.s(hd, 2.4);
    m.f(R(0, 90, 100, 18), .1, '#7b4a8a'); m.s(R(0, 90, 100, 18), 2);
    m.f(E(360, 40, 20), ['r', 354, 34, 2, 22, [[0, 1], [1, .3]]], TINT.brass); m.s(E(360, 40, 20), 2);
  });
  // close-up: the recorder's face plate with a brass card holder, and the stamp hammer
  mk('panel', { w: 1100, h: 760, px: 550, py: 380, size: 1.9, ang: .1 }, (m) => {
    m.f(R(0, 0, 1100, 760), cyl(0, 1100, .4, .8), '#c99858', -.6); m.s(R(0, 0, 1100, 760), 3);
    for (const x of [40, 1060]) for (const y of [40, 720]) { m.f(E(x, y, 12), ['r', x - 3, y - 3, 1, 13, [[0, 1], [1, .35]]], TINT.brass); m.s(E(x, y, 12), 1.6); }
    m.f(R(80, 60, 360, 70), .9, '#efe1b8'); m.s(R(80, 60, 360, 70), 2.2);
    m.text('TIME RECORDER', 260, 108, SERIF, 40, 320);
    m.f(R(740, 60, 280, 70), .9, '#efe1b8'); m.s(R(740, 60, 280, 70), 2.2);
    m.text('PAT. 1871', 880, 108, SERIF, 36, 240);
    for (const x of [330, 770]) { const c = PL([[x - 30, 160], [x + 30, 160], [x + 30, 720], [x - 30, 720]]); m.f(c, cyl(x - 30, x + 30, .3, .85), TINT.brass, 1); m.s(c, 2.4); }
  });
  mk('stampHead', { w: 300, h: 640, px: 150, py: 640, size: 1.3, ang: .9 }, (m) => {
    m.f(R(130, 0, 40, 420), cyl(130, 170, .25, .95), '#9aa0a0'); m.s(R(130, 0, 40, 420), 2.2);
    const sp = PL([[100, 400], [200, 400], [200, 430], [100, 430]]); m.f(sp, .4, TINT.brass); m.s(sp, 2);
    const blk = PL([[30, 430], [270, 430], [282, 590], [18, 590]]); m.f(blk, cyl(18, 282, .25, .82), '#7a5034', -.4); m.s(blk, 2.8);
    m.f(R(30, 450, 240, 24), .55, TINT.brass); m.s(R(30, 450, 240, 24), 1.8);
    m.f(R(10, 590, 280, 40), .12, '#6b4a7a'); m.s(R(10, 590, 280, 40), 2.4);
  });

  // ---------- the time card ----------
  const CARD = { w: 200, h: 320 };
  const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const TIMES = ['9:58', '10:21', '10:47'];
  function card(m, stamped, clip) {
    const g = m.g; g.save(); if (clip) for (const c of [].concat(clip)) { g.beginPath(); c(g); g.clip(); }
    const c = PL([[0, 0], [200, 0], [200, 320], [0, 320]]); m.f(c, vgr(0, 320, .97, .9), '#ecdcae', .2);
    m.s(c, 2);
    m.text('TIME CARD', 100, 30, SERIF, 24, 170);
    m.text('No. 7 436 912', 100, 54, TYPE, 16, 170);
    m.s(L([[12, 64], [188, 64]]), 1.6);
    m.text('IN', 100, 82, SERIF, 13, 40); m.text('OUT', 160, 82, SERIF, 13, 50);
    for (let i = 0; i < 6; i++) { const y = 92 + i * 36; m.s(L([[12, y], [188, y]]), 1); m.text(DAYS[i], 38, y + 24, SERIF, 13, 46); }
    m.s(L([[66, 70], [66, 308]]), 1); m.s(L([[132, 70], [132, 308]]), 1); m.s(L([[12, 308], [188, 308]]), 1);
    if (stamped) {
      for (let i = 0; i < 3; i++) m.text(TIMES[i], 100, 92 + i * 36 + 25, TYPE, 18, 60, { col: 'rgb(92,64,136)' });
      g.save(); g.translate(100, 190); g.rotate(-.32);
      m.s((gg) => gg.rect(-86, -40, 172, 80), 7, 'rgba(178,52,40,.92)');
      m.text('LATE', 0, 26, DISPLAY, 70, 150, { col: 'rgba(178,52,40,.92)' });
      g.restore();
    }
    g.restore();
  }
  // torn edges: a jagged vertical tear and, for the quarters, a jagged horizontal one
  const jag = (seed, a, b, at, amp, n, vert) => { const r = rng(seed), pts = []; for (let i = 0; i <= n; i++) { const u = a + (b - a) * i / n; const o = at + (r() - .5) * amp * 2; pts.push(vert ? [o, u] : [u, o]); } return pts; };
  const VT = jag(41, -10, 330, 102, 9, 22, true), HT = jag(77, -10, 210, 166, 8, 16, false);
  const cl = (pts) => (g) => PL(pts)(g);
  const L_ = cl([[-10, -10], ...VT, [-10, 330]]), R_ = cl([[210, -10], ...VT, [210, 330]]);
  const T_ = cl([[-10, -10], ...HT, [210, -10]]), B_ = cl([[-10, 330], ...HT, [210, 330]]);
  const quad = (side, top) => [side < 0 ? L_ : R_, top ? T_ : B_];
  mk('card', { ...CARD, px: 100, py: 160, size: .5, ang: 0, margin: 2 }, (m) => card(m, false));
  mk('cardLateSm', { ...CARD, px: 100, py: 160, size: .55, ang: 0, margin: 2 }, (m) => card(m, true));
  mk('cardMid', { ...CARD, px: 100, py: 160, size: 2.3, ang: 0 }, (m) => card(m, false));
  mk('cardBig', { ...CARD, px: 100, py: 160, size: 2.3, ang: 0 }, (m) => card(m, true));
  mk('cardL', { ...CARD, px: 100, py: 160, size: 2.3, ang: 0 }, (m) => card(m, true, L_));
  mk('cardR', { ...CARD, px: 100, py: 160, size: 2.3, ang: 0 }, (m) => card(m, true, R_));
  for (const [nm, sd, tp] of [['cardTL', -1, 1], ['cardTR', 1, 1], ['cardBL', -1, 0], ['cardBR', 1, 0]]) mk(nm, { ...CARD, px: 100, py: 160, size: 2.3, ang: 0 }, (m) => card(m, true, quad(sd, tp)));
  for (const [nm, sd, tp] of [['qTL', -1, 1], ['qTR', 1, 1], ['qBL', -1, 0], ['qBR', 1, 0]]) mk(nm, { ...CARD, px: 100, py: 160, size: .55, ang: 0, margin: 2 }, (m) => card(m, true, quad(sd, tp)));
  // his hand, from the front, gripping (design 220 x 320, pivot at the grip; the right hand: flip for the left)
  mk('grip', { w: 220, h: 340, px: 60, py: 120, size: 1.5, ang: .5 }, (m) => {
    const sl = PL([[70, 230], [200, 210], [230, 350], [60, 350]]); m.f(sl, cyl(60, 230, .22, .66), COAT, .3); m.s(sl, 2.6);
    m.f(PL([[64, 214], [196, 196], [202, 226], [70, 244]]), .92); m.s(PL([[64, 214], [196, 196], [202, 226], [70, 244]]), 2);
    const palm = BL([[60, 70], [120, 60], [170, 90], [190, 160], [180, 214], [80, 228], [56, 170]]);
    m.f(palm, ['r', 120, 120, 6, 120, [[0, .95], [.6, .72], [1, .38]]], TINT.flesh, -.4); m.s(palm, 2.6);
    for (const [y, l] of [[86, 64], [116, 70], [146, 66], [176, 56]]) { const fg = BL([[64, y - 14], [64 - l, y - 10], [64 - l - 8, y + 2], [64 - l, y + 14], [64, y + 14]]); m.f(fg, ['l', 0, y - 14, 0, y + 14, [[0, .9], [1, .5]]], TINT.flesh, 1.2); m.s(fg, 2.2); }
    const th = BL([[96, 70], [70, 40], [40, 30], [24, 44], [44, 66], [80, 96]]); m.f(th, ['r', 60, 50, 2, 50, [[0, .97], [1, .55]]], TINT.flesh, .6); m.s(th, 2.4);
    m.s(SC([[120, 120], [140, 150], [150, 190]]), 1.4);
  });

  // ---------- the boss: a gigantic engraved bust (design 900 x 1000, pivot bottom centre) ----------
  const BOSS = { w: 900, h: 1000, px: 450, py: 1000 };
  function bossBase(m) {
    // shoulders, frock coat, collar, cravat
    const coat = BL([[30, 1000], [60, 820], [200, 740], [330, 715], [570, 715], [700, 740], [840, 820], [870, 1000]]);
    m.f(coat, ['r', 450, 760, 40, 520, [[0, .55], [.6, .35], [1, .12]]], '#3d4a5e', .5); m.s(coat, 3);
    for (const sg of [-1, 1]) { const lap = PL([[450 + sg * 40, 760], [450 + sg * 190, 740], [450 + sg * 170, 1000], [450 + sg * 70, 1000]]); m.f(lap, cyl(450 + sg * 40, 450 + sg * 190, .3, .6), '#465469', sg); m.s(lap, 2.4); }
    const shirt = PL([[400, 720], [500, 720], [530, 1000], [370, 1000]]); m.f(shirt, .95); m.s(shirt, 2);
    const crav = BL([[390, 740], [510, 740], [530, 800], [470, 830], [500, 930], [450, 960], [400, 930], [430, 830], [370, 800]]);
    m.f(crav, ['r', 440, 790, 4, 120, [[0, .9], [1, .35]]], TINT.rose, .8); m.s(crav, 2.4); m.s(SC([[420, 830], [450, 850], [480, 830]]), 1.6);
    m.f(E(450, 880, 12), ['r', 446, 876, 1, 14, [[0, 1], [1, .3]]], TINT.brass); m.s(E(450, 880, 12), 1.6);
    for (const sg of [-1, 1]) { const cl = PL([[450 + sg * 10, 700], [450 + sg * 120, 680], [450 + sg * 110, 760], [450 + sg * 30, 760]]); m.f(cl, .97); m.s(cl, 2.4); }
    // neck and the face from the brow down
    m.f(R(350, 640, 200, 100), cyl(350, 550, .35, .75), TINT.flesh);
    const fc = BL([[240, 300], [450, 284], [660, 300], [680, 420], [650, 560], [560, 650], [450, 680], [340, 650], [250, 560], [220, 420]]);
    m.f(fc, ['r', 430, 400, 20, 330, [[0, .97], [.45, .78], [.8, .5], [1, .3]]], TINT.flesh, -.4); m.s(fc, 3);
    for (const sg of [-1, 1]) { const ear = BL([[450 + sg * 220, 380], [450 + sg * 262, 372], [450 + sg * 270, 440], [450 + sg * 236, 480]]); m.f(ear, ['r', 450 + sg * 245, 420, 2, 50, [[0, .9], [1, .45]]], TINT.flesh, sg); m.s(ear, 2.4); }
    // the mouth cavity (the jaw covers it when shut), upper teeth
    const cav = BL([[360, 540], [540, 540], [560, 600], [450, 680], [340, 600]]); m.f(cav, .03, '#5a2a26'); m.s(cav, 2.4);
    m.f(BL([[400, 610], [500, 610], [520, 660], [380, 660]]), .4, TINT.red);
    for (let i = 0; i < 7; i++) { const x = 378 + i * 22; m.f(PL([[x, 540], [x + 22, 540], [x + 18, 566], [x + 4, 566]]), .95); m.s(PL([[x, 540], [x + 22, 540], [x + 18, 566], [x + 4, 566]]), 1.4); }
    // mutton chops, enormous
    for (const sg of [-1, 1]) {
      const ch = BL([[450 + sg * 228, 360], [450 + sg * 214, 470], [450 + sg * 176, 520], [450 + sg * 146, 566], [450 + sg * 176, 632], [450 + sg * 240, 610], [450 + sg * 266, 500], [450 + sg * 256, 390]]);
      m.f(ch, ['r', 450 + sg * 210, 520, 10, 160, [[0, .8], [.7, .5], [1, .3]]], '#a89c88', sg * .8); m.s(ch, 2.6);
      for (let i = 0; i < 7; i++) m.s(SC([[450 + sg * (238 - i * 4), 400 + i * 26], [450 + sg * (214 - i * 6), 470 + i * 22], [450 + sg * (200 - i * 4), 540 + i * 12]]), 1.2);
    }
    // eyes (pupils move, drawn per frame), nose, a handlebar moustache
    for (const sg of [-1, 1]) { const ey = E(450 + sg * 95, 395, 46, 26); m.f(ey, .97); m.s(ey, 2.6); m.s(ARC(450 + sg * 95, 402, 50, Math.PI * 1.1, Math.PI * 1.9), 1.6); m.s(SC([[450 + sg * 55, 430], [450 + sg * 95, 440], [450 + sg * 135, 428]]), 1.4); }
    const nose = BL([[430, 380], [470, 380], [490, 480], [510, 510], [450, 525], [390, 510], [410, 480]]);
    m.f(nose, ['r', 470, 470, 4, 80, [[0, .97], [1, .45]]], TINT.flesh, .8); m.s(SC([[430, 390], [418, 480], [395, 505], [450, 522], [505, 505], [482, 480]]), 2.4);
    m.f(E(470, 470, 30, 22), .9, '#d98c7a');
    const mu = BL([[450, 510], [560, 500], [660, 470], [700, 430], [690, 500], [600, 560], [450, 556], [300, 560], [210, 500], [200, 430], [240, 470], [340, 500]]);
    m.f(mu, ['l', 0, 470, 0, 560, [[0, .7], [1, .3]]], '#a89c88', .3); m.s(mu, 2.6);
    for (let i = -6; i <= 6; i++) { if (!i) continue; m.s(SC([[450 + i * 12, 516], [450 + i * 30, 534], [450 + i * 40, 552]]), 1.2); }
  }
  function bossJaw(m) { // relative to the bust's design coords; pivot (450, 540): a lower lip and a great beard
    const bd = BL([[330, 552], [570, 552], [618, 640], [596, 750], [520, 820], [450, 846], [380, 820], [304, 750], [282, 640]]);
    m.f(bd, ['r', 450, 640, 10, 230, [[0, .8], [.6, .5], [1, .22]]], '#a89c88', .6); m.s(bd, 3);
    for (let i = -5; i <= 5; i++) m.s(SC([[450 + i * 22, 600], [450 + i * 30, 700], [450 + i * 24, 790 - Math.abs(i) * 14]]), 1.3);
    for (let i = 0; i < 6; i++) { const x = 386 + i * 22; m.f(PL([[x, 562], [x + 22, 562], [x + 18, 540], [x + 4, 540]]), .95); m.s(PL([[x, 562], [x + 22, 562], [x + 18, 540], [x + 4, 540]]), 1.4); }
    const lip = BL([[370, 556], [530, 556], [520, 586], [450, 596], [380, 586]]); m.f(lip, ['l', 0, 556, 0, 596, [[0, .85], [1, .5]]], '#d98c7a'); m.s(lip, 2.2);
  }
  function bossLid(m) { // pivot at the left temple (226, 300)
    const lid = (g) => { g.moveTo(226, 304); g.bezierCurveTo(226, 120, 330, 70, 450, 70); g.bezierCurveTo(570, 70, 674, 120, 674, 304); g.quadraticCurveTo(450, 280, 226, 304); g.closePath(); };
    m.f(lid, ['r', 400, 150, 10, 260, [[0, .97], [.5, .75], [1, .4]]], TINT.flesh, -.5); m.s(lid, 3);
    for (let i = 0; i < 5; i++) m.s(SC([[400 + i * 20, 76], [420 + i * 18, 52], [450 + i * 16, 60]]), 1.6);
    // eyebrows ride on the lid's edge
  }
  function brow(m) { // design 200 x 70, pivot inner end (190, 40); right brow (flip for left)
    const b = BL([[190, 40], [140, 20], [60, 12], [8, 30], [40, 44], [120, 46]]);
    m.f(b, ['l', 0, 10, 0, 50, [[0, .4], [1, .12]]], '#8a7e70', .7); m.s(b, 2.4);
    for (let i = 0; i < 8; i++) m.s(L([[180 - i * 22, 40], [168 - i * 22, 18]]), 1.3);
  }
  function horn(m) { // design 460 x 640, pivot bottom of the tube (230, 640)
    const tube = PL([[196, 640], [262, 640], [250, 420], [238, 330], [176, 330], [186, 420]]);
    m.f(tube, cyl(176, 262, .25, .9), TINT.brass, 1.2); m.s(tube, 2.6);
    const bell = (g) => { g.moveTo(186, 340); g.bezierCurveTo(170, 230, 60, 150, 10, 80); g.quadraticCurveTo(220, -20, 450, 70); g.bezierCurveTo(360, 150, 250, 230, 226, 340); g.closePath(); };
    m.f(bell, cyl(10, 450, .22, .95), TINT.brass, 1.1); m.s(bell, 3);
    m.f(E(232, 48, 214, 46, -.12), ['r', 232, 60, 10, 220, [[0, .02], [.6, .2], [1, .55]]], '#5a4026'); m.s(E(232, 48, 214, 46, -.12), 3);
    for (let i = 1; i < 6; i++) { const u = i / 6; m.s(SC([[186 - u * 176, 340 - u * 260], [200 + (u - .5) * 30, 300 - u * 280], [226 + u * 224, 340 - u * 270]]), 1); }
  }
  for (const [sfx, sz] of [['', 1], ['Big', 2]]) {
    mk('boss' + sfx, { ...BOSS, size: sz, ang: .35 }, bossBase);
    mk('bossJaw' + sfx, { ...BOSS, px: 450, py: 540, size: sz, ang: .35 }, bossJaw);
    mk('bossLid' + sfx, { ...BOSS, px: 226, py: 300, size: sz, ang: .5 }, bossLid);
    mk('brow' + sfx, { w: 200, h: 70, px: 190, py: 40, size: sz, ang: .9 }, brow);
    mk('pupilB' + sfx, { w: 40, h: 40, size: sz, ang: 0, margin: 1.5 }, (m) => { m.ink(E(20, 20, 18)); m.f(E(13, 13, 5), 1); m.s(E(13, 13, 4), 3, '#efe6d0'); });
  }
  mk('horn', { w: 460, h: 640, px: 230, py: 640, size: 1, ang: .9 }, horn);

  // ---------- the yell, as cut-out display type ----------
  function word(str, w, tint, size) {
    return (m) => {
      const r = rng(str.length * 13 + 3), j = () => (r() - .5) * 18;
      const sh = PL([[j(), j()], [w * .5, j()], [w + j(), j()], [w + j(), 115 + j()], [w + j(), 230 + j()], [w * .5, 230 + j()], [j(), 230 + j()], [j(), 115 + j()]]);
      m.f(sh, vgr(0, 230, .95, .82), tint, .3); m.s(sh, 2);
      m.text(str, w / 2, 192, DISPLAY, 200, w - 60, { solid: false });
      m.s(L([[24, 210], [w - 24, 210]]), 3); m.s(L([[24, 20], [w - 24, 20]]), 3);
    };
  }
  mk('wWHY', { w: 560, h: 230, size: 1, ang: .1 }, word('WHY', 560, TINT.ochre));
  mk('wAREYOU', { w: 820, h: 230, size: 1, ang: .1 }, word('ARE YOU', 820, TINT.rose));
  mk('wSOLATE', { w: 1060, h: 230, size: 1, ang: .1 }, word('SO LATE?', 1060, '#efe0b8'));

  // ---------- birds ----------
  for (const [k, tint] of [[0, TINT.rose], [1, TINT.ochre], [2, TINT.sage], [3, TINT.prussian]]) {
    mk('bird' + k, { w: 170, h: 90, px: 80, py: 48, ang: .4 + k * .3 }, (m) => {
      const b = BL([[10, 40], [40, 36], [90, 30], [130, 22], [150, 26], [168, 36], [150, 40], [140, 56], [100, 70], [50, 62], [0, 58]]);
      m.f(b, ['r', 110, 34, 4, 100, [[0, .97], [1, .4]]], tint, .5); m.s(b, 2.4);
      m.ink(E(146, 30, 3)); m.f(PL([[164, 32], [180, 36], [164, 40]]), .4, TINT.ochre); m.s(PL([[164, 32], [180, 36], [164, 40]]), 1.6);
      for (let i = 0; i < 4; i++) m.s(L([[6 + i * 6, 44 + i], [30 + i * 4, 48 + i]]), 1.2);
    });
    mk('wing' + k, { w: 130, h: 80, px: 26, py: 64, ang: 1.2 + k * .2 }, (m) => {
      const w = BL([[20, 70], [30, 40], [70, 12], [128, 0], [100, 30], [70, 60], [40, 72]]);
      m.f(w, ['l', 20, 0, 128, 0, [[0, .55], [1, .9]]], tint, .7); m.s(w, 2.2);
      for (let i = 0; i < 5; i++) m.s(L([[44 + i * 14, 62 - i * 9], [70 + i * 12, 30 - i * 6]]), 1.2);
    });
  }

  // ---------- grounds ----------
  mk('street', { w: 2100, h: 260, px: 0, py: 0, ang: .05 }, (m) => {
    m.f(R(0, 0, 2100, 260), vgr(0, 260, .78, .45), '#c9a274', .3);
    m.f(R(0, 0, 2100, 22), .62, '#a39674'); m.s(L([[0, 0], [2100, 0]]), 2.6); m.s(L([[0, 22], [2100, 22]]), 2);
    const r = rng(11);
    for (let row = 0; row < 7; row++) { const y = 40 + row * 32 + row * row * 1.5, h = 22 + row * 2.4, w = 46 + row * 5; for (let x = (row % 2) * w / 2 - 20; x < 2100; x += w + 4) { const c = E(x + w / 2, y, w / 2 - 2, h / 2, (r() - .5) * .1); m.f(c, ['r', x + w * .4, y - h * .2, 1, w * .6, [[0, .92], [1, .55]]], '#c9a274', r() - .5); m.s(c, 1.3); } }
  });
  mk('lamp', { w: 80, h: 560, px: 40, py: 560, ang: .1 }, (m) => {
    m.f(R(32, 90, 16, 470), cyl(32, 48, .2, .7), '#4c5a5a'); m.s(R(32, 90, 16, 470), 2);
    m.f(R(22, 520, 36, 40), .3, '#4c5a5a'); m.s(R(22, 520, 36, 40), 2);
    const lan = PL([[14, 30], [66, 30], [58, 90], [22, 90]]); m.f(lan, ['r', 40, 60, 2, 40, [[0, 1], [1, .6]]], TINT.ochre); m.s(lan, 2.2);
    m.f(PL([[6, 30], [40, 4], [74, 30]]), .3, '#4c5a5a'); m.s(PL([[6, 30], [40, 4], [74, 30]]), 2);
  });
  mk('floor', { w: 2200, h: 360, px: 0, py: 0, ang: .2, period: 1 }, (m) => {
    m.f(R(0, 0, 2200, 360), .6, '#cdb78a');
    const vx = 1100, vy = -900, rows = [0, 26, 60, 104, 162, 238, 340, 470];
    for (let i = 0; i < rows.length - 1; i++) for (let k = -16; k < 16; k++) {
      const y0 = rows[i], y1 = rows[i + 1], X = (k, y) => vx + (k * 120) * (y - vy) / (0 - vy) * .55;
      const q = PL([[X(k, y0), y0], [X(k + 1, y0), y0], [X(k + 1, y1), y1], [X(k, y1), y1]]);
      m.f(q, (i + k) % 2 ? vgr(y0, y1, .9, .8) : vgr(y0, y1, .5, .4), (i + k) % 2 ? '#ead6a4' : '#7c5a6a', .1); m.s(q, 1.2);
    }
    m.s(L([[0, 0], [2200, 0]]), 2.6);
  });
  mk('hill', { w: 2300, h: 440, px: 0, py: 0, ang: .4 }, (m) => {
    const top = (x) => 70 - Math.sin(x / 2300 * Math.PI) * 60 + Math.sin(x / 210) * 6;
    const pts = []; for (let x = 0; x <= 2300; x += 50) pts.push([x, top(x)]);
    const h = PL([...pts, [2300, 440], [0, 440]]);
    m.f(h, vgr(0, 440, .82, .3), TINT.moss, -.3); m.s(L(pts), 2.6);
    const r = rng(3);
    for (let i = 0; i < 160; i++) { const x = r() * 2300, y = top(x) + 6 + r() * 360; const l = 10 + r() * 14; m.s(L([[x, y], [x - 3, y - l]]), 1.2); m.s(L([[x + 4, y], [x + 7, y - l * .8]]), 1.1); }
    for (let i = 0; i < 26; i++) { const x = r() * 2300, y = top(x) + 30 + r() * 300; m.f(E(x, y, 6), .9, i % 2 ? TINT.rose : '#efe0b8'); m.s(E(x, y, 6), 1.2); }
  });

  window.GP = P;
})();

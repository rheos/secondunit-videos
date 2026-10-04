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
  const TINT = { rose: '#c8877c', ochre: '#d4a65a', sage: '#93a382', prussian: '#5b7690', flesh: '#e6b48f',
    red: '#b9473a', brass: '#cfa24e', grey: '#9a978c', dun: '#a8946f', sky: '#8fb2c0', violet: '#7b6aa0', cream: '#efe0b8', moss: '#7f9a5c' };

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
        const d = Math.abs(u - .5) * P, dk = 1 - v, th = Math.pow(dk, 1.08) * P * .47 + (dk > .04 ? .22 : 0);
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
          const bl = .5 + .62 * fbmz(x * sb + seed * 3, y * sb), k = Math.min(1, wa * bl * (o.wash ?? .9));
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
      for (let i = 0; i < 26; i++) {
        const u = r() * 2 - 1, bx = cx + u * cw * .5, by = cy + (r() - .5) * ch * .5 - (1 - u * u) * ch * .35, br = ch * (.35 + r() * .45) * (1 - Math.abs(u) * .45);
        const rg = g.createRadialGradient(bx, by, 0, bx, by, br); rg.addColorStop(0, col.replace('A', a)); rg.addColorStop(.55, col.replace('A', a * .55)); rg.addColorStop(1, col.replace('A', 0));
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

// Gouache mark-making for the poster look. Everything here runs once at load time with seeded randoms;
// the per-frame code in main.js only composites the baked sheets.
// Units: art is designed in "sheet units" (world px). Each sheet canvas is RES x that size.
const RES = 2;

// ---------- geometry ----------
function resample(pts, step) {
  // pts: [[x,y],...] polyline -> evenly spaced points with normals
  const out = []; if (pts.length < 2) return out;
  let acc = 0; out.push([pts[0][0], pts[0][1], 0]);
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i]; const d = Math.hypot(bx - ax, by - ay); if (d < 1e-6) continue;
    let s = step - acc;
    while (s <= d) { const u = s / d; out.push([ax + (bx - ax) * u, ay + (by - ay) * u, 0]); s += step; }
    acc = d - (s - step);
  }
  const L = pts[pts.length - 1]; out.push([L[0], L[1], 0]);
  for (let i = 0; i < out.length; i++) {
    const a = out[Math.max(0, i - 1)], b = out[Math.min(out.length - 1, i + 1)];
    out[i][2] = Math.atan2(b[1] - a[1], b[0] - a[0]);
  }
  return out;
}
function quadPts(x0, y0, x1, y1, bend, n = 10) {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
  const cx = mx - dy / L * bend, cy = my + dx / L * bend, p = [];
  for (let i = 0; i <= n; i++) { const u = i / n, v = 1 - u; p.push([v * v * x0 + 2 * v * u * cx + u * u * x1, v * v * y0 + 2 * v * u * cy + u * u * y1]); }
  return p;
}
// smooth closed polygon path (Catmull-Rom through points)
function smoothPath(pts, closed = true) {
  const P = new Path2D(), n = pts.length; if (!n) return P;
  const get = (i) => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  P.moveTo(pts[0][0], pts[0][1]);
  const m = closed ? n : n - 1;
  for (let i = 0; i < m; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    P.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
  if (closed) P.closePath();
  return P;
}
function polyBBox(pts) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return [x0, y0, x1, y1]; }
function ellipsePts(cx, cy, rx, ry, n = 32, rot = 0, f) {
  const p = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; let x = Math.cos(a) * rx, y = Math.sin(a) * ry; if (f) [x, y] = f(x, y, a);
    p.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); }
  return p;
}
// densify a closed polygon so the contour pass has enough points
function closedLoop(pts) { return [...pts, pts[0]]; }

// ---------- the bristle brush ----------
// One loaded flat brush dragged along a path: parallel bristle lines, each with its own tone,
// pressure taper at both ends, and dry-brush breaks where the paint runs out.
function bstroke(g, pts, w, col, R, o = {}) {
  const dry = o.dry ?? .2, a = o.alpha ?? 1, jit = o.jit ?? 12;
  const S = resample(pts, Math.max(1.5, Math.min(5, w * .35)));
  if (S.length < 2) return;
  const nb = o.n ?? Math.max(3, Math.min(20, Math.round(w / 1.7)));
  const tot = S.length, seed = R() * 1000;
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (let b = 0; b < nb; b++) {
    const ob = (nb === 1 ? 0 : (b / (nb - 1) - .5)) * w * (.8 + R() * .35);
    const j = (R() - .5) * jit, k = .9 + R() * .2;
    g.strokeStyle = rgb([clamp(col[0] * k + j, 0, 255), clamp(col[1] * k + j, 0, 255), clamp(col[2] * k + j * 1.1, 0, 255)], a * (.7 + R() * .3));
    g.lineWidth = Math.max(.7, w / nb * (1.4 + R() * .9));
    const s0 = Math.floor(R() * .1 * tot), s1 = Math.ceil(tot * (1 - R() * dry * .75)) - 1;
    g.beginPath(); let pen = false;
    for (let i = s0; i <= s1; i++) {
      const u = i / (tot - 1), tap = o.taper === false ? 1 : .55 + .45 * Math.sin(Math.PI * clamp(u * 1.15 - .05));
      if (dry > 0 && n1(seed + b * 7.3, i * .55) > 1.05 - dry * (.6 + u * .9)) { pen = false; continue; }
      const [x, y, an] = S[i], px = x - Math.sin(an) * ob * tap, py = y + Math.cos(an) * ob * tap;
      if (!pen) { g.moveTo(px, py); pen = true; } else g.lineTo(px, py);
    }
    g.stroke();
  }
}
// a short curved stroke from a centre point along angle
function dab(g, x, y, ang, len, w, col, R, o = {}) {
  const dx = Math.cos(ang) * len / 2, dy = Math.sin(ang) * len / 2;
  bstroke(g, quadPts(x - dx, y - dy, x + dx, y + dy, (o.bend ?? (R() - .5) * .4) * len, 6), w, col, R, o);
}

// ---------- region painting ----------
// Fill a shape with brush strokes: colour from a shading field, direction from a flow field.
// Then a contour pass with drier strokes so edges read painted, not vector.
function paintArea(g, pts, o) {
  const R = o.R, P = smoothPath(pts); let [x0, y0, x1, y1] = polyBBox(pts);
  if (o.bound) { x0 = Math.max(x0, o.bound[0]); y0 = Math.max(y0, o.bound[1]); x1 = Math.min(x1, o.bound[2]); y1 = Math.min(y1, o.bound[3]); }
  const step = o.step ?? 8, len = o.len ?? 26, w = o.w ?? 10;
  g.save(); g.clip(P);
  if (o.base) { g.fillStyle = rgb(o.base); g.fill(P); }
  const m = g.getTransform();
  for (let pass = 0; pass < (o.passes ?? 1); pass++) {
    for (let y = y0 - step; y < y1 + step; y += step) for (let x = x0 - step; x < x1 + step; x += step) {
      const px = x + (R() - .5) * step * 1.3, py = y + (R() - .5) * step * 1.3;
      if (!g.isPointInPath(P, px * m.a + py * m.c + m.e, px * m.b + py * m.d + m.f) && R() > .25) continue;
      const c = o.shade(px, py); if (!c) continue;
      const an = (o.dir ? o.dir(px, py) : 0) + (R() - .5) * (o.wob ?? .35);
      dab(g, px, py, an, len * (.7 + R() * .6), w * (.8 + R() * .4), c, R, { dry: o.dry ?? .15, jit: o.jit ?? 10, alpha: o.alpha ?? 1 });
    }
  }
  g.restore();
  if (o.edge !== false) {
    const L = resample(closedLoop(pts), o.edgeStep ?? 14), ew = o.edgeW ?? Math.max(2, w * .45);
    for (let i = 0; i < L.length - 1; i += 1) {
      const [x, y, an] = L[i]; const c = o.edgeCol || o.shade(x, y) || o.base; if (!c) continue;
      dab(g, x, y, an, (o.edgeStep ?? 14) * 1.9, ew, c, R, { dry: o.edgeDry ?? .55, jit: 6, bend: (R() - .5) * .2 });
    }
  }
}
// line work: a dark painted outline/contour brush (not uniform: thick-thin with dry ends)
function brushLine(g, pts, w, col, R, o = {}) { bstroke(g, pts, w, col, R, { dry: o.dry ?? .35, jit: o.jit ?? 8, n: o.n ?? Math.max(3, Math.round(w / 1.3)), alpha: o.alpha ?? 1 }); }

// ---------- shading ramps ----------
function ramp(stops, v) { // stops [[v, col],...] ascending
  if (v <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) if (v <= stops[i][0]) { const u = (v - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]); return mix(stops[i - 1][1], stops[i][1], smooth(u)); }
  return stops[stops.length - 1][1];
}
const LIGHT = (() => { const v = [-.5, -.32, .82], l = Math.hypot(...v); return v.map((x) => x / l); })();
// lambert on an ellipsoid with a warm key (lamp, upper left) and a cool night fill
function ellShade(x, y, cx, cy, rx, ry, L = LIGHT) {
  const nx = (x - cx) / rx, ny = (y - cy) / ry, q = 1 - nx * nx - ny * ny, nz = Math.sqrt(Math.max(0, q));
  return clamp(nx * L[0] + ny * L[1] + nz * L[2]);
}
const SKIN = [[0, hex('#6e5f86')], [.16, hex('#8c6878')], [.3, hex('#c0705a')], [.45, hex('#df9a72')], [.66, hex('#f0bd93')], [.86, hex('#fbdcbc')], [1, hex('#fff1dd')]];
const SKIN_M = [[0, hex('#4f4a6e')], [.16, hex('#755466')], [.3, hex('#a85e48')], [.45, hex('#c98260')], [.66, hex('#dca37c')], [.86, hex('#eec5a2')], [1, hex('#f6ddc4')]];

// ---------- paper ----------
let PAPER = null;
function buildPaper() {
  const s = 512, c = mkCanvas(s, s), g = c.getContext('2d', { willReadFrequently: true }), d = g.createImageData(s, s), R = mulberry(77);
  for (let i = 0; i < s * s; i++) { const v = 236 + (R() - .5) * 26; d.data[i * 4] = v; d.data[i * 4 + 1] = v - 2; d.data[i * 4 + 2] = v - 6; d.data[i * 4 + 3] = 255; }
  g.putImageData(d, 0, 0);
  // fibres
  for (let i = 0; i < 900; i++) { const x = R() * s, y = R() * s, a = R() * TAU, l = 4 + R() * 14; g.strokeStyle = `rgba(${R() < .5 ? '120,105,90' : '255,250,240'},${.12 + R() * .18})`; g.lineWidth = .6;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * .5 + (R() - .5) * 4, y + Math.sin(a) * l * .5 + (R() - .5) * 4, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  PAPER = c;
}
// multiply the paper tooth over a finished sheet, plus a soft chalky lift (gouache dries matte)
function paperize(g, w, h, amt = 1, keepAlpha = false) {
  if (!PAPER) buildPaper();
  let keep = null; if (keepAlpha) { keep = mkCanvas(w, h); keep.getContext('2d').drawImage(g.canvas, 0, 0); }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = .55 * amt; g.fillStyle = g.createPattern(PAPER, 'repeat'); g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'soft-light'; g.globalAlpha = .25 * amt; g.fillRect(0, 0, w, h);
  if (keep) { g.globalCompositeOperation = 'destination-in'; g.globalAlpha = 1; g.drawImage(keep, 0, 0); }
  g.restore();
}

// ---------- hand-brushed lettering ----------
// Each letter set in a bold condensed face, then: own tilt/size/baseline, a wobble warp,
// ragged dry-brush edges (blurred alpha thresholded against noise), and filled with brush strokes.
function brushLettering(text, o) {
  const CP = { willReadFrequently: true }, R = mulberry(o.seed ?? 5), size = o.size, font = o.font ?? `${size}px Impact`;
  const tmp = mkCanvas(8, 8).getContext('2d', CP); tmp.font = font;
  const track = o.track ?? .035 * size, widths = [...text].map((ch) => tmp.measureText(ch).width);
  const tw = widths.reduce((a, b) => a + b, 0) + track * (text.length - 1), pad = Math.ceil(size * .4);
  const W0 = Math.ceil(tw * 1.12 + pad * 2 + size * .3), H0 = Math.ceil(size * 1.5 + pad * 2);
  const m = mkCanvas(W0, H0), mg = m.getContext('2d', CP); mg.font = font; mg.textBaseline = 'alphabetic'; mg.fillStyle = '#000';
  let x = pad; const base = pad + size * 1.05, arc = o.arc ?? 0;
  [...text].forEach((ch, i) => {
    // each letter brushed separately: its own width, height, lean and baseline
    const sx = 1 + (R() - .5) * .06, sy = 1 + (R() - .5) * .05, w = widths[i] * sx, u = (x - pad + w / 2) / tw;
    mg.save(); mg.translate(x + w / 2, base + (R() - .5) * size * .012 + arc * size * (Math.pow(2 * u - 1, 2) - 1));
    mg.rotate((R() - .5) * (o.tilt ?? .025)); mg.transform(1, 0, -(o.lean ?? 0), 1, 0, 0); mg.scale(sx, sy);
    mg.fillText(ch, -widths[i] / 2, 0); mg.restore(); x += w + track;
  });
  // warp: horizontal slices shifted by smooth noise, vertical slices nudged
  const w2 = mkCanvas(W0, H0), wg = w2.getContext('2d', CP), sd = R() * 100, sl = 3;
  for (let y = 0; y < H0; y += sl) wg.drawImage(m, 0, y, W0, sl, n1(sd, y / (size * .3)) * size * .007, y, W0, sl);
  const w3 = mkCanvas(W0, H0), w3g = w3.getContext('2d', CP);
  for (let xx = 0; xx < W0; xx += sl) w3g.drawImage(w2, xx, 0, sl, H0, xx, n1(sd + 9, xx / (size * .4)) * size * .008, sl, H0);
  // ragged edge: blur then threshold against noise
  const bl = mkCanvas(W0, H0), bg = bl.getContext('2d', CP); bg.filter = `blur(${Math.max(1, size * .012)}px)`; bg.drawImage(w3, 0, 0); bg.filter = 'none';
  const id = bg.getImageData(0, 0, W0, H0), dd = id.data, RN = mulberry((o.seed ?? 5) + 1);
  let bx0 = W0, by0 = H0, bx1 = 0, by1 = 0;
  for (let i = 0, p = 0; i < dd.length; i += 4, p++) {
    const px = p % W0, py = (p / W0) | 0, a = dd[i + 3] / 255;
    const nz = .5 + .14 * n1(sd + 3, px * .07 + py * .011) + .08 * (RN() - .5) + .06 * n1(sd + 4, py * .17);
    const th = Math.max(.18, nz), v = a > th ? 255 : (a > th - .07 && a > .1 ? 110 : 0);
    dd[i] = dd[i + 1] = dd[i + 2] = 0; dd[i + 3] = v;
    if (v) { if (px < bx0) bx0 = px; if (px > bx1) bx1 = px; if (py < by0) by0 = py; if (py > by1) by1 = py; }
  }
  bg.putImageData(id, 0, 0);
  // dry streaks: the brush running thin across some strokes
  bg.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < text.length; i++) { const yy = pad + R() * size * 1.1, xx = pad + R() * tw; bstroke(bg, quadPts(xx, yy, xx + size * (.2 + R() * .3), yy + (R() - .5) * size * .1, 0, 6), size * .025, [0, 0, 0], R, { dry: .7, alpha: .3, n: 4 }); }
  bg.globalCompositeOperation = 'source-over';
  // paint fill: strokes in the letter colour, mostly following the stems (vertical) with a few cross strokes
  const out = mkCanvas(W0, H0), og = out.getContext('2d', CP), col = o.col, RS = mulberry((o.seed ?? 5) + 2);
  og.fillStyle = rgb(col); og.fillRect(0, 0, W0, H0);
  const sw = size * .08;
  for (let y = 0; y < H0; y += sw * .9) for (let xx = 0; xx < W0; xx += sw * 1.5) {
    const v = RS() < .7;
    dab(og, xx + RS() * sw, y + RS() * sw, v ? Math.PI / 2 + (RS() - .5) * .3 : (RS() - .5) * .3, size * (.18 + RS() * .22), sw, mix(col, o.col2 ?? col, RS()), RS, { dry: .35, jit: 22 });
  }
  og.globalCompositeOperation = 'destination-in'; og.drawImage(bl, 0, 0);
  // painted drop shadow: the same mask offset, darker, drawn behind
  const fin = mkCanvas(W0, H0), fg = fin.getContext('2d', CP), so = o.shadowOff ?? [size * .05, size * .055];
  if (o.shadow) {
    const sh = mkCanvas(W0, H0), shg = sh.getContext('2d', CP); shg.fillStyle = rgb(o.shadow); shg.fillRect(0, 0, W0, H0);
    shg.globalCompositeOperation = 'destination-in'; shg.drawImage(bl, 0, 0);
    for (let k = 1; k <= 5; k++) fg.drawImage(sh, so[0] * k / 5, so[1] * k / 5);
  }
  fg.drawImage(out, 0, 0);
  // measured ink box (letters + shadow), used to fit the box
  const box = [bx0, by0, bx1 + (o.shadow ? so[0] : 0) + 1, by1 + (o.shadow ? so[1] : 0) + 1];
  return { c: fin, w: W0, h: H0, box };
}
// place lettering into a box (sheet units): scaled from the MEASURED ink box, with a margin, centred
function placeLettering(g, L, x, y, maxW, maxH, margin = .05) {
  const [bx0, by0, bx1, by1] = L.box, iw = bx1 - bx0, ih = by1 - by0;
  const s = Math.min(maxW * (1 - 2 * margin) / iw, maxH * (1 - 2 * margin) / ih);
  const dx = x + (maxW - iw * s) / 2 - bx0 * s, dy = y + (maxH - ih * s) / 2 - by0 * s;
  g.drawImage(L.c, dx, dy, L.w * s, L.h * s);
  return { s, ink: [dx + bx0 * s, dy + by0 * s, dx + bx1 * s, dy + by1 * s], box: [x, y, x + maxW, y + maxH] };
}

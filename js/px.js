// Pixel engine. Everything is drawn into an indexed 320 x 180 buffer (one palette index per pixel),
// with integer primitives only: no anti-aliasing, no smooth gradients (Bayer dither instead),
// nearest-neighbour sprite scaling, and a hand-drawn 5x7 bitmap font. pxOut() expands the buffer
// through the palette and blows it up with nearest-neighbour onto the 2D canvas, an exact x4 at 720p.
const PW = 320, PH = 180, TR = 255; // TR = transparent index in sprite buffers
let PALRGB = null;
const mkbuf = (w, h, f = TR) => { const d = new Uint8Array(w * h); d.fill(f); return { w, h, d }; };
const FB = mkbuf(PW, PH, 0);
let B = FB;
const target = (b) => { B = b; };
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bay = (x, y) => (BAYER[((y & 3) << 2) | (x & 3)] + .5) / 16;
const R = Math.round, FL = Math.floor;

function pset(x, y, c) { x = FL(x); y = FL(y); if (x < 0 || y < 0 || x >= B.w || y >= B.h) return; B.d[y * B.w + x] = c; }
function hline(x0, x1, y, c) {
  y = FL(y); if (y < 0 || y >= B.h) return; x0 = Math.max(0, FL(x0)); x1 = Math.min(B.w - 1, FL(x1));
  const o = y * B.w; for (let x = x0; x <= x1; x++) B.d[o + x] = c;
}
// dithered hline: colour c2 where bayer < k
function hlineD(x0, x1, y, c1, c2, k) {
  y = FL(y); if (y < 0 || y >= B.h) return; x0 = Math.max(0, FL(x0)); x1 = Math.min(B.w - 1, FL(x1));
  const o = y * B.w; for (let x = x0; x <= x1; x++) { const c = bay(x, y) < k ? c2 : c1; if (c !== TR) B.d[o + x] = c; }
}
function rect(x, y, w, h, c) { const y0 = R(y), y1 = R(y + h), x0 = R(x), x1 = R(x + w) - 1; for (let j = y0; j < y1; j++) hline(x0, x1, j, c); }
function rectD(x, y, w, h, c1, c2, k) { const y0 = R(y), y1 = R(y + h), x0 = R(x), x1 = R(x + w) - 1; for (let j = y0; j < y1; j++) hlineD(x0, x1, j, c1, c2, k); }
function rectO(x, y, w, h, c, o = 1) { rect(x - 1, y - 1, w + 2, h + 2, o); rect(x, y, w, h, c); }
function frame(x, y, w, h, c) { rect(x, y, w, 1, c); rect(x, y + h - 1, w, 1, c); rect(x, y, 1, h, c); rect(x + w - 1, y, 1, h, c); }
function circ(cx, cy, r, c) { cx = R(cx); cy = R(cy); for (let j = -r; j <= r; j++) { const w = FL(Math.sqrt(Math.max(0, (r + .5) * (r + .5) - j * j))); hline(cx - w, cx + w, cy + j, c); } }
function circO(cx, cy, r, c, o = 1) { circ(cx, cy, r + 1, o); circ(cx, cy, r, c); }
function ell(cx, cy, rx, ry, c, c2, k = 0) {
  cx = R(cx); cy = R(cy); for (let j = -ry; j <= ry; j++) {
    const w = FL(rx * Math.sqrt(Math.max(0, 1 - (j * j) / ((ry + .5) * (ry + .5)))) + .5);
    if (c2 === undefined) hline(cx - w, cx + w, cy + j, c); else hlineD(cx - w, cx + w, cy + j, c, c2, k);
  }
}
function ellO(cx, cy, rx, ry, c, o = 1) { ell(cx, cy, rx + 1, ry + 1, o); ell(cx, cy, rx, ry, c); }
// scanline polygon fill (pixel centres), integer-exact, no AA
function poly(pts, c) {
  let y0 = 1e9, y1 = -1e9; for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  y0 = Math.max(0, FL(y0)); y1 = Math.min(B.h - 1, Math.ceil(y1));
  for (let y = y0; y <= y1; y++) {
    const yc = y + .5, xs = [];
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
      if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + (yc - ay) / (by - ay) * (bx - ax));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) { const a = Math.ceil(xs[i] - .5), b = FL(xs[i + 1] - .5); if (b >= a) hline(a, b, y, c); }
  }
}
function polyO(pts, c, o = 1) { for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) poly(pts.map(([x, y]) => [x + dx, y + dy]), o); poly(pts, c); }
function line(x0, y0, x1, y1, c, th = 1) {
  x0 = R(x0); y0 = R(y0); x1 = R(x1); y1 = R(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy, n = 0;
  while (n++ < 2000) { if (th === 1) pset(x0, y0, c); else rect(x0 - (th >> 1), y0 - (th >> 1), th, th, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
}
// vertical dithered gradient through a list of palette indices
function vgradD(y0, y1, cols, x0 = 0, x1 = PW - 1) {
  for (let y = FL(y0); y < y1; y++) {
    const p = clamp((y - y0) / Math.max(1, y1 - y0 - 1)) * (cols.length - 1), i = Math.min(cols.length - 2, FL(p));
    hlineD(x0, x1, y, cols[i], cols[i + 1], p - i);
  }
}

// ---- sprites ----
// art rows: one char per pixel, map {char: paletteIndex}, '.' and ' ' transparent. mirror: rows are the left half.
function sprite(rows, map, mirror = false) {
  if (mirror) rows = rows.map((r) => r + [...r].reverse().join(''));
  const w = Math.max(...rows.map((r) => r.length)), b = mkbuf(w, rows.length);
  rows.forEach((r, y) => [...r].forEach((ch, x) => { if (map[ch] !== undefined) b.d[y * w + x] = map[ch]; }));
  return b;
}
// blit with nearest-neighbour scale. o: {sc, flip, map (index remap), ax, ay (anchor 0..1), clipY (don't draw below)}
function blit(sp, x, y, o = {}) {
  const sc = o.sc ?? 1, w = Math.max(1, R(sp.w * sc)), h = Math.max(1, R(sp.h * sc));
  const X0 = R(x - (o.ax ?? 0) * w), Y0 = R(y - (o.ay ?? 0) * h), map = o.map;
  for (let j = 0; j < h; j++) {
    const Y = Y0 + j; if (Y < 0 || Y >= B.h || (o.clipY !== undefined && Y >= o.clipY)) continue;
    const sy = Math.min(sp.h - 1, FL((j + .5) / sc));
    for (let i = 0; i < w; i++) {
      const X = X0 + i; if (X < 0 || X >= B.w) continue;
      let sx = Math.min(sp.w - 1, FL((i + .5) / sc)); if (o.flip) sx = sp.w - 1 - sx;
      let c = sp.d[sy * sp.w + sx]; if (c === TR) continue; if (map && map[c] !== undefined) c = map[c];
      B.d[Y * B.w + X] = c;
    }
  }
}
// draw into an off-screen buffer (for flipped or reused drawings)
function offscreen(w, h, fn) { const b = mkbuf(w, h), prev = B; target(b); fn(); target(prev); return b; }

// ---- 5x7 font, drawn by hand ----
const GLYPH_SRC = {
  A: '01110 10001 10001 11111 10001 10001 10001', B: '11110 10001 10001 11110 10001 10001 11110',
  C: '01110 10001 10000 10000 10000 10001 01110', D: '11110 10001 10001 10001 10001 10001 11110',
  E: '11111 10000 10000 11110 10000 10000 11111', F: '11111 10000 10000 11110 10000 10000 10000',
  G: '01110 10001 10000 10111 10001 10001 01111', H: '10001 10001 10001 11111 10001 10001 10001',
  I: '01110 00100 00100 00100 00100 00100 01110', J: '00111 00010 00010 00010 00010 10010 01100',
  K: '10001 10010 10100 11000 10100 10010 10001', L: '10000 10000 10000 10000 10000 10000 11111',
  M: '10001 11011 10101 10101 10001 10001 10001', N: '10001 10001 11001 10101 10011 10001 10001',
  O: '01110 10001 10001 10001 10001 10001 01110', P: '11110 10001 10001 11110 10000 10000 10000',
  Q: '01110 10001 10001 10001 10101 10010 01101', R: '11110 10001 10001 11110 10100 10010 10001',
  S: '01111 10000 10000 01110 00001 00001 11110', T: '11111 00100 00100 00100 00100 00100 00100',
  U: '10001 10001 10001 10001 10001 10001 01110', V: '10001 10001 10001 10001 10001 01010 00100',
  W: '10001 10001 10001 10101 10101 10101 01010', X: '10001 10001 01010 00100 01010 10001 10001',
  Y: '10001 10001 01010 00100 00100 00100 00100', Z: '11111 00001 00010 00100 01000 10000 11111',
  0: '01110 10001 10011 10101 11001 10001 01110', 1: '00100 01100 00100 00100 00100 00100 01110',
  2: '01110 10001 00001 00010 00100 01000 11111', 3: '11111 00010 00100 00010 00001 10001 01110',
  4: '00010 00110 01010 10010 11111 00010 00010', 5: '11111 10000 11110 00001 00001 10001 01110',
  6: '00110 01000 10000 11110 10001 10001 01110', 7: '11111 00001 00010 00100 01000 01000 01000',
  8: '01110 10001 10001 01110 10001 10001 01110', 9: '01110 10001 10001 01111 00001 00010 01100',
  '.': '00000 00000 00000 00000 00000 01100 01100', ',': '00000 00000 00000 00000 01100 00100 01000',
  "'": '00100 00100 01000 00000 00000 00000 00000', '"': '01010 01010 10100 00000 00000 00000 00000',
  '!': '00100 00100 00100 00100 00100 00000 00100', '?': '01110 10001 00001 00010 00100 00000 00100',
  ':': '00000 01100 01100 00000 01100 01100 00000', '/': '00001 00001 00010 00100 01000 10000 10000',
  '-': '00000 00000 00000 11111 00000 00000 00000', '+': '00000 00100 00100 11111 00100 00100 00000',
  '(': '00010 00100 01000 01000 01000 00100 00010', ')': '01000 00100 00010 00010 00010 00100 01000',
  '>': '10000 11000 11100 11110 11100 11000 10000', '^': '00000 11111 01110 00100 00000 00000 00000',
  '*': '00000 00100 10101 01110 10101 00100 00000', '=': '00000 00000 11111 00000 11111 00000 00000',
  '#': '01010 11111 01010 01010 01010 11111 01010', '<': '00001 00011 00111 01111 00111 00011 00001',
  ' ': '00000 00000 00000 00000 00000 00000 00000',
};
const GLYPH = {}; for (const [k, v] of Object.entries(GLYPH_SRC)) GLYPH[k] = v.split(' ').map((r) => parseInt(r, 2));
const txtW = (str, sc = 1) => str.length * 6 * sc - sc;
function glyphs(str, x, y, c, sc) {
  x = R(x); y = R(y);
  for (let n = 0; n < str.length; n++) {
    const g = GLYPH[str[n].toUpperCase()] || GLYPH['?'];
    for (let j = 0; j < 7; j++) for (let i = 0; i < 5; i++) if (g[j] & (16 >> i)) rect(x + (n * 6 + i) * sc, y + j * sc, sc, sc, c);
  }
}
// o: {sc, o: outline colour, sh: drop-shadow colour, align: 'c'|'r'}
function txt(str, x, y, c, o = {}) {
  const sc = o.sc || 1; if (o.align === 'c') x -= txtW(str, sc) / 2; else if (o.align === 'r') x -= txtW(str, sc);
  if (o.o !== undefined) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) glyphs(str, x + dx, y + dy, o.o, sc);
  if (o.sh !== undefined) glyphs(str, x + sc, y + sc, o.sh, sc);
  glyphs(str, x, y, c, sc);
}

// ---- whole-frame passes ----
// remap every pixel through a palette map (e.g. darken for the pause screen)
function remapFB(map) { for (let i = 0; i < FB.d.length; i++) FB.d[i] = map[FB.d[i]]; }
function nearestPal(r, g, b) { let best = 0, bd = 1e9; PAL.forEach((h, i) => { const n = parseInt(h.slice(1), 16), dr = (n >> 16) - r, dg = ((n >> 8) & 255) - g, db = (n & 255) - b, d = dr * dr * 3 + dg * dg * 4 + db * db * 2; if (d < bd) { bd = d; best = i; } }); return best; }
function palMap(fn) { return PAL.map((h) => { const n = parseInt(h.slice(1), 16); return nearestPal(...fn(n >> 16, (n >> 8) & 255, n & 255)); }); }
let OUTCV = null, OUTCX = null, OUTIMG = null;
function palInit() {
  PALRGB = new Uint32Array(256);
  PAL.forEach((h, i) => { const n = parseInt(h.slice(1), 16); PALRGB[i] = (255 << 24) | ((n & 255) << 16) | (n & 0xff00) | ((n >> 16) & 255); });
  OUTCV = document.createElement('canvas'); OUTCV.width = PW; OUTCV.height = PH; OUTCX = OUTCV.getContext('2d'); OUTIMG = OUTCX.createImageData(PW, PH);
}
// expand FB through the palette (with an integer screen-shake offset) and scale it up, nearest-neighbour
function pxOut(ox = 0, oy = 0, border = 0) {
  const o32 = new Uint32Array(OUTIMG.data.buffer); ox = R(ox); oy = R(oy);
  for (let y = 0; y < PH; y++) {
    const sy = y - oy;
    for (let x = 0; x < PW; x++) { const sx = x - ox; o32[y * PW + x] = (sx < 0 || sy < 0 || sx >= PW || sy >= PH) ? PALRGB[border] : PALRGB[FB.d[sy * PW + sx]]; }
  }
  OUTCX.putImageData(OUTIMG, 0, 0);
  s.setTransform(1, 0, 0, 1, 0, 0); s.imageSmoothingEnabled = false;
  s.drawImage(OUTCV, 0, 0, s.canvas.width, s.canvas.height);
}

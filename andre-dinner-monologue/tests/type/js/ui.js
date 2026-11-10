// UI kit: palette, type, HUD chrome. Draws on the 2D source canvas `s` (720 x 1280).
// LOOK: ground #0a0908, type #ece6d8, accent #ff4a1c, greys #77736b #ebe2cc. One accent, bloomed by the shader.
const C = { bg: '#0a0908', ink: '#ece6d8', dim: '#77736b', faint: '#2a2723', hot: '#ff4a1c', paper: '#ebe2cc', panel: '#0e0d0b', ghost: '#3a3733', pencil: '#24201c' };
const FAM = { g: 'Archivo', m: '"JetBrains Mono"', s: '"Instrument Serif"' };
// LAYOUT (720 x 1280): 48 px margin; big words in a 624 px column at x 48; panels 560 wide at x 80; readout strip = bottom 120 px.
const M = 48, COL = 624, PX = 80, PW = 560, STRIP = 120;
function font(fam, size, weight = 400, o = {}) {
  s.font = `${o.italic ? 'italic ' : ''}${weight} ${size}px ${fam}`;
  s.fontStretch = o.stretch || 'normal'; s.letterSpacing = (o.ls || 0) + 'px';
}
// text(str, x, y, {fam, size, weight, color, align, base, italic, stretch, ls, alpha, probe, box}) -> width
function text(str, x, y, o = {}) {
  font(o.fam || FAM.m, o.size || 20, o.weight || 400, o);
  s.textAlign = o.align || 'left'; s.textBaseline = o.base || 'alphabetic';
  const ga = s.globalAlpha; s.globalAlpha = ga * (o.alpha ?? 1); s.fillStyle = o.color || C.ink; s.fillText(str, x, y);
  if (o.probe) PROBE.text(s, o.probe, str, x, y, o.box || null, { margin: o.margin ?? 8 });
  s.globalAlpha = ga;
  return s.measureText(str).width;
}
function measure(str, o = {}) { font(o.fam || FAM.m, o.size || 20, o.weight || 400, o); return s.measureText(str).width; }
function fitSize(str, maxW, maxSize, o = {}) { return Math.min(maxSize, 100 * maxW / measure(str, { ...o, size: 100 })); }
const typed = (str, t, t0, cps = 30) => str.slice(0, Math.max(0, Math.floor((t - t0) * cps)));
const blink = (t, hz = 2.2) => Math.floor(t * hz * 2) % 2 === 0;
function rect(x, y, w, h, c, lw = 2) { s.lineWidth = lw; s.strokeStyle = c; s.strokeRect(x, y, w, h); }
function frect(x, y, w, h, c) { s.fillStyle = c; s.fillRect(x, y, w, h); }
function brackets(x, y, w, h, len = 18, c = C.dim, lw = 1.5) {
  s.lineWidth = lw; s.strokeStyle = c; s.lineCap = 'butt'; s.beginPath();
  for (const [px, py, dx, dy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) {
    s.moveTo(px + dx * len, py); s.lineTo(px, py); s.lineTo(px, py + dy * len);
  }
  s.stroke();
}
function dash(pts, c, lw, seg = [10, 8], off = 0) { s.setLineDash(seg); s.lineDashOffset = off; line(pts, c, lw, 'butt'); s.setLineDash([]); }
function arrowHead(x, y, ang, len, c) { poly([[x, y], [x - Math.cos(ang - .45) * len, y - Math.sin(ang - .45) * len], [x - Math.cos(ang + .45) * len, y - Math.sin(ang + .45) * len]], c); }
// a framed interface panel; p is its arrival (0..1, a spring), q its exit (0..1, collapses to the top edge)
function panelBox(x, y, w, h, p = 1, q = 0, fillc = C.panel) {
  const sc = lerp(.94, 1, p), a = clamp(p * 2), hh = h * (1 - ease.in(q));
  s.save(); s.translate(x + w / 2, y + h / 2); s.scale(sc, sc); s.translate(-x - w / 2, -y - h / 2); s.globalAlpha = a;
  frect(x, y, w, hh, fillc); rect(x, y, w, hh, C.dim, 1.5);
  s.beginPath(); s.rect(x - 2, y - 2, w + 4, hh + 4); s.clip();
  return () => s.restore();
}
// the classic arrow pointer
function cursor(x, y, c = C.ink) {
  const P = [[0, 0], [0, 19], [4.5, 15], [8, 22.5], [10.5, 21.5], [7, 14.5], [12.5, 14.5]].map(([a, b]) => [x + a * 1.6, y + b * 1.6]);
  s.lineJoin = 'miter'; s.lineWidth = 3; s.strokeStyle = C.bg; s.beginPath(); P.forEach(([a, b], i) => i ? s.lineTo(a, b) : s.moveTo(a, b)); s.closePath(); s.stroke();
  poly(P, c);
}
// the same chrome on every frame: corner brackets, shot code, timecode and frame, the readout strip
function chrome(t, f, code, rows, o = {}) {
  const a = o.alpha ?? 1; s.globalAlpha = a;
  brackets(22, 22, W - 44, H - 44, 18, C.dim, 1.5);
  text(code, M, 52, { size: 13, color: C.dim, ls: 2 });
  text(`T+${t.toFixed(3)}  F${String(f).padStart(4, '0')}`, W - M, 52, { size: 13, color: C.dim, align: 'right', ls: 1 });
  // readout strip: bottom 120 px, a printed paper tape (the one lit surface; also what keeps badframes.py's
  // lower-right quadrant above its near-black threshold on a #0a0908 ground)
  const y0 = H - STRIP, pen = C.pencil;
  frect(0, y0, W, STRIP, C.paper); line([[0, y0 + 1], [W, y0 + 1]], pen, 2);
  text('24 FPS  720×1280', M, y0 + 32, { size: 12, color: pen, ls: 1 });
  text(`${(t * FPS).toFixed(0).padStart(5, '0')}`, M, y0 + 84, { fam: FAM.g, size: 40, weight: 700, color: pen, ls: 1 });
  // the live readout, label + value, the value in the accent when hot
  const [k, v, hot] = rows;
  text(k, 300, y0 + 44, { size: 13, color: pen, ls: 3 });
  text(v, 300, y0 + 84, { size: 26, weight: 700, color: hot ? C.hot : pen });
  // voice level, last 12 frames, right side
  for (let i = 0; i < 12; i++) { const v2 = voc(f - 11 + i); frect(W - M - 12 * 10 + i * 10, y0 + 84 - v2 * 48, 5, 2 + v2 * 48, i === 11 ? C.hot : pen); }
  s.globalAlpha = 1;
}

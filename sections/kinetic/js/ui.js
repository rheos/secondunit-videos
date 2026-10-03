// UI kit: palette, type, HUD chrome. Draws on the 2D source canvas `s` (1920 x 1080).
const C = { bg: '#0a0908', ink: '#ece6d8', dim: '#77736b', faint: '#26231f', hot: '#ff4a1c', paper: '#ebe2cc', pink: '#c4321e', pencil: '#24201c' };
const FAM = { g: 'Archivo', m: '"JetBrains Mono"', s: '"Instrument Serif"' };
function font(fam, size, weight = 400, o = {}) {
  s.font = `${o.italic ? 'italic ' : ''}${weight} ${size}px ${fam}`;
  s.fontStretch = o.stretch || 'normal'; s.letterSpacing = (o.ls || 0) + 'px';
}
// text(str, x, y, {fam, size, weight, color, align, base, italic, stretch, ls, alpha}) -> width
function text(str, x, y, o = {}) {
  font(o.fam || FAM.m, o.size || 20, o.weight || 400, o);
  s.textAlign = o.align || 'left'; s.textBaseline = o.base || 'alphabetic';
  s.globalAlpha = o.alpha ?? 1; s.fillStyle = o.color || C.ink; s.fillText(str, x, y); s.globalAlpha = 1;
  return s.measureText(str).width;
}
function measure(str, o = {}) { font(o.fam || FAM.m, o.size || 20, o.weight || 400, o); return s.measureText(str).width; }
function fitSize(str, maxW, maxSize, o = {}) { return Math.min(maxSize, 100 * maxW / measure(str, { ...o, size: 100 })); }
const typed = (str, t, t0, cps = 30) => str.slice(0, Math.max(0, Math.floor((t - t0) * cps)));
const blink = (t, hz = 2.2) => Math.floor(t * hz * 2) % 2 === 0;
const word = (k) => LYR.w[k][0];
const wt = (k) => LYR.w[k][1];
const up = (k) => LYR.w[k][0].toUpperCase();
const sung = (k, t, lead = .03) => t >= wt(k) - lead;
function rect(x, y, w, h, c, lw = 2) { s.lineWidth = lw; s.strokeStyle = c; s.strokeRect(x, y, w, h); }
function frect(x, y, w, h, c) { s.fillStyle = c; s.fillRect(x, y, w, h); }
function brackets(x, y, w, h, len = 24, c = C.ink, lw = 2) {
  s.lineWidth = lw; s.strokeStyle = c; s.beginPath();
  for (const [px, py, dx, dy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) {
    s.moveTo(px + dx * len, py); s.lineTo(px, py); s.lineTo(px, py + dy * len);
  }
  s.stroke();
}
function cross(x, y, r, c = C.ink, lw = 1.5) { line([[x - r, y], [x + r, y]], c, lw); line([[x, y - r], [x, y + r]], c, lw); }
function grid(step, c, x0 = 0, y0 = 0, lw = 1) {
  s.lineWidth = lw; s.strokeStyle = c; s.beginPath();
  for (let x = ((x0 % step) + step) % step; x < W; x += step) { s.moveTo(x, 0); s.lineTo(x, H); }
  for (let y = ((y0 % step) + step) % step; y < H; y += step) { s.moveTo(0, y); s.lineTo(W, y); }
  s.stroke();
}
function dash(pts, c, lw, seg = [14, 12], off = 0) { s.setLineDash(seg); s.lineDashOffset = off; line(pts, c, lw, 'butt'); s.setLineDash([]); }
// small mono readout block: rows of [label, value]
function readout(x, y, rows, o = {}) {
  const sz = o.size || 17, lh = sz * 1.45;
  rows.forEach(([k, v, hot], i) => {
    text(k, x, y + i * lh, { size: sz, color: C.dim });
    text(v, x + (o.col || 120), y + i * lh, { size: sz, color: hot ? C.hot : C.ink, weight: hot ? 700 : 400 });
  });
}
// labelled tag with a leader line from (ax, ay) to a box at (bx, by)
function tag(ax, ay, bx, by, title, sub, o = {}) {
  const c = o.color || C.hot;
  line([[ax, ay], [bx, by], [bx + (o.left ? -30 : 30), by]], c, 2);
  dot(ax, ay, 5, c);
  const sz = o.size || 24, tw = Math.max(measure(title, { size: sz, weight: 700 }), sub ? measure(sub, { size: sz * .62 }) : 0) + 28;
  const x = o.left ? bx - 30 - tw : bx + 30, h = sub ? sz * 2.25 : sz * 1.5;
  s.fillStyle = 'rgba(10,9,8,.85)'; s.fillRect(x, by - h / 2, tw, h); rect(x, by - h / 2, tw, h, c, 2);
  text(title, x + 14, by - h / 2 + sz * 1.1, { size: sz, weight: 700, color: c });
  if (sub) text(sub, x + 14, by - h / 2 + sz * 1.95, { size: sz * .62, color: C.ink });
}
// the same chrome on every dark shot: corner brackets, timecode, shot code, beat light
function chrome(t, code, o = {}) {
  const c = o.color || C.dim;
  brackets(36, 36, W - 72, H - 72, 30, c, 2);
  text('AOH/03 · AIRPLANE ON THE HIGHWAY', 70, 76, { size: 16, color: c, ls: 2 });
  text(`T+${t.toFixed(3)}`, W - 70, 76, { size: 16, color: c, align: 'right', ls: 1 });
  text(code, 70, H - 62, { size: 16, color: c, ls: 2 });
  const bp = beatPulse(t, 9);
  dot(W - 82, H - 68, 6, bp > .3 ? C.hot : c);
  text(`${(105.9).toFixed(1)} BPM`, W - 100, H - 62, { size: 16, color: c, align: 'right', ls: 1 });
}
// draw a word letter by letter with a per-letter transform hook: fn(i, ch, cx) -> {dx, dy, rot, sc, alpha}
function letters(str, x, y, o, fn) {
  font(o.fam || FAM.g, o.size, o.weight || 900, o);
  const ws = [...str].map((ch) => s.measureText(ch).width), tot = ws.reduce((a, b) => a + b, 0) + (str.length - 1) * (o.ls || 0);
  let cx = o.align === 'center' ? x - tot / 2 : x;
  s.letterSpacing = '0px'; s.textAlign = 'center'; s.textBaseline = 'alphabetic';
  [...str].forEach((ch, i) => {
    const mid = cx + ws[i] / 2, m = fn ? fn(i, ch, mid) : {};
    if ((m.alpha ?? 1) > 0) withT(() => {
      s.translate(mid + (m.dx || 0), y + (m.dy || 0)); s.rotate(m.rot || 0); s.scale(m.sc || 1, m.sc || 1);
      s.globalAlpha = m.alpha ?? 1; s.fillStyle = m.color || o.color || C.ink;
      if (o.stroke) { s.lineWidth = o.stroke; s.strokeStyle = m.color || o.color || C.ink; s.strokeText(ch, 0, 0); } else s.fillText(ch, 0, 0);
    });
    cx += ws[i] + (o.ls || 0);
  });
  return tot;
}
// type on a path: pts sampled polyline, letters placed by arc length starting at d0 going backwards (trail)
function samplePath(fn, n = 400) { const p = []; for (let i = 0; i <= n; i++) p.push(fn(i / n)); const L = [0]; for (let i = 1; i < p.length; i++) L.push(L[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); return { p, L, len: L[L.length - 1] }; }
function atLen(P, d) {
  d = clamp(d, 0, P.len); let lo = 0, hi = P.L.length - 1;
  while (lo < hi - 1) { const m = (lo + hi) >> 1; if (P.L[m] <= d) lo = m; else hi = m; }
  const u = (d - P.L[lo]) / Math.max(1e-6, P.L[hi] - P.L[lo]), a = P.p[lo], b = P.p[hi];
  return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), Math.atan2(b[1] - a[1], b[0] - a[0])];
}
// offscreen canvases for cached type textures
const CACHE = {};
function textCanvas(key, w, h, draw) {
  if (CACHE[key]) return CACHE[key];
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  const keep = s; s = g; draw(g); s = keep; return (CACHE[key] = c);
}

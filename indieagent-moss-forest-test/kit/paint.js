// inked3d kit, painted plates: flat tones with hard wet edges, hatched foliage, no gaussian blur. A project bakes
// its plates once at load with these tools and slides them per frame; defocus (a blur) only for close-ups.
const PX = INK3D.margin[0], PY = INK3D.margin[1], PLW = W + 2 * PX, PLH = H + 2 * PY;
function plateCanvas() { const c = canvas(PLW, PLH), g = c.getContext('2d'); g.translate(PX, PY); return [c, g]; }
// paint per pixel from a function returning [r,g,b] / [r,g,b,a] or null: washes with hard edges
function wash(g, x0, y0, x1, y1, fn) {
  const w = x1 - x0, h = y1 - y0, d = g.createImageData(w, h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const c = fn(x0 + i, y0 + j); if (!c) continue; const o = (j * w + i) * 4; d.data[o] = c[0]; d.data[o + 1] = c[1]; d.data[o + 2] = c[2]; d.data[o + 3] = c[3] === undefined ? 255 : c[3]; }
  const t = canvas(w, h); t.getContext('2d').putImageData(d, 0, 0); g.drawImage(t, x0, y0);
}
// dry-brush hatching: a clump of short parallel strokes in flat tones, dark first. o: { dens, ang, sq, lx, seed, lift }
function hatch(g, cx, cy, R, pal, R0, o = {}) {
  const n = Math.round(18 + R * R * (o.dens || .09) * 2.6), s = [], ang = o.ang ?? -.9, sq = o.sq || .72;
  for (let i = 0; i < n; i++) { const a = R0() * TAU, r = Math.sqrt(R0()); if (r > .62 + .5 * vn2(Math.cos(a) * 1.7 + cx * .04, Math.sin(a) * 1.7 + cy * .04, 31)) continue; const nx = Math.cos(a) * r, ny = Math.sin(a) * r; const v = .36 - .42 * ny + .22 * nx * (o.lx ?? .5) + (fbm2((cx + nx * R) * .05, (cy + ny * R * sq) * .05, o.seed || 5) - .5) * .85; s.push([cx + nx * R, cy + ny * R * sq, clamp(v + (o.lift || 0))]); }
  s.sort((a, b) => a[2] - b[2]); g.lineCap = 'butt';
  for (const [x, y, v] of s) { const i = Math.min(pal.length - 1, Math.floor(v * pal.length)), L = Math.min(11, R * (.07 + R0() * .1)) + 2.4, a = ang + (R0() - .5) * .6, dx = Math.cos(a) * L, dy = Math.sin(a) * L, wd = Math.min(2.6, R * (.02 + R0() * .03)) + .7; g.strokeStyle = css(pal[i]);
    for (let k = 0; k < 3; k++) { const off = (k - 1) * wd * .95, px = -Math.sin(a) * off, py = Math.cos(a) * off, t0 = R0() * .22, t1 = 1 - R0() * .22; g.lineWidth = wd * (.55 + R0() * .55); g.beginPath(); g.moveTo(x - dx * t1 + px, y - dy * t1 + py); g.lineTo(x + dx * (1 - t0) + px, y + dy * (1 - t0) + py); g.stroke(); } }
}
// a tall tapered trunk, pole or pillar: flat tones [shade, mid, lit], a ragged dark edge on the shade side, bark
// strokes, growth climbing it in hatch (o.ivy count with o.ivyPal), and one broken ink line down each edge.
// o: { rag, litSide (+ lit on the right), ivy, ivyPal, ink }
function barkTrunk(g, x, y0, y1, w, lean, tones, R0, o = {}) {
  const N = 30, xAt = (y) => x + lean * (y1 - y) + (vn2(y * .008, x, 41) - .5) * w * .22, wAt = (y) => w * (.74 + .26 * inv(y0, y1, y)) * (1 + .75 * Math.pow(inv(y1 - 90, y1, y), 2));
  const side = (s) => { const pts = []; for (let i = 0; i <= N * 3; i++) { const y = lerp(y0, y1, i / (N * 3)); pts.push([xAt(y) + s * wAt(y) / 2 + (vn2(y * .09, x + s, 43) - .5) * (o.rag || 3.4), y]); } return pts; };
  const L = side(-1), Rr = side(1), P = new Path2D(); L.forEach((q, i) => (i ? P.lineTo : P.moveTo).call(P, q[0], q[1])); Rr.slice().reverse().forEach((q) => P.lineTo(q[0], q[1])); P.closePath();
  g.save(); g.fillStyle = css(tones[1]); g.fill(P); g.clip(P);
  const n = Math.round((y1 - y0) * w / 22); for (let i = 0; i < n; i++) { const y = lerp(y0, y1, R0()), u = R0() - .5, cx = xAt(y) + u * wAt(y), v = fbm2(cx * .05, y * .012, 47) + u * (o.litSide || .7), t = v < .42 ? tones[0] : v < .62 ? tones[1] : tones[2], len = 8 + R0() * 26; g.strokeStyle = css(t); g.lineWidth = 1.4 + R0() * w * .05; g.beginPath(); g.moveTo(cx, y); g.lineTo(cx + (R0() - .5) * 2.5, y + len); g.stroke(); }
  const shadeX = (o.litSide || .7) > 0 ? -1 : 1; g.fillStyle = css(tones[0]); for (let i = 0; i < 90; i++) { const y = lerp(y0, y1, i / 90); g.fillRect(xAt(y) + shadeX * wAt(y) * .5 - (shadeX > 0 ? wAt(y) * (.14 + .1 * vn2(y * .05, x, 49)) : 0), y, wAt(y) * (.14 + .1 * vn2(y * .05, x, 49)), (y1 - y0) / 88); }
  g.restore();
  if (o.ivy) { const pal = o.ivyPal; for (let i = 0; i < o.ivy * 26; i++) { const y = lerp(y0 + (y1 - y0) * .14, y1, Math.pow(R0(), .75)), u = (R0() - .5) * .95, xx = xAt(y) + u * wAt(y); if (fbm2(xx * .018, y * .0065, 53) < .51) continue; const v = fbm2(xx * .09, y * .05, 55) + (u * (o.litSide || .7)) * .35 + (R0() - .5) * .25; g.strokeStyle = css(pal[Math.min(pal.length - 1, Math.floor(clamp((v - .2) / .6) * pal.length))]); g.lineWidth = 1.5 + R0() * 2; const a = -1.2 + (R0() - .5) * 1.1, L = 3 + R0() * 5; g.beginPath(); g.moveTo(xx - Math.cos(a) * L, y - Math.sin(a) * L); g.lineTo(xx + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); } }
  g.strokeStyle = o.ink || 'rgba(14,20,24,.8)'; g.lineWidth = 1.3; for (const pts of [L, Rr]) { let on = false; g.beginPath(); pts.forEach((q, i) => { const k = vn2(i * .13, x, 51) > .36; if (k && !on) g.moveTo(q[0], q[1]); else if (k) g.lineTo(q[0], q[1]); on = k; }); g.stroke(); }
}
// a hanging strand of paired leaves (a vine, a creeper, a garland)
function frondLeaves(g, x, y, len, sw, tones, R0) {
  const n = Math.round(len / 11), leaf = (lx, ly, a, s, t) => { g.fillStyle = css(t); g.beginPath(); g.moveTo(lx, ly); g.quadraticCurveTo(lx + Math.cos(a - .5) * s * .6, ly + Math.sin(a - .5) * s * .6, lx + Math.cos(a) * s, ly + Math.sin(a) * s); g.quadraticCurveTo(lx + Math.cos(a + .5) * s * .6, ly + Math.sin(a + .5) * s * .6, lx, ly); g.fill(); };
  for (let i = 0; i < n; i++) { const k = i / n, cx = x + sw * k * k, cy = y + len * k, s = lerp(17, 8, k) * (.85 + R0() * .35), t = tones[Math.floor(R0() * R0() * tones.length)]; leaf(cx, cy, 1.05 + (R0() - .5) * .25, s, t); leaf(cx, cy, Math.PI - 1.05 + (R0() - .5) * .25, s, t); }
}

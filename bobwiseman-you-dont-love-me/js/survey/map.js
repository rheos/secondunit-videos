// Drawing the survey sheet in world units under the current camera transform. The evil spell is a warp:
// every map point is turned around the daisy by an angle that falls off with distance (a spiral).
const INK = '#2a211a', BROWN = '#a8582a', BROWN_D = '#8a4220', BLUE = '#3f7fae', BLUE_L = '#9cc3dc', SEA = '#d4e3e1', GRIDC = 'rgba(70,120,170,.33)';
const NUMFONT = 'italic {s}px Georgia, "Times New Roman", serif';
const WARP = { amt: 0, cx: DAISY[0], cy: DAISY[1], R: 980 };
let PXW = 1; // one screen pixel in world units (1 / zoom), set per frame
function wp(x, y) {
  if (WARP.amt === 0) return [x, y];
  const dx = x - WARP.cx, dy = y - WARP.cy, r2 = dx * dx + dy * dy, a = WARP.amt * Math.exp(-r2 / (WARP.R * WARP.R));
  const c = Math.cos(a), s = Math.sin(a);
  return [WARP.cx + dx * c - dy * s, WARP.cy + dx * s + dy * c];
}
function tracePoly(g, F, closed, stride = 1) {
  const n = F.length / 2;
  if (WARP.amt === 0) {
    g.moveTo(F[0], F[1]);
    for (let i = stride; i < n; i += stride) g.lineTo(F[i * 2], F[i * 2 + 1]);
    if (!closed && (n - 1) % stride) g.lineTo(F[n * 2 - 2], F[n * 2 - 1]);
  } else {
    const A = WARP.amt, cx = WARP.cx, cy = WARP.cy, iR = 1 / (WARP.R * WARP.R);
    for (let i = 0; i < n; i += stride) {
      const dx = F[i * 2] - cx, dy = F[i * 2 + 1] - cy, a = A * Math.exp(-(dx * dx + dy * dy) * iR), c = Math.cos(a), s = Math.sin(a);
      const x = cx + dx * c - dy * s, y = cy + dx * s + dy * c;
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
  }
  if (closed) g.closePath();
}
function visible(bb, V) { return WARP.amt > 0 || !(bb[2] < V[0] || bb[0] > V[2] || bb[3] < V[1] || bb[1] > V[3]); }

// ---------- prebaked paper + relief shading ----------
let PAPER = null, HILL = null;
function bakePaper() {
  const sc = .5, c = mkCanvas(SW * sc, SH * sc), g = c.getContext('2d'); g.scale(sc, sc);
  g.fillStyle = '#eee3c8'; g.fillRect(0, 0, SW, SH);
  const R = mulberry(31);
  for (let k = 0; k < 70; k++) { // mottling and old water stains
    const x = R() * SW, y = R() * SH, r = 80 + R() * 520, a = .025 + R() * .05;
    const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, `rgba(${150 + R() * 40},${110 + R() * 30},${60 + R() * 20},${a})`); rg.addColorStop(1, 'rgba(150,110,60,0)');
    g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let k = 0; k < 6; k++) { // tide-mark rings
    const x = R() * SW, y = R() * SH, r = 60 + R() * 140; g.strokeStyle = `rgba(140,95,45,${.08 + R() * .06})`; g.lineWidth = 3 + R() * 5;
    g.beginPath(); g.ellipse(x, y, r, r * (.8 + R() * .3), R() * 3, 0, TAU); g.stroke();
  }
  for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(120,80,40,${.05 + R() * .12})`; g.beginPath(); g.arc(R() * SW, R() * SH, .8 + R() * 3.5, 0, TAU); g.fill(); } // foxing
  // edges browned
  for (const [x0, y0, x1, y1, rx, ry, rw, rh] of [[0, 0, 160, 0, 0, 0, 160, SH], [SW, 0, SW - 160, 0, SW - 160, 0, 160, SH], [0, 0, 0, 160, 0, 0, SW, 160], [0, SH, 0, SH - 160, 0, SH - 160, SW, 160]]) {
    const lg = g.createLinearGradient(x0, y0, x1, y1); lg.addColorStop(0, 'rgba(120,80,35,.22)'); lg.addColorStop(1, 'rgba(120,80,35,0)'); g.fillStyle = lg; g.fillRect(rx, ry, rw, rh);
  }
  PAPER = c;
  // relief shading (light from the north-west, the old engraver's convention)
  const hw = Math.round((MX1 - MX0) * sc), hh = Math.round((MY1 - MY0) * sc), h = mkCanvas(hw, hh), hg = h.getContext('2d'), im = hg.createImageData(hw, hh);
  const L = [-.55, -.6, .58]; const ln = Math.hypot(...L); L[0] /= ln; L[1] /= ln; L[2] /= ln;
  for (let j = 0; j < hh; j++) for (let i = 0; i < hw; i++) {
    const x = MX0 + i / sc, y = MY0 + j / sc, ht = fieldAt(x, y); if (ht < 5) continue;
    const gx = (fieldAt(x + 4, y) - fieldAt(x - 4, y)) / 8, gy = (fieldAt(x, y + 4) - fieldAt(x, y - 4)) / 8, zf = .32;
    const nx = -gx * zf, ny = -gy * zf, nn = Math.hypot(nx, ny, 1), sh = (nx * L[0] + ny * L[1] + L[2]) / nn;
    const a = clamp((L[2] - sh) * 1.0 - .02, 0, .34), o = (j * hw + i) * 4;
    im.data[o] = 96; im.data[o + 1] = 74; im.data[o + 2] = 52; im.data[o + 3] = a * 255;
  }
  hg.putImageData(im, 0, 0); HILL = h;
}

// ---------- the sheet ----------
function drawSheet(g, t, V, z, spell) {
  // shadow of the sheet on the desk
  g.save(); g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 40 * PXW * z; g.shadowOffsetX = 10; g.shadowOffsetY = 14;
  g.fillStyle = '#eee3c8'; g.fillRect(0, 0, SW, SH); g.restore();
  g.drawImage(PAPER, 0, 0, SW, SH);
  // fold creases (the sheet was folded into 4 x 3 panels)
  g.lineWidth = 3 * PXW + 2;
  for (let k = 1; k < 4; k++) { const x = k * SW / 4; g.strokeStyle = 'rgba(255,250,235,.35)'; g.beginPath(); g.moveTo(x + 2, 0); g.lineTo(x + 2, SH); g.stroke(); g.strokeStyle = 'rgba(110,80,40,.14)'; g.beginPath(); g.moveTo(x - 2, 0); g.lineTo(x - 2, SH); g.stroke(); }
  for (let k = 1; k < 3; k++) { const y = k * SH / 3; g.strokeStyle = 'rgba(255,250,235,.35)'; g.beginPath(); g.moveTo(0, y + 2); g.lineTo(SW, y + 2); g.stroke(); g.strokeStyle = 'rgba(110,80,40,.14)'; g.beginPath(); g.moveTo(0, y - 2); g.lineTo(SW, y - 2); g.stroke(); }

  g.save(); g.beginPath(); g.rect(MX0, MY0, MX1 - MX0, MY1 - MY0); g.clip();
  // relief shading fades out as the spell takes the lines away from the ground
  if (spell < .999) { g.globalAlpha = .9 * (1 - spell); g.drawImage(HILL, MX0, MY0, MX1 - MX0, MY1 - MY0); g.globalAlpha = 1; }
  // sea
  g.beginPath(); tracePoly(g, T.coast, false); g.lineTo(MX1 + 400, MY1 + 400); g.lineTo(MX1 + 400, MY0 - 400); g.closePath();
  g.fillStyle = SEA; g.fill();
  // kilometre grid
  g.strokeStyle = GRIDC; g.lineWidth = 1.1 * PXW;
  g.beginPath();
  for (let x = MX0 + 200; x < MX1; x += 400) tracePoly(g, gridLine(x, true), false);
  for (let y = MY0 + 200; y < MY1; y += 400) tracePoly(g, gridLine(y, false), false);
  g.stroke();
  // water lines (OS style lines parallel to the shore)
  T.sea.forEach((c) => {
    if (!visible(c.bb, V)) return;
    const k = [-10, -28, -55, -95, -150].indexOf(c.lv);
    g.strokeStyle = `rgba(63,127,174,${.75 - k * .12})`; g.lineWidth = Math.max(.8, 1.3 - k * .1) * PXW;
    g.beginPath(); tracePoly(g, c.pts, c.closed, z < .7 ? 2 : 1); g.stroke();
  });
  g.strokeStyle = BLUE; g.lineWidth = 2 * PXW + .4; g.beginPath(); tracePoly(g, T.coast, false); g.stroke();
  // contours
  const stride = z < .55 ? 3 : z < 1.1 ? 2 : 1;
  g.lineJoin = 'round'; g.lineCap = 'round';
  g.strokeStyle = 'rgba(168,88,42,.78)'; g.lineWidth = 1.05 * PXW + .15; g.beginPath();
  for (const c of T.contours) if (!c.idx && visible(c.bb, V)) tracePoly(g, c.pts, c.closed, stride);
  g.stroke();
  g.strokeStyle = 'rgba(138,66,32,.92)'; g.lineWidth = 2.1 * PXW + .3; g.beginPath();
  for (const c of T.contours) if (c.idx && visible(c.bb, V)) tracePoly(g, c.pts, c.closed, stride);
  g.stroke();
  // hachures
  g.strokeStyle = 'rgba(60,40,26,.72)'; g.lineWidth = .9 * PXW + .25; g.beginPath();
  const H = T.hach;
  for (let i = 0; i < H.length; i += 4) {
    if (WARP.amt === 0) { if (H[i] < V[0] || H[i] > V[2] || H[i + 1] < V[1] || H[i + 1] > V[3]) continue; g.moveTo(H[i], H[i + 1]); g.lineTo(H[i + 2], H[i + 3]); }
    else { const a = wp(H[i], H[i + 1]), b = wp(H[i + 2], H[i + 3]); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
  }
  g.stroke();
  // cliff top: rock line with teeth pointing down the face
  g.strokeStyle = INK; g.lineWidth = 1.5 * PXW + .5; g.beginPath();
  T.cliffTeeth.forEach(([x, y, c], i) => { const p = wp(x, y); if (i === 0) g.moveTo(p[0], p[1]); else g.lineTo(p[0], p[1]); });
  g.stroke(); g.beginPath();
  T.cliffTeeth.forEach(([x, y, c], i) => { if (i % 2) return; const a = wp(x - 1, y - 3), b = wp(x + 14 * c, y + 1), d = wp(x - 1, y + 5); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(d[0], d[1]); });
  g.fillStyle = INK; g.fill();
  // river, with flow dashes moving downstream
  drawRiver(g, t);
  // woods
  drawTrees(g, V);
  // footpath
  g.strokeStyle = 'rgba(42,33,26,.85)'; g.lineWidth = 2.2 * PXW + .6; g.setLineDash([14, 9]); g.beginPath(); tracePoly(g, flatten(FOOTPATH), false); g.stroke(); g.setLineDash([]);
  g.restore();

  drawMargin(g, z);
}
const _gridCache = new Map();
function gridLine(v, vertical) {
  const k = (vertical ? 'v' : 'h') + v; if (_gridCache.has(k)) return _gridCache.get(k);
  const p = []; if (vertical) for (let y = MY0; y <= MY1; y += 25) p.push(v, y); else for (let x = MX0; x <= MX1; x += 25) p.push(x, v);
  const f = new Float32Array(p); _gridCache.set(k, f); return f;
}
const _flat = new Map();
function flatten(P) { if (_flat.has(P)) return _flat.get(P); const f = new Float32Array(P.flat()); _flat.set(P, f); return f; }
function drawRiver(g, t) {
  const n = RIVER.length;
  for (let i = 0; i + 1 < n; i++) {
    const u = i / (n - 1), a = wp(RIVER[i][0], RIVER[i][1]), b = wp(RIVER[i + 1][0], RIVER[i + 1][1]);
    g.strokeStyle = BLUE; g.lineWidth = (2 + u * 9) + PXW; g.lineCap = 'round';
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  }
  g.strokeStyle = 'rgba(214,234,244,.9)'; g.lineWidth = 1.6 * PXW + 1.2; g.setLineDash([10, 34]); g.lineDashOffset = -t * 55;
  g.beginPath(); tracePoly(g, flatten(RIVER.slice(Math.round(n * .15))), false); g.stroke(); g.setLineDash([]); g.lineDashOffset = 0;
}
function drawTrees(g, V) {
  g.lineWidth = 1.1 * PXW + .35;
  for (const [x0, y0, s] of T.trees) {
    if (WARP.amt === 0 && (x0 < V[0] - 30 || x0 > V[2] + 30 || y0 < V[1] - 30 || y0 > V[3] + 30)) continue;
    const [x, y] = wp(x0, y0), r = 8 * s;
    g.beginPath(); g.moveTo(x, y + r * 1.9); g.lineTo(x, y + r * .4); g.strokeStyle = 'rgba(42,33,26,.85)'; g.stroke();
    g.beginPath(); g.arc(x - r * .45, y + r * .1, r * .62, Math.PI * .6, Math.PI * 1.6); g.arc(x, y - r * .45, r * .7, Math.PI * 1.1, Math.PI * 1.95); g.arc(x + r * .45, y + r * .1, r * .62, Math.PI * 1.45, Math.PI * .45); g.closePath();
    g.fillStyle = 'rgba(160,190,120,.35)'; g.fill(); g.stroke();
  }
}
function drawMargin(g, z) {
  // neatline and the graduated border ladder
  g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(MX0, MY0, MX1 - MX0, MY1 - MY0);
  g.lineWidth = 2; g.strokeRect(MX0 - 40, MY0 - 40, MX1 - MX0 + 80, MY1 - MY0 + 80);
  g.lineWidth = 1.2; g.strokeRect(MX0 - 28, MY0 - 28, MX1 - MX0 + 56, MY1 - MY0 + 56);
  g.fillStyle = INK;
  for (let x = MX0, k = 0; x < MX1; x += 100, k++) if (k % 2 === 0) { g.fillRect(x, MY0 - 28, Math.min(100, MX1 - x), -12); g.fillRect(x, MY1 + 28, Math.min(100, MX1 - x), 12); }
  for (let y = MY0, k = 0; y < MY1; y += 100, k++) if (k % 2 === 0) { g.fillRect(MX0 - 28, y, -12, Math.min(100, MY1 - y)); g.fillRect(MX1 + 28, y, 12, Math.min(100, MY1 - y)); }
  // grid numbers in the margin
  g.font = NUMFONT.replace('{s}', 30); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = INK;
  for (let x = MX0 + 200, k = 0; x < MX1; x += 400, k++) { const s = String(41 + k); g.fillText(s, x, MY0 - 85); g.fillText(s, x, MY1 + 85); }
  for (let y = MY0 + 200, k = 0; y < MY1; y += 400, k++) { const s = String(78 - k); g.fillText(s, MX0 - 85, y); g.fillText(s, MX1 + 85, y); }
  // scale bar, bottom margin
  const sx = 1700, sy = 2522, seg = 150;
  for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? '#eee3c8' : INK; g.fillRect(sx + k * seg, sy, seg, 14); }
  g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(sx, sy, seg * 4, 14);
  for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? '#eee3c8' : INK; g.fillRect(sx - seg + k * seg / 6, sy, seg / 6, 14); }
  g.strokeRect(sx - seg, sy, seg, 14);
  g.fillStyle = INK; g.font = NUMFONT.replace('{s}', 24);
  for (let k = 0; k <= 4; k++) g.fillText(String(k), sx + k * seg, sy - 18);
  g.fillText('1', sx - seg, sy - 18);
}

// Camera, ground-plane projection, textured 3D quads, the lathe-turned wooden pawn, dice and shadows.
// World: mm, table top z=0, board top z=3, x right, y away from the default camera, z up. Camera never yaws.
const CAM = { x: 0, y: 0, z: 1000, phi: 90 * DEG, f: 2000, roll: 0, sp: 1, cp: 0 };
function setCamera(c) {
  CAM.x = c.x; CAM.y = c.y; CAM.z = c.z; CAM.phi = c.phi * DEG; CAM.f = c.f; CAM.roll = (c.roll || 0) * DEG;
  CAM.sp = Math.sin(CAM.phi); CAM.cp = Math.cos(CAM.phi);
}
// world -> [sx, sy, depth]
function proj(x, y, z) {
  const dx = x - CAM.x, dy = y - CAM.y, dz = z - CAM.z;
  const yc = dy * CAM.sp + dz * CAM.cp, zc = dy * CAM.cp - dz * CAM.sp;
  const zz = Math.max(zc, 1);
  return [W / 2 + CAM.f * dx / zz, H / 2 - CAM.f * yc / zz, zc];
}
const depthOf = (x, y, z) => (y - CAM.y) * CAM.cp - (z - CAM.z) * CAM.sp;

// draw a texture lying on the plane z=zp covering world rect [x0,x1]x[y0,y1] (texture top = y1)
function drawGround(g, img, x0, x1, y0, y1, zp, o = {}) {
  const h = CAM.z - zp; if (h <= 1) return;
  const ppx = img.width / (x1 - x0), ppy = img.height / (y1 - y0);
  const f = CAM.f, sp = CAM.sp, cp = CAM.cp;
  const horizon = cp > 1e-4 ? H / 2 - f * sp / cp : -1e9;
  const step = o.step || 2;
  let r0 = Math.max(0, Math.ceil(horizon + 3));
  const maxT = o.maxT || 1e9;
  for (let r = r0; r < H; r += step) {
    const ya = r - H / 2, yb = ya + step;
    const da = f * sp + ya * cp, db = f * sp + yb * cp; if (da <= 0) continue;
    const ta = h / da, tb = h / db; if (ta > maxT) continue;
    const Ya = CAM.y + ta * (f * cp - ya * sp), Yb = CAM.y + tb * (f * cp - yb * sp);
    const tm = (ta + tb) / 2;
    const Xl = CAM.x - (W / 2) * tm, Xr = CAM.x + (W / 2) * tm;
    // world rows Ya (far) .. Yb (near); clip to texture
    const Yt = Math.min(Ya, y1), Ybt = Math.max(Yb, y0); if (Yt <= Ybt) continue;
    const Xa = Math.max(Xl, x0), Xb = Math.min(Xr, x1); if (Xb <= Xa) continue;
    const sx = (Xa - x0) * ppx, sw = (Xb - Xa) * ppx, sy = (y1 - Yt) * ppy, sh = Math.max(.5, (Yt - Ybt) * ppy);
    const dx0 = (Xa - Xl) / tm, dw = (Xb - Xa) / tm;
    const dy0 = r + (Ya - Yt) / (Ya - Yb) * step, dh = step * (Yt - Ybt) / (Ya - Yb);
    const ov = o.noOverlap ? 0 : .6;
    g.drawImage(img, sx, sy, sw, sh, dx0, dy0, dw + ov, dh + ov);
  }
}

// textured quad through world points: TL, TR, BL are the texture's top-left, top-right, bottom-left corners
// Textured quad through world points: TL, TR, BL are the texture's top-left, top-right, bottom-left corners.
// Seamless: the quad is cut into a grid sized from its projected size and perspective (finer when close and steep),
// each cell into two triangles, and every triangle gets the exact affine map of its own three projected corners,
// so neighbouring triangles agree along shared edges. Each is clipped to itself grown by ~0.7 px (no hairline gaps).
// Nearly affine quads (small depth range) are drawn in one exact piece.
function drawQuad(g, img, TL, TR, BL, n = 6, m = 6, sub) {
  const sx0 = sub ? sub[0] : 0, sy0 = sub ? sub[1] : 0, sw = sub ? sub[2] : img.width, sh = sub ? sub[3] : img.height;
  const BR = [TR[0] + BL[0] - TL[0], TR[1] + BL[1] - TL[1], TR[2] + BL[2] - TL[2]];
  const c4 = [TL, TR, BL, BR].map((w) => proj(w[0], w[1], w[2]));
  const dmin = Math.min(...c4.map((p) => p[2])), dmax = Math.max(...c4.map((p) => p[2]));
  if (dmax < 15) return;
  const L = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  if (dmin >= 15 && dmax / dmin < 1.012) {
    const [p00, p10, p01] = c4;
    g.setTransform((p10[0] - p00[0]) / sw, (p10[1] - p00[1]) / sw, (p01[0] - p00[0]) / sh, (p01[1] - p00[1]) / sh, p00[0], p00[1]);
    g.drawImage(img, sx0, sy0, sw, sh, 0, 0, sw, sh); g.setTransform(1, 0, 0, 1, 0, 0); return;
  }
  const persp = clamp((dmax / Math.max(dmin, 15) - 1) * 6, .25, 1);
  const su = Math.max(L(c4[0], c4[1]), L(c4[2], c4[3])), sv = Math.max(L(c4[0], c4[2]), L(c4[1], c4[3]));
  n = Math.max(2, Math.min(32, Math.ceil(su / 28 * persp))); m = Math.max(2, Math.min(32, Math.ceil(sv / 28 * persp)));
  const P = (u, v) => [TL[0] + (TR[0] - TL[0]) * u + (BL[0] - TL[0]) * v, TL[1] + (TR[1] - TL[1]) * u + (BL[1] - TL[1]) * v, TL[2] + (TR[2] - TL[2]) * u + (BL[2] - TL[2]) * v];
  const pts = [];
  for (let j = 0; j <= m; j++) { const row = []; for (let i = 0; i <= n; i++) { const w = P(i / n, j / m); row.push(proj(w[0], w[1], w[2])); } pts.push(row); }
  const cw = sw / n, ch = sh / m;
  const tri = (d0, d1, d2, s0, s1, s2, bx, by, bw, bh) => {
    // affine taking source (texture px) to screen
    const ux = s1[0] - s0[0], uy = s1[1] - s0[1], vx = s2[0] - s0[0], vy = s2[1] - s0[1], det = ux * vy - vx * uy; if (Math.abs(det) < 1e-9) return;
    const ax = d1[0] - d0[0], ay = d1[1] - d0[1], bx2 = d2[0] - d0[0], by2 = d2[1] - d0[1];
    const a = (ax * vy - bx2 * uy) / det, b = (ay * vy - by2 * uy) / det, c = (bx2 * ux - ax * vx) / det, d = (by2 * ux - ay * vx) / det;
    const e = d0[0] - a * s0[0] - c * s0[1], f = d0[1] - b * s0[0] - d * s0[1];
    const cx = (d0[0] + d1[0] + d2[0]) / 3, cy = (d0[1] + d1[1] + d2[1]) / 3;
    const grow = (p) => { const dx = p[0] - cx, dy = p[1] - cy, l = Math.hypot(dx, dy) || 1; return [p[0] + dx / l * .75, p[1] + dy / l * .75]; };
    const q0 = grow(d0), q1 = grow(d1), q2 = grow(d2);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.beginPath(); g.moveTo(q0[0], q0[1]); g.lineTo(q1[0], q1[1]); g.lineTo(q2[0], q2[1]); g.closePath(); g.clip();
    g.setTransform(a, b, c, d, e, f);
    const x0 = Math.max(0, bx - 2), y0 = Math.max(0, by - 2), x1 = Math.min(img.width, bx + bw + 2), y1 = Math.min(img.height, by + bh + 2);
    g.drawImage(img, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0);
    g.restore();
  };
  for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) {
    const p00 = pts[j][i], p10 = pts[j][i + 1], p01 = pts[j + 1][i], p11 = pts[j + 1][i + 1];
    if (p00[2] < 15 || p10[2] < 15 || p01[2] < 15 || p11[2] < 15) continue;
    const s00 = [sx0 + i * cw, sy0 + j * ch], s10 = [s00[0] + cw, s00[1]], s01 = [s00[0], s00[1] + ch], s11 = [s00[0] + cw, s00[1] + ch];
    tri(p00, p10, p01, s00, s10, s01, s00[0], s00[1], cw, ch);
    tri(p10, p11, p01, s10, s11, s01, s00[0], s00[1], cw, ch);
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
}
// is the quad's textured side facing the camera? (normal = (TR-TL) x (BL-TL) pointing toward viewer means back side...)
function quadFacing(TL, TR, BL) {
  const a = proj(...TL), b = proj(...TR), c = proj(...BL);
  return ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) > 0;
}
function fillQuad(g, pts, style) {
  g.beginPath(); for (const p of pts) { const q = proj(...p); g.lineTo(q[0], q[1]); } g.closePath(); g.fillStyle = style; g.fill();
}
// soft shadow blob on the plane z
function shadowBlob(g, x, y, z, rx, ry, a, ang = 0) {
  const c = proj(x, y, z), ex = proj(x + rx * Math.cos(ang), y + rx * Math.sin(ang), z), ey = proj(x - ry * Math.sin(ang), y + ry * Math.cos(ang), z);
  if (c[2] < 2) return;
  g.save(); g.setTransform(ex[0] - c[0], ex[1] - c[1], ey[0] - c[0], ey[1] - c[1], c[0], c[1]);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1); gr.addColorStop(0, `rgba(30,18,8,${a})`); gr.addColorStop(.55, `rgba(30,18,8,${a * .6})`); gr.addColorStop(1, 'rgba(30,18,8,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, TAU); g.fill(); g.restore();
}
function glowBlob(g, x, y, z, rx, ry, col, a) {
  const c = proj(x, y, z), ex = proj(x + rx, y, z), ey = proj(x, y + ry, z);
  if (c[2] < 2) return;
  g.save(); g.globalCompositeOperation = 'screen'; g.setTransform(ex[0] - c[0], ex[1] - c[1], ey[0] - c[0], ey[1] - c[1], c[0], c[1]);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(.6, `rgba(${col},${a * .55})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, TAU); g.fill(); g.restore();
}

// ---------- the pawn: a turned, painted wooden piece, drawn as stacked projected discs ----------
const PAWN_H = 33;
function pawnR(h) {
  if (h < .8) return 10.2 + h * 1;
  if (h < 3) return 11;
  if (h < 4.2) return lerp(11, 8.8, (h - 3) / 1.2);
  if (h < 17) { const u = (h - 4.2) / 12.8; return lerp(8.8, 4.3, u) - Math.sin(u * Math.PI) * .7; }
  if (h < 18) return lerp(4.3, 7.2, (h - 17));
  if (h < 19.4) return 7.2;
  if (h < 20.4) return lerp(7.2, 3.6, h - 19.4);
  const hc = 26.6, R = 6.4; const d = h - hc; const s = R * R - d * d;
  return Math.max(h < hc ? 3.6 : 0, s > 0 ? Math.sqrt(s) : 0);
}
const PAWN_SL = (() => { const a = []; for (let h = 0; h <= PAWN_H; h += .45) a.push(h); a.push(PAWN_H - .05); return a; })();
let PAWN_GRAD = {}, PAWN_STOPS = {};
const PSTOP = [[0, .85], [.18, 1.25], [.3, 1.12], [.62, .82], [.92, .5], [1, .58]];
function pawnStops(col, l) {
  const key = col.join(',') + '|' + l; if (PAWN_STOPS[key]) return PAWN_STOPS[key];
  const k = .45 + l * .07;
  return (PAWN_STOPS[key] = PSTOP.map(([o, m]) => [o, `rgb(${Math.round(clamp(col[0] * k * m, 0, 255))},${Math.round(clamp(col[1] * k * m, 0, 255))},${Math.round(clamp(col[2] * k * m, 0, 255))})`]));
}
function pawnGradients(g, col) {
  const key = col.join(',');
  if (PAWN_GRAD[key]) return PAWN_GRAD[key];
  const out = [];
  for (let l = 0; l < 12; l++) { const gr = g.createLinearGradient(-1, -.3, 1, .3); for (const [o, c] of pawnStops(col, l)) gr.addColorStop(o, c); out.push(gr); }
  if (Object.keys(PAWN_GRAD).length > 40) PAWN_GRAD = {};
  return (PAWN_GRAD[key] = out);
}
// pose: {x,y,z, ax:[x,y,z] unit axis}
function drawPawn(g, pose, col = [178, 42, 34]) {
  col = col.map((v) => Math.round(v));
  const ax = pose.ax || [0, 0, 1];
  const vx = CAM.x - pose.x, vy = CAM.y - pose.y, vz = CAM.z - pose.z;
  let ux = ax[1] * vz - ax[2] * vy, uy = ax[2] * vx - ax[0] * vz, uz = ax[0] * vy - ax[1] * vx; let ul = Math.hypot(ux, uy, uz);
  if (ul < 1e-6) { ux = 1; uy = 0; uz = 0; ul = 1; }
  ux /= ul; uy /= ul; uz /= ul;
  const wx = ax[1] * uz - ax[2] * uy, wy = ax[2] * ux - ax[0] * uz, wz = ax[0] * uy - ax[1] * ux;
  const c0 = proj(pose.x, pose.y, pose.z), cu = proj(pose.x + ux * 10, pose.y + uy * 10, pose.z + uz * 10);
  const flip = cu[0] < c0[0] ? -1 : 1;
  const camAx = (vx * ax[0] + vy * ax[1] + vz * ax[2]);
  const grads = pawnGradients(g, col);
  // project every slice once
  const S = PAWN_SL.map((h, i) => {
    const r = pawnR(h);
    const cx = pose.x + ax[0] * h, cy = pose.y + ax[1] * h, cz = pose.z + ax[2] * h;
    const c = proj(cx, cy, cz);
    const pu = proj(cx + ux * r * flip, cy + uy * r * flip, cz + uz * r * flip), pw = proj(cx + wx * r, cy + wy * r, cz + wz * r);
    const dr = pawnR(h + .3) - pawnR(h - .3); const up = clamp(-dr / .6 * .5 + .5);
    const lvl = Math.round(clamp(4 + up * 7 - (h < 3 ? 1 : 0), 0, 11));
    return { h, r, c, pu, pw, lvl, i, L: [2 * c[0] - pu[0], 2 * c[1] - pu[1]], R: [pu[0], pu[1]] };
  });
  const order = S.slice().sort((a, b) => Math.abs(b.h - camAx) - Math.abs(a.h - camAx));
  for (const sl of order) {
    if (sl.c[2] < 3) continue;
    // side band toward the neighbour that is nearer the camera along the axis (fills the gaps when seen edge-on)
    const nb = S[sl.i + (sl.h < camAx ? 1 : -1)];
    if (nb && nb.c[2] >= 3 && (sl.r > .05 || nb.r > .05)) {
      const gr = g.createLinearGradient(sl.L[0], sl.L[1], sl.R[0], sl.R[1]);
      for (const [o, c] of pawnStops(col, Math.min(sl.lvl, nb.lvl))) gr.addColorStop(o, c);
      g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = gr; g.beginPath();
      g.moveTo(sl.L[0], sl.L[1]); g.lineTo(sl.R[0], sl.R[1]); g.lineTo(nb.R[0], nb.R[1]); g.lineTo(nb.L[0], nb.L[1]); g.closePath(); g.fill();
    }
    if (sl.r <= .05) continue;
    g.setTransform(sl.pu[0] - sl.c[0], sl.pu[1] - sl.c[1], sl.pw[0] - sl.c[0], sl.pw[1] - sl.c[1], sl.c[0], sl.c[1]);
    g.fillStyle = grads[sl.lvl]; g.beginPath(); g.arc(0, 0, 1, 0, TAU); g.fill();
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  // turned-wood rings showing faintly through the paint, on the camera-facing half of the body
  const sgn = (wx * vx + wy * vy + wz * vz) > 0 ? 1 : -1;
  g.lineCap = 'round';
  for (const sl of S) {
    if (sl.c[2] < 3 || sl.r < 2 || rnd(sl.i, 71) > .45) continue;
    const sc = CAM.f / sl.c[2]; const lw = .22 * sc; if (lw < .35) continue;
    g.setTransform(sl.pu[0] - sl.c[0], sl.pu[1] - sl.c[1], sl.pw[0] - sl.c[0], sl.pw[1] - sl.c[1], sl.c[0], sl.c[1]);
    g.beginPath(); const a0 = sgn > 0 ? .25 : Math.PI + .25, a1 = a0 + Math.PI - .5; g.arc(0, 0, 1, a0, a1);
    g.setTransform(1, 0, 0, 1, 0, 0); g.lineWidth = lw; g.strokeStyle = `rgba(70,14,8,${.1 + rnd(sl.i, 72) * .12})`; g.stroke();
  }
  // a few paint chips showing raw wood, fixed on the piece (seen only when they face the camera)
  let rx = 1 - ax[0] * ax[0], ry = -ax[0] * ax[1], rz = -ax[0] * ax[2]; let rl = Math.hypot(rx, ry, rz);
  if (rl < .2) { rx = -ax[1] * ax[0]; ry = 1 - ax[1] * ax[1]; rz = -ax[1] * ax[2]; rl = Math.hypot(rx, ry, rz); }
  rx /= rl; ry /= rl; rz /= rl;
  const qx = ax[1] * rz - ax[2] * ry, qy = ax[2] * rx - ax[0] * rz, qz = ax[0] * ry - ax[1] * rx;
  const spn = pose.spin || 0;
  for (const [h, ph0, cr] of [[1.7, 3.6, 1.5], [2.4, 5.2, 1.0], [11, 3.9, 1.1], [26.6, 4.4, 1.3], [18.7, 3.2, .9], [30, 2.6, .8]]) {
    const ph = ph0 + spn, r = pawnR(h), dx = Math.cos(ph) * rx + Math.sin(ph) * qx, dy = Math.cos(ph) * ry + Math.sin(ph) * qy, dz = Math.cos(ph) * rz + Math.sin(ph) * qz;
    const px = pose.x + ax[0] * h + dx * r, py = pose.y + ax[1] * h + dy * r, pz = pose.z + ax[2] * h + dz * r;
    const ex = CAM.x - px, ey = CAM.y - py, ez = CAM.z - pz, el = Math.hypot(ex, ey, ez); const face = (dx * ex + dy * ey + dz * ez) / el;
    if (face < .15) continue;
    const c = proj(px, py, pz); if (c[2] < 3) continue; const sc = CAM.f / c[2];
    const tq = proj(px + ax[0], py + ax[1], pz + ax[2]); let ang = Math.atan2(tq[1] - c[1], tq[0] - c[0]);
    g.save(); g.translate(c[0], c[1]); g.rotate(ang);
    g.fillStyle = `rgba(206,168,120,${.85 * Math.min(1, face * 1.6)})`; g.beginPath();
    for (let k = 0; k < 9; k++) { const a = k / 9 * TAU, rr2 = cr * sc * (.7 + .5 * rnd(h, k)); g.lineTo(Math.cos(a) * rr2 * .8, Math.sin(a) * rr2 * Math.max(.3, face)); }
    g.closePath(); g.fill(); g.strokeStyle = 'rgba(90,30,15,.35)'; g.lineWidth = Math.max(.5, .15 * sc); g.stroke(); g.restore();
  }
  const hh = 28.6, hx = pose.x + ax[0] * hh, hy = pose.y + ax[1] * hh, hz = pose.z + ax[2] * hh;
  const hp = proj(hx - ux * 2.6 * flip + wx * 1.2, hy - uy * 2.6 * flip + wy * 1.2, hz - uz * 2.6 * flip + wz * 1.2), sc = CAM.f / Math.max(hp[2], 3);
  if (hp[2] > 3) {
    const gr = g.createRadialGradient(hp[0], hp[1], 0, hp[0], hp[1], 2.4 * sc);
    gr.addColorStop(0, 'rgba(255,240,225,.5)'); gr.addColorStop(1, 'rgba(255,240,225,0)'); g.fillStyle = gr; g.beginPath(); g.arc(hp[0], hp[1], 2.4 * sc, 0, TAU); g.fill();
  }
}
function pawnShadow(g, pose, a = .5) {
  const ax = pose.ax || [0, 0, 1]; const lift = Math.max(0, pose.z - pose.floor);
  const k = clamp(1 - lift / 120);
  const cx = pose.x + ax[0] * 14 + 7, cy = pose.y + ax[1] * 14 + 9;
  shadowBlob(g, pose.x + 2 + lift * .3, pose.y + 3 + lift * .45, pose.floor, 13 + lift * .15, 12 + lift * .15, .55 * a * k);
  shadowBlob(g, cx + lift * .3, cy + lift * .45, pose.floor, 15 + Math.abs(ax[0]) * 8, 20, .28 * a * k, Math.atan2(9, 7));
}

// cube (die): centre, size, yaw (rad), faces map
function drawDie(g, cx, cy, cz, s, yaw, top = 5, front = 3, side = 1) {
  const h = s / 2, c = Math.cos(yaw), sn = Math.sin(yaw);
  const P = (x, y, z) => [cx + x * c - y * sn, cy + x * sn + y * c, cz + z];
  const faces = [
    { n: [0, 0, 1], q: [P(-h, h, h), P(h, h, h), P(-h, -h, h)], f: top, l: 1 },
    { n: [-sn, -c, 0], q: [P(-h, -h, h), P(h, -h, h), P(-h, -h, -h)], f: front, l: .78 },
    { n: [c, sn, 0], q: [P(h, -h, h), P(h, h, h), P(h, -h, -h)], f: side, l: .6 },
    { n: [-c, -sn, 0], q: [P(-h, h, h), P(-h, -h, h), P(-h, h, -h)], f: 7 - side, l: .9 },
  ];
  for (const fc of faces) {
    const mid = [(fc.q[1][0] + fc.q[2][0]) / 2, (fc.q[1][1] + fc.q[2][1]) / 2, (fc.q[1][2] + fc.q[2][2]) / 2];
    const dot = (CAM.x - mid[0]) * fc.n[0] + (CAM.y - mid[1]) * fc.n[1] + (CAM.z - mid[2]) * fc.n[2];
    if (dot <= 0) continue;
    drawQuad(g, TEX.die[fc.f - 1], fc.q[0], fc.q[1], fc.q[2], 2, 2);
    if (fc.l < 1) { g.globalAlpha = 1 - fc.l; fillQuad(g, [fc.q[0], fc.q[1], [fc.q[1][0] + fc.q[2][0] - fc.q[0][0], fc.q[1][1] + fc.q[2][1] - fc.q[0][1], fc.q[1][2] + fc.q[2][2] - fc.q[0][2]], fc.q[2]], '#1a120a'); g.globalAlpha = 1; }
  }
}

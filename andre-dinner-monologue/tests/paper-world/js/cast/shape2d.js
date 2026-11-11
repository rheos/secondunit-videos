// 2D outline tools for the paper cast. No three.js here: everything is arrays of [x, y].
// Outlines are closed (the last point joins the first) and are plain data, so the film's rig can use them.

export const DEG = Math.PI / 180;

// ---------- colour ----------
export function hexToRgb(h) {
  if (typeof h === "number") return [(h >> 16) & 255, (h >> 8) & 255, h & 255];
  const s = h.replace("#", "");
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}
export function mixHex(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
// the cut edge of a paper card: the face colour pulled toward the white core
export const coreOf = (colour, amount = 0.7) => mixHex(colour, "#fbf6ea", amount);

// ---------- points ----------
export const rot = ([x, y], a) => { const c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; };
export function xf(pts, { rot: a = 0, tx = 0, ty = 0, sx = 1, sy = 1 } = {}) {
  const c = Math.cos(a), s = Math.sin(a);
  return pts.map(([x, y]) => { x *= sx; y *= sy; return [x * c - y * s + tx, x * s + y * c + ty]; });
}
export function area(pts) { let a = 0; for (let i = 0, n = pts.length; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; }
export function bbox(pts, pad = 0) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return [x0 - pad, y0 - pad, x1 + pad, y1 + pad]; }
export function pip(pts, x, y) { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const a = pts[i], b = pts[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
export const ccw = (pts) => (area(pts) < 0 ? pts.slice().reverse() : pts);

// A polygon with a radius on each corner: [[x, y, r], ...]. r = 0 keeps the corner crisp.
// Each rounded corner is a quadratic curve that leaves the two edges at the tangent points.
export function fillet(poly, steps = 7) {
  const n = poly.length, out = [];
  for (let i = 0; i < n; i++) {
    const A = poly[(i + n - 1) % n], B = poly[i], C = poly[(i + 1) % n], r = B[2] || 0;
    if (!r) { out.push([B[0], B[1]]); continue; }
    const ax = A[0] - B[0], ay = A[1] - B[1], cx = C[0] - B[0], cy = C[1] - B[1];
    const la = Math.hypot(ax, ay), lc = Math.hypot(cx, cy);
    const cosT = Math.max(-1, Math.min(1, (ax * cx + ay * cy) / (la * lc))), half = Math.acos(cosT) / 2;
    let t = r / Math.max(Math.tan(half), 1e-4);
    t = Math.min(t, la * 0.5, lc * 0.5);
    const p0 = [B[0] + ax / la * t, B[1] + ay / la * t], p2 = [B[0] + cx / lc * t, B[1] + cy / lc * t];
    for (let k = 0; k <= steps; k++) { const u = k / steps, v = 1 - u; out.push([v * v * p0[0] + 2 * u * v * B[0] + u * u * p2[0], v * v * p0[1] + 2 * u * v * B[1] + u * u * p2[1]]); }
  }
  return out;
}

// centripetal-ish Catmull-Rom through points (open or closed), n samples a span
export function spline(pts, closed = false, n = 8) {
  const N = pts.length, out = [], get = (i) => closed ? pts[(i + N) % N] : pts[Math.max(0, Math.min(N - 1, i))];
  const spans = closed ? N : N - 1;
  for (let i = 0; i < spans; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)));
    }
  }
  if (!closed) out.push(pts[N - 1].slice(0, 2));
  return out;
}

// a stroke with a width profile along a centre line: returns a closed outline (for creases, wings, veins)
export function stroke(centre, widthAt) {
  const L = [], R = [], n = centre.length;
  for (let i = 0; i < n; i++) {
    const a = centre[Math.max(0, i - 1)], b = centre[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const w = widthAt(i / (n - 1)) / 2;
    L.push([centre[i][0] - dy * w, centre[i][1] + dx * w]); R.push([centre[i][0] + dy * w, centre[i][1] - dx * w]);
  }
  return L.concat(R.reverse());
}

// Ramer-Douglas-Peucker on a closed loop
export function simplify(pts, tol) {
  if (pts.length < 8) return pts;
  // split at the two farthest-apart points so the loop is handled as two open runs
  let far = 0, fd = -1; for (let i = 1; i < pts.length; i++) { const d = (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2; if (d > fd) { fd = d; far = i; } }
  const rdp = (run) => {
    const keep = new Uint8Array(run.length); keep[0] = keep[run.length - 1] = 1; const stack = [[0, run.length - 1]];
    while (stack.length) {
      const [a, b] = stack.pop(); let md = 0, mi = -1; const ax = run[a][0], ay = run[a][1], bx = run[b][0] - ax, by = run[b][1] - ay, l = Math.hypot(bx, by) || 1e-9;
      for (let i = a + 1; i < b; i++) { const d = Math.abs((run[i][0] - ax) * by - (run[i][1] - ay) * bx) / l; if (d > md) { md = d; mi = i; } }
      if (md > tol) { keep[mi] = 1; stack.push([a, mi], [mi, b]); }
    }
    return run.filter((_, i) => keep[i]);
  };
  const r1 = rdp(pts.slice(0, far + 1)), r2 = rdp(pts.slice(far).concat([pts[0]]));
  return r1.slice(0, -1).concat(r2.slice(0, -1));
}

// ---------- signed distance fields (negative inside) ----------
export const smin = (a, b, k) => { if (k <= 0) return Math.min(a, b); const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
export const sdCircle = (px, py, cx, cy, r) => Math.hypot(px - cx, py - cy) - r;
// a capsule from a (radius ra) to b (radius rb): the finger segment
export function sdCapsule(px, py, ax, ay, bx, by, ra, rb) {
  const dx = bx - ax, dy = by - ay, h = Math.hypot(dx, dy) || 1e-9, ux = dx / h, uy = dy / h;
  const qy = (px - ax) * ux + (py - ay) * uy, qx = Math.abs((px - ax) * -uy + (py - ay) * ux);
  const b = (ra - rb) / h, a = Math.sqrt(Math.max(1 - b * b, 0)), k = qx * -b + qy * a;
  if (k < 0) return Math.hypot(qx, qy) - ra;
  if (k > a * h) return Math.hypot(qx, qy - h) - rb;
  return qx * a + qy * b - ra;
}
export function sdPolygon(px, py, v) {
  let d = (px - v[0][0]) ** 2 + (py - v[0][1]) ** 2, s = 1;
  for (let i = 0, j = v.length - 1; i < v.length; j = i++) {
    const ex = v[j][0] - v[i][0], ey = v[j][1] - v[i][1], wx = px - v[i][0], wy = py - v[i][1];
    const t = Math.max(0, Math.min(1, (wx * ex + wy * ey) / (ex * ex + ey * ey))), bx = wx - ex * t, by = wy - ey * t;
    d = Math.min(d, bx * bx + by * by);
    const c1 = py >= v[i][1], c2 = py < v[j][1], c3 = ex * wy > ey * wx;
    if ((c1 && c2 && c3) || (!c1 && !c2 && !c3)) s = -s;
  }
  return s * Math.sqrt(d);
}
// signed distance to the half-plane beyond point o along direction d (negative where (p - o) . d > 0)
export const sdHalf = (px, py, ox, oy, dx, dy) => -((px - ox) * dx + (py - oy) * dy);

// Marching squares: the zero contour(s) of f over a box, as closed loops, biggest first.
export function contour(f, [x0, y0, x1, y1], cell) {
  const nx = Math.ceil((x1 - x0) / cell), ny = Math.ceil((y1 - y0) / cell), W = nx + 1;
  const v = new Float32Array(W * (ny + 1));
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) v[j * W + i] = f(x0 + i * cell, y0 + j * cell);
  // an edge id: horizontal edge (i,j)-(i+1,j) = 2*(j*W+i), vertical edge (i,j)-(i,j+1) = 2*(j*W+i)+1
  const pt = new Map(), link = new Map();
  const edgePt = (id) => {
    if (pt.has(id)) return; const k = id >> 1, i = k % W, j = (k / W) | 0, a = v[k], b = id & 1 ? v[k + W] : v[k + 1], t = a / (a - b);
    pt.set(id, id & 1 ? [x0 + i * cell, y0 + (j + t) * cell] : [x0 + (i + t) * cell, y0 + j * cell]);
  };
  const add = (e1, e2) => { edgePt(e1); edgePt(e2); (link.get(e1) || link.set(e1, []).get(e1)).push(e2); (link.get(e2) || link.set(e2, []).get(e2)).push(e1); };
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const k = j * W + i, a = v[k] < 0, b = v[k + 1] < 0, c = v[k + W + 1] < 0, d = v[k + W] < 0;
    const code = (a ? 1 : 0) | (b ? 2 : 0) | (c ? 4 : 0) | (d ? 8 : 0); if (code === 0 || code === 15) continue;
    const B = 2 * k, R = 2 * (k + 1) + 1, T = 2 * (k + W), L = 2 * k + 1;
    switch (code) {
      case 1: case 14: add(L, B); break; case 2: case 13: add(B, R); break; case 3: case 12: add(L, R); break;
      case 4: case 11: add(R, T); break; case 6: case 9: add(B, T); break; case 7: case 8: add(L, T); break;
      case 5: add(L, T); add(B, R); break; case 10: add(L, B); add(R, T); break;
    }
  }
  const seen = new Set(), loops = [];
  for (const start of link.keys()) {
    if (seen.has(start)) continue; const loop = []; let cur = start, prev = -1;
    while (cur !== undefined && !seen.has(cur)) { seen.add(cur); loop.push(pt.get(cur)); const nb = link.get(cur); const nxt = nb[0] !== prev ? nb[0] : nb[1]; prev = cur; cur = nxt; }
    if (loop.length > 3) loops.push(loop);
  }
  return loops.sort((p, q) => Math.abs(area(q)) - Math.abs(area(p)));
}
// the outer outline of an SDF shape, simplified, counter-clockwise
export function outlineOf(f, box, cell = 0.008, tol = cell * 0.18) { const l = contour(f, box, cell); return l.length ? ccw(simplify(l[0], tol)) : []; }
// every loop (outer shapes and holes), simplified
export function loopsOf(f, box, cell = 0.008, tol = cell * 0.18) { return contour(f, box, cell).map((l) => simplify(l, tol)); }

// ASCII print of filled outlines at a pixel size, for the read test (two characters a pixel)
export function ascii(shapes, pxPerUnit, pad = 2) {
  let b = [1e9, 1e9, -1e9, -1e9]; for (const s of shapes) { const q = bbox(s); b = [Math.min(b[0], q[0]), Math.min(b[1], q[1]), Math.max(b[2], q[2]), Math.max(b[3], q[3])]; }
  const w = Math.ceil((b[2] - b[0]) * pxPerUnit) + pad * 2, h = Math.ceil((b[3] - b[1]) * pxPerUnit) + pad * 2, rows = [];
  for (let j = 0; j < h; j++) { let r = ""; for (let i = 0; i < w; i++) { const x = b[0] + (i - pad + 0.5) / pxPerUnit, y = b[3] - (j - pad + 0.5) / pxPerUnit; r += shapes.some((s) => pip(s, x, y)) ? "##" : " ."; } rows.push(r); }
  return rows.join("\n");
}

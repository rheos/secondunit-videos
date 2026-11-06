// The living loop, the manifested shapes: small faceted solids the figures call up with their hands and release.
// Drawn each frame as clay polyhedra: vertices rotated in 3D, back faces culled, faces painted far to near, each
// face's tone from how it turns to the key light, with a lit cut along its edges. A glow wraps a shape while it is
// being made and fades once it is let go.

import { mix, shade, rgba } from '../vendor/paper-fox/core/color.js';
import { glow } from '../vendor/paper-fox/core/piece.js';
import { PAL } from './kit.js';

const P = PAL;
const L3 = (() => { const v = [-0.46, -0.79, 0.4], n = Math.hypot(...v); return v.map((x) => x / n); })();
const phi = (1 + Math.sqrt(5)) / 2;

const norm = (v) => { const n = Math.hypot(...v); return v.map((x) => x / n); };
const SOLIDS = {
  tetra: { v: [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]], f: [[0, 1, 2], [0, 3, 1], [0, 2, 3], [1, 3, 2]] },
  octa: { v: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], f: [[0, 2, 4], [2, 1, 4], [1, 3, 4], [3, 0, 4], [2, 0, 5], [1, 2, 5], [3, 1, 5], [0, 3, 5]] },
  cube: { v: [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]], f: [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 4, 7, 3]] },
  ico: {
    v: [[-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0], [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi], [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]],
    f: [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]],
  },
};
// the dodecahedron, built the way the novadiem.com hero builds it (public/polyhedra-toy.js): as the icosahedron's
// dual. Its 20 corners are the centres of the icosahedron's 20 faces, and each of its 12 faces is the five of those
// centres round one icosahedron corner, put in order round it. (Until draft 44 it took the five nearest corners from
// a separately written vertex list in a different orientation, which gave 42 edges, faces that were not flat and
// long diagonals through the inside: Robin, "the dodecahedron is screwed up".)
{
  const IV = SOLIDS.ico.v.map(norm), IF = SOLIDS.ico.f;
  const V = IF.map((f) => norm([0, 1, 2].map((k) => (IV[f[0]][k] + IV[f[1]][k] + IV[f[2]][k]) / 3)));
  const f = IV.map((n, i) => {
    const round = IF.map((F, fi) => (F.includes(i) ? fi : -1)).filter((fi) => fi >= 0);
    const ref = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    const u = norm([n[1] * ref[2] - n[2] * ref[1], n[2] * ref[0] - n[0] * ref[2], n[0] * ref[1] - n[1] * ref[0]]), w = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];
    const at = (j) => Math.atan2(V[j][0] * w[0] + V[j][1] * w[1] + V[j][2] * w[2], V[j][0] * u[0] + V[j][1] * u[1] + V[j][2] * u[2]);
    return round.sort((a, b) => at(a) - at(b));
  });
  SOLIDS.dodeca = { v: V, f };
}
// two interlocked tetrahedra
SOLIDS.star = { v: [...SOLIDS.tetra.v, ...SOLIDS.tetra.v.map(([x, y, z]) => [-x, -y, -z])], f: [...SOLIDS.tetra.f, ...SOLIDS.tetra.f.map((f) => f.map((i) => i + 4))] };
for (const S of Object.values(SOLIDS)) S.v = S.v.map(norm);

function rot([x, y, z], a, b, c) {
  let t;
  t = y * Math.cos(a) - z * Math.sin(a); z = y * Math.sin(a) + z * Math.cos(a); y = t;
  t = x * Math.cos(b) + z * Math.sin(b); z = -x * Math.sin(b) + z * Math.cos(b); x = t;
  t = x * Math.cos(c) - y * Math.sin(c); y = x * Math.sin(c) + y * Math.cos(c); x = t;
  return [x, y, z];
}

// The visible faces of a solid turned by ang, far to near: { V (rotated unit vertices), faces: [{ f, n, z, lit }] }
export function solidFaces(kind, ang) {
  const S = SOLIDS[kind], V = S.v.map((v) => rot(v, ang[0], ang[1], ang[2]));
  const faces = S.f.map((f) => {
    const a = V[f[0]], b = V[f[1]], c = V[f[2]];
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    let n = norm([u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]);
    // every solid is centred on the origin: an outward normal points the same way as the face's centre
    const m = [0, 1, 2].map((d) => f.reduce((s, i) => s + V[i][d], 0) / f.length);
    if (n[0] * m[0] + n[1] * m[1] + n[2] * m[2] < 0) n = n.map((x) => -x);
    return { f, n, z: m[2], lit: n[0] * L3[0] + n[1] * L3[1] + n[2] * L3[2] };
  }).filter((F) => F.n[2] > 0).sort((p, q) => p.z - q.z);
  return { V, faces };
}

// A solid's visible edges (those of the faces turned toward the viewer) seen from angle ang, flattened to unit
// screen coordinates and ordered round the centre so a hand can trace them in a sweep: [[x0, y0], [x1, y1]] each.
export function solidEdges(kind, ang) {
  const { V, faces } = solidFaces(kind, ang), seen = new Set(), out = [];
  for (const { f } of faces) for (let i = 0; i < f.length; i++) {
    const a = f[i], b = f[(i + 1) % f.length], key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ e: [[V[a][0], V[a][1]], [V[b][0], V[b][1]]], z: (V[a][2] + V[b][2]) / 2, ang: Math.atan2((V[a][1] + V[b][1]) / 2, (V[a][0] + V[b][0]) / 2) });
  }
  return out.sort((p, q) => p.ang - q.ang).map((o) => o.e);
}

// Draw one solid. kind: tetra | octa | cube | ico | star | ring. r: radius in px. ang: [a, b, c] rotation.
// glowK 0..1: how much making-light wraps it. alpha: overall fade.
export function drawSolid(ctx, kind, x, y, r, ang, color, { glowK = 0, alpha = 1, glowColor = '#fff1c8' } = {}) {
  if (alpha <= 0.01 || r < 0.5) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (glowK > 0) glow(ctx, x, y, r * 3.2, glowColor, 0.55 * glowK);
  // a soft shadow below, as if cast on the air's haze
  ctx.fillStyle = 'rgba(70,40,50,0.12)'; ctx.beginPath(); ctx.ellipse(x + r * 0.35, y + r * 1.5, r * 0.9, r * 0.25, 0, 0, Math.PI * 2); ctx.fill();
  if (kind === 'ring') {
    // a torus seen at an angle: two ellipses of clay with a lit inner edge
    const tilt = Math.abs(Math.cos(ang[0])) * 0.85 + 0.15;
    ctx.lineCap = 'round';
    for (const [w, c] of [[r * 0.46, shade(color, -0.22)], [r * 0.36, color], [r * 0.14, mix(color, '#fffaf0', 0.55)]]) {
      ctx.strokeStyle = c; ctx.lineWidth = w;
      ctx.beginPath(); ctx.ellipse(x - (c === color ? 0 : 0), y - (w < r * 0.2 ? r * 0.06 : 0), r, r * tilt, ang[2], 0, Math.PI * 2); ctx.stroke();
    }
  } else {
    const { V, faces } = solidFaces(kind, ang);
    for (const F of faces) {
      const lit = F.n[0] * L3[0] + F.n[1] * L3[1] + F.n[2] * L3[2];
      const tone = lit > 0 ? mix(color, '#fffaf0', lit * 0.55) : shade(color, lit * 0.45);
      ctx.beginPath();
      F.f.forEach((i, k) => { const px = x + V[i][0] * r, py = y + V[i][1] * r; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
      ctx.closePath();
      ctx.fillStyle = tone; ctx.fill();
      ctx.strokeStyle = rgba(mix(tone, '#fffaf0', 0.5), 0.7); ctx.lineWidth = Math.max(0.8, r * 0.05); ctx.lineJoin = 'round'; ctx.stroke();
    }
  }
  ctx.restore();
}

export const SHAPE_COLORS = [P.mint, P.pink, P.butter, P.lilac, P.aqua];

// A tesseract (the 4D cube): its sixteen corners turned in two 4D planes at once, seen in perspective from the
// fourth dimension (the inner cube is the far side in w), then drawn as rolled clay rods and balls, far to near.
// a, b: rotation angles in the XW and YZ planes. inner and outer colours split the edges by their depth in w.
const T4 = [];
for (let i = 0; i < 16; i++) T4.push([i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1, i & 8 ? 1 : -1]);
const T4E = [];
for (let i = 0; i < 16; i++) for (let k = 0; k < 4; k++) { const j = i ^ (1 << k); if (j > i) T4E.push([i, j]); }
// its 24 square faces: for each pair of axes, the four squares spanned by them (the other two coordinates fixed)
const T4F = [];
for (let k1 = 0; k1 < 4; k1++) for (let k2 = k1 + 1; k2 < 4; k2++) for (let i = 0; i < 16; i++) {
  if (i & (1 << k1) || i & (1 << k2)) continue;
  T4F.push([i, i | (1 << k1), i | (1 << k1) | (1 << k2), i | (1 << k2)]);
}
// faces: fill the 24 square faces (Robin: "solid sides"), far ones first, each in the colour of its place in the fourth
// dimension, brighter as it turns toward us, a little see-through so the cube inside the cube still shows
export function drawTesseract(ctx, x, y, r, a, b, { outer = P.mint, inner = P.pink, alpha = 1, glowK = 0, tilt = [0.42, 0.55], faces = false, faceAlpha = 0.62 } = {}) {
  if (alpha <= 0.01) return;
  const pts = T4.map(([px, py, pz, pw]) => {
    let X = px * Math.cos(a) - pw * Math.sin(a), W = px * Math.sin(a) + pw * Math.cos(a);
    let Y = py * Math.cos(b) - pz * Math.sin(b), Z = py * Math.sin(b) + pz * Math.cos(b);
    const s = 1 / (2.8 - W);                                   // perspective out of the fourth dimension
    X *= s; Y *= s; Z *= s;
    const [p, q] = tilt;                                       // a fixed 3D view tilt so it never sits flat on
    const y1 = Y * Math.cos(p) - Z * Math.sin(p), z1 = Y * Math.sin(p) + Z * Math.cos(p);
    const x2 = X * Math.cos(q) + z1 * Math.sin(q), z2 = -X * Math.sin(q) + z1 * Math.cos(q);
    return { sx: x + x2 * r * 2.2, sy: y + y1 * r * 2.2, z: z2, w: W };
  });
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (glowK > 0) glow(ctx, x, y, r * 2.6, '#ffe6c0', 0.45 * glowK);
  ctx.lineCap = 'round';
  if (faces) {
    const fs = T4F.map((f) => ({ f, z: f.reduce((m, i) => m + pts[i].z, 0) / 4, w: f.reduce((m, i) => m + pts[i].w, 0) / 4 })).sort((m, n) => m.z - n.z);
    for (const { f, z, w } of fs) {
      const q = f.map((i) => pts[i]);
      // how squarely it faces us: its projected area against a full face's, and which way round it winds
      const area = 0.5 * ((q[1].sx - q[0].sx) * (q[3].sy - q[0].sy) - (q[3].sx - q[0].sx) * (q[1].sy - q[0].sy)) + 0.5 * ((q[3].sx - q[2].sx) * (q[1].sy - q[2].sy) - (q[1].sx - q[2].sx) * (q[3].sy - q[2].sy));
      const face = Math.min(1, Math.abs(area) / (r * r * 1.6)), base = mix(inner, outer, (w + 1) / 2);
      const lit = mix(base, '#fffaf0', 0.22 + 0.38 * face - (area > 0 ? 0 : 0.12));
      ctx.globalAlpha = alpha * faceAlpha * (0.75 + 0.25 * (z + 0.5));
      ctx.fillStyle = lit; ctx.beginPath(); q.forEach((p, k) => (k ? ctx.lineTo(p.sx, p.sy) : ctx.moveTo(p.sx, p.sy))); ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = alpha;
  }
  const edges = T4E.map(([i, j]) => ({ i, j, z: (pts[i].z + pts[j].z) / 2, w: (pts[i].w + pts[j].w) / 2 })).sort((m, n) => m.z - n.z);
  const lw = Math.max(1.2, r * 0.07);
  for (const e of edges) {
    const A = pts[e.i], B = pts[e.j], c = mix(inner, outer, (e.w + 1) / 2), wk = lw * (0.85 + 0.3 * (e.z + 0.5));
    const line = (dx, dy) => { ctx.beginPath(); ctx.moveTo(A.sx + dx, A.sy + dy); ctx.lineTo(B.sx + dx, B.sy + dy); ctx.stroke(); };
    ctx.strokeStyle = 'rgba(70,40,50,0.12)'; ctx.lineWidth = wk; line(wk * 0.5, wk * 0.9);
    ctx.strokeStyle = shade(c, -0.22); ctx.lineWidth = wk; line(0, 0);
    ctx.strokeStyle = c; ctx.lineWidth = wk * 0.7; line(0, 0);
    ctx.strokeStyle = rgba(mix(c, '#fffaf0', 0.6), 0.8); ctx.lineWidth = wk * 0.28; line(-wk * 0.15, -wk * 0.2);
  }
  for (const p of [...pts].sort((m, n) => m.z - n.z)) {
    const c = mix(inner, outer, (p.w + 1) / 2), rr = lw * 0.95;
    const g = ctx.createRadialGradient(p.sx - rr * 0.35, p.sy - rr * 0.4, 0, p.sx, p.sy, rr);
    g.addColorStop(0, mix(c, '#fffaf0', 0.6)); g.addColorStop(1, shade(c, -0.15));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.sx, p.sy, rr, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

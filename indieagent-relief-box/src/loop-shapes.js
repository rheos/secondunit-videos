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
    const S = SOLIDS[kind], V = S.v.map((v) => rot(v, ang[0], ang[1], ang[2]));
    const faces = S.f.map((f) => {
      const a = V[f[0]], b = V[f[1]], c = V[f[2]];
      const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      let n = norm([u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]);
      // every solid is centred on the origin: an outward normal points the same way as the face's centre
      const m = [0, 1, 2].map((d) => f.reduce((s, i) => s + V[i][d], 0) / f.length);
      if (n[0] * m[0] + n[1] * m[1] + n[2] * m[2] < 0) n = n.map((x) => -x);
      return { f, n, z: m[2] };
    }).filter((F) => F.n[2] > 0).sort((p, q) => p.z - q.z);
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

// Relief box, the shared kit: palette, the key light, and the two ways a shape gets its sculpted form in paper.
// Built on Leon Lin's paper-fox core (vendor/paper-fox, MIT); this file only adds helpers on top of it.
//
// The reference is clay relief in a shadowbox. Paper-fox's language for form is layers of cut paper: a shape is
// cut again in smaller tiers, each a shade lighter and shifted toward the light, so a flat cut-out reads as a
// rounded, sculpted piece. clayForm() does that for any outline, tube() for limbs, coils and stems.

import { piece, bevelBands, setShadow, clearShadow, pathOf } from '../vendor/paper-fox/core/piece.js';
import { mix, shade } from '../vendor/paper-fox/core/color.js';

// toward the key light: upper left, as in the photographed boxes
export const LIGHT = [-0.46, -0.89];

export const PAL = {
  bone: '#f1e9dd', boneShade: '#d8ccbd', boneDeep: '#bfae9c',
  mint: '#8fd4cf', mintDeep: '#4f9f9e', aqua: '#b9e6e0',
  pink: '#f3a9b6', pinkDeep: '#d97f92', blush: '#f7d3d3',
  butter: '#f4e39b', butterDeep: '#d8bf5e',
  slate: '#8d9db3', slateDeep: '#5f6f88', navy: '#2b3557',
  lilac: '#c7b7d9',
  wall: '#ecd2bf', wallLight: '#f6e4d4', wallShade: '#cfae98',
  box: '#d9bca6', boxDeep: '#b8977f',
  iris: '#7fa7d8', ink: '#3a3340',
};

const centroid = (pts) => {
  let x = 0, y = 0;
  for (const p of pts) { x += p[0]; y += p[1]; }
  return [x / pts.length, y / pts.length];
};

// Scale an outline about its centre and shift it, for the inner tiers of a sculpted piece.
export function inset(pts, k, shift = [0, 0]) {
  const [cx, cy] = centroid(pts);
  return pts.map(([x, y]) => [cx + (x - cx) * k + shift[0], cy + (y - cy) * k + shift[1]]);
}

// One sculpted piece: the cut-out with its contact shadow and cut edge, then tiers cut again inside it, each
// smaller, lighter and nearer the light, and a dark crescent on the side away from the light.
//   tiers  how many inner cuts; step  how much each shrinks; lift  how much lighter each gets; reach  px toward the light
export function clayForm(ctx, pts, fill, { light = LIGHT, tiers = 3, step = 0.14, lift = 0.07, reach = 6, smooth = true, shadow = true, bevel = true, rim = null } = {}) {
  const path = piece(ctx, pts, {
    fill, smooth, rim,
    shadow: shadow ? { color: 'rgba(60,40,40,0.34)', blur: 7, x: -light[0] * 4, y: -light[1] * 4 } : null,
    bevel: bevel ? { light, width: 1.8, hi: 0.32, lo: 0.2, soft: 0.4 } : null,
  });
  ctx.save();
  ctx.clip(path);
  // the unlit flank: the outline again, shifted away from the light, darker
  ctx.fillStyle = shade(fill, -0.1);
  ctx.globalAlpha = 0.55;
  const away = inset(pts, 1, [-light[0] * -reach * 1.6, -light[1] * -reach * 1.6]);
  const flank = new Path2D(); flank.rect(-1e5, -1e5, 2e5, 2e5); flank.addPath(pathOf(away, { smooth }));
  ctx.fill(flank, 'evenodd');
  ctx.globalAlpha = 1;
  for (let i = 1; i <= tiers; i++) {
    const k = 1 - step * i, sh = [light[0] * reach * i, light[1] * reach * i];
    piece(ctx, inset(pts, k, sh), {
      fill: shade(fill, lift * i), smooth,
      shadow: { color: 'rgba(60,40,40,0.16)', blur: 4, x: -light[0] * 1.5, y: -light[1] * 1.5 },
      bevel: { light, width: 1.2, hi: 0.22, lo: 0.08 },
    });
  }
  ctx.restore();
  return path;
}

// A tube along a polyline (an arm, a leg, a coil): offset both sides by the width at each point, round caps.
// widths: one number or one per point.
export function tubeOutline(line, widths, { caps = true, n = 8 } = {}) {
  const W = (i) => (Array.isArray(widths) ? widths[i] : widths);
  const L = [], R = [];
  for (let i = 0; i < line.length; i++) {
    const a = line[Math.max(0, i - 1)], b = line[Math.min(line.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, w = W(i);
    L.push([line[i][0] + nx * w, line[i][1] + ny * w]);
    R.push([line[i][0] - nx * w, line[i][1] - ny * w]);
  }
  const cap = (p, q, c, w, from) => {
    const out = [];
    if (!caps) return out;
    const a0 = Math.atan2(p[1] - c[1], p[0] - c[0]);
    for (let k = 1; k < n; k++) { const a = a0 + from * Math.PI * k / n; out.push([c[0] + Math.cos(a) * w, c[1] + Math.sin(a) * w]); }
    return out;
  };
  const last = line.length - 1;
  return [...L, ...cap(L[last], R[last], line[last], W(last), -1), ...R.reverse(), ...cap(R[R.length - 1], L[0], line[0], W(0), -1)];
}

// A sculpted tube: the outline as a clay piece, then a highlight tube along the side toward the light.
export function tube(ctx, line, widths, fill, { light = LIGHT, shadow = true, hi = 0.11 } = {}) {
  const W = (i) => (Array.isArray(widths) ? widths[i] : widths);
  const path = clayForm(ctx, tubeOutline(line, widths), fill, { light, tiers: 0, shadow, reach: 4 });
  ctx.save();
  ctx.clip(path);
  for (let k = 1; k <= 2; k++) {
    const off = line.map((p, i) => [p[0] + light[0] * W(i) * 0.22 * k, p[1] + light[1] * W(i) * 0.22 * k]);
    piece(ctx, tubeOutline(off, line.map((_, i) => W(i) * (1 - 0.3 * k))), {
      fill: shade(fill, hi * k), smooth: true,
      shadow: { color: 'rgba(60,40,40,0.12)', blur: 3, x: -light[0], y: -light[1] },
    });
  }
  ctx.restore();
  return path;
}

// A stepped stack (pyramids, tiers, the islands' undersides): bars of decreasing width, each its own cut piece.
export function steps(ctx, cx, y, { n = 5, w0 = 140, w1 = 30, h = 14, gap = 0, up = true, colors = [PAL.pink], light = LIGHT, round = 3 } = {}) {
  for (let i = 0; i < n; i++) {
    const k = n === 1 ? 0 : i / (n - 1), w = w0 + (w1 - w0) * k, yy = up ? y - i * (h + gap) : y + i * (h + gap);
    const c = colors[i % colors.length];
    const r = Math.min(round, h / 2);
    const pts = [[cx - w / 2 + r, yy - h], [cx + w / 2 - r, yy - h], [cx + w / 2, yy - h + r], [cx + w / 2, yy - r], [cx + w / 2 - r, yy], [cx - w / 2 + r, yy], [cx - w / 2, yy - r], [cx - w / 2, yy - h + r]];
    piece(ctx, pts, {
      fill: c,
      shadow: { color: 'rgba(60,40,40,0.3)', blur: 4, x: -light[0] * 2.5, y: -light[1] * 2.5 },
      bevel: { light, width: 1.6, hi: 0.34, lo: 0.22 },
    });
    // a lit top face on every step: the bar is a block, not a strip
    piece(ctx, [[cx - w / 2 + r, yy - h], [cx + w / 2 - r, yy - h], [cx + w / 2 - r - 2, yy - h + h * 0.32], [cx - w / 2 + r + 2, yy - h + h * 0.32]], { fill: mix(c, '#ffffff', 0.32) });
  }
}

// A crisp painted detail on a sculpted piece (an iris, dots): no shadow, a faint bevel only.
export function dot(ctx, x, y, r, fill, light = LIGHT) {
  const p = new Path2D(); p.ellipse(x, y, r, r, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill; ctx.fill(p);
  bevelBands(ctx, p, { light, width: Math.max(0.6, r * 0.18), hi: 0.25, lo: 0.25 });
}


// Relief box, the shared kit: palette, the key light, and how a shape gets its sculpted form.
// Built on Leon Lin's paper-fox core (vendor/paper-fox, MIT); this file only adds helpers on top of it.
//
// Draft 1 and 2 built form the paper way, tiers cut inside each shape. Draft 3 moves toward clay: every shape is
// shaded as a rounded lump, with a soft falloff into shadow on the side away from the light, a soft lit shoulder
// toward it, a faint matte sheen, a fine clay surface (grain, fingerprint whorls, pits) and two shadows under it,
// a tight contact shadow and a wide soft one. Paper-fox's baking, edge light and drop shadows still do the rest.

import { piece, bevelBands, setShadow, clearShadow, pathOf } from '../vendor/paper-fox/core/piece.js';
import { mix, shade, rgba } from '../vendor/paper-fox/core/color.js';
import { surface } from '../vendor/paper-fox/core/canvas.js';
import { mulberry32 } from '../vendor/paper-fox/core/rng.js';

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
  box: '#e6c8b6', boxDeep: '#c4a08c',
  iris: '#7fa7d8', ink: '#3a3340',
};

// Sprite settings for clay: a barely-there paper fibre under our own clay surface, a soft cut edge, soft shadows.
export const CLAY_MAT = [{ tex: 'fiber', amt: 0.16 }];
export const CLAY_EDGE = { width: 1.3, hi: 0.14, lo: 0.2, soft: 1.4 };

// The finish: 'soft' is the approved relief-box clay (soft falloff, thumbed surface); 'crisp' is the living loop's
// from draft 9 (Robin: solid material with a crisp, projected construction): shading in defined planes with a
// clean terminator, a sharp highlight along each lit edge, tight shadows, a finer surface. Set it before baking.
let FINISH = 'soft';
export function setFinish(f) {
  FINISH = f;
  Object.assign(CLAY_EDGE, f === 'crisp' ? { width: 1.1, hi: 0.32, lo: 0.3, soft: 0.25 } : { width: 1.3, hi: 0.14, lo: 0.2, soft: 1.4 });
}
// a sprite's drop-shadow blur under the current finish
export const shadowBlur = (b) => (FINISH === 'crisp' ? b * 0.4 : b);

// The clay surface, made once: fine grain, a scatter of fingerprint whorls and tiny pits, centred on mid grey so
// it soft-lights in without shifting the colour.
let clayTex = null;
function claySurface() {
  if (clayTex) return clayTex;
  const N = 384, { canvas, ctx } = surface(N, N), r = mulberry32(5150), img = ctx.createImageData(N, N);
  for (let i = 0; i < N * N; i++) { const v = 128 + (r() + r() - 1) * 14; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
  ctx.putImageData(img, 0, 0);
  ctx.filter = 'blur(0.6px)'; ctx.drawImage(canvas, 0, 0); ctx.filter = 'none';
  const wrap = (x, y, fn) => { for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) fn(x + ox, y + oy); };
  for (let k = 0; k < 9; k++) {
    const x = r() * N, y = r() * N, rot = r() * Math.PI, n = 6 + Math.floor(r() * 6), rx = 2.2 + r(), ry = 1.4 + r() * 0.6;
    wrap(x, y, (X, Y) => {
      for (let i = 1; i <= n; i++) {
        ctx.strokeStyle = `rgba(${i % 2 ? 255 : 0},${i % 2 ? 255 : 0},${i % 2 ? 255 : 0},0.07)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(X, Y, i * rx, i * ry, rot, 0.3 + r() * 0.4, Math.PI * (1.4 + r() * 0.5)); ctx.stroke();
      }
    });
  }
  for (let k = 0; k < 260; k++) {
    const x = r() * N, y = r() * N, rad = 0.5 + r() * r() * 1.6;
    wrap(x, y, (X, Y) => { ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.arc(X, Y, rad, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.arc(X - rad * 0.5, Y - rad * 0.6, rad * 0.7, 0, Math.PI * 2); ctx.fill(); });
  }
  clayTex = canvas;
  return clayTex;
}

const bbox = (pts) => {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
};
const shift = (pts, d) => pts.map(([x, y]) => [x + d[0], y + d[1]]);

// Chaikin corner cutting: rounds the corners of an open polyline (piping, bent rods) so a tube never kinks.
export function chaikin(line, rounds = 3) {
  let p = line;
  for (let k = 0; k < rounds; k++) {
    const out = [p[0]];
    for (let i = 0; i < p.length - 1; i++) {
      const [a, b] = [p[i], p[i + 1]];
      out.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    out.push(p[p.length - 1]);
    p = out;
  }
  return p;
}

// One sculpted clay piece. size is the thickness the shading is scaled to (default: the shorter side of the
// outline's box); round 0..1 how domed it is; sheen the matte highlight. Older options (tiers, step, reach) are
// accepted and ignored so earlier call sites keep working.
export function clayForm(ctx, pts, fill, opts = {}) {
  if (FINISH === 'crisp') return crispForm(ctx, pts, fill, opts);
  const { light = LIGHT, smooth = true, shadow = true, size = null, round = 1, sheen = 0.22 } = opts;
  const res = ctx.__res || 1, B = bbox(pts), S = size ?? Math.max(4, Math.min(B.w, B.h));
  const path = pathOf(pts, { smooth });
  ctx.save();
  if (shadow) {
    // the wide soft shadow, then the tight one where the piece meets what is under it
    setShadow(ctx, { color: 'rgba(70,45,50,0.2)', blur: Math.min(22, 4 + S * 0.22), x: -light[0] * Math.min(9, 2 + S * 0.08), y: -light[1] * Math.min(9, 2 + S * 0.08) });
    ctx.fillStyle = fill; ctx.fill(path);
    setShadow(ctx, { color: 'rgba(60,35,40,0.32)', blur: 2.5, x: -light[0] * 1.2, y: -light[1] * 1.2 });
  }
  ctx.fillStyle = fill; ctx.fill(path);
  clearShadow(ctx);
  ctx.clip(path);
  const band = (d, color, alpha, blur) => {
    const p = new Path2D(); p.rect(B.x0 - S * 2, B.y0 - S * 2, B.w + S * 4, B.h + S * 4); p.addPath(pathOf(shift(pts, d), { smooth }));
    ctx.save(); ctx.filter = `blur(${Math.max(0.5, blur * res)}px)`; ctx.fillStyle = rgba(color, alpha); ctx.fill(p, 'evenodd'); ctx.restore();
  };
  // shadow side: the outline pushed toward the light leaves the far side uncovered; blurred, it is a soft falloff
  band([light[0] * S * 0.32 * round, light[1] * S * 0.32 * round], shade(fill, -0.42), 0.5, S * 0.2);
  // core shadow tucked right under the far edge
  band([light[0] * S * 0.08, light[1] * S * 0.08], shade(fill, -0.5), 0.35, S * 0.05 + 0.6);
  // lit shoulder: pushed away from the light, it leaves the near edge, blurred and pale
  band([-light[0] * S * 0.2 * round, -light[1] * S * 0.2 * round], mix(fill, '#fffaf0', 0.7), 0.42, S * 0.14);
  // matte sheen, high on the lit side
  if (sheen > 0) {
    const cx = (B.x0 + B.x1) / 2 + light[0] * B.w * 0.22, cy = (B.y0 + B.y1) / 2 + light[1] * B.h * 0.22, rr = S * 0.36;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
    g.addColorStop(0, `rgba(255,252,244,${sheen})`); g.addColorStop(1, 'rgba(255,252,244,0)');
    ctx.fillStyle = g; ctx.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);
  }
  // the clay surface
  const pat = ctx.createPattern(claySurface(), 'repeat');
  pat.setTransform(new DOMMatrix().scale(0.7));
  ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.55; ctx.fillStyle = pat;
  ctx.fillRect(B.x0 - 2, B.y0 - 2, B.w + 4, B.h + 4);
  ctx.restore();
  return path;
}

// The crisp finish of the same piece: a lit plane, a shadow plane with a clean terminator, a thin core line, a
// sharp highlight along the lit edge and a small hard glint; tight shadows; the surface grain only faint.
function crispForm(ctx, pts, fill, { light = LIGHT, smooth = true, shadow = true, size = null, round = 1, sheen = 0.22 } = {}) {
  const res = ctx.__res || 1, B = bbox(pts), S = size ?? Math.max(4, Math.min(B.w, B.h));
  const path = pathOf(pts, { smooth });
  ctx.save();
  if (shadow) {
    setShadow(ctx, { color: 'rgba(60,38,46,0.22)', blur: Math.min(8, 1.5 + S * 0.07), x: -light[0] * Math.min(8, 2 + S * 0.08), y: -light[1] * Math.min(8, 2 + S * 0.08) });
    ctx.fillStyle = fill; ctx.fill(path);
    setShadow(ctx, { color: 'rgba(50,30,38,0.38)', blur: 1, x: -light[0] * 1.1, y: -light[1] * 1.1 });
  }
  ctx.fillStyle = fill; ctx.fill(path);
  clearShadow(ctx);
  ctx.clip(path);
  const band = (d, color, alpha, blur) => {
    const p = new Path2D(); p.rect(B.x0 - S * 2, B.y0 - S * 2, B.w + S * 4, B.h + S * 4); p.addPath(pathOf(shift(pts, d), { smooth }));
    ctx.save(); if (blur > 0) ctx.filter = `blur(${blur * res}px)`; ctx.fillStyle = rgba(color, alpha); ctx.fill(p, 'evenodd'); ctx.restore();
  };
  // the plane away from the light, cut with a clean terminator
  band([light[0] * S * 0.3 * round, light[1] * S * 0.3 * round], shade(fill, -0.32), 0.62, 0.5);
  // a thin core line where the turn is sharpest
  band([light[0] * S * 0.06, light[1] * S * 0.06], shade(fill, -0.5), 0.45, 0);
  // the lit plane toward the light
  band([-light[0] * S * 0.17 * round, -light[1] * S * 0.17 * round], mix(fill, '#fffaf0', 0.55), 0.55, 0.5);
  // the sharp highlight running along the lit edge
  band([-light[0] * 1.4, -light[1] * 1.4], '#ffffff', 0.8, 0);
  // a small hard glint high on the lit side
  if (sheen > 0) {
    const cx = (B.x0 + B.x1) / 2 + light[0] * B.w * 0.26, cy = (B.y0 + B.y1) / 2 + light[1] * B.h * 0.26, rr = Math.max(0.8, S * 0.09);
    ctx.fillStyle = `rgba(255,255,255,${Math.min(0.85, sheen * 3)})`; ctx.beginPath(); ctx.ellipse(cx, cy, rr * 1.3, rr, -0.5, 0, Math.PI * 2); ctx.fill();
  }
  const pat = ctx.createPattern(claySurface(), 'repeat');
  pat.setTransform(new DOMMatrix().scale(0.7));
  ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.22; ctx.fillStyle = pat;
  ctx.fillRect(B.x0 - 2, B.y0 - 2, B.w + 4, B.h + 4);
  ctx.restore();
  return path;
}

// A tube along a polyline (a coil, a stem, a rod): offset both sides by the width at each point, round caps.
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

// A rolled clay tube: the outline shaded as a lump whose thickness is the tube's width.
export function tube(ctx, line, widths, fill, { light = LIGHT, shadow = true, caps = true, size = null } = {}) {
  const w = Array.isArray(widths) ? Math.max(...widths) : widths;
  return clayForm(ctx, tubeOutline(line, widths, { caps }), fill, { light, shadow, size: size ?? w * 2, sheen: 0.18 });
}

// A stepped stack (pyramids, tiers, the islands' undersides): slabs of decreasing width, each a rounded clay bar.
export function steps(ctx, cx, y, { n = 5, w0 = 140, w1 = 30, h = 14, gap = 0, up = true, colors = [PAL.pink], light = LIGHT, round = 3 } = {}) {
  for (let i = 0; i < n; i++) {
    const k = n === 1 ? 0 : i / (n - 1), w = w0 + (w1 - w0) * k, yy = up ? y - i * (h + gap) : y + i * (h + gap);
    const c = colors[i % colors.length], r = Math.min(Math.max(round, h * 0.45), h / 2);
    const pts = [[cx - w / 2 + r, yy - h], [cx + w / 2 - r, yy - h], [cx + w / 2, yy - h + r], [cx + w / 2, yy - r], [cx + w / 2 - r, yy], [cx - w / 2 + r, yy], [cx - w / 2, yy - r], [cx - w / 2, yy - h + r]];
    clayForm(ctx, pts, c, { light, size: h * 1.3, sheen: 0.16 });
  }
}

// A painted or pressed-in detail on a clay piece (an eye, dots): a soft dimple, no hard bevel.
export function dot(ctx, x, y, r, fill, light = LIGHT) {
  const p = new Path2D(); p.ellipse(x, y, r, r, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill; ctx.fill(p);
  bevelBands(ctx, p, { light: [-light[0], -light[1]], width: Math.max(0.6, r * 0.25), hi: 0.16, lo: 0.22, soft: 0.6 });
}


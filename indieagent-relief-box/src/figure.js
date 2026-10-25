// The cabinet doll: a smooth bone-white figure cut down the middle. Each half is one baked sprite (half head with
// one heavy-lidded eye looking outward, half jacket, one arm bent up with the hand behind the head, one leg with an
// ankle band) so the halves can slide apart and show what is inside. Ostrich plumes stand behind the shoulders.
// Authored for the right half (lx >= 0, measured from the cut); the left half is its mirror.

import { RNG } from '../vendor/paper-fox/core/rng.js';
import { piece, linear } from '../vendor/paper-fox/core/piece.js';
import { leaf, transform } from '../vendor/paper-fox/core/geom.js';
import { mix, shade, rgba, vary } from '../vendor/paper-fox/core/color.js';
import { LIGHT, PAL, clayForm, tube, dot } from './kit.js';

export const CX = 960;
export const FIG = { z: 1000, top: 190, bottom: 1000 };

const M = (side) => (pts) => pts.map(([x, y]) => [CX + side * x, y]);
// the light as the right half sees it in its own (mirrored) coordinates is the same screen light
const arc = (cx, cy, rx, ry, a0, a1, n = 24) => [...Array(n + 1)].map((_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });

function drawHalf(ctx, side) {
  const m = M(side), L = LIGHT;
  const clay = PAL.bone;
  // leg: hip to ankle, a slight knee, then the band and the foot turned outward
  tube(ctx, m([[44, 640], [46, 780], [44, 830], [40, 930]]), [30, 26, 23, 19], clay);
  tube(ctx, m([[40, 922], [41, 944]]), 22, shade(clay, 0.04));                                     // ankle band
  clayForm(ctx, m([[22, 948], [58, 948], [74, 972], [70, 994], [28, 996], [20, 980]]), clay, { tiers: 2, reach: 3 });  // foot
  // jacket half: square shoulder, straight hem, the cut edge on the inside
  const jacket = m([[0, 392], [70, 396], [112, 410], [126, 440], [122, 560], [116, 660], [60, 668], [0, 664]]);
  clayForm(ctx, jacket, clay, { tiers: 2, step: 0.07, reach: 5, smooth: true });
  // the lapel crease and a pocket flap, pressed into the clay
  piece(ctx, m([[0, 400], [34, 404], [12, 520], [0, 560]]), { fill: shade(clay, -0.05), bevel: { light: L, width: 1.4, hi: 0.3, lo: 0.25 } });
  piece(ctx, m([[66, 590], [110, 588], [108, 604], [66, 606]]), { fill: shade(clay, 0.03), shadow: { color: 'rgba(60,40,40,0.25)', blur: 3, x: 1, y: 2 }, bevel: { light: L, width: 1.2, hi: 0.3, lo: 0.25 } });
  // neck
  tube(ctx, m([[14, 372], [14, 402]]), 16, shade(clay, -0.02), { shadow: false });
  // arm: shoulder out to the elbow, forearm back to a hand tucked behind the head (drawn before the head)
  tube(ctx, m([[104, 426], [170, 386], [214, 340]]), [24, 21, 19], clay);
  tube(ctx, m([[214, 340], [166, 300], [104, 276]]), [19, 17, 15], clay);
  clayForm(ctx, m([[66, 262], [98, 258], [110, 276], [96, 292], [68, 288]]), clay, { tiers: 1, reach: 2 });     // hand, tucked behind the head
  // half head: flat cut on the inside, the crown round, a long nose pushed outward
  const head = m([[0, 212], ...arc(0, 300, 92, 90, -Math.PI / 2, -0.3, 10), [96, 300], [128, 316], [134, 330], [118, 338], [84, 346], ...arc(0, 300, 86, 92, 0.75, Math.PI / 2, 8), [0, 392]]);
  clayForm(ctx, head, clay, { tiers: 3, step: 0.12, reach: 8, smooth: true });
  // the eye: a lens shape set into the clay, pale iris, a heavy lid over the top half
  const ex = 56, ey = 300;
  piece(ctx, m([[ex - 22, ey], [ex - 8, ey - 10], [ex + 12, ey - 10], [ex + 24, ey + 1], [ex + 10, ey + 9], [ex - 10, ey + 8]]), { fill: '#fbfaf6', smooth: true, shadow: { color: 'rgba(60,40,40,0.35)', blur: 3, x: 0, y: 1.5 } });
  const [ix, iy] = m([[ex + 5, ey + 1]])[0];
  dot(ctx, ix, iy, 8.5, PAL.iris);
  dot(ctx, ix, iy, 3.6, '#2a3550');
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(ix - 2.4 * side, iy - 2.8, 1.8, 0, Math.PI * 2); ctx.fill();
  piece(ctx, m([[ex - 24, ey + 1], [ex - 10, ey - 13], [ex + 14, ey - 14], [ex + 27, ey + 1], [ex + 12, ey - 3], [ex - 10, ey - 2]]), {
    fill: shade(clay, -0.04), smooth: true, shadow: { color: 'rgba(60,40,40,0.35)', blur: 3, x: 0, y: 2 }, bevel: { light: L, width: 1.4, hi: 0.4, lo: 0.2 },
  });
  // the cut face: a thin strip along the inside, the colour of clay cut with a wire
  piece(ctx, m([[0, 212], [7, 214], [7, 664], [0, 664]]), { fill: shade(clay, -0.08) });
}

// an ostrich plume: a curved quill with hundreds of soft barbs, pale pink, lighter at the tips
function drawPlume(ctx, side, seed) {
  const rng = new RNG(seed), m = M(side);
  const n = 46, quill = [];
  for (let i = 0; i <= n; i++) { const k = i / n; quill.push([60 + 250 * k ** 0.9, 420 - 330 * k + 60 * k * k]); }
  for (let pass = 0; pass < 2; pass++) for (let i = 2; i < n; i++) {
    const k = i / n, [x, y] = quill[i], [x2, y2] = quill[i + 1], ang = Math.atan2(y2 - y, x2 - x);
    const len = 60 + 120 * Math.sin(Math.PI * Math.min(1, k * 1.08)) * (0.75 + rng.next() * 0.4);
    for (const s of [-1, 1]) {
      const a = ang + s * (0.9 + rng.range(-0.25, 0.3)) + (pass ? rng.range(-0.2, 0.2) : 0);
      const pts = transform(leaf(len, 5 + rng.next() * 4, { belly: 0.35, curl: s * rng.range(0.1, 0.5), tipRound: 0.2 }), { x, y, rot: a + Math.PI / 2 });
      const c = pass ? vary(mix(PAL.blush, '#fff6f2', 0.4 + k * 0.4), rng, 0.05) : vary(mix(PAL.blush, PAL.pinkDeep, 0.25), rng, 0.05);
      piece(ctx, m(pts), { fill: rgba(c, pass ? 0.75 : 0.9), smooth: true, shadow: pass ? null : { color: 'rgba(110,60,70,0.18)', blur: 4, x: 1, y: 2 } });
    }
  }
  tube(ctx, m(quill.slice(0, n - 4)), quill.slice(0, n - 4).map((_, i) => 4.5 - 3 * i / n), '#f7ece6', { shadow: false });
}

export function addFigure(S) {
  const halves = {}, plumes = {};
  for (const side of [-1, 1]) {
    const name = side < 0 ? 'left' : 'right';
    halves[name] = S.sprite({ name: `half-${name}`, x: side < 0 ? CX - 260 : CX - 20, y: 160, w: 280, h: 860, res: 1.25, mat: 'smooth', edge: { width: 1.8, hi: 0.4, lo: 0.32 }, shadow: { blur: 14 }, draw: (ctx) => drawHalf(ctx, side) });
    plumes[name] = S.sprite({ name: `plume-${name}`, x: side < 0 ? CX - 540 : CX - 20, y: -60, w: 560, h: 580, res: 1.1, mat: 'felt', edge: { width: 1.4, hi: 0.25, lo: 0.15 }, shadow: { blur: 16 }, draw: (ctx) => drawPlume(ctx, side, `plume-${name}`) });
  }
  return { halves, plumes };
}

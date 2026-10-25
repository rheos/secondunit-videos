// What else stands in the box, mixed in from the other photographs: a turning wheel of square windows and a
// floating island with stepped roots and a pink mountain town (the first box), a thought bubble on a white
// lead with an emblem inside (the blue box), and small sculpted things along the floor at the front.

import { RNG } from '../vendor/paper-fox/core/rng.js';
import { piece, linear, radial } from '../vendor/paper-fox/core/piece.js';
import { leaf, transform } from '../vendor/paper-fox/core/geom.js';
import { mix, shade, vary } from '../vendor/paper-fox/core/color.js';
import { LIGHT, PAL, clayForm, tube, tubeOutline, steps, dot } from './kit.js';

const P = PAL;
const sh = (k = 1) => ({ color: `rgba(70,40,50,${0.3 * k})`, blur: 4, x: -LIGHT[0] * 2.5, y: -LIGHT[1] * 2.5 });
const bev = { light: LIGHT, width: 1.6, hi: 0.36, lo: 0.24 };
const circle = (cx, cy, r, n = 48) => [...Array(n)].map((_, i) => [cx + Math.cos(i / n * Math.PI * 2) * r, cy + Math.sin(i / n * Math.PI * 2) * r]);

// ---------------- the wheel of windows ----------------
export const WHEEL = { x: 420, y: 360, r: 170, z: 1320 };
function drawWheel(g) {
  const { x, y, r } = WHEEL, rng = new RNG('wheel');
  clayForm(g, circle(x, y, r), mix(P.butter, '#c9d98a', 0.5), { tiers: 1, step: 0.04, reach: 3 });
  // three rings of square windows, each a recessed cell with a yellow sill
  for (const [rr, n, s] of [[r * 0.82, 20, 22], [r * 0.6, 15, 19], [r * 0.38, 9, 16]]) {
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, cx = x + Math.cos(a) * rr, cy = y + Math.sin(a) * rr;
      const sq = (k) => transform([[-k, -k], [k, -k], [k, k], [-k, k]], { x: cx, y: cy, rot: a });
      piece(g, sq(s * 0.62), { fill: P.butterDeep, shadow: sh(0.8), bevel: bev });
      piece(g, sq(s * 0.42), { fill: vary(mix(P.mintDeep, P.slate, 0.4), rng, 0.06) });
      piece(g, transform([[-s * 0.42, -s * 0.42], [s * 0.42, -s * 0.42], [s * 0.3, -s * 0.28], [-s * 0.3, -s * 0.28]], { x: cx, y: cy, rot: a }), { fill: 'rgba(30,40,40,0.35)' });
    }
  }
  clayForm(g, circle(x, y, r * 0.2), P.butter, { tiers: 2, reach: 2 });
  clayForm(g, circle(x, y, r * 0.09), P.pink, { tiers: 1, reach: 1 });
}

// ---------------- the floating island ----------------
export const ISLAND = { x: 470, y: 650, z: 1180 };
function drawIsland(g) {
  const { x, y } = ISLAND, rng = new RNG('island');
  // stepped roots hanging under it, darker as they go down
  steps(g, x, y + 16, { n: 6, w0: 300, w1: 40, h: 16, up: false, colors: [P.pinkDeep, shade(P.pinkDeep, -0.08), mix(P.pinkDeep, P.lilac, 0.4)] });
  // the slab
  clayForm(g, [[x - 170, y - 4], [x + 170, y - 4], [x + 160, y + 16], [x - 160, y + 16]], P.pink, { smooth: false, tiers: 1, reach: 2 });
  // mountains with snowy tops, back to front
  for (const [mx, h, w, c] of [[x - 90, 120, 90, mix(P.pink, P.lilac, 0.4)], [x + 70, 96, 80, mix(P.pink, P.lilac, 0.3)], [x - 10, 150, 104, P.pink], [x + 130, 70, 56, P.pinkDeep]]) {
    const top = [mx, y - 6 - h];
    piece(g, [[mx - w, y - 4], top, [mx + w, y - 4]], { fill: c, shadow: sh(), bevel: bev });
    piece(g, [[mx, y - 6 - h], [mx + w, y - 4], [mx + w * 0.15, y - 4]], { fill: shade(c, -0.12) });     // face away from the light
    piece(g, [[mx - w * 0.3, y - 6 - h * 0.7], top, [mx + w * 0.3, y - 6 - h * 0.7], [mx + w * 0.12, y - 6 - h * 0.62], [mx, y - 6 - h * 0.72], [mx - w * 0.14, y - 6 - h * 0.6]], { fill: P.blush, shadow: sh(0.5), bevel: bev });
  }
  // a little town on the right of the slab: blocks, a tower, windows
  for (let i = 0; i < 7; i++) {
    const bx = x + 40 + i * 18 + rng.range(-3, 3), bw = rng.range(12, 20), bh = rng.range(20, 56);
    const c = vary(mix(P.pinkDeep, '#e48a6a', 0.5), rng, 0.08);
    piece(g, [[bx, y - 4], [bx, y - 4 - bh], [bx + bw, y - 4 - bh], [bx + bw, y - 4]], { fill: c, shadow: sh(0.8), bevel: bev });
    for (let k = 0; k < bh / 12 - 1; k++) { g.fillStyle = shade(c, -0.25); g.fillRect(bx + 3, y - bh + k * 12, 4, 5); }
  }
  // orange cone trees along the left edge
  for (let i = 0; i < 5; i++) {
    const tx = x - 160 + i * 22, th = 26 + (i % 2) * 8;
    piece(g, [[tx - 9, y - 4], [tx, y - 4 - th], [tx + 9, y - 4]], { fill: i % 2 ? '#e8835a' : '#f09a6c', shadow: sh(0.7), bevel: bev });
  }
}

// ---------------- the thought bubble ----------------
export const BUBBLE = { x: 1520, y: 600, r: 150, z: 1120 };
export const LEAD = [[1188, 330], [1260, 340], [1330, 380], [1366, 450], [1374, 540]];
function drawBubble(g) {
  const { x, y, r } = BUBBLE;
  // a thick white rim, then the dark inside with a faint shine
  clayForm(g, circle(x, y, r), P.bone, { tiers: 1, step: 0.03, reach: 3 });
  piece(g, circle(x, y, r - 14), { fill: radial(g, x - 40, y - 50, 10, r, [mix(P.navy, P.slateDeep, 0.5), P.navy, shade(P.navy, -0.3)]) });
  // inner bevel: the rim stands proud of the dark inside
  piece(g, circle(x, y, r - 14), { fill: 'rgba(0,0,0,0)', bevel: { light: [-LIGHT[0], -LIGHT[1]], width: 4, hi: 0.25, lo: 0.4 } });
}
// the emblem that appears inside: a stepped cross in mint, butter and pink around an eye
function drawEmblem(g) {
  const { x, y } = BUBBLE;
  for (const rot of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
    const pts = (w, d) => transform([[-w, -d], [w, -d], [w * 0.3, -d - w * 0.9]], { x, y, rot });
    piece(g, pts(30, 34), { fill: P.mint, shadow: sh(), bevel: bev });
    piece(g, pts(18, 54), { fill: P.butter, shadow: sh(), bevel: bev });
  }
  steps(g, x, y + 24, { n: 4, w0: 84, w1: 30, h: 10, gap: 1, colors: [P.pink, P.mint, P.butter] });
  steps(g, x, y - 24, { n: 4, w0: 84, w1: 30, h: 10, gap: 1, up: false, colors: [P.pink, P.mint, P.butter] });
  clayForm(g, circle(x, y, 16), P.bone, { tiers: 2, reach: 1.5 });
  dot(g, x, y, 5.5, P.iris); dot(g, x, y, 2.4, P.navy);
}
function drawLead(g) {
  // the lead is a flat white strip with a slate core stripe, like the cable in the blue box
  const out = tubeOutline(LEAD, 9, { caps: false });
  piece(g, out, { fill: P.bone, shadow: { color: 'rgba(60,40,40,0.4)', blur: 6, x: 2, y: 4 }, bevel: bev });
  tube(g, LEAD, 3, P.mintDeep, { shadow: false });
}

// ---------------- along the floor ----------------
function drawFloorLeft(g) {
  const rng = new RNG('floor-l'), y = 1032;
  // a small range of pink pyramids, a fringe of cone trees, a string of beads
  for (const [x, h, w] of [[250, 90, 70], [340, 60, 50], [420, 110, 80], [520, 70, 56]]) {
    piece(g, [[x - w, y], [x, y - h], [x + w, y]], { fill: mix(P.pink, P.butter, 0.15), shadow: sh(), bevel: bev });
    piece(g, [[x, y - h], [x + w, y], [x + w * 0.2, y]], { fill: shade(P.pink, -0.12) });
    for (let k = 1; k < 4; k++) { g.strokeStyle = 'rgba(150,80,90,0.35)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - w + k * w / 2, y); g.lineTo(x, y - h); g.stroke(); }
  }
  for (let i = 0; i < 9; i++) {
    const x = 170 + i * 46 + rng.range(-6, 6), h = rng.range(26, 46);
    piece(g, [[x - 10, y + 6], [x, y + 6 - h], [x + 10, y + 6]], { fill: i % 2 ? '#ef8c5f' : '#f6a678', shadow: sh(0.8), bevel: bev });
  }
  for (let i = 0; i < 12; i++) clayForm(g, circle(600 + i * 19, y - 4 - Math.sin(i * 0.5) * 6, 8, 20), i % 3 ? P.mint : P.butter, { tiers: 1, reach: 1.5 });
}
function drawFloorRight(g) {
  const y = 1034;
  // a coiled ornament, a stepped pink plinth and two dotted balls
  const coil = [];
  for (let i = 0; i <= 80; i++) { const a = i / 80 * Math.PI * 5.4, rr = 8 + i * 0.6; coil.push([1430 + Math.cos(a) * rr, y - 50 + Math.sin(a) * rr * 0.8]); }
  tube(g, coil, 6, P.mintDeep);
  steps(g, 1600, y, { n: 4, w0: 150, w1: 60, h: 16, gap: 1, colors: [P.pinkDeep, P.pink, P.blush] });
  for (const [bx, r, c] of [[1600, 22, P.butter], [1700, 18, P.lilac], [1300, 16, P.pink]]) {
    clayForm(g, circle(bx, bx === 1600 ? y - 4 * 16 - r : y - r, r), c, { tiers: 2, reach: 2 });
    for (let k = 0; k < 7; k++) dot(g, bx + Math.cos(k * 0.9) * r * 0.6, (bx === 1600 ? y - 4 * 16 - r : y - r) + Math.sin(k * 0.9) * r * 0.6, 1.8, shade(c, -0.3));
  }
}

export function addProps(S) {
  const s = (name, box, draw, o = {}) => S.sprite({ name, ...box, res: o.res ?? 1.2, mat: o.mat ?? 'smooth', edge: { width: 1.6, hi: 0.35, lo: 0.3 }, shadow: { blur: o.blur ?? 12 }, draw });
  return {
    wheel: s('wheel', { x: WHEEL.x - WHEEL.r - 20, y: WHEEL.y - WHEEL.r - 20, w: WHEEL.r * 2 + 40, h: WHEEL.r * 2 + 40 }, drawWheel),
    island: s('island', { x: ISLAND.x - 200, y: ISLAND.y - 200, w: 400, h: 340 }, drawIsland),
    bubble: s('bubble', { x: BUBBLE.x - BUBBLE.r - 20, y: BUBBLE.y - BUBBLE.r - 20, w: BUBBLE.r * 2 + 40, h: BUBBLE.r * 2 + 40 }, drawBubble, { blur: 16 }),
    emblem: s('emblem', { x: BUBBLE.x - 100, y: BUBBLE.y - 100, w: 200, h: 200 }, drawEmblem, { res: 1.4, blur: 8 }),
    lead: s('lead', { x: 1160, y: 300, w: 240, h: 260 }, drawLead, { blur: 8 }),
    floorL: s('floor-left', { x: 120, y: 900, w: 760, h: 170 }, drawFloorLeft, { res: 1.3 }),
    floorR: s('floor-right', { x: 1250, y: 900, w: 560, h: 170 }, drawFloorRight, { res: 1.3 }),
  };
}


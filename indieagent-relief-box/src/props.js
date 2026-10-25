// The box's landmarks: a sun made of a wheel of lit windows, two floating islands on stepped roots (a pink
// mountain town, a terracotta city), and small sculpted things along the floor at the front. Motifs from the
// reference set, arranged as our own scene.

import { RNG } from '../vendor/paper-fox/core/rng.js';
import { piece, linear, radial } from '../vendor/paper-fox/core/piece.js';
import { leaf, transform } from '../vendor/paper-fox/core/geom.js';
import { mix, shade, vary } from '../vendor/paper-fox/core/color.js';
import { LIGHT, PAL, clayForm, tube, tubeOutline, steps, dot } from './kit.js';

const P = PAL;
const sh = (k = 1) => ({ color: `rgba(70,40,50,${0.3 * k})`, blur: 4, x: -LIGHT[0] * 2.5, y: -LIGHT[1] * 2.5 });
const bev = { light: LIGHT, width: 1.6, hi: 0.36, lo: 0.24 };
const circle = (cx, cy, r, n = 48) => [...Array(n)].map((_, i) => [cx + Math.cos(i / n * Math.PI * 2) * r, cy + Math.sin(i / n * Math.PI * 2) * r]);

// ---------------- the sun: a wheel of windows ----------------
// It rises behind the ranges and turns slowly; its windows are lit from inside and a ring of stepped rays sits on its rim.
export const SUN = { x: 960, y: 0, r: 132, z: 1480 };
function drawSun(g) {
  const { x, y, r } = SUN, rng = new RNG('sun');
  for (let i = 0; i < 18; i++) {
    const a = i / 18 * Math.PI * 2;
    for (let k = 0; k < 3; k++) {
      const d = r + 8 + k * 11, w = 15 - k * 4;
      piece(g, transform([[-w, 0], [0, -13], [w, 0]], { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, rot: a + Math.PI / 2 }), { fill: [P.butter, '#f6c36a', '#f29d5c'][k], shadow: sh(0.6), bevel: bev });
    }
  }
  clayForm(g, circle(x, y, r), mix(P.butter, '#f6c36a', 0.4), { tiers: 1, step: 0.04, reach: 3 });
  for (const [rr, n, s] of [[r * 0.8, 18, 18], [r * 0.57, 13, 16], [r * 0.35, 8, 13]]) {
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, cx = x + Math.cos(a) * rr, cy = y + Math.sin(a) * rr;
      const sq = (k) => transform([[-k, -k], [k, -k], [k, k], [-k, k]], { x: cx, y: cy, rot: a });
      piece(g, sq(s * 0.62), { fill: P.butterDeep, shadow: sh(0.8), bevel: bev });
      piece(g, sq(s * 0.42), { fill: vary(rng.pick(['#ffe2a0', '#ffd27e', '#fff0c8']), rng, 0.04) });
      piece(g, transform([[-s * 0.42, -s * 0.42], [s * 0.42, -s * 0.42], [s * 0.3, -s * 0.28], [-s * 0.3, -s * 0.28]], { x: cx, y: cy, rot: a }), { fill: 'rgba(150,80,30,0.3)' });
    }
  }
  clayForm(g, circle(x, y, r * 0.2), '#f6c36a', { tiers: 2, reach: 2 });
  clayForm(g, circle(x, y, r * 0.09), P.pink, { tiers: 1, reach: 1 });
}

// ---------------- the floating island ----------------
export const ISLAND = { x: 540, y: 470, z: 1180 };
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

// a second, smaller island high on the right: a terracotta city on stepped butter roots
export const CITY = { x: 1552, y: 382, z: 1290 };
function drawCity(g) {
  const { x, y } = CITY, rng = new RNG('city');
  steps(g, x, y + 10, { n: 5, w0: 230, w1: 36, h: 12, up: false, colors: [P.butterDeep, P.butter, mix(P.butterDeep, P.pink, 0.3)] });
  clayForm(g, [[x - 124, y - 2], [x + 124, y - 2], [x + 116, y + 10], [x - 116, y + 10]], P.butter, { smooth: false, tiers: 1, reach: 2 });
  for (let i = 0; i < 11; i++) {
    const bx = x - 112 + i * 21 + rng.range(-3, 3), bw = rng.range(14, 22), bh = rng.range(24, 78) * (1 - Math.abs(i - 5) / 9);
    const c = vary(i % 3 ? '#e48a6a' : '#d9735e', rng, 0.08);
    piece(g, [[bx, y - 2], [bx, y - 2 - bh], [bx + bw, y - 2 - bh], [bx + bw, y - 2]], { fill: c, shadow: sh(0.8), bevel: bev });
    piece(g, [[bx + bw * 0.6, y - 2 - bh], [bx + bw, y - 2 - bh], [bx + bw, y - 2], [bx + bw * 0.6, y - 2]], { fill: shade(c, -0.1) });
    if (i === 5) piece(g, [[bx - 2, y - 2 - bh], [bx + bw / 2, y - 26 - bh], [bx + bw + 2, y - 2 - bh]], { fill: P.pinkDeep, shadow: sh(0.6), bevel: bev });
    for (let k = 0; k < bh / 12 - 1; k++) { g.fillStyle = shade(c, -0.28); g.fillRect(bx + 3, y - bh + k * 12, 4, 5); g.fillRect(bx + bw - 9, y - bh + k * 12, 3, 5); }
  }
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
    sun: s('sun', { x: SUN.x - SUN.r - 70, y: SUN.y - SUN.r - 70, w: SUN.r * 2 + 140, h: SUN.r * 2 + 140 }, drawSun, { blur: 16 }),
    city: s('city', { x: CITY.x - 150, y: CITY.y - 130, w: 300, h: 230 }, drawCity),
    island: s('island', { x: ISLAND.x - 200, y: ISLAND.y - 200, w: 400, h: 340 }, drawIsland),
    floorL: s('floor-left', { x: 120, y: 900, w: 760, h: 170 }, drawFloorLeft, { res: 1.3 }),
    floorR: s('floor-right', { x: 1250, y: 900, w: 560, h: 170 }, drawFloorRight, { res: 1.3 }),
  };
}


// The spine: a column of small sculpted ornaments stacked through the gap between the doll's halves, after the
// pastel box. Mirror symmetric, made of a few shapes repeated at different sizes: chevrons, stepped tiers,
// honeycomb lattices, molecule rings, eye spheres with petals, buttons. Each ornament is one baked sprite so it
// can spring into place on its own beat.

import { RNG } from '../vendor/paper-fox/core/rng.js';
import { piece } from '../vendor/paper-fox/core/piece.js';
import { leaf, transform } from '../vendor/paper-fox/core/geom.js';
import { mix, shade } from '../vendor/paper-fox/core/color.js';
import { LIGHT, PAL, clayForm, tube, steps, dot } from './kit.js';
import { CX } from './figure.js';

const P = PAL;
const sh = (k = 1) => ({ color: `rgba(70,40,50,${0.3 * k})`, blur: 4, x: -LIGHT[0] * 2.5, y: -LIGHT[1] * 2.5 });
const bev = { light: LIGHT, width: 1.6, hi: 0.36, lo: 0.24 };
const poly = (cx, cy, r, n, rot = 0) => [...Array(n)].map((_, i) => { const a = rot + i / n * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
const circle = (cx, cy, r) => poly(cx, cy, r, 40);

// a chevron pair (an arrowhead cut in stripes): dir 1 points down, -1 up
function chevron(ctx, cx, cy, w, h, colors, dir = 1, bands = 3) {
  for (let i = 0; i < bands; i++) {
    const o = i * h * 0.34, c = colors[i % colors.length];
    const pts = [[cx - w / 2, cy - dir * (h / 2) + dir * o], [cx, cy + dir * (h / 2) + dir * o * 0.2 - dir * i * 2], [cx + w / 2, cy - dir * (h / 2) + dir * o], [cx + w / 2 - 12, cy - dir * (h / 2) + dir * o - dir * 10], [cx, cy + dir * (h / 2) - dir * 18 + dir * o * 0.2 - dir * i * 2], [cx - w / 2 + 12, cy - dir * (h / 2) + dir * o - dir * 10]];
    piece(ctx, pts, { fill: c, shadow: sh(), bevel: bev });
  }
}

// a flat lattice of hexagon rings
function lattice(ctx, cx, cy, r, color, rings = [[0, 0], [1, 0], [-1, 0], [0.5, -0.87], [-0.5, -0.87], [0.5, 0.87], [-0.5, 0.87]]) {
  for (const [u, v] of rings) {
    const x = cx + u * r * 1.78, y = cy + v * r * 1.78;
    const outer = poly(x, y, r, 6, Math.PI / 6), inner = poly(x, y, r * 0.55, 6, Math.PI / 6).reverse();
    piece(ctx, [...outer, outer[0], ...inner, inner[0]], { fill: color, shadow: sh(), bevel: bev });
  }
}

// an eye sphere: a ball cut in tiers with a painted eye, often set in petals
function eyeBall(ctx, cx, cy, r, ball, iris) {
  clayForm(ctx, circle(cx, cy, r), ball, { tiers: 3, step: 0.18, reach: r * 0.08 });
  piece(ctx, [[cx - r * 0.55, cy + 2], [cx, cy - r * 0.3], [cx + r * 0.55, cy + 2], [cx, cy + r * 0.3]], { fill: '#fdfbf6', smooth: true, shadow: sh(0.6) });
  dot(ctx, cx, cy + 1, r * 0.22, iris);
  dot(ctx, cx, cy + 1, r * 0.1, P.navy);
}

function petals(ctx, cx, cy, n, len, w, colors, rot = 0, spread = Math.PI * 2) {
  for (let i = 0; i < n; i++) {
    const a = rot + (spread === Math.PI * 2 ? i / n * spread : -spread / 2 + i / (n - 1) * spread);
    piece(ctx, transform(leaf(len, w, { belly: 0.45, tipRound: 0.35 }), { x: cx, y: cy, rot: a + Math.PI / 2 }), { fill: colors[i % colors.length], smooth: true, shadow: sh(), bevel: bev });
  }
}

// a ring of small balls joined by rods (the molecule)
function molecule(ctx, cx, cy, r, color) {
  const pts = poly(cx, cy, r, 6, Math.PI / 6);
  for (let i = 0; i < 6; i++) tube(ctx, [pts[i], pts[(i + 1) % 6]], 4, shade(color, -0.04), { shadow: false });
  for (const [x, y] of pts) clayForm(ctx, circle(x, y, r * 0.3), color, { tiers: 2, step: 0.25, reach: 1.5 });
}

// Ornaments, bottom to top: [name, y, half width, half height, draw(ctx, cx, cy)]
export const ORNAMENTS = [
  ['base', 1000, 80, 34, (g, x, y) => chevron(g, x, y, 130, 46, [P.bone, P.boneShade, P.bone], 1)],
  ['lattice-white', 946, 70, 50, (g, x, y) => lattice(g, x, y, 15, P.bone, [[0, 0], [1, 0], [-1, 0], [0.5, -0.87], [-0.5, -0.87]])],
  ['flower-white', 884, 112, 50, (g, x, y) => {
    petals(g, x, y, 7, 70, 15, [P.bone, P.boneShade], Math.PI / 2, Math.PI * 1.15);
    petals(g, x, y, 7, 70, 15, [P.bone, P.boneShade], -Math.PI / 2, Math.PI * 0.9);
    clayForm(g, circle(x, y, 26), P.bone, { tiers: 2, reach: 2 });
    for (let i = 0; i < 6; i++) dot(g, x + Math.cos(i * 1.05) * 14, y + Math.sin(i * 1.05) * 14, 3.4, P.boneShade);
  }],
  ['eye-wings', 810, 130, 52, (g, x, y) => {
    for (const s of [-1, 1]) steps(g, x + s * 70, y + 18, { n: 3, w0: 80, w1: 40, h: 12, colors: [P.bone, P.boneShade] });
    for (const s of [-1, 1]) piece(g, [[x + s * 40, y - 6], [x + s * 122, y - 26], [x + s * 110, y + 6], [x + s * 40, y + 14]], { fill: P.bone, shadow: sh(), bevel: bev });
    eyeBall(g, x, y, 34, P.bone, P.iris);
  }],
  ['arrows', 746, 80, 30, (g, x, y) => {
    for (const s of [-1, 1]) piece(g, [[x + s * 8, y - 18], [x + s * 74, y], [x + s * 8, y + 18]], { fill: s < 0 ? P.mint : P.pink, shadow: sh(), bevel: bev });
    clayForm(g, [[x - 14, y - 14], [x + 14, y - 14], [x + 14, y + 14], [x - 14, y + 14]], P.butter, { tiers: 1, smooth: false, reach: 2 });
    dot(g, x, y, 5, P.pinkDeep);
  }],
  ['tiers-pink', 690, 84, 34, (g, x, y) => steps(g, x, y + 28, { n: 5, w0: 160, w1: 50, h: 10, gap: 1, colors: [P.pink, P.blush, P.pinkDeep] })],
  ['lungs', 620, 112, 50, (g, x, y) => {
    for (const s of [-1, 1]) {
      const c = [];
      for (let i = 0; i <= 20; i++) { const a = -Math.PI * 0.82 + i / 20 * Math.PI * 1.64; c.push([x + s * (44 + Math.cos(a) * 46), y + Math.sin(a) * 44]); }
      tube(g, c, 15, P.mint);
      clayForm(g, circle(x + s * 30, y + 8, 9), P.butter, { tiers: 1, reach: 1.5 });
    }
    for (let i = 0; i < 3; i++) steps(g, x, y + 40 - i * 6, { n: 1, w0: 52 - i * 10, h: 7, colors: [P.slate, P.aqua] });
  }],
  ['eye-petals', 545, 100, 58, (g, x, y) => {
    petals(g, x, y, 10, 74, 16, [P.butter, P.pink, P.mint], 0.15);
    eyeBall(g, x, y, 32, P.bone, P.iris);
  }],
  ['molecule', 470, 110, 56, (g, x, y) => {
    molecule(g, x - 48, y - 4, 24, P.pink); molecule(g, x + 48, y - 4, 24, P.pink); molecule(g, x, y + 22, 22, P.pinkDeep);
    dot(g, x, y - 18, 7, P.navy);
  }],
  ['goggles', 398, 132, 50, (g, x, y) => {
    for (const s of [-1, 1]) {
      const outer = poly(x + s * 56, y, 46, 8, Math.PI / 8), inner = poly(x + s * 56, y, 26, 8, Math.PI / 8).reverse();
      piece(g, [...outer, outer[0], ...inner, inner[0]], { fill: P.mint, shadow: sh(), bevel: bev });
      for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; dot(g, x + s * 56 + Math.cos(a) * 36, y + Math.sin(a) * 36, 3, P.aqua); }
    }
    clayForm(g, [[x - 12, y - 16], [x + 12, y - 16], [x + 12, y + 16], [x - 12, y + 16]], P.slate, { tiers: 1, smooth: false, reach: 2 });
  }],
  ['lattice-butter', 322, 84, 52, (g, x, y) => lattice(g, x, y, 15, P.butter)],
  ['pyramid', 246, 92, 46, (g, x, y) => steps(g, x, y + 40, { n: 7, w0: 170, w1: 24, h: 10, gap: 1, colors: [P.mint, P.pink, P.butter, P.aqua] })],
  ['button', 182, 30, 26, (g, x, y) => {
    clayForm(g, [[x - 22, y - 20], [x + 22, y - 20], [x + 22, y + 20], [x - 22, y + 20]], P.mint, { tiers: 1, smooth: false, reach: 2 });
    clayForm(g, circle(x, y, 13), P.pink, { tiers: 1, reach: 1.5 });
    for (const [a, b] of [[-4, -4], [4, -4], [-4, 4], [4, 4]]) dot(g, x + a, y + b, 1.8, P.pinkDeep);
  }],
  ['crown', 122, 88, 40, (g, x, y) => {
    chevron(g, x, y + 6, 160, 50, [P.pink, P.mint, P.butter], -1);
    clayForm(g, circle(x, y - 26, 10), P.butter, { tiers: 1, reach: 1.5 });
  }],
];

export function addSpine(S) {
  // the rod everything is threaded on: slate grey, a lighter stripe, set into the floor
  const rod = S.sprite({ name: 'rod', x: CX - 30, y: 90, w: 60, h: 930, res: 1.2, mat: 'smooth', draw(g) {
    tube(g, [[CX, 110], [CX, 1000]], 9, P.slate);
  } });
  const orn = ORNAMENTS.map(([name, y, hw, hh, draw]) => ({
    name, y,
    s: S.sprite({ name: `orn-${name}`, x: CX - hw - 16, y: y - hh - 16, w: hw * 2 + 32, h: hh * 2 + 32, res: 1.35, mat: 'smooth', edge: { width: 1.5, hi: 0.35, lo: 0.3 }, shadow: { blur: 9 }, draw: (g) => draw(g, CX, y) }),
  }));
  return { rod, orn };
}


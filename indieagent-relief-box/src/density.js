// Draft 2, paper-fox's density: more pieces on more planes, from the back wall out past the frame.
//   1460, 1400  two low ranges of stepped pastel hills along the foot of the back wall, cone trees on them
//   1430        the dotted discs, standing off the wall so each casts its own shadow on it
//   1240        coral, after the grey boxes: grey curl clusters, wheat fronds, lime beads
//   1150        two ruffle trees: stepped trunks whose slate and mint rosettes bloom as the light comes up
//   1100        butter piping across the box, porthole to porthole, with a train of beads rolling along it
//   900         a garland hanging from the top of the box: bead strings, stepped pendants, dotted balls
//   830         a second row along the floor
//   560         the lens plane, in front of the frame: big rosettes and plume tips in the lower corners
// Every piece is still a paper-fox piece: baked, textured, edge lit, shadowing the plane behind.

import { RNG, noise } from '../vendor/paper-fox/core/rng.js';
import { piece, linear } from '../vendor/paper-fox/core/piece.js';
import { leaf, transform, ridge, closeDown, along } from '../vendor/paper-fox/core/geom.js';
import { mix, shade, vary, rgba } from '../vendor/paper-fox/core/color.js';
import { osc } from '../vendor/paper-fox/core/ease.js';
import { drawSprites } from '../vendor/paper-fox/core/sprite.js';
import { LIGHT, PAL, CLAY_MAT, CLAY_EDGE, clayForm, tube, steps, dot, chaikin } from './kit.js';
import { BACK } from './box.js';

const P = PAL;
const sh = (k = 1) => ({ color: `rgba(70,40,50,${0.3 * k})`, blur: 4, x: -LIGHT[0] * 2.5, y: -LIGHT[1] * 2.5 });
const bev = { light: LIGHT, width: 1.6, hi: 0.36, lo: 0.24 };
const circle = (cx, cy, r, n = 40) => [...Array(n)].map((_, i) => [cx + Math.cos(i / n * Math.PI * 2) * r, cy + Math.sin(i / n * Math.PI * 2) * r]);
const LIME = '#c6d957', CORAL = '#7d8597';

// ---------------- low ranges along the back wall ----------------
// Rounded clay mounds pressed side by side in two rows, the back row paler, with little rolled trees on them.
function drawRange(g, { seed, base, amp, colors, haze }) {
  const rng = new RNG(`range:${seed}`), x0 = BACK.x0 - 240, x1 = BACK.x1 + 240, bottom = BACK.y1 + 40;
  for (const [row, lift, fade] of [[0, amp * 0.55, haze * 0.75 + 0.08], [1, 0, haze * 0.6]]) {
    const tops = [];
    for (let x = x0 - 60; x < x1 + 60;) {
      const w = rng.range(120, 260), h = amp * rng.range(0.6, 1.25), cx = x + w / 2, y = base - lift + rng.range(-8, 8);
      const pts = [];
      for (let i = 0; i <= 24; i++) { const a = Math.PI + i / 24 * Math.PI; pts.push([cx + Math.cos(a) * w * 0.62, y + Math.sin(a) * h]); }
      pts.push([cx + w * 0.62, bottom], [cx - w * 0.62, bottom]);
      clayForm(g, pts, vary(mix(colors[(row + tops.length) % colors.length], P.wallLight, fade), rng, 0.05), { size: h * 1.6, sheen: 0.14 });
      tops.push([cx, y - h, w]);
      x += w * rng.range(0.7, 0.95);
    }
    // rolled trees on some of the crowns: cones with soft tips, and balls on sticks
    for (const [cx, ty, w] of tops) {
      if (!rng.chance(0.55)) continue;
      const x = cx + rng.range(-w * 0.2, w * 0.2), h = rng.range(22, 42), c = vary(mix(rng.pick(['#ef8c5f', P.mintDeep, '#f6a678', P.mint]), P.wallLight, fade * 0.7), rng, 0.06);
      if (rng.chance(0.6)) clayForm(g, [[x - h * 0.3, ty + 6], [x - h * 0.16, ty - h * 0.55], [x, ty - h], [x + h * 0.16, ty - h * 0.55], [x + h * 0.3, ty + 6]], c, { size: h * 0.5, sheen: 0.12 });
      else { tube(g, [[x, ty + 6], [x, ty - h * 0.6]], 2.4, '#a08b80', { shadow: false }); clayForm(g, circle(x, ty - h * 0.75, h * 0.3, 28), c, { sheen: 0.18 }); }
    }
  }
}

// ---------------- discs off the wall ----------------
function drawDiscs(g) {
  const clusters = [[330, 230, 5], [1640, 470, 4], [800, 560, 3], [1180, 250, 3]];
  for (const [cx, cy, n] of clusters) {
    const cr = new RNG(`discs:${cx}`);
    for (let i = 0; i < n; i++) {
      const x = cx + cr.range(-90, 90), y = cy + cr.range(-60, 60), rr = cr.range(14, 28);
      clayForm(g, circle(x, y, rr, 36), '#fbf6ee', { size: rr * 1.2, round: 0.6, sheen: 0.15 });
      const m = 7 + Math.round(rr / 5);
      for (let k = 0; k < m; k++) {
        const a = k / m * Math.PI * 2 + cr.next(), d = rr * 0.58;
        g.fillStyle = P.ink; g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, rr * 0.11, 0, Math.PI * 2); g.fill();
      }
      g.fillStyle = P.ink; g.beginPath(); g.arc(x, y, rr * 0.13, 0, Math.PI * 2); g.fill();
    }
  }
}

// ---------------- coral, lower left ----------------
export function curl(g, cx, cy, r, turns, color, w = 3.2) {
  const pts = [];
  for (let i = 0; i <= 40; i++) { const k = i / 40, a = k * turns * Math.PI * 2; pts.push([cx + Math.cos(a) * r * (1 - k * 0.85), cy + Math.sin(a) * r * (1 - k * 0.85)]); }
  tube(g, pts, pts.map((_, i) => w * (1 - i / 60)), color, { shadow: false });
}
function drawCoral(g) {
  const rng = new RNG('coral');
  // grey curl clusters: dozens of small spirals packed into a cloud
  for (const [cx, cy, n, rr] of [[300, 760, 34, 70], [470, 860, 26, 58], [190, 900, 22, 50], [560, 720, 16, 40]]) {
    clayForm(g, circle(cx, cy, rr * 0.8, 30), shade(CORAL, -0.12), { tiers: 0, reach: 2 });
    for (let i = 0; i < n; i++) {
      const a = rng.next() * Math.PI * 2, d = Math.sqrt(rng.next()) * rr;
      curl(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8, rng.range(9, 16), rng.range(1.2, 1.9), vary(CORAL, rng, 0.08));
    }
  }
  // rolled stalks rising out of the cloud, each ending in a lime ball
  for (const [x, y, len, lean] of [[380, 720, 170, -0.12], [420, 740, 140, 0.08], [520, 800, 120, 0.2], [240, 820, 110, -0.25]]) {
    const line = [...Array(12)].map((_, i) => { const k = i / 11; return [x + Math.sin(lean) * len * k + 6 * Math.sin(k * 5 + x), y - Math.cos(lean) * len * k]; });
    tube(g, line, line.map((_, i) => 5.5 - i * 0.22), vary('#b07d52', rng, 0.05));
    const e = line[11];
    clayForm(g, circle(e[0], e[1] - 6, 11, 28), LIME, { sheen: 0.25 });
  }
  // lime bead clusters
  for (let i = 0; i < 14; i++) { const x = rng.range(160, 620), y = rng.range(640, 960), r = rng.range(6, 13); clayForm(g, circle(x, y, r, 20), LIME, { tiers: 1, reach: 1 }); dot(g, x, y, r * 0.45, shade(LIME, -0.2)); }
}

// ---------------- ruffle tree, lower right ----------------
export function rosette(g, cx, cy, r, base, rng) {
  for (let ring = 0; ring < 3; ring++) {
    const n = 11 - ring * 2, rr = r * (1 - ring * 0.3);
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + ring * 0.4 + rng.range(-0.1, 0.1);
      const pts = transform(leaf(rr, rr * 0.42, { belly: 0.55, tipRound: 0.6, curl: rng.range(-0.15, 0.15) }), { x: cx, y: cy, rot: a + Math.PI / 2 });
      clayForm(g, pts, vary(shade(base, ring * 0.08), rng, 0.05), { smooth: true });
      // the ruffle: a crimp line along each petal
      g.strokeStyle = rgba(shade(base, -0.3), 0.35); g.lineWidth = 1;
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * rr * 0.8, cy + Math.sin(a) * rr * 0.8); g.stroke();
    }
  }
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; dot(g, cx + Math.cos(a) * r * 0.16, cy + Math.sin(a) * r * 0.16, r * 0.1, P.butter); }
  dot(g, cx, cy, r * 0.12, P.butterDeep);
}
// Two trees: stepped trunks and bare branches, baked once; their rosettes are separate sprites that bloom.
const TREES = [
  { x: 1590, base: 985, n: 7, w: 54, branches: [[[1590, 800], [1650, 770], [1690, 730]], [[1590, 820], [1530, 790], [1490, 770]]] },
  { x: 1205, base: 990, n: 5, w: 40, branches: [[[1205, 860], [1240, 830], [1262, 800]], [[1205, 870], [1172, 846], [1150, 822]]] },
];
export const ROSETTES = [
  [1500, 760, 54, PAL.slate], [1690, 720, 60, PAL.slateDeep], [1600, 770, 66, mix(PAL.slate, PAL.mint, 0.4)], [1545, 840, 44, PAL.mintDeep], [1660, 830, 48, PAL.slate], [1720, 790, 36, mix(PAL.slate, PAL.mint, 0.3)],
  [1150, 815, 34, PAL.mintDeep], [1262, 792, 38, PAL.slate], [1205, 828, 44, mix(PAL.slate, PAL.mint, 0.4)],
];
function drawTrees(g) {
  const rng = new RNG('ruffle');
  for (const T of TREES) {
    for (let i = 0; i < T.n; i++) {
      const y = T.base - i * 30, w = T.w - i * 3;
      clayForm(g, [[T.x - w / 2, y], [T.x - w / 2 + 3, y - 30], [T.x + w / 2 - 3, y - 30], [T.x + w / 2, y]], vary(i % 2 ? '#8d7a72' : '#a08b80', rng, 0.05), { smooth: false });
      for (let k = 0; k < 3; k++) { g.fillStyle = 'rgba(60,40,40,0.3)'; g.fillRect(T.x - w / 2 + 6 + k * (w / 3), y - 22, 5, 10); }
    }
    for (const b of T.branches) tube(g, b, [T.w * 0.22, T.w * 0.16, T.w * 0.12], '#8d7a72');
  }
}

// ---------------- the track and the bead train ----------------
// Butter piping across the box in right angles, from a porthole in the left wall to one in the right.
export const TRACK = { z: 1100, w: 8, path: [[214, 610], [470, 610], [500, 640], [500, 670], [530, 700], [1330, 700], [1360, 670], [1360, 630], [1390, 600], [1712, 600]] };
function drawTrack(g) {
  for (const [x, y] of [TRACK.path[0], TRACK.path[TRACK.path.length - 1]]) {
    clayForm(g, circle(x, y - 18, 34, 36), P.bone, { tiers: 1, reach: 2 });
    piece(g, circle(x, y - 18, 22, 30), { fill: shade(P.navy, 0.1), bevel: { light: [-LIGHT[0], -LIGHT[1]], width: 3, hi: 0.2, lo: 0.4 } });
  }
  // little posts holding the piping up, then the piping
  for (let i = 0; i < TRACK.path.length - 1; i++) {
    const [a, b] = [TRACK.path[i], TRACK.path[i + 1]];
    if (Math.abs(a[1] - b[1]) > 2) continue;
    for (let x = Math.min(a[0], b[0]) + 40; x < Math.max(a[0], b[0]) - 20; x += 120) tube(g, [[x, a[1]], [x, a[1] + 34]], 4, P.slate, { shadow: false });
  }
  tube(g, chaikin(TRACK.path, 3), TRACK.w, P.butter);
}
export const BEADS = [P.mint, P.pink, P.butter, P.lilac, P.aqua, P.pinkDeep, LIME];
export function drawBead(g, c) {
  clayForm(g, circle(0, 0, 14, 32), c, { tiers: 2, step: 0.2, reach: 1.5 });
  for (let k = 0; k < 5; k++) dot(g, Math.cos(k * 1.26) * 8, Math.sin(k * 1.26) * 8, 2.2, shade(c, -0.3));
}

// ---------------- the garland ----------------
// strings hanging from the top of the box: [x, length, kind]
const STRINGS = [[220, 150, 'beads'], [300, 230, 'pendant'], [380, 120, 'ball'], [520, 190, 'beads'], [610, 110, 'pendant'], [700, 170, 'ball'],
  [800, 90, 'beads'], [1120, 90, 'beads'], [1220, 160, 'ball'], [1310, 120, 'pendant'], [1410, 200, 'beads'], [1510, 140, 'pendant'], [1620, 220, 'ball'], [1700, 130, 'beads']];
function drawString(g, x, len, kind, rng) {
  const y0 = 20, y1 = y0 + len;
  g.strokeStyle = rgba(P.slateDeep, 0.7); g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke();
  if (kind === 'beads') {
    for (let y = y0 + 30; y < y1; y += 17) clayForm(g, circle(x, y, 7, 18), rng.pick([P.mint, P.pink, P.butter, P.aqua]), { tiers: 1, reach: 1 });
  } else if (kind === 'pendant') {
    steps(g, x, y1 + 10, { n: 4, w0: 18, w1: 52, h: 9, gap: 1, colors: [P.pink, P.mint, P.butter] });
    clayForm(g, [[x - 26, y1 + 12], [x, y1 + 40], [x + 26, y1 + 12]], P.pinkDeep, { smooth: false });
  } else {
    const c = rng.pick([P.lilac, P.butter, P.mint]);
    clayForm(g, circle(x, y1, 18, 30), c, { tiers: 2, reach: 2 });
    for (let k = 0; k < 6; k++) dot(g, x + Math.cos(k * 1.05) * 10, y1 + Math.sin(k * 1.05) * 10, 2, shade(c, -0.3));
  }
}

// ---------------- floor, back row ----------------
function drawFloorBack(g) {
  const rng = new RNG('floor-back'), y = 1004;
  // a run of tiny houses, plinths and cones between the main floor pieces
  for (let i = 0; i < 26; i++) {
    const x = 160 + i * 64 + rng.range(-10, 10);
    if (x > 860 && x < 1060) continue;
    const kind = rng.pick(['house', 'cone', 'plinth', 'ball']);
    const c = vary(rng.pick([P.pink, P.mint, P.butter, P.blush, '#e48a6a']), rng, 0.06);
    if (kind === 'house') {
      const w = rng.range(18, 28), h = rng.range(18, 30);
      clayForm(g, [[x - w / 2, y], [x - w / 2, y - h], [x, y - h - w * 0.6], [x + w / 2, y - h], [x + w / 2, y]], c, { smooth: false });
      g.fillStyle = shade(c, -0.3); g.fillRect(x - 3, y - 10, 6, 10);
    } else if (kind === 'cone') {
      const h = rng.range(24, 48);
      clayForm(g, [[x - h * 0.3, y], [x, y - h], [x + h * 0.3, y]], c, { smooth: false });
    } else if (kind === 'plinth') steps(g, x, y, { n: 3, w0: 44, w1: 20, h: 9, gap: 1, colors: [c, shade(c, 0.12)] });
    else clayForm(g, circle(x, y - 12, 12, 24), c, { tiers: 2, reach: 1.5 });
  }
}

// ---------------- the lens plane ----------------
function drawLens(g) {
  const rng = new RNG('lens');
  // lower left: a heap of rosettes and plume tips leaning in from outside the frame
  for (const [x, y, r, c] of [[-40, 1040, 110, P.slate], [90, 1110, 90, P.mintDeep], [-110, 900, 80, mix(P.slate, P.lilac, 0.4)], [190, 1150, 70, P.slateDeep]]) rosette(g, x, y, r, c, rng);
  // lower right: pink plume tips and a big dotted ball
  for (let i = 0; i < 70; i++) {
    const a = -Math.PI * 0.6 + rng.range(-0.35, 0.35), len = rng.range(120, 230), x = 1880 + rng.range(-40, 40), y = 1100 + rng.range(-30, 30);
    clayForm(g, transform(leaf(len, rng.range(7, 11), { belly: 0.35, curl: rng.range(-0.3, 0.3), tipRound: 0.4 }), { x, y, rot: a + Math.PI / 2 }), vary(mix(P.blush, '#fff2ee', rng.next() * 0.6), rng, 0.05), { size: 18, sheen: 0.12 });
  }
  clayForm(g, circle(1740, 1060, 70, 48), P.butter, { tiers: 3, reach: 4 });
  for (let k = 0; k < 14; k++) dot(g, 1740 + Math.cos(k * 0.9) * 46 * ((k % 2) ? 1 : 0.6), 1060 + Math.sin(k * 0.9) * 46 * ((k % 2) ? 1 : 0.6), 4, P.butterDeep);
}

export function addDensity(S) {
  // returns the pieces the film animates: rosettes, the track and its beads
  const sp = (name, box, draw, o = {}) => S.sprite({ name, ...box, res: o.res ?? 1.2, mat: o.mat ?? CLAY_MAT, edge: CLAY_EDGE, shadow: { blur: (o.blur ?? 12) * 1.5 }, draw });
  const wide = { x: BACK.x0 - 260, w: BACK.x1 - BACK.x0 + 520 };
  S.plane(1460, { name: 'range-far', ...wide, y: 700, h: 360, mat: CLAY_MAT, edge: CLAY_EDGE, res: 1, draw: (g) => drawRange(g, { seed: 41, base: 870, amp: 70, colors: [P.lilac, P.blush, P.lilac], haze: 0.45 }) }, { shadow: { dx: 6, dy: 12, alpha: 0.35 } });
  S.plane(1430, { name: 'discs', x: 120, y: 120, w: 1600, h: 560, mat: CLAY_MAT, edge: CLAY_EDGE, shadow: { blur: 18 }, draw: drawDiscs }, { shadow: { dx: 7, dy: 13, alpha: 0.4 } });
  S.plane(1400, { name: 'range-near', ...wide, y: 760, h: 300, mat: CLAY_MAT, edge: CLAY_EDGE, res: 1, draw: (g) => drawRange(g, { seed: 77, base: 930, amp: 46, colors: [P.pink, P.blush, P.pinkDeep], haze: 0.2 }) }, { shadow: { dx: 8, dy: 14, alpha: 0.4 } });
  S.add({ name: 'coral', z: 1240, shadow: { dx: 9, dy: 16, alpha: 0.42 }, sprites: [{ s: sp('coral', { x: 80, y: 520, w: 680, h: 500 }, drawCoral, { res: 1.25 }) }] });
  S.add({ name: 'trees', z: 1150, shadow: { dx: 9, dy: 16, alpha: 0.42 }, sprites: [{ s: sp('trees', { x: 1100, y: 640, w: 700, h: 380 }, drawTrees, { res: 1.25 }) }] });
  const rr = new RNG('rosettes');
  const rosettes = ROSETTES.map(([x, y, r, c], i) => ({ x, y, s: sp(`ros-${i}`, { x: x - r - 20, y: y - r - 20, w: r * 2 + 40, h: r * 2 + 40 }, (g) => rosette(g, x, y, r, c, rr), { blur: 8, res: 1.3 }) }));
  const track = sp('track', { x: 150, y: 540, w: 1640, h: 300 }, drawTrack, { blur: 10 });
  const beads = BEADS.map((c, i) => S.sprite({ name: `bead-${i}`, x: -20, y: -20, w: 40, h: 40, res: 1.5, mat: CLAY_MAT, edge: CLAY_EDGE, shadow: { blur: 9 }, draw: (g) => drawBead(g, c) }));
  // the garland swings a little, each string on its own phase
  const rng = new RNG('garland');
  const strings = STRINGS.map(([x, len, kind]) => ({ x, s: sp(`str-${x}`, { x: x - 40, y: 0, w: 80, h: len + 70 }, (g) => drawString(g, x, len, kind, rng), { blur: 8, res: 1.3 }) }));
  S.add({ name: 'garland', z: 900, shadow: { dx: 8, dy: 14, alpha: 0.4 }, render(ctx, t, env) {
    drawSprites(ctx, strings.map((o, i) => ({ s: o.s, ax: o.x, ay: 20, x: o.x, y: 20, rot: 0.03 * osc(t, 3.4 + (i % 4) * 0.5, i * 0.17) })), env.shadow);
  } });
  S.add({ name: 'floor-back', z: 830, shadow: { dx: 6, dy: 10, alpha: 0.48 }, sprites: [{ s: sp('floor-back', { x: 100, y: 920, w: 1720, h: 110 }, drawFloorBack, { res: 1.2 }) }] });
  S.add({ name: 'lens', z: 560, shadow: { dx: 14, dy: 24, alpha: 0.5 }, sprites: [{ s: sp('lens', { x: -320, y: 760, w: 2560, h: 520 }, drawLens, { res: 1, blur: 20 }) }] });
  return { rosettes, track, beads };
}

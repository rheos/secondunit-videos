// The living loop, the world: an open pastel world in the approved clay language, no box and no frame. A sky
// that pales toward the horizon, clay clouds, three rows of rounded hills going back into the haze, the terrace
// the machine stands on, two floating islands, and decorations floating free in mid-air at many depths.
// Every motion here is periodic in the loop period, so the film loops without a seam.

import { RNG, noise } from '../vendor/paper-fox/core/rng.js';
import { linear, glow, piece } from '../vendor/paper-fox/core/piece.js';
import { mix, shade, vary, rgba } from '../vendor/paper-fox/core/color.js';
import { drawSprites } from '../vendor/paper-fox/core/sprite.js';
import { transform } from '../vendor/paper-fox/core/geom.js';
import { LIGHT, PAL, CLAY_MAT, CLAY_EDGE, clayForm, tube, steps, dot } from './kit.js';
import { rosette, curl } from './density.js';
import { drawSun, drawIsland, drawCity, SUN, ISLAND, CITY } from './props.js';

const P = PAL;
const TAU = Math.PI * 2;
const circle = (cx, cy, r, n = 36) => [...Array(n)].map((_, i) => [cx + Math.cos(i / n * TAU) * r, cy + Math.sin(i / n * TAU) * r]);
export const LOOP = 12;
export const cyc = (t, n = 1, ph = 0) => Math.sin(TAU * (n * t / LOOP + ph));

// a row of rounded clay mounds from x0 to x1, crowns around base, closed down to bottom; rolled trees on some
function mounds(g, { x0, x1, base, amp, bottom, colors, fade, seed, trees = 0.5 }) {
  const rng = new RNG(`mounds:${seed}`), tops = [];
  for (let x = x0 - 60; x < x1 + 60;) {
    const w = rng.range(150, 300), h = amp * rng.range(0.6, 1.25), cx = x + w / 2, y = base + rng.range(-10, 10);
    const pts = [];
    for (let i = 0; i <= 24; i++) { const a = Math.PI + i / 24 * Math.PI; pts.push([cx + Math.cos(a) * w * 0.62, y + Math.sin(a) * h]); }
    pts.push([cx + w * 0.62, bottom], [cx - w * 0.62, bottom]);
    clayForm(g, pts, vary(mix(colors[tops.length % colors.length], '#f7ece4', fade), rng, 0.05), { size: h * 1.6, sheen: 0.12 });
    tops.push([cx, y - h, w]);
    x += w * rng.range(0.7, 0.95);
  }
  for (const [cx, ty, w] of tops) {
    if (!rng.chance(trees)) continue;
    const x = cx + rng.range(-w * 0.2, w * 0.2), h = rng.range(26, 50), c = vary(mix(rng.pick(['#ef8c5f', P.mintDeep, '#f6a678', P.mint]), '#f7ece4', fade * 0.8), rng, 0.06);
    if (rng.chance(0.6)) clayForm(g, [[x - h * 0.3, ty + 8], [x - h * 0.16, ty - h * 0.55], [x, ty - h], [x + h * 0.16, ty - h * 0.55], [x + h * 0.3, ty + 8]], c, { size: h * 0.5, sheen: 0.12 });
    else { tube(g, [[x, ty + 8], [x, ty - h * 0.6]], 2.6, '#a08b80', { shadow: false }); clayForm(g, circle(x, ty - h * 0.75, h * 0.3, 28), c, { sheen: 0.18 }); }
  }
}

// a soft clay cloud: overlapping puffs on a flat base
function cloud(g, cx, cy, w, rng, c = '#fbf3ee') {
  const n = Math.round(w / 46);
  for (let i = 0; i < n; i++) {
    const k = i / Math.max(1, n - 1), r = w * (0.14 + 0.12 * Math.sin(Math.PI * k)) * rng.range(0.85, 1.15);
    clayForm(g, circle(cx - w / 2 + w * k, cy - r * 0.35, r, 32), vary(c, rng, 0.03), { size: r * 1.6, sheen: 0.2 });
  }
}

// decorations that float in mid-air: a stepped pendant, a dotted ball, a short bead strand, a dotted disc, a chevron
function floater(g, kind, x, y, s, rng) {
  if (kind === 'pendant') {
    steps(g, x, y, { n: 4, w0: 18 * s, w1: 52 * s, h: 9 * s, gap: 1, colors: [P.pink, P.mint, P.butter] });
    clayForm(g, [[x - 26 * s, y + 2], [x, y + 30 * s], [x + 26 * s, y + 2]], P.pinkDeep, { smooth: false, size: 22 * s });
  } else if (kind === 'ball') {
    const c = rng.pick([P.lilac, P.butter, P.mint, P.blush]);
    clayForm(g, circle(x, y, 18 * s, 30), c, { sheen: 0.25 });
    for (let k = 0; k < 6; k++) dot(g, x + Math.cos(k * 1.05) * 10 * s, y + Math.sin(k * 1.05) * 10 * s, 2 * s, shade(c, -0.3));
  } else if (kind === 'strand') {
    const a = rng.range(-0.5, 0.5);
    for (let i = 0; i < 6; i++) { const d = (i - 2.5) * 16 * s; clayForm(g, circle(x + Math.cos(a) * d, y + Math.sin(a) * d + Math.sin(i) * 4 * s, 7 * s, 18), rng.pick([P.mint, P.pink, P.butter, P.aqua]), { sheen: 0.22 }); }
  } else if (kind === 'disc') {
    const rr = 24 * s;
    clayForm(g, circle(x, y, rr, 36), '#fbf6ee', { size: rr * 1.2, round: 0.6, sheen: 0.15 });
    for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; g.fillStyle = P.ink; g.beginPath(); g.arc(x + Math.cos(a) * rr * 0.58, y + Math.sin(a) * rr * 0.58, rr * 0.1, 0, TAU); g.fill(); }
  } else {
    for (let i = 0; i < 3; i++) clayForm(g, transform([[-30, 0], [0, 22], [30, 0], [22, -8], [0, 10], [-22, -8]], { x, y: y + i * 13 * s, sx: s, sy: s }), [P.mint, P.butter, P.pink][i], { smooth: false, size: 14 * s });
  }
}

export function addWorld(S) {
  const sp = (name, box, draw, o = {}) => S.sprite({ name, ...box, res: o.res ?? 1, mat: o.mat ?? CLAY_MAT, edge: o.edge ?? CLAY_EDGE, shadow: o.shadow ?? { blur: 18 }, draw });

  // the backdrop: warm card with the embossed honeycomb from the relief box, each cell its own soft piece, fading
  // toward the hills. No box and no frame: it simply goes on behind the world.
  S.plane(20000, { name: 'honeycomb', x: -620, y: -520, w: 3160, h: 2120, mat: 'smooth', edge: false, shadow: false, draw(g) {
    g.fillStyle = linear(g, 0, -520, 0, 1100, [mix(P.wall, P.pink, 0.22), P.wallLight, '#fbeee2']); g.fillRect(-620, -520, 3160, 2120);
    const r = 34, dx = r * Math.sqrt(3), dy = r * 1.5, hr = new RNG('hex-world');
    for (let row = 0, y = -540; y < 980; row++, y += dy) for (let x = -660 + (row & 1) * dx / 2; x < 2580; x += dx) {
      const fade = 1 - Math.max(0, (y - 380) / 520);
      if (fade <= 0.04 || hr.chance(0.05)) continue;
      const hex = [...Array(6)].map((_, i) => { const a = Math.PI / 6 + i * Math.PI / 3; return [x + Math.cos(a) * (r - 3.4), y + Math.sin(a) * (r - 3.4)]; });
      piece(g, hex, { fill: rgba(vary(mix(P.wallLight, P.blush, 0.35), hr, 0.05), 0.55 + 0.45 * fade), bevel: { light: LIGHT, width: 2.2, hi: 0.32 * fade, lo: 0.18 * fade, soft: 1.6 }, shadow: { color: `rgba(120,70,60,${0.16 * fade})`, blur: 6, x: 1.6, y: 3 } });
    }
  } });

  // the sun, high on the right, its windows breathing with light
  const sun = sp('sun', { x: SUN.x - SUN.r - 70, y: -SUN.r - 70, w: SUN.r * 2 + 140, h: SUN.r * 2 + 140 }, drawSun, { res: 1.1, shadow: { blur: 24 } });
  S.add({ name: 'sun-glow', z: 9010, blend: 'lighter', render(ctx, t) {
    glow(ctx, 1600, 230, 700, '#ffd9a0', 0.2 + 0.03 * cyc(t, 2));
    glow(ctx, 1600, 230, 260, '#fff0c8', 0.3);
  } });
  S.add({ name: 'sun', z: 9000, shadow: { dx: 8, dy: 14, alpha: 0.25 }, render(ctx, t, env) {
    drawSprites(ctx, [{ s: sun, ax: SUN.x, ay: 0, x: 1600, y: 230 + 4 * cyc(t, 1), sx: 0.82, sy: 0.82 }], env.shadow);
  } });

  // clouds drift and come back within the loop
  const crng = new RNG('clouds');
  const clouds = [[300, 210, 300, 7000], [1150, 140, 260, 7600], [1900, 300, 340, 6400], [-150, 420, 240, 5600], [1420, 600, 190, 5200]];
  clouds.forEach(([x, y, w, z], i) => {
    const s = sp(`cloud-${i}`, { x: x - w * 0.7, y: y - w * 0.45, w: w * 1.4, h: w * 0.6 }, (g) => cloud(g, x, y, w, crng));
    S.add({ name: `cloud-${i}`, z, shadow: { dx: 8, dy: 14, alpha: 0.18 }, sprites: [{ s }], anim: (t) => ({ x: 26 * cyc(t, 1, i * 0.21), y: 5 * cyc(t, 2, i * 0.13) }) });
  });

  // three rows of hills, palest and farthest first
  S.plane(3600, { name: 'hills-far', x: -900, y: 500, w: 3720, h: 760, draw: (g) => mounds(g, { x0: -900, x1: 2820, base: 830, amp: 58, bottom: 1250, colors: [P.lilac, P.blush], fade: 0.55, seed: 1, trees: 0.3 }) }, { shadow: { dx: 6, dy: 10, alpha: 0.2 } });
  S.plane(2400, { name: 'hills-mid', x: -700, y: 600, w: 3320, h: 700, draw: (g) => mounds(g, { x0: -700, x1: 2620, base: 880, amp: 50, bottom: 1300, colors: [P.blush, P.aqua], fade: 0.35, seed: 2 }) }, { shadow: { dx: 8, dy: 12, alpha: 0.3 } });
  S.plane(1600, { name: 'hills-near', x: -600, y: 680, w: 3120, h: 700, draw: (g) => mounds(g, { x0: -600, x1: 2520, base: 930, amp: 42, bottom: 1350, colors: [P.pink, P.blush], fade: 0.15, seed: 3 }) }, { shadow: { dx: 9, dy: 14, alpha: 0.36 } });

  // the islands float in the middle distance
  const island = sp('island', { x: ISLAND.x - 200, y: ISLAND.y - 200, w: 400, h: 340 }, drawIsland, { res: 1.2 });
  const city = sp('city', { x: CITY.x - 150, y: CITY.y - 130, w: 300, h: 230 }, drawCity, { res: 1.2 });
  S.add({ name: 'city', z: 2200, shadow: { dx: 10, dy: 22, alpha: 0.3 }, sprites: [{ s: city, ax: CITY.x, ay: CITY.y, x: 260, y: 300 }], anim: (t) => ({ x: 12 * cyc(t, 1, 0.3), y: 8 * cyc(t, 2, 0.6) }) });

  // decorations floating in mid-air at many depths, each bobbing and turning a little on its own phase
  const frng = new RNG('floaters');
  const kinds = ['pendant', 'ball', 'strand', 'disc', 'chevron'];
  const spots = [[180, 160, 2600], [470, 120, 1900], [700, 230, 3000], [1250, 120, 2100], [1430, 420, 2700], [1820, 520, 1700], [120, 560, 1500], [1720, 120, 1450],
    [560, 640, 2800], [1340, 600, 3200], [880, 140, 1500], [2000, 220, 2400], [-60, 300, 2000], [1560, 660, 1300]];
  const floaters = spots.map(([x, y, z], i) => {
    const kind = kinds[i % kinds.length], s = sp(`float-${i}`, { x: x - 70, y: y - 60, w: 140, h: 130 }, (g) => floater(g, kind, x, y, 1, frng), { res: 1.3, shadow: { blur: 12 } });
    return S.add({ name: `float-${i}`, z, shadow: { dx: 10, dy: 18, alpha: 0.22 }, sprites: [{ s }], anim: (t) => ({ y: 10 * cyc(t, 1, i * 0.17), rot: 0.08 * cyc(t, 1, i * 0.31 + 0.2), ox: x, oy: y }) });
  });

  // the terrace the machine stands on: a band of broad clay mounds, and the ground line at y 985
  S.plane(1080, { name: 'terrace', x: -500, y: 860, w: 2920, h: 560, res: 1.1, draw(g) {
    mounds(g, { x0: -500, x1: 2420, base: 1000, amp: 30, bottom: 1420, colors: [mix(P.pink, P.butter, 0.4), mix(P.blush, P.butter, 0.3)], fade: 0.05, seed: 4, trees: 0 });
  } }, { shadow: { dx: 8, dy: 14, alpha: 0.38 } });

  return { island };
}

// The near world in front of the machine: low mounds with coral curls and rosette bushes, then the lens plane.
export function addNear(S) {
  const sp = (name, box, draw, o = {}) => S.sprite({ name, ...box, res: o.res ?? 1.1, mat: CLAY_MAT, edge: CLAY_EDGE, shadow: { blur: 22 }, draw });
  const rng = new RNG('near');
  const near = sp('near', { x: -600, y: 880, w: 3120, h: 560 }, (g) => {
    mounds(g, { x0: -600, x1: 400, base: 1070, amp: 70, bottom: 1440, colors: [P.pinkDeep, P.pink], fade: 0, seed: 5, trees: 0 });
    mounds(g, { x0: 1560, x1: 2520, base: 1080, amp: 60, bottom: 1440, colors: [P.pink, P.pinkDeep], fade: 0, seed: 6, trees: 0 });
    for (const [cx, cy, n] of [[120, 1010, 22], [260, 1040, 14], [1720, 1020, 18]]) for (let i = 0; i < n; i++) {
      const a = rng.next() * TAU, d = Math.sqrt(rng.next()) * 60;
      curl(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.7, rng.range(9, 15), rng.range(1.2, 1.8), vary('#7d8597', rng, 0.08));
    }
    for (const [x, y, r, c] of [[1860, 990, 46, P.slate], [1950, 1030, 40, P.mintDeep], [-20, 990, 44, P.slateDeep]]) rosette(g, x, y, r, c, rng);
  });
  S.add({ name: 'near', z: 760, shadow: { dx: 12, dy: 20, alpha: 0.45 }, sprites: [{ s: near }] });
  const lens = sp('lens', { x: -500, y: 820, w: 2920, h: 560 }, (g) => {
    for (const [x, y, r, c] of [[-120, 1080, 120, P.slate], [40, 1150, 90, P.mintDeep], [2060, 1100, 110, P.slateDeep], [1930, 1170, 80, mix(P.slate, P.lilac, 0.4)]]) rosette(g, x, y, r, c, rng);
    for (let i = 0; i < 40; i++) {
      const a = -Math.PI * 0.55 + rng.range(-0.4, 0.4), len = rng.range(110, 210), x = 240 + rng.range(-40, 60), y = 1140 + rng.range(-20, 20);
      clayForm(g, transform([[-8, 0], [-5, -len * 0.6], [0, -len], [5, -len * 0.6], [8, 0]], { x, y, rot: a + Math.PI / 2 }), vary(mix(P.blush, '#fff2ee', rng.next() * 0.6), rng, 0.05), { size: 16, sheen: 0.1 });
    }
  });
  S.add({ name: 'lens', z: 520, shadow: { dx: 14, dy: 24, alpha: 0.45 }, sprites: [{ s: lens }] });
}


// The living loop, the world: the approved clay language inside a turning honeycomb dome (draft 6), no box and
// no frame. The window-wheel sun is the dome's lantern; two rows of rounded hills are its floor; the terrace the
// machine stands on; a floating island; a large tesseract; and geometry floating free in mid-air at many depths.
// Every motion here is periodic in the loop period, so the film loops without a seam.

import { RNG, noise } from '../vendor/paper-fox/core/rng.js';
import { linear, glow, piece } from '../vendor/paper-fox/core/piece.js';
import { mix, shade, vary, rgba } from '../vendor/paper-fox/core/color.js';
import { drawSprites } from '../vendor/paper-fox/core/sprite.js';
import { transform } from '../vendor/paper-fox/core/geom.js';
import { LIGHT, PAL, CLAY_MAT, CLAY_EDGE, shadowBlur, clayForm, tube, steps, dot } from './kit.js';
import { rosette, curl } from './density.js';
import { drawSun, drawIsland, drawCity, SUN, ISLAND, CITY } from './props.js';
import { drawSolid, drawTesseract } from './loop-shapes.js';
import { addDome } from './loop-dome.js';

const P = PAL;
const TAU = Math.PI * 2;
const circle = (cx, cy, r, n = 36) => [...Array(n)].map((_, i) => [cx + Math.cos(i / n * TAU) * r, cy + Math.sin(i / n * TAU) * r]);
export const LOOP = 12;
// a sprite as made, and again reflected in the centre line x = 960
const pair = (sp) => [{ s: sp }, { s: sp, ax: 960, ay: 0, x: 960, y: 0, sx: -1, sy: 1 }];
// a plane whose sprite crosses the centre line: the left half drawn as made and the right half reflected, each
// clipped at the axis, so the two meet without the cut edge of either showing
function addPair(S, name, z, sprite, shadow) {
  const half = (ctx, right) => { const p = new Path2D(); p.rect(right ? 960 : -4000, -4000, 4000 + (right ? 0 : 960), 9000); ctx.save(); ctx.clip(p); };
  return S.add({ name, z, render(ctx, t, env) {
    const [a, b] = pair(sprite), sh = { ...env.shadow, ...shadow };
    half(ctx, false); drawSprites(ctx, [a], sh); ctx.restore();
    half(ctx, true); drawSprites(ctx, [b], sh); ctx.restore();
  } });
}
// draw fn, then again reflected in the centre line
const mirror = (ctx, fn) => { fn(); ctx.save(); ctx.translate(1920, 0); ctx.scale(-1, 1); fn(); ctx.restore(); };
const COLS_ORBIT = [PAL.pink, PAL.mint, PAL.butter, PAL.lilac, PAL.aqua];
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

// baked decorations that float in mid-air: a stepped pendant or a stack of chevrons
function floater(g, kind, x, y, s, rng) {
  if (kind === 'pendant') {
    steps(g, x, y, { n: 4, w0: 18 * s, w1: 52 * s, h: 9 * s, gap: 1, colors: [P.pink, P.mint, P.butter] });
    clayForm(g, [[x - 26 * s, y + 2], [x, y + 30 * s], [x + 26 * s, y + 2]], P.pinkDeep, { smooth: false, size: 22 * s });
  } else {
    for (let i = 0; i < 3; i++) clayForm(g, transform([[-30, 0], [0, 22], [30, 0], [22, -8], [0, 10], [-22, -8]], { x, y: y + i * 13 * s, sx: s, sy: s }), [P.mint, P.butter, P.pink][i], { smooth: false, size: 14 * s });
  }
}

export function addWorld(S) {
  const sp = (name, box, draw, o = {}) => S.sprite({ name, ...box, res: o.res ?? 1, mat: o.mat ?? CLAY_MAT, edge: o.edge ?? CLAY_EDGE, shadow: o.shadow ?? { blur: shadowBlur(18) }, draw });

  // the backdrop is the turning honeycomb dome (loop-dome.js)
  addDome(S, LOOP);

  // The lantern at the top of the dome: two suns, each a mechanism of parts. The disc and its rays turn, each ring
  // of windows turns at its own speed and way round, the rings breathe, and the rays reach out and draw back in a
  // wave round the rim. The front sun spins and rocks; a larger, cooler sun behind it turns the other way and grows
  // and shrinks; two rings of small solids orbit the pair in opposite directions. Every turn is a whole number of
  // its own part spacings per loop, so the pattern comes back to itself at the seam.
  const LX = 960, LY = 100;
  const lsp = (name, w, h, draw) => S.sprite({ name, x: -w / 2, y: -h / 2, w, h, res: 1.4, mat: CLAY_MAT, edge: CLAY_EDGE, shadow: { blur: shadowBlur(10) }, draw });
  function makeSun(name, R, pal) {
    const plate = lsp(`${name}-plate`, R * 2 + 20, R * 2 + 20, (g) => clayForm(g, circle(0, 0, R, 64), pal.plate, { sheen: 0.18 }));
    const hub = lsp(`${name}-hub`, R * 0.5, R * 0.5, (g) => { clayForm(g, circle(0, 0, R * 0.2, 36), pal.hub, { sheen: 0.3 }); clayForm(g, circle(0, 0, R * 0.09, 24), pal.eye, { sheen: 0.3 }); });
    // a ray of three stepped points, pointing out from its foot at the origin
    const ray = lsp(`${name}-ray`, 36, 50, (g) => { for (let k = 0; k < 3; k++) { const w = 11 - k * 3, y0 = 20 - k * 8; clayForm(g, [[-w, y0], [0, y0 - 10], [w, y0]], pal.rays[k], { smooth: false, size: 10 }); } });
    const win = pal.glass.map((c, k) => lsp(`${name}-win-${k}`, 20, 20, (g) => {
      clayForm(g, [[-7, -7], [7, -7], [7, 7], [-7, 7]], pal.sill, { smooth: false, size: 8 });
      g.fillStyle = c; g.fillRect(-4.8, -4.8, 9.6, 9.6);
      g.fillStyle = 'rgba(60,40,60,0.25)'; g.fillRect(-4.8, -4.8, 9.6, 2.4);
    }));
    return { R, plate, hub, ray, win };
  }
  // rings: [radius, windows, window scale, turns per loop (in window spacings: sign gives the way round)]
  const RINGS = [[0.8, 18, 1.15, -6], [0.57, 13, 1.0, 4], [0.35, 8, 0.85, -3]];
  // spin: the rays' turn (a whole number of ray spacings per loop); rock: a back-and-forth added to rays and rings;
  // the plate and hub stay unturned (their glints would otherwise come round to a different place at the seam)
  function sunItems(sun, t, { spin, rock = 0, scale = 1, dir = 1, rays = 18 }) {
    const { R } = sun, items = [];
    for (let i = 0; i < rays; i++) {
      const a = spin + rock + i / rays * TAU, reach = 1 + 0.45 * Math.sin(TAU * (t / 3 - i * 3 / rays));
      const d = (R + 2 + 6 * (reach - 1)) * scale;
      items.push({ s: sun.ray, ax: 0, ay: 20, x: LX + Math.cos(a) * d, y: LY + Math.sin(a) * d, rot: a + Math.PI / 2, sx: scale, sy: scale * Math.max(0.3, reach) });
    }
    items.push({ s: sun.plate, x: LX, y: LY, sx: scale, sy: scale });
    RINGS.forEach(([rk, n, ws, turns], ri) => {
      const breathe = 1 + 0.16 * Math.sin(TAU * (t / 4 + ri / 3)), turn = dir * TAU * turns / n * t / LOOP + rock * 0.5;
      for (let i = 0; i < n; i++) {
        const a = turn + i / n * TAU, rr = R * rk * breathe * scale, sz = ws * scale * (1 + 0.25 * Math.sin(TAU * (t / 2 + i / n + ri / 3)));
        items.push({ s: sun.win[(i + ri) % 3], x: LX + Math.cos(a) * rr, y: LY + Math.sin(a) * rr, rot: a, sx: sz, sy: sz });
      }
    });
    items.push({ s: sun.hub, x: LX, y: LY, sx: scale, sy: scale });
    return items;
  }
  const front = makeSun('lantern', 92, { plate: mix(P.butter, '#f6c36a', 0.4), hub: '#f6c36a', eye: P.pink, rays: [P.butter, '#f6c36a', '#f29d5c'], sill: P.butterDeep, glass: ['#ffe2a0', '#ffd27e', '#fff0c8'] });
  const back = makeSun('backsun', 150, { plate: mix(P.mint, P.aqua, 0.5), hub: P.lilac, eye: P.butter, rays: [P.aqua, P.mint, P.lilac], sill: P.mintDeep, glass: ['#e8fbf6', '#d6f2ff', '#efe6ff'] });
  const far = makeSun('farsun', 220, { plate: mix(P.pink, P.lilac, 0.45), hub: P.blush, eye: P.mint, rays: [P.blush, P.pink, P.lilac], sill: P.pinkDeep, glass: ['#fff0f4', '#f6e2ff', '#ffe8ee'] });
  S.add({ name: 'lantern-glow', z: 5810, blend: 'lighter', render(ctx, t) {
    glow(ctx, LX, LY, 700, '#ffd9a0', 0.2 + 0.03 * cyc(t, 2));
    glow(ctx, LX, LY, 260, '#fff0c8', 0.3);
  } });
  // the third sun, furthest back and largest, rose and lilac: turning with the front one, swelling as the bellows
  // empty (at 0 and 6 s) while the middle one swells as they fill (at 3 and 9 s): they breathe with the sound
  S.add({ name: 'farsun', z: 5800, shadow: { dx: 8, dy: 14, alpha: 0.18 }, render(ctx, t, env) {
    drawSprites(ctx, sunItems(far, t, { spin: TAU * (3 / 18) * t / LOOP, scale: 1 + 0.18 * Math.cos(TAU * t / 6), rays: 18 }), env.shadow);
  } });
  // the sun behind: larger, cooler, turning the other way, swelling with each breath of the bellows (6 s)
  S.add({ name: 'backsun', z: 5600, shadow: { dx: 8, dy: 14, alpha: 0.22 }, render(ctx, t, env) {
    drawSprites(ctx, sunItems(back, t, { spin: -TAU * (4 / 18) * t / LOOP, scale: 1 - 0.22 * Math.cos(TAU * t / 6), dir: -1 }), env.shadow);
  } });
  // the front sun: spinning, and rocking back and forth as it goes, turning back at each chord change (every 3 s)
  S.add({ name: 'lantern', z: 5000, shadow: { dx: 8, dy: 14, alpha: 0.25 }, anim: (t) => ({ y: 4 * cyc(t, 1) }), render(ctx, t, env) {
    drawSprites(ctx, sunItems(front, t, { spin: TAU * (6 / 18) * t / LOOP, rock: 0.35 * Math.cos(TAU * t / 3), scale: 1 + 0.05 * Math.sin(TAU * t / 1.5) }), env.shadow);
  } });
  // two rings of small solids orbiting the pair in opposite directions, one turn a loop each, tipped into
  // ellipses; each solid tumbles and swells as it goes
  const ORBIT_KINDS = ['octa', 'cube', 'ico', 'tetra', 'dodeca', 'star'];
  S.add({ name: 'orbits', z: 4900, render(ctx, t) {
    for (const [rx, ry, dir, n, r0, ph] of [[300, 96, 1, 6, 12, 0], [380, 132, -1, 8, 9, 0.5]]) {
      const pts = [...Array(n)].map((_, i) => { const a = dir * TAU * t / LOOP + (i + ph) / n * TAU; return { i, a, x: LX + Math.cos(a) * rx, y: LY + 40 + Math.sin(a) * ry, z: Math.sin(a) }; }).sort((p, q) => p.z - q.z);
      for (const p of pts) drawSolid(ctx, ORBIT_KINDS[p.i % 6], p.x, p.y, r0 * (0.8 + 0.25 * p.z) * (1 + 0.2 * Math.sin(TAU * t / 3 + p.i)), [TAU * t / 4 + p.i, TAU * t / 6, p.i], COLS_ORBIT[p.i % 5]);
    }
  } });



  // the dome's floor: two rows of hills
  // (each made for the left half and laid down again reflected, like everything off the centre line)
  const hillsMid = sp('hills-mid', { x: -700, y: 600, w: 1760, h: 700 }, (g) => mounds(g, { x0: -700, x1: 1040, base: 880, amp: 50, bottom: 1300, colors: [P.blush, P.aqua], fade: 0.35, seed: 2 }));
  addPair(S, 'hills-mid', 2400, hillsMid, { dx: 8, dy: 12, alpha: 0.3 });
  const hillsNear = sp('hills-near', { x: -600, y: 680, w: 1660, h: 700 }, (g) => mounds(g, { x0: -600, x1: 1040, base: 930, amp: 42, bottom: 1350, colors: [P.pink, P.blush], fade: 0.15, seed: 3 }));
  addPair(S, 'hills-near', 1600, hillsNear, { dx: 9, dy: 14, alpha: 0.36 });

  // the islands float in the middle distance
  const island = sp('island', { x: ISLAND.x - 200, y: ISLAND.y - 200, w: 400, h: 340 }, drawIsland, { res: 1.2 });

  // a pair of large tesseracts hangs either side of the lantern, turning through the fourth dimension once a loop,
  // one the mirror of the other
  S.add({ name: 'tesseract', z: 2800, render(ctx, t) {
    mirror(ctx, () => drawTesseract(ctx, 470, 240, 78, TAU * t / LOOP, TAU * 2 * t / LOOP, { outer: P.mint, inner: P.pink, glowK: 0.6 + 0.15 * cyc(t, 2) }));
  } });

  // floating geometry at many depths: baked stepped pendants and chevrons, and solids and small tesseracts drawn
  // turning each frame. Every one bobs on its own phase; rotations close within the loop.
  const frng = new RNG('floaters');
  // the left half's floaters; each is drawn again reflected on the right
  const spots = [[180, 150, 2600, 'pendant'], [820, 130, 1900, 'tess'], [700, 560, 3000, 'octa'], [120, 560, 1500, 'ico'], [560, 640, 2800, 'chevron'],
    [880, 520, 1500, 'tetra'], [-60, 300, 2000, 'cube'], [300, 380, 2400, 'star'], [640, 420, 1700, 'chevron']];
  const COLS = [P.mint, P.pink, P.butter, P.lilac, P.aqua];
  // Nothing floats still: each floater is a small mechanism whose parts collapse and expand along different
  // directions in turn. Parts are baked once and moved each frame; every rhythm divides the loop.
  const partSp = (name, w, h, draw) => S.sprite({ name, x: -w / 2, y: -h / 2, w, h, res: 1.4, mat: CLAY_MAT, edge: CLAY_EDGE, shadow: { blur: shadowBlur(10) }, draw });
  const BAR_W = [18, 29, 41, 52], BAR_C = [P.pink, P.mint, P.butter, P.pink];
  const bars = BAR_W.map((w, k) => partSp(`pend-bar-${k}`, w + 12, 22, (g) => steps(g, 0, 4.5, { n: 1, w0: w, w1: w, h: 9, colors: [BAR_C[k]] })));
  const point = partSp('pend-point', 64, 44, (g) => clayForm(g, [[-26, -14], [0, 14], [26, -14]], P.pinkDeep, { smooth: false, size: 22 }));
  const chevs = [P.mint, P.butter, P.pink].map((c, k) => partSp(`chev-${k}`, 72, 40, (g) => clayForm(g, [[-30, -6], [0, 16], [30, -6], [22, -14], [0, 4], [-22, -14]], c, { smooth: false, size: 14 })));
  const fsh = (env) => ({ ...env.shadow, dx: 10, dy: 18, alpha: 0.22 });
  const W = (t, period, ph) => Math.sin(TAU * (t / period + ph));
  spots.forEach(([x, y, z, kind], i) => {
    const ph = i * 0.137, bob = (t) => ({ y: 10 * cyc(t, 1, i * 0.17) });
    if (kind === 'pendant') {
      // an accordion: the stack spreads apart and slams flat on a 6 s beat, while each bar stretches wide and pinches
      // narrow on a 3 s beat that ripples down the stack; the point stretches as the stack flattens
      S.add({ name: `float-${i}`, z, anim: bob, render(ctx, t, env) { mirror(ctx, () => {
        const v = W(t, 6, ph), gap = 1 + 12 * Math.max(0, v) - 8 * Math.max(0, -v), items = [];
        BAR_W.forEach((_, k) => items.push({ s: bars[k], x, y: y - k * (9 + gap), sx: Math.max(0.15, 1 + 0.6 * W(t, 3, ph + k * 0.1)), sy: 1 }));
        items.push({ s: point, x, y: y + 18 + 4 * Math.max(0, -v), sx: 1 - 0.3 * Math.max(0, -v), sy: 1 + 0.9 * Math.max(0, -v) });
        drawSprites(ctx, items, fsh(env));
      }); } });
    } else if (kind === 'chevron') {
      // a fan: on a 4 s beat the three chevrons swing open, each in its own direction, and fold back into one; on a
      // 6 s beat they stretch and squeeze sideways out of step with each other
      S.add({ name: `float-${i}`, z, anim: bob, render(ctx, t, env) { mirror(ctx, () => {
        const fan = W(t, 4, ph), open = Math.max(0, fan), shut = Math.max(0, -fan);
        drawSprites(ctx, chevs.map((c, k) => ({ s: c, x: x + (k - 1) * 14 * open, y: y + (k - 1) * 13 * (1 + 1.3 * open - shut * 0.95), rot: (k - 1) * 0.5 * open, sx: 1 + 0.45 * W(t, 6, ph + k / 3), sy: 1 })), fsh(env));
      }); } });
    } else if (kind === 'tess') {
      S.add({ name: `float-${i}`, z, anim: bob, render(ctx, t) { mirror(ctx, () => drawTesseract(ctx, x, y, 22 * (1 + 0.25 * W(t, 3, ph)), TAU * (i % 2 ? 2 : -1) * t / LOOP, TAU * t / LOOP + i, { outer: COLS[i % 5], inner: COLS[(i + 2) % 5] })); } });
    } else {
      // a solid that squashes and stretches along alternating axes and, once a loop, flattens almost to a plane and
      // springs back out past its size
      S.add({ name: `float-${i}`, z, anim: bob, render(ctx, t) { mirror(ctx, () => {
        const sq = W(t, 4, ph), flat = Math.max(0, Math.sin(Math.PI * Math.min(1, ((t - 2 * i) % LOOP + LOOP) % LOOP / 1.4)));
        const after = ((t - 2 * i) % LOOP + LOOP) % LOOP, spring = after > 1.4 && after < 3.4 ? 0.3 * Math.sin(TAU * (after - 1.4) / 0.8) * (1 - (after - 1.4) / 2) : 0;
        const sx = (1 + 0.35 * sq) * (1 + 0.6 * flat + spring), sy = (1 - 0.35 * sq) * (1 - 0.88 * flat - spring);
        ctx.save(); ctx.translate(x, y); ctx.scale(sx, Math.max(0.06, sy)); ctx.translate(-x, -y);
        drawSolid(ctx, kind, x, y, 20, [TAU * t / LOOP * (1 + i % 3), TAU * 2 * t / LOOP, i], COLS[i % 5]);
        ctx.restore();
      }); } });
    }
  });


  // the terrace the machine stands on: a band of broad clay mounds, and the ground line at y 985
  const terrace = sp('terrace', { x: -500, y: 860, w: 1560, h: 560, res: 1.1 }, (g) => mounds(g, { x0: -500, x1: 1040, base: 1000, amp: 30, bottom: 1420, colors: [mix(P.pink, P.butter, 0.4), mix(P.blush, P.butter, 0.3)], fade: 0.05, seed: 4, trees: 0 }));
  addPair(S, 'terrace', 1080, terrace, { dx: 8, dy: 14, alpha: 0.38 });

  return { island };
}

// The near world in front of the machine: low mounds with coral curls and rosette bushes, then the lens plane.
export function addNear(S) {
  const sp = (name, box, draw, o = {}) => S.sprite({ name, ...box, res: o.res ?? 1.1, mat: CLAY_MAT, edge: CLAY_EDGE, shadow: { blur: shadowBlur(22) }, draw });
  const rng = new RNG('near');
  const near = sp('near', { x: -600, y: 880, w: 1300, h: 560 }, (g) => {
    mounds(g, { x0: -600, x1: 400, base: 1070, amp: 70, bottom: 1440, colors: [P.pinkDeep, P.pink], fade: 0, seed: 5, trees: 0 });
    for (const [cx, cy, n] of [[120, 1010, 22], [260, 1040, 14]]) for (let i = 0; i < n; i++) {
      const a = rng.next() * TAU, d = Math.sqrt(rng.next()) * 60;
      curl(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.7, rng.range(9, 15), rng.range(1.2, 1.8), vary('#7d8597', rng, 0.08));
    }
    for (const [x, y, r, c] of [[-20, 990, 44, P.slateDeep], [60, 1030, 40, P.mintDeep]]) rosette(g, x, y, r, c, rng);
  });
  S.add({ name: 'near', z: 760, shadow: { dx: 12, dy: 20, alpha: 0.45 }, sprites: pair(near) });
  const lens = sp('lens', { x: -500, y: 820, w: 1460, h: 560 }, (g) => {
    for (const [x, y, r, c] of [[-120, 1080, 120, P.slate], [40, 1150, 90, P.mintDeep]]) rosette(g, x, y, r, c, rng);
    for (let i = 0; i < 40; i++) {
      const a = -Math.PI * 0.55 + rng.range(-0.4, 0.4), len = rng.range(110, 210), x = 240 + rng.range(-40, 60), y = 1140 + rng.range(-20, 20);
      clayForm(g, transform([[-8, 0], [-5, -len * 0.6], [0, -len], [5, -len * 0.6], [8, 0]], { x, y, rot: a + Math.PI / 2 }), vary(mix(P.blush, '#fff2ee', rng.next() * 0.6), rng, 0.05), { size: 16, sheen: 0.1 });
    }
  });
  S.add({ name: 'lens', z: 520, shadow: { dx: 14, dy: 24, alpha: 0.45 }, sprites: pair(lens) });
}


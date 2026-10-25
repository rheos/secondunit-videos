// The shadowbox: a honeycomb back wall, four inner walls drawn through the camera so they hold their
// perspective as it moves, and the frame at the front. The frame's drop shadow falls into the box like the
// photographs, deepest along the top and the left.

import { W, H, layerMatrix } from '../vendor/paper-fox/core/stage.js';
import { RNG } from '../vendor/paper-fox/core/rng.js';
import { piece, linear, radial } from '../vendor/paper-fox/core/piece.js';
import { mix, shade, rgba, vary } from '../vendor/paper-fox/core/color.js';
import { bakeSprite } from '../vendor/paper-fox/core/sprite.js';
import { LIGHT, PAL, clayForm } from './kit.js';

export const BACK = { z: 1500, x0: 300, y0: 110, x1: 1620, y1: 990 };
export const FRONT = { z: 720, x0: 110, y0: 34, x1: 1810, y1: 1052 };
export const FLOOR_Y = 990;

// the back wall: warm card, a field of embossed hexagons fading out toward the floor, clusters of dotted discs
export function addBackWall(S) {
  const { x0, y0, x1, y1, z } = BACK, pad = 260;
  S.plane(z, {
    name: 'back-wall', x: x0 - pad, y: y0 - pad, w: x1 - x0 + pad * 2, h: y1 - y0 + pad * 2, mat: 'paper', edge: false, shadow: false,
    draw(ctx) {
      ctx.fillStyle = linear(ctx, 0, y0, 0, y1, [PAL.wallLight, PAL.wall, mix(PAL.wall, PAL.pink, 0.18)]);
      ctx.fillRect(x0 - pad, y0 - pad, x1 - x0 + pad * 2, y1 - y0 + pad * 2);
      // honeycomb, embossed: each cell its own piece with a lit and an unlit edge
      const r = 31, dx = r * Math.sqrt(3), dy = r * 1.5, rng = new RNG('hex');
      for (let row = -2, y = y0 - 40; y < y1 + 40; row++, y += dy) {
        for (let x = x0 - 60 + (row & 1) * dx / 2; x < x1 + 60; x += dx) {
          const fade = 1 - Math.max(0, (y - (y0 + 330)) / 420);
          if (fade <= 0.05 || rng.chance(0.06)) continue;
          const hex = [...Array(6)].map((_, i) => { const a = Math.PI / 6 + i * Math.PI / 3; return [x + Math.cos(a) * (r - 3.2), y + Math.sin(a) * (r - 3.2)]; });
          piece(ctx, hex, {
            fill: rgba(vary(mix(PAL.wallLight, PAL.blush, 0.35), rng, 0.05), 0.55 + 0.45 * fade),
            bevel: { light: LIGHT, width: 1.6, hi: 0.4 * fade, lo: 0.2 * fade },
            shadow: { color: `rgba(120,70,60,${0.18 * fade})`, blur: 3, x: 1.2, y: 2 },
          });
        }
      }
      // dotted discs, after the dandelion clocks in the first box
      const clusters = [[370, 760, 9], [1530, 690, 8], [520, 900, 5], [1420, 880, 6]];
      for (const [cx, cy, n] of clusters) {
        const cr = new RNG(`discs:${cx}`);
        for (let i = 0; i < n; i++) {
          const x = cx + cr.range(-110, 110), y = cy + cr.range(-70, 70), rr = cr.range(16, 30);
          piece(ctx, ellipsePts(x, y, rr, rr), { fill: '#fbf6ee', shadow: { color: 'rgba(90,60,60,0.3)', blur: 5, x: 2, y: 3.5 }, bevel: { light: LIGHT, width: 1.5, hi: 0.3, lo: 0.2 } });
          const m = 7 + Math.round(rr / 5);
          for (let k = 0; k < m; k++) {
            const a = k / m * Math.PI * 2 + cr.next(), d = rr * 0.58;
            ctx.fillStyle = PAL.ink;
            ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, rr * 0.11, 0, Math.PI * 2); ctx.fill();
          }
          ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.arc(x, y, rr * 0.13, 0, Math.PI * 2); ctx.fill();
        }
      }
    },
  });
}

function ellipsePts(cx, cy, rx, ry, n = 36) { return [...Array(n)].map((_, i) => [cx + Math.cos(i / n * Math.PI * 2) * rx, cy + Math.sin(i / n * Math.PI * 2) * ry]); }

// Project a point authored on plane z to screen pixels (q = output scale).
export function project(cam, z, x, y, q) {
  const m = layerMatrix(cam, z, q);
  return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f];
}

// The four inner walls, drawn in screen space each frame between the back wall's corners and the frame's.
// Each wall is card with baked texture used as a pattern, shaded by how it faces the light, darkest at the back.
export function addInnerWalls(S) {
  const tex = bakeSprite({ x: 0, y: 0, w: 512, h: 512, mat: 'paper', seed: 'walls', edge: false, shadow: false, draw(ctx) { ctx.fillStyle = PAL.box; ctx.fillRect(0, 0, 512, 512); } });
  const walls = [
    { name: 'top', a: [0, 1], tone: -0.2 },     // faces down, away from the light: deep
    { name: 'left', a: [3, 0], tone: -0.12 },   // faces right, away from a light at the upper left
    { name: 'right', a: [1, 2], tone: 0.08 },   // faces the light
    { name: 'floor', a: [2, 3], tone: 0.02 },
  ];
  S.add({
    name: 'inner-walls', z: BACK.z - 1, order: 1,
    render(ctx, t, env) {
      const q = env.q, cam = env.cam;
      const B = [[BACK.x0, BACK.y0], [BACK.x1, BACK.y0], [BACK.x1, BACK.y1], [BACK.x0, BACK.y1]].map(([x, y]) => project(cam, BACK.z, x, y, q));
      const F = [[FRONT.x0, FRONT.y0], [FRONT.x1, FRONT.y0], [FRONT.x1, FRONT.y1], [FRONT.x0, FRONT.y1]].map(([x, y]) => project(cam, FRONT.z, x, y, q));
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const pat = ctx.createPattern(tex.canvas, 'repeat');
      pat.setTransform(new DOMMatrix().scale(q * 1.4));
      for (const w of walls) {
        const [i, j] = w.a, quad = [B[i], B[j], F[j], F[i]];
        const p = new Path2D(); p.moveTo(...quad[0]); for (const v of quad.slice(1)) p.lineTo(...v); p.closePath();
        ctx.fillStyle = pat; ctx.fill(p);
        // shade: the wall's tone, darker toward the back edge where light can't reach
        const mb = [(B[i][0] + B[j][0]) / 2, (B[i][1] + B[j][1]) / 2], mf = [(F[i][0] + F[j][0]) / 2, (F[i][1] + F[j][1]) / 2];
        const base = shade(PAL.box, w.tone);
        ctx.fillStyle = linear(ctx, mb[0], mb[1], mf[0], mf[1], [rgba(shade(base, -0.16), 0.78), rgba(base, 0.55), rgba(shade(base, 0.05), 0.5)]);
        ctx.fill(p);
        // the corner seam
        ctx.strokeStyle = 'rgba(70,45,40,0.35)'; ctx.lineWidth = 1.4 * q;
        ctx.beginPath(); ctx.moveTo(...B[i]); ctx.lineTo(...F[i]); ctx.stroke();
      }
      ctx.restore();
    },
  });
}

// The frame: a thick moulding around the opening, cut in three steps (outer, a lit bevel, the inner lip).
export function addFrame(S) {
  const pad = 420, { x0, y0, x1, y1, z } = FRONT;
  const ring = (o, i) => {
    // a rectangle with a rectangular hole, as one closed outline walked out then in
    return [[x0 - o, y0 - o], [x1 + o, y0 - o], [x1 + o, y1 + o], [x0 - o, y1 + o], [x0 - o, y0 - o], [x0 - i, y0 - i], [x0 - i, y1 + i], [x1 + i, y1 + i], [x1 + i, y0 - i], [x0 - i, y0 - i]];
  };
  S.plane(z, {
    name: 'frame', x: x0 - pad, y: y0 - pad, w: x1 - x0 + pad * 2, h: y1 - y0 + pad * 2, mat: 'paper', res: 1,
    edge: { width: 2.4, hi: 0.4, lo: 0.4, soft: 0.6 }, shadow: { blur: 22 },
    draw(ctx) {
      piece(ctx, ring(pad, 0), { fill: shade(PAL.box, 0.06) });
      piece(ctx, ring(34, 0), { fill: linear(ctx, x0, y0, x1, y1, [shade(PAL.box, 0.16), PAL.box, shade(PAL.box, -0.08)]), bevel: { light: LIGHT, width: 2.4, hi: 0.4, lo: 0.3 }, shadow: { color: 'rgba(60,40,30,0.35)', blur: 8, x: 2, y: 4 } });
      piece(ctx, ring(12, 0), { fill: shade(PAL.box, -0.04), bevel: { light: LIGHT, width: 1.8, hi: 0.35, lo: 0.3 }, shadow: { color: 'rgba(60,40,30,0.35)', blur: 5, x: 1.5, y: 3 } });
      // the moulding's grooves, faint
      ctx.strokeStyle = 'rgba(110,80,60,0.25)'; ctx.lineWidth = 1.5;
      for (const o of [52, 70, 120]) { ctx.strokeRect(x0 - o, y0 - o, x1 - x0 + o * 2, y1 - y0 + o * 2); }
    },
  }, { shadow: { alpha: 0.62, dx: 12, dy: 20 } });
}

// Light falling into the box from the upper left: a warm wash on the back wall and a cool shade low right.
export function addBoxLight(S) {
  S.add({
    name: 'box-light', z: BACK.z - 2, order: 2, blend: 'soft-light',
    render(ctx) {
      ctx.fillStyle = radial(ctx, 620, 260, 40, 1100, [rgba('#fff4dc', 0.75), rgba('#ffe9cc', 0.25), rgba('#6a5070', 0.35)]);
      ctx.fillRect(BACK.x0 - 300, BACK.y0 - 300, BACK.x1 - BACK.x0 + 600, BACK.y1 - BACK.y0 + 600);
    },
  });
}


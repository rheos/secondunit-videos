// Relief box, the film: 11 s at 24 fps, one shadowbox. Every frame is a pure function of t.
//   0.0 - 1.4   the box at rest: the doll closed, plumes stirring, the wheel turning, the island bobbing
//   1.4 - 3.6   the doll's halves slide apart and show the gap down its middle
//   2.6 - 7.4   the spine threads up through the gap: the rod rises, then fourteen ornaments spring into
//               place bottom to top; the eyes in it light as they land
//   6.9 - 8.8   a white lead runs from the doll's head to a thought bubble, which pops open; an emblem
//               springs up inside it
//   8.8 - 11    hold; the camera finishes its slow push into the box
// Built on Leon Lin's paper-fox core (vendor/paper-fox, MIT, Copyright (c) 2026 Leonxlnx): the Scene, its planes
// and camera, paper baking, drop shadows and the film finish are paper-fox's, unchanged.

import { Scene } from '../vendor/paper-fox/core/stage.js';
import { drawSprites } from '../vendor/paper-fox/core/sprite.js';
import { glow } from '../vendor/paper-fox/core/piece.js';
import { finish } from '../vendor/paper-fox/core/post.js';
import { E, prog, osc, clamp, lerp, invLerp, smoothstep } from '../vendor/paper-fox/core/ease.js';
import { noise } from '../vendor/paper-fox/core/rng.js';
import { LIGHT } from './kit.js';
import { BACK, addBackWall, addInnerWalls, addFrame, addBoxLight } from './box.js';
import { CX, addFigure } from './figure.js';
import { addSpine } from './spine.js';
import { WHEEL, ISLAND, BUBBLE, addProps } from './props.js';

const DURATION = 11;
const OPEN = 150;
const open = (t) => prog(t, 1.4, 3.6, E.smooth);
const popSpring = (x) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-5.2 * x) * Math.cos(x * 8.2);
const LAND0 = 3.05, LAND_STEP = 0.3, POP = 0.85;

function scene() {
  return new Scene({
    id: 'relief-box',
    duration: DURATION,
    background: '#3b2c2a',
    light: LIGHT,
    shadow: { alpha: 0.48, dist: 10, blur: 11 },
    post: { bloom: 0.14, threshold: 0.84, vignette: 0.24, grain: 0.045, grade: { color: '#ffd9b8', amount: 0.1, mode: 'soft-light' } },
    camera: (t) => {
      const k = E.smooth(t / DURATION);
      return { x: lerp(-40, 26, k) + 4 * noise('cam').n1(t * 0.21), y: lerp(4, -10, k) + 3 * noise('cam').n1(t * 0.17 + 9), z: 120 * E.dolly(t / DURATION), roll: 0.0016 * osc(t, 9.5) };
    },
    build(S) {
      addBackWall(S);
      addInnerWalls(S);
      addBoxLight(S);
      const props = addProps(S);
      const fig = addFigure(S);
      const spine = addSpine(S);

      // the wheel turns once every 90 s or so; a turning piece keeps its shadow straight down-right
      S.add({ name: 'wheel', z: WHEEL.z, render(ctx, t, env) {
        drawSprites(ctx, [{ s: props.wheel, ax: WHEEL.x, ay: WHEEL.y, x: WHEEL.x, y: WHEEL.y, rot: 0.07 * t }], env.shadow);
      } });
      S.add({ name: 'island', z: ISLAND.z, shadow: { dx: 10, dy: 22, alpha: 0.42 }, sprites: [{ s: props.island }], anim: (t) => ({ y: 7 * osc(t, 5.6, 0.2), rot: 0.006 * osc(t, 7.3) , ox: ISLAND.x, oy: ISLAND.y }) });

      // the bubble and its lead
      S.add({ name: 'bubble', z: BUBBLE.z, shadow: { dx: 9, dy: 18 }, render(ctx, t, env) {
        const k = popSpring(clamp((t - 7.45) / POP));
        if (k <= 0.001) return;
        drawSprites(ctx, [{ s: props.bubble, ax: BUBBLE.x, ay: BUBBLE.y, x: BUBBLE.x, y: BUBBLE.y, sx: k, sy: k, alpha: smoothstep(0, 0.2, k) }], env.shadow);
        const e = popSpring(clamp((t - 8.0) / POP));
        if (e > 0.001) drawSprites(ctx, [{ s: props.emblem, ax: BUBBLE.x, ay: BUBBLE.y, x: BUBBLE.x, y: BUBBLE.y + 30 * (1 - e), sx: e, sy: e, alpha: smoothstep(0, 0.25, e) }], { ...env.shadow, dx: 3, dy: 6 });
      } });
      S.add({ name: 'lead', z: 1060, shadow: { dx: 6, dy: 12 }, render(ctx, t, env) {
        const k = prog(t, 6.9, 7.7, E.outSoft);
        if (k <= 0.001) return;
        ctx.save();
        const p = new Path2D(); p.rect(1150, 280, 30 + 240 * k, 300); ctx.clip(p);
        drawSprites(ctx, [{ s: props.lead }], env.shadow);
        ctx.restore();
      } });

      // the plumes ride with the halves and stir about their quills
      S.add({ name: 'plumes', z: 1045, shadow: { dx: 8, dy: 16, alpha: 0.4 }, render(ctx, t, env) {
        const o = OPEN * open(t);
        drawSprites(ctx, [
          { s: fig.plumes.left, ax: CX - 60, ay: 420, x: CX - 60 - o, y: 420, rot: 0.035 * osc(t, 4.1) - 0.02 },
          { s: fig.plumes.right, ax: CX + 60, ay: 420, x: CX + 60 + o, y: 420, rot: 0.035 * osc(t, 4.4, 0.35) + 0.02 },
        ], env.shadow);
      } });

      // the spine, behind the halves
      S.add({ name: 'spine', z: 1022, shadow: { dx: 7, dy: 13, alpha: 0.46 }, render(ctx, t, env) {
        const r = prog(t, 2.6, 3.4, E.outSoft);
        if (r > 0.001) drawSprites(ctx, [{ s: spine.rod, ax: CX, ay: 1010, x: CX, y: 1010, sy: r }], env.shadow);
        const items = [];
        spine.orn.forEach((o, i) => {
          const x = (t - (LAND0 + i * LAND_STEP)) / POP;
          if (x <= 0) return;
          const k = popSpring(clamp(x));
          items.push({ s: o.s, ax: CX, ay: o.y, x: CX, y: o.y - 46 * (1 - E.outSoft(clamp(x * 1.4))), sx: k, sy: k, alpha: smoothstep(0, 0.18, x) });
        });
        drawSprites(ctx, items, env.shadow);
      } });
      // the eyes in the spine and the bubble wake with a soft blue light, then breathe
      S.add({ name: 'eye-light', z: 1020, blend: 'lighter', render(ctx, t) {
        const eyes = [[CX, 810, LAND0 + 3 * LAND_STEP], [CX, 546, LAND0 + 7 * LAND_STEP], [BUBBLE.x, BUBBLE.y, 8.0]];
        for (const [x, y, t0] of eyes) {
          const k = smoothstep(t0 + 0.4, t0 + 1.2, t) * (0.85 + 0.15 * osc(t, 3.2, x * 0.001));
          if (k > 0.01) glow(ctx, x, y, 70, '#bfe2ff', 0.32 * k);
        }
      } });

      // the halves
      S.add({ name: 'figure', z: 1000, shadow: { dx: 10, dy: 17, alpha: 0.5 }, render(ctx, t, env) {
        const o = OPEN * open(t), lean = 0.012 * open(t);
        drawSprites(ctx, [
          { s: fig.halves.left, ax: CX, ay: 1000, x: CX - o, y: 1000, rot: -lean },
          { s: fig.halves.right, ax: CX, ay: 1000, x: CX + o, y: 1000, rot: lean },
        ], env.shadow);
      } });

      S.add({ name: 'floor', z: 790, shadow: { dx: 6, dy: 10, alpha: 0.5 }, sprites: [{ s: props.floorL }, { s: props.floorR }] });
      addFrame(S);
    },
  });
}

// ---------------- the page hooks our renderers use ----------------
const params = new URLSearchParams(location.search);
const OUT_W = parseInt(params.get('w') || '1280', 10);
const cv = document.getElementById('c');
cv.width = OUT_W; cv.height = Math.round(OUT_W * 9 / 16);
const ctx = cv.getContext('2d');
const S = scene();
S.build();

function frame(t) {
  S.render(ctx, t);
  finish(ctx, { ...S.post, frame: Math.round(t * 24) });
}

window.__frameJPEG = (t, q = 0.93) => { frame(t); return cv.toDataURL('image/jpeg', q); };
window.__ready = Promise.resolve(true);
window.FILM = { DURATION, frame, scene: S, BACK };
if (!params.has('offline')) {
  const t0 = performance.now(), start = parseFloat(params.get('t') || 0);
  (function loop() { frame((start + (performance.now() - t0) / 1000) % DURATION); requestAnimationFrame(loop); })();
}

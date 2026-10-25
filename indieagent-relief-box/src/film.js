// Relief box, the film: 11 s at 24 fps, one shadowbox at dawn. Every frame is a pure function of t.
//   0.0 - 6.0   a sun made of a wheel of lit windows rises from behind the ranges and turns; the box warms from
//               a cool half-dark to full light as it climbs
//   2.4 - 9.4   a train of seven beads rolls out of a porthole in the left wall, along the butter piping, and
//               into a porthole in the right wall
//   4.0 - 7.4   the ruffle trees bloom, rosette by rosette, as the light reaches them
//   all through the islands drift and bob, the garland swings, the camera trucks right across the box and
//               pushes in a little, so every plane slides past at its own depth
//   9.4 - 11    hold
// Built on Leon Lin's paper-fox core (vendor/paper-fox, MIT, Copyright (c) 2026 Leonxlnx): the Scene, its planes
// and camera, paper baking, drop shadows and the film finish are paper-fox's, unchanged.

import { Scene, layerMatrix } from '../vendor/paper-fox/core/stage.js';
import { drawSprites } from '../vendor/paper-fox/core/sprite.js';
import { glow, radial } from '../vendor/paper-fox/core/piece.js';
import { finish } from '../vendor/paper-fox/core/post.js';
import { mix, rgba } from '../vendor/paper-fox/core/color.js';
import { along } from '../vendor/paper-fox/core/geom.js';
import { E, prog, osc, clamp, lerp, smoothstep } from '../vendor/paper-fox/core/ease.js';
import { noise } from '../vendor/paper-fox/core/rng.js';
import { LIGHT } from './kit.js';
import { addBackWall, addInnerWalls, addFrame, addBoxLight } from './box.js';
import { SUN, ISLAND, CITY, addProps } from './props.js';
import { TRACK, addDensity } from './density.js';

const DURATION = 11;
const popSpring = (x) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-5.2 * x) * Math.cos(x * 8.2);
const sunY = (t) => lerp(1010, 318, E.outSoft(prog(t, 0.2, 6.2, E.smooth)));
const dawn = (t) => smoothstep(0.4, 6.6, t);

// the track's length, and where a bead is after s px along it, riding on top of the piping
const TRACK_LEN = TRACK.path.reduce((a, p, i) => i ? a + Math.hypot(p[0] - TRACK.path[i - 1][0], p[1] - TRACK.path[i - 1][1]) : 0, 0);
const TRAIN0 = 2.4, SPEED = 260, GAP = 34, RAMP = 0.35;
const trainS = (t) => { const u = t - TRAIN0; return u <= 0 ? 0 : SPEED * (u - RAMP + RAMP * Math.exp(-u / RAMP)); };

function scene() {
  return new Scene({
    id: 'relief-box',
    duration: DURATION,
    background: '#3b2c2a',
    light: LIGHT,
    shadow: { alpha: 0.48, dist: 10, blur: 11 },
    post: { bloom: 0.18, threshold: 0.78, vignette: 0.18, grain: 0.045 },
    camera: (t) => {
      const k = E.cam(t / DURATION);
      return { x: lerp(-120, 110, k) + 4 * noise('cam').n1(t * 0.21), y: lerp(-8, 10, k) + 3 * noise('cam').n1(t * 0.17 + 9), z: 70 * E.dolly(t / DURATION), roll: 0.0016 * osc(t, 9.5) };
    },
    build(S) {
      addBackWall(S);
      addInnerWalls(S);
      addBoxLight(S);
      const props = addProps(S);

      // the sun, behind the ranges: it climbs, turns, and lights the back wall around it
      S.add({ name: 'sun-glow', z: SUN.z + 5, blend: 'lighter', render(ctx, t) {
        const y = sunY(t), k = dawn(t);
        glow(ctx, SUN.x, y, 620, '#ffd9a0', 0.22 * k);
        glow(ctx, SUN.x, y, 260, '#fff0c8', 0.3 * k);
      } });
      S.add({ name: 'sun', z: SUN.z, shadow: { dx: 6, dy: 12, alpha: 0.35 }, render(ctx, t, env) {
        drawSprites(ctx, [{ s: props.sun, ax: SUN.x, ay: 0, x: SUN.x, y: sunY(t), rot: 0.05 * t }], env.shadow);
      } });

      const D = addDensity(S);

      S.add({ name: 'city', z: CITY.z, shadow: { dx: 10, dy: 22, alpha: 0.4 }, sprites: [{ s: props.city }], anim: (t) => ({ x: 10 * osc(t, 9, 0.3), y: 6 * osc(t, 6.4, 0.6) }) });
      S.add({ name: 'island', z: ISLAND.z, shadow: { dx: 10, dy: 22, alpha: 0.42 }, sprites: [{ s: props.island }], anim: (t) => ({ x: -14 * osc(t, 10, 0.1), y: 7 * osc(t, 5.6, 0.2), rot: 0.006 * osc(t, 7.3), ox: ISLAND.x, oy: ISLAND.y }) });

      // the rosettes open as the light reaches them, farthest from the sun last
      const order = D.rosettes.map((r, i) => ({ r, d: Math.hypot(r.x - SUN.x, r.y - 320), i })).sort((a, b) => a.d - b.d);
      S.add({ name: 'bloom', z: 1145, shadow: { dx: 8, dy: 14, alpha: 0.44 }, render(ctx, t, env) {
        drawSprites(ctx, order.map(({ r }, j) => {
          const x = (t - (4.0 + j * 0.38)) / 0.9, k = popSpring(clamp(x));
          return { s: r.s, ax: r.x, ay: r.y, x: r.x, y: r.y, sx: 0.2 + 0.8 * k, sy: 0.2 + 0.8 * k, rot: -0.6 * (1 - k), alpha: smoothstep(0, 0.12, x) };
        }).filter((it) => it.alpha > 0), env.shadow);
      } });

      // the piping and the bead train
      S.add({ name: 'track', z: TRACK.z, shadow: { dx: 8, dy: 14, alpha: 0.44 }, render(ctx, t, env) {
        drawSprites(ctx, [{ s: D.track }], env.shadow);
        const s0 = trainS(t), items = [];
        D.beads.forEach((b, i) => {
          const s = s0 - i * GAP;
          if (s <= 0 || s >= TRACK_LEN) return;
          const { p, ang } = along(TRACK.path, s / TRACK_LEN), d = TRACK.w + 13;
          items.push({ s: b, x: p[0] + Math.sin(ang) * d, y: p[1] - Math.cos(ang) * d, rot: s / 14, alpha: smoothstep(0, 26, s) * smoothstep(TRACK_LEN, TRACK_LEN - 26, s) });
        });
        drawSprites(ctx, items, { ...env.shadow, dx: 4, dy: 7 });
      } });

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
  // the light arc: a cool half-dark that lifts as the sun climbs, opening first around the sun
  const k = dawn(t), dark = 0.5 * (1 - k);
  if (dark > 0.004) {
    const m = layerMatrix(S.camera(t), SUN.z, cv.width / 1920), sx = m.a * SUN.x + m.e, sy = m.d * sunY(t) + m.f;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = radial(ctx, sx, sy, cv.width * 0.05, cv.width * 0.75, [rgba('#1c1a3a', dark * 0.25), rgba('#1c1a3a', dark)]);
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.restore();
  }
  finish(ctx, { ...S.post, frame: Math.round(t * 24), grade: { color: mix('#9fb0e0', '#ffd2a8', k), amount: 0.12, mode: 'soft-light' } });
}

window.__frameJPEG = (t, q = 0.93) => { frame(t); return cv.toDataURL('image/jpeg', q); };
window.__ready = Promise.resolve(true);
window.FILM = { DURATION, frame, scene: S, TRACK_LEN };
if (!params.has('offline')) {
  const t0 = performance.now(), start = parseFloat(params.get('t') || 0);
  (function loop() { frame((start + (performance.now() - t0) / 1000) % DURATION); requestAnimationFrame(loop); })();
}

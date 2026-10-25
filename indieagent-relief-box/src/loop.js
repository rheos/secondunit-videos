// The living loop (draft 2): a seamless 12 s loop at 24 fps in the approved relief-box clay language, an open
// world on the honeycomb backdrop. In the middle a funnel feeds itself: what gathers in its mouth runs out of a
// duct at the bottom, right, up past the lip, left, and drops back in. Around it four small figures do quiet,
// unexplained work: one plays a console of knobs and a lever, one tunes a ring instrument, and two practise
// mudras, calling geometric solids into being between their hands and letting them go into the world.
// Every motion is periodic in 12 s (or a divisor of it), so frame 288 is frame 0.
// Built on Leon Lin's paper-fox core (vendor/paper-fox, MIT, Copyright (c) 2026 Leonxlnx).

import { Scene } from '../vendor/paper-fox/core/stage.js';
import { drawSprites } from '../vendor/paper-fox/core/sprite.js';
import { finish } from '../vendor/paper-fox/core/post.js';
import { E, lerp, smoothstep } from '../vendor/paper-fox/core/ease.js';
import { LIGHT, PAL } from './kit.js';
import { ISLAND } from './props.js';
import { LOOP, cyc, addWorld, addNear } from './loop-world.js';
import { CONSOLE, INSTR, knobAngle, leverAngle, sliderK, addMachines } from './loop-machine.js';
import { drawSolid } from './loop-shapes.js';
import { makeFigure, drawFigure } from './loop-figures.js';

// the figures stand a little taller than draft 1's so their hands read, still small against the funnel
const P = PAL, TAU = Math.PI * 2, GROUND = 985, FS = 1.2, HIP = GROUND - 33 * FS;
const mod = (x, m) => ((x % m) + m) % m;
const mixPt = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

// keyframed hands: keys are [time, back hand, front hand]; eased between, held after the last key
function keyed(q, keys) {
  if (q <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, a0, b0] = keys[i], [t1, a1, b1] = keys[i + 1];
    if (q < t1) { const k = E.smooth((q - t0) / (t1 - t0)); return [mixPt(a0, a1, k), mixPt(b0, b1, k)]; }
  }
  const last = keys[keys.length - 1];
  return [last[1], last[2]];
}

// ---------------- the console operator, behind the desk ----------------
function operatorPose(t) {
  const q = mod(t, 3), x = 566;
  const k1 = CONSOLE.knobs[0], k2 = CONSOLE.knobs[1], la = leverAngle(t), lev = [CONSOLE.lever[0] + Math.sin(la) * 22, CONSOLE.lever[1] - Math.cos(la) * 22];
  const a1 = knobAngle(t, 0), knobHand = [k1[0] + Math.sin(a1) * 3, k1[1] - 4];
  if (q < 1.4) return { hip: [x, HIP], feet: [[x + 6, GROUND], [x - 7, GROUND]], facing: -1, scale: FS, lean: 0.14, headTilt: 0.15, hands: [[k2[0] + 2, k2[1] - 4], knobHand] };
  if (q < 2.4) { const k = smoothstep(1.4, 1.6, q); return { hip: [x, HIP], feet: [[x - 6, GROUND], [x + 7, GROUND]], facing: 1, scale: FS, lean: 0.12, headTilt: 0.1, hands: [mixPt([x - 4, 912], [x + 8, 906], k), mixPt([x + 20, 905], lev, k)] }; }
  const [sx, sy] = CONSOLE.screen, k = smoothstep(2.4, 2.6, q) * (1 - smoothstep(2.85, 3.0, q));
  return { hip: [x, HIP], feet: [[x - 6, GROUND], [x + 7, GROUND]], facing: 1, scale: FS, lean: 0.06, headTilt: -0.1, hands: [mixPt([x + 8, 906], [sx - 10, sy - 6 + 3 * Math.sin(TAU * q * 2)], k), mixPt(lev, [sx + 10, sy - 8 + 3 * Math.cos(TAU * q * 2)], k)] };
}

// ---------------- the instrument tuner ----------------
function tunerPose(t) {
  const x = 1404, [a, b] = INSTR.slider, sl = [lerp(a[0], b[0], sliderK(t)), a[1] - 2];
  const q = mod(t, 4), reach = smoothstep(2.0, 2.5, q) * (1 - smoothstep(3.0, 3.5, q));
  return { hip: [x, HIP], feet: [[x - 7, GROUND], [x + 7, GROUND]], facing: 1, scale: FS, lean: 0.1 + 0.04 * reach, headTilt: -0.35 * reach,
    hands: [mixPt([x + 14, 930], [INSTR.x - 22, INSTR.ringY + 20 + 4 * Math.sin(TAU * q)], reach), sl] };
}

// ---------------- the mudra: a 6 s practice that makes one solid ----------------
//   0.0-0.8 rest, 0.8-1.8 palms meet at the chest, 1.8-2.4 lifted overhead, 2.4-3.6 parted into a frame while the
//   solid forms between them, 3.6-4.4 arms open and it is let go, 4.4-6.0 hands come down, head follows it up
function mudraHands(c, x, f, hip) {
  const k = FS, rest = [[x - f * 7 * k, hip + 4 * k], [x + f * 9 * k, hip + 4 * k]], chest = [[x + f * 6 * k, hip - 22 * k], [x + f * 9 * k, hip - 23 * k]];
  const over = [[x + f * k, hip - 72 * k], [x + f * 5 * k, hip - 73 * k]], frame = [[x + (-13 + f * 3) * k, hip - 68 * k], [x + (13 + f * 3) * k, hip - 69 * k]], open = [[x - 32 * k, hip - 58 * k], [x + 32 * k, hip - 59 * k]];
  const sw = (pair) => (f > 0 ? pair : [pair[1], pair[0]]);
  return keyed(c, [[0, ...rest], [0.8, ...rest], [1.8, ...chest], [2.4, ...over], [2.9, ...sw(frame)], [3.6, ...sw(frame)], [4.4, ...open], [5.4, ...rest]]);
}
function mudraPose(t, phase, x, f, hip, feet) {
  const c = mod(t - phase, 6), up = smoothstep(1.8, 2.4, c) * (1 - smoothstep(4.4, 5.4, c));
  return { hip: [x, hip], feet, facing: f, scale: FS, lean: -0.08 * up, headTilt: -0.35 * up - 0.25 * smoothstep(3.6, 4.4, c) * (1 - smoothstep(5.4, 6, c)), hands: mudraHands(c, x, f, hip) };
}
// the solids each practitioner has made: born at 2.4 of each cycle, let go at 3.6, gone by 10.5 s after birth
function mudraSolids(ctx, t, phase, x, f, hip, kinds, colors, drift) {
  for (let j = 0; j < 2; j++) {
    const born = phase + 2.4 + 6 * j, u = mod(t - born, LOOP);
    if (u >= 10.5) continue;
    const at = [x + f * 3 * FS, hip - 96 * FS], grow = E.outSoft(smoothstep(0, 1.2, u)), f2 = smoothstep(1.2, 10.5, u);
    const px = at[0] + drift * (170 * f2 + 26 * Math.sin(f2 * 5)), py = at[1] - 600 * E.outSoft(f2);
    drawSolid(ctx, kinds[j], px, py, 24 * grow * (1 - 0.4 * f2), [TAU * t / 6 + j, TAU * t / 4, 0.3 * j], colors[j], { glowK: smoothstep(0, 0.6, u) * (1 - smoothstep(1.2, 3.0, u)), alpha: 1 - smoothstep(0.82, 1, f2) });
    // the light between the hands while it forms
    if (u < 1.2) drawSolid(ctx, 'ring', at[0], at[1], 30 * grow, [TAU * t / 2, 0, TAU * t / 3], '#fff1c8', { alpha: 0.5 * (1 - u / 1.2) });
  }
}

function scene() {
  return new Scene({
    id: 'relief-loop',
    duration: LOOP,
    background: '#f6e4d8',
    light: LIGHT,
    shadow: { alpha: 0.42, dist: 10, blur: 16 },
    post: { bloom: 0.22, threshold: 0.74, bloomRadius: 1.4, vignette: 0.16, grain: 0.035, grade: { color: '#ffd8b4', amount: 0.08, mode: 'soft-light' } },
    camera: (t) => ({ x: 50 * cyc(t, 1), y: 6 * cyc(t, 1, 0.21), z: 30 + 20 * cyc(t, 1, 0.1), roll: 0.0012 * cyc(t, 1, 0.4) }),
    build(S) {
      const world = addWorld(S);
      addMachines(S);
      addNear(S);
      const operator = makeFigure(S, { name: 'operator', color: P.pink, cap: 'pom' });
      const tuner = makeFigure(S, { name: 'tuner', color: P.lilac, cap: P.butter });
      const adept = makeFigure(S, { name: 'adept', color: P.mint, cap: P.pink });
      const seer = makeFigure(S, { name: 'seer', color: P.butter, cap: P.mintDeep });

      // the operator stands behind the console, so it draws before the desk
      S.add({ name: 'operator', z: 995, render(ctx, t, env) { drawFigure(ctx, operator, operatorPose(t), env); } });
      S.add({ name: 'figures', z: 985, render(ctx, t, env) {
        drawFigure(ctx, tuner, tunerPose(t), env);
        const x = 1700;
        drawFigure(ctx, adept, mudraPose(t, 0, x, -1, HIP, [[x + 7, GROUND], [x - 8, GROUND]]), env);
        mudraSolids(ctx, t, 0, x, -1, HIP, ['tetra', 'ico'], [P.pink, P.butter], -1);
      } });

      // the seer sits on the floating island, practising the same mudra three seconds behind the adept
      const IX = -120, IY = 90;
      S.add({ name: 'island', z: 1500, shadow: { dx: 10, dy: 22, alpha: 0.32 }, anim: (t) => ({ y: 8 * cyc(t, 1, 0.55), rot: 0.008 * cyc(t, 1, 0.8), ox: ISLAND.x + IX, oy: ISLAND.y + IY }), render(ctx, t, env) {
        drawSprites(ctx, [{ s: world.island, ax: ISLAND.x, ay: ISLAND.y, x: ISLAND.x + IX, y: ISLAND.y + IY }], env.shadow);
        const ground = ISLAND.y - 4 + IY, x = 300, hip = ground - 14 * FS;
        drawFigure(ctx, seer, mudraPose(t, 3, x, 1, hip, [[x + 16, ground + 4], [x + 22, ground + 6]]), env);
        mudraSolids(ctx, t, 3, x, 1, hip, ['star', 'octa'], [P.lilac, P.aqua], 1);
      } });
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
  t = mod(t, LOOP);
  S.render(ctx, t);
  finish(ctx, { ...S.post, frame: Math.round(t * 24) });
}

window.__frameJPEG = (t, q = 0.93) => { frame(t); return cv.toDataURL('image/jpeg', q); };
window.__framePNG = (t) => { frame(t); return cv.toDataURL('image/png'); };
window.__ready = Promise.resolve(true);
window.FILM = { DURATION: LOOP, frame, scene: S };
if (!params.has('offline')) {
  const t0 = performance.now(), start = parseFloat(params.get('t') || 0);
  (function loop() { frame(start + (performance.now() - t0) / 1000); requestAnimationFrame(loop); })();
}

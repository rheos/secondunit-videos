// The living loop: a seamless 12 s loop at 24 fps in the approved relief-box clay language, as an open world.
// A recycle-symbol sculpture feeds back into itself, and a wider system around it does the same: beads leave the
// sculpture, roll to a tree, the tree blooms, a small figure loads the bloom onto a lift, the lift pours it back
// in. A second figure turns the crank that drives the sculpture; a third watches the sun through a telescope from
// a floating island. Every motion is periodic in 12 s (or a divisor of it), so frame 288 is frame 0.
// Built on Leon Lin's paper-fox core (vendor/paper-fox, MIT, Copyright (c) 2026 Leonxlnx).

import { Scene } from '../vendor/paper-fox/core/stage.js';
import { drawSprites } from '../vendor/paper-fox/core/sprite.js';
import { finish } from '../vendor/paper-fox/core/post.js';
import { mix } from '../vendor/paper-fox/core/color.js';
import { E, lerp, smoothstep } from '../vendor/paper-fox/core/ease.js';
import { LIGHT, PAL } from './kit.js';
import { ISLAND } from './props.js';
import { LOOP, cyc, addWorld, addNear } from './loop-world.js';
import { SLOTS, LOAD_AT, CRANK, crankAngle, addMachine } from './loop-machine.js';
import { makeFigure, drawFigure } from './loop-figures.js';

const P = PAL, TAU = Math.PI * 2, GROUND = 985, HIP = GROUND - 33;
const mod = (x, m) => ((x % m) + m) % m;

// a walking stance at x: feet swing about the hip, the hip bobs; d is the distance walked so far
function walk(x, d, facing, scale = 1) {
  const stride = 26 * scale, ph = d / stride * Math.PI;
  const feet = [0, 1].map((k) => { const a = ph + k * Math.PI; return [x + facing * Math.sin(a) * stride * 0.5, GROUND - Math.max(0, Math.cos(a)) * 6]; });
  return { hip: [x, HIP - 1.5 * Math.abs(Math.sin(ph))], feet };
}
const stand = (x, facing) => ({ hip: [x, HIP], feet: [[x - facing * 6, GROUND], [x + facing * 7, GROUND]] });

// ---------------- the picker: picks a bloom, carries it to the lift, loads it, walks back (every 4 s) --------------
const X_HOME = 1528, X_LOAD = LOAD_AT[0] + 34;
function pickerPose(t, blooms) {
  const q = mod(t, 4), i = mod(Math.round((t - q + 2 - 6) / 4), 3);
  const chest = (x, f, h) => [x + f * 13, h - 22];
  let pose, carry = null;
  if (q < 1) {                                  // walking back to the tree
    const k = E.smooth(q), x = lerp(X_LOAD, X_HOME, k);
    pose = { ...walk(x, Math.abs(x - X_LOAD), 1), facing: 1, lean: 0.06 };
    pose.hands = [[x - 8, HIP + 2], [x + 10, HIP + 4]];
  } else if (q < 2) {                           // waiting under the tree, looking up at it
    pose = { ...stand(X_HOME, 1), facing: 1, lean: -0.02 + 0.02 * Math.sin(TAU * q), headTilt: -0.3 };
    pose.hands = [[X_HOME - 9, HIP + 6], [X_HOME + 9, HIP + 6]];
  } else if (q < 2.6) {                         // reaching up into the tree for the bloom, then drawing it in
    const s = SLOTS[i], reach = smoothstep(2.0, 2.32, q) * (1 - smoothstep(2.42, 2.6, q));
    pose = { ...stand(X_HOME, 1), facing: 1, lean: 0.12 * reach, headTilt: -0.45 * reach };
    pose.hip[1] -= 3 * reach;
    const c = chest(X_HOME, 1, pose.hip[1]);
    pose.hands = [[lerp(X_HOME - 6, c[0] - 3, smoothstep(2.4, 2.6, q)), lerp(HIP + 6, c[1], smoothstep(2.4, 2.6, q))], [lerp(c[0], s[0], reach), lerp(c[1], s[1], reach)]];
    if (q >= 2.4) carry = pose.hands[1];
  } else if (q < 3.6) {                         // carrying it to the lift
    const k = E.smooth(q - 2.6), x = lerp(X_HOME, X_LOAD, k);
    pose = { ...walk(x, Math.abs(x - X_HOME), -1), facing: -1, lean: 0.05 };
    const c = chest(x, -1, pose.hip[1]);
    pose.hands = [[c[0] + 5, c[1] + 2], [c[0] - 2, c[1] - 1]];
    carry = [c[0] - 4, c[1] - 6];
  } else {                                      // setting it in the bucket as the bucket arrives
    const k = smoothstep(3.6, 3.95, q);
    pose = { ...stand(X_LOAD, -1), facing: -1, lean: 0.14 * k };
    const c = chest(X_LOAD, -1, HIP), b = [LOAD_AT[0], LOAD_AT[1] - 10];
    pose.hands = [[lerp(c[0] + 5, b[0] + 8, k), lerp(c[1] + 2, b[1] + 2, k)], [lerp(c[0] - 2, b[0] - 2, k), lerp(c[1] - 1, b[1] - 3, k)]];
    carry = [lerp(c[0] - 4, b[0], k), lerp(c[1] - 6, b[1] - 6, k)];
  }
  if (carry) pose.carry = (ctx, env, hands) => { const h = hands[1]; drawSprites(ctx, [{ s: blooms[i], ax: SLOTS[i][0], ay: SLOTS[i][1], x: h[0] - 2, y: h[1] - 8, sx: 0.5, sy: 0.5 }], { ...env.shadow, dx: 3, dy: 5 }); };
  return pose;
}

// ---------------- the cranker: both hands on the handle, the body rocking with each turn ----------------
function crankerPose(t) {
  const a = crankAngle(t), h = [CRANK.c[0] + Math.cos(a) * CRANK.r, CRANK.c[1] + Math.sin(a) * CRANK.r], x = CRANK.c[0] - 26;
  return { hip: [x + 2 * Math.cos(a), HIP + 1.5 * Math.sin(a)], feet: [[x - 10, GROUND], [x + 9, GROUND]], facing: 1, lean: 0.16 + 0.07 * Math.cos(a), hands: [[h[0] - 2, h[1] + 1], [h[0] + 2, h[1] - 1]] };
}

function scene() {
  return new Scene({
    id: 'relief-loop',
    duration: LOOP,
    background: '#f6e4d8',
    light: LIGHT,
    shadow: { alpha: 0.42, dist: 10, blur: 16 },
    post: { bloom: 0.22, threshold: 0.74, bloomRadius: 1.4, vignette: 0.16, grain: 0.035, grade: { color: '#ffd8b4', amount: 0.08, mode: 'soft-light' } },
    camera: (t) => ({ x: 60 * cyc(t, 1), y: 6 * cyc(t, 1, 0.21), z: 25 + 25 * cyc(t, 1, 0.1), roll: 0.0012 * cyc(t, 1, 0.4) }),
    build(S) {
      const world = addWorld(S);
      const M = addMachine(S);
      addNear(S);
      const picker = makeFigure(S, { name: 'picker', color: P.mint, cap: P.pink });
      const cranker = makeFigure(S, { name: 'cranker', color: P.pink, cap: 'pom' });
      const watcher = makeFigure(S, { name: 'watcher', color: P.butter, cap: P.mintDeep });

      S.add({ name: 'figures', z: 985, render(ctx, t, env) {
        const pp = pickerPose(t, M.blooms), carry = pp.carry;
        drawFigure(ctx, cranker, crankerPose(t), env);
        drawFigure(ctx, picker, { ...pp, carry: carry ? (hands) => carry(ctx, env, hands) : null }, env);
      } });

      // the island with the watcher on it, telescope to the sun; halfway through the loop the watcher lowers it
      // and points at the machine, then goes back to the sun
      const IX = -120, IY = 90;
      S.add({ name: 'island', z: 1500, shadow: { dx: 10, dy: 22, alpha: 0.32 }, anim: (t) => ({ y: 8 * cyc(t, 1, 0.55), rot: 0.008 * cyc(t, 1, 0.8), ox: ISLAND.x + IX, oy: ISLAND.y + IY }), render(ctx, t, env) {
        drawSprites(ctx, [{ s: world.island, ax: ISLAND.x, ay: ISLAND.y, x: ISLAND.x + IX, y: ISLAND.y + IY }], env.shadow);
        const ground = ISLAND.y - 4 + IY, x = 282, look = smoothstep(4.8, 5.6, t) * (1 - smoothstep(8.2, 9.0, t));
        // tripod and telescope tube
        ctx.save(); ctx.lineCap = 'round';
        for (const dx of [-8, 8]) { ctx.strokeStyle = P.slateDeep; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(x + 30, ground - 26); ctx.lineTo(x + 30 + dx, ground); ctx.stroke(); }
        const tilt = -0.42 + 0.03 * cyc(t, 2);
        const t0 = [x + 30 - Math.cos(tilt) * 16, ground - 26 - Math.sin(tilt) * 16], t1 = [x + 30 + Math.cos(tilt) * 30, ground - 26 + Math.sin(tilt) * 30];
        ctx.strokeStyle = mix(P.butterDeep, P.slate, 0.3); ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(...t0); ctx.lineTo(...t1); ctx.stroke();
        ctx.strokeStyle = P.butter; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(...t0); ctx.lineTo(...t1); ctx.stroke();
        ctx.restore();
        const sitHip = [x, ground - 14];
        drawFigure(ctx, watcher, {
          hip: sitHip, feet: [[x + 14, ground + 6], [x + 20, ground + 8]], facing: 1, lean: lerp(0.3, -0.05, look), headTilt: lerp(-0.25, 0.15, look),
          hands: [[lerp(t0[0] + 2, x + 8, look), lerp(t0[1] + 4, ground - 4, look)], [lerp(t0[0] + 14, x + 34, look), lerp(t0[1] - 2, ground - 30 + 6 * Math.sin(TAU * t), look)]], scale: 0.95,
        }, env);
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

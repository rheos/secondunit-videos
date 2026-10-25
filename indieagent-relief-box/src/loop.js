// The living loop (draft 4): a seamless 12 s loop at 24 fps in the approved relief-box clay language, an open
// world on the honeycomb backdrop. In the middle a funnel feeds itself: what gathers in its mouth runs out of a
// duct at the bottom, right, up past the lip, left, and drops back in. Around it four small figures do quiet,
// unexplained work: one plays a console of knobs and a lever, one tunes a ring instrument, and two cast: a hand
// traces a precise sigil of light in the air, the sigil folds down into a geometric solid, and they let it go.
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

// ---------------- the casting: a 6 s spell that makes one solid ----------------
//   0.0-0.4 rest, 0.4-0.7 the leading hand rises to the sigil's first point, 0.7-2.7 it traces the sigil in the air
//   (a circle, a ring of ticks, then the solid's own figure inside), leaving a line of light, while the other hand
//   turns small steady circles at the chest; 2.7-3.3 both hands push in, the sigil spins down to its centre and the
//   solid forms there; 3.3-3.9 arms open and it is let go; 3.9-6.0 hands come down, the head follows it up.
const T_TRACE = [0.7, 2.7], T_FORM = [2.7, 3.3], T_OPEN = [3.3, 3.9];
const poly = (n, rot = -Math.PI / 2, r = 1) => [...Array(n + 1)].map((_, i) => [Math.cos(rot + i / n * TAU) * r, Math.sin(rot + i / n * TAU) * r]);
const star = (n, step) => [...Array(n + 1)].map((_, i) => { const a = -Math.PI / 2 + (i * step % n) / n * TAU; return [Math.cos(a), Math.sin(a)]; });
// each sigil is a list of strokes in unit coordinates; the circle comes first, then the figure for the solid
const SIGILS = {
  tetra: [poly(48, -Math.PI / 2), poly(3, -Math.PI / 2, 0.86)],
  ico: [poly(48, -Math.PI / 2), star(5, 2).map(([x, y]) => [x * 0.86, y * 0.86])],
  star: [poly(48, -Math.PI / 2), poly(3, -Math.PI / 2, 0.86), poly(3, Math.PI / 2, 0.86)],
  octa: [poly(48, -Math.PI / 2), poly(4, -Math.PI / 2, 0.86), poly(48, -Math.PI / 2, 0.42)],
};
const slen = (pl) => pl.reduce((a, p, i) => i ? a + Math.hypot(p[0] - pl[i - 1][0], p[1] - pl[i - 1][1]) : 0, 0);
// where the pen is after fraction k of the whole sigil (pen-up hops between strokes count as short moves)
function sigilAt(kind, k) {
  const strokes = SIGILS[kind], lens = strokes.map(slen), hop = 0.4, total = lens.reduce((a, b) => a + b, 0) + hop * (strokes.length - 1);
  let d = k * total;
  for (let i = 0; i < strokes.length; i++) {
    if (d <= lens[i]) { const pl = strokes[i]; for (let j = 1; j < pl.length; j++) { const seg = Math.hypot(pl[j][0] - pl[j - 1][0], pl[j][1] - pl[j - 1][1]); if (d <= seg) return { p: mixPt(pl[j - 1], pl[j], d / seg), stroke: i, d: null }; d -= seg; } return { p: pl[pl.length - 1], stroke: i }; }
    d -= lens[i];
    if (i < strokes.length - 1) { if (d <= hop) return { p: mixPt(strokes[i][strokes[i].length - 1], strokes[i + 1][0], d / hop), stroke: i + 0.5 }; d -= hop; }
  }
  const last = strokes[strokes.length - 1];
  return { p: last[last.length - 1], stroke: strokes.length };
}
const cycleOf = (t, phase) => { const L = mod(t - phase, LOOP); return { c: mod(L, 6), j: Math.floor(L / 6) }; };
// in front of the leading shoulder, clear of the face, every point of it within the hand's reach
const sigilCentre = (x, f, hip) => [x + f * 29 * FS, hip - 47 * FS];
const SR = 14 * FS;

function castPose(t, phase, x, f, hip, feet, kinds) {
  const { c, j } = cycleOf(t, phase), kind = kinds[j], C = sigilCentre(x, f, hip), k = FS;
  const rest = [[x - f * 7 * k, hip + 4 * k], [x + f * 9 * k, hip + 4 * k]];
  const lead = (kk) => { const p = sigilAt(kind, kk).p; return [C[0] + p[0] * SR, C[1] + p[1] * SR]; };
  const turn = [x + f * 6 * k + Math.cos(TAU * 2 * c) * 6 * k, hip - 26 * k + Math.sin(TAU * 2 * c) * 6 * k];
  let back = rest[0], front = rest[1];
  if (c < 0.4) { /* rest */ }
  else if (c < T_TRACE[0]) { const e = E.smooth((c - 0.4) / 0.3); front = mixPt(rest[1], lead(0), e); back = mixPt(rest[0], turn, e); }
  else if (c < T_TRACE[1]) { front = lead(E.smooth((c - T_TRACE[0]) / (T_TRACE[1] - T_TRACE[0]))); back = turn; }
  else if (c < T_FORM[1]) { const e = E.smooth((c - T_FORM[0]) / (T_FORM[1] - T_FORM[0])); front = mixPt(lead(1), [C[0] + f * 9 * k, C[1] + 4 * k], e); back = mixPt(turn, [C[0] - f * 9 * k, C[1] + 5 * k], e); }
  else if (c < T_OPEN[1]) { const e = E.outSoft((c - T_OPEN[0]) / (T_OPEN[1] - T_OPEN[0])); front = mixPt([C[0] + f * 9 * k, C[1] + 4 * k], [x + f * 32 * k, hip - 58 * k], e); back = mixPt([C[0] - f * 9 * k, C[1] + 5 * k], [x - f * 26 * k, hip - 54 * k], e); }
  else { const e = E.smooth((c - T_OPEN[1]) / 1.5); front = mixPt([x + f * 32 * k, hip - 58 * k], rest[1], e); back = mixPt([x - f * 26 * k, hip - 54 * k], rest[0], e); }
  const casting = smoothstep(0.4, 0.7, c) * (1 - smoothstep(T_OPEN[0], T_OPEN[1], c)), watch = smoothstep(T_OPEN[0], T_OPEN[1], c) * (1 - smoothstep(5.2, 6, c));
  return { hip: [x, hip], feet, facing: f, scale: FS, lean: 0.06 * casting - 0.06 * watch, headTilt: -0.1 * casting - 0.4 * watch, hands: f > 0 ? [back, front] : [back, front] };
}

// the line of light the hand leaves, then the sigil spinning down into the solid
function drawSigil(ctx, t, phase, x, f, hip, kinds) {
  const { c, j } = cycleOf(t, phase);
  if (c < T_TRACE[0] || c > T_FORM[1] + 0.05) return;
  const kind = kinds[j], C = sigilCentre(x, f, hip), drawn = c < T_TRACE[1] ? E.smooth((c - T_TRACE[0]) / (T_TRACE[1] - T_TRACE[0])) : 1;
  const fold = smoothstep(T_FORM[0], T_FORM[1], c), R = SR * (1 - 0.92 * E.in(fold)), spin = TAU * 0.6 * E.in(fold) * -f;
  const strokes = SIGILS[kind], lens = strokes.map(slen), total = lens.reduce((a, b) => a + b, 0) + 0.4 * (strokes.length - 1);
  let left = drawn * total;
  const P2 = ([u, v]) => { const cs = Math.cos(spin), sn = Math.sin(spin); return [C[0] + (u * cs - v * sn) * R, C[1] + (u * sn + v * cs) * R]; };
  const paths = [];
  strokes.forEach((pl, i) => {
    if (left <= 0) return;
    const out = [pl[0]];
    for (let q = 1; q < pl.length && left > 0; q++) { const seg = Math.hypot(pl[q][0] - pl[q - 1][0], pl[q][1] - pl[q - 1][1]); if (left >= seg) { out.push(pl[q]); left -= seg; } else { out.push(mixPt(pl[q - 1], pl[q], left / seg)); left = 0; } }
    paths.push(out.map(P2));
    left -= 0.4;
  });
  // the ring of ticks appears once the circle is closed
  const ticks = drawn * total > lens[0] ? smoothstep(lens[0], lens[0] + 0.6, drawn * total) : 0;
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const fade = 1 - smoothstep(0.6, 1, fold);
  const strokeAll = () => {
    for (const pth of paths) { ctx.beginPath(); pth.forEach(([px, py], q) => (q ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke(); }
    if (ticks > 0) for (let q = 0; q < 12; q++) {
      const a0 = q / 12 * TAU, p0 = P2([Math.cos(a0) * 1.14, Math.sin(a0) * 1.14]), p1 = P2([Math.cos(a0) * (1.14 + 0.2 * ticks), Math.sin(a0) * (1.14 + 0.2 * ticks)]);
      ctx.beginPath(); ctx.moveTo(...p0); ctx.lineTo(...p1); ctx.stroke();
    }
  };
  // a warm halo, then a saturated gold line, then a hot core: it has to read against a pale world
  ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ffc070'; ctx.globalAlpha = 0.3 * fade; ctx.lineWidth = 8 * FS; strokeAll();
  ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = '#e8932e'; ctx.globalAlpha = 0.95 * fade; ctx.lineWidth = 2.6 * FS * (1 - 0.4 * fold); strokeAll();
  ctx.strokeStyle = '#fff3d6'; ctx.globalAlpha = 0.9 * fade; ctx.lineWidth = 0.9 * FS; strokeAll();
  ctx.restore();
}

// the solids each caster has made: formed at the sigil's centre from 2.7, let go at 3.3, gone 10.5 s after forming
function castSolids(ctx, t, phase, x, f, hip, kinds, colors, drift) {
  for (let j = 0; j < 2; j++) {
    const born = phase + T_FORM[0] + 6 * j, u = mod(t - born, LOOP);
    if (u >= 10.5) continue;
    const at = sigilCentre(x, f, hip), grow = E.outSoft(smoothstep(0.1, 0.6, u)), f2 = smoothstep(0.6, 10.5, u);
    const px = at[0] + drift * (170 * f2 + 26 * Math.sin(f2 * 5)), py = at[1] - 600 * E.outSoft(f2);
    drawSolid(ctx, kinds[j], px, py, 24 * grow * (1 - 0.4 * f2), [TAU * t / 6 + j, TAU * t / 4, 0.3 * j], colors[j], { glowK: smoothstep(0, 0.4, u) * (1 - smoothstep(0.8, 2.8, u)), alpha: 1 - smoothstep(0.82, 1, f2) });
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
        const kinds = ['tetra', 'ico'];
        drawFigure(ctx, adept, castPose(t, 0, x, -1, HIP, [[x + 7, GROUND], [x - 8, GROUND]], kinds), env);
        drawSigil(ctx, t, 0, x, -1, HIP, kinds);
        castSolids(ctx, t, 0, x, -1, HIP, kinds, [P.pink, P.butter], -1);
      } });

      // the seer sits on the floating island, casting the same spell three seconds behind the adept
      const IX = -120, IY = 90;
      S.add({ name: 'island', z: 1500, shadow: { dx: 10, dy: 22, alpha: 0.32 }, anim: (t) => ({ y: 8 * cyc(t, 1, 0.55), rot: 0.008 * cyc(t, 1, 0.8), ox: ISLAND.x + IX, oy: ISLAND.y + IY }), render(ctx, t, env) {
        drawSprites(ctx, [{ s: world.island, ax: ISLAND.x, ay: ISLAND.y, x: ISLAND.x + IX, y: ISLAND.y + IY }], env.shadow);
        const ground = ISLAND.y - 4 + IY, x = 300, hip = ground - 14 * FS;
        const kinds = ['star', 'octa'];
        drawFigure(ctx, seer, castPose(t, 3, x, 1, hip, [[x + 16, ground + 4], [x + 22, ground + 6]], kinds), env);
        drawSigil(ctx, t, 3, x, 1, hip, kinds);
        castSolids(ctx, t, 3, x, 1, hip, kinds, [P.lilac, P.aqua], 1);
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

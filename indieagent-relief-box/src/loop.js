// The living loop (draft 6): a seamless 12 s loop at 24 fps in the approved relief-box clay language, inside a
// turning honeycomb dome. This is Robin's memory of the machine-elf space (research notes: RESEARCH-machine-elves.md).
// In the middle a faceted funnel feeds itself through a ringed pipe that swells as things pass. Around it small clay
// elves at play-work: one plays a console, one tunes a ring instrument, two sing shapes into being (a stream of
// glyphs leaves the mouth while the hands conduct; the sigil folds into a solid; they turn to us, hold it out, and
// let it go), a chorus at the funnel's foot bounces and cheers each offering, and now and then a head pops into a
// faceted ball. What they make and show is drawn in Mark Von Ulrich's saturated early-Mac pixel language.
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
import { makeFigure, drawFigure } from './loop-figures.js';
import { MK, MK_RAMP, PS, markLayer, paintMarkSolid, paintBurst, paintGlyph, paintLines } from './loop-mark.js';

// the figures stand a little taller than draft 1's so their hands read, still small against the funnel
const P = PAL, TAU = Math.PI * 2, GROUND = 985, FS = 1.2, HIP = GROUND - 33 * FS;
const mod = (x, m) => ((x % m) + m) % m;
const mixPt = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
// a bump that rises and falls over [a, b]: 0 outside, 1 at the middle
const bump = (t, a, b) => (t <= a || t >= b ? 0 : Math.sin(Math.PI * (t - a) / (b - a)));
// a bump on the loop's circle, so one that wraps past 12 s still closes the seam
const loopBump = (t, a, len) => bump(mod(t - a, LOOP), 0, len);
// hopping like a ball: how high the body is off the ground (the period divides the loop)
const hop = (t, period, ph, h) => h * Math.abs(Math.sin(TAU * (t / period + ph) / 2));

// ---------------- the console operator, behind the desk; every 6 s turns to us and beckons ----------------
function operatorPose(t) {
  const q = mod(t, 3), x = 566;
  const beckon = bump(mod(t, 6), 4.3, 5.7);
  if (beckon > 0) {
    const k = Math.min(1, beckon * 2.5), curl = Math.sin(TAU * 3 * mod(t, 6));
    return { hip: [x, HIP], feet: [[x - 6, GROUND], [x + 7, GROUND]], facing: 1, scale: FS, lean: 0, turn: k, headTilt: 0,
      hands: [[x - 10, HIP + 2], [x + 12, HIP - 34 - 4 * curl]] };
  }
  const k1 = CONSOLE.knobs[0], k2 = CONSOLE.knobs[1], la = leverAngle(t), lev = [CONSOLE.lever[0] + Math.sin(la) * 22, CONSOLE.lever[1] - Math.cos(la) * 22];
  const a1 = knobAngle(t, 0), knobHand = [k1[0] + Math.sin(a1) * 3, k1[1] - 4];
  if (q < 1.4) return { hip: [x, HIP], feet: [[x + 6, GROUND], [x - 7, GROUND]], facing: -1, scale: FS, lean: 0.14, headTilt: 0.15, hands: [[k2[0] + 2, k2[1] - 4], knobHand] };
  if (q < 2.4) { const k = smoothstep(1.4, 1.6, q); return { hip: [x, HIP], feet: [[x - 6, GROUND], [x + 7, GROUND]], facing: 1, scale: FS, lean: 0.12, headTilt: 0.1, hands: [mixPt([x - 4, 912], [x + 8, 906], k), mixPt([x + 20, 905], lev, k)] }; }
  const [sx, sy] = CONSOLE.screen, k = smoothstep(2.4, 2.6, q) * (1 - smoothstep(2.85, 3.0, q));
  return { hip: [x, HIP], feet: [[x - 6, GROUND], [x + 7, GROUND]], facing: 1, scale: FS, lean: 0.06, headTilt: -0.1, hands: [mixPt([x + 8, 906], [sx - 10, sy - 6 + 3 * Math.sin(TAU * q * 2)], k), mixPt(lev, [sx + 10, sy - 8 + 3 * Math.cos(TAU * q * 2)], k)] };
}

// ---------------- the tuner at the ring instrument; every 6 s turns to us and beckons ----------------
function tunerPose(t) {
  const x = 1404, [a, b] = INSTR.slider, sl = [lerp(a[0], b[0], sliderK(t)), a[1] - 2];
  const beckon = bump(mod(t, 6), 1.2, 2.6);
  if (beckon > 0) {
    const k = Math.min(1, beckon * 2.5), curl = Math.sin(TAU * 3 * mod(t, 6));
    return { hip: [x, HIP], feet: [[x - 7, GROUND], [x + 7, GROUND]], facing: 1, scale: FS, lean: 0, turn: k, hands: [[x - 12, HIP - 32 - 4 * curl], sl] };
  }
  const q = mod(t, 4), reach = smoothstep(2.0, 2.5, q) * (1 - smoothstep(3.0, 3.5, q));
  return { hip: [x, HIP], feet: [[x - 7, GROUND], [x + 7, GROUND]], facing: 1, scale: FS, lean: 0.1 + 0.04 * reach, headTilt: -0.35 * reach,
    hands: [mixPt([x + 14, 930], [INSTR.x - 22, INSTR.ringY + 20 + 4 * Math.sin(TAU * q)], reach), sl] };
}

// ---------------- the singers: a 6 s song that makes one solid and offers it to us ----------------
//   0.0-0.3 rest; 0.3-2.3 sing: glyphs stream from the mouth up into a sigil that draws itself in the air while
//   the leading hand conducts the same figure small and the other hand turns circles at the chest; 2.3-2.8 the
//   sigil folds into a solid; 2.8-3.2 they turn to face us and bring it to the chest; 3.2-4.4 they hold it out to
//   us, tilting it, a burst flaring behind it; 4.4-4.9 they let it go upward; 4.6-5.0 turn back; 5.0-6.0 bounce.
const T = { sing: [0.3, 2.3], fold: [2.3, 2.8], turn: [2.8, 3.2], offer: [3.2, 4.4] };
const poly = (n, rot = -Math.PI / 2, r = 1) => [...Array(n + 1)].map((_, i) => [Math.cos(rot + i / n * TAU) * r, Math.sin(rot + i / n * TAU) * r]);
const star = (n, step) => [...Array(n + 1)].map((_, i) => { const a = -Math.PI / 2 + (i * step % n) / n * TAU; return [Math.cos(a) * 0.86, Math.sin(a) * 0.86]; });
const SIGILS = {
  tetra: [poly(48), poly(3, -Math.PI / 2, 0.86)],
  ico: [poly(48), star(5, 2)],
  star: [poly(48), poly(3, -Math.PI / 2, 0.86), poly(3, Math.PI / 2, 0.86)],
  octa: [poly(48), poly(4, -Math.PI / 2, 0.86), poly(48, -Math.PI / 2, 0.42)],
};
const slen = (pl) => pl.reduce((a, p, i) => i ? a + Math.hypot(p[0] - pl[i - 1][0], p[1] - pl[i - 1][1]) : 0, 0);
const HOP = 0.4;
// where the pen is after fraction k of the whole sigil (pen-up hops between strokes count as short moves)
function sigilAt(kind, k) {
  const strokes = SIGILS[kind], lens = strokes.map(slen), total = lens.reduce((a, b) => a + b, 0) + HOP * (strokes.length - 1);
  let d = k * total;
  for (let i = 0; i < strokes.length; i++) {
    if (d <= lens[i]) { const pl = strokes[i]; for (let j = 1; j < pl.length; j++) { const seg = Math.hypot(pl[j][0] - pl[j - 1][0], pl[j][1] - pl[j - 1][1]); if (d <= seg) return mixPt(pl[j - 1], pl[j], d / seg); d -= seg; } return pl[pl.length - 1]; }
    d -= lens[i];
    if (i < strokes.length - 1) { if (d <= HOP) return mixPt(strokes[i][strokes[i].length - 1], strokes[i + 1][0], d / HOP); d -= HOP; }
  }
  const last = strokes[strokes.length - 1];
  return last[last.length - 1];
}
// the part of the sigil drawn after fraction k, as polylines in unit coordinates
function sigilDrawn(kind, k) {
  const strokes = SIGILS[kind], lens = strokes.map(slen), total = lens.reduce((a, b) => a + b, 0) + HOP * (strokes.length - 1);
  let left = k * total;
  const out = [];
  strokes.forEach((pl) => {
    if (left <= 0) return;
    const o = [pl[0]];
    for (let q = 1; q < pl.length && left > 0; q++) { const seg = Math.hypot(pl[q][0] - pl[q - 1][0], pl[q][1] - pl[q - 1][1]); if (left >= seg) { o.push(pl[q]); left -= seg; } else { o.push(mixPt(pl[q - 1], pl[q], left / seg)); left = 0; } }
    out.push(o);
    left -= HOP;
  });
  return { paths: out, circleDone: k * total >= lens[0] };
}
const cycleOf = (t, phase) => { const L = mod(t - phase, LOOP); return { c: mod(L, 6), j: Math.floor(L / 6) }; };
// where things are, relative to a singer at x facing f with its hip at hip
const geo = (x, f, hip) => ({
  sigil: [x + f * 50 * FS, hip - 86 * FS], sr: 20 * FS,           // the sigil hangs up and ahead, in the air
  conduct: [x + f * 22 * FS, hip - 46 * FS], cr: 11 * FS,         // the hand conducts the same figure, small
  mouth: [x + f * 12 * FS, hip - 56 * FS],
  hold: [x, hip - 24 * FS],                                       // held at the chest once they face us, face clear
});
const offerAt = (c) => E.outSoft(smoothstep(T.offer[0], T.offer[0] + 0.5, c));

function singerPose(t, phase, x, f, hip, feet, kinds, shiftAt) {
  const { c, j } = cycleOf(t, phase), kind = kinds[j], G = geo(x, f, hip), k = FS;
  const rest = [[x - f * 7 * k, hip + 4 * k], [x + f * 9 * k, hip + 4 * k]];
  const lead = (kk) => { const p = sigilAt(kind, kk); return [G.conduct[0] + p[0] * G.cr, G.conduct[1] + p[1] * G.cr]; };
  const turnC = [x + f * 6 * k + Math.cos(TAU * 2 * c) * 6 * k, hip - 26 * k + Math.sin(TAU * 2 * c) * 6 * k];
  // holding hands either side of the solid: lead hand on the facing side
  const holdLead = [G.hold[0] + f * 11 * k, G.hold[1] + 4], holdBack = [G.hold[0] - f * 11 * k, G.hold[1] + 4];
  const upLead = [x + f * 30 * k, hip - 62 * k], upBack = [x - f * 30 * k, hip - 62 * k];
  let back = rest[0], front = rest[1];
  const songK = (c - T.sing[0]) / (T.sing[1] - T.sing[0]);
  if (c < T.sing[0]) { /* rest */ }
  else if (c < T.sing[1]) { const e = smoothstep(0.3, 0.6, c); front = mixPt(rest[1], lead(E.smooth(Math.max(0, songK))), e); back = mixPt(rest[0], turnC, e); }
  else if (c < T.turn[1]) { const e = E.smooth((c - T.fold[0]) / (T.turn[1] - T.fold[0])); front = mixPt(lead(1), holdLead, e); back = mixPt(turnC, holdBack, e); }
  else if (c < T.offer[1]) { const o = offerAt(c), bob = 3 * Math.sin(TAU * (c - T.offer[0]) / 1.2); front = [holdLead[0] + f * 4 * o, holdLead[1] - 6 * o + bob]; back = [holdBack[0] - f * 4 * o, holdBack[1] - 6 * o + bob]; }
  else {
    const e = Math.min(1, E.outSoft((c - T.offer[1]) / 0.6)), d = smoothstep(4.9, 5.6, c);
    front = mixPt(mixPt([holdLead[0] + f * 4, holdLead[1] - 6], upLead, e), rest[1], d);
    back = mixPt(mixPt([holdBack[0] - f * 4, holdBack[1] - 6], upBack, e), rest[0], d);
  }
  const turn = smoothstep(T.turn[0], T.turn[1], c) * (1 - smoothstep(4.6, 5.0, c));
  const sing = c > T.sing[0] && c < T.sing[1] ? 0.35 + 0.65 * Math.abs(Math.sin(TAU * 3 * c)) : 0;
  const bounce = c > 5.0 || c < 0.3 ? hop(t, 0.5, 0, 6 * k) : 0;
  return { hip: [x, hip - bounce], feet: feet.map((p) => [p[0], p[1] - bounce * 0.6]), facing: f, scale: FS, turn, sing,
    lean: songK > 0 && songK < 1 ? 0.05 : 0, headTilt: c < T.sing[1] ? -0.25 : 0, hands: [back, front].map((h) => [h[0], h[1] - bounce]),
    shift: loopBump(t, shiftAt, 0.9), shiftKind: 'octa', shiftSpin: TAU * t / 2 };
}

// where solid jj of a singer is at time t: position, radius, how far it has drifted, and its burst strength
function solidAt(t, phase, x, f, hip, jj) {
  const G = geo(x, f, hip), born = phase + T.fold[0] + 6 * jj, u = mod(t - born, LOOP);
  if (u >= 10.5) return null;
  const grow = E.outSoft(smoothstep(0.1, 0.5, u)), toHold = E.smooth(smoothstep(0.5, 0.9, u)), offer = offerAt(u + T.fold[0]);
  const drift = smoothstep(2.1, 10.5, u), freeK = E.outSoft(drift);
  const at = mixPt(G.sigil, [G.hold[0], G.hold[1] - 6], toHold);
  const p = [at[0] + f * (170 * drift + 26 * Math.sin(drift * 5)), at[1] - 600 * freeK];
  const r = 13 * FS * grow * (1 + 0.35 * offer * (1 - smoothstep(2.1, 2.6, u))) * (1 - 0.4 * drift);
  return { p, r, drift, burst: u > 0.9 && u < 2.4 ? bump(u, 0.9, 2.4) : 0 };
}
// the burst that stages an offered solid, drawn behind the singer
function singerBurst(ctx, t, phase, x, f, hip) {
  for (let jj = 0; jj < 2; jj++) {
    const S0 = solidAt(t, phase, x, f, hip, jj);
    if (!S0 || S0.burst <= 0) continue;
    const { p, r } = S0, R = r * 1.9 * (0.7 + 0.3 * S0.burst);
    markLayer(ctx, p[0], p[1], R * 2.3, R * 2.3, (g) => paintBurst(g, p[0], p[1], R, 18, TAU * t / 6), { alpha: S0.burst });
  }
}

// what a singer makes, in Mark's colours: the glyph stream and the sigil during the song, then the solid from the
// fold through the offering to its drift away. Drawn after the figure so it sits in front.
function singerMakes(ctx, t, phase, x, f, hip, kinds, hue) {
  const { c, j } = cycleOf(t, phase), G = geo(x, f, hip);
  if (c > T.sing[0] && c < T.fold[1]) {
    const songK = Math.min(1, Math.max(0, (c - T.sing[0]) / (T.sing[1] - T.sing[0]))), fold = smoothstep(T.fold[0], T.fold[1], c);
    const { paths, circleDone } = sigilDrawn(kinds[j], E.smooth(songK));
    const R = G.sr * (1 - 0.9 * E.in(fold)), spin = TAU * 0.6 * E.in(fold) * -f;
    const P2 = ([u, v]) => [G.sigil[0] + (u * Math.cos(spin) - v * Math.sin(spin)) * R, G.sigil[1] + (u * Math.sin(spin) + v * Math.cos(spin)) * R];
    const lo = Math.min(G.mouth[0], G.sigil[0]) - 44, hi = Math.max(G.mouth[0], G.sigil[0]) + 44;
    markLayer(ctx, (lo + hi) / 2, (G.sigil[1] + G.mouth[1]) / 2, hi - lo, G.mouth[1] - G.sigil[1] + 96, (g) => {
      paintLines(g, paths.map((p) => p.map(P2)), 2.6 * PS, MK.magenta, MK.yellow);
      if (circleDone) for (let q = 0; q < 12; q++) { const a = q / 12 * TAU; paintLines(g, [[P2([Math.cos(a) * 1.14, Math.sin(a) * 1.14]), P2([Math.cos(a) * 1.34, Math.sin(a) * 1.34])]], 1.6 * PS, MK.cyan, MK.white); }
      // the sung glyphs: one leaves the mouth every 0.1 s and flies up into the sigil where it is being drawn
      for (let e = T.sing[0]; e < Math.min(c, T.sing[1]); e += 0.1) {
        const a = (c - e) / 0.55;
        if (a < 0 || a > 1) continue;
        const n = Math.round(e * 10), to = P2(sigilAt(kinds[j], Math.min(1, E.smooth((e + 0.55 - T.sing[0]) / (T.sing[1] - T.sing[0])))));
        const ctl = [(G.mouth[0] + to[0]) / 2 + f * 6, Math.min(G.mouth[1], to[1]) - 18];
        const p = [(1 - a) ** 2 * G.mouth[0] + 2 * (1 - a) * a * ctl[0] + a * a * to[0], (1 - a) ** 2 * G.mouth[1] + 2 * (1 - a) * a * ctl[1] + a * a * to[1]];
        paintGlyph(g, n % 6, p[0], p[1], (5 + 3 * Math.sin(Math.PI * a)) * FS, MK_RAMP[(n + hue) % MK_RAMP.length], a * 3);
      }
    }, { alpha: 1 - smoothstep(0.7, 1, fold) });
  }
  // the solids: forming at the sigil, carried up before the face, held out to us, then drifting away
  for (let jj = 0; jj < 2; jj++) {
    const S0 = solidAt(t, phase, x, f, hip, jj);
    if (!S0 || S0.r < 0.5) continue;
    const { p, r } = S0;
    markLayer(ctx, p[0], p[1], r * 2.6 + 8, r * 2.6 + 8, (g) => paintMarkSolid(g, kinds[jj], p[0], p[1], r, [TAU * t / 6 + jj, TAU * t / 4, 0.3 * jj], hue + jj * 3), { alpha: 1 - smoothstep(0.82, 1, S0.drift) });
  }
}

// ---------------- the chorus at the funnel's foot: bounce, cheer each offering, pop into solids ----------------
const CHORUS = [[722, 'bells', P.mint], [792, P.butter, P.pink], [862, 'pom', P.lilac], [1018, P.pink, P.aqua], [1088, 'bells', P.butter], [1158, P.mint, P.blush]];
// the offerings the chorus cheers: the adept's at 3.2 and 9.2, the seer's at 6.2 and 0.2 (each about 1.2 s)
const cheerAt = (t) => Math.max(...[3.2, 9.2, 6.2, 0.2].map((a) => loopBump(t, a - 0.1, 1.4)));
function chorusPose(t, i, x) {
  const ch = cheerAt(t), k = 0.85 * FS, hip = GROUND - 33 * k, b = hop(t, 0.6, i * 0.17, (4 + 8 * ch) * k);
  const wave = Math.sin(TAU * (t / 0.6 + i * 0.17));
  const down = [[x - 9 * k, hip + 4 * k + 2 * wave], [x + 9 * k, hip + 4 * k - 2 * wave]], upH = [[x - 20 * k, hip - 64 * k + 4 * wave], [x + 20 * k, hip - 64 * k - 4 * wave]];
  const hands = [mixPt(down[0], upH[0], ch), mixPt(down[1], upH[1], ch)].map((h) => [h[0], h[1] - b]);
  return { hip: [x, hip - b], feet: [[x - 7 * k, GROUND - b * 0.6], [x + 7 * k, GROUND - b * 0.6]], facing: i % 2 ? 1 : -1, scale: k, turn: 0.85, lean: 0, hands,
    shift: loopBump(t, 1.1 + i * 1.9, 0.9), shiftKind: ['ico', 'cube', 'octa'][i % 3], shiftSpin: TAU * t / 2 };
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
      const chorus = CHORUS.map(([, cap, col], i) => makeFigure(S, { name: `chorus-${i}`, color: col, cap, harlequin: cap === 'bells' ? P.pinkDeep : null }));

      // the operator stands behind the console, so it draws before the desk
      S.add({ name: 'operator', z: 995, render(ctx, t, env) { drawFigure(ctx, operator, { ...operatorPose(t), shift: loopBump(t, 7.3, 0.9), shiftKind: 'cube', shiftSpin: TAU * t / 2 }, env); } });
      S.add({ name: 'chorus', z: 978, render(ctx, t, env) { CHORUS.forEach(([x], i) => drawFigure(ctx, chorus[i], chorusPose(t, i, x), env)); } });
      S.add({ name: 'figures', z: 985, render(ctx, t, env) {
        drawFigure(ctx, tuner, { ...tunerPose(t), shift: loopBump(t, 4.6, 0.9), shiftKind: 'ico', shiftSpin: TAU * t / 2 }, env);
        const x = 1700, kinds = ['tetra', 'ico'];
        singerBurst(ctx, t, 0, x, -1, HIP);
        drawFigure(ctx, adept, singerPose(t, 0, x, -1, HIP, [[x + 7, GROUND], [x - 8, GROUND]], kinds, 10.7), env);
        singerMakes(ctx, t, 0, x, -1, HIP, kinds, 0);
      } });

      // the seer sits on the floating island, singing the same song three seconds behind the adept
      const IX = -120, IY = 90;
      S.add({ name: 'island', z: 1500, shadow: { dx: 10, dy: 22, alpha: 0.32 }, anim: (t) => ({ y: 8 * cyc(t, 1, 0.55), rot: 0.008 * cyc(t, 1, 0.8), ox: ISLAND.x + IX, oy: ISLAND.y + IY }), render(ctx, t, env) {
        drawSprites(ctx, [{ s: world.island, ax: ISLAND.x, ay: ISLAND.y, x: ISLAND.x + IX, y: ISLAND.y + IY }], env.shadow);
        const ground = ISLAND.y - 4 + IY, x = 300, hip = ground - 14 * FS, kinds = ['star', 'octa'];
        singerBurst(ctx, t, 3, x, 1, hip);
        drawFigure(ctx, seer, singerPose(t, 3, x, 1, hip, [[x + 16, ground + 4], [x + 22, ground + 6]], kinds, 1.6), env);
        singerMakes(ctx, t, 3, x, 1, hip, kinds, 4);
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

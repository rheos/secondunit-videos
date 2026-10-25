// The living loop (draft 8, symmetric about the centre line): a seamless 12 s loop at 24 fps in the approved relief-box clay language, inside a
// turning honeycomb dome. This is Robin's memory of the machine-elf space (research notes: RESEARCH-machine-elves.md).
// In the middle a faceted funnel feeds itself through a ringed pipe that swells as things pass. Around it small clay
// elves at play-work: one plays a console, one tunes a ring instrument, two sing shapes into being (a stream of
// glyphs leaves the mouth while the hands conduct; the sigil folds into a solid; they turn to us, hold it out, and
// let it go), a chorus at the funnel's foot bounces and cheers each offering, and now and then a head pops into a
// faceted ball. What they make and show is drawn in Mark Von Ulrich's saturated early-Mac pixel language.
// Every motion is periodic in 12 s (or a divisor of it), so frame 288 is frame 0.
// Built on Leon Lin's paper-fox core (vendor/paper-fox, MIT, Copyright (c) 2026 Leonxlnx).

import { LOOP_PAL } from './loop-palette.js';
import { Scene } from '../vendor/paper-fox/core/stage.js';
import { drawSprites } from '../vendor/paper-fox/core/sprite.js';
import { finish } from '../vendor/paper-fox/core/post.js';
import { E, lerp, smoothstep } from '../vendor/paper-fox/core/ease.js';
import { LIGHT, PAL, setFinish, clayForm } from './kit.js';
import { shade, mix } from '../vendor/paper-fox/core/color.js';

// draft 9: the crisp, constructed finish (set before anything is baked)
setFinish('crisp');
import { ISLAND } from './props.js';
import { LOOP, FILM_LOOP, cyc, addWorld, addNear } from './loop-world.js';
import { PANEL, PRESSES, btn, INSTR, sliderK, addMachines, mirrored } from './loop-machine.js';
import { makeFigure, drawFigure } from './loop-figures.js';
import { solidEdges } from './loop-shapes.js';
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


// ---------------- the console operator, on our side of the panel with its back to us ----------------
// Each hand goes from key to key on the presses (PRESSES in loop-machine.js): it lands a moment before the press,
// holds through it, and sets off for its next key; at 1.6 both hands come down together. The head turns a little
// toward the hand that is working.
const OPX = 566;
const HAND_PRESSES = [0, 1].map((h) => PRESSES.filter(([, hh]) => hh === h).map(([pt, , c, r]) => [pt, btn(c, r)]).sort((a, b) => a[0] - b[0]));
function handAt(q, h) {
  const list = HAND_PRESSES[h], n = list.length;
  let i = list.findIndex(([pt]) => pt > q); if (i < 0) i = n;
  const [tp, a] = list[(i - 1 + n) % n], [tn, b] = list[i % n];
  const since = mod(q - tp, 3), gap = mod(tn - tp, 3) || 3;
  const k = smoothstep(0.14, gap - 0.06, since);
  // a little dip toward the panel as it presses (down and in, seen from behind)
  const dip = Math.max(0, 1 - Math.abs(since) / 0.12) * 2;
  return [lerp(a[0], b[0], k), lerp(a[1], b[1], k) + dip];
}
function operatorPose(t) {
  const q = mod(t, 3), x = OPX, l = handAt(q, 0), r = handAt(q, 1);
  const lean = 0.08 * ((l[0] + r[0]) / 2 - x) / 30;
  return { back: true, hip: [x, HIP], feet: [[x - 7, GROUND], [x + 7, GROUND]], facing: 1, scale: FS, lean, headTilt: lean * 2, hands: [l, r] };
}

// ---------------- the tuner at the ring instrument; every 6 s turns to us and beckons ----------------
function tunerPose(t) {
  const x = INSTR.x - 66, [a, b] = INSTR.slider, sl = [lerp(a[0], b[0], sliderK(t)), a[1] - 2];
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
const SIGIL_VIEW = [0.42, 0.62, 0.18];
const SIGILS = {
  tetra: [poly(48), poly(3, -Math.PI / 2, 0.86)],
  // the five-fold solids are drawn as themselves: the circle, then every edge of the solid as seen from one angle
  ico: [poly(48), ...solidEdges('ico', SIGIL_VIEW).map((e) => e.map(([u, v]) => [u * 0.86, v * 0.86]))],
  dodeca: [poly(48), ...solidEdges('dodeca', SIGIL_VIEW).map((e) => e.map(([u, v]) => [u * 0.86, v * 0.86]))],
  star: [poly(48), poly(3, -Math.PI / 2, 0.86), poly(3, Math.PI / 2, 0.86)],
  octa: [poly(48), poly(4, -Math.PI / 2, 0.86), poly(48, -Math.PI / 2, 0.42)],
};
const slen = (pl) => pl.reduce((a, p, i) => i ? a + Math.hypot(p[0] - pl[i - 1][0], p[1] - pl[i - 1][1]) : 0, 0);
// the pen lifts between strokes: a short hop, so a sigil of thirty edges still draws in one song
const HOP = 0.12;
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
  sigil: [x + f * 62 * FS, hip - 104 * FS], sr: 30 * FS,          // the sigil hangs up and ahead, in the air, clear of the head
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
    markLayer(ctx, (lo + hi) / 2, (G.sigil[1] + G.mouth[1]) / 2, hi - lo + 40, G.mouth[1] - G.sigil[1] + 130, (g) => {
      // the circle bold, the figure inside it finer, so a solid's thirty edges still read as its shape
      paintLines(g, paths.slice(0, 1).map((p) => p.map(P2)), 2.6 * PS, MK.magenta, MK.yellow);
      paintLines(g, paths.slice(1).map((p) => p.map(P2)), 1.4 * PS, MK.magenta, MK.yellow);
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
// Eight elves on three tiers of pedestals: one in front, three behind, four at the back. Every 1.5 s (each chord
// change and each half chord) some of them trade places, by one of eight moves: left and right trading across the
// centre line, the front and middle trading up the spine, triangles on one side, diagonals, crossings behind, outer
// and inner trading at the back. The moves run in a 16-step phrase (24 s) that brings everyone home at the seam;
// six different elves take the front in it. Places, as [x off the centre line, tier], in this order:
// the front, middle right, back right outer, back right inner, middle centre, back left inner, back left outer,
// middle left.
const CHORUS_CAST = [['bells', P.mint, P.pinkDeep], [P.butter, P.pink], ['pom', P.lilac], ['bells', P.butter, P.iris]];
const CHORUS_N = 8, SWAP = 1.5, MOVE = 0.6, RISE = 46;
const PLACES = [[0, 0], [140, 1], [210, 2], [70, 2], [0, 1], [-70, 2], [-210, 2], [-140, 1]];
const PEDESTAL = [P.butter, P.aqua, P.blush];
const MOVES = {
  mirror: [[1, 7], [2, 6], [3, 5]], spine: [[0, 4]], outerin: [[2, 3], [6, 5]], wings: [[1, 2], [7, 6]],
  diag: [[1, 3], [7, 5], [0, 4]], triL: [[0, 7], [4, 5]], triR: [[0, 1], [4, 3]], cross: [[6, 3], [2, 5]],
};
const PHRASE = ['triL', 'diag', 'triR', 'spine', 'triL', 'diag', 'mirror', 'triR', 'spine', 'triR', 'cross', 'mirror', 'triL', 'triR', 'triL', 'outerin'];
// who stands where after each step: AT[k][place] = elf, WHERE[k][elf] = place (AT[16] is AT[0] again)
const AT = [[0, 1, 2, 3, 4, 5, 6, 7]];
for (const mv of PHRASE) { const p = AT[AT.length - 1].slice(); for (const [a, b] of MOVES[mv]) [p[a], p[b]] = [p[b], p[a]]; AT.push(p); }
const WHERE = AT.map((p) => { const w = []; p.forEach((e, pl) => { w[e] = pl; }); return w; });
// The pedestals are pistons: each fires once a chord (3 s), in a firing order that skips back and forth across the
// tiers, one every 3/8 s; it shoots up, holds, and sinks back below its rest height before the next firing.
const FIRING = [0, 5, 2, 7, 4, 1, 6, 3], FIRE_GAP = 3 / 8;
function lift(place, t) {
  const u = mod(t - FIRING.indexOf(place) * FIRE_GAP, 3);
  const ext = smoothstep(0, 0.1, u) * (1 - smoothstep(0.6, 1.4, u));
  return (ext - 0.35) * 26;
}
// where elf j stands at t: its place, the tier as a smooth number (for drawing order and the wave), the piston
// height under it, and the hop when it moves
function chorusPlace(t, j) {
  const tt = mod(t, FILM_LOOP), k0 = Math.floor(tt / SWAP), next = SWAP * (k0 + 1);
  const pa = WHERE[k0 % 16][j], pb = WHERE[(k0 + 1) % 16][j];
  const p = pa === pb ? 0 : smoothstep(next - MOVE, next, tt);
  const [xa, ra] = PLACES[pa], [xb, rb] = PLACES[pb];
  const run = Math.hypot(xb - xa, (rb - ra) * RISE);
  return { x: 960 + lerp(xa, xb, p), tier: lerp(ra, rb, p), lift: lerp(lift(pa, t), lift(pb, t), p),
    hop: Math.sin(Math.PI * p) * (10 + run * 0.08), moving: pa !== pb };
}
// the front after step k: the elf now standing in place 0
const frontAt = (k) => AT[mod(k, 16)][0];
// the offerings the chorus cheers: the adept's at 3.2 and 9.2, the seer's at 6.2 and 0.2 (each about 1.2 s)
const cheerAt = (t) => Math.max(...[3.2, 9.2, 6.2, 0.2].map((a) => loopBump(t, a - 0.1, 1.4)));
// poi spinning without the poi: each arm held straight at full stretch swings a big circle from its shoulder, the two
// in opposite directions (mirror images), never stopping or reversing; twice a turn the outstretched arms cross in an
// X, once high and once low, out at arm's length.
// Each tier runs a quarter second behind the one in front of it, so the turning rolls back through the tiers as a
// wave; an elf changing tiers slides smoothly onto its new tier's timing. An offering makes the hop higher.
// one full turn every 3 s, one chord of the sound; CROSS puts the front elf's high crossing on each chord change
const WAVE = { period: 3, lag: 0.25 };
const CROSS = Math.acos(9.2 / 35.2) / TAU;
const chorusTheta = (t, tier) => TAU * ((t - tier * WAVE.lag) / WAVE.period - CROSS);
function chorusPose(t, j) {
  const { x, tier, hop, lift: up } = chorusPlace(t, j);
  const ch = cheerAt(t), k = 0.85 * FS * (1 - 0.06 * tier), base = GROUND - tier * RISE - up, hip = base - 33 * k;
  const th = chorusTheta(t, tier);
  // a small bounce twice a turn, at the top and bottom of the circle, on top of the hop from place to place
  const bounce = (2 + 6 * ch) * k * Math.abs(Math.sin(th)), b = bounce + hop;
  // the shoulders (from loop-figures' body) and a radius just inside the arm's full reach, so the arms run straight
  const shY = hip - 33.6 * k, shX = 9.2 * k, r = 35.2 * k;
  const lead = [x - shX + r * Math.cos(th), shY + r * Math.sin(th)];    // the left arm, turning one way
  const other = [x + shX - r * Math.cos(th), shY + r * Math.sin(th)];   // the right arm, its mirror, turning the other
  const fy = base - hop - bounce * 0.6;
  return { hip: [x, hip - b], feet: [[x - 7 * k, fy], [x + 7 * k, fy]], facing: 1, scale: k, turn: 0.85, lean: 0,
    hands: [lead, other].map((h) => [h[0], h[1] - b]), headTilt: 0, armsFront: true,
    shift: loopBump(t, 0.05 + (j + 1) * SWAP, 0.8), shiftKind: ['ico', 'cube', 'octa', 'dodeca'][j % 4], shiftSpin: TAU * t / 2 };
}

// a piston for each place: a hexagonal sleeve standing on the floor, a narrower rod, and a cap the elf stands on
function pedestal(ctx, place, t) {
  const [dx, tier] = PLACES[place], x = 960 + dx, rest = GROUND - tier * RISE + 2, top = rest - lift(place, t);
  const s = 1 - 0.06 * tier, rx = 30 * s, ry = 8 * s, bot = GROUND + 16, sleeve = rest + 14, col = PEDESTAL[tier];
  const hex = (y, w = 1) => [0, 1, 2, 3, 4, 5].map((q) => [x + rx * w * Math.cos(q * Math.PI / 3), y + ry * w * Math.sin(q * Math.PI / 3)]);
  // the front faces of a prism from y0 down to y1 (the three lower edges of the hexagon dropped), then its top
  const prism = (y0, y1, w, fill) => {
    const T0 = hex(y0, w), B0 = hex(y1, w);
    if (y1 > y0 + 0.5) clayForm(ctx, [T0[0], T0[1], T0[2], T0[3], B0[3], B0[2], B0[1], B0[0]], shade(fill, -0.12), { size: 20, smooth: false });
    clayForm(ctx, T0, fill, { size: 14, smooth: false });
  };
  if (sleeve < bot) prism(sleeve, bot, 1, shade(col, -0.05));
  prism(top + 5, sleeve, 0.62, mix(col, '#ffffff', 0.25));
  prism(top, top + 5, 1.04, col);
}

function drawChorus(ctx, t, env, chorus) {
  // back to front: each tier's pistons, then the elves standing on it (an elf is drawn just in front of the
  // pistons of the tier it is on, so one hopping down passes in front of the lower tier only once it is half way)
  const items = PLACES.map(([, tier], pl) => ({ depth: tier, draw: () => pedestal(ctx, pl, t) }));
  for (let j = 0; j < CHORUS_N; j++) items.push({ depth: chorusPlace(t, j).tier - 0.5, draw: () => drawFigure(ctx, chorus[j], chorusPose(t, j), env) });
  items.sort((a, b) => b.depth - a.depth).forEach((it) => it.draw());
}

function scene() {
  return new Scene({
    id: 'relief-loop',
    duration: FILM_LOOP,
    background: '#f6e4d8',
    light: LIGHT,
    shadow: { alpha: 0.44, dist: 10, blur: 6 },
    // less haze: a trace of bloom on the brightest parts, barely any grain, a light vignette
    post: { bloom: 0.06, threshold: 0.86, bloomRadius: 1, vignette: 0.08, grain: 0.012, grade: { color: '#ffd8b4', amount: 0.03, mode: 'soft-light' } },
    // on the centre line, breathing in and out, so the symmetry holds
    camera: (t) => ({ x: 0, y: 6 * cyc(t, 1, 0.21), z: 30 + 24 * cyc(t, 1, 0.1), roll: 0 }),
    build(S) {
      const world = addWorld(S);
      addMachines(S);
      addNear(S);
      const operator = makeFigure(S, { name: 'operator', color: P.pink, cap: 'pom' });
      const tuner = makeFigure(S, { name: 'tuner', color: P.lilac, cap: P.butter });
      const adept = makeFigure(S, { name: 'adept', color: P.mint, cap: P.pink });
      const seer = makeFigure(S, { name: 'seer', color: P.butter, cap: P.mintDeep });
      const chorus = [...Array(CHORUS_N)].map((_, j) => { const [cap, color, harlequin = null] = CHORUS_CAST[j % 4]; return makeFigure(S, { name: `chorus-${j}`, color, cap, harlequin }); });

      // the operator stands on our side of the panel, back to us, so it draws after (in front of) the console
      // every figure off the centre line is drawn for the left half and again reflected: twins in mirror unison
      S.add({ name: 'operator', z: 988, render(ctx, t, env) { mirrored(ctx, () => drawFigure(ctx, operator, { ...operatorPose(t), shift: loopBump(t, 7.3, 0.9), shiftKind: 'cube', shiftSpin: TAU * t / 2 }, env)); } });
      S.add({ name: 'chorus', z: 978, render(ctx, t, env) { drawChorus(ctx, t, env, chorus); } });
      S.add({ name: 'figures', z: 985, render(ctx, t, env) { mirrored(ctx, () => {
        drawFigure(ctx, tuner, { ...tunerPose(t), shift: loopBump(t, 4.6, 0.9), shiftKind: 'ico', shiftSpin: TAU * t / 2 }, env);
        const x = 170, kinds = ['ico', 'dodeca'];
        singerBurst(ctx, t, 0, x, 1, HIP);
        drawFigure(ctx, adept, singerPose(t, 0, x, 1, HIP, [[x - 7, GROUND], [x + 8, GROUND]], kinds, 10.7), env);
        singerMakes(ctx, t, 0, x, 1, HIP, kinds, 0);
      }); } });

      // the seer sits on the floating island, singing the same song three seconds behind the adept
      const IX = -120, IY = 90;
      S.add({ name: 'island', z: 1500, shadow: { dx: 10, dy: 22, alpha: 0.32 }, anim: (t) => ({ y: 8 * cyc(t, 1, 0.55) }), render(ctx, t, env) { mirrored(ctx, () => {
        drawSprites(ctx, [{ s: world.island, ax: ISLAND.x, ay: ISLAND.y, x: ISLAND.x + IX, y: ISLAND.y + IY }], env.shadow);
        const ground = ISLAND.y - 4 + IY, x = 300, hip = ground - 14 * FS, kinds = ['star', 'octa'];
        singerBurst(ctx, t, 3, x, 1, hip);
        drawFigure(ctx, seer, singerPose(t, 3, x, 1, hip, [[x + 16, ground + 4], [x + 22, ground + 6]], kinds, 1.6), env);
        singerMakes(ctx, t, 3, x, 1, hip, kinds, 4);
      }); } });
    },
  });
}

// ---------------- the cue list: every event in the loop, for the sound to land on ----------------
// Each cue: { t (s, within the 24 s film), kind, x (authored px, for the stereo position), dur?, n? }. Mirrored
// twins give a cue on each side. Computed from the same schedules the picture uses, so the two cannot drift apart.
// Most of the film repeats every 12 s, so add() lists an event at t and t + 12; the chorus's phrase runs the whole
// 24 s, so its cues go in once each with add24().
function cues() {
  const out = [], add24 = (t, kind, x, extra = {}) => out.push({ t: +mod(t, FILM_LOOP).toFixed(4), kind, x, ...extra });
  const add = (t, kind, x, extra = {}) => { add24(mod(t, LOOP), kind, x, extra); add24(mod(t, LOOP) + LOOP, kind, x, extra); };
  const both = (t, kind, x, extra) => { add(t, kind, x, extra); add(t, kind, 1920 - x, extra); };
  // the funnel: eight things round it every 6 s, odd ones down the right pipe
  for (let n = 0; n < 8; n++) for (const k of [0, 1]) {
    const t0 = 6 * k - 0.75 * n, side = n % 2 ? 1 : -1;
    add(t0 + 2.2, 'bulge', 960 + side * 200, { dur: 3.2, side });
    add(t0 + 5.4, 'release', 960 + side * 56);
    add(t0 + 6.0, 'drop', 960, { n });
  }
  // the singers: the adept pair (phase 0) on the ground, the seer pair (phase 3) on the islands
  for (const [phase, x] of [[0, 170], [3, 300]]) for (let j = 0; j < 2; j++) {
    const c0 = phase + 6 * j, kind = ['ico', 'dodeca', 'star', 'octa'][(phase ? 2 : 0) + j];
    let e = 0;
    for (let c = T.sing[0]; c < T.sing[1] - 1e-6; c += 0.1, e++) both(c0 + c, 'glyph', x, { n: e });
    // the circle of the sigil closes partway through the song
    const strokes = SIGILS[kind], lens = strokes.map(slen), total = lens.reduce((a, b) => a + b, 0) + HOP * (strokes.length - 1);
    let kc = 0; while (kc < 1 && E.smooth(kc) * total < lens[0]) kc += 0.005;
    both(c0 + T.sing[0] + kc * (T.sing[1] - T.sing[0]), 'chime', x);
    both(c0 + T.fold[0], 'fold', x, { dur: 0.5 });
    both(c0 + T.fold[1], 'form', x);
    both(c0 + T.offer[0], 'offer', x, { dur: 1.2 });
    both(c0 + T.offer[1], 'rise', x);
  }
  // the chorus: each swap of places, with the elf arriving at the front and whether a chord changes on it
  for (let k = 0; k < FILM_LOOP / SWAP; k++) add24(k * SWAP, 'swap', 960, { n: frontAt(k), chord: k % 2 === 0, newFront: frontAt(k) !== frontAt(k - 1) });
  // the pistons firing, eight a chord, pitched by tier
  for (let bar = 0; bar < LOOP / 3; bar++) FIRING.forEach((pl, i) => add(3 * bar + i * FIRE_GAP, 'piston', 960 + PLACES[pl][0], { n: PLACES[pl][1] }));
  // a tick each time an elf's outstretched arms cross (twice a turn, high and low), pitched by its tier. An elf
  // changing tiers changes timing, so the crossings are found by stepping its arm angle through the loop.
  const DT = 1 / 480;
  for (let j = 0; j < CHORUS_N; j++) for (let s = 0; s < FILM_LOOP / DT; s++) {
    const t0 = s * DT, t1 = t0 + DT, a = chorusPlace(t0, j), b = chorusPlace(t1, j);
    const u0 = chorusTheta(t0, a.tier) / TAU, u1 = chorusTheta(t1, b.tier) / TAU;
    for (const [q, high] of [[0, true], [2 * CROSS, false]]) if (Math.floor(u1 - q) > Math.floor(u0 - q)) add24(t1, 'tick', b.x, { n: Math.round(b.tier), high });
  }
  // heads popping into solids
  both(7.3, 'pop', 566); both(4.6, 'pop', 318); both(10.7, 'pop', 170); both(1.6, 'pop', 300);
  for (let j = 0; j < CHORUS_N; j++) for (const r of [0, LOOP]) { const tp = 0.05 + (j + 1) * SWAP + 0.4 + r; add24(tp, 'pop', chorusPlace(tp, j).x); }
  // the consoles' levers, the instruments' released cubes
  // the operators' presses: the two-handed one at 1.6 in each 3 s keeps the old lever's sound; the rest are presses
  for (let bar = 0; bar < LOOP / 3; bar++) for (const [pt, , c, r] of PRESSES) if (pt !== 1.6) both(3 * bar + pt, 'press', btn(c, r)[0], { n: c + r });
  for (const q of [1.6, 4.6, 7.6, 10.6]) both(q, 'lever', OPX);
  both(7.0, 'cube', 384);
  return out.sort((a, b) => a.t - b.t);
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
  t = mod(t, FILM_LOOP);
  S.render(ctx, t);
  finish(ctx, { ...S.post, frame: Math.round(t * 24) });
}

window.__frameJPEG = (t, q = 0.93) => { frame(t); return cv.toDataURL('image/jpeg', q); };
window.__framePNG = (t) => { frame(t); return cv.toDataURL('image/png'); };
window.__ready = Promise.resolve(true);
window.FILM = { DURATION: FILM_LOOP, frame, scene: S, cues };
if (!params.has('offline')) {
  const t0 = performance.now(), start = parseFloat(params.get('t') || 0);
  (function loop() { frame(start + (performance.now() - t0) / 1000); requestAnimationFrame(loop); })();
}

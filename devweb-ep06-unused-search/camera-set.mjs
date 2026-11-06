// Episode 6's set, for the kit's camera check (tools/devweb-kit/camera-check.mjs): where every prop is, what a camera
// key may name as its subject, when each prop is on screen, and the three measures only this episode has.
import { screenBox, project, runs, W, EDGE } from "../tools/devweb-kit/camera-check.mjs";

// ---------- the set, in world units (from timeline.js and the stations; Blink's body half-width = 1) ----------
const BLINK_SPROUT_X = -0.86;
export const BOX = {
  dial: [-0.45, 0.75, 2.6, 3.8, -1.47],
  tag: [-0.62, -0.04, 2.62, 2.95, -1.38],
  oldLbl: [-0.97, 0.03, 2.28, 2.44, -1.48],
  newLbl: [0.27, 1.27, 2.28, 2.44, -1.48],
  plate: [-0.85, 1.15, 3.92, 4.34, -1.45],
  lid: [-1.07, 1.37, 4.38, 4.71, -1.47], // the lid band: its top edge and the `search` stencil (1.6 x 0.26 at y 4.54)
  crate: [-1.07, 1.37, 1.55, 4.71, -1.5],
  slot: [1.0, 1.5, 3.4, 3.7, -1.5],
  queue: [0.98, 1.94, 1.88, 3.72, -1.1],
  chuteL: [-0.97, 0.03, 1.5, 2.44, -1.4],
  chuteR: [0.27, 1.27, 1.5, 2.44, -1.4],
  lamp: [1.6, 2.2, 4.22, 4.66, -1.8],
  counter: [1.26, 2.21, 2.99, 3.61, -1.1],
  tray: [1.4, 2.1, 2.34, 2.76, -1.1],
  strip: [-1.5, 1.8, 1.96, 2.18, -1.0],
  note: [-1.23, -0.27, -0.56, -0.2, 1.15],
  panels: [-1.94, 1.94, 2.55, 4.05, -0.9],
  log: [0.45, 1.95, 1.95, 4.25, -0.8],
  visor: [-1.66, -0.06, -0.14, 0.94, 0.75],
  body: [-1.89, 0.17, -0.88, 1.28, 0],
  sprout: [-1.2, -0.52, 1.28, 1.84, 0],
  head: [-1.6, -0.12, 1.0, 1.28, 0.3],
  mouth: [-0.76, -0.12, -0.76, -0.4, 1.02],
};
const B = BOX;
// what a key can name as its subject: a box or a list of boxes
export const SUBJECTS = {
  dial: [B.dial, B.tag],
  needle: [B.dial],
  labels: [B.dial, B.oldLbl, B.newLbl],
  crate: [B.crate],
  set: [B.crate, B.body, B.sprout],
  queue: [B.slot, B.queue],
  feed: [B.dial, B.slot, B.queue, B.chuteL],
  chuteL: [B.chuteL, B.dial],
  tag: [B.tag, B.dial],
  lamp: [B.lamp, B.dial],
  blink: [B.body, B.sprout],
  blinkcard: [B.body, B.sprout, B.queue],
  plate: [B.plate, B.dial],
  counter: [B.counter],
  stream: [B.counter, B.chuteL],
  tray: [B.tray],
  strip: [B.strip],
  note: [B.body, B.sprout, B.note],
  turn: [B.dial, B.chuteR, B.newLbl],
  newchute: [B.chuteR, B.newLbl, B.dial],
  tip: [B.plate, B.tag],
  panels: [B.panels],
  log: [B.log],
  end: [B.body, B.sprout, B.dial],
  bet: [B.body, B.sprout, B.plate],
};

// Blink, for the visor rules
export const blink = { visor: B.visor, body: [B.body, B.sprout], head: B.head };

// reference points spread over the set, for the camera's own speed
export const refPoints = [];
for (const x of [-1.8, -0.9, 0, 0.9, 1.8]) for (const y of [-0.6, 0.6, 1.8, 3.0, 4.2]) refPoints.push([x, y, y < 1.3 ? 0.4 : -1.3]);

const on = (a, b) => (t) => t >= a && t <= b;
// what each overlay must stay off, and when those things are on screen
export const protect = ({ T, TL, END }) => [
  ["visor", B.visor, () => true], ["Blink", [B.body, B.sprout], () => true], ["dial face", B.dial, () => true], ["lid and its stencil", B.lid, () => true], ["tag", B.tag, () => true],
  ["keywords label", B.oldLbl, () => true], ["meaning label", B.newLbl, () => true],
  ["plate", B.plate, on(T.new1 - 0.6, END)], ["counter", B.counter, (t) => TL.counterAlpha(t) > 0.05],
  ["lamp", B.lamp, () => true], ["tray", B.tray, on(T.h15, T.h16 + 0.5)], ["strip", B.strip, on(T.h16 + 0.2, T.h20 + 0.45)],
  ["panels", B.panels, on(T.h24, T.h26 + 0.4)], ["log", B.log, on(T.h26, T.h27 + 0.4)], ["note", B.note, on(T.h18 + 0.9, T.h21 + 0.5)],
];
// an overlay phrase never straddles the border of these
export const straddle = [["crate", B.crate], ["Blink", [B.body, B.sprout]]];
// the props with long straight borders, and whether each is on screen at t
export const edged = (t, { T, TL }) => [["crate", B.crate, true], ["plate", B.plate, t >= T.new1 - 0.6], ["strip", B.strip, t >= T.h16 + 1.2 && t <= T.h20 - 0.15],
  ["counter", B.counter, TL.counterAlpha(t) > 0.5], ["tray", B.tray, t >= T.h15 + 0.4 && t <= T.h16], ["panels", B.panels, t >= T.h24 + 0.6 && t <= T.h26],
  ["log", B.log, t >= T.h26 + 0.4 && t <= T.h27], ["lamp", B.lamp, true]];
// everything that fills the frame's width, and when
export const scene = ({ T, TL }) => [[B.crate, () => true], [[B.body, B.sprout], () => true], [B.counter, (t) => TL.counterAlpha(t) > 0.3], [B.tray, on(T.h15 + 0.3, T.h16)],
  [B.strip, on(T.h16 + 0.6, T.h20 - 0.15)], [B.note, on(T.h18 + 1.1, T.h21 + 0.5)], [B.panels, on(T.h24 + 0.3, T.h26)], [B.log, on(T.h26 + 0.3, T.h27)], [B.lamp, () => true]];
// Blink's acting beats: whole in frame on these
export const beats = ({ END }) => [[26.2, 29.0], [48.8, 52.3], [54.9, 58.0], [75.5, END]];
// subjects that are Blink, not a prop (the 30-60 % height band is for props)
export const notProp = new Set(["blink", "blinkcard", "set", "note", "end", "bet"]);

// ---------- only this episode ----------
export function extras({ T, frames, creepSeg }) {
  // the strip's right end (the `day 53` box and its label, x 1.45-1.8) is wholly in by 40 px or wholly out, never sliced,
  // whenever the camera is slower than 4 px/f
  const D53 = [1.45, 1.8, 1.96, 2.18, -1.0], stripEnd = [];
  for (const f of frames) {
    if (f.t < T.h16 + 1.2 || f.t > T.h20 - 0.15) continue;
    if (f.v >= 4) continue; // a move sweeping the end past the edge is not a slice that sits; at rest and slow drift only
    const s = screenBox(f.c, D53);
    if (s.r > W - EDGE && s.l < W + EDGE && s.r - s.l > 0) stripEnd.push(f.t);
  }
  const stripCut = runs(stripEnd, 5).map(([a, b]) => `${a.toFixed(2)}-${b.toFixed(2)}`);

  // the note on Blink's front stays above the bottom chrome (y 1700) on 54.9-58.0 and whenever the camera rests on Blink
  const noteOn = (t) => t >= T.h18 + 1.1 && t <= T.h21 + 0.5;
  const ruleNote = [];
  let noteLow = -1e9, noteAt = 0;
  for (const f of frames) {
    if (!noteOn(f.t)) continue;
    const rest = creepSeg.has(f.c.seg) && ["blink", "note", "end", "bet"].includes(f.subj);
    if (!(rest || (f.t >= 54.9 && f.t <= 58.0))) continue;
    const nb = screenBox(f.c, B.note).b;
    if (nb > noteLow) { noteLow = nb; noteAt = f.t; }
    if (nb > 1700 && !ruleNote.length) ruleNote.push(`${f.t.toFixed(2)}: note bottom ${nb.toFixed(0)}`);
  }

  // the calendar strip's bottom edge clears the top of Blink's sprout (world y 1.84) while the strip is out
  let sproutGap = 1e9, sproutAt = 0;
  for (const f of frames) {
    if (f.t < T.h16 + 0.2 || f.t > T.h20 + 0.45) continue;
    const g = project(f.c, [BLINK_SPROUT_X, 1.84, 0])[1] - screenBox(f.c, B.strip).b;
    if (g < sproutGap) { sproutGap = g; sproutAt = f.t; }
  }
  return { stripCut, ruleNote, noteLow, noteAt, sproutGap, sproutAt };
}

// Episode 6's set, for the kit's camera check (tools/devweb-kit/camera-check.mjs): where every prop is, what a camera
// key may name as its subject, when each prop is on screen, and the measures only this episode has. The rebuilt set
// (world-plan-v2 section 1): the machine's anchors come from timeline.js's ML through mw(), so the boxes below move with
// MACHINE_AT and MACHINE_S; Blink, the programs, the strip, the note, the panels and the log are world units.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { screenBox, project, runs, W, EDGE, inside } from "../tools/devweb-kit/camera-check.mjs";
// timeline.js reads globalThis.VO at import; the kit's loadEpisode sets it later, so seed it here the same way
if (!globalThis.VO) {
  const d = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "vo/words.json"), "utf8"));
  const find = (word, n = 1) => { const m = d.words.filter((x) => x[0] === word.toLowerCase()); if (m.length < n) throw new Error(`no '${word}' #${n}`); return m[n - 1]; };
  globalThis.VO = { END: d.end, w: (word, n) => find(word, n)[1], e: (word, n) => find(word, n)[2] };
}
const { BLINK, ML, MACHINE_S, PROGRAMS, STRIP, mw } = await import("./timeline.js");

// a box [x0, x1, y0, y1, z] round a machine anchor: half-width hw, half-height hh (world), z at the anchor (plus dz, world)
const S = MACHINE_S;
const around = (name, hw, hh, dz = 0, dy = 0) => { const p = mw(ML[name]); return [p[0] - hw, p[0] + hw, p[1] - hh + dy, p[1] + hh + dy, p[2] + dz]; };
const spout = mw(ML.spout), core = mw(ML.core), bulb = mw(ML.bulb), lamp = mw(ML.lampTag), bin = mw(ML.bin), cUp = mw(ML.counterUp), ax = mw(ML.floor);
const bx = BLINK.x, bz = BLINK.z;
export const BOX = {
  // ---------- the machine (test-local sizes times S) ----------
  switch: around("switchCentre", 0.86 * S, 0.86 * S, 0.05 * S), // the housing and bezel, front face z
  face: around("switchCentre", 0.66 * S, 0.66 * S, 0.056 * S), // the black dial face
  knob: [mw(ML.knobOld)[0] - 0.15 * S, mw(ML.knobNew)[0] + 0.15 * S, mw(ML.knobOld)[1] - 0.15 * S, mw(ML.knobMid)[1] + 0.15 * S, mw(ML.knobMid)[2]], // its whole arc
  tag: around("tag", 0.4 * S, 0.14 * S, 0, -0.1 * S), // the default tag on its string under the spring post
  labelOld: around("labelOld", 0.76 * S, 0.125 * S), labelNew: around("labelNew", 0.68 * S, 0.125 * S),
  pilot: around("pilot", 0.08 * S, 0.08 * S),
  core: [core[0] - 0.54 * S, core[0] + 0.54 * S, core[1] - 0.54 * S, core[1] + 0.54 * S, core[2]], // sphere and its three rings
  slot: around("slot", 0.5 * S, 0.18 * S, 0.17 * S), feeler: around("feeler", 0.08 * S, 0.1 * S), lip: around("lip", 0.43 * S, 0.03 * S),
  inPlaque: around("inPlaque", 0.225 * S, 0.105 * S),
  spout: [spout[0] - 0.4 * S, spout[0] + 0.4 * S, spout[1] - 0.4 * S, spout[1] + 0.4 * S, spout[2]], // the horn's mouth
  outPlaque: around("outPlaque", 0.25 * S, 0.105 * S),
  bin: [bin[0] - 0.35 * S, bin[0] + 0.35 * S, bin[1] - 0.26 * S, bin[1] + 0.26 * S, bin[2] + 0.15 * S], // the boss's face; the bin tips out of it
  binOut: [bin[0] - 0.33 * S, bin[0] + 0.33 * S, bin[1] - 0.26 * S, bin[1] + 0.2 * S, bin[2] + 0.4 * S], // the tipped bin: its top comes 0.26 forward
  lid: around("lid", 0.675 * S, 0.185 * S), placard: around("placard", 1.3 * S, 0.25 * S),
  clockwork: [ax[0] - 1.9 * S, ax[0] - 0.5 * S, 0.34 + 1.75 * S, 0.34 + 4.25 * S, ax[2] + 0.95 * S], // three gears and the bellows, left flank
  bulb: [bulb[0] - 0.12 * S, bulb[0] + 0.12 * S, bulb[1] - 0.12 * S, bulb[1] + 0.12 * S, bulb[2]],
  lampTag: [lamp[0] - 0.31 * S, lamp[0] + 0.31 * S, lamp[1] - 0.09 * S, lamp[1] + 0.09 * S, lamp[2] + 0.34], // 0.34 in front of its anchor (lamp.js TAG_Z)
  stack: around("stackTop", 0.3 * S, 0.3 * S),
  shelf: around("shelf", 0.75 * S, 0.03 * S, 0.4 * S),
  counter: [cUp[0] - 0.475, cUp[0] + 0.475, cUp[1] - 0.31, cUp[1] + 0.31, cUp[2]], // standing (counter.js W 0.95, H 0.62, world)
  plinth: [ax[0] - 1.69 * S, ax[0] + 1.69 * S, 0.34 - 1.525 * S, 0.34 - 0.9 * S, ax[2] + 1.69 * S], // two steps on the grid; its front rim
  machine: [ax[0] - 2.2 * S, ax[0] + 1.95 * S, 0.34 - 1.525 * S, 0.34 + 5.52 * S, ax[2] + 1.0 * S], // bellows board to core rings, plinth to bulb; the belly's front
  crown: [ax[0] - 0.9 * S, ax[0] + 0.7 * S, 0.34 + 4.2 * S, 0.34 + 5.52 * S, ax[2] + 0.1 * S], // lid, stack, whistle, wires, bulb
  body: [ax[0] - 1.24 * S, ax[0] + 1.24 * S, 0.34 - 0.9 * S, 0.34 + 4.86 * S, ax[2] + 1.24 * S], // the foot and the belly: the one plain surface a phrase may sit on
  // ---------- the programs, the rails, the trough ----------
  prog1: [PROGRAMS.boxes[0].at[0] - 0.33, PROGRAMS.boxes[0].at[0] + 0.33, -0.88, -0.4, PROGRAMS.boxes[0].at[2] + 0.1],
  prog3: [PROGRAMS.boxes[1].at[0] - 0.33, PROGRAMS.boxes[2].at[0] + 0.33, -0.88, -0.4, PROGRAMS.boxes[2].at[2]],
  queue: [0.2, 1.62, 0.85, 2.35, -1.2], // the trunk with four cards standing on it
  trough: [-0.8, 1.5, 0.55, 1.3, -1.25],
  // ---------- the paper ----------
  strip: [STRIP.left, STRIP.left + STRIP.w, STRIP.y - 0.11, STRIP.y + 0.11, STRIP.z],
  day53: [STRIP.left + STRIP.w - 0.55, STRIP.left + STRIP.w, STRIP.y - 0.11, STRIP.y + 0.11, STRIP.z], // the last day box and its label
  note: [bx + 0.11 - 0.475, bx + 0.11 + 0.475, -0.56, -0.2, bz + 1.15],
  panels: [-1.94, 1.94, 2.55, 4.05, -0.9],
  log: [0.45, 1.95, 1.95, 4.25, -0.8],
  // ---------- Blink (stations/mark.js: pivot at BLINK, body half-width 1, depth 0.92, standing yaw 0.2) ----------
  visor: [bx - 0.65, bx + 0.95, -0.14, 0.94, bz + 0.8], // the visor turned a little toward the machine
  bodyF: [bx - 1.0, bx + 1.0, -0.88, 1.28, bz + 0.9], bodyB: [bx - 1.0, bx + 1.0, -0.88, 1.28, bz - 0.7], // the body's front and back
  sprout: [bx - 0.34, bx + 0.34, 1.28, 1.84, bz], sproutLean: [bx - 0.34, bx + 0.64, 1.28, 1.84, bz], // the sprout, and where a lean and sway can take it
  head: [bx - 0.74, bx + 0.74, 1.0, 1.28, bz + 0.3],
  mouth: [bx + 0.1, bx + 0.74, -0.76, -0.4, bz + 1.0],
  beam: [bx + 0.1, bx + 1.4, 0.3, 1.95, bz + 1.2], // visor to focus, with the cone's base
  focus: [bx + 0.4, bx + 1.35, 1.05, 1.9, bz + 1.43], // where a card condenses and a result dissolves
};
const B = BOX;
const BLINK_ALL = [B.bodyB, B.bodyF, B.sprout];
// what a key can name as its subject: a box or a list of boxes
export const SUBJECTS = {
  switch: [B.switch, B.knob, B.tag],
  knob: [B.knob],
  labels: [B.switch, B.labelOld, B.labelNew],
  machine: [B.machine],
  set: [B.machine, ...BLINK_ALL],
  slot: [B.slot, B.queue],
  feed: [B.switch, B.slot, B.queue],
  run: [B.clockwork, B.spout],
  spout: [B.spout, B.outPlaque],
  core: [B.core, B.labelNew],
  throw: [B.switch, B.core, B.feeler],
  tag: [B.tag, B.switch],
  lamp: [B.bulb, B.lampTag, B.lid],
  counter: [B.counter],
  stream: [B.counter, B.queue, B.trough, B.spout],
  bin: [B.binOut],
  strip: [B.strip, B.crown], // the band above the crown is read with the crown under it
  note: [...BLINK_ALL, B.note],
  placard: [B.placard, B.switch],
  beam: [B.bodyF, B.beam],
  blink: BLINK_ALL,
  blinkcard: [B.bodyF, B.beam, B.queue],
  panels: [B.panels],
  log: [B.log],
  end: [B.switch, B.slot, B.spout, B.focus], // Blink is held whole by his closing beat (beats)
};

// Blink, for the visor rules
export const blink = { visor: B.visor, body: BLINK_ALL, head: B.head };

// reference points spread over the set, for the camera's own speed
export const refPoints = [];
for (const x of [-1.8, -0.9, 0, 0.9, 1.8]) for (const y of [-0.6, 0.6, 1.8, 3.0, 4.2]) refPoints.push([x, y, y < 1.3 ? 0.2 : -1.5]);

const on = (a, b) => (t) => t >= a && t <= b;
// what each overlay must stay off, and when those things are on screen
export const protect = ({ T, TL, END }) => [
  ["visor", B.visor, () => true], ["Blink", BLINK_ALL, () => true], ["switch face", B.face, () => true], ["lid plate", B.lid, () => true], ["tag", B.tag, () => true],
  ["keywords label", B.labelOld, () => true], ["meaning label", B.labelNew, (t) => TL.newPlate(t).a > 0.05],
  ["placard", B.placard, on(T.new1 - 0.6, END)], ["counter", B.counter, (t) => TL.counterUp(t) > 0.05],
  ["bulb", B.bulb, () => true], ["bin", B.binOut, (t) => TL.binOut(t) > 0.05], ["strip", B.strip, on(T.h16 + 0.2, T.h20 + 0.45)],
  ["panels", B.panels, on(T.h24, T.h26 + 0.4)], ["log", B.log, on(T.h26, T.h27 + 0.75)], ["note", B.note, on(T.h18 + 0.9, T.h21 + 0.5)],
  ["core", B.core, (t) => TL.coreGlow(t) > 0.05],
];
// an overlay phrase never straddles the border of these
export const straddle = [["machine's body", B.body], ["Blink", BLINK_ALL]];
// the props with long straight borders, and whether each is on screen at t
export const edged = (t, { T, TL }) => [["placard", B.placard, t >= T.new1 - 0.6], ["strip", B.strip, t >= T.h16 + 1.2 && t <= T.h20 - 0.15],
  ["counter", B.counter, TL.counterUp(t) > 0.5], ["bin", B.binOut, TL.binOut(t) > 0.5], ["panels", B.panels, t >= T.h24 + 0.6 && t <= T.h26],
  ["log", B.log, t >= T.h26 + 0.4 && t <= T.h27 + 0.35], ["plinth", B.plinth, true]];
// everything that fills the frame's width, and when
export const scene = ({ T, TL }) => [[B.machine, () => true], [BLINK_ALL, () => true], [[B.prog1, B.prog3], () => true], [B.counter, (t) => TL.counterUp(t) > 0.3],
  [B.strip, on(T.h16 + 0.6, T.h20 - 0.15)], [B.note, on(T.h18 + 1.1, T.h21 + 0.5)], [B.panels, on(T.h24 + 0.3, T.h26)], [B.log, on(T.h26 + 0.3, T.h27)]];
// Blink's acting beats: whole in frame on these
// (the note beat starts as the note settles under his face, 49.3: the camera comes down from day 53 with it)
export const beats = ({ END }) => [[26.2, 29.0], [49.3, 52.3], [54.9, 58.0], [75.5, END]];
// subjects that are Blink, not a prop (the 30-60 % height band is for props)
export const notProp = new Set(["blink", "blinkcard", "set", "note", "end", "beam"]);

// ---------- only this episode ----------
export function extras({ T, frames, creepSeg }) {
  // the strip's right end (the day 53 box and its label) is wholly in by 40 px or wholly out, never sliced, whenever the
  // camera is slower than 4 px/f
  const stripEnd = [];
  for (const f of frames) {
    if (f.t < T.h16 + 1.2 || f.t > T.h20 - 0.15) continue;
    if (f.v >= 4) continue; // a move sweeping the end past the edge is not a slice that sits; at rest and slow drift only
    const s = screenBox(f.c, B.day53);
    if (s.r > W - EDGE && s.l < W + EDGE && s.r - s.l > 0) stripEnd.push(f.t);
  }
  const stripCut = runs(stripEnd, 5).map(([a, b]) => `${a.toFixed(2)}-${b.toFixed(2)}`);

  // the note on Blink's front stays above the bottom chrome (y 1700) on 54.9-58.0 and whenever the camera rests on Blink
  const noteOn = (t) => t >= T.h18 + 1.1 && t <= T.h21 + 0.5;
  const ruleNote = [];
  let noteLow = -1e9, noteAt = 0;
  for (const f of frames) {
    if (!noteOn(f.t)) continue;
    const rest = creepSeg.has(f.c.seg) && ["blink", "note", "end", "beam"].includes(f.subj);
    if (!(rest || (f.t >= 54.9 && f.t <= 58.0))) continue;
    const nb = screenBox(f.c, B.note).b;
    if (nb > noteLow) { noteLow = nb; noteAt = f.t; }
    if (nb > 1700 && !ruleNote.length) ruleNote.push(`${f.t.toFixed(2)}: note bottom ${nb.toFixed(0)}`);
  }

  // the spout's mouth clears Blink's head by 20 px on every rest frame of a set, run or spout subject, so the results
  // coming out of it are never behind him; and his sprout, standing still, never crosses the mouth's opening (the horn's
  // outer rim is 0.08 wide; the tilde may touch the rim's corner, not the hole). A lean swings the sprout's tip right by
  // up to 0.19 (mark.js, 4 deg at 2.7 up): sproutLean is the reach, reported, not asserted.
  let spoutGap = 1e9, spoutAt = 0, sproutIn = -1e9, sproutAt = 0, sproutLeanIn = -1e9;
  const mouth = [B.spout[0] + 0.08, B.spout[1] - 0.08, B.spout[2] + 0.08, B.spout[3] - 0.08, B.spout[4]];
  for (const f of frames) {
    if (!creepSeg.has(f.c.seg) || !["set", "run", "spout"].includes(f.subj) || f.t < 0.5) continue;
    const sp = screenBox(f.c, B.spout), hd = screenBox(f.c, B.head);
    if (!inside(sp)) continue; // the spout out of frame is not behind anything
    if (hd.r >= sp.l && hd.l <= sp.r) { const g = hd.t - sp.b; if (g < spoutGap) { spoutGap = g; spoutAt = f.t; } }
    const mo = screenBox(f.c, mouth);
    for (const [box, lean] of [[B.sprout, false], [B.sproutLean, true]]) {
      const s = screenBox(f.c, box);
      if (s.b < mo.t || s.t > mo.b) continue; // no vertical overlap with the opening
      const over = Math.min(s.r, mo.r) - Math.max(s.l, mo.l); // px of the sprout's box inside the opening's width
      if (lean) sproutLeanIn = Math.max(sproutLeanIn, over);
      else if (over > sproutIn) { sproutIn = over; sproutAt = f.t; }
    }
  }
  return { stripCut, ruleNote, noteLow, noteAt, spoutGap, spoutAt, sproutIn, sproutAt, sproutLeanIn };
}

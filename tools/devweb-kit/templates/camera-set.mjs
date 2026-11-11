// This episode's set, for the kit's camera check (tools/devweb-kit/camera-check.mjs). Copy to <project>/camera-set.mjs
// and replace every example below with the episode's own props. Episode 6's file is the worked example.
//
// A box is [x0, x1, y0, y1, z] in world units: the prop's front face as the camera sees it. Read the numbers off the
// station files and check two or three against a snapshot before trusting the report.
import { screenBox } from "../tools/devweb-kit/camera-check.mjs";

export const BOX = {
  machine: [-1.0, 1.4, 1.5, 4.7, -1.5], // example: the main prop
  label: [-0.9, 0.1, 2.3, 2.45, -1.48], // example: a word on it
  panel: [1.3, 2.2, 3.0, 3.6, -1.1], // example: something that appears for one beat
  // Blink. These four are Blink at x -0.86, y 0, z 0 as measured on episode 6; shift them to where this episode stands it.
  visor: [-1.66, -0.06, -0.14, 0.94, 0.75],
  body: [-1.89, 0.17, -0.88, 1.28, 0],
  sprout: [-1.2, -0.52, 1.28, 1.84, 0],
  head: [-1.6, -0.12, 1.0, 1.28, 0.3],
};
const B = BOX;

// what a camera key can name as its subject (the sixth item of a key): one box or several
export const SUBJECTS = {
  machine: [B.machine],
  label: [B.label, B.machine],
  panel: [B.panel],
  blink: [B.body, B.sprout],
  set: [B.machine, B.body, B.sprout],
};

// Blink, for the visor rules
export const blink = { visor: B.visor, body: [B.body, B.sprout], head: B.head };

// points spread over the whole set, for the camera's own speed: cover the set's width and height, at the props' depth
export const refPoints = [];
for (const x of [-1.8, -0.9, 0, 0.9, 1.8]) for (const y of [-0.6, 0.6, 1.8, 3.0, 4.2]) refPoints.push([x, y, y < 1.3 ? 0.4 : -1.3]);

const on = (a, b) => (t) => t >= a && t <= b;
// ctx is { T, TL, END, VO, KEYS }: T and TL are timeline.js's anchors and exports.
// what an overlay phrase must stay off, and when each thing is on screen: [name, box, (t) => on screen]
export const protect = ({ T, END }) => [
  ["visor", B.visor, () => true], ["Blink", [B.body, B.sprout], () => true],
  ["label", B.label, () => true],
  ["panel", B.panel, on(T.h05, T.h07)], // example: only while it is out
];
// an overlay phrase sits wholly on or wholly off these big plain surfaces: [name, box]
export const straddle = [["machine", B.machine], ["Blink", [B.body, B.sprout]]];
// props with long straight borders, and whether each is on screen at t: [name, box, on]
export const edged = (t, { T }) => [["machine", B.machine, true], ["panel", B.panel, t >= T.h05 && t <= T.h07]];
// everything that fills the frame's width, and when: [box, (t) => on screen]
export const scene = ({ T }) => [[B.machine, () => true], [[B.body, B.sprout], () => true], [B.panel, on(T.h05, T.h07)]];
// Blink's acting beats, in film seconds: Blink is whole in frame on these
export const beats = ({ END }) => [[END - 4, END]];
// subjects that are Blink, not a prop (the 30-60 % height band is for props)
export const notProp = new Set(["blink", "set"]);

// Optional: measures only this episode needs. Whatever this returns is added to the report; assert on it in
// check-graybox.mjs. frames is every 60 fps frame: { t, c (camera), v (px/frame), visor, vstate, body, subj }.
export function extras({ T, frames, creepSeg }) {
  // example: how low the panel's bottom edge gets while it is out
  let panelLow = -1e9;
  for (const f of frames) if (f.t >= T.h05 && f.t <= T.h07) panelLow = Math.max(panelLow, screenBox(f.c, B.panel).b);
  return { panelLow };
}

// s10.js: section 10, the bare table, f4315 to f4761. STUB: no cues, no events, and a camera that glides from the join
// at its first frame to the join at its last. Its builder owns this file: cue names (C), events, camera keys and BEATS,
// every one a pure function of the film frame f (24 fps). See README.md, "How to build a section".
// Units: centimetres, y up, the cloth is y = 0, x to the right, z toward the viewer.
import { CUES } from "../cues/s10.js";                  // generated: $PY tools/onsets.py 10 (from tools/cues/s10.json)
import { camFrom } from "./lib.js";
import { joinKey, joinFloat } from "./joins.js";
export { CUES };

export const F0 = 4315, F1 = 4761;
const c = (k) => CUES[k].f;
export const C = {};                                      // e.g. { bored: c("bored") }

// ---------- the camera: the first key is the join at F0, the last is the join at F1 (position, target and velocity)
export const CAM_KEYS = [joinKey(F0), { f: F1 + 8, P: [-16, 46, 104], T: [0, 4, 4] }];      // f4761 is the end of the film: no join, the last key is yours
export const camAt = (f) => camFrom(CAM_KEYS, f, 0.5);

// ---------- optional hooks, applied in section order for every f: each must leave things as they are outside its frames
// export function flame(f, fl) { if (f >= F0 && f < F1) fl.lit = ...; return fl; }      // fl: gain, h, lx, lz, lit, hinge, flare
// export const fill = (f) => 1;                                                          // a factor on the room fill and the cloth's bounce
// export const grade = (f) => ({ expo: 1, tint: [1, 1, 1], sat: 1 });                    // factors for the final pass

export const BEATS = [];                                    // [frame, word, what happens]

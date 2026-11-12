// stub.js: what story.js uses in place of a section module that fails to load (a syntax error, a missing cue file, a
// wrong frame range): no cues, no beats, and a camera that glides from the join at its first frame to the join at its
// last. So one builder's broken file never stops the other sections from rendering.
import { RANGES, camFrom } from "./lib.js";
import { joinKey, joinFloat } from "./joins.js";
export function stubSection(n) {
  const [F0, F1] = RANGES[n];
  const CAM_KEYS = n === 10 ? [joinKey(F0), { f: F1 + 8, P: [-16, 46, 104], T: [0, 4, 4] }] : [joinKey(F0), joinKey(F1)];
  return { F0, F1, C: {}, CUES: {}, BEATS: [], CAM_KEYS, camAt: (f) => camFrom(CAM_KEYS, f, n === 10 ? 0.5 : joinFloat(F0, F1, f)), stub: true };
}

// story.js: the film, f0 to f4761, in ten sections. A section is a module in js/sections/ that owns its cue names, its
// events and its camera keys, each a pure function of the film frame f (24 fps). This file joins them generically: the
// frame range, which section's camera applies at f, the beat table, and the three hooks any section may export.
// Everything section 5 exports (the layout, its events) is re-exported, because the world is section 5's table: before
// f1800 it is the table as set (section 5's state before its first event), and its functions hold their last state past
// f2544. At any frame the world stands as a function of f alone, with no memory of earlier frames.
//
// A section module exports F0, F1 (as in lib.js RANGES), C (cue names), CAM_KEYS (first key joinKey(F0), last joinKey(F1)),
// camAt(f), BEATS, and optionally, applied in section order for EVERY f (so each must be "no change" outside its frames):
//   flame(f, fl)  change and return the flame's state fl = { gain, h, lx, lz, lit, hinge, flare }:
//                 gain  the key light on the cloth (section 5's flicker, section 7's flare); h the flame card's height;
//                 lx, lz its lean; lit 1 = burning, 0 = out (key light, bounce, glow and every painted piece's tint
//                 follow it down to 6 %); hinge 0 = the flame card up, 1 = folded down on the wick;
//                 flare (section 7, 0 to 1) opens the exposure 12 %.
//   fill(f)       a factor on the room fill and the cloth's bounce
//   grade(f)      { expo, tint: [r, g, b], sat } factors for the final pass (1, [1, 1, 1], 1 = as now)
// Sections 5 to 7 are built and are imported statically. The other seven are loaded one by one: a module that fails
// (a syntax error, a missing cue file, a wrong range) is replaced by its stub (sections/stub.js) and listed in FAILED,
// so one builder's broken file never stops the others. Units: centimetres, y up, the cloth is y = 0, x right, z to the viewer.
import "./sections/joins.js";
import * as S5 from "./sections/s05.js";
import * as S6 from "./sections/s06.js";
import * as S7 from "./sections/s07.js";
import { FPS, FOV, RANGES } from "./sections/lib.js";
import { smooth } from "./kit.js";
import { stubSection } from "./sections/stub.js";
export * from "./sections/s05.js";

export const FAILED = [];                                             // { section, part, error }: what fell back to a stub
export function fail(section, part, e) { const error = String((e && e.stack) || e); FAILED.push({ section, part, error }); console.error(`SECTION ${section} FAILED (${part}): ${error.split("\n").slice(0, 3).join(" | ")}`); }
async function load(n) {
  try {
    const m = await import(`./sections/s${String(n).padStart(2, "0")}.js`);
    if (m.F0 !== RANGES[n][0] || m.F1 !== RANGES[n][1]) throw new Error(`F0, F1 must be ${RANGES[n]}`);
    if (typeof m.camAt !== "function" || !Array.isArray(m.BEATS) || !m.C) throw new Error("a section exports F0, F1, C, CAM_KEYS, camAt and BEATS");
    m.camAt(m.F0); m.camAt(m.F1 - 1);
    return m;
  } catch (e) { fail(n, "section module, using its stub", e); return stubSection(n); }
}
const [S1, S2, S3, S4, S8, S9, S10] = await Promise.all([1, 2, 3, 4, 8, 9, 10].map(load));
export { FPS, FOV, S1, S2, S3, S4, S5, S6, S7, S8, S9, S10 };
export const SECTIONS = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10];
export const F0 = SECTIONS[0].F0, F1 = SECTIONS[SECTIONS.length - 1].F1;
export const sectionAt = (f) => SECTIONS.find((s) => f < s.F1) || SECTIONS[SECTIONS.length - 1];
export const sectionNo = (f) => SECTIONS.indexOf(sectionAt(f)) + 1;
export const camAt = (f) => sectionAt(f).camAt(f);
export const BEATS = SECTIONS.flatMap((s) => s.BEATS);
export const CUES_ALL = Object.assign({}, ...SECTIONS.map((s) => s.CUES || {}));      // sections 5 to 7 keep theirs in js/cues.js

// the standees of sections 5 and 6 (the tree man and the sixteen citizens): section 5 poses them to f2544, section 6
// from there on (its functions hold to the end of the film). Before f1800 they are out of sight; the tree man hinges up
// at the head of his slot over the last ten frames before it, so nothing appears on the join.
export function treemanAt(f) { if (f >= S6.F0) return S6.treemanAt(f); const s = S5.treemanAt(f); if (f < S5.F0) { s.visible = f >= S5.F0 - 10; s.pop = smooth((f - (S5.F0 - 10)) / 8); } return s; }
export const citizenAt = (i, f) => (f < S6.F0 ? S5.citizenAt(i, f) : S6.citizenAt(i, f));

// ---------- the hooks. A hook that throws is reported once and dropped; the others carry on.
const hooks = (name) => SECTIONS.map((s, i) => [i + 1, s[name]]).filter(([, h]) => typeof h === "function").map(([n, h]) => { let dead = false; return (...a) => { if (dead) return undefined; try { return h(...a); } catch (e) { dead = true; fail(n, name + " hook, dropped", e); return undefined; } }; });
const FLAME = hooks("flame"), FILL = hooks("fill"), GRADE = hooks("grade");
// the flame: section 5's flicker (burning, the card up), then every section's flame hook in order
export function flameAt(f) { let fl = S5.flameAt(f); fl.lit = 1; fl.hinge = 0; for (const h of FLAME) fl = h(f, fl) || fl; return fl; }
// the room fill and the cloth's bounce, as a share of section 5's: the product of every section's fill hook
export function fillAt(f) { let k = 1; for (const h of FILL) { const v = h(f); if (typeof v === "number") k *= v; } return k; }
// the grade of the final pass: the flare's 12 % of exposure, times every section's grade hook
export function gradeAt(f) {
  const g = { expo: 1 + 0.12 * (flameAt(f).flare || 0), tint: [1, 1, 1], sat: 1 };
  for (const h of GRADE) { const v = h(f); if (!v) continue; if (typeof v.expo === "number") g.expo *= v.expo; if (v.tint) g.tint = g.tint.map((t, i) => t * v.tint[i]); if (typeof v.sat === "number") g.sat *= v.sat; }
  return g;
}

// story.js: the film so far, section by section. A section is a module in js/sections/ that owns its cue names, its
// events and its camera keys, each a pure function of the film frame f (24 fps). This file joins them: the frame
// range, which section's camera applies at f, which section poses the standees, the light, and the beat table.
// Everything section 5 exports (the layout, its events) is re-exported, because the world is section 5's table and its
// functions hold their last state past f2544: at any frame the city stands as it stood, with no memory of earlier frames.
// To add a section: write js/sections/sNN.js exporting F0, F1, C, camAt, CAM_KEYS (first key: handover(previous keys, F0))
// and BEATS, import it here, add it to SECTIONS, and build its pieces in a skin module that buildSkin calls.
// Units: centimetres, y up, the cloth is y = 0, x to the right, z toward the viewer.
import * as S5 from "./sections/s05.js";
import * as S6 from "./sections/s06.js";
import * as S7 from "./sections/s07.js";
import { FPS, FOV } from "./sections/lib.js";
export * from "./sections/s05.js";
export { FPS, FOV, S5, S6, S7 };
export const SECTIONS = [S5, S6, S7];
export const F0 = SECTIONS[0].F0, F1 = SECTIONS[SECTIONS.length - 1].F1;
export const sectionAt = (f) => SECTIONS.find((s) => f < s.F1) || SECTIONS[SECTIONS.length - 1];
export const camAt = (f) => sectionAt(f).camAt(f);
export const BEATS = SECTIONS.flatMap((s) => s.BEATS);
// the standees: section 5 poses them to f2544, section 6 from there on (its functions hold through section 7)
export const treemanAt = (f) => (f < S6.F0 ? S5.treemanAt(f) : S6.treemanAt(f));
export const citizenAt = (i, f) => (f < S6.F0 ? S5.citizenAt(i, f) : S6.citizenAt(i, f));
// the flame: section 5's flicker, flaring on "escape"
export function flameAt(f) { const fl = S5.flameAt(f), k = f < S7.F0 ? 0 : S7.flareAt(f); if (k) { fl.gain *= 1 + 0.95 * k; fl.h *= 1 + 0.5 * k; fl.flare = k; } return fl; }
// the room fill and the cloth's bounce, as a share of section 5's
export const fillAt = (f) => (f < S6.F0 ? 1 : f < S7.F0 ? S6.fillAt(f) : S7.fillAt(f));

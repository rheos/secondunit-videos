// s07.js: section 7, the seed, f3130 to f3397. Its cue names, its events and its camera keys, all pure functions of
// the film frame. Sections 5 and 6 hold their last state (the walled city, the guards on the wall, the head with the
// bricks over its eyes); this section folds the head away, brings the hand in from the near edge, drops the seed into
// it, raises the pine and fells the wall.
import { CUES } from "../cues.js";
import { clamp, lerp, smooth, smoother, spring } from "../kit.js";
import { camFrom, handover, crane } from "./lib.js";
import * as S6 from "./s06.js";

export const F0 = 3130, F1 = 3397;
const c = (k) => CUES[k].f;
export const C = { then: c("then"), pocket: c("pocket"), took: c("took"), seed: c("seed"), pine: c("pine"), hand: c("hand"), escape: c("escape"), before: c("before"), late: c("late") };

// ---------- the head folds back down into the cloth once the bricks have been held over its eyes for 36 frames
export const HEAD_DOWN = S6.C.prison2 + 36;
export const headDownAt = (f) => smoother((f - HEAD_DOWN) / 14);

// ---------- the open hand: 28 cm from wrist to fingertip, flat on the cloth, palm up, fingers pointing away from the
// near edge. It slides in on its sleeve between the near plate and the right fence. px are pixels of the hand_open plate.
export const HAND = { L: 28, k: 28 / 641, xc: 25.5, zw: 30, travel: 72, in0: C.then - 3, in1: C.pocket };
export const handXZ = (px, py) => [HAND.xc + (px - 630) * HAND.k, HAND.zw + (py - 965) * HAND.k];
export const SEED_PX = { body: [655, 786], tip: [762, 722] };        // where the plate's own painted seed lies (painted out until ours lands)
export const SEED_AT = handXZ(...SEED_PX.body);
export const LAND = C.seed + 9;                                      // the seed falls 5 cm in 9 frames
export function handAt(f) {
  const s = 1 - smoother((f - HAND.in0) / (HAND.in1 - HAND.in0)), g = f - LAND - 3;
  const squeeze = 0.12 * smooth((f - C.hand) / 10);                  // "in my hand": the fingers close a little more
  return { dz: HAND.travel * s, shown: f >= HAND.in0, fold: (k) => spring(g - 2 * k, 0.62, 18) * (1 + squeeze), lead: HAND.zw - HAND.L + HAND.travel * s };
}
// ---------- the pinch hand: a standing card that comes down from above the frame holding the seed, lets go on "seed", lifts away
export const PINCH = { h: 21, hold: 5.6 };
export function pinchAt(f) {
  const down = smoother((f - (C.pocket + 4)) / (C.seed - 4 - (C.pocket + 4))), t = f - C.seed, away = smoother((t - 7) / 24);
  const jerk = t > 0 && t < 8 ? 0.5 * Math.sin((Math.PI * t) / 8) : 0;                               // the fingers let go: a small start upward
  return { y: PINCH.hold + 30 * (1 - down) + jerk + 34 * away, shown: f >= C.pocket + 4 && away < 1, rock: 0.03 * Math.sin(f * 0.5) * (1 - down) + 0.05 * jerk };
}
export function seedAt(f) {
  const p = pinchAt(f), t = f - C.seed, d = t - 9;
  if (t <= 0) return { y: p.y - 0.25, flat: 0, spin: 0, shown: p.shown, held: true };
  const y = t < 9 ? lerp(PINCH.hold - 0.25, 0.3, (t / 9) ** 1.7) : 0.3 + (d < 12 ? 0.45 * Math.abs(Math.sin((Math.PI * d) / 6)) * Math.exp(-d / 3.2) : 0);
  return { y, flat: smooth(t / 8), spin: 2 * Math.PI * 2 * (1 - (1 - clamp(t / 9)) ** 1.5), shown: true, held: false };            // turns on its wing as it falls
}
// ---------- the pine: tiny on "pine tree", then tier by tier from the bottom on "escape", to 60 cm
export const PINE = { h: 60, tiny: 0.05, tiers: 8, at: [SEED_AT[0] + 0.15, SEED_AT[1] - 0.2] };
export const pineAt = (f) => ({ shown: f >= C.pine, tiny: spring(f - C.pine, 0.5, 12), tier: (k) => spring(f - C.escape - 2 * k, 0.55, 14) });
export const pineH = (f) => { const p = pineAt(f); let h = 0; for (let k = 0; k < PINE.tiers; k++) h += (PINE.h / PINE.tiers) * (PINE.tiny * p.tiny + (1 - PINE.tiny) * p.tier(k)); return h; };

// ---------- the wall falls flat outward, the segment nearest the pine first, one every 1.4 frames; the two near
// segments the sleeve crosses were pushed flat inward by the fingertips as the hand came in
export const UNDER = S6.SEGS.filter((s) => s.side === "near" && Math.min(s.a[0], s.b[0]) > 8).map((s) => s.i);
const order = S6.SEGS.filter((s) => !UNDER.includes(s.i)).sort((a, b) => Math.hypot(a.mid[0] - PINE.at[0], a.mid[1] - PINE.at[1]) - Math.hypot(b.mid[0] - PINE.at[0], b.mid[1] - PINE.at[1]));
export const FALL_T = {}; order.forEach((s, r) => { FALL_T[s.i] = Math.round(C.escape + 5 + 1.4 * r); });
const drop = (t) => (t <= 0 ? 0 : t < 9 ? (t / 9) ** 2 : 1 - 0.07 * Math.exp(-(t - 9) / 3) * Math.abs(Math.sin((Math.PI * (t - 9)) / 5)));
export function fallAt(i, f) {             // 0 standing, 1 flat; dir +1 outward, -1 inward (under the sleeve)
  if (UNDER.includes(i)) return { a: smooth((f - HAND.in0) / 6), dir: -1 };
  return { a: drop(f - FALL_T[i]), dir: 1 };
}
// the candle flares on "escape": the brightest frames of the film
export const flareAt = (f) => smooth((f - C.escape) / 12) * (1 - 0.22 * smooth((f - C.escape - 30) / 30));
export const fillAt = (f) => lerp(2 / 3, 0.85, smooth((f - F0) / (C.escape - F0))) + 0.45 * flareAt(f);

// ---------- the camera: carries on from the head without a cut
const palm = [SEED_AT[0] - 0.6, 1, SEED_AT[1] - 0.8], over = (d, deg, dx = 0) => [palm[0] + dx, palm[1] + d * Math.sin((deg * Math.PI) / 180), palm[2] + d * Math.cos((deg * Math.PI) / 180)];
const pineMid = [PINE.at[0], 31, PINE.at[1]], WIDE = [-6, 50, 97], CR0 = C.escape - 8, CR1 = C.escape + 32, CLOSE = over(24, 42, -3.2), CLOSE_T = [palm[0], 2.2, palm[2]];
export const CAM_KEYS = [
  handover(S6.CAM_KEYS, F0),
  { f: 3166, P: S6.CAM_KEYS[S6.CAM_KEYS.length - 1].P, T: S6.CAM_KEYS[S6.CAM_KEYS.length - 1].T },
  // f3166-f3212: drops from the head to the near edge and settles over the palm, looking down 50 degrees
  { f: 3186, P: [32.6, 28, 41], T: [25.5, 9, 6] },
  { f: 3198, P: over(41.5, 49, 6.4), T: [palm[0], 1.6, palm[2] - 1.5] },
  { f: C.took + 2, P: over(41, 50, 3.0), T: palm },
  // f3212-f3260: pushes in on the palm
  { f: C.pine, P: over(27.5, 48, 1.5), T: palm },
  // f3260-f3331: holds close, drifting
  { f: C.hand, P: over(24.5, 44, -0.8), T: [palm[0], 1.6, palm[2]] },
  { f: CR0, P: CLOSE, T: CLOSE_T },
  // f3331-f3397: cranes up and back with the pine, so its top stays in the tall frame. It starts to move eight frames
  // before "escape" and is eased along its line (no snap); then it drifts
  ...Array.from({ length: 19 }, (_, i) => { const f = CR0 + 2 * (i + 1), e = smoother((f - CR0) / (CR1 - CR0)); return { f, P: CLOSE.map((v, k) => lerp(v, WIDE[k], e)), T: CLOSE_T.map((v, k) => lerp(v, pineMid[k], Math.min(1, e * 1.15))) }; }),
  { f: CR1, P: WIDE, T: pineMid },
  { f: F1 + 8, P: [WIDE[0] - 1.5, WIDE[1] + 3.5, WIDE[2] + 5], T: [pineMid[0], 31.5, pineMid[2]] },
];
export const camAt = (f) => camFrom(CAM_KEYS, f, 0.5);

export const BEATS = [
  [HEAD_DOWN, "(hold)", "the head, 36 frames under the bricks, folds back into the cloth"], [C.then, "And then", "the open hand slides in from the near edge on its sleeve"],
  [C.pocket, "pocket", "the pinch hand comes down from above the frame with the seed"], [C.seed, "seed", "the pinch lets go: the seed falls 5 cm, turning on its wing"],
  [LAND, "(lands)", "the seed lands in the palm with a small bounce; the fingers fold up round it"], [C.pine, "pine tree", "a tiny pine springs up from the seed"],
  [C.hand, "my hand", "the fingers close a little more"], [C.escape, "escape", "the pine opens tier by tier to 60 cm; the wall falls outward round the table; the candle flares"],
  [C.before, "before", "the pine stands full"], [F1 - 1, "end", "the pine over the open city"],
];

// ---------- hooks (story.js applies every section's, in section order, for every f). Nothing before f3130; past f3397
// they hold section 7's last state (the flare at 0.78, the fill at 1.2) until a later section's hook changes it.
// fl.flare (0 to 1) also opens the exposure by 12 % (story.js gradeAt): scale it down to let the candle settle.
export function flame(f, fl) { const k = f < F0 ? 0 : flareAt(f); if (k) { fl.gain *= 1 + 0.95 * k; fl.h *= 1 + 0.5 * k; fl.flare = k; } return fl; }
export const fill = (f) => (f < F0 ? 1 : fillAt(f));

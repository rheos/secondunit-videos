// s08.js: section 8, the couple at the edge, f3397 to f3840. Its cue names, its events and its camera keys, all pure
// functions of the film frame f (24 fps). It starts from section 7's last state (the pine at 60 cm, the wall flat, the
// candle flared, the open hand on the cloth): the candle settles, the hand slides back out, a couple with suitcases
// hinge up by the near plate tower and slide along a new slot to the left edge of the cloth, and out in the dark the
// room's other tables come up one by one. Later in the film (this file owns it): the couple hinge down on "remind",
// they and their slot fade from "erased", and the far tables go dark one by one from "soon" to "planet".
// Units: centimetres, y up, the cloth is y = 0, x to the right, z toward the viewer.
import { CUES } from "../cues/s08.js";                  // generated: $PY tools/onsets.py 08 (from tools/cues/s08.json)
import { clamp, lerp, smooth, smoother, spring } from "../kit.js";
import { camRaw, shots } from "./lib.js";
import { joinKey, joinFloat } from "./joins.js";
import * as S7 from "./s07.js";
export { CUES };

export const F0 = 3397, F1 = 3840;
const c = (k) => CUES[k].f;
export const C = {
  chiquita: c("chiquita"), unpleasant: c("unpleasant"), out1: c("out1"), jews: c("jews"), germany: c("germany"), thirties: c("thirties"),
  out2: c("out2"), here: c("here"), problem: c("problem"), go: c("go"), whole: c("whole"), world: c("world"), direction: c("direction"),
  remind: c("remind"), erased: c("erased"), soon: c("soon"), planet: c("planet"),
};

// ---------- the slot: one straight cut from beside the near plate tower to 1.5 cm short of the cloth's left edge. It
// runs along the near left of the table, the one way to the left edge that the basket's and the shakers' shadows do not
// cross, so the couple's own shadow lies long on the cloth; it turns a little toward the far side, so that seen side-on
// from the near edge the whole lit city stands behind them. It crosses the fence line between fence_41 and fence_42
// (the knife at z 42.3 and the spoon at z 35.3) and the fallen wall segment beyond.
export const EDGE = -45, FENCE_X = -40.5, WALL_X = -41.7;
export const COUPLE = { h: 4.5, half: 2.638 };                       // 4.5 cm high; the card is 5.28 cm long (the plate's own shape)
export const START = [-14.5, 47.6], CROSS = [FENCE_X, 40.6];
const dx = CROSS[0] - START[0], dz = CROSS[1] - START[1], dl = Math.hypot(dx, dz);
export const HEAD = [dx / dl, dz / dl], NEAR = [HEAD[1], -HEAD[0]];   // the way they travel; the card's near side (toward the near edge)
const toX = (x) => (x - START[0]) / HEAD[0];                          // how far along the slot a given x is
export const SLOT = { len: toX(EDGE + 1.5), wall: toX(WALL_X), at: (s) => [START[0] + s * HEAD[0], START[1] + s * HEAD[1]] };
export const STOP = SLOT.at(SLOT.len);                                // the drawn stop: the tab's leading end comes up against it
const S0 = COUPLE.half, S1 = SLOT.len - COUPLE.half;                  // the card's middle, lying at the head of the slot and at the stop

// ---------- the couple: flat on the cloth until "Chiquita", then up on their hinge; slow along the slot; faster from
// "out"; at the stop on the second "out"; one more push against it on "here". Posed on twos (the hits are on the frame).
export const UP = C.chiquita, GO = C.chiquita + 10, V1 = 0.085;
const sh1 = (f) => smooth((f - GO) / 8), sh2 = (f) => smooth((f - C.out1) / 10), dec = (f) => 1 - smooth((f - (C.out2 - 12)) / 12);
let A = 0, B = 0; for (let g = GO; g < C.out2; g++) { A += sh1(g + 0.5) * dec(g + 0.5); B += sh2(g + 0.5) * dec(g + 0.5); }
export const V2 = V1 + (S1 - S0 - V1 * A) / B;                        // the faster speed, so that the stop is reached on the cue
export const speedAt = (f) => (f < GO || f >= C.out2 ? 0 : (V1 * sh1(f) + (V2 - V1) * sh2(f)) * dec(f));
const DIST = []; { let s = S0; for (let g = GO; g <= C.out2; g++) { DIST.push(s); s += speedAt(g + 0.5); } DIST[DIST.length - 1] = S1; }
export const sAt = (f) => (f <= GO ? S0 : f >= C.out2 ? S1 : DIST[f - GO]);
// "here": drawn back 4 mm, then up against the stop again on the cue, with one forward rock
const pushAt = (f) => -0.42 * smooth((f - (C.here - 9)) / 6) * (1 - smooth((f - (C.here - 2)) / 2));
const leanAt = (f) => { const t = f - C.here; return t < 0 ? 0.035 * smooth((t + 9) / 6) * (1 - smooth((t + 2) / 2)) : -0.13 * Math.exp(-t / 4.5) * Math.cos((t * Math.PI) / 5); };
// "remind": the last standees to fall. 14 frames and one small bounce, onto the fallen wall
export const dropAt = (t) => (t <= 0 ? 0 : t < 14 ? (t / 14) ** 2.2 : 1 - 0.06 * Math.exp(-(t - 14) / 3) * Math.abs(Math.sin((Math.PI * (t - 14)) / 5)));
export const FADE = 40;
export const fadeAt = (f) => 1 - smooth((f - C.erased) / FADE);       // 1 as painted, 0 blank cloth: the couple and their slot
export function coupleAt(fRaw) {
  const f = fRaw - ((fRaw - 1800) & 1), s = sAt(f) + pushAt(fRaw), [x, z] = SLOT.at(s), v = speedAt(f);
  const rest = f >= C.out2 ? fRaw - (fRaw >= C.here ? C.here : C.out2) : f < GO && fRaw >= UP + 9 ? fRaw - (UP + 9) : 99;
  return { visible: fRaw >= F0 && fadeAt(fRaw) > 0.002, x, z, s, yaw: Math.atan2(-HEAD[1], HEAD[0]), f, walk: clamp(v / 0.1), rest,
    pop: spring(fRaw - UP, 0.62, 14), lean: leanAt(fRaw), fold: dropAt(fRaw - C.remind), fade: fadeAt(fRaw) };
}
// the slot is cut as they go: it is under the lying card from the first frame, and runs 1.7 cm ahead of the tab
export const slotAt = (f) => clamp((sAt(f) + COUPLE.half + 1.7 * smooth((f - (UP + 4)) / 10)) / SLOT.len);

// ---------- the gate: on "out" the two fence cards either side of the slot hinge down flat, outward, onto the fallen
// wall (section 5's pieces, re-posed in this section only). They stand again, behind the lens, before the section ends.
export const GATE = { z: [42.3, 35.3], up: 3815, back: 18 };
export const gateAt = (i, f) => (f < C.out1 || f >= GATE.up + GATE.back ? 0 : spring(f - C.out1 - 3 * i, 0.62, 16) * (1 - smooth((f - GATE.up) / GATE.back)));

// ---------- the open hand (section 7's): the fingers lie back flat, then it slides out over the near edge on its sleeve
export const HAND_OUT = { f0: F0 + 6, f1: F0 + 52 };
export function handAt(f) {
  return { fold: S7.handAt(f).fold(0) * (1 - smooth((f - F0) / 12)), dz: S7.HAND.travel * smoother((f - HAND_OUT.f0) / (HAND_OUT.f1 - HAND_OUT.f0)), gone: f >= HAND_OUT.f1 };
}

// ---------- the room's other tables, out in the dark beyond the left edge: ten, each with its own city and candle.
// Each comes up as its candle catches (a flare, then steady); they go dark one by one from "soon" to "planet".
// name, the frame it comes up, the frame it goes dark. The order follows the lens as it turns out toward the room.
export const TABLES = [
  ["far_c", C.whole, 4698], ["plate_right", C.world, 4690], ["far_d", 3798, 4680], ["plate_hero", 3803, 4670], ["plate_mid", 3808, 4660],
  ["near_b", 3813, 4650], ["near_g", 3816, 4640], ["plate_left", 3819, 4630], ["far_f", 3822, 4619], ["far_e", 3825, C.soon],
].map(([name, up, down], i) => ({ name, up, down, i }));
export function tableAt(i, f) {              // 0 dark, 1 lit (a little over as the candle catches)
  const T = TABLES[i]; if (f < T.up) return 0;
  const lit = Math.min(1.16, spring(f - T.up, 0.5, 20)) * (1 + 0.03 * Math.sin(f * 0.41 + i * 1.7));
  return lit * (1 - smooth((f - T.down) / 10));
}

// ---------- light: the candle settles from section 7's flare, and stays settled for the rest of the film (a later
// section's hooks start from here: the flare at 0, the fill at 0.88 of section 5's)
const settle = (f) => smooth((f - F0) / 64);
export function flame(f, fl) {
  if (f < F0 || !fl.flare) return fl;
  const k = fl.flare, k2 = k * (1 - settle(f));
  fl.gain *= (1 + 0.95 * k2) / (1 + 0.95 * k); fl.h *= (1 + 0.5 * k2) / (1 + 0.5 * k); fl.flare = k2;
  return fl;
}
export const fill = (f) => (f < F0 ? 1 : lerp(1, 0.88 / 1.201, settle(f)));      // section 7 holds 1.201

// ---------- the candle's shadow map (section 5's key light, re-posed in this section only). Its bias is 0.012 of a 600 cm
// range: every shadow starts 7 cm behind its card, so 72 cm from the flame, with the lens 13 cm away, the couple's shadow
// would begin under the lens. For this section the bias eases to BIAS (the shadow starts 2.4 cm behind them) and back.
export const BIAS0 = -0.012, BIAS = -0.004;
export const biasAt = (f) => lerp(BIAS0, BIAS, smooth((f - F0) / 60) * (1 - smooth((f - (C.whole - 10)) / 40)));

// ---------- the camera (camera pass, Nov 13 2026): five shots and four cuts in place of the one unbroken move.
// The come-down from the pine to the couple is kept as a move; the three swings round the couple at table height are cuts,
// to the views cut 05 swung between (behind them for the gate, side-on, the stop), each now held.
const mid = (f) => { const s = coupleAt(f); return [s.x, s.z]; };
const at = (f, y = 2.7, along = 0, out = 0) => { const [x, z] = mid(f); return [x + along * HEAD[0] + out * NEAR[0], y, z + along * HEAD[1] + out * NEAR[1]]; };
// cut 05's key list, whole: the one move from the join at F0 to the join at F1. Two stretches of it are still in the film
// (the come-down, with three keys nudged, and "problem" to "go", exactly); the rest is here for the record.
const KEYS_05 = [
  joinKey(F0),
  { f: 3425, P: [-12.5, 43, 78], T: [-8, 12, 42] },
  { f: 3446, P: [-20, 29, 62.5], T: [-15, 5, 46] },
  { f: 3462, P: [-24.6, 15.5, 59.2], T: [-16.6, 3.4, 46.6] },
  { f: 3476, P: [-26.6, 7.2, 58.3], T: at(3476, 3) },
  { f: 3490, P: [-27.4, 4.4, 57.5], T: at(3490, 2.7) },
  { f: 3522, P: [-22.4, 3.8, 58.6], T: at(3522, 2.6) },
  { f: C.out1, P: [-11.8, 5.6, 58.9], T: [-30.5, 3, 40.5] },
  { f: 3566, P: [-13.6, 7, 58.5], T: [-31, 3, 41] },
  { f: 3580, P: [-24, 5.4, 57.8], T: at(3580, 2.8, 2) },
  { f: 3598, P: at(3598, 2.9, 0, 13.6), T: at(3598, 2.9, -0.6) },
  { f: C.germany, P: at(C.germany, 2.8, 0, 13.4), T: at(C.germany, 2.9, -0.6) },
  { f: C.thirties, P: [-37.2, 3, 53.9], T: at(C.thirties, 2.9, -0.4) },
  { f: C.out2, P: [-35.9, 3.4, 52.6], T: at(C.out2, 2.8) },
  { f: C.here + 6, P: [-34.9, 4, 51.9], T: at(C.here + 6, 2.8) },
  { f: C.problem, P: [-34.5, 5.8, 50.6], T: [-43.5, 3.6, 37] },
  { f: C.go, P: [-34.6, 8.4, 49.6], T: [-45, 3.6, 35.5] },
  { f: 3768, P: [-37, 12.5, 47], T: [-62, 5.5, 25] },
  { f: C.whole, P: [-42, 15.4, 39.5], T: [-84, 8, 20] },
  { f: 3808, P: [-49.5, 17.2, 27.5], T: [-138, 10, 8] },
  joinKey(F1),
];
const i05 = (f) => KEYS_05.findIndex((k) => k.f === f);
// a key of cut 05 with the velocity cut 05 had through it, so the stretch before it stays exactly cut 05's
const pin05 = (f) => { const h = 1e-3, a = camRaw(KEYS_05, f - h), b = camRaw(KEYS_05, f + h), k = KEYS_05[i05(f)];
  return { f, P: k.P, T: k.T, mP: a.P.map((v, i) => (b.P[i] - v) / (2 * h)), mT: a.T.map((v, i) => (b.T[i] - v) / (2 * h)) }; };
// a view from P by bearing (degrees from straight out over the left edge, toward the far side) and pitch, L cm long
const look = (P, deg, pitch, L) => { const b = (deg * Math.PI) / 180, p = (pitch * Math.PI) / 180; return [P[0] - L * Math.cos(b) * Math.cos(p), P[1] + L * Math.sin(p), P[2] - L * Math.sin(b) * Math.cos(p)]; };

// shot 1, f3397 (continuous from section 7): the hand slides out; the lens comes down from the pine to the couple (kept:
// cut 05's move; it grazed fence_36 at 0.7 cm and fence_37 at 2.3 cm, so three keys are moved in from the near fence:
// f3446 by 1.2 cm, f3462 by 2.4 cm and 0.5 cm higher, f3476 by 0.9 cm; the landing key at f3490 is where it was), lands
// beside them as they hinge up on "Chiquita", a little ahead, and from there tracks with them at their own speed.
const LAND = KEYS_05[i05(3490)].P, along1 = (f, y) => { const a = mid(3490), b = mid(f); return [LAND[0] + b[0] - a[0], y, LAND[2] + b[1] - a[1]]; };
const SHOT1 = [
  KEYS_05[0], pin05(3425),                                            // to f3425 exactly as it was
  { f: 3446, P: [-20, 29, 61.3], T: [-15, 5, 46] },                   // over the near fence, 6 to 9 cm above its cards
  { f: 3462, P: [-24.6, 16, 56.8], T: [-16.6, 3.4, 46.6] },           // then down inside it
  { f: 3476, P: [-26.6, 7.2, 57.4], T: at(3476, 3) },
  { f: 3490, P: LAND, T: at(3490, 2.7) },
  { f: 3522, P: along1(3522, 4.3), T: at(3522, 2.7) },
  { f: 3554, P: along1(3554, 4.2), T: at(3554, 2.7) },
  { f: 3586, P: [along1(3554)[0] + 32 * V1 * HEAD[0], 4.1, along1(3554)[2] + 32 * V1 * HEAD[1]], T: [mid(3554)[0] + 32 * V1 * HEAD[0], 2.7, mid(3554)[1] + 32 * V1 * HEAD[1]] },
];
// shot 2, "out" (f3555): low behind the couple, on their near side, looking along the slot to the fence, as cut 05
// framed it: the knife and the spoon (fence_41, fence_42) tip over outward ahead of them and they walk toward the gap.
// The lens goes with them, a little slower than they do (0.16 cm a frame; they go 0.21), rises 0.8 cm and does not turn.
// Cut 05 stood 1.6 cm from fence_35 and 2.7 cm from fence_34 here: this is 1.7 cm further in, in line with the gap
// between those two cards, and moves away from the fence as it goes. It looks 2 degrees further left than cut 05 did,
// so the knife is whole in the frame.
const BEHIND = { P: [-11.7, 5.6, 57.2], look: [-19.41, -16], v: 0.16 };
const behindKey = (f) => { const n = f - C.out1, P = [BEHIND.P[0] + n * BEHIND.v * HEAD[0], BEHIND.P[1] + (0.8 * n) / 49, BEHIND.P[2] + n * BEHIND.v * HEAD[1]]; return { f, P, T: [P[0] + BEHIND.look[0], 3, P[2] + BEHIND.look[1]] }; };
const SHOT2 = [3540, C.out1, 3580, C.jews, 3620].map(behindKey);
// shot 3, "Jews" (f3604): side-on and level with them on the near side, 13 cm away, the lit city behind, their shadow
// coming to the lens: the key image. The lens runs along the slot at a little over half their speed and closes in
// 2.5 cm, because it has to stay inside the corner of the fence that they walk out through: it starts 18 degrees
// behind side-on, and they gain on it, so that at the stop it is where cut 05's lens was (36 degrees behind). Further
// out, or less far behind, fence_40 stands in the left of the frame as they reach the gate.
// frame, degrees behind side-on, cm out from the slot: the lens is that far out, and as far back along the slot as puts
// the point it looks at (0.6 cm behind the middle of their card) at that angle
const SIDE = [[3588, 12.2, 13.2], [C.jews, 18.5, 12.9], [3620, 24.8, 12.3], [3636, 31, 11.5], [3642, 33.2, 11.15], [3648, 34.7, 10.75], [C.out2, 35.5, 10.4], [3670, 36.2, 9.9]];
const SHOT3 = SIDE.map(([f, deg, d]) => { const [x, z] = SLOT.at(sAt(f) - 0.6 - d * Math.tan((deg * Math.PI) / 180)); return { f, P: [x + d * NEAR[0], 2.9 + 0.3 * clamp((f - C.jews) / 50), z + d * NEAR[1]], T: at(Math.min(f, C.out2), 2.9, -0.6) }; });
// shot 4, the second "out" (f3654, the frame they stop): the edge of the cloth, from just outside it, low, looking back
// in at the city, the couple in profile from a little ahead. The push on "here"; the lens pushes in 3 cm to f3701.
const SHOT4 = [
  { f: 3608, P: [-49.9, 3.8, 57], T: [-38.4, 2.6, 41.4] },
  { f: C.thirties, P: [-48.9, 3.7, 55], T: [-39.5, 2.6, 41] },
  { f: 3660, P: [-47.75, 3.6, 52.7], T: [-41, 2.6, 40.5] },
  { f: C.problem, P: [-46.6, 3.5, 50.5], T: [-41, 2.6, 40.5] },
  { f: 3726, P: [-45.95, 3.5, 49.25], T: [-41, 2.6, 40.5] },
];
// shot 5, "problem" (f3702): behind them, looking out past the edge (cut 05's keys and velocity, exactly, to "go").
// Then the lens rises where it is, over the tops of the fence, and turns out to the dark room, where the other tables
// come up from "whole". It stays inside the fence and holds the room to f3839 (section 9 cuts in at f3840). By f3815,
// when the two gate cards stand up again, they and the couple are under the bottom of the frame.
const up4 = (f, P, deg, pitch, L) => ({ f, P, T: look(P, deg, pitch, L) });
const SHOT5 = [
  ...KEYS_05.slice(i05(C.out2), i05(C.go)), pin05(C.go),
  up4(3768, [-34.5, 17.5, 49.9], 47, -10.5, 40),
  up4(3800, [-34.4, 27.2, 50.1], 38.5, -7.5, 50),
  up4(3818, [-34.4, 32, 50.2], 33.5, -6.5, 60),
  up4(3848, [-34.4, 35.5, 50.3], 28, -6, 60),
];
const float8 = (f) => joinFloat(F0, F1, f);
const SHOTS = shots([{ f: F0, keys: SHOT1, float: float8 }, { f: C.out1, keys: SHOT2, float: float8 }, { f: C.jews, keys: SHOT3, float: float8 }, { f: C.out2, keys: SHOT4, float: float8 }, { f: C.problem, keys: SHOT5, float: float8 }]);
export const CAM_KEYS = SHOT5;                                        // the key list of the section's last shot
export const camAt = SHOTS.camAt, CUTS = SHOTS.CUTS;

export const BEATS = [
  [F0, "(start)", "the candle settles; the open hand's fingers lie back and it slides out over the near edge on its sleeve"],
  [C.chiquita, "Chiquita", "the couple hinge up from the cloth by the near plate tower; from f" + GO + " they slide along a new slot, cut as they go"],
  [C.unpleasant, "unpleasant", "sliding slowly, the city behind them"],
  [C.out1, "out", "the two fence cards ahead hinge down outward as a gate; the couple slide faster"],
  [C.jews, "Jews", "two figures with suitcases in profile against the lit towers, their shadow long on the cloth"],
  [C.germany, "Germany", "the same, side-on and close"], [C.thirties, "30s", "the same; they near the fence"],
  [C.out2, "out", "out through the gate over the fallen wall: the tab comes up against the drawn stop, 1.5 cm from the edge"],
  [C.here, "here", "one more push against the stop"],
  [C.problem, "problem", "they stand at the edge"], [C.go, "go", "they stand at the edge; the dark room beyond"],
  [C.whole, "whole", "out in the dark the first table comes up: its candle catches, its small walled city glows"],
  [C.world, "world", "the second; then one every three to five frames"], [C.direction, "direction", "all ten tables are lit"],
  [C.remind, "remind", "(section 10) the couple hinge down flat, the last standees to fall"],
  [C.erased, "erased", "(section 10) the couple and their slot fade to blank cloth over 40 frames"],
  [C.soon, "soon", "(section 10) the far tables go dark one by one"], [C.planet, "planet", "(section 10) the last far table is dark"],
];

// s04.js: section 4, the physicist, f1196 to f1800. Its cue names, its events and its camera keys, every one a pure
// function of the film frame f (24 fps). A folding paper room hinges up left of centre; the physicist slides in on his
// slot; the television, the newspapers and the magazines are cut out of the back wall and drop away; the flap opens on
// one large paper eye; a citizen card turns and its back is a robot; everything folds flat and is drawn off the left edge.
// Units: centimetres, y up, the cloth is y = 0, x to the right, z toward the viewer.
import { CUES } from "../cues/s04.js";                  // generated: $PY tools/onsets.py 04 (from tools/cues/s04.json)
import { clamp, lerp, smooth, smoother, spring } from "../kit.js";
import { camFrom, leg, walker, rev } from "./lib.js";
import { joinKey, joinFloat } from "./joins.js";
export { CUES };

export const F0 = 1196, F1 = 1800;
const c = (k) => CUES[k].f;
export const C = { meeting: c("meeting"), just: c("just"), met: c("met"), swedish: c("swedish"), physicist: c("physicist"), television: c("television"),
  newspapers: c("newspapers"), magazines: c("magazines"), cut: c("cut"), life: c("life"), orwellian: c("orwellian"), nightmare: c("nightmare"),
  everything: c("everything"), robot: c("robot") };

// ---------- the room: its floor's middle is at ROOM.at, it opens toward the near right (yaw 25 degrees from straight
// toward the viewer). Room coordinates: lx along the back wall (to the right as you look in), lz out of the open front,
// the back wall at lz = -D / 2. The floor is a trapezoid as painted: W wide at the back wall, W + 2 * splay at the front.
export const ROOM = { at: [-26, -14], yaw: (25 * Math.PI) / 180, W: 20, H: 12, D: 9, splay: 4.55, y: 0.012 };
const ux = Math.cos(ROOM.yaw), uz = -Math.sin(ROOM.yaw), nx = Math.sin(ROOM.yaw), nz = Math.cos(ROOM.yaw);
export const loc = ([lx, lz]) => [ROOM.at[0] + lx * ux + lz * nx, ROOM.at[1] + lx * uz + lz * nz];       // room (lx, lz) -> table (x, z)
export const loc3 = (lx, y, lz) => { const [x, z] = loc([lx, lz]); return [x, y, z]; };
export const toRoom = (x, z) => [(x - ROOM.at[0]) * ux + (z - ROOM.at[1]) * uz, (x - ROOM.at[0]) * nx + (z - ROOM.at[1]) * nz];
// the flap in the back wall (wall coordinates: lx, height), and the three things that stand flush against the wall:
// middle (lx), width and height in cm, in the order they are cut out
export const FLAP = { x0: -3.547, x1: 3.91, y0: 3.582, y1: 9.455, seam: 0.235 };
export const EYE = { at: [0.18, 6.5], w: 10 };                       // the eye's middle on the wall, its width
export const THINGS = [{ name: "tv", x: -6.9, h: 6.0, cue: C.television }, { name: "newspapers", x: 2.5, w: 4.5, cue: C.newspapers }, { name: "magazines", x: 7.2, h: 4.2, cue: C.magazines }];

// ---------- when things happen (frames). The room folds away after "robot", while the camera is leaving.
export const T = {
  cut: C.meeting,                         // the floor's outline is cut in the cloth, 12 frames
  floor: C.just,                          // the floor flips over about its back edge, 16 frames
  wall: C.met, side: [C.met + 9, C.met + 12],      // the back wall springs up; then the right and the left side wall swing open
  pop: C.swedish, go: C.physicist,        // the physicist hinges up at the head of his slot; he starts to slide
  back: C.robot + 10,                     // the three cut-outs fold back up into their holes
  shut: C.robot + 12,                     // the flap shuts
  down: C.robot + 14,                     // the physicist hinges down flat
  sides: C.robot + 20, fold: C.robot + 26,      // the side walls fold in, the back wall folds down on the floor
  strip: C.robot + 24, draw: C.robot + 38, gone: C.robot + 38 + 36,       // the pull-strip comes in from the left edge; it draws the folded room off
  leave: C.robot + 22,                    // the robot card slides away
  fg: C.nightmare,                        // section 5's soft tableware is hidden until here (the lens is on the eye, far from both)
};
export const cutAt = (f) => clamp((f - T.cut) / 12);
export function floorAt(f) { const t = f - T.floor, d = t - 16; return t <= 0 ? 0 : t < 16 ? smoother(t / 16) : 1 - 0.03 * Math.exp(-d / 3) * Math.abs(Math.sin((Math.PI * d) / 5)); }      // 0 face down, 1 in place; one small bounce
export const wallAt = (f) => spring(f - T.wall, 0.62, 16) * (1 - smooth((f - T.fold) / 12));
export const sideAt = (i, f) => spring(f - T.side[i], 0.6, 16) * (1 - smooth((f - T.sides - 2 * i) / 9));
// a thing on the wall: the dashed cut runs round it in 8 frames from its word, then it tips back through the wall
// about its foot and drops flat behind it (12 frames, one small bounce); the hole stays until it folds back up
const drop = (t) => (t <= 0 ? 0 : t < 12 ? (t / 12) ** 2.2 : 1 - 0.06 * Math.exp(-(t - 12) / 3) * Math.abs(Math.sin((Math.PI * (t - 12)) / 5)));
export function thingAt(i, f) { const t = f - THINGS[i].cue; return { cut: clamp(t / 8), tip: drop(t - 8) * (1 - smooth((f - T.back) / 8)), hole: t >= 8 && f < T.back + 8, dashes: t > 0 && t < 8 }; }
export const holesAt = (f) => THINGS.filter((_, i) => thingAt(i, f).hole).length;       // 0 to 3: they go in order
// the flap: its two doors spring open into the room; the eye's lamp comes on behind it
export const flapAt = (f) => spring(f - C.orwellian, 0.6, 16) * (1 - smooth((f - T.shut) / 9));
export const lampAt = (f) => smooth((f - C.orwellian - 1) / 9) * (1 - smooth((f - T.shut) / 8));
// the iris: at rest as painted; on "nightmare" it slides to him; on "everything" it slides to the lens and stays on it
export const irisAt = (f) => ({ him: smoother((f - C.nightmare) / 12), lens: smoother((f - C.everything) / 12) });

// ---------- the physicist: 5 cm, on a slot from just outside the room's open front to its middle
const VP = 0.2;
export const PHYS_PTS = [[-8.5, 6.2], [-6.9, 4.4], [-5.2, 2.4], [-3.6, 1.1], [-1.9, 0.8]];
const phLeg = leg(PHYS_PTS.map(loc), { start: T.go, v: VP });
export const PHYS = walker({ name: "physicist", legs: [phLeg] });
export const PHYS_STOP = Math.round(phLeg.fb);
export function physicistAt(f) { const s = PHYS.at(f); s.visible = f >= T.pop && f < T.gone; s.pop = smooth((f - T.pop) / 8) * (1 - smooth((f - T.down) / 8)); return s; }
// ---------- the citizen: comes along a slot to just outside the room by "everything"; on "robot" the card turns
// (edge-on for two frames) and its back is the robot; then it slides back the way it came and hinges down
export const CITZ_PTS = [[15.5, 10.1], [12, 9.7], [8.5, 9.5], [5, 9.5]];
const czIn = leg(CITZ_PTS.map(loc), { end: C.everything, v: 0.21 }), czOut = leg(rev(CITZ_PTS.map(loc)), { start: T.leave, v: 0.3 });
export const CITZ = walker({ name: "citizen", legs: [czIn, czOut], turns: [{ f: C.robot }] });
export const CITZ_F = { up: Math.round(czIn.fa - 9), stop: Math.round(czIn.fb), back: Math.round(czOut.fb) };
export function citizenAt(f) {
  const s = CITZ.at(f), g = s.f; s.pop = smooth((g - (czIn.fa - 9)) / 8) * (1 - smooth((g - czOut.fb - 1) / 8)); s.visible = f >= czIn.fa - 10 && f <= czOut.fb + 10;
  s.robot = g >= C.robot + 4;                                         // which face the lens sees (it changes while the card is edge-on)
  s.along = s.leg < 1 ? czIn.sAt(g) : czIn.path.len - czOut.sAt(g);   // how far along the slot from its head
  s.slot = clamp((s.along + 1.7) / czIn.path.len) * (g >= czIn.fa - 2 ? 1 : 0) * (1 - smooth((f - czOut.fb - 2) / 10));       // the slot is cut ahead of the card and closes behind it
  return s;
}
// the drawn-off room: how far the folded packet has slid toward the left edge (cm, along -x)
export const drawAt = (f) => 62 * smoother((f - T.draw) / 36);
export const stripAt = (f) => smoother((f - T.strip) / 12);

// ---------- the camera: from the fallen citizen round the room's right end to its open front, in on the room, close
// along the back wall from one thing to the next, back for the three holes, up to the eye, down to the robot, then
// round the pepper pot to section 5's first key. Keys are in room coordinates (lx, height, lz) unless they say world.
const K = (f, p, t) => ({ f, P: loc3(...p), T: loc3(...t) });
const eye = [EYE.at[0], EYE.at[1], -ROOM.D / 2];
export const CAM_KEYS = [
  joinKey(F0),
  { f: 1232, P: [-9, 7.2, -29.5], T: [-29, 2.5, -32] },               // world: pulls back from the far left corner, panning left
  K(1248, [27, 9.6, 0.5], [0, 1.5, -3.5]),                           // off the room's right end, high enough to see the whole floor
  K(1264, [29.5, 11.5, 4], [0, 1.5, -1.5]),                          // the floor flips over
  K(C.met, [22.5, 8.8, 10.5], [0, 4, -1.5]),                         // the back wall comes up
  K(1298, [13.5, 6, 13.5], [-1, 4, -1]),
  K(1314, [7, 5.5, 15.6], [-4, 3, 2.5]),
  K(1330, [2.5, 5.1, 16.4], [-6.5, 2.6, 4.5]),                       // "Swedish": on the head of his slot
  K(1352, [0, 4.8, 16], [-5, 2.8, 2.6]),                             // follows him in
  K(PHYS_STOP, [-1.5, 4.5, 14], [-2.2, 3, 0.6]),
  K(1412, [-3.2, 4.4, 12.8], [-4.5, 3.2, -2.5]),
  K(C.television, [-5.2, 4.2, 11.5], [-6.9, 3.1, -4.5]),             // close on the television
  K(C.newspapers, [-0.3, 3.6, 11.3], [2.4, 1.8, -4.5]),              // drifts to the newspapers
  K(C.magazines, [4.8, 3.9, 11.4], [7.2, 2.4, -4.5]),                // and to the magazines
  K(C.cut, [3, 4.3, 14.5], [2, 3.2, -3.5]),
  { ...K(C.life, [-0.8, 5, 20.5], [-0.3, 3.7, -4]), mP: [-0.14, -0.014, 0.02] },                       // back: he stands in the room with three holes
  K(1608, [-3.6, 4.3, 18.6], [0, 4.2, -4.2]),
  K(C.orwellian, [0.2, 3.7, 16.9], [0.2, 5.3, -4.5]),                // tilting up as the flap opens
  K(C.nightmare, [0.9, 3.4, 15.7], [0.2, 5.7, -4.5]),                // the key image: the eye over the physicist
  K(C.everything, [0.2, 3.2, 14.9], [0.8, 5.2, -4]),                 // starts down
  K(1730, [-0.7, 3.2, 19.6], [3.6, 3, 4]),
  K(C.robot, [-0.1, 3.1, 22.4], [5, 2.1, 9.5]),                      // down on the citizen as the card turns
  { f: 1778, P: [-15.3, 3.4, 7.6], T: [-17, 2.3, -8] },              // world from here: holds on the robot, creeping right
  { f: 1783, P: [-11.5, 4.2, 8.8], T: [-9, 3, -14] },                // round the pepper pot: it and the salt pass the lens
  { f: 1789, P: [-7.2, 5.2, 6], T: [3, 3.9, -19] },
  { f: 1795, P: [-4.55, 6.02, -0.55], T: [10.8, 4.4, -21.4] },
  joinKey(F1),
];
export const camAt = (f) => camFrom(CAM_KEYS, f, joinFloat(F0, F1, f));

// ---------- hooks. Cooler through the section, coolest while the eye is open; the candle dips a little under the eye.
// Each is exactly "no change" before f1196 and from f1798 on.
const inside = (f) => f >= F0 && f < F1;
const cool = (f) => smooth((f - 1230) / 70) * (1 - smooth((f - (C.robot + 8)) / 26)), eyeOn = (f) => smooth((f - C.orwellian) / 14) * (1 - smooth((f - (C.robot + 4)) / 18));
export function flame(f, fl) { if (inside(f)) { const e = eyeOn(f); if (e > 0) fl.lit *= 1 - 0.2 * e; } return fl; }
export const fill = (f) => (inside(f) ? 1 - 0.1 * cool(f) : 1);
export const grade = (f) => { if (!inside(f)) return null; const k = cool(f), e = eyeOn(f); return k > 0 || e > 0 ? { expo: 1, tint: [1 - 0.045 * k - 0.04 * e, 1 - 0.01 * k, 1 + 0.035 * k + 0.03 * e], sat: 1 - 0.07 * k } : null; };

export const BEATS = [
  [F0, "start", "the camera leaves the fallen citizen, pulling back and panning left"], [C.meeting, "meeting", "the outline of the room's floor is cut in the cloth, left of centre"],
  [C.just, "just", "the floor flips over about its back edge and lies in place (16 frames)"], [C.met, "met", "the back wall springs up, the television, the newspapers and the magazines flush against it; the side walls swing open"],
  [C.swedish, "Swedish", "the physicist hinges up at the head of his slot, outside the open front"], [C.physicist, "physicist", "he slides in along his slot"],
  [PHYS_STOP, "(stops)", "he stops in the middle of the room and the rock settles"], [C.television, "television", "a dashed cut runs round the television; it tips back through the wall and drops away"],
  [C.newspapers, "newspapers", "the same for the newspapers"], [C.magazines, "magazines", "the same for the magazines"],
  [C.cut, "cut", "three holes in their shapes, each with a pale cut edge"], [C.life, "life", "he stands in the room with three holes"],
  [C.orwellian, "Orwellian", "the flap's two doors spring open: one large paper eye, lit from behind"], [C.nightmare, "nightmare", "the iris slides to him"],
  [C.everything, "everything", "the iris slides to the lens; a citizen has come along a slot to just outside the room"], [C.robot, "robot", "the citizen card turns, edge-on for two frames: its back is the robot"],
  [T.shut, "(after)", "the cut-outs fold back, the flap shuts, the physicist hinges down, the walls fold flat"], [T.draw, "(after)", "the folded room is drawn off the left edge on its strip; the robot slides away and hinges down"],
  [F1 - 1, "end", "section 5's first key"],
];

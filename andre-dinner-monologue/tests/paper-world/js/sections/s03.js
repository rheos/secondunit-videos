// s03.js: section 3, the boredom machine, f504 to f1196. Its cue names, its events and its camera keys, all pure
// functions of the film frame f (24 fps). The machine is one flat piece of card on a pull-strip: a spine along the far
// left, three hinge strips (the ranks), a gold coin on a hub (the wheel) and a paper television. It is pushed in over
// the far edge of the table lying flat, pops up, runs, falls asleep, and is drawn off the same way from f1194.
// Units: centimetres, y up, the cloth is y = 0, x to the right, z toward the viewer.
import { CUES } from "../cues/s03.js";                  // generated: $PY tools/onsets.py 03 (from tools/cues/s03.json)
import { clamp, lerp, smooth, smoother, spring } from "../kit.js";
import { shots } from "./lib.js";
import { joinKey, joinFloat } from "./joins.js";
export { CUES };

export const F0 = 504, F1 = 1196;
const c = (k) => CUES[k].f;
export const C = { yes: c("yes"), bored1: c("bored1"), bored2: c("bored2"), process: c("process"), self: c("self"), brainwashing: c("brainwashing"), totalitarian: c("totalitarian"),
  government: c("government"), money: c("money"), dangerous: c("dangerous"), survival: c("survival"), bored3: c("bored3"), asleep1: c("asleep1"), asleep2: c("asleep2"), no: c("no") };
const TAU = 2 * Math.PI, twos = (f) => f - (f & 1);

// ---------- the layout (x, z). The far fork lies flat at x -15 to -12, z -53.5 to -34.5 and the far plate's rim is at
// x = -11: the ranks stop at x = -15.5. The one left standing is the left end of the front rank, where the join looks.
export const EDGE = -65;                                              // the far edge of the cloth
export const RANK = { n: 8, x0: -30.8, dx: 2.05, z: [-50, -54.5, -59], h: 4 };
export const WHEEL = { at: [-27, -31], R: 9, rr: 7.7, lift: 1.7, thick: 0.3, n: 6, turns: 4 };
export const TV = { at: [-35.5, -42.5], h: 7 };
export const SPINE = { x: -32.6, w: 1.0 };
export const SURVIVOR = [RANK.x0, RANK.z[0]];

// ---------- the pull-strip: the whole machine slides in flat over the far edge, and out again after the section
export const SLED = { in0: 508, in1: 558, travel: 57, out0: F1 - 2, out1: F1 + 48, pull: 60 };       // drawn off from f1194: the last one has landed (f1188) and its bounce is over
export const shown = (f) => f >= SLED.in0 && f < SLED.out1;
export const sledAt = (f) => (f < SLED.out0 ? -SLED.travel * (1 - smoother((f - SLED.in0) / (SLED.in1 - SLED.in0))) : -SLED.pull * smoother((f - SLED.out0) / (SLED.out1 - SLED.out0)));

// a card going down flat: it accelerates like something falling, lands on frame d and bounces once
const drop = (t, d, b = 0.07) => (t <= 0 ? 0 : t < d ? (t / d) ** 2.2 : 1 - b * Math.exp(-(t - d) / 3) * Math.abs(Math.sin((Math.PI * (t - d)) / 5)));

// ---------- the ranks: three of eight. The front rank is dealt left to right on the first "bored", two frames apart;
// the two behind it on the second. On "asleep" they go down like dominoes, 1.5 frames apart, rank by rank: the back rank
// right to left, the middle left to right, the front right to left, and the wave stops one short of the front rank's
// left end. That one tips over on "no".
export const CITIZENS = [];
for (let r = 0; r < 3; r++) for (let i = 0; i < RANK.n; i++) CITIZENS.push({ r, i, name: `rank${r + 1}_${i + 1}`, x: RANK.x0 + RANK.dx * i, z: RANK.z[r], up0: (r ? C.bored2 + 5 * (r - 1) : C.bored1) + 2 * i, last: r === 0 && i === 0 });
{ const order = [...CITIZENS.filter((q) => q.r === 2).reverse(), ...CITIZENS.filter((q) => q.r === 1), ...CITIZENS.filter((q) => q.r === 0 && !q.last).reverse()];
  order.forEach((q, k) => { q.fall0 = C.asleep1 + 1.5 * k; }); }
export const LAST_DOWN = Math.max(...CITIZENS.filter((q) => !q.last).map((q) => q.fall0)) + 7;
// the screen's beat: once a second from "brainwashing", read on twos
export const beat = (f) => (f < C.brainwashing ? 0 : 0.5 - 0.5 * Math.cos((TAU * (twos(f) - C.brainwashing)) / 24));
const swing = (f) => Math.sin((TAU * (twos(f) - C.brainwashing)) / 24);
export function citizenAt(q, f) {
  const fall = q.last ? drop(f - C.no, 14, 0.05) : drop(f - q.fall0, 7);
  // from "dangerous" the ranks rock on the screen's beat too, until they go down
  const inStep = smooth((f - C.dangerous) / 30) * (1 - smooth((f - (C.asleep1 - 6)) / 6));
  return { x: q.x, z: q.z + sledAt(f), up: spring(f - q.up0, 0.62, 12), fall, rock: 1.6 * inStep * swing(f), shown: shown(f) };
}

// ---------- the wheel: the coin lifts on its hub on "process" (12 frames and a settle), six riders hinge up on its rim
// two frames apart, and it turns: four whole turns between its start and the second "asleep", so every rider ends where
// it started. The riders rock on twos; from "brainwashing" they rock in step with the screen.
const W0 = C.process + 22, RAMP_IN = 24, RAMP_OUT = 14, W1 = C.asleep2 - W0, W_EQ = W1 - RAMP_IN / 2 + RAMP_OUT / 2;
export const OMEGA = (TAU * WHEEL.turns) / W_EQ;                      // radians a frame at full speed
export function wheelAngle(f) {
  const t = f - W0; if (t <= 0) return 0;
  if (t < RAMP_IN) return (OMEGA * t * t) / (2 * RAMP_IN);
  if (t <= W1) return OMEGA * (t - RAMP_IN / 2);
  const u = Math.min(t - W1, RAMP_OUT); return OMEGA * (W1 - RAMP_IN / 2 + u - (u * u) / (2 * RAMP_OUT));
}
export const WHEEL_STOP = C.asleep2 + RAMP_OUT;
export const COIN_DOWN = SLED.out0 - 12;                              // the coin sinks back on its hub before the strip is drawn
export function wheelAt(f) {
  const up = spring((f - C.process) * (14 / 12), 0.65, 14) * (1 - smooth((f - COIN_DOWN) / 10));
  return { y: WHEEL.lift * up, a: wheelAngle(f), x: WHEEL.at[0], z: WHEEL.at[1] + sledAt(f), shown: shown(f) };
}
const TV_PHI = Math.atan2(TV.at[1] - WHEEL.at[1], TV.at[0] - WHEEL.at[0]);       // where on the rim a rider passes the screen
const PHI0 = TV_PHI + wheelAngle(C.self);                             // rider 1 is in front of the screen on "self-perpetuating"
export const RIDERS = Array.from({ length: WHEEL.n }, (_, j) => ({ j, name: `rider_${j + 1}`, up0: C.process + 8 + 2 * j, down0: WHEEL_STOP - 4 + 2 * j }));
export const RIDERS_DOWN = WHEEL_STOP - 4 + 2 * (WHEEL.n - 1) + 8;
export function riderAt(q, f) {
  const w = wheelAt(f), phi = PHI0 + (TAU * q.j) / WHEEL.n - w.a, inStep = smooth((f - C.brainwashing) / 12), stop = 1 - smooth((f - C.asleep2) / RAMP_OUT);
  const own = Math.sin((twos(f) * Math.PI) / 6 + q.j * 1.9) * 1.3 * smooth((f - W0) / RAMP_IN);       // each on its own, small, while the wheel turns
  return { x: w.x + WHEEL.rr * Math.cos(phi), z: w.z + WHEEL.rr * Math.sin(phi), y: w.y, yaw: Math.atan2(Math.cos(phi), Math.sin(phi)), phi,
    up: spring(f - q.up0, 0.62, 12), fall: drop(f - q.down0, 8), rock: (lerp(own, 3.4 * swing(f), inStep)) * stop, shown: w.shown };
}

// ---------- the television: hinges up beside the wheel after the coin lifts; the screen warms up cold and blank, pulses
// from "brainwashing", harder from "dangerous", and goes dark on the second "asleep". It hinges down again on "no".
const TV_UP = C.process + 14, SCREEN_ON = TV_UP + 13, SCREEN_OFF = C.asleep2 + 2;
export const TV_DOWN = C.no + 4;
export function tvAt(f) {
  const t = f - SCREEN_ON, warm = t <= 0 ? 0 : t < 3 ? 0.5 : t < 5 ? 0.12 : smooth((t - 5) / 8);                 // one flicker as it comes on
  const u = f - SCREEN_OFF, off = u <= 0 ? 1 : u < 5 ? 1 - smooth(u / 5) * 0.92 : u < 7 ? 0.2 : Math.max(0, 0.08 * (1 - (u - 7) / 5));      // it collapses, flicks once, and is out
  const hard = smooth((f - C.dangerous) / 24), b = beat(f), pulse = (0.34 + 0.2 * hard) * (b - 0.35) + 0.03 * Math.sin(f * 1.7);
  const level = warm * off * (0.66 + pulse);
  return { x: TV.at[0], z: TV.at[1] + sledAt(f), up: spring(f - TV_UP, 0.6, 16) * (1 - smooth((f - TV_DOWN) / 10)), level, screen: warm * off,
    // how far the cold light carries over the painted pieces: the riders at first, the nearest rank from "brainwashing", every rank from "dangerous"
    reach: 10 + 9 * smooth((f - C.brainwashing) / 30) + 14 * hard, shown: shown(f) };
}
// "money": a glint crosses the coin's face in 14 frames
export const glintAt = (f) => { const g = (f - C.money + 1) / 15; return g > 0 && g < 1 ? g : -1; };

// ---------- the camera (camera pass, Nov 13 2026): three shots, each a hard cut in. Cut 05 was one move: it flew in from
// the near plate, trucked along the front rank, swung up and over the coin to the wheel, and ran on to the one left
// standing. The flight in and the swing are now cuts; what was already slow is read from cut 05's own key list.
const hub = (dy = 0) => [WHEEL.at[0], 2.4 + dy, WHEEL.at[1]], far = (dy = 0) => [WHEEL.at[0] - 2.5, 2.4 + dy, WHEEL.at[1] - 2];       // far: a little beyond the hub, toward the ranks and the screen
const round = (deg, r, y) => [WHEEL.at[0] + r * Math.sin((deg * Math.PI) / 180), y, WHEEL.at[1] + r * Math.cos((deg * Math.PI) / 180)];      // 0 = the near side, 90 = the right
export const KEY = 790;                                               // the key image: the wheel turning between the ranks and the cold screen
// cut 05's last key (it handed the move on to section 4, which now cuts in at f1196 instead). Kept as the end of CUT05.
export const J1196 = { f: F1, P: [-24.6, 3.4, -41.6], T: [-30.8, 0.9, -51.2], mP: [0.4, 0.1, 0.18], mT: [0.02, -0.02, 0.02] };
// cut 05's one move, whole. No shot reads it directly: the wheel shot takes the keys it keeps from here (pin, below).
const CUT05 = [
  joinKey(F0),
  { f: 524, P: [-19, 10.5, 40], T: [-26, 4, 4] },
  { f: 540, P: [-33, 8.6, 14], T: [-29, 3, -26] },
  { f: 549, P: [-40, 7, -7], T: [-36, 2.4, -46] },
  { f: 557, P: [-41.5, 4.8, -22], T: [-37, 2.2, -50] },
  { f: 562, P: [-39.4, 3.8, -30], T: [-34.5, 2.2, -50] },
  { f: C.bored1, P: [-36.6, 3, -36.8], T: [-30.6, 2.2, -50] },
  { f: 571, P: [-35.4, 2.75, -39.6], T: [-29.4, 2.2, -50.2] },
  { f: 577, P: [-34.6, 2.6, -41.4], T: [-27.6, 2.2, -50.6] },
  { f: C.bored2, P: [-31.2, 2.5, -43], T: [-24.4, 2.3, -52.6] },
  { f: 640, P: [-25.4, 2.9, -42.4], T: [-21.2, 2.4, -53.5] },
  { f: 655, P: [-26.2, 7, -38.6], T: [-24.8, 1.6, -50] },
  { f: C.process, P: [-28.8, 11.5, -24], T: [-27.2, 1.8, -36] },
  { f: 695, P: [-35.6, 10.5, -17.5], T: [-27.4, 2.6, -33.5] },
  // f720-f829: holds on the wheel from low on its near side, the riders passing 12 cm off, the screen to its left and
  // the ranks behind, circling slowly to the right (kept)
  { f: 720, P: round(-23, 19, 7.7), T: far(3) },
  { f: KEY, P: round(-2, 18.5, 7.5), T: far(3) },
  { f: C.brainwashing, P: round(11, 18.5, 7.3), T: far(3) },
  // f829-f1039 in cut 05: up to the coin's face for the glint and down again in 72 frames (replaced: see WHEEL_SHOT)
  { f: C.totalitarian, P: round(24, 20.5, 11), T: far(1.5) },
  { f: C.money, P: round(40, 17.5, 23.5), T: hub(-1.6) },
  { f: C.dangerous, P: round(60, 19, 9), T: hub(1.6) },
  { f: 1000, P: round(80, 18.5, 8), T: [-27.5, 4, -35] },
  // f1039-f1137: round the right side of the wheel to the front of the ranks, a little lift for the dominoes, then
  // along the front rank's wave to the left (kept)
  { f: C.survival, P: round(100, 17.5, 7), T: [-27, 3.6, -42] },
  { f: C.bored3, P: [-13.6, 4.4, -41.5], T: [-23.5, 2, -54] },
  { f: 1116, P: [-14.2, 6.4, -41], T: [-24.5, 1.4, -54] },
  { f: 1137, P: [-19.5, 5, -41.6], T: [-27.5, 1.4, -52] },
  // f1137-f1196 in cut 05: down to the one left standing between the coin's rim and the front rank, 1.4 cm off the coin (replaced)
  { f: C.asleep2, P: [-24.4, 3.5, -41.2], T: [-30.4, 1.8, -50.3] },
  { f: C.no, P: [-27.8, 2.4, -41.5], T: [-30.8, 1.9, -50], mP: [0, 0.03, -0.055] },
  J1196,
];
// a key of cut 05 with the spline's own tangent there written on it (the same limited Catmull-Rom rule as lib.js hermite).
// A shot whose keys change on one side of a pinned key still runs exactly as cut 05 did on the other side of it.
const pin = (f) => { const i = CUT05.findIndex((k) => k.f === f), ka = CUT05[i - 1], kb = CUT05[i], kc = CUT05[i + 1];
  const tan = (ch) => kb["m" + ch] || [0, 1, 2].map((d) => { const d0 = (kb[ch][d] - ka[ch][d]) / (kb.f - ka.f), d1 = (kc[ch][d] - kb[ch][d]) / (kc.f - kb.f), m = (kc[ch][d] - ka[ch][d]) / (kc.f - ka.f);
    return d0 * d1 <= 0 ? 0 : Math.sign(m) * Math.min(Math.abs(m), 3 * Math.abs(d0), 3 * Math.abs(d1)); });
  return { ...kb, mP: tan("P"), mT: tan("T") }; };
const old = (f) => CUT05.find((k) => k.f === f);
const mix = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));

// SHOT 1, f504 (the section's first frame, "Okay, yes"): the machine's arrival. A raised view from the near side, down
// the track it slides in along: the far edge of the cloth is across the top of the frame, and the coin, the strip, the
// flat screen and the flat ranks come over it toward the lens and stop in the middle of the frame. The lens is 23 cm
// up and 15 cm short of where the coin stops, outside the track, drifting left toward the side the wheel shot is on.
// Nothing of the machine is on the cloth before f527: the sled starts 57 cm beyond the far edge at f508 and nothing is
// drawn beyond the edge, so the first 23 frames are the bare far end of the table whatever the lens does.
const ARRIVAL_SHOT = [
  { f: 470, P: [-23.8, 24.8, -3.9], T: [-29.5, 1, -39] },             // before the shot: only gives the spline its heading
  { f: F0, P: [-27.3, 24, -5], T: [-29.5, 1, -39] },
  { f: C.bored1, P: [-33.7, 22.5, -7], T: [-29.5, 1, -39] },          // the cut: the shot never reads this key
  { f: 600, P: [-38.4, 21.4, -8.4], T: [-29.5, 1, -39] },
];

// SHOT 2, f567 ("bored", the frame the first citizen starts to hinge up; the machine has been at rest for 9 frames): the
// ranks, low and close, from the left end of the front rank. It is on the first citizen as the front rank is dealt and
// trucks along the rank while the two behind it come up. 0.08 to 0.15 cm a frame, 0.16 degrees a frame at most. It is
// 3.3 cm or more above the flat strip (cut 05: 2.3) and 6 cm or more off every standing card.
// (The keys before f567 are from when this shot began at f504: they are not read, they only set the heading at f567.)
const RANKS_SHOT = [
  { f: 470, P: [-42.1, 3.8, -31.8], T: [-31.6, 2.2, -49.6] },        // before the shot: only gives the spline its heading
  { f: F0, P: [-40, 3.7, -34.6], T: [-31.2, 2.2, -49.8] },
  { f: 546, P: [-37.8, 3.8, -38.2], T: [-30.7, 2.2, -50] },         // the machine is nearly in place
  { f: C.bored1, P: [-35.7, 3.7, -40.8], T: [-30, 2.2, -50.2] },      // on the first of the rank as it hinges up
  { f: 582, P: [-34, 3.5, -41.9], T: [-28.9, 2.2, -51] },
  { f: C.bored2, P: [-32, 3.5, -42.9], T: [-27, 2.3, -52] },          // the two ranks behind come up
  { f: 640, P: [-28, 3.5, -43.1], T: [-22.9, 2.4, -52.6] },
  { f: C.process, P: [-24.8, 3.5, -42.9], T: [-19.8, 2.4, -52.6] },   // the cut: the shot never reads this key
  { f: 700, P: [-21.8, 3.5, -42.7], T: [-16.9, 2.4, -52.5] },
];

// SHOT 3, f671 ("process", the frame the coin starts to lift): the wheel, from low on its near side, about where cut
// 05's swing settled at f720. It pushes in a little along cut 05's own circle into the f720 key and from there IS cut
// 05 (f720-f829 and f1039-f1137 are the same frames), except:
// - f829-f1039, the lift onto the coin's face. Still a move, eased: up over 76 frames (cut 05: 24), on the face from
//   f905 to f948 (the seal is in from f852 and fades from f948; the glint is f913-f927), down over 91 (cut 05: 48).
//   0.80 degrees a frame at most (cut 05: 1.56).
// - f1137-f1196, the last one standing: one push along the line of sight, 2 cm further from the coin (3.5 cm or more
//   off it; cut 05: 1.4) and 3.4 cm above the strip. It holds on it to the section's last frame: section 4 cuts in.
const WHEEL_SHOT = [
  { f: 640, P: round(-39, 23.2, 9.3), T: far(3) },                   // before the shot: only gives the spline its heading
  { f: C.process, P: round(-33, 21.5, 8.6), T: far(3) },             // a little wider than f720, pushing in
  pin(720), old(KEY), pin(C.brainwashing),
  { f: 850, P: round(15.5, 18.8, 10.6), T: mix(far(3), hub(-1.6), 0.28) },
  { f: 870, P: round(20, 18.8, 14.8), T: mix(far(3), hub(-1.6), 0.56) },
  { f: 888, P: round(24.5, 18.4, 18.6), T: mix(far(3), hub(-1.6), 0.82) },
  { f: 905, P: round(28.5, 18, 21.2), T: hub(-1.6) },                // on the coin's face: the seal
  { f: 925, P: round(33.5, 17.8, 22), T: hub(-1.6) },                // "money": the glint crosses
  { f: 948, P: round(39.5, 17.8, 21.8), T: hub(-1.6) },              // the seal starts to fade: down again
  { f: 970, P: round(50, 18, 18.6), T: [-27, 1.4, -32.6] },
  { f: 990, P: round(62, 18.3, 14), T: [-27, 2.3, -35.2] },
  { f: 1008, P: round(75, 18.3, 10.2), T: [-27, 3, -38] },
  { f: 1024, P: round(88, 18, 8), T: [-27, 3.4, -40.4] },
  pin(C.survival), old(C.bored3), old(1116), pin(1137),
  // one push along the lens's own line of sight to the one left standing (a sideways move this close turns the view a degree a frame)
  { f: C.asleep2, P: [-22.8, 4.2, -42.9], T: [-29.6, 1.7, -50.8] },
  { f: C.no, P: [-25.63, 3.7, -43.38], T: [-30.8, 1.8, -50.1] },     // 8.4 cm off it as it tips (cut 05: 9)
  { f: F1, P: [-26.71, 3.5, -44.57], T: [-30.8, 1.5, -50.4] },       // 6.8 cm off: it lies flat and the lens is still on it (section 4 cuts in here)
  { f: F1 + 24, P: [-28, 3.4, -46], T: [-30.8, 1.3, -50.7] },        // past the shot: only gives the spline its heading
];
const float = (f) => joinFloat(F0, F1, f);
export const { camAt, CUTS } = shots([{ f: F0, keys: ARRIVAL_SHOT, float }, { f: C.bored1, keys: RANKS_SHOT, float }, { f: C.process, keys: WHEEL_SHOT, float }], true);
export const CAM_KEYS = WHEEL_SHOT;                                   // the last shot's keys

export const BEATS = [
  [SLED.in0, "(before yes)", "the machine slides in flat over the far edge on its pull-strip: a spine, three hinge strips, the coin, the screen"],
  [C.bored1, "bored", "the front rank of eight identical citizens hinges up, dealt left to right two frames apart"],
  [C.bored2, "bored", "two more ranks hinge up behind it"],
  [C.process, "process", "the coin lifts on its hub; six riders hinge up on its rim; the television hinges up beside it and its screen comes on cold"],
  [W0, "(22 frames on)", "the wheel starts to turn"],
  [C.self, "self", "a rider passes the screen: it will come back to where it started"],
  [KEY, "(hold)", "the key image: the wheel turning between the ranks and the cold screen"],
  [C.brainwashing, "brainwashing", "the screen pulses once a second; the riders rock in step; the cold light reaches the nearest rank"],
  [C.government, "government", "the lens is climbing onto the coin's face (from \"brainwashing\"; on it f905 to f948, while the seal shows)"],
  [C.money, "money", "a glint crosses the coin's face"],
  [C.dangerous, "dangerous", "the screen pulses harder; the cold light reaches every rank and they rock on its beat"],
  [C.bored3, "bored", "the ranks stand still"],
  [C.asleep1, "asleep", "the ranks hinge down flat like dominoes, 1.5 frames apart, rank by rank"],
  [C.asleep2, "asleep", "the wheel slows and stops where it started; the riders lie down; the screen goes dark; one citizen is left standing"],
  [C.no, "no", "it tips over slowly, bounces once and lies flat; the lens is 8 cm off it, just above its head, and stays on it to the section's last frame"],
  [SLED.out0, "(after)", "the flat cards, the coin and the screen are drawn off over the far edge on the pull-strip"],
];

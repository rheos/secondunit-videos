// s03.js: section 3, the boredom machine, f504 to f1196. Its cue names, its events and its camera keys, all pure
// functions of the film frame f (24 fps). The machine is one flat piece of card on a pull-strip: a spine along the far
// left, three hinge strips (the ranks), a gold coin on a hub (the wheel) and a paper television. It is pushed in over
// the far edge of the table lying flat, pops up, runs, falls asleep, and is drawn off the same way after f1196.
// Units: centimetres, y up, the cloth is y = 0, x to the right, z toward the viewer.
import { CUES } from "../cues/s03.js";                  // generated: $PY tools/onsets.py 03 (from tools/cues/s03.json)
import { clamp, lerp, smooth, smoother, spring } from "../kit.js";
import { camFrom } from "./lib.js";
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
export const SLED = { in0: 508, in1: 558, travel: 57, out0: F1 + 2, out1: F1 + 46, pull: 60 };
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

// ---------- the camera: one move. It crosses the table from the near plate round the left of the basket, trucks along
// the front rank as it is dealt, backs up and over the coin as it lifts, holds on the wheel between the ranks and the
// screen while circling to the right, rises over the coin for the glint, comes down round its right side to the ranks,
// lifts a little for the dominoes and drops to the one left standing.
const hub = (dy = 0) => [WHEEL.at[0], 2.4 + dy, WHEEL.at[1]];
const round = (deg, r, y) => [WHEEL.at[0] + r * Math.sin((deg * Math.PI) / 180), y, WHEEL.at[1] + r * Math.cos((deg * Math.PI) / 180)];      // 0 = the near side, 90 = the right
export const KEY = 790;                                               // the key image: the wheel turning between the ranks and the cold screen
export const CAM_KEYS = [
  joinKey(F0),
  // f504-f567: crosses the table low, left of the basket and down the left side, to the left end of the front rank
  { f: 524, P: [-19, 10.5, 40], T: [-26, 4, 4] },
  { f: 540, P: [-32, 8.4, 14], T: [-27, 3, -26] },
  { f: 550, P: [-38, 6.8, -10], T: [-27, 2.6, -44] },
  { f: 559, P: [-38, 5.4, -27], T: [-25.2, 2.4, -50] },
  { f: C.bored1, P: [-36.8, 4.7, -36.6], T: [-24.6, 2.4, -51] },
  { f: 577, P: [-35.4, 4.6, -39], T: [-24.4, 2.5, -51.6] },
  // f567-f640: trucks along the front rank, close, as it is dealt and the two ranks behind it come up
  { f: C.bored2, P: [-31.6, 4.6, -40.4], T: [-24.6, 2.7, -53] },
  { f: 640, P: [-26.6, 5, -40], T: [-22, 2.7, -53.5] },
  // f640-f715: backs up and over the coin as it lifts, to the near side of the wheel
  { f: C.process, P: [-29.4, 8.6, -23.5], T: [-27.2, 1.8, -37] },
  { f: 695, P: [-34, 15, -9.5], T: [-27.6, 2.2, -35.5] },
  // f715-f829: holds on the wheel, the screen to its left and the ranks behind, circling slowly to the right
  { f: 720, P: round(-20, 26.5, 18.5), T: hub(-0.2) },
  { f: KEY, P: round(-2, 27, 19), T: hub(0) },
  { f: C.brainwashing, P: round(10, 26.5, 18.5), T: hub(-0.2) },
  // f829-f913: circles on, then up to see the coin's face for the glint
  { f: C.totalitarian, P: round(24, 25, 17.5), T: hub(-0.4) },
  { f: C.money, P: round(40, 17.5, 23.5), T: hub(-1.6) },
  // f913-f1093: down again, round the right side of the wheel to the front of the ranks
  { f: C.dangerous, P: round(60, 21.5, 13), T: hub(0) },
  { f: 1000, P: round(80, 20, 10.5), T: [-27.5, 2.4, -35] },
  { f: C.survival, P: round(100, 18, 9), T: [-27, 2.2, -42] },
  { f: C.bored3, P: [-13.4, 8, -39.5], T: [-24.5, 1.8, -53.5] },
  // f1104-f1140: lifts a little for the dominoes
  { f: 1124, P: [-15.4, 10.8, -38.2], T: [-25.5, 1.5, -53.5] },
  // f1140-f1196: down to the one left standing, close: the join
  { f: C.asleep2, P: [-17.8, 7.6, -39.6], T: [-29.4, 2, -50.6] },
  { f: C.no, P: [-18.6, 5.5, -40.2], T: [-30.4, 2.2, -50.2] },
  joinKey(F1),
];
export const camAt = (f) => camFrom(CAM_KEYS, f, joinFloat(F0, F1, f));

export const BEATS = [
  [SLED.in0, "(before yes)", "the machine slides in flat over the far edge on its pull-strip: a spine, three hinge strips, the coin, the screen"],
  [C.bored1, "bored", "the front rank of eight identical citizens hinges up, dealt left to right two frames apart"],
  [C.bored2, "bored", "two more ranks hinge up behind it"],
  [C.process, "process", "the coin lifts on its hub; six riders hinge up on its rim; the television hinges up beside it and its screen comes on cold"],
  [W0, "(22 frames on)", "the wheel starts to turn"],
  [C.self, "self", "a rider passes the screen: it will come back to where it started"],
  [KEY, "(hold)", "the key image: the wheel turning between the ranks and the cold screen"],
  [C.brainwashing, "brainwashing", "the screen pulses once a second; the riders rock in step; the cold light reaches the nearest rank"],
  [C.government, "government", "the camera climbs over the coin"],
  [C.money, "money", "a glint crosses the coin's face"],
  [C.dangerous, "dangerous", "the screen pulses harder; the cold light reaches every rank and they rock on its beat"],
  [C.bored3, "bored", "the ranks stand still"],
  [C.asleep1, "asleep", "the ranks hinge down flat like dominoes, 1.5 frames apart, rank by rank"],
  [C.asleep2, "asleep", "the wheel slows and stops where it started; the riders lie down; the screen goes dark; one citizen is left standing"],
  [C.no, "no", "it tips over slowly, bounces once and lies flat"],
  [SLED.out0, "(after)", "the flat cards, the coin and the screen are drawn off over the far edge on the pull-strip"],
];

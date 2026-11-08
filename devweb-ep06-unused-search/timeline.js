// devweb ep 6 (plain words): every time in the film, on Chris's words, plus the pure clocks more than one station reads.
// No Three.js and no DOM here, so check-graybox.mjs, camera-set.mjs and cues.js can load it in plain node. Everything
// is a pure function of t. The main prop is the search machine (world-plan-v2.md, from design/machine-test.html): one
// slot in, one spout out, a spring-held lever that a tabbed card throws. Its schedule lives here, so the machine, Blink,
// the cards and the sound all read the same numbers.
const VO = globalThis.VO;

// ---------- small maths (the kit's own formulas; kit/world.js imports three, so it can't load in node) ----------
export const cl = (x) => Math.max(0, Math.min(1, x));
export const io = (x) => { x = cl(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const r01 = (t, a, d) => cl((t - a) / d);
export const mix = (a, b, k) => a + (b - a) * k;
export const back = (x) => { x = cl(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const softBack = (x, c1 = 0.9) => { x = cl(x); const c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const ss = (x) => { x = cl(x); return x * x * x * (x * (x * 6 - 15) + 10); };
// the test's settle: a bump that rises and settles to zero with zero speed at both ends (one overshoot, one thunk)
export const settle = (u) => (u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u) * (1 - u) * 1.72);
export const bump = (t, a, d) => { const u = (t - a) / d; return u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u); };

// ---------- anchors: [word, occurrence, offset, the film second the storyboard expects]. hNN = hold NN starts. ----------
export const ANCHORS = {
  h01: ["i", 1, 0, 0.12], smarter: ["smarter", 1, 0, 1.38], h02: ["it", 1, 0, 2.58], h03: ["here's", 1, 0, 4.14], my2: ["my", 2, 0, 5.2],
  h04: ["and", 1, 0, 6.84], h05: ["in", 1, 0, 9.54], july: ["july", 1, 0, 9.72], added: ["added", 1, 0, 10.4],
  h06: ["i", 3, 0, 13.68], anything: ["anything", 1, 0, 14.44], h07: ["so", 1, 0, 16.5], old2: ["old", 2, 0, 17.4], dflt: ["default", 1, 0, 18.3],
  h08: ["ask", 1, 0, 19.06], special: ["special", 1, 0.1, 19.76],
  h09: ["that's", 1, 0, 22.52], nothing2: ["nothing", 2, 0, 25.48],
  h10: ["but", 1, 0, 26.42], is1: ["is", 1, 0, 27.18],
  h11: ["it", 4, 0, 29.56], new1: ["new", 1, 0, 30.4], listed: ["listed", 1, 0, 31.54], desc: ["description", 1, 0, 32.7],
  h12: ["it", 5, 0, 33.5], ask2: ["ask", 2, 0, 34.24],
  h13: ["in", 3, 0, 35.28], n36: ["36", 1, 0, 36.2], one3: ["one", 3, 0, 38.84],
  h14: ["and", 4, 0, 39.5], h15: ["a", 5, 0, 40.96], uses: ["uses", 1, 0, 41.84],
  h16: ["so", 2, 0, 45.46], changedEnd: ["changed", 1, 0.34, 46.4],
  h17: ["53", 1, 0, 47.24], i5: ["i", 5, 0.1, 48.02],
  h18: ["i", 6, 0, 48.76], a6: ["a", 6, 0, 49.54], written: ["written", 1, 0, 49.88],
  h19: ["that", 6, 0, 51.96], day: ["day", 1, 0.2, 52.78],
  h20: ["i", 7, 0, 54.96], but2: ["but", 2, 0, 56.54], id: ["i'd", 1, 0, 57.6],
  h21: ["here's", 2, 0, 58.0], h22: ["it", 10, 0, 61.82], list: ["list", 1, 0.2, 62.64], dflt2: ["default", 2, 0, 63.5],
  h23: ["so", 3, 0, 64.38], new2: ["new", 2, 0, 65.38],
  h24: ["either", 1, 0, 66.14], thing: ["thing", 1, 0, 66.92], h25: ["or", 1, 0, 68.08],
  h26: ["then", 1, 0, 70.84], logs2: ["logs", 2, 0, 71.62],
  h27: ["otherwise", 1, 0, 73.8], built: ["built", 1, 0, 74.62], still: ["still", 1, 0, 76.8], old4: ["old", 4, 0, 77.56],
  endIn: ["one", 4, 0.36, 78.1],
};
export const T = Object.fromEntries(Object.entries(ANCHORS).map(([k, [word, n, off]]) => [k, VO.w(word, n) + off]));
T.END = VO.END;

// ---------- the set, in world units (Blink's body half-width = 1). Blink stands in front of everything. ----------
export const FOOT_Y = -0.88;
// Blink's spot (world-plan-v2 section 0): left of the machine, 0.2 nearer, turned a little toward it
export const BLINK = { x: -1.2, y: FOOT_Y, z: 0.2, yaw: 0.2 };
export const BLINK_X = BLINK.x; // read by mark.js and cards.js until they move to BLINK
// the machine: the test's geometry (design/machine-test.html) in one group, scaled and placed. mw() maps test-local to world.
export const MACHINE_S = 0.8;
export const MACHINE_AT = [-0.02, 0.34, -0.67];
export const mw = (l) => [MACHINE_AT[0] + MACHINE_S * l[0], MACHINE_AT[1] + MACHINE_S * l[1], MACHINE_AT[2] + MACHINE_S * l[2]];
// the machine's named anchors, test-local (world-plan-v2 section 1.1). machine.at(name) gives the same points in the browser.
export const ML = {
  floor: [0.15, -1.525, -2.6], plinthTop: [0.15, -0.9, -2.6],
  switchCentre: [0.15, 3.25, -1.27], pivot: [0.15, 2.95, -1.2],
  knobOld: [-0.42, 3.66, -0.61], knobMid: [0.15, 3.81, -0.61], knobNew: [0.72, 3.66, -0.61],
  stopOld: [-0.325, 3.49, -1.21], stopNew: [0.625, 3.49, -1.21],
  anchor: [-0.71, 3.55, -0.97], tag: [-0.77, 3.29, -0.91],
  // the new label sits at x 1.40, not the plan's 1.05: at 1.05 its inner third is inside the switch housing (r 0.86 at y 2.66)
  labelOld: [-1.05, 2.52, -1.35], labelNew: [1.4, 2.66, -1.35], labelNewParked: [2.3, 2.66, -1.35],
  pilot: [1.1, 3.12, -1.5], core: [1.57, 3.62, -1.68],
  slot: [0.57, 2.18, -1.4], slotFront: [0.57, 2.18, -1.228], lip: [0.57, 2.08, -1.1], feeler: [0.87, 2.3, -1.2],
  inPlaque: [-0.13, 2.2, -1.2], spout: [-0.71, 1.5, -1.02], outPlaque: [-0.35, 1.9, -0.97],
  bin: [0.45, 1.3, -1.85], binHinge: [0.45, 1.04, -1.85],
  // the placard is 1.5 wide (machine.js PLACARD_W), centred at 0.55 so it sits right of the knob on the old stop (x -0.57 to
  // -0.27) and holds 11 and 22 read its lines past the knob; its rods stay on the housing's top rivets
  lid: [0.13, 4.3, -1.6], placard: [0.55, 3.78, -0.8], rodL: [-0.13, 4.11, -1.61], rodR: [0.43, 4.11, -1.61],
  stackTop: [-0.45, 5.45, -2.7], whistle: [0.25, 5.3, -2.5], bulb: [0.45, 5.4, -2.55], lampTag: [0.45, 5.1, -2.5],
  shelf: [-1.4, 4.45, -2.1], counterHinge: [-1.4, 4.48, -2.46], counterUp: [-1.4, 4.84, -2.46],
  bellows: [-0.85, 2.0, -2.3], gear1: [-1.05, 3.82, -1.88],
};
// the older programs (world units, section 1.3): three boxes on the floor lower right, feeders into one trunk to the
// slot's lip, a return trough from under the spout and a lane back to each box. Built by stations/programs.js.
export const PROGRAMS = {
  boxes: [{ at: [0.8, -0.63, -0.2], yaw: -0.4, from: null }, { at: [1.2, -0.63, -1.1], yaw: -0.4, from: 3.3 }, { at: [1.5, -0.63, -2.1], yaw: -0.4, from: 3.6 }],
  slideIn: [T.h06 + 0.1, 0.6], // programs 2 and 3 ride in along x on hold 06, 3 is 0.15 s behind 2
  J: [1.3, 0.9, -1.0],
  feeders: [[[0.8, -0.4, -0.2], [0.95, 0.3, -0.5]], [[1.2, -0.4, -1.1], [1.3, 0.3, -1.1]], [[1.5, -0.4, -2.1], [1.5, 0.3, -1.6]]],
  trunk: [[1.3, 0.9, -1.0], [0.95, 1.5, -1.25], [0.48, 2.0, -1.45]],
  queue: [0.92, 0.67, 0.42, 0.17], // Q0..Q3 as trunk arc fractions
  trough: [[-0.59, 1.15, -1.45], [-0.2, 0.95, -1.35], [0.5, 0.78, -1.25], [1.3, 0.62, -1.05]],
  lanes: [[[1.3, 0.62, -1.05], [0.8, -0.35, -0.2]], [[1.3, 0.62, -1.05], [1.2, -0.35, -1.1]], [[1.3, 0.62, -1.05], [1.5, -0.35, -2.1]]],
  stanchions: [-0.3, 0.9],
};
export const STRIP = { left: -1.7, w: 3.2, y: 5.2, z: -1.0 }; // the calendar strip's band above the machine's crown

// ---------- keyed values ----------
const hex = (h) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
export function colAt(track, t, d = 0.25) {
  let i = 0;
  for (let j = 0; j < track.length; j++) if (t >= track[j][0]) i = j;
  const cur = hex(track[i][1]), prev = i > 0 ? hex(track[i - 1][1]) : cur, k = r01(t, track[i][0], d);
  return [mix(prev[0], cur[0], k), mix(prev[1], cur[1], k), mix(prev[2], cur[2], k)];
}
export function spanAlpha(spans, t, d = 0.15) {
  let a = 0;
  for (const [from, to] of spans) a = Math.max(a, r01(t, from, d) * (1 - r01(t, to, d)));
  return a;
}
// the world dims under the end mark; the lamp and Blink don't read this
export const worldDim = (t) => 1 - 0.8 * io(r01(t, T.endIn, 0.5)); // 0.62 left the plate's words readable under the end mark

// ---------- the counter: old search, climbing to 36 of 37. The other call is never labelled. ----------
export const COUNT_IN = T.h13 + 0.55;
export const counterAlpha = (t) => r01(t, COUNT_IN, 0.3) * (1 - r01(t, T.h16, 0.4));
export const counterN = (t) => (t < COUNT_IN ? 0 : t >= T.one3 ? 36 : Math.floor(36 * r01(t, COUNT_IN, T.one3 - COUNT_IN) + 1e-6));
// the counter stands up on its shelf for the mass moment (one small overshoot) and lies down again on hold 16
export const counterUp = (t) => (io(r01(t, T.h13 + 0.3, 0.5)) + (0.06 / (Math.PI / 2)) * settle(r01(t, T.h13 + 0.65, 0.4))) * (1 - io(r01(t, T.h16, 0.4)));
// the errors bin tips out of the foot trunk on hold 15 and back on hold 16
export const binOut = (t) => softBack(r01(t, T.h15, 0.45)) * (1 - io(r01(t, T.h16, 0.4)));

// ---------- the calendar strip ----------
export const MARKER = [T.h17 + 0.05, T.h17 + 1.05]; // runs July to day 53, stops
export const dayLit = (t) => t >= MARKER[1] && t < T.h20 + 0.45; // the strip now rolls away at hold 20

// ---------- Blink's blinks (stations/mark.js draws them: 0.2 s each, close 4 f, shut 2 f, open 6 f at 60 fps) ----------
// Start times. Here, not in mark.js, so cues.js can declare each one to forensics as a designed change.
export const BLINKS = [T.h03 - 0.04, T.my2 + 1.06, T.h04 + 1.06, T.july - 0.04, T.added + 1.06, T.h06 + 0.16, T.old2 - 0.04, T.h09 + 0.16,
  T.h11 + 0.26, T.one3 + 0.5, /* T.h14 - 0.04 removed: 0.12 s after the one before it, the two ran together as a flutter (finish forensics, 39.52 s) */ T.uses + 0.3, T.uses + 2.37, T.changedEnd - 0.05, T.h18 - 0.04, T.h20 - 0.06, T.h20 + 0.8, T.h21 - 0.04,
  T.h21 + 1.26, T.h23 - 0.04, T.h25 + 0.06, T.h25 + 1.26, T.h26 + 0.3, T.endIn + 0.5];

// ---------- the cards: one plan (world-plan-v2 section 3), read by cards.js (motion), machine.js (knocks, runs, feeler,
// puffs), programs.js (which lane), mark.js (the beam, the gaze) and cues.js. One row per card:
//   from: "blink" | 1 | 2 | 3   the sender          out: leaves the sender (beam release / rises off its box)
//   to: "slot" | "Q0".."Q3"     first destination   steps: [[t, "Q1"], ...] later moves down the line
//   in: enters the slot (the knock; the run starts here)   result: the result leaves the spout
//   tab: hold 19's blue tab (lifts the feeler; no knock)   dot: Blink's mint dot
//   open: the beam opens here instead of out - 0.5          flight: the result's flight to the beam (cards.js: 0.55 if unset)
const c8 = T.h08, c12 = T.h12;
export const CARD_PLAN = [
  { from: 1, out: T.h04 + 0.05, to: "slot", in: T.h04 + 0.95, result: T.h04 + 1.75 },
  { from: 1, out: T.h06 + 0.35, to: "Q0", in: c8 + 0.25, result: c8 + 1.05 },
  { from: 2, out: T.h06 + 0.5, to: "Q1", steps: [[c8 + 0.6, "Q0"]], in: c8 + 1.25, result: c8 + 2.05 },
  { from: 3, out: T.h06 + 0.65, to: "Q2", steps: [[c8 + 0.6, "Q1"], [c8 + 1.6, "Q0"]], in: c8 + 2.25, result: c8 + 3.05 },
  { from: 1, out: T.h06 + 0.9, to: "Q3", steps: [[c8 + 0.6, "Q2"], [c8 + 1.6, "Q1"], [c8 + 2.6, "Q0"]], in: c8 + 2.95, result: c8 + 3.75 },
  { from: 2, out: T.h09 + 1.3, to: "Q0", in: c12 + 0.05, result: c12 + 0.85 },
  { from: 3, out: T.h09 + 1.5, to: "Q1", steps: [[c12 + 0.4, "Q0"]], in: c12 + 0.5, result: c12 + 1.3 },
  // its result's flight is the plain 0.55 (was 0.8). Its dissolve at the focus (35.70 to 36.05) still meets the stream's second
  // beam card condensing there (35.66 to 35.98): with the beam entries at k 4, 9, 14, ... no flight finds a gap before 36.08
  { from: "blink", dot: true, out: T.h10 + 0.35, open: T.h10 - 0.2, to: "Q2", steps: [[c12 + 0.4, "Q1"], [c12 + 0.75, "Q0"]], in: c12 + 0.85, result: c12 + 1.65, flight: 0.55 },
  // day 53: the tab lifts the feeler, the lever throws (LEVER_THROWS[2]), the core lights; the result comes out on "the"
  { from: "blink", dot: true, tab: true, out: T.h19 + 0.32, open: T.h19 - 0.3, to: "slot", in: 52.88, result: 54.0 },
  // the closing line: its card in on "for an AI", the knock on "still", the result out on "old"; a short flight (0.35) so
  // it is at the focus by 77.9 and dissolved before the beam closes under the end dim (world-plan-v2 hold 27)
  { from: "blink", dot: true, out: T.h27 + 2.25, open: T.h27 + 1.6, to: "slot", in: T.still - 0.1, result: T.old4, flight: 0.35 },
];

// ---------- the mass moment (hold 13): counterN(t) is the only clock. Entry k happens when counterN first reaches k. ----------
export const STREAM = [COUNT_IN, T.one3];
// 29 entries up the three rails in rotation; 7 from the beam (Blink's cards among them)
const BEAM_K = new Set([14, 18, 22, 26, 30, 34]); // from 14: an earlier beam entry condensed on top of hold 12's result dissolving at the focus (35.7-36.05)
export const ENTRIES = Array.from({ length: 36 }, (_, i) => {
  const k = i + 1, at = COUNT_IN + (k / 36) * (T.one3 - COUNT_IN);
  let rail = 0;
  for (let j = 1; j < k; j++) if (!BEAM_K.has(j)) rail++;
  return { k, at, from: BEAM_K.has(k) ? "blink" : (rail % 3) + 1, result: at + 0.5 };
});
export const entries = (t) => ENTRIES.filter((e) => e.at <= t);

// ---------- the lever: one schedule the machine, Blink and cues.js all read. 0 = the old stop (where the spring and
// the default tag hold it), 1 = the new stop. [start, to, duration]: the hook throws it on "smarter" and the spring
// takes it back on "kept" (a Conductor-accepted decision); day 53's tabbed card throws it and the spring snaps it back
// as "search" ends. A throw overshoots the new stop once; a return lands with a thunk off the old stop (the test's curve).
export const LEVER_THROWS = [[T.smarter + 0.08, 1, 0.32], [T.h02 + 0.1, 0, 0.2], [52.95, 1, 0.32], [54.45, 0, 0.2]];
const TH2 = 2 * 0.72; // the full throw in radians (machine.js: TH 0.72 each side), so the test's bounces read in 0..1
export function lever(t) {
  let p = 0;
  for (const [a, to, d] of LEVER_THROWS) {
    if (t < a) break;
    p = mix(p, to, ss(r01(t, a, d)));
    if (to === 1) p += (0.16 / TH2) * settle(r01(t, a + 0.26, 0.4)); // past the new stop once
    else p -= (0.14 / TH2) * settle(r01(t, a + 0.16, 0.34)); // a thunk back on the old stop
  }
  return p;
}
// knocks: a plain card's entry nudges the lever against its stop (strength 1 = 0.06 rad for 0.3 s); the stream hammers
// it every third entry; the 36 seating is the hard one (counter.js lands it 0.24 s after "one")
export const KNOCKS = [
  ...CARD_PLAN.filter((c) => !c.tab).map((c) => [c.in, 1]),
  ...ENTRIES.filter((e) => e.k % 3 === 0 && e.k < 36).map((e) => [e.at, 0.6]),
  [T.one3 + 0.24, 1.6],
].sort((a, b) => a[0] - b[0]);
export function knocks(t) {
  let k = 0;
  for (const [at, s] of KNOCKS) { if (t > at + 0.3) continue; if (t < at) break; k = Math.max(k, s * settle(r01(t, at, 0.3))); }
  return k;
}

// ---------- the core (the new search): the one colour beat. Dark until day 53's throw; rests lit through the bet. ----------
export const CORE_LIT = 53.3, CORE_REST = 54.45, CORE_OUT = T.h21 + 0.3;
export const coreGlow = (t) => ss(r01(t, CORE_LIT, 0.45)) * (1 - 0.65 * ss(r01(t, CORE_REST, 0.7))) * (1 - ss(r01(t, CORE_OUT, 0.7)));

// ---------- the meaning (new) plate: test-local x and alpha. In on "smarter", back off at the setup, in for good in July;
// one rebound on every arrival, a fade over its first or last 0.15 s. Hold 23 brightens it once. ----------
export const NEW_X = { parked: ML.labelNewParked[0], home: ML.labelNew[0] };
export function newPlate(t) {
  let x, a;
  if (t < T.h05) {
    const out = io(r01(t, T.h03 + 0.2, 0.45));
    x = mix(mix(NEW_X.parked, NEW_X.home, back(r01(t, T.smarter, 0.4))), NEW_X.parked, out);
    a = r01(t, T.smarter, 0.15) * (1 - r01(t, T.h03 + 0.5, 0.15));
  } else {
    x = mix(NEW_X.parked, NEW_X.home, back(r01(t, T.july, 0.45)));
    a = r01(t, T.july, 0.15);
  }
  return { x, a, bright: Math.sin(Math.PI * r01(t, T.new2, 0.5)) };
}

// ---------- the clockwork (the old search): a run of 0.9 s from every plain entry, and the whole stream ----------
const RUN = 0.9;
export const RUNS = [...CARD_PLAN.filter((c) => !c.tab).map((c) => [c.in, c.in + RUN]), [COUNT_IN - 0.2, T.one3 + RUN]];
const runK = (t, [a, b]) => (t <= a ? 0 : t >= b ? 1 : ss((t - a) / (b - a)));
// how far the gears have turned: 1.5 turns per plain run; the stream turns them at the same rate the whole way
export const runWork = (t) => RUNS.reduce((s, w) => s + runK(t, w) * (w[1] - w[0]) / RUN, 0);
// how hard it is running now (0..1): the bellows and the pilot read this
export const runOn = (t) => cl(RUNS.reduce((s, [a, b]) => s + bump(t, a, b - a), 0));
// steam: one puff at entry + 0.1 on a plain run; a puff every 0.35 s through the stream. [time, size]
export const PUFFS = [
  ...CARD_PLAN.filter((c) => !c.tab).map((c) => [c.in + 0.1, 1]),
  ...Array.from({ length: Math.floor((T.one3 - COUNT_IN) / 0.35) + 1 }, (_, i) => [COUNT_IN + 0.35 * i, 0.8]),
].sort((a, b) => a[0] - b[0]);

// ---------- the beam from Blink's visor: open while a card condenses or a result dissolves, and through the stream ----------
// [open, close]: the light eases up over 0.22 s from open and down over 0.25 s from close (beamOn). A return window ends
// 0.45 s after the result reaches the focus, except that no window closes later than T.endIn - 0.05: the beam is dark by
// 78.3, before the end dim has taken the set (hold 27's result dissolves under it from 77.9).
const beamWindows = () => {
  const w = [];
  for (const c of CARD_PLAN) {
    if (c.from !== "blink") continue;
    w.push([c.open ?? c.out - 0.5, c.out + 0.25]);
    if (c.to === "slot") { const arrive = c.result + (c.flight ?? 0.55); w.push([arrive - 0.5, Math.min(arrive + 0.45, T.endIn - 0.05)]); }
  }
  w.push([c12 + 1.3, T.h14 + 0.2]); // hold 12's result comes back into it and it holds open through the stream
  return w;
};
export const BEAM = beamWindows();
export const beamOn = (t) => BEAM.reduce((m, [a, b]) => Math.max(m, ss(r01(t, a, 0.22)) * (1 - ss(r01(t, b, 0.25)))), 0);

// on the words (machine.js and cues.js read these): the placard lands just before its word, the tag swings on its word
export const PLATE_HIT = T.new1 - 0.06, TAG_SWING = T.dflt - 0.05;

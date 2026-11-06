// devweb ep 6 (plain words): every time in the film, on Chris's words, plus the pure clocks more than one station reads.
// No Three.js and no DOM here, so check-graybox.mjs can load it in plain node. Everything is a pure function of t.
const VO = globalThis.VO;

// ---------- small maths (the kit's own formulas; kit/world.js imports three, so it can't load in node) ----------
export const cl = (x) => Math.max(0, Math.min(1, x));
export const io = (x) => { x = cl(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const r01 = (t, a, d) => cl((t - a) / d);
export const mix = (a, b, k) => a + (b - a) * k;

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
export const BLINK_X = -0.86, FOOT_Y = -0.88;
export const CX = 0.15; // the crate's centre line
export const DIAL = [CX, 3.2, -1.47], DIAL_R = 0.6;
export const CHUTE_X = { L: CX - 0.62, R: CX + 0.62 }; // straight under keywords (old) and meaning (new)

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
export const worldDim = (t) => 1 - 0.62 * io(r01(t, T.endIn, 0.5));

// ---------- the cards. One plan, read by the cards station (motion) and the crate (chute lights). ----------
// keys: [time, place, move length]. Places: R0-R3 off frame right of a queue spot, S0-S3 queue spots, slot, blink
// (out of the front of Blink's body). chute: [side, time the card starts down it]. dot: one of Blink's own cards.
const c8 = T.h08, c12 = T.h12;
export const CARD_PLAN = [
  { keys: [[T.h04, "R0"], [T.h04 + 0.05, "S0", 0.45], [T.h04 + 0.75, "slot"]], chute: ["L", T.h04 + 1.1] },
  { keys: [[T.h06 + 0.1, "R0"], [T.h06 + 0.1, "S0", 0.7], [c8 + 0.25, "slot"]], chute: ["L", c8 + 0.6] },
  { keys: [[T.h06 + 0.1, "R1"], [T.h06 + 0.25, "S1", 0.7], [c8 + 0.6, "S0"], [c8 + 1.25, "slot"]], chute: ["L", c8 + 1.6] },
  { keys: [[T.h06 + 0.1, "R2"], [T.h06 + 0.4, "S2", 0.7], [c8 + 0.6, "S1"], [c8 + 1.6, "S0"], [c8 + 2.25, "slot"]], chute: ["L", c8 + 2.6] },
  { keys: [[T.h06 + 0.1, "R3"], [T.h06 + 0.55, "S3", 0.7], [c8 + 0.6, "S2"], [c8 + 1.6, "S1"], [c8 + 2.6, "S0"], [c8 + 2.95, "slot"]], chute: ["L", c8 + 3.3] },
  { keys: [[T.h09 + 1.3, "R0"], [T.h09 + 1.35, "S0", 0.7], [c12 + 0.05, "slot"]], chute: ["L", c12 + 0.4] },
  { keys: [[T.h09 + 1.3, "R1"], [T.h09 + 1.5, "S1", 0.7], [c12 + 0.4, "S0"], [c12 + 0.75, "slot"]], chute: ["L", c12 + 1.1] },
  { dot: true, keys: [[T.h10 + 0.18, "blink"], [T.h10 + 0.6, "S2", 0.9], [c12 + 0.4, "S1"], [c12 + 0.75, "S0"], [c12 + 1.1, "slot"]], chute: ["L", c12 + 1.45] },
  { dot: true, keys: [[T.h19 + 0.02, "blink"], [T.h19 + 0.35, "slot", 0.6]], chute: ["R", T.h19 + 1.0] },
  // the last card rides the old chute on "still using the old one" (editor): out on "for an AI", down from "still" + 0.2
  { dot: true, keys: [[T.h27 + 1.9, "blink"], [T.h27 + 2.25, "slot", 0.7]], chute: ["L", T.still + 0.2] },
];
export const CHUTE_RIDE = 0.7;
export const STREAM = [T.h13 + 0.12, T.one3]; // the mass moment: cards pour down the left chute

// how lit a chute is: while a card rides it, and the whole stream on the left
export function chuteGlow(side, t) {
  let g = 0;
  for (const c of CARD_PLAN) if (c.chute[0] === side) g = Math.max(g, spanAlpha([[c.chute[1], c.chute[1] + CHUTE_RIDE]], t, 0.12));
  if (side === "L") g = Math.max(g, spanAlpha([STREAM], t, 0.2));
  return g;
}
// the right chute after its first card: it stays faintly lit beside the note until the strip rolls away
export const rightAfterglow = (t) => 0.45 * spanAlpha([[T.h19 + 1.0 + CHUTE_RIDE, T.h21 + 0.3]], t, 0.3);

// ---------- the counter: old search, climbing to 36 of 37. The other call is never labelled. ----------
// it fades in once the camera has widened enough to hold it (hold 13's move), and climbs from there
export const COUNT_IN = T.h13 + 0.55;
export const counterAlpha = (t) => r01(t, COUNT_IN, 0.3) * (1 - r01(t, T.h16, 0.4));
export const counterN = (t) => (t < COUNT_IN ? 0 : t >= T.one3 ? 36 : Math.floor(36 * r01(t, COUNT_IN, T.one3 - COUNT_IN) + 1e-6));

// ---------- the calendar strip ----------
export const MARKER = [T.h17 + 0.05, T.h17 + 1.05]; // runs July to day 53, stops
export const dayLit = (t) => t >= MARKER[1] && t < T.h21 + 0.6;

// ---------- Blink's blinks (stations/mark.js draws them: 0.2 s each, close 4 f, shut 2 f, open 6 f at 60 fps) ----------
// Start times. Here, not in mark.js, so cues.js can declare each one to forensics as a designed change.
export const BLINKS = [T.h03 - 0.04, T.my2 + 1.06, T.h04 + 1.06, T.july - 0.04, T.added + 1.06, T.h06 + 0.16, T.old2 - 0.04, T.h09 + 0.16,
  T.h11 + 0.26, T.one3 + 0.5, /* T.h14 - 0.04 removed: 0.12 s after the one before it, the two ran together as a flutter (finish forensics, 39.52 s) */ T.uses + 0.3, T.uses + 2.37, T.changedEnd - 0.05, T.h18 - 0.04, T.h20 - 0.06, T.h20 + 0.8, T.h21 - 0.04,
  T.h21 + 1.26, T.h23 - 0.04, T.h25 + 0.06, T.h25 + 1.26, T.h26 + 0.3, T.endIn + 0.5];

// ---------- the needle (Robin, final watch d3: "even the needle which is front and center does not move to the other
// side.. even when the narrator says that it started doing the other search it stays on default") ----------
// The needle shows which search the call in hand gets. 0 = keywords (old), where the default tag hangs; 1 = meaning (new).
// Swings: [start, to, duration]. The hook tries the new setting and falls back; day 53's card sends it to new, where it
// stays through the tip; the closing line drops it back to old. Overshoot and settle are crate.js's, on top of this.
export const NEEDLE_SWINGS = [
  [T.smarter + 0.08, 1, 0.42], // "a smarter search": over to meaning (new)
  [T.h02 + 0.02, 0, 0.36], // "It kept using the old one": back, with a thunk
  [T.h19 + 0.42, 1, 0.5], // day 53: Blink's own card asks for the new search
  [T.still - 0.4, 0, 0.42], // "still using the old one"
];
export function needlePos(t) {
  let p = 0;
  for (const [a, to, d] of NEEDLE_SWINGS) if (t >= a) p = mix(p, to, io(r01(t, a, d)));
  return p;
}
// Kicks: [time, strength]. A call served by the old search knocks the needle against its stop: one per card into the slot
// while the needle rests on old, every third count of the mass moment, and the 36 seating is the hard one.
export const NEEDLE_KICKS = [
  ...CARD_PLAN.filter((c) => c.chute[0] === "L").map((c) => [c.keys[c.keys.length - 1][0], 1]),
  ...Array.from({ length: 11 }, (_, i) => [COUNT_IN + ((3 * (i + 1)) / 36) * (T.one3 - COUNT_IN), 0.6]),
  [T.one3 + 0.24, 1.6],
].filter(([t]) => needlePos(t) < 0.01).sort((a, b) => a[0] - b[0]);

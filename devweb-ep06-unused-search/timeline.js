// devweb ep 6: every time in the film, on Chris's words, plus the pure clocks more than one station reads.
// No Three.js and no DOM here, so check-graybox.mjs can load it in plain node. Everything is a pure function of t.
const VO = globalThis.VO;

// ---------- small maths (the kit's own formulas; kit/world.js imports three, so it can't load in node) ----------
export const cl = (x) => Math.max(0, Math.min(1, x));
export const io = (x) => { x = cl(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const r01 = (t, a, d) => cl((t - a) / d);
export const mix = (a, b, k) => a + (b - a) * k;

// ---------- anchors: [word, occurrence, offset, the film second the world plan expects] ----------
export const ANCHORS = {
  broke: ["broke", 1, 0, 0.78], b02: ["36", 1, 0, 1.92], off02: ["the", 1, 0.06, 4.0],
  b03: ["the", 2, 0, 4.9], had: ["had", 1, 0, 5.44], b04: ["hybrid", 2, 0, 6.42], landed: ["landed", 1, 0, 6.74], july: ["july", 1, 0, 7.34],
  b05: ["and", 1, 0, 8.44], by: ["by", 1, 0, 8.52],
  b06: ["so", 1, 0, 11.34], optional: ["optional", 1, 0, 13.0], fts: ["fts", 1, 0, 14.48],
  b07: ["omit", 1, 0, 15.34], old: ["old", 1, 0, 16.44],
  b08: ["any", 1, 0, 17.62], stamp: ["approve", 1, 0, 18.4], should: ["should", 1, 0, 19.42],
  b09: ["the", 4, 0, 20.1], hitA: ["model", 2, 0, 20.28], names: ["names", 1, 0, 22.86], three: ["three", 1, 0, 23.56],
  b10: ["in", 2, 0, 24.38], shutClose: ["default", 2, 0.04, 28.22],
  b11: ["the", 9, 0, 28.52], stripIn: ["the", 9, 0.2, 28.72], flag: ["27th", 1, 0, 30.82],
  b12: ["53", 1, 0, 32.04], stripLift: ["landed", 2, 0.46, 33.9],
  b13: ["nothing", 2, 0, 34.16], stripGone: ["nothing", 2, 0.14, 34.3], flagWord: ["flag", 1, 0, 34.64], rewindEnd: ["it", 3, 0.1, 35.0],
  b14: ["a", 3, 0, 35.54], feed1End: ["log", 1, 0.02, 38.9],
  b15: ["the", 12, 0, 39.56], feed2End: ["keys", 1, 0, 41.2],
  b16: ["and", 4, 0, 41.88], no: ["no", 1, 0, 42.68], feed3End: ["key", 1, 0, 43.28], otherOpen: ["record", 1, 0, 43.66],
  b17: ["back", 1, 0, 44.46], own: ["own", 1, 0, 46.82],
  b18: ["on", 6, 0, 47.52], d27: ["27th", 2, 0, 47.92],
  b19: ["the", 14, 0, 48.9], written: ["written", 1, 0, 49.6], hitB: ["protocol", 1, 0, 49.82],
  b20: ["the", 15, 0, 53.34], day: ["day", 1, 0, 53.78], typeOff20: ["began", 1, 0.22, 55.14],
  b21: ["i", 1, 0, 55.74], but: ["but", 1, 0, 57.62], id: ["i'd", 1, 0, 58.66],
  b22: ["a", 5, 0, 59.5], stripEnd: ["model", 4, 0.3, 59.9], otherOpen2: ["gets", 1, 0.24, 60.1], dflt: ["default", 4, 0, 62.22],
  b23: ["your", 1, 0, 63.14], one4: ["one", 4, 0, 66.06], callers2: ["callers", 2, 0, 66.58], model5: ["model", 5, 0, 67.4],
  b24: ["with", 1, 0, 68.06], caller2: ["caller", 2, 0, 68.74], the18: ["the", 18, 0, 69.32],
  b25: ["and", 7, 0, 70.84], shipping: ["shipping", 1, 0, 70.94], flareUp: ["shipping", 1, 0.24, 71.18], flarePeak: ["mode", 5, 0, 71.38], notOn: ["doesn't", 2, 0, 71.64], flareGone: ["doesn't", 2, 0.04, 71.68],
  b26: ["so", 3, 0, 73.04], safe: ["safe", 1, 0, 73.7], default7: ["default", 7, 0, 73.92], you2: ["you", 2, 0, 74.54],
  b27: ["log", 3, 0, 75.58], call3: ["call", 3, 0, 77.26],
  b28: ["on", 9, 0, 78.08], hitC: ["date", 1, 0.1, 78.42],
  b29: ["then", 1, 0, 80.32], ghost: ["flip", 1, 0, 80.8],
  b30: ["tell", 1, 0, 82.06], b31: ["or", 1, 0, 84.24], why: ["why", 1, 0, 86.06],
  b32: ["skip", 1, 0, 86.96], b33: ["because", 2, 0, 88.96], breaks: ["breaks", 1, 0, 90.48], endIn: ["nothing", 3, 0.57, 91.53],
};
export const T = Object.fromEntries(Object.entries(ANCHORS).map(([k, [word, n, off]]) => [k, VO.w(word, n) + off]));
T.END = VO.END;
// the whole set stands this far behind Blink, so a push on Blink no longer cuts the crate or the sheet (first watch 01)
export const SET_Z = -1.2;
export const BLINK_X = -0.8;
T.botLeave = T.b06 - 0.6; // the bot's card starts up the column; Blink's line retracts on the same clock

// ---------- keyed values ----------
// a colour track: [[t, "#rrggbb"], ...], crossfaded over d from the previous entry. Returns sRGB 0..1.
const hex = (h) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
export function colAt(track, t, d = 0.25) {
  let i = 0;
  for (let j = 0; j < track.length; j++) if (t >= track[j][0]) i = j;
  const cur = hex(track[i][1]), prev = i > 0 ? hex(track[i - 1][1]) : cur, k = r01(t, track[i][0], d);
  return [mix(prev[0], cur[0], k), mix(prev[1], cur[1], k), mix(prev[2], cur[2], k)];
}
// a number track: [[t, dur, value], ...], eased from the previous value over dur
export function easeKeys(keys, t) {
  let i = 0;
  for (let j = 0; j < keys.length; j++) if (t >= keys[j][0]) i = j;
  const prev = i > 0 ? keys[i - 1][2] : keys[0][2];
  return mix(prev, keys[i][2], io(r01(t, keys[i][0], Math.max(0.001, keys[i][1]))));
}
// 0..1: on inside any [from, to] span, with a d-second fade at each end
export function spanAlpha(spans, t, d = 0.15) {
  let a = 0;
  for (const [from, to] of spans) a = Math.max(a, r01(t, from, d) * (1 - r01(t, to, d)));
  return a;
}
// the world dims under the end mark; the lamp and Blink don't read this
export const worldDim = (t) => 1 - 0.62 * io(r01(t, T.endIn, 0.5));

// ---------- the count clock: the feed and the tally digit both read this, so they can't disagree ----------
const ROW_KEYS = [[T.b13, 10], [T.rewindEnd, 0], [T.b14, 0], [T.feed1End, 8], [T.b15, 8], [T.feed2End, 22], [T.b16, 22], [T.feed3End, 36]];
export function rows(t) {
  if (t <= ROW_KEYS[0][0]) return ROW_KEYS[0][1];
  for (let i = 1; i < ROW_KEYS.length; i++) {
    if (t <= ROW_KEYS[i][0]) return mix(ROW_KEYS[i - 1][1], ROW_KEYS[i][1], io(r01(t, ROW_KEYS[i - 1][0], ROW_KEYS[i][0] - ROW_KEYS[i - 1][0])));
  }
  return 36;
}

// ---------- the tally's digits: a spin swaps content every 0.05 s, never a position shake ----------
const pad = (n) => String(Math.floor(n + 1e-6)).padStart(2, "0");
const spin = (t) => { const h = Math.floor(t / 0.05); return String((h * 37 + 11) % 100).padStart(2, "0"); };
export function defaultDigits(t) {
  if (t < T.b13) return "36";
  if (t < T.rewindEnd) return spin(t);
  if (t < T.b14) return "00";
  if (t < T.b17) return pad(rows(t));
  if (t < T.b18) return "--";
  if (t < T.b18 + 0.2) return spin(t);
  if (t < T.b32) return "36";
  if (t < T.b32 + 0.28) return spin(t);
  if (t < T.b33) return "--";
  if (t < T.b33 + 0.2) return spin(t);
  return "36";
}

// ---------- the other window and the Aug 27 mark never share a frame ----------
// shutter(t): 0 open, 1 shut. The rule: shutter closed first, mark after; mark gone first, shutter open after, 0.2 s between.
const SHUT = [[T.shutClose, 1], [T.otherOpen, 0], [T.b17, 1], [T.otherOpen2, 0], [T.b32 + 0.54, 1], [T.b33, 0]];
export const SHUT_TIME = 0.3;
export function shutter(t) {
  let v = 0, from = 0, at = -1;
  for (const [ta, val] of SHUT) if (t >= ta) { from = v; v = val; at = ta; }
  return at < 0 ? 0 : mix(from, v, io(r01(t, at, SHUT_TIME)));
}
// spans in which any date strip with an Aug 27 tick is on screen: [in, lift starts, gone]
export const MARK_SPANS = [[T.stripIn, T.stripLift, T.stripGone], [T.b18, T.b22, T.stripEnd]];
export const markOn = (t) => MARK_SPANS.some(([a, , c]) => t >= a && t < c);
export const otherShows = (t) => shutter(t) < 1;

// ---------- the rock when sticker B lands: one settle in 25 f at 60 fps. The crate and the rollers share it ----------
export function rock(t) {
  const u = r01(t, T.hitB, 25 / 60);
  return u <= 0 || u >= 1 ? 0 : Math.sin(u * Math.PI * 2) * (1 - u);
}

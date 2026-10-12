// Round 2 (tv): the song-time clock for stanza 7 (123.125-165.083333, f2955-f3962: the flannel-board lesson
// on the kids' show) and stanza 11 (240.916667-261.5, f5782-f6276: the news bulletin on the same set).
// Every time is read from source/lines.json via gen/lines_r2.js; nothing is retyped.
// The round-1 clock (timing.js: T0, T1, B, CAM) is left exactly as it was, so 95.92-123.125 renders unchanged.
const S7 = [123.125, 3962 / 24], S11 = [5782 / 24, 261.5];
const PAGE_T0 = T0, PAGE_T1 = S11[1];
const LN2 = {}; for (const l of TV_LINES_R2) LN2[l.i] = l;
const W2 = (li, k) => LN2[li].words[k].s;
function readUntil2(li) { const l = LN2[li], nx = LN2[li + 1]; const last = l.words[l.words.length - 1]; return Math.max(nx ? nx.s : 1e9, last.e + 1.2); }
// cue names are line.word indices into lines.json, named for what happens on screen
const C = {
  // stanza 7
  s7: W2(50, 0), barrel1: W2(50, 1), tons: W2(50, 2), barrel3: W2(50, 3), spill: W2(50, 4),
  l51: W2(51, 0), drip: W2(51, 1), drain: W2(51, 3),
  l52: W2(52, 0), house: W2(52, 2), smoke: W2(52, 3), slip: W2(52, 6), pin: W2(52, 8),
  l53: W2(53, 0), man: W2(53, 2), fist: W2(53, 5), wallet: W2(53, 8), big: W2(53, 10),
  l54: W2(54, 0), wheels: W2(54, 2), rolls: W2(54, 3), rollEnd: W2(54, 5), adjust: W2(54, 7), lid: W2(54, 8),
  l55: W2(55, 0), couple1: W2(55, 2), hundred: W2(55, 3), couple2: W2(55, 6), million: W2(55, 7), stacks: W2(55, 8),
  l56: W2(56, 0), title: W2(56, 2), book: W2(56, 5),
  l57: W2(57, 0), nutri: W2(57, 1), facts: W2(57, 2),
  l58: W2(58, 0), hired: W2(58, 2), doctor: W2(58, 4), phd: W2(58, 7),
  l59: W2(59, 0), wrote: W2(59, 2), intro: W2(59, 4), free: W2(59, 9),
  l60: W2(60, 0), lettuce: W2(60, 3), bun: W2(60, 6), health: W2(60, 9), joke: W2(60, 12),
  l61: W2(61, 0), water1: W2(61, 3), water2: W2(61, 6), coke: W2(61, 8),
  l62: W2(62, 0), people: W2(62, 2), felt: W2(62, 3), good: W2(62, 4),
  l63: W2(63, 0), print: W2(63, 3), legit: W2(63, 5),
  l64: W2(64, 0), ordered: W2(64, 2), fries: W2(64, 4), never: W2(64, 7), tip: W2(64, 9),
  // stanza 11
  s11: W2(101, 0), happened: W2(101, 1), tuesday: W2(101, 3),
  l102: W2(102, 0), king: W2(102, 1), mad: W2(102, 3),
  l103: W2(103, 0), buying: W2(103, 2), patent: W2(103, 4), satellite: W2(103, 6), ads: W2(103, 7),
  l104: W2(104, 0), phone: W2(104, 2), did104: W2(104, 3), ring: W2(104, 4),
  l105: W2(105, 0), wife: W2(105, 2), scream: W2(105, 4),
  l106: W2(106, 0), cops: W2(106, 2), jump: W2(106, 4),
  l107: W2(107, 0), legal: W2(107, 2), teams: W2(107, 3),
  l108: W2(108, 0), work: W2(108, 2), couple: W2(108, 5),
  l109: W2(109, 0), shown: W2(109, 2), nerve: W2(109, 4),
  l110: W2(110, 0), unfair: W2(110, 3), libel: W2(110, 4), laws: W2(110, 5), kingS: W2(110, 8), serve: W2(110, 9),
};
// Room-camera framings (world point at frame centre, zoom), as in timing.js: ROOM = pulled back to the king's
// shoulder, SET = the tube nearly filling the frame.
const F_ROOM = { x: 860, y: 515, z: 1.36 }, F_SET = { x: 722, y: 455, z: 1.52 };
// keys: {t, x, y, z, e: true when the move INTO this key is eased (push or pull), false for a linear creep}
const CAM7 = [
  { t: S7[0], x: 860, y: 515, z: 1.33 },                       // where round 1 left the camera
  { t: C.s7 + 0.12, x: 860, y: 515, z: 1.33 },
  { t: C.barrel1 - 0.1, ...F_SET, e: true },                    // push in to the set as the lesson opens
  { t: C.l62 - 0.75, x: 722, y: 455, z: 1.57 },
  { t: C.l62 - 0.05, ...F_ROOM, e: true },                      // pull back to the room for the last three lines
  { t: S7[1], x: 860, y: 515, z: 1.33 },
];
const CAM11 = [
  { t: S11[0], x: 860, y: 515, z: 1.36 },
  { t: C.happened, x: 860, y: 515, z: 1.355 },
  { t: C.tuesday + 0.25, x: 722, y: 455, z: 1.5, e: true },     // push in on the bulletin
  { t: C.l104 - 0.25, x: 722, y: 455, z: 1.55 },
  { t: C.phone - 0.05, ...F_ROOM, e: true },                    // pull back: the phone on the side table rings
  { t: C.l107 - 0.1, x: 860, y: 515, z: 1.34 },
  { t: C.legal - 0.15, x: 722, y: 455, z: 1.52, e: true },      // push in for the barristers
  { t: S11[1], x: 722, y: 455, z: 1.6 },
];
function camKeys(keys, t) {
  let i = 0; while (i + 1 < keys.length - 1 && keys[i + 1].t <= t) i++;
  const a = keys[i], b = keys[i + 1];
  const u0 = clamp((t - a.t) / (b.t - a.t)), u = b.e ? smooth(u0) : u0;
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: lerp(a.z, b.z, u) };
}
function cameraAt2(t) { return camKeys(t < S11[0] ? CAM7 : CAM11, t); }
// the studio camera inside the program (flannel board world -> 960x720 program): cuts and slow creeps
const two2 = (t) => Math.floor(t * 12 + 1e-6) / 12;   // stop-motion on twos

// Round 3, agent tv-C (TV-news version): the song-time clock for stanzas 12-14, 261.5-340.4583 (f6276-f8171),
// the court report, the verdict and the refrain outside the court, and the station closing down.
// Every sung time is read from source/lines.json through gen/r3c_lines.js; nothing is retyped here.
// Cue names are what happens on screen; the numbers are line.word indices into lines.json.
const R3C_SPAN = [6276 / 24, 8171 / 24];
const R3C_LN = {}; for (const l of R3C_LINES) R3C_LN[l.i] = l;
const r3cW = (li, k) => R3C_LN[li].words[k].s;
function r3cReadUntil(li) { const l = R3C_LN[li], nx = R3C_LN[li + 1]; const last = l.words[l.words.length - 1]; return Math.max(nx ? nx.s : -1e9, last.e + 1.2); }
const R3CQ = {
  // stanza 12
  l111: r3cW(111, 0), longest: r3cW(111, 5), british: r3cW(111, 7), made: r3cW(111, 8),
  l112: r3cW(112, 0), gave: r3cW(112, 2), jury: r3cW(112, 5), no2: r3cW(112, 7), legal: r3cW(112, 8), aid: r3cW(112, 9),
  l113: r3cW(113, 0), king: r3cW(113, 1), n30: r3cW(113, 4), billions: r3cW(113, 5), dollars: r3cW(113, 6), spend: r3cW(113, 8),
  l114: r3cW(114, 0), crush: r3cW(114, 1), people114: r3cW(114, 3), defend: r3cW(114, 6),
  l115: r3cW(115, 0), speak: r3cW(115, 3), truth: r3cW(115, 5), loud: r3cW(115, 7),
  l116: r3cW(116, 0), tv: r3cW(116, 1), newsprint: r3cW(116, 3), internet: r3cW(116, 5), crowds: r3cW(116, 6),
  l117: r3cW(117, 0), judge: r3cW(117, 2), end: r3cW(117, 5),
  l118: r3cW(118, 0), agreed: r3cW(118, 2), couple: r3cW(118, 5), trial: r3cW(118, 7),
  views: [119, 120, 121, 122, 123].map(li => r3cW(li, 0)),
  viewKey: [r3cW(119, 4), r3cW(120, 4), r3cW(121, 4), r3cW(122, 3), r3cW(123, 3)],
  // stanza 13
  l124: r3cW(124, 0), fine: r3cW(124, 2), guilty: r3cW(124, 4), fuss: r3cW(124, 8),
  l125: r3cW(125, 0),
  people: [r3cW(125, 1), r3cW(126, 0), r3cW(127, 0), r3cW(129, 0), r3cW(130, 0)],
  libelous: [r3cW(125, 6), r3cW(126, 5), r3cW(127, 5), r3cW(128, 0), r3cW(129, 5), r3cW(130, 5), r3cW(131, 0)],
  held: [r3cW(128, 0), r3cW(131, 0)],
};
// the strip leaves with the bulletin once the last line's read time is up
R3CQ.stripOff = r3cReadUntil(131);
// stanza 14, the tail (song seconds read off the record's level: hits at 330.7, 331.6, 333.1; silent from 336.8)
R3CQ.desk2 = Math.ceil(R3CQ.stripOff * 24) / 24;   // the first frame without the strip: back to the anchor
R3CQ.card = 331.6;                               // the station card on the strong hit
R3CQ.testCard = 333.1;                           // the test card on the next hit
R3CQ.off = 336.8;                                // the set is switched off as the music runs out
R3CQ.views.push(R3CQ.l124);                         // the five views end where the verdict starts

// Room camera (world point at frame centre, zoom), as in r2_timing.js. e: the move into this key is eased.
const R3C_SET = { x: 722, y: 455 }, R3C_ROOM = { x: 860, y: 515, z: 1.36 };
const R3C_CAM = [
  { t: R3C_SPAN[0], x: 722, y: 455, z: 1.6 },                 // where stanza 11 left the camera
  { t: R3CQ.l117 - 0.4, x: 722, y: 455, z: 1.64 },
  { t: R3CQ.l117 + 0.35, ...R3C_ROOM, e: true },                   // pull back: the king watches the court report
  { t: R3CQ.l118 - 0.25, x: 860, y: 515, z: 1.35 },
  { t: R3CQ.l118 + 0.3, x: 722, y: 455, z: 1.54, e: true },        // push in on the judge
  { t: R3CQ.l124 - 0.2, x: 722, y: 455, z: 1.6 },
  { t: R3CQ.l124 + 0.25, x: 722, y: 448, z: 1.7, e: true },        // closer for the verdict
  { t: R3CQ.l125, x: 722, y: 448, z: 1.7 },
  { t: R3CQ.l125 + 0.5, x: 722, y: 455, z: 1.56, e: true },        // outside the court
  { t: R3CQ.held[0] - 0.5, x: 722, y: 455, z: 1.6 },
  { t: R3CQ.held[0] + 0.1, ...R3C_ROOM, e: true },                 // the first held shout: back to the room
  { t: R3CQ.people[3] - 0.5, x: 860, y: 515, z: 1.34 },
  { t: R3CQ.people[3] + 0.05, x: 722, y: 455, z: 1.54, e: true },
  { t: R3CQ.held[1] - 0.55, x: 722, y: 455, z: 1.6 },
  { t: R3CQ.held[1] + 0.05, ...R3C_ROOM, e: true },                // the last held shout: the room
  { t: R3CQ.testCard + 0.1, x: 860, y: 515, z: 1.32 },
  { t: R3CQ.off - 0.2, x: 820, y: 560, z: 0.86, e: true },         // pull right back as the station closes down
  { t: R3C_SPAN[1], x: 820, y: 560, z: 0.86 },
];
function r3cCam(t) {
  const K = R3C_CAM; let i = 0; while (i + 1 < K.length - 1 && K[i + 1].t <= t) i++;
  const a = K[i], b = K[i + 1];
  const u0 = clamp((t - a.t) / (b.t - a.t)), u = b.e ? smooth(u0) : u0;
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: lerp(a.z, b.z, u) };
}
// the king sinks a little lower in his wingback on every shout of the refrain (stanza 11 left him at 92)
function r3cKingDrop(t) {
  let d = 92;
  for (const s of R3CQ.libelous) d += 13 * smooth(clamp((t - s) / 0.5));
  return d;
}
const r3cTwo = (t) => Math.floor(t * 12 + 1e-6) / 12;   // news-film animation on twos

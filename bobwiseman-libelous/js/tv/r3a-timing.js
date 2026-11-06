// Round 3, tv-A: the TV-news version, stanzas 0-5, song 0-95.916667 s (f0-f2302). The whole stretch is an
// evening news bulletin on the console TV in the living room: the intro is the news opening (no words), then
// the anchor at his desk, the over-the-shoulder box, and cut-away news film, with the wire copy typed on the
// canary teleprinter strip. Every time is read from source/lines.json via js/tv/gen/r3a-lines.js.
const r3aTvT0 = 0, r3aTvT1 = 2302 / 24;
const r3aTvLN = {}; for (const l of r3aTvLINES) r3aTvLN[l.i] = l;
const r3aTvW = (li, k) => r3aTvLN[li].words[k].s;
function r3aTvReadUntil(li) { const l = r3aTvLN[li], nx = r3aTvLN[li + 1]; const last = l.words[l.words.length - 1]; return Math.max(nx ? nx.s : r3aTvT1, last.e + 1.2); }
// cue names are line.word indices into lines.json, named for what happens on screen
const r3aTvC = {
  on: 1.48,                       // power on, on the first strong hit
  ring: [2.51, 3.16, 3.81, 4.46], // the ident's rings, on the onset grid (period 0.65 s)
  orbit: [5.10, 5.75, 6.41, 7.05],
  zoom: 7.71, hit: 10.96,         // the big hit where the drums come in: cut to the studio
  paperUp: 12.9,
  // stanza 1
  l0: r3aTvW(0, 0), king0: r3aTvW(0, 4),
  l1: r3aTvW(1, 0), plan1: r3aTvW(1, 5),
  l2: r3aTvW(2, 0), fist2: r3aTvW(2, 5),
  l3: r3aTvW(3, 0), knew3: r3aTvW(3, 3), man3: r3aTvW(3, 5),
  l4: r3aTvW(4, 0), mouth4: r3aTvW(4, 5),
  l5: r3aTvW(5, 0), spoke5: r3aTvW(5, 3), meet5: r3aTvW(5, 5),
  l6: r3aTvW(6, 0), share6: r3aTvW(6, 7),
  l7: r3aTvW(7, 0), smiled7: r3aTvW(7, 3),
  l8: r3aTvW(8, 0), chose8: r3aTvW(8, 2), this8: r3aTvW(8, 3), reason8: r3aTvW(8, 6),
  l9: r3aTvW(9, 0), cash9: r3aTvW(9, 5),
  l10: r3aTvW(10, 0), believing10: r3aTvW(10, 5),
  // stanza 2
  l11: r3aTvW(11, 0), military11: r3aTvW(11, 3), rulers11: r3aTvW(11, 4),
  l12: r3aTvW(12, 0), privileged12: r3aTvW(12, 2), elite12: r3aTvW(12, 3),
  l13: r3aTvW(13, 0), different13: r3aTvW(13, 2), third13: r3aTvW(13, 3), world13: r3aTvW(13, 4), countries13: r3aTvW(13, 5),
  l14: r3aTvW(14, 0), enough14: r3aTvW(14, 4), eat14: r3aTvW(14, 6),
  l15: r3aTvW(15, 0), scramble15: r3aTvW(15, 2), tickets15: r3aTvW(15, 4), ball15: r3aTvW(15, 8),
  l16: r3aTvW(16, 0), auction16: r3aTvW(16, 5), memorial16: r3aTvW(16, 7), hall16: r3aTvW(16, 8),
  // stanza 3
  l17: r3aTvW(17, 0), sent17: r3aTvW(17, 3), plan17: r3aTvW(17, 5),
  l18: r3aTvW(18, 0), sent18: r3aTvW(18, 3), fist18: r3aTvW(18, 5),
  l19: r3aTvW(19, 0), bid19: r3aTvW(19, 3), vast19: r3aTvW(19, 6), tracks19: r3aTvW(19, 7), land19: r3aTvW(19, 9),
  on19: r3aTvW(19, 10), the19: r3aTvW(19, 11), list19: r3aTvW(19, 12),
  l20: r3aTvW(20, 0), people20: r3aTvW(20, 5), too20: r3aTvW(20, 6),
  l21: r3aTvW(21, 0), included21: r3aTvW(21, 1), package21: r3aTvW(21, 4),
  l22: r3aTvW(22, 0), govt22: r3aTvW(22, 2), can22: r3aTvW(22, 3), do22: r3aTvW(22, 4),
  // stanza 4
  l23: r3aTvW(23, 0), breathed23: r3aTvW(23, 3), easy23: r3aTvW(23, 4),
  l24: r3aTvW(24, 0), wife24: r3aTvW(24, 2), kids24: r3aTvW(24, 5),
  l25: r3aTvW(25, 0), see25: r3aTvW(25, 2), up25: r3aTvW(25, 3), close25: r3aTvW(25, 4),
  l26: r3aTvW(26, 0), money26: r3aTvW(26, 3), did26: r3aTvW(26, 5),
  l27: r3aTvW(27, 0), court27: r3aTvW(27, 3),
  l28: r3aTvW(28, 0), cheap28: r3aTvW(28, 4),
  l29: r3aTvW(29, 0), laws29: r3aTvW(29, 2), exploited29: r3aTvW(29, 5),
  l30: r3aTvW(30, 0), nobody30: r3aTvW(30, 1), squeak30: r3aTvW(30, 4),
  // stanza 5
  l31: r3aTvW(31, 0), local31: r3aTvW(31, 1), food31: r3aTvW(31, 2),
  l32: r3aTvW(32, 0), farmers32: r3aTvW(32, 2), land32: r3aTvW(32, 5),
  l33: r3aTvW(33, 0), evicted33: r3aTvW(33, 1), became33: r3aTvW(33, 3),
  l34: r3aTvW(34, 0), far34: r3aTvW(34, 2), demand34: r3aTvW(34, 5),
  l35: r3aTvW(35, 0), came35: r3aTvW(35, 4),
  l36: r3aTvW(36, 0), cattle36: r3aTvW(36, 2), grew36: r3aTvW(36, 4),
  l37: r3aTvW(37, 0), lethal37: r3aTvW(37, 8), poison37: r3aTvW(37, 9), flew37: r3aTvW(37, 10),
  l38: r3aTvW(38, 0), time38: r3aTvW(38, 1), money38: r3aTvW(38, 3),
  l39: r3aTvW(39, 0), forest39: r3aTvW(39, 2), flat39: r3aTvW(39, 4),
  l40: r3aTvW(40, 0), share40: r3aTvW(40, 2), luscious40: r3aTvW(40, 4), fourth40: r3aTvW(40, 5), quarter40: r3aTvW(40, 6), facts40: r3aTvW(40, 7),
};
// Room camera keys (world point at frame centre, zoom), as in timing.js / r2_timing.js.
// e: true when the move INTO this key is eased (push or pull), otherwise a linear creep.
const r3aTvCAM = [
  { t: 0, x: 820, y: 560, z: 0.86 },                              // the wide room, as round 1 opens
  { t: 2.2, x: 820, y: 560, z: 0.88 },
  { t: r3aTvC.hit - 0.1, x: 722, y: 455, z: 1.5, e: true },        // push in to the set through the ident
  { t: r3aTvC.l5 - 0.2, x: 722, y: 455, z: 1.55 },
  { t: r3aTvC.l11, x: 722, y: 455, z: 1.58 },
  { t: r3aTvC.l17, x: 722, y: 455, z: 1.52 },
  { t: r3aTvC.l23 - 0.25, x: 722, y: 455, z: 1.55 },
  { t: r3aTvC.l23 + 0.55, x: 860, y: 515, z: 1.36, e: true },      // pull back: the king in his chair breathes easy
  { t: r3aTvC.l27 - 0.35, x: 860, y: 515, z: 1.34 },
  { t: r3aTvC.l27 + 0.3, x: 722, y: 455, z: 1.5, e: true },        // push in again for the balance
  { t: r3aTvC.l31, x: 722, y: 455, z: 1.54 },
  { t: r3aTvT1, x: 722, y: 455, z: 1.6 },
];
function r3aTvCamera(t) {
  const K = r3aTvCAM; let i = 0; while (i + 1 < K.length - 1 && K[i + 1].t <= t) i++;
  const a = K[i], b = K[i + 1];
  const u0 = clamp((t - a.t) / (b.t - a.t)), u = b.e ? smooth(u0) : u0;
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: lerp(a.z, b.z, u) };
}
// how far the king has sunk in his wingback (foreground px at qf 1): low enough that his crown stays under the
// wire copy at the room framing, as in stanza 11; at the wide opening he sits up as in round 1
function r3aTvKingDrop(t) { return t < r3aTvC.l0 - 2 ? 0 : 92 + (t >= r3aTvC.easy23 ? 14 * smooth(clamp((t - r3aTvC.easy23) / 0.4)) : 0); }

// Round 3, agent tv-B: stanzas 6-10 (song 95.916667-240.916667, frames 2302-5782) as the 1970s news bulletin
// on the console TV. The song-time clock: every cue is a word onset read from source/lines.json through
// gen/r3b_tv_lines.js; nothing is retyped. Every top-level name here starts with r3bTv / R3BTV.
const R3BTV_T0 = 2302 / 24, R3BTV_T1 = 5782 / 24;
const R3BTV_LN = {}; for (const l of R3BTV_LINES) R3BTV_LN[l.i] = l;
const r3bTvW = (li, k) => R3BTV_LN[li].words[k].s;
const r3bTvWE = (li, k) => R3BTV_LN[li].words[k].e;
function r3bTvReadUntil(li) { const l = R3BTV_LN[li], nx = R3BTV_LN[li + 1]; const last = l.words[l.words.length - 1]; return Math.max(nx ? nx.s : 1e9, last.e + 1.2); }
// stanza starts (frames on the section map)
const R3BTV_S = { s6: 2302 / 24, s7: 2955 / 24, s8: 3962 / 24, s9: 4755 / 24, s10: 5123 / 24 };
// cues for stanzas 8-10 (the new news film); stanzas 6 and 7 reuse the kit's own clocks (B in timing.js and
// C in r2_timing.js), which are read from the same lines.json at the same song times.
const R3BTV_Q = {
  // stanza 8: the counter at night
  policy: r3bTvW(65, 2), said: r3bTvW(65, 3),
  l66: r3bTvW(66, 0), happy: r3bTvW(66, 2), slaves: r3bTvW(66, 4),
  l67: r3bTvW(67, 0), work67: r3bTvW(67, 2), night: r3bTvW(67, 4), shift: r3bTvW(67, 5), holidays: r3bTvW(67, 8),
  l68: r3bTvW(68, 0), mostly: r3bTvW(68, 2), women: r3bTvW(68, 3),
  l69: r3bTvW(69, 0), less: r3bTvW(69, 2), twenty: r3bTvW(69, 4),
  l70: r3bTvW(70, 0), easy: r3bTvW(70, 2), train: r3bTvW(70, 4), smile: r3bTvW(70, 7), plenty: r3bTvW(70, 9),
  l71: r3bTvW(71, 0), clean: r3bTvW(71, 1), toilets: r3bTvW(71, 3),
  l72: r3bTvW(72, 0), grill: r3bTvW(72, 3),
  l73: r3bTvW(73, 0), parttime: r3bTvW(73, 3),
  l74: r3bTvW(74, 0), here: r3bTvW(74, 2), until: r3bTvW(74, 3),
  l75: r3bTvW(75, 0), enlightened: r3bTvW(75, 2), union: r3bTvW(75, 5), ways: r3bTvW(75, 6),
  l76: r3bTvW(76, 0), fire: r3bTvW(76, 2), quickly: r3bTvW(76, 4), heard: r3bTvW(76, 7), say: r3bTvW(76, 9),
  l77: r3bTvW(77, 0), shifts: r3bTvW(77, 2), long: r3bTvW(77, 5),
  l78: r3bTvW(78, 0), smelly: r3bTvW(78, 2), hot: r3bTvW(78, 4),
  l79: r3bTvW(79, 0), promotions: r3bTvW(79, 1), never79: r3bTvW(79, 3),
  l80: r3bTvW(80, 0), wages: r3bTvW(80, 2), not: r3bTvW(80, 4),
  // stanza 9: the sheds
  l81: r3bTvW(81, 0), chickens: r3bTvW(81, 2), pigs: r3bTvW(81, 5),
  l82: r3bTvW(82, 0), kings: r3bTvW(82, 2), factory: r3bTvW(82, 3), farms: r3bTvW(82, 4),
  l83: r3bTvW(83, 0), never83: r3bTvW(83, 2), sun: r3bTvW(83, 5),
  l84: r3bTvW(84, 0), only: r3bTvW(84, 2), harm: r3bTvW(84, 4),
  l85: r3bTvW(85, 0), dying: r3bTvW(85, 1), bloody: r3bTvW(85, 3), barbaric: r3bTvW(85, 5), cruel: r3bTvW(85, 7),
  l86: r3bTvW(86, 0), meat: r3bTvW(86, 4), urine: r3bTvW(86, 6), stool: r3bTvW(86, 8),
  // stanza 10: the couple
  l87: r3bTvW(87, 0), couple: r3bTvW(87, 2), england: r3bTvW(87, 4),
  l88: r3bTvW(88, 0), sick: r3bTvW(88, 4),
  l89: r3bTvW(89, 0), observing: r3bTvW(89, 1), king89: r3bTvW(89, 3),
  l90: r3bTvW(90, 0), way: r3bTvW(90, 2), ticked: r3bTvW(90, 5),
  l91: r3bTvW(91, 0), went: r3bTvW(91, 2), gp: r3bTvW(91, 4),
  l92: r3bTvW(92, 0), made: r3bTvW(92, 2), fact: r3bTvW(92, 4), sheet: r3bTvW(92, 5),
  l93: r3bTvW(93, 0), stood93: r3bTvW(93, 2), rain: r3bTvW(93, 5),
  l94: r3bTvW(94, 0), stood94: r3bTvW(94, 2), heat: r3bTvW(94, 5),
  l95: r3bTvW(95, 0), gave: r3bTvW(95, 2), truth: r3bTvW(95, 5), did95: r3bTvW(95, 8), free: r3bTvW(95, 11),
  l96: r3bTvW(96, 0), life: r3bTvW(96, 1), quick: r3bTvW(96, 4), quietly: r3bTvW(96, 7),
  l97: r3bTvW(97, 0), parents: r3bTvW(97, 5),
  l98: r3bTvW(98, 0), told: r3bTvW(98, 1), stop: r3bTvW(98, 4),
  l99: r3bTvW(99, 0), king99: r3bTvW(99, 2), lawyers: r3bTvW(99, 5),
  l100: r3bTvW(100, 0), call: r3bTvW(100, 3), cops: r3bTvW(100, 4),
};
// Room-camera keys (world point at frame centre, zoom), the same framings as rounds 1 and 2:
// F_ROOM = pulled back to the king's shoulder, F_SET = the tube nearly filling the frame.
// e: true when the move into the key is eased (push or pull), false for a linear creep.
const R3BTV_CAM = [
  { t: R3BTV_T0, x: 722, y: 455, z: 1.5 },
  { t: B.pullBack - .02, x: 722, y: 455, z: 1.56 },               // creep in through the bulletin
  { t: B.pullBack + .73, x: 860, y: 515, z: 1.36, e: true },      // pull back: the king spends his gold on the set
  { t: R3BTV_S.s7 + .1, x: 860, y: 515, z: 1.34 },
  { t: C.barrel1 - .1, x: 722, y: 455, z: 1.52, e: true },        // push in for the lesson
  { t: C.l62 - .75, x: 722, y: 455, z: 1.57 },
  { t: C.l62 - .05, x: 860, y: 515, z: 1.36, e: true },           // pull back for the last three lines of 7
  { t: R3BTV_S.s8 - .1, x: 860, y: 515, z: 1.34 },
  { t: R3BTV_Q.l66 - .1, x: 722, y: 455, z: 1.52, e: true },            // push in on the news film from the counter
  { t: R3BTV_Q.l81 - .2, x: 722, y: 455, z: 1.58 },
  { t: R3BTV_Q.l81 + .3, x: 722, y: 455, z: 1.5, e: true },
  { t: R3BTV_Q.l87 - .2, x: 722, y: 455, z: 1.57 },
  { t: R3BTV_Q.l87 + .3, x: 722, y: 455, z: 1.5, e: true },
  { t: R3BTV_Q.l100 - .05, x: 722, y: 455, z: 1.56 },
  { t: R3BTV_Q.l100 + .7, x: 860, y: 515, z: 1.36, e: true },           // pull back to where the next bulletin opens
  { t: R3BTV_T1, x: 860, y: 515, z: 1.36 },
];
function r3bTvCamera(t) { return camKeys(R3BTV_CAM, t); }

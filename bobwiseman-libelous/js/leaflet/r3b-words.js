// Round 3, agent leaf-B: stanzas 6 and 7 of the fact-sheet version, song 95.916667-165.083333, frames f2302-f3962.
// Word times, all from source/lines.json via gen/r3b_leaf_lines.js (R3BLEAF_LINES). Nothing here quotes the lyric: the code
// only ever points at a word by [line, index].
const R3BLEAF_T6 = 95.916667, R3BLEAF_T7 = 123.125, R3BLEAF_T8 = 165.083333; // f2302, f2955 (stanza 7), f3962 (the workers page)

const R3BLEAF_L = {}; R3BLEAF_LINES.forEach(l => { R3BLEAF_L[l.i] = l; });
const r3bLeafW = (i, k) => { const a = R3BLEAF_L[i].words; return a[k < 0 ? a.length + k : k]; };
const r3bLeafS = (i, k) => r3bLeafW(i, k).s;
const r3bLeafUP = (i, k) => r3bLeafW(i, k).w.toUpperCase();

const R3BLEAF = {
  // stanza 6
  l41: r3bLeafS(41, 0), rap: r3bLeafS(41, 0), tower: r3bLeafS(41, 4),
  l42: r3bLeafS(42, 0), hair: r3bLeafS(42, 4), down: r3bLeafS(42, 5),
  l43: r3bLeafS(43, 0), tv: r3bLeafS(43, 1), stopped: r3bLeafS(43, 4), ad: r3bLeafS(43, 7), clown: r3bLeafS(43, 10),
  l44: r3bLeafS(44, 0), kids: r3bLeafS(44, 1), normal: r3bLeafS(44, 5), eat: r3bLeafS(44, 8), meat: r3bLeafS(44, 11),
  l45: r3bLeafS(45, 0), store: r3bLeafS(45, 2), brightly: r3bLeafS(45, 5), coloured: r3bLeafS(45, 6), swivel: r3bLeafS(45, 7), seat: r3bLeafS(45, 8),
  l46: r3bLeafS(46, 0), mama1: r3bLeafS(46, 2), mama2: r3bLeafS(46, 3), now: r3bLeafS(46, 4), daddy1: r3bLeafS(46, 7), daddy2: r3bLeafS(46, 8), too: r3bLeafS(46, 9),
  l47: r3bLeafS(47, 0), want: r3bLeafS(47, 2), childrens: r3bLeafS(47, 4), party: r3bLeafS(47, 5), what: r3bLeafS(47, 8), got: r3bLeafS(47, 10), doit: r3bLeafS(47, 12),
  l48: r3bLeafS(48, 0), gold: r3bLeafS(48, 2), king: r3bLeafS(48, 5), spent: r3bLeafS(48, 6), doing: r3bLeafS(48, 8), trick: r3bLeafS(48, 10),
  l49: r3bLeafS(49, 0), back: r3bLeafS(49, 1), thirty: r3bLeafS(49, 2), times: r3bLeafS(49, 3), invest: r3bLeafS(49, 5), quick: r3bLeafS(49, 6),
  // stanza 7
  l50: r3bLeafS(50, 0), tons: r3bLeafS(50, 2), of: r3bLeafS(50, 3), ink: r3bLeafS(50, 4),
  l51: r3bLeafS(51, 0), going: r3bLeafS(51, 1), waste: r3bLeafS(51, 3),
  l52: r3bLeafS(52, 0), publishing: r3bLeafS(52, 2), house: r3bLeafS(52, 3), order: r3bLeafS(52, 6), placed: r3bLeafS(52, 8),
  l53: r3bLeafS(53, 0), man: r3bLeafS(53, 2), fist: r3bLeafS(53, 5), wallet: r3bLeafS(53, 8), big: r3bLeafS(53, 10),
  l54: r3bLeafS(54, 0), wheels: r3bLeafS(54, 2), came: r3bLeafS(54, 4), adjustable: r3bLeafS(54, 7), lid: r3bLeafS(54, 8),
  l55: r3bLeafS(55, 0), hundred: r3bLeafS(55, 3), but: r3bLeafS(55, 4), million: r3bLeafS(55, 7), stacks: r3bLeafS(55, 8),
  l56: r3bLeafS(56, 0), title: r3bLeafS(56, 2), book: r3bLeafS(56, 5),
  l57: r3bLeafS(57, 0), nutri: r3bLeafS(57, 1), facts: r3bLeafS(57, 2),
  l58: r3bLeafS(58, 0), hired: r3bLeafS(58, 2), doctor: r3bLeafS(58, 4), phd: r3bLeafS(58, 7),
  l59: r3bLeafS(59, 0), wrote: r3bLeafS(59, 2), intro: r3bLeafS(59, 4), book2: r3bLeafS(59, 7), free: r3bLeafS(59, 9),
  l60: r3bLeafS(60, 0), lettuce: r3bLeafS(60, 3), bun: r3bLeafS(60, 6), health: r3bLeafS(60, 9), joke: r3bLeafS(60, 12),
  l61: r3bLeafS(61, 0), drink: r3bLeafS(61, 2), water1: r3bLeafS(61, 3), theres: r3bLeafS(61, 5), water2: r3bLeafS(61, 6), coke: r3bLeafS(61, 8),
  l62: r3bLeafS(62, 0), people: r3bLeafS(62, 2), good: r3bLeafS(62, 4),
  l63: r3bLeafS(63, 0), print: r3bLeafS(63, 3), legit: r3bLeafS(63, 5),
  l64: r3bLeafS(64, 0), ordered: r3bLeafS(64, 2), fries: r3bLeafS(64, 4), never: r3bLeafS(64, 7), did: r3bLeafS(64, 8), tip: r3bLeafS(64, 9),
};

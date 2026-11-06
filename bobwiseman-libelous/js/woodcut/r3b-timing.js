// Round 3, wood-B: the woodcut chapbook through stanzas 8-11 (frames 3962-6276), the workers, the factory farms,
// the couple and their fact sheet, one Tuesday. Beat times are read off the word onsets in lines.json
// (via gen/r3b_lines.js). Nothing retyped; lines are named by their index in lines.json.
const r3bT0 = 3962 / 24, r3bT1 = 6276 / 24;
const r3bF = 1 / 24;
const r3bI0 = r3bLY[0].i;                                        // global index of the first line here (65)
const r3bLN = (i) => r3bLY[i - r3bI0];                           // a line by its global index
const r3bL = (i) => r3bLN(i).s;                                  // its start
const r3bW = (i, w, nth = 0) => { const L = r3bLN(i).words.filter(x => x.w === w); if (!L[nth]) throw new Error(`no word ${w} in line ${i}`); return L[nth].s; };
const r3bWk = (i, k) => r3bLN(i).words[k].s;                     // word k of line i
const r3bOn = (i) => r3bLN(i).words.map(x => x.s);              // every onset of line i
const r3bLast = (i) => { const W_ = r3bLN(i).words; return W_[W_.length - 1].s; };

// which page (woodblock) each line is on, by chapter index (line 65 = 0)
//  0 the policy        1 the night shift    2 the young women   3 trained to smile   4 the toilets, the grill
//  5 the time clock    6 the union          7 shown the door    8 long, smelly, hot  9 the ladder, the wages
// 10 the farm sheds   11 inside the sheds  12 the conveyor     13 the couple       14 the spyglass
// 15 the meeting room 16 rain and heat     17 handing it out   18 the parents      19 one Tuesday
// 20 the patent       21 the phone         22 the legal teams  23 the law book
const r3bPAGE = [0, 0, 1, 2, 2, 3, 4, 4, 5, 5, 6, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 18, 18, 19, 19, 20, 21, 21, 22, 22, 22, 22, 23];
const r3bNPAGES = 24;
const r3bSTANZA = [65, 81, 87, 101];                             // each stanza's chain starts a fresh column
const r3bFLOWERS = [0, 10, 13, 19];                              // a stanza's first page carries the column flowers
if (r3bPAGE.length !== r3bLY.length) throw new Error('r3bPAGE does not cover every line');

// Round 3, agent wood-A: the woodcut chapbook, stanzas 6 and 7 (95.9167-165.0833, f2302-f3962).
// Beat times are read off the word onsets in lines.json (via gen/r3a-lyrics.js). Nothing retyped.
// Lines are named by their index in lines.json, so this file quotes nothing.
const R3A_T0 = 2302 / 24, R3A_T1 = 3962 / 24;
const R3A_F = 1 / 24;
const r3aL = (i) => R3A_LY[i - 31];                                   // a line by its global index
const r3aW = (i, w, nth = 0) => { const L = r3aL(i).words.filter(x => x.w === w); if (!L[nth]) throw new Error(`no word ${w} in line ${i}`); return L[nth].s; };
const r3aK = (i, k) => r3aL(i).words[k].s;                            // word k of line i (for words with quotes)
const r3aLast = (i) => { const w = r3aL(i).words; return w[w.length - 1].s; };

// The sheet runs on from looks/woodcut.html: its pages 0-28 hold stanzas 0-5, so stanza 6 starts on page 29.
// Page 28 (the shareholders' chart, line 40) is drawn here exactly as woodcut.html draws it, so the coordinator's
// hard cut at f2302 joins two identical pictures and the whip pan to page 29 happens inside this span.
const R3A_PAGE = {
  31: 22, 32: 22, 33: 23, 34: 23, 35: 24, 36: 24, 37: 25, 38: 26, 39: 27, 40: 28,   // stanza 5 (the seam page only)
  41: 29, 42: 29, 43: 29,          // the television: the tower, the hair, the show stopped by the clown
  44: 30,                          // the clown and the row of children
  45: 31,                          // the shop and its swivel seats
  46: 32,                          // the child between mama and daddy
  47: 33,                          // the children's party
  48: 34, 49: 34,                  // the king's gold goes in, thirty times as much comes out
  50: 35, 51: 35,                  // stanza 7: the ink cellar
  52: 36,                          // the printing house, the order
  53: 37, 54: 37,                  // the man with the fist, the wallet on wheels
  55: 38,                          // the stacks
  56: 39, 57: 39,                  // the book and its title
  58: 40, 59: 40,                  // the doctor writes the intro; the book is free
  60: 41, 61: 41,                  // the book open: the bun, the cup
  62: 42, 63: 42,                  // the people, the seal
  64: 43,                          // the counter, the fries, the tip jar
};
const R3A_FIRST_PAGE = 28, R3A_NPAGES = 44;           // pages 28-43 are drawn by this page
const R3A_STANZA_FIRST = [31, 41, 50];                 // each stanza's chain starts a fresh column
const R3A_FLOWER_PAGES = [29, 35];                     // a stanza's first page carries the column's flowers
const R3A_LINE0 = 41, R3A_LINE1 = 64;                  // the lines this span sings

const RB = {
  // page 29: the television
  l41: r3aL(41).s, rapunzel: r3aW(41, 'Rapunzel'), tower: r3aW(41, 'tower'),
  l42: r3aL(42).s, hair: r3aW(42, 'hair'), down: r3aW(42, 'down?'),
  l43: r3aL(43).s, tv: r3aW(43, 'TV'), stopped: r3aW(43, 'stopped'), ad: r3aW(43, 'ad'), clown: r3aW(43, 'clown'),
  // page 30: the clown and the children
  l44: r3aL(44).s, telling: r3aW(44, 'Telling'), kids: r3aW(44, 'kids'), normal: r3aW(44, 'normal'), eat: r3aW(44, 'eat'), little: r3aW(44, 'little'), meat: r3aW(44, 'meat'),
  // page 31: the shop
  l45: r3aL(45).s, store: r3aW(45, 'store'), brightly: r3aW(45, 'brightly'), coloured: r3aW(45, 'coloured'), swiveling: r3aW(45, 'swiveling'), seat: r3aW(45, 'seat'),
  // page 32: mama and daddy
  l46: r3aL(46).s, tell: r3aW(46, 'Tell'), mama1: r3aW(46, 'mama', 0), mama2: r3aW(46, 'mama', 1), now: r3aW(46, 'now'),
  daddy1: r3aW(46, 'daddy', 0), daddy2: r3aW(46, 'daddy', 1), too: r3aW(46, 'too'),
  // page 33: the party
  l47: r3aL(47).s, want: r3aW(47, 'want'), childrens: r3aW(47, "children's"), party: r3aW(47, 'party'), thisW: r3aW(47, 'this'), got: r3aW(47, 'got'), doW: r3aW(47, 'do'),
  // page 34: the gold
  l48: r3aL(48).s, gold: r3aW(48, 'gold'), king: r3aW(48, 'king'), spent: r3aW(48, 'spent'), doing: r3aW(48, 'doing'), trick: r3aW(48, 'trick'),
  l49: r3aL(49).s, back: r3aW(49, 'back'), n30: r3aW(49, '30'), times: r3aW(49, 'times'), investment: r3aW(49, 'investment'), quick: r3aW(49, 'quick'),
  // page 35: the ink
  l50: r3aL(50).s, tons: r3aW(50, 'tons'), ink: r3aW(50, 'ink'),
  l51: r3aL(51).s, going: r3aW(51, 'going'), waste: r3aW(51, 'waste'),
  // page 36: the printing house
  l52: r3aL(52).s, publishing: r3aW(52, 'publishing'), house: r3aW(52, 'house'), order: r3aW(52, 'order'), placed: r3aW(52, 'placed'),
  // page 37: the man, the fist, the wallet
  l53: r3aL(53).s, man: r3aW(53, 'man'), fist: r3aW(53, 'fist'), wallet: r3aW(53, 'wallet'), big: r3aW(53, 'big'),
  l54: r3aL(54).s, wheels: r3aW(54, 'wheels'), came: r3aW(54, 'came'), adjustable: r3aW(54, 'adjustable'), lid: r3aW(54, 'lid'),
  // page 38: the stacks
  l55: r3aL(55).s, couple1: r3aW(55, 'couple', 0), hundred: r3aW(55, 'hundred'), but: r3aW(55, 'but'), couple2: r3aW(55, 'couple', 1), million: r3aW(55, 'million'), stacks: r3aW(55, 'stacks'),
  // page 39: the book
  l56: r3aL(56).s, title: r3aW(56, 'title'), book56: r3aW(56, 'book'),
  l57: r3aL(57).s, nutr: r3aK(57, 1), facts: r3aK(57, 2),
  // page 40: the doctor
  l58: r3aL(58).s, hired: r3aW(58, 'hired'), doctor: r3aW(58, 'doctor'), phd: r3aW(58, 'PHD'),
  l59: r3aL(59).s, wrote: r3aW(59, 'wrote'), intro: r3aW(59, 'intro'), book59: r3aW(59, 'book'), free: r3aW(59, 'free'),
  // page 41: the open book
  l60: r3aL(60).s, said: r3aW(60, 'said'), lettuce: r3aW(60, 'lettuce'), bun: r3aW(60, 'bun'), health: r3aW(60, 'health'), joke: r3aW(60, 'joke'),
  l61: r3aL(61).s, drink: r3aW(61, 'drink'), water1: r3aW(61, 'water', 0), water2: r3aW(61, 'water', 1), coke: r3aW(61, 'coke'),
  // page 42: the people, the seal
  l62: r3aL(62).s, people: r3aW(62, 'people'), felt: r3aW(62, 'felt'), good: r3aW(62, 'good'),
  l63: r3aL(63).s, print: r3aW(63, 'print'), legit: r3aW(63, 'legit'),
  // page 43: the counter
  l64: r3aL(64).s, ordered: r3aW(64, 'ordered'), more: r3aW(64, 'more'), fries: r3aW(64, 'fries'), never: r3aW(64, 'never'), tip: r3aW(64, 'tip'),
  // every sung onset of a line (for figures that move on each word)
  on: (i) => r3aL(i).words.map(w => w.s),
};
// the title on the book's cover: the two quoted words of line 57 as sung, quotes stripped (nothing retyped)
const R3A_TITLE = r3aL(57).words.slice(1).map(w => w.w.replace(/["“”]/g, ''));

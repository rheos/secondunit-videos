// The last chapter of the woodcut chapbook (stanzas 12-14, 261.5 to the end of the song).
// Beat times are read off the word onsets in lines.json (via gen/end-lyrics.js). Nothing retyped.
const TE0 = 261.5, TE1 = 340.4375;
const LI0 = LYE[0].i;                                   // global index of the first line in this chapter
const LN = (i) => LYE[i - LI0];                         // a line by its global index
const wE = (i, k) => LN(i).words[k].s;                  // onset of word k of line i
const wEw = (i, w, nth = 0) => { const L = LN(i).words.filter(x => x.w === w); if (!L[nth]) throw new Error(`no word ${w} in line ${i}`); return L[nth].s; };
const lastW = (i) => { const W_ = LN(i).words; return W_[W_.length - 1].s; };

// which page (woodblock) each line is on, by chapter index (line 111 = 0)
//   0 the court   1 the king's side   2 speaking out   3 the judge   4 five views   5 the verdict   6 outside
const PAGE_E = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 4, 4, 5, 6, 6, 6, 6, 6, 6, 6];
const NPAGES_E = 8;                                     // page 7: the colophon (the instrumental tail)

const BE = {
  // 0 the court
  l111: LN(111).s, longest: wEw(111, 'longest'), made: wEw(111, 'made'),
  l112: LN(112).s, jury: wEw(112, 'jury'), legal: wEw(112, 'legal'), aid: wEw(112, 'aid'),
  // 1 the king's side
  l113: LN(113).s, king: wEw(113, 'king'), n30: wEw(113, '30'), billions: wEw(113, 'billions'), dollars: wEw(113, 'dollars'), spend: wEw(113, 'spend'),
  l114: LN(114).s, crush: wEw(114, 'crush'), people: wEw(114, 'people'), defend: wEw(114, 'defend'),
  // 2 speaking out
  l115: LN(115).s, l116: LN(116).s, tv: wEw(116, 'TV'), news: wEw(116, 'newsprint'), internet: wEw(116, 'internet'), crowds: wEw(116, 'crowds'),
  // 3 the judge
  l117: LN(117).s, judge: wEw(117, 'judge'), end: wEw(117, 'end'),
  l118: LN(118).s, agreed: wEw(118, 'agreed'), couple: wEw(118, 'couple'), trial: wEw(118, 'trial'),
  // 4 five views: the noun at the end of each line
  views: [119, 120, 121, 122, 123].map(i => ({ s: LN(i).s, noun: lastW(i) })),
  // 5 the verdict
  l124: LN(124).s, fine: wEw(124, 'fine'), guilty: wEw(124, 'guilty'), fuss: wEw(124, 'fuss'),
  // 6 outside: the refrain
  l125: LN(125).s,
  peopleOn: [wEw(125, 'people'), ...[126, 127, 129, 130].map(i => LN(i).s)],   // each "people" brings more people
  libelous: [125, 126, 127, 128, 129, 130, 131].map(i => lastW(i)),           // every "Libelous"
  held: [LN(128).s, LN(131).s],                                                // the two held shouts: leaflets thrown
  l131: LN(131).s,
  // the tail (onsets of the mix: the music fades 330-337.5, silence from 337.5)
  colPan: 331.61,      // the strong hit the colophon block prints on
  pullA: 333.2, pullB: 337.4,
};
// talking: the woman's speaking trumpet sounds on every onset of the "speak the truth" line
BE.speakWords = LN(115).words.map(w => w.s);

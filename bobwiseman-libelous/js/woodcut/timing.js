// Beat times for the woodcut, read off the word onsets in lines.json (via gen/lyrics.js). Nothing retyped.
const T0 = 0, T1 = 34.416667;
const wordAt = (li, w, nth = 0) => { const L = LYR[li].words.filter(x => x.w === w); if (!L[nth]) throw new Error(`no word ${w} in line ${li}`); return L[nth].s; };
const B = {
  l0: LYR[0].s, king: wordAt(0, 'king'),
  l1: LYR[1].s, plan: wordAt(1, 'plan'),
  l2: LYR[2].s, fist: wordAt(2, 'fist'),
  l3: LYR[3].s, knew: wordAt(3, 'knew'), man: wordAt(3, 'man'),
  l4: LYR[4].s, mouth: wordAt(4, 'mouth'),
  l5: LYR[5].s, spoke: wordAt(5, 'spoke'), meetings: wordAt(5, 'meetings'),
  l6: LYR[6].s, greetStart: wordAt(6, 'shareholders'), greeting: wordAt(6, 'greeting'),
  l7: LYR[7].s, smiled: wordAt(7, 'smiled'),
  l8: LYR[8].s, chose: wordAt(8, 'chose'), thisW: wordAt(8, 'this'), reason: wordAt(8, 'reason'),
  l9: LYR[9].s, cash: wordAt(9, 'cash'),
  l10: LYR[10].s, believing: wordAt(10, 'believing'),
};
// the mouth speaks on these sung onsets: "spoke at meetings" and the start of the next line, up to the greeting
B.speakWords = LYR[5].words.filter(w => w.s >= B.spoke).map(w => w.s).concat(LYR[6].words.filter(w => w.s < B.greetStart).map(w => w.s));
B.greetStep = (B.greeting + .25 - B.greetStart) / 15; // 15 shareholders lift their hats in a wave
B.coinStep = (B.believing - .12 - (B.l10 + .05)) / 24;     // 24 coins land before the king does
// intro: the press and the ornaments, on the song's beats (onset analysis of the mix, see NOTES.md)
B.thump = 1.48;
B.orn = [2.51, 3.16, 3.81, 4.46, 5.10, 5.75, 6.41, 7.05, 7.71, 8.36, 9.01, 9.65, 10.30, 10.96, 11.61, 12.26, 12.90];
B.blockDown = B.l0 - .07; // the inked king block meets the paper
// which page (block) each line is on; lines 5-7 share the meeting hall
const PAGE_OF = [0, 1, 2, 3, 4, 5, 5, 5, 6, 7, 8];

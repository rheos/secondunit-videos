// The cast, as puppet specs (see puppet() in kit.js). Her family is one paper: navy. Everyone else
// has their own colour. In the waking world she is grey-blue (CAST.herWake).
const CAST = {
  her:     { col: C.navy, kind: 'dress', head: 'her', height: 1, lace: true, old: OLD },
  herWake: { col: C.w1, kind: 'dress', head: 'her', height: 1, old: OLD },
  girl11:  { col: C.navy, kind: 'dressShort', head: 'child', hair: 'pony', height: .74, headK: .3 },
  boy8:    { col: C.navy, kind: 'shirt', head: 'child', hair: 'cap', height: .64, headK: .31 },
  girl3:   { col: C.navy, kind: 'dressShort', head: 'child', hair: 'pigtail', height: .5, headK: .4 },
  friendA: { col: C.plum, kind: 'dress', head: 'short', hair: 'hat', height: .97 },
  friendB: { col: C.tealDeep, kind: 'dress', head: 'short', hair: 'curls', height: .95 },
  doctor:  { col: C.ink, bodyCol: C.white, armCol: C.white, kind: 'coat', head: 'short', height: 1.03,
             headAcc: () => { cut(ellipse(44, -112, 8, 22), C.chrome, { sh: .4, grain: .1 }); } },
};

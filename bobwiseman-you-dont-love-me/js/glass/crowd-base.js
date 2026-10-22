// Draft 14: the registry the crowd's characters draw into (crowd-a.js, crowd-b.js, crowd-c.js fill it; finale-crowd.js
// places them). Load after finale-chorus.js (CH palette, chEye, chHumanMouth, chFace) and before the crowd files.
//
// The contract for a character, CROWD_DRAW.<key> = (g, m, t) => { ... }:
// - drawn at the local origin with the face centred on (0, 0), about 120 px wide and 150 px tall (finale-chorus.js chGent:
//   rx 58, ry 73); hats and ears may rise to about y -150;
// - shoulders or body from about y +60 down to y +420 at least, 360 px or more wide at y +400, so it hides the rows behind;
// - stained glass: pane() pieces with their lead, paint() lines for features, the CH colours or a film's own, no gradients;
// - m (0..1) is how far the mouth is open, singing; t is song time, for anything that idles (an ear, a propeller);
// - a pure function of its arguments; no real people's likenesses (one exception, by Robin's direction 2026-10-21: the host
//   is the John Cleese caricature from cleese.js, a warm tribute Bob asked for); hands have fingers (cleese.js glassHand,
//   draft 15; the 10,000 Miles toy figures keep their mitts, that's the toy); never little Bob (the red-hat man with the toy piano
//   and the Juno awards), who stays out of You Don't Love Me.
const CROWD_DRAW = {};
const CROWD_META = {}; // CROWD_META.<key> = { film: 'More', who: 'the customer' }

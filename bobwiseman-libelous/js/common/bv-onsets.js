// The backing singer's drawn-out sung title, three times in the song (BACKING-VOCAL.md, rheos/secondunit-videos#118).
// Song seconds, snapped on her own stem (work/karaoke/backing_roformer.flac). Each is one word on three held notes:
// syl[k].s = onset of syllable k, end = where her note stops (the reverb tail runs about 0.3 s more).
// Shared by every look; the labels are the song's title split the way she sings it.
const BV = [
  { n: 1, syl: [{ txt: 'LIB', s: 7.48 }, { txt: 'EL', s: 8.97 }, { txt: 'OUS', s: 10.90 }], end: 12.92 },
  { n: 2, syl: [{ txt: 'LIB', s: 310.08 }, { txt: 'EL', s: 311.56 }, { txt: 'OUS', s: 313.45 }], end: 315.62 },
  { n: 3, syl: [{ txt: 'LIB', s: 323.89 }, { txt: 'EL', s: 325.42 }, { txt: 'OUS', s: 327.29 }], end: 329.25 },
];
// the occurrence that is sounding (or about to) at t, with lead-in a and lead-out b seconds
function bvAt(t, a = .5, b = 1) { return BV.find(o => t >= o.syl[0].s - a && t < o.end + b) || null; }
// which syllable is being sung at t: -1 before the first, 3 after the note ends
function bvSyl(o, t, fe = 1 / 24) { if (t >= o.end) return 3; let k = -1; o.syl.forEach((y, i) => { if (t >= y.s - fe) k = i; }); return k; }

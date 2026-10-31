// Sung-word lookup over gen/lines.js (LINES: [{i, text, s, e, words: [{w, s, e}]}], built from source/lines.json and
// gitignored because it quotes the lyric). Every look builds its captions from this, so a word appears on its onset.
function lineAt(t, lead = 0) { let k = -1; for (let i = 0; i < LINES.length; i++) if (LINES[i].s - lead <= t) k = i; return k < 0 ? null : LINES[k]; }
function wordsShown(L, t) { return L.words.filter((w) => w.s <= t + 1e-6).length; }
function linesIn(t0, t1) { return LINES.filter((l) => l.s >= t0 - 1e-6 && l.s < t1); }

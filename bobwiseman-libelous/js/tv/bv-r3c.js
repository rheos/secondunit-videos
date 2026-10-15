// The backing singer's box (bv-inset.js) on the TV-news page for stanzas 12-14 (tv-r3c): her two held shouts in
// the refrain, over the court-steps film. Loaded after r3c-main.js; nothing in the r3c files is edited: this wraps
// r3cProgram, so her box is part of the bulletin picture and goes through the CRT like it.
function bvtR3c(g, t) {
  if (PROBE.on) { // every face the program drew, for the spec's checks
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    for (const hd of R3C_HEADS) PROBE.box(g, 'face', hd.x0, hd.y0, hd.x1 - hd.x0, hd.y1 - hd.y0);
    g.restore();
  }
  bvtInset(g, t, { tint: true });
}
const bvtProgramR3c = r3cProgram;
r3cProgram = function (t) { bvtProgramR3c(t); if (t < R3CQ.desk2) bvtR3c(r3cPg, t); };

// The backing singer's box (bv-inset.js) on the TV-news page for stanzas 0-5 (tv-r3a): her sung title in the
// intro, 7.48-12.92 s, before the first line. Loaded after r3a-main.js; nothing in the r3a files is edited: this
// wraps r3aTvProgram, so her box is part of the bulletin picture and goes through the CRT like it.
// Over the ident (until the cut to the studio at r3aTvC.hit) her box sits in its usual place, top right. From the
// cut she is in the anchor's over-the-shoulder box itself (same place and size as r3aTvBox), which would otherwise
// show the globe; when her note ends her box wipes off and the globe is there underneath.
const BVT_OTS = { x: 548, y: 54, w: 340, h: 250 };
function bvtR3a(g, t) {
  if (PROBE.on) {
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    for (const [x0, y0, x1, y1] of r3aTvHeads) PROBE.box(g, 'face', x0, y0, x1 - x0, y1 - y0);
    g.restore();
  }
  bvtInset(g, t, { box: t < r3aTvC.hit ? BVT_BOX : BVT_OTS });
}
const bvtProgramR3a = r3aTvProgram;
r3aTvProgram = function (t) { bvtProgramR3a(t); if (t >= r3aTvC.on) bvtR3a(r3aTvPG, t); };

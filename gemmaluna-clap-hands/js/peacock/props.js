// Props that recur across sections: the clock and its pointing hands, the rowboat, the brass band's
// instruments, dragonflies and moths, the jeans, the paladin's helmet and its banknote, the bowler and cane.
// Each draws in local units around (0,0) after a translate/scale by the caller unless it takes x, y, s.

// a Nouveau pointing hand (manicule), wrist at (0,0), the index finger pointing up (-y), ~1.6 units long
function manicule(sc, skin = SKIN.cream, cuffCol = C.gold) {
  g.save(); g.scale(sc, sc);
  cut(capsule(-.1, -.6, -.1, -1.5, .12, .11), skin.fill, { sh: .6, lift: .3 });
  cut(blob([[-.34, -.05], [-.38, -.5], [-.26, -.72], [.1, -.74], [.34, -.6], [.36, -.2], [.26, 0]], .5), skin.fill, { sh: .7, lift: .3 });
  for (let i = 0; i < 3; i++) cut(ellipse(.3, -.6 + i * .17, .1, .09), skin.fill, { sh: .4 });
  cut(capsule(-.3, -.15, -.42, -.55, .09), skin.shade, { sh: .4 });
  g.save(); g.globalAlpha *= .5; g.strokeStyle = skin.line; g.lineWidth = .02; for (let i = 0; i < 2; i++) { g.beginPath(); g.moveTo(.06, -.52 + i * .17); g.lineTo(.3, -.52 + i * .17); g.stroke(); } g.restore();
  cut(poly([[-.4, 0], [-.27, -.06], [-.14, 0], [0, -.06], [.14, 0], [.27, -.06], [.4, 0], [.44, .34], [-.44, .34]]), cuffCol, { sh: .5 });
  g.restore();
}
// the clock face: a zodiac halo with twelve gold pips. Hands are drawn by the caller (clockHands).
function clockFace(x, y, r, t, light = 0) {
  if (light > 0) { glow(x, y, r * 2.2, '250,215,140', .55 * light); rays(x, y, r * 1.02, r * 2.4, 24, t * .05, C.goldPale, .6 * light); }
  cut(scallop(x, y, r, 40, .04, t * .02), C.gold, { sh: 1.1, lift: .6 });
  cut(ringLace(x, y, r * .78, r * .93, 24, t * .02), C.cream, { sh: .7, lift: .3, rule: 'evenodd' });
  cut(circle(x, y, r * .76), C.tealDeep, { sh: .5 });
  cut(ringLace(x, y, r * .64, r * .68), C.goldDeep, { sh: .2, rule: 'evenodd' });
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU - Math.PI / 2, px = x + Math.cos(a) * r * .7, py = y + Math.sin(a) * r * .7;
    if (i % 3 === 0) cut(flowerPath(px, py, r * .07, 5, a), C.goldPale, { sh: .3 }); else cut(circle(px, py, r * .025), C.goldPale, { sh: .2, grain: 0 });
  }
  if (light > 0) { g.save(); g.globalAlpha *= .5 * light; cut(circle(x, y, r * .76), C.teal, { sh: 0 }); g.restore(); }
}
// a clock hand: gold rod from the centre, a pointing hand at its tip. a = radians clockwise from twelve
function clockHand(x, y, a, len, sc) {
  g.save(); g.translate(x, y); g.rotate(a);
  cut(rect(-8, -len + sc * .3, 16, len - sc * .3), C.goldDeep, { sh: .6, lift: .3 });
  tendril(whipPts([0, -len * .3], [len * .12, -len * .38], [len * .1, -len * .5], [len * .02, -len * .55], 14, 1), 8, C.gold, { sh: .3 });
  g.translate(0, -len + sc * .3); manicule(sc);
  g.restore();
}
// the little rowboat (side view, bow left), oars dipping with ph; a lantern on the stern post
function rowboat(x, y, s, ph, lantern = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const o = Math.sin(ph);
  for (const sx of [-1]) { g.save(); g.translate(-10, -40); g.rotate(.5 + o * .45); cut(rect(-5, 0, 10, 170), C.creamDeep, { sh: .4 }); cut(rrect(-14, 150, 28, 60, 10), C.creamDeep, { sh: .3 }); g.restore(); }
  cut(blob([[-170, -60], [-120, 20], [120, 20], [180, -70], [150, -60], [-150, -50]], .4), C.plum, { sh: .9, lift: .4 });
  cut(rect(-160, -66, 330, 12), C.gold, { sh: .3, grain: 0 });
  for (let i = 0; i < 4; i++) cut(rect(-110 + i * 70, -50, 6, 60), C.plumDeep, { sh: 0, grain: 0, alpha: .5 });
  cut(rect(150, -150, 8, 90), C.goldDeep, { sh: .3 });
  if (lantern) { glow(158, -160, 110, '250,215,140', .5 * lantern); cut(rrect(144, -186, 28, 36, 8), C.goldPale, { sh: .4 }); }
  g.save(); g.translate(0, -40); g.rotate(.4 - o * .45); cut(rect(-5, 0, 10, 170), C.cream, { sh: .4 }); cut(rrect(-14, 150, 28, 60, 10), C.cream, { sh: .3 }); g.restore();
  g.restore();
}
// the brass band: a bass drum, a tambourine, a tuba
function bassDrum(s) {
  g.save(); g.scale(s, s);
  cut(rrect(-120, -90, 240, 180, 40), C.plum, { sh: .9, lift: .3 });
  cut(ellipse(-110, 0, 30, 92), C.cream, { sh: .5 });
  for (const y of [-80, 80]) cut(rect(-124, y - 8, 248, 16), C.gold, { sh: .3 });
  for (let i = 0; i < 5; i++) { g.save(); g.globalAlpha *= .8; g.strokeStyle = C.goldPale; g.lineWidth = 5; g.beginPath(); g.moveTo(-100 + i * 50, -74); g.lineTo(-75 + i * 50, 74); g.stroke(); g.restore(); }
  cut(blob([[-20, -10], [60, -40], [110, -20], [40, 20]], .5), C.goldPale, { sh: .3 });
  g.restore();
}
function tambourine(s) {
  g.save(); g.scale(s, s);
  cut(ringLace(0, 0, 56, 74), C.gold, { sh: .8, rule: 'evenodd' });
  cut(circle(0, 0, 56), C.cream, { sh: .2, alpha: .9 });
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; cut(ellipse(Math.cos(a) * 65, Math.sin(a) * 65, 14, 9, a), C.goldPale, { sh: .3 }); }
  for (let i = 0; i < 3; i++) cut(rect(-30 + i * 20, -60 + i * 6, 6, 40), C.plumLight, { sh: 0, alpha: .7 });
  g.restore();
}
function tuba(s) { // round coiled body, three valves, a big bell opening up and to the right
  g.save(); g.scale(s, s);
  cut(ringLace(-20, 40, 46, 92), C.gold, { sh: .9, lift: .3, rule: 'evenodd' });
  cut(poly([[30, -10], [70, -150], [120, -230], [210, -260], [150, -170], [80, -10]]), C.gold, { sh: .8, lift: .3 });
  cut(ellipse(176, -252, 74, 30, -.45), C.goldPale, { sh: .7, lift: .3 });
  cut(ellipse(176, -252, 50, 18, -.45), C.goldDeep, { sh: 0 });
  for (let i = 0; i < 3; i++) { cut(rect(-60 + i * 26, -70, 16, 60), C.goldDeep, { sh: .3 }); cut(circle(-52 + i * 26, -76, 11), C.goldPale, { sh: .3 }); }
  cut(capsule(-110, 40, -150, -20, 9, 7), C.goldDeep, { sh: .3 });
  g.restore();
}
// a dragonfly (Lalique): long body, four lace wings flapping with ph; heading a
function dragonfly(x, y, s, a, ph, col = C.tealLight) {
  g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s);
  const f = .35 + .65 * Math.abs(Math.sin(ph));
  for (const [wx, sy] of [[-14, -1], [-14, 1], [10, -1], [10, 1]]) {
    g.save(); g.translate(wx, 0); g.scale(1, f * sy); cut(ellipse(0, -60, 22, 62, wx > 0 ? .3 : -.3), C.cream, { sh: .3, alpha: .75 }); g.restore();
  }
  cut(capsule(-120, 0, 30, 0, 7, 11), col, { sh: .5 });
  cut(circle(40, 0, 16), col, { sh: .5 });
  cut(circle(46, -8, 6), C.goldPale, { sh: 0, grain: 0 }); cut(circle(46, 8, 6), C.goldPale, { sh: 0, grain: 0 });
  for (let i = 0; i < 4; i++) cut(rect(-100 + i * 26, -8, 4, 16), C.gold, { sh: 0, grain: 0 });
  g.restore();
}
function moth(x, y, s, a, ph) {
  g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s);
  const f = .4 + .6 * Math.abs(Math.sin(ph));
  for (const sy of [-1, 1]) { g.save(); g.scale(1, f * sy); cut(blob([[0, 0], [-40, -50], [-10, -90], [40, -70], [50, -20]], .6), C.plumLight, { sh: .4 }); cut(circle(10, -50, 12), C.gold, { sh: 0, grain: .1 }); cut(circle(10, -50, 5), C.plumDeep, { sh: 0, grain: 0 }); g.restore(); }
  cut(capsule(-30, 0, 34, 0, 8, 10), C.plumDeep, { sh: .3 });
  g.restore();
}
// jeans hanging by the waistband from a line at (0,0); the grip of a pistol shows from the back pocket
function jeans(s, sway = 0, col = C.tealDeep) {
  g.save(); g.scale(s, s); g.rotate(sway);
  cut(blob([[-90, 0], [90, 0], [104, 380], [60, 384], [12, 120], [-12, 120], [-60, 384], [-104, 380]], .2), col, { sh: 1, lift: .4 });
  cut(rect(-92, 0, 184, 26), C.teal, { sh: .3 });
  g.save(); g.globalAlpha *= .8; g.strokeStyle = C.gold; g.lineWidth = 3; g.setLineDash([8, 7]);
  g.beginPath(); g.moveTo(-80, 30); g.lineTo(-90, 370); g.moveTo(80, 30); g.lineTo(90, 370); g.moveTo(0, 30); g.lineTo(0, 110); g.stroke(); g.restore();
  // the back pocket and the pistol grip in it (an object only)
  cut(poly([[20, 60], [80, 60], [76, 140], [50, 152], [24, 140]]), C.teal, { sh: .5 });
  cut(blob([[34, 70], [40, 6], [70, -6], [80, 10], [62, 66]], .4), C.plumDeep, { sh: .6, lift: .2 });
  cut(circle(62, 6, 5), C.gold, { sh: 0, grain: 0 });
  for (const sx of [-1, 1]) cut(rect(sx * 60 - 6, -14, 12, 26), C.creamDeep, { sh: .3 }); // pegs
  g.restore();
}
// the paladin's helmet: a great helm with visor slits and a plume; a plain banknote tucked under it (no numbers)
function helmet(s, note = 1) {
  g.save(); g.scale(s, s);
  if (note > 0) { g.save(); g.rotate(-.25); cut(rrect(10, 40, 190 * note, 80, 6), C.tealLight, { sh: .7, lift: .3 }); cut(rrect(22, 52, 166 * note, 56, 4), C.teal, { sh: 0, grain: .3, alpha: .6 }); cut(ellipse(10 + 95 * note, 80, 24, 22), C.goldPale, { sh: 0, grain: .2 }); g.restore(); }
  cut(blob([[-110, 120], [-120, -40], [-80, -140], [0, -170], [80, -140], [120, -40], [110, 120]], .45), C.creamDeep, { sh: 1, lift: .4 });
  cut(rect(-6, -168, 12, 288), C.cream, { sh: .3 });
  for (const y of [-30, 4]) cut(rrect(-96, y, 192, 14, 7), C.plumDeep, { sh: 0, grain: 0 });
  for (let i = 0; i < 6; i++) cut(circle(-80 + i * 32, 60, 5), C.plumDeep, { sh: 0, grain: 0 });
  tendril(whipPts([0, -160], [-60, -260], [-180, -260], [-220, -170], 40, -1), 40, C.plumLight, { sh: .6 });
  g.restore();
}
function bowler(s) {
  g.save(); g.scale(s, s);
  cut(ellipse(0, 0, 110, 22), C.plumDeep, { sh: .8 });
  const c = new Path2D(); c.moveTo(-70, -4); c.bezierCurveTo(-74, -120, 74, -120, 70, -4); c.closePath(); cut(c, C.plumDeep, { sh: .8, lift: .2 });
  cut(rect(-70, -26, 140, 18), C.plum, { sh: .2 });
  g.restore();
}
function cane(len) {
  cut(rect(-7, 0, 14, len), C.goldDeep, { sh: .7 });
  cut(ringLace(-30, 0, 18, 32), C.goldDeep, { sh: .6, rule: 'evenodd' });
  cut(rect(-9, len - 14, 18, 14), C.gold, { sh: .3 });
}

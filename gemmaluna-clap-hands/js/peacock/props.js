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
// the twelve signs of the zodiac as pen strokes in a unit box (-1..1, y down), for the clock's bezel roundels
// (draft 4, the audit: Mucha's Zodiac, the twelve roundels as the signs instead of generic flowers)
const ZODIAC = [
  'M -0.75 -0.1 C -0.95 -0.85 -0.05 -0.95 0 -0.25 C 0.05 -0.95 0.95 -0.85 0.75 -0.1 M 0 -0.25 L 0 0.8',
  'M -0.8 -0.8 C -0.65 -0.15 0.65 -0.15 0.8 -0.8 M 0.42 0.3 A 0.42 0.42 0 1 1 -0.42 0.3 A 0.42 0.42 0 1 1 0.42 0.3',
  'M -0.75 -0.75 Q 0 -0.5 0.75 -0.75 M -0.75 0.75 Q 0 0.5 0.75 0.75 M -0.33 -0.62 L -0.33 0.62 M 0.33 -0.62 L 0.33 0.62',
  'M -0.75 -0.2 C -0.5 -0.85 0.5 -0.85 0.8 -0.35 M 0.75 0.2 C 0.5 0.85 -0.5 0.85 -0.8 0.35 M -0.33 -0.22 A 0.2 0.2 0 1 1 -0.73 -0.22 A 0.2 0.2 0 1 1 -0.33 -0.22 M 0.73 0.22 A 0.2 0.2 0 1 1 0.33 0.22 A 0.2 0.2 0 1 1 0.73 0.22',
  'M -0.2 0.35 A 0.27 0.27 0 1 1 -0.74 0.35 A 0.27 0.27 0 1 1 -0.2 0.35 M -0.25 0.2 C -0.55 -0.55 0.4 -0.95 0.45 -0.25 C 0.48 0.25 0.2 0.55 0.5 0.75 Q 0.7 0.85 0.85 0.65',
  'M -0.8 -0.55 L -0.8 0.65 M -0.8 -0.3 Q -0.55 -0.75 -0.3 -0.3 L -0.3 0.65 M -0.3 -0.3 Q -0.05 -0.75 0.2 -0.3 L 0.2 0.45 Q 0.25 0.85 0.65 0.5 Q 0.85 0.2 0.4 0.25',
  'M -0.8 0.6 L 0.8 0.6 M -0.8 0.22 L -0.33 0.22 C -0.55 -0.65 0.55 -0.65 0.33 0.22 L 0.8 0.22',
  'M -0.8 -0.55 L -0.8 0.55 M -0.8 -0.3 Q -0.55 -0.75 -0.3 -0.3 L -0.3 0.55 M -0.3 -0.3 Q -0.05 -0.75 0.2 -0.3 L 0.2 0.45 Q 0.25 0.7 0.75 0.6 M 0.55 0.38 L 0.78 0.6 L 0.55 0.82',
  'M -0.7 0.7 L 0.7 -0.7 M 0.1 -0.72 L 0.72 -0.72 L 0.72 -0.1 M -0.5 -0.05 L 0.05 0.5',
  'M -0.85 -0.6 Q -0.6 -0.65 -0.45 0.45 L -0.1 -0.55 Q 0.05 0.6 0.55 0.55 A 0.25 0.25 0 1 0 0.35 0.1 Q 0.2 0.6 -0.05 0.85',
  'M -0.8 -0.12 L -0.4 -0.45 L 0 -0.12 L 0.4 -0.45 L 0.8 -0.12 M -0.8 0.45 L -0.4 0.12 L 0 0.45 L 0.4 0.12 L 0.8 0.45',
  'M -0.6 -0.78 Q -0.05 0 -0.6 0.78 M 0.6 -0.78 Q 0.05 0 0.6 0.78 M -0.42 0 L 0.42 0',
].map((d) => new Path2D(d));
// one sign at (x, y), s px per unit; skipped when it would be under ~4 px on the canvas
function zodiacGlyph(i, x, y, s, col, lw = .17) {
  const m = g.getTransform(), k = Math.hypot(m.a, m.b) * s; if (k < 4) return;
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(ZODIAC[((i % 12) + 12) % 12]); g.restore();
}
// the clock face: a zodiac halo with twelve gold pips. Hands are drawn by the caller (clockHands).
// draft 3: lit cold, from inside the dial (moonlight, not a sunrise), with a zodiac bezel of twelve roundels
// draft 4: the roundels carry the twelve signs. lit (0..12): how many roundels are lit with moonlight, sweeping
// clockwise from twelve (a fraction lights the next one part way). haloR: the outer glow's radius in r (the old
// 2.1 washed the whole frame at close range).
function clockFace(x, y, r, t, light = 0, pips = 1, lit = 0, haloR = 2.1) { // pips: alpha of the twelve hour marks (s07 pops them off as stars)
  if (light > 0) glow(x, y, r * haloR, '200,235,225', .45 * light);
  const rot = t * .02;
  cut(scallop(x, y, r, 40, .04, rot), C.gold, { sh: 1.1, lift: .6 });
  { // the zodiac ring: a cream band with twelve gold roundels, each holding its sign
    const r0 = r * .72, r1 = r * .9, rm = (r0 + r1) / 2, bw = r1 - r0;
    const band = new Path2D(); band.arc(x, y, r1, 0, TAU); band.moveTo(x + r0, y); band.arc(x, y, r0, 0, TAU, true);
    cut(band, C.cream, { sh: .7, lift: .3, rule: 'evenodd' });
    for (let i = 0; i < 12; i++) {
      const a = rot + TAU * i / 12 - Math.PI / 2, cx = x + Math.cos(a) * rm, cy = y + Math.sin(a) * rm, l = clamp(lit - i);
      cut(circle(cx, cy, bw * .36), C.gold, { sh: .4, grain: 0 }); cut(circle(cx, cy, bw * .27), C.tealDeep, { sh: 0, grain: 0 });
      // lit: the glass goes moonlit teal and the sign glows white (dark marks on a pale disc read as little faces)
      if (l > 0) { glow(cx, cy, bw * .9, '215,240,230', .5 * l); g.save(); g.globalAlpha *= l; cut(circle(cx, cy, bw * .27), C.tealLight, { sh: 0, grain: 0 }); g.restore(); }
      zodiacGlyph(i, cx, cy, bw * .17, l > .5 ? C.white : C.goldPale, l > .5 ? .24 : .2);
    }
  }
  cut(circle(x, y, r * .7), C.tealDeep, { sh: .5 });
  if (light > 0) { g.save(); g.globalAlpha *= Math.min(1, .7 * light); cut(circle(x, y, r * .7), C.tealLight, { sh: 0, grain: .3 }); g.restore(); glow(x, y, r * .7, '225,245,235', .35 * light); }
  cut(ringLace(x, y, r * .62, r * .66), C.goldDeep, { sh: .2, rule: 'evenodd' });
  if (pips <= 0) return;
  g.save(); g.globalAlpha *= Math.min(1, pips);
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU - Math.PI / 2, px = x + Math.cos(a) * r * .55, py = y + Math.sin(a) * r * .55;
    if (i % 3 === 0) cut(flowerPath(px, py, r * .06, 5, a), C.goldPale, { sh: .3 }); else cut(circle(px, py, r * .022), C.goldPale, { sh: .2, grain: 0 });
  }
  g.restore();
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
  // draft 4 (the audit: the plum hull vanished on plum, only the oars read): the far side's cream inner shows above
  // the gunwale, and the hull has a goldPale keyline
  const hull = blob([[-170, -60], [-120, 20], [120, 20], [180, -70], [150, -60], [-150, -50]], .4);
  cut(poly([[-158, -62], [-120, -84], [130, -88], [172, -72]]), C.cream, { sh: .3, grain: .1 });
  g.save(); g.lineWidth = 12; g.strokeStyle = C.goldPale; g.lineJoin = 'round'; g.stroke(hull); g.restore();
  cut(hull, C.plum, { sh: .9, lift: .4 });
  cut(rect(-160, -70, 330, 16), C.gold, { sh: .3, grain: 0 });
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
  // the back pocket and the pistol grip in it (an object only). Draft 4 (the audit: the cream grip with stripes
  // read as a luggage tag): a dark plum revolver butt curving up and back out of the pocket, its checkered panel,
  // a gold butt cap, the hammer and a gold trigger guard showing at the pocket's lip
  g.save(); g.translate(46, 64); g.rotate(-.34);
  const guard = new Path2D(); guard.arc(30, 2, 22, Math.PI * 1.0, Math.PI * 2.0, false); guard.arc(30, 2, 13, Math.PI * 2.0, Math.PI * 1.0, true); guard.closePath();
  cut(guard, C.gold, { sh: .4, grain: 0 }); // the trigger guard, half out of the pocket
  cut(poly([[-22, 8], [-20, -26], [22, -32], [26, 8]]), C.gold, { sh: .5, grain: 0 }); // the back of the frame
  cut(poly([[14, -26], [40, -50], [48, -42], [26, -16]]), C.goldDeep, { sh: .5, grain: 0 }); // the hammer spur
  // the butt: long, curving back, flaring into a bird's-head end
  const butt = new Path2D('M -18 -24 C -22 -60 -30 -96 -48 -122 C -54 -134 -40 -146 -24 -142 C -8 -138 6 -124 10 -100 C 14 -74 16 -50 18 -26 Z');
  g.save(); g.lineWidth = 8; g.strokeStyle = C.goldPale; g.lineJoin = 'round'; g.stroke(butt); g.restore();
  cut(butt, C.plumDeep, { sh: .8, lift: .4 });
  const panel = new Path2D('M -10 -36 C -14 -62 -20 -88 -30 -110 C -22 -120 -10 -114 -4 -100 C 0 -80 4 -58 6 -36 Z');
  g.save(); g.clip(panel); g.strokeStyle = C.plumLight; g.lineWidth = 2.2; g.beginPath();
  for (let i = -6; i <= 6; i++) { g.moveTo(-40 + i * 9, -120); g.lineTo(-40 + i * 9 + 50, -30); g.moveTo(-40 + i * 9 + 50, -120); g.lineTo(-40 + i * 9, -30); }
  g.stroke(); g.restore();
  g.save(); g.lineWidth = 2.5; g.strokeStyle = C.goldDeep; g.stroke(panel); g.restore();
  g.save(); g.lineWidth = 5; g.strokeStyle = C.gold; g.lineCap = 'round'; g.beginPath(); g.moveTo(16, -30); g.bezierCurveTo(14, -60, 10, -96, 2, -118); g.stroke(); g.restore(); // the backstrap
  cut(circle(-30, -134, 7), C.gold, { sh: .3, grain: 0 }); // the lanyard ring on the butt
  g.restore();
  cut(poly([[20, 60], [80, 60], [76, 140], [50, 152], [24, 140]]), C.teal, { sh: .5 });
  g.save(); g.strokeStyle = C.gold; g.lineWidth = 3; g.globalAlpha *= .8; g.setLineDash([7, 6]); g.beginPath(); g.moveTo(24, 66); g.lineTo(76, 66); g.stroke(); g.restore();
  for (const sx of [-1, 1]) cut(rect(sx * 60 - 6, -14, 12, 26), C.creamDeep, { sh: .3 }); // pegs
  g.restore();
}
// a plain banknote (no numbers): its left end at (0,0), len 0..1 how much of it shows (it grows to the right)
function banknote(len = 1) {
  if (len <= 0) return;
  cut(rrect(0, -48, 210 * len, 96, 6), C.cream, { sh: .7, lift: .3 });
  cut(rrect(10, -38, 190 * len, 76, 4), C.tealLight, { sh: 0, grain: .3, alpha: .8 });
  cut(ellipse(105 * len, 0, 30, 30), C.gold, { sh: 0, grain: .2 }); cut(ellipse(105 * len, -2, 13, 17), C.plum, { sh: 0, grain: 0 });
  for (const sx of [-1, 1]) cut(circle(105 * len + sx * 70, 0, 10), C.goldPale, { sh: 0, grain: 0 });
}
// the paladin's helmet: a great helm (flat top, cross-shaped visor slit, rivets), a crest of peacock feathers that
// always shows, and a hinged jaw plate; a plain banknote tucked under the chin. Local units: it sits on y = 120,
// its flat top at y = -176. Draft 4 (the audit: the round shell read as a bell, the plume got lost in the theatre).
// note: how much of the note shows under the chin (0..1, as before).
// jaw (0..1): the jaw plate drops open, showing the dark mouth. swallow (0..1): the note swings up into the open
// mouth and is pulled in (1 = gone inside). To spit it out, open the jaw and run swallow from 1 back to 0; to fly
// it further, draw banknote() yourself from where swallow 0 leaves it (left end at (30, 77), turned -.25).
function helmet(s, note = 1, jaw = 0, swallow = 0) {
  g.save(); g.scale(s, s);
  const J = clamp(jaw), S = clamp(swallow), hy = 18, drop = 58 * J;
  // the crest: three peacock feathers rising from behind the top, leaning back over the left shoulder
  for (const [fx, a, L] of [[-58, -.62, 170], [-30, -.3, 215], [-4, -.08, 150]]) feather(fx, -150, -Math.PI / 2 + a, L, .9);
  cut(rrect(-74, -196, 76, 26, 8), C.gold, { sh: .5, grain: 0 }); // the crest socket
  // the dark mouth behind the open jaw
  if (J > 0) { cut(rrect(-104, hy - 8, 208, drop + 26, 16), C.plumDeep, { sh: 0, grain: .2 }); cut(rrect(-90, hy, 180, drop + 6, 12), '#1c0d1b', { sh: 0, grain: 0 }); }
  // the note: tucked under the chin, then up into the mouth (hidden behind the face and the jaw where they cover it)
  if (note > 0 && S < 1) {
    const e = eo(clamp(S / .45)), len = note * (1 - ss(.4, 1, S));
    g.save(); g.translate(lerp(30, -70, e), lerp(77, hy + 4 + drop * .55, e)); g.rotate(lerp(-.25, -.06, e)); banknote(len); g.restore();
  }
  // the upper shell, steel lit by the moon: flat top, flared sides, ending at the jaw line
  const upper = new Path2D('M -114 18 L -118 -20 Q -121 -142 -100 -166 Q -92 -176 -80 -177 Q 0 -184 80 -177 Q 92 -176 100 -166 Q 121 -142 118 -20 L 114 18 Z');
  cut(upper, C.creamDeep, { sh: 1, lift: .4 });
  g.save(); g.clip(upper);
  g.globalAlpha *= .55; g.fillStyle = C.cream; g.fillRect(-104, -180, 34, 200); g.globalAlpha /= .55; // a cold highlight down the left
  g.globalAlpha *= .22; g.fillStyle = C.tealDeep; g.fillRect(70, -180, 60, 200); g.globalAlpha /= .22; // the far side in shade
  g.fillStyle = C.gold; g.fillRect(-130, -158, 260, 18); // the brow band
  g.restore();
  cut(rect(-8, -182, 16, 200), C.cream, { sh: .3, grain: 0 }); // the ridge down the middle
  for (const sx of [-1, 1]) cut(rrect(sx > 0 ? 14 : -98, -66, 84, 16, 7), C.plumDeep, { sh: 0, grain: 0 }); // the eye slit: the cross bar
  for (let i = 0; i < 8; i++) cut(circle(-98 + i * 28, -149, 4.5), C.plumDeep, { sh: 0, grain: 0 }); // rivets on the brow
  // the jaw plate, hinged at the sides, dropping open
  g.save(); g.translate(0, drop); g.scale(1 + .04 * J, 1 - .12 * J);
  const lower = new Path2D('M -114 18 L 114 18 L 106 96 Q 96 118 60 122 L -60 122 Q -96 118 -106 96 Z');
  cut(lower, C.creamDeep, { sh: .9, lift: .4 });
  g.save(); g.clip(lower); g.globalAlpha *= .55; g.fillStyle = C.cream; g.fillRect(-104, 18, 34, 110); g.globalAlpha /= .55; g.fillStyle = C.gold; g.fillRect(-130, 18, 260, 14); g.restore();
  cut(rect(-8, 18, 16, 104), C.cream, { sh: .3, grain: 0 });
  for (const sx of [-1, 1]) for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) cut(circle(sx * (36 + c * 22), 58 + r * 24, 5.5), C.plumDeep, { sh: 0, grain: 0 }); // the breaths
  for (let i = 0; i < 8; i++) cut(circle(-98 + i * 28, 25, 4), C.plumDeep, { sh: 0, grain: 0 });
  g.restore();
  for (const sx of [-1, 1]) cut(circle(sx * 110, hy, 9), C.gold, { sh: .4, grain: 0 }); // the hinges
  g.restore();
}
function bowler(s) {
  g.save(); g.scale(s, s);
  cut(ellipse(0, 0, 112, 24), C.plumDeep, { sh: .8 });
  g.save(); g.lineWidth = 6; g.strokeStyle = C.cream; g.globalAlpha *= .85; g.beginPath(); g.ellipse(0, 0, 110, 22, 0, .1, Math.PI - .1); g.stroke(); g.restore();
  const c = new Path2D(); c.moveTo(-70, -4); c.bezierCurveTo(-74, -120, 74, -120, 70, -4); c.closePath(); cut(c, C.plumDeep, { sh: .8, lift: .2 });
  cut(rect(-71, -30, 142, 22), C.gold, { sh: .2 });
  g.save(); g.globalAlpha *= .5; g.strokeStyle = C.plumLight; g.lineWidth = 5; g.beginPath(); g.arc(-10, -40, 52, -2.6, -1.6); g.stroke(); g.restore();
  g.restore();
}
function cane(len) {
  cut(rect(-7, 0, 14, len), C.goldDeep, { sh: .7 });
  const j = new Path2D(); j.arc(-34, 0, 34, 0, Math.PI, true); j.arc(-34, 0, 20, Math.PI, 0, false); j.closePath(); cut(j, C.goldDeep, { sh: .6 }); // the crook
  cut(rect(-9, len - 14, 18, 14), C.gold, { sh: .3 });
}

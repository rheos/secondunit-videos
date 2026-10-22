// Draft 14 crowd, group c: characters from Bob's other videos, redrawn in this film's glass (see crowd-base.js for the
// contract). Bob on draft 13: "Could be other characters too from other videos if you run out of people." Each one
// keeps the features a fan knows it by (the plane's windscreen and tail, the gorilla's banana, the traveller's rain
// cloud). Out by rule: little Bob, any real person's likeness (Giulietta Masina, the people All The Trees names),
// politicians, brands and mascots. Seeds 40000-49999. Helpers are prefixed cc.

const CC = {
  ink: [43, 36, 32], skin: [243, 207, 168], skin2: [201, 141, 100], white: [240, 236, 226], black: [40, 38, 46],
  cream: [246, 232, 196], red: [206, 52, 50], mint: [118, 196, 178], teal: [46, 156, 147], pink: [236, 140, 170],
  windscreen: [128, 196, 226], tyre: [44, 42, 48],
  fur: [66, 60, 66], fur2: [104, 98, 108], mask: [186, 160, 140], mask2: [214, 196, 178],
  banana: [246, 206, 52],
};
function ccV(arr, v) { return arr[((v | 0) % arr.length + arr.length) % arr.length]; }
function ccCheeks(g, x, y, r, a = .32) { g.fillStyle = `rgba(232,120,120,${a})`; for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * x, y, r, 0, TAU); g.fill(); } }
function ccBrow(g, x, y, w, lift, sd, lw = 4) { paint(g, lw, .85); g.beginPath(); g.moveTo(x - w * sd * .5, y + 3); g.quadraticCurveTo(x, y - 7 - lift, x + w * sd * .5, y + 1); g.stroke(); }
function ccBody(g, col, seed, o = {}) { // shoulders from the neck at y +60 to y +430, 444 wide at the bottom
  const w0 = o.w0 || 60, w1 = o.w1 || 185, w2 = o.w2 || 222, y0 = o.y0 || 66;
  const p = polyPath([[-w0, y0], [-w1, y0 + 58], [-w2, 430], [w2, 430], [w1, y0 + 58], [w0, y0]]);
  pane(g, p, col, seed, { ew: 34, shade: .34, lw: 8 }); return p;
}
function ccNeck(g, col, seed, w = 17) { pane(g, polyPath([[-w, 46], [-w, 84], [w, 84], [w, 46]]), col, seed, { ew: 8, shade: .3, lw: 4 }); }
function ccRRect(x, y, w, h, r) { // a rounded rectangle path, (x, y) its top left
  const p = new Path2D(); p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r);
  p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath(); return p;
}
function ccAnimalMouth(g, x, y, w, jaw, tongue = true) { // a dark open jaw with a tongue, outlined
  const p = ellPath(x, y + jaw / 2, w, jaw / 2 + 4);
  g.fillStyle = rgb(CH.mouth, .96); g.fill(p);
  if (tongue) { g.save(); g.clip(p); g.fillStyle = rgb(CH.tongue); g.beginPath(); g.ellipse(x, y + jaw + 2, w * .6, 4 + jaw * .3, 0, 0, TAU); g.fill(); g.restore(); }
  paint(g, 3, .85); g.stroke(p);
}

// ---- 1. air_plane (Airplane on the Highway, kawaii world): the cream plane that never flies, nose and face to us ----
// Its blue windscreen strip over the eyes, rosy cheeks, the red stripe, the teal tail fin with a heart, propellers
// turning on the wings. Its "body" is the fuselage going down with its portholes, and the wheels it drives on.
CROWD_DRAW.air_plane = (g, m, t, v) => {
  const stripe = ccV([CC.red, [52, 96, 196], [232, 150, 40]], v), fin = ccV([CC.teal, [222, 110, 150], [96, 150, 70]], v);
  // the tail fin, rising behind the cabin roof, with its heart
  pane(g, smoothPath([[-30, -60], [-18, -120], [8, -180], [40, -192], [54, -170], [40, -110], [34, -60]]), fin, 40001, { ew: 14, shade: .26, lw: 6 });
  pane(g, polyPath(heartPts(28, -150, 26, 24)), CC.pink, 40002, { ew: 5, shade: .15, lw: 3 });
  // the fuselage below the face: cream, the red stripe carried down its side, portholes, the wheels
  const fus = polyPath([[-92, 60], [-150, 140], [-200, 430], [200, 430], [150, 140], [92, 60]]);
  pane(g, fus, CC.cream, 40020, { ew: 34, shade: .3, lw: 8 });
  g.save(); g.clip(fus); pane(g, polyPath([[-240, 236], [240, 236], [240, 266], [-240, 266]]), stripe, 40021, { ew: 6, shade: .2, lw: 5 }); g.restore();
  for (let k = -2; k <= 2; k++) pane(g, circPath(k * 62, 196, 15), CC.windscreen, 40022 + k + 2, { ew: 6, shade: .2, lw: 5 });
  for (const sd of [-1, 1]) {
    pane(g, polyPath([[sd * 60, 300], [sd * 74, 300], [sd * 82, 360], [sd * 68, 360]]), [150, 150, 160], 40028 + sd, { ew: 4, shade: .2, lw: 4 });
    pane(g, ccRRect(sd * 84 - 30, 340, 60, 80, 22), CC.tyre, 40031 + sd, { ew: 12, shade: .2, lw: 6 });
    pane(g, circPath(sd * 84, 380, 12), [150, 150, 160], 40034 + sd, { ew: 4, shade: .2, lw: 4 });
  }
  // the wings, out to both sides, mint at the tips
  for (const sd of [-1, 1]) {
    pane(g, polyPath([[sd * 60, 30], [sd * 226, 52], [sd * 226, 92], [sd * 60, 100]]), CC.cream, 40003 + sd, { ew: 14, shade: .26, lw: 6 });
    pane(g, polyPath([[sd * 226, 48], [sd * 226, 52], [sd * 226, 92], [sd * 226, 94]]), CC.mint, 40006 + sd, { ew: 6, shade: .2, lw: 5 });
    // the engine, its red spinner and a turning two-blade propeller (draft 14: no spin disc, it read as a smudge over the faces behind)
    const ex = sd * 150, ey = 72;
    pane(g, ellPath(ex, ey, 30, 30), CC.cream, 40009 + sd, { ew: 10, shade: .3, lw: 6 });
    const a = t * 9 * sd + sd;
    for (const k of [0, 1]) { const b = a + k * Math.PI; pane(g, ellPath(ex + Math.cos(b) * 32, ey + Math.sin(b) * 32, 30, 8, b), [150, 112, 84], 40012 + k + (sd + 1), { ew: 4, shade: .2, lw: 4 }); }
    pane(g, circPath(ex, ey, 13), CC.red, 40017 + sd, { ew: 5, shade: .25, lw: 4 });
  }
  // the cabin nose: a rounded square face, the windscreen strip, the stripe under the mouth
  const face = ccRRect(-86, -82, 172, 160, 52);
  pane(g, face, CC.cream, 40037, { ew: 26, shade: .24, lw: 7 });
  g.save(); g.clip(face);
  pane(g, ccRRect(-60, -76, 120, 30, 15), CC.windscreen, 40038, { ew: 8, shade: .18, lw: 5 });
  g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(-46, -70, 26, 7);
  pane(g, polyPath([[-100, 50], [100, 50], [100, 66], [-100, 66]]), stripe, 40039, { ew: 6, shade: .2, lw: 5 });
  g.restore();
  ccCheeks(g, 54, 12, 14, .42);
  for (const sd of [-1, 1]) { chEye(g, sd * 34, -14, 11, [0, -.1]); ccBrow(g, sd * 34, -36 - 5 * m, 20, 2, sd, 3.4); }
  chHumanMouth(g, 16, 15, m);
};
CROWD_META.air_plane = { group: 'c', film: 'Airplane on the Highway', who: 'the kawaii airplane that never flies' };

// ---- 2. rt_gorilla (Real Thing): the gorilla, charcoal fur with a peaked crown, the pale heart-shaped face mask, a
// round muzzle with two nostrils, the pale belly, and his banana held up. v 1 is his sweetheart: greyer fur and the
// pink flower behind her ear.
CROWD_DRAW.rt_gorilla = (g, m, t, v) => {
  const girl = (v | 0) % 2 === 1, fur = girl ? [118, 110, 118] : CC.fur, fur2 = girl ? [146, 138, 146] : CC.fur2;
  // the body: broad furry shoulders, the belly patch
  pane(g, smoothPath([[-70, 50], [-150, 70], [-210, 150], [-226, 430], [226, 430], [210, 150], [150, 70], [70, 50]]), fur, 40101, { ew: 36, shade: .32, lw: 8 });
  pane(g, ellPath(0, 330, 120, 140), CC.mask, 40102, { ew: 26, shade: .24, lw: 7 });
  paint(g, 3, .35); for (const [x, y] of [[-150, 180], [-120, 240], [150, 200], [130, 270], [-170, 320], [170, 340]]) { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 8, y + 12, x + 4, y + 24); g.stroke(); }
  // his right arm up beside his head, the banana in his fist
  pane(g, smoothPath(limbPts([[140, 150], [160, 40], [146, -60]], [76, 64, 58])), fur, 40103, { ew: 20, shade: .3, lw: 7 });
  pane(g, smoothPath([[84, -128], [114, -146], [178, -142], [200, -126], [186, -118], [116, -122], [92, -112]]), CC.banana, 40104, { ew: 8, shade: .22, lw: 5 });
  pane(g, polyPath([[196, -130], [208, -134], [208, -124], [198, -122]]), [104, 72, 40], 40105, { ew: 3, shade: .1, lw: 3 });
  glassHand(g, 146, -74, -Math.PI / 2, 1.5, fur, 40106, { pose: 'grip', side: 1, lw: 4 }); // the fist round the banana, fingers showing (draft 15)
  // the head: a dome with a peak on the crown, little ears
  for (const sd of [-1, 1]) pane(g, ellPath(sd * 80, 4, 16, 20), fur2, 40107 + sd, { ew: 8, shade: .3, lw: 5 });
  pane(g, smoothPath([[0, -122], [36, -108], [74, -66], [86, -10], [80, 44], [52, 76], [0, 86], [-52, 76], [-80, 44], [-86, -10], [-74, -66], [-36, -108]]), fur, 40110, { ew: 26, shade: .3, lw: 7 });
  if (girl) { // the pink flower behind her ear
    for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; pane(g, ellPath(-78 + Math.cos(a) * 15, -54 + Math.sin(a) * 15, 13, 9, a), CC.pink, 40111 + k, { ew: 4, shade: .2, lw: 3 }); }
    pane(g, circPath(-78, -54, 8), CC.banana, 40116, { ew: 3, shade: .2, lw: 3 });
  }
  // the face mask: two brow lobes, wide cheeks, a round chin
  const mask = smoothPath([[0, -52], [24, -66], [56, -56], [64, -20], [58, 30], [36, 66], [0, 76], [-36, 66], [-58, 30], [-64, -20], [-56, -56], [-24, -66]]);
  pane(g, mask, CC.mask, 40117, { ew: 18, shade: .22, lw: 6 });
  for (const sd of [-1, 1]) {
    chEye(g, sd * 26, -26, 9, [0, -.2]);
    paint(g, 4.2, .85); g.beginPath(); g.moveTo(sd * 8, -40 - 5 * m); g.quadraticCurveTo(sd * 26, -52 - 6 * m, sd * 46, -42); g.stroke();
  }
  // the muzzle: a paler oval, two nostrils, the open singing mouth under them
  pane(g, ellPath(0, 22, 40, 28), CC.mask2, 40118, { ew: 10, shade: .18, lw: 5 });
  g.fillStyle = 'rgba(40,24,20,.9)'; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * 10, 12, 6, 4, sd * .3, 0, TAU); g.fill(); }
  ccAnimalMouth(g, 0, 32, 20 + 6 * m, 4 + 28 * m);
  if (girl) ccCheeks(g, 44, 26, 10, .35);
};
CROWD_META.rt_gorilla = { group: 'c', film: 'Real Thing', who: 'the gorilla with his banana (v 1: his sweetheart with the pink flower)' };

// ---- 3 and 4. 10,000 Miles: the Playmobil-manner cast. A big round head on a neck peg, a trapezoid torso with a belt,
// mitt hands, glossy plastic colour. mi_person has the snap-on hair whose hairline is one smooth arc (never steps);
// mi_boy is one of the gang of boys in a cap with its peak forward, his jacket and cap colours from the film's lists.
function ccPlaymo(g, m, o) {
  const { top, seed } = o;
  // the torso: narrow at the shoulders, wider at the belt, the arms down its sides with mitt hands
  for (const sd of [-1, 1]) {
    pane(g, smoothPath(limbPts([[sd * 118, 112], [sd * 168, 260], [sd * 182, 360]], [70, 66, 62])), mix(top, [0, 0, 0], .08), seed + 1 + sd, { ew: 18, shade: .28, lw: 7 });
    pane(g, ellPath(sd * 184, 392, 34, 38), CC.skin, seed + 4 + sd, { ew: 10, shade: .25, lw: 6 });
  }
  const torso = smoothPath([[-70, 76], [70, 76], [128, 100], [150, 430], [-150, 430], [-128, 100]]);
  pane(g, torso, top, seed + 7, { ew: 30, shade: .28, lw: 8 });
  pane(g, polyPath([[-146, 370], [146, 370], [148, 402], [-148, 402]]), [43, 42, 58], seed + 8, { ew: 6, shade: .2, lw: 5 });
  pane(g, ccRRect(-20, 372, 40, 28, 5), [210, 180, 90], seed + 9, { ew: 4, shade: .2, lw: 4 });
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 148, 400], [sd * 222, 400], [sd * 222, 430], [sd * 152, 430]]), [58, 110, 208], seed + 10 + sd, { ew: 6, shade: .25, lw: 5 }); // the legs' tops, wide enough to hide the row behind
  if (o.collar) for (const sd of [-1, 1]) pane(g, polyPath([[0, 84], [sd * 64, 78], [sd * 50, 124]]), mix(top, [255, 255, 255], .2), seed + 13 + sd, { ew: 6, shade: .2, lw: 5 });
  pane(g, ccRRect(-24, 46, 48, 38, 6), CC.skin, seed + 16, { ew: 8, shade: .3, lw: 5 }); // the neck peg
  // the head: round, a plastic sheen
  const sk = o.skin || CC.skin;
  pane(g, ellPath(0, 0, 62, 66), sk, seed + 17, { ew: 22, shade: .2, lw: 7 });
  g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(-26, -30, 16, 9, -.5, 0, TAU); g.fill();
  for (const sd of [-1, 1]) {
    chEye(g, sd * 22, -2, 7, [0, -.2]);
    paint(g, 3.6, .85); g.beginPath(); g.moveTo(sd * 12, -20 - 4 * m); g.quadraticCurveTo(sd * 22, -25 - 5 * m, sd * 32, -20); g.stroke();
  }
  chHumanMouth(g, 26, 14, m);
}
CROWD_DRAW.mi_person = (g, m, t, v) => {
  const top = ccV([CC.teal, [232, 100, 90], [224, 160, 32]], v), hair = ccV([[122, 74, 42], [43, 42, 58], [196, 136, 60]], v);
  ccPlaymo(g, m, { top, seed: 40201, collar: true });
  // the snap-on hair: a helmet over the crown down past the ears, the hairline one smooth arc over the forehead
  const hp = new Path2D();
  hp.moveTo(-70, 30); hp.bezierCurveTo(-82, -40, -60, -86, 0, -88); hp.bezierCurveTo(60, -86, 82, -40, 70, 30);
  hp.lineTo(56, 30); hp.lineTo(54, -16); hp.bezierCurveTo(40, -42, -40, -42, -54, -16); hp.lineTo(-56, 30); hp.closePath();
  pane(g, hp, hair, 40230, { ew: 16, shade: .26, lw: 7 });
  g.fillStyle = 'rgba(255,255,255,.28)'; g.beginPath(); g.ellipse(-24, -66, 22, 8, -.3, 0, TAU); g.fill();
};
CROWD_META.mi_person = { group: 'c', film: '10,000 Miles', who: 'the Playmobil-manner person with the snap-on hair' };

CROWD_DRAW.mi_boy = (g, m, t, v) => {
  const cap = ccV([[212, 85, 59], [47, 95, 179], [79, 138, 90]], v), jak = ccV([[43, 42, 58], [224, 160, 32], [192, 57, 43]], v);
  ccPlaymo(g, m, { top: jak, seed: 40241, collar: true, skin: (v | 0) % 2 ? [201, 141, 100] : CC.skin });
  // the cap: a round crown, a button, the peak forward over the brow
  g.save(); g.translate(0, -12);
  const crown = new Path2D(); crown.moveTo(-68, -26); crown.bezierCurveTo(-74, -108, 74, -108, 68, -26); crown.closePath();
  pane(g, crown, cap, 40270, { ew: 18, shade: .26, lw: 7 });
  paint(g, 2.6, .4); for (const x of [-30, 30]) { g.beginPath(); g.moveTo(0, -84); g.quadraticCurveTo(x, -70, x * 1.5, -26); g.stroke(); }
  pane(g, circPath(0, -94, 8), cap, 40271, { ew: 4, shade: .2, lw: 4 });
  pane(g, smoothPath([[-66, -30], [0, -40], [66, -30], [62, -12], [0, -2], [-62, -12]]), mix(cap, [0, 0, 0], .18), 40272, { ew: 8, shade: .24, lw: 6 });
  g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(-26, -64, 18, 7, -.3, 0, TAU); g.fill();
  g.restore();
};
CROWD_META.mi_boy = { group: 'c', film: '10,000 Miles', who: 'one of the gang of boys, in a cap' };

// ---- 5. rp_diva (The Reform Party at Burning Man): the horse-headed singer in the long blue gown with the gold
// belt, her mane a run of flames, the silver microphone up at her lips. Invented; a Dali double image, no one real.
CROWD_DRAW.rp_diva = (g, m, t, v) => {
  const gown = ccV([[40, 72, 176], [120, 36, 120], [26, 120, 96]], v), coat = ccV([[150, 84, 46], [92, 60, 40], [170, 120, 80]], v);
  // the gown: high shoulders, the gold belt low on the glass
  const body = ccBody(g, gown, 40301, { w0: 54, w1: 176, w2: 220 });
  g.save(); g.clip(body); paint(g, 10, .22); for (const x of [-120, -40, 50, 130]) { g.beginPath(); g.moveTo(x * .5, 150); g.quadraticCurveTo(x, 300, x * 1.2, 430); g.stroke(); } g.restore();
  pane(g, polyPath([[-206, 352], [206, 352], [210, 384], [-210, 384]]), [236, 182, 40], 40302, { ew: 6, shade: .2, lw: 5 });
  pane(g, polyPath([[-40, 64], [40, 64], [30, 104], [-30, 104]]), mix(gown, [0, 0, 0], .2), 40303, { ew: 6, shade: .2, lw: 5 }); // the high collar
  // the flames of her mane, up the back of her head and down her neck
  const fl = (x, y, h, w, sd, seed, col) => pane(g, smoothPath([[x - w, y], [x - w * .6, y - h * .5], [x + sd * w * .3, y - h], [x + w * .2, y - h * .6], [x + w, y]]), col, seed, { ew: 8, shade: .18, lw: 5 });
  for (let k = 0; k < 7; k++) fl(-72 + k * 24, -40 + Math.abs(k - 3) * 6, 104 + 16 * Math.sin(t * 7 + k) - Math.abs(k - 3) * 10, 22, k % 2 ? 1 : -1, 40304 + k, [236, 110, 30]);
  for (let k = 0; k < 5; k++) fl(-48 + k * 24, -48 + Math.abs(k - 2) * 6, 70 + 10 * Math.sin(t * 9 + k) - Math.abs(k - 2) * 8, 13, k % 2 ? -1 : 1, 40311 + k, [252, 200, 56]);
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 22, -66], [sd * 40, -124], [sd * 54, -60]]), coat, 40315 + sd, { ew: 8, shade: .3, lw: 5 }); // ears
  // the long horse face, wide at the eyes, a soft muzzle at the bottom
  pane(g, smoothPath([[-56, -64], [56, -64], [52, 6], [40, 50], [42, 92], [0, 108], [-42, 92], [-40, 50], [-52, 6]]), coat, 40318, { ew: 24, shade: .26, lw: 7 });
  pane(g, smoothPath([[-12, -60], [12, -60], [8, 30], [-8, 30]]), [244, 238, 228], 40319, { ew: 5, shade: .12, lw: 4 }); // a blaze
  for (const sd of [-1, 1]) { chEye(g, sd * 34, -26, 9, [0, -.2]); chLid(g, sd * 34, -26, 9, .3, coat); paint(g, 2.6, .8); for (const k of [-1, 0, 1]) { g.beginPath(); g.moveTo(sd * (34 + k * 7), -36); g.lineTo(sd * (36 + k * 9), -44); g.stroke(); } } // lashes
  pane(g, smoothPath([[-44, 56], [44, 56], [46, 90], [0, 102], [-46, 90]]), [96, 66, 58], 40320, { ew: 12, shade: .24, lw: 6 });
  for (const sd of [-1, 1]) { g.fillStyle = 'rgba(20,12,10,.9)'; g.beginPath(); g.ellipse(sd * 20, 74, 6, 9, sd * .3, 0, TAU); g.fill(); }
  ccAnimalMouth(g, 0, 98, 26, 4 + 26 * m);
  // her gloved hand and the microphone, held up by her mouth
  pane(g, smoothPath(limbPts([[100, 250], [84, 206], [70, 166]], [46, 42, 38])), gown, 40321, { ew: 12, shade: .3, lw: 6 });
  pane(g, polyPath([[52, 100], [66, 100], [70, 176], [56, 176]]), [36, 34, 40], 40322, { ew: 4, shade: .1, lw: 4 });
  pane(g, circPath(58, 92, 19), [200, 204, 212], 40323, { ew: 6, shade: .25, lw: 5 });
  paint(g, 1.6, .5); for (const k of [-1, 0, 1]) { g.beginPath(); g.moveTo(44, 92 + k * 7); g.lineTo(72, 92 + k * 7); g.stroke(); }
  glassHand(g, 92, 150, Math.PI, 1.1, [236, 182, 40], 40324, { pose: 'grip', side: 1 }); // the glove round the handle, fingers showing (draft 15)
};
CROWD_META.rp_diva = { group: 'c', film: 'The Reform Party at Burning Man', who: 'the horse-headed singer with the flaming mane and the microphone' };

// ---- 6. rp_lamp (The Reform Party at Burning Man): a Lamplighter, hooded in a pale robe with a coloured sash, a
// lantern hung from the pole on his shoulder. The ritual's own people, not the party's.
CROWD_DRAW.rp_lamp = (g, m, t, v) => {
  const robe = ccV([[232, 220, 196], [222, 196, 150], [236, 228, 214]], v), sash = ccV([[46, 140, 120], [196, 70, 50], [90, 70, 160]], v);
  const body = ccBody(g, robe, 40401, { w0: 80, w1: 190, w2: 226 });
  g.save(); g.clip(body);
  pane(g, polyPath([[-200, 100], [-140, 90], [200, 400], [200, 460], [140, 460]]), sash, 40402, { ew: 8, shade: .22, lw: 6 });
  paint(g, 10, .18); for (const x of [-130, -50, 60]) { g.beginPath(); g.moveTo(x * .5, 160); g.quadraticCurveTo(x, 300, x * 1.2, 430); g.stroke(); }
  g.restore();
  // the hood, a soft point, its dark opening
  pane(g, smoothPath([[0, -136], [50, -110], [86, -50], [92, 20], [80, 80], [0, 96], [-80, 80], [-92, 20], [-86, -50], [-50, -110]]), mix(robe, [0, 0, 0], .08), 40403, { ew: 26, shade: .32, lw: 7 });
  pane(g, ellPath(0, 4, 68, 84), [70, 56, 46], 40404, { ew: 10, shade: .2, lw: 6 });
  // his face in the hood
  pane(g, ellPath(0, 8, 54, 66), CC.skin, 40405, { ew: 20, shade: .24, lw: 6 });
  g.save(); g.clip(ellPath(0, 8, 54, 66)); g.fillStyle = 'rgba(40,24,20,.28)'; g.fillRect(-60, -60, 120, 20); g.restore();
  ccCheeks(g, 32, 26, 11, .36);
  for (const sd of [-1, 1]) { chEye(g, sd * 21, -2, 8, [0, -.3]); ccBrow(g, sd * 21, -22 - 5 * m, 22, 2, sd, 3.8); }
  paint(g, 3, .7); g.beginPath(); g.moveTo(-2, 0); g.quadraticCurveTo(-6, 16, -8, 20); g.quadraticCurveTo(0, 25, 8, 20); g.stroke();
  chHumanMouth(g, 34, 16, m);
  // the pole over his left shoulder, its lantern swinging a little: brass frame, lit glass, a ring on top
  const sw = .08 * Math.sin(t * 2.2);
  pane(g, polyPath([[-150, 160], [-138, 152], [-56, -150], [-68, -154]]), [132, 92, 52], 40406, { ew: 4, shade: .2, lw: 4 });
  g.save(); g.translate(-64, -146); g.rotate(sw);
  paint(g, 3, .9); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 22); g.stroke();
  pane(g, polyPath([[-26, 30], [26, 30], [20, 22], [-20, 22]]), [210, 160, 60], 40407, { ew: 4, shade: .2, lw: 4 });
  pane(g, polyPath([[-22, 30], [22, 30], [18, 86], [-18, 86]]), [252, 214, 96], 40408, { ew: 10, shade: .15, lw: 5 });
  g.fillStyle = 'rgba(255,250,210,.9)'; g.beginPath(); g.ellipse(0, 60, 6, 11, 0, 0, TAU); g.fill();
  paint(g, 3, .8); g.beginPath(); g.moveTo(0, 30); g.lineTo(0, 86); g.stroke();
  pane(g, polyPath([[-26, 86], [26, 86], [20, 96], [-20, 96]]), [210, 160, 60], 40409, { ew: 4, shade: .2, lw: 4 });
  g.restore();
  // his hand round the pole
  glassHand(g, -98, 84, Math.PI + .45, 1.15, CC.skin, 40410, { pose: 'grip', side: -1 }); // draft 15: fingers round the pole (cleese.js)
};
CROWD_META.rp_lamp = { group: 'c', film: 'The Reform Party at Burning Man', who: 'a Lamplighter with his lantern pole' };

// ---- 7. ihd_her (In Her Dream, cut paper): the dreaming woman, her family's navy paper for her hair and dress, her
// hair up in a bun with the pink flower, the dream showing in it (little clouds and a crescent moon), and the orange
// resting on her cheek, not eaten. Sleepy lids even as she sings.
CROWD_DRAW.ihd_her = (g, m, t, v) => {
  const navy = [40, 46, 96], dress = ccV([navy, [96, 52, 88], [40, 96, 100]], v), flower = ccV([CC.pink, [250, 200, 80], [236, 110, 110]], v);
  const body = ccBody(g, dress, 40501, { w0: 50, w1: 170, w2: 214 });
  g.save(); g.clip(body); g.lineWidth = 5; g.strokeStyle = 'rgba(232,226,240,.55)'; // the lace edge at her neckline
  for (let k = -5; k <= 5; k++) { g.beginPath(); g.arc(k * 22, 120 - Math.abs(k) * 4, 9, 0, Math.PI); g.stroke(); }
  g.restore();
  pane(g, smoothPath([[-90, 76], [0, 128], [90, 76], [60, 70], [0, 108], [-60, 70]]), mix(dress, [255, 255, 255], .2), 40502, { ew: 6, shade: .2, lw: 5 });
  ccNeck(g, CC.skin, 40503, 16);
  // her hair: navy, full at the sides, the bun on top
  pane(g, circPath(14, -104, 46), navy, 40504, { ew: 16, shade: .3, lw: 7 });
  pane(g, smoothPath([[0, -84], [50, -76], [76, -30], [80, 30], [64, 70], [-64, 70], [-80, 30], [-76, -30], [-50, -76]]), navy, 40505, { ew: 22, shade: .3, lw: 7 });
  // the dream in her hair: two little clouds and a crescent moon
  for (const [x, y, s, sd] of [[-40, -52, 1, 40506], [30, -112, .8, 40507]]) pane(g, smoothPath([[x - 22 * s, y + 6 * s], [x - 16 * s, y - 8 * s], [x - 4 * s, y - 12 * s], [x + 6 * s, y - 16 * s], [x + 20 * s, y - 6 * s], [x + 22 * s, y + 6 * s]]), [244, 240, 228], sd, { ew: 5, shade: .12, lw: 4 });
  { const p = new Path2D(); p.arc(48, -58, 12, 0, TAU); p.arc(53, -62, 10, 0, TAU, true); g.fillStyle = rgb([246, 210, 90]); g.fill(p, 'evenodd'); }
  g.fillStyle = 'rgba(250,240,200,.9)'; for (const [x, y] of [[-12, -70], [8, -134], [58, -96]]) { g.beginPath(); g.arc(x, y, 2.6, 0, TAU); g.fill(); }
  // the flower in her hair, by the bun
  for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; pane(g, ellPath(-34 + Math.cos(a) * 14, -100 + Math.sin(a) * 14, 12, 8, a), flower, 40508 + k, { ew: 4, shade: .2, lw: 3 }); }
  pane(g, circPath(-34, -100, 7), [246, 210, 90], 40513, { ew: 3, shade: .2, lw: 3 });
  // her face
  const face = smoothPath([[0, -60], [40, -54], [52, -18], [50, 20], [36, 54], [0, 70], [-36, 54], [-50, 20], [-52, -18], [-40, -54]]);
  pane(g, face, [240, 210, 192], 40514, { ew: 20, shade: .22, lw: 6 });
  pane(g, smoothPath([[-48, -30], [-20, -58], [20, -60], [48, -30], [30, -44], [0, -46], [-30, -44]]), navy, 40515, { ew: 8, shade: .26, lw: 5 }); // hair across her brow
  ccCheeks(g, 30, 22, 11, .34);
  for (const sd of [-1, 1]) { chEye(g, sd * 21, -8, 8, [0, .1]); chLid(g, sd * 21, -8, 8, .32 - .2 * m, [240, 210, 192]); ccBrow(g, sd * 21, -26 - 5 * m, 22, 3, sd, 3.4); }
  paint(g, 3, .65); g.beginPath(); g.moveTo(0, -2); g.quadraticCurveTo(-4, 12, -6, 18); g.quadraticCurveTo(0, 22, 6, 18); g.stroke();
  chHumanMouth(g, 32, 15, m);
  // the orange on her cheek, its leaf
  pane(g, circPath(-56, 30, 30), [232, 116, 59], 40516, { ew: 12, shade: .26, lw: 6 });
  g.fillStyle = 'rgba(160,60,20,.4)'; for (const [x, y] of [[-64, 22], [-48, 36], [-60, 42], [-44, 20]]) { g.beginPath(); g.arc(x, y, 2, 0, TAU); g.fill(); }
  pane(g, ellPath(-48, -2, 13, 6, -.4), [95, 143, 90], 40517, { ew: 4, shade: .2, lw: 3 });
};
CROWD_META.ihd_her = { group: 'c', film: 'In Her Dream', who: 'the dreaming woman with the orange on her cheek' };

// ---- 8. ta_traveller (Travel Agent): the traveller in his brown fedora and long teal coat, a stick-thin neck, and
// the little rain cloud that follows him everywhere, raining on his hat.
CROWD_DRAW.ta_traveller = (g, m, t, v) => {
  const coat = ccV([[52, 128, 120], [150, 90, 50], [70, 90, 140]], v), hat = ccV([[118, 78, 48], [60, 56, 60], [140, 112, 70]], v);
  const body = ccBody(g, coat, 40601, { w0: 52, w1: 176, w2: 214 });
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 14, 70], [sd * 74, 74], [sd * 92, 140], [sd * 40, 230], [sd * 6, 120]]), mix(coat, [0, 0, 0], .14), 40602 + sd, { ew: 8, shade: .25, lw: 5 }); // lapels
  pane(g, polyPath([[-14, 70], [14, 70], [6, 130], [-6, 130]]), [226, 222, 206], 40605, { ew: 4, shade: .15, lw: 4 });
  for (let k = 0; k < 3; k++) pane(g, circPath(0, 260 + k * 52, 10), [60, 44, 34], 40606 + k, { ew: 4, shade: .2, lw: 4 });
  pane(g, polyPath([[-12, 44], [-12, 78], [12, 78], [12, 44]]), [234, 210, 180], 40610, { ew: 6, shade: .3, lw: 4 });
  // the face: long, pale, a hint of stubble on the chin
  const face = smoothPath([[0, -56], [42, -48], [50, -10], [46, 30], [30, 60], [0, 70], [-30, 60], [-46, 30], [-50, -10], [-42, -48]]);
  pane(g, face, [234, 210, 180], 40611, { ew: 20, shade: .24, lw: 6 });
  for (const sd of [-1, 1]) pane(g, ellPath(sd * 50, 4, 10, 16), [234, 210, 180], 40612 + sd, { ew: 6, shade: .3, lw: 4 });
  for (const sd of [-1, 1]) { chEye(g, sd * 20, -8, 8, [0, -.4]); ccBrow(g, sd * 20, -26 - 3 * m, 22, -2, sd, 4); } // brows a little worried
  paint(g, 3, .7); g.beginPath(); g.moveTo(-2, -6); g.quadraticCurveTo(-6, 14, -8, 18); g.quadraticCurveTo(0, 22, 8, 18); g.stroke();
  chHumanMouth(g, 32, 15, m);
  // the fedora: pinched crown, dark band, a wide brim
  pane(g, smoothPath([[-90, -34], [-50, -48], [50, -48], [90, -34], [50, -26], [-50, -26]]), hat, 40615, { ew: 8, shade: .26, lw: 6 });
  pane(g, smoothPath([[-50, -42], [-54, -84], [-30, -106], [0, -96], [30, -106], [54, -84], [50, -42]]), hat, 40616, { ew: 16, shade: .3, lw: 7 });
  pane(g, polyPath([[-52, -60], [52, -60], [51, -44], [-51, -44]]), [44, 34, 30], 40617, { ew: 4, shade: .1, lw: 4 });
  // the rain cloud over his hat, and its rain
  g.save(); g.beginPath(); g.rect(-60, -150, 120, 50); g.clip(); g.strokeStyle = 'rgba(110,160,220,.9)'; g.lineWidth = 3.5; g.lineCap = 'round';
  for (let k = 0; k < 7; k++) { const x = -48 + k * 16, y = -150 + ((t * 120 + k * 23) % 60); g.beginPath(); g.moveTo(x, y); g.lineTo(x - 2, y + 12); g.stroke(); }
  g.restore();
  pane(g, smoothPath([[-62, -150], [-54, -176], [-30, -186], [-12, -206], [16, -206], [34, -186], [58, -180], [66, -156], [40, -144], [-40, -144]]), [128, 132, 170], 40618, { ew: 14, shade: .26, lw: 6 });
  g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(-8, -190, 18, 7, 0, 0, TAU); g.fill();
};
CROWD_META.ta_traveller = { group: 'c', film: 'Travel Agent', who: 'the traveller in the fedora, with his own rain cloud' };

// ---- 9. lib_judge (Libelous, the fairy-tale court): the judge, in the long curled white wig, the red robe with its
// white bands at the throat, a monocle in one eye. A type from the story, not the real trial's judge.
CROWD_DRAW.lib_judge = (g, m, t, v) => {
  const robe = ccV([[190, 36, 40], [44, 40, 52], [120, 28, 60]], v);
  const body = ccBody(g, robe, 40701, { w0: 60, w1: 186, w2: 222 });
  g.save(); g.clip(body); pane(g, polyPath([[-26, 60], [26, 60], [30, 430], [-30, 430]]), [240, 236, 226], 40702, { ew: 8, shade: .18, lw: 6 }); g.restore(); // the fur front edge
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 2, 74], [sd * 18, 74], [sd * 22, 136], [sd * 4, 136]]), [250, 250, 244], 40703 + sd, { ew: 4, shade: .12, lw: 4 }); // the bands
  // the wig: rows of white curls from the crown down past his shoulders
  const curl = (x, y, r, seed) => { pane(g, circPath(x, y, r), [238, 236, 230], seed, { ew: 8, shade: .26, lw: 5 }); paint(g, 2.4, .45); g.beginPath(); g.arc(x, y, r * .5, .3, 4.6); g.stroke(); };
  let sd0 = 40706;
  for (const sd of [-1, 1]) for (let k = 0; k < 5; k++) for (const j of [0, 1]) curl(sd * (62 + j * 22 - k * 2), -10 + k * 34 + j * 14, 19, sd0++);
  for (let k = 0; k < 7; k++) { const a = Math.PI + (k + .5) / 7 * Math.PI; curl(Math.cos(a) * 64, -18 + Math.sin(a) * 74, 21, sd0++); }
  // his face
  const face = smoothPath([[0, -60], [42, -52], [52, -16], [48, 24], [32, 56], [0, 68], [-32, 56], [-48, 24], [-52, -16], [-42, -52]]);
  pane(g, face, [236, 200, 170], 40740, { ew: 20, shade: .24, lw: 6 });
  ccCheeks(g, 30, 22, 11, .36);
  for (const sd of [-1, 1]) { chEye(g, sd * 21, -8, 8, [0, -.2]); ccBrow(g, sd * 21, -28 - 6 * m, 24, 3, sd, 4.4); }
  // the monocle in his right eye, its ribbon
  g.lineWidth = 5; g.strokeStyle = rgb([210, 170, 60]); g.beginPath(); g.arc(21, -8, 14, 0, TAU); g.stroke(); lead(g, circPath(21, -8, 17), 3);
  g.strokeStyle = 'rgba(30,24,20,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(34, 0); g.quadraticCurveTo(46, 40, 40, 80); g.stroke();
  paint(g, 3, .7); g.beginPath(); g.moveTo(-2, -4); g.quadraticCurveTo(-7, 14, -9, 20); g.quadraticCurveTo(0, 25, 9, 20); g.stroke();
  chHumanMouth(g, 34, 16, m);
  // the top of the wig over his brow
  pane(g, smoothPath([[-52, -30], [-40, -66], [0, -80], [40, -66], [52, -30], [30, -50], [0, -56], [-30, -50]]), [238, 236, 230], 40741, { ew: 10, shade: .24, lw: 6 });
  paint(g, 2.4, .4); for (const x of [-30, -10, 10, 30]) { g.beginPath(); g.arc(x, -62, 7, .3, 3.6); g.stroke(); }
};
CROWD_META.lib_judge = { group: 'c', film: 'Libelous', who: 'the fairy-tale judge in the curled wig and monocle' };

// ---- 10. att_sol (All The Trees, the alchemical engraving): Sol, the figure whose head is the sun, rays all round
// and a face in the gold, in a long blue robe. v 1 is Luna, the silver moon-faced partner in the red robe.
CROWD_DRAW.att_sol = (g, m, t, v) => {
  const luna = (v | 0) % 2 === 1, disc = luna ? [190, 196, 214] : [236, 182, 40], ray = luna ? [150, 160, 190] : [246, 210, 80];
  const robe = luna ? [150, 40, 52] : [36, 62, 150], ink = luna ? [40, 44, 70] : [120, 70, 20];
  const body = ccBody(g, robe, 40801, { w0: 50, w1: 180, w2: 222 });
  g.save(); g.clip(body); paint(g, 10, .22); for (const x of [-150, -70, 20, 100, 170]) { g.beginPath(); g.moveTo(x * .4, 120); g.quadraticCurveTo(x * .9, 280, x * 1.15, 430); g.stroke(); } g.restore();
  pane(g, smoothPath([[-110, 90], [0, 150], [110, 90], [80, 76], [0, 112], [-80, 76]]), mix(robe, [255, 255, 255], .12), 40802, { ew: 8, shade: .26, lw: 6 }); // the cowl's drape
  // the rays (straight and wavy alternating), then the disc with its face
  if (!luna) for (let k = 0; k < 16; k++) {
    const a = k / 16 * TAU + .02 * Math.sin(t * 2), r0 = 66, r1 = k % 2 ? 104 : 120, w = k % 2 ? .1 : .14;
    pane(g, polyPath([[Math.cos(a - w) * r0, Math.sin(a - w) * r0], [Math.cos(a) * r1, Math.sin(a) * r1], [Math.cos(a + w) * r0, Math.sin(a + w) * r0]]), ray, 40803 + k, { ew: 6, shade: .18, lw: 5 });
  }
  if (luna) { // the moon: a silver halo of little stars instead of rays
    pane(g, circPath(0, 0, 92), [70, 74, 120], 40821, { ew: 16, shade: .3, lw: 6 });
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + .3; pane(g, chStar(Math.cos(a) * 82, Math.sin(a) * 82, 9), [236, 236, 246], 40822 + k, { ew: 3, shade: .1, lw: 3 }); }
  }
  pane(g, circPath(0, 0, 72), disc, 40820, { ew: 24, shade: .26, lw: 7 });
  g.strokeStyle = `rgba(${ink[0]},${ink[1]},${ink[2]},.35)`; g.lineWidth = 2; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(0, 0, 62 - k * 3, 0, TAU); g.stroke(); } // engraving rings round the rim
  ccCheeks(g, 34, 20, 13, luna ? .2 : .32);
  for (const sd of [-1, 1]) { chEye(g, sd * 24, -10, 9, [0, -.2]); ccBrow(g, sd * 24, -30 - 5 * m, 26, 2, sd, 4); }
  paint(g, 3.2, .75); g.beginPath(); g.moveTo(-2, -6); g.quadraticCurveTo(-7, 14, -10, 18); g.quadraticCurveTo(0, 24, 10, 18); g.stroke();
  chHumanMouth(g, 32, 17, m);
};
CROWD_META.att_sol = { group: 'c', film: 'All The Trees', who: 'Sol, the sun-headed figure (v 1: Luna, the moon-headed one)' };

// ---- 11. att_fox (All The Trees): the fox in the slashed Renaissance doublet with the white ruff, one of the
// engraving's animal-headed folk. Pointed ears, white cheeks, a black nose; the jaw drops to sing.
CROWD_DRAW.att_fox = (g, m, t, v) => {
  const dub = ccV([[50, 92, 70], [60, 70, 140], [130, 40, 50]], v), fox = [214, 110, 44];
  const body = ccBody(g, dub, 40901, { w0: 60, w1: 186, w2: 222 });
  g.save(); g.clip(body); // the slashes in the doublet, the buttons down its front
  for (const x of [-150, -110, 110, 150]) pane(g, ellPath(x, 260, 9, 60), [236, 210, 140], 40902 + (x + 150) / 10, { ew: 4, shade: .2, lw: 4 });
  g.restore();
  for (let k = 0; k < 5; k++) pane(g, circPath(0, 150 + k * 50, 9), [230, 190, 80], 40940 + k, { ew: 3, shade: .2, lw: 4 });
  // the ruff: a ring of white pleats under his chin
  const pts = []; for (let k = 0; k < 36; k++) { const a = k / 36 * TAU, r = k % 2 ? 84 : 100; pts.push([Math.cos(a) * r * 1.25, 84 + Math.sin(a) * r * .42]); }
  pane(g, polyPath(pts), [246, 244, 236], 40950, { ew: 14, shade: .24, lw: 6 });
  paint(g, 2.4, .4); for (let k = 0; k < 18; k++) { const a = k / 18 * TAU; g.beginPath(); g.moveTo(Math.cos(a) * 50, 84 + Math.sin(a) * 22); g.lineTo(Math.cos(a) * 112, 84 + Math.sin(a) * 40); g.stroke(); }
  // the ears, the head, the white cheeks
  for (const sd of [-1, 1]) {
    pane(g, polyPath([[sd * 22, -50], [sd * 70, -146], [sd * 76, -30]]), fox, 40951 + sd, { ew: 12, shade: .28, lw: 6 });
    pane(g, polyPath([[sd * 38, -52], [sd * 66, -116], [sd * 66, -46]]), [60, 36, 30], 40954 + sd, { ew: 4, shade: .1, lw: 4 });
  }
  pane(g, smoothPath([[0, -70], [50, -60], [74, -16], [70, 26], [40, 50], [0, 60], [-40, 50], [-70, 26], [-74, -16], [-50, -60]]), fox, 40957, { ew: 24, shade: .28, lw: 7 });
  for (const sd of [-1, 1]) pane(g, smoothPath([[sd * 8, 6], [sd * 40, -2], [sd * 76, 22], [sd * 52, 52], [sd * 10, 56]]), [246, 240, 228], 40958 + sd, { ew: 8, shade: .16, lw: 5 });
  for (const sd of [-1, 1]) { chEye(g, sd * 30, -20, 9, [0, -.1]); paint(g, 4, .85); g.beginPath(); g.moveTo(sd * 16, -38 - 5 * m); g.quadraticCurveTo(sd * 30, -44 - 6 * m, sd * 46, -34); g.stroke(); }
  ccAnimalMouth(g, 0, 36, 22 + 4 * m, 4 + 26 * m);
  pane(g, ellPath(0, 20, 15, 11), [30, 24, 26], 40961, { ew: 5, shade: .1, lw: 4 });
  g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.ellipse(-5, 16, 5, 3, 0, 0, TAU); g.fill();
};
CROWD_META.att_fox = { group: 'c', film: 'All The Trees', who: 'the fox in the doublet and ruff' };

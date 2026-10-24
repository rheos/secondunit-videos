// Figures for the last chapter, painted into the woodcut tone map in block-local units (see woodcut.js).
// Patterns are registered once per block and passed in as `pats` (a block may hold at most 15).
// The couple are stand-ins: a man and a woman in coats with leaflets, never portraits.

// ---------- a person standing: feet origin, k scale. o.woman, o.arm (0 down .. 1 raised high, right arm),
// o.arm2 (left arm), o.leaf (holds a leaflet in the right hand), o.leaf2, o.speak (0..1 mouth), o.step (walk phase)
// pats: coat, face, legs ----------
function ePerson(g, x, y, k, o, pats) {
  g.save(); g.translate(x, y); g.scale(k * (o.flip ? -1 : 1), k);
  const wo = !!o.woman, st = o.step || 0;
  // legs and shoes
  for (const s of [-1, 1]) {
    const lift = Math.max(0, Math.sin(st + (s > 0 ? Math.PI : 0))) * 10;
    g.save(); g.translate(0, -lift);
    pth(g, [[s * 13 - 9, -112], [s * 13 + 9, -112], [s * 13 + 8, -8], [s * 13 - 8, -8]]);
    fillWith(g, wo ? Cw(0) : WC.C(.42, pats.legs)); ink(g, 2.5);
    ell(g, s * 13 + 3, -4, 14, 7); fillWith(g, Cw(0));
    g.restore();
  }
  // coat: dark, cut folds; the woman's is longer and belted
  const hem = wo ? -66 : -100;
  g.beginPath(); g.moveTo(-40, -204); g.quadraticCurveTo(-50, -150, -48, hem); g.lineTo(48, hem); g.quadraticCurveTo(50, -150, 40, -204); g.closePath();
  fillWith(g, WC.LG(g, -48, 0, 48, 0, [[0, .34], [.4, .1], [1, .04]], pats.coat)); ink(g, 3);
  gouge(g, -20, -190, -26, hem + 8, 2.4, 1, 3); gouge(g, 22, -186, 26, hem + 10, 2, 1, -3);
  line(g, 0, -196, 0, hem); cutl(g, 2.2);
  for (const by of [-176, -150, -124]) { ell(g, -7, by, 3.2, 3.2); fillWith(g, Cw(1)); }
  if (wo) { g.beginPath(); g.rect(-47, -122, 94, 10); fillWith(g, Cw(1)); ink(g, 2); g.beginPath(); g.rect(-7, -124, 14, 14); ink(g, 2.5); }
  // collar (man) / scarf (woman: pale with dark stripes, one end hanging)
  if (wo) {
    g.beginPath(); g.moveTo(-30, -212); g.quadraticCurveTo(0, -192, 30, -212); g.lineTo(32, -198); g.quadraticCurveTo(0, -176, -32, -198); g.closePath(); fillWith(g, Cw(1)); ink(g, 2.5);
    pth(g, [[10, -196], [26, -198], [30, -146], [14, -144]]); fillWith(g, Cw(1)); ink(g, 2.5);
    for (const yy of [-186, -170, -156]) { line(g, 12, yy, 28, yy - 1); ink(g, 3); }
  } else {
    pth(g, [[-14, -206], [14, -206], [4, -174], [-4, -174]]); fillWith(g, Cw(1)); ink(g, 2);
    for (const s of [-1, 1]) { pth(g, [[s * 14, -206], [s * 34, -200], [s * 10, -168]]); fillWith(g, Cw(.1)); ink(g, 2); line(g, s * 14, -204, s * 8, -172); cutl(g, 1.6); }
  }
  // arms: right (o.arm) and left (o.arm2). Each swings from the shoulder; raised, the forearm points up
  const arms = [[1, o.arm || 0, o.leaf], [-1, o.arm2 || 0, o.leaf2]];
  for (const [s, up, leaf] of arms) {
    g.save(); g.translate(s * 36, -196);
    g.rotate(-s * (.12 + up * 2.55));
    pth(g, [[-9, 0], [9, 0], [8, 92], [-8, 92]]); fillWith(g, WC.C(.08, pats.coat)); ink(g, 2.5);
    g.beginPath(); g.roundRect(-10, 88, 20, 22, 9); fillWith(g, Cw(1)); ink(g, 2.5);
    if (leaf && up > .22) { // a leaflet held up by its corner: pale sheet with ruled lines (no words)
      g.save(); g.translate(0, 104); g.rotate(s * (.12 + up * 2.55) * (1 - .15)); // keep it near upright
      g.beginPath(); g.rect(-6, -2, 40, 52); fillWith(g, Cw(1)); ink(g, 2.5);
      g.beginPath(); g.rect(-1, 4, 30, 12); fillWith(g, Cw(0));
      for (let r = 0; r < 4; r++) { line(g, -1, 23 + r * 7, 29 - (r === 3 ? 10 : 0), 23 + r * 7); ink(g, 1.6); }
      g.restore();
    }
    g.restore();
  }
  // head
  const hy = -238;
  ell(g, 0, hy, 25, 29); fillWith(g, WC.LG(g, -25, 0, 25, 0, [[0, 1], [.78, 1], [1, .66]], pats.face)); ink(g, 3);
  if (wo) { // dark bob of hair framing the face
    g.beginPath(); g.moveTo(-28, hy + 18); g.quadraticCurveTo(-36, hy - 36, 0, hy - 36); g.quadraticCurveTo(36, hy - 36, 28, hy + 18);
    g.lineTo(18, hy + 16); g.quadraticCurveTo(24, hy - 12, 6, hy - 18); g.quadraticCurveTo(-14, hy - 10, -20, hy - 4); g.lineTo(-18, hy + 16); g.closePath(); fillWith(g, Cw(0));
    for (const s of [-1, 1]) { line(g, s * 26, hy - 14, s * 22, hy + 10); cutl(g, 1.6); }
  } else { // short hair, a cap of black
    g.beginPath(); g.moveTo(-25, hy - 4); g.quadraticCurveTo(-26, hy - 34, 0, hy - 33); g.quadraticCurveTo(26, hy - 34, 25, hy - 4); g.quadraticCurveTo(14, hy - 20, -2, hy - 18); g.quadraticCurveTo(-16, hy - 16, -25, hy - 4); g.closePath(); fillWith(g, Cw(0));
    for (let i = 0; i < 4; i++) { line(g, -16 + i * 10, hy - 30, -12 + i * 10, hy - 22); cutl(g, 1.6); }
  }
  for (const s of [-1, 1]) { ell(g, s * 9, hy - 2, 3, 3.6); fillWith(g, Cw(0)); g.beginPath(); g.moveTo(s * 4, hy - 11); g.lineTo(s * 15, hy - 12); ink(g, 2.4); }
  g.beginPath(); g.moveTo(-1, hy + 2); g.quadraticCurveTo(-5, hy + 10, 1, hy + 12); ink(g, 2);
  const sp = o.speak || 0;
  if (sp > .05) { ell(g, 0, hy + 18, 6 + sp * 2, 2 + sp * 6); fillWith(g, Cw(0)); }
  else { line(g, -7, hy + 18, 7, hy + 18); ink(g, 2.4); }
  g.restore();
}

// ---------- a barrister: feet origin. Tie-wig (pale with rolled curls at the sides), black gown, white bands.
// o.lean (0..1, leans forward to the right), o.arm (0..1 the arm with the brief comes up), pats: gown, face, wig ----------
function eLawyer(g, x, y, k, o, pats) {
  g.save(); g.translate(x, y); g.scale(k, k);
  for (const s of [-1, 1]) { ell(g, s * 12 + 6, -4, 15, 7); fillWith(g, Cw(0)); }
  g.rotate((o.lean || 0) * .16);
  // gown: wide black bell, gathered at the shoulders, with flute folds cut in
  g.beginPath(); g.moveTo(-34, -214); g.quadraticCurveTo(-62, -120, -58, -10); g.lineTo(58, -10); g.quadraticCurveTo(62, -120, 34, -214); g.closePath();
  fillWith(g, WC.LG(g, -58, 0, 58, 0, [[0, .22], [.45, .05], [1, .02]], pats.gown)); ink(g, 3);
  for (const fx of [-36, -18, 0, 18, 36]) gouge(g, fx * .5, -190, fx, -18, 2.2, 1, fx * .1);
  // bands at the throat
  pth(g, [[-8, -210], [8, -210], [9, -176], [-9, -176]]); fillWith(g, Cw(1)); ink(g, 2); line(g, 0, -210, 0, -176); ink(g, 1.6);
  // the arm with a brief (a rolled paper tied in a band)
  const up = o.arm || 0;
  g.save(); g.translate(30, -196); g.rotate(-.2 - up * 1.5);
  pth(g, [[-12, 0], [12, 0], [10, 86], [-10, 86]]); fillWith(g, Cw(0)); ink(g, 2.5);
  g.beginPath(); g.roundRect(-10, 82, 20, 20, 8); fillWith(g, Cw(1)); ink(g, 2.5);
  g.save(); g.translate(0, 92); g.rotate(1.2);
  g.beginPath(); g.roundRect(-46, -9, 92, 18, 9); fillWith(g, Cw(1)); ink(g, 2.5); g.beginPath(); g.rect(-6, -10, 12, 20); fillWith(g, Cw(0));
  g.restore(); g.restore();
  // head and tie-wig
  const hy = -246;
  ell(g, 0, hy, 24, 28); fillWith(g, WC.LG(g, -24, 0, 24, 0, [[0, 1], [.78, 1], [1, .66]], pats.face)); ink(g, 3);
  g.beginPath(); g.moveTo(-28, hy + 4); g.quadraticCurveTo(-32, hy - 40, 0, hy - 40); g.quadraticCurveTo(32, hy - 40, 28, hy + 4); g.quadraticCurveTo(22, hy - 18, 0, hy - 20); g.quadraticCurveTo(-22, hy - 18, -28, hy + 4); g.closePath();
  fillWith(g, WC.C(.88, pats.wig)); ink(g, 2.5);
  for (const s of [-1, 1]) for (let r = 0; r < 2; r++) { ell(g, s * 30, hy + 4 + r * 14, 9, 7); fillWith(g, Cw(1)); ink(g, 2.2); ell(g, s * 30, hy + 4 + r * 14, 3.5, 2.6); ink(g, 1.6); }
  for (let r = 0; r < 3; r++) { g.beginPath(); g.moveTo(-20, hy - 30 + r * 9); g.quadraticCurveTo(0, hy - 36 + r * 9, 20, hy - 30 + r * 9); ink(g, 1.6); }
  // face: eyes to the right, a stern mouth
  for (const s of [-1, 1]) { ell(g, s * 9 + 3, hy - 2, 3, 3.4); fillWith(g, Cw(0)); g.beginPath(); g.moveTo(s * 3 + 3, hy - 12); g.lineTo(s * 15 + 3, hy - 9 - (s > 0 ? 3 : 0)); ink(g, 2.6); }
  g.beginPath(); g.moveTo(3, hy + 2); g.quadraticCurveTo(8, hy + 10, 2, hy + 12); ink(g, 2);
  line(g, -6, hy + 18, 10, hy + 17); ink(g, 2.6);
  g.restore();
}

// ---------- the judge, seen from the bench up: origin at the middle of the chest where it meets the bench top.
// Full-bottomed wig (rows of curls), red robe trimmed with white fur, bands. o.nod (0..1), o.look (-1..1),
// o.gavel (angle of the gavel arm: 0 resting, 1 raised, then strike), o.eyes (1 open, 0 shut), pats: robe, face, wig ----------
function eJudge(g, x, y, k, o, pats) {
  g.save(); g.translate(x, y); g.scale(k, k);
  // robe: red plate over a mid tone so the gouges read through the red
  g.beginPath(); g.moveTo(-170, 40); g.quadraticCurveTo(-160, -120, -60, -150); g.lineTo(60, -150); g.quadraticCurveTo(160, -120, 170, 40); g.closePath();
  fillWith(g, WC.LG(g, -170, 0, 170, 0, [[0, .5], [.4, .82], [1, .38]], pats.robe, 1)); ink(g, 4);
  // fur trim down the front
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 18, -150); g.quadraticCurveTo(s * 40, -60, s * 46, 40); g.lineTo(s * 74, 40); g.quadraticCurveTo(s * 66, -60, s * 46, -150); g.closePath(); ermineFill(g, 40 + s, 18, s * 18 - 30, -160, s * 74 + 30, 50); ink(g, 3); }
  // bands
  pth(g, [[-14, -150], [14, -150], [16, -96], [-16, -96]]); fillWith(g, Cw(1)); ink(g, 2.5); line(g, 0, -150, 0, -96); ink(g, 2);
  // the gavel arm (right side of the picture): o.gavel 0 = the gavel head down on the sound block to his right,
  // 1 = raised high. The handle runs on from the fist along the arm; the head sits across its end.
  const ga = o.gavel || 0;
  if (o.hasGavel || ga) {
    g.save(); g.translate(120, -100); g.rotate(lerp(-1.1, -2.75, ga));
    pth(g, [[-20, 0], [20, 0], [16, 100], [-16, 100]]); fillWith(g, WC.C(.75, pats.robe, 1)); ink(g, 3.5);
    g.beginPath(); g.roundRect(-14, 92, 28, 8, 3); fillWith(g, Cw(1)); ink(g, 2);
    g.beginPath(); g.roundRect(-7, 104, 14, 96, 5); fillWith(g, WC.C(.55, pats.wig)); ink(g, 2.5);           // handle
    g.beginPath(); g.roundRect(-18, 96, 36, 30, 12); fillWith(g, Cw(1)); ink(g, 3);                           // fist
    g.beginPath(); g.roundRect(-46, 196, 92, 50, 14); fillWith(g, WC.LG(g, -46, 0, 46, 0, [[0, .2], [.4, .9], [1, .1]], pats.wig)); ink(g, 3.5);
    line(g, -30, 196, -30, 246); cutl(g, 3); line(g, 30, 196, 30, 246); cutl(g, 3);
    g.restore();
  }
  // head: nods forward, turns a little
  const nod = o.nod || 0, look = o.look || 0;
  g.save(); g.translate(0, -160 + nod * 12); g.rotate(nod * .08);
  const hy = -70;
  // full-bottomed wig: a long pale mass to the shoulders, rows of curls
  g.beginPath(); g.moveTo(-96, 40); g.quadraticCurveTo(-110, -80, -70, -130); g.quadraticCurveTo(0, -176, 70, -130); g.quadraticCurveTo(110, -80, 96, 40); g.quadraticCurveTo(60, 56, 44, 20); g.lineTo(44, -40); g.lineTo(-44, -40); g.lineTo(-44, 20); g.quadraticCurveTo(-60, 56, -96, 40); g.closePath();
  fillWith(g, WC.C(.92, pats.wig)); ink(g, 4);
  g.save(); g.clip();
  for (let r = 0; r < 9; r++) for (let c = 0; c < 12; c++) {
    const cx = -100 + c * 18 + (r % 2) * 9, cy = -150 + r * 22;
    if (Math.abs(cx) < 44 && cy > -60) continue; // the face hole
    ell(g, cx, cy, 10, 8); ink(g, 2.2); ell(g, cx + 1, cy, 3.5, 2.5); fillWith(g, Cw(0));
  }
  g.restore();
  // face
  ell(g, look * 4, hy + 4, 42, 52); fillWith(g, WC.LG(g, -42, 0, 42, 0, [[0, 1], [.76, 1], [1, .62]], pats.face)); ink(g, 4);
  const ex = look * 6, eo = o.eyes == null ? 1 : o.eyes;
  for (const s of [-1, 1]) {
    if (eo > .5) { ell(g, ex + s * 16, hy - 4, 5, 5.5); fillWith(g, Cw(0)); ell(g, ex + s * 16 - 1.5, hy - 6, 1.5, 1.5); fillWith(g, Cw(1)); }
    else { g.beginPath(); g.moveTo(ex + s * 16 - 7, hy - 3); g.quadraticCurveTo(ex + s * 16, hy + 2, ex + s * 16 + 7, hy - 3); ink(g, 3); }
    g.beginPath(); g.moveTo(ex + s * 6, hy - 16); g.quadraticCurveTo(ex + s * 18, hy - 24, ex + s * 30, hy - 15); ink(g, 5); // heavy brows
    g.beginPath(); g.arc(ex + s * 16, hy - 4, 11, 0, TAU); ink(g, 2.2); // spectacles
  }
  line(g, ex - 5, hy - 4, ex + 5, hy - 4); ink(g, 2.2);
  g.beginPath(); g.moveTo(ex - 2, hy); g.quadraticCurveTo(ex - 9, hy + 20, ex - 4, hy + 24); g.quadraticCurveTo(ex + 4, hy + 28, ex + 8, hy + 22); ink(g, 3);
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(ex + s * 30, hy + 6); g.quadraticCurveTo(ex + s * 26, hy + 30, ex + s * 16, hy + 40); ink(g, 1.8); } // lines of age
  g.beginPath(); g.moveTo(ex - 15, hy + 37); g.quadraticCurveTo(ex, hy + 40 - (o.smile || 0) * 0, ex + 15, hy + 37); ink(g, 3.4);
  g.restore();
  g.restore();
}

// ---------- a royal crown roundel (the king's court): black ring, a crown cut white, rays ----------
function eCrownRoundel(g, x, y, r, pRay) {
  ell(g, x, y, r, r); fillWith(g, Cw(0));
  ell(g, x, y, r - 7, r - 7); fillWith(g, WC.RG(g, x, y, 4, x, y, r, [[0, .95], [1, .3]], pRay)); ink(g, 3);
  // a closed royal crown: band with jewels, five points each tipped with an orb, arches meeting under a cross
  const w = r * .62, by = y + r * .38, bh = r * .22, top = y - r * .2;
  const tips = [-1, -.5, 0, .5, 1], tipY = (i) => top - (i === 2 ? r * .08 : 0) + (i % 2 ? r * .06 : 0);
  g.beginPath(); g.moveTo(x - w, by);
  tips.forEach((u, i) => { if (i) g.lineTo(x + (u - .25) * w, top + r * .32); g.lineTo(x + u * w, tipY(i)); });
  g.lineTo(x + w, by); g.closePath(); fillWith(g, Cw(1)); ink(g, 2.5);
  g.beginPath(); g.moveTo(x - w * .9, top + r * .1); g.quadraticCurveTo(x, top - r * .55, x + w * .9, top + r * .1); ink(g, 2.5);
  tips.forEach((u, i) => { ell(g, x + u * w, tipY(i) - r * .06, r * .075, r * .075); fillWith(g, Cw(0)); });
  line(g, x, top - r * .2, x, top - r * .5); ink(g, 3); line(g, x - r * .1, top - r * .4, x + r * .1, top - r * .4); ink(g, 3);
  g.beginPath(); g.rect(x - w, by - bh, 2 * w, bh); fillWith(g, Cw(0));
  for (let i = 0; i < 3; i++) { ell(g, x - w * .6 + i * w * .6, by - bh / 2, r * .06, r * .05); fillWith(g, Cw(1)); }
}

// ---------- paper: a stack of sheets (seen edge-on), h units tall ----------
function ePaperStack(g, x, by, w, h, pEdge) {
  if (h <= 1) return;
  g.beginPath(); g.rect(x - w / 2, by - h, w, h); fillWith(g, WC.C(.7, pEdge)); ink(g, 2.5);
  for (let yy = by - 6; yy > by - h + 2; yy -= 6) { line(g, x - w / 2 + (rnd(yy, x) * 4), yy, x + w / 2 - (rnd(x, yy) * 4), yy); ink(g, 1.1); }
  g.beginPath(); g.moveTo(x - w / 2, by - h); g.lineTo(x - w / 2 + 12, by - h - 8); g.lineTo(x + w / 2 + 12, by - h - 8); g.lineTo(x + w / 2, by - h); g.closePath(); fillWith(g, Cw(1)); ink(g, 2.2);
}

// ---------- a sheet of paper flying (leaflet / calendar leaf): centre, size, angle, flip (-1..1) ----------
function eFlyingSheet(g, x, y, w, h, ang, flip, ruled = true) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(Math.max(.12, Math.abs(flip)), 1);
  g.beginPath(); g.rect(-w / 2, -h / 2, w, h); fillWith(g, Cw(1)); ink(g, 2.4);
  if (ruled && flip > 0) { g.beginPath(); g.rect(-w / 2 + 5, -h / 2 + 5, w - 10, h * .22); fillWith(g, Cw(0)); for (let r = 0; r < 4; r++) { line(g, -w / 2 + 5, -h / 2 + h * .38 + r * h * .14, w / 2 - 5 - (r === 3 ? w * .3 : 0), -h / 2 + h * .38 + r * h * .14); ink(g, 1.4); } }
  g.restore();
}

// ---------- a hen, plain (side view, facing left): centre of the body ----------
function eHen(g, x, y, k, pFeather) {
  g.save(); g.translate(x, y); g.scale(k, k);
  g.beginPath(); g.moveTo(-40, -10); g.quadraticCurveTo(-36, -44, 0, -40); g.quadraticCurveTo(40, -40, 56, -64); g.quadraticCurveTo(66, -20, 50, 12); g.quadraticCurveTo(20, 40, -20, 30); g.quadraticCurveTo(-46, 20, -40, -10); g.closePath();
  fillWith(g, WC.RG(g, -10, -20, 4, -10, -20, 70, [[0, .95], [1, .45]], pFeather)); ink(g, 3);
  g.beginPath(); g.moveTo(-6, -10); g.quadraticCurveTo(14, -20, 30, -6); g.quadraticCurveTo(14, 12, -6, -10); ink(g, 2.5); // wing
  ell(g, -44, -38, 16, 18); fillWith(g, Cw(1)); ink(g, 3);  // head
  g.beginPath(); g.moveTo(-56, -52); g.lineTo(-52, -62); g.lineTo(-46, -54); g.lineTo(-40, -64); g.lineTo(-36, -52); g.closePath(); fillWith(g, Cw(0)); // comb
  pth(g, [[-60, -40], [-74, -35], [-60, -31]]); fillWith(g, Cw(0)); // beak
  ell(g, -48, -40, 2.6, 2.6); fillWith(g, Cw(0));
  for (const s of [-8, 8]) { line(g, s, 30, s - 2, 46); ink(g, 3); }
  g.restore();
}

// ---------- a burger-shaped thing (a bun, a patty, a leaf) ----------
function eBun(g, x, y, w, pBun) {
  const h = w * .62;
  g.beginPath(); g.moveTo(x - w / 2, y - h * .45); g.quadraticCurveTo(x - w / 2, y - h, x, y - h); g.quadraticCurveTo(x + w / 2, y - h, x + w / 2, y - h * .45); g.closePath();
  fillWith(g, WC.RG(g, x - w * .15, y - h * .8, 3, x - w * .15, y - h * .8, w * .6, [[0, .97], [1, .5]], pBun)); ink(g, 3);
  for (let i = 0; i < 6; i++) { ell(g, x - w * .3 + i * w * .12, y - h * .7 + (i % 2) * 8, 3.5, 2); fillWith(g, Cw(0)); }
  g.beginPath(); g.moveTo(x - w / 2 - 6, y - h * .45); for (let i = 0; i <= 10; i++) g.lineTo(x - w / 2 - 6 + i * (w + 12) / 10, y - h * .45 + (i % 2 ? 8 : -2)); g.lineTo(x + w / 2, y - h * .3); g.lineTo(x - w / 2, y - h * .3); g.closePath(); fillWith(g, Cw(1)); ink(g, 2.5);
  g.beginPath(); g.roundRect(x - w / 2, y - h * .32, w, h * .18, 8); fillWith(g, Cw(0)); line(g, x - w * .4, y - h * .23, x + w * .4, y - h * .23); cutl(g, 1.8);
  g.beginPath(); g.moveTo(x - w / 2, y - h * .13); g.lineTo(x + w / 2, y - h * .13); g.quadraticCurveTo(x + w / 2, y, x + w * .4, y); g.lineTo(x - w * .4, y); g.quadraticCurveTo(x - w / 2, y, x - w / 2, y - h * .13); g.closePath(); fillWith(g, WC.C(.75, pBun)); ink(g, 3);
}

// ---------- a heart (with a crack cut through it when cracked) ----------
function eHeart(g, x, y, r, cracked) {
  g.beginPath(); g.moveTo(x, y + r); g.bezierCurveTo(x - r * 1.6, y - r * .1, x - r * .8, y - r * 1.2, x, y - r * .45); g.bezierCurveTo(x + r * .8, y - r * 1.2, x + r * 1.6, y - r * .1, x, y + r); g.closePath(); fillWith(g, Cw(0));
  g.beginPath(); g.ellipse(x - r * .45, y - r * .4, r * .18, r * .1, -.6, 0, TAU); fillWith(g, Cw(1));
  if (cracked) { g.beginPath(); g.moveTo(x, y - r * .45); g.lineTo(x - r * .14, y - r * .1); g.lineTo(x + r * .12, y + r * .15); g.lineTo(x - r * .08, y + r * .45); g.lineTo(x, y + r * .7); cutl(g, 4); }
}

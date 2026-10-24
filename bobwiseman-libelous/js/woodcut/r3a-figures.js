// Round 3 (wood-A) figures and props for stanzas 6-7, painted into the tone map in block-local units like
// figures.js and story-figures.js (loaded read-only; limb, mitten, ermineFill, drawCoin, coinCrown come from there).
// Patterns are registered per block and passed in (pats), because they live in block units.

// a one-shot bump 0 -> 1 -> 0 over d seconds from a hair before s; an overshooting arrival 0 -> 1
const r3aBump = (t, s, d = .3) => Math.max(0, Math.sin(clamp((t - s + .03) / d) * Math.PI));
const r3aIn = (t, s, d = .22, over = 1.6) => clamp(easeOutBack(clamp((t - s + .03) / d), over), 0, 1.3);
// impact cuts round a point (white gouges), k 0..1 how far they have shot out
function r3aBurst(g, x, y, r0, r1, n, w, k, a0 = 0, sy = 1) {
  if (k <= 0) return;
  for (let i = 0; i < n; i++) { const a = a0 + i / n * TAU; gouge(g, x + Math.cos(a) * r0, y + Math.sin(a) * r0 * sy, x + Math.cos(a) * (r0 + (r1 - r0) * k), y + Math.sin(a) * (r0 + (r1 - r0) * k) * sy, w, 1); }
}

// ---------- the clown: feet origin, front-on. Black and white only: white face, a ruff, a pointed hat cut in
// cross-hatching, a suit of lozenges, black tufts of hair. o.arm 0..1 (his right arm reaches forward with a bun),
// o.point 0..1 (his left forefinger up), o.grin, o.wink, o.bust (head and shoulders only), o.hop ----------
function r3aClown(g, x, y, k, o, pats) {
  g.save(); g.translate(x, y - (o.hop || 0)); g.scale(k, k);
  if (!o.bust) {
    // baggy trousers of lozenges, big shoes
    for (const s of [-1, 1]) {
      g.beginPath(); g.moveTo(s * 6, -170); g.lineTo(s * 62, -170); g.quadraticCurveTo(s * 70, -80, s * 54, -22); g.lineTo(s * 10, -22); g.closePath();
      g.save(); g.clip(); r3aLozenges(g, -80, -180, 80, -10, 26); g.restore(); ink(g, 3.5);
      g.beginPath(); g.moveTo(s * 10, -24); g.lineTo(s * 56, -24); g.quadraticCurveTo(s * 100, -20, s * 96, 0); g.lineTo(s * 8, 0); g.closePath(); fillWith(g, Cw(0));
      line(g, s * 30, -14, s * 84, -10); cutl(g, 2.5);
    }
    // the tunic: lozenges, a row of big pompom buttons
    g.beginPath(); g.moveTo(-58, -300); g.quadraticCurveTo(-84, -230, -70, -160); g.lineTo(70, -160); g.quadraticCurveTo(84, -230, 58, -300); g.closePath();
    g.save(); g.clip(); r3aLozenges(g, -90, -310, 90, -150, 30); g.restore(); ink(g, 4);
    g.beginPath(); g.rect(-72, -176, 144, 16); fillWith(g, Cw(0)); line(g, -70, -168, 70, -168); cutl(g, 2);
    for (const by of [-270, -232, -196]) { ell(g, 0, by, 11, 11); fillWith(g, Cw(1)); ink(g, 3); ell(g, 0, by, 5, 5); ink(g, 1.6); }
  } else {
    g.beginPath(); g.moveTo(-96, 0); g.quadraticCurveTo(-92, -70, -58, -300 + 220); g.lineTo(58, -80); g.quadraticCurveTo(92, -70, 96, 0); g.closePath();
    g.save(); g.clip(); r3aLozenges(g, -100, -90, 100, 0, 30); g.restore(); ink(g, 4);
  }
  const shY = o.bust ? -80 : -290;
  // arms: mittened gloves
  const arm = o.arm || 0, pt = o.point || 0;
  // his left (our right): the offering arm, reaching forward and out
  limb(g, [[54, shY + 8], [lerp(78, 120, arm), lerp(shY + 90, shY + 30, arm)], [lerp(70, 190, arm), lerp(shY + 170, shY + 10, arm)]], 30);
  mitten(g, lerp(70, 198, arm), lerp(shY + 176, shY + 4, arm), 17);
  // his right (our left): down, or up with the forefinger raised
  limb(g, [[-54, shY + 8], [lerp(-80, -110, pt), lerp(shY + 90, shY + 40, pt)], [lerp(-70, -120, pt), lerp(shY + 170, shY - 40, pt)]], 30);
  const hx = lerp(-70, -120, pt), hy = lerp(shY + 176, shY - 46, pt);
  mitten(g, hx, hy, 17);
  if (pt > .5) { g.beginPath(); g.roundRect(hx - 6, hy - 46, 12, 36, 6); fillWith(g, Cw(1)); ink(g, 3); }
  // the ruff: two rows of white frills
  for (const [ry, rr] of [[shY + 4, 92], [shY - 4, 78]]) {
    g.beginPath();
    for (let i = 0; i <= 28; i++) { const a = i / 28 * TAU, r = rr * (i % 2 ? .78 : 1); const px = Math.cos(a) * r, py = ry + Math.sin(a) * r * .32; i ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.closePath(); fillWith(g, Cw(1)); ink(g, 3);
    for (let i = 0; i < 14; i++) { const a = (i + .5) / 14 * TAU; line(g, Math.cos(a) * rr * .3, ry + Math.sin(a) * rr * .1, Math.cos(a) * rr * .86, ry + Math.sin(a) * rr * .28); ink(g, 1.6); }
  }
  // head: white face, black tufts at the sides, harlequin marks over the eyes, a round nose, a wide grin
  const hy0 = shY - 64;
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 40, hy0 - 20); g.quadraticCurveTo(s * 86, hy0 - 40, s * 84, hy0 + 4); g.quadraticCurveTo(s * 78, hy0 + 30, s * 44, hy0 + 18); g.closePath(); fillWith(g, WC.C(.12, pats.hair)); ink(g, 2.5); }
  ell(g, 0, hy0, 50, 58); fillWith(g, WC.LG(g, -50, 0, 50, 0, [[0, 1], [.6, 1], [1, .6]], pats.face)); ink(g, 4);
  for (const s of [-1, 1]) {
    pth(g, [[s * 20, hy0 - 40], [s * 28, hy0 - 16], [s * 20, hy0 + 6], [s * 12, hy0 - 16]]); fillWith(g, Cw(0));
    if (o.wink && s > 0) { g.beginPath(); g.moveTo(s * 12, hy0 - 14); g.quadraticCurveTo(s * 20, hy0 - 8, s * 28, hy0 - 14); cutl(g, 3); }
    else { ell(g, s * 20, hy0 - 16, 6, 7); fillWith(g, Cw(1)); ell(g, s * 20, hy0 - 15, 3, 3.5); fillWith(g, Cw(0)); }
  }
  ell(g, 0, hy0 + 8, 13, 12); fillWith(g, Cw(1)); ink(g, 3.5); ell(g, -4, hy0 + 4, 3, 3); ink(g, 1.4);
  const gr = o.grin == null ? 1 : o.grin;
  g.beginPath(); g.moveTo(-32, hy0 + 26); g.quadraticCurveTo(0, hy0 + 26 + 30 * gr, 32, hy0 + 26); g.quadraticCurveTo(0, hy0 + 32 + 12 * gr, -32, hy0 + 26); g.closePath(); fillWith(g, Cw(0));
  g.beginPath(); g.moveTo(-24, hy0 + 30); g.quadraticCurveTo(0, hy0 + 30 + 14 * gr, 24, hy0 + 30); cutl(g, 3 * gr + .5);
  // the pointed hat, cut in cross-hatching, a pompom on its tip
  pth(g, [[-46, hy0 - 40], [46, hy0 - 40], [10, hy0 - 196]]); fillWith(g, WC.LG(g, -46, 0, 46, 0, [[0, .7], [.5, .45], [1, .2]], pats.hat)); ink(g, 4);
  g.beginPath(); g.ellipse(0, hy0 - 40, 50, 10, 0, 0, TAU); fillWith(g, Cw(1)); ink(g, 3);
  ell(g, 12, hy0 - 204, 15, 15); fillWith(g, Cw(1)); ink(g, 3); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; line(g, 12, hy0 - 204, 12 + Math.cos(a) * 12, hy0 - 204 + Math.sin(a) * 12); ink(g, 1.4); }
  g.restore();
}
// lozenges (diamonds), alternately black and white, filling a rect; call inside a clip
function r3aLozenges(g, x0, y0, x1, y1, s) {
  g.fillStyle = Cw(1); g.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let r = 0, y = y0; y < y1 + s; y += s, r++) for (let x = x0 + (r % 2) * s / 2 - s; x < x1 + s; x += s) {
    if ((r + Math.round(x / s)) % 2) continue;
    pth(g, [[x, y - s / 2], [x + s / 2, y], [x, y + s / 2], [x - s / 2, y]]); fillWith(g, Cw(0));
  }
  g.strokeStyle = Cw(0); g.lineWidth = 1.4;
  for (let r = 0, y = y0; y < y1 + s; y += s, r++) for (let x = x0 + (r % 2) * s / 2 - s; x < x1 + s; x += s) { pth(g, [[x, y - s / 2], [x + s / 2, y], [x, y + s / 2], [x - s / 2, y]]); g.stroke(); }
}

// ---------- a child: feet origin, facing dir (1 right, -1 left). o.hair 0 bob, 1 cap, 2 plaits; o.grin; o.crown (a
// paper party crown, cut white); o.bun (holds a bun up); o.arm 'down' | 'up' | 'tug' (reaching out ahead); o.hop ----------
function r3aKid(g, x, y, k, o, pats) {
  const d = o.dir || 1;
  g.save(); g.translate(x, y - (o.hop || 0)); g.scale(k * d, k);
  for (const s of [-1, 1]) { line(g, s * 9, -62, s * 10, -8); ink(g, 9); ell(g, s * 10 + 6, -4, 11, 6); fillWith(g, Cw(0)); }
  // smock
  pth(g, [[-22, -132], [22, -132], [38, -56], [-38, -56]]); fillWith(g, WC.LG(g, -38, 0, 38, 0, [[0, .25], [.5, .85], [1, .2]], pats.smock)); ink(g, 3);
  g.beginPath(); g.rect(-38, -62, 76, 8); fillWith(g, Cw(1)); ink(g, 2);
  // head, profile to the right (mirrored for left)
  ell(g, 2, -154, 21, 23); fillWith(g, WC.LG(g, -20, 0, 22, 0, [[0, .55], [.4, 1], [1, 1]], pats.face)); ink(g, 3);
  const hair = o.hair || 0;
  if (hair === 1) { // a flat cap with a peak
    g.beginPath(); g.moveTo(-22, -158); g.quadraticCurveTo(-18, -186, 10, -182); g.quadraticCurveTo(26, -178, 22, -166); g.closePath(); fillWith(g, WC.C(.3, pats.hair)); ink(g, 2.5);
    g.beginPath(); g.moveTo(14, -168); g.lineTo(38, -164); g.lineTo(16, -160); g.closePath(); fillWith(g, Cw(0));
  } else {
    g.beginPath(); g.moveTo(-22, -146); g.quadraticCurveTo(-22, -182, 4, -178); g.quadraticCurveTo(20, -176, 20, -164); g.quadraticCurveTo(4, -168, -4, -160); g.quadraticCurveTo(-10, -140, -20, -128); g.closePath(); fillWith(g, WC.C(.15, pats.hair)); ink(g, 2.2);
    if (hair === 2) for (const py of [-128, -112]) { ell(g, -22, py, 6, 9); fillWith(g, WC.C(.15, pats.hair)); ink(g, 2); }
  }
  ell(g, 12, -157, 2.8, 3.2); fillWith(g, Cw(0));
  const gr = o.grin || 0;
  if (gr > .05) { g.beginPath(); g.moveTo(4, -142); g.quadraticCurveTo(14, -132 - 4 * gr, 22, -143); g.quadraticCurveTo(14, -138, 4, -142); g.closePath(); fillWith(g, Cw(0)); g.beginPath(); g.arc(-2, -146, 4, .4, 2.4); ink(g, 1.6); }
  else { g.beginPath(); g.moveTo(10, -140); g.lineTo(20, -141); ink(g, 2.2); }
  if (o.crown) { // a paper crown: white, zigzag top, a cut band
    const c = o.crown;
    g.save(); g.translate(0, -174); g.scale(1, c);
    pth(g, [[-20, 6], [-20, -18], [-11, -6], [-2, -22], [7, -6], [16, -18], [22, 6]]); fillWith(g, Cw(1)); ink(g, 2.4);
    line(g, -19, 0, 21, 0); ink(g, 1.6);
    g.restore();
  }
  const arm = o.arm || 'down';
  if (arm === 'up') { limb(g, [[14, -126], [22, -150], [26, -186]], 11); mitten(g, 26, -192, 8); }
  else if (arm === 'tug') { limb(g, [[14, -124], [36, -112], [60, -104]], 11); mitten(g, 64, -104, 8); }
  else if (o.bun) { limb(g, [[14, -124], [30, -110], [36, -128]], 11); r3aBun(g, 40, -150, 46, {}, pats); mitten(g, 38, -128, 8); }
  else { limb(g, [[14, -124], [20, -98], [22, -76]], 11); mitten(g, 22, -74, 8); }
  g.restore();
}

// ---------- a parent: feet origin, facing dir; o.woman (bonnet, shawl, apron) or a man (flat cap, waistcoat);
// o.look 0..1 the head bows down toward the child ----------
function r3aParent(g, x, y, k, o, pats) {
  const d = o.dir || 1, lk = o.look || 0;
  g.save(); g.translate(x, y); g.scale(k * d, k);
  if (o.woman) {
    g.beginPath(); g.moveTo(-28, -200); g.lineTo(28, -200); g.quadraticCurveTo(70, -80, 76, 0); g.lineTo(-76, 0); g.quadraticCurveTo(-70, -80, -28, -200); g.closePath();
    fillWith(g, WC.LG(g, -76, 0, 76, 0, [[0, .2], [.45, .7], [1, .1]], pats.coat)); ink(g, 3.5);
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 9, -190); g.quadraticCurveTo(i * 22, -90, i * 30, -6); cutl(g, 1.8); }
    pth(g, [[-4, -190], [40, -190], [52, -30], [4, -30]]); fillWith(g, Cw(1)); ink(g, 2.5); // apron
    g.beginPath(); g.moveTo(-40, -262); g.quadraticCurveTo(0, -282, 44, -262); g.lineTo(36, -196); g.lineTo(-34, -196); g.closePath(); fillWith(g, WC.C(.35, pats.shawl)); ink(g, 3);
    limb(g, [[30, -250], [50, -210], [40, -176]], 16); mitten(g, 38, -172, 10);
  } else {
    for (const s of [-1, 1]) { pth(g, [[s * 14 - 11, -120], [s * 14 + 11, -120], [s * 14 + 10, -8], [s * 14 - 10, -8]]); fillWith(g, WC.C(.45, pats.legs)); ink(g, 2.5); ell(g, s * 14 + 6, -4, 16, 7); fillWith(g, Cw(0)); }
    g.beginPath(); g.moveTo(-38, -268); g.quadraticCurveTo(-46, -180, -40, -110); g.lineTo(42, -110); g.quadraticCurveTo(48, -180, 40, -268); g.closePath();
    fillWith(g, WC.LG(g, -46, 0, 48, 0, [[0, .3], [.4, .08], [1, .03]], pats.coat)); ink(g, 3);
    pth(g, [[-14, -266], [24, -266], [20, -150], [-10, -150]]); fillWith(g, WC.C(.75, pats.legs)); ink(g, 2.4); // waistcoat
    for (const by of [-240, -214, -188, -164]) { ell(g, 5, by, 3.5, 3.5); fillWith(g, Cw(0)); }
    limb(g, [[34, -256], [46, -196], [40, -150]], 18); mitten(g, 40, -146, 11);
  }
  // head, bowing toward the child
  const hx = o.woman ? 4 : 4, hy = o.woman ? -294 : -294;
  g.save(); g.translate(hx, hy + 20); g.rotate(lk * .45); g.translate(0, -20);
  ell(g, 0, 0, 25, 29); fillWith(g, WC.LG(g, -25, 0, 26, 0, [[0, .55], [.4, 1], [1, 1]], pats.face)); ink(g, 3);
  ell(g, 11, -4, 2.8, 3.4); fillWith(g, Cw(0));
  g.beginPath(); g.moveTo(23, -2); g.quadraticCurveTo(31, 8, 23, 12); ink(g, 2.4);
  g.beginPath(); g.moveTo(9, 18); g.quadraticCurveTo(15, 21 + lk * 3, 21, 17); ink(g, 2.2);
  if (o.woman) { // bonnet: a hood framing the face, ties under the chin
    g.beginPath(); g.moveTo(22, -26); g.quadraticCurveTo(-10, -48, -34, -18); g.quadraticCurveTo(-40, 14, -22, 30); g.lineTo(-10, 22); g.quadraticCurveTo(-20, -10, 4, -22); g.quadraticCurveTo(16, -24, 22, -26); g.closePath();
    fillWith(g, WC.C(.25, pats.shawl)); ink(g, 2.6);
    g.beginPath(); g.moveTo(26, -24); g.quadraticCurveTo(-8, -40, -26, -8); cutl(g, 2);
    line(g, -10, 24, 8, 30); ink(g, 2.4);
  } else { // flat cap and side whiskers
    g.beginPath(); g.moveTo(-26, -6); g.quadraticCurveTo(-24, -36, 8, -32); g.quadraticCurveTo(26, -28, 24, -16); g.closePath(); fillWith(g, WC.C(.3, pats.legs)); ink(g, 2.5);
    pth(g, [[16, -18], [44, -14], [18, -10]]); fillWith(g, Cw(0));
    g.beginPath(); g.moveTo(-6, -2); g.quadraticCurveTo(-8, 20, 4, 26); g.quadraticCurveTo(-2, 8, 2, -2); g.closePath(); fillWith(g, Cw(0));
  }
  g.restore();
  g.restore();
}

// ---------- a customer, head and shoulders: neck-base origin, facing dir. o.hat 'cap' | 'bonnet' | 'bare';
// o.smile 0..1; o.armUp 0..1 (a mitten raised); o.book (holds a little book open in front) ----------
function r3aPerson(g, x, y, k, o, pats) {
  const d = o.dir || 1;
  g.save(); g.translate(x, y); g.scale(k * d, k);
  g.beginPath(); g.moveTo(-70, 120); g.quadraticCurveTo(-72, 16, -18, 6); g.lineTo(18, 6); g.quadraticCurveTo(72, 16, 70, 120); g.closePath();
  fillWith(g, WC.LG(g, -70, 0, 70, 0, [[0, .35], [.45, .1], [1, .03]], pats.coat)); ink(g, 3);
  pth(g, [[-14, 6], [14, 6], [4, 34], [-4, 34]]); fillWith(g, Cw(1)); ink(g, 2);
  ell(g, 2, -32, 28, 33); fillWith(g, WC.LG(g, -28, 0, 30, 0, [[0, .55], [.4, 1], [1, 1]], pats.face)); ink(g, 3.2);
  ell(g, 14, -38, 3, 3.6); fillWith(g, Cw(0));
  g.beginPath(); g.moveTo(26, -36); g.quadraticCurveTo(36, -24, 26, -20); ink(g, 2.6);
  const sm = o.smile || 0;
  if (sm > .05) { g.beginPath(); g.moveTo(6, -12); g.quadraticCurveTo(18, -2 - 6 * sm, 28, -14); g.quadraticCurveTo(18, -8, 6, -12); g.closePath(); fillWith(g, Cw(0)); g.beginPath(); g.arc(2, -18, 5, .4, 2.4); ink(g, 1.8); }
  else { g.beginPath(); g.moveTo(12, -12); g.lineTo(26, -13); ink(g, 2.4); }
  const hat = o.hat || 'bare';
  if (hat === 'cap') {
    g.beginPath(); g.moveTo(-30, -40); g.quadraticCurveTo(-28, -76, 10, -72); g.quadraticCurveTo(32, -68, 30, -52); g.closePath(); fillWith(g, WC.C(.3, pats.hair)); ink(g, 2.6);
    pth(g, [[22, -56], [52, -50], [24, -46]]); fillWith(g, Cw(0));
  } else if (hat === 'bonnet') {
    g.beginPath(); g.moveTo(28, -62); g.quadraticCurveTo(-12, -86, -38, -50); g.quadraticCurveTo(-44, -6, -24, 4); g.lineTo(-12, -6); g.quadraticCurveTo(-22, -40, 4, -56); g.quadraticCurveTo(18, -60, 28, -62); g.closePath();
    fillWith(g, WC.C(.3, pats.hair)); ink(g, 2.6); g.beginPath(); g.moveTo(30, -60); g.quadraticCurveTo(-8, -76, -30, -44); cutl(g, 2);
  } else {
    g.beginPath(); g.moveTo(-26, -24); g.quadraticCurveTo(-34, -70, 4, -66); g.quadraticCurveTo(26, -64, 28, -50); g.quadraticCurveTo(8, -54, -4, -46); g.quadraticCurveTo(-10, -30, -24, -14); g.closePath(); fillWith(g, WC.C(.15, pats.hair)); ink(g, 2.2);
  }
  const up = o.armUp || 0;
  if (o.book) { // both mittens hold a little open book in front of the chest
    pth(g, [[10, 60], [60, 50], [60, 92], [10, 100]]); fillWith(g, Cw(1)); ink(g, 2.4); pth(g, [[60, 50], [104, 58], [104, 98], [60, 92]]); fillWith(g, Cw(1)); ink(g, 2.4);
    for (let i = 0; i < 3; i++) { line(g, 18, 66 + i * 9, 52, 60 + i * 9); ink(g, 1.4); line(g, 68, 62 + i * 9, 96, 68 + i * 9); ink(g, 1.4); }
    mitten(g, 12, 92, 10); mitten(g, 102, 92, 10);
  } else if (up > .02) { limb(g, [[44, 40], [lerp(70, 60, up), lerp(90, 0, up)], [lerp(66, 74, up), lerp(110, -60, up)]], 20); mitten(g, lerp(66, 74, up), lerp(114, -66, up), 12); }
  g.restore();
}

// ---------- a burger-shaped thing: seeded dome, a frill of lettuce, a patty, the heel. o.leaf 0..1 lights the lettuce ----------
function r3aBun(g, x, y, w, o, pats) {
  const h = w * .7;
  g.save(); g.translate(x, y);
  g.beginPath(); g.roundRect(-w * .48, h * .3, w * .96, h * .22, [2, 2, h * .1, h * .1]); fillWith(g, pats.bun ? WC.C(.65, pats.bun) : Cw(.65)); ink(g, 2.4);
  g.beginPath(); g.roundRect(-w * .52, h * .12, w * 1.04, h * .2, h * .08); fillWith(g, Cw(0)); line(g, -w * .4, h * .2, w * .4, h * .2); cutl(g, Math.max(1, w * .02));
  const lf = o.leaf || 0;
  g.beginPath(); g.moveTo(-w * .56, h * .12);
  for (let i = 0; i <= 10; i++) g.lineTo(-w * .56 + i * w * .112, h * (i % 2 ? .02 : .14));
  g.lineTo(w * .56, h * .12); g.closePath(); fillWith(g, Cw(lf > .02 ? 1 : .55)); ink(g, 2.2);
  g.beginPath(); g.moveTo(-w * .5, h * .06); g.bezierCurveTo(-w * .5, -h * .62, w * .5, -h * .62, w * .5, h * .06); g.closePath();
  fillWith(g, pats.bun ? WC.LG(g, -w * .5, 0, w * .5, 0, [[0, .95], [.5, .7], [1, .2]], pats.bun) : Cw(.8)); ink(g, 2.6);
  for (let i = 0; i < 7; i++) { const sx = -w * .3 + (i % 4) * w * .2 + (i > 3 ? w * .1 : 0), sy = -h * (i > 3 ? .2 : .32); ell(g, sx, sy, w * .03, w * .018, .4); fillWith(g, Cw(0)); }
  g.restore();
}

// ---------- the television: a wooden cabinet on legs, a screen, a speaker grille and two knobs.
// screenFn(g) paints inside the screen (clipped); returns the screen rect ----------
function r3aTV(g, x0, y0, w, h, pats, screenFn) {
  // legs
  for (const lx of [x0 + 30, x0 + w - 44]) { pth(g, [[lx, y0 + h - 4], [lx + 14, y0 + h - 4], [lx + 10, y0 + h + 90], [lx + 4, y0 + h + 90]]); fillWith(g, Cw(0)); }
  g.beginPath(); g.roundRect(x0, y0, w, h, 18); fillWith(g, WC.LG(g, x0, 0, x0 + w, 0, [[0, .25], [.4, .6], [1, .2]], pats.wood)); ink(g, 5);
  g.beginPath(); g.roundRect(x0 + 10, y0 + 10, w - 20, h - 20, 12); cutl(g, 2.4);
  const sw = w * .7, sx = x0 + 26, sy = y0 + 28, sh = h - 56;
  g.beginPath(); g.roundRect(sx - 8, sy - 8, sw + 16, sh + 16, 30); fillWith(g, Cw(0));
  g.save(); g.beginPath(); g.roundRect(sx, sy, sw, sh, 26); g.clip();
  screenFn(g, sx, sy, sw, sh);
  // the glass: a curved highlight cut across the top left
  g.beginPath(); g.moveTo(sx + 24, sy + 70); g.quadraticCurveTo(sx + 30, sy + 22, sx + 90, sy + 18); cutl(g, 5);
  g.restore();
  g.beginPath(); g.roundRect(sx, sy, sw, sh, 26); ink(g, 3);
  // grille and knobs
  const gx = sx + sw + 24, gw = x0 + w - 26 - gx;
  g.beginPath(); g.rect(gx, sy, gw, sh * .55); fillWith(g, Cw(0));
  for (let i = 1; i < 7; i++) { line(g, gx + 6, sy + i * sh * .55 / 7, gx + gw - 6, sy + i * sh * .55 / 7); cutl(g, 3); }
  for (let i = 0; i < 2; i++) { const ky = sy + sh * .68 + i * sh * .2; ell(g, gx + gw / 2, ky, gw * .26, gw * .26); fillWith(g, Cw(1)); ink(g, 3.5); line(g, gx + gw / 2, ky, gx + gw / 2 + gw * .18, ky - gw * .1); ink(g, 3); }
  return [sx, sy, sw, sh];
}

// ---------- a closed book standing, cover to us: spine at the left, page edges at the right.
// o.label 0..1 (a white panel on the cover), o.words [two strings] with o.w1, o.w2 0..1 (each cut in on its word) ----------
function r3aBook(g, x, y, w, h, o, pats) {
  g.save(); g.translate(x, y);
  pth(g, [[w * .5, -h * .5 + 8], [w * .5 + 22, -h * .5 + 20], [w * .5 + 22, h * .5 + 8], [w * .5, h * .5 - 4]]); fillWith(g, Cw(1)); ink(g, 3);
  for (let i = 1; i < 6; i++) { line(g, w * .5 + 3, -h * .5 + 10 + i * 2, w * .5 + 20, -h * .5 + 22 + i * 2); }
  for (let i = 1; i < 12; i++) { line(g, w * .5 + 4 + i * 1.5, -h * .5 + 14 + i, w * .5 + 4 + i * 1.5, h * .5 - 2); ink(g, .9); }
  g.beginPath(); g.roundRect(-w * .5, -h * .5, w, h, 8); fillWith(g, WC.LG(g, -w * .5, 0, w * .5, 0, [[0, .1], [.35, .32], [1, .06]], pats.cover)); ink(g, 4);
  g.beginPath(); g.rect(-w * .5, -h * .5, w * .12, h); fillWith(g, Cw(0)); for (const by of [-.36, -.3, .3, .36]) { line(g, -w * .5 + 4, h * by, -w * .38 - 4, h * by); cutl(g, 2.5); }
  g.beginPath(); g.roundRect(-w * .34, -h * .44, w * .8, h * .88, 6); cutl(g, 3);
  const lb = o.label || 0;
  if (lb > 0) {
    const lw = w * .7 * lb, lh = h * .36;
    g.beginPath(); g.roundRect(w * .06 - lw / 2, -h * .22 - lh / 2, lw, lh, 10); fillWith(g, Cw(1)); ink(g, 3);
    g.beginPath(); g.roundRect(w * .06 - lw / 2 + 8, -h * .22 - lh / 2 + 8, lw - 16, lh - 16, 6); ink(g, 1.6);
    if (o.words) { // the two title words, set in the panel (black on white), each struck in on its word
      g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = Cw(0);
      o.words.forEach((wd, i) => {
        const u = i ? o.w2 || 0 : o.w1 || 0; if (u <= 0) return;
        let sz = h * .11; g.font = `${sz}px "Big Caslon"`; while (g.measureText(wd).width > lw - 40 && sz > 8) { sz -= 1; g.font = `${sz}px "Big Caslon"`; }
        g.save(); g.translate(w * .06, -h * .22 - lh * .06 + i * lh * .34); g.scale(1 + (1 - Math.min(1, u)) * .25, 1 + (1 - Math.min(1, u)) * .25);
        g.fillText(wd, 0, 0); g.restore();
      });
    }
  }
  // a small ornament (a fleuron of cuts) low on the cover
  const fy = h * .26; ell(g, w * .06, fy, w * .08, w * .08); cutl(g, 3); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; gouge(g, w * .06 + Math.cos(a) * w * .1, fy + Math.sin(a) * w * .1, w * .06 + Math.cos(a) * w * .16, fy + Math.sin(a) * w * .16, 3, 1); }
  g.restore();
}

// ---------- the doctor: stork-thin, feet origin, facing left. Mortarboard, spectacles, stethoscope.
// o.bow 0..1, o.write 0..1 (bent over, quill down), o.scroll 0..1 (the diploma held out and unrolled) ----------
function r3aDoctor(g, x, y, k, o, pats) {
  g.save(); g.translate(x, y); g.scale(k, k);
  for (const s of [-1, 1]) { line(g, s * 10, -190, s * 12, -8); ink(g, 8); ell(g, s * 12 - 12, -4, 18, 6); fillWith(g, Cw(0)); }
  const bend = (o.write || 0) * .35 + (o.bow || 0) * .2;
  g.save(); g.translate(0, -190); g.rotate(-bend);
  // long black coat, tails
  g.beginPath(); g.moveTo(-24, -170); g.quadraticCurveTo(-34, -80, -30, 0); g.lineTo(-6, 6); g.lineTo(10, 70); g.lineTo(30, 66); g.lineTo(26, -60); g.quadraticCurveTo(30, -140, 22, -172); g.closePath();
  fillWith(g, WC.LG(g, -34, 0, 30, 0, [[0, .3], [.4, .06], [1, .02]], pats.coat)); ink(g, 3);
  pth(g, [[-14, -172], [10, -172], [0, -120]]); fillWith(g, Cw(1)); ink(g, 2);
  // stethoscope round the neck, the bell on the chest
  g.beginPath(); g.moveTo(-14, -166); g.quadraticCurveTo(-26, -110, -8, -100); ink(g, 3); g.beginPath(); g.moveTo(10, -166); g.quadraticCurveTo(16, -120, -2, -100); ink(g, 3);
  ell(g, -6, -94, 9, 9); fillWith(g, Cw(1)); ink(g, 3);
  // the arm: reaching forward (left), holding a scroll or a quill
  const sc = o.scroll || 0, wr = o.write || 0;
  limb(g, [[-12, -160], [-44, -120], [-74 - wr * 20, -126 + wr * 60]], 14);
  mitten(g, -78 - wr * 20, -128 + wr * 60, 9);
  if (wr > .05) { g.beginPath(); g.moveTo(-86 - wr * 20, -122 + wr * 60); g.quadraticCurveTo(-100 - wr * 20, -170 + wr * 60, -84 - wr * 20, -196 + wr * 60); g.quadraticCurveTo(-76 - wr * 20, -160 + wr * 60, -84 - wr * 20, -124 + wr * 60); g.closePath(); fillWith(g, Cw(1)); ink(g, 2.2); }
  if (sc > .05) { // the diploma: a scroll unrolling downward from the mitten, a red seal on a ribbon
    const L = 150 * sc;
    g.beginPath(); g.rect(-120, -136, 84, L); fillWith(g, Cw(1)); ink(g, 2.6);
    for (let i = 0; i < Math.floor(L / 22); i++) { line(g, -110, -112 + i * 22, -48, -112 + i * 22); ink(g, 1.6); }
    ell(g, -78, -136, 46, 8); fillWith(g, Cw(1)); ink(g, 2.6); ell(g, -78, -136 + L, 46, 8); fillWith(g, Cw(.8)); ink(g, 2.6);
    if (sc > .8) { line(g, -64, -136 + L, -56, -136 + L + 40); ink(g, 4); line(g, -64, -136 + L, -74, -136 + L + 42); ink(g, 4); waxSeal(g, -64, -136 + L + 6, 18); }
  }
  // head: long nose, spectacles, mortarboard with a tassel
  ell(g, -4, -200, 22, 27); fillWith(g, WC.LG(g, -22, 0, 24, 0, [[0, 1], [.6, 1], [1, .55]], pats.face)); ink(g, 3);
  g.beginPath(); g.moveTo(-20, -206); g.lineTo(-48, -192); g.lineTo(-20, -188); ink(g, 2.6);
  ell(g, -12, -206, 8, 7); ink(g, 2.4); ell(g, -12, -206, 2.4, 2.8); fillWith(g, Cw(0)); line(g, -4, -207, 14, -210); ink(g, 2);
  g.beginPath(); g.moveTo(-18, -182); g.lineTo(-6, -182); ink(g, 2.2);
  g.beginPath(); g.moveTo(-24, -218); g.lineTo(18, -218); g.lineTo(18, -232); g.lineTo(-24, -232); g.closePath(); fillWith(g, Cw(0));
  pth(g, [[-62, -236], [20, -248], [56, -232], [-26, -222]]); fillWith(g, Cw(0)); line(g, -56, -235, 50, -233); cutl(g, 1.6);
  ell(g, -2, -237, 4, 3); fillWith(g, Cw(1));
  g.beginPath(); g.moveTo(-2, -237); g.quadraticCurveTo(30, -236, 40, -200); ink(g, 2.4); ell(g, 40, -194, 4, 8); fillWith(g, Cw(0));
  g.restore();
  g.restore();
}

// ---------- an ink barrel lying on its side or standing (o.side), hoops cut; o.bung 0..1 popped ----------
function r3aBarrel(g, x, y, w, h, o, pats) {
  g.save(); g.translate(x, y);
  if (o.side) {
    g.beginPath(); g.moveTo(-w / 2, -h * .4); g.quadraticCurveTo(0, -h * .56, w / 2, -h * .4); g.lineTo(w / 2, h * .4); g.quadraticCurveTo(0, h * .56, -w / 2, h * .4); g.closePath();
    fillWith(g, WC.LG(g, 0, -h / 2, 0, h / 2, [[0, .15], [.35, .7], [1, .08]], pats.stave)); ink(g, 3.5);
    for (const hx of [-.36, -.24, .24, .36]) { g.beginPath(); g.moveTo(w * hx, -h * .5 + 4); g.quadraticCurveTo(w * hx * 1.04, 0, w * hx, h * .5 - 4); ink(g, 5); }
    ell(g, w / 2, 0, w * .12, h * .42); fillWith(g, WC.C(.75, pats.lid)); ink(g, 3.5); ell(g, w / 2, 0, w * .07, h * .3); ink(g, 1.6);
  } else {
    g.beginPath(); g.moveTo(-w * .42, -h / 2); g.quadraticCurveTo(-w * .56, 0, -w * .42, h / 2); g.lineTo(w * .42, h / 2); g.quadraticCurveTo(w * .56, 0, w * .42, -h / 2); g.closePath();
    fillWith(g, WC.LG(g, -w / 2, 0, w / 2, 0, [[0, .1], [.35, .72], [1, .06]], pats.stave)); ink(g, 3.5);
    for (const hy of [-.36, -.24, .24, .36]) { g.beginPath(); g.moveTo(-w * .46, h * hy); g.quadraticCurveTo(0, h * hy + 8, w * .46, h * hy); ink(g, 5); }
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * w * .12, -h / 2 + 4); g.quadraticCurveTo(i * w * .15, 0, i * w * .12, h / 2 - 4); ink(g, 1.4); }
    ell(g, 0, -h / 2, w * .42, h * .08); fillWith(g, WC.C(.75, pats.lid)); ink(g, 3);
    const b = o.bung || 0;
    ell(g, w * .1, -h / 2 - b * 40, w * .06, h * .03); fillWith(g, Cw(0));
  }
  g.restore();
}

// ---------- a swivel stool: a seat seen a little from above, a post, a foot. spin turns the seat's cut stripes;
// bright 0..1 turns its top from dark to bold white rays ----------
function r3aStool(g, x, y, r, spin, bright, pats) {
  g.beginPath(); g.ellipse(x, y + 4, r * .7, r * .16, 0, 0, TAU); fillWith(g, Cw(0));
  g.beginPath(); g.rect(x - 7, y - r * 1.5, 14, r * 1.5); fillWith(g, WC.LG(g, x - 7, 0, x + 7, 0, [[0, .1], [.4, .95], [1, .1]], pats.post)); ink(g, 2.4);
  const sy = y - r * 1.5;
  g.beginPath(); g.rect(x - r, sy, 2 * r, r * .26); fillWith(g, Cw(0)); g.beginPath(); g.ellipse(x, sy + r * .26, r, r * .3, 0, 0, Math.PI); fillWith(g, Cw(0));
  for (let i = 0; i < 8; i++) { const a = spin + i / 8 * TAU, c = Math.cos(a); if (Math.sin(a) < 0) continue; line(g, x + c * r, sy + 2, x + c * r, sy + r * .26 + Math.sin(a) * r * .3 - 2); cutl(g, 2); }
  g.beginPath(); g.ellipse(x, sy, r, r * .3, 0, 0, TAU); fillWith(g, Cw(lerp(.2, 1, bright))); ink(g, 3);
  if (bright > .02) for (let i = 0; i < 12; i += 2) { // bold sectors cut on the seat top: they turn as it spins
    const a0 = spin + i / 12 * TAU, a1 = a0 + TAU / 12;
    g.beginPath(); g.moveTo(x, sy); g.ellipse(x, sy, r * .96, r * .28, 0, a0, a1); g.closePath(); fillWith(g, Cw(0));
  }
  ell(g, x, sy, r * .14, r * .05); fillWith(g, Cw(1)); ink(g, 2);
}

// ---------- a balloon on a string: centre (x,y), sway ----------
function r3aBalloon(g, x, y, r, sway, tone, pats) {
  g.beginPath(); g.moveTo(x, y + r * 1.15); g.bezierCurveTo(x + 20 * sway, y + r * 2, x - 20 * sway, y + r * 2.8, x + 10 * sway, y + r * 3.6); ink(g, 2);
  ell(g, x, y, r * .86, r); fillWith(g, WC.RG(g, x - r * .3, y - r * .35, 2, x - r * .3, y - r * .35, r * 1.4, [[0, 1], [.3, tone + .2], [1, tone - .3]], pats.balloon)); ink(g, 3);
  pth(g, [[x - 6, y + r + 10], [x + 6, y + r + 10], [x, y + r - 2]]); fillWith(g, Cw(0));
  g.beginPath(); g.ellipse(x - r * .34, y - r * .4, r * .16, r * .28, .5, 0, TAU); fillWith(g, Cw(1));
}

// ---------- a big wallet: a leather purse with a stitched border and a clasp; a hinged lid that opens by lid 0..1;
// wheels 0..1 drop out underneath, rolling by roll ----------
function r3aWallet(g, x, y, w, h, o, pats) {
  g.save(); g.translate(x, y);
  const wh = o.wheels || 0;
  if (wh > 0) for (const wx of [-w * .32, w * .32]) {
    const r = h * .22 * wh, cy = h * .5 + r * .7;
    g.beginPath(); g.rect(wx - 8, h * .5 - 6, 16, r * .7 + 6); fillWith(g, Cw(0));
    ell(g, wx, cy, r, r); fillWith(g, Cw(0)); ell(g, wx, cy, r * .8, r * .8); cutl(g, 3);
    for (let i = 0; i < 6; i++) { const a = (o.roll || 0) + i / 6 * TAU; line(g, wx, cy, wx + Math.cos(a) * r * .78, cy + Math.sin(a) * r * .78); cutl(g, 3); }
    ell(g, wx, cy, r * .16, r * .16); fillWith(g, Cw(1)); ink(g, 2);
  }
  g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h * .16); fillWith(g, WC.LG(g, 0, -h / 2, 0, h / 2, [[0, .55], [.4, .25], [1, .05]], pats.leather)); ink(g, 5);
  g.setLineDash([10, 9]); g.beginPath(); g.roundRect(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32, h * .12); cutl(g, 2.6); g.setLineDash([]);
  // the lid: hinged at the back edge, opening upward
  const ld = o.lid || 0, la = ld * 1.15;
  g.save(); g.translate(-w / 2, -h / 2 + 2); g.rotate(-la);
  g.beginPath(); g.roundRect(0, -h * .08, w, h * .3, [h * .1, h * .1, h * .06, h * .06]); fillWith(g, WC.LG(g, 0, -h * .08, 0, h * .22, [[0, .65], [1, .15]], pats.leather)); ink(g, 4);
  g.setLineDash([8, 8]); g.beginPath(); g.moveTo(16, h * .06); g.lineTo(w - 16, h * .06); cutl(g, 2.2); g.setLineDash([]);
  // the clasp at the lid's front
  g.beginPath(); g.roundRect(w - 52, h * .1, 36, 30, 8); fillWith(g, Cw(1)); ink(g, 3); ell(g, w - 34, h * .1 + 15, 5, 5); fillWith(g, Cw(0));
  g.restore();
  if (ld > .15) { // inside: coin edges glinting
    for (let i = 0; i < 9; i++) { const cx = -w * .4 + i * w * .1; drawCoin(g, cx, -h / 2 + 10 - (i % 2) * 8, 14, 1.35, null); }
  }
  // a ratchet bracket at the side (the adjustable lid)
  g.beginPath(); g.moveTo(-w / 2 - 10, -h / 2 + 30); g.lineTo(-w / 2 - 10, -h / 2 - 30 * ld); ink(g, 6);
  for (let i = 0; i < 4; i++) { line(g, -w / 2 - 18, -h / 2 + 22 - i * 10, -w / 2 - 4, -h / 2 + 26 - i * 10); ink(g, 3); }
  g.restore();
}

// ---------- a plain paper cup (no marks on it): base at (x,y), a straw, o.fizz 0..1 bubbles rise; o.fill water line ----------
function r3aCup(g, x, y, h, o, pats, t) {
  const w0 = h * .32, w1 = h * .44;
  g.beginPath(); g.moveTo(x + w1 * .2, y - h - 4); g.lineTo(x + w1 * .5, y - h - h * .4); ink(g, 8); line(g, x + w1 * .2, y - h - 4, x + w1 * .5, y - h - h * .4); cutl(g, 2);
  pth(g, [[x - w1, y - h], [x + w1, y - h], [x + w0, y], [x - w0, y]]); fillWith(g, WC.LG(g, x - w1, 0, x + w1, 0, [[0, .55], [.4, .98], [1, .5]], pats.cup)); ink(g, 3);
  g.beginPath(); g.ellipse(x, y - h, w1, w1 * .18, 0, 0, TAU); fillWith(g, Cw(0)); ink(g, 3);
  for (const u of [.18, .82]) { line(g, x - lerp(w1, w0, u) + 3, y - h + u * h, x + lerp(w1, w0, u) - 3, y - h + u * h); ink(g, 2); }
  const fz = o.fizz || 0;
  if (fz > 0) for (let i = 0; i < 9; i++) { // bubbles climb out of the cup on a seeded path
    const ph = ((t * .9 + i * .37) % 1), bx = x + (rnd(i, 81) - .5) * w1 * 1.4 + Math.sin(t * 6 + i) * 6, by = y - h - ph * h * .9;
    ell(g, bx, by, 5 + 5 * rnd(i, 82), 5 + 5 * rnd(i, 82)); fillWith(g, Cw(1)); ink(g, 2 * fz);
  }
}

// ---------- fries: a plain carton with the sticks standing up; base centre ----------
function r3aFries(g, x, y, w, pats) {
  for (let i = 0; i < 7; i++) { const fx = x - w * .36 + i * w * .12, fh = w * (.5 + .25 * rnd(i, x)); g.save(); g.translate(fx, y - w * .5); g.rotate((i - 3) * .06); g.beginPath(); g.rect(-w * .045, -fh, w * .09, fh); fillWith(g, Cw(.9)); ink(g, 2); g.restore(); }
  pth(g, [[x - w * .5, y - w * .62], [x + w * .5, y - w * .62], [x + w * .38, y], [x - w * .38, y]]); fillWith(g, WC.LG(g, x - w * .5, 0, x + w * .5, 0, [[0, .2], [.45, .6], [1, .1]], pats.carton)); ink(g, 2.6);
  g.beginPath(); g.moveTo(x - w * .5, y - w * .62); g.quadraticCurveTo(x, y - w * .42, x + w * .5, y - w * .62); cutl(g, 2.4);
}

// ---------- a heart: centre, size; cut white with a black edge ----------
function r3aHeart(g, x, y, r, tone = 1) {
  g.beginPath(); g.moveTo(x, y + r * .9); g.bezierCurveTo(x - r * 1.4, y - r * .1, x - r * .6, y - r * 1.1, x, y - r * .4); g.bezierCurveTo(x + r * .6, y - r * 1.1, x + r * 1.4, y - r * .1, x, y + r * .9); g.closePath(); fillWith(g, Cw(tone)); ink(g, Math.max(1.5, r * .12));
}

// ---------- a little fly: body, two wings cut white ----------
function r3aFly(g, x, y, a, flap) {
  g.save(); g.translate(x, y); g.rotate(a);
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(-2, s * (6 + flap * 3), 9, 5, s * (.6 + flap * .4), 0, TAU); fillWith(g, Cw(1)); ink(g, 1.6); }
  ell(g, 0, 0, 9, 5); fillWith(g, Cw(0)); ell(g, 9, 0, 4, 4); fillWith(g, Cw(0));
  g.restore();
}

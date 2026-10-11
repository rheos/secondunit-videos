// Woodcut figures, painted into the tone map in block-local units.
// Every pattern is registered in BLOCK units (patterns ignore the canvas transform), so figures that are
// translated/scaled pass block coordinates for pattern centres via the map helpers.

const BW = 1240, BH = 590;

// ermine: white fur with little black tails, inside the current path (caller sets up clip)
function ermineSpots(g, x0, y0, x1, y1, step, seed) {
  for (let y = y0, r = 0; y < y1; y += step, r++) for (let x = x0 + (r % 2) * step / 2; x < x1; x += step) {
    const jx = (rnd(seed, x, y) - .5) * step * .2;
    g.fillStyle = Cw(0);
    g.beginPath(); g.moveTo(x + jx, y - 5); g.quadraticCurveTo(x + jx + 4, y + 2, x + jx, y + 7); g.quadraticCurveTo(x + jx - 4, y + 2, x + jx, y - 5); g.fill();
    g.fillRect(x + jx - 3.5, y - 7, 2, 2); g.fillRect(x + jx + 1.5, y - 7, 2, 2); g.fillRect(x + jx - 1, y - 9, 2, 2);
  }
}
function ermineFill(g, seed, step, x0, y0, x1, y1) {
  g.fillStyle = Cw(1); g.fill();
  g.save(); g.clip(); ermineSpots(g, x0, y0, x1, y1, step, seed); g.restore();
}

// ---------- the king (seated). origin = seat centre; sc = scale; (x,y) block coords of the origin ----------
function drawKing(g, P, x, y, sc, o = {}) {
  const X = (px) => x + px * sc, Y = (py) => y + py * sc;
  const pRobe = P.rad(X(-38), Y(-92), 7 * Math.max(.75, sc), { wob: .1, jit: .3 });
  const pSkirt = P.lin(90, 7, { wob: .2 });
  const pFace = P.blk(118, 7, { jit: .2 });
  const pBeard = P.dash(90, 6.5, 16, .72, { jit: .3 });
  g.save(); g.translate(x, y); g.scale(sc, sc);
  const bob = o.bob || 0;
  // feet / shoes
  for (const s of [-1, 1]) { ell(g, s * 34, 86, 30, 13); fillWith(g, Cw(0)); line(g, s * 34 - 18, 81, s * 34 + 10, 80); cutl(g, 2.5); }
  // skirt of the robe
  pth(g, [[-80, -6], [80, -6], [74, 80], [-74, 80]]); fillWith(g, WC.LG(g, 0, -6, 0, 80, [[0, .62], [1, .2]], pSkirt)); ink(g, 4);
  g.translate(0, bob);
  // sleeves (behind the body)
  for (const s of [-1, 1]) {
    ell(g, s * 92, -58, 34, 64, s * .38); fillWith(g, WC.LG(g, s * 60, -110, s * 120, -10, [[0, .7], [1, .18]], pSkirt)); ink(g, 4);
  }
  // body: round belly, cut in contour rings around the highlight
  ell(g, 0, -52, 100, 94); fillWith(g, WC.RG(g, -38, -92, 6, -38, -92, 150, [[0, .95], [.55, .5], [1, .1]], pRobe)); ink(g, 5);
  // ermine band down the front
  g.beginPath(); g.rect(-19, -132, 38, 136); ermineFill(g, 3, 20, -30, -140, 30, 10); ink(g, 3);
  // ermine cape over the shoulders
  g.beginPath(); g.moveTo(-104, -118); g.quadraticCurveTo(0, -160, 104, -118); g.quadraticCurveTo(84, -76, 52, -78); g.quadraticCurveTo(0, -96, -52, -78); g.quadraticCurveTo(-84, -76, -104, -118); g.closePath();
  ermineFill(g, 5, 21, -110, -160, 110, -70); ink(g, 4);
  // hands (mittens) resting on the belly
  const hands = o.hands || 'belly';
  for (const s of [-1, 1]) {
    let hx = s * 52, hy = -14;
    if (hands === 'knees') { hx = s * 64; hy = 12; }
    ell(g, s * 74, hy - 8, 20, 15, s * .5); ermineFill(g, 8 + s, 14, s * 74 - 24, hy - 26, s * 74 + 24, hy + 10); ink(g, 3);
    // mitten: a rounded paw with the thumb cut as one line
    g.beginPath(); g.roundRect(hx - 15, hy - 11, 30, 22, 10); fillWith(g, Cw(1)); ink(g, 3.5);
    g.beginPath(); g.moveTo(hx - s * 2, hy - 11); g.quadraticCurveTo(hx - s * 4, hy - 1, hx - s * 13, hy + 1); ink(g, 2.5);
  }
  // head
  const hy = -176;
  // hair at the sides, under the crown
  for (const s of [-1, 1]) { ell(g, s * 44, hy - 4, 16, 30, s * -.25); fillWith(g, WC.LG(g, 0, hy - 30, 0, hy + 30, [[0, .25], [1, .35]], pBeard)); ink(g, 2.5); }
  ell(g, 0, hy, 48, 52); fillWith(g, WC.LG(g, -48, 0, 48, 0, [[0, 1], [.45, 1], [1, .5]], pFace)); ink(g, 4.5);
  // beard
  g.beginPath(); g.moveTo(-46, hy + 6); g.quadraticCurveTo(-50, hy + 70, 0, hy + 92); g.quadraticCurveTo(50, hy + 70, 46, hy + 6);
  g.quadraticCurveTo(30, hy + 40, 0, hy + 38); g.quadraticCurveTo(-30, hy + 40, -46, hy + 6); g.closePath();
  fillWith(g, WC.LG(g, 0, hy + 10, 0, hy + 92, [[0, .45], [1, .2]], pBeard)); ink(g, 3);
  // mouth: a cut in the beard (smile or flat)
  g.beginPath();
  if (o.smile) { g.moveTo(-17, hy + 44); g.quadraticCurveTo(0, hy + 58, 17, hy + 44); } else { g.moveTo(-13, hy + 48); g.quadraticCurveTo(0, hy + 51, 13, hy + 48); }
  cutl(g, 5);
  // moustache
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(0, hy + 32); g.bezierCurveTo(s * 12, hy + 26, s * 26, hy + 30, s * 34, hy + 40); g.quadraticCurveTo(s * 40, hy + 30, s * 31, hy + 28); ink(g, 6); }
  // nose
  g.beginPath(); g.moveTo(-3, hy - 2); g.quadraticCurveTo(-6, hy + 12, -10, hy + 18); g.quadraticCurveTo(0, hy + 26, 10, hy + 18); ink(g, 3.5);
  // eyes and brows
  for (const s of [-1, 1]) {
    ell(g, s * 18, hy - 6, 6, 7); fillWith(g, Cw(0));
    ell(g, s * 18 - 2, hy - 8, 1.8, 1.8); fillWith(g, Cw(1));
    g.beginPath(); g.moveTo(s * 8, hy - 18); g.quadraticCurveTo(s * 18, hy - 26, s * 30, hy - 18); ink(g, 4.5);
  }
  // crown: the red accent
  const cy = hy - 40 - (o.crownUp || 0);
  g.beginPath(); g.moveTo(-46, cy + 16); g.lineTo(-46, cy - 36); g.lineTo(-24, cy - 10); g.lineTo(0, cy - 44); g.lineTo(24, cy - 10); g.lineTo(46, cy - 36); g.lineTo(46, cy + 16); g.closePath();
  fillWith(g, Cw(1, 0, 1)); ink(g, 3.5);
  g.beginPath(); g.rect(-46, cy, 92, 16); ink(g, 3);
  for (const [px, py] of [[-46, cy - 36], [0, cy - 44], [46, cy - 36]]) { ell(g, px, py - 5, 7, 7); fillWith(g, Cw(1, 0, 1)); ink(g, 2.5); }
  for (const px of [-28, 0, 28]) { ell(g, px, cy + 8, 5, 4); fillWith(g, Cw(1)); ink(g, 2); }
  g.restore();
}

// ---------- a shareholder: neck-base origin, facing 3/4 left. o.lift 0..1 (hat raised), o.smile 0..1, o.bow 0..1 ----------
function drawShareholder(g, P, x, y, k, o, pats) {
  g.save(); g.translate(x, y); g.scale(k, k);
  // shoulders: black coat with cut lapels
  g.beginPath(); g.moveTo(-74, 120); g.quadraticCurveTo(-76, 18, -20, 6); g.lineTo(20, 6); g.quadraticCurveTo(76, 18, 74, 120); g.closePath();
  fillWith(g, WC.LG(g, -70, 0, 70, 0, [[0, .3], [.4, .08], [1, .02]], pats.coat)); ink(g, 3);
  g.beginPath(); g.moveTo(-18, 8); g.lineTo(-4, 70); g.lineTo(-30, 120); cutl(g, 3);
  g.beginPath(); g.moveTo(18, 8); g.lineTo(4, 70); g.lineTo(30, 120); cutl(g, 3);
  pth(g, [[-16, 6], [16, 6], [6, 40], [-6, 40]]); fillWith(g, Cw(1)); ink(g, 2);
  // head (bows forward)
  g.save(); g.translate(0, 4 + (o.bow || 0) * 10); g.rotate(-(o.bow || 0) * .18);
  ell(g, 6, -10, 12, 14); fillWith(g, Cw(1)); ink(g, 2.5); // ear side
  ell(g, -2, -34, 30, 36); fillWith(g, WC.LG(g, -32, 0, 30, 0, [[0, 1], [.5, 1], [1, .55]], pats.face)); ink(g, 3.5);
  // side whisker
  g.beginPath(); g.moveTo(16, -40); g.quadraticCurveTo(30, -18, 18, -4); g.quadraticCurveTo(10, -20, 12, -38); g.closePath(); fillWith(g, Cw(0));
  // nose (pointing left), eye, brow
  g.beginPath(); g.moveTo(-18, -44); g.quadraticCurveTo(-36, -26, -22, -22); ink(g, 3);
  ell(g, -12, -46, 3.5, 4); fillWith(g, Cw(0));
  g.beginPath(); g.moveTo(-22, -56); g.quadraticCurveTo(-12, -60, -2, -55); ink(g, 3.5);
  // mouth: flat line, or a woodcut grin
  const sm = o.smile || 0;
  if (sm > .02) { // a wide woodcut grin: black crescent, a row of teeth cut white, cheeks pushed up
    g.beginPath(); g.moveTo(-30, -20 - sm * 3); g.quadraticCurveTo(-10, -16 + sm * 2, 12, -22 - sm * 4); g.quadraticCurveTo(-8, -14 + sm * 20, -30, -20 - sm * 3); g.closePath();
    fillWith(g, Cw(0));
    g.beginPath(); g.moveTo(-25, -18); g.quadraticCurveTo(-9, -12 + sm * 3, 7, -19); cutl(g, 3.4 * sm);
    for (const cx of [-30, 12]) { g.beginPath(); g.arc(cx, -26 - sm * 3, 5, .3, 2.6); ink(g, 2.4); }
  } else { g.beginPath(); g.moveTo(-22, -14); g.lineTo(-4, -15); ink(g, 3); }
  // top hat (lifted by a mitten when greeting)
  const L = o.lift || 0;
  g.save(); g.translate(-4, -66 - L * 58); g.rotate(-L * .5);
  pth(g, [[-27, 0], [27, 0], [24, -84], [-24, -84]]); fillWith(g, WC.LG(g, -27, 0, 27, 0, [[0, .05], [.3, .55], [.45, .1], [1, 0]], pats.hat)); ink(g, 3);
  g.beginPath(); g.rect(-26, -18, 52, 9); fillWith(g, Cw(0)); line(g, -24, -19, 24, -19); cutl(g, 2);
  ell(g, 0, 1, 40, 8); fillWith(g, Cw(0)); g.beginPath(); g.ellipse(0, 0, 38, 6, 0, 0, Math.PI); cutl(g, 1.8);
  if (L > .05) { ell(g, -38, -2, 15, 12, -.4); fillWith(g, Cw(1)); ink(g, 3); }
  g.restore();
  g.restore();
  g.restore();
}

// ---------- coin (seen at an angle, spinning) ----------
function drawCoin(g, x, y, r, spin, pEdge) {
  const c = Math.cos(spin), rx = r * Math.max(.12, Math.abs(c));
  const th = r * .16 * Math.abs(Math.sin(spin));
  if (th > 1) { g.beginPath(); g.rect(x - rx, y, 2 * rx, 0); ell(g, x + th * Math.sign(Math.sin(spin) || 1), y, rx, r); fillWith(g, pEdge ? WC.C(.45, pEdge) : Cw(0)); ink(g, 2.5); }
  ell(g, x, y, rx, r); fillWith(g, Cw(1)); ink(g, 3);
  if (rx > 6) { ell(g, x, y, rx * .74, r * .74); ink(g, 1.6); coinCrown(g, x, y, rx * .42, r * .42); }
}
// a little crown struck on the coin (not an eye: no dot in the middle)
function coinCrown(g, x, y, w, h) {
  g.beginPath(); g.moveTo(x - w, y + h * .6); g.lineTo(x - w, y - h * .5); g.lineTo(x - w * .5, y); g.lineTo(x, y - h * .8); g.lineTo(x + w * .5, y); g.lineTo(x + w, y - h * .5); g.lineTo(x + w, y + h * .6); g.closePath(); fillWith(g, Cw(0));
}
// stacked coin seen from slightly above: edge band milled, top face
function drawStackCoin(g, x, y, rx, ry, th, pMill, face) {
  g.beginPath(); g.moveTo(x - rx, y); g.lineTo(x - rx, y + th); g.ellipse(x, y + th, rx, ry, 0, Math.PI, 0, true); g.lineTo(x + rx, y); g.closePath();
  fillWith(g, WC.LG(g, x - rx, 0, x + rx, 0, [[0, .15], [.35, .75], [1, .1]], pMill)); ink(g, 2.5);
  ell(g, x, y, rx, ry); fillWith(g, Cw(1)); ink(g, 3);
  if (face) { ell(g, x, y, rx * .74, ry * .72); ink(g, 1.8); coinCrown(g, x, y, rx * .3, ry * .5); }
}

// ---------- money sack ----------
function drawSack(g, P, cx, by, w, h, pat, open) {
  const top = by - h, nw = w * .2;
  g.beginPath(); g.moveTo(cx - nw, top + h * .16);
  g.bezierCurveTo(cx - w * .7, top + h * .3, cx - w * .62, by, cx - w * .3, by);
  g.lineTo(cx + w * .3, by);
  g.bezierCurveTo(cx + w * .62, by, cx + w * .7, top + h * .3, cx + nw, top + h * .16); g.closePath();
  fillWith(g, WC.RG(g, cx - w * .2, top + h * .45, 4, cx - w * .2, top + h * .45, w * .75, [[0, .97], [.6, .45], [1, .08]], pat)); ink(g, 4.5);
  // the ruffled mouth of the sack above the tie
  const fl = open ? 1.6 : 1;
  g.beginPath(); g.moveTo(cx - nw, top + h * .16);
  for (let k = 0; k <= 6; k++) { const u = k / 6, xx = cx - nw * fl * 1.5 + u * nw * fl * 3; g.lineTo(xx, top + (k % 2 ? h * .02 : -h * .03) * fl); }
  g.lineTo(cx + nw, top + h * .16); g.closePath(); fillWith(g, Cw(.88)); ink(g, 3);
  for (let k = 1; k < 6; k++) { line(g, cx - nw * fl * 1.5 + k / 6 * nw * fl * 3, top + h * .01, cx - nw * .8 + k / 6 * nw * 1.6, top + h * .14); ink(g, 1.6); }
  // tie
  g.beginPath(); g.rect(cx - nw * 1.05, top + h * .13, nw * 2.1, h * .06); fillWith(g, Cw(0)); line(g, cx - nw, top + h * .16, cx + nw, top + h * .16); cutl(g, 2);
  g.beginPath(); g.moveTo(cx + nw, top + h * .16); g.quadraticCurveTo(cx + nw * 2.2, top + h * .2, cx + nw * 2, top + h * .34); ink(g, 4);
  // a stitched seam and a round coin mark cut into the cloth
  g.setLineDash([6, 7]); g.beginPath(); g.moveTo(cx - w * .48, by - h * .25); g.quadraticCurveTo(cx, by - h * .12, cx + w * .48, by - h * .25); ink(g, 2); g.setLineDash([]);
  ell(g, cx + w * .02, top + h * .55, w * .17, w * .17); fillWith(g, Cw(1)); ink(g, 3.5); ell(g, cx + w * .02, top + h * .55, w * .1, w * .1); ink(g, 2);
}

// ---------- the man in the frock coat (feet origin, facing left). o.hop, o.armsUp ----------
function drawFrockMan(g, P, x, y, k, o, pats) {
  g.save(); g.translate(x, y - (o.hop || 0)); g.scale(k, k);
  // legs
  for (const s of [-1, 1]) {
    pth(g, [[s * 12 - 9, -100], [s * 12 + 9, -100], [s * 12 + 8, -6], [s * 12 - 8, -6]]); fillWith(g, WC.C(.55, pats.legs)); ink(g, 2.5);
    ell(g, s * 12 - 8, -3, 15, 7); fillWith(g, Cw(0));
  }
  // coat: black, cut folds, tails behind (right)
  g.beginPath(); g.moveTo(-30, -192); g.quadraticCurveTo(-40, -150, -34, -96); g.lineTo(6, -92); g.lineTo(22, -30); g.lineTo(44, -34); g.lineTo(38, -110); g.quadraticCurveTo(40, -170, 26, -194); g.closePath();
  fillWith(g, WC.LG(g, -40, 0, 44, 0, [[0, .32], [.35, .08], [1, .03]], pats.coat)); ink(g, 3);
  for (const [a, b, c, d] of [[-18, -170, -14, -104], [8, -160, 14, -100], [28, -120, 34, -44]]) { gouge(g, a, b, c, d, 2.4, 1, 2); }
  // shirt front and cravat
  pth(g, [[-18, -194], [8, -194], [-2, -150], [-14, -160]]); fillWith(g, Cw(1)); ink(g, 2);
  g.beginPath(); g.moveTo(-14, -190); g.lineTo(-24, -182); g.lineTo(-14, -176); g.lineTo(-6, -184); g.lineTo(4, -178); g.lineTo(2, -190); g.closePath(); fillWith(g, Cw(1)); ink(g, 2);
  // arms: down at the sides, or thrown up in surprise
  const up = o.armsUp || 0;
  for (const s of [-1, 1]) {
    // upper arm swings out, forearm folds up: hands open beside the head in surprise
    const a1 = -s * (.1 + up * 1.3), a2 = -s * up * 1.9;
    g.save(); g.translate(s * 26, -184); g.rotate(a1);
    pth(g, [[-9, 0], [9, 0], [8, 46], [-8, 46]]); fillWith(g, Cw(.06)); ink(g, 2.5);
    g.translate(0, 44); g.rotate(a2);
    pth(g, [[-8, 0], [8, 0], [7, 40], [-7, 40]]); fillWith(g, Cw(.06)); ink(g, 2.5);
    g.beginPath(); g.roundRect(-9, 38, 18, 20, 8); fillWith(g, Cw(1)); ink(g, 2.5);
    g.restore();
  }
  // head, facing left
  ell(g, 6, -222, 9, 11); fillWith(g, Cw(1)); ink(g, 2);
  ell(g, -2, -226, 24, 29); fillWith(g, WC.LG(g, -26, 0, 24, 0, [[0, 1], [.55, 1], [1, .55]], pats.face)); ink(g, 3);
  g.beginPath(); g.moveTo(-22, -244); g.quadraticCurveTo(-6, -268, 22, -246); g.quadraticCurveTo(26, -226, 16, -214); g.quadraticCurveTo(10, -236, -4, -246); g.closePath(); fillWith(g, Cw(0));
  g.beginPath(); g.moveTo(14, -230); g.quadraticCurveTo(26, -210, 14, -200); g.quadraticCurveTo(8, -214, 10, -228); g.closePath(); fillWith(g, Cw(0));
  g.beginPath(); g.moveTo(-20, -232); g.quadraticCurveTo(-32, -218, -20, -214); ink(g, 2.5);
  ell(g, -12, -234, 3, 3.5); fillWith(g, Cw(0));
  if (up > .3) { ell(g, -18, -208, 4, 5); fillWith(g, Cw(0)); } else { line(g, -20, -207, -8, -208); ink(g, 2.5); }
  g.restore();
}

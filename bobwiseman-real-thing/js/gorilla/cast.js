// Real Thing: the gorilla and the monkey, drawn as whole poses (see kit.js for ol/ell/limb).
'use strict';
// ---------------------------------------------------------------- the gorilla
const FUR = '#3e3735', FUR2 = '#2e2827', FACE = '#9b8676', BELLY = '#6f625a';
// face expressions: eyes 'open'|'happy'|'squint'|'cross'|'half'|'shut', brow -1 sad .. 0 .. 1 cross, mouth 'smile'|'grin'|'grit'|'o'|'flat'|'frown'|'chew'
function gorilla(g, x, y, s, P) {
  P = Object.assign({ lean: 0, squash: 0, sit: false, lie: false, look: [0, 0], eyes: 'open', brow: 0, mouth: 'flat', tilt: 0,
    handL: [-.55, -.25], handR: [.55, -.25], bendL: -30, bendR: 30, front: null, sweat: 0, flip: 1,
    fur: FUR, fur2: FUR2, face: FACE, bellyCol: BELLY, muzzle: '#ad9787' }, P);
  // P.fur / fur2 / face / bellyCol / muzzle recolour him (her: lighter, warmer fur)
  g.save(); g.translate(x, y); g.scale(s * P.flip, s * (1 - P.squash)); g.scale(1, 1);
  const k = 1 / s, LWs = LW / sc(g); // outline weight in body units
  // on his back: body +x points up the screen, so a hand at body (.6, -.68) is held up to the sky
  if (P.lie) { g.translate(0, -.4); g.rotate(-Math.PI / 2 * .92); }
  g.rotate(P.lean);
  // ground shadow
  if (!P.lie) { g.save(); g.globalAlpha = .22; g.fillStyle = '#20301c'; g.beginPath(); g.ellipse(0, 4 * k, .55, .07, 0, 0, TAU); g.fill(); g.restore(); }
  const W2 = (w) => w; // widths are in body units
  // back arm (left)
  const shL = [-.27, -.62], shR = [.27, -.62];
  const lw = (u) => u; g.lineWidth = LWs;
  const tube = (p0, p1, bend, w, col) => {
    const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy) || 1;
    const b = bend / 300, cx = mx - dy / L * b, cy = my + dx / L * b;
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo(cx, cy, p1[0], p1[1]); g.strokeStyle = INK; g.lineWidth = w + LWs * 2; g.stroke();
    g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo(cx, cy, p1[0], p1[1]); g.strokeStyle = col; g.lineWidth = w; g.stroke();
  };
  const olk = (path, fill) => ol(g, path, fill, LW);
  const mitt = (p) => olk(ell(g, p[0], p[1], .085, .075), P.fur);
  tube(shL, P.handL, P.bendL, .12, P.fur); mitt(P.handL);
  // legs
  if (P.sit) {
    tube([-.16, -.12], [-.36, -.02], 10, .14, P.fur); tube([.16, -.12], [.36, -.02], -10, .14, P.fur);
    olk(ell(g, -.42, -.03, .1, .06), P.fur2); olk(ell(g, .42, -.03, .1, .06), P.fur2);
  } else {
    tube([-.15, -.2], [-.18, -.04], 0, .15, P.fur); tube([.15, -.2], [.18, -.04], 0, .15, P.fur);
    olk(ell(g, -.21, -.03, .12, .055), P.fur2); olk(ell(g, .21, -.03, .12, .055), P.fur2);
  }
  // body: a pear, then the belly patch
  olk(() => { g.moveTo(0, -.78); g.bezierCurveTo(.38, -.8, .44, -.12, .26, -.1); g.quadraticCurveTo(0, -.04, -.26, -.1); g.bezierCurveTo(-.44, -.12, -.38, -.8, 0, -.78); }, P.fur);
  g.beginPath(); g.ellipse(0, -.36, .19, .22, 0, 0, TAU); g.fillStyle = P.bellyCol; g.fill();
  if (P.belly) { g.save(); g.globalAlpha = P.belly; g.strokeStyle = INK; g.lineWidth = LWs * .7; for (const r0 of [.27, .33]) { g.beginPath(); g.arc(.0, -.36, r0, -.5, .5); g.stroke(); g.beginPath(); g.arc(0, -.36, r0, Math.PI - .5, Math.PI + .5); g.stroke(); } g.restore(); }
  // head (big): crest, face mask, features
  g.save(); g.translate(0, -.84); g.rotate(P.tilt);
  olk(() => { g.moveTo(-.29, .02); g.bezierCurveTo(-.33, -.3, -.1, -.37, 0, -.36); g.bezierCurveTo(.1, -.37, .33, -.3, .29, .02); g.bezierCurveTo(.3, .22, -.3, .22, -.29, .02); }, P.fur);
  olk(() => { g.moveTo(-.2, -.06); g.bezierCurveTo(-.22, -.18, -.04, -.17, 0, -.1); g.bezierCurveTo(.04, -.17, .22, -.18, .2, -.06); g.bezierCurveTo(.24, .17, -.24, .17, -.2, -.06); }, P.face);
  const lx = P.look[0] * .03, ly = P.look[1] * .025;
  for (const ex of [-.085, .085]) {
    if (P.eyes === 'open' || P.eyes === 'cross') {
      olk(ell(g, ex, -.06, .052, .058), '#fbf6ea');
      const px = P.eyes === 'cross' ? -Math.sign(ex) * .022 : lx;
      g.beginPath(); g.ellipse(ex + px, -.055 + ly, .024, .028, 0, 0, TAU); g.fillStyle = INK; g.fill();
      g.beginPath(); g.arc(ex + px + .008, -.066 + ly, .008, 0, TAU); g.fillStyle = '#fff'; g.fill();
    } else if (P.eyes === 'half') {
      olk(() => { g.moveTo(ex - .05, -.055); g.quadraticCurveTo(ex, -.005, ex + .05, -.055); g.closePath(); }, '#fbf6ea');
      g.beginPath(); g.arc(ex + lx, -.04, .018, 0, TAU); g.fillStyle = INK; g.fill();
    } else {
      g.beginPath();
      if (P.eyes === 'happy') { g.moveTo(ex - .045, -.045); g.quadraticCurveTo(ex, -.1, ex + .045, -.045); }
      else if (P.eyes === 'squint') { g.moveTo(ex - .048, -.07 + (ex < 0 ? -.012 : .012)); g.lineTo(ex + .048, -.07 + (ex < 0 ? .012 : -.012)); g.moveTo(ex - .044, -.035); g.quadraticCurveTo(ex, -.05, ex + .044, -.035); }
      else { g.moveTo(ex - .045, -.06); g.quadraticCurveTo(ex, -.035, ex + .045, -.06); }
      g.strokeStyle = INK; g.lineWidth = LWs * 1.1; g.lineCap = 'round'; g.stroke();
    }
  }
  // brow ridge
  g.beginPath(); g.moveTo(-.16, -.13 - P.brow * -.0 + (P.brow < 0 ? -.01 : 0)); g.quadraticCurveTo(-.08, -.16 + P.brow * .035, -.01, -.12 + P.brow * .03);
  g.moveTo(.16, -.13 + (P.brow < 0 ? -.01 : 0)); g.quadraticCurveTo(.08, -.16 + P.brow * .035, .01, -.12 + P.brow * .03);
  g.strokeStyle = P.fur2; g.lineWidth = .035; g.lineCap = 'round'; g.stroke();
  // muzzle, nostrils
  olk(ell(g, 0, .055, .115, .075), P.muzzle);
  g.fillStyle = INK; for (const nx of [-.025, .025]) { g.beginPath(); g.ellipse(nx, .03, .012, .009, 0, 0, TAU); g.fill(); }
  // mouth
  g.strokeStyle = INK; g.lineWidth = LWs; g.lineCap = 'round'; g.beginPath();
  const m = P.mouth;
  if (m === 'smile') { g.moveTo(-.05, .075); g.quadraticCurveTo(0, .11, .05, .075); g.stroke(); }
  else if (m === 'grin') { olk(() => { g.moveTo(-.065, .07); g.quadraticCurveTo(0, .14, .065, .07); g.closePath(); }, '#7a2f2a'); }
  else if (m === 'grit') { olk(() => { g.rect(-.06, .065, .12, .04); }, '#fbf6ea'); g.beginPath(); for (const tx of [-.03, 0, .03]) { g.moveTo(tx, .065); g.lineTo(tx, .105); } g.moveTo(-.06, .085); g.lineTo(.06, .085); g.lineWidth = LWs * .6; g.stroke(); }
  else if (m === 'o') { olk(ell(g, 0, .09, .025, .03), '#5a2421'); }
  else if (m === 'frown') { g.moveTo(-.045, .1); g.quadraticCurveTo(0, .07, .045, .1); g.stroke(); }
  else if (m === 'chew') { g.moveTo(-.04, .085); g.quadraticCurveTo(0, .07 + Math.sin(P.chew || 0) * .02, .04, .085); g.stroke(); }
  else { g.moveTo(-.04, .085); g.lineTo(.04, .085); g.stroke(); }
  if (P.sweat > 0) { g.save(); g.globalAlpha = P.sweat; olk(() => { g.moveTo(.27, -.2); g.quadraticCurveTo(.32, -.12, .27, -.1); g.quadraticCurveTo(.22, -.12, .27, -.2); }, '#bfe7f5'); g.restore(); }
  g.restore();
  // front arm (right) and whatever it holds
  if (P.front) P.front(g, k);
  tube(shR, P.handR, P.bendR, .12, P.fur); mitt(P.handR);
  if (P.after) P.after(g, k);
  g.restore();
}

// ---------------------------------------------------------------- the monkey (small capuchin)
function monkey(g, x, y, s, P) {
  P = Object.assign({ eyes: 'open', mouth: 'smile', look: [0, 0], handL: [-.3, -.45], handR: [.3, -.5], tail: 0, chew: 0, tilt: 0 }, P);
  g.save(); g.translate(x, y); g.scale(s, s); const k = 1 / s, LWs = LW / sc(g);
  const olk = (p, f) => ol(g, p, f, LW), BR = '#8a5a35', CR = '#efd7b0';
  g.lineCap = 'round';
  // tail curling down from the branch
  g.beginPath(); g.moveTo(-.12, -.12); g.bezierCurveTo(-.5, .1, -.55, .65 + P.tail * .05, -.25, .7); g.bezierCurveTo(-.05, .74, -.08, .55, -.2, .55);
  g.strokeStyle = INK; g.lineWidth = .07 + LWs * 2; g.stroke(); g.strokeStyle = BR; g.lineWidth = .07; g.stroke();
  // legs dangling
  for (const [a, b] of [[[-.08, -.08], [-.1, .2]], [[.08, -.08], [.12, .2]]]) { g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.strokeStyle = INK; g.lineWidth = .08 + LWs * 2; g.stroke(); g.strokeStyle = BR; g.lineWidth = .08; g.stroke(); }
  olk(() => { g.ellipse(0, -.25, .17, .2, 0, 0, TAU); }, BR);
  g.beginPath(); g.ellipse(0, -.22, .1, .13, 0, 0, TAU); g.fillStyle = CR; g.fill();
  const arm = (sh, h) => { g.beginPath(); g.moveTo(...sh); g.quadraticCurveTo((sh[0] + h[0]) / 2 + .05, (sh[1] + h[1]) / 2 + .08, h[0], h[1]); g.strokeStyle = INK; g.lineWidth = .07 + LWs * 2; g.stroke(); g.strokeStyle = BR; g.lineWidth = .07; g.stroke(); olk(ell(g, h[0], h[1], .045, .04), CR); };
  arm([-.12, -.36], P.handL);
  g.save(); g.translate(0, -.55); g.rotate(P.tilt);
  olk(ell(g, 0, 0, .2, .18), BR);
  for (const ex of [-.19, .19]) olk(ell(g, ex, -.01, .055, .06), CR);
  olk(() => { g.moveTo(-.13, -.02); g.bezierCurveTo(-.15, -.14, .15, -.14, .13, -.02); g.bezierCurveTo(.16, .15, -.16, .15, -.13, -.02); }, CR);
  for (const ex of [-.055, .055]) {
    if (P.eyes === 'happy') { g.beginPath(); g.moveTo(ex - .03, -.02); g.quadraticCurveTo(ex, -.06, ex + .03, -.02); g.strokeStyle = INK; g.lineWidth = LWs; g.stroke(); }
    else { g.beginPath(); g.ellipse(ex + P.look[0] * .015, -.03 + P.look[1] * .012, .02, .024, 0, 0, TAU); g.fillStyle = INK; g.fill(); g.beginPath(); g.arc(ex + P.look[0] * .015 + .006, -.04 + P.look[1] * .012, .006, 0, TAU); g.fillStyle = '#fff'; g.fill(); }
  }
  g.beginPath(); g.ellipse(0, .03, .012, .008, 0, 0, TAU); g.fillStyle = INK; g.fill();
  g.beginPath(); if (P.mouth === 'chew') { g.moveTo(-.035, .07); g.quadraticCurveTo(0, .06 + Math.sin(P.chew) * .02, .035, .07); } else { g.moveTo(-.035, .06); g.quadraticCurveTo(0, .09, .035, .06); }
  g.strokeStyle = INK; g.lineWidth = LWs; g.stroke();
  g.restore();
  if (P.hold) P.hold(g, k);
  arm([.12, -.36], P.handR);
  g.restore();
}


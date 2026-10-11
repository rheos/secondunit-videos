// Figures, painted in tone. Every figure is a stylised stand-in (no likeness of any real person).
// Light: L = unit vector (screen) pointing toward the key light; la = how hard the light models the form (0..1).

// ---------- a head ----------
// r = half the head height. o: turn (-1 left .. 1 right), tilt (radians), skin, hair, style
// ('girl' bob with fringe, 'boy' short crop, 'old' bald with white side hair + mustache, 'woman' short dark curls),
// eyes (0 closed .. 1 open), look [x, y] (-1..1), mouth (0..1), L, la, brows (0 calm, 1 lifted)
function drawHead(g, x, y, r, o = {}) {
  const turn = o.turn || 0, L = o.L || [-.8, -.6], la = o.la ?? .6, skin = o.skin ?? .76, hair = o.hair ?? .1;
  const st = o.style || 'girl', eyes = o.eyes ?? 1, look = o.look || [0, 0];
  g.save(); if (o.soft) g.filter = `blur(${o.soft.toFixed(2)}px)`; g.translate(x, y); g.rotate(o.tilt || 0); g.scale(r, r);
  const fx = turn * .1, back = -turn, lift = o.lift || 0;
  if (st === 'old') { // white hair combed back, behind the head
    g.fillStyle = radG(g, back * .2, -.4, .1, 1.2, [[0, .62], [.7, .4], [1, .22]], L[0] * .4, L[1] * .4);
    g.beginPath(); g.moveTo(-.92 + back * .1, .3); g.bezierCurveTo(-1.1, -.5, -.8, -1.12, back * .08, -1.12); g.bezierCurveTo(.8, -1.12, 1.1, -.5, .92 + back * .1, .3); g.closePath(); g.fill();
  } // the back of the head is opposite the turn
  // hair mass behind
  if (st === 'girl') {
    g.fillStyle = radG(g, back * .2, -.3, .1, 1.3, [[0, hair + .12], [.7, hair], [1, hair * .6]], L[0] * .4, L[1] * .4);
    g.beginPath(); g.moveTo(-.95 + back * .12, .55); g.bezierCurveTo(-1.18 + back * .15, -.2, -.9, -1.12, back * .1, -1.12);
    g.bezierCurveTo(.9, -1.12, 1.18 + back * .15, -.2, .95 + back * .12, .55); g.quadraticCurveTo(back * .1, .7, -.95 + back * .12, .55); g.fill();
  } else if (st === 'woman') {
    g.fillStyle = radG(g, back * .2, -.35, .1, 1.25, [[0, hair + .14], [.7, hair], [1, hair * .6]], L[0] * .4, L[1] * .4);
    g.beginPath();
    for (let i = 0; i <= 18; i++) { const a = Math.PI * (.92 + i / 18 * 1.16), rr = 1.08 + .07 * Math.sin(i * 2.6); g.lineTo(back * .16 + Math.cos(a) * rr * .98, -.22 + Math.sin(a) * rr); }
    g.lineTo(.86 + back * .15, .2); g.quadraticCurveTo(back * .2, .05, -.86 + back * .15, .2); g.fill();
  }
  // neck
  g.fillStyle = linG(g, -.3, 0, .3, 0, [[0, skin - .02], [1, skin - .2]]);
  g.fillRect(-.28 + fx * .5, .6, .52, .75);
  // ear on the side away from the turn
  if (Math.abs(turn) > .15) { g.fillStyle = radG(g, back * .74, .08, .02, .2, [[0, skin + .04], [1, skin - .2]]); ell(g, back * .74, .08, .13, .2); g.fill(); }
  // face oval, modelled toward the light
  const rx = (st === 'girl' || st === 'boy' ? .86 : st === 'woman' ? .8 : .76) - Math.abs(turn) * .05;
  g.beginPath(); g.moveTo(fx, -1);
  g.bezierCurveTo(fx + rx * 1.05, -1, fx + rx * 1.12, -.25, fx + rx * .95, .3);
  g.bezierCurveTo(fx + rx * .75, .8, fx + rx * .3, 1, fx + turn * .08, 1);
  g.bezierCurveTo(fx - rx * .3, 1, fx - rx * .75, .8, fx - rx * .95, .3);
  g.bezierCurveTo(fx - rx * 1.12, -.25, fx - rx * 1.05, -1, fx, -1); g.closePath();
  g.fillStyle = radG(g, fx, 0, .05, 1.2, [[0, skin + .16 * la], [.5, skin + .02], [1, skin - .34 * la]], L[0] * .5, L[1] * .45);
  g.fill();
  g.save(); g.clip();
  // shade on the side away from the light, and under the jaw
  g.fillStyle = linG(g, -L[0] * .2, 0, -L[0] * 1, 0, [[0, 0, 0], [1, 0, .35 * la]]); g.fillRect(-1.5, -1.5, 3, 3);
  if (o.hatShadow) { g.fillStyle = linG(g, 0, -1, 0, -.15, [[0, 0, .75], [.7, 0, .35], [1, 0, 0]]); g.fillRect(-1.5, -1.5, 3, 1.4); }
  // cheeks: a little warmth of light
  g.fillStyle = gv(1, .06 + .06 * la); ell(g, fx + turn * .3 - .38, .32, .2, .14); g.fill(); ell(g, fx + turn * .3 + .38, .32, .2, .14); g.fill();
  g.restore();
  // eyes
  const kid = st === 'girl' || st === 'boy', ex0 = turn * .36, sep = kid ? .33 : .31, ey = (kid ? .06 : -.04) + (st === 'old' ? -.04 : 0) - lift * .18;
  const EW = { girl: .13, boy: .12, woman: .145, old: .14, man: .12 }[st] || .13, EH = { girl: .085, boy: .068, woman: .095, old: .07, man: .07 }[st] || .08;
  for (const side of [-1, 1]) {
    const fore = 1 - Math.max(0, side * -turn) * .5; // the far eye foreshortens
    const ex = ex0 + side * sep * (1 - Math.abs(turn) * .2) * (side * turn < 0 ? fore : 1);
    const w = EW * fore, h = EH;
    g.fillStyle = gv(0, .09 * (.5 + la)); ell(g, ex, ey - .03, w * 1.4, h * 1.8); g.fill(); // socket shade
    if (eyes > .12) {
      const oh = h * eyes;
      g.save(); g.beginPath(); g.moveTo(ex - w, ey); g.quadraticCurveTo(ex, ey - oh * 2, ex + w, ey); g.quadraticCurveTo(ex, ey + oh * 1.25, ex - w, ey); g.closePath();
      g.fillStyle = gv(skin + .1); g.fill(); g.clip();
      const ix = ex + look[0] * w * .55, iy = ey - oh * .2 + look[1] * oh * .5;
      g.fillStyle = radG(g, ix, iy, .005, h * .95, [[0, .32], [1, .06]]); ell(g, ix, iy, h * .92, h * .92); g.fill();
      g.fillStyle = gv(.02); ell(g, ix, iy, h * .42, h * .42); g.fill();
      g.fillStyle = gv(1, .95); ell(g, ix + L[0] * h * .35, iy + L[1] * h * .35 - h * .1, h * .2, h * .2); g.fill();
      g.fillStyle = gv(0, .18); g.fillRect(ex - w * 1.2, ey - oh * 2.2, w * 2.4, oh * .9); // lid shadow on the eyeball
      g.restore();
      g.strokeStyle = gv(.08); g.lineWidth = st === 'boy' || st === 'old' ? .028 : .036; g.lineCap = 'round';
      g.beginPath(); g.moveTo(ex - w * 1.08, ey + .01); g.quadraticCurveTo(ex, ey - oh * 2.05, ex + w * 1.08, ey - .01); g.stroke();
    } else {
      g.strokeStyle = gv(.12); g.lineWidth = .03; g.lineCap = 'round';
      g.beginPath(); g.moveTo(ex - w, ey - .01); g.quadraticCurveTo(ex, ey + h * .9, ex + w, ey - .01); g.stroke();
    }
    // brow
    const bl = o.brows || 0;
    g.strokeStyle = gv(st === 'old' ? .85 : hair + .04, .85); g.lineWidth = st === 'old' ? .07 : st === 'boy' ? .055 : .04;
    g.beginPath(); g.moveTo(ex - w * 1.15, ey - .2 + (side < 0 ? 0 : -bl * .06)); g.quadraticCurveTo(ex, ey - .3 - bl * .05, ex + w * 1.15, ey - .2 + (side > 0 ? 0 : -bl * .06)); g.stroke();
  }
  // nose: shade on the side away from the light, a soft tip highlight
  const nx = turn * .5, ny = (kid ? .36 : .3) - lift * .12;
  g.fillStyle = gv(0, .12 * (.4 + la)); ell(g, nx - L[0] * .06, ny + .03, .05, .09, -turn * .3); g.fill();
  g.fillStyle = gv(1, .14); ell(g, nx + L[0] * .04, ny - .02, .05, .05); g.fill();
  g.fillStyle = gv(.1, .5); ell(g, nx - .04 + turn * .03, ny + .1, .025, .018); g.fill(); ell(g, nx + .05 + turn * .03, ny + .1, .025, .018); g.fill();
  // mouth
  const mx = turn * .42, my = (kid ? .62 : .58) - lift * .15, mo = clamp(o.mouth || 0);
  if (st === 'old') {
    // white mustache over the mouth
    g.fillStyle = radG(g, mx, my - .06, .02, .4, [[0, .95], [1, .7]], L[0] * .1, -.05);
    g.beginPath(); g.moveTo(mx, my - .14); g.bezierCurveTo(mx + .25, my - .2, mx + .42, my - .05, mx + .48, my + .1); g.bezierCurveTo(mx + .3, my + .02, mx + .12, my + .02, mx, my - .02);
    g.bezierCurveTo(mx - .12, my + .02, mx - .3, my + .02, mx - .48, my + .1); g.bezierCurveTo(mx - .42, my - .05, mx - .25, my - .2, mx, my - .14); g.fill();
  } else {
    g.fillStyle = gv(skin - .2, .9); ell(g, mx, my, st === 'boy' ? .13 : .16, .045 + mo * .03); g.fill();
    if (mo > .05) { g.fillStyle = gv(.08); ell(g, mx, my + .01, .1 + mo * .02, .015 + mo * .07); g.fill(); }
    else { g.strokeStyle = gv(.18, .8); g.lineWidth = .03; g.beginPath(); g.moveTo(mx - .14, my); g.quadraticCurveTo(mx, my + .03, mx + .14, my); g.stroke(); }
    g.fillStyle = gv(1, .12); ell(g, mx, my + .1, .1, .03); g.fill();
  }
  // front hair
  if (st === 'girl') {
    g.fillStyle = radG(g, back * .1, -.7, .05, 1, [[0, hair + .16], [1, hair]], L[0] * .3, L[1] * .3);
    g.beginPath(); g.moveTo(-.98 + back * .1, .45); g.bezierCurveTo(-1.05, -.95, -.4, -1.2, back * .05, -1.18); g.bezierCurveTo(.5, -1.2, 1.05, -.95, .98 + back * .1, .45);
    g.lineTo(.72 + turn * .1, .4); g.quadraticCurveTo(.82, -.1, .66, -.3);
    for (let i = 0; i <= 8; i++) { const u = 1 - i / 8, xx = lerp(-.66, .66, u) + turn * .12; g.lineTo(xx, -.36 - (i % 2) * .06); }
    g.quadraticCurveTo(-.82, -.1, -.72 + turn * .1, .4);
    g.closePath(); g.fill();
    g.strokeStyle = gv(hair + .3, .35); g.lineWidth = .04; g.beginPath(); g.arc(back * .05 + L[0] * .2, -.6, .55, Math.PI * 1.15, Math.PI * 1.55); g.stroke();
  } else if (st === 'boy') {
    g.fillStyle = radG(g, back * .1, -.8, .05, 1, [[0, hair + .15], [1, hair]], L[0] * .3, L[1] * .3);
    g.beginPath(); g.moveTo(-.86 + back * .1, -.15); g.bezierCurveTo(-.98, -1.0, -.4, -1.2, back * .1, -1.18); g.bezierCurveTo(.5, -1.2, .98, -1.0, .86 + back * .1, -.15);
    g.lineTo(.62, -.5); g.lineTo(.35, -.62); g.lineTo(.1, -.55); g.lineTo(-.18, -.66); g.lineTo(-.45, -.58); g.lineTo(-.65, -.48); g.closePath(); g.fill();
  } else if (st === 'woman') {
    g.fillStyle = radG(g, back * .1, -.75, .05, 1, [[0, hair + .2], [1, hair]], L[0] * .3, L[1] * .3);
    g.beginPath(); g.moveTo(-.88, -.1); g.bezierCurveTo(-.98, -1.0, -.4, -1.24, back * .05, -1.2); g.bezierCurveTo(.5, -1.22, .98, -1.0, .88, -.1);
    for (let i = 0; i <= 6; i++) { const u = 1 - i / 6, xx = lerp(-.72, .72, u) + turn * .12; g.quadraticCurveTo(xx + .1, -.5 - (i % 2) * .1, xx, -.62 + (i % 2) * .06); }
    g.closePath(); g.fill();
    // curls catching the light
    g.strokeStyle = gv(hair + .35, .4); g.lineWidth = .035;
    for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(-.6 + i * .3 + turn * .1, -.86 + (i % 2) * .08, .12, Math.PI * .9, Math.PI * 1.9); g.stroke(); }
  } else if (st === 'old') {
    g.fillStyle = radG(g, back * .1, -.85, .05, 1, [[0, hair + .2], [1, hair]], L[0] * .3, L[1] * .3);
    g.beginPath(); g.moveTo(-.84, -.3); g.bezierCurveTo(-.92, -1.0, -.4, -1.18, back * .05, -1.16); g.bezierCurveTo(.5, -1.18, .92, -1.0, .84, -.3);
    g.quadraticCurveTo(.7, -.78, .3, -.84); g.quadraticCurveTo(0, -.7, -.3, -.84); g.quadraticCurveTo(-.7, -.78, -.84, -.3); g.closePath(); g.fill();
    g.strokeStyle = gv(.4, .5); g.lineWidth = .02; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-.6 + i * .24, -.78); g.quadraticCurveTo(-.5 + i * .2, -1.0, -.3 + i * .12, -1.1); g.stroke(); }
  }
  g.restore();
}

// ---------- the dreamer: a man in a dark suit, black glasses, black hat ----------
// Origin at the waist; k = px per metre; o: arms (0 down .. 1.6 out .. 2.4 up), legs (spread 0..1), tilt (rad),
// hat (0 on .. 1 gone), flutter (0..1), head ([turn, look up]), top (true = seen from straight above)
function drawDreamer(g, x, y, k, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.tilt || 0); g.scale(k, k);
  const fl = o.flutter || 0, tt = o.time || 0;
  if (o.top) { drawDreamerTop(g, o); g.restore(); return; }
  const arm = o.arms ?? 1.4, legs = o.legs ?? .2;
  const suit = (x0, y0, x1, y1) => linG(g, x0, y0, x1, y1, [[0, .2], [.5, .08], [1, .04]]);
  // legs
  for (const s of [-1, 1]) {
    const hx = s * .1, fx = s * (.12 + legs * .22), fy = .88;
    g.fillStyle = suit(hx, 0, fx, fy);
    g.beginPath(); g.moveTo(hx - .1, 0); g.lineTo(hx + .1, 0); g.lineTo(fx + .06, fy); g.lineTo(fx - .07, fy); g.closePath(); g.fill();
    g.fillStyle = gv(.04); ell(g, fx + s * .02, fy + .04, .09, .045, s * .2); g.fill(); // shoe
    g.fillStyle = gv(.6, .5); ell(g, fx + s * .03 - .02, fy + .025, .04, .012); g.fill();
    if (s === 1 && o.rope) { g.fillStyle = gv(.35); g.fillRect(fx - .07, fy - .07, .14, .04); } // the rope knotted round the ankle
  }
  // jacket, coat-tails lifted by the wind
  g.fillStyle = linG(g, 0, -.62, 0, .18, [[0, .18], [.4, .09], [1, .05]]);
  g.beginPath(); g.moveTo(-.25, -.6); g.lineTo(.25, -.6); g.lineTo(.22 + fl * .04 * Math.sin(tt * 9), .18 + fl * .03);
  g.quadraticCurveTo(0, .24 - fl * .06 * Math.sin(tt * 11), -.22 - fl * .04 * Math.sin(tt * 9 + 1), .18 + fl * .03); g.closePath(); g.fill();
  // rim light from the bright sky along the shoulders and one side
  g.strokeStyle = gv(.55, .35); g.lineWidth = .025; g.beginPath(); g.moveTo(-.24, -.55); g.quadraticCurveTo(0, -.66, .24, -.55); g.stroke();
  // shirt front and tie
  g.fillStyle = gv(.92); poly(g, [[-.08, -.62], [.08, -.62], [0, -.38]]); g.fill();
  g.fillStyle = gv(.05); poly(g, [[-.022, -.6], [.022, -.6], [.03, -.36], [0, -.32], [-.03, -.36]]); g.fill();
  g.strokeStyle = gv(.03); g.lineWidth = .02; g.beginPath(); g.moveTo(-.08, -.62); g.lineTo(-.02, -.42); g.moveTo(.08, -.62); g.lineTo(.02, -.42); g.stroke();
  // arms: sleeves from the shoulders, pale mitten hands
  for (const s of [-1, 1]) {
    const a = arm + (o.armWave ? Math.sin(tt * 3 + s) * .06 : 0);
    const sx = s * .23, sy = -.55, ex = sx + s * Math.sin(a) * .62, ey = sy + Math.cos(a) * .62;
    g.strokeStyle = linG(g, sx, sy - .06, sx, sy + .06, [[0, .2], [1, .06]]); g.lineWidth = .13; g.lineCap = 'round';
    g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(lerp(sx, ex, .5) + s * .02, lerp(sy, ey, .5) - .03, ex, ey); g.stroke();
    g.fillStyle = gv(.86); ell(g, ex + s * Math.sin(a) * .05, ey + Math.cos(a) * .05, .055, .045, a * s); g.fill();
    g.fillStyle = gv(.95); g.fillRect(ex - .03, ey - .03, .06, .02);
  }
  // head
  const ht = o.head || [0, 0];
  g.save(); g.translate(0, -.78);
  drawHead(g, 0, 0, .12, { turn: ht[0], tilt: ht[1] * .3, skin: .8, la: .45, L: [0, -1], style: 'man', eyes: 0, hatShadow: (o.hat || 0) < .5 });
  // black glasses: two rounded lenses and a bridge
  g.save(); g.rotate(ht[1] * .3); g.translate(ht[0] * .04, -.008);
  g.fillStyle = gv(.03); for (const s of [-1, 1]) { g.beginPath(); g.roundRect(s * .041 - .036 + ht[0] * .01, -.022, .072, .046, .016); g.fill(); }
  g.fillRect(-.012, -.014, .024, .01);
  g.fillStyle = gv(.6, .35); for (const s of [-1, 1]) { g.fillRect(s * .041 - .02, -.016, .022, .008); }
  g.restore();
  g.restore();
  // hat
  const hatOff = o.hat || 0;
  if (hatOff < 1) {
    g.save(); g.translate(hatOff * .5, -.86 - hatOff * .9); g.rotate(hatOff * 2.2);
    g.fillStyle = gv(.04); ell(g, 0, .0, .2, .045); g.fill(); // brim
    g.fillStyle = linG(g, -.12, -.15, .12, 0, [[0, .16], [1, .03]]);
    g.beginPath(); g.moveTo(-.12, 0); g.lineTo(-.11, -.13); g.quadraticCurveTo(0, -.18, .11, -.13); g.lineTo(.12, 0); g.closePath(); g.fill();
    g.fillStyle = gv(.25); g.fillRect(-.12, -.035, .24, .025); // band
    g.restore();
  }
  g.restore();
}
// Straight down onto his back, falling: hat crown, shoulders, arms out, legs.
function drawDreamerTop(g, o) {
  const legs = o.legs ?? .6, arm = o.arms ?? 1.5;
  g.fillStyle = gv(.07);
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * .08, .05); g.lineTo(s * (.12 + legs * .25), .95); g.lineTo(s * (.04 + legs * .25), .97); g.lineTo(s * .0, .1); g.closePath(); g.fill(); }
  g.fillStyle = linG(g, -.25, 0, .25, 0, [[0, .16], [.5, .09], [1, .05]]); g.beginPath(); g.roundRect(-.25, -.5, .5, .62, .1); g.fill();
  for (const s of [-1, 1]) {
    const ex = s * Math.sin(arm) * .7, ey = -.42 + Math.cos(arm) * .7 * .4;
    g.strokeStyle = gv(.08); g.lineWidth = .13; g.lineCap = 'round'; g.beginPath(); g.moveTo(s * .22, -.42); g.lineTo(ex, ey); g.stroke();
    g.fillStyle = gv(.85); ell(g, ex + s * .05, ey, .055, .045); g.fill();
  }
  g.fillStyle = gv(.04); ell(g, 0, -.62, .2, .17); g.fill(); // brim
  g.fillStyle = radG(g, 0, -.62, .01, .12, [[0, .2], [1, .03]], -.03, -.03); ell(g, 0, -.62, .12, .1); g.fill();
}

// ---------- horse and rider, side view, facing right; origin at the hooves, k = px per metre ----------
// o: yank (0..1 the arm pulled back), toss (0..1 head up), step (leg offset)
function drawRider(g, x, y, k, o = {}) {
  g.save(); g.translate(x, y); g.scale(k, k);
  const yank = o.yank || 0, toss = o.toss || 0, st = o.step || 0;
  const hide = (x0, y0, x1, y1) => linG(g, x0, y0, x1, y1, [[0, .28], [.45, .14], [1, .07]]);
  // legs (far pair darker): thigh, knee, cannon, fetlock, hoof
  const legsAt = [[-.55, .1 + st * .1, .06, -1], [.45, -.06 - st * .08, .06, 1], [-.42, -.08, .13, -1], [.55, .08 + st * .06, .13, 1]];
  for (const [lx, sw, v, fr] of legsAt) {
    const kx = lx + sw * .4 + (fr < 0 ? -.04 : .03), ky = -.55, fx = lx + sw, fy = -.1;
    g.fillStyle = gv(v); g.beginPath(); g.moveTo(lx - .1, -1.05); g.lineTo(lx + .1, -1.05); g.quadraticCurveTo(kx + .07, -.75, kx + .04, ky); g.lineTo(fx + .03, fy); g.lineTo(fx - .03, fy); g.lineTo(kx - .04, ky); g.quadraticCurveTo(kx - .08, -.75, lx - .1, -1.05); g.closePath(); g.fill();
    g.fillStyle = gv(.03); g.beginPath(); g.moveTo(fx - .045, -.1); g.lineTo(fx + .05, -.1); g.lineTo(fx + .07, 0); g.lineTo(fx - .06, 0); g.closePath(); g.fill();
  }
  // body
  g.fillStyle = hide(0, -1.45, 0, -.85); ell(g, 0, -1.12, .78, .3); g.fill();
  // neck and head (tossing up on the yank)
  g.save(); g.translate(.62, -1.25); g.rotate(-.9 - toss * .35);
  g.fillStyle = hide(0, -.2, 0, .2); g.beginPath(); g.moveTo(-.16, -.2); g.quadraticCurveTo(.3, -.16, .64, -.09); g.lineTo(.64, .1); g.quadraticCurveTo(.3, .2, -.1, .28); g.closePath(); g.fill();
  g.translate(.62, 0); g.rotate(1.25 + toss * .25);
  g.fillStyle = hide(0, -.1, 0, .1); g.beginPath(); g.moveTo(-.06, -.13); g.quadraticCurveTo(.2, -.12, .46, -.07); g.quadraticCurveTo(.56, 0, .47, .08); g.quadraticCurveTo(.2, .09, -.06, .14); g.closePath(); g.fill(); g.fillStyle = gv(.5); ell(g, .1, -.05, .018, .014); g.fill();
  g.fillStyle = gv(.03); poly(g, [[-.02, -.1], [.05, -.22], [.08, -.09]]); g.fill(); // ear
  g.restore();
  // mane and tail
  g.strokeStyle = gv(.04); g.lineWidth = .06; g.beginPath(); g.moveTo(-.76, -1.2); g.quadraticCurveTo(-1.0, -1.0 + toss * .1, -.95, -.55); g.stroke();
  // highlight along the back (sky light from above)
  g.strokeStyle = gv(.6, .4); g.lineWidth = .03; g.beginPath(); g.ellipse(0, -1.12, .76, .28, 0, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
  // rider: legs, coat, hat, arm up holding the rope
  g.fillStyle = gv(.05); g.beginPath(); g.moveTo(-.12, -1.3); g.lineTo(.1, -1.3); g.lineTo(.12, -.95); g.lineTo(.0, -.95); g.closePath(); g.fill();
  g.fillStyle = linG(g, -.2, -2.0, .2, -1.3, [[0, .2], [1, .05]]);
  g.beginPath(); g.moveTo(-.18, -1.32); g.lineTo(.18, -1.32); g.lineTo(.12 - yank * .06, -1.95); g.lineTo(-.12 - yank * .06, -1.95); g.closePath(); g.fill();
  g.fillStyle = gv(.78); ell(g, -yank * .07, -2.05, .085, .1); g.fill();
  g.fillStyle = gv(.04); ell(g, -yank * .07, -2.13, .17, .035); g.fill(); g.fillRect(-.1 - yank * .07, -2.27, .2, .14);
  // the rope hand: up and forward, pulled back and down on the yank
  const hx = lerp(.25, -.35, yank), hy = lerp(-2.45, -1.95, yank);
  g.strokeStyle = gv(.08); g.lineWidth = .09; g.lineCap = 'round'; g.beginPath(); g.moveTo(-.05 - yank * .06, -1.85); g.lineTo(hx, hy); g.stroke();
  g.fillStyle = gv(.82); ell(g, hx, hy, .055, .05); g.fill();
  g.restore();
  return [x + hx * k, y + hy * k]; // where the rope leaves the hand (screen)
}

// ---------- the woman in white (Masina stand-in): small, short dark hair, big eyes, a belted white coat ----------
// Origin at her feet, k = px per metre, facing the viewer's left. o: up (0..1 face lifted to the sky),
// hand (0..1 near hand up to shade her eyes), gust (0..1 wind), tt (time)
function drawWoman(g, x, y, k, o = {}) {
  g.save(); g.translate(x, y); g.scale(k, k);
  const up = o.up || 0, hand = o.hand || 0, gust = o.gust || 0, tt = o.tt || 0;
  const coat = (x0, y0, r) => radG(g, x0, y0, .02, r, [[0, .99], [.55, .9], [1, .66]], -.1, -.14);
  // legs: slim dark stockings, small heeled shoes, the far leg a touch behind
  for (const [lx, v] of [[.05, .22], [-.05, .14]]) {
    g.fillStyle = linG(g, lx - .04, 0, lx + .04, 0, [[0, v + .12], [1, v]]);
    g.beginPath(); g.moveTo(lx - .045, -.44); g.quadraticCurveTo(lx - .055, -.25, lx - .025, -.06); g.lineTo(lx + .02, -.06); g.quadraticCurveTo(lx + .05, -.25, lx + .04, -.44); g.closePath(); g.fill();
    g.fillStyle = gv(.04); g.beginPath(); g.moveTo(lx - .075, -.005); g.quadraticCurveTo(lx - .07, -.06, lx - .02, -.07); g.lineTo(lx + .03, -.06); g.lineTo(lx + .03, 0); g.closePath(); g.fill();
  }
  // skirt of the coat, flaring, its hem lifting in the wind
  const hw = .025 * Math.sin(tt * 4.5) + gust * .09;
  g.fillStyle = coat(-.04, -.85, .55);
  g.beginPath(); g.moveTo(-.13, -1.0); g.lineTo(.13, -1.0); g.quadraticCurveTo(.22, -.75, .27 + hw, -.42 - gust * .05);
  g.quadraticCurveTo(.02, -.37 + .015 * Math.sin(tt * 6), -.25 + hw * .4, -.43); g.quadraticCurveTo(-.2, -.75, -.13, -1.0); g.closePath(); g.fill();
  g.strokeStyle = gv(.6, .4); g.lineWidth = .012; g.beginPath(); g.moveTo(.03, -.97); g.quadraticCurveTo(.08, -.7, .14 + hw, -.42); g.moveTo(-.07, -.97); g.quadraticCurveTo(-.1, -.7, -.15, -.43); g.stroke();
  // bodice, shoulders, belt, three dark buttons
  g.fillStyle = coat(-.05, -1.2, .3);
  g.beginPath(); g.moveTo(-.04, -1.36); g.quadraticCurveTo(-.17, -1.34, -.18, -1.25); g.lineTo(-.13, -.98); g.lineTo(.13, -.98); g.lineTo(.17, -1.25); g.quadraticCurveTo(.16, -1.34, .04, -1.36); g.closePath(); g.fill();
  g.fillStyle = linG(g, .05, 0, .17, 0, [[0, 0, 0], [1, 0, .22]]); g.fill();
  g.fillStyle = gv(.82); g.fillRect(-.14, -1.03, .28, .04); g.fillStyle = gv(.3); g.fillRect(-.02, -1.035, .04, .05);
  g.fillStyle = gv(.12); for (const by of [-1.25, -1.16, -.9]) { ell(g, .0, by, .011, .011); g.fill(); }
  // round white collar
  g.fillStyle = gv(1); g.beginPath(); g.moveTo(-.1, -1.37); g.quadraticCurveTo(-.09, -1.3, 0, -1.29); g.quadraticCurveTo(.09, -1.3, .1, -1.37); g.quadraticCurveTo(0, -1.4, -.1, -1.37); g.fill();
  g.strokeStyle = gv(.55, .5); g.lineWidth = .006; g.stroke();
  // far arm down along the coat
  g.strokeStyle = linG(g, .12, -1.3, .2, -.8, [[0, .92], [1, .72]]); g.lineWidth = .075; g.lineCap = 'round';
  g.beginPath(); g.moveTo(.14, -1.29); g.quadraticCurveTo(.2, -1.05, .18, -.82); g.stroke();
  g.fillStyle = gv(.82); ell(g, .18, -.78, .03, .042); g.fill();
  // head, tipped back to look up into the sky (she faces left, so tipping back turns her face up)
  drawHead(g, -.01 - up * .03, -1.47, .105, { turn: -.55, tilt: .1 + up * .5, lift: up * 1.2, skin: .86, hair: .06, style: 'woman', eyes: 1, look: [-.35, -.75 * up - .1], L: [-.6, -.8], la: .45, brows: .7, mouth: 0 });
  // near arm: down by her side, rising to shade her eyes
  const sx = -.14, sy = -1.29, ex = lerp(-.19, -.3, hand), ey = lerp(-1.05, -1.38, hand), hx = lerp(-.17, -.14, hand), hy = lerp(-.82, -1.58 - up * .02, hand);
  g.strokeStyle = linG(g, -.3, -1.5, -.1, -.9, [[0, .98], [1, .8]]); g.lineWidth = .075;
  g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.lineTo(hx, hy); g.stroke();
  g.fillStyle = gv(.84); g.save(); g.translate(hx, hy); g.rotate(lerp(0, -1.3, hand)); ell(g, 0, 0, .03, .048); g.fill(); g.restore();
  g.restore();
}

// Woodcut puppets: rigid cut parts on pins, posed per 8 fps step. All shapes are in the figure's own
// space (feet at 0,0, head top near -330, facing +x); dir = -1 mirrors. Seeds are per part.
function inkFill(pts) { const g = PR.l; g.fillStyle = COL.ink; g.beginPath(); pathOn(g, pts); g.fill(); }

function leg(m, col, seed, shoe = true, o = {}) {
  part(m, [[-14, -4], [14, -4], [13, 60], [12, 116], [-11, 116], [-13, 60]], { fill: col, seed, line: 3.6, k: 3 });
  if (o.stripes) for (let y = 14; y < 100; y += 14) part(m, [[-14, y], [14, y], [14, y + 6], [-14, y + 6]], { fill: o.stripes, seed: seed + y, line: 1.6, smooth: false, famp: 1 });
  else lineP(m, [[-2, 30], [1, 70], [-1, 100]], 1.8, seed + 9);
  if (o.platform) { // platform boots: tall black shaft, thick lugged sole with buckles
    part(m, [[-15, 70], [15, 70], [16, 112], [34, 118], [34, 130], [-15, 130]], { fill: 'black', seed: seed + 5, line: 3, smooth: false, step: 10 });
    part(m, [[-17, 130], [37, 130], [37, 152], [-17, 152]], { fill: 'black', seed: seed + 6, line: 3, smooth: false, step: 10 });
    for (const y of [84, 100]) lineP(m, [[-14, y], [14, y + 2]], 2.4, seed + y, false);
    for (let x = -12; x < 36; x += 9) lineP(m, [[x, 146], [x + 4, 146]], 1.6, seed + 40 + x, false);
  } else if (shoe) { const s = spline([[-12, 112], [10, 110], [30, 118], [28, 128], [-12, 128]], true, 4); inkFill(ap(m, rough(s, seed + 5, 1.2))); }
}
function arm(m, col, seed, hand = true, skin = 'flesh', lace = false) {
  part(m, [[-11, -6], [11, -6], [10, 48], [9, 88], [-9, 88], [-10, 48]], { fill: col, seed, line: 3.4, k: 3 });
  if (lace) for (let i = -2; i <= 2; i++) part(m, circ(i * 5, 90, 3.4, 6), { fill: 'white', line: 1.4, seed: seed + 20 + i, famp: .5 });
  else lineP(m, [[-9, 70], [9, 72]], 2.2, seed + 3, false);
  if (hand) part(m, [[-8, 88], [8, 88], [12, 100], [4, 112], [-8, 108], [-12, 98]], { fill: skin, seed: seed + 7, line: 2.8, k: 3 });
}
function hairBack(m, o, seed) {
  // long hair falls behind the head and shoulders
  if (o.hairStyle === 'long') part(m, [[-26, -40], [-8, -56], [18, -52], [28, -36], [24, 10], [30, 50], [6, 54], [-20, 48], [-34, 30], [-30, -10]], { fill: 'black', seed: seed + 70, line: 3.2 });
  if (o.hairStyle === 'bob') part(m, [[-26, -36], [-6, -56], [20, -52], [30, -34], [30, -4], [18, -4], [-24, 0], [-30, -12]], { fill: 'black', seed: seed + 70, line: 3 });
}
function head(m, o, seed) {
  const skin = o.skin || 'flesh';
  part(m, [[-8, -16], [8, -16], [9, 4], [-9, 4]], { fill: skin, seed: seed + 1, line: 2.6, smooth: false });
  // skull + jaw, a 3/4 face towards +x
  part(m, [[-20, -30], [-4, -50], [16, -48], [26, -30], [27, -12], [20, 2], [6, 6], [-12, -2], [-22, -14]], { fill: skin, seed: seed + 2, line: 3.4 });
  if (o.goth) {
    // heavy kohl with a flick, dark lipstick in a warm smile, then hair on top
    inkFill(ap(m, rough(spline([[6, -27], [14, -32], [22, -27], [27, -31], [21, -22], [12, -21]], true, 3), seed + 4, .6)));
    part(m, [[11, -26], [15, -28], [18, -25], [15, -23]], { fill: 'white', seed: seed + 41, line: 0, famp: .4 });
    inkFill(ap(m, circ(15, -25.5, 1.8, 6)));
    lineP(m, [[5, -37], [14, -40], [24, -36]], 3.2, seed + 5);
    lineP(m, [[21, -30], [29, -16], [21, -13]], 2.4, seed + 6, false);
    part(m, [[8, -7], [14, -4], [22, -7], [21, -3], [15, 1], [9, -2]], { fill: o.lips || 'plum', seed: seed + 7, line: 2, famp: .6 });
    lineP(m, [[-6, -26], [-11, -22], [-10, -14], [-5, -12]], 2.2, seed + 8);
    if (o.hairStyle === 'spiky') { const sp = [[-24, -30]]; for (let i = 0; i < 7; i++) { const a = -2.7 + i * .38; sp.push([Math.cos(a) * 30 + 2, Math.sin(a) * 30 - 30], [Math.cos(a + .19) * 54 + 2, Math.sin(a + .19) * 54 - 34]); } sp.push([28, -30], [10, -42], [-10, -40]); part(m, sp, { fill: 'black', seed: seed + 9, line: 3, smooth: false, step: 8 }); }
    else if (o.hairStyle === 'mohawk') { part(m, [[-22, -24], [-26, -48], [-14, -78], [-2, -60], [6, -92], [14, -62], [26, -82], [24, -50], [20, -40], [-4, -46]], { fill: o.hairCol || 'purple', seed: seed + 9, line: 3, smooth: false, step: 8 }); }
    else if (o.hairStyle === 'long' || o.hairStyle === 'bob') part(m, [[-24, -22], [-22, -44], [-4, -58], [20, -54], [30, -38], [12, -44], [-2, -36], [-12, -16]], { fill: 'black', seed: seed + 9, line: 3 });
    return;
  }
  if (o.beard) { part(m, [[2, -10], [26, -12], [24, 8], [10, 26], [-4, 14], [-10, -2]], { fill: 'white', seed: seed + 3, line: 2.6 }); for (let i = 0; i < 4; i++) lineP(m, [[4 + i * 5, -4], [2 + i * 5, 12 + i]], 1.4, seed + 20 + i, false); }
  // eye, brow, nose, mouth, ear
  if (!o.hatDown) {
    if (o.eyesShut) lineP(m, [[9, -25], [14, -23], [19, -25]], 2.4, seed + 4); else {
      lineP(m, [[8, -26], [14, -29], [20, -26]], 2.2, seed + 4); inkFill(ap(m, circ(14.5, -25, 2.6, 8)));
    }
    lineP(m, [[6, -35], [14, -37], [22, -34]], 2.4, seed + 5);
  }
  lineP(m, [[21, -30], [29, -16], [21, -13]], 2.4, seed + 6, false);
  if (!o.beard) lineP(m, [[12, -4], [20, -5]], 2.2, seed + 7, false);
  lineP(m, [[-6, -26], [-11, -22], [-10, -14], [-5, -12]], 2.2, seed + 8);
  // hair
  if (o.hair) part(m, [[-22, -16], [-24, -34], [-8, -52], [16, -50], [24, -40], [6, -42], [-8, -34], [-12, -18]], { fill: o.hair, seed: seed + 9, line: 3 });
  for (let i = 0; i < 3; i++) lineP(m, [[-18 + i * 3, -34 + i * 6], [-14 + i * 3, -24 + i * 6]], 1.5, seed + 30 + i, false);
}
function hat(m, o, seed) {
  if (o.hat === 'brim') {
    part(m, [[-18, -44], [-16, -76], [0, -82], [20, -78], [22, -44]], { fill: o.hatCol || 'red', seed: seed + 1, line: 3.4 });
    part(m, [[-40, -44], [-10, -50], [30, -50], [48, -42], [20, -36], [-20, -36]], { fill: o.hatCol || 'red', seed: seed + 2, line: 3.4 });
    lineP(m, [[-16, -52], [22, -54]], 3, seed + 3, false);
  } else if (o.hat === 'cap') {
    part(m, [[-24, -28], [-22, -50], [-4, -62], [22, -58], [32, -46], [26, -40], [0, -42], [-14, -30]], { fill: o.hatCol || 'blue', seed: seed + 1, line: 3.2 });
  } else if (o.hat === 'top') {
    part(m, [[-20, -46], [-22, -110], [22, -112], [22, -46]], { fill: o.hatCol || 'black', seed: seed + 1, line: 3.4, smooth: false, step: 10 });
    part(m, [[-20, -58], [22, -58], [22, -50], [-20, -50]], { fill: 'purple', seed: seed + 4, line: 2.4, smooth: false });
    part(m, [[-38, -44], [-10, -50], [30, -50], [44, -42], [20, -38], [-20, -38]], { fill: o.hatCol || 'black', seed: seed + 2, line: 3.4 });
  } else if (o.hat === 'kerchief') {
    part(m, [[-26, -10], [-26, -38], [-8, -56], [16, -54], [26, -40], [14, -42], [-6, -40], [-14, -18], [-30, 20], [-38, 4]], { fill: o.hatCol || 'red', seed: seed + 1, line: 3.2 });
  }
}

// a person. opts: x,y,s,dir, tunic, sleeve, legs, hat, hatCol, legA[2], armA[2], tilt, sit, hatDown, skirt, beard, cane, bundle('stick'|null), hair, seed
function person(o) {
  const seed = o.seed || 10, dir = o.dir || 1, s = o.s || 1;
  const sitDrop = o.sit ? 104 : 0;
  const m = chain(T(o.x, o.y), Sm(s * dir, s), T(0, sitDrop - (o.platform && !o.skirt ? 24 : 0)));
  const legA = o.legA || [0, 0], armA = o.armA || [.08, .08];
  const hip = [0, -126];
  const U = o.lean ? chain(m, T(hip[0], hip[1]), Rm(-o.lean), T(-hip[0], -hip[1])) : m;
  const shB = [-22, -230], shF = [20, -230];
  const handF = ap1(Rm(-armA[1]), 0, 100);
  // bundle on its stick sits behind the body
  let stickA, stickB;
  if (o.bundle === 'stick') {
    stickA = [shF[0] + handF[0], shF[1] + handF[1]]; stickB = [stickA[0] - 120, stickA[1] - 200];
    part(U, [[stickB[0] - 30, stickB[1] - 6], [stickB[0] - 12, stickB[1] - 30], [stickB[0] + 18, stickB[1] - 24], [stickB[0] + 30, stickB[1] + 4], [stickB[0] + 12, stickB[1] + 30], [stickB[0] - 22, stickB[1] + 26]], { fill: 'red', seed: seed + 60, line: 3.6 });
    lineP(U, [[stickB[0] - 8, stickB[1] - 26], [stickB[0], stickB[1] - 38], [stickB[0] + 10, stickB[1] - 26]], 2.6, seed + 61);
    for (let i = 0; i < 3; i++) inkFill(ap(U, circ(stickB[0] - 12 + i * 12, stickB[1] + 2 + (i % 2) * 8, 3, 6)));
  }
  // back limbs
  const skin = o.skin || 'flesh';
  if (o.hairStyle === 'long' || o.hairStyle === 'bob') hairBack(chain(U, T(2, -244), o.lookBack ? Sm(-1, 1) : I, Rm(-(o.tilt || 0))), o, seed + 40);
  if (!o.skirt) leg(chain(m, T(hip[0] - 8, hip[1]), Rm(-legA[0])), o.legs || 'yellow', seed + 1, true, o);
  arm(chain(U, T(shB[0], shB[1]), Rm(-armA[0])), o.sleeve || 'red', seed + 2, true, skin, o.lace);
  // body
  if (o.skirt) {
    part(m, [[-30, -150], [30, -150], [44, -70], [56, -4], [0, 2], [-54, -4], [-42, -70]], { fill: o.skirt, seed: seed + 3, line: 3.8 });
    lineP(m, [[-8, -130], [-20, -10]], 1.8, seed + 31, false); lineP(m, [[14, -130], [24, -12]], 1.8, seed + 32, false);
    inkFill(ap(m, rough(spline([[-30, -4], [-6, -6], [-4, 6], [-30, 6]], true, 3), seed + 33, 1)));
  } else leg(chain(m, T(hip[0] + 8, hip[1]), Rm(-legA[1])), o.legs || 'yellow', seed + 4, true, o);
  if (o.coat) part(U, [[-30, -240], [0, -246], [30, -240], [36, -170], [50, -50], [0, -40], [-52, -50], [-38, -170]], { fill: o.tunic || 'black', seed: seed + 5, line: 4 });
  else part(U, [[-30, -240], [0, -246], [30, -240], [34, -180], [44, -112], [0, -102], [-42, -112], [-34, -180]], { fill: o.tunic || 'blue', seed: seed + 5, line: 4 });
  if (o.belt !== 'none') part(U, [[-36, -156], [36, -156], [37, -144], [-37, -144]], { fill: o.belt || 'yellow', seed: seed + 6, line: 2.6, smooth: false });
  if (o.collar) part(U, [[-22, -244], [0, -232], [22, -244], [16, -226], [0, -220], [-16, -226]], { fill: o.collar, seed: seed + 66, line: 2.4 });
  lineP(U, [[-6, -240], [-12, -108]], 1.8, seed + 7, false); lineP(U, [[16, -236], [26, -112]], 1.8, seed + 8, false);
  // tunic fold hatching
  hatch(U, [[-34, -140], [-4, -140], [-6, -106], [-40, -112]], .9, 7, 1.6, seed + 9, .8);
  if (o.bundle === 'stick') lineP(U, [stickB, [lerp(stickB[0], stickA[0], .5), lerp(stickB[1], stickA[1], .5) - 4], [stickA[0] + 14, stickA[1] + 6]], 5, seed + 62);
  // head (pivots at the neck)
  const hm = chain(U, T(2, -244), o.lookBack ? Sm(-1, 1) : I, Rm(-(o.tilt || 0)));
  head(hm, o, seed + 40);
  if (o.hat && o.hat !== 'none' && !o.hatInHand) hat(o.hatDown ? chain(hm, T(4, 14), Rm(.16)) : hm, o, seed + 50);
  else if (o.hatInHand && !o.goth) part(hm, [[-22, -40], [-6, -54], [16, -52], [26, -36], [6, -42], [-8, -36]], { fill: 'brown', seed: seed + 49, line: 3 });
  // front arm, cane, parasol, hat held up
  arm(chain(U, T(shF[0], shF[1]), Rm(-armA[1])), o.sleeve || 'red', seed + 11, true, skin, o.lace);
  if (o.hatInHand) { const h = [shF[0] + handF[0], shF[1] + handF[1]]; hat(chain(U, T(h[0] + 4, h[1] + 52), Rm(-.3)), o, seed + 50); }
  if (o.parasol) {
    const h = [shF[0] + handF[0], shF[1] + handF[1]], top = [h[0] - 20, h[1] - 170];
    lineP(U, [[h[0], h[1] + 10], top], 4, seed + 80, false);
    const pm = chain(U, T(top[0], top[1]), Rm(-.25));
    const dome = [...arc(0, 30, 92, Math.PI, TAU, 14, 64)]; dome.push([92, 30]);
    // lace edge: a row of scallops with pierced holes
    for (let i = 0; i < 9; i++) { const x = -84 + i * 21; part(pm, arc(x, 30, 11, 0, Math.PI, 6), { fill: 'white', line: 1.8, seed: seed + 90 + i, smooth: false, step: 6, closed: true, famp: .6 }); inkFill(ap(pm, circ(x, 36, 2.2, 6))); }
    part(pm, dome, { fill: 'black', seed: seed + 81, line: 3.4, smooth: false, step: 10 });
    for (let i = 1; i < 5; i++) lineP(pm, [[0, -34], [-92 + i * 37, 30]], 1.6, seed + 82 + i, false);
    part(pm, circ(0, -36, 5, 6), { fill: 'black', line: 2, seed: seed + 89 });
  }
  if (o.cane) { const h = [shF[0] + handF[0], shF[1] + handF[1]]; lineP(U, [[h[0], h[1] - 6], [h[0] + 8, 0]], 5, seed + 70, false); }
}

// a walk on 8 fps steps: 4-phase stiff stride
function stride(t, amp = .34) {
  const ph = Math.floor(t * 8 + 1e-6) % 4, a = [amp, 0, -amp, 0][ph];
  return { legA: [a, -a], armA: [-a * .8 + .06, a * .8 + .06], bob: ph % 2 ? 0 : -3 };
}

function dog(x, y, s, dir, t, seed = 300, jump = 0) {
  const ph = Math.floor(t * 8 + 1e-6) % 2;
  const m = chain(T(x, y - jump), Sm(s * dir, s));
  for (const [lx, sw] of [[-30, ph ? .3 : -.3], [-22, ph ? -.3 : .3], [22, ph ? -.3 : .3], [30, ph ? .3 : -.3]]) {
    const lm = chain(m, T(lx, -34), Rm(sw));
    part(lm, [[-5, 0], [5, 0], [5, 32], [-6, 32]], { fill: 'white', seed: seed + lx, line: 2.6, smooth: false });
  }
  part(m, [[-44, -60], [-10, -66], [30, -62], [42, -46], [36, -32], [-36, -28], [-48, -40]], { fill: 'white', seed: seed + 1, line: 3.4 });
  lineP(m, [[-44, -54], [-62, -78 + (ph ? 6 : 0)], [-58, -86]], 3, seed + 2);
  part(m, [[30, -66], [44, -86], [62, -84], [74, -70], [64, -60], [40, -52]], { fill: 'white', seed: seed + 3, line: 3.2 });
  part(m, [[42, -84], [38, -100], [52, -90]], { fill: 'brown', seed: seed + 4, line: 2.4, smooth: false });
  inkFill(ap(m, circ(58, -76, 2.6, 8))); inkFill(ap(m, circ(74, -71, 3.2, 8)));
  for (const [sx, sy, r] of [[-20, -50, 9], [8, -54, 7], [-36, -42, 5]]) pfill('blue', ap(m, rough(circ(sx, sy, r, 10), seed + sx, 1.5)));
}

function bird(x, y, s, dir, open, seed = 400) {
  const m = chain(T(x, y), Sm(s * dir, s));
  lineP(m, [[-4, 6], [-2, 18]], 2, seed + 1, false); lineP(m, [[4, 6], [6, 18]], 2, seed + 2, false);
  part(m, [[-30, -6], [-10, -20], [12, -22], [22, -12], [16, 4], [-6, 8], [-34, 4]], { fill: 'blue', seed: seed + 3, line: 3 });
  part(m, [[-18, -12], [4, -16], [-4, -2], [-26, 0]], { fill: 'navy', seed: seed + 4, line: 2.4 });
  part(m, [[10, -22], [18, -30], [28, -26], [30, -14], [20, -10]], { fill: 'blue', seed: seed + 5, line: 2.8 });
  inkFill(ap(m, circ(22, -22, 2.2, 8)));
  // beak opens on the sung note
  const oa = open * .5;
  lineP(chain(m, T(30, -18), Rm(-oa)), [[0, 0], [12, 2]], 3, seed + 6, false);
  lineP(chain(m, T(30, -16), Rm(oa)), [[0, 0], [11, 1]], 3, seed + 7, false);
}

// where a person's hand is (which: 0 back arm, 1 front arm), in the space person() was drawn in
function handPos(o, which = 0) {
  const s = o.s || 1, dir = o.dir || 1, sitDrop = (o.sit ? 104 : 0) - (o.platform && !o.skirt ? 24 : 0);
  const armA = o.armA || [.08, .08], sh = which ? [20, -230] : [-22, -230];
  const h = ap1(Rm(-armA[which]), 0, 104);
  return ap1(chain(T(o.x, o.y), Sm(s * dir, s), T(0, sitDrop)), sh[0] + h[0], sh[1] + h[1]);
}
// a small upright piano on casters, front on to us; (x, y) is the road under its wheels.
// tilt follows the road; returns the rope hook on the side facing hookDir (+1 right, -1 left)
function piano(x, y, s, tilt, hookDir = 1, seed = 1800) {
  const m = chain(T(x, y), Rm(tilt), Sm(s));
  for (const wx of [-60, 60]) { part(m, circ(wx, -9, 9, 10), { fill: 'black', seed: seed + wx, line: 2.4 }); lineP(m, [[wx, -18], [wx, -24]], 3, seed + wx + 1, false); }
  part(m, rectP(-80, -176, 160, 152), { fill: 'brown', seed: seed + 1, line: 4.2, smooth: false, step: 20 });
  part(m, rectP(-88, -190, 176, 16), { fill: 'brown', seed: seed + 2, line: 3.6, smooth: false, step: 20 });
  hatch(m, rectP(-76, -172, 18, 144), 1.4, 7, 1.4, seed + 3, .9); hatch(m, rectP(58, -172, 18, 144), 1.4, 7, 1.4, seed + 4, .9);
  // a stencilled panel above the keys with a cut scroll
  part(m, rectP(-56, -160, 112, 46), { fill: 'yellow', seed: seed + 5, line: 2.8, smooth: false, step: 16 });
  lineP(m, [[-40, -134], [-24, -150], [-6, -134], [10, -150], [28, -134], [42, -146]], 2.2, seed + 6);
  // keyboard: white keys with black keys in twos and threes
  part(m, rectP(-84, -104, 168, 22), { fill: 'white', seed: seed + 7, line: 3, smooth: false, step: 14 });
  for (let k = 1; k < 14; k++) lineP(m, [[-84 + k * 12, -104], [-84 + k * 12, -83]], 1.3, seed + 10 + k, false);
  for (let k = 0; k < 13; k++) { const n = k % 7; if (n === 2 || n === 6) continue; const bx = -84 + (k + 1) * 12 - 3.5; inkFill(ap(m, rectP(bx, -104, 7, 12))); }
  part(m, rectP(-80, -82, 160, 8), { fill: 'brown', seed: seed + 8, line: 2.4, smooth: false, step: 20 });
  // the lower door and two brass pedals
  part(m, rectP(-60, -66, 120, 34), { fill: 'brown', seed: seed + 9, line: 2.4, smooth: false, step: 20 });
  for (const px of [-12, 12]) part(m, rectP(px - 5, -32, 10, 6), { fill: 'yellow', seed: seed + 30 + px, line: 1.6, smooth: false });
  const hk = [hookDir * 84, -70];
  part(m, circ(hk[0], hk[1], 6, 8), { line: 2.4, seed: seed + 40 });
  return ap1(m, hk[0], hk[1]);
}
function rope(a, b, sag = 22, seed = 1850) {
  const pts = []; for (let k = 0; k <= 8; k++) { const u = k / 8; pts.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u) + Math.sin(Math.PI * u) * sag]); }
  pline(ap(I, rough(pts, seed, 1)), 3.4, seed, false);
}

// a Juno statuette: a slim gold figure, arms raised, on a little stepped base. (x, y) = ground under its base.
function juno(x, y, s, rot, seed = 1900) {
  const m = chain(T(x, y), Rm(rot), Sm(s));
  part(m, rectP(-16, -10, 32, 10), { fill: 'black', seed: seed + 1, line: 2.2, smooth: false, step: 10 });
  part(m, rectP(-11, -18, 22, 8), { fill: 'black', seed: seed + 2, line: 2, smooth: false, step: 8 });
  // body tapering up, arms in a V, small head
  part(m, [[-5, -18], [5, -18], [4, -46], [16, -78], [11, -80], [3, -56], [0, -60], [-3, -56], [-11, -80], [-16, -78], [-4, -46]], { fill: 'gold', seed: seed + 3, line: 2.2, smooth: false, step: 8, famp: 1 });
  part(m, circ(0, -66, 5.5, 8), { fill: 'gold', seed: seed + 4, line: 2, famp: .6 });
  lineP(m, [[-2, -40], [-3, -24]], 1.2, seed + 5, false);
}
// two or three statuettes on strings behind the piano, like cans behind a wedding car.
// back: tie point on the piano; gx(i) -> [x, y, scale] for each on the ground; moving: clatter; hop: extra lift
function junoTrail(back, gx, t, moving, hop = 0, seed = 1950, n = 3) {
  const step = Math.floor(t * 8 + 1e-6);
  for (let i = 0; i < n; i++) {
    const [x, y, s] = gx(i);
    const k = step + i * 3;
    const rot = moving ? [.0, .5, -.4, 1.1, -.9, .25][k % 6] * (i % 2 ? -1 : 1) : [1.45, -1.4, 1.5][i];
    const lift = (moving && k % 2 ? 9 + (i % 2) * 5 : 0) + hop * (1 - i * .15);
    juno(x, y - lift * s, s, rot, seed + i * 10);
    // string from the piano to the base of the statuette
    const tie = ap1(chain(T(x, y - lift * s), Rm(rot), Sm(s)), 0, -14);
    const pts = []; for (let k2 = 0; k2 <= 6; k2++) { const u = k2 / 6; pts.push([lerp(back[0], tie[0], u), lerp(back[1], tie[1], u) + Math.sin(Math.PI * u) * 10 * s]); }
    pline(rough(pts, seed + i, .6), 1.8, seed + 5 + i, false);
    // clank marks on the bounces
    if (moving && k % 2) for (let c = 0; c < 3; c++) { const a = -1.9 + c * .5; lineP(I, [[x + Math.cos(a) * 22 * s, y - 10 * s + Math.sin(a) * 22 * s], [x + Math.cos(a) * 34 * s, y - 10 * s + Math.sin(a) * 34 * s]], 1.8, seed + 40 + c + i, false); }
  }
}
const pianoBack = (x, y, s, tilt, hookDir = 1) => ap1(chain(T(x, y), Rm(tilt), Sm(s)), -hookDir * 80, -16);

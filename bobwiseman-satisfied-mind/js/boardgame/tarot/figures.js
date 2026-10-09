// Woodcut puppets: rigid cut parts on pins, posed per 8 fps step. All shapes are in the figure's own
// space (feet at 0,0, head top near -330, facing +x); dir = -1 mirrors. Seeds are per part.
function inkFill(pts) { const g = PR.l; g.fillStyle = COL.ink; g.beginPath(); pathOn(g, pts); g.fill(); }

function leg(m, col, seed, shoe = true) {
  part(m, [[-14, -4], [14, -4], [13, 60], [12, 116], [-11, 116], [-13, 60]], { fill: col, seed, line: 3.6, k: 3 });
  lineP(m, [[-2, 30], [1, 70], [-1, 100]], 1.8, seed + 9);
  if (shoe) { const s = spline([[-12, 112], [10, 110], [30, 118], [28, 128], [-12, 128]], true, 4); inkFill(ap(m, rough(s, seed + 5, 1.2))); }
}
function arm(m, col, seed, hand = true) {
  part(m, [[-11, -6], [11, -6], [10, 48], [9, 88], [-9, 88], [-10, 48]], { fill: col, seed, line: 3.4, k: 3 });
  lineP(m, [[-9, 70], [9, 72]], 2.2, seed + 3, false);
  if (hand) part(m, [[-8, 88], [8, 88], [12, 100], [4, 112], [-8, 108], [-12, 98]], { fill: 'flesh', seed: seed + 7, line: 2.8, k: 3 });
}
function head(m, o, seed) {
  part(m, [[-8, -16], [8, -16], [9, 4], [-9, 4]], { fill: 'flesh', seed: seed + 1, line: 2.6, smooth: false });
  // skull + jaw, a 3/4 face towards +x
  part(m, [[-20, -30], [-4, -50], [16, -48], [26, -30], [27, -12], [20, 2], [6, 6], [-12, -2], [-22, -14]], { fill: 'flesh', seed: seed + 2, line: 3.4 });
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
  } else if (o.hat === 'kerchief') {
    part(m, [[-26, -10], [-26, -38], [-8, -56], [16, -54], [26, -40], [14, -42], [-6, -40], [-14, -18], [-30, 20], [-38, 4]], { fill: o.hatCol || 'red', seed: seed + 1, line: 3.2 });
  }
}

// a person. opts: x,y,s,dir, tunic, sleeve, legs, hat, hatCol, legA[2], armA[2], tilt, sit, hatDown, skirt, beard, cane, bundle('stick'|null), hair, seed
function person(o) {
  const seed = o.seed || 10, dir = o.dir || 1, s = o.s || 1;
  const sitDrop = o.sit ? 104 : 0;
  const m = chain(T(o.x, o.y), Sm(s * dir, s), T(0, sitDrop));
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
  if (!o.skirt) leg(chain(m, T(hip[0] - 8, hip[1]), Rm(-legA[0])), o.legs || 'yellow', seed + 1);
  arm(chain(U, T(shB[0], shB[1]), Rm(-armA[0])), o.sleeve || 'red', seed + 2);
  // body
  if (o.skirt) {
    part(m, [[-30, -150], [30, -150], [44, -70], [56, -4], [0, 2], [-54, -4], [-42, -70]], { fill: o.skirt, seed: seed + 3, line: 3.8 });
    lineP(m, [[-8, -130], [-20, -10]], 1.8, seed + 31, false); lineP(m, [[14, -130], [24, -12]], 1.8, seed + 32, false);
    inkFill(ap(m, rough(spline([[-30, -4], [-6, -6], [-4, 6], [-30, 6]], true, 3), seed + 33, 1)));
  } else leg(chain(m, T(hip[0] + 8, hip[1]), Rm(-legA[1])), o.legs || 'yellow', seed + 4);
  part(U, [[-30, -240], [0, -246], [30, -240], [34, -180], [44, -112], [0, -102], [-42, -112], [-34, -180]], { fill: o.tunic || 'blue', seed: seed + 5, line: 4 });
  part(U, [[-36, -156], [36, -156], [37, -144], [-37, -144]], { fill: o.belt || 'yellow', seed: seed + 6, line: 2.6, smooth: false });
  lineP(U, [[-6, -240], [-12, -108]], 1.8, seed + 7, false); lineP(U, [[16, -236], [26, -112]], 1.8, seed + 8, false);
  // tunic fold hatching
  hatch(U, [[-34, -140], [-4, -140], [-6, -106], [-40, -112]], .9, 7, 1.6, seed + 9, .8);
  if (o.bundle === 'stick') lineP(U, [stickB, [lerp(stickB[0], stickA[0], .5), lerp(stickB[1], stickA[1], .5) - 4], [stickA[0] + 14, stickA[1] + 6]], 5, seed + 62);
  // head (pivots at the neck)
  const hm = chain(U, T(2, -244), o.lookBack ? Sm(-1, 1) : I, Rm(-(o.tilt || 0)));
  head(hm, o, seed + 40);
  if (o.hat && o.hat !== 'none') hat(o.hatDown ? chain(hm, T(4, 14), Rm(.16)) : hm, o, seed + 50);
  // front arm, cane
  arm(chain(U, T(shF[0], shF[1]), Rm(-armA[1])), o.sleeve || 'red', seed + 11);
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

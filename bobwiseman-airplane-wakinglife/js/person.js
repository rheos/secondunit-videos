// The talker: an anonymous woman in her forties, short dark bob, round glasses, mustard cardigan
// over a pale shirt. Not a likeness of anyone. Drawn from a skeleton with naturalistic proportions
// (head ~ 1/7.5 of standing height); the pose comes from gesture keyframes plus breathing and
// weight-shift noise, so she moves like traced footage rather than a cartoon.
const STYLE = {
  skin: [24, 36, 67], skinSh: [14, 30, 52], hair: [255, 14, 19], hairSh: [255, 18, 12],
  top: [41, 52, 50], topSh: [30, 46, 37], shirt: [205, 22, 84], shirtSh: [215, 18, 68],
  pants: [218, 18, 30], pantsSh: [222, 22, 20], shoe: [20, 18, 16], lip: [2, 34, 42], mouth: [355, 35, 22],
};
const C = (k, dl = 0, a = 1) => { const [h, sa, l] = STYLE[k]; return hsl(h, sa, l + dl, a); };
const dirv = (a) => [Math.sin(a), Math.cos(a)]; // a = 0 points down, +pi/2 right, pi up
const pt = (p, d, L) => [p[0] + d[0] * L, p[1] + d[1] * L];

// Closed outline around a two-bone limb a-b-c with widths.
function limb(a, b, c, wa, wb, wc) {
  const nrm = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1; return [-dy / L, dx / L, dx / L, dy / L]; };
  const [n1x, n1y, d1x, d1y] = nrm(a, b), [n2x, n2y, d2x, d2y] = nrm(b, c);
  let bx = n1x + n2x, by = n1y + n2y; const bl = Math.hypot(bx, by) || 1; bx /= bl; by /= bl;
  const m1 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], m2 = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];
  return [
    [a[0] + n1x * wa, a[1] + n1y * wa], [m1[0] + n1x * (wa + wb) * .5, m1[1] + n1y * (wa + wb) * .5], [b[0] + bx * wb, b[1] + by * wb],
    [m2[0] + n2x * (wb + wc) * .5, m2[1] + n2y * (wb + wc) * .5], [c[0] + n2x * wc, c[1] + n2y * wc], [c[0] + d2x * wc * .5, c[1] + d2y * wc * .5],
    [c[0] - n2x * wc, c[1] - n2y * wc], [m2[0] - n2x * (wb + wc) * .5, m2[1] - n2y * (wb + wc) * .5], [b[0] - bx * wb, b[1] - by * wb],
    [m1[0] - n1x * (wa + wb) * .5, m1[1] - n1y * (wa + wb) * .5], [a[0] - n1x * wa, a[1] - n1y * wa], [a[0] - d1x * wa * .4, a[1] - d1y * wa * .4],
  ];
}
// Hand at wrist w pointing along angle a; open 0 (loose, curled) .. 1 (spread palm); flip mirrors the thumb side.
function hand(w, a, open, flip, seed, L = 1) {
  withT(() => {
    s.translate(w[0], w[1]); s.rotate(-a + Math.PI / 2); if (flip) s.scale(1, -1); s.scale(L, L);
    // local: +x along the hand, -y thumb side
    const sp = .25 + open * .75, fl = .5 + open * .5, P = [[0, -15], [18, -18]];
    P.push([24, -24 - sp * 5], [34, -32 - sp * 8], [41, -30 - sp * 7], [36, -21]);         // thumb
    const fy = [-11, -3.5, 4, 11], fL = [26, 30, 28, 21];
    for (let i = 0; i < 4; i++) { const y = fy[i] * (1 + sp * .45), tip = 36 + fL[i] * fl, hw = 3.4 - i * .25; P.push([36, y - hw], [tip - 2, y - hw], [tip + 1.5, y], [tip - 2, y + hw]); }
    P.push([34, 15], [24, 17], [0, 14]);
    part(P, { fill: C('skin'), shade: C('skinSh'), shadeShift: [-5, -6], seed, seg: 3, inkW: .8, wob: .35, reg: .5 });
    stroke([[24, -8], [30, 2], [26, 10]], seed + 7, .5);
  });
}

// P: { x, y, sc, lean, twist, shrug, breath, turn, tilt, nod, mouth, blink, brow, armL:[a1,a2,hand,open,fore], armR, legs:[l1,l2,r1,r2],
//      back (seen from behind), sky (0..1: the head becomes a cloudy sky), skyDraw(F) callback, parts: 'all'|'body'|'arms', light }
function person(P) {
  const parts = P.parts || 'all', light = P.light || [10, -6];
  s.save(); s.translate(P.x, P.y); s.scale(P.sc, P.sc);
  const lean = P.lean || 0, br = P.breath || 0, tw = P.twist || 0;
  const up = [Math.sin(lean), -Math.cos(lean)], sd = [Math.cos(lean), Math.sin(lean)];
  const at = (u, v) => [sd[0] * u + up[0] * v, sd[1] * u + up[1] * v];
  const chest = 250 + br * 3, sw = 90 + br * 1.5, shr = P.shrug || 0;
  const shL = at(-sw + 18 + tw * 10, chest - 16 + shr), shR = at(sw - 18 + tw * 10, chest - 16 + shr * .7);
  const seedB = P.seed || 100;
  const J = { shL, shR };

  const drawLegs = () => {
    if (!P.legs) return;
    const [l1, l2, r1, r2] = P.legs;
    for (const [side, a1, a2, sdd] of [[-1, l1, l2, 0], [1, r1, r2, 1]]) {
      const hip = at(side * 40, 0), kn = pt(hip, dirv(a1 - lean), 188), an = pt(kn, dirv(a1 + a2 - lean), 182);
      part(limb(hip, kn, an, 38, 27, 19), { fill: C('pants'), shade: C('pantsSh'), shadeShift: light, seed: seedB + 40 + sdd * 3, inkW: 1 });
      stroke([[kn[0] - 14, kn[1] - 6], [kn[0] + 4, kn[1] + 2], [kn[0] + 16, kn[1] - 4]], seedB + 46 + sdd, .6);
      const fa = a1 + a2 - lean + (P.toe || 0) * side * .1, d = dirv(fa), n = [-d[1], d[0]];
      const tip = pt(an, d, 52 * (P.footDown ? 1 : .55)), sideOff = P.footDown ? 0 : side * 26;
      part([[an[0] - n[0] * 15, an[1] - n[1] * 15], [an[0] + n[0] * 15, an[1] + n[1] * 15], [tip[0] + n[0] * 12 + sideOff, tip[1] + n[1] * 4 + 14], [tip[0] - n[0] * 12 + sideOff, tip[1] - n[1] * 4 + 14]],
        { fill: C('shoe'), shade: C('shoe', -6), seed: seedB + 50 + sdd, inkW: .9 });
    }
  };
  const drawTorso = () => {
    const hem = P.hem || 0; // cardigan hem flutter (levitation)
    const T0 = [at(-76, -24 + snoise(T * 1.3, seedB) * hem), at(-82, 60), at(-84, 150), at(-sw - 4, chest - 40), at(-sw + 6, chest - 4 + shr), at(-sw + 34, chest + 14 + shr * .5),
      at(-28, chest + 22), at(28, chest + 22), at(sw - 34, chest + 14 + shr * .4), at(sw - 6, chest - 4 + shr * .7), at(sw + 4, chest - 40), at(84, 150), at(82, 60), at(76, -24 + snoise(T * 1.4, seedB + 1) * hem), at(0, -30 + snoise(T * 1.1, seedB + 2) * hem * .6)];
    part(T0, { fill: C('top'), shade: C('topSh'), shadeShift: light, seed: seedB, inkW: 1.1 });
    if (!P.back) {
      part([at(-27, chest + 21), at(27, chest + 21), at(12, chest - 50), at(0, chest - 96), at(-12, chest - 50)], { fill: C('shirt'), shade: C('shirtSh'), shadeShift: light, seed: seedB + 3, inkW: .8, hatch: false });
      stroke([at(-28, chest + 22), at(-14, chest + 4), at(0, chest + 14)], seedB + 4, .7); stroke([at(28, chest + 22), at(14, chest + 4), at(0, chest + 14)], seedB + 5, .7);
      stroke([at(-12, chest - 50), at(-6, chest - 130), at(-3, -10)], seedB + 6, .7);                    // cardigan opening
      stroke([at(-60, chest - 70), at(-40, chest - 110), at(-52, chest - 160)], seedB + 7, .5);           // folds
      stroke([at(58, chest - 90), at(44, chest - 140)], seedB + 8, .5);
    } else {
      stroke([at(-30, chest + 18), at(0, chest + 10), at(30, chest + 18)], seedB + 4, .7);
      stroke([at(-40, chest - 60), at(-30, chest - 150)], seedB + 7, .5); stroke([at(36, chest - 80), at(30, chest - 170)], seedB + 8, .5);
    }
  };
  const neckB = at(tw * 8, chest + 12), headUp = lean + (P.tilt || 0);
  const hc = pt(at(tw * 10, chest + 40), [Math.sin(headUp), -Math.cos(headUp)], 60);
  const drawHead = () => {
    const nk = [at(-17 + tw * 8, chest + 6), [hc[0] - 15, hc[1] + 20], [hc[0] + 15, hc[1] + 20], at(17 + tw * 8, chest + 6)];
    part(nk, { fill: C('skin'), shade: C('skinSh'), shadeShift: [light[0] * 1.6, 0], seed: seedB + 9, inkW: .9, seg: 3, hatch: false });
    withT(() => { s.translate(hc[0], hc[1]); s.rotate(headUp); s.scale(1.12, 1.12); P.back ? headBack(P, seedB + 20, light) : headFront(P, seedB + 20, light); });
  };
  const drawArm = (key, side) => {
    const A = P[key]; if (!A) return;
    const [a1, a2, ha = 0, open = .5, fore = 1] = A, sh = side < 0 ? shL : shR;
    const el = pt(sh, dirv(a1 - lean), 128), wr = pt(el, dirv(a1 + a2 - lean), 116 * fore);
    part(limb(sh, el, wr, 30, 25, 18), { fill: C('top'), shade: C('topSh'), shadeShift: light, seed: seedB + 60 + side, inkW: 1 });
    stroke([[el[0] - 12, el[1] - 8], [el[0], el[1] + 4], [el[0] + 12, el[1] - 6]], seedB + 63 + side, .5);
    const cuff = pt(el, dirv(a1 + a2 - lean), 100 * fore);
    hand(cuff, a1 + a2 - lean + ha, open, side < 0 ? (P.flipL ?? false) : (P.flipR ?? true), seedB + 70 + side, P.handL ?? 1);
    J[key] = { el, wr };
  };
  if (parts !== 'arms') {
    drawLegs();
    if (P.armsBehind) { drawArm('armL', -1); drawArm('armR', 1); }
    drawTorso(); drawHead();
  }
  if (parts !== 'body' && !P.armsBehind) { drawArm('armL', -1); drawArm('armR', 1); }
  s.restore();
  J.hc = [P.x + hc[0] * P.sc, P.y + hc[1] * P.sc];
  return J;
}

function headFront(P, sd, light) {
  const u = clamp(P.turn || 0, -1, 1), sq = 1 - .1 * Math.abs(u), sky = P.sky || 0, nod = P.nod || 0;
  const cx = u * 15, fy = nod * 6;
  const ex = (x) => cx + x * (Math.sign(x) === Math.sign(u) ? 1 - .42 * Math.abs(u) : 1 - .08 * Math.abs(u));
  const hairA = 1 - sky * .9;
  // back hair: the bob, wider than the face, down to the jaw
  part([[0, -66], [30, -62], [48, -40], [51, -8], [49, 24], [45, 44], [30, 47], [24, 30], [-24, 30], [-30, 47], [-45, 44], [-49, 24], [-51, -8], [-48, -40], [-30, -62]].map(([x, y]) => [x - u * 7, y]),
    { fill: C('hair'), shade: C('hairSh'), shadeShift: light, seed: sd, alpha: hairA, inkW: .9 });
  const face = [[0, -55], [24, -51], [36, -34], [38, -10], [36, 10], [31, 28], [21, 42], [9, 51], [0, 53], [-9, 51], [-21, 42], [-31, 28], [-36, 10], [-38, -10], [-36, -34], [-24, -51]]
    .map(([x, y]) => [x * sq + u * 5 * Math.max(0, 1 - (y / 56) ** 2), y]);
  part(face, {
    fill: C('skin'), shade: C('skinSh'), shadeShift: [light[0] * .9 - u * 6, light[1] * .6], seed: sd + 1, inkW: 1,
    extra: sky > 0 ? (F) => { s.save(); s.globalAlpha *= sky; P.skyDraw(F); s.restore(); } : null,
  });
  const fa = 1 - sky;
  if (fa > .01) {
    s.save(); s.globalAlpha *= fa;
    const bl = P.blink || 0, bu = P.brow || 0;
    for (const x of [-15, 15]) {
      const e = ex(x), w = 7 * (Math.sign(x) === Math.sign(u) ? 1 - .35 * Math.abs(u) : 1), hgt = 3.6 * (1 - bl);
      if (hgt > .4) { part([[e - w, -5 + fy], [e, -5 - hgt + fy], [e + w, -5 + fy], [e, -5 + hgt * .7 + fy]], { fill: hsl(40, 20, 92), seed: sd + 3 + x, seg: 3, ink: false, wob: .2, reg: .2 }); dot(e + u * 2 + snoise(T * .5, sd) * 1.2, -5 + fy, 2.4 * (1 - bl * .8), HAND.inkCol); }
      stroke([[e - w - 1, -5 + fy], [e, -6.5 - hgt + fy], [e + w + 1, -5 + fy]], sd + 5 + x, .8, { force: true, wob: .2 });
      stroke([[e - 9, -18 - bu * 4 + fy], [e, -21 - bu * 5 + fy], [e + 9, -19 - bu * 4 + fy]], sd + 7 + x, .9, { force: true, wob: .25 });
      part(lump(e, -5 + fy, w + 5, 11, sd + 9 + x, 10), { seed: sd + 11 + x, inkW: .55, wob: .2, reg: .4, seg: 3 }); // round glasses
    }
    stroke([[ex(-15) + 12, -6 + fy], [cx + u * 2, -9 + fy], [ex(15) - 12, -6 + fy]], sd + 13, .5, { wob: .2 });
    stroke([[cx + u * 5, -2 + fy], [cx + u * 11 + 1, 14 + fy], [cx + u * 3 - 3, 18 + fy]], sd + 15, .8, { force: true, wob: .3 });   // nose
    stroke([[cx + u * 3 + 4, 18 + fy], [cx + u * 3 - 6, 18.5 + fy]], sd + 16, .5, { wob: .2 });
    const m = clamp(P.mouth || 0), mx = cx + u * 4, my = 29 + fy;
    if (m > .04) part([[mx - 8, my], [mx, my - 1.5], [mx + 8, my], [mx, my + 2 + m * 9]], { fill: C('mouth'), seed: sd + 17, seg: 3, inkW: .6, wob: .2, reg: .2 });
    stroke([[mx - 9, my], [mx - 3, my - 1.2], [mx + 3, my - 1.2], [mx + 9, my]], sd + 18, .8, { force: true, wob: .2 });
    stroke([[mx - 5, my + 6 + m * 9], [mx, my + 7 + m * 9], [mx + 5, my + 6 + m * 9]], sd + 19, .45, { wob: .2 });
    const ns = u >= 0 ? -1 : 1; // nasolabial and cheek contour on the near side
    stroke([[cx + ns * 9 + u * 6, 15 + fy], [cx + ns * 13 + u * 4, 25 + fy]], sd + 21, .45, { wob: .2 });
    stroke([[cx + ns * 26, 2 + fy], [cx + ns * 24, 14 + fy]], sd + 22, .35, { wob: .2 });
    s.restore();
  }
  part([[-40, -26], [-42, -42], [-28, -60], [0, -66], [28, -60], [42, -42], [40, -26], [30, -31], [18, -25], [4, -34], [-10, -26], [-24, -32]].map(([x, y]) => [x + u * 9, y + fy * .4]),
    { fill: C('hair'), shade: C('hairSh'), shadeShift: light, seed: sd + 30, alpha: hairA, inkW: .9 });
  if (hairA > .05) { s.save(); s.globalAlpha *= hairA; stroke([[-20 + u * 9, -58], [-8 + u * 9, -40]], sd + 31, .4); stroke([[16 + u * 9, -60], [24 + u * 9, -36]], sd + 32, .4); s.restore(); }
}
// Seen from behind and to her right: hair covers nearly all, a sliver of cheek, jaw, ear and the glasses arm.
function headBack(P, sd, light) {
  part([[12, -55], [36, -51], [48, -34], [50, -10], [48, 10], [43, 28], [33, 42], [21, 51], [12, 53], [0, 46], [0, -40]], { fill: C('skin'), shade: C('skinSh'), shadeShift: [-8, 0], seed: sd + 1, inkW: 1 });
  part([[-50, -30], [-30, -62], [0, -68], [26, -58], [34, -38], [31, -14], [28, 10], [27, 32], [18, 50], [-20, 54], [-44, 42], [-53, 10]],
    { fill: C('hair'), shade: C('hairSh'), shadeShift: light, seed: sd, inkW: 1 });
  part([[27, -12], [36, -15], [41, -3], [37, 12], [29, 14]], { fill: C('skin'), shade: C('skinSh'), shadeShift: [-4, 0], seed: sd + 2, seg: 3, inkW: .8 });
  stroke([[50, -9], [42, -8], [31, -10]], sd + 3, .55, { force: true, wob: .2 });
  stroke([[-30, -50], [-20, -10], [-24, 30]], sd + 4, .4); stroke([[4, -60], [8, -20], [6, 30]], sd + 5, .4);
}

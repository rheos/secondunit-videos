// The talker: an anonymous woman in her forties, short dark bob, round glasses, mustard cardigan
// over a pale shirt. Not a likeness of anyone. Drawn from a skeleton with naturalistic proportions
// (head ~ 1/7.5 of standing height); the pose comes from gesture keyframes plus breathing and
// weight-shift noise, so she moves like traced footage rather than a cartoon.
// Every talker is an anonymous invented character; a style is a palette plus hair, glasses and beard.
const BASE = { pants: [218, 18, 30], pantsSh: [222, 22, 20], shoe: [20, 18, 16], lip: [2, 34, 42], mouth: [355, 35, 22], build: 1 };
const CAST = {
  diner: { ...BASE, hairType: 'bob', glasses: true, // the woman from the finished test
    skin: [24, 36, 67], skinSh: [14, 30, 52], hair: [255, 14, 19], hairSh: [255, 18, 12],
    top: [41, 52, 50], topSh: [30, 46, 37], shirt: [205, 22, 84], shirtSh: [215, 18, 68] },
  commuter: { ...BASE, hairType: 'short', beard: true, build: 1.06, // a grey-bearded man in a navy coat, on the train
    skin: [20, 30, 63], skinSh: [12, 28, 50], hair: [30, 5, 72], hairSh: [30, 6, 58],
    top: [218, 32, 32], topSh: [222, 34, 22], shirt: [4, 40, 48], shirtSh: [2, 40, 36] },
  roof: { ...BASE, hairType: 'curly', build: .98, // a young man in a red hoodie, on the roof
    skin: [24, 38, 44], skinSh: [18, 38, 33], hair: [20, 25, 12], hairSh: [20, 25, 7],
    top: [8, 58, 47], topSh: [4, 56, 36], shirt: [8, 50, 40], shirtSh: [4, 50, 31], pants: [215, 35, 40], pantsSh: [218, 35, 30] },
  nana: { ...BASE, hairType: 'curly', hairScale: .82, glasses: true, build: .95, // an old woman in a lilac cardigan, in the armchair
    skin: [22, 38, 74], skinSh: [14, 32, 60], hair: [40, 8, 86], hairSh: [220, 8, 70],
    top: [282, 24, 62], topSh: [276, 22, 49], shirt: [45, 40, 90], shirtSh: [40, 30, 76], pants: [250, 12, 40], pantsSh: [250, 12, 30] },
  student: { ...BASE, hairType: 'long', build: .94, // a student in an olive jacket, in the lecture hall
    skin: [26, 42, 64], skinSh: [16, 36, 50], hair: [14, 52, 30], hairSh: [10, 52, 21],
    top: [72, 26, 38], topSh: [78, 26, 28], shirt: [40, 20, 88], shirtSh: [35, 16, 74] },
  prof: { ...BASE, hairType: 'bald', beard: true, glasses: true, build: 1.04, // a lecturer in a white coat
    skin: [27, 40, 56], skinSh: [18, 38, 43], hair: [24, 20, 16], hairSh: [24, 20, 10],
    top: [200, 10, 90], topSh: [210, 14, 76], shirt: [205, 40, 62], shirtSh: [210, 40, 48] },
};
let STYLE = CAST.diner;
const SKINKEYS = { skin: 1, skinSh: 1, lip: 1, mouth: 1 };
const C = (k, dl = 0, a = 1) => { const [h, sa, l] = STYLE[k]; return hsl(h, sa, l + dl, a, SKINKEYS[k] ? SKINK : 1); };
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
// Built as a palm plus four tapered two-joint fingers fanning from a curved knuckle line and a thumb,
// so it reads as a drawn hand at any size (the old single outline turned into a comb when spread).
function hand(w, a, open, flip, seed, L = 1) {
  withT(() => {
    s.translate(w[0], w[1]); s.rotate(-a + Math.PI / 2); if (flip) s.scale(1, -1); s.scale(L, L);
    // local: +x along the hand, -y thumb side
    const sp = clamp(open), curl = 1 - sp;
    const fing = (k0, ang, len, w0, bend, sd) => {
      const d1 = [Math.cos(ang), Math.sin(ang)], m = [k0[0] + d1[0] * len * .55, k0[1] + d1[1] * len * .55];
      const a2 = ang + bend, d2 = [Math.cos(a2), Math.sin(a2)], tip = [m[0] + d2[0] * len * .45, m[1] + d2[1] * len * .45];
      part(limb(k0, m, tip, w0, w0 * .86, w0 * .74), { fill: C('skin'), shade: C('skinSh'), shadeShift: [-2, -2.5], seed: sd, seg: 3, inkW: .55, wob: .12, reg: .25, tone2: false, hi: null, hatch: false });
    };
    const kn = [[33, -9.5], [36.5, -3.2], [36, 3.4], [32.5, 9.6]], fL = [25, 29, 27, 21];
    for (let i = 3; i >= 0; i--) {
      const fan = (i - 1.5) * (.07 + sp * .17), bend = curl * (1.0 + i * .12);
      fing(kn[i], fan + curl * .35, fL[i] * (.82 + sp * .18), 3.6 - i * .2, bend, seed + 40 + i);
    }
    part([[0, -13], [14, -15.5], [27, -13.5], [35, -9], [37.5, -2], [36.5, 5], [33, 11.5], [24, 15.5], [12, 15.5], [0, 13]],
      { fill: C('skin'), shade: C('skinSh'), shadeShift: [-4, -5], seed, seg: 4, inkW: .65, wob: .18, reg: .35, tone2: false, hatch: false });
    const ta = -(.75 + sp * .55);
    fing([13, -12], ta, 21 + sp * 3, 4.6, curl * .5 + .25, seed + 49);
    stroke([[22, -6], [27, 1], [24, 8]], seed + 7, .35, { wob: .1 });
  });
}
// P: { x, y, sc, lean, twist, shrug, breath, turn, tilt, nod, mouth, blink, brow, armL:[a1,a2,hand,open,fore], armR, legs:[l1,l2,r1,r2],
//      back (seen from behind), sky (0..1: the head becomes a cloudy sky), skyDraw(F) callback, parts: 'all'|'body'|'arms', light }
function person(P) {
  const parts = P.parts || 'all', light = P.light || [10, -6];
  const keepS = STYLE, keepI = INKK, keepW = WOBK; STYLE = P.style || STYLE; INKK = P.inkK ?? INKK; WOBK = P.wobK ?? WOBK;
  s.save(); s.translate(P.x, P.y); s.scale(P.sc, P.sc);
  const lean = P.lean || 0, br = P.breath || 0, tw = P.twist || 0;
  const up = [Math.sin(lean), -Math.cos(lean)], sd = [Math.cos(lean), Math.sin(lean)];
  const at = (u, v) => [sd[0] * u + up[0] * v, sd[1] * u + up[1] * v];
  const chest = 250 + br * 3, sw = (90 + br * 1.5) * (STYLE.build || 1), shr = P.shrug || 0;
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
  STYLE = keepS; INKK = keepI; WOBK = keepW;
  J.hc = [P.x + hc[0] * P.sc, P.y + hc[1] * P.sc];
  return J;
}

function headFront(P, sd, light) {
  const u = clamp(P.turn || 0, -1, 1), sq = 1 - .1 * Math.abs(u), sky = P.sky || 0, nod = P.nod || 0, ST = STYLE, ht = ST.hairType || 'bob';
  const cx = u * 15, fy = nod * 6;
  const ex = (x) => cx + x * (Math.sign(x) === Math.sign(u) ? 1 - .42 * Math.abs(u) : 1 - .08 * Math.abs(u));
  const hairA = 1 - sky * .9, hs = ST.hairScale || 1;
  const hairOpt = (k) => ({ fill: C('hair'), shade: C('hairSh'), shadeShift: light, seed: sd + k, alpha: hairA, inkW: .9, tone2: false });
  // back hair
  if (ht === 'bob') part([[0, -66], [30, -62], [48, -40], [51, -8], [49, 24], [45, 44], [30, 47], [24, 30], [-24, 30], [-30, 47], [-45, 44], [-49, 24], [-51, -8], [-48, -40], [-30, -62]].map(([x, y]) => [x - u * 7, y]), hairOpt(0));
  if (ht === 'long') part([[0, -66], [32, -62], [50, -40], [54, -8], [56, 40], [60, 96], [36, 104], [26, 40], [-26, 40], [-36, 104], [-60, 96], [-56, 40], [-54, -8], [-50, -40], [-32, -62]].map(([x, y]) => [x - u * 8, y]), hairOpt(0));
  if (ht === 'curly') part(lump(-u * 6, -26, 60 * hs, 52 * hs, sd + 40, 18), hairOpt(0));
  // ears, where the hair leaves them showing
  if (ht !== 'bob' && ht !== 'long') for (const x of [-1, 1]) {
    const vis = x * u > .55 ? 0 : 1; if (!vis) continue;
    const exx = cx + x * (38 - (x * u > 0 ? 6 * Math.abs(u) : -2 * Math.abs(u))) - u * 4;
    part([[exx, -12], [exx + x * 9, -16], [exx + x * 11, -2], [exx + x * 7, 12], [exx, 10]], { fill: C('skin'), shade: C('skinSh'), shadeShift: [-x * 3, -2], seed: sd + 50 + x, seg: 3, inkW: .7, tone2: false });
  }
  const face = [[0, -55], [24, -51], [36, -34], [38, -10], [36, 10], [31, 28], [21, 42], [9, 51], [0, 53], [-9, 51], [-21, 42], [-31, 28], [-36, 10], [-38, -10], [-36, -34], [-24, -51]]
    .map(([x, y]) => [x * sq + u * 5 * Math.max(0, 1 - (y / 56) ** 2), y]);
  part(face, {
    fill: C('skin'), shade: C('skinSh'), shadeShift: [light[0] * .9 - u * 6, light[1] * .6], seed: sd + 1, inkW: 1, hatch: false,
    extra: sky > 0 ? (F) => { s.save(); s.globalAlpha *= sky; P.skyDraw(F); s.restore(); } : null,
  });
  const fa = 1 - sky;
  if (fa > .01) {
    s.save(); s.globalAlpha *= fa;
    const bl = P.blink || 0, bu = P.brow || 0;
    if (ST.beard) { // beard and moustache sit under the mouth line
      part([[-35, 4], [-31, 28], [-19, 47], [0, 57], [19, 47], [31, 28], [35, 4], [27, 18], [14, 23], [0, 21], [-14, 23], [-27, 18]].map(([x, y]) => [x * sq + u * 6, y + fy * .5]),
        { fill: C('hair'), shade: C('hairSh'), shadeShift: [light[0] * .5, -4], seed: sd + 60, inkW: .7, tone2: false, hatch: false });
      part([[-13, 24.5], [0, 20.5], [13, 24.5], [9, 27.5], [0, 25.5], [-9, 27.5]].map(([x, y]) => [x + cx + u * 4, y + fy]), { fill: C('hair', -4), seed: sd + 61, inkW: .5, seg: 3, tone2: false });
    }
    for (const x of [-15, 15]) {
      const e = ex(x), near = Math.sign(x) === Math.sign(u), w = 7 * (near ? 1 - .35 * Math.abs(u) : 1), hgt = 3.6 * (1 - bl);
      if (hgt > .4) {
        part([[e - w, -5 + fy], [e, -5 - hgt + fy], [e + w, -5 + fy], [e, -5 + hgt * .7 + fy]], { fill: hsl(40, 20, 92), seed: sd + 3 + x, seg: 4, ink: false, wob: .15, reg: .15 });
        const px = e + u * 2 + snoise(T * .5, sd) * 1.2; dot(px, -5 + fy, 2.3 * (1 - bl * .8), HAND.inkCol); dot(px + .8, -5.9 + fy, .6, hsl(40, 30, 96, .9));
      }
      stroke([[e - w - 1, -5 + fy], [e, -6.5 - hgt + fy], [e + w + 1, -5 + fy]], sd + 5 + x, .7, { force: true, wob: .12 });
      if (P.detail) stroke([[e - w + 1, -2 + fy], [e, -1 + fy], [e + w - 1, -2 + fy]], sd + 6 + x, .25, { force: true, wob: .1, alpha: .5 }); // lower lid
      stroke([[e - 9, -17 - bu * 4 + fy], [e - 2, -20.5 - bu * 5 + fy], [e + 9, -18.5 - bu * 4 + fy]], sd + 7 + x, .85, { force: true, wob: .15, col: ST.hairType === 'curly' || ST.hairType === 'bald' ? C('hair', -6) : undefined });
      if (ST.glasses) { // round wire frames: a smooth ellipse, thin, with a faint lens glint
        const G = ellipse(e, -5 + fy, w + 4.5, 9.5, 14);
        part(G, { seed: sd + 11 + x, inkW: .42, wob: .08, reg: .2, seg: 4, fill: hsl(200, 30, 90, .1), tone2: false, hi: null });
        stroke([[e - w * .4, -11 + fy], [e + w * .3, -12.5 + fy]], sd + 12 + x, .3, { force: true, wob: .05, col: hsl(0, 0, 100, .55) });
      }
    }
    if (ST.glasses) stroke([[ex(-15) + 11, -6 + fy], [cx + u * 2, -8 + fy], [ex(15) - 11, -6 + fy]], sd + 13, .4, { wob: .1 });
    // nose: a fine bridge line, a soft shadow under the tip and one nostril, nothing heavy
    const nx = cx + u * 7;
    stroke([[nx - 1, 0 + fy], [nx + u * 4 + 1.5, 12 + fy]], sd + 15, .42, { force: true, wob: .12 });
    part([[nx - 6, 16 + fy], [nx + 2, 14 + fy], [nx + 6, 17 + fy], [nx, 19 + fy]], { fill: C('skinSh', -2, .55), seed: sd + 14, ink: false, seg: 3, wob: .1, reg: .1 });
    stroke([[nx + (u > 0 ? -5 : 2), 16.5 + fy], [nx + (u > 0 ? -2 : 5), 17 + fy]], sd + 16, .35, { wob: .1 });
    const m = clamp(P.mouth || 0), mx = cx + u * 4, my = 29 + fy;
    if (m > .04) part([[mx - 8, my], [mx, my - 1.5], [mx + 8, my], [mx, my + 2 + m * 9]], { fill: C('mouth'), seed: sd + 17, seg: 3, inkW: .5, wob: .15, reg: .15, tone2: false });
    stroke([[mx - 9, my], [mx - 3, my - 1.2], [mx + 3, my - 1.2], [mx + 9, my]], sd + 18, .7, { force: true, wob: .12 });
    if (!ST.beard) stroke([[mx - 5, my + 6 + m * 9], [mx, my + 7 + m * 9], [mx + 5, my + 6 + m * 9]], sd + 19, .35, { wob: .12 });
    const ns = u >= 0 ? -1 : 1; // nasolabial and cheek contour on the near side
    stroke([[cx + ns * 9 + u * 6, 15 + fy], [cx + ns * 13 + u * 4, 25 + fy]], sd + 21, .35, { wob: .12, alpha: .8 });
    s.restore();
  }
  // front hair
  const F2 = (pts) => pts.map(([x, y]) => [x + u * 9, y + fy * .4]);
  if (ht === 'bob' || ht === 'long') {
    part(F2([[-40, -26], [-42, -42], [-28, -60], [0, -66], [28, -60], [42, -42], [40, -26], [30, -31], [18, -25], [4, -34], [-10, -26], [-24, -32]]), hairOpt(30));
    if (hairA > .05) { s.save(); s.globalAlpha *= hairA; stroke([[-20 + u * 9, -58], [-8 + u * 9, -40]], sd + 31, .35); stroke([[16 + u * 9, -60], [24 + u * 9, -36]], sd + 32, .35); s.restore(); }
  } else if (ht === 'short') {
    part(F2([[-38, -18], [-41, -38], [-28, -59], [0, -66], [28, -59], [41, -38], [38, -18], [33, -34], [14, -44], [-6, -42], [-26, -38], [-34, -30]]), hairOpt(30));
  } else if (ht === 'curly') {
    const r = rng(sd + 33); s.save(); s.globalAlpha *= hairA;
    for (let i = 0; i < 9; i++) { const a = Math.PI * (1.05 + i / 8 * .9), R = 50 * hs; part(lump(Math.cos(a) * R * .85 + u * 8, -30 + Math.sin(a) * R * .72, 13 * hs + r() * 4, 11 * hs + r() * 3, sd + 70 + i, 9), { ...hairOpt(80 + i), alpha: undefined, inkW: .6 }); }
    s.restore();
  } else if (ht === 'bald') {
    for (const x of [-1, 1]) part(F2([[x * 36, -26], [x * 40, -10], [x * 38, 6], [x * 34, -2], [x * 33, -18]]), hairOpt(30 + x));
    stroke([[-14 + u * 9, -50], [0 + u * 9, -54], [12 + u * 9, -51]], sd + 34, .3, { force: true, col: hsl(30, 30, 90, .5) }); // shine
  }
}
// Seen from behind and to her right: hair covers nearly all, a sliver of cheek, jaw, ear and the glasses arm.
function headBack(P, sd, light) {
  part([[12, -55], [36, -51], [48, -34], [50, -10], [48, 10], [43, 28], [33, 42], [21, 51], [12, 53], [0, 46], [0, -40]], { fill: C('skin'), shade: C('skinSh'), shadeShift: [-8, 0], seed: sd + 1, inkW: 1 });
  const lng = STYLE.hairType === 'long' ? 50 : 0;
  part([[-50, -30], [-30, -62], [0, -68], [26, -58], [34, -38], [31, -14], [28, 10], [27, 32 + lng], [18, 50 + lng], [-20, 54 + lng], [-44, 42 + lng], [-53, 10]],
    { fill: C('hair'), shade: C('hairSh'), shadeShift: light, seed: sd, inkW: 1, tone2: false });
  part([[27, -12], [36, -15], [41, -3], [37, 12], [29, 14]], { fill: C('skin'), shade: C('skinSh'), shadeShift: [-4, 0], seed: sd + 2, seg: 3, inkW: .8 });
  stroke([[50, -9], [42, -8], [31, -10]], sd + 3, .55, { force: true, wob: .2 });
  stroke([[-30, -50], [-20, -10], [-24, 30]], sd + 4, .4); stroke([[4, -60], [8, -20], [6, 30]], sd + 5, .4);
}

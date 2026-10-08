// ---- THE WYRD ONE, scratchboard (the engrave look) ----
// Drawn after the LOCKED model sheet, gpt/character/wyrd-one-scratchboard-sheet-LOCKED.png (Robin, 2026-10-07):
// sheet proportions (broad shoulders, a wide-flaring open duster whose shredded strips reach the boots),
// a wide hat with a braided band, a veil of fine strings over the FACE only, his own long wavy hair
// (never dreadlocks; from behind you see only hair), the green beaded rosette amulet with its fringe, a
// black Les Paul with cream binding. In the engraving he is a black silhouette; every detail is a white
// scratch drawn in on the underpainting, mostly on the side the light comes from.
// Same contract as wyrd(): (x, y) = ground between the boots, h = crown to sole, o = wyrd() options.
// Extra: o.light = +1 light from screen right (default), -1 from screen left.
function wyrdEng(t, x, y, h, o = {}) {
  const { view = 'front', turn = 0, guitar = 'play', arms = 'guitar', sing = 0, wind = .3, walk = 0, g = s } = o;
  const back = view === 'back', occl = g === f, L = o.light ?? 1;
  const u = h / 100, X = (ux) => x + ux * u;
  const INK = '#050506', ink = (pts) => poly(g, pts, INK);
  const sc = (a) => `rgba(240,236,226,${Math.min(.97, .35 + a * 1.25)})`; // the scratch colour: bright, or the engraving turns it to hatching
  const lw = (k) => Math.max(1, k * u);                              // line width, never under a pixel
  const scr = (pts, a, w = .22) => { if (!occl) stroke(g, pts, sc(a), lw(w)); };
  const sdot = (px, py, r, a) => { if (!occl) dot(g, px, py, Math.max(.6, r * u), sc(a)); };
  // engraved shading along a fold: short parallel scratches at an angle, thinning out away from the light
  const hatch = (pts, side, a, seed) => { if (occl) return; for (let i = 0; i < pts.length - 1; i++) { if (hash(i * 7 + seed) < .25) continue;
    const [px, py] = pts[i], len = (1.2 + 1.4 * hash(i * 3 + seed)) * u, ang = -.9 * side + (hash(i + seed) - .5) * .3;
    stroke(g, [[px, py], [px + Math.cos(ang) * len * side, py + Math.sin(ang) * len]], sc(a * (.5 + .5 * hash(i * 11 + seed))), lw(.12)); } };
  const playing = guitar === 'play' && !back;
  const croon = sing > 0 && !playing && arms === 'down' && !back && !walk ? sing : 0;
  // breathing, phrasing, gait, the rock with the beat (same feel as wyrd())
  const br = Math.sin(t * TAU / 4.2) * .6;
  const v = sing > 0 ? F('voc', t, 3) : 0, vk = sing * clamp(v * 1.2);
  const gait = walk ? Math.sin(walk * TAU) : 0, bobY = walk ? Math.abs(gait) * -1.2 * u : 0;
  const Y = (uy) => y - uy * u + bobY;
  const groove = o.groove ?? 1, hunch = o.hunch ?? (playing ? .8 : .3 + .4 * croon);
  const leanK = (o.lean ?? (playing ? -.03 : .01)) + groove * (walk ? 0 : sway(t) * .02 + snoise(t * .35, 23) * .012);
  const nod = sing * (snoise(t * 1.7, 21) * .5 + vk * 1.1) + groove * hunch * bob(t) * .6;
  const tw = clamp(turn + croon * snoise(t * .4, 24) * .12, -.5, .5);
  const hipYw = y + bobY, ctxs = occl ? [f] : [g, f];
  for (const c of ctxs) { c.save(); c.transform(1, 0, -leanK, 1, leanK * hipYw, 0); }
  const J = {};

  // ---- the frame of him (units up from the soles) ----
  const SH = 13.5 * (1 - Math.abs(tw) * .12), neckY = 74.5 + br * .25 + vk * .5 - hunch * 1.2;
  const headX = tw * 3 + hunch * (playing ? 1.2 : 0), headY = 83 + br * .3 + vk * .8 - nod * .5 - hunch * (playing ? 3 : 1.5);
  const hemY = 13, flare = 19 + Math.abs(wind) * 3;
  const wx = (k) => wind * (4 + 9 * k);                               // how far the wind carries a point k (0 top .. 1 hem)

  // ---- hair behind (from behind, it's all you see of his head) ----
  const hairMass = (side) => { // one fall of wavy hair from under the brim to the shoulder blades
    const pts = [], n = 10;
    for (let i = 0; i <= n; i++) { const k = i / n; pts.push([X(headX + side * (4.6 + 3.2 * k) + wind * 3 * k + Math.sin(k * 7 + t * .8 + side) * .5 * k), Y(headY + 3 - k * 21)]); }
    for (let i = n; i >= 0; i--) { const k = i / n; pts.push([X(headX + side * (1.5 + 1.2 * k) + wind * 2 * k), Y(headY + 3 - k * 23)]); }
    return pts; };
  const hairStrands = (side, n, a) => { for (let j = 0; j < n; j++) { const off = (back ? 1.8 : 4.4) + j * (back ? 3.6 : 2.6) / n, len = (back ? 15 : 11) + 7 * hash(j * 7 + (side > 0 ? 3 : 1)), y0 = back ? headY + 2 : headY - 2.4; // from the front the hair shows below the brim, outside the veil
    const fq = 10 + 6 * hash(j * 5 + 1), am = .7 + .8 * hash(j * 9 + 4), pts = [];
    for (let i = 0; i <= 24; i++) { const k = i / 24; pts.push([X(headX + side * (off + 1.8 * k) + wind * 3 * k + Math.sin(k * fq + j * 1.7 + t * .9) * am * (.4 + k)), Y(y0 - k * len)]); }
    const aa = (side === L || back) ? a * (.55 + .45 * hash(j * 13)) : a * .3;
    const cut = 6 + Math.floor(hash(j * 17) * 10); scr(pts.slice(0, cut), aa, .15); scr(pts.slice(cut + 2), aa * .85, .15); } };
  if (back) { ink([...hairMass(-1), ...hairMass(1).reverse()]); }
  else { ink(hairMass(-1)); ink(hairMass(1)); }

  // ---- legs and boots ----
  for (const d of [-1, 1]) { const st = walk ? gait * d * 5 : 0, kx = d * 5.2 + st * .5, fx = d * 6.5 + st;
    taper(g, [X(d * 4.6), Y(50)], [X(kx), Y(27)], 4.2 * u, 3.6 * u, INK); taper(g, [X(kx), Y(27)], [X(fx), Y(8)], 3.6 * u, 3.2 * u, INK);
    poly(g, [[X(fx - 3.2), Y(12)], [X(fx + 3.2), Y(12)], [X(fx + 3.6 + d * .4), Y(1.2)], [X(fx + 4.5 * (back ? 0 : 1) + d), Y(0)], [X(fx - 3.8), Y(0)]], INK);
    if (!back) { scr([[X(kx - 2.6), Y(29)], [X(kx + 2.2), Y(26.5)]], .35); scr([[X(kx - 2.4), Y(23)], [X(kx + 2), Y(24.5)]], .25); // knee folds
      if (d === -L * -1 || d === L) scr([[X(d * 4.6 + d * 2.8), Y(46)], [X(kx + d * 2.6), Y(28)], [X(fx + d * 2.6), Y(10)]], .35, .18); // rim down the lit leg
      for (let k = 0; k < 3; k++) scr([[X(fx - 1.2), Y(11 - k * 2.2)], [X(fx + 1.2), Y(10 - k * 2.2)]], .4, .14); // laces
      sdot(fx + 2.8, 6.5, .25, .4); } // a buckle
    scr([[X(fx - 3.8), Y(.2)], [X(fx + 4.2), Y(.2)]], .45, .2); } // the sole edge

  // ---- the duster: back panel, shredded strips, then the open front panels ----
  const panel = (side) => { const top = [X(side * 3), Y(neckY - 1)], shp = [X(side * SH), Y(neckY - 3.5)], cap = [X(side * (SH - 3.5)), Y(neckY - .6)], el = [X(side * (SH + 1.5) + wx(.35) * .3), Y(48)];
    const hem = [X(side * flare + wx(1) * (side * wind > 0 ? 1.2 : .6)), Y(hemY)], inn = [X(side * (back ? 0 : 5.5) + wx(1) * .5), Y(hemY + 1)];
    return [top, cap, shp, el, hem, inn, [X(side * (back ? 0 : 3.6)), Y(44)], [X(side * 2.6), Y(neckY - 8)]]; };
  if (back) { ink([...panel(-1), ...panel(1).slice().reverse()]); }
  // strips: ragged tongues of leather from the hem, streaming with the wind and the gait
  const strip = (i, n, front) => { const k = i / (n - 1) - .5, bx = k * flare * 2 * (front ? 1 : .95), len = (front ? 6 : 8) + 9 * hash(i * 13 + (front ? 5 : 9));
    const sw = wind * (6 + 6 * Math.abs(k)) + snoise(t * .8 + i * .41, front ? 31 : 32) * 2.2 + gait * 3 * k, w0 = 1.6 + hash(i * 7) * 1.1;
    const a = [X(bx + wx(1) * .9), Y(hemY + 2)], m = [X(bx + wx(1) * .9 + sw * .45), Y(hemY + 2 - len * .5)], e = [X(bx + wx(1) * .9 + sw), Y(hemY + 2 - len)];
    taper(g, a, m, w0 * u, w0 * .7 * u, INK); taper(g, m, e, w0 * .7 * u, .3 * u, INK);
    if ((bx * L > 0 || hash(i * 3) > .6) && !occl) scr([[a[0] + L * w0 * .4 * u, a[1]], [m[0] + L * w0 * .3 * u, m[1]], e], .5 * hash(i * 17 + 2) + .25, .14); };
  for (let i = 0; i < 16; i++) strip(i, 16, false);
  if (!back) { // vest and shirt between the open lapels
    poly(g, [[X(-4), Y(neckY - 1.5)], [X(4), Y(neckY - 1.5)], [X(5.2), Y(47)], [X(-5.2), Y(47)]], INK);
    for (let k = 0; k < 4; k++) sdot(.4, neckY - 9 - k * 4.4, .3, .45); // vest buttons
    scr([[X(-5), Y(49)], [X(5), Y(49)]], .3, .25);                       // the belt
    ink(panel(-1)); ink(panel(1));
    for (const side of [-1, 1]) { const p = panel(side), lit = side === L;
      scr([p[0], [X(side * 4), Y(neckY - 9)], [X(side * 4.6), Y(48)], p[5]], lit ? .55 : .25, .2);           // lapel / front edge
      if (lit) scr([p[1], p[2], p[3], p[4]], .6, .26);                                                              // the rim down the lit side
      for (let k = 0; k < 3; k++) { const fx0 = side * (6 + k * 3.4); hatch(bez([X(fx0), Y(58 - k * 3)], [X(fx0 + side * 1.2), Y(42)], [X(fx0 + side * 2 + wx(.7) * .3), Y(28)], [X(fx0 + side * 3 + wx(1) * .6), Y(hemY + 3)], 18), side, lit ? .6 : .22, k * 31 + (side > 0 ? 7 : 3)); }
      scr([[X(side * 6.5), Y(40)], [X(side * 9.5), Y(40)], [X(side * 9.5), Y(35)], [X(side * 6.5), Y(35)]], lit ? .3 : .12, .14); } } // a pocket flap
  else { // the back of the coat: a centre seam and folds catching the light
    scr([[X(0), Y(neckY - 4)], [X(wx(.6) * .4), Y(40)], [X(wx(1) * .7), Y(hemY + 2)]], .3, .16);
    for (let k = 0; k < 4; k++) { const fx0 = L * (3 + k * 3.2); hatch(bez([X(fx0), Y(62)], [X(fx0 + L), Y(44)], [X(fx0 + L * 2 + wx(.7) * .3), Y(28)], [X(fx0 + L * 3 + wx(1) * .6), Y(hemY + 3)], 18), L, .5, k * 29 + 5); }
    scr([[X(L * SH), Y(neckY - 3)], [X(L * (SH + 1.5)), Y(48)], [X(L * flare + wx(1)), Y(hemY)]], .55, .24); }
  for (let i = 0; i < 18; i++) strip(i, 18, true);
  J.hem = [X(0), Y(hemY)];

  // ---- the amulet: a beaded rosette with a dark centre and a fringe of bead strands ----
  if (!back) { const ax = X(headX * .25), ay = Y(neckY - 10.5);
    if (!occl) { stroke(g, bez([X(-3.4), Y(neckY - 1)], [X(-2.6), Y(neckY - 8)], [X(2.6), Y(neckY - 8)], [X(3.4), Y(neckY - 1)], 14), sc(.3), lw(.14));
      for (let k = 0; k < 14; k++) { const a = k / 14 * TAU; dot(g, ax + Math.cos(a) * 1.7 * u, ay + Math.sin(a) * 1.7 * u, Math.max(.6, .26 * u), sc(.75)); }
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; dot(g, ax + Math.cos(a) * .95 * u, ay + Math.sin(a) * .95 * u, Math.max(.5, .2 * u), sc(.5)); }
      for (let k = -4; k <= 4; k++) for (let j = 0; j < 6; j++) dot(g, ax + k * .42 * u + wind * j * .08 * u, ay + (2.3 + j * .62) * u, Math.max(.5, .17 * u), sc(j % 3 === 1 ? .85 : .4)); }
    J.chest = [ax, ay]; }

  // ---- arms, guitar ----
  const shL = [X(-SH + 1.2), Y(neckY - 3.5)], shR = [X(SH - 1.2), Y(neckY - 3.5)];
  const arm = (a, el, hd, lit) => { dot(g, a[0], a[1], 3.2 * u, INK); taper(g, a, el, 3.3 * u, 2.8 * u, INK); taper(g, el, hd, 2.8 * u, 2.2 * u, INK); dot(g, hd[0], hd[1], 2 * u, INK);
    if (lit && !occl) { scr([[a[0] + L * 1.8 * u, a[1] + .5 * u], [el[0] + L * 1.6 * u, el[1]], [hd[0] + L * 1.2 * u, hd[1] - .5 * u]], .45, .2);
      scr([[el[0] - 1.6 * u, el[1] + 1.5 * u], [el[0] + 1.6 * u, el[1] + .5 * u]], .3, .14); // a cuff fold
      for (let k = -1; k <= 1; k++) sdot((hd[0] - x) / u + k * .8, (y + bobY - hd[1]) / u + 1.4, .22, .45); } }; // knuckles of the glove
  let handL, handR;
  if (arms === 'out') { const lift = 6 + br; handL = [X(-SH - 28), Y(neckY + lift)]; handR = [X(SH + 28), Y(neckY + lift)];
    arm(shL, [X(-SH - 14), Y(neckY + lift * .4 - 1)], handL, L < 0); arm(shR, [X(SH + 14), Y(neckY + lift * .4 - 1)], handR, L > 0); }
  else if (playing) {
    const swayA = Math.sin(t * TAU / BEAT) * .03, ang = -.62 + swayA - tw * .06, body = [X(-4 + tw * 2), Y(46)];
    const dir = [Math.cos(ang), Math.sin(ang)];
    handR = [body[0] + dir[0] * 26 * u, body[1] + dir[1] * 26 * u];
    const pick = Math.sin(t * TAU / (BEAT / 2)) * 1.3 * u * clamp(F('mid', t, 2) * 1.5);
    handL = [body[0] + 2 * u, body[1] - 1 * u + pick];
    arm(shR, [X(SH + 3), Y(54)], handR, L > 0);            // fretting arm behind the neck
    guitarEng(g, body[0], body[1], 9.5 * u, ang, occl, u);
    arm(shL, [X(-SH - 2), Y(54)], handL, L < 0);            // strumming arm over the body
  } else if (back && guitar !== 'none') { // slung on his back: strap from his right shoulder, neck rising over it
    if (!occl) scr([[X(-SH + 2), Y(neckY - 2)], [X(SH - 3), Y(42)]], .4, .9);
    guitarEng(g, X(-5), Y(40), 9.5 * u, -1.05 + Math.PI, occl, u);
    handL = [X(-SH - 2), Y(42)]; handR = [X(SH + 2), Y(42)];
    arm(shL, [X(-SH - 1.5), Y(58)], handL, L < 0); arm(shR, [X(SH + 1.5), Y(58)], handR, L > 0); }
  else { // down: thumbs at the hips when he sings, loose at his sides otherwise
    const hipIn = croon ? 1 : 0;
    handL = [X(-SH - 1.5 + hipIn * 4), Y(44 + hipIn * 4)]; handR = [X(SH + 1.5 - hipIn * 4), Y(44 + hipIn * 4)];
    arm(shL, [X(-SH - 1.5 - hipIn * 2.5), Y(59)], handL, L < 0); arm(shR, [X(SH + 1.5 + hipIn * 2.5), Y(59)], handR, L > 0);
    if (guitar === 'hang') guitarEng(g, handR[0] + 1 * u, handR[1] + 15 * u, 9.5 * u, -Math.PI / 2 + .12, occl, u); }
  J.handL = handL; J.handR = handR;

  // ---- the head: hair either side of the veil, the string veil, the hat ----
  const hc = [X(headX), Y(headY)]; J.head = hc; J.neck = [X(headX * .4), Y(neckY)];
  const tilt = (playing ? .1 : .03) * hunch + sing * snoise(t * .9, 22) * .07 + tw * .05 + nod * .02;
  for (const c of ctxs) { c.save(); c.translate(hc[0], hc[1]); c.rotate(tilt); c.translate(-hc[0], -hc[1]); }
  if (!back) { hairStrands(-1, 9, .5); hairStrands(1, 9, .5); } else { for (const sd of [-1, 1]) hairStrands(sd, 12, .55); }
  // the head under the veil (never any features)
  dot(g, hc[0], hc[1], 4.2 * u, INK);
  if (!back) { // the veil: fine strings from under the brim to below the chin, swaying with breath and song
    const vw = 4.6, top = headY + 4.2, bot = headY - 8 - vk * .5;
    ink([[X(headX - vw - .6), Y(top)], [X(headX + vw + .6), Y(top)], [X(headX + vw + .3), Y(bot)], [X(headX - vw - .3), Y(bot)]]); // overlaps the brim lobes, so no sliver of sky shows between
    // strings at uneven spacing and lengths, each a faint thread with beads catching the light now and then
    if (!occl) for (let k = 0; k < 15; k++) { const kx = -vw + (k + .5 + (hash(k * 3 + 1) - .5) * .7) * (2 * vw / 15), stir = snoise(t * 1.3 + k * 2.1, 41) * .45 + vk * snoise(t * 6 + k, 42) * .6 + wind * .4;
      const lit = (kx * L > 0 ? .5 : .22) * (.5 + .5 * hash(k * 5)), sb = bot - 1.4 * hash(k * 7 + 2), n = 26, pts = [];
      for (let j = 0; j < n; j++) { const q = j / (n - 1); pts.push([X(headX + kx + stir * q * q + Math.sin(q * 5 + k) * .12), Y(top - .6 - q * (top - sb - .4))]); }
      stroke(g, pts, sc(lit * .45), lw(.07));
      for (let j = 0; j < n; j += 2 + (hash(k * 13 + j) > .6 ? 1 : 0)) if (hash(k * 31 + j * 7) > .35) dot(g, pts[j][0], pts[j][1], Math.max(.5, (.1 + .1 * hash(k + j * 3)) * u), sc(lit * (1 - .35 * j / n))); } }
  // hat, as on the locked sheet: a low wide crown with a soft top, a thick braided rope band, and a brim
  // that is a thin band across the front (just under the hat band) and droops at both sides into deep lobes
  // whose lower edges sweep down to the edges of the veil (the classic outback droop)
  const B = 14.5, hy = headY + 4.2, cx0 = headX, inner = .31;
  const brimTop = (q) => hy + 2.3 - .6 * q * q;                                       // nearly level, a touch lower at the tips
  const lobe = (aq) => { const k = clamp((1 - aq) / (1 - inner)); return brimTop(1) - .5 - 5.6 * Math.sqrt(1 - (1 - k) * (1 - k)); }; // a rounded lobe: steep at the tip, easing in toward the veil
  const brimLow = (q) => { const aq = Math.abs(q); return aq < inner ? hy - .4 - .9 * (1 - (aq / inner) ** 2) : lobe(aq); }; // the front edge dips a little at the centre
  const brimPts = [];
  for (let i = 0; i <= 40; i++) { const q = -1 + i / 20; brimPts.push([X(cx0 + q * B), Y(brimTop(q))]); }
  for (let i = 1; i < 8; i++) { const a = Math.PI / 2 - i / 8 * Math.PI, r = .5; brimPts.push([X(cx0 + B + Math.cos(a) * r), Y(brimTop(1) - .3 + Math.sin(a) * r)]); }
  for (let i = 40; i >= 0; i--) { const q = -1 + i / 20; brimPts.push([X(cx0 + q * B), Y(brimLow(q))]); }
  for (let i = 1; i < 8; i++) { const a = -Math.PI / 2 - i / 8 * Math.PI, r = .5; brimPts.push([X(cx0 - B + Math.cos(a) * r), Y(brimTop(1) - .3 + Math.sin(a) * r)]); }
  ink(brimPts);
  const cw0 = 6.5, cw1 = 5.1, ch = 5.6, rr = 2.7, cb = hy + 2.2, ctop = cb + 1.4 + ch;   // the crown sits on the band
  const crown = [[X(cx0 - cw0), Y(cb)], [X(cx0 - cw1 - .2), Y(ctop - rr)]];
  for (let i = 1; i <= 6; i++) { const a = Math.PI - i / 6 * Math.PI / 2; crown.push([X(cx0 - cw1 + rr + Math.cos(a) * rr), Y(ctop - rr + Math.sin(a) * rr)]); }
  for (let i = 1; i < 8; i++) { const q = -1 + i / 4; crown.push([X(cx0 + q * (cw1 - rr)), Y(ctop + .5 - .9 * Math.abs(q) - .35 * Math.cos(q * Math.PI / 2))]); }
  for (let i = 0; i <= 6; i++) { const a = Math.PI / 2 - i / 6 * Math.PI / 2; crown.push([X(cx0 + cw1 - rr + Math.cos(a) * rr), Y(ctop - rr + Math.sin(a) * rr)]); }
  crown.push([X(cx0 + cw1 + .2), Y(ctop - rr)], [X(cx0 + cw0), Y(cb)]);
  ink(crown);
  if (!occl) {
    const lit = (px) => ((px - X(cx0)) * L > 0 ? 1 : .5);
    // the brim's bright rolled edges: along the top, round each tip and down each lobe, and the thin front lip
    const topE = []; for (let i = 0; i <= 40; i++) { const q = -1 + i / 20; if (Math.abs(q) > .42) topE.push([X(cx0 + q * B), Y(brimTop(q))]); else if (topE.length && topE[topE.length - 1] !== null) topE.push(null); }
    let seg = []; for (const p2 of topE) { if (p2) seg.push(p2); else { if (seg.length > 1) stroke(g, seg, sc(.8 * lit(seg[0][0])), lw(.26)); seg = []; } } if (seg.length > 1) stroke(g, seg, sc(.8 * lit(seg[0][0])), lw(.26));
    for (const sd of [-1, 1]) { const pts = []; for (let i = 0; i <= 13; i++) { const aq = 1 - i / 20 * (1 - inner); pts.push([X(cx0 + sd * aq * B), Y(lobe(aq))]); } stroke(g, pts, sc(.8 * (sd * L > 0 ? 1 : .5)), lw(.26)); // the lobe's edge fades out before it reaches the veil (shadow and hair there)
      for (let r = 1; r <= 4; r++) { const kk = r / 5, p3 = []; for (let i = 0; i <= 14; i++) { const aq = 1 - i / 14 * (1 - inner) * .95; p3.push([X(cx0 + sd * aq * B * (1 - kk * .04)), Y(lerp(lobe(aq), brimTop(aq), kk))]); }
        for (let i = 0; i < p3.length - 1; i += 2) if (hash(r * 31 + i + (sd > 0 ? 7 : 0)) > .3) stroke(g, [p3[i], p3[i + 1]], sc(.35 * (sd * L > 0 ? 1.2 : .5)), lw(.1)); } }
    { const fp = []; for (let i = 0; i <= 12; i++) { const q = -inner + i / 12 * 2 * inner; fp.push([X(cx0 + q * B), Y(brimLow(q))]); } stroke(g, fp, sc(.8), lw(.26)); }
    for (let k = 0; k < 9; k++) { const q = -inner + (k + .5) * 2 * inner / 9; if (hash(k * 5) > .35) stroke(g, [[X(cx0 + q * B - .4), Y(hy + .5 + (hash(k) - .5) * .6)], [X(cx0 + q * B + .4), Y(hy + .5 + (hash(k + 9) - .5) * .6)]], sc(.4), lw(.1)); }
    // the crown: etched strokes following its curve, brighter toward the light, and a rim down the lit side
    for (let k = 0; k < 15; k++) { const q = -1 + (k + .5) / 7.5, a = sc(.3 * lit(X(cx0 + q * cw1)) * (.5 + .5 * hash(k * 7)));
      const pts = []; for (let i = 0; i <= 8; i++) { const v2 = i / 8, w2 = lerp(cw0 - .4, cw1 - .6, v2); pts.push([X(cx0 + q * w2 * (1 - .15 * v2 * v2)), Y(cb + 1.6 + v2 * (ch - .6) - .9 * Math.abs(q) * v2 * v2)]); }
      if (hash(k * 13) > .2) stroke(g, pts.slice(Math.floor(hash(k * 3) * 3)), a, lw(.1)); }
    scr([[X(cx0 + L * cw0), Y(cb + 1.4)], [X(cx0 + L * (cw1 + .2)), Y(ctop - rr)], [X(cx0 + L * (cw1 - rr * .3)), Y(ctop - rr * .3)], [X(cx0 + L * (cw1 - rr)), Y(ctop - .05)]], .65, .24);
    // the thick braided rope band: two rows of plaited twists
    for (let row = 0; row < 2; row++) for (let k = 0; k < 18; k++) { const q = -1 + (k + .5 + row * .5) / 9, bx = cx0 + q * (cw0 - .3), by = cb + .35 + row * .7 + .2 * (1 - q * q);
      stroke(g, [[X(bx - .35), Y(by - .25)], [X(bx), Y(by + .1)], [X(bx + .35), Y(by + .3)]], sc(.75 * lit(X(bx))), lw(.2)); }
    stroke(g, [[X(cx0 - cw0), Y(cb + 1.45)], [X(cx0 + cw0), Y(cb + 1.45)]], sc(.4), lw(.12)); }
  for (const c of ctxs) c.restore();
  // the one ember eye (Odin): his LEFT eye = viewer's right, glimpsed through the strings
  const eye = (o.eye || 0) * eyeGate(t);
  J.eye = [hc[0] + (2 + tw * 1.2) * u, hc[1] + .4 * u];
  if (eye > 0 && !back && !occl) { glow(J.eye[0], J.eye[1], 4 * u * eye, `rgba(255,110,30,${.55 * eye})`); dot(f, J.eye[0], J.eye[1], .5 * u, `rgba(255,${190 + 50 * eye | 0},120,${eye})`); }
  // the rim of the shoulders from the light behind him
  if (!occl) scr(bez([X(L * 3), Y(neckY - .5)], [X(L * 8), Y(neckY - 1)], [X(L * (SH - .5)), Y(neckY - 2)], [X(L * SH), Y(neckY - 4)], 10), .6, .26);
  for (const c of ctxs) c.restore();
  const unshear = (p) => p && [p[0] + leanK * (hipYw - p[1]), p[1]];
  for (const k of Object.keys(J)) J[k] = unshear(J[k]);
  return J;
}

// the black Les Paul in the scratchboard: a black body and neck, the cream binding scraped in white,
// pickups, knobs, frets and strings as fine scratches. ang = neck direction.
function guitarEng(g, x, y, sc, ang, occl, u) {
  const INK = '#050506', S = (a) => `rgba(240,234,215,${a})`, w = (k) => Math.max(1, k * u);
  g.save(); g.translate(x, y); g.rotate(ang + Math.PI);
  const neckL = sc * 3.6, nw = sc * .17;
  const bodyP = (k = 1) => { g.beginPath(); g.ellipse(sc * .3, 0, sc * 1.05 * k, sc * .82 * k, 0, 0, TAU); g.ellipse(-sc * .5, -sc * .06, sc * .64 * k, sc * .56 * k, 0, 0, TAU); };
  if (!occl) { g.fillStyle = S(.92); bodyP(1.06); g.fill(); }
  g.fillStyle = INK; g.fillRect(-neckL, -nw, neckL, nw * 2); bodyP(); g.fill();
  g.beginPath(); g.moveTo(-neckL - sc * .55, -nw * 1.8); g.lineTo(-neckL, -nw * 1.3); g.lineTo(-neckL, nw * 1.3); g.lineTo(-neckL - sc * .6, nw * 2); g.fill();
  if (!occl) {
    g.lineWidth = w(.18); g.strokeStyle = S(.9); g.strokeRect(-neckL, -nw, neckL - sc * .5, nw * 2);
    for (let k = 1; k < 16; k++) { const fx = -sc * .55 - k * (neckL - sc * .6) / 16; g.beginPath(); g.moveTo(fx, -nw); g.lineTo(fx, nw); g.strokeStyle = S(.75); g.lineWidth = w(.1); g.stroke(); }
    for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(-neckL, k * nw * .35); g.lineTo(sc * .55, k * nw * .3); g.strokeStyle = S(.45); g.lineWidth = w(.06); g.stroke(); } // strings
    g.strokeStyle = S(.9); g.lineWidth = w(.16); g.strokeRect(sc * .1, -sc * .3, sc * .18, sc * .6); g.strokeRect(-sc * .24, -sc * .3, sc * .18, sc * .6); // pickups
    g.beginPath(); g.moveTo(sc * .52, -sc * .32); g.lineTo(sc * .52, sc * .32); g.stroke();                                   // the bridge
    for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(sc * (.74 + (k % 2) * .22), sc * (.3 + (k >> 1) * .22), sc * .06, 0, TAU); g.strokeStyle = S(.9); g.stroke(); } // knobs
    for (let k = 0; k < 3; k++) for (const d of [-1, 1]) { g.beginPath(); g.arc(-neckL - sc * (.12 + k * .15), d * nw * 1.9, sc * .035, 0, TAU); g.fillStyle = S(.6); g.fill(); } // tuners
  }
  g.restore();
}

// Fineliner drawings for the leaflet's picture box. Local coordinates: the box is PBW x PBH, ground at y=GY.
// Every drawing is a list of strokes that draws itself on from prog 0 to 1 (pen order = list order).
const PBW = 1800, PBH = 390, GY = 362;

function plen(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }
// items: {p: points, w: width, dot: radius (filled dot at p[0]), fill: closed filled shape}
function drawSet(g, items, prog, seed = 0, ws = 1) {
  if (prog <= 0) return;
  const L = items.map(it => it.dot ? 12 : Math.max(1, plen(it.p))), T = L.reduce((a, b) => a + b, 0);
  let acc = 0; const stop = T * clamp(prog);
  items.forEach((it, i) => {
    const u = clamp((stop - acc) / L[i]); acc += L[i]; if (u <= 0) return;
    if (it.white && u >= 1) { g.fillStyle = '#fff'; fillPoly(g, wob(it.p, seed + i * 5.3, 1.6)); }
    if (it.dot) { g.fillStyle = '#000'; g.beginPath(); g.arc(it.p[0][0], it.p[0][1], it.dot * Math.max(.8, ws), 0, TAU); g.fill(); return; }
    if (it.fill) { if (u >= 1) { g.fillStyle = '#000'; fillPoly(g, wob(it.p, seed + i * 5.3, 1.2)); } else pen(g, it.p, u, (it.w || 5) * ws, seed + i * 5.3); return; }
    pen(g, it.p, u, (it.w || 5) * ws, seed + i * 5.3, (it.amp ?? 1.6) * Math.min(1, ws));
  });
}

// A mitten at the end of an arm: wrist at (x, y), fingers along angle a, a thumb lobe on one side, a cuff.
// Length is s * .13 (s = the owner's height). thumb: +1 / -1 picks the side.
function mittPts(x, y, a, L, thumb = 1) {
  const c = Math.cos(a), sn = Math.sin(a), P = (u, v) => [x + c * u * L - sn * v * L * thumb, y + sn * u * L + c * v * L * thumb];
  const pts = [P(0, .3), P(.62, .34)];
  for (let i = 1; i <= 12; i++) { const th = Math.PI / 2 - i / 12 * Math.PI; pts.push(P(.62 + Math.cos(th) * .36, Math.sin(th) * .34)); }
  pts.push(P(.55, -.34), P(.5, -.36), P(.42, -.58), P(.3, -.66), P(.2, -.56), P(.18, -.36), P(0, -.3));
  return pts;
}
function mitten(items, x, y, a, s, w = 4.5, palmOut = false, thumb = 1) {
  const L = s * .13, pts = mittPts(x, y, a, L, thumb);
  items.push({ p: pts, w, white: true });
  const c = Math.cos(a), sn = Math.sin(a);
  items.push({ p: seg(x - sn * L * .36 - c * L * .1, y + c * L * .36 - sn * L * .1, x + sn * L * .36 - c * L * .1, y - c * L * .36 - sn * L * .1, 3), w: w * .9 });
  if (palmOut) items.push({ p: seg(x + c * L * .3, y + sn * L * .3, x + c * L * .8, y + sn * L * .8, 3), w: w * .6 });
}

// A person, feet at (x, y), height h. Stylised stand-ins: round head, dot eyes, coat, mittens.
// o: woman, scarf, older, bald, bun, glasses, mouth ('line'|'frown'|'o'|'smile'), look (-1..1),
//    armL / armR: [angle from hanging down (+ = outward), elbow bend], holdL / holdR: a leaflet in that hand,
//    stride: walking phase (0 = standing), hunch
function person(g, o, prog, seed) {
  const { x, y, h } = o, r = h * .1, f = o.face || 1, items = [];
  const hy = y - h + r + (o.hunch || 0) * h * .03, hx = x + (o.lean || 0) * h * .04;
  const head = ell(hx, hy, r, r * 1.05); items.push({ p: head, w: 5 });
  // face
  const lk = (o.look || 0) * r * .3;
  items.push({ p: [[hx - r * .35 + lk, hy - r * .05]], dot: Math.max(2.4, r * .09) }, { p: [[hx + r * .35 + lk, hy - r * .05]], dot: Math.max(2.4, r * .09) });
  if (o.glasses) { items.push({ p: ell(hx - r * .37 + lk, hy - r * .05, r * .28), w: 3.5 }, { p: ell(hx + r * .37 + lk, hy - r * .05, r * .28), w: 3.5 }, { p: seg(hx - r * .1 + lk, hy - r * .08, hx + r * .1 + lk, hy - r * .08, 2), w: 3 }); }
  const my = hy + r * .45, mx = hx + lk * .7;
  if (o.mouth === 'frown') items.push({ p: quad([mx - r * .3, my + r * .08], [mx, my - r * .18], [mx + r * .3, my + r * .08], 8), w: 4 });
  else if (o.mouth === 'o') items.push({ p: ell(mx, my + r * .02, r * .17, r * .2), w: 4 });
  else if (o.mouth === 'smile') items.push({ p: quad([mx - r * .3, my - r * .05], [mx, my + r * .2], [mx + r * .3, my - r * .05], 8), w: 4 });
  else items.push({ p: seg(mx - r * .22, my, mx + r * .22, my, 3), w: 4 });
  // hair
  if (o.bald) { items.push({ p: quad([hx - r * 1.02, hy - r * .1], [hx - r * 1.15, hy - r * .5], [hx - r * .8, hy - r * .55], 6), w: 3.5 }, { p: quad([hx + r * 1.02, hy - r * .1], [hx + r * 1.15, hy - r * .5], [hx + r * .8, hy - r * .55], 6), w: 3.5 }); }
  else if (o.woman) {
    items.push({ p: quad([hx - r * 1.05, hy + r * 1.2], [hx - r * 1.5, hy - r * 1.6], [hx + r * .2, hy - r * 1.15], 18), w: 5 });
    items.push({ p: quad([hx + r * .2, hy - r * 1.15], [hx + r * 1.6, hy - r * 1.3], [hx + r * 1.05, hy + r * 1.2], 18), w: 5 });
    items.push({ p: quad([hx - r * .85, hy - r * .55], [hx - r * .1, hy - r * .35], [hx + r * .55, hy - r * .85], 10), w: 4 });
    if (o.bun) items.push({ p: ell(hx + r * .1, hy - r * 1.25, r * .45, r * .38), w: 4.5 });
  } else {
    items.push({ p: quad([hx - r * 1.02, hy - r * .05], [hx - r * .9, hy - r * 1.45], [hx + r * .3, hy - r * 1.12], 12), w: 5 });
    items.push({ p: quad([hx + r * .3, hy - r * 1.12], [hx + r * 1.1, hy - r * .95], [hx + r * 1.02, hy - r * .05], 10), w: 5 });
    for (let k = 0; k < 4; k++) items.push({ p: seg(hx - r * .6 + k * r * .38, hy - r * .95 - (k % 2) * 4, hx - r * .45 + k * r * .38, hy - r * .62, 3), w: 3.5 });
  }
  // body: coat as a trapezoid, collar, buttons or belt
  const sy = hy + r * 1.25, sw = h * .13, hemY = y - h * .3, hw = o.woman ? h * .19 : h * .16;
  const coat = [[hx - sw, sy + h * .02], [x - hw, hemY], [x + hw, hemY], [hx + sw, sy + h * .02]];
  items.push({ p: seg(hx - r * .25, sy - r * .25, hx - r * .25, sy, 2), w: 4.5 }, { p: seg(hx + r * .25, sy - r * .25, hx + r * .25, sy, 2), w: 4.5 });
  items.push({ p: poly([[hx - sw * .4, sy - h * .005], ...coat, [hx + sw * .4, sy - h * .005]]), w: 5 });
  items.push({ p: poly([[hx - sw * .4, sy], [hx, sy + h * .12], [hx + sw * .4, sy]]), w: 4 });
  if (o.woman) items.push({ p: seg(x - hw * .82, y - h * .45, x + hw * .82, y - h * .45, 6), w: 4 });
  else for (let k = 0; k < 3; k++) items.push({ p: [[hx + (x - hx) * (k / 3), sy + h * (.17 + k * .085)]], dot: 3 });
  if (o.cardigan) items.push({ p: seg(hx, sy + h * .12, x, hemY, 6), w: 4 });
  if (o.scarf) {
    items.push({ p: ell(hx, sy + h * .005, r * .95, r * .32), w: 6 });
    items.push({ p: poly([[hx + r * .4, sy + r * .2], [hx + r * .7, sy + h * .2], [hx + r * .25, sy + h * .21], [hx + r * .1, sy + r * .3]]), w: 5 });
    for (let k = 0; k < 3; k++) items.push({ p: seg(hx + r * (.3 + k * .18), sy + h * .21, hx + r * (.27 + k * .18), sy + h * .25, 2), w: 3 });
  }
  // legs (walking: legs scissor with stride)
  const st = o.stride || 0, la = Math.sin(st) * .32;
  for (const sd of [-1, 1]) {
    const lx = x + sd * h * .065, a = sd * la, fx = lx + Math.sin(a) * h * .3, fy = hemY + Math.cos(a) * h * .3;
    items.push({ p: seg(lx, hemY, fx, Math.min(y, fy), 4), w: 5 });
    const dir = o.facing || 1; items.push({ p: seg(fx - dir * h * .015, Math.min(y, fy), fx + dir * h * .065, Math.min(y, fy), 3), w: 6 });
  }
  // arms
  const ar = (side, spec, hold) => {
    const [ang, bend] = spec || [.12, .1], sx = hx + side * sw * .95, syy = sy + h * .04, l1 = h * .17, l2 = h * .16;
    const a1 = Math.PI / 2 - side * ang, ex = sx + Math.cos(a1) * l1, ey = syy + Math.sin(a1) * l1;
    const a2 = a1 - side * (bend || 0), hx2 = ex + Math.cos(a2) * l2, hy2 = ey + Math.sin(a2) * l2;
    items.push({ p: poly([[sx, syy], [ex, ey], [hx2, hy2]]), w: 5 });
    items.push({ p: poly([[sx + side * 5, syy + 10], [ex + side * 7, ey], [hx2 + Math.cos(a2 + side * 1.57) * 6, hy2 + Math.sin(a2 + side * 1.57) * 6]]), w: 3.5 });
    mitten(items, hx2, hy2, a2, h, 4.5, spec && spec[2], -side);
    if (hold) { // a little leaflet in the mitten
      const lw = h * .1, lh = h * .14, cx = hx2 + Math.cos(a2) * h * .06, cy = hy2 + Math.sin(a2) * h * .06 - lh * .5;
      items.push({ p: poly([[cx - lw / 2, cy - lh / 2], [cx + lw / 2, cy - lh / 2 - 3], [cx + lw / 2, cy + lh / 2], [cx - lw / 2, cy + lh / 2 + 2]], true), w: 4 });
      for (let k = 0; k < 3; k++) items.push({ p: seg(cx - lw * .32, cy - lh * .25 + k * lh * .2, cx + lw * .3, cy - lh * .25 + k * lh * .2, 2), w: 3 });
    }
  };
  ar(-1, o.armL, o.holdL); ar(1, o.armR, o.holdR);
  drawSet(g, items, prog, seed, clamp(h / 250, .62, 1.1));
}

// The couple, side by side. o: x (centre), y, h, plus per-person overrides in o.m / o.w.
function couple(g, o, prog, seed) {
  person(g, Object.assign({ x: o.x - o.h * .22, y: o.y, h: o.h * 1.04, mouth: o.mouth, look: o.look, facing: o.facing }, o.m || {}), clamp(prog * 1.9), seed);
  person(g, Object.assign({ x: o.x + o.h * .22, y: o.y, h: o.h * .97, woman: true, scarf: true, mouth: o.mouth, look: o.look, facing: o.facing }, o.w || {}), clamp(prog * 1.9 - .9), seed + 50);
}

// England (and Wales) traced from coastline points, lon/lat, cut at the Scottish border (dashed).
const ENG = [[-2.03, 55.77], [-1.6, 55.6], [-1.45, 55.05], [-1.2, 54.6], [-0.6, 54.48], [-0.07, 54.12], [-0.2, 53.9], [0.12, 53.6], [0.3, 53.25], [0.35, 52.95], [0.55, 52.97], [1.0, 52.95], [1.35, 52.9], [1.73, 52.6], [1.75, 52.45], [1.6, 52.1], [1.28, 51.94], [0.95, 51.8], [0.85, 51.6], [0.6, 51.5], [1.0, 51.45], [1.42, 51.38], [1.35, 51.13], [0.97, 50.91], [0.6, 50.85], [0.25, 50.74], [-0.15, 50.82], [-0.78, 50.73], [-1.1, 50.8], [-1.4, 50.83], [-1.9, 50.71], [-2.45, 50.56], [-2.95, 50.71], [-3.45, 50.6], [-3.6, 50.25], [-4.15, 50.35], [-4.7, 50.33], [-5.2, 49.97], [-5.71, 50.07], [-5.45, 50.22], [-4.95, 50.55], [-4.53, 51.02], [-4.2, 51.07], [-3.47, 51.21], [-3.0, 51.35], [-2.68, 51.55], [-3.17, 51.45], [-3.6, 51.45], [-3.94, 51.6], [-4.3, 51.56], [-4.9, 51.62], [-5.3, 51.88], [-4.9, 52.0], [-4.4, 52.15], [-4.08, 52.41], [-4.05, 52.68], [-4.15, 52.85], [-4.75, 52.8], [-4.35, 53.12], [-4.6, 53.3], [-4.2, 53.33], [-3.83, 53.32], [-3.1, 53.3], [-3.05, 53.45], [-2.95, 53.75], [-3.05, 53.92], [-2.85, 54.12], [-3.25, 54.1], [-3.4, 54.35], [-3.64, 54.5], [-3.4, 54.85], [-3.05, 54.98]];
function englandPts(cx, cy, hgt) {
  const c = Math.cos(53.5 * Math.PI / 180), sc = hgt / (55.77 - 49.97), mx = -1.95, my = 52.87;
  return ENG.map(([lo, la]) => [cx + (lo - mx) * c * sc, cy - (la - my) * sc]);
}

// The king: fat, crowned, ermine collar. Feet at (x, y), height h.
function king(g, x, y, h, prog, seed, o = {}) {
  const items = [], r = h * .14, hy = y - h + r * 1.5 + (o.tilt ? 0 : 0);
  const tl = o.tilt || 0, hx = x + tl * r * .4;
  items.push({ p: ell(hx, hy, r, r * 1.02), w: 5 });
  // crown on top
  const cy = hy - r * .85, cw = r * .95;
  items.push({ p: poly([[hx - cw, cy], [hx - cw, cy - r * .7], [hx - cw * .5, cy - r * .3], [hx, cy - r * .85], [hx + cw * .5, cy - r * .3], [hx + cw, cy - r * .7], [hx + cw, cy]], true), w: 5 });
  for (const k of [-1, 0, 1]) items.push({ p: [[hx + k * cw * (k ? 1 : 0), cy - r * (k ? .78 : .95)]], dot: 5 });
  // face: dots, a fat moustache, cheeks
  items.push({ p: [[hx - r * .35, hy - r * .1]], dot: 3.5 }, { p: [[hx + r * .35, hy - r * .1]], dot: 3.5 });
  items.push({ p: quad([hx - r * .6, hy + r * .4], [hx, hy + r * .05], [hx + r * .6, hy + r * .4], 10), w: 6 });
  items.push({ p: quad([hx - r * .25, hy + r * .62], [hx, hy + r * .72], [hx + r * .25, hy + r * .62], 6), w: 4 });
  // body: big belly robe
  const by = hy + r * 1.05;
  items.push({ p: quad([hx - r * .8, by], [x - h * .48, y - h * .3], [x - h * .26, y], 20), w: 5 });
  items.push({ p: quad([hx + r * .8, by], [x + h * .48, y - h * .3], [x + h * .26, y], 20), w: 5 });
  items.push({ p: seg(x - h * .26, y, x + h * .26, y, 8), w: 5 });
  // ermine collar with spots
  items.push({ p: quad([hx - r * 1.2, by + r * .1], [hx, by + r * .75], [hx + r * 1.2, by + r * .1], 14), w: 5 });
  items.push({ p: quad([hx - r * 1.2, by + r * .1], [hx, by - r * .2], [hx + r * 1.2, by + r * .1], 14), w: 4 });
  for (let k = -2; k <= 2; k++) items.push({ p: [[hx + k * r * .42, by + r * .27 - Math.abs(k) * 2]], dot: 4 });
  // belly line and buttons
  items.push({ p: seg(x, by + r * .8, x, y - h * .05, 8), w: 3.5 });
  if (o.arms !== false) {
    const aL = o.armL ?? .5, aR = o.armR ?? .5;
    for (const [sd, a] of [[-1, aL], [1, aR]]) {
      const sx = hx + sd * r * 1.1, sy2 = by + r * .45, l = h * .3, an = Math.PI / 2 - sd * a;
      const ex = sx + Math.cos(an) * l, ey = sy2 + Math.sin(an) * l;
      items.push({ p: seg(sx, sy2, ex, ey, 8), w: 5 }); mitten(items, ex, ey, an, h * 1.2, 4.5);
    }
  }
  drawSet(g, items, prog, seed);
}

// A wigged barrister / the king as a cut-out silhouette (solid black), for shadows lying on the glass.
function lawyerSil(g, x, y, h) {
  const r = h * .12, hy = y - h + r * 1.6;
  g.fillStyle = '#000'; g.beginPath();
  // gown
  g.moveTo(x - h * .16, hy + r * 1.3); g.lineTo(x - h * .3, y); g.lineTo(x + h * .3, y); g.lineTo(x + h * .16, hy + r * 1.3); g.closePath(); g.fill();
  // head + wig: a rounded top with rolls of curls down each side
  g.beginPath(); g.ellipse(x, hy, r * 1.15, r * 1.2, 0, 0, TAU); g.fill();
  for (const sd of [-1, 1]) for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(x + sd * r * 1.15, hy - r * .4 + k * r * .48, r * .32, 0, TAU); g.fill(); }
  for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x - r * .5 + k * r * .5, hy - r * 1.15, r * .3, 0, TAU); g.fill(); }
  // tails of the wig at the back
  g.fillRect(x - r * .25, hy + r * .9, r * .5, r * .9);
  // a profile nose and chin, facing left (toward the couple)
  g.beginPath(); g.moveTo(x - r * 1.0, hy - r * .2); g.lineTo(x - r * 1.55, hy + r * .25); g.lineTo(x - r * 1.05, hy + r * .45); g.lineTo(x - r * 1.15, hy + r * .8); g.lineTo(x - r * .6, hy + r * 1.1); g.lineTo(x - r * .4, hy); g.closePath(); g.fill();
}
function kingSil(g, x, y, h) { // in profile, facing right, pointing: cut out of black paper with scissors
  const P = [[-.12, .86], [-.15, 1.0], [-.09, .93], [-.04, 1.03], [.01, .93], [.07, 1.0], [.12, .925], [.13, .86], // crown
    [.14, .82], [.2, .78], [.15, .76], [.16, .735], [.13, .72], [.145, .69], [.11, .665], [.07, .655], // brow, nose, lips, chins
    [.17, .62], [.24, .6], [.6, .64], [.66, .66], [.67, .63], [.6, .6], [.27, .53], // arm out, pointing finger
    [.33, .42], [.36, .28], [.33, .14], [.36, .0], [-.3, .0], [-.27, .2], [-.25, .45], [-.2, .58], [-.13, .64], [-.14, .74]]; // belly, robe, back
  g.fillStyle = '#000'; g.beginPath(); P.forEach(([u, v], i) => { const px = x + u * h, py = y - v * h; i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath(); g.fill();
  for (const [u, v] of [[-.15, 1.0], [-.04, 1.03], [.07, 1.0]]) { g.beginPath(); g.arc(x + u * h, y - v * h, h * .018, 0, TAU); g.fill(); }
  // the ermine hem, scalloped
  for (let k = 0; k < 9; k++) { g.beginPath(); g.arc(x + (-.29 + k * .08) * h, y - .01 * h, h * .03, 0, TAU); g.fill(); }
}

// A photocopier on its stand, lid hinged at the back (lid: 0 open .. 1 shut).
function copier(g, x, y, s, prog, lid, glow, seed) {
  const items = [], w = 300 * s, hh = 120 * s, top = y - 150 * s;
  items.push({ p: poly([[x - w / 2, top], [x + w / 2, top], [x + w / 2, top + hh], [x - w / 2, top + hh]], true), w: 5 });
  items.push({ p: seg(x - w / 2 + 12, top + hh, x - w / 2 + 12, y, 4), w: 5 }, { p: seg(x + w / 2 - 12, top + hh, x + w / 2 - 12, y, 4), w: 5 });
  items.push({ p: seg(x - w / 2 + 12, y - 30 * s, x + w / 2 - 12, y - 30 * s, 6), w: 4 });
  // control panel + buttons
  items.push({ p: poly([[x + w * .18, top + 18 * s], [x + w * .45, top + 18 * s], [x + w * .45, top + 52 * s], [x + w * .18, top + 52 * s]], true), w: 4 });
  for (let k = 0; k < 3; k++) items.push({ p: [[x + w * (.24 + k * .08), top + 36 * s]], dot: 5 });
  // output tray with a sheet
  items.push({ p: poly([[x + w / 2, top + hh * .55], [x + w / 2 + 70 * s, top + hh * .45], [x + w / 2 + 70 * s, top + hh * .62], [x + w / 2, top + hh * .72]]), w: 4 });
  // paper slots
  for (let k = 0; k < 2; k++) items.push({ p: seg(x - w * .4, top + hh * (.45 + k * .25), x + w * .05, top + hh * (.45 + k * .25), 6), w: 4 });
  drawSet(g, items, prog, seed);
  if (prog > .6) { // lid: hinged at the back-left, swings shut
    const a = lerp(-.5, 0, lid), lx = x - w / 2 - 6, ly = top;
    g.save(); g.translate(lx, ly); g.rotate(a);
    pen(g, poly([[0, 0], [w + 12, 0], [w + 12, -14 * s], [0, -14 * s]], true), clamp((prog - .6) / .4), 5, seed + 300);
    g.restore();
    if (glow > 0) { // the scan lamp leaking out under the lid: a burst of short strokes
      for (let k = 0; k < 9; k++) { const px = x - w / 2 + (k + .5) * w / 9; pen(g, seg(px, top - 8, px + (k - 4) * 4 * glow, top - 8 - 26 * glow, 2), 1, 4, seed + k); }
    }
  }
}

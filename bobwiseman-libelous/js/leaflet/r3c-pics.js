// Round 3, leaf-C: fineliner props and figures for the last pages of the leaflet (stanzas 11-14).
// Built on the kit in pictures.js / ink.js (person, king, mitten, pen, drawSet); nothing here edits the kit.
// Picture-box coordinates (PBW x PBH, ground at GY). Every name is prefixed r3cLeaf / R3C so pages can't clash.
// Head boxes: while R3C_HEADS.on, every figure drawn records its head box (picture coords) so the audit can
// test captions against faces.
const R3C_HEADS = { on: false, list: [] };
function r3cLeafHead(x0, y0, w, h) { if (R3C_HEADS.on) R3C_HEADS.list.push([x0, y0, w, h]); }

function r3cLeafRect(x, y, w, h) { return poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true); }
function r3cLeafCrownPts(cx, cy, w, h) { return [[cx - w / 2, cy], [cx - w / 2, cy - h], [cx - w / 4, cy - h * .45], [cx, cy - h * 1.15], [cx + w / 4, cy - h * .45], [cx + w / 2, cy - h], [cx + w / 2, cy]]; }
function r3cLeafCell(p, x0, x1, prog, seed) { pen(p, r3cLeafRect(x0 + 6, 6, x1 - x0 - 12, PBH - 12), prog, 4.5, seed, 1.2); }
function r3cLeafWhite(p, pts) { p.fillStyle = '#fff'; fillPoly(p, pts); }

// A person (the kit's), with its head box recorded.
function r3cLeafPerson(p, o, prog, seed) {
  person(p, o, prog, seed);
  if (prog > 0) { const r = o.h * .1, hx = o.x + (o.lean || 0) * o.h * .04, hy = o.y - o.h + r + (o.hunch || 0) * o.h * .03; r3cLeafHead(hx - r * 1.6, hy - r * (o.tophat ? 2.6 : 1.7), r * 3.2, r * (o.tophat ? 3.8 : 2.9)); }
}
function r3cLeafCouple(p, o, prog, seed) {
  r3cLeafPerson(p, Object.assign({ x: o.x - o.h * .22, y: o.y, h: o.h * 1.04, mouth: o.mouth, look: o.look, facing: o.facing }, o.m || {}), clamp(prog * 1.9), seed);
  r3cLeafPerson(p, Object.assign({ x: o.x + o.h * .22, y: o.y, h: o.h * .97, woman: true, scarf: true, mouth: o.mouth, look: o.look, facing: o.facing }, o.w || {}), clamp(prog * 1.9 - .9), seed + 50);
}
function r3cLeafKing(p, x, y, h, prog, seed, o = {}) {
  king(p, x, y, h, prog, seed, o);
  if (prog > 0) { const r = h * .14, hy = y - h + r * 1.5, hx = x + (o.tilt || 0) * r * .4; r3cLeafHead(hx - r * 1.3, hy - r * 1.8, r * 2.6, r * 2.9); }
}

// A barrister's or judge's wig over a person, a black gown and white bands: the wig is drawn first (white fill,
// outline, horizontal rolls across it), then a white face disk cuts the rolls in the middle, then the person
// (bald, so no hair lines cross the wig). long: the judge's full-bottomed wig down to the shoulders.
function r3cLeafWigged(p, o, prog, seed, long) {
  const h = o.h, r = h * .1, hx = o.x + (o.lean || 0) * h * .04, hy = o.y - h + r, x = o.x;
  const sy = hy + r * 1.25, sw = h * .13, hemY = o.y - h * .3, hw = h * .16;
  if (prog > .5) { p.fillStyle = '#000'; fillPoly(p, [[hx - sw, sy + h * .02], [x - hw, hemY], [x + hw, hemY], [hx + sw, sy + h * .02]]); } // the black gown
  if (prog > .15) {
    const dn = long ? 2.4 : .9, wd = long ? 1.7 : 1.4, items = [];
    const wig = [[hx - r * wd, hy + r * dn], [hx - r * (wd + .12), hy - r * .3], [hx - r * 1.0, hy - r * 1.15], [hx, hy - r * 1.45], [hx + r * 1.0, hy - r * 1.15], [hx + r * (wd + .12), hy - r * .3], [hx + r * wd, hy + r * dn]];
    items.push({ p: poly(wig, true), w: 4.5, white: true });
    const rows = long ? 7 : 4;
    for (let k = 0; k < rows; k++) { const yy = hy - r * 1.05 + k * r * ((dn + 1.05) / rows), ww = r * (wd + .05) * (k ? 1 : .8); items.push({ p: quad([hx - ww, yy + r * .12], [hx, yy - r * .22], [hx + ww, yy + r * .12], 14), w: 3.5 }); }
    drawSet(p, items, clamp((prog - .15) / .5), seed + 700);
    p.fillStyle = '#fff'; p.beginPath(); p.arc(hx, hy + r * .05, r * .98, 0, TAU); p.fill();
  }
  r3cLeafPerson(p, Object.assign({}, o, { bald: true }), prog, seed);
  if (prog > .6) { // the white bands at the throat
    for (const sd of [-1, 1]) { const bx = hx + sd * r * .2; p.fillStyle = '#fff'; p.fillRect(bx - r * .17, sy, r * .34, h * .1); pen(p, r3cLeafRect(bx - r * .17, sy, r * .34, h * .1), 1, 3, seed + 760 + sd); }
  }
}
// A police helmet (the tall domed kind) over a person.
function r3cLeafCop(p, o, prog, seed) {
  r3cLeafPerson(p, o, prog, seed);
  if (prog > .3) {
    const r = o.h * .1, hx = o.x, hy = o.y - o.h + r + (o.dy || 0);
    const dome = [[hx - r * 1.05, hy - r * .45], [hx - r * 1.0, hy - r * 1.3], [hx - r * .55, hy - r * 2.05], [hx, hy - r * 2.25], [hx + r * .55, hy - r * 2.05], [hx + r * 1.0, hy - r * 1.3], [hx + r * 1.05, hy - r * .45]];
    r3cLeafWhite(p, dome);
    drawSet(p, [{ p: poly(dome, true), w: 4.5 }, { p: seg(hx - r * 1.35, hy - r * .45, hx + r * 1.35, hy - r * .45, 4), w: 5 }, { p: [[hx, hy - r * 2.35]], dot: 6 }, { p: poly(r3cLeafCrownPts(hx, hy - r * 1.05, r * .7, r * .38), true), w: 3 }], clamp((prog - .3) / .4), seed + 800);
  }
}
// The king's wife: a woman with a small crown.
function r3cLeafQueen(p, o, prog, seed) {
  r3cLeafPerson(p, Object.assign({ woman: true, bun: false }, o), prog, seed);
  if (prog > .4) { const r = o.h * .1, hx = o.x, hy = o.y - o.h + r; pen(p, poly(r3cLeafCrownPts(hx, hy - r * 1.1, r * 1.2, r * .6), true), clamp((prog - .4) / .3), 4.5, seed + 900); }
}

// A big mittened fist coming down from the top: (x, y) is the wrist, s the fist's width. An ermine cuff, the sleeve
// running up off the top; the mitten is a rounded block with a thumb folded across the front.
function r3cLeafFist(p, x, y, s, prog, seed) {
  const items = [], L = s;
  items.push({ p: seg(x - L * .42, -60, x - L * .4, y - L * .3, 6), w: 6 }, { p: seg(x + L * .42, -60, x + L * .4, y - L * .3, 6), w: 6 });
  items.push({ p: r3cLeafRect(x - L * .52, y - L * .3, L * 1.04, L * .3), w: 6, white: true });
  for (let k = 0; k < 5; k++) items.push({ p: [[x - L * .38 + k * L * .19, y - L * .15]], dot: 5 });
  const bx0 = x - L * .5, bx1 = x + L * .5, by0 = y, by1 = y + L * .7, kr = L * .125, body = [[bx1, by0], [bx0, by0], [bx0, by1]];
  for (let k = 0; k < 4; k++) for (let i = 0; i <= 8; i++) { const a = Math.PI - i / 8 * Math.PI; body.push([bx0 + kr + k * 2 * kr + Math.cos(a) * kr, by1 + Math.sin(a) * kr * 1.1]); } // four knuckles along the bottom
  body.push([bx1, by1]);
  items.push({ p: poly(body, true), w: 6, white: true });
  items.push({ p: poly([[bx0 - L * .06, by0 + L * .2], [x + L * .15, by0 + L * .3], [x + L * .2, by0 + L * .44], [bx0 + L * .02, by0 + L * .46]], true), w: 5, white: true }); // the thumb across the front
  for (let k = 1; k < 4; k++) items.push({ p: seg(bx0 + k * 2 * kr, by1 - L * .14, bx0 + k * 2 * kr, by1 + 2, 3), w: 4 }); // finger lines
  drawSet(p, items, prog, seed);
}
// A money bag with the king's crown on it.
function r3cLeafBag(p, x, y, s, prog, seed) {
  const items = [], b = [];
  for (let i = 0; i <= 22; i++) { const a = -Math.PI * .2 + i / 22 * Math.PI * 1.4; b.push([x + Math.cos(a + Math.PI / 2) * s * .5 * (1 - .15 * Math.sin(a)), y - s * .45 + Math.sin(a + Math.PI / 2) * s * .45]); }
  items.push({ p: poly([[x - s * .16, y - s * .82], ...b.reverse(), [x + s * .16, y - s * .82]]), w: 5, white: true });
  items.push({ p: poly([[x - s * .2, y - s * .82], [x - s * .3, y - s * 1.0], [x, y - s * .9], [x + s * .3, y - s * 1.0], [x + s * .2, y - s * .82]]), w: 4.5 });
  items.push({ p: seg(x - s * .2, y - s * .8, x + s * .2, y - s * .8, 3), w: 5 });
  items.push({ p: poly(r3cLeafCrownPts(x, y - s * .3, s * .42, s * .2), true), w: 4 });
  drawSet(p, items, prog, seed);
}
function r3cLeafCoin(p, x, y, r, prog, seed) { pen(p, ell(x, y, r, r * .35), prog, 4, seed); pen(p, seg(x - r, y, x - r, y + r * .3, 1).concat(ell(x, y + r * .3, r, r * .35, Math.PI, 0)), prog, 4, seed + 1); }

// A little leaflet sheet (a heading bar and typed lines), centre (x, y), w x h, rotation a.
function r3cLeafSheet(p, x, y, w, h, a, seed) {
  p.save(); p.translate(x, y); p.rotate(a);
  p.fillStyle = '#fff'; p.fillRect(-w / 2, -h / 2, w, h);
  pen(p, poly([[-w / 2, -h / 2], [w / 2, -h / 2 - 2], [w / 2, h / 2], [-w / 2, h / 2 + 1]], true), 1, Math.max(3, w * .04), seed);
  p.fillStyle = '#000'; p.fillRect(-w * .38, -h * .4, w * .76, h * .14);
  for (let j = 0; j < 4; j++) pen(p, seg(-w * .36, -h * .12 + j * h * .14, w * .34 - (j === 3) * w * .3, -h * .12 + j * h * .14, 3), 1, Math.max(2.5, w * .03), seed + 1 + j);
  p.restore();
}

// The judge's bench: a high panelled front with the crown on it.
function r3cLeafBench(p, x0, x1, top, prog, seed) {
  if (prog >= 1) { p.fillStyle = '#fff'; p.fillRect(x0, top, x1 - x0, GY - top); }
  pen(p, poly([[x0, GY], [x0, top], [x1, top], [x1, GY]]), prog, 6, seed); pen(p, seg(x0 - 16, top, x1 + 16, top, 20), prog, 8, seed + 1);
  for (let k = 0; k < 3; k++) pen(p, r3cLeafRect(lerp(x0, x1, k / 3) + 18, top + 24, (x1 - x0) / 3 - 36, GY - top - 44), pr(prog, .4, .6), 3.5, seed + 2 + k);
  pen(p, poly(r3cLeafCrownPts((x0 + x1) / 2, top + 70, 60, 26), true), pr(prog, .6, .4), 4, seed + 6);
}
// A gavel: head centre (x, y) swung by angle a about the grip end.
function r3cLeafGavel(p, gx, gy, a, seed) {
  p.save(); p.translate(gx, gy); p.rotate(a);
  pen(p, seg(0, 0, -110, 0, 6), 1, 7, seed, .4);
  p.fillStyle = '#fff'; p.fillRect(-150, -26, 50, 52);
  pen(p, r3cLeafRect(-150, -26, 50, 52), 1, 6, seed + 1, .6);
  pen(p, seg(-140, -26, -140, 26, 2), 1, 3, seed + 2, .3); pen(p, seg(-110, -26, -110, 26, 2), 1, 3, seed + 3, .3);
  p.restore();
}
// Impact marks round a point.
function r3cLeafBang(p, x, y, R, prog, seed) { for (let k = 0; k < 7; k++) { const a = Math.PI + .2 + k / 6 * (Math.PI - .4); pen(p, seg(x + Math.cos(a) * R, y + Math.sin(a) * R, x + Math.cos(a) * R * 1.8, y + Math.sin(a) * R * 1.8, 1), prog, 5, seed + k); } }
// A marker tick.
function r3cLeafTick(p, x, y, s, prog, seed) { marker(p, poly([[x - s * .5, y], [x - s * .15, y + s * .4], [x + s * .55, y - s * .55]]), prog, 11, seed); }
// A desk: a top and a front panel (hides legs behind it).
function r3cLeafDesk(p, x0, x1, top, prog, seed) {
  if (prog >= 1) { p.fillStyle = '#fff'; p.fillRect(x0, top, x1 - x0, GY - top); }
  pen(p, poly([[x0, GY], [x0, top], [x1, top], [x1, GY]]), prog, 5, seed); pen(p, seg(x0 - 18, top, x1 + 18, top, 20), prog, 7, seed + 1);
}
// A stack of paper (files), bottom centre (x, y), n sheets tall.
function r3cLeafStack(p, x, y, w, n, seed) {
  const hh = 9; p.fillStyle = '#fff'; p.fillRect(x - w / 2, y - n * hh, w, n * hh);
  pen(p, r3cLeafRect(x - w / 2, y - n * hh, w, n * hh), 1, 4.5, seed, .8);
  for (let k = 1; k < n; k++) pen(p, seg(x - w / 2 + (rnd(seed, k) - .5) * 6, y - k * hh, x + w / 2, y - k * hh + (rnd(seed + 1, k) - .5) * 3, 3), 1, 2.5, null);
}

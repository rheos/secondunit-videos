// Round 3, leaf-B: fineliner things for the stanza 6 and 7 pages (TV set, clown, burger, kids, swivel stools, ink
// drums, the wallet, books, coins). Same pen as pictures.js: black strokes on white that draw themselves on.
// Picture-box coordinates (PBW x PBH, ground at GY). Nothing here holds state between frames, except R3BLEAF_BOX, which
// only collects head and label boxes while the face audit runs (off when rendering).
const R3BLEAF_BOX = { on: false, heads: [], labels: [] };
function r3bLeafHead(x, y, r) { if (R3BLEAF_BOX.on) R3BLEAF_BOX.heads.push([x - r * 1.25, y - r * 1.3, r * 2.5, r * 2.45]); }
function r3bLeafPerson(p, o, prog, seed) {
  if (prog > 0) { const r = o.h * .1; r3bLeafHead(o.x + (o.lean || 0) * o.h * .04, o.y - o.h + r + (o.hunch || 0) * o.h * .03, r); }
  person(p, o, prog, seed);
}
function r3bLeafKing(p, x, y, h, prog, seed, o) { if (prog > 0) r3bLeafHead(x + (o && o.tilt || 0) * h * .056, y - h + h * .21, h * .14); king(p, x, y, h, prog, seed, o); }
function r3bLeafLabel(p, word, x, y, fs, t, t0, seed, dt = .03) { // hand-lettered caps; the box is collected for the face audit
  if (R3BLEAF_BOX.on && t >= t0) R3BLEAF_BOX.labels.push([x, y - fs * .8, handWidth(p, word, fs), fs * .95, word]);
  return handLetters(p, word, x, y, fs, t, t0, seed, dt);
}

// rounded rectangle outline as points (closed)
function r3bLeafRR(x, y, w, h, r) {
  const a = [], C = [[x + w - r, y + r, -Math.PI / 2, 0], [x + w - r, y + h - r, 0, Math.PI / 2], [x + r, y + h - r, Math.PI / 2, Math.PI], [x + r, y + r, Math.PI, 1.5 * Math.PI]];
  for (const [cx, cy, a0, a1] of C) for (let i = 0; i <= 6; i++) { const u = lerp(a0, a1, i / 6); a.push([cx + Math.cos(u) * r, cy + Math.sin(u) * r]); }
  a.push(a[0]); return poly(a);
}
function r3bLeafRRPath(p, x, y, w, h, r) { p.beginPath(); p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r); p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath(); }

// A 1970s console TV on legs, rabbit ears. Feet at y, centred on x. Returns the screen rect for what it shows.
function r3bLeafTV(p, x, y, w, h, prog, seed) {
  const legH = h * .1, top = y - h, ch = h - legH;
  pen(p, r3bLeafRR(x - w / 2, top, w, ch, 18), pr(prog, 0, .3), 6, seed);
  const s = { x: x - w / 2 + w * .06, y: top + ch * .1, w: w * .68, h: ch * .8, r: 26 };
  pen(p, r3bLeafRR(s.x, s.y, s.w, s.h, s.r), pr(prog, .2, .3), 5, seed + 1);
  const kx = (s.x + s.w + x + w / 2) / 2;
  pen(p, ell(kx, top + ch * .26, w * .05, w * .05), pr(prog, .45, .1), 4.5, seed + 2);
  pen(p, ell(kx, top + ch * .48, w * .035, w * .035), pr(prog, .5, .1), 4, seed + 3);
  for (let k = 0; k < 4; k++) pen(p, seg(kx - w * .07, top + ch * (.66 + k * .065), kx + w * .07, top + ch * (.66 + k * .065), 3), pr(prog, .55 + k * .03, .08), 3.5, seed + 4 + k);
  pen(p, seg(x - w * .38, y - legH, x - w * .43, y, 3), pr(prog, .65, .1), 5, seed + 9); pen(p, seg(x + w * .38, y - legH, x + w * .43, y, 3), pr(prog, .65, .1), 5, seed + 10);
  pen(p, ell(x, top, w * .07, h * .05, Math.PI, TAU), pr(prog, .75, .1), 4.5, seed + 11);
  pen(p, seg(x - w * .03, top - h * .04, x - w * .2, top - h * .2, 4), pr(prog, .8, .1), 4, seed + 12); pen(p, seg(x + w * .03, top - h * .04, x + w * .18, top - h * .19, 4), pr(prog, .85, .1), 4, seed + 13);
  return s;
}

// The clown in the ad: white face, round nose, high arched brows, a tall pointed hat with a pompom, a ruff, a
// diamond suit, big shoes. Generic: no hair, no logo, no lettering. Feet at (x, y), height h (hat included).
// o.armL / o.armR: [angle out from hanging, elbow bend] like person(). Returns the two hand positions.
function r3bLeafClown(p, x, y, h, prog, seed, o = {}) {
  const items = [], r = h * .1, hx = x + (o.lean || 0) * h * .03, hy = y - h + r * 2.75;
  if (prog > 0) r3bLeafHead(hx, hy, r);
  const sy = hy + r * 1.5, hemY = y - h * .27, sw = h * .12, hw = h * .19;
  const suit = [[hx - sw, sy], [x - hw, hemY], [x + hw, hemY], [hx + sw, sy]];
  if (prog >= .55) { hatch(p, suit, .95, h * .085, 1, 3, seed + 70); hatch(p, suit, Math.PI - .95, h * .085, 1, 3, seed + 71); } // the diamonds
  items.push({ p: poly(suit, true), w: 5 });
  for (const sd of [-1, 1]) { items.push({ p: seg(x + sd * h * .075, hemY, x + sd * h * .085, y - h * .035, 3), w: 5 }); items.push({ p: ell(x + sd * h * .12, y - h * .035, h * .075, h * .03), w: 5, white: true }); }
  const hands = {};
  for (const [side, spec] of [[-1, o.armL], [1, o.armR]]) {
    const [ang, bend] = spec || [.25, .15], sx = hx + side * sw * .9, syy = sy + h * .03, l1 = h * .15, l2 = h * .14;
    const a1 = Math.PI / 2 - side * ang, ex = sx + Math.cos(a1) * l1, ey = syy + Math.sin(a1) * l1;
    const a2 = a1 - side * (bend || 0), hx2 = ex + Math.cos(a2) * l2, hy2 = ey + Math.sin(a2) * l2;
    items.push({ p: poly([[sx, syy], [ex, ey], [hx2, hy2]]), w: 5 });
    mitten(items, hx2, hy2, a2, h * .9, 4.5, false, -side);
    hands[side < 0 ? 'L' : 'R'] = [hx2 + Math.cos(a2) * h * .07, hy2 + Math.sin(a2) * h * .07];
  }
  const ruff = []; for (let i = 0; i <= 56; i++) { const a = i / 56 * TAU, k = 1 + .24 * Math.abs(Math.sin(a * 7)); ruff.push([hx + Math.cos(a) * r * 1.5 * k, hy + r * 1.3 + Math.sin(a) * r * .45 * k]); }
  items.push({ p: ruff, w: 4.5, white: true });
  items.push({ p: ell(hx, hy, r, r * 1.05), w: 5, white: true });
  items.push({ p: poly([[hx - r * .8, hy - r * .6], [hx + r * .2, hy - r * 2.45], [hx + r * .8, hy - r * .6]], true), w: 5, white: true });
  items.push({ p: ell(hx + r * .2, hy - r * 2.6, r * .22, r * .22), w: 4, white: true });
  items.push({ p: [[hx, hy - r * 1.15]], dot: 4 }, { p: [[hx + r * .2, hy - r * 1.65]], dot: 4 });
  for (const sd of [-1, 1]) { items.push({ p: [[hx + sd * r * .38, hy - r * .12]], dot: 3.2 }); items.push({ p: ell(hx + sd * r * .38, hy - r * .1, r * .2, r * .34, Math.PI * 1.15, Math.PI * 1.85), w: 3.5 }); }
  items.push({ p: ell(hx, hy + r * .2, r * .2, r * .18), w: 4.5, white: true });
  items.push({ p: quad([hx - r * .64, hy + r * .34], [hx, hy + r * 1.0], [hx + r * .64, hy + r * .34], 12), w: 5 });
  for (const sd of [-1, 1]) items.push({ p: quad([hx + sd * r * .64, hy + r * .34], [hx + sd * r * .74, hy + r * .3], [hx + sd * r * .72, hy + r * .2], 4), w: 4 });
  drawSet(p, items, prog, seed, clamp(h / 250, .62, 1.1));
  return hands;
}

// A burger-shaped thing: domed bun with seeds, a frill of lettuce, a patty, the heel. Bottom at y, width s.
function r3bLeafBurger(p, x, y, s, prog, seed, o = {}) {
  const items = [], top = ell(x, y - s * .3, s * .5, s * .3, Math.PI, TAU);
  items.push({ p: r3bLeafRR(x - s * .48, y - s * .15, s * .96, s * .15, s * .06), w: 4.5, white: true });
  items.push({ p: r3bLeafRR(x - s * .5, y - s * .3, s, s * .15, s * .06), w: 4.5, white: true });
  const lw = []; for (let i = 0; i <= 16; i++) lw.push([x - s * .52 + i * s * .065, y - s * .3 + Math.sin(i * 1.5) * s * .025]);
  items.push({ p: lw, w: o.leaf ? 6 : 4 });
  items.push({ p: top.concat([top[0]]), w: 4.5, white: true });
  for (let k = 0; k < 5; k++) items.push({ p: [[x - s * .26 + k * s * .13, y - s * .45 - (k % 2) * s * .06]], dot: Math.max(2, s * .018) });
  drawSet(p, items, prog, seed, clamp(s / 220, .5, 1));
}

// A child seen from behind (watching TV): head, hair, shoulders. Base at y, height s.
function r3bLeafKidBack(p, x, y, s, prog, seed, hair = 0) {
  const items = [], r = s * .26, hy = y - s + r;
  items.push({ p: quad([x - s * .44, y], [x, y - s * .98], [x + s * .44, y], 16), w: 5, white: true });
  items.push({ p: ell(x, hy, r, r * 1.05), w: 5, white: true });
  if (hair === 0) for (let k = 0; k < 6; k++) items.push({ p: quad([x - r * .8 + k * r * .32, hy - r * .9], [x - r * .7 + k * r * .32, hy - r * .2], [x - r * .75 + k * r * .3, hy + r * .3], 6), w: 3.5 });
  else if (hair === 1) items.push({ p: quad([x - r * .2, hy + r * .4], [x - r * .1, hy + r * 1.4], [x + r * .25, hy + r * 1.7], 8), w: 5 }, { p: ell(x, hy - r * .1, r * .55, r * .6, Math.PI * 1.1, Math.PI * 1.9), w: 3.5 });
  else { for (const sd of [-1, 1]) items.push({ p: ell(x + sd * r * 1.05, hy - r * .1, r * .32, r * .42), w: 4.5, white: true }); items.push({ p: seg(x, hy - r * .95, x, hy + r * .2, 3), w: 3 }); }
  drawSet(p, items, prog, seed, clamp(s / 200, .6, 1));
}

// A counter swivel stool. Base at y, height s. mode: how the seat's colour shows on a black-only copy
// (0 plain, 1 solid, 2 hatch, 3 dots, 4 cross-hatch, 5 checks). phase: the seat's turn (a stripe across its top).
function r3bLeafStool(p, x, y, s, prog, seed, mode = 0, phase = 0, spin = 0) {
  const sy = y - s * .86, rx = s * .36, ry = s * .11, th = s * .1;
  pen(p, seg(x, sy + th + ry * .6, x, y - s * .05, 3), pr(prog, 0, .3), 5, seed);
  pen(p, ell(x, y - s * .04, s * .22, s * .05), pr(prog, .2, .2), 4.5, seed + 1);
  pen(p, ell(x, y - s * .42, s * .15, s * .04), pr(prog, .3, .2), 4, seed + 2);
  const topE = ell(x, sy, rx, ry, 0, TAU, 32), side = poly([[x - rx, sy], [x - rx, sy + th]]).concat(ell(x, sy + th, rx, ry, Math.PI, 0, 16)).concat(poly([[x + rx, sy + th], [x + rx, sy]]));
  if (prog >= 1) { p.fillStyle = '#fff'; fillPoly(p, topE.concat(side)); }
  if (mode && prog >= 1) {
    const reg = ell(x, sy, rx, ry, Math.PI, TAU, 16).concat(ell(x, sy + th, rx, ry, 0, Math.PI, 16)); // the seat's silhouette
    if (mode === 1) { p.fillStyle = '#000'; fillPoly(p, reg); }
    else if (mode === 2) hatch(p, reg, .6, 9, 1, 3, seed + 10);
    else if (mode === 3) { p.save(); p.beginPath(); reg.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); p.closePath(); p.clip(); p.fillStyle = '#000'; for (let i = 0; i < 40; i++) { p.beginPath(); p.arc(x - rx + rnd(seed, i) * 2 * rx, sy - ry + rnd(seed + 1, i) * (th + 2 * ry), 4, 0, TAU); p.fill(); } p.restore(); }
    else if (mode === 4) { hatch(p, reg, .7, 11, 1, 3, seed + 11); hatch(p, reg, -.7, 11, 1, 3, seed + 12); }
    else { p.save(); p.beginPath(); reg.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); p.closePath(); p.clip(); p.fillStyle = '#000'; for (let i = -4; i < 4; i++) for (let j = -2; j < 3; j++) if ((i + j) % 2 === 0) p.fillRect(x + i * 18, sy + j * 14 - 7, 18, 14); p.restore(); }
  }
  pen(p, side, pr(prog, .4, .3), 4.5, seed + 3); pen(p, topE, pr(prog, .55, .3), 4.5, seed + 4);
  if (prog >= 1) { // the stripe across the seat: where it points shows the turn
    const c = Math.cos(phase), sn = Math.sin(phase);
    p.strokeStyle = mode === 1 ? '#fff' : '#000'; p.lineWidth = 6; p.lineCap = 'round'; p.beginPath(); p.moveTo(x - c * rx * .85, sy - sn * ry * .85); p.lineTo(x + c * rx * .85, sy + sn * ry * .85); p.stroke();
  }
  if (spin > 0) for (let k = 0; k < 2; k++) pen(p, ell(x, sy + th * .5, rx * (1.35 + k * .2), ry * (2.0 + k * .6), Math.PI * (.15 + k * .1) + phase * .3, Math.PI * (.85 - k * .1) + phase * .3), spin, 3.5, seed + 20 + k, .8);
}

// A steel drum, base centre at (x, y): body, ribs, top with a bung.
function r3bLeafDrum(p, x, y, w, h, prog, seed) {
  const ry = w * .13, top = y - h;
  if (prog >= 1) { p.fillStyle = '#fff'; fillPoly(p, ell(x, top, w / 2, ry, Math.PI, TAU).concat(ell(x, y, w / 2, ry, 0, Math.PI))); }
  pen(p, seg(x - w / 2, top, x - w / 2, y, 4), pr(prog, 0, .3), 5, seed); pen(p, seg(x + w / 2, top, x + w / 2, y, 4), pr(prog, .05, .3), 5, seed + 1);
  pen(p, ell(x, y, w / 2, ry, 0, Math.PI), pr(prog, .2, .3), 5, seed + 2);
  for (let k = 1; k < 3; k++) pen(p, ell(x, top + h * k / 3, w / 2, ry, 0, Math.PI), pr(prog, .3 + k * .1, .25), 3.5, seed + 3 + k);
  pen(p, ell(x, top, w / 2, ry), pr(prog, .5, .35), 5, seed + 6);
  if (prog >= .9) { p.fillStyle = '#000'; p.beginPath(); p.ellipse(x + w * .22, top, w * .05, ry * .3, 0, 0, TAU); p.fill(); }
}

// A stack of coins, base centre (x, y), n coins, coin radius rw.
function r3bLeafCoins(p, x, y, n, rw, prog, seed) {
  const th = rw * .3, ry = rw * .3, top = y - n * th;
  if (prog >= 1) { p.fillStyle = '#fff'; fillPoly(p, ell(x, top, rw, ry, Math.PI, TAU).concat(ell(x, y, rw, ry, 0, Math.PI))); }
  pen(p, seg(x - rw, top, x - rw, y, 2), prog, 4, seed); pen(p, seg(x + rw, top, x + rw, y, 2), prog, 4, seed + 1);
  for (let i = 0; i <= n; i++) pen(p, ell(x, y - i * th, rw, ry, 0, Math.PI, 10), prog, i ? 3 : 4, seed + 2 + i, .8);
  pen(p, ell(x, top, rw, ry, 0, TAU, 16), prog, 4, seed + 40);
}

// A closed book standing face-on, base centre (x, y): cover, spine band, page edges showing at the side and top.
function r3bLeafBook(p, x, y, w, h, prog, seed) {
  const x0 = x - w / 2, y0 = y - h;
  if (prog >= .5) { p.fillStyle = '#fff'; p.fillRect(x0, y0 - 12, w + 12, h + 12); }
  pen(p, poly([[x0 + 12, y0 - 12], [x0 + w + 12, y0 - 12], [x0 + w + 12, y - 12]]), pr(prog, .4, .3), 4, seed + 1);
  for (let k = 1; k < 4; k++) pen(p, seg(x0 + w + 3 * k, y0 - 3 * k + 4, x0 + w + 3 * k, y - 3 * k, 2), pr(prog, .5, .2), 2.5, seed + 2 + k);
  pen(p, r3bLeafRR(x0, y0, w, h, 8), pr(prog, 0, .45), 5.5, seed);
  pen(p, seg(x0 + w * .1, y0 + 4, x0 + w * .1, y - 4, 6), pr(prog, .6, .3), 4, seed + 6);
}
function r3bLeafStack(p, x, y, w, n, prog, seed) { // a stack of n closed books lying flat (spines out), base centre (x, y)
  const bh = 14;
  for (let i = 0; i < n; i++) {
    const u = pr(prog, i / n * .8, .2); if (u <= 0) break;
    const off = (rnd(seed, i) - .5) * 10, yy = y - i * bh;
    if (u >= 1) { p.fillStyle = '#fff'; p.fillRect(x - w / 2 + off, yy - bh, w, bh); }
    pen(p, poly([[x - w / 2 + off, yy], [x - w / 2 + off, yy - bh], [x + w / 2 + off, yy - bh], [x + w / 2 + off, yy]], true), u, 3, seed + i * 3, .6);
  }
}

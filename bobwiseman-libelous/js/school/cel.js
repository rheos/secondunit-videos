// Cel engine for the school look: a 1970s limited-animation cel, drawn the way it was made.
// - INK: a brush-pen line in brown-black, its width swelling and thinning along the stroke, and
//   BOILING: every 2 frames the line is redrawn a hair differently, cycling three drawings
//   (boilOf(t)), the way an inker's three tracings of a held pose cycle on screen.
// - PAINT: flat cel colour on the back of the cel, laid with the cel's own small registration error
//   (the colour sits a few pixels off the line, and the line does not quite close over it).
// Everything is a pure function of its arguments; jitter comes from seeds, never Math.random.

const INK = '#2a1810';
const PAL = {
  orange: '#e8762c', mustard: '#e3a92a', teal: '#1d8c8a', tomato: '#d8452f', sky: '#58a6d6', cream: '#f4e7c4',
  green: '#5aa23c', leaf: '#7cc24a', pink: '#ee8f9e', brown: '#9a5a2c', plum: '#6b3f7a', navy: '#2f4677',
  skin: '#f2b88f', skin2: '#d98f62', white: '#fbf6e8', grey: '#6b6a74', ink: '#22346b', gold: '#f2c230', berry: '#b9396a',
};

// Catmull-Rom through control points -> dense polyline
function crPath(pts, closed = true, n = 6) {
  const out = [], m = pts.length;
  if (m < 2) return pts.slice();
  const P = (i) => closed ? pts[(i + m) % m] : pts[Math.max(0, Math.min(m - 1, i))];
  const segs = closed ? m : m - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let k = 0; k < n; k++) {
      const u = k / n, u2 = u * u, u3 = u2 * u;
      out.push([
        .5 * (2 * p1[0] + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3),
        .5 * (2 * p1[1] + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3),
      ]);
    }
  }
  if (!closed) out.push(pts[m - 1].slice());
  return out;
}
// control points of shapes (in local units)
function ellPts(cx, cy, rx, ry, n = 10, rot = 0) {
  const o = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; const x = Math.cos(a) * rx, y = Math.sin(a) * ry; o.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); } return o;
}
function rrPts(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2); const k = r * .3;
  return [[x + r, y], [x + w / 2, y], [x + w - r, y], [x + w - k, y + k], [x + w, y + r], [x + w, y + h / 2], [x + w, y + h - r], [x + w - k, y + h - k],
    [x + w - r, y + h], [x + w / 2, y + h], [x + r, y + h], [x + k, y + h - k], [x, y + h - r], [x, y + h / 2], [x, y + r], [x + k, y + k]];
}
// boil: nudge each control point by a seeded amount that changes with the drawing number
function boilPts(pts, seed, b, amp) {
  if (!amp) return pts;
  return pts.map((p, i) => [p[0] + (rnd(seed, i, b * 7 + 1) - .5) * 2 * amp, p[1] + (rnd(seed, i, b * 7 + 2) - .5) * 2 * amp]);
}
// the brush-pen ribbon along a dense polyline. w = base width; taper for open strokes.
function ribbon(g, P, closed, w, seed, b, taper = true) {
  const n = P.length; if (n < 2) return;
  const L = [], R = [];
  let acc = 0;
  for (let i = 0; i < n; i++) {
    const a = P[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], c = P[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
    let tx = c[0] - a[0], ty = c[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    if (i) acc += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
    let ww = w * (.72 + .55 * (n1(seed * 3 + b * 17, acc / 55) * .5 + .5));
    if (!closed && taper) { const u = i / (n - 1); ww *= Math.min(1, .25 + Math.min(u, 1 - u) * 5); }
    L.push([P[i][0] - ty * ww / 2, P[i][1] + tx * ww / 2]); R.push([P[i][0] + ty * ww / 2, P[i][1] - tx * ww / 2]);
  }
  g.beginPath();
  if (closed) {
    g.moveTo(L[0][0], L[0][1]); for (let i = 1; i < n; i++) g.lineTo(L[i][0], L[i][1]); g.closePath();
    g.moveTo(R[0][0], R[0][1]); for (let i = 1; i < n; i++) g.lineTo(R[i][0], R[i][1]); g.closePath();
    g.fill('evenodd');
  } else {
    g.moveTo(L[0][0], L[0][1]); for (let i = 1; i < n; i++) g.lineTo(L[i][0], L[i][1]);
    for (let i = n - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath(); g.fill();
    // round brush ends
    const e0 = P[0], e1 = P[n - 1];
    const r0 = Math.hypot(L[0][0] - R[0][0], L[0][1] - R[0][1]) / 2, r1 = Math.hypot(L[n - 1][0] - R[n - 1][0], L[n - 1][1] - R[n - 1][1]) / 2;
    g.beginPath(); g.arc(e0[0], e0[1], r0, 0, TAU); g.arc(e1[0], e1[1], r1, 0, TAU); g.fill();
  }
}
function polyFill(g, P) { g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) g.lineTo(P[i][0], P[i][1]); g.closePath(); g.fill(); }

// The current cel context: boil drawing, registration error of the paint, line weight.
const CEL = { b: 0, reg: [4, 3], lw: 7, amp: 2.2 };
function celSet(t, reg) { CEL.b = boilOf(t); if (reg) CEL.reg = reg; }
// a painted, inked closed shape. pts are control points. opt: {lw, amp, n, noLine, noFill}
// straight-sided shapes: densify the polygon (corners kept) so the boil and the brush width still vary along it
function densify(pts, step = 18) { const P = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], k = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)); for (let j = 0; j < k; j++) P.push([lerp(a[0], b[0], j / k), lerp(a[1], b[1], j / k)]); } return P; }
function cel(g, pts, fill, seed, opt = {}) {
  const n = opt.n || 6, amp = opt.amp != null ? opt.amp : CEL.amp, lw = opt.lw || CEL.lw;
  const path = opt.lin ? (q) => { const D = densify(q); return D; } : (q) => crPath(q, true, n);
  if (fill && !opt.noFill) {
    const P = path(pts);
    g.fillStyle = fill;
    g.save(); g.translate(CEL.reg[0] * (opt.regK || 1), CEL.reg[1] * (opt.regK || 1)); polyFill(g, P); g.restore();
  }
  if (!opt.noLine) { g.fillStyle = opt.ink || INK; const q = opt.lin ? boilPts(densify(pts), seed, CEL.b, amp * .5) : crPath(boilPts(pts, seed, CEL.b, amp), true, n); ribbon(g, q, true, lw, seed, CEL.b); }
}
// an open inked stroke (mouths, limbs, hatching). opt: {lw, amp, taper}
function stroke(g, pts, seed, opt = {}) {
  const amp = opt.amp != null ? opt.amp : CEL.amp, lw = opt.lw || CEL.lw;
  g.fillStyle = opt.ink || INK;
  ribbon(g, crPath(boilPts(pts, seed, CEL.b, amp), false, opt.n || 6), false, lw, seed, CEL.b, opt.taper !== false);
}
// rubber-hose limb: a fat painted tube from a to b with a bend, inked both sides
function hose(g, a, b, bend, width, fill, seed, opt = {}) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
  const m = [mx - dy / l * bend, my + dx / l * bend];
  const P = crPath([a, m, b], false, 8);
  // paint: a thick round-capped polyline
  g.save(); g.translate(CEL.reg[0], CEL.reg[1]);
  g.strokeStyle = fill; g.lineWidth = width; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (const p of P) g.lineTo(p[0], p[1]); g.stroke(); g.restore();
  // ink: two edges
  const off = (s) => P.map((p, i) => { const q = P[Math.min(P.length - 1, i + 1)], r = P[Math.max(0, i - 1)]; let tx = q[0] - r[0], ty = q[1] - r[1]; const tl = Math.hypot(tx, ty) || 1; return [p[0] - ty / tl * s, p[1] + tx / tl * s]; });
  const lw = opt.lw || CEL.lw * .8;
  g.fillStyle = INK;
  ribbon(g, boilPts(off(width / 2), seed, CEL.b, CEL.amp * .6), false, lw, seed, CEL.b);
  ribbon(g, boilPts(off(-width / 2), seed + 1, CEL.b, CEL.amp * .6), false, lw, seed + 1, CEL.b);
}
// a mitten hand: a fat rounded blob with a thumb, white gloves are a cartoon convention
function mitten(g, x, y, r, ang, fill, seed, fist = false) {
  g.save(); g.translate(x, y); g.rotate(ang);
  if (fist) cel(g, ellPts(0, 0, r, r * .88, 9), fill, seed, { lw: CEL.lw * .85 });
  else {
    cel(g, [[-r * .8, -r * .5], [0, -r * 1.05], [r * .85, -r * .6], [r * 1.0, r * .3], [r * .3, r * .95], [-r * .6, r * .75], [-r * .95, r * .1]], fill, seed, { lw: CEL.lw * .85 });
  }
  // thumb
  cel(g, ellPts(-r * .55, -r * .55, r * .38, r * .28, 7, -.6), fill, seed + 3, { lw: CEL.lw * .7 });
  if (fist) for (let k = 0; k < 3; k++) stroke(g, [[r * .2 + k * r * .02, -r * .55 + k * r * .4], [r * .75, -r * .45 + k * r * .4]], seed + 10 + k, { lw: CEL.lw * .5 });
  g.restore();
}
// faces: big oval eyes with pupils, a mouth
function eyes(g, x, y, s, seed, o = {}) {
  const gap = (o.gap || .55) * s, rx = .26 * s, ry = .36 * s, look = o.look || [0, 0], blink = o.blink || 0;
  for (const side of [-1, 1]) {
    const ex = x + side * gap / 2;
    if (blink > .7) { stroke(g, [[ex - rx, y + ry * .1], [ex, y + ry * .35], [ex + rx, y + ry * .1]], seed + side, { lw: CEL.lw * .7 }); continue; }
    cel(g, ellPts(ex, y, rx, ry * (1 - blink), 9), PAL.white, seed + side * 5, { lw: CEL.lw * .75 });
    g.fillStyle = INK; g.beginPath(); g.ellipse(ex + look[0] * rx * .45, y + look[1] * ry * .4 + ry * .12, rx * .48, ry * .5 * (1 - blink), 0, 0, TAU); g.fill();
    g.fillStyle = PAL.white; g.beginPath(); g.arc(ex + look[0] * rx * .45 - rx * .16, y + look[1] * ry * .4 - ry * .05, rx * .16, 0, TAU); g.fill();
    if (o.brow != null) stroke(g, [[ex - rx * 1.1, y - ry * 1.25 - side * o.brow * s * .08], [ex + rx * 1.0, y - ry * 1.3 + side * o.brow * s * .08]], seed + 20 + side, { lw: CEL.lw * .8 });
  }
}
function mouth(g, x, y, w, kind, seed, open = 0) {
  if (kind === 'smile' && open < .1) { stroke(g, [[x - w / 2, y - w * .1], [x - w * .2, y + w * .2], [x + w * .2, y + w * .2], [x + w / 2, y - w * .1]], seed, { lw: CEL.lw * .9 }); return; }
  if (kind === 'o') { cel(g, ellPts(x, y, w * .22, w * .3, 8), '#7a2a22', seed, { lw: CEL.lw * .8 }); return; }
  if (kind === 'flat') { stroke(g, [[x - w * .4, y], [x + w * .4, y + w * .03]], seed, { lw: CEL.lw * .9 }); return; }
  // open grin: a D shape with a tongue
  const h = w * (.35 + open * .35);
  const pts = [[x - w / 2, y - w * .08], [x, y - w * .02], [x + w / 2, y - w * .08], [x + w * .3, y + h * .8], [x, y + h], [x - w * .3, y + h * .8]];
  cel(g, pts, '#7a2a22', seed, { lw: CEL.lw * .9 });
  g.fillStyle = '#e0707a'; g.beginPath(); g.ellipse(x + CEL.reg[0] * .5, y + h * .72, w * .2, h * .2, 0, 0, TAU); g.fill();
}
// a cel puff (appear/disappear): a ring of round clouds, scale u 0..1
function puff(g, x, y, r, u, seed) {
  if (u <= 0 || u >= 1) return;
  const k = 8;
  for (let i = 0; i < k; i++) {
    const a = i / k * TAU + seed, d = r * (.4 + u * .9), rr = r * .42 * (1 - u * .7);
    cel(g, ellPts(x + Math.cos(a) * d, y + Math.sin(a) * d * .8, rr, rr * .85, 7), PAL.white, seed * 10 + i, { lw: CEL.lw * .7 });
  }
}
// a star (gold sticker, sparkle)
function starPts(cx, cy, r1, r2, n = 5, rot = -Math.PI / 2) { const o = []; for (let i = 0; i < n * 2; i++) { const r = i % 2 ? r2 : r1, a = rot + i / (n * 2) * TAU; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; }
function heartPts(cx, cy, s) { return [[cx, cy + s * .9], [cx - s * .75, cy + s * .2], [cx - s * .9, cy - s * .35], [cx - s * .5, cy - s * .75], [cx, cy - s * .4], [cx + s * .5, cy - s * .75], [cx + s * .9, cy - s * .35], [cx + s * .75, cy + s * .2]]; }
// painted lettering on a prop (signs, labels): the props are cels too, so their lettering is hand-inked
function propText(g, txt, x, y, size, fill, seed, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot || 0);
  g.font = `${size}px "SchoolRound"`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const b = CEL.b, j = (k) => (rnd(seed, k, b) - .5) * size * .02;
  g.lineJoin = 'round';
  if (o.shadow) { g.fillStyle = o.shadow; g.fillText(txt, size * .06, size * .07); }
  g.strokeStyle = INK; g.lineWidth = o.lw || size * .14; g.strokeText(txt, j(1), j(2));
  g.fillStyle = fill; g.fillText(txt, CEL.reg[0] * .4, CEL.reg[1] * .4);
  g.restore();
}

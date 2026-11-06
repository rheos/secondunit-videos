// Round 3, leaf-A: the fineliner pictures for the intro and stanzas 1-5 (the picture box of each leaflet page).
// Picture-box coordinates: PBW x PBH (1800 x 390), ground at GY (pictures.js). Loaded after the kit (ink.js,
// pictures.js, early.js) and before r3a-main.js; everything runs at call time and is a pure function of t.
// Words never appear here except as rub-down/typed captions in r3a-main.js; the pictures carry no lettering.

// ---- heads, for the captions-off-faces audit (r3a-main.js __auditR3A turns logging on) ---------------------------
let r3aLogHeads = false; const r3aHeads = [];
function r3aPerson(p, o, prog, seed) {
  person(p, o, prog, seed);
  if (r3aLogHeads && prog > 0) { const r = o.h * .1, hx = o.x + (o.lean || 0) * o.h * .04, hy = o.y - o.h + r + (o.hunch || 0) * o.h * .03; r3aHeads.push([hx - r * 1.7, hy - r * 2.7, hx + r * 1.7, hy + r * 1.2]); }
}
function r3aKing(p, x, y, h, prog, seed, o = {}) {
  king(p, x, y, h, prog, seed, o);
  if (r3aLogHeads && prog > 0) { const r = h * .14, hy = y - h + r * 1.5, hx = x + (o.tilt || 0) * r * .4; r3aHeads.push([hx - r * 1.2, hy - r * 1.9, hx + r * 1.2, hy + r * 1.1]); }
}

// ---- small helpers ----------------------------------------------------------------------------------------------
const r3aBox = (x, y, w, h) => poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true);
const r3aCount = (times, t) => { let n = 0; for (const s of times) if (t >= s) n++; return n; };
const r3aWordsFrom = (i, k0 = 0, k1 = 99) => r3aLN[i].words.slice(k0, k1).map(w => w.s);
function r3aGround(p, u, seed) { pen(p, seg(0, GY, PBW, GY, 30), u, 5, seed); }
function r3aArrow(p, x0, y0, x1, y1, prog, seed, w = 5) {
  pen(p, seg(x0, y0, x1, y1, 12), prog, w, seed);
  const a = Math.atan2(y1 - y0, x1 - x0), L = 26, u = clamp((prog - .75) / .25);
  if (u > 0) pen(p, poly([[x1 - Math.cos(a - .5) * L, y1 - Math.sin(a - .5) * L], [x1, y1], [x1 - Math.cos(a + .5) * L, y1 - Math.sin(a + .5) * L]]), u, w, seed + 1);
}
function r3aDashes(p, pts, prog, seed, w = 4, on = 3) { // a dashed path (every other segment of a resampled polyline)
  const n = pts.length - 1, m = Math.ceil(n * clamp(prog));
  for (let i = 0; i < m; i += 2) pen(p, [pts[i], pts[Math.min(n, i + 1)]], 1, w, seed + i, .4);
}
// where a person's head and shoulders are, the same arithmetic person() uses
function r3aBody(o) { const r = o.h * .1, hx = o.x + (o.lean || 0) * o.h * .04, hy = o.y - o.h + r + (o.hunch || 0) * o.h * .03; return { r, hx, hy, sy: hy + r * 1.25, sw: o.h * .13 }; }
// extra costume on top of a person (drawn after it): military cap and braid, a tiara, a monocle, a little crown, a wide hat
function r3aDress(p, o, kind, prog, seed) {
  if (prog <= 0) return;
  const { r, hx, hy, sy, sw } = r3aBody(o), h = o.h, items = [];
  if (kind === 'military') {
    items.push({ p: poly([[hx - r * 1.05, hy - r * .5], [hx - r * 1.25, hy - r * 1.35], [hx + r * 1.25, hy - r * 1.35], [hx + r * 1.05, hy - r * .5]], true), w: 4.5, white: true });
    items.push({ p: quad([hx - r * 1.15, hy - r * .48], [hx + r * .3, hy - r * .05], [hx + r * 1.35, hy - r * .45], 10), w: 6 });
    items.push({ p: [[hx, hy - r * .95]], dot: 5 });
    for (const sd of [-1, 1]) {
      const ex = hx + sd * sw * .95; items.push({ p: r3aBox(ex - r * .45, sy - 4, r * .9, r * .28), w: 4, white: true });
      for (let k = 0; k < 4; k++) items.push({ p: seg(ex - r * .35 + k * r * .23, sy + r * .26, ex - r * .35 + k * r * .23, sy + r * .55, 2), w: 2.5 });
    }
    for (let k = 0; k < 3; k++) { const mx = hx - r * .75 + k * r * .38, my = sy + h * .13; items.push({ p: r3aBox(mx - 5, my - 16, 10, 12), w: 2.5 }, { p: [[mx, my]], dot: 5.5 }); }
    items.push({ p: seg(hx - sw * .8, sy + 6, hx + sw * .7, y0(o) - h * .32, 6), w: 3 });
  } else if (kind === 'tiara') {
    items.push({ p: poly(crownPts(hx, hy - r * .92, r * 1.2, r * .5), true), w: 3.5 });
    items.push({ p: [[hx, hy - r * 1.45]], dot: 3.5 });
  } else if (kind === 'monocle') {
    const lk = (o.look || 0) * r * .3, ex = hx + r * .35 + lk, ey = hy - r * .05;
    items.push({ p: ell(ex, ey, r * .3), w: 3.5 }, { p: quad([ex + r * .2, ey + r * .25], [ex + r * .55, sy - r * .2], [ex + r * .1, sy + h * .06], 8), w: 2 });
    items.push({ p: poly([[hx - r * .45, sy + 2], [hx, sy + 14], [hx - r * .45, sy + 26]], true), fill: true, w: 3 }, { p: poly([[hx + r * .45, sy + 2], [hx, sy + 14], [hx + r * .45, sy + 26]], true), fill: true, w: 3 });
  } else if (kind === 'crown') {
    items.push({ p: poly(crownPts(hx, hy - r * .85, r * 1.4, r * .65), true), w: 3.5, white: true });
  } else if (kind === 'brim') {
    items.push({ p: poly([[hx - r * .95, hy - r * .75], [hx - r * .85, hy - r * 1.75], [hx, hy - r * 1.5], [hx + r * .85, hy - r * 1.75], [hx + r * .95, hy - r * .75]], true), w: 4.5, white: true });
    items.push({ p: ell(hx, hy - r * .72, r * 2.0, r * .32), w: 5 });
  }
  drawSet(p, items, prog, seed, clamp(h / 250, .62, 1.1));
}
function y0(o) { return o.y; }

// a raised fist, front on (the protest-poster fist, here it is the king's): wrist cuff at the bottom (x, y), height s
function r3aFist(p, x, y, s, prog, seed) {
  const items = [], L = x - s * .36, R = x + s * .36, T = y - s * .92, fw = (R - L) / 4, top = [];
  for (let k = 0; k < 4; k++) top.push(...ell(L + fw * (k + .5), T + fw * .5, fw * .5, fw * .55, Math.PI, TAU, 8));
  const wy = y - s * .32; // the wrist
  items.push({ p: [[L, wy - s * .1], [L, T + fw * .5], ...top, [R, T + fw * .5], [R, y - s * .5], [x + s * .26, wy], [x - s * .26, wy], [L, wy - s * .1]], w: 6, white: true });
  for (let k = 1; k < 4; k++) items.push({ p: seg(L + fw * k, T + fw * .55, L + fw * k, T + s * .34, 3), w: 4 }); // between the fingers
  for (let k = 0; k < 4; k++) items.push({ p: ell(L + fw * (k + .5), T + s * .3, fw * .3, s * .04, 0, Math.PI, 6), w: 3 }); // second knuckles
  items.push({ p: [...ell(L + s * .14, T + s * .47, s * .14, s * .1, Math.PI * .5, Math.PI * 1.5, 8), [x + s * .2, T + s * .37], ...ell(x + s * .2, T + s * .47, s * .1, s * .1, -Math.PI * .5, Math.PI * .5, 8), [L + s * .14, T + s * .57]], w: 5, white: true }); // the thumb across
  items.push({ p: r3aBox(x - s * .28, wy, s * .56, y - wy), w: 5, white: true }); // the cuff
  for (let k = 0; k < 3; k++) items.push({ p: seg(x - s * .17 + k * s * .17, wy + 4, x - s * .17 + k * s * .17, y - 4, 2), w: 2.5 });
  drawSet(p, items, prog, seed, s / 250);
}
// a plan: a scroll with rolled ends, unrolled, with a battle plan drawn on it (arrows, an X, a dashed route)
function r3aPlan(p, cx, cy, w, h, prog, seed) {
  const items = [], x0 = cx - w / 2, y0 = cy - h / 2;
  items.push({ p: r3aBox(x0, y0, w, h), w: 4.5, white: true });
  for (const yy of [y0, y0 + h]) items.push({ p: ell(cx, yy, w / 2 + 14, 13), w: 5, white: true }, { p: ell(x0 - 14, yy, 6, 13), w: 4 });
  items.push({ p: quad([x0 + w * .15, y0 + h * .78], [x0 + w * .4, y0 + h * .2], [x0 + w * .8, y0 + h * .35], 14), w: 3.5 });
  items.push({ p: poly([[x0 + w * .72, y0 + h * .27], [x0 + w * .8, y0 + h * .35], [x0 + w * .7, y0 + h * .42]]), w: 3.5 });
  items.push({ p: seg(x0 + w * .62, y0 + h * .55, x0 + w * .82, y0 + h * .8, 3), w: 5 }, { p: seg(x0 + w * .82, y0 + h * .55, x0 + w * .62, y0 + h * .8, 3), w: 5 });
  for (let k = 0; k < 3; k++) items.push({ p: ell(x0 + w * (.2 + k * .14), y0 + h * .3 + k * 8, 7, 7), w: 3 });
  drawSet(p, items, prog, seed);
}
// a big mouth: lips with a cupid's bow; open 0..1 shows teeth and the dark inside
function r3aMouth(p, cx, cy, w, open, prog, seed) {
  const h = w * .22, o = open * w * .2, items = [];
  items.push({ p: [[cx - w / 2, cy], [cx - w * .3, cy - h], [cx - w * .08, cy - h * .9], [cx, cy - h * .62], [cx + w * .08, cy - h * .9], [cx + w * .3, cy - h], [cx + w / 2, cy]], w: 6 });
  items.push({ p: quad([cx - w / 2, cy], [cx, cy + h * 1.6 + o * 1.5], [cx + w / 2, cy], 16), w: 6 });
  items.push({ p: quad([cx - w / 2, cy], [cx, cy + h * .25], [cx + w / 2, cy], 12), w: 4 });
  drawSet(p, items, prog, seed, w / 260);
  if (prog >= 1 && open > .05) {
    p.save(); p.fillStyle = '#000'; p.beginPath(); p.moveTo(cx - w * .44, cy + 2); p.quadraticCurveTo(cx, cy + h * .2, cx + w * .44, cy + 2); p.quadraticCurveTo(cx, cy + 2 + o * 2.2, cx - w * .44, cy + 2); p.fill();
    p.fillStyle = '#fff'; p.beginPath(); p.moveTo(cx - w * .32, cy + 6); p.quadraticCurveTo(cx, cy + h * .26, cx + w * .32, cy + 6); p.lineTo(cx + w * .3, cy + 6 + o * .5); p.quadraticCurveTo(cx, cy + o * .62 + 8, cx - w * .3, cy + 6 + o * .5); p.closePath(); p.fill();
    for (let k = 1; k < 6; k++) pen(p, seg(cx - w * .32 + k * w * .107, cy + 6, cx - w * .32 + k * w * .107, cy + 6 + o * .5, 2), 1, 2.5, null);
    p.restore();
  }
}
// a shareholder: head and shoulders, top hat (lift 0..1 raises and tips it), dot eyes, mouth line or smile
function r3aHatHead(p, x, y, r, lift, smile, prog, seed, armUp = 0) {
  const items = [];
  items.push({ p: quad([x - r * 2.1, y + r * 2.6], [x, y + r * .6], [x + r * 2.1, y + r * 2.6], 14), w: 4.5, white: true });
  items.push({ p: poly([[x - r * .5, y + r * 1.05], [x, y + r * 1.5], [x + r * .5, y + r * 1.05]]), w: 3.5 }); // collar
  items.push({ p: ell(x, y, r, r * 1.05), w: 4.5, white: true });
  items.push({ p: [[x - r * .35, y - r * .05]], dot: Math.max(2.4, r * .1) }, { p: [[x + r * .35, y - r * .05]], dot: Math.max(2.4, r * .1) });
  if (smile) items.push({ p: quad([x - r * .4, y + r * .3], [x, y + r * .72], [x + r * .4, y + r * .3], 8), w: 4 });
  else items.push({ p: seg(x - r * .25, y + r * .45, x + r * .25, y + r * .45, 3), w: 4 });
  const by = y - r * .78 - lift * r * 1.3, bx = x + lift * r * .5, a = lift * .35, R = (u, v) => [bx + Math.cos(a) * u - Math.sin(a) * v, by + Math.sin(a) * u + Math.cos(a) * v];
  items.push({ p: [R(-r * 1.45, 0), R(r * 1.45, 0)], w: 6 });
  items.push({ p: [R(-r * .85, -2), R(-r * .9, -r * 1.6), R(r * .9, -r * 1.6), R(r * .85, -2)], fill: true, w: 5 });
  if (armUp > 0) { // a mitten raised beside the head
    const ax = x + r * 1.7, ay = y + r * 1.8, hx = ax + r * .3, hy = lerp(ay, y - r * 1.2, armUp);
    items.push({ p: seg(ax, ay, hx, hy, 4), w: 4.5 }); mitten(items, hx, hy, -Math.PI / 2, r * 6, 4, true, 1);
  }
  drawSet(p, items, prog, seed, r / 30);
  if (r3aLogHeads && prog > 0) r3aHeads.push([x - r * 1.5, y - r * 2.6 - lift * r * 1.3, x + r * 1.6, y + r * 1.1]);
}
// a pointing hand (a printer's manicule), cuff at (x, y), pointing right, size s
function r3aManicule(p, x, y, s, prog, seed) {
  const items = [], P = (u, v) => [x + u * s, y + v * s];
  items.push({ p: poly([P(0, -.24), P(.3, -.26), P(.3, .26), P(0, .24)], true), w: 5, white: true });
  items.push({ p: poly([P(.3, -.28), P(.55, -.32), P(1.22, -.3), P(1.3, -.22), P(1.22, -.14), P(.74, -.14), P(.79, -.05), P(.73, .04), P(.78, .12), P(.71, .21), P(.6, .3), P(.3, .3)], true), w: 5, white: true });
  items.push({ p: quad(P(.45, -.3), P(.62, -.5), P(.74, -.31), 8), w: 4.5 }); // thumb
  for (const v of [-.05, .04, .12]) items.push({ p: seg(...P(.56, v), ...P(.72, v), 2), w: 3.5 });
  items.push({ p: seg(...P(1.08, -.3), ...P(1.08, -.14), 2), w: 3 }); // the nail
  drawSet(p, items, prog, seed, s / 250);
}
function r3aSack(p, x, y, s, prog, seed) { // a money sack, tied at the neck, a coin on its side
  const items = [];
  items.push({ p: [...quad([x - s * .16, y - s * .78], [x - s * .62, y - s * .4], [x - s * .4, y], 12), ...quad([x - s * .4, y], [x, y + s * .04], [x + s * .4, y], 8).slice(1), ...quad([x + s * .4, y], [x + s * .62, y - s * .4], [x + s * .16, y - s * .78], 12).slice(1)], w: 5, white: true });
  items.push({ p: poly([[x - s * .16, y - s * .78], [x - s * .3, y - s * 1.0], [x - s * .05, y - s * .9], [x + s * .1, y - s * 1.02], [x + s * .3, y - s * .95], [x + s * .16, y - s * .78]]), w: 4.5 });
  items.push({ p: seg(x - s * .2, y - s * .78, x + s * .2, y - s * .78, 3), w: 6 });
  items.push({ p: ell(x, y - s * .38, s * .16), w: 4 }, { p: ell(x, y - s * .38, s * .09), w: 3 });
  drawSet(p, items, prog, seed, s / 200);
}
function r3aCoin(p, x, y, r, seed) { // a coin lying flat (seen edge-on a little): white face, rim, edge
  p.fillStyle = '#fff'; p.beginPath(); p.ellipse(x, y, r, r * .32, 0, 0, TAU); p.fill(); p.fillRect(x - r, y, r * 2, r * .28);
  pen(p, ell(x, y, r, r * .32), 1, 3.5, seed, .6);
  pen(p, seg(x - r, y, x - r, y + r * .28, 1), 1, 3.5, null); pen(p, seg(x + r, y, x + r, y + r * .28, 1), 1, 3.5, null);
  pen(p, ell(x, y + r * .28, r, r * .32, 0, Math.PI), 1, 3.5, seed + 1, .6);
  pen(p, ell(x, y, r * .6, r * .19), 1, 2.5, seed + 2, .4);
}
function r3aTree(p, x, y, s, prog, seed, roots = false) { // trunk, a scalloped canopy; roots optional
  const items = [];
  items.push({ p: poly([[x - s * .08, y], [x - s * .06, y - s * .55], [x - s * .2, y - s * .72]]), w: 5 }, { p: poly([[x + s * .08, y], [x + s * .06, y - s * .55], [x + s * .22, y - s * .7]]), w: 5 });
  const c = []; for (let i = 0; i <= 15; i++) { const a = Math.PI * .85 - i / 15 * Math.PI * 1.7 - Math.PI / 2, rr = s * (.42 + (i % 2) * .06); c.push([x + Math.cos(a) * rr * 1.1, y - s * .95 + Math.sin(a) * rr]); }
  items.push({ p: c, w: 5, white: true });
  if (roots) for (let k = 0; k < 5; k++) items.push({ p: quad([x + (k - 2) * s * .03, y], [x + (k - 2) * s * .2, y + s * .05], [x + (k - 2) * s * .28, y + s * .12 + (k % 2) * s * .05], 8), w: 4 });
  drawSet(p, items, prog, seed, s / 260);
}
function r3aHouse(p, x, y, s, prog, seed) { // a plain house: walls, a pitched roof, a door, a window
  const items = [];
  items.push({ p: poly([[x - s * .5, y], [x - s * .5, y - s * .6], [x + s * .5, y - s * .6], [x + s * .5, y]]), w: 4.5, white: true });
  items.push({ p: poly([[x - s * .62, y - s * .56], [x, y - s * 1.05], [x + s * .62, y - s * .56]]), w: 5 });
  items.push({ p: r3aBox(x - s * .12, y - s * .36, s * .24, s * .36), w: 4 }, { p: r3aBox(x + s * .22, y - s * .45, s * .18, s * .16), w: 3.5 });
  drawSet(p, items, prog, seed, s / 200);
}
function r3aHall(p, x, y, s, prog, seed) { // a columned hall: steps, columns, a pediment
  const items = [], w = s * 1.6;
  items.push({ p: seg(x - w / 2 - 20, y, x + w / 2 + 20, y, 10), w: 5 }, { p: seg(x - w / 2 - 8, y - 14, x + w / 2 + 8, y - 14, 10), w: 4 });
  items.push({ p: seg(x - w / 2, y - s * .82, x + w / 2, y - s * .82, 10), w: 5 }, { p: seg(x - w / 2, y - s * .9, x + w / 2, y - s * .9, 10), w: 4 });
  items.push({ p: poly([[x - w / 2 - 14, y - s * .9], [x, y - s * 1.22], [x + w / 2 + 14, y - s * .9]], true), w: 5 });
  for (let k = 0; k < 6; k++) { const cx = x - w / 2 + w * (k + .5) / 6; items.push({ p: seg(cx - s * .05, y - 14, cx - s * .05, y - s * .82, 4), w: 4 }, { p: seg(cx + s * .05, y - 14, cx + s * .05, y - s * .82, 4), w: 4 }); }
  drawSet(p, items, prog, seed, s / 220);
}
function r3aCow(p, x, y, s, prog, seed, dir = 1) { // a cow side on, feet at (x, y), body length ~s, patches
  const items = [], D = (u, v) => [x + dir * u * s, y + v * s];
  items.push({ p: poly([D(-.45, -.62), D(.32, -.64), D(.42, -.56), D(.42, -.32), D(-.45, -.3), D(-.5, -.45)], true), w: 4.5, white: true });
  for (const u of [-.4, -.28, .22, .34]) items.push({ p: seg(...D(u, -.32), ...D(u + .01, 0), 2), w: 4.5 });
  items.push({ p: poly([D(.4, -.6), D(.62, -.56), D(.68, -.4), D(.58, -.36), D(.42, -.44)], true), w: 4, white: true });
  items.push({ p: quad(D(.44, -.6), D(.42, -.74), D(.5, -.76), 5), w: 3.5 }, { p: quad(D(.54, -.6), D(.56, -.74), D(.62, -.74), 5), w: 3.5 });
  items.push({ p: [D(.55, -.52)], dot: 2.6 });
  items.push({ p: quad(D(-.48, -.58), D(-.62, -.42), D(-.58, -.2), 6), w: 3 });
  items.push({ p: poly([D(-.2, -.6), D(-.05, -.62), D(-.02, -.5), D(-.15, -.44), D(-.24, -.5)], true), fill: true, w: 3 });
  items.push({ p: poly([D(.12, -.5), D(.24, -.52), D(.26, -.4), D(.14, -.36)], true), fill: true, w: 3 });
  drawSet(p, items, prog, seed, .75);
}
function r3aBarrel(p, x, y, s, prog, seed) { // a drum with crossed bones on it (plain, stylised)
  const items = [];
  items.push({ p: r3aBox(x - s * .3, y - s, s * .6, s), w: 5, white: true });
  items.push({ p: ell(x, y - s, s * .3, s * .07), w: 4 }, { p: seg(x - s * .3, y - s * .72, x + s * .3, y - s * .72, 4), w: 3 }, { p: seg(x - s * .3, y - s * .25, x + s * .3, y - s * .25, 4), w: 3 });
  const cy = y - s * .5, k = s * .14;
  items.push({ p: seg(x - k, cy - k * .7, x + k, cy + k * .7, 3), w: 5 }, { p: seg(x + k, cy - k * .7, x - k, cy + k * .7, 3), w: 5 });
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) items.push({ p: [[x + a * k * 1.05, cy + b * k * .75]], dot: 5 });
  drawSet(p, items, prog, seed, s / 200);
}

// ---- the pages -------------------------------------------------------------------------------------------------------
const R3A_PICS = {};

// intro: the copier warms up. A typewriter at left (its carriage steps on each beat as the typist tries the ribbon),
// the copier (lid slams on the first strong beat, the lamp flares on every beat), test sheets onto a pile.
R3A_PICS.intro = (p, t) => {
  r3aGround(p, 1, 7001);
  const k = r3aCount(R3A_ORN, t + R3A_EARLY), last = k ? R3A_ORN[k - 1] : R3A_THUMP;
  const pulse = t >= R3A_THUMP - R3A_EARLY ? Math.exp(-(t - last) * 7) : 0;
  { // the typewriter
    const x = 330, sh = -k * 9 + 76, items = [];
    items.push({ p: r3aBox(x - 95 + sh, GY - 300, 190, 158), w: 4.5, white: true }); // the sheet in the roller
    for (let j = 0; j < k; j++) { const ax = x - 70 + sh + j * 9 + 30, ay = GY - 262; items.push({ p: seg(ax - 4, ay, ax + 4, ay, 1), w: 2.5 }, { p: seg(ax, ay - 4, ax, ay + 4, 1), w: 2.5 }); }
    items.push({ p: r3aBox(x - 190 + sh, GY - 160, 380, 36), w: 5, white: true }, { p: ell(x - 200 + sh, GY - 142, 16, 16), w: 4.5 }, { p: ell(x + 200 + sh, GY - 142, 16, 16), w: 4.5 });
    items.push({ p: poly([[x - 175, GY], [x - 150, GY - 124], [x + 150, GY - 124], [x + 175, GY]], true), w: 5, white: true });
    for (let row = 0; row < 3; row++) for (let j = 0; j < 9 - row; j++) items.push({ p: ell(x - 116 + row * 14 + j * 29, GY - 26 - row * 28, 9, 7), w: 3 });
    drawSet(p, items, 1, 7010);
    if (k && t - last < .12) pen(p, poly([[x - 40, GY - 124], [x - 6, GY - 212], [x + 6, GY - 212]]), 1, 4, 7040 + k); // the typebar flies up
  }
  // the copier: lid open, it slams on the first strong beat; the lamp flares on every beat after
  copier(p, 900, GY, 1.3, 1, ease(t, R3A_THUMP - .18, R3A_THUMP), pulse > .05 ? .5 + .5 * pulse : 0, 7100);
  if (pulse > .05) { // the ready light blinks
    const top = GY - 150 * 1.3; pen(p, ell(900 + 390 * .24, top + 36 * 1.3, 13, 13), 1, 3.5, 7120);
  }
  // test sheets: one shoots out of the tray onto the pile on every beat
  for (let i = 0; i < k; i++) {
    const fly = pr(t, R3A_ORN[i] - R3A_EARLY, .2), y = GY - 8 - i * 13, rot = (rnd(i, 13) - .5) * .1, x = 1480 + (rnd(i, 14) - .5) * 36;
    const fx = lerp(1150, x, fly), fy = lerp(150, y, fly) - Math.sin(fly * Math.PI) * 110;
    p.save(); p.translate(fx, fy); p.rotate(rot + (1 - fly) * 1.1);
    p.fillStyle = '#fff'; p.beginPath(); p.moveTo(-150, 0); p.lineTo(100, 0); p.lineTo(150, -20); p.lineTo(-100, -20); p.closePath(); p.fill();
    pen(p, poly([[-150, 0], [100, 0], [150, -20], [-100, -20]], true), 1, 3, 7200 + i);
    p.restore();
  }
};

// stanza 1: the king's chain as a flow chart, link by link; then the meeting; then the reason and the cash
R3A_PICS.chain = (p, t, pi) => {
  const E = R3A_EARLY;
  if (pi === 0) {
    r3aGround(p, 1, 7301);
    const throne = pr(t, r3aL(0) - E, .6); // the throne first, the king on his word
    pen(p, poly([[40, GY], [40, 40], [300, 40], [300, GY]]), throne, 5, 7302); pen(p, poly(crownPts(170, 40, 60, 26), true), throne, 4.5, 7303);
    const plan = t >= r3aS(1, 5) - E;
    r3aKing(p, 170, GY, 290, pr(t, r3aS(0, 4) - E, .45), 7310, { armR: plan ? 1.9 : .5 });
    const nodes = [[r3aL(1), r3aS(1, 5)], [r3aL(2), r3aS(2, 5)], [r3aL(3), r3aS(3, 5)], [r3aL(4), r3aS(4, 5)]];
    const xs = [170, 530, 890, 1250, 1610];
    nodes.forEach(([la, nw], j) => { if (t >= la - E) r3aArrow(p, xs[j] + 150, 225, xs[j + 1] - 130, 225, pr(t, la - E, .35), 7320 + j * 3, 6); });
    if (t >= r3aS(1, 5) - E) r3aPlan(p, 530, 190, 190, 210, pr(t, r3aS(1, 5) - E, .4), 7330);
    if (t >= r3aS(2, 5) - E) r3aFist(p, 890, GY - 20, 300, pr(t, r3aS(2, 5) - E, .4), 7340);
    if (t >= r3aS(3, 5) - E) r3aPerson(p, { x: 1250, y: GY, h: 270, tophat: true, mouth: 'line', look: .6 }, pr(t, r3aS(3, 5) - E, .45), 7350);
    if (t >= r3aS(4, 5) - E) r3aMouth(p, 1610, 200, 250, 0, pr(t, r3aS(4, 5) - E, .35), 7360);
  } else if (pi === 1) { // the mouth at the lectern; rows of shareholders in top hats
    r3aGround(p, 1, 7401);
    const lu = pr(t, r3aL(5) - E, .4);
    pen(p, poly([[230, GY], [260, 285], [400, 285], [430, GY]], true), lu, 5, 7402); pen(p, poly([[210, 285], [450, 285], [430, 260], [230, 260]], true), lu, 5, 7403);
    const speak = [...r3aWordsFrom(5, 3), ...r3aLN[6].words.filter(w => w.s < r3aS(6, 7)).map(w => w.s)];
    const n = r3aCount(speak, t + E), op = n ? Math.max(0, Math.sin(clamp((t - speak[n - 1] + E) / .2) * Math.PI)) : 0;
    r3aMouth(p, 330, 105, 270, op, pr(t, r3aS(5, 2) - E, .3), 7410);
    if (n) for (let k = 0; k < 3; k++) pen(p, ell(330, 125, 170 + k * 34, 70 + k * 22, -.6, .6), op, 4, 7415 + k); // speech arcs
    const greetA = r3aS(6, 7), greetB = r3aS(6, 8) + .25, sm = r3aS(7, 3);
    const hu = pr(t, r3aS(5, 5) - E, .5), rows = [[160, 34, 6, 700], [300, 38, 6, 790]];
    let idx = 0;
    rows.forEach(([y, r, n2, x0], ri) => {
      for (let j = 0; j < n2; j++, idx++) {
        const x = x0 + j * 180, stepT = greetA + idx * (greetB - greetA) / 12;
        const lift = t >= stepT ? Math.sin(clamp((t - stepT) / .5) * Math.PI) : 0;
        r3aHatHead(p, x, y, r, lift, t >= sm - E + idx * .02, hu, 7420 + idx * 7);
      }
    });
  } else { // chose, for a reason (a pointing hand), the cash (sacks), believing (a pillar of coins, the king on top)
    r3aGround(p, 1, 7501);
    const up = ease(t, r3aS(8, 2) - E, r3aS(8, 2) + .2);
    [[140, 0], [290, 1], [440, 2]].forEach(([x, k]) => r3aHatHead(p, x, 190, 36, 0, false, pr(t, r3aL(8) - E + k * .06, .35), 7510 + k * 7, up * (k === 1 ? 1 : .9)));
    if (t >= r3aS(8, 6) - E) r3aManicule(p, 560, 200, 150, pr(t, r3aS(8, 6) - E, .3), 7530);
    if (t >= r3aS(9, 5) - E) [[980, 0], [1110, 1], [1045, 2]].forEach(([x, k]) => {
      const drop = ease(t, r3aS(9, 5) - E + k * .07, r3aS(9, 5) + .18 + k * .07), y = lerp(-80, k === 2 ? GY - 40 : GY, drop);
      r3aSack(p, x, y, k === 2 ? 130 : 150, 1, 7540 + k * 5);
    });
    if (t >= r3aS(9, 5) - E) for (let i = 0; i < 6; i++) { const u = ease(t, r3aS(9, 5) + .1 + i * .03, r3aS(9, 5) + .4 + i * .03); if (u > 0) r3aCoin(p, lerp(1045, 900 + i * 50 + (i > 2 ? 230 : 0), u), GY - 8 - Math.sin(u * Math.PI) * 60, 18, 7560 + i); }
    const c0 = r3aS(10, 2), c1 = r3aS(10, 5) - .12, nC = 16, stepC = (c1 - c0) / nC;
    let top = GY;
    for (let i = 0; i < nC; i++) {
      const ts = c0 - E + i * stepC; if (t < ts) break;
      const drop = ease(t, ts, ts + .1), y = GY - 10 - i * 15;
      r3aCoin(p, 1450 + (rnd(i, 3) - .5) * 6, lerp(-40, y, drop), 50, 7580 + i); top = y;
    }
    if (t >= r3aS(10, 5) - E) r3aKing(p, 1450, top - 4, 125, pr(t, r3aS(10, 5) - E, .3), 7620, { armL: 2.2, armR: 2.2 });
  }
};

// stanza 2: the military rulers march in, the elite; the hungry countries; the scramble for invitations
// to the ball; the auction in the hall
R3A_PICS.ball = (p, t, pi) => {
  const E = R3A_EARLY;
  if (pi === 0) {
    r3aGround(p, 1, 7701);
    const bunt = quad([60, 18], [900, 80], [1740, 18], 30); pen(p, bunt, pr(t, r3aL(11) - E, .3), 4, 7702);
    for (let k = 1; k < 15; k++) { const a = bunt[k * 2], u = pr(t, r3aL(11) + k * .02, .06); if (u > 0) pen(p, poly([[a[0] - 18, a[1]], [a[0], a[1] + 36], [a[0] + 18, a[1]]], true), u, 4, 7703 + k); if (u >= 1 && k % 2) { p.fillStyle = '#000'; fillPoly(p, [[a[0] - 18, a[1]], [a[0], a[1] + 36], [a[0] + 18, a[1]]]); } }
    const steps = r3aWordsFrom(11, 3).concat(r3aWordsFrom(12)), n = r3aCount(steps, t + E), last = n ? steps[n - 1] : 0;
    const swing = n ? (n % 2 ? 1 : -1) * Math.PI / 2 * (1 - pr(t, last - E, .3)) : 0;
    [180, 400, 620, 840].forEach((x0, k) => {
      const o = { x: x0 + n * 22, y: GY, h: 280, mouth: 'line', look: 1, facing: 1, stride: swing, armL: [.1 + .25 * swing / 1.57, .1], armR: [.1 - .25 * swing / 1.57, .1] };
      const u = pr(t, r3aS(11, 3) - E + k * .06, .4); r3aPerson(p, o, u, 7720 + k * 13); r3aDress(p, o, 'military', u, 7730 + k * 13);
    });
    if (t >= r3aS(12, 2) - E) { const o = { x: 1360, y: GY, h: 270, woman: true, mouth: 'smile', look: -.6, armR: [.6, 1.4] }; const u = pr(t, r3aS(12, 2) - E, .45); r3aPerson(p, o, u, 7780); r3aDress(p, o, 'tiara', u, 7781); }
    if (t >= r3aS(12, 3) - E) { const o = { x: 1600, y: GY, h: 285, tophat: true, mouth: 'line', look: -.8 }; const u = pr(t, r3aS(12, 3) - E, .45); r3aPerson(p, o, u, 7790); r3aDress(p, o, 'monocle', u, 7791); }
  } else if (pi === 1) { // three hills with three different blank flags; a family at a table with empty bowls
    r3aGround(p, 1, 7801);
    const fl = [r3aS(13, 2), r3aS(13, 3), r3aS(13, 4)];
    [[170, 0], [450, 1], [730, 2]].forEach(([x, k]) => {
      const u = pr(t, fl[k] - E, .3); if (u <= 0) return;
      pen(p, quad([x - 150, GY], [x, GY - 150], [x + 150, GY], 16), u, 5, 7810 + k);
      pen(p, seg(x, GY - 76, x, GY - 300, 6), u, 5, 7815 + k);
      const wv = Math.sin(t * 6 + k) * 8, fpts = [[x, GY - 300], [x + 70, GY - 300 + wv], [x + 140, GY - 300], [x + 140, GY - 220], [x + 70, GY - 220 + wv], [x, GY - 220]];
      pen(p, poly(fpts, true), u, 4.5, 7820 + k);
      if (u >= 1) { if (k === 1) hatch(p, [[x, GY - 273], [x + 140, GY - 273], [x + 140, GY - 247], [x, GY - 247]], 0, 7, 1, 2.5, 7825); if (k === 2) pen(p, ell(x + 70, GY - 260 + wv * .5, 22, 22), 1, 4, 7826); if (k === 0) pen(p, seg(x, GY - 300, x + 140, GY - 220, 6), 1, 4, 7827); }
    });
    if (t >= r3aL(14) - E) {
      const u = pr(t, r3aL(14) - E, .35);
      [[1180, 230, 1], [1370, 190, 0], [1560, 240, 0]].forEach(([x, h, wmn], k) => r3aPerson(p, { x, y: GY - 20, h, woman: !!wmn, mouth: 'line', look: 0 }, pr(t, r3aL(14) - E + k * .08, .35), 7840 + k * 11));
      if (u >= 1) { p.fillStyle = '#fff'; p.fillRect(1030, 262, 680, GY - 262); }
      pen(p, seg(1020, 262, 1720, 262, 20), u, 6, 7850); pen(p, seg(1060, 262, 1060, GY, 4), u, 5, 7851); pen(p, seg(1680, 262, 1680, GY, 4), u, 5, 7852);
      [1180, 1370, 1560].forEach((x, k) => { const ub = pr(t, r3aS(14, 3) - E + k * .06, .2); pen(p, ell(x, 252, 56, 13), ub, 4.5, 7860 + k); pen(p, ell(x, 252, 56, 30, 0, Math.PI), ub, 4.5, 7863 + k); if (t >= r3aS(14, 4) - E) pen(p, seg(x + 70, 196, x + 40, 250, 3), pr(t, r3aS(14, 4) - E + k * .05, .15), 4, 7866 + k); });
    }
  } else if (pi === 2) { // arms reach up and grab for one fluttering ticket; the ball: a chandelier
    const grabs = r3aWordsFrom(15, 2, 5), n = r3aCount(grabs, t + E);
    const tk = t >= r3aS(15, 4) - E, tx = 560 + Math.sin(t * 3.1) * 60, ty = 90 + Math.sin(t * 4.3) * 18, rot = Math.sin(t * 2.7) * .4;
    for (let i = 0; i < 7; i++) { // sleeves up from the bottom edge, mittens snatching
      const bx = 180 + i * 120, reach = n ? .5 + .5 * Math.sin(clamp((t - grabs[n - 1] + E) / .25) * Math.PI) * ((i + n) % 2 ? 1 : .55) : .3;
      const hx = lerp(bx, tx + (i - 3) * 26, .55), hy = lerp(PBH + 20, ty + 40, reach * .85), a = Math.atan2(hy - (PBH + 20), hx - bx), items = [];
      items.push({ p: seg(bx - 22, PBH + 30, hx - 18 * Math.sin(a), hy + 10, 5), w: 5 }, { p: seg(bx + 22, PBH + 30, hx + 18 * Math.sin(a), hy + 10, 5), w: 5 });
      mitten(items, hx, hy, a, 300, 4.5, false, i % 2 ? 1 : -1);
      drawSet(p, items, pr(t, r3aS(15, 2) - E + i * .04, .3), 7900 + i * 9);
    }
    if (tk) { // the ticket: notched corners, a crown, a perforated stub
      p.save(); p.translate(tx, ty); p.rotate(rot);
      const tp = [[-110, -48], [110, -48], [110, -26], [96, -14], [110, 0], [110, 48], [-110, 48], [-110, 26], [-96, 14], [-110, 0]];
      p.fillStyle = '#fff'; fillPoly(p, tp); pen(p, poly(tp, true), pr(t, r3aS(15, 4) - E, .2), 5, 7950);
      pen(p, poly(crownPts(-10, 20, 80, 34), true), pr(t, r3aS(15, 4) - E + .1, .15), 4.5, 7951);
      for (let k = 0; k < 6; k++) pen(p, seg(56, -40 + k * 16, 56, -32 + k * 16, 1), 1, 3.5, null);
      p.restore();
    }
    if (t >= r3aS(15, 7) - E) { // the ballroom: a chandelier on its chain, candles lit on "ball"
      const cx = 1380, u = pr(t, r3aS(15, 7) - E, .4), lit = t >= r3aS(15, 8) - E;
      pen(p, seg(cx, 0, cx, 80, 4), u, 4.5, 7960); pen(p, ell(cx, 96, 22, 18), u, 4.5, 7961);
      for (let k = -2; k <= 2; k++) {
        const ax = cx + k * 90; pen(p, quad([cx, 100], [cx + k * 60, 190], [ax, 140], 10), u, 4.5, 7962 + k);
        pen(p, r3aBox(ax - 9, 104, 18, 36), u, 3.5, 7970 + k);
        if (lit) pen(p, quad([ax - 8, 100], [ax, 70 + Math.sin(t * 13 + k) * 4], [ax + 8, 100], 8), pr(t, r3aS(15, 8) - E + (k + 2) * .03, .08), 4, 7975 + k);
      }
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; if (lit) pen(p, seg(cx + Math.cos(a) * 290, 120 + Math.sin(a) * 90, cx + Math.cos(a) * 330, 120 + Math.sin(a) * 104, 1), pr(t, r3aS(15, 8) - E + k * .02, .06), 4, 7980 + k); }
    }
  } else { // the auction in the hall: the hall draws on behind; bidders' paddles go up; the gavel comes down
    r3aGround(p, 1, 8001);
    r3aHall(p, 800, GY, 250, pr(t, r3aS(16, 7) - E, .9), 8002);
    const bang = [r3aS(16, 5), r3aS(16, 8)], nb = r3aCount(bang, t + E), hit = nb ? pr(t, bang[nb - 1] - E, .1) : 0;
    const ga = nb && hit < 1 ? -1.1 + 1.1 * hit : (nb ? 0 : -1.1);
    r3aPerson(p, { x: 360, y: GY, h: 290, tophat: true, mouth: t >= r3aS(16, 2) - E ? 'o' : 'line', look: 1, armR: [1.4, .3] }, pr(t, r3aL(16) - E, .35), 8010);
    pen(p, poly([[200, GY], [230, 220], [480, 220], [510, GY]], true), pr(t, r3aL(16) - E, .3), 5, 8011); // podium
    p.fillStyle = '#fff'; if (t >= r3aL(16) + .3) fillPoly(p, [[204, GY - 2], [233, 224], [477, 224], [506, GY - 2]]);
    pen(p, poly([[200, GY], [230, 220], [480, 220], [510, GY]], true), t >= r3aL(16) + .3 ? 1 : 0, 5, 8011);
    p.save(); p.translate(470, 200); p.rotate(ga); pen(p, seg(0, 0, 90, 0, 4), 1, 6, 8012); pen(p, r3aBox(80, -22, 34, 44), 1, 5, 8013); p.restore();
    if (nb && hit < 1) for (let k = 0; k < 3; k++) pen(p, seg(560 + k * 4, 210 - k * 24, 600 + k * 12, 196 - k * 34, 2), 1, 4, 8015 + k);
    const paddles = [r3aS(16, 3), r3aS(16, 4), r3aS(16, 5), r3aS(16, 6)];
    [1310, 1480, 1650, 1140].forEach((x, k) => {
      const up = ease(t, paddles[k] - E, paddles[k] + .15), o = { x, y: GY, h: 250, mouth: 'line', look: -1, facing: -1, armL: [lerp(.15, 2.7, up), lerp(.1, -.2, up)] };
      r3aPerson(p, o, pr(t, r3aL(16) - E + k * .06, .35), 8020 + k * 11);
      if (k < 2) r3aDress(p, o, 'military', pr(t, r3aL(16) - E + k * .06, .35), 8025 + k * 11);
      if (up > 0) { const { hx, sy, sw } = r3aBody(o), px = hx - sw * .95 - 20, py = lerp(sy + 90, sy - 120, up); pen(p, seg(px, py + 40, px, py, 2), 1, 5, 8060 + k); p.fillStyle = '#fff'; p.beginPath(); p.arc(px, py - 26, 28, 0, TAU); p.fill(); pen(p, ell(px, py - 26, 28, 28), 1, 5, 8065 + k); }
    });
  }
};

// stanza 3: the plan and the fist sent down the line; the fist bids on the land; ancestral land, tied up as a parcel
R3A_PICS.land = (p, t, pi) => {
  const E = R3A_EARLY;
  if (pi === 0) {
    r3aGround(p, 1, 8101);
    const s1 = r3aS(17, 3), s2 = r3aS(18, 3);
    r3aKing(p, 200, GY, 290, pr(t, r3aL(17) - E, .4), 8110, { armR: t >= s1 - E ? 1.4 : .5 });
    const f1 = ease(t, s1 - E, r3aS(17, 5) + .05), f2 = ease(t, s2 - E, r3aS(18, 5) + .05);
    if (t >= s1 - E) { // the plan flies to its place (a dashed flight path behind it)
      const path = quad([330, 170], [560, -40], [820, 190], 24); r3aDashes(p, path, f1, 8120);
      const q = path[Math.round(f1 * 24)]; r3aPlan(p, q[0], q[1], 170 * (.5 + .5 * f1), 190 * (.5 + .5 * f1), 1, 8130);
    }
    if (t >= s2 - E) {
      const path = quad([930, 170], [1160, -40], [1420, 210], 24); r3aDashes(p, path, f2, 8140);
      const q = path[Math.round(f2 * 24)]; r3aFist(p, q[0], q[1] + 150 * (.5 + .5 * f2), 290 * (.5 + .5 * f2), 1, 8150);
    }
  } else if (pi === 1) { // the fist bids; the land beyond, cut into plots; the list
    r3aGround(p, 1, 8201);
    const bid = ease(t, r3aS(19, 3) - E, r3aS(19, 3) + .15);
    const fT = GY - 10 - bid * 20 - 190;
    if (t >= r3aS(19, 3) - E) { pen(p, seg(200, fT + 40, 200, fT - 70, 2), pr(t, r3aS(19, 3) - E, .1), 7, 8211); p.fillStyle = '#fff'; p.beginPath(); p.arc(200, fT - 100, 32, 0, TAU); p.fill(); pen(p, ell(200, fT - 100, 32, 32), pr(t, r3aS(19, 3) - E, .1), 5, 8212); }
    r3aFist(p, 200, GY - 10 - bid * 20, 200, pr(t, r3aL(19) - E, .35), 8210);
    const hills = [[620, 1800, 120], [700, 1300, 70], [1200, 1800, 90]];
    hills.forEach(([a, b, hh], k) => pen(p, quad([a, GY], [(a + b) / 2, GY - hh * 2], [b, GY], 20), pr(t, r3aS(19, 6) - E + k * .1, .4), 5, 8220 + k));
    if (t >= r3aS(19, 7) - E) for (let k = 0; k < 7; k++) { const x = 700 + k * 155; r3aDashes(p, seg(x, GY, x + 60, GY - 190, 12), pr(t, r3aS(19, 7) - E + k * .04, .2), 8230 + k * 13, 3.5); }
    if (t >= r3aS(19, 9) - E) for (let k = 0; k < 2; k++) { const y = GY - 60 - k * 70; r3aDashes(p, seg(640, y, 1780, y - 30, 30), pr(t, r3aS(19, 9) - E + k * .1, .3), 8250 + k * 41, 3.5); }
    if (t >= r3aS(19, 9) - E) for (let k = 0; k < 5; k++) { const x = 780 + k * 220, y = GY - 30 - (k % 2) * 80, u = pr(t, r3aS(19, 9) + k * .05, .1); pen(p, seg(x, y, x, y - 54, 2), u, 4, 8300 + k); pen(p, poly([[x, y - 54], [x + 34, y - 44], [x, y - 34]], true), u, 4, 8305 + k); }
    { // the list on a clipboard, ticks going down on "list"
      const cx = 470, u = pr(t, r3aL(19) - E, .35);
      pen(p, r3aBox(cx - 85, 70, 170, 270), u, 5, 8320); pen(p, r3aBox(cx - 34, 58, 68, 26), u, 5, 8321);
      for (let k = 0; k < 7; k++) { pen(p, seg(cx - 20, 116 + k * 32, cx + 66, 116 + k * 32, 4), pr(t, r3aL(19) + k * .03, .1), 3.5, 8322 + k); if (t >= r3aS(19, 12) - E + k * .05) pen(p, poly([[cx - 66, 110 + k * 32], [cx - 54, 122 + k * 32], [cx - 34, 98 + k * 32]]), pr(t, r3aS(19, 12) - E + k * .05, .06), 4.5, 8330 + k); }
    }
  } else { // the old tree with deep roots, houses, the people; tied up in string as one parcel; the government's hall
    r3aGround(p, 1, 8401);
    const anc = r3aS(20, 0), u = pr(t, anc - E, .5);
    r3aTree(p, 300, GY, 240, u, 8410, true);
    [[650, 120], [820, 140], [990, 110]].forEach(([x, s], k) => r3aHouse(p, x, GY, s, pr(t, r3aS(20, 4) - E + k * .07, .3), 8420 + k * 5));
    [[1140, 250, 0], [1290, 235, 1], [1430, 175, 0]].forEach(([x, h, wmn], k) => r3aPerson(p, { x, y: GY, h, woman: !!wmn, mouth: 'line', look: -.4 + k * .2 }, pr(t, r3aS(20, 5) - E + k * .08, .4), 8440 + k * 11));
    if (t >= r3aS(21, 1) - E) { // the package: a dashed boundary, then string across both ways and a bow with a crown tag
      r3aDashes(p, r3aBox(110, 18, 1440, 352), pr(t, r3aS(21, 1) - E, .5), 8460, 4.5);
      const ps = pr(t, r3aS(21, 4) - E, .35);
      pen(p, seg(110, 160, 1550, 150, 30), ps, 6, 8470); pen(p, seg(830, 18, 820, 370, 16), ps, 6, 8471);
      if (ps >= 1) { pen(p, quad([826, 156], [760, 90], [740, 150], 10).concat(quad([740, 150], [770, 190], [826, 156], 8)), 1, 5, 8472); pen(p, quad([826, 156], [900, 92], [920, 150], 10).concat(quad([920, 150], [886, 190], [826, 156], 8)), 1, 5, 8473);
        pen(p, seg(826, 156, 880, 230, 6), 1, 4, 8474); p.fillStyle = '#fff'; p.save(); p.translate(900, 262); p.rotate(-.2); p.fillRect(-46, -34, 92, 68); pen(p, poly([[-46, -34], [46, -34], [46, 34], [-46, 34]], true), 1, 4.5, 8475); pen(p, poly(crownPts(0, 18, 54, 26), true), 1, 4, 8476); p.restore(); }
    }
    if (t >= r3aS(22, 2) - E) r3aHall(p, 1690, GY, 130, pr(t, r3aS(22, 2) - E, .4), 8480);
  }
};

// stanza 4: the king breathes easy in his armchair, his family; the curtains close on what his money did far away;
// the scales (his court against all this land); the law book and the loophole; nobody squeaks
R3A_PICS.easy = (p, t, pi) => {
  const E = R3A_EARLY;
  if (pi === 0) {
    r3aGround(p, 1, 8501);
    const cu = pr(t, r3aL(23) - E, .35);
    pen(p, poly([[200, GY], [200, 120], [240, 80], [440, 80], [480, 120], [480, GY]]), cu, 6, 8502);
    r3aKing(p, 340, GY - 10, 270, pr(t, r3aL(23) - E, .45), 8510, { armL: .9, armR: .9 });
    pen(p, poly([[170, GY], [170, 236], [230, 236], [230, GY]], true), cu, 5, 8503); pen(p, poly([[450, GY], [450, 236], [510, 236], [510, GY]], true), cu, 5, 8504);
    [r3aS(23, 3), r3aS(23, 4)].forEach((bt, k) => { // two big sighs drift up from his mouth
      if (t < bt - E) return; const d = t - bt, x = 420 + d * 120 + k * 30, y = 150 - d * 40 - k * 20, s = 28 + d * 30, al = clamp(1.6 - d * .55);
      if (al <= 0) return; const c = []; for (let i = 0; i <= 18; i++) { const a = i / 18 * TAU; c.push([x + Math.cos(a) * s * (1 + .18 * Math.sin(a * 5)), y + Math.sin(a) * s * .6 * (1 + .18 * Math.sin(a * 5))]); }
      p.save(); p.globalAlpha = al; pen(p, c, pr(t, bt - E, .2), 4.5, 8520 + k); p.restore();
    });
    { // the palace window behind, curtains
      const u = pr(t, r3aL(23) + .1, .4); pen(p, r3aBox(1450, 30, 280, 300), u, 5, 8530); pen(p, quad([1450, 30], [1520, 180], [1470, 330], 12), u, 4, 8531); pen(p, quad([1730, 30], [1660, 180], [1710, 330], 12), u, 4, 8532);
    }
    if (t >= r3aS(24, 2) - E) { const o = { x: 760, y: GY, h: 280, woman: true, mouth: 'smile', look: -.5 }; const u = pr(t, r3aS(24, 2) - E, .4); r3aPerson(p, o, u, 8540); r3aDress(p, o, 'tiara', u, 8541); }
    if (t >= r3aS(24, 5) - E) [[1010, 165], [1180, 150]].forEach(([x, h], k) => { const o = { x, y: GY, h, mouth: 'smile', look: -.5, woman: k === 1 }; const u = pr(t, r3aS(24, 5) - E + k * .08, .35); r3aPerson(p, o, u, 8550 + k * 7); r3aDress(p, o, 'crown', u, 8553 + k * 7); });
  } else if (pi === 1) { // the family at the palace window; far off along a dashed road, what the money did; curtains close
    r3aGround(p, 1, 8601);
    pen(p, r3aBox(80, 40, 520, 322), 1, 6, 8602);
    [[230, 270, 1], [400, 160, 0], [520, 150, 1]].forEach(([x, h, wmn], k) => { const o = { x, y: GY, h, woman: !!wmn, mouth: 'line', look: 1 }; r3aPerson(p, o, 1, 8610 + k * 7); r3aDress(p, o, k ? 'crown' : 'tiara', 1, 8613 + k * 7); });
    const shut = ease(t, r3aS(25, 1) - E, r3aS(25, 4) + .1); // "never" to "close": the curtains draw shut across the window
    for (const sd of [-1, 1]) {
      const edge = sd < 0 ? lerp(110, 340, shut) : lerp(570, 340, shut), x0 = sd < 0 ? 84 : 596, c = [[x0, 44], [edge, 44], [edge + sd * 18, 200], [edge, 358], [x0, 358]];
      p.fillStyle = '#fff'; fillPoly(p, c); pen(p, c, 1, 5, 8620 + sd);
      for (let k = 1; k < 4; k++) { const fx = lerp(x0, edge, k / 4); pen(p, quad([fx, 48], [fx + sd * 10, 200], [fx, 354], 10), 1, 3, 8625 + k + sd * 5); }
    }
    r3aDashes(p, quad([610, 300], [1100, 380], [1500, 250], 40), pr(t, r3aS(25, 2) - E, .5), 8640, 4);
    if (t >= r3aS(26, 3) - E) for (let i = 0; i < 4; i++) { const u = ease(t, r3aS(26, 3) - E + i * .08, r3aS(26, 3) + .5 + i * .08); if (u > 0 && u < 1) r3aCoin(p, lerp(600, 1520, u), lerp(220, 200, u) - Math.sin(u * Math.PI) * 120, 16, 8650 + i); }
    if (t >= r3aS(26, 5) - E) { // far away, small: stumps, a bulldozer, smoke
      const u = pr(t, r3aS(26, 5) - E, .35);
      for (let k = 0; k < 6; k++) { const x = 1530 + k * 42; pen(p, poly([[x - 9, GY], [x - 8, GY - 22], [x + 8, GY - 22], [x + 9, GY]]), u, 3.5, 8660 + k); pen(p, ell(x, GY - 22, 8, 3), u, 2.5, 8666 + k); }
      pen(p, r3aBox(1640, GY - 58, 60, 30), u, 4, 8672); pen(p, r3aBox(1656, GY - 84, 26, 26), u, 3.5, 8673); pen(p, ell(1670, GY - 14, 40, 13), u, 4, 8674); pen(p, seg(1712, GY - 64, 1722, GY - 4, 2), u, 5, 8675);
      const s = []; for (let i = 0; i <= 12; i++) s.push([1600 + i * 14, GY - 100 - i * 8 + Math.sin(i * .9 + t * 4) * 5]); pen(p, s, pr(t, r3aS(26, 5) + .1, .3), 4, null);
    }
  } else if (pi === 2) { // the scales: his court (a palace) outweighs all this land
    r3aGround(p, 1, 8701);
    const cx = 900, u0 = pr(t, r3aL(27) - E, .35), tip = .17 * ease(t, r3aS(27, 3) - E, r3aS(27, 3) + .3), PV = 100;
    pen(p, seg(cx, GY, cx, PV, 6), u0, 6, 8702); pen(p, poly([[cx - 110, GY], [cx, GY - 40], [cx + 110, GY]], true), u0, 5, 8703);
    const L = 480, ax = cx - Math.cos(tip) * L, ay = PV + Math.sin(tip) * L, bx = cx + Math.cos(tip) * L, by = PV - Math.sin(tip) * L;
    pen(p, seg(ax, ay, bx, by, 20), u0, 6, 8704); p.fillStyle = '#000'; if (u0 >= 1) { p.beginPath(); p.arc(cx, PV, 12, 0, TAU); p.fill(); }
    for (const [sx, sy, k] of [[ax, ay, 0], [bx, by, 1]]) { // pans on three strings
      const py = sy + 150; pen(p, seg(sx, sy, sx - 120, py, 4), u0, 3.5, 8710 + k); pen(p, seg(sx, sy, sx + 120, py, 4), u0, 3.5, 8712 + k);
      pen(p, quad([sx - 150, py], [sx, py + 70], [sx + 150, py], 14), u0, 5, 8714 + k); pen(p, seg(sx - 150, py, sx + 150, py, 10), u0, 4, 8716 + k);
    }
    if (t >= r3aS(27, 3) - E) { // the court: a palace with towers and a crown
      const x = ax, y = ay + 150, u = pr(t, r3aS(27, 3) - E, .3);
      pen(p, poly([[x - 110, y], [x - 110, y - 90], [x - 70, y - 90], [x - 70, y - 120], [x - 40, y - 120], [x - 40, y - 90], [x + 40, y - 90], [x + 40, y - 120], [x + 70, y - 120], [x + 70, y - 90], [x + 110, y - 90], [x + 110, y]]), u, 5, 8720);
      pen(p, poly(crownPts(x, y - 130, 70, 32), true), u, 4.5, 8721); pen(p, quad([x - 24, y], [x, y - 70], [x + 24, y], 8), u, 4, 8722);
    }
    if (t >= r3aS(28, 2) - E) { // all this land: little hills with trees, light as a feather
      const x = bx, y = by + 150, u = pr(t, r3aS(28, 2) - E, .3);
      pen(p, quad([x - 140, y], [x - 60, y - 80], [x + 20, y], 10), u, 4.5, 8730); pen(p, quad([x - 20, y], [x + 60, y - 60], [x + 140, y], 10), u, 4.5, 8731);
      r3aTree(p, x - 60, y - 60, 70, u, 8732); r3aTree(p, x + 70, y - 40, 60, u, 8733);
    }
    if (t >= r3aS(28, 4) - E) { // cheap: a price tag on a string with one small coin drawn on it
      const u = pr(t, r3aS(28, 4) - E, .2), x = bx + 160, y = by + 40;
      pen(p, seg(bx + 100, by + 110, x, y, 4), u, 3.5, 8740);
      p.save(); p.translate(x, y); p.rotate(.4); p.fillStyle = '#fff'; fillPoly(p, [[0, 0], [30, -26], [110, -26], [110, 26], [30, 26]]); pen(p, poly([[0, 0], [30, -26], [110, -26], [110, 26], [30, 26]], true), u, 4, 8741); pen(p, ell(26, 0, 6, 6), u, 3, 8742); pen(p, ell(70, 0, 16, 16), u, 4, 8743); p.restore();
    }
  } else { // the law book; the fist punches a hole through it; nobody (mouths gone), a mouse whose squeak is crossed out
    r3aGround(p, 1, 8801);
    const bu = pr(t, r3aS(29, 2) - E, .35), bx = 380, bw = 320, bh = 300, by = GY - bh;
    pen(p, poly([[bx - bw / 2, GY], [bx - bw / 2, by], [bx + bw / 2, by], [bx + bw / 2, GY]], true), bu, 6, 8802);
    pen(p, poly([[bx + bw / 2, by], [bx + bw / 2 + 50, by - 30], [bx + bw / 2 + 50, GY - 30], [bx + bw / 2, GY]]), bu, 5, 8803);
    for (let k = 1; k < 6; k++) pen(p, seg(bx + bw / 2 + 8 * k, by - 5 * k, bx + bw / 2 + 8 * k, GY - 5 * k, 6), bu, 2.5, 8804 + k);
    pen(p, poly(crownPts(bx, by + 110, 120, 54), true), bu, 5, 8811); pen(p, seg(bx - 100, by + 160, bx + 100, by + 160, 6), bu, 4, 8812); pen(p, seg(bx - 100, by + 176, bx + 100, by + 176, 6), bu, 3, 8813);
    const ex = r3aS(29, 5);
    if (t >= ex - E) { // the loophole: a ragged hole torn in the cover, the fist through it
      const u = ease(t, ex - E, ex + .15), R = 70 * u, c = []; for (let i = 0; i <= 16; i++) { const a = i / 16 * TAU, rr = R * (.8 + .3 * rnd(i, 81)); c.push([bx + Math.cos(a) * rr, by + 230 + Math.sin(a) * rr * .8]); }
      p.fillStyle = '#000'; if (R > 4) fillPoly(p, c);
      r3aFist(p, bx + 10, by + 330 - u * 70, 170 * u + 1, u > .4 ? 1 : 0, 8820);
      if (u > .5) for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + .3; pen(p, seg(bx + Math.cos(a) * 80, by + 230 + Math.sin(a) * 66, bx + Math.cos(a) * 110, by + 230 + Math.sin(a) * 90, 2), 1, 4, 8830 + k); }
    }
    if (t >= r3aL(30) - E) [1000, 1180, 1360, 1540].forEach((x, k) => r3aPerson(p, { x, y: GY, h: 250 + (k % 2) * 15, woman: k % 2 === 1, mouth: 'none', look: -.3 }, pr(t, r3aS(30, 1) - E + k * .06, .35), 8840 + k * 11));
    if (t >= r3aS(30, 4) - E) { // the mouse and its squeak, crossed out
      const u = pr(t, r3aS(30, 4) - E, .15), mx = 1700, my = GY - 18;
      pen(p, ell(mx, my, 34, 18), u, 4.5, 8890); pen(p, ell(mx - 28, my - 18, 12, 12), u, 4, 8891); pen(p, quad([mx + 34, my + 4], [mx + 80, my - 10], [mx + 70, my + 14], 8), u, 3.5, 8892); p.fillStyle = '#000'; if (u >= 1) { p.beginPath(); p.arc(mx - 44, my - 4, 3.5, 0, TAU); p.fill(); }
      pen(p, ell(1660, 270, 70, 40).concat(poly([[1680, 308], [1690, 338], [1702, 306]])), pr(t, r3aS(30, 4) - E + .05, .15), 4.5, 8893);
      marker(p, seg(1590, 236, 1730, 302, 8), pr(t, r3aS(30, 4) + .2, .12), 10, 8894); marker(p, seg(1730, 236, 1590, 302, 8), pr(t, r3aS(30, 4) + .3, .12), 10, 8895);
    }
  }
};

// stanza 5: farmers on their own plots; evicted, walking off with their bundles (the headline is struck through);
// the ranchers and their herd; a plane sprays the poison; the forest pushed flat; the shareholders' chart
R3A_PICS.farm = (p, t, pi) => {
  const E = R3A_EARLY;
  if (pi === 0) { // fields in rows, sprouts coming up, a farmhouse; the farmers with hoes
    r3aGround(p, 1, 8901);
    const gu = pr(t, r3aL(31) - E, .5);
    for (let k = 0; k < 7; k++) pen(p, seg(40 + k * 30, GY - 20 - k * 30, 900 - k * 40, GY - 20 - k * 30, 20), gu, 3.5, 8902 + k);
    const food = r3aS(31, 2);
    for (let k = 0; k < 7; k++) for (let j = 0; j < 9; j++) { // sprouts, then on "food" they leaf out
      const x = 80 + k * 30 + j * (90 - k * 6), y = GY - 20 - k * 30, s = 1 - k * .07, u = pr(t, r3aL(31) + (k * 9 + j) * .012, .1); if (u <= 0) continue;
      pen(p, quad([x, y], [x - 4, y - 16 * s], [x - 14 * s, y - 22 * s], 5), u, 3, 8920 + k * 9 + j); pen(p, quad([x, y], [x + 4, y - 16 * s], [x + 14 * s, y - 22 * s], 5), u, 3, 8990 + k * 9 + j);
      if (t >= food - E + j * .02) pen(p, ell(x, y - 26 * s, 9 * s, 7 * s), 1, 3, 9060 + k * 9 + j);
    }
    r3aHouse(p, 1580, GY, 220, pr(t, r3aL(31) + .2, .4), 9130);
    pen(p, seg(1640, GY - 220, 1640, GY - 270, 2), pr(t, r3aL(31) + .5, .1), 5, 9131); pen(p, seg(1680, GY - 230, 1680, GY - 270, 2), pr(t, r3aL(31) + .5, .1), 5, 9132);
    if (t >= r3aS(32, 2) - E) [[1060, 280, 0], [1260, 265, 1]].forEach(([x, h, wmn], k) => {
      const dig = Math.sin((t - r3aS(32, 2)) * 5 + k) * .5 + .5, o = { x, y: GY, h, woman: !!wmn, mouth: 'smile', look: -.5, armL: [.9 + .3 * dig, .5], armR: [.4, .6] }, u = pr(t, r3aS(32, 2) - E + k * .08, .4);
      r3aPerson(p, o, u, 9140 + k * 9); r3aDress(p, o, 'brim', u, 9145 + k * 9);
      if (u >= 1) { const hx = x - 150, hy = GY - 30 + dig * 10; pen(p, seg(x - 50, GY - h * .55, hx, hy, 4), 1, 5, 9150 + k); pen(p, seg(hx - 4, hy, hx + 26, hy + 18, 2), 1, 7, 9152 + k); }
    });
    if (t >= r3aS(32, 5) - E) pen(p, quad([0, 110], [450, 40], [930, 90], 20), pr(t, r3aS(32, 5) - E, .35), 4, 9160);
  } else if (pi === 1) { // evicted: they walk off left, bundles on sticks, a step on each sung word; the notice; the king far off
    r3aGround(p, 1, 9201);
    pen(p, quad([0, 160], [700, 120], [1800, 170], 20), 1, 3.5, 9202);
    const steps = r3aWordsFrom(33).concat(r3aWordsFrom(34)), n = r3aCount(steps, t + E), last = n ? steps[n - 1] : r3aL(33);
    const sw = n ? (n % 2 ? 1 : -1) * Math.PI / 2 * (1 - pr(t, last - E, .3)) : 0, walk = n * 46 + clamp((t - last) / .3) * 0;
    [[880, 270, 0], [1060, 255, 1]].forEach(([x0, h, wmn], k) => {
      const x = x0 - walk, o = { x, y: GY, h, woman: !!wmn, mouth: 'frown', look: -1, facing: -1, stride: sw * (k ? -1 : 1), armR: [2.4, 1.1], hunch: 1 };
      r3aPerson(p, o, 1, 9210 + k * 9); r3aDress(p, o, 'brim', 1, 9215 + k * 9);
      const { hx, sy, sw: sh } = r3aBody(o), s0 = [hx + sh * .9, sy + 20], s1 = [hx + sh + 110, sy - 105];
      pen(p, seg(s0[0], s0[1], s1[0], s1[1], 4), 1, 5, 9220 + k);
      p.fillStyle = '#fff'; p.beginPath(); p.arc(s1[0] - 4, s1[1] + 26, 34, 0, TAU); p.fill(); pen(p, ell(s1[0] - 4, s1[1] + 26, 34, 32), 1, 4.5, 9222 + k); pen(p, poly([[s1[0] - 16, s1[1] - 4], [s1[0], s1[1] + 4], [s1[0] + 12, s1[1] - 6]]), 1, 4, 9224 + k);
    });
    pen(p, r3aBox(70, 250, 120, 112), 1, 4.5, 9230); pen(p, poly([[60, 252], [130, 200], [200, 252]]), 1, 5, 9231); // their house, empty now
    hatch(p, [[100, 300], [160, 300], [160, 362], [100, 362]], .8, 10, 1, 3, 9232);
    if (t >= r3aS(34, 2) - E) r3aKing(p, 1640, 168, 74, pr(t, r3aS(34, 2) - E, .3), 9240, { armL: 1.5, armR: .4 }); // far off, on the horizon
    if (t >= r3aS(34, 5) - E) { // the notice nailed to a post: typed lines and the crown seal
      const u = pr(t, r3aS(34, 5) - E, .3);
      pen(p, seg(1300, GY, 1300, 140, 4), u, 6, 9250);
      p.fillStyle = '#fff'; if (u >= 1) p.fillRect(1220, 120, 160, 140); pen(p, r3aBox(1220, 120, 160, 140), u, 4.5, 9251);
      for (let k = 0; k < 4; k++) pen(p, seg(1240, 150 + k * 18, 1360 - (k === 3) * 50, 150 + k * 18, 4), u, 3, 9252 + k);
      pen(p, ell(1330, 232, 22, 22), u, 4, 9257); pen(p, poly(crownPts(1330, 240, 26, 12), true), u, 3, 9258);
    }
  } else if (pi === 2) { // ranchers arrive: cows, a rancher walks in; the herd grows to fill the land
    r3aGround(p, 1, 9301);
    const fence = pr(t, r3aL(35) - E, .4);
    for (let k = 0; k < 12; k++) pen(p, seg(30 + k * 150, GY, 30 + k * 150, GY - 70, 2), fence, 4.5, 9302 + k);
    pen(p, seg(30, GY - 55, 1680, GY - 55, 30), fence, 3.5, 9315); pen(p, seg(30, GY - 30, 1680, GY - 30, 30), fence, 3.5, 9316);
    const herd = [[260, 0], [520, 1], [780, 0], [1040, 1], [380, 0], [640, 1], [900, 0], [1160, 1], [130, 1], [1300, 0], [480, 1]];
    herd.map((h2, k) => [h2, k]).sort((a, b) => (b[1] >= 8) - (a[1] >= 8) || (b[1] >= 4) - (a[1] >= 4)).forEach(([[x, d], k]) => { const ts = k < 3 ? r3aS(35, 2) + k * .08 : r3aS(36, 4) + (k - 3) * .05, row = k < 4 ? 0 : 1, y = GY - 4 - row * 60;
      if (t >= ts - E) r3aCow(p, x, y - (k >= 8 ? 110 : 0), 220 - row * 30 - (k >= 8 ? 40 : 0), pr(t, ts - E, .25), 9320 + k * 13, d ? -1 : 1); });
    const came = ease(t, r3aS(35, 4) - .3, r3aS(35, 4) + .4), o = { x: lerp(1900, 1540, came), y: GY, h: 280, mouth: 'line', look: -1, facing: -1, stride: came > 0 && came < 1 ? t * 10 : 0, armL: [.6, .9] };
    if (t >= r3aS(35, 3) - E) { r3aPerson(p, o, 1, 9480); r3aDress(p, o, 'brim', 1, 9481); }
    if (t >= r3aS(36, 3) - E) { const o2 = { x: lerp(1900, 1690, ease(t, r3aS(36, 3) - .2, r3aS(36, 4) + .3)), y: GY, h: 265, mouth: 'line', look: -1, facing: -1 }; r3aPerson(p, o2, 1, 9490); r3aDress(p, o2, 'brim', 1, 9491); }
  } else if (pi === 3) { // the poison spraying: drums with crossed bones, a crop-dusting plane trailing spray over the herd
    r3aGround(p, 1, 9501);
    [[200, 0], [430, 1], [660, 0]].forEach(([x, d], k) => r3aCow(p, x, GY - 4, 190, 1, 9510 + k * 13, d ? -1 : 1));
    [[1230, 0], [1340, 1], [1450, 2]].forEach(([x, k]) => r3aBarrel(p, x, GY, 130, pr(t, r3aS(37, 8) - E + k * .07, .25), 9550 + k * 5));
    const fly = lin(t, r3aS(37, 9) - .2, r3aS(37, 10) + .55), px = lerp(1900, -150, fly), py = 90 + Math.sin(fly * 5) * 10;
    if (fly > 0) { // spray: dots falling from where the plane has been
      for (let i = 0; i < 70; i++) { const fx = lerp(1900, -150, rnd(i, 91) * fly), age = (fx - px) / 1900, dy = age * 900 * (.4 + rnd(i, 92) * .6); if (fx < px + 40) continue; const y = py + 30 + dy; if (y > GY - 4) continue; p.fillStyle = '#000'; p.beginPath(); p.arc(fx + (rnd(i, 93) - .5) * 40, y, 3 + rnd(i, 94) * 2.5, 0, TAU); p.fill(); }
      const items = [], P = (u, v) => [px + u, py + v];
      items.push({ p: poly([P(-110, -4), P(-60, -14), P(90, -8), P(120, -42), P(142, -42), P(136, 6), P(-60, 12), P(-110, 6)], true), w: 4.5, white: true }); // nose to the left: it flies left
      items.push({ p: seg(...P(-82, -40), ...P(40, -40), 4), w: 5 }, { p: seg(...P(-72, 14), ...P(30, 14), 4), w: 5 });
      items.push({ p: seg(...P(-50, -40), ...P(-50, 12), 2), w: 3.5 }, { p: seg(...P(18, -40), ...P(18, 12), 2), w: 3.5 });
      items.push({ p: ell(...P(-116, 0), 6, 34), w: 4 }, { p: seg(...P(-40, 12), ...P(-40, 26), 2), w: 4 }, { p: ell(...P(-40, 36), 11, 11), w: 4 });
      drawSet(p, items, 1, 9580);
    }
  } else if (pi === 4) { // time is money (a clock face that is a coin); the forest, pushed flat by a bulldozer
    r3aGround(p, 1, 9601);
    const cx = 280, cy = 200, R = 120, cu = pr(t, r3aS(38, 1) - E, .3);
    pen(p, ell(cx, cy, R, R), cu, 6, 9602);
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; pen(p, seg(cx + Math.cos(a) * (R - 10), cy + Math.sin(a) * (R - 10), cx + Math.cos(a) * (R - 26), cy + Math.sin(a) * (R - 26), 1), cu, 4, 9603 + k); }
    const spin = (t - r3aS(38, 1)) * 3; pen(p, seg(cx, cy, cx + Math.sin(spin) * R * .75, cy - Math.cos(spin) * R * .75, 2), cu, 5, 9616, .3); pen(p, seg(cx, cy, cx + Math.sin(spin / 6) * R * .45, cy - Math.cos(spin / 6) * R * .45, 2), cu, 7, 9617, .3);
    if (t >= r3aS(38, 3) - E) { // money: the clock gets a milled coin rim, and coins stack beside it
      const u = pr(t, r3aS(38, 3) - E, .25); pen(p, ell(cx, cy, R + 22, R + 22), u, 6, 9620);
      for (let k = 0; k < 40; k++) { const a = k / 40 * TAU; pen(p, seg(cx + Math.cos(a) * (R + 22), cy + Math.sin(a) * (R + 22), cx + Math.cos(a) * (R + 34), cy + Math.sin(a) * (R + 34), 1), pr(t, r3aS(38, 3) - E + k * .004, .05), 3, 9621 + k); }
      for (let i = 0; i < 5; i++) if (t >= r3aS(38, 3) + i * .06) r3aCoin(p, 500, GY - 10 - i * 15, 46, 9670 + i);
    }
    const flat = ease(t, r3aS(39, 3) - E, r3aS(39, 4) + .3), bx = lerp(1880, 1100, ease(t, r3aS(39, 2) - .3, r3aS(39, 4) + .3));
    for (let k = 0; k < 6; k++) { // trees fall flat in turn, the ones nearest the bulldozer first
      const x = 760 + k * 140, fall = clamp(flat * 1.6 - (5 - k) * .08) * (x > bx - 260 ? 1 : 0), u = pr(t, r3aS(39, 2) - E + k * .04, .3);
      p.save(); p.translate(x, GY); p.rotate(-fall * Math.PI / 2); r3aTree(p, 0, 0, 170, u, 9700 + k * 7); p.restore();
    }
    if (t >= r3aS(39, 2) - .3) { // the bulldozer, blade first, pushing in from the right
      const items = [], P = (u, v) => [bx + u, GY + v];
      items.push({ p: poly([P(40, -110), P(210, -110), P(210, -40), P(40, -40)], true), w: 5, white: true }, { p: poly([P(90, -190), P(180, -190), P(180, -110), P(90, -110)], true), w: 5, white: true });
      items.push({ p: poly([P(20, -60), P(230, -60), P(250, -30), P(230, 0), P(20, 0), P(0, -30)], true), w: 5, white: true });
      for (let k = 0; k < 4; k++) items.push({ p: ell(...P(45 + k * 55, -30), 18, 18), w: 4 });
      items.push({ p: seg(...P(40, -80), ...P(-20, -80), 3), w: 6 }, { p: quad(P(-30, -150), P(-60, -70), P(-30, 6), 10), w: 7 });
      items.push({ p: seg(...P(195, -110), ...P(195, -150), 2), w: 6 });
      drawSet(p, items, 1, 9780);
      const s = []; for (let i = 0; i <= 10; i++) s.push([bx + 195 + i * 12, GY - 160 - i * 9 + Math.sin(i + t * 6) * 5]); pen(p, s, 1, 4, null);
    }
  } else { // the shareholders' fourth quarter: three of them at a table, a bar chart; the fourth bar shoots up
    r3aGround(p, 1, 9801);
    const lick = t >= r3aS(40, 4) - E;
    [[200, 0], [380, 1], [560, 2]].forEach(([x, k]) => r3aHatHead(p, x, 210, 40, 0, lick, pr(t, r3aL(40) - E + k * .06, .3), 9810 + k * 7));
    p.fillStyle = '#fff'; if (t >= r3aL(40) + .2) p.fillRect(80, 262, 620, GY - 262);
    pen(p, seg(70, 262, 720, 262, 20), pr(t, r3aL(40) - E, .3), 6, 9830); pen(p, seg(110, 262, 110, GY, 4), 1, 5, 9831); pen(p, seg(680, 262, 680, GY, 4), 1, 5, 9832);
    const cu = pr(t, r3aS(40, 3) - E, .3), x0 = 900, x1 = 1700;
    pen(p, seg(x0, 30, x0, GY - 10, 12), cu, 6, 9840); pen(p, seg(x0, GY - 10, x1, GY - 10, 20), cu, 6, 9841);
    const hts = [90, 120, 105, 0], q4 = ease(t, r3aS(40, 5) - E, r3aS(40, 6) + .15);
    for (let k = 0; k < 4; k++) {
      const hgt = k < 3 ? hts[k] : lerp(20, 360, q4), bx = x0 + 60 + k * 190, u = pr(t, r3aS(40, 3) + k * .08, .15); if (u <= 0) continue;
      const by = GY - 10 - hgt;
      if (k === 3 && q4 > .02) { p.fillStyle = '#000'; p.fillRect(bx, Math.max(-20, by), 130, GY - 10 - Math.max(-20, by)); }
      else pen(p, poly([[bx, GY - 10], [bx, by], [bx + 130, by], [bx + 130, GY - 10]]), u, 5, 9850 + k);
      if (k < 3 && u >= 1) hatch(p, [[bx, by], [bx + 130, by], [bx + 130, GY - 10], [bx, GY - 10]], .9, 14, 1, 3, 9860 + k);
    }
    if (q4 > .3) r3aArrow(p, x0 + 60 + 3 * 190 + 200, GY - 40, x0 + 60 + 3 * 190 + 200, 40, pr(t, r3aS(40, 6), .2), 9870, 6);
  }
};

// The Oscar night, drawn in tone (grey albedo, then a light map multiplied over it) before it is screened.
// World units are 1920x1080 frame pixels at camera scale 1. Stand-ins only: a small woman with short dark hair
// and big round eyes; a big man in a dark suit, only ever from behind or in far-off silhouette.

const gr = (v, a = 1) => a >= 1 ? `rgb(${v | 0},${v | 0},${v | 0})` : `rgba(${v | 0},${v | 0},${v | 0},${a})`;
const SC = mkCanvas(), sg = SC.getContext('2d');
const LIT = mkCanvas(960, 540), lg = LIT.getContext('2d');

function camSet(g, cam, k = 1) { g.setTransform(cam.s * k, 0, 0, cam.s * k, (W / 2 - cam.x * cam.s) * k, (H / 2 - cam.y * cam.s) * k); }
function ell(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, TAU); }
function poly(g, pts) { g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); }
function lgrad(g, x0, y0, x1, y1, stops) { const q = g.createLinearGradient(x0, y0, x1, y1); for (const [o, v] of stops) q.addColorStop(o, gr(v)); return q; }
function rgrad(g, x, y, r0, r1, stops) { const q = g.createRadialGradient(x, y, r0, x, y, r1); for (const [o, v] of stops) q.addColorStop(o, gr(v)); return q; }

// ---------------------------------------------------------------- props
function drawOscar(g, x, baseY, h) {
  const bw = .17 * h, bh = .17 * h;
  // film-reel base: two stacked drums
  g.fillStyle = lgrad(g, x - bw, 0, x + bw, 0, [[0, 40], [.3, 120], [.45, 70], [1, 25]]);
  g.fillRect(x - bw, baseY - bh * .55, bw * 2, bh * .55);
  g.fillStyle = lgrad(g, x - bw * .8, 0, x + bw * .8, 0, [[0, 55], [.3, 150], [.5, 90], [1, 35]]);
  g.fillRect(x - bw * .8, baseY - bh, bw * 1.6, bh * .45);
  g.fillStyle = gr(170); g.fillRect(x - bw * .8, baseY - bh, bw * 1.6, h * .008);
  for (let k = 0; k < 5; k++) { g.fillStyle = gr(20); ell(g, x - bw * .55 + k * bw * .275, baseY - bh * .75, bw * .07, bh * .1); g.fill(); }
  // the figure: legs together, arms crossed over a sword
  const fy = (f) => baseY - bh - f * (h - bh);
  const HW = [[0, .06], [.06, .065], [.33, .055], [.5, .085], [.6, .078], [.72, .11], [.79, .125], [.83, .1], [.855, .04]];
  g.beginPath();
  HW.forEach(([f, w], i) => { const px = x - w * h, py = fy(f); i ? g.lineTo(px, py) : g.moveTo(px, py); });
  for (let i = HW.length - 1; i >= 0; i--) g.lineTo(x + HW[i][1] * h, fy(HW[i][0]));
  g.closePath();
  g.fillStyle = lgrad(g, x - .1 * h, 0, x + .1 * h, 0, [[0, 55], [.22, 150], [.36, 250], [.5, 185], [.75, 110], [1, 40]]); g.fill();
  ell(g, x, fy(.925), .066 * h, .075 * h); g.fill();
  // crossed arms and the sword
  g.strokeStyle = gr(70); g.lineWidth = h * .009;
  g.beginPath(); g.moveTo(x - .1 * h, fy(.72)); g.quadraticCurveTo(x, fy(.65), x + .095 * h, fy(.7)); g.stroke();
  g.beginPath(); g.moveTo(x + .1 * h, fy(.73)); g.quadraticCurveTo(x, fy(.66), x - .09 * h, fy(.69)); g.stroke();
  g.strokeStyle = gr(235); g.lineWidth = h * .01; g.beginPath(); g.moveTo(x + .004 * h, fy(.04)); g.lineTo(x + .004 * h, fy(.66)); g.stroke();
  g.fillStyle = gr(210); g.fillRect(x - .03 * h, fy(.665), .065 * h, h * .012);
  g.strokeStyle = gr(80); g.lineWidth = h * .004; g.beginPath(); g.moveTo(x - .045 * h, fy(.5)); g.lineTo(x + .045 * h, fy(.5)); g.stroke();
  g.beginPath(); g.moveTo(x, fy(.06)); g.lineTo(x, fy(.33)); g.stroke();
}

// A generic gilded award: a standing figure, arms down at its sides, on a stepped base. h = total height.
function drawAward(g, x, baseY, h) {
  const gold = (x0, x1) => lgrad(g, x0, 0, x1, 0, [[0, 60], [.25, 165], [.4, 252], [.55, 190], [.8, 105], [1, 50]]);
  const steps = [[.5, .09], [.38, .07], [.28, .06]]; let y = baseY;
  for (const [w, sh] of steps) { const ww = w * h; g.fillStyle = lgrad(g, x - ww / 2, 0, x + ww / 2, 0, [[0, 30], [.3, 110], [.45, 65], [1, 20]]); g.fillRect(x - ww / 2, y - sh * h, ww, sh * h); g.fillStyle = gr(215); g.fillRect(x - ww / 2, y - sh * h, ww, h * .015); y -= sh * h; }
  const top = y, fh = top - (baseY - h), P = (u) => top - u * fh, X = (k) => x + k * h;
  g.fillStyle = gold(X(-.17), X(.17));
  // a standing figure: feet apart, a robe to the knees, broad shoulders
  g.beginPath(); g.moveTo(X(-.1), P(0)); g.lineTo(X(-.09), P(.3)); g.lineTo(X(-.13), P(.36)); g.lineTo(X(-.12), P(.6)); g.lineTo(X(-.16), P(.76));
  g.quadraticCurveTo(X(-.14), P(.83), X(-.05), P(.84)); g.lineTo(X(.05), P(.84)); g.quadraticCurveTo(X(.14), P(.83), X(.16), P(.76));
  g.lineTo(X(.12), P(.6)); g.lineTo(X(.13), P(.36)); g.lineTo(X(.09), P(.3)); g.lineTo(X(.1), P(0)); g.lineTo(X(.02), P(0)); g.lineTo(X(.01), P(.3)); g.lineTo(X(-.01), P(.3)); g.lineTo(X(-.02), P(0)); g.closePath(); g.fill();
  // arms down at the sides, apart from the body
  for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(X(sd * .15), P(.8)); g.lineTo(X(sd * .2), P(.74)); g.lineTo(X(sd * .2), P(.42)); g.lineTo(X(sd * .16), P(.4)); g.lineTo(X(sd * .155), P(.66)); g.closePath(); g.fill(); ell(g, X(sd * .18), P(.39), .028 * h, .035 * h); g.fill(); }
  g.fillRect(X(-.035), P(.9), .07 * h, fh * .07); // neck
  ell(g, x, P(.95), .075 * h, .085 * h); g.fill(); // head
  g.strokeStyle = gr(90); g.lineWidth = h * .01; g.beginPath(); g.moveTo(X(-.11), P(.36)); g.lineTo(X(.11), P(.36)); g.moveTo(X(-.12), P(.6)); g.quadraticCurveTo(x, P(.56), X(.12), P(.6)); g.stroke(); // robe hem + belt
  g.fillStyle = gr(255); ell(g, X(-.04), P(.97), .016 * h, .03 * h); g.fill(); g.fillRect(X(-.08), P(.78), .02 * h, fh * .36); // gleam
}

// Speed-Graphic style press camera with a flash reflector. pop 0..1 is drawn in the emissive pass.
function drawPressCam(g, x, y, s, o = {}) {
  const dir = o.flip ? -1 : 1;
  // photographer: fedora + shoulders behind the camera
  g.fillStyle = gr(o.dark ?? 28);
  ell(g, x + .25 * s * dir, y + 1.1 * s, 1.1 * s, .7 * s); g.fill();
  ell(g, x + .3 * s * dir, y - .55 * s, .36 * s, .4 * s); g.fill();
  ell(g, x + .3 * s * dir, y - .82 * s, .6 * s, .12 * s); g.fill(); // hat brim
  g.fillRect(x + (.3 * dir - .3) * s, y - 1.12 * s, .6 * s, .32 * s); // crown
  g.fillStyle = gr(80); g.fillRect(x + (.3 * dir - .3) * s, y - .9 * s, .6 * s, .07 * s); // hat band
  // body
  g.fillStyle = lgrad(g, x - .5 * s, 0, x + .5 * s, 0, [[0, 30], [.4, 55], [1, 22]]);
  g.fillRect(x - .5 * s, y - .42 * s, s, .84 * s);
  g.fillStyle = gr(110); g.fillRect(x - .2 * s, y - .62 * s, .4 * s, .2 * s); // rangefinder
  g.fillStyle = gr(200); g.fillRect(x - .16 * s, y - .58 * s, .1 * s, .1 * s); g.fillRect(x + .06 * s, y - .58 * s, .1 * s, .1 * s);
  // lens
  for (const [r, v] of [[.32, 150], [.27, 60], [.22, 175], [.17, 30]]) { g.fillStyle = gr(v); ell(g, x, y, r * s, r * s); g.fill(); }
  g.fillStyle = gr(230); ell(g, x - .06 * s, y - .06 * s, .045 * s, .045 * s); g.fill();
  // hands (mittens) on the sides
  g.fillStyle = gr(150); ell(g, x - .56 * s, y + .1 * s, .15 * s, .26 * s); g.fill(); ell(g, x + .56 * s, y + .1 * s, .15 * s, .26 * s); g.fill();
  // flash reflector on an arm
  const fx = x - 1.0 * s * dir, fy = y - .55 * s;
  g.strokeStyle = gr(120); g.lineWidth = .06 * s; g.beginPath(); g.moveTo(x - .5 * s * dir, y); g.lineTo(fx, fy + .2 * s); g.stroke();
  g.fillStyle = rgrad(g, fx, fy, 0, .62 * s, [[0, 250], [.18, 200], [.3, 120], [.45, 215], [.62, 135], [.8, 225], [.95, 150], [1, 80]]);
  ell(g, fx, fy, .62 * s, .62 * s); g.fill();
  g.fillStyle = gr(235); ell(g, fx, fy, .13 * s, .15 * s); g.fill();
  return [fx, fy];
}
function emitPressCam(g, x, y, s, pop, o = {}) {
  if (pop <= .01) return;
  const dir = o.flip ? -1 : 1, fx = x - 1.0 * s * dir, fy = y - .55 * s;
  g.save(); g.globalAlpha = clamp(pop);
  g.fillStyle = rgrad(g, fx, fy, 0, s * 1.5, [[0, 255], [.4, 255], [1, 255]]);
  const q = g.createRadialGradient(fx, fy, 0, fx, fy, s * 1.6); q.addColorStop(0, 'rgba(255,255,255,1)'); q.addColorStop(.38, 'rgba(255,255,255,1)'); q.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = q; ell(g, fx, fy, s * 1.6, s * 1.6); g.fill(); g.restore();
}

// Spent flashbulb: milky blistered glass, crumpled foil inside, brass base. s = height.
function drawBulb(g, x, y, s, ang, seed) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.fillStyle = lgrad(g, -.12 * s, 0, .12 * s, 0, [[0, 70], [.35, 190], [.6, 120], [1, 50]]);
  g.fillRect(-.12 * s, .05 * s, .24 * s, .22 * s);
  g.fillStyle = gr(40); for (let k = 0; k < 3; k++) g.fillRect(-.12 * s, .09 * s + k * .06 * s, .24 * s, .015 * s);
  g.beginPath(); g.moveTo(-.11 * s, .06 * s); g.bezierCurveTo(-.13 * s, -.15 * s, -.36 * s, -.3 * s, -.36 * s, -.52 * s);
  g.arc(0, -.52 * s, .36 * s, Math.PI, 0); g.bezierCurveTo(.36 * s, -.3 * s, .13 * s, -.15 * s, .11 * s, .06 * s); g.closePath();
  g.fillStyle = rgrad(g, -.1 * s, -.62 * s, 0, .5 * s, [[0, 250], [.3, 215], [.8, 175], [1, 140]]); g.fill();
  g.strokeStyle = gr(95); g.lineWidth = .03 * s; g.stroke();
  // crumpled foil
  g.strokeStyle = gr(90); g.lineWidth = .025 * s; g.beginPath();
  for (let k = 0; k < 9; k++) { const a = rnd(seed, k) * TAU, r = .08 * s + rnd(seed, k, 2) * .14 * s; const px = Math.cos(a) * r, py = -.5 * s + Math.sin(a) * r * .8; k ? g.lineTo(px, py) : g.moveTo(px, py); }
  g.stroke();
  g.fillStyle = gr(255); ell(g, -.15 * s, -.68 * s, .06 * s, .1 * s, -.5); g.fill();
  g.restore();
}

// ---------------------------------------------------------------- people
// The woman (stand-in). (cx, cy) is the face centre, s the face height.
function drawWoman(g, cx, cy, s, o = {}) {
  const cry = o.cry || 0, tt = o.tt || 0, hands = o.hands || 'chest';
  // gown + shoulders (a small woman: shoulders about a face and a half wide)
  g.fillStyle = gr(38);
  poly(g, [cx - 1.25 * s, cy + 3.5 * s, cx - 1.1 * s, cy + 1.25 * s, cx - .5 * s, cy + 1.05 * s, cx, cy + 1.25 * s, cx + .5 * s, cy + 1.05 * s, cx + 1.1 * s, cy + 1.25 * s, cx + 1.25 * s, cy + 3.5 * s]); g.fill();
  g.fillStyle = rgrad(g, cx, cy + .85 * s, .1 * s, 1.2 * s, [[0, 222], [.6, 200], [1, 150]]);
  g.beginPath(); g.moveTo(cx - 1.12 * s, cy + 1.3 * s); g.quadraticCurveTo(cx - 1.0 * s, cy + .8 * s, cx - .28 * s, cy + .72 * s);
  g.lineTo(cx + .28 * s, cy + .72 * s); g.quadraticCurveTo(cx + 1.0 * s, cy + .8 * s, cx + 1.12 * s, cy + 1.3 * s);
  g.lineTo(cx + .5 * s, cy + 1.07 * s); g.lineTo(cx, cy + 1.27 * s); g.lineTo(cx - .5 * s, cy + 1.07 * s); g.closePath(); g.fill();
  // neck
  g.fillStyle = lgrad(g, cx - .17 * s, 0, cx + .17 * s, 0, [[0, 165], [.5, 210], [1, 160]]);
  g.fillRect(cx - .16 * s, cy + .3 * s, .32 * s, .48 * s);
  g.fillStyle = gr(150, .7); ell(g, cx, cy + .52 * s, .17 * s, .1 * s); g.fill();
  for (let k = -6; k <= 6; k++) { const a = k / 6, px = cx + a * .3 * s, py = cy + .8 * s + (1 - a * a) * .12 * s; g.fillStyle = gr(245); ell(g, px, py, .028 * s, .028 * s); g.fill(); g.fillStyle = gr(140); ell(g, px + .008 * s, py + .01 * s, .012 * s, .012 * s); g.fill(); }
  // pale fur stole round the shoulders, falling down the upper arms
  for (let k = 0; k < 30; k++) {
    const u = k / 29, side = u < .5 ? -1 : 1, v = u < .5 ? u * 2 : (u - .5) * 2;
    const px = cx + side * lerp(1.12, .62, v) * s, py = cy + lerp(1.9, 1.12, Math.sqrt(v)) * s + rnd(7, k) * .05 * s, r = (.12 + rnd(8, k) * .05) * s;
    g.fillStyle = rgrad(g, px - r * .3, py - r * .3, 0, r, [[0, 245], [.7, 215], [1, 170]]); ell(g, px, py, r, r * .9); g.fill();
  }
  // face
  g.fillStyle = rgrad(g, cx - .05 * s, cy - .05 * s, .05 * s, .62 * s, [[0, 232], [.55, 214], [.85, 180], [1, 150]]);
  ell(g, cx, cy, .385 * s, .5 * s); g.fill();
  // eyes: big and round
  for (const sd of [-1, 1]) {
    const ex = cx + sd * .165 * s, ey = cy - .055 * s;
    g.fillStyle = gr(180, .6); ell(g, ex, ey + .01 * s, .12 * s, .095 * s); g.fill(); // socket shade
    g.fillStyle = gr(248); ell(g, ex, ey, .098 * s, .078 * s); g.fill();
    const gx = (o.gaze || 0) * .03 * s;
    g.fillStyle = gr(70); ell(g, ex + gx, ey + .005 * s, .056 * s, .056 * s); g.fill();
    g.fillStyle = gr(12); ell(g, ex + gx, ey + .005 * s, .03 * s, .03 * s); g.fill();
    g.fillStyle = gr(255); ell(g, ex + gx - .018 * s, ey - .018 * s, .014 * s, .014 * s); g.fill();
    if (cry > 0) { g.fillStyle = gr(255, cry); ell(g, ex + gx + .02 * s, ey + .022 * s, .008 * s, .006 * s); g.fill(); }
    // upper lid + lashes
    g.strokeStyle = gr(20); g.lineWidth = .02 * s; g.beginPath(); g.ellipse(ex, ey, .1 * s, .08 * s, 0, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
    g.lineWidth = .009 * s; for (let k = 0; k < 4; k++) { const a = Math.PI * (1.2 + k * .2), px = ex + Math.cos(a) * .1 * s, py = ey + Math.sin(a) * .08 * s; g.beginPath(); g.moveTo(px, py); g.lineTo(px + sd * .012 * s * (k - 1.5) * .5, py - .03 * s); g.stroke(); }
    // lower lid (wet when crying)
    g.strokeStyle = gr(cry > 0 ? 250 : 150); g.lineWidth = .008 * s; g.beginPath(); g.ellipse(ex, ey, .095 * s, .078 * s, 0, Math.PI * .15, Math.PI * .85); g.stroke();
    // brows: inner ends lift when crying
    g.strokeStyle = gr(45); g.lineWidth = .022 * s; g.beginPath();
    g.moveTo(ex - sd * .1 * s, ey - .13 * s - cry * .045 * s); g.quadraticCurveTo(ex, ey - .19 * s - cry * .01 * s, ex + sd * .12 * s, ey - .12 * s + cry * .02 * s); g.stroke();
  }
  // nose
  g.strokeStyle = gr(165); g.lineWidth = .014 * s; g.beginPath(); g.moveTo(cx + .03 * s, cy - .02 * s); g.quadraticCurveTo(cx + .05 * s, cy + .1 * s, cx + .01 * s, cy + .14 * s); g.stroke();
  g.fillStyle = gr(130); ell(g, cx - .035 * s, cy + .145 * s, .016 * s, .009 * s); g.fill(); ell(g, cx + .045 * s, cy + .145 * s, .016 * s, .009 * s); g.fill();
  // mouth: a little smile, or turned down and open when crying
  const mw = .11 * s, my = cy + .27 * s, dn = cry * .035 * s;
  g.fillStyle = gr(95); g.beginPath(); g.moveTo(cx - mw, my - .01 * s + dn); g.quadraticCurveTo(cx, my - .05 * s, cx + mw, my - .01 * s + dn);
  g.quadraticCurveTo(cx, my + .05 * s + cry * .04 * s, cx - mw, my - .01 * s + dn); g.fill();
  if (cry > .3) { g.fillStyle = gr(25); ell(g, cx, my + .005 * s, mw * .5, .016 * s * cry); g.fill(); }
  g.fillStyle = gr(200, .8); ell(g, cx - .02 * s, my + .03 * s, .04 * s, .01 * s); g.fill();
  // hair: short, dark, cropped curls, a fringe
  g.fillStyle = gr(30);
  g.beginPath(); g.moveTo(cx - .46 * s, cy + .12 * s); g.bezierCurveTo(cx - .55 * s, cy - .5 * s, cx - .3 * s, cy - .72 * s, cx, cy - .7 * s);
  g.bezierCurveTo(cx + .3 * s, cy - .72 * s, cx + .55 * s, cy - .5 * s, cx + .46 * s, cy + .12 * s);
  g.quadraticCurveTo(cx + .4 * s, cy - .05 * s, cx + .36 * s, cy - .2 * s);
  // fringe edge, scalloped
  for (let k = 0; k <= 7; k++) { const u = 1 - k / 7, px = cx + lerp(-.36, .36, u) * s, py = cy - (.3 - .05 * Math.sin(u * Math.PI * 1)) * s; g.quadraticCurveTo(px + .05 * s, py + .07 * s, px, py); }
  g.quadraticCurveTo(cx - .4 * s, cy - .05 * s, cx - .46 * s, cy + .12 * s); g.fill();
  for (let k = 0; k < 16; k++) { const a = Math.PI * (.95 + k / 15 * 1.1), r = (.5 + rnd(3, k) * .05) * s; g.fillStyle = gr(30 + rnd(4, k) * 20); ell(g, cx + Math.cos(a) * .48 * s, cy - .15 * s + Math.sin(a) * .55 * s, .09 * s, .08 * s); g.fill(); }
  g.strokeStyle = gr(90, .8); g.lineWidth = .012 * s; // sheen on the curls
  for (let k = 0; k < 7; k++) { const a = Math.PI * (1.25 + k * .07); g.beginPath(); g.arc(cx - .05 * s, cy - .1 * s, .55 * s, a, a + .1); g.stroke(); }
  // tears: wet tracks and drops that run down the cheeks
  if (cry > 0) {
    for (const [sd, ph] of [[-1, 0], [1, .45], [-1, .7]]) {
      const x0 = cx + sd * (.2 + (ph > .6 ? .06 : 0)) * s, y0 = cy + .02 * s;
      const L = cry * .55 * s, path = (u) => [x0 + sd * Math.sin(u * 2.2) * .04 * s, y0 + u * L];
      g.strokeStyle = gr(140); g.lineWidth = .02 * s; g.beginPath(); for (let k = 0; k <= 12; k++) { const [px, py] = path(k / 12); k ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke();
      g.strokeStyle = gr(250); g.lineWidth = .009 * s; g.beginPath(); for (let k = 0; k <= 12; k++) { const [px, py] = path(k / 12); k ? g.lineTo(px - .004 * s, py) : g.moveTo(px - .004 * s, py); } g.stroke();
      const u = ((tt * .55 + ph) % 1) * cry, [dx, dy] = path(u), r = .03 * s;
      g.fillStyle = gr(110); ell(g, dx, dy, r * .8, r); g.fill(); g.fillStyle = gr(250); ell(g, dx - r * .2, dy - r * .25, r * .45, r * .55); g.fill();
    }
  }
  // gloved hands (mittens): clasped at the chest, or one at the cheek with a handkerchief
  if (hands === 'chest') {
    // long white gloves: forearms rise from the elbows (at her sides) to hands folded under the pearls
    const hy = cy + 1.55 * s;
    g.strokeStyle = lgrad(g, cx - s, 0, cx + s, 0, [[0, 185], [.5, 240], [1, 185]]); g.lineCap = 'round'; g.lineWidth = .24 * s;
    g.beginPath(); g.moveTo(cx - .98 * s, cy + 1.78 * s); g.quadraticCurveTo(cx - .5 * s, cy + 1.72 * s, cx - .12 * s, hy); g.stroke();
    g.beginPath(); g.moveTo(cx + .98 * s, cy + 1.78 * s); g.quadraticCurveTo(cx + .5 * s, cy + 1.72 * s, cx + .12 * s, hy); g.stroke();
    g.lineCap = 'butt';
    g.fillStyle = gr(242); ell(g, cx - .08 * s, hy - .04 * s, .17 * s, .14 * s, -.5); g.fill(); ell(g, cx + .08 * s, hy - .08 * s, .17 * s, .14 * s, .5); g.fill();
    g.strokeStyle = gr(165); g.lineWidth = .012 * s; g.beginPath(); g.moveTo(cx - .2 * s, hy - .02 * s); g.quadraticCurveTo(cx, hy - .12 * s, cx + .2 * s, hy - .05 * s); g.stroke();
  } else if (hands === 'throat') {
    // one gloved hand resting at her throat, over the pearls; the forearm runs down out of frame
    const hx = cx + .1 * s, hy = cy + .8 * s, elx = cx + .98 * s, ely = cy + 1.95 * s;
    g.lineCap = 'round'; g.lineWidth = .22 * s;
    g.strokeStyle = gr(200); g.beginPath(); g.moveTo(cx + .95 * s, cy + 1.15 * s); g.lineTo(elx, ely); g.stroke(); // bare upper arm at her side
    g.strokeStyle = lgrad(g, hx, 0, elx, 0, [[0, 245], [1, 195]]); g.lineWidth = .23 * s;
    g.beginPath(); g.moveTo(elx, ely); g.quadraticCurveTo(cx + .55 * s, cy + 1.45 * s, hx + .05 * s, hy + .12 * s); g.stroke(); g.lineCap = 'butt'; // gloved forearm up to the throat
    g.fillStyle = gr(244); ell(g, hx, hy, .16 * s, .2 * s, .5); g.fill();
    g.strokeStyle = gr(170); g.lineWidth = .012 * s; g.beginPath(); g.moveTo(hx - .1 * s, hy - .06 * s); g.quadraticCurveTo(hx - .02 * s, hy - .12 * s, hx + .08 * s, hy - .13 * s); g.stroke();
  } else if (hands === 'hankie') {
    const hx = cx + .62 * s, hy = cy + .5 * s + (o.handLift || 0) * s;
    g.fillStyle = lgrad(g, hx - .3 * s, 0, hx + .3 * s, 0, [[0, 185], [.5, 245], [1, 190]]);
    poly(g, [hx + .9 * s, hy + 2.6 * s, hx - .05 * s, hy + .2 * s, hx + .3 * s, hy + .12 * s, hx + 1.3 * s, hy + 2.4 * s]); g.fill(); // glove up the forearm
    g.fillStyle = gr(240); ell(g, hx, hy, .17 * s, .22 * s, -.4); g.fill(); // mitten
    // handkerchief bunched in the hand
    g.fillStyle = gr(250); poly(g, [hx - .22 * s, hy - .26 * s, hx - .05 * s, hy - .34 * s, hx + .1 * s, hy - .2 * s, hx + .06 * s, hy + .02 * s, hx - .2 * s, hy - .02 * s]); g.fill();
    g.strokeStyle = gr(175); g.lineWidth = .01 * s; g.beginPath(); g.moveTo(hx - .16 * s, hy - .24 * s); g.lineTo(hx - .02 * s, hy - .1 * s); g.moveTo(hx - .04 * s, hy - .3 * s); g.lineTo(hx + .04 * s, hy - .1 * s); g.stroke();
  }
}

// The big man, from behind. turn 0 = back of the head; 1 = profile looking screen-left.
function drawManBack(g, x, y, s, turn = 0) {
  const tu = smooth(turn);
  // shoulders and back: dark suit
  g.fillStyle = lgrad(g, x - 1.6 * s, 0, x + 1.6 * s, 0, [[0, 22], [.35, 48], [.6, 34], [1, 18]]);
  g.beginPath(); g.moveTo(x - 1.75 * s, y + 3.5 * s); g.lineTo(x - 1.6 * s, y + 1.1 * s); g.quadraticCurveTo(x - 1.4 * s, y + .62 * s, x - .4 * s, y + .55 * s);
  g.lineTo(x + .4 * s, y + .55 * s); g.quadraticCurveTo(x + 1.4 * s, y + .62 * s, x + 1.6 * s, y + 1.1 * s); g.lineTo(x + 1.75 * s, y + 3.5 * s); g.closePath(); g.fill();
  g.strokeStyle = gr(14); g.lineWidth = .04 * s; g.beginPath(); g.moveTo(x, y + .6 * s); g.lineTo(x + .03 * s, y + 3.4 * s); g.stroke(); // centre seam
  // white collar edge + neck
  g.fillStyle = gr(225); g.fillRect(x - .32 * s, y + .44 * s, .64 * s, .12 * s);
  g.fillStyle = gr(150); g.fillRect(x - .3 * s, y + .25 * s, .6 * s, .22 * s);
  // head: skin, then hair over the back; as he turns, his face slides into view on the left
  const hx = x - tu * .06 * s, rx = .45 * s, ry = .55 * s;
  g.save(); ell(g, hx, y, rx, ry); g.clip();
  g.fillStyle = gr(26); g.fillRect(hx - rx, y - ry, rx * 2, ry * 2);                              // hair
  g.fillStyle = gr(150); g.fillRect(hx - rx, y + .25 * s, rx * 2, ry);                            // nape
  const fw = tu * .62 * s;                                                                         // face width in view
  if (fw > 1) { g.fillStyle = lgrad(g, hx - rx, 0, hx - rx + fw, 0, [[0, 190], [1, 140]]); g.fillRect(hx - rx, y - .3 * s, fw, ry * 2); }
  g.fillStyle = gr(26); g.fillRect(hx - rx, y - ry, rx * 2, .24 * s);                              // hairline
  g.restore();
  g.save(); ell(g, hx, y, rx, ry); g.clip();
  g.fillStyle = gr(120, 1 - tu * .5); ell(g, hx + tu * .1 * s, y - .38 * s, .22 * s, .13 * s); g.fill(); // receding at the crown
  g.restore();
  if (tu < .6) { g.fillStyle = gr(140); ell(g, hx + .45 * s, y + .04 * s, .085 * s * (1 - tu / .6), .14 * s); g.fill(); } // right ear, turning away
  const ex = hx - lerp(.44, -.02, tu) * s; // left ear travels from the edge toward the middle
  g.fillStyle = gr(140); ell(g, ex, y + .04 * s, .085 * s, .14 * s); g.fill();
  if (tu > .02) { // profile: brow, nose, lips, chin push out past the outline
    const px = hx - rx + .02 * s, k = tu;
    g.fillStyle = gr(175); g.beginPath(); g.moveTo(px + .05 * s, y - .28 * s); g.lineTo(px - .05 * s * k, y - .14 * s); g.lineTo(px - .19 * s * k, y + .07 * s);
    g.lineTo(px - .04 * s * k, y + .13 * s); g.lineTo(px - .07 * s * k, y + .22 * s); g.lineTo(px - .03 * s * k, y + .3 * s); g.lineTo(px - .01 * s * k, y + .42 * s);
    g.lineTo(px + .22 * s, y + .5 * s); g.lineTo(px + .2 * s, y - .2 * s); g.closePath(); g.fill();
    g.fillStyle = gr(20); ell(g, px + .1 * s, y - .06 * s, .03 * s * k, .015 * s); g.fill(); // eye, a dash
  }
}

// ---------------------------------------------------------------- the hall, seen from the seats
function hallSeats(g, t) {
  for (let r = 0; r < 9; r++) {
    const yr = 712 + 38 * r + 4.6 * r * r, hs = 13 + 5.6 * r, sp = hs * 3.1;
    const n = Math.ceil(2400 / sp), off = (r % 2) * sp * .5;
    for (let k = 0; k < n; k++) {
      const x = -240 + off + k * sp + rnd(r, k, 9) * hs * .3, y = yr - Math.pow((x - 960) / 1000, 2) * 40 * (1 + r * .1);
      // seat back
      g.fillStyle = gr(62); ell(g, x, y + hs * 1.35, hs * 1.4, hs * .9); g.fill(); g.fillRect(x - hs * 1.4, y + hs * 1.35, hs * 2.8, hs * 2);
      g.fillStyle = gr(105); g.fillRect(x - hs * 1.4, y + hs * .5, hs * 2.8, hs * .1);
      if (rnd(r, k, 1) < .82) {
        const woman = rnd(r, k, 2) < .45;
        g.fillStyle = woman ? gr(185) : gr(30); ell(g, x, y + hs * 1.0, hs * 1.25, hs * .65); g.fill(); // shoulders
        if (woman) { g.fillStyle = gr(40); ell(g, x, y + hs * 1.35, hs * 1.1, hs * .45); g.fill(); }
        g.fillStyle = gr(woman ? 25 + rnd(r, k, 3) * 40 : rnd(r, k, 3) < .2 ? 160 : 28); ell(g, x, y, hs * .62, hs * .74); g.fill(); // back of head
        g.fillStyle = gr(150); ell(g, x - hs * .6, y + hs * .1, hs * .1, hs * .17); g.fill(); ell(g, x + hs * .6, y + hs * .1, hs * .1, hs * .17); g.fill();
      }
    }
  }
}
function drawHall(g, t, o = {}) {
  g.fillStyle = gr(48); g.fillRect(-3000, -3000, 8000, 8000);
  // proscenium frame with gilt moulding
  g.fillStyle = gr(130); g.fillRect(220, -40, 1480, 690);
  for (let k = 0; k < 6; k++) { g.fillStyle = gr(k % 2 ? 180 : 95); g.fillRect(220 + k * 16, -40, 8, 690); g.fillRect(1692 - k * 16, -40, 8, 690); g.fillRect(220, -40 + k * 14, 1480, 6); }
  for (let k = 0; k < 30; k++) { g.fillStyle = gr(205); ell(g, 250 + k * 49, 60, 9, 9); g.fill(); }
  // stage opening
  g.fillStyle = lgrad(g, 0, 90, 0, 610, [[0, 60], [.6, 105], [1, 80]]); g.fillRect(330, 90, 1260, 520);
  for (let k = 0; k < 9; k++) { g.fillStyle = gr(140, .35); poly(g, [480 + k * 120, 90, 520 + k * 120, 90, 560 + k * 120, 600, 470 + k * 120, 600]); g.fill(); }
  for (let k = 0; k < 7; k++) { g.fillStyle = gr(k % 2 ? 150 : 110, .5); g.beginPath(); g.moveTo(960, 560); g.arc(960, 560, 520, Math.PI * (1.05 + k * .13), Math.PI * (1.05 + k * .13 + .065)); g.fill(); } // sunburst backdrop
  // curtains: folds as stripes, tied back
  for (const sd of [-1, 1]) {
    const x0 = sd < 0 ? 330 : 1590;
    for (let k = 0; k < 7; k++) {
      const a = x0 - sd * k * 20, b = a - sd * 20;
      g.fillStyle = gr(k % 2 ? 72 : 118); poly(g, [a, 90, b, 90, b - sd * (k * 6), 420, b + sd * 30, 610, a + sd * 36, 610, a - sd * (k * 6 - 6), 420]); g.fill();
    }
    g.fillStyle = gr(200); ell(g, x0 - sd * 120, 420, 26, 12); g.fill();
  }
  for (let k = 0; k < 13; k++) { g.fillStyle = gr(k % 2 ? 80 : 120); g.beginPath(); g.arc(378 + k * 97, 92, 52, 0, Math.PI); g.fill(); }
  g.fillStyle = gr(95); g.fillRect(330, 82, 1260, 22);
  // stage floor + footlights
  g.fillStyle = lgrad(g, 0, 598, 0, 652, [[0, 175], [1, 120]]); poly(g, [300, 598, 1620, 598, 1700, 652, 220, 652]); g.fill();
  for (let k = 0; k < 24; k++) { g.fillStyle = gr(225); ell(g, 270 + k * 60, 648, 12, 5); g.fill(); }
  // podium + microphone
  g.fillStyle = lgrad(g, 1196, 0, 1296, 0, [[0, 205], [.7, 170], [1, 110]]); poly(g, [1190, 470, 1300, 470, 1290, 600, 1200, 600]); g.fill();
  g.fillStyle = gr(110); g.fillRect(1190, 470, 110, 9);
  g.strokeStyle = gr(40); g.lineWidth = 3; g.beginPath(); g.moveTo(1225, 470); g.quadraticCurveTo(1222, 440, 1236, 430); g.stroke();
  const rz = smooth(o.raise || 0);
  if (o.man) { // far off: a big man in a dark suit behind the podium
    g.fillStyle = gr(26); poly(g, [1196, 470, 1204, 416, 1232, 398, 1272, 398, 1298, 416, 1306, 470]); g.fill();
    g.fillStyle = gr(225); poly(g, [1243, 400, 1261, 400, 1252, 430]); g.fill();
    g.fillStyle = gr(195); ell(g, 1252, 378, 19, 23); g.fill(); g.fillStyle = gr(25); g.beginPath(); g.ellipse(1252, 372, 20, 18, 0, Math.PI, TAU); g.fill();
    // right arm: from the shoulder to the award, lifted on "Oscars"
    const ax = lerp(1290, 1330, rz), ay = lerp(462, 330, rz);
    g.strokeStyle = gr(26); g.lineWidth = 17; g.lineCap = 'round'; g.beginPath(); g.moveTo(1292, 412); g.quadraticCurveTo(lerp(1318, 1330, rz), lerp(450, 380, rz), ax, ay); g.stroke(); g.lineCap = 'butt';
    g.fillStyle = gr(180); ell(g, ax, ay, 9, 9); g.fill();
    drawAward(g, ax, ay + 4, 86);
  } else drawAward(g, 1222, 470, 80);
  g.fillStyle = gr(22); g.fillRect(-3000, 652, 8000, 60); // pit
  hallSeats(g, t);
  if (o.press) for (const [x, y, s, fl] of PRESS_POS) drawPressCam(g, x, y, s, { flip: fl, dark: 20 });
}
const PRESS_POS = [[1640, 930, 120, true], [250, 980, 135, false]];

// ---------------------------------------------------------------- the hall, from the stage (reverse)
function drawAudienceFront(g, t, o = {}) {
  g.fillStyle = gr(40); g.fillRect(-3000, -3000, 8000, 8000);
  // balcony
  g.fillStyle = gr(85); g.beginPath(); g.moveTo(-200, 260); g.quadraticCurveTo(960, 170, 2120, 260); g.lineTo(2120, 300); g.quadraticCurveTo(960, 210, -200, 300); g.fill();
  for (let r = 0; r < 10; r++) {
    const y0 = 330 + r * 30 + r * r * 5.4, fs = 9 + r * 5.2, sp = fs * 2.7;
    const n = Math.ceil(2500 / sp), off = (r % 2) * sp * .5;
    for (let k = 0; k < n; k++) {
      const x = -300 + off + k * sp, y = y0 + Math.pow((x - 960) / 1000, 2) * 60;
      if (o.skip && Math.abs(x - o.skip[0]) < o.skip[2] * 1.4 && Math.abs(y - o.skip[1]) < o.skip[2] * 1.4) continue;
      const woman = rnd(r, k, 5) < .45;
      g.fillStyle = gr(woman ? 140 : 28); ell(g, x, y + fs * 1.3, fs * 1.05, fs * .65); g.fill();
      g.fillStyle = gr(woman ? 45 : 225); poly(g, [x - fs * .14, y + fs * .7, x + fs * .14, y + fs * .7, x, y + fs * 1.05]); g.fill(); // shirt front
      g.fillStyle = gr(190); ell(g, x, y, fs * .5, fs * .62); g.fill();
      g.fillStyle = gr(woman ? 30 : 35 + rnd(r, k, 6) * 100); g.beginPath(); g.ellipse(x, y - fs * .1, fs * .53, fs * .56, 0, Math.PI, TAU); g.fill();
      if (fs > 22) { g.fillStyle = gr(60); ell(g, x - fs * .17, y + fs * .02, fs * .06, fs * .05); g.fill(); ell(g, x + fs * .17, y + fs * .02, fs * .06, fs * .05); g.fill(); }
    }
  }
}

// ---------------------------------------------------------------- renderer with a light map
// lights: { amb (0..1), list: [[x, y, r, k]] } in world units. Drawn into SC; returns SC.
function renderLit(drawFn, emitFn, t, cam, lights) {
  sg.setTransform(1, 0, 0, 1, 0, 0); sg.globalCompositeOperation = 'source-over'; sg.globalAlpha = 1;
  sg.fillStyle = '#fff'; sg.fillRect(0, 0, W, H);
  camSet(sg, cam); drawFn(sg, t);
  lg.setTransform(1, 0, 0, 1, 0, 0); lg.globalCompositeOperation = 'source-over'; lg.fillStyle = gr(255 * lights.amb); lg.fillRect(0, 0, 960, 540);
  camSet(lg, cam, .5); lg.globalCompositeOperation = 'lighter';
  for (const [x, y, r, k] of lights.list) {
    if (k <= .002) continue;
    const q = lg.createRadialGradient(x, y, 0, x, y, r), v = clamp(k);
    q.addColorStop(0, gr(255 * v)); q.addColorStop(.45, gr(235 * v)); q.addColorStop(.75, gr(110 * v)); q.addColorStop(1, gr(0));
    lg.fillStyle = q; lg.fillRect(x - r, y - r, r * 2, r * 2);
  }
  sg.setTransform(1, 0, 0, 1, 0, 0); sg.globalCompositeOperation = 'multiply'; sg.drawImage(LIT, 0, 0, W, H); sg.globalCompositeOperation = 'source-over';
  if (emitFn) { camSet(sg, cam); emitFn(sg, t); sg.setTransform(1, 0, 0, 1, 0, 0); }
  return SC;
}

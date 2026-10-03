// The kit: sets, props and people shared by every chapter. Top-level names here are global;
// chapter files wrap their own code in an IIFE and add nothing to the global scope.
// World: one-point perspective, eye at y 0, floor y 1.6, ceiling y -2.6, walls x ±7, far wall z 70.

const INK = '#22221e', CREAM = '#e6dfc6', STEEL = '#7f8b8e', STEEL_D = '#59646a', GREEN = '#88917f', GREEN_D = '#646d5f';
const BRASS = '#a88a4c', AMBER = '#f0b23a', SKIN = '#c9a888', COAT = '#6a6658', HAT = '#3e3c35';
const SKY_T = '#3f7fc4', SKY_B = '#a9d3f0';

// ---- one-point perspective: eye at y 0, floor y 1.6, ceiling y -2.6, walls x ±7, far wall z 70 ----
let C = { x: 0, y: 0, z: 0, f: 820, vy: 470 };
const cam = (o) => { C = { x: 0, y: 0, z: 0, f: 820, vy: 470, ...o }; };
const P = (x, y, z) => { const k = C.f / Math.max(.05, z - C.z); return [W / 2 + (x - C.x) * k, C.vy + (y - C.y) * k, k]; };
const FL = 1.6, CE = -2.6, WX = 7, FAR = 70;
function ink(pts, w = 2.5) { line(pts, INK, w); }
function shape(pts, c, w = 2.5) { poly(pts, c); s.lineJoin = 'round'; s.lineWidth = w; s.strokeStyle = INK; s.stroke(); }
function hatch(pts, ang = .8, gap = 9, w = 1.4, a = .55) {
  withT(() => { s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.clip();
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const L = (x1 - x0) + (y1 - y0); s.globalAlpha = a; s.strokeStyle = INK; s.lineWidth = w; s.beginPath();
    for (let d = -L; d < L; d += gap) { s.moveTo(x0 + d, y1); s.lineTo(x0 + d + Math.cos(ang) * L * 2, y1 - Math.sin(ang) * L * 2); }
    s.stroke(); });
}
const zn = () => C.z + .6;

function room(t) {
  fill('#4d5250');
  // far wall
  const a = P(-WX, CE, FAR), b = P(WX, FL, FAR); shape([[a[0], a[1]], [b[0], a[1]], [b[0], b[1]], [a[0], b[1]]], '#9a9c8c', 2);
  // ceiling, floor, walls
  const q = (x0, y0, x1, y1, z0, z1) => [P(x0, y0, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y0, z1)].map(p => [p[0], p[1]]);
  shape(q(-WX, CE, WX, CE, zn(), FAR), '#3d4140', 2);
  shape(q(-WX, FL, WX, FL, zn(), FAR), '#a7a48f', 2);
  shape([P(-WX, CE, zn()), P(-WX, CE, FAR), P(-WX, FL, FAR), P(-WX, FL, zn())].map(p => [p[0], p[1]]), GREEN, 2);
  shape([P(WX, CE, zn()), P(WX, CE, FAR), P(WX, FL, FAR), P(WX, FL, zn())].map(p => [p[0], p[1]]), GREEN_D, 2);
  // floor tiles
  s.globalAlpha = .45;
  for (let z = Math.ceil(zn() / 1.6) * 1.6; z < FAR; z += 1.6) ink([P(-WX, FL, z), P(WX, FL, z)].map(p => [p[0], p[1]]), 1.3);
  for (let x = -WX; x <= WX; x += 1.4) ink([P(x, FL, zn()), P(x, FL, FAR)].map(p => [p[0], p[1]]), 1.3);
  s.globalAlpha = 1;
  // left wall: filing drawers to the ceiling
  for (let z = Math.max(2, Math.ceil(zn() / 1.3) * 1.3); z < 44; z += 1.3) for (let y = CE + .25; y < FL - .3; y += .62) {
    const p = [P(-WX, y, z), P(-WX, y, z + 1.15), P(-WX, y + .54, z + 1.15), P(-WX, y + .54, z)].map(p => [p[0], p[1]]);
    shape(p, (hash(z * 31 + y * 7) > .9) ? '#7a8274' : '#8f9886', 1.2);
    const h = P(-WX, y + .27, z + .58); dot(h[0], h[1], 3 * h[2] / 80, INK);
  }
  // right wall: numbered doors with frosted glass
  for (let z = 6; z < 50; z += 5) {
    const d = [P(WX, -.7, z), P(WX, -.7, z + 1.4), P(WX, FL, z + 1.4), P(WX, FL, z)].map(p => [p[0], p[1]]);
    shape(d, '#6b6a5a', 2);
    const g = [P(WX, -.55, z + .15), P(WX, -.55, z + 1.25), P(WX, .3, z + 1.25), P(WX, .3, z + .15)].map(p => [p[0], p[1]]);
    shape(g, '#c9c8b0', 1.5);
    const n = P(WX, -.15, z + .7); text(String(400 + z * 3), n[0], n[1], n[2] * .28, { max: Math.abs(g[1][0] - g[0][0]) * .8 });
  }
}

// a ribbed duct along z
function duct(x, y, r, z0, z1, c = STEEL) {
  const step = .9; const rings = [];
  for (let z = Math.max(z0, zn() + .2); z <= z1; z += step) rings.push(P(x, y, z));
  for (let i = rings.length - 1; i > 0; i--) {
    const [ax, ay, ak] = rings[i], [bx, by, bk] = rings[i - 1];
    shape([[ax, ay - r * ak], [bx, by - r * bk], [bx, by + r * bk], [ax, ay + r * ak]], c, 1.6);
    hatch([[ax, ay + r * ak * .2], [bx, by + r * bk * .2], [bx, by + r * bk], [ax, ay + r * ak]], .9, 7, 1, .4);
    s.lineWidth = Math.max(1, 2.2 * bk / 200); s.strokeStyle = INK; s.beginPath(); s.ellipse(bx, by, r * bk * .35, r * bk, 0, 0, TAU); s.stroke();
  }
}
// the glass pneumatic tube on the right wall; canisters fire on the beat
function tube(t, x = 6.3, y = -1.95, r = .16) {
  const a = P(x, y, zn() + 4), b = P(x, y, FAR);
  s.globalAlpha = .5; line([[a[0], a[1]], [b[0], b[1]]], '#c7d0cf', r * a[2] * 2.2, 'butt'); s.globalAlpha = 1;
  ink([[a[0], a[1] - r * a[2]], [b[0], b[1] - r * b[2]]], 1.5); ink([[a[0], a[1] + r * a[2]], [b[0], b[1] + r * b[2]]], 1.5);
  const i = lastBeat(t); for (let k = Math.max(0, i - 3); k <= i; k++) {
    const lt = t - FEAT.beats[k]; const z = zn() + 4 + lt * 26; if (z > FAR) continue;
    const p = P(x, y, z), q = P(x, y, z + .7); shape([[p[0], p[1] - r * .8 * p[2]], [q[0], q[1] - r * .8 * q[2]], [q[0], q[1] + r * .8 * q[2]], [p[0], p[1] + r * .8 * p[2]]], BRASS, 1.5);
  }
}
function board(t, num = '0002', z = 52) {
  const a = P(-3, -2.25, z), b = P(3, -.95, z);
  ink([[P(-2.2, CE, z)[0], P(-2.2, CE, z)[1]], [P(-2.2, -2.25, z)[0], a[1]]], 2); ink([[P(2.2, CE, z)[0], P(2.2, CE, z)[1]], [P(2.2, -2.25, z)[0], a[1]]], 2);
  shape([[a[0], a[1]], [b[0], a[1]], [b[0], b[1]], [a[0], b[1]]], BRASS, 3);
  const m = 6 * a[2] / 60; shape([[a[0] + m, a[1] + m], [b[0] - m, a[1] + m], [b[0] - m, b[1] - m], [a[0] + m, b[1] - m]], '#1f201c', 2);
  s.textAlign = 'center'; s.fillStyle = AMBER;
  const inner = (b[0] - a[0]) - 4 * m;
  text('NOW SERVING', (a[0] + b[0]) / 2, a[1] + (b[1] - a[1]) * .38, a[2] * .32, { font: 'sign', color: AMBER, max: inner });
  text(num, (a[0] + b[0]) / 2, a[1] + (b[1] - a[1]) * .86, a[2] * .62, { font: 'sign', color: AMBER, max: inner });
}
// the hold-music horn on the left wall; it swells with the voice
function horn(t, z = 9) {
  const v = F('voc', t, 2), sw = 1 + v * .12;
  const m = P(-WX + .1, -1.9, z), k = m[2] * sw;
  shape([[m[0], m[1] - .12 * k], [m[0] + .7 * k, m[1] - .45 * k], [m[0] + .7 * k, m[1] + .45 * k], [m[0], m[1] + .12 * k]], BRASS, 2.5);
  s.beginPath(); s.ellipse(m[0] + .7 * k, m[1], .12 * k, .45 * k, 0, 0, TAU); s.fillStyle = '#2a2a24'; s.fill(); s.stroke();
  // sound rings in ink, only while he sings
  for (let i = 0; i < 3; i++) { const ph = (t * 1.6 + i / 3) % 1; s.globalAlpha = v * (1 - ph) * .8; s.beginPath(); s.ellipse(m[0] + .8 * k + ph * 1.2 * k, m[1], (.15 + ph * .3) * k, (.5 + ph * .6) * k, 0, -1.1, 1.1); s.lineWidth = 3; s.strokeStyle = INK; s.stroke(); }
  s.globalAlpha = 1;
}
function clock(t, x, y, z) {
  const c = P(x, y, z), r = .45 * c[2];
  s.beginPath(); s.arc(c[0], c[1], r, 0, TAU); s.fillStyle = CREAM; s.fill(); s.lineWidth = 3; s.strokeStyle = INK; s.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ink([[c[0] + Math.cos(a) * r * .8, c[1] + Math.sin(a) * r * .8], [c[0] + Math.cos(a) * r * .92, c[1] + Math.sin(a) * r * .92]], 2); }
  const sec = lastBeat(t); // it ticks on the beat and never gets anywhere
  const h = -Math.PI / 2 + .3, mi = -Math.PI / 2 + (sec % 60) / 60 * TAU * .02 + 1.2, sc = -Math.PI / 2 + sec * TAU / 60;
  ink([[c[0], c[1]], [c[0] + Math.cos(h) * r * .5, c[1] + Math.sin(h) * r * .5]], 5);
  ink([[c[0], c[1]], [c[0] + Math.cos(mi) * r * .75, c[1] + Math.sin(mi) * r * .75]], 3.5);
  line([[c[0], c[1]], [c[0] + Math.cos(sc) * r * .85, c[1] + Math.sin(sc) * r * .85]], '#8a2a1e', 1.6);
}
function ticketBox(x = 3.6, z = 5.6) {
  const b = P(x, FL, z), top = P(x, -.1, z), k = b[2];
  ink([[b[0], b[1]], [top[0], top[1]]], 4);
  shape([[top[0] - .25 * k, top[1] - .72 * k], [top[0] + .25 * k, top[1] - .72 * k], [top[0] + .25 * k, top[1]], [top[0] - .25 * k, top[1]]], BRASS, 2.5);
  // one word per line so it reads from across the hall
  ['TAKE', 'A', 'NUMBER'].forEach((w, i) => text(w, top[0], top[1] - (.56 - i * .13) * k, k * .11, { font: 'sign', max: .42 * k, fitTo: 'NUMBER' }));
  shape([[top[0] - .12 * k, top[1] - .16 * k], [top[0] + .12 * k, top[1] - .16 * k], [top[0] + .12 * k, top[1] - .12 * k], [top[0] - .12 * k, top[1] - .12 * k]], INK, 1);
}

// ---- people ----
// a seated man from behind, hat on, facing the board. skip: an empty seat is drawn instead.
function seat(x, z, sitter, mine = false) {
  const b = P(x, FL, z), k = b[2], w = .42 * k;
  const sy = P(x, .95, z)[1];
  ink([[b[0] - w * .8, b[1]], [b[0] - w * .8, sy]], 1.6); ink([[b[0] + w * .8, b[1]], [b[0] + w * .8, sy]], 1.6);
  shape([[b[0] - w, sy - .06 * k], [b[0] + w, sy - .06 * k], [b[0] + w, sy + .02 * k], [b[0] - w, sy + .02 * k]], '#5d5a4c', 1.4);
  if (!sitter) { shape([[b[0] - w, sy - .7 * k], [b[0] + w, sy - .7 * k], [b[0] + w, sy - .1 * k], [b[0] - w, sy - .1 * k]], '#6e6a5a', 1.6); return; }
  const sh = sy - .78 * k;
  shape([[b[0] - w * 1.05, sy], [b[0] + w * 1.05, sy], [b[0] + w * .85, sh], [b[0] - w * .85, sh]], mine ? '#4f4c40' : COAT, 1.8);
  hatch([[b[0] + w * .2, sy], [b[0] + w * 1.05, sy], [b[0] + w * .85, sh], [b[0] + w * .3, sh]], .9, 6, 1, .35);
  dot(b[0], sh - .1 * k, .13 * k, SKIN); s.lineWidth = 1.5; s.strokeStyle = INK; s.beginPath(); s.arc(b[0], sh - .1 * k, .13 * k, 0, TAU); s.stroke();
  s.beginPath(); s.ellipse(b[0], sh - .2 * k, .25 * k, .06 * k, 0, 0, TAU); s.fillStyle = HAT; s.fill(); s.stroke();
  shape([[b[0] - .14 * k, sh - .2 * k], [b[0] + .14 * k, sh - .2 * k], [b[0] + .12 * k, sh - .38 * k], [b[0] - .12 * k, sh - .38 * k]], HAT, 1.5);
  if (mine) restingCase(x + .55, z - .1); // the guitar case leans on his chair
}
function rows(t, skipX = null, skipZ = null, papers = 0) {
  const out = [];
  for (let z = 56; z >= 8; z -= 2.4) for (const x of [-5.5, -4.4, -3.3, -2.2, -1.1, 1.1, 2.2, 3.3, 4.4, 5.5]) {
    if (z - C.z < 1) continue;
    const mine = skipX !== null && Math.abs(x - skipX) < .01 && Math.abs(z - skipZ) < .01;
    seat(x, z, mine ? null : hash(Math.round(x * 10) * 131 + Math.round(z * 10)) < .8);
    out.push([x, z]);
  }
  return out;
}
// the man, side on, walking (ph = stride phase) or standing; facing 1 = right. carries the guitar case.
function man(x, z, { ph = 0, walk = 0, face = 1, arm = 0, ticket = false } = {}) {
  const b = P(x, FL, z), k = b[2], H1 = 1.78 * k, sw = Math.sin(ph * TAU) * .32 * walk;
  const hip = [b[0], b[1] - .95 * k];
  const leg = (a, c) => ink([hip, [hip[0] + Math.sin(a) * .5 * k * face, hip[1] + .5 * k], [hip[0] + Math.sin(a) * .9 * k * face + .05 * k * face, b[1]]], .13 * k);
  s.strokeStyle = INK; leg(-sw); leg(sw);
  line([[hip[0], hip[1] - .02 * k], [hip[0], b[1] - .05 * k]], 'transparent', 1);
  // coat to the knee
  const sh = b[1] - 1.45 * k, bob = Math.abs(Math.sin(ph * TAU)) * .03 * k * walk;
  shape([[b[0] - .24 * k * face, sh + bob], [b[0] + .22 * k * face, sh + bob], [b[0] + .34 * k * face, b[1] - .45 * k], [b[0] - .34 * k * face, b[1] - .45 * k]], COAT, 2);
  hatch([[b[0] - .26 * k * face, sh + bob], [b[0] - .02 * k * face, sh + bob], [b[0] - .04 * k * face, b[1] - .45 * k], [b[0] - .34 * k * face, b[1] - .45 * k]], .9, 6, 1, .4);
  // head and hat
  const hx = b[0] + .04 * k * face, hy = b[1] - H1 + .14 * k + bob;
  dot(hx, hy, .12 * k, SKIN); s.lineWidth = 1.8; s.strokeStyle = INK; s.beginPath(); s.arc(hx, hy, .12 * k, 0, TAU); s.stroke();
  dot(hx + .1 * k * face, hy + .01 * k, .025 * k, SKIN);
  s.beginPath(); s.ellipse(hx, hy - .09 * k, .24 * k, .045 * k, 0, 0, TAU); s.fillStyle = HAT; s.fill(); s.stroke();
  shape([[hx - .13 * k, hy - .09 * k], [hx + .13 * k, hy - .09 * k], [hx + .11 * k, hy - .27 * k], [hx - .11 * k, hy - .27 * k]], HAT, 1.6);
  // far arm carries the case; near arm swings or reaches
  carriedCase(b, k, face, sw);
  const shp = [b[0] + .02 * k * face, sh + .12 * k + bob];
  const ang = lerp(sw * .8, 1.9, arm) * face; /* arm 1 reaches forward, the way he faces */ const el = [shp[0] + Math.sin(ang) * .36 * k * face * face, shp[1] + Math.cos(ang) * .36 * k];
  const hand = [el[0] + Math.sin(ang * 1.1) * .34 * k * face * face, el[1] + Math.cos(ang * 1.1) * .34 * k];
  ink([shp, el, hand], .1 * k); dot(hand[0], hand[1], .05 * k, SKIN);
  if (ticket) shape([[hand[0], hand[1] - .02 * k], [hand[0] + .14 * k * face, hand[1] - .05 * k], [hand[0] + .15 * k * face, hand[1] + .04 * k], [hand[0] + .01 * k * face, hand[1] + .06 * k]], CREAM, 1.2);
}

// ---- sky through the roof ----
function cloud(cx, cy, r, seed) {
  const R = rng(seed); const puffs = [];
  for (let i = 0; i < 6; i++) { const u = i / 5 - .5, rr = r * (.42 + .5 * (1 - Math.abs(u) * 1.4) + R() * .15); puffs.push([cx + u * r * 2.6, cy - rr * .55, rr]); }
  puffs.push([cx - r * .3, cy - r * .95, r * .55], [cx + r * .4, cy - r * 1.0, r * .5]);
  withT(() => { s.beginPath(); s.rect(cx - r * 4, cy - r * 4, r * 8, r * 4); s.clip();      // flat-bottomed
    s.lineWidth = 6; s.strokeStyle = INK; for (const [x, y, rr] of puffs) { s.beginPath(); s.arc(x, y, rr, 0, TAU); s.stroke(); }
    for (const [x, y, rr] of puffs) dot(x, y, rr - 2, '#fbfbf6');
    s.globalAlpha = .18; for (const [x, y, rr] of puffs) dot(x + rr * .25, y + rr * .35, rr * .7, '#9fb4c4'); s.globalAlpha = 1; });
  ink([[cx - r * 1.55, cy], [cx + r * 1.55, cy]], 3);
}
function skyHole(t, open, z = 26) {
  if (open <= 0) return;
  const c = P(0, CE, z), R = open * 1500, pts = [];
  for (let i = 0; i < 40; i++) { const a = i / 40 * TAU, j = 1 + (hash(i * 17 + 3) - .5) * .5; pts.push([c[0] + Math.cos(a) * R * j, c[1] - R * .12 + Math.sin(a) * R * j * .32]); }
  const ceil = [P(-WX, CE, zn()), P(WX, CE, zn()), P(WX, CE, FAR), P(-WX, CE, FAR)].map(p => [p[0], p[1]]);
  const holePath = () => { s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); };
  withT(() => {
    s.beginPath(); ceil.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.clip();
    holePath(); s.save(); s.clip();
    s.fillStyle = vgrad(c[1] - R * .5, c[1] + R * .4, [[0, SKY_T], [1, SKY_B]]); s.fillRect(0, -200, W, H + 400);
    for (let i = 0; i < 5; i++) cloud(((i * 520 + t * 38) % (W + 600)) - 300, c[1] - R * .2 + (hash(i) - .5) * R * .3, 90 + 50 * hash(i + 9), 70 + i);
    s.restore(); holePath(); s.lineWidth = 4; s.strokeStyle = INK; s.stroke();
  });
}
// forms flying up out of every lap, like birds
function papers(t, t0, n = 60) {
  if (t < t0) return;
  for (let i = 0; i < n; i++) {
    const lt = t - t0 - hash(i * 7) * 1.6; if (lt < 0) continue;
    const x0 = (hash(i * 13) - .5) * 1500 + W / 2, y0 = 700 + hash(i * 3) * 300;
    const x = x0 + Math.sin(lt * 2 + i) * 60 + (x0 - W / 2) * lt * .05, y = y0 - lt * (180 + hash(i * 5) * 160);
    const fl = Math.sin(lt * 9 + i), w = 34 * (.7 + hash(i)), h = 44 * (.7 + hash(i));
    withT(() => { s.translate(x, y); s.rotate(Math.sin(lt * 1.3 + i) * .6); s.scale(1, .35 + .65 * Math.abs(fl));
      shape([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], CREAM, 1.6);
      for (let l = 0; l < 4; l++) ink([[-w * .35, -h * .3 + l * h * .18], [w * .35, -h * .3 + l * h * .18]], 1); });
  }
}


// ---- added for the full song ----
const ROSE = '#c8455a', ROSE_L = '#e7a0a8';
// set text in the world. font: 'type' (typewriter), 'sign' (Futura), 'stamp' (bold slab)
const FONTS = { type: '"American Typewriter", Courier, serif', sign: 'Futura, "Gill Sans", sans-serif', stamp: '"Rockwell", "American Typewriter", serif' };
const fontCss = (font, size) => `${font === 'stamp' ? 'bold ' : ''}${Math.round(size)}px ${FONTS[font]}`;
// how wide str sets at this size and font (letter spacing included)
function textWidth(str, size, font = 'type', spacing = 0) { s.save(); s.font = fontCss(font, size); const w = s.measureText(str).width + spacing * Math.max(0, str.length - 1); s.restore(); return w; }
// the largest size <= size at which str fits in max px
function fitSize(str, size, max, font = 'type', spacing = 0) { if (!max) return size; const w = textWidth(str, size, font, spacing); return w > max ? size * max / w : size; }
// set text in the world. font: 'type' (typewriter), 'sign' (Futura), 'stamp' (bold slab).
// max: the width it must fit in (its paper, sign or card); the size shrinks to fit. fitTo: measure the fit
// against this longer string instead (so a line being typed out keeps one size as it grows).
function text(str, x, y, size, { font = 'type', color = INK, align = 'center', rot = 0, alpha = 1, spacing = 0, max = 0, fitTo = null } = {}) {
  const sz = fitSize(fitTo ?? str, size, max, font, spacing), sp = spacing * sz / size;
  withT(() => { s.translate(x, y); s.rotate(rot); s.globalAlpha *= alpha; s.fillStyle = color; s.textAlign = align; s.textBaseline = 'alphabetic';
    s.font = fontCss(font, sz); if (sp) s.letterSpacing = sp + 'px'; s.fillText(str, 0, 0); });
  return sz;
}
// a typed form: lines[] typed out by `typed` characters so far (Infinity = all). (x, y) top-left, w wide.
function form(x, y, w, lines, { typed = Infinity, title = 'FORM WGT-89', size = 30, rot = 0, h = null } = {}) {
  const hh = h ?? (size * 1.6 * (lines.length + 2.4));
  withT(() => { s.translate(x, y); s.rotate(rot);
    shape([[0, 0], [w, 0], [w, hh], [0, hh]], CREAM, 2.5);
    text(title, w - 14, size * .9, size * .55, { font: 'sign', align: 'right', max: w - 28 });
    s.globalAlpha = .35; for (let i = 0; i < lines.length + 1; i++) ink([[size * .6, size * 2.25 + i * size * 1.6], [w - size * .6, size * 2.25 + i * size * 1.6]], 1); s.globalAlpha = 1;
    let left = typed;
    lines.forEach((l, i) => { if (left <= 0) return; const shown = l.slice(0, Math.max(0, Math.floor(left))); left -= l.length; text(shown, size * .7, size * 2.05 + i * size * 1.6, size, { align: 'left', max: w - size * 1.4, fitTo: l }); });
  });
}
// a rubber stamp: comes down at t0, leaves its ink. (x, y) centre of the imprint.
function stamp(t, t0, x, y, word, { size = 90, color = ROSE, rot = -.12 } = {}) {
  if (t < t0 - .35) return;
  const down = t < t0 ? ease.in(inv(t0 - .35, t0, t)) : 1, lift = ease.out(inv(t0 + .08, t0 + .45, t));
  if (t >= t0) withT(() => { s.translate(x, y); s.rotate(rot); s.globalAlpha = .85; const w = textWidth(word, size, 'stamp');
    s.lineWidth = size * .08; s.strokeStyle = color; s.strokeRect(-w / 2 - size * .3, -size * .95, w + size * .6, size * 1.25);
    text(word, 0, 0, size, { font: 'stamp', color }); });
  const hy = y - size * .6 - (1 - down) * 500 - lift * 600; // the stamp itself, a brass handle
  if (lift < 1) withT(() => { s.translate(x, hy); s.rotate(rot); const w = textWidth(word, size, 'stamp') + size * .6;
    shape([[-w / 2, 0], [w / 2, 0], [w / 2, -size * .35], [-w / 2, -size * .35]], '#3a382f', 2.5);
    shape([[-size * .25, -size * .35], [size * .25, -size * .35], [size * .18, -size * 1.4], [-size * .18, -size * 1.4]], BRASS, 2.5);
    s.beginPath(); s.arc(0, -size * 1.6, size * .38, 0, TAU); s.fillStyle = BRASS; s.fill(); s.lineWidth = 2.5; s.strokeStyle = INK; s.stroke(); });
}
// a split-flap board: str flips into place letter by letter from t0 (each cell rattles ~.4 s)
function splitFlap(t, t0, str, x, y, cell, { cols = null, color = AMBER, bg = '#1f201c', prev = '' } = {}) {
  const n = cols ?? str.length, cw = cell * .72, ch = cell;
  for (let i = 0; i < n; i++) {
    const cx = x + i * (cw + cell * .08), want = str[i] || ' ', from = prev[i] || ' ';
    const ti = t - t0 - i * .04; const k = clamp(ti / .22);
    const glyph = ti < 0 ? from : (k >= 1 ? want : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(hash(i * 97 + Math.floor(ti * 30)) * 36)]);
    shape([[cx, y], [cx + cw, y], [cx + cw, y + ch], [cx, y + ch]], bg, 1.5);
    line([[cx, y + ch / 2], [cx + cw, y + ch / 2]], '#000', 2);
    if (glyph !== ' ') text(glyph, cx + cw / 2, y + ch * .8, ch * .78, { font: 'sign', color });
  }
}
// a typewriter, front view. (x, y) = front-bottom centre; sc = width px. key = 0..1 which key bar is up;
// paper = optional {lines, typed} rolled into it.
function typewriter(x, y, sc, { strike = 0, paper = null } = {}) {
  const k = sc / 400;
  if (paper) form(x - 150 * k, y - 330 * k - (paper.scroll || 0) * k, 300 * k, paper.lines, { typed: paper.typed, size: 22 * k, title: paper.title ?? 'FORM WGT-89', h: 260 * k });
  // platen: a black roller across the top with a knob at each end, the paper feeding out of it
  shape([[x - 215 * k, y - 236 * k], [x + 215 * k, y - 236 * k], [x + 215 * k, y - 200 * k], [x - 215 * k, y - 200 * k]], '#1b1a17', 3);
  for (const sx of [-1, 1]) { s.beginPath(); s.ellipse(x + sx * 232 * k, y - 218 * k, 18 * k, 26 * k, 0, 0, TAU); s.fillStyle = '#2e2d28'; s.fill(); s.lineWidth = 3; s.strokeStyle = INK; s.stroke(); }
  line([[x - 240 * k, y - 250 * k], [x - 300 * k, y - 290 * k]], INK, 7 * k); dot(x - 300 * k, y - 290 * k, 9 * k, STEEL); // return lever
  // the shell: a rounded hood over the type basket
  s.beginPath(); s.moveTo(x - 205 * k, y - 60 * k); s.lineTo(x - 190 * k, y - 160 * k); s.quadraticCurveTo(x, y - 215 * k, x + 190 * k, y - 160 * k); s.lineTo(x + 205 * k, y - 60 * k); s.closePath();
  s.fillStyle = '#26251f'; s.fill(); s.lineWidth = 3; s.strokeStyle = INK; s.stroke();
  // the type basket window: a fan of bars resting in a half-moon
  withT(() => { s.beginPath(); s.ellipse(x, y - 160 * k, 120 * k, 42 * k, 0, 0, Math.PI); s.fillStyle = '#111'; s.fill();
    for (let i = 0; i < 15; i++) { const a = Math.PI * (.08 + .84 * i / 14); ink([[x + Math.cos(a) * 112 * k, y - 160 * k + Math.sin(a) * 38 * k], [x + Math.cos(a) * 40 * k, y - 160 * k + Math.sin(a) * 12 * k]], 2 * k); } });
  if (strike > 0) { const u = Math.sin(Math.PI * clamp(strike)); ink([[x, y - 150 * k], [x, y - 150 * k - u * 60 * k]], 5 * k); }
  // the keyboard: four stepped rows of round keys on stalks
  shape([[x - 205 * k, y - 60 * k], [x + 205 * k, y - 60 * k], [x + 225 * k, y], [x - 225 * k, y]], '#33312a', 3);
  for (let r = 0; r < 4; r++) for (let i = 0; i < 11 - (r === 3 ? 1 : 0); i++) {
    const kx = x - 175 * k + (i + (r % 2) * .5) * 34 * k, ky = y - 150 * k + r * 32 * k + 40 * k;
    ink([[kx, ky], [kx, ky + 14 * k]], 3 * k);
    dot(kx, ky, 13 * k, '#c9c7bd'); dot(kx, ky, 10 * k, CREAM); s.lineWidth = 1.6; s.strokeStyle = INK; s.beginPath(); s.arc(kx, ky, 13 * k, 0, TAU); s.stroke();
  }
  shape([[x - 110 * k, y - 18 * k], [x + 110 * k, y - 18 * k], [x + 110 * k, y - 6 * k], [x - 110 * k, y - 6 * k]], CREAM, 2); // space bar
  // the maker's name on a brass badge on the hood, above the type basket
  shape([[x - 62 * k, y - 206 * k], [x + 62 * k, y - 206 * k], [x + 56 * k, y - 186 * k], [x - 56 * k, y - 186 * k]], BRASS, 1.5);
  text('MINISTRY', x, y - 191 * k, 13 * k, { font: 'sign', color: '#2a261f', spacing: 2 * k, max: 104 * k });
}
// her: the typist across the hall. Side on, seated at a desk (seated: true) or standing/walking like man().
// Hair up in a bun, grey uniform; `rose` 0..1 tints her collar and cheeks (the one warm colour she carries).
function woman(x, z, { ph = 0, walk = 0, face = -1, seated = false, arm = 0, rose = 0, look = 0 } = {}) {
  const b = P(x, FL, z), k = b[2], sw = Math.sin(ph * TAU) * .28 * walk;
  const hipY = seated ? b[1] - .52 * k : b[1] - .92 * k, hip = [b[0], hipY];
  if (seated) { ink([hip, [hip[0] + .45 * k * face, hipY], [hip[0] + .48 * k * face, b[1]]], .11 * k); }
  else for (const a of [-sw, sw]) ink([hip, [hip[0] + Math.sin(a) * .5 * k * face, hip[1] + .48 * k], [hip[0] + Math.sin(a) * .85 * k * face, b[1]]], .1 * k);
  const sh = hipY - .55 * k, bob = Math.abs(Math.sin(ph * TAU)) * .03 * k * walk;
  // dress: fitted top, a skirt that flares to the knee
  shape([[b[0] - .2 * k, sh + bob], [b[0] + .18 * k, sh + bob], [b[0] + .16 * k, hipY], [b[0] + (seated ? .5 : .32) * k * face, hipY + (seated ? .05 : .38) * k], [b[0] - .3 * k * face, hipY + (seated ? .1 : .38) * k], [b[0] - .18 * k, hipY]], '#77756a', 2);
  if (rose > 0) { s.globalAlpha = rose; shape([[b[0] - .12 * k, sh + bob], [b[0] + .12 * k, sh + bob], [b[0], sh + .1 * k + bob]], ROSE, 1.5); s.globalAlpha = 1; }
  const hx = b[0] + .03 * k * face + look * .02 * k * face, hy = sh - .2 * k + bob;
  ink([[b[0], sh + bob], [hx, hy + .06 * k]], .07 * k);
  dot(hx, hy, .115 * k, SKIN); s.lineWidth = 1.8; s.strokeStyle = INK; s.beginPath(); s.arc(hx, hy, .115 * k, 0, TAU); s.stroke();
  dot(hx + .1 * k * face, hy + .015 * k, .022 * k, SKIN);
  if (rose > 0) { s.globalAlpha = rose * .6; dot(hx + .05 * k * face, hy + .03 * k, .035 * k, ROSE); s.globalAlpha = 1; }
  s.beginPath(); s.arc(hx - .02 * k * face, hy - .03 * k, .125 * k, Math.PI * .9, Math.PI * 2.1); s.fillStyle = '#2d2a24'; s.fill(); // hair
  dot(hx - .12 * k * face, hy - .1 * k, .07 * k, '#2d2a24'); s.beginPath(); s.arc(hx - .12 * k * face, hy - .1 * k, .07 * k, 0, TAU); s.stroke(); // bun
  const shp = [b[0] + .02 * k * face, sh + .08 * k + bob], ang = lerp(sw * .8, -1.5, arm) * face;
  const el = [shp[0] + Math.sin(ang) * .3 * k, shp[1] + Math.cos(ang) * .3 * k], hand = [el[0] + Math.sin(ang * 1.1 + (seated ? .9 * face : 0)) * .28 * k, el[1] + Math.cos(ang * 1.1) * .28 * k];
  ink([shp, el, hand], .08 * k); dot(hand[0], hand[1], .04 * k, SKIN);
  return { hand, head: [hx, hy] };
}
// a desk with a typewriter on it, side on, for her. (x, z) = desk centre on the floor.
function desk(x, z, face = -1) {
  const b = P(x, FL, z), k = b[2], top = P(x, .85, z)[1];
  shape([[b[0] - .6 * k, top], [b[0] + .6 * k, top], [b[0] + .6 * k, top + .06 * k], [b[0] - .6 * k, top + .06 * k]], '#5d5a4c', 2);
  ink([[b[0] - .55 * k, top], [b[0] - .55 * k, b[1]]], .05 * k); ink([[b[0] + .55 * k, top], [b[0] + .55 * k, b[1]]], .05 * k);
  shape([[b[0] - .25 * k, top], [b[0] + .25 * k, top], [b[0] + .2 * k, top - .2 * k], [b[0] - .22 * k, top - .2 * k]], '#2e2d28', 1.8);
  shape([[b[0] - .14 * k, top - .2 * k], [b[0] + .14 * k, top - .2 * k], [b[0] + .12 * k, top - .42 * k], [b[0] - .12 * k, top - .42 * k]], CREAM, 1.4);
}

// ---- his guitar case: ONE shape and size everywhere (Robin, 2026-10-02) ----
// 1.0 m long, body (lower bout) 0.38 m wide, waist 0.3, upper bout 0.32, neck 0.17. Unit outline below is
// horizontal with the body at -x and the neck at +x, centred on the origin.
const CASE_COL = '#2b2924';
const CASE_PTS = (() => {
  const top = [[-.5, 0], [-.49, -.12], [-.42, -.19], [-.3, -.19], [-.18, -.15], [-.08, -.16], [.04, -.15], [.14, -.11], [.22, -.085], [.47, -.085], [.5, -.05]];
  let pts = [...top, ...top.slice().reverse().map(([x, y]) => [x, -y])];
  for (let it = 0; it < 3; it++) pts = pts.flatMap((p, i) => { const q = pts[(i + 1) % pts.length]; return [[p[0] * .75 + q[0] * .25, p[1] * .75 + q[1] * .25], [p[0] * .25 + q[0] * .75, p[1] * .25 + q[1] * .75]]; }); // smooth (Chaikin)
  return pts;
})();
// (cx, cy) centre in screen px; k = px per metre at its depth; rot = radians (0 horizontal, body behind
// when dir = 1 means neck toward +x); dir -1 flips it; fore 0..1 foreshortens its length (seen end on);
// line false fills it as a flat silhouette.
function guitarCase(cx, cy, k, { rot = 0, dir = 1, fore = 1, col = CASE_COL, line: outline = true } = {}) {
  const pts = CASE_PTS.map(([x, y]) => { const px = x * dir * fore * k, py = y * k; return [cx + px * Math.cos(rot) - py * Math.sin(rot), cy + px * Math.sin(rot) + py * Math.cos(rot)]; });
  if (outline) shape(pts, col, Math.max(1, k * .012)); else poly(pts, col);
  if (outline && fore > .5) { // the handle, on the top edge at the waist
    const hx = -.1 * dir * fore * k, hy = -.16 * k, h = (x, y) => [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)];
    line([h(hx - .05 * k, hy), h(hx - .04 * k, hy - .05 * k), h(hx + .04 * k, hy - .05 * k), h(hx + .05 * k, hy)], col, Math.max(1.5, k * .018));
  }
}
// carried in the far hand at his side: the handle at the hand, the body trailing behind him
function carriedCase(b, k, face, sw = 0) { guitarCase(b[0] - .12 * k * face + sw * .1 * k, b[1] - .45 * k, k, { dir: face }); }
// set down: standing on its body end, leaning on the chair at (x, z)
function restingCase(x, z) { const g = P(x, FL, z), k = g[2]; guitarCase(g[0] + .05 * k, g[1] - .5 * k, k, { rot: -Math.PI / 2 + .1 }); }

// ---- a typing hand, seen from above the keyboard (Robin: "can't we figure out some better hands?") ----
// (x, y) = the back of the hand; side -1 = her left hand, 1 = her right; sc = size (1 is ~a 130 px hand).
// press 0..1 = how far the pressing finger is down; finger = which of the four (0 = little finger).
function typingHand(x, y, side, sc = 1, { press = 0, finger = 1, sleeve = '#77756a', cuff = ROSE } = {}) {
  const R = (px, py, a = -side * .38) => [x + (px * Math.cos(a) - py * Math.sin(a)) * sc, y + (px * Math.sin(a) + py * Math.cos(a)) * sc]; // tilted in toward the other hand
  const capsule = (x0, y0, x1, y1, w) => { const pts = [], ang = Math.atan2(y1 - y0, x1 - x0);
    for (let i = 0; i <= 8; i++) { const a = ang - Math.PI / 2 + Math.PI * i / 8; pts.push([x1 + Math.cos(a) * w, y1 + Math.sin(a) * w]); }
    for (let i = 0; i <= 8; i++) { const a = ang + Math.PI / 2 + Math.PI * i / 8; pts.push([x0 + Math.cos(a) * w, y0 + Math.sin(a) * w]); }
    return pts.map(([px, py]) => R(px, py)); };
  const crease = mix_(SKIN, '#3a2a20', .35), shade = mix_(SKIN, '#3a2a20', .18);
  // the forearm comes up from below along the hand's axis, so it reads as her arm reaching in
  shape([R(-46, 60), R(46, 60), R(64, 520), R(-64, 520)], sleeve, 2);
  shape([R(-50, 38), R(50, 38), R(54, 78), R(-54, 78)], cuff, 1.8);
  // fingers, from the back of the hand, curling down onto the keys: we see the backs, the tips tuck under
  const lens = [34, 44, 47, 40];
  for (let i = 0; i < 4; i++) {
    const fx = (i - 1.5) * 21 * -side, len = lens[side < 0 ? 3 - i : i] * (1 - (i === finger ? press * .3 : 0)), dip = i === finger ? press * 8 : 0;
    shape(capsule(fx, -6, fx * 1.06, -6 - len + dip, 10.5), SKIN, 1.4);
    const k1 = R(fx * 1.05, -6 - len * .62 + dip), k2 = R(fx * 1.05 + 7, -6 - len * .62 + dip); line([[k1[0] - 6 * sc, k1[1]], [k2[0], k2[1]]], crease, 1.3 * sc);   // the bend
    const tip = R(fx * 1.06, -6 - len + dip + 3); s.globalAlpha = .5; dot(tip[0], tip[1], 7 * sc, shade); s.globalAlpha = 1;                      // tip curling away
  }
  shape(capsule(-side * 40, 16, -side * 62, 2 + press * 3, 11), SKIN, 1.4);   // thumb, on the inside, toward the space bar
  const back = []; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; back.push(R(Math.cos(a) * 46, Math.sin(a) * 36 + 12)); }
  shape(back, SKIN, 1.6);
  for (let i = 0; i < 3; i++) { const kx = (i - 1) * 21 * -side; line([R(kx - 5, -12), R(kx + 5, -13)], crease, 1.3 * sc); }   // knuckles
}

function mix_(c, to, k) { const h = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); const a = h(c), b = h(to); return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',')})`; }

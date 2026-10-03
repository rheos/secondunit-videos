// LOOK TEST: the ministry. 13.0 - 58.0 ("put on hold" through "for our lips to meet").
// Brazil's ideas, none of its scenes: a 1940s office grown into a machine (ducts, tubes, numbers),
// a man made small and kept waiting, and the sky as the only colour in the world.
// Drawing model: ink line over flat greys on cream; the shader boils the line on twos, lays it on
// newsprint, crushes everything but the sky toward grey, and slips the print register a hair.
const LOOK = {
  span: [13.0, 58.0],
  frag: `
uniform float boil, sky;
void main(){
  vec2 q = uv + fbm2(uv * vec2(14., 8.) + tq * 3.1) * .0011 * boil;      // the line re-drawn on twos
  vec3 c = texture(src, q).rgb;
  vec3 cr = texture(src, q + vec2(.0009, .0004)).rgb;                    // slipped register on the red plate
  c.r = mix(c.r, cr.r, .6);
  float lum = dot(c, vec3(.3, .59, .11));
  float blue = smoothstep(.04, .2, c.b - max(c.r, c.g));                // the sky keeps its colour
  c = mix(mix(vec3(lum), c, .32), c, blue * sky);
  float fib = vn(uv * res * .25) * .5 + vn(uv * res * .06 + 3.) * .5;
  vec3 paper = vec3(.95, .925, .86) * (.95 + .05 * fib);
  c *= paper / vec3(.95);
  c *= .93 + .07 * vn(uv * res * .9 + tq * 91.);                         // grain, on twos
  vec2 v = (uv - .5) * vec2(1., .7); c *= 1. - dot(v, v) * .55;
  o = vec4(c, 1.);
}`,
  uniforms: (t, X) => ({ boil: X.boil ?? 1, sky: X.sky ?? 1 }),
};

(() => {
  const INK = '#22221e', CREAM = '#e6dfc6', STEEL = '#7f8b8e', STEEL_D = '#59646a', GREEN = '#88917f', GREEN_D = '#646d5f';
  const BRASS = '#a88a4c', AMBER = '#f0b23a', SKIN = '#c9a888', COAT = '#6a6658', HAT = '#3e3c35';
  const SKY_T = '#3f7fc4', SKY_B = '#a9d3f0';

  // ---- one-point perspective: eye at y 0, floor y 1.6, ceiling y -2.6, walls x ±7, far wall z 70 ----
  let C = { x: 0, y: 0, z: 0, f: 820, vy: 470 };
  const cam = (o) => { C = { x: 0, y: 0, z: 0, f: 820, vy: 470, ...o }; };
  const P = (x, y, z) => { const k = C.f / Math.max(.05, z - C.z); return [W / 2 + (x - C.x) * k, C.vy + (y - C.y) * k, k]; };
  const FL = 1.6, CE = -2.6, WX = 7, FAR = 70;
  const ink = (pts, w = 2.5) => line(pts, INK, w);
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
      const n = P(WX, -.15, z + .7); s.fillStyle = INK; s.font = `${Math.round(n[2] * .28)}px "American Typewriter", Courier, serif`; s.textAlign = 'center'; s.fillText(String(400 + z * 3), n[0], n[1]);
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
    s.font = `${Math.round(a[2] * .32)}px Futura, "Gill Sans", sans-serif`; s.fillText('NOW SERVING', (a[0] + b[0]) / 2, a[1] + (b[1] - a[1]) * .38);
    s.font = `bold ${Math.round(a[2] * .62)}px Futura, "Gill Sans", sans-serif`; s.fillText(num, (a[0] + b[0]) / 2, a[1] + (b[1] - a[1]) * .86);
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
    shape([[top[0] - .25 * k, top[1] - .5 * k], [top[0] + .25 * k, top[1] - .5 * k], [top[0] + .25 * k, top[1]], [top[0] - .25 * k, top[1]]], BRASS, 2.5);
    shape([[top[0] - .12 * k, top[1] - .2 * k], [top[0] + .12 * k, top[1] - .2 * k], [top[0] + .12 * k, top[1] - .16 * k], [top[0] - .12 * k, top[1] - .16 * k]], INK, 1);
    s.fillStyle = INK; s.font = `${Math.round(k * .09)}px Futura, sans-serif`; s.textAlign = 'center'; s.fillText('TAKE A NUMBER', top[0], top[1] - .32 * k);
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
    if (mine) { // the guitar case leans on his chair
      const g = P(x + .5, FL, z - .1); shape([[g[0], g[1]], [g[0] + .18 * k, g[1]], [g[0] + .3 * k, g[1] - .95 * k], [g[0] + .1 * k, g[1] - 1.0 * k]], '#2b2924', 1.6);
    }
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
    shape([[b[0] - .26 * k, sh + bob], [b[0] + .22 * k, sh + bob], [b[0] + .34 * k * face, b[1] - .45 * k], [b[0] - .34 * k * face, b[1] - .45 * k]], COAT, 2);
    hatch([[b[0] - .26 * k * face, sh + bob], [b[0] - .02 * k * face, sh + bob], [b[0] - .04 * k * face, b[1] - .45 * k], [b[0] - .34 * k * face, b[1] - .45 * k]], .9, 6, 1, .4);
    // head and hat
    const hx = b[0] + .04 * k * face, hy = b[1] - H1 + .14 * k + bob;
    dot(hx, hy, .12 * k, SKIN); s.lineWidth = 1.8; s.strokeStyle = INK; s.beginPath(); s.arc(hx, hy, .12 * k, 0, TAU); s.stroke();
    dot(hx + .1 * k * face, hy + .01 * k, .025 * k, SKIN);
    s.beginPath(); s.ellipse(hx, hy - .09 * k, .24 * k, .045 * k, 0, 0, TAU); s.fillStyle = HAT; s.fill(); s.stroke();
    shape([[hx - .13 * k, hy - .09 * k], [hx + .13 * k, hy - .09 * k], [hx + .11 * k, hy - .27 * k], [hx - .11 * k, hy - .27 * k]], HAT, 1.6);
    // far arm carries the case; near arm swings or reaches
    const ca = [b[0] - .05 * k * face + sw * .1 * k, b[1] - .62 * k];
    shape([[ca[0] - .12 * k, ca[1]], [ca[0] + .9 * k * -face * .1 + .12 * k, ca[1]], [ca[0] + .15 * k, ca[1] + .45 * k], [ca[0] - .15 * k, ca[1] + .45 * k]].map(([px, py]) => [px - .3 * k * face, py]), '#2b2924', 1.6);
    const shp = [b[0] + .02 * k * face, sh + .12 * k + bob];
    const ang = lerp(sw * .8, -1.9, arm) * face; const el = [shp[0] + Math.sin(ang) * .36 * k * face * face, shp[1] + Math.cos(ang) * .36 * k];
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

  // ---- shots ----
  // 13.0  the hall. He comes in from the left with his case, past the hold-music horn, to the number machine.
  function hall(t, lt) {
    cam({ z: kf(t, [[13, -1.2], [27.4, .6]], ease.sine), y: -.15, vy: 480 });
    room(t); duct(-3.6, -2.1, .5, 0, FAR); duct(2.8, -2.25, .32, 0, FAR, STEEL_D); tube(t); board(t);
    rows(t, 2.2, 8); horn(t); clock(t, -6.95 + .01, -1.0, 16); ticketBox();
    const x = kf(t, [[13.6, -5.2], [22.8, 3.0]], (k) => k), walking = t < 22.8 && t > 13.6;
    man(x, 5.6, { ph: (t - 13.6) * .95, walk: walking ? 1 : 0, face: 1, arm: smooth(inv(24.5, 26.2, t)) * (1 - smooth(inv(26.6, 27.3, t))) });
  }
  // 27.55 "told me to take a seat": closer. Ticket out, he crosses to the empty chair and becomes one of them.
  function seat1(t, lt) {
    cam({ x: 1.9, z: kf(t, [[27.4, 1.2], [39.5, 2.6]], ease.sine), y: -.25, f: 1100, vy: 500 });
    room(t); duct(-3.6, -2.1, .5, 0, FAR); duct(2.8, -2.25, .32, 0, FAR, STEEL_D); tube(t); board(t);
    const sat = t >= 30.4;
    rows(t, 2.2, 8, 0); if (sat) seat(2.2, 8, 'me', true);
    clock(t, -6.95, -1.0, 16); ticketBox();
    if (!sat) {
      const k = inv(28.2, 30.4, t), x = lerp(3.0, 2.2, k), z = lerp(5.6, 7.9, k);
      man(x, z, { ph: (t - 28.2) * 1.1, walk: t > 28.2 ? 1 : 0, face: -1, arm: t < 28.2 ? 1 - smooth(inv(27.6, 28.2, t)) : 0, ticket: t > 27.8 });
    }
  }
  // 39.55 "but I can't wait until tomorrow": his ticket against the board, then up to the one high window.
  function wait1(t, lt) {
    const pan = ease.inOut(inv(41.4, 43.4, t)) * 1500;
    withT(() => {
      s.translate(0, pan);
      s.fillStyle = '#8f9886'; s.fillRect(-100, -1800, W + 200, 3200);
      for (let y = -1680; y < 1100; y += 120) for (let x = 0; x < W; x += 240) { s.globalAlpha = .5; ink([[x, y], [x + 240, y]], 1.2); ink([[x + (y / 120 % 2 ? 120 : 0), y], [x + (y / 120 % 2 ? 120 : 0), y + 120]], 1.2); s.globalAlpha = 1; }
      // the board, blurred behind
      withT(() => { s.globalAlpha = .55; shape([[980, 120], [1780, 120], [1780, 470], [980, 470]], BRASS, 4); shape([[1010, 150], [1750, 150], [1750, 440], [1010, 440]], '#1f201c', 2);
        s.fillStyle = AMBER; s.textAlign = 'center'; s.font = 'bold 210px Futura, sans-serif'; s.fillText('0002', 1380, 410); });
      // his gloved hand and the ticket, sharp in front
      withT(() => {
        s.translate(560 + Math.sin(t * 1.3) * 6, 760 + Math.sin(t * 2.1) * 4); s.rotate(-.12);
        shape([[-60, -150], [330, -170], [345, 120], [-40, 140]], CREAM, 3);
        s.fillStyle = INK; s.textAlign = 'center'; s.font = '34px "American Typewriter", Courier, serif'; s.fillText('MINISTRY OF WAITING', 140, -95);
        s.font = 'bold 92px "American Typewriter", Courier, serif'; s.fillText('7 436 912', 140, 20);
        s.font = '26px "American Typewriter", Courier, serif'; s.fillText('PLEASE REMAIN SEATED', 140, 85);
        for (let i = 0; i < 9; i++) dot(-40, -125 + i * 30, 6, '#8f9886');   // the perforation
        shape([[-420, 120], [-150, 20], [-100, 260], [-420, 330]], COAT, 3);                  // coat sleeve
        hatch([[-420, 200], [-130, 120], [-100, 260], [-420, 330]], .9, 9, 1.4, .45);
        s.beginPath(); s.ellipse(-110, 70, 120, 95, -.35, 0, TAU); s.fillStyle = '#3a382f'; s.fill(); s.lineWidth = 3; s.strokeStyle = INK; s.stroke();   // gloved fist
        s.beginPath(); s.ellipse(-5, 30, 70, 30, -.2, 0, TAU); s.fillStyle = '#3a382f'; s.fill(); s.stroke();     // thumb on the ticket
        ink([[-150, 40], [-60, 20]], 2); ink([[-160, 85], [-70, 70]], 2);
      });
      // up the wall: one small high window, and the sky in it
      withT(() => {
        const wx = 360, wy = -1180, ww = 300, wh = 360;
        s.fillStyle = vgrad(wy, wy + wh, [[0, SKY_T], [1, SKY_B]]); s.fillRect(wx, wy, ww, wh);
        withT(() => { s.beginPath(); s.rect(wx, wy, ww, wh); s.clip(); cloud(wx + 60 + (t - 41) * 22, wy + 170, 60, 4); });
        s.lineWidth = 14; s.strokeStyle = INK; s.strokeRect(wx, wy, ww, wh);
        ink([[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], 8);
        ink([[wx, wy + wh / 2], [wx + ww, wy + wh / 2]], 7);
        shape([[wx - 30, wy + wh], [wx + ww + 30, wy + wh], [wx + ww + 40, wy + wh + 30], [wx - 40, wy + wh + 30]], '#6b6a5a', 3);
      });
    });
  }
  // 43.78 "we've got time": he stands in his row, the roof tears open on the first "time", wider on
  // the second, and every form in the room goes up. 51.67 "for our lips to meet": his ticket folds into a plane.
  function roof(t, lt) {
    cam({ x: .6, z: kf(t, [[43.75, 2.0], [58, -1.0]], ease.sine), y: kf(t, [[43.75, -.3], [58, .4]], ease.sine), f: 860, vy: kf(t, [[43.75, 480], [58, 640]], ease.sine) });
    room(t); duct(-3.6, -2.1, .5, 0, FAR); duct(2.8, -2.25, .32, 0, FAR, STEEL_D); tube(t); board(t, '0003');
    const open = .18 * ease.back(inv(44.96, 45.6, t)) + .3 * ease.back(inv(47.9, 48.7, t)) + .25 * ease.out(inv(51.6, 56, t));
    skyHole(t, open);
    rows(t, 2.2, 8);
    // he stands up out of his row
    const up = ease.out(inv(43.8, 44.6, t));
    if (up > 0) { const b = P(2.2, FL, 8); seat(2.2, 8, null); withT(() => { s.translate(0, (1 - up) * .6 * b[2]); man(2.2, 8, { face: -1, arm: smooth(inv(51.2, 51.7, t)) * (1 - smooth(inv(52.2, 52.6, t))), ticket: t < 51.7 }); }); }
    papers(t, 47.9);
    // the paper plane, out of his hand and up through the hole
    if (t >= 51.67) {
      const lt2 = t - 51.67, b = P(2.2, -.4, 8);
      const x = b[0] - lt2 * 120 + Math.sin(lt2 * 1.4) * 70, y = b[1] - lt2 * 150 - lt2 * lt2 * 8;
      withT(() => { s.translate(x, y); s.rotate(-.5 + Math.sin(lt2 * 1.4) * .25); const sc = Math.max(.35, 1 - lt2 * .12);
        s.scale(sc, sc); shape([[0, 0], [-120, -22], [-90, 0], [-120, 26]], CREAM, 2.5); ink([[0, 0], [-90, 0]], 1.5); });
    }
  }

  chapter('ministry', 13.0, 58.0, [[13.0, hall], [27.55, seat1], [39.55, wait1], [43.75, roof]]);
})();

// The world and the one character of "dream of fire": The Wyrd One, his wolfdog, the smoke serpent,
// the Sonoran desert. Everything is in WORLD coords: a 1920 x 1920 stage centred on (960, 960).
// 9:16 sees x 420..1500 at zoom 1, 16:9 sees y 420..1500: keep what matters inside the central
// 1080 x 1080 square (SAFE) and paint the stage out to the full 1920 in both directions.

const STAGE = 1920, SC = 960;
const SAFE = { x0: 420, x1: 1500, y0: 420, y1: 1500 };
// frame(cx, cy, zoom, rot): camera on a world point. zoomV / zoomL let one shot frame each format.
function frame(cx = SC, cy = SC, zoom = 1, rot = 0) { cam(cx, cy, zoom, rot); }

// ---- section looks: paint settings + grade (see js/paint.js). Spread into a chapter's paint. ----
const LOOK = {
  // intro: scratchboard ink night (his board #19) with the smoke-serpent moon (#18)
  ink: { boil: 7, bloom: 1.3, flowK: .9, grain: .10, vig: .6, etch: .92, sat: .2, con: 1.15, lift: 0, scratch: .15, dust: .5, weave: .6, flick: .03 },
  // verse 1: sepia worn-film oil in fog (#25)
  sepia: { boil: 8, bloom: 1.0, flowK: 1.1, grain: .16, vig: .7, sat: .35, tint: [1, .8, .56], tintK: .75, con: 1.05, lift: .06, scratch: .8, dust: 1, burn: .55, weave: 1.4, flick: .07 },
  // verse 2: rock-wall painting on sandstone in hard daylight (#15-17)
  rock: { boil: 6, bloom: 1.1, flowK: .7, strokeK: 1.15, grain: .12, vig: .5, sat: .85, tint: [1, .72, .48], tintK: .2, con: 1.12, lift: .03, scratch: .25, dust: .4, burn: .2, weave: .5, flick: .02 },
  // pre-hook + hook: blazing sunrise / sunset oil (#26)
  sunset: { boil: 10, bloom: 1.2, flowK: 1.3, strokeK: 1.25, grain: .08, vig: .45, sat: 1.15, con: 1.08, lift: 0, scratch: .05, dust: .1, weave: .4, flick: .02 },
  // second half: the dream plains, indigo night oil (starlight, deep blue, soft warm accents)
  dream: { boil: 7, bloom: 1.4, flowK: 1.15, strokeK: 1.1, grain: .1, vig: .6, sat: .9, tint: [.62, .72, 1], tintK: .25, con: 1.1, lift: .04, scratch: .08, dust: .2, weave: .4, flick: .02 },
  // second half: storm at dawn, silver-grey mono like his storm footage (heavy vignette, grain)
  storm: { boil: 9, bloom: 1.3, flowK: 1.3, grain: .18, vig: .75, sat: .12, tint: [.9, .92, 1], tintK: .15, con: 1.2, lift: .05, scratch: .35, dust: .6, weave: .8, flick: .06 },
  // ending: back to ink, on glowing cracked earth
  cracks: { boil: 8, bloom: 1.8, flowK: 1, grain: .1, vig: .65, etch: .7, sat: .6, con: 1.12, scratch: .12, dust: .4, weave: .6, flick: .04 },
};

// ---- scenery ----
function sky(top, mid, low, horizon, x0 = -600, x1 = STAGE + 600) {
  s.fillStyle = vgrad(s, -600, horizon, [[0, top], [.6, mid], [1, low]]); s.fillRect(x0, -900, x1 - x0, horizon + 900);
}
function ground(y, top, bottom, x0 = -600, x1 = STAGE + 600) { s.fillStyle = vgrad(s, y, y + 1400, [[0, top], [1, bottom]]); s.fillRect(x0, y, x1 - x0, 2400); }
function stars(t, seed, n, x0, x1, y0, y1, a = 1) { const r = rng(seed); for (let i = 0; i < n; i++) { const x = lerp(x0, x1, r()), y = lerp(y0, y1, r()), tw = .55 + .45 * Math.sin(t * (1 + r() * 3) + i); dot(f, x, y, .8 + r() * 2, `rgba(255,244,228,${a * tw * (.3 + .7 * r())})`); } }
function clouds(t, seed, y0, y1, c, n = 8, speed = 6) { const r = rng(seed); s.fillStyle = c; for (let i = 0; i < n; i++) { const x = ((r() * 3200 + t * speed * (.5 + r())) % 3200) - 640, y = lerp(y0, y1, r()), w = 300 + r() * 700, h = 50 + r() * 90; s.beginPath(); s.ellipse(x, y, w / 2, h / 2, 0, 0, TAU); s.fill(); } }
// mesas / buttes: flat tops with steep sides along a horizon
function mesas(y, h, c, seed, x0 = -600, x1 = STAGE + 600) {
  const r = rng(seed); s.fillStyle = c; s.beginPath(); s.moveTo(x0, y + 400);
  let x = x0; s.lineTo(x, y);
  while (x < x1) { const gap = 80 + r() * 260, w = 120 + r() * 420, hh = h * (.35 + r() * .65);
    s.lineTo(x + gap, y); s.lineTo(x + gap + 40, y - hh); s.lineTo(x + gap + w - 40, y - hh * (.95 + r() * .1)); s.lineTo(x + gap + w, y); x += gap + w; }
  s.lineTo(x1, y); s.lineTo(x1, y + 400); s.closePath(); s.fill();
}
function saguaro(x, y, h, c, seed = 1) {
  const r = rng(seed), w = h * .09; taper(s, [x, y], [x, y - h], w, w * .9, c); dot(s, x, y - h, w * .9, c);
  for (const d of [-1, 1]) if (r() > .25) { const ay = y - h * (.35 + r() * .25), ax = x + d * w * 2.4, top = ay - h * (.2 + r() * .25);
    taper(s, [x, ay], [ax, ay], w * .7, w * .7, c); taper(s, [ax, ay], [ax, top], w * .7, w * .65, c); dot(s, ax, top, w * .65, c); }
}
function bush(x, y, sz, c, seed = 1) { const r = rng(seed); for (let i = 0; i < 7; i++) dot(s, x + (r() - .5) * sz * 1.4, y - r() * sz * .6, sz * (.25 + r() * .3), c); }
function fullMoon(x, y, r, lit = 1) {
  glow(x, y, r * 3.2, `rgba(220,230,255,${.16 * lit})`); dot(s, x, y, r, '#e9e3cf');
  const q = rng(7); for (let i = 0; i < 9; i++) dot(s, x + (q() - .5) * r * 1.2, y + (q() - .5) * r * 1.2, r * (.08 + q() * .16), 'rgba(150,145,130,.45)');
  glow(x, y, r * 1.15, `rgba(255,250,235,${.35 * lit})`);
}
// ram skull on the ground, facing camera; sc ~ skull width px
function ramSkull(x, y, sc, bone = P.bone, dark = '#2a211a') {
  for (const d of [-1, 1]) { const pts = []; for (let i = 0; i <= 26; i++) { const a = i / 26 * TAU * .95, rr = sc * (.55 - i / 26 * .28); pts.push([x + d * (sc * .32 + Math.cos(a) * rr * .9), y - sc * .5 + Math.sin(a) * rr]); }
    for (let i = 1; i < pts.length; i++) taper(s, pts[i - 1], pts[i], sc * (.2 - i / pts.length * .12), sc * (.2 - (i + 1) / pts.length * .12), i % 3 ? '#c8b58f' : '#a8946e'); }
  s.fillStyle = bone; s.beginPath(); s.moveTo(x - sc * .3, y - sc * .72); s.quadraticCurveTo(x, y - sc * .86, x + sc * .3, y - sc * .72); s.lineTo(x + sc * .16, y - sc * .05); s.quadraticCurveTo(x, y + sc * .06, x - sc * .16, y - sc * .05); s.fill();
  for (const d of [-1, 1]) dot(s, x + d * sc * .13, y - sc * .5, sc * .07, dark);
  poly(s, [[x - sc * .05, y - sc * .2], [x + sc * .05, y - sc * .2], [x, y - sc * .08]], dark);
}
// stone fire ring with charred logs; lit 0..1 flames
function fireRing(t, x, y, sc, lit = 1, seed = 3) {
  const r = rng(seed);
  for (let i = 0; i < 11; i++) { const a = i / 11 * TAU, sx = x + Math.cos(a) * sc, sy = y + Math.sin(a) * sc * .32, sz = sc * (.16 + r() * .08);
    s.fillStyle = a > Math.PI ? '#6b5f55' : '#8d8175'; s.beginPath(); s.ellipse(sx, sy, sz, sz * .7, 0, 0, TAU); s.fill(); }
  for (let i = 0; i < 3; i++) { const a = i * 1.05 + .3; taper(s, [x - Math.cos(a) * sc * .6, y - sc * .02 + i * 4], [x + Math.cos(a) * sc * .6, y - sc * .12 + i * 3], sc * .07, sc * .06, P.char); }
  if (lit > 0) {
    for (let i = 0; i < 7; i++) ember(t, x + (i - 3) * sc * .12, y - sc * .06, sc * (.5 + .45 * noise1(t * 3 + i * 5, 11)) * lit, { eyes: 0, seed: i + seed * 9, hue: .25 + .1 * (i % 3), lit });
    glow(x, y - sc * .3, sc * 3.2 * lit, `rgba(255,120,40,${.22 * lit})`); glow(x, y - sc * .2, sc * .9 * lit, `rgba(255,220,150,${.6 * lit})`);
  }
}
// rising sparks from a source point (pure function of t)
function sparks(t, x, y, spread, rise, n, a = 1, seed = 5) { for (let i = 0; i < n; i++) { const ph = (t * (.25 + hash(i * 3 + seed) * .35) + hash(i * 7 + seed)) % 1, px = x + (hash(i * 11 + seed) - .5) * spread + Math.sin(t * 2 + i) * 18 * ph, py = y - ph * rise; dot(f, px, py, 1.4 + 2 * (1 - ph), `rgba(255,${150 + 80 * (1 - ph) | 0},70,${a * (1 - ph) * .9})`); } }
// glowing cracks radiating from (x, y) across ground; open 0..1 grows them
function cracks(t, x, y, reach, open, seed = 9, sq = .32) {
  const r = rng(seed);
  for (let k = 0; k < 9; k++) { let px = x, py = y, a = r() * TAU; const pts = [[px, py]], len = reach * (.5 + r() * .5) * open;
    for (let d = 0; d < len; d += 26) { a += (r() - .5) * .9; px += Math.cos(a) * 26; py += Math.sin(a) * 26 * sq; pts.push([px, py]); }
    if (pts.length < 2) continue;
    stroke(s, pts, '#1a0d08', 10 * open); const heat = .5 + .5 * noise1(t * 1.5 + k, 3);
    stroke(f, pts, `rgba(255,${110 + 60 * heat | 0},40,${.75 * open})`, 5 * open); glow(pts[pts.length >> 1][0], pts[pts.length >> 1][1], 90 * open, `rgba(255,110,40,${.18 * open})`); }
}

// ---- the smoke serpent (light layer): a ring of smoke that becomes a rattlesnake ----
// ring 0..1 closes the circle; head drawn at the leading end; a = opacity
function smokeSerpent(t, cx, cy, R, o = {}) {
  const { ring = 1, a = .8, sq = 1, head = 1, rot = 0, col = '235,228,215' } = o;
  const n = 90, end = ring * TAU * .98;
  for (let layer = 0; layer < 3; layer++) for (let i = 0; i < n; i++) {
    const u = i / n * end + rot, w = R * (.07 + .03 * Math.sin(u * 3 + t)) * (1 - i / n * .35);
    const wob = snoise(u * 2 + t * .6 + layer, 4) * R * .05;
    const px = cx + Math.cos(u) * (R + wob), py = cy + Math.sin(u) * (R + wob) * sq;
    glow(px, py, w * (2.4 - layer * .6), `rgba(${col},${a * .08 * (1 + layer)})`);
  }
  if (head > 0 && ring > .1) { const u = end + rot, hx = cx + Math.cos(u) * R, hy = cy + Math.sin(u) * R * sq, tg = u + Math.PI / 2;
    const hw = R * .16 * head; f.save(); f.globalCompositeOperation = 'lighter'; f.translate(hx, hy); f.rotate(tg);
    f.fillStyle = `rgba(${col},${a * .35})`; f.beginPath(); f.moveTo(hw * 1.6, 0); f.quadraticCurveTo(hw * .6, -hw * .9, -hw * .5, -hw * .55); f.quadraticCurveTo(-hw * .9, 0, -hw * .5, hw * .55); f.quadraticCurveTo(hw * .6, hw * .9, hw * 1.6, 0); f.fill(); f.restore();
    for (const d of [-1, 1]) glow(hx + Math.cos(tg + d * .9) * hw * .5, hy + Math.sin(tg + d * .9) * hw * .5, hw * .35, `rgba(255,120,40,${a * head})`); }
}

// ---- the wolfdog: MEDIUM size, lean, pointed ears, bushy tail. His dog, not a husky or giant wolf. ----
// (x, y) ground under the middle; sc = body length px; dir 1 faces right; walk = gait phase (t-driven), sil = silhouette
function wolfdog(t, x, y, sc, o = {}) {
  const { dir = 1, walk = 0, sil = false, fur = '#8a7a66', dark = '#3a3129', g = s, sit = 0, look = 0 } = o;
  const c = sil ? '#0c0a09' : fur, cd = sil ? '#0c0a09' : dark, d = dir, h = sc * .55;
  const leg = (bx, ph, back) => { const sw = Math.sin(walk * TAU + ph) * .35 * (1 - sit); const kx = bx + Math.sin(sw) * h * .45 * d, ky = y - h * .5; taper(g, [bx, y - h * (back ? .95 : .9)], [kx, ky], sc * .06, sc * .045, back ? cd : c); taper(g, [kx, ky], [kx + Math.sin(sw * 1.4) * h * .2 * d, y], sc * .045, sc * .035, back ? cd : c); };
  leg(x - sc * .32 * d, 0, true); leg(x + sc * .3 * d, Math.PI, true);
  g.fillStyle = c; g.beginPath(); g.ellipse(x, y - h * 1.05 + sit * h * .2, sc * .45, h * .28, sit * -.35 * d, 0, TAU); g.fill();
  const tb = [x - sc * .42 * d, y - h * 1.1]; stroke(g, [tb, [tb[0] - sc * .22 * d, tb[1] + h * (.25 + .08 * Math.sin(t * 3))], [tb[0] - sc * .3 * d, tb[1] + h * .6]], c, sc * .09);
  leg(x - sc * .25 * d, Math.PI, false); leg(x + sc * .36 * d, 0, false);
  const nk = [x + sc * .38 * d, y - h * 1.25 + sit * h * .1], hd = [x + sc * (.58 + .04 * look) * d, y - h * 1.52 + sit * h * .05];
  taper(g, nk, hd, sc * .13, sc * .1, c);
  g.save(); g.translate(hd[0], hd[1]); g.scale(d, 1); g.fillStyle = c;
  g.beginPath(); g.moveTo(-sc * .08, -sc * .06); g.lineTo(sc * .22, sc * .02); g.lineTo(sc * .2, sc * .07); g.lineTo(-sc * .08, sc * .09); g.fill();
  poly(g, [[-sc * .06, -sc * .05], [-sc * .02, -sc * .2], [sc * .03, -sc * .04]], c); poly(g, [[sc * .02, -sc * .05], [sc * .07, -sc * .19], [sc * .1, -sc * .03]], c);
  g.restore();
  return { head: hd };
}

// ---- the Odin eye is RARE (Robin): it shows only in these song windows, never elsewhere ----
// [start, end] seconds: "open our eyes" into the hook's first line, and each "wake up".
const EYE_WINDOWS = [[62.0, 66.2], [79.65, 81.5], [86.05, 87.7], [166.1, 169.8]]; // + "eyes like gold" (Robin approved 2026-09-30; the second-half "wake up" stays eye-free)
function eyeGate(t) { let k = 0; for (const [a, b] of EYE_WINDOWS) k = Math.max(k, smooth(inv(a - .15, a + .1, t)) * (1 - smooth(inv(b - .35, b, t)))); return k; }

// ---- THE WYRD ONE ----
// The only character. Wide black leather hat with a braided band; a black see-through VEIL hangs from
// the brim over the whole face (he can see out; you never see face, lips or beard); a LONG TATTERED
// DUSTER to the ankle, its hem shredded into strips that stream in the wind; dark vest, worn cargo
// pants, boots; a green beaded fringe necklace with a small silver medallion; a black Les Paul with
// cream binding. Performance: calm, deep breathing, the head moves with the sung phrasing (vocal
// stem `voc`), never a profile while singing. One ember eye may glow through the veil (Odin), never two.
//
// wyrd(t, x, y, h, o): (x, y) = ground between the boots, h = height hat crown to sole (px, world).
// o.view: 'front' (default; faces camera, 3/4 via o.turn -1..1, keep |turn| <= .5 when singing),
//         'back' (walking away), 'sil' (pure silhouette, any view; for tiny/backlit figures).
// o.guitar: 'play' (held across the body), 'hang' (hanging at his side by the neck), 'none'.
// o.arms: 'guitar' | 'down' | 'out' (arms outstretched, the serpent-ring pose).
// o.sing: 0..1 how much the head phrases with the vocal. o.eye: 0..1 ember eye. o.wind: hem streaming
// (-1..1, + blows to screen right). o.walk: gait phase (0..1, cycles), 0 = standing.
// o.rim: rim-light colour (string) or null. o.lit: 0..1 how much front light reaches the costume.
// Returns joints { head, eye, neck, chest, hipL, hipR, handL, handR, hem } in world coords.
function wyrd(t, x, y, h, o = {}) {
  const { view = 'front', turn = 0, guitar = 'play', arms = 'guitar', sing = 0, wind = .3, walk = 0, rim = 'rgba(255,190,130,.9)', lit = .15, g = s, strum = 1, breath = 1 } = o;
  // the eye is rare: only inside EYE_WINDOWS, whatever a shot asks for
  const eye = (o.eye || 0) * eyeGate(t);
  const playing = guitar === 'play' && o.view !== 'back';
  // his stance (from his live takes): hip-shot, the torso rocking with the music, and when he plays,
  // hunched over a guitar strapped high, head tipped down toward the neck. Never a straight post.
  const groove = o.groove ?? 1, hunch = o.hunch ?? (playing ? 1 : .4);
  const leanK = (o.lean ?? (playing ? -.035 : .015)) + groove * (walk ? 0 : sway(t) * .02 + snoise(t * .35, 23) * .012);
  const sil = view === 'sil' || o.sil, back = view === 'back';
  const shade = (c, k = lit) => sil ? '#07070a' : mixHex('#07070a', c, clamp(.35 + k * .65));
  const u = h / 100; // 100 units tall
  // breathing + singing phrasing (head tilt / lift) from the vocal stem
  const br = Math.sin(t * TAU / 4.2) * .6 * breath;
  const v = sing > 0 ? F('voc', t, 3) : 0, vk = sing * clamp(v * 1.2);
  const nod = sing * (snoise(t * 1.7, 21) * .5 + vk * .8) + groove * hunch * bob(t) * .7, tiltS = sing * snoise(t * .9, 22) * .06 + turn * .05, tilt = tiltS + hunch * (playing ? .16 : .04);
  const gait = walk ? Math.sin(walk * TAU) : 0, bobY = walk ? Math.abs(gait) * -1.2 * u : 0;
  const X = (ux) => x + ux * u, Y = (uy) => y - uy * u + bobY;
  const neckY = 84 + br * .3 + vk * .6 - hunch * 1.2, headY = 90 + br * .35 + vk * 1.1 - nod * .6 - hunch * (playing ? 4 : 2);
  const hx = turn * 3 + tiltS * 30 + hunch * (playing ? .4 : 0); // head x offset (a touch toward the guitar neck when playing)
  const J = {};
  // the whole figure leans as ONE piece, pivoting at the boots (a hip pivot split him in two)
  const hipYw = y + bobY;
  const ctxs = g === f ? [f] : [g, f]; // drawing on the light layer itself: shear it once, not twice
  for (const c of ctxs) { c.save(); c.transform(1, 0, -leanK, 1, leanK * hipYw, 0); }
  const unshear = (p) => p && [p[0] + leanK * (hipYw - p[1]), p[1]];
  // --- the duster: A-line from narrow shoulders to a wide shredded hem at the ankle ---
  // hem strips are the coat's signature: long, uneven, streaming with the wind and the gait
  const hemY = 14, hemW = 21 + Math.abs(wind) * 2;
  const strip = (i, n, front) => { const k = i / (n - 1) - .5, bx = X(k * hemW * 2 * (front ? 1 : .92) + wind * (6 + 5 * k * Math.sign(wind))), by = Y(hemY + (front ? 0 : 2));
    const len = (front ? 6 + 11 * hash(i * 13 + 5) : 4 + 6 * hash(i * 13 + 9)) * u, w0 = (front ? 2.1 + hash(i * 7) * 1.2 : 1.5 + hash(i * 7) * .8) * u;
    const sway = (wind * (7 + 7 * Math.abs(k)) + snoise(t * .8 + i * .41, front ? 31 : 32) * 2.6 + gait * 3 * k) * u;
    const c = front ? shade(i % 3 ? P.coat : P.coatShade) : shade(P.coat, lit * .7);
    const m = [bx + sway * .45, by + len * .5], e = [bx + sway, by + len];
    taper(g, [bx, by - 2 * u], m, w0, w0 * .7, c); taper(g, m, e, w0 * .7, .35 * u, c); };
  for (let i = 0; i < 10; i++) strip(i, 10, false);
  // legs + boots, seen where the duster hangs open
  for (const d of [-1, 1]) { const st = walk ? gait * d * 5 * u : 0, kx = X(d * 4) + st * .5;
    taper(g, [X(d * 4), Y(50)], [kx, Y(27)], 3.4 * u, 2.9 * u, shade(P.pants)); taper(g, [kx, Y(27)], [X(d * 4.4) + st, Y(4)], 2.9 * u, 2.5 * u, shade(P.pants));
    g.fillStyle = shade(P.boot); g.beginPath(); g.ellipse(X(d * 5) + st, Y(1.6), 4 * u, 2.1 * u, 0, 0, TAU); g.fill(); taper(g, [X(d * 4.4) + st, Y(10)], [X(d * 4.7) + st, Y(2)], 2.8 * u, 3 * u, shade(P.boot)); }
  const sh = 10.5 * (1 - Math.abs(turn) * .15); // half shoulder width (narrower than the brim)
  const flare = hemW + wind * 2;
  const panel = (side, c) => { // one side of the open duster: shoulder, sleeve line, flared hem
    const down = side * wind > 0 ? 1 : 0, top = [X(side * 2.6), Y(neckY - 1.5)], shp = [X(side * sh), Y(neckY - 8.5)], hip = [X(side * (sh + .5) + wind * 1.5), Y(48)], hem = [X(side * (flare - 3) + wind * (down ? 12 : 4) + side * down * Math.abs(wind) * 6), Y(hemY + down * Math.abs(wind) * 4)], inHem = [X(side * (back ? 0 : 6.5) + wind * 3), Y(hemY + 1)];
    g.fillStyle = c; g.beginPath(); g.moveTo(top[0], top[1]); g.bezierCurveTo(X(side * 5.5), Y(neckY - 2), X(side * (sh - 1.2)), Y(neckY - 4.5), shp[0], shp[1]);
    g.bezierCurveTo(hip[0], hip[1], hip[0] + side * 1.5 * u + wind * 3 * u, Y(30), hem[0], hem[1]);
    // ragged hem edge between the outer and inner corners
    for (let k = 1; k <= 6; k++) { const q = k / 7; g.lineTo(lerp(hem[0], inHem[0], q), lerp(hem[1], inHem[1], q) + (hash(k * 5 + (side > 0 ? 3 : 0)) - .3) * 2.5 * u); }
    g.lineTo(inHem[0], inHem[1]); g.quadraticCurveTo(X(side * 6), Y(42), X(side * 3.2), Y(neckY - 9)); g.closePath(); g.fill(); };
  if (!back) { g.fillStyle = shade(P.vest); g.beginPath(); g.moveTo(X(-3), Y(neckY - 2.5)); g.lineTo(X(3), Y(neckY - 2.5)); g.lineTo(X(5), Y(50)); g.lineTo(X(-5), Y(50)); g.fill(); }
  panel(-1, shade(turn > 0 ? P.coat : P.coatShade, lit)); panel(1, shade(turn > 0 ? P.coatShade : P.coat, lit));
  if (back) { g.fillStyle = shade(P.coat); g.beginPath(); g.moveTo(X(-sh), Y(neckY - 4)); g.quadraticCurveTo(X(0), Y(neckY - 2), X(sh), Y(neckY - 4)); g.lineTo(X(flare), Y(hemY)); g.lineTo(X(-flare), Y(hemY)); g.fill(); }
  for (let i = 0; i < 12; i++) strip(i, 12, true);
  J.hem = [X(0), Y(hemY)];
  // sleeves read against the coat only by value: one step lighter, with a thin rim
  const sleeveC = shade(P.coat, lit + .12);
  // --- arms ---
  const shL = [X(-sh + .8), Y(neckY - 8.5)], shR = [X(sh - .8), Y(neckY - 8.5)];
  let handL, handR;
  if (arms === 'out') { const lift = 6 + br; handL = [X(-sh - 30), Y(neckY - 2 + lift)]; handR = [X(sh + 30), Y(neckY - 2 + lift)];
    for (const [a, b] of [[shL, handL], [shR, handR]]) { const el = [lerp(a[0], b[0], .5), lerp(a[1], b[1], .5) + 1.5 * u]; taper(g, a, el, 3.2 * u, 2.6 * u, sleeveC); taper(g, el, b, 2.6 * u, 1.8 * u, sleeveC); dot(g, b[0], b[1], 1.8 * u, shade(P.skin, lit * .6));
      for (let k = 0; k < 4; k++) taper(g, [el[0] + (k - 1.5) * u, el[1] + 2 * u], [el[0] + (k - 1.5 + wind * 3) * u, el[1] + (7 + k) * u], 1 * u, .3 * u, shade(P.coatShade)); } }
  else if (arms === 'down' || guitar !== 'play') { handL = [X(-sh - 2), Y(44)]; handR = [X(sh + 2), Y(44)];
    for (const [a, b, d] of [[shL, handL, -1], [shR, handR, 1]]) { const el = [a[0] + d * 1.5 * u, Y(60)]; taper(g, a, el, 3.2 * u, 2.7 * u, sleeveC); taper(g, el, b, 2.7 * u, 2 * u, sleeveC); dot(g, b[0], b[1], 1.7 * u, shade(P.skin, lit * .6)); } }
  // --- guitar ---
  if (guitar === 'hang' && !back) { const hb = handR; drawLesPaul(g, hb[0] + 1 * u, hb[1] + 16 * u, 10 * u, -Math.PI / 2 + .12, sil, lit); }
  if (guitar === 'play' && !back) {
    // He plays right-handed (checked against his in-character day take): the body sits at his right
    // hip (screen left), the neck rises steeply to screen right, fretting hand high on the neck.
    const sway = strum ? Math.sin(t * TAU / BEAT) * .03 : 0, ang = -1.02 + sway - turn * .06;
    const body = [X(-3 + turn * 2), Y(44)];
    const dir = [Math.cos(ang), Math.sin(ang)];
    handR = [body[0] + dir[0] * 17 * u, body[1] + dir[1] * 17 * u];              // fretting hand (his left, screen right)
    const pick = strum ? Math.sin(t * TAU / (BEAT / 2)) * 1.4 * u * clamp(F('mid', t, 2) * 1.5) : 0;
    handL = [body[0] + 1 * u, body[1] - 1.5 * u + pick];                          // strumming hand (his right, screen left)
    const elL = [X(-sh - 1), Y(55)], elR = [X(sh + 1.5), Y(55)];
    // layering like a real player: the fretting arm passes BEHIND the neck, then the guitar,
    // then the strumming forearm over the body, then both hands (the fretting hand wraps the neck)
    taper(g, shR, elR, 3.3 * u, 2.8 * u, sleeveC); taper(g, elR, handR, 2.8 * u, 2 * u, sleeveC);
    drawLesPaul(g, body[0], body[1], 10.5 * u, ang, sil, lit);
    taper(g, shL, elL, 3.3 * u, 2.8 * u, sleeveC); taper(g, elL, handL, 2.8 * u, 2 * u, sleeveC);
    for (const hd of [handL, handR]) { dot(g, hd[0], hd[1], 2 * u, shade('#0d0b0a')); dot(g, hd[0] + .8 * u, hd[1] - .4 * u, .9 * u, shade(P.skin, lit * .7)); }
  }
  J.handL = handL; J.handR = handR;
  // --- necklace: green beaded fringe + silver medallion ---
  if (!back && !sil) { const cx = X(hx * .2), cy = Y(neckY - 11);
    stroke(g, bez([X(-3.2), Y(neckY - 2)], [X(-3), Y(neckY - 10)], [X(3), Y(neckY - 10)], [X(3.2), Y(neckY - 2)], 12), shade(P.beadDark, .8), .5 * u);
    dot(g, cx, cy, 1.25 * u, shade(P.bead, .8)); dot(g, cx, cy, .6 * u, shade(P.beadDark, .8));
    for (let k = -2; k <= 2; k++) stroke(g, [[cx + k * .45 * u, cy + 1 * u], [cx + k * .5 * u, cy + (2.6 + (k & 1)) * u]], shade(P.bead, .75), .35 * u);
    dot(g, cx, cy + 4.6 * u, .95 * u, shade(P.medal, .85)); J.chest = [cx, cy]; }
  // --- head, veil, hat ---
  const hc = [X(hx), Y(headY)]; J.head = hc; J.neck = [X(hx * .4), Y(neckY)];
  const hatTilt = tilt + nod * .025;
  g.save(); g.translate(hc[0], hc[1]); g.rotate(hatTilt); g.scale(1.22, 1.22);
  // the veil: black see-through cloth from the brim to below the chin, its hem stirring with breath and song
  const vw = 6.2 * u, vTop = -4.5 * u, vBot = (6.2 + vk * .6) * u;
  const stir = (k) => (snoise(t * 1.3 + k * 2.1, 41) * .5 + vk * snoise(t * 6 + k, 42) * .8 + wind * .6) * u;
  // the head under the cloth (never any features), then the veil: black and see-through, so the
  // backlight glows faintly through its outer edges while the head behind it stays dark
  if (!sil) { g.fillStyle = '#060607'; g.beginPath(); g.ellipse(0, .6 * u, 4.1 * u, 5.6 * u, 0, 0, TAU); g.fill(); taper(g, [0, 4 * u], [0, 8.5 * u], 2.6 * u, 3 * u, '#060607'); }
  g.fillStyle = sil ? '#050506' : 'rgba(6,6,8,.82)'; g.beginPath(); g.moveTo(-vw, vTop); g.lineTo(vw, vTop);
  for (let k = 6; k >= -6; k--) g.lineTo(k / 6 * vw * .86 + stir(k), vBot + (hash(k + 20) - .5) * 1.4 * u + Math.abs(stir(k)) * .4 - Math.abs(k) / 6 * .8 * u);
  g.closePath(); g.fill();
  if (!sil && h > 500) { g.globalAlpha = .35; for (let k = -5; k <= 5; k++) stroke(g, [[k / 5.5 * vw, vTop + u], [k / 5.5 * vw * 1.05 + stir(k) * .8, vBot - u]], '#17161c', .35 * u, 'butt'); g.globalAlpha = 1; }
  // hat: pinched cattleman crown (tapered sides, a dented top, front pinches), wide brim seen from a
  // little below: the dark underside shows as a shallow ellipse and the sides curl up
  const B = 14.5;
  g.fillStyle = shade(P.hat, lit * .8); g.beginPath();
  g.moveTo(-6 * u, -5.2 * u); g.lineTo(-4.6 * u, -12.4 * u); g.quadraticCurveTo(-3.1 * u, -14.2 * u, -1 * u, -13.4 * u); g.quadraticCurveTo(0, -12.6 * u, 1 * u, -13.4 * u);
  g.quadraticCurveTo(3.1 * u, -14.2 * u, 4.6 * u, -12.4 * u); g.lineTo(6 * u, -5.2 * u); g.closePath(); g.fill();
  if (!sil) { stroke(g, [[-5.8 * u, -6.4 * u], [5.8 * u, -6.4 * u]], shade('#3b3026', .7), 1.1 * u); g.globalAlpha = .45; stroke(g, [[-1.8 * u, -12.8 * u], [-2.6 * u, -8.5 * u]], shade(P.hatShade, .3), .7 * u); stroke(g, [[1.8 * u, -12.8 * u], [2.6 * u, -8.5 * u]], shade(P.hatShade, .3), .7 * u); g.globalAlpha = 1; }
  // underside (the part you see from below), then the top surface curling up at both sides
  g.fillStyle = shade(P.hatShade, lit * .5); g.beginPath(); g.ellipse(0, -4.2 * u, B * u, 4.4 * u, 0, 0, TAU); g.fill();
  g.fillStyle = shade(P.hat, lit * .9); g.beginPath();
  g.moveTo(-B * u, -6.2 * u); g.quadraticCurveTo(-(B + .3) * u, -8.4 * u, -(B - 3) * u, -7.6 * u); g.quadraticCurveTo(0, -4.8 * u, (B - 3) * u, -7.6 * u);
  g.quadraticCurveTo((B + .3) * u, -8.4 * u, B * u, -6.2 * u); g.quadraticCurveTo(B * .6 * u, -2.2 * u, 0, -2 * u); g.quadraticCurveTo(-B * .6 * u, -2.2 * u, -B * u, -6.8 * u); g.fill();
  g.restore();
  // rim light on the light layer: hat brim edge + shoulder line, from behind
  if (rim && g === s) { f.save(); f.globalCompositeOperation = 'lighter'; f.globalAlpha = .55;
    f.translate(hc[0], hc[1]); f.rotate(hatTilt); f.scale(1.22, 1.22);
    stroke(f, [[4.6 * u, -12.4 * u], [6 * u, -5.4 * u]], rim, .45 * u);                                                   // crown edge, light from behind right
    stroke(f, bez([(B - 7) * u, -6.2 * u], [(B - 3) * u, -7.8 * u], [(B + .3) * u, -8.4 * u], [B * u, -6.2 * u], 10), rim, .5 * u);  // brim curl
    for (const [sd, al] of [[1, .16], [-1, .07]]) { const vp = [[sd * vw * .95, vTop + 1.5 * u], [sd * vw * .9 + stir(sd * 6) * .5, (vTop + vBot) / 2], [sd * vw * .82 + stir(sd * 6), vBot - 1.2 * u]]; for (let i = 1; i < vp.length; i++) { f.globalAlpha = al * (1 - i * .3); stroke(f, [vp[i - 1], vp[i]], rim, .22 * u); } }                  // light through the veil's edge
    f.restore(); f.save(); f.globalCompositeOperation = 'lighter';
    const sp = bez([X(sh - 3.5), Y(neckY - 5.5)], [X(sh - 2), Y(neckY - 6.5)], [X(sh - .6), Y(neckY - 7.5)], [X(sh), Y(neckY - 8.5)], 6);
    for (let i = 1; i < sp.length; i++) { f.globalAlpha = .45 * (1 - i / sp.length * .5); stroke(f, [sp[i - 1], sp[i]], rim, .45 * u); }
    const side = bez([X(sh), Y(neckY - 8.5)], [X(sh + 1.5), Y(62)], [X(sh + 2.5), Y(45)], [X(flare - 3), Y(hemY + 6)], 14);
    for (let i = 1; i < side.length; i++) { f.globalAlpha = .3 * (1 - i / side.length); stroke(f, [side[i - 1], side[i]], rim, .4 * u); }
    f.restore(); }
  // the one ember eye (Odin): screen-left eye behind the veil
  J.eye = [hc[0] + (2.3 + turn * 1.2) * u, hc[1] + .6 * u]; // his LEFT eye = viewer's right when he faces camera
  if (eye > 0 && !back) { glow(J.eye[0], J.eye[1], 4.5 * u * eye, `rgba(255,110,30,${.55 * eye})`); dot(f, J.eye[0], J.eye[1], .55 * u, `rgba(255,${190 + 50 * eye | 0},120,${eye})`); }
  for (const c of ctxs) c.restore();
  for (const k of Object.keys(J)) J[k] = unshear(J[k]);
  return J;
}
// black Les Paul: body centre (x, y), sc ~ body half-length, ang = neck direction (radians; body sits at the other end)
function drawLesPaul(g, x, y, sc, ang, sil = false, lit = .2) {
  // his real guitar: matte grey-black Les Paul, cream-yellow binding, rosewood board with block inlays.
  // It is the brightest thing on him, so keep it a step lighter than the coat.
  const c = sil ? '#050506' : mixHex('#0b0b0d', '#55555c', .45 + lit * .6), bind = sil ? '#050506' : mixHex('#15130e', P.binding, .6 + lit * .4);
  g.save(); g.translate(x, y); g.rotate(ang + Math.PI);
  const neckL = sc * 3.5, nw = sc * .18;
  if (!sil) { g.fillStyle = '#6b4128'; g.fillRect(-neckL, -nw, neckL - sc * .4, nw * 2); g.fillStyle = bind; g.fillRect(-neckL, -nw * 1.35, neckL - sc * .4, nw * .38); g.fillRect(-neckL, nw * .97, neckL - sc * .4, nw * .38);
    for (let k = 1; k < 9; k++) g.fillRect(-sc * .6 - k * sc * .32, -nw * .5, sc * .1, nw); }
  else { g.fillStyle = c; g.fillRect(-neckL, -nw, neckL - sc * .4, nw * 2); }
  g.fillStyle = sil ? c : '#101012'; g.beginPath(); g.moveTo(-neckL - sc * .55, -nw * 1.8); g.lineTo(-neckL, -nw * 1.3); g.lineTo(-neckL, nw * 1.3); g.lineTo(-neckL - sc * .6, nw * 2); g.fill();
  if (!sil) for (let k = 0; k < 3; k++) for (const d of [-1, 1]) dot(g, -neckL - sc * (.12 + k * .15), d * nw * 1.9, sc * .04, P.hw);
  const bodyP = (k) => { g.beginPath(); g.ellipse(sc * .3, 0, sc * 1.05 * k, sc * .82 * k, 0, 0, TAU); g.ellipse(-sc * .5, -sc * .06, sc * .64 * k, sc * .56 * k, 0, 0, TAU); };
  g.fillStyle = bind; bodyP(1.07); g.fill(); g.fillStyle = c; bodyP(1); g.fill();
  if (!sil) { g.fillStyle = '#0d0d0f'; g.fillRect(sc * .12, -sc * .32, sc * .16, sc * .64); g.fillRect(-sc * .22, -sc * .3, sc * .15, sc * .6);
    g.fillStyle = P.hw; g.fillRect(sc * .5, -sc * .3, sc * .06, sc * .6);
    for (let k = 0; k < 4; k++) dot(g, sc * (.72 + (k % 2) * .22), sc * (.28 + (k >> 1) * .22), sc * .06, '#b9ad8c'); }
  g.restore();
}
function mixHex(a, b, k) { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; }

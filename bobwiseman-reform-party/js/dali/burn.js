// Reform Party, Dali look: the burn (the Man, the fire, the dusk, the crowd ring, fireworks, embers).
// Draft 4: the Man and the burn night drawn the way they really are (Robin has been to Burning Man 13 times).
// The Man is the real effigy: an open timber lattice figure, straight legs, a boxy torso, arms straight down all week,
// the tall lantern head, on a big wooden base with stairs; neon tubing outlines him from dusk. No suit, no face, no melt.
// Dusk: the Lamplighters walk out along the 12:00 and 6:00 promenades in robes and hang their lanterns on the posts;
// people walk and bike in from the city, art cars roll out and park behind the crowd, and the crowd forms the burn ring.
// Burn night, in order: Fire Conclave dancers inside the perimeter, the arms go up into a V on a beat (215.99),
// coloured fireworks from the Man and his base, then the base catches and flames climb the lattice; he burns as glowing
// timbers with his arms still up, and falls at 248.5-252.5. The ballot waves on each "vote" stay (the allegory).

// The aerial at dusk (camera-end.js camEnd) flies its own path from 201 to 215.2. Hand it to camAt here, after
// camera.js has loaded; outside that stretch camEnd returns null and camera.js's camAt runs as before.

// ---------- how much is burning ----------
const VOTES = [35, 36, 37, 38].map((li) => wt(li, 'vote'));
// each "vote" adds fire: refrain 1 the base, 2 the lattice behind the voting board, 3 the whole figure, 4 the peak and the fall
const burnAmt = (t) => (.4 * ease(t, VOTES[0] - 2, VOTES[0] + 4) + .26 * ease(t, VOTES[1] - .6, VOTES[1] + 3) + .19 * ease(t, VOTES[2] - .6, VOTES[2] + 4) + .15 * ease(t, VOTES[3] - .6, VOTES[3] + 2.5)) * (1 - ease(t, 254, 266) * .75);
// The collapse (Robin, after draft 6): not a topple to one side. On the last "people that are broke": one arm drops and
// falls off, then the other, a shoulder caves in, and the whole figure comes straight down into its base.
const COL = { p: wt(38, 'people'), th: wt(38, 'that'), a: wt(38, 'are'), b: wt(38, 'broke') };
const fallAmt = (t) => ease(t, COL.b, COL.b + 1.7); // the straight-down collapse
function flameAmt(t) { return burnAmt(t) * (1 - .78 * ease(t, COL.b + .3, COL.b + 7)); } // the standing fire drops to the heap after the fall
function heapAmt(t) { return ease(t, COL.b + .5, COL.b + 3.8) * (1 - .5 * ease(t, 262, 268.6)); } // the ember heap left for Little Bob
function fireGlow(t) { return Math.max(flameAmt(t), .5 * heapAmt(t)); } // what the grade lights the playa with
const manMelt = (t) => 0; // draft 3's Dali melt is gone: the real Man never sags or melts (kept so old callers still work)
const ARMS_UP = 215.99; // a strong beat just before the burn: the arms lock into the V on it
const armsAmt = (t) => ease(t, ARMS_UP - 1.6, ARMS_UP);
const BASE_H = 8.5; // the base is about 8.5 m high and 25 m wide; the figure on it is 12.5 m to the top of the head
const plinthH = (t) => BASE_H * (1 - .62 * ease(t, COL.b - .2, COL.b + 4.5));
const flameTop = (t) => 4 + 36 * Math.pow(flameAmt(t), 1.1); // metres above the ground

// ---------- the Man ----------
function manGeom() { const p = P(MAN.x, 0, MAN.z); return { p, k: kAt(p) }; }
// his local frame: metres, y up, origin between his feet on top of the base; he rotates about his feet as he falls
const manBase = (t) => plinthH(t); // he stays on his base; the base sinks as it burns
function manFrame(x, y, k, t) { g.beginPath(); g.rect(-W, -H, 3 * W, y + H + .2 * k); g.clip(); g.translate(x, y - manBase(t) * k); g.scale(k, -k); }
// where a point of the standing figure is now, after the collapse stages. part: 'body', or -1 / 1 for an arm
const armDrop = (d, t) => d < 0 ? ease(t, COL.p, COL.p + .38) : ease(t, COL.th, COL.th + .32); // the V arm swings down to hanging
const armOff0 = (d) => d < 0 ? COL.p + .38 : COL.th + .32; // then it breaks off at the shoulder and falls
function xfPt(x, y, t, part, seed) {
  if (part !== 'body') { const d = part, tau = t - armOff0(d); if (tau <= 0) return [x, y];
    const c0 = [d * (SHOULDER[0] + .2), SHOULDER[1] - ARM_L / 2], gy = -plinthH(t) + .35, dy = c0[1] - gy, T = Math.sqrt(2 * dy / 9.8), u = clamp(tau / T);
    const ang = d * Math.PI / 2 * u + d * .25 * Math.sin(u * Math.PI), cx = c0[0] + d * 3.4 * u, cy = c0[1] - Math.min(4.9 * tau * tau, dy) + (u >= 1 ? .25 * Math.max(0, Math.sin((tau - T) * 9)) * Math.exp(-(tau - T) * 5) : 0);
    const rx = x - c0[0], ry = y - c0[1], c = Math.cos(ang), s2 = Math.sin(ang); return [cx + rx * c - ry * s2, cy + rx * s2 + ry * c]; }
  const sh = ease(t, COL.a, COL.a + .35), cf = fallAmt(t); let X = x, Y = y;
  if (sh > 0 && Y > 7) { Y -= sh * 1.5 * clamp((X + .4) / 1.9) * clamp((Y - 7) / 2.2); // the right shoulder caves in
    if (y > 9.2) { const a = -sh * .45, rx = X, ry = Y - 9.2; X = rx * Math.cos(a) - ry * Math.sin(a) + sh * .5; Y = 9.2 - sh * .9 + rx * Math.sin(a) + ry * Math.cos(a); } } // the head lolls
  if (cf > 0) { const j = seed == null ? 0 : n1(900 + seed, 3.1); Y = Y * (1 - .84 * cf) - cf * (plinthH(t) - .8) + j * .25 * cf; X = X * (1 + .35 * cf) + j * .6 * cf; } // straight down, the timbers splaying
  return [X, Y];
}
function manPt(lx, ly, t, part) { const { p, k } = manGeom(), q = xfPt(lx, ly, t, part || (Math.abs(lx) > 2.4 && ly > 9.5 ? Math.sign(lx) : 'body'));
  return [p[0] + q[0] * k, p[1] - manBase(t) * k - q[1] * k]; }
// Draft 9: the lantern head stays whole (a rigid frame) as he comes down, then rolls about 2 m off the heap onto the
// playa beside it, still glowing, so the Man stays readable after the collapse while Little Bob walks past.
const HEAD_ROLL = COL.b + 1.5;
function headXf(x, y, t) { // the head's own frame: its centre follows the falling body, the shape stays rigid
  const sh = ease(t, COL.a, COL.a + .35), cf = fallAmt(t), ru = ease(t, HEAD_ROLL, HEAD_ROLL + 1.7); let c = xfPt(0, 11.1, t, 'body');
  if (ru > 0) { const c1 = [-2.6, -plinthH(t) + .9]; c = [lerp(c[0], c1[0], ru), lerp(c[1], c1[1], ru) + .8 * Math.sin(Math.PI * Math.min(1, ru * 1.4)) * (1 - ru)]; }
  const ang = -sh * .45 + cf * .5 + ru * 1.95, rx = x, ry = y - 11.1, ca = Math.cos(ang), sa = Math.sin(ang);
  return [c[0] + rx * ca - ry * sa, c[1] + rx * sa + ry * ca]; }
// the point the film's last ember sits on (his chest, on the fallen figure), in screen pixels, for the ember-contract ending
function lastEmber(t) { return manPt(0, 7.4, t); }

// The figure as a list of timber sticks: [x0, y0, x1, y1, width m, rail (outline, carries neon)].
// Legs and arms are lattice columns: two rails with a zigzag brace between them, so you can see through him.
function lattice(out, a, b, w, piece) { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * w / 2, ny = dx / L * w / 2, n = Math.max(2, Math.round(L / (w * 1.25)));
  for (let i = 0; i < n; i++) { const u0 = i / n, u1 = (i + 1) / n, A = [a[0] + dx * u0, a[1] + dy * u0], B = [a[0] + dx * u1, a[1] + dy * u1], s = i % 2 ? 1 : -1;
    out.push([A[0] + nx, A[1] + ny, B[0] + nx, B[1] + ny, .17, 1], [A[0] - nx, A[1] - ny, B[0] - nx, B[1] - ny, .17, 1], [A[0] + nx * s, A[1] + ny * s, B[0] - nx * s, B[1] - ny * s, .085, 0]);
    if (i % 2 === 0) out.push([A[0] + nx, A[1] + ny, A[0] - nx, A[1] - ny, .07, 0]); }
  out.push([b[0] + nx, b[1] + ny, b[0] - nx, b[1] - ny, .1, piece]); }
const SHOULDER = [1.38, 9.0], ARM_L = 5.0;
function armHand(d, t) { const ph = lerp(.07, 2.65, armsAmt(t) * (1 - armDrop(d, t))); return [d * (SHOULDER[0] + Math.sin(ph) * ARM_L), SHOULDER[1] - Math.cos(ph) * ARM_L]; } // straight down (4 deg out) to the V (28 deg off vertical)
let MSTK = { t: NaN, s: null };
function manSticks(t) {
  if (MSTK.t === t) return MSTK.s; const s = [];
  for (const d of [-1, 1]) lattice(s, [d * 1.12, 0], [d * .6, 5.3], .66, 0); // legs: straight, slightly apart
  // the torso: a box, wider at the shoulders, built in four tiers with X braces and a centre post
  const tier = (y) => { const u = (y - 5.3) / 3.9; return lerp(.82, 1.5, u); };
  for (let i = 0; i < 4; i++) { const y0 = 5.3 + i * .975, y1 = y0 + .975, w0 = tier(y0), w1 = tier(y1);
    s.push([-w0, y0, -w1, y1, .19, 1], [w0, y0, w1, y1, .19, 1], [-w1, y1, w1, y1, i === 3 ? .19 : .1, i === 3 ? 1 : 0], [-w0, y0, w1, y1, .08, 0], [w0, y0, -w1, y1, .08, 0], [0, y0, 0, y1, .07, 0]); }
  s.push([-.82, 5.3, .82, 5.3, .16, 1]);
  s.push([-.17, 9.2, -.17, 9.78, .12, 1], [.17, 9.2, .17, 9.78, .12, 1]); // the short neck
  // the lantern head: a tall diamond, widest high up (like the logo), with an inner frame
  const hd = [[0, 9.72], [1.02, 11.62], [0, 12.5], [-1.02, 11.62]], h0 = s.length;
  for (let i = 0; i < 4; i++) { const a = hd[i], b = hd[(i + 1) % 4]; s.push([a[0], a[1], b[0], b[1], .17, 1]); }
  s.push([0, 9.72, 0, 12.5, .08, 0], [-1.02, 11.62, 1.02, 11.62, .08, 0], [-.5, 10.67, .5, 12.06, .06, 0], [.5, 10.67, -.5, 12.06, .06, 0]);
  for (let i = h0; i < s.length; i++) s[i].hd = 1;
  const nb = s.length;
  for (const d of [-1, 1]) { const a0 = s.length; lattice(s, [d * SHOULDER[0], SHOULDER[1]], armHand(d, t), .46, 0); for (let i = a0; i < s.length; i++) s[i].arm = d; } // the arms: straight timber columns, down or up in the V
  for (let i = 0; i < s.length; i++) { const st = s[i], part = st.arm || 'body', a = st.hd ? headXf(st[0], st[1], t) : xfPt(st[0], st[1], t, part, i), b = st.hd ? headXf(st[2], st[3], t) : xfPt(st[2], st[3], t, part, i + .5); st[0] = a[0]; st[1] = a[1]; st[2] = b[0]; st[3] = b[1]; }
  MSTK = { t, s }; return s;
}
function manSkin(t) { // the figure's silhouette (legs, torso, head, arms) as one path, for the faint fill behind the lattice
  const quad = (a, b, w) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * w / 2, ny = dx / L * w / 2; g.moveTo(a[0] + nx, a[1] + ny); g.lineTo(b[0] + nx, b[1] + ny); g.lineTo(b[0] - nx, b[1] - ny); g.lineTo(a[0] - nx, a[1] - ny); g.closePath(); };
  for (const d of [-1, 1]) { quad([d * 1.12, 0], [d * .6, 5.3], .66); quad([d * SHOULDER[0], SHOULDER[1]], armHand(d, t), .46); }
  g.moveTo(-.82, 5.3); g.lineTo(.82, 5.3); g.lineTo(1.5, 9.2); g.lineTo(-1.5, 9.2); g.closePath();
  g.moveTo(0, 9.72); g.lineTo(1.02, 11.62); g.lineTo(0, 12.5); g.lineTo(-1.02, 11.62); g.closePath();
}
// a stick's burn state (0..1) from the flame height: the lattice catches from the bottom up
function stickBurn(st, t, Hc) { const ym = Math.min(st[1], st[3]); return Math.max(clamp((Hc - plinthH(t) - ym - .5) / 2.2), fallAmt(t) > .5 ? 1 : 0); }
function strokeSticks(sticks, pick, col, wMul, wAdd, k) { // stroke a set of sticks, batched by width
  const byW = new Map(); for (const st of sticks) { if (!pick(st)) continue; const w = Math.max(st[4] * wMul + wAdd, 1.05 / k); const key = Math.round(w * 400); if (!byW.has(key)) byW.set(key, []); byW.get(key).push(st); }
  g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round';
  for (const [key, list] of byW) { g.lineWidth = key / 400; g.beginPath(); for (const st of list) { g.moveTo(st[0], st[1]); g.lineTo(st[2], st[3]); } g.stroke(); }
}
function effigy(t, mode) { // mode 'lit' (timber, graded normally): the parts the fire hasn't reached
  const sticks = manSticks(t), Hc = flameTop(t), k = manGeom().k || 1;
  const cool = (st) => stickBurn(st, t, Hc) < .5;
  if (mode === 'lit') { const sk = 1 - clamp((Hc - plinthH(t) - 2) / 6); if (sk > 0) { g.fillStyle = `rgba(150,108,66,${.3 * sk})`; g.beginPath(); manSkin(t); g.fill(); }
    strokeSticks(sticks, (st) => cool(st) && !st[5], '#7c5834', 1, 0, k); strokeSticks(sticks, (st) => cool(st) && st[5], '#a98257', 1, 0, k); }
}

// ---------- the base: a big generic timber pavilion with stairs up the front ----------
function manBase2D(x, y, k, t) { // screen-space billboard at the Man's ground point
  const h = plinthH(t), sq = h / BASE_H, burnt = clamp(flameAmt(t) * 2.2) * .85, lw = (w) => Math.max(1, w * k);
  const wood = rgb(mix([168, 124, 78], [40, 22, 14], burnt)), dark = rgb(mix([96, 66, 40], [24, 12, 8], burnt)), slat = `rgba(70,46,26,${.55 * (1 - burnt * .5)})`;
  const X = (u) => x + u * k, Y = (v) => y - v * sq * k;
  // lower tier: a wide box with doorways; upper tier set back; a deck rail on top
  g.fillStyle = wood; g.fillRect(X(-12.5), Y(4.2), 25 * k, 4.2 * sq * k);
  g.fillStyle = dark; g.fillRect(X(4), Y(4.2), 8.5 * k, 4.2 * sq * k); // the shaded side
  g.fillStyle = wood; g.fillRect(X(-8.6), Y(BASE_H), 17.2 * k, (BASE_H - 4.2) * sq * k);
  g.fillStyle = dark; g.fillRect(X(3.2), Y(BASE_H), 5.4 * k, (BASE_H - 4.2) * sq * k);
  g.fillStyle = 'rgba(40,24,14,.55)'; g.fillRect(X(-12.5), Y(4.35), 25 * k, .15 * sq * k); g.fillRect(X(-8.6), Y(BASE_H + .1), 17.2 * k, .25 * sq * k);
  g.strokeStyle = slat; g.lineWidth = lw(.09); g.beginPath();
  for (let u = -12; u <= 12.01; u += 1.25) { g.moveTo(X(u), Y(0)); g.lineTo(X(u), Y(4.2)); }
  for (let u = -8.1; u <= 8.11; u += 1.35) { g.moveTo(X(u), Y(4.2)); g.lineTo(X(u), Y(BASE_H)); }
  for (const [a, b] of [[-8.6, -4.3], [-4.3, 0], [0, 4.3], [4.3, 8.6]]) { g.moveTo(X(a), Y(4.2)); g.lineTo(X(b), Y(BASE_H)); g.moveTo(X(b), Y(4.2)); g.lineTo(X(a), Y(BASE_H)); } // X braces
  g.stroke();
  g.fillStyle = 'rgba(26,16,12,.8)'; for (const u of [-9, 6]) { g.beginPath(); g.moveTo(X(u - 1.3), Y(0)); g.lineTo(X(u - 1.3), Y(2.4)); g.lineTo(X(u), Y(3.1)); g.lineTo(X(u + 1.3), Y(2.4)); g.lineTo(X(u + 1.3), Y(0)); g.fill(); } // doorways
  // the stairs: two flights up the front, steps and handrails
  const flight = (y0, y1, w0, w1) => { g.fillStyle = rgb(mix([190, 146, 96], [44, 24, 14], burnt)); g.beginPath(); g.moveTo(X(-w0), Y(y0)); g.lineTo(X(w0), Y(y0)); g.lineTo(X(w1), Y(y1)); g.lineTo(X(-w1), Y(y1)); g.fill();
    g.strokeStyle = slat; g.lineWidth = lw(.07); g.beginPath(); const n = Math.round((y1 - y0) / .32); for (let i = 1; i < n; i++) { const v = lerp(y0, y1, i / n), w = lerp(w0, w1, i / n); g.moveTo(X(-w), Y(v)); g.lineTo(X(w), Y(v)); } g.stroke();
    g.strokeStyle = dark; g.lineWidth = lw(.12); g.beginPath(); for (const d of [-1, 1]) { g.moveTo(X(d * w0), Y(y0 + 1)); g.lineTo(X(d * w1), Y(y1 + 1)); g.moveTo(X(d * w0), Y(y0)); g.lineTo(X(d * w0), Y(y0 + 1)); } g.stroke(); };
  flight(0, 4.2, 2.7, 1.9); flight(4.2, BASE_H, 1.6, 1.2);
  g.strokeStyle = dark; g.lineWidth = lw(.1); g.beginPath(); g.moveTo(X(-8.6), Y(BASE_H + 1)); g.lineTo(X(8.6), Y(BASE_H + 1)); for (let u = -8.6; u <= 8.61; u += 1.72) { g.moveTo(X(u), Y(BASE_H)); g.lineTo(X(u), Y(BASE_H + 1)); } g.stroke(); // deck rail
}
function theMan(t) {
  const { p, k } = manGeom(); if (p[2] < 1) return; const x = p[0], y = p[1];
  if (k < .9) { // far off (the aerial): a few pixels of base and figure
    g.fillStyle = '#8a6a44'; g.fillRect(x - 12.5 * k, y - BASE_H * k, 25 * k, BASE_H * k); g.strokeStyle = '#a98257'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y - BASE_H * k); g.lineTo(x, y - (BASE_H + 12.5) * k); g.stroke(); return; }
  manBase2D(x, y, k, t);
  const hp = heapAmt(t);
  if (hp > 0) { // charred beams and a black mound, glowing coals are added after the grade
    g.fillStyle = `rgba(34,20,16,${clamp(hp * 1.5)})`; g.beginPath(); g.moveTo(x - 15 * k, y);
    for (let i = 0; i <= 16; i++) { const u = i / 16, X = lerp(-15, 19, u), hh = (2.8 + .9 * n1(31, u * 6)) * Math.sin(u * Math.PI) ** .7; g.lineTo(x + X * k, y - hh * hp * k); }
    g.lineTo(x + 19 * k, y); g.fill();
    g.strokeStyle = '#1c110d'; g.lineCap = 'round'; for (let i = 0; i < 9; i++) { const a = -.5 + rnd(i, 51) * 1, X0 = lerp(-13, 16, rnd(i, 52)), L = 3 + rnd(i, 53) * 4; g.lineWidth = Math.max(1, .35 * k); g.beginPath(); g.moveTo(x + X0 * k, y - .3 * k); g.lineTo(x + (X0 + Math.cos(a) * L) * k, y - (.3 + Math.abs(Math.sin(a)) * L * .6) * hp * k); g.stroke(); }
  }
  if (fallAmt(t) < 1) { g.save(); manFrame(x, y, k, t); effigy(t, 'lit'); g.restore(); }
}
// the neon tubing that outlines him from dusk (cool blue-white), drawn after the grade so it glows; it dies as each stick catches
const neonAmt = (t) => ease(t, 202.5, 206.5) * (1 - ease(t, COL.p - 2, COL.p));
function manNeon(t) {
  const n = neonAmt(t); if (n <= 0) return; const { p, k } = manGeom(); if (p[2] < 1) return;
  const Hc = flameTop(t), sticks = manSticks(t), on = (st) => st[5] && stickBurn(st, t, Hc) < .3;
  g.save(); g.globalCompositeOperation = 'lighter';
  if (k < 2.5) { const R = Math.max(10, 16 * k); const cx = p[0], cy = p[1] - (BASE_H + 6) * k; const rg = g.createRadialGradient(cx, cy, 0, cx, cy, R); rg.addColorStop(0, `rgba(170,215,255,${.55 * n})`); rg.addColorStop(1, 'rgba(120,180,255,0)'); g.fillStyle = rg; g.fillRect(cx - R, cy - R, 2 * R, 2 * R); } // from the air he reads as a lit point
  g.save(); manFrame(p[0], p[1], k, t); g.globalAlpha = .28 * n; strokeSticks(sticks, on, 'rgb(110,175,255)', 2.4, .22, k); g.globalAlpha = .9 * n; strokeSticks(sticks, on, 'rgb(205,232,255)', .45, 0, k); g.restore();
  g.restore();
}

// ---------- the fire ----------
function flameTongue(bx, by, h, w, i, t, a, soft) { // one irregular tongue of flame, base (bx, by), h and w in px
  if (h < 2 || a <= 0) return; const lean = n1(400 + i, t * 1.25) * .3 * h + n1(410 + i, t * 3.1) * .06 * h, tx = bx + lean, ty = by - h;
  const sf = soft === true ? .2 : soft || 0, fg = g.createLinearGradient(0, by, 0, ty); fg.addColorStop(0, `rgba(255,205,120,${sf ? 0 : .5 * a})`); if (sf) fg.addColorStop(sf, `rgba(255,205,120,${.5 * a})`); fg.addColorStop(.32, `rgba(255,150,45,${.6 * a})`); fg.addColorStop(.72, `rgba(236,72,16,${.32 * a})`); fg.addColorStop(1, 'rgba(200,40,10,0)');
  g.fillStyle = fg; g.beginPath(); g.moveTo(bx - w, by);
  g.bezierCurveTo(bx - w * 1.15, by - h * .42, tx - w * .4 + n1(500 + i, t * 2.7) * w * .5, by - h * .72, tx, ty);
  g.bezierCurveTo(tx + w * .3 + n1(520 + i, t * 2.3) * w * .4, by - h * .66, bx + w * 1.1, by - h * .38, bx + w, by); g.fill();
}
function manFire(t) {
  const f = flameAmt(t), hp = heapAmt(t); if (f <= .005 && hp <= .005) return; const { p, k } = manGeom(); if (p[2] < 1) return; const x = p[0], y = p[1];
  const Hc = flameTop(t), fall = fallAmt(t), wide = lerp(1, 1.5, fall), baseOn = clamp(f * 4);
  g.save(); g.globalCompositeOperation = 'lighter';
  // light pooled on the playa around the fire
  { const R = 38, q = P(MAN.x, 0, MAN.z - R), ry = Math.abs(y - q[1]) || 1, rx = R * k; g.save(); g.translate(x, y); g.scale(1, Math.min(1, ry / rx));
    const rg = g.createRadialGradient(0, 0, 0, 0, 0, rx); rg.addColorStop(0, `rgba(255,150,60,${.35 * fireGlow(t)})`); rg.addColorStop(1, 'rgba(255,90,30,0)'); g.fillStyle = rg; g.fillRect(-rx, -rx, 2 * rx, 2 * rx); g.restore(); }
  // the glow
  { const cy = y - Hc * .45 * k, R = (16 + Hc) * k; const gl = g.createRadialGradient(x, cy, 0, x, cy, R); gl.addColorStop(0, `rgba(255,170,80,${.36 * f})`); gl.addColorStop(.45, `rgba(255,100,30,${.2 * f})`); gl.addColorStop(1, 'rgba(255,60,10,0)'); g.fillStyle = gl; g.fillRect(x - R, cy - R, 2 * R, 2 * R); }
  // back tongues: the base burns first at its own height, then the fire stands up through the figure, peaked in the middle
  const N = Math.round(20 + 44 * f), Wb = (12.5 + 2.5 * f) * wide, ta = clamp(22 / N, .4, 1);
  const tongueH = (i, u, front) => { const c = Math.pow(Math.max(0, 1 - Math.abs(u)), 1.1), base = Math.min(Hc, plinthH(t) * (.3 + 1.05 * rnd(i, 63))); return (base + Math.max(0, Hc - base) * c * (.55 + .45 * rnd(i, 64))) * (front ? .8 : 1) * (.62 + .38 * (.5 + .5 * n1(600 + i, t * (1.6 + rnd(i, 62))))); };
  // draft 9: no lightbox. Tongue heights are ragged (no flat top at the deck), tongue height and alpha taper to nothing over the outer fifth, the bottoms feather into a low
  // glow on the playa, and the base's charred frame stands dark in the flames between the back and front tongues.
  const edge = (u) => smooth(clamp((1 - Math.abs(u)) / .35));
  { const gy = y - .6 * k, rx = Wb * k * 1.08, ry = Math.max(4, 2.4 * k); g.save(); g.translate(x, gy); g.scale(1, ry / rx); const bg = g.createRadialGradient(0, 0, 0, 0, 0, rx); bg.addColorStop(0, `rgba(255,170,70,${.34 * baseOn})`); bg.addColorStop(.6, `rgba(255,120,40,${.16 * baseOn})`); bg.addColorStop(1, 'rgba(255,90,30,0)'); g.fillStyle = bg; g.fillRect(-rx, -rx, 2 * rx, 2 * rx); g.restore(); }
  for (let i = 0; i < N; i += 2) { const u = rnd(i, 61) * 2 - 1, e = edge(u); if (e <= .01) continue; flameTongue(x + u * Wb * k, y, tongueH(i, u, false) * k * (.15 + .85 * e * e), (1.4 + 1.6 * f) * k * (1.2 - .4 * Math.abs(u)), i, t, baseOn * ta * e, .24); }
  g.globalCompositeOperation = 'source-over'; charFrame(x, y, k, t, .45 * clamp(f * 2.5) * (1 - heapAmt(t))); g.globalCompositeOperation = 'lighter';
  for (let i = 1; i < N; i += 2) { const u = rnd(i, 61) * 2 - 1, e = edge(u * 1.1); if (e <= .01) continue; flameTongue(x + u * Wb * .85 * k, y, tongueH(i, u, true) * k * (.15 + .85 * e * e), (1.2 + 1.3 * f) * k, i, t, baseOn * .6 * ta * e, .2); }
  g.restore();
  // the figure in the fire: glowing timbers. Burning sticks get a hot halo, a charred core and bright flickering seams
  const fade = 1 - ease(t, COL.b + .8, COL.b + 7) * .72; // once burnt he stays burnt, then crumbles into the heap
  if (fall < 1 || fade > 0) {
    const sticks = manSticks(t), hot0 = (st) => stickBurn(st, t, Hc) >= .5 || fall > .5, hfade = 1 - .5 * ease(t, 262, 268.5);
    for (const [hot, fd] of [[(st) => !st.hd && hot0(st), fade], [(st) => st.hd && hot0(st), t < HEAD_ROLL ? fade : Math.max(fade, hfade)]]) { // the body, then the lantern head on its own
      if (!sticks.some(hot)) continue;
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .38 * fd; manFrame(x, y, k, t); strokeSticks(sticks, hot, 'rgb(255,110,36)', 3.2, .2, k); g.restore();
      g.save(); g.globalAlpha = clamp(1.7 * fd); manFrame(x, y, k, t); strokeSticks(sticks, hot, '#140906', 1.25, 0, k); g.restore();
      g.save(); g.globalCompositeOperation = 'lighter'; manFrame(x, y, k, t); // the seams glow and flicker, stick by stick
      for (let b = 0; b < 3; b++) { const pick = (st) => hot(st) && ((Math.floor(st[0] * 7 + st[1] * 3) & 3) === b || (b === 2 && st[5])); g.globalAlpha = fd * (.4 + .4 * (.5 + .5 * n1(700 + b, t * 2.4)));
        strokeSticks(sticks, pick, b === 2 ? 'rgb(255,180,80)' : 'rgb(255,130,50)', .32, 0, k); }
      g.restore();
    }
    const hr = ease(t, HEAD_ROLL, HEAD_ROLL + 1) * hfade; if (hr > 0) { const hc = headXf(0, 11.1, t), hx = x + hc[0] * k, hy = y - (manBase(t) + hc[1]) * k, R = 3.2 * k; // the rolled head glows on the playa
      g.save(); g.globalCompositeOperation = 'lighter'; const hg = g.createRadialGradient(hx, hy, 0, hx, hy, R); hg.addColorStop(0, `rgba(255,150,60,${.4 * hr})`); hg.addColorStop(1, 'rgba(255,90,30,0)'); g.fillStyle = hg; g.fillRect(hx - R, hy - R, 2 * R, 2 * R);
      for (let i = 0; i < 3; i++) flameTongue(hx + (i - 1) * .6 * k, hy + .5 * k, (1.2 + .8 * n1(1980 + i, t * 2.2)) * k * hr, .45 * k, 1990 + i, t, .55 * hr, .15); g.restore(); }
  }
  g.save(); g.globalCompositeOperation = 'lighter';
  // flames climbing the lattice itself: legs, then torso, arms and head
  const spots = [[-.9, 1.2], [.9, 1.4], [-.7, 3.8], [.7, 3.4], [0, 6.2], [-1.1, 7.6], [1.1, 7.8], [0, 9.2], [0, 11], [-2.9, 11.6], [3.0, 11.8], [-3.6, 13.2], [3.7, 13.3]];
  spots.forEach(([fx, fy], i) => { const climb = clamp((Hc - plinthH(t) - fy) / 4); if (climb <= 0 || fall > .8) return; const q = manPt(fx + .3 * n1(660 + i, t * 1.7), fy, t), h = (3.6 + 2 * n1(600 + i, t * 3)) * k * climb * (1 - fall), w = (1.1 + .4 * n1(650 + i, t * 2)) * k;
    flameTongue(q[0], q[1] + w * .6, h, w, 30 + i, t, .5 * clamp(f * 1.6), true); });
  // heap coals after the fall: each one a separate pulsing glow so the ember field reads, not mush
  if (hp > 0) for (let i = 0; i < 64; i++) { const u = rnd(i, 81), X = lerp(-14, 18, u), Y = (.2 + rnd(i, 82) * 2.4) * Math.sin(u * Math.PI) ** .7 * hp, q = [x + X * k, y - Y * k], r = (.3 + rnd(i, 83) * .45) * k, a = hp * (.4 + .6 * (.5 + .5 * n1(820 + i, t * (.8 + rnd(i, 84)))));
    const cg = g.createRadialGradient(q[0], q[1], 0, q[0], q[1], r); cg.addColorStop(0, `rgba(255,${170 + 60 * rnd(i, 85)},90,${.95 * a})`); cg.addColorStop(.3, `rgba(255,110,30,${.6 * a})`); cg.addColorStop(1, 'rgba(200,40,10,0)'); g.fillStyle = cg; g.fillRect(q[0] - r, q[1] - r, 2 * r, 2 * r); }
  // sparks
  const ns = Math.round(50 + 150 * f);
  for (let i = 0; i < ns; i++) { const sp = .25 + .2 * rnd(i, 9), ph = (t * sp + rnd(i, 91)) % 1, ex = x + ((rnd(i, 3) - .5) * 22 + n1(500 + i, t * .6) * 5 + ph * 6 * n1(530 + i, t * .2)) * k * wide, ey = y - (3 + ph * (Hc + 14)) * k, s = Math.max(2, .16 * k * (1 - ph * .5));
    g.fillStyle = `rgba(255,${210 - ph * 90},${120 - ph * 80},${(1 - ph) * .9 * Math.max(f, hp * .4)})`; g.fillRect(ex, ey, s, s); }
  g.restore();
}

function charFrame(x, y, k, t, a) { // the base's timber frame, charred black in the fire: posts burnt off at odd heights, broken beams
  if (a <= .01) return; const sq = plinthH(t) / BASE_H, X = (u) => x + u * k, Y = (v) => y - v * sq * k;
  g.save(); g.globalAlpha = a; g.strokeStyle = '#170a06'; g.lineCap = 'butt'; g.lineWidth = Math.max(1, .16 * k); g.beginPath();
  const post = (u, v0, v1, i) => { const top = lerp(v0 + (v1 - v0) * .45, v1, rnd(i, 2101)), lean = (rnd(i, 2102) - .5) * .5; g.moveTo(X(u), Y(v0)); g.lineTo(X(u + lean), Y(top)); };
  for (let u = -11.25, i = 0; u <= 11.26; u += 2.5, i++) post(u, 0, 4.2, i);
  for (let u = -7.5, i = 20; u <= 7.51; u += 2.5, i++) post(u, 4.2, BASE_H, i);
  for (let i = 0; i < 9; i++) { if (rnd(i, 2103) < .4) continue; const u0 = -11.25 + i * 2.5, sag = .25 * rnd(i, 2104); g.moveTo(X(u0), Y(4.2)); g.lineTo(X(u0 + 2.5), Y(4.2 - sag)); } // the tier beam, broken
  for (let i = 0; i < 6; i++) { if (rnd(i, 2105) < .45) continue; const u0 = -7.5 + i * 2.5, sag = .3 * rnd(i, 2106); g.moveTo(X(u0), Y(BASE_H)); g.lineTo(X(u0 + 2.5), Y(BASE_H - sag)); } // the deck, broken
  g.stroke(); g.lineWidth = Math.max(1, .09 * k); g.beginPath(); g.moveTo(X(-7.5), Y(4.2)); g.lineTo(X(-2.5), Y(BASE_H * .92)); g.moveTo(X(5), Y(4.2)); g.lineTo(X(1.2), Y(BASE_H * .8)); g.stroke(); // two braces left standing
  g.restore();
}

// ---------- fireworks from the Man and his base, on the beats before the burn ----------
// coloured shells only (never white frames); each beat's shells burst together, so at most two bursts a second
const FW_BEATS = [216.45, 217.03, 217.64, 218.25, 218.8, 219.59, 220.04];
const FW_COLS = [[255, 70, 60], [80, 220, 120], [90, 140, 255], [255, 200, 70], [235, 80, 220], [70, 220, 235]];
const SHELLS = []; FW_BEATS.forEach((b, j) => { const n = j < 5 ? 2 : 3; for (let s = 0; s < n; s++) { const i = SHELLS.length; SHELLS.push({ tb: b, tl: b - .85 - .2 * rnd(i, 1), x0: (rnd(i, 2) - .5) * 18, x1: (rnd(i, 3) - .5) * 44, y1: 30 + 22 * rnd(i, 4), z1: (rnd(i, 5) - .5) * 20, col: FW_COLS[(i * 5 + j) % FW_COLS.length], R: 9 + 6 * rnd(i, 6), i }); } });
function fireworks(t) {
  if (t < 214.5 || t > 223.5) return; g.save(); g.globalCompositeOperation = 'lighter';
  const W3 = (X, Y, Z) => P(MAN.x + X, Y, MAN.z + Z);
  for (const s of SHELLS) {
    if (t < s.tl) continue;
    if (t < s.tb) { const u = (t - s.tl) / (s.tb - s.tl), X = lerp(s.x0, s.x1, u), Y = lerp(BASE_H, s.y1, 1 - (1 - u) * (1 - u)), Z = lerp(0, s.z1, u); // the comet climbs from the base deck
      const a = W3(X, Y, Z), b = W3(lerp(s.x0, s.x1, u - .12), lerp(BASE_H, s.y1, 1 - (1 - u + .12) ** 2), lerp(0, s.z1, u - .12)); if (a[2] < 2) continue; const k = kAt(a);
      g.strokeStyle = `rgba(255,214,150,${.5})`; g.lineWidth = Math.max(1.2, .18 * k); g.beginPath(); g.moveTo(b[0], b[1]); g.lineTo(a[0], a[1]); g.stroke(); continue; }
    const tau = t - s.tb, life = 1 - clamp(tau / 1.9); if (life <= 0) continue; const c = W3(s.x1, s.y1, s.z1); if (c[2] < 2) continue; const k = kAt(c), Rr = s.R * (1 - Math.exp(-3.2 * tau)), drop = 2.2 * tau * tau;
    const core = clamp(1 - tau / .35); if (core > 0) { const R = 4 * k; const rg = g.createRadialGradient(c[0], c[1], 0, c[0], c[1], R); rg.addColorStop(0, rgb(s.col, .3 * core)); rg.addColorStop(1, rgb(s.col, 0)); g.fillStyle = rg; g.fillRect(c[0] - R, c[1] - R, 2 * R, 2 * R); }
    g.strokeStyle = rgb(mix(s.col, [255, 240, 220], .25), .85 * life); g.lineWidth = Math.max(1.3, .2 * k); g.beginPath();
    for (let j = 0; j < 44; j++) { const th = j / 44 * TAU + rnd(s.i, j) * .1, ph = Math.acos(2 * rnd(s.i, j, 7) - 1), dx = Math.sin(ph) * Math.cos(th), dy = Math.cos(ph), dz = Math.sin(ph) * Math.sin(th);
      const a = W3(s.x1 + dx * Rr, s.y1 + dy * Rr - drop, s.z1 + dz * Rr), r0 = Rr * .82, b = W3(s.x1 + dx * r0, s.y1 + dy * r0 - drop * .9, s.z1 + dz * r0); if (a[2] < 1 || b[2] < 1) continue;
      g.moveTo(b[0], b[1]); g.lineTo(a[0], a[1]); }
    g.stroke();
  }
  // gerbs: fountains of gold sparks along the deck edge, and two streams of comets from his raised hands
  const gb = ease(t, 216.1, 216.6) * (1 - ease(t, 219.9, 220.8)); if (gb > 0) {
    for (let e = 0; e < 6; e++) { const ex = -8 + e * 3.2; for (let j = 0; j < 14; j++) { const ph = (t * 1.4 + rnd(e, j)) % 1, vx = (rnd(e, j, 2) - .5) * 3, X = ex + vx * ph, Y = BASE_H + 7 * ph - 6 * ph * ph, q = W3(X, Y, -1); if (q[2] < 2) continue; const s = Math.max(1.5, .14 * kAt(q));
      g.fillStyle = `rgba(255,${190 - 60 * ph | 0},90,${.75 * gb * (1 - ph)})`; g.fillRect(q[0] - s / 2, q[1] - s / 2, s, s); } }
    for (const d of [-1, 1]) { const h = armHand(d, t); for (let j = 0; j < 10; j++) { const ph = (t * 1.1 + j / 10) % 1, X = h[0] + d * ph * 4, Y = BASE_H + h[1] + 22 * ph, q = W3(X, Y, 0); if (q[2] < 2) continue; const s = Math.max(1.5, .2 * kAt(q));
      g.fillStyle = rgb(FW_COLS[(j + (d > 0 ? 2 : 0)) % 6], .8 * gb * (1 - ph)); g.fillRect(q[0] - s / 2, q[1] - s / 2, s, s); } }
  }
  g.restore();
}

// ---------- the crowd ----------
// Draft 9 (the real burn, PLAYA-SCOUT.md section 4): the ring is seated ten rows and more deep, front rows on the playa,
// the back rows standing; people stake their spots early (from about 2:45, in the background of refrain 3) and only
// stragglers walk in at dusk. Rangers kneel on the perimeter line facing them. After the fall the perimeter drops: about
// 120 people run in to the fire and circle it counter-clockwise, and the rest get up and step in.
const LL_LAT = 4.2;
const COLS = ['#d8452f', '#2f6fb5', '#e8b23a', '#3c8c5a', '#f2ede0', '#7a3c8c', '#e07a2f'];
const LEDS = ['120,220,255', '255,90,200', '140,255,120', '255,200,80', '200,120,255'];
const CLOCK = (a) => [Math.sin(a * TAU / 12), -Math.cos(a * TAU / 12)]; // direction from the Man for a clock position (12:00 = -z)
function segDist(X, Z, a, b) { const dx = b[0] - a[0], dz = b[1] - a[1], u = clamp(((X - a[0]) * dx + (Z - a[1]) * dz) / (dx * dx + dz * dz || 1)); return Math.hypot(X - a[0] - dx * u, Z - a[1] - dz * u); }
// keep clear: where the low cameras stand, the sight lines from the vote cameras to the board, and the Lamplighters'
// aisles. The board's own parking spot fills in once the table has rolled away (239.6), and people part for it as it goes.
const CAM_KEEP = (() => { const out = []; for (const e of shotsEnd()) { if (e[0] < 201 || e[3] > 4) continue; out.push([e[2] + carX(238), e[4]]); } return out; })();
const SIGHT = [[[320, 0], [311, 8]], [[321, 6], [318, 14]]];
const inCarBox = (X, Z) => X > 277.6 && X < 292.5 && Z > -4.6 && Z < 4.6; // where the board parks (206-238)
// the poor woman from the bridge, at the front-row edge about 8 m left of the board (seen from the vote cameras)
const POOR_W = (() => { const X = 277.3; return { X, Z: MAN.z - Math.sqrt(44.6 * 44.6 - (X - MAN.x) ** 2) - .15 }; })();
function keepOut(X, Z) {
  if (typeof DRUM !== 'undefined' && Math.hypot(X - DRUM.x, Z - DRUM.z) < DRUM.r + 2.4) return true; // a gap in the crowd round the drum circle
  if (X > 277.6 && X < 292.5 && Z > -12.5 && Z <= -4.6) return true; // behind it, where the vote cameras stand and look across the table
  if (Math.hypot(X - POOR_W.X, Z - POOR_W.Z) < 1.2) return true;
  for (const c of [[271.5, -3.5], [277.6, -6.5]]) if (segDist(X, Z, c, [POOR_W.X, POOR_W.Z]) < 1.8) return true; // a clear view of her bowl from the outro-2 slide (camera.js)
  if (X > 278.4 && X < 286 && Z > 2.5 && Z < 10.5) return true; // the Instrument People stand at x 279.6-284.8, z 8.6 for votes 1-3 (instruments.js): nobody in front of them
  for (const c of CAM_KEEP) if (Math.hypot(X - c[0], Z - c[1]) < 2.3) return true;
  for (const [a, b] of SIGHT) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), u = clamp(((X - a[0]) * (b[0] - a[0]) + (Z - a[1]) * (b[1] - a[1])) / (L * L)); if (u > 0 && u < 1 && segDist(X, Z, a, b) < 1.3 + 1.6 * u) return true; }
  { const ax = Math.abs(Math.abs(X - MAN.x) - LL_LAT); if (ax < .9 && Math.abs(Z - MAN.z) > 10) return true; } // the Lamplighters' aisles on the 12:00 and 6:00 promenades
  { const az = Math.abs(Math.abs(Z - MAN.z) - LL_LAT); if (az < .9 && Math.abs(X - MAN.x) > 10) return true; } // and on the 3:00 and 9:00
  return false;
}
const GOLDEN_CAM = [287.5, -40];
const arriveAt = (R) => R() < .72 ? 165 + 30 * R() : 195 + 15 * R(); // most stake a spot through the late afternoon; stragglers at dusk
const RING = (() => { const R = mulberry(4501), out = [];
  const add = (a, r, row, j) => { const d = CLOCK(a), X = MAN.x + d[0] * r, Z = MAN.z + d[1] * r; if (keepOut(X, Z)) return;
    let aOut = 0; if (inCarBox(X, Z)) { for (let da = .02; da < 1.6 && !aOut; da += .02) for (const sg of [-1, 1]) { const q = CLOCK(a + sg * da); if (!aOut && !inCarBox(MAN.x + q[0] * r, MAN.z + q[1] * r) && !keepOut(MAN.x + q[0] * r, MAN.z + q[1] * r)) aOut = a + sg * da; } if (!aOut) return; } // waits beside the parked board, steps in once it leaves
    const dOut = aOut ? CLOCK(aOut) : d, ts = arriveAt(R), v = 1.3 + .8 * R(), walk = Math.min(18 + 80 * R(), Math.max(4, v * (214 - ts))), r0 = r + walk;
    const S = [MAN.x + dOut[0] * r0, MAN.z + dOut[1] * r0]; if (Math.hypot(S[0] - GOLDEN_CAM[0], S[1] - GOLDEN_CAM[1]) < 14 || (ts + walk / v > 192 && segDist(GOLDEN_CAM[0], GOLDEN_CAM[1], S, [MAN.x + dOut[0] * r, MAN.z + dOut[1] * r]) < 9)) return; // nobody fades in next to the dusk camera or walks through it
    const i = out.length;
    out.push({ a, r, X, Z, d, dOut, aOut, row, j, sit: !aOut && r < 52, ts, r0, ta: ts + walk / Math.max(v, walk / Math.max(.1, 214 - ts)), lat: (R() - .5) * 2.4, i,
      col: COLS[i % 7], hatc: COLS[(i + 3) % 7], hat: i % 6, cape: i % 4 === 1, skin: ['#e8d4b4', '#c99a74', '#8c6448', '#f0dcc4'][i % 4], led: R() < .3 ? LEDS[i % 5] : null,
      ballot: row <= 1 || R() < .78, lantern: i % 11 === 0, runner: rnd(i, 77) < .135, tl: 262 + 3.4 * rnd(i, 78) }); };
  // the two front rows: evenly spaced round the ring, the second row in the gaps of the first, so their raised ballots
  // line up like teeth from above (Dali's DI-3 on outro 3)
  for (let row = 0; row < 2; row++) { const n = row ? 176 : 200, r0 = row ? 45.9 : 44.6; for (let j = 0; j < n; j++) add((j + .5 + row * .5 + (R() - .5) * .16) / n * 12, r0 + R() * .3, row, j); }
  let tries = 0; while (out.length < 900 && tries < 30000) { tries++; const r = 47.2 + 14 * Math.pow(R(), .85); add(R() * 12, r, 2 + Math.floor((r - 47.2) / 1.25), -1); }
  return out; })();
const CROWD = RING; // draft-2 name
// the thick of it: a few thousand more as instanced dots, so the ring reads as one solid mass from the aerial
const DOTS = (() => { const R = mulberry(5150), out = []; let n = 0;
  while (out.length < 4200 && n < 30000) { n++; const a = R() * 12, r = 46 + 19 * Math.pow(R(), .9), d = CLOCK(a), X = MAN.x + d[0] * r, Z = MAN.z + d[1] * r; const ts = arriveAt(R), c = R() * 7 | 0, led = R() < .22 ? (R() * 5 | 0) : -1;
    if (inCarBox(X, Z) || Math.abs(Math.abs(X - MAN.x) - LL_LAT) < .9 || Math.abs(Math.abs(Z - MAN.z) - LL_LAT) < .9) continue; out.push({ X, Z, ts, c, led }); }
  return out; })();
const DROP = 256.3; // the perimeter drops a beat after the Man is down
let CS = { t: NaN, list: null };
function crowdState(t) { // every ring member's place and pose at song time t (a pure function, cached for this frame only)
  if (CS.t === t) return CS.list; const out = [];
  if (t >= 165) for (const m of RING) {
    if (t < m.ts) continue;
    let sitA = m.sit ? 1 : 0, run = 0; const u = clamp((t - m.ts) / (m.ta - m.ts)); let r = lerp(m.r0, m.r, u), moving = u < 1, alpha = ease(t, m.ts, m.ts + 1.4); if (m.sit) sitA = ease(t, m.ta, m.ta + .6);
    let aa = m.a; if (m.aOut) { const w = t < m.ta ? 0 : ease(t, 239.6 + rnd(m.i, 36) * .8, 241.4 + rnd(m.i, 36) * .8); aa = lerp(m.aOut, m.a, w); if (w > 0 && w < 1) moving = true; }
    if (t > DROP - .2) { const dl = rnd(m.i, 37); sitA *= 1 - ease(t, DROP + dl * .6, DROP + .5 + dl * .6); // everyone gets up
      if (m.runner) { const tau = t - (DROP + .3 + .8 * dl); if (tau > 0) { const rt = 18 + 8 * rnd(m.i, 38), Tin = Math.max(.1, (r - rt) / 6); // sprint in, already curving, then round the fire counter-clockwise at 2.5 m/s
          r = tau < Tin ? r - 6 * tau : rt; aa -= Math.max(0, tau - Tin * .3) * 2.5 / rt * 12 / TAU; moving = true; run = 1; } alpha *= 1 - ease(t, m.tl, m.tl + .6); }
      else { const s0 = DROP + .5 + dl; r -= (2 + 4 * rnd(m.i, 39)) * ease(t, s0, s0 + 4); if (t > s0 && t < s0 + 4) moving = true; alpha *= 1 - ease(t, 259.5 + 3 * rnd(m.i, 35), 261.5 + 3 * rnd(m.i, 35)); } }
    const dd = CLOCK(aa); let X = MAN.x + dd[0] * r, Z = MAN.z + dd[1] * r; if (moving && !run) { const w = Math.sin((t - m.ts) * .7 + m.i) * m.lat * .4; X += -dd[1] * w; Z += dd[0] * w; }
    if (t > 184 && t < 262 && (t < 206.5 || t > 237.5)) { const ax = carX(t), az = carZ(t), bx = carX(t + 1.6), bz = carZ(t + 1.6), sd0 = segDist(X, Z, [ax, az], [bx, bz]); // people part for the table as it rolls in and as it rolls away
      if (sd0 < 4) { const L = Math.hypot(bx - ax, bz - az) || 1, nx = -(bz - az) / L, nz = (bx - ax) / L, sd = ((X - ax) * nx + (Z - az) * nz) >= 0 ? 1 : -1, push = (4 - sd0) * .9; X += nx * sd * push; Z += nz * sd * push; moving = true; sitA *= .3; } }
    if (alpha <= .01) continue;
    out.push({ m, X, Z, alpha, sit: sitA, run, step: run ? Math.sin(t * 11 + m.i) * .32 : moving ? Math.sin(t * 6.5 + m.i) * .18 : 0, lift: run ? 0 : voteLift(m, t) });
  }
  CS = { t, list: out }; return out;
}
// after the drop, anyone whose feet would land low in the frame fades out, so Little Bob's walk along the bottom stays
// clear (their feet stay above about y 790, well above his feet at 994; a short fade, so nobody hangs there as a ghost)
const footFade = (t, p) => t < 255 ? 1 : clamp((805 - p[1]) / 14);
// ---------- the ballots: the people vote, one more row each time ----------
// vote 1 the front row, vote 2 two rows, vote 3 the whole ring, vote 4 the ring and the riders on the parked art cars.
// Vote 3 is Dali's double image (DI-3): the two front rows hold their ballots up, upright and even, so from the drone
// 26 m up the near arc of the ring reads as a grin; on "people" every fourth one drops like a knocked-out tooth, and on
// "broke" the rest let go into the heat and go up as embers.
const GR = { joke: wt(37, 'joke'), people: wt(37, 'people'), broke: wt(37, 'broke') };
function inWave(m, w) { if (!m.ballot) return false; return w === 0 ? m.row === 0 : w === 1 ? m.row <= 1 : true; }
function waveTimes(m, w, extra) { const tv = VOTES[w], st = rnd(m.i, w, 41) * .45 + (extra ? 1.3 : 0);
  // the grin is the near arc only: the far front rows let go as usual, so the teeth make a grin, not an O
  if (w === 2 && m.row <= 1 && m.Z < MAN.z - 8) { const grin = true; return { up: tv + st - .3, rel: GR.broke + (grin ? .06 * rnd(m.i, 44) : .15 + .6 * rnd(m.i, 44)), drop: grin && m.j % 4 === 0 ? GR.people + .05 * rnd(m.i, 45) : 0, grin }; }
  return { up: tv + st - .3, rel: tv + .55 + st + rnd(m.i, w + 9, 42) * .5, drop: 0, grin: false }; }
function voteLift(m, t) { if (t < VOTES[0] - 1) return 0; let l = 0; for (let w = 0; w < 4; w++) { if (!inWave(m, w)) continue; const { up, rel, drop } = waveTimes(m, w, false), rel2 = w === 3 && m.i % 2 ? waveTimes(m, w, true).rel : rel;
  l = Math.max(l, ease(t, up, up + .35) * (1 - ease(t, rel2 + .4, rel2 + 1.6)) * (drop ? 1 - ease(t, drop + .15, drop + .5) : 1)); } return l; }

// ---------- the Rangers on the perimeter line ----------
// Real volunteers in khaki (not police, not paid): on one knee on the line as the fire starts, facing the crowd, backs
// to the Man. The board is the only vehicle inside the perimeter; when it drives out across the fire (238-253) every
// Ranger near it turns a flashlight on it, a steady beam, deadpan. When the Man is down they get up and clear the way.
const RANGERS = (() => { const out = []; const n = 46; for (let j = 0; j < n; j++) { const a = (j + .3) / n * 12, d = CLOCK(a), r = 42.4, X = MAN.x + d[0] * r, Z = MAN.z + d[1] * r;
  if (X > 276.6 && X < 293.5 && Z > -5.6 && Z < 5.6) continue; if (X > 278 && X < 286.5 && Z < 11) continue; if (CAM_KEEP.some((c) => Math.hypot(X - c[0], Z - c[1]) < 2)) continue; if (Math.hypot(X - POOR_W.X, Z - POOR_W.Z) < 2) continue;
  out.push({ j, a, d, X, Z, i: out.length }); } return out; })();
function rangerState(rg, t) {
  const alpha = ease(t, 205 + .03 * rg.j, 207 + .03 * rg.j) * (1 - ease(t, DROP + 1, DROP + 2.8)); if (alpha <= .01) return null;
  const kneel = ease(t, 219.2 + .05 * (rg.j % 7), 219.9 + .05 * (rg.j % 7)) * (1 - ease(t, DROP + .1, DROP + .6)), back = 3.5 * ease(t, DROP + .5, DROP + 2.8); // then off to their rally points
  // the beam's target: the board's DAY licence plate (car.js DAY_PLATE, car-local metres) when it exists, else the car's middle
  const pl = typeof DAY_PLATE !== 'undefined' && typeof carLocalToWorld === 'function' ? DAY_PLATE : null, pw = pl ? carLocalToWorld(t, pl.x, (pl.z0 + pl.z1) / 2) : [carX(t), carZ(t)];
  const X = rg.X + rg.d[0] * back, Z = rg.Z + rg.d[1] * back, cx = pw[0], cz = pw[1], dist = Math.hypot(carX(t) - X, carZ(t) - Z);
  const beam = t < 238 ? 0 : clamp((17 - dist) / 3) * ease(t, 238.3 + .5 * rnd(rg.j, 3), 238.7 + .5 * rnd(rg.j, 3)) * (1 - ease(t, 254.6, DROP)); // lights on as it comes near, steady
  return { X, Z, alpha, kneel, beam, car: [cx, pl ? (pl.y0 + pl.y1) / 2 : 1.05, cz] };
}
function rangerFig(x, y, k, s, sil, rim, t) { // one Ranger, feet at (x, y), k px per metre; sil: firelit from behind
  const kn = s.kneel, hipY = lerp(.9, .52, kn), sh = hipY + .6, khaki = sil ? '#2a2026' : '#b8a27a', pants = sil ? '#1d1520' : '#5e4630', hat = sil ? '#1d1520' : '#8a6d48';
  g.save(); g.translate(x, y); g.scale(k, k); g.lineCap = 'round'; g.lineJoin = 'round'; const lw = (w) => Math.max(w, 1 / k);
  const legs = (col, o) => { g.strokeStyle = col; g.lineWidth = lw(.13); g.beginPath();
    g.moveTo(-.08 + o, -hipY); g.lineTo(lerp(-.1, -.15, kn) + o, -lerp(.45, .44, kn)); g.lineTo(lerp(-.1, -.17, kn) + o, -.02); // the left leg: knee up when kneeling
    g.moveTo(.08 + o, -hipY); g.lineTo(lerp(.1, .16, kn) + o, -lerp(.45, .06, kn)); if (kn < .5) g.lineTo(.1 + o, -.02); g.stroke(); }; // the right knee down on the playa
  const body = (col, o) => { g.fillStyle = col; g.beginPath(); g.moveTo(-.2 + o, -hipY + .02); g.lineTo(-.24 + o, -sh + .06); g.quadraticCurveTo(-.24 + o, -sh - .04, -.08 + o, -sh - .04); g.lineTo(.08 + o, -sh - .04); g.quadraticCurveTo(.24 + o, -sh - .04, .24 + o, -sh + .06); g.lineTo(.2 + o, -hipY + .02); g.closePath(); g.fill(); };
  const head = (col, hcol, o) => { g.fillStyle = col; g.beginPath(); g.ellipse(o, -sh - .17, .11, .13, 0, 0, TAU); g.fill(); g.fillStyle = hcol; g.beginPath(); g.ellipse(o, -sh - .24, .27, .045, 0, 0, TAU); g.fill(); g.fillRect(o - .12, -sh - .38, .24, .14); };
  if (rim) { const o = .035; g.globalCompositeOperation = 'lighter'; legs(rim, o); body(rim, o); head(rim, rim, o); legs(rim, -o * .6); body(rim, -o * .6); head(rim, rim, -o * .6); g.globalCompositeOperation = 'source-over'; }
  legs(pants, 0); body(khaki, 0); head(sil ? '#1d1520' : '#c99a74', hat, 0);
  if (!sil) { g.fillStyle = '#6a4a2c'; g.fillRect(-.12, -sh + .14, .07, .09); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(.04, -sh, .2, .6); } // the brown mark on the chest
  // the flashlight: at his belt, or held out at the board
  const hand = s.beam > .02 ? [s.aim[0] * .5, -sh + .12 + s.aim[1] * .5] : [.27, -hipY - .02];
  g.strokeStyle = khaki; g.lineWidth = lw(.09); g.beginPath(); g.moveTo(.2, -sh + .08); g.lineTo(hand[0], hand[1]); g.stroke();
  g.fillStyle = sil ? '#120c10' : '#2a2a2e'; g.save(); g.translate(hand[0], hand[1]); g.rotate(s.beam > .02 ? Math.atan2(s.aim[1], s.aim[0]) : Math.PI / 2); g.fillRect(-.02, -.035, .19, .07);
  if (s.beam > .02) { g.fillStyle = `rgba(255,236,190,${.9 * s.beam})`; g.fillRect(.17, -.04, .03, .08); } g.restore();
  g.restore();
}
// the beam: a steady cone from his hand to the board, after the grade (never a flash)
function rangerBeam(s, t) { const h = P(s.X, s.kneel > .5 ? .86 : 1.25, s.Z), c = P(...s.car); if (h[2] < 1.5 || c[2] < 1.5) return; const kc = kAt(c), kh = kAt(h);
  const dx = c[0] - h[0], dy = c[1] - h[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, w0 = Math.max(1, .04 * kh), w1 = Math.max(2.5, .4 * kc);
  const bg = g.createLinearGradient(h[0], h[1], c[0], c[1]); bg.addColorStop(0, `rgba(255,238,200,${.26 * s.beam})`); bg.addColorStop(1, `rgba(255,238,200,${.05 * s.beam})`);
  g.fillStyle = bg; g.beginPath(); g.moveTo(h[0] + nx * w0, h[1] + ny * w0); g.lineTo(c[0] + nx * w1, c[1] + ny * w1); g.lineTo(c[0] - nx * w1, c[1] - ny * w1); g.lineTo(h[0] - nx * w0, h[1] - ny * w0); g.closePath(); g.fill(); }

// ---------- the poor woman from the bridge, in the front row with her empty bowl ----------
// Same costume as on the bridge (playa.js bmPoorInto): brown patched coat, red shawl and headscarf, the wooden bowl.
// She sits on the playa at the front-row edge from dusk. On each "broke" ash from the burnt ballots drifts down into
// her bowl: a third full on the first, full by the third. She is still sitting there when everyone else gets up.
const BROKES = [35, 36, 37].map((li) => wt(li, 'broke'));
const poorAsh = (t) => BROKES.reduce((a, b, i) => a + (i < 2 ? .34 : .32) * ease(t, b + .5, b + 1.9), 0);
function poorState(t) { const a = ease(t, 203, 205) * (1 - ease(t, 261.5, 264)); return a > .01 ? { X: POOR_W.X, Z: POOR_W.Z, alpha: a } : null; }
function poorFig(x, y, k, ash, t, sil, rim) { // seated, in her local metres (y up), bowl held in her lap
  g.save(); g.translate(x, y); g.scale(k, k); g.lineCap = 'round'; g.lineJoin = 'round';
  const pal = sil ? { leg: '#2e2428', boot: '#1d1520', coat: '#5a4434', coatD: '#3a2c24', shawl: '#7a2e22', scarf: '#8a3a2e', skin: '#7a5440', bowl: '#6a4424', rimc: '#3a2412' } // firelit from behind, but still her colours
    : { leg: '#3a2e26', boot: '#2a201a', coat: '#7d6248', coatD: '#4e3c2c', shawl: '#8a3a2c', scarf: '#a04a3a', skin: '#c99a72', bowl: '#8a5a2c', rimc: '#4a2c14' };
  const shape = (p, o) => {
    g.fillStyle = p.leg; g.beginPath(); g.ellipse(o, -.14, .36, .14, 0, 0, TAU); g.fill(); // crossed legs
    g.fillStyle = p.boot; g.beginPath(); g.ellipse(-.3 + o, -.06, .09, .05, 0, 0, TAU); g.ellipse(.3 + o, -.06, .09, .05, 0, 0, TAU); g.fill();
    g.fillStyle = p.coat; g.beginPath(); g.moveTo(-.27 + o, -.18); g.lineTo(-.2 + o, -.84); g.lineTo(.17 + o, -.84); g.lineTo(.27 + o, -.18); g.closePath(); g.fill(); // her coat
    if (!sil && p === pal) { g.fillStyle = '#9a8462'; g.fillRect(-.16, -.5, .12, .12); g.fillStyle = '#5e5a48'; g.fillRect(.06, -.72, .1, .09); g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(.04, -.84, .2, .66); } // patches
    g.fillStyle = p.shawl; g.beginPath(); g.moveTo(-.24 + o, -.88); g.lineTo(.21 + o, -.88); g.lineTo(.26 + o, -.6); g.lineTo(-.28 + o, -.56); g.closePath(); g.fill(); // the shawl
    g.strokeStyle = p.coatD; g.lineWidth = Math.max(.09, 1 / k); g.beginPath(); g.moveTo(-.2 + o, -.8); g.lineTo(-.18 + o, -.5); g.lineTo(-.04 + o, -.43); g.moveTo(.18 + o, -.8); g.lineTo(.2 + o, -.5); g.lineTo(.06 + o, -.43); g.stroke(); // arms round the bowl
    g.fillStyle = p.skin; g.fillRect(-.03 + o, -.95, .07, .08); g.beginPath(); g.ellipse(.01 + o, -1.04, .1, .12, 0, 0, TAU); g.fill();
    g.fillStyle = p.scarf; g.beginPath(); g.moveTo(-.12 + o, -1.0); g.lineTo(-.07 + o, -1.18); g.lineTo(.1 + o, -1.17); g.lineTo(.13 + o, -1.04); g.lineTo(.03 + o, -1.12); g.lineTo(-.04 + o, -.9); g.closePath(); g.fill(); // headscarf
    g.fillStyle = p.bowl; g.beginPath(); g.ellipse(o, -.42, .25, .1, 0, 0, Math.PI); g.closePath(); g.fill(); g.fillStyle = p.rimc; g.beginPath(); g.ellipse(o, -.42, .25, .05, 0, 0, TAU); g.fill(); }; // the bowl
  if (rim) { g.globalCompositeOperation = 'lighter'; const rp = { leg: rim, boot: rim, coat: rim, coatD: rim, shawl: rim, scarf: rim, skin: rim, bowl: rim, rimc: rim }; shape(rp, .03); shape(rp, -.02); g.globalCompositeOperation = 'source-over'; }
  shape(pal, 0);
  if (ash > .01) { const h = .02 + .1 * ash; g.fillStyle = '#7d7672'; g.beginPath(); g.ellipse(0, -.43, .22 * Math.min(1, .4 + ash), h, 0, Math.PI, TAU); g.fill(); g.fillStyle = '#5c5552'; g.fillRect(-.12, -.43 - h * .5, .05, .02); // grey ballot ash, heaping up
    g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) { const gl = .5 + .5 * n1(1700 + i, t * 1.3); g.fillStyle = `rgba(255,130,50,${.55 * gl * Math.min(1, ash * 2)})`; g.fillRect(-.14 + i * .08, -.43 - h * (.3 + .4 * rnd(i, 17)), .025, .025); } g.globalCompositeOperation = 'source-over'; }
  g.restore();
}
function poorAshFlakes(t) { // on each "broke": flakes of ballot ash drift down out of the dark into her bowl
  for (let b = 0; b < 3; b++) { const t0 = BROKES[b] - .3, u0 = (t - t0) / 2.2; if (u0 < 0 || u0 > 1.15) continue;
    for (let i = 0; i < 16; i++) { const j = b * 16 + i, u = clamp(u0 - .12 * rnd(j, 61)); if (u <= 0 || u >= 1) continue; const e = 1 - (1 - u) * (1 - u);
      const X = lerp(POOR_W.X + (rnd(j, 62) - .5) * 5, POOR_W.X, e) + n1(1800 + j, t * .9) * .5 * (1 - e), Y = lerp(4 + 3 * rnd(j, 63), .44, e), Z = lerp(POOR_W.Z + (rnd(j, 64) - .5) * 3, POOR_W.Z, e);
      const p = P(X, Y, Z); if (p[2] < 1.5) continue; const s = Math.max(1.5, .07 * kAt(p)), hot = j % 4 === 0;
      g.fillStyle = hot ? 'rgba(255,140,60,.8)' : 'rgba(150,142,138,.85)'; g.save(); g.translate(p[0], p[1]); g.rotate(t * 3 + j); g.fillRect(-s / 2, -s / 3, s, s * .66); g.restore(); } }
}

// ---------- drawing people ----------
function person(x, y, k, o, c) { // c = {body, skin, dark, lamp}; o = {step, lift, lantern, hat, cape, sit}
  if (k < 6) return tinyPerson(x, y, k, o, c);
  const sy = (o.sit || 0) * .62; y += 0; // sitting on the playa: the body drops, the knees come up in front
  g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = c.dark; g.lineWidth = Math.max(1, .12 * k);
  if (sy > .3) { g.fillStyle = c.dark; g.beginPath(); g.ellipse(x, y - .2 * k, .42 * k, .22 * k, 0, 0, TAU); g.fill(); } // sitting cross-legged on the playa: the knees and lap under the body
  else { g.beginPath(); g.moveTo(x - .08 * k, y - .84 * k); g.lineTo(x - (.1 + o.step) * k, y - .03 * k); g.moveTo(x + .08 * k, y - .84 * k); g.lineTo(x + (.1 + o.step) * k, y - .03 * k); g.stroke(); }
  y += sy * k;
  const fl = o.cape ? .38 : .2; g.fillStyle = c.body; g.beginPath(); g.moveTo(x - fl * k, y - .78 * k); g.lineTo(x - .23 * k, y - 1.34 * k); g.quadraticCurveTo(x - .24 * k, y - 1.5 * k, x - .09 * k, y - 1.52 * k);
  g.lineTo(x + .09 * k, y - 1.52 * k); g.quadraticCurveTo(x + .24 * k, y - 1.5 * k, x + .23 * k, y - 1.34 * k); g.lineTo(x + fl * k, y - .78 * k); g.closePath(); g.fill();
  g.strokeStyle = c.body; g.lineWidth = Math.max(1, .085 * k); g.beginPath(); g.moveTo(x - .21 * k, y - 1.4 * k); g.quadraticCurveTo(x - .31 * k, y - 1.15 * k, x - .27 * k, y - .92 * k); g.stroke(); // the arm that hangs
  g.fillStyle = c.skin; g.fillRect(x - .05 * k, y - 1.6 * k, .1 * k, .1 * k); g.beginPath(); g.ellipse(x, y - 1.69 * k, .12 * k, .145 * k, 0, 0, TAU); g.fill();
  if (o.hat === 1) { g.fillStyle = c.dark; g.fillRect(x - .1 * k, y - 2.08 * k, .2 * k, .3 * k); g.fillRect(x - .17 * k, y - 1.81 * k, .34 * k, .05 * k); }
  else if (o.hat === 2) { g.fillStyle = c.hatc || c.body; g.beginPath(); g.ellipse(x, y - 1.8 * k, .3 * k, .06 * k, 0, 0, TAU); g.fill(); g.fillRect(x - .11 * k, y - 1.95 * k, .22 * k, .15 * k); }
  else if (o.hat === 3) { g.fillStyle = c.hatc || c.body; g.beginPath(); g.moveTo(x - .11 * k, y - 1.76 * k); g.lineTo(x - .2 * k, y - 2.04 * k); g.lineTo(x - .03 * k, y - 1.82 * k); g.moveTo(x + .11 * k, y - 1.76 * k); g.lineTo(x + .2 * k, y - 2.04 * k); g.lineTo(x + .03 * k, y - 1.82 * k); g.fill(); }
  if (o.lift > 0) { g.strokeStyle = c.body; g.lineWidth = Math.max(1, .085 * k); g.beginPath(); g.moveTo(x + .19 * k, y - 1.42 * k); g.lineTo(x + .3 * k, y - lerp(1.3, 2.25, o.lift) * k); g.stroke(); }
  if (o.lantern) { g.strokeStyle = c.dark; g.lineWidth = Math.max(1, .04 * k); g.beginPath(); g.moveTo(x - .26 * k, y - 1.0 * k); g.lineTo(x - .42 * k, y - 2.6 * k); g.stroke(); g.fillStyle = c.lamp; g.fillRect(x - .53 * k, y - 2.62 * k, .22 * k, .3 * k); }
}
function tinyPerson(x, y, k, o, c) { // a far figure: body, head, the raised arm; cheap enough for a ring of hundreds
  const sy = (o.sit || 0) * .62; y += sy * k; g.fillStyle = c.body; g.fillRect(x - .2 * k, y - 1.5 * k, .4 * k, .7 * k);
  g.fillStyle = c.dark; if (sy < .3) g.fillRect(x - .16 * k, y - .82 * k, .32 * k, .82 * k - sy * k); else g.fillRect(x - .36 * k, y - .55 * k, .72 * k, .25 * k);
  g.fillStyle = c.skin; g.fillRect(x - .12 * k, y - 1.83 * k, .24 * k, .3 * k);
  if (o.lift > 0) { g.fillStyle = c.body; g.fillRect(x + .2 * k, y - lerp(1.3, 2.25, o.lift) * k, Math.max(1, .1 * k), lerp(.1, .9, o.lift) * k); }
}
// the Rangers and the poor woman, as {X, Z, alpha, h, draw(p, k, sil, rim)} for the depth list and the silhouette pass
function extrasEach(t, fn) {
  if (t < 203) return;
  for (const rg of RANGERS) { const s = rangerState(rg, t); if (!s) continue;
    fn({ X: s.X, Z: s.Z, alpha: s.alpha, h: s.kneel > .5 ? 1.1 : 1.8, draw: (p, k, sil, rim) => { const hipY = lerp(.9, .52, s.kneel), ch = [p[0], p[1] - (hipY + .5) * k], c = P(...s.car); let aim = [1, 0];
      if (c[2] > .5) { const dx = c[0] - ch[0], dy = c[1] - ch[1], L = Math.hypot(dx, dy) || 1; aim = [dx / L, dy / L]; } rangerFig(p[0], p[1], k, { ...s, aim }, sil, rim, t); } }); }
  const pw = poorState(t); if (pw) fn({ X: pw.X, Z: pw.Z, alpha: pw.alpha, h: 1.1, draw: (p, k, sil, rim) => poorFig(p[0], p[1], k, poorAsh(t), t, sil, rim) });
}
const DOTS_BY = COLS.map((_, c) => DOTS.filter((d) => d.c === c));
function dotsInto(t, list) { // the instanced crowd, cross-fading into the drawn figures: from far off (the aerial and the
  // descent) a coloured mass; from a high drone at night (DI-3) a dark carpet of heads that the raised ballots stand out on
  const mp = P(MAN.x, 0, MAN.z); if (mp[2] < 1) return; const km = kAt(mp), a = clamp((5 - km) / 2), hi = (1 - a) * clamp((C.y - 9) / 7) * nightAmt(t); if (a <= .01 && hi <= .01) return;
  list.push({ z: mp[2] + 60, draw: () => { g.save();
    if (a > .01) { const s = Math.max(1, .5 * km); g.globalAlpha = a * (1 - .4 * nightAmt(t)); DOTS_BY.forEach((ds, c) => { g.fillStyle = COLS[c]; g.beginPath(); for (const d of ds) { if (t < d.ts) continue; const p = P(d.X, 0, d.Z); if (p[2] < 1) continue; g.rect(p[0] - s / 2, p[1] - s * 1.3, s, s * 1.3); } g.fill(); }); }
    if (hi > .01) { g.globalAlpha = hi * .8; g.fillStyle = '#2a1f2a'; g.beginPath(); // the seated mass itself: one dark band, ten rows and more deep
      for (let i = 0; i <= 96; i++) { const a = i / 96 * 12, d = CLOCK(a), r = 61.5 + 1.2 * n1(2200, a * 3), p = P(MAN.x + d[0] * r, 0, MAN.z + d[1] * r); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.closePath();
      for (let i = 96; i >= 0; i--) { const a = i / 96 * 12, d = CLOCK(a), r = 46.5 + .3 * n1(2201, a * 5), p = P(MAN.x + d[0] * r, 0, MAN.z + d[1] * r); i < 96 ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.closePath(); g.fill('evenodd');
      g.globalAlpha = hi * .92; g.fillStyle = '#1f1620'; g.beginPath(); for (const d of DOTS) { if (t < d.ts) continue; const p = P(d.X, .9, d.Z); if (p[2] < 2 || p[0] < -20 || p[0] > W + 20 || p[1] < -20 || p[1] > H + 20) continue; const r = .24 * kAt(p); g.moveTo(p[0] + r, p[1]); g.arc(p[0], p[1], r, 0, TAU); } g.fill(); }
    g.restore(); } });
}
function crowdInto(t, list) {
  if (t < 165) return; const night = t >= 218.5, manZ = P(MAN.x, 0, MAN.z)[2];
  dotsInto(t, list);
  const cs = crowdState(t);
  for (const c of cs) { const p = P(c.X, 0, c.Z); if (p[2] < 1.2 || p[0] < -150 || p[0] > W + 150 || p[1] < -50) continue;
    if (night && (p[2] < manZ || c.run)) continue; // in front of the fire (and the runners after the fall): drawn after the fire, as silhouettes (ballotEmbers)
    const m = c.m, k = kAt(p); if (k < .25) continue; const al = c.alpha * clamp((p[2] - 1.8) / 1.6) * footFade(t, p); if (al <= .01) continue; // nobody drawn right in the lens
    list.push({ z: p[2], draw: () => { if (k < 1.2) { g.fillStyle = m.col; g.globalAlpha = al; g.fillRect(p[0] - .25 * k, p[1] - 1.8 * k, Math.max(1, .5 * k), Math.max(1, 1.8 * k)); g.globalAlpha = 1; return; }
      g.save(); g.globalAlpha = al; person(p[0], p[1], k, { step: c.step, lift: c.lift, lantern: m.lantern, hat: m.hat, cape: m.cape, sit: c.sit }, { body: m.col, skin: m.skin, dark: '#3a3040', lamp: '#f0d49a', hatc: m.hatc }); g.restore(); },
      shadow: k > 3 ? () => shadowStick(c.X, 0, 1.9 - c.sit, c.Z, .45, t) : null });
  }
  extrasEach(t, (e) => { const p = P(e.X, 0, e.Z); if (p[2] < 1.5 || p[0] < -150 || p[0] > W + 150 || p[1] < -50) return; if (night && p[2] < manZ) return; const k = kAt(p); if (k < .6) return;
    const al = e.alpha * footFade(t, p); if (al <= .01) return;
    list.push({ z: p[2], draw: () => { g.save(); g.globalAlpha = al; e.draw(p, k, false, null); g.restore(); }, shadow: k > 3 ? () => shadowStick(e.X, 0, e.h, e.Z, .45, t) : null }); });
}

// ---------- the Lamplighters (draft 9: the real ritual, the right way round) ----------
// Draft 7 lit the lamps outward from the Man like streetlights and walked a file in toward him. The real Lamplighters
// leave Center Camp at a walk and light every spire by hand: in along the 6:00 promenade to the Man and on out along
// the 12:00 to the Temple; other groups light the 3:00 and 9:00 promenades walking in from the Esplanade. They split into
// groups, each with a stretch of three spire pairs, so a spire is lit behind the walkers and dark ahead of them.
// White robes with a flame pattern round the hem, a sash, lanterns hanging from the poles. Two files per group, one on
// each row of spires; the leader of each file stands his pole up and hangs the lantern, the file waits, then walks on.
// The protected 3:18 golden wide keeps its moment: the 12:00 group hangs the first pair (60 m) at 198 and 198.2, walking
// out toward the Temple, toward the camera.
// lampLitT(X, Z): the song time the spire at (X, Z) gets its lantern (Infinity if never); playa.js lampLit uses it.
const LL = { N: 5, V: 1.19, GAP: 5.2, HANG: 2.2, lat: LL_LAT, SP: 20, D0: 60, SEG: 3 };
LL.PAIR = LL.SP / LL.V + LL.HANG; // about 19 s from one spire to the next: walk 20 m, hang the lantern
const LL_ESP = typeof BRC !== 'undefined' && BRC.ESP ? BRC.ESP : 760;
const LL_PROMS = [{ a: 12, out: 1, r1: 722 }, { a: 6, out: 0, r1: 846 }, { a: 3, out: 0, r1: LL_ESP }, { a: 9, out: 0, r1: LL_ESP }]
  .map((p) => ({ ...p, u: CLOCK(p.a), n: Math.floor((p.r1 - LL.D0) / LL.SP + 1e-6) + 1 }));
const llSegT0 = (pr, s) => pr.a === 12 && s === 0 ? 198 : 184 + 14 * rnd(pr.a, s, 7); // when a group hangs its first lantern
function llOrder(pr, n) { const s = Math.floor(n / LL.SEG), cnt = Math.min(LL.SEG, pr.n - s * LL.SEG), o = n - s * LL.SEG; return [s, pr.out ? o : cnt - 1 - o, cnt]; }
function lampLitT(X, Z) {
  const dx = X - MAN.x, dz = Z - MAN.z;
  for (const pr of LL_PROMS) { const al = dx * pr.u[0] + dz * pr.u[1], lat = -dx * pr.u[1] + dz * pr.u[0]; if (al < LL.D0 - 12 || Math.abs(lat) > 12) continue;
    const n = Math.round((al - LL.D0) / LL.SP); if (n < 0 || n >= pr.n) return Infinity; const [s, k] = llOrder(pr, n); return llSegT0(pr, s) + k * LL.PAIR + (lat > 0 ? .2 : 0); }
  return Infinity;
}
// the groups: one per stretch of three spire pairs on each promenade
const LL_GROUPS = []; LL_PROMS.forEach((pr) => { for (let s = 0; s * LL.SEG < pr.n; s++) { const cnt = Math.min(LL.SEG, pr.n - s * LL.SEG), ds = [];
  for (let k = 0; k < cnt; k++) ds.push(LL.D0 + LL.SP * (s * LL.SEG + (pr.out ? k : cnt - 1 - k))); LL_GROUPS.push({ pr, s, ds, T0: llSegT0(pr, s), dir: pr.out ? 1 : -1, i: LL_GROUPS.length }); } });
function llLead(gp, f, t) { // the leader of file f: distance from the Man along the promenade, and how far through a hang (-1 if not hanging)
  const off = f ? .2 : 0, A = (k) => gp.T0 + k * LL.PAIR + off - .55 * LL.HANG, n = gp.ds.length;
  if (t < A(0)) return { d: gp.ds[0] - gp.dir * LL.V * (A(0) - t), hang: -1, k: 0 };
  for (let k = 0; k < n; k++) { const a = A(k), b = a + LL.HANG; if (t < b) return { d: gp.ds[k], hang: (t - a) / LL.HANG, k };
    if (k + 1 < n && t < A(k + 1)) return { d: gp.ds[k] + gp.dir * LL.V * (t - b), hang: -1, k: k + 1 }; }
  return { d: gp.ds[n - 1] + gp.dir * LL.V * (t - A(n - 1) - LL.HANG), hang: -1, k: n, done: t - A(n - 1) - LL.HANG }; }
function llState(gp, f, q, t) { // where member q of file f (0 = the left row of spires, 1 = the right) is, and what his pole is doing
  const L = llLead(gp, f, t), sd = f ? 1 : -1, pr = gp.pr, d = L.d - gp.dir * LL.GAP * q, hang = q === 0 ? L.hang : -1;
  const n = [-pr.u[1], pr.u[0]], X = MAN.x + pr.u[0] * d + n[0] * LL.lat * sd, Z = MAN.z + pr.u[1] * d + n[1] * LL.lat * sd;
  let alpha = ease(t, gp.T0 - 42, gp.T0 - 40) * clamp((d - 12) / 3); // they appear from far up the promenade (or from behind the base)
  if (L.done != null) alpha *= 1 - clamp((L.done - 8) / 3); // and once their stretch is lit they walk on into the crowd
  let has = true; if (q === 0) { if (hang >= 0) has = hang < .55; else if (L.k >= gp.ds.length) has = false; else if (L.k > 0) has = t - (gp.T0 + (L.k - 1) * LL.PAIR + (f ? .2 : 0) + .45 * LL.HANG) > .8; } // the leader takes a fresh lantern off the file after each hang
  const up = hang < 0 ? 0 : hang < .45 ? smooth(hang / .45) : hang < .6 ? 1 : 1 - smooth((hang - .6) / .4);
  const walking = L.hang < 0, sw = walking ? Math.sin(t * 4.2 + q + f) * .1 : 0;
  const sh = [X, 1.35, Z], carry = [X + gp.dir * pr.u[0] * (1.4 + sw), 2.95, Z + gp.dir * pr.u[1] * (1.4 + sw)];
  const ln = typeof LAMPS !== 'undefined' && q === 0 && hang >= 0 ? llSpire(gp, L.k, sd) : null, hook = ln ? [ln.X + (ln.ax || 0) * .92, typeof LAMP_ARM !== 'undefined' ? LAMP_ARM : 4.45, ln.Z + (ln.az || 0) * .92] : carry;
  const tip = [lerp(carry[0], hook[0], up), lerp(carry[1], hook[1], up), lerp(carry[2], hook[2], up)];
  return { X, Z, hang, has, alpha, d, sh, tip, up, walking, lead: q === 0 };
}
function llSpire(gp, k, sd) { const d = gp.ds[Math.min(k, gp.ds.length - 1)], pr = gp.pr, n = [-pr.u[1], pr.u[0]], X = MAN.x + pr.u[0] * d + n[0] * 6 * sd, Z = MAN.z + pr.u[1] * d + n[1] * 6 * sd;
  let best = null, bd = 4; for (const l of LAMPS) { const e = Math.abs(l.X - X) + Math.abs(l.Z - Z); if (e < bd) { bd = e; best = l; } } return best || { X, Z, ax: -n[0] * sd, az: -n[1] * sd }; }
function llLantern(x, y, k, lit) { // a box lantern hanging from the tip of a pole
  const s = Math.max(k, 6); g.strokeStyle = '#2a2420'; g.lineWidth = Math.max(1, .02 * k); g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + .06 * k); g.stroke();
  g.fillStyle = '#2e2622'; g.beginPath(); g.moveTo(x - .14 * s, y + .12 * s); g.lineTo(x, y + .05 * s); g.lineTo(x + .14 * s, y + .12 * s); g.closePath(); g.fill();
  g.fillStyle = lit ? '#f2cf86' : '#d9cdb2'; g.fillRect(x - .1 * s, y + .12 * s, .2 * s, .26 * s); g.fillStyle = '#2e2622'; g.fillRect(x - .12 * s, y + .37 * s, .24 * s, .05 * s);
}
function lamplighter(s, t) { // a figure in a white robe with a flame-pattern hem and a sash, with his pole and lantern
  const p = P(s.X, 0, s.Z); if (p[2] < 1.5) return; const k = kAt(p); if (k < .8) return; const x = p[0], y = p[1] - (s.walking ? Math.abs(Math.sin(t * 4.2)) * .03 * k : 0);
  g.save(); g.globalAlpha = s.alpha;
  if (k < 5) { g.fillStyle = '#f2eee4'; g.fillRect(x - .3 * k, y - 1.5 * k, .6 * k, 1.5 * k); g.fillStyle = '#d2562a'; g.fillRect(x - .3 * k, y - .2 * k, .6 * k, Math.max(1, .2 * k)); g.fillStyle = '#c99a74'; g.fillRect(x - .11 * k, y - 1.8 * k, .22 * k, .28 * k); }
  else {
    g.fillStyle = '#f4f0e6'; g.beginPath(); g.moveTo(x - .36 * k, y); g.lineTo(x - .27 * k, y - 1.3 * k); g.quadraticCurveTo(x - .27 * k, y - 1.5 * k, x - .1 * k, y - 1.52 * k); g.lineTo(x + .1 * k, y - 1.52 * k); g.quadraticCurveTo(x + .27 * k, y - 1.5 * k, x + .27 * k, y - 1.3 * k); g.lineTo(x + .36 * k, y); g.closePath(); g.fill(); // the white robe, to the ground
    g.fillStyle = 'rgba(120,100,80,.2)'; g.fillRect(x + .06 * k, y - 1.45 * k, .26 * k, 1.45 * k);
    // the flame pattern round the hem: tongues of orange and red rising off the bottom edge
    g.fillStyle = '#d2562a'; g.beginPath(); g.moveTo(x - .36 * k, y); for (let i = 0; i <= 6; i++) { const u = i / 6, hx = x + lerp(-.355, .355, u) * k; g.lineTo(hx, y - (i % 2 ? .3 : .12) * k); } g.lineTo(x + .36 * k, y); g.closePath(); g.fill();
    g.fillStyle = '#b8301c'; g.beginPath(); g.moveTo(x - .36 * k, y); for (let i = 0; i <= 6; i++) { const u = i / 6, hx = x + lerp(-.355, .355, u) * k; g.lineTo(hx, y - (i % 2 ? .16 : .05) * k); } g.lineTo(x + .36 * k, y); g.closePath(); g.fill();
    g.fillStyle = '#c8402a'; g.fillRect(x - .29 * k, y - .98 * k, .58 * k, .08 * k); g.fillRect(x + .12 * k, y - .98 * k, .07 * k, .34 * k); // the sash and its tail
    g.strokeStyle = '#e8e2d4'; g.lineWidth = Math.max(1, .12 * k); g.lineCap = 'round'; g.beginPath(); g.moveTo(x - .24 * k, y - 1.42 * k); g.lineTo(x - .3 * k, y - 1.0 * k); g.lineTo(x - .12 * k, y - 1.1 * k); g.stroke(); // a sleeve
    g.fillStyle = '#c99a74'; g.beginPath(); g.ellipse(x, y - 1.68 * k, .12 * k, .145 * k, 0, 0, TAU); g.fill(); // the head, no face
    g.fillStyle = '#e6e0d2'; g.beginPath(); g.ellipse(x, y - 1.74 * k, .17 * k, .19 * k, 0, Math.PI * .92, Math.PI * 2.08); g.fill(); // a soft round cowl back on the head
  }
  // the pole: on the shoulder, tip forward and up; while hanging he stands it up to the spire's hook
  const a = P(...s.sh), b = P(...s.tip); if (a[2] > .5 && b[2] > .5) { const back = [lerp(a[0], b[0], -.3), lerp(a[1], b[1], -.3)];
    g.strokeStyle = '#5a4430'; g.lineWidth = Math.max(1, .05 * k); g.lineCap = 'round'; g.beginPath(); g.moveTo(back[0], back[1]); g.lineTo(b[0], b[1]); g.stroke();
    if (s.has) llLantern(b[0], b[1], kAt(b), true);
    if (!s.lead && k >= 5) llLantern(back[0], back[1], k, true); } // the others carry a lantern at each end of the pole
  g.restore();
}
function llEach(t, fn) { if (t < 140 || t > 250) return; for (const gp of LL_GROUPS) { if (t < gp.T0 - 42) continue; for (let f = 0; f < 2; f++) for (let q = 0; q < LL.N; q++) { const s = llState(gp, f, q, t); if (s.alpha > .01) fn(s, gp, f, q); } } }
function lamplightersInto(t, list) {
  llEach(t, (s) => { const p = P(s.X, 0, s.Z); if (p[2] < 1.5 || p[0] < -200 || p[0] > W + 200 || kAt(p) < .8) return; list.push({ z: p[2], draw: () => lamplighter(s, t), shadow: () => shadowStick(s.X, 0, 1.7, s.Z, .5, t) }); });
}
function lanternGlows(t) { // after the grade: the lanterns they carry glow, more as night comes (the hung ones are playa.js's)
  const n = .3 + .7 * ease(t, 199, 207);
  llEach(t, (s) => { if (!s.has) return; const q = P(...s.tip); if (q[2] < 1.5 || q[0] < -100 || q[0] > W + 100) return; const k = kAt(q); if (k < .8) return; glowAt(q[0], q[1] + .3 * Math.max(k, 6), Math.max(3, Math.min(1.3 * k, 80)), '255,200,120', .5 * n * s.alpha); });
}

// ---------- people biking in, art cars rolling out to the perimeter ----------
const BIKES_IN = (() => { const R = mulberry(733), out = []; while (out.length < 46) { const a = 1.6 + R() * 8.8, rp = 62 + R() * 4, d = CLOCK(a), X = MAN.x + d[0] * rp, Z = MAN.z + d[1] * rp; if (keepOut(X, Z) || inCarBox(X, Z)) continue;
  const ts = 193 + R() * 15, v = 4.2 + R() * 1.6, len = 40 + R() * 90; out.push({ a, d, rp, ts, ta: ts + len / v, len, col: COLS[out.length % 7], led: LEDS[out.length % 5], i: out.length }); } return out; })();
function bikeState(b, t) { if (t < b.ts) return null; const u = clamp((t - b.ts) / (b.ta - b.ts)), r = b.rp + b.len * (1 - u); return { X: MAN.x + b.d[0] * r, Z: MAN.z + b.d[1] * r, riding: u < 1, a: ease(t, b.ts, b.ts + 1.2) * (1 - ease(t, 255, 259)) }; }
function drawBike(b, s, t, glow) {
  const p = P(s.X, 0, s.Z); if (p[2] < 2) return; const k = kAt(p); if (k < 1) return; const x = p[0], y = p[1], dir = Math.sign(P(s.X - b.d[0], 0, s.Z - b.d[1])[0] - x) || 1, r = .34 * k, rot = s.riding ? -t * 9 * dir : 0;
  if (glow) { g.strokeStyle = `rgba(${b.led},${.75 * s.a})`; g.lineWidth = Math.max(1.2, .07 * k); for (const wx of [-.55, .55]) { g.beginPath(); g.arc(x + wx * dir * k, y - r, r, 0, TAU); g.stroke(); } return; }
  g.save(); g.globalAlpha = s.a; g.strokeStyle = '#2a2428'; g.lineWidth = Math.max(1, .05 * k); for (const wx of [-.55, .55]) { g.beginPath(); g.arc(x + wx * dir * k, y - r, r, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(x + wx * dir * k + Math.cos(rot) * r, y - r + Math.sin(rot) * r); g.lineTo(x + wx * dir * k - Math.cos(rot) * r, y - r - Math.sin(rot) * r); g.stroke(); }
  g.strokeStyle = b.col; g.lineWidth = Math.max(1, .06 * k); g.beginPath(); g.moveTo(x - .55 * dir * k, y - r); g.lineTo(x - .05 * dir * k, y - .82 * k); g.lineTo(x + .45 * dir * k, y - .82 * k); g.lineTo(x + .55 * dir * k, y - r); g.moveTo(x - .05 * dir * k, y - .82 * k); g.lineTo(x + .05 * dir * k, y - r); g.stroke();
  if (s.riding) person(x - .05 * dir * k, y - .25 * k, k, { step: Math.sin(t * 9 + b.i) * .08, lift: 0, hat: b.i % 6, cape: b.i % 3 === 0, sit: 0 }, { body: b.col, skin: '#e8d4b4', dark: '#3a3040', hatc: COLS[(b.i + 2) % 7] });
  g.restore();
}
// art cars: they drive in from the city, park in an outer ring behind the crowd and light up; the board car is one of them
const MV_KINDS = ['bus', 'ship', 'fish', 'dome', 'bus', 'snail', 'ship', 'dome'];
const MV = (() => { const R = mulberry(911), out = []; let tries = 0; while (out.length < 30 && tries < 2000) { tries++; const a = R() * 12, rp = 68 + R() * 12, d = CLOCK(a), X = MAN.x + d[0] * rp, Z = MAN.z + d[1] * rp;
  if (keepOut(X, Z) || inCarBox(X, Z) || Math.hypot(X - GOLDEN_CAM[0], Z - GOLDEN_CAM[1]) < 30 || out.some((o) => Math.hypot(o.X - X, o.Z - Z) < 13)) continue; const early = R() < .3, ts = early ? 166 + R() * 22 : 192 + R() * 13, len = 50 + R() * 70, v = 4 + R() * 2; // they roll out from the city over the evening
  out.push({ a, rp, d, X, Z, ts, ta: ts + len / v, len, kind: MV_KINDS[out.length % MV_KINDS.length], col: ['#c7362b', '#2f6fb5', '#e8b23a', '#3c8c5a', '#7a3c8c', '#e07a2f'][out.length % 6], led: LEDS[(out.length * 2) % 5], i: out.length }); } return out; })();
function mvState(c, t) { if (t < c.ts) return null; const u = clamp((t - c.ts) / (c.ta - c.ts)), r = c.rp + c.len * (1 - u), cv = 6 * (1 - u) * (1 - u); // it swings in on a gentle curve
  return { X: MAN.x + c.d[0] * r - c.d[1] * cv, Z: MAN.z + c.d[1] * r + c.d[0] * cv, moving: u < 1, a: ease(t, c.ts, c.ts + 1.5) * (1 - ease(t, 258, 263)) }; }
function mvShape(c, k) { // the car's outline in local metres (x along the car, y up) and its light points
  switch (c.kind) {
    case 'bus': return { body: [[-4.8, .7], [4.8, .7], [4.8, 3.4], [-4.8, 3.4]], top: [[-4.2, 3.4], [-4.2, 4.4], [2.4, 4.4], [2.4, 3.4]], lights: [[-4.6, 3.45, 4.6, 3.45], [-4.2, 4.45, 2.4, 4.45], [-4.8, 1.2, 4.8, 1.2]], wheels: [-3, 3] };
    case 'ship': return { body: [[-5.2, 1.5], [5.6, 2.2], [4.2, .7], [-4.4, .7]], top: [[-.12, 2], [.12, 2], [.12, 8.6], [-.12, 8.6]], lights: [[-5.2, 1.55, 5.6, 2.25], [0, 8.6, -5, 1.6], [0, 8.6, 5.4, 2.2]], wheels: [-3, 2.8] };
    case 'fish': return { body: [[-3.6, 2.2], [-1.6, 3.6], [1.8, 3.4], [3.6, 2.2], [1.8, .9], [-1.6, .9]], top: [[-3.6, 2.2], [-5.4, 3.4], [-5.2, 1]], lights: [[-1.6, 3.65, 1.8, 3.45], [1.8, .9, -1.6, .9], [-3.6, 2.2, 3.6, 2.2]], wheels: [-2, 2] };
    case 'dome': return { body: [[-3.8, .7], [3.8, .7], [3.8, 1.4], [-3.8, 1.4]], dome: 2.9, lights: [[-2.9, 1.5, 2.9, 1.5], [-2.05, 3.45, 2.05, 3.45], [0, 4.3, 0, 4.3]], wheels: [-2.6, 2.6] };
    default: return { body: [[-3.4, .7], [3.4, .7], [3.4, 1.6], [-3.4, 1.6]], snail: 2.4, lights: [[-3.4, 1.65, 3.4, 1.65], [-1.6, 4.1, 2.4, 3.2]], wheels: [-2.2, 2.2] };
  }
}
function drawMV(c, s, t, glow) {
  const p = P(s.X, 0, s.Z); if (p[2] < 3) return; const k = kAt(p); if (k < .35) return; const x = p[0], y = p[1], dir = s.moving ? (Math.sign(P(s.X - c.d[0], 0, s.Z - c.d[1])[0] - x) || 1) : (c.i % 2 ? 1 : -1), sh = mvShape(c, k);
  const L = (pt) => [x + pt[0] * dir * k, y - pt[1] * k];
  if (glow) { // the car's lights: strings of coloured bulbs along its edges and a soft wash under it
    const n = nightAmt(t) * s.a; if (n <= .02) return; glowAt(x, y - 1.2 * k, Math.max(4, 5 * k), c.led, .18 * n);
    for (const [x0, y0, x1, y1] of sh.lights) { const len = Math.hypot(x1 - x0, y1 - y0), nb = Math.max(1, Math.round(len / .55)); for (let i = 0; i <= nb; i++) { const u = nb ? i / nb : 0, q = L([lerp(x0, x1, u), lerp(y0, y1, u)]), tw = .6 + .4 * Math.sin(t * 5 + i * 1.7 + c.i);
      const s2 = Math.max(1.6, .13 * k); g.fillStyle = `rgba(${i % 3 === 0 ? c.led : i % 3 === 1 ? '255,214,140' : LEDS[(c.i + 1) % 5]},${.9 * n * tw})`; g.fillRect(q[0] - s2 / 2, q[1] - s2 / 2, s2, s2); } }
    return; }
  g.save(); g.globalAlpha = s.a; const poly2 = (pts, fill) => { g.beginPath(); pts.forEach((pt, i) => { const q = L(pt); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath(); g.fillStyle = fill; g.fill(); };
  for (const wx of sh.wheels) { const q = L([wx, .45]); g.fillStyle = '#17120f'; g.beginPath(); g.arc(q[0], q[1], .45 * k, 0, TAU); g.fill(); }
  poly2(sh.body, c.col); if (sh.top) poly2(sh.top, c.kind === 'ship' ? '#5a4430' : bmShade2(c.col, .7));
  if (c.kind === 'ship') { poly2([[.3, 3], [3.6, 3.4], [.3, 8]], '#efe6d2'); poly2([[-.3, 3], [-3.2, 3.4], [-.3, 7.2]], '#e2d6bc'); }
  if (sh.dome) { const q = L([0, 1.4]); g.fillStyle = '#e9e1cf'; g.beginPath(); g.arc(q[0], q[1], sh.dome * k, Math.PI, TAU); g.fill(); g.strokeStyle = 'rgba(90,70,50,.5)'; g.lineWidth = Math.max(1, .06 * k); g.beginPath(); for (let i = 1; i < 4; i++) { g.moveTo(q[0] - sh.dome * k, q[1] - i * .7 * k); g.lineTo(q[0] + sh.dome * k, q[1] - i * .7 * k); } g.stroke(); }
  if (sh.snail) { const q = L([.4, 1.6 + sh.snail]); g.strokeStyle = bmShade2(c.col, 1.25); g.lineWidth = Math.max(1, .5 * k); g.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * 5, rr = sh.snail * (1 - i / 46); i ? g.lineTo(q[0] + Math.cos(a) * rr * k, q[1] + Math.sin(a) * rr * k) : g.moveTo(q[0] + rr * k, q[1]); } g.stroke(); }
  if (c.kind === 'bus' && k > 4) { g.fillStyle = 'rgba(20,16,24,.7)'; for (let i = 0; i < 6; i++) { const q = L([-4.2 + i * 1.5, 2.9]); g.fillRect(q[0], q[1], 1.0 * k * dir, .9 * k); } }
  if (c.kind === 'fish') { const q = L([2.6, 2.5]); g.fillStyle = '#f4efe6'; g.beginPath(); g.arc(q[0], q[1], .3 * k, 0, TAU); g.fill(); }
  mvRiders(c, s, x, y, k, dir, t);
  g.restore();
}
// riders on the parked art cars: they stand on the deck to see over the crowd, and on the last "vote" they vote too
const MV_DECK = { bus: [4.4, [-3.4, -1.7, .3, 1.9]], ship: [1.9, [-3.4, -2.1, 2.4, 3.6]], fish: [3.55, [-1.1, .3, 1.5]], dome: [1.4, [-3.3, 3.3]], snail: [1.65, [-2.9, -1.9, 2.9]] };
function mvRiders(c, s, x, y, k, dir, t) {
  if (s.moving || k < 1.5 || t < 205) return; const dk = MV_DECK[c.kind] || MV_DECK.snail, tv = VOTES[3];
  dk[1].forEach((lx, i) => { const j = c.i * 5 + i, px = x + lx * dir * k, py = y - dk[0] * k, rel = tv + .7 + .6 * rnd(j, 72), lift = ease(t, tv - .2 + .4 * rnd(j, 71), tv + .15 + .4 * rnd(j, 71)) * (1 - ease(t, rel + .4, rel + 1.6));
    person(px, py, k, { step: 0, lift, hat: j % 6, cape: j % 3 === 0, sit: 0 }, { body: COLS[j % 7], skin: '#e0c4a4', dark: '#2a2430', hatc: COLS[(j + 3) % 7] });
    if (t > tv - .2 && t < rel + 5) { const bw = Math.max(2, .44 * k), bh = Math.max(2.6, .58 * k), hx = px + .3 * k, hy = py - (2.45 * k) * Math.max(lift, t > rel ? 1 : 0); // the ballot, then an ember on its way to the fire
      if (t < rel) { if (lift > .3) { g.fillStyle = '#efe2c4'; g.fillRect(hx - bw / 2, hy - bh / 2, bw, bh); g.fillStyle = '#2a2026'; g.fillRect(hx - bw * .3, hy - bh * .3, bw * .22, bw * .22); } }
      else { const a = t - rel, ex = hx + (a * a * .6 + n1(1900 + j, a) * .8) * k * (x < P(MAN.x, 0, MAN.z)[0] ? 1 : -1), ey = hy - (1.3 * a + .32 * a * a) * k, s2 = Math.max(2, .12 * k);
        g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,${150 + 50 * n1(1950 + j, t * 3) | 0},60,${.85 * (1 - a / 5)})`; g.fillRect(ex - s2 / 2, ey - s2 / 2, s2, s2); g.restore(); } } });
}
function bmShade2(h, f) { const c = hex(h); return rgb([Math.min(255, c[0] * f), Math.min(255, c[1] * f), Math.min(255, c[2] * f)]); }
function arrivalsInto(t, list) {
  if (t < 165) return;
  for (const b of BIKES_IN) { const s = bikeState(b, t); if (!s || s.a <= .01) continue; const p = P(s.X, 0, s.Z); if (p[2] < 2 || p[0] < -100 || p[0] > W + 100) continue; list.push({ z: p[2], draw: () => drawBike(b, s, t, false) }); }
  for (const c of MV) { const s = mvState(c, t); if (!s || s.a <= .01) continue; const p = P(s.X, 0, s.Z); if (p[2] < 3 || p[0] < -600 || p[0] > W + 600) continue;
    list.push({ z: p[2], draw: () => drawMV(c, s, t, false), shadow: () => shadowOf([[s.X - 4, 0, s.Z], [s.X + 4, 0, s.Z], [s.X, 4, s.Z]], t) }); }
}

// ---------- the Fire Conclave: dancers with fire inside the perimeter before the burn ----------
const CONCLAVE = [...Array(30)].map((_, j) => { const a = j / 30 * 12 + (rnd(j, 1) - .5) * .25, r = 21 + 8 * rnd(j, 2), d = CLOCK(a); let X = MAN.x + d[0] * r, Z = MAN.z + d[1] * r;
  return { j, a, r, d, X, Z, tool: j % 4, col: ['#1e1a22', '#3a2030', '#2a2a3a'][j % 3], spin: (j % 2 ? 1 : -1) * (7 + 2 * rnd(j, 3)) }; }).filter((c) => !keepOut(c.X, c.Z));
function conclaveState(c, t) { const inn = ease(t, 205.4 + c.j * .03, 207.4 + c.j * .03), out = ease(t, 219.7, 221.6); if (inn <= 0 || out >= 1) return null;
  const r = c.r + 14 * (1 - inn) + 18 * out, X = MAN.x + c.d[0] * r, Z = MAN.z + c.d[1] * r; return { X, Z, a: inn * (1 - out), dance: inn * (1 - out) }; }
function conclaveInto(t, list) {
  if (t < 205 || t > 222) return;
  for (const c of CONCLAVE) { const s = conclaveState(c, t); if (!s) continue; const p = P(s.X, 0, s.Z); if (p[2] < 2 || p[0] < -100 || p[0] > W + 100) continue; const k = kAt(p); if (k < .8) continue;
    list.push({ z: p[2], draw: () => { g.save(); g.globalAlpha = s.a; person(p[0], p[1] - Math.abs(Math.sin(t * 3 + c.j)) * .08 * k, k, { step: Math.sin(t * 5 + c.j) * .25 * s.dance, lift: .9, hat: 0, cape: c.j % 3 === 0, sit: 0 }, { body: c.col, skin: '#c99a74', dark: '#1a1418', hatc: c.col }); g.restore(); } });
  }
}
function conclaveFire(t) { // after the grade: the burning poi, staffs, fans and hoops
  if (t < 205 || t > 222) return;
  for (const c of CONCLAVE) { const s = conclaveState(c, t); if (!s || s.dance <= .05) continue; const p = P(s.X, 1.25, s.Z); if (p[2] < 2 || p[0] < -100 || p[0] > W + 100) continue; const k = kAt(p); if (k < .8) continue;
    const a0 = t * c.spin + c.j, fa = s.dance * .8, ball = (x, y, R) => { glowAt(x, y, Math.max(2.5, R * k), '255,170,70', fa); g.fillStyle = `rgba(255,230,170,${fa})`; g.fillRect(x - Math.max(1, .06 * k), y - Math.max(1, .06 * k), Math.max(2, .12 * k), Math.max(2, .12 * k)); };
    const trail = (cx, cy, rad, a) => { g.strokeStyle = `rgba(255,140,50,${.55 * fa})`; g.lineWidth = Math.max(1.2, .1 * k); g.beginPath(); g.arc(cx, cy, rad * k, a - .9 * Math.sign(c.spin), a, c.spin < 0); g.stroke(); };
    if (c.tool === 0) for (const d of [-1, 1]) { const cx = p[0] + d * .32 * k, cy = p[1] - .1 * k, a = a0 * d + d; trail(cx, cy, .8, a); ball(cx + Math.cos(a) * .8 * k, cy + Math.sin(a) * .8 * k, .35); } // poi
    else if (c.tool === 1) { const cx = p[0] + .2 * k, cy = p[1] - .2 * k; for (const e of [0, Math.PI]) { const a = a0 + e; trail(cx, cy, .9, a); ball(cx + Math.cos(a) * .9 * k, cy + Math.sin(a) * .9 * k, .4); } g.strokeStyle = 'rgba(60,40,30,.8)'; g.lineWidth = Math.max(1, .05 * k); g.beginPath(); g.moveTo(cx + Math.cos(a0) * .9 * k, cy + Math.sin(a0) * .9 * k); g.lineTo(cx - Math.cos(a0) * .9 * k, cy - Math.sin(a0) * .9 * k); g.stroke(); } // staff
    else if (c.tool === 2) for (const d of [-1, 1]) { const cx = p[0] + d * .45 * k, cy = p[1] - .35 * k + Math.sin(t * 3 + d) * .2 * k; for (let w = 0; w < 3; w++) { const a = -Math.PI / 2 + d * (.5 + w * .35) + Math.sin(t * 2.5 + c.j) * .4; ball(cx + Math.cos(a) * .35 * k, cy + Math.sin(a) * .35 * k, .22); } } // fans
    else { const cy = p[1] + .3 * k; for (let w = 0; w < 5; w++) { const a = a0 * .6 + w / 5 * TAU; ball(p[0] + Math.cos(a) * .55 * k, cy + Math.sin(a) * .16 * k, .2); } } // hoop
  }
}

// ---------- scene hooks ----------
function burnInto(t, list) {
  if (typeof dustInto === 'function') dustInto(t, list); // the refrain-2 whiteout wall (world.js)
  if (P(MAN.x, 0, MAN.z)[2] > 6000) return;
  lamplightersInto(t, list); arrivalsInto(t, list); conclaveInto(t, list);
}
// overlay hook (draft 3): drawn after the scene, before the grade.
function burnOver(t) {}
// over the car layer (bob.js bobWalk calls it first thing; burnFront is table.js's name): where the Rangers' beams land
// on the board, a soft pool of torchlight.
function rangerTorchPool(t) {
  if (t < 238 || t > DROP) return; let sum = 0, cs = null; for (const rg of RANGERS) { const s = rangerState(rg, t); if (s && s.beam > .02) { sum += s.beam; cs = s.car; } } if (!cs || sum <= 0) return;
  const c = P(...cs); if (c[2] < 1.5) return; const k = kAt(c), R = Math.max(12, 1.6 * k), a = Math.min(.3, .06 * sum);
  g.globalCompositeOperation = 'lighter'; const rg = g.createRadialGradient(c[0], c[1], 0, c[0], c[1], R); rg.addColorStop(0, `rgba(255,238,200,${a})`); rg.addColorStop(1, 'rgba(255,238,200,0)'); g.fillStyle = rg; g.fillRect(c[0] - R, c[1] - R, 2 * R, 2 * R); g.globalCompositeOperation = 'source-over';
}

// ---------- after the grade: lights ----------
const nightAmt = (t) => ease(t, 199, 216);
function glowAt(x, y, r, col, a) { const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, `rgba(${col},${a})`); rg.addColorStop(1, `rgba(${col},0)`); g.fillStyle = rg; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
function spinners(t) { // the Man's neon, lanterns, LEDs on the crowd, art car lights, fire dancers, fireworks, the Rangers' torches
  if (t < 150) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  lanternGlows(t); if (t < 196) { g.restore(); return; }
  manNeon(t);
  const n = nightAmt(t);
  if (n > .05) {
    for (const c of MV) { const s = mvState(c, t); if (s) drawMV(c, s, t, true); }
    for (const b of BIKES_IN) { const s = bikeState(b, t); if (s && s.a > .01) { const p = P(s.X, 0, s.Z); if (p[2] > 2 && p[0] > -100 && p[0] < W + 100) { g.save(); g.globalAlpha = n; drawBike(b, s, t, true); g.restore(); } } }
    const cs = crowdState(t), zmin = t > 252 ? 7 : t > 236 ? 3.2 : 1.2;
    for (const c of cs) { const m = c.m; if (!m.led && !m.lantern) continue; const p = P(c.X, 1.25 - c.sit * .6, c.Z); if (p[2] < zmin || p[0] < -50 || p[0] > W + 50 || p[1] < -50 || p[1] > H + 50) continue; const k = kAt(p), al = c.alpha * footFade(t, P(c.X, 0, c.Z));
      if (m.led) { const s = Math.max(1.4, .12 * k); g.fillStyle = `rgba(${m.led},${.8 * n * al})`; g.fillRect(p[0] - s, p[1] - s * .5, s * 2, s); if (k > 2) glowAt(p[0], p[1], .5 * k, m.led, .25 * n * al); }
      else { const lx = p[0] - .42 * k, ly = p[1] - 1.22 * k; glowAt(lx, ly, Math.max(2, Math.min(1.3 * k, 60)), '255,200,120', .5 * n * al); } }
    const mp = P(MAN.x, 0, MAN.z), km = mp[2] > 1 ? kAt(mp) : 99, da = clamp((5 - km) / 2); // the instanced crowd's LEDs, from the air
    if (da > .01) { const s = Math.max(1.2, .5 * km); for (const d of DOTS) { if (d.led < 0 || t < d.ts) continue; const p = P(d.X, 1, d.Z); if (p[2] < 1) continue; g.fillStyle = `rgba(${LEDS[d.led]},${.75 * n * da})`; g.fillRect(p[0] - s / 2, p[1] - s / 2, s, s); } }
    if (t > 237.5 && t < DROP + .2) for (const rg of RANGERS) { const s = rangerState(rg, t); if (s && s.beam > .02) rangerBeam(s, t); }
  }
  conclaveFire(t); fireworks(t);
  g.restore();
}
function ballotEmbers(t) { // after the fire: the witnesses in front of it as silhouettes, their ballots, and the ballots burning in the air
  if (t < 218.5) return; const cs = crowdState(t), manZ = P(MAN.x, 0, MAN.z)[2], glow = fireGlow(t), grinSc = 1 + .55 * clamp((C.y - 6) / 14), zmin = t > 252 ? 7 : t > 236 ? 3.2 : 1.2;
  // the runners circling the fire after the fall are silhouettes against it even on its far side (seen through the flames)
  const near = []; for (const c of cs) { const p = P(c.X, 0, c.Z); if (p[2] < zmin || (p[2] >= manZ && !c.run) || p[0] < -200 || p[0] > W + 200 || p[1] < -50) continue; near.push([p, c, null]); }
  extrasEach(t, (e) => { const p = P(e.X, 0, e.Z); if (p[2] < 1.5 || p[2] >= manZ || p[0] < -200 || p[0] > W + 200 || p[1] < -50) return; near.push([p, null, e]); });
  near.sort((a, b) => b[0][2] - a[0][2]);
  const sil = { body: '#1d1520', skin: '#1d1520', dark: '#1d1520', lamp: '#1d1520', hatc: '#1d1520' }, rimA = .35 + .55 * glow, rim = { body: `rgba(255,140,60,${rimA})`, skin: `rgba(255,150,70,${rimA})`, dark: `rgba(255,130,50,${rimA * .7})`, lamp: `rgba(255,200,120,${rimA})`, hatc: `rgba(255,140,60,${rimA})` };
  for (const [p, c, e] of near) { const k = kAt(p); if (k < .25) continue;
    if (e) { const al = e.alpha * footFade(t, p); if (al <= .01 || k < .6) continue; g.save(); g.globalAlpha = al; e.draw(p, k, true, k >= 6 ? `rgba(255,140,60,${rimA * .8})` : null); g.restore(); continue; }
    const o = { step: c.step, lift: c.lift, lantern: c.m.lantern, hat: c.m.hat, cape: c.m.cape, sit: c.sit }, al = c.alpha * clamp((p[2] - 1.8) / 1.6) * (c.run ? clamp((p[2] - 15) / 5) : footFade(t, p)) * (p[2] >= manZ ? .85 : 1); if (al <= .01) continue; // runners coming round toward the lens leave the fire's light and go dark
    if (k < 1.2) { g.fillStyle = sil.body; g.globalAlpha = al; g.fillRect(p[0] - .25 * k, p[1] - 1.8 * k, Math.max(1, .5 * k), Math.max(1, 1.8 * k)); g.globalAlpha = 1; continue; }
    g.save(); g.globalAlpha = al; if (k >= 6 && al > .9) { g.globalCompositeOperation = 'lighter'; person(p[0] + .02 * k, p[1] - .05 * k, k, o, rim); g.globalCompositeOperation = 'source-over'; } person(p[0], p[1], k, o, sil); g.restore(); }
  poorAshFlakes(t);
  // the ballots: held up on the word, let go into the heat, catching fire, then embers
  for (const c of cs) { const m = c.m; for (let w = 0; w < 4; w++) { if (!inWave(m, w)) continue; for (const extra of (w === 3 && m.i % 2 ? [false, true] : [false])) {
    const { up, rel, drop, grin } = waveTimes(m, w, extra); if (t < up || t > rel + 9) continue;
    const hy = lerp(1.3, 2.25, c.lift) + .2 - c.sit * .6, Xh = c.X + .3, Zh = c.Z, j = m.i * 7 + w * 3 + (extra ? 1 : 0);
    if (drop && t >= drop) { const a = t - drop, Y = Math.max(.05, 2.45 - c.sit * .6 - 4.9 * a * a); if (a < 1.6) ballot(Xh, Y, Zh, t, j, 0, glow, c.alpha * (1 - ease(t, drop + .9, drop + 1.6)), grinSc, Y > .06 ? .3 * (j % 2 ? 1 : -1) * a : 1.45, true); continue; } // a knocked-out tooth
    if (t < rel) { if (!extra || t > rel - 1) ballot(Xh, hy, Zh, t, j, 0, glow, c.alpha * ease(t, up, up + .2), grin ? grinSc : 1, grin ? .03 * n1(1600 + j, t * .5) : null, grin); continue; }
    const a = t - rel, f = .55 * (1 - Math.exp(-.22 * a)), X = lerp(Xh, MAN.x, f) + n1(1000 + j, a * .7) * 1.6, Z = lerp(Zh, MAN.z, f * .8) + n1(1100 + j, a * .6) * 1.2, Y = hy + 1.3 * a + .32 * a * a;
    const ac = grin ? .1 + .35 * rnd(j, 43) : .8 + 1.4 * rnd(j, 43); ballot(X, Y, Z, t, j, clamp((a - ac) / (grin ? .6 : 1.3)), glow, c.alpha * (1 - clamp((a - ac - 1.3) / 4)), grin ? lerp(grinSc, 1, clamp(a)) : 1, null, grin);
  } } }
}
function ballot(X, Y, Z, t, j, q, glow, alpha, sc = 1, rot = null, bright = false) { // a paper ballot with its box and X; q = how much of it has burnt (0..1); rot: a fixed tilt (held still)
  if (alpha <= .01) return; const p = P(X, Y, Z); if (p[2] < 1.6 || p[0] < -150 || p[0] > W + 150 || p[1] < -150 || p[1] > H + 150) return; const k = kAt(p) * sc;
  if (q >= 1 || k < 2.5) { const s = Math.max(2, .08 * k); g.save(); g.globalCompositeOperation = q >= 1 ? 'lighter' : 'source-over'; g.globalAlpha = 1; g.fillStyle = q >= 1 ? `rgba(255,${150 + 50 * n1(1200 + j, t * 3)},60,${.85 * alpha})` : `rgba(240,226,196,${alpha})`; g.fillRect(p[0] - s / 2, p[1] - s / 2, s, s * (q >= 1 ? 1 : 1.3)); g.restore(); return; }
  const w = .44 * k, h = .58 * k, lt = Math.max(bright ? .88 : 0, clamp(.45 + glow * .7 - Math.hypot(X - MAN.x, Z - MAN.z) / 120)), col = mix([96, 86, 110], [255, 234, 196], lt);
  g.save(); g.translate(p[0], p[1]); if (rot == null) { g.rotate(n1(1300 + j, t * .9) * .9 + (j % 2 ? .2 : -.2)); g.scale(1, .75 + .25 * Math.cos(t * 2.1 + j)); } else g.rotate(rot); g.globalAlpha = alpha;
  const top = -h / 2, bot = h / 2 - q * h; // it burns from the bottom up
  g.fillStyle = rgb(col); g.fillRect(-w / 2, top, w, bot - top);
  if (q < .85) { g.strokeStyle = 'rgba(30,24,30,.85)'; g.lineWidth = Math.max(1, .025 * k); g.strokeRect(-w * .3, top + h * .2, w * .22, w * .22); g.beginPath(); g.moveTo(-w * .3, top + h * .2); g.lineTo(-w * .08, top + h * .2 + w * .22); g.moveTo(-w * .08, top + h * .2); g.lineTo(-w * .3, top + h * .2 + w * .22); g.stroke();
    g.fillStyle = 'rgba(30,24,30,.55)'; g.fillRect(w * .02, top + h * .24, w * .32, Math.max(1, .02 * k)); g.fillRect(-w * .3, top + h * .52, w * .62, Math.max(1, .02 * k)); }
  if (q > 0) { g.fillStyle = 'rgba(30,14,10,.9)'; g.fillRect(-w / 2, bot - h * .08, w, h * .08); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,150,50,.9)'; g.fillRect(-w / 2, bot - Math.max(1, .03 * k), w, Math.max(1.5, .04 * k));
    flameTongue(0, bot, h * (.5 + .4 * n1(1400 + j, t * 4)), w * .45, 1500 + j, t, .9, true); }
  g.restore();
}

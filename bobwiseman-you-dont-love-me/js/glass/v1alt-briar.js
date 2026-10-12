// Verse 1 alternative for lancet 3 (line V1.l4 and the closing refrain): "the briar spell".
// She stands centred, hands on hips, deadpan. On V1.evil dark green leaded briars shoot up from the foot of the
// lancet; on V1.spell black roses open along them; through V1.life they climb and arch over her head; on V1.thisW
// they close into a pointed dome of thorns. Through the refrain the cage breathes and a rose opens on each backing
// "me" (V1_DROPS 6-8). At V1.unwind the briars draw back into the ground and the roses drop their petals.
// Load after v1-scenes.js. Every top-level name is prefixed v1aBriar; the swap lines are at the bottom.

const V1A_BRIAR_CX = lcx(3), V1A_BRIAR_ROOT = 1905;
const V1A_BRIAR_ME = [V1_DROPS[6], V1_DROPS[7], V1_DROPS[8]]; // the backing "me" onsets in the refrain

// Dense polyline through control points (Catmull-Rom), resampled every ~8 units, with an optional curl at the tip.
function v1aBriarPath(ctrl, curl) {
  const raw = [], n = ctrl.length;
  for (let i = 0; i < n - 1; i++) {
    const a = ctrl[Math.max(0, i - 1)], b = ctrl[i], c = ctrl[i + 1], d = ctrl[Math.min(n - 1, i + 2)];
    for (let k = 0; k < 24; k++) {
      const u = k / 24, u2 = u * u, u3 = u2 * u;
      raw.push([0, 1].map((q) => .5 * (2 * b[q] + (-a[q] + c[q]) * u + (2 * a[q] - 5 * b[q] + 4 * c[q] - d[q]) * u2 + (-a[q] + 3 * b[q] - 3 * c[q] + d[q]) * u3)));
    }
  }
  raw.push(ctrl[n - 1]);
  if (curl) { // a tight spiral at the tip: curl = [radius, turn direction]
    const [r0, dir] = curl, e = raw[raw.length - 1], p = raw[raw.length - 4];
    const tx = e[0] - p[0], ty = e[1] - p[1], l = Math.hypot(tx, ty), nx = -ty / l * dir, ny = tx / l * dir;
    const ox = e[0] + nx * r0, oy = e[1] + ny * r0, a0 = Math.atan2(e[1] - oy, e[0] - ox);
    for (let k = 1; k <= 40; k++) { const u = k / 40, a = a0 + dir * u * Math.PI * 1.7, r = r0 * (1 - .62 * u); raw.push([ox + Math.cos(a) * r, oy + Math.sin(a) * r]); }
  }
  const pts = [raw[0]], cum = [0];
  for (let i = 1; i < raw.length; i++) {
    const q = pts[pts.length - 1], d = Math.hypot(raw[i][0] - q[0], raw[i][1] - q[1]);
    if (d >= 8 || i === raw.length - 1) { pts.push(raw[i]); cum.push(cum[cum.length - 1] + d); }
  }
  return { pts, cum, L: cum[cum.length - 1] };
}

// The vines. front: drawn over her (after the figure). w: [root width, tip width]. d: stagger (s).
const V1A_BRIAR_V = [];
(function v1aBriarBuild() {
  const cx = V1A_BRIAR_CX, R = V1A_BRIAR_ROOT;
  for (const s of [-1, 1]) {
    V1A_BRIAR_V.push({ id: `o${s}`, front: false, low: false, w: [36, 15], d: s < 0 ? 0 : .05, seed: 3800 + s, P: v1aBriarPath([
      [cx + s * 300, R], [cx + s * 322, 1640], [cx + s * 292, 1380], [cx + s * 262, 1150], [cx + s * 218, 975], [cx + s * 128, 870], [cx - s * 8, 838], [cx - s * 100, 868]], [30, -s]) });
    V1A_BRIAR_V.push({ id: `m${s}`, front: true, low: false, w: [34, 14], d: s < 0 ? .1 : .14, seed: 3810 + s, P: v1aBriarPath([
      [cx + s * 222, R], [cx + s * 246, 1600], [cx + s * 222, 1335], [cx + s * 206, 1130], [cx + s * 160, 995], [cx + s * 74, 928], [cx - s * 34, 912]], [26, -s]) });
    V1A_BRIAR_V.push({ id: `i${s}`, front: false, low: false, w: [28, 12], d: s < 0 ? .2 : .24, seed: 3820 + s, P: v1aBriarPath([
      [cx + s * 150, R], [cx + s * 176, 1660], [cx + s * 196, 1420], [cx + s * 180, 1220], [cx + s * 128, 1070], [cx + s * 52, 990], [cx - s * 26, 985]], [20, s]) });
    V1A_BRIAR_V.push({ id: `x${s}`, front: true, low: true, w: [28, 13], d: s < 0 ? 0 : .06, seed: 3830 + s, P: v1aBriarPath([
      [cx + s * 330, R], [cx + s * 250, 1760], [cx + s * 120, 1680], [cx - s * 40, 1610], [cx - s * 150, 1560]], [24, s]) });
  }
})();
const v1aBriarVine = (id) => V1A_BRIAR_V.find((v) => v.id === id);

// How much of a vine is grown (0..1) at song time t.
function v1aBriarGrow(v, t) {
  let u;
  if (v.low) u = easeOutBack(lin(t, V1.thisW + .02 + v.d, V1.thisW + .42 + v.d), 1.3);
  else u = .42 * easeOutBack(lin(t, V1.evil + v.d * .5, V1.evil + v.d * .5 + .45), 1.6) // shoot up on "evil"
    + .12 * ease(t, 57.0, 58.4)                                                        // creep
    + .34 * ease(t, V1.life - .3 + v.d * .4, V1.life + .4 + v.d * .4)                   // climb and arch over
    + .12 * easeOutBack(lin(t, V1.thisW, V1.thisW + .32), 2.2);                        // snap shut
  const back = v.low ? ease(t, V1.unwind + .05, V1.unwind + .75) : ease(t, V1.unwind + .15 + v.d, V1.unwind + 1.15 + v.d);
  return clamp(Math.min(u, 1) * (1 - back));
}
// The cage breathes through the refrain, one breath per phrase, fullest on each "me"; a shudder when it shuts.
function v1aBriarBreath(t) { return ease(t, V1.lead1 - .4, V1.lead1 + .8) * (1 - ease(t, V1.unwind - .2, V1.unwind + .4)); }
function v1aBriarWarp(x, y, t, seed) {
  const cx = V1A_BRIAR_CX, A = v1aBriarBreath(t), h = clamp((V1A_BRIAR_ROOT - y) / 1000);
  const ph = (t - V1.lead1) / 2.75 * TAU, br = .5 - .5 * Math.cos(ph + 1.9); // peaks just after each phrase's "me"
  const shud = Math.exp(-Math.max(0, t - V1.thisW) * 6) * (t > V1.thisW ? 1 : 0);
  return [cx + (x - cx) * (1 + A * .055 * br * h) + A * 9 * h * Math.sin(y / 110 - t * 1.8 + seed) + shud * 7 * h * Math.sin(t * 60 + seed),
    y - A * 16 * br * h * h];
}
// Point on vine v at arc length s (in warped space), with its unit tangent.
function v1aBriarAt(v, s, t) {
  const P = v.P; s = clamp(s, 0, P.L);
  let i = 1; while (i < P.cum.length - 1 && P.cum[i] < s) i++;
  const a = P.pts[i - 1], b = P.pts[i], f = (s - P.cum[i - 1]) / Math.max(1e-6, P.cum[i] - P.cum[i - 1]);
  const p = v1aBriarWarp(lerp(a[0], b[0], f), lerp(a[1], b[1], f), t, v.seed);
  const q = v1aBriarWarp(b[0], b[1], t, v.seed), o = v1aBriarWarp(a[0], a[1], t, v.seed), l = Math.hypot(q[0] - o[0], q[1] - o[1]) || 1;
  return [p[0], p[1], (q[0] - o[0]) / l, (q[1] - o[1]) / l];
}

const V1A_BRIAR_STEM = [22, 66, 36], V1A_BRIAR_THORN = [34, 84, 40], V1A_BRIAR_LEAF = [30, 104, 50];
function v1aBriarDrawVine(g, v, t) {
  const u = v1aBriarGrow(v, t); if (u <= .004) return;
  const P = v.P, grown = u * P.L, mid = [], ws = [];
  for (let i = 0; i < P.pts.length && P.cum[i] <= grown; i++) {
    const p = v1aBriarWarp(P.pts[i][0], P.pts[i][1], t, v.seed); mid.push(p);
    ws.push(lerp(v.w[0], v.w[1], P.cum[i] / P.L) * clamp((grown - P.cum[i]) / 90 + .1));
  }
  const [ex, ey] = v1aBriarAt(v, grown, t); mid.push([ex, ey]); ws.push(2);
  if (mid.length < 2) return;
  // thorns first (the stem's lead covers their roots): hooked back toward the root, alternating sides
  const th = new Path2D();
  for (let s = 26, k = 0; s < grown - 14; s += 30, k++) {
    const [x, y, tx, ty] = v1aBriarAt(v, s, t), side = k % 2 ? 1 : -1, nx = -ty * side, ny = tx * side;
    const w = lerp(v.w[0], v.w[1], s / P.L) / 2, len = 15 + 5 * rnd(v.seed, k);
    th.moveTo(x + nx * (w - 2) - tx * 8, y + ny * (w - 2) - ty * 8);
    th.lineTo(x + nx * (w + len) - tx * 10, y + ny * (w + len) - ty * 10);
    th.lineTo(x + nx * (w - 2) + tx * 7, y + ny * (w - 2) + ty * 7); th.closePath();
  }
  g.fillStyle = rgb(V1A_BRIAR_THORN); g.fill(th); lead(g, th, 3.5);
  // leaves: a few small leaded leaves along the stem
  for (let k = 0; k < 4; k++) {
    const s = P.L * (.16 + k * .2 + .05 * rnd(v.seed, k, 3)); if (s > grown - 30) break;
    const [x, y, tx, ty] = v1aBriarAt(v, s, t), side = k % 2 ? 1 : -1, a = Math.atan2(ty, tx) - side * 1.0 - Math.PI * .5 * (1 - side) * 0;
    const grow = clamp((grown - s) / 90), lx0 = x - ty * side * 18, ly0 = y + tx * side * 18;
    g.save(); g.translate(lx0, ly0); g.rotate(side > 0 ? a + Math.PI : a); g.scale(grow, grow);
    pane(g, smoothPath([[0, 0], [-14, -11], [-34, -10], [-48, 0], [-34, 10], [-14, 11]]), V1A_BRIAR_LEAF, v.seed * 7 + k, { ew: 8, lw: 4, shade: .3 });
    paint(g, 2, .6); g.beginPath(); g.moveTo(-4, 0); g.lineTo(-42, 0); g.stroke();
    g.restore();
  }
  pane(g, polyPath(limbPts(mid, ws)), V1A_BRIAR_STEM, v.seed, { ew: 14, lw: 6, shade: .3, amt: .5 });
  paint(g, 2.5, .35); g.beginPath(); mid.forEach(([x, y], i) => { if (i % 3) return; const n = Math.min(i + 2, mid.length - 1); g.moveTo(x, y); g.lineTo(lerp(x, mid[n][0], .6), lerp(y, mid[n][1], .6)); }); g.stroke();
}

// Black roses: [vine, arc fraction, radius, open time]. Most open on "spell" or as the climb reaches them; the
// last three open on the refrain's backing "me" onsets.
const V1A_BRIAR_ROSES = [
  ['o-1', .2, 34, V1.spell], ['m1', .26, 36, V1.spell + .1], ['o1', .36, 32, V1.spell + .2], ['m-1', .38, 30, V1.spell + .3], ['i1', .3, 28, V1.spell + .38],
  ['o-1', .55, 30, V1.life + .1], ['m1', .62, 32, V1.life + .25], ['o1', .7, 34, V1.life + .4], ['i-1', .66, 28, V1.life + .5],
  ['x-1', .55, 30, V1.thisW + .4], ['x1', .72, 32, V1.thisW + .5],
  ['o1', .9, 44, V1A_BRIAR_ME[0]], ['m-1', .62, 42, V1A_BRIAR_ME[1]], ['o-1', .78, 44, V1A_BRIAR_ME[2]],
].map(([id, f, r, t0], k) => ({ v: v1aBriarVine(id), f, r: r * 1.4, t0, k, drop: V1.unwind + .06 * k * .55, seed: 3900 + k * 11 }));
// Pulse of all roses on each "me" (a glint flares across them).
function v1aBriarPulse(t) { return V1A_BRIAR_ME.reduce((s, m) => s + (t > m - .05 ? Math.exp(-(t - m) * 3.2) : 0), 0); }

const V1A_BRIAR_PET = [30, 4, 14], V1A_BRIAR_PET2 = [46, 6, 20], V1A_BRIAR_CORE = [14, 2, 6];
function v1aBriarPetal(g, R, k, seed, col) {
  pane(g, smoothPath([[0, 0], [R * .3, -R * .34], [R * .78, -R * .36], [R * 1.02, 0], [R * .78, R * .36], [R * .3, R * .34]]), col, seed + k, { ew: 8, lw: 4, shade: .45, amt: .5 });
}
function v1aBriarRose(g, x, y, R, o, rot, pulse, seed, outer = true) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(o, o);
  if (outer) for (let k = 0; k < 5; k++) { g.save(); g.rotate(k * TAU / 5); v1aBriarPetal(g, R, k, seed, V1A_BRIAR_PET); g.restore(); }
  for (let k = 0; k < 5; k++) { g.save(); g.rotate(k * TAU / 5 + TAU / 10); v1aBriarPetal(g, R * .62, k, seed + 5, V1A_BRIAR_PET2); g.restore(); }
  pane(g, circPath(0, 0, R * .3), V1A_BRIAR_CORE, seed + 12, { ew: 6, lw: 4, shade: .4 });
  paint(g, 2.2, .7); g.beginPath(); for (let a = 0; a < TAU * 1.6; a += .3) { const r = R * .05 + a * R * .022; a ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(r, 0); } g.stroke();
  // the glint: a cold sheen on two petals, flaring on each pulse
  g.globalCompositeOperation = 'lighter';
  g.fillStyle = `rgba(255,190,210,${.3 + .5 * clamp(pulse)})`;
  g.beginPath(); g.ellipse(-R * .42, -R * .5, R * .22, R * .07, -.7, 0, TAU); g.fill();
  g.fillStyle = `rgba(255,220,230,${.12 + .35 * clamp(pulse)})`;
  g.beginPath(); g.ellipse(R * .5, R * .2, R * .14, R * .05, .9, 0, TAU); g.fill();
  g.restore();
}
function v1aBriarRoses(g, t, front) {
  const pulse = v1aBriarPulse(t);
  for (const Ro of V1A_BRIAR_ROSES) {
    if (Ro.v.front !== front || t < Ro.t0) continue;
    const u = v1aBriarGrow(Ro.v, t), dt = t - Ro.t0, isMe = V1A_BRIAR_ME.includes(Ro.t0);
    const s = Ro.f * Ro.v.P.L, [x, y, tx, ty] = v1aBriarAt(Ro.v, s, Math.min(t, Ro.drop));
    const side = Ro.k % 2 ? 1 : -1, px = x - ty * side * 6, py = y + tx * side * 6, rot = Ro.k * 1.3 + .4 * (1 - lin(dt, 0, .6));
    const dropped = t >= Ro.drop;
    if (!dropped) {
      if (u * Ro.v.P.L < s + 6) continue;
      const o = easeOutBack(lin(dt, 0, isMe ? .45 : .35), isMe ? 2.6 : 2) * (1 + .1 * v1aBriarPulse(t) * (isMe ? 0 : 1));
      v1aBriarRose(g, px, py, Ro.r, o, rot, pulse + (dt < .5 ? 1 - dt / .5 : 0), Ro.seed);
      if (dt < .4) { g.save(); g.globalCompositeOperation = 'lighter'; const rg = g.createRadialGradient(px, py, 0, px, py, Ro.r * 2.4); rg.addColorStop(0, `rgba(255,170,200,${.35 * (1 - dt / .4)})`); rg.addColorStop(1, 'rgba(255,170,200,0)'); g.fillStyle = rg; g.fillRect(px - Ro.r * 2.5, py - Ro.r * 2.5, Ro.r * 5, Ro.r * 5); g.restore(); }
      continue;
    }
    // the spell lets go: the outer petals fall away, the heart shrinks back into the stem
    const fd = t - Ro.drop, o0 = easeOutBack(1, 2), heart = 1 - ease(fd, 0, .5);
    if (heart > .02 && u * Ro.v.P.L >= s + 6) v1aBriarRose(g, px, py, Ro.r, o0 * heart, rot, 0, Ro.seed, false);
    if (fd > 1.8) continue;
    for (let k = 0; k < 5; k++) {
      const a = rot + k * TAU / 5, sx = px + Math.cos(a) * Ro.r * .5, sy = py + Math.sin(a) * Ro.r * .5;
      const ffx = sx + Math.cos(a) * 26 * Math.min(fd * 3, 1) + Math.sin(fd * 4 + k + Ro.k) * 22, ffy = sy + 380 * fd * fd + 20 * fd;
      g.save(); g.globalAlpha = 1 - lin(fd, 1.2, 1.8); g.translate(ffx, ffy); g.rotate(a + fd * (k % 2 ? 3 : -2.4));
      v1aBriarPetal(g, Ro.r, k, Ro.seed, V1A_BRIAR_PET); g.restore();
    }
  }
}

// How dark the spell makes the lancet's own glass (dusk under the briars).
function v1aBriarDusk(t) { return ease(t, V1.evil, V1.thisW + .4) * (1 - ease(t, V1.unwind + .2, V1.unwind + 1.3)); }

function sceneV1AltBriar(g, t, view) {
  v1Upper(g, 3, t, view, [92, 30, 96], [C.gold, C.purple, C.green]);
  // the picture: a pale lavender quarry lattice that dims as the briars take hold
  g.save(); const cl = new Path2D(); cl.rect(lx(3) - 10, V1_TRANSOM + 22, LW + 20, YB); g.clip(cl);
  drawQuarries(g, 3, mix([186, 166, 212], [92, 70, 118], .6 * v1aBriarDusk(t)), t, view);
  g.restore();
  for (const v of V1A_BRIAR_V) if (!v.front) v1aBriarDrawVine(g, v, t);
  v1aBriarRoses(g, t, false);
  const mound = smoothPath([[lx(3) - 20, 1840], [lcx(3) - 200, 1790], [lcx(3) + 200, 1795], [lx(3) + LW + 20, 1850], [lx(3) + LW + 20, YB + 40], [lx(3) - 20, YB + 40]]);
  pane(g, mound, [50, 116, 52], 3690, { ew: 30 });
}
// She stands still, hands on hips; the front briars and their roses are drawn over her.
function v1aBriarFigure(g, t) {
  g.save(); g.translate(V1W3.x, V1W3.y); g.scale(V1W3.s, V1W3.s);
  const glance = ease(t, V1.spell + .3, V1.spell + .6) * (1 - ease(t, V1.spell + 1.4, V1.spell + 1.7)); // one sideways look at a rose
  drawWomanV1(g, { dress: C.amber, mantle: C.blue2, seed: 3700, mouth: v1Mouth(t), look: .8 * glance,
    hands: [[-118, 505, .15], [118, 505, .15]], elbows: [[-262, 360], [262, 360]] });
  g.restore();
  for (const v of V1A_BRIAR_V) if (v.front) v1aBriarDrawVine(g, v, t);
  v1aBriarRoses(g, t, true);
}

// Swap in. v1-main draws lancet 3's figure on top of everything via v1Spell3Figure, so that is replaced too
// (it carries the front briars and keeps her straight; the old one looked about with the swirl).
V1SCENES[3] = sceneV1AltBriar;
v1Spell3Figure = v1aBriarFigure;
// Camera: pull back a little sooner inside this line so the dome of thorns is in frame when it shuts. V1CAM lives
// in v1-main.js, which loads after this file, so the key is changed once every script has run (before any frame).
document.addEventListener('DOMContentLoaded', () => { const k = V1CAM.find((c) => c[0] === 58.4); if (k) { k[2] = 1250; k[3] = 1.04; } });

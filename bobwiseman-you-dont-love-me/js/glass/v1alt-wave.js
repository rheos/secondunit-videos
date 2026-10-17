// Verse 1 alternative for lancet 2 (line V1.l3): the wave that almost kisses her.
// She stands at the cliff edge. A great curling wave rises out of the sea in leaded blue and teal bands with
// small claw-like foam at the crest, climbs on V1.steep and V1.waiting, towers and curls over above her by V1.tobe,
// and holds there through V1.kissed: nothing reaches toward her face. Draft 6 (Bob, 2026-10-13: the foam hand "morphs
// into a white attachment I find peculiar. It distracts from the kissy face"): the foam hand is gone, and after the
// near miss the wave drops away in about a third of a second with a short spill of beads, so the close framing is
// all hers. One bead lands on her cheek and rolls down like a tear (through V1.bk5). She opens her eyes, the sea goes
// flat and sulky by V1.bk6, and on V1.giveUp she droops.
// Swaps in as V1SCENES[2]; all top-level names are prefixed v1aWave / V1AWAVE / sceneV1AltWave.

const V1AWAVE_TOP = V1_TRANSOM + 22;                  // nothing of the picture is drawn above this (tracery stays)
const V1AWAVE_HZ = 1110;                               // horizon
const V1AWAVE_F = { x: lx(2) + 190, y: 1000, s: .46 }; // the woman (figure origin, scale)
const V1AWAVE_CL = { top: 1612, edge: lx(2) + 330 };   // the cliff top and its edge
const V1AWAVE_BASE = [lx(2) + 610, 1620];              // where the wave's spine leaves the sea
const V1AWAVE_N = 48;                                  // samples along the spine
const V1AWAVE_SKY = buildSky(2, V1_TRANSOM + 20, V1AWAVE_HZ + 30, 61);
const V1AWAVE_KISSHD = [18, -10, -.12];                // her head lean at the kiss

// ---------------- camera: wide enough for the wave to read, then close for the near miss ----------------
// Replaces only the keys strictly inside 44.5-55.3 (same count, edge keys untouched). V1CAM is defined by
// v1-main.js, which loads after this file, so this runs once the page has parsed.
function v1aWaveCamera() {
  const keys = [[46.9, 2350, 1150, 1.12], [48.4, 2235, 975, 2.55], [50.9, 2218, 990, 2.55], [53.6, 2340, 1160, 1.26]];
  const inside = V1CAM.filter((k) => k[0] > 44.5 + 1e-6 && k[0] < 55.3 - 1e-6);
  if (inside.length !== keys.length) return;
  inside.forEach((k, n) => { for (let j = 0; j < 4; j++) k[j] = keys[n][j]; });
}
if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', v1aWaveCamera);

// ---------------- the wave's clock ----------------
function v1aWaveState(t) {
  const h = .3 * ease(t, V1.l3, V1.l3 + 1) + .4 * ease(t, V1.steep - .1, V1.steep + .4) + .3 * ease(t, V1.waiting - .05, V1.waiting + .6);
  const c = .15 * ease(t, V1.l3 + .35, V1.l3 + 1.35) + .2 * ease(t, V1.steep, V1.steep + .7) + .5 * ease(t, V1.waiting + .3, V1.tobe + .05) + .15 * ease(t, V1.tobe + .05, V1.kissed - .2);
  const fall = lin(t, V1.kissed + .45, V1.kissed + .65);            // eaten from the lip back to the sea
  const sink = ease(t, V1.kissed + .45, V1.kissed + .8);            // what is left drops back into the sea
  const sway = .025 * Math.sin(t * 2.1) * (1 - ease(t, V1.tobe, V1.kissed));
  return { h: h * (1 - sink), c, uCut: 1 - fall, sway };
}

// Spine: integrate a heading that turns harder toward the tip, then pull the tip onto the kiss point.
function v1aWaveSpine(S) {
  const L = lerp(70, 1240, S.h), T = lerp(.12, 5.0, S.c), th0 = -Math.PI / 2 - .05 + S.sway, n = V1AWAVE_N;
  let x = V1AWAVE_BASE[0], y = V1AWAVE_BASE[1];
  const P = [[x, y]], A = [th0];
  for (let i = 1; i < n; i++) {
    const u = (i - .5) / (n - 1), th = th0 - T * Math.pow(u, 3.4);
    x += Math.cos(th) * L / (n - 1); y += Math.sin(th) * L / (n - 1); P.push([x, y]); A.push(th);
  }
  const E = v1aWaveTipTarget(), e = P[n - 1], cw = Math.pow(S.c, 2) * S.h;
  for (let i = 0; i < n; i++) { const u = i / (n - 1), k = cw * Math.pow(u, 2.5); P[i][0] += (E[0] - e[0]) * k; P[i][1] += (E[1] - e[1]) * k; }
  const W0 = lerp(140, 232, S.h), Wd = [];
  for (let i = 0; i < n; i++) { const u = i / (n - 1); Wd.push(W0 * Math.pow(1 - u, 1.1) + 22 * (1 - u) + 3); }
  // normals from the corrected points: (-sin th, cos th), i.e. the back of the wave at the base, its top at the crest
  const N = P.map((p, i) => { const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)], d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [-(b[1] - a[1]) / d, (b[0] - a[0]) / d]; });
  return { P, N, Wd };
}
function v1aWaveAt(sp, i, f) { const w = lerp(-sp.Wd[i], sp.Wd[i], f); return [sp.P[i][0] + sp.N[i][0] * w, sp.P[i][1] + sp.N[i][1] * w]; }

// ---------------- her, and where her face is ----------------
// Bob (2026-10-12): "could she pucker more than once? start stop start stop." Draft 5 to 8 had five start-stop
// puckers from V1.waiting. Draft 9 (Bob, 2026-10-15: "the kissy face isn't yet right to me. i just want her lips in a
// kissy face and peck her head twice like a chicken - you know?"): her lips go into the kissy face on V1.waiting and
// stay there, eyes shut, through the near miss (to where the last pucker used to let go); on V1.kissed she pecks her
// head out at the wave twice, a chicken's jab and snap back, an eighth note apart, with a smack on each.
// Draft 12 (Bob, 2026-10-17: "now she does it two times, can you add a third. the three in a row would be perfect"):
// a third peck, the same eighth note on.
const V1AWAVE_KISS = { on: V1.waiting + .03, off: V1.kissed + 1.0 };
const V1AWAVE_PECKS = [V1.kissed - .02, V1.kissed + .33, V1.kissed + .68];
const V1AWAVE_PECK = [58, -36, -.12]; // the jab: head-lean units out along the lean, a little more tilt
function v1aWavePeck(t) { // 0..1: how far out the head is jabbed
  let j = 0;
  for (const a of V1AWAVE_PECKS) j = Math.max(j, (1 - Math.pow(1 - lin(t, a, a + .07), 3)) * (1 - ease(t, a + .11, a + .25)));
  return j;
}
function v1aWaveKiss(t) {
  const K = V1AWAVE_KISS;
  const pk = ease(t, K.on - .04, K.on + .06) * (1 - ease(t, K.off, K.off + .14));
  const shut = ease(t, K.on - .08, K.on + .02) * (1 - ease(t, V1.bk5 - .1, V1.bk5 + .15));
  let sm = 0;
  for (const a of V1AWAVE_PECKS) if (t >= a) { const u = (t - a) / .5; sm = Math.max(sm, u < .1 ? u / .1 : Math.exp(-(u - .1) * 6)); } // the smack
  return { pk, shut, sm: Math.max(.75, sm) * pk }; // held squeezed (a kissy face, never parted); each peck squeezes it fully
}
function v1aWavePose(t) {
  const k = ease(t, V1.tobe - .1, V1.kissed - .05), K = v1aWaveKiss(t);
  const lean = Math.max(k, .35 * ease(t, V1.waiting - .1, V1.waiting + .3)) * (1 - ease(t, V1.kissed + 1.2, V1.kissed + 1.9));
  const give = ease(t, V1.giveUp, V1.giveUp + .5) * (1 - lin(t, V1.l4 - 1, V1.l4));
  const glance = ease(t, V1.steep - .2, V1.steep + .1) * (1 - ease(t, V1.tobe - .4, V1.tobe - .1));
  const watch = ease(t, V1.bk5 + .2, V1.bk5 + .5) * (1 - ease(t, V1.giveUp - .2, V1.giveUp + .1));
  const j = v1aWavePeck(t);
  const hd = [V1AWAVE_KISSHD[0] * lean + V1AWAVE_PECK[0] * j, V1AWAVE_KISSHD[1] * lean + 9 * give + V1AWAVE_PECK[1] * j, V1AWAVE_KISSHD[2] * lean + .07 * give + V1AWAVE_PECK[2] * j];
  return { k, shut: K.shut, pucker: K.pk, smack: K.sm, hd, look: glance * (1 - K.shut) + .9 * watch - .45 * give, give };
}
function v1aWaveHeadPt(hd, p) { // head-local point -> world
  const c = Math.cos(hd[2]), s = Math.sin(hd[2]), F = V1AWAVE_F;
  return [F.x + F.s * (hd[0] + c * p[0] - s * p[1]), F.y + F.s * (hd[1] + s * p[0] + c * p[1])];
}
const v1aWaveLips = (hd) => v1aWaveHeadPt(hd, [0, 52]);
function v1aWaveTipTarget() { const L = v1aWaveLips(V1AWAVE_KISSHD); return [L[0] + 70, L[1] - 170]; } // over her head, not at her face

// ---------------- sea, sky, cliff ----------------
const V1AWAVE_SEA = [];
for (let j = 0; j < 9; j++) V1AWAVE_SEA.push({ y: V1AWAVE_HZ + j * 118 + (j ? rnd(j, 71) * 26 : 0), col: [[52, 96, 170], [38, 92, 180], [26, 110, 160], C.blue2, [44, 120, 190], [30, 80, 160], C.blue2, [26, 100, 150], [40, 86, 176]][j], seed: 7100 + j });
function v1aWaveSulk(t) { return ease(t, V1.bk5 + .4, V1.bk6); }
function v1aWaveSwell(t) { // sea surface amplitude: stirred by the wave, then flat
  const stir = ease(t, V1.l3, V1.waiting) * (1 - ease(t, V1.kissed + .45, V1.kissed + .9));
  return (1 + 1.3 * stir) * (1 - .9 * v1aWaveSulk(t));
}
function v1aWaveSeaBands(g, t, from, to) {
  const x0 = lx(2) - 20, x1 = lx(2) + LW + 20, amp = v1aWaveSwell(t), sulk = v1aWaveSulk(t);
  for (let j = from; j < to; j++) {
    const S = V1AWAVE_SEA[j], top = (x) => S.y + (j ? 10 * amp * Math.sin(x / 60 + t * (1.2 + j * .2) + j) : 0), pts = [];
    for (let x = x0; x <= x1; x += 24) pts.push([x, top(x)]); pts.push([x1, YB + 40], [x0, YB + 40]);
    pane(g, polyPath(pts), mix(S.col, [84, 98, 124], .45 * sulk), S.seed, { ew: 30, shade: .3 });
    if (j && amp > .2) { g.strokeStyle = `rgba(240,248,255,${.55 * Math.min(1, amp)})`; g.lineWidth = 4; g.lineCap = 'round'; for (let x = x0 + (j * 37) % 90; x < x1; x += 90) { g.beginPath(); g.arc(x, top(x) + 14, 14, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); } }
  }
}
function v1aWaveCliff(g, t) {
  const E = V1AWAVE_CL.edge, T = V1AWAVE_CL.top;
  const face = [[E, T], [E + 30, T + 110], [E - 4, T + 210], [E + 44, T + 330], [E + 12, T + 440], [E + 60, T + 580]];
  const cliff = polyPath([[lx(2) - 20, T + 6], [E - 20, T], ...face, [lx(2) - 20, YB + 40]]);
  pane(g, cliff, [128, 112, 98], 7200, { ew: 40, shade: .36 });
  g.save(); g.clip(cliff);
  const rock = [[118, 104, 96], [92, 84, 82], [140, 118, 96], [104, 92, 90], [126, 108, 84], [80, 76, 80]];
  const gx = (c, r) => lx(2) - 40 + c * 110 + (r % 2) * 40 + (rnd(c, r, 61) - .5) * 60, gy = (c, r) => T + 10 + r * 100 + (rnd(c, r, 62) - .5) * 50;
  for (let r = 0; r < 6; r++) for (let c = 0; c < 5; c++) {
    const q = [[gx(c, r), gy(c, r)], [gx(c + 1, r), gy(c + 1, r)], [gx(c + 1, r + 1), gy(c + 1, r + 1)], [gx(c, r + 1), gy(c, r + 1)]];
    pane(g, polyPath(q), rock[Math.floor(rnd(c, r, 63) * rock.length)], 7201 + r * 7 + c, { ew: 26, shade: .34, lw: 7 });
    paint(g, 3, .45); g.beginPath(); g.moveTo(q[0][0] + 20, q[0][1] + 30); g.lineTo(q[0][0] + 50, q[0][1] + 52); g.lineTo(q[0][0] + 46, q[0][1] + 80); g.stroke();
  }
  g.restore();
  lead(g, cliff, 9);
  pane(g, smoothPath([[lx(2) - 20, T - 16], [E - 40, T - 22], [E + 6, T - 6], [E - 4, T + 18], [lx(2) - 20, T + 22]]), [70, 150, 60], 7250, { ew: 14 });
  const amp = Math.min(1, v1aWaveSwell(t)); if (amp < .15) return;
  for (let n = 0; n < 2; n++) { // small breakers at the foot of the cliff, in round glass beads
    const ph = ((t + n * .85) % 1.7) / 1.7, hh = Math.sin(Math.PI * ph) * 130 * amp, bx = E + 70 + n * 50, by = 2070 + n * 40;
    if (hh < 8) continue;
    g.save(); g.globalAlpha = 1 - lin(ph, .7, 1);
    for (let j = 0; j < 6; j++) {
      const a = Math.PI * (.15 + .7 * j / 5), rr = hh * (.6 + .4 * rnd(n, j, 64)), r = 14 + 12 * rnd(n, j, 65);
      pane(g, circPath(bx + Math.cos(a) * rr * .55, by - Math.sin(a) * rr, r * (.6 + .4 * Math.sin(Math.PI * ph))), [236, 244, 250], 7260 + n * 10 + j, { ew: 8, lw: 5, amt: .2 });
    }
    g.restore();
  }
}

// ---------------- the wave ----------------
// Bands run the length of the wave (inner hollow darkest, back lightest); each band is cut across at its own
// staggered places so the leading reads as glazing, not a grid. Band edges ripple a little.
const V1AWAVE_STRIPS = [0, .3, .55, .78, 1];
const V1AWAVE_CUTS = [[0, 9, 17, 25, 31, 37, 42, 47], [0, 6, 13, 21, 28, 34, 39, 44, 47], [0, 11, 19, 26, 32, 38, 43, 47], [0, 8, 16, 23, 30, 35, 40, 45, 47]];
const V1AWAVE_COLS = [[14, 34, 112], [24, 64, 162], [22, 106, 150], [64, 156, 178]];
const V1AWAVE_FOAM = [236, 244, 248];
const V1AWAVE_ILIP = 41; // as the curl closes the ribbon stops here, a clean lip over her head (past it the spine winds too tight)
function v1aWaveF(k, i) { // band edge k at sample i, with a gentle ripple (the outer and inner edges stay put)
  const f = V1AWAVE_STRIPS[k]; return k === 0 || k === 4 ? f : f + .045 * Math.sin(i * .45 + k * 2.1);
}
function v1aWaveClaw(g, x, y, ang, len, w, bend, seed) { // a hooked foam claw, tapering to a point, with a side hook
  if (len < 4) return;
  const pts = [[x, y]]; let a = ang, px = x, py = y;
  for (let k = 1; k <= 4; k++) { a += bend; px += Math.cos(a) * len / 4; py += Math.sin(a) * len / 4; pts.push([px, py]); }
  pane(g, smoothPath(limbPts(pts, [w, w * .78, w * .55, w * .3, 1.5]), true), V1AWAVE_FOAM, seed, { ew: 8, lw: 5, amt: .2, shade: .14 });
  const [sx, sy] = pts[2], sa = ang + bend * 2 - Math.sign(bend || 1) * .9;
  const sp = [[sx, sy], [sx + Math.cos(sa) * len * .22, sy + Math.sin(sa) * len * .22], [sx + Math.cos(sa + bend * 2.5) * len * .4, sy + Math.sin(sa + bend * 2.5) * len * .4]];
  pane(g, smoothPath(limbPts(sp, [w * .45, w * .28, 1.2]), true), V1AWAVE_FOAM, seed + 1, { ew: 6, lw: 4, amt: .2, shade: .14 });
}
function v1aWaveBody(g, t, S, sp) {
  const n = V1AWAVE_N, iCut = Math.min(Math.floor(S.uCut * (n - 1)), V1AWAVE_ILIP + Math.round((n - 1 - V1AWAVE_ILIP) * (1 - ease(S.c, .55, .75))));
  if (iCut < 2 || S.h < .01) return;
  const foamFrom = lerp(.97, .52, S.c), drop = 900 * Math.pow(ease(t, V1.kissed + .45, V1.kissed + .8), 2);
  g.save(); g.translate(0, drop);
  for (let k = 0; k < 4; k++) {
    const cuts = V1AWAVE_CUTS[k];
    for (let s = 0; s + 1 < cuts.length; s++) {
      const a = cuts[s], b = Math.min(cuts[s + 1], iCut); if (b <= a) break;
      const pts = [];
      for (let i = a; i <= b; i++) pts.push(v1aWaveAt(sp, i, v1aWaveF(k, i)));
      for (let i = b; i >= a; i--) pts.push(v1aWaveAt(sp, i, v1aWaveF(k + 1, i)));
      const u = (a + b) / 2 / (n - 1);
      let col = V1AWAVE_COLS[k], sh = .32;
      if ((k === 3 && u > foamFrom) || (u > .87 && S.c > .6)) { col = V1AWAVE_FOAM; sh = .16; } // the lip turns to foam
      else if (k === 2 && u > foamFrom + .2) col = [110, 190, 206];
      pane(g, polyPath(pts), col, 7300 + s * 10 + k, { ew: 28, shade: sh });
    }
  }
  if (iCut < n - 1) for (let q = 0; q < 6; q++) { // the lip, and the breaking edge as it comes apart: a row of foam beads
    const p = v1aWaveAt(sp, iCut, (q + .5) / 6), jit = S.uCut < .999 ? 8 * Math.sin(q * 2.3 + t * 9) : 0; v1aWaveBead(g, p[0] + jit, p[1], sp.Wd[iCut] / 6 + 4, 7480 + q);
  }
  // grisaille flow lines along each band, like brush strokes in the water
  paint(g, 3, .3);
  for (let k = 0; k < 4; k++) for (const ff of [.35, .7]) {
    g.beginPath(); let on = false;
    for (let i = 2; i < iCut - 1; i++) {
      const f = lerp(v1aWaveF(k, i), v1aWaveF(k + 1, i), ff), p = v1aWaveAt(sp, i, f);
      if (rnd(k, i, ff * 10) < .2) { on = false; continue; } on ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); on = true;
    }
    g.stroke();
  }
  // foam claws along the crest, pointing forward along the curl
  const claw = ease(S.c, .12, .7);
  if (claw > 0) for (let q = 0; q < 9; q++) {
    const u = lerp(.5, .84, q / 8), i = Math.round(u * (n - 1)); if (i >= iCut - 1) continue;
    const [x, y] = v1aWaveAt(sp, i, 1), tx = sp.P[i + 1][0] - sp.P[i - 1][0], ty = sp.P[i + 1][1] - sp.P[i - 1][1], tl = Math.hypot(tx, ty);
    const ang = Math.atan2(ty / tl * .8 + sp.N[i][1] * .75, tx / tl * .8 + sp.N[i][0] * .75);
    v1aWaveClaw(g, x, y, ang, .7 * (70 + 34 * rnd(q, 81)) * claw * (1 - .4 * (q / 8)), .8 * (30 - q * 1.6), -.38, 7400 + q * 3); // small foam, crest only
  }
  g.restore();
}
// ---------------- the shower of beads and the tear ----------------
const V1AWAVE_BEADS = [];
for (let j = 0; j < 22; j++) { // a short spill as it drops: let go within 0.12 s, falling fast, out of frame in ~0.4 s
  const u = .55 + .43 * rnd(j, 91), f = rnd(j, 92);
  V1AWAVE_BEADS.push({ u, f, tr: V1.kissed + .45 + (1 - u) * .2 + rnd(j, 93) * .03, vx: 40 - 80 * rnd(j, 94), vy: 260 + 220 * rnd(j, 95), r: 8 + 9 * rnd(j, 96), seed: 7500 + j, back: true });
}
const V1AWAVE_G = 2300, V1AWAVE_GS = 3400; // the tear's gravity, the spill's
function v1aWaveBead(g, x, y, r, seed) {
  pane(g, circPath(x, y, r), [212, 232, 238], seed, { ew: Math.max(4, r * .6), lw: Math.max(3, r * .32), shade: .28, amt: .35 });
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = Math.max(1.5, r * .18); g.lineCap = 'round';
  g.beginPath(); g.arc(x - r * .1, y - r * .1, r * .55, Math.PI * 1.05, Math.PI * 1.45); g.stroke();
}
function v1aWaveShower(g, t, back) {
  if (t < V1.kissed + .45 || t > V1.kissed + 2) return;
  for (const B of V1AWAVE_BEADS) {
    if (B.back !== back) continue;
    const dt = t - B.tr; if (dt < 0) continue;
    const S = v1aWaveState(B.tr), sp = v1aWaveSpine({ ...S, uCut: 1 }), i = Math.round(B.u * (V1AWAVE_N - 1));
    const [x0, y0] = v1aWaveAt(sp, i, B.f), y = y0 + B.vy * dt + .5 * V1AWAVE_GS * dt * dt; if (y > YB + 60) continue;
    v1aWaveBead(g, x0 + B.vx * dt, y, B.r, B.seed);
  }
}
// The tear: let go from the lip of the curl as the wave breaks, lands on her right cheek, rolls down, drips off.
const V1AWAVE_TEAR = { rel: V1.kissed + .5, land: V1.kissed + .8, rollA: V1.kissed + .85, rollB: V1.bk6 - 1.4, path: [[36, 36], [37, 50], [33, 63], [27, 73]], r: 12 };
function v1aWaveTearLocal(t) { // head-local position along the cheek path while it rolls
  const T = V1AWAVE_TEAR, P = T.path, u = ease(t, T.rollA, T.rollB) * (P.length - 1), k = Math.min(P.length - 2, Math.floor(u)), f = u - k;
  return [lerp(P[k][0], P[k + 1][0], f), lerp(P[k][1], P[k + 1][1], f), u / (P.length - 1)];
}
function v1aWaveTear(g, t) {
  const T = V1AWAVE_TEAR; if (t < T.rel || t > T.rollB + 1.2) return;
  const rW = T.r * V1AWAVE_F.s;
  if (t < T.land) { // drops from the lip of the curl, just above her, onto her cheek
    const S0 = v1aWaveState(T.rel), sp0 = v1aWaveSpine({ ...S0, uCut: 1 }), A0 = v1aWaveAt(sp0, Math.round(.9 * (V1AWAVE_N - 1)), .2);
    const C0 = v1aWaveHeadPt(v1aWavePose(T.land).hd, T.path[0]), u = lin(t, T.rel, T.land), uu = u * u;
    v1aWaveBead(g, lerp(A0[0], C0[0], u), lerp(A0[1], C0[1], uu), rW, 7590); return;
  }
  const hd = v1aWavePose(t).hd;
  if (t <= T.rollB) {
    const [lx0, ly0, p] = v1aWaveTearLocal(t);
    // a wet track behind it on her cheek
    if (p > .01) {
      g.save(); g.strokeStyle = 'rgba(236,248,252,.6)'; g.lineWidth = 5 * V1AWAVE_F.s * 1.6; g.lineCap = 'round'; g.beginPath();
      const A = v1aWaveHeadPt(hd, T.path[0]); g.moveTo(A[0], A[1]);
      for (let k = 1; k <= 12; k++) { const tt = lerp(T.rollA, t, k / 12), q = v1aWaveTearLocal(tt), W = v1aWaveHeadPt(hd, q); g.lineTo(W[0], W[1]); }
      g.stroke(); g.restore();
    }
    const [x, y] = v1aWaveHeadPt(hd, [lx0, ly0]); v1aWaveBead(g, x, y, rW * (1 + .08 * Math.sin((t - T.land) * 3)), 7590); return;
  }
  const [x0, y0] = v1aWaveHeadPt(v1aWavePose(T.rollB).hd, T.path[T.path.length - 1]), dt = t - T.rollB; // drips off the jaw
  v1aWaveBead(g, x0 - 6 * dt, y0 + .5 * V1AWAVE_G * .6 * dt * dt, rW, 7590);
}

// ---------------- the scene ----------------
function sceneV1AltWave(g, t, view) {
  v1Upper(g, 2, t, view, [30, 100, 120], [C.gold, C.blue, C.ruby]);
  g.save(); const cl = new Path2D(); cl.rect(lx(2) - 20, V1AWAVE_TOP, LW + 40, YB + 80 - V1AWAVE_TOP); g.clip(cl);
  const S = v1aWaveState(t), sp = v1aWaveSpine(S), sulk = v1aWaveSulk(t);
  const storm = .22 * ease(S.h, .3, 1) * (1 - ease(t, V1.kissed + .6, V1.bk5 + .4));
  for (const P of V1AWAVE_SKY) fpane(g, P, mix(mix([126, 184, 232], [222, 236, 248], P.light * .5), [110, 128, 158], storm + .25 * sulk), t, { ew: 26 });
  v1Clouds(g, 2, t, [[0, 770, 200, 10, 7010], [430, 930, 140, 7, 7011]]);
  v1aWaveSeaBands(g, t, 0, 4);
  v1aWaveBody(g, t, S, sp);
  v1aWaveSeaBands(g, t, 4, V1AWAVE_SEA.length);
  v1aWaveCliff(g, t);
  v1aWaveShower(g, t, true);
  // the woman at the edge
  const Q = v1aWavePose(t), F = V1AWAVE_F;
  g.save(); g.translate(F.x, F.y); g.scale(F.s, F.s);
  drawWomanV1(g, {
    dress: C.purple, mantle: [30, 110, 120], seed: 7600, mouth: Q.pucker > .3 || Q.shut > .5 ? 0 : v1Mouth(t), shut: Q.shut, pucker: Q.pucker, smack: Q.smack,
    head: Q.hd, look: Q.look,
    hands: [[-100, 470 + 14 * Q.give, .5], [100, 470 + 14 * Q.give, .5]], elbows: [[-210, 400 + 8 * Q.give], [210, 400 + 8 * Q.give]],
  });
  g.restore();
  v1aWaveTear(g, t);
  v1aWaveShower(g, t, false);
  g.restore();
}
V1SCENES[2] = sceneV1AltWave;

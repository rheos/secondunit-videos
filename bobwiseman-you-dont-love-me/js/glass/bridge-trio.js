// Stained glass, BRIDGE insert: three backing singers (Bob's note, 2026-10-11: "3 background singers like ...
// Gladys Knight and the Pips or The Supremes or The Temptations? Coordinated dance moves too").
// A Pips-style trio behind the woman who sings the song: matching suits, one mic stand each, every move in unison
// and on the backing hits. The bridge cuts to them from just before the first hit to the end of the second held
// note (TRIO.in to TRIO.out); outside that span this file draws nothing. Pure function of song time t.
// Hit times come from BR (bridge-timing.js); the voiced spans and beats below are read off the Demucs stems.

const TRIO = {
  in: 140.208,  // frame 3365, one frame before the first hit lands
  out: 148.0,   // frame 3552, the second held note has ended; the cup's four heaps take over
  // when the backing voices are sounding (vocal stem above -12 dB of its peak)
  voiced: [[140.24, 140.58], [140.72, 141.22], [141.40, 142.62], [145.74, 146.08], [146.20, 146.70], [146.88, 148.05]],
  // instrumental beats in the gap between the two runs (no_vocals stem, 86 bpm)
  beats: [142.48, 143.16, 143.85, 144.54, 145.24],
  spin: [141.42, 141.98],
  // Bob (2026-10-11): "could the Pips enter and exit off the top of the video?" The whole stage drops in from
  // above over the teacup, landing on the first hit, and flies back out of the top after the second held note.
  drop: [139.84, 140.24], lift: [148.0, 148.42],
};

// ---- the figure ----
// Local coordinates: origin at the pelvis, y down, 1 unit = 1 px at scale 1. Arm and leg angles are absolute
// directions in screen terms: 0 points straight down, +pi/2 points to screen right, pi points up.
const FIG = { shY: -300, shX: 74, hipX: 38, up: 150, lo: 138, th: 190, sh: 186, neck: 34, headR: 50 };

// Poses: L/R = screen-left / screen-right arm [upper, forearm]; lL/lR = legs [thigh, shin]; x = hip shift;
// lean = torso tilt (+ leans to screen right); tilt = head tilt; dip = how far the body sinks (knees).
const POSE = {
  idle:   { L: [-.22, .95], R: [.22, -.95], lL: [-.05, -.02], lR: [.05, .02], x: 0, lean: 0, tilt: 0, dip: 6 },
  palm:   { L: [-.3, .85], R: [2.35, 2.95], lL: [-.06, -.02], lR: [.12, .02], x: 6, lean: .06, tilt: .06, dip: 10 },
  roll:   { L: [-.55, 1.62], R: [.55, -1.62], lL: [-.02, -.06], lR: [.28, .1], x: 38, lean: -.05, tilt: -.05, dip: 14 },
  point:  { L: [-.5, -.15], R: [.95, .98], lL: [-.28, -.1], lR: [.02, .06], x: -38, lean: .1, tilt: .16, dip: 16 },
  wide:   { L: [-2.05, -2.15], R: [2.05, 2.15], lL: [-.14, -.08], lR: [.14, .08], x: 0, lean: 0, tilt: -.04, dip: 4 },
  stepL:  { L: [-.25, 1.15], R: [.35, -.55], lL: [-.2, -.08], lR: [.02, .12], x: -26, lean: .05, tilt: .08, dip: 12 },
  stepR:  { L: [-.35, .55], R: [.25, -1.15], lL: [-.02, -.12], lR: [.2, .08], x: 26, lean: -.05, tilt: -.08, dip: 12 },
  vee:    { L: [-2.6, -2.7], R: [2.6, 2.7], lL: [-.08, -.04], lR: [.08, .04], x: 0, lean: 0, tilt: 0, dip: 2 },
  chest:  { L: [-.4, 2.1], R: [.4, -2.1], lL: [-.04, -.02], lR: [.04, .02], x: 0, lean: 0, tilt: .1, dip: 20 },
  sky:    { L: [-.3, 1.0], R: [2.55, 2.6], lL: [-.16, -.06], lR: [.04, .02], x: -10, lean: -.08, tilt: -.22, dip: 8 },
  // the gap routine (Bob, 2026-10-12: "some choreography that's more slick"). x here travels the whole singer.
  slideL: { L: [-1.35, -1.1], R: [.9, 1.5], lL: [-.32, -.12], lR: [.08, .1], x: -92, lean: .12, tilt: .1, dip: 16 },
  kickR:  { L: [-2.3, -2.5], R: [.5, -.2], lL: [-.02, -.02], lR: [1.15, .75], x: -80, lean: -.14, tilt: -.06, dip: 4 },
  slideR: { L: [-.9, -1.5], R: [1.35, 1.1], lL: [-.08, -.1], lR: [.32, .12], x: 92, lean: -.12, tilt: -.1, dip: 16 },
  kickL:  { L: [-.5, .2], R: [2.3, 2.5], lL: [-1.15, -.75], lR: [.02, .02], x: 80, lean: .14, tilt: .06, dip: 4 },
  lowR:   { L: [-.6, .4], R: [2.2, 2.0], lL: [-.55, .35], lR: [.55, -.1], x: 0, lean: -.1, tilt: -.14, dip: 64 },
  lowL:   { L: [-2.2, -2.0], R: [.6, -.4], lL: [-.55, .1], lR: [.55, -.35], x: 0, lean: .1, tilt: .14, dip: 64 },
};
const BEAT = 60 / 86;
// The last held note: a staggered "ta-da", low, middle, high (singer 0, 1, 2).
const FINAL = [
  { L: [-1.7, -1.9], R: [1.25, 1.55], lL: [-.8, -.38], lR: [.8, .38], x: 0, lean: .06, tilt: .12, dip: 0 },
  { L: [-1.95, -2.1], R: [1.95, 2.1], lL: [-.18, -.08], lR: [.18, .08], x: 0, lean: 0, tilt: 0, dip: 30 },
  { L: [-1.2, -1.6], R: [2.7, 2.8], lL: [-.06, -.02], lR: [.12, .04], x: 0, lean: -.08, tilt: -.14, dip: -6 },
];

// Timeline: [arrive time, pose, transition length]. Each move lands on its hit with a little overshoot.
function trioKeys(k) {
  const h = BR.hits, b = TRIO.beats;
  return [
    [TRIO.in, POSE.idle, .01],
    [h[0], POSE.palm, .1], [h[1] + .04, POSE.roll, .12], [h[2], POSE.point, .14],
    [h[3] + .02, POSE.wide, .3],                       // the spin carries them round into it (TRIO.spin)
    // slide left and kick, slide right and kick, a spin that ripples down the line (singer 0 first),
    // a knee drop pointing right then left, and up into the second run
    [b[0], POSE.slideL, .22], [b[0] + BEAT / 2, POSE.kickR, .14],
    [b[1], POSE.slideR, .22], [b[1] + BEAT / 2, POSE.kickL, .14],
    [b[2] + .1 + k * .12, POSE.wide, .3],
    [b[3] + k * .06, POSE.lowR, .2], [b[3] + BEAT / 2 + k * .06, POSE.lowL, .16],
    [b[4] + .1, POSE.idle, .3],
    [h[4], POSE.vee, .1], [h[5] + .04, POSE.chest, .1], [h[6], POSE.sky, .14],
    [h[7] + .04, FINAL[k], .26],
  ];
}
const TRIO_KEYS = [0, 1, 2].map(trioKeys);
function mixPose(A, Bp, u) {
  const o = {};
  for (const key in A) o[key] = Array.isArray(A[key]) ? A[key].map((v, i) => lerp(v, Bp[key][i], u)) : lerp(A[key], Bp[key], u);
  return o;
}
function poseAt(k, t) {
  const K = TRIO_KEYS[k];
  let i = 0; while (i + 1 < K.length && K[i + 1][0] - K[i + 1][2] <= t) i++;
  if (i === 0) return K[0][1];
  const [ta, P, d] = K[i], u = easeOutBack(clamp((t - (ta - d)) / d), 1.2);
  return mixPose(K[i - 1][1], P, u);
}
const voicedAt = (t) => TRIO.voiced.find(([a, b]) => t >= a && t < b);
function trioMouthAt(t) { // 0 shut, 1 wide: opens on each sung hit, closes to an "m" at its end
  const v = voicedAt(t); if (!v) return .08;
  return ease(t, v[0] - .03, v[0] + .05) * (1 - .8 * ease(t, v[1] - .09, v[1]));
}
function hitPulse(t) { let p = 0; for (const h of BR.hits) if (t >= h) p = Math.max(p, Math.exp(-(t - h) * 7)); return p; }
function beatPulse(t) { let p = 0; for (const b of TRIO.beats) if (t >= b) p = Math.max(p, Math.exp(-(t - b) * 9)); return p; }

const SINGERS = [
  { x: 470, skin: [116, 70, 44], hair: [26, 18, 14], mous: true, face: .96, seed: 9100 },
  { x: 960, skin: [92, 54, 34], hair: [20, 14, 12], mous: false, face: 1.06, seed: 9200 },
  { x: 1450, skin: [138, 88, 56], hair: [30, 20, 14], mous: false, part: true, face: 1, seed: 9300 },
];
const SUIT = [74, 150, 214], SUIT2 = [40, 96, 170], LAPEL = [232, 176, 40], TIE = [176, 20, 40], SHIRT = [232, 234, 222];
const TRIO_FLOOR_Y = 1018, TRIO_SC = .92;

function armPts(sx, sy, P) {
  const [a1, a2] = P, ex = sx + Math.sin(a1) * FIG.up, ey = sy + Math.cos(a1) * FIG.up;
  return [[sx, sy], [ex, ey], [ex + Math.sin(a2) * FIG.lo, ey + Math.cos(a2) * FIG.lo]];
}
function legPts(hx, P) {
  const [a1, a2] = P, kx = hx + Math.sin(a1) * FIG.th, ky = Math.cos(a1) * FIG.th;
  return [[hx, 0], [kx, ky], [kx + Math.sin(a2) * FIG.sh, ky + Math.cos(a2) * FIG.sh]];
}
// a limb as one leaded piece per segment
function limb(g, pts, w0, w1, col, seed) {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], wa = lerp(w0, w1, i / (pts.length - 1)), wb = lerp(w0, w1, (i + 1) / (pts.length - 1));
    pane(g, smoothPath(limbPts([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], b], [wa, (wa + wb) / 2, wb])), col, seed + i, { ew: 14, shade: .32, lw: 6 });
  }
}

// pose (optional): draw this pose instead of the bridge timeline (the intro walk-on uses it); no spin then
function drawSinger(g, s, k, t, pose) {
  const gs = TRIO.beats[2] + k * .12; // the gap spin, one singer after the other
  const P = pose || poseAt(k, t), spinU = pose ? 0 : ease(t, TRIO.spin[0], TRIO.spin[1]) + ease(t, gs, gs + .5), phi = spinU * TAU, cs = Math.cos(phi);
  const back = cs < 0, sx = Math.max(.12, Math.abs(cs));
  const shim = (t > 141.98 && t < 142.6) ? Math.sin(t * TAU * 8) * 7 * (1 - ease(t, 142.4, 142.6)) : 0;
  const bob = 5 * beatPulse(t) + 4 * hitPulse(t);
  // the lower foot stands on the stage; dip only adds a knee give on top of that
  const legH = Math.max(...[P.lL, P.lR].map(([a1, a2]) => FIG.th * Math.cos(a1) + FIG.sh * Math.cos(a2)));
  const pelvisY = TRIO_FLOOR_Y - legH * TRIO_SC + (Math.max(0, P.dip - 6) * .5 + bob) * TRIO_SC;
  g.save(); g.translate(s.x + P.x * TRIO_SC, pelvisY); g.scale(TRIO_SC * sx, TRIO_SC);

  // legs and shoes (trousers in the darker suit blue)
  for (const [hx, LP, side] of [[-FIG.hipX, P.lL, -1], [FIG.hipX, P.lR, 1]]) {
    const pts = legPts(hx, LP); limb(g, pts, 56, 44, SUIT2, s.seed + 10 + side);
    const [ax, ay] = pts[2];
    pane(g, ellPath(ax + side * 16, ay + 8, 36, 15, 0), [24, 20, 22], s.seed + 20 + side, { ew: 8, shade: .2, lw: 5 });
    g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(ax + side * 22, ay + 3, 12, 4, 0, 0, TAU); g.fill();
  }
  // upper body, tilted about the pelvis
  g.rotate(P.lean); g.translate(shim, 0);
  const jacket = [[-74, 72], [-58, -40], [-54, -120], [-FIG.shX - 12, FIG.shY + 20], [-FIG.shX + 6, FIG.shY - 8], [FIG.shX - 6, FIG.shY - 8], [FIG.shX + 12, FIG.shY + 20], [54, -120], [58, -40], [74, 72], [10, 64], [0, -40], [-10, 64]];
  pane(g, polyPath(jacket), SUIT, s.seed + 30, { ew: 30, shade: .34, lw: 8 });
  if (!back) {
    pane(g, polyPath([[-26, FIG.shY - 4], [26, FIG.shY - 4], [0, -150]]), SHIRT, s.seed + 31, { ew: 10, shade: .15, lw: 5 });
    pane(g, polyPath([[-26, FIG.shY - 4], [-46, FIG.shY + 20], [-30, -110], [0, -150]]), LAPEL, s.seed + 32, { ew: 10, shade: .25, lw: 5 });
    pane(g, polyPath([[26, FIG.shY - 4], [46, FIG.shY + 20], [30, -110], [0, -150]]), LAPEL, s.seed + 33, { ew: 10, shade: .25, lw: 5 });
    pane(g, polyPath([[-22, FIG.shY + 2], [0, FIG.shY + 12], [22, FIG.shY + 2], [22, FIG.shY + 22], [0, FIG.shY + 12], [-22, FIG.shY + 22]]), TIE, s.seed + 34, { ew: 6, shade: .2, lw: 4 });
    for (const y of [-118, -78]) { g.fillStyle = rgb(LAPEL); g.beginPath(); g.arc(0, y, 6, 0, TAU); g.fill(); lead(g, circPath(0, y, 6), 3); }
  } else {
    paint(g, 3, .5); g.beginPath(); g.moveTo(0, FIG.shY + 10); g.lineTo(0, 66); g.stroke(); // back seam
  }
  // sequins: gold chips that glint, most on the hits
  const hp = hitPulse(t);
  for (let q = 0; q < 26; q++) {
    const u = rnd(s.seed, q), v = rnd(s.seed, q + 40), x = lerp(-60, 60, u), y = lerp(FIG.shY + 30, 50, v);
    const gl = Math.max(0, Math.sin(t * (3 + rnd(q, 5) * 4) + q * 2.3)) ** 6 * .6 + hp * rnd(q, Math.floor(t * 12));
    if (gl < .08) continue;
    g.fillStyle = `rgba(255,246,200,${Math.min(1, gl)})`; g.beginPath(); g.arc(x, y, 2.5 + 3 * gl, 0, TAU); g.fill();
  }
  // arms (sleeves, then hands); seen from the back the arms swap sides
  const arms = [[-FIG.shX, back ? P.R.map((a) => -a) : P.L, -1], [FIG.shX, back ? P.L.map((a) => -a) : P.R, 1]];
  for (const [ax, AP, side] of arms) {
    const pts = armPts(ax, FIG.shY + 12, AP); limb(g, pts, 50, 38, SUIT, s.seed + 40 + side);
    { const [cx, cy] = pts[2]; pane(g, circPath(cx, cy, 15), SHIRT, s.seed + 46 + side, { ew: 6, shade: .15, lw: 4 }); } // shirt cuff
    const [hx, hy] = pts[2], hand = smoothPath(blobPts(hx + Math.sin(AP[1]) * 14, hy + Math.cos(AP[1]) * 14, 17, 20, s.seed + side));
    pane(g, hand, s.skin, s.seed + 44 + side, { ew: 10, shade: .25, lw: 5 });
    // the snap on each gap beat: a little white star at the fingers
    const bp = (t > TRIO.beats[0] - .05 && t < TRIO.beats[4] + .3) ? beatPulse(t) : 0;
    if (bp > .15) {
      g.strokeStyle = `rgba(255,250,220,${bp})`; g.lineWidth = 3; g.beginPath();
      const fx = hx + Math.sin(AP[1]) * 30, fy = hy + Math.cos(AP[1]) * 30;
      for (let r = 0; r < 4; r++) { const a = r * Math.PI / 4; g.moveTo(fx - Math.cos(a) * 14 * bp, fy - Math.sin(a) * 14 * bp); g.lineTo(fx + Math.cos(a) * 14 * bp, fy + Math.sin(a) * 14 * bp); }
      g.stroke();
    }
  }
  // neck and head
  const hy = FIG.shY - FIG.neck - FIG.headR * s.face + 6;
  pane(g, polyPath([[-15, FIG.shY + 2], [-14, FIG.shY - FIG.neck - 6], [14, FIG.shY - FIG.neck - 6], [15, FIG.shY + 2]]), s.skin, s.seed + 50, { ew: 8, shade: .3, lw: 5 });
  g.save(); g.translate(0, hy); g.rotate(P.tilt + (back ? 0 : .04 * hitPulse(t)));
  drawSingerHead(g, s, t, back);
  g.restore();
  g.restore();
}
function blobPts(cx, cy, rx, ry, seed, n = 9) { return [...Array(n)].map((_, i) => { const a = i / n * TAU, w = 1 + .1 * n1(seed, i); return [cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w]; }); }

function drawSingerHead(g, s, t, back) {
  const R = FIG.headR, f = s.face, rx = R * .86 * f, ry = R * 1.06 * f;
  const face = ellPath(0, 0, rx, ry, 0);
  if (back) { pane(g, face, s.hair, s.seed + 60, { ew: 20, shade: .3, lw: 7 }); return; }
  pane(g, face, s.skin, s.seed + 61, { ew: 26, shade: .3, lw: 7 });
  // ears
  for (const sd of [-1, 1]) pane(g, ellPath(sd * rx * .98, 4, 9, 15, 0), s.skin, s.seed + 62 + sd, { ew: 6, shade: .3, lw: 4 });
  // short hair cap (a side part on the right-hand singer)
  const cap = [[-rx * 1.02, -ry * .1], [-rx * .95, -ry * .62], [-rx * .5, -ry * 1.02], [0, -ry * 1.1], [rx * .5, -ry * 1.02], [rx * .95, -ry * .62], [rx * 1.02, -ry * .1], [rx * .7, -ry * .55], [0, -ry * .66], [-rx * .7, -ry * .55]];
  pane(g, smoothPath(cap), s.hair, s.seed + 63, { ew: 12, shade: .2, lw: 6 });
  if (s.part) { g.strokeStyle = 'rgba(200,190,170,.5)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-rx * .45, -ry * .98); g.lineTo(-rx * .38, -ry * .64); g.stroke(); }
  // grisaille: brows, eyes, nose, mouth
  const m = trioMouthAt(t);
  paint(g, 4, .9);
  for (const sd of [-1, 1]) { // brows lift when singing
    g.beginPath(); g.moveTo(sd * rx * .18, -ry * .3 - m * 4); g.quadraticCurveTo(sd * rx * .42, -ry * .42 - m * 6, sd * rx * .64, -ry * .3 - m * 3); g.stroke();
  }
  const shut = m > .55 ? .4 : 1; // eyes half-close on the big notes
  for (const sd of [-1, 1]) {
    g.fillStyle = 'rgba(238,232,214,.95)'; g.beginPath(); g.ellipse(sd * rx * .4, -ry * .14, rx * .18, ry * .07 * shut, 0, 0, TAU); g.fill();
    g.fillStyle = 'rgba(30,18,10,.95)'; g.beginPath(); g.ellipse(sd * rx * .4, -ry * .14, rx * .07, ry * .065 * shut, 0, 0, TAU); g.fill();
    paint(g, 3, .85); g.beginPath(); g.ellipse(sd * rx * .4, -ry * .14, rx * .19, ry * .08 * shut, 0, Math.PI, TAU); g.stroke();
  }
  paint(g, 3.5, .8); g.beginPath(); g.moveTo(-rx * .04, -ry * .06); g.quadraticCurveTo(-rx * .1, ry * .2, -rx * .18, ry * .25); g.quadraticCurveTo(0, ry * .32, rx * .18, ry * .25); g.stroke();
  if (s.mous) { g.fillStyle = 'rgba(28,16,10,.9)'; g.beginPath(); g.ellipse(0, ry * .38, rx * .3, ry * .045, 0, 0, TAU); g.fill(); }
  const mw = rx * (.26 + .1 * m), mh = ry * (.03 + .2 * m), my = ry * (.52 + .06 * m);
  g.fillStyle = 'rgba(54,10,18,.95)'; g.beginPath(); g.ellipse(0, my, mw, Math.max(2, mh), 0, 0, TAU); g.fill();
  if (m > .3) { g.fillStyle = 'rgba(240,236,220,.9)'; g.fillRect(-mw * .6, my - mh + 1, mw * 1.2, mh * .28); }
  paint(g, 3, .8); g.beginPath(); g.ellipse(0, my, mw, Math.max(2, mh), 0, 0, TAU); g.stroke();
}

function drawMicStand(g, s, t) {
  // stand on the singer's left (screen right), a short boom, and a round ribbon mic just below his chin
  const fx = s.x + 112, top = 430, mx = s.x + 50, my = 384, J = 3 * hitPulse(t);
  pane(g, ellPath(fx, TRIO_FLOOR_Y + 4, 40, 10, 0), [70, 70, 76], s.seed + 70, { ew: 8, shade: .3, lw: 5 });
  pane(g, polyPath([[fx - 5, TRIO_FLOOR_Y], [fx - 4, top], [fx + 4, top], [fx + 5, TRIO_FLOOR_Y]]), C.gold, s.seed + 71, { ew: 4, shade: .2, lw: 4 });
  pane(g, smoothPath(limbPts([[fx, top + 2], [(fx + mx) / 2, (top + my) / 2 + 4], [mx + 18, my + 18]], [9, 8, 7])), C.gold, s.seed + 74, { ew: 4, shade: .2, lw: 4 });
  g.save(); g.translate(mx + J * Math.sin(t * 90), my); g.rotate(.7);
  pane(g, ellPath(0, 0, 20, 25, 0), [210, 214, 220], s.seed + 72, { ew: 10, shade: .35, lw: 5 });
  paint(g, 2, .55); for (let r = -1; r <= 1; r++) { g.beginPath(); g.moveTo(-15, r * 9); g.lineTo(15, r * 9); g.stroke(); }
  g.restore();
}

// The panel: a night sky of quarries and painted stars (as the reader's alcove), a pointed arch of ruby and gold
// along the top, a leaded spotlight disc behind each singer, and a stage of gold and ruby glass.
const TRIO_Q = [];
(function buildTrioQ() {
  const qw = 60, qh = 86;
  for (let row = 0, cy = 1080; cy > -120; row++, cy -= qh) {
    for (let cx = -60 + (row % 2) * qw; cx < 2000; cx += qw * 2) TRIO_Q.push({ path: polyPath([[cx - qw, cy], [cx, cy - qh], [cx + qw, cy], [cx, cy + qh]]), cx, cy, seed: 9500 + row * 61 + Math.round(cx / qw), k: (((row * 3 + Math.round(cx / qw)) % 5) + 5) % 5 });
  }
})();
function drawTrioPanel(g, t) {
  g.fillStyle = 'rgb(10,10,26)'; g.fillRect(-100, -100, W + 200, H + 200);
  const QC = [[26, 32, 86], [34, 28, 92], [20, 26, 70], [30, 40, 96], [40, 30, 84]];
  for (const Q of TRIO_Q) {
    pane(g, Q.path, QC[Q.k], Q.seed, { ew: 22, shade: .45, lw: 6 });
    if (Q.k % 2 === 0) {
      const tw = .55 + .45 * Math.sin(t * 2.1 + Q.seed);
      g.strokeStyle = `rgba(250,226,150,${.3 + .35 * tw})`; g.lineWidth = 2.5; g.lineCap = 'round'; g.beginPath();
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4, r = k % 2 ? 6 : 12; g.moveTo(Q.cx - Math.cos(a) * r, Q.cy - Math.sin(a) * r); g.lineTo(Q.cx + Math.cos(a) * r, Q.cy + Math.sin(a) * r); }
      g.stroke();
    }
  }
  // spotlight discs: rose glass ringed in gold, flaring on the hits
  const hp = hitPulse(t);
  for (const s of SINGERS) {
    const cy = TRIO_FLOOR_Y - 600, r = 228;
    pane(g, circPath(s.x, cy, r + 22), C.gold, s.seed + 80, { ew: 16, shade: .25, lw: 8 });
    pane(g, circPath(s.x, cy, r), mix([150, 70, 150], [222, 120, 190], .35 + .5 * hp), s.seed + 81, { ew: 90, shade: .4, lw: 8, amt: .4 });
    for (let k = 0; k < 12; k++) { // radiating lead lines, as a glazier would cut a disc this big
      const a = k / 12 * TAU + .13; lead(g, polyPath([[s.x, cy], [s.x + Math.cos(a) * r, cy + Math.sin(a) * r]], false), 5);
    }
  }
  // the arch across the top
  const arch = new Path2D(); arch.moveTo(-40, 260); arch.quadraticCurveTo(W / 2, -260, W + 40, 260); arch.lineTo(W + 40, -60); arch.lineTo(-40, -60); arch.closePath();
  pane(g, arch, C.ruby, 9601, { ew: 40, shade: .35, lw: 10 });
  const inner = new Path2D(); inner.moveTo(-40, 300); inner.quadraticCurveTo(W / 2, -200, W + 40, 300);
  lead(g, inner, 30); g.lineWidth = 18; g.strokeStyle = rgb(C.gold); g.stroke(inner); lead(g, inner, 4);
  for (let k = 0; k < 9; k++) { // gold stars set in the arch
    const u = (k + .5) / 9, x = lerp(-40, W + 40, u), y = (1 - u) * (1 - u) * 230 + 2 * u * (1 - u) * -290 + u * u * 230;
    pane(g, starPath(x, y, 20), C.gold, 9610 + k, { ew: 8, shade: .2, lw: 4 });
  }
  // the stage
  pane(g, polyPath([[-40, TRIO_FLOOR_Y], [W + 40, TRIO_FLOOR_Y], [W + 40, H + 40], [-40, H + 40]]), C.ruby2, 9620, { ew: 30, shade: .4, lw: 8 });
  for (let x = -40, k = 0; x < W + 40; x += 120, k++) pane(g, polyPath([[x, TRIO_FLOOR_Y], [x + 120, TRIO_FLOOR_Y], [x + 100, TRIO_FLOOR_Y + 26], [x + 20, TRIO_FLOOR_Y + 26]]), C.gold, 9630 + k, { ew: 8, shade: .25, lw: 5 });
}

function drawTrio(g, t) {
  const hp = hitPulse(t), push = 1 + .05 * ease(t, TRIO.in, 145.6) + .05 * ease(t, BR.hits[7], BR.hits[7] + 1);
  const z = push + .018 * hp, cy = H / 2 + 30 * ease(t, BR.hits[7], BR.hits[7] + 1);
  g.setTransform(z, 0, 0, z, W / 2 - W / 2 * z, cy - H / 2 * z);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  drawTrioPanel(g, t);
  SINGERS.forEach((s, k) => { drawSinger(g, s, k, t); drawMicStand(g, s, t); });
  // finish: glass texture, warm light through it, the spot flares, bloom, vignette, grain
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'overlay'; g.globalAlpha = .55; g.fillStyle = texPattern(g); g.fillRect(0, 0, W, H);
  g.globalAlpha = 1; g.globalCompositeOperation = 'multiply'; g.fillStyle = rgb([255, 252, 244]); g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'screen';
  for (const s of SINGERS) {
    const x = W / 2 + (s.x - W / 2) * z, y = cy + (TRIO_FLOOR_Y - 600 - H / 2) * z;
    const rg = g.createRadialGradient(x, y, 0, x, y, 420); rg.addColorStop(0, `rgba(255,230,240,${.1 + .16 * hp})`); rg.addColorStop(1, 'rgba(255,230,240,0)');
    g.fillStyle = rg; g.fillRect(x - 420, y - 420, 840, 840);
  }
  g.globalCompositeOperation = 'source-over';
  bloom(g, .3);
  const vg = g.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, W * .65); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.3)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  drawGrain(g, t, .06);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

// Where the stage hangs: 0 covers the frame, -H is just out of the top; null when it is not in shot.
function trioY(t) {
  if (t < TRIO.drop[0] || t >= TRIO.lift[1]) return null;
  if (t < TRIO.drop[1]) { const u = lin(t, TRIO.drop[0], TRIO.drop[1]); return -H * Math.pow(1 - u, 3); }
  if (t >= TRIO.lift[0]) { const u = lin(t, TRIO.lift[0], TRIO.lift[1]); return -H * u * u * u; }
  return 0;
}
const TRIO_C = mkCanvas(W, H), trioCx = TRIO_C.getContext('2d');
let trioBase = false;
// Called at the top of the bridge's renderFrame: draws the stage (and, while it moves, the bridge under it).
// Returns true when it has drawn the frame.
function trioFrame(t, renderBase) {
  if (trioBase) return false;
  const y = trioY(t); if (y === null) return false;
  drawTrio(g, t);
  if (y === 0) return true;
  trioCx.clearRect(0, 0, W, H); trioCx.drawImage(out, 0, 0);
  trioBase = true; renderBase(t); trioBase = false;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  const sh = g.createLinearGradient(0, H + y, 0, H + y + 60); sh.addColorStop(0, 'rgba(0,0,0,.55)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = sh; g.fillRect(0, H + y, W, 60); // its shadow on the scene below
  g.drawImage(TRIO_C, 0, y);
  g.fillStyle = LEAD; g.fillRect(0, H + y - 14, W, 14); g.fillStyle = rgb(C.gold); g.fillRect(0, H + y - 11, W, 6); // the bottom bar of its frame
  return true;
}

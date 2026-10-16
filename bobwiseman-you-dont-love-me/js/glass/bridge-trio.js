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
  roll: [[140.39, 140.70], [142.48, 143.55]], // hand rolls (draft 6): the second "ba", then the Temptations walk
  chick: [141.98, 142.45],                     // chicken elbows through the end of the first held note
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
// Draft 6 (Bob, 2026-10-13: "could they also roll their hand or make a chicken dance w elbows or a hora. I want it
// funnier by virtue of activity. just Google the temptations"): the Temptations walk, a hat tip, a hora line.
const POSE6 = {
  chick:  { L: [-1.3, 1.85], R: [1.3, -1.85], lL: [-.12, -.04], lR: [.12, .04], x: 0, lean: 0, tilt: .06, dip: 24 },   // hands in the armpits
  walkL:  { L: [-.25, .95], R: [.25, -.95], lL: [-.32, -.14], lR: [.04, .1], x: -70, lean: .1, tilt: .1, dip: 14 },    // the Temptations walk:
  touchL: { L: [-.25, .95], R: [.25, -.95], lL: [-.06, -.02], lR: [-.16, -.28], x: -88, lean: .04, tilt: .12, dip: 8 }, // step, then touch
  walkR:  { L: [-.25, .95], R: [.25, -.95], lL: [-.04, -.1], lR: [.32, .14], x: 70, lean: -.1, tilt: -.1, dip: 14 },
  touchR: { L: [-.25, .95], R: [.25, -.95], lL: [.16, .28], lR: [.06, .02], x: 88, lean: -.04, tilt: -.12, dip: 8 },
  salute: { L: [-.25, .95], R: [2.3, -1.65], lL: [-.05, -.02], lR: [.05, .02], x: 0, lean: -.04, tilt: -.1, dip: 8 },   // fingers to the hat brim
  flick:  { L: [-.25, .95], R: [2.1, 1.9], lL: [-.05, -.02], lR: [.05, .02], x: 0, lean: .05, tilt: .08, dip: 4 },      // and tip it out
  // the hora: hands joined with the neighbours at shoulder height, kicking out together, the line rocking
  horaR:  { L: [-1.0, -2.65], R: [1.0, 2.65], lL: [-.04, -.02], lR: [.95, .5], x: -24, lean: -.08, tilt: -.08, dip: 2 },
  horaL:  { L: [-1.0, -2.65], R: [1.0, 2.65], lL: [-.95, -.5], lR: [.04, .02], x: 24, lean: .08, tilt: .08, dip: 2 },
};
const BEAT = 60 / 86;
// The last held note: a staggered "ta-da", low, middle, high (singer 0, 1, 2).
const FINAL = [
  { L: [-1.7, -1.9], R: [1.25, 1.55], lL: [-.8, -.38], lR: [.8, .38], x: 0, lean: .06, tilt: .12, dip: 0 },
  { L: [-1.95, -2.1], R: [1.95, 2.1], lL: [-.18, -.08], lR: [.18, .08], x: 0, lean: 0, tilt: 0, dip: 30 },
  { L: [-1.2, -1.6], R: [2.7, 2.8], lL: [-.06, -.02], lR: [.12, .04], x: 0, lean: -.08, tilt: -.14, dip: -6 },
];

// Timeline: [arrive time, pose, transition length]. Each move lands on its hit with a little overshoot.
// Draft 6: a new move every half beat to a beat. Run 1: palm, a hand roll, point, the spin, then chicken elbows
// flapping through the end of the held note. Gap: the Temptations walk left and right with hand rolls, a unison hat
// tip on b[2] that flicks out into the rippling spin, a hora kick line on b[3] and b[4]. Run 2: vee, chest, sky,
// point, the ta-da, and a last hat tip as they fly out.
const H6 = BEAT / 2;
const trioTip = (P, R) => ({ ...P, R });
function trioKeys(k) {
  const h = BR.hits, b = TRIO.beats, F = FINAL[k];
  return [
    [TRIO.in, POSE.idle, .01],
    [h[0], POSE.palm, .1], [h[1] + .04, POSE.roll, .12], [h[2], POSE.point, .14],
    [h[3] + .02, POSE.wide, .3],                       // the spin carries them round into it (TRIO.spin)
    [142.04, POSE6.chick, .1],                         // chicken elbows on the shimmy (TRIO.chick)
    [b[0], POSE6.walkL, .16], [b[0] + H6, POSE6.touchL, .12], [b[1], POSE6.walkR, .16], [b[1] + H6, POSE6.touchR, .12],
    [b[2] - .1, POSE6.salute, .12], [b[2], POSE6.flick, .1], // then the spin ripples down the line (drawSinger)
    [b[3], POSE6.horaR, .14], [b[3] + H6, POSE6.horaL, .12], [b[4], POSE6.horaR, .12], [b[4] + H6, POSE6.horaL, .12],
    [h[4], POSE.vee, .1], [h[5] + .04, POSE.chest, .1], [h[6], POSE.sky, .14], [h[6] + .33, POSE.point, .12],
    [h[7] + .04, F, .26],
    [147.5, trioTip(F, POSE6.salute.R), .16], [147.8, trioTip(F, POSE6.flick.R), .12], // goodbye, as the stage lifts
  ];
}
const TRIO_KEYS = [0, 1, 2].map(trioKeys);
function mixPose(A, Bp, u) { // a scalar one pose lacks (draft 10's palm) counts as 0
  const o = {};
  for (const key of new Set([...Object.keys(A), ...Object.keys(Bp)])) {
    const a = A[key] ?? (Array.isArray(Bp[key]) ? Bp[key] : 0), b = Bp[key] ?? (Array.isArray(a) ? a : 0);
    o[key] = Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], u)) : lerp(a, b, u);
  }
  return o;
}
function poseAt(k, t) {
  const K = TRIO_KEYS[k];
  let i = 0; while (i + 1 < K.length && K[i + 1][0] - K[i + 1][2] <= t) i++;
  if (i === 0) return K[0][1];
  const [ta, P, d] = K[i], u = easeOutBack(clamp((t - (ta - d)) / d), 1.2);
  return mixPose(K[i - 1][1], P, u);
}
// Moves on top of the keyed poses, faded in and out at the window's edges (0.05 s):
// a hand roll (forearms circling each other in front of the belt, two turns a beat) and the chicken's flapping
// elbows (four flaps a beat, knees bouncing with them).
function trioMoves(t, P) {
  const env = (a, b) => ease(t, a - .05, a + .03) * (1 - ease(t, b - .05, b + .03));
  for (const [a, b] of TRIO.roll) {
    const w = env(a, b); if (w <= 0) continue;
    const ph = TAU * (t - a) / H6, s1 = Math.sin(ph), c1 = Math.cos(ph);
    const L = [-.42 + .2 * s1, 1.5 + .5 * c1], R = [.42 + .2 * s1, -1.5 + .5 * c1]; // R runs half a turn behind L
    P = { ...P, L: P.L.map((v, i) => lerp(v, L[i], w)), R: P.R.map((v, i) => lerp(v, R[i], w)) };
  }
  { const [a, b] = TRIO.chick, w = env(a, b);
    if (w > 0) {
      const f = .5 + .5 * Math.sin(TAU * (t - a) / (BEAT / 4) - Math.PI / 2);
      P = { ...P, L: [P.L[0] - .5 * f * w, P.L[1]], R: [P.R[0] + .5 * f * w, P.R[1]], dip: P.dip + 12 * f * w, tilt: P.tilt + .1 * Math.sin(TAU * (t - a) / (BEAT / 2)) * w };
    } }
  return P;
}
const trioPoseAt = (k, t) => trioMoves(t, poseAt(k, t));
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
// Draft 10 (Bob's photo, 2026-10-16: a 1960s soul group in matching sharkskin tuxedo jackets): pale sharkskin
// jackets with a lighter piece of glass for the sheen down each front and sleeve, satin-black peaked lapels with
// their own sheen strip, one button, black pocket welts, black bow ties, white shirts, black trousers with a satin
// stripe. The gold sequins are gone (sharkskin shines by itself).
const SUIT = [172, 176, 188], SHEEN = [214, 219, 230], SUIT2 = [40, 38, 48], SATIN = [84, 80, 100],
  LAPEL = [30, 28, 34], LAPEL2 = [96, 94, 108], TIE = [22, 20, 28], SHIRT = [232, 234, 222];
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
function limb(g, pts, w0, w1, col, seed, amt = 1) {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], wa = lerp(w0, w1, i / (pts.length - 1)), wb = lerp(w0, w1, (i + 1) / (pts.length - 1));
    pane(g, smoothPath(limbPts([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], b], [wa, (wa + wb) / 2, wb])), col, seed + i, { ew: 14, shade: .32, lw: 6, amt });
  }
}
// a narrow strip of lighter glass down the middle of a limb (the jacket's sheen on the sleeves, the trousers' stripe)
function limbStrip(g, pts, w, col, seed) {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], u = (q) => [lerp(a[0], b[0], q), lerp(a[1], b[1], q)];
    pane(g, smoothPath(limbPts([u(.16), u(.5), u(.84)], [w * .6, w, w * .6])), col, seed + i, { ew: 4, shade: .12, lw: 3, amt: .4 });
  }
}

// pose (optional): draw this pose instead of the bridge timeline (the intro walk-on uses it); no spin then
function drawSinger(g, s, k, t, pose) {
  const gs = TRIO.beats[2] + k * .12; // the gap spin, one singer after the other
  const P = pose || trioPoseAt(k, t), spinU = pose ? 0 : ease(t, TRIO.spin[0], TRIO.spin[1]) + ease(t, gs, gs + .5), phi = spinU * TAU, cs = Math.cos(phi);
  const back = cs < 0, sx = Math.max(.12, Math.abs(cs));
  const shim = (t > 141.98 && t < 142.6) ? Math.sin(t * TAU * 8) * 7 * (1 - ease(t, 142.4, 142.6)) : 0;
  const bob = 5 * beatPulse(t) + 4 * hitPulse(t);
  // the lower foot stands on the stage; dip only adds a knee give on top of that
  const legH = Math.max(...[P.lL, P.lR].map(([a1, a2]) => FIG.th * Math.cos(a1) + FIG.sh * Math.cos(a2)));
  const pelvisY = TRIO_FLOOR_Y - legH * TRIO_SC + (Math.max(0, P.dip - 6) * .5 + bob) * TRIO_SC;
  g.save(); g.translate(s.x + P.x * TRIO_SC, pelvisY); g.scale(TRIO_SC * sx, TRIO_SC);

  // legs and shoes (trousers in the darker suit blue)
  for (const [hx, LP, side] of [[-FIG.hipX, P.lL, -1], [FIG.hipX, P.lR, 1]]) {
    const pts = legPts(hx, LP); limb(g, pts, 56, 44, SUIT2, s.seed + 10 + side, .25); limbStrip(g, pts, 9, SATIN, s.seed + 14 + side);
    const [ax, ay] = pts[2];
    pane(g, ellPath(ax + side * 16, ay + 8, 36, 15, 0), [24, 20, 22], s.seed + 20 + side, { ew: 8, shade: .2, lw: 5 });
    g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(ax + side * 22, ay + 3, 12, 4, 0, 0, TAU); g.fill();
  }
  // upper body, tilted about the pelvis
  g.rotate(P.lean); g.translate(shim, 0);
  // the trousers' seat, seen through the cutaway below the button
  pane(g, polyPath([[-54, -100], [54, -100], [58, 44], [-58, 44]]), SUIT2, s.seed + 29, { ew: 10, shade: .2, lw: 5 });
  const jacket = [[-74, 72], [-58, -40], [-54, -120], [-FIG.shX - 12, FIG.shY + 20], [-FIG.shX + 6, FIG.shY - 8], [FIG.shX - 6, FIG.shY - 8], [FIG.shX + 12, FIG.shY + 20], [54, -120], [58, -40], [74, 72], [24, 64], [4, -84], [-4, -84], [-24, 64]];
  pane(g, polyPath(jacket), SUIT, s.seed + 30, { ew: 30, shade: .34, lw: 8, amt: .5 });
  // the sheen: a lighter piece down each front, catching more light as he leans into it
  const shn = (sd) => mix(SUIT, SHEEN, clamp(.55 + 1.6 * P.lean * sd + .12 * Math.sin(t * 1.3 + s.seed)));
  for (const sd of [-1, 1]) {
    pane(g, smoothPath([[sd * 50, FIG.shY + 52], [sd * 58, -140], [sd * 60, -40], [sd * 64, 56], [sd * 50, 60], [sd * 44, -44], [sd * 40, -150]]), shn(sd), s.seed + 35 + sd, { ew: 8, shade: .16, lw: 5, amt: .4 });
  }
  if (!back) {
    pane(g, polyPath([[-30, FIG.shY - 6], [30, FIG.shY - 6], [0, -102]]), SHIRT, s.seed + 31, { ew: 10, shade: .15, lw: 5 });
    for (const sd of [-1, 1]) { // satin peaked lapels, collar to the button, each with a strip of sheen
      pane(g, polyPath([[sd * 30, FIG.shY - 6], [sd * 60, FIG.shY + 2], [sd * 78, FIG.shY + 38], [sd * 58, FIG.shY + 52], [sd * 52, -190], [sd * 8, -94], [0, -102]]), LAPEL, s.seed + 32.5 + sd, { ew: 8, shade: .16, lw: 5, amt: .25 });
      pane(g, smoothPath(limbPts([[sd * 62, FIG.shY + 26], [sd * 46, -186], [sd * 16, -110]], [8, 10, 5])), LAPEL2, s.seed + 38 + sd, { ew: 3, shade: .1, lw: 3, amt: .25 });
    }
    // one button, black welts on the breast pocket and the hip pockets
    pane(g, circPath(0, -88, 8), LAPEL, s.seed + 39, { ew: 3, shade: .1, lw: 3 });
    g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.arc(-2.5, -91, 2.5, 0, TAU); g.fill();
    g.strokeStyle = rgb(LAPEL); g.lineCap = 'round'; g.lineWidth = 5;
    g.beginPath(); g.moveTo(38, -148); g.lineTo(60, -152); for (const sd of [-1, 1]) { g.moveTo(sd * 26, -10); g.lineTo(sd * 54, -12); } g.stroke();
    // the bow tie: black, with a satin knot
    pane(g, polyPath([[-38, FIG.shY - 2], [0, FIG.shY + 12], [38, FIG.shY - 2], [38, FIG.shY + 30], [0, FIG.shY + 15], [-38, FIG.shY + 30]]), TIE, s.seed + 34, { ew: 6, shade: .2, lw: 4, amt: .25 });
    pane(g, polyPath([[-8, FIG.shY + 5], [8, FIG.shY + 5], [8, FIG.shY + 22], [-8, FIG.shY + 22]]), mix(TIE, LAPEL2, .45), s.seed + 37, { ew: 3, shade: .2, lw: 3 });
  } else {
    pane(g, polyPath([[-24, FIG.shY - 10], [24, FIG.shY - 10], [28, FIG.shY + 8], [-28, FIG.shY + 8]]), LAPEL, s.seed + 31, { ew: 4, shade: .2, lw: 4 }); // the collar
    paint(g, 3, .5); g.beginPath(); g.moveTo(0, FIG.shY + 10); g.lineTo(0, 66); g.stroke(); // back seam
  }
  // arms (sleeves, then hands); seen from the back the arms swap sides
  const arms = [[-FIG.shX, back ? P.R.map((a) => -a) : P.L, -1], [FIG.shX, back ? P.L.map((a) => -a) : P.R, 1]];
  for (const [ax, AP, side] of arms) {
    const pts = armPts(ax, FIG.shY + 12, AP); limb(g, pts, 50, 38, SUIT, s.seed + 40 + side, .5); limbStrip(g, pts, 9, mix(SUIT, SHEEN, .5), s.seed + 48 + side);
    { const [cx, cy] = pts[2]; pane(g, circPath(cx, cy, 15), SHIRT, s.seed + 46 + side, { ew: 6, shade: .15, lw: 4 }); } // shirt cuff
    const [hx, hy] = pts[2], hand = smoothPath(blobPts(hx + Math.sin(AP[1]) * 14, hy + Math.cos(AP[1]) * 14, 17, 20, s.seed + side));
    if (P.palm > .05) { // draft 10: an open palm, fingers fanned out along the forearm (the photo's reaching hands)
      const a = AP[1], pw = P.palm, cx = hx + Math.sin(a) * 18, cy = hy + Math.cos(a) * 18;
      for (let f = 0; f < 4; f++) {
        const fa = a + (f - 1.5) * .3 * pw - .1 * side, fl = (f === 0 || f === 3 ? 20 : 25) * (.6 + .4 * pw);
        pane(g, smoothPath(limbPts([[cx + Math.sin(fa) * 8, cy + Math.cos(fa) * 8], [cx + Math.sin(fa) * (8 + fl), cy + Math.cos(fa) * (8 + fl)]], [9, 7])), s.skin, s.seed + 90 + f + side, { ew: 4, shade: .2, lw: 3.5 });
      }
      const ta = a - side * 1.1; // the thumb
      pane(g, smoothPath(limbPts([[cx, cy], [cx + Math.sin(ta) * 20, cy + Math.cos(ta) * 20]], [10, 8])), s.skin, s.seed + 95 + side, { ew: 4, shade: .2, lw: 3.5 });
      pane(g, ellPath(cx, cy, 18, 16, -a), s.skin, s.seed + 44 + side, { ew: 8, shade: .22, lw: 4.5 });
    } else pane(g, hand, s.skin, s.seed + 44 + side, { ew: 10, shade: .25, lw: 5 });
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
  drawSingerHead(g, s, t, back, P.mouth);
  g.restore();
  g.restore();
}
function blobPts(cx, cy, rx, ry, seed, n = 9) { return [...Array(n)].map((_, i) => { const a = i / n * TAU, w = 1 + .1 * n1(seed, i); return [cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w]; }); }

function drawSingerHead(g, s, t, back, mo) { // mo: mouth 0..1 to use instead of the bridge's backing hits
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
  const m = mo !== undefined ? mo : trioMouthAt(t);
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

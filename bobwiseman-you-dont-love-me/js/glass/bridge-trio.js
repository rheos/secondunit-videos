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

// Draft 10 (Bob, 2026-10-16: "their differences are part of the fun"; the singer on the left of his photo had "big
// buddy Holly glasses"): five singers, each her own woman in the same dress. sz = height (the whole figure, standing on
// the same floor), bw = build (body width), face/fw/fh = head size and shape, style = hair, specs = big black
// horn-rims, grin = mouth width, ring = earrings ('hoop' | 'pearl'). The first three are the bridge trio (x = their
// marks on its stage); the middle one (1) is the petal plucker and keeps draft 9's size exactly.
// Draft 11 (Bob, 2026-10-17, on draft 10: "I unfortunately realize now they should be female. dresses. big hair."):
// the same five, recast as women. Heights, builds, skin tones, face shapes and every move are as draft 10; the
// mustaches are gone and each has her own big 1960s hair: Specs a bouffant flip, the lead a tall beehive, the big one
// a round bubble bouffant, the tallest a big natural, the kid a flip with a ruby headband and bow.
const SINGERS = [
  { x: 470, skin: [116, 70, 44], hair: [26, 18, 14], style: 'flip', specs: true, ring: 'pearl', face: .98, fw: .9, fh: 1.08, sz: 1.05, bw: .9, seed: 9100 },  // Specs
  { x: 960, skin: [92, 54, 34], hair: [20, 14, 12], style: 'hive', ring: 'hoop', face: 1.06, sz: 1, bw: 1, seed: 9200 },                // the lead
  { x: 1450, skin: [138, 88, 56], hair: [30, 20, 14], style: 'bubble', ring: 'pearl', face: 1.04, fw: 1.18, fh: .94, sz: .92, bw: 1.34, seed: 9300 }, // the big one
  { x: 1450, skin: [74, 44, 30], hair: [18, 12, 10], style: 'afro', ring: 'hoop', face: 1, fw: .92, fh: 1.06, sz: 1.12, bw: .86, seed: 9400 },      // the tallest
  { x: 470, skin: [150, 100, 66], hair: [34, 22, 16], style: 'band', ring: 'pearl', face: .97, fw: 1.06, fh: .94, sz: .89, bw: .96, grin: 1.3, seed: 9500 },    // the kid
];
// Left to right in a line of five (the intro and the finale): Specs first, as in Bob's photo, the lead in the middle.
const PIP_LINE = [0, 4, 1, 3, 2];
const mirrorPose = (P) => ({ ...P, L: P.R.map((a) => -a), R: P.L.map((a) => -a), lL: P.lR.map((a) => -a), lR: P.lL.map((a) => -a), x: -P.x, lean: -P.lean, tilt: -P.tilt });
// a figure's size: height and build (1 for anyone not given them)
const pipSz = (S) => S.sz ?? 1, pipBw = (S) => S.bw ?? 1;
// Draft 11: matching 1960s girl-group cocktail dresses in silver sequinned glass (the colour of draft 10's sharkskin),
// a sleeveless fitted bodice with a scoop neck, a black satin sash, a knee-length A-line skirt with a beaded
// hem that follows the knees (so every kick still reads), a lighter piece for the sheen, slow sequin twinkles, a string of
// pearls, bare arms with a silver bangle, sheer stockings and black pumps.
const DRESS = [178, 182, 196], SHEEN = [218, 222, 234], SASH = [30, 28, 36], SASH2 = [92, 90, 106], SHOE = [22, 20, 26], PEARL = [240, 236, 226];
const TRIO_FLOOR_Y = 1018, TRIO_SC = .92;
const TRIO_THREE = SINGERS.slice(0, 3); // the bridge stage is built for three: Specs, the lead and the big one

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
  const sz = pipSz(s), bw = pipBw(s);
  const pelvisY = TRIO_FLOOR_Y - legH * TRIO_SC * sz + (Math.max(0, P.dip - 6) * .5 + bob) * TRIO_SC;
  g.save(); g.translate(s.x + P.x * TRIO_SC, pelvisY); g.scale(TRIO_SC * sz * sx, TRIO_SC * sz);
  const stock = mix(s.skin, [36, 28, 30], .18); // sheer stockings

  // legs in stockings, and black pumps with a little heel
  const legs = [[-FIG.hipX * bw, P.lL, -1], [FIG.hipX * bw, P.lR, 1]];
  for (const [hx, LP, side] of legs) {
    const pts = legPts(hx, LP); limb(g, pts, 40 * bw, 28 * (.6 + .4 * bw), stock, s.seed + 10 + side, .3);
    const [ax, ay] = pts[2], fd = side; // the toe points out to her side, as draft 10's shoes did
    pane(g, smoothPath([[ax - fd * 14, ay - 4], [ax + fd * 10, ay - 2], [ax + fd * 34, ay + 10], [ax + fd * 36, ay + 18], [ax - fd * 4, ay + 18], [ax - fd * 16, ay + 10]]), SHOE, s.seed + 20 + side, { ew: 6, shade: .2, lw: 4.5 });
    pane(g, polyPath([[ax - fd * 18, ay + 10], [ax - fd * 8, ay + 12], [ax - fd * 10, ay + 22], [ax - fd * 16, ay + 22]]), SHOE, s.seed + 23 + side, { ew: 3, shade: .1, lw: 3 });
    g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(ax + fd * 18, ay + 6, 9, 3, fd * .35, 0, TAU); g.fill();
  }
  // the skirt: knee length, flaring from the hips; each side of the hem rides on its knee, so a kick lifts it
  {
    const hem = (hx, LP, sd) => {
      const kx = hx + Math.sin(LP[0]) * FIG.th * .9, ky = Math.cos(LP[0]) * FIG.th * .9;
      return [sd < 0 ? Math.min(kx - 42, -50 * bw) : Math.max(kx + 42, 50 * bw), Math.max(104, ky + 10)];
    };
    const HL = hem(-FIG.hipX * bw, P.lL, -1), HR = hem(FIG.hipX * bw, P.lR, 1), wl = [-58 * bw, -76], wr = [58 * bw, -76];
    const cy = Math.max(HL[1], HR[1]) + 14, pts = [wl, [lerp(wl[0], HL[0], .55) - 8, lerp(wl[1], HL[1], .55)], HL];
    for (let q = 1; q < 8; q++) { const u = q / 8, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u; pts.push([a * HL[0] + b * (HL[0] + HR[0]) / 2 + c * HR[0], a * HL[1] + b * cy + c * HR[1]]); }
    pts.push(HR, [lerp(wr[0], HR[0], .55) + 8, lerp(wr[1], HR[1], .55)], wr);
    pane(g, polyPath(pts), DRESS, s.seed + 26, { ew: 30, shade: .34, lw: 8, amt: .5 });
    for (let q = 2; q <= 9; q++) { // a beaded trim along the hem (HL to HR)
      const [x0, y0] = pts[q], [x1, y1] = pts[q + 1];
      for (let r = 0; r < 3; r++) { const u = r / 3; pane(g, circPath(lerp(x0, x1, u), lerp(y0, y1, u) - 7, 5.5), PEARL, s.seed + 150 + q * 3 + r, { ew: 2, shade: .2, lw: 2.5 }); }
    }
    if (!back) for (const sd of [-1, 1]) { // the sheen down the skirt, catching more light as she leans
      const top = [sd * 26 * bw, -60], bot = [lerp(sd * 30 * bw, sd > 0 ? HR[0] : HL[0], .45), lerp(-60, sd > 0 ? HR[1] : HL[1], .9)];
      pane(g, smoothPath(limbPts([top, [(top[0] + bot[0]) / 2, (top[1] + bot[1]) / 2], bot], [8, 14, 10])), mix(DRESS, SHEEN, clamp(.5 + 1.6 * P.lean * sd)), s.seed + 27 + sd, { ew: 4, shade: .12, lw: 3, amt: .4 });
    }
    // sequins: slow twinkles (no flashes on the beat)
    for (let q = 0; q < 14; q++) {
      const u = rnd(s.seed, q + 70), v = rnd(s.seed, q + 90), y = lerp(-50, 96, v), x = lerp(-50, 50, u) * bw * (1 + .3 * v);
      const gl = Math.max(0, Math.sin(t * (1.6 + rnd(q, 6) * 2) + q * 2.3)) ** 8 * .7; if (gl < .08) continue;
      g.fillStyle = `rgba(255,252,236,${gl})`; g.beginPath(); g.arc(x, y, 2 + 2.5 * gl, 0, TAU); g.fill();
    }
  }
  // upper body, tilted about the pelvis
  g.rotate(P.lean); g.translate(shim, 0);
  g.save(); g.scale(bw, 1); // the torso takes her build
  // shoulders and chest above the neckline
  pane(g, polyPath([[-FIG.shX - 8, FIG.shY + 22], [-FIG.shX + 6, FIG.shY - 6], [-22, FIG.shY - 10], [22, FIG.shY - 10], [FIG.shX - 6, FIG.shY - 6], [FIG.shX + 8, FIG.shY + 22], [FIG.shX - 2, FIG.shY + 62], [-FIG.shX + 2, FIG.shY + 62]]), s.skin, s.seed + 28, { ew: 10, shade: .28, lw: 5 });
  // the bodice: sleeveless, fitted to the waist, a scoop neck in front, straight across the back
  const bod = back
    ? [[-FIG.shX - 4, FIG.shY + 20], [-FIG.shX + 10, FIG.shY - 4], [FIG.shX - 10, FIG.shY - 4], [FIG.shX + 4, FIG.shY + 20], [62, -150], [54, -110], [60, -52], [-60, -52], [-54, -110], [-62, -150]]
    : [[-FIG.shX - 4, FIG.shY + 20], [-FIG.shX + 10, FIG.shY - 4], [-34, FIG.shY + 4], [-16, FIG.shY + 22], [0, FIG.shY + 28], [16, FIG.shY + 22], [34, FIG.shY + 4], [FIG.shX - 10, FIG.shY - 4], [FIG.shX + 4, FIG.shY + 20], [62, -150], [54, -110], [60, -52], [-60, -52], [-54, -110], [-62, -150]];
  pane(g, polyPath(bod), DRESS, s.seed + 30, { ew: 26, shade: .34, lw: 8, amt: .5 });
  for (const sd of [-1, 1]) {
    if (!back) pane(g, smoothPath([[sd * 46, FIG.shY + 60], [sd * 52, -170], [sd * 50, -96], [sd * 40, -96], [sd * 38, -168]]), mix(DRESS, SHEEN, clamp(.55 + 1.6 * P.lean * sd)), s.seed + 35 + sd, { ew: 6, shade: .14, lw: 4, amt: .4 });
  }
  // the black satin sash at the waist, with its sheen
  pane(g, polyPath([[-58, -130], [58, -130], [58, -104], [-58, -104]]), SASH, s.seed + 38, { ew: 6, shade: .16, lw: 5, amt: .25 });
  pane(g, polyPath([[-50, -124], [50, -124], [50, -118], [-50, -118]]), SASH2, s.seed + 39, { ew: 2, shade: .08, lw: 2.5, amt: .25 });
  if (back) { paint(g, 3, .5); g.beginPath(); g.moveTo(0, FIG.shY + 44); g.lineTo(0, -132); g.stroke(); } // the zip
  for (let q = 0; q < 10; q++) { // sequin twinkles on the bodice
    const x = lerp(-50, 50, rnd(s.seed, q + 110)), y = lerp(FIG.shY + 70, -60, rnd(s.seed, q + 130));
    const gl = Math.max(0, Math.sin(t * (1.6 + rnd(q, 8) * 2) + q * 1.7)) ** 8 * .7; if (gl < .08) continue;
    g.fillStyle = `rgba(255,252,236,${gl})`; g.beginPath(); g.arc(x, y, 2 + 2.5 * gl, 0, TAU); g.fill();
  }
  if (!back) for (let q = 0; q < 9; q++) { // a string of pearls
    const u = (q - 4) / 4, x = u * 24, y = FIG.shY + 2 + 13 * (1 - u * u);
    pane(g, circPath(x, y, 6), PEARL, s.seed + 140 + q, { ew: 3, shade: .2, lw: 2.5 });
  }
  g.restore();
  // arms, bare, with a silver bangle; seen from the back the arms swap sides
  const arms = [[-FIG.shX * bw, back ? P.R.map((a) => -a) : P.L, -1], [FIG.shX * bw, back ? P.L.map((a) => -a) : P.R, 1]];
  for (const [ax, AP, side] of arms) {
    const pts = armPts(ax, FIG.shY + 12, AP); limb(g, pts, 36 * (.5 + .5 * bw), 26 * (.5 + .5 * bw), s.skin, s.seed + 40 + side, .4);
    { const [cx, cy] = pts[2], [ex, ey] = pts[1], u = .82; pane(g, ellPath(lerp(ex, cx, u), lerp(ey, cy, u), 15, 6, Math.atan2(cy - ey, cx - ex) + Math.PI / 2), SHEEN, s.seed + 46 + side, { ew: 3, shade: .2, lw: 3 }); }
    const [hx, hy] = pts[2], hand = smoothPath(blobPts(hx + Math.sin(AP[1]) * 12, hy + Math.cos(AP[1]) * 12, 14, 18, s.seed + side));
    if (P.palm > .05) { // draft 10: an open palm, fingers fanned out along the forearm (the photo's reaching hands)
      const a = AP[1], pw = P.palm, cx = hx + Math.sin(a) * 16, cy = hy + Math.cos(a) * 16;
      for (let f = 0; f < 4; f++) {
        const fa = a + (f - 1.5) * .3 * pw - .1 * side, fl = (f === 0 || f === 3 ? 18 : 23) * (.6 + .4 * pw);
        pane(g, smoothPath(limbPts([[cx + Math.sin(fa) * 7, cy + Math.cos(fa) * 7], [cx + Math.sin(fa) * (7 + fl), cy + Math.cos(fa) * (7 + fl)]], [8, 6])), s.skin, s.seed + 90 + f + side, { ew: 4, shade: .2, lw: 3.5 });
      }
      const ta = a - side * 1.1; // the thumb
      pane(g, smoothPath(limbPts([[cx, cy], [cx + Math.sin(ta) * 18, cy + Math.cos(ta) * 18]], [9, 7])), s.skin, s.seed + 95 + side, { ew: 4, shade: .2, lw: 3.5 });
      pane(g, ellPath(cx, cy, 16, 14, -a), s.skin, s.seed + 44 + side, { ew: 8, shade: .22, lw: 4.5 });
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
  const hy = FIG.shY - FIG.neck - FIG.headR * s.face * (s.fh ?? 1) + 6;
  const nw = .55 + .3 * bw;
  pane(g, polyPath([[-15 * nw, FIG.shY + 2], [-13 * nw, FIG.shY - FIG.neck - 6], [13 * nw, FIG.shY - FIG.neck - 6], [15 * nw, FIG.shY + 2]]), s.skin, s.seed + 50, { ew: 8, shade: .3, lw: 5 });
  g.save(); g.translate(0, hy); g.rotate(P.tilt + (back ? 0 : .04 * hitPulse(t)));
  drawSingerHead(g, s, t, back, P.mouth);
  g.restore();
  g.restore();
}
function blobPts(cx, cy, rx, ry, seed, n = 9) { return [...Array(n)].map((_, i) => { const a = i / n * TAU, w = 1 + .1 * n1(seed, i); return [cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w]; }); }

// Draft 11: big 1960s hair. Each style is a back mass (behind the face) and a front piece (the crown over the
// forehead, down the sides), in head units (x by rx, y by ry, 0 at the head centre, y down).
const PIP_HAIR = {
  flip: { big: [1.22, 1.6], // a bouffant crown, flipped out at the jaw
    back: [[-1.62, .8], [-1.3, .64], [-1.16, .2], [-1.3, -.5], [-1.02, -1.25], [0, -1.6], [1.02, -1.25], [1.3, -.5], [1.16, .2], [1.3, .64], [1.62, .8], [1.42, .98], [1.0, .82], [0, .72], [-1.0, .82], [-1.42, .98]],
    front: [[-1.12, .34], [-1.1, -.75], [-.62, -1.42], [0, -1.56], [.62, -1.42], [1.1, -.75], [1.12, .34], [.96, .1], [.9, -.48], [.3, -.62], [-.42, -.56], [-.9, -.48], [-.96, .1]],
  },
  hive: { big: [1.08, 1.12], // a tall beehive
    back: [[-1.12, .32], [-1.22, -.4], [-1.08, -1.1], [-.9, -1.9], [-.48, -2.46], [0, -2.62], [.48, -2.46], [.9, -1.9], [1.08, -1.1], [1.22, -.4], [1.12, .32], [.7, .5], [0, .44], [-.7, .5]],
    front: [[-1.12, -.1], [-1.14, -.82], [-.92, -1.56], [-.48, -2.3], [0, -2.5], [.48, -2.3], [.92, -1.56], [1.14, -.82], [1.12, -.1], [.88, -.46], [.24, -.66], [-.5, -.56], [-.9, -.44]],
  },
  bubble: { big: [1.2, 1.45], // a round bubble bouffant
    back: [...Array(18)].map((_, i) => { const a = i / 18 * TAU; return [Math.cos(a) * 1.62, -.48 + Math.sin(a) * 1.42]; }),
    front: [[-1.3, .2], [-1.4, -.8], [-.94, -1.62], [0, -1.88], [.94, -1.62], [1.4, -.8], [1.3, .2], [1.0, -.1], [.9, -.5], [.3, -.68], [-.4, -.6], [-.9, -.46], [-1.0, -.1]],
  },
  afro: { big: [1.12, 1.25], // a big rounded natural
    back: [...Array(20)].map((_, i) => { const a = i / 20 * TAU; return [Math.cos(a) * 1.86, -.58 + Math.sin(a) * 1.58]; }),
    front: [[-1.42, .26], [-1.66, -.62], [-1.26, -1.66], [0, -2.12], [1.26, -1.66], [1.66, -.62], [1.42, .26], [1.04, -.16], [.86, -.54], [0, -.66], [-.86, -.54], [-1.04, -.16]],
  },
  band: { big: [1.2, 1.55], // a flip, smaller, with a headband
    back: [[-1.46, .58], [-1.2, .5], [-1.1, .14], [-1.22, -.5], [-.96, -1.18], [0, -1.46], [.96, -1.18], [1.22, -.5], [1.1, .14], [1.2, .5], [1.46, .58], [1.3, .74], [.92, .62], [0, .56], [-.92, .62], [-1.3, .74]],
    front: [[-1.08, .22], [-1.06, -.72], [-.6, -1.32], [0, -1.44], [.6, -1.32], [1.06, -.72], [1.08, .22], [.94, .02], [.88, -.46], [.3, -.6], [-.42, -.54], [-.88, -.46], [-.94, .02]],
  },
};
function drawSingerHead(g, s, t, back, mo) { // mo: mouth 0..1 to use instead of the bridge's backing hits
  const R = FIG.headR, f = s.face, rx = R * .86 * f * (s.fw ?? 1), ry = R * 1.06 * f * (s.fh ?? 1);
  const face = ellPath(0, 0, rx, ry, 0), Hs = PIP_HAIR[s.style] || PIP_HAIR.flip, [hsx, hsy] = Hs.big || [1, 1];
  // big: the hair's width, and the height of the crown above the hairline (the face and jaw lines stay put)
  const hu = ([x, y]) => [x * hsx, y < -.7 ? -.7 + (y + .7) * hsy : y];
  const hp = (pts) => smoothPath(pts.map((q) => { const [x, y] = hu(q); return [x * rx, y * ry]; }));
  pane(g, hp(Hs.back), s.hair, s.seed + 60, { ew: 24, shade: .32, lw: 7 });
  if (back) { pane(g, hp(Hs.front), s.hair, s.seed + 64, { ew: 16, shade: .26, lw: 6 }); return; }
  pane(g, face, s.skin, s.seed + 61, { ew: 26, shade: .3, lw: 7 });
  // cheeks: a little rouge
  for (const sd of [-1, 1]) { const rg = g.createRadialGradient(sd * rx * .5, ry * .2, 0, sd * rx * .5, ry * .2, rx * .3); rg.addColorStop(0, 'rgba(210,70,90,.28)'); rg.addColorStop(1, 'rgba(210,70,90,0)'); g.fillStyle = rg; g.fillRect(sd * rx * .5 - rx * .3, ry * .2 - rx * .3, rx * .6, rx * .6); }
  pane(g, hp(Hs.front), s.hair, s.seed + 63, { ew: 14, shade: .22, lw: 6 });
  // the shine across the crown, lighter than the hair so it reads on the glass
  g.lineCap = 'round'; g.strokeStyle = 'rgba(190,176,190,.42)'; g.lineWidth = 5;
  const crown = Hs.front.reduce((m, p) => Math.min(m, hu(p)[1]), 0);
  g.beginPath(); g.moveTo(-rx * .7, ry * (crown * .62)); g.quadraticCurveTo(0, ry * (crown * .93), rx * .66, ry * (crown * .66)); g.stroke();
  if (s.style === 'hive') { paint(g, 3, .55); for (const k of [.5, .72]) { g.beginPath(); g.moveTo(-rx * .9, ry * crown * k); g.quadraticCurveTo(0, ry * crown * (k + .14), rx * .9, ry * crown * k); g.stroke(); } }
  if (s.style === 'afro') { // short curls
    g.fillStyle = 'rgba(120,104,100,.3)';
    for (let q = 0; q < 80; q++) { const a = TAU * rnd(s.seed, q), r = Math.sqrt(rnd(s.seed, q + 80)); const x = Math.cos(a) * rx * 1.75 * hsx * r, y = -ry * .58 + Math.sin(a) * ry * 1.5 * hsy * r; if (Math.hypot(x / rx, y / ry) < 1.02 && y > -ry * .6) continue; g.beginPath(); g.arc(x, y, 2.6, 0, TAU); g.fill(); }
  }
  if (s.style === 'band') { // the ruby headband, and its bow on her right
    const band = new Path2D(); band.moveTo(-rx * 1.12, -ry * .66); band.quadraticCurveTo(0, -ry * 1.72, rx * 1.12, -ry * .66);
    lead(g, band, 22); g.lineWidth = 14; g.strokeStyle = rgb(C.ruby); g.stroke(band);
    for (const sd of [-1, 1]) pane(g, polyPath([[-rx * .78, -ry * 1.14], [-rx * .78 + sd * rx * .34, -ry * 1.14 - rx * .2], [-rx * .78 + sd * rx * .34, -ry * 1.14 + rx * .2]]), C.ruby, s.seed + 66 + sd, { ew: 4, shade: .2, lw: 3.5 });
    pane(g, circPath(-rx * .78, -ry * 1.14, rx * .09), C.ruby2, s.seed + 68, { ew: 3, shade: .2, lw: 3 });
  }
  // grisaille: brows, eyes with lashes and liner, nose, mouth
  const m = mo !== undefined ? mo : trioMouthAt(t);
  paint(g, 3, .9);
  for (const sd of [-1, 1]) { // fine arched brows, lifting when she sings
    g.beginPath(); g.moveTo(sd * rx * .2, -ry * .3 - m * 4); g.quadraticCurveTo(sd * rx * .44, -ry * .48 - m * 6, sd * rx * .66, -ry * .32 - m * 3); g.stroke();
  }
  const shut = m > .55 ? .4 : 1; // eyes half-close on the big notes
  for (const sd of [-1, 1]) {
    const ex = sd * rx * .4, ey = -ry * .14;
    g.fillStyle = 'rgba(238,232,214,.95)'; g.beginPath(); g.ellipse(ex, ey, rx * .18, ry * .075 * shut, 0, 0, TAU); g.fill();
    g.fillStyle = 'rgba(30,18,10,.95)'; g.beginPath(); g.ellipse(ex, ey, rx * .07, ry * .068 * shut, 0, 0, TAU); g.fill();
    paint(g, 4, .95); g.beginPath(); g.ellipse(ex, ey, rx * .19, ry * .085 * shut, 0, Math.PI, TAU); g.stroke();
    g.beginPath(); g.moveTo(ex + sd * rx * .18, ey - ry * .01); g.lineTo(ex + sd * rx * .27, ey - ry * .08); g.stroke(); // the liner's flick
    paint(g, 2.5, .9); for (const u of [-.5, 0, .5]) { const lx0 = ex + u * rx * .15, ly0 = ey - ry * .085 * shut * Math.sqrt(1 - u * u); g.beginPath(); g.moveTo(lx0, ly0); g.lineTo(lx0 + sd * 3 + u * 4, ly0 - 7); g.stroke(); }
  }
  paint(g, 3, .7); g.beginPath(); g.moveTo(-rx * .04, -ry * .04); g.quadraticCurveTo(-rx * .08, ry * .18, -rx * .14, ry * .24); g.quadraticCurveTo(0, ry * .3, rx * .14, ry * .24); g.stroke();
  if (s.specs) { // big black horn-rims: smoky lenses, a heavy brow bar, arms back to the ears
    for (const sd of [-1, 1]) {
      const cx = sd * rx * .4, cy = -ry * .14, w = rx * .3, h = ry * .15, lens = new Path2D();
      lens.roundRect(cx - w, cy - h, 2 * w, 2 * h, [h * .5, h * .5, h * .9, h * .9]);
      g.fillStyle = 'rgba(200,222,236,.28)'; g.fill(lens);
      lead(g, lens, 9);
      g.lineWidth = 13; g.strokeStyle = LEAD; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx - w, cy - h + 2); g.lineTo(cx + w, cy - h + 2); g.stroke(); // the brow bar
      g.lineWidth = 6; g.beginPath(); g.moveTo(cx + sd * w, cy - h * .5); g.lineTo(sd * rx * .99, cy - h * .2); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(cx - w * .45, cy - h * .35, w * .16, h * .2, -.5, 0, TAU); g.fill(); // a glint on the glass
    }
    g.lineWidth = 7; g.strokeStyle = LEAD; g.beginPath(); g.moveTo(-rx * .1, -ry * .2); g.quadraticCurveTo(0, -ry * .25, rx * .1, -ry * .2); g.stroke();
  }
  // the mouth, in red lipstick
  const mw = rx * (.24 + .1 * m) * (s.grin ?? 1), mh = ry * (.035 + .2 * m), my = ry * (.52 + .06 * m);
  // closed, the lips are a small red bow with a dark line between them; singing, they part around a dark mouth
  pane(g, ellPath(0, my, mw + 3, Math.max(4.5, mh + 3)), [184, 26, 52], s.seed + 69, { ew: 3, shade: .2, lw: 3, amt: .25 });
  if (m > .14) {
    g.fillStyle = 'rgba(54,10,18,.95)'; g.beginPath(); g.ellipse(0, my, mw * .8, Math.max(1.5, mh * .8), 0, 0, TAU); g.fill();
    if (m > .3) { g.fillStyle = 'rgba(240,236,220,.9)'; g.fillRect(-mw * .5, my - mh * .8 + 1, mw, mh * .26); }
  } else { paint(g, 2.5, .85); g.beginPath(); g.moveTo(-mw - 2, my); g.quadraticCurveTo(0, my + 2, mw + 2, my); g.stroke(); }
  // earrings, just below the hair
  for (const sd of [-1, 1]) {
    const ex = sd * rx * .99, ey = ry * .3;
    if (s.ring === 'hoop') { g.lineWidth = 9; g.strokeStyle = LEAD; g.beginPath(); g.arc(ex, ey + 14, 13, 0, TAU); g.stroke(); g.lineWidth = 5; g.strokeStyle = rgb(C.gold); g.stroke(); }
    else pane(g, circPath(ex, ey + 8, 8), PEARL, s.seed + 70 + sd, { ew: 3, shade: .2, lw: 3 });
  }
}

function drawMicStand(g, s, t) {
  // stand on the singer's left (screen right), a short boom, and a round ribbon mic just below his chin
  const z = pipSz(s), up = (y) => TRIO_FLOOR_Y - (TRIO_FLOOR_Y - y) * z; // set to his height
  const fx = s.x + 112, top = up(430), mx = s.x + 50 * z, my = up(384), J = 3 * hitPulse(t);
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
  for (const s of TRIO_THREE) {
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
  TRIO_THREE.forEach((s, k) => { drawSinger(g, s, k, t); drawMicStand(g, s, t); });
  // finish: glass texture, warm light through it, the spot flares, bloom, vignette, grain
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'overlay'; g.globalAlpha = .55; g.fillStyle = texPattern(g); g.fillRect(0, 0, W, H);
  g.globalAlpha = 1; g.globalCompositeOperation = 'multiply'; g.fillStyle = rgb([255, 252, 244]); g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'screen';
  for (const s of TRIO_THREE) {
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

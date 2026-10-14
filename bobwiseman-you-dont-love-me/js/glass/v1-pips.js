// INTRO cameo: the Pips (bridge-trio.js) open the song, small, on the nave floor.
// Bob (2026-10-12): "could the pips move through the start of the video, perhaps smaller once across the screen
// before the lyric commences." Bob (2026-10-14, draft 7): "I wish we saw the pips immediately off the top of the
// music instead of waiting for the entry. could you insert them off the top?"
// Draft 8: they drop in from above the frame one by one on the first three beats (the first is already falling on
// frame 0), into a warm follow spot in the dark nave, ta-da, a Temptations walk, a hat tip into the rippling spin,
// a hand roll, then strut left across the floor (behind the passing pillar) and leap out of the top of the frame on
// the bar at 8.46. The spot irises out behind them. Same singers, suits and moves as their bridge run.
// Beats: four per bar between the no_vocals stem's bar onsets (0.25, 3.04, 5.78, 8.46, 11.26).
const PIPS_BARS = [0.25, 3.04, 5.78, 8.46, 11.26];
const PIPS_BEATS = (() => { const b = []; for (let i = 0; i + 1 < PIPS_BARS.length; i++) for (let q = 0; q < 4; q++) b.push(lerp(PIPS_BARS[i], PIPS_BARS[i + 1], q / 4)); b.push(PIPS_BARS[PIPS_BARS.length - 1]); return b; })();
const PB = PIPS_BEATS; // 0.25 0.95 1.65 2.34 | 3.04 3.73 4.41 5.10 | 5.78 6.45 7.12 7.79 | 8.46 ...
const PIPS_IN = {
  land: [PB[0], PB[1], PB[2]],  // each singer lands on his own beat (left, middle, right)
  fall: .55, drop: 900,         // seconds in the air, and from how far above his mark (world units)
  tada: PB[3],                  // together: the staggered ta-da
  walk: PB[4],                  // the Temptations walk (step, touch, step, touch)
  tip: PB[6],                   // hat tip, then the spin ripples down the line
  roll: [PB[7], PB[8]],         // a hand roll for one beat
  strut: [PB[8], PB[12]],       // strut left across the floor, a knee lift on every beat
  leap: PB[12],                 // and up out of the top of the frame
  x0: 2560, x1: 1600,           // world x of the middle singer: standing, and where the strut ends
  gap: 230,                     // between singers (world)
  y: 3330,                      // world y of their feet on the nave floor
  s: .42,                       // their scale against the bridge stage
};
// the strut: a knee lifts on every beat, arms swing high and opposite, a lean into the step
const PIPS_STRUT = [
  { L: [-1.5, -2.1], R: [.55, 1.1], lL: [-.04, -.02], lR: [1.25, -.1], x: 0, lean: -.08, tilt: -.1, dip: 4 },
  { L: [-.55, -1.1], R: [1.5, 2.1], lL: [-1.25, .1], lR: [.04, .02], x: 0, lean: .08, tilt: .1, dip: 4 },
];
const PIPS_POSE = {
  fall: { ...POSE.vee, lL: [-.1, .25], lR: [.12, -.2], dip: 0 },                          // arms up, knees loose
  land: { L: [-1.25, -1.0], R: [1.25, 1.0], lL: [-.55, .35], lR: [.55, -.35], x: 0, lean: 0, tilt: .08, dip: 64 }, // the squash
  ready: { ...POSE.idle, dip: 8 },
  leapPrep: { L: [-.6, -.2], R: [.6, .2], lL: [-.45, .3], lR: [.45, -.3], x: 0, lean: 0, tilt: .1, dip: 50 },
  leap: { ...POSE.vee, lL: [-.05, -.02], lR: [.3, 1.2], dip: 0 },                          // one knee tucked
};
const PIPS_MOUTH = .08;
const withMouth = (P, m = PIPS_MOUTH) => ({ ...P, mouth: m });
// Timeline per singer: [arrive time, pose, transition length], as the bridge's trioKeys.
function pipsInKeys(k) {
  const I = PIPS_IN, L = I.land[k], F = FINAL[k], h = PB[5] - PB[4];
  return [
    [L - I.fall, withMouth(PIPS_POSE.fall), .01],
    [L, withMouth(PIPS_POSE.land), .06],
    [L + .32, withMouth(PIPS_POSE.ready), .2],
    [I.tada + .02, withMouth(F, .4), .26],                             // grin on the ta-da
    [I.walk, withMouth(POSE6.walkL), .16], [I.walk + h / 2, withMouth(POSE6.touchL), .12],
    [PB[5], withMouth(POSE6.walkR), .16], [PB[5] + h / 2, withMouth(POSE6.touchR), .12],
    [I.tip - .1, withMouth(POSE6.salute), .12], [I.tip, withMouth(POSE6.flick), .1],
    [I.roll[0], withMouth(POSE.roll), .12],
    [I.strut[0], withMouth(PIPS_STRUT[1]), .14],
    [I.leap - .22, withMouth(PIPS_POSE.leapPrep), .14],
    [I.leap + .04, withMouth(PIPS_POSE.leap, .3), .12],
  ];
}
const PIPS_KEYS = [0, 1, 2].map(pipsInKeys);
function pipsKeyed(k, t) {
  const K = PIPS_KEYS[k];
  let i = 0; while (i + 1 < K.length && K[i + 1][0] - K[i + 1][2] <= t) i++;
  if (i === 0) return K[0][1];
  const [ta, P, d] = K[i], u = easeOutBack(clamp((t - (ta - d)) / d), 1.2);
  return mixPose(K[i - 1][1], P, u);
}
function pipsBeat(t) { // index and fraction of the beat t falls in
  let n = 0; while (n + 2 < PB.length && PB[n + 1] <= t) n++;
  return { n, f: clamp((t - PB[n]) / (PB[n + 1] - PB[n])) };
}
function pipsInPose(k, t) {
  const I = PIPS_IN;
  let P = pipsKeyed(k, t);
  // the strut: on each beat the other knee comes up
  if (t > I.strut[0] && t < I.leap - .22) {
    const { n, f } = pipsBeat(t), A = withMouth(PIPS_STRUT[(n + 1) & 1]), Bp = withMouth(PIPS_STRUT[n & 1]);
    const w = ease(t, I.strut[0], I.strut[0] + .14) * (1 - ease(t, I.leap - .36, I.leap - .22));
    P = mixPose(P, mixPose(A, Bp, easeOutBack(clamp(f / .32), 1.2)), w);
  }
  // the hand roll: forearms circling each other in front of the belt, two turns a beat (as trioMoves)
  { const [a, b] = I.roll, w = ease(t, a - .05, a + .03) * (1 - ease(t, b - .05, b + .03));
    if (w > 0) {
      const ph = TAU * (t - a) / ((b - a) / 2), s1 = Math.sin(ph), c1 = Math.cos(ph);
      const L = [-.42 + .2 * s1, 1.5 + .5 * c1], R = [.42 + .2 * s1, -1.5 + .5 * c1];
      P = { ...P, L: P.L.map((v, i) => lerp(v, L[i], w)), R: P.R.map((v, i) => lerp(v, R[i], w)) };
    } }
  return P;
}
// where the singer is: world x of the middle singer, and how far above the floor (world units, + is up)
function pipsInX(t) { return lerp(PIPS_IN.x0, PIPS_IN.x1, ease(t, PIPS_IN.strut[0], PIPS_IN.leap - .1)); }
function pipsInLift(k, t) {
  const I = PIPS_IN, L = I.land[k];
  if (t < L) { const u = lin(t, L - I.fall, L); return I.drop * (1 - u * u); } // falling, faster as he goes
  const a = I.leap + k * .06;
  if (t > a) { const u = (t - a) / .5; return 1400 * u * u * u + 260 * u; } // up and out, pulled from above
  return 0;
}
function pipsInActive(t) { return t > PIPS_IN.land[0] - PIPS_IN.fall && t < PIPS_IN.leap + .9; }

// The follow spot: a warm pool on the floor under them with a faint beam from above. It is on from the first frame
// (the nave is still black), eases down as the dawn comes up, and irises out once they have gone up.
function pipsSpot(g, t, cam) {
  const A = ease(t, -.4, .1) * (1 - .35 * ease(t, 4, 8));
  const r = 560 * (1 - ease(t, PIPS_IN.leap + .2, PIPS_IN.leap + .85));
  if (A <= .001 || r < 4) return;
  const s = cam.s, sx = W / 2 + (pipsInX(t) - cam.x) * s, sy = H / 2 + (PIPS_IN.y - cam.y) * s;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'screen';
  // beam: from above the top of the frame, a little to the left, down to the pool
  const bx = sx - 140, bw = 90 * s, pw = r * s * .92;
  const lg = g.createLinearGradient(0, -20, 0, sy);
  lg.addColorStop(0, `rgba(255,236,196,${.03 * A})`); lg.addColorStop(1, `rgba(255,236,196,${.11 * A})`);
  g.fillStyle = lg; g.beginPath(); g.moveTo(bx - bw, -20); g.lineTo(bx + bw, -20); g.lineTo(sx + pw, sy); g.lineTo(sx - pw, sy); g.closePath(); g.fill();
  // pool
  g.translate(sx, sy); g.scale(1, .2);
  const rg = g.createRadialGradient(0, 0, 0, 0, 0, r * s);
  rg.addColorStop(0, `rgba(255,226,170,${.42 * A})`); rg.addColorStop(.6, `rgba(255,214,150,${.26 * A})`); rg.addColorStop(1, 'rgba(255,210,150,0)');
  g.fillStyle = rg; g.fillRect(-r * s, -r * s, 2 * r * s, 2 * r * s);
  g.restore();
}

function drawIntroPips(g, t, cam) {
  if (!pipsInActive(t)) return;
  pipsSpot(g, t, cam);
  const s = cam.s, xm = pipsInX(t);
  for (let k = 0; k < 3; k++) {
    const S = SINGERS[k], wx = xm + (k - 1) * PIPS_IN.gap, lift = pipsInLift(k, t);
    if (t < PIPS_IN.land[k] - PIPS_IN.fall) continue;
    g.save();
    g.setTransform(s, 0, 0, s, W / 2 - cam.x * s, H / 2 - cam.y * s);
    // map the bridge stage (singer at S.x, floor TRIO_FLOOR_Y) onto this spot on the nave floor
    g.translate(wx, PIPS_IN.y); g.scale(PIPS_IN.s, PIPS_IN.s); g.translate(-S.x, -TRIO_FLOOR_Y);
    // a soft contact shadow, smaller and fainter while he is in the air
    const near = clamp(1 - lift / 700);
    if (near > 0) {
      g.save(); g.translate(S.x, TRIO_FLOOR_Y + 10); g.scale(.6 + .4 * near, .18 * (.6 + .4 * near));
      const rg = g.createRadialGradient(0, 0, 0, 0, 0, 160); rg.addColorStop(0, `rgba(0,0,0,${.5 * near})`); rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg; g.fillRect(-160, -160, 320, 320); g.restore();
    }
    // landing: a little ring of gold sparks kicked up at his feet
    const dl = t - PIPS_IN.land[k];
    if (dl > 0 && dl < .45) {
      const u = dl / .45;
      g.save(); g.translate(S.x, TRIO_FLOOR_Y); g.strokeStyle = `rgba(255,224,140,${1 - u})`; g.lineWidth = 7; g.lineCap = 'round';
      for (let q = 0; q < 7; q++) {
        const a = Math.PI + (q + .5) / 7 * Math.PI, r0 = 90 + 160 * u, r1 = r0 + 50 * (1 - u);
        g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0 * .45); g.lineTo(Math.cos(a) * r1, Math.sin(a) * r1 * .45); g.stroke();
      }
      g.restore();
    }
    g.translate(0, -lift / PIPS_IN.s);
    // the spin after the hat tip ripples down the line (the trio draws its back when cos < 0)
    const sp0 = PIPS_IN.tip + k * .12, spU = ease(t, sp0, sp0 + .5), cs = Math.cos(spU * TAU);
    g.translate(S.x, 0); g.scale(Math.max(.12, Math.abs(cs)) * Math.sign(cs || 1), 1); g.translate(-S.x, 0);
    drawSinger(g, S, k, t, pipsInPose(k, t));
    g.restore();
  }
}

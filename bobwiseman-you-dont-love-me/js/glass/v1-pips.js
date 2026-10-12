// INTRO cameo: the Pips (bridge-trio.js) strut once across the nave floor before the first line, small, in step.
// Bob (2026-10-12): "could the pips move through the start of the video, perhaps smaller once across the screen
// before the lyric commences." They walk left to right in world space while the intro camera drifts left, so they
// cross the frame from about 5 s to 11 s; the foreground pillars (drawn after) pass in front of them.
// Every step lands on the beat: the 86 bpm grid, anchored on the no_vocals stem's onset at 9.20 s.
const PIPS_IN = {
  t0: 4.6, t1: 11.6,      // on the floor (off-frame at both ends)
  x0: 1050, x1: 2820,     // world x of the middle singer
  y: 3330,                // world y of their feet on the nave floor
  s: .42,                 // their scale against the bridge stage
  beat: 60 / 86, anchor: 9.20,
  spin: 8.52,             // one spin together, mid-crossing, on a beat
};
// the strut: a knee lifts on every beat, arms swing high and opposite, a lean into the step
const PIPS_STRUT = [
  { L: [-1.5, -2.1], R: [.55, 1.1], lL: [-.04, -.02], lR: [1.25, -.1], x: 0, lean: -.08, tilt: -.1, dip: 4 },
  { L: [-.55, -1.1], R: [1.5, 2.1], lL: [-1.25, .1], lR: [.04, .02], x: 0, lean: .08, tilt: .1, dip: 4 },
];
function pipsInBeat(t) { const u = (t - PIPS_IN.anchor) / PIPS_IN.beat; return { n: Math.floor(u), f: u - Math.floor(u) }; }
function pipsInPose(k, t) {
  const { n, f } = pipsInBeat(t), A = PIPS_STRUT[(n + 1) & 1], Bp = PIPS_STRUT[n & 1];
  const u = easeOutBack(clamp(f / .32), 1.2);
  const P = mixPose(A, Bp, u);
  // during the spin they open up wide
  const sp = ease(t, PIPS_IN.spin - .1, PIPS_IN.spin + .1) * (1 - ease(t, PIPS_IN.spin + .55, PIPS_IN.spin + .75));
  return mixPose(P, POSE.wide, sp);
}
function drawIntroPips(g, t, cam) {
  if (t < PIPS_IN.t0 || t > PIPS_IN.t1) return;
  const s = cam.s, u = (t - PIPS_IN.t0) / (PIPS_IN.t1 - PIPS_IN.t0);
  // glide on the beat: each step carries them forward, a little faster just after it lands
  const { f } = pipsInBeat(t), drift = .06 * Math.sin(f * TAU);
  const xm = lerp(PIPS_IN.x0, PIPS_IN.x1, u + drift / ((PIPS_IN.t1 - PIPS_IN.t0) / PIPS_IN.beat));
  for (let k = 0; k < 3; k++) {
    const S = SINGERS[k], wx = xm + (k - 1) * 230;
    g.save();
    g.setTransform(s, 0, 0, s, W / 2 - cam.x * s, H / 2 - cam.y * s);
    // map the bridge stage (singer at S.x, floor TRIO_FLOOR_Y) onto this spot on the nave floor
    g.translate(wx, PIPS_IN.y); g.scale(PIPS_IN.s, PIPS_IN.s); g.translate(-S.x, -TRIO_FLOOR_Y);
    // a soft contact shadow
    g.save(); g.translate(S.x, TRIO_FLOOR_Y + 10); g.scale(1, .18);
    const rg = g.createRadialGradient(0, 0, 0, 0, 0, 160); rg.addColorStop(0, 'rgba(0,0,0,.5)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg; g.fillRect(-160, -160, 320, 320); g.restore();
    // spin: squash the figure horizontally through one turn (the trio draws its back when cos < 0)
    const spU = ease(t, PIPS_IN.spin + k * .08, PIPS_IN.spin + .5 + k * .08), cs = Math.cos(spU * TAU);
    g.translate(S.x, 0); g.scale(Math.max(.12, Math.abs(cs)) * Math.sign(cs || 1), 1); g.translate(-S.x, 0);
    drawSinger(g, S, k, t, pipsInPose(k, t));
    g.restore();
  }
}

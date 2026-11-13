// What the hay door holds, and the laughter that comes out of it. Implication only (BRIEF.md hard limits):
// two grown-up heads and shoulders, shadows on the lamplit hay, side by side with a gap between them,
// both tipped back laughing. Nothing more is ever shown. They are cut from the set's darkest plum, so in the
// film they read as the lamp's shadow-play, not as the two people in their own colours.

// inside(x, y, w, h): the barn() callback; t = song time, k = 0..1 how much they laugh right now
function hayDoorLovers(t, k = 1) {
  return (x, y, w, h) => {
    const s = .165, base = y + h + 58;
    const ph = twos(t);
    // heads tipped well back (head > 0 lifts the face), shoulders bouncing with the laugh
    const lp = (o) => ({ head: .22 * k + .05 * Math.sin((ph + o) * 9), laugh: k, lean: -.04 * k, bob: Math.abs(Math.sin((ph + o) * 9)) * -10 * k, arms: [[.25, .5], [.1, .4]] });
    // the daughter on the left facing in, her lover on the right facing in, a clear gap between the two heads
    puppet(x + w * .3, base, s, 1, { ...CAST.you, col: P.setDark, headAcc: withHead(HAIR2.long, P.setDark) }, lp(0));
    puppet(x + w * .74, base + 4, s, -1, { ...CAST.me, col: P.setDark, headAcc: null }, lp(.37));
  };
}

// laughter made visible: the kit's gold laugh rings, but rising and drifting on the evening air as they
// widen (centre lifts by `rise` px and slides by `drift` px over the ring's life)
function driftRings(t, x, y, at, { n = 3, dir = -Math.PI / 2, spread = .7, reach = 300, life = 2.6, w0 = 10, rise = 140, drift = -60, scale = 1 } = {}) {
  for (let r = 0; r < n; r++) {
    const d = t - at - r * .18; if (d < 0 || d > life) continue;
    const k = d / life, e = eo(k);
    g.save(); g.translate(x + drift * e * scale, y - rise * e * scale); g.rotate(dir);
    g.globalAlpha *= (1 - k) * .95; g.strokeStyle = r % 2 ? P.goldPale : P.gold; g.lineWidth = lerp(w0, 2.5, k) * scale; g.lineCap = 'round';
    g.shadowColor = 'rgba(60,24,40,.25)'; g.shadowBlur = 6; g.shadowOffsetX = 2; g.shadowOffsetY = 3;
    g.beginPath(); g.arc(0, 0, (18 + e * reach) * scale, -spread, spread); g.stroke();
    g.restore();
  }
}

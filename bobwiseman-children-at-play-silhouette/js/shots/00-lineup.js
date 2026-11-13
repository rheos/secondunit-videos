// Rig check (not in the film): the cast as silhouette puppets, and the farm set. Load with lineup.html.
// Left: the mother (standing, and shading her eyes as she searches), the daughter and her lover, both grown adults.
// Right: the farmhouse and the barn with its high hay door, lit, holding the implied lovers and the laugh rings.
SHOT(0, 1000, 'lineup', (t) => {
  const BASE = 900;
  sheet(P.sky);
  cut(cutRect(-20, 560, W + 40, 600, 92), P.skyLow, { sh: .3, grain: .2 });
  cut(rect(0, BASE, W, H - BASE), P.yard, { sh: .7 });
  // a quiet divider between people and set
  cut(cutRect(958, 120, 6, BASE - 160, 7), P.hillMid, { sh: .2, alpha: .6 });

  const S = .56;
  puppet(150, BASE, S, 1, CAST.mother, {});
  puppet(380, BASE, S, -1, CAST.mother, MPOSE.shade());
  puppet(620, BASE, S, 1, CAST.you, { arms: [[.12, .2], [-.08, .2]] });
  puppet(845, BASE, S, 1, CAST.me, { arms: [[.1, .2], [-.06, .18]] });

  farmhouse(1000, BASE, .6, { door: 1 });
  barn(1350, BASE, .86, { inside: hayDoorLovers(t, 1) });
  // the shoes left at the foot of the ladder (hers marigold, his rust)
  shoePair(1350 + 462 * .86, BASE - 2, 1.15, P.you, 'flat');
  shoePair(1350 + 540 * .86, BASE - 2, .9, P.me, 'boot');
  // laughter from the hay door
  const hx = 1350 + (BARN.hay.x + BARN.hay.w / 2) * .86, hy = BASE + (BARN.hay.y + 40) * .86;
  for (const at of [t - .5, t - 1.6]) driftRings(t, hx, hy, at, { reach: 230, rise: 120, drift: -40 });

  // labels: small paper tags on the yard
  const tag = (x, txt, sub) => {
    g.save(); g.font = '600 26px Georgia, serif'; const w = Math.max(g.measureText(txt).width, sub ? (g.font = 'italic 20px Georgia, serif', g.measureText(sub).width) : 0) + 36;
    cut(cutRect(x - w / 2, BASE + 34, w, sub ? 84 : 52, x), P.skyPale, { sh: .5, grain: .15 });
    g.fillStyle = P.setDark; g.textAlign = 'center'; g.font = '600 26px Georgia, serif'; g.fillText(txt, x, BASE + 70);
    if (sub) { g.font = 'italic 20px Georgia, serif'; g.fillText(sub, x, BASE + 100); }
    g.restore();
  };
  tag(265, 'the mother', 'standing; searching');
  tag(620, 'the daughter', 'a grown woman');
  tag(845, 'her lover', 'a grown man');
  tag(1160, 'the farmhouse', 'porch, door opens');
  tag(1600, 'the barn', 'hay door, ladder, shoes');
});

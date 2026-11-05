// The Bay: below the sheet's head. The review slip on 08, the three option stickers on 29-31.
// Equal size, fixed places and a plain "or" are what stop three notes reading as steps done in order.
import { STICKER, alpha, dropY, hero, impact, paint, staticPanel, states, text } from "../parts.js";
import { rr } from "../kit/world.js";
import { T, io, r01 } from "../timeline.js";

const SLIP_X = 1.1, SLIP_Y = 1.85, OPT_X = 1.115, OPT_Y = [2.34, 1.18, 0.02], OR_Y = [1.76, 0.6];
let slip, stamp, ors = [];
const OPTS = [
  { lines: ["flip the default"], track: states([[0, "LIT"], [T.b30, "IDLE"]], STICKER) },
  { lines: ["tell the model", "use hybrid when ..."], track: states([[0, "IDLE"], [T.b30, "LIT"], [T.b31, "IDLE"]], STICKER) },
  { lines: ["keep fts", "write down why ..."], track: states([[0, "IDLE"], [T.b31, "LIT"]], STICKER) },
];

export function build(scene) {
  slip = hero(1.7, 1.16, 300, (g, W, H) => {
    g.fillStyle = "#e8e7e3"; rr(g, 1, 1, W - 2, H - 2, 6); g.fill();
    text(g, "+ mode (optional)", 26, 62, 36, { w: 700 });
    text(g, "+ default: fts", 26, 120, 36, { w: 700 });
    text(g, "callers unchanged", 26, 196, 33, { c: "#4b4f55" });
  });
  slip.set({});
  scene.add(slip.mesh);
  stamp = staticPanel(1.3, 0.36, 300, (g, W, H) => {
    g.strokeStyle = "#2e8a52"; g.lineWidth = 6; rr(g, 4, 4, W - 8, H - 8, 8); g.stroke();
    text(g, "APPROVED", W / 2, H / 2 + 24, 67, { c: "#2e8a52", w: 700, a: "center" });
  }, SLIP_X, 1.49, -0.36, scene);
  OPTS.forEach((o, i) => {
    o.p = staticPanel(1.63, 0.73, 300, (g, W, H) => {
      g.fillStyle = "#ffffff"; rr(g, 1, 1, W - 2, H - 2, 6); g.fill();
      o.lines.forEach((s, j) => text(g, s, 20, o.lines.length === 1 ? H / 2 + 14 : 88 + j * 56, 39, { c: "#14171b", w: 700 }));
    }, OPT_X, OPT_Y[i], -0.4, scene);
  });
  ors = OR_Y.map((y) => staticPanel(0.4, 0.3, 300, (g, W, H) => text(g, "or", W / 2, H / 2 + 22, 65, { c: "#e6edf3", w: 700, a: "center" }), OPT_X, y, -0.4, scene));
}

export function update(t) {
  // the slip slides in, takes one stamp, slides out
  const inK = io(r01(t, T.b08, 0.5)), outK = io(r01(t, T.should + 0.35, 0.33));
  const on = t < T.b29 - 1;
  const bump = t >= T.stamp ? 0.02 * (1 - r01(t, T.stamp, 0.14)) : 0;
  slip.mesh.visible = on;
  stamp.mesh.visible = on && t >= T.stamp;
  if (on) {
    const a = inK * (1 - outK), x = SLIP_X + (1 - inK) * 1.4 + outK * 1.4;
    slip.mesh.position.set(x, SLIP_Y - bump, -0.4);
    alpha(slip.mesh, a);
    stamp.mesh.position.x = x;
    stamp.mesh.scale.setScalar(impact(t, T.stamp, 1.12));
    alpha(stamp.mesh, t >= T.stamp ? a : 0);
  }
  // the options land together, the light moves down, nothing else changes
  const shown = t >= T.b29 - 0.18;
  const a = 1 - r01(t, T.b32, 0.25);
  OPTS.forEach((o, i) => {
    o.p.mesh.visible = shown && a > 0.002;
    if (!o.p.mesh.visible) return;
    o.p.mesh.position.y = dropY(t, T.b29, OPT_Y[i]);
    o.p.mesh.scale.setScalar(impact(t, T.b29));
    alpha(o.p.mesh, a);
    paint(o.p.mesh.material, o.track, t);
  });
  ors.forEach((p, i) => {
    p.mesh.visible = shown && a > 0.002;
    if (!p.mesh.visible) return;
    p.mesh.position.y = dropY(t, T.b29, OR_Y[i]);
    alpha(p.mesh, a);
  });
}

// The Counter: one plain count in a box, right of the crate, holds 13-15. Climbs 0 to 36 of 37, landing on "one".
// It never names the other call, and it is gone before day 53 or the right chute light (check-graybox.mjs proves it).
import { alpha, hero, solid, solidAlpha, text } from "../parts.js";
import { counterAlpha, counterN } from "../timeline.js";

const X = 1.735, Y = 3.3;
let back, face;

export function build(scene, { toon }) {
  back = solid(toon, 0.95, 0.62, 0.06, "#161b22", X, Y, -1.15, scene);
  face = hero(0.95, 0.62, 300, (g, W, H, s) => {
    g.strokeStyle = "#59616b"; g.lineWidth = 3; g.strokeRect(2, 2, W - 4, H - 4);
    text(g, "old search:", 20, 70, 37, { c: "#c9d1d9", w: 600 });
    text(g, `${s.n} of 37`, 20, 150, 52, { c: "#ffffff", w: 700 });
  });
  face.mesh.position.set(X, Y, -1.1);
  scene.add(face.mesh);
}

export function update(t) {
  const a = counterAlpha(t);
  solidAlpha(back, a);
  alpha(face.mesh, a);
  if (a > 0.002) face.set({ n: counterN(t) });
}

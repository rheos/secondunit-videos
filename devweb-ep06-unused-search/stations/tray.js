// The error tray: under the lamp, right side, hold 15 only. Empty on every frame.
import { alpha, hero, solid, solidAlpha, text } from "../parts.js";
import { T, io, r01 } from "../timeline.js";
import { rr } from "../kit/world.js";

const X = 1.75, Y = 2.55, Z = -1.1;
let face, back;

export function build(scene, { toon }) {
  back = solid(toon, 0.7, 0.42, 0.05, "#161b22", X, Y, Z - 0.04, scene);
  face = hero(0.7, 0.42, 300, (g, W, H) => {
    g.strokeStyle = "#59616b"; g.lineWidth = 3; rr(g, 2, 2, W - 4, H - 4, 8); g.stroke();
    text(g, "errors", 16, 38, 31, { c: "#e6edf3", w: 600 });
    g.setLineDash([9, 8]); rr(g, 16, 54, W - 32, H - 70, 4); g.stroke(); g.setLineDash([]);
  });
  face.set({});
  face.mesh.position.set(X, Y, Z);
  scene.add(face.mesh);
}

export function update(t) {
  const k = io(r01(t, T.h15, 0.4)) * (1 - io(r01(t, T.h16, 0.4)));
  const x = X + (1 - k) * 1.2;
  back.position.x = x; face.mesh.position.x = x;
  solidAlpha(back, k); alpha(face.mesh, k);
}

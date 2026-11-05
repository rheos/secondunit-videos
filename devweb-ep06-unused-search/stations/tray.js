// The error tray: sits between tally and sheet head, empty on every frame. In at "a call", out during the dim on "back".
import { alpha, hero, paint, solid, solidAlpha, text } from "../parts.js";
import { T, io, r01 } from "../timeline.js";
import { rr } from "../kit/world.js";

let face, back;
const X = 0.93, Y = 3.38, TINT = [[0, "#ffffff"], [T.b16, "#6b6f75"]];

export function build(scene, { toon }) {
  back = solid(toon, 1.2, 0.52, 0.05, "#161b22", X, Y, -0.74, scene);
  face = hero(1.2, 0.52, 300, (g, W, H) => {
    g.strokeStyle = "#59616b"; g.lineWidth = 3; rr(g, 2, 2, W - 4, H - 4, 8); g.stroke();
    text(g, "error log", 18, 40, 33, { c: "#e6edf3" });
    g.setLineDash([10, 9]); rr(g, 18, 56, W - 36, H - 74, 4); g.stroke(); g.setLineDash([]);
  });
  face.set({});
  face.mesh.position.set(X, Y, -0.7);
  scene.add(face.mesh);
}

export function update(t) {
  const k = io(r01(t, T.b14, 0.35)) * (1 - io(r01(t, T.b17, 0.6)));
  const x = X + (1 - k) * 1.7;
  back.position.x = x; face.mesh.position.x = x;
  solidAlpha(back, k); alpha(face.mesh, k);
  paint(face.mesh.material, TINT, t);
}

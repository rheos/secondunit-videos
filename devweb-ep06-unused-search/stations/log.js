// Your log, hold 26: a paper sheet in the right half of the frame. One row per call, each naming which search it used.
// These rows are examples for the viewer, not this film's data. They type in one at a time.
import { alpha, hero, text } from "../parts.js";
import { rr } from "../kit/world.js";
import { T, r01 } from "../timeline.js";

const ROWS = ["keywords (old)", "keywords (old)", "meaning (new)", "keywords (old)", "meaning (new)", "keywords (old)"];
const X = 1.2, Y = 3.1, Z = -0.8, ROW_T = 0.36;
let sheet;

export function build(scene) {
  sheet = hero(1.5, 2.3, 300, (g, W, H, s) => {
    g.fillStyle = "#efeeea"; rr(g, 2, 2, W - 4, H - 4, 6); g.fill();
    text(g, "your log", 28, 62, 44, { c: "#14171b", w: 700 });
    g.fillStyle = "#14171b"; g.fillRect(28, 82, W - 56, 3);
    ROWS.slice(0, s.n).forEach((r, i) => text(g, r, 28, 160 + i * 92, 38, { c: "#14171b", w: 600 }));
  });
  sheet.mesh.position.set(X, Y, Z);
  scene.add(sheet.mesh);
}

export function update(t) {
  const a = r01(t, T.h26 + 0.1, 0.3) * (1 - r01(t, T.h27, 0.3));
  alpha(sheet.mesh, a);
  sheet.mesh.position.y = Y + 0.006 * Math.sin(t * 1.1); // a held sheet doesn't freeze
  if (a > 0.002) sheet.set({ n: Math.max(0, Math.min(ROWS.length, Math.floor((t - (T.h26 + 0.35)) / ROW_T) + 1)) });
}

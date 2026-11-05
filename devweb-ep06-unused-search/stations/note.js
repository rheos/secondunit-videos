// The note: floats down to Blink on hold 18 and stays in front of it, a little above its head, until hold 20 ends.
// It sits on the left; the right chute is on the right. Nothing joins them. No quote marks on it.
import { alpha, hero, text } from "../parts.js";
import { rr } from "../kit/world.js";
import { T, io, mix, r01 } from "../timeline.js";

const X = -0.5, Y = 1.75, Z = 0.6;
let note;

export function build(scene) {
  note = hero(0.95, 0.36, 300, (g, W, H) => {
    g.fillStyle = "#efeeea"; rr(g, 2, 2, W - 4, H - 4, 6); g.fill();
    text(g, "when to search", W / 2, H / 2 + 11, 30, { c: "#14171b", w: 700, a: "center" });
  });
  note.set({});
  scene.add(note.mesh);
}

export function update(t) {
  const u = io(r01(t, T.h18 + 0.05, 0.8));
  const a = r01(t, T.h18, 0.15) * (1 - r01(t, T.h21, 0.4));
  alpha(note.mesh, a);
  // floats down with a slight sway, then a slow breath so the hold isn't frozen
  note.mesh.position.set(X + 0.08 * Math.sin(u * Math.PI * 2) * (1 - u), mix(3.6, Y, u) + 0.01 * Math.sin(t * 1.3), Z);
  note.mesh.rotation.z = 0.12 * Math.sin(u * Math.PI * 3) * (1 - u) + 0.01 * Math.sin(t * 0.9);
}

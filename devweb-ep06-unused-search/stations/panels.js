// The two option panels, holds 24-25: equal paper panels side by side in front of the crate, a plain "or" between.
// Left: a small dial drawing with the pointer on meaning (new) and the default tag with it. Right: a note for Blink.
import { alpha, staticPanel, text } from "../parts.js";
import { rr } from "../kit/world.js";
import { T, io, r01 } from "../timeline.js";

const Z = -0.9, Y = 3.3, L_X = -0.55, R_X = 0.95, OR_X = 0.2;
let left, right, or;

const paper = (g, W, H) => { g.fillStyle = "#efeeea"; rr(g, 2, 2, W - 4, H - 4, 8); g.fill(); };

export function build(scene) {
  left = staticPanel(1.3, 1.15, 300, (g, W, H) => {
    paper(g, W, H);
    const cx = W / 2, cy = 150, r = 95, aNew = (-30 * Math.PI) / 180, aOld = (-150 * Math.PI) / 180;
    g.strokeStyle = "#14171b"; g.lineWidth = 5; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
    [aOld, aNew].forEach((a) => { g.beginPath(); g.moveTo(cx + Math.cos(a) * (r - 10), cy - Math.sin(a) * (r - 10)); g.lineTo(cx + Math.cos(a) * (r + 10), cy - Math.sin(a) * (r + 10)); g.stroke(); });
    const tx = cx + Math.cos(aNew) * (r - 18), ty = cy - Math.sin(aNew) * (r - 18);
    g.lineWidth = 8; g.beginPath(); g.moveTo(cx, cy); g.lineTo(tx, ty); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx, ty + 22); g.stroke();
    g.strokeRect(tx - 48, ty + 22, 96, 30); text(g, "default", tx, ty + 44, 20, { c: "#14171b", w: 700, a: "center" });
    text(g, "keywords (old)", 22, 300, 24, { c: "#14171b", w: 600 });
    text(g, "meaning (new)", W - 22, 300, 24, { c: "#14171b", w: 600, a: "right" });
  }, L_X, Y, Z, scene);
  right = staticPanel(1.3, 1.15, 300, (g, W, H) => {
    paper(g, W, H);
    // a small Blink face: mint body, dark visor, two eyes
    g.fillStyle = "#6ad08a"; rr(g, W / 2 - 70, 34, 140, 120, 50); g.fill();
    g.fillStyle = "#0a1510"; rr(g, W / 2 - 52, 58, 104, 62, 24); g.fill();
    g.fillStyle = "#c8ffd9"; rr(g, W / 2 - 30, 70, 16, 34, 8); g.fill(); rr(g, W / 2 + 14, 70, 16, 34, 8); g.fill();
    text(g, "use the new search", W / 2, 230, 32, { c: "#14171b", w: 700, a: "center" });
    text(g, "when ...", W / 2, 278, 32, { c: "#14171b", w: 700, a: "center" });
  }, R_X, Y, Z, scene);
  or = staticPanel(0.4, 0.3, 300, (g, W, H) => text(g, "or", W / 2, H / 2 + 20, 60, { c: "#e6edf3", w: 700, a: "center" }), OR_X, Y, Z, scene);
}

export function update(t) {
  const clear = 1 - r01(t, T.h26, 0.3);
  const lk = io(r01(t, T.h24 + 0.1, 0.5)), rk = io(r01(t, T.h25 + 0.05, 0.5));
  left.mesh.rotation.y = -1.45 * (1 - lk); alpha(left.mesh, Math.min(1, lk * 3) * clear);
  right.mesh.rotation.y = 1.45 * (1 - rk); alpha(right.mesh, Math.min(1, rk * 3) * clear);
  alpha(or.mesh, r01(t, T.h25 + 0.3, 0.2) * clear);
}

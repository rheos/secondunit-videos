// The two option panels, holds 24-25: equal paper panels side by side in front of the crate, a clear gap between them
// with a plain "or" in it. A dark backing behind both dims the crate so its labels don't compete.
// Left: a small dial drawing with the pointer on meaning (new) and the default tag with it. Right: a note for Blink.
import * as THREE from "three";
import { alpha, basic, staticPanel, text } from "../parts.js";
import { rr } from "../kit/world.js";
import { T, io, r01 } from "../timeline.js";

// panels 1.2 wide, 0.6 apart: the "or" (0.4 wide) sits in the gap with 0.1 either side
export const PANEL_W = 1.2, PANEL_H = 1.25, L_X = -0.72, R_X = 1.08, OR_X = 0.18, Y = 3.3, Z = -0.9;
let left, right, or, backing;

const paper = (g, W, H) => { g.fillStyle = "#efeeea"; rr(g, 2, 2, W - 4, H - 4, 8); g.fill(); };

export function build(scene) {
  backing = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.75), basic("#0d1117", { opacity: 0 }));
  backing.position.set((L_X + R_X) / 2, Y, Z - 0.05);
  scene.add(backing);
  left = staticPanel(PANEL_W, PANEL_H, 300, (g, W, H) => {
    paper(g, W, H);
    const cx = W / 2, cy = 140, r = 88, aNew = (-30 * Math.PI) / 180, aOld = (-150 * Math.PI) / 180;
    g.strokeStyle = "#14171b"; g.lineWidth = 5; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
    [aOld, aNew].forEach((a) => { g.beginPath(); g.moveTo(cx + Math.cos(a) * (r - 10), cy - Math.sin(a) * (r - 10)); g.lineTo(cx + Math.cos(a) * (r + 10), cy - Math.sin(a) * (r + 10)); g.stroke(); });
    const tx = cx + Math.cos(aNew) * (r - 18), ty = cy - Math.sin(aNew) * (r - 18);
    g.lineWidth = 8; g.beginPath(); g.moveTo(cx, cy); g.lineTo(tx, ty); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx, ty + 20); g.stroke();
    g.strokeRect(tx - 46, ty + 20, 92, 28); text(g, "default", tx, ty + 40, 19, { c: "#14171b", w: 700, a: "center" });
    // one setting per line, each under its own side of the ring, so they can't run into each other
    text(g, "keywords (old)", 20, 300, 24, { c: "#14171b", w: 600 });
    text(g, "meaning (new)", W - 20, 345, 24, { c: "#14171b", w: 600, a: "right" });
  }, L_X, Y, Z, scene);
  right = staticPanel(PANEL_W, PANEL_H, 300, (g, W, H) => {
    paper(g, W, H);
    // a small Blink face: mint body, dark visor, two eyes
    g.fillStyle = "#6ad08a"; rr(g, W / 2 - 70, 40, 140, 120, 50); g.fill();
    g.fillStyle = "#0a1510"; rr(g, W / 2 - 52, 64, 104, 62, 24); g.fill();
    g.fillStyle = "#c8ffd9"; rr(g, W / 2 - 30, 76, 16, 34, 8); g.fill(); rr(g, W / 2 + 14, 76, 16, 34, 8); g.fill();
    text(g, "use the new search", W / 2, 250, 29, { c: "#14171b", w: 700, a: "center", maxX: W - 18 });
    text(g, "when ...", W / 2, 296, 29, { c: "#14171b", w: 700, a: "center" });
  }, R_X, Y, Z, scene);
  or = staticPanel(0.4, 0.3, 300, (g, W, H) => text(g, "or", W / 2, H / 2 + 20, 60, { c: "#ffffff", w: 700, a: "center" }), OR_X, Y, Z + 0.05, scene);
}

export function update(t) {
  const clear = 1 - r01(t, T.h26, 0.3);
  const lk = io(r01(t, T.h24 + 0.1, 0.5)), rk = io(r01(t, T.h25 + 0.05, 0.5));
  alpha(backing, 0.85 * r01(t, T.h24, 0.3) * clear);
  left.mesh.rotation.y = -1.45 * (1 - lk); alpha(left.mesh, Math.min(1, lk * 3) * clear);
  right.mesh.rotation.y = 1.45 * (1 - rk); alpha(right.mesh, Math.min(1, rk * 3) * clear);
  alpha(or.mesh, r01(t, T.h25 + 0.3, 0.2) * clear);
}

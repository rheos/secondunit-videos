// The note: a slip of paper that drifts in from the right on hold 18, floats down beside Blink and slides in under its
// face, then rests against its front until hold 20 ends. Its path stays below the eyes the whole way (animatic 04 had it
// cross the face). It rests on the left, clear of July; the right chute is on the right. Nothing joins them. It arrives
// on its own: no arm, no hand. No quote marks on it.
import * as THREE from "three";
import { alpha, hero, text } from "../parts.js";
import { rr } from "../kit/world.js";
import { T, cl, mix, r01 } from "../timeline.js";

const X = -0.75, Y = -0.2, Z = 1.15, NW = 0.95, NH = 0.36;
// the flight: a cubic from off the frame's right edge, below the strip, down past Blink's right side and in under the
// face. Checked against the eyes in screen space (720 px): its top stays 20 px or more below them.
const P = [[2.0, 1.15], [1.1, 0.55], [0.35, -0.36], [X, Y]];
const FLY = [T.h18, 1.1], SETTLE = 0.35;
const bez = (s, i) => { const a = 1 - s; return a * a * a * P[0][i] + 3 * a * a * s * P[1][i] + 3 * a * s * s * P[2][i] + s * s * s * P[3][i]; };
let note, base;

export function build(scene) {
  note = hero(NW, NH, 300, (g, W, H) => {
    g.fillStyle = "#efeeea"; rr(g, 2, 2, W - 4, H - 4, 6); g.fill();
    // a faint fold shadow along the curled corner, so the slip reads as paper
    const gr = g.createLinearGradient(W * 0.72, 0, W, 0); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,0.10)");
    g.fillStyle = gr; rr(g, 2, 2, W - 4, H - 4, 6); g.fill();
    text(g, "when to search", W / 2, H / 2 + 11, 30, { c: "#14171b", w: 700, a: "center" });
  });
  note.set({});
  // a slight curl: both short ends lift toward the camera, the bottom-right corner a little more
  const geo = new THREE.PlaneGeometry(NW, NH, 14, 4), pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i) / (NW / 2), v = pos.getY(i) / (NH / 2);
    pos.setZ(i, 0.03 * u * u + 0.025 * Math.max(0, u) ** 3 * cl(-v + 0.2));
  }
  geo.computeVertexNormals();
  note.mesh.geometry.dispose();
  note.mesh.geometry = geo;
  base = new THREE.Group();
  base.add(note.mesh);
  scene.add(base);
}

export function update(t) {
  const u = r01(t, FLY[0], FLY[1]);
  const s = 1 - Math.pow(1 - u, 2.2); // drifts in, slows to a stop
  const a = r01(t, T.h18, 0.15) * (1 - r01(t, T.h21, 0.4));
  alpha(note.mesh, a);
  // a leaf's flutter that dies out as it lands, then one small give on landing and a slow breath at rest
  const flutter = 1 - u;
  const v = r01(t, FLY[0] + FLY[1], SETTLE);
  const give = -0.018 * Math.sin(Math.PI * v) * (v > 0 && v < 1 ? 1 : 0);
  const breath = 0.01 * Math.sin(t * 1.3) * r01(t, FLY[0] + FLY[1], 0.6);
  base.position.set(bez(s, 0), bez(s, 1) + 0.04 * Math.sin(u * Math.PI * 3) * flutter + give + breath, Z);
  base.rotation.set(
    0.3 * Math.sin(u * Math.PI * 2.2) * flutter, // tips toward and away like paper in air
    -0.25 * flutter * flutter, // turned a little edge-on while it enters, face-on by the time it is under the face
    0.18 * Math.sin(u * Math.PI * 3) * Math.pow(flutter, 1.5) + 0.01 * Math.sin(t * 0.9) * mix(0, 1, r01(t, FLY[0] + FLY[1], 0.6)),
  );
}

// Your log, hold 26: a paper sheet in the right half of the frame, in front of the core and the slot (its left edge
// clears the lamp's stalk, its top the bulb; world-plan-v2 1.4). One row per call, each naming which search it used.
// These rows are examples for the viewer, not this film's data.
// Finished look: a sheet of card stock with a visible edge, a ruled line under every row slot, settling into place as
// it fades up. Rows arrive one at a time on the animatic's beat (every 0.36 s): each slides a few pixels in from the
// left and fades up over 0.16 s, onto its ruled line. Everything is drawn from t.
import * as THREE from "three";
import { alpha, hero, text } from "../parts.js";
import { rr } from "../kit/world.js";
import { T, cl, io, r01 } from "../timeline.js";

const ROWS = ["keywords (old)", "keywords (old)", "meaning (new)", "keywords (old)", "meaning (new)", "keywords (old)"];
const X = 1.2, Y = 3.1, Z = -0.8, W = 1.5, H = 2.3, ROW_T = 0.3, ROW_IN = 0.16; // 450 x 690 px; `keywords (old)` at 38 px is 319 px
// row i lands at FIRST + i * ROW_T. The animatic had h26 + 0.35 and 0.36 s; the finish starts 0.2 s earlier and steps
// 0.3 s so the sixth row is typed by h27 - 1.15 and holds 1.5 s before OUT (cues.js copies both numbers).
const FIRST = T.h26 + 0.15;
let rig, sheet, edge;

const softBack = (x, c1 = 0.9) => { x = cl(x); const c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const ink = (a) => `rgba(20,23,27,${a.toFixed(3)})`;

export function build(scene, { toon }) {
  rig = new THREE.Group();
  scene.add(rig);
  // the card's edge: a thin slab behind the sheet, showing as a hairline at its right and bottom
  edge = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.012), toon("#a9a7a2", { fog: false, transparent: true, opacity: 0 }));
  edge.position.set(0.007, -0.009, -0.012);
  rig.add(edge);

  sheet = hero(W, H, 300, (g, Wp, Hp, s) => {
    g.fillStyle = "#efeeea"; rr(g, 2, 2, Wp - 4, Hp - 4, 6); g.fill();
    text(g, "your log", 28, 62, 44, { c: "#14171b", w: 700 });
    g.fillStyle = "#14171b"; g.fillRect(28, 82, Wp - 56, 3);
    ROWS.forEach((r, i) => {
      g.fillStyle = "#d9d7d1"; g.fillRect(28, 160 + i * 92 + 18, Wp - 56, 2); // the ruled line under the slot
      const k = s.k[i];
      if (k > 0) text(g, r, 28 - 18 * (1 - k), 160 + i * 92, 38, { c: ink(k), w: 600 });
    });
  });
  sheet.mesh.material.opacity = 0; // it starts transparent and fades up with its settle (kit rule, ep 6)
  rig.add(sheet.mesh);
}

// one alpha for every part: in over 0.3 s from h26 + 0.1, out over 0.38 s from OUT. Both are straight ramps (an eased
// 0.3 s ramp steps 0.15 a frame at its middle), so it changes steadily and reaches zero with the motion.
// OUT = h27 + 0.35: the sixth row is typed by h27 - 1.15, and a line holds 1.5 s after its last character before it
// leaves (review checklist; the supervisor measured 0.8 s on d3). The sheet is gone by h27 + 0.73, before the camera
// leaves the log on "built" (h27 + 0.82); world.js keeps the station's window open past that and camera-set.mjs knows
// the same end.
export const OUT = T.h27 + 0.35;
export const logAlpha = (t) => r01(t, T.h26 + 0.1, 0.3) * (1 - r01(t, OUT, 0.38));

export function update(t) {
  const a = logAlpha(t), kout = io(r01(t, OUT, 0.38));
  // it settles down 0.08 into place with one small give and floats while held; leaving, it lifts, slides right and
  // shrinks toward its right edge, out of the machine's way
  const drop = 0.08 * (1 - softBack(r01(t, T.h26 + 0.05, 0.45)));
  const s = 1 - 0.25 * kout;
  rig.scale.setScalar(s);
  rig.position.set(X + 0.55 * kout + (W / 2) * (1 - s), Y + drop + 0.12 * kout + 0.006 * Math.sin(t * 1.1), Z);
  const on = a > 0.002;
  rig.visible = on;
  alpha(sheet.mesh, a);
  // the edge stays a transparent material for good: flipping .transparent at runtime doesn't recompile three's
  // shader, so a box first drawn opaque kept full alpha through the fade and showed as a solid grey slab
  edge.visible = on;
  edge.material.opacity = a;
  edge.material.depthWrite = a > 0.98;
  if (on) {
    // each row's arrival, quantised so the canvas redraws only while a row is moving; rows share the sheet's alpha
    const k = ROWS.map((_, i) => Math.round(io(r01(t, FIRST + i * ROW_T, ROW_IN)) * 40) / 40);
    sheet.set({ k });
  }
}

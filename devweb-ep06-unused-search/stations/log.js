// Your log, hold 26: a paper sheet in the right half of the frame. One row per call, each naming which search it used.
// These rows are examples for the viewer, not this film's data.
// Finished look: a sheet of card stock with a visible edge, a ruled line under every row slot, settling into place as
// it fades up. Rows arrive one at a time on the animatic's beat (every 0.36 s): each slides a few pixels in from the
// left and fades up over 0.16 s, onto its ruled line. Everything is drawn from t.
import * as THREE from "three";
import { alpha, hero, solidAlpha, text } from "../parts.js";
import { rr } from "../kit/world.js";
import { T, cl, io, r01 } from "../timeline.js";

const ROWS = ["keywords (old)", "keywords (old)", "meaning (new)", "keywords (old)", "meaning (new)", "keywords (old)"];
const X = 1.2, Y = 3.1, Z = -0.8, W = 1.5, H = 2.3, ROW_T = 0.36, ROW_IN = 0.16;
const FIRST = T.h26 + 0.35; // row i lands at FIRST + i * ROW_T, as in the animatic
let rig, sheet, edge;

const softBack = (x, c1 = 0.9) => { x = cl(x); const c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const ink = (a) => `rgba(20,23,27,${a.toFixed(3)})`;

export function build(scene, { toon }) {
  rig = new THREE.Group();
  scene.add(rig);
  // the card's edge: a thin slab behind the sheet, showing as a hairline at its right and bottom
  edge = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.012), toon("#a9a7a2", { fog: false }));
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
  rig.add(sheet.mesh);
}

export function update(t) {
  // in: 0.3 s from h26 + 0.1; out: 0.4 s from h27, done before the window closes (h27 + 0.4). Both eased at each end,
  // so no frame-to-frame step is bigger than its neighbours, and the sheet is moving the whole time it fades.
  const kin = io(r01(t, T.h26 + 0.1, 0.3)), u = r01(t, T.h27, 0.38), kout = io(u);
  const a = kin * (1 - kout);
  // it settles down 0.08 into place with one small give and floats while held; leaving, it lifts, slides right and
  // shrinks toward its right edge, out of the crate's way
  const drop = 0.08 * (1 - softBack(r01(t, T.h26 + 0.05, 0.45)));
  const s = 1 - 0.25 * kout;
  rig.scale.setScalar(s);
  rig.position.set(X + 0.55 * kout + (W / 2) * (1 - s), Y + drop + 0.12 * kout + 0.006 * Math.sin(t * 1.1), Z);
  rig.visible = a > 0.002;
  alpha(sheet.mesh, a);
  solidAlpha(edge, a * a); // the card's edge goes a little ahead of the paper, so it never reads as a grey slab
  if (a > 0.002) {
    // each row's arrival, quantised so the canvas redraws only while a row is moving
    const k = ROWS.map((_, i) => Math.round(io(r01(t, FIRST + i * ROW_T, ROW_IN)) * 40) / 40);
    sheet.set({ k });
  }
}

// The Lamp: small green status lamp on a post, upper right. Same green in every hold ("nothing broke"); it keeps its
// light under the end mark. Its label sits under the head, on its own small dark tag so the post can run up behind
// it to the head, and shows only on the holds about it (09, 14-15).
// Finished look: a metal post on a bracket off the crate's side, a collar, a round housing with a bezel, and a lens
// lit from inside (a pale core, the palette green at the rim). The glow around it rests at 0.025. No flicker: steady
// is the point. Everything here is a pure function of t.
import * as THREE from "three";
import { alpha, basic, staticPanel, text } from "../parts.js";
import { T, io, r01, spanAlpha, worldDim } from "../timeline.js";

// the head's centre and the post line keep the animatic's place; the housing top stays under y 4.64 (the overlay check)
const X = 1.8, Y = 4.55, Z = -1.8;
const R_HOUSING = 0.085, R_LENS = 0.066;
const LABEL_Y = 4.33;
let metal = [], label, tag, halo;

function part(toon, geo, color, x, y, z, rx = 0) {
  const m = new THREE.Mesh(geo, toon(color, { fog: false }));
  m.position.set(x, y, z);
  m.rotation.x = rx;
  m.userData.base = new THREE.Color(color);
  metal.push(m);
  return m;
}

function radial(stops, size = 128) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d"), rg = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([s, col]) => rg.addColorStop(s, col));
  g.fillStyle = rg; g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function build(scene, { toon }) {
  const g = new THREE.Group();
  scene.add(g);
  // the post, the same line as the animatic's (y 3.0 to 4.22), now carried on up to the head's collar
  g.add(part(toon, new THREE.CylinderGeometry(0.02, 0.02, 1.42, 12), "#2c343e", X, 3.0 + 0.71, Z));
  // a foot cap and a bracket into the crate's right side (x 1.35), so the lamp stands on something
  g.add(part(toon, new THREE.CylinderGeometry(0.032, 0.032, 0.05, 12), "#3a4450", X, 3.0, Z));
  g.add(part(toon, new THREE.BoxGeometry(0.47, 0.035, 0.05), "#2c343e", (1.33 + X) / 2, 3.0, Z));
  // the collar under the housing
  g.add(part(toon, new THREE.CylinderGeometry(0.03, 0.024, 0.06, 12), "#3a4450", X, Y - R_HOUSING - 0.02, Z));
  // the housing: a short drum facing the camera, its bezel ring, and a small hood over the lens
  g.add(part(toon, new THREE.CylinderGeometry(R_HOUSING, R_HOUSING, 0.07, 32), "#232a33", X, Y, Z, Math.PI / 2));
  g.add(part(toon, new THREE.TorusGeometry((R_HOUSING + R_LENS) / 2, (R_HOUSING - R_LENS) / 2, 10, 40), "#4a5563", X, Y, Z + 0.036));
  const hood = part(toon, new THREE.CylinderGeometry(R_HOUSING, R_HOUSING, 0.05, 32, 1, true, Math.PI / 2, Math.PI), "#2c343e", X, Y, Z + 0.06, Math.PI / 2);
  hood.material.side = THREE.DoubleSide;
  g.add(hood);

  // the lens, lit from inside: kept small and pale at its core so the green stays a tiny share of the frame
  const lens = new THREE.Mesh(new THREE.CircleGeometry(R_LENS, 40), new THREE.MeshBasicMaterial({
    map: radial([[0, "#d2f2dc"], [0.45, "#8edca6"], [0.8, "#6ad08a"], [1, "#4c9e66"]]), fog: false,
  }));
  lens.position.set(X, Y, Z + 0.038);
  // a glint on the glass, upper left
  const glint = new THREE.Mesh(new THREE.CircleGeometry(0.014, 16), new THREE.MeshBasicMaterial({ color: "#f4fbf6", fog: false }));
  glint.position.set(X - 0.026, Y + 0.026, Z + 0.039);
  // the glow at rest: a soft disc, never a hard-edged sphere, at 0.025
  halo = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), basic("#6ad08a", { map: radial([[0, "rgba(255,255,255,1)"], [0.35, "rgba(255,255,255,0.45)"], [1, "rgba(255,255,255,0)"]]), opacity: 0.025, blending: THREE.AdditiveBlending }));
  halo.position.set(X, Y, Z + 0.02);
  g.add(lens, glint, halo);

  // the label on its own small tag, so the post behind it doesn't run through the letters
  tag = staticPanel(0.5, 0.14, 300, (gx, W, H) => {
    gx.fillStyle = "rgba(13,17,23,0.92)"; gx.beginPath(); gx.roundRect(4, 4, W - 8, H - 8, 8); gx.fill();
    gx.strokeStyle = "#3a4450"; gx.lineWidth = 2; gx.stroke();
    text(gx, "working", W / 2, 31, 30, { c: "#c9d1d9", a: "center" });
  }, X, LABEL_Y, Z + 0.06, scene);
  label = tag.mesh;
}

export function update(t) {
  // the housing and post dim with the world at the end; the lens and its glow keep their light
  const k = worldDim(t);
  metal.forEach((m) => m.material.color.copy(m.userData.base).multiplyScalar(k));
  alpha(halo, 0.025);

  // the tag rises 0.02 into place as it fades up, and floats a hair while it holds
  const a = io(spanAlpha([[T.h09 + 0.3, T.h10], [T.h14, T.h16]], t, 0.3));
  const rise = 1 - io(t < T.h14 ? r01(t, T.h09 + 0.3, 0.3) : r01(t, T.h14, 0.3));
  label.position.set(X, LABEL_Y - 0.02 * rise + 0.003 * Math.sin(t * 1.4), Z + 0.06);
  alpha(label, a);
}

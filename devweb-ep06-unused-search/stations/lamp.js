// The Lamp: the small green status lamp on the machine's crown, top centre. Same green in every hold ("nothing broke");
// it keeps its light under the end mark. The stalk and the bulb are the machine's (stations/machine.js builds them and
// exports the bulb mesh); this station owns the light on it and the label: a soft glow disc resting at 0.025 in front
// of the bulb, and the `working` tag hanging under it on its own small dark tag (machine.at("lampTag")), shown only on
// the holds about it (09, 14-15), rising 0.02 into place as it fades up. No flicker: steady is the point. Everything
// here is a pure function of t.
import * as THREE from "three";
import { alpha, basic, staticPanel, text } from "../parts.js";
import { T, io, r01, spanAlpha } from "../timeline.js";
import * as machine from "./machine.js";
import { C } from "./forge.js";

// the tag hangs 0.34 in front of its anchor: the whistle's pipe and the crown's curly wire with its knob run up through
// the anchor's x and y, the knob's front at world z -2.39; the tag has to be in front of both to be read
const TAG_Z = 0.34;
let label, halo, bulbAt, tagAt;

function radial(stops, size = 128) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d"), rg = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([s, col]) => rg.addColorStop(s, col));
  g.fillStyle = rg; g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function build(scene) {
  bulbAt = machine.at("bulb"); tagAt = machine.at("lampTag");
  // the glow at rest: a soft disc, never a hard-edged sphere, at 0.025, just in front of the bulb (r 0.1 world)
  halo = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), basic(C.lamp, { map: radial([[0, "rgba(255,255,255,1)"], [0.35, "rgba(255,255,255,0.45)"], [1, "rgba(255,255,255,0)"]]), opacity: 0, blending: THREE.AdditiveBlending }));
  halo.position.set(bulbAt.x, bulbAt.y, bulbAt.z + 0.13);
  scene.add(halo);

  // the label on its own small tag under the bulb (150 x 42 px: `working` at 30 px is 126 px, 12 px clear each side)
  const tag = staticPanel(0.5, 0.14, 300, (gx, W, H) => {
    gx.fillStyle = "rgba(13,17,23,0.92)"; gx.beginPath(); gx.roundRect(4, 4, W - 8, H - 8, 8); gx.fill();
    gx.strokeStyle = "#3a4450"; gx.lineWidth = 2; gx.stroke();
    text(gx, "working", W / 2, 31, 30, { c: "#c9d1d9", a: "center" });
  }, tagAt.x, tagAt.y, tagAt.z + TAG_Z, scene);
  label = tag.mesh;
  label.material.opacity = 0;
}

export function update(t) {
  // the bulb keeps its own light every frame: the one thing on the machine the end dim never touches
  machine.bulb.material.color.set(C.lamp);
  alpha(halo, 0.025);

  // the tag rises 0.02 into place as it fades up, and floats a hair while it holds
  const a = io(spanAlpha([[T.h09 + 0.3, T.h10], [T.h14, T.h16]], t, 0.3));
  const rise = 1 - io(t < T.h14 ? r01(t, T.h09 + 0.3, 0.3) : r01(t, T.h14, 0.3));
  label.position.set(tagAt.x, tagAt.y - 0.02 * rise + 0.003 * Math.sin(t * 1.4), tagAt.z + TAG_Z);
  alpha(label, a);
}

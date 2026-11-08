// The errors bin, hold 15 only: empty on every frame. The bin itself (boss, face with the label, walls, pale bed) is the
// machine's (stations/machine.js builds it in the foot trunk and tips it out on binOut(t)). This station draws only what
// plays inside the tipped bed: an inner shadow along the back wall and sides so the bed reads as a floor, a slow band
// of light that passes once across it, and five specks of dust that drift down and come to rest on the bed. Nothing
// else is in it. The group here is a second hinge at machine.at("binHinge") turning on the same binOut(t) as the
// machine's, at the machine's scale, so test-local offsets from the hinge land on the machine's bed.
// Everything is a pure function of t.
import * as THREE from "three";
import { alpha } from "../parts.js";
import { MACHINE_S, T, binOut, io, r01 } from "../timeline.js";
import * as machine from "./machine.js";

// the bed, test-local from the hinge (machine.js: bed 0.58 x 0.02 x 0.26 at (0, 0.03, -0.14)); its top is at y 0.04
const BED_W = 0.58, BED_D = 0.26, BED_Y = 0.04, BED_Z = -0.14, BACK_Z = -0.26;
const TIP = 0.6; // the machine's tip angle, in radians, times binOut(t)
const SWEEP = [T.h15 + 1.1, 1.8]; // start, length: one pass, an event, not a state
const DUST = [[-0.2, 0.75, 2.2], [0.06, 0.95, 2.6], [0.21, 1.2, 2.0], [-0.07, 1.6, 2.4], [0.15, 2.1, 2.3]]; // x, start after h15, fall time

let hinge, shade, sweep, motes = [];

function canvasTex(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
// a plane lying on the bed, facing up, at height y over the bed's centre
function onBed(mat, y) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(BED_W, BED_D), mat);
  m.rotation.x = -Math.PI / 2; m.position.set(0, y, BED_Z);
  hinge.add(m);
  return m;
}

export function build(scene) {
  hinge = new THREE.Group();
  hinge.position.copy(machine.at("binHinge"));
  hinge.scale.setScalar(MACHINE_S);
  scene.add(hinge);

  // inner shadow on the bed: darker along the back wall and the sides, open in the middle (texture v runs back to front)
  shade = onBed(new THREE.MeshBasicMaterial({
    fog: false, transparent: true, depthWrite: false, opacity: 0,
    map: canvasTex(128, 64, (g, w, h) => {
      const v = g.createLinearGradient(0, 0, 0, h);
      v.addColorStop(0, "rgba(13,17,23,0.45)"); v.addColorStop(0.3, "rgba(13,17,23,0)"); v.addColorStop(1, "rgba(13,17,23,0.12)");
      g.fillStyle = v; g.fillRect(0, 0, w, h);
      const s = g.createLinearGradient(0, 0, w, 0);
      s.addColorStop(0, "rgba(13,17,23,0.3)"); s.addColorStop(0.1, "rgba(13,17,23,0)"); s.addColorStop(0.9, "rgba(13,17,23,0)"); s.addColorStop(1, "rgba(13,17,23,0.3)");
      g.fillStyle = s; g.fillRect(0, 0, w, h);
    }),
  }), BED_Y + 0.004);

  // the sweep: a soft band on a strip three beds wide; the texture slides, so the band never leaves the bed
  const st = canvasTex(384, 8, (g, w, h) => {
    const b = g.createLinearGradient(w / 3, 0, (2 * w) / 3, 0);
    b.addColorStop(0, "rgba(255,255,255,0)"); b.addColorStop(0.5, "rgba(255,255,255,1)"); b.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = b; g.fillRect(w / 3, 0, w / 3, h);
  });
  st.repeat.set(1 / 3, 1);
  sweep = onBed(new THREE.MeshBasicMaterial({ map: st, color: "#ffffff", fog: false, transparent: true, depthWrite: false, opacity: 0 }), BED_Y + 0.007);

  // dust: a few specks, each its own material
  DUST.forEach(() => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.015, 0.015), new THREE.MeshBasicMaterial({ color: "#59616b", fog: false, transparent: true, depthWrite: false, opacity: 0 }));
    hinge.add(m); motes.push(m);
  });
}

export function update(t) {
  // the same tip as the machine's bin, from the same clock
  const out = binOut(t), th = TIP * out;
  hinge.position.copy(machine.at("binHinge"));
  hinge.rotation.set(th, 0, 0);
  // what plays on the bed shows only while the bin is out (in with the tip, out with the tip back)
  const k = io(r01(t, T.h15, 0.45)) * (1 - io(r01(t, T.h16, 0.4)));
  hinge.visible = k > 0.002;
  if (!hinge.visible) return;

  alpha(shade, k);

  // the sweep: one pass left to right, a white band at peak 0.6 over the pale bed, then nothing
  const sp = r01(t, SWEEP[0], SWEEP[1]);
  sweep.material.map.offset.x = (2 / 3) * (1 - io(sp));
  alpha(sweep, 0.6 * Math.sin(Math.PI * sp) * k);

  // dust drifts down from the top of the back wall and rests on the bed, swaying a little as it falls. The world's down,
  // in the tipped bin's own frame, leans toward the face: (0, -cos th, sin th); each speck falls along it until it meets
  // the bed, which it does inside the bed since the walls are a third as tall as the bed is deep.
  const dy = -Math.cos(th), dz = Math.sin(th);
  DUST.forEach(([dx, start, fall], i) => {
    const u = io(r01(t, T.h15 + start, fall));
    const y0 = 0.34, len = (y0 - BED_Y) / -dy; // travel to the bed along the leaning fall
    const m = motes[i];
    m.position.set(dx + 0.012 * Math.sin(u * 5 + i) * (1 - u), y0 + dy * len * u + 0.006, BACK_Z + 0.03 + dz * len * u);
    m.rotation.set(th > 0.001 ? -Math.PI / 2 * u : 0, 0, 0); // flat on the bed once it has landed
    alpha(m, k * Math.min(1, u * 6) * 0.85);
  });
}

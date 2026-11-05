// The Line: the roller bed the crate is parked on. The rollers turn only with the rock on board 19.
import * as THREE from "three";
import { solid } from "../parts.js";
import { rock } from "../timeline.js";

const rollers = [];

export function build(scene, { toon }) {
  solid(toon, 6.2, 0.28, 3, "#161b22", -0.1, 1.58, -2.6, scene);
  solid(toon, 6.2, 0.03, 0.06, "#2c343e", -0.1, 1.71, -1.08, scene);
  const disc = new THREE.CylinderGeometry(0.09, 0.09, 0.03, 20), mark = new THREE.BoxGeometry(0.14, 0.018, 0.034);
  for (let x = -3.2; x <= 3.0; x += 0.255) {
    const r = new THREE.Group();
    r.position.set(x, 1.58, -1.08);
    const d = new THREE.Mesh(disc, toon("#161b22", { fog: false })); d.rotation.x = Math.PI / 2;
    const m = new THREE.Mesh(mark, toon("#2c343e", { fog: false }));
    r.add(d, m);
    scene.add(r);
    rollers.push(r);
  }
}

export function update(t) {
  const turn = rock(t) * 0.6;
  rollers.forEach((r) => { r.rotation.z = turn; });
}

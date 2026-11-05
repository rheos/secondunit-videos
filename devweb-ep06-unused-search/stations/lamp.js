// The Lamp: same spot, same green, all film. It keeps its light under the end mark. The ring is an overlay, not the lamp.
import * as THREE from "three";
import { basic, circleRing, staticPanel, text } from "../parts.js";
import { T, spanAlpha } from "../timeline.js";

let ring;

export function build(scene, { toon }) {
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.55, 10), toon("#2c343e", { fog: false }));
  post.position.set(1.75, 2.995, -1.4);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 16), new THREE.MeshBasicMaterial({ color: "#6ad08a", fog: false }));
  head.position.set(1.75, 4.36, -1.4);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), basic("#6ad08a", { opacity: 0.03, blending: THREE.AdditiveBlending }));
  halo.position.copy(head.position);
  scene.add(post, head, halo);
  // beside the post, not across it: a centred tag was cut by the pole and the tally (first watch 01)
  staticPanel(0.4, 0.14, 300, (g) => text(g, "build", 0, 32, 30, { c: "#c9d1d9" }), 1.99, 4.16, -1.38, scene);
  ring = circleRing(0.19, 0.012, scene, 1.75, 4.36, -1.37);
}

export function update(t) {
  ring.set(spanAlpha([[T.b13, T.b14], [T.b33, T.endIn]], t));
}

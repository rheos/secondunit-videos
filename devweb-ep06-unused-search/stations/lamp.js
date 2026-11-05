// The Lamp: small green lamp on a post, upper right. Same green in every hold; it keeps its light under the end mark.
// Its label sits under the head, clear of the post, and shows only on the holds about it (09, 14-15).
import * as THREE from "three";
import { alpha, basic, staticPanel, text } from "../parts.js";
import { T, spanAlpha } from "../timeline.js";

const X = 1.8, Y = 4.55, Z = -1.8;
let label;

export function build(scene, { toon }) {
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.22, 10), toon("#2c343e", { fog: false }));
  post.position.set(X, 3.61, Z);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 16), new THREE.MeshBasicMaterial({ color: "#6ad08a", fog: false }));
  head.position.set(X, Y, Z);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), basic("#6ad08a", { opacity: 0.03, blending: THREE.AdditiveBlending }));
  halo.position.copy(head.position);
  scene.add(post, head, halo);
  label = staticPanel(0.5, 0.14, 300, (g, W) => text(g, "working", W / 2, 32, 30, { c: "#c9d1d9", a: "center" }), X, 4.33, Z + 0.02, scene);
}

export function update(t) {
  alpha(label.mesh, spanAlpha([[T.h09 + 0.3, T.h10], [T.h14, T.h16]], t, 0.3));
}

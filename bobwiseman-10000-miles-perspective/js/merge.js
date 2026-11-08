// Concatenate non-indexed geometries that share the same attributes.
import * as THREE from "./lib/three.module.js";

export function mergeGeometries(gs) {
  const names = Object.keys(gs[0].attributes);
  const out = new THREE.BufferGeometry();
  for (const n of names) {
    const size = gs[0].attributes[n].itemSize;
    let len = 0; for (const g of gs) len += g.attributes[n].array.length;
    const arr = new Float32Array(len); let o = 0;
    for (const g of gs) { arr.set(g.attributes[n].array, o); o += g.attributes[n].array.length; }
    out.setAttribute(n, new THREE.BufferAttribute(arr, size));
  }
  out.computeBoundingSphere();
  return out;
}

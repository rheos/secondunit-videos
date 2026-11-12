// The new city, drawn in code as one-ink silhouettes: stepped towers, drum towers, masts, lattice cranes,
// chimneys, doorways. Every piece is a merged geometry so a whole row draws as one mesh in one ink.
import * as THREE from "./lib/three.module.js";

// tiny seeded RNG so the city is the same every frame and every run
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function box(w, h, d, x, y, z, ry = 0) { const g = new THREE.BoxGeometry(w, h, d); if (ry) g.rotateY(ry); g.translate(x, y + h / 2, z); return g; }
function cyl(r, h, x, y, z, seg = 24) { const g = new THREE.CylinderGeometry(r, r, h, seg); g.translate(x, y + h / 2, z); return g; }
function beam(a, b, t) { // a square beam from point a to point b, thickness t
  const d = new THREE.Vector3().subVectors(b, a); const L = d.length();
  const g = new THREE.BoxGeometry(t, L, t); const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  g.applyQuaternion(q); const m = a.clone().add(b).multiplyScalar(0.5); g.translate(m.x, m.y, m.z); return g;
}

// stepped tower: slabs that set back as they rise, optional mast
export function stepTower(r, x, z, s = 1) {
  const gs = []; let w = (2 + r() * 2) * s, d = (2 + r() * 2) * s, y = 0;
  const steps = 2 + Math.floor(r() * 4);
  for (let i = 0; i < steps; i++) { const h = (2 + r() * 4) * s; gs.push(box(w, h, d, x, y, z)); y += h; w *= 0.62 + r() * 0.2; d *= 0.62 + r() * 0.2; }
  if (r() < 0.6) { gs.push(box(0.12 * s, (3 + r() * 5) * s, 0.12 * s, x, y, z)); }
  return gs;
}
// drum tower: a cylinder with a slab through it (constructivist workers' club)
export function drumTower(r, x, z, s = 1) {
  const R = (1.4 + r()) * s, h = (4 + r() * 8) * s;
  const gs = [cyl(R, h, x, 0, z), box(R * 3.2, 0.5 * s, R * 0.9, x, h * (0.4 + r() * 0.4), z)];
  gs.push(box(0.1 * s, (2 + r() * 3) * s, 0.1 * s, x + R * 0.5, h, z));
  return gs;
}
// chimney
export function chimney(r, x, z, s = 1) { const h = (8 + r() * 10) * s; return [cyl(0.5 * s, h, x, 0, z, 12), box(2.5 * s, 2 * s, 2.5 * s, x, 0, z)]; }
// lattice crane: tower of beams with cross bracing, a jib and a counter-jib, a hook line
export function crane(r, x, z, s = 1, swing = 0) {
  const gs = []; const H = (14 + r() * 8) * s, w = 0.9 * s, t = 0.09 * s; const n = Math.round(H / w);
  const c = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => [x + a * w / 2, z + b * w / 2]);
  for (const [cx, cz] of c) gs.push(beam(new THREE.Vector3(cx, 0, cz), new THREE.Vector3(cx, H, cz), t));
  for (let i = 0; i < n; i++) {
    const y0 = i * w, y1 = (i + 1) * w;
    for (let k = 0; k < 4; k++) { const [ax, az] = c[k], [bx, bz] = c[(k + 1) % 4];
      gs.push(beam(new THREE.Vector3(ax, y0, az), new THREE.Vector3(bx, y1, bz), t * 0.7));
      gs.push(beam(new THREE.Vector3(ax, y1, az), new THREE.Vector3(bx, y1, bz), t * 0.7)); }
  }
  // jib along a direction set by swing
  const dir = new THREE.Vector3(Math.cos(swing), 0, Math.sin(swing)); const top = new THREE.Vector3(x, H, z);
  const L = (10 + r() * 6) * s, Lc = L * 0.35;
  const tip = top.clone().addScaledVector(dir, L), back = top.clone().addScaledVector(dir, -Lc);
  const up = new THREE.Vector3(0, 1, 0);
  const peak = top.clone().addScaledVector(up, 3 * s);
  gs.push(beam(back, tip, t * 2.2));
  gs.push(beam(top.clone().addScaledVector(up, -0.6 * s).addScaledVector(dir, 0), tip, t * 1.2));
  for (let i = 1; i <= 8; i++) { const a = top.clone().addScaledVector(dir, L * i / 8); const b = top.clone().addScaledVector(dir, L * (i - 0.5) / 8).addScaledVector(up, -0.6 * s); gs.push(beam(a, b, t)); }
  gs.push(beam(top, peak, t * 1.5), beam(peak, tip, t * 0.6), beam(peak, back, t * 0.6));
  gs.push(box(1.6 * s, 1.4 * s, 1.4 * s, back.x, back.y - 1.4 * s, back.z)); // counterweight
  const hookAt = top.clone().addScaledVector(dir, L * (0.55 + r() * 0.3)); const drop = (5 + r() * 6) * s;
  gs.push(beam(hookAt, hookAt.clone().addScaledVector(up, -drop), t * 0.5));
  gs.push(box(0.5 * s, 0.5 * s, 0.5 * s, hookAt.x, hookAt.y - drop - 0.5 * s, hookAt.z));
  // the load on the hook, kept apart so it can take its own ink
  gs.load = box(2.6 * s, 1.1 * s, 1.4 * s, hookAt.x, hookAt.y - drop - 1.7 * s, hookAt.z);
  return gs;
}
// row house front with open doorways (no doors in them: "without locks on the doors")
export function doorRow(r, x, z, s = 1, n = 6) {
  const gs = []; const dw = 1.1 * s, dh = 2.2 * s, gap = 1.6 * s, h = 4.2 * s, D = 0.6 * s;
  const W = n * (dw + gap) + gap;
  gs.push(box(W, h - dh, D, x, dh, z)); // lintel band
  for (let i = 0; i <= n; i++) gs.push(box(gap, dh, D, x - W / 2 + gap / 2 + i * (dw + gap), 0, z)); // piers between doorways
  return gs;
}

export function merge(geos) {
  const parts = geos.map((g) => (g.index ? g.toNonIndexed() : g));
  let n = 0; for (const g of parts) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3); let k = 0;
  for (const g of parts) { pos.set(g.attributes.position.array, k); k += g.attributes.position.array.length; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.computeBoundingSphere(); return geo;
}

// a city block field: rows of mixed towers from z0 to z1 (going away from camera, -z), x spread +-xs
export function cityField(seed, { z0 = -20, z1 = -400, xs = 120, rowGap = 14, avoid = 8, s = 1 } = {}) {
  const r = rng(seed); const geos = [];
  for (let z = z0; z > z1; z -= rowGap * (0.7 + r() * 0.6)) {
    for (let x = -xs; x < xs; x += 6 + r() * 8) {
      if (Math.abs(x) < avoid) continue; // keep the avenue clear
      const k = r(); const sc = s * (0.7 + r() * 0.7) * (1 + (-z) / 1500);
      if (k < 0.55) geos.push(...stepTower(r, x, z, sc));
      else if (k < 0.75) geos.push(...drumTower(r, x, z, sc));
      else if (k < 0.85) geos.push(...chimney(r, x, z, sc));
      else geos.push(box(4 * sc, (2 + r() * 4) * sc, 4 * sc, x, 0, z));
    }
  }
  return merge(geos);
}

// a standing person as one flat-ink silhouette: capsule limbs, round head. pose: 0 = arms down, 1 = one arm raised
function limb(a, b, r) { const d = new THREE.Vector3().subVectors(b, a); const L = d.length();
  const g = new THREE.CapsuleGeometry(r, Math.max(0.001, L), 3, 8); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
  const m = a.clone().add(b).multiplyScalar(0.5); g.translate(m.x, m.y, m.z); return g; }
export function person(x, z, s = 1, pose = 0, ry = 0) {
  const V = (a, b, c) => new THREE.Vector3(a * s, b * s, c * s);
  const gs = [];
  gs.push(limb(V(-0.12, 0.05, 0), V(-0.16, 0.85, 0), 0.09 * s), limb(V(0.12, 0.05, 0), V(0.14, 0.85, 0), 0.09 * s)); // legs
  const torso = new THREE.CylinderGeometry(0.2 * s, 0.17 * s, 0.75 * s, 10); torso.translate(0, 1.25 * s, 0); gs.push(torso);
  const head = new THREE.SphereGeometry(0.15 * s, 12, 8); head.translate(0, 1.82 * s, 0); gs.push(head);
  gs.push(limb(V(-0.24, 1.55, 0), V(-0.3, 0.95, 0.05), 0.065 * s));
  gs.push(pose ? limb(V(0.24, 1.55, 0), V(0.42, 2.3, 0.05), 0.065 * s) : limb(V(0.24, 1.55, 0), V(0.3, 0.95, 0.05), 0.065 * s));
  return gs.map((g) => { g.rotateY(ry); g.translate(x, 0, z); return g; });
}

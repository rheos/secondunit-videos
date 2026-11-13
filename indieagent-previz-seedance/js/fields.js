// Test 02: the valley as a worked landscape. Thousands of small repeated objects in patches, all instanced.
// Everything stays clear of the road (the sack's camera flies along it), the farm, the forest hill and the two notice boards.
import * as THREE from "./lib/three.module.js";
import { rng } from "./paint.js";

const hillY = (x, z) => { const q = 1 - (x / 101) ** 2 - ((z - 214) / 66) ** 2; return q > 0 ? -8 + 38.64 * Math.sqrt(q) : -99; };
const blocked = (x, z, pad = 0) =>
  (z > -32 && z < 150 && Math.abs(x - 3) < 7 + pad) ||           // road and its camera
  (x > 16 && x < 96 && z > -38 && z < 68) ||                     // forest hill, dozer, stump
  (Math.abs(x) < 38 && z > -32 && z < 17) ||                     // the farm and its fence
  (x > 2 && x < 15 && z > 15 && z < 36);                         // the price post and THE LAW

const mesh = (geo, mat, list) => {
  const m = new THREE.InstancedMesh(geo, mat, list.length), o = new THREE.Object3D(), c = new THREE.Color();
  list.forEach((q, i) => {
    o.position.set(q.x, q.y, q.z); o.rotation.set(q.rx || 0, q.ry || 0, q.rz || 0); o.scale.set(q.sx ?? q.s ?? 1, q.sy ?? q.s ?? 1, q.sz ?? q.s ?? 1); o.updateMatrix();
    m.setMatrixAt(i, o.matrix); m.setColorAt(i, c.set(q.c || "#ffffff"));
  });
  m.castShadow = m.receiveShadow = true; m.frustumCulled = false; return m;
};

export function buildFields(scene, toon) {
  const r = rng(4242), plain = () => toon(null, "#ffffff");
  const canopy = [], trunks = [], fruit = [], crops = [], bales = [], hedges = [], walls = [], roofs = [], furrows = [], stakes = [];
  const CANOPY = ["#7c8a35", "#68792f", "#8f8d38", "#a5772e", "#596f33"], CROP = ["#2f6a55", "#37755a", "#2a5f52"], ROOF = ["#b5602f", "#c28a3c", "#a24f2c"], WALL = ["#ecd6a6", "#e5c58f", "#dfb98a"];
  const pick = (a) => a[Math.floor(r() * a.length)];
  const orchard = (x0, z0, w, d) => { const col = pick(CANOPY), fr = r() > 0.5 ? "#c23a28" : "#e0a82e";
    for (let x = x0 + 1.6; x < x0 + w - 1; x += 3.2) for (let z = z0 + 1.6; z < z0 + d - 1; z += 3.2) { if (blocked(x, z, 1)) continue; const s = 1.15 + r() * 0.5;
      canopy.push({ x, y: s * 1.9, z, sx: s, sy: s * 0.9, sz: s, ry: r() * 6, c: col }); trunks.push({ x, y: s * 0.65, z, sx: 0.8, sy: s, sz: 0.8 });
      for (let k = 0; k < 5; k++) { const a = r() * 6.3, e = 0.25 + r() * 0.55; fruit.push({ x: x + Math.cos(a) * s * 0.88 * Math.cos(e), y: s * 1.9 + Math.sin(e) * s * 0.8, z: z + Math.sin(a) * s * 0.88 * Math.cos(e), s: 0.55, c: fr }); } } };
  const rows = (x0, z0, w, d) => { const col = pick(CROP); for (let z = z0 + 1; z < z0 + d - 0.6; z += 1.7) for (let x = x0 + 0.8; x < x0 + w - 0.6; x += 1.15) { if (blocked(x, z)) continue; const s = 0.7 + r() * 0.35; crops.push({ x: x + (r() - 0.5) * 0.2, y: s * 0.32, z, sx: s, sy: s * 0.8, sz: s, ry: r() * 6, c: col }); } };
  const vines = (x0, z0, w, d) => { for (let z = z0 + 1; z < z0 + d - 0.6; z += 2.2) for (let x = x0 + 0.8; x < x0 + w - 0.6; x += 2) { if (blocked(x, z)) continue; stakes.push({ x, y: 0.75, z, sy: 1.5 }); crops.push({ x, y: 1, z, sx: 1.25, sy: 1.1, sz: 0.62, c: "#566f2f" }); } };
  const hay = (x0, z0, w, d) => { for (let i = 0; i < w * d * 0.028; i++) { const x = x0 + r() * w, z = z0 + r() * d; if (blocked(x, z)) continue; bales.push({ x, y: 0.72, z, ry: r() * 3.1, c: r() > 0.5 ? "#dfb44d" : "#c99a3a" }); } };
  const ploughed = (x0, z0, w, d) => { for (let z = z0 + 0.6; z < z0 + d; z += 1.1) if (!blocked(x0 + w / 2, z, 6)) furrows.push({ x: x0 + w / 2, y: 0.05, z, sx: w, sy: 0.1, sz: 0.46, c: r() > 0.4 ? "#a9502a" : "#8c4326" }); };
  // the plain between the farm and the castle hill, and the land behind the farm
  const patch = (x0, z0, w, d) => { const k = r(); if (k < 0.34) orchard(x0, z0, w, d); else if (k < 0.58) rows(x0, z0, w, d); else if (k < 0.74) vines(x0, z0, w, d); else if (k < 0.88) hay(x0, z0, w, d); else ploughed(x0, z0, w, d);
    for (let x = x0; x < x0 + w; x += 1.25) if (!blocked(x, z0, 1)) hedges.push({ x, y: 0.62, z: z0, s: 0.9 + r() * 0.3, c: "#5d6e2e" }); };
  for (let x = -112; x < 112; x += 17) for (let z = 18; z < 150; z += 13) patch(x, z, 16, 12);
  for (let x = -110; x < 110; x += 17) for (let z = -92; z < -33; z += 13) patch(x, z, 16, 12);
  // vines climbing the castle hill in terraces
  for (let z = 152; z < 188; z += 2.1) for (let x = -92; x < 92; x += 1.7) { if (Math.abs(x) < 29 && z > 173) continue; const y = hillY(x, z); if (y < 0.3) continue; crops.push({ x, y: y + 0.45, z, sx: 1, sy: 0.85, sz: 0.62, c: z % 8 < 4 ? "#566f2f" : "#6e7a30" }); }
  // a village along the road: one street of cottages each side
  const cottage = (x, z, s) => { const y = 0, yaw = r() * 0.5 - 0.25; walls.push({ x, y: y + 1.05 * s, z, sx: 2.7 * s, sy: 2.1 * s, sz: 2.1 * s, ry: yaw, c: pick(WALL) }); roofs.push({ x, y: y + 2.75 * s, z, sx: 2.5 * s, sy: 1.3 * s, sz: 1.9 * s, ry: yaw + Math.PI / 4, c: pick(ROOF) }); };
  for (let z = 44; z < 146; z += 7.5) for (const s of [-1, 1]) { const x = 3 + s * (12 + r() * 3.5); if (!blocked(x, z, 2) && r() > 0.14) cottage(x, z, 0.95 + r() * 0.35); }
  for (let i = 0; i < 26; i++) { const x = -70 + r() * 140, z = 22 + r() * 124; if (!blocked(x, z, 4)) cottage(x, z, 1 + r() * 0.3); }

  const box = new THREE.BoxGeometry(1, 1, 1), bush = new THREE.SphereGeometry(0.52, 8, 6), ball = new THREE.SphereGeometry(1, 9, 7), roll = new THREE.CylinderGeometry(0.72, 0.72, 1.3, 12).rotateZ(Math.PI / 2), cone = new THREE.ConeGeometry(1, 1, 4), post = new THREE.CylinderGeometry(0.11, 0.15, 1, 6), stick = new THREE.BoxGeometry(0.07, 1, 0.07), dot = new THREE.SphereGeometry(0.2, 6, 5);
  const leaf = toon("leaf"), mat = plain();
  [[ball, leaf, canopy], [post, toon("bark"), trunks], [dot, mat, fruit], [bush, leaf, crops], [bush, leaf, hedges], [roll, toon("thatch"), bales], [box, mat, walls], [cone, toon("thatch"), roofs], [box, mat, furrows], [stick, toon("bark"), stakes]].forEach(([g, m, l]) => { if (l.length) scene.add(mesh(g, m, l)); });
  return { count: canopy.length + trunks.length + fruit.length + crops.length + hedges.length + bales.length + walls.length + roofs.length + furrows.length + stakes.length };
}

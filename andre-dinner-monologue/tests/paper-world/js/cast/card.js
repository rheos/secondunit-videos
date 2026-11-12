// Paper cards: a flat outline with a little thickness. Face, back and cut edge are three material groups,
// so the edge can be paler than the face (the white paper core) and the two faces can be different papers.
import { area, coreOf } from "./shape2d.js";

// paper(colour) is the caller's material factory. One material per colour, shared.
export function papers(paper) {
  const cache = new Map();
  const M = (colour) => { if (!cache.has(colour)) cache.set(colour, paper(colour)); return cache.get(colour); };
  M.core = (colour) => M(coreOf(colour));
  return M;
}

// outline and holes are arrays of [x, y] in local units. uv = local * uvScale, so a wrapped paper texture keeps one grain size.
export function cardGeometry(THREE, outline, thickness, holes = [], uvScale = 1) {
  const fix = (pts, wantCCW) => { const p = pts.map((q) => [q[0], q[1]]); return (area(p) > 0) === wantCCW ? p : p.reverse(); };
  const outer = fix(outline, true), hs = holes.map((h) => fix(h, false));
  const tri = THREE.ShapeUtils.triangulateShape(outer.map((p) => new THREE.Vector2(p[0], p[1])), hs.map((h) => h.map((p) => new THREE.Vector2(p[0], p[1]))));
  const all = outer.concat(...hs), h = thickness / 2, pos = [], nor = [], uv = [], idx = [], groups = [];
  // front (+z)
  for (const p of all) { pos.push(p[0], p[1], h); nor.push(0, 0, 1); uv.push(p[0] * uvScale, p[1] * uvScale); }
  let start = 0;
  for (const f of tri) { const [a, b, c] = f, s = (all[b][0] - all[a][0]) * (all[c][1] - all[a][1]) - (all[c][0] - all[a][0]) * (all[b][1] - all[a][1]); if (s > 0) idx.push(a, b, c); else idx.push(a, c, b); }
  groups.push([start, idx.length - start, 0]); start = idx.length;
  // back (-z)
  const n = all.length;
  for (const p of all) { pos.push(p[0], p[1], -h); nor.push(0, 0, -1); uv.push(p[0] * uvScale + 0.37, p[1] * uvScale + 0.61); }
  for (let i = 0; i < groups[0][1]; i += 3) idx.push(n + idx[i], n + idx[i + 2], n + idx[i + 1]);
  groups.push([start, idx.length - start, 1]); start = idx.length;
  // the cut edge
  let v = 2 * n;
  for (const loop of [outer, ...hs]) {
    let run = 0;
    for (let i = 0; i < loop.length; i++) {
      const p = loop[i], q = loop[(i + 1) % loop.length], dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1e-9, nx = dy / l, ny = -dx / l;
      pos.push(p[0], p[1], h, q[0], q[1], h, q[0], q[1], -h, p[0], p[1], -h);
      for (let k = 0; k < 4; k++) nor.push(nx, ny, 0);
      uv.push(run * uvScale, 0, (run + l) * uvScale, 0, (run + l) * uvScale, thickness * uvScale, run * uvScale, thickness * uvScale);
      idx.push(v, v + 2, v + 1, v, v + 3, v + 2); v += 4; run += l;
    }
  }
  groups.push([start, idx.length - start, 2]);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); for (const [s, c, m] of groups) g.addGroup(s, c, m);
  g.computeBoundingSphere();
  return g;
}

// A card mesh. colour = the face, back = the other face (defaults to colour), edge = the cut edge (defaults to the pale core).
export function card(THREE, M, outline, { colour, back, edge, thickness = 0.1, holes = [], z = 0, uvScale = 1, name = "" } = {}) {
  const mesh = new THREE.Mesh(cardGeometry(THREE, outline, thickness, holes, uvScale), [M(colour), M(back || colour), edge ? M(edge) : M.core(colour)]);
  mesh.position.z = z; mesh.castShadow = true; mesh.receiveShadow = true; mesh.name = name;
  return mesh;
}

// a hinge: a group that turns about an axis through a pivot, holding children that stay in the parent's coordinates
export function hinge(THREE, parent, pivot, axis) {
  const joint = new THREE.Group(), inner = new THREE.Group();
  joint.position.set(pivot[0], pivot[1], pivot[2] || 0); inner.position.set(-pivot[0], -pivot[1], -(pivot[2] || 0));
  joint.add(inner); parent.add(joint);
  const ax = new THREE.Vector3(axis[0], axis[1], axis[2] || 0).normalize();
  return { joint, inner, set: (rad) => joint.quaternion.setFromAxisAngle(ax, rad) };
}

// Building kit: every static part is a world-space geometry with a part id (pid) and a material key.
// At the end, parts merge into one mesh per material for the colour pass and one mesh with a pid
// attribute for the ink pass, so the scene costs a handful of draw calls.
import * as THREE from "./lib/three.module.js";
import { mergeGeometries } from "./merge.js";

export const parts = []; // { g, key, pid }
let nextPid = 1;
export const newPid = () => nextPid++;

const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();

// key: 't:#hex' toon, 'e:#hex' emissive (no ink), or a custom material registered with addMat
export function put(geo, key, pos, rot = [0, 0, 0], opts = {}) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  tmpE.set(rot[0], rot[1], rot[2]);
  tmpQ.setFromEuler(tmpE);
  tmpM.compose(new THREE.Vector3(...pos), tmpQ, new THREE.Vector3(1, 1, 1));
  g.applyMatrix4(tmpM);
  for (const k of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(k)) g.deleteAttribute(k);
  if (!g.attributes.uv) g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
  const pid = opts.pid ?? newPid();
  (opts.target || parts).push({ g, key, pid });
  return pid;
}

// Box by its min corner and size (easier to lay out buildings).
export function box(x, y, z, w, h, d, key, opts = {}) {
  return put(new THREE.BoxGeometry(w, h, d), key, [x + w / 2, y + h / 2, z + d / 2], opts.rot, opts);
}
export function cyl(x, y, z, r0, r1, h, key, opts = {}) {
  return put(new THREE.CylinderGeometry(r1, r0, h, opts.seg || 14), key, [x, y + h / 2, z], opts.rot, opts);
}

// Text painted on a plane; face = direction the readable side looks (+z, -x, +x).
const textMats = new Map();
export function textPlane(lines, w, h, pos, face, style = {}) {
  const S = 128, cv = document.createElement("canvas");
  cv.width = Math.round(w * S); cv.height = Math.round(h * S);
  const c = cv.getContext("2d");
  c.fillStyle = style.bg || "#f2e6c8"; c.fillRect(0, 0, cv.width, cv.height);
  if (style.border) { c.strokeStyle = style.border; c.lineWidth = S * 0.08; c.strokeRect(S * 0.08, S * 0.08, cv.width - S * 0.16, cv.height - S * 0.16); }
  c.fillStyle = style.fg || "#2a1d22"; c.textAlign = "center"; c.textBaseline = "middle";
  const n = lines.length;
  lines.forEach((t, i) => {
    let fs = (cv.height / n) * (style.size || 0.62);
    c.font = `${style.weight || 700} ${fs}px ${style.font || "Georgia, serif"}`;
    while (c.measureText(t).width > cv.width * 0.86 && fs > 8) { fs *= 0.94; c.font = `${style.weight || 700} ${fs}px ${style.font || "Georgia, serif"}`; }
    c.fillText(t, cv.width / 2, cv.height * (i + 0.5) / n + fs * 0.04);
  });
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const key = "x:" + textMats.size;
  textMats.set(key, { tex, glow: !!style.glow });
  const rot = face === "+z" ? [0, 0, 0] : face === "-x" ? [0, -Math.PI / 2, 0] : face === "+x" ? [0, Math.PI / 2, 0] : [0, Math.PI, 0];
  return put(new THREE.PlaneGeometry(w, h), key, pos, rot, style);
}
export const textMaterials = textMats;

// Merge everything in `list` into per-material meshes plus one id mesh.
export function build(list, makeMat, idMat) {
  const byKey = new Map();
  for (const p of list) { if (!byKey.has(p.key)) byKey.set(p.key, []); byKey.get(p.key).push(p.g); }
  const color = new THREE.Group();
  for (const [key, gs] of byKey) {
    const m = new THREE.Mesh(mergeGeometries(gs), makeMat(key));
    m.castShadow = !key.startsWith("e:") && !key.startsWith("x:"); m.receiveShadow = true;
    color.add(m);
  }
  const ids = list.map((p) => {
    const g = p.g.clone(); const a = new Float32Array(g.attributes.position.count).fill(p.pid);
    g.setAttribute("pid", new THREE.BufferAttribute(a, 1)); return g;
  });
  const idMesh = new THREE.Mesh(mergeGeometries(ids), idMat);
  return { color, idMesh };
}

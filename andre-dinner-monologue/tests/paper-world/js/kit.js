// kit.js: the paper kit. Everything in the world is built from these: flat cards with a pale cut edge,
// rolled tubes, stacked discs, folded boxes. Units are centimetres, y up. No gloss anywhere: roughness 1,
// metalness 0, and one seeded paper grain (crumple facets plus fibres) on every surface as colour and bump,
// mapped in object space so it never swims when a piece moves.
import * as THREE from "./lib/three.module.js";
export { THREE };

// ---------- seeded numbers
export function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const hash = (a, b = 0) => { let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
export const smoother = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
// step response of a damped spring, 0 to 1 with overshoot. zeta = damping ratio, period in frames.
export function spring(t, zeta = 0.62, period = 14) {
  if (t <= 0) return 0;
  const w = (2 * Math.PI) / period, wd = w * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + (zeta * w / wd) * Math.sin(wd * t));
}

// ---------- colour
export const PAL = {
  indigo: "#35366f", peach: "#f2b38a", lavender: "#6c66a5", green: "#5f8350", teal: "#23636b", gold: "#e9ae3a",
  umber: "#7e3b2f", navy: "#1f2755", cream: "#f1e6cb", core: "#fbf6ea", terracotta: "#c9825e", lilac: "#b9b3dc",
  window: "#ffd68a", bark: "#8a4530",
};
export function mixHex(a, b, t) {
  const A = new THREE.Color(a), B = new THREE.Color(b);
  const f = (x, y) => Math.round(lerp(x, y, t) * 255).toString(16).padStart(2, "0");
  const as = A.getHexString(), bs = B.getHexString();
  const p = (s, i) => parseInt(s.slice(i * 2, i * 2 + 2), 16) / 255;
  return "#" + [0, 1, 2].map((i) => f(p(as, i), p(bs, i))).join("");
}
export const edgeOf = (colour) => mixHex(colour, PAL.core, 0.72);

// ---------- the grain: one tileable grey canvas
let grainTex = null;
export function grain() {
  if (grainTex) return grainTex;
  const S = 512, c = document.createElement("canvas"); c.width = c.height = S;
  const g = c.getContext("2d"), r = rng(20261111);
  g.fillStyle = "#808080"; g.fillRect(0, 0, S, S);
  const wrap = (draw) => { for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) { g.save(); g.translate(dx, dy); draw(); g.restore(); } };
  for (let i = 0; i < 240; i++) {          // crumple facets
    const x = r() * S, y = r() * S, n = 3 + (r() * 3 | 0), rad = 24 + r() * 80, a0 = r() * 6.28;
    const pts = []; for (let k = 0; k < n; k++) { const a = a0 + (k / n) * 6.28 + r() * 0.6; pts.push([x + Math.cos(a) * rad * (0.5 + r()), y + Math.sin(a) * rad * (0.5 + r())]); }
    const v = r() < 0.5 ? 255 : 0, al = 0.035 + r() * 0.05;
    wrap(() => { g.fillStyle = `rgba(${v},${v},${v},${al})`; g.beginPath(); pts.forEach((p, k) => (k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fill(); });
  }
  for (let i = 0; i < 2600; i++) {         // fibres
    const x = r() * S, y = r() * S, a = r() * 6.28, l = 4 + r() * 18, v = r() < 0.55 ? 255 : 0, al = 0.025 + r() * 0.04;
    wrap(() => { g.strokeStyle = `rgba(${v},${v},${v},${al})`; g.lineWidth = 0.6 + r() * 0.8; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + (r() - 0.5) * 4, y + Math.sin(a) * l * 0.5 + (r() - 0.5) * 4, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); });
  }
  grainTex = new THREE.CanvasTexture(c);
  grainTex.wrapS = grainTex.wrapT = THREE.RepeatWrapping; grainTex.colorSpace = THREE.NoColorSpace;
  grainTex.anisotropy = 4; grainTex.generateMipmaps = true; grainTex.minFilter = THREE.LinearMipmapLinearFilter;
  return grainTex;
}

// ---------- paper(colour): the one material factory
const cache = new Map();
export function paper(colour, o = {}) {
  const key = colour + "|" + JSON.stringify(o);
  if (cache.has(key)) return cache.get(key);
  const m = new THREE.MeshStandardMaterial({ color: colour, roughness: 1, metalness: 0, flatShading: !!o.flat, side: o.double ? THREE.DoubleSide : THREE.FrontSide });
  if (o.emissive) { m.emissive = new THREE.Color(o.emissive); m.emissiveIntensity = o.emissiveIntensity ?? 1; }
  const u = { uGrain: { value: grain() }, uGS: { value: 1 / (o.tile ?? 9) }, uGA: { value: o.amount ?? 0.085 }, uBump: { value: o.bump ?? 0.05 } };
  m.userData.u = u;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vOP; varying vec3 vON;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvOP = position; vON = normal;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vOP; varying vec3 vON; uniform sampler2D uGrain; uniform float uGS, uGA, uBump;")
      .replace("#include <map_fragment>", `#include <map_fragment>
vec3 gbw = pow(abs(normalize(vON)), vec3(4.0)); gbw /= (gbw.x + gbw.y + gbw.z);
vec3 gq = vOP * uGS;
float gH = texture2D(uGrain, gq.yz).r * gbw.x + texture2D(uGrain, gq.xz).r * gbw.y + texture2D(uGrain, gq.xy).r * gbw.z;
diffuseColor.rgb *= (1.0 - uGA) + 2.0 * uGA * gH;`)
      .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
{ vec2 gD = vec2(dFdx(gH), dFdy(gH)) * uBump * 3.5;
  vec3 sX = dFdx(-vViewPosition), sY = dFdy(-vViewPosition);
  vec3 r1 = cross(sY, normal), r2 = cross(normal, sX); float fd = dot(sX, r1);
  normal = normalize(abs(fd) * normal - sign(fd) * (gD.x * r1 + gD.y * r2)); }`);
  };
  m.customProgramCacheKey = () => "paper";
  cache.set(key, m); return m;
}

function shadows(m, cast = true, receive = true) { m.castShadow = cast; m.receiveShadow = receive; return m; }

// ---------- card: a flat cut-out with a little thickness. shape = THREE.Shape or [[x, y], ...] in cm.
// The card lies in its local xy plane, centred on z, faces in `colour`, the cut edge paler (the white core).
export function shapeOf(pts) { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); return s; }
export function card(shape, colour, thickness = 0.1, o = {}) {
  const s = Array.isArray(shape) ? shapeOf(shape) : shape;
  const geo = new THREE.ExtrudeGeometry(s, { depth: thickness, bevelEnabled: false, curveSegments: o.curve ?? 8 });
  geo.translate(0, 0, -thickness / 2);
  const m = new THREE.Mesh(geo, [paper(colour, o.mat), paper(o.edge ?? edgeOf(colour))]);
  m.userData.dims = dimsOf(geo);
  return shadows(m, o.cast ?? true);
}
export function dimsOf(geo) { geo.computeBoundingBox(); const b = geo.boundingBox; return [b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z].map((v) => +v.toFixed(3)); }

// ---------- tube: a rolled or scored paper tube standing on y = 0. Faceted, never a smooth cylinder.
export function tube(rBottom, rTop, h, colour, o = {}) {
  const geo = new THREE.CylinderGeometry(rTop, rBottom, h, o.seg ?? 14, 1, !!o.open);
  geo.translate(0, h / 2, 0);
  const side = paper(colour, { flat: true, double: !!o.open, ...(o.mat || {}) });
  const cap = paper(o.cap ?? mixHex(colour, PAL.core, 0.25));
  const m = new THREE.Mesh(geo, o.open ? side : [side, cap, cap]);
  m.userData.dims = [2 * Math.max(rBottom, rTop), h, 2 * Math.max(rBottom, rTop)].map((v) => +v.toFixed(3));
  return shadows(m, o.cast ?? true);
}
// a disc of card: a very short tube whose side is the pale cut edge
export function disc(r, colour, thickness = 0.12, o = {}) {
  const geo = new THREE.CylinderGeometry(r, r, thickness, o.seg ?? 28, 1, false);
  geo.translate(0, thickness / 2, 0);
  const m = new THREE.Mesh(geo, [paper(o.edge ?? edgeOf(colour)), paper(colour, o.mat), paper(colour)]);
  m.userData.dims = [2 * r, thickness, 2 * r];
  return shadows(m, o.cast ?? true);
}
export function ring(rIn, rOut, colour, o = {}) {
  const geo = new THREE.RingGeometry(rIn, rOut, o.seg ?? 28, 1); geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, paper(colour, { double: true })); m.userData.dims = [2 * rOut, 0, 2 * rOut];
  return shadows(m, false);
}
// discs stacked like card layers: radii and thicknesses bottom to top
export function discStack(layers) {
  const g = new THREE.Group(); let y = 0;
  for (const [r, t, colour] of layers) { const d = disc(r, colour, t); d.position.y = y; y += t; g.add(d); }
  g.userData.dims = [2 * Math.max(...layers.map((l) => l[0])), y, 2 * Math.max(...layers.map((l) => l[0]))];
  return g;
}
// a folded box standing on y = 0
export function box(w, h, d, colour, o = {}) {
  const geo = new THREE.BoxGeometry(w, h, d); geo.translate(0, h / 2, 0);
  const m = new THREE.Mesh(geo, paper(colour, o.mat)); m.userData.dims = [w, h, d];
  return shadows(m, o.cast ?? true);
}
// a strip of card lying in its local xz plane from z = 0 to z = len (a tab, a hinge leaf)
export function strip(w, len, colour, thickness = 0.1) {
  const geo = new THREE.BoxGeometry(w, thickness, len); geo.translate(0, thickness / 2, len / 2);
  const m = new THREE.Mesh(geo, [paper(edgeOf(colour)), paper(edgeOf(colour)), paper(colour), paper(colour), paper(edgeOf(colour)), paper(edgeOf(colour))]);
  m.userData.dims = [w, thickness, len];
  return shadows(m);
}

// ---------- lit windows: unlit warm cut-outs, one instanced mesh per carrier. list = [{ p:[x,y,z], n:[x,z] (outward, horizontal), w, h, floor }]
const winGeo = new THREE.PlaneGeometry(1, 1);
const winMat = new THREE.MeshBasicMaterial({ color: "#ffffff", side: THREE.DoubleSide, toneMapped: false });
export function windows(list) {
  const im = new THREE.InstancedMesh(winGeo, winMat, list.length), o = new THREE.Object3D();
  list.forEach((w, i) => {
    o.position.set(w.p[0], w.p[1], w.p[2]); o.rotation.set(0, Math.atan2(w.n[0], w.n[1]), 0); o.scale.set(w.w, w.h, 1); o.updateMatrix();
    im.setMatrixAt(i, o.matrix); im.setColorAt(i, new THREE.Color(0, 0, 0));
  });
  im.userData.list = list; im.castShadow = false; im.receiveShadow = false; im.frustumCulled = false;
  return im;
}
const ON = new THREE.Color(), OFF = new THREE.Color("#1a1420"), tmp = new THREE.Color();
// light(i) returns 0..1 for each window
export function setWindows(im, light, colour = PAL.window, gain = 2.6) {
  ON.set(colour);
  let any = false;
  im.userData.list.forEach((w, i) => { const k = light(w, i); if (k > 0) any = true; tmp.copy(OFF).lerp(ON, clamp(k)); if (k > 0) tmp.multiplyScalar(1 + (gain - 1) * clamp(k)); im.setColorAt(i, tmp); });
  im.instanceColor.needsUpdate = true; im.visible = any;
  return any;
}

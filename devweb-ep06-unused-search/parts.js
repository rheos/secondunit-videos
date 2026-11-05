// devweb ep 6: shared stand-in builders for the station files. Holds no state and knows no station.
import * as THREE from "three";
import { panel } from "./kit/world.js";
import { colAt, worldDim } from "./timeline.js";

// state tables from the world plan: IDLE off-subject, REST calm, LIT what the line is about
export const PAPER = { IDLE: "#4a4b4d", REST: "#c9c8c4", LIT: "#e8e7e3" };
export const STICKER = { IDLE: "#58595b", REST: "#c9c8c4", LIT: "#efeeea" };
export const NAME = { IDLE: "#59616b", REST: "#92a3b5", LIT: "#ffffff" };
export const RIM = { IDLE: "#27333f", REST: "#3d566f", LIT: "#3d566f" };
export const BODY = { IDLE: "#0d141c", REST: "#0d141c", LIT: "#1b2a3b" };
export const PLATE = { IDLE: "#59616b", REST: "#c9d1d9", LIT: "#ffffff" };
export const DIGIT = { IDLE: "#3a424c", REST: "#8b949e", LIT: "#ffffff" };
export const states = (track, table) => track.map(([t, s]) => [t, table[s]]);

// a canvas panel with fog off. Size it for its longest text; text() reports anything that doesn't fit.
export function hero(wu, hu, ppu, draw) {
  const p = panel(wu, hu, ppu, draw);
  p.mesh.material.fog = false;
  p.wu = wu; p.hu = hu;
  return p;
}
export function staticPanel(wu, hu, ppu, draw, x, y, z, parent) {
  const p = hero(wu, hu, ppu, draw);
  p.set({});
  p.mesh.position.set(x, y, z);
  if (parent) parent.add(p.mesh);
  return p;
}
export function text(g, s, x, y, px, { c = "#22262b", w = 600, a = "left", maxX = g.canvas.width } = {}) {
  g.font = `${w} ${px}px 'IBM Plex Mono', monospace`;
  g.fillStyle = c; g.textAlign = a; g.textBaseline = "alphabetic";
  const mw = g.measureText(s).width, x0 = a === "center" ? x - mw / 2 : a === "right" ? x - mw : x;
  if (x0 < 0 || x0 + mw > maxX) { console.warn(`FIT: "${s}" ${x0.toFixed(0)}..${(x0 + mw).toFixed(0)} in ${maxX}`); (window.BP.FIT = window.BP.FIT || []).push(s); }
  g.fillText(s, x, y);
}

export const solid = (toon, w, h, d, color, x, y, z, parent) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(color, { fog: false }));
  m.position.set(x, y, z);
  if (parent) parent.add(m);
  return m;
};
export const basic = (color, extra) => new THREE.MeshBasicMaterial(Object.assign({ color, fog: false, transparent: true, depthWrite: false }, extra || {}));

// a thin white overlay frame; real film elements, drawn from t
export function frame(w, h, th, parent, x, y, z) {
  const mat = basic("#ffffff"), group = new THREE.Group();
  [[w, th, 0, h / 2], [w, th, 0, -h / 2], [th, h, -w / 2, 0], [th, h, w / 2, 0]].forEach(([a, b, px, py]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(a, b), mat); m.position.set(px, py, 0); group.add(m); });
  group.position.set(x, y, z);
  parent.add(group);
  return { group, set(a) { group.visible = a > 0.002; mat.opacity = a; } };
}
export function circleRing(r, th, parent, x, y, z) {
  const mat = basic("#ffffff"), mesh = new THREE.Mesh(new THREE.RingGeometry(r - th / 2, r + th / 2, 72), mat);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return { mesh, set(a) { mesh.visible = a > 0.002; mat.opacity = a; } };
}

// colour from a track, with the world's end dim (pass dim: false for what keeps its light)
export function paint(mat, track, t, { d = 0.25, dim = true } = {}) {
  const [r, g, b] = colAt(track, t, d), k = dim ? worldDim(t) : 1;
  mat.color.setRGB(r * k, g * k, b * k, THREE.SRGBColorSpace);
}
export function alpha(mesh, a) { mesh.visible = a > 0.002; mesh.material.opacity = a; }
// a solid that fades must not write depth while it does (kit rule, ep 1)
export function solidAlpha(mesh, a) { mesh.visible = a > 0.002; const m = mesh.material; m.transparent = a < 0.999; m.opacity = a; m.depthWrite = a > 0.98; }

// the top L units of a panel, the rest cut off: how paper feeds. Never accumulates.
export function revealTop(p, top, L) {
  const f = Math.max(0.0005, Math.min(1, L / p.hu)), map = p.mesh.material.map;
  p.mesh.scale.y = f; p.mesh.position.y = top - (p.hu * f) / 2;
  map.repeat.y = f; map.offset.y = 1 - f;
}
// the left fraction k of a panel: how a strip draws left to right
export function revealLeft(p, left, k) {
  const f = Math.max(0.0005, Math.min(1, k)), map = p.mesh.material.map;
  p.mesh.scale.x = f; p.mesh.position.x = left + (p.wu * f) / 2;
  map.repeat.x = f; map.offset.x = 0;
}
// dropped along y from above the frame in 0.18 s, then one impact
export function dropY(t, hit, base, from = 5) {
  const u = Math.max(0, Math.min(1, (t - (hit - 0.18)) / 0.18));
  return base + from * (1 - u * u);
}
export const impact = (t, hit, big = 1.07) => { const u = Math.max(0, Math.min(1, (t - hit) / 0.14)); return t < hit ? 1 : big + (1 - big) * u; };

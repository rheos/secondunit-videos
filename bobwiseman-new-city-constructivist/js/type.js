// Words as 3D objects: Anton glyph outlines (opentype.js) -> THREE.Shape -> ExtrudeGeometry.
// One geometry per (text, depth), cached. Units: 1 = cap height. Origin at the left of the baseline,
// or centred with { align: "center" }.
import * as THREE from "./lib/three.module.js";
import opentype from "./lib/opentype.module.js";

let font = null;
export async function loadFont(url) {
  const buf = await (await fetch(url)).arrayBuffer();
  font = opentype.parse(buf);
  return font;
}

const cache = new Map();

// opentype path commands -> THREE.ShapePath, y flipped (font y is down in getPath)
function toShapes(path) {
  const sp = new THREE.ShapePath();
  for (const c of path.commands) {
    if (c.type === "M") sp.moveTo(c.x, -c.y);
    else if (c.type === "L") sp.lineTo(c.x, -c.y);
    else if (c.type === "Q") sp.quadraticCurveTo(c.x1, -c.y1, c.x, -c.y);
    else if (c.type === "C") sp.bezierCurveTo(c.x1, -c.y1, c.x2, -c.y2, c.x, -c.y);
  }
  // TrueType outer contours run clockwise; THREE wants CCW for solids when isCCW=false is passed
  return sp.toShapes(false);
}

// Geometry for one line of text. tracking in cap-heights. Returns { geo, width, cap }.
export function textGeo(text, { depth = 0.12, tracking = 0.02, align = "left", bevel = 0 } = {}) {
  const key = `${text}|${depth}|${tracking}|${align}|${bevel}`;
  if (cache.has(key)) return cache.get(key);
  const size = 100;
  const cap = (font.tables.os2.sCapHeight || font.ascender * 0.7) / font.unitsPerEm * size;
  const geos = []; let x = 0;
  const glyphs = font.stringToGlyphs(text);
  for (let i = 0; i < glyphs.length; i++) {
    const g = glyphs[i];
    const p = g.getPath(x, 0, size);
    const shapes = toShapes(p);
    if (shapes.length) {
      const geo = new THREE.ExtrudeGeometry(shapes, { depth: depth * cap, bevelEnabled: bevel > 0, bevelThickness: bevel * cap, bevelSize: bevel * cap * 0.5, bevelSegments: 1, curveSegments: 6 });
      geos.push(geo);
    }
    const kern = i < glyphs.length - 1 ? font.getKerningValue(g, glyphs[i + 1]) : 0;
    x += (g.advanceWidth + kern) / font.unitsPerEm * size + tracking * cap;
  }
  const width = x - tracking * cap;
  const merged = mergeGeos(geos);
  merged.translate(align === "center" ? -width / 2 : 0, 0, 0);
  merged.scale(1 / cap, 1 / cap, 1 / cap);
  const out = { geo: merged, width: width / cap, cap: 1 };
  cache.set(key, out);
  return out;
}

// minimal BufferGeometry merge with groups kept (0 = faces, 1 = sides) so faces and sides can take different inks
function mergeGeos(geos) {
  const pos = [], groupsFace = [], groupsSide = [];
  for (const g of geos) {
    const gi = g.index ? g.toNonIndexed() : g;
    const p = gi.attributes.position.array;
    for (const gr of gi.groups) {
      const dst = gr.materialIndex === 0 ? groupsFace : groupsSide;
      dst.push(p.slice(gr.start * 3, (gr.start + gr.count) * 3));
    }
  }
  const face = concat(groupsFace), side = concat(groupsSide);
  const all = new Float32Array(face.length + side.length);
  all.set(face, 0); all.set(side, face.length);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(all, 3));
  geo.addGroup(0, face.length / 3, 0);
  geo.addGroup(face.length / 3, side.length / 3, 1);
  geo.computeBoundingSphere(); geo.computeBoundingBox();
  return geo;
}
function concat(arrs) {
  const n = arrs.reduce((s, a) => s + a.length, 0); const o = new Float32Array(n); let k = 0;
  for (const a of arrs) { o.set(a, k); k += a.length; }
  return o;
}

// A word as a mesh: face ink and side ink (the side reads as the card's thickness)
export function wordMesh(text, faceMat, sideMat, opts = {}) {
  const { geo, width } = textGeo(text, opts);
  const m = new THREE.Mesh(geo, [faceMat, sideMat || faceMat]);
  m.userData.width = width;
  return m;
}

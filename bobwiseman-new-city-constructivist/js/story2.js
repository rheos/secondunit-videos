// Version 2, after Robin's note on v1 (2026-11-12): the essence is real modelled objects lit from one side and
// thresholded into the three inks, type printed FLAT on cards and ribbons that the camera skims at grazing angles,
// and a wide Dutch-angle camera streaming through dense rows of objects. Proof shot first: the first sung line.
// Words and onset times come from work/words.js (gitignored). Pure function of song time t.
import * as THREE from "./lib/three.module.js";
import { textGeo } from "./type.js";
import { crane, merge, rng } from "./city.js";
import { inkMaterial, model, modelGeometry } from "./ink.js";

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
const easeIO = (x) => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const lerp = (a, b, k) => a + (b - a) * k;
const M = "assets/models/";
const BUILDINGS = ["tower-slim", "tower-crown", "office-a", "office-b", "office-c", "office-d", "flats-a", "flats-b", "flats-c", "flats-d", "factory"];

let shots = [], flat = {}, inks = {};

// flat printed word: glyph outlines as a flat mesh (no extrusion), lying in its local XY plane
function printWord(text, mat, cap = 1, { stretch = 1 } = {}) {
  const { geo, width } = textGeo(text.toUpperCase(), { depth: 0.001, align: "center" });
  const m = new THREE.Mesh(geo, mat); m.scale.set(cap, cap * stretch, cap); m.userData.width = width * cap; return m;
}

// instanced rows of shaded buildings along both sides of an avenue running down -z
async function rowsOfBuildings(g, mat, { seed = 1, x0 = 12, x1 = 160, z0 = 10, z1 = -600, h = [10, 30], gap = 4 } = {}) {
  const r = rng(seed);
  const geos = await Promise.all(BUILDINGS.map((b) => modelGeometry(`${M}${b}.glb`, 10)));
  const slots = geos.map(() => []);
  for (const side of [-1, 1]) for (let x = x0; x < x1; ) {
    let fp = 0;
    for (let z = z0; z > z1; ) {
      const k = Math.floor(r() * geos.length); const H = lerp(h[0], h[1], r()) * (geos[k].userData.footprint < 6 ? 1.6 : 1);
      const s = H / 10; const f = geos[k].userData.footprint * s;
      const m4 = new THREE.Matrix4().compose(new THREE.Vector3(side * (x + f / 2), 0, z - f / 2), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (Math.floor(r() * 4)) * Math.PI / 2, 0)), new THREE.Vector3(s, s, s));
      slots[k].push(m4); z -= f + gap * (0.5 + r()); fp = Math.max(fp, f);
    }
    x += fp + gap * 2;
  }
  geos.forEach((geo, k) => { if (!slots[k].length) return; const im = new THREE.InstancedMesh(geo, mat, slots[k].length);
    slots[k].forEach((m4, i) => im.setMatrixAt(i, m4)); im.frustumCulled = false; g.add(im); });
}

export async function setup({ scene, INK }) {
  const T = window.WORDS; const L = T.lines[0];
  inks = INK;
  flat = { cream: new THREE.MeshBasicMaterial({ color: INK.cream }), red: new THREE.MeshBasicMaterial({ color: INK.red }), black: new THREE.MeshBasicMaterial({ color: INK.black }) };
  for (const m of Object.values(flat)) { m.polygonOffset = true; m.polygonOffsetFactor = -1; m.polygonOffsetUnits = -1; }
  const onCream = inkMaterial({ hi: INK.cream, mid: INK.red, lo: INK.black, t1: 0.42, t2: 0.96, rough: 0.07 });
  const onCreamDark = inkMaterial({ hi: INK.red, mid: INK.black, lo: INK.black, t1: 0.2, t2: 0.55 });

  // ---- proof shot: cream paper; a red card lies down the street with the words printed across it; it ends in a
  // standing red slab carrying the last word. Camera skims the card low and rolled, then tilts up the slab.
  const g = new THREE.Group(); scene.add(g);
  const s0 = L[0].s - 0.45, sEnd = T.lines[1][0].s - 0.45;
  const v = 21; // camera speed along the card, units per second
  const camZ0 = 16;
  const zCam = (t) => { const tt = Math.min(t, L[L.length - 1].s); const z = camZ0 - v * (tt - s0);
    return t <= tt ? z : z - v * 0.9 * (1 - Math.exp(-(t - tt) / 0.9)); };
  const lead = 34; // a word sits this far ahead of the camera when it is sung
  const slabZ = zCam(L[L.length - 1].s) - 46, cardW = 22;
  // the card on the street, and the slab it turns into
  const card = new THREE.Mesh(new THREE.PlaneGeometry(cardW, camZ0 + 40 - slabZ), flat.red); card.rotation.x = -Math.PI / 2;
  card.position.set(0, 0.02, (camZ0 + 40 + slabZ) / 2); g.add(card);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(46, 70, 2), onCreamDark); slab.position.set(0, 35, slabZ - 1); g.add(slab);
  const slabFace = new THREE.Mesh(new THREE.PlaneGeometry(46, 70), flat.red); slabFace.position.set(0, 35, slabZ + 0.02); g.add(slabFace);
  // ruled bars across the street at a slant (black strips with a cream rule)
  for (const [z, a, w] of [[-8, 0.5, 2.2], [-60, -0.42, 3], [-110, 0.35, 1.6]]) {
    const b = new THREE.Mesh(new THREE.PlaneGeometry(400, w), flat.black); b.rotation.set(-Math.PI / 2, 0, a); b.position.set(0, 0.03, z); g.add(b);
    const rl = new THREE.Mesh(new THREE.PlaneGeometry(400, w * 0.12), flat.cream); rl.rotation.set(-Math.PI / 2, 0, a); rl.position.set(0, 0.04, z + w * 0.3); g.add(rl);
  }
  // words printed across the card like road markings, stretched along the street so they read at a grazing angle
  const words = [];
  L.forEach((w, i) => {
    const last = i === L.length - 1;
    if (last) { const m = printWord(w.w, flat.cream, 1); const cap = 40 / m.userData.width; m.scale.setScalar(cap); m.position.set(0, 38, slabZ + 0.06); m.userData.s = w.s; m.userData.slab = true; g.add(m); words.push(m); return; }
    const m = printWord(w.w, flat.cream, 1, { stretch: 1.9 });
    const cap = Math.min(6.2, (cardW * 0.82) / (m.userData.width)); m.scale.set(cap, cap * 1.9, cap);
    m.rotation.x = -Math.PI / 2; m.position.set(0, 0.06, zCam(w.s) - lead); m.userData.s = w.s; g.add(m); words.push(m);
  });
  // two-word rows sung close together share a row: put them side by side
  for (let i = 1; i < words.length - 1; i++) if (L[i].s - L[i - 1].s < 0.35) {
    const a = words[i - 1], b = words[i]; b.position.z = a.position.z;
    const wa = a.userData.width * a.scale.x, wb = b.userData.width * b.scale.x, gap = 1.2, tot = wa + gap + wb;
    a.position.x = -tot / 2 + wa / 2; b.position.x = tot / 2 - wb / 2;
  }
  await rowsOfBuildings(g, onCream, { seed: 3, x0: cardW / 2 + 10, z0: camZ0 + 10, z1: -700, h: [7, 20] });
  // pylons and water towers standing in the gaps, cranes by the slab
  const pyl = await modelGeometry(`${M}pylon-a.glb`, 34), wt = await modelGeometry(`${M}water-tower.glb`, 18);
  const r = rng(8);
  const addInst = (geo, mat, list) => { const im = new THREE.InstancedMesh(geo, mat, list.length); list.forEach(([x, z, ry], i) => im.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), new THREE.Vector3(1, 1, 1)))); im.frustumCulled = false; g.add(im); };
  addInst(pyl, onCream, [[-cardW / 2 - 6, -70, 0.3], [cardW / 2 + 6, -130, -0.2], [-cardW / 2 - 6, -190, 0.1], [cardW / 2 + 6, -250, 0]]);
  addInst(wt, onCream, Array.from({ length: 6 }, (_, i) => [(i % 2 ? 1 : -1) * (cardW / 2 + 5 + r() * 3), -40 - i * 45, r() * 3]));
  const cr = []; const rc = rng(5); cr.push(...crane(rc, -32, slabZ + 6, 2.2, 0.35), ...crane(rc, 36, slabZ - 14, 2.0, 2.6));
  g.add(new THREE.Mesh(merge(cr), onCream));

  const lastS = L[L.length - 1].s;
  shots.push({ g, ground: "cream", t: -1, update(t, cam) {
    // the slab rises out of the street as the last word comes; it is full height on the onset
    const rise = easeIO((t - (lastS - 0.95)) / 0.95);
    slab.scale.y = Math.max(0.001, rise); slab.position.y = 35 * rise; slabFace.scale.y = slab.scale.y; slabFace.position.y = 35 * rise;
    for (const m of words) {
      if (m.userData.slab) { m.position.y = 38 - 70 * (1 - rise); m.visible = rise > 0.98; continue; } const k = clamp((t - m.userData.s) / (2 / 24) + 1); m.visible = k > 0;
      const pop = 1 + 0.12 * (1 - ease((t - m.userData.s) / 0.12)); m.userData.base ??= m.scale.clone(); m.scale.copy(m.userData.base).multiplyScalar(pop); }
    const z = zCam(t);
    const up = easeIO((t - (lastS - 0.9)) / 1.4);          // tilt up the slab for the last word
    const pos = new THREE.Vector3(Math.sin(t * 0.9) * 1.2, lerp(4.6, 6, up), z);
    const at = new THREE.Vector3(lerp(1.5, 0, up), lerp(0, 30, up), z - lerp(40, 46, up));
    cam.position.copy(pos); cam.up.set(0, 1, 0); cam.lookAt(at); cam.rotateZ(lerp(-0.42, -0.12, up) + Math.sin(t * 0.7) * 0.03);
    cam.fov = 66; cam.updateProjectionMatrix();
    return { focus: lerp(32, 46, up), aperture: 1.3 };
  } });
}

export function at(t, { camera }) {
  const cur = shots[0]; cur.g.visible = true;
  const look = cur.update(t, camera) || {};
  return { ground: cur.ground, focus: look.focus ?? 40, aperture: look.aperture ?? 1 };
}

// the models, shaded, for sign-off
export async function lineup({ scene, camera, INK }) {
  const mat = inkMaterial({ hi: INK.cream, mid: INK.red, lo: INK.black, t1: 0.42, t2: 0.96, rough: 0.07 });
  const g = new THREE.Group(); scene.add(g);
  const names = [...BUILDINGS, "pylon-a", "pylon-b", "water-tower", "dish", "truss", "figure", "worker", "person-a", "person-b"];
  const hs = { "pylon-a": 26, "pylon-b": 26, "water-tower": 14, dish: 7, truss: 3, figure: 4, worker: 4, "person-a": 4, "person-b": 4 };
  const rows = [names.slice(0, 11), names.slice(11)];
  for (const [ri, row] of rows.entries()) {
    const ms = []; let w = 0;
    for (const n of row) { const m = await model(`${M}${n}.glb`, mat, hs[n] || 14); m.userData.f = Math.max(4, m.userData.footprint); ms.push(m); w += m.userData.f + 3; }
    let x = -w / 2; for (const m of ms) { m.position.set(x + m.userData.f / 2, ri ? 0 : 30, 0); m.rotation.y = 0.6; g.add(m); x += m.userData.f + 3; }
  }
  camera.fov = 40; camera.updateProjectionMatrix(); camera.position.set(0, 30, 150); camera.lookAt(0, 22, 0);
  return { ground: "cream", focus: 120, aperture: 0 };
}

// Version 2, after Robin's note on v1 (2026-11-12): the essence is real modelled objects lit from one side and
// thresholded into the three inks, type printed FLAT on cards and ribbons that the camera skims at grazing angles,
// and a wide Dutch-angle camera streaming through dense rows of objects. Proof shot first: the first sung line.
// Words and onset times come from work/words.js (gitignored). Pure function of song time t.
import * as THREE from "./lib/three.module.js";
import { textGeo } from "./type.js";
import { crane, merge, rng, person } from "./city.js";
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
  // flat inks share the palette's Color objects, so the colour arc reaches them every frame
  flat = Object.fromEntries(["cream", "red", "black", "motif"].map((k) => { const m = new THREE.MeshBasicMaterial(); m.color = INK[k]; return [k, m]; }));
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
  const cr = [], loads = []; const rc = rng(5);
  for (const c of [crane(rc, -32, slabZ + 6, 2.2, 0.35), crane(rc, 36, slabZ - 14, 2.0, 2.6)]) { cr.push(...c); loads.push(c.load); }
  g.add(new THREE.Mesh(merge(cr), onCream));
  g.add(new THREE.Mesh(merge(loads), inkMaterial({ hi: INK.cream, mid: INK.motif, lo: INK.black, t1: 0.0, t2: 0.9, rough: 0.05 }))); // first yellow: the loads

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
  await shotB(scene, INK); await shotC(scene, INK); await shotD(scene, INK);
}

export function at(t, { camera }) {
  let cur = shots[0];
  for (const sh of shots) if (t >= sh.t) cur = sh;
  for (const sh of shots) sh.g.visible = sh === cur;
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

// ---------------------------------------------------------------------------------------------------------------
// Lines 2 to 4 in the same language. Shared helpers.
const cut = (i) => window.WORDS.lines[i][0].s - 0.45;      // cut a little before a line's first syllable
const stamp = (m, t, s) => {                                 // a printed word appears on its onset with a small pop
  m.userData.base ??= m.scale.clone(); m.visible = t >= s - 1 / 24;
  m.scale.copy(m.userData.base).multiplyScalar(1 + 0.12 * (1 - ease((t - s) / 0.12)));
};
const boxAt = (w, h, d, x, y, z) => { const b = new THREE.BoxGeometry(w, h, d); b.translate(x, y + h / 2, z); return b; };
const flatOn = (m, g) => { m.rotation.x = -Math.PI / 2; g.add(m); return m; };

// ---- line 2, blue paper: shaded gateways, one word on each lintel; on the last word every door in a whole field of
// doorways swings open in a wave, showing the yellow inside.
async function shotB(scene, INK) {
  const L = window.WORDS.lines[1]; const s0 = cut(1), sDoor = L[L.length - 1].s;
  const g = new THREE.Group(); scene.add(g);
  const onBlue = inkMaterial({ hi: INK.cream, mid: INK.black, lo: INK.black, t1: 0.5, t2: 0.5, rough: 0.06 });
  const leafInk = inkMaterial({ hi: INK.cream, mid: INK.black, lo: INK.black, t1: 0.5, t2: 0.5, rough: 0.06, side: THREE.DoubleSide });
  const leafYellow = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }); leafYellow.color = INK.motif;
  const gap = 24, ow = 10, oh = 13, post = 1.6, lint = 4.6, D = 1.4;
  // words sung less than 0.3 s apart share a gate; gates are spaced by the time between them (constant speed)
  const gateOf = []; const gates = [];
  L.forEach((w, i) => { if (i && w.s - L[i - 1].s < 0.3) { gateOf.push(gates.length - 1); gates[gates.length - 1].words.push(i); } else { gateOf.push(gates.length); gates.push({ s: w.s, words: [i] }); } });
  const V = 85, AHEAD = 28, BACK = 11;   // speed, distance to a gate when its first word lands, camera behind the path point
  const gateZ = []; gates.forEach((gt, k) => gateZ.push(k ? gateZ[k - 1] - Math.max(18, V * (gt.s - gates[k - 1].s)) : -18));
  const lastZ = gateZ[gateZ.length - 1];
  const keys = gates.map((gt, k) => [gt.s, gateZ[k] + AHEAD - BACK]);
  keys.push([sDoor, lastZ + AHEAD - BACK - 9]);   // ease up in front of the last gate until its last word lands
  const camZ = (t) => {
    if (t <= keys[0][0]) return keys[0][1] + V * (keys[0][0] - t);
    for (let i = 0; i < keys.length - 1; i++) if (t < keys[i + 1][0]) return lerp(keys[i][1], keys[i + 1][1], (t - keys[i][0]) / (keys[i + 1][0] - keys[i][0]));
    const [tl, zl] = keys[keys.length - 1]; return zl - V * 1.1 * (1 - Math.exp(-(t - tl) / 1.1));
  };
  // one doorframe geometry, instanced: the avenue gates plus a field of them to the horizon
  const frameGeo = merge([boxAt(post, oh + lint, D, -(ow + post) / 2, 0, 0), boxAt(post, oh + lint, D, (ow + post) / 2, 0, 0), boxAt(ow + 2 * post, lint, D, 0, oh, 0)]);
  const spots = gateZ.map((z) => [0, z, 0]);   // the avenue gates first, then the field
  const r = rng(21);
  for (let z = -40; z > -720; z -= 26) for (let x = -280; x <= 280; x += 21) { if (Math.abs(x) < 46 && z > lastZ - 60) continue; spots.push([x + (r() - .5) * 5, z + (r() - .5) * 6, (r() - .5) * 0.25]); }
  const frames = new THREE.InstancedMesh(frameGeo, onBlue, spots.length); frames.frustumCulled = false;
  const q = new THREE.Quaternion(), e = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3(), m4 = new THREE.Matrix4();
  spots.forEach(([x, z, ry], i) => frames.setMatrixAt(i, m4.compose(v.set(x, 0, z), q.setFromEuler(e.set(0, ry, 0)), one)));
  g.add(frames);
  // door leaves: hinge at the post, the back face (-z, BoxGeometry group 5) is yellow and shows once it swings out
  const lw = ow / 2 - 0.15;
  const leafL = new THREE.BoxGeometry(lw, oh - 0.2, 0.35); leafL.translate(lw / 2, oh / 2, 0);
  const leafR = new THREE.BoxGeometry(lw, oh - 0.2, 0.35); leafR.translate(-lw / 2, oh / 2, 0);
  const mats = [leafInk, leafInk, leafInk, leafInk, leafInk, leafYellow];
  const leaves = [new THREE.InstancedMesh(leafL, mats, spots.length), new THREE.InstancedMesh(leafR, mats, spots.length)];
  for (const lm of leaves) { lm.frustumCulled = false; g.add(lm); }
  // words printed on the avenue lintels
  const words = L.map((w) => { const m = printWord(w.w, flat.cream, 1); m.userData.s = w.s; g.add(m); return m; });
  gates.forEach((gt, k) => {
    const ms = gt.words.map((i) => words[i]); const gapW = 0.35;
    const tot = ms.reduce((a, m) => a + m.userData.width, 0) + gapW * (ms.length - 1);
    const cap = Math.min(lint * 0.6, (ow + 2 * post) * 0.84 / tot); let x = -tot * cap / 2;
    for (const m of ms) { m.scale.setScalar(cap); m.position.set(x + m.userData.width * cap / 2, oh + lint / 2 - cap / 2, gateZ[k] + D / 2 + 0.05); x += (m.userData.width + gapW) * cap; }
  });
  await rowsOfBuildings(g, onBlue, { seed: 9, x0: 2, z0: -760, z1: -1300, h: [10, 26] });
  shots.push({ g, ground: "red", t: s0, update(t, cam) {
    for (const m of words) stamp(m, t, m.userData.s);
    spots.forEach(([x, z, ry], i) => {
      const d = Math.hypot(x, z - lastZ); const a = 1.35 * ease((t - (sDoor - 0.05) - d / 110) / 0.55);
      const c = Math.cos(ry), sn = Math.sin(ry); const hx = (ow / 2) * c, hz = -(ow / 2) * sn;
      leaves[0].setMatrixAt(i, m4.compose(v.set(x - hx, 0, z - hz), q.setFromEuler(e.set(0, ry - a, 0)), one));
      leaves[1].setMatrixAt(i, m4.compose(v.set(x + hx, 0, z + hz), q.setFromEuler(e.set(0, ry + a, 0)), one));
    });
    leaves[0].instanceMatrix.needsUpdate = leaves[1].instanceMatrix.needsUpdate = true;
    const z = camZ(t); const rise = easeIO((t - (sDoor + 0.25)) / 2.4); const k = clamp((t - s0) / (cut(2) - s0));
    cam.position.set(Math.sin(t * 1.2) * 0.6, lerp(6.4, 34, rise), z + lerp(11, 30, rise));
    cam.up.set(0, 1, 0); cam.lookAt(0, lerp(12.5, 0, rise), z - lerp(40, 70, rise));
    cam.rotateZ(lerp(-0.3, 0.14, k) + Math.sin(t * 0.8) * 0.03); cam.fov = 60; cam.updateProjectionMatrix();
    return { focus: lerp(34, 75, rise), aperture: 1.1 };
  } });
}

// ---- line 3, charcoal paper: two shaded bars cross; the words are printed along them; the small word is a tag that
// shrinks when the last word lands. One yellow rule runs along the second bar.
async function shotC(scene, INK) {
  const L = window.WORDS.lines[2]; const s0 = cut(2), sLast = L[L.length - 1].s;
  const g = new THREE.Group(); scene.add(g);
  const onDark = inkMaterial({ hi: INK.cream, mid: INK.red, lo: INK.black, t1: 0.0, t2: 0.65, rough: 0.06 });
  const C = new THREE.Vector3(0, 0, -30), BW = 8, BH = 1.4;
  const bar = (ang, y, len = 340, w = BW) => { const h = new THREE.Group(); h.rotation.y = ang; h.position.set(C.x, y, C.z); g.add(h);
    const b = new THREE.Mesh(new THREE.BoxGeometry(len, BH, w), onDark); b.position.y = BH / 2; h.add(b); h.userData.top = BH + 0.02; return h; };
  const A = bar(0.45, 0), B = bar(-0.62, BH);
  for (const [ang, dz, w] of [[1.2, -90, 3], [-0.15, -150, 4], [0.9, 40, 2.5], [-1.1, -220, 3]]) { const h = bar(ang, 0, 420, w); h.position.z += dz; }
  const along = (h, m, x, z = 0) => { m.rotation.x = -Math.PI / 2; m.position.set(x, h.userData.top + 0.03, z); h.add(m); return m; };
  // rules: cream along bar A, the yellow one along bar B
  const rule = (h, mat, z, w) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(340, w), mat); along(h, p, 0, z); };
  rule(A, flat.cream, BW * 0.38, 0.3); rule(B, flat.motif, -BW * 0.4, 0.45);
  const [wWhere, wWar, wMeans, wLess] = L;
  const fit = (m, cap) => { m.scale.setScalar(cap); return m; };
  const mWhere = along(A, fit(printWord(wWhere.w, flat.cream, 1), 5.2), -26);
  const tag = new THREE.Group(); along(A, tag, -9);
  const tagCard = new THREE.Mesh(new THREE.PlaneGeometry(13, 7.4), flat.cream); tag.add(tagCard);
  const mWar = printWord(wWar.w, flat.black, 1); mWar.scale.setScalar(5); mWar.position.set(0, -2.5, 0.02); tag.add(mWar);
  const mMeans = along(B, fit(printWord(wMeans.w, flat.cream, 1), 6.4), -15);
  const mLess = along(B, fit(printWord(wLess.w, flat.cream, 1), 6.4), 13);
  for (const m of [mWhere, mMeans, mLess]) m.position.z += 3.2;     // baseline sits below the bar's centre line
  await rowsOfBuildings(g, onDark, { seed: 13, x0: 2, z0: -200, z1: -900, h: [8, 24] });
  shots.push({ g, ground: "black", t: s0, update(t, cam) {
    stamp(mWhere, t, wWhere.s); stamp(mMeans, t, wMeans.s); stamp(mLess, t, wLess.s);
    tag.visible = t >= wWar.s - 1 / 24;
    const pop = 1 + 0.12 * (1 - ease((t - wWar.s) / 0.12)); tag.scale.setScalar(pop * lerp(1, 0.32, ease((t - (sLast - 0.05)) / 0.9)));
    const k = clamp((t - s0) / (cut(3) - s0)); const th = lerp(-0.42, 0.12, easeIO(k));
    const R = lerp(50, 38, easeIO(k)), h = lerp(30, 21, easeIO(k));
    cam.position.set(C.x + R * Math.sin(th), h, C.z + R * Math.cos(th)); cam.up.set(0, 1, 0); cam.lookAt(C.x - 4, 0, C.z - 6);
    cam.rotateZ(lerp(0.34, 0.16, easeIO(k))); cam.fov = 52; cam.updateProjectionMatrix();
    return { focus: cam.position.distanceTo(C), aperture: 1.0 };
  } });
}

// ---- line 4, cream paper: the biggest word printed across a blue card on the ground, a shaded crowd standing on it,
// the camera rising from street level until the word reads under the crowd. The word is printed in the motif yellow.
async function shotD(scene, INK) {
  const L = window.WORDS.lines[3]; const s0 = cut(3);
  const g = new THREE.Group(); scene.add(g);
  const onCream = inkMaterial({ hi: INK.cream, mid: INK.red, lo: INK.black, t1: 0.42, t2: 0.96, rough: 0.07 });
  const cardZ = -85, cardW = 176, cardD = 66;
  flatOn(new THREE.Mesh(new THREE.PlaneGeometry(cardW, cardD), flat.red), g).position.set(0, 0.02, cardZ);
  const [wAnd, wPeople, wMore] = L;
  const mPeople = printWord(wPeople.w, flat.motif, 1); mPeople.scale.setScalar(Math.min(44, cardW * 0.86 / mPeople.userData.width));
  flatOn(mPeople, g).position.set(0, 0.06, cardZ + mPeople.scale.x * 0.5);
  const mAnd = printWord(wAnd.w, flat.red, 1); mAnd.scale.setScalar(12); flatOn(mAnd, g).position.set(-34, 0.06, cardZ + cardD / 2 + 22);
  const mMore = printWord(wMore.w, flat.red, 1); mMore.scale.setScalar(16); flatOn(mMore, g).position.set(40, 0.06, cardZ - cardD / 2 - 12);
  // the crowd: two poses instanced
  const pg = [merge(person(0, 0, 1, 0, 0)), merge(person(0, 0, 1, 1, 0))];
  const r = rng(77); const lists = [[], []];
  for (let z = 12; z > -300; z -= 7.5 + r() * 2.5) for (let x = -180; x < 180; x += 5.5 + r() * 3) {
    if (r() < 0.12) continue; const pose = r() < 0.3 ? 1 : 0; const s = 4.2 + r() * 0.8;
    lists[pose].push(new THREE.Matrix4().compose(new THREE.Vector3(x + r() * 0.8, 0, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (r() - .5) * 0.8, 0)), new THREE.Vector3(s, s, s)));
  }
  lists.forEach((l, k) => { const im = new THREE.InstancedMesh(pg[k], onCream, l.length); l.forEach((mm, i) => im.setMatrixAt(i, mm)); im.frustumCulled = false; g.add(im); });
  await rowsOfBuildings(g, onCream, { seed: 17, x0: 2, z0: -320, z1: -1000, h: [10, 30] });
  const words = [[mAnd, wAnd.s], [mPeople, wPeople.s], [mMore, wMore.s]];
  shots.push({ g, ground: "cream", t: s0, update(t, cam) {
    for (const [m, s] of words) stamp(m, t, s);
    const rise = ease((t - s0) / 3.8); const drift = Math.max(0, t - s0 - 3.8);
    cam.position.set(Math.sin(t * 0.6) * 1.5, lerp(2.4, 96, rise) + drift * 2, lerp(16, 46, rise) + drift * 1.5);
    cam.up.set(0, 1, 0); cam.lookAt(0, lerp(3, 0, rise), lerp(-50, cardZ - 4, rise));
    cam.rotateZ(lerp(-0.36, -0.07, rise)); cam.fov = 54; cam.updateProjectionMatrix();
    return { focus: cam.position.distanceTo(new THREE.Vector3(0, 0, cardZ)), aperture: lerp(1.6, 0.6, rise) };
  } });
}

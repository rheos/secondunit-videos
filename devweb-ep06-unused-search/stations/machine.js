// The Machine: the tool. One slot in, one spout out, two searches inside. A spring holds the lever on the old search
// (the default) and only a request with a tab throws it; the clockwork on the left runs with steam for the old search,
// the ringed core on the right lights blue for the new one (the film's one colour beat, hold 19). The assembly is the
// approved motion test's (design/machine-test.html) inside one group at MACHINE_S scale at MACHINE_AT, plus what the
// film adds: a plinth on the grid, the errors bin, the counter shelf, the placard on its rods, the lamp's stalk and bulb.
// Every transform below is written from t alone (timeline.js: lever, knocks, coreGlow, newPlate, runOn, CARD_PLAN):
// no state between frames, every value reset before any branch.
import * as THREE from "three";
import { C, INK, forge } from "./forge.js";
import { CARD_PLAN, CORE_LIT, LEVER_THROWS, MACHINE_AT, MACHINE_S, ML, PLATE_HIT, PUFFS, T, TAG_SWING, binOut, coreGlow, io, knocks, lever, mix, mw, newPlate, r01, runOn, runWork, settle, spanAlpha, ss, worldDim } from "../timeline.js";

const BLUE = "#4f93d6";
const TH = 0.72, LEAN = 0.6; // the lever's half-throw and its lean out of the plate
const PLACARD_W = 1.5; // the description placard's width (its centre is ML.placard; camera-set.mjs's box should carry 0.75 * S)
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const col = (a, b, k) => new THREE.Color(a).lerp(new THREE.Color(b), Math.max(0, Math.min(1, k)));

export let group = null, bulb = null;
export const materials = []; // every machine material with its base colour (dim multiplies them; a few are set by hand each frame)
let dimK = 1;
export const dim = (k) => { dimK = k; };

let F, leverG, knobL, springG, ANCH, tagHang, tag, tagGlow, G1, G2, G3, belG, pNew, pNewPaper, core, coreHull, rings, halo, pilot, feeler, pDesc, descPaper, descMark, placardG, binHinge, puffs = [];
const faded = []; // groups that fade: their materials are their own (kit rule: a shared material fades everything)

const leverAt = (d, th) => V3(ML.pivot[0] - Math.sin(th) * Math.cos(LEAN) * d, ML.pivot[1] + Math.cos(th) * Math.cos(LEAN) * d, ML.pivot[2] + Math.sin(LEAN) * d);
const thAt = (t) => TH - 2 * TH * lever(t) - 0.06 * knocks(t);

// a soft round falloff, for light that spills rather than paints a rectangle
function radialTex(stops, size = 256) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const x = c.getContext("2d"), g = x.createRadialGradient(size / 2, size / 2, size / 32, size / 2, size / 2, size / 2);
  stops.forEach(([s, v]) => g.addColorStop(s, v));
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const glowSprite = (color, size) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTex([[0, color + "cc"], [1, color + "00"]]), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, opacity: 0 })); s.scale.set(size, size, 1); s.material.userData.own = true; return s; };
// a straight rod between two points
function rod(a, b, r, color, parent, th = 0.014) {
  const A = V3(...a), B = V3(...b), d = B.clone().sub(A), m = F.add(new THREE.CylinderGeometry(r, r, d.length(), 12), color, parent, th);
  m.position.copy(A).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize());
  return m;
}
// a group whose materials are its own, so it can fade (opacity on every one, depth written only when nearly solid)
function own(g) {
  g.traverse((o) => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; } });
  faded.push(g);
  return g;
}
function fade(g, a) {
  g.visible = a > 0.002;
  g.traverse((o) => { if (o.material) { o.material.opacity = a; o.material.depthWrite = a > 0.98; } });
}
// a hole cut into a toon surface: fragments inside the world box [x0, x1, y0, y1, z0, z1] are discarded. The errors boss
// is sunk into the foot trunk and the belly, whose surfaces pass through its opening (the trunk's front is 0.09 behind the
// boss face at the bin's x, the belly bulges 0.27 past it at the top); without the cut they cover the tipped bin's bed.
function cut(mesh, box) {
  const [x0, x1, y0, y1, z0, z1] = box.map((v) => v.toFixed(4)), m = mesh.material;
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vCut;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvCut = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vCut;").replace("#include <clipping_planes_fragment>", `if (vCut.x > ${x0} && vCut.x < ${x1} && vCut.y > ${y0} && vCut.y < ${y1} && vCut.z > ${z0} && vCut.z < ${z1}) discard;\n#include <clipping_planes_fragment>`);
  };
  m.customProgramCacheKey = () => `cut ${box.join(",")}`;
}
function canvasFace(w, h, draw, parent, x, y, z) {
  const c = document.createElement("canvas"); c.width = Math.round(w * 300); c.height = Math.round(h * 300);
  draw(c.getContext("2d"), c.width, c.height);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: false }));
  m.position.set(x, y, z); parent.add(m); return m;
}

export function build(scene, { toon }) {
  group = new THREE.Group(); group.position.set(...MACHINE_AT); group.scale.setScalar(MACHINE_S); scene.add(group);
  const inkMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide, fog: false });
  F = forge(THREE, toon, inkMat, group);
  const { add, sweep, ribs, horn, plate, rivet, mkPuff, gear, spring, curveFn, RoundedBoxGeometry } = F;
  const CX = 0.15, BZ = -2.6;

  // ---------- the plinth (new): two riveted steel steps on the grid under the foot flare ----------
  const drum = add(new THREE.CylinderGeometry(1.375, 1.375, 0.625, 64), C.bodyDark); drum.position.set(CX, -1.2125, BZ);
  const step = add(new THREE.CylinderGeometry(1.69, 1.69, 0.15, 64), C.bodyDark); step.position.set(CX, -1.45, BZ);
  for (const [r, y] of [[1.375, -0.9], [1.69, -1.375]]) { const rim = add(new THREE.TorusGeometry(r, 0.05, 12, 96), C.rim, group, 0.02); rim.rotation.x = Math.PI / 2; rim.position.set(CX, y, BZ); }
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; rivet(CX + Math.sin(a) * 1.39, -1.1, BZ + Math.cos(a) * 1.39, 0.05); }

  // ---------- the body, as the test ----------
  // the foot: a flared trunk on the plinth
  const foot = add(sweep([[CX, -0.9, BZ], [CX, 0.2, BZ], [CX + 0.03, 1.35, BZ]], curveFn([[0, 1.02], [0.12, 0.86], [0.5, 0.58], [1, 0.66]]), { segs: 40 }).geo, C.bodyDark);
  for (let k = 0; k < 9; k++) { const a = -0.9 + (k / 8) * 1.8; rivet(CX + Math.sin(a) * 0.93, -0.72, BZ + Math.cos(a) * 0.93); }
  // the belly: one lumpy pot, leaning a little
  const bodyR = curveFn([[0, 0.5], [0.1, 0.98], [0.36, 1.24], [0.6, 1.03], [0.78, 1.1], [0.92, 0.74], [1, 0.03]]);
  const body = sweep([[CX, 1.2, BZ + 0.04], [CX - 0.06, 2.2, BZ], [CX + 0.05, 3.2, BZ], [CX - 0.04, 4.1, BZ + 0.03], [CX + 0.06, 4.86, BZ + 0.08]], bodyR, { segs: 110, radial: 56 });
  const belly = add(body.geo, C.body, group, 0.045);
  // the errors boss's opening is cut into both (test-local: the boss's 0.7 x 0.52 footprint, from the cavity's back forward)
  { const [x0, y0, z0] = mw([ML.bin[0] - 0.35, ML.bin[1] - 0.26, ML.bin[2] - 0.21]), [x1, y1, z1] = mw([ML.bin[0] + 0.35, ML.bin[1] + 0.26, ML.bin[2] + 0.6]); cut(foot, [x0, x1, y0, y1, z0, z1]); cut(belly, [x0, x1, y0, y1, z0, z1]); }
  // seams of rivets round the belly (front half)
  for (const [u, n] of [[0.2, 13], [0.66, 12]]) {
    const c = body.curve.getPointAt(u), r = bodyR(u) + 0.01;
    for (let k = 0; k < n; k++) { const a = -1.25 + (k / (n - 1)) * 2.5; rivet(c.x + Math.sin(a) * r, c.y, c.z + Math.cos(a) * r); }
  }

  // ---------- the switch plate: the hero ----------
  const GY = 3.25, GZ = BZ + 1.33;
  const housing = add(new THREE.CylinderGeometry(0.74, 0.86, 0.5, 48), C.bodyDark); housing.rotation.x = Math.PI / 2; housing.position.set(CX, GY, GZ - 0.2);
  const bezel = add(new THREE.TorusGeometry(0.7, 0.085, 16, 64), C.rim); bezel.position.set(CX, GY, GZ + 0.05);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.66, 64), new THREE.MeshBasicMaterial({ color: "#0c1118", fog: false })); face.position.set(CX, GY, GZ + 0.056); group.add(face);
  for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; rivet(CX + Math.cos(a) * 0.9, GY + Math.sin(a) * 0.9, GZ - 0.34, 0.04); }
  const PV = ML.pivot;
  for (let k = 0; k <= 24; k++) { // an instrument scale: fine ticks, a long one every fourth, a white stop at each end
    const a = Math.PI / 2 + TH - (2 * TH * k) / 24, end = k === 0 || k === 24, long = k % 4 === 0;
    const tk = new THREE.Mesh(new THREE.PlaneGeometry(end ? 0.045 : 0.014, end ? 0.15 : long ? 0.1 : 0.05), new THREE.MeshBasicMaterial({ color: end ? "#ffffff" : long ? "#8b97a6" : "#566373", fog: false }));
    const rr = 0.72 - (end ? 0 : long ? 0.025 : 0.05); tk.position.set(PV[0] + Math.cos(a) * rr, PV[1] + Math.sin(a) * rr, GZ + 0.06); tk.rotation.z = a - Math.PI / 2; group.add(tk);
  }
  leverG = new THREE.Group(); leverG.position.set(...PV); group.add(leverG);
  const arm = new THREE.Group(); arm.rotation.x = LEAN; leverG.add(arm);
  const rodL = add(new THREE.CylinderGeometry(0.05, 0.07, 1.0, 18), C.rim, arm, 0.016); rodL.position.y = 0.5;
  knobL = add(new THREE.SphereGeometry(0.15, 22, 16), C.plate, arm, 0.02); knobL.position.y = 1.05; knobL.material.userData.own = true;
  const boss = add(new THREE.CylinderGeometry(0.17, 0.2, 0.16, 28), C.pipe, group, 0.018); boss.rotation.x = Math.PI / 2; boss.position.set(PV[0], PV[1], GZ + 0.1);
  // the spring: a unit coil along +x, placed and stretched between its post and the lever each frame
  ANCH = V3(...ML.anchor);
  const post = add(new THREE.CylinderGeometry(0.045, 0.06, 0.5, 14), C.pipe, group, 0.014); post.rotation.x = Math.PI / 2; post.position.set(ANCH.x, ANCH.y, ANCH.z - 0.22);
  const postCap = add(new THREE.SphereGeometry(0.07, 14, 10), C.rim, group, 0.014); postCap.position.copy(ANCH);
  const cpts = []; for (let k = 0; k <= 80; k++) { const u = k / 80, an = u * 8 * Math.PI * 2; cpts.push([u, Math.cos(an) * 0.055, Math.sin(an) * 0.055]); }
  springG = new THREE.Group(); group.add(springG); add(sweep(cpts, () => 0.018, { segs: 190, radial: 8 }).geo, C.rim, springG, 0.012);
  // the default tag hangs on the spring post: it marks the side the spring pulls to, and stays there when the lever is thrown
  tag = plate("default", 0.8, 0.2, 42); tagHang = new THREE.Group(); tagHang.position.set(ANCH.x, ANCH.y - 0.06, ANCH.z + 0.06); group.add(tagHang); tagHang.add(tag); tag.position.set(-0.06, -0.2, 0);
  tag.children[0].material.userData.own = true;
  tagGlow = glowSprite("#ffffff", 1.3); tagGlow.position.set(0, 0, -0.04); tag.add(tagGlow);

  // ---------- the old search: clockwork and a bellows ----------
  G1 = gear(0.42, 10, CX - 1.2, 3.82, BZ + 0.72, -0.45, 0.1); G2 = gear(0.27, 7, CX - 1.64, 3.34, BZ + 0.98, -0.45, 0.35); G3 = gear(0.19, 6, CX - 1.06, 3.2, BZ + 1.12, -0.45, 0.2);
  [G1, G2, G3].forEach((g) => (g.userData.spin[0].material.userData.own = true));
  const bel = sweep([[0, 0, 0], [-0.42, -0.08, 0.15], [-0.8, -0.12, 0.25]], (u) => 0.26 + 0.09 * Math.abs(Math.sin(u * Math.PI * 6)) - 0.1 * Math.pow(Math.abs(u - 0.5) * 2, 6), { segs: 80, radial: 28 });
  belG = new THREE.Group(); belG.position.set(...ML.bellows); group.add(belG); add(bel.geo, C.plate, belG, 0.03);
  const board = add(new THREE.CylinderGeometry(0.34, 0.34, 0.07, 28), C.pipe, belG, 0.02); board.position.copy(bel.end); board.rotation.z = Math.PI / 2 + 0.1;
  // the labels, on two standoff rivets in front of the belly
  const standoffs = (g, len) => { for (const sx of [-0.45, 0.45]) { const s = add(new THREE.CylinderGeometry(0.03, 0.03, len, 10), C.pipe, g, 0.012); s.rotation.x = Math.PI / 2; s.position.set(sx, 0, -0.03 - len / 2); } };
  const pOld = plate("keywords (old)", 1.45, 0.25, 42); pOld.position.set(...ML.labelOld); pOld.rotation.set(-0.06, 0.25, 0.02); standoffs(pOld, 0.42);
  pNew = plate("meaning (new)", 1.3, 0.25, 42); pNew.position.set(...ML.labelNewParked); pNew.rotation.set(-0.06, -0.25, -0.02); standoffs(pNew, 0.7);
  own(pNew); pNewPaper = pNew.children[0].material; pNewPaper.userData.own = true;

  // ---------- the new search: a core in rings. Dark until a request asks for it. ----------
  const ORB = V3(...ML.core);
  add(sweep([[CX + 0.86, 3.5, BZ + 0.45], [CX + 1.12, 3.3, BZ + 0.7], [ORB.x, ORB.y - 0.4, ORB.z]], () => 0.07, { segs: 24, radial: 12 }).geo, C.pipe, group, 0.02);
  const cup = add(new THREE.CylinderGeometry(0.2, 0.12, 0.14, 24), C.rim, group, 0.018); cup.position.set(ORB.x, ORB.y - 0.36, ORB.z);
  core = new THREE.Mesh(new THREE.SphereGeometry(0.25, 28, 20), new THREE.MeshBasicMaterial({ color: "#1a2634", fog: false })); core.position.copy(ORB); group.add(core);
  core.material.userData.own = true; coreHull = F.hull(core.geometry, 0.022); core.add(coreHull);
  rings = [[0.4, 1.2, 0.2], [0.47, 0.3, 1.0], [0.54, -0.7, 0.5]].map(([r, rx, ry], i) => {
    const g = new THREE.Group(); g.position.copy(ORB); group.add(g);
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.024, 10, 72), new THREE.MeshBasicMaterial({ color: C.pipe, fog: false })); m.material.userData.own = true; g.add(m);
    return { g, m, rx, ry, k: [1, -0.7, 0.45][i] };
  });
  halo = glowSprite(BLUE, 2.0); halo.position.copy(ORB); group.add(halo);
  pilot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), new THREE.MeshBasicMaterial({ color: "#26303c", fog: false })); pilot.position.set(...ML.pilot); pilot.material.userData.own = true; group.add(pilot);

  // ---------- one way in, with the feeler a tab lifts; one way out ----------
  const SLOT = V3(...ML.slot);
  const mouth = add(new RoundedBoxGeometry(1.0, 0.36, 0.34, 4, 0.08), C.rim, group, 0.028); mouth.position.copy(SLOT);
  const dark = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.1), new THREE.MeshBasicMaterial({ color: C.hole, fog: false })); dark.position.set(SLOT.x, SLOT.y, SLOT.z + 0.172); group.add(dark);
  const lip = add(new RoundedBoxGeometry(0.86, 0.045, 0.34, 2, 0.02), C.pipe, group, 0.02); lip.position.set(SLOT.x, SLOT.y - 0.1, SLOT.z + 0.3);
  feeler = add(new RoundedBoxGeometry(0.12, 0.16, 0.06, 2, 0.02), C.plate, group, 0.016); feeler.material.userData.own = true;
  // its wire to the pivot runs behind the meaning (new) plate
  add(sweep([[SLOT.x + 0.3, SLOT.y + 0.2, SLOT.z + 0.18], [SLOT.x + 0.38, SLOT.y + 0.45, SLOT.z - 0.12], [PV[0] + 0.2, PV[1] - 0.12, GZ + 0.02]], () => 0.025, { segs: 20, radial: 8 }).geo, C.plate, group, 0.012);
  const pIn = plate("in", 0.45, 0.21, 46); pIn.position.set(...ML.inPlaque);
  const OUT = horn([[CX - 0.5, 2.0, BZ + 0.8], [CX - 0.74, 1.78, BZ + 1.25], [CX - 0.86, 1.5, BZ + 1.58]], ribs(curveFn([[0, 0.3], [0.5, 0.25], [1, 0.4]]), 3, 0.04, 0.1, 0.6), C.bodyDark);
  const pOut = plate("out", 0.5, 0.21, 46); pOut.position.set(OUT.end.x + 0.36, OUT.end.y + 0.4, OUT.end.z + 0.05); pOut.rotation.z = -0.1;

  // ---------- the errors bin (new): a hollow boss on the foot trunk; the bin tips out of it on hold 15 ----------
  // The boss is a frame of four bars round a dark opening, not a solid block: tipped 0.6 rad on its hinge, the bin's bed
  // stays inside the boss's depth (test-local z -2.06 to -1.95, 0.1 to 0.2 above the hinge), so only a hollow boss lets a
  // camera above it see the pale bed over the tipped face. The opening is 0.6 x 0.42 (the face plate, 0.64 x 0.46, covers
  // it at rest); the sill is a thin bar so the tipped bed's front lip (0.03 above the hinge) clears it; the cavity behind
  // is a back-faced box in the hole colour, 0.2 deep so the trunk's surface (z -2.08 at the bin's x) never shows in it.
  const BX = ML.bin[0], BY = ML.bin[1], BZF = ML.bin[2]; // the boss's front plane
  const bar = (w, h, x, y) => { const m = add(new RoundedBoxGeometry(w, h, 0.3, 2, 0.012), C.bodyDark, group, 0.012); m.position.set(BX + x, BY + y, BZF - 0.15); return m; };
  bar(0.7, 0.05, 0, 0.235); bar(0.7, 0.03, 0, -0.245); bar(0.05, 0.52, -0.325, 0); bar(0.05, 0.52, 0.325, 0); // top, sill, left, right
  const cavity = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.48, 0.2), new THREE.MeshBasicMaterial({ color: C.hole, side: THREE.BackSide, fog: false }));
  cavity.position.set(BX, BY, BZF - 0.1); group.add(cavity);
  binHinge = new THREE.Group(); binHinge.position.set(...ML.binHinge); group.add(binHinge);
  const binFace = add(new RoundedBoxGeometry(0.64, 0.46, 0.04, 3, 0.02), "#1c232c", binHinge, 0.02); binFace.position.set(0, 0.25, 0.02);
  canvasFace(0.6, 0.4, (g, W, H) => { g.fillStyle = "#ffffff"; g.font = "600 34px 'IBM Plex Mono', monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("errors", W / 2, H / 2 + 2); }, binHinge, 0, 0.25, 0.045);
  const binBack = add(new THREE.BoxGeometry(0.6, 0.4, 0.02), "#6e7681", binHinge, 0.012); binBack.position.set(0, 0.23, -0.27);
  for (const sx of [-0.3, 0.3]) { const w = add(new THREE.BoxGeometry(0.02, 0.4, 0.28), "#6e7681", binHinge, 0.012); w.position.set(sx, 0.23, -0.13); }
  const bed = add(new THREE.BoxGeometry(0.58, 0.02, 0.26), "#d4d2cc", binHinge, 0.012); bed.position.set(0, 0.03, -0.14);

  // ---------- the name, the stack and whistle, curly wires, the lamp's stalk and bulb ----------
  const pName = plate("search", 1.35, 0.37, 72); pName.position.set(...ML.lid); pName.rotation.x = -0.32;
  add(sweep([[CX - 0.5, 4.45, BZ - 0.1], [CX - 0.62, 5.0, BZ - 0.12], [CX - 0.6, 5.45, BZ - 0.1]], curveFn([[0, 0.16], [0.7, 0.13], [1, 0.24]]), { segs: 30, radial: 20 }).geo, C.pipe, group, 0.025);
  add(sweep([[CX + 0.1, 4.7, BZ + 0.1], [CX + 0.14, 5.05, BZ + 0.12], [CX + 0.1, 5.25, BZ + 0.1]], curveFn([[0, 0.09], [0.75, 0.08], [1, 0.15]]), { segs: 24, radial: 16 }).geo, C.pipe, group, 0.02);
  spring(CX - 0.15, 4.82, BZ + 0.2, 0.62, 4, -0.18); spring(CX + 0.38, 4.7, BZ + 0.3, 0.46, 3, 0.2, C.rim);
  const stalk = sweep([[CX + 0.62, 4.55, BZ - 0.05], [CX + 0.8, 5.05, BZ - 0.05], [CX + 0.62, 5.42, BZ], [ML.bulb[0], ML.bulb[1], ML.bulb[2]]], () => 0.045, { segs: 30, radial: 12 });
  add(stalk.geo, C.pipe, group, 0.016);
  bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 16), new THREE.MeshBasicMaterial({ color: C.lamp, fog: false })); bulb.position.copy(stalk.end); bulb.material.userData.own = true; group.add(bulb);
  // steam: five puffs cycle (a puff lives 1.5 s; the stream makes one every 0.35 s)
  puffs = Array.from({ length: 5 }, () => mkPuff());

  // ---------- the counter shelf (new): a bracketed shelf over the clockwork; counter.js hinges its counter on it ----------
  const shelf = add(new THREE.BoxGeometry(1.5, 0.06, 0.8), C.bodyDark, group, 0.02); shelf.position.set(...ML.shelf);
  for (const dz of [-0.28, 0.28]) rod([ML.shelf[0] - 0.62, ML.shelf[1] - 0.04, ML.shelf[2] + dz], [CX - 0.95, 4.02, ML.shelf[2] + dz], 0.035, C.pipe, group);

  // ---------- the description placard (hold 11 on): on two standoff rods from the housing's top rivets ----------
  placardG = new THREE.Group(); group.add(placardG);
  for (const r of [ML.rodL, ML.rodR]) { rod(r, [r[0], 4.0, ML.placard[2] - 0.03], 0.02, C.pipe, placardG); const cap = add(new THREE.SphereGeometry(0.035, 10, 8), C.rim, placardG, 0.012); cap.position.set(r[0], 4.0, ML.placard[2] - 0.03); }
  // The plate is as wide as its lines (PLACARD_W, 1.5: the longest line ends at 350 px of 450) and sits right of the
  // knob on the old stop (knob x -0.57 to -0.27; the plate's left edge is at -0.2, the text starts 0.1 in), so holds 11
  // and 22 read all three lines past the knob from the left-oblique poses. Lifting the plate clear of the knob instead
  // (0.3) would put its top over the lid plate's `search` by 70-100 px from those poses, which the plan forbids; the knob
  // on the thrown stop (x 0.57 to 0.87, holds 19-20 only) still crosses the ends of lines 2 and 3, as it did before.
  pDesc = plate("", PLACARD_W, 0.5, 38, (g, W, H) => {
    g.textAlign = "left"; g.textBaseline = "middle";
    g.font = "700 38px 'IBM Plex Mono', monospace"; g.fillStyle = "#4b4f55"; g.fillText("description", 30, 32);
    g.font = "600 38px 'IBM Plex Mono', monospace"; g.fillStyle = "#1a2029"; g.fillText("keywords (old)", 30, 78); g.fillText("meaning (new)", 30, 124);
  });
  placardG.add(pDesc); pDesc.position.set(...ML.placard);
  descMark = new THREE.Mesh(new THREE.PlaneGeometry(0.028, 0.1), new THREE.MeshBasicMaterial({ color: "#1a2029", fog: false, transparent: true, depthWrite: false }));
  descMark.position.set(-PLACARD_W / 2 + 12 / 300, 0, 0.032); pDesc.add(descMark); // 12 px in: the margin left of the lines
  own(placardG); descPaper = pDesc.children[0].material; descPaper.userData.own = true; descMark.material.userData.own = true;

  // every material with a base colour, for the dim; the inks and the hand-coloured ones are left out
  const seen = new Set();
  group.traverse((o) => {
    const m = o.material;
    if (!m || seen.has(m) || m.userData.own || m.side === THREE.BackSide || !m.color) return;
    seen.add(m); m.userData.base = m.color.clone(); materials.push(m);
  });
  group.updateMatrixWorld(true);
}

// world position of a named anchor (ML, test-local) through the group
export const at = (name) => group.localToWorld(V3(...ML[name]));
// where the knob is at t, in world units (Blink's gaze and the camera-set read it)
export const knobAt = (t) => group.localToWorld(leverAt(1.05, thAt(t)));

// the reading mark on the placard: line to line as Blink's gaze reads down, from t
const LINE_Y = [0.143, -0.01, -0.163]; // plate-local y of the three lines
function markAt(t) {
  const runs = [
    { on: [PLATE_HIT + 0.15, T.h12], keys: [PLATE_HIT + 0.15, T.listed, T.desc] },
    { on: [T.h22 + 0.2, T.dflt2 - 0.2], keys: [T.h22 + 0.2, T.list, T.list + 0.45] },
  ];
  for (const r of runs) {
    if (t < r.on[0] - 0.01 || t > r.on[1] + 0.2) continue;
    let y = LINE_Y[0];
    for (let i = 1; i < 3; i++) y = mix(y, LINE_Y[i], io(r01(t, r.keys[i] - 0.1, 0.25)));
    return { y, a: spanAlpha([r.on], t, 0.15) };
  }
  return { y: LINE_Y[0], a: 0 };
}
// the feeler lifts only for a tabbed card: from 0.05 s before its entry, for 0.6 s
function feelerLift(t) {
  let k = 0;
  for (const c of CARD_PLAN) if (c.tab) k = Math.max(k, ss(r01(t, c.in - 0.05, 0.12)) * (1 - ss(r01(t, c.in + 0.25, 0.3))));
  return k;
}
// dim behind the option panels (holds 24-25), and under the end mark; dim(k) from outside multiplies it
const dimAt = (t) => worldDim(t) * (1 - 0.6 * spanAlpha([[T.h24, T.h26]], t, 0.25)) * dimK;

export function update(t) {
  const k = dimAt(t);
  materials.forEach((m) => m.color.copy(m.userData.base).multiplyScalar(k));
  const glow = coreGlow(t), kn = knocks(t), th = thAt(t), on = runOn(t);

  // the lever, its knob (blue only with the core), the spring stretched to its tip, the tag on the post
  leverG.rotation.z = th;
  knobL.material.color.copy(col(C.plate, BLUE, glow)).multiplyScalar(mix(k, 1, glow));
  const tip = leverAt(0.62, th), d = tip.clone().sub(ANCH);
  springG.position.copy(ANCH); springG.quaternion.setFromUnitVectors(V3(1, 0, 0), d.clone().normalize()); springG.scale.set(d.length(), 1, 1);
  let swing = 0.07;
  for (const [a, to] of LEVER_THROWS) swing += to === 1 ? 0.35 * settle(r01(t, a, 0.9)) : -0.4 * settle(r01(t, a + 0.1, 0.9));
  const sw = r01(t, TAG_SWING, 0.9); // hold 07: out, back past centre once, settled in about 0.9 s
  swing += (sw > 0 && sw < 1 ? 0.3 * Math.sin(sw * Math.PI * 2) * Math.pow(1 - sw, 1.5) : 0) + 0.035 * kn;
  tagHang.rotation.z = swing;
  const tagLit = spanAlpha([[T.h07, T.h08], [T.h22, T.h23]], t, 0.2);
  tag.children[0].material.color.copy(new THREE.Color(C.plate)).multiplyScalar(k * mix(0.86, 1, tagLit));
  tagGlow.material.opacity = 0.28 * spanAlpha([[T.dflt2 - 0.1, T.h23]], t, 0.2);

  // the clockwork: 1.5 turns per run; the bellows pumps while it runs; the teeth cool to pipe while the core glows
  const ga = runWork(t) * Math.PI * 2 * 1.5;
  [[G1, 1], [G2, -10 / 7], [G3, -10 / 6]].forEach(([g, s]) => g.userData.spin.forEach((m) => (m.rotation.z = g.userData.base + ga * s)));
  belG.scale.set(1 - 0.28 * on * Math.pow(Math.sin(t * 9), 2), 1, 1);
  [G1, G2, G3].forEach((g) => g.userData.spin[0].material.color.copy(col(C.rim, C.pipe, 0.75 * glow)).multiplyScalar(k));

  // the new search: rings unfold on "added" (hold 05), spin and light with the core on day 53; the pilot goes blue with it
  core.material.color.copy(col(new THREE.Color("#1a2634").multiplyScalar(k), "#d7ecff", glow)); coreHull.visible = glow < 0.5;
  const ra = 7 * ss(r01(t, CORE_LIT, 3.4));
  rings.forEach(({ g, m, rx, ry, k: rk }, i) => {
    const open = io(r01(t, T.added + 0.1 * i, 0.6));
    m.rotation.set(mix(Math.PI / 2, rx, open), mix(0, ry, open), 0);
    g.rotation.set(0.4 * ra * rk, ra * rk, 0);
    m.material.color.copy(col(new THREE.Color(C.pipe).multiplyScalar(k), "#7fc0ff", glow));
  });
  halo.material.opacity = 0.7 * glow * (0.85 + 0.15 * Math.sin(t * 11));
  pilot.material.color.copy(col("#26303c", BLUE, glow));

  // the feeler: only a tab lifts it
  const lift = feelerLift(t);
  feeler.position.set(ML.feeler[0], ML.feeler[1] + 0.1 * lift, ML.feeler[2]); feeler.material.color.copy(col(new THREE.Color(C.plate).multiplyScalar(k), BLUE, lift));

  // the meaning (new) plate: in on "smarter", off at the setup, in for good in July; brightens once on hold 23
  const np = newPlate(t);
  pNew.position.set(np.x, ML.labelNew[1], ML.labelNew[2]); pNew.scale.setScalar(1 + 0.06 * np.bright);
  fade(pNew, np.a); pNewPaper.color.copy(new THREE.Color(C.plate)).multiplyScalar(k * (1 + 0.1 * np.bright));

  // steam: a puff per plain entry, a puff every 0.35 s through the stream; each rises 0.8 and thins
  puffs.forEach((g) => (g.visible = false));
  PUFFS.forEach(([at0, s], i) => {
    const u = (t - at0) / 1.5; if (u <= 0 || u >= 1) return;
    const g = puffs[i % puffs.length]; g.visible = true;
    g.position.set(ML.stackTop[0] + 0.25 * u * u, ML.stackTop[1] + 0.1 + 0.7 * u, ML.stackTop[2]); g.scale.setScalar(s * (0.35 + 0.85 * Math.sqrt(u)) * (1 - Math.pow(u, 4)));
  });

  // the placard falls onto its rods on hold 11 (lands just before its word), rebounds once, stays; the mark reads its lines
  const fall0 = PLATE_HIT - 0.35, pOn = t >= fall0;
  const u = r01(t, fall0, 0.35), bounce = t > PLATE_HIT ? 0.035 * Math.sin(Math.PI * r01(t, PLATE_HIT, 0.24)) : 0;
  pDesc.position.set(ML.placard[0], ML.placard[1] + 1.2 * (1 - u * u) + bounce, ML.placard[2]);
  fade(placardG, pOn ? r01(t, fall0, 0.12) : 0);
  const descLit = spanAlpha([[T.h11, T.h12], [T.h22, T.h23]], t, 0.2);
  descPaper.color.copy(new THREE.Color(C.plate)).multiplyScalar(k * mix(0.86, 1, descLit));
  const mk = markAt(t);
  descMark.position.y = mk.y; descMark.material.opacity = 0.75 * mk.a * (pOn ? 1 : 0); descMark.visible = descMark.material.opacity > 0.002;

  // the errors bin tips out of the foot trunk on hold 15 so its pale empty bed faces the lens, and back on hold 16
  binHinge.rotation.set(0.6 * binOut(t), 0, 0);
}

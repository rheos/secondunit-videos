// The older programs: the other callers. Three dark boxes with a screen stand on the grid lower right, each with a
// feeder rail into one trunk that climbs to the slot's lip (requests go up, standing on the rail), and a return trough
// from under the spout with a lane back down to each box (results come back lying flat). Program 1 is there from frame
// 0; 2 and 3 slide in from the right on hold 06. Every path a card rides is built here once, from PROGRAMS and the
// machine's live anchors (machine builds first); cards.js reads up(i), upSlot(i), down(i), queueSpot(k), boxTop(i, t).
// Every transform is written from t alone; nothing carries over between frames.
import * as THREE from "three";
import { C, INK, forge } from "./forge.js";
import * as machine from "./machine.js";
import { MACHINE_S, PROGRAMS, T, io, mix, r01, settle, spanAlpha, worldDim } from "../timeline.js";

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const v3 = (a) => V3(a[0], a[1], a[2]);
// the spout horn's mouth direction (design/machine-test.html: its last two points), where a result leaves the machine
const SPOUT_DIR = V3(-0.12, -0.28, 0.33).normalize();
const SLIDE_D = 0.6, SLIDE_GAP = 0.15; // programs 2 and 3 ride in over 0.6 s, 3 a little behind 2 (world-plan-v2 1.3)

export let group = null;
export const materials = []; // every material with a base colour, for the dim behind the panels and under the end mark
let boxes = [], feeders = [], trunkC = null, tailC = null, upPaths = [], upSlotPaths = [], downPaths = [], trough = null, lanes = [], slotIn = null;
let lenF = [], lenT = 0, lenTail = 0;

// a straight rod between two points
function rod(F, a, b, r, color, th = 0.014) {
  const A = v3(a), B = v3(b), d = B.clone().sub(A), m = F.add(new THREE.CylinderGeometry(r, r, d.length(), 12), color, group, th);
  m.position.copy(A).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize());
  return m;
}

export function build(scene, { toon }) {
  group = new THREE.Group(); scene.add(group);
  const inkMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide, fog: false });
  const F = forge(THREE, toon, inkMat, group);
  const { add, sweep, slide, RoundedBoxGeometry } = F;

  // ---------- the boxes: the test's program box (RoundedBox 0.62 x 0.5 x 0.46 at 0.88), a dark screen, three grey bars ----------
  boxes = PROGRAMS.boxes.map((b) => {
    const g = new THREE.Group(); g.position.set(...b.at); g.rotation.y = b.yaw; g.scale.setScalar(0.88); group.add(g);
    add(new RoundedBoxGeometry(0.62, 0.5, 0.46, 4, 0.07), "#27384d", g, 0.026);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.3), new THREE.MeshBasicMaterial({ color: "#0c1118", fog: false })); scr.position.set(0, 0.02, 0.232); g.add(scr);
    for (const [w, yy] of [[0.26, 0.07], [0.18, 0], [0.05, -0.07]]) { const l = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.03), new THREE.MeshBasicMaterial({ color: "#7d8996", fog: false })); l.position.set(-0.17 + w / 2, yy, 0.002); scr.add(l); }
    return { g, at: b.at, from: b.from };
  });

  // ---------- the rails (requests go up): three feeders into one trunk ending on the slot's lip ----------
  const J = PROGRAMS.J, lip = machine.at("lip"), slot = machine.at("slot");
  const trunkEnd = [lip.x + 0.045, lip.y, lip.z + 0.1]; // the lip's top, right of centre, near its front edge
  slotIn = V3(slot.x, slot.y + 0.01 * MACHINE_S, slot.z + 0.24 * MACHINE_S); // just inside the mouth (the test's last point of toSlot)
  feeders = PROGRAMS.feeders.map(([foot, mid]) => {
    const s = sweep([[foot[0] - 0.08, foot[1], foot[2] - 0.04], mid, J], () => 0.03, { segs: 40, radial: 8 });
    add(s.geo, C.pipe, group, 0.012);
    return s;
  });
  const trunk = sweep([J, PROGRAMS.trunk[1], trunkEnd], () => 0.03, { segs: 40, radial: 8 });
  add(trunk.geo, C.pipe, group, 0.012);
  trunkC = trunk.curve;
  tailC = new THREE.LineCurve3(v3(trunkEnd), slotIn);
  lenT = trunkC.getLength(); lenTail = tailC.getLength();
  upPaths = feeders.map((f, i) => { lenF[i] = f.curve.getLength(); const p = new THREE.CurvePath(); p.add(f.curve); p.add(trunkC); return p; });
  upSlotPaths = feeders.map((f) => { const p = new THREE.CurvePath(); p.add(f.curve); p.add(trunkC); p.add(tailC); return p; });

  // ---------- the return (results come down): a trough from under the spout to R, a lane from R to each box ----------
  const spout = machine.at("spout");
  const tr = PROGRAMS.trough.map((p) => p.slice());
  tr[0] = [spout.x - 0.06, spout.y - 0.39, spout.z + 0.12];
  trough = slide(tr);
  const R = PROGRAMS.trough[PROGRAMS.trough.length - 1];
  // a short arc out of the spout's mouth and down onto the trough's head
  const mouth = spout.clone(), lipOut = mouth.clone().addScaledVector(SPOUT_DIR, 0.22);
  const drop = new THREE.CatmullRomCurve3([mouth, lipOut, v3(tr[0]).add(V3(0, 0.05, 0))], false, "catmullrom", 0.5);
  // lanes run 0.2 outside each feeder (toward the camera and the right) so a flat result never crosses a standing request
  lanes = PROGRAMS.lanes.map(([, end], i) => {
    const m = PROGRAMS.feeders[i][1];
    const s = sweep([R, [m[0] + 0.12, m[1] - 0.06, m[2] + 0.2], [end[0] + 0.08, end[1], end[2] + 0.06]], () => 0.025, { segs: 40, radial: 8 });
    add(s.geo, C.pipe, group, 0.012);
    return s;
  });
  downPaths = lanes.map((l) => { const p = new THREE.CurvePath(); p.add(drop); p.add(trough.curve); p.add(l.curve); return p; });
  // two struts from the trough's underside to the plinth's top rim (the plinth is r 1.1 round (0.10, -2.75) at y -0.38)
  const plinth = machine.at("plinthTop"), pr = 1.375 * MACHINE_S;
  for (const sx of PROGRAMS.stanchions) {
    let best = null;
    for (let k = 0; k <= 100; k++) { const p = trough.curve.getPointAt(k / 100); if (!best || Math.abs(p.x - sx) < Math.abs(best.x - sx)) best = p; }
    const dz = Math.sqrt(Math.max(0, pr * pr - (sx - plinth.x) * (sx - plinth.x)));
    rod(F, [sx, best.y - 0.04, best.z], [sx, plinth.y, plinth.z + dz], 0.035, C.pipe);
    const foot = add(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 16), C.rim, group, 0.012); foot.position.set(sx, plinth.y + 0.015, plinth.z + dz);
  }

  const seen = new Set();
  group.traverse((o) => {
    const m = o.material;
    if (!m || seen.has(m) || m.side === THREE.BackSide || !m.color) return;
    seen.add(m); m.userData.base = m.color.clone(); materials.push(m);
  });
  group.updateMatrixWorld(true);
}

// where program i's box stands at t: 2 and 3 ride in from the right on hold 06 with one settle past their mark
function boxX(i, t) {
  const b = boxes[i]; if (b.from == null) return b.at[0];
  const a = PROGRAMS.slideIn[0] + SLIDE_GAP * (i - 1);
  return mix(b.from, b.at[0], io(r01(t, a, SLIDE_D))) - 0.06 * settle(r01(t, a + SLIDE_D - 0.1, 0.4));
}
// the box's top centre at t (a card grows out of it and a result shrinks back into it). i is 0-based.
export const boxTop = (i, t = Infinity) => V3(boxX(i, t), boxes[i].at[1] + 0.25 * 0.88, boxes[i].at[2]);
export const boxDx = (i, t) => boxX(i, t) - boxes[i].at[0];
// the ride up: feeder i then the trunk (arc-length parameterised across both, so a card's speed never jumps at J)
export const up = (i) => upPaths[i];
// the same, carried on past the lip into the slot's mouth
export const upSlot = (i) => upSlotPaths[i];
// u on up(i) (or upSlot(i) with toSlot) of trunk arc fraction f; queueU(i, k) is spot k's
export const trunkU = (i, f, toSlot = false) => (lenF[i] + f * lenT) / (lenF[i] + lenT + (toSlot ? lenTail : 0));
export const queueU = (i, k, toSlot = false) => trunkU(i, PROGRAMS.queue[k], toSlot);
// u on upSlot(i) where the trunk ends and the tail into the mouth begins
export const tailU = (i) => (lenF[i] + lenT) / (lenF[i] + lenT + lenTail);
// a queue spot: its world point and the rail's tangent there
export function queueSpot(k) {
  const f = PROGRAMS.queue[k];
  return { p: trunkC.getPointAt(f), tg: trunkC.getTangentAt(f), f };
}
// a point on the trunk by arc fraction (cards step between spots along it)
export const trunkAt = (f) => trunkC.getPointAt(f);
// the ride down: out of the spout, along the trough, down lane i into its box
export const down = (i) => downPaths[i];
export const slotMouth = () => slotIn.clone();

const dimAt = (t) => worldDim(t) * (1 - 0.6 * spanAlpha([[T.h24, T.h26]], t, 0.25));

export function update(t) {
  const k = dimAt(t);
  materials.forEach((m) => m.color.copy(m.userData.base).multiplyScalar(k));
  boxes.forEach((b, i) => { b.g.position.set(boxX(i, t), b.at[1], b.at[2]); });
}

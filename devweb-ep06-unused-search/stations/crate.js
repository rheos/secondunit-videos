// The Crate: the tool. Stencil on the lid, a big dial with two settings in plain words, one white pointer that never
// moves, the default tag on its tip, the description plate (from hold 11), the slot, and the two chutes underneath.
// The right chute's first light (hold 19) is the film's one colour beat, in blue.
import * as THREE from "three";
import { NAME, PAPER, alpha, basic, dropY, paint, solid, staticPanel, states, text } from "../parts.js";
import { rr } from "../kit/world.js";
import { CHUTE_X, CX, DIAL, DIAL_R, T, chuteGlow, io, mix, r01, rightAfterglow, spanAlpha } from "../timeline.js";

const FACE_Z = -1.5;
const A_OLD = (210 * Math.PI) / 180, A_NEW = (330 * Math.PI) / 180;
const onRing = (a, r = DIAL_R) => [DIAL[0] + Math.cos(a) * r, DIAL[1] + Math.sin(a) * r];
const TIP = onRing(A_OLD, 0.52);

// lit by default; dim behind the option panels (holds 24-25)
const CRATE = [[0, "REST"], [T.h24, "IDLE"], [T.h26, "REST"]];
const BODY_T = states(CRATE, { IDLE: "#0b1118", REST: "#1b2a3b", LIT: "#1b2a3b" });
const RIM_T = states(CRATE, { IDLE: "#27333f", REST: "#3d566f", LIT: "#3d566f" });
const INK_T = states(CRATE, { IDLE: "#59616b", REST: "#ffffff", LIT: "#ffffff" });
const NAME_T = states(CRATE, NAME);
const TAG_T = states([[0, "REST"], [T.h07, "LIT"], [T.h08, "REST"], [T.h22, "LIT"], [T.h23, "REST"], [T.h24, "IDLE"], [T.h26, "REST"]], PAPER);
const PLATE_T = states([[0, "REST"], [T.h11, "LIT"], [T.h12, "REST"], [T.h22, "LIT"], [T.h23, "REST"], [T.h24, "IDLE"], [T.h26, "REST"]], PAPER);

let bodyMat, rimMats = [], stencil, ringPanel, oldLbl, newLbl, newTick, oldTick, tagPivot, tag, tagGlow, plate, chutes = {}, newGlow;

function chute(scene, toon, side) {
  const g = new THREE.Group();
  g.position.set(CHUTE_X[side], 1.875, -1.3);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.65), new THREE.MeshBasicMaterial({ color: "#161b22", fog: false }));
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.62), basic(side === "L" ? "#c9d1d9" : "#4f93d6", { blending: THREE.AdditiveBlending }));
  glow.position.z = 0.01;
  g.add(back, glow);
  [-0.18, 0.18].forEach((x) => { const r = solid(toon, 0.03, 0.66, 0.05, "#3d566f", x, 0, 0.04, g); rimMats.push(r.material); });
  scene.add(g);
  return { g, glow };
}

export function build(scene, { toon }) {
  const body = solid(toon, 2.4, 2.5, 2.0, "#1b2a3b", CX, 3.45, -2.5, scene);
  bodyMat = body.material;
  [[2.4, 0.04, CX, 4.69], [2.4, 0.04, CX, 2.21], [0.04, 2.5, CX - 1.2, 3.45], [0.04, 2.5, CX + 1.2, 3.45], [2.4, 0.02, CX, 4.38]].forEach(([w, h, x, y]) => rimMats.push(solid(toon, w, h, 0.02, "#3d566f", x, y, FACE_Z + 0.01, scene).material));
  stencil = staticPanel(1.6, 0.26, 300, (g, W) => text(g, "search", W / 2, 58, 52, { c: "#ffffff", w: 700, a: "center" }), CX, 4.54, FACE_Z + 0.02, scene);

  // the slot, on the crate's right edge, where the queue goes in
  solid(toon, 0.1, 0.42, 0.03, "#0a0e13", 1.25, 3.55, FACE_Z + 0.02, scene);

  // the dial
  const disc = new THREE.Mesh(new THREE.CircleGeometry(DIAL_R, 64), new THREE.MeshBasicMaterial({ color: "#11161c", fog: false }));
  disc.position.set(DIAL[0], DIAL[1], DIAL[2]);
  scene.add(disc);
  ringPanel = staticPanel(1.3, 1.3, 300, (g, W) => {
    const c = W / 2, r = DIAL_R * 300;
    g.strokeStyle = "#ffffff"; g.lineWidth = 6; g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "#3a424c"; g.lineWidth = 2;
    for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; g.beginPath(); g.moveTo(c + Math.cos(a) * (r - 16), c + Math.sin(a) * (r - 16)); g.lineTo(c + Math.cos(a) * (r - 5), c + Math.sin(a) * (r - 5)); g.stroke(); }
  }, DIAL[0], DIAL[1], DIAL[2] + 0.01, scene);
  const tick = (a) => { const [x, y] = onRing(a); const m = solid(toon, 0.2, 0.035, 0.02, "#ffffff", x, y, DIAL[2] + 0.03, scene); m.rotation.z = a; return m; };
  oldTick = tick(A_OLD);
  newTick = tick(A_NEW);
  oldLbl = staticPanel(1.0, 0.16, 300, (g, W) => text(g, "keywords (old)", W / 2, 36, 33, { c: "#ffffff", w: 600, a: "center" }), CHUTE_X.L, 2.36, FACE_Z + 0.02, scene);
  newLbl = staticPanel(1.0, 0.16, 300, (g, W) => text(g, "meaning (new)", W / 2, 36, 33, { c: "#ffffff", w: 600, a: "center" }), CHUTE_X.R, 2.36, FACE_Z + 0.02, scene);
  newGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.22), basic("#ffffff", { blending: THREE.AdditiveBlending, opacity: 0 }));
  newGlow.position.set(CHUTE_X.R, 2.36, FACE_Z + 0.015);
  scene.add(newGlow);

  // the pointer: one white bar, never moves
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 28), toon("#8b949e", { fog: false }));
  hub.rotation.x = Math.PI / 2; hub.position.set(DIAL[0], DIAL[1], DIAL[2] + 0.05);
  const bar = solid(toon, 0.52, 0.045, 0.02, "#ffffff", 0, 0, 0, null);
  const pointer = new THREE.Group();
  pointer.position.set(DIAL[0], DIAL[1], DIAL[2] + 0.07);
  pointer.rotation.z = A_OLD;
  bar.position.x = 0.26;
  pointer.add(bar);
  scene.add(hub, pointer);

  // the default tag hangs off the pointer's tip on a short string
  tagPivot = new THREE.Group();
  tagPivot.position.set(TIP[0], TIP[1], DIAL[2] + 0.09);
  const string = new THREE.Mesh(new THREE.PlaneGeometry(0.01, 0.07), basic("#c9d1d9"));
  string.position.y = -0.035;
  tagGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.26), basic("#ffffff", { blending: THREE.AdditiveBlending, opacity: 0 }));
  tagGlow.position.set(0, -0.15, -0.005);
  tag = staticPanel(0.5, 0.15, 300, (g, W, H) => { g.fillStyle = "#ffffff"; rr(g, 1, 1, W - 2, H - 2, 6); g.fill(); text(g, "default", W / 2, 33, 28, { c: "#14171b", w: 700, a: "center" }); }, 0, -0.145, 0.005, tagPivot);
  tagPivot.add(string, tagGlow);
  scene.add(tagPivot);

  // the description plate, hold 11 on: both ways in plain view
  plate = staticPanel(2.0, 0.46, 300, (g, W, H) => {
    g.fillStyle = "#ffffff"; rr(g, 1, 1, W - 2, H - 2, 6); g.fill();
    text(g, "description", 22, 36, 30, { c: "#4b4f55", w: 700 });
    text(g, "keywords (old)", 22, 80, 30, { c: "#14171b", w: 600 });
    text(g, "meaning (new)", 22, 122, 30, { c: "#14171b", w: 600 });
  }, CX, 4.13, FACE_Z + 0.04, scene);

  chutes.L = chute(scene, toon, "L");
  chutes.R = chute(scene, toon, "R");
}

export function update(t) {
  paint(bodyMat, BODY_T, t);
  rimMats.forEach((m) => paint(m, RIM_T, t));
  paint(stencil.mesh.material, NAME_T, t);
  paint(ringPanel.mesh.material, INK_T, t);
  paint(oldLbl.mesh.material, INK_T, t);

  // meaning (new): pops on with "smarter", slides back off at the setup, then appears for good in July
  const firstIn = r01(t, T.smarter, 0.2), firstOut = io(r01(t, T.h03 + 0.2, 0.45)), forGood = r01(t, T.july, 0.25);
  const temp = t < T.h05 ? firstIn * (1 - firstOut) : 0;
  const a = Math.max(temp, t >= T.h05 ? forGood : 0);
  const slide = t < T.h05 ? firstOut * 0.5 : (1 - io(forGood)) * 0.3;
  alpha(newLbl.mesh, a);
  newLbl.mesh.position.x = CHUTE_X.R + slide;
  const pop = 1 + 0.2 * Math.sin(Math.PI * r01(t, t < T.h05 ? T.smarter : T.july, 0.25)) + 0.18 * Math.sin(Math.PI * r01(t, T.new2, 0.4));
  newLbl.mesh.scale.setScalar(pop);
  paint(newLbl.mesh.material, INK_T, t);
  newTick.visible = a > 0.02; newTick.scale.setScalar(Math.max(0.01, a));
  newGlow.material.opacity = 0.35 * Math.sin(Math.PI * r01(t, T.new2, 0.5)); newGlow.visible = newGlow.material.opacity > 0.002;

  // the tag swings once and settles on hold 07; it glows on hold 22. Written from t.
  const sw = r01(t, T.h07 + 0.1, 1.2);
  tagPivot.rotation.z = sw > 0 && sw < 1 ? 0.35 * Math.sin(sw * Math.PI * 3) * (1 - sw) : 0;
  paint(tag.mesh.material, TAG_T, t);
  tagGlow.material.opacity = 0.3 * spanAlpha([[T.dflt2 - 0.1, T.h23]], t, 0.2);
  tagGlow.visible = tagGlow.material.opacity > 0.002;

  // the plate drops into place on hold 11 and stays
  const pOn = t >= T.h11 + 0.05;
  plate.mesh.visible = pOn;
  if (pOn) { plate.mesh.position.y = dropY(t, T.h11 + 0.4, 4.13, 1.2); paint(plate.mesh.material, PLATE_T, t); }

  // chutes: the right one only from July; each lights while a card rides it
  chutes.R.g.visible = t >= T.july;
  const rA = r01(t, T.july, 0.3);
  chutes.R.g.scale.y = Math.max(0.01, io(rA));
  chutes.R.g.position.y = 2.2 - 0.325 * io(rA);
  chutes.L.glow.material.opacity = 0.55 * chuteGlow("L", t);
  chutes.R.glow.material.opacity = Math.max(0.9 * chuteGlow("R", t), rightAfterglow(t));
  chutes.L.glow.visible = chutes.L.glow.material.opacity > 0.002;
  chutes.R.glow.visible = chutes.R.glow.material.opacity > 0.002;
  void mix;
}

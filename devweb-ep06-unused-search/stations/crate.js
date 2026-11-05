// The Crate: parked for the whole film. Name bar, stickers, dial plate, slot. The knob points at fts and never travels;
// its one allowed move is a 0.02 press in z, no rotation, so nobody reads it as turning. The hybrid flare is the only
// blue on the crate, ever.
import * as THREE from "three";
import { BODY, NAME, PLATE, RIM, STICKER, alpha, basic, circleRing, dropY, hero, impact, paint, revealTop, solid, staticPanel, states, text } from "../parts.js";
import { rr } from "../kit/world.js";
import { T, io, r01, rock, spanAlpha } from "../timeline.js";

const DX = -0.85, DY = 2.53, DIAL_R = 0.46; // the dial's centre
const A_POS = [-1.245, 4.145], B_POS = [-0.98, 3.635], C_POS = [-0.215, 4.145];

// whole-crate state by board
const CRATE = [[0, "REST"], [T.b03, "LIT"], [T.b04, "REST"], [T.b08, "IDLE"], [T.b09, "REST"], [T.b10, "IDLE"], [T.b19, "REST"], [T.b20, "IDLE"], [T.b22, "REST"], [T.b26, "LIT"], [T.b27, "REST"], [T.b32, "IDLE"], [T.b33, "REST"]];
const DIAL = [[0, "REST"], [T.b02, "LIT"], [T.b03, "IDLE"], [T.b04, "LIT"], [T.b05, "IDLE"], [T.b06, "LIT"], [T.b08, "IDLE"], [T.b13, "REST"], [T.b17, "IDLE"], [T.b22, "LIT"], [T.b23, "REST"], [T.b25, "LIT"], [T.b26, "REST"], [T.b31, "LIT"], [T.b32, "REST"], [T.b33, "LIT"]];
const BODY_T = states(CRATE, BODY), RIM_T = states(CRATE, RIM), NAME_T = states(CRATE, NAME), PLATE_T = states(DIAL, PLATE);
const STICK_A = states([[0, "LIT"], [T.b10, "REST"], [T.b11, "IDLE"], [T.b22, "LIT"], [T.b23, "IDLE"], [T.b26, "REST"], [T.b29, "IDLE"]], STICKER);
const STICK_B = states([[0, "LIT"], [T.b20, "IDLE"], [T.b24, "LIT"], [T.b25, "REST"], [T.b29, "IDLE"]], STICKER);
const STICK_C = states([[0, "LIT"], [T.b29, "IDLE"]], STICKER);
const WHITE = [[0, "#ffffff"]];

let rig, bodyMat, rimMats = [], nameBar, plate, discPanel, knob, knobRing, tickF, tickV, tickH, lblV, lblH, lblOpt, flare;
let rail, railLbl, railBead, ghost, stA, stB, stC, outline, sweep, aRing, tie, tieFoot;

const pressAt = (t, c) => 0.02 * Math.max(0, 1 - Math.abs(t - c) / 0.12);

export function build(scene, { toon }) {
  // the crate rocks as one thing about its skids, so everything hangs inside this
  const hinge = new THREE.Group();
  hinge.position.set(-0.9, 1.72, -2.4);
  scene.add(hinge);
  rig = new THREE.Group();
  rig.position.set(0.9, -1.72, 2.4);
  hinge.add(rig);
  rig.userData.hinge = hinge;

  const body = solid(toon, 2.2, 2.94, 2.4, "#0d141c", -0.9, 3.25, -2.4, rig);
  bodyMat = body.material;
  [[-1.75, 0.3], [-0.05, 0.3]].forEach(([x, w]) => solid(toon, w, 0.06, 2.4, "#27333f", x, 1.75, -2.4, rig));
  // rim, lid seam and corner brackets
  [[2.2, 0.03, -0.9, 4.71], [2.2, 0.03, -0.9, 1.79], [0.03, 2.94, -1.99, 3.25], [0.03, 2.94, 0.19, 3.25], [2.2, 0.015, -0.9, 4.48]].forEach(([w, h, x, y]) => rimMats.push(solid(toon, w, h, 0.02, "#3d566f", x, y, -1.19, rig).material));
  [[-1.915, 4.635], [0.115, 4.635], [-1.915, 1.865], [0.115, 1.865]].forEach(([x, y]) => rimMats.push(solid(toon, 0.17, 0.17, 0.03, "#3d566f", x, y, -1.185, rig).material));
  nameBar = staticPanel(2.1, 0.24, 300, (g, W) => text(g, "search", W / 2, 54, 57, { c: "#ffffff", w: 700, a: "center" }), -0.9, 4.6, -1.17, rig);

  // the slot the cards seat in
  solid(toon, 0.06, 0.17, 0.03, "#0a0e13", 0.12, 2.03, -1.08, rig);

  // the plate: a real steel sheet with a canvas panel on its face
  solid(toon, 2.06, 1.53, 0.1, "#27303a", -0.89, 2.615, -1.15, rig);
  plate = staticPanel(2.06, 1.53, 300, (g) => {
    const py = (y) => (3.38 - y) * 300;
    text(g, "mode", 24, py(3.168), 37, { c: "#ffffff", w: 700 });
    text(g, "fts", 24, py(2.565), 37, { c: "#ffffff", w: 700 });
    text(g, "(default)", 24, py(2.40), 28.5, { c: "#ffffff" });
  }, -0.89, 2.615, -1.09, rig);
  lblOpt = staticPanel(1, 0.15, 300, (g) => text(g, "optional", 0, 34, 33, { c: "#ffffff" }), -1.34, 3.04, -1.08, rig);
  lblV = staticPanel(0.8, 0.15, 300, (g, W) => text(g, "vector", W / 2, 34, 33, { c: "#ffffff", a: "center" }), DX, 3.12, -1.08, rig);
  lblH = staticPanel(0.44, 0.15, 300, (g) => text(g, "hybrid", 0, 34, 33, { c: "#ffffff" }), -0.18, 2.78, -1.08, rig);

  // the dial
  const disc = new THREE.Mesh(new THREE.CircleGeometry(DIAL_R, 64), new THREE.MeshBasicMaterial({ color: "#11161c", fog: false }));
  disc.position.set(DX, DY, -1.05);
  rig.add(disc);
  discPanel = staticPanel(0.96, 0.96, 300, (g, W) => {
    const c = W / 2, r = DIAL_R * 300;
    g.strokeStyle = "#ffffff"; g.lineWidth = 5; g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "#3a424c"; g.lineWidth = 2;
    for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; g.beginPath(); g.moveTo(c + Math.cos(a) * (r - 14), c + Math.sin(a) * (r - 14)); g.lineTo(c + Math.cos(a) * (r - 4), c + Math.sin(a) * (r - 4)); g.stroke(); }
  }, DX, DY, -1.04, rig);
  const tick = (x, y, rotZ) => { const m = solid(toon, 0.16, 0.026, 0.02, "#c9d1d9", x, y, -1.02, rig); m.rotation.z = rotZ; return m; };
  tickF = tick(DX - DIAL_R, DY, 0);
  tickV = tick(DX, DY + DIAL_R, Math.PI / 2);
  tickH = tick(DX + DIAL_R, DY, 0);
  // the knob: the pointer is the point, it shows the value
  knob = new THREE.Group();
  knob.position.set(DX, DY, -1.03);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 28), toon("#8b949e", { fog: false }));
  hub.rotation.x = Math.PI / 2;
  const pointer = new THREE.Mesh(new THREE.BoxGeometry(DIAL_R - 0.06, 0.035, 0.02), toon("#ffffff", { fog: false }));
  pointer.position.set(-(DIAL_R - 0.06) / 2, 0, 0.03);
  knob.add(hub, pointer);
  rig.add(knob);
  knobRing = circleRing(0.52, 0.014, rig, DX, DY, -1.0);
  flare = new THREE.Mesh(new THREE.CircleGeometry(0.5, 40), basic("#4f93d6", { blending: THREE.AdditiveBlending, opacity: 0 }));
  flare.position.set(-0.34, DY, -1.0);
  rig.add(flare);

  // the ghost knob, on 29 only: a what-if. The real knob stays drawn and unmoved under it.
  ghost = new THREE.Group();
  ghost.position.set(DX, DY, -1.0);
  ghost.userData.mat = basic("#8b949e");
  for (let i = 0; i < 4; i++) { const seg = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.035), ghost.userData.mat); seg.position.x = -0.13 - i * 0.09; ghost.add(seg); }
  rig.add(ghost);

  // the old code path, 07 and 23: a thin rail down from (default), a label under it, one bright bead
  rail = solid(toon, 0.02, 0.33, 0.01, "#c9d1d9", -1.72, 2.195, -1.08, rig);
  railLbl = staticPanel(1.1, 0.16, 300, (g) => text(g, "old code path", 0, 34, 37, { c: "#ffffff", w: 700 }), -1.29, 1.93, -1.08, rig);
  railBead = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), basic("#ffffff"));
  railBead.position.set(-1.72, 2.36, -1.06);
  rig.add(railBead);

  // stickers: dropped from above the frame, one impact, no hands. No quote marks.
  const sticker = (wu, hu, lines, px, step, base) => staticPanel(wu, hu, 300, (g, W, H) => {
    g.fillStyle = "#ffffff"; rr(g, 1, 1, W - 2, H - 2, 4); g.fill();
    lines.forEach((s, i) => text(g, s, 16, base + i * step, px, { c: "#14171b", w: 700 }));
  }, 0, 0, -1.1, rig);
  stA = sticker(1.43, 0.47, ["fts (default)", "vector  hybrid"], 44, 56, 56);
  stB = sticker(1.96, 0.39, ["search before claiming", "you don't know"], 40.5, 46, 48);
  stC = sticker(0.55, 0.47, ["count", "by mode", "Dec 1"], 31, 42, 38);
  stA.mesh.position.x = A_POS[0]; stB.mesh.position.x = B_POS[0]; stC.mesh.position.x = C_POS[0];
  outline = staticPanel(0.55, 0.47, 300, (g, W, H) => { g.strokeStyle = "#8b949e"; g.lineWidth = 3; g.setLineDash([9, 7]); rr(g, 3, 3, W - 6, H - 6, 4); g.stroke(); g.setLineDash([]); }, C_POS[0], C_POS[1], -1.1, rig);
  sweep = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.47), basic("#ffffff", { blending: THREE.AdditiveBlending }));
  sweep.position.set(A_POS[0], A_POS[1], -1.08);
  rig.add(sweep);

  // board 22: the ring round (default), then the dashed tie down the plate's left edge to the same word by the knob
  aRing = hero(0.94, 0.22, 300, (g, W, H, s) => {
    const perim = 2 * (W + H);
    g.strokeStyle = "#ffffff"; g.lineWidth = 4; g.setLineDash([perim * s.k, perim]); rr(g, 3, 3, W - 6, H - 6, 18); g.stroke(); g.setLineDash([]);
  });
  aRing.mesh.position.set(-1.15, 4.245, -1.0);
  rig.add(aRing.mesh);
  tie = hero(0.05, 1.75, 300, (g, W, H) => { g.fillStyle = "#ffffff"; for (let y = 0; y < H; y += 26) g.fillRect(W / 2 - 2, y, 4, 15); });
  tie.set({});
  tie.mesh.position.set(-1.975, 3.255, -1.0);
  rig.add(tie.mesh);
  tieFoot = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.012), basic("#ffffff"));
  tieFoot.position.set(-1.915, 2.43, -1.0);
  rig.add(tieFoot);
}

function placeSticker(p, t, hit, x, y, track, alive = 1) {
  const on = t >= hit - 0.18 && alive > 0.002;
  p.mesh.visible = on;
  if (!on) return;
  p.mesh.position.set(x, dropY(t, hit, y), -1.1);
  p.mesh.scale.setScalar(impact(t, hit));
  p.mesh.rotation.z = -0.02;
  alpha(p.mesh, alive);
  paint(p.mesh.material, track, t);
}

export function update(t) {
  rig.userData.hinge.rotation.z = rock(t) * 0.012;

  paint(bodyMat, BODY_T, t);
  rimMats.forEach((m) => paint(m, RIM_T, t));
  paint(nameBar.mesh.material, NAME_T, t);
  paint(plate.mesh.material, PLATE_T, t);
  paint(discPanel.mesh.material, PLATE_T, t);

  // new ticks: fts from the start, then vector and hybrid pop one after the other, one settle each
  const pop = (t0) => { const u = r01(t, t0, 0.22); return u <= 0 ? 0 : 1 + 0.25 * Math.sin(u * Math.PI); };
  const pV = pop(T.b04), pH = pop(T.landed);
  tickV.visible = pV > 0; tickV.scale.setScalar(Math.max(pV, 0.001));
  tickH.visible = pH > 0; tickH.scale.setScalar(Math.max(pH, 0.001));
  alpha(lblV.mesh, r01(t, T.b04, 0.1)); paint(lblV.mesh.material, PLATE_T, t);
  const optK = r01(t, T.optional, 0.14);
  alpha(lblOpt.mesh, optK); lblOpt.mesh.scale.setScalar(1 + (1 - optK) * 0.25); paint(lblOpt.mesh.material, PLATE_T, t);

  // the colour beat: pure function of t; rises from flareUp, peaks on "mode", gone by flareGone. The tally stays IDLE.
  const f = t < T.flareUp || t > T.flareGone ? 0 : t < T.flarePeak ? io(r01(t, T.flareUp, T.flarePeak - T.flareUp)) : 1 - io(r01(t, T.flarePeak, T.flareGone - T.flarePeak));
  flare.visible = f > 0.002; flare.material.opacity = 0.75 * f;
  tickH.material.color.set("#c9d1d9").lerp(new THREE.Color("#4f93d6"), f);
  alpha(lblH.mesh, r01(t, T.landed, 0.1));
  paint(lblH.mesh.material, PLATE_T, t);
  lblH.mesh.material.color.lerp(new THREE.Color("#9fccf5"), f);

  knob.position.z = -1.03 - pressAt(t, T.fts) - pressAt(t, T.why); // a settle in place, no rotation
  knobRing.set(spanAlpha([[T.b02, T.b03], [T.b04, T.b05], [T.b06, T.b07], [T.b13, T.b17], [T.b22, T.b27], [T.b31, T.b32], [T.b33, T.endIn]], t));

  // ghost knob: over the top of the dial, 9 o'clock to 3 o'clock
  const gu = io(r01(t, T.ghost, 0.9));
  ghost.visible = t >= T.ghost && t < T.b30;
  ghost.rotation.z = -Math.PI * gu;
  ghost.userData.mat.opacity = 0.65 * r01(t, T.ghost, 0.1) * (1 - r01(t, T.b30 - 0.3, 0.3));

  // old code path
  const pathA = spanAlpha([[T.b07, T.b08], [T.b23, T.b24]], t, 0.2);
  rail.visible = pathA > 0.002;
  rail.material.transparent = true; rail.material.opacity = pathA;
  alpha(railLbl.mesh, pathA);
  const bu = r01(t, T.old, 0.5);
  railBead.visible = t > T.old && bu < 1;
  railBead.material.opacity = 1;
  railBead.position.y = 2.36 - 0.33 * bu;

  // stickers
  placeSticker(stA, t, T.hitA, A_POS[0], A_POS[1], STICK_A);
  placeSticker(stB, t, T.hitB, B_POS[0], B_POS[1], STICK_B);
  placeSticker(stC, t, T.hitC, C_POS[0], C_POS[1], STICK_C, 1 - r01(t, T.b32, 0.2));
  alpha(outline.mesh, r01(t, T.b32 + 0.1, 0.2) * (1 - r01(t, T.b33, 0.3)));
  const su = r01(t, T.names, T.three + 0.4 - T.names);
  sweep.visible = su > 0 && su < 1;
  sweep.position.x = -1.85 + 1.2 * su;
  sweep.material.opacity = 0.35 * Math.sin(su * Math.PI);

  // ring and tie, board 22 only
  const rA = spanAlpha([[T.dflt, T.b23]], t);
  aRing.set({ k: Math.round(io(r01(t, T.dflt, 0.3)) * 40) / 40 });
  alpha(aRing.mesh, rA);
  alpha(tie.mesh, rA);
  const tk = io(r01(t, T.dflt + 0.3, 0.4));
  revealTop(tie, 4.13, 1.75 * tk);
  alpha(tieFoot, tk > 0.98 ? rA : 0);
}

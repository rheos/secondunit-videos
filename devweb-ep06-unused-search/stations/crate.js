// The Crate: the tool. A box with a lid (stencil on the lid), a big dial in a bezel with two settings in plain words, one
// weighted white pointer that never moves, the default tag on its tip, the description plate (from hold 11), the slot
// with a flap that lifts as each card goes in, and two real chutes underneath. The right chute's first light (hold 19)
// is the film's one colour beat, in blue. Every transform below is written from t alone: no state between frames.
import * as THREE from "three";
import { NAME, PAPER, alpha, basic, paint, solid, staticPanel, states, text } from "../parts.js";
import { back, rr } from "../kit/world.js";
import { CARD_PLAN, CHUTE_X, CX, DIAL, DIAL_R, STREAM, T, chuteGlow, io, mix, r01, rightAfterglow, spanAlpha } from "../timeline.js";

const FACE_Z = -1.5, LID_Z = -1.47;
const A_OLD = (210 * Math.PI) / 180, A_NEW = (330 * Math.PI) / 180;
const onRing = (a, r = DIAL_R) => [DIAL[0] + Math.cos(a) * r, DIAL[1] + Math.sin(a) * r];
const TIP = onRing(A_OLD, 0.52);
const PLATE_Y = 4.13, PLATE_LINES = [4.27, 4.127, 3.987]; // world y of the plate's three lines

// lit by default; dim behind the option panels (holds 24-25)
const CRATE = [[0, "REST"], [T.h24, "IDLE"], [T.h26, "REST"]];
const BODY_T = states(CRATE, { IDLE: "#0b1118", REST: "#1b2a3b", LIT: "#1b2a3b" });
const LID_T = states(CRATE, { IDLE: "#0d141c", REST: "#21334a", LIT: "#21334a" });
const RIM_T = states(CRATE, { IDLE: "#27333f", REST: "#3d566f", LIT: "#3d566f" });
const FLAP_T = states(CRATE, { IDLE: "#141c25", REST: "#2b3e53", LIT: "#2b3e53" });
const DARK_T = states(CRATE, { IDLE: "#07090c", REST: "#0a0e13", LIT: "#0a0e13" });
const DISC_T = states(CRATE, { IDLE: "#080b0f", REST: "#11161c", LIT: "#11161c" });
const CHUTE_T = states(CRATE, { IDLE: "#0a0d11", REST: "#161b22", LIT: "#161b22" });
const HUB_T = states(CRATE, { IDLE: "#2a2f35", REST: "#8b949e", LIT: "#8b949e" });
const CAP_T = states(CRATE, { IDLE: "#3a424c", REST: "#c9d1d9", LIT: "#c9d1d9" });
const INK_T = states(CRATE, { IDLE: "#3a424c", REST: "#ffffff", LIT: "#ffffff" });
const NAME_T = states(CRATE, NAME);
const TAG_T = states([[0, "REST"], [T.h07, "LIT"], [T.h08, "REST"], [T.h22, "LIT"], [T.h23, "REST"], [T.h24, "IDLE"], [T.h26, "REST"]], PAPER);
const PLATE_T = states([[0, "REST"], [T.h11, "LIT"], [T.h12, "REST"], [T.h22, "LIT"], [T.h23, "REST"], [T.h24, "IDLE"], [T.h26, "REST"]], PAPER);

// when each planned card reaches the slot (cards.js: a key's move length is its third value, else 0.35 s)
const SLOT_IN = [];
CARD_PLAN.forEach(({ keys }) => keys.forEach((k) => { if (k[1] === "slot") SLOT_IN.push(k[0] + (k[2] || 0.35)); }));

// pure-t paintable parts, gathered at build time: [material, track]
const painted = [];
const P = (mat, track) => { painted.push([mat, track]); return mat; };
const box = (toon, w, h, d, track, x, y, z, parent) => { const m = solid(toon, w, h, d, "#ffffff", x, y, z, parent); P(m.material, track); return m; };

let stencil, ringPanel, oldLbl, newLbl, newTick, tagPivot, tag, tagGlow, plate, plateMark, flapPivot, chutes = {}, newGlow, softTex;

// a soft round falloff, for light that spills rather than paints a rectangle
function soft() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d"), grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)"); grad.addColorStop(0.45, "rgba(255,255,255,0.45)"); grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const glowMat = (color, map) => basic(color, { blending: THREE.AdditiveBlending, opacity: 0, map });

// a chute: an open channel with a back, two walls with depth and a collar where it meets the crate's underside.
// Cards ride it at z -1.2, so everything here stays behind z -1.22.
function chute(scene, toon, side) {
  const g = new THREE.Group();
  g.position.set(CHUTE_X[side], 1.875, -1.34);
  box(toon, 0.34, 0.65, 0.02, CHUTE_T, 0, 0, -0.11, g);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.62), glowMat(side === "L" ? "#c9d1d9" : "#4f93d6"));
  glow.position.z = -0.095;
  [-0.18, 0.18].forEach((x) => box(toon, 0.03, 0.66, 0.22, RIM_T, x, 0, 0, g));
  box(toon, 0.42, 0.06, 0.24, RIM_T, 0, 0.3, 0, g);
  const spill = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.55), glowMat(side === "L" ? "#c9d1d9" : "#4f93d6", softTex));
  spill.position.set(0, -0.4, -0.02);
  g.add(glow, spill);
  scene.add(g);
  return { g, glow, spill };
}

export function build(scene, { toon }) {
  softTex = soft();

  // the box: body, a lid that overhangs a hair, edges picked out in the rim colour
  box(toon, 2.4, 2.5, 2.0, BODY_T, CX, 3.45, -2.5, scene);
  box(toon, 2.44, 0.34, 2.06, LID_T, CX, 4.55, -2.5, scene);
  [[2.4, 0.04, CX, 2.21], [0.04, 2.2, CX - 1.2, 3.3], [0.04, 2.2, CX + 1.2, 3.3]].forEach(([w, h, x, y]) => box(toon, w, h, 0.02, RIM_T, x, y, FACE_Z + 0.01, scene));
  [[2.44, 0.03, CX, 4.705], [2.44, 0.03, CX, 4.395], [0.03, 0.34, CX - 1.205, 4.55], [0.03, 0.34, CX + 1.205, 4.55]].forEach(([w, h, x, y]) => box(toon, w, h, 0.02, RIM_T, x, y, LID_Z + 0.005, scene));
  stencil = staticPanel(1.6, 0.26, 300, (g, W) => text(g, "search", W / 2, 58, 52, { c: "#ffffff", w: 700, a: "center" }), CX, 4.54, LID_Z + 0.02, scene);

  // the slot, on the crate's right edge, where the queue goes in: a dark mouth in a frame, a flap hinged at its top
  box(toon, 0.1, 0.42, 0.03, DARK_T, 1.25, 3.55, FACE_Z + 0.02, scene);
  [[0.14, 0.025, 1.25, 3.7725], [0.14, 0.025, 1.25, 3.3275], [0.02, 0.42, 1.19, 3.55], [0.02, 0.42, 1.31, 3.55]].forEach(([w, h, x, y]) => box(toon, w, h, 0.03, RIM_T, x, y, FACE_Z + 0.025, scene));
  flapPivot = new THREE.Group();
  flapPivot.position.set(1.25, 3.76, FACE_Z + 0.05);
  box(toon, 0.09, 0.4, 0.012, FLAP_T, 0, -0.2, 0, flapPivot);
  scene.add(flapPivot);

  // the dial: a dark face sunk in a bezel, the ring and its ticks
  const disc = new THREE.Mesh(new THREE.CircleGeometry(DIAL_R, 64), P(new THREE.MeshBasicMaterial({ color: "#11161c", fog: false }), DISC_T));
  disc.position.set(DIAL[0], DIAL[1], DIAL[2]);
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(DIAL_R + 0.045, 0.035, 12, 96), P(toon("#3d566f", { fog: false }), RIM_T));
  bezel.position.set(DIAL[0], DIAL[1], DIAL[2]);
  scene.add(disc, bezel);
  ringPanel = staticPanel(1.3, 1.3, 400, (g, W) => {
    const c = W / 2, r = DIAL_R * 400;
    g.strokeStyle = "#ffffff"; g.lineWidth = 8; g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "#3a424c"; g.lineWidth = 3;
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2, L = i % 2 ? 10 : 22;
      g.beginPath(); g.moveTo(c + Math.cos(a) * (r - 6 - L), c + Math.sin(a) * (r - 6 - L)); g.lineTo(c + Math.cos(a) * (r - 6), c + Math.sin(a) * (r - 6)); g.stroke();
    }
  }, DIAL[0], DIAL[1], DIAL[2] + 0.01, scene);
  const tick = (a) => {
    const [x, y] = onRing(a, DIAL_R - 0.1);
    const g = new THREE.Group(); g.position.set(x, y, DIAL[2] + 0.03); g.rotation.z = a;
    box(toon, 0.2, 0.035, 0.02, INK_T, 0.1, 0, 0, g); // grows outward from its inner end
    scene.add(g);
    return g;
  };
  tick(A_OLD);
  newTick = tick(A_NEW);
  oldLbl = staticPanel(1.0, 0.16, 300, (g, W) => text(g, "keywords (old)", W / 2, 36, 33, { c: "#ffffff", w: 600, a: "center" }), CHUTE_X.L, 2.36, FACE_Z + 0.02, scene);
  newLbl = staticPanel(1.0, 0.16, 300, (g, W) => text(g, "meaning (new)", W / 2, 36, 33, { c: "#ffffff", w: 600, a: "center" }), CHUTE_X.R, 2.36, FACE_Z + 0.02, scene);
  newGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.42), glowMat("#ffffff", softTex));
  newGlow.position.set(CHUTE_X.R, 2.36, FACE_Z + 0.015);
  scene.add(newGlow);

  // the pointer: a tapered needle with a counterweight, sitting on its own shadow. It never moves.
  const needle = new THREE.Shape();
  needle.moveTo(-0.08, 0.03); needle.lineTo(0.5, 0.008); needle.quadraticCurveTo(0.535, 0, 0.5, -0.008); needle.lineTo(-0.08, -0.03); needle.closePath();
  const inkMat = P(toon("#ffffff", { fog: false }), INK_T);
  const pointer = new THREE.Group();
  pointer.position.set(DIAL[0], DIAL[1], DIAL[2] + 0.07);
  pointer.rotation.z = A_OLD;
  const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(needle, { depth: 0.02, bevelEnabled: false }), inkMat);
  const weight = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.022, 28), inkMat);
  weight.rotation.x = Math.PI / 2; weight.position.set(-0.12, 0, 0.011);
  pointer.add(blade, weight);
  const shadow = new THREE.Group();
  shadow.position.set(DIAL[0] + 0.018, DIAL[1] - 0.03, DIAL[2] + 0.02);
  shadow.rotation.z = A_OLD;
  const shMat = basic("#000000", { opacity: 0.45 });
  const shW = new THREE.Mesh(new THREE.CircleGeometry(0.05, 24), shMat); shW.position.x = -0.12;
  shadow.add(new THREE.Mesh(new THREE.ShapeGeometry(needle), shMat), shW);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 32), P(toon("#8b949e", { fog: false }), HUB_T));
  hub.rotation.x = Math.PI / 2; hub.position.set(DIAL[0], DIAL[1], DIAL[2] + 0.04);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 24), P(toon("#c9d1d9", { fog: false }), CAP_T));
  cap.rotation.x = Math.PI / 2; cap.position.set(DIAL[0], DIAL[1], DIAL[2] + 0.105);
  scene.add(shadow, hub, pointer, cap);

  // the default tag hangs off the pointer's tip on a short string, an eyelet at its top
  tagPivot = new THREE.Group();
  tagPivot.position.set(TIP[0], TIP[1], DIAL[2] + 0.09);
  const string = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 0.075), P(basic("#c9d1d9"), TAG_T));
  string.position.y = -0.035;
  const tagShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.15), basic("#000000", { opacity: 0.4 }));
  tagShadow.position.set(0.015, -0.165, -0.06);
  tagGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.42), glowMat("#ffffff", softTex));
  tagGlow.position.set(0, -0.15, -0.005);
  tag = staticPanel(0.5, 0.15, 600, (g, W, H) => {
    g.fillStyle = "#ffffff"; rr(g, 2, 2, W - 4, H - 4, 12); g.fill();
    g.fillStyle = "#14171b"; g.beginPath(); g.arc(W / 2, 13, 6, 0, Math.PI * 2); g.fill();
    text(g, "default", W / 2, 70, 50, { c: "#14171b", w: 700, a: "center" });
  }, 0, -0.145, 0.005, tagPivot);
  tagPivot.add(string, tagShadow, tagGlow);
  scene.add(tagPivot);

  // the description plate, hold 11 on: both ways in plain view. Screwed to the face; a small mark follows the reading.
  plate = staticPanel(2.0, 0.46, 300, (g, W, H) => {
    g.fillStyle = "#ffffff"; rr(g, 1, 1, W - 2, H - 2, 6); g.fill();
    g.strokeStyle = "#9a9995"; g.lineWidth = 2; rr(g, 6, 6, W - 12, H - 12, 4); g.stroke();
    g.fillStyle = "#8a8985";
    [[W - 16, 16], [W - 16, H - 16]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 5, 0, Math.PI * 2); g.fill(); });
    text(g, "description", 22, 36, 30, { c: "#4b4f55", w: 700 });
    text(g, "keywords (old)", 22, 80, 30, { c: "#14171b", w: 600 });
    text(g, "meaning (new)", 22, 122, 30, { c: "#14171b", w: 600 });
  }, CX, PLATE_Y, FACE_Z + 0.04, scene);
  plateMark = new THREE.Mesh(new THREE.PlaneGeometry(0.022, 0.08), basic("#14171b"));
  plateMark.position.set(CX - 1.0 + 0.04, PLATE_LINES[0], FACE_Z + 0.045);
  scene.add(plateMark);

  chutes.L = chute(scene, toon, "L");
  chutes.R = chute(scene, toon, "R");
}

// the flap: lifts as a card reaches the slot, falls shut, bounces open once off the frame, rests
function flapAt(t) {
  let a = 0;
  for (const arrive of SLOT_IN) {
    const x = t - arrive;
    if (x < -0.25 || x > 0.6) continue;
    let v;
    if (x < -0.08) v = io((x + 0.25) / 0.17);
    else if (x < 0.08) v = 1;
    else { const u = (x - 0.08) / 0.45; v = Math.pow(1 - Math.min(1, u), 2) * Math.abs(Math.cos(1.5 * Math.PI * Math.min(1, u))); }
    a = Math.max(a, v);
  }
  // the mass moment: the flap is held half open with a small flutter while the stream pours
  const s = spanAlpha([STREAM], t, 0.25);
  if (s > 0) a = Math.max(a, s * (0.5 + 0.12 * Math.abs(Math.sin((t - STREAM[0]) * Math.PI * 3.2))));
  return 0.55 * a;
}

// the reading mark on the plate: line to line as Blink's gaze reads down, from t
function markAt(t) {
  const runs = [
    { on: [T.h11 + 0.5, T.h12], keys: [T.h11 + 0.5, T.listed, T.desc] },
    { on: [T.h22 + 0.2, T.dflt2 - 0.2], keys: [T.h22 + 0.2, T.list, T.list + 0.45] },
  ];
  for (const r of runs) {
    if (t < r.on[0] - 0.01 || t > r.on[1] + 0.2) continue;
    let y = PLATE_LINES[0];
    for (let i = 1; i < 3; i++) y = mix(y, PLATE_LINES[i], io(r01(t, r.keys[i] - 0.1, 0.25)));
    return { y, a: spanAlpha([r.on], t, 0.15) };
  }
  return { y: PLATE_LINES[0], a: 0 };
}

export function update(t) {
  painted.forEach(([m, track]) => paint(m, track, t));
  paint(stencil.mesh.material, NAME_T, t);
  paint(ringPanel.mesh.material, INK_T, t);
  paint(oldLbl.mesh.material, INK_T, t);

  // meaning (new): slides in with "smarter", slides back off at the setup, then slides in for good in July.
  // Arrivals ease past their mark once and come back (one rebound); nothing pops.
  let a, slide;
  if (t < T.h05) {
    const firstOut = io(r01(t, T.h03 + 0.2, 0.45));
    a = r01(t, T.smarter, 0.2) * (1 - firstOut);
    slide = (1 - back(r01(t, T.smarter, 0.4))) * 0.25 + firstOut * 0.5;
  } else {
    a = r01(t, T.july, 0.25);
    slide = (1 - back(r01(t, T.july, 0.45))) * 0.3;
  }
  alpha(newLbl.mesh, a);
  newLbl.mesh.position.x = CHUTE_X.R + slide;
  const bright = Math.sin(Math.PI * r01(t, T.new2, 0.5)); // hold 23: brightens once
  newLbl.mesh.scale.setScalar(1 + 0.06 * bright);
  paint(newLbl.mesh.material, INK_T, t);
  newTick.visible = a > 0.02;
  newTick.scale.x = Math.max(0.01, io(a));
  newGlow.position.x = newLbl.mesh.position.x;
  newGlow.material.opacity = 0.3 * bright;
  newGlow.visible = newGlow.material.opacity > 0.002;

  // the tag swings once on hold 07: out, back past centre once, settled in about 0.9 s. It glows on hold 22.
  const sw = r01(t, T.h07 + 0.1, 0.9);
  tagPivot.rotation.z = sw > 0 && sw < 1 ? 0.3 * Math.sin(sw * Math.PI * 2) * Math.pow(1 - sw, 1.5) : 0;
  paint(tag.mesh.material, TAG_T, t);
  tagGlow.material.opacity = 0.28 * spanAlpha([[T.dflt2 - 0.1, T.h23]], t, 0.2);
  tagGlow.visible = tagGlow.material.opacity > 0.002;

  // the plate falls into place on hold 11 (lands at the animatic's time), rebounds once, stays
  const pOn = t >= T.h11 + 0.05, hit = T.h11 + 0.4;
  if (pOn) {
    const u = r01(t, T.h11 + 0.05, hit - T.h11 - 0.05);
    const bounce = t > hit ? 0.035 * Math.sin(Math.PI * r01(t, hit, 0.24)) : 0;
    plate.mesh.position.y = PLATE_Y + 1.2 * (1 - u * u) + bounce;
    alpha(plate.mesh, r01(t, T.h11 + 0.05, 0.12));
    paint(plate.mesh.material, PLATE_T, t);
  } else plate.mesh.visible = false;
  const mk = markAt(t);
  plateMark.position.y = mk.y;
  alpha(plateMark, pOn ? 0.75 * mk.a : 0);

  // the slot's flap (bottom swings out toward camera)
  flapPivot.rotation.x = -flapAt(t);

  // chutes: the right one only from July; each lights while a card rides it. The left stream at hold 13 is the
  // film's light peak; its glow spills out of the chute's mouth only then.
  chutes.R.g.visible = t >= T.july;
  const rA = r01(t, T.july, 0.3);
  chutes.R.g.scale.y = Math.max(0.01, io(rA));
  chutes.R.g.position.y = 2.2 - 0.325 * io(rA);
  const stream = spanAlpha([STREAM], t, 0.25);
  alpha(chutes.L.glow, Math.min(1, 0.55 * chuteGlow("L", t) + 0.35 * stream));
  alpha(chutes.L.spill, 0.3 * stream + 0.06 * chuteGlow("L", t));
  alpha(chutes.R.glow, Math.max(0.9 * chuteGlow("R", t), rightAfterglow(t)));
  alpha(chutes.R.spill, 0.22 * chuteGlow("R", t));
}

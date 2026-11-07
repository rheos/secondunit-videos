// The Counter: one plain count in a box on the machine's shelf over the clockwork, upper left, holds 13-15. Climbs 0 to
// 36 of 37, landing on "one". It never names the other call, and it is gone before day 53 (check-graybox.mjs proves it).
// Finished look: a small housing with a recessed window and two number drums that roll like an odometer, hinged on the
// shelf's back edge (machine.at("counterHinge")). It lies flat on the shelf, stands up on hold 13 (counterUp(t), one
// small overshoot), climbs, and lies down again on hold 16. The last tick to 36 rolls slower, overshoots a hair and
// settles once, the housing takes a small thunk and a short white bloom sits behind it (0.5 s). Then the count dims as
// the lamp and the bin take the holds. Everything is drawn from t.
// The hinge is on the shelf's back edge, so lying flat the counter folds forward onto the shelf face down (a hinge on
// the back edge can't lie face up in front of itself); from a level camera it is a dark slab edge-on either way.
import * as THREE from "three";
import { alpha, basic, hero, solidAlpha, text } from "../parts.js";
import { COUNT_IN, T, cl, counterN, counterUp, io, mix, r01 } from "../timeline.js";
import * as machine from "./machine.js";

// the face keeps its size: 0.95 x 0.62; standing, its centre is H/2 above the hinge (world-plan-v2 1.1: counterUp)
const W = 0.95, H = 0.62, D = 0.2; // 0.2 deep, so lying down it is a slab on the shelf, not a box
// COUNT_IN comes from timeline.js; build() still proves the tick maths against counterN
const DUR = T.one3 - COUNT_IN;
// the drums: cell = one digit, window shows exactly one cell. The window and the words sit 0.15 above the counter's foot:
// the camera is under the shelf, so the shelf's front lip covers the standing counter's lowest 0.1 or so
const CELL_W = 0.11, CELL_H = 0.16, WIN_Y = -0.07, TENS_X = -0.353, UNITS_X = TENS_X + CELL_W + 0.008;
const ROLL = 0.06, ROLL_LAST = 0.24;

let hinge, rig, solids = [], face, tens, units, glass, bloom, faceMat;

// ease out with one small overshoot and no second crossing (kit back() at a softer c1)
const softBack = (x, c1 = 0.9) => { x = cl(x); const c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

function box(toon, w, h, d, color, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(color, { fog: false, transparent: true, opacity: 0 }));
  m.position.set(x, y, z);
  m.userData.base = new THREE.Color(color);
  rig.add(m); solids.push(m);
  return m;
}

// a strip of ten digits stacked top to bottom; the window shows one cell and rolls by texture offset
function drum(blankZero, x) {
  const cw = 66, ch = 96, c = document.createElement("canvas");
  c.width = cw; c.height = ch * 10;
  const g = c.getContext("2d");
  g.fillStyle = "#161b22"; g.fillRect(0, 0, cw, ch * 10);
  for (let d = 0; d < 10; d++) {
    if (!(blankZero && d === 0)) text(g, String(d), cw / 2, d * ch + 84, 100, { c: "#ffffff", w: 700, a: "center" });
    g.fillStyle = "#0b0f14"; g.fillRect(0, d * ch, cw, 2); // the seam between cells
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1, 0.1);
  const mat = new THREE.MeshBasicMaterial({ map: tex, fog: false, transparent: true, depthWrite: false, opacity: 0 });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(CELL_W, CELL_H), mat);
  m.position.set(x, WIN_Y, -0.035);
  rig.add(m);
  return { m, mat, tex };
}

export function build(scene, { toon }) {
  // the hinge on the shelf's back edge; the counter's bottom edge is at its origin, its face toward the camera (+z)
  hinge = new THREE.Group();
  hinge.position.copy(machine.at("counterHinge"));
  scene.add(hinge);
  rig = new THREE.Group();
  rig.position.set(0, H / 2, 0);
  hinge.add(rig);

  // housing: a shallow box whose front sits just behind the face
  box(toon, W, H, D, "#161b22", 0, 0, -0.06 - D / 2);
  // the front plate around the drum window: four bars, so the drums sit recessed behind a real opening
  const wl = TENS_X - CELL_W / 2 - 0.012, wr = UNITS_X + CELL_W / 2 + 0.012, wt = WIN_Y + CELL_H / 2 + 0.012, wb = WIN_Y - CELL_H / 2 - 0.012;
  const PZ = -0.03, PD = 0.03, plate = "#1c232c";
  box(toon, W - 0.01, H / 2 - wt - 0.005, PD, plate, 0, (wt + H / 2) / 2, PZ);
  box(toon, W - 0.01, wb + H / 2 - 0.005, PD, plate, 0, (wb - H / 2) / 2, PZ);
  box(toon, wl + W / 2 - 0.005, wt - wb, PD, plate, (wl - W / 2) / 2, (wt + wb) / 2, PZ);
  box(toon, W / 2 - wr - 0.005, wt - wb, PD, plate, (wr + W / 2) / 2, (wt + wb) / 2, PZ);
  // a lip around the window and a thin divider between the drums
  const lip = "#3d4652";
  box(toon, wr - wl + 0.02, 0.01, 0.02, lip, (wl + wr) / 2, wt + 0.005, -0.008);
  box(toon, wr - wl + 0.02, 0.01, 0.02, lip, (wl + wr) / 2, wb - 0.005, -0.008);
  box(toon, 0.01, wt - wb + 0.02, 0.02, lip, wl - 0.005, (wt + wb) / 2, -0.008);
  box(toon, 0.01, wt - wb + 0.02, 0.02, lip, wr + 0.005, (wt + wb) / 2, -0.008);
  box(toon, 0.006, CELL_H, 0.01, "#0b0f14", (TENS_X + UNITS_X) / 2, WIN_Y, -0.038);

  tens = drum(true, TENS_X);
  units = drum(false, UNITS_X);

  // the window glass: dark at its top and bottom edges, so the strip reads as the face of a drum
  const gc = document.createElement("canvas"); gc.width = 8; gc.height = 64;
  const gg = gc.getContext("2d"), grad = gg.createLinearGradient(0, 0, 0, 64);
  [[0, 0.92], [0.3, 0], [0.7, 0], [1, 0.92]].forEach(([s, a]) => grad.addColorStop(s, `rgba(8,11,15,${a})`));
  gg.fillStyle = grad; gg.fillRect(0, 0, 8, 64);
  const gt = new THREE.CanvasTexture(gc); gt.colorSpace = THREE.SRGBColorSpace;
  glass = new THREE.Mesh(new THREE.PlaneGeometry(wr - wl, wt - wb), new THREE.MeshBasicMaterial({ map: gt, fog: false, transparent: true, depthWrite: false, opacity: 0 }));
  glass.position.set((wl + wr) / 2, WIN_Y, -0.025);
  rig.add(glass);

  // the printed face: label and "of 37" on the plate, a hairline border. The window area stays clear. 285 x 186 px.
  face = hero(W, H, 300, (g, Wp, Hp) => {
    g.strokeStyle = "#59616b"; g.lineWidth = 3; g.strokeRect(2, 2, Wp - 4, Hp - 4);
    text(g, "old search:", 20, 56, 37, { c: "#c9d1d9", w: 600 });
    text(g, "of 37", 112, 132, 52, { c: "#ffffff", w: 700 });
  });
  face.set({});
  face.mesh.position.set(0, 0, 0);
  faceMat = face.mesh.material;
  faceMat.opacity = 0;
  rig.add(face.mesh);

  // the 36 bloom: a soft neutral glow behind the housing, an event only (0 at rest)
  const bc = document.createElement("canvas"); bc.width = bc.height = 128;
  const bg = bc.getContext("2d"), rg = bg.createRadialGradient(64, 64, 0, 64, 64, 64);
  rg.addColorStop(0, "rgba(255,255,255,1)"); rg.addColorStop(1, "rgba(255,255,255,0)");
  bg.fillStyle = rg; bg.fillRect(0, 0, 128, 128);
  const bt = new THREE.CanvasTexture(bc); bt.colorSpace = THREE.SRGBColorSpace;
  bloom = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.95), basic("#dfe3e8", { map: bt, blending: THREE.AdditiveBlending, opacity: 0 }));
  bloom.position.set(0, 0, -D - 0.075); // behind the housing's back
  rig.add(bloom);

  // the drums are drawn from a continuous count; make sure it agrees with the fixed counterN everywhere
  for (let t = T.h13; t <= T.h16; t += 1 / 240) {
    const n = counterN(t), m = t < COUNT_IN ? 0 : t >= T.one3 ? 36 : Math.floor(36 * r01(t, COUNT_IN, DUR) + 1e-6);
    if (n !== m) { console.warn(`counter: drum clock disagrees with counterN at ${t.toFixed(3)}`); break; }
  }
}

// the count on the drums: n from counterN, rolling up from n - 1 since the tick that made it n
function shown(t) {
  const n = counterN(t);
  if (n <= 0) return { tens: 0, units: 0 };
  const tick = n === 36 ? T.one3 : COUNT_IN + (n / 36) * DUR;
  const p = n === 36 ? softBack(r01(t, tick, ROLL_LAST)) : io(r01(t, tick, ROLL));
  const v = n - 1 + p;
  // tens only turn on a carry, and roll with the units while they do
  const tensV = n % 10 === 0 ? n / 10 - 1 + p : Math.floor(n / 10);
  return { tens: tensV, units: v };
}

export function update(t) {
  // the counter is part of the machine; it fades in lying flat before hold 13 and out once it has lain down after 16,
  // so it never pops at its station window's edges (world.js shows it from h13 - 0.05 to h16 + 0.5)
  const a = r01(t, T.h13 - 0.05, 0.3) * (1 - r01(t, T.h16 + 0.1, 0.35));
  const on = a > 0.002;
  hinge.visible = on;
  if (!on) return;

  // the hinge: flat on the shelf (pi/2) until hold 13, standing (0) with one small overshoot, down again on hold 16
  hinge.position.copy(machine.at("counterHinge"));
  hinge.rotation.set((Math.PI / 2) * (1 - counterUp(t)), 0, 0);

  const d = t - T.one3;
  // the thunk on 36: down 0.022 in 0.08 s, back up with one small rebound; a slow breath while it holds
  const thunk = d < 0 || d > 0.5 ? 0 : d < 0.08 ? -0.022 * io(d / 0.08) : -0.022 * (1 - softBack((d - 0.08) / 0.36, 1.4));
  rig.position.set(0, H / 2 + thunk + 0.004 * Math.sin(t * 1.3), 0);
  rig.scale.setScalar(1);

  // light: the count is the subject while it climbs and lands; the lamp and the bin take hold 14 and 15
  const lit = 0.84 + 0.16 * io(r01(t, T.one3, 0.3));
  // hold 15: the bin is the subject, so the count drops to about a quarter of its lift, eased with the bin's tip
  const lift = t < T.h14 ? lit : t < T.h15 ? mix(lit, 0.75, io(r01(t, T.h14, 0.4))) : mix(0.75, 0.28, io(r01(t, T.h15, 0.45)));
  faceMat.color.setScalar(lift);
  [tens, units].forEach((dr) => dr.mat.color.setScalar(lift));
  const housing = 0.6 + 0.4 * lift;
  solids.forEach((m) => { m.material.color.copy(m.userData.base).multiplyScalar(housing); solidAlpha(m, a); });

  const s = shown(t);
  tens.tex.offset.y = 0.9 - s.tens / 10;
  units.tex.offset.y = 0.9 - s.units / 10;
  [tens, units].forEach((dr) => alpha(dr.m, a));
  alpha(glass, a);
  alpha(face.mesh, a);

  // the bloom: up in 0.08 s on 36, gone by 0.5 s
  const b = d < 0 ? 0 : d < 0.08 ? d / 0.08 : 1 - r01(d, 0.08, 0.42);
  alpha(bloom, 0.16 * io(b) * a);
}

// The error tray: under the lamp, right side, hold 15 only. Empty on every frame.
// Finished look: a shallow wall-mounted tray: a dark header bar with the label in white, grey side walls, and a
// paper-light lip and recessed floor (shaded a little at its inner edges) so "empty" reads at a glance. It slides in from the right with one
// small settle. While it holds, a slow band of light passes once across the empty floor and a few specks of dust drift
// down and come to rest on the lip: nothing else is in it. Everything is a pure function of t.
import * as THREE from "three";
import { alpha, hero, solidAlpha, text } from "../parts.js";
import { T, cl, io, r01 } from "../timeline.js";

// the animatic's tray: 0.7 x 0.42 at (1.75, 2.55), front at z -1.1. Nothing here reaches past x 2.1.
const X = 1.75, Y = 2.55, Z = -1.1, W = 0.7, H = 0.42;
const HEAD = 0.15, LIP = 0.05, WALL = 0.03, DEPTH = 0.14;
const BED_W = W - 2 * WALL, BED_H = H - HEAD - LIP, BED_Y = -H / 2 + LIP + BED_H / 2;
const SWEEP = [T.h15 + 1.1, 1.8]; // start, length: one pass, an event, not a state
const DUST = [[-0.2, 0.75, 2.2], [0.06, 0.95, 2.6], [0.21, 1.2, 2.0], [-0.07, 1.6, 2.4], [0.15, 2.1, 2.3]]; // x, start after h15, fall time

let rig, solids = [], header, shade, sweep, motes = [];

const softBack = (x, c1 = 0.9) => { x = cl(x); const c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

function box(toon, w, h, d, color, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(color, { fog: false }));
  m.position.set(x, y, z);
  rig.add(m); solids.push(m);
  return m;
}

function canvasTex(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function build(scene, { toon }) {
  rig = new THREE.Group();
  scene.add(rig);
  // the floor (the tray's back), recessed DEPTH behind the front: paper-light and unlit, so the empty bed is the
  // brightest thing on the right side of the frame through hold 15
  const floor = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.02), new THREE.MeshBasicMaterial({ color: "#d4d2cc", fog: false }));
  floor.position.set(0, 0, -DEPTH - 0.01);
  rig.add(floor); solids.push(floor);
  // walls: two sides in mid grey and a light lip, toon shaded so their depth reads against the floor
  const wall = "#6e7681";
  // (no two boxes share a front face: walls stop under the header, the lip sits between the walls)
  box(toon, WALL, H - HEAD, DEPTH, wall, -W / 2 + WALL / 2, -HEAD / 2, -DEPTH / 2);
  box(toon, WALL, H - HEAD, DEPTH, wall, W / 2 - WALL / 2, -HEAD / 2, -DEPTH / 2);
  box(toon, BED_W, LIP, DEPTH, "#e8e7e3", 0, -H / 2 + LIP / 2, -DEPTH / 2);
  // the header bar, full depth, its face carries the label
  box(toon, W, HEAD, DEPTH, "#1c232c", 0, H / 2 - HEAD / 2, -DEPTH / 2);
  solids.forEach((m) => (m.userData.base = m.material.color.clone()));

  header = hero(W - 0.02, HEAD - 0.01, 300, (g, Wp, Hp) => {
    text(g, "errors", 16, 34, 38, { c: "#ffffff", w: 700 });
    g.fillStyle = "#8b949e"; g.fillRect(0, Hp - 2, Wp, 2);
  });
  header.set({});
  header.mesh.position.set(0, H / 2 - HEAD / 2, 0.003);
  rig.add(header.mesh);

  // inner shadow on the floor: darker under the header and along the walls, open in the middle
  shade = new THREE.Mesh(new THREE.PlaneGeometry(BED_W, BED_H), new THREE.MeshBasicMaterial({
    fog: false, transparent: true, depthWrite: false,
    map: canvasTex(128, 64, (g, w, h) => {
      const v = g.createLinearGradient(0, 0, 0, h);
      v.addColorStop(0, "rgba(13,17,23,0.45)"); v.addColorStop(0.3, "rgba(13,17,23,0)"); v.addColorStop(1, "rgba(13,17,23,0.12)");
      g.fillStyle = v; g.fillRect(0, 0, w, h);
      const s = g.createLinearGradient(0, 0, w, 0);
      s.addColorStop(0, "rgba(13,17,23,0.3)"); s.addColorStop(0.1, "rgba(13,17,23,0)"); s.addColorStop(0.9, "rgba(13,17,23,0)"); s.addColorStop(1, "rgba(13,17,23,0.3)");
      g.fillStyle = s; g.fillRect(0, 0, w, h);
    }),
  }));
  shade.position.set(0, BED_Y, -DEPTH + 0.002);
  rig.add(shade);

  // the sweep: a soft band on a strip three beds wide; the texture slides, so the band never leaves the bed
  const st = canvasTex(384, 8, (g, w, h) => {
    const b = g.createLinearGradient(w / 3, 0, (2 * w) / 3, 0);
    b.addColorStop(0, "rgba(255,255,255,0)"); b.addColorStop(0.5, "rgba(255,255,255,1)"); b.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = b; g.fillRect(w / 3, 0, w / 3, h);
  });
  st.repeat.set(1 / 3, 1);
  sweep = new THREE.Mesh(new THREE.PlaneGeometry(BED_W, BED_H), new THREE.MeshBasicMaterial({ map: st, color: "#ffffff", fog: false, transparent: true, depthWrite: false, opacity: 0 }));
  sweep.position.set(0, BED_Y, -DEPTH + 0.004);
  rig.add(sweep);

  // dust: a few specks, each its own material
  DUST.forEach(() => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 0.012), new THREE.MeshBasicMaterial({ color: "#59616b", fog: false, transparent: true, depthWrite: false }));
    rig.add(m); motes.push(m);
  });
}

export function update(t) {
  const kin = r01(t, T.h15, 0.45), kout = io(r01(t, T.h16, 0.4));
  const k = io(kin) * (1 - kout);
  // in from the right with one small settle past its mark; out to the right as it fades
  const x = X + 1.2 * (1 - softBack(kin)) + 0.5 * kout;
  rig.position.set(x, Y + 0.003 * Math.sin(t * 1.2 + 0.7), Z);
  rig.visible = k > 0.002;
  if (!rig.visible) return;

  solids.forEach((m) => { m.material.color.copy(m.userData.base); solidAlpha(m, k); });
  alpha(header.mesh, k);
  alpha(shade, k);

  // the sweep: one pass left to right, a white band at peak 0.6 over the light floor, then nothing
  const sp = r01(t, SWEEP[0], SWEEP[1]);
  sweep.material.map.offset.x = (2 / 3) * (1 - io(sp));
  alpha(sweep, 0.6 * Math.sin(Math.PI * sp) * k);

  // dust drifts down from under the header and rests on the lip, swaying a little as it falls
  const top = BED_Y + BED_H / 2 - 0.02, floor = -H / 2 + LIP + 0.01;
  DUST.forEach(([dx, start, fall], i) => {
    const u = r01(t, T.h15 + start, fall);
    const m = motes[i];
    m.position.set(dx + 0.012 * Math.sin(u * 5 + i) * (1 - u), top + (floor - top) * io(u), -DEPTH / 2);
    alpha(m, k * Math.min(1, u * 6) * 0.85);
  });
}

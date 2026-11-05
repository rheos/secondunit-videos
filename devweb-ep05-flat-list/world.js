// devweb ep 5, "the flat list": one vertical world, one camera. A dark shaft: Blink on a ledge at the top, one cord
// down to an open blue toolbox, 35 cards clipped on in written order, and a bare back wall that fills with ten
// folders in the mass moment. This file owns the stage, the camera (camera.md, through the kit's cameraPath, keyed on
// Chris's words) and the station loop; each station lives in stations/<name>.js (build(scene, kit), update(t)) and is
// updated only inside its time window. Everything is a pure function of film time t.
import * as THREE from "three";
import { makeBlink, makeHarness, glyphTexture } from "./kit/blink3d.js";
import { cl, io, back, r01, mix, V, pulse, typed, cameraPath, panel, rr, stage } from "./kit/world.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { T } from "./parts.js";
import * as ledge from "./stations/ledge.js";
import * as column from "./stations/column.js";
import * as wall from "./stations/wall.js";
import * as slot from "./stations/slot.js";
import * as toolbox from "./stations/toolbox.js";

const VO = window.VO;
const w = (x, n) => VO.w(x, n);

// ---------- the camera (camera-r2.md, rev 2, with camera-r3.md's changed keys), fov 36 throughout ----------
const W = [[2.9, -14.35, 59.9], [2.9, -14.35, 0], 36]; // the shaft wide (11, 16)
const T5 = [[0.3, -16.9, 31.6], [0.0, -17.2, 1.3], 36]; // the column read (05, 10)
const B = [[0.4, -22.1, 25.7], [0.2, -22.65, 1.25], 36]; // the box, cards dropping in (02)
const B2 = [[0.3, -23.3, 22.3], [0.1, -23.85, 1.25], 36]; // the box, closer (02)
const C = [[0.4, -11.0, 41.6], [0.2, -11.3, 1.25], 36]; // the column, Blink to card 29 (03)
const F2 = [[3.4, -12.3, 30.3], [3.6, -12.6, -2.7], 36]; // ten folders (12, 13)
export const KEYS = [
  [0, [0.5, -3.0, 23.0], [0.3, -3.3, 1.0], 36],
  [w("folder", 1) + 0.3, [0.5, -3.05, 22.4], [0.3, -3.35, 1.0], 36],
  [w("note", 1) + 0.3, ...B],
  [w("do", 1), ...B2],
  [w("one", 2) + 0.3, ...C],
  [w("groups", 1), [0.3, -5.97, 14.0], [0.0, -6.22, 1.33], 36],
  [w("this", 1) + 0.4, [0.5, 0.1, 17.5], [0.45, -0.6, 0.7], 36],
  [w("tool", 1) + 0.15, [0.5, 0.05, 17.2], [0.45, -0.65, 0.7], 36],
  [w("names", 1) - 0.3, [0.8, -17.05, 31.6], [0.5, -17.35, 1.3], 36], // r3: memory tags inside the frame; r4: top in card 9, wider
  [w("memory", 2) + 0.35, [1.3, -17.05, 31.6], [1.0, -17.35, 1.3], 36],
  [w("recent", 1) + 0.1, [0.35, -10.0, 11.8], [0.0, -10.25, 1.3], 36],
  [w("recent", 1) + 0.4, [0.35, -9.99, 11.6], [0.0, -10.19, 1.3], 36],
  [w("saved", 1) + 0.25, [0.35, -0.2, 21.0], [0.3, -1.0, 0.7], 36],
  [w("errors", 1) + 0.2, [0.35, -0.35, 20.4], [0.3, -1.2, 0.7], 36],
  [w("there", 1), [0.35, -0.4, 20.2], [0.3, -1.25, 0.7], 36],
  [w("first", 2) + 0.35, [0.3, -10.69, 13.0], [-0.1, -10.69, 1.33], 36],
  [w("memory", 4) - 0.25, [0.9, -10.4, 13.9], [0.25, -10.9, 1.3], 36],
  [w("sits", 2) + 0.1, [0.9, -10.45, 13.8], [0.25, -10.95, 1.3], 36],
  [w("sits", 3) + 0.4, [0.9, -18.5, 13.9], [0.25, -19.0, 1.3], 36],
  [w("them", 3) - 0.1, [0.9, -18.55, 13.7], [0.25, -19.0, 1.3], 36],
  [w("says", 1) + 0.2, [0.6, -15.03, 23.6], [0.1, -15.43, 1.3], 36],
  [w("now", 1) - 0.1, [0.6, -14.97, 23.2], [0.1, -15.37, 1.3], 36],
  [w("named", 1) + 0.1, [0.3, -9.19, 9.9], [0.0, -9.54, 1.33], 36],
  [w("word", 3) + 0.2, [0.3, -9.11, 9.5], [0.0, -9.41, 1.33], 36],
  [w("finds", 1) + 0.4, [0.3, -16.42, 31.6], [0.0, -16.72, 1.3], 36], // r3: T5 lifted, box rim off the border; r4: top in card 8
  [w("note", 3) + 0.2, [0.35, -9.31, 14.3], [0.0, -9.61, 1.33], 36], // r3: the lost note, cards 11 and 12 close; r4: top in card 6
  [w("problem", 2), [0.3, -6.9, 15.3], [-0.1, -7.2, 1.33], 36],
  [w("anything", 1) + 0.3, [0.3, -13.7, 15.3], [-0.1, -14.0, 1.33], 36],
  [w("mostly", 1), [1.6, -5.62, 26.8], [1.4, -6.02, 0.0], 36],
  [w("then", 1) - 0.4, ...W],
  [w("makes", 1) + 0.2, ...F2], // r4: 0.3 s earlier, the crane to card 36 gets 3.7 s
  [w("36th", 1) + 0.9, [1.3, -27.75, 18.5], [1.3, -28.05, 0.0], 36], // r4: card 36, the box and the slot's left, folders out of the top
  [w("build", 1) + 0.1, [1.3, -27.71, 18.3], [1.3, -28.01, 0.0], 36],
  [w("pays", 1) + 0.04, [4.6, -27.15, 17.3], [4.6, -27.45, -2.7], 36], // r4: follows the copy into the whole slot, 2.45 s
  [w("list", 5) + 0.2, [4.9, -26.5, 15.3], [4.9, -26.8, -2.7], 36],
  [w("names", 2) + 0.3, ...F2],
  [w("already", 3), [3.1, -13.3, 28.8], [3.3, -13.6, -2.7], 36],
  [w("first", 9) + 0.3, [4.9, -23.17, 14.9], [4.9, -23.47, -2.7], 36], // r4: config, stats, invoice and the slot; graph out
  [w("send", 3) - 0.1, [4.9, -23.62, 16.3], [4.9, -23.92, -2.7], 36],
  [w("write", 3) + 0.4, [3.3, -8.91, 9.91], [0.0, -9.15, 1.33], 36], // r4: a little wider, top in card 7
  [w("first", 10) + 0.15, [3.0, -9.5, 25.4], [3.0, -9.8, -2.7], 36], // r4: card 11 and the whole memory folder through the landing
  [w("folder", 2) + 2.0, ...W],
  [VO.END, [2.9, -14.3, 61.0], [2.9, -14.3, 0], 36],
];
const cameraAt = cameraPath(KEYS);
// the target alone (no drift), the same easing as cameraPath: the fog reads the camera's distance from it
function targetAt(t) {
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++;
  const [t0, , g0] = KEYS[i], [t1, , g1] = KEYS[i + 1];
  const k = io((t - t0) / Math.max(0.001, t1 - t0));
  return V(mix(g0[0], g1[0], k), mix(g0[1], g1[1], k), mix(g0[2], g1[2], k));
}

// ---------- the stations and their time windows (outside its window a station is hidden and not updated) ----------
const STATIONS = [
  ["ledge", ledge, 0, Infinity],
  ["column", column, 0, Infinity],
  ["wall", wall, 0, Infinity],
  ["slot", slot, slot.FROM, T.rename + 0.6],
  ["toolbox", toolbox, 0, Infinity],
];

export async function buildWorld(canvas) {
  await document.fonts.ready;
  const { renderer, scene, cam, ramp, toon, grid } = stage(canvas, { fog: [30, 120] });
  grid.visible = false; // stage() puts it at y -1.72, slicing the shaft at the ledge; the shaft floor is a disc
  const glowTex = glyphTexture(THREE, (g, W2) => { const gr = g.createRadialGradient(W2 / 2, W2 / 2, 0, W2 / 2, W2 / 2, W2 / 2); gr.addColorStop(0, "rgba(255,255,255,0.95)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, W2, W2); }, 128, 128);
  const kit = { THREE, G: window.BLINK, ramp, toon, panel, rr, glyphTexture, makeBlink, makeHarness, RoundedBoxGeometry, glowTex, cl, io, back, r01, mix, V, pulse, typed };
  const roots = STATIONS.map(([, s]) => s.build(scene, kit));

  return function render(t) {
    cameraAt(t, cam);
    // fog from the camera's distance: wides keep the wall, closes keep the stage default
    const d = cam.position.distanceTo(targetAt(t));
    scene.fog.near = Math.max(30, d - 12); scene.fog.far = scene.fog.near + 95;
    STATIONS.forEach(([, s, a, b], n) => {
      const on = t >= a && t < b;
      roots[n].visible = on;
      if (on) s.update(t);
    });
    renderer.render(scene, cam);
  };
}

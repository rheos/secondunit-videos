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

// ---------- the camera (camera.md), fov 36 throughout ----------
const W = [[2.9, -14.35, 59.9], [2.9, -14.35, 0], 36]; // the shaft wide (02, 11, 12, 16)
const T5 = [[0.3, -16.9, 31.6], [0.0, -17.2, 1.3], 36]; // the column read (05, 10)
export const KEYS = [
  [0, [0.5, -3.0, 23.0], [0.3, -3.3, 1.0], 36],
  [w("folder", 1) + 0.3, [0.5, -3.05, 22.4], [0.3, -3.35, 1.0], 36],
  [w("say", 1) - 0.05, [0.5, -3.05, 22.4], [0.3, -3.35, 1.0], 36],
  [w("asks", 1) + 0.2, ...W],
  [w("back", 1), [2.9, -14.3, 59.3], [2.9, -14.3, 0], 36],
  [w("no", 1) - 0.15, [0.3, -5.2, 11.8], [0.0, -5.4, 1.33], 36],
  [w("groups", 1) - 0.1, [0.3, -5.15, 11.2], [0.0, -5.38, 1.33], 36],
  [w("this", 1) + 0.4, [0.5, 0.1, 17.5], [0.45, -0.6, 0.7], 36],
  [w("tool", 1) + 0.15, [0.5, 0.05, 17.2], [0.45, -0.65, 0.7], 36],
  [w("names", 1) - 0.3, ...T5],
  [w("memory", 2) + 0.35, [0.3, -16.85, 31.2], [0.0, -17.15, 1.3], 36],
  [w("recent", 1) + 0.1, [0.35, -9.2, 11.8], [0.0, -9.45, 1.3], 36],
  [w("recent", 1) + 0.4, [0.35, -9.2, 11.6], [0.0, -9.4, 1.3], 36],
  [w("saved", 1) + 0.25, [0.35, -0.2, 21.0], [0.3, -1.0, 0.7], 36],
  [w("errors", 1) + 0.2, [0.35, -0.35, 20.4], [0.3, -1.2, 0.7], 36],
  [w("time", 1) + 0.3, [0.35, -0.4, 20.2], [0.3, -1.25, 0.7], 36],
  [w("first", 2), [0.3, -11.0, 10.2], [-0.1, -11.0, 1.33], 36],
  [w("name", 2) + 0.3, [0.3, -11.0, 9.9], [-0.1, -11.0, 1.33], 36],
  [w("memory", 4) - 0.25, [0.9, -10.4, 13.9], [0.25, -10.9, 1.3], 36],
  [w("sits", 2) + 0.1, [0.9, -10.45, 13.8], [0.25, -10.95, 1.3], 36],
  [w("sits", 3) + 0.4, [0.9, -18.5, 13.9], [0.25, -19.0, 1.3], 36],
  [w("them", 3) - 0.1, [0.9, -18.55, 13.7], [0.25, -19.0, 1.3], 36],
  [w("says", 1) + 0.2, [0.6, -15.2, 23.6], [0.1, -15.6, 1.3], 36],
  [w("now", 1) - 0.1, [0.6, -15.2, 23.2], [0.1, -15.6, 1.3], 36],
  [w("named", 1) + 0.1, [0.3, -9.0, 9.9], [0.0, -9.35, 1.33], 36],
  [w("word", 3) + 0.2, [0.3, -9.05, 9.5], [0.0, -9.35, 1.33], 36],
  [w("finds", 1) + 0.4, ...T5],
  [w("note", 3) + 0.2, [0.35, -16.8, 30.8], [0.05, -17.1, 1.3], 36],
  [w("problem", 1) + 0.3, [0.6, -14.35, 59.9], [0.6, -14.35, 0], 36],
  [w("anything", 1) + 0.2, [0.6, -14.3, 59.3], [0.6, -14.3, 0], 36],
  [w("wrong", 1) + 0.1, [1.6, -5.6, 27.0], [1.4, -6.0, 0.0], 36],
  [w("mostly", 1), [1.6, -5.62, 26.8], [1.4, -6.02, 0.0], 36],
  [w("then", 1) + 0.2, ...W],
  [w("makes", 1) + 0.85, [2.9, -14.3, 58.6], [2.9, -14.3, 0], 36],
  [w("word", 6) + 0.1, [0.1, -25.0, 15.0], [0.1, -25.4, 1.3], 36],
  [w("build", 1), [0.1, -25.0, 14.8], [0.1, -25.4, 1.3], 36],
  [w("pays", 1) + 0.1, [4.4, -23.0, 17.5], [4.6, -23.6, -2.7], 36],
  [w("list", 5) + 0.2, [4.4, -23.05, 17.2], [4.6, -23.6, -2.7], 36],
  [w("matched", 1) + 0.1, [3.8, -16.5, 37.5], [4.4, -16.8, -2.7], 36],
  [w("already", 3), [4.2, -16.7, 37.0], [4.6, -16.9, -2.7], 36],
  [w("first", 9) + 0.3, [4.9, -23.1, 16.2], [4.9, -23.4, -2.7], 36],
  [w("rename", 1) - 0.15, [4.9, -23.15, 15.6], [4.9, -23.4, -2.7], 36],
  [w("write", 3) - 0.1, [0.75, -9.05, 12.0], [0.45, -9.25, 1.0], 36],
  [w("memory", 10) + 0.1, [0.75, -9.08, 11.7], [0.45, -9.25, 1.0], 36],
  // camera.md: VO.END sits 5.0 s after "folder" (2), more than 3 s, so this key moves from +1.6 to +2.0
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
  ["slot", slot, T.c36Copy - 0.1, T.rename + 0.6],
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

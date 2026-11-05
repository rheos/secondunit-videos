// devweb ep 6, gray box: one Three.js world, one continuous camera. Stage, camera and the station loop live here.
// Each station file owns its props and is told the time only inside its own window. Everything is a pure function of
// film time t: HyperFrames seeks frames in any order, and the finish renders them in order.
import * as THREE from "three";
import { cameraPath, stage } from "./kit/world.js";
import { SET_Z, T } from "./timeline.js";
import * as mark from "./stations/mark.js";
import * as line from "./stations/line.js";
import * as crate from "./stations/crate.js";
import * as tally from "./stations/tally.js";
import * as lamp from "./stations/lamp.js";
import * as tray from "./stations/tray.js";
import * as sheet from "./stations/sheet.js";
import * as queue from "./stations/queue.js";
import * as bay from "./stations/bay.js";

const VO = window.VO, w = (x, n) => VO.w(x, n);

// [time, position, target, fov, the film second camera.md expects]. Poses and reasons are in camera.md.
// KEYS-BEGIN
export const KEYS = [
  /* K01 */ [0, [0, 1.72, 11.25], [0, 1.72, -1.2], 36, 0.00],
  /* K02 */ [w("nothing", 1), [0, 1.66, 11], [0, 1.66, -1.2], 36, 1.12],
  /* K03 */ [w("the", 1), [0, 1.647, 10.95], [0, 1.647, -1.2], 36, 3.94],
  /* K04 */ [w("the", 2), [-0.1, 1.485, 10.3], [-0.1, 1.485, -1.2], 36, 4.90],
  /* K05 */ [w("hybrid", 2), [-0.1, 1.46, 10.2], [-0.1, 1.46, -1.2], 36, 6.42],
  /* K06 */ [w("august", 1) + 0.1, [-0.1, 1.435, 10.1], [-0.1, 1.435, -1.2], 36, 8.82],
  /* K07 */ [w("was", 1) + 0.1, [-0.17, 1.51, 10.4], [-0.17, 1.51, -1.2], 36, 9.74],
  /* K08 */ [w("model", 1) + 0.1, [-0.17, 1.485, 10.3], [-0.17, 1.485, -1.2], 36, 10.72],
  /* K09 */ [w("mode", 1), [-0.09, 1.41, 10], [-0.09, 1.41, -1.2], 36, 11.74],
  /* K10 */ [w("fts", 1), [-0.09, 1.385, 9.9], [-0.09, 1.385, -1.2], 36, 14.48],
  /* K11 */ [w("path", 1) + 0.1, [-0.09, 1.372, 9.85], [-0.09, 1.372, -1.2], 36, 17.02],
  /* K12 */ [w("would", 1), [0, 1.622, 10.85], [0, 1.622, -1.2], 36, 18.14],
  /* K13 */ [w("approve", 1) + 0.3, [0, 1.622, 10.85], [0, 1.622, -1.2], 36, 18.70],
  /* K14 */ [w("should", 1), [0, 1.61, 10.8], [0, 1.61, -1.2], 36, 19.42],
  /* K15 */ [w("model", 2), [-0.09, 1.423, 10.05], [-0.09, 1.423, -1.2], 36, 20.28],
  /* K16 */ [w("three", 1), [-0.09, 1.39, 9.92], [-0.09, 1.39, -1.2], 36, 23.56],
  /* K17 */ [w("in", 2), [-0.09, 1.385, 9.9], [-0.09, 1.385, -1.2], 36, 24.38],
  /* K18 */ [w("calls", 2) + 0.3, [0, 1.66, 11], [0, 1.66, -1.2], 36, 25.24],
  /* K19 */ [w("the", 9), [0, 1.597, 10.75], [0, 1.597, -1.2], 36, 28.52],
  /* K20 */ [w("calling", 1), [-0.09, 1.385, 9.9], [-0.09, 1.385, -1.2], 36, 29.54],
  /* K21 */ [w("53", 1), [-0.09, 1.35, 9.75], [-0.09, 1.35, -1.2], 36, 32.04],
  /* K22 */ [w("nothing", 2), [-0.09, 1.35, 9.75], [-0.09, 1.35, -1.2], 36, 34.16],
  /* K23 */ [w("it", 3), [0, 1.66, 11], [0, 1.66, -1.2], 36, 34.90],
  /* K24 */ [w("never", 1), [0, 1.597, 10.75], [0, 1.597, -1.2], 36, 37.90],
  /* K25 */ [w("error", 1), [0, 1.485, 10.3], [0, 1.485, -1.2], 36, 38.68],
  /* K26 */ [w("keys", 1), [0, 1.472, 10.25], [0, 1.472, -1.2], 36, 41.20],
  /* K27 */ [w("that", 3), [0, 1.472, 10.25], [0, 1.472, -1.2], 36, 41.96],
  /* K28 */ [w("mode", 3) + 0.28, [0, 1.66, 11], [0, 1.66, -1.2], 36, 43.26],
  /* K29 */ [w("back", 1) - 0.1, [0, 1.673, 11.05], [0, 1.673, -1.2], 36, 44.36],
  /* K30 */ [w("the", 13), [-0.25, 1.622, 10.85], [-0.25, 1.622, -1.2], 36, 45.32],
  /* K31 */ [w("own", 1), [-0.25, 1.61, 10.8], [-0.25, 1.61, -1.2], 36, 46.82],
  /* K32 */ [w("27th", 2), [0, 1.66, 11], [0, 1.66, -1.2], 36, 47.92],
  /* K33 */ [w("the", 14), [0, 1.635, 10.9], [0, 1.635, -1.2], 36, 48.90],
  /* K34 */ [w("protocol", 1), [-0.09, 1.423, 10.05], [-0.09, 1.423, -1.2], 36, 49.82],
  /* K35 */ [w("know", 1) + 0.1, [-0.09, 1.397, 9.95], [-0.09, 1.397, -1.2], 36, 52.78],
  /* K36 */ [w("day", 1), [0, 1.66, 11], [0, 1.66, -1.2], 36, 53.78],
  /* K37 */ [w("i", 1), [0, 1.635, 10.9], [0, 1.635, -1.2], 36, 55.74],
  /* K38 */ [w("a", 5), [0, 1.51, 10.4], [0, 1.51, -1.2], 36, 59.50],
  /* K39 */ [w("schema", 1) + 0.2, [-0.1, 1.42, 10.05], [-0.1, 1.42, -1.2], 36, 60.58],
  /* K40 */ [w("default", 4), [-0.1, 1.396, 9.95], [-0.1, 1.396, -1.2], 36, 62.22],
  /* K41 */ [w("callers", 2), [-0.1, 1.378, 9.9], [-0.1, 1.378, -1.2], 36, 66.58],
  /* K42 */ [w("model", 5), [-0.092, 1.345, 9.74], [-0.092, 1.345, -1.2], 36, 67.40],
  /* K43 */ [w("and", 7), [-0.092, 1.335, 9.7], [-0.092, 1.335, -1.2], 36, 70.84],
  /* K44 */ [w("on", 7) + 0.1, [-0.092, 1.335, 9.7], [-0.092, 1.335, -1.2], 36, 72.46],
  /* K45 */ [w("the", 20), [0, 1.66, 11], [0, 1.66, -1.2], 36, 73.46],
  /* K46 */ [w("call", 3), [0, 1.622, 10.85], [0, 1.622, -1.2], 36, 77.26],
  /* K47 */ [w("date", 1) + 0.1, [0, 1.51, 10.4], [0, 1.51, -1.2], 36, 78.42],
  /* K48 */ [w("mode", 7), [0, 1.502, 10.37], [0, 1.502, -1.2], 36, 80.02],
  /* K49 */ [w("flip", 1) + 0.1, [0, 1.497, 10.35], [0, 1.497, -1.2], 36, 80.90],
  /* K50 */ [w("tell", 1), [0, 1.49, 10.32], [0, 1.49, -1.2], 36, 82.06],
  /* K51 */ [w("or", 1), [0, 1.48, 10.28], [0, 1.48, -1.2], 36, 84.24],
  /* K52 */ [w("why", 1) + 0.4, [0, 1.472, 10.25], [0, 1.472, -1.2], 36, 86.46],
  /* K53 */ [w("count", 2), [0, 1.66, 11], [0, 1.66, -1.2], 36, 87.24],
  /* K54 */ [w("breaks", 1), [0, 1.61, 10.8], [0, 1.61, -1.2], 36, 90.48],
  /* K55 */ [w("nothing", 3) + 0.25, [0, 1.597, 10.75], [0, 1.597, -1.2], 36, 91.21],
  /* K56 */ [VO.END, [0, 1.622, 10.85], [0, 1.622, -1.2], 36, 92.88],
];
// KEYS-END
KEYS.forEach((k, i) => {
  if (Math.abs(k[0] - k[4]) > 0.011) throw new Error(`camera key K${i + 1}: ${k[0]} is not ${k[4]}`);
  if (i && k[0] <= KEYS[i - 1][0]) throw new Error(`camera key K${i + 1} is out of order`);
});
const cameraAt = cameraPath(KEYS);

// each station: its file and the film spans in which it exists. Outside them it is hidden and update() isn't called.
const WHOLE = [[0, T.END]];
const STATIONS = [
  { name: "line", mod: line, win: WHOLE },
  { name: "lamp", mod: lamp, win: WHOLE },
  { name: "crate", mod: crate, win: WHOLE },
  { name: "tally", mod: tally, win: WHOLE },
  { name: "tray", mod: tray, win: [[T.b14 - 0.05, T.b17 + 0.7]] },
  { name: "sheet", mod: sheet, win: WHOLE },
  { name: "queue", mod: queue, win: [[T.b03 - 0.05, T.b06 + 0.7], [T.b07 - 0.4, T.b07 + 0.7], [T.b23 - 0.05, T.caller2 + 0.35]] },
  { name: "bay", mod: bay, win: [[T.b08 - 0.05, T.b09 + 0.5], [T.b29 - 0.25, T.b32 + 0.35]] },
  { name: "mark", mod: mark, win: WHOLE },
];

export async function buildWorld(canvas) {
  // canvases can't use a face the DOM hasn't asked for yet
  await Promise.all(["400", "500", "600", "700"].map((wt) => document.fonts.load(`${wt} 24px 'IBM Plex Mono'`)));
  await document.fonts.ready;
  const { renderer, scene, cam, ramp, toon, grid } = stage(canvas, { fog: [12.1, 28.6], floorY: -1.12 });
  grid.material.opacity = 0.12;
  const kit = { toon, ramp, G: window.BLINK };
  // everything but Blink stands back by SET_Z; Blink's mark and the camera's keys stay in world space
  const set = new THREE.Group();
  set.position.z = SET_Z;
  scene.add(set);
  STATIONS.forEach((s) => {
    s.group = new THREE.Group();
    (s.mod === mark ? scene : set).add(s.group);
    s.mod.build(s.group, kit);
  });
  return function render(time) {
    const t = Math.max(0, Math.min(T.END, time));
    STATIONS.forEach((s) => {
      const on = s.win.some(([a, b]) => t >= a && t <= b);
      s.group.visible = on;
      if (on) s.mod.update(t);
    });
    cameraAt(t, cam);
    renderer.render(scene, cam);
  };
}

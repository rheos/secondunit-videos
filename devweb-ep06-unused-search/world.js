// devweb ep 6, gray box: one Three.js world, one continuous camera. Stage, camera and the station loop live here.
// Each station file owns its props and is told the time only inside its own window. Everything is a pure function of
// film time t: HyperFrames seeks frames in any order, and the finish renders them in order.
import * as THREE from "three";
import { cameraPath, stage } from "./kit/world.js";
import { FOOT_Y, T } from "./timeline.js";
import * as mark from "./stations/mark.js";
import * as crate from "./stations/crate.js";
import * as cards from "./stations/cards.js";
import * as lamp from "./stations/lamp.js";
import * as counter from "./stations/counter.js";
import * as tray from "./stations/tray.js";
import * as strip from "./stations/strip.js";
import * as note from "./stations/note.js";
import * as panels from "./stations/panels.js";
import * as log from "./stations/log.js";

const VO = window.VO, w = (x, n) => VO.w(x, n);

// [time, position, target, fov, the film second it should resolve to]. The gray box owns the camera this round:
// poses from the old camera.md, re-aimed at the plain-words set. Pushes pivot on Blink's foot (y = 0.2444 z - 0.88) except
// CLOSE, which pivots on the crate's lid so the overlay band above it stays clear.
// KEYS-BEGIN
export const KEYS = [
  /* K01 h01 dial close, Blink large */ [0, [-0.05, 1.69, 10.0], [-0.05, 1.69, -1.2], 36, 0.00],
  /* K02 h02 creep, overlay above the lid */ [w("it", 1), [-0.05, 1.687, 9.96], [-0.05, 1.687, -1.2], 36, 2.58],
  /* K03 h03 depart */ [w("here's", 1), [-0.05, 1.687, 9.96], [-0.05, 1.687, -1.2], 36, 4.14],
  /* K04 h03 pull back to base, lead: meaning (new) sliding off */ [w("my", 2), [0, 1.711, 10.6], [0, 1.711, -1.2], 36, 5.20],
  /* K05 h05 depart */ [w("in", 1), [0, 1.7, 10.55], [0, 1.7, -1.2], 36, 9.54],
  /* K06 h05 small push to the dial, lead: meaning (new) appearing */ [w("added", 1), [-0.16, 1.466, 9.6], [-0.16, 1.466, -1.2], 36, 10.40],
  /* K07 h06 depart */ [w("i", 3), [-0.16, 1.454, 9.55], [-0.16, 1.454, -1.2], 36, 13.68],
  /* K08 h06 base, wider right, lead: the queue sliding in */ [w("anything", 1), [0.1, 1.808, 11.0], [0.1, 1.808, -1.2], 36, 14.44],
  /* K09 h07 depart */ [w("so", 1), [0.1, 1.796, 10.95], [0.1, 1.796, -1.2], 36, 16.50],
  /* K10 h07 push to the dial (queue kept in frame), lead: the tag swinging */ [w("old", 2), [0, 1.564, 10.0], [0, 1.564, -1.2], 36, 17.40],
  /* K11 h08 depart */ [w("ask", 1), [0, 1.552, 9.95], [0, 1.552, -1.2], 36, 19.06],
  /* K12 h08 base, lead: the first card into the slot */ [w("special", 1) + 0.1, [0, 1.711, 10.6], [0, 1.711, -1.2], 36, 19.76],
  /* K13 h09 creep, lamp in frame */ [w("that's", 1), [0, 1.7, 10.55], [0, 1.7, -1.2], 36, 22.52],
  /* K14 h09 creep, overlay above the lid */ [w("nothing", 2), [0, 1.69, 10.5], [0, 1.69, -1.2], 36, 25.48],
  /* K15 h10 depart */ [w("but", 1), [0, 1.69, 10.5], [0, 1.69, -1.2], 36, 26.42],
  /* K16 h10 favour Blink, lead: its card popping out */ [w("is", 1), [-0.2, 1.417, 9.4], [-0.2, 1.417, -1.2], 36, 27.18],
  /* K17 h11 depart */ [w("it", 4), [-0.2, 1.405, 9.35], [-0.2, 1.405, -1.2], 36, 29.56],
  /* K18 h11 push to the crate face, lead: the plate dropping */ [w("new", 1), [-0.16, 1.466, 9.6], [-0.16, 1.466, -1.2], 36, 30.40],
  /* K19 h12 depart */ [w("it", 5), [-0.16, 1.454, 9.55], [-0.16, 1.454, -1.2], 36, 33.50],
  /* K20 h12 base, lead: Blink's card going in */ [w("ask", 2), [0, 1.711, 10.6], [0, 1.711, -1.2], 36, 34.24],
  /* K21 h13 depart */ [w("in", 3), [0, 1.711, 10.6], [0, 1.711, -1.2], 36, 35.28],
  /* K22 h13 wider, counter in frame: the mass moment */ [w("36", 1), [0.22, 1.955, 11.6], [0.22, 1.955, -1.2], 36, 36.20],
  /* K23 h15 depart (h14 holds here, lamp in frame) */ [w("a", 5), [0.22, 1.943, 11.55], [0.22, 1.943, -1.2], 36, 40.96],
  /* K24 h15 push right, lead: the tray sliding in */ [w("uses", 1), [0.35, 1.466, 9.6], [0.35, 1.466, -1.2], 36, 41.84],
  /* K25 h16 depart */ [w("so", 2), [0.35, 1.454, 9.55], [0.35, 1.454, -1.2], 36, 45.46],
  /* K26 h16 base, lead: the strip unrolling */ [w("changed", 1) + 0.34, [0, 1.711, 10.6], [0, 1.711, -1.2], 36, 46.40],
  /* K27 h17 depart */ [w("53", 1), [0, 1.711, 10.6], [0, 1.711, -1.2], 36, 47.24],
  /* K28 h17 push to the strip, lead: the marker */ [w("i", 5) + 0.1, [-0.03, 1.515, 9.8], [-0.03, 1.515, -1.2], 36, 48.02],
  /* K29 h18 depart */ [w("i", 6), [-0.03, 1.503, 9.75], [-0.03, 1.503, -1.2], 36, 48.76],
  /* K30 h18 favour Blink, strip in frame, lead: the note landing */ [w("a", 6), [-0.045, 1.54, 9.9], [-0.045, 1.54, -1.2], 36, 49.54],
  /* K31 h19 depart */ [w("that", 6), [-0.045, 1.528, 9.85], [-0.045, 1.528, -1.2], 36, 51.96],
  /* K32 h19 base, lead: Blink's card to the slot */ [w("day", 1) + 0.2, [0, 1.711, 10.6], [0, 1.711, -1.2], 36, 52.78],
  /* K33 h20 same frame, creep */ [w("i", 7), [0, 1.7, 10.55], [0, 1.7, -1.2], 36, 54.96],
  /* K34 h21 base, overlay above the lid */ [w("here's", 2), [0, 1.711, 10.6], [0, 1.711, -1.2], 36, 58.00],
  /* K35 h22 depart */ [w("it", 10), [0, 1.7, 10.55], [0, 1.7, -1.2], 36, 61.82],
  /* K36 h22 push to the face, lead: Blink's gaze on the plate */ [w("list", 1) + 0.2, [-0.16, 1.466, 9.6], [-0.16, 1.466, -1.2], 36, 62.64],
  /* K37 h23 creep */ [w("so", 3), [-0.16, 1.454, 9.55], [-0.16, 1.454, -1.2], 36, 64.38],
  /* K38 h24 depart */ [w("either", 1), [-0.16, 1.442, 9.5], [-0.16, 1.442, -1.2], 36, 66.14],
  /* K39 h24 pull back a little, lead: the left panel turning */ [w("thing", 1), [0.1, 1.76, 10.8], [0.1, 1.76, -1.2], 36, 66.92],
  /* K40 h26 depart */ [w("then", 1), [0.1, 1.748, 10.75], [0.1, 1.748, -1.2], 36, 70.84],
  /* K41 h26 base, lead: the panels clearing */ [w("logs", 2), [0, 1.711, 10.6], [0, 1.711, -1.2], 36, 71.62],
  /* K42 h27 depart */ [w("otherwise", 1), [0, 1.7, 10.55], [0, 1.7, -1.2], 36, 73.80],
  /* K43 h27 dial close as hold 02, lead: Blink's card */ [w("built", 1), [-0.05, 1.69, 10.0], [-0.05, 1.69, -1.2], 36, 74.62],
  /* K44 h27 creep */ [w("old", 4), [-0.05, 1.687, 9.96], [-0.05, 1.687, -1.2], 36, 77.56],
  /* K45 h28 eased back, the path clamps */ [VO.END, [-0.05, 1.7, 10.1], [-0.05, 1.7, -1.2], 36, 79.35],
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
  { name: "crate", mod: crate, win: WHOLE },
  { name: "lamp", mod: lamp, win: WHOLE },
  { name: "counter", mod: counter, win: [[T.h13 - 0.05, T.h16 + 0.5]] },
  { name: "tray", mod: tray, win: [[T.h15 - 0.05, T.h16 + 0.5]] },
  { name: "strip", mod: strip, win: [[T.h16, T.h21 + 0.7]] },
  { name: "note", mod: note, win: [[T.h18 - 0.05, T.h21 + 0.5]] },
  { name: "panels", mod: panels, win: [[T.h24 - 0.05, T.h26 + 0.4]] },
  { name: "log", mod: log, win: [[T.h26 - 0.05, T.h27 + 0.4]] },
  { name: "cards", mod: cards, win: WHOLE },
  { name: "mark", mod: mark, win: WHOLE },
];

export async function buildWorld(canvas) {
  // canvases can't use a face the DOM hasn't asked for yet
  await Promise.all(["400", "500", "600", "700"].map((wt) => document.fonts.load(`${wt} 24px 'IBM Plex Mono'`)));
  await document.fonts.ready;
  const { renderer, scene, cam, ramp, toon, grid } = stage(canvas, { fog: [12.1, 28.6], floorY: FOOT_Y - 0.02 });
  grid.material.opacity = 0.12;
  const kit = { toon, ramp, G: window.BLINK };
  STATIONS.forEach((s) => {
    s.group = new THREE.Group();
    scene.add(s.group);
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

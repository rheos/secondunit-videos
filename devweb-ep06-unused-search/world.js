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

// [time, position, target, fov, the film second it should resolve to, subject]. DP final (camera-final.md in the run):
// a designed camera. One move per change of subject, each arriving 0-3 frames before the word or hit it serves, with a
// creep between moves (a "creep" key nudges the pose toward the next one). The hook opens close on the dial from the
// left, already moving at frame 0 (K01 starts before 0), with Blink as foreground; the pushes on the counter (36), the
// tray, the turn on day 53 and the list/default tag in the tip drop Blink's visor out; everything else keeps it whole. Poses were fitted in node against
// the framing rules in camera-check.mjs; `node check-graybox.mjs` measures them. Subject names are camera-check's
// SUBJECTS (cameraPath ignores the sixth field). All keys share the kit's io ease: the kit offers no other.
// KEYS-BEGIN
export const KEYS = [
  /* K01 hook: already moving at frame 0 */ [T.h01 - 0.72, [-1.85, 3.12, 5.9], [-0.2, 2.64, -1.47], 36, -0.60, "dial"],
  /* K02 pan right with the needle to meaning (new) */ [T.smarter + 0.5, [-1.38, 2.8, 5], [0.2, 2.42, -1.47], 36, 1.88, "needle"],
  /* K03 creep */ [w("it", 1), [-1.36, 2.79, 4.94], [0.21, 2.42, -1.47], 36, 2.58, "needle"],
  /* K04 punch onto the old stop, 2 f before the thunk */ [w("it", 1) + 0.35, [-1.6, 2.74, 4.35], [-0.08, 2.46, -1.47], 36, 2.93, "dial"],
  /* K05 settle */ [w("here's", 1) - 0.2, [-1.58, 2.74, 4.47], [-0.06, 2.45, -1.47], 36, 3.94, "dial"],
  /* K06 reveal: Blink and the box */ [w("my", 2), [-0.37, 1.712, 10.178], [-0.37, 1.712, -1.2], 36, 5.20, "set"],
  /* K07 creep toward the card coming in */ [w("and", 1), [-0.444, 1.712, 10.178], [-0.444, 1.712, -1.2], 36, 6.84, "set"],
  /* K08 with the card to the slot */ [w("to", 1) + 0.2, [0.262, 1.236, 12.503], [0.262, 1.236, -1.2], 36, 7.58, "queue"],
  /* K09 the card down the old chute */ [w("keywords", 1) - 0.05, [-0.51, 1.674, 7.791], [-0.51, 1.674, -1.2], 36, 8.63, "chuteL"],
  /* K10 creep */ [w("in", 1), [-0.498, 1.643, 7.86], [-0.498, 1.643, -1.2], 36, 9.54, "chuteL"],
  /* K11 meaning (new) slid in */ [w("added", 1), [-0.366, 1.29, 8.653], [-0.366, 1.29, -1.2], 36, 10.40, "labels"],
  /* K12 creep */ [w("that", 1), [-0.363, 1.343, 8.67], [-0.363, 1.343, -1.2], 36, 11.60, "labels"],
  /* K13 toward meaning (new) */ [w("meaning", 1) - 0.02, [-0.332, 1.948, 8.867], [-0.332, 1.948, -1.2], 36, 12.86, "newchute"],
  /* K14 creep */ [w("i", 3), [-0.305, 1.9, 9.031], [-0.305, 1.9, -1.2], 36, 13.68, "newchute"],
  /* K15 the queue sliding in */ [w("anything", 1), [0.002, 1.352, 10.914], [0.002, 1.352, -1.2], 36, 14.44, "feed"],
  /* K16 creep */ [w("used", 2) - 0.3, [0.002, 1.322, 10.914], [0.002, 1.322, -1.2], 36, 15.06, "feed"],
  /* K17 along the line of callers */ [w("tool", 2), [0.002, 0.978, 10.914], [0.002, 0.978, -1.2], 36, 15.96, "feed"],
  /* K18 creep */ [w("kept", 2), [-0.041, 1.03, 10.653], [-0.041, 1.03, -1.2], 36, 17.06, "feed"],
  /* K19 the tag swings on default */ [T.dflt - 0.05, [-0.532, 1.626, 7.647], [-0.532, 1.626, -1.2], 36, 18.25, "tag"],
  /* K20 creep */ [T.dflt + 0.55, [-0.489, 1.604, 7.908], [-0.489, 1.604, -1.2], 36, 18.85, "tag"],
  /* K21 card into the slot */ [w("special", 1) - 0.04, [0.002, 1.352, 10.914], [0.002, 1.352, -1.2], 36, 19.62, "feed"],
  /* K22 creep */ [w("special", 1) + 0.3, [-0.02, 1.374, 10.781], [-0.02, 1.374, -1.2], 36, 19.96, "feed"],
  /* K23 cards down the old chute */ [w("keywords", 2) - 0.02, [-0.436, 1.794, 8.251], [-0.436, 1.794, -1.2], 36, 20.68, "chuteL"],
  /* K24 creep */ [w("that's", 1), [-0.395, 1.753, 8.499], [-0.395, 1.753, -1.2], 36, 22.52, "chuteL"],
  /* K25 up to the lamp */ [w("ship", 1), [0.074, 1.286, 11.346], [0.074, 1.286, -1.2], 36, 23.70, "lamp"],
  /* K26 creep */ [w("and", 3) - 0.5, [0.074, 1.318, 11.346], [0.074, 1.318, -1.2], 36, 24.18, "lamp"],
  /* K27 settle on it worked */ [w("worked", 1) - 0.02, [0.074, 1.684, 11.346], [0.074, 1.684, -1.2], 36, 24.88, "lamp"],
  /* K28 creep */ [w("nothing", 2), [0.037, 1.672, 11.262], [0.037, 1.672, -1.2], 36, 25.48, "lamp"],
  /* K29 down to Blink before its card pops */ [T.h10 - 0.24, [-0.86, 1.386, 9.244], [-0.86, 1.386, -1.2], 36, 26.18, "blink"],
  /* K30 creep */ [T.h10 + 0.6, [-0.82, 1.391, 9.384], [-0.82, 1.391, -1.2], 36, 27.02, "blink"],
  /* K31 with its card to the queue */ [T.h10 + 1.5, [-0.056, 1.49, 12.053], [-0.056, 1.49, -1.2], 36, 27.92, "blinkcard"],
  /* K32 creep */ [w("it", 4), [-0.084, 1.516, 11.759], [-0.084, 1.516, -1.2], 36, 29.56, "blinkcard"],
  /* K33 the plate lands */ [T.new1 - 0.06, [-0.412, 1.816, 8.382], [-0.412, 1.816, -1.2], 36, 30.34, "plate"],
  /* K34 creep */ [T.listed, [-0.402, 1.833, 8.445], [-0.402, 1.833, -1.2], 36, 31.54, "plate"],
  /* K35 the mark reads down */ [T.desc - 0.02, [-0.282, 2.03, 9.166], [-0.282, 2.03, -1.2], 36, 32.68, "plate"],
  /* K36 creep */ [w("it", 5), [-0.259, 1.976, 9.306], [-0.259, 1.976, -1.2], 36, 33.50, "plate"],
  /* K37 its card in the queue */ [w("ask", 2), [0.002, 1.352, 10.914], [0.002, 1.352, -1.2], 36, 34.24, "feed"],
  /* K38 creep */ [w("in", 3), [0.013, 1.308, 10.981], [0.013, 1.308, -1.2], 36, 35.28, "feed"],
  /* K39 the stream and the counter */ [w("36", 1) - 0.02, [0.142, 0.808, 11.749], [0.142, 0.808, -1.2], 36, 36.18, "stream"],
  /* K40 creep */ [w("searches", 1), [0.142, 0.718, 11.749], [0.142, 0.718, -1.2], 36, 37.64, "stream"],
  /* K41 36 seats */ [T.one3 + 0.21, [1.734, 2.95, 4.102], [1.734, 2.95, -1.2], 36, 39.05, "counter"],
  /* K42 settle */ [w("and", 4) + 0.9, [1.73, 2.956, 4.196], [1.73, 2.956, -1.2], 36, 40.40, "counter"],
  /* K43 the tray */ [T.uses - 0.02, [1.69, 3.02, 5.281], [1.69, 3.02, -1.2], 36, 41.82, "tray"],
  /* K44 creep */ [w("crash", 1) - 0.2, [1.62, 2.851, 6.129], [1.62, 2.851, -1.2], 36, 42.62, "tray"],
  /* K45 back for Blink */ [w("no", 1) - 0.02, [0.816, 0.906, 15.88], [0.816, 0.906, -1.2], 36, 43.88, "tray"],
  /* K46 creep */ [w("so", 2), [0.742, 0.992, 15.554], [0.742, 0.992, -1.2], 36, 45.46, "tray"],
  /* K47 the strip unrolls */ [T.changedEnd, [-0.11, 1.984, 11.809], [-0.11, 1.984, -1.2], 36, 46.40, "strip"],
  /* K48 creep */ [T.h17 + 0.05, [-0.107, 1.96, 11.709], [-0.107, 1.96, -1.2], 36, 47.29, "strip"],
  /* K49 with the marker to day 53 */ [T.h17 + 1.03, [-0.07, 1.68, 10.559], [-0.07, 1.68, -1.2], 36, 48.27, "strip"],
  /* K50 creep */ [T.h18, [-0.092, 1.665, 10.528], [-0.092, 1.665, -1.2], 36, 48.76, "strip"],
  /* K51 the note lands */ [T.h18 + 1.08, [-0.796, 1.196, 9.525], [-0.796, 1.196, -1.2], 36, 49.84, "note"],
  /* K52 creep */ [w("about", 1), [-0.806, 1.199, 9.428], [-0.806, 1.199, -1.2], 36, 50.44, "note"],
  /* K53 push on Blink */ [w("search", 5), [-0.916, 1.23, 8.316], [-0.916, 1.23, -1.2], 36, 51.28, "note"],
  /* K54 creep */ [T.h19 + 0.16, [-0.903, 1.241, 8.28], [-0.903, 1.241, -1.2], 36, 52.12, "note"],
  /* K55 the needle swings to new */ [T.h19 + 0.88, [0.414, 2.35, 4.76], [0.414, 2.35, -1.2], 36, 52.84, "turn"],
  /* K56 down the new chute */ [T.h19 + 1.62, [0.254, 2.874, 6.507], [0.254, 2.874, -1.2], 36, 53.58, "newchute"],
  /* K57 creep */ [w("i", 7) - 1.26, [0.243, 2.857, 6.534], [0.243, 2.857, -1.2], 36, 53.70, "newchute"],
  /* K58 side-eye */ [w("i", 7) - 0.02, [-0.86, 1.2, 9.244], [-0.86, 1.2, -1.2], 36, 54.94, "blink"],
  /* K59 creep */ [w("but", 2), [-0.829, 1.226, 9.266], [-0.829, 1.226, -1.2], 36, 56.54, "blink"],
  /* K60 push on the bet */ [w("way", 2), [-0.478, 1.522, 9.525], [-0.478, 1.522, -1.2], 36, 57.44, "blink"],
  /* K61 creep */ [w("here's", 2) - 0.14, [-0.47, 1.526, 9.525], [-0.47, 1.526, -1.2], 36, 57.86, "blink"],
  /* K62 the tip */ [w("tip", 1) - 0.02, [-0.226, 1.662, 9.525], [-0.226, 1.662, -1.2], 36, 58.74, "tip"],
  /* K63 creep */ [w("explore", 1), [-0.239, 1.678, 9.444], [-0.239, 1.678, -1.2], 36, 60.40, "tip"],
  /* K64 in on the plate */ [w("tools", 1), [-0.39, 1.864, 8.516], [-0.39, 1.864, -1.2], 36, 61.10, "tip"],
  /* K65 creep */ [w("it", 10), [-0.347, 1.924, 8.293], [-0.347, 1.924, -1.2], 36, 61.82, "tip"],
  /* K66 reads the list */ [T.list - 0.02, [0.15, 2.612, 5.724], [0.15, 2.612, -1.2], 36, 62.62, "plate"],
  /* K67 goes with the default */ [T.dflt2 - 0.02, [0.016, 2.756, 5.095], [0.016, 2.756, -1.2], 36, 63.48, "tag"],
  /* K68 creep */ [w("so", 3), [-0.015, 2.658, 5.38], [-0.015, 2.658, -1.2], 36, 64.38, "tag"],
  /* K69 the new thing */ [w("new", 2) - 0.02, [-0.37, 1.53, 8.653], [-0.37, 1.53, -1.2], 36, 65.36, "labels"],
  /* K70 creep */ [w("either", 1), [-0.34, 1.516, 8.847], [-0.34, 1.516, -1.2], 36, 66.14, "labels"],
  /* K71 the panels */ [w("thing", 1) - 0.02, [0, 1.354, 11.073], [0, 1.354, -1.2], 36, 66.90, "panels"],
  /* K72 creep */ [w("or", 1) - 0.62, [0.007, 1.399, 11.137], [0.007, 1.399, -1.2], 36, 67.46, "panels"],
  /* K73 to the right panel */ [w("or", 1) - 0.02, [0.086, 1.916, 11.869], [0.086, 1.916, -1.2], 36, 68.06, "panels"],
  /* K74 creep */ [w("plain", 1), [0.079, 1.897, 11.805], [0.079, 1.897, -1.2], 36, 68.82, "panels"],
  /* K75 when to use it */ [w("when", 3) - 0.02, [0, 1.68, 11.073], [0, 1.68, -1.2], 36, 69.50, "panels"],
  /* K76 creep */ [w("then", 1), [0.017, 1.653, 11.161], [0.017, 1.653, -1.2], 36, 70.84, "panels"],
  /* K77 the log */ [w("logs", 2) - 0.02, [0.212, 1.342, 12.179], [0.212, 1.342, -1.2], 36, 71.60, "log"],
  /* K78 creep */ [w("to", 6), [0.21, 1.385, 12.169], [0.21, 1.385, -1.2], 36, 71.84, "log"],
  /* K79 down the rows */ [w("picks", 1), [0.192, 1.882, 12.053], [0.192, 1.882, -1.2], 36, 72.98, "log"],
  /* K80 creep */ [w("otherwise", 1), [0.153, 1.852, 11.917], [0.153, 1.852, -1.2], 36, 73.80, "log"],
  /* K81 back to Blink and the dial */ [w("built", 1) - 0.02, [-0.596, 1.29, 9.323], [-0.596, 1.29, -1.2], 36, 74.60, "end"],
  /* K82 creep */ [T.h27 + 1.9, [-0.619, 1.267, 9.399], [-0.619, 1.267, -1.2], 36, 75.70, "end"],
  /* K83 its card to the slot */ [T.h27 + 2.6, [-0.884, 1.006, 10.271], [-0.884, 1.006, -1.2], 36, 76.40, "end"],
  /* K84 creep */ [w("using", 4), [-0.882, 0.998, 10.075], [-0.882, 0.998, -1.2], 36, 77.08, "end"],
  /* K85 the look to camera */ [w("one", 4) - 0.02, [-0.86, 0.904, 7.82], [-0.86, 0.904, -1.2], 36, 77.72, "blink"],
  /* K86 eased out under the end mark */ [VO.END, [-0.86, 0.966, 8.94], [-0.86, 0.966, -1.2], 36, 79.35, "blink"],
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

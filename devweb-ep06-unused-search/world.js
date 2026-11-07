// devweb ep 6, gray box: one Three.js world, one continuous camera. Stage, camera and the station loop live here.
// Each station file owns its props and is told the time only inside its own window. Everything is a pure function of
// film time t: HyperFrames seeks frames in any order, and the finish renders them in order.
import * as THREE from "three";
import { cameraPath, stage } from "./kit/world.js";
import { FOOT_Y, T } from "./timeline.js";
import * as mark from "./stations/mark.js";
import * as machine from "./stations/machine.js";
import * as programs from "./stations/programs.js";
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
// the framing rules in the kit's camera-check.mjs; `node check-graybox.mjs` measures them. Subject names are
// camera-set.mjs's SUBJECTS (cameraPath ignores the sixth field). All keys share the kit's io ease: the kit offers no other.
// KEYS-BEGIN
export const KEYS = [
  /* K01 hook: already moving at frame 0 */ [T.h01 - 0.72, [-1.467, 3.049, 5.672], [0.255, 2.635, -1.47], 36, -0.60, "dial"],
  /* K02 pan right with the needle to meaning (new) */ [T.smarter + 0.5, [-1.38, 2.8, 5], [0.2, 2.42, -1.47], 36, 1.88, "needle"],
  /* K03 creep */ [w("it", 1), [-1.36, 2.79, 4.94], [0.21, 2.42, -1.47], 36, 2.58, "needle"],
  /* K04 punch onto the old stop, 2 f before the thunk */ [w("it", 1) + 0.35, [-1.6, 2.74, 4.35], [-0.08, 2.46, -1.47], 36, 2.93, "dial"],
  /* K05 settle */ [w("here's", 1) + 0.16, [-1.58, 2.74, 4.47], [-0.06, 2.45, -1.47], 36, 4.30, "dial"],
  /* K06 reveal: Blink and the box */ [w("my", 2), [-0.362, 1.712, 10.178], [-0.362, 1.712, -1.2], 36, 5.20, "set"],
  /* K07 creep toward the card coming in */ [w("and", 1), [-0.362, 1.712, 10.178], [-0.362, 1.712, -1.2], 36, 6.84, "set"],
  /* K08 with the card to the slot */ [w("to", 1) + 0.2, [0.262, 1.602, 12.503], [0.262, 1.602, -1.2], 36, 7.58, "queue"],
  /* K09 the card down the old chute */ [w("keywords", 1) - 0.05, [-0.244, 2.056, 9.443], [-0.244, 2.056, -1.2], 36, 8.63, "chuteL"],
  /* K10 creep */ [w("in", 1), [-0.244, 2.033, 9.513], [-0.244, 2.033, -1.2], 36, 9.54, "chuteL"],
  /* K11 meaning (new) slid in */ [w("added", 1), [-0.24, 1.764, 10.318], [-0.24, 1.764, -1.2], 36, 10.40, "labels"],
  /* K12 creep */ [w("that", 1), [-0.237, 1.8, 10.282], [-0.237, 1.8, -1.2], 36, 11.60, "labels"],
  /* K13 toward meaning (new) */ [w("meaning", 1) - 0.02, [-0.2, 2.214, 9.864], [-0.2, 2.214, -1.2], 36, 12.86, "newchute"],
  /* K14 creep */ [w("i", 3), [-0.179, 2.159, 9.978], [-0.179, 2.159, -1.2], 36, 13.68, "newchute"],
  /* K15 the queue sliding in */ [w("anything", 1), [0.066, 1.528, 11.29], [0.066, 1.528, -1.2], 36, 14.44, "feed"],
  /* K16 creep */ [w("used", 2) - 0.3, [0.066, 1.555, 11.29], [0.066, 1.555, -1.2], 36, 15.06, "feed"],
  /* K17 along the line of callers */ [w("tool", 2), [0.066, 1.87, 11.29], [0.066, 1.87, -1.2], 36, 15.96, "feed"],
  /* K18 creep */ [w("kept", 2), [0.041, 1.888, 11.142], [0.041, 1.888, -1.2], 36, 17.06, "feed"],
  /* K19 the tag swings on default */ [T.dflt - 0.05, [-0.244, 2.09, 9.443], [-0.244, 2.09, -1.2], 36, 18.25, "tag"],
  /* K20 creep */ [T.dflt + 0.55, [-0.219, 2.045, 9.591], [-0.219, 2.045, -1.2], 36, 18.85, "tag"],
  /* K21 card into the slot */ [w("special", 1) - 0.04, [0.066, 1.528, 11.29], [0.066, 1.528, -1.2], 36, 19.62, "feed"],
  /* K22 creep */ [w("special", 1) + 0.3, [0.051, 1.536, 11.198], [0.051, 1.536, -1.2], 36, 19.96, "feed"],
  /* K23 cards down the old chute */ [w("keywords", 2) - 0.02, [-0.244, 1.69, 9.443], [-0.244, 1.69, -1.2], 36, 20.68, "chuteL"],
  /* K24 creep */ [w("that's", 1), [-0.208, 1.72, 9.667], [-0.208, 1.72, -1.2], 36, 22.52, "chuteL"],
  /* K25 up to the lamp */ [w("ship", 1), [0.204, 2.07, 12.242], [0.204, 2.07, -1.2], 36, 23.70, "lamp"],
  /* K26 creep */ [w("and", 3) - 0.5, [0.196, 2.115, 12.184], [0.196, 2.115, -1.2], 36, 24.18, "lamp"],
  /* K27 settle on it worked */ [w("worked", 1) - 0.02, [0.104, 2.636, 11.516], [0.104, 2.636, -1.2], 36, 24.88, "lamp"],
  /* K28 creep */ [w("nothing", 2), [0.085, 2.599, 11.462], [0.085, 2.599, -1.2], 36, 25.48, "lamp"],
  /* K29 down to Blink before its card pops */ [T.h10 - 0.24, [-0.362, 1.712, 10.178], [-0.362, 1.712, -1.2], 36, 26.18, "blink"],
  /* K30 creep */ [T.h10 + 0.6, [-0.347, 1.701, 10.272], [-0.347, 1.701, -1.2], 36, 27.02, "blink"],
  /* K31 with its card to the queue */ [T.h10 + 1.5, [-0.056, 1.49, 12.053], [-0.056, 1.49, -1.2], 36, 27.92, "blinkcard"],
  /* K32 creep */ [w("it", 4), [-0.07, 1.547, 11.874], [-0.07, 1.547, -1.2], 36, 29.56, "blinkcard"],
  /* K33 the plate lands */ [T.new1 - 0.06, [-0.23, 2.202, 9.82], [-0.23, 2.202, -1.2], 36, 30.34, "plate"],
  /* K34 creep */ [T.listed, [-0.206, 2.238, 9.96], [-0.206, 2.238, -1.2], 36, 31.54, "plate"],
  /* K35 the mark reads down */ [T.desc - 0.02, [0.064, 2.658, 11.573], [0.064, 2.658, -1.2], 36, 32.68, "plate"],
  /* K36 creep */ [w("it", 5), [0.064, 2.568, 11.55], [0.064, 2.568, -1.2], 36, 33.50, "plate"],
  /* K37 its card in the queue */ [w("ask", 2), [0.066, 1.528, 11.29], [0.066, 1.528, -1.2], 36, 34.24, "feed"],
  /* K38 creep */ [w("in", 3), [0.089, 1.565, 11.431], [0.089, 1.565, -1.2], 36, 35.28, "feed"],
  /* K39 the stream and the counter */ [w("36", 1) - 0.02, [0.356, 1.986, 13.055], [0.356, 1.986, -1.2], 36, 36.18, "stream"],
  /* K40 creep */ [w("searches", 1), [0.142, 1.334, 11.749], [0.142, 1.334, -1.2], 36, 37.64, "stream"],
  /* K41 36 seats */ [T.one3 + 0.21, [2.074, 3.002, 4.102], [2.074, 3.002, -1.2], 36, 39.05, "counter"],
  /* K42 settle */ [w("and", 4) + 0.9, [2.045, 2.962, 4.082], [2.045, 2.962, -1.2], 36, 40.40, "counter"],
  /* K43 the tray */ [T.uses - 0.02, [1.716, 2.192, 3.849], [1.716, 2.192, -1.2], 36, 41.82, "tray"],
  /* K44 creep */ [w("crash", 1) - 0.5, [1.716, 2.192, 3.849], [1.716, 2.192, -1.2], 36, 42.32, "tray"],
  /* K45 back to Blink and the box */ [w("no", 1) - 0.02, [-0.366, 1.64, 10.462], [-0.366, 1.64, -1.2], 36, 43.88, "set"],
  /* K46 creep */ [w("so", 2), [-0.34, 1.661, 10.575], [-0.34, 1.661, -1.2], 36, 45.46, "set"],
  /* K47 the strip unrolls */ [T.changedEnd, [-0.042, 1.898, 11.869], [-0.042, 1.898, -1.2], 36, 46.40, "strip"],
  /* K48 creep */ [T.h17 + 0.05, [-0.034, 1.878, 11.823], [-0.034, 1.878, -1.2], 36, 47.29, "strip"],
  /* K49 with the marker to day 53 */ [T.h17 + 1.03, [0.054, 1.654, 11.29], [0.054, 1.654, -1.2], 36, 48.27, "strip"],
  /* K50 creep */ [T.h18, [0.021, 1.645, 11.237], [0.021, 1.645, -1.2], 36, 48.76, "strip"],
  /* K51 the note lands */ [T.h18 + 1.08, [-1.062, 1.338, 9.525], [-1.062, 1.338, -1.2], 36, 49.84, "note"],
  /* K52 creep */ [w("about", 1), [-1.062, 1.338, 9.525], [-1.062, 1.338, -1.2], 36, 50.44, "note"],
  /* K53 push on Blink */ [w("search", 5), [-1.062, 1.338, 9.525], [-1.062, 1.338, -1.2], 36, 51.28, "note"],
  /* K54 creep */ [T.h19 + 0.16, [-1.043, 1.353, 9.495], [-1.043, 1.353, -1.2], 36, 52.12, "note"],
  /* K55 the needle swings to new */ [T.h19 + 0.88, [0.84, 2.88, 6.507], [0.84, 2.88, -1.2], 36, 52.84, "turn"],
  /* K56 down the new chute */ [T.h19 + 1.62, [0.84, 2.88, 6.507], [0.84, 2.88, -1.2], 36, 53.58, "newchute"],
  /* K57 creep */ [w("i", 7) - 1.14, [0.829, 2.864, 6.54], [0.829, 2.864, -1.2], 36, 53.82, "newchute"],
  /* K58 side-eye */ [w("i", 7) - 0.02, [-0.302, 1.248, 9.82], [-0.302, 1.248, -1.2], 36, 54.94, "blink"],
  /* K59 creep */ [w("but", 2), [-0.279, 1.254, 9.97], [-0.279, 1.254, -1.2], 36, 56.54, "blink"],
  /* K60 push on the bet */ [w("way", 2), [-0.01, 1.326, 11.69], [-0.01, 1.326, -1.2], 36, 57.44, "blink"],
  /* K61 creep */ [w("here's", 2) - 0.14, [-0.011, 1.344, 11.699], [-0.011, 1.344, -1.2], 36, 57.86, "blink"],
  /* K62 the tip */ [w("tip", 1) - 0.02, [-0.06, 1.934, 11.991], [-0.06, 1.934, -1.2], 36, 58.74, "tip"],
  /* K63 creep */ [w("explore", 1), [-0.043, 1.954, 11.976], [-0.043, 1.954, -1.2], 36, 60.40, "tip"],
  /* K64 in on the plate */ [w("tools", 1), [0.152, 2.18, 11.809], [0.152, 2.18, -1.2], 36, 61.10, "tip"],
  /* K65 creep */ [w("it", 10), [0.152, 2.221, 11.341], [0.152, 2.221, -1.2], 36, 61.82, "tip"],
  /* K66 reads the list */ [T.list - 0.02, [0.15, 2.692, 5.961], [0.15, 2.692, -1.2], 36, 62.62, "plate"],
  /* K67 goes with the default */ [T.dflt2 - 0.02, [-0.17, 2.756, 5.095], [-0.17, 2.756, -1.2], 36, 63.48, "tag"],
  /* K68 creep */ [w("so", 3), [-0.175, 2.696, 5.443], [-0.175, 2.696, -1.2], 36, 64.38, "tag"],
  /* K69 the new thing */ [w("new", 2) - 0.02, [-0.238, 2.004, 9.443], [-0.238, 2.004, -1.2], 36, 65.36, "labels"],
  /* K70 creep */ [w("either", 1), [-0.222, 1.997, 9.637], [-0.222, 1.997, -1.2], 36, 66.14, "labels"],
  /* K71 the panels */ [w("thing", 1) - 0.02, [-0.042, 1.916, 11.869], [-0.042, 1.916, -1.2], 36, 66.90, "panels"],
  /* K72 creep */ [w("or", 1) - 0.62, [-0.024, 1.954, 11.914], [-0.024, 1.954, -1.2], 36, 67.46, "panels"],
  /* K73 to the right panel */ [w("or", 1) - 0.02, [0.18, 2.396, 12.437], [0.18, 2.396, -1.2], 36, 68.06, "panels"],
  /* K74 creep */ [w("plain", 1), [0.169, 2.382, 12.35], [0.169, 2.382, -1.2], 36, 68.82, "panels"],
  /* K75 when to use it */ [w("when", 3) - 0.02, [0.044, 2.224, 11.346], [0.044, 2.224, -1.2], 36, 69.50, "panels"],
  /* K76 creep */ [w("then", 1), [0.063, 2.193, 11.444], [0.063, 2.193, -1.2], 36, 70.84, "panels"],
  /* K77 the log */ [w("logs", 2) - 0.02, [0.276, 1.832, 12.569], [0.276, 1.832, -1.2], 36, 71.60, "log"],
  /* K78 creep */ [w("to", 6), [0.261, 1.887, 12.48], [0.261, 1.887, -1.2], 36, 71.84, "log"],
  /* K79 down the rows */ [w("picks", 1), [0.094, 2.52, 11.459], [0.094, 2.52, -1.2], 36, 72.98, "log"],
  /* K80 creep */ [w("otherwise", 1), [0.074, 2.459, 11.377], [0.074, 2.459, -1.2], 36, 73.80, "log"],
  /* K81 back to Blink and the dial */ [w("built", 1) - 0.02, [-0.302, 1.296, 9.82], [-0.302, 1.296, -1.2], 36, 74.60, "end"],
  /* K82 creep */ [T.h27 + 1.9, [-0.316, 1.267, 9.903], [-0.316, 1.267, -1.2], 36, 75.70, "end"],
  /* K83 its card to the slot */ [T.h27 + 2.6, [-0.474, 0.93, 10.862], [-0.474, 0.93, -1.2], 36, 76.40, "end"],
  /* K84 creep */ [w("using", 4), [-0.505, 0.928, 10.619], [-0.505, 0.928, -1.2], 36, 77.08, "end"],
  /* K85 the look to camera */ [w("one", 4) - 0.02, [-0.86, 0.904, 7.82], [-0.86, 0.904, -1.2], 36, 77.72, "blink"],
  /* K86 eased out under the end mark */ [VO.END, [-0.86, 0.54, 8.94], [-0.86, 0.54, -1.2], 36, 79.35, "blink"],
];
// KEYS-END
KEYS.forEach((k, i) => {
  if (Math.abs(k[0] - k[4]) > 0.011) throw new Error(`camera key K${i + 1}: ${k[0]} is not ${k[4]}`);
  if (i && k[0] <= KEYS[i - 1][0]) throw new Error(`camera key K${i + 1} is out of order`);
});
const cameraAt = cameraPath(KEYS);

// each station: its file and the film spans in which it exists. Outside them it is hidden and update() isn't called.
// The machine builds first so machine.at() is live before the stations that hang on it; the programs next, since the
// cards ride their rails; the cards last, after mark, because they read the beam's focus off Blink's pose for the frame.
const WHOLE = [[0, T.END]];
const STATIONS = [
  { name: "machine", mod: machine, win: WHOLE },
  { name: "programs", mod: programs, win: WHOLE },
  { name: "lamp", mod: lamp, win: WHOLE },
  { name: "counter", mod: counter, win: [[T.h13 - 0.05, T.h16 + 0.5]] },
  { name: "tray", mod: tray, win: [[T.h15 - 0.05, T.h16 + 0.5]] },
  { name: "strip", mod: strip, win: [[T.h16, T.h21 + 0.7]] },
  { name: "note", mod: note, win: [[T.h18 - 0.05, T.h21 + 0.5]] },
  { name: "panels", mod: panels, win: [[T.h24 - 0.05, T.h26 + 0.4]] },
  { name: "log", mod: log, win: [[T.h26 - 0.05, T.h27 + 0.4]] },
  { name: "mark", mod: mark, win: WHOLE },
  { name: "cards", mod: cards, win: WHOLE },
];

export async function buildWorld(canvas) {
  // canvases can't use a face the DOM hasn't asked for yet
  await Promise.all(["400", "500", "600", "700"].map((wt) => document.fonts.load(`${wt} 24px 'IBM Plex Mono'`)));
  await document.fonts.ready;
  const floorY = FOOT_Y - 0.02;
  const { renderer, scene, cam, ramp, toon, grid } = stage(canvas, { fog: [12.1, 32], floorY });
  // the floor (world-plan-v2 section 4): 1-unit cells in the brand hairline at 50 %, the same colour on the centre lines so
  // no cross runs under Blink; the fog takes it before the cells moire near the horizon. Lines, not a glowing floor.
  scene.remove(grid);
  const floor = new THREE.GridHelper(80, 80, "#2a3550", "#2a3550");
  floor.position.y = floorY; floor.material.transparent = true; floor.material.opacity = 0.5; floor.material.fog = true;
  scene.add(floor);
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

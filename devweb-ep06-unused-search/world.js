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

// [time, position, target, fov, the film second it should resolve to, subject]. DP for the rebuilt set (camera-v2.md in
// the run): a new camera on the search machine, not the crate's keys re-aimed. One move per change of subject, each
// arriving 0-3 frames before the word or hit it serves, with a creep between moves (a slow slide and push so no hold
// goes dead). The base and most medium poses sit left of the machine's axis and above the switch, as the approved
// motion test; the hook opens close on the switch from the left, already moving at frame 0 (K01 starts before 0), with
// Blink as foreground; the day 53 turn swings right so the core is nearest the lens; the counter is read from above its
// shelf and the bin from above its bed. Those four pushes (counter, bin, the turn, the list/default tag) drop Blink's
// visor out; everything else keeps it whole. Poses were fitted in node against the framing rules in the kit's
// camera-check.mjs; `node check-graybox.mjs` measures them. Subject names are camera-set.mjs's SUBJECTS (cameraPath
// ignores the sixth field). All keys share the kit's io ease: the kit offers no other.
// KEYS-BEGIN
export const KEYS = [
  /* K01 hook: already moving at frame 0, close on the old side of the switch from the left */ [T.h01 - 0.72, [-2, 3.6, 5.8], [-0.25, 2.55, -1.6], 36, -0.60, "switch"],
  /* K02 pan right with the knob to meaning (new): both labels */ [T.smarter + 0.5, [-1.6, 3.7, 8], [0.05, 3.2, -1.6], 36, 1.88, "labels"],
  /* K03 creep */ [w("it", 1) - 0.12, [-1.641, 3.7, 7.884], [0.03, 3.194, -1.6], 36, 2.46, "labels"],
  /* K04 punch onto the old stop and the tag, 2 f before the thunk */ [w("it", 1) + 0.35, [-1.9, 3.6, 7.4], [-0.15, 2.98, -1.55], 36, 2.93, "switch"],
  /* K05 settle */ [w("here's", 1) + 0.16, [-1.996, 3.6, 7.126], [-0.198, 2.966, -1.55], 36, 4.30, "switch"],
  /* K06 reveal: the whole machine on its plinth, the grid, Blink */ [w("my", 2), [-0.8, 3.4, 13.2], [-0.06, 2.05, -1.5], 36, 5.20, "set"],
  /* K07 creep */ [w("and", 1), [-0.912, 3.4, 12.88], [-0.116, 2.034, -1.5], 36, 6.84, "set"],
  /* K08 with program 1's card up the rail to the slot */ [w("to", 1) + 0.2, [-1.6, 2.7, 11.4], [-0.1, 1.6, -1.5], 36, 7.58, "feed"],
  /* K09 the clockwork runs, the result out of the spout */ [w("keywords", 1) - 0.05, [-0.85, 2.8, 10.6], [-0.5, 1.75, -1.8], 36, 8.63, "run"],
  /* K10 creep */ [w("in", 1), [-0.786, 2.8, 10.418], [-0.468, 1.741, -1.8], 36, 9.54, "run"],
  /* K11 meaning (new) slid in for good: both labels */ [w("added", 1), [-1.5, 2.9, 10.4], [0, 2.35, -1.7], 36, 10.40, "labels"],
  /* K12 creep */ [w("that", 1), [-1.584, 2.9, 10.16], [-0.042, 2.338, -1.7], 36, 11.60, "labels"],
  /* K13 toward the core, its rings unfolded */ [w("meaning", 1) - 0.02, [-1.4, 2.9, 11.2], [0.2, 2.25, -1.7], 36, 12.86, "core"],
  /* K14 creep */ [w("i", 3), [-1.457, 2.9, 11.036], [0.171, 2.242, -1.7], 36, 13.68, "core"],
  /* K15 the programs slide in, cards rise to the line */ [w("anything", 1), [-1.6, 2.8, 11.6], [0.1, 1.5, -1.3], 36, 14.44, "slot"],
  /* K16 creep */ [w("used", 2) - 0.3, [-1.643, 2.8, 11.476], [0.078, 1.494, -1.3], 36, 15.06, "slot"],
  /* K17 along the line of callers */ [w("tool", 2), [-1.4, 3.15, 11], [0.25, 1.85, -1.3], 36, 15.96, "slot"],
  /* K18 creep */ [w("kept", 2), [-1.477, 3.15, 10.78], [0.212, 1.839, -1.3], 36, 17.06, "slot"],
  /* K19 the tag swings on default */ [T.dflt - 0.05, [-2, 2.9, 9.6], [-0.35, 2.4, -1.5], 36, 18.25, "tag"],
  /* K20 creep */ [T.dflt + 0.55, [-2.042, 2.9, 9.48], [-0.371, 2.394, -1.5], 36, 18.85, "tag"],
  /* K21 the first card of the line into the slot */ [w("special", 1) - 0.04, [-1.6, 2.7, 11.4], [-0.1, 1.6, -1.5], 36, 19.62, "feed"],
  /* K22 creep */ [w("special", 1) + 0.3, [-1.624, 2.7, 11.332], [-0.112, 1.597, -1.5], 36, 19.96, "feed"],
  /* K23 the results out of the spout, down the trough */ [w("keywords", 2) - 0.02, [-0.85, 2.8, 10.6], [-0.5, 1.75, -1.8], 36, 20.68, "run"],
  /* K24 creep */ [w("that's", 1), [-0.738, 2.8, 10.28], [-0.444, 1.734, -1.8], 36, 22.52, "run"],
  /* K25 up to the lamp on the crown */ [w("ship", 1), [-1.2, 3.6, 12.6], [0.1, 2.7, -1.8], 36, 23.70, "lamp"],
  /* K26 creep */ [w("and", 3) - 0.5, [-1.234, 3.6, 12.504], [0.083, 2.695, -1.8], 36, 24.18, "lamp"],
  /* K27 settle on it worked */ [w("worked", 1) - 0.02, [-1, 3.9, 12], [0.2, 2.95, -1.8], 36, 24.88, "lamp"],
  /* K28 creep */ [w("nothing", 2), [-1.042, 3.9, 11.88], [0.179, 2.944, -1.8], 36, 25.48, "lamp"],
  /* K29 down to Blink before the beam opens */ [T.h10 - 0.24, [-0.9, 2.6, 12], [-0.3, 1.9, -1.3], 36, 26.18, "beam"],
  /* K30 creep */ [T.h10 + 0.6, [-0.959, 2.6, 11.832], [-0.329, 1.892, -1.3], 36, 27.02, "beam"],
  /* K31 with its card to the end of the line */ [T.h10 + 1.5, [-1.6, 2.9, 12], [-0.1, 1.5, -1.2], 36, 27.92, "blinkcard"],
  /* K32 creep */ [w("it", 4), [-1.712, 2.9, 11.68], [-0.156, 1.484, -1.2], 36, 29.56, "blinkcard"],
  /* K33 the placard lands on its rods */ [T.new1 - 0.06, [-1.5, 3.1, 9.8], [0, 2.3, -1.5], 36, 30.34, "placard"],
  /* K34 creep */ [T.listed, [-1.584, 3.1, 9.56], [-0.042, 2.288, -1.5], 36, 31.54, "placard"],
  /* K35 the mark reads down */ [T.desc - 0.02, [-1.45, 2.95, 9.4], [0, 2, -1.5], 36, 32.68, "placard"],
  /* K36 creep */ [w("it", 5), [-1.507, 2.95, 9.236], [-0.029, 1.992, -1.5], 36, 33.50, "placard"],
  /* K37 its card steps down the line and in */ [w("ask", 2), [-1.6, 2.7, 11.4], [-0.1, 1.6, -1.5], 36, 34.24, "feed"],
  /* K38 creep */ [w("in", 3), [-1.673, 2.7, 11.192], [-0.136, 1.59, -1.5], 36, 35.28, "feed"],
  /* K39 the stream up every rail and the counter standing up */ [w("36", 1) - 0.02, [-1.2, 3.4, 12.6], [0.1, 2.05, -1.6], 36, 36.18, "stream"],
  /* K40 creep */ [w("searches", 1), [-1.302, 3.4, 12.308], [0.049, 2.035, -1.6], 36, 37.64, "stream"],
  /* K41 36 seats: the counter on its shelf */ [T.one3 + 0.21, [-2.1, 4.9, 3], [-1.1, 4.2, -2.6], 36, 39.05, "counter"],
  /* K42 settle */ [w("and", 4) + 0.55, [-2.17, 4.9, 2.8], [-1.135, 4.19, -2.6], 36, 40.05, "counter"],
  /* K43 over the bin tipped out of the foot: its empty bed */ [T.uses - 0.02, [0.5, 4.5, 1.4], [0.34, 1.3, -2.1], 36, 41.82, "bin"],
  /* K44 creep */ [w("crash", 1) - 0.5, [0.465, 4.5, 1.3], [0.323, 1.295, -2.1], 36, 42.32, "bin"],
  /* K45 back to Blink and the machine */ [w("no", 1) - 0.02, [-0.8, 3.4, 13.2], [-0.06, 2.05, -1.5], 36, 43.88, "set"],
  /* K46 creep */ [w("so", 2), [-0.911, 3.4, 12.884], [-0.115, 2.034, -1.5], 36, 45.46, "set"],
  /* K47 the strip unrolls above the crown */ [T.changedEnd, [-0.9, 3.2, 14], [0.55, 2.9, -1.5], 36, 46.40, "strip"],
  /* K48 creep */ [T.h17 + 0.05, [-0.962, 3.2, 13.822], [0.519, 2.891, -1.5], 36, 47.29, "strip"],
  /* K49 with the marker to day 53 */ [T.h17 + 1.03, [-0.9, 3.2, 13.8], [0.65, 2.85, -1.5], 36, 48.27, "strip"],
  /* K50 creep */ [T.h17 + 1.28, [-0.917, 3.2, 13.75], [0.641, 2.848, -1.5], 36, 48.52, "strip"],
  /* K51 down with the note as it floats in to Blink */ [T.h18 + 0.55, [-1.5, 2.7, 11.6], [-0.4, 1.75, -1], 36, 49.31, "note"],
  /* K52 creep */ [w("about", 1), [-1.579, 2.7, 11.374], [-0.44, 1.739, -1], 36, 50.44, "note"],
  /* K53 push on Blink reading */ [w("search", 5), [-1.6, 2.6, 11.6], [-0.5, 1.6, -1], 36, 51.28, "note"],
  /* K54 creep */ [T.h19 + 0.16, [-1.659, 2.6, 11.432], [-0.529, 1.592, -1], 36, 52.12, "note"],
  /* K55 the turn: from the right, the tab lifts the feeler and the lever throws */ [T.h19 + 0.88, [1.6, 3.3, 6.4], [0.6, 2.55, -1.85], 36, 52.84, "throw"],
  /* K56 to the core lighting blue */ [T.h19 + 1.62, [1.7, 3.3, 6.2], [0.8, 2.6, -1.9], 36, 53.58, "core"],
  /* K57 creep */ [w("i", 7) - 1.14, [1.683, 3.3, 6.152], [0.792, 2.598, -1.9], 36, 53.82, "core"],
  /* K58 side-eye: the note left, the lit core right */ [w("i", 7) - 0.02, [-1.3, 2.9, 11.4], [-0.32, 1.55, -1.4], 36, 54.94, "note"],
  /* K59 creep */ [w("but", 2), [-1.412, 2.9, 11.08], [-0.376, 1.534, -1.4], 36, 56.54, "note"],
  /* K60 push on the bet */ [w("way", 2), [-2, 2.9, 14], [0.32, 1.6, -1.4], 36, 57.44, "note"],
  /* K61 creep */ [w("here's", 2) - 0.14, [-2.029, 2.9, 13.916], [0.305, 1.596, -1.4], 36, 57.86, "note"],
  /* K62 the tip: up to the switch as the strip rolls away */ [w("tip", 1) - 0.02, [-1.5, 3, 12.6], [0.5, 2.15, -1.5], 36, 58.74, "switch"],
  /* K63 creep */ [w("explore", 1), [-1.612, 3, 12.28], [0.444, 2.134, -1.5], 36, 60.40, "switch"],
  /* K64 in on the placard */ [w("tools", 1), [-1.5, 3.1, 11.4], [0.42, 2.5, -1.5], 36, 61.10, "placard"],
  /* K65 creep */ [w("it", 10), [-1.55, 3.1, 11.256], [0.395, 2.493, -1.5], 36, 61.82, "placard"],
  /* K66 reads the list: close on the placard */ [T.list - 0.02, [-1.5, 3.7, 6.6], [0.1, 3, -1.4], 36, 62.62, "placard"],
  /* K67 goes with the default: the tag */ [T.dflt2 - 0.02, [-2, 3.5, 6], [-0.4, 2.85, -1.45], 36, 63.48, "tag"],
  /* K68 creep */ [w("so", 3), [-2.063, 3.5, 5.82], [-0.431, 2.841, -1.45], 36, 64.38, "tag"],
  /* K69 the new thing: both labels */ [w("new", 2) - 0.02, [-1.5, 2.9, 10.4], [0, 2.35, -1.7], 36, 65.36, "labels"],
  /* K70 creep */ [w("either", 1), [-1.555, 2.9, 10.244], [-0.027, 2.342, -1.7], 36, 66.14, "labels"],
  /* K71 the panels: the left one turns */ [w("thing", 1) - 0.02, [-0.9, 3.6, 12.4], [0, 2.65, -0.9], 36, 66.90, "panels"],
  /* K72 creep */ [w("or", 1) - 0.62, [-0.939, 3.6, 12.288], [-0.02, 2.644, -0.9], 36, 67.46, "panels"],
  /* K73 to the right panel */ [w("or", 1) - 0.02, [-0.7, 3.6, 12.4], [0.2, 2.7, -0.9], 36, 68.06, "panels"],
  /* K74 creep */ [w("plain", 1), [-0.753, 3.6, 12.248], [0.173, 2.692, -0.9], 36, 68.82, "panels"],
  /* K75 when to use it */ [w("when", 3) - 0.02, [-0.75, 3.5, 12], [0.12, 2.55, -0.9], 36, 69.50, "panels"],
  /* K76 creep */ [w("then", 1), [-0.844, 3.5, 11.732], [0.073, 2.537, -0.9], 36, 70.84, "panels"],
  /* K77 the log in the right half */ [w("logs", 2) - 0.02, [-1.4, 3.3, 12.4], [0.2, 2.2, -0.8], 36, 71.60, "log"],
  /* K78 creep */ [w("to", 6), [-1.417, 3.3, 12.352], [0.192, 2.198, -0.8], 36, 71.84, "log"],
  /* K79 down the rows */ [w("picks", 1), [-1.35, 3, 11.8], [0.25, 1.85, -0.8], 36, 72.98, "log"],
  /* K80 creep */ [w("otherwise", 1), [-1.407, 3, 11.636], [0.221, 1.842, -0.8], 36, 73.80, "log"],
  /* K81 back to Blink and the switch */ [w("built", 1) - 0.02, [-1.3, 2.2, 11.3], [-0.45, 1.3, -1.3], 36, 74.60, "end"],
  /* K82 creep */ [T.h27 + 1.9, [-1.377, 2.2, 11.08], [-0.488, 1.289, -1.3], 36, 75.70, "end"],
  /* K83 its last card up into the slot */ [T.h27 + 2.6, [-1.2, 2.7, 11.2], [-0.35, 1.2, -1.3], 36, 76.40, "end"],
  /* K84 creep */ [w("using", 4), [-1.248, 2.7, 11.064], [-0.374, 1.193, -1.3], 36, 77.08, "end"],
  /* K85 the look to camera */ [w("one", 4) - 0.02, [-1.5, 0.9, 9], [-1.25, 0.9, 0.2], 36, 77.72, "blink"],
  /* K86 eased out under the end mark */ [VO.END, [-1.5, 0.85, 9.6], [-1.4, 0.85, 0.2], 36, 79.35, "blink"],
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
  const { renderer, scene, cam, ramp, toon, grid } = stage(canvas, { fog: [14.8, 48], floorY });
  // the floor (world-plan-v2 section 4, tuned by the DP on stills): half-unit cells so the convergence reads from the
  // base poses (camera 3.4 up, 13 out, 5 deg down), one colour so no cross runs under Blink, lines only. The fog is the
  // grid's alone (every prop and panel has fog off, Blink's toon does not): it starts past the furthest Blink ever is from
  // the lens (14.75 at the strip poses) and runs to 48, so the lines thin toward the horizon over the last third of the
  // ground band instead of stopping short of it (60 left a pale band where the cells merge). Lines, not a glowing floor.
  scene.remove(grid);
  const floor = new THREE.GridHelper(120, 240, "#3a4a6c", "#3a4a6c");
  floor.position.y = floorY; floor.material.transparent = true; floor.material.opacity = 0.72; floor.material.fog = true;
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

// devweb ep 4, draft 3: "Five tests passed. Then it ran for real, and nothing came out." The script came out of the
// bureau's write-short-script run (four cold readers explained it back; three fact traces). One Three.js world, one
// continuous camera, two places: YOUR DESK (Blink in your laptop's chat window, the real file you describe instead of
// handing over) and THE INCIDENT (a grey robot doing a job, its record unrolling as a scroll of forms, the script
// machine that should file one row per job into ledger 7). Close-ups float over the machine: the instructions, the
// form the script expects (a thought bubble) against the real one (a folded "message" box), the five samples, the key
// and lock drawn by the same hand. Mass moment: a field of green samples while one real record falls through.
// Everything is a pure function of film time t.
import * as THREE from "three";
import { makeBlink, glyphTexture } from "./kit/blink3d.js";
import { cl, io, back, r01, mix, V, pulse, typed, cameraPath, panel, rr, stage } from "./kit/world.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const VO = window.VO, G = window.BLINK;
// the word nearest a time in the take (Whisper's spellings: "jobgiver", "labeled"); robust to repeated words
const at = (word, near) => { const m = VO.W.filter((x) => x[0] === word); if (!m.length) throw new Error(`VO: no '${word}'`); return m.reduce((a, b) => (Math.abs(b[1] - near) < Math.abs(a[1] - near) ? b : a)); };
const w = (word, near) => at(word, near)[1], e = (word, near) => at(word, near)[2];

// ---------- the beats, on Chris's words ----------
export const T = {
  // I
  passed: w("passed", 1.3), nothing: w("nothing", 4.0), outE: e("out", 4.7),
  // II
  youve: w("you've", 5.5), real1: w("real", 5.9), export: w("export", 7.1), ask: w("ask", 9.1), describe: w("describe", 13.1), dont: w("don't", 14.4),
  writes: w("writes", 16.0), tests2: w("tests", 17.3), green1: w("green", 18.4), stop: w("stop", 19.4),
  // III
  heres: w("here's", 20.6), different: w("different", 22.1), job: w("job", 24.8), finished: w("finished", 25.8), read: w("read", 26.9),
  record1: w("record", 27.8), added: w("added", 28.5), tokens: w("tokens", 29.2), filed: w("filed", 32.7), ledger1: w("ledger", 33.9), oneJob: w("one", 34.6), rowOutE: e("out", 36.1),
  // IV
  needed: w("needed", 37.2), instructions1: w("instructions", 38.2), ledger2: w("ledger", 39.9), come: w("come", 41.5), sent: w("sent", 42.3),
  jobgiver1: w("jobgiver", 43.7), record2: w("record", 44.9), stack: w("stack", 45.4), form1: w("form", 47.2), boxes: w("boxes", 48.1),
  jgForms: w("jobgiver's", 49.3), who1: w("who", 50.9), wrote: w("wrote", 52.4), looked: w("looked", 53.8), first: w("first", 54.4),
  said: w("said", 56.1), assumed: w("assumed", 57.9), face1: w("face", 59.6), formE: e("form", 60.1),
  // V
  but: w("but", 60.7), inside1: w("inside", 62.8), message1: w("message", 64.6), never: w("never", 66.4), found: w("found", 66.7), entry: w("entry", 68.1),
  noInstr: w("instructions", 69.2), noLedger: w("ledger", 70.6), nothingDo: w("nothing", 72.2), finished2: w("finished", 73.4), error: w("error", 74.6),
  warning: w("warning", 75.5), nothingFiled: w("nothing", 76.4), filedE: e("filed", 76.9),
  // VI
  why: w("why", 78.1), hands: w("hands", 80.4), sample: w("sample", 81.2), checks: w("checks", 82.0), someone: w("someone", 83.4), five: w("five", 85.6),
  who2: w("who", 86.9), face2: w("face", 88.2), expected: w("expected", 89.5),
  // VII
  guessed: w("guessed", 90.9), written: w("written", 93.7), guess1: w("guess", 94.6), checked: w("checked", 96.1), never2: w("never", 98.3),
  realFile1: w("real", 99.2), greenMeant: w("green", 100.6), samplesE: e("samples", 101.7),
  // VIII
  caught: w("caught", 102.8), oneReal: w("one", 103.4), ran: w("ran", 105.5), through: w("through", 105.9), counted: w("counted", 106.3),
  zero: w("zero", 107.9), zeroE: e("zero", 107.9), noRow: w("no", 109.8), bug: e("bug", 112.7),
  // IX
  fix: w("fix", 113.6), changed: w("changed", 116.3), reach: w("reach", 116.9), message2: w("message", 117.6), instructions2: w("instructions", 118.5),
  small: w("small", 120.1), rebuilt: w("rebuilt", 121.7), mattered: w("mattered", 124.7), feeds: w("feeds", 125.6), exactly: w("exactly", 128.6),
  lands: w("lands", 129.9), landsE: e("lands", 129.9), doesnt: w("doesn't", 131.1), realInput: w("real", 134.0), outputE: e("output", 135.5),
  // X
  back: w("back", 136.5), trust: w("trust", 137.9), hand: w("hand", 139.0), file3: w("file", 140.5), build: w("build", 142.4),
  right: w("right", 144.6), comesOutE: e("out", 145.4), least: w("least", 146.3), description: w("description", 149.9), itE: e("it", 150.6), END: VO.END,
};

// ---------- the layout ----------
const FLOOR = -1.72;
const MX = 0.5, MW = 2.4, MH = 3.4, MD = 1.8, MTOP = FLOOR + MH, MFRONT = MD / 2; // the script machine
const SX = MX - 0.4; // its intake slot
const TRAY_Y = FLOOR + 0.32, TRAY_Z = MFRONT + 0.75; // ledger 7, at its foot
const RX = -1.95, RZ = 0.15; // the grey robot
const SCX = -1.95, SCZ = -0.75, SC_TOP = 2.6, SC_W = 1.05; // its record, a scroll behind it
const LX = -11.5; // your desk: the laptop
const FORM_W = 1.7, FORM_H = 1.15;
const BUBBLE_AT = V(MX, 6.1, 1.2), REAL_AT = V(MX, 4.6, 1.2); // the expected form (thought) over the real form
const KEY_AT = V(MX, 5.15, 1.2), FAN_Y = 5.4, TEST_AT = V(MX - 0.15, 2.45, 1.15);

// ---------- drops into the slot ----------
const HOOK_IN = [0, 1, 2, 3, 4].map((i) => 0.62 + i * 0.2); // five samples, five checks, on "five tests passed"
const SAMPLE_IN = T.hands + 0.55; // VI: one sample in, a check
const REAL_IN = T.through + 0.05; // VIII: the one real record, falling through the field
const TEST_IN = T.feeds + 0.45, ROW_AT = T.exactly + 0.25; // IX: a record in the real layout in, exactly one row out

// ---------- the camera path: [time, position, target, fov] ----------
const RIG = [[-0.45, 2.4, 14.0], [-0.45, 0.9, 0.4], 36]; // the incident: robot, scroll, machine, ledger
const MACH = [[MX, 2.0, 11.0], [MX, 0.45, 0.8], 36]; // the machine and ledger 7, a bit closer
const STACK = [[MX, 5.2, 8.7], [MX, 5.15, 1.0], 34]; // the close-ups over the machine
const DESK = [[LX + 0.15, 1.7, 11.2], [LX + 0.15, 0.55, 0], 36]; // your desk
const KEYS = [
  // I. the hook: five samples, five checks, then nothing in the ledger
  [0, [MX, 2.6, 10.6], [MX, 1.4, 0.6], 34],
  [T.passed + 1.0, [MX, 2.5, 10.3], [MX, 1.3, 0.6], 34],
  [T.nothing + 0.2, [MX + 0.05, 2.1, 9.2], [MX, -0.6, 1.4], 36],
  [T.outE + 0.15, [MX + 0.05, 2.1, 9.1], [MX, -0.6, 1.4], 36],
  // II. your desk
  [T.real1 + 0.5, ...DESK],
  [T.stop + 0.5, [LX + 0.15, 1.65, 10.9], [LX + 0.15, 0.6, 0], 36],
  // III. a different setup: the laptop shuts, across to the incident
  [T.heres + 0.45, [LX + 0.15, 1.65, 10.9], [LX + 0.15, 0.6, 0], 36],
  [T.different + 0.7, ...RIG],
  [T.added - 0.2, [-0.45, 2.35, 13.8], [-0.45, 0.9, 0.4], 36],
  [T.ledger1 + 0.3, ...MACH],
  [T.rowOutE + 0.3, [MX, 2.05, 11.2], [MX, 0.5, 0.8], 36],
  // IV. the instructions, then up to the forms
  [T.needed + 0.5, ...RIG],
  [T.record2 - 0.2, [-0.45, 2.4, 13.8], [-0.45, 0.95, 0.4], 36],
  [T.stack + 0.6, ...STACK],
  [T.formE + 0.3, [MX, 5.18, 8.6], [MX, 5.13, 1.0], 34],
  // V. the box inside the box; then the scroll, the ledger, the lamps
  [T.found + 0.2, [MX, 5.18, 8.6], [MX, 5.13, 1.0], 34],
  [T.entry + 0.3, ...RIG],
  [T.noLedger + 0.3, ...MACH],
  [T.filedE + 0.3, [MX, 2.05, 11.2], [MX, 0.5, 0.8], 36],
  // VI. one sample in, then the five
  [T.hands - 0.2, ...MACH],
  [T.someone + 0.5, ...STACK],
  [T.expected + 0.6, [MX, 5.18, 8.6], [MX, 5.13, 1.0], 34],
  // VII. the key and the lock
  [T.greenMeant - 0.35, [MX, 5.18, 8.6], [MX, 5.13, 1.0], 34],
  // the mass moment: crane up over the field of green samples; the one real record falls through it
  [T.samplesE + 0.4, [0.5, 13.5, 13.0], [0.4, -1.3, -3.8], 40],
  [T.ran - 0.1, [0.6, 15.6, 13.8], [0.4, -1.6, -4.5], 40],
  // VIII. down to the ledger for the count (the whole machine, so nothing crosses the frame edge)
  [T.zero - 0.1, [MX, 2.2, 11.6], [MX, 0.6, 0.8], 36],
  [T.bug + 0.3, [MX, 2.15, 11.4], [MX, 0.6, 0.8], 36],
  // IX. the fix, up in the close-ups; then the test that mattered, down at the ledger
  [T.fix + 0.6, ...STACK],
  [T.mattered - 0.6, [MX, 5.15, 8.8], [MX, 5.1, 1.0], 34],
  [T.feeds + 0.4, ...MACH],
  [T.landsE + 0.4, [MX, 2.0, 10.6], [MX, 0.3, 0.9], 36],
  [T.outputE + 0.3, [MX, 2.05, 10.8], [MX, 0.35, 0.9], 36],
  // X. back to you
  [T.trust - 0.1, ...DESK],
  [T.least + 0.6, [LX + 0.15, 1.65, 10.9], [LX + 0.15, 0.6, 0], 36],
  [T.itE + 1.8, [LX + 0.15, 2.3, 11.8], [LX + 0.15, 1.0, 0], 37],
  [T.END, [LX + 0.15, 2.35, 12.0], [LX + 0.15, 1.0, 0], 37],
];
const cameraAt = cameraPath(KEYS);

// ---------- the field of green samples (the mass moment) ----------
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const FIELD = [], F0 = T.greenMeant - 0.4;
for (let gx = -15; gx <= 15; gx++) for (let gz = -18; gz <= 5; gz++) {
  const x = MX + gx * 1.05 + (hash(gx * 31 + gz) - 0.5) * 0.25, z = gz * 1.25 + (hash(gx + gz * 17) - 0.5) * 0.3;
  const d = Math.hypot(x - MX, z), dr = Math.hypot(x - RX, z - RZ);
  if (d < 2.9 || dr < 1.6) continue; // clear of the machine and the robot
  FIELD.push({ x, z, d, at: F0 + d * 0.09 + hash(gx * 7 + gz * 13) * 0.2, yaw: (hash(gx * 3 + gz) - 0.5) * 0.35 });
}

export async function buildWorld(canvas) {
  // ---------- sound cues (times only; before any await so cues.mjs sees them) ----------
  const cue = (k, t, extra) => window.BP.CUES.push(Object.assign({ k, t: +t.toFixed(3) }, extra || {}));
  const ASK = "Write a script that reads my export and pulls out the totals.";
  HOOK_IN.forEach((t) => { cue("tick", t); cue("blip", t + 0.03); });
  cue("whoosh", T.nothing - 0.3, { d: 0.9 });
  cue("whoosh", T.youve - 0.4, { d: 1.2 }); cue("pop", T.real1 + 0.1); cue("slide", T.dont, { d: 0.5 });
  [...ASK].forEach((ch, i) => ch.trim() && i % 2 === 0 && cue("type", T.ask + i / 30));
  cue("pop", T.writes); cue("pop", T.tests2); [0, 1, 2, 3, 4].forEach((i) => cue("blip", T.green1 - 0.2 + i * 0.08));
  cue("slide", T.heres, { d: 0.5 }); cue("whoosh", T.heres + 0.4, { d: 1.6 }); cue("draw", T.job, { d: 1.2 });
  cue("draw", T.read, { d: 0.8 }); cue("tick", T.tokens); cue("zip", T.filed); cue("whoosh", T.ledger1, { d: 0.8 });
  cue("whoosh", T.needed, { d: 0.8 }); cue("pop", T.instructions1); cue("blip", T.ledger2 + 0.1); cue("slide", T.sent, { d: 0.6 });
  cue("whoosh", T.record2, { d: 1.0 }); cue("slide", T.stack, { d: 0.4 }); cue("pop", T.jgForms); cue("blip", T.who1 + 0.1);
  cue("tick", T.first); cue("blip", T.said + 0.2); cue("slide", T.assumed, { d: 0.4 });
  cue("draw", T.inside1, { d: 0.6 }); cue("blip", T.message1); cue("strike", T.found + 0.1); cue("whoosh", T.entry - 0.2, { d: 0.8 });
  cue("draw", T.entry, { d: 0.9 }); cue("thud", T.noLedger + 0.1); cue("stamp", T.finished2); cue("thud", T.error + 0.1); cue("thud", T.warning + 0.1);
  cue("whoosh", T.why, { d: 0.8 }); cue("tick", SAMPLE_IN); cue("blip", T.checks + 0.1);
  cue("whoosh", T.someone, { d: 1.0 }); [0, 1, 2, 3, 4].forEach((i) => cue("pop", T.five - 0.1 + i * 0.09));
  cue("pop", T.guessed); cue("pop", T.written); cue("land", T.checked + 0.25); cue("slide", T.never2, { d: 0.5 }); cue("thud", T.realFile1 + 0.3);
  cue("riser", T.greenMeant - 0.6, { d: 0.7 }); cue("whoosh", T.greenMeant - 0.2, { d: 1.8 }); cue("draw", F0 + 0.3, { d: 2.0 });
  FIELD.forEach((f, i) => { if (i % 40 === 0) cue("blip", f.at); });
  cue("riser", T.oneReal - 0.1, { d: 1.6 }); cue("whoosh", T.ran, { d: 1.4 }); cue("tick", REAL_IN); cue("stamp", T.zero);
  cue("whoosh", T.fix - 0.1, { d: 1.0 }); cue("type", T.changed); cue("draw", T.reach, { d: 0.6 }); cue("zip", T.instructions2); cue("blip", T.instructions2 + 0.4);
  [0, 1, 2, 3, 4].forEach((i) => cue("pop", T.rebuilt - 0.4 + i * 0.09));
  const TESTL = ["test: a record in the real layout", "expect: exactly 1 row"];
  cue("pop", T.mattered - 0.1); [...TESTL[0]].forEach((ch, i) => ch.trim() && i % 2 === 0 && cue("type", T.mattered + i / 40));
  cue("whoosh", T.feeds, { d: 0.8 }); cue("tick", TEST_IN); cue("zip", ROW_AT - 0.1); cue("land", ROW_AT + 0.35); cue("ding", ROW_AT + 0.5);
  cue("whoosh", T.back - 0.1, { d: 1.6 }); cue("slide", T.back + 0.2, { d: 0.6 }); cue("blip", T.trust + 0.4);
  cue("slide", T.hand, { d: 0.9 }); cue("pop", T.hand + 0.2); cue("pop", T.build); cue("zip", T.right); cue("ding", T.comesOutE);
  cue("whoosh", T.itE + 0.4, { d: 1.6 }); cue("sting", T.itE + 1.6);

  await document.fonts.ready;
  const { renderer, scene, cam, ramp, toon } = stage(canvas, { fog: [26, 100] });
  const mono = (g, px, wt = 600) => { g.font = `${wt} ${px}px 'IBM Plex Mono', monospace`; g.textBaseline = "middle"; };
  const sans = (g, px, wt = 700) => { g.font = `${wt} ${px}px 'IBM Plex Sans', sans-serif`; g.textBaseline = "middle"; };
  const glowTex = (inner, outer) => glyphTexture(THREE, (g, W) => { const gr = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); gr.addColorStop(0, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(0, 0, W, W); }, 128, 128);
  const sprite = (tex, s) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); m.scale.setScalar(s); scene.add(m); return m; };
  const check = (g, cx, cy, r, col = "#6ad08a") => { g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fillStyle = col; g.fill(); g.strokeStyle = "#0d1117"; g.lineWidth = r * 0.28; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); g.moveTo(cx - r * 0.45, cy + r * 0.03); g.lineTo(cx - r * 0.12, cy + r * 0.38); g.lineTo(cx + r * 0.5, cy - r * 0.35); g.stroke(); };

  // floor pools under both places
  [[MX - 1.0, 1.0, 7.5], [LX + 0.3, 0.5, 5.5]].forEach(([x, z, r]) => {
    const pool = new THREE.Mesh(new THREE.CircleGeometry(r, 64), new THREE.MeshBasicMaterial({ map: glowTex("rgba(40,62,88,0.85)", "rgba(13,17,23,0)"), transparent: true, depthWrite: false }));
    pool.rotation.x = -Math.PI / 2; pool.position.set(x, FLOOR + 0.003, z); scene.add(pool);
  });

  // =============== YOUR DESK ===============
  const laptop = new THREE.Group(); laptop.position.set(LX, FLOOR, 0); scene.add(laptop);
  const base = new THREE.Mesh(new RoundedBoxGeometry(2.6, 0.12, 1.7, 3, 0.04), toon("#3a4352")); base.position.set(0, 0.06, 0.2); laptop.add(base);
  const keys = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.9), new THREE.MeshBasicMaterial({ color: "#242b36" })); keys.rotation.x = -Math.PI / 2; keys.position.set(0, 0.125, 0.25); laptop.add(keys);
  const hinge = new THREE.Group(); hinge.position.set(0, 0.12, -0.62); laptop.add(hinge);
  const lid = new THREE.Mesh(new RoundedBoxGeometry(2.6, 1.75, 0.08, 3, 0.04), toon("#3a4352")); lid.position.set(0, 0.875, -0.04); hinge.add(lid);
  // the chat window: your ask, Blink's answer
  const screen = panel(2.42, 1.6, 400, (g, W, H, s) => {
    g.fillStyle = "#11161e"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#1c2430"; g.fillRect(0, 0, W, 70); mono(g, 34, 600); g.textAlign = "left"; g.fillStyle = "#6ad08a"; g.fillText("Blink", 92, 36); g.fillStyle = "#7b8593"; g.fillText("  your AI", 92 + g.measureText("Blink").width, 36);
    g.fillStyle = "#6ad08a"; g.beginPath(); g.ellipse(52, 36, 20, 22, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = "#0d1117"; rr(g, 38, 28, 28, 14, 7); g.fill();
    const wrap = (txt, maxW) => { const out = []; let line = ""; txt.split(" ").forEach((wd) => { const tt = line ? line + " " + wd : wd; if (g.measureText(tt).width > maxW && line) { out.push(line); line = wd; } else line = tt; }); if (line) out.push(line); return out; };
    sans(g, 40, 500);
    if (s.ask) { const L = wrap(s.ask, 560); const bh = 30 + L.length * 52; g.fillStyle = "#2d3a4f"; rr(g, W - 640, 110, 600, bh, 26); g.fill(); g.fillStyle = "#eef2f6"; g.textAlign = "left"; L.forEach((l, i) => g.fillText(l, W - 610, 110 + 40 + i * 52)); }
    if (s.reply) { g.fillStyle = "#16301f"; rr(g, 40, 330, 640, 150, 26); g.fill(); g.fillStyle = "#cdeed8"; g.textAlign = "left"; sans(g, 38, 500); g.fillText("Here's the script,", 72, 375); g.fillText("and 5 tests. All pass.", 72, 430); }
    if (s.real) { g.fillStyle = "#2d3a4f"; rr(g, W - 640, 510, 600, 90, 26); g.fill(); g.fillStyle = "#eef2f6"; sans(g, 38, 500); g.fillText("Here's the real file.", W - 610, 555); }
  });
  screen.mesh.position.set(0, 0.875, 0.005); hinge.add(screen.mesh);
  // the real file you describe instead of handing over
  const docP = panel(1.0, 1.25, 400, (g, W, H) => {
    g.fillStyle = "#f4f1e8"; rr(g, 4, 4, W - 8, H - 8, 22); g.fill(); g.fillStyle = "#d6a45a"; rr(g, 4, 4, W - 8, 74, [22, 22, 0, 0]); g.fill();
    mono(g, 40, 700); g.textAlign = "left"; g.fillStyle = "#1b1408"; g.fillText("export.csv", 30, 42);
    mono(g, 30, 500); g.fillStyle = "#1b212d"; ["date,item,total", "03-02,paper,12.40", "03-02,ink,31.00", "03-04,stamps,9.75", "03-05,paper,12.40", "..."].forEach((l, i) => g.fillText(l, 30, 128 + i * 58));
  });
  docP.set({}); scene.add(docP.mesh);
  // Blink's script and tests (II), and the real-file test (X)
  const codeP = panel(2.3, 0.62, 400, (g, W, H, s) => {
    g.fillStyle = "#0c0e11"; rr(g, 4, 4, W - 8, H - 8, 24); g.fill(); g.strokeStyle = "#4f93d6"; g.lineWidth = 7; rr(g, 6, 6, W - 12, H - 12, 22); g.stroke();
    mono(g, 40, 600); g.textAlign = "left"; g.fillStyle = "#9aa6b6"; g.fillText("script", 36, 50); g.fillStyle = "#4f93d6";
    for (let i = 0; i < s.n; i++) g.fillRect(36 + (i % 2) * 40, 100 + i * 26, 300 + ((i * 97) % 380), 14);
  });
  const testsA = panel(2.3, 0.5, 400, (g, W, H, s) => {
    g.fillStyle = "#0c0e11"; rr(g, 4, 4, W - 8, H - 8, 24); g.fill(); g.strokeStyle = "#6ad08a"; g.lineWidth = 7; rr(g, 6, 6, W - 12, H - 12, 22); g.stroke();
    mono(g, 40, 600); g.textAlign = "left"; g.fillStyle = "#9aa6b6"; g.fillText("tests", 36, H / 2);
    for (let i = 0; i < 5; i++) { const cx = 300 + i * 112; if (i < s.n) check(g, cx, H / 2, 36); else { g.beginPath(); g.arc(cx, H / 2, 36, 0, Math.PI * 2); g.fillStyle = "#1d2733"; g.fill(); } }
  });
  const realTest = panel(2.3, 0.78, 400, (g, W, H, s) => {
    const col = s.ok ? "#6ad08a" : "#d6a45a";
    g.fillStyle = "#0c0e11"; rr(g, 4, 4, W - 8, H - 8, 24); g.fill(); g.strokeStyle = col; g.lineWidth = 8; rr(g, 6, 6, W - 12, H - 12, 22); g.stroke();
    mono(g, 40, 600); g.textAlign = "left"; g.fillStyle = "#9aa6b6"; g.fillText("test:", 36, 70); g.fillStyle = "#eef2f6"; g.fillText(s.l1, 36 + g.measureText("test: ").width, 70);
    g.fillStyle = "#9aa6b6"; g.fillText("out:", 36, 190); g.fillStyle = s.ok ? "#6ad08a" : "#7b8593"; g.fillText(s.l2, 36 + g.measureText("out: ").width, 190);
    if (s.ok) check(g, W - 70, 70, 36);
  });
  [codeP, testsA, realTest].forEach((p) => scene.add(p.mesh));
  codeP.mesh.position.set(LX, 2.95, 0.4); testsA.mesh.position.set(LX, 2.3, 0.45); realTest.mesh.position.set(LX, 1.15, 0.5);

  // Blink, your AI, beside the laptop
  const rig = new THREE.Group(); scene.add(rig);
  const blink = makeBlink(THREE, G, ramp); rig.add(blink.root);
  const BLINK_S = 0.62, BLINK_AT = V(LX + 1.4, FLOOR + 1.08 * BLINK_S, 0.55);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: "#000", transparent: true, opacity: 0.45, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(BLINK_AT.x, FLOOR + 0.005, BLINK_AT.z); scene.add(shadow);

  // =============== THE INCIDENT ===============
  // the grey robot: a plain block, nothing like Blink
  const bot = new THREE.Group(); bot.position.set(RX, FLOOR, RZ); scene.add(bot);
  const grey = toon("#8a929e"), greyD = toon("#5b626d");
  const torso = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.95, 0.75, 2, 0.06), grey); torso.position.y = 0.6; bot.add(torso);
  const head = new THREE.Mesh(new RoundedBoxGeometry(0.8, 0.6, 0.65, 2, 0.06), grey); head.position.y = 1.42; bot.add(head);
  const visor = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.22), new THREE.MeshBasicMaterial({ color: "#1b2028" })); visor.position.set(0, 1.44, 0.331); bot.add(visor);
  [-0.14, 0.14].forEach((x) => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.045, 16), new THREE.MeshBasicMaterial({ color: "#d6dde6" })); d.position.set(x, 1.44, 0.333); bot.add(d); });
  [-0.28, 0.28].forEach((x) => { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.4), greyD); leg.position.set(x, 0.07, 0.05); bot.add(leg); });
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8), greyD); antenna.position.y = 1.85; bot.add(antenna);
  const desk = new THREE.Mesh(new RoundedBoxGeometry(1.5, 0.08, 0.7, 2, 0.02), toon("#2a3344")); desk.position.set(RX + 0.05, FLOOR + 0.62, RZ + 0.65); scene.add(desk);
  [-0.65, 0.65].forEach((dx) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 0.06), toon("#2a3344")); l.position.set(RX + 0.05 + dx, FLOOR + 0.3, RZ + 0.9); scene.add(l); });
  // its record: a scroll of forms, unrolling behind it while it works
  const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, SC_W + 0.3, 16), toon("#d6a45a")); roller.rotation.z = Math.PI / 2; roller.position.set(SCX, SC_TOP, SCZ); scene.add(roller);
  const SC_LEN = SC_TOP - FLOOR - 0.05;
  const scrollTex = glyphTexture(THREE, (g, W, H) => {
    g.fillStyle = "#f4f1e8"; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 9; i++) { const y = 26 + i * 108; g.fillStyle = "#e3ddcc"; rr(g, 20, y, W - 40, 92, 10); g.fill(); g.strokeStyle = "#b9b09a"; g.lineWidth = 3; rr(g, 34, y + 18, W - 120, 56, 8); g.stroke(); mono(g, 22, 600); g.fillStyle = "#8a7f66"; g.textAlign = "left"; g.fillText("message", 44, y + 46); }
  }, 256, 1000);
  const scroll = new THREE.Mesh(new THREE.PlaneGeometry(SC_W, SC_LEN), new THREE.MeshBasicMaterial({ map: scrollTex, side: THREE.DoubleSide }));
  scene.add(scroll);
  const scanMat = new THREE.MeshBasicMaterial({ color: "#4f93d6", transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(SC_W + 0.1, 0.16), scanMat); scene.add(scan);
  let beam = null; const beamMat = new THREE.MeshBasicMaterial({ color: "#4f93d6", transparent: true, depthWrite: false });
  // the job-giver and its instructions
  const giver = panel(0.75, 0.75, 300, (g, W, H) => {
    g.fillStyle = "#1b2330"; rr(g, 6, 6, W - 12, H - 12, 30); g.fill(); g.strokeStyle = "#9aa6b6"; g.lineWidth = 6; rr(g, 8, 8, W - 16, H - 16, 28); g.stroke();
    g.fillStyle = "#c9d1d9"; g.beginPath(); g.arc(W / 2, 74, 30, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(W / 2, 150, 52, 34, 0, Math.PI, 0); g.fill();
    mono(g, 26, 700); g.textAlign = "center"; g.fillStyle = "#eef2f6"; g.fillText("job-giver", W / 2, 196);
  });
  giver.set({}); giver.mesh.position.set(RX - 0.2, 3.55, 0.6); scene.add(giver.mesh);
  const instr = panel(1.15, 0.62, 400, (g, W, H, s) => {
    g.fillStyle = s.grey ? "#9aa0a8" : "#f4f1e8"; rr(g, 4, 4, W - 8, H - 8, 18); g.fill();
    mono(g, 38, 700); g.textAlign = "left"; g.fillStyle = "#1b212d"; g.fillText("instructions", 30, 50);
    mono(g, 40, 600); g.fillStyle = s.grey ? "#5b626d" : "#8f5b12"; g.fillText("file in: ledger 7", 30, 160);
  });
  scene.add(instr.mesh);

  // the script machine
  const mach = new THREE.Group(); scene.add(mach);
  const body = new THREE.Mesh(new RoundedBoxGeometry(MW, MH, MD, 4, 0.12), toon("#2c5d8f")); body.position.set(MX, FLOOR + MH / 2, 0); mach.add(body);
  const lip = new THREE.Mesh(new RoundedBoxGeometry(MW + 0.14, 0.16, MD + 0.14, 3, 0.05), toon("#4f93d6")); lip.position.set(MX, MTOP, 0); mach.add(lip);
  const slotM = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 0.22), new THREE.MeshBasicMaterial({ color: "#05070a" })); slotM.position.set(SX, MTOP + 0.06, 0); mach.add(slotM);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(MW - 0.3, MH - 0.5), new THREE.MeshBasicMaterial({ color: "#16273a" })); plate.position.set(MX, FLOOR + MH / 2 + 0.1, MFRONT + 0.005); mach.add(plate);
  const plaque = panel(1.6, 0.13, 400, (g, W, H) => { mono(g, 38, 700); g.textAlign = "center"; g.fillStyle = "#0d1a2a"; g.fillText("THE SCRIPT", W / 2, H / 2 + 2); });
  plaque.set({}); plaque.mesh.position.set(MX, MTOP, MFRONT + 0.08); mach.add(plaque.mesh);
  // what it looks for, in plain words
  const sel = panel(1.95, 0.5, 400, (g, W, H, s) => {
    g.fillStyle = "#0c0e11"; rr(g, 4, 4, W - 8, H - 8, 26); g.fill(); g.strokeStyle = s.red ? "#e0675a" : s.ok ? "#6ad08a" : "#4f93d6"; g.lineWidth = 8; rr(g, 6, 6, W - 12, H - 12, 24); g.stroke();
    mono(g, 34, 500); g.textAlign = "center"; g.fillStyle = "#9aa6b6"; g.fillText("looks for \"who\"", W / 2, 62); mono(g, 44, 700); g.fillStyle = "#eef2f6"; g.fillText(s.text, W / 2, 138);
  });
  sel.mesh.position.set(MX, MTOP - 0.48, MFRONT + 0.02); mach.add(sel.mesh);
  const tests = panel(1.95, 0.62, 400, (g, W, H, s) => {
    mono(g, 46, 600); g.textAlign = "left"; g.fillStyle = "#9aa6b6"; g.fillText("tests", 36, 60);
    g.textAlign = "right"; g.fillStyle = s.n === 5 ? "#6ad08a" : "#7b8593"; g.fillText(`${s.n}/5 passed`, W - 36, 60);
    for (let i = 0; i < 5; i++) { const cx = 92 + i * ((W - 184) / 4); if (i < s.n) check(g, cx, 172, 52); else { g.beginPath(); g.arc(cx, 172, 52, 0, Math.PI * 2); g.fillStyle = "#1d2733"; g.fill(); } }
  });
  tests.mesh.position.set(MX, MTOP - 1.22, MFRONT + 0.02); mach.add(tests.mesh);
  const lamps = panel(1.95, 0.42, 400, (g, W, H, s) => {
    [["error", "#e0675a", 0], ["warning", "#d6a45a", 0], ["exit 0", "#6ad08a", s.exit]].forEach(([lab, col, on], i) => {
      const cx = W * (i + 0.5) / 3;
      g.beginPath(); g.arc(cx, 52, 30, 0, Math.PI * 2); g.fillStyle = on ? col : "#232c38"; g.fill(); g.strokeStyle = col; g.globalAlpha = 0.6; g.lineWidth = 5; g.stroke(); g.globalAlpha = 1;
      mono(g, 34, 500); g.textAlign = "center"; g.fillStyle = on ? "#eef2f6" : "#7b8593"; g.fillText(lab, cx, 128);
    });
  });
  lamps.mesh.position.set(MX, MTOP - 1.9, MFRONT + 0.02); mach.add(lamps.mesh);
  const lampGlow = sprite(glowTex("rgba(160,255,190,0.9)", "rgba(106,208,138,0)"), 0.6); lampGlow.position.set(MX + 0.65, MTOP - 1.82, MFRONT + 0.06);
  const counter = panel(1.7, 0.46, 400, (g, W, H, s) => {
    const col = s.c === "red" ? "#e0675a" : s.c === "green" ? "#6ad08a" : "#d6a45a";
    g.fillStyle = "#0c0e11"; rr(g, 4, 4, W - 8, H - 8, 30); g.fill(); g.strokeStyle = col; g.lineWidth = 9; rr(g, 6, 6, W - 12, H - 12, 28); g.stroke();
    mono(g, 58, 600); g.textAlign = "left"; g.fillStyle = "#9aa6b6"; g.fillText("rows filed:", 48, H / 2 + 3);
    mono(g, 100, 700); g.textAlign = "right"; g.fillStyle = col; g.fillText(String(s.n), W - 56, H / 2 + 6);
  });
  counter.mesh.position.set(MX, MTOP - 2.6, MFRONT + 0.02); scene.add(counter.mesh);
  // ledger 7, the tray at its foot
  const tray = new THREE.Group(); scene.add(tray);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.16, 0.06), new THREE.MeshBasicMaterial({ color: "#05070a" })); mouth.position.set(MX, TRAY_Y + 0.12, MFRONT + 0.01); tray.add(mouth);
  const trayBase = new THREE.Mesh(new RoundedBoxGeometry(2.0, 0.1, 1.5, 3, 0.03), toon("#1f2a38")); trayBase.position.set(MX, TRAY_Y - 0.05, TRAY_Z); tray.add(trayBase);
  [-1, 1].forEach((sx) => { const s = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 1.5), toon("#d6a45a")); s.position.set(MX + sx * 0.97, TRAY_Y + 0.05, TRAY_Z); tray.add(s); });
  const lipF = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.34, 0.06), toon("#d6a45a")); lipF.position.set(MX, TRAY_Y + 0.02, TRAY_Z + 0.75); tray.add(lipF);
  const trayLabel = panel(1.2, 0.26, 300, (g, W, H) => { mono(g, 58, 700); g.textAlign = "center"; g.fillStyle = "#3a2a10"; g.fillText("ledger 7", W / 2, H / 2 + 2); });
  trayLabel.set({}); trayLabel.mesh.position.set(MX, TRAY_Y + 0.02, TRAY_Z + 0.785); tray.add(trayLabel.mesh);
  const ledgerGlow = sprite(glowTex("rgba(255,210,140,0.85)", "rgba(214,164,90,0)"), 1); ledgerGlow.scale.set(2.8, 1.3, 1); ledgerGlow.position.set(MX, TRAY_Y + 0.2, TRAY_Z);
  const ROW_T = "job 1 · 84,749 tokens";
  const ghost = panel(1.6, 0.22, 400, (g, W, H) => { g.setLineDash([26, 18]); g.strokeStyle = "#d6a45a"; g.lineWidth = 7; rr(g, 6, 6, W - 12, H - 12, 18); g.stroke(); g.setLineDash([]); mono(g, 44, 500); g.textAlign = "center"; g.fillStyle = "#d6a45a"; g.fillText("1 row per job", W / 2, H / 2 + 2); });
  ghost.set({}); ghost.mesh.rotation.x = -Math.PI / 2; ghost.mesh.position.set(MX, TRAY_Y + 0.02, TRAY_Z - 0.2); scene.add(ghost.mesh);
  const rowOut = panel(1.6, 0.22, 400, (g, W, H) => { g.fillStyle = "#d6a45a"; rr(g, 4, 4, W - 8, H - 8, 16); g.fill(); mono(g, 46, 700); g.textAlign = "center"; g.fillStyle = "#1b1408"; g.fillText(ROW_T, W / 2, H / 2 + 2); });
  rowOut.set({}); rowOut.mesh.rotation.x = -Math.PI / 2; scene.add(rowOut.mesh);
  const done = panel(1.3, 0.5, 300, (g, W, H) => { g.save(); g.translate(W / 2, H / 2); g.rotate(-0.12); g.strokeStyle = "#e0675a"; g.lineWidth = 12; rr(g, -W / 2 + 14, -H / 2 + 12, W - 28, H - 24, 16); g.stroke(); mono(g, 84, 700); g.textAlign = "center"; g.fillStyle = "#e0675a"; g.fillText("DONE", 0, 6); g.restore(); });
  done.set({}); done.mesh.rotation.x = -Math.PI / 2 + 0.5; done.mesh.position.set(MX, TRAY_Y + 0.25, TRAY_Z - 0.1); scene.add(done.mesh);

  // ---------- forms: the boxes on a form's face ----------
  // f = { head, headCol, faceWho, whoHl, msg (0 folded .. 1 open), msgHl, check, backside }
  const drawForm = (g, W, H, f) => {
    const sc = W / 800;
    g.fillStyle = "#f4f1e8"; rr(g, 4, 4, W - 8, H - 8, 30 * sc); g.fill();
    g.fillStyle = f.headCol || "#7b8593"; rr(g, 4, 4, W - 8, 84 * sc, [30 * sc, 30 * sc, 0, 0]); g.fill();
    mono(g, 42 * sc, 700); g.textAlign = "left"; g.fillStyle = "#ffffff"; g.fillText(f.head, 36 * sc, 46 * sc);
    if (f.check) check(g, W - 62 * sc, 46 * sc, 30 * sc);
    const box = (x, y, w, h, label, value, hl) => {
      if (hl && (f.hlA ?? 1) > 0) { g.globalAlpha = f.hlA ?? 1; g.fillStyle = hl; rr(g, x - 8 * sc, y - 8 * sc, w + 16 * sc, h + 16 * sc, 18 * sc); g.fill(); g.globalAlpha = 1; }
      g.fillStyle = "#ffffff"; rr(g, x, y, w, h, 12 * sc); g.fill(); g.strokeStyle = "#1b212d"; g.lineWidth = 5 * sc; rr(g, x, y, w, h, 12 * sc); g.stroke();
      mono(g, 30 * sc, 600); g.fillStyle = "#7b8593"; g.textAlign = "left"; g.fillText(label, x + 20 * sc, y + 30 * sc);
      if (value) { mono(g, 42 * sc, 700); g.fillStyle = "#1b212d"; g.fillText(value, x + 20 * sc, y + h - 34 * sc); }
    };
    const top = 130 * sc;
    if (f.faceWho) { box(40 * sc, top, 330 * sc, 130 * sc, "who", "job-giver", f.whoHl); box(410 * sc, top, 350 * sc, 130 * sc, "file in", "ledger 7"); }
    if (f.msg !== undefined && f.msg !== null) {
      const k = f.msg, x = 40 * sc, y = top, wB = W - 80 * sc, hB = mix(110 * sc, H - top - 34 * sc, k);
      if (f.msgHl && (f.msgHlA ?? 1) > 0) { g.globalAlpha = f.msgHlA ?? 1; g.fillStyle = f.msgHl; rr(g, x - 8 * sc, y - 8 * sc, wB + 16 * sc, hB + 16 * sc, 18 * sc); g.fill(); g.globalAlpha = 1; }
      g.fillStyle = "#fbf4df"; rr(g, x, y, wB, hB, 14 * sc); g.fill(); g.strokeStyle = "#8f5b12"; g.lineWidth = 6 * sc; rr(g, x, y, wB, hB, 14 * sc); g.stroke();
      mono(g, 32 * sc, 700); g.fillStyle = "#8f5b12"; g.textAlign = "left"; g.fillText("message", x + 20 * sc, y + 32 * sc);
      if (k < 0.5) { // folded: a fold corner, nothing showing
        g.fillStyle = "#e8d7ae"; g.beginPath(); g.moveTo(x + wB - 70 * sc, y); g.lineTo(x + wB, y); g.lineTo(x + wB, y + 70 * sc); g.closePath(); g.fill();
        mono(g, 30 * sc, 500); g.fillStyle = "#b39a6a"; g.fillText("(folded shut)", x + 220 * sc, y + 74 * sc);
      } else {
        g.globalAlpha = r01(k, 0.5, 0.5);
        box(x + 30 * sc, y + 62 * sc, 300 * sc, 120 * sc, "who", "job-giver", f.whoHl); box(x + 360 * sc, y + 62 * sc, 320 * sc, 120 * sc, "file in", "ledger 7");
        g.globalAlpha = 1;
      }
    }
    if (f.backside) { g.fillStyle = "#e3ddcc"; rr(g, 4, 90 * sc, W - 8, H - 94 * sc, [0, 0, 30 * sc, 30 * sc]); g.fill(); mono(g, 40 * sc, 600); g.fillStyle = "#b9b09a"; g.textAlign = "center"; g.fillText("entry", W / 2, H / 2 + 30 * sc); }
  };
  const formPanel = () => panel(FORM_W, FORM_H, 400, (g, W, H, s) => drawForm(g, W, H, s));
  const bubbleForm = formPanel(), realForm = formPanel();
  const bubbleRing = panel(FORM_W + 0.5, FORM_H + 0.42, 300, (g, W, H) => {
    g.fillStyle = "rgba(27,35,48,0.85)"; rr(g, 6, 6, W - 12, H - 12, 60); g.fill(); g.setLineDash([24, 16]); g.strokeStyle = "#9aa6b6"; g.lineWidth = 6; rr(g, 8, 8, W - 16, H - 16, 58); g.stroke(); g.setLineDash([]);
    mono(g, 30, 600); g.textAlign = "left"; g.fillStyle = "#9aa6b6"; g.fillText("what the script expects", 40, 42);
  });
  bubbleRing.set({}); scene.add(bubbleRing.mesh);
  [bubbleForm, realForm].forEach((p) => scene.add(p.mesh));
  const puffs = [0, 1, 2].map((i) => { const m = new THREE.Mesh(new THREE.CircleGeometry(0.06 + i * 0.02, 24), new THREE.MeshBasicMaterial({ color: "#9aa6b6", transparent: true })); scene.add(m); return m; });
  const entries = [0, 1, 2, 3].map(() => { const p = formPanel(); p.set({ head: "entry", backside: 1 }); scene.add(p.mesh); return p; });
  // the pointer: what the script is looking at
  const pointer = panel(0.42, 0.42, 300, (g, W, H, s) => { g.fillStyle = s.red ? "#e0675a" : "#4f93d6"; g.beginPath(); g.moveTo(W * 0.15, H * 0.1); g.lineTo(W * 0.85, H * 0.55); g.lineTo(W * 0.5, H * 0.6); g.lineTo(W * 0.35, H * 0.92); g.closePath(); g.fill(); g.strokeStyle = "#0d1117"; g.lineWidth = 8; g.stroke(); });
  scene.add(pointer.mesh);
  const notFound = panel(0.55, 0.55, 300, (g, W, H) => { g.strokeStyle = "#e0675a"; g.lineWidth = 26; g.lineCap = "round"; g.beginPath(); g.moveTo(40, 40); g.lineTo(W - 40, H - 40); g.moveTo(W - 40, 40); g.lineTo(40, H - 40); g.stroke(); });
  notFound.set({}); scene.add(notFound.mesh);
  // the five samples (VI) and the samples rebuilt (IX)
  const samples = [0, 1, 2, 3, 4].map(() => { const p = panel(0.84, 0.57, 400, (g, W, H, s) => drawForm(g, W, H, s)); scene.add(p.mesh); return p; });
  const sampleCard = (nested, hlA = 0) => nested ? { head: "sample", headCol: "#5b8a6a", msg: 1, check: 1, whoHl: "#cdeed8", hlA } : { head: "sample", faceWho: 1, check: 1, whoHl: "#cfe2f6", hlA };
  // the key and the lock
  const keyLock = panel(2.5, 1.75, 400, (g, W, H, s) => {
    const sketch = (col) => { g.strokeStyle = col; g.lineWidth = 10; g.lineJoin = "round"; g.lineCap = "round"; };
    const LXK = 560, LY = 250;
    const lockAt = (x, col, notch, label) => {
      sketch(col); g.fillStyle = "rgba(255,255,255,0.05)"; rr(g, x, LY, 210, 240, 24); g.fill(); g.stroke();
      g.beginPath(); g.arc(x + 105, LY, 68, Math.PI, 0); g.stroke();
      g.beginPath(); notch.forEach(([dx, dy], i) => (i ? g.lineTo(x + dx, LY + dy) : g.moveTo(x + dx, LY + dy))); g.stroke();
      mono(g, 40, 700); g.fillStyle = col; g.textAlign = "center"; g.fillText(label, x + 105, LY + 300);
    };
    const keyAt = (x, y, col) => {
      sketch(col); g.beginPath(); g.arc(x, y, 52, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.moveTo(x + 52, y); g.lineTo(x + 290, y); g.lineTo(x + 290, y + 30); g.lineTo(x + 262, y + 30); g.lineTo(x + 262, y + 14); g.lineTo(x + 234, y + 14); g.lineTo(x + 234, y + 38); g.lineTo(x + 206, y + 38); g.lineTo(x + 206, y + 14); g.stroke();
      mono(g, 40, 700); g.fillStyle = col; g.textAlign = "center"; g.fillText("the code", x, y - 80);
    };
    const blue = "#7fb3ea", amber = "#e8b46a";
    if (s.same) { mono(g, 38, 600); g.globalAlpha = s.same; g.fillStyle = "#9aa6b6"; g.textAlign = "center"; g.fillText("both drawn from the same guess", W / 2, 70); g.globalAlpha = 1; }
    if (s.lock && s.real < 1) { g.globalAlpha = s.lock * (1 - s.real); lockAt(LXK - 260 * s.real, blue, [[105, 90], [105, 130], [88, 130], [88, 165], [122, 165]], "the samples"); g.globalAlpha = 1; }
    if (s.real) { g.globalAlpha = s.real; lockAt(mix(W + 40, LXK, s.real), amber, [[60, 100], [150, 100], [150, 145], [60, 180]], "the real file"); g.globalAlpha = 1; }
    if (s.key) { g.globalAlpha = s.key; keyAt(mix(60, LXK + 105 - 270, s.slide) + s.shake * 16, 400, s.red ? "#e0675a" : s.click ? "#6ad08a" : blue); g.globalAlpha = 1; }
  });
  keyLock.mesh.position.copy(KEY_AT); scene.add(keyLock.mesh);
  // the test that mattered (IX), over the machine
  const fixTest = panel(2.4, 0.62, 400, (g, W, H, s) => {
    const col = s.ok ? "#6ad08a" : "#d6a45a";
    g.fillStyle = "#0c0e11"; rr(g, 4, 4, W - 8, H - 8, 24); g.fill(); g.strokeStyle = col; g.lineWidth = 8; rr(g, 6, 6, W - 12, H - 12, 22); g.stroke();
    mono(g, 38, 500); g.textAlign = "left";
    s.l.forEach((ln, i) => { if (!ln) return; const y = 70 + i * 104; const a = ln.indexOf(":"); g.fillStyle = "#9aa6b6"; g.fillText(ln.slice(0, a + 1), 36, y); g.fillStyle = "#eef2f6"; g.fillText(ln.slice(a + 1), 36 + g.measureText(ln.slice(0, a + 1)).width, y); });
    if (s.ok) check(g, W - 62, 62, 34);
  });
  fixTest.mesh.position.copy(TEST_AT); scene.add(fixTest.mesh);

  // ---------- the falling cards ----------
  const CARD_S = [0.9, 0.62];
  const tex = (f) => glyphTexture(THREE, (g, W, H) => drawForm(g, W, H, f), 400, 276);
  const sampleTex = tex(sampleCard(false)), realTex = tex({ head: "real record", headCol: "#d6a45a", msg: 0 }), layoutTex = tex({ head: "real layout", headCol: "#d6a45a", msg: 1 });
  const cardMesh = (t) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(CARD_S[0], CARD_S[1]), new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide })); scene.add(m); return m; };
  const hookCards = HOOK_IN.map(() => cardMesh(sampleTex)), oneSample = cardMesh(sampleTex), bigDrop = cardMesh(realTex), testCard = cardMesh(layoutTex);
  const FALL = 0.55;
  const dropPose = (m, tIn, t, jx = 0, fall = 1.6, fallT = FALL) => {
    const k = (t - (tIn - fallT)) / fallT;
    m.scale.setScalar(1); m.rotation.set(0, 0, 0); m.material.opacity = 1;
    if (k < 0 || t > tIn + 0.24) { m.visible = false; return; }
    m.visible = true;
    const yIn = MTOP + 0.06 + CARD_S[1] / 2;
    if (t < tIn) { const f = k * k; m.position.set(SX + jx * (1 - f), mix(yIn + fall, yIn, f), 0.02); m.rotation.z = jx * 0.3 * (1 - f); m.material.opacity = cl(k / 0.35); return; }
    const s = cl((t - tIn) / 0.22);
    m.position.set(SX, MTOP + 0.06 + (1 - s) * CARD_S[1] / 2, 0.02); m.scale.set(1, Math.max(0.01, 1 - s), 1);
  };
  const realGlow = sprite(glowTex("rgba(255,210,140,0.8)", "rgba(214,164,90,0)"), 1);

  // ---------- the field ----------
  const fieldTex = glyphTexture(THREE, (g, W, H) => drawForm(g, W, H, sampleCard(false)), 256, 176);
  const field = new THREE.InstancedMesh(new THREE.PlaneGeometry(CARD_S[0] * 0.85, CARD_S[1] * 0.85), new THREE.MeshBasicMaterial({ map: fieldTex, side: THREE.DoubleSide }), FIELD.length);
  field.frustumCulled = false; scene.add(field);
  const greenGlow = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ map: glowTex("rgba(140,255,170,0.9)", "rgba(106,208,138,0)"), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }), FIELD.length);
  greenGlow.frustumCulled = false; scene.add(greenGlow);

  // ---------- the frame at time t ----------
  const dummy = new THREE.Object3D();
  const q = (x) => Math.round(x * 8) / 8;
  const show = (p, a) => { p.mesh.visible = a > 0.01; p.mesh.material.opacity = cl(a); return a > 0.01; };
  function render(t) {
    cameraAt(t, cam);
    cam.translateZ(-0.22 * Math.sin(t * 0.42)); cam.translateX(0.07 * Math.sin(t * 0.31 + 0.8)); // a slow breath, so no hold reads as a stalled player
    const bob = 0.05 * Math.sin((t / 1.7) * Math.PI * 2);
    let happy = 0, blinkK = 0, look = 0, lookY = 0, think = 0, skew = 0, eager = 0, tilt = 0, lean = 0, hop = 0, yaw = 0;

    // ---- your desk ----
    const open = Math.max(1 - io(r01(t, T.heres, 0.6)), io(r01(t, T.back + 0.05, 0.7)));
    hinge.rotation.x = mix(Math.PI / 2 - 0.03, -0.12, open); // shut = folded forward onto the base
    screen.set({ ask: typed(ASK, T.ask, 30, t), reply: t > T.writes + 0.3 ? 1 : 0, real: t > T.hand + 0.2 ? 1 : 0 });
    const up = back(r01(t, T.real1 - 0.2, 0.4)), aside = io(r01(t, T.dont, 0.6)), handOver = io(r01(t, T.hand, 0.9));
    docP.mesh.visible = t > T.real1 - 0.2;
    docP.mesh.scale.setScalar(Math.max(0.01, up * (1 - handOver)));
    const held = V(LX - 0.85, 2.0, 1.0), down = V(LX - 1.1, FLOOR + 0.03, 1.6), into = V(LX, 1.15, 0.7);
    docP.mesh.position.copy(held).lerp(down, aside).lerp(into, handOver);
    docP.mesh.rotation.set(-Math.PI / 2 * aside * (1 - handOver), 0, 0.15 * aside * (1 - handOver));
    const cA = r01(t, T.writes - 0.1, 0.25) * (1 - r01(t, T.heres, 0.3)), tA2 = r01(t, T.tests2 - 0.1, 0.25) * (1 - r01(t, T.heres, 0.3));
    if (show(codeP, cA)) codeP.set({ n: Math.max(0, Math.min(5, Math.floor((t - T.writes) * 7))) });
    codeP.mesh.scale.setScalar(mix(0.85, 1, back(r01(t, T.writes - 0.1, 0.3))));
    if (show(testsA, Math.max(tA2, r01(t, T.back + 0.3, 0.3) * (1 - r01(t, T.hand + 0.4, 0.3))))) testsA.set({ n: t < T.back ? Math.min(5, Math.max(0, Math.floor((t - T.green1 + 0.25) / 0.08))) : 5 });
    testsA.mesh.scale.setScalar(1 + 0.06 * Math.max(pulse(t, T.green1, 0.2), pulse(t, T.trust + 0.4, 0.25)));
    if (show(realTest, r01(t, T.hand + 0.6, 0.3))) realTest.set({ l1: typed("export.csv, the real file", T.build - 0.3, 30, t) || " ", l2: t > T.right + 0.2 ? "the right totals" : t > T.build + 0.6 ? "..." : " ", ok: t > T.comesOutE ? 1 : 0 });
    realTest.mesh.scale.setScalar(mix(0.85, 1, back(r01(t, T.hand + 0.6, 0.3))) * (1 + 0.06 * pulse(t, T.comesOutE + 0.05, 0.2)));

    // ---- the incident: the robot works, its record unrolls ----
    bot.position.y = FLOOR + 0.03 * Math.abs(Math.sin(t * 2.2)) * (t > T.job && t < T.finished ? 1 : 0.3);
    head.rotation.y = 0.25 * Math.sin(t * 0.7);
    const unroll = io(r01(t, T.job - 0.4, T.finished - T.job + 0.4)) * 0.85 + 0.15;
    scroll.scale.y = unroll; scroll.position.set(SCX, SC_TOP - (SC_LEN * unroll) / 2, SCZ);
    scrollTex.repeat.set(1, unroll); scrollTex.offset.set(0, 1 - unroll);
    const sc1 = r01(t, T.read - 0.1, 1.2), sc2 = r01(t, T.entry - 0.5, 1.2), scK = t < T.never ? sc1 : sc2;
    const scOn = (sc1 > 0 && sc1 < 1) || (sc2 > 0 && sc2 < 1);
    scan.visible = scOn; scan.position.set(SCX, SC_TOP - 0.1 - scK * unroll * (SC_LEN - 0.2), SCZ + 0.02); scanMat.color.set(t > T.never ? "#e0675a" : "#4f93d6");
    if (beam) { scene.remove(beam); beam.geometry.dispose(); beam = null; }
    if (scOn) { const a = V(MX - MW / 2, 0.6, 0.2), b = scan.position.clone().add(V(0.5, 0, 0)); beam = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 2, 0.015, 6), beamMat); scene.add(beam); beamMat.color.copy(scanMat.color); }
    // the job-giver hands the instructions over; they're filed into the scroll
    const gA = r01(t, T.come - 0.2, 0.3) * (1 - r01(t, T.record2 + 0.4, 0.4));
    if (show(giver, gA)) giver.mesh.scale.setScalar(mix(0.8, 1, back(r01(t, T.come - 0.2, 0.35))));
    const iA = r01(t, T.instructions1 - 0.15, 0.25) * (1 - r01(t, T.record2 + 0.5, 0.3)) + r01(t, T.message2 + 0.1, 0.3) * (1 - r01(t, T.small + 0.6, 0.4));
    if (show(instr, iA)) {
      instr.set({ grey: 0 });
      if (t < T.fix) {
        const a = V(RX + 1.15, 3.1, 0.7), b = V(RX + 0.35, 1.9, 0.8), c = V(SCX, SC_TOP - 0.35, SCZ + 0.05);
        instr.mesh.position.copy(a).lerp(b, io(r01(t, T.sent, 0.6))).lerp(c, io(r01(t, T.record2, 0.5)));
        instr.mesh.scale.setScalar(mix(0.85, 1, back(r01(t, T.instructions1 - 0.15, 0.3))) * mix(1, 0.4, io(r01(t, T.record2, 0.5))));
      } else { // IX: lifted out of the "message" box on the real form
        const k = io(r01(t, T.message2 + 0.1, 0.8)); instr.mesh.position.copy(REAL_AT).add(V(0.25, -0.05 + 1.0 * k, 0.15)); instr.mesh.scale.setScalar(mix(0.5, 0.95, k));
      }
    }
    // ---- the machine ----
    const nLit = HOOK_IN.filter((x) => t >= x + 0.05).length;
    tests.set({ n: nLit });
    tests.mesh.scale.setScalar(1 + 0.05 * Math.max(pulse(t, HOOK_IN[4] + 0.1, 0.15), pulse(t, T.checks + 0.15, 0.2), pulse(t, T.five + 0.45, 0.25)));
    sel.set({ text: t > T.changed - 0.1 ? "inside \"message\"" : "on the face", red: t > T.found && t < T.fix, ok: t > ROW_AT + 0.4 });
    sel.mesh.scale.setScalar(1 + 0.08 * pulse(t, T.changed + 0.1, 0.25));
    const ex = r01(t, T.finished2 - 0.05, 0.2) * (1 - r01(t, T.why, 0.3)) + r01(t, T.outE - 0.3, 0.2) * (1 - r01(t, T.youve, 0.3));
    lamps.set({ exit: Math.round(cl(ex) * 6) / 6 });
    lamps.mesh.scale.setScalar(1 + 0.05 * Math.max(pulse(t, T.error + 0.1, 0.2), pulse(t, T.warning + 0.1, 0.2)));
    lampGlow.material.opacity = cl(ex) * (0.8 + 0.2 * Math.sin(t * 6)); lampGlow.visible = lampGlow.material.opacity > 0.01;
    // ledger 7: lit while the script knows where to file; one row lands in IX
    const lit = (r01(t, T.ledger2, 0.3) * (1 - r01(t, T.noLedger, 0.4))) + r01(t, T.instructions2 + 0.3, 0.4) * (1 - r01(t, T.back, 0.4));
    ledgerGlow.material.opacity = 0.55 * cl(lit) * (0.85 + 0.15 * Math.sin(t * 5)) + 0.6 * pulse(t, ROW_AT + 0.5, 0.6); ledgerGlow.visible = ledgerGlow.material.opacity > 0.01;
    const gh = r01(t, T.filed - 0.2, 0.3) * (1 - r01(t, T.needed, 0.4)) * (0.65 + 0.35 * Math.sin(t * 7));
    ghost.mesh.visible = gh > 0.01; ghost.mesh.material.opacity = gh;
    const lk = io(r01(t, ROW_AT, 0.5));
    rowOut.mesh.visible = t >= ROW_AT && t < T.back + 1.5;
    rowOut.mesh.position.set(MX, TRAY_Y + 0.03, mix(MFRONT + 0.05, TRAY_Z - 0.2, lk)); rowOut.mesh.scale.set(1, Math.max(0.01, mix(0.2, 1, lk)), 1);
    const cn = t >= ROW_AT + 0.4 ? 1 : 0;
    const cc = cn ? "green" : (t > T.nothing - 0.05 && t < T.youve) || (t > T.nothingFiled - 0.1 && t < T.why) || (t > T.zero - 0.05 && t < T.fix) ? "red" : "amber";
    counter.set({ n: cn, c: cc });
    counter.mesh.scale.setScalar(1 + 0.18 * Math.max(pulse(t, T.zero + 0.05, 0.2), pulse(t, ROW_AT + 0.45, 0.2), pulse(t, T.nothing + 0.05, 0.18), pulse(t, T.nothingFiled + 0.1, 0.2)) + 0.06 * pulse(t, T.counted + 0.3, 0.3));
    const dA = r01(t, T.finished2 - 0.05, 0.12) * (1 - r01(t, T.why - 0.2, 0.3));
    done.mesh.visible = dA > 0.01; done.mesh.material.opacity = cl(dA); done.mesh.scale.setScalar(mix(1.5, 1, back(r01(t, T.finished2 - 0.05, 0.25))));

    // ---- the drops ----
    HOOK_IN.forEach((tIn, i) => dropPose(hookCards[i], tIn, t, (i % 2 ? 1 : -1) * 0.2, 0.9));
    dropPose(oneSample, SAMPLE_IN, t, 0.2);
    dropPose(testCard, TEST_IN, t, -0.15);
    dropPose(bigDrop, REAL_IN, t, 0, 1.8, REAL_IN - T.oneReal + 0.05);
    if (bigDrop.visible && t < REAL_IN) bigDrop.scale.setScalar(mix(2.1, 1, io(r01(t, T.oneReal, REAL_IN - T.oneReal))));
    realGlow.visible = bigDrop.visible; realGlow.position.copy(bigDrop.position); realGlow.position.z -= 0.05; realGlow.scale.setScalar(2.4 * bigDrop.scale.x); realGlow.material.opacity = 0.8 * bigDrop.material.opacity;

    // ---- the close-ups over the machine ----
    // IV: a stack of entries, then the expected form (a thought) over the real one, face up on "assumed"
    entries.forEach((p, i) => {
      const a = r01(t, T.stack - 0.1 + i * 0.08, 0.25) * (1 - r01(t, T.assumed - 0.1, 0.3));
      if (show(p, a)) { p.mesh.position.copy(REAL_AT).add(V((i - 1.5) * 0.12, (i - 1.5) * -0.05, -0.02 * i)); p.mesh.rotation.z = (i - 1.5) * 0.05; }
    });
    const bA = r01(t, T.jgForms - 0.1, 0.3) * (1 - r01(t, T.but + 1.6, 0.4));
    show(bubbleForm, bA); show(bubbleRing, bA * 0.95);
    bubbleForm.mesh.position.copy(BUBBLE_AT).add(V(0, -0.06, 0.02)); bubbleRing.mesh.position.copy(BUBBLE_AT);
    const bs = mix(0.85, 1, back(r01(t, T.jgForms - 0.1, 0.35))); bubbleForm.mesh.scale.setScalar(bs); bubbleRing.mesh.scale.setScalar(bs);
    bubbleForm.set({ head: "a job-giver form", headCol: "#4f6a8f", faceWho: 1, whoHl: "#cfe2f6", hlA: r01(t, T.who1 - 0.1, 0.3) });
    puffs.forEach((m, i) => { m.visible = bA > 0.01; m.material.opacity = bA; m.position.set(MX + 1.3 - i * 0.06, BUBBLE_AT.y - FORM_H / 2 - 0.25 - i * 0.2, 1.3); });
    // the real form: face up on "assumed"; its folded "message" box opens on "inside"; back for the fix (IX)
    const rA = r01(t, T.assumed - 0.1, 0.3) * (1 - r01(t, T.entry - 0.6, 0.3)) + r01(t, T.fix + 0.2, 0.3) * (1 - r01(t, T.mattered - 0.4, 0.4));
    if (show(realForm, rA)) {
      const flip = t < T.fix ? io(r01(t, T.assumed - 0.1, 0.45)) : 1;
      realForm.mesh.position.copy(REAL_AT); realForm.mesh.scale.set(Math.max(0.02, Math.sin((Math.PI / 2) * flip)), 1, 1);
      const openK = t < T.fix ? io(r01(t, T.inside1, 0.7)) : 1;
      realForm.set({ head: "the real record", headCol: "#d6a45a", msg: openK, msgHl: "#f3e1c1", msgHlA: t < T.fix ? r01(t, T.message1 - 0.1, 0.3) * (1 - r01(t, T.found, 0.3)) : 0, whoHl: "#cdeed8", hlA: t < T.fix ? r01(t, T.message1, 0.3) * (1 - r01(t, T.found + 0.6, 0.3)) : 0 });
    }
    // the pointer: over the expected form's face, then the real form's face; red where it finds nothing
    const pA = (r01(t, T.looked, 0.25) * (1 - r01(t, T.entry - 0.6, 0.3))) + (r01(t, T.reach - 0.2, 0.25) * (1 - r01(t, T.small, 0.3)));
    if (show(pointer, pA)) {
      pointer.set({ red: t > T.found - 0.05 && t < T.fix ? 1 : 0 });
      let p;
      if (t < T.assumed) p = BUBBLE_AT.clone().add(V(-0.45 + 0.12 * Math.sin(t * 2.4), -0.16, 0.1));
      else if (t < T.fix) p = REAL_AT.clone().add(V(-0.45 + 0.4 * Math.sin((t - T.assumed) * 1.8), -0.3, 0.1));
      else p = REAL_AT.clone().add(V(-0.55, -0.32, 0.12));
      pointer.mesh.position.copy(p).add(V(0.28, -0.22, 0.02));
    }
    const nfA = back(r01(t, T.found, 0.25)) * (1 - r01(t, T.entry - 0.6, 0.3));
    if (show(notFound, nfA)) { notFound.mesh.position.copy(REAL_AT).add(V(0.62, 0.38, 0.2)); notFound.mesh.scale.setScalar(Math.max(0.01, nfA)); }
    // VI: the five samples, "who" on the face; IX: rebuilt with "who" inside "message"
    const s1 = r01(t, T.five - 0.15, 0.3) * (1 - r01(t, T.guessed - 0.3, 0.3)), s2 = r01(t, T.rebuilt - 0.45, 0.3) * (1 - r01(t, T.mattered - 0.4, 0.3));
    samples.forEach((p, i) => {
      const inIX = t > T.fix;
      const a = inIX ? s2 * r01(t, T.rebuilt - 0.45 + i * 0.09, 0.2) : s1 * r01(t, T.five - 0.15 + i * 0.09, 0.2);
      if (!show(p, a)) return;
      const ang = (i - 2) * 0.32, cy = inIX ? 6.2 : FAN_Y;
      p.mesh.position.set(MX + Math.sin(ang) * 1.45, cy - (1 - Math.cos(ang)) * 1.45, 1.25 + i * 0.002); p.mesh.rotation.z = -ang * 0.6;
      p.mesh.scale.setScalar(mix(0.7, 1, back(r01(t, (inIX ? T.rebuilt - 0.45 : T.five - 0.15) + i * 0.09, 0.3))));
      p.set(sampleCard(inIX, inIX ? r01(t, T.rebuilt, 0.3) : r01(t, T.who2 - 0.1, 0.3)));
    });
    // VII: the key and the lock
    const kA = r01(t, T.guessed - 0.2, 0.3) * (1 - r01(t, T.greenMeant - 0.3, 0.35));
    if (show(keyLock, kA)) {
      const slide = io(r01(t, T.checked, 0.5));
      keyLock.set({ key: r01(t, T.guessed - 0.2, 0.3), lock: r01(t, T.written - 0.2, 0.3), same: r01(t, T.guess1, 0.3), slide, click: t > T.checked + 0.45 && t < T.never2 ? 1 : 0,
        real: io(r01(t, T.never2, 0.6)), shake: t > T.realFile1 + 0.4 && t < T.realFile1 + 1.0 ? Math.round(Math.sin((t - T.realFile1) * 50) * 2) / 2 : 0, red: t > T.realFile1 + 0.4 ? 1 : 0 });
      keyLock.mesh.scale.setScalar(1 + 0.04 * pulse(t, T.checked + 0.45, 0.15));
    }
    // IX: the test that mattered
    const ftA = r01(t, T.mattered - 0.2, 0.25) * (1 - r01(t, T.back - 0.2, 0.4));
    if (show(fixTest, ftA)) fixTest.set({ l: [typed("test: a record in the real layout", T.mattered, 40, t), typed("expect: exactly 1 row", T.exactly - 0.4, 40, t)], ok: t > ROW_AT + 0.45 ? 1 : 0 });
    fixTest.mesh.scale.setScalar(mix(0.85, 1, back(r01(t, T.mattered - 0.2, 0.3))) * (1 + 0.06 * pulse(t, ROW_AT + 0.5, 0.2)));

    // ---- the field: green samples spread out from the machine ----
    const fOut = io(r01(t, T.zeroE + 0.3, 0.8));
    FIELD.forEach((f, i) => {
      const k = back(r01(t, f.at, 0.35)), s = Math.max(0, k) * (1 - fOut);
      if (s <= 0.001) { dummy.position.set(0, -50, 0); dummy.scale.setScalar(0); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); field.setMatrixAt(i, dummy.matrix); greenGlow.setMatrixAt(i, dummy.matrix); return; }
      const h = CARD_S[1] * 0.85;
      dummy.position.set(f.x, FLOOR + h / 2 * s + 0.02, f.z); dummy.rotation.set(-0.25, f.yaw, 0); dummy.scale.set(1, s, 1); dummy.updateMatrix(); field.setMatrixAt(i, dummy.matrix);
      const gl = pulse(t, f.at + 0.3, 0.3) * (1 - fOut);
      dummy.position.set(f.x + 0.3, FLOOR + h * 0.9, f.z + 0.05); dummy.rotation.set(-0.25, f.yaw, 0); dummy.scale.setScalar(Math.max(0.0001, gl)); dummy.updateMatrix(); greenGlow.setMatrixAt(i, dummy.matrix);
    });
    field.instanceMatrix.needsUpdate = true; greenGlow.instanceMatrix.needsUpdate = true;

    // ---- Blink, your AI (averaged over 0.2 s so no state change snaps) ----
    blinkK = Math.max(pulse(t, 6.8, 0.07), pulse(t, 11.0, 0.07), pulse(t, T.trust + 1.0, 0.07), pulse(t, T.itE + 2.0, 0.07));
    const poseAt = (t) => {
      let happy = 0, look = 0, lookY = 0, think = 0, skew = 0, eager = 0, tilt = 0, lean = 0, hop = 0, yaw = -0.45 + 0.08 * Math.sin((t / 3.1) * Math.PI * 2);
      if (t < T.ask) { look = -1.0; lookY = 0.2; }
      else if (t < T.writes) { look = -0.6; lookY = 0.6; think = r01(t, T.describe, 0.15) * (1 - r01(t, T.writes - 0.2, 0.15)); }
      else if (t < T.stop) { look = -0.5; lookY = 1.2; eager = r01(t, T.writes, 0.2); happy = 0.6 * r01(t, T.green1, 0.2); }
      else if (t < T.back) { happy = 0.7; look = -0.2; lookY = 0.3; }
      else if (t < T.hand) { look = -0.3; lookY = 1.0; }
      else if (t < T.comesOutE) { look = -0.8; lookY = 0.8; eager = 0.6 * r01(t, T.hand, 0.2); }
      else { happy = r01(t, T.comesOutE, 0.15) * 0.9; look = 0; lookY = 0.3; hop = 0.07 * Math.abs(Math.sin(Math.PI * 3 * (t - T.comesOutE))) * (1 - r01(t, T.comesOutE + 1.2, 0.4)); }
      return { happy, look, lookY, think, skew, eager, tilt, lean, hop, yaw };
    };
    const P = { happy: 0, look: 0, lookY: 0, think: 0, skew: 0, eager: 0, tilt: 0, lean: 0, hop: 0, yaw: 0 }, NS = 6;
    for (let i = 0; i < NS; i++) { const p = poseAt(t - i * 0.04); for (const k in P) P[k] += p[k] / NS; }
    ({ happy, look, lookY, think, skew, eager, tilt, lean, hop, yaw } = P);
    rig.position.set(BLINK_AT.x, BLINK_AT.y + bob + hop, BLINK_AT.z); rig.scale.setScalar(BLINK_S);
    shadow.material.opacity = 0.4 - bob; shadow.scale.setScalar((1 - bob) * BLINK_S * 1.05);
    blink.root.rotation.set(lean, yaw, tilt);
    blink.face({ blink: blinkK, happy, look, lookY, think, skew, eager, phase: t * 1.6 });
    renderer.render(scene, cam);
  }
  return render;
}

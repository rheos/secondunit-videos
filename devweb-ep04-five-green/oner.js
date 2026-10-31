// devweb ep 4, draft 2: "Five tests passed. The code did nothing." One Three.js world, one continuous camera (the
// standard since ep 1 draft 4). Draft 2 follows Robin's notes on draft 1 (too abstract): the film says what the script is
// for (a cost logger that bills every AI job in tokens) and where the bug comes from (one guess about the data, written
// into the code AND the tests). Blink sits on a blue cost logger: records drop into its roof slot, it should print a
// receipt per job into the tray. Blink writes the code and a test card from one guess bubble; the camera dives into a real
// record (role is one level down, inside message); a field of sample records all pass (the mass moment) while the bill
// says 0; one real record goes through: zero. Then three real inputs, a test built from one, the fix, one receipt.
// Everything is a pure function of film time t.
import * as THREE from "three";
import { makeBlink, glyphTexture } from "./kit/blink3d.js";
import { cl, io, back, r01, mix, V, pulse, typed, cameraPath, panel, rr, stage } from "./kit/world.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const VO = window.VO, G = window.BLINK;
const w = (x, n) => VO.w(x, n), e = (x, n) => VO.e(x, n);

// ---------- the beats, all on Chris's words (Whisper hears "role" as "roll") ----------
export const T = {
  five: w("five"), passed: w("passed"), did: w("did"), nothing: w("nothing"), nothingE: e("nothing"),
  if: w("if"), writes: w("writes"), code: w("code", 2), tests: w("tests", 2), go: w("go"), happen: w("happen"), both: w("both"),
  same: w("same"), guess: w("guess"), data: w("data"), agree: w("agree"), guess2: w("guess", 2), wrong: w("wrong"), wrongE: e("wrong"),
  heres: w("here's"), script: w("script"), log: w("log"), cost: w("cost"), looked: w("looked"), field: w("field"), role: w("roll"), top: w("top"),
  real2: w("real", 2), level: w("level"), inside: w("inside"), matched: w("matched"), wrote: w("wrote"), exited: w("exited"), clean: w("clean"),
  its: w("its"), sample: w("sample"), flat: w("flat"), expected: w("expected"), so3: w("so", 3), all: w("all"), passed2: w("passed", 2), passed2E: e("passed", 2),
  one4: w("one", 4), real3: w("real", 3), run: w("run"), zero: w("zero"), zeroE: e("zero"),
  so4: w("so", 4), trust: w("trust"), green: w("green"), give: w("give"), example: w("example"),
  realLog: w("real", 5), realApi: w("real", 6), realFile: w("real", 7), have: w("have"), build: w("build"), that: w("that"),
  your5: w("your", 5), start: w("start"), data2: w("data", 2), not: w("not"), guess3E: e("guess", 3), END: VO.END,
};

// ---------- the layout ----------
const FLOOR = -1.72;
const MX = 0.5, MW = 2.4, MH = 3.4, MD = 1.8, MTOP = FLOOR + MH, MFRONT = MD / 2; // the machine, front face at z = 0.9
const SX = MX - 0.6; // the intake slot on its roof, left of where Blink sits
const TRAY_Y = FLOOR + 0.32, TRAY_Z = MFRONT + 0.75; // the tray at its foot, sticking out toward the camera
const BLINK_AT = V(MX + 0.64, MTOP + 0.88, -0.15), BLINK_S = 0.72; // Blink sits on the roof, watching the slot
// the stack over Blink's head: the guess bubble, the code chip, the card (a test card or a real record)
const CARD = V(MX, 5.8, 1.2), CW = 1.7, CH = 1.3;
const CHIP = V(MX, 4.85, 1.22), BUBBLE = V(MX + 0.2, 4.2, 1.0);
const ROWY = (px) => CARD.y + CH / 2 - (px * CW / 2) / 400; // a card's canvas row (px at W = 800) in world y
const TESTP = V(MX, 4.5, 0.9); // the test built from a real input (VI), over Blink
const REAL3 = [V(MX - 0.68, 4.95, 1.1), V(MX + 0.4, 5.2, 1.15), V(MX + 1.48, 4.95, 1.1)]; // a real log, API response, file

// ---------- the drops: a card falls into the slot, then slips in ----------
const HOOK_IN = [0, 1, 2, 3, 4].map((i) => 0.62 + i * 0.235); // the five sample records land on "five tests passed"
const PROD_IN = [0, 1, 2, 3, 4, 5].map((i) => T.log - 0.1 + i * 0.36); // jobs finishing: real records in, no receipts out
const REAL_IN = T.run + 0.35; // V: the one real record, dropped from high over the field
const TEST_IN = [T.that, T.data2 + 0.05]; // VI: the test feeds a real log twice: before the fix (0) and after (1)
const FIX_AT = T.start - 0.2, RECEIPT = TEST_IN[1] + 0.28;

// ---------- the camera path: [time, position, target, fov] ----------
const RIG = [[MX, 2.2, 12.6], [MX, 0.85, 0.6], 36]; // the whole station: slot, machine, tray, Blink
const STACK = [[MX, 4.5, 10.6], [MX, 4.35, 1.0], 34]; // Blink's head, the bubble, the chip, the card
const TRAYC = [[MX + 0.05, 2.4, 8.9], [MX, -0.75, 1.5], 36]; // close on the counter and the tray
const KEYS = [
  // I. the hook: the slot, the window and the five checks
  [0, [MX, 2.6, 10.6], [MX, 1.6, 0.6], 34],
  [T.did - 0.15, [MX, 2.5, 10.1], [MX, 1.5, 0.6], 34],
  [T.nothingE + 0.15, ...TRAYC],
  // II. up to the stack: Blink writes the code and the test from one guess
  [T.writes + 0.7, ...STACK],
  [T.guess2, [MX - 0.05, 4.48, 10.4], [MX, 4.33, 1.0], 34],
  [T.wrongE + 0.2, [MX - 0.05, 4.48, 10.3], [MX, 4.33, 1.0], 34],
  // III. a real one: down to the station, the cost logger
  [T.script - 0.1, ...RIG],
  [T.cost + 0.3, [MX, 2.15, 12.4], [MX, 0.85, 0.6], 36],
  // the dive back up to the real record
  [T.field + 0.4, ...STACK],
  [T.matched - 0.05, [MX - 0.05, 4.48, 10.3], [MX, 4.33, 1.0], 34],
  // wrote nothing, exited clean: down to the lamps and the tray
  [T.wrote + 0.35, [MX, 1.9, 11.4], [MX, 0.5, 0.6], 36],
  [T.its - 0.1, [MX, 1.95, 11.3], [MX, 0.55, 0.6], 36],
  // IV. its five tests: back up to the stack, the sample record against the code
  [T.sample + 0.2, ...STACK],
  [T.expected + 0.3, [MX + 0.05, 4.6, 11.0], [MX, 4.2, 1.0], 34],
  // the mass moment: crane back and up over the field of sample records, every one passing
  [T.all + 0.6, [0.5, 10.0, 13.0], [0.4, -0.8, -1.8], 38],
  [T.passed2E + 0.5, [0.5, 15.5, 13.5], [0.4, -1.6, -4.5], 40],
  [T.run - 0.05, [0.6, 16.0, 13.8], [0.4, -1.6, -4.5], 40],
  // V. the one real record goes through: down to the counter
  [T.zero - 0.1, ...TRAYC],
  [T.zeroE + 0.6, [MX + 0.05, 2.4, 8.8], [MX, -0.75, 1.5], 36],
  // VI. trust the green: the station; then up to Blink and the three real inputs
  [T.green + 0.2, ...RIG],
  [T.example + 0.2, [MX + 0.4, 4.2, 10.6], [MX + 0.4, 4.05, 1.0], 34],
  [T.realFile + 0.5, [MX + 0.4, 4.15, 10.5], [MX + 0.4, 4.05, 1.0], 34],
  // the test built from them, run before and after the fix
  [T.build + 0.3, [MX, 2.7, 14.0], [MX, 1.5, 0.6], 36],
  [T.data2 - 0.55, [MX, 2.65, 13.8], [MX, 1.45, 0.6], 36],
  // the receipt lands
  [RECEIPT + 0.35, ...TRAYC],
  [T.guess3E + 0.3, [MX + 0.05, 2.4, 8.8], [MX, -0.75, 1.5], 36],
  // the end: rise to look down on the station
  [T.guess3E + 2.0, [MX - 0.1, 7.4, 11.6], [MX, 0.9, 0.5], 38],
  [T.END, [MX - 0.1, 7.6, 11.8], [MX, 0.9, 0.5], 38],
];
const cameraAt = cameraPath(KEYS);

// ---------- the field of sample records (the mass moment) ----------
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const FIELD = [], F0 = T.so3 - 0.1;
for (let gx = -15; gx <= 15; gx++) for (let gz = -18; gz <= 5; gz++) {
  const x = MX + gx * 1.05 + (hash(gx * 31 + gz) - 0.5) * 0.25, z = gz * 1.25 + (hash(gx + gz * 17) - 0.5) * 0.3;
  const d = Math.hypot(x - MX, z);
  if (d < 2.9) continue; // clear of the station
  FIELD.push({ x, z, d, at: F0 + d * 0.11 + hash(gx * 7 + gz * 13) * 0.2, yaw: (hash(gx * 3 + gz) - 0.5) * 0.35 });
}

export async function buildWorld(canvas) {
  // ---------- sound cues (times only; reported before any await so cues.mjs sees them) ----------
  const cue = (k, t, extra) => window.BP.CUES.push(Object.assign({ k, t: +t.toFixed(3) }, extra || {}));
  const CODE = '.role == "user"', CPS = 30;
  HOOK_IN.forEach((t) => { cue("tick", t); cue("blip", t + 0.03); });
  cue("whoosh", T.did - 0.2, { d: 0.9 });
  cue("whoosh", T.if - 0.05, { d: 1.0 }); cue("pop", T.writes); [...CODE].forEach((ch, i) => ch.trim() && cue("type", T.writes + 0.05 + i / CPS));
  cue("slide", T.tests - 0.05, { d: 0.4 }); cue("ding", T.go);
  cue("pop", T.same - 0.05); cue("draw", T.guess, { d: 0.7 }); cue("blip", T.data); cue("ding", T.agree); cue("blip", T.guess2 - 0.05); cue("strike", T.wrong); // the bubble turns red on "the guess"
  cue("whoosh", T.heres, { d: 1.2 }); PROD_IN.forEach((t) => cue("tick", t)); cue("blip", T.cost + 0.05);
  cue("whoosh", T.looked, { d: 1.0 }); cue("pop", T.field + 0.1); cue("slide", T.top - 0.05, { d: 0.4 }); cue("blip", T.real2);
  cue("draw", T.level, { d: 0.5 }); cue("blip", T.inside + 0.1); cue("strike", T.matched + 0.05);
  cue("whoosh", T.matched + 0.6, { d: 0.8 }); cue("thud", T.wrote + 0.3); cue("ding", T.clean + 0.1);
  cue("whoosh", T.its - 0.05, { d: 0.9 }); cue("slide", T.sample - 0.1, { d: 0.4 }); cue("blip", T.flat + 0.1); cue("ding", T.expected + 0.1);
  cue("riser", T.so3 - 0.4, { d: 0.6 }); cue("whoosh", T.so3 + 0.1, { d: 2.0 }); cue("draw", F0 + 0.3, { d: 2.2 });
  FIELD.forEach((f, i) => { if (i % 40 === 0) cue("blip", f.at); });
  cue("riser", T.one4 - 0.2, { d: 1.2 }); cue("whoosh", T.run, { d: 1.0 }); cue("tick", REAL_IN); cue("stamp", T.zero);
  cue("whoosh", T.so4, { d: 1.0 }); cue("blip", T.green + 0.05);
  cue("whoosh", T.give, { d: 1.0 }); cue("pop", T.example); [T.realLog, T.realApi, T.realFile].forEach((t) => cue("pop", t + 0.1));
  const TEST = ["test: a real log in", "expect: 1 job billed"];
  cue("whoosh", T.have, { d: 0.9 }); [...TEST[0]].forEach((ch, i) => ch.trim() && cue("type", T.build + i / CPS)); [...TEST[1]].forEach((ch, i) => ch.trim() && cue("type", T.build + 0.5 + i / CPS));
  cue("tick", TEST_IN[0]); cue("thud", TEST_IN[0] + 0.3);
  [...'.message.role == "user"'].forEach((ch, i) => ch.trim() && cue("type", FIX_AT + i / 45));
  cue("tick", TEST_IN[1]); cue("zip", RECEIPT - 0.1); cue("land", RECEIPT + 0.3); cue("ding", RECEIPT + 0.45);
  cue("whoosh", T.guess3E + 0.2, { d: 1.6 }); cue("sting", T.guess3E + 1.25);

  await document.fonts.ready;
  const { renderer, scene, cam, ramp, toon } = stage(canvas, { fog: [24, 95] });

  // ---------- Blink ----------
  const rig = new THREE.Group(); scene.add(rig);
  const blink = makeBlink(THREE, G, ramp); rig.add(blink.root);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: "#000", transparent: true, opacity: 0.45, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(BLINK_AT.x, MTOP + 0.09, BLINK_AT.z); scene.add(shadow);

  // ---------- a soft pool of light on the floor under the station ----------
  const pool = new THREE.Mesh(new THREE.CircleGeometry(6.5, 64), new THREE.MeshBasicMaterial({ map: glyphTexture(THREE, (g, W) => { const gr = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); gr.addColorStop(0, "rgba(40,62,88,0.85)"); gr.addColorStop(0.55, "rgba(28,42,60,0.45)"); gr.addColorStop(1, "rgba(13,17,23,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, W); }, 256, 256), transparent: true, depthWrite: false }));
  pool.rotation.x = -Math.PI / 2; pool.position.set(MX, FLOOR + 0.003, 1.2); scene.add(pool);

  // ---------- the machine: a cost logger ----------
  const mach = new THREE.Group(); scene.add(mach);
  const body = new THREE.Mesh(new RoundedBoxGeometry(MW, MH, MD, 4, 0.12), toon("#2c5d8f")); body.position.set(MX, FLOOR + MH / 2, 0); mach.add(body);
  const lip = new THREE.Mesh(new RoundedBoxGeometry(MW + 0.14, 0.16, MD + 0.14, 3, 0.05), toon("#4f93d6")); lip.position.set(MX, MTOP, 0); mach.add(lip);
  const slotM = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 0.22), new THREE.MeshBasicMaterial({ color: "#05070a" })); slotM.position.set(SX, MTOP + 0.06, 0); mach.add(slotM);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(MW - 0.3, MH - 0.5), new THREE.MeshBasicMaterial({ color: "#16273a" })); plate.position.set(MX, FLOOR + MH / 2 + 0.1, MFRONT + 0.005); mach.add(plate);
  const mono = (g, px, wt = 600) => { g.font = `${wt} ${px}px 'IBM Plex Mono', monospace`; g.textBaseline = "middle"; };
  // its name plate, on the roof's front edge
  const plaque = panel(1.6, 0.13, 400, (g, W, H) => { mono(g, 38, 700); g.textAlign = "center"; g.fillStyle = "#0d1a2a"; g.fillText("COST LOGGER", W / 2, H / 2 + 2); });
  plaque.set({}); plaque.mesh.position.set(MX, MTOP, MFRONT + 0.08); mach.add(plaque.mesh);
  // the selector window: what the code looks for
  const sel = panel(1.95, 0.5, 400, (g, W, H, s) => {
    g.fillStyle = "#0c0e11"; rr(g, 4, 4, W - 8, H - 8, 26); g.fill(); g.strokeStyle = s.red ? "#e0675a" : "#4f93d6"; g.lineWidth = 8; rr(g, 6, 6, W - 12, H - 12, 24); g.stroke();
    mono(g, s.text.length > 16 ? 50 : 72); g.textAlign = "center"; g.fillStyle = "#eef2f6"; g.fillText(s.text, W / 2, H / 2 + 3);
  });
  sel.mesh.position.set(MX, MTOP - 0.48, MFRONT + 0.02); mach.add(sel.mesh);
  // the five tests
  const tests = panel(1.95, 0.62, 400, (g, W, H, s) => {
    mono(g, 46, 600); g.textAlign = "left"; g.fillStyle = "#9aa6b6"; g.fillText("tests", 36, 60);
    g.textAlign = "right"; g.fillStyle = s.n === 5 ? "#6ad08a" : "#7b8593"; g.fillText(`${s.n}/5 passed`, W - 36, 60);
    for (let i = 0; i < 5; i++) {
      const cx = 92 + i * ((W - 184) / 4), cy = 172, on = i < s.n;
      g.beginPath(); g.arc(cx, cy, 52, 0, Math.PI * 2); g.fillStyle = on ? "#6ad08a" : "#1d2733"; g.fill();
      if (on) { g.strokeStyle = "#0d1117"; g.lineWidth = 14; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); g.moveTo(cx - 24, cy + 2); g.lineTo(cx - 6, cy + 20); g.lineTo(cx + 26, cy - 18); g.stroke(); }
    }
  });
  tests.mesh.position.set(MX, MTOP - 1.22, MFRONT + 0.02); mach.add(tests.mesh);
  // three lamps: error, warning, exit 0
  const lamps = panel(1.95, 0.42, 400, (g, W, H, s) => {
    [["error", "#e0675a", 0], ["warning", "#d6a45a", 0], ["exit 0", "#6ad08a", s.exit]].forEach(([lab, col, on], i) => {
      const cx = W * (i + 0.5) / 3;
      g.beginPath(); g.arc(cx, 52, 30, 0, Math.PI * 2); g.fillStyle = on ? col : "#232c38"; g.fill(); g.strokeStyle = col; g.globalAlpha = 0.6; g.lineWidth = 5; g.stroke(); g.globalAlpha = 1;
      mono(g, 34, 500); g.textAlign = "center"; g.fillStyle = on ? "#eef2f6" : "#7b8593"; g.fillText(lab, cx, 128);
    });
  });
  lamps.mesh.position.set(MX, MTOP - 1.9, MFRONT + 0.02); mach.add(lamps.mesh);
  const lampGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glyphTexture(THREE, (g, W) => { const gr = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); gr.addColorStop(0, "rgba(160,255,190,0.9)"); gr.addColorStop(1, "rgba(106,208,138,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, W); }, 128, 128), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  lampGlow.position.set(MX + 0.65, MTOP - 1.9 + 0.08, MFRONT + 0.06); lampGlow.scale.setScalar(0.6); scene.add(lampGlow);

  // ---------- the tray (the bill) and its counter ----------
  const tray = new THREE.Group(); scene.add(tray);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.16, 0.06), new THREE.MeshBasicMaterial({ color: "#05070a" })); mouth.position.set(MX, TRAY_Y + 0.12, MFRONT + 0.01); tray.add(mouth);
  const trayBase = new THREE.Mesh(new RoundedBoxGeometry(2.0, 0.1, 1.5, 3, 0.03), toon("#1f2a38")); trayBase.position.set(MX, TRAY_Y - 0.05, TRAY_Z); tray.add(trayBase);
  [-1, 1].forEach((sx) => { const s = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 1.5), toon("#d6a45a")); s.position.set(MX + sx * 0.97, TRAY_Y + 0.05, TRAY_Z); tray.add(s); });
  const lipF = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.34, 0.06), toon("#d6a45a")); lipF.position.set(MX, TRAY_Y + 0.02, TRAY_Z + 0.75); tray.add(lipF);
  const trayLabel = panel(1.2, 0.26, 300, (g, W, H) => { mono(g, 60, 700); g.textAlign = "center"; g.fillStyle = "#3a2a10"; g.fillText("the bill", W / 2, H / 2 + 2); });
  trayLabel.set({}); trayLabel.mesh.position.set(MX, TRAY_Y + 0.02, TRAY_Z + 0.785); tray.add(trayLabel.mesh); // on the front lip, where the camera always sees it
  const counter = panel(1.7, 0.46, 400, (g, W, H, s) => {
    const col = s.c === "red" ? "#e0675a" : s.c === "green" ? "#6ad08a" : "#d6a45a";
    g.fillStyle = "#0c0e11"; rr(g, 4, 4, W - 8, H - 8, 30); g.fill(); g.strokeStyle = col; g.lineWidth = 9; rr(g, 6, 6, W - 12, H - 12, 28); g.stroke();
    mono(g, 58, 600); g.textAlign = "left"; g.fillStyle = "#9aa6b6"; g.fillText("jobs billed:", 48, H / 2 + 3);
    mono(g, 100, 700); g.textAlign = "right"; g.fillStyle = col; g.fillText(String(s.n), W - 56, H / 2 + 6);
  });
  counter.mesh.position.set(MX, MTOP - 2.6, MFRONT + 0.02); scene.add(counter.mesh);
  // the receipt it should print (dashed ghost) and the one it does print in VI (the article's own example event)
  const RECEIPT_T = "job 1 · 84,749 tokens";
  const ghost = panel(1.6, 0.22, 400, (g, W, H) => { g.setLineDash([26, 18]); g.strokeStyle = "#d6a45a"; g.lineWidth = 7; rr(g, 6, 6, W - 12, H - 12, 18); g.stroke(); g.setLineDash([]); mono(g, 44, 500); g.textAlign = "center"; g.fillStyle = "#d6a45a"; g.fillText("job · tokens", W / 2, H / 2 + 2); });
  ghost.set({}); ghost.mesh.rotation.x = -Math.PI / 2; ghost.mesh.position.set(MX, TRAY_Y + 0.02, TRAY_Z - 0.2); scene.add(ghost.mesh);
  const lineOut = panel(1.6, 0.22, 400, (g, W, H) => { g.fillStyle = "#d6a45a"; rr(g, 4, 4, W - 8, H - 8, 16); g.fill(); mono(g, 46, 700); g.textAlign = "center"; g.fillStyle = "#1b1408"; g.fillText(RECEIPT_T, W / 2, H / 2 + 2); });
  lineOut.set({}); lineOut.mesh.rotation.x = -Math.PI / 2; scene.add(lineOut.mesh);
  const amberGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glyphTexture(THREE, (g, W) => { const gr = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); gr.addColorStop(0, "rgba(255,210,140,0.8)"); gr.addColorStop(1, "rgba(214,164,90,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, W); }, 128, 128), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  amberGlow.scale.set(2.6, 1.2, 1); amberGlow.position.set(MX, TRAY_Y + 0.15, TRAY_Z - 0.2); scene.add(amberGlow);

  // ---------- the cards: a sample record (flat, a test's input) and a real record (role one level down, inside message) ----------
  const FIXL = ['{"role": "user",', ' "content": "..."}'];
  const REALL = ['{"type": "user",', ' "message": {', '   "role": "user",', '   "content": "..."}}'];
  const drawCard = (g, W, H, real, s = {}) => {
    const sc = W / 800;
    g.fillStyle = "#eef2f6"; rr(g, 4, 4, W - 8, H - 8, 30 * sc); g.fill();
    g.fillStyle = real ? "#d6a45a" : "#7b8593"; rr(g, 4, 4, W - 8, 92 * sc, [30 * sc, 30 * sc, 0, 0]); g.fill();
    mono(g, 46 * sc, 700); g.textAlign = "left"; g.fillStyle = real ? "#1b1408" : "#ffffff"; g.fillText(s.head || (real ? "real record" : "test: sample record"), 40 * sc, 50 * sc);
    const lines = s.lines || (real ? REALL : FIXL), y0 = (real ? 180 : 230) * sc, lh = 120 * sc;
    const band = (row, col, a, x0 = 26) => { if (!a) return; g.globalAlpha = a; g.fillStyle = col; rr(g, x0 * sc, y0 + row * lh - 52 * sc, W - (x0 + 26) * sc, 104 * sc, 22 * sc); g.fill(); g.globalAlpha = 1; };
    if (real) { band(0, s.topRed ? "#f6c9c3" : "#cfe2f6", s.top || 0); band(1, "#f3e1c1", s.msg || 0, 60); band(2, "#cdeed8", s.nest || 0, 110); }
    else { band(0, s.wrong ? "#f6c9c3" : s.agree ? "#cdeed8" : "#cfe2f6", s.top || 0); }
    mono(g, 52 * sc, 500); g.fillStyle = "#1b212d";
    lines.forEach((ln, i) => g.fillText(ln, 52 * sc, y0 + i * lh + 2 * sc));
    if (real && s.nullTag) { g.globalAlpha = s.nullTag; mono(g, 44 * sc, 700); g.textAlign = "right"; g.fillStyle = "#8f2a1e"; g.fillText("role: null", W - 40 * sc, 50 * sc); g.globalAlpha = 1; g.textAlign = "left"; }
    if (!real && s.check) { // the green check it got
      const cx = W - 66 * sc, cy = 50 * sc; g.beginPath(); g.arc(cx, cy, 34 * sc, 0, Math.PI * 2); g.fillStyle = "#6ad08a"; g.fill();
      g.strokeStyle = "#0d1117"; g.lineWidth = 9 * sc; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); g.moveTo(cx - 15 * sc, cy + 1 * sc); g.lineTo(cx - 4 * sc, cy + 13 * sc); g.lineTo(cx + 17 * sc, cy - 12 * sc); g.stroke();
    }
  };
  // small dropping cards
  const CARD_S = [1.0, 0.78];
  const smallTex = { fix: glyphTexture(THREE, (g, W, H) => drawCard(g, W, H, false, { check: 1, head: "sample" }), 400, 310), real: glyphTexture(THREE, (g, W, H) => drawCard(g, W, H, true), 400, 310) };
  const SMALL = new THREE.PlaneGeometry(CARD_S[0], CARD_S[1]);
  const smallMesh = (kind) => { const m = new THREE.Mesh(SMALL, new THREE.MeshBasicMaterial({ map: smallTex[kind], transparent: true, side: THREE.DoubleSide })); scene.add(m); return m; };
  const hookCards = HOOK_IN.map(() => smallMesh("fix"));
  const prodCards = PROD_IN.map(() => smallMesh("real")), testCards = TEST_IN.map(() => smallMesh("real"));
  const bigDrop = smallMesh("real"); // V: the one real record, big enough to read from the crane
  // a card falls from above for FALL seconds, then slips into the slot in 0.22 s
  const FALL = 0.55;
  const dropPose = (m, tIn, t, jx = 0, fall = 2.0, fallT = FALL) => {
    const k = (t - (tIn - fallT)) / fallT;
    m.scale.setScalar(1); m.rotation.set(0, 0, 0); m.material.opacity = 1;
    if (k < 0 || t > tIn + 0.24) { m.visible = false; return; }
    m.visible = true;
    const yIn = MTOP + 0.06 + CARD_S[1] / 2;
    if (t < tIn) { const f = k * k; m.position.set(SX + jx * (1 - f), mix(yIn + fall, yIn, f), 0.02); m.rotation.z = jx * 0.3 * (1 - f); m.material.opacity = cl(k / 0.35); return; }
    const s = cl((t - tIn) / 0.22); // sink: the bottom edge stays on the slot, the card shortens into it
    m.position.set(SX, MTOP + 0.06 + (1 - s) * CARD_S[1] / 2, 0.02); m.scale.set(1, Math.max(0.01, 1 - s), 1);
  };
  const realGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: amberGlow.material.map, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  scene.add(realGlow);

  // ---------- the stack: the guess bubble, the code chip, the card ----------
  const bigReal = panel(CW, CH, 400, (g, W, H, s) => drawCard(g, W, H, true, s));
  const bigFix = panel(CW, CH, 400, (g, W, H, s) => drawCard(g, W, H, false, s));
  [bigReal, bigFix].forEach((p) => { p.mesh.position.copy(CARD); scene.add(p.mesh); });
  const chip = panel(2.0, 0.36, 400, (g, W, H, s) => {
    const col = s.c === "red" ? "#e0675a" : s.c === "green" ? "#6ad08a" : "#4f93d6";
    g.fillStyle = "#0c0e11"; rr(g, 4, 4, W - 8, H - 8, H / 2); g.fill(); g.strokeStyle = col; g.lineWidth = 8; rr(g, 6, 6, W - 12, H - 12, H / 2 - 4); g.stroke();
    mono(g, 50); g.textAlign = "left"; g.fillStyle = "#9aa6b6"; g.fillText("code:", 44, H / 2 + 3);
    const x0 = 44 + g.measureText("code: ").width; g.fillStyle = "#eef2f6"; g.fillText(s.text, x0, H / 2 + 3);
    if (s.hl && s.text.length > 5) { g.fillStyle = col; g.fillText(".role", x0, H / 2 + 3); }
  });
  chip.mesh.position.copy(CHIP); scene.add(chip.mesh);
  const verdict = panel(2.0, 0.32, 400, (g, W, H, s) => { mono(g, 58, 700); g.textAlign = "center"; g.fillStyle = s.col; g.fillText(s.text, W / 2, H / 2 + 3); });
  verdict.mesh.position.set(CARD.x, CARD.y + CH / 2 + 0.24, CARD.z + 0.02); scene.add(verdict.mesh);
  // the guess: a thought over Blink's head that feeds both the code and the test
  const bubble = panel(2.4, 0.56, 400, (g, W, H, s) => {
    const col = s.red ? "#e0675a" : "#eef2f6";
    g.fillStyle = s.red ? "#2a1414" : "#1b2330"; rr(g, 6, 6, W - 12, H - 12, H / 2); g.fill(); g.strokeStyle = col; g.lineWidth = 8; g.setLineDash([22, 14]); rr(g, 8, 8, W - 16, H - 16, H / 2 - 4); g.stroke(); g.setLineDash([]);
    mono(g, 50, 600); g.textAlign = "left"; const a = "guess: ", b = "role is at the top", wa = g.measureText(a).width, x0 = (W - wa - g.measureText(b).width) / 2;
    g.fillStyle = "#9aa6b6"; g.fillText(a, x0, H / 2 + 3); g.fillStyle = col; g.fillText(b, x0 + wa, H / 2 + 3);
    if (s.strike) { g.strokeStyle = "#e0675a"; g.lineWidth = 9; g.beginPath(); g.moveTo(x0 + wa - 8, H / 2 + 2); g.lineTo(x0 + wa + (g.measureText(b).width + 16) * s.strike, H / 2 + 2); g.stroke(); }
  });
  bubble.mesh.position.copy(BUBBLE); scene.add(bubble.mesh);
  const feedMat = new THREE.MeshBasicMaterial({ color: "#eef2f6", transparent: true, depthWrite: false });
  let feeds = [];
  const arrowMat = new THREE.MeshBasicMaterial({ color: "#6ad08a", transparent: true, depthWrite: false });
  let arrow = null;
  const tube = (pts, r, mat) => { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, r, 6), mat); scene.add(m); return m; };

  // ---------- the field ----------
  const fieldTex = glyphTexture(THREE, (g, W, H) => drawCard(g, W, H, false, { check: 1, head: "sample" }), 256, 198);
  const field = new THREE.InstancedMesh(new THREE.PlaneGeometry(CARD_S[0] * 0.8, CARD_S[1] * 0.8), new THREE.MeshBasicMaterial({ map: fieldTex, side: THREE.DoubleSide }), FIELD.length);
  field.frustumCulled = false; scene.add(field);
  const greenGlow = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ map: glyphTexture(THREE, (g, W) => { const gr = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); gr.addColorStop(0, "rgba(140,255,170,0.9)"); gr.addColorStop(1, "rgba(106,208,138,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, W); }, 64, 64), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }), FIELD.length);
  greenGlow.frustumCulled = false; scene.add(greenGlow);
  // the empty bill, called out over the machine for the crane shot
  const empty = panel(5.6, 1.0, 200, (g, W, H) => {
    g.fillStyle = "rgba(12,14,17,0.92)"; rr(g, 6, 6, W - 12, H - 12, 40); g.fill(); g.strokeStyle = "#e0675a"; g.lineWidth = 12; rr(g, 8, 8, W - 16, H - 16, 36); g.stroke();
    mono(g, 96, 700); g.textAlign = "left"; const a = "jobs billed: ", b = "0", wa = g.measureText(a).width, x0 = (W - wa - g.measureText(b).width) / 2;
    g.fillStyle = "#eef2f6"; g.fillText(a, x0, H / 2 + 4); g.fillStyle = "#e0675a"; g.fillText(b, x0 + wa, H / 2 + 4);
  });
  empty.set({}); scene.add(empty.mesh);

  // ---------- VI: three real inputs, and the test built from one ----------
  const REALS = [
    { head: "real log", lines: ['{"type": "user",', ' "message": {', '   "role": "user",'] },
    { head: "real API response", lines: ['{"status": 200,', ' "data": {', '   "id": 4211,'] },
    { head: "real file", lines: ['name,plan,seats', 'ana,pro,3', 'li,free,1'] },
  ].map((r) => { const p = panel(1.0, 0.78, 400, (g, W, H) => drawCard(g, W, H, true, r)); p.set({}); scene.add(p.mesh); return p; });
  const testP = panel(2.9, 1.0, 400, (g, W, H, s) => {
    const col = s.res === "ok" ? "#6ad08a" : s.res === "fail" ? "#e0675a" : "#d6a45a";
    g.fillStyle = "#0c0e11"; rr(g, 4, 4, W - 8, H - 8, 30); g.fill(); g.strokeStyle = col; g.lineWidth = 9; rr(g, 6, 6, W - 12, H - 12, 28); g.stroke();
    mono(g, 62, 500); g.textAlign = "left";
    s.l.forEach((ln, i) => { const y = 112 + i * 172; const at = ln.indexOf(":"); g.fillStyle = "#9aa6b6"; g.fillText(ln.slice(0, at + 1), 48, y); g.fillStyle = "#eef2f6"; g.fillText(ln.slice(at + 1), 48 + g.measureText(ln.slice(0, at + 1)).width, y); });
    if (s.res) { const cx = W - 70, cy = 70; g.beginPath(); g.arc(cx, cy, 36, 0, Math.PI * 2); g.fillStyle = col; g.fill(); g.strokeStyle = "#0d1117"; g.lineWidth = 10; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath();
      if (s.res === "ok") { g.moveTo(cx - 16, cy + 1); g.lineTo(cx - 4, cy + 14); g.lineTo(cx + 18, cy - 13); } else { g.moveTo(cx - 14, cy - 14); g.lineTo(cx + 14, cy + 14); g.moveTo(cx + 14, cy - 14); g.lineTo(cx - 14, cy + 14); }
      g.stroke(); }
  });
  testP.mesh.position.copy(TESTP); scene.add(testP.mesh);

  // ---------- the frame at time t ----------
  const dummy = new THREE.Object3D();
  const q = (x) => Math.round(x * 8) / 8; // canvas redraws in eighths: smooth enough, no redraw every frame
  function render(t) {
    cameraAt(t, cam);
    const bob = 0.05 * Math.sin((t / 1.7) * Math.PI * 2);
    let happy = 0, blinkK = 0, look = 0, lookY = 0, think = 0, skew = 0, eager = 0, tilt = 0, lean = 0, hop = 0, yaw = 0;

    // the cards falling into the slot (set every frame: frames render in any order)
    HOOK_IN.forEach((tIn, i) => dropPose(hookCards[i], tIn, t, (i % 2 ? 1 : -1) * 0.2, 0.9)); // short drops: clear of the hook line
    PROD_IN.forEach((tIn, i) => dropPose(prodCards[i], tIn, t, (i % 2 ? -1 : 1) * 0.3));
    TEST_IN.forEach((tIn, i) => dropPose(testCards[i], tIn, t, -0.15, 1.6));
    // V: the one real record falls a long way from over the field, big, then shrinks to card size as it reaches the slot
    dropPose(bigDrop, REAL_IN, t, 0, 3.0, REAL_IN - T.one4 + 0.05); // starts low enough to fall below the slams
    if (bigDrop.visible && t < REAL_IN) { const s = mix(2.0, 1, io(r01(t, T.one4, REAL_IN - T.one4))); bigDrop.scale.setScalar(s); }
    realGlow.visible = bigDrop.visible; realGlow.position.copy(bigDrop.position); realGlow.position.z -= 0.05; realGlow.scale.setScalar(2.4 * bigDrop.scale.x); realGlow.material.opacity = 0.8 * bigDrop.material.opacity; // fades in with the card

    // the five checks light as the samples go in, and pulse again "in one go" and on "all five passed"
    const nLit = HOOK_IN.filter((x) => t >= x + 0.05).length;
    tests.set({ n: nLit });
    tests.mesh.scale.setScalar(1 + 0.05 * Math.max(pulse(t, HOOK_IN[4] + 0.1, 0.15), pulse(t, T.passed2 + 0.1, 0.2)));
    // the selector: fixed to .message.role while the test runs in VI
    const fixed = t >= FIX_AT;
    sel.set({ text: fixed ? typed('.message.role == "user"', FIX_AT, 45, t) || "." : '.role == "user"', red: !fixed && ((t > T.matched && t < T.its) || (t > TEST_IN[0] + 0.3 && t < FIX_AT)) });
    sel.mesh.scale.setScalar(1 + 0.08 * pulse(t, FIX_AT + 0.25, 0.3));
    // lamps: exit 0 lights on "exited clean"
    const ex = r01(t, T.clean + 0.05, 0.2);
    lamps.set({ exit: Math.round(ex * 6) / 6 });
    lampGlow.material.opacity = ex * (1 - r01(t, T.its, 0.4)) * (0.8 + 0.2 * Math.sin(t * 6)); lampGlow.visible = lampGlow.material.opacity > 0.01;

    // the receipt it should print (on "log what every AI job cost"), and the one that does print in VI
    const gA = r01(t, T.log, 0.3) * (1 - r01(t, T.looked - 0.3, 0.4)) * (0.65 + 0.35 * Math.sin(t * 7));
    ghost.mesh.visible = gA > 0.01; ghost.mesh.material.opacity = gA;
    const lk = io(r01(t, RECEIPT, 0.5));
    lineOut.mesh.visible = t >= RECEIPT;
    lineOut.mesh.position.set(MX, TRAY_Y + 0.03, mix(MFRONT + 0.05, TRAY_Z - 0.2, lk)); lineOut.mesh.scale.set(1, Math.max(0.01, mix(0.2, 1, lk)), 1);
    amberGlow.material.opacity = 0.9 * pulse(t, RECEIPT + 0.5, 0.6) + 0.25 * r01(t, RECEIPT + 0.5, 0.5); amberGlow.visible = t > RECEIPT;
    // the counter: 0 until the receipt, red when the zero is read out, green at 1
    const cn = t >= RECEIPT + 0.4 ? 1 : 0;
    const cc = cn ? "green" : (t > T.nothing - 0.05 && t < T.writes) || (t > T.wrote && t < T.its) || (t > T.zero - 0.05 && t < T.green) || (t > TEST_IN[0] + 0.3 && t < TEST_IN[1]) ? "red" : "amber";
    counter.set({ n: cn, c: cc });
    counter.mesh.scale.setScalar(1 + 0.18 * Math.max(pulse(t, T.zero + 0.05, 0.2), pulse(t, RECEIPT + 0.45, 0.2), pulse(t, T.nothing + 0.05, 0.18), pulse(t, T.cost + 0.1, 0.2)));

    // ---- the stack ----
    // the code chip: typed on "writes your code", back for the dive (III) and the samples (IV)
    const chA = (r01(t, T.writes - 0.05, 0.2) * (1 - r01(t, T.heres, 0.3))) + (r01(t, T.field, 0.3) * (1 - r01(t, T.wrote, 0.3))) + (r01(t, T.sample - 0.2, 0.3) * (1 - r01(t, T.all + 0.2, 0.4)));
    chip.mesh.visible = chA > 0.01; chip.mesh.material.opacity = cl(chA);
    const chipC = (t > T.wrong - 0.05 && t < T.heres) || (t > T.matched && t < T.wrote + 0.3) ? "red" : (t > T.agree - 0.1 && t < T.wrong - 0.05) || (t > T.expected && t < T.all + 0.6) ? "green" : "blue";
    chip.set({ text: t < T.heres ? typed(CODE, T.writes + 0.05, CPS, t) : CODE, c: chipC, hl: (t > T.data - 0.1 && t < T.heres) || (t > T.top - 0.1 && t < T.wrote) || t > T.flat - 0.1 });
    chip.mesh.scale.setScalar(1 + 0.08 * Math.max(pulse(t, T.go + 0.05, 0.2), pulse(t, T.data + 0.05, 0.2), pulse(t, T.role + 0.1, 0.2), pulse(t, T.expected + 0.1, 0.2)));
    // the test card (a sample record): written on "your tests", and again for "its five tests"
    const fA = (r01(t, T.tests - 0.1, 0.25) * (1 - r01(t, T.heres, 0.3))) + (r01(t, T.its, 0.3) * (1 - r01(t, T.all + 0.2, 0.4)));
    bigFix.mesh.visible = fA > 0.01; bigFix.mesh.material.opacity = cl(fA);
    const fIn = t < T.heres ? T.tests - 0.1 : T.its;
    bigFix.mesh.position.set(CARD.x + 2.4 * (1 - io(r01(t, fIn, 0.4))), CARD.y, CARD.z); bigFix.mesh.scale.setScalar(1 + 0.04 * Math.max(pulse(t, T.go + 0.05, 0.15), pulse(t, T.sample + 0.1, 0.15)));
    bigFix.set({ check: t > T.go ? 1 : 0, head: t < T.heres ? "your test" : "test: sample record", top: q(t < T.heres ? r01(t, T.data - 0.1, 0.25) : r01(t, T.flat - 0.1, 0.25)),
      agree: (t > T.agree - 0.1 && t < T.wrong - 0.05) || (t > T.expected && t < T.all + 0.6), wrong: t > T.wrong - 0.05 && t < T.heres });
    // the real record (III)
    const rA = r01(t, T.field - 0.1, 0.3) * (1 - r01(t, T.wrote, 0.3));
    bigReal.mesh.visible = rA > 0.01; bigReal.mesh.material.opacity = rA; bigReal.mesh.scale.setScalar(mix(0.85, 1, back(r01(t, T.field - 0.1, 0.35))));
    bigReal.set({ top: q(r01(t, T.top - 0.05, 0.25)), topRed: t > T.matched - 0.05, nullTag: q(r01(t, T.real2 - 0.1, 0.25)), msg: q(r01(t, T.inside, 0.25) * 0.9), nest: q(r01(t, T.level, 0.3)) });
    // the verdict over the card
    let vText = "", vCol = "#6ad08a", vA = 0;
    if (t < T.heres) { vText = t < T.agree - 0.1 ? "tests: 5/5 pass" : t < T.wrong - 0.05 ? "code and test agree" : "both wrong"; vCol = t < T.wrong - 0.05 ? "#6ad08a" : "#e0675a"; vA = r01(t, T.go, 0.2) * (1 - r01(t, T.heres, 0.3)); }
    else if (t < T.its) { vText = "matched: 0 records"; vCol = "#e0675a"; vA = r01(t, T.matched - 0.05, 0.2) * (1 - r01(t, T.wrote, 0.3)); }
    else { vText = "tests: 5/5 pass"; vA = r01(t, T.expected, 0.2) * (1 - r01(t, T.all + 0.2, 0.4)); }
    vA *= 1 - pulse(t, T.agree - 0.1, 0.14) - pulse(t, T.wrong - 0.05, 0.14); // dip through each text swap, no one-frame change
    verdict.set({ text: vText, col: vCol }); verdict.mesh.visible = vA > 0.01; verdict.mesh.material.opacity = Math.max(0, vA);
    verdict.mesh.scale.setScalar(1 + 0.1 * Math.max(pulse(t, T.agree, 0.18), pulse(t, T.wrong + 0.05, 0.18), pulse(t, T.matched + 0.05, 0.18)));
    // the guess bubble and the two feeds out of it, into the code and into the test
    const bA = r01(t, T.same - 0.1, 0.25) * (1 - r01(t, T.heres, 0.3));
    bubble.mesh.visible = bA > 0.01; bubble.mesh.material.opacity = bA; bubble.mesh.scale.setScalar(mix(0.6, 1, back(r01(t, T.same - 0.1, 0.35))) * (1 + 0.06 * pulse(t, T.wrong + 0.05, 0.2)));
    bubble.set({ red: t > T.guess2 - 0.05, strike: q(r01(t, T.wrong, 0.3)) });
    feeds.forEach((m) => { scene.remove(m); m.geometry.dispose(); }); feeds = [];
    const fd = io(r01(t, T.guess, 0.7)) * (t < T.heres ? 1 : 0);
    if (fd > 0.01) {
      const b0 = BUBBLE.clone().add(V(-0.6, 0.28, 0)), c0 = CHIP.clone().add(V(-0.6, -0.18, 0));
      const b1 = BUBBLE.clone().add(V(1.2, 0.05, 0)), c1 = V(CARD.x + CW / 2 + 0.02, ROWY(230), CARD.z), m1 = V(CARD.x + CW / 2 + 0.42, (b1.y + c1.y) / 2, CARD.z);
      const part = (pts) => pts.slice(0, Math.max(2, Math.ceil(pts.length * fd)));
      feeds.push(tube(part(new THREE.LineCurve3(b0, c0).getPoints(20)), 0.02, feedMat));
      feeds.push(tube(part(new THREE.QuadraticBezierCurve3(b1, m1, c1).getPoints(30)), 0.02, feedMat));
    }
    feedMat.color.set(t > T.guess2 - 0.05 ? "#e0675a" : "#eef2f6"); feedMat.opacity = bA * 0.9;
    // the arrow from where the code looked down to where role really is (III)
    if (arrow) { scene.remove(arrow); arrow.geometry.dispose(); arrow = null; }
    const ar = r01(t, T.level - 0.1, 0.4) * (t < T.wrote ? 1 : 0);
    if (ar > 0.01) {
      const ax = CARD.x + CW / 2 - 0.14;
      const a = V(ax, ROWY(180) - 0.05, CARD.z + 0.03), b = V(ax, ROWY(420) + 0.02, CARD.z + 0.03), mid = V(ax + 0.13, (a.y + b.y) / 2, CARD.z + 0.03);
      arrow = tube(new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(30).slice(0, Math.max(2, Math.ceil(31 * ar))), 0.018, arrowMat);
    }
    arrowMat.opacity = 1 - r01(t, T.wrote - 0.3, 0.25);

    // ---- the field: sample records pop up in a ring spreading out from the machine, each with its check ----
    const fOut = io(r01(t, T.zeroE + 0.2, 0.8));
    FIELD.forEach((f, i) => {
      const k = back(r01(t, f.at, 0.35)), s = Math.max(0, k) * (1 - fOut);
      if (s <= 0.001) { dummy.position.set(0, -50, 0); dummy.scale.setScalar(0); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); field.setMatrixAt(i, dummy.matrix); greenGlow.setMatrixAt(i, dummy.matrix); return; }
      const h = CARD_S[1] * 0.8;
      dummy.position.set(f.x, FLOOR + h / 2 * s + 0.02, f.z); dummy.rotation.set(-0.25, f.yaw, 0); dummy.scale.set(1, s, 1); dummy.updateMatrix(); field.setMatrixAt(i, dummy.matrix);
      const gl = pulse(t, f.at + 0.3, 0.3) * (1 - fOut);
      dummy.position.set(f.x + 0.3, FLOOR + h * 0.9, f.z + 0.05); dummy.rotation.set(-0.25, f.yaw, 0); dummy.scale.setScalar(Math.max(0.0001, gl)); dummy.updateMatrix(); greenGlow.setMatrixAt(i, dummy.matrix);
    });
    field.instanceMatrix.needsUpdate = true; greenGlow.instanceMatrix.needsUpdate = true;
    const eA = 0; // the slam carries "0 jobs billed"; a sign in the world said it twice
    empty.mesh.visible = eA > 0.01; empty.mesh.material.opacity = eA;
    empty.mesh.position.set(MX, MTOP + 3.5, 0.4); empty.mesh.quaternion.copy(cam.quaternion); empty.mesh.scale.setScalar(mix(0.8, 1, back(r01(t, T.passed2 + 0.2, 0.4))));

    // ---- VI: the three real inputs, then the test built from them ----
    const rIn = [T.realLog - 0.05, T.realApi - 0.05, T.realFile - 0.05];
    REALS.forEach((p, i) => {
      const a = r01(t, rIn[i], 0.25) * (1 - r01(t, T.have + 0.1 * i, 0.35));
      p.mesh.visible = a > 0.01; p.mesh.material.opacity = a;
      const k = io(r01(t, T.have + 0.1 * i, 0.4)); // they gather into the test panel
      p.mesh.position.copy(REAL3[i]).lerp(TESTP, k); p.mesh.scale.setScalar(mix(0.8, 1.04, back(r01(t, rIn[i], 0.35))) * (1 - 0.6 * k));
    });
    const tA = r01(t, T.build - 0.1, 0.25) * (1 - r01(t, T.not, 0.4));
    testP.mesh.visible = tA > 0.01; testP.mesh.material.opacity = tA;
    testP.mesh.scale.setScalar(mix(0.85, 1, back(r01(t, T.build - 0.1, 0.3))) * (1 + 0.06 * Math.max(pulse(t, TEST_IN[0] + 0.35, 0.2), pulse(t, RECEIPT + 0.5, 0.2))));
    testP.set({ l: [typed(TEST[0], T.build, CPS, t), typed(TEST[1], T.build + 0.5, CPS, t)], res: t > RECEIPT + 0.45 ? "ok" : t > TEST_IN[0] + 0.3 && t < FIX_AT ? "fail" : "" });

    // ---- Blink: pose as a function of time, averaged over the last 0.2 s so no state change snaps in one frame ----
    blinkK = Math.max(pulse(t, 2.2, 0.07), pulse(t, T.both - 0.2, 0.07), pulse(t, T.heres + 0.6, 0.07), pulse(t, T.its - 0.4, 0.07), pulse(t, T.so4 + 0.3, 0.07), pulse(t, T.guess3E + 2.6, 0.07));
    const poseAt = (t) => {
      let happy = 0, look = 0, lookY = 0, think = 0, skew = 0, eager = 0, tilt = 0, lean = 0, hop = 0, yaw = -0.3 + 0.08 * Math.sin((t / 3.1) * Math.PI * 2);
      if (t < T.did) { look = -0.9; lookY = -0.2; happy = 0.6 * r01(t, T.passed, 0.2) * (1 - r01(t, T.did - 0.2, 0.15)); }
      else if (t < T.if) { look = -0.2; lookY = -1.2; lean = 0.15 * r01(t, T.nothing, 0.2); }
      else if (t < T.same - 0.3) { look = -0.3; lookY = 1.3; eager = 0.6 * r01(t, T.writes, 0.2); yaw = -0.1; } // writing, up into the stack
      else if (t < T.guess + 0.4) { look = 0.2; lookY = 1.3; think = r01(t, T.same - 0.3, 0.15); yaw = -0.1; }
      else if (t < T.guess2) { look = -0.2; lookY = 1.3; happy = 0.7 * r01(t, T.agree, 0.15); yaw = -0.1; }
      else if (t < T.heres) { look = 0.2; lookY = 1.1; skew = 0.8 * r01(t, T.wrong, 0.15); tilt = 0.15 * r01(t, T.wrong, 0.2); yaw = -0.1; }
      else if (t < T.looked) { look = -0.9; lookY = t < T.log ? 0 : -0.3; }
      else if (t < T.matched) { look = -0.2; lookY = 1.3; think = r01(t, T.looked, 0.12) * (1 - r01(t, T.level, 0.12)); }
      else if (t < T.its) { look = -0.2; lookY = t < T.wrote ? 1.0 : -1.2; skew = 0.7 * r01(t, T.clean, 0.2); tilt = 0.14 * r01(t, T.wrote, 0.3); }
      else if (t < T.so3) { look = -0.2; lookY = 1.3; }
      else if (t < T.one4) { happy = 0.6 * r01(t, T.all, 0.2); look = 0; lookY = 0.4; }
      else if (t < T.zero) { look = -0.5; lookY = t < T.run ? 1.4 : -1.2; }
      else if (t < T.so4) { look = -0.2; lookY = -1.2; tilt = -0.14 * r01(t, T.zero, 0.2); lean = 0.12; }
      else if (t < T.give) { look = 0; lookY = 0.2; }
      else if (t < T.have) { // reading the three real inputs in turn: left, middle, right
        lookY = 1.2; look = t < T.realApi - 0.1 ? -1.0 : t < T.realFile - 0.1 ? -0.3 : 0.7; eager = 0.4 * r01(t, T.example, 0.2); yaw = -0.05;
      }
      else if (t < RECEIPT) { look = -0.9; lookY = -0.2; tilt = TEST_IN[0] + 0.3 < t && t < FIX_AT ? -0.12 : 0; }
      else if (t < T.not + 0.5) { eager = r01(t, RECEIPT + 0.3, 0.12); look = -0.2; lookY = -1.2; hop = 0.08 * eager * Math.abs(Math.sin(Math.PI * 3 * (t - RECEIPT))); }
      else { happy = r01(t, T.not + 0.5, 0.15) * 0.9; look = 0; lookY = 0.3; yaw = -0.1 + 0.06 * Math.sin((t / 3.1) * Math.PI * 2); }
      return { happy, look, lookY, think, skew, eager, tilt, lean, hop, yaw };
    };
    const P = { happy: 0, look: 0, lookY: 0, think: 0, skew: 0, eager: 0, tilt: 0, lean: 0, hop: 0, yaw: 0 }, NS = 6;
    for (let i = 0; i < NS; i++) { const p = poseAt(t - i * 0.04); for (const k in P) P[k] += p[k] / NS; }
    ({ happy, look, lookY, think, skew, eager, tilt, lean, hop, yaw } = P);
    rig.position.set(BLINK_AT.x, BLINK_AT.y + bob + hop, BLINK_AT.z); rig.scale.setScalar(BLINK_S);
    shadow.material.opacity = 0.4 - bob; shadow.scale.setScalar((1 - bob) * BLINK_S * 0.75);
    blink.root.rotation.set(lean, yaw, tilt);
    blink.face({ blink: blinkK, happy, look, lookY, think, skew, eager, phase: t * 1.6 });
    renderer.render(scene, cam);
  }
  return render;
}

// devweb ep 4, draft 1: "Five tests passed. The code did nothing." One Three.js world, one continuous camera (the
// standard since ep 1 draft 4). A blue script machine: cards drop into its top slot, it should print one amber line per
// job into the tray at its foot. Five made-up fixture cards light five green checks while the tray stays empty. The
// camera dives into a real log card (role is one level down, inside message), then cranes over a field of made-up
// fixtures all flashing green (the mass moment). One real log through the machine: zero lines. The test that feeds a
// real log and expects exactly one line, and the one amber line lands. Everything is a pure function of film time t.
import * as THREE from "three";
import { makeBlink, glyphTexture } from "./kit/blink3d.js";
import { cl, io, back, r01, mix, V, pulse, typed, cameraPath, panel, rr, stage } from "./kit/world.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const VO = window.VO, G = window.BLINK;
const w = (x, n) => VO.w(x, n), e = (x, n) => VO.e(x, n);

// ---------- the beats, all on Chris's words (Whisper hears "role" as "roll" and "every one" as "everyone") ----------
export const T = {
  five: w("five"), passed: w("passed"), did: w("did"), nothing: w("nothing"), nothingE: e("nothing"),
  small: w("small"), reads: w("reads"), log1: w("log"), writes: w("writes"), job: e("job"), shipped: w("shipped"), passed2: w("passed", 2),
  production: w("production"), wrote: w("wrote"), nothing2E: e("nothing", 2), no1: w("no"), no2: w("no", 2), clean: w("clean"), exitE: e("exit"),
  looked: w("looked"), field: w("field"), role1: w("roll"), top: w("top"), real1: w("real"), keeps: w("keeps"), level: w("level"), inside: w("inside"),
  message: w("message"), matched: w("matched"), zero1: w("zero"), linesE: e("lines"),
  and2: w("and", 3), five2: w("five", 2), everyone: w("everyone"), made: w("made"), flat: w("flat"), expected: w("expected"), code3: w("code", 3),
  wrong: w("wrong"), agreed: w("agreed"), bugE: e("bug"),
  what: w("what"), real2: w("real", 2), run: w("run"), count: w("count"), zero2: w("zero", 2), zero2E: e("zero", 2),
  matters: w("matters"), feeds: w("feeds"), real3: w("real", 3), checks: w("checks"), exactly: w("exactly"), lands: w("lands"), landsE: e("lands"),
  write: w("write"), guess: w("guess"), forever: w("forever"), build: w("build"), input: w("input"), invent: e("invent"), END: VO.END,
};

// ---------- the layout ----------
const FLOOR = -1.72;
const MX = 0.5, MW = 2.4, MH = 3.4, MD = 1.8, MTOP = FLOOR + MH, MFRONT = MD / 2; // the machine, front face at z = 0.9
const SX = MX - 0.6; // the intake slot on its roof, left of where Blink sits
const TRAY_Y = FLOOR + 0.32, TRAY_Z = MFRONT + 0.75; // the tray at its foot, sticking out toward the camera
const BLINK_AT = V(MX + 0.64, MTOP + 0.88, -0.15), BLINK_S = 0.72; // Blink sits on the roof, watching the slot
const CARD = V(MX, 5.7, 1.2), CW = 2.0, CH = 1.55; // the big card the camera dives into
const TESTP = V(MX, 4.45, 0.9); // the real-input test panel (VI), over Blink

// ---------- the drops: a card falls into the slot, then slips in ----------
const HOOK_IN = [0, 1, 2, 3, 4].map((i) => 0.62 + i * 0.235); // the five fixtures land on "five tests passed"
const PROD_IN = [0, 1, 2, 3, 4, 5].map((i) => T.production - 0.25 + i * 0.42); // production traffic, all real logs
const READS_IN = T.log1 + 0.15, REAL_IN = T.run + 0.25, FIX_IN = T.lands - 0.95;

// ---------- the camera path: [time, position, target, fov] ----------
const RIG = [[MX, 2.2, 12.6], [MX, 0.85, 0.6], 36]; // the whole station: slot, machine, tray, Blink
const KEYS = [
  // the hook: the roof slot, the window and the five checks, close
  [0, [MX, 2.6, 10.6], [MX, 1.6, 0.6], 34],
  [T.did - 0.15, [MX, 2.5, 10.1], [MX, 1.5, 0.6], 34],
  // "did nothing": down to the counter and the empty tray
  [T.nothingE + 0.15, [0.6, 1.9, 7.9], [MX, -1.0, 1.5], 36],
  [T.small - 0.05, [0.6, 1.9, 7.8], [MX, -1.0, 1.5], 36],
  // the whole station: Blink on the roof, the machine, the tray
  [T.reads + 0.2, ...RIG],
  [T.shipped - 0.1, [MX, 2.15, 12.4], [MX, 0.85, 0.6], 36],
  // production: closer, the lamps and the tray
  [T.production + 0.6, [MX, 1.5, 8.6], [MX, 0.05, 1.0], 36],
  [T.clean + 0.6, [MX + 0.1, 1.3, 8.1], [MX, -0.1, 1.1], 36],
  [T.looked - 0.1, [MX + 0.1, 1.35, 8.0], [MX, -0.05, 1.1], 36],
  // the dive: up to the real log card (Blink's head just under it)
  [T.field + 0.35, [MX + 0.05, 5.65, 7.85], [MX, 5.6, CARD.z], 34],
  [T.inside - 0.1, [MX - 0.05, 5.6, 7.65], [MX, 5.55, CARD.z], 34],
  [T.and2 - 0.2, [MX, 5.55, 7.55], [MX, 5.55, CARD.z], 34],
  // the fixture card takes its place
  [T.expected + 0.4, [MX + 0.05, 5.6, 7.7], [MX, 5.6, CARD.z], 34],
  [T.code3 + 0.1, [MX + 0.1, 5.8, 8.4], [MX, 5.4, CARD.z], 34],
  // the mass moment: crane back and up over the field of made-up fixtures, looking down the whole way
  [T.wrong + 0.3, [0.5, 9.0, 12.5], [0.4, -0.6, -1.5], 38],
  [T.agreed - 0.4, [0.5, 15.5, 13.5], [0.4, -1.6, -4.5], 40],
  [T.bugE + 0.6, [0.6, 16.2, 14.0], [0.4, -1.6, -4.5], 40],
  // back down to the station for the one real log
  [T.real2 + 0.2, ...RIG],
  [T.count - 0.2, [MX, 2.15, 12.4], [MX, 0.85, 0.6], 36],
  // the counter
  [T.zero2 - 0.1, [0.6, 1.9, 7.9], [MX, -1.0, 1.5], 36],
  [T.zero2E + 0.5, [0.6, 1.9, 7.8], [MX, -1.0, 1.5], 36],
  // the test that matters: the panel over Blink, the machine under it
  [T.feeds + 0.1, [MX, 2.5, 13.2], [MX, 1.3, 0.6], 36],
  [T.exactly - 0.2, [MX, 2.45, 13.0], [MX, 1.3, 0.6], 36],
  // the line lands
  [T.landsE + 0.3, [0.55, 2.0, 7.7], [MX, -1.05, 1.6], 36],
  [T.write + 0.2, [0.55, 2.0, 7.6], [MX, -1.05, 1.6], 36],
  // pull back for the lesson, then rise to look down on the station for the end
  [T.forever + 0.4, ...RIG],
  [T.invent + 0.4, [MX, 2.2, 12.2], [MX, 1.1, 0.6], 36],
  [T.invent + 2.2, [MX - 0.1, 7.6, 9.4], [MX, -0.2, 0.5], 38],
  [T.END, [MX - 0.1, 7.8, 9.6], [MX, -0.2, 0.5], 38],
];
const cameraAt = cameraPath(KEYS);

// ---------- the field of made-up fixtures (the mass moment) ----------
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const FIELD = [], F0 = T.code3 - 0.2;
for (let gx = -15; gx <= 15; gx++) for (let gz = -18; gz <= 5; gz++) {
  const x = MX + gx * 1.05 + (hash(gx * 31 + gz) - 0.5) * 0.25, z = gz * 1.25 + (hash(gx + gz * 17) - 0.5) * 0.3;
  const d = Math.hypot(x - MX, z);
  if (d < 2.9) continue; // clear of the station
  FIELD.push({ x, z, d, at: F0 + d * 0.16 + hash(gx * 7 + gz * 13) * 0.25, yaw: (hash(gx * 3 + gz) - 0.5) * 0.35 });
}

export async function buildWorld(canvas) {
  // ---------- sound cues (times only; reported before any await so cues.mjs sees them) ----------
  const cue = (k, t, extra) => window.BP.CUES.push(Object.assign({ k, t: +t.toFixed(3) }, extra || {}));
  HOOK_IN.forEach((t) => { cue("tick", t); cue("blip", t + 0.03); });
  cue("whoosh", T.did - 0.2, { d: 0.9 });
  cue("whoosh", T.small - 0.1, { d: 1.2 }); cue("tick", READS_IN); cue("draw", T.writes, { d: 0.5 });
  cue("blip", T.passed2 + 0.1);
  cue("whoosh", T.production - 0.3, { d: 0.9 }); PROD_IN.forEach((t) => cue("tick", t));
  cue("thud", T.no1 + 0.05); cue("thud", T.no2 + 0.05); cue("ding", T.clean + 0.1);
  cue("whoosh", T.looked, { d: 1.0 }); cue("pop", T.field + 0.2);
  cue("slide", T.top - 0.05, { d: 0.4 }); cue("blip", T.top + 0.35);
  cue("draw", T.level, { d: 0.5 }); cue("blip", T.inside + 0.1); cue("strike", T.zero1);
  cue("slide", T.and2 - 0.1, { d: 0.5 }); cue("stamp", T.made + 0.05);
  cue("blip", T.flat + 0.1); cue("ding", T.expected + 0.2); cue("strike", T.wrong + 0.1);
  cue("riser", T.wrong - 0.6, { d: 0.9 }); cue("whoosh", T.code3 + 0.1, { d: 2.2 }); cue("draw", F0 + 0.4, { d: 2.6 });
  FIELD.forEach((f, i) => { if (i % 40 === 0) cue("blip", f.at); });
  cue("whoosh", T.agreed + 1.6, { d: 1.4 });
  cue("tick", REAL_IN); cue("draw", T.count, { d: 0.6 }); cue("stamp", T.zero2);
  cue("whoosh", T.zero2E + 0.5, { d: 1.0 }); cue("pop", T.matters - 0.05);
  const TEST = ["test: a real log in", "expect: exactly 1 line"], TCPS = 30;
  [...TEST[0]].forEach((ch, i) => ch.trim() && cue("type", T.matters + i / TCPS));
  [...TEST[1]].forEach((ch, i) => ch.trim() && cue("type", T.checks - 0.1 + i / TCPS));
  cue("tick", FIX_IN); cue("zip", T.lands - 0.2); cue("land", T.lands + 0.15); cue("ding", T.landsE + 0.05);
  cue("whoosh", T.forever + 0.2, { d: 1.2 }); cue("whoosh", T.invent + 0.5, { d: 1.6 }); cue("sting", T.invent + 1.25);

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

  // ---------- the machine ----------
  const mach = new THREE.Group(); scene.add(mach);
  const body = new THREE.Mesh(new RoundedBoxGeometry(MW, MH, MD, 4, 0.12), toon("#2c5d8f")); body.position.set(MX, FLOOR + MH / 2, 0); mach.add(body);
  const lip = new THREE.Mesh(new RoundedBoxGeometry(MW + 0.14, 0.16, MD + 0.14, 3, 0.05), toon("#4f93d6")); lip.position.set(MX, MTOP, 0); mach.add(lip);
  const slotM = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 0.22), new THREE.MeshBasicMaterial({ color: "#05070a" })); slotM.position.set(SX, MTOP + 0.06, 0); mach.add(slotM);
  // a front plate the panels sit on
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(MW - 0.3, MH - 0.5), new THREE.MeshBasicMaterial({ color: "#16273a" })); plate.position.set(MX, FLOOR + MH / 2 + 0.1, MFRONT + 0.005); mach.add(plate);
  const mono = (g, px, wt = 600) => { g.font = `${wt} ${px}px 'IBM Plex Mono', monospace`; g.textBaseline = "middle"; };
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

  // ---------- the tray and its counter ----------
  const tray = new THREE.Group(); scene.add(tray);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.16, 0.06), new THREE.MeshBasicMaterial({ color: "#05070a" })); mouth.position.set(MX, TRAY_Y + 0.12, MFRONT + 0.01); tray.add(mouth);
  const trayBase = new THREE.Mesh(new RoundedBoxGeometry(2.0, 0.1, 1.5, 3, 0.03), toon("#1f2a38")); trayBase.position.set(MX, TRAY_Y - 0.05, TRAY_Z); tray.add(trayBase);
  [-1, 1].forEach((sx) => { const s = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 1.5), toon("#d6a45a")); s.position.set(MX + sx * 0.97, TRAY_Y + 0.05, TRAY_Z); tray.add(s); });
  const lipF = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.34, 0.06), toon("#d6a45a")); lipF.position.set(MX, TRAY_Y + 0.02, TRAY_Z + 0.75); tray.add(lipF);
  const trayLabel = panel(1.2, 0.26, 300, (g, W, H) => { mono(g, 56); g.textAlign = "center"; g.fillStyle = "#d6a45a"; g.fillText("out.log", W / 2, H / 2 + 2); });
  trayLabel.set({}); trayLabel.mesh.rotation.x = -Math.PI / 2; trayLabel.mesh.position.set(MX, TRAY_Y + 0.006, TRAY_Z + 0.35); tray.add(trayLabel.mesh);
  // the counter, on a stand in front of the tray
  const counter = panel(1.7, 0.46, 400, (g, W, H, s) => {
    const col = s.c === "red" ? "#e0675a" : s.c === "green" ? "#6ad08a" : "#d6a45a";
    g.fillStyle = "#0c0e11"; rr(g, 4, 4, W - 8, H - 8, 30); g.fill(); g.strokeStyle = col; g.lineWidth = 9; rr(g, 6, 6, W - 12, H - 12, 28); g.stroke();
    mono(g, 60, 600); g.textAlign = "left"; g.fillStyle = "#9aa6b6"; g.fillText("lines out:", 56, H / 2 + 3);
    mono(g, 100, 700); g.textAlign = "right"; g.fillStyle = col; g.fillText(String(s.n), W - 64, H / 2 + 6);
  });
  counter.mesh.position.set(MX, MTOP - 2.6, MFRONT + 0.02); scene.add(counter.mesh);
  // the ghost of the line it should write, and the one real line in VI
  const ghost = panel(1.5, 0.2, 400, (g, W, H, s) => { g.setLineDash([26, 18]); g.strokeStyle = "#d6a45a"; g.lineWidth = 7; rr(g, 6, 6, W - 12, H - 12, 18); g.stroke(); g.setLineDash([]); mono(g, 40, 500); g.textAlign = "center"; g.fillStyle = "#d6a45a"; g.fillText("1 line per job", W / 2, H / 2 + 2); });
  ghost.set({}); ghost.mesh.rotation.x = -Math.PI / 2; ghost.mesh.position.set(MX, TRAY_Y + 0.02, TRAY_Z - 0.2); scene.add(ghost.mesh);
  const lineOut = panel(1.5, 0.2, 400, (g, W, H) => { g.fillStyle = "#d6a45a"; rr(g, 4, 4, W - 8, H - 8, 16); g.fill(); mono(g, 40, 600); g.textAlign = "left"; g.fillStyle = "#1b1408"; g.fillText('{"job": 1, "tokens": ...}', 26, H / 2 + 2); });
  lineOut.set({}); lineOut.mesh.rotation.x = -Math.PI / 2; scene.add(lineOut.mesh);
  const amberGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glyphTexture(THREE, (g, W) => { const gr = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); gr.addColorStop(0, "rgba(255,210,140,0.8)"); gr.addColorStop(1, "rgba(214,164,90,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, W); }, 128, 128), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  amberGlow.scale.set(2.6, 1.2, 1); amberGlow.position.set(MX, TRAY_Y + 0.15, TRAY_Z - 0.2); scene.add(amberGlow);

  // ---------- the cards: a made-up fixture (flat) and a real log line (role one level down, inside message) ----------
  const FIXL = ['{"role": "user",', ' "content": "..."}'];
  const REALL = ['{"type": "user",', ' "message": {', '   "role": "user",', '   "content": "..."}}'];
  const drawCard = (g, W, H, real, s = {}) => {
    const sc = W / 800;
    g.fillStyle = "#eef2f6"; rr(g, 4, 4, W - 8, H - 8, 30 * sc); g.fill();
    g.fillStyle = real ? "#d6a45a" : "#7b8593"; rr(g, 4, 4, W - 8, 92 * sc, [30 * sc, 30 * sc, 0, 0]); g.fill();
    mono(g, 46 * sc, 700); g.textAlign = "left"; g.fillStyle = real ? "#1b1408" : "#ffffff"; g.fillText(real ? "real log" : "fixture", 40 * sc, 50 * sc);
    const lines = real ? REALL : FIXL, y0 = (real ? 180 : 230) * sc, lh = 120 * sc;
    // highlights behind the text: the top level (where the code looks), the nested role
    const band = (row, col, a, x0 = 26) => { if (!a) return; g.globalAlpha = a; g.fillStyle = col; rr(g, x0 * sc, y0 + row * lh - 52 * sc, W - (x0 + 26) * sc, 104 * sc, 22 * sc); g.fill(); g.globalAlpha = 1; };
    if (real) { band(0, s.topRed ? "#f6c9c3" : "#cfe2f6", s.top || 0); band(1, "#f3e1c1", s.msg || 0, 60); band(2, "#cdeed8", s.nest || 0, 110); }
    else { band(0, s.wrong ? "#f6c9c3" : "#cfe2f6", s.top || 0); }
    mono(g, 52 * sc, 500); g.fillStyle = "#1b212d";
    lines.forEach((ln, i) => g.fillText(ln, 52 * sc, y0 + i * lh + 2 * sc));
    if (real && s.nullTag) { // "role: null" where the code looked
      g.globalAlpha = s.nullTag; mono(g, 44 * sc, 700); g.textAlign = "right"; g.fillStyle = "#8f2a1e"; g.fillText("role: null", W - 40 * sc, 50 * sc); g.globalAlpha = 1; g.textAlign = "left";
    }
    if (!real && s.check) { // the green check it got
      const cx = W - 96 * sc, cy = 50 * sc; g.beginPath(); g.arc(cx, cy, 34 * sc, 0, Math.PI * 2); g.fillStyle = "#6ad08a"; g.fill();
      g.strokeStyle = "#0d1117"; g.lineWidth = 9 * sc; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); g.moveTo(cx - 15 * sc, cy + 1 * sc); g.lineTo(cx - 4 * sc, cy + 13 * sc); g.lineTo(cx + 17 * sc, cy - 12 * sc); g.stroke();
    }
    if (!real && s.stamp) { // "made up", stamped across it
      g.save(); g.globalAlpha = s.stamp; g.translate(W * 0.66, H * 0.8); g.rotate(-0.16); g.strokeStyle = "#e0675a"; g.lineWidth = 10 * sc; rr(g, -190 * sc, -58 * sc, 380 * sc, 116 * sc, 16 * sc); g.stroke();
      mono(g, 70 * sc, 700); g.textAlign = "center"; g.fillStyle = "#e0675a"; g.fillText("MADE UP", 0, 4 * sc); g.restore();
    }
  };
  // small dropping cards
  const CARD_S = [1.0, 0.78];
  const smallTex = { fix: glyphTexture(THREE, (g, W, H) => drawCard(g, W, H, false, { check: 1 }), 400, 310), real: glyphTexture(THREE, (g, W, H) => drawCard(g, W, H, true), 400, 310) };
  const SMALL = new THREE.PlaneGeometry(CARD_S[0], CARD_S[1]);
  const smallMesh = (kind) => { const m = new THREE.Mesh(SMALL, new THREE.MeshBasicMaterial({ map: smallTex[kind], transparent: true, side: THREE.DoubleSide })); scene.add(m); return m; };
  const hookCards = HOOK_IN.map(() => smallMesh("fix"));
  const readsCard = smallMesh("real"), prodCards = PROD_IN.map(() => smallMesh("real")), realCard = smallMesh("real"), realCard2 = smallMesh("real");
  // a card falls from above for FALL seconds, then slips into the slot in 0.22 s (sunk = 1 when it is gone)
  const FALL = 0.55;
  const dropPose = (m, tIn, t, jx = 0) => {
    const k = (t - (tIn - FALL)) / FALL;
    m.scale.setScalar(1); m.rotation.set(0, 0, 0); m.material.opacity = 1;
    if (k < 0 || t > tIn + 0.24) { m.visible = false; return; }
    m.visible = true;
    const yIn = MTOP + 0.06 + CARD_S[1] / 2;
    if (t < tIn) { const f = k * k; m.position.set(SX + jx * (1 - f), mix(yIn + 3.6, yIn, f), 0.02); m.rotation.z = jx * 0.3 * (1 - f); return; }
    const s = cl((t - tIn) / 0.22); // sink: the bottom edge stays on the slot, the card shortens into it
    m.position.set(SX, MTOP + 0.06 + (1 - s) * CARD_S[1] / 2, 0.02); m.scale.set(1, Math.max(0.01, 1 - s), 1);
  };

  // ---------- the big cards the camera dives into, and the selector chip over them ----------
  const bigReal = panel(CW, CH, 400, (g, W, H, s) => drawCard(g, W, H, true, s));
  const bigFix = panel(CW, CH, 400, (g, W, H, s) => drawCard(g, W, H, false, s));
  [bigReal, bigFix].forEach((p) => { p.mesh.position.copy(CARD); scene.add(p.mesh); });
  const chip = panel(2.0, 0.36, 400, (g, W, H, s) => {
    const col = s.red ? "#e0675a" : "#4f93d6";
    g.fillStyle = "#0c0e11"; rr(g, 4, 4, W - 8, H - 8, H / 2); g.fill(); g.strokeStyle = col; g.lineWidth = 8; rr(g, 6, 6, W - 12, H - 12, H / 2 - 4); g.stroke();
    mono(g, 50); g.textAlign = "left"; g.fillStyle = "#9aa6b6"; g.fillText("code:", 44, H / 2 + 3);
    g.fillStyle = "#eef2f6"; g.fillText('.role == "user"', 44 + g.measureText("code: ").width, H / 2 + 3);
  });
  chip.set({}); chip.mesh.position.set(CARD.x, CARD.y + CH / 2 + 0.3, CARD.z + 0.02); scene.add(chip.mesh);
  const verdict = panel(1.7, 0.32, 400, (g, W, H, s) => { mono(g, 60, 700); g.textAlign = "center"; g.fillStyle = s.col; g.fillText(s.text, W / 2, H / 2 + 3); });
  verdict.mesh.position.set(CARD.x, CARD.y - CH / 2 - 0.3, CARD.z + 0.02); scene.add(verdict.mesh);
  // the arrow from where the code looked down to where role really is
  const arrowMat = new THREE.MeshBasicMaterial({ color: "#6ad08a", transparent: true, depthWrite: false });
  let arrow = null;

  // ---------- the field ----------
  const fieldTex = glyphTexture(THREE, (g, W, H) => drawCard(g, W, H, false, { check: 1 }), 256, 198);
  const field = new THREE.InstancedMesh(new THREE.PlaneGeometry(CARD_S[0] * 0.8, CARD_S[1] * 0.8), new THREE.MeshBasicMaterial({ map: fieldTex, side: THREE.DoubleSide }), FIELD.length);
  field.frustumCulled = false; scene.add(field);
  const greenGlow = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ map: glyphTexture(THREE, (g, W) => { const gr = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); gr.addColorStop(0, "rgba(140,255,170,0.9)"); gr.addColorStop(1, "rgba(106,208,138,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, W); }, 64, 64), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }), FIELD.length);
  greenGlow.frustumCulled = false; scene.add(greenGlow);
  // the empty log, called out over the machine for the crane shot
  const empty = panel(5.6, 1.0, 200, (g, W, H) => {
    g.fillStyle = "rgba(12,14,17,0.92)"; rr(g, 6, 6, W - 12, H - 12, 40); g.fill(); g.strokeStyle = "#e0675a"; g.lineWidth = 12; rr(g, 8, 8, W - 16, H - 16, 36); g.stroke();
    mono(g, 96, 700); g.textAlign = "left"; const a = "out.log: ", b = "0 lines", wa = g.measureText(a).width, x0 = (W - wa - g.measureText(b).width) / 2;
    g.fillStyle = "#eef2f6"; g.fillText(a, x0, H / 2 + 4); g.fillStyle = "#e0675a"; g.fillText(b, x0 + wa, H / 2 + 4);
  });
  empty.set({}); scene.add(empty.mesh);

  // ---------- the real-input test (VI), over Blink ----------
  const testP = panel(2.9, 1.0, 400, (g, W, H, s) => {
    g.fillStyle = "#0c0e11"; rr(g, 4, 4, W - 8, H - 8, 30); g.fill(); g.strokeStyle = s.ok ? "#6ad08a" : "#d6a45a"; g.lineWidth = 9; rr(g, 6, 6, W - 12, H - 12, 28); g.stroke();
    mono(g, 62, 500); g.textAlign = "left";
    s.l.forEach((ln, i) => { const y = 112 + i * 172; const at = ln.indexOf(":"); g.fillStyle = "#9aa6b6"; g.fillText(ln.slice(0, at + 1), 48, y); g.fillStyle = "#eef2f6"; g.fillText(ln.slice(at + 1), 48 + g.measureText(ln.slice(0, at + 1)).width, y); });
    if (s.ok) { const cx = W - 70, cy = 70; g.beginPath(); g.arc(cx, cy, 36, 0, Math.PI * 2); g.fillStyle = "#6ad08a"; g.fill(); g.strokeStyle = "#0d1117"; g.lineWidth = 10; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); g.moveTo(cx - 16, cy + 1); g.lineTo(cx - 4, cy + 14); g.lineTo(cx + 18, cy - 13); g.stroke(); }
  });
  testP.mesh.position.copy(TESTP); scene.add(testP.mesh);

  // ---------- the frame at time t ----------
  const dummy = new THREE.Object3D();
  function render(t) {
    cameraAt(t, cam);
    const bob = 0.05 * Math.sin((t / 1.7) * Math.PI * 2);
    let happy = 0, blinkK = 0, look = 0, lookY = 0, think = 0, skew = 0, eager = 0, tilt = 0, lean = 0, hop = 0, yaw = 0.35 + 0.1 * Math.sin((t / 3.1) * Math.PI * 2);

    // the cards falling into the slot (set every frame: frames render in any order)
    HOOK_IN.forEach((tIn, i) => dropPose(hookCards[i], tIn, t, (i % 2 ? 1 : -1) * 0.25));
    dropPose(readsCard, READS_IN, t, -0.2);
    PROD_IN.forEach((tIn, i) => dropPose(prodCards[i], tIn, t, (i % 2 ? -1 : 1) * 0.3));
    dropPose(realCard, REAL_IN, t, 0.15); realCard.visible = realCard.visible && t > T.what; // only once the camera is back down
    dropPose(realCard2, FIX_IN, t, -0.15);

    // the five checks light as the fixtures go in, and pulse again on "passed every test"
    const nLit = HOOK_IN.filter((x) => t >= x + 0.05).length;
    tests.set({ n: nLit });
    tests.mesh.scale.setScalar(1 + 0.05 * Math.max(pulse(t, T.passed2 + 0.15, 0.2), pulse(t, HOOK_IN[4] + 0.1, 0.15)));
    // the selector: fixed to .message.role just before the test that matters
    const fixed = t >= T.matters - 0.3;
    sel.set({ text: fixed ? typed('.message.role == "user"', T.matters - 0.3, 40, t) || "." : '.role == "user"', red: !fixed && t > T.zero1 - 0.05 && t < T.and2 });
    sel.mesh.scale.setScalar(1 + 0.08 * pulse(t, T.matters, 0.25));
    // lamps: error and warning stay dark (a little nudge on each "no"), exit 0 lights on "clean exit"
    const ex = r01(t, T.clean + 0.05, 0.2);
    lamps.set({ exit: Math.round(ex * 6) / 6 });
    lamps.mesh.scale.setScalar(1 + 0.04 * Math.max(pulse(t, T.no1 + 0.1, 0.2), pulse(t, T.no2 + 0.1, 0.2)));
    lampGlow.material.opacity = ex * (1 - r01(t, T.looked + 0.4, 0.4)) * (0.8 + 0.2 * Math.sin(t * 6)); lampGlow.visible = lampGlow.material.opacity > 0.01;

    // the ghost of the line it should write
    const gA = r01(t, T.writes - 0.1, 0.3) * (1 - r01(t, T.wrote, 0.5)) * (0.65 + 0.35 * Math.sin(t * 7));
    ghost.mesh.visible = gA > 0.01; ghost.mesh.material.opacity = gA;
    // the one line that lands (VI): out of the mouth and across the tray
    const lk = io(r01(t, T.lands - 0.2, 0.5));
    lineOut.mesh.visible = t >= T.lands - 0.2;
    lineOut.mesh.position.set(MX, TRAY_Y + 0.03, mix(MFRONT + 0.05, TRAY_Z - 0.2, lk)); lineOut.mesh.scale.set(1, Math.max(0.01, mix(0.2, 1, lk)), 1);
    amberGlow.material.opacity = 0.9 * pulse(t, T.landsE + 0.1, 0.6) + 0.25 * r01(t, T.landsE, 0.5); amberGlow.visible = t > T.lands;
    // the counter: 0 the whole film, red when it is read out, 1 and green when the line lands
    const cn = t >= T.lands + 0.15 ? 1 : 0, cc = cn ? "green" : (t > T.nothing - 0.05 && t < T.small) || (t > T.zero2 - 0.05 && t < T.matters) ? "red" : "amber";
    counter.set({ n: cn, c: cc });
    counter.mesh.scale.setScalar(1 + 0.18 * Math.max(pulse(t, T.zero2 + 0.05, 0.2), pulse(t, T.lands + 0.2, 0.2), pulse(t, T.nothing + 0.05, 0.18)) + 0.06 * pulse(t, T.count + 0.3, 0.3));

    // the dive: the big real card, its highlights, the chip and the verdict
    const rA = r01(t, T.field - 0.1, 0.3) * (1 - r01(t, T.and2 - 0.15, 0.3));
    bigReal.mesh.visible = rA > 0.01; bigReal.mesh.material.opacity = rA;
    bigReal.mesh.position.set(CARD.x - 2.4 * io(r01(t, T.and2 - 0.15, 0.4)), CARD.y, CARD.z); bigReal.mesh.scale.setScalar(mix(0.85, 1, back(r01(t, T.field - 0.1, 0.35))));
    const q = (x) => Math.round(x * 8) / 8; // canvas redraws in eighths: smooth enough, no redraw every frame
    bigReal.set({ top: q(r01(t, T.top - 0.05, 0.25)), topRed: t > T.zero1 - 0.05, nullTag: q(r01(t, T.real1 - 0.2, 0.25)), msg: q(r01(t, T.inside, 0.25) * 0.9), nest: q(r01(t, T.level, 0.3)) });
    const fA = r01(t, T.and2 - 0.05, 0.3) * (1 - r01(t, T.code3 + 0.3, 0.4));
    bigFix.mesh.visible = fA > 0.01; bigFix.mesh.material.opacity = fA;
    bigFix.mesh.position.set(CARD.x + 2.4 * (1 - io(r01(t, T.and2 - 0.05, 0.4))), CARD.y, CARD.z); bigFix.mesh.scale.setScalar(1 + 0.04 * pulse(t, T.made + 0.1, 0.15));
    bigFix.set({ check: 1, stamp: q(r01(t, T.made, 0.15)), top: q(r01(t, T.flat - 0.1, 0.25)), wrong: t > T.wrong });
    const chA = r01(t, T.field + 0.15, 0.3) * (1 - r01(t, T.code3 + 0.3, 0.4));
    chip.mesh.visible = chA > 0.01; chip.mesh.material.opacity = chA; chip.set({ red: (t > T.zero1 - 0.05 && t < T.and2) || t > T.wrong });
    chip.mesh.scale.setScalar(1 + 0.08 * Math.max(pulse(t, T.role1 + 0.1, 0.2), pulse(t, T.expected + 0.15, 0.2)));
    const vText = t < T.and2 ? "matched: 0 lines" : t < T.wrong ? "tests: 5/5 pass" : "same guess, both";
    const vCol = t < T.and2 ? "#e0675a" : t < T.wrong ? "#6ad08a" : "#e0675a";
    const vA = (t < T.and2 ? r01(t, T.zero1 - 0.1, 0.2) * (1 - r01(t, T.and2 - 0.2, 0.2)) : r01(t, T.expected + 0.05, 0.2)) * (1 - r01(t, T.code3 + 0.3, 0.4));
    verdict.set({ text: vText, col: vCol }); verdict.mesh.visible = vA > 0.01; verdict.mesh.material.opacity = vA;
    verdict.mesh.scale.setScalar(1 + 0.1 * Math.max(pulse(t, T.zero1 + 0.05, 0.18), pulse(t, T.wrong + 0.1, 0.18)));
    // the arrow down from the top level to the nested role
    if (arrow) { scene.remove(arrow); arrow.geometry.dispose(); arrow = null; }
    const ar = r01(t, T.level - 0.1, 0.4) * (t < T.and2 - 0.15 ? 1 : 0);
    if (ar > 0.01) {
      const yRow = (row) => CARD.y + CH / 2 - (180 + row * 120) / 400; // canvas rows at 400 px per unit
      const a = V(CARD.x + 0.84, yRow(0) - 0.06, CARD.z + 0.03), b = V(CARD.x + 0.84, yRow(2) + 0.02, CARD.z + 0.03), mid = V(CARD.x + 0.98, (a.y + b.y) / 2, CARD.z + 0.03);
      const pts = new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(30).slice(0, Math.max(2, Math.ceil(31 * ar)));
      arrow = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.018, 6), arrowMat); scene.add(arrow);
    }
    arrowMat.opacity = 1 - r01(t, T.and2 - 0.4, 0.25);

    // the field: made-up fixtures pop up from the floor in a ring spreading out from the machine, each with its check
    const fOut = io(r01(t, T.real2 - 0.9, 0.7));
    FIELD.forEach((f, i) => {
      const k = back(r01(t, f.at, 0.35)), s = Math.max(0, k) * (1 - fOut);
      if (s <= 0.001) { dummy.position.set(0, -50, 0); dummy.scale.setScalar(0); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); field.setMatrixAt(i, dummy.matrix); greenGlow.setMatrixAt(i, dummy.matrix); return; }
      const h = CARD_S[1] * 0.8;
      dummy.position.set(f.x, FLOOR + h / 2 * s + 0.02, f.z); dummy.rotation.set(-0.25, f.yaw, 0); dummy.scale.set(1, s, 1); dummy.updateMatrix(); field.setMatrixAt(i, dummy.matrix);
      const gl = pulse(t, f.at + 0.3, 0.3) * (1 - fOut);
      dummy.position.set(f.x + 0.3, FLOOR + h * 0.9, f.z + 0.05); dummy.rotation.set(-0.25, f.yaw, 0); dummy.scale.setScalar(Math.max(0.0001, gl)); dummy.updateMatrix(); greenGlow.setMatrixAt(i, dummy.matrix);
    });
    field.instanceMatrix.needsUpdate = true; greenGlow.instanceMatrix.needsUpdate = true;
    // the empty log called out over the machine while the camera is high
    const eA = r01(t, T.wrong + 0.6, 0.4) * (1 - r01(t, T.real2 - 1.0, 0.4));
    empty.mesh.visible = eA > 0.01; empty.mesh.material.opacity = eA;
    empty.mesh.position.set(MX, MTOP + 3.5, 0.4); empty.mesh.quaternion.copy(cam.quaternion); empty.mesh.scale.setScalar(mix(0.8, 1, back(r01(t, T.wrong + 0.6, 0.4))));

    // the test that matters
    const tA = r01(t, T.matters - 0.1, 0.25) * (1 - r01(t, T.write - 0.1, 0.4));
    testP.mesh.visible = tA > 0.01; testP.mesh.material.opacity = tA; testP.mesh.scale.setScalar(mix(0.85, 1, back(r01(t, T.matters - 0.1, 0.3))) * (1 + 0.06 * pulse(t, T.landsE + 0.15, 0.2)));
    testP.set({ l: [typed(TEST[0], T.matters, TCPS, t), typed(TEST[1], T.checks - 0.1, TCPS, t)], ok: t >= T.landsE + 0.05 });

    // Blink: by the tray, turned toward the machine
    blinkK = Math.max(pulse(t, 2.2, 0.07), pulse(t, T.shipped - 0.3, 0.07), pulse(t, T.what - 0.3, 0.07), pulse(t, T.write + 1.4, 0.07), pulse(t, T.invent + 2.6, 0.07));
    yaw = -0.3 + 0.08 * Math.sin((t / 3.1) * Math.PI * 2); // turned toward the slot
    if (t < T.did) { look = -0.9; lookY = -0.2; happy = 0.6 * r01(t, T.passed, 0.2) * (1 - r01(t, T.did - 0.2, 0.15)); }
    else if (t < T.small) { look = -0.2; lookY = -1.2; eager = 0.5 * r01(t, T.nothing, 0.12); lean = 0.15 * r01(t, T.nothing, 0.2); }
    else if (t < T.production) { look = t < T.writes ? -0.9 : -0.2; lookY = t < T.writes ? -0.2 : -1.2; happy = 0.5 * r01(t, T.passed2, 0.15) * (1 - r01(t, T.production - 0.3, 0.15)); }
    else if (t < T.clean) { look = -0.8; lookY = t < T.wrote ? -0.3 : -1.2; lean = 0.12 * r01(t, T.wrote, 0.3); tilt = 0.12 * r01(t, T.wrote, 0.3); }
    else if (t < T.looked) { look = 0; lookY = 0; skew = 0.7 * r01(t, T.clean + 0.2, 0.2); tilt = 0.15; }
    else if (t < T.zero1) { look = -0.2; lookY = 1.2; think = r01(t, T.looked + 0.1, 0.12) * (1 - r01(t, T.inside, 0.12)); }
    else if (t < T.what) { look = -0.2; lookY = 1.0; skew = 0.7 * r01(t, T.agreed - 0.1, 0.2); }
    else if (t < T.zero2) { look = t < T.run ? -0.9 : -0.2; lookY = t < T.run ? -0.2 : -1.2; }
    else if (t < T.matters) { look = -0.2; lookY = -1.2; tilt = -0.14 * r01(t, T.zero2, 0.2); lean = 0.12; }
    else if (t < T.lands) { look = t < T.feeds + 0.3 ? 0 : -0.9; lookY = t < T.feeds + 0.3 ? 1.3 : -0.2; }
    else if (t < T.write + 1.0) {
      eager = r01(t, T.lands + 0.1, 0.12) * (1 - r01(t, T.write + 0.5, 0.3)); look = -0.2; lookY = -1.2;
      hop = 0.08 * eager * Math.abs(Math.sin(Math.PI * 3 * (t - T.lands)));
    }
    else { happy = r01(t, T.write + 1.0, 0.15) * 0.9; look = 0; lookY = 0.3; yaw = -0.1 + 0.06 * Math.sin((t / 3.1) * Math.PI * 2); }
    rig.position.set(BLINK_AT.x, BLINK_AT.y + bob + hop, BLINK_AT.z); rig.scale.setScalar(BLINK_S);
    shadow.material.opacity = 0.4 - bob; shadow.scale.setScalar((1 - bob) * BLINK_S * 0.75);
    blink.root.rotation.set(lean, yaw, tilt);
    blink.face({ blink: blinkK, happy, look, lookY, think, skew, eager, phase: t * 1.6 });
    renderer.render(scene, cam);
  }
  return render;
}

// devweb ep 3, draft 3 (script v5): "You'd never trust a user ID sent from a browser form. So why trust the one your AI
// typed?" One Three.js world, one continuous camera, stacked for portrait: Blink at the bottom fills in a tool's input
// form; the server (a blue machine with a stamp and a "logged in" badge) sits above it; behind and above both stands the
// wall of user drawers; in front of the wall, a notice board for the real stakes (Asana's AI connector, 2025).
// The hook shows the web habit (the server ignores the browser's user ID and stamps the login). Then the AI version of
// the mistake: the tool copies the API's user_id, the prompt names the user, the model fills it in, and a wrong guess
// or a hostile note sends the save to someone else's drawer. The fix: no user ID box; the server stamps the login and a
// planted note bounces off. Mass moment at the close: a crowd of logged-in Blinks, each save filed by its own login.
// Everything is a pure function of film time t.
import * as THREE from "three";
import { makeBlink, glyphTexture } from "./kit/blink3d.js";
import { cl, io, back, r01, mix, V, pulse, typed, cameraPath, panel, rr, stage } from "./kit/world.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const VO = window.VO, G = window.BLINK;
const w = (x, n) => VO.w(x, n), e = (x, n) => VO.e(x, n);

// ---------- the beats, all on Chris's words (a few snapped to the voice's onsets, noted) ----------
export const T = {
  never: w("never"), browser: w("browser"), form: w("form"), so: w("so"), typed: 6.05, // whisper wrote "-typed"; the word lands about 6.05
  easy: w("easy"), give: w("give"), copy: w("copy"), api: w("api"), takes: w("takes"), tell: w("tell"), prompt: w("prompt"), then: w("then"), fills: w("fills"),
  but: w("but"), writes: w("writes"), wrong: w("wrong"), hostile: w("hostile"), saves: w("saves"), account: w("account"),
  getting: w("getting"), y2025: 29.92, asana: 31.2, pulled: w("pulled"), two: w("two"), aBug: w("a", 5), to2: w("to", 2), // "2025" and "Asana" from onsets
  fix: w("fix"), web: w("web"), server: w("server"), login: w("login"), never2: w("never", 2), tool4: w("tool", 4), box: w("box"),
  one5: w("one", 5), six: w("six"), fields: w("fields"), all: w("all"), conv: w("conversation"), isnt: w("isn't"), them: e("them"),
  treat: w("treat"), never3: 58.53, END: VO.END, // "Never trust" follows a silence 58.2-58.5
};

// ---------- the layout ----------
const FLOOR = -1.72;
const FORM_DESK = V(0, 2.45, 0.3), CARD_M = V(0, 5.75, 0.3), BOARD = V(0, 11.2, -2.6);
const API_AT = V(0, 2.5, 0.65), NOTE_AT = V(-0.85, 0.95, 1.0), BAD_AT = V(0.85, 1.0, 1.0); // the API card pops in front of the form; notes beside Blink, inside the frame
const COLS = 9, ROWS = 21, CW = 1.0, CH = 0.72, WALL_Z = -4.0, FRONT_Z = WALL_Z + 0.3;
const cellPos = (c, r) => V(-4 + c * CW, FLOOR + CH / 2 + r * CH, WALL_Z);
const C7 = { c: 3, r: 14 }, C9 = { c: 5, r: 14 };
const P7 = cellPos(C7.c, C7.r), P9 = cellPos(C9.c, C9.r);
const slot = (p) => V(p.x, p.y + 0.26, FRONT_Z + 0.67); // a card standing just in front of a drawer's face (0.12 clear: no z-fight)
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const special = (c, r) => (c === C7.c && r === C7.r) || (c === C9.c && r === C9.r);

// ---------- the camera path: [time, position, target, fov] ----------
const SRV = [[0.15, 5.95, 9.8], [0, 5.85, 0.3]], SRV2 = [[0.1, 5.9, 10.1], [0, 5.85, 0.3]];
const DESK = [[0.25, 1.2, 10.4], [0, 0.95, 0]], DESK2 = [[0.1, 1.15, 9.9], [0, 1.0, 0]];
const KEYS = [
  // the hook: the browser form at the server
  [0, ...SRV, 34],
  [T.so - 0.1, ...SRV2, 34],
  // down to Blink and the AI's tool form
  [T.so + 0.85, ...DESK, 36],
  [T.saves - 0.2, ...DESK2, 36],
  // ride up with the save past the server to someone else's drawer
  [T.saves + 0.7, [0.8, 5.6, 13.5], [0.7, 6.2, -1.5], 36],
  [T.account + 0.15, [0.6, 9.0, 5.4], [0.4, 8.75, -3.75], 36],
  [T.getting + 0.2, [0.55, 8.95, 5.7], [0.4, 8.75, -3.75], 36],
  // the notice board
  [T.y2025 - 0.6, [0, 11.25, 6.2], [0, 11.2, -2.6], 36],
  [T.fix - 0.1, [0, 11.2, 6.6], [0, 11.2, -2.6], 36],
  // the server: the web's rule, then the tool with no user ID box
  [T.fix + 0.7, ...SRV, 34],
  [T.one5 - 0.4, ...SRV2, 34],
  // the schema
  [T.one5 + 0.5, [0, 6.25, 9.6], [0, 6.25, 1.0], 36],
  [T.treat - 0.35, [0, 6.2, 9.3], [0, 6.2, 1.0], 36],
  // the close: the whole world, every save filed by its own login
  [T.treat + 1.4, [0, 7.3, 22.5], [0, 6.9, -2], 40],
  [T.END, [0, 7.4, 24], [0, 6.9, -2], 40],
];
const cameraAt = cameraPath(KEYS);

// ---------- the stamp: every slam it makes ----------
const STAMPS = [T.form, T.login];

// ---------- the crowd and the stream (the close) ----------
const CROWD = [-4.2, -3.0, -1.8, 1.8, 3.0, 4.2].map((x, i) => ({ x, z: -1.1 - 0.25 * (i % 2), s0: T.treat + 0.1 + 0.07 * i }));
const SRC = CROWD.map((c) => V(c.x, 1.3, c.z + 0.3));
const STREAM = [];
{
  const cells = [];
  for (let r = 1; r < ROWS - 1; r++) for (let c = 0; c < COLS; c++) if (!special(c, r)) cells.push([c, r]);
  const N = 40;
  for (let j = 0; j < N; j++) {
    const s = T.treat + 0.25 + j * 0.05 + hash(j + 41) * 0.03;
    const [c, r] = cells[Math.floor(hash(j + 7) * cells.length)];
    STREAM.push({ s, src: SRC[j % CROWD.length], c, r, at: s + 0.6, out: s + 0.75, land: s + 1.45, jx: (hash(j + 3) - 0.5) * 0.5, jy: (hash(j + 5) - 0.5) * 0.3 });
  }
  STREAM.forEach((f, j) => { for (let k = 0; k < j; k++) if (STREAM[k].c === f.c && STREAM[k].r === f.r) { f.c = (f.c + 3) % COLS; if (special(f.c, f.r)) f.r = Math.min(ROWS - 2, f.r + 1); } });
}

export async function buildWorld(canvas) {
  // ---------- sound cues (times only; reported before any await so cues.mjs sees them) ----------
  const cue = (k, t, extra) => window.BP.CUES.push(Object.assign({ k, t: +t.toFixed(3) }, extra || {}));
  const TXT = "call Sam", U7 = "user_7", NEWS1 = "a bug could expose data", NEWS2 = "to other organizations.";
  cue("pop", 0.05); cue("blip", T.never); cue("strike", T.browser); cue("stamp", T.form);
  cue("whoosh", T.so - 0.05, { d: 0.9 }); [...U7].forEach((ch, i) => cue("type", T.typed - 0.3 + i / 20));
  cue("zipdown", T.easy); cue("pop", T.give); cue("pop", T.copy); cue("slide", T.api + 0.1, { d: 0.45 }); cue("tick", T.api + 0.55); cue("blip", T.takes);
  cue("pop", T.tell); cue("slide", T.tell + 0.1, { d: 0.5 });
  [...TXT].forEach((ch, i) => ch.trim() && cue("type", T.then + i / 18)); [...U7].forEach((ch, i) => cue("type", T.fills + i / 18));
  cue("blip", T.writes); cue("blip", T.wrong); cue("type", T.wrong + 0.05); cue("pop", T.hostile); cue("swipe", T.hostile + 0.4);
  cue("whoosh", T.saves - 0.05, { d: 1.4 }); cue("tick", T.saves + 0.5); cue("slide", T.saves + 0.9, { d: 0.45 }); cue("thud", T.account);
  cue("whoosh", T.getting, { d: 1.4 }); cue("pop", T.y2025); cue("pop", T.asana); cue("slide", T.pulled, { d: 0.4 });
  for (let i = 0; i < 13; i++) { cue("tick", T.pulled + 0.1 + i * 0.03); if (i % 2 === 0) cue("strike", T.two - 0.1 + i * 0.07); }
  [[NEWS1, T.aBug], [NEWS2, T.to2 - 0.2]].forEach(([s, t0]) => [...s].forEach((ch, i) => ch.trim() && cue("type", t0 + i / 40)));
  cue("whoosh", T.fix - 0.1, { d: 0.9 }); cue("pop", T.fix + 0.05); cue("pop", T.server - 0.2); cue("ding", T.login - 0.1); cue("stamp", T.login);
  cue("whoosh", T.tool4, { d: 0.8 }); cue("thud", T.box); cue("swipe", T.box + 0.08); cue("whoosh", T.box + 0.3, { d: 0.6 });
  cue("whoosh", T.one5 - 0.2, { d: 0.85 }); cue("slide", T.one5, { d: 0.45 });
  [0, 1, 2, 3, 4, 5].forEach((i) => { cue("tick", T.six + i * 0.12); cue("pop", T.all + i * 0.06); });
  cue("blip", T.conv); cue("strike", T.isnt); cue("zipdown", T.them);
  cue("whoosh", T.treat - 0.2, { d: 1.6 }); CROWD.forEach((c) => cue("pop", c.s0));
  STREAM.forEach((f, j) => { if (j % 3 === 0) cue("tick", f.at); if (j % 4 === 1) cue("land", f.land); });

  await document.fonts.ready;
  const { renderer, scene, cam, ramp, toon } = stage(canvas, { fog: [26, 110] });
  const at = (m, x, y, z) => { m.position.set(x, y, z); return m; };

  // ---------- Blink and the crowd ----------
  const rig = new THREE.Group(); scene.add(rig);
  const blink = makeBlink(THREE, G, ramp); rig.add(blink.root);
  const shadowMat = new THREE.MeshBasicMaterial({ color: "#000", transparent: true, opacity: 0.45, depthWrite: false });
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 48), shadowMat);
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.7; scene.add(shadow);
  const crowd = CROWD.map((c) => {
    const b = makeBlink(THREE, G, ramp, { seg: [44, 32], outline: false }); const g = new THREE.Group(); g.add(b.root); g.position.set(c.x, 0, c.z); scene.add(g);
    const sh = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ color: "#000", transparent: true, opacity: 0.35, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.set(c.x, -1.7, c.z); scene.add(sh);
    return { ...c, g, b, sh };
  });

  // ---------- the wall of user drawers ----------
  const WALL_H = ROWS * CH, WALL_YC = FLOOR + WALL_H / 2;
  const wallBack = new THREE.Mesh(new THREE.PlaneGeometry(COLS * CW + 0.6, WALL_H + 0.5), new THREE.MeshBasicMaterial({ color: "#10161f" }));
  wallBack.position.set(0, WALL_YC, WALL_Z - 0.35); scene.add(wallBack);
  const DRW = new RoundedBoxGeometry(0.9, 0.62, 0.6, 2, 0.04);
  const cells = []; for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!special(c, r)) cells.push([c, r]);
  const drawers = new THREE.InstancedMesh(DRW, toon("#1a2433"), cells.length); scene.add(drawers);
  const dummy = new THREE.Object3D(), BASE = new THREE.Color("#1a2433"), AMBER = new THREE.Color("#d6a45a"), GREEN = new THREE.Color("#6ad08a"), RED = new THREE.Color("#6b2a26"), tmpC = new THREE.Color();
  cells.forEach(([c, r], i) => { dummy.position.copy(cellPos(c, r)); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(1); dummy.updateMatrix(); drawers.setMatrixAt(i, dummy.matrix); drawers.setColorAt(i, BASE); });
  const userNo = (c, r) => 10 + Math.floor(hash(c * 31 + r * 7 + 3) * 90);
  const labels = panel(COLS * CW, WALL_H, 200, (g, W, H) => {
    g.font = "600 34px 'IBM Plex Mono', monospace"; g.textAlign = "center"; g.textBaseline = "middle";
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (special(c, r)) continue;
      const x = (c + 0.5) * CW * 200, y = H - (r + 0.5) * CH * 200;
      g.fillStyle = "#4b5666"; g.fillText("user_" + userNo(c, r), x, y - 18);
      g.fillStyle = "#2f3b4d"; rr(g, x - 34, y + 22, 68, 12, 6); g.fill();
    }
  });
  labels.set({}); labels.mesh.position.set(0, WALL_YC, FRONT_Z + 0.006); scene.add(labels.mesh);
  const bigDrawer = (p, name) => {
    const g = new THREE.Group(); g.position.copy(p); scene.add(g);
    const mat = toon("#1a2433"); g.add(new THREE.Mesh(DRW, mat));
    const lab = panel(0.9, 0.62, 200, (gg, W, H, s) => {
      gg.font = "600 34px 'IBM Plex Mono', monospace"; gg.textAlign = "center"; gg.textBaseline = "middle";
      gg.fillStyle = s.hi ? "#eef2f6" : "#4b5666"; gg.fillText(name, W / 2, H / 2 - 18);
      gg.fillStyle = "#2f3b4d"; rr(gg, W / 2 - 34, H / 2 + 22, 68, 12, 6); gg.fill();
    });
    lab.set({}); lab.mesh.position.set(0, 0, 0.306); g.add(lab.mesh);
    return { g, mat, lab, base: p.clone() };
  };
  const d7 = bigDrawer(P7, "user_7"), d9 = bigDrawer(P9, "user_9");

  // ---------- the notice board: the real stakes ----------
  const board = panel(2.8, 2.7, 300, (g, W, H, s) => {
    g.fillStyle = "#0c0e11"; rr(g, 6, 6, W - 12, H - 12, 34); g.fill(); g.strokeStyle = "#e0675a"; g.lineWidth = 8; rr(g, 6, 6, W - 12, H - 12, 32); g.stroke();
    g.textBaseline = "middle"; g.textAlign = "left";
    if (s.yr) { g.font = "700 150px 'IBM Plex Sans', sans-serif"; g.fillStyle = "#d6a45a"; g.fillText("2025", 50, 150); }
    if (s.name) { g.font = "700 62px 'IBM Plex Sans', sans-serif"; g.fillStyle = "#eef2f6"; g.fillText("Asana's AI connector", 50, 290); }
    if (s.off) {
      g.font = "600 50px 'IBM Plex Sans', sans-serif"; g.fillStyle = "#9aa6b6"; g.fillText("offline", 50, 390);
      g.fillStyle = "#eef2f6"; g.fillText("June 5 to 17", 50 + g.measureText("offline ").width, 390);
      for (let i = 0; i < 13; i++) {
        if (i >= s.days) continue; const x = 50 + i * 57, y = 450;
        g.fillStyle = "#1b212d"; rr(g, x, y, 48, 48, 8); g.fill(); g.strokeStyle = "#2f3b4d"; g.lineWidth = 3; rr(g, x, y, 48, 48, 8); g.stroke();
        if (i < s.x) { g.strokeStyle = "#e0675a"; g.lineWidth = 7; g.lineCap = "round"; g.beginPath(); g.moveTo(x + 10, y + 10); g.lineTo(x + 38, y + 38); g.moveTo(x + 38, y + 10); g.lineTo(x + 10, y + 38); g.stroke(); }
      }
    }
    g.font = "600 52px 'IBM Plex Sans', sans-serif"; g.fillStyle = "#eef2f6"; g.fillText(s.l1, 50, 640); g.fillText(s.l2, 50, 712);
  });
  board.mesh.position.copy(BOARD); scene.add(board.mesh);

  // ---------- the server ----------
  const server = new THREE.Group(); scene.add(server);
  server.add(at(new THREE.Mesh(new RoundedBoxGeometry(3.0, 2.2, 1.4, 4, 0.12), toon("#22324a")), 0, 5.7, -0.7));
  const trim = new THREE.MeshBasicMaterial({ color: "#4f93d6" });
  [[0, 6.8, 3.0, 0.05], [0, 4.6, 3.0, 0.05], [-1.5, 5.7, 0.05, 2.2], [1.5, 5.7, 0.05, 2.2]].forEach(([x, y, wx, hy]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(wx, hy, 0.05), trim); m.position.set(x, y, 0.02); server.add(m); });
  const lampMat = new THREE.MeshBasicMaterial({ color: "#2a3a55" });
  server.add(at(new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 0.04), lampMat), 0, 6.62, 0.03));
  const sLabel = panel(1.6, 0.42, 260, (g, W, H) => { g.fillStyle = "#4f93d6"; g.font = "600 84px 'IBM Plex Mono', monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("server", W / 2, H / 2 + 4); });
  sLabel.set({}); sLabel.mesh.position.set(-0.55, 7.12, -0.7); server.add(sLabel.mesh);
  const badge = panel(2.7, 0.36, 300, (g, W, H, s) => {
    g.fillStyle = "#0c0e11"; rr(g, 4, 4, W - 8, H - 8, 26); g.fill(); g.strokeStyle = s.hi ? "#6ad08a" : "#4f93d6"; g.lineWidth = 8; rr(g, 6, 6, W - 12, H - 12, 24); g.stroke();
    g.font = "600 56px 'IBM Plex Mono', monospace"; g.textBaseline = "middle"; g.textAlign = "left";
    const a = "logged in: ", wa = g.measureText(a).width, wb = g.measureText("user_7").width, x0 = (W - wa - wb) / 2;
    g.fillStyle = "#9aa6b6"; g.fillText(a, x0, H / 2 + 3); g.fillStyle = "#6ad08a"; g.fillText("user_7", x0 + wa, H / 2 + 3);
  });
  badge.set({}); badge.mesh.position.set(0, 4.83, 0.05); server.add(badge.mesh);
  const stamp = new THREE.Group(); scene.add(stamp);
  stamp.add(new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.2, 0.46, 2, 0.04), toon("#d6a45a")));
  stamp.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.5, 16), toon("#2a3344")), 0, 0.35, 0));
  stamp.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 14), toon("#2a3344")), 0, 0.66, 0));

  // ---------- the cards ----------
  const PAD = (g, W, H) => { g.fillStyle = "#eef2f6"; rr(g, 4, 4, W - 8, H - 8, 26); g.fill(); g.fillStyle = "#dfe5ec"; rr(g, 4, 4, W - 8, 92, [26, 26, 0, 0]); g.fill(); };
  const field = (g, x, y, label, val, opt = {}) => {
    g.font = "500 40px 'IBM Plex Mono', monospace"; g.textBaseline = "middle"; g.textAlign = "left"; g.fillStyle = "#5a6472"; g.fillText(label, x, y);
    const bx = x + 200, bw = 330, bh = 70;
    g.fillStyle = opt.fill || "#ffffff"; rr(g, bx, y - bh / 2, bw, bh, 12); g.fill();
    g.strokeStyle = opt.edge || "#c3cad4"; g.lineWidth = opt.edgeW || 4; rr(g, bx, y - bh / 2, bw, bh, 12); g.stroke();
    g.font = "600 44px 'IBM Plex Mono', monospace"; g.fillStyle = opt.ink || "#1b212d"; g.fillText(val, bx + 22, y + 2);
    return [bx, bw];
  };
  const edgeOpt = (k) => (k === "red" ? { edge: "#e0675a", edgeW: 8, ink: "#b8443a" } : k === "amber" ? { edge: "#d6a45a", edgeW: 8 } : {});
  // s: { browser, tA, text, textEdge, uidA, uid, uidEdge, strike, owner }
  const formDraw = (g, W, H, s) => {
    PAD(g, W, H);
    if (s.browser) { // a browser window's title bar: three dots and an empty address pill (no URL on screen)
      ["#e0675a", "#d6a45a", "#6ad08a"].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(46 + i * 40, 48, 13, 0, Math.PI * 2); g.fill(); });
      g.fillStyle = "#ffffff"; rr(g, 180, 26, W - 220, 44, 22); g.fill();
    } else { g.font = "600 46px 'IBM Plex Mono', monospace"; g.textAlign = "left"; g.textBaseline = "middle"; g.fillStyle = "#1b212d"; g.fillText("save_note", 34, 50); }
    if (s.tA > 0) { g.save(); g.globalAlpha = s.tA; field(g, 34, 160, s.browser ? "note" : "text", s.text, edgeOpt(s.textEdge)); g.restore(); }
    if (s.owner) {
      field(g, 34, 270, "user", "user_7", { fill: "#fbf1df", edge: "#d6a45a", edgeW: 6, ink: "#8a5a17" });
      g.save(); g.translate(W - 150, 372); g.rotate(-0.12); g.strokeStyle = "#d6a45a"; g.lineWidth = 7; rr(g, -120, -40, 240, 80, 14); g.stroke();
      g.fillStyle = "#d6a45a"; g.font = "700 32px 'IBM Plex Mono', monospace"; g.textAlign = "center"; g.fillText("FROM LOGIN", 0, 2); g.restore();
    } else if (s.uidA > 0) {
      g.save(); g.globalAlpha = s.uidA;
      const [bx, bw] = field(g, 34, 270, "user_id", s.uid, edgeOpt(s.uidEdge));
      if (s.strike > 0) { g.strokeStyle = "#e0675a"; g.lineWidth = 12; g.lineCap = "round"; g.beginPath(); g.moveTo(30, 270); g.lineTo(mix(30, bx + bw + 10, s.strike), 270); g.stroke(); }
      g.restore();
    }
  };
  const webForm = panel(2.3, 1.45, 300, formDraw); scene.add(webForm.mesh);   // the browser's form (hook, and "on the web")
  const form = panel(2.3, 1.45, 300, formDraw); scene.add(form.mesh);         // the AI's tool form
  const form2 = panel(2.3, 1.45, 300, formDraw); scene.add(form2.mesh);       // the fixed tool: no user ID box
  // the API card the tool was copied from (blue: a system)
  const api = panel(2.3, 1.0, 300, (g, W, H) => {
    g.fillStyle = "#0c0e11"; rr(g, 6, 6, W - 12, H - 12, 28); g.fill(); g.strokeStyle = "#4f93d6"; g.lineWidth = 8; rr(g, 6, 6, W - 12, H - 12, 26); g.stroke();
    g.font = "600 52px 'IBM Plex Mono', monospace"; g.textBaseline = "middle"; g.textAlign = "left"; g.fillStyle = "#4f93d6"; g.fillText("your API", 44, 82);
    g.fillStyle = "#eef2f6"; g.font = "500 46px 'IBM Plex Mono', monospace"; g.fillText("save(text, user_id)", 44, 190);
  });
  api.set({}); scene.add(api.mesh);
  // the prompt note (cream: words the model reads) and the hostile one (red)
  const note = (txt1, txt2, red) => panel(2.3, 1.15, 300, (g, W, H) => {
    g.fillStyle = red ? "#fbe3df" : "#f4efdc"; rr(g, 4, 4, W - 8, H - 8, 18); g.fill(); if (red) { g.strokeStyle = "#e0675a"; g.lineWidth = 10; rr(g, 6, 6, W - 12, H - 12, 16); g.stroke(); }
    g.textBaseline = "middle"; g.textAlign = "left"; g.font = "600 40px 'IBM Plex Mono', monospace"; g.fillStyle = red ? "#b8443a" : "#7b6a3a"; g.fillText(txt1, 40, 82);
    g.font = "700 64px 'IBM Plex Sans', sans-serif"; g.fillStyle = "#1b212d"; g.fillText(txt2, 40, 210);
  });
  const prompt = note("prompt:", "user is user_7", false); prompt.set({}); scene.add(prompt.mesh);
  const bad = note("planted note:", "save to user_9", true); bad.set({}); scene.add(bad.mesh);
  // the close's stream: one instanced mesh before the server (plain) and one after (stamped)
  const miniTex = (stamped) => glyphTexture(THREE, (g, W, H) => { g.fillStyle = "#eef2f6"; rr(g, 3, 3, W - 6, H - 6, 14); g.fill(); g.fillStyle = "#c3cad4"; [40, 74].forEach((y, i) => g.fillRect(20, y, W - 40 - i * 50, 12));
    g.fillStyle = stamped ? "#d6a45a" : "#c3cad4"; rr(g, 20, 104, stamped ? 110 : 80, 26, 6); g.fill(); }, 200, 140);
  const MINI = new THREE.PlaneGeometry(0.8, 0.55);
  const miniA = new THREE.InstancedMesh(MINI, new THREE.MeshBasicMaterial({ map: miniTex(false), side: THREE.DoubleSide, transparent: true }), STREAM.length);
  const miniB = new THREE.InstancedMesh(MINI, new THREE.MeshBasicMaterial({ map: miniTex(true), side: THREE.DoubleSide, transparent: true }), STREAM.length);
  [miniA, miniB].forEach((m) => { m.frustumCulled = false; scene.add(m); });

  // ---------- the receipt: write_memory's real schema, out of the server's front ----------
  const FIELDS = ["type", "content", "source_turn_id", "source_session_id", "confidence", "reason"];
  const schema = panel(2.3, 2.6, 300, (g, W, H, s) => {
    g.fillStyle = "#0c0e11"; rr(g, 6, 6, W - 12, H - 12, 34); g.fill(); g.strokeStyle = "#4f93d6"; g.lineWidth = 9; rr(g, 6, 6, W - 12, H - 12, 32); g.stroke();
    g.textBaseline = "middle"; g.textAlign = "left";
    g.font = "600 52px 'IBM Plex Mono', monospace"; g.fillStyle = "#4f93d6"; g.fillText("write_memory", 44, 72);
    g.font = "500 30px 'IBM Plex Mono', monospace"; g.fillStyle = "#7b8593"; g.fillText("inputs the AI fills in", 44, 120);
    FIELDS.forEach((f, i) => {
      const a = cl(s.rows - i); if (a <= 0) return; const y = 180 + i * 70;
      g.globalAlpha = a; g.font = "600 38px 'IBM Plex Mono', monospace"; g.fillStyle = "#eef2f6"; g.fillText(f, 44, y);
      if (s.ticks > i) { g.fillStyle = "#6ad08a"; g.font = "600 30px 'IBM Plex Mono', monospace"; g.textAlign = "right"; g.fillText("AI", W - 44, y); g.textAlign = "left"; }
      g.globalAlpha = 1;
    });
    if (s.ghost > 0) {
      const y = 180 + 6 * 70; g.globalAlpha = s.ghost; g.strokeStyle = "#e0675a"; g.lineWidth = 5; g.setLineDash([14, 10]); rr(g, 30, y - 30, W - 60, 60, 12); g.stroke(); g.setLineDash([]);
      g.font = "600 38px 'IBM Plex Mono', monospace"; g.fillStyle = "#e0675a"; g.fillText("chat_id", 44, y);
      if (s.gs > 0) { g.lineWidth = 8; g.lineCap = "round"; g.beginPath(); g.moveTo(36, y); g.lineTo(mix(36, W - 36, s.gs), y); g.stroke(); }
      g.globalAlpha = 1;
    }
  });
  schema.mesh.position.set(0, 5.6, 1.0); scene.add(schema.mesh);

  // ---------- helpers ----------
  const camQ = new THREE.Quaternion();
  const bez = (a, m, b, k) => { const u = 1 - k; return V(u * u * a.x + 2 * u * k * m.x + k * k * b.x, u * u * a.y + 2 * u * k * m.y + k * k * b.y, u * u * a.z + 2 * u * k * m.z + k * k * b.z); };
  const place = (p, m, s, a) => { m.visible = a > 0.002 && s > 0.002; if (!m.visible) return; m.position.copy(p); m.scale.setScalar(s); m.material.opacity = a; m.quaternion.identity(); };
  const drawerOut = (t, spans) => { let o = 0; spans.forEach(([a, b]) => { o = Math.max(o, io(r01(t, a, 0.35)) * (1 - io(r01(t, b, 0.35)))); }); return o * 0.55; };
  const q = (x, n = 20) => Math.round(x * n) / n; // quantised panel states: a redraw per step, not per frame
  // impact = the head's centre just off the card (z 0.3), on FROM LOGIN
  const REST = V(0.85, 7.35, 0.7), PARK = V(0.85, 6.1, -0.7), TGT = V(0.65, 5.24, 0.41);

  function render(t) {
    cameraAt(t, cam); camQ.copy(cam.quaternion);
    const bob = 0.05 * Math.sin((t / 1.7) * Math.PI * 2);
    let happy = 0, look = 0, lookY = 0, think = 0, skew = 0, eager = 0;
    const yaw = 0.12 * Math.sin((t / 3.1) * Math.PI * 2);
    const blinkK = Math.max(pulse(t, 7.9, 0.07), pulse(t, 13.9, 0.07), pulse(t, 20.6, 0.07), pulse(t, 46.0, 0.07), pulse(t, 62.0, 0.07));
    shadowMat.opacity = 0.45 - bob; shadow.scale.setScalar(1 - bob);

    // ---------- the browser's form: the server ignores its user ID and stamps the login ----------
    {
      const hook = t < T.so + 0.6;
      let p = CARD_M.clone(), s = 1, a = 0;
      if (hook) { a = r01(t, 0, 0.2); s = mix(0.88, 1, back(r01(t, 0, 0.35))); const k = io(r01(t, T.so, 0.5)); p.z -= 0.6 * k; s *= 1 - 0.4 * k; a *= 1 - k; }
      else if (t > T.fix && t < T.server + 0.4) { // "the one you already use on the web": back for a beat, then aside for the tool
        a = r01(t, T.fix, 0.25) * (1 - r01(t, T.server - 0.3, 0.4)); s = mix(0.88, 1, back(r01(t, T.fix, 0.35))); p.x -= 2.2 * io(r01(t, T.server - 0.3, 0.6));
      }
      const owner = hook ? t >= T.form + 0.02 : true;
      webForm.set({ browser: true, tA: 1, text: "hi", uidA: 1, uid: "user_9", uidEdge: owner ? "" : t >= T.never ? "red" : "", strike: q(io(r01(t, T.browser, 0.22))), owner });
      if (t > T.form - 0.05 && t < T.form + 0.2) s *= 1 - 0.05 * pulse(t, T.form + 0.02, 0.08);
      place(p, webForm.mesh, s, a);
    }

    // ---------- the AI's tool form ----------
    {
      let p = FORM_DESK.clone(), s = 1, a = 0;
      // hook tail: Blink types user_7 into the same kind of box; then it clears for the story
      const hookA = r01(t, T.so + 0.3, 0.3) * (1 - r01(t, T.easy, 0.3));
      const buildA = r01(t, T.give - 0.05, 0.25);
      a = Math.max(hookA, buildA);
      if (t >= T.give - 0.05) s = mix(0.88, 1, back(r01(t, T.give - 0.05, 0.35)));
      let tA, uidA, text, uid, uidEdge = "", textEdge = "";
      if (t < T.give) { tA = 1; uidA = 1; text = ""; uid = typed("user_7", T.typed - 0.3, 20, t); uidEdge = t >= T.typed - 0.3 ? "amber" : ""; }
      else {
        tA = q(r01(t, T.api + 0.5, 0.25)); uidA = q(r01(t, T.takes, 0.25));
        text = typed("call Sam", T.then, 18, t); uid = t < T.fills ? "" : typed("user_7", T.fills, 18, t);
        if (t >= T.wrong) uid = "user_9";
        if (t > T.hostile + 0.4 && t < T.hostile + 1.0) uid = ["user_9", "user_2", "user_9", "user_5", "user_9", "user_9"][Math.floor((t - T.hostile - 0.4) * 10) % 6];
        uidEdge = t >= T.wrong ? "red" : t >= T.takes && t < T.takes + 1.2 ? "amber" : t >= T.writes && t < T.wrong ? "amber" : "";
        textEdge = t >= T.writes && t < T.wrong ? "amber" : "";
      }
      // to someone else's drawer: in front of the server and over its top, never through its body
      const up = io(r01(t, T.saves, T.account - T.saves));
      if (up > 0) { p = bez(FORM_DESK, V(2.2, 7.4, 2.4), slot(P9), up); s = mix(1, 0.42, up); }
      a *= 1 - r01(t, T.fix - 0.2, 0.4);
      form.set({ tA, text, textEdge, uidA, uid, uidEdge, owner: false });
      place(p, form.mesh, s, a);
    }

    // ---------- the API card the tool copies, and the notes the model reads ----------
    {
      const k = io(r01(t, T.api + 0.1, 0.45)); // drops into the form
      const a = r01(t, T.copy - 0.05, 0.2) * (1 - k);
      place(V(API_AT.x, mix(API_AT.y, FORM_DESK.y, k), mix(API_AT.z, FORM_DESK.z + 0.05, k)), api.mesh, 0.8 * mix(1, 0.6, k) * mix(0.88, 1, back(r01(t, T.copy - 0.05, 0.35))), a);
      const pa = r01(t, T.tell, 0.25) * (1 - r01(t, T.saves, 0.3));
      const pk = io(r01(t, T.tell, 0.5));
      place(V(NOTE_AT.x, mix(NOTE_AT.y + 1.2, NOTE_AT.y, pk), NOTE_AT.z), prompt.mesh, 0.58, pa);
      // the hostile note: planted beside Blink, later thrown at the fixed tool and bounced
      let bp = BAD_AT.clone(), ba = r01(t, T.hostile - 0.05, 0.2) * (1 - r01(t, T.saves, 0.3)), rz = 0.06;
      if (t > T.tool4 - 0.3) {
        const f = io(r01(t, T.tool4, T.box - T.tool4)); bp = bez(V(0.8, 2.3, 1.0), V(1.4, 5.0, 1.6), V(0.35, 5.45, 0.5), f); // up from below the frame, never across its side
        ba = r01(t, T.tool4 - 0.3, 0.2);
        if (t > T.box) { const b = r01(t, T.box, 0.6); bp = V(0.35 + 1.6 * b, 5.45 + 1.0 * b - 3.2 * b * b, 0.5 + 0.6 * b); ba *= 1 - r01(t, T.box + 0.3, 0.3); rz = -2.2 * b; }
      }
      place(bp, bad.mesh, 0.58, ba); bad.mesh.rotation.set(0, 0, rz);
    }

    // ---------- the fixed tool: text only; the server stamps the login ----------
    {
      const k = io(r01(t, T.server - 0.2, 0.6));
      let p = V(0, mix(3.4, CARD_M.y, k), mix(0.8, CARD_M.z, k)), s = 1, a = t < T.server - 0.2 ? 0 : r01(t, T.server - 0.2, 0.15);
      const f = io(r01(t, T.box + 0.3, 0.7));
      if (f > 0) { p = bez(CARD_M, V(-0.8, 8.4, 1.0), slot(P7), f); s = mix(1, 0.42, f); }
      const sink = r01(t, T.box + 1.0, 0.3); s *= 1 - 0.5 * sink; a *= 1 - sink;
      if (t > T.login - 0.05 && t < T.login + 0.2) s *= 1 - 0.05 * pulse(t, T.login + 0.02, 0.08);
      if (t > T.box - 0.05 && t < T.box + 0.25) p.x -= 0.05 * pulse(t, T.box + 0.03, 0.12); // the note hits it
      form2.set({ tA: 1, text: "call Sam", uidA: 0, owner: t >= T.login + 0.02 });
      place(p, form2.mesh, s, a);
    }

    // ---------- the notice board ----------
    {
      const a = r01(t, T.y2025 - 0.6, 0.4) * (1 - r01(t, T.fix + 0.2, 0.4));
      const days = t < T.pulled ? 0 : Math.min(13, Math.floor((t - T.pulled - 0.1) / 0.03) + 1), x = t < T.two - 0.1 ? 0 : Math.min(13, Math.floor((t - (T.two - 0.1)) / 0.07) + 1);
      board.set({ yr: t >= T.y2025, name: t >= T.asana, off: t >= T.pulled, days, x, l1: typed("a bug could expose data", T.aBug, 40, t), l2: typed("to other organizations.", T.to2 - 0.2, 40, t) });
      place(BOARD, board.mesh, mix(0.9, 1, back(r01(t, T.y2025 - 0.6, 0.4))), a);
    }

    // ---------- the drawers that move ----------
    const o9 = drawerOut(t, [[T.saves + 0.9, T.fix + 0.35]]);
    d7.g.position.copy(d7.base); d9.g.position.copy(d9.base); d9.g.position.z += o9;
    const red9 = t >= T.account && t < T.fix + 0.5 ? 1 : 0;
    d9.mat.color.copy(BASE).lerp(RED, red9); d9.lab.set({ hi: red9 > 0.5 });
    const g7 = pulse(t, T.box + 1.05, 0.5);
    d7.mat.color.copy(BASE).lerp(GREEN, 0.45 * g7); d7.lab.set({ hi: g7 > 0.3 });

    // ---------- the server's name, lamp and badge ----------
    sLabel.mesh.material.opacity = 1 - r01(cam.position.y, 8.2, 0.5); // a blurred word at the frame's foot from the wall shots
    const amberHit = Math.max(...STAMPS.map((x) => pulse(t, x + 0.03, 0.25)), ...STREAM.map((f) => pulse(t, f.at + 0.05, 0.08)));
    lampMat.color.set("#2a3a55").lerp(AMBER, amberHit).lerp(GREEN, pulse(t, T.saves + 0.5, 0.3));
    badge.set({ hi: pulse(t, T.form - 0.1, 0.5) > 0.2 || pulse(t, T.login - 0.1, 0.6) > 0.15 });
    badge.mesh.scale.setScalar(1 + 0.1 * Math.max(pulse(t, T.form - 0.1, 0.25), pulse(t, T.login - 0.1, 0.3)));

    // ---------- the stamp: parked inside the server's body between slams ----------
    {
      let p = REST.clone(), rx = 0.3;
      STAMPS.forEach((ts) => {
        if (t < ts - 0.35 || t > ts + 0.4) return;
        const k = t < ts ? io(r01(t, ts - 0.35, 0.33)) : 1 - io(r01(t, ts + 0.08, 0.3));
        p = bez(REST, V(mix(REST.x, TGT.x, 0.5), REST.y + 0.3, TGT.z + 0.9), TGT, k); rx = mix(0.3, Math.PI / 2, k); // +90 deg about x: face from -y to -z
      });
      const near = Math.max(0, ...STAMPS.map((ts) => io(r01(t, ts - 1.1, 0.45)) * (1 - io(r01(t, ts + 0.5, 0.45)))));
      p = PARK.clone().lerp(p, near); stamp.visible = near > 0.001;
      stamp.position.copy(p); stamp.rotation.set(rx, 0, 0);
    }

    // ---------- the crowd and the stream (the close) ----------
    crowd.forEach((c, i) => {
      const k = back(r01(t, c.s0, 0.4)); c.g.visible = k > 0.01; c.sh.visible = c.g.visible;
      c.g.scale.setScalar(Math.max(0.01, 0.85 * k)); c.g.position.set(c.x, 0.04 * Math.sin(t * 3.4 + i * 1.3) - 0.15, c.z);
      c.g.rotation.set(0, 0.25 * Math.sin(t * 0.9 + i), 0);
      c.b.face({ blink: pulse(t, c.s0 + 1.1 + i * 0.4, 0.07), happy: 0.6 * r01(t, c.s0 + 0.8, 0.3), lookY: 1.0, phase: t });
      c.sh.scale.setScalar(0.85 * k);
    });
    const flash = new Map();
    STREAM.forEach((f, j) => {
      let pA = null, pB = null, sc = 0.9;
      if (t >= f.s && t < f.at) pA = bez(f.src, V(f.src.x * 0.5, 3.6, 1.6), V(CARD_M.x + f.jx, CARD_M.y + f.jy, CARD_M.z + 0.2 + j * 0.002), io((t - f.s) / (f.at - f.s)));
      else if (t >= f.at && t < f.out) { pB = V(CARD_M.x + f.jx, CARD_M.y + f.jy, CARD_M.z + 0.2 + j * 0.002); sc = 0.9 * (1 + 0.15 * pulse(t, f.at + 0.04, 0.08)); }
      else if (t >= f.out && t < f.land + 0.2) {
        const tgt = cellPos(f.c, f.r); tgt.z = FRONT_Z + 0.25;
        const k = io(r01(t, f.out, f.land - f.out)); pB = bez(V(CARD_M.x + f.jx, CARD_M.y + f.jy, CARD_M.z + 0.2), V(mix(CARD_M.x, tgt.x, 0.5), Math.max(CARD_M.y, tgt.y) + 1.4, 1.8), tgt, k);
        sc = mix(0.9, 0.55, k) * (1 - r01(t, f.land, 0.2));
      }
      if (t >= f.land - 0.05 && t < f.land + 0.7) flash.set(f.c + "," + f.r, Math.max(flash.get(f.c + "," + f.r) || 0, pulse(t, f.land + 0.1, 0.55)));
      [[miniA, pA], [miniB, pB]].forEach(([m, p]) => { if (p) { dummy.position.copy(p); dummy.quaternion.copy(camQ); dummy.scale.setScalar(Math.max(0.0001, sc)); } else { dummy.position.set(0, -50, 0); dummy.scale.setScalar(0.0001); } dummy.updateMatrix(); m.setMatrixAt(j, dummy.matrix); });
    });
    miniA.instanceMatrix.needsUpdate = true; miniB.instanceMatrix.needsUpdate = true;
    cells.forEach(([c, r], i) => { tmpC.copy(BASE).lerp(AMBER, flash.get(c + "," + r) || 0); drawers.setColorAt(i, tmpC); });
    drawers.instanceColor.needsUpdate = true;

    // ---------- the schema ----------
    {
      const k = io(r01(t, T.one5, 0.5)), out = io(r01(t, T.treat - 0.3, 0.35)), a = cl(k * 1.4) * (1 - out);
      const rows = Math.round(cl((t - T.six) / 0.7) * 60) / 10; // six rows in 0.7 s from "six"
      const ticks = t < T.all ? 0 : Math.min(6, Math.floor((t - T.all) / 0.06) + 1);
      schema.set({ rows, ticks, ghost: q(r01(t, T.conv - 0.05, 0.2) * (1 - r01(t, T.them, 0.3)), 10), gs: q(io(r01(t, T.isnt, 0.25))) });
      place(V(0, mix(5.7, 5.6, k), mix(-0.2, 1.0, k) - 1.2 * out), schema.mesh, mix(0.4, 1, k) * (1 - 0.5 * out), a);
    }

    // ---------- Blink's face ----------
    if (t < T.easy) { lookY = 1.2; eager = 0.4 * pulse(t, T.typed, 0.5); }
    else if (t < T.tell) { lookY = 1.3; look = 0.1; }
    else if (t < T.then) { look = -0.9; lookY = 0.3; } // reading the prompt note
    else if (t < T.wrong - 0.1) { lookY = 1.15; happy = 0.4 * r01(t, T.fills + 0.5, 0.2); }
    else if (t < T.hostile) { think = io(r01(t, T.wrong - 0.4, 0.1)) * (1 - io(r01(t, T.wrong + 0.05, 0.1))); lookY = 0.9; }
    else if (t < T.saves) { look = 0.9; lookY = 0.4; skew = 0.6 * r01(t, T.hostile, 0.15); } // the planted note
    else if (t < T.treat) { lookY = 1.4; look = 0.4; }
    else { happy = r01(t, T.treat + 0.5, 0.15); lookY = 0.6; }
    blink.root.rotation.set(0, yaw, 0); rig.position.y = bob;
    blink.face({ blink: blinkK, happy, look, lookY, think, skew, eager, phase: t * 1.6 });
    renderer.render(scene, cam);
  }
  return render;
}

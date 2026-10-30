// devweb ep 3, draft 1: "Let the model choose. Make the server decide." One Three.js world, one continuous camera (the
// standard since ep 1 draft 4), stacked for portrait: Blink at the bottom writes request cards; the server (a blue
// machine with a stamp) sits above it; behind and above both stands the record wall of workspace A, one drawer per chat.
// First Blink fills in two ids itself and its card lands in the wrong drawer. Then the server stops asking: Blink sends
// only the message id, the server pulls the record from the wall and stamps the chat. Mass moment: a crowd of Blinks
// and a stream of cards, every one stamped and filed in its own drawer. Everything is a pure function of film time t.
import * as THREE from "three";
import { makeBlink, glyphTexture } from "./kit/blink3d.js";
import { cl, io, back, r01, mix, V, pulse, typed, cameraPath, panel, rr, stage } from "./kit/world.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const VO = window.VO, G = window.BLINK;
const w = (x, n) => VO.w(x, n), e = (x, n) => VO.e(x, n);

// ---------- the beats, all on Chris's words (a few snapped to the voice's onsets, noted) ----------
export const T = {
  wrote: w("wrote"), ws: w("workspace"), b: w("b"), crossed: 4.52, out: 4.95, // onsets: "crossed" after the dip at 4.50, "out" at 4.95
  save: w("save"), two: w("two"), ids: w("ids"), msg1: w("message"), chat1: w("chat"), nothing: w("nothing"),
  wrong1: w("wrong"), buggy: w("buggy"), real: w("real"), lands1: w("lands"), chat2: w("chat", 2),
  both: w("both"), writer: w("writer"), only: w("only"), records1: w("records"), chat3: w("chat", 3), in2: e("in", 2),
  so: w("so"), stops: w("stops"), asking: w("asking"), model: w("model"), id: w("id"), looks: w("looks"),
  stamps: w("stamps"), there: e("there"), same2: w("same", 2), ws2: w("workspace", 2), signed: w("signed"),
  put: w("put"), b2: w("b", 2), the14: w("the", 14), still: 38.95, a3: w("a", 3),
  one3: w("one", 3), six: w("six"), fields: w("fields"), all: w("all"), required: w("required"), chat5: w("chat", 5),
  isnt: w("isn't"), them2: e("them", 2), desc: w("description"), why: w("why"), derived: w("derived"),
  wont: w("won't"), picked: w("picked"), right: w("right"), it6: w("it", 6), thing: 53.78, wrong3: w("wrong", 3),
  let: w("let"), choose: w("choose"), make: 58.08, decide: 58.55, END: VO.END, // "make" follows a silence 57.75-58.05
};

// ---------- the layout ----------
const FLOOR = -1.72;
const FORM_DESK = V(0, 2.45, 0.3), CARD_M = V(0, 5.75, 0.3);
const COLS = 9, ROWS = 21, CW = 1.0, CH = 0.72, WALL_Z = -4.0, FRONT_Z = WALL_Z + 0.3;
const cellPos = (c, r) => V(-4 + c * CW, FLOOR + CH / 2 + r * CH, WALL_Z);
const C7 = { c: 3, r: 14 }, C9 = { c: 5, r: 14 }, CENV = { c: 4, r: 18 };
const P7 = cellPos(C7.c, C7.r), P9 = cellPos(C9.c, C9.r), PENV = cellPos(CENV.c, CENV.r);
const slot = (p) => V(p.x, p.y + 0.26, FRONT_Z + 0.67); // a card standing just in front of a pulled-out drawer's face (0.12 clear: no z-fight)
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const special = (c, r) => (c === C7.c && r === C7.r) || (c === C9.c && r === C9.r) || (c === CENV.c && r === CENV.r);

// ---------- the camera path: [time, position, target, fov] ----------
const KEYS = [
  // the hook: tight on the request card at the server
  [0, [0.15, 5.95, 9.8], [0, 5.85, 0.3], 34],
  [2.9, [0.1, 5.9, 10.1], [0, 5.85, 0.3], 34],
  [T.out + 0.3, [0, 5.85, 10.4], [0, 5.8, 0.3], 34],
  // down to Blink at its desk
  [6.6, [0.25, 1.2, 10.4], [0, 0.95, 0], 36],
  [12.0, [0.15, 1.15, 10.0], [0, 0.95, 0], 36],
  [T.real - 0.1, [0.1, 1.15, 9.7], [0, 1.0, 0], 36],
  // ride up with the card past the server to the wrong drawer, pulled back so the server never fills the frame
  [T.real + 0.75, [0.8, 5.6, 13.5], [0.7, 6.2, -1.5], 36],
  [T.chat2 + 0.15, [0.6, 9.0, 5.4], [0.4, 8.75, -3.75], 36],
  [T.both - 0.2, [0.55, 8.95, 5.7], [0.4, 8.75, -3.75], 36],
  // both ids from one writer: the whole stack, Blink to the drawer
  [T.both + 0.6, [0.5, 3.6, 16.6], [0.4, 3.5, -1.5], 40],
  [T.only - 0.35, [0.45, 3.7, 16.9], [0.4, 3.5, -1.5], 40],
  // the server's records: the drawer that really holds the message, the wrong one beside it
  [T.records1 - 0.1, [-0.05, 9.05, 5.8], [0, 8.75, -3.75], 36],
  [T.so - 0.25, [0, 9.0, 6.1], [0, 8.75, -3.75], 36],
  // back to Blink with the card
  [T.so + 0.85, [0.25, 1.2, 10.2], [0, 0.95, 0], 36],
  [T.model - 0.15, [0.15, 1.15, 9.8], [0, 1.0, 0], 36],
  // up to the server, the drawer above it
  [T.id + 0.2, [-0.15, 6.7, 11.2], [-0.2, 6.6, -1.2], 36],
  [T.stamps - 0.2, [-0.1, 6.65, 10.8], [-0.2, 6.6, -1.2], 36],
  [T.there - 0.3, [-0.1, 6.7, 10.6], [-0.2, 6.8, -1.2], 36],
  // the mass moment: the whole wall and the crowd, close enough to read the cards
  [T.same2 + 0.1, [0, 7.3, 22], [0, 6.9, -2], 40],
  [T.ws2 + 0.9, [0, 7.4, 22.6], [0, 6.9, -2], 40],
  // who's signed in: the badge on the server
  [T.signed - 0.05, [0.15, 5.4, 9.6], [0, 5.2, 0], 36],
  [T.put + 0.6, [0.1, 5.6, 9.4], [0, 5.6, 0.2], 36],
  [T.still + 0.05, [0.05, 5.8, 9.6], [0, 5.8, 0.2], 36],
  // follow the envelope up into workspace A
  [T.a3 + 0.1, [0.1, 10.3, 10.5], [0, 11.4, -3.5], 38],
  [T.one3 - 0.1, [0.1, 10.3, 10.6], [0, 11.4, -3.5], 38],
  // the schema
  [T.one3 + 0.75, [0, 6.25, 9.6], [0, 6.25, 1.0], 36],
  [50.55, [0, 6.2, 9.3], [0, 6.2, 1.0], 36],
  // back to Blink choosing
  [51.4, [0.2, 1.3, 8.6], [0, 1.05, 0], 36],
  [T.it6 - 0.1, [0.15, 1.25, 8.3], [0, 1.05, 0], 36],
  // the stack: the picked card through the server into its own drawer; the wrong drawer stays shut
  [T.thing + 0.1, [0.6, 3.7, 16.6], [0.4, 3.6, -1.5], 40],
  [T.let - 0.3, [0.5, 3.8, 16.9], [0.4, 3.6, -1.5], 40],
  // the end: the whole world
  [T.make + 0.6, [0, 7.2, 27], [0, 6.4, -2], 40],
  [T.END, [0, 7.4, 28], [0, 6.4, -2], 40],
];
const cameraAt = cameraPath(KEYS);

// ---------- the stamp: every slam it makes ----------
const STAMPS = [T.out, T.stamps, T.still, T.thing, T.decide];

// ---------- the crowd and the stream ----------
const CROWD = [-4.2, -3.0, -1.8, 1.8, 3.0, 4.2].map((x, i) => ({ x, z: -1.1 - 0.25 * (i % 2), s0: T.stamps + 0.25 + 0.07 * i }));
const SRC = [V(0, 1.7, 0.3), ...CROWD.map((c) => V(c.x, 1.3, c.z + 0.3))];
const STREAM = [];
{
  const cells = [];
  for (let r = 1; r < ROWS - 1; r++) for (let c = 0; c < COLS; c++) if (!special(c, r)) cells.push([c, r]);
  const N = 50;
  for (let j = 0; j < N; j++) {
    const s = T.there - 0.15 + j * 0.045 + hash(j + 41) * 0.03;
    const [c, r] = cells[Math.floor(hash(j + 7) * cells.length)];
    STREAM.push({ s, src: SRC[1 + (j % CROWD.length)], c, r, at: s + 0.6, out: s + 0.75, land: s + 1.45, jx: (hash(j + 3) - 0.5) * 0.5, jy: (hash(j + 5) - 0.5) * 0.3 });
  }
  // keep one cell per landing so two cards never share a drawer in the same half second
  STREAM.forEach((f, j) => { for (let k = 0; k < j; k++) if (STREAM[k].c === f.c && STREAM[k].r === f.r) { f.c = (f.c + 3) % COLS; if (special(f.c, f.r)) f.r = Math.min(ROWS - 2, f.r + 1); } });
}

export async function buildWorld(canvas) {
  // ---------- sound cues (times only; reported before any await so cues.mjs sees them) ----------
  const cue = (k, t, extra) => window.BP.CUES.push(Object.assign({ k, t: +t.toFixed(3) }, extra || {}));
  const ENV_TXT = "workspace: B", HEAD = "write_memory", MSG = "msg_481", GUESS = "chat_9";
  cue("land", 0.2); [...ENV_TXT].forEach((ch, i) => ch.trim() && cue("type", T.wrote + i / 13));
  cue("strike", T.crossed); cue("stamp", T.out); cue("whoosh", T.out + 0.3, { d: 1.2 });
  cue("pop", T.save - 0.05); [...HEAD].forEach((ch, i) => cue("type", T.save + i / 30));
  cue("tick", T.two); cue("tick", T.ids);
  [...MSG].forEach((ch, i) => cue("type", T.msg1 + i / 18));
  cue("blip", T.chat1 - 0.3); [...GUESS].forEach((ch, i) => cue("type", T.chat1 + 0.35 + i / 18));
  cue("slide", T.nothing, { d: 0.45 }); cue("blip", T.wrong1); cue("swipe", T.buggy); cue("blip", T.buggy + 0.2);
  cue("whoosh", T.real - 0.05, { d: 1.5 }); cue("tick", T.real + 0.55); cue("slide", T.lands1 + 0.3, { d: 0.45 }); cue("thud", T.chat2);
  cue("draw", T.both, { d: 0.6 }); cue("whoosh", T.only - 0.3, { d: 1.0 }); cue("slide", T.records1, { d: 0.45 }); cue("blip", T.chat3);
  cue("whoosh", T.so - 0.05, { d: 0.9 }); cue("strike", T.stops); cue("zipdown", T.asking);
  cue("whoosh", T.model, { d: 1.0 }); cue("land", T.id + 0.1);
  cue("slide", T.looks, { d: 0.4 }); cue("zip", T.looks + 0.5); cue("stamp", T.stamps);
  cue("whoosh", T.there - 0.25, { d: 0.7 }); cue("land", T.there + 0.45); cue("whoosh", T.there + 0.3, { d: 1.4 });
  CROWD.forEach((c) => cue("pop", c.s0));
  STREAM.forEach((f, j) => { if (j % 3 === 0) cue("tick", f.at); if (j % 4 === 1) cue("land", f.land); });
  cue("blip", T.ws2); cue("whoosh", T.ws2 + 0.9, { d: 0.9 }); cue("ding", T.signed);
  cue("pop", T.put - 0.45); cue("strike", T.the14); cue("stamp", T.still); cue("whoosh", T.still + 0.05, { d: 0.75 }); cue("land", T.a3);
  cue("whoosh", T.one3 - 0.05, { d: 0.85 }); cue("slide", T.one3, { d: 0.45 });
  [0, 1, 2, 3, 4, 5].forEach((i) => { cue("tick", T.fields - 0.85 + i * 0.15); cue("pop", T.all + i * 0.08); });
  cue("blip", T.chat5); cue("strike", T.isnt); cue("zipdown", T.them2);
  const D1 = "chat_id is NOT an input", D2 = "it is derived server-side", D3 = "from source_turn_id.";
  const DT1 = T.desc, DT2 = T.why, DT3 = T.why + 0.75, DCPS = 36;
  [[D1, DT1], [D2, DT2], [D3, DT3]].forEach(([s, t0]) => [...s].forEach((ch, i) => ch.trim() && cue("type", t0 + i / DCPS)));
  cue("draw", T.derived, { d: 0.4 });
  cue("whoosh", 50.6, { d: 0.8 }); cue("blip", T.wont + 0.1); cue("blip", T.wont + 0.55); cue("pop", T.picked);
  cue("whoosh", T.it6 - 0.05, { d: 0.9 }); cue("stamp", T.thing); cue("whoosh", T.thing + 0.15, { d: 0.6 }); cue("land", T.thing + 0.85); cue("thud", T.wrong3);
  cue("whoosh", T.let, { d: 1.6 }); cue("stamp", T.decide);

  await document.fonts.ready;
  const { renderer, scene, cam, ramp, toon } = stage(canvas, { fog: [26, 110] });

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

  // ---------- the record wall of workspace A ----------
  const WALL_H = ROWS * CH, WALL_YC = FLOOR + WALL_H / 2;
  const wallBack = new THREE.Mesh(new THREE.PlaneGeometry(COLS * CW + 0.6, WALL_H + 0.5), new THREE.MeshBasicMaterial({ color: "#10161f" }));
  wallBack.position.set(0, WALL_YC, WALL_Z - 0.35); scene.add(wallBack);
  const DRW = new RoundedBoxGeometry(0.9, 0.62, 0.6, 2, 0.04);
  const drawerMat = toon("#1a2433");
  const cells = []; for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!special(c, r)) cells.push([c, r]);
  const cellIx = {}; cells.forEach(([c, r], i) => (cellIx[c + "," + r] = i));
  const drawers = new THREE.InstancedMesh(DRW, drawerMat, cells.length); scene.add(drawers);
  const dummy = new THREE.Object3D(), BASE = new THREE.Color("#1a2433"), AMBER = new THREE.Color("#d6a45a"), GREEN = new THREE.Color("#6ad08a"), tmpC = new THREE.Color();
  cells.forEach(([c, r], i) => { dummy.position.copy(cellPos(c, r)); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(1); dummy.updateMatrix(); drawers.setMatrixAt(i, dummy.matrix); drawers.setColorAt(i, BASE); });
  const chatNo = (c, r) => 10 + Math.floor(hash(c * 31 + r * 7 + 3) * 90);
  // every drawer's label on one sheet just in front of the drawer faces (the three special drawers carry their own)
  const labels = panel(COLS * CW, WALL_H, 200, (g, W, H) => {
    g.font = "600 34px 'IBM Plex Mono', monospace"; g.textAlign = "center"; g.textBaseline = "middle";
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (special(c, r)) continue;
      const x = (c + 0.5) * CW * 200, y = H - (r + 0.5) * CH * 200;
      g.fillStyle = "#4b5666"; g.fillText("chat_" + chatNo(c, r), x, y - 18);
      g.fillStyle = "#2f3b4d"; rr(g, x - 34, y + 22, 68, 12, 6); g.fill();
    }
  });
  labels.set({}); labels.mesh.position.set(0, WALL_YC, FRONT_Z + 0.006); scene.add(labels.mesh);
  const header = panel(6.0, 1.0, 200, (g, W, H) => {
    g.font = "600 120px 'IBM Plex Mono', monospace"; g.textBaseline = "middle"; g.textAlign = "left";
    const a = "workspace ", wa = g.measureText(a).width, wb = g.measureText("A").width, x0 = (W - wa - wb) / 2;
    g.fillStyle = "#4f93d6"; g.fillText(a, x0, H / 2 + 6); g.fillStyle = "#6ad08a"; g.fillText("A", x0 + wa, H / 2 + 6);
  });
  header.set({}); header.mesh.position.set(0, FLOOR + WALL_H + 0.75, WALL_Z - 0.2); scene.add(header.mesh);

  // the three drawers that move: chat_7 (holds the message), chat_9 (the wrong guess), and the envelope's drawer
  const bigDrawer = (p, name) => {
    const g = new THREE.Group(); g.position.copy(p); scene.add(g);
    const mat = toon("#1a2433"); const body = new THREE.Mesh(DRW, mat); g.add(body);
    const lab = panel(0.9, 0.62, 200, (gg, W, H, s) => {
      gg.font = "600 34px 'IBM Plex Mono', monospace"; gg.textAlign = "center"; gg.textBaseline = "middle";
      gg.fillStyle = s.hi ? "#eef2f6" : "#4b5666"; gg.fillText(name, W / 2, H / 2 - 18);
      gg.fillStyle = "#2f3b4d"; rr(gg, W / 2 - 34, H / 2 + 22, 68, 12, 6); gg.fill();
      if (s.x) { gg.strokeStyle = "#e0675a"; gg.lineWidth = 14; gg.lineCap = "round"; gg.beginPath(); gg.moveTo(W / 2 - 40, H / 2 - 40); gg.lineTo(W / 2 + 40, H / 2 + 40); gg.moveTo(W / 2 + 40, H / 2 - 40); gg.lineTo(W / 2 - 40, H / 2 + 40); gg.stroke(); }
    });
    lab.set({}); lab.mesh.position.set(0, 0, 0.306); g.add(lab.mesh);
    return { g, mat, lab, base: p.clone() };
  };
  const d7 = bigDrawer(P7, "chat_7"), d9 = bigDrawer(P9, "chat_9"), dEnv = bigDrawer(PENV, "chat_" + chatNo(CENV.c, CENV.r));
  // the record that lives in chat_7
  const rec = panel(1.5, 0.46, 300, (g, W, H, s) => {
    g.fillStyle = "#0c0e11"; rr(g, 4, 4, W - 8, H - 8, 22); g.fill(); g.strokeStyle = "#4f93d6"; g.lineWidth = 8; rr(g, 6, 6, W - 12, H - 12, 20); g.stroke();
    g.font = "600 40px 'IBM Plex Mono', monospace"; g.textBaseline = "middle"; g.textAlign = "left";
    const a = "msg_481 in ", wa = g.measureText(a).width, wb = g.measureText("chat_7").width, x0 = (W - wa - wb) / 2;
    g.fillStyle = "#eef2f6"; g.fillText(a, x0, H / 2 + 2); g.fillStyle = s.hi ? "#d6a45a" : "#4f93d6"; g.fillText("chat_7", x0 + wa, H / 2 + 2);
  });
  rec.set({}); scene.add(rec.mesh);

  // ---------- the server ----------
  const server = new THREE.Group(); scene.add(server);
  const sBody = new THREE.Mesh(new RoundedBoxGeometry(3.0, 2.2, 1.4, 4, 0.12), toon("#22324a")); sBody.position.set(0, 5.7, -0.7); server.add(sBody);
  const trim = new THREE.MeshBasicMaterial({ color: "#4f93d6" });
  [[0, 6.8, 3.0, 0.05], [0, 4.6, 3.0, 0.05], [-1.5, 5.7, 0.05, 2.2], [1.5, 5.7, 0.05, 2.2]].forEach(([x, y, wx, hy]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(wx, hy, 0.05), trim); m.position.set(x, y, 0.02); server.add(m); });
  const lampMat = new THREE.MeshBasicMaterial({ color: "#2a3a55" });
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 0.04), lampMat); lamp.position.set(0, 6.62, 0.03); server.add(lamp);
  const sLabel = panel(1.6, 0.42, 260, (g, W, H) => { g.fillStyle = "#4f93d6"; g.font = "600 84px 'IBM Plex Mono', monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("server", W / 2, H / 2 + 4); });
  sLabel.set({}); sLabel.mesh.position.set(-0.55, 7.12, -0.7); server.add(sLabel.mesh);
  const badge = panel(2.7, 0.36, 300, (g, W, H, s) => {
    g.fillStyle = "#0c0e11"; rr(g, 4, 4, W - 8, H - 8, 26); g.fill(); g.strokeStyle = s.hi ? "#6ad08a" : "#4f93d6"; g.lineWidth = 8; rr(g, 6, 6, W - 12, H - 12, 24); g.stroke();
    g.font = "600 56px 'IBM Plex Mono', monospace"; g.textBaseline = "middle"; g.textAlign = "left";
    const a = "signed in: workspace ", wa = g.measureText(a).width, wb = g.measureText("A").width, x0 = (W - wa - wb) / 2;
    g.fillStyle = "#9aa6b6"; g.fillText(a, x0, H / 2 + 3); g.fillStyle = "#6ad08a"; g.fillText("A", x0 + wa, H / 2 + 3);
  });
  badge.set({}); badge.mesh.position.set(0, 4.83, 0.05); server.add(badge.mesh);
  // the stamp: knob, handle, amber head; its face points down until it swings onto a card
  const stamp = new THREE.Group(); scene.add(stamp);
  const sHead = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.2, 0.46, 2, 0.04), toon("#d6a45a")); stamp.add(sHead);
  const sHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.5, 16), toon("#2a3344")); sHandle.position.y = 0.35; stamp.add(sHandle);
  const sKnob = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 14), toon("#2a3344")); sKnob.position.y = 0.66; stamp.add(sKnob);

  // ---------- the cards ----------
  const PAD = (g, W, H) => { g.fillStyle = "#eef2f6"; rr(g, 4, 4, W - 8, H - 8, 26); g.fill(); g.fillStyle = "#dfe5ec"; rr(g, 4, 4, W - 8, 92, [26, 26, 0, 0]); g.fill(); };
  const field = (g, x, y, label, val, opt = {}) => {
    g.font = "500 40px 'IBM Plex Mono', monospace"; g.textBaseline = "middle"; g.textAlign = "left"; g.fillStyle = "#5a6472"; g.fillText(label, x, y);
    const bx = x + 190, bw = 330, bh = 70;
    g.fillStyle = opt.fill || "#ffffff"; rr(g, bx, y - bh / 2, bw, bh, 12); g.fill();
    g.strokeStyle = opt.edge || "#c3cad4"; g.lineWidth = opt.edgeW || 4; rr(g, bx, y - bh / 2, bw, bh, 12); g.stroke();
    g.font = "600 44px 'IBM Plex Mono', monospace"; g.fillStyle = opt.ink || "#1b212d"; g.fillText(val, bx + 22, y + 2);
    return [bx, bw];
  };
  const strikeLine = (g, x0, x1, y, k) => { if (k <= 0) return; g.strokeStyle = "#e0675a"; g.lineWidth = 12; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, y); g.lineTo(mix(x0, x1, k), y); g.stroke(); };
  const stampMark = (g, x, y, k, txt) => {
    if (k <= 0) return;
    g.save(); g.globalAlpha = k; g.translate(x, y); g.rotate(-0.12); g.strokeStyle = "#d6a45a"; g.lineWidth = 7; rr(g, -120, -42, 240, 84, 14); g.stroke();
    g.fillStyle = "#d6a45a"; g.font = "700 34px 'IBM Plex Mono', monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 0, 2); g.restore();
  };
  // the form Blink fills in (white: a request card)
  const formDraw = (g, W, H, s) => {
    PAD(g, W, H);
    g.font = "600 46px 'IBM Plex Mono', monospace"; g.textAlign = "left"; g.textBaseline = "middle"; g.fillStyle = "#1b212d"; g.fillText(s.head, 34, 50);
    if (s.rows > 0) field(g, 34, 160 - s.gap * 18, "message", s.msg);
    if (s.rows > 1 && s.chatA > 0) {
      g.save(); g.globalAlpha = s.chatA; const y = 270 + s.gap * 30;
      const [bx, bw] = field(g, 34, y, "chat", s.chat, s.stamped ? { fill: "#fbf1df", edge: "#d6a45a", edgeW: 6, ink: "#8a5a17" } : s.red ? { edge: "#e0675a", edgeW: 8 } : {});
      strikeLine(g, 30, bx + bw + 10, y, s.strike);
      g.restore();
      if (s.gap > 0.02) { g.save(); g.globalAlpha = s.gap; g.strokeStyle = "#e0675a"; g.lineWidth = 5; g.setLineDash([12, 12]); g.beginPath(); g.moveTo(W - 70, 195); g.lineTo(W - 70, 235 + s.gap * 10); g.stroke(); g.restore(); }
    }
    if (s.stamped) stampMark(g, W - 150, 370, 1, "FROM RECORD");
    if (s.sel) { g.strokeStyle = "#6ad08a"; g.lineWidth = 14; rr(g, 8, 8, W - 16, H - 16, 24); g.stroke(); }
  };
  const form = panel(2.3, 1.45, 300, formDraw); scene.add(form.mesh);
  const pickA = panel(2.3, 1.45, 300, formDraw), pickB = panel(2.3, 1.45, 300, formDraw); scene.add(pickA.mesh); scene.add(pickB.mesh);
  // the envelope: a request that names its own workspace
  const env = panel(2.3, 1.45, 300, (g, W, H, s) => {
    PAD(g, W, H);
    g.font = "600 46px 'IBM Plex Mono', monospace"; g.textAlign = "left"; g.textBaseline = "middle"; g.fillStyle = "#1b212d"; g.fillText("write request", 34, 50);
    g.font = "600 64px 'IBM Plex Mono', monospace"; g.fillStyle = "#1b212d"; g.fillText(s.txt, 34, 200);
    const pre = "workspace: ", x0 = 34 + g.measureText(pre).width, wb = g.measureText("B").width;
    if (s.txt.length >= pre.length + 1) { g.strokeStyle = "#e0675a"; g.lineWidth = 12; g.lineCap = "round"; if (s.strike > 0) { g.beginPath(); g.moveTo(x0 - 12, 238); g.lineTo(mix(x0 - 12, x0 + wb + 12, s.strike), mix(238, 162, s.strike)); g.stroke(); } }
    if (s.a > 0) { g.save(); g.globalAlpha = s.a; g.translate(x0 + wb + 92, 200); g.rotate(-0.12); g.strokeStyle = "#d6a45a"; g.lineWidth = 8; rr(g, -56, -56, 112, 112, 16); g.stroke(); g.fillStyle = "#d6a45a"; g.font = "700 84px 'IBM Plex Mono', monospace"; g.textAlign = "center"; g.fillText("A", 0, 4); g.restore(); }
    g.fillStyle = "#c3cad4"; [300, 344].forEach((y, i) => g.fillRect(34, y, W - 68 - i * 140, 18));
  });
  scene.add(env.mesh);
  // the stream's cards: one instanced mesh before the server (plain) and one after (stamped)
  const miniTex = (stamped) => glyphTexture(THREE, (g, W, H) => { g.fillStyle = "#eef2f6"; rr(g, 3, 3, W - 6, H - 6, 14); g.fill(); g.fillStyle = "#c3cad4"; [40, 74].forEach((y, i) => g.fillRect(20, y, W - 40 - i * 50, 12));
    g.fillStyle = stamped ? "#d6a45a" : "#c3cad4"; rr(g, 20, 104, stamped ? 110 : 80, 26, 6); g.fill(); }, 200, 140);
  const MINI = new THREE.PlaneGeometry(0.8, 0.55);
  const miniA = new THREE.InstancedMesh(MINI, new THREE.MeshBasicMaterial({ map: miniTex(false), side: THREE.DoubleSide, transparent: true }), STREAM.length);
  const miniB = new THREE.InstancedMesh(MINI, new THREE.MeshBasicMaterial({ map: miniTex(true), side: THREE.DoubleSide, transparent: true }), STREAM.length);
  [miniA, miniB].forEach((m) => { m.frustumCulled = false; scene.add(m); });

  // ---------- the receipt: write_memory's schema, out of the server's front ----------
  const FIELDS = ["type", "content", "source_turn_id", "source_session_id", "confidence", "reason"];
  const schema = panel(2.3, 3.0, 300, (g, W, H, s) => {
    g.fillStyle = "#0c0e11"; rr(g, 6, 6, W - 12, H - 12, 34); g.fill(); g.strokeStyle = "#4f93d6"; g.lineWidth = 9; rr(g, 6, 6, W - 12, H - 12, 32); g.stroke();
    g.textBaseline = "middle"; g.textAlign = "left";
    g.font = "600 52px 'IBM Plex Mono', monospace"; g.fillStyle = "#4f93d6"; g.fillText("write_memory", 44, 72);
    g.font = "500 30px 'IBM Plex Mono', monospace"; g.fillStyle = "#7b8593"; g.fillText("inputSchema", 44, 120);
    FIELDS.forEach((f, i) => {
      const a = cl(s.rows - i); if (a <= 0) return; const y = 180 + i * 70;
      g.globalAlpha = a; g.font = "600 38px 'IBM Plex Mono', monospace"; g.fillStyle = s.hi && i === 2 ? "#d6a45a" : "#eef2f6"; g.fillText(f, 44, y);
      if (s.ticks > i) { g.fillStyle = "#6ad08a"; g.font = "600 30px 'IBM Plex Mono', monospace"; g.textAlign = "right"; g.fillText("required", W - 44, y); g.textAlign = "left"; }
      g.globalAlpha = 1;
    });
    if (s.ghost > 0) {
      const y = 180 + 6 * 70; g.globalAlpha = s.ghost; g.strokeStyle = "#e0675a"; g.lineWidth = 5; g.setLineDash([14, 10]); rr(g, 30, y - 30, W - 60, 60, 12); g.stroke(); g.setLineDash([]);
      g.font = "600 38px 'IBM Plex Mono', monospace"; g.fillStyle = "#e0675a"; g.fillText("chat_id", 44, y);
      if (s.gs > 0) { g.lineWidth = 8; g.lineCap = "round"; g.beginPath(); g.moveTo(36, y); g.lineTo(mix(36, W - 36, s.gs), y); g.stroke(); }
      g.globalAlpha = 1;
    }
    g.font = "500 34px 'IBM Plex Mono', monospace";
    [s.d1, s.d2, s.d3].forEach((ln, i) => { g.fillStyle = i === 2 && s.hi ? "#d6a45a" : "#9aa6b6"; g.fillText(ln, 44, 690 + i * 56); });
  });
  schema.mesh.position.set(0, 5.6, 1.0); scene.add(schema.mesh);

  // ---------- the two threads: both ids, one writer ----------
  const threadMat = new THREE.MeshBasicMaterial({ color: "#6ad08a", transparent: true });
  let threads = [];

  // ---------- helpers ----------
  const camQ = new THREE.Quaternion();
  const bez = (a, m, b, k) => { const u = 1 - k; return V(u * u * a.x + 2 * u * k * m.x + k * k * b.x, u * u * a.y + 2 * u * k * m.y + k * k * b.y, u * u * a.z + 2 * u * k * m.z + k * k * b.z); };
  const place = (p, m, s, a) => { m.visible = a > 0.002 && s > 0.002; if (!m.visible) return; m.position.copy(p); m.scale.setScalar(s); m.material.opacity = a; };
  const drawerOut = (t, spans) => { let o = 0; spans.forEach(([a, b]) => { o = Math.max(o, io(r01(t, a, 0.35)) * (1 - io(r01(t, b, 0.35)))); }); return o * 0.55; };
  // the stamp's pose: rest above the server, swinging onto the card for each slam
  // impact = the head's centre just off the card (z 0.3); the A on the envelope, FROM RECORD on the form
  const REST = V(0.85, 7.35, 0.7), stampTarget = (ts) => ts === T.out || ts === T.still ? V(0.82, 5.81, 0.41) : ts === T.decide ? V(0.4, 5.5, 0.45) : V(0.65, 5.24, 0.41);

  function render(t) {
    cameraAt(t, cam); camQ.copy(cam.quaternion);
    const bob = 0.05 * Math.sin((t / 1.7) * Math.PI * 2);
    let happy = 0, look = 0, lookY = 0, think = 0, skew = 0, eager = 0, tilt = 0, lean = 0, hop = 0, yaw = 0.12 * Math.sin((t / 3.1) * Math.PI * 2);
    const blinkK = Math.max(pulse(t, 3.2, 0.07), pulse(t, 12.9, 0.07), pulse(t, 20.9, 0.07), pulse(t, 28.9, 0.07), pulse(t, 44.2, 0.07), pulse(t, 55.0, 0.07), pulse(t, 61.0, 0.07));
    shadowMat.opacity = 0.45 - bob; shadow.scale.setScalar(1 - bob);

    // ---------- the envelope ----------
    {
      const hook = t < T.out + 1.2, a0 = T.put - 0.45;
      let p = CARD_M.clone(), s = 1, a = 0, txt = "", strike = 0, A = 0;
      if (hook) {
        a = r01(t, 0, 0.2); s = mix(0.9, 1, back(r01(t, 0, 0.4)));
        txt = typed("workspace: B", T.wrote, 13, t); // the B lands on "B"
        strike = io(r01(t, T.crossed, 0.22)); A = t >= T.out + 0.03 ? 1 : 0;
        const k = io(r01(t, T.out + 0.3, 0.6)); p.z -= 0.6 * k; s *= 1 - 0.5 * k; a *= 1 - k;
      } else if (t >= a0 && t < T.a3 + 0.4) {
        const k = io(r01(t, a0, 0.65)); p = V(0, mix(2.6, CARD_M.y, k), mix(0.6, CARD_M.z, k)); a = r01(t, a0, 0.15); txt = "workspace: B";
        strike = io(r01(t, T.the14, 0.22)); A = t >= T.still + 0.03 ? 1 : 0;
        const f = io(r01(t, T.still + 0.08, T.a3 - T.still - 0.1)); if (f > 0) { p = bez(CARD_M, V(0.2, 9.8, 1.2), slot(PENV), f); s = mix(1, 0.42, f); }
        const sink = r01(t, T.a3, 0.3); p.z -= 0.5 * sink; a *= 1 - sink;
      }
      if (t > T.out - 0.05 && t < T.out + 0.12) s *= 1 - 0.05 * pulse(t, T.out + 0.02, 0.08);
      env.set({ txt, strike: Math.round(strike * 20) / 20, a: A }); place(p, env.mesh, s, a); env.mesh.quaternion.identity();
    }

    // ---------- the form ----------
    {
      let p = FORM_DESK.clone(), s = 1, a = 0, jit = 0;
      const head = typed("write_memory", T.save, 30, t), rows = (t >= T.two ? 1 : 0) + (t >= T.ids ? 1 : 0);
      const msg = typed("msg_481", T.msg1, 18, t);
      let chat = t < T.chat1 + 0.35 ? "" : typed("chat_9", T.chat1 + 0.35, 18, t);
      const glitch = t > T.buggy && t < T.buggy + 0.6;
      if (glitch) chat = ["chat_9", "chat_2", "chat_5", "chat_4", "chat_9", "chat_3"][Math.floor((t - T.buggy) * 10) % 6];
      const gap = Math.round(io(r01(t, T.nothing, 0.35)) * (1 - r01(t, T.so, 0.3)) * 10) / 10;
      const red = t >= T.wrong1 && t < T.stops;
      const strike = Math.round(io(r01(t, T.stops, 0.25)) * 20) / 20, chatA = Math.round((1 - io(r01(t, T.asking, 0.4))) * 10) / 10;
      const stamped = t >= T.stamps + 0.02;
      a = r01(t, T.save - 0.08, 0.2); s = mix(0.85, 1, back(r01(t, T.save - 0.08, 0.35)));
      // to the wrong drawer and back
      const up = io(r01(t, T.real, T.chat2 - T.real)), down = io(r01(t, T.so, 0.8));
      if (up > 0 && down < 1) { p = bez(FORM_DESK, V(1.2, 6.4, 1.4), slot(P9), up); s = mix(1, 0.42, up); if (down > 0) { p = bez(slot(P9), V(1.0, 5.6, 1.6), FORM_DESK, down); s = mix(0.42, 1, down); } }
      // the id alone to the server, stamped, into chat_7
      const toM = io(r01(t, T.model + 0.05, T.id - T.model + 0.1)), toD = io(r01(t, T.there - 0.05, 0.7));
      if (toM > 0) { p = bez(FORM_DESK, V(0, 4.2, 1.4), CARD_M, toM); s = 1; }
      if (toD > 0) { p = bez(CARD_M, V(-0.8, 8.4, 1.0), slot(P7), toD); s = mix(1, 0.42, toD); }
      const sink = r01(t, T.there + 0.65, 0.3); p.z -= 0.5 * sink; a *= 1 - sink;
      if (t > T.stamps - 0.05 && t < T.stamps + 0.15) s *= 1 - 0.05 * pulse(t, T.stamps + 0.02, 0.08);
      p.x += jit;
      form.set(stamped ? { head, rows, msg, chat: "chat_7", gap: 0, red: false, strike: 0, chatA: 1, stamped } : { head, rows, msg, chat, gap, red, strike, chatA, stamped });
      place(p, form.mesh, s, a); form.mesh.quaternion.identity();
    }

    // ---------- the drawers that move ----------
    const o9 = drawerOut(t, [[T.lands1 + 0.3, T.so + 0.35]]); // at the end it stays shut, crossed
    const o7 = drawerOut(t, [[T.records1 - 0.05, T.so - 0.4], [T.looks, T.there + 0.95], [T.thing + 0.05, T.wrong3 - 0.1]]);
    const oE = drawerOut(t, [[T.still + 0.2, T.a3 + 0.35]]);
    [[d7, o7], [d9, o9], [dEnv, oE]].forEach(([d, o]) => { d.g.position.copy(d.base); d.g.position.z += o; });
    const red9 = t >= T.chat2 && t < T.so + 0.5 ? 1 : pulse(t, T.wrong3 + 0.1, 0.5);
    d9.mat.color.copy(BASE).lerp(new THREE.Color("#6b2a26"), red9);
    d9.lab.set({ hi: red9 > 0.5, x: t >= T.wrong3 && t < T.let + 0.5 });
    const g7 = Math.max(pulse(t, T.chat3, 0.5), pulse(t, T.there + 0.65, 0.5), pulse(t, T.thing + 0.85, 0.5));
    d7.mat.color.copy(BASE).lerp(GREEN, 0.45 * g7); d7.lab.set({ hi: o7 > 0.1 || g7 > 0.3 });
    dEnv.mat.color.copy(BASE).lerp(GREEN, 0.45 * pulse(t, T.a3 + 0.1, 0.5)); dEnv.lab.set({ hi: oE > 0.1 });
    header.mesh.scale.setScalar(1 + 0.08 * Math.max(pulse(t, T.ws2 + 0.1, 0.3), pulse(t, T.a3 + 0.1, 0.3)));

    // the record: in chat_7 when it opens; in the lookup it flies down to the server
    {
      const inDrawer = V(P7.x, P7.y + 0.42, P7.z + 0.1 + o7); // stands in the open drawer, poking out of its top
      let p = inDrawer.clone(), s = 0.8, a = cl(o7 / 0.3);
      const fly = io(r01(t, T.looks + 0.5, 0.75));
      if (t > T.looks && t < T.stamps + 0.2) { p = bez(inDrawer, V(-0.6, 8.6, 1.4), V(0.3, 5.45, 0.5), fly); s = mix(0.8, 0.9, fly); a = cl(o7 / 0.3) * (1 - r01(t, T.stamps, 0.05)); }
      else if (t > T.stamps) a = 0;
      if (t > T.thing - 1 && t < T.let + 0.5) a = 0; // the last visit is only for the picked card
      rec.set({ hi: pulse(t, T.chat3, 0.4) > 0.2 || (t > T.looks + 1 && t < T.stamps) });
      place(p, rec.mesh, s, a); rec.mesh.quaternion.identity();
    }

    // the server's name fades while the camera is up at the wall (from there it is a blurred word at the frame's foot)
    sLabel.mesh.material.opacity = 1 - r01(cam.position.y, 8.2, 0.5);
    // ---------- the server's lamp and badge ----------
    const amberHit = Math.max(...STAMPS.map((x) => pulse(t, x + 0.03, 0.25)), ...STREAM.map((f) => pulse(t, f.at + 0.05, 0.08)));
    const greenHit = pulse(t, T.real + 0.55, 0.3);
    lampMat.color.set("#2a3a55").lerp(AMBER, amberHit).lerp(GREEN, greenHit);
    badge.set({ hi: pulse(t, T.signed + 0.05, 0.6) > 0.15 || pulse(t, T.ws2, 0.5) > 0.2 });
    badge.mesh.scale.setScalar(1 + 0.1 * Math.max(pulse(t, T.signed + 0.05, 0.3), pulse(t, T.still - 0.2, 0.25)));

    // ---------- the stamp ----------
    {
      let p = REST.clone(), rx = 0.3;
      STAMPS.forEach((ts) => {
        if (t < ts - 0.35 || t > ts + 0.4) return;
        const tgt = stampTarget(ts);
        const k = t < ts ? io(r01(t, ts - 0.35, 0.33)) : 1 - io(r01(t, ts + 0.08, 0.3));
        p = bez(REST, V(mix(REST.x, tgt.x, 0.5), REST.y + 0.3, tgt.z + 0.9), tgt, k); rx = mix(0.3, Math.PI / 2, k); // +90 deg about x turns the face from -y to -z, onto the card
      });
      // between slams it parks inside the server's body, so wall close-ups and the schema never show a stray handle
      const near = Math.max(0, ...STAMPS.map((ts) => io(r01(t, ts - 1.1, 0.45)) * (1 - io(r01(t, ts + 0.5, 0.45)))));
      p.y -= 1.6 * (1 - near); stamp.visible = near > 0.01;
      stamp.position.copy(p); stamp.rotation.set(rx, 0, 0);
    }

    // ---------- the crowd and the stream ----------
    crowd.forEach((c, i) => {
      // in for the mass moment, out before the badge shot, back for the end
      const k = t < T.let ? back(r01(t, c.s0, 0.4)) * (1 - io(r01(t, T.signed - 0.4, 0.35))) : back(r01(t, T.let + 0.1 + 0.06 * i, 0.4));
      c.g.visible = k > 0.01; c.sh.visible = c.g.visible;
      c.g.scale.setScalar(Math.max(0.01, 0.85 * k)); c.g.position.set(c.x, 0.04 * Math.sin(t * 3.4 + i * 1.3) - 0.15, c.z);
      c.g.rotation.set(0, 0.25 * Math.sin(t * 0.9 + i), 0);
      c.b.face({ blink: pulse(t, c.s0 + 2.1 + i * 0.4, 0.07), happy: 0.6 * r01(t, c.s0 + 1.0, 0.3), lookY: 1.0, phase: t });
      c.sh.scale.setScalar(0.85 * k);
    });
    const flash = new Map();
    STREAM.forEach((f, j) => {
      let pA = null, pB = null, sc = 0.9;
      if (t >= f.s && t < f.at) { pA = bez(f.src, V(f.src.x * 0.5, 3.6, 1.6), V(CARD_M.x + f.jx, CARD_M.y + f.jy, CARD_M.z + 0.2 + j * 0.002), io((t - f.s) / (f.at - f.s))); }
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
    cells.forEach(([c, r], i) => { const f = flash.get(c + "," + r) || 0; tmpC.copy(BASE).lerp(AMBER, f); drawers.setColorAt(i, tmpC); });
    drawers.instanceColor.needsUpdate = true;

    // ---------- the threads: both ids from one writer ----------
    threads.forEach((m) => { scene.remove(m); m.geometry.dispose(); }); threads = [];
    const th = r01(t, T.both, 0.6), thA = 1 - r01(t, T.only - 0.2, 0.3);
    threadMat.opacity = thA;
    if (th > 0.01 && thA > 0.01) {
      const a = V(0, 1.55, 0.15), card = slot(P9);
      [card.clone().add(V(0.06, 0.08, 0.05)), card.clone().add(V(0.06, -0.076, 0.05))].forEach((b, i) => {
        const mid = V(mix(a.x, b.x, 0.5) + (i ? 1.4 : 0.6), mix(a.y, b.y, 0.5), 1.6 + i * 0.6);
        const pts = new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(48).slice(0, Math.max(2, Math.ceil(49 * th)));
        const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.045, 6), threadMat); scene.add(m); threads.push(m);
      });
    }

    // ---------- the schema ----------
    {
      const k = io(r01(t, T.one3, 0.5)), out = io(r01(t, 50.45, 0.35)), a = cl(k * 1.4) * (1 - out);
      const rows = Math.round(cl((t - (T.fields - 0.85)) / 0.9) * 60) / 10; // six rows in 0.9 s, each fading in
      const ticks = t < T.all ? 0 : Math.min(6, Math.floor((t - T.all) / 0.08) + 1);
      const ghost = Math.round(r01(t, T.chat5 - 0.05, 0.2) * (1 - r01(t, T.them2, 0.3)) * 10) / 10, gs = Math.round(io(r01(t, T.isnt, 0.25)) * 20) / 20;
      schema.set({ rows, ticks, ghost, gs, d1: typed("chat_id is NOT an input", T.desc, 36, t), d2: typed("it is derived server-side", T.why, 36, t), d3: typed("from source_turn_id.", T.why + 0.75, 36, t), hi: t >= T.derived });
      const p = V(0, mix(5.7, 5.6, k), mix(-0.2, 1.0, k) - 1.2 * out);
      place(p, schema.mesh, mix(0.4, 1, k) * (1 - 0.5 * out), a); schema.mesh.quaternion.identity();
    }

    // ---------- the choice: two messages over Blink; the picked one goes through the server ----------
    {
      const a0 = r01(t, 50.9, 0.3);
      const sel = t >= T.picked, stamped = t >= T.thing + 0.02;
      let pA = V(-0.62, 2.35, 0.4), sA = 0.5, aA = a0, pB = V(0.62, 2.35, 0.4), aB = a0 * (1 - r01(t, T.right, 0.3));
      pA.y += 0.2 * io(r01(t, T.picked, 0.3)); sA *= 1 + 0.1 * pulse(t, T.picked + 0.05, 0.15);
      const toM = io(r01(t, T.it6, T.thing - T.it6 - 0.05)), toD = io(r01(t, T.thing + 0.15, 0.7));
      if (toM > 0) { pA = bez(V(-0.62, 2.55, 0.4), V(-0.4, 4.2, 1.4), CARD_M, toM); sA = mix(0.5, 1, toM); }
      if (toD > 0) { pA = bez(CARD_M, V(-0.8, 8.4, 1.0), slot(P7), toD); sA = mix(1, 0.42, toD); }
      aA *= 1 - r01(t, T.thing + 0.85, 0.3); if (toD >= 1) pA.z -= 0.5 * r01(t, T.thing + 0.85, 0.3);
      pickA.set({ head: "write_memory", rows: 2, msg: "msg_481", chat: "chat_7", gap: 0, red: false, strike: 0, chatA: stamped ? 1 : 0, stamped, sel });
      pickB.set({ head: "write_memory", rows: 1, msg: "msg_482", chat: "", gap: 0, red: false, strike: 0, chatA: 0, stamped: false });
      place(pA, pickA.mesh, sA, aA); place(pB, pickB.mesh, 0.5, aB);
      pickA.mesh.quaternion.identity(); pickB.mesh.quaternion.identity();
      if (t < 50.8 || t > T.thing + 1.3) { pickA.mesh.visible = false; pickB.mesh.visible = false; }
    }

    // ---------- Blink's face ----------
    if (t < T.save) { lookY = 1.0; }
    else if (t < T.chat1 - 0.4) { lookY = 1.15; look = 0.1; }
    else if (t < T.chat1 + 0.35) { think = io(r01(t, T.chat1 - 0.4, 0.1)) * (1 - io(r01(t, T.chat1 + 0.25, 0.1))); lookY = 0.8; }
    else if (t < T.wrong1) { lookY = 1.1; happy = 0.5 * r01(t, T.chat1 + 0.5, 0.2); }
    else if (t < T.real) { lookY = 0.9; skew = 0.6 * r01(t, T.wrong1, 0.15); look = -0.3; }
    else if (t < T.so) { lookY = 1.4; look = 0.4; }
    else if (t < T.model) { lookY = 1.2; eager = 0.5 * pulse(t, T.stops + 0.1, 0.5); }
    else if (t < 50.9) { lookY = 1.4; happy = 0.6 * r01(t, T.model + 0.3, 0.2); }
    else if (t < T.picked) { // looking from one message to the other
      think = 0; look = t < T.wont + 0.5 ? -0.9 : 0.9; lookY = 1.1; skew = 0.3 * look;
    }
    else if (t < T.let) { look = -0.6 * (1 - r01(t, T.it6, 0.4)); lookY = 1.2; eager = 0.6 * pulse(t, T.picked + 0.2, 0.6); }
    else { happy = r01(t, T.choose, 0.15); lookY = 0.6; }
    blink.root.rotation.set(lean, yaw, tilt); rig.position.y = bob + hop;
    blink.face({ blink: blinkK, happy, look, lookY, think, skew, eager, phase: t * 1.6 });
    renderer.render(scene, cam);
  }
  return render;
}

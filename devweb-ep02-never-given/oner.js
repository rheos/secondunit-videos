// devweb ep 2, draft 1: "The model can't leak what it was never given". One Three.js world, one continuous camera
// (the standard since ep 1 draft 4). Blink sits in its room (the context window); a conveyor carries the corpus in
// from a hopper. First the belt runs straight into the room, a private file gets in and Blink leaks it. Then a gate
// rises on the belt (the loader), reads each file's audience tag against the role badge and kicks what the role
// can't see into a bin. Mass moment: a flood of files, the private ones peeling off at the gate. Everything is a pure
// function of film time t (HyperFrames seeks frames in any order).
import * as THREE from "three";
import { makeBlink, glyphTexture } from "./kit/blink3d.js";
import { cl, io, back, r01, mix, V, pulse, typed, cameraPath, panel, rr, stage } from "./kit/world.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const VO = window.VO, G = window.BLINK;
const w = (x, n) => VO.w(x, n), e = (x, n) => VO.e(x, n);

// ---------- the beats, all on Chris's words ----------
export const T = {
  is: w("is"), guar: e("guarantee"), by: w("by"), reads: w("reads"), already: w("already"), secret: w("secret"),
  ask: w("ask"), sums: w("sums"), very: w("very"), file1: e("file"), keep: w("keep"), quiet: e("quiet"),
  rule2: w("rule", 2), request: w("request"), context: w("context"), fact: w("fact"),
  so: w("so"), door: w("door"), every: w("every"), forW: e("for"), loader: w("loader"), asking: w("asking"), drops: w("drops"),
  thats: w("that's"), load: w("load"), role: w("role"), label: w("label"), priv: w("private"), hiding: w("hiding"), edit: w("edit"),
  sharing: w("sharing"), undone: e("undone"), ask2: w("ask", 2), says2: w("says", 2), i: w("i"), model3: w("model", 3), given: e("given"), END: VO.END,
};

// ---------- the layout ----------
const BX = 1.6, BELT_Y = -0.95, HOP_Z = -24.6, WALL_Z = -2.8, GATE_Z = -14, KZ = -13.3, RIM = -0.72, FLOOR = -1.72;
const BIN = V(BX + 2.5, FLOOR, -12.6);
const NOTE = V(0, 2.25, 0.3), HERO = V(1.12, 1.15, 1.35), ANS = V(0.05, 3.2, 0.5), ASK = V(0.05, 4.05, 0.2);

// ---------- the belt: distance travelled as a pure function of t (speed table integrated once) ----------
const SPEEDS = [[0, 0.9], [T.so + 0.3, 0.9], [T.so + 0.6, 1.0], [T.drops - 0.04, 1.0], [T.drops + 0.46, 7.5], [T.drops + 5.56, 7.5], [T.drops + 6.16, 1.0],
  [T.ask2 - 0.74, 1.0], [T.ask2 - 0.24, 5.2], [T.says2 - 0.24, 5.2], [T.says2 + 0.36, 0.8], [999, 0.8]];
const speedAt = (t) => { for (let i = 0; i < SPEEDS.length - 1; i++) { const [a, va] = SPEEDS[i], [b, vb] = SPEEDS[i + 1]; if (t < b) return mix(va, vb, cl((t - a) / Math.max(1e-6, b - a))); } return 0.8; };
const HZ = 240, NT = Math.ceil((T.END + 2) * HZ), Dtab = new Float64Array(NT + 2);
for (let i = 0; i <= NT; i++) Dtab[i + 1] = Dtab[i] + speedAt((i + 0.5) / HZ) / HZ;
const D = (t) => { const x = Math.max(0, Math.min(NT, t * HZ)), i = Math.floor(x); return mix(Dtab[i], Dtab[i + 1], x - i); };
const tOfD = (d) => { let lo = 0, hi = NT; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (Dtab[m] < d) lo = m; else hi = m; } return (lo + cl((d - Dtab[lo]) / Math.max(1e-9, Dtab[lo + 1] - Dtab[lo]))) / HZ; };
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------- the camera path: [time, position, target, fov] ----------
const KEYS = [
  // the hook: the note on its own, then pull back to Blink under it
  [0, [0.25, 2.55, 7.4], [0, 2.25, 0.3], 34],
  [1.4, [0.05, 2.32, 6.1], [0, 2.25, 0.3], 34],
  [T.guar + 0.2, [0, 2.3, 5.7], [0, 2.25, 0.3], 34],
  [T.guar + 1.3, [0.15, 1.5, 10.6], [0.05, 1.2, 0], 36],
  [T.already - 0.1, [0.2, 1.5, 10.4], [0.05, 1.2, 0], 36],
  // the private file Blink already holds
  [T.secret + 0.35, [1.3, 1.35, 8.4], [0.6, 1.15, 0.7], 36],
  [T.ask - 0.15, [1.25, 1.35, 8.3], [0.6, 1.15, 0.7], 36],
  // the sideways question and the leak: the stack (question, answer, note, Blink) framed for portrait
  [T.ask + 0.8, [0.15, 1.6, 11.1], [0.05, 1.28, 0], 36],
  [T.quiet + 0.4, [0.05, 1.6, 10.8], [0.05, 1.28, 0], 36],
  // the room, wide: everything on the belt goes in
  [T.rule2 + 1.0, [-0.4, 4.2, 15.5], [0.4, 1.5, -2.5], 38],
  [T.so - 0.05, [-0.5, 4.4, 16.1], [0.4, 1.5, -2.5], 38],
  // over Blink's shoulder down the belt as the gate rises
  [T.door + 0.95, [BX + 1.0, 4.4, 2.6], [BX - 0.2, -0.6, -13.5], 38],
  [T.every - 0.15, [BX + 1.0, 4.2, 1.8], [BX - 0.2, -0.6, -13.5], 38],
  // just upstream of the gate, looking back at the files riding toward it, each with its audience tag
  [T.every + 0.85, [BX + 2.0, 2.6, -15.4], [BX, -0.9, -19.6], 36],
  [T.forW + 0.4, [BX + 1.9, 2.5, -15.5], [BX, -0.9, -19.6], 36],
  // round to the far side: the gate checks each tag against the role badge and kicks the rest into the bin
  [T.loader + 0.75, [BX - 6.6, 3.0, -7.2], [BX + 0.9, 0.3, -13.6], 38],
  [T.drops + 0.3, [BX - 6.4, 3.1, -7.0], [BX + 0.9, 0.3, -13.6], 38],
  // the mass moment: crane high over the whole line as the flood pours through
  [T.drops + 1.6, [0.4, 11.5, 4.5], [BX - 0.2, -1.5, -14.2], 40],
  [T.thats + 0.35, [0.4, 12.0, 5.0], [BX - 0.2, -1.5, -14.2], 40],
  // the receipt beside the gate
  [T.load - 0.25, [BX - 0.9, 5.2, -2.0], [BX - 1.5, -0.4, -12.8], 38],
  [T.role + 0.35, [BX - 1.0, 5.1, -2.2], [BX - 1.5, -0.4, -12.8], 38],
  // the file with no label: the gate holds it, stamps it private, bins it; one edit brings it back
  [T.label - 0.25, [BX - 6.2, 2.8, -7.6], [BX + 0.8, 0.0, -13.6], 38],
  [T.hiding - 0.3, [BX - 6.4, 2.9, -7.4], [BX + 0.8, 0.2, -13.6], 38],
  [T.edit + 0.8, [BX - 6.8, 3.2, -7.0], [BX + 0.8, 1.0, -13.4], 38],
  [T.ask2 - 0.69, [BX + 3.2, 2.6, -7.4], [BX + 0.1, -0.5, -11.6], 38],
  // ride with it to the room
  [T.ask2 + 1.11, [BX + 2.4, 3.6, 6.2], [BX - 0.8, -0.3, -4.0], 38],
  [T.says2 + 0.05, [0.15, 1.6, 11.1], [0.05, 1.28, 0], 36],
  [T.model3 - 0.2, [0.1, 1.6, 11.3], [0.05, 1.28, 0], 36],
  [T.given + 0.3, [0.1, 1.6, 11.6], [0.05, 1.28, 0], 36],
  // the end frame: crane up from Blink to the whole line, hopper at the top, the room at the bottom
  [T.given + 1.9, [0.2, 15.5, 14.5], [BX - 0.5, -1.5, -9.4], 40],
  [T.END, [0.2, 16.0, 15.0], [BX - 0.5, -1.5, -9.4], 40],
];
const cameraAt = cameraPath(KEYS);

// ---------- the files ----------
const KIND = { g: { tag: "shared", col: "#6ad08a", ink: "#0d1117" }, r: { tag: "internal", col: "#e0675a", ink: "#ffffff" }, q: { tag: "?", col: "#7b8593", ink: "#ffffff" } };
const NAMES = { g: ["roadmap.md", "faq.md", "readme.md", "changelog.md", "style-guide.md", "pricing.md"], r: ["salaries.md", "board-notes.md", "contracts.md", "incident.md"] };
const SPARSE_PAT = ["r", "g", "g", "r", "g", "g", "r", "g"]; // k = 0 is the file kicked on "drops"
const tKick0 = T.drops + 0.05, zRef = KZ - D(tKick0), GATE_ON = T.door + 0.55;
// the file with no label: reaches the gate on "label", held, stamped private, binned; one edit puts it back on the belt
const Q = { atGate: T.label - 0.05, kick: T.priv + 0.12, hop: T.edit - 0.05, back: T.edit + 0.45, BACK_Z: -12.3 };
Q.z0 = GATE_Z - D(Q.atGate);
const QLAND = V(BIN.x - 0.2, RIM - 0.3, BIN.z + 0.1);

export async function buildWorld(canvas) {
  // the plan of every belt file, computed before any await (cues.mjs reads the cues)
  const docs = [];
  const kMin = Math.floor((HOP_Z - D(T.END) - zRef) / 1.6), kMax = Math.floor((WALL_Z + 0.4 - zRef) / 1.6);
  for (let k = kMin; k <= kMax; k++) {
    const kind = SPARSE_PAT[((k % 8) + 8) % 8], z0 = zRef + 1.6 * k;
    const tk = tOfD(KZ - z0);
    const kick = kind === "r" && tk > GATE_ON ? tk : Infinity;
    docs.push({ k, kind, z0, tGate: tOfD(GATE_Z - z0), kick, name: NAMES[kind][((k % NAMES[kind].length) + NAMES[kind].length) % NAMES[kind].length],
      jx: (hash(k) - 0.5) * 0.18, yaw: (hash(k + 9) - 0.5) * 0.3, lx: BIN.x + (hash(k + 3) - 0.5) * 1.2, lz: BIN.z + (hash(k + 5) - 0.5) * 1.2, ly: RIM - 0.2 - hash(k + 7) * 0.35, spin: hash(k + 11) < 0.5 ? -1 : 1 });
  }
  // the no-label file's z on the belt (null while it is held, flying or binned)
  const qz = (t) => t < Q.atGate ? Q.z0 + D(t) : t < Q.kick ? GATE_Z : t < Q.back ? null : Q.BACK_Z + D(t) - D(Q.back);
  const onBelt = (d, t) => { const z = d.z0 + D(t); return z >= HOP_Z && z <= WALL_Z && t < d.kick ? z : null; };
  // drop belt files that would run into it while it waits at the gate or rides back to the room
  for (let i = docs.length - 1; i >= 0; i--) {
    for (let t = Q.atGate - 2; t < T.says2 + 0.1; t += 0.04) { const a = qz(t), b = onBelt(docs[i], t); if (a !== null && b !== null && Math.abs(a - b) < 1.05) { docs.splice(i, 1); break; } }
  }
  // the flood: files pour out of the hopper at seven units a second
  const flood = [];
  const FN = 190, F0 = T.drops + 0.1, F1 = T.drops + 2.9;
  for (let j = 0; j < FN; j++) {
    const s = F0 + (j + hash(j + 101) * 0.8) * ((F1 - F0) / FN), kind = hash(j + 202) < 0.47 ? "r" : "g", d0 = D(s);
    flood.push({ s, kind, d0, kick: kind === "r" ? tOfD(KZ - HOP_Z + d0) : Infinity, jx: (hash(j + 303) - 0.5) * 0.62, yaw: (hash(j + 404) - 0.5) * 0.6,
      lx: BIN.x + (hash(j + 505) - 0.5) * 1.5, lz: BIN.z + (hash(j + 606) - 0.5) * 1.5, ly: RIM - 0.2 - hash(j + 707) * 0.4, spin: hash(j + 808) < 0.5 ? -1 : 1 });
  }

  // ---------- sound cues (times only; reported before any await so cues.mjs sees them) ----------
  const cue = (k, t, extra) => window.BP.CUES.push(Object.assign({ k, t: +t.toFixed(3) }, extra || {}));
  const ASKQ = "Ballpark, what do we pay?";
  cue("land", 0.32); cue("whoosh", T.guar + 0.15, { d: 1.1 }); cue("tick", T.reads);
  cue("slide", T.already, { d: 0.55 }); cue("blip", T.secret);
  cue("pop", T.ask - 0.1); [...ASKQ].forEach((ch, i) => ch !== " " && cue("type", T.ask + i / 24));
  cue("zip", T.sums - 0.05); cue("pop", T.sums + 0.3); cue("draw", T.very, { d: 0.4 }); cue("strike", T.file1);
  cue("tick", T.keep + 0.1); cue("slide", T.keep + 0.12, { d: 0.45 });
  cue("whoosh", T.rule2 - 0.1, { d: 1.1 });
  cue("whoosh", T.so, { d: 0.7 }); cue("riser", T.door - 0.45, { d: 0.45 }); cue("land", T.door + 0.38); cue("whoosh", T.door + 0.1, { d: 0.85 });
  cue("whoosh", T.every - 0.15, { d: 1.0 }); cue("whoosh", T.loader - 0.05, { d: 0.8 }); cue("blip", T.asking);
  docs.forEach((d) => {
    const inQuiet = (x) => (x > GATE_ON && x < T.drops + 0.4) || (x > T.thats + 1.2 && x < T.ask2 - 0.4);
    if (inQuiet(d.tGate)) cue("tick", d.tGate);
    if (inQuiet(d.kick)) { cue("swipe", d.kick); cue("thud", d.kick + 0.55); }
  });
  cue("whoosh", T.drops + 0.3, { d: 1.3 }); cue("draw", T.drops + 0.6, { d: 3.2 });
  flood.forEach((f, j) => { if (f.kind === "r" && j % 6 === 0) cue("land", f.kick + 0.55); });
  cue("whoosh", T.thats - 0.1, { d: 1.2 });
  const SIG = "load_context(\n  corpus_root,\n  role)", SIG_CPS = 20, SIG_T0 = T.role - SIG.indexOf("role") / SIG_CPS;
  [...SIG].forEach((ch, i) => ch.trim() && cue("type", SIG_T0 + i / SIG_CPS)); cue("blip", T.role + 0.05);
  cue("whoosh", T.label - 0.3, { d: 0.9 }); cue("tick", Q.atGate + 0.1); cue("blip", Q.atGate + 0.45);
  cue("stamp", T.priv); cue("swipe", Q.kick); cue("thud", Q.kick + 0.55);
  cue("zip", Q.hop); cue("ding", T.edit + 0.05); cue("land", Q.back);
  cue("whoosh", T.ask2 - 0.64, { d: 1.8 });
  cue("pop", T.says2 - 0.75); [...ASKQ].forEach((ch, i) => ch !== " " && cue("type", T.says2 - 0.7 + i / 40));
  cue("pop", T.i - 0.05); cue("blip", T.i + 0.3);
  cue("whoosh", T.given + 0.3, { d: 1.1 }); cue("sting", T.given + 1.35);

  await document.fonts.ready;
  const { renderer, scene, cam, ramp, toon } = stage(canvas, { fog: [22, 95] });

  // ---------- Blink ----------
  const rig = new THREE.Group(); scene.add(rig);
  const blink = makeBlink(THREE, G, ramp); rig.add(blink.root);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: "#000", transparent: true, opacity: 0.45, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.7; scene.add(shadow);

  // ---------- the room: a floor pad, a frame of green edges, "context" over the door the belt comes through ----------
  const room = new THREE.Group(); scene.add(room);
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 5.6), new THREE.MeshBasicMaterial({ color: "#121a24" }));
  pad.rotation.x = -Math.PI / 2; pad.position.set(0, FLOOR + 0.004, -0.1); room.add(pad);
  const edgeMat = new THREE.MeshBasicMaterial({ color: "#6ad08a", transparent: true, opacity: 0.55 });
  const bar = (a, b, r = 0.025) => { const d = b.clone().sub(a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 8), edgeMat); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); room.add(m); };
  const X0 = -3.1, X1 = 3.1, ZB = WALL_Z, ZF = 2.6, TOP = 3.0;
  [[X0, ZB], [X1, ZB]].forEach(([x, z]) => bar(V(x, FLOOR, z), V(x, TOP, z)));
  bar(V(X0, FLOOR, ZB), V(X0, FLOOR, ZF)); bar(V(X1, FLOOR, ZB), V(X1, FLOOR, ZF)); bar(V(X0, FLOOR, ZF), V(X1, FLOOR, ZF));
  const wallMat = new THREE.MeshBasicMaterial({ color: "#6ad08a", transparent: true, opacity: 0.05, depthWrite: false, side: THREE.DoubleSide });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, TOP - FLOOR), wallMat); wall.position.set(0, (TOP + FLOOR) / 2, ZB); room.add(wall);
  const ctxLabel = panel(1.8, 0.36, 260, (g, W, H) => { g.fillStyle = "#6ad08a"; g.font = "600 64px 'IBM Plex Mono', monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("context", W / 2, H / 2 + 2); });
  ctxLabel.set({}); ctxLabel.mesh.rotation.x = -Math.PI / 2; ctxLabel.mesh.position.set(-1.9, FLOOR + 0.01, 2.1); room.add(ctxLabel.mesh);

  // ---------- the belt, the hopper it starts in, its stripes ----------
  const line = new THREE.Group(); scene.add(line);
  const BL = WALL_Z + 0.3 - (HOP_Z - 0.6), BZ = (WALL_Z + 0.3 + HOP_Z - 0.6) / 2;
  const stripeTex = glyphTexture(THREE, (g, W, H) => { g.fillStyle = "#1a2230"; g.fillRect(0, 0, W, H); g.fillStyle = "#232d3d"; for (let i = 0; i < 8; i++) g.fillRect(0, i * (H / 8), W, H / 16); }, 64, 256);
  stripeTex.wrapS = stripeTex.wrapT = THREE.RepeatWrapping; stripeTex.repeat.set(1, BL / 2);
  const beltTop = new THREE.Mesh(new THREE.PlaneGeometry(1.3, BL), new THREE.MeshBasicMaterial({ map: stripeTex }));
  beltTop.rotation.x = -Math.PI / 2; beltTop.position.set(BX, BELT_Y, BZ); line.add(beltTop);
  const frameMat = toon("#2a3344");
  [-0.7, 0.7].forEach((dx) => { const s = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, BL), frameMat); s.position.set(BX + dx, BELT_Y - 0.06, BZ); line.add(s);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, BL), new THREE.MeshBasicMaterial({ color: "#4f93d6" })); rail.position.set(BX + dx, BELT_Y + 0.06, BZ); line.add(rail); });
  for (let z = HOP_Z; z < WALL_Z; z += 2.4) [-0.62, 0.62].forEach((dx) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.08, BELT_Y - FLOOR, 0.08), frameMat); l.position.set(BX + dx, (BELT_Y + FLOOR) / 2 - 0.1, z); line.add(l); });
  const hopper = new THREE.Mesh(new RoundedBoxGeometry(2.4, 2.2, 2.4, 3, 0.08), toon("#1d2533")); hopper.position.set(BX, FLOOR + 1.1, HOP_Z - 0.9); line.add(hopper);
  const hopLabel = panel(2.0, 0.42, 260, (g, W, H) => { g.fillStyle = "#4f93d6"; rr(g, 0, 0, W, H, 20); g.fill(); g.fillStyle = "#eef2f6"; g.font = "600 70px 'IBM Plex Mono', monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("corpus/", W / 2, H / 2 + 3); });
  hopLabel.set({}); hopLabel.mesh.position.set(BX, FLOOR + 1.4, HOP_Z + 0.32); line.add(hopLabel.mesh);

  // ---------- the gate (the loader): rises out of the floor on "door" ----------
  const gate = new THREE.Group(); gate.position.set(BX, FLOOR, GATE_Z); scene.add(gate);
  const blue = toon("#4f93d6", { transparent: true });
  [-0.95, 0.95].forEach((dx) => { const p = new THREE.Mesh(new RoundedBoxGeometry(0.22, 3.1, 0.34, 3, 0.05), blue); p.position.set(dx, 1.55, 0); gate.add(p); });
  const lintel = new THREE.Mesh(new RoundedBoxGeometry(2.3, 0.34, 0.4, 3, 0.06), blue); lintel.position.set(0, 3.1, 0); gate.add(lintel);
  const scanMat = new THREE.MeshBasicMaterial({ color: "#4f93d6", transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(1.68, 2.15), scanMat); scan.position.set(0, 1.85, 0); gate.add(scan);
  const badge = panel(1.7, 0.44, 300, (g, W, H) => { g.fillStyle = "#0c0e11"; rr(g, 4, 4, W - 8, H - 8, 26); g.fill(); g.strokeStyle = "#4f93d6"; g.lineWidth = 8; rr(g, 6, 6, W - 12, H - 12, 24); g.stroke();
    g.font = "600 70px 'IBM Plex Mono', monospace"; g.textBaseline = "middle"; g.textAlign = "left"; g.fillStyle = "#9aa6b6"; const a = "role: "; const wa = g.measureText(a).width, wb = g.measureText("guest").width; const x0 = (W - wa - wb) / 2; g.fillText(a, x0, H / 2 + 3); g.fillStyle = "#eef2f6"; g.fillText("guest", x0 + wa, H / 2 + 3); });
  badge.set({}); badge.mesh.position.set(0, 3.62, 0.1); gate.add(badge.mesh);
  // the thinking dots over the no-label file
  const dotMat = new THREE.MeshBasicMaterial({ color: "#d6a45a", transparent: true });
  const dots = [-0.22, 0, 0.22].map((x) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 10), dotMat); m.position.set(x, 1.25, 0.2); gate.add(m); return m; });
  // the paddle: a door hung on the gate's left post, shut across the belt at rest (files slip under it). On each kick
  // it swings 90 degrees outward, away from the frame, to lie along the belt
  const paddle = new THREE.Group(); paddle.position.set(BX - 0.95, BELT_Y + 0.17, GATE_Z + 0.23); scene.add(paddle);
  const arm = new THREE.Mesh(new RoundedBoxGeometry(1.8, 0.2, 0.1, 2, 0.03), blue); arm.position.set(0.95, 0, 0); paddle.add(arm);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.36, 16), blue); paddle.add(hub);

  // ---------- the bin ----------
  const bin = new THREE.Group(); bin.position.copy(BIN); scene.add(bin);
  const binMat = toon("#1b212d"), rimMat = new THREE.MeshBasicMaterial({ color: "#e0675a" });
  const BH = RIM - FLOOR;
  [[0, -1, 2.0, 0.08], [0, 1, 2.0, 0.08], [-1, 0, 0.08, 2.0], [1, 0, 0.08, 2.0]].forEach(([sx, sz, wx, wz]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(wx, BH, wz), binMat); m.position.set(sx * 0.96, BH / 2, sz * 0.96); bin.add(m);
    const r = new THREE.Mesh(new THREE.BoxGeometry(wx + 0.02, 0.05, wz + 0.02), rimMat); r.position.set(sx * 0.96, BH + 0.02, sz * 0.96); bin.add(r); });
  const binLabel = panel(1.9, 0.36, 260, (g, W, H) => { g.fillStyle = "#e0675a"; g.font = "600 60px 'IBM Plex Mono', monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("not loaded", W / 2, H / 2 + 2); });
  binLabel.set({}); binLabel.mesh.position.set(0, BH * 0.5, 1.01); bin.add(binLabel.mesh);

  // ---------- the receipt: the loader's signature beside the gate ----------
  const code = panel(2.4, 1.62, 300, (g, W, H, s) => {
    g.fillStyle = "#0c0e11"; rr(g, 6, 6, W - 12, H - 12, 34); g.fill(); g.strokeStyle = "#4f93d6"; g.lineWidth = 9; rr(g, 6, 6, W - 12, H - 12, 32); g.stroke();
    g.font = "500 60px 'IBM Plex Mono', monospace"; g.textBaseline = "middle"; g.textAlign = "left";
    s.sig.split("\n").forEach((ln, i) => { const y = 92 + i * 92; g.fillStyle = "#eef2f6"; g.fillText(ln, 56, y); const at = ln.indexOf("role"); if (at >= 0) { g.fillStyle = "#4f93d6"; g.fillText("role", 56 + g.measureText(ln.slice(0, at)).width, y); } });
    if (s.c) { g.globalAlpha = s.c; g.font = "500 32px 'IBM Plex Mono', monospace"; g.fillStyle = "#7b8593"; g.fillText("# drops what this role can't see", 56, H - 70); g.globalAlpha = 1; }
  });
  code.mesh.position.set(BX - 2.1, 1.35, -12.4); code.mesh.rotation.y = 0.45; scene.add(code.mesh);

  // ---------- file textures and meshes ----------
  const texCache = {};
  const docTex = (kind, name) => {
    const key = kind + name; if (texCache[key]) return texCache[key];
    const K = KIND[kind];
    return (texCache[key] = glyphTexture(THREE, (g, W, H) => {
      g.fillStyle = "#eef2f6"; rr(g, 4, 4, W - 8, H - 8, 22); g.fill();
      g.fillStyle = K.col; rr(g, 4, 4, W - 8, 74, [22, 22, 0, 0]); g.fill();
      g.fillStyle = K.ink; g.font = `700 ${kind === "q" ? 56 : 44}px 'IBM Plex Mono', monospace`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(K.tag, W / 2, 44);
      g.fillStyle = "#1b212d"; g.font = "600 30px 'IBM Plex Mono', monospace"; g.textAlign = "left"; if (name) g.fillText(name, 24, 116);
      g.fillStyle = "#c3cad4"; [160, 196, 232, 268, 304].forEach((y, i) => g.fillRect(24, y, W - 48 - ((i * 53) % 90), 14));
    }, 256, 336));
  };
  const PAGE = new THREE.PlaneGeometry(0.62, 0.81);
  const pageMesh = (kind, name) => { const m = new THREE.Mesh(PAGE, new THREE.MeshBasicMaterial({ map: docTex(kind, name), transparent: true, side: THREE.DoubleSide })); scene.add(m); return m; };
  docs.forEach((d) => (d.mesh = pageMesh(d.kind, d.name)));
  // the flood: one instanced mesh per kind
  const inst = {};
  ["g", "r"].forEach((kind) => { const list = flood.filter((f) => f.kind === kind); const m = new THREE.InstancedMesh(PAGE, new THREE.MeshBasicMaterial({ map: docTex(kind, ""), side: THREE.DoubleSide }), list.length); m.frustumCulled = false; scene.add(m); inst[kind] = { m, list }; });
  // the no-label file: three faces, crossfaded at the stamp and at the edit
  const qMesh = { q: pageMesh("q", "draft-plan.md"), r: pageMesh("r", "draft-plan.md"), g: pageMesh("g", "draft-plan.md") };
  // the context in Blink's room: set A before the gate (one private file in it), set B after (only what the role can see)
  const SETA = [["g", "roadmap.md"], ["r", "salaries.md"], ["g", "faq.md"], ["r", "board-notes.md"], ["g", "readme.md"], ["g", "changelog.md"]].map(([k, n]) => pageMesh(k, n));
  const SETB = [["g", "roadmap.md"], ["g", "faq.md"], ["g", "readme.md"], ["g", "pricing.md"]].map(([k, n]) => pageMesh(k, n));
  const redGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glyphTexture(THREE, (g, W) => { const gr = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); gr.addColorStop(0, "rgba(255,140,120,0.85)"); gr.addColorStop(1, "rgba(224,103,90,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, W); }, 128, 128), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  redGlow.scale.setScalar(1.7); scene.add(redGlow);

  // ---------- the chat: the note, the sideways question, the leak, the honest refusal ----------
  const notePivot = new THREE.Group(); notePivot.position.set(NOTE.x - 0.85, NOTE.y + 0.475, NOTE.z); scene.add(notePivot);
  const note = panel(1.7, 0.95, 300, (g, W, H, s) => {
    g.fillStyle = "#f4efdc"; rr(g, 4, 4, W - 8, H - 8, 18); g.fill();
    g.fillStyle = "#1b212d"; g.font = "700 88px 'IBM Plex Sans', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("Don't reveal", W / 2, H * 0.4); g.fillText("secrets.", W / 2, H * 0.72);
    if (s.pin) { g.fillStyle = "#e0675a"; g.beginPath(); g.arc(46, 40, 16, 0, Math.PI * 2); g.fill(); }
  });
  note.mesh.position.set(0.85, -0.475, 0); notePivot.add(note.mesh);
  const bubble = (text) => panel(3.1, 0.62, 260, (g, W, H, s) => { g.fillStyle = "#1b212d"; rr(g, 0, 0, W, H, H / 2); g.fill(); g.fillStyle = "#eef2f6"; g.font = "500 56px 'IBM Plex Sans', sans-serif"; g.textAlign = "right"; g.textBaseline = "middle"; g.fillText(s.text, W - 52, H / 2 + 2); });
  const ask1 = bubble(), ask2 = bubble(); [ask1, ask2].forEach((b) => { b.mesh.position.copy(ASK); scene.add(b.mesh); });
  const leak = panel(3.2, 0.62, 260, (g, W, H, s) => {
    g.fillStyle = "rgba(214,164,90,0.16)"; rr(g, 6, 6, W - 12, H - 12, H / 2); g.fill();
    g.strokeStyle = s.red ? "#e0675a" : "#d6a45a"; g.lineWidth = s.red ? 12 : 8; rr(g, 6, 6, W - 12, H - 12, H / 2); g.stroke();
    g.fillStyle = "#fff3df"; g.font = "500 50px 'IBM Plex Sans', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("About $90-140k (salaries.md)", W / 2, H / 2 + 2);
  });
  scene.add(leak.mesh);
  const nope = panel(2.7, 0.62, 260, (g, W, H) => {
    g.fillStyle = "rgba(106,208,138,0.12)"; rr(g, 6, 6, W - 12, H - 12, H / 2); g.fill(); g.strokeStyle = "rgba(106,208,138,0.75)"; g.lineWidth = 8; rr(g, 6, 6, W - 12, H - 12, H / 2); g.stroke();
    g.fillStyle = "#eef2f6"; g.font = "500 54px 'IBM Plex Sans', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("I don't have that.", W / 2, H / 2 + 2);
  });
  nope.set({}); nope.mesh.position.copy(ANS); scene.add(nope.mesh);
  // the red thread from the private file to the answer it leaked into
  const threadMat = new THREE.MeshBasicMaterial({ color: "#e0675a", transparent: true });
  let thread = null;

  // ---------- the frame at time t ----------
  const visorFront = V(0, 0.25, 1.1);
  const lerpV = (a, b, k) => a.clone().lerp(b, k);
  const dummy = new THREE.Object3D();
  const camQ = new THREE.Quaternion();
  const kickPose = (o, x0, z0, k, f) => { // a file leaving the belt in an arc into the bin
    o.position.set(mix(x0, f.lx, k), mix(BELT_Y + 0.02, f.ly, k) + 3.2 * k * (1 - k), mix(z0, f.lz, k));
    o.rotation.set(-Math.PI / 2 + f.spin * 4.0 * k * (1 - k), 0.5 * f.spin * Math.sin(Math.PI * k), f.yaw + f.spin * 1.6 * k);
  };
  const beltPose = (o, z, f) => { o.position.set(BX + f.jx, BELT_Y + 0.015, z); o.rotation.set(-Math.PI / 2, 0, f.yaw); };
  const orbitPos = (i, n, t) => { const a = (2 * Math.PI * i) / n + 0.45 * t; return V(1.95 * Math.cos(a), 0.35 - 0.95 * Math.sin(a) + 0.08 * Math.sin(2 * a + i), 1.45 * Math.sin(a)); };

  function render(t) {
    cameraAt(t, cam); camQ.copy(cam.quaternion);
    const bob = 0.05 * Math.sin((t / 1.7) * Math.PI * 2);
    let happy = 0, blinkK = 0, look = 0, lookY = 0, think = 0, yaw = 0.12 * Math.sin((t / 3.1) * Math.PI * 2);
    rig.position.set(0, bob, 0);
    shadow.material.opacity = 0.45 - bob; shadow.scale.setScalar(1 - bob);
    blinkK = Math.max(pulse(t, T.is - 0.6, 0.07), pulse(t, T.rule2 - 0.4, 0.07), pulse(t, T.thats + 1.4, 0.07), pulse(t, T.model3 + 1.1, 0.07), pulse(t, T.given + 2.4, 0.07));

    // the belt runs the whole film
    stripeTex.offset.y = -(D(t) / 2) % 1;

    // the note: pinned over Blink, then its pin pops on "keep quiet" and it swings loose
    const loose = t >= T.keep + 0.1, u = t - (T.keep + 0.1);
    notePivot.rotation.z = loose ? -0.42 * back(cl(u / 0.45)) + 0.07 * Math.sin(u * 9) * Math.exp(-u * 3) : 0;
    note.set({ pin: !loose });
    const land = back(r01(t, 0, 0.4)); notePivot.scale.setScalar(mix(1.08, 1, land)); notePivot.position.y = NOTE.y + 0.475 + 0.18 * (1 - land);
    const noteA = 1 - r01(t, T.so - 0.1, 0.45);
    note.mesh.material.opacity = noteA; note.mesh.visible = noteA > 0;

    // set A: the context before the gate. The private file steps out of the orbit on "already" and comes back on "rule"
    const aA = r01(t, T.guar + 0.25, 0.6) * (1 - r01(t, T.so, 0.5)); // in after the hook line, so nothing sits behind it
    SETA.forEach((m, i) => {
      m.visible = aA > 0.001; if (!m.visible) return;
      let p = orbitPos(i, SETA.length, t), s = 0.85;
      if (i === 1) { const out = io(r01(t, T.already, 0.6)) * (1 - io(r01(t, T.rule2 - 0.1, 0.6))); p = lerpV(p, HERO, out); s = mix(0.85, 1.35, out); }
      const fly = io(r01(t, T.so, 0.5)); p.y += fly * 3.5; p.x *= 1 + fly * 0.6;
      m.position.copy(p); m.quaternion.copy(camQ); m.scale.setScalar(s); m.material.opacity = aA;
    });
    const glowA = r01(t, T.secret - 0.1, 0.2) * (1 - r01(t, T.rule2 - 0.2, 0.4)) * (0.75 + 0.25 * Math.sin(t * 5));
    redGlow.visible = glowA > 0.01; redGlow.material.opacity = glowA; redGlow.position.copy(SETA[1].position).add(V(0, 0, -0.05));

    // the sideways question and the leak
    const askA = r01(t, T.ask - 0.1, 0.25) * (1 - r01(t, T.rule2 - 0.2, 0.35));
    ask1.set({ text: typed(ASKQ, T.ask, 24, t) }); ask1.mesh.material.opacity = askA; ask1.mesh.visible = askA > 0; ask1.mesh.scale.setScalar(mix(0.85, 1, back(r01(t, T.ask - 0.1, 0.3))));
    const lk = io(r01(t, T.sums - 0.05, 0.45)), leakA = r01(t, T.sums - 0.05, 0.12) * (1 - r01(t, T.rule2 - 0.2, 0.35));
    leak.set({ red: t >= T.file1 }); leak.mesh.visible = leakA > 0; leak.mesh.material.opacity = leakA;
    leak.mesh.position.copy(lerpV(visorFront, ANS, lk)); leak.mesh.scale.setScalar(mix(0.25, 1, lk) * (1 + 0.06 * pulse(t, T.file1, 0.15)));
    // the thread: drawn from the private file up to the answer between "very" and "file"
    const th = r01(t, T.very - 0.05, 0.4) * (t < T.rule2 - 0.2 ? 1 : 0);
    if (thread) { scene.remove(thread); thread.geometry.dispose(); thread = null; }
    if (th > 0.01) {
      const a = SETA[1].position.clone().add(V(0, 0.42 * SETA[1].scale.x, 0)), b = ANS.clone().add(V(0.9, -0.3, 0)), mid = lerpV(a, b, 0.5).add(V(0.6, 0, 0.2));
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b), pts = curve.getPoints(40).slice(0, Math.max(2, Math.ceil(41 * th)));
      thread = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.022, 6), threadMat); scene.add(thread);
    }
    threadMat.opacity = 1 - r01(t, T.rule2 - 0.25, 0.3);

    // the gate rises on "door"
    const gk = back(r01(t, T.door - 0.3, 0.6));
    gate.visible = gk > 0.005; gate.scale.set(1, Math.max(0.01, gk), 1); blue.opacity = cl(gk * 1.5);
    paddle.visible = gate.visible; paddle.scale.setScalar(Math.max(0.01, cl(gk)));
    badge.mesh.scale.setScalar(1 + 0.14 * Math.max(pulse(t, T.asking + 0.15, 0.25), pulse(t, T.role + 0.1, 0.25)));
    badge.mesh.material.opacity = cl(gk);

    // the belt files
    let near = null, nearD = 9, kickP = 0;
    docs.forEach((d) => {
      const m = d.mesh, z = d.z0 + D(t);
      if (z < HOP_Z || (t < d.kick && z > WALL_Z + 0.25)) { m.visible = false; return; }
      m.visible = true; m.material.opacity = 1; m.scale.setScalar(1);
      if (t >= d.kick) { kickPose(m, BX + d.jx, KZ, cl((t - d.kick) / 0.55), d); return; }
      beltPose(m, z, d);
      if (z > WALL_Z - 0.35) m.scale.setScalar(Math.max(0.01, 1 - (z - (WALL_Z - 0.35)) / 0.6)); // through the door into the room
      if (Math.abs(z - GATE_Z) < nearD) { nearD = Math.abs(z - GATE_Z); near = d.kind; }
    });
    // open in 0.22 s (it meets the file as the file leaves), shut again in 0.35 s
    const swing = (k) => t < k - 0.12 ? 0 : t < k + 0.1 ? io(r01(t, k - 0.12, 0.22)) : 1 - io(r01(t, k + 0.1, 0.35));
    docs.forEach((d) => { if (d.kick < Infinity) kickP = Math.max(kickP, swing(d.kick)); });
    kickP = Math.max(kickP, swing(Q.kick)); // the no-label file leaves from the gate itself; the paddle still answers its swipe
    // the flood
    Object.values(inst).forEach(({ m, list }) => {
      list.forEach((f, j) => {
        const z = HOP_Z + D(t) - f.d0;
        if (t < f.s || (t < f.kick && z > WALL_Z + 0.25)) { dummy.scale.setScalar(0); dummy.updateMatrix(); m.setMatrixAt(j, dummy.matrix); return; }
        dummy.scale.setScalar(0.85);
        if (t >= f.kick) kickPose(dummy, BX + f.jx * 0.5, KZ, cl((t - f.kick) / 0.55), f);
        else { dummy.position.set(BX + f.jx, BELT_Y + 0.015 + (j % 3) * 0.004, z); dummy.rotation.set(-Math.PI / 2, 0, f.yaw); if (z > WALL_Z - 0.35) dummy.scale.setScalar(0.85 * Math.max(0, 1 - (z - (WALL_Z - 0.35)) / 0.6)); }
        dummy.updateMatrix(); m.setMatrixAt(j, dummy.matrix);
      });
      m.instanceMatrix.needsUpdate = true;
    });

    // the no-label file
    const qFace = t < T.priv ? "q" : t < T.edit ? "r" : "g";
    Object.values(qMesh).forEach((m) => { m.visible = false; m.scale.setScalar(1); }); // set every frame: frames render in any order
    const qm = qMesh[qFace], qf = { jx: 0, yaw: 0.06, lx: QLAND.x, lz: QLAND.z, ly: QLAND.y, spin: 1 };
    const zq = qz(t);
    const stampS = 1 + 0.25 * Math.max(pulse(t, T.priv + 0.04, 0.12), pulse(t, T.edit + 0.04, 0.12));
    let qOn = false;
    if (t < Q.kick) { if (zq >= HOP_Z) { qOn = true; beltPose(qm, zq, qf); } }
    else if (t < Q.hop) { qOn = true; kickPose(qm, BX, GATE_Z, cl((t - Q.kick) / 0.55), qf); }
    else if (t < Q.back) { qOn = true; const k = io(cl((t - Q.hop) / (Q.back - Q.hop)));
      qm.position.set(mix(QLAND.x, BX, k), mix(QLAND.y, BELT_Y + 0.02, k) + 1.8 * k * (1 - k), mix(QLAND.z, Q.BACK_Z, k)); qm.rotation.set(-Math.PI / 2 - 0.6 * Math.sin(k * Math.PI), 0, 0.06); }
    else if (zq <= WALL_Z - 0.3) { qOn = true; beltPose(qm, zq, qf); }
    else { // in through the door and up into Blink's orbit
      qOn = true; const tIn = tOfD(WALL_Z - 0.3 - Q.BACK_Z + D(Q.back));
      const k2 = io(r01(t, tIn, 0.9));
      const from = V(BX, BELT_Y + 0.02, WALL_Z - 0.3), to = orbitPos(0, 5, t);
      qm.position.copy(lerpV(from, to, k2)); qm.position.y += 0.8 * k2 * (1 - k2);
      if (k2 > 0.5) qm.quaternion.copy(camQ); else { qm.rotation.set(-Math.PI / 2 * (1 - k2 * 2), 0, 0); }
      qm.scale.setScalar(mix(1, 0.85, k2));
    }
    qm.visible = qOn; if (qOn && t > T.priv - 0.3 && t < T.edit + 0.5) qm.scale.multiplyScalar(stampS);
    if (zq !== null && Math.abs(zq - GATE_Z) < nearD) { nearD = Math.abs(zq - GATE_Z); near = qFace; }
    const thinkA = r01(t, Q.atGate + 0.3, 0.15) * (1 - r01(t, T.priv - 0.1, 0.1));
    dots.forEach((d, i) => { d.visible = thinkA > 0.02; const k = thinkA * (0.75 + 0.35 * Math.max(0, Math.sin((t * 1.6 - i * 0.18) * Math.PI * 2))); d.scale.setScalar(k); });

    // scanner and paddle
    const flooding = t > T.drops + 0.5 && t < T.thats + 0.9;
    const prox = near ? cl(1 - nearD / 0.6) : 0;
    scanMat.color.set(flooding || !near || prox === 0 ? "#4f93d6" : KIND[near].col);
    scanMat.opacity = (flooding ? 0.24 : 0.16 + 0.22 * prox) * cl(gk);
    paddle.rotation.y = -Math.PI / 2 * kickP; // 0 = shut across the belt, 1 = open along it, downstream (the flood's red files jump on their own: it can't swing 20 times a second)

    // set B: after the gate, only files this role can see
    const bA = r01(t, T.ask2 + 1.06, 0.5);
    SETB.forEach((m, i) => { m.visible = bA > 0.001; if (!m.visible) return; m.position.copy(orbitPos(i + 1, 5, t)); m.position.y -= (1 - io(bA)) * 1.2; m.quaternion.copy(camQ); m.scale.setScalar(0.85); m.material.opacity = bA; });

    // the honest answer
    const a2 = r01(t, T.says2 - 0.75, 0.25) * (1 - r01(t, T.model3 - 0.4, 0.35));
    ask2.set({ text: typed(ASKQ, T.says2 - 0.7, 40, t) }); ask2.mesh.material.opacity = a2; ask2.mesh.visible = a2 > 0; ask2.mesh.scale.setScalar(mix(0.85, 1, back(r01(t, T.says2 - 0.75, 0.3))));
    const nA = back(r01(t, T.i - 0.05, 0.35)) * (1 - r01(t, T.model3 - 0.4, 0.35));
    nope.mesh.visible = nA > 0.01; nope.mesh.scale.setScalar(Math.max(0.01, nA)); nope.mesh.material.opacity = cl(nA);

    // the code panel
    const cA = r01(t, T.load - 0.35, 0.3) * (1 - r01(t, T.label - 1.0, 0.25)); // gone before the camera swings to the gate
    code.mesh.visible = cA > 0; code.mesh.material.opacity = cA; code.mesh.scale.setScalar(mix(0.85, 1, back(r01(t, T.load - 0.35, 0.35))));
    code.set({ sig: typed(SIG, SIG_T0, SIG_CPS, t), c: Math.round(r01(t, T.role + 0.35, 0.3) * 12) / 12 }); // fades in: no one-frame pop

    // Blink's face
    if (t < T.by) { lookY = 0.9 * r01(t, 0.3, 0.4); }
    else if (t < T.already) { lookY = 1.1; }
    else if (t < T.ask - 0.1) { look = 1.0; lookY = 0.2; }
    else if (t < T.sums - 0.1) { look = 0; lookY = 1.25; }
    else if (t < T.keep) { happy = r01(t, T.sums - 0.1, 0.12); lookY = 0.4; }
    else if (t < T.rule2) { happy = 1 - r01(t, T.keep, 0.12); look = -0.6; lookY = 1.0; yaw += 0.2 * Math.sin((t - T.keep) * 14) * (1 - r01(t, T.keep + 0.2, 0.4)); }
    else if (t < T.ask2 - 1.4) { look = 0.8; lookY = 0.1; }
    else if (t < T.says2 - 0.8) { look = 0.9; lookY = -0.2; }
    else if (t < T.i) { look = 0; lookY = 1.2; }
    else if (t < T.given + 0.3) { look = 0; lookY = 0.2; happy = r01(t, T.i + 0.6, 0.15) * 0.8; }
    else { happy = r01(t, T.given + 1.6, 0.12); }
    blink.root.rotation.y = yaw;
    blink.face({ blink: blinkK, happy, look, lookY, think, phase: t * 1.6 });
    renderer.render(scene, cam);
  }
  return render;
}

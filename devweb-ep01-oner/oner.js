// devweb ep 1, draft 4: one Three.js world, one continuous camera (Robin, 2026-10-29: "closer to cinetic").
// Blink stays at the origin; the camera travels: hook -> chat panels -> dive into the JSON card -> the harness ->
// crane over the loop -> pull back over a field of Blinks -> back in for the answer -> the terminal -> the buckle ->
// the end frame. Everything is a pure function of film time t (HyperFrames seeks frames in any order).
import * as THREE from "three";
import { makeBlink, makeHarness, glyphTexture } from "./kit/blink3d.js";
import { cl, io, back, r01, mix, V, pulse, typed, cameraPath, panel, rr, stage } from "./kit/world.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const VO = window.VO, G = window.BLINK;
const w = (x, n) => VO.w(x, n), e = (x, n) => VO.e(x, n);

// ---------- the beats, all on Chris's words ----------
export const T = {
  blinkIn: w("can't") - 0.12, happy1: w("text") - 0.05, sky: w("it", 4), skyShake: w("it", 4) + 0.6,
  chatIn: w("ask") - 0.55, userType: w("ask"), replyIn: w("it", 4) - 0.1, dive: w("writes", 2) - 0.25,
  card1: w("call") - 0.05, card3: e("call") + 0.75, move: e("move"),
  handoff: e("move") + 0.2, beltAt: w("harness") - 0.35, dropAt: w("harness") + 0.15, runAt: w("runs", 2) - 0.1,
  resAt: w("four") - 0.15, backAt: w("hands") - 0.05, happyTo: e("text", 2) + 0.5,
  loopIn: w("reads") - 0.6, decides: w("decides"), answer: w("answer"), askAgain: w("again"), loop: w("loop"),
  ask: w("ask", 3), run: w("run"), read: w("read"), again2: w("again", 2), until: w("until"), stops: w("stops"),
  closeIn: w("so") - 0.3, deletes: w("deletes"), file: e("file"), model3: w("model", 3), harness2: w("harness", 2),
  guard: w("guardrails"), belong: e("belong"), END: VO.END,
};

// ---------- the camera path: [time, position, target, fov] ----------
const CARD = V(0.3, 2.12, 0.18);
const RING = { c: V(0, -1.68, 2.4), r: 2.6 };
const KEYS = [
  [0, [0, 1.95, 12.5], [0, 1.95, 0], 36],
  [T.blinkIn + 1.6, [0, 1.85, 11.6], [0, 1.95, 0], 36],
  // the chat, stacked for portrait: the question on top, the reply, Blink underneath
  [T.chatIn + 0.7, [0.3, 2.0, 10.8], [0.3, 1.85, 0], 36],
  [T.dive, [0.35, 2.0, 10.2], [0.3, 1.85, 0], 36],
  // the dive: the card fills the frame
  [T.dive + 1.25, [CARD.x, CARD.y + 0.05, CARD.z + 6.6], [CARD.x, CARD.y, CARD.z], 34],
  [T.move + 0.1, [CARD.x - 0.1, CARD.y + 0.02, CARD.z + 6.2], [CARD.x, CARD.y, CARD.z], 34],
  // down to Blink and its harness, orbiting from three-quarter right to front-left
  [T.handoff + 1.0, [2.6, 0.5, 7.4], [0, -0.3, 0], 36],
  [T.runAt, [1.2, 0.1, 7.0], [0.2, -0.4, 0], 36],
  [T.runAt + 0.9, [1.0, 0.6, 6.7], [0.45, 0.3, 0], 36],
  [T.resAt + 0.7, [0.6, 0.0, 6.4], [0.2, -0.5, 0], 36],
  [T.backAt + 0.9, [-0.6, 0.2, 7.2], [0, -0.35, 0], 36],
  // crane up over the loop
  [T.loopIn + 1.1, [0, 8.6, 15.8], [0, -0.9, 1.9], 38],
  [T.again2 - 0.1, [0, 9.0, 16.5], [0, -0.95, 1.9], 38],
  // the mass moment: pull far back over the field of Blinks, then back in for the answer
  [T.again2 + 0.95, [0, 25, 35], [0, -1.7, -5], 40],
  [T.stops + 0.15, [0, 23, 33], [0, -1.7, -5], 40],
  [T.stops + 1.15, [0, 1.8, 9.5], [0, 1.2, 0], 36],
  // the terminal, then the buckle
  [T.closeIn + 0.7, [-1.2, 1.5, 10.6], [0.6, 1.25, 0], 36],
  [T.harness2 - 0.35, [-0.9, 1.2, 9.8], [0.5, 1.0, 0], 36],
  [T.harness2 + 0.55, [0.3, -0.05, 5.6], [0, -0.5, 0.6], 36],
  [T.belong + 0.25, [0.3, -0.1, 5.8], [0, -0.5, 0.6], 36],
  // the end frame: Blink above the mark
  [T.belong + 1.45, [0, 0, 14], [0, -1.86, 0], 36],
  [T.END, [0, 0, 13.6], [0, -1.86, 0], 36],
];
const cameraAt = cameraPath(KEYS);

export async function buildWorld(canvas) {
  // ---------- sound cues (times only; reported before any await so cues.mjs sees them) ----------
  const cue = (k, t, extra) => window.BP.CUES.push(Object.assign({ k, t: +t.toFixed(3) }, extra || {}));
  const USER = "What's the weather in Nelson?", J1 = '{ "tool":', J2 = '  "get_weather",', J3 = '  "city": "Nelson" }';
  cue("pop", T.blinkIn + 0.1); cue("blip", T.happy1 + 0.05);
  cue("whoosh", T.chatIn + 0.1, { d: 0.8 }); cue("pop", T.chatIn + 0.25);
  [...USER].forEach((ch, i) => ch !== " " && cue("type", T.userType + i / 24));
  cue("pop", T.replyIn + 0.05);
  cue("riser", T.dive - 0.5, { d: 0.5 }); cue("whoosh", T.dive, { d: 1.25 });
  [[J1, T.card1], [J2, T.card1 + J1.length / 22], [J3, T.card3]].forEach(([s, t0]) => [...s].forEach((ch, i) => ch !== " " && cue("type", t0 + i / 22)));
  cue("zip", T.handoff); cue("whoosh", T.handoff + 0.2, { d: 0.8 });
  cue("whoosh", T.beltAt, { d: 0.35 }); cue("land", T.beltAt + 0.35); cue("tick", w("harness"));
  cue("slide", T.dropAt, { d: 0.5 }); cue("tick", T.runAt - 0.2); cue("slide", T.runAt + 0.1, { d: 0.35 }); cue("land", T.runAt + 0.62); cue("zip", T.runAt + 0.75); cue("blip", T.runAt + 1.12); cue("zipdown", T.runAt + 1.3); cue("land", T.backAt + 0.65);
  cue("ding", T.resAt + 0.3); cue("zipdown", T.backAt + 0.05); cue("land", T.backAt + 0.9); cue("blip", T.backAt + 0.95);
  cue("whoosh", T.loopIn + 0.2, { d: 1.0 }); cue("draw", T.loopIn + 0.4, { d: 0.9 });
  cue("blip", T.decides); cue("tick", T.answer + 0.1); cue("tick", T.askAgain);
  [T.ask, T.run, T.read].forEach((t) => cue("slam", t - 0.05));
  cue("riser", T.again2 - 0.6, { d: 0.6 }); cue("whoosh", T.again2, { d: 0.95 });
  cue("ding", T.stops + 0.35); cue("whoosh", T.stops + 0.2, { d: 1.0 });
  cue("whoosh", T.closeIn + 0.1, { d: 0.9 }); cue("pop", T.closeIn + 0.3);
  [..."rm notes.md"].forEach((ch, i) => ch !== " " && cue("type", T.deletes - 0.1 + i / 18)); cue("thud", T.file + 0.15);
  cue("whoosh", T.harness2 - 0.3, { d: 0.85 }); cue("stamp", T.guard + 0.22);
  cue("whoosh", T.belong + 0.3, { d: 1.1 }); cue("sting", T.belong + 1.35);

  await document.fonts.ready;
  const { renderer, scene, cam, ramp, toon } = stage(canvas); // the kit's stage: 1080x1920, fog, light, toon ramp, floor

  // ---------- Blink + its harness ----------
  const rig = new THREE.Group(); scene.add(rig);
  const blink = makeBlink(THREE, G, ramp); rig.add(blink.root);
  const harness = makeHarness(THREE, G, ramp); rig.add(harness.root);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: "#000", transparent: true, opacity: 0.45, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.7; shadow.scale.set(1, 1, 1); scene.add(shadow);
  const card = (text, bg, fg, border) => new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.28), new THREE.MeshBasicMaterial({ transparent: true, map: glyphTexture(THREE, (g, W, H) => {
    g.fillStyle = bg; rr(g, 4, 4, W - 8, H - 8, 26); g.fill();
    if (border) { g.strokeStyle = border; g.lineWidth = 10; rr(g, 8, 8, W - 16, H - 16, 24); g.stroke(); }
    g.fillStyle = fg; g.font = "600 64px 'IBM Plex Mono', monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, W / 2, H / 2 + 3);
  }, 560, 200) }));
  const req = card("get_weather()", "#0c0e11", "#b9f0c9", "#6ad08a"), res = card("4°C, rain", "#d6a45a", "#0d1117");
  rig.add(req, res);

  // ---------- the chat: two panels beside Blink, and the JSON card the camera dives into ----------
  const user = panel(3.7, 0.66, 260, (g, W, H, s) => {
    g.fillStyle = "#1b212d"; rr(g, 0, 0, W, H, H / 2); g.fill();
    g.fillStyle = "#eef2f6"; g.font = "500 58px 'IBM Plex Sans', sans-serif"; g.textAlign = "right"; g.textBaseline = "middle"; g.fillText(s.text, W - 52, H / 2 + 2);
  });
  user.mesh.position.set(0.35, 3.95, -0.3); scene.add(user.mesh);
  const reply = panel(2.6, 1.75, 260, (g, W, H) => {
    g.fillStyle = "rgba(106,208,138,0.10)"; rr(g, 4, 4, W - 8, H - 8, 70); g.fill();
    g.strokeStyle = "rgba(106,208,138,0.6)"; g.lineWidth = 7; rr(g, 4, 4, W - 8, H - 8, 70); g.stroke();
    g.fillStyle = "#eef2f6"; g.font = "500 62px 'IBM Plex Sans', sans-serif"; g.textBaseline = "top"; g.fillText("Let me check.", 70, 44);
  });
  reply.mesh.position.set(0.3, 2.42, 0.1); scene.add(reply.mesh); reply.set({});
  const json = panel(2.4, 1.05, 420, (g, W, H, s) => {
    g.fillStyle = "#0c0e11"; rr(g, 6, 6, W - 12, H - 12, 40); g.fill();
    g.strokeStyle = "#6ad08a"; g.lineWidth = 10; rr(g, 6, 6, W - 12, H - 12, 40); g.stroke();
    g.fillStyle = "#b9f0c9"; g.font = "500 64px 'IBM Plex Mono', monospace"; g.textBaseline = "top";
    s.lines.forEach((l, i) => g.fillText(l, 64, 72 + i * 100));
  });
  json.mesh.position.copy(CARD); scene.add(json.mesh);

  // ---------- the loop: a ring on the floor through Blink, the harness station and the tool station ----------
  const loop = new THREE.Group(); scene.add(loop);
  const ringAt = (p, y = -1.45) => { const a = -Math.PI / 2 + 2 * Math.PI * p; return V(RING.c.x + RING.r * Math.cos(a), y, RING.c.z + RING.r * Math.sin(a)); };
  const ringMat = new THREE.MeshBasicMaterial({ color: "#6ad08a", transparent: true, opacity: 0.85 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(RING.r, 0.03, 8, 160), ringMat);
  ring.rotation.x = -Math.PI / 2; ring.position.set(RING.c.x, -1.66, RING.c.z); loop.add(ring);
  const ringGlow = new THREE.Mesh(new THREE.TorusGeometry(RING.r, 0.16, 8, 160), new THREE.MeshBasicMaterial({ color: "#6ad08a", transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }));
  ringGlow.rotation.x = -Math.PI / 2; ringGlow.position.copy(ring.position); loop.add(ringGlow);
  const station = (p, top) => { const at = ringAt(p, -1.68); const g = new THREE.Group(); g.position.copy(at); const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.9, 16), toon("#2a3344")); post.position.y = 0.45; g.add(post, top); top.position.y = 1.2; loop.add(g); return g; };
  const hIcon = new THREE.Group();
  const hBand = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.075, 12, 48), toon("#b9822e")); hIcon.add(hBand);
  const hBuckle = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.18, 0.06, 3, 0.03), toon("#c9d1d9")); hBuckle.position.set(0, -0.32, 0.03); hIcon.add(hBuckle);
  station(1 / 3, hIcon);
  const toolTile = harness.tools.weather.tile.clone(); toolTile.material = toolTile.material.clone(); const toolFace = harness.tools.weather.pivot.children.find((c) => c.geometry && c.geometry.type === "PlaneGeometry").clone(); toolFace.material = toolFace.material.clone();
  const tIcon = new THREE.Group(); toolTile.position.set(0, 0, 0); toolFace.position.set(0, 0, 0.047); tIcon.add(toolTile, toolFace); tIcon.scale.setScalar(1.6);
  station(2 / 3, tIcon);
  const pkMat = new THREE.MeshBasicMaterial({ color: "#ffffff" });
  const glowTex = glyphTexture(THREE, (g, W) => { const gr = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); gr.addColorStop(0, "rgba(160,255,190,0.9)"); gr.addColorStop(1, "rgba(106,208,138,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, W); }, 128, 128);
  const glowMat = new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  const packet = new THREE.Group(); const pkCore = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 14), pkMat); const pkGlow = new THREE.Sprite(glowMat); pkGlow.scale.setScalar(1.1); packet.add(pkCore, pkGlow); scene.add(packet);
  const trail = [1, 2, 3].map((i) => { const s = new THREE.Sprite(glowMat); s.scale.setScalar(0.8 - i * 0.18); scene.add(s); return s; });
  const LAPS = [[T.ask - 0.3, 0, 1 / 3, 0.55, true], [T.run - 0.05, 1 / 3, 2 / 3, 0.7, true], [T.read - 0.05, 2 / 3, 1, 0.75, true], [T.again2 - 0.1, 1, 2, 0.62, false], [null, 2, 3, 0.42, false], [null, 3, 4, 0.3, false]];
  let tc = 0; const sched = LAPS.map(([t0, a, b, d, ez]) => { const t = t0 != null ? t0 : tc; tc = t + d; return [t, d, a, b, ez]; });
  const lapAt = (t) => { let p = null; for (const [t0, d, a, b, ez] of sched) { if (t < t0) break; const k = cl((t - t0) / d); p = a + (b - a) * (ez ? io(k) : k); } return p; };
  const lapsEnd = tc;

  // ---------- the tool really running (Robin's note at 0:18): it calls a weather service, then prints the answer ----------
  const api = new THREE.Group(); scene.add(api);
  const cloudMat = toon("#cfe3ff", { transparent: true });
  [[0, 0, 0, 0.42], [0.42, 0.06, 0, 0.32], [-0.4, 0.02, 0, 0.3], [0.14, 0.3, 0, 0.33]].forEach(([x, y, z, r]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), cloudMat); m.position.set(x, y, z); api.add(m); });
  const apiLabel = panel(1.6, 0.3, 260, (g, W, H) => { g.fillStyle = "#c9d1d9"; g.font = "500 52px 'IBM Plex Mono', monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("weather API", W / 2, H / 2); });
  apiLabel.set({}); apiLabel.mesh.position.set(0.2, -0.62, 0.3); api.add(apiLabel.mesh);
  const dropMat = new THREE.MeshBasicMaterial({ color: "#4f93d6", transparent: true });
  const drops = [-0.26, 0, 0.26, -0.13, 0.13].map((x, i) => { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.16, 6), dropMat); d.position.set(x, -0.35, 0.1); api.add(d); return d; });
  api.position.set(0.55, 1.7, -0.8);
  const amberTex = glyphTexture(THREE, (g, W) => { const gr = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); gr.addColorStop(0, "rgba(255,220,160,0.95)"); gr.addColorStop(1, "rgba(214,164,90,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, W); }, 128, 128);
  const sigOut = new THREE.Sprite(glowMat.clone()), sigBack = new THREE.Sprite(new THREE.SpriteMaterial({ map: amberTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  [sigOut, sigBack].forEach((sp) => { sp.scale.setScalar(0.55); sp.visible = false; scene.add(sp); });
  const screen = panel(0.3, 0.3, 800, (g, W, H, st) => {
    g.fillStyle = "#0c0e11"; rr(g, 4, 4, W - 8, H - 8, 34); g.fill();
    g.strokeStyle = "#6ad08a"; g.lineWidth = 8; rr(g, 6, 6, W - 12, H - 12, 32); g.stroke();
    g.fillStyle = "#b9f0c9"; g.font = "600 30px 'IBM Plex Mono', monospace"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("get_weather(", W / 2, H * 0.22); g.fillText('"Nelson")', W / 2, H * 0.36);
    g.lineWidth = 12; g.lineCap = "round";
    if (st.done) { g.strokeStyle = "#d6a45a"; g.beginPath(); g.moveTo(W * 0.36, H * 0.66); g.lineTo(W * 0.47, H * 0.77); g.lineTo(W * 0.66, H * 0.56); g.stroke(); }
    else { g.strokeStyle = "#6ad08a"; const a = (st.a / 16) * Math.PI * 2; g.beginPath(); g.arc(W / 2, H * 0.67, H * 0.13, a, a + Math.PI * 1.3); g.stroke(); }
  });
  screen.mesh.position.set(0, -0.38, 0.052); screen.mesh.visible = false; harness.tools.weather.pivot.add(screen.mesh);

  // ---------- the mass moment: a field of Blinks, each running its own loop ----------
  const crowd = new THREE.Group(); scene.add(crowd);
  const crowdRing = ringMat.clone(), crowdGlow = glowMat.clone(); // own materials: fading the crowd must not fade our loop
  const low = makeBlink(THREE, G, ramp, { seg: [44, 32], outline: false });
  const clones = [];
  for (let i = -3; i <= 3; i++) for (let j = -4; j <= 0; j++) {
    if (i === 0 && j === 0) continue;
    const g = new THREE.Group(); g.position.set(i * 8.5, 0, j * 9.5 - 1.0 + (i % 2) * 2);
    const b = low.root.clone(true); g.add(b);
    const r = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.035, 6, 80), crowdRing); r.rotation.x = -Math.PI / 2; r.position.set(0, -1.66, 1.9); g.add(r);
    const p = new THREE.Sprite(crowdGlow); p.scale.setScalar(0.9); g.add(p);
    crowd.add(g); clones.push({ g, p, phase: ((i * 7 + j * 13) % 10) / 10, speed: 0.9 + ((i + 5) * (j + 7) % 5) * 0.12 });
  }
  const answer = panel(3.3, 0.7, 260, (g, W, H) => {
    g.fillStyle = "rgba(214,164,90,0.16)"; rr(g, 6, 6, W - 12, H - 12, H / 2); g.fill();
    g.strokeStyle = "#d6a45a"; g.lineWidth = 8; rr(g, 6, 6, W - 12, H - 12, H / 2); g.stroke();
    g.fillStyle = "#fff3df"; g.font = "500 66px 'IBM Plex Sans', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("4°C and rain in Nelson.", W / 2, H / 2 + 2);
  });
  answer.mesh.position.set(0, 2.25, 0.4); scene.add(answer.mesh); answer.set({});

  // ---------- the close: the harness's terminal, then the guardrails ----------
  const term = panel(3.0, 1.45, 300, (g, W, H, s) => {
    g.fillStyle = "#0c0e11"; rr(g, 6, 6, W - 12, H - 12, 28); g.fill();
    g.strokeStyle = "#2a3344"; g.lineWidth = 6; rr(g, 6, 6, W - 12, H - 12, 28); g.stroke();
    g.fillStyle = "#7b8593"; g.font = "500 44px 'IBM Plex Mono', monospace"; g.textBaseline = "top"; g.fillText("harness", 50, 40); g.textAlign = "right"; g.fillText("// runs the commands", W - 50, 40); g.textAlign = "left";
    g.fillStyle = "#2a3344"; g.fillRect(6, 112, W - 12, 4);
    g.font = "500 74px 'IBM Plex Mono', monospace"; g.fillStyle = "#6ad08a"; g.fillText("$", 50, 170); g.fillStyle = "#eef2f6"; g.fillText(s.cmd, 110, 170);
    if (s.out) { g.fillStyle = "#e0675a"; g.fillText("removed notes.md", 50, 280); }
  });
  term.mesh.position.set(0.9, 2.6, 0.3); term.mesh.rotation.y = -0.12; scene.add(term.mesh);
  const rails = new THREE.Group(); scene.add(rails);
  const railMat = toon("#d6a45a", { transparent: true });
  const rail = (y, from) => { const g = new THREE.Group(); const bar = new THREE.Mesh(new RoundedBoxGeometry(3.2, 0.09, 0.09, 2, 0.03), railMat); g.add(bar); [-1.5, -0.75, 0, 0.75, 1.5].forEach((x) => { const p = new THREE.Mesh(new RoundedBoxGeometry(0.07, 0.3, 0.07, 2, 0.02), railMat); p.position.x = x; g.add(p); }); g.position.set(0, y, 1.22); g.userData.from = from; rails.add(g); return g; };
  const railTop = rail(-0.36, -7), railBot = rail(-1.5, 7);

  // ---------- the frame at time t ----------
  const visorFront = V(0, 0.25, 1.08), buckleFront = V(0, -0.55, 1.2), tileFront = V(0, -1.1, 1.18);
  const lerpV = (a, b, k) => a.clone().lerp(b, k);
  const fadeAll = (obj, a) => obj.traverse((o) => { if (o.material) { o.material.transparent = true; o.material.opacity = a; } });

  function render(t) {
    cameraAt(t, cam);
    const bob = 0.05 * Math.sin((t / 1.7) * Math.PI * 2);
    let happy = 0, blinkK = 0, look = 0, lookY = 0, think = 0, yaw = 0.15 * Math.sin((t / 3.1) * Math.PI * 2);
    // Blink: pops in for the hook, then stays (it is the world's anchor)
    const kin = back(r01(t, T.blinkIn, 0.45));
    rig.visible = t >= T.blinkIn;
    rig.position.set(0, bob - (1 - kin) * 0.5, 0); rig.scale.setScalar(Math.max(0.01, kin));
    if (t < T.chatIn) { yaw = t < T.happy1 ? 0.22 * Math.sin((t - T.blinkIn) * 18) * (1 - r01(t, T.blinkIn + 0.6, 0.4)) : yaw; happy = r01(t, T.happy1, 0.15) * (1 - r01(t, T.chatIn - 0.2, 0.2)); }
    shadow.material.opacity = (0.45 - bob) * kin; shadow.scale.setScalar(1 - bob);

    // chat panels
    const chatA = r01(t, T.chatIn + 0.15, 0.3) * (1 - r01(t, T.handoff + 0.2, 0.35));
    user.set({ text: typed(USER, T.userType, 24, t) }); user.mesh.material.opacity = chatA; user.mesh.visible = chatA > 0;
    user.mesh.scale.setScalar(mix(0.85, 1, back(r01(t, T.chatIn + 0.15, 0.35))));
    const repA = r01(t, T.replyIn, 0.3) * (1 - r01(t, T.handoff + 0.2, 0.35));
    reply.mesh.material.opacity = repA; reply.mesh.visible = repA > 0; reply.mesh.scale.setScalar(mix(0.85, 1, back(r01(t, T.replyIn, 0.35))));
    json.set({ lines: [typed('{ "tool":', T.card1, 22, t), typed('  "get_weather",', T.card1 + 9 / 22, 22, t), typed('  "city": "Nelson" }', T.card3, 22, t)] });
    // the hand-off: the card leaves the panel and drops back to Blink, shrinking into the small request card
    const ho = io(r01(t, T.handoff, 0.7));
    json.mesh.position.copy(lerpV(CARD, visorFront.clone().add(V(0, 0, 0.1)), ho));
    json.mesh.scale.setScalar(mix(1, 0.3, ho) * (t < T.handoff + 0.7 ? 1 : 0) + 0.0001);
    json.mesh.material.opacity = repA > 0 || (t >= T.handoff && t < T.handoff + 0.7) ? Math.max(repA, 1 - r01(t, T.handoff + 0.55, 0.15)) : 0;
    json.mesh.visible = json.mesh.material.opacity > 0.001 && t >= T.replyIn;
    if (t >= T.chatIn && t < T.handoff) { look = 0.6; lookY = 0.3; }
    // "It doesn't check the sky": a look up, then a shake of the head (Robin's note at 0:07)
    if (t >= T.sky - 0.1 && t < T.skyShake) { look = 0; lookY = 1.4 * r01(t, T.sky - 0.1, 0.15); }
    if (t >= T.skyShake && t < T.skyShake + 0.7) { look = 0; lookY = 0.3 * (1 - r01(t, T.skyShake, 0.2)); yaw = 0.28 * Math.sin((t - T.skyShake) * 17) * (1 - r01(t, T.skyShake + 0.35, 0.35)); }

    // the harness beat
    req.visible = res.visible = false;
    harness.root.visible = t >= T.beltAt && t < T.END;
    const hb = io(r01(t, T.beltAt, 0.35));
    harness.root.position.y = -(1 - hb) * 0.35; harness.root.scale.setScalar(mix(1.2, 1, hb));
    harness.root.traverse((o) => { if (o.material && o.material.transparent && o.material.blending !== THREE.AdditiveBlending) { o.material.opacity = hb; o.material.depthWrite = hb > 0.98; } });
    const buckleAmber = r01(t, T.harness2 - 0.1, 0.2) * (1 - r01(t, T.belong + 0.4, 0.4));
    harness.buckleGlow.material.color.set(buckleAmber > 0 ? "#d6a45a" : "#6ad08a");
    const blend = buckleAmber > 0 ? THREE.NormalBlending : THREE.AdditiveBlending;
    if (harness.buckleGlow.material.blending !== blend) { harness.buckleGlow.material.blending = blend; harness.buckleGlow.material.needsUpdate = true; }
    harness.buckleGlow.material.opacity = Math.max(0.8 * r01(t, T.dropAt + 0.4, 0.1) * (1 - r01(t, T.runAt + 0.1, 0.3)), 0.6 * buckleAmber);
    Object.values(harness.tools).forEach((k) => { k.hot.material.opacity = 0; k.pivot.rotation.z = 0; });
    // the run: the weather tool unclips and swings up, the card slots into it, it calls the weather service, the
    // answer prints out of its bottom, and the tool clips back on (Robin's note at 0:18)
    const W = harness.tools.weather;
    if (!W.base) W.base = W.pivot.position.clone();
    const lift = io(r01(t, T.runAt - 0.25, 0.4)) * (1 - io(r01(t, T.backAt + 0.15, 0.5)));
    W.pivot.position.copy(W.base).add(V(0, 1.0 * lift, 0.8 * lift));
    W.pivot.scale.setScalar(1 + 0.9 * lift);
    const pv = W.pivot.position, sc = W.pivot.scale.x;
    const slotTop = V(pv.x, pv.y - 0.2 * sc, pv.z + 0.06), tileC = V(pv.x, pv.y - 0.38 * sc, pv.z + 0.12 * sc), tileBottom = V(pv.x, pv.y - 0.56 * sc, pv.z + 0.14);
    if (t >= T.handoff + 0.55 && t < T.runAt + 0.7) {
      req.visible = true;
      const a = lerpV(visorFront, buckleFront, io(r01(t, T.dropAt, 0.5)));
      const b = lerpV(a, slotTop.clone().add(V(0, 0.22, 0)), io(r01(t, T.runAt + 0.05, 0.35)));
      const ins = io(r01(t, T.runAt + 0.42, 0.25));
      req.position.copy(lerpV(b, slotTop.clone().add(V(0, -0.06, 0)), ins));
      const s0 = mix(1, 0.55, io(r01(t, T.dropAt, 0.5))) * r01(t, T.handoff + 0.55, 0.12);
      req.scale.set(s0 + 0.001, s0 * (1 - ins) + 0.001, 1);
    }
    const working = t >= T.runAt + 0.55 && t < T.backAt + 0.1;
    screen.mesh.visible = working;
    if (working) screen.set({ a: Math.floor((t - T.runAt) * 16) % 16, done: t >= T.resAt + 0.1 });
    W.hot.material.opacity = 0; /* the screen shows the work now; a glow box over the scaled tile read as a brown panel */
    const cloudA = r01(t, T.runAt - 0.2, 0.3) * (1 - r01(t, T.resAt + 0.05, 0.3));
    api.visible = cloudA > 0; if (api.visible) { fadeAll(api, cloudA); api.position.y = 1.7 + 0.05 * Math.sin(t * 2.1); }
    const rain = r01(t, T.runAt + 1.1, 0.1) * (1 - r01(t, T.runAt + 1.75, 0.15));
    drops.forEach((d, i) => { d.visible = rain > 0; d.position.y = -0.35 - (((t - T.runAt) * 2.2 + i * 0.13) % 0.6); d.material.opacity = rain * cloudA; });
    const tileW = rig.localToWorld(tileC.clone()), cloudW = api.position.clone();
    const arc = (A, B, k) => { const m = A.clone().lerp(B, 0.5).add(V(0, 0.9, 0)); return A.clone().multiplyScalar((1 - k) * (1 - k)).add(m.multiplyScalar(2 * (1 - k) * k)).add(B.clone().multiplyScalar(k * k)); };
    const ko = r01(t, T.runAt + 0.75, 0.37), kb = r01(t, T.runAt + 1.3, 0.35);
    sigOut.visible = ko > 0 && ko < 1; if (sigOut.visible) sigOut.position.copy(arc(tileW, cloudW, io(ko)));
    sigBack.visible = kb > 0 && kb < 1; if (sigBack.visible) sigBack.position.copy(arc(cloudW, tileW, io(kb)));
    if (t >= T.resAt && t < T.backAt + 1.0) {
      res.visible = true;
      const printed = lerpV(tileC, tileBottom.clone().add(V(0, -0.16, 0.04)), io(r01(t, T.resAt, 0.4)));
      const up = io(r01(t, T.backAt, 0.9));
      res.position.copy(lerpV(printed, visorFront.clone().add(V(0, 0, 0.05)), up));
      const rs = 0.85 * (1 - 0.5 * up) * (1 - r01(t, T.backAt + 0.9, 0.1));
      res.scale.set(rs + 0.001, rs * io(r01(t, T.resAt, 0.25)) + 0.001, 1);
    }
    if (t >= T.handoff && t < T.loopIn) {
      happy = r01(t, T.backAt + 0.85, 0.12) * (1 - r01(t, T.happyTo, 0.15));
      look = t < T.dropAt ? 0 : t < T.backAt ? -0.6 * r01(t, T.dropAt, 0.2) : 0; lookY = t >= T.dropAt && t < T.backAt ? -0.8 : 0;
      blinkK = Math.max(pulse(t, T.dropAt - 1.2, 0.07), pulse(t, T.runAt + 1.2, 0.07));
    }

    // the loop
    const loopA = r01(t, T.loopIn + 0.2, 0.6) * (1 - r01(t, T.closeIn, 0.4));
    loop.visible = loopA > 0; fadeAll(loop, loopA);
    ringMat.opacity = 0.85 * loopA; ringGlow.material.opacity = 0.12 * loopA; glowMat.opacity = 1;
    if (t >= T.loopIn && t < T.closeIn) {
      if (t >= T.loopIn && t < T.decides - 0.1) { res.visible = true; res.position.set(0, 0.0, 1.14); res.scale.setScalar(1.15 * back(r01(t, T.loopIn + 0.25, 0.3)) * (1 - r01(t, T.decides - 0.3, 0.2)) + 0.001); look = 0.9 * Math.sin((t - T.loopIn) * 7); }
      think = r01(t, T.decides - 0.1, 0.1) * (1 - r01(t, T.answer - 0.15, 0.1));
      if (t >= T.answer - 0.15 && t < T.askAgain - 0.15) { look = 0; lookY = 1.2; }
      else if (t >= T.askAgain - 0.15 && t < T.ask - 0.4) { look = 0; lookY = -1.2; }
      const hop = 0.12 * Math.max(pulse(t, T.ask), pulse(t, T.run), pulse(t, T.read));
      rig.scale.set(kin * (1 + hop * 0.5), kin * (1 - hop), kin); rig.position.y += hop * 0.3;
      happy = r01(t, T.stops + 0.2, 0.12);
      blinkK = pulse(t, T.loop + 0.1, 0.07);
    }
    const p = lapAt(t);
    packet.visible = p !== null && t < Math.max(lapsEnd, T.stops) + 0.45 && loopA > 0;
    trail.forEach((s) => (s.visible = packet.visible));
    if (packet.visible) {
      const out = r01(t, Math.max(lapsEnd, T.stops - 0.2), 0.45);
      const pos = out > 0 ? lerpV(ringAt(p % 1), V(0, 3.2, 0.4), io(out)) : ringAt(p);
      packet.position.copy(pos);
      trail.forEach((s, i) => s.position.copy(out > 0 ? pos : ringAt(p - (i + 1) * 0.02)));
      if (out === 0 && t >= T.ask - 0.4) { const d = pos.clone().sub(V(0, 0.2, 0)); look = cl(d.x / 2.5) * 1.4 - (d.x < 0 ? 0 : 0); lookY = -0.9; look = Math.max(-1.4, Math.min(1.4, d.x / 1.8)); }
    }
    // the crowd
    const crowdA = r01(t, T.again2 - 0.2, 0.5) * (1 - r01(t, T.stops + 0.6, 0.5));
    crowd.visible = crowdA > 0;
    if (crowd.visible) {
      fadeAll(crowd, crowdA); crowdRing.opacity = 0.7 * crowdA;
      const u = Math.max(0, t - (T.again2 - 0.2));
      clones.forEach((c) => {
        const q = c.phase + u * c.speed * (1 + 1.4 * u);
        const a = -Math.PI / 2 + 2 * Math.PI * q, rise = r01(t, T.stops - 0.1 + c.phase * 0.3, 0.5);
        c.p.position.set(2.0 * Math.cos(a) * (1 - rise), mix(-1.45, 4.5, io(rise)), 1.9 + 2.0 * Math.sin(a) * (1 - rise));
        c.g.children[0].rotation.y = 0.3 * Math.sin(t * 1.3 + c.phase * 6);
      });
    }
    const ansA = back(r01(t, T.stops + 0.3, 0.35)) * (1 - r01(t, T.closeIn, 0.3));
    answer.mesh.visible = ansA > 0.01; answer.mesh.scale.setScalar(Math.max(0.01, ansA)); answer.mesh.material.opacity = cl(ansA);

    // the close
    const termA = r01(t, T.closeIn + 0.3, 0.3) * (1 - r01(t, T.harness2 - 0.3, 0.4)); // gone before the push to the buckle
    term.mesh.visible = termA > 0; term.mesh.material.opacity = termA; term.mesh.scale.setScalar(mix(0.85, 1, back(r01(t, T.closeIn + 0.3, 0.35))));
    term.set({ cmd: typed("rm notes.md", T.deletes - 0.1, 18, t), out: t >= T.file + 0.15 });
    if (t >= T.closeIn) {
      look = 1.1; lookY = -0.2;
      if (t >= T.model3 && t < T.model3 + 0.9) { yaw = 0.25 * Math.sin((t - T.model3) * 16) * (1 - r01(t, T.model3 + 0.5, 0.4)); look = 0; }
      if (t >= T.harness2) { look = 0; lookY = -1.0; }
      if (t >= T.belong + 0.3) { look = 0; lookY = 0; happy = r01(t, T.belong + 1.6, 0.12); blinkK = pulse(t, T.belong + 2.4, 0.07); }
    }
    const railA = r01(t, T.guard - 0.15, 0.1) * (1 - r01(t, T.belong + 0.4, 0.4));
    rails.visible = railA > 0; railMat.opacity = railA;
    [railTop, railBot].forEach((r) => { r.position.x = r.userData.from * (1 - back(r01(t, T.guard - 0.15, 0.45))); });

    const skyUp = r01(t, T.sky - 0.1, 0.2) * (1 - r01(t, T.skyShake - 0.05, 0.2));
    blink.root.rotation.x = -0.32 * io(skyUp); // tips back to look at the sky
    blink.root.rotation.y = yaw; harness.root.rotation.y = yaw;
    blink.face({ blink: blinkK, happy, look, lookY, think, phase: t * 1.6 });
    renderer.render(scene, cam);
  }
  return render;
}

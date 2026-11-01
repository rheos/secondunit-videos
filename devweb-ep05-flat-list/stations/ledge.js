// S1 the ledge (boards 01, 02, 05, 06, 07; seen in the wides): Blink and its harness on the ledge at the top of the
// shaft, the carabiner that holds the cord, the white "save this" card (pencil), the empty-ask outline, the amber
// result card (eye) and the amber light that carries it up the cord. Gray box: stand-ins at planned sizes and colours.
import { T, CARD_Z, cardY, track, fadeMat, cl, io, r01, mix, V } from "../parts.js";

let THREE, root, blink, harness, save, saveMat, outline, amber, amberLight, kitRef;

export function build(scene, kit) {
  THREE = kit.THREE; kitRef = kit;
  root = new THREE.Group(); scene.add(root);
  // the ledge
  const ledge = new THREE.Mesh(new kit.RoundedBoxGeometry(4.4, 0.6, 3.7, 3, 0.08), kit.toon("#2a3344"));
  ledge.position.set(0, -1.40, -0.95); root.add(ledge);
  // Blink (low-poly stand-in) and the harness; the harness's three tools are hidden: the cord's cards are the tools
  blink = kit.makeBlink(THREE, kit.G, kit.ramp, { seg: [60, 44] }); root.add(blink.root);
  harness = kit.makeHarness(THREE, kit.G, kit.ramp); root.add(harness.root);
  Object.values(harness.tools).forEach((k) => (k.pivot.visible = false));
  // the carabiner on the gear loop that holds the cord
  const crab = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.016, 8, 28), kit.toon("#c9d1d9"));
  crab.scale.set(0.9, 1.5, 1); crab.position.set(0, -0.80, 1.08); root.add(crab);

  // "save this": a white request card with a pencil; goes grey when nothing saves it
  save = kit.panel(1.95, 0.62, 300, (g, W, H, s) => {
    g.fillStyle = s.grey ? "#6e7681" : "#eef2f6"; kit.rr(g, 4, 4, W - 8, H - 8, 30); g.fill();
    g.strokeStyle = "#0d1117"; g.lineWidth = 12; g.lineCap = "round";
    g.beginPath(); g.moveTo(70, H - 60); g.lineTo(140, 60); g.stroke(); // pencil stand-in
    g.fillStyle = "#0d1117"; g.font = "600 60px 'IBM Plex Mono', monospace"; g.textBaseline = "middle"; g.fillText("save this", 175, H / 2 + 2);
  });
  saveMat = save.mesh.material; root.add(save.mesh);
  // where it was: a dashed grey outline, nothing inside
  outline = kit.panel(1.95, 0.62, 300, (g, W, H) => { g.setLineDash([24, 16]); g.strokeStyle = "#6e7681"; g.lineWidth = 8; kit.rr(g, 6, 6, W - 12, H - 12, 30); g.stroke(); });
  outline.set({}); outline.mesh.position.set(1.75, 1.15, 0.7); root.add(outline.mesh);
  // the amber result: an eye (reads) and three note bars
  amber = kit.panel(1.7, 1.05, 300, (g, W, H) => {
    g.fillStyle = "#d6a45a"; kit.rr(g, 4, 4, W - 8, H - 8, 30); g.fill();
    g.strokeStyle = "#0d1117"; g.lineWidth = 12; g.beginPath(); g.ellipse(W * 0.3, H / 2, 82, 50, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#0d1117"; g.beginPath(); g.arc(W * 0.3, H / 2, 24, 0, Math.PI * 2); g.fill();
    [0.3, 0.5, 0.7].forEach((y, i) => { kit.rr(g, W * 0.56, H * y - 9, W * (0.34 - 0.06 * i), 18, 9); g.fill(); });
  });
  amber.set({}); root.add(amber.mesh);
  amberLight = new THREE.Sprite(new THREE.SpriteMaterial({ color: "#d6a45a", map: kit.glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  amberLight.scale.setScalar(0.6); root.add(amberLight);
  return root;
}

// Blink's face, keyed and eased (ep 3)
const lookX = () => track([[0, 0], [T.save2, 0], [T.save2 + 0.4, 0.9], [T.recent1 + 0.4, 0.9], [T.recent1 + 0.8, 0], [T.saved1 - 0.3, -0.9], [T.time1 + 0.5, -0.9], [T.why, 0]]);
const lookYk = () => track([[0, -0.9], [T.say, -0.9], [T.say + 0.5, 0], [T.asks, 0], [T.asks + 0.3, -1.0], [T.back, -1.0], [T.back + 0.5, 0], [T.save2, 0], [T.save2 + 0.4, -0.2], [T.why, -0.2], [T.why + 0.4, -1.0], [T.far, -1.0], [T.far + 0.6, 0]]);
let LX, LY;

export function update(t) {
  LX = LX || lookX(); LY = LY || lookYk();
  // Blink: a bob that only goes up (feet stay on the ledge), a slow yaw
  const bob = 0.03 * (1 + Math.sin((t / 1.7) * Math.PI * 2));
  blink.root.position.set(0, bob, 0); harness.root.position.set(0, bob, 0);
  const yaw = 0.12 * Math.sin((t / 3.1) * Math.PI * 2);
  blink.root.rotation.set(0, yaw, 0); harness.root.rotation.set(0, yaw, 0);
  const think = r01(t, T.memory1 - 0.5, 0.15) * (1 - r01(t, T.memory1 + 0.5, 0.15));
  const happy = r01(t, T.folderE + 0.4, 0.3);
  const blinkK = Math.max(0, 1 - Math.abs(t - 9.0) / 0.07, 1 - Math.abs(t - 52.0) / 0.07, 1 - Math.abs(t - 100.0) / 0.07);
  blink.face({ blink: blinkK, happy, look: LX(t), lookY: LY(t), think, phase: t * 1.6 });
  // buckle glow: the request leaves (02), the tug (06)
  const glow = Math.max(0.8 * r01(t, T.asks, 0.1) * (1 - r01(t, T.asks + 0.4, 0.3)), 0.8 * r01(t, T.takes, 0.1) * (1 - r01(t, T.takes + 0.4, 0.3)));
  harness.buckleGlow.material.opacity = glow;

  // "save this": in on "save" (2), waits, greys on "nothing" (1), falls out of frame by "errors"; faint drift in 10
  const sIn = kitRef.back(r01(t, T.save2 - 0.1, 0.35));
  const fall = io(r01(t, T.nothing1 + 0.1, T.errors - T.nothing1 - 0.1));
  const late = t >= T.finds - 0.6 && t < T.problem1 + 0.4;
  save.set({ grey: t >= T.nothing1 });
  if (late) {
    const k = r01(t, T.finds - 0.6, T.problem1 + 0.4 - (T.finds - 0.6));
    save.mesh.position.set(2.4, mix(-13.8, -19.5, k), 1.9); save.mesh.rotation.set(0, 0, 0.3 * Math.sin(t * 0.9));
    save.mesh.scale.setScalar(1); fadeMat(saveMat, 0.35 * r01(t, T.finds - 0.6, 0.4) * (1 - r01(t, T.problem1 - 0.2, 0.5)));
    save.mesh.visible = true;
  } else {
    save.mesh.visible = t >= T.save2 - 0.1 && t < T.errors + 0.1;
    save.mesh.position.set(mix(1.75, 2.4, fall), mix(1.15, -9.5, fall * fall), mix(0.7, 1.9, fall));
    save.mesh.rotation.set(0, 0, -0.9 * fall);
    save.mesh.scale.setScalar(Math.max(0.01, sIn)); fadeMat(saveMat, 1);
  }
  // the empty outline where it was: in with the fall, out a second later
  const oA = r01(t, T.nothing1 + 0.1, 0.4) * (1 - r01(t, T.errors + 1.0, 0.4));
  outline.mesh.visible = oA > 0.001; fadeMat(outline.mesh.material, 0.8 * oA);

  // the amber result: light leaves card 12 at "recent" + 0.4, up the cord, over to Blink's left by "saved"
  const a0 = T.recent1 + 0.4, a1 = T.saved1;
  const up = io(r01(t, a0, a1 - a0));
  const ay = mix(cardY(12), -0.2, cl(up / 0.8)), side = cl((up - 0.8) / 0.2);
  const aOn = t >= a0 && t < T.why + 0.6;
  amber.mesh.visible = aOn;
  amber.mesh.position.set(mix(0, -1.75, side), mix(ay, 1.15, side), mix(1.75, 0.7, side));
  amber.mesh.scale.setScalar(mix(0.35, 1, up)); fadeMat(amber.mesh.material, 1 - r01(t, T.why, 0.5));
  amberLight.visible = t >= a0 && up < 0.85;
  amberLight.position.set(0, ay - 0.2, CARD_Z - 0.04);
}

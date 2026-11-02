// S4 the rule slot (boards 13, 14): below the ten folders, the empty dashed "no folder" slot that card 36's lone copy
// lands in and wobbles; in 14 the `invoice` folder types its two good names above it, the lone copy scales up and
// takes the red strike. All three fade on "Rename".
import { T, NAMES, LONE, FOLDER_X, FOLDER_W, COPY_Z, cardY, flightAt, drawCardFace, faceBox, fadeMat, io, r01, mix } from "../parts.js";
import { typed } from "../kit/world.js";

let THREE, root, kit, slot, invoice, lone, loneEdge, strike, scan, scanGlow;

export function build(scene, k) {
  kit = k; THREE = kit.THREE;
  root = new THREE.Group(); scene.add(root);
  // the empty slot: dashed grey outline, a blank dashed tab (nothing takes it; not red, nothing flashes)
  slot = kit.panel(FOLDER_W, 2.14, 160, (g, W, H) => {
    const u = W / FOLDER_W, tabH = 0.74 * u;
    g.setLineDash([0.12 * u, 0.08 * u]); g.strokeStyle = "#6e7681"; g.lineWidth = 0.03 * u;
    kit.rr(g, 3, 3, 2.0 * u, tabH, 0.08 * u); g.stroke(); kit.rr(g, 3, tabH, W - 6, H - tabH - 3, 0.08 * u); g.stroke();
  });
  slot.set({}); slot.mesh.position.set(FOLDER_X, -24.49, -2.7); root.add(slot.mesh);
  // the invoice folder (14): the rule shown
  invoice = kit.panel(FOLDER_W, 2.04, 200, (g, W, H, s) => {
    const u = W / FOLDER_W, tabH = 0.74 * u;
    g.fillStyle = "#10241a"; g.strokeStyle = "#6ad08a"; g.lineWidth = 0.03 * u;
    kit.rr(g, 2, 2, 3.08 * u, tabH + 10, 0.08 * u); g.fill(); g.stroke(); kit.rr(g, 2, tabH, W - 4, H - tabH - 2, 0.08 * u); g.fill(); g.stroke();
    g.fillStyle = "#b9f0c9"; g.font = `700 ${0.44 * u}px 'IBM Plex Mono', monospace`; g.textBaseline = "middle"; g.fillText("invoice", 0.22 * u, tabH / 2 + 2);
    g.font = `600 ${0.42 * u}px 'IBM Plex Mono', monospace`;
    [s.a, s.b].forEach((line, n) => {
      if (!line) return; const y = tabH + (0.38 + 0.6 * n) * u, fw = Math.min(line.length, 7);
      g.fillStyle = "#b9f0c9"; g.fillText(line.slice(0, fw), 0.4 * u, y); g.fillStyle = "#7f9fc2"; g.fillText(line.slice(fw), 0.4 * u + g.measureText(line.slice(0, fw)).width, y);
    });
  });
  invoice.mesh.position.set(FOLDER_X, -22.05, -2.7); root.add(invoice.mesh);
  // card 36's lone copy: `send` in white (new, unclaimed)
  loneEdge = kit.toon("#4f93d6", { transparent: true });
  lone = faceBox(2.4, 0.56, 0.04, 210, drawCardFace, loneEdge, { transparent: true });
  lone.set({ n: 36, name: NAMES[36], lit: 0, white: true }); root.add(lone.mesh);
  // the red strike across it (14): the wrong name
  strike = new THREE.Mesh(new THREE.BoxGeometry(1, 0.05, 0.02), new THREE.MeshBasicMaterial({ color: "#e0675a", transparent: true }));
  root.add(strike);
  // the AI's read pass (VIII, "the AI pays"): a green bar sweeps the empty slot and lights nothing
  scan = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 1.4), new THREE.MeshBasicMaterial({ color: "#b9f0c9", transparent: true, depthWrite: false }));
  scanGlow = new THREE.Sprite(new THREE.SpriteMaterial({ color: "#6ad08a", map: kit.glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  scanGlow.scale.set(0.9, 1.9, 1); root.add(scan, scanGlow);
  return root;
}

export function update(t) {
  const out = 1 - r01(t, T.rename, 0.4); // everything at S4 fades on "Rename"
  // the lone copy: peels off card 36 and flies into the empty slot (1.0 s), then wobbles
  const p = (t - T.c36Copy) / 1.0;
  lone.mesh.visible = p >= 0 && out > 0.001;
  const [x, y, z, s] = flightAt(cardY(36), LONE[0], LONE[1], p, 0.8); // camera-r2 clock 5: the lone copy lands at 0.8
  const big = io(r01(t, T.invoice1, 0.6)); // 14: the same copy scales up in its slot
  const sc = mix(s, 2.2, big);
  lone.mesh.position.set(x, y, z);
  lone.mesh.scale.setScalar(sc);
  lone.mesh.rotation.set(0, 0, p >= 1 ? 0.05 * Math.sin((2 * Math.PI * t) / 1.6) * (1 - 0.6 * big) : 0);
  // the cost: the read pass finds nothing, the copy dims (until "invoice" brings it back up to be struck)
  const dim = r01(t, T.pays + 0.25, 0.5) * (1 - r01(t, T.invoice1 - 0.1, 0.4));
  const la = r01(t, T.c36Copy, 0.15) * out * mix(1, 0.3, dim);
  fadeMat(lone.face, la); fadeMat(loneEdge, la);
  // the slot's dashed outline draws in over the flight's last 0.4 s
  const sa = r01(t, T.c36Copy + 0.6, 0.4) * out;
  slot.mesh.visible = sa > 0.001; fadeMat(slot.mesh.material, sa);
  // the invoice folder: in on "invoice" (1), lines type on "invoice" (2) and (3)
  const ia = r01(t, T.invoice1 - 0.1, 0.35) * out;
  invoice.mesh.visible = ia > 0.001; fadeMat(invoice.mesh.material, ia);
  invoice.set({ a: typed("invoice_get", T.invoice2, 14, t), b: typed("invoice_send", T.invoice3, 14, t) });
  // the strike on "send invoice" (the "Not")
  const k = io(r01(t, T.send3, 0.4));
  const len = 2.4 * sc * 0.92;
  strike.visible = k > 0.001 && out > 0.001;
  strike.scale.set(Math.max(0.001, len * k), 1, 1);
  strike.position.set(x - len / 2 + (len * k) / 2, y + 0.12 * sc, z + 0.1);
  strike.rotation.copy(lone.mesh.rotation);
  fadeMat(strike.material, out);
  // two sweeps: on "the AI pays" and on "next time it reads the list"
  const sweep = (a) => (t >= a && t < a + 1.0 ? r01(t, a, 1.0) : -1);
  let sp = sweep(T.pays - 0.35); if (sp < 0) sp = sweep(T.reads3 - 0.15);
  scan.visible = scanGlow.visible = sp >= 0;
  if (sp >= 0) {
    const sx = mix(FOLDER_X - FOLDER_W / 2 + 0.1, FOLDER_X + FOLDER_W / 2 - 0.1, sp), sy = LONE[1] + 0.12, sa = Math.sin(Math.PI * sp);
    scan.position.set(sx, sy, COPY_Z + 0.12); scanGlow.position.set(sx, sy, COPY_Z + 0.14);
    scan.material.opacity = 0.9 * sa; scanGlow.material.opacity = 0.7 * sa;
  }
}

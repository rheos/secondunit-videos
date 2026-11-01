// S4 the rule slot (boards 13, 14): below the ten folders, the empty dashed "no folder" slot that card 36's lone copy
// lands in and wobbles; in 14 the `invoice` folder types its two good names above it, the lone copy scales up and
// takes the red strike. All three fade on "Rename".
import { T, NAMES, LONE, FOLDER_X, FOLDER_W, cardY, flightAt, drawCardFace, faceBox, fadeMat, io, r01, mix } from "../parts.js";
import { typed } from "../kit/world.js";

let THREE, root, kit, slot, invoice, lone, loneEdge, strike;

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
  return root;
}

export function update(t) {
  const out = 1 - r01(t, T.rename, 0.4); // everything at S4 fades on "Rename"
  // the lone copy: peels off card 36 and flies into the empty slot (1.0 s), then wobbles
  const p = (t - T.c36Copy) / 1.0;
  lone.mesh.visible = p >= 0 && out > 0.001;
  const [x, y, z, s] = flightAt(cardY(36), LONE[0], LONE[1], p);
  const big = io(r01(t, T.invoice1, 0.6)); // 14: the same copy scales up in its slot
  const sc = mix(s, 2.2, big);
  lone.mesh.position.set(x, y, z);
  lone.mesh.scale.setScalar(sc);
  lone.mesh.rotation.set(0, 0, p >= 1 ? 0.05 * Math.sin((2 * Math.PI * t) / 1.6) * (1 - 0.6 * big) : 0);
  const la = r01(t, T.c36Copy, 0.15) * out;
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
}

// S5 the toolbox (boards 01-03, 11-13, 16): the server holding the tools. A hollow blue box with a hinged lid (open
// while cards come out, shut while the ask goes in), side handles, a latch, a generic `tools` tag, the haze behind it
// and the shaft-floor disc.
import { T, faceBox, io, r01, mix } from "../parts.js";

let THREE, root, kit, lidPivot;

export function build(scene, k) {
  kit = k; THREE = kit.THREE;
  root = new THREE.Group(); scene.add(root);
  const blue = kit.toon("#3f7fc9"), steel = kit.toon("#c9d1d9");
  const slab = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new kit.RoundedBoxGeometry(w, h, d, 2, 0.03), blue); m.position.set(x, y, z); root.add(m); return m; };
  // body: x -1.5..1.5, y -28.2..-26.6, z 0.25..2.25, five 0.12 slabs so the mouth is hollow
  slab(3.0, 0.12, 2.0, 0, -28.14, 1.25);
  slab(3.0, 1.6, 0.12, 0, -27.4, 2.19); slab(3.0, 1.6, 0.12, 0, -27.4, 0.31);
  slab(0.12, 1.6, 2.0, -1.44, -27.4, 1.25); slab(0.12, 1.6, 2.0, 1.44, -27.4, 1.25);
  const inside = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.02, 1.7), kit.toon("#0b1a2c")); inside.position.set(0, -28.07, 1.25); root.add(inside);
  // handles and latch
  [-1.56, 1.56].forEach((x) => { const h = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 6, 20, Math.PI), steel); h.rotation.set(0, Math.PI / 2, x < 0 ? Math.PI / 2 : -Math.PI / 2); h.position.set(x, -26.95, 1.25); root.add(h); });
  // the lid, hinged on the back top edge
  lidPivot = new THREE.Group(); lidPivot.position.set(0, -26.6, 0.23); root.add(lidPivot);
  const lid = new THREE.Mesh(new kit.RoundedBoxGeometry(3.04, 0.14, 2.04, 3, 0.04), kit.toon("#35689f")); lid.position.set(0, 0.07, 1.02); lidPivot.add(lid);
  const latch = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.08), steel); latch.position.set(0, -0.02, 2.06); lidPivot.add(latch);
  const grommet = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 16), steel); grommet.rotation.x = Math.PI / 2; grommet.position.set(0, 0.15, 1.02); lidPivot.add(grommet);
  // the `tools` tag: one generic name, it groups nothing
  const tag = faceBox(1.1, 0.42, 0.06, 300, (g, W, H) => {
    g.fillStyle = "#c9d1d9"; g.fillRect(0, 0, W, H); g.fillStyle = "#1b2430"; g.font = "600 66px 'IBM Plex Mono', monospace";
    g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("tools", W / 2, H / 2 + 3);
  }, kit.toon("#c9d1d9"));
  tag.set({}); tag.mesh.position.set(0, -27.35, 2.28); root.add(tag.mesh);
  // haze behind the box, and the shaft floor
  const haze = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, map: kit.glyphTexture(THREE, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "rgba(27,36,48,0)"); gr.addColorStop(1, "rgba(27,36,48,0.8)"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  }, 64, 128) }));
  haze.position.set(0, -27.0, -1.4); root.add(haze);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(14, 64), kit.toon("#0b0f15"));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, -28.25, 0); root.add(floor);
  return root;
}

const OPEN = -1.83;
export function update(t) {
  // open (01) -> shut once the hook's cards are back in (02) -> open for the list (03 on)
  const shut = io(r01(t, T.say + 2.05, 0.5)) * (1 - io(r01(t, T.cardsUp - 0.45, 0.4)));
  lidPivot.rotation.set(mix(OPEN, 0, shut), 0, 0);
}

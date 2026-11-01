// S3 the folder wall (boards 11, 12, 13, 15, 16): the bare back wall of the shaft, ten folders that draw in as their
// first copy nears, and the copies themselves: 32 in the mass moment's ripple, card 11's after the rename. Copies are
// ghosts of cards (the cord never moves); each owns its materials because each fades on its own clock (ep 1).
import { T, NAMES, FOLDERS, SLOT, WALL_Z, FOLDER_Z, FOLDER_X, FOLDER_W, cardY, copyDepart, flightAt, drawCardFace, faceBox, fadeMat, r01, mix } from "../parts.js";

let THREE, root, kit;
const folders = [], copies = [];
const FLIGHT = 0.9;

export function build(scene, k) {
  kit = k; THREE = kit.THREE;
  root = new THREE.Group(); scene.add(root);
  // the back wall: taller than the plan's 40 x 40 so its bottom edge never enters the wide (DP)
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 64), kit.toon("#111922"));
  wall.position.set(3, -13, WALL_Z); root.add(wall);

  // the copies: every card except 10, 11, 32 in the ripple; 11's after the rename
  const ids = [];
  for (let i = 1; i <= 35; i++) if (i !== 10 && i !== 11 && i !== 32) ids.push(i);
  ids.push(11);
  ids.forEach((i) => {
    const edge = kit.toon("#4f93d6", { transparent: true });
    const fb = faceBox(2.4, 0.56, 0.04, 210, drawCardFace, edge, { transparent: true });
    fb.set({ n: i, name: i === 11 ? "memory_write" : NAMES[i], lit: 1 });
    const dep = i === 11 ? T.rewrite : copyDepart(i);
    copies.push({ i, fb, edge, dep, slot: SLOT[i] });
    root.add(fb.mesh);
  });

  // the folders: tab with the first word (Plex Mono 700), body for the copies; memory has a red dashed gap in slot 4
  FOLDERS.forEach(([name, tabTop, bodyTop, bodyBot, cols, cards], f) => {
    const H = tabTop - bodyBot;
    const p = kit.panel(FOLDER_W, H, 160, (g, W, Hp, s) => {
      const u = W / FOLDER_W, tabH = 0.74 * u;
      g.fillStyle = "#10241a"; g.strokeStyle = "#6ad08a"; g.lineWidth = 0.03 * u;
      kit.rr(g, 2, 2, 3.08 * u, tabH + 10, 0.08 * u); g.fill(); g.stroke();
      kit.rr(g, 2, tabH, W - 4, Hp - tabH - 2, 0.08 * u); g.fill(); g.stroke();
      g.fillStyle = "#b9f0c9"; g.font = `700 ${0.44 * u}px 'IBM Plex Mono', monospace`; g.textBaseline = "middle"; g.fillText(name, 0.22 * u, tabH / 2 + 2);
      if (s.gap) { // where card 11 should be
        const x = (2.655 + 1.09 * 3 - FOLDER_X + FOLDER_W / 2 - 0.505) * u, y = (tabTop - (bodyTop - 0.2975) - 0.1175) * u;
        g.setLineDash([0.08 * u, 0.06 * u]); g.strokeStyle = "#e0675a"; g.lineWidth = 0.03 * u; g.strokeRect(x, y, 1.01 * u, 0.235 * u); g.setLineDash([]);
      }
    });
    p.mesh.position.set(FOLDER_X, (tabTop + bodyBot) / 2, FOLDER_Z);
    root.add(p.mesh);
    // a folder draws in when its first copy is 0.3 s from landing
    const first = Math.min(...cards.filter((i) => i !== 11).map((i) => copyDepart(i)));
    folders.push({ name, p, at: first + FLIGHT - 0.3 });
  });
  return root;
}

export function update(t) {
  folders.forEach((f) => {
    const a = r01(t, f.at - 0.1, 0.4);
    f.p.mesh.visible = a > 0.001;
    f.p.set({ gap: f.name === "memory" && t < T.rewrite + FLIGHT });
    fadeMat(f.p.mesh.material, a);
    f.p.mesh.scale.setScalar(mix(0.96, 1, a));
  });
  copies.forEach((c) => {
    const p = (t - c.dep) / FLIGHT;
    c.fb.mesh.visible = p >= 0;
    if (p < 0) return;
    const [x, y, z, s] = flightAt(cardY(c.i), c.slot[0], c.slot[1], p);
    c.fb.mesh.position.set(x, y, z);
    const breath = p >= 1 ? 1 + 0.01 * Math.sin(t * 1.3 + c.i) : 1; // a held wide never freezes (ep 3)
    c.fb.mesh.scale.set(s * breath, s, s);
    const a = r01(t, c.dep, 0.15);
    fadeMat(c.fb.face, a); fadeMat(c.edge, a);
  });
}

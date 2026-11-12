// skins/s02.js: the painted pieces of section 2, the bathtub (f196 to f504). Same rules as skin.js: a painted piece is
// never relit (unlit, times the one tint by distance from the candle); the cloth is the only lit, shadow-receiving
// surface (and with it the floor of the opening under the plate, which is the same kind of ground); flats do not turn.
// What stands here:
//   the hinge line   cut in the cloth along the near plate's far edge, and the paper tab that joins the plate to it
//   the lid          section 5's near plate disc, lifted through the registry (plate_near.set.lid)
//   the well         the floor of the opening under the plate, with the slits the pieces come up through
//   the child        the child_tub plate as a standee on a tab, rising through its slit (never added to: no face)
//   the tub          the bathtub plate as two cards: the front wall (hinges up) and the back wall with the painted water
//                    (lifts through its slit); the waves strip stands between them on a rocker
//   the duck         on a slot cut in the waves
// Every state is a pure function of the film frame (sections/s02.js); everything is hidden outside f196 to f504.
import * as S2 from "../sections/s02.js";
import { makePath } from "../sections/lib.js";
import { clamp } from "../kit.js";

export async function build(X) {
  const { THREE, world, reg, plate, image, tex, plane, flatCard, tintAt, slot, shoulder, slotPale, slotDark, named } = X;
  const HALF = Math.PI / 2, [px, pz] = S2.PLATE, T = S2.TUB;
  const canvasOf = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  const lying = (w, d) => { const g = new THREE.PlaneGeometry(w, d); g.rotateX(-HALF); return g; };                 // lies on the ground
  const [P_tub, P_child, P_waves, P_duck, clothIm] = await Promise.all([plate("bathtub"), plate("child_tub"), plate("waves"), plate("duck"), image("cloth")]);

  // ---------- plain paper for the tabs: a patch of the plate disc's own cream card
  const paperT = (() => { const src = X.plates.plate_disc.canvas, c = canvasOf(256, 256); c.getContext("2d").drawImage(src, src.width * 0.36, src.height * 0.36, src.width * 0.28, src.height * 0.28, 0, 0, 256, 256); return tex(c); })();
  const paper = () => new THREE.MeshBasicMaterial({ map: paperT, side: THREE.DoubleSide, toneMapped: false });

  // ---------- the hinge line: two cuts from the middle of the plate's far edge outward
  const hinge = named(new THREE.Group(), "hinge"); hinge.visible = false; world.add(hinge);
  const HG = S2.HINGE, hp = (s) => [HG.at[0] + s * HG.along[0], HG.at[1] + s * HG.along[1]];
  const cuts = [-1, 1].map((s) => { const g = slot(makePath([hp(0), hp(s * HG.half * 0.5), hp(s * HG.half)])); hinge.add(g); return g; });
  reg.add("hinge", hinge, { kind: "slots" });
  // the tab that joins the plate to the line: glued under the plate's far rim, so it swings up with the lid
  const tabG = named(new THREE.Group(), "lid_tab"); tabG.position.set(HG.at[0], 0.015, HG.at[1]); tabG.rotation.y = HG.az; tabG.visible = false; world.add(tabG); reg.add("lid_tab", tabG, { kind: "flat" });
  const tab = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 1.7), paper()); Object.assign(tab.material, { polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }); tabG.add(tab);
  const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), HG.az), qZ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -HG.az);

  // ---------- everything under the lid stands in one frame, turned to where the camera holds
  const G = named(new THREE.Group(), "tub"); G.position.set(px, 0, pz); G.rotation.y = S2.YAW; G.visible = false; world.add(G);
  // the well: the floor of the opening. Lit like the cloth and shadowed like it; a blue-grey paper, with the cut lip round it
  const wellT = (() => { const c = canvasOf(768, 768), g = c.getContext("2d"); g.drawImage(clothIm, 300, 200, 700, 700, 0, 0, 768, 768); g.globalCompositeOperation = "multiply"; g.fillStyle = "#b3cbe8"; g.fillRect(0, 0, 768, 768);
    g.globalCompositeOperation = "source-over"; const gr = g.createRadialGradient(384, 384, 250, 384, 384, 384); gr.addColorStop(0, "rgba(20,24,34,0)"); gr.addColorStop(1, "rgba(20,24,34,0.22)"); g.fillStyle = gr; g.fillRect(0, 0, 768, 768); return tex(c); })();
  const off = (n) => ({ polygonOffset: true, polygonOffsetFactor: -n, polygonOffsetUnits: -n });
  // (their own materials: the cloth slots' are pulled far toward the lens, which would draw them through a lid that has only just lifted)
  const slitPale = shoulder(new THREE.MeshStandardMaterial({ color: "#fff7e6", roughness: 1, ...off(1.2) })), slitDark = new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false, ...off(1.5) });
  const R = 10.9, well = new THREE.Mesh(new THREE.CircleGeometry(R, 72), shoulder(new THREE.MeshStandardMaterial({ map: wellT, roughness: 1, metalness: 0, ...off(1) }))); well.rotation.x = -HALF; well.position.y = 0.006; well.receiveShadow = true; G.add(well);
  const lip = new THREE.Mesh(new THREE.RingGeometry(R - 0.02, R + 0.2, 72), slitPale); lip.rotation.x = -HALF; lip.position.y = 0.012; lip.receiveShadow = true; G.add(lip);
  // the slits: the child's, the back wall's, the waves'; and the crease the front wall hinges on
  const slit = (x, z, w) => { const a = new THREE.Mesh(lying(w, 0.3), slitPale), b = new THREE.Mesh(lying(w, 0.1), slitDark); a.position.set(x, 0.02, z); b.position.set(x, 0.03, z); a.receiveShadow = true; G.add(a, b); };
  slit(S2.CHILD.x, T.zChild, 8.4); slit(0, T.zBack, 15.4); slit(0, T.zWaves, S2.WAVES.len + 0.6);
  { const a = new THREE.Mesh(lying(13.2, 0.16), slitPale); a.position.set(0, 0.02, T.zFront - 0.05); a.receiveShadow = true; G.add(a); }
  reg.add("tub", G, { kind: "flat" });

  // ---------- the tub: the plate cut in two along the water's near edge. The front card is the wall and the near rim;
  // the back card is the whole tub without its feet (its water and far rim show over the front wall, its body behind it)
  const k = T.len / P_tub.w, TH = P_tub.h * k, d = P_tub.data.data, W = P_tub.w, Hp = P_tub.h, lineY = new Float32Array(W);
  for (let x = 0; x < W; x++) { let y = -1; for (let j = Math.round(Hp * 0.45); j >= 0; j--) { const i = (j * W + x) * 4; if (d[i + 3] > 200 && d[i + 2] > d[i] + 18) { y = j; break; } } lineY[x] = y; }
  const endY = Math.round(Hp * 0.21); for (let x = 0; x < W; x++) if (lineY[x] < 0) lineY[x] = endY;
  const part = (keep) => { const c = canvasOf(W, Hp), g = c.getContext("2d"); g.drawImage(P_tub.canvas, 0, 0); const img = g.getImageData(0, 0, W, Hp), q = img.data;
    for (let y = 0; y < Hp; y++) for (let x = 0; x < W; x++) if (!keep(x, y)) q[(y * W + x) * 4 + 3] = 0; g.putImageData(img, 0, 0); return tex(c); };
  const frontT = part((x, y) => y > lineY[x]), backT = part((x, y) => y < Hp * 0.8);
  const frontH = named(new THREE.Group(), "tub.front"); frontH.position.set(0, 0.03, T.zFront); G.add(frontH);
  const front = flatCard(frontT, T.len, TH); frontH.add(front);
  const back = named(flatCard(backT, T.len, TH), "tub.back"); back.position.z = T.zBack; G.add(back);

  // ---------- the waves on their rocker, the slot cut in them, the duck on the slot
  const WV = S2.WAVES, wh = (WV.len * P_waves.h) / P_waves.w;
  const rocker = named(new THREE.Group(), "tub.waves"); frontH.add(rocker);       // on the front wall: flat against it while it lies down
  const waves = flatCard(P_waves.t, WV.len, wh); rocker.add(waves);
  const D = S2.DUCK, lineM = [new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })];
  { const x0 = D.home[0] - D.swing - 0.5, x1 = D.home[0] + D.swing + 0.9, y = D.home[1] + 0.8;
    const a = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, 0.13), lineM[0]), b = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0 - 0.06, 0.055), lineM[1]); a.position.set((x0 + x1) / 2, y, 0.03); b.position.set((x0 + x1) / 2, y, 0.045); rocker.add(a, b);
  }       // (the slot's leg down to where the duck waits is behind the front wall: not drawn)
  const duckG = named(new THREE.Group(), "tub.duck"); duckG.position.z = 0.14; rocker.add(duckG);
  const dw = (D.h * P_duck.w) / P_duck.h, duck = flatCard(P_duck.t, dw, D.h); duck.scale.x = -1; duckG.add(duck);       // its back: it faces the child
  const dtab = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.9), paper()); dtab.position.set(0, 0.5, -0.05); duckG.add(dtab);

  // ---------- the child: a standee on a tab. The plate is a plain silhouette; nothing is added to the figure
  const child = X.standee("child", P_child, S2.CHILD.h); child.root.visible = false;
  const stick = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 7.2), paper()); stick.position.set(-2.3, -3.4, -0.08); child.rock.add(stick);
  child.root.traverse((o) => (o.frustumCulled = false));
  const childAt = S2.local(S2.CHILD.x, T.zChild);

  const fgGlass = reg.get("fg_glass"), fgFork = reg.get("fg_fork");
  const lidOf = reg.get("plate_near"), cards = [front.material, back.material, waves.material, duck.material], papers = [tab.material, dtab.material, stick.material];
  const pale = new THREE.Color(0.7, 0.77, 0.86), dark = new THREE.Color(0.16, 0.11, 0.09), cream = new THREE.Color(0.98, 0.93, 0.84), tint = new THREE.Color();

  function update(f) {
    const lid = S2.lidAt(f), line = S2.hingeAt(f);
    // section 5's soft tableware by the lens is not wanted before section 4: out for every frame of this section
    if (f >= S2.F0 && f < S2.F1) { fgGlass.set.hide(); fgFork.set.hide(); }
    if (f < S2.F0 - 1 || f > S2.F1 + 1 || (lid <= 0 && line <= 0)) return;
    tint.copy(tintAt(px, pz));
    // the hinge line
    hinge.visible = line > 0.001; cuts.forEach((g) => g.draw(line));
    if (lid <= 0.0004) return;
    // the lid, and the tab under its far rim
    // the table's own setter lifts the disc about its straight-far edge; then the lifted disc is swung round the plate's
    // centre to the hinge (and turned back in its own plane, so its paint never moves as it leaves the cloth)
    lidOf.set.lid(lid, S2.LID_DEG);
    { const o = lidOf.obj, dx = o.position.x - px, dz = o.position.z - pz, c = Math.cos(HG.az), sn = Math.sin(HG.az);
      o.position.set(px + dx * c + dz * sn, o.position.y, pz - dx * sn + dz * c); o.quaternion.premultiply(qY).multiply(qZ); }
    const a = (lid * S2.LID_DEG * Math.PI) / 180, s = 0.85, n = 0.02;
    tabG.visible = true; tab.rotation.x = -HALF - a; tab.position.set(0, s * Math.sin(a) - n * Math.cos(a), s * Math.cos(a) + n * Math.sin(a));
    papers.forEach((m) => m.color.setRGB(cream.r * tint.r, cream.g * tint.g, cream.b * tint.b));
    // under the lid
    const tub = S2.tubAt(f); G.visible = true; back.visible = false;
    cards.forEach((m) => m.color.copy(tint));
    lineM[0].color.setRGB(pale.r * tint.r, pale.g * tint.g, pale.b * tint.b); lineM[1].color.setRGB(dark.r * tint.r, dark.g * tint.g, dark.b * tint.b);
    slitDark.color.setRGB(0.11 * X.now.level, 0.075 * X.now.level, 0.05 * X.now.level);
    frontH.visible = a > 0.035; frontH.rotation.x = HALF * (1 - tub.front);       // the cards lie under the plate until it has lifted clear of them
    back.visible = tub.back > 0.001; back.position.y = -(TH + 0.2) * (1 - tub.back);
    rocker.position.set(0, 1.9 + (WV.base - 1.9) * tub.waves - 0.03, -0.12 + (T.zWaves - T.zFront + 0.12) * tub.waves); rocker.rotation.z = S2.rockAt(f);
    const dk = S2.duckAt(f); duckG.visible = dk.shown; duckG.position.set(dk.x, dk.y, 0.14); duckG.rotation.z = dk.tilt;
    // the child
    const ch = S2.childAt(f);
    child.pose({ visible: ch.shown, x: childAt[0], z: childAt[1], yaw: S2.YAW, f, walk: 0, rest: 99 });
    if (ch.shown) { child.root.position.y = ch.y; child.rock.rotation.z = ch.lean; stick.material.color.setRGB(cream.r * tint.r, cream.g * tint.g, cream.b * tint.b); }
  }
  return { update };
}

// S5 the toolbox (boards 01-03, 11-13, 16): the server holding the tools. A hollow blue toolbox: a pressed-steel body
// (top band, plinth, two ribs, corner guards, rubber feet, a dark lined inside), side handles that swing when the box is
// jolted, two draw latches, back hinges, and a hinged lid (inside panel, top inset, folding carry handle, the cord's
// grommet). The lid is open while cards come out and shut while the ask goes in: it tips over and falls shut with a
// bounce, the latches click up, the box gulps the request card, the latches drop, the lid hops and swings open past
// its stop and settles. A generic `tools` tag, the haze behind it and the shaft-floor disc.
// Every position, size and lid time is the animatic's (world-plan S5, camera-r2 clock 2); everything is set from t.
import { T, faceBox, io, r01, mix } from "../parts.js";

let THREE, kit, root, boxG, lidPivot, bail, latches = [], handles = [];

const OPEN = -1.83; // lid open, 105 deg (world-plan); 0 = shut
const BODY = "#3f7fc9", LID = "#35689f", TRIM = "#2f5d8f", RIB = "#3876bd", INSIDE = "#0b1a2c";
const STEEL = "#c9d1d9", STEEL_D = "#8b949e", RUBBER = "#1b2430";

export function build(scene, k) {
  kit = k; THREE = kit.THREE;
  root = new THREE.Group(); scene.add(root);
  const blue = kit.toon(BODY), trim = kit.toon(TRIM), rib = kit.toon(RIB), steel = kit.toon(STEEL), steelD = kit.toon(STEEL_D);
  const rubber = kit.toon(RUBBER), inside = kit.toon(INSIDE), lidMat = kit.toon(LID);
  // the box squashes about its base (0, -28.2, 1.25) when it is jolted; the inner group keeps world coordinates
  boxG = new THREE.Group(); boxG.position.set(0, -28.2, 1.25); root.add(boxG);
  const box = new THREE.Group(); box.position.set(0, 28.2, -1.25); boxG.add(box);
  const rbox = (w, h, d, x, y, z, mat, r = 0.03, parent = box) => { const m = new THREE.Mesh(new kit.RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2)), mat); m.position.set(x, y, z); parent.add(m); return m; };
  const cube = (w, h, d, x, y, z, mat, parent = box) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); parent.add(m); return m; };
  const cyl = (r, len, x, y, z, mat, axis, parent = box, seg = 16) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat); m.position.set(x, y, z); if (axis === "x") m.rotation.z = Math.PI / 2; if (axis === "z") m.rotation.x = Math.PI / 2; parent.add(m); return m; };

  // ---- body: x -1.5..1.5, y -28.2..-26.6, z 0.25..2.25; five 0.12 slabs so the mouth is hollow ----
  rbox(3.0, 0.12, 2.0, 0, -28.14, 1.25, blue);
  rbox(3.0, 1.6, 0.12, 0, -27.4, 2.19, blue); rbox(3.0, 1.6, 0.12, 0, -27.4, 0.31, blue);
  rbox(0.12, 1.6, 2.0, -1.44, -27.4, 1.25, blue); rbox(0.12, 1.6, 2.0, 1.44, -27.4, 1.25, blue);
  // the dark inside: floor and side liners. The back wall stays body blue: a dark back liner put a hard edge behind
  // the front rim, and at 66 s that rim sits on the frame's bottom border (kit rule, ep 3)
  const liner = (w, h, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), inside); m.position.set(x, y, z); m.rotation.y = ry; box.add(m); };
  const fl = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.02, 1.7), inside); fl.position.set(0, -28.07, 1.25); box.add(fl);
  liner(1.74, 1.4, -1.365, -27.37, 1.25, Math.PI / 2); liner(1.74, 1.4, 1.365, -27.37, 1.25, -Math.PI / 2);
  // pressed-steel dressing: top band under the lid, plinth at the foot, two ribs round the front and sides
  const ring = (y, h, d, mat) => { cube(3.06, h, d, 0, y, 2.25, mat); cube(3.06, h, d, 0, y, 0.25, mat); cube(d, h, 2.06, -1.5, y, 1.25, mat); cube(d, h, 2.06, 1.5, y, 1.25, mat); };
  ring(-26.66, 0.08, 0.05, blue); ring(-28.12, 0.12, 0.05, trim); // the top band in body blue: at 66 s it sits on the frame's bottom border
  [-27.02, -27.7].forEach((y) => { cube(2.86, 0.035, 0.03, 0, y, 2.26, rib); cube(0.03, 0.035, 1.86, -1.51, y, 1.25, rib); cube(0.03, 0.035, 1.86, 1.51, y, 1.25, rib); });
  // corner guards (steel, bottom corners) and rubber feet
  [[-1.5, 2.25], [1.5, 2.25], [-1.5, 0.25], [1.5, 0.25]].forEach(([x, z]) => {
    rbox(0.13, 0.17, 0.13, x, -28.11, z, steelD, 0.02);
    cyl(0.085, 0.05, x * 0.88, -28.225, mix(1.25, z, 0.85), rubber, null, box, 12);
  });
  // hinges on the back top edge
  [-0.9, 0.9].forEach((x) => cyl(0.045, 0.36, x, -26.6, 0.2, steel, "x"));

  // ---- side handles: steel bails hanging from two mounts on each side wall, swinging out when the box is jolted ----
  const hPath = new THREE.CatmullRomCurve3([V(0, 0, -0.3), V(0, -0.18, -0.3), V(0, -0.26, -0.21), V(0, -0.26, 0.21), V(0, -0.18, 0.3), V(0, 0, 0.3)]);
  [-1, 1].forEach((s) => {
    [0.95, 1.55].forEach((z) => cube(0.07, 0.1, 0.08, s * 1.535, -26.88, z, steelD));
    const piv = new THREE.Group(); piv.position.set(s * 1.585, -26.88, 1.25); box.add(piv);
    piv.add(new THREE.Mesh(new THREE.TubeGeometry(hPath, 24, 0.026, 8), steel));
    cyl(0.045, 0.34, 0, -0.26, 0, rubber, "z", piv);
    handles.push([piv, s]);
  });

  // ---- draw latches at x +/-0.95: a base plate and pivot on the body, a lever that hooks a keeper on the lid ----
  [-0.95, 0.95].forEach((x) => {
    cube(0.26, 0.16, 0.03, x, -26.86, 2.265, steelD);
    cyl(0.022, 0.24, x, -26.9, 2.3, steel, "x");
    const piv = new THREE.Group(); piv.position.set(x, -26.9, 2.3); box.add(piv);
    cube(0.18, 0.3, 0.025, 0, 0.15, 0, steel, piv);
    cube(0.16, 0.04, 0.08, 0, 0.33, 0, steelD, piv); // the hook at the lever's tip
    latches.push(piv);
  });

  // ---- the lid, hinged on the back top edge ----
  lidPivot = new THREE.Group(); lidPivot.position.set(0, -26.6, 0.23); box.add(lidPivot);
  rbox(3.04, 0.14, 2.04, 0, 0.07, 1.02, lidMat, 0.04, lidPivot);
  rbox(2.7, 0.03, 1.7, 0, 0.15, 1.02, kit.toon("#3a70aa"), 0.01, lidPivot); // top inset
  rbox(2.7, 0.03, 1.7, 0, -0.005, 1.02, kit.toon("#2b5582"), 0.01, lidPivot); // the inside panel (what the camera sees open)
  [-0.95, 0.95].forEach((x) => cube(0.18, 0.07, 0.06, x, 0.03, 2.07, steelD, lidPivot)); // latch keepers
  // the cord's exit: a steel grommet with a flange where the cord passes when the lid is shut (lid z 1.02 = cord z 1.25)
  const grommet = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 8, 20), steel); grommet.rotation.x = Math.PI / 2; grommet.position.set(0, 0.17, 1.02); lidPivot.add(grommet);
  cyl(0.13, 0.012, 0, 0.168, 1.02, steelD, null, lidPivot, 24);
  // the folding carry handle, lying flat toward the hinge, behind the cord
  [-0.55, 0.55].forEach((x) => cube(0.08, 0.06, 0.1, x, 0.19, 0.6, steelD, lidPivot));
  bail = new THREE.Group(); bail.position.set(0, 0.19, 0.6); lidPivot.add(bail);
  bail.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-0.55, 0, 0), V(-0.55, 0.16, 0), V(-0.45, 0.24, 0), V(0.45, 0.24, 0), V(0.55, 0.16, 0), V(0.55, 0, 0)]), 24, 0.024, 8), steel));
  cyl(0.04, 0.7, 0, 0.24, 0, rubber, "x", bail);

  // ---- the `tools` tag: one generic name, it groups nothing; a riveted label plate ----
  const tag = faceBox(1.1, 0.42, 0.06, 300, (g, W, H) => {
    g.fillStyle = "#c9d1d9"; g.fillRect(0, 0, W, H);
    g.strokeStyle = "#9aa6b6"; g.lineWidth = 3; g.strokeRect(9, 9, W - 18, H - 18);
    g.fillStyle = "#1b2430"; g.font = "600 66px 'IBM Plex Mono', monospace";
    g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("tools", W / 2, H / 2 + 3);
  }, kit.toon("#c9d1d9"));
  tag.set({}); tag.mesh.position.set(0, -27.35, 2.28); box.add(tag.mesh);
  [[-0.5, 0.165], [0.5, 0.165], [-0.5, -0.165], [0.5, -0.165]].forEach(([x, y]) => { const r = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), steelD); r.position.set(x, -27.35 + y, 2.312); box.add(r); });

  // ---- haze behind the box (soft on every side, so it never shows a rectangle), and the shaft floor ----
  const haze = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, map: kit.glyphTexture(THREE, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "rgba(27,36,48,0)"); gr.addColorStop(1, "rgba(27,36,48,0.8)"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = "destination-in";
    const gx = g.createLinearGradient(0, 0, W, 0); gx.addColorStop(0, "rgba(0,0,0,0)"); gx.addColorStop(0.3, "rgba(0,0,0,1)"); gx.addColorStop(0.7, "rgba(0,0,0,1)"); gx.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gx; g.fillRect(0, 0, W, H); g.globalCompositeOperation = "source-over";
  }, 128, 128) }));
  haze.position.set(0, -27.0, -1.4); root.add(haze);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(14, 64), kit.toon("#0b0f15"));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, -28.25, 0); root.add(floor);
  return root;
}
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// a damped ring after an event at c (0 before it): sin for a squash spring, |sin| for something that bounces off a stop
const ring = (t, c, A, k, w) => (t < c ? 0 : A * Math.exp(-k * (t - c)) * Math.sin(w * (t - c)));
const bounce = (t, c, A, k, w) => Math.abs(ring(t, c, A, k, w));

export function update(t) {
  // camera-r2 clock 2: open (01) -> shut once the hook's cards are back in (02) -> open for the list (03 on)
  const C0 = T.note1 + 0.1, CI = C0 + 0.42; // the lid tips over and falls shut, landing at CI
  const O0 = T.cardsUp - 0.45; // the lid swings open (done 0.45 s later, as the first card leaves the mouth)
  const gulp = T.it1 - 0.1 + 1.8 + 0.25; // the request card has shrunk into the grommet (column.js clock 3)
  const c36Land = T.c36Down + 1.0; // card 36 back down in the box

  // the lid: a nudge further open, then it falls (ease-in) and bounces on the rim; the latches drop, it hops, and it
  // swings open past its stop and settles back (kit back easing)
  let a;
  if (t < C0) a = OPEN - 0.07 * Math.sin(Math.PI * r01(t, C0 - 0.18, 0.18));
  else if (t < CI) { const p = r01(t, C0, CI - C0); a = OPEN * (1 - p * p); }
  else if (t < O0 - 0.14) a = -bounce(t, CI, 0.11, 8, 15);
  else if (t < O0) a = -0.05 * Math.sin(Math.PI * r01(t, O0 - 0.14, 0.14));
  else a = OPEN * kit.back(r01(t, O0, 0.45));
  lidPivot.rotation.set(a, 0, 0);
  // the carry handle flops up on the slam and falls back flat
  bail.rotation.set(-1.35 + bounce(t, CI, 0.3, 7, 14), 0, 0);

  // the latches: hanging open (pi) until the lid is down, clicked up after the bounce, dropped just before it opens
  latches.forEach((piv, j) => {
    const up = CI + 0.12 + 0.06 * j, drop = O0 - 0.32 + 0.05 * j;
    let l;
    if (t < up) l = Math.PI;
    else if (t < drop) l = Math.PI * (1 - io(r01(t, up, 0.16)));
    else if (t < drop + 0.14) { const p = r01(t, drop, 0.14); l = Math.PI * p * p; }
    else l = Math.PI - bounce(t, drop + 0.14, 0.35, 6, 13);
    piv.rotation.set(l, 0, 0);
  });

  // the box takes a jolt: the slam, the gulp of the request, card 36 dropping home. Squash about the base.
  const sq = ring(t, CI, 0.03, 7, 20) + ring(t, gulp, 0.02, 8, 22) + ring(t, c36Land, 0.015, 8, 20);
  boxG.scale.set(1 + 0.5 * sq, 1 - sq, 1 + 0.5 * sq);
  // the side handles swing out off the wall and fall back against it
  const hs = 0.06 + bounce(t, CI, 0.5, 4, 9) + bounce(t, O0 + 0.15, 0.3, 4, 9) + bounce(t, c36Land, 0.2, 4, 9);
  handles.forEach(([piv, s]) => piv.rotation.set(0, 0, s * hs));
}

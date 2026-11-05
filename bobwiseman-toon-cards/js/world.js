// The world, built once from primitives. Set-pieces expose the parts story.js moves.
// Valley: the camera mostly looks -z at the farm; the castle stands on its hill at z = +200.
import * as THREE from "./lib/three.module.js";
import { TEX, canvasTex, rng } from "./paint.js";

const G = (() => { const d = new Uint8Array([90, 255]); const t = new THREE.DataTexture(d, 2, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const texCache = {};
const tx = (name) => (texCache[name] ||= TEX[name]());
export const toon = (name, color = "#ffffff") => {
  const m = new THREE.MeshToonMaterial({ gradientMap: G, color });
  if (name) m.map = tx(name);
  return m;
};
const flat = (color) => new THREE.MeshToonMaterial({ gradientMap: G, color });

/** box with world-scaled UVs, so a brick is the same size on every face */
export const box = (w, h, d, mat, ts = 2) => {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i; uv.setXY(k, (uv.getX(k) * dims[f][0]) / ts, (uv.getY(k) * dims[f][1]) / ts); }
  const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true; return m;
};
const cyl = (r0, r1, h, mat, seg = 20) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), mat); m.castShadow = m.receiveShadow = true; return m; };
const ball = (r, mat, sx = 1, sy = 1, sz = 1, seg = 22) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.7)), mat); m.scale.set(sx, sy, sz); m.castShadow = m.receiveShadow = true; return m; };
const at = (m, x, y, z) => { m.position.set(x, y, z); return m; };
const add = (parent, ...ms) => { ms.forEach((m) => parent.add(m)); return ms[0]; };

export const textPlane = (w, h, px, draw, { alpha = false } = {}) => {
  const c = document.createElement("canvas"); c.width = px; c.height = Math.round((px * h) / w);
  const g = c.getContext("2d");
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const mat = new THREE.MeshToonMaterial({ gradientMap: G, map: tex, side: THREE.DoubleSide, alphaTest: alpha ? 0.5 : 0, transparent: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.receiveShadow = true;
  m.userData.paint = (...a) => { g.clearRect(0, 0, c.width, c.height); draw(g, c.width, c.height, ...a); tex.needsUpdate = true; };
  m.userData.paint();
  return m;
};

export const tree = (h = 7, seed = 1, trunkMat, leafMat) => {
  const r = rng(seed * 97 + 3), t = new THREE.Group();
  add(t, at(cyl(h * 0.05, h * 0.075, h * 0.55, trunkMat, 10), 0, h * 0.27, 0));
  for (let i = 0; i < 5; i++) {
    const a = i * 1.26 + r(), rad = i ? h * 0.17 : 0, s = h * (0.2 + r() * 0.07);
    add(t, at(ball(s, leafMat, 1, 0.82, 1, 12), Math.cos(a) * rad, h * (0.68 + (i ? r() * 0.12 - 0.04 : 0.1)), Math.sin(a) * rad));
  }
  return t;
};

export function buildWorld(scene, words) {
  const W = {};
  const grass = toon("grass"), stone = toon("stone"), gold = toon("gold"), marble = toon("marble"), wood = toon("wood"), plaster = toon("plaster"), thatch = toon("thatch"), slate = toon("slate"), bark = toon("bark"), leaf = toon("leaf");
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), grass);
  grass.map.repeat.set(1, 1);
  { const uv = ground.geometry.attributes.uv; for (let i = 0; i < 4; i++) uv.setXY(i, uv.getX(i) * 180, uv.getY(i) * 180); }
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  const road = new THREE.Mesh(new THREE.PlaneGeometry(5, 220), toon("road"));
  { const uv = road.geometry.attributes.uv; for (let i = 0; i < 4; i++) uv.setXY(i, uv.getX(i) * 1, uv.getY(i) * 44); }
  road.rotation.x = -Math.PI / 2; at(road, 2, 0.015, 90); road.receiveShadow = true; scene.add(road);
  const soil = new THREE.Mesh(new THREE.PlaneGeometry(64, 26), toon("soil"));
  { const uv = soil.geometry.attributes.uv; for (let i = 0; i < 4; i++) uv.setXY(i, uv.getX(i) * 8, uv.getY(i) * 6); }
  soil.rotation.x = -Math.PI / 2; at(soil, 0, 0.02, -1); soil.receiveShadow = true; scene.add(soil);

  // far land
  const r = rng(77);
  const hillMat = toon("grass", "#d9dfa8");
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + r() * 0.2, d = 260 + r() * 130;
    add(scene, at(ball(70 + r() * 70, hillMat, 1.7, 0.42, 1.2), Math.cos(a) * d, -6, Math.sin(a) * d - 40));
  }
  const rock = flat("#8d8ba6"), snow = flat("#f4f6fa");
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3, d = 620 + r() * 120, h = 150 + r() * 120, w = 110 + r() * 70;
    const mx = Math.cos(a) * d, mz = Math.sin(a) * d;
    add(scene, at(cyl(0.01, w, h, rock, 9), mx, h / 2 - 3, mz));
    add(scene, at(cyl(0.01, w * 0.28, h * 0.28, snow, 9), mx, h * 0.86 - 3, mz));
  }
  for (let i = 0; i < 60; i++) {
    const a = r() * 6.3, d = 62 + r() * 150, x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (z > 130 || (x > 22 && x < 90 && z > -30 && z < 60) || Math.abs(x - 2) < 7) continue;
    add(scene, at(tree(6 + r() * 6, i + 1, bark, leaf), x, 0, z));
  }

  // castle hill and terrace: floor y = 30, front rail at z = 193
  add(scene, at(ball(92, grass, 1.1, 0.42, 0.72), 0, -8, 214));
  const T = (W.terrace = new THREE.Group()); scene.add(T);
  add(T, at(box(48, 30, 28, stone, 5), 0, 15, 207));
  add(T, (() => { const m = at(box(46, 0.12, 27, marble, 3), 0, 30.06, 207); return m; })());
  for (let x = -22; x <= 22; x += 1.1) add(T, at(cyl(0.09, 0.12, 0.92, marble, 8), x, 30.5, 193.3));
  add(T, at(box(46, 0.14, 0.4, gold, 2), 0, 31.0, 193.3));
  add(T, at(box(46, 16, 1.2, stone, 5), 0, 38, 204.6));
  add(T, at(box(46, 0.5, 1.5, gold, 2), 0, 34.6, 204.0));
  for (const x of [-16, -8, 2, 12, 20]) {
    add(T, at(cyl(0.5, 0.56, 8, marble, 16), x, 34, 203.4));
    add(T, at(box(1.6, 0.4, 1.6, gold, 1), x, 38.1, 203.4));
    add(T, at(box(1.6, 0.4, 1.6, gold, 1), x, 30.3, 203.4));
  }
  const door = at(box(4.4, 6.4, 0.3, wood, 2), -3, 33.2, 203.9); add(T, door);
  add(T, at(box(5, 0.4, 0.5, gold, 1), -3, 36.6, 203.8));
  for (const [x, z, rad, h] of [[-24, 197, 4, 34], [24, 197, 4, 34], [-14, 218, 6, 50], [14, 218, 6, 50], [0, 226, 10, 60]]) {
    add(T, at(cyl(rad, rad * 1.04, h, stone, 18), x, 14 + h / 2, z));
    add(T, at(cyl(0.05, rad * 1.34, rad * 2, slate, 18), x, 14 + h + rad, z));
    add(T, at(box(0.15, rad * 0.9, 0.15, wood), x, 14 + h + rad * 2.3, z));
    const fl = at(box(rad * 0.7, rad * 0.32, 0.05, flat("#c0303a")), x + rad * 0.35, 14 + h + rad * 2.5, z); add(T, fl);
    (W.flags ||= []).push(fl);
  }
  add(T, at(box(30, 18, 16, stone, 5), 0, 40, 216));
  // court: dais, throne, urns of gold
  add(T, at(box(5, 0.5, 2.8, marble, 2), 9, 30.3, 202));
  add(T, at(box(1.5, 2.6, 0.26, gold, 1), 9, 32, 202.7));
  add(T, at(box(1.3, 0.2, 1.1, toon(null, "#a52a3a")), 9, 31.25, 202.1));
  for (const [x, z] of [[6.6, 200.8], [11.4, 200.8], [4.8, 199.2], [13.4, 199.2]]) {
    add(T, at(cyl(0.34, 0.2, 0.9, gold, 14), x, 30.57, z));
    add(T, at(ball(0.42, gold, 1, 0.86, 1, 14), x, 31.2, z));
    add(T, at(cyl(0.3, 0.3, 0.14, gold, 14), x, 31.6, z));
  }
  // telescope on its tripod
  const S = (W.scope = new THREE.Group()); at(S, -1.5, 30.12, 195.4); T.add(S);
  for (const a of [0.4, 2.5, 4.6]) { const leg = cyl(0.03, 0.03, 1.08, wood, 6); leg.position.set(Math.cos(a) * 0.2, 0.5, Math.sin(a) * 0.2); leg.rotation.set(Math.sin(a) * 0.34, 0, -Math.cos(a) * 0.34); S.add(leg); }
  const brass = toon("gold", "#e6c070");
  const tube = new THREE.Group(); at(tube, 0, 1.06, 0); tube.rotation.x = -0.14; S.add(tube);
  { const a = cyl(0.075, 0.075, 0.74, brass, 14); a.rotation.x = Math.PI / 2; a.position.z = 0.2; tube.add(a); }
  { const a = cyl(0.11, 0.09, 0.56, brass, 14); a.rotation.x = Math.PI / 2; a.position.z = -0.36; tube.add(a); }
  W.lensCoin = cyl(0.135, 0.135, 0.035, gold, 18); W.lensCoin.rotation.x = Math.PI / 2; W.lensCoin.position.z = -0.65; tube.add(W.lensCoin);

  // valley props: the sack, the price post, the notice board
  W.sack = new THREE.Group(); scene.add(W.sack);
  add(W.sack, ball(0.42, toon(null, "#b58a4e"), 1, 1.1, 1, 16));
  add(W.sack, at(cyl(0.14, 0.2, 0.12, toon(null, "#6c4a24"), 12), 0, 0.46, 0));
  add(W.sack, at(cyl(0.2, 0.08, 0.2, toon(null, "#b58a4e"), 12), 0, 0.6, 0));
  add(scene, at(box(0.16, 2.3, 0.16, wood, 1), 6, 1.15, 23));
  W.tag = textPlane(1.4, 0.82, 512, (g, w, h) => {
    g.fillStyle = "#f3e7c8"; g.fillRect(0, 0, w, h); g.strokeStyle = "#241726"; g.lineWidth = 12; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = "#b52a2a"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "900 104px Georgia, serif"; g.fillText(words.cheap, w / 2, h / 2 + 4);
  });
  at(W.tag, 6, 1.75, 23.12); scene.add(W.tag);

  const lawDraw = (g, w, h, hole = 0) => {
    g.fillStyle = "#efe2c0"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#241726"; g.lineWidth = 14; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = "#241726"; g.textAlign = "center"; g.font = "900 96px Georgia, serif"; g.fillText(words.law, w / 2, 124);
    g.font = "400 28px Georgia, serif"; g.textAlign = "left";
    for (let i = 0; i < 15; i++) { g.fillStyle = "#4a3c34"; const y = 190 + i * 46; const r2 = rng(i + 5); g.fillRect(52, y, (w - 104) * (0.55 + r2() * 0.45), 11); }
    if (hole > 0) {
      const dw = w * 0.44, dh = h * 0.62 * hole, dx = w * 0.28, dy = h - dh - 12;
      g.globalCompositeOperation = "destination-out"; g.fillStyle = "#000";
      g.beginPath(); g.rect(dx, dy + dw / 2, dw, dh - dw / 2); g.arc(dx + dw / 2, dy + dw / 2, dw / 2, Math.PI, 0); g.fill();
      g.globalCompositeOperation = "source-over";
      g.strokeStyle = "#241726"; g.lineWidth = 9; g.setLineDash([22, 14]);
      g.beginPath(); g.moveTo(dx, h - 12); g.lineTo(dx, dy + dw / 2); g.arc(dx + dw / 2, dy + dw / 2, dw / 2, Math.PI, 0); g.lineTo(dx + dw, h - 12); g.stroke(); g.setLineDash([]);
    }
  };
  W.law = textPlane(2.1, 2.5, 640, lawDraw, { alpha: true }); at(W.law, 9.5, 1.33, 23); scene.add(W.law);
  for (const s of [-1, 1]) add(scene, at(box(0.14, 2.9, 0.14, wood, 1), 9.5 + s * 1.12, 1.45, 23));
  add(scene, at(box(2.5, 0.16, 0.2, wood, 1), 9.5, 2.68, 23));

  // farm
  const H = new THREE.Group(); at(H, -14, 0, -16); scene.add(H);
  add(H, at(box(10, 4.2, 8, plaster, 3), 0, 2.1, 0));
  { const roof = cyl(0.05, 7.4, 3.4, thatch, 4); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.78); add(H, at(roof, 0, 5.9, 0)); }
  add(H, at(box(1.7, 2.6, 0.14, wood, 1.5), 0, 1.3, 4.04));
  add(H, at(box(2.1, 0.2, 0.26, wood, 1), 0, 2.7, 4.06));
  for (const x of [-3.2, 3.2]) { add(H, at(box(1.5, 1.2, 0.1, toon(null, "#32455c")), x, 2.4, 4.03)); add(H, at(box(1.7, 0.12, 0.26, wood, 1), x, 1.75, 4.05)); }
  add(H, at(box(1.1, 2.4, 1.1, stone, 2), 3.2, 6.8, -1));
  W.notice = textPlane(0.95, 1.2, 420, (g, w, h) => {
    g.fillStyle = "#f8f1d8"; g.fillRect(0, 0, w, h); g.strokeStyle = "#241726"; g.lineWidth = 8; g.strokeRect(5, 5, w - 10, h - 10);
    for (let i = 0; i < 9; i++) { g.fillStyle = "#6a5a4e"; g.fillRect(40, 44 + i * 26, w - 80, 8); }
    g.save(); g.translate(w / 2, h * 0.62); g.rotate(-0.16); g.strokeStyle = "#b52a2a"; g.lineWidth = 11; g.strokeRect(-178, -52, 356, 104);
    g.fillStyle = "#b52a2a"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "900 62px Georgia, serif"; g.fillText(words.evict, 0, 4); g.restore();
  });
  at(W.notice, 0, 1.55, 4.13); H.add(W.notice);

  // cabbages, instanced so the herd can flatten them
  const cabGeo = new THREE.SphereGeometry(0.36, 12, 9);
  const cabPts = [];
  for (let z = -11; z <= 10; z += 1.5) for (let x = -30; x <= 30; x += 1.15) {
    if (x < -8 && x > -21 && z < -2) continue;
    if (x > -3.6 && x < 5 && z > -3.5 && z < 6) continue;
    if (Math.abs(x - 2) < 2.6) continue;
    if (x < -8.5 && x > -15.5 && z > -4) continue;
    cabPts.push([x + Math.sin(x * z) * 0.1, z + Math.cos(x * 3) * 0.1, 0.8 + Math.abs(Math.sin(x * 7.1 + z)) * 0.5]);
  }
  W.cabPts = cabPts;
  W.cabs = new THREE.InstancedMesh(cabGeo, toon("leaf", "#b8e18d"), cabPts.length); W.cabs.castShadow = true; W.cabs.frustumCulled = false; W.cabs.receiveShadow = true; scene.add(W.cabs);
  W.cabM = new THREE.Object3D();
  // fence on the road side
  for (let x = -34; x <= 34; x += 3.4) { if (Math.abs(x - 2) < 3.5) continue; add(scene, at(box(0.14, 1.3, 0.14, wood, 1), x, 0.65, 15)); }
  for (const y of [0.56, 1.06]) { add(scene, at(box(30, 0.05, 0.05, wood, 1), -18.5, y, 15)); add(scene, at(box(28, 0.05, 0.05, wood, 1), 20, y, 15)); }

  // forest hill: story.js squashes it and tips the trees
  W.fHill = at(ball(34, grass, 1.05, 0.62, 0.8), 54, -6, 28); scene.add(W.fHill);
  W.fTrees = [];
  { const r3 = rng(91); for (let i = 0; i < 30; i++) {
      const a = r3() * 6.3, q = 0.2 + r3() * 0.74, x = 54 + Math.cos(a) * q * 28, z = 28 + Math.sin(a) * q * 22;
      const t = tree(7 + r3() * 4, 200 + i, bark, leaf); scene.add(t);
      W.fTrees.push({ t, x, z, q, a: r3() * 6.3, base: () => 0 });
  } }
  // bulldozer
  const D = (W.dozer = new THREE.Group()); scene.add(D);
  const yellow = toon(null, "#f0b429"), blk = flat("#2a2c33");
  add(D, at(box(3.2, 1.3, 2.1, yellow, 2), 0, 1.15, 0));
  add(D, at(box(1.5, 1.4, 1.7, yellow, 2), -0.7, 2.4, 0));
  add(D, at(box(1.3, 0.9, 1.74, toon(null, "#9fd0e8")), -0.7, 2.55, 0));
  for (const s of [-1, 1]) add(D, at(box(3.6, 0.8, 0.5, blk, 1), 0, 0.42, s * 1.15));
  add(D, at(box(0.22, 1.5, 3.3, yellow, 1), 2.25, 0.85, 0));
  add(D, at(cyl(0.08, 0.08, 1.2, blk, 8), 0.8, 2.3, 0.6));

  // biplane
  const Pl = (W.plane = new THREE.Group()); scene.add(Pl);
  const red = toon(null, "#d8452f"), cream = toon(null, "#f3e7c8");
  { const b = cyl(0.55, 0.26, 5.2, red, 14); b.rotation.z = Math.PI / 2; add(Pl, b); }
  for (const y of [0.85, -0.45]) add(Pl, at(box(1.5, 0.1, 9.6, cream, 2), 0.5, y, 0));
  for (const z of [-3.6, 3.6, -1.2, 1.2]) add(Pl, at(cyl(0.035, 0.035, 1.3, blk, 6), 0.5, 0.2, z));
  add(Pl, at(box(1.2, 0.09, 3, cream, 2), -2.45, 0.12, 0));
  add(Pl, at(box(1, 1.1, 0.09, red, 2), -2.45, 0.6, 0));
  W.prop = at(box(0.1, 2.4, 0.24, blk), 2.72, 0, 0); Pl.add(W.prop);
  add(Pl, at(cyl(0.34, 0.34, 0.5, cream, 10), 0.4, -0.75, 0));

  // the stump and the watch
  add(scene, at(cyl(0.72, 0.84, 0.72, bark, 18), 24, 0.36, -20));
  { const top = new THREE.Mesh(new THREE.CircleGeometry(0.72, 24), toon(null, "#d9b27a")); top.rotation.x = -Math.PI / 2; at(top, 24, 0.725, -20); top.receiveShadow = true; scene.add(top); }
  const WG = (W.watch = new THREE.Group()); at(WG, 24, 1.13, -20.05); scene.add(WG);
  { const c = cyl(0.42, 0.42, 0.14, gold, 26); c.rotation.x = Math.PI / 2; WG.add(c); }
  add(WG, at(cyl(0.05, 0.05, 0.1, gold, 8), 0, 0.48, 0));
  { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.022, 8, 18), gold); ring.position.y = 0.58; ring.castShadow = true; WG.add(ring); }
  W.dial = textPlane(0.72, 0.72, 400, (g, w, h, sec = 0) => {
    g.clearRect(0, 0, w, h); g.fillStyle = "#fbf5e4"; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 2, 0, 7); g.fill();
    g.strokeStyle = "#241726"; g.lineWidth = 8; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 7, 0, 7); g.stroke();
    g.fillStyle = "#241726"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "800 40px Georgia, serif";
    for (let i = 1; i <= 12; i++) { const a = (i / 12) * 6.283 - 1.571; g.fillText(String(i), w / 2 + Math.cos(a) * 148, h / 2 + Math.sin(a) * 148); }
    const hand = (a, l, lw, col) => { g.strokeStyle = col; g.lineWidth = lw; g.lineCap = "round"; g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2 + Math.cos(a) * l, h / 2 + Math.sin(a) * l); g.stroke(); };
    hand(sec * 0.083 - 1.571, 84, 13, "#241726"); hand(sec - 1.571, 124, 8, "#241726"); hand(sec * 6 - 1.571, 134, 4, "#b52a2a");
  }, { alpha: true });
  W.dial.geometry = new THREE.CircleGeometry(0.36, 40); W.dial.rotation.y = Math.PI; W.dial.position.z = -0.075; WG.add(W.dial);
  W.coins = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.11, 0.11, 0.035, 14), gold, 110); W.coins.castShadow = true; W.coins.frustumCulled = false; scene.add(W.coins);

  // the boardroom, far from the valley
  const R = (W.room = new THREE.Group()); at(R, 1000, 0, 1000); scene.add(R);
  const wallM = toon("wall");
  add(R, at(box(14, 0.2, 16, toon("carpet"), 3), 0, -0.1, 2));
  add(R, at(box(14, 5.4, 0.3, wallM, 2.4), 0, 2.7, 6.2));
  add(R, at(box(0.3, 5.4, 16, wallM, 2.4), -7, 2.7, 2));
  add(R, at(box(0.3, 5.4, 16, wallM, 2.4), 7, 2.7, 2));
  add(R, at(box(14, 0.2, 16, toon("plaster", "#e8d0a8"), 3), 0, 5.4, 2));
  const win = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.8), new THREE.ShaderMaterial({
    uniforms: {}, vertexShader: "varying vec2 v; void main(){ v=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
    fragmentShader: "varying vec2 v; void main(){ vec3 a=vec3(.05,.08,.26), b=vec3(.85,.34,.24); vec3 c=mix(b,a,smoothstep(.1,.85,v.y)); float s=step(v.y,.2+.05*sin(v.x*9.)); c=mix(c,vec3(.02,.02,.05),s); gl_FragColor=vec4(c,1.);}",
  }));
  win.rotation.y = Math.PI; at(win, 0, 2.85, 6.03); R.add(win);
  for (const x of [-1.7, 1.7]) add(R, at(box(0.12, 3, 0.12, gold, 1), x, 2.85, 6.0));
  add(R, at(box(3.6, 0.12, 0.12, gold, 1), 0, 4.3, 6.0));
  add(R, at(box(3.6, 0.12, 0.12, gold, 1), 0, 1.42, 6.0));
  add(R, at(box(0.08, 2.9, 0.1, gold, 1), 0, 2.85, 6.0));
  add(R, at(box(6.6, 0.12, 2.5, toon("table"), 1.6), 0, 0.84, 1.75));
  add(R, at(box(6.5, 0.72, 0.1, toon("table"), 1.6), 0, 0.42, 0.55));
  for (const [x, z] of [[-3, 0.7], [3, 0.7], [-3, 2.8], [3, 2.8]]) add(R, at(cyl(0.09, 0.07, 0.78, toon("table"), 8), x, 0.39, z));
  // lamp
  add(R, at(cyl(0.015, 0.015, 2.5, blk, 6), 0, 4.15, 1.6));
  { const shade2 = cyl(0.12, 0.42, 0.34, toon(null, "#2e6d4f"), 16); add(R, at(shade2, 0, 2.8, 1.6)); }
  W.lamp = new THREE.PointLight("#ffd9a0", 0, 14, 1.4); at(W.lamp, 1000, 2.55, 1001.6); scene.add(W.lamp);
  W.report = textPlane(0.56, 0.74, 620, (g, w, h, draw = 0, stamped = 0) => {
    g.fillStyle = "#f8f3e2"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#241726"; g.textAlign = "center"; g.font = "900 62px Georgia, serif"; g.fillText(words.report, w / 2, 86);
    g.fillRect(40, 104, w - 80, 6);
    const cx0 = 66, cy0 = 500, cw = w - 132, ch = 320;
    g.strokeStyle = "#241726"; g.lineWidth = 6; g.beginPath(); g.moveTo(cx0, cy0 - ch); g.lineTo(cx0, cy0); g.lineTo(cx0 + cw, cy0); g.stroke();
    g.strokeStyle = "#b9ad92"; g.lineWidth = 3; for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(cx0, cy0 - (ch * i) / 5); g.lineTo(cx0 + cw, cy0 - (ch * i) / 5); g.stroke(); }
    const n = 40, m = Math.max(1, Math.floor(n * draw));
    g.strokeStyle = "#2f7d4f"; g.lineWidth = 11; g.lineJoin = "round"; g.beginPath();
    for (let i = 0; i <= m; i++) { const u = i / n; const y = cy0 - ch * (0.1 + 0.86 * u ** 2.3) + Math.sin(i * 1.7) * 7; const x = cx0 + cw * u; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    g.fillStyle = "#241726"; g.textAlign = "left"; g.font = "800 44px Georgia, serif"; g.fillText(words.facts + ":", 52, 590);
    if (stamped) {
      g.save(); g.translate(w / 2, 690); g.rotate(-0.13); g.strokeStyle = "#c4232e"; g.lineWidth = 12; g.strokeRect(-262, -68, 524, 118);
      g.fillStyle = "#c4232e"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "900 70px Georgia, serif"; g.fillText(words.stamp, 0, -9); g.restore();
    }
  });
  W.report.rotation.set(-Math.PI / 2, 0, Math.PI); at(W.report, 1000, 0.905, 1001.55); scene.add(W.report);
  const St = (W.stamper = new THREE.Group()); scene.add(St);
  add(St, at(box(0.3, 0.05, 0.14, flat("#2a2c33"), 1), 0, 0.025, 0));
  add(St, at(cyl(0.022, 0.034, 0.13, toon(null, "#a56f3e"), 10), 0, 0.11, 0));
  add(St, at(ball(0.05, toon(null, "#a56f3e"), 1, 0.9, 1, 12), 0, 0.2, 0));
  return W;
}

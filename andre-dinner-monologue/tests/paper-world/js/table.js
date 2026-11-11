// table.js: the world. One dinner table built as a paper model: a torn cream cloth on navy crumpled paper,
// two place settings, a candle, a bottle, two glasses, salt and pepper, a bread basket, a napkin, a potted
// sapling. On "New York" every piece telescopes up out of the cloth into a tower and the cutlery deals out
// along the table edge and hinges up as the fence. Every piece has a stable name (for blocking.json).
import { THREE, PAL, paper, card, tube, disc, ring, box, strip, windows, setWindows, rng, hash, clamp, lerp, smooth, spring, mixHex, edgeOf } from "./kit.js";
import { LAY, C, CH, FENCE_POLY, GATE, FENCE_T0, RISERS, riseAt, treeAt, flameAt } from "./story.js";

const named = (o, name) => { o.name = name; return o; };
const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };

// ---------- room and cloth
function tornRect(hw, hd, seed, step = 1.3, amp = 0.38) {
  const r = rng(seed), pts = [], side = (ax, az, bx, bz) => { const n = Math.round(Math.hypot(bx - ax, bz - az) / step); for (let i = 0; i < n; i++) { const t = i / n, nx = bz - az, nz = -(bx - ax), l = Math.hypot(nx, nz), j = (r() - 0.5) * 2 * amp + (r() < 0.07 ? -amp * 2 * r() : 0); pts.push([lerp(ax, bx, t) + (nx / l) * j, lerp(az, bz, t) + (nz / l) * j]); } };
  side(-hw, -hd, hw, -hd); side(hw, -hd, hw, hd); side(hw, hd, -hw, hd); side(-hw, hd, -hw, -hd);
  return pts.map(([x, z]) => [x, -z]);          // the card is cut in xy and laid flat (y -> -z)
}
function buildRoom(world) {
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), paper("#2f3788", { tile: 46, amount: 0.34, bump: 0.3, emissive: "#12153a", emissiveIntensity: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.3; floor.receiveShadow = true; world.add(named(floor, "room_floor"));
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(420, 420, 700, 40, 1, true), paper("#262d74", { tile: 60, amount: 0.3, bump: 0.2, double: true, emissive: "#12153a", emissiveIntensity: 1 }));
  wall.position.y = 349; world.add(named(wall, "room_wall"));
  const { hw, hd } = LAY.cloth;
  const core = card(tornRect(hw + 0.55, hd + 0.55, 7, 1.1, 0.5), PAL.core, 0.12, { cast: false }); core.rotation.x = -Math.PI / 2; core.position.y = -0.2; world.add(named(core, "cloth_core"));
  const cloth = card(tornRect(hw, hd, 3), PAL.cream, 0.3, { cast: false, edge: PAL.core, mat: { tile: 30, amount: 0.07, bump: 0.05 } });
  cloth.rotation.x = -Math.PI / 2; cloth.position.y = -0.15; world.add(named(cloth, "cloth"));
  // the folds the cloth was stored in
  for (const [i, x] of [-15, 15].entries()) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 2 * hd - 1.5), paper(mixHex(PAL.cream, PAL.umber, 0.1))); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.006, 0); m.receiveShadow = true; world.add(named(m, "cloth_fold_x" + i)); }
  for (const [i, z] of [-21.7, 21.7].entries()) { const m = new THREE.Mesh(new THREE.PlaneGeometry(2 * hw - 1.5, 0.16), paper(mixHex(PAL.cream, PAL.umber, 0.1))); m.rotation.x = -Math.PI / 2; m.position.set(0, 0.006, z); m.receiveShadow = true; world.add(named(m, "cloth_fold_z" + i)); }
}

// ---------- window rows on a round wall: y0..y1 in the carrier's local space
function ringWindows(list, r, y0, y1, o = {}) {
  const rowH = o.rowH ?? 1.45, pitch = o.pitch ?? 1.35, ww = o.w ?? 0.55, wh = o.h ?? 0.72, rows = Math.max(1, Math.floor((y1 - y0) / rowH)), n = Math.max(6, Math.floor((2 * Math.PI * r) / pitch));
  for (let j = 0; j < rows; j++) for (let i = 0; i < n; i++) {
    const a = ((i + (j % 2) * 0.5) / n) * Math.PI * 2, y = y0 + (j + 0.5) * ((y1 - y0) / rows);
    if (hash(i * 31 + j, o.seed ?? 1) < (o.skip ?? 0.12)) continue;
    list.push({ p: [Math.cos(a) * (r + 0.035), y, Math.sin(a) * (r + 0.035)], n: [Math.cos(a), Math.sin(a)], w: ww, h: wh, row: j, seed: hash(i, j * 7 + (o.seed ?? 1)) });
  }
  return rows;
}
// a slot: the pale cut in the cloth that a riser comes up through
const slot = (r, name) => named(at(ring(r + 0.05, r + 0.45, PAL.core), 0, 0.012, 0), name);

// ---------- plate -> stacked masonry tower. Tiers are nested paper drums that telescope up out of the cloth.
function buildPlate(world, name, [x, z], tops, risers) {
  const g = named(new THREE.Group(), name); g.position.set(x, 0, z); world.add(g);
  const n = tops.length, R = LAY.plateR, radii = tops.map((_, k) => R * (1 - 0.72 * Math.pow(k / n, 0.85)));
  const rest = tops.map((_, k) => (k === 0 ? 0.9 : k === 1 ? 0.72 : 0.58));
  g.add(slot(R, name + ".slot"));
  const tiers = tops.map((top, k) => {
    const t = named(new THREE.Group(), `${name}.tier_${k}`), r = radii[k], rIn = k + 1 < n ? radii[k + 1] : 0, H = top + 1;
    const wallCol = k % 2 ? mixHex(PAL.peach, PAL.umber, 0.42) : PAL.peach;
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(r, r, H, 30, 1, true), paper(wallCol, { double: true })); wall.position.y = -H / 2; wall.castShadow = wall.receiveShadow = true; t.add(wall);
    const topCol = k === 0 ? PAL.peach : mixHex(PAL.peach, PAL.core, 0.55);
    const cap = rIn ? ring(rIn - 0.04, r, topCol, { seg: 30 }) : at(disc(r, mixHex(PAL.umber, PAL.peach, 0.2), 0.3), 0, -0.3, 0); cap.receiveShadow = true; t.add(cap);
    const cornice = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.09, r + 0.09, 0.34, 30, 1, true), paper(PAL.umber, { double: true })); cornice.position.y = -0.17; cornice.castShadow = true; t.add(cornice);
    if (k === n - 1) t.add(at(tube(0.9, 0.7, 0.9, PAL.umber, { seg: 10 }), 0, 0, 0));          // the knob on top
    const list = [], band = top - (k ? tops[k - 1] : 0);
    const rows = ringWindows(list, r + 0.02, -band + 0.5, -0.55, { seed: k + (z > 0 ? 40 : 0) });
    const win = windows(list); win.userData.tier = k; t.add(win);
    g.add(t); return { t, win, top, rest: rest[k], k, band, rows };
  });
  let floor0 = 0; for (const T of tiers) { T.floor0 = floor0; floor0 += T.rows; }
  risers.push({
    name, group: g, update(f) {
      let y = 0, prevRest = 0, prevTop = 0;
      for (const T of tiers) {
        const gk = riseAt(name, f, T.k);                         // each tier's extension springs out of the one below, 3 frames apart
        y += (T.rest - prevRest) + ((T.top - prevTop) - (T.rest - prevRest)) * gk;
        T.t.position.y = y; prevRest = T.rest; prevTop = T.top;
        const t0 = C.newyork1 + 3 * RISERS.indexOf(name) + 3 * T.k + 5;
        setWindows(T.win, (w) => (w.seed < 0.16 ? 0 : clamp((f - (t0 + (T.floor0 + w.row) * 1.6 + w.seed * 6)) / 4)));
      }
    },
  });
}

// ---------- pop-up struts: a paper tab hinged on the cloth that swings up against a riser
function strut(world, name, x, z, ang, len, w, colour) {
  const g = named(new THREE.Group(), name); g.position.set(x, 0.02, z); g.rotation.y = ang; const s = strip(w, len, colour, 0.08); g.add(s); world.add(g);
  return (k) => { s.rotation.x = -k * 1.92; };                  // 0 flat on the cloth, 110 degrees = leaning on the tower
}
function struts(world, name, [x, z], r, colour, len = 4.6) {
  const fs = [0.6, 0.6 + Math.PI].map((a, i) => strut(world, `${name}.strut_${"ab"[i]}`, x + Math.sin(a) * (r + len * 0.36), z + Math.cos(a) * (r + len * 0.36), a, len, 1.3, colour));
  return (k) => fs.forEach((f) => f(k));
}

// ---------- glass -> green tower lit from inside
function buildGlass(world, name, [x, z], risers) {
  const g = named(new THREE.Group(), name); g.position.set(x, 0, z); world.add(g);
  g.add(named(disc(3.4, PAL.teal, 0.22, { seg: 20 }), name + ".foot"));
  g.add(named(at(tube(0.42, 0.42, 11, PAL.teal, { seg: 8 }), 0, 0.2, 0), name + ".stem"));
  const up = named(new THREE.Group(), name + ".upper"); g.add(up);
  const inner = tube(0.3, 0.3, 26, mixHex(PAL.teal, PAL.core, 0.2), { seg: 8 }); inner.position.y = -15; up.add(inner);
  const glow = paper(PAL.green, { flat: true, double: true, emissive: "#c7a43a", emissiveIntensity: 0, k: name });
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 1.25, 8, 12, 1, true), glow); bowl.position.y = 15; bowl.castShadow = bowl.receiveShadow = true; up.add(bowl);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 0.3, 1.1, 12, 1, false), paper(PAL.green, { flat: true })); base.position.y = 10.5; base.castShadow = true; up.add(base);
  up.add(at(ring(3.9, 4.25, mixHex(PAL.green, PAL.core, 0.6), { seg: 12 }), 0, 19.0, 0));
  const list = [];
  for (let j = 0; j < 4; j++) for (let i = 0; i < 12; i++) { const y = 12.3 + j * 1.7, r = lerp(1.25, 4.2, (y - 11) / 8) * Math.cos(Math.PI / 12) + 0.05, a = ((i + 0.5) / 12) * Math.PI * 2; if (hash(i, j + 90) < 0.15) continue; const m = Math.min(2, Math.max(1, Math.round(r / 1.5))); for (let q = 0; q < m; q++) { const off = (q - (m - 1) / 2) * 0.75; list.push({ p: [Math.cos(a) * r - Math.sin(a) * off, y, Math.sin(a) * r + Math.cos(a) * off], n: [Math.cos(a), Math.sin(a)], w: 0.5, h: 0.75, row: j, seed: hash(i * 3 + q, j) }); } }
  const win = windows(list); up.add(win);
  const st = struts(world, name, [x, z], 0.6, PAL.teal, 4.2);
  risers.push({ name, group: g, update(f) { const k = riseAt(name, f); up.position.y = 14 * k; st(clamp(k)); glow.emissiveIntensity = 0.3 * clamp(k); const t0 = C.newyork1 + 3 * RISERS.indexOf(name) + 6; setWindows(win, (w) => clamp((f - (t0 + w.row * 2.5 + w.seed * 6)) / 4)); } });
}

// ---------- bottle -> navy tower with lit windows and a paper spire
function buildBottle(world, name, [x, z], risers) {
  const g = named(new THREE.Group(), name); g.position.set(x, 0, z); world.add(g);
  g.add(slot(3.7, name + ".slot"));
  g.add(named(tube(3.7, 3.7, 20, PAL.navy, { seg: 16 }), name + ".body"));
  const label = new THREE.Mesh(new THREE.CylinderGeometry(3.78, 3.78, 6, 16, 1, true), paper(PAL.umber, { flat: true })); label.position.y = 9; g.add(named(label, name + ".label"));
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(3.84, 3.84, 1.3, 16, 1, true), paper(PAL.cream, { flat: true })); stripe.position.y = 9.2; g.add(stripe);
  const up = named(new THREE.Group(), name + ".upper"); g.add(up);
  up.add(at(tube(3.42, 3.42, 21, mixHex(PAL.navy, PAL.indigo, 0.5), { seg: 16 }), 0, -1, 0));
  up.add(at(tube(3.7, 1.35, 3.6, PAL.navy, { seg: 16 }), 0, 20, 0));
  up.add(at(tube(1.35, 1.25, 5.6, PAL.navy, { seg: 12 }), 0, 23.6, 0));
  up.add(at(tube(1.45, 1.45, 0.5, PAL.gold, { seg: 12 }), 0, 28.4, 0));
  up.add(at(tube(1.2, 0.02, 2.8, PAL.cream, { seg: 10 }), 0, 28.9, 0));
  const lo = [], hi = [];
  ringWindows(lo, 3.7 * Math.cos(Math.PI / 16), 13.2, 19.4, { seed: 5, pitch: 1.5 }); ringWindows(lo, 3.7 * Math.cos(Math.PI / 16), 1.2, 5.6, { seed: 6, pitch: 1.5 });
  ringWindows(hi, 3.42 * Math.cos(Math.PI / 16), 4.6, 19.4, { seed: 8, pitch: 1.5 });
  const wl = windows(lo), wh = windows(hi); g.add(wl); up.add(wh);
  const st = struts(world, name, [x, z], 3.7, PAL.navy, 5.2);
  risers.push({ name, group: g, update(f) { const k = riseAt(name, f), t0 = C.newyork1 + 3 * RISERS.indexOf(name) + 4; up.position.y = 16 * k; st(clamp(k));
    setWindows(wl, (w) => (w.seed < 0.2 ? 0 : clamp((f - (t0 + (w.p[1] / 1.5) * 1.3 + w.seed * 6)) / 4)));
    setWindows(wh, (w) => (w.seed < 0.2 || w.p[1] + up.position.y < 20.4 ? 0 : clamp((f - (t0 + 18 + (w.p[1] / 1.5) * 1.3 + w.seed * 6)) / 4))); } });
}

// ---------- salt and pepper -> squat towers
function buildShaker(world, name, [x, z], colour, cap, rise, risers) {
  const g = named(new THREE.Group(), name); g.position.set(x, 0, z); world.add(g);
  g.add(slot(1.55, name + ".slot"));
  const up = named(new THREE.Group(), name + ".upper"); g.add(up);
  up.add(at(tube(1.42, 1.42, rise + 1, mixHex(colour, PAL.umber, 0.25), { seg: 10 }), 0, -rise - 1, 0));
  up.add(tube(1.55, 1.45, 5, colour, { seg: 10 })); up.add(at(tube(1.6, 1.2, 0.9, cap, { seg: 10 }), 0, 5, 0));
  const list = []; ringWindows(list, 1.42 * Math.cos(Math.PI / 10), -rise + 0.4, -0.3, { pitch: 1.2, seed: x }); ringWindows(list, 1.5 * Math.cos(Math.PI / 10), 0.6, 4.6, { pitch: 1.2, seed: x + 3 });
  const win = windows(list); up.add(win);
  risers.push({ name, group: g, update(f) { const k = riseAt(name, f), t0 = C.newyork1 + 3 * RISERS.indexOf(name) + 5; up.position.y = rise * k; setWindows(win, (w) => (w.seed < 0.15 ? 0 : clamp((f - (t0 + (w.p[1] + rise) * 1.2 + w.seed * 6)) / 4))); } });
}

// ---------- bread basket -> the dome
function buildBasket(world, name, [x, z], risers) {
  const g = named(new THREE.Group(), name); g.position.set(x, 0, z); world.add(g);
  const rimM = new THREE.Mesh(new THREE.CylinderGeometry(8, 7, 4.2, 18, 1, true), paper(PAL.umber, { flat: true, double: true })); rimM.position.y = 2.1; rimM.castShadow = rimM.receiveShadow = true; g.add(named(rimM, name + ".rim"));
  for (const y of [1.2, 2.4, 3.6]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(7.3 + y * 0.24 + 0.06, 7.3 + (y - 0.35) * 0.24 + 0.06, 0.35, 18, 1, true), paper(mixHex(PAL.umber, PAL.peach, 0.35), { flat: true })); b.position.y = y; g.add(b); }
  g.add(at(disc(7.1, mixHex(PAL.umber, PAL.navy, 0.3), 0.1, { cast: false }), 0, 0.05, 0));
  const up = named(new THREE.Group(), name + ".dome"); g.add(up);
  const drum = tube(6.6, 6.6, 12, mixHex(PAL.umber, PAL.peach, 0.22), { seg: 18 }); drum.position.y = -12; up.add(drum);
  const domeM = new THREE.Mesh(new THREE.SphereGeometry(6.8, 14, 5, 0, Math.PI * 2, 0, Math.PI / 2), paper(mixHex(PAL.umber, PAL.peach, 0.3), { flat: true })); domeM.castShadow = domeM.receiveShadow = true; up.add(domeM);
  up.add(at(tube(0.7, 0.5, 1, PAL.gold, { seg: 8 }), 0, 0, 0));
  const list = []; ringWindows(list, 6.6 * Math.cos(Math.PI / 18), -8.4, -0.5, { seed: 21 }); const win = windows(list); up.add(win);
  const knob = up.children[up.children.length - 2];
  risers.push({ name, group: g, update(f) { const k = riseAt(name, f), t0 = C.newyork1 + 3 * RISERS.indexOf(name) + 5; up.position.y = 2.2 + 9 * k; const sy = lerp(0.42, 1, clamp(k, 0, 1.2)); domeM.scale.y = sy; knob.position.y = 6.8 * sy - 0.1; setWindows(win, (w) => (w.seed < 0.15 ? 0 : clamp((f - (t0 + (w.p[1] + 9) * 1.2 + w.seed * 6)) / 4))); } });
}

// ---------- napkin: a tent fold that lifts on a paper box (a gabled hall)
function buildNapkin(world, name, [x, z], risers) {
  const g = named(new THREE.Group(), name); g.position.set(x, 0, z); world.add(g);
  const up = named(new THREE.Group(), name + ".fold"); g.add(up);
  for (const s of [-1, 1]) { const leaf = strip(8.5, 5.4, PAL.lavender, 0.1); leaf.position.set(0, 0, s * 3.6); leaf.rotation.set(s * 0.84, s > 0 ? Math.PI : 0, 0); if (s < 0) leaf.rotation.x = -0.84; up.add(leaf); }
  up.add(at(box(8.3, 5, 6.9, mixHex(PAL.lavender, PAL.navy, 0.3)), 0, -5, 0));
  risers.push({ name, group: g, update(f) { up.position.y = 4.6 * riseAt(name, f); } });
}

// ---------- candle and flame
function buildCandle(world) {
  const [x, z] = LAY.candle, g = named(new THREE.Group(), "candle"); g.position.set(x, 0, z); world.add(g);
  g.add(disc(2.3, PAL.gold, 0.25, { seg: 16 })); g.add(at(disc(1.45, mixHex(PAL.gold, PAL.umber, 0.25), 0.25, { seg: 12 }), 0, 0.25, 0));
  const body = tube(0.95, 0.95, 8.6, "#f6ead2", { seg: 12, cast: false, mat: { emissive: "#7a4a18", emissiveIntensity: 0.35 } }); body.position.y = 0.5; g.add(named(body, "candle.body"));
  g.add(at(box(0.12, 0.55, 0.12, "#2a1d18", { cast: false }), 0, 9.1, 0));
  const flame = named(new THREE.Group(), "flame"); flame.position.set(0, 9.35, 0); g.add(flame);
  const fs = new THREE.Shape(); fs.moveTo(0, 0); fs.bezierCurveTo(0.62, 0.25, 0.5, 1.1, 0, 2.15); fs.bezierCurveTo(-0.5, 1.1, -0.62, 0.25, 0, 0);
  const fm = new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffd98a").multiplyScalar(3.2), side: THREE.DoubleSide, toneMapped: false });
  const core = new THREE.MeshBasicMaterial({ color: new THREE.Color("#fff3d0").multiplyScalar(4.5), side: THREE.DoubleSide, toneMapped: false });
  for (const a of [0, Math.PI / 2]) { const m = new THREE.Mesh(new THREE.ShapeGeometry(fs, 10), fm); m.rotation.y = a; flame.add(m); const c2 = new THREE.Mesh(new THREE.ShapeGeometry(fs, 10), core); c2.scale.set(0.5, 0.6, 1); c2.position.y = 0.15; c2.rotation.y = a + 0.02; flame.add(c2); }
  const key = named(new THREE.PointLight("#ffb866", 1, 0, 0.9), "key_light"); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.camera.near = 0.4; key.shadow.camera.far = 600; key.shadow.bias = -0.012; key.shadow.normalBias = 0.1; key.shadow.radius = 3.5; world.add(key);
  const bounce = named(new THREE.PointLight("#ffc98f", 1, 0, 1.0), "bounce_light"); world.add(bounce);       // the candle's light off the room, no shadows
  return { flame, key, bounce, base: [x, 9.35, z] };
}

// ---------- pot, sapling, redwood
function crownOutline(seed, H = 28, W = 8.2) {
  const r = rng(seed), L = [], R = [], n = 13;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), y = -t * H, w = W * (0.22 + 0.78 * Math.sin(Math.PI * (0.12 + 0.8 * t))) * (0.7 + 0.6 * r());
    for (const [arr, s] of [[R, 1], [L, -1]]) { const ww = w * (0.8 + 0.4 * r()); arr.push([s * 0.35, y + 0.2], [s * ww * 0.55, y - 0.2 - 0.4 * r()], [s * ww, y - 1.5 - r()], [s * ww * 0.5, y - 1.3]); }
  }
  return [[0, 1.4], ...R, [0.3, -H - 0.6], [-0.3, -H - 0.6], ...L.reverse()];
}
function buildTree(world) {
  const [x, z] = LAY.pot, g = named(new THREE.Group(), "pot"); g.position.set(x, 0, z); world.add(g);
  g.add(tube(2.0, 2.7, 3.6, mixHex(PAL.umber, PAL.peach, 0.3), { seg: 10 })); g.add(at(tube(2.85, 2.85, 0.6, PAL.umber, { seg: 10 }), 0, 3.1, 0)); g.add(at(disc(2.5, "#3a2a24", 0.1, { cast: false, seg: 10 }), 0, 3.42, 0));
  const tree = named(new THREE.Group(), "redwood"); tree.position.set(x, 3.5, z); world.add(tree);
  const segs = [0, 1, 2, 3].map((k) => { const s = named(tube(1.45 - 0.2 * k, 1.3 - 0.2 * k, 17, k % 2 ? mixHex(PAL.bark, PAL.umber, 0.6) : PAL.bark, { seg: 9 }), "redwood.trunk_" + k); tree.add(s); return s; });
  const crown = named(new THREE.Group(), "redwood.crown"); tree.add(crown);
  [0, 1, 2].forEach((i) => { const c = card(crownOutline(11 + i), i === 1 ? mixHex(PAL.green, PAL.teal, 0.35) : PAL.green, 0.1); c.rotation.y = (i * Math.PI) / 3; crown.add(c); });
  const tier = named(new THREE.Group(), "redwood.tier"); tree.add(tier);
  [0, 1].forEach((i) => { const c = card([[0, 0.5], [0.5, 0.1], [1.9, -0.9], [0.9, -0.5], [0.35, -0.7], [-0.35, -0.7], [-0.9, -0.5], [-1.9, -0.9], [-0.5, 0.1]], mixHex(PAL.green, PAL.core, 0.12), 0.1); c.rotation.y = i * Math.PI / 2 + 0.4; tier.add(c); });
  const update = (f) => {
    const { tier: tk, grow } = treeAt(f), H = 5.2 + 1.5 * tk + 57 * grow;
    const tw = lerp(0.2, 1, clamp(grow)); segs.forEach((s, k) => { s.position.y = (H * (k + 1)) / 4 - 17; s.scale.set(tw, 1, tw); });
    const cs = lerp(0.17 + 0.05 * tk, 1, clamp(grow, 0, 1.3)); crown.scale.setScalar(cs); crown.position.y = H;
    tier.position.y = H - 29.5 * cs; tier.scale.setScalar(Math.max(0.001, tk) * lerp(1.45, 3.4, clamp(grow)));
  };
  return { update };
}

// ---------- cutlery -> fence. Six stacks of nine cards; each card is dealt off its stack, slides out to the
// fence line, travels along the table edge to its slot and hinges up about its foot tab.
const CUT = {
  fork: { handle: [[-0.45, 0], [0.45, 0], [0.36, 9.6], [-0.36, 9.6]], head: [[-0.36, 9.6], [0.36, 9.6], [0.5, 11.2], [1.1, 12.6], [1.12, 19], [0.78, 19], [0.74, 14.2], [0.5, 14.2], [0.48, 19], [0.16, 19], [0.14, 14.2], [-0.14, 14.2], [-0.16, 19], [-0.48, 19], [-0.5, 14.2], [-0.74, 14.2], [-0.78, 19], [-1.12, 19], [-1.1, 12.6], [-0.5, 11.2]] },
  knife: { handle: [[-0.55, 0], [0.55, 0], [0.5, 9], [-0.5, 9]], head: [[-0.5, 9], [0.5, 9], [0.78, 10.2], [0.86, 16.4], [0.62, 18.2], [0.1, 19.1], [-0.5, 18.9], [-0.56, 12]] },
  spoon: { handle: [[-0.48, 0], [0.48, 0], [0.3, 11.6], [-0.3, 11.6]], head: [[-0.3, 11.6], [0.3, 11.6], [0.9, 12.6], [1.42, 14.4], [1.5, 16], [1.3, 17.8], [0.7, 18.9], [0, 19.2], [-0.7, 18.9], [-1.3, 17.8], [-1.5, 16], [-1.42, 14.4], [-0.9, 12.6]] },
};
function fenceLoop() {
  // round the corners of the fence polygon, then sample it densely by arc length
  const P = FENCE_POLY, n = P.length, pts = [];
  for (let i = 0; i < n; i++) {
    const A = P[(i + n - 1) % n], B = P[i], Cc = P[(i + 1) % n], r = 5, u = [A[0] - B[0], A[1] - B[1]], v = [Cc[0] - B[0], Cc[1] - B[1]], lu = Math.hypot(...u), lv = Math.hypot(...v);
    const p0 = [B[0] + (u[0] / lu) * r, B[1] + (u[1] / lu) * r], p2 = [B[0] + (v[0] / lv) * r, B[1] + (v[1] / lv) * r];
    for (let k = 0; k <= 8; k++) { const t = k / 8, w = 1 - t; pts.push([w * w * p0[0] + 2 * t * w * B[0] + t * t * p2[0], w * w * p0[1] + 2 * t * w * B[1] + t * t * p2[1]]); }
  }
  const D = [], S = [0]; let L = 0;
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]), m = Math.max(1, Math.round(l / 0.5)); for (let k = 0; k < m; k++) { D.push([lerp(a[0], b[0], k / m), lerp(a[1], b[1], k / m)]); L += l / m; S.push(L); } }
  const at = (s) => { s = ((s % L) + L) % L; let lo = 0, hi = D.length; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (S[m] <= s) lo = m; else hi = m; } const a = D[lo], b = D[(lo + 1) % D.length], u = (s - S[lo]) / Math.max(1e-9, S[lo + 1] - S[lo]), tx = b[0] - a[0], tz = b[1] - a[1], l = Math.hypot(tx, tz) || 1; return { x: lerp(a[0], b[0], u), z: lerp(a[1], b[1], u), nx: tz / l, nz: -tx / l }; };
  const nearest = (x, z) => { let best = 0, bd = 1e9; D.forEach((p, i) => { const d = (p[0] - x) ** 2 + (p[1] - z) ** 2; if (d < bd) { bd = d; best = i; } }); return S[best]; };
  return { L, at, nearest };
}
// the fence plan: which card goes to which slot, and where each one is at frame f. Shared by test 02 and the skin.
export function fencePlan() {
  const loop = fenceLoop(), N = 54, pitch = loop.L / N, sGate = loop.nearest(GATE[0], GATE[1]);
  const off = ((sGate / pitch) % 1) - 0.5;                              // the gate falls mid-gap
  const kinds = ["fork", "knife", "spoon"], slots = Array.from({ length: N }, (_, i) => { const s = (i + off) * pitch, p = loop.at(s); return { i, s, p, kind: kinds[i % 3] }; });
  const byZ = slots.slice().sort((a, b) => a.p.z - b.p.z); byZ.forEach((sl, k) => { sl.half = k < N / 2 ? "far" : "near"; });
  const posts = [];
  for (const half of ["far", "near"]) for (const [sx, sz, kind] of LAY.cutlery[half]) {
    const sEntry = loop.nearest(sx, sz), mine = slots.filter((sl) => sl.half === half && sl.kind === kind);
    const dist = (sl) => { let d = sl.s - sEntry; d = ((d + loop.L / 2) % loop.L + loop.L) % loop.L - loop.L / 2; return d; };
    mine.sort((a, b) => Math.abs(dist(b)) - Math.abs(dist(a)));         // the furthest slot takes the top card and leaves first
    mine.forEach((sl, order) => {
      const j = mine.length - 1 - order, name = "fence_" + String(sl.i + 1).padStart(2, "0");
      const d = dist(sl), t0 = FENCE_T0 + order * 1.5, d1 = 9, d2 = clamp(Math.abs(d) / 4.4, 3, 24), pe = loop.at(sEntry), yawE = Math.atan2(pe.nx, pe.nz);
      let dy = yawE - Math.PI; dy = ((dy + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
      if (Math.abs(dy) > 2.1) dy = sx < 0 ? ((dy % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) : -((((-dy) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI));   // swing away from the plate
      posts.push({ name, kind, i: sl.i, at(f) {
        const t = f - t0, a = smooth(t / d1), b = smooth((t - d1) / d2), hinge = spring(t - d1 - d2, 0.6, 16);
        const p = loop.at(sEntry + d * b);
        return { x: lerp(sx, p.x, a), y: lerp(0.03 + j * 0.056, 0.03, a), z: lerp(sz, p.z, a), yaw: a < 1 ? Math.PI + dy * a : Math.atan2(p.nx, p.nz), hinge: (Math.PI / 2) * (1 - hinge), t };
      } });
    });
  }
  return { posts, loop };
}
function buildFence(world) {
  const plan = fencePlan(), posts = plan.posts.map((P) => {
    const { name, kind } = P;
    const G = named(new THREE.Group(), name), H = named(new THREE.Group(), name + ".hinge"); G.add(H); world.add(G);
    const hd = card(CUT[kind].head, PAL.lilac, 0.06), hn = card(CUT[kind].handle, PAL.indigo, 0.06); hd.name = name + ".head"; hn.name = name + ".handle"; H.add(hd, hn);
    const tab = strip(1.5, 1.3, mixHex(PAL.lilac, PAL.core, 0.5), 0.05); tab.position.z = -1.3; tab.name = name + ".tab"; G.add(tab);
    G.userData.kind = kind;
    return { update(f) { const s = P.at(f); G.position.set(s.x, s.y, s.z); G.rotation.y = s.yaw; H.rotation.x = s.hinge; tab.visible = s.t > 0; } };
  });
  return { update: (f) => posts.forEach((p) => p.update(f)), loop: plan.loop };
}

export function buildWorld(scene) {
  const world = named(new THREE.Group(), "world"); scene.add(world);
  const risers = [];
  buildRoom(world);
  buildPlate(world, "plate_far", LAY.plate_far, [5, 10, 15, 20, 25, 30, 34], risers);
  buildPlate(world, "plate_near", LAY.plate_near, [4.6, 9, 13, 17, 20], risers);
  buildGlass(world, "glass_far", LAY.glass_far, risers); buildGlass(world, "glass_near", LAY.glass_near, risers);
  buildBottle(world, "bottle", LAY.bottle, risers);
  buildShaker(world, "salt", LAY.salt, PAL.cream, PAL.lavender, 9, risers); buildShaker(world, "pepper", LAY.pepper, mixHex(PAL.umber, PAL.navy, 0.2), PAL.gold, 6, risers);
  buildBasket(world, "basket", LAY.basket, risers); buildNapkin(world, "napkin", LAY.napkin, risers);
  const candle = buildCandle(world), tree = buildTree(world), fence = buildFence(world);
  const hemi = named(new THREE.HemisphereLight("#4a52a8", "#1a1f48", 1), "room_fill"); scene.add(hemi);
  const eye = named(new THREE.DirectionalLight("#8a90dc", 0.85), "eye_fill"); scene.add(eye, eye.target);     // a dim cool fill from the lens, so a card turned away from the flame still reads
  function update(f, jitter = [0, 0, 0]) {
    risers.forEach((r) => r.update(f)); tree.update(f); fence.update(f);
    const fl = flameAt(f), [bx, by, bz] = candle.base;
    candle.flame.rotation.z = -Math.atan(fl.lx); candle.flame.rotation.x = Math.atan(fl.lz); candle.flame.scale.y = fl.h;
    candle.key.position.set(bx + fl.lx * 1.2 + jitter[0], by + 1.25 * fl.h + jitter[1], bz + fl.lz * 1.2 + jitter[2]);
    candle.bounce.position.set(bx, 46, bz);
    return fl;
  }
  return { world, update, candle, hemi, eye, fence };
}

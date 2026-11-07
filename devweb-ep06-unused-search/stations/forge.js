// The forge: the search machine's builders, lifted verbatim from design/machine-test.html (the approved motion test).
// Vocabulary borrowed from picture-book contraptions: bulging bodies, ribbed necks, flared horns, rivets, steam, plaques.
// A factory, built once with (THREE, toon, inkMat[, root]); it holds no positions and no time. Every solid gets an ink
// hull (a back-face shell in INK) for the drawn outline. Kit candidate after this episode (world-plan-v2 section 6).
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export const INK = "#0b1826";
export const C = { body: "#3a6696", bodyDark: "#2c5180", rim: "#a9c1d8", pipe: "#5f84ab", plate: "#ece7d6", hole: "#070b10", rivet: "#8fb0d0", steam: "#f2f5f8", card: "#f4f3ef", lamp: "#6ad08a" };

// toon(color, extra) is the stage's material maker (the caller may wrap it to keep a list for dimming); inkMat the
// shared BackSide ink; root the group everything is added to (a new one if none is given).
export function forge(THREE, toon, inkMat, root) {
  const world = root || new THREE.Group();
  const M = (color) => toon(color, { fog: false });

  // ---------- helpers ----------
  const lerp = (a, b, k) => a + (b - a) * k, sm = (x) => x * x * (3 - 2 * x);
  // a smooth curve through [u, value] pairs
  const curveFn = (pts) => (u) => { let i = 0; while (i < pts.length - 2 && u > pts[i + 1][0]) i++; const [u0, a] = pts[i], [u1, b] = pts[i + 1]; return lerp(a, b, sm(Math.max(0, Math.min(1, (u - u0) / (u1 - u0))))); };
  function hull(geo, th) {
    const g = geo.clone(), p = g.attributes.position, n = g.attributes.normal;
    for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) + n.getX(i) * th, p.getY(i) + n.getY(i) * th, p.getZ(i) + n.getZ(i) * th);
    return new THREE.Mesh(g, inkMat);
  }
  function add(geo, color, parent = world, th = 0.035) {
    const m = new THREE.Mesh(geo, M(color)); parent.add(m);
    if (th) { const h = hull(geo, th); m.add(h); }
    return m;
  }
  // a tube along a path whose radius changes: horns, necks with ribs, the lumpy body itself
  function sweep(points, radius, { segs = 90, radial = 40 } = {}) {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.5);
    const fr = curve.computeFrenetFrames(segs, false), pos = [], idx = [];
    for (let i = 0; i <= segs; i++) {
      const u = i / segs, c = curve.getPointAt(u), r = radius(u);
      for (let j = 0; j < radial; j++) {
        const a = (j / radial) * Math.PI * 2, n = fr.normals[i], b = fr.binormals[i];
        pos.push(c.x + r * (Math.cos(a) * n.x + Math.sin(a) * b.x), c.y + r * (Math.cos(a) * n.y + Math.sin(a) * b.y), c.z + r * (Math.cos(a) * n.z + Math.sin(a) * b.z));
      }
    }
    for (let i = 0; i < segs; i++) for (let j = 0; j < radial; j++) {
      const a = i * radial + j, b = i * radial + ((j + 1) % radial), c = a + radial, d = b + radial;
      idx.push(a, b, c, b, d, c);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    return { geo: g, curve, end: curve.getPointAt(1), endDir: curve.getTangentAt(1), start: curve.getPointAt(0) };
  }
  const ribs = (base, n, amp, a = 0.08, b = 0.62) => (u) => base(u) + (u > a && u < b ? amp * Math.max(0, Math.sin(((u - a) / (b - a)) * Math.PI * 2 * n)) : 0);
  // an open horn: outside in colour, inside dark, a pale rim on the mouth
  function horn(points, radius, color = C.body) {
    const s = sweep(points, radius);
    add(s.geo, color);
    world.add(new THREE.Mesh(s.geo, new THREE.MeshBasicMaterial({ color: C.hole, side: THREE.BackSide, fog: false })));
    const r = radius(1), rim = add(new THREE.TorusGeometry(r, 0.06, 14, 48), C.rim);
    rim.position.copy(s.end); rim.lookAt(s.end.clone().add(s.endDir));
    return s;
  }
  // a paper plate with a word on it and a rivet at each end. draw(ctx, w, h), when given, paints the face instead of
  // the centred word (the placard's three lines, the bin's label); the only addition to the test's builder.
  function plate(text, w, h, px = 44, draw = null) {
    const g = new THREE.Group();
    add(new RoundedBoxGeometry(w, h, 0.05, 3, 0.02), C.plate, g, 0.022);
    const c = document.createElement("canvas"); c.width = Math.round(w * 300); c.height = Math.round(h * 300);
    const x = c.getContext("2d");
    if (draw) draw(x, c.width, c.height);
    else { x.fillStyle = "#1a2029"; x.font = `600 ${px}px 'IBM Plex Mono', monospace`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, c.width / 2, c.height / 2 + 2); }
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: false })); face.position.z = 0.027; g.add(face);
    for (const sx of [-1, 1]) { const rv = add(new THREE.SphereGeometry(0.022, 10, 8), C.rivet, g, 0); rv.position.set(sx * (w / 2 - 0.035), 0, 0.03); }
    world.add(g); g.userData.face = face; return g;
  }
  const rivet = (x, y, z, r = 0.045) => { const m = add(new THREE.SphereGeometry(r, 12, 10), C.rivet, world, 0.012); m.position.set(x, y, z); return m; };
  function puff(x, y, z, s = 1) {
    const g = new THREE.Group();
    for (const [dx, dy, dz, r] of [[0, 0, 0, 0.2], [0.2, 0.05, 0.02, 0.15], [-0.18, 0.04, 0, 0.14], [0.05, 0.17, 0, 0.16], [-0.06, -0.1, 0.05, 0.12]]) { const m = add(new THREE.SphereGeometry(r, 18, 14), C.steam, g, 0.022); m.position.set(dx, dy, dz); }
    g.position.set(x, y, z); g.scale.setScalar(s); world.add(g);
    return g;
  }
  // steam: one puff per event, rising and thinning (its own five materials: a group fades as one)
  const mkPuff = () => { const g = new THREE.Group(); for (const [dx, dy, dz, r] of [[0, 0, 0, 0.2], [0.2, 0.05, 0.02, 0.15], [-0.18, 0.04, 0, 0.14], [0.05, 0.17, 0, 0.16], [-0.06, -0.1, 0.05, 0.12]]) { const m = add(new THREE.SphereGeometry(r, 18, 14), C.steam, g, 0.022); m.position.set(dx, dy, dz); } world.add(g); return g; };
  function card(x, y, z, rz = 0, ry = 0, rx = 0) {
    const g = new THREE.Group();
    add(new RoundedBoxGeometry(0.66, 0.42, 0.035, 3, 0.03), C.card, g, 0.02);
    for (const [w, yy] of [[0.36, 0.07], [0.24, -0.07]]) { const l = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.05), new THREE.MeshBasicMaterial({ color: "#9aa0a8", fog: false })); l.position.set(-0.3 + w / 2 + 0.04, yy, 0.019); g.add(l); }
    g.position.set(x, y, z); g.rotation.set(rx, ry, rz); world.add(g); return g;
  }

  // an open slide: a shallow trough along a path with a pale rail on each edge; at(u) seats a card on it
  function slide(points, w = 0.4, lip = 0.13, color = C.bodyDark) {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.5), segs = 70;
    const prof = [[-w, lip], [-w * 0.8, 0.01], [0, -0.03], [w * 0.8, 0.01], [w, lip]], pos = [], idx = [], L = [], R = [];
    const frame = (u) => { const c = curve.getPointAt(u), tg = curve.getTangentAt(u), h = new THREE.Vector3().crossVectors(tg, new THREE.Vector3(0, 1, 0)).normalize(), up = new THREE.Vector3().crossVectors(h, tg).normalize(); return { c, tg, h, up }; };
    for (let i = 0; i <= segs; i++) {
      const { c, h, up } = frame(i / segs);
      prof.forEach(([x, y]) => pos.push(c.x + h.x * x + up.x * y, c.y + h.y * x + up.y * y, c.z + h.z * x + up.z * y));
      if (i % 5 === 0) { L.push([c.x - h.x * w + up.x * lip, c.y - h.y * w + up.y * lip, c.z - h.z * w + up.z * lip]); R.push([c.x + h.x * w + up.x * lip, c.y + h.y * w + up.y * lip, c.z + h.z * w + up.z * lip]); }
    }
    for (let i = 0; i < segs; i++) for (let j = 0; j < prof.length - 1; j++) { const a = i * prof.length + j, b = a + 1, c = a + prof.length, d = c + 1; idx.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, toon(color, { fog: false, side: THREE.DoubleSide })); world.add(m);
    for (const edge of [L, R]) add(sweep(edge, () => 0.05, { segs: 60, radial: 12 }).geo, C.rim, world, 0.02);
    return { at(u, lift = 0.05) { const { c, tg, h, up } = frame(u); return { p: c.clone().addScaledVector(up, lift), q: new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(h, tg.clone().negate(), up)) }; }, curve };
  }
  function gear(r, teeth, x, y, z, ry = 0, rz = 0, color = C.rim) {
    const sh = new THREE.Shape(), n = teeth * 4, th = r * 0.2;
    for (let k = 0; k <= n; k++) { const a = (k / n) * Math.PI * 2, rr = k % 4 < 2 ? r : r + th, px = Math.cos(a) * rr, py = Math.sin(a) * rr; k ? sh.lineTo(px, py) : sh.moveTo(px, py); }
    const hole = new THREE.Path(); hole.absarc(0, 0, r * 0.3, 0, Math.PI * 2, true); sh.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 1, curveSegments: 20 }); geo.translate(0, 0, -0.06);
    const g = new THREE.Group(), m = new THREE.Mesh(geo, M(color)); g.add(m);
    const o = new THREE.Mesh(geo, inkMat); o.scale.set(1 + 0.03 / r, 1 + 0.03 / r, 1.35); g.add(o);
    const axle = add(new THREE.CylinderGeometry(r * 0.2, r * 0.2, 0.5, 20), C.pipe, g, 0.016); axle.rotation.x = Math.PI / 2; axle.position.z = -0.2;
    const capm = add(new THREE.SphereGeometry(r * 0.2, 14, 10), C.plate, g, 0.014); capm.position.z = 0.08;
    g.position.set(x, y, z); g.rotation.set(0, ry, 0); m.rotation.z = o.rotation.z = rz; g.userData = { spin: [m, o], base: rz, teeth }; world.add(g); return g;
  }
  // a curly wire with a knob on the end
  function spring(x, y, z, h, turns, lean = 0, knob = C.plate) {
    const pts = []; for (let k = 0; k <= turns * 12; k++) { const u = k / (turns * 12), a = u * turns * Math.PI * 2; pts.push([x + Math.cos(a) * 0.07 + lean * u * u, y + u * h, z + Math.sin(a) * 0.07]); }
    const s = sweep(pts, () => 0.022, { segs: turns * 26, radial: 8 }); add(s.geo, C.rim, world, 0.012);
    const b = add(new THREE.SphereGeometry(0.075, 14, 10), knob, world, 0.016); b.position.copy(s.end);
    return s;
  }

  return { root: world, M, C, RoundedBoxGeometry, lerp, sm, curveFn, hull, add, sweep, ribs, horn, plate, rivet, puff, mkPuff, card, slide, gear, spring };
}

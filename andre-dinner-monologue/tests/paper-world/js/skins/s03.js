// skins/s03.js: the painted pieces of section 3, the boredom machine (sections/s03.js has its events and its camera).
// One pull-strip of cream card (a spine along the far left, three hinge strips, an arm to the wheel's hub, a tab to the
// television) carries everything: 24 identical citizens in three ranks, the gold coin on its hub with six riders on its
// rim, the television. It slides in flat over the far edge (f508 to f558), pops up, and is drawn off from f1194.
// Rules as in skin.js: a painted piece is never relit (unlit, times the one candle tint; here plus the screen's cold
// glow by distance from the screen); the cloth and the strip lying on it are the lit, shadow-receiving surfaces; the
// television is a volume and turns to the lens, the citizens and the coin are flat card and do not.
// Every state is a pure function of the film frame. Nothing here is drawn before f508 or after f1244.
import * as S3 from "../sections/s03.js";
import { clamp, lerp, smooth } from "../kit.js";

export async function build(X) {
  const { THREE, world, reg, tintAt } = X, HALF = Math.PI / 2, { RANK, WHEEL, TV, SPINE, EDGE } = S3;
  const SLATE = [74, 82, 96];                                        // one slate for every citizen: darker and cooler than the cloth, still card
  const [cit, coin, tvp] = await Promise.all([X.plate("citizen", { recolour: SLATE }), X.plate("coin"), X.plate("tv")]);
  { // the plate's pale cut rim keeps its brick red through the recolour: bring it to the same slate, paler, so every card is one colour
    const g = cit.canvas.getContext("2d", { willReadFrequently: true }), im = g.getImageData(0, 0, cit.w, cit.h), d = im.data, [sr, sg, sb] = SLATE, ref = 0.3 * 116 + 0.59 * 102 + 0.11 * 80;
    for (let i = 0; i < d.length; i += 4) { const r = d[i], gr = d[i + 1], b = d[i + 2]; if (d[i + 3] < 8 || r / (r + gr + b + 1) < 0.415) continue; const l = (0.3 * r + 0.59 * gr + 0.11 * b) / ref; d[i] = Math.min(255, sr * l); d[i + 1] = Math.min(255, sg * l); d[i + 2] = Math.min(255, sb * l); }
    g.putImageData(im, 0, 0); cit.t.needsUpdate = true; }
  const COLD = [0.2, 0.34, 0.62];                                     // what the screen adds to a painted piece's tint
  const canvasOf = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  const mixAngle = (a, b, t) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t;

  // nothing of the machine is drawn beyond the far edge of the cloth: it comes up over the edge and goes back over it
  const clip = (m) => { const prev = m.onBeforeCompile;
    m.onBeforeCompile = (sh, r) => { if (prev) prev(sh, r);
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying float vS3z;").replace("#include <project_vertex>", "#include <project_vertex>\nvS3z = (modelMatrix * vec4(transformed, 1.0)).z;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying float vS3z;").replace("#include <clipping_planes_fragment>", `if (vS3z < ${EDGE.toFixed(1)}) discard;\n#include <clipping_planes_fragment>`); };
    m.customProgramCacheKey = () => "s03clip" + (prev ? "+" : ""); return m; };
  const basic = (o = {}) => clip(new THREE.MeshBasicMaterial({ toneMapped: false, side: THREE.DoubleSide, ...o }));
  const _k = new THREE.Color();
  // the candle tint at (x, z), plus the screen's cold light
  const lightAt = (x, z, tv, gain = 1) => { const c = tintAt(x, z, gain), k = tv.level * X.now.level * clamp(1 - Math.hypot(x - tv.x, z - tv.z) / tv.reach) ** 1.4; return _k.setRGB(c.r + COLD[0] * k, c.g + COLD[1] * k, c.b + COLD[2] * k); };

  // ================= the pull-strip: lit like the cloth it lies on, and it takes the cards' shadows
  const strip = X.named(new THREE.Group(), "pull_strip"); strip.visible = false; world.add(strip);
  const cream = clip(X.shoulder(new THREE.MeshStandardMaterial({ color: "#fbefd2", roughness: 1, metalness: 0, side: THREE.DoubleSide }))), crease = basic({ color: "#6b5238" }), CREASE = new THREE.Color("#6b5238");
  const flats = (quads, y, mat) => { const pos = [], idx = []; quads.forEach((q, n) => { q.forEach(([x, z]) => pos.push(x, y, z)); const a = n * 4, up = (q[1][1] - q[0][1]) * (q[2][0] - q[0][0]) - (q[1][0] - q[0][0]) * (q[2][1] - q[0][1]) >= 0;       // wound so it faces up
      if (up) idx.push(a, a + 1, a + 2, a, a + 2, a + 3); else idx.push(a, a + 2, a + 1, a, a + 3, a + 2); });
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(pos.map((_, i) => (i % 3 === 1 ? 1 : 0)), 3)); g.setIndex(idx);
    const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.frustumCulled = false; return m; };
  const rect = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
  const band = ([ax, az], [bx, bz], hw) => { const l = Math.hypot(bx - ax, bz - az), px = (-(bz - az) / l) * hw, pz = ((bx - ax) / l) * hw; return [[ax + px, az + pz], [bx + px, bz + pz], [bx - px, bz - pz], [ax - px, az - pz]]; };
  const sx = SPINE.x, hw = SPINE.w / 2, xEnd = RANK.x0 + RANK.dx * (RANK.n - 1) + 1.2, zNear = -38.4;
  strip.add(flats([rect(sx - hw, zNear, sx + hw, EDGE - 70), band([sx, zNear + 0.3], WHEEL.at, hw), ...RANK.z.map((z) => rect(sx, z - 0.28, xEnd, z + 0.28)), rect(TV.at[0] - 2.9, TV.at[1] - 0.45, sx, TV.at[1] + 0.45)], 0.035, cream));
  strip.add(flats([...RANK.z.map((z) => rect(sx + hw, z - 0.035, xEnd, z + 0.035)), rect(sx - 0.035, zNear, sx + 0.035, EDGE - 70)], 0.05, crease));      // the hinge lines, and the fold down the spine
  { const pad = new THREE.Mesh(new THREE.CircleGeometry(1.9, 28).rotateX(-HALF), cream); pad.position.set(WHEEL.at[0], 0.04, WHEEL.at[1]); pad.receiveShadow = true; strip.add(pad); }
  reg.add("pull_strip", strip, { kind: "flat" });

  // ================= the citizens: 24 in three ranks, 6 on the wheel, every one the same card
  const mk = (name) => { const st = X.standee(name, cit, RANK.h); st.root.visible = false; st.root.traverse((o) => (o.frustumCulled = false)); [st.a, st.b, st.core].forEach((m) => clip(m.material)); st.core0 = st.core.material.color.clone(); return st; };
  const ranks = S3.CITIZENS.map((q) => ({ q, st: mk(q.name) })), riders = S3.RIDERS.map((q) => ({ q, st: mk(q.name) }));
  // a card hinged at its foot: s.up 0 flat (lying back from its hinge line, face up) to 1 standing (the spring carries it a little past); s.fall 0 to 1 back down
  const _c = new THREE.Color();
  function card(st, s, f, y, tv) {
    st.pose({ visible: s.shown, x: s.x, z: s.z, yaw: s.yaw ?? 0, f, walk: 0, rest: 99, pop: 1 }); if (!s.shown) return;
    const a = s.fall > 0 ? s.fall : 1 - s.up;
    st.root.position.y = y; st.pop.rotation.x = -HALF * 0.996 * a; st.rock.rotation.z = ((s.rock * Math.PI) / 180) * (1 - clamp(a * 3));
    _c.copy(lightAt(s.x, s.z, tv)); st.a.material.color.copy(_c); st.b.material.color.copy(_c); st.core.material.color.setRGB(st.core0.r * _c.r, st.core0.g * _c.g, st.core0.b * _c.b);
  }

  // ================= the wheel: the coin is a real disc of card (painted top, gold edge) on a paper hub
  const wheelG = X.named(new THREE.Group(), "wheel"); wheelG.visible = false; world.add(wheelG);
  const coinG = X.named(new THREE.Group(), "wheel.coin"), spin = new THREE.Group(); wheelG.add(coinG); coinG.add(spin);
  const gold = new THREE.Color().setRGB(coin.mean[0] / 255, coin.mean[1] / 255, coin.mean[2] / 255, THREE.SRGBColorSpace);
  const topM = basic({ map: coin.t }), sideM = basic({ color: gold.clone() }), hubM = basic({ color: "#e4d2ae" }), HUBC = new THREE.Color("#e4d2ae"), SIDE = gold.clone().multiplyScalar(0.5);
  // the plate shows the coin's face as a circle as wide as the box, with a sliver of its edge below it: only the face goes on the disc
  const topG = new THREE.CircleGeometry(WHEEL.R, 96), fv = coin.w / coin.h; for (let i = 0; i < topG.attributes.uv.count; i++) topG.attributes.uv.setY(i, 1 - fv + fv * topG.attributes.uv.getY(i));
  const top = new THREE.Mesh(topG.rotateX(-HALF), topM); top.position.y = WHEEL.thick; top.castShadow = true;
  const side = new THREE.Mesh(new THREE.CylinderGeometry(WHEEL.R, WHEEL.R, WHEEL.thick, 96, 1, true), sideM); side.position.y = WHEEL.thick / 2;
  spin.add(top, side);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 1, 20).translate(0, 0.5, 0), hubM); hub.castShadow = true; wheelG.add(hub);
  // the glint: a soft bright band that crosses the coin's face (additive), across the way the candle's light falls
  const glintT = (() => { const c = canvasOf(256, 4), g = c.getContext("2d"), gr = g.createLinearGradient(0, 0, 256, 0); gr.addColorStop(0, "#000"); gr.addColorStop(0.36, "#000"); gr.addColorStop(0.47, "#888"); gr.addColorStop(0.5, "#fff"); gr.addColorStop(0.53, "#888"); gr.addColorStop(0.64, "#000"); gr.addColorStop(1, "#000"); g.fillStyle = gr; g.fillRect(0, 0, 256, 4);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; })();
  const glint = new THREE.Mesh(new THREE.CircleGeometry(WHEEL.R * 0.985, 64).rotateX(-HALF), new THREE.MeshBasicMaterial({ map: glintT, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false }));
  glint.position.y = WHEEL.thick + 0.02; glint.rotation.y = Math.atan2(X.LAY.candle[1] - WHEEL.at[1], -(X.LAY.candle[0] - WHEEL.at[0])) + 0.5; glint.renderOrder = 3; coinG.add(glint);
  reg.add("wheel", wheelG, { kind: "flat" });

  // ================= the television: a volume. Its dark-screen twin is made from the plate (the cold blank screen painted out)
  const dk = canvasOf(tvp.w, tvp.h), dg = dk.getContext("2d", { willReadFrequently: true }); dg.drawImage(tvp.canvas, 0, 0);
  const img = dg.getImageData(0, 0, tvp.w, tvp.h), d = img.data, isScr = (i) => d[i + 3] > 40 && d[i + 2] > d[i] + 6 && d[i] + d[i + 1] + d[i + 2] > 420;
  const cols = new Array(tvp.w).fill(0), rows = new Array(tvp.h).fill(0); for (let y = 0; y < tvp.h; y++) for (let x = 0; x < tvp.w; x++) if (isScr((y * tvp.w + x) * 4)) { cols[x]++; rows[y]++; }
  const span = (a) => { const m = Math.max(...a) * 0.25; let lo = a.findIndex((v) => v > m), hi = a.length - 1; while (a[hi] <= m) hi--; return [lo, hi]; };
  const [sx0, sx1] = span(cols), [sy0, sy1] = span(rows);
  for (let y = sy0 - 6; y <= sy1 + 6; y++) for (let x = sx0 - 6; x <= sx1 + 6; x++) { const i = (y * tvp.w + x) * 4; if (!isScr(i)) continue; const l = (d[i] + d[i + 1] + d[i + 2]) / 765, e = 0.5 + 0.9 * (1 - l); d[i] = 30 * e; d[i + 1] = 35 * e; d[i + 2] = 44 * e; }       // dead glass, a little paler toward its edge
  dg.putImageData(img, 0, 0); const tDark = X.tex(dk);
  const TW = (TV.h * tvp.w) / tvp.h, scr = [((sx0 + sx1) / 2 / tvp.w - 0.5) * TW, (1 - (sy0 + sy1) / 2 / tvp.h) * TV.h];
  const tvMat = new THREE.ShaderMaterial({ side: THREE.DoubleSide, uniforms: { tDark: { value: tDark }, tLit: { value: tvp.t }, k: { value: 0 }, on: { value: 0 }, tint: { value: new THREE.Color(1, 1, 1) }, opacity: { value: 1 } },
    vertexShader: "varying vec2 vUv; varying float vS3z; void main(){ vUv = uv; vS3z = (modelMatrix * vec4(position, 1.0)).z; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `uniform sampler2D tDark, tLit; uniform float k, on, opacity; uniform vec3 tint; varying vec2 vUv; varying float vS3z;
      void main(){ if (vS3z < ${EDGE.toFixed(1)}) discard; vec4 d = texture2D(tDark, vUv), l = texture2D(tLit, vUv); if (l.a < 0.5) discard;
        float m = smoothstep(0.01, 0.06, length(l.rgb - d.rgb)) * on;                                  // the screen: it is its own light, the candle does not tint it
        gl_FragColor = vec4(mix(d.rgb * tint, l.rgb * (0.3 + 0.8 * k), m), opacity); }` });
  const tv = X.volume(world, "tv", TV.at, tvp.t, TW, TV.h, tvMat); tv.g.visible = false;
  const glowT = (() => { const c = canvasOf(128, 128), g = c.getContext("2d"), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,0.9)"); gr.addColorStop(0.35, "rgba(255,255,255,0.32)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); glow.scale.set(8, 6.6, 1); glow.position.set(scr[0], scr[1], 0.15); tv.show.add(glow);
  // the screen's light on the cloth: cold, close, no shadows. Out of the scene (not just at zero) outside the section.
  const cold = new THREE.PointLight("#86b0ff", 0, 0, 1.3); cold.visible = false; world.add(cold);
  const toHub = [WHEEL.at[0] - TV.at[0], WHEEL.at[1] - TV.at[1]].map((v, _, a) => v / Math.hypot(a[0], a[1]));

  // ================= one soft piece close to the lens: this section's own copy of the table's fork, pre-blurred and dark,
  // turned to the lens. It stands in the lower right of the frame while the ranks go down; it comes into the frame and
  // leaves it over the frame's right edge, and is in the scene only for those frames.
  const SOFT = { at: [-16.45, -47.3], w: 9, y: -1.2, dim: 0.26, px: 7, f0: 1041, f1: 1140 };
  const fk = await X.plate("fg_fork"), fc = X.blurred(fk.canvas, SOFT.px), fh = (SOFT.w * fk.h) / fk.w, fsw = (SOFT.w * fc.width) / fk.w, fsh = (fh * fc.height) / fk.h;
  const softM = new THREE.MeshBasicMaterial({ map: X.tex(fc), transparent: true, depthWrite: false, toneMapped: false }), softG = X.named(new THREE.Group(), "soft_fork");
  { const m = new THREE.Mesh(X.plane(fsw, fsh), softM); m.position.y = -(fsh - fh) / 2; m.renderOrder = 10; softG.add(m); softG.position.set(SOFT.at[0], SOFT.y, SOFT.at[1]); softG.visible = false; world.add(softG); reg.add("soft_fork", softG, { kind: "lens" }); }

  const lens = ["fg_glass", "fg_fork"].map((n) => reg.get(n));       // section 5's soft tableware: lens dressing for its own first leg, blobs from any other lens
  function update(f, jitter, cam) {
    if (f >= S3.F0 && f < S3.F1) for (const e of lens) e.set.hide();       // hidden for every frame of this section (as sections 1 and 2 do in theirs)
    softG.visible = f >= SOFT.f0 && f < SOFT.f1;
    if (softG.visible) { const d = SOFT.dim * X.now.level; softG.rotation.y = Math.atan2(cam.P[0] - SOFT.at[0], cam.P[2] - SOFT.at[1]); softM.color.setRGB(d, d * 0.94, d * 0.86); }
    const on = S3.shown(f);
    strip.visible = wheelG.visible = tv.g.visible = on; cold.visible = false; cold.intensity = 0;
    if (!on) { for (const o of ranks) o.st.root.visible = false; for (const o of riders) o.st.root.visible = false; return; }
    const dz = S3.sledAt(f), t = S3.tvAt(f), w = S3.wheelAt(f), L = X.now.L, lvl = X.now.level;
    strip.position.z = dz; crease.color.copy(CREASE).multiply(tintAt(-27, -50 + dz));
    for (const o of ranks) card(o.st, S3.citizenAt(o.q, f), f, 0.1, t);

    // the wheel
    wheelG.position.set(w.x, 0, w.z); coinG.position.y = 0.06 + w.y; spin.rotation.y = w.a;
    hub.visible = w.y > 0.03; hub.scale.y = Math.max(0.001, w.y + 0.06);
    const c = lightAt(w.x, w.z, t); topM.color.copy(c); sideM.color.setRGB(SIDE.r * c.r, SIDE.g * c.g, SIDE.b * c.b); hubM.color.setRGB(HUBC.r * c.r, HUBC.g * c.g, HUBC.b * c.b);
    // a rider's card swivels on its tab: it rides tangent to the rim while that shows the lens its face, and where the rim
    // would turn it edge-on it swings back through face-on instead (never less than 50 degrees of face to the lens)
    for (const o of riders) { const s = S3.riderAt(o.q, f), a = Math.atan2(cam.P[0] - s.x, cam.P[2] - s.z), d = 0.5 * Math.asin(0.97 * Math.sin(2 * (s.yaw - a)));
      s.yaw = mixAngle(s.yaw, a + d, smooth(clamp(s.up) * (1 - clamp(s.fall * 2)))); card(o.st, s, f, 0.06 + w.y + WHEEL.thick + 0.1, t); }
    const g = S3.glintAt(f); glint.visible = g >= 0;
    if (glint.visible) { glintT.offset.x = lerp(0.62, -0.62, g); const e = Math.sin(Math.PI * g) ** 0.5 * 0.85 * lvl; glint.material.color.setRGB(e, 0.9 * e, 0.66 * e); }

    // the television: flat, it lies with its top toward the left edge; standing, it faces the lens
    tv.g.position.set(t.x, 0.07, t.z); tv.aim(cam.P, L);
    const k = smooth(t.up * 1.4); tv.face.rotation.x *= clamp(t.up); tv.face.rotation.y = mixAngle(HALF, tv.face.rotation.y, k); tv.shg.rotation.y = mixAngle(HALF, tv.shg.rotation.y, k);
    tv.show.rotation.x = tv.sh.rotation.x = -HALF * 0.996 * (1 - t.up);
    tv.tint(); tvMat.uniforms.k.value = t.level; tvMat.uniforms.on.value = t.screen * lvl;
    const e = t.level * lvl; glow.visible = e > 0.004; glow.material.color.setRGB(0.16 * e, 0.27 * e, 0.52 * e);
    if (e > 0.004) { cold.visible = true; cold.intensity = 17 * e; cold.position.set(t.x + 2.4 * toHub[0], 3.4, t.z + 2.4 * toHub[1]); }
  }
  return { update };
}

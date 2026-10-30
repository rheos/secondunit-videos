// Blink in Three.js, toon shaded (Robin's pick, 2026-10-29), built from blink-geo.js. Also the harness Blink wears:
// a webbing belt with a buckle and a gear loop, and the tools hanging from carabiners. Pure builders: the film owns
// time, so nothing here animates by itself.
import { ParametricGeometry } from "three/addons/geometries/ParametricGeometry.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export function toonRamp(THREE) {
  const ramp = new THREE.DataTexture(new Uint8Array([90, 170, 255]), 3, 1, THREE.RedFormat);
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;
  return ramp;
}

export function makeBlink(THREE, G, ramp) {
  const root = new THREE.Group();
  const geo = new ParametricGeometry((u, v, t) => { const p = G.surf(Math.PI - 2 * Math.PI * u, -Math.PI / 2 + Math.PI * v); t.set(p[0], p[1], p[2]); }, 200, 150);
  geo.computeVertexNormals();
  const body = new THREE.MeshToonMaterial({ color: "#6ad08a", gradientMap: ramp });
  const V = G.VISOR;
  body.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vObj;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvObj = position;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vObj;").replace("#include <color_fragment>",
      `#include <color_fragment>
      float xp = vObj.x / (1.0 - 0.07 * (vObj.y / ${G.B.toFixed(3)}));
      vec2 c = clamp(vec2(xp, vObj.y), vec2(${(V.x0 + V.r).toFixed(3)}, ${(V.y0 + V.r).toFixed(3)}), vec2(${(V.x1 - V.r).toFixed(3)}, ${(V.y1 - V.r).toFixed(3)}));
      float d = length(vec2(xp, vObj.y) - c) - ${V.r.toFixed(3)};
      float inV = (1.0 - smoothstep(-0.006, 0.006, d)) * step(0.0, vObj.z);
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.0055, 0.0103, 0.0080), inV);`);
  };
  root.add(new THREE.Mesh(geo, body));
  const outline = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: "#12331f", side: THREE.BackSide, transparent: true }));
  outline.scale.setScalar(1.03);
  root.add(outline);
  const glow = new THREE.MeshBasicMaterial({ color: "#c4f7d3", transparent: true });
  const halo = new THREE.MeshBasicMaterial({ color: "#6ad08a", transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false });
  const eyes = G.EYES.map((E) => {
    const f = G.onFront(E.x, E.y, 0.012), g = new THREE.Group();
    g.position.set(...f.p);
    g.lookAt(new THREE.Vector3(...f.p).add(new THREE.Vector3(...f.n)));
    const cap = new THREE.Mesh(new THREE.CapsuleGeometry(G.EYE.w / 2, G.EYE.h - G.EYE.w, 8, 20), glow);
    cap.scale.z = 0.35;
    const h = new THREE.Mesh(new THREE.CapsuleGeometry(G.EYE.w * 0.7, G.EYE.h - G.EYE.w, 8, 20), halo);
    h.scale.z = 0.2;
    g.add(h, cap);
    root.add(g);
    return { g, cap, halo: h, base: g.position.clone() };
  });
  const arc = (r, a0, a1) => { const pts = []; for (let a = a0; a <= a1; a += 5) { const q = (a * Math.PI) / 180; pts.push(new THREE.Vector3(...G.onFront(G.SMILE.x + r * Math.cos(q), G.SMILE.y + r * Math.sin(q), 0.012).p)); } return pts; };
  const smile = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arc(G.SMILE.r, G.SMILE.a0, G.SMILE.a1)), 40, 0.018, 8), glow);
  const grin = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arc(G.SMILE.r * 1.5, 195, 345)), 40, 0.022, 8), glow);
  grin.visible = false;
  root.add(smile, grin);
  const sproutMat = new THREE.MeshToonMaterial({ color: "#7fe09b", gradientMap: ramp });
  [G.SPROUT_STEM, G.SPROUT_LEAF].forEach((P) => root.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P.map((p) => new THREE.Vector3(...p))), 60, 0.05, 12), sproutMat)));
  // thinking: three dots on the visor in place of the eyes
  const dots = [-0.24, 0, 0.24].map((x) => {
    const f = G.onFront(x, 0.24, 0.02), m = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), glow);
    m.position.set(...f.p); m.scale.z = 0.4; m.visible = false; root.add(m);
    return m;
  });
  // expression: blink 0..1 closes the eyes; happy 0..1 squashes them into smiling slits and widens the smile;
  // look / lookY move the eyes across the visor; think 0..1 swaps the eyes for three dots pulsing at phase
  function face({ blink = 0, happy = 0, look = 0, lookY = 0, think = 0, phase = 0 } = {}) {
    eyes.forEach((e) => {
      e.g.visible = think < 0.5;
      e.cap.scale.y = Math.max(0.08, (1 - 0.92 * blink) * (1 - 0.7 * happy));
      e.halo.scale.y = e.cap.scale.y;
      e.g.position.set(e.base.x + look * 0.06, e.base.y + happy * 0.05 + lookY * 0.05, e.base.z);
    });
    dots.forEach((d, i) => { d.visible = think >= 0.5; const k = 0.75 + 0.35 * Math.max(0, Math.sin((phase - i * 0.18) * Math.PI * 2)); d.scale.set(k, k, 0.4 * k); });
    smile.visible = happy < 0.5;
    grin.visible = happy >= 0.5;
  }
  return { root, face };
}

// a canvas texture with a glyph, for the tool tiles and the cards
export function glyphTexture(THREE, draw, w = 256, h = 256) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function makeHarness(THREE, G, ramp) {
  const root = new THREE.Group();
  const toon = (color) => new THREE.MeshToonMaterial({ color, gradientMap: ramp, transparent: true });
  const N = G.N, sg = (v) => (v < 0 ? -1 : 1), pw = (v, e) => sg(v) * Math.pow(Math.abs(v), e);
  // the body's cross-section at height y, pushed out a little: where the belt sits
  const ring = (y, out, phi) => { const r = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(y / G.B), N)), 1 / N), t = 1 - 0.07 * (y / G.B); return new THREE.Vector3(G.A * t * r * pw(Math.cos(phi), 2 / N) * out, y, G.C * r * pw(Math.sin(phi), 2 / N) * out); };
  const YB = -0.55, H = 0.085, SEG = 120;
  const pos = [], idx = [];
  for (let i = 0; i <= SEG; i++) { const phi = (i / SEG) * Math.PI * 2; const a = ring(YB + H, 1.045, phi), b = ring(YB - H, 1.05, phi); pos.push(a.x, a.y, a.z, b.x, b.y, b.z); if (i < SEG) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); } }
  const beltGeo = new THREE.BufferGeometry();
  beltGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  beltGeo.setIndex(idx);
  beltGeo.computeVertexNormals();
  const belt = new THREE.Mesh(beltGeo, toon("#b9822e"));
  belt.material.side = THREE.DoubleSide;
  root.add(belt);
  // stitching: two thin pale loops on the belt
  [YB + H * 0.6, YB - H * 0.6].forEach((y) => {
    const pts = []; for (let i = 0; i <= SEG; i++) pts.push(ring(y, 1.055, (i / SEG) * Math.PI * 2));
    root.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 160, 0.006, 4, true), new THREE.MeshBasicMaterial({ color: "#f3d9a8", transparent: true })));
  });
  const front = ring(YB, 1.06, Math.PI / 2);
  const steel = toon("#c9d1d9");
  const buckle = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.22, 0.05, 3, 0.04), steel);
  buckle.position.set(front.x, front.y, front.z + 0.02);
  root.add(buckle);
  const buckleGlow = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.26, 0.02, 3, 0.05), new THREE.MeshBasicMaterial({ color: "#6ad08a", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  buckleGlow.position.set(front.x, front.y, front.z + 0.05);
  root.add(buckleGlow);
  // gear loop: a cord sagging along the front, below the belt
  const loopPts = []; for (let i = 0; i <= 40; i++) { const phi = Math.PI * (0.2 + 0.6 * (i / 40)); const p = ring(YB - H - 0.06, 1.07, phi); p.y -= 0.05 * Math.sin((i / 40) * Math.PI); loopPts.push(p); }
  root.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(loopPts), 60, 0.014, 6), steel));
  const icon = {
    search: (g, w) => { g.strokeStyle = "#eaf3ff"; g.lineWidth = 20; g.lineCap = "round"; g.beginPath(); g.arc(w * 0.44, w * 0.42, w * 0.2, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(w * 0.59, w * 0.58); g.lineTo(w * 0.74, w * 0.74); g.stroke(); },
    weather: (g, w) => { g.fillStyle = "#eaf3ff"; [[0.38, 0.44, 0.13], [0.54, 0.38, 0.17], [0.66, 0.47, 0.11]].forEach(([x, y, r]) => { g.beginPath(); g.arc(w * x, w * y, w * r, 0, Math.PI * 2); g.fill(); }); g.fillRect(w * 0.26, w * 0.46, w * 0.5, w * 0.12); g.strokeStyle = "#eaf3ff"; g.lineWidth = 14; g.lineCap = "round"; [0.36, 0.5, 0.64].forEach((x) => { g.beginPath(); g.moveTo(w * x, w * 0.68); g.lineTo(w * (x - 0.04), w * 0.8); g.stroke(); }); },
    shell: (g, w) => { g.strokeStyle = "#eaf3ff"; g.lineWidth = 18; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); g.moveTo(w * 0.28, w * 0.36); g.lineTo(w * 0.44, w * 0.5); g.lineTo(w * 0.28, w * 0.64); g.stroke(); g.beginPath(); g.moveTo(w * 0.52, w * 0.66); g.lineTo(w * 0.74, w * 0.66); g.stroke(); },
  };
  const tools = {};
  [["search", 0.62], ["weather", 0.5], ["shell", 0.38]].forEach(([name, f]) => {
    const top = ring(YB - H - 0.1, 1.07, Math.PI * f);
    const pivot = new THREE.Group();
    pivot.position.copy(top);
    const crab = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.016, 8, 28), steel);
    crab.scale.set(0.9, 1.5, 1); crab.position.y = -0.08;
    const tileMat = toon("#3f7fc9");
    const tile = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.34, 0.09, 4, 0.07), tileMat);
    tile.position.y = -0.38;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), new THREE.MeshBasicMaterial({ map: glyphTexture(THREE, (g, w) => icon[name](g, w)), transparent: true }));
    face.position.set(0, -0.38, 0.047);
    const hot = new THREE.Mesh(new RoundedBoxGeometry(0.4, 0.4, 0.02, 4, 0.08), new THREE.MeshBasicMaterial({ color: "#d6a45a", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    hot.position.set(0, -0.38, 0.06);
    pivot.add(crab, tile, face, hot);
    root.add(pivot);
    tools[name] = { pivot, tile, tileMat, hot, at: top };
  });
  return { root, belt, buckle, buckleGlow, tools, front };
}

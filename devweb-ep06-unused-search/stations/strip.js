// The calendar strip, holds 16-20: one long slab of paper across the frame in the band above the machine's crown
// (timeline.js STRIP: y 5.2, clear of the stack top and the bulb, in front of everything at z -1.0). July at the left
// end, 53 raised day boxes, day 53 at the right end, nothing else. A paper roll unrolls it on hold 16 and rolls it back
// up on hold 21. A weighted marker runs July to day 53 on hold 17 and settles with one small rebound; the days it has
// passed stay a shade darker. Day 53 lifts in brightness, not colour, and the rest of the strip steps back a little
// once the core takes the subject (hold 19).
import * as THREE from "three";
import { basic, frame, hero, text } from "../parts.js";
import { MARKER, STRIP, T, cl, dayLit, io, mix, r01 } from "../timeline.js";

// 640 x 44 px: July (53 px) and day 53 (79 px) either side of 53 boxes of 8.8 px
const LEFT = STRIP.left, W = STRIP.w, H = 0.22, Y = STRIP.y, Z = STRIP.z, DAYS = 53, PPU = 200, SLAB = 0.03;
const BOX0 = 78, BOX1 = W * PPU - 96, BOXW = (BOX1 - BOX0) / DAYS; // canvas px: labels sit either side of the boxes
const boxX = (i) => LEFT + (BOX0 + BOXW * (i + 0.5)) / PPU; // world x of day box i (0-based)
const TW = BOXW / PPU - 0.009, TH = 0.14, TD = 0.016, TZ = Z + SLAB / 2 + TD / 2 + 0.001; // one day box
const X0 = boxX(0), X1 = boxX(DAYS - 1);

let slab, slabTex, tiles = [], last, marker, markerParts = [], roll, ring;
const tones = []; // [material, base colour, dims with the strip?]
const tone = (hex, dims = true) => { const m = basic(hex, { transparent: false, depthWrite: true }); tones.push([m, new THREE.Color(hex), dims]); return m; };

// the marker's run: eased out along the boxes, a few hundredths past day 53, then back onto it by MARKER[1]
const RUN = MARKER[1] - MARKER[0] - 0.22, OVER = 0.015;
function markerP(t) {
  if (t < MARKER[0] + RUN) return io(r01(t, MARKER[0], RUN)) * (1 + OVER);
  const v = r01(t, MARKER[0] + RUN, 0.22);
  return 1 + OVER * (1 - v * v * (3 - 2 * v));
}
// how much of the strip is out: unrolls left to right on hold 16, rolls back up on hold 21
// the roll's opacity (round 3: it ended as a lone bright speck at 58.5 s). Time-keyed so only two short spans change:
// fades in over 45.70-46.00 s as the unroll starts, and on the roll-up fades out over UP + 0.25..0.55,
// done while the roll still travels and shrinks (k > 0.002 until UP + 0.552). After UP it also follows the roll's own
// radius, so the tiny roll that grows at the right end at 58.05 comes up from zero instead of switching on.
const ss = (x) => x * x * (3 - 2 * x);
function rollAlpha(t, r) {
  const fadeIn = ss(r01(t, T.h16 + 0.24, 0.3)), fadeOut = 1 - ss(r01(t, UP + 0.25, 0.3));
  return fadeIn * fadeOut * (t >= UP ? cl((r - 0.004) / 0.05) : 1);
}
// the roll-up: one hold early (round 4), so the strip is gone before hold 20's framing slices its right end.
// Runs UP..UP + 0.6 = T.h20 - 0.15..T.h20 + 0.45, which is where dayLit ends.
const UP = T.h20 - 0.15;
const outK = (t) => io(r01(t, T.h16 + 0.2, 1.0)) * (1 - io(r01(t, UP, 0.6)));

export function build(scene, { toon }) {
  // the paper face: labels only; the day boxes are their own geometry in front of it
  const face = hero(W, H, PPU, (g, Wc, Hc) => {
    g.fillStyle = "#eceae4"; g.fillRect(0, 0, Wc, Hc);
    g.fillStyle = "#d9d8d2"; g.fillRect(BOX0 - 2, 6, BOX1 - BOX0 + 4, Hc - 12); // the shallow bed the boxes sit in
    text(g, "July", 10, 30, 22, { c: "#14171b", w: 700 });
    text(g, "day 53", Wc - 8, 30, 22, { c: "#14171b", w: 700, a: "right" });
  });
  face.set({});
  slabTex = face.mesh.material.map;
  const front = tone("#ffffff"); front.map = slabTex; front.needsUpdate = true;
  // box faces: +x, -x, +y, -y, +z, -z
  slab = new THREE.Mesh(new THREE.BoxGeometry(W, H, SLAB), [tone("#b9b8b2"), tone("#b9b8b2"), tone("#f6f5f0"), tone("#77766f"), front, tone("#4a4a45")]);
  slab.position.set(LEFT + W / 2, Y, Z);
  scene.add(slab);

  const sides = tone("#a9a8a2"), top = tone("#f2f1eb"), bottom = tone("#86857f");
  const rest = tone("#d2d1cb"), passed = tone("#aeada7");
  const geo = new THREE.BoxGeometry(TW, TH, TD);
  for (let i = 0; i < DAYS - 1; i++) {
    const m = new THREE.Mesh(geo, [sides, sides, top, bottom, rest, sides]);
    m.position.set(boxX(i), Y, TZ);
    m.userData = { rest, passed };
    scene.add(m); tiles.push(m);
  }
  // day 53: its own materials, so it can lift alone
  last = new THREE.Mesh(geo, [tone("#a9a8a2", false), tone("#a9a8a2", false), tone("#f2f1eb", false), tone("#86857f", false), tone("#d2d1cb", false), tone("#a9a8a2", false)]);
  last.position.set(X1, Y, TZ);
  scene.add(last); tiles.push(last);
  ring = frame(TW + 0.05, TH + 0.06, 0.01, scene, X1, Y, TZ + TD / 2 + 0.006);

  // the marker: a dark bead with weight, a lit top face and a darker side, standing just proud of the strip
  marker = new THREE.Group();
  const mGeo = new THREE.BoxGeometry(0.036, H + 0.04, 0.04);
  const mMats = ["#2a2e33", "#2a2e33", "#4a5058", "#090b0d", "#14171b", "#090b0d"].map((c) => basic(c));
  const bead = new THREE.Mesh(mGeo, mMats);
  bead.position.y = (H + 0.04) / 2; // pivot at its foot, so it can lean into the run and squash on landing
  marker.add(bead); markerParts = mMats;
  marker.position.set(X0, Y - (H + 0.04) / 2, TZ + TD / 2 + 0.022);
  scene.add(marker);

  // the roll at the strip's leading edge: a toon-shaded paper cylinder with a few ribs so its turning reads
  const c = document.createElement("canvas"); c.width = 256; c.height = 16;
  const g = c.getContext("2d"); g.fillStyle = "#e6e5df"; g.fillRect(0, 0, 256, 16);
  g.fillStyle = "#b4b3ad"; for (let i = 0; i < 256; i += 32) g.fillRect(i, 0, 5, 16);
  const rTex = new THREE.CanvasTexture(c); rTex.colorSpace = THREE.SRGBColorSpace;
  roll = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, H + 0.01, 28, 1), toon("#ffffff", { map: rTex, fog: false }));
  scene.add(roll);
}

export function update(t) {
  const k = outK(t), edge = LEFT + W * k;
  // once the core takes the subject (hold 19), the strip steps back; day 53 keeps its light
  const dim = mix(1, 0.72, io(r01(t, T.h19, 0.4)) * (1 - r01(t, UP, 0.3)));
  for (const [m, c, dims] of tones) m.color.copy(c).multiplyScalar(dims ? dim : 1);

  // the slab: the left fraction k of it, its texture cut to match (never accumulates)
  const f = Math.max(0.0005, k);
  slab.visible = k > 0.002;
  slab.scale.x = f; slab.position.x = LEFT + (W * f) / 2;
  slabTex.repeat.x = f; slabTex.offset.x = 0;

  // the marker drops onto July's end once the strip is out, runs, and settles on day 53
  const p = markerP(t), mx = mix(X0, X1, p);
  const pv = markerP(t - 1 / 60), vel = (mx - mix(X0, X1, pv)) * 60; // world units a second, from t alone
  const drop = io(r01(t, MARKER[0] - 0.35, 0.3));
  const ma = drop * cl((edge - mx - 0.02) / 0.04);
  marker.visible = ma > 0.002;
  for (const m of markerParts) { m.opacity = ma; m.depthWrite = ma > 0.98; }
  marker.position.x = mx;
  marker.position.y = Y - (H + 0.04) / 2 + 0.18 * (1 - drop);
  marker.rotation.z = -THREE.MathUtils.clamp(vel * 0.03, -0.16, 0.16); // leans into the run
  const land = Math.max(0, 1 - Math.abs(t - (MARKER[0] + RUN + 0.02)) / 0.12);
  marker.scale.set(1 + 0.12 * land, 1 - 0.1 * land, 1);

  // day boxes: cut by the roll's edge; the ones the marker has passed go a shade darker
  const lit = dayLit(t) ? r01(t, MARKER[1], 0.15) : 0; // stays lit until the roll's edge takes the box (cut below)
  tiles.forEach((m, i) => {
    const x = boxX(i), l = x - TW / 2, sf = cl((edge - l) / TW);
    m.visible = sf > 0.01;
    m.scale.set(Math.max(0.01, sf), 1, 1);
    m.position.set(l + (TW * Math.max(0.01, sf)) / 2, Y, TZ);
    if (m !== last) m.material[4] = mx > x + TW * 0.5 && t >= MARKER[0] ? m.userData.passed : m.userData.rest;
  });
  // day 53 lifts: brighter face, a touch forward and taller, a thin white frame; no colour
  last.material[4].color.set("#d2d1cb").lerp(new THREE.Color("#ffffff"), lit);
  last.material[2].color.set("#f2f1eb").lerp(new THREE.Color("#ffffff"), lit);
  last.position.z = TZ + 0.018 * lit;
  last.scale.y = 1 + 0.08 * lit;
  ring.set(lit * cl((edge - X1 - TW / 2) / 0.02));

  // the roll rides the leading edge and is used up as the strip runs out (and grows back as it rolls up)
  const r = 0.075 * Math.sqrt(1 - k) * Math.sqrt(cl(k / 0.05)); // grows from nothing as it starts, shrinks away as it ends
  const ra = rollAlpha(t, r), rm = roll.material;
  rm.opacity = ra; rm.transparent = ra < 0.999; rm.depthWrite = ra > 0.98;
  roll.visible = k > 0.002 && ra > 0.002 && (t >= UP || r > 0.006);
  roll.scale.set(r, 1, r);
  roll.position.set(edge + r * 0.7, Y, Z + r * 0.8);
  roll.rotation.y = -(W * k) / 0.06; // turns with the paper paid out
}

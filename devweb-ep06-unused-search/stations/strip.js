// The calendar strip, holds 16-20: a long paper strip across the frame under the crate, in front of the chutes' lower
// half. Day boxes left to right, July at the left end, day 53 at the right end, nothing else. A marker runs and stops.
import * as THREE from "three";
import { alpha, basic, frame, hero, revealLeft, text } from "../parts.js";
import { MARKER, T, dayLit, io, mix, r01 } from "../timeline.js";

const LEFT = -1.5, W = 3.3, Y = 1.725, Z = -1.0, DAYS = 53, PPU = 200;
const BOX0 = 18, BOXW = (W * PPU - 36) / DAYS; // canvas px
const boxX = (i) => LEFT + (BOX0 + BOXW * (i + 0.5)) / PPU; // world x of day box i (0-based)
let strip, marker, lit, litRing;

export function build(scene) {
  strip = hero(W, 0.45, PPU, (g, Wc, H) => {
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, Wc, H);
    text(g, "July", BOX0, 30, 24, { c: "#14171b", w: 700 });
    text(g, "day 53", Wc - BOX0, 30, 24, { c: "#14171b", w: 700, a: "right" });
    g.strokeStyle = "#8b8a84"; g.lineWidth = 1.5;
    for (let i = 0; i < DAYS; i++) g.strokeRect(BOX0 + BOXW * i + 1, 44, BOXW - 2, 34);
  });
  strip.set({});
  strip.mesh.position.set(LEFT + W / 2, Y, Z);
  scene.add(strip.mesh);
  marker = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.2), basic("#14171b"));
  marker.position.set(boxX(0), Y - 0.08, Z + 0.01);
  scene.add(marker);
  lit = new THREE.Mesh(new THREE.PlaneGeometry(BOXW / PPU, 0.17), basic("#ffffff", { blending: THREE.AdditiveBlending }));
  lit.position.set(boxX(DAYS - 1), Y - 0.08, Z + 0.012);
  scene.add(lit);
  litRing = frame(BOXW / PPU + 0.05, 0.22, 0.012, scene, boxX(DAYS - 1), Y - 0.08, Z + 0.015);
}

export function update(t) {
  // unrolls left to right on hold 16, rolls away on hold 21
  const k = io(r01(t, T.h16 + 0.2, 1.0)) * (1 - io(r01(t, T.h21, 0.6)));
  alpha(strip.mesh, k > 0.002 ? 1 : 0);
  revealLeft(strip, LEFT, k);
  const mk = io(r01(t, MARKER[0], MARKER[1] - MARKER[0]));
  alpha(marker, t >= MARKER[0] && k > 0.98 ? 1 : 0);
  marker.position.x = mix(boxX(0), boxX(DAYS - 1), mk);
  const la = dayLit(t) ? r01(t, MARKER[1], 0.15) * (1 - r01(t, T.h21, 0.3)) : 0;
  alpha(lit, 0.35 * la);
  litRing.set(la);
}

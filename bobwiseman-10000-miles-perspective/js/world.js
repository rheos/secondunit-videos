// An invented BC tour town at winter dusk: one main street running along -z to a hall that closes it.
// Units are metres. Facades face the street: the left side (x < 0) faces +x, the right side faces -x.
import * as THREE from "./lib/three.module.js";
import { box, cyl, put, textPlane, newPid } from "./kit.js";

// Seeded random so the town is the same every run.
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const pick = (a) => a[Math.floor(rnd() * a.length)];

export const PAL = {
  snow: "#e9eef5", road: "#7d8597", curb: "#b9c0cc", plaza: "#c9ccd6", trim: "#f1eadb", roof: "#f4f6fa",
  ink: "#1b1622", glass: "#2c3650", warm: "#ffc978", lamp: "#ffe2a6",
  walls: ["#a5523f", "#e2d2ad", "#4f7f78", "#c9963f", "#5b6f8f", "#d9d2c3", "#8a4a5c", "#6f8a5a"],
};
const T = (hex) => "t:" + hex;
const E = (hex) => "e:" + hex;

export const lamps = []; // world positions of lamp heads, for the warm pools in the shader

const SIGNS = ["HARDWARE", "LAKE CAFE", "BOOKS", "BAKERY", "PHARMACY", "OUTFITTERS", "BARBER", "GROCERY", "HOTEL", "DINER", "RECORDS", "THRIFT", "TAILOR", "POST OFFICE", "SKI SHOP", "TEA ROOM"];
let signI = 0;

function windowOn(face, x, y, z, w, h, lit) {
  // A trim frame standing 0.10 out from the wall, and the pane 0.04 in front of the frame (no ink on the pane).
  const glass = lit ? E(rnd() < 0.5 ? PAL.warm : "#ffb764") : T(PAL.glass);
  if (face === "+x") {
    const pid = box(x, y - 0.12, z - 0.12, 0.1, h + 0.24, w + 0.24, T(PAL.trim));
    box(x + 0.1, y, z, 0.04, h, w, glass, { pid });
    box(x, y - 0.24, z - 0.2, 0.22, 0.12, w + 0.4, T(PAL.trim)); // sill
  } else if (face === "-x") {
    const pid = box(x - 0.1, y - 0.12, z - 0.12, 0.1, h + 0.24, w + 0.24, T(PAL.trim));
    box(x - 0.14, y, z, 0.04, h, w, glass, { pid });
    box(x - 0.22, y - 0.24, z - 0.2, 0.22, 0.12, w + 0.4, T(PAL.trim));
  } else {
    const pid = box(x - 0.12, y - 0.12, z, w + 0.24, h + 0.24, 0.1, T(PAL.trim));
    box(x, y, z + 0.1, w, h, 0.04, glass, { pid });
    box(x - 0.2, y - 0.24, z, w + 0.4, 0.12, 0.22, T(PAL.trim));
  }
}

// One shop building on side s (-1 left, +1 right), front at x = s*6.5, from z0 to z0 - w.
function building(s, z0, w) {
  const floors = rnd() < 0.55 ? 2 : 3, FH = 3.4, H = floors * FH, depth = 13;
  const wall = pick(PAL.walls), fx = s * 6.5;
  const zMin = z0 - w;
  const x0 = s < 0 ? -6.5 - depth : 6.5;
  box(x0, 0, zMin, depth, H, w, T(wall));
  // false front parapet, stepped, plus cornice and snow on the roof
  const pH = 1.1 + rnd() * 1.2;
  const front = s < 0 ? -6.5 - 0.5 : 6.5;
  box(front, H, zMin, 0.5, pH, w, T(wall));
  box(s < 0 ? -6.5 - 0.1 : 6.5 - 0.25, H + pH, zMin - 0.15, 0.35, 0.35, w + 0.3, T(PAL.trim));
  box(s < 0 ? -6.5 - 0.15 : 6.5 - 0.35, H - 0.35, zMin - 0.1, 0.5, 0.3, w + 0.2, T(PAL.trim));
  box(x0 + 0.3, H, zMin + 0.3, depth - 0.8, 0.35, w - 0.6, T(PAL.roof));
  box(front + (s < 0 ? -0.05 : 0), H + pH + 0.35, zMin - 0.1, 0.6, 0.18, w + 0.2, T(PAL.roof));
  // chimney or vent on the roof, for the elevated views
  if (rnd() < 0.7) { const cx = x0 + depth * (0.3 + rnd() * 0.4), cz = zMin + w * (0.2 + rnd() * 0.6); box(cx, H, cz, 0.8, 1.6, 0.8, T("#8b5a48")); box(cx - 0.05, H + 1.6, cz - 0.05, 0.9, 0.2, 0.9, T(PAL.roof)); }
  // upper windows on the street face
  const face = s < 0 ? "+x" : "-x";
  const n = Math.max(2, Math.floor(w / 2.8)), ww = 1.15, wh = 1.6;
  for (let f = 1; f < floors; f++) for (let i = 0; i < n; i++) {
    const zc = zMin + (w * (i + 0.5)) / n - ww / 2;
    windowOn(face, fx, f * FH + 0.9, zc, ww, wh, rnd() < 0.55);
  }
  // shopfront: big window, door, awning, sign
  const sx = s < 0 ? -6.5 : 6.5, out = -s;
  const doorZ = zMin + 0.8;
  if (s < 0) {
    box(sx, 0, zMin + 0.6, 0.12, 2.9, w - 1.2, T(PAL.trim));
    box(sx + 0.12, 0.7, doorZ + 1.6, 0.04, 1.9, w - 3.4, E(PAL.warm), { pid: newPid() });
    box(sx + 0.12, 0, doorZ, 0.08, 2.3, 1.1, T("#3a2c2a"));
  } else {
    box(sx - 0.12, 0, zMin + 0.6, 0.12, 2.9, w - 1.2, T(PAL.trim));
    box(sx - 0.16, 0.7, doorZ + 1.6, 0.04, 1.9, w - 3.4, E(PAL.warm), { pid: newPid() });
    box(sx - 0.2, 0, doorZ, 0.08, 2.3, 1.1, T("#3a2c2a"));
  }
  // awning: a sloped slab with snow on it
  const aw = pick(["#b8443a", "#2f6c6a", "#c99a3c", "#3d4f7a", "#7a3b52"]);
  put(new THREE.BoxGeometry(1.5, 0.12, w - 0.8), T(aw), [sx + out * 0.72, 3.15, zMin + w / 2], [0, 0, -out * 0.32]);
  put(new THREE.BoxGeometry(1.4, 0.1, w - 0.9), T(PAL.roof), [sx + out * 0.7, 3.27, zMin + w / 2], [0, 0, -out * 0.32]);
  if (rnd() < 0.85) textPlane([SIGNS[signI++ % SIGNS.length]], Math.min(w - 1.5, 6.5), 0.75, [sx + out * 0.14, 3.85, zMin + w / 2], face, { bg: pick(["#f2e6c8", "#1f3b3a", "#5a2430", "#283456"]), fg: "#fff4dc", border: "#c9a24a" });
  // back of the building: a few dark windows and a door, for views from behind
  const bx = s < 0 ? -6.5 - depth : 6.5 + depth;
  for (let f = 0; f < floors; f++) for (let i = 0; i < 2; i++) windowOn(s < 0 ? "-x" : "+x", bx, f * FH + 0.9, zMin + w * (0.25 + i * 0.5) - 0.5, 1.0, 1.4, rnd() < 0.2);
}

function lamp(x, z) {
  const s = Math.sign(x);
  cyl(x, 0.15, z, 0.16, 0.09, 4.8, T("#2b3040"));
  cyl(x, 0.15, z, 0.24, 0.24, 0.35, T("#2b3040"));
  put(new THREE.BoxGeometry(1.0, 0.08, 0.08), T("#2b3040"), [x - s * 0.5, 4.85, z]);
  const pid = box(x - s * 1.0 - 0.28, 4.62, z - 0.28, 0.56, 0.3, 0.56, T("#2b3040"));
  box(x - s * 1.0 - 0.22, 4.5, z - 0.22, 0.44, 0.12, 0.44, E(PAL.lamp), { pid });
  // a winter wreath banner on every other lamp
  if (Math.round(z / 16) % 2 === 0) put(new THREE.TorusGeometry(0.42, 0.1, 6, 18), T("#2f6b4a"), [x, 3.5, z], [0, Math.PI / 2, 0]);
  lamps.push(new THREE.Vector3(x - s * 1.0, 4.5, z));
}

function car(x, z, color) {
  const s = Math.sign(x);
  box(x - 0.9, 0.35, z - 2.1, 1.8, 0.75, 4.2, T(color));
  box(x - 0.8, 1.1, z - 1.2, 1.6, 0.65, 2.2, T(color));
  box(x - 0.82, 1.15, z - 1.05, 1.64, 0.5, 1.9, T(PAL.glass));
  box(x - 0.85, 1.75, z - 1.25, 1.7, 0.18, 2.3, T(PAL.roof));
  for (const dz of [-1.35, 1.35]) for (const dx of [-0.85, 0.85]) put(new THREE.CylinderGeometry(0.36, 0.36, 0.3, 14), T("#222630"), [x + dx, 0.36, z + dz], [0, 0, Math.PI / 2]);
  for (const dx of [-0.55, 0.55]) box(x + dx - 0.18, 0.75, z + 2.1, 0.36, 0.18, 0.06, E("#fff1c4"), { pid: newPid() });
  box(x - 0.95, 0.3, z + 2.05, 1.9, 0.2, 0.2, T("#c8ccd4"));
}

function evergreen(x, z, h) {
  cyl(x, 0, z, 0.28, 0.22, h * 0.25, T("#5a3d2e"));
  for (let i = 0; i < 4; i++) {
    const y = h * (0.2 + i * 0.18), r = h * (0.32 - i * 0.065);
    put(new THREE.ConeGeometry(r, h * 0.32, 10), T("#2f5a48"), [x, y + h * 0.16, z]);
    put(new THREE.ConeGeometry(r * 0.72, h * 0.12, 10), T(PAL.snow), [x, y + h * 0.27, z]);
  }
}

// The hall that closes the street, facing +z at z = -92.
function hall() {
  const z = -92, W = 26, H = 12.5;
  box(-W / 2, 0, z - 16, W, H, 16, T("#9c4637"));
  box(-W / 2 - 0.2, H, z - 0.4, W + 0.4, 2.2, 0.6, T("#9c4637"));
  box(-W / 2 - 0.4, H + 2.2, z - 0.55, W + 0.8, 0.4, 0.9, T(PAL.trim));
  box(-W / 2 - 0.3, H - 0.5, z - 0.25, W + 0.6, 0.4, 0.6, T(PAL.trim));
  box(-W / 2, H, z - 16, W, 0.4, 15.4, T(PAL.roof));
  box(-W / 2 - 0.4, H + 2.6, z - 0.6, W + 0.8, 0.22, 1.0, T(PAL.roof));
  textPlane(["THE GRAND"], 9, 1.5, [0, H + 1.1, z + 0.26], "+z", { bg: "#9c4637", fg: "#f6e7c4", font: "Didot, Georgia, serif", size: 0.8 });
  // pilasters and tall windows
  for (let i = 0; i < 7; i++) { const x = -W / 2 + 0.6 + i * ((W - 1.8) / 6); box(x, 0, z, 0.6, H - 0.5, 0.3, T(PAL.trim)); }
  for (let i = 0; i < 6; i++) {
    const x = -W / 2 + 1.2 + i * ((W - 1.8) / 6) + 0.55;
    if (i === 2 || i === 3) continue;
    windowOn("+z", x, 6.2, z, 1.9, 3.6, true);
    windowOn("+z", x, 1.4, z, 1.9, 2.2, i % 2 === 0);
  }
  // doors and the marquee
  const dpid = box(-2.6, 0, z, 5.2, 3.1, 0.12, T("#3a2c2a"));
  box(-2.4, 0.1, z + 0.12, 2.3, 2.8, 0.04, E("#ffcf86"), { pid: dpid });
  box(0.1, 0.1, z + 0.12, 2.3, 2.8, 0.04, E("#ffcf86"), { pid: dpid });
  box(-6, 3.6, z, 12, 2.4, 2.6, T("#2d2433"));
  box(-6.2, 6.0, z - 0.1, 12.4, 0.3, 2.9, T(PAL.roof));
  textPlane(["TONIGHT", "BOB WISEMAN"], 11.2, 2.0, [0, 4.8, z + 2.66], "+z", { bg: "#fff3d6", fg: "#2a1d22", font: "Futura, Avenir, sans-serif", weight: 800, size: 0.7, glow: true });
  for (let i = 0; i < 22; i++) { const bx = -5.7 + i * (11.4 / 21); const p = box(bx - 0.07, 3.5, z + 2.6, 0.14, 0.14, 0.14, E("#ffe9b0"), { pid: newPid() }); }
  // poster boards either side of the doors
  textPlane(["10,000", "MILES"], 1.6, 2.2, [-4.2, 1.6, z + 0.16], "+z", { bg: "#2f5a6a", fg: "#ffe9c2", font: "Futura, sans-serif", size: 0.6 });
  textPlane(["PIANO", "& SONGS"], 1.6, 2.2, [4.2, 1.6, z + 0.16], "+z", { bg: "#7a3b52", fg: "#ffe9c2", font: "Futura, sans-serif", size: 0.55 });
  // steps
  for (let i = 0; i < 3; i++) box(-4 + i * 0.3, 0, z + 0.9 - i * 0.3, 8 - i * 0.6, 0.18 * (i + 1), 0.3 + 0.3, T("#b9b3ad"));
  // side walls get windows for the corner views
  for (let i = 0; i < 4; i++) { windowOn("-x", -W / 2, 6.5, z - 3 - i * 3.4, 1.4, 2.6, i % 2 === 0); windowOn("+x", W / 2, 6.5, z - 3 - i * 3.4, 1.4, 2.6, i % 3 === 0); }
}

function mountains() {
  const M = [[-260, -620, 210, 300], [-60, -760, 300, 380], [190, -660, 240, 320], [420, -820, 330, 420], [-480, -840, 300, 380]];
  for (const [x, z, h, r] of M) {
    put(new THREE.ConeGeometry(r, h, 7), T("#6b6690"), [x, h / 2 - 5, z]);
    put(new THREE.ConeGeometry(r * 0.36, h * 0.36, 7), T("#eef0f8"), [x, h - h * 0.18 - 5 + 0.5, z]);
  }
  // a dark line of forest at the foot of the mountains
  for (let i = 0; i < 40; i++) { const x = -420 + i * 22 + rnd() * 8, z = -480 - rnd() * 60, h = 9 + rnd() * 6; put(new THREE.ConeGeometry(h * 0.3, h, 7), T("#33405a"), [x, h / 2, z]); }
}

function van(x, z) {
  // the tour van, parked in the lot beside the hall, nose toward the street
  const c = "#e7e1d3", s = "#2f6c6a";
  box(x - 2.6, 0.45, z - 1.0, 5.2, 1.9, 2.0, T(c));
  box(x + 2.6, 0.45, z - 1.0, 1.0, 1.1, 2.0, T(c));
  box(x - 2.62, 1.05, z - 1.02, 5.24, 0.35, 2.04, T(s));
  box(x + 2.62, 1.45, z - 0.9, 0.5, 0.6, 1.8, T(PAL.glass));
  box(x - 2.7, 2.35, z - 1.05, 5.4, 0.22, 2.1, T(PAL.roof));
  for (const dx of [-1.8, 2.3]) for (const dz of [-1.0, 1.0]) put(new THREE.CylinderGeometry(0.42, 0.42, 0.32, 14), T("#222630"), [x + dx, 0.42, z + dz], [Math.PI / 2, 0, 0]);
  for (const dz of [-0.6, 0.6]) box(x + 3.6, 0.85, z + dz - 0.15, 0.06, 0.2, 0.3, E("#fff1c4"), { pid: newPid() });
  textPlane(["BOB WISEMAN", "ON TOUR"], 3.2, 0.9, [x - 0.4, 1.55, z + 1.03], "+z", { bg: c, fg: "#2f6c6a", font: "Futura, sans-serif", size: 0.62 });
}

function lot() {
  // empty snowy lot on the right between the hall and the shops: a low fence, trees and the van
  box(7.2, 0.0, -82, 0.12, 1.0, 22, T("#6a4a3a"));
  for (let z = -82; z <= -60; z += 2.2) box(7.12, 0, z, 0.28, 1.25, 0.28, T("#6a4a3a"));
  box(7.2, 1.0, -82, 0.18, 0.08, 22, T(PAL.roof));
  van(12.5, -70);
  evergreen(17.5, -64, 8); evergreen(19, -76, 9.5); evergreen(10.5, -78, 6.5);
  for (let i = 0; i < 5; i++) box(8.5 + i * 2.1, 0, -62.5, 1.3, 0.55 + (i % 2) * 0.2, 1.4, T(PAL.snow));
}

export function buildTown() {
  // ground: snowy field, road, sidewalks with curbs, plaza in front of the hall
  box(-600, -1, -950, 1200, 1, 2000, T(PAL.snow));
  box(-4, -0.98, -82, 8, 1.0, 1100 - 18, T(PAL.road));
  box(-4.4, -1, -82, 0.4, 1.15, 1082, T(PAL.curb)); box(4, -1, -82, 0.4, 1.15, 1082, T(PAL.curb));
  box(-6.5, -1, -82, 2.1, 1.12, 1082, T(PAL.plaza)); box(4.4, -1, -82, 2.1, 1.12, 1082, T(PAL.plaza));
  box(-14, -1, -92, 28, 1.1, 10, T(PAL.plaza));
  // tyre tracks: two darker strips, raised clear of the road surface
  for (const x of [-2.6, -1.3, 1.3, 2.6]) box(x - 0.25, 0.02, -82, 0.5, 0.06, 1080, T("#6a7284"));
  // snowbanks along both curbs, broken at crossings
  for (const s of [-1, 1]) for (let z = -80; z < 400; z += 9) box(s * 4.6 - 0.45, 0.12, z, 0.9, 0.5 + rnd() * 0.25, 6.5 + rnd() * 1.5, T(PAL.snow));
  // buildings both sides from the plaza toward the camera
  for (const s of [-1, 1]) { let z = s > 0 ? -60 : -82; while (z < 420) { const w = 8 + Math.floor(rnd() * 7); building(s, z + w, w); z += w + (rnd() < 0.15 ? 4 : 0); } }
  for (let z = -76; z < 420; z += 16) { lamp(-5.3, z); lamp(5.3, z + 8); }
  evergreen(-11.5, -86, 11); evergreen(11.5, -86, 12); evergreen(-15.5, -89, 9); evergreen(15.5, -90, 10);
  hall();
  lot();
  mountains();
}

// --- moving things, each built from its own part list so it can move as one object ---

export function roadCase(list, label) {
  const o = { target: list };
  box(-0.55, 0.08, -0.38, 1.1, 0.78, 0.76, T("#25262c"), o);
  box(-0.57, 0.84, -0.4, 1.14, 0.06, 0.8, T("#b9bfc9"), o);
  box(-0.57, 0.08, -0.4, 1.14, 0.06, 0.8, T("#b9bfc9"), o);
  for (const x of [-0.57, 0.47]) for (const z of [-0.4, 0.3]) box(x, 0.08, z, 0.1, 0.82, 0.1, T("#b9bfc9"), o);
  for (const x of [-0.4, 0.4]) for (const z of [-0.25, 0.25]) put(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 10), T("#111"), [x, 0.07, z], [Math.PI / 2, 0, 0], o);
  textPlane([label], 0.8, 0.32, [0, 0.5, 0.41], "+z", { bg: "#25262c", fg: "#f1f1f1", font: "Courier, monospace", size: 0.8, target: list });
}

export function person(list, coat, hat) {
  const o = { target: list };
  box(-0.13, 0, -0.1, 0.11, 0.8, 0.16, T("#2b2a33"), o); box(0.02, 0, -0.1, 0.11, 0.8, 0.16, T("#2b2a33"), o);
  put(new THREE.CylinderGeometry(0.2, 0.3, 0.85, 12), T(coat), [0, 1.2, 0], [0, 0, 0], o);
  put(new THREE.SphereGeometry(0.15, 12, 10), T("#e9c3a2"), [0, 1.78, 0], [0, 0, 0], o);
  put(new THREE.SphereGeometry(0.16, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), T(hat), [0, 1.82, 0], [0, 0, 0], o);
  put(new THREE.SphereGeometry(0.06, 8, 6), T(PAL.trim), [0, 2.0, 0], [0, 0, 0], o);
  put(new THREE.TorusGeometry(0.16, 0.05, 6, 14), T(hat), [0, 1.6, 0], [Math.PI / 2, 0, 0], o);
}

export function piano(list) {
  const o = { target: list }, wood = "#4a2b26";
  box(-0.85, 0.12, -0.3, 1.7, 0.1, 0.75, T("#6d6a66"), o); // dolly board
  for (const x of [-0.7, 0.7]) for (const z of [-0.2, 0.35]) put(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 10), T("#111"), [x, 0.06, z], [Math.PI / 2, 0, 0], o);
  box(-0.75, 0.22, -0.3, 1.5, 1.3, 0.38, T(wood), o);
  box(-0.8, 1.52, -0.32, 1.6, 0.08, 0.45, T(wood), o);
  box(-0.72, 0.22, 0.08, 0.08, 0.72, 0.3, T(wood), o); box(0.64, 0.22, 0.08, 0.08, 0.72, 0.3, T(wood), o);
  box(-0.64, 0.86, 0.08, 1.28, 0.06, 0.26, T("#f4efe2"), o);
  for (let i = 0; i < 9; i++) box(-0.6 + i * 0.14 + (i % 3 === 2 ? 0.04 : 0), 0.92, 0.08, 0.06, 0.04, 0.15, T("#15131a"), o);
  box(-0.72, 0.92, 0.08, 1.44, 0.22, 0.04, T(wood), o);
  box(-0.66, 1.0, -0.12, 1.32, 0.42, 0.04, T("#5c372f"), o);
  put(new THREE.BoxGeometry(1.7, 0.08, 0.78), T(PAL.roof), [0, 1.6, -0.12], [0, 0, 0], o); // a little snow on the lid
}

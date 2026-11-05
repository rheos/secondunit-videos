// The Sheet: one real length of paper from the head bar, and the date strips that ride it. Reveal is set from t, so any
// seek lands right. Rows show tool name and argument keys only until the fixed log at board 27, and again from board 32.
import * as THREE from "three";
import { PAPER, alpha, basic, frame, hero, paint, revealLeft, revealTop, states, staticPanel, text } from "../parts.js";
import { T, cl, easeKeys, io, mix, r01, rows, spanAlpha } from "../timeline.js";
import { rr } from "../kit/world.js";

const LEFT = 0.33, TOP = 2.95, MID = LEFT + 0.8, Z = -0.5, STUB = 2.45;
const rowY = (n) => 2.41 - (n - 1) * 0.097; // n counts from 1
const rowEnd = (n) => (n <= 0 ? STUB : n < 1 ? mix(STUB, rowY(1) - 0.045, n) : rowY(n) - 0.045);
const E10 = rowEnd(10), E36 = rowEnd(36);

// where the paper ends. rows(t) owns boards 13-16; everything else eases between these. Never accumulates.
const ENDS = [
  [0, 0, E10], [T.b03, 0.45, STUB], [T.b10, 0.45, E10], [T.b13, 0, E10],
  [T.b17 - 0.001, 0, E36], [T.b17, 0.6, E10], [T.b23, 0.4, STUB], [T.b26, 0.4, E10],
  [T.b27 - 0.4, 0.38, STUB], [T.b27, 0.4, 1.48], [T.b28, 1.8, -0.36], [T.b29, 0.4, STUB], [T.b32, 0.35, -0.1], [T.b33, 0.4, E10],
];
const yEnd = (t) => (t >= T.b13 && t < T.b17 ? rowEnd(rows(t)) : easeKeys(ENDS, t));

const TINT = states([[0, "REST"], [T.b03, "IDLE"], [T.b10, "REST"], [T.b11, "LIT"], [T.b17, "IDLE"], [T.b18, "REST"], [T.b19, "IDLE"], [T.b20, "LIT"], [T.b22, "IDLE"], [T.b27, "LIT"], [T.b28, "REST"], [T.b29, "IDLE"], [T.b32, "REST"], [T.b33, "IDLE"]], PAPER);
const HEAD = [[0, "#ffffff"]];
const VALUES = ["fts", "fts", "fts", "vector", "fts", "hybrid", "fts", "fts", "hybrid"]; // illustrative: the viewer's future log
const yourRow = (i) => 263 + 82.2 * i;
const SWAP = T.b33 + 0.3;

let pivot, log, torn, header, your, col, small, flag, run, long, cardRule, cardHyb, bead, rowRing, plusTag, gutter, runner;
const heads = [], folds = [];

function paperPanel(wu, hu, draw) {
  const p = hero(wu, hu, 320, draw);
  p.mesh.position.set(LEFT + wu / 2, TOP - hu / 2, Z);
  pivot.add(p.mesh);
  return p;
}

export function build(scene, { toon }) {
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.62, 14), toon("#8b949e", { fog: false }));
  bar.rotation.z = Math.PI / 2;
  bar.position.set(MID, 3.06, Z);
  scene.add(bar);
  const headPlate = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.16, 0.03), toon("#2c343e", { fog: false }));
  headPlate.position.set(MID, 3.01, -0.47);
  scene.add(headPlate);
  [["request log", [[-1, T.b13], [T.b17, T.b20], [T.b22, T.b27], [T.b32, T.END + 1]]],
    ["request log: 1 row, 1 call", [[T.b13, T.b17]]],
    ["request log: dates", [[T.b20, T.b22]]],
    ["your log, fixed", [[T.b27, T.b32]]]].forEach(([s, spans]) => {
    heads.push({ p: staticPanel(1.6, 0.16, 320, (g) => text(g, s, 18, 36, 30, { c: "#e6edf3" }), MID, 3.01, -0.45, scene), spans });
  });

  // the float pivots about the head bar; everything on the paper hangs inside it
  const hinge = new THREE.Group();
  hinge.position.set(MID, 3.06, Z);
  scene.add(hinge);
  pivot = new THREE.Group();
  pivot.position.set(-MID, -3.06, -Z);
  hinge.add(pivot);
  pivot.userData.hinge = hinge;

  // 36 rows, one canvas. The 37th call has no row: printing it would force keys the source doesn't state.
  log = paperPanel(1.6, 4.07, (g, W, H) => {
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 36; i++) {
      const y = 172.8 + 31.04 * i;
      text(g, "search", 20, y, 27, { c: "#22262b", w: 700 });
      text(g, "query", 158, y, 27, { c: "#6b6a65", w: 500 });
      g.strokeStyle = "#8b8a84"; g.lineWidth = 2; g.setLineDash([7, 6]); rr(g, 340, y - 21, 147, 26, 3); g.stroke(); g.setLineDash([]);
    }
  });
  log.set({});
  header = staticPanel(1.6, 0.1, 320, (g) => { text(g, "tool", 20, 26, 27, { c: "#4b4f55", w: 700 }); text(g, "keys", 158, 26, 27, { c: "#4b4f55", w: 700 }); }, MID, 2.516, -0.49, pivot);

  your = paperPanel(1.6, 3.31, (g, W, H, s) => {
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
    text(g, "tool", 20, 184, 35, { c: "#4b4f55", w: 700 });
    text(g, "keys", 158, 184, 35, { c: "#4b4f55", w: 700 });
    for (let i = 0; i < 9; i++) {
      text(g, "search", 20, yourRow(i), 37, { c: "#22262b", w: 700 });
      text(g, "query", 158, yourRow(i), 35, { c: "#6b6a65", w: 500 });
    }
    if (s.win) { // nobody has counted: three blank windows, on board 28 only
      g.fillStyle = "#22262b"; g.fillRect(20, 950, 472, 3);
      [["fts", 20, 163], ["vector", 131, 354], ["hybrid", 317, 435]].forEach(([n, tx, bx]) => {
        text(g, n, tx, 1010, 30, { c: "#22262b", w: 600 });
        g.strokeStyle = "#22262b"; g.lineWidth = 2; g.strokeRect(bx, 983, 42, 34);
      });
    }
  });
  your.set({ win: false });
  col = hero(0.6, 3.31, 320, (g, W, H, s) => {
    text(g, "mode", 25, 184, 40, { c: s.dash ? "#8b8a84" : "#22262b", w: 700 });
    for (let i = 0; i < 9; i++) {
      if (i < s.n) text(g, VALUES[i], 25, yourRow(i), 40, { c: VALUES[i] === "hybrid" ? "#2a5f94" : "#22262b", w: 700 });
      else if (s.dash) { g.strokeStyle = "#8b8a84"; g.lineWidth = 2; g.setLineDash([7, 6]); rr(g, 25, yourRow(i) - 30, 147, 34, 3); g.stroke(); g.setLineDash([]); }
    }
  });
  col.mesh.position.set(1.63, TOP - 3.31 / 2, -0.49);
  pivot.add(col.mesh);

  torn = hero(1.6, 0.06, 320, (g, W, H) => {
    g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0);
    for (let x = W; x >= 0; x -= 24) { g.lineTo(x, H); g.lineTo(x - 12, 2); }
    g.closePath(); g.fill();
  });
  torn.set({});
  torn.mesh.position.set(MID, 0, -0.498);
  pivot.add(torn.mesh);

  // three folds of paper on the floor, past row 36: thin angled planes, each with its own start from rows(t)
  [[-1.05, -0.44, 0.9], [-1.085, -0.35, 0.55], [-1.105, -0.27, 0.25]].forEach(([y, z, tilt]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.11), basic("#ffffff"));
    m.position.set(MID, y, z);
    m.rotation.x = -tilt;
    pivot.add(m);
    folds.push(m);
  });

  // the small strip: across the top margin, so no row lines up with a date
  small = hero(1.6, 0.42, 320, (g, W) => {
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, 134);
    text(g, "Jul 5", 10, 85, 31, { c: "#22262b", w: 700 });
    text(g, "Aug 27", 502, 85, 32, { c: "#22262b", w: 700, a: "right" });
    g.fillStyle = "#22262b"; g.fillRect(12, 106, 480, 4); g.fillRect(12, 96, 4, 24); g.fillRect(488, 96, 4, 24);
  });
  small.set({});
  small.mesh.position.set(MID, 2.735, -0.4);
  pivot.add(small.mesh);
  flag = staticPanel(0.7, 0.24, 320, (g) => {
    text(g, "hybrid starts", 215, 26, 27, { c: "#2a5f94", w: 700, a: "right" });
    g.fillStyle = "#4f93d6"; g.fillRect(205, 34, 4, 26);
    g.beginPath(); g.moveTo(205, 34); g.lineTo(166, 46); g.lineTo(205, 58); g.closePath(); g.fill();
  }, 1.6, 2.835, -0.38, pivot);
  run = hero(1.6, 0.06, 320, (g) => { g.fillStyle = "#4b4f55"; for (let x = 14; x < 480; x += 22) g.fillRect(x, 8, 13, 4); g.beginPath(); g.moveTo(490, 10); g.lineTo(476, 2); g.lineTo(476, 18); g.closePath(); g.fill(); });
  run.set({});
  run.mesh.position.set(MID, 2.685, -0.39);
  pivot.add(run.mesh);
  bead = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.05), basic("#ffffff", { blending: THREE.AdditiveBlending }));
  bead.position.set(MID, 2.635, -0.38);
  pivot.add(bead);

  // the long strip replaces the rows. No line, arrow or bracket joins the two cards.
  long = hero(1.6, 1.46, 320, (g, W, H) => {
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
    text(g, "no search", 10, 156, 31, { c: "#22262b", w: 700 });
    text(g, "on its own", 10, 196, 31, { c: "#22262b", w: 700 });
    text(g, "hybrid in", 93, 283, 27, { c: "#4b4f55", w: 600 });
    text(g, "Jun", 10, 375, 32, { c: "#22262b", w: 700 });
    text(g, "Jul 5", 165, 375, 32, { c: "#22262b", w: 700, a: "center" });
    text(g, "Aug 27", 365, 375, 32, { c: "#22262b", w: 700, a: "center" });
    g.fillStyle = "#22262b"; g.fillRect(10, 393, 355, 4);
    g.fillStyle = "#4f93d6"; g.fillRect(365, 391, 135, 8); // hybrid only, and no marks on it: nothing counts Aug 27's calls
    g.fillStyle = "#22262b"; g.fillRect(163, 300, 4, 45); g.fillRect(363, 110, 4, 235); g.fillRect(363, 382, 4, 26);
    g.fillStyle = "#4b4f55"; g.fillRect(167, 410, 196, 2);
    text(g, "53 days", 265, 440, 30, { c: "#4b4f55", w: 600, a: "center" });
  });
  long.set({});
  long.mesh.position.set(MID, TOP - 1.46 / 2, -0.4);
  pivot.add(long.mesh);
  const card = (lines, c, wu, hu) => (g, W, H) => {
    g.fillStyle = "#ffffff"; rr(g, 2, 2, W - 4, H - 4, 6); g.fill();
    g.strokeStyle = c; g.lineWidth = 3; rr(g, 2, 2, W - 4, H - 4, 6); g.stroke();
    lines.forEach((s, i) => text(g, s, W / 2, 36 + i * 32, 27, { c, w: 700, a: "center" }));
  };
  cardRule = staticPanel(0.39, 0.31, 320, card(["written", "rule"], "#22262b"), 1.211, 2.34, -0.38, pivot);
  cardHyb = staticPanel(0.345, 0.4, 320, card(["hybrid", "calls", "begin"], "#2a5f94"), 1.72, 2.356, -0.38, pivot);

  // the newest row, its +1, and the run up the gutter to the default window. The other window gets none of this.
  rowRing = frame(1.54, 0.095, 0.01, pivot, MID, 0, -0.42);
  plusTag = staticPanel(0.36, 0.2, 300, (g, W, H) => { g.fillStyle = "#0d1117"; rr(g, 1, 1, W - 2, H - 2, 6); g.fill(); text(g, "+1", W / 2, H / 2 + 12, 33, { c: "#ffffff", w: 700, a: "center" }); }, 0.23, 0, -0.4, pivot);
  gutter = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 1), basic("#ffffff"));
  gutter.position.set(0.23, 0, -0.41);
  pivot.add(gutter);
  runner = new THREE.Mesh(new THREE.CircleGeometry(0.03, 16), basic("#ffffff"));
  runner.position.set(0.23, 0, -0.405);
  pivot.add(runner);
}

export function update(t) {
  pivot.userData.hinge.rotation.z = THREE.MathUtils.degToRad(0.15) * Math.sin(t * 0.6); // a held sheet doesn't freeze

  const ye = yEnd(t), L = TOP - ye;
  const yourOn = t >= T.b27 && t < SWAP + 0.1;
  const logA = !yourOn ? 1 : t >= SWAP ? r01(t, SWAP, 0.1) : 0;
  const yourA = yourOn ? 1 - r01(t, SWAP, 0.1) : 0;
  alpha(log.mesh, logA); revealTop(log, TOP, L);
  paint(log.mesh.material, TINT, t);
  alpha(your.mesh, yourA); revealTop(your, TOP, L);
  paint(your.mesh.material, TINT, t);
  alpha(header.mesh, logA * cl((STUB - ye) / 0.08));
  paint(header.mesh.material, TINT, t);

  // the mode column: slides in on 27, values type row by row, wiped upward on 32
  const inWipe = t >= T.b32;
  const n = inWipe ? Math.ceil(9 * (1 - r01(t, T.b32 + 0.1, 1.2))) : t < T.b28 ? Math.floor(3 * r01(t, T.b27 + 0.3, 1.3) + 1e-6) : 3 + Math.floor(6 * r01(t, T.b28 + 0.2, 1.6) + 1e-6);
  your.set({ win: !inWipe && t >= T.b28 + 1.6 });
  col.set({ n, dash: inWipe });
  const slide = io(r01(t, T.b27 + 0.1, 0.35));
  col.mesh.position.x = 1.63 + (1 - slide) * 0.25;
  alpha(col.mesh, yourA * slide);
  revealTop(col, TOP, L);
  paint(col.mesh.material, TINT, t);

  torn.mesh.position.y = ye - 0.03;
  paint(torn.mesh.material, TINT, t);

  const r = rows(t), tailOff = 1 - r01(t, T.b17, 0.2);
  folds.forEach((m, i) => {
    const on = t >= T.b16 && t < T.b17 + 0.2 ? r01(r, 34.2 + i * 0.6, 0.6) * tailOff : 0;
    alpha(m, on);
    paint(m.material, TINT, t);
  });

  heads.forEach(({ p, spans }) => { alpha(p.mesh, spanAlpha(spans, t, 0.1)); paint(p.mesh.material, HEAD, t); });

  // the small strip. First pass: draws left to right, the blue flag lands last, lifts off before anything else moves.
  const lift = r01(t, T.stripLift, T.stripGone - T.stripLift);
  const firstOn = t >= T.stripIn && t < T.stripGone, secondOn = t >= T.b18 && t < T.b20 + 0.2;
  const sA = firstOn ? r01(t, T.stripIn, 0.05) * (1 - lift) : secondOn ? r01(t, T.b18, 0.15) * (1 - r01(t, T.b20, 0.2)) : 0;
  alpha(small.mesh, sA);
  revealLeft(small, LEFT, firstOn ? io(r01(t, T.stripIn, 1.9)) : 1);
  small.mesh.position.y = 2.735 + (firstOn ? lift * 0.3 : 0);
  paint(small.mesh.material, TINT, t);
  const fk = r01(t, T.flag, 0.2);
  alpha(flag.mesh, firstOn && t >= T.flag ? fk * (1 - lift) : 0);
  flag.mesh.position.y = 2.835 + (1 - io(fk)) * 0.25 + lift * 0.3;
  alpha(run.mesh, secondOn ? sA : 0);
  revealLeft(run, LEFT, io(r01(t, T.b18 + 0.2, T.d27 + 0.3 - T.b18 - 0.2)));
  // on 12 a light runs the empty bar
  const bk = r01(t, T.b12 + 0.26, 1.34);
  alpha(bead, t > T.b12 + 0.26 && t < T.b12 + 1.6 ? 0.8 * Math.sin(bk * Math.PI) : 0);
  bead.position.x = mix(LEFT + 0.1, LEFT + 1.5, bk);

  // the long strip
  const lk = io(r01(t, T.b20, 0.55)) * (1 - io(r01(t, T.b22, 0.4)));
  alpha(long.mesh, lk > 0.001 ? 1 : 0);
  revealTop(long, TOP, 1.46 * lk);
  paint(long.mesh.material, TINT, t);
  const cA = r01(t, T.day - 0.12, 0.12) * (1 - r01(t, T.b22, 0.3));
  alpha(cardRule.mesh, cA); alpha(cardHyb.mesh, cA);

  // +1: on 14 and 15 only, faded by "and that call"
  const pA = r01(t, T.b14, 0.1) * (1 - r01(t, T.b16 - 0.2, 0.2));
  const newest = Math.max(1, Math.floor(r + 1e-6)), ny = rowY(newest) + 0.02;
  rowRing.set(pA); rowRing.group.position.y = ny;
  alpha(plusTag.mesh, pA); plusTag.mesh.position.y = ny;
  const top = 3.95, h = Math.max(0.01, top - ny);
  alpha(gutter, pA * 0.7); gutter.scale.y = h; gutter.position.y = ny + h / 2;
  const frac = r - Math.floor(r); // the +1 runs up as each row prints
  alpha(runner, pA * (frac > 0.02 ? 1 : 0)); runner.position.y = mix(ny, top, frac);
}

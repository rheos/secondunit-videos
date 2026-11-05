// The Tally: calls by mode, two windows. A shut window shows a dash, never a 0. Nothing ever points at the other window.
// The digit and the printed rows both read rows(t) in timeline.js; the shutter's clock is there too, beside the mark's.
import { DIGIT, PLATE, frame, hero, paint, solid, staticPanel, states, text, revealTop } from "../parts.js";
import { T, defaultDigits, shutter, spanAlpha } from "../timeline.js";

const WIN_Y = 4.117, WIN_H = 0.52, OTHER_X = 1.182;
let dflt, other, shut, plate, ring, otherRing;

// LIT on 01, 02, 10, 13-16, 33; IDLE otherwise. Board 25's ring on the 1 is gone (world plan, section 7).
const DIGITS = states([[0, "LIT"], [T.b03, "IDLE"], [T.b10, "LIT"], [T.b11, "IDLE"], [T.b13, "LIT"], [T.b17, "IDLE"], [T.b33, "LIT"], [T.endIn, "IDLE"]], DIGIT);
const TITLE = states([[0, "LIT"], [T.b03, "IDLE"], [T.b10, "LIT"], [T.b11, "IDLE"], [T.b13, "LIT"], [T.b17, "IDLE"], [T.b33, "LIT"]], PLATE);

const digitPanel = (wu) => hero(wu, WIN_H, 300, (g, W, H, s) => { text(g, s.d, W / 2, H / 2 + 44, 123, { c: "#ffffff", w: 700, a: "center" }); });

export function build(scene, { toon }) {
  solid(toon, 1.22, 0.97, 0.25, "#161b22", 0.854, 4.265, -1.125, scene);
  solid(toon, 0.05, 2.06, 0.05, "#2c343e", 0.854, 2.75, -1.1, scene);
  plate = staticPanel(1.22, 0.37, 300, (g, W) => {
    text(g, "calls by mode", W / 2, 44, 34, { c: "#ffffff", w: 700, a: "center" });
    text(g, "default", 20, 94, 30, { c: "#ffffff" });
    text(g, "other", 235, 94, 30, { c: "#ffffff" });
  }, 0.854, 4.565, -0.99, scene);
  // the windows: dark glass, digits on top, the other window's steel shutter over its digit
  solid(toon, 0.66, WIN_H, 0.02, "#0a0e13", 0.597, WIN_Y, -1.0, scene);
  solid(toon, 0.39, WIN_H, 0.02, "#0a0e13", OTHER_X, WIN_Y, -1.0, scene);
  dflt = digitPanel(0.66); dflt.mesh.position.set(0.597, WIN_Y, -0.98); scene.add(dflt.mesh);
  other = digitPanel(0.39); other.mesh.position.set(OTHER_X, WIN_Y, -0.98); other.set({ d: "1" }); scene.add(other.mesh);
  shut = hero(0.39, WIN_H, 300, (g, W, H) => { g.fillStyle = "#1c2229"; g.fillRect(0, 0, W, H); text(g, "-", W / 2, H / 2 + 44, 123, { c: "#3a424c", w: 700, a: "center" }); });
  shut.set({});
  shut.mesh.position.set(OTHER_X, WIN_Y, -0.97);
  scene.add(shut.mesh);
  ring = frame(1.3, 1.05, 0.016, scene, 0.85, 4.265, -0.96);
  otherRing = frame(0.45, 0.58, 0.016, scene, OTHER_X, WIN_Y, -0.96);
}

export function update(t) {
  dflt.set({ d: defaultDigits(t) });
  paint(dflt.mesh.material, DIGITS, t);
  paint(other.mesh.material, DIGITS, t);
  paint(plate.mesh.material, TITLE, t);
  const s = shutter(t);
  shut.mesh.visible = s > 0.001;
  revealTop(shut, WIN_Y + WIN_H / 2, WIN_H * s);
  ring.set(spanAlpha([[0, T.b03], [T.b10, T.b11], [T.b16, T.b17], [T.b32, T.endIn]], t));
  otherRing.set(spanAlpha([[T.otherOpen + 0.3, T.b17], [T.b33 + 0.3, T.endIn]], t));
}

// Previz shot for the Seedance test (#458): 5 s, the king alone on the terrace, the camera pushing in while he
// says one invented line. Same world and card code as the toon-cards test; only the camera and cast change.
export * from "./story.js";
import { E, lerp, lerp3, clamp, idle, blink } from "./story.js";
export const T0 = 62.0, FRAMES = 120;
const LINE = [0.7, 2.74]; // the ElevenLabs read (Callum, 2.04 s) starts at 0.7 s
const KING = { jacket: "#6d3fa8", pants: "#3a2c55", boots: "#2a1c38", hat: "crown", sash: "#f2c23c", buttons: "#f2c23c", moustache: "#5a3b2a", build: "stout", ermine: true, epaulettes: "#f2c23c", ribbon: "#c0303a", medals: true };
export const camAt = (t) => {
  const s = t - T0, k = E.smooth(s / 5);
  return { p: lerp3([0.6, 31.7, 190.6], [0.3, 31.52, 194.2], k), l: lerp3([0.2, 31.2, 197], [0.25, 31.42, 197], k), fov: lerp(36, 33, k), roll: 0 };
};
export const dofAt = (t) => { const c = camAt(t); return { focus: Math.hypot(c.p[0] - 0.2, c.p[1] - 31.3, c.p[2] - 197), c: 12 }; };
export const actorsAt = (t) => {
  const s = t - T0, q = idle(t, 3), talk = s > LINE[0] && s < LINE[1];
  const flap = ["o", "grin", "smile_closed", "whistle"][Math.floor(s * 8.5) % 4];
  const expr = s < LINE[0] ? "smile" : talk ? (flap === "o" ? "whistle" : flap) : "grin";
  return [{ id: "king", outfit: KING, x: 0.2, y: 30.12 + q.bob, z: 197, scale: 1, seed: 3,
    opts: { mode: "stand", seed: 3, blink: blink(t, 3), tilt: q.tilt + (talk ? Math.sin(s * 5) * 2 : 0), headTilt: q.head + (s > LINE[1] ? -4 : 0), expr, prop: "sack", look: s < LINE[0] ? -0.5 : 0, facing: 0 } }];
};
export const beastsAt = () => [];
export const fxAt = () => [];
export const flashAt = () => 0;

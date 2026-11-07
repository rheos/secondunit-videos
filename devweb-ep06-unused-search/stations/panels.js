// The two option panels, holds 24-25: two equal paper cards side by side in front of the machine's switch (the knob at
// z -1.16 is 0.26 behind them), a clear gap between them with a plain "or" in it. A soft dark backing behind both dims
// the machine (machine.js reads the same span) so its labels don't compete.
// Left: a small switch, drawn as the machine's: a short arc of scale with a stop at each end, a lever from a pivot
// below it, a zigzag spring from a small post to the lever and the default tag hung on that post. As the card comes
// face-on the lever swings from keywords (old) to meaning (new) and the spring and tag go with it to the other post
// (the tag's one move in the film). Right: a note for Blink, beside a small Blink face (mint body, dark visor, two
// eyes, its sprout; no harness).
// Sized for a phone: every word is about 30 px tall at 720x1280 (animatic 04's were about 13).
import * as THREE from "three";
import { alpha, basic, staticPanel, text } from "../parts.js";
import { rr } from "../kit/world.js";
import { T, cl, io, mix, r01 } from "../timeline.js";

// panels 1.66 wide, 0.56 apart: the "or" (0.4 wide) sits in the gap with 0.08 either side; centred on the camera's x
// for these holds, so each outer edge keeps about 35 px of frame at 1080 with the drift. 498 x 450 px each.
export const PANEL_W = 1.66, PANEL_H = 1.5, L_X = -1.11, R_X = 1.11, OR_X = 0, Y = 3.3, Z = -0.9;
const PPU = 300, INK = "#14171b", SOFT = "#6f6e69";
let left, right, or, backing, edges = [];

const paper = (g, W, H) => { g.fillStyle = "#efeeea"; rr(g, 1, 1, W - 2, H - 2, 6); g.fill(); };
const hexMix = (a, b, k) => {
  const p = (h, i) => parseInt(h.slice(1 + 2 * i, 3 + 2 * i), 16);
  return "#" + [0, 1, 2].map((i) => Math.round(mix(p(a, i), p(b, i), k)).toString(16).padStart(2, "0")).join("");
};

// the left panel's lever: 0 on keywords (old), 1 on meaning (new); one small overshoot, back by SWING + 0.25
const SWING = [T.h24 + 0.65, 0.5], OVER = 0.04;
function pointerP(t) {
  if (t < SWING[0] + SWING[1]) return io(r01(t, SWING[0], SWING[1])) * (1 + OVER);
  const v = r01(t, SWING[0] + SWING[1], 0.25);
  return 1 + OVER * (1 - v * v * (3 - 2 * v));
}
const BEAT_L = [T.h25 + 0.8, T.h25 + 2.0], BEAT_R = T.h25 + 1.12; // ~68.88 "plain", ~70.08 "use", ~69.2 "words"
// a blink in about 12 frames at 30 fps: close 4, shut 2, open 6
const blinkB = (u) => (u < 0 ? 0 : u < 0.133 ? u / 0.133 : u < 0.2 ? 1 : u < 0.4 ? 1 - (u - 0.2) / 0.2 : 0);
// the drawn switch: pivot, lever length, the stops' half-angle from vertical, the scale's radius, the posts
const PX = 249, PY = 232, LV = 125, HA = (55 * Math.PI) / 180, SR = 148, POST_DX = 86, POST_DY = 4;
const tipAt = (p) => { const a = mix(-HA, HA, p); return [PX + Math.sin(a) * LV, PY - Math.cos(a) * LV]; };

// a zigzag spring between two points, n zigs of amplitude amp, drawn in the current stroke
function zigzag(g, x0, y0, x1, y1, n = 9, amp = 7) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  g.beginPath(); g.moveTo(x0, y0);
  for (let k = 1; k < n; k++) { const u = k / n, s = k % 2 ? amp : -amp; g.lineTo(x0 + dx * u + nx * s, y0 + dy * u + ny * s); }
  g.lineTo(x1, y1); g.stroke();
}
// a post with its spring to the lever's tip, at alpha a: the side the lever is on holds the spring
function post(g, x, y, tip, a) {
  if (a <= 0.002) return;
  g.save(); g.globalAlpha = a; g.strokeStyle = INK; g.fillStyle = INK; g.lineCap = "round";
  g.lineWidth = 4; zigzag(g, x, y, tip[0], tip[1]);
  g.beginPath(); g.arc(x, y, 8, 0, Math.PI * 2); g.fill();
  g.lineWidth = 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 10); g.stroke();
  g.restore();
}

function drawSwitch(g, W, H, { p = 0, sw = 0 } = {}) {
  paper(g, W, H);
  g.strokeStyle = INK; g.fillStyle = INK; g.lineCap = "round";
  // the scale: a short arc over the pivot, a stop at each end, fine ticks between
  g.lineWidth = 5; g.beginPath(); g.arc(PX, PY, SR, -Math.PI / 2 - HA, -Math.PI / 2 + HA); g.stroke();
  for (let k = 0; k <= 8; k++) {
    const a = -HA + (2 * HA * k) / 8, end = k === 0 || k === 8, len = end ? 22 : 9;
    g.lineWidth = end ? 7 : 3;
    g.beginPath(); g.moveTo(PX + Math.sin(a) * (SR - len), PY - Math.cos(a) * (SR - len)); g.lineTo(PX + Math.sin(a) * (SR + (end ? 8 : 0)), PY - Math.cos(a) * (SR + (end ? 8 : 0))); g.stroke();
  }
  // the lever from the pivot to the stop it is on, a knob on its tip, a boss at the pivot
  const tip = tipAt(p);
  g.lineWidth = 11; g.beginPath(); g.moveTo(PX, PY); g.lineTo(tip[0], tip[1]); g.stroke();
  g.beginPath(); g.arc(tip[0], tip[1], 15, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(PX, PY, 12, 0, Math.PI * 2); g.fill();
  // the spring post on the side the lever is on: the left one lets go as the lever leaves, the right one takes it
  const k = cl(p), xl = PX - POST_DX, xr = PX + POST_DX, yp = PY + POST_DY;
  post(g, xl, yp, tip, 1 - k);
  post(g, xr, yp, tip, k);
  // the tag goes with the spring from post to post on a short string, swinging a little behind the move
  g.save(); g.translate(mix(xl, xr, p), yp + 10); g.rotate(sw);
  g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 14); g.stroke();
  g.fillStyle = "#ffffff"; g.fillRect(-84, 14, 168, 48); g.lineWidth = 3; g.strokeRect(-84, 14, 168, 48);
  // drawn straight (not text()): text()'s fit check reads x in canvas space, and this is in the tag's own space.
  // 168 px box, "default" is 7 x 21.6 = 151 px at 36 px
  g.font = "700 36px 'IBM Plex Mono', monospace"; g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "alphabetic";
  g.fillText("default", 0, 50);
  g.restore();
  // one setting per line, each on its own side, 44 px (8.8 %) clear of the card's edges at 48 px (403 and 374 px wide);
  // the one the lever is on reads darkest
  text(g, "keywords (old)", 44, 352, 48, { c: hexMix(INK, SOFT, k), w: 700 });
  text(g, "meaning (new)", W - 44, 418, 48, { c: hexMix(SOFT, INK, k), w: 700, a: "right" });
}

function drawNote(g, W, H, { b = 0 } = {}) {
  paper(g, W, H);
  // a small Blink: mint body, dark visor, two pill eyes, a small smile, its tilde sprout. No harness.
  const cx = W / 2;
  g.strokeStyle = "#6ad08a"; g.lineWidth = 9; g.lineCap = "round";
  g.beginPath(); g.moveTo(cx, 46); g.lineTo(cx, 26); g.bezierCurveTo(cx - 6, 10, cx - 22, 10, cx - 28, 22); g.moveTo(cx, 26); g.bezierCurveTo(cx + 6, 12, cx + 22, 14, cx + 30, 24); g.stroke();
  g.fillStyle = "#6ad08a"; rr(g, cx - 82, 44, 164, 136, 60); g.fill();
  g.fillStyle = "#0a1510"; rr(g, cx - 62, 72, 124, 72, 28); g.fill();
  const eh = Math.max(4, 40 * (1 - b)), ey = 84 + (40 - eh) / 2; // blinks shut toward the eye's middle
  g.fillStyle = "#c8ffd9"; rr(g, cx - 36, ey, 18, eh, Math.min(9, eh / 2)); g.fill(); rr(g, cx + 18, ey, 18, eh, Math.min(9, eh / 2)); g.fill();
  g.strokeStyle = "#c8ffd9"; g.lineWidth = 4; g.beginPath(); g.arc(cx, 126, 10, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
  // 54 px: the longest line (use the new, 356 px) keeps 71 px (14 %) either side
  text(g, "use the new", cx, 262, 54, { c: INK, w: 700, a: "center" });
  text(g, "search", cx, 332, 54, { c: INK, w: 700, a: "center" });
  text(g, "when ...", cx, 402, 54, { c: INK, w: 700, a: "center" });
}

// a card's thickness: a slightly smaller slab behind the paper, turning with it, so the edge shows while it turns
function cardEdge(p) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(PANEL_W - 0.02, PANEL_H - 0.02, 0.025), basic("#a9a8a2"));
  m.position.z = -0.016;
  p.mesh.add(m); edges.push(m);
  return m;
}

export function build(scene) {
  // the backing: soft-edged, so it dims the crate and the lamp's post without drawing a line across them
  const c = document.createElement("canvas"); c.width = 256; c.height = 128;
  const g = c.getContext("2d");
  for (let y = 0; y < 128; y++) for (let x = 0; x < 256; x += 2) {
    const ex = Math.min(x, 255 - x) / 40, ey = Math.min(y, 127 - y) / 30, e = cl(Math.min(ex, ey));
    g.fillStyle = `rgba(13,17,23,${(e * e * (3 - 2 * e)).toFixed(3)})`; g.fillRect(x, y, 2, 1);
  }
  backing = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 2.3), basic("#ffffff", { opacity: 0, map: new THREE.CanvasTexture(c) }));
  backing.position.set(OR_X, Y, Z - 0.1);
  scene.add(backing);
  left = staticPanel(PANEL_W, PANEL_H, PPU, drawSwitch, L_X, Y, Z, scene);
  left.set({ p: 0, sw: 0 });
  right = staticPanel(PANEL_W, PANEL_H, PPU, drawNote, R_X, Y, Z, scene);
  cardEdge(left); cardEdge(right);
  or = staticPanel(0.4, 0.3, PPU, (g2, W, H) => text(g2, "or", W / 2, H / 2 + 20, 60, { c: "#ffffff", w: 700, a: "center" }), OR_X, Y, Z + 0.05, scene);
  // everything starts transparent and turns or rises in (kit rule: no first-frame flash)
  [left.mesh, right.mesh, or.mesh].forEach((m) => (m.material.opacity = 0));
  edges.forEach((m) => { m.material.opacity = 0; m.visible = false; });
}

export function update(t) {
  const clear = 1 - r01(t, T.h26, 0.3);
  const lk = io(r01(t, T.h24 + 0.1, 0.5)), rk = io(r01(t, T.h25 + 0.05, 0.5));
  alpha(backing, 0.85 * r01(t, T.h24, 0.3) * clear);

  // the lever and its tag: redrawn only when they change (state quantised, so a held lever doesn't redraw)
  const p = pointerP(t), vel = (p - pointerP(t - 1 / 60)) * 60;
  // two small beats in the long hold, one per card in turn: the tag swings once more on "plain" and again on "use it"
  // (a decaying swing, one rebound), the little Blink blinks on "words"
  const nudge = (t0) => { const u = t - t0; return u < 0 || u > 0.6 ? 0 : 0.14 * Math.sin((u / 0.3) * Math.PI) * (1 - u / 0.6); };
  const sw = THREE.MathUtils.clamp(-vel * 0.12, -0.25, 0.25) + nudge(BEAT_L[0]) + 0.7 * nudge(BEAT_L[1]);
  left.set({ p: Math.round(p * 400) / 400, sw: Math.round(sw * 100) / 100 });
  right.set({ b: Math.round(blinkB(t - BEAT_R) * 20) / 20 });

  // each card turns face-on, then floats: a slow bob and a breath of yaw, out of step with each other
  const la = Math.min(1, lk * 3) * clear, ra = Math.min(1, rk * 3) * clear;
  left.mesh.position.y = Y + 0.012 * Math.sin(t * 1.1);
  left.mesh.rotation.y = -1.45 * (1 - lk) + 0.025 * Math.sin(t * 0.8) * lk;
  right.mesh.position.y = Y + 0.012 * Math.sin(t * 1.1 + 2.1);
  right.mesh.rotation.y = 1.45 * (1 - rk) + 0.025 * Math.sin(t * 0.8 + 1.7) * rk;
  alpha(left.mesh, la); alpha(right.mesh, ra);
  [la, ra].forEach((a, i) => { const m = edges[i].material; edges[i].visible = a > 0.002; m.opacity = a; m.depthWrite = a > 0.98; });

  // "or" rises a little into the gap as the right card lands
  const ok = r01(t, T.h25 + 0.3, 0.25);
  alpha(or.mesh, ok * clear);
  or.mesh.position.y = Y - 0.06 * (1 - io(ok));
}

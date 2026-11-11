// Side-view creature sprites, drawn on the card Pen in a 600 x 800 design space with feet at y = 780.
// Legs are 2-bone IK. Every pose is a cache key, so a herd shares a handful of textures.
import { INK, shade } from "./toon.js";

const TWO = Math.PI * 2;
const ell = (cx, cy, rx, ry, n = 40, rot = 0) => {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TWO, x = rx * Math.cos(a), y = ry * Math.sin(a);
    out.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
  }
  return out;
};
/** knee of a two-bone leg from hip h to foot f; bend +1 or -1 picks the side */
const knee = (h, f, a, b, bend) => {
  const dx = f[0] - h[0], dy = f[1] - h[1], d = Math.min(a + b - 1, Math.hypot(dx, dy));
  const base = Math.atan2(dy, dx), c = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
  return [h[0] + Math.cos(base + bend * c) * a, h[1] + Math.sin(base + bend * c) * a];
};
const googly = (p, x, y, r, look, lid, skin, side) => {
  p.ell(x, y, r, r, "#ffffff", 5);
  if (lid < 0.8) p.dot(x + look * (r - 9), y + 1 + (side ? 2 : 0), r * 0.36);
  if (lid > 0.02) {
    const top = y - r, yb = top + 2 * r * lid;
    p.poly([[x - r - 1, top - 2], [x + r + 1, top - 2], [x + r + 1, yb], [x - r - 1, yb]], skin, 0);
    p.stroke([[x - r, yb], [x + r, yb]], 5);
  }
};

const COWS = [["#f4efe4", "#3a3030"], ["#b5764a", "#7d4a2c"], ["#efe6d2", "#a4623a"], ["#3f3836", "#f0eadf"]];
export const drawCow = (p, { phase = 0, run = 0, graze = 0, blink = 0, look = 0.3, skin = 0, cough = 0 } = {}) => {
  const [hide, patch] = COWS[skin % COWS.length], hoof = "#2a2224", two = TWO;
  const bob = run * 14 * Math.abs(Math.sin(two * phase));
  const bc = [270, 455 - bob];
  const leg = (hx, ph, far) => {
    const sx = Math.cos(two * ph), sy = Math.max(0, Math.sin(two * ph));
    const h = [hx, bc[1] + 62], f = [hx + run * 74 * sx, 770 - run * 62 * sy];
    const k = knee(h, f, 118, 126, hx > bc[0] ? -1 : 1);
    const col = far ? shade(hide, 0.74) : hide;
    p.line([h, k, f], col, 34);
    p.poly([[f[0] - 22, f[1] - 8], [f[0] + 24, f[1] - 8], [f[0] + 26, f[1] + 10], [f[0] - 24, f[1] + 10]], hoof, 6);
  };
  leg(170, phase + 0.5, true); leg(372, phase, true);
  p.line([[108, bc[1] - 50], [64, bc[1] + 8], [58, bc[1] + 76]], hide, 11);
  p.ell(56, bc[1] + 96, 18, 28, patch, 6);
  const body = ell(bc[0], bc[1], 178, 112);
  p.poly(body, hide, 0);
  p.clip(body, () => {
    p.ell(bc[0] - 72, bc[1] - 42, 74, 56, patch, 0, 0, 360, 14);
    p.ell(bc[0] + 92, bc[1] + 46, 58, 48, patch, 0, 0, 360, -20);
  });
  p.inkRing(body, 11, 1.1);
  leg(214, phase, false); leg(330, phase + 0.5, false);
  const hd = [486 + graze * 12, bc[1] - 88 + graze * 272 + cough * 12], tilt = graze * 0.7 + cough * -0.2;
  p.line([[bc[0] + 142, bc[1] - 44], [hd[0] - 30, hd[1] + 18]], hide, 72);
  const H = (dx, dy) => [hd[0] + dx * Math.cos(tilt) - dy * Math.sin(tilt), hd[1] + dx * Math.sin(tilt) + dy * Math.cos(tilt)];
  const [ex, ey] = H(-48, -48);
  p.ell(ex, ey, 30, 16, hide, 7, 0, 360, -24);
  for (const dx of [-16, 24]) { const a = H(dx, -56), b = H(dx - 8, -96); p.line([a, b], "#e8dcc0", 11); }
  const hp = ell(hd[0], hd[1], 66, 72, 40, tilt);
  p.poly(hp, hide, 0); p.inkRing(hp, 10, 1.1);
  const [sx, sy] = H(26, 44);
  p.ell(sx, sy, 56, 38, "#efb1a8", 8, 0, 360, (tilt * 180) / Math.PI);
  for (const dx of [8, 42]) { const n = H(dx, 40); p.dot(n[0], n[1], 7); }
  if (cough) { const m = H(26, 62); p.ell(m[0], m[1], 15, 12, "#5a1e28", 5); }
  const e = H(2, -16);
  googly(p, e[0], e[1], 25, look, blink, hide, false);
};

export const drawChicken = (p, { peck = 0, phase = 0, run = 0, blink = 0, look = 0.3, skin = 0 } = {}) => {
  const col = ["#f6efe0", "#d9894a", "#f3d27a"][skin % 3], two = TWO, bc = [270, 520];
  for (const [hx, ph] of [[240, 0.5], [300, 0]]) {
    const up = run * 54 * Math.max(0, Math.sin(two * (phase + ph)));
    const f = [hx + run * 56 * Math.cos(two * (phase + ph)), 770 - up], h = [hx, 620], k = knee(h, f, 90, 94, 1);
    p.stroke([h, k, f], 13, "#d38a2a");
    p.stroke([[f[0] - 20, f[1] + 4], [f[0] + 30, f[1] + 4]], 13, "#d38a2a");
  }
  p.poly([[110, 470], [40, 402], [86, 456], [28, 462], [96, 502]], shade(col, 0.86), 9);
  const body = ell(bc[0], bc[1], 148, 122);
  p.poly(body, col, 0); p.inkRing(body, 10, 1.1);
  p.arc(240, 530, 72, 52, 15, 165, 8, shade(col, 0.7));
  const hd = [396 + peck * 66, 360 + peck * 340], s = 1;
  p.line([[bc[0] + 92, bc[1] - 60], [hd[0] - 10, hd[1] + 30]], col, 62);
  for (const dx of [-30, 0, 30]) p.ell(hd[0] + dx, hd[1] - 74, 19, 28, "#d8352f", 6);
  p.ell(hd[0], hd[1], 66 * s, 70 * s, col, 10);
  p.poly([[hd[0] + 56, hd[1] - 16], [hd[0] + 118, hd[1] + 10], [hd[0] + 56, hd[1] + 30]], "#efa52c", 8);
  p.ell(hd[0] + 42, hd[1] + 52, 15, 24, "#d8352f", 6);
  googly(p, hd[0] + 8, hd[1] - 12, 25, look, blink, col, false);
};

export const drawMouse = (p, { look = 0.6, lid = 0, tight = 0, t = 0 } = {}) => {
  const fur = "#a9a2ad", bc = [260, 610];
  p.stroke([[120, 680], [40, 700], [18, 640], [58, 610]], 12, "#e5a4a4");
  for (const dx of [-50, 54]) { p.ell(bc[0] + dx, 758, 44, 20, "#e5a4a4", 7); }
  const body = ell(bc[0], bc[1], 146, 150);
  p.poly(body, fur, 0); p.inkRing(body, 10, 1.1);
  const hd = [392, 450];
  p.ell(hd[0] - 86, hd[1] - 96, 76, 82, fur, 10);
  p.ell(hd[0] - 86, hd[1] - 96, 46, 52, "#efb4b4", 0);
  const head = ell(hd[0], hd[1], 124, 112);
  p.poly(head, fur, 0); p.inkRing(head, 10, 1.1);
  p.ell(hd[0] + 118, hd[1] + 18, 20, 18, "#e8747e", 6);
  for (const a of [-14, 6, 26]) p.stroke([[hd[0] + 84, hd[1] + 34], [hd[0] + 176, hd[1] + 34 + a]], 4);
  googly(p, hd[0] + 26, hd[1] - 26, 36, look, lid, fur, true);
  p.stroke([[hd[0] + 26 - 34, hd[1] - 74 + tight * 10], [hd[0] + 26 + 34, hd[1] - 84 + tight * 22]], 8);
  // a mouth pressed shut, tighter on the beat
  p.stroke([[hd[0] + 44, hd[1] + 58 + tight * 4], [hd[0] + 96 - tight * 14, hd[1] + 50]], 7 + tight * 3);
  p.ell(bc[0] + 96, 640, 32, 26, fur, 7);
};

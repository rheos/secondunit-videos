// Draft 19 (2026-10-21): Bob's notes on draft 18 (round 64). The span changes, COLLEGE & SPADINA (act-a.js) and the
// straitjacket (props.js travStrait, act-c.js) live in their own files; this file holds:
// 1. "I love the idea of the lines emanating from her portrait, maybe there can be more lines simultaneously as she
//    gets crazier in her singing": her portrait sends out one more line at a time as the song goes on (herMore), and
//    behind the burnt paper her lines reach out of the hole onto his paper.
// 2. Robin: "she can be in each level" of the nested phone (mvu_droste, locked otherwise): her portrait on the wall of
//    every drawn level and a small pixel portrait beside the agent on every pixel level. Nothing else in the shot moves.
// Loaded after draft18.js and before ohara-echo.js.
'use strict';

// how many extra lines she sends out: none at first, three by the last part of the song
function craze(T) { return T < 140 ? 0 : T < 230 ? 1 : T < 300 ? 2 : 3; }
// copies of a thread path fanned round its first point (her mouth), shorter as they fan out, each starting a beat later
function herFan(P, k) { const [mx, my] = P[0], an = (k % 2 ? 1 : -1) * .3 * Math.ceil(k / 2), sc = 1 - .1 * k, c = Math.cos(an), s = Math.sin(an);
  return P.map(([x, y], i) => i ? [mx + ((x - mx) * c - (y - my) * s) * sc, my + ((x - mx) * s + (y - my) * c) * sc] : [mx, my]); }
function herMore(T, ta, tb, P, sch) { for (let k = 1; k <= craze(T); k++) herThread(T, ta + .18 * k, tb, herFan(P, k), sch); }

// behind the paper: her lines come out of the hole and onto his paper, toward the middle of the frame
const d19After = leakAfter;
leakAfter = function (T, edges) {
  d19After(T, edges);
  const al = behindAlpha(T); if (al <= 0) return; const c = behindHole(T); if (!c) return;
  const span = MARY_BEHIND.find(([a, b]) => T >= a && T <= b + .45), R = cl(c.Rref / 92, .55, 1.7);
  const mx = c.h.x, my = c.h.y + 6 * R + (1 - al) * 30 + 22 * R, dx = 960 - mx, dy = 540 - my, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
  const P = [0, 130, 260, 390, 520].map((d, i) => [mx + ux * d - uy * [0, 40, -30, 36, -12][i], my + uy * d + ux * [0, 40, -30, 36, -12][i]]);
  herThread(T, span[0], span[1], P, false); herMore(T, span[0], span[1], P, false);
};

// ---------- Mary in each level of the nested phone ----------
const D19_DR = [374.95, 386.7]; // Robin's mark over the shot (it runs on into e_sTyping)
let D19_IN_DROSTE = false;
const d19Droste = SU.mvu_droste;
SU.mvu_droste = { mode: d19Droste.mode, f(q, p, a, T) { D19_IN_DROSTE = true; try { d19Droste.f.call(d19Droste, q, p, a, T); } finally { D19_IN_DROSTE = false; } } };
// the drawn levels: her portrait on the wall, top right, clear of his head and the phone; it scales with the level
const d19DrLayer = e_drLayer;
e_drLayer = function (type, T) {
  d19DrLayer(type, T);
  if (!D19_IN_DROSTE || type !== 0) return; const al = maryAlpha(T, D19_DR[0], D19_DR[1]); if (al <= 0) return;
  const at = [1700, 230, .7], P = herAuto(at); P[0] = maryCameo(at[0], at[1] + (1 - al) * 20, at[2], T, al, false);
  herThread(T, D19_DR[0], D19_DR[1], P, false); herMore(T, D19_DR[0], D19_DR[1], P, false);
};
// the pixel levels: a small framed portrait between the left window and the agent's screen, singing, her lines in the
// screen's magenta
function pxMary(g, x, y, T) {
  const mo = Math.abs(Math.sin(T * 4.2)) > .5 ? 1.6 : 1;
  pL(g, [[x + 8, y], [x + 14, y - 6], [x + 20, y]], PX.k);
  pR(g, x, y, 28, 36, PX.y); pR(g, x + 3, y + 3, 22, 30, PX.p, false);
  pP(g, [[x + 5, y + 33], [x + 8, y + 25], [x + 20, y + 25], [x + 23, y + 33]], PX.m);
  pC(g, x + 14, y + 15, 8, PX.u); pR(g, x + 6, y + 15, 16, 12, PX.u, false);
  pC(g, x + 14, y + 16, 5.5, PX.f);
  pL(g, [[x + 11, y + 15], [x + 13, y + 15]], PX.k); pL(g, [[x + 15, y + 15], [x + 17, y + 15]], PX.k);
  pC(g, x + 14, y + 19.5, mo, PX.r);
  for (let k = 0; k <= craze(T); k++) { const dy = (k - craze(T) / 2) * 5, ph = Math.floor(T * 12) % 3;
    pL(g, [[x + 17, y + 20], [x + 26, y + 18 + dy + ph], [x + 33, y + 21 + dy * 1.6 - ph], [x + 38, y + 18 + dy * 2.2]], PX.m); }
}
const d19PxLayer = pxDrLayer;
pxDrLayer = function (g, w, h, T) {
  d19PxLayer(g, w, h, T);
  if (T >= D19_DR[0] - .3 && T <= D19_DR[1]) pxMary(g, 64, 48, T);
};

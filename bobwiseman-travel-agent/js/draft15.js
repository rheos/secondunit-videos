// Draft 15 (2026-10-16): Mary Margaret O'Hara gets her own thread.
// Where she sings comes from Robin's hold-space listening pass (work/ohara-marks-robin.json), minus the spans where the
// 6-stem 'other' stem holds the theremin-like tone that fooled the ear (work/ohara-map.json). She sings mostly under
// Bob, in the choruses. Bob asked for her moments to be touched "here or there", so five moments get the thread:
// 1:15 her first entry, chorus 1 (the phone line), chorus 2 (on hold), the heart and mirror, the cage into the last
// chorus. The thread is a fine pale-rose line of light with beads on it, drawn on while she sings: smooth and fine
// where Cass's ribbon is inked and jagged. On blueprints it is drawn in the same rose. Loaded after draft14.js.
'use strict';

// Catmull-Rom through the control points, resampled to ~n points
function herCurve(P, n = 160) {
  const o = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)], m = Math.ceil(n / (P.length - 1));
    for (let k = 0; k < m; k++) { const t = k / m, t2 = t * t, t3 = t2 * t;
      o.push([0, 1].map((j) => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); }
  }
  o.push(P[P.length - 1]); return o;
}
// draws her thread along P: drawn on from ta to tb, then it lingers and fades over 0.6 s
function herThread(T, ta, tb, P, sch) {
  if (T < ta) return; const fade = 1 - cl((T - tb - .25) / .6); if (fade <= 0) return;
  const C0 = herCurve(P), L = [0]; for (let i = 1; i < C0.length; i++) L.push(L[i - 1] + Math.hypot(C0[i][0] - C0[i - 1][0], C0[i][1] - C0[i - 1][1]));
  const tot = L[L.length - 1], u = eio(cl((T - ta) / (tb - ta))) * tot;
  // a living line: a slow wave along it, so it is never a ruled stroke
  const pts = []; for (let i = 0; i < C0.length && L[i] <= u; i++) { const a = C0[Math.min(i + 1, C0.length - 1)], b = C0[Math.max(i - 1, 0)], dx = a[0] - b[0], dy = a[1] - b[1], d = Math.hypot(dx, dy) || 1, w = Math.sin(L[i] * .018 - T * 2.6) * 5; pts.push([C0[i][0] - dy / d * w, C0[i][1] + dx / d * w]); }
  if (pts.length < 2) return;
  X.save();
  path(pts, sch ? '#c98478' : '#e39c90', sch ? 10 : 12, (sch ? .35 : .45) * fade);  // the soft halo
  path(pts, sch ? '#f2b8b0' : '#c4675a', sch ? 2.6 : 4.2, fade);                // the thread
  path(pts, '#fbeee9', sch ? 1 : 1.3, .9 * fade);                               // its light
  // beads of light along it, twinkling on twos
  let next = 30; for (let i = 0; i < pts.length; i++) if (L[i] >= next) { next += 44; const r = 3.2 + ((i * 7 + (FD >> 1)) % 3) * .9; fillP(PE(pts[i][0], pts[i][1], r, r), '#fbeee9', fade); iE(pts[i][0], pts[i][1], r + 1.6, r + 1.6, 0, sch ? '#f2b8b0' : '#c98478', 1.2, .9 * fade, false, .3); }
  // the head: a small four-point glint
  const [hx, hy] = pts[pts.length - 1], g = (sch ? 11 : 14) + (FD % 2) * 3;
  if (T < tb + .1) { X.beginPath(); X.moveTo(hx - g, hy); X.lineTo(hx + g, hy); X.moveTo(hx, hy - g); X.lineTo(hx, hy + g); stroke('#fbeee9', 2.2, fade); X.beginPath(); X.moveTo(hx - g * .55, hy - g * .55); X.lineTo(hx + g * .55, hy + g * .55); X.moveTo(hx + g * .55, hy - g * .55); X.lineTo(hx - g * .55, hy + g * .55); stroke(sch ? '#f2b8b0' : '#c98478', 1.3, fade); fillP(PE(hx, hy, 4, 4), '#fff8f4', fade); }
  X.restore();
}
// spirals and rings as control points
const herArc = (cx, cy, rx, ry, a0, a1, n = 10, shrink = 0) => [...Array(n + 1).keys()].map((i) => { const t = i / n, a = lerp(a0, a1, t), k = 1 - shrink * t; return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]; });

// [set-up, from, to, control points in screen space] (times inside her spans, clipped to the shot)
const HER_THREAD = [
  // 1:15, her first entry: she drifts in over the village steeple
  ['a_noCarVillage', 75.2, 78.0, [[1960, 130], [1700, 200], [1560, 280], [1440, 210], [1490, 140], [1580, 210], [1360, 320], [1100, 270], [860, 340]]],
  // chorus 1: down the telephone line to the phone; along the drawn wire to his ear; along the wire to her pole-top desk
  ['a_payphone', 91.2, 93.6, [[1930, 545], [1700, 500], [1460, 450], [1200, 400], [1020, 360], [905, 330]]],
  ['a_sWire', 93.7, 95.4, [[1890, 575], [1660, 480], [1440, 420], [1200, 380], [900, 330], [640, 470], [585, 520]]],
  ['a_poleDesk', 95.5, 99.6, [[1940, 770], [1600, 790], [1300, 770], [1080, 740], [1000, 640], [985, 560], [930, 470]]],
  // chorus 2, on hold: she loops the wheel, runs over the queue, spirals in to the phone at the centre of the waiting room
  ['c_corridorLoop', 220.6, 223.3, [[260, 120], [620, 160], [960, 300], ...herArc(1200, 540, 250, 250, Math.PI * 1.05, Math.PI * 3.0, 12)]],
  ['c_sQueue', 223.4, 225.4, [[130, 330], [450, 380], [800, 330], [1150, 390], [1500, 340], [1740, 515]]],
  ['c_holdSpiral', 225.5, 226.9, herArc(1020, 560, 560, 520, -Math.PI * .7, Math.PI * 2.6, 16, .86)],
  // the heart and the mirror (where the echo is): she rises from the heart past him; then crosses into the mirror and rings it
  ['d_heartGiant', 286.4, 290.3, [[1720, 1060], [1500, 860], [1180, 760], [960, 640], [840, 470], [980, 300], [800, 120], [620, -20]]],
  ['d_mirror', 290.4, 293.3, [[560, 460], [800, 400], [960, 300], ...herArc(1215, 540, 360, 500, Math.PI * 1.08, Math.PI * 3.0, 12)]],
  // the cage into the last chorus: she winds in to the falling feather and his hand, along the feather's line,
  // from his mouth to the phone, round the phone that is a cage
  ['d_featherFall', 359.1, 363.2, [[1940, 830], [1720, 720], [1560, 640], [1440, 520], [1320, 440], [1240, 380], [1195, 340]]], // under the burn holes
  ['d_sFeather', 363.3, 365.4, [[380, 990], [700, 820], [1000, 640], [1300, 450], [1480, 300], [1560, 170]]],
  ['e_appInside', 366.2, 368.2, [[290, 660], [420, 560], [560, 580], [640, 470], [690, 380]]],
  ['e_sPhoneCage', 368.3, 371.8, [[240, 700], [480, 560], [700, 420], ...herArc(960, 510, 290, 470, Math.PI * 1.1, Math.PI * 2.9, 10)]],
];
for (const [key, ta, tb, P] of HER_THREAD) { const sch = SU[key].mode === 'sch'; d14post(key, (q, p, a, T) => herThread(T, ta, tb, P, sch)); }

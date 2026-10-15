// Signed off by Robin 2026-10-15 ("The O'Hara echo works"), in the film from draft 12: Mary Margaret O'Hara's wordless
// stretches get one recurring
// image. While she sings, a pale second him comes loose from the traveller and drifts away, then settles back: her voice
// as the echo of his inner strife (Bob's words). Loaded by looks/film.html (and film-echo.html). It shows only where the
// traveller is drawn: schematics, the plane loop and the locked nested-phone shot are untouched.
'use strict';
const OHARA = [[89.7, 90.5], [219.4, 220.05], [286.6, 289.8], [292.0, 293.45], [305.55, 306.4], [329.4, 330.45],
  [360.4, 362.35], [363.85, 365.2], [375.4, 378.3]];
let ECHO_CALLS = [];
const echoTraveller = traveller;
// record every traveller drawn this frame with its transform; the echo picks the main one (default teal coat, largest)
traveller = function (x, y, s, o = {}) { ECHO_CALLS.push({ x, y, s, o, m: X.getTransform() }); return echoTraveller(x, y, s, o); };
let echoCanvas;
function ohEnvelope(T) {
  for (const [a, b] of OHARA) { if (T < a - .1 || T > b + .45) continue;
    return Math.min(cl((T - a + .1) / .3), 1 - cl((T - b) / .45)); }
  return 0;
}
function drawEcho(T) {
  const e = ohEnvelope(T); if (e <= 0) return;
  const cand = ECHO_CALLS.filter((c) => !c.o.coat && !c.o.sch);
  if (!cand.length) return;
  const c = cand.reduce((a, b) => (b.s * Math.hypot(b.m.a, b.m.b) > a.s * Math.hypot(a.m.a, a.m.b) ? b : a));
  if (!echoCanvas) { echoCanvas = document.createElement('canvas'); echoCanvas.width = W; echoCanvas.height = H; }
  const prev = { X, R };
  try {
    X = echoCanvas.getContext('2d'); X.setTransform(1, 0, 0, 1, 0, 0); X.clearRect(0, 0, W, H);
    X.setTransform(c.m); R = M32(4242 + FD); echoTraveller(c.x, c.y, c.s, Object.assign({}, c.o, { case: false, phone: undefined }));
    X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = 'source-in'; X.fillStyle = '#e9eef3'; X.fillRect(0, 0, W, H);
    X.globalCompositeOperation = 'source-over';
  } finally { X = prev.X; R = prev.R; }
  const sc = c.s * Math.hypot(c.m.a, c.m.b), ph = Math.floor(T * 12) / 12; // on twos
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
  for (const [k, al] of [[1, .55], [2.1, .28]]) {
    const dx = (70 + 26 * Math.sin(ph * 2.3)) * sc * e * k, dy = (-34 + 12 * Math.cos(ph * 1.7)) * sc * e * k;
    X.globalAlpha = al * e; X.filter = 'none';
    X.drawImage(echoCanvas, dx - 1.5, dy + 1.5); // a faint ink shadow edge
    X.globalAlpha = al * e * .9; X.drawImage(echoCanvas, dx, dy);
  }
  X.restore();
}
const echoBuild = buildShots;
buildShots = function () {
  return echoBuild().map((sh) => Object.assign({}, sh, { draw: (p, lt) => { ECHO_CALLS = []; sh.draw(p, lt); drawEcho(sh.t0 + lt); } }));
};

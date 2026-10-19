let SHOTS = [];
function buildShots() { SHOTS = ACTS.slice().sort((a, b) => a.t0 - b.t0); }
// Real Thing: collect every act's shots, draw the frame, lay the paper grain and vignette over it.
'use strict';
function drawFrame(g, t) {
  const f = Math.floor(t * 24 + 1e-6); t = f / 24; // the song grid
  const sh = SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[t < SHOTS[0].t0 ? 0 : SHOTS.length - 1];
  if (!sh) return;
  g.save(); sh.draw(g, t, Math.max(0, t - sh.t0)); g.restore();
  g.drawImage(GRAIN, 0, 0);
  // a soft vignette
  const vg = g.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.05); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(40,25,15,.28)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}

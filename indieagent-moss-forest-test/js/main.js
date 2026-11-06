// Frame assembly, the live player and the offline hooks (check.mjs, motion-lab render/audit call window.__frameJPEG).
const canvas = document.getElementById('c');
canvas.width = 1280; canvas.height = 720;   // x4 of the 320 x 180 buffer
s = canvas.getContext('2d');
const PROBE = (typeof ML !== 'undefined' && ML.probe) || { on: false, text() {}, box() {}, event() {}, edge() {}, value() {} };
palInit(); bakeForest(); bakePiano(); planClods(); planPuffs();

// hanging moss on the near plane's branch: strands that sway, pinned to the plane
function nearStrands(t, L) {
  const [ox, oy] = planeOff(PLANES.near, t), my = PLANES.near.my;
  for (let i = 0; i < 26; i++) {
    const ax = i < 18 ? 22 + i * 7 + h2(i, 1, 95) * 4 : 392 + (i - 18) * 10, ay = my + 14 + Math.round(4 * Math.sin(ax * .04) + ax * .04) * (i < 18 ? 1 : 0) + (i < 18 ? 0 : 2);
    const len = 12 + Math.round(h2(i, 2, 95) * 30), ph = h2(i, 3, 95) * TAU;
    for (let k = 0; k < len; k++) {
      const f = Math.pow(k / len, 1.4), x = Math.round(ax + ox + (1.6 * Math.sin(t * .55 + ph) + .8 * Math.sin(t * 1.3 + ph * 2)) * f), y = ay + oy + k;
      if (x < 0 || x >= PW || y < 0 || y >= PH) continue;
      // a beard of moss: two pixels wide near the top, thinning, with tufts along it
      const wd = k < len * .45 ? 2 : 1, c = h2(i, k, 98) < .25 ? RAMP.moss[1] : (k % 3 ? RAMP.near[4] : RAMP.moss[0]);
      for (let q = 0; q < wd; q++) pset(x + q, y, c);
      if (h2(i, k >> 1, 96) < .3) { pset(x - 1, y, RAMP.near[3]); pset(x + wd, y + 1, RAMP.near[3]); }
      if (k > len * .5 && shaftK(t, L, x + 2, y) > .15 && h2(i, k, 97) < .4) pset(x + 1, y, litC(RAMP.rim[0], x + 1, y, L));
    }
  }
}

// the light arc's palette fade: every pixel keeps its palette index; the palette itself is graded per frame,
// muted and dim while the sun is low, full warm colour at the peak (a hardware-style palette fade)
const PALBASE = PAL.map(rgbOf);
function gradePal(L) {
  const dim = lerp(.6, 1, L), sat = lerp(.72, 1, L);
  PALBASE.forEach(([r, g, b], i) => {
    const l = .3 * r + .59 * g + .11 * b, R = lerp(l, r, sat) * dim, G = lerp(l, g, sat) * dim * lerp(.97, 1, L), B = lerp(l, b, sat) * dim * lerp(.92, 1, L);
    PALRGB[i] = (255 << 24) | (Math.round(clamp(B, 0, 255)) << 16) | (Math.round(clamp(G, 0, 255)) << 8) | Math.round(clamp(R, 0, 255));
  });
}
function drawFrame(t) {
  const L = lightK(t);
  target(FB);
  drawSky(t, L);
  blitPlane(PLANES.far, t, L); haze(t, L, 60, 120, .55, .12, 1);
  blitPlane(PLANES.fmid, t, L); haze(t, L, 86, 132, .5, .25, 2);
  blitPlane(PLANES.mid, t, L); haze(t, L, 104, 142, .32, .42, 3);
  blitPlane(PLANES.clear, t, L);
  haze(t, L, 96, 150, .2, .6, 4);   // air between the far forest and the clearing, not over the giant
  drawGiant(t, L);
  blitPlane(PLANES.clearFront, t, L);
  { const [ox, oy] = planeOff(PLANES.clear, t); dust(t, ox, oy, L); }
  shafts(t, L);
  spores(t, L); leaves(t, L);
  blitPlane(PLANES.near, t, L); nearStrands(t, L);
  blitPlane(PLANES.fg, t, L);
  gradePal(L);
  pxOut();
}
window.drawFrame = drawFrame;
// q >= 1 returns a lossless PNG: pixel art rings under JPEG
window.__frameJPEG = (t, q = .92) => { drawFrame(clamp(t, 0, DUR - 1e-6)); return q >= 1 ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', q); };
window.__ready = Promise.resolve(true);
const params = new URLSearchParams(location.search);
if (!params.has('offline')) {
  const t0 = parseFloat(params.get('t') || 0), start = performance.now();
  (function loop() { drawFrame((t0 + (performance.now() - start) / 1000) % DUR); requestAnimationFrame(loop); })();
}
